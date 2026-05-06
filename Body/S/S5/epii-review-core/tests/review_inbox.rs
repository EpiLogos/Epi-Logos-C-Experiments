use epi_s5_epii_review_core::{
    ResolutionActor, ReviewDecision, ReviewInboxFilter, ReviewPriority, ReviewResolveRequest,
    ReviewSource, ReviewStatus, ReviewStore, ReviewSubmission,
};

#[test]
fn submit_persists_anima_review_item_and_lists_open_inbox() {
    let root = temp_store_root("submit_persists_anima_review_item_and_lists_open_inbox");
    let store = ReviewStore::new(&root);

    let item = store
        .submit(ReviewSubmission {
            source: ReviewSource::Anima,
            title: "Validate compiler dry run".to_owned(),
            body: "Anima finished an S1 compiler plan and needs Epii review.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: serde_json::json!({
                "coordinate": "S1/S1'",
                "agent_id": "anima",
                "session_key": "test-session"
            }),
            proposed_action: None,
            requires_human: false,
        })
        .expect("review item should submit");

    assert_eq!(item.source, ReviewSource::Anima);
    assert_eq!(item.status, ReviewStatus::Open);
    assert_eq!(item.coordinate_context["coordinate"], "S1/S1'");

    let reopened = ReviewStore::new(&root);
    let inbox = reopened
        .inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: Some(ReviewSource::Anima),
            limit: Some(10),
        })
        .expect("review inbox should load");

    assert_eq!(inbox.items.len(), 1);
    assert_eq!(inbox.items[0].item_id, item.item_id);
}

#[test]
fn human_required_review_cannot_be_resolved_by_agent() {
    let root = temp_store_root("human_required_review_cannot_be_resolved_by_agent");
    let store = ReviewStore::new(&root);
    let item = store
        .submit(ReviewSubmission {
            source: ReviewSource::HumanGate,
            title: "Approve live Neo4j mutation".to_owned(),
            body: "A live graph write requires human validation.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: serde_json::json!({"coordinate": "S2/S2'"}),
            proposed_action: None,
            requires_human: true,
        })
        .expect("human-gated item should submit");

    let error = store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "Looks fine".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect_err("agent must not approve a human-gated review");

    assert!(error.contains("requires human resolution"));

    let resolution = store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Defer,
            rationale: "Waiting for user validation".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("agent may defer a human-gated item");

    assert_eq!(resolution.decision, ReviewDecision::Defer);

    let deferred = store
        .inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Deferred),
            source: None,
            limit: None,
        })
        .expect("deferred inbox should load");

    assert_eq!(deferred.items.len(), 1);
    assert_eq!(deferred.items[0].item_id, item.item_id);
}

#[test]
fn resolved_review_moves_to_history_with_resolution_record() {
    let root = temp_store_root("resolved_review_moves_to_history_with_resolution_record");
    let store = ReviewStore::new(&root);
    let item = store
        .submit(ReviewSubmission {
            source: ReviewSource::Aletheia,
            title: "Crystallise note".to_owned(),
            body: "Aletheia proposes a return artifact.".to_owned(),
            priority: ReviewPriority::Normal,
            coordinate_context: serde_json::json!({"coordinate": "S5/S5'"}),
            proposed_action: None,
            requires_human: false,
        })
        .expect("item should submit");

    let resolution = store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Revise,
            rationale: "Needs clearer wikilinks before promotion.".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("Epii should resolve non-human-gated review");

    assert_eq!(resolution.item_id, item.item_id);
    assert_eq!(
        resolution.resolved_by,
        ResolutionActor::Agent("epii".to_owned())
    );

    let history = store.history(None).expect("history should load");
    assert_eq!(history.items.len(), 1);
    assert_eq!(history.items[0].status, ReviewStatus::Resolved);
    assert_eq!(history.resolutions.len(), 1);
    assert_eq!(history.resolutions[0].decision, ReviewDecision::Revise);
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-review-{test_name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
