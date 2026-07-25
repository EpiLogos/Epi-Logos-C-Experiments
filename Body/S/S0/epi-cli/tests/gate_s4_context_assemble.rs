//! 51.T51.1 — `s4'.context.assemble` serves the pack the S4' spine published.
//!
//! The S4' compositor (`Body/S/S4/ta-onta/spine/compositor.ts`) is the ONE
//! assembler: on `before_agent_start` it injects `pack.injection` and publishes
//! that same object to `<state-root>/s4/context-pack/<slug>.json`. These tests
//! hold the adapter's half of the contract — it must return those bytes
//! verbatim, must say so when nothing was published, and must refuse a pack
//! that has lost its injection rather than show an operator an empty "context".
//!
//! The TS side proves published-bytes == injected-bytes
//! (`Body/S/S4/ta-onta/tests/spine_context_pack.test.ts`); the app e2e closes
//! the chain by publishing through the REAL compositor and reading it back over
//! this method.

mod support;

use serde_json::json;
use std::fs;
use support::TestGatewayClient;

/// The exact shape `spine/context-pack-store.ts::publishContextPack` writes.
fn published_pack(injection: &str) -> serde_json::Value {
    json!({
        "version": 1,
        "sessionKey": "agent:anima:main",
        "assembledAtMs": 1_785_000_000_000i64,
        "budget": { "limitChars": 18_000, "usedChars": 42 },
        "blocks": [
            {
                "coordinate": "S0/S0'",
                "cost": "hot",
                "status": "included",
                "bytes": 21,
                "charEstimate": 21,
                "producedAtMs": 1_785_000_000_001i64,
                "rendered": "### [[S0/S0']]\n\n**s_0_day_id:** 25-07-2026",
                "vakToken": null,
                "error": null
            },
            {
                "coordinate": "S2/S3",
                "cost": "warm",
                "status": "failed",
                "bytes": 0,
                "charEstimate": 0,
                "producedAtMs": 1_785_000_000_002i64,
                "rendered": null,
                "vakToken": null,
                "error": "pleroma capability matrix unreadable"
            }
        ],
        "injection": injection,
    })
}

fn write_pack(gate_root: &std::path::Path, slug: &str, pack: &serde_json::Value) {
    let dir = gate_root.join("s4").join("context-pack");
    fs::create_dir_all(&dir).expect("context-pack dir should be creatable");
    fs::write(
        dir.join(format!("{slug}.json")),
        serde_json::to_string_pretty(pack).unwrap(),
    )
    .expect("pack should be writable");
}

#[tokio::test]
async fn context_assemble_returns_the_published_pack_verbatim() {
    let mut client = TestGatewayClient::connected_with_temp_store(18877).await;

    let injection = "### [[S0/S0']]\n\n**s_0_day_id:** 25-07-2026";
    write_pack(
        &client.gate_root(),
        "agent_anima_main",
        &published_pack(injection),
    );

    let response = client
        .request(
            "s4'.context.assemble",
            json!({ "sessionKey": "agent:anima:main" }),
        )
        .await
        .expect("s4'.context.assemble should be gateway-callable");

    assert_eq!(response["owner"], "S4'");
    assert_eq!(response["sessionKey"], "agent:anima:main");
    assert_eq!(response["present"], true);
    assert_eq!(
        response["assembler"],
        "Body/S/S4/ta-onta/spine/compositor.ts::SpineCompositor.assembleContextPack"
    );

    // The load-bearing assertion: the served injection is byte-identical to the
    // published one. A re-assembly would not be.
    assert_eq!(response["pack"]["injection"], injection);

    // Per-carrier provenance survives the wire, including the failure the old
    // flat string could not carry at all.
    let blocks = response["pack"]["blocks"]
        .as_array()
        .expect("pack should carry per-carrier blocks");
    assert_eq!(blocks.len(), 2);
    assert_eq!(blocks[0]["coordinate"], "S0/S0'");
    assert_eq!(blocks[0]["status"], "included");
    assert_eq!(blocks[0]["bytes"], 21);
    assert_eq!(blocks[1]["coordinate"], "S2/S3");
    assert_eq!(blocks[1]["status"], "failed");
    assert_eq!(blocks[1]["error"], "pleroma capability matrix unreadable");
}

#[tokio::test]
async fn context_assemble_reports_absence_instead_of_fabricating_a_pack() {
    let mut client = TestGatewayClient::connected_with_temp_store(18878).await;

    let response = client
        .request(
            "s4'.context.assemble",
            json!({ "sessionKey": "never-assembled" }),
        )
        .await
        .expect("an unassembled session is a valid answer, not an error");

    assert_eq!(response["present"], false);
    assert_eq!(response["pack"], serde_json::Value::Null);
    assert!(
        response["reason"]
            .as_str()
            .unwrap_or_default()
            .contains("no context pack"),
        "absence must be stated, not implied by an empty pack"
    );
}

#[tokio::test]
async fn context_assemble_refuses_a_pack_that_lost_its_injection() {
    let mut client = TestGatewayClient::connected_with_temp_store(18879).await;

    let mut broken = published_pack("unused");
    broken
        .as_object_mut()
        .unwrap()
        .insert("injection".to_owned(), serde_json::Value::Null);
    write_pack(&client.gate_root(), "broken", &broken);

    let error = client
        .request("s4'.context.assemble", json!({ "sessionKey": "broken" }))
        .await
        .expect_err("a pack with no injection must fail closed");

    assert!(
        format!("{error:?}").contains("no injection"),
        "the refusal must name the missing injection, got {error:?}"
    );
}

#[tokio::test]
async fn context_assemble_defaults_to_the_main_session() {
    let mut client = TestGatewayClient::connected_with_temp_store(18880).await;

    let injection = "### [[S4/S4']]\n\nanima spine";
    write_pack(&client.gate_root(), "main", &published_pack(injection));

    let response = client
        .request("s4'.context.assemble", json!({}))
        .await
        .expect("sessionKey should default rather than refuse");

    assert_eq!(response["sessionKey"], "main");
    assert_eq!(response["present"], true);
    assert_eq!(response["pack"]["injection"], injection);
}
