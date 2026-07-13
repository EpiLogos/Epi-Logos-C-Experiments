//! Live-gateway driver for the oracle surface (`nara.oracle.payload`).
//!
//! The oracle payload law was previously proven only at the pure state-machine
//! and kernel layers (`nara_oracle_payload.rs`) and by arithmetic re-derivation
//! that never touched a running gateway (`gate_nara_contract.rs` even documents
//! "we can't call the handler directly … no gateway running"). This suite
//! closes that gap: it spawns a REAL in-process gateway, connects over a real
//! WebSocket, issues a real `nara.oracle.payload` RPC frame, and asserts the
//! four-faces + quaternionic-charge law on the JSON the handler actually emits.
//!
//! `nara.oracle.payload` performs a live I-Ching coin cast and routes the
//! charges through the single kernel authority (`m3_compute_charges`), so the
//! primary_hex/temporal_hex/tick12 differ per cast — the test asserts the
//! invariant RELATIONS that hold for every cast, not fixed values. If the
//! gateway is down, the route is removed, or the handler regresses to the
//! deferred stub (no `charges`), these assertions fail loud.

mod support;

use serde_json::json;
use support::TestGatewayClient;

/// Extract a JSON number as f64 or fail loudly (a deferred-stub response has no
/// such field, so this doubles as the "handler is live" guard).
fn num(value: &serde_json::Value, key: &str) -> f64 {
    value
        .get(key)
        .and_then(serde_json::Value::as_f64)
        .unwrap_or_else(|| panic!("oracle payload missing numeric `{key}`: {value}"))
}

#[tokio::test]
async fn nara_oracle_payload_over_the_wire_obeys_four_faces_and_kernel_charge_law() {
    let mut client = TestGatewayClient::connected_with_temp_store(18948).await;

    // Pin the explicate degree so the three deterministic faces are checkable;
    // the hexagram/charges still come from a live random coin cast.
    let payload = client
        .request("nara.oracle.payload", json!({ "kairos_degree": 45.0 }))
        .await
        .expect("nara.oracle.payload must resolve over the live gateway");

    // Not the deferred stub — a real payload exposes the charges sub-object.
    let charges = payload
        .get("charges")
        .and_then(serde_json::Value::as_object)
        .expect("live payload must carry a `charges` object, not a deferred stub");

    // ── Face law (deterministic given kairos_degree = 45) ───────────────
    let degree = num(&payload, "degree");
    assert_eq!(degree, 45.0, "explicate degree echoes kairos_degree");
    assert_eq!(
        num(&payload, "deficient_degree"),
        225.0,
        "deficient face = (degree + 180) mod 360"
    );
    assert!(
        (num(&payload, "implicate_720") - 405.0).abs() < 0.01,
        "implicate face = degree + 360 (SU(2) upper hemisphere)"
    );
    assert_eq!(num(&payload, "phase"), 0.0, "explicate phase by default");

    // ── Cast-dependent fields stay in their canonical ranges ────────────
    let primary_hex = num(&payload, "primary_hex");
    assert!(
        (0.0..64.0).contains(&primary_hex),
        "primary_hex is a 6-bit hexagram index: {primary_hex}"
    );
    let temporal_hex = num(&payload, "temporal_hex");
    assert!(
        (0.0..64.0).contains(&temporal_hex),
        "temporal_hex is a 6-bit hexagram index: {temporal_hex}"
    );
    let tick12 = num(&payload, "tick12");
    assert!(
        (0.0..12.0).contains(&tick12),
        "tick12 is a mod-12 Spanda substage: {tick12}"
    );

    // ── Kernel charge law: pp=X+Y+Z, nn=X-Y-Z, np=X-Y+Z, pn=X+Y-Z ───────
    // These identities hold for EVERY codon regardless of the random cast.
    let pp = charges["pp"].as_f64().expect("pp");
    let nn = charges["nn"].as_f64().expect("nn");
    let np = charges["np"].as_f64().expect("np");
    let pn = charges["pn"].as_f64().expect("pn");

    assert!(
        (pp + nn - (np + pn)).abs() < 1e-6,
        "pp+nn == np+pn (== 2X): pp={pp} nn={nn} np={np} pn={pn}"
    );
    assert!(
        (pp - np - (pn - nn)).abs() < 1e-6,
        "pp-np == pn-nn (== 2Y): pp={pp} nn={nn} np={np} pn={pn}"
    );
    assert!(
        (pp - pn - (np - nn)).abs() < 1e-6,
        "pp-pn == np-nn (== 2Z): pp={pp} nn={nn} np={np} pn={pn}"
    );
    // pp is the full positive sum of the three nucleotide I-Ching values, so it
    // is strictly positive and dominates the sign-flipped charges.
    assert!(pp > 0.0, "pp = X+Y+Z of positive I-Ching values: {pp}");
    assert!(pp >= nn && pp >= np && pp >= pn, "pp dominates the charge triple");

    // The handler must NOT have leaked a deferred marker.
    assert!(
        payload.get("status").is_none(),
        "a live payload carries no deferred `status` field: {payload}"
    );
}

#[tokio::test]
async fn nara_oracle_payload_defaults_to_zero_degree_explicate_faces() {
    let mut client = TestGatewayClient::connected_with_temp_store(18949).await;

    // No kairos_degree supplied — the handler defaults to 0.0 and the faces
    // still resolve. This proves the route is reachable AND handles the
    // parameter-absent path (the OraclePane's CLI-level default).
    let payload = client
        .request("nara.oracle.payload", json!({}))
        .await
        .expect("nara.oracle.payload (no params) must resolve over the live gateway");

    assert!(
        payload.get("charges").is_some(),
        "default payload is live, not a deferred stub: {payload}"
    );
    assert_eq!(num(&payload, "degree"), 0.0, "default explicate degree is 0");
    assert_eq!(
        num(&payload, "deficient_degree"),
        180.0,
        "deficient of 0 is 180"
    );
    assert!(
        (num(&payload, "implicate_720") - 360.0).abs() < 0.01,
        "implicate of 0 is 360"
    );
}
