use epi_s5_epii_autoresearch_core::capacity_workflows::{
    build_epii_spine_state_inspector, run_epii_recursive_governance_slice,
    validate_recursive_gate_weakening, RecursiveGateWeakeningRequest, RecursiveReviewProtocolKind,
};
use epi_s5_epii_autoresearch_core::{
    EvaluationEvidence, EvidenceSourceRef, ImprovementStore, PromoteRequest, PromotionDestination,
    PromotionHenTimestamp, TargetSubsystem,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
use serde_json::json;
use std::path::PathBuf;

#[test]
fn recursive_spine_protocol_requires_human_final_and_persisted_inspector_is_handle_only() {
    let root = temp_root("spine-protocol");
    let autoresearch = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let review = ReviewStore::new(root.join("s5/epii-review"));

    seed_recursive_history(&review);
    seed_protected_nara_review(&review);

    let history = review.history(None).expect("history should load");
    let surfaced = autoresearch
        .surface_epii_review_inconsistency_from_history(
            &history,
            "review://s5/history/recursive-window",
            1_780_204_000_000,
        )
        .expect("history adapter should run")
        .expect("recursive review inconsistency should surface");
    assert_eq!(
        surfaced.candidate.candidate.target_subsystem,
        TargetSubsystem::Epii
    );

    let receipt = run_epii_recursive_governance_slice(
        &autoresearch,
        &review,
        surfaced.clone(),
        1_780_204_000_500,
    )
    .expect("recursive governance slice should submit");
    assert_eq!(receipt.review_item.requires_human, true);
    assert_eq!(receipt.protocols.len(), 5);
    assert!(receipt
        .protocols
        .iter()
        .any(|protocol| protocol.kind == RecursiveReviewProtocolKind::SophiaOnSophia));
    assert!(receipt.protocols.iter().all(|protocol| {
        protocol.self_review_marked
            && protocol
                .pi_structured_evidence_ref
                .starts_with("s5://epii/pi-evidence/")
            && protocol
                .anima_tone_check_ref
                .starts_with("s5://epii/anima-tone/")
    }));

    for decision in [
        ReviewDecision::Approve,
        ReviewDecision::Reject,
        ReviewDecision::Revise,
    ] {
        let error = review
            .resolve(ReviewResolveRequest {
                item_id: receipt.review_item.item_id.clone(),
                decision,
                rationale: format!("agent attempts {decision:?} on recursive spine change"),
                resolved_by: ResolutionActor::Agent("sophia".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                promoted_artifact: None,
            })
            .expect_err("agents must not terminally resolve recursive spine changes");
        assert!(error.contains("requires human resolution"));
    }

    autoresearch
        .evaluate(
            &receipt.surfaced.run.run_id,
            vec![EvaluationEvidence {
                dimension: "recursive_spine_evidence".to_owned(),
                baseline_score: 0.40,
                challenger_score: 0.87,
                weight: 1.0,
                notes: "real review history produced recursive governance evidence".to_owned(),
                source_refs: vec![EvidenceSourceRef {
                    kind: "review_history_window".to_owned(),
                    uri: "review://s5/history/recursive-window".to_owned(),
                    coordinate: Some("M5/Epii".to_owned()),
                    summary: Some("deferred and rejected review history".to_owned()),
                }],
                kernel_evidence: None,
            }],
        )
        .expect("run evaluation should persist");
    let promotion_without_human = autoresearch
        .promote(PromoteRequest {
            run_id: receipt.surfaced.run.run_id.clone(),
            destination: PromotionDestination::EpiiSpineMechanismUpdate {
                spine_component: "recursive-review".to_owned(),
            },
            legacy_destination: Some("epii:spine".to_owned()),
            approved_review_resolution_id: receipt.review_item.item_id.clone(),
            review_store_root: review.root_path().to_path_buf(),
            vault_root: root.join("vault"),
            compiler_root: root.join("compiler"),
            artifact_slug: "epii-recursive-spine".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 11, 0, 0)),
            dry_run: true,
        })
        .expect_err("dry-run promotion planning must wait for human final validation");
    assert!(promotion_without_human.contains("approved review resolution not found"));

    review
        .resolve(ReviewResolveRequest {
            item_id: receipt.review_item.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "Human final-validates recursive spine dry-run planning.".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: Some(json!({"spine_component": "recursive-review"})),
        })
        .expect("human final recursive approval should persist");
    ensure_source_note(&root);
    let promotion_after_human = autoresearch
        .promote(PromoteRequest {
            run_id: receipt.surfaced.run.run_id.clone(),
            destination: PromotionDestination::EpiiSpineMechanismUpdate {
                spine_component: "recursive-review".to_owned(),
            },
            legacy_destination: Some("epii:spine".to_owned()),
            approved_review_resolution_id: receipt.review_item.item_id.clone(),
            review_store_root: review.root_path().to_path_buf(),
            vault_root: root.join("vault"),
            compiler_root: root.join("compiler"),
            artifact_slug: "epii-recursive-spine".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 11, 5, 0)),
            dry_run: true,
        })
        .expect("human-approved recursive dry-run promotion plan");
    assert_eq!(
        promotion_after_human.governance_category,
        ReviewCategory::RecursiveSelfModification
    );

    let reloaded_autoresearch = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let reloaded_review = ReviewStore::new(root.join("s5/epii-review"));
    let snapshot = build_epii_spine_state_inspector(&reloaded_autoresearch, &reloaded_review)
        .expect("inspector snapshot should reload from persisted state");
    assert!(!snapshot.routing_configuration.is_empty());
    assert!(!snapshot.governance_gates.is_empty());
    assert!(!snapshot.recent_meta_loop_events.is_empty());
    assert!(!snapshot.continuity_hints.is_empty());
    assert!(!snapshot.effect_verification_schedules.is_empty());
    assert!(!snapshot.canon_evolution_refs.is_empty());
    assert!(snapshot
        .recursive_review_item_ids
        .contains(&receipt.review_item.item_id));

    let encoded = serde_json::to_string(&snapshot).expect("snapshot json");
    assert!(encoded.contains("review://s5/history/recursive-window"));
    assert!(!encoded.contains("RAW_NARA_BODY_DO_NOT_EXPORT"));
    assert!(!encoded.contains("protected dialogic journal text"));
}

#[test]
fn recursive_user_final_gate_cannot_be_weakened_without_human_meta_review() {
    let root = temp_root("gate-weakening");
    let autoresearch = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let review = ReviewStore::new(root.join("s5/epii-review"));

    seed_recursive_history(&review);
    let history = review.history(None).expect("history should load");
    let surfaced = autoresearch
        .surface_epii_review_inconsistency_from_history(
            &history,
            "review://s5/history/recursive-window",
            1_780_204_500_000,
        )
        .expect("history adapter should run")
        .expect("recursive candidate should surface");
    let receipt =
        run_epii_recursive_governance_slice(&autoresearch, &review, surfaced, 1_780_204_500_500)
            .expect("recursive governance slice");

    let blocked = validate_recursive_gate_weakening(
        &review,
        RecursiveGateWeakeningRequest {
            target_review_item_id: receipt.review_item.item_id.clone(),
            proposed_by: "epii".to_owned(),
            human_meta_review_item_id: None,
            rationale: "make recursive review advisory to move faster".to_owned(),
        },
    )
    .expect_err("weakening without meta-review must be rejected");
    assert!(blocked.contains("human-approved recursive meta-review"));

    let meta_review = review
        .submit(ReviewSubmission {
            source: ReviewSource::HumanGate,
            title: "Meta-review for recursive gate policy".to_owned(),
            body: "Human reviews whether this specific recursive gate can be reclassified."
                .to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"policy": "recursive-user-final-gate"}),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::RecursiveSelfModification,
                gate_kind: GateKind::RecursiveSelfModification,
                governance_level: GovernanceLevel::RecursiveLoadBearing,
                required_actors: vec!["human".to_owned(), "anima".to_owned()],
                candidate_id: None,
                orchestration_id: None,
                source_artifact_refs: vec!["review://s5/policy/recursive-gate".to_owned()],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("RecursiveUserFinalGatePolicy".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("human-meta-review".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("meta review should submit");
    review
        .resolve(ReviewResolveRequest {
            item_id: meta_review.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "Human explicitly approves this meta-review exception.".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: Some(json!({"gate_policy": "exception-reviewed"})),
        })
        .expect("human meta-review approval");

    let allowed = validate_recursive_gate_weakening(
        &review,
        RecursiveGateWeakeningRequest {
            target_review_item_id: receipt.review_item.item_id,
            proposed_by: "anima".to_owned(),
            human_meta_review_item_id: Some(meta_review.item_id.clone()),
            rationale: "human-approved bounded exception".to_owned(),
        },
    )
    .expect("human-approved meta-review should allow inspection of weakening request");
    assert_eq!(allowed.meta_review_item_id, meta_review.item_id);
    assert!(allowed.allowed);
}

fn seed_recursive_history(review: &ReviewStore) {
    let deferred = review
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Deferred recursive review".to_owned(),
            body: "Review timing grew during recursive inspection.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("deferred review submit");
    review
        .resolve(ReviewResolveRequest {
            item_id: deferred.item_id,
            decision: ReviewDecision::Defer,
            rationale: "needs another cycle".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("defer should persist");

    let rejected = review
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Rejected recursive shortcut".to_owned(),
            body: "Shortcut review was rejected.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("rejected review submit");
    review
        .resolve(ReviewResolveRequest {
            item_id: rejected.item_id,
            decision: ReviewDecision::Reject,
            rationale: "unsafe shortcut".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("reject should persist");
}

fn seed_protected_nara_review(review: &ReviewStore) {
    let nara = review
        .submit(ReviewSubmission {
            source: ReviewSource::Anima,
            title: "Nara protected body quarantine".to_owned(),
            body: "RAW_NARA_BODY_DO_NOT_EXPORT protected dialogic journal text".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"target_subsystem": "Nara"}),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::NaraAnimaPrimaryGate,
                gate_kind: GateKind::AnimaPrimary,
                governance_level: GovernanceLevel::HumanRequired,
                required_actors: vec!["human".to_owned(), "anima".to_owned()],
                candidate_id: None,
                orchestration_id: None,
                source_artifact_refs: vec!["nara://handle/consented-pii-stripped".to_owned()],
                target_subsystem: Some("Nara".to_owned()),
                vector_kind: Some("NaraDialogueCorpusAddition".to_owned()),
                promotion_destination: Some("nara:adapter".to_owned()),
                source_actor_detail: Some("nara-handle-only-test".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("nara review should submit");
    review
        .resolve(ReviewResolveRequest {
            item_id: nara.item_id,
            decision: ReviewDecision::Defer,
            rationale: "keep protected body quarantined".to_owned(),
            resolved_by: ResolutionActor::Agent("anima".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("nara defer");
}

fn ensure_source_note(root: &std::path::Path) {
    let note = root.join("vault/Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(note.parent().expect("note parent")).expect("note dir");
    std::fs::write(
        note,
        "# Recursive Spine Test\n\nSource evidence: review://s5/history/recursive-window\n",
    )
    .expect("write note");
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-s5-recursive-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
