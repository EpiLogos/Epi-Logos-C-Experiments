use std::path::PathBuf;

use serde_json::{json, Value};

use crate::gate::events::GatewayEvent;
use crate::gate::parity::DEFAULT_GATEWAY_PORT;
use crate::gate::runtime::{GatewayRuntimeState, GatewaySubscriptionRecord};
use crate::gate::sessions::SessionStore;
use crate::gate::spacetimedb_bridge::SpacetimeRegistration;

use super::now_ms;

pub(super) async fn dispatch_temporal_subscribe(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<Value, String> {
    let session_key = params
        .get("sessionKey")
        .and_then(|value| value.as_str())
        .unwrap_or("agent:main:main")
        .to_owned();
    let agent_id = params
        .get("agentId")
        .and_then(|value| value.as_str())
        .unwrap_or("operator")
        .to_owned();
    let scope = params
        .get("scope")
        .and_then(|value| value.as_str())
        .unwrap_or("session")
        .to_owned();
    let query_id = params
        .get("queryId")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let connection_id = params
        .get("connectionId")
        .and_then(|value| value.as_u64())
        .unwrap_or(0);

    // Ensure the session exists so the subscribe RPC itself implies session
    // presence (matches other auth-bound RPCs like agent/chat.send). Then
    // build the temporal context for the `applied` envelope.
    store
        .ensure(&session_key)
        .map_err(|err| format!("session ensure failed: {err}"))?;
    let context = crate::gate::temporal::context_value(state_root, store, &session_key, &agent_id)?;
    let day_id = context
        .pointer("/dayId")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown-day")
        .to_owned();
    let vault_now_path = context
        .pointer("/vaultNowPath")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let graphiti_namespace_ref = context
        .pointer("/graphiti/namespaceRef")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let graphiti_arc_id = context
        .pointer("/graphiti/sessionArcId")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let privacy_class = match scope.as_str() {
        "shared" | "shared-archetype" => "shared-archetype",
        _ => "session-local",
    }
    .to_owned();

    let subscription_id = uuid::Uuid::new_v4().to_string();
    let opened_at_ms = now_ms() as u64;
    let record = GatewaySubscriptionRecord {
        subscription_id: subscription_id.clone(),
        method: epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_METHOD.to_owned(),
        connection_id,
        session_key: session_key.clone(),
        agent_id: agent_id.clone(),
        scope: scope.clone(),
        query_id: query_id.clone(),
        privacy_class: privacy_class.clone(),
        source: "websocket-multiplex".to_owned(),
        day_id: day_id.clone(),
        vault_now_path: vault_now_path.clone(),
        graphiti_namespace_ref: graphiti_namespace_ref.clone(),
        graphiti_arc_id: graphiti_arc_id.clone(),
        projection_source: Some("gateway-temporal-context".to_owned()),
        opened_at_ms,
    };
    runtime.register_subscription(record);

    // Probe Graphiti runtime status so the lifecycle envelope carries
    // it (03.T6 deliverable: surface graphiti runtime status through
    // subscription metadata, not just readiness).
    let graphiti_status = graphiti_runtime_status_label().await;

    // Emit `requested` then `applied` lifecycle events via the shared broadcast
    // so the per-connection event task forwards them onto the client socket.
    let metadata = subscription_metadata_payload(
        &subscription_id,
        epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_METHOD,
        &session_key,
        &agent_id,
        &scope,
        query_id.as_deref(),
        &privacy_class,
        "websocket-multiplex",
        &day_id,
        vault_now_path.as_deref(),
        graphiti_namespace_ref.as_deref(),
        graphiti_arc_id.as_deref(),
        Some("gateway-temporal-context"),
        graphiti_status,
    );
    broadcast_subscription_lifecycle(
        runtime,
        "requested",
        &session_key,
        &subscription_id,
        metadata.clone(),
    );
    let mut applied_payload = metadata.clone();
    if let Value::Object(map) = &mut applied_payload {
        map.insert("context".to_owned(), context.clone());
    }
    broadcast_subscription_lifecycle(
        runtime,
        "applied",
        &session_key,
        &subscription_id,
        applied_payload,
    );

    Ok(json!({
        "subscriptionId": subscription_id,
        "method": epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_METHOD,
        "sessionKey": session_key,
        "agentId": agent_id,
        "scope": scope,
        "queryId": query_id,
        "privacyClass": privacy_class,
        "source": "websocket-multiplex",
        "fallbackActive": false,
        "projectionSchemaVersion": epi_s3_gateway_contract::SPACETIME_PROJECTION_SCHEMA_VERSION,
        "clockProtocolVersion": epi_s3_gateway_contract::SPACETIME_CLOCK_PROTOCOL_VERSION,
        "openedAtMs": opened_at_ms,
        "context": context,
    }))
}

/// Dispatch for `s3'.spacetime.subscribe` — the alias that delegates to the
/// SpaceTimeDB native-WebSocket projection path when configured. When the
/// SpaceTimeDB bridge is unconfigured (no SPACETIMEDB_URL), the dispatch
/// returns successfully but emits a `fallback-active` lifecycle envelope so
/// consumers can downgrade to HTTP SQL polling visibly (deliverable 5).
pub(super) async fn dispatch_spacetime_subscribe(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<Value, String> {
    let session_key = params
        .get("sessionKey")
        .and_then(|value| value.as_str())
        .unwrap_or("agent:main:main")
        .to_owned();
    let agent_id = params
        .get("agentId")
        .and_then(|value| value.as_str())
        .unwrap_or("operator")
        .to_owned();
    let scope = params
        .get("scope")
        .and_then(|value| value.as_str())
        .unwrap_or("session")
        .to_owned();
    let query_id = params
        .get("queryId")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let connection_id = params
        .get("connectionId")
        .and_then(|value| value.as_u64())
        .unwrap_or(0);

    // Ensure session exists — subscribe semantics imply session presence.
    store
        .ensure(&session_key)
        .map_err(|err| format!("session ensure failed: {err}"))?;
    let context = crate::gate::temporal::context_value(state_root, store, &session_key, &agent_id)?;
    let day_id = context
        .pointer("/dayId")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown-day")
        .to_owned();
    let vault_now_path = context
        .pointer("/vaultNowPath")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let graphiti_namespace_ref = context
        .pointer("/graphiti/namespaceRef")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let graphiti_arc_id = context
        .pointer("/graphiti/sessionArcId")
        .and_then(|value| value.as_str())
        .map(str::to_owned);
    let privacy_class = match scope.as_str() {
        "shared" | "shared-archetype" => "shared-archetype",
        _ => "session-local",
    }
    .to_owned();

    // Probe SpacetimeRegistration (the env-configured remote handle): if
    // SPACETIMEDB_URL is set, build a real subscription_plan (carrying
    // mode/source). Otherwise enter fallback mode.
    let port = DEFAULT_GATEWAY_PORT;
    let registration = SpacetimeRegistration::from_env(port, state_root)
        .map_err(|err| format!("spacetimedb registration probe failed: {err}"))?;

    let (plan_json, source, fallback_active, projection_mode) =
        if let Some(registration) = registration.as_ref() {
            let plan = registration.subscription_plan(&session_key, &agent_id);
            let plan_value = serde_json::to_value(&plan)
                .map_err(|err| format!("serialize subscription plan: {err}"))?;
            let source = if plan.mode.as_str()
                == epi_s3_gateway_contract::SPACETIME_PROJECTION_SOURCE_NATIVE_WS
            {
                "websocket-multiplex"
            } else {
                "http-sql-fallback"
            };
            let fallback = source == "http-sql-fallback";
            let mode = plan.subscription_mode.clone();
            (Some(plan_value), source.to_owned(), fallback, Some(mode))
        } else {
            (
                None::<Value>,
                "http-sql-fallback".to_owned(),
                true,
                None::<String>,
            )
        };

    let subscription_id = uuid::Uuid::new_v4().to_string();
    let opened_at_ms = now_ms() as u64;
    let record = GatewaySubscriptionRecord {
        subscription_id: subscription_id.clone(),
        method: epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_ALIAS_METHOD.to_owned(),
        connection_id,
        session_key: session_key.clone(),
        agent_id: agent_id.clone(),
        scope: scope.clone(),
        query_id: query_id.clone(),
        privacy_class: privacy_class.clone(),
        source: source.clone(),
        day_id: day_id.clone(),
        vault_now_path: vault_now_path.clone(),
        graphiti_namespace_ref: graphiti_namespace_ref.clone(),
        graphiti_arc_id: graphiti_arc_id.clone(),
        projection_source: Some(
            if fallback_active {
                "http-sql-poll"
            } else {
                "native-websocket"
            }
            .to_owned(),
        ),
        opened_at_ms,
    };
    runtime.register_subscription(record);

    let graphiti_status = graphiti_runtime_status_label().await;
    let metadata = subscription_metadata_payload(
        &subscription_id,
        epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_ALIAS_METHOD,
        &session_key,
        &agent_id,
        &scope,
        query_id.as_deref(),
        &privacy_class,
        &source,
        &day_id,
        vault_now_path.as_deref(),
        graphiti_namespace_ref.as_deref(),
        graphiti_arc_id.as_deref(),
        Some(if fallback_active {
            "http-sql-poll"
        } else {
            "native-websocket"
        }),
        graphiti_status,
    );
    broadcast_subscription_lifecycle(
        runtime,
        "requested",
        &session_key,
        &subscription_id,
        metadata.clone(),
    );
    if fallback_active {
        broadcast_subscription_lifecycle(
            runtime,
            "fallback-active",
            &session_key,
            &subscription_id,
            metadata.clone(),
        );
    } else {
        let mut applied_payload = metadata.clone();
        if let (Value::Object(map), Some(plan)) = (&mut applied_payload, plan_json.as_ref()) {
            map.insert("plan".to_owned(), plan.clone());
        }
        broadcast_subscription_lifecycle(
            runtime,
            "applied",
            &session_key,
            &subscription_id,
            applied_payload,
        );
    }

    Ok(json!({
        "subscriptionId": subscription_id,
        "method": epi_s3_gateway_contract::SPACETIME_SUBSCRIBE_ALIAS_METHOD,
        "sessionKey": session_key,
        "agentId": agent_id,
        "scope": scope,
        "queryId": query_id,
        "privacyClass": privacy_class,
        "source": source,
        "fallbackActive": fallback_active,
        "projectionMode": projection_mode,
        "projectionSchemaVersion": epi_s3_gateway_contract::SPACETIME_PROJECTION_SCHEMA_VERSION,
        "clockProtocolVersion": epi_s3_gateway_contract::SPACETIME_CLOCK_PROTOCOL_VERSION,
        "plan": plan_json,
        "openedAtMs": opened_at_ms,
        "context": context,
    }))
}

fn subscription_metadata_payload(
    subscription_id: &str,
    method: &str,
    session_key: &str,
    agent_id: &str,
    scope: &str,
    query_id: Option<&str>,
    privacy_class: &str,
    source: &str,
    day_id: &str,
    vault_now_path: Option<&str>,
    graphiti_namespace_ref: Option<&str>,
    graphiti_arc_id: Option<&str>,
    projection_source: Option<&str>,
    graphiti_runtime_status: &str,
) -> Value {
    json!({
        "subscriptionId": subscription_id,
        "method": method,
        "sessionKey": session_key,
        "agentId": agent_id,
        "scope": scope,
        "queryId": query_id,
        "privacyClass": privacy_class,
        "source": source,
        "dayId": day_id,
        "vaultNowPath": vault_now_path,
        "graphitiNamespaceRef": graphiti_namespace_ref,
        "graphitiArcId": graphiti_arc_id,
        "projectionSource": projection_source,
        "projectionSchemaVersion": epi_s3_gateway_contract::SPACETIME_PROJECTION_SCHEMA_VERSION,
        "clockProtocolVersion": epi_s3_gateway_contract::SPACETIME_CLOCK_PROTOCOL_VERSION,
        // 03.T6: Graphiti runtime status — surfaced on every subscription
        // envelope so agents can gate s5.episodic.* invocations without a
        // separate readiness call.
        "graphitiRuntimeStatus": graphiti_runtime_status,
        // 03.T7: production fallback policy — surfaced on every envelope
        // so consumers (kernel-bridge, M-extensions, alert dashboards) can
        // refuse to render data that crossed an undeclared fallback in a
        // production environment. Default is `development-only`; flips to
        // `operator-opt-in` when EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1.
        "productionFallbackPolicy": match epi_s3_gateway_contract::detect_production_fallback_policy() {
            epi_s3_gateway_contract::ProductionFallbackPolicy::DevelopmentOnly => "development-only",
            epi_s3_gateway_contract::ProductionFallbackPolicy::OperatorOptIn => "operator-opt-in",
        },
    })
}

/// 03.T6: probe the live Graphiti runtime status and map it to the typed
/// kernel-bridge enum's kebab-case discriminator. Bounded by the existing
/// status_value() probe timeout (750 ms); a non-response returns
/// `unavailable` so downstream consumers (the kernel-bridge, M-extensions)
/// can refuse episodic operations without a second probe.
async fn graphiti_runtime_status_label() -> &'static str {
    let status = crate::gate::graphiti::status_value().await;
    if !status.running {
        return "unavailable";
    }
    match status.health.as_ref() {
        Some(health) => match health.get("status").and_then(|value| value.as_str()) {
            Some("ok") => "available",
            // Any non-"ok" status counts as degraded (e.g. "starting",
            // "degraded", "stopping" — the runtime answered but is not at
            // full operational readiness).
            _ => "degraded",
        },
        None => "degraded",
    }
}

fn broadcast_subscription_lifecycle(
    runtime: &GatewayRuntimeState,
    phase: &str,
    session_key: &str,
    subscription_id: &str,
    payload: Value,
) {
    let mut payload = payload;
    if let Value::Object(map) = &mut payload {
        map.insert("phase".to_owned(), Value::String(phase.to_owned()));
    }
    let seq = runtime.next_seq(&format!("subscription:{subscription_id}"));
    runtime.broadcast(GatewayEvent::new(
        "s3'.subscription.lifecycle",
        None,
        Some(session_key),
        Some(seq),
        payload,
    ));
}
