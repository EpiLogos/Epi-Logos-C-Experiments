//! Coordinate: S0/S3'/S4/S5 live Anuttara verifier edge.
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real WebSocket gateway verification boundary.
//! Actualises: 12.T12.34 executable `s0'.verifier.*` route surface.
//! Public surface: `cargo test --test gate_anuttara_verifier`.
//! Does NOT own: M0 verifier law, the language registry, or ontology storage.
//! Contract: [[S0-SPEC]] / [[S3-SPEC]] / [[S4-SPEC]] / [[S5-SPEC]].

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

fn incomplete_state() -> serde_json::Value {
    json!({
        "committedVirtueMask": 0,
        "virtueEvidence": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "observedCoreRelationCount": 65,
        "syntaxLayerMask": 0,
        "activeArchetype": 0,
        "activeTctPosition": 0,
        "slotPrivacyBoundaryCompliance": true
    })
}

#[tokio::test]
async fn live_gateway_executes_compiled_anuttara_verifier_routes() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18951).await;
    client.request("connect", json!({})).await.unwrap();

    let report = client
        .request(
            "s0'.verifier.check_state",
            json!({ "state": incomplete_state() }),
        )
        .await
        .expect("check_state reaches the compiled verifier through the live gateway");
    assert_eq!(report["slotPrivacyBoundaryCompliance"], true);
    assert!(report["unsatisfiedConstraints"]
        .as_array()
        .is_some_and(|items| !items.is_empty()));

    let query = client
        .request(
            "s0'.verifier.emit_query",
            json!({ "state": incomplete_state() }),
        )
        .await
        .expect("emit_query routes the compiled verifier's typed question");
    assert_eq!(query["surface"], "full-7-laws");
    assert!(query["symbolicCoordinateString"]
        .as_str()
        .is_some_and(|value| value.ends_with('?')));

    let member = client
        .request(
            "s0'.verifier.validate_membership",
            json!({ "languageElement": "M0-2-9-8", "registryCardinality": 128 }),
        )
        .await
        .expect("membership uses the compiled 128-entry registry");
    assert_eq!(member["member"], true);

    let invalid_cardinality = client
        .request(
            "s0'.verifier.validate_membership",
            json!({ "languageElement": "M0-2-9-8", "registryCardinality": 127 }),
        )
        .await
        .expect_err("the canonical registry cardinality is enforced");
    assert!(invalid_cardinality.message.contains("must be 128"));

    let owl = client
        .request(
            "s0'.verifier.owl_query",
            json!({ "query": "MATCH (n) RETURN n", "reasoner": "n10s" }),
        )
        .await
        .expect_err("OWL execution refuses without a configured S2 ontology adapter");
    assert!(owl.message.contains("configured S2 ontology adapter"));
}
