use epi_s5_epii_autoresearch_core::spine::{ImprovementVectorKind, ObservationEvidence};
use epi_s5_epii_autoresearch_core::{
    ArtifactRef, ClosureKind, ContentTypeRegister, CreateOrchestrationRequest, DiscardReason,
    ImprovementCandidate, ImprovementStore, OrchestrationState, ProposeRequest, RetryPolicy,
    ReviewStage, SensitivityClass, SurfaceActor, SurfacingPipelineId, TargetSubsystem,
    TransitionOrchestrationRequest,
};

fn candidate(fingerprint: &str) -> ImprovementCandidate {
    let request = ProposeRequest {
        target_family: "S".to_owned(),
        target_coordinate: "S5/Epii".to_owned(),
        direction: "Epii spine mechanism orchestration fixture".to_owned(),
        source_review_item_id: None,
        baseline: ArtifactRef {
            path: format!("vault://baseline/{fingerprint}.md"),
            coordinate: Some("S5/Epii".to_owned()),
            kind: Some("baseline_artifact".to_owned()),
        },
    };
    let mut candidate = ImprovementCandidate::from_propose(
        request,
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "orchestration".to_owned(),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: format!("autoresearch://fixture/{fingerprint}"),
            summary: "orchestration test observation".to_owned(),
            observed_at: Some(1_780_000_000_000),
            fingerprint: Some(fingerprint.to_owned()),
        },
        1_780_000_000_000,
        SurfaceActor::Epii,
        SensitivityClass::RequiresReview,
    )
    .expect("candidate should build");
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    candidate
}

fn seeded_orchestration(
    store: &ImprovementStore,
    fingerprint: &str,
    now_ms: u128,
) -> (
    epi_s5_epii_autoresearch_core::SurfacedCandidateReceipt,
    epi_s5_epii_autoresearch_core::OrchestrationRecord,
) {
    let surfaced = store
        .surface_candidate(candidate(fingerprint))
        .expect("surface candidate");
    let orchestration = store
        .create_orchestration(CreateOrchestrationRequest {
            candidate_id: surfaced.candidate.candidate_id.clone(),
            route_id: surfaced.routes[0].route_id.clone(),
            review_item_id: Some(format!("review-{fingerprint}")),
            timeout_after_ms: Some(1_000),
            retry_policy: RetryPolicy {
                max_attempts: 1,
                attempts: 0,
                backoff_ms: 10,
            },
            now_ms,
        })
        .expect("orchestration persists");
    (surfaced, orchestration)
}

#[test]
fn state_machine_allows_legal_transitions_and_rejects_illegal_transition_exactly() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let (_surfaced, orchestration) = seeded_orchestration(&store, "legal-transition", 10);

    let in_review = store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::InReview,
            reason: "review item submitted".to_owned(),
            now_ms: 20,
            review_stage: Some(ReviewStage::HumanReview),
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("queued -> in_review is legal");
    assert_eq!(in_review.state, OrchestrationState::InReview);
    assert_eq!(in_review.review_stage, ReviewStage::HumanReview);

    let awaiting = store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::AwaitingUserValidation,
            reason: "human review requires user validation".to_owned(),
            now_ms: 30,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("in_review -> awaiting_user_validation is legal");
    assert_eq!(awaiting.state, OrchestrationState::AwaitingUserValidation);

    let illegal = store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id,
            next_state: OrchestrationState::Promoted,
            reason: "skip integration".to_owned(),
            now_ms: 40,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: Some("promotion-plan".to_owned()),
        })
        .expect_err("awaiting_user_validation -> promoted is illegal");
    assert_eq!(
        illegal,
        "illegal orchestration transition: AwaitingUserValidation -> Promoted"
    );
}

#[test]
fn orchestration_persists_reloads_and_transitions_with_updated_json_state() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let (_surfaced, orchestration) = seeded_orchestration(&store, "persist-transition", 100);

    let reopened = ImprovementStore::new(temp.path());
    assert_eq!(reopened.orchestrations().expect("read").len(), 1);
    let discarded = reopened
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::Discarded,
            reason: "human rejected candidate".to_owned(),
            now_ms: 150,
            review_stage: Some(ReviewStage::Resolved),
            discard_reason: Some(DiscardReason::HumanRejected),
            promotion_plan_id: None,
        })
        .expect("queued -> discarded is legal");

    let reread = ImprovementStore::new(temp.path())
        .orchestrations()
        .expect("reread");
    assert_eq!(reread[0].state, OrchestrationState::Discarded);
    assert_eq!(reread[0].discard_reason, Some(DiscardReason::HumanRejected));
    assert_eq!(reread[0].updated_at, discarded.updated_at);
}

#[test]
fn timeout_surfaces_real_epii_on_epii_meta_candidate_for_stalled_route() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let (_surfaced, orchestration) = seeded_orchestration(&store, "timeout-meta", 1_000);

    let receipts = store
        .apply_orchestration_timeouts(2_001)
        .expect("timeouts apply");

    assert_eq!(receipts.len(), 1);
    assert_eq!(
        receipts[0].candidate.candidate.surfacing_pipeline,
        SurfacingPipelineId::EpiiOnEpiiMeta
    );
    assert_eq!(
        receipts[0].candidate.candidate.target_subsystem,
        TargetSubsystem::Epii
    );
    assert!(receipts[0]
        .candidate
        .candidate
        .observation_evidence
        .source_uri
        .contains(&orchestration.orchestration_id));

    let records = store.orchestrations().expect("orchestrations");
    assert_eq!(records[0].state, OrchestrationState::Abandoned);
    assert_eq!(
        records[0].discard_reason,
        Some(DiscardReason::TimeoutAbandoned)
    );
    assert_eq!(store.candidates().expect("candidates").len(), 2);
}

#[test]
fn continuity_exposes_pending_integration_validation_suppression_and_verification() {
    let temp = tempfile::tempdir().expect("tempdir");
    let store = ImprovementStore::new(temp.path());
    let (_a, first) = seeded_orchestration(&store, "continuity-a", 10);
    let (_b, second) = seeded_orchestration(&store, "continuity-b", 20);
    let (_c, third) = seeded_orchestration(&store, "continuity-c", 30);

    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: first.orchestration_id,
            next_state: OrchestrationState::InReview,
            reason: "reviewing".to_owned(),
            now_ms: 40,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("reviewing");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: second.orchestration_id.clone(),
            next_state: OrchestrationState::InReview,
            reason: "reviewing".to_owned(),
            now_ms: 50,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("reviewing");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: second.orchestration_id,
            next_state: OrchestrationState::AwaitingUserValidation,
            reason: "awaiting user".to_owned(),
            now_ms: 60,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("awaiting");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: third.orchestration_id.clone(),
            next_state: OrchestrationState::InReview,
            reason: "reviewing".to_owned(),
            now_ms: 70,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("reviewing");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: third.orchestration_id.clone(),
            next_state: OrchestrationState::AwaitingUserValidation,
            reason: "awaiting user".to_owned(),
            now_ms: 80,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("awaiting");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: third.orchestration_id.clone(),
            next_state: OrchestrationState::Integrating,
            reason: "integrating".to_owned(),
            now_ms: 90,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("integrating");
    store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: third.orchestration_id,
            next_state: OrchestrationState::Verifying,
            reason: "verify".to_owned(),
            now_ms: 100,
            review_stage: None,
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("verifying");

    let continuity = store.cross_cycle_continuity(200).expect("continuity");
    assert_eq!(continuity.pending_articulations.len(), 1);
    assert_eq!(continuity.user_validation_awaits.len(), 1);
    assert_eq!(continuity.verification_schedule.len(), 1);
    assert_eq!(continuity.suppression_windows.len(), 3);
    assert!(continuity
        .continuity_hints
        .iter()
        .any(|hint| hint.kind == "integration_verification"));
}
