//! Round-trip test for closing the gateway-record-echo gap (Task C1
//! follow-up): sessions.patch JSON-RPC + `epi gate sessions patch` CLI must
//! both persist `vak_address` on the SessionRecord and return it on
//! `sessions.resolve`.

mod support;

use epi_logos::gate::sessions::SessionStore;
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::{json, Value};
use support::{run_epi, temp_env, TestGatewayClient};

fn sample_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["T0".to_owned()],
        cp: "P1".to_owned(),
        cf: "(0/1)".to_owned(),
        cfp: "(0/1)".to_owned(),
        cs: CsField {
            code: "CS1".to_owned(),
            direction: CsDirection::Day,
        },
    }
}

#[tokio::test]
async fn sessions_patch_rpc_persists_vak_address_round_trip() {
    let mut client = TestGatewayClient::connected_with_temp_store(18901).await;

    // Seed the session via the gateway agent flow (the same path Khora uses
    // before it would emit a vak_address patch).
    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey": "agent:main:main",
                "message": "seed session for vak patch",
                "idempotencyKey": "gate-sessions-patch-vak-seed",
            }),
        )
        .await
        .expect("seed agent call should succeed");
    let run_id = accepted["runId"].as_str().unwrap().to_owned();
    client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("seed agent wait should succeed");

    // Initially, the resolved record should have no vak_address.
    let initial: Value = client
        .request("sessions.resolve", json!({ "sessionKey": "agent:main:main" }))
        .await
        .expect("initial resolve should succeed");
    assert!(
        initial.get("vakAddress").map(|v| v.is_null()).unwrap_or(true),
        "fresh session should have null vakAddress, got: {initial}"
    );

    // Patch with a compose-phase VAK.
    let vak = sample_vak();
    let vak_json = serde_json::to_value(&vak).expect("vak serialises");
    let patched: Value = client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "vakAddress": vak_json,
            }),
        )
        .await
        .expect("sessions.patch should accept vakAddress");

    let record = patched
        .get("record")
        .expect("patch response includes record");
    let vak_in_record = record
        .get("vakAddress")
        .expect("record carries vakAddress");
    assert!(
        !vak_in_record.is_null(),
        "vakAddress should not be null after patch"
    );
    assert_eq!(
        vak_in_record.get("cf").and_then(Value::as_str),
        Some("(0/1)"),
        "cf literal preserved through patch"
    );
    assert_eq!(
        vak_in_record
            .get("cs")
            .and_then(|v| v.get("direction"))
            .and_then(Value::as_str),
        Some("Day"),
        "cs.direction preserved through patch"
    );

    // Re-resolve to confirm persistence. sessions.resolve returns the
    // record fields flat (with `runState` merged in) — not wrapped in
    // `record`, which is the sessions.patch envelope.
    let resolved: Value = client
        .request("sessions.resolve", json!({ "sessionKey": "agent:main:main" }))
        .await
        .expect("post-patch resolve should succeed");
    let vak_resolved = resolved
        .get("vakAddress")
        .expect("resolve surfaces vakAddress");
    assert!(
        !vak_resolved.is_null(),
        "vakAddress survives resolve round-trip"
    );
    assert_eq!(
        vak_resolved.get("cf").and_then(Value::as_str),
        Some("(0/1)"),
        "resolve preserves canonical cf literal"
    );
}

#[test]
fn cli_gate_sessions_patch_persists_vak_address() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");

    // Pre-create the session record directly via SessionStore — equivalent
    // to the gateway runtime creating it on first agent request, but avoids
    // standing up the full gateway in this CLI-pathway test.
    let store = SessionStore::new(&gate_root).expect("session store boots");
    let created = store
        .create("agent:main:main")
        .expect("create session record");
    assert!(
        created.vak_address.is_none(),
        "freshly created session has no VAK"
    );

    let vak = sample_vak();
    let vak_json = serde_json::to_string(&vak).expect("vak serialises");

    // Invoke `epi gate sessions patch` against the same state root.
    let test_env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());
    let output = run_epi(
        &[
            "--json",
            "gate",
            "sessions",
            "patch",
            "--session-id",
            "agent:main:main",
            "--vak-address-json",
            &vak_json,
        ],
        &test_env,
    );
    assert!(
        output.status.success(),
        "CLI patch succeeded; stderr={}",
        output.stderr
    );

    // Stdout should be the rendered record JSON with vakAddress populated.
    let value: Value =
        serde_json::from_str(output.stdout.trim()).expect("CLI emits valid JSON record");
    let vak_in_value = value
        .get("vakAddress")
        .expect("CLI record carries vakAddress");
    assert_eq!(
        vak_in_value.get("cf").and_then(Value::as_str),
        Some("(0/1)"),
        "CLI patch preserves cf literal"
    );
    assert_eq!(
        vak_in_value
            .get("cs")
            .and_then(|v| v.get("direction"))
            .and_then(Value::as_str),
        Some("Day"),
        "CLI patch preserves cs.direction"
    );

    // Confirm persistence by re-reading the store directly.
    let reloaded = SessionStore::new(&gate_root)
        .expect("store reopens")
        .resolve("agent:main:main")
        .expect("reloaded session resolves");
    assert_eq!(
        reloaded.vak_address.as_ref(),
        Some(&vak),
        "CLI patch round-trips to disk"
    );
}

#[test]
fn cli_gate_sessions_patch_rejects_malformed_vak_address_json() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).expect("session store boots");
    store
        .create("agent:main:main")
        .expect("create session record");

    let test_env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());
    let output = run_epi(
        &[
            "gate",
            "sessions",
            "patch",
            "--session-id",
            "agent:main:main",
            "--vak-address-json",
            "{not valid vak}",
        ],
        &test_env,
    );
    assert!(
        !output.status.success(),
        "malformed --vak-address-json must exit non-zero"
    );
    assert!(
        output.stderr.contains("invalid --vak-address-json"),
        "stderr should explain the failure; got: {}",
        output.stderr
    );
}
