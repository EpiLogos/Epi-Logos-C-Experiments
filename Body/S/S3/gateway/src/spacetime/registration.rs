use std::path::{Path, PathBuf};

use crate::spacetime::fallback::fallback_policy_for_plan;
use crate::spacetime::identity::{optional_env, require_nonempty, workspace_root_hash};
use crate::spacetime::presence::SpacetimePresence;
use crate::spacetime::projection::projection_context_from_subscription_message;
use crate::spacetime::resync::{SpacetimeProjectionResyncTracker, SpacetimeProjectionUpdate};

use epi_s3_gateway_contract::{
    assert_being_pattern_public_safe,
    being_pattern_acceptance_replay as contract_being_pattern_acceptance_replay,
    BeingPatternReplay, PasuBeingPatternProjection, SpacetimeFallbackPolicy,
    SpacetimeProjectionPlan, DEFAULT_GATEWAY_PORT, SPACETIME_FULL_PROJECTION_TABLES,
    SPACETIME_LITE_PROJECTION_TABLES, SPACETIME_PROJECTION_MODE_FULL,
    SPACETIME_PROJECTION_MODE_LITE, SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
    SPACETIME_PROJECTION_SOURCE_NATIVE_WS, SPACETIME_PROJECTION_TABLES,
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
};
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::net::TcpStream;
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, Message},
    MaybeTlsStream, WebSocketStream,
};

// SpacetimeRegistration: native subscription + reducer client + readiness
// =============================================================================

pub type SpacetimeSubscriptionPlan = SpacetimeProjectionPlan;

pub fn being_pattern_acceptance_replay() -> BeingPatternReplay {
    contract_being_pattern_acceptance_replay()
}

pub fn being_pattern_bridge_handle_payload(projection: &PasuBeingPatternProjection) -> Value {
    let payload = json!({
        "entityRef": projection.entity_ref,
        "stableIdentity": projection.stable_identity,
        "liveState": projection.live_state,
        "observerAnchor": projection.observer_anchor,
        "clockAddress": projection.clock_address,
        "monopolyOperator": projection.monopoly_operator,
        "perspectiveRole": projection.perspective_role,
        "naraFamilyRole": projection.nara_family_role,
        "m2M3Relation": projection.m2_m3_relation,
        "bioquaternionHandles": projection.bioquaternion_handles,
        "elementalWeights": projection.elemental_weights,
        "relationEdges": projection.relation_edges,
        "verifierRefs": projection.verifier_refs,
        "reviewRisk": projection.review_risk,
    });
    assert_being_pattern_public_safe(&payload)
        .expect("BeingPattern bridge payload must be public-safe handles only");
    payload
}

#[derive(Debug, Clone)]
pub struct SpacetimeRegistration {
    pub url: String,
    pub database: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub workspace_root_hash: String,
    pub endpoint: String,
    pub protocol_version: String,
}

pub struct SpacetimeProjectionSubscription {
    socket: WebSocketStream<MaybeTlsStream<TcpStream>>,
    agent_id: String,
    resync: SpacetimeProjectionResyncTracker,
}

impl SpacetimeRegistration {
    /// 13.T4: env-config discovery returns an S3-owned registration. The
    /// state_root is used only to derive a stable workspace_root_hash if
    /// EPI_WORKSPACE_ROOT_HASH is not set; the registration object itself
    /// carries no S0-specific paths.
    pub fn from_env(port: u16, state_root: &Path) -> Result<Option<Self>, String> {
        let Some(url) =
            optional_env("EPI_GATE_SPACETIME_URL").or_else(|| optional_env("SPACETIMEDB_URL"))
        else {
            return Ok(None);
        };
        let database = optional_env("EPI_GATE_SPACETIME_DATABASE")
            .or_else(|| optional_env("SPACETIMEDB_DATABASE"))
            .unwrap_or_else(|| "epi-logos-runtime".to_owned());
        let installation_id =
            optional_env("EPI_INSTALLATION_ID").unwrap_or_else(|| "local".to_owned());
        let gateway_id =
            optional_env("EPI_GATEWAY_ID").unwrap_or_else(|| format!("gateway-{port}"));
        let workspace_root_hash = optional_env("EPI_WORKSPACE_ROOT_HASH")
            .unwrap_or_else(|| workspace_root_hash(state_root));
        let endpoint = optional_env("EPI_GATEWAY_ENDPOINT")
            .unwrap_or_else(|| format!("ws://127.0.0.1:{port}"));
        let protocol_version =
            optional_env("EPI_GATEWAY_PROTOCOL_VERSION").unwrap_or_else(|| "3".to_owned());

        Ok(Some(Self {
            url,
            database,
            installation_id,
            gateway_id,
            workspace_root_hash,
            endpoint,
            protocol_version,
        }))
    }

    pub fn readiness_value(&self) -> Value {
        let plan = self.subscription_plan("", "");
        let native_ready =
            plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS && !plan.endpoint.is_empty();
        let capability_facts = projection_capability_facts(native_ready, &plan);
        let policy = fallback_policy_for_plan(&plan);
        json!({
            "ok": true,
            "configured": true,
            "registrationMode": "live-reducer",
            "subscriptionMode": plan.mode,
            "subscriptionProfile": plan.subscription_mode,
            "nativeSubscriptionReady": native_ready,
            "url": self.url,
            "database": self.database,
            "installationId": self.installation_id,
            "gatewayId": self.gateway_id,
            "endpoint": self.endpoint,
            "protocolVersion": self.protocol_version,
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "liteProjectionTables": SPACETIME_LITE_PROJECTION_TABLES,
            "fullProjectionTables": SPACETIME_FULL_PROJECTION_TABLES,
            "projectionSubscriptionPlan": plan,
            "capabilityFacts": capability_facts,
            // 13.T4: name the fallback policy explicitly + carry the
            // silent-fallback-forbidden sentinel so consumers can audit.
            "fallbackPolicy": policy,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "rawServiceHealth": "configured reducer target; live reducer calls are verified by gateway registration tests",
            "agentAccess": "agent/session surfaces register when sessions publish temporal context",
            "subscriptionReadiness": if native_ready {
                "native SpaceTimeDB WebSocket projection plan is configured; HTTP SQL polling remains the fallback"
            } else {
                "TUI can bind projection via HTTP SQL polling; native WebSocket subscription remains an upgrade path"
            },
        })
    }

    pub fn subscription_plan(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> SpacetimeSubscriptionPlan {
        let mode = match optional_env("EPI_SPACETIME_SUBSCRIPTION_MODE").as_deref() {
            Some("native-websocket") => SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            _ => SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
        }
        .to_owned();
        SpacetimeProjectionPlan::new(
            mode,
            spacetimedb_websocket_endpoint(&self.url),
            self.database.clone(),
        )
        .for_subscription_mode(subscription_mode_from_env())
        .for_session(session_key, agent_id)
    }

    pub fn fallback_policy(&self) -> SpacetimeFallbackPolicy {
        fallback_policy_for_plan(&self.subscription_plan("", ""))
    }

    pub fn register_gateway(&self) -> Result<(), String> {
        self.client().register_gateway(
            &self.gateway_id,
            &self.installation_id,
            &self.workspace_root_hash,
            &self.endpoint,
            &self.protocol_version,
        )
    }

    pub fn heartbeat_gateway(&self) -> Result<(), String> {
        self.client().heartbeat_gateway(&self.gateway_id)
    }

    pub fn register_client(
        &self,
        client_id: &str,
        client_kind: &str,
        scopes: &[String],
    ) -> Result<(), String> {
        let scope_refs = scopes.iter().map(String::as_str).collect::<Vec<_>>();
        self.client().register_client(
            client_id,
            &self.installation_id,
            &self.gateway_id,
            client_kind,
            &scope_refs,
        )
    }

    pub fn projection_temporal_context(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<Option<Value>, String> {
        self.client()
            .projection_temporal_context(session_key, agent_id)
    }

    pub async fn subscribe_projection(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<SpacetimeProjectionSubscription, String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(agent_id, "agent_id")?;
        let plan = self.subscription_plan(session_key, agent_id);
        // 13.T4 fallback discipline: if the plan resolves to anything other
        // than native-websocket, refuse explicitly. This is the central
        // refuse-to-fall-back-silently gate — callers MUST observe the error,
        // signal `SpacetimeFallbackPolicy::FallbackActive` upstream, and route
        // through the HTTP SQL polling client. There is NO code path here
        // where native subscription quietly downgrades to HTTP behind the
        // caller's back.
        if plan.mode != SPACETIME_PROJECTION_SOURCE_NATIVE_WS {
            return Err(format!(
                "spacetimedb subscription mode is {}; set EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket (silent HTTP fallback is forbidden: {SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN})",
                plan.mode
            ));
        }

        let mut request = plan
            .subscribe_url()
            .into_client_request()
            .map_err(|err| format!("spacetimedb websocket request failed: {err}"))?;
        request.headers_mut().insert(
            "sec-websocket-protocol",
            "v1.json.spacetimedb"
                .parse()
                .map_err(|err| format!("invalid websocket subprotocol header: {err}"))?,
        );

        let (mut socket, _) = connect_async(request)
            .await
            .map_err(|err| format!("spacetimedb websocket connect failed: {err}"))?;
        socket
            .send(Message::Text(plan.subscribe_multi_message().to_string()))
            .await
            .map_err(|err| format!("spacetimedb subscribe message failed: {err}"))?;

        Ok(SpacetimeProjectionSubscription {
            socket,
            agent_id: agent_id.to_owned(),
            resync: SpacetimeProjectionResyncTracker::default(),
        })
    }

    pub fn client(&self) -> SpacetimePresence {
        SpacetimePresence::for_database(&self.url, &self.database)
    }
}

impl SpacetimeProjectionSubscription {
    pub fn mark_connection_lost(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_connection_lost()
    }

    pub fn mark_reconnecting(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_reconnecting()
    }

    pub fn mark_degraded_but_subscribable(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_degraded_but_subscribable()
    }

    pub async fn next_update(&mut self) -> Result<Option<SpacetimeProjectionUpdate>, String> {
        while let Some(message) = self.socket.next().await {
            let message = match message {
                Ok(message) => message,
                Err(err) => {
                    let update = self.resync.mark_connection_lost();
                    return Err(format!(
                        "spacetimedb websocket receive failed after {:?}: {err}",
                        update.state
                    ));
                }
            };
            if !message.is_text() {
                continue;
            }
            let raw = message
                .to_text()
                .map_err(|err| format!("spacetimedb text frame failed: {err}"))?;
            let value = serde_json::from_str::<Value>(raw)
                .map_err(|err| format!("spacetimedb websocket frame was not JSON: {err}"))?;
            if let Some(context) =
                projection_context_from_subscription_message(&value, &self.agent_id)?
            {
                return Ok(Some(self.resync.observe_context(context)));
            }
        }
        self.resync.mark_connection_lost();
        Ok(None)
    }

    pub async fn next_context(&mut self) -> Result<Option<Value>, String> {
        Ok(self.next_update().await?.and_then(|update| update.context))
    }

    /// Typed delta surface — 03.T3 deliverable; preserved through the 13.T4
    /// extraction. Decodes the next SpaceTimeDB subscription frame into a
    /// `SpacetimeProjectionDelta` so consumers can dispatch on `message_kind`
    /// and per-surface table identity. Skips non-text and Unknown frames;
    /// surfaces decoder errors instead of silently dropping them.
    pub async fn next_delta(
        &mut self,
    ) -> Result<Option<epi_s3_gateway_contract::SpacetimeProjectionDelta>, String> {
        while let Some(message) = self.socket.next().await {
            let message = match message {
                Ok(message) => message,
                Err(err) => {
                    self.resync.mark_connection_lost();
                    return Err(format!(
                        "spacetimedb websocket receive failed during next_delta: {err}"
                    ));
                }
            };
            if !message.is_text() {
                continue;
            }
            let raw = message
                .to_text()
                .map_err(|err| format!("spacetimedb text frame failed: {err}"))?;
            let value = serde_json::from_str::<Value>(raw)
                .map_err(|err| format!("spacetimedb websocket frame was not JSON: {err}"))?;
            let delta =
                epi_s3_gateway_contract::SpacetimeProjectionDelta::from_subscription_message(
                    &value,
                )?;
            if matches!(
                delta.message_kind,
                epi_s3_gateway_contract::SpacetimeMessageKind::Unknown
            ) {
                // IdentityToken/Ping/server-control — skip and read the next.
                continue;
            }
            return Ok(Some(delta));
        }
        self.resync.mark_connection_lost();
        Ok(None)
    }
}

pub fn readiness_value(port: u16, state_root: &Path) -> Value {
    match SpacetimeRegistration::from_env(port, state_root) {
        Ok(Some(registration)) => registration.readiness_value(),
        Ok(None) => json!({
            "ok": false,
            "configured": false,
            "registrationMode": "disabled",
            "fallbackPolicy": SpacetimeFallbackPolicy::Disabled,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "reason": "set SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL to enable live projection",
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "liteProjectionTables": SPACETIME_LITE_PROJECTION_TABLES,
            "fullProjectionTables": SPACETIME_FULL_PROJECTION_TABLES,
            "capabilityFacts": projection_capability_facts(
                false,
                &SpacetimeProjectionPlan::http_sql("", "")
                    .for_subscription_mode(subscription_mode_from_env())
            ),
            "rawServiceHealth": "not configured",
            "agentAccess": "not registered",
            "subscriptionReadiness": "disabled until SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL is set",
        }),
        Err(error) => json!({
            "ok": false,
            "configured": false,
            "registrationMode": "invalid",
            "fallbackPolicy": SpacetimeFallbackPolicy::Disabled,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "error": error,
            "subscriptionReadiness": "invalid SpaceTimeDB configuration",
        }),
    }
}

/// 13.T4 wrapper: `DEFAULT_GATEWAY_PORT`-rooted readiness value. Kept as a
/// stable surface for S0 startup wiring.
pub fn readiness_value_default(state_root: &Path) -> Value {
    readiness_value(DEFAULT_GATEWAY_PORT, state_root)
}

fn spacetimedb_websocket_endpoint(url: &str) -> String {
    if let Some(rest) = url.strip_prefix("https://") {
        format!("wss://{}", rest.trim_end_matches('/'))
    } else if let Some(rest) = url.strip_prefix("http://") {
        format!("ws://{}", rest.trim_end_matches('/'))
    } else {
        url.trim_end_matches('/').to_owned()
    }
}

fn subscription_mode_from_env() -> &'static str {
    match optional_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE").as_deref() {
        Some(SPACETIME_PROJECTION_MODE_FULL) => SPACETIME_PROJECTION_MODE_FULL,
        _ => SPACETIME_PROJECTION_MODE_LITE,
    }
}

fn projection_capability_facts(native_ready: bool, plan: &SpacetimeProjectionPlan) -> Value {
    let full_mode = plan.subscription_mode == SPACETIME_PROJECTION_MODE_FULL;
    json!({
        "rawServiceConfigured": !plan.endpoint.is_empty(),
        "nativeWebsocketPreferred": plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
        "nativeWebsocketSubscribable": native_ready,
        "httpSqlFallbackAvailable": true,
        "liteProjectionSubscribable": plan.tables.iter().any(|table| table == "session_surface")
            && plan.tables.iter().any(|table| table == "kairos_surface")
            && plan.tables.iter().any(|table| table == "global_temporal_surface"),
        "fullProjectionRequested": full_mode,
        "presenceProjectionIncluded": full_mode && plan.tables.iter().any(|table| table == "agent_instance"),
        "sharedEventProjectionIncluded": full_mode && plan.tables.iter().any(|table| table == "temporal_event"),
        "kernelTraceProjectionIncluded": plan.tables.iter().any(|table| table == "session_surface"),
        "temporalContextProjectionIncluded": plan.tables.iter().any(|table| table == "global_temporal_surface"),
        "observabilityEventsIncluded": full_mode && plan.tables.iter().any(|table| table == "temporal_event"),
        "privacySafePublicProjection": true,
        "resyncStates": [
            "connection-lost",
            "reconnecting",
            "stale-profile",
            "resynced-profile-generation",
            "degraded-but-subscribable"
        ]
    })
}

// =============================================================================
// 13.T4 path helper: state-root-rooted readiness wrapper for S0 wiring.
// =============================================================================

/// Convenience wrapper accepting a `PathBuf` so the S0 wiring layer can pass
/// its gate-root without converting borrow lifetimes. Delegates to
/// `readiness_value(port, state_root)`.
pub fn readiness_value_for_state_root(port: u16, state_root: PathBuf) -> Value {
    readiness_value(port, &state_root)
}
