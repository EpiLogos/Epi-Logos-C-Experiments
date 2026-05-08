mod support;

use epi_logos::gate::{bootstrap, sessions::SessionStore, workspace};
use serde_json::Value;
use support::temp_env;

#[test]
fn resolves_session_by_alias_without_losing_canonical_key() {
    let env = temp_env();
    let store = SessionStore::new(env.home.join(".epi").join("gate")).unwrap();
    let session = store.create("agent:main:main").unwrap();

    store
        .add_alias(&session.canonical_key, "NOW-2026-03-07-main")
        .unwrap();

    let resolved = store.resolve("NOW-2026-03-07-main").unwrap();

    assert_eq!(resolved.canonical_key, "agent:main:main");
    assert!(store.session_path("agent:main:main").exists());
}

#[test]
fn persists_active_agent_lineage_workspace_and_bootstrap_scope() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let session = store.create("agent:pi:subagent:research").unwrap();

    store
        .set_label(&session.canonical_key, Some("Main Session"))
        .unwrap();
    store
        .set_active_agent(&session.canonical_key, "pi.research")
        .unwrap();
    store
        .set_subagent_lineage(
            &session.canonical_key,
            vec!["vak.primary".to_owned(), "pi.research".to_owned()],
        )
        .unwrap();
    store
        .patch(
            &session.canonical_key,
            epi_logos::gate::sessions::SessionPatch {
                spawned_by: Some(Some("agent:root:main".to_owned())),
                parent_session_key: Some(Some("agent:root:main".to_owned())),
                source_session_key: Some(Some("agent:source:main".to_owned())),
                source_session_kind: Some(Some("fork".to_owned())),
                runtime_cwd: Some(Some("/repo".to_owned())),
                vault_root: Some(Some("/vault".to_owned())),
                resource_loader_id: Some(Some("loader-1".to_owned())),
                retry_settlement_state: Some(Some("idle-after-retry".to_owned())),
                diagnostics: Some(vec![serde_json::json!({
                    "severity": "warning",
                    "message": "resource loaded from compatibility path"
                })]),
                vault_now_path: Some(Some("/vault/Present/11-03-2026/now.md".to_owned())),
                channel: Some(Some("telegram".to_owned())),
                thread_id: Some(Some("thread-1".to_owned())),
                model_override: Some(Some("claude-sonnet".to_owned())),
                provider_override: Some(Some("anthropic".to_owned())),
                cli_session_ids: Some(vec!["cli-1".to_owned()]),
                ..Default::default()
            },
        )
        .unwrap();

    let resolved = store.resolve("Main Session").unwrap();

    assert!(!resolved.session_id.is_empty());
    assert_eq!(resolved.active_agent_id, "pi.research");
    assert_eq!(
        resolved.subagent_lineage,
        vec!["vak.primary".to_owned(), "pi.research".to_owned()]
    );
    assert_eq!(resolved.spawned_by.as_deref(), Some("agent:root:main"));
    assert_eq!(
        resolved.parent_session_key.as_deref(),
        Some("agent:root:main")
    );
    assert_eq!(
        resolved.source_session_key.as_deref(),
        Some("agent:source:main")
    );
    assert_eq!(resolved.source_session_kind.as_deref(), Some("fork"));
    assert_eq!(resolved.runtime_cwd.as_deref(), Some("/repo"));
    assert_eq!(resolved.vault_root.as_deref(), Some("/vault"));
    assert_eq!(resolved.resource_loader_id.as_deref(), Some("loader-1"));
    assert_eq!(
        resolved.retry_settlement_state.as_deref(),
        Some("idle-after-retry")
    );
    assert_eq!(resolved.diagnostics.len(), 1);
    assert_eq!(
        resolved.vault_now_path.as_deref(),
        Some("/vault/Present/11-03-2026/now.md")
    );
    assert_eq!(resolved.channel.as_deref(), Some("telegram"));
    assert_eq!(resolved.thread_id.as_deref(), Some("thread-1"));
    assert_eq!(resolved.model_override.as_deref(), Some("claude-sonnet"));
    assert_eq!(resolved.provider_override.as_deref(), Some("anthropic"));
    assert_eq!(resolved.cli_session_ids, vec!["cli-1".to_owned()]);
    assert_eq!(
        resolved.workspace_root,
        workspace::derive_workspace_root(
            &gate_root,
            &resolved.canonical_key,
            &resolved.subagent_lineage
        )
        .display()
        .to_string()
    );
    assert_eq!(
        resolved.bootstrap_scope,
        bootstrap::derive_bootstrap_scope(
            &gate_root,
            &resolved.canonical_key,
            &resolved.subagent_lineage
        )
        .display()
        .to_string()
    );
}

#[test]
fn session_rows_expose_canonical_session_identity_for_portal_clients() {
    let env = temp_env();
    let store = SessionStore::new(env.home.join(".epi").join("gate")).unwrap();
    let session = store.create("agent:main:main").unwrap();

    let row = epi_logos::gate::sessions::session_row(&session);

    assert_eq!(
        row.get("key").and_then(Value::as_str),
        Some("agent:main:main")
    );
    assert_eq!(
        row.get("sessionKey").and_then(Value::as_str),
        Some("agent:main:main")
    );
    assert_eq!(
        row.get("canonicalKey").and_then(Value::as_str),
        Some("agent:main:main")
    );
    assert_eq!(
        row.get("recordSessionId").and_then(Value::as_str),
        Some(session.session_id.as_str())
    );
}

#[test]
fn legacy_session_rows_with_key_and_product_labels_are_migrated_on_read() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let sessions_dir = gate_root.join("sessions");
    std::fs::write(
        sessions_dir.join("legacy_main.json"),
        serde_json::json!({
            "key": "agent:legacy:main",
            "displayName": "Legacy NOW Label",
            "aliases": ["NOW-2026-05-07-legacy"],
            "activeAgentId": "pi.legacy",
            "subagentLineage": ["anima", "pi.legacy"],
            "runtimeCwd": "/old/runtime",
            "vaultRoot": "/old/vault",
            "updatedAtMs": 42
        })
        .to_string(),
    )
    .unwrap();

    let resolved = store.resolve("NOW-2026-05-07-legacy").unwrap();

    assert_eq!(resolved.canonical_key, "agent:legacy:main");
    assert_eq!(resolved.label.as_deref(), Some("Legacy NOW Label"));
    assert!(!resolved.session_id.is_empty());
    assert_eq!(resolved.active_agent_id, "pi.legacy");
    assert_eq!(
        resolved.subagent_lineage,
        vec!["anima".to_owned(), "pi.legacy".to_owned()]
    );
    assert_eq!(resolved.runtime_cwd.as_deref(), Some("/old/runtime"));
    assert_eq!(resolved.vault_root.as_deref(), Some("/old/vault"));
    assert_eq!(resolved.updated_at_ms, 42);
    assert_eq!(
        resolved.workspace_root,
        workspace::derive_workspace_root(
            &gate_root,
            &resolved.canonical_key,
            &resolved.subagent_lineage
        )
        .display()
        .to_string()
    );
    assert_eq!(
        resolved.bootstrap_scope,
        bootstrap::derive_bootstrap_scope(
            &gate_root,
            &resolved.canonical_key,
            &resolved.subagent_lineage
        )
        .display()
        .to_string()
    );
}
