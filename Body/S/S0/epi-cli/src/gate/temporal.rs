use std::path::{Path, PathBuf};

use epi_s3_gateway::temporal_context as s3_temporal_context;
use epi_s3_gateway::temporal_context::TemporalContextInputs;
use epi_s3_gateway_contract::{
    TerminalBinding, TerminalCaptureMode, TerminalCapturePolicy, TerminalStatus,
};
use epi_s3_redis_context::{CacheTier, RedisCache, RedisConfig};
use serde_json::{json, Value};

use crate::nara::{identity, kairos};

use super::sessions::{SessionRecord, SessionStore};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RedisHydrationMode {
    Off,
    BestEffort,
    Required,
}

pub fn context_value(
    state_root: &Path,
    store: &SessionStore,
    session_key: &str,
    agent_id: &str,
) -> Result<Value, String> {
    let record = store.resolve(session_key)?;
    Ok(context_for_record(state_root, &record, agent_id))
}

pub fn context_for_record(state_root: &Path, record: &SessionRecord, agent_id: &str) -> Value {
    let mut context = s3_temporal_context::context_for_record(
        state_root,
        record,
        agent_id,
        TemporalContextInputs {
            kairos: kairos_surface_value(record.day_id.as_deref().unwrap_or("unknown-day")),
            pratibimba: pratibimba_surface_value(),
            kernel: kernel_surface_value(),
            vault_root: vault_root_from_env(),
        },
    );
    attach_terminal_context(&mut context, record);
    context
}

pub fn kernel_surface_value() -> Value {
    s3_temporal_context::kernel_surface_value()
}

pub fn kernel_surface_value_at(timestamp_ms: u64, generation: u64) -> Value {
    s3_temporal_context::kernel_surface_value_at(timestamp_ms, generation)
}

pub fn hydrate_redis_for_record_on_propagation(
    state_root: &Path,
    record: &SessionRecord,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    match redis_hydration_mode() {
        RedisHydrationMode::Off => Ok(None),
        RedisHydrationMode::BestEffort => {
            let mut context = context_for_record(state_root, record, agent_id);
            if let Err(error) = hydrate_redis_from_context_blocking(&mut context) {
                context["redis"]["hydrationError"] = json!(error);
            }
            Ok(Some(context))
        }
        RedisHydrationMode::Required => {
            let mut context = context_for_record(state_root, record, agent_id);
            hydrate_redis_from_context_blocking(&mut context)?;
            Ok(Some(context))
        }
    }
}

pub fn redis_hydration_mode() -> RedisHydrationMode {
    match std::env::var("EPI_GATE_SESSION_REDIS_HYDRATION") {
        Ok(value) => match value.trim().to_ascii_lowercase().as_str() {
            "required" | "strict" | "1" | "true" | "yes" => RedisHydrationMode::Required,
            "best-effort" | "best_effort" | "best" => RedisHydrationMode::BestEffort,
            "off" | "false" | "0" | "no" | "" => RedisHydrationMode::Off,
            _ => RedisHydrationMode::Off,
        },
        Err(_) => RedisHydrationMode::Off,
    }
}

pub fn hydrate_redis_from_context_blocking(context: &mut Value) -> Result<(), String> {
    let context_value = context.clone();
    let hydrated = if tokio::runtime::Handle::try_current().is_ok() {
        std::thread::spawn(move || hydrate_redis_context_on_new_runtime(context_value))
            .join()
            .map_err(|_| "Redis hydration worker thread panicked".to_string())??
    } else {
        hydrate_redis_context_on_new_runtime(context_value)?
    };
    *context = hydrated;
    Ok(())
}

fn hydrate_redis_context_on_new_runtime(mut context: Value) -> Result<Value, String> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|err| err.to_string())?;
    runtime.block_on(async {
        stamp_graph_revision_best_effort(&mut context).await;
        s3_temporal_context::hydrate_redis_from_context(&mut context).await?;
        hydrate_terminal_metadata_from_context(&mut context).await
    })?;
    Ok(context)
}

pub async fn hydrate_redis_from_context(context: &mut Value) -> Result<(), String> {
    stamp_graph_revision_best_effort(context).await;
    s3_temporal_context::hydrate_redis_from_context(context).await?;
    hydrate_terminal_metadata_from_context(context).await
}

pub async fn current_graph_revision() -> Result<Option<u64>, String> {
    let client = epi_s2_graph_services::Neo4jClient::connect(
        &epi_s2_graph_services::Neo4jConfig::from_env(),
    )
    .map_err(|err| format!("graph metadata connection failed: {err}"))?;
    graph_revision_from_client(&client).await
}

pub(super) async fn graph_revision_from_client(
    client: &epi_s2_graph_services::Neo4jClient,
) -> Result<Option<u64>, String> {
    let meta = tokio::time::timeout(
        std::time::Duration::from_millis(750),
        epi_s2_graph_services::read_graph_meta(client),
    )
    .await
    .map_err(|_| "graph metadata read timed out".to_owned())??;
    meta.map(|meta| {
        u64::try_from(meta.graph_revision).map_err(|_| {
            format!(
                "graph revision must be non-negative, got {}",
                meta.graph_revision
            )
        })
    })
    .transpose()
}

async fn stamp_graph_revision_best_effort(context: &mut Value) {
    match current_graph_revision().await {
        Ok(Some(revision)) => context["kernel"]["graphRevision"] = json!(revision),
        Ok(None) => {}
        Err(error) => eprintln!("[gate] graph revision unavailable during hydration: {error}"),
    }
}

pub fn terminal_redis_payload_from_context(context: &Value) -> Option<Value> {
    let terminal = context.get("terminal")?;
    if !terminal
        .get("terminalBacked")
        .and_then(Value::as_bool)
        .unwrap_or(false)
    {
        return None;
    }

    Some(json!({
        "sessionKey": terminal
            .get("attachedSessionKey")
            .cloned()
            .unwrap_or_else(|| context["session"]["canonicalKey"].clone()),
        "provider": terminal["provider"].clone(),
        "status": terminal["status"].clone(),
        "leaseExpiresAtMs": terminal["leaseExpiresAtMs"].clone(),
        "captureHandleRef": terminal["captureHandleRef"].clone(),
        "capturePolicy": terminal["capturePolicy"].clone(),
        "rawPaneBodyStored": false,
        "privacy": "terminal-live-metadata-only",
    }))
}

async fn hydrate_terminal_metadata_from_context(context: &mut Value) -> Result<(), String> {
    let Some(key) = context
        .pointer("/redis/terminalMetadataKey")
        .and_then(Value::as_str)
        .map(str::to_owned)
    else {
        return Ok(());
    };
    let Some(payload) = terminal_redis_payload_from_context(context) else {
        return Ok(());
    };

    let mut cache = RedisCache::connect(&RedisConfig::from_env())
        .await
        .map_err(|err| err.to_string())?;
    cache
        .set_with_ttl(&key, &payload.to_string(), CacheTier::Hot.ttl_seconds())
        .await
        .map_err(|err| err.to_string())?;
    context["redis"]["terminalMetadataHydrated"] = json!(true);
    Ok(())
}

fn attach_terminal_context(context: &mut Value, record: &SessionRecord) {
    let terminal = terminal_metadata_for_record(record, context);
    if let Some(key) = terminal
        .get("redisMetadataKey")
        .and_then(Value::as_str)
        .filter(|key| !key.is_empty())
    {
        context["redis"]["terminalMetadataKey"] = json!(key);
    }
    if let Some(handle) = terminal
        .get("captureHandleRef")
        .and_then(Value::as_str)
        .filter(|handle| !handle.is_empty())
    {
        context["redis"]["terminalCaptureHandleRef"] = json!(handle);
    }
    context["terminal"] = terminal;
}

fn terminal_metadata_for_record(record: &SessionRecord, context: &Value) -> Value {
    let session_id = context
        .pointer("/session/sessionId")
        .and_then(Value::as_str)
        .unwrap_or(&record.session_id);
    let Some(binding) = record.terminal_binding.as_ref() else {
        return json!({
            "terminalBacked": false,
            "provider": Value::Null,
            "status": "unbound",
            "privacy": "terminal-live-metadata-only",
        });
    };

    let provider = terminal_provider(binding);
    let status = binding
        .terminal_status
        .map(terminal_status_value)
        .unwrap_or_else(|| "unknown".to_owned());
    let lease_expires_at_ms = binding
        .lease
        .as_ref()
        .and_then(|lease| lease.lease_expires_at_ms);
    let redis_metadata_key = terminal_metadata_key(session_id);
    let capture_handle_ref = terminal_capture_handle_ref(session_id);
    let capture_policy = capture_policy_value(binding.capture_policy.as_ref());
    let status_projection_allowed = terminal_status_projection_allowed(binding);
    let binding_value = json!({
        "provider": provider,
        "terminalIdentifier": binding.terminal_identifier,
        "sessionAnchor": binding.session_anchor,
        "tmuxPaneId": binding.tmux_pane_id,
        "attachedSessionKey": binding.attached_session_key,
        "terminalStatus": status,
        "leaseExpiresAtMs": lease_expires_at_ms,
        "capturePolicy": capture_policy,
        "captureHandleRef": capture_handle_ref,
        "commandAuthority": "sessions.patch-or-bounded-agent-tmux-only",
        "rawPaneBodyIncluded": false,
        "privacy": "terminal-binding-redacted-metadata",
    });
    let status_fragment = status_projection_allowed.then(|| {
        json!({
            "terminalBacked": true,
            "provider": provider,
            "status": binding_value["terminalStatus"].clone(),
            "leaseExpiresAtMs": lease_expires_at_ms,
            "captureHandleRef": binding_value["captureHandleRef"].clone(),
            "capturePolicy": binding_value["capturePolicy"].clone(),
            "rawPaneBodyIncluded": false,
            "privacy": "terminal-status-redacted-metadata",
        })
    });

    json!({
        "terminalBacked": true,
        "provider": provider,
        "status": binding_value["terminalStatus"].clone(),
        "terminalIdentifier": binding.terminal_identifier,
        "sessionAnchor": binding.session_anchor,
        "tmuxPaneId": binding.tmux_pane_id,
        "attachedSessionKey": binding.attached_session_key,
        "leaseExpiresAtMs": lease_expires_at_ms,
        "capturePolicy": binding_value["capturePolicy"].clone(),
        "captureHandleRef": binding_value["captureHandleRef"].clone(),
        "redisMetadataKey": redis_metadata_key,
        "statusProjectionAllowed": status_projection_allowed,
        "statusFragment": status_fragment,
        "binding": binding_value,
        "rawPaneBodyIncluded": false,
        "privacy": "terminal-live-metadata-only",
    })
}

fn terminal_provider(binding: &TerminalBinding) -> &'static str {
    if binding.tmux_pane_id.is_some()
        || binding
            .terminal_identifier
            .as_deref()
            .map(|identifier| identifier.starts_with("tmux:"))
            .unwrap_or(false)
    {
        "tmux"
    } else {
        "unknown"
    }
}

fn terminal_status_value(status: TerminalStatus) -> String {
    serde_json::to_value(status)
        .ok()
        .and_then(|value| value.as_str().map(ToOwned::to_owned))
        .unwrap_or_else(|| "unknown".to_owned())
}

fn capture_policy_value(policy: Option<&TerminalCapturePolicy>) -> Value {
    let mode = policy
        .map(|policy| capture_mode_value(policy.mode))
        .unwrap_or_else(|| capture_mode_value(TerminalCaptureMode::MetadataOnly));
    json!({
        "mode": mode,
        "maxLines": policy.and_then(|policy| policy.max_lines),
        "redactionPolicy": policy
            .and_then(|policy| policy.redaction_policy.as_ref())
            .map(|_| "configured")
            .unwrap_or("metadata-only"),
    })
}

fn capture_mode_value(mode: TerminalCaptureMode) -> String {
    serde_json::to_value(mode)
        .ok()
        .and_then(|value| value.as_str().map(ToOwned::to_owned))
        .unwrap_or_else(|| "metadataOnly".to_owned())
}

fn terminal_status_projection_allowed(binding: &TerminalBinding) -> bool {
    match binding.capture_policy.as_ref() {
        None => true,
        Some(policy) if policy.mode == TerminalCaptureMode::MetadataOnly => true,
        Some(policy) => policy
            .redaction_policy
            .as_deref()
            .map(|value| !value.trim().is_empty())
            .unwrap_or(false),
    }
}

fn terminal_metadata_key(session_id: &str) -> String {
    format!("cache:hot:s3:gateway:temporal:session:{session_id}:terminal:metadata")
}

fn terminal_capture_handle_ref(session_id: &str) -> String {
    format!("s3:gateway:temporal:session:{session_id}:terminal:capture-handle")
}

pub fn kairos_surface_value(day_id: &str) -> Value {
    let fresh = kairos::is_current_fresh();
    match kairos::load_current() {
        Ok(Some(snapshot)) => json!({
            "available": true,
            "fresh": fresh,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "dominantSign": snapshot.dominant_sign,
            "dominantElement": snapshot.dominant_element,
            "activeDecan": snapshot.active_decan,
            "activeTattva": snapshot.active_tattva,
            "planets": snapshot.planets,
            "privacy": "public-current-transit-only",
        }),
        Ok(None) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "reason": "no cached Kairos snapshot; run `epi nara kairos sync`",
            "privacy": "public-current-transit-only",
        }),
        Err(error) => json!({
            "available": false,
            "fresh": false,
            "source": "nara.kairos.current",
            "dayId": if day_id == "unknown-day" { Value::Null } else { Value::String(day_id.to_owned()) },
            "error": error,
            "privacy": "public-current-transit-only",
        }),
    }
}

pub fn pratibimba_surface_value() -> Value {
    match identity::load_profile() {
        Ok(Some(profile)) => {
            let anchor_id = format!("pratibimba-{}", profile.hash_preview);
            json!({
                "available": true,
                "anchorId": anchor_id,
                "coordinate": "M4.4.4.4",
                "graphitiNamespaceRef": anchor_id,
                "layerPresenceSummary": {
                    "presentCount": profile.layer_presence_mask.count_ones(),
                    "detail": "count-only",
                    "protectedSource": "local-nara-profile",
                },
                "localProtectedGraphOwner": "S2/S5",
                "stewardshipOwner": "S5'",
                "mutationOwner": "Epii/user validation",
                "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
                "privacy": "protected-reference-only",
            })
        }
        Ok(None) => json!({
            "available": false,
            "anchorId": Value::Null,
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": Value::Null,
            "layerPresenceSummary": {
                "presentCount": 0,
                "detail": "count-only",
                "protectedSource": "local-nara-profile",
            },
            "reason": "no Nara profile found",
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        }),
        Err(error) => json!({
            "available": false,
            "anchorId": Value::Null,
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": Value::Null,
            "layerPresenceSummary": {
                "presentCount": 0,
                "detail": "count-only",
                "protectedSource": "local-nara-profile",
            },
            "error": error,
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        }),
    }
}

fn vault_root_from_env() -> Option<PathBuf> {
    std::env::var("EPILOGOS_VAULT")
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}
