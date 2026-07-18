use epi_s5_epii_autoresearch_core::tuning_review::{
    submit_tuning_proposal, TuningProposalDisposition, TuningProposalRequest,
};
use epi_s5_epii_review_core::ReviewStore;
use portal_core::tunable::{TripletVerdict, TunableRegistry};

fn mythos_request() -> TuningProposalRequest {
    let schema_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../S0/portal-core/tunable-schema");
    let registry = TunableRegistry::load_with_overrides(&schema_dir, None)
        .expect("compiled tunable schema should load");
    let key = "mythos.symbolic_protein_reading.cosmic_weather_weights";
    let metadata = registry.get(key).expect("Mythos Class A knob").clone();
    let from_value = registry.value(key).expect("current Mythos value");

    TuningProposalRequest {
        metadata,
        from_value,
        to_value: portal_core::tunable::TunableValue::F32Triplet {
            m1: 0.30,
            m2: 0.40,
            m3: 0.30,
        },
        proposing_evidence: (1..=30)
            .map(|session| format!("session://mythos/{session}"))
            .collect(),
        tier: 2,
        triplet_verdict: Some(TripletVerdict {
            narratrix_articulation: "Thirty Mythos sessions show a bounded weather-weight drift."
                .to_owned(),
            ebm_energy_delta: -0.08,
            verifier_questions: vec![
                "Does the adjustment preserve the triplet sum?".to_owned(),
                "Is the evidence confined to the named PASU?".to_owned(),
            ],
        }),
        recent_application_count: 0,
    }
}

#[test]
fn class_a_mythos_proposal_is_human_gated_with_full_triplet_evidence() {
    let temp = tempfile::tempdir().expect("tempdir");
    let review = ReviewStore::new(temp.path().join("review"));

    let receipt = submit_tuning_proposal(&review, mythos_request())
        .expect("Class A proposal should enter the real S5 review store");
    let TuningProposalDisposition::HumanReview { item } = receipt.disposition else {
        panic!("Class A proposal must require human review");
    };

    assert!(item.requires_human);
    assert_eq!(
        item.proposed_action
            .as_ref()
            .expect("tuning proposal action")
            .kind,
        "tuning_proposal"
    );
    assert_eq!(item.coordinate_context["capacity_id"], "tuning_review");
    assert_eq!(
        item.coordinate_context["proposing_evidence"]
            .as_array()
            .map(Vec::len),
        Some(30)
    );
    assert_eq!(
        item.proposed_action
            .as_ref()
            .and_then(|action| action.payload.as_ref())
            .and_then(|payload| payload.get("triplet_verdict"))
            .and_then(|verdict| verdict.get("verifier_questions"))
            .and_then(serde_json::Value::as_array)
            .map(Vec::len),
        Some(2)
    );
}

#[test]
fn class_a_proposals_stop_at_the_per_knob_open_review_ceiling() {
    let temp = tempfile::tempdir().expect("tempdir");
    let review = ReviewStore::new(temp.path().join("review"));

    for _ in 0..3 {
        submit_tuning_proposal(&review, mythos_request()).expect("proposal within ceiling");
    }

    let error = submit_tuning_proposal(&review, mythos_request())
        .expect_err("fourth open Class A proposal must be rejected");
    assert!(error.contains("open proposal ceiling"));
}

#[test]
fn class_b_proposal_requires_a_complete_triplet_before_auto_apply_is_eligible() {
    let temp = tempfile::tempdir().expect("tempdir");
    let review = ReviewStore::new(temp.path().join("review"));
    let schema_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../S0/portal-core/tunable-schema");
    let registry = TunableRegistry::load_with_overrides(&schema_dir, None)
        .expect("compiled tunable schema should load");
    let key = "mythos.symbolic_protein_reading.secondary_archetypes_count";
    let metadata = registry.get(key).expect("Mythos Class B knob").clone();

    let mut request = TuningProposalRequest {
        metadata,
        from_value: registry.value(key).expect("current Mythos value"),
        to_value: portal_core::tunable::TunableValue::U32(3),
        proposing_evidence: vec!["session://mythos/31".to_owned()],
        tier: 2,
        triplet_verdict: None,
        recent_application_count: 0,
    };
    let error = submit_tuning_proposal(&review, request.clone())
        .expect_err("Class B must not auto-apply without constitutional evidence");
    assert!(error.contains("complete constitutional triplet"));

    request.triplet_verdict = Some(TripletVerdict {
        narratrix_articulation: "The bounded thread increase reduces repeated waiting.".to_owned(),
        ebm_energy_delta: -0.02,
        verifier_questions: vec!["Does the ceiling remain respected?".to_owned()],
    });
    let receipt = submit_tuning_proposal(&review, request)
        .expect("complete Class B proposal should become auto-apply eligible");
    assert!(matches!(
        receipt.disposition,
        TuningProposalDisposition::AutoApply
    ));
    assert!(review
        .inbox(Default::default())
        .expect("review inbox")
        .items
        .is_empty());
}
