use epi_s5_epii_autoresearch_core::capacity_workflows::{
    build_capacity_workflow_snapshot, capacity_workflow_registry, route_capacity_workflow,
    CapacityId,
};
use epi_s5_epii_autoresearch_core::ImprovementStore;
use epi_s5_epii_review_core::{GateKind, ReviewCategory, ReviewStore};

#[test]
fn capacity_registry_routes_every_profile_through_real_stores_and_reloads_surface_dtos() {
    let temp = tempfile::tempdir().expect("tempdir");
    let autoresearch = ImprovementStore::new(temp.path().join("autoresearch"));
    let review = ReviewStore::new(temp.path().join("review"));
    let registry = capacity_workflow_registry();

    assert_eq!(registry.len(), 6);
    assert!(registry
        .iter()
        .all(|entry| entry.source_spec_anchors.len() >= 2));
    assert!(registry.iter().all(|entry| !entry
        .evidence_requirements
        .iter()
        .any(|value| value.contains("placeholder"))));

    let mut routed = Vec::new();
    for (index, entry) in registry.iter().enumerate() {
        routed.push(
            route_capacity_workflow(
                &autoresearch,
                &review,
                entry.capacity_id,
                1_780_300_000_000 + u128::try_from(index).expect("index fits"),
            )
            .expect("capacity workflow should route"),
        );
    }

    let nara = routed
        .iter()
        .find(|receipt| receipt.entry.capacity_id == CapacityId::Nara)
        .expect("Nara receipt");
    assert_eq!(
        nara.review_item
            .governance_profile
            .as_ref()
            .expect("Nara governance")
            .gate_kind,
        GateKind::AnimaPrimary
    );
    assert_eq!(
        nara.review_item
            .governance_profile
            .as_ref()
            .expect("Nara governance")
            .required_actors,
        vec!["anima".to_owned(), "sophia".to_owned()]
    );

    let epii = routed
        .iter()
        .find(|receipt| receipt.entry.capacity_id == CapacityId::EpiiOnEpii)
        .expect("Epii-on-Epii receipt");
    assert_eq!(
        epii.review_item
            .governance_profile
            .as_ref()
            .expect("Epii governance")
            .category,
        ReviewCategory::RecursiveSelfModification
    );
    assert!(epii.review_item.requires_human);

    let reopened_autoresearch = ImprovementStore::new(temp.path().join("autoresearch"));
    let reopened_review = ReviewStore::new(temp.path().join("review"));
    let snapshot = build_capacity_workflow_snapshot(&reopened_autoresearch, &reopened_review)
        .expect("snapshot reloads from real stores");

    assert_eq!(snapshot.body_alerts.len(), 6);
    assert_eq!(snapshot.control_room_panels.len(), 6);
    assert_eq!(snapshot.real_candidate_count, 6);
    assert_eq!(snapshot.real_review_item_count, 6);
    assert!(snapshot.body_alerts.iter().all(|alert| {
        alert.candidate_id.starts_with("candidate:")
            && alert.review_item_id.len() > 16
            && !alert.title.contains("placeholder")
    }));
    assert!(snapshot.control_room_panels.iter().all(|panel| {
        panel.source_spec_anchors.len() >= 2
            && panel.promotion_destination_family.contains("m5-prime")
            && !panel.orchestration_id.contains("fake")
    }));
}

#[test]
fn capacity_snapshot_rejects_fake_review_ids_and_placeholder_counts() {
    let temp = tempfile::tempdir().expect("tempdir");
    let autoresearch = ImprovementStore::new(temp.path().join("autoresearch"));
    let review = ReviewStore::new(temp.path().join("review"));

    route_capacity_workflow(
        &autoresearch,
        &review,
        CapacityId::Anuttara,
        1_780_300_100_000,
    )
    .expect("real route exists");

    let fake = epi_s5_epii_review_core::ReviewSubmission {
        source: epi_s5_epii_review_core::ReviewSource::Autoresearch,
        title: "Fake mediated route".to_owned(),
        body: "This must not be accepted as a real capacity workflow.".to_owned(),
        priority: epi_s5_epii_review_core::ReviewPriority::High,
        coordinate_context: serde_json::json!({
            "capacity_id": "nara",
            "candidate_id": "candidate:fake",
            "route_id": "route:fake",
            "orchestration_id": "orchestration:fake"
        }),
        proposed_action: None,
        requires_human: false,
        kernel_visibility: None,
        governance_profile: Some(epi_s5_epii_review_core::GovernanceProfile {
            category: ReviewCategory::NaraAnimaPrimaryGate,
            gate_kind: GateKind::AnimaPrimary,
            governance_level: epi_s5_epii_review_core::GovernanceLevel::Advisory,
            required_actors: vec!["anima".to_owned()],
            candidate_id: Some("candidate:fake".to_owned()),
            orchestration_id: Some("orchestration:fake".to_owned()),
            source_artifact_refs: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md#6"
                    .to_owned(),
            ],
            target_subsystem: Some("Nara".to_owned()),
            vector_kind: Some("NaraDialogueCorpusAddition".to_owned()),
            promotion_destination: Some("m5-prime://nara/dialogue-adapter".to_owned()),
            source_actor_detail: Some("nara".to_owned()),
            stage_records: Vec::new(),
        }),
    };
    review.submit(fake).expect("fake review should persist");

    let error = build_capacity_workflow_snapshot(&autoresearch, &review)
        .expect_err("snapshot must reject IDs that are not backed by the autoresearch store");
    assert!(error.contains("candidate:fake"));
}
