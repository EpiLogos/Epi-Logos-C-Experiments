//! Round-trip test for closing the D2/D3 CLI bridge gap: the TS tools
//! `anima_self_invoke` and `epii_invoke_anima` build the canonical
//! AnimaInvokeRequest payload via `buildAnimaInvokePayload` and shell out
//! to `epi gate dispatch anima-invoke` — this test exercises that CLI
//! subcommand end-to-end against a temp SessionStore, mirroring the
//! C1/C2 follow-up pattern at gate_sessions_patch_vak.rs.

mod support;

use epi_logos::gate::sessions::SessionStore;
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::Value;
use support::{run_epi, temp_env};

fn sample_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".to_owned()],
        cp: "CP4.4".to_owned(),
        cf: "(4.0/1-4.4/5)".to_owned(),
        cfp: "CFP0".to_owned(),
        cs: CsField {
            code: "CS0".to_owned(),
            direction: CsDirection::Day,
        },
    }
}

#[test]
fn cli_gate_dispatch_anima_invoke_patches_vak_and_queues_task() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");

    let session_id = "agent:anima:cli-test";

    // Pre-create the target session — same pattern as the C1 follow-up
    // test (gate_sessions_patch_vak.rs): we avoid standing up the full
    // gateway runtime by seeding the store directly.
    let store = SessionStore::new(&gate_root).expect("session store boots");
    let created = store.create(session_id).expect("create session record");
    assert!(
        created.vak_address.is_none(),
        "freshly created session has no VAK"
    );

    let vak = sample_vak();
    let payload = serde_json::json!({
        "target_session_key": session_id,
        "task": "evaluate VAK for X",
        "vak_address": vak,
    });

    let test_env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());
    let output = run_epi(
        &[
            "gate",
            "dispatch",
            "anima-invoke",
            "--payload-json",
            &payload.to_string(),
        ],
        &test_env,
    );
    assert!(
        output.status.success(),
        "CLI dispatch anima-invoke should succeed; stderr={}",
        output.stderr
    );

    let resp: Value =
        serde_json::from_str(output.stdout.trim()).expect("CLI emits valid response JSON");
    assert_eq!(
        resp.get("dispatched_to").and_then(Value::as_str),
        Some(session_id),
        "response echoes target_session_key"
    );
    assert_eq!(
        resp.get("task_queued").and_then(Value::as_bool),
        Some(true),
        "response confirms task queued"
    );

    // Verify the session VAK was patched by reading it back via
    // `gate sessions get` (the C2 follow-up subcommand).
    let get_out = run_epi(
        &["gate", "sessions", "get", "--session-id", session_id],
        &test_env,
    );
    assert!(
        get_out.status.success(),
        "sessions get round-trip should succeed; stderr={}",
        get_out.stderr
    );
    let record: Value =
        serde_json::from_str(get_out.stdout.trim()).expect("sessions get emits valid JSON");
    let vak_in_record = record
        .get("vakAddress")
        .expect("record carries vakAddress after dispatch");
    assert_eq!(
        vak_in_record.get("cf").and_then(Value::as_str),
        Some("(4.0/1-4.4/5)"),
        "cf literal preserved through CLI dispatch"
    );
    assert_eq!(
        vak_in_record
            .get("cs")
            .and_then(|v| v.get("direction"))
            .and_then(Value::as_str),
        Some("Day"),
        "cs.direction preserved through CLI dispatch"
    );

    // Transcript-append behaviour is independently covered by the in-process
    // test at Body/S/S3/gateway/tests/anima_invoke_contract.rs — here we only
    // assert the SessionStore observable side-effect (VAK patch) is visible
    // through the CLI surface, which is the D3 bridge's contract.
    let reloaded = SessionStore::new(&gate_root)
        .expect("store reopens")
        .resolve(session_id)
        .expect("reloaded session resolves");
    assert_eq!(
        reloaded.vak_address.as_ref(),
        Some(&vak),
        "CLI dispatch round-trips VAK to disk"
    );
}

#[test]
fn cli_gate_dispatch_anima_invoke_rejects_malformed_payload() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let test_env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let output = run_epi(
        &[
            "gate",
            "dispatch",
            "anima-invoke",
            "--payload-json",
            "{ this is not json",
        ],
        &test_env,
    );
    assert!(
        !output.status.success(),
        "malformed JSON should exit non-zero"
    );
    assert!(
        output.stderr.contains("invalid --payload-json"),
        "stderr should explain the parse failure; got: {}",
        output.stderr
    );
}

#[test]
fn cli_gate_dispatch_anima_invoke_rejects_unknown_session() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let test_env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    // Note: we deliberately do NOT create the target session in the store.
    let payload = serde_json::json!({
        "target_session_key": "agent:anima:nobody",
        "task": "x",
        "vak_address": sample_vak(),
    });

    let output = run_epi(
        &[
            "gate",
            "dispatch",
            "anima-invoke",
            "--payload-json",
            &payload.to_string(),
        ],
        &test_env,
    );
    assert!(
        !output.status.success(),
        "unknown target session should exit non-zero"
    );
    assert!(
        output.stderr.contains("route_anima_invoke failed"),
        "stderr should attribute the failure to route_anima_invoke; got: {}",
        output.stderr
    );
}
