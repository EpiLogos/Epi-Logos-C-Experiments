use epi_s5_epii_review_core::{
    ResolutionActor, ReviewDecision, ReviewInboxFilter, ReviewResolveRequest, ReviewSource,
    ReviewStatus, ReviewStore,
};

const REVIEW_FIXTURE: &str = include_str!("../../fixtures/track-04-t0/s5-review-state.json");

#[test]
fn tranche_04_t0_review_fixture_loads_through_public_store() {
    let root = temp_store_root("baseline-review-fixture");
    std::fs::write(root.join("s5-review-state.json"), REVIEW_FIXTURE).expect("write fixture");

    let store = ReviewStore::new(&root);
    let inbox = store
        .inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: Some(ReviewSource::HumanGate),
            limit: None,
        })
        .expect("fixture inbox should deserialize");

    assert_eq!(inbox.items.len(), 1);
    assert_eq!(inbox.items[0].item_id, "track-04-t0-review-open");
    assert!(inbox.items[0].requires_human);

    let history = store.history(None).expect("fixture history should load");
    assert_eq!(history.items.len(), 1);
    assert_eq!(history.items[0].item_id, "track-04-t0-review-resolved");
    assert_eq!(history.resolutions.len(), 1);
    assert_eq!(history.resolutions[0].decision, ReviewDecision::Revise);
}

#[test]
fn tranche_04_t0_human_required_fixture_still_blocks_agent_approval() {
    let root = temp_store_root("baseline-review-human-required");
    std::fs::write(root.join("s5-review-state.json"), REVIEW_FIXTURE).expect("write fixture");

    let store = ReviewStore::new(&root);
    let err = store
        .resolve(ReviewResolveRequest {
            item_id: "track-04-t0-review-open".to_owned(),
            decision: ReviewDecision::Approve,
            rationale: "Agent must not be enough for human-required fixture.".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect_err("agent approval must stay blocked");

    assert!(err.contains("requires human resolution"));
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-review-{test_name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
