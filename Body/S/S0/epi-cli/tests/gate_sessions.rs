mod support;

use epi_logos::gate::{bootstrap, sessions::SessionStore, workspace};
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
