mod support;

use epi_logos::gate::sessions::{SessionPatch, SessionStore};
use epi_logos::portal::runtime_state::{PortalRuntimeState, PortalTemporalSource};
use epi_s3_gateway_contract::{
    TerminalBinding, TerminalCaptureMode, TerminalCapturePolicy, TerminalLease, TerminalStatus,
};
use serde_json::json;
use support::temp_env;

#[test]
fn portal_temporal_surface_hydrates_terminal_status_from_gateway_context() {
    let payload = json!({
        "day": { "dayId": "07-05-2026" },
        "now": {
            "path": "/vault/Empty/Present/07-05-2026/session-main/now.md",
            "wikilink": "[[NOW session-main]]"
        },
        "session": {
            "canonicalKey": "agent:anima:main",
            "sessionId": "session-main",
            "activeAgentId": "anima"
        },
        "redis": {
            "hydrated": true,
            "sessionNowKey": "cache:hot:s3:gateway:temporal:session:session-main:now:md",
            "terminalMetadataKey": "cache:hot:s3:gateway:temporal:session:session-main:terminal:metadata"
        },
        "terminal": {
            "terminalBacked": true,
            "provider": "tmux",
            "status": "attached",
            "leaseExpiresAtMs": 1785000000000u64,
            "captureHandleRef": "s3:gateway:temporal:session:session-main:terminal:capture-handle",
            "capturePolicy": {
                "mode": "metadataOnly",
                "redactionPolicy": "metadata-only"
            },
            "rawPaneBodyIncluded": false
        },
        "kairos": { "available": false, "fresh": false, "source": "nara.kairos.current" },
        "pratibimba": { "anchorId": null, "coordinate": "M4.4.4.4" },
        "kernel": { "generation": 3, "tick": { "subTick": 2 } }
    });

    let runtime = PortalRuntimeState::from_gateway_context_value(payload).unwrap();
    let temporal = runtime.temporal();
    let temporal = temporal.lock().unwrap();

    assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
    assert!(temporal.terminal_backed);
    assert_eq!(temporal.terminal_provider.as_deref(), Some("tmux"));
    assert_eq!(temporal.terminal_status.as_deref(), Some("attached"));
    assert_eq!(
        temporal.terminal_lease_expires_at_ms,
        Some(1_785_000_000_000)
    );
    assert_eq!(
        temporal.terminal_capture_policy_mode.as_deref(),
        Some("metadataOnly")
    );
    assert_eq!(
        temporal.terminal_capture_handle_ref.as_deref(),
        Some("s3:gateway:temporal:session:session-main:terminal:capture-handle")
    );
    assert_eq!(
        temporal.terminal_metadata_key.as_deref(),
        Some("cache:hot:s3:gateway:temporal:session:session-main:terminal:metadata")
    );
}

#[test]
fn portal_runtime_refreshes_terminal_status_from_session_store_context() {
    let env = temp_env();
    let _guard = env.apply_to_process();
    let vault = env.repo_root.join("Idea");
    let now_path = vault
        .join("Empty")
        .join("Present")
        .join("07-05-2026")
        .join("session-terminal-main")
        .join("now.md");
    std::fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    std::fs::write(&now_path, "# NOW\n\nTerminal-backed runtime state.\n").unwrap();

    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let record = store.create("agent:anima:terminal").unwrap();
    store
        .patch(
            &record.canonical_key,
            SessionPatch {
                vault_now_path: Some(Some(now_path.display().to_string())),
                active_agent_id: Some("anima".to_owned()),
                terminal_binding: Some(Some(TerminalBinding {
                    terminal_identifier: Some("tmux:session-terminal-main:%9".to_owned()),
                    session_anchor: Some("session-terminal-main".to_owned()),
                    tmux_pane_id: Some("%9".to_owned()),
                    attached_session_key: Some("agent:anima:terminal".to_owned()),
                    terminal_status: Some(TerminalStatus::Attached),
                    lease: Some(TerminalLease {
                        lease_owner: Some("pi.anima".to_owned()),
                        lease_purpose: Some("interactive-session".to_owned()),
                        lease_expires_at_ms: Some(1_785_000_000_000),
                    }),
                    capture_policy: Some(TerminalCapturePolicy {
                        mode: TerminalCaptureMode::MetadataOnly,
                        max_lines: None,
                        redaction_policy: None,
                    }),
                })),
                ..Default::default()
            },
        )
        .unwrap();

    let runtime = PortalRuntimeState::new();
    let refreshed = runtime
        .refresh_from_session_store_context(&gate_root, "agent:anima:terminal", "anima")
        .unwrap();
    let temporal = runtime.temporal();
    let temporal = temporal.lock().unwrap();

    assert!(refreshed);
    assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
    assert!(temporal.terminal_backed);
    assert_eq!(temporal.terminal_provider.as_deref(), Some("tmux"));
    assert_eq!(temporal.terminal_status.as_deref(), Some("attached"));
    assert_eq!(
        temporal.terminal_metadata_key.as_deref(),
        Some("cache:hot:s3:gateway:temporal:session:session-terminal-main:terminal:metadata")
    );
    assert_eq!(
        temporal.terminal_capture_handle_ref.as_deref(),
        Some("s3:gateway:temporal:session:session-terminal-main:terminal:capture-handle")
    );
}

#[test]
fn portal_surface_reads_spacetimedb_projection_terminal_status_fragment() {
    let payload = json!({
        "day": { "dayId": "07-05-2026" },
        "now": { "wikilink": "[[NOW session-main]]" },
        "session": {
            "canonicalKey": "agent:anima:main",
            "sessionId": "session-main",
            "activeAgentId": "anima"
        },
        "redis": {
            "hydrated": true,
            "sessionNowKey": "s3:gateway:temporal:session:session-main:now:md"
        },
        "spacetimedb": {
            "projectionSource": "http-sql-poll",
            "projectionTable": "session_surface",
            "globalProjectionTable": "global_temporal_surface"
        },
        "globalTemporal": {
            "projectionTable": "global_temporal_surface",
            "terminal": {
                "terminalBacked": true,
                "provider": "tmux",
                "status": "detached",
                "leaseExpiresAtMs": 1785000000000u64,
                "captureHandleRef": "s3:gateway:temporal:session:session-main:terminal:capture-handle",
                "capturePolicy": { "mode": "metadataOnly" },
                "rawPaneBodyIncluded": false
            }
        },
        "kairos": { "available": true, "fresh": true, "source": "nara.kairos.current" },
        "pratibimba": { "anchorId": "pratibimba-abcd1234", "coordinate": "M4.4.4.4" },
        "kernel": { "generation": 4, "tick": { "subTick": 1 } }
    });

    let runtime = PortalRuntimeState::from_gateway_context_value(payload).unwrap();
    let temporal = runtime.temporal();
    let temporal = temporal.lock().unwrap();

    assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
    assert_eq!(
        temporal.spacetimedb_projection_source.as_deref(),
        Some("http-sql-poll")
    );
    assert!(temporal.terminal_backed);
    assert_eq!(temporal.terminal_provider.as_deref(), Some("tmux"));
    assert_eq!(temporal.terminal_status.as_deref(), Some("detached"));
    assert_eq!(
        temporal.terminal_capture_policy_mode.as_deref(),
        Some("metadataOnly")
    );
    assert_eq!(
        temporal.terminal_capture_handle_ref.as_deref(),
        Some("s3:gateway:temporal:session:session-main:terminal:capture-handle")
    );
}
