use epi_s3_gateway::{CreateSessionContext, SessionStore};
use epi_s3_gateway_contract::{
    SessionPatch, TerminalBinding, TerminalCaptureMode, TerminalCapturePolicy, TerminalLease,
    TerminalStatus,
};

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

#[test]
fn session_store_round_trips_vak_address() {
    use epi_s3_gateway::SessionStore;
    use epi_s3_gateway_contract::SessionPatch;
    use portal_core::{CpfState, CsDirection, CsField, VakAddress};

    let tmp = tempfile::tempdir().expect("tempdir");
    let store = SessionStore::new(tmp.path()).expect("create store");
    let key = "agent:vak-test:main";
    let _ = store.create(key).expect("create session");

    // Initially no vak_address.
    let initial = store.resolve(key).expect("load initial");
    assert!(
        initial.vak_address.is_none(),
        "fresh session has no VAK yet"
    );

    // Patch with a VAK address.
    let addr = VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT2".into()],
        cp: "CP4.2".into(),
        cf: "(0/1)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Day,
            recognized: false,
        },
    };
    let patch = SessionPatch {
        vak_address: Some(addr.clone()),
        ..SessionPatch::default()
    };
    store.patch(key, patch).expect("patch with VAK");

    // Load and confirm round-trip.
    let loaded = store.resolve(key).expect("load after patch");
    assert_eq!(loaded.vak_address.as_ref(), Some(&addr));
    assert_eq!(loaded.vak_address.as_ref().unwrap().cf, "(0/1)");
    assert_eq!(loaded.vak_address.as_ref().unwrap().cs.code, "CS1");
    assert_eq!(
        loaded.vak_address.as_ref().unwrap().cs.direction,
        CsDirection::Day
    );

    // Patch with None should NOT clear (semantics: Some(addr) sets, None means "no update").
    let null_patch = SessionPatch::default();
    store.patch(key, null_patch).expect("null patch");
    let still_loaded = store.resolve(key).expect("load after null patch");
    assert_eq!(
        still_loaded.vak_address.as_ref(),
        Some(&addr),
        "null patch must not clear"
    );
}

#[test]
fn session_store_persists_and_reloads_terminal_binding() {
    let gate_root = temp_gate_root("terminal-binding");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:main:main").unwrap();

    let binding = TerminalBinding {
        terminal_identifier: Some("terminal:main".to_owned()),
        session_anchor: Some("agent:main:main".to_owned()),
        tmux_pane_id: Some("%12".to_owned()),
        attached_session_key: Some("agent:main:main".to_owned()),
        terminal_status: Some(TerminalStatus::Attached),
        lease: Some(TerminalLease {
            lease_owner: Some("operator".to_owned()),
            lease_purpose: Some("interactive-session".to_owned()),
            lease_expires_at_ms: Some(4_102_444_800_000),
        }),
        capture_policy: Some(TerminalCapturePolicy {
            mode: TerminalCaptureMode::Transcript,
            max_lines: Some(500),
            redaction_policy: Some("secrets-and-pii".to_owned()),
        }),
    };

    store
        .patch(
            "agent:main:main",
            SessionPatch {
                terminal_binding: Some(Some(binding.clone())),
                ..SessionPatch::default()
            },
        )
        .unwrap();

    let reloaded = SessionStore::new(&gate_root)
        .unwrap()
        .resolve("agent:main:main")
        .unwrap();
    assert_eq!(reloaded.terminal_binding.as_ref(), Some(&binding));

    let row = epi_s3_gateway::sessions::session_row(&reloaded);
    assert_eq!(
        row["terminalBinding"]["terminalIdentifier"],
        "terminal:main"
    );
    assert_eq!(row["terminalBinding"]["sessionAnchor"], "agent:main:main");
}

#[test]
fn terminal_binding_patch_refuses_active_authority_without_matching_session_anchor() {
    let gate_root = temp_gate_root("terminal-binding-refusal");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:main:main").unwrap();

    let error = store
        .patch(
            "agent:main:main",
            SessionPatch {
                terminal_binding: Some(Some(TerminalBinding {
                    terminal_identifier: Some("terminal:main".to_owned()),
                    session_anchor: Some("agent:main:main".to_owned()),
                    tmux_pane_id: Some("%12".to_owned()),
                    attached_session_key: Some("agent:other:main".to_owned()),
                    terminal_status: Some(TerminalStatus::Attached),
                    ..TerminalBinding::default()
                })),
                ..SessionPatch::default()
            },
        )
        .unwrap_err();

    assert!(error.contains("attachedSessionKey"));
}

#[test]
fn terminal_binding_capture_requires_policy_and_live_lease() {
    let gate_root = temp_gate_root("terminal-binding-capture");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:main:main").unwrap();

    let missing_policy = store
        .patch(
            "agent:main:main",
            SessionPatch {
                terminal_binding: Some(Some(TerminalBinding {
                    terminal_identifier: Some("terminal:main".to_owned()),
                    session_anchor: Some("agent:main:main".to_owned()),
                    attached_session_key: Some("agent:main:main".to_owned()),
                    terminal_status: Some(TerminalStatus::Attached),
                    lease: Some(TerminalLease {
                        lease_owner: Some("operator".to_owned()),
                        lease_purpose: Some("interactive-session".to_owned()),
                        lease_expires_at_ms: Some(4_102_444_800_000),
                    }),
                    capture_policy: Some(TerminalCapturePolicy {
                        mode: TerminalCaptureMode::Stream,
                        max_lines: None,
                        redaction_policy: None,
                    }),
                    ..TerminalBinding::default()
                })),
                ..SessionPatch::default()
            },
        )
        .unwrap_err();
    assert!(missing_policy.contains("capturePolicy.maxLines"));

    let expired_lease = store
        .patch(
            "agent:main:main",
            SessionPatch {
                terminal_binding: Some(Some(TerminalBinding {
                    terminal_identifier: Some("terminal:main".to_owned()),
                    session_anchor: Some("agent:main:main".to_owned()),
                    attached_session_key: Some("agent:main:main".to_owned()),
                    terminal_status: Some(TerminalStatus::Attached),
                    lease: Some(TerminalLease {
                        lease_owner: Some("operator".to_owned()),
                        lease_purpose: Some("interactive-session".to_owned()),
                        lease_expires_at_ms: Some(1),
                    }),
                    capture_policy: Some(TerminalCapturePolicy {
                        mode: TerminalCaptureMode::Stream,
                        max_lines: Some(100),
                        redaction_policy: Some("secrets-and-pii".to_owned()),
                    }),
                    ..TerminalBinding::default()
                })),
                ..SessionPatch::default()
            },
        )
        .unwrap_err();
    assert!(expired_lease.contains("non-expired lease"));
}

#[test]
fn session_state_cache_key_uses_the_s3_tiered_runtime_key_for_read_and_write() {
    let key = SessionStore::cached_session_state_key("20260608-120000-main");

    assert_eq!(
        key.as_str(),
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:state"
    );
    assert_eq!(
        key.logical_key(),
        "s3:gateway:temporal:session:20260608-120000-main:state"
    );
}

#[test]
fn session_record_runtime_cache_plan_covers_active_hot_and_warm_layers() {
    let gate_root = temp_gate_root("runtime-cache-plan");
    let store = SessionStore::new(&gate_root).unwrap();
    let record = store
        .create_with_context(
            "agent:main:main",
            CreateSessionContext {
                session_id: Some("20260608-120000-main".to_owned()),
                day_id: Some("08-06-2026".to_owned()),
                vault_now_path: Some(
                    "/vault/Empty/Present/08-06-2026/20260608-120000-main/now.md".to_owned(),
                ),
                runtime_cwd: Some("/repo".to_owned()),
                vault_root: Some("/vault".to_owned()),
            },
        )
        .unwrap();

    let writes = SessionStore::runtime_cache_writes_for_record(&record).unwrap();
    let keys = writes
        .iter()
        .map(|write| write.key.as_str())
        .collect::<Vec<_>>();

    assert!(keys.contains(&"cache:active:s3:gateway:session:record:agent:main:main"));
    assert!(keys.contains(&"cache:hot:s3:gateway:temporal:session:20260608-120000-main:state"));
    assert!(keys.contains(&"cache:warm:s3:gateway:temporal:day:08-06-2026:context"));
    assert!(writes
        .iter()
        .any(|write| write.value.contains("\"canonical_key\"")));
}
