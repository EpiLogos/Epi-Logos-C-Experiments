use serde_json::{json, Value};

pub use super::session_store::{SessionPatch, SessionRecord, SessionStore};

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
