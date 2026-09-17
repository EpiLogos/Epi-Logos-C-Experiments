//! Coordinate: S0/S3/M5-3' tunability gateway edge (38.T06.8).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: a live tunability registry read, mutation, and audit round-trip.
//! Public surface: `cargo test --test gate_tuning_surface`.
//! Does NOT own: tunable schema law, persistence policy, or the M' tuning pane.
//! Contract: [[S0-SPEC]] / [[S3-SPEC]] / [[M5'-SPEC]] / [[DR-TUNE-1]].

mod support;

use serde_json::json;
use support::TestGatewayClient;

const REGISTRY_LIST_METHOD: &str = "s5'.tune.registry.list";
const REGISTRY_GET_METHOD: &str = "s5'.tune.registry.get";
const REGISTRY_SET_METHOD: &str = "s5'.tune.registry.set";
const AUDIT_READ_METHOD: &str = "s5'.tune.audit.read";
const PROPOSE_METHOD: &str = "s5'.tune.propose";
const PROPOSALS_LIST_METHOD: &str = "s5'.tune.proposals.list";
const PROPOSALS_RESOLVE_METHOD: &str = "s5'.tune.proposals.resolve";

fn assert_f32(value: &serde_json::Value, expected: f64) {
    let actual = value.as_f64().expect("tunable value should be numeric");
    assert!(
        (actual - expected).abs() < 0.000_001,
        "expected {expected}, got {actual}"
    );
}

#[tokio::test]
async fn live_gateway_updates_a_real_tunable_and_persists_its_audit_trail() {
    let mut client = TestGatewayClient::connected_with_temp_store(18952).await;

    let registry = client
        .request(REGISTRY_LIST_METHOD, json!({}))
        .await
        .expect("the real gateway should list the compiled tunable registry");
    let knobs = registry["knobs"]
        .as_array()
        .expect("registry list should return typed knob metadata");
    assert!(
        knobs
            .iter()
            .any(|knob| knob["key"] == "nara.weights.body_natal"),
        "the real schema should expose the Nara body-natal weight"
    );

    let before = client
        .request(
            REGISTRY_GET_METHOD,
            json!({ "key": "nara.weights.body_natal" }),
        )
        .await
        .expect("the registered knob should be readable");
    assert_eq!(before["locked"], false);

    let receipt = client
        .request(
            REGISTRY_SET_METHOD,
            json!({
                "key": "nara.weights.body_natal",
                "value": 0.55,
                "actor": "user",
                "evidence": ["gateway integration test"]
            }),
        )
        .await
        .expect("a bounded user tuning change should be accepted and audited");
    assert_eq!(receipt["knob_key"], "nara.weights.body_natal");
    assert_eq!(receipt["from_value"], before["current"]);
    assert_f32(&receipt["to_value"], 0.55);
    assert_eq!(receipt["actor"], "user");

    let after = client
        .request(
            REGISTRY_GET_METHOD,
            json!({ "key": "nara.weights.body_natal" }),
        )
        .await
        .expect("a written knob should read back through the same live gateway");
    assert_f32(&after["current"], 0.55);
    assert_eq!(after["is_default"], false);

    let audit = client
        .request(
            AUDIT_READ_METHOD,
            json!({ "key": "nara.weights.body_natal" }),
        )
        .await
        .expect("the live gateway should expose the persisted audit trail");
    let entries = audit["entries"]
        .as_array()
        .expect("audit read should return persisted entries");
    assert_eq!(entries.len(), 1);
    assert_f32(&entries[0]["to_value"], 0.55);
    assert_eq!(
        entries[0]["proposing_evidence"],
        json!(["gateway integration test"])
    );
}

#[tokio::test]
async fn live_gateway_routes_class_a_tuning_through_human_review_before_applying_it() {
    let mut client = TestGatewayClient::connected_with_temp_store(18953).await;
    let key = "mythos.symbolic_protein_reading.cosmic_weather_weights";
    let before = client
        .request(REGISTRY_GET_METHOD, json!({ "key": key }))
        .await
        .expect("Class A knob is readable");
    let proposed_value = json!({ "m1": 0.30, "m2": 0.40, "m3": 0.30 });
    let triplet = json!({
        "narratrix_articulation": "Thirty sessions show a bounded Mythos weather-weight drift.",
        "ebm_energy_delta": -0.08,
        "verifier_questions": ["Does the proposed triplet preserve its sum?"]
    });
    let proposing_evidence = (1..=30)
        .map(|session| format!("session://mythos/{session}"))
        .collect::<Vec<_>>();

    let proposal = client
        .request(
            PROPOSE_METHOD,
            json!({
                "key": key,
                "to_value": proposed_value,
                "tier": 2,
                "proposing_evidence": proposing_evidence,
                "triplet_verdict": triplet,
            }),
        )
        .await
        .expect("Class A proposal should enter governed review");
    assert_eq!(proposal["disposition"]["kind"], "human_review");
    let item_id = proposal["disposition"]["item"]["item_id"]
        .as_str()
        .expect("governed review item id")
        .to_owned();

    let unchanged = client
        .request(REGISTRY_GET_METHOD, json!({ "key": key }))
        .await
        .expect("review does not mutate the live setting");
    assert_eq!(unchanged["current"], before["current"]);

    let proposals = client
        .request(PROPOSALS_LIST_METHOD, json!({}))
        .await
        .expect("tuning review items should be queryable");
    assert!(proposals["items"]
        .as_array()
        .expect("proposal list")
        .iter()
        .any(|item| item["item_id"] == item_id));

    let resolution = client
        .request(
            PROPOSALS_RESOLVE_METHOD,
            json!({
                "item_id": item_id,
                "decision": "approve",
                "rationale": "Human approves this bounded Class A tuning change.",
                "resolved_by": "human",
                "promotion_destination": null,
                "promoted_artifact": null,
            }),
        )
        .await
        .expect("human approval should apply the approved tuning proposal");
    assert_eq!(resolution["audit_entry"]["actor"], "user");
    assert_eq!(resolution["audit_entry"]["tier"], 2);

    let after = client
        .request(REGISTRY_GET_METHOD, json!({ "key": key }))
        .await
        .expect("approved Class A value should be persisted");
    assert_f32(&after["current"]["m1"], 0.30);
    assert_f32(&after["current"]["m2"], 0.40);
    assert_f32(&after["current"]["m3"], 0.30);
}

#[tokio::test]
async fn live_gateway_auto_applies_class_b_tuning_only_after_triplet_validation() {
    let mut client = TestGatewayClient::connected_with_temp_store(18954).await;
    let key = "mythos.symbolic_protein_reading.secondary_archetypes_count";
    let proposal = client
        .request(
            PROPOSE_METHOD,
            json!({
                "key": key,
                "to_value": 3,
                "tier": 2,
                "proposing_evidence": ["session://mythos/31"],
                "triplet_verdict": {
                    "narratrix_articulation": "A bounded thread increase reduces repeated waiting.",
                    "ebm_energy_delta": -0.02,
                    "verifier_questions": ["Does the ceiling remain respected?"]
                }
            }),
        )
        .await
        .expect("Class B proposal with a complete triplet should auto-apply");
    assert_eq!(proposal["disposition"]["kind"], "auto_apply");
    assert_eq!(proposal["audit_entry"]["actor"], "anamnesis-proposer");
    assert_f32(
        &proposal["audit_entry"]["triplet_verdict"]["ebm_energy_delta"],
        -0.02,
    );

    let after = client
        .request(REGISTRY_GET_METHOD, json!({ "key": key }))
        .await
        .expect("auto-applied Class B value should be persisted");
    assert_eq!(after["current"], 3);
}

#[tokio::test]
async fn live_gateway_refuses_tier_two_mutation_that_bypasses_the_s5_lifecycle() {
    let mut client = TestGatewayClient::connected_with_temp_store(18955).await;
    let error = client
        .request(
            REGISTRY_SET_METHOD,
            json!({
                "key": "mythos.symbolic_protein_reading.secondary_archetypes_count",
                "value": 3,
                "actor": "anamnesis-proposer",
                "tier": 2,
                "evidence": ["attempted direct Tier-2 mutation"]
            }),
        )
        .await
        .expect_err("Tier-2 mutation must go through s5'.tune.propose");
    assert!(error.message.contains("Tier-1"));
}
