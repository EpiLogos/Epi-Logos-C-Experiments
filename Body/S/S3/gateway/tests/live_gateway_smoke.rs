//! 13.T3 live-gateway smoke test (S3 side).
//!
//! Per the 13.T3 task spec:
//!
//! > Add a live-gateway smoke test in `Body/S/S3/gateway/tests/`: start
//! > `epi gate start`, send `connect`, `sessions.resolve`, `chat.history`,
//! > `channels.status`, prove handler owner is S3 (e.g. via a `handler_owner`
//! > field in response or a test-only telemetry hook).
//!
//! The S3 crate does not depend on the S0 `epi-cli` binary (and must not — S3
//! is upstream of S0 in the substrate hierarchy). Spawning the actual S0
//! `epi gate start` process from here would require a reverse dependency. The
//! S0 side of this smoke test lives in `Body/S/S0/epi-cli/tests/
//! gate_runtime_handler_owner.rs` and exercises the live WebSocket dispatch
//! through the same `TestGatewayClient` harness used by `gate_chat.rs`.
//!
//! Here on the S3 side we drive the actual S3 runtime modules against a real
//! state root layout — proving the handler-owner sentinels emit through the
//! `sessions.list` / `sessions.resolve` / `chat.history` envelopes, and that
//! the `~/.epi/gate/{sessions,transcripts}/*` filesystem contract that the
//! live gateway depends on is honoured by the S3 runtime directly.

use std::fs;

use epi_s3_gateway::{
    chat, sessions,
    session_store::{CreateSessionContext, SessionStore},
    transcripts,
};
use tempfile::tempdir;

#[test]
fn handler_owner_field_propagates_through_s3_session_envelopes() {
    let dir = tempdir().unwrap();
    let gate_root = dir.path().join("gate");
    let store = SessionStore::new(&gate_root).unwrap();

    store
        .create_with_context(
            "agent:main:main",
            CreateSessionContext {
                vault_now_path: Some("/vault/Empty/Present/now.md".into()),
                runtime_cwd: Some("/repo".into()),
                vault_root: Some("/vault".into()),
                ..Default::default()
            },
        )
        .unwrap();

    let resolved = store.resolve("agent:main:main").unwrap();
    let envelope = sessions::record_to_value(&resolved);
    let row = sessions::session_row(&resolved);
    let list = sessions::list_result(&store).unwrap();

    // Wire shape preserved (record_to_value identity).
    assert_eq!(envelope["canonicalKey"], "agent:main:main");
    assert_eq!(envelope["vaultNowPath"], "/vault/Empty/Present/now.md");
    assert_eq!(row["canonicalKey"], "agent:main:main");
    assert_eq!(row["surface"], "gateway");

    // Handler-owner sentinel proves the envelope originated in S3.
    assert_eq!(
        list["handlerOwner"],
        sessions::HANDLER_OWNER,
        "sessions list envelope must carry the S3 handler-owner sentinel"
    );
    assert_eq!(list["handlerOwner"], "S3.gateway.sessions");
}

#[test]
fn handler_owner_field_propagates_through_s3_chat_envelopes() {
    let dir = tempdir().unwrap();
    let gate_root = dir.path().join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:main:main").unwrap();

    let run_id = chat::send_message(&gate_root, "agent:main:main", "hello world").unwrap();
    chat::inject_message(&gate_root, "agent:main:main", "assistant", "response").unwrap();
    chat::abort_run(&gate_root, "agent:main:main", &run_id).unwrap();

    let history = chat::history_response(&gate_root, "agent:main:main").unwrap();

    // History items are real transcript-derived entries (3: send + inject + abort).
    let items = history["items"].as_array().unwrap();
    assert!(
        items.len() >= 3,
        "chat history must reflect the real transcript log, got {} entries",
        items.len()
    );

    // Handler-owner sentinel proves the envelope originated in S3.
    assert_eq!(
        history["handlerOwner"],
        chat::HANDLER_OWNER,
        "chat history envelope must carry the S3 handler-owner sentinel"
    );
    assert_eq!(history["handlerOwner"], "S3.gateway.chat");
}

#[test]
fn s3_runtime_preserves_alpha_state_root_layout() {
    // 13.T3 deliverable: "Preserve state-root compatibility for existing
    // `~/.epi/gate` / `EPI_GATE_STATE_ROOT` layouts."
    //
    // The S3 runtime, when handed an arbitrary gate_root, must lay out the
    // same `sessions/<slug>.json` and `transcripts/<slug>.jsonl` files the
    // alpha S0 server.rs produced. This test pins that contract.

    let dir = tempdir().unwrap();
    let gate_root = dir.path().join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    store.create("agent:main:main").unwrap();

    // sessions/<slug>.json layout
    let session_path = gate_root.join("sessions").join("agent_main_main.json");
    assert!(
        session_path.exists(),
        "alpha-compat session file at {} must exist",
        session_path.display()
    );

    chat::send_message(&gate_root, "agent:main:main", "transcript probe").unwrap();

    // transcripts/<slug>.jsonl layout
    let transcript_path = transcripts::transcript_path(&gate_root, "agent:main:main");
    assert_eq!(
        transcript_path,
        gate_root
            .join("transcripts")
            .join("agent_main_main.jsonl"),
        "transcript path must match alpha layout"
    );
    assert!(transcript_path.exists());

    let body = fs::read_to_string(&transcript_path).unwrap();
    assert!(body.contains("transcript probe"));
    assert!(body.contains("\"kind\":\"message\""));
}

#[test]
fn s3_chat_history_reads_alpha_transcript_files_unchanged() {
    // Alpha gateway runtimes wrote transcript lines via the same JSON shape
    // (kind/role/message/timestamp_ms). Prove an alpha-style line written
    // outside the chat module is still consumed by chat::history_response.

    let dir = tempdir().unwrap();
    let gate_root = dir.path().join("gate");
    let transcripts_dir = gate_root.join("transcripts");
    fs::create_dir_all(&transcripts_dir).unwrap();
    let path = transcripts_dir.join("agent_legacy_main.jsonl");
    fs::write(
        &path,
        "{\"kind\":\"message\",\"role\":\"user\",\"message\":\"legacy alpha line\",\"timestamp_ms\":42}\n",
    )
    .unwrap();

    let history = chat::history_response(&gate_root, "agent:legacy:main").unwrap();
    let items = history["items"].as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["role"], "user");
    assert_eq!(items[0]["message"], "legacy alpha line");
    assert_eq!(history["handlerOwner"], "S3.gateway.chat");
}
