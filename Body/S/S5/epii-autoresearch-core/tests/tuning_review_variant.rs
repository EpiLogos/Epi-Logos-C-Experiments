use epi_s5_epii_autoresearch_core::capacity_workflows::{
    capacity_workflow_registry, route_capacity_workflow, CapacityId,
};
use epi_s5_epii_autoresearch_core::ImprovementStore;
use epi_s5_epii_review_core::{GateKind, GovernanceLevel, ReviewStore};

#[test]
fn tuning_review_routes_as_a_human_gated_sophia_capacity_lane() {
    let temp = tempfile::tempdir().expect("tempdir");
    let autoresearch = ImprovementStore::new(temp.path().join("autoresearch"));
    let review = ReviewStore::new(temp.path().join("review"));

    let entry = capacity_workflow_registry()
        .into_iter()
        .find(|entry| entry.capacity_id == CapacityId::TuningReview)
        .expect("TuningReview registry entry");
    assert_eq!(entry.governance_lead, "sophia");
    assert_eq!(entry.gate_kind, GateKind::HumanFinal);
    assert_eq!(entry.governance_level, GovernanceLevel::HumanRequired);

    let receipt = route_capacity_workflow(
        &autoresearch,
        &review,
        CapacityId::TuningReview,
        1_780_400_000_000,
    )
    .expect("TuningReview should use the real capacity workflow stores");

    assert!(receipt.review_item.requires_human);
    assert_eq!(
        receipt
            .review_item
            .governance_profile
            .as_ref()
            .expect("TuningReview governance")
            .gate_kind,
        GateKind::HumanFinal
    );
}
