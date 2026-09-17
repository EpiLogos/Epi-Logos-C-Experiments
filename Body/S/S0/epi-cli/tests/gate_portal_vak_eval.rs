//! 50.T50.13 / DR-VAK-6 — `portal.vak_eval` becomes an event that is actually
//! broadcast, carrying the run's reading against the derived music.
//!
//! The gap this closes is precise. `portal.vak_eval` has been a first-class
//! member of `PORTAL_EVENT_NAMES` and is listed by the Pleroma capability
//! matrix under `pre_tool_call.must_emit` — and until this tranche NOTHING in
//! the repo broadcast it. The contract named an event no consumer could ever
//! receive.
//!
//! These tests drive a real gateway over the real protocol: a second socket is
//! registered as a listener on the runtime (which is what `epi portal` and the
//! OmniPanel are), the evaluation is requested on the first, and the observer
//! must witness the broadcast. The reading itself is the kernel's
//! (`portal-core` `VakTonalReading`, proven against `ql-musical-derivation-v3`
//! in `tests/vak_tonal_reading.rs`); what is proven here is that it reaches the
//! wire intact and that the method refuses rather than guesses.

mod support;

use serde_json::{json, Value};
use std::path::PathBuf;
use std::time::Duration;
use support::{TestEnv, TestGatewayClient};

/// The real repo root — `s4'.vak.evaluate` resolves the Pleroma skill it
/// advertises, so the fixture points at the checkout, exactly as
/// `gate_anima_pleroma_access.rs` does.
fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

async fn connected_client(port: u16) -> TestGatewayClient {
    let env = TestEnv::with_fake_pi().with_env("EPI_REPO_ROOT", repo_root().display().to_string());
    let mut client = TestGatewayClient::connect(env, port).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");
    client
}

/// A VAK address in the shape the envelope deserialises.
fn address(cf: &str, recognized: bool) -> Value {
    json!({
        "cpf": "(4.0/1-4.4/5)",
        "ct": ["CT2"],
        "cp": "CP4.2",
        "cf": cf,
        "cfp": "CFP2",
        "cs": { "code": "CS2", "direction": "Day", "recognized": recognized }
    })
}

fn step(id: &str, cf: &str, agent: &str) -> Value {
    json!({ "stepId": id, "address": address(cf, false), "agent": agent })
}

#[tokio::test]
async fn vak_evaluate_broadcasts_the_audible_degree_to_a_real_listener() {
    let mut client = connected_client(18971).await;
    let mut observer = client.observer(18971).await;

    let response = client
        .request(
            "s4'.vak.evaluate",
            json!({ "task": "review the day and summarize", "sessionKey": "agent:anima:main" }),
        )
        .await
        .expect("s4'.vak.evaluate stays callable");

    // The heuristic routes "review"/"summarize" to Sophia's Möbius frame.
    assert_eq!(response["coordinates"]["cf"], "(5/0)");
    // DR-VAK-6 item 1: the degree rides the evaluation. `(5/0)` is CF7, and
    // absent a declared tonic the frame is Ionian, so the degree is 7.
    assert_eq!(response["diatonicDegree"], 7);
    assert_eq!(response["modeTonicCf"], "(00/00)");

    let event = observer.next_event("portal.vak_eval").await;
    let payload = &event["payload"];
    assert_eq!(payload["sessionKey"], "agent:anima:main");
    assert_eq!(payload["cf"], "(5/0)");
    assert_eq!(payload["diatonicDegree"], 7);
    assert_eq!(payload["modeTonicCf"], "(00/00)");
    // The C'-branch envelope survives onto the wire.
    for key in ["cpf", "ct", "cp", "cf", "cfp", "cs"] {
        assert!(!payload[key].is_null(), "payload carries {key}");
    }
    // No trace was supplied, so there is no line to read — and none is invented.
    assert!(payload["tonalReading"].is_null());
}

#[tokio::test]
async fn a_run_trace_reaches_the_wire_as_a_line_in_its_mode_tonic_frame() {
    let mut client = connected_client(18972).await;
    let mut observer = client.observer(18972).await;

    // A run that originates at the ground, works through the frames, and
    // returns — the shape `rerunScore` produces, with the closing step carrying
    // the DR-VAK-5 recognition.
    let mut trace = vec![
        step("originate", "(00/00)", "nous"),
        step("frame", "(0/1)", "logos"),
        step("synthesise", "(0/1/2)", "eros"),
        step("execute", "(4.0/1-4.4/5)", "anima"),
    ];
    trace.push(json!({
        "stepId": "close",
        "address": address("(00/00)", true),
        "agent": "sophia"
    }));

    let response = client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "run the nightly orchestration",
                "sessionKey": "agent:anima:main",
                // The scale-beneath, declared: L2' is the Alchemical-Elemental
                // lens, anchored on F per the derivation's §II-3.1 table.
                "lens": "L2'",
                "trace": trace,
                "resonance72Index": 30
            }),
        )
        .await
        .expect("a trace-carrying evaluation is accepted");

    let event = observer.next_event("portal.vak_eval").await;
    let reading = &event["payload"]["tonalReading"];

    assert_eq!(reading["lensLabel"], "L2'");
    assert_eq!(reading["lensAnchorNote"], "F");
    assert_eq!(reading["modeName"], "Ionian");
    assert_eq!(reading["tonicNote"], "F");
    // L2' is lens 8; Ionian is mode 0 — address 56 in the 84-fold landscape.
    assert_eq!(reading["lensModeIndex"], 56);

    let steps = reading["steps"].as_array().expect("the line is a sequence");
    assert_eq!(steps.len(), 5);
    assert_eq!(steps[0]["degree"], 1);
    assert_eq!(steps[0]["note"], "F");
    assert_eq!(steps[0]["m0Address"], "M0-2:00/00");
    assert_eq!(steps[3]["cf"], "(4.0/1-4.4/5)");
    assert_eq!(steps[3]["degree"], 5, "the dispatch frame is the dominant");
    assert_eq!(steps[3]["conjugateFace"], "power");
    assert_eq!(
        steps[3]["hopfFiber"], 1,
        "the fifth sits on the implicate sheet"
    );
    assert_eq!(steps[4]["degree"], 1, "the run returned to its ground");

    // The run-level evaluation.
    assert_eq!(reading["degreesSounded"], json!([1, 2, 3, 5]));
    assert_eq!(reading["degreesSilent"], json!([4, 6, 7]));
    assert_eq!(reading["conjugateFaceChanges"], 2, "out to Power and back");
    assert_eq!(reading["bothFacesSounded"], true);
    assert_eq!(reading["returnsToTonic"], true);
    assert_eq!(reading["recognitionClosed"], true);

    // DR-VAK-6 item 2 — supplied, never derived, with its half-decan.
    assert_eq!(event["payload"]["resonance72Index"], 30);
    assert_eq!(event["payload"]["halfDecanIndex"], 15);

    // The response carries the same reading the wire did.
    assert_eq!(response["tonalReading"], *reading);
}

#[tokio::test]
async fn modal_rotation_is_observable_over_the_wire() {
    // DR-VAK-6 item 3: "modal rotation operationally testable as which CF sits
    // at tonic". The same trace, two grounds, two readings.
    let mut client = connected_client(18973).await;
    let mut observer = client.observer(18973).await;

    let trace = json!([
        step("execute", "(4.0/1-4.4/5)", "anima"),
        step("frame", "(0/1/2/3)", "mythos"),
    ]);

    client
        .request(
            "s4'.vak.evaluate",
            json!({ "task": "execute the plan", "lens": "L0", "trace": trace }),
        )
        .await
        .expect("Ionian reading");
    let ionian = observer.next_event("portal.vak_eval").await["payload"]["tonalReading"].clone();
    assert_eq!(ionian["modeName"], "Ionian");
    assert_eq!(ionian["steps"][0]["degree"], 5, "Anima is the dominant");
    assert_eq!(ionian["steps"][1]["degree"], 4);

    client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "execute the plan",
                "lens": "L0",
                "modeTonicCf": "(4.0/1-4.4/5)",
                "trace": trace
            }),
        )
        .await
        .expect("Mixolydian reading");
    let mixolydian =
        observer.next_event("portal.vak_eval").await["payload"]["tonalReading"].clone();
    assert_eq!(mixolydian["modeName"], "Mixolydian");
    assert_eq!(mixolydian["tonicNote"], "G");
    assert_eq!(
        mixolydian["steps"][0]["degree"], 1,
        "Anima is now the ground"
    );
    assert_eq!(
        mixolydian["steps"][1]["intervalFromTonic"], 10,
        "and the 7th is flat — the Mixolydian signature"
    );

    // Rotation re-grounds; it does not transpose. Same lens, same pitches.
    assert_eq!(ionian["steps"][0]["note"], mixolydian["steps"][0]["note"]);
    assert_eq!(ionian["steps"][1]["note"], mixolydian["steps"][1]["note"]);
}

#[tokio::test]
async fn a_trace_without_its_lens_is_refused_and_nothing_is_broadcast() {
    let mut client = connected_client(18974).await;
    let mut observer = client.observer(18974).await;

    let error = client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "execute the plan",
                "trace": [step("execute", "(4.0/1-4.4/5)", "anima")]
            }),
        )
        .await
        .expect_err("the scale-beneath cannot be guessed");
    assert!(
        error.message.contains("lens"),
        "the refusal names the missing field: {}",
        error.message
    );

    // A refused evaluation must not put a half-read event on the bus.
    observer
        .expect_no_event("portal.vak_eval", Duration::from_millis(400))
        .await;
}

#[tokio::test]
async fn drifted_coordinates_are_refused_by_name() {
    let mut client = connected_client(18975).await;

    let error = client
        .request(
            "s4'.vak.evaluate",
            json!({ "task": "execute", "lens": "L9", "trace": [step("a", "(00/00)", "nous")] }),
        )
        .await
        .expect_err("L9 is not a MEF lens");
    assert!(error.message.contains("L9"), "{}", error.message);

    let error = client
        .request(
            "s4'.vak.evaluate",
            json!({ "task": "execute", "modeTonicCf": "(4/5/0)" }),
        )
        .await
        .expect_err("the retired (4/5/0) literal is not a context-frame");
    assert!(error.message.contains("(4/5/0)"), "{}", error.message);

    let error = client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "execute",
                "lens": "L0",
                "trace": [step("a", "(4/5/0)", "anima")]
            }),
        )
        .await
        .expect_err("a step outside the progression cannot be degreed");
    assert!(error.message.contains("(4/5/0)"), "{}", error.message);

    let error = client
        .request(
            "s4'.vak.evaluate",
            json!({ "task": "execute", "resonance72Index": 72 }),
        )
        .await
        .expect_err("the 72-fold domain is 0..71");
    assert!(error.message.contains("72-fold"), "{}", error.message);
}
