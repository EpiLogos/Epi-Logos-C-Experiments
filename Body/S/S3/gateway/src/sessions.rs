//! Session JSON envelope constructors and list shapes (13.T3 host extraction).
//!
//! Prior to 13.T3, the JSON envelope helpers `record_to_value`, `session_row`,
//! and `list_result` lived under `Body/S/S0/epi-cli/src/gate/sessions.rs`. The
//! S0 server.rs `dispatch_rpc` arm for `sessions.list` / `sessions.resolve` /
//! `sessions.patch` etc. delegated to those helpers. Per 13.T3 the runtime
//! ownership for those envelopes lives in S3 — S0 keeps only CLI plumbing and
//! the WebSocket/Tokio host process.
//!
//! `handler_owner` field is added to surfaces produced by this module so the
//! live-gateway smoke test in `Body/S/S3/gateway/tests/live_gateway_smoke.rs`
//! can prove the handler owner is S3.
//!
//! State-root layout `~/.epi/gate/sessions/<slug>.json` is preserved unchanged.
//!
//! ## Migration notes (alpha → 13.T3)
//!
//! The on-disk shape of `SessionRecord` is unchanged. The wire-level JSON
//! envelopes (`record_to_value`, `session_row`) are byte-for-byte compatible
//! with the alpha-era S0 envelopes; the only added field is `handlerOwner`
//! on `list_result`, which legacy clients tolerate (additional property).

use serde_json::{json, Value};

use crate::session_store::{SessionRecord, SessionStore};

/// S3 handler-owner sentinel used by the live-gateway smoke test to prove
/// the session-runtime envelopes originate in S3 (and not in S0 server.rs).
pub const HANDLER_OWNER: &str = "S3.gateway.sessions";

pub fn record_to_value(record: &SessionRecord) -> Value {
    json!({
        "canonicalKey": record.canonical_key,
        "aliases": record.aliases,
        "label": record.label,
        "sessionId": record.session_id,
        "dayId": record.day_id,
        "spawnedBy": record.spawned_by,
        "parentSessionKey": record.parent_session_key,
        "sourceSessionKey": record.source_session_key,
        "sourceSessionKind": record.source_session_kind,
        "vaultNowPath": record.vault_now_path,
        "runtimeCwd": record.runtime_cwd,
        "vaultRoot": record.vault_root,
        "resourceLoaderId": record.resource_loader_id,
        "retrySettlementState": record.retry_settlement_state,
        "diagnostics": record.diagnostics,
        "deliveryContext": record.delivery_context,
        "channel": record.channel,
        "threadId": record.thread_id,
        "groupId": record.group_id,
        "groupChannel": record.group_channel,
        "groupSpace": record.group_space,
        "teamId": record.team_id,
        "teamRole": record.team_role,
        "orchestrationKind": record.orchestration_kind,
        "cmuxWorkspace": record.cmux_workspace,
        "cmuxSurface": record.cmux_surface,
        "cmuxPaneId": record.cmux_pane_id,
        "activeAgentId": record.active_agent_id,
        "subagentLineage": record.subagent_lineage,
        "workspaceRoot": record.workspace_root,
        "bootstrapScope": record.bootstrap_scope,
        "thinkingLevel": record.thinking_level,
        "verboseLevel": record.verbose_level,
        "reasoningLevel": record.reasoning_level,
        "modelOverride": record.model_override,
        "providerOverride": record.provider_override,
        "cliSessionIds": record.cli_session_ids,
        "vakAddress": record.vak_address,
        "updatedAtMs": record.updated_at_ms,
    })
}

pub fn list_result(store: &SessionStore) -> Result<Value, String> {
    let path = store
        .list()?
        .first()
        .map(|record| store.session_path(&record.canonical_key))
        .or_else(|| Some(store.session_path("session")))
        .unwrap()
        .parent()
        .unwrap()
        .display()
        .to_string();
    let sessions = store
        .list()?
        .into_iter()
        .map(|record| session_row(&record))
        .collect::<Vec<_>>();
    Ok(json!({
        "ts": current_time_ms()?,
        "path": path,
        "count": sessions.len(),
        "defaults": {
            "model": Value::Null,
            "contextTokens": Value::Null,
        },
        "sessions": sessions,
        "handlerOwner": HANDLER_OWNER,
    }))
}

pub fn session_row(record: &SessionRecord) -> Value {
    json!({
        "key": record.canonical_key,
        "sessionKey": record.canonical_key,
        "canonicalKey": record.canonical_key,
        "kind": "direct",
        "label": record.label,
        "displayName": record.label.clone().unwrap_or_else(|| record.canonical_key.clone()),
        "surface": "gateway",
        "updatedAt": record.updated_at_ms as u64,
        "sessionId": record.session_id,
        "recordSessionId": record.session_id,
        "dayId": record.day_id,
        "parentSessionKey": record.parent_session_key,
        "sourceSessionKey": record.source_session_key,
        "sourceSessionKind": record.source_session_kind,
        "runtimeCwd": record.runtime_cwd,
        "vaultRoot": record.vault_root,
        "resourceLoaderId": record.resource_loader_id,
        "retrySettlementState": record.retry_settlement_state,
        "diagnostics": record.diagnostics,
        "channel": record.channel,
        "threadId": record.thread_id,
        "spawnedBy": record.spawned_by,
        "vaultNowPath": record.vault_now_path,
        "teamId": record.team_id,
        "teamRole": record.team_role,
        "orchestrationKind": record.orchestration_kind,
        "cmuxWorkspace": record.cmux_workspace,
        "cmuxSurface": record.cmux_surface,
        "cmuxPaneId": record.cmux_pane_id,
        "thinkingLevel": record.thinking_level,
        "verboseLevel": record.verbose_level,
        "reasoningLevel": record.reasoning_level,
        "model": record.model_override,
        "provider": record.provider_override,
    })
}

fn current_time_ms() -> Result<u128, String> {
    Ok(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
