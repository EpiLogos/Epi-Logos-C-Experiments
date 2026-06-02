//! 13.T4: S0 thin adapter over the S3-owned SpaceTimeDB bridge.
//!
//! The bulk of the bridge — native WebSocket decoding, lifecycle envelope
//! construction, fallback policy, projection-context hydration, the HTTP
//! reducer client — moved to `Body/S/S3/gateway/src/spacetime.rs` per the
//! 13.T4 deliverable. This module retains ONLY:
//!
//! 1. The file-based `SpacetimeBridge` test event recorder. It is an S0-local
//!    test scaffolding helper that writes JSON to
//!    `<state_root>/spacetimedb-bridge/test-events.json`. It is not part of
//!    the production SpaceTimeDB path; production rows go through
//!    `epi_s3_gateway::spacetime::SpacetimePresence`.
//! 2. `publish_session_surface(state_root, record)` — a wiring helper that
//!    binds S0's `SessionStore` + `temporal::*` context computation to both
//!    the local file recorder AND the S3 `SpacetimeRegistration` (when
//!    configured). This is the env/config discovery + CLI/runtime startup
//!    integration the lane discipline retains in S0.
//! 3. `register_session_agent(registration, state_root, session_key)` — a
//!    free function that reuses the S0 SessionStore + temporal helpers to
//!    derive the binding fields then calls the S3 `SpacetimePresence`
//!    reducer methods.
//! 4. Re-exports of every public S3 type so existing consumers (server.rs,
//!    portal/mod.rs, kernel_bridge_runtime.rs, the test suite) keep importing
//!    from `crate::gate::spacetimedb_bridge::*` unchanged.

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_gateway::spacetime as s3_spacetime;
use epi_s3_gateway_contract::DEFAULT_GATEWAY_PORT;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::{
    sessions::{SessionRecord, SessionStore},
    system, temporal,
};

// =============================================================================
// 13.T4: re-export every public S3 surface so existing S0 imports work as-is.
// =============================================================================

pub use s3_spacetime::{
    agent_instance_id, agent_kind, assert_no_silent_fallback_in_value,
    capability_surface_hash, day_wikilink, fallback_active_envelope,
    fallback_policy_for_plan, global_temporal_surface_key, identity_handle_blake3,
    kairos_snapshot_id, lifecycle_envelope_from_update, projection_context_from_sql_result,
    projection_context_from_subscription_message, quintessence_hash_blake3,
    redis_global_context_key, silent_fallback_refused, string_at, ReducerRetryPolicy,
    SpacetimePresence, SpacetimeProjectionConnectionState, SpacetimeProjectionResyncTracker,
    SpacetimeProjectionSubscription, SpacetimeProjectionUpdate, SpacetimeRegistration,
    SpacetimeSubscriptionPlan,
};

// =============================================================================
// S0-local file-based test event recorder
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeEvent {
    pub kind: String,
    pub table: String,
    pub payload: Value,
    pub timestamp_ms: u128,
}

pub struct SpacetimeBridge {
    state_root: PathBuf,
}

pub fn publish_session_surface(state_root: &Path, record: &SessionRecord) -> Result<(), String> {
    let bridge = SpacetimeBridge::new(state_root)?;
    let temporal_context = temporal::hydrate_redis_for_record_on_propagation(
        state_root,
        record,
        &record.active_agent_id,
    )?;
    bridge.publish_session_record(
        record,
        record.aliases.first().map(String::as_str),
        temporal_context.as_ref(),
    )?;

    if let Some(registration) = SpacetimeRegistration::from_env(DEFAULT_GATEWAY_PORT, state_root)? {
        register_session_agent(&registration, state_root, &record.canonical_key)?;
    }

    Ok(())
}

impl SpacetimeBridge {
    pub fn new(state_root: impl AsRef<Path>) -> Result<Self, String> {
        let state_root = state_root.as_ref().to_path_buf();
        fs::create_dir_all(event_path(&state_root).parent().unwrap())
            .map_err(|err| err.to_string())?;
        Ok(Self { state_root })
    }

    pub fn publish_presence(&self, operator_id: &str) -> Result<(), String> {
        let snapshot = system::presence(&self.state_root)?;
        self.append(
            "presence",
            "now_presence",
            json!({
                "operatorId": operator_id,
                "heartbeats": snapshot["heartbeats"].clone(),
                "events": snapshot["events"].clone(),
            }),
        )
    }

    pub fn register_gateway_instance(
        &self,
        gateway_id: &str,
        installation_id: &str,
        workspace_root_hash: &str,
        endpoint: &str,
        protocol_version: &str,
    ) -> Result<(), String> {
        self.append(
            "gateway_registration",
            "gateway_instance",
            json!({
                "gatewayId": gateway_id,
                "installationId": installation_id,
                "workspaceRootHash": workspace_root_hash,
                "endpoint": endpoint,
                "protocolVersion": protocol_version,
                "status": "online",
            }),
        )
    }

    pub fn register_agent_instance(
        &self,
        agent_instance_id: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_id: &str,
        agent_kind: &str,
        session_key: &str,
        capability_surface_hash: &str,
    ) -> Result<(), String> {
        self.append(
            "agent_registration",
            "agent_instance",
            json!({
                "agentInstanceId": agent_instance_id,
                "installationId": installation_id,
                "gatewayId": gateway_id,
                "agentId": agent_id,
                "agentKind": agent_kind,
                "sessionKey": session_key,
                "capabilitySurfaceHash": capability_surface_hash,
                "status": "online",
            }),
        )
    }

    pub fn register_client(
        &self,
        client_id: &str,
        installation_id: &str,
        gateway_id: &str,
        client_kind: &str,
        scopes: &[&str],
    ) -> Result<(), String> {
        self.append(
            "client_registration",
            "client_registration",
            json!({
                "clientId": client_id,
                "installationId": installation_id,
                "gatewayId": gateway_id,
                "clientKind": client_kind,
                "scopes": scopes,
                "status": "online",
            }),
        )
    }

    pub fn publish_session(&self, identifier: &str, now_alias: Option<&str>) -> Result<(), String> {
        let store = SessionStore::new(&self.state_root)?;
        let record = store.resolve(identifier)?;
        self.publish_session_record(&record, now_alias, None)
    }

    pub fn publish_session_record(
        &self,
        record: &SessionRecord,
        now_alias: Option<&str>,
        temporal_context: Option<&Value>,
    ) -> Result<(), String> {
        let default_temporal_context =
            temporal::context_for_record(&self.state_root, record, &record.active_agent_id);
        let temporal_context = temporal_context.unwrap_or(&default_temporal_context);
        let mut payload = json!({
            "canonicalKey": record.canonical_key,
            "aliases": record.aliases,
            "label": record.label,
            "sessionId": temporal_context["session"]["sessionId"].clone(),
            "recordSessionId": record.session_id,
            "dayId": temporal_context["day"]["dayId"].clone(),
            "parentSessionKey": record.parent_session_key,
            "sourceSessionKey": record.source_session_key,
            "sourceSessionKind": record.source_session_kind,
            "runtimeCwd": record.runtime_cwd,
            "vaultRoot": record.vault_root,
            "resourceLoaderId": record.resource_loader_id,
            "retrySettlementState": record.retry_settlement_state,
            "diagnostics": record.diagnostics,
            "dayWikilink": temporal_context["day"]["wikilink"].clone(),
            "vaultNowPath": temporal_context["now"]["path"].clone(),
            "nowWikilink": temporal_context["now"]["wikilink"].clone(),
            "history": temporal_context["history"].clone(),
            "redisTemporalContext": temporal_context["redis"].clone(),
            "kairos": temporal_context["kairos"].clone(),
            "kernel": temporal_context["kernel"].clone(),
            "pratibimba": temporal_context["pratibimba"].clone(),
            "graphiti": temporal_context["graphiti"].clone(),
            "activeAgentId": record.active_agent_id,
            "subagentLineage": record.subagent_lineage,
            "workspaceRoot": record.workspace_root,
            "bootstrapScope": record.bootstrap_scope,
            "teamId": record.team_id,
            "teamRole": record.team_role,
            "orchestrationKind": record.orchestration_kind,
            "cmuxWorkspace": record.cmux_workspace,
            "cmuxSurface": record.cmux_surface,
            "cmuxPaneId": record.cmux_pane_id,
        });

        if let Some(alias) = now_alias {
            payload["nowAlias"] = json!(alias);
        }

        self.append("session_surface", "session_surface", payload)?;
        self.publish_global_temporal_record(record, temporal_context)
    }

    fn publish_global_temporal_record(
        &self,
        record: &SessionRecord,
        temporal_context: &Value,
    ) -> Result<(), String> {
        let day_id = string_at(temporal_context, "/day/dayId", "unknown-day");
        let installation_id =
            optional_env("EPI_INSTALLATION_ID").unwrap_or_else(|| "install-local".to_owned());
        let gateway_id =
            optional_env("EPI_GATEWAY_ID").unwrap_or_else(|| "gateway-main".to_owned());
        let redis_global_context =
            redis_global_context_key(&installation_id, &gateway_id, day_id);
        let payload = json!({
            "coordinateOwner": "S3'",
            "agentAccessOwner": "S4/S5",
            "surfaceKey": global_temporal_surface_key(&installation_id, &gateway_id, &record.canonical_key),
            "installationId": installation_id,
            "gatewayId": gateway_id,
            "sessionKey": record.canonical_key,
            "agentId": record.active_agent_id,
            "dayId": day_id,
            "dayWikilink": temporal_context["day"]["wikilink"].clone(),
            "nowPath": temporal_context["now"]["path"].clone(),
            "nowWikilink": temporal_context["now"]["wikilink"].clone(),
            "nowLineageKey": record.canonical_key,
            "historyArchivePath": temporal_context["history"]["archivePath"].clone(),
            "redis": {
                "sessionNowKey": temporal_context["redis"]["sessionNowKey"].clone(),
                "dayContextKey": temporal_context["redis"]["dayContextKey"].clone(),
                "globalContextKey": redis_global_context,
                "hydrated": temporal_context["redis"]["hydrated"].clone(),
            },
            "kairosSnapshotId": kairos_snapshot_id(temporal_context),
            "kairos": temporal_context["kairos"].clone(),
            "kernel": temporal_context["kernel"].clone(),
            "pratibimba": temporal_context["pratibimba"].clone(),
            "graphiti": {
                "runtimeOwner": "S3'",
                "invocationOwner": "S5/S5'",
                "namespaceRef": temporal_context["graphiti"]["namespaceRef"].clone(),
                "sessionArcId": temporal_context["graphiti"]["sessionArcId"].clone(),
            },
            "privacy": "safe-live-projection",
        });

        self.append(
            "global_temporal_surface",
            "global_temporal_surface",
            payload,
        )
    }

    pub fn publish_activity_event(&self, kind: &str, payload: Value) -> Result<(), String> {
        self.append(
            "activity_event",
            "now_activity",
            json!({
                "kind": kind,
                "payload": payload,
            }),
        )
    }

    pub fn publish_m_clock_placeholder(&self, clock: &str) -> Result<(), String> {
        self.append(
            "m_clock_state",
            "now_m_clock",
            json!({
                "clock": clock,
                "state": "placeholder",
                "bridgeMode": "one_way",
            }),
        )
    }

    pub fn drain_test_events(&self) -> Result<Vec<BridgeEvent>, String> {
        let path = event_path(&self.state_root);
        if !path.exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        let events = serde_json::from_str(&content).map_err(|err| err.to_string())?;
        fs::write(path, "[]").map_err(|err| err.to_string())?;
        Ok(events)
    }

    fn append(&self, kind: &str, table: &str, payload: Value) -> Result<(), String> {
        let path = event_path(&self.state_root);
        let mut events = if path.exists() {
            let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
            serde_json::from_str::<Vec<BridgeEvent>>(&content).map_err(|err| err.to_string())?
        } else {
            Vec::new()
        };

        events.push(BridgeEvent {
            kind: kind.to_owned(),
            table: table.to_owned(),
            payload,
            timestamp_ms: now_ms()?,
        });

        let content = serde_json::to_string_pretty(&events).map_err(|err| err.to_string())?;
        fs::write(path, content).map_err(|err| err.to_string())
    }
}

fn event_path(state_root: &Path) -> PathBuf {
    state_root
        .join("spacetimedb-bridge")
        .join("test-events.json")
}

// =============================================================================
// S0 → S3 wiring: register_session_agent
// =============================================================================

/// 13.T4 wiring: reuses S0's `SessionStore` + `temporal::context_for_record`
/// to derive the binding fields, then calls the S3 reducer client methods on
/// the registration's `SpacetimePresence` client. The S3 module exposes the
/// reducer API; the S0 module is the only place that knows how to materialise
/// the temporal context from the gate state root.
pub fn register_session_agent(
    registration: &SpacetimeRegistration,
    state_root: &Path,
    session_key: &str,
) -> Result<(), String> {
    let store = SessionStore::new(state_root)?;
    let record = store.resolve(session_key)?;
    let temporal_context =
        temporal::context_for_record(state_root, &record, &record.active_agent_id);
    let agent_instance =
        agent_instance_id(&registration.gateway_id, &record.active_agent_id, &record.session_id);
    let capability_surface = capability_surface_hash(&record.active_agent_id, &record.canonical_key);

    let client = registration.client();
    client.register_agent(
        &agent_instance,
        &registration.installation_id,
        &registration.gateway_id,
        &record.active_agent_id,
        &agent_kind(&record.active_agent_id),
        &record.canonical_key,
        &capability_surface,
    )?;

    let day_id = string_at(&temporal_context, "/day/dayId", "unknown-day");
    let now_path = string_at(&temporal_context, "/now/path", "");
    let now_wikilink = string_at(&temporal_context, "/now/wikilink", "");
    let history_archive_path = string_at(&temporal_context, "/history/archivePath", "");
    let redis_session_now_key = string_at(&temporal_context, "/redis/sessionNowKey", "");
    let redis_day_context_key = string_at(&temporal_context, "/redis/dayContextKey", "");
    let graphiti_arc_id = string_at(&temporal_context, "/graphiti/sessionArcId", "");
    let graphiti_namespace_ref = string_at(&temporal_context, "/graphiti/namespaceRef", "");
    let pratibimba_anchor_ref = string_at(&temporal_context, "/pratibimba/anchorId", "");
    let kairos_id = kairos_snapshot_id(&temporal_context);
    let kernel_projection = kernel_projection_json(&temporal_context);
    let day_wl = day_wikilink(day_id);
    let global_surface = global_temporal_surface_key(
        &registration.installation_id,
        &registration.gateway_id,
        &record.canonical_key,
    );
    let redis_global = redis_global_context_key(
        &registration.installation_id,
        &registration.gateway_id,
        day_id,
    );

    client.bind_session_temporal_context(
        &record.canonical_key,
        &registration.installation_id,
        &registration.gateway_id,
        &agent_instance,
        day_id,
        now_path,
        now_wikilink,
        history_archive_path,
        redis_session_now_key,
        redis_day_context_key,
        graphiti_arc_id,
        pratibimba_anchor_ref,
        &kairos_id,
        record.parent_session_key.as_deref().unwrap_or(""),
        record.source_session_key.as_deref().unwrap_or(""),
        record.source_session_kind.as_deref().unwrap_or(""),
        record.runtime_cwd.as_deref().unwrap_or(""),
        record.vault_root.as_deref().unwrap_or(""),
        record.resource_loader_id.as_deref().unwrap_or(""),
        record.retry_settlement_state.as_deref().unwrap_or(""),
        &serde_json::to_string(&record.diagnostics).unwrap_or_else(|_| "[]".to_owned()),
        &kernel_projection,
    )?;

    let kairos = &temporal_context["kairos"];
    client.bind_kairos_surface(
        &kairos_id,
        &registration.installation_id,
        &registration.gateway_id,
        day_id,
        &record.canonical_key,
        kairos
            .get("available")
            .and_then(Value::as_bool)
            .unwrap_or(false),
        kairos
            .get("fresh")
            .and_then(Value::as_bool)
            .unwrap_or(false),
        kairos
            .get("dominantSign")
            .and_then(Value::as_u64)
            .unwrap_or(0) as u8,
        kairos
            .get("dominantElement")
            .and_then(Value::as_u64)
            .unwrap_or(0) as u8,
        kairos
            .get("activeDecan")
            .and_then(Value::as_u64)
            .unwrap_or(0) as u8,
        kairos
            .get("activeTattva")
            .and_then(Value::as_u64)
            .unwrap_or(0) as u8,
        kairos.get("planets").cloned().unwrap_or_else(|| json!([])),
        kairos
            .get("source")
            .and_then(Value::as_str)
            .unwrap_or("nara.kairos.current"),
    )?;

    client.bind_global_temporal_surface(
        &global_surface,
        &registration.installation_id,
        &registration.gateway_id,
        &agent_instance,
        &record.canonical_key,
        day_id,
        &day_wl,
        now_path,
        now_wikilink,
        &record.canonical_key,
        history_archive_path,
        redis_session_now_key,
        redis_day_context_key,
        &redis_global,
        graphiti_namespace_ref,
        graphiti_arc_id,
        pratibimba_anchor_ref,
        &kairos_id,
        &kernel_projection,
    )
}

// =============================================================================
// readiness wrapper: delegates to S3 with the gate-root path.
// =============================================================================

pub fn readiness_value(port: u16, state_root: &Path) -> Value {
    s3_spacetime::readiness_value(port, state_root)
}

// =============================================================================
// local helpers retained for S0-specific kernel projection JSON derivation
// =============================================================================

fn optional_env(key: &str) -> Option<String> {
    std::env::var(key)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

fn kernel_projection_json(context: &Value) -> String {
    let kernel = context
        .get("kernel")
        .filter(|value| value.is_object())
        .cloned()
        .unwrap_or_else(temporal::kernel_surface_value);
    kernel.to_string()
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
