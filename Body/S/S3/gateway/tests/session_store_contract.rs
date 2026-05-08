use epi_s3_gateway::{CreateSessionContext, SessionStore};
use epi_s3_gateway_contract::SessionPatch;

fn temp_gate_root(name: &str) -> std::path::PathBuf {
    let mut root = std::env::temp_dir();
    root.push(format!("epi-s3-gateway-{name}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).unwrap();
    }
    root
}

#[test]
fn creates_sessions_with_runtime_context_supplied_by_pi_adapter() {
    let gate_root = temp_gate_root("context");
    let store = SessionStore::new(&gate_root).unwrap();

    let record = store
        .create_with_context(
            "agent:epii:main",
            CreateSessionContext {
                session_id: Some("NOW-20260508-101500-epii".to_owned()),
                day_id: Some("2026-05-08".to_owned()),
                vault_now_path: Some(
                    "/vault/Empty/Present/08-05-2026/20260508-101500-epii/now.md".to_owned(),
                ),
                runtime_cwd: Some("/repo".to_owned()),
                vault_root: Some("/vault".to_owned()),
            },
        )
        .unwrap();

    assert_eq!(record.canonical_key, "agent:epii:main");
    assert_eq!(record.session_id, "NOW-20260508-101500-epii");
    assert_eq!(record.day_id.as_deref(), Some("2026-05-08"));
    assert_eq!(record.runtime_cwd.as_deref(), Some("/repo"));
    assert_eq!(record.vault_root.as_deref(), Some("/vault"));
    assert!(store.session_path("agent:epii:main").exists());
}

#[test]
fn resolves_legacy_omnipanel_rows_and_preserves_gateway_paths() {
    let gate_root = temp_gate_root("legacy");
    let store = SessionStore::new(&gate_root).unwrap();
    std::fs::write(
        gate_root.join("sessions").join("legacy_main.json"),
        serde_json::json!({
            "key": "agent:legacy:main",
            "displayName": "Legacy NOW Label",
            "aliases": ["NOW-2026-05-08-legacy"],
            "activeAgentId": "pi.legacy",
            "subagentLineage": ["anima", "pi.legacy"],
            "runtimeCwd": "/old/runtime",
            "vaultRoot": "/old/vault",
            "updatedAtMs": 42
        })
        .to_string(),
    )
    .unwrap();

    let resolved = store.resolve("NOW-2026-05-08-legacy").unwrap();

    assert_eq!(resolved.canonical_key, "agent:legacy:main");
    assert_eq!(resolved.label.as_deref(), Some("Legacy NOW Label"));
    assert_eq!(resolved.active_agent_id, "pi.legacy");
    assert_eq!(resolved.runtime_cwd.as_deref(), Some("/old/runtime"));
    assert_eq!(resolved.vault_root.as_deref(), Some("/old/vault"));
    assert!(resolved
        .workspace_root
        .ends_with("agent_legacy_main/anima__pi_legacy"));
    assert!(resolved
        .bootstrap_scope
        .ends_with("agent_legacy_main/anima__pi_legacy"));
}

#[test]
fn patches_subagent_authority_and_transcript_path_without_cli_runtime() {
    let gate_root = temp_gate_root("patch");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:root:main").unwrap();
    store.create("agent:epii:subagent:research").unwrap();

    let patched = store
        .patch(
            "agent:epii:subagent:research",
            SessionPatch {
                spawned_by: Some(Some("agent:root:main".to_owned())),
                aliases: Some(vec!["NOW-research".to_owned()]),
                label: Some(Some("Research Session".to_owned())),
                subagent_lineage: Some(vec!["epii".to_owned(), "research".to_owned()]),
                ..SessionPatch::default()
            },
        )
        .unwrap();

    assert_eq!(patched.spawned_by.as_deref(), Some("agent:root:main"));
    assert_eq!(
        store.resolve("NOW-research").unwrap().canonical_key,
        "agent:epii:subagent:research"
    );
    assert_eq!(
        store.transcript_path("agent:epii:subagent:research"),
        gate_root
            .join("transcripts")
            .join("agent_epii_subagent_research.jsonl")
    );
}
