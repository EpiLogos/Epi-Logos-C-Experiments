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

    let profile = client.next_event("profile.update").await;
    let profile_generation = profile["payload"]["generation"]
        .as_u64()
        .expect("profile update carries its generation");
    let active_question = profile["payload"]["harmonicProfile"]["anuttaraWitness"]["openQuestions"]
        [0]
    .as_str()
    .expect("profile update carries an active verifier question")
    .to_owned();

    let response = client
        .request(
            "s0'.verifier.respond_question",
            json!({
                "coordinateString": active_question,
                "responseText": "The relation is witnessed in the current graph traversal.",
                "sourceExtensionId": "m0-anuttara",
                "sessionKey": "m0-anuttara-symbolic",
                "profileGeneration": profile_generation
            }),
        )
        .await
        .expect("respond_question reaches the symbolic parser and protected-local store");
    assert_eq!(response["accepted"], true);
    assert_eq!(response["responseStatus"], "responded");
    assert_eq!(response["reverified"], false);
    assert_eq!(response["privacyClass"], "protected_local");
    assert_eq!(response["parse"]["namespace"], "R");
    assert_eq!(response["profileGeneration"], profile_generation);

    let response_id = response["responseId"]
        .as_str()
        .expect("accepted response carries an opaque id");
    let persisted_path = client
        .gate_root()
        .join("verifier-responses")
        .join(format!("{response_id}.json"));
    let persisted: serde_json::Value = serde_json::from_slice(
        &std::fs::read(&persisted_path).expect("response is durably persisted"),
    )
    .expect("persisted response is valid JSON");
    assert_eq!(
        persisted["responseText"],
        "The relation is witnessed in the current graph traversal."
    );
    assert_eq!(persisted["profileGeneration"], profile_generation);
    assert_eq!(persisted["parse"], response["parse"]);
    assert_eq!(persisted["provenance"]["trust"], "loopback-client-claim");
    assert_eq!(persisted["claimedSourceExtensionId"], "m0-anuttara");
    assert_eq!(persisted["claimedSessionKey"], "m0-anuttara-symbolic");
    assert!(persisted.get("sourceExtensionId").is_none());
    assert!(persisted.get("sessionKey").is_none());

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let directory_mode = std::fs::metadata(client.gate_root().join("verifier-responses"))
            .expect("response directory exists")
            .permissions()
            .mode()
            & 0o777;
        let file_mode = std::fs::metadata(&persisted_path)
            .expect("response file exists")
            .permissions()
            .mode()
            & 0o777;
        assert_eq!(directory_mode, 0o700);
        assert_eq!(file_mode, 0o600);
    }

    let stale_question = client
        .request(
            "s0'.verifier.respond_question",
            json!({
                "coordinateString": "#R0-0/1/A-T7-pending?",
                "responseText": "This question was not emitted for the cited generation.",
                "sourceExtensionId": "m0-anuttara",
                "sessionKey": "m0-anuttara-symbolic",
                "profileGeneration": profile_generation
            }),
        )
        .await
        .expect_err("responses are bound to an emitted question and generation");
    assert!(stale_question.message.contains("active verifier question"));

    let malformed = client
        .request(
            "s0'.verifier.respond_question",
            json!({
                "coordinateString": "not-a-symbolic-question",
                "responseText": "This must not be persisted.",
                "sourceExtensionId": "m0-anuttara",
                "sessionKey": "m0-anuttara-symbolic"
            }),
        )
        .await
        .expect_err("malformed symbolic coordinates fail closed");
    assert!(malformed.message.contains("invalid symbolic coordinate"));

    let blank = client
        .request(
            "s0'.verifier.respond_question",
            json!({
                "coordinateString": "#R0-0/1/A-T7-pending?",
                "responseText": "   ",
                "sourceExtensionId": "m0-anuttara",
                "sessionKey": "m0-anuttara-symbolic"
            }),
        )
        .await
        .expect_err("blank responses fail closed");
    assert!(blank.message.contains("responseText"));
}
