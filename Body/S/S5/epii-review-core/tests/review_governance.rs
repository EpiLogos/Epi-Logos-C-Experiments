use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewInboxFilter, ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStageRecord,
    ReviewStatus, ReviewStore, ReviewSubmission,
};
use serde_json::json;

fn governance_profile(
    category: ReviewCategory,
    gate_kind: GateKind,
    governance_level: GovernanceLevel,
) -> GovernanceProfile {
    GovernanceProfile {
        category,
        gate_kind,
        governance_level,
        required_actors: vec!["human".to_owned()],
        candidate_id: Some("candidate:gov-test".to_owned()),
        orchestration_id: Some("orchestration:gov-test".to_owned()),
        source_artifact_refs: vec!["vault://review/source.md".to_owned()],
        target_subsystem: Some("Epii".to_owned()),
        vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
        promotion_destination: Some("epii://deployment/gate".to_owned()),
        source_actor_detail: Some("autoresearch".to_owned()),
        stage_records: vec![ReviewStageRecord {
            stage: "submitted".to_owned(),
            actor: "autoresearch".to_owned(),
            at_ms: 1_780_000_000_000,
            note: "governance fixture submitted".to_owned(),
        }],
    }
}

fn submit_governed(
    store: &ReviewStore,
    category: ReviewCategory,
    gate_kind: GateKind,
    level: GovernanceLevel,
) -> String {
    store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Governed review".to_owned(),
            body: "Review requires explicit governance handling.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"coordinate": "S5/S5'"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: Some(governance_profile(category, gate_kind, level)),
        })
        .expect("governed review should submit")
        .item_id
}

#[test]
fn agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates() {
    let root = temp_store_root("agent_can_defer_but_not_approve_governed_gates");
    let store = ReviewStore::new(&root);
    let cases = [
        (
            ReviewCategory::RecursiveSelfModification,
            GateKind::RecursiveSelfModification,
            GovernanceLevel::RecursiveLoadBearing,
        ),
        (
            ReviewCategory::DeploymentGate,
            GateKind::DeploymentGate,
            GovernanceLevel::DeploymentBlocking,
        ),
        (
            ReviewCategory::UserFinalValidation,
            GateKind::HumanFinal,
            GovernanceLevel::HumanRequired,
        ),
    ];

    for (idx, (category, gate_kind, level)) in cases.into_iter().enumerate() {
        let item_id = submit_governed(&store, category, gate_kind, level);
        let error = store
            .resolve(ReviewResolveRequest {
                item_id: item_id.clone(),
                decision: ReviewDecision::Approve,
                rationale: format!("agent approval attempt {idx}"),
                resolved_by: ResolutionActor::Agent("epii".to_owned()),
                promotion_destination: None,
                promoted_artifact: None,
            })
            .expect_err("agent must not approve governed gate");
        assert!(error.contains("requires human resolution"));

        store
            .resolve(ReviewResolveRequest {
                item_id,
                decision: ReviewDecision::Defer,
                rationale: "defer to human gate".to_owned(),
                resolved_by: ResolutionActor::Agent("epii".to_owned()),
                promotion_destination: None,
                promoted_artifact: None,
            })
            .expect("agent may defer governed gate");
    }
}

#[test]
fn nara_gate_represents_anima_primary_metadata_without_forcing_human_resolution() {
    let root = temp_store_root("nara_gate_represents_anima_primary_metadata");
    let store = ReviewStore::new(&root);
    let mut profile = governance_profile(
        ReviewCategory::NaraAnimaPrimaryGate,
        GateKind::AnimaPrimary,
        GovernanceLevel::Advisory,
    );
    profile.required_actors = vec!["anima".to_owned()];
    profile.target_subsystem = Some("Nara".to_owned());
    profile.vector_kind = Some("NaraDialogueCorpusAddition".to_owned());

    let item = store
        .submit(ReviewSubmission {
            source: ReviewSource::Anima,
            title: "Nara dialogue gate".to_owned(),
            body: "Anima-primary Nara review before downstream deployment.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "M4/S4"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: Some(profile),
        })
        .expect("Nara gate should submit");

    store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Revise,
            rationale: "Anima requests dialogic polish".to_owned(),
            resolved_by: ResolutionActor::Agent("anima".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("Anima-primary advisory gate can be resolved by Anima");

    let history = store.history(None).expect("history");
    let governance = history.items[0].governance_profile.as_ref().unwrap();
    assert_eq!(governance.category, ReviewCategory::NaraAnimaPrimaryGate);
    assert_eq!(governance.required_actors, vec!["anima"]);
    assert_eq!(governance.target_subsystem.as_deref(), Some("Nara"));
}

#[test]
fn review_history_persists_governance_metadata_and_linked_ids() {
    let root = temp_store_root("review_history_persists_governance_metadata");
    let store = ReviewStore::new(&root);
    let item_id = submit_governed(
        &store,
        ReviewCategory::CanonRecognitionPublicationGate,
        GateKind::PublicationGate,
        GovernanceLevel::PublicationBlocking,
    );

    store
        .resolve(ReviewResolveRequest {
            item_id: item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "human approves publication".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: Some("canon://publication/s5".to_owned()),
            promoted_artifact: Some(json!({"artifact": "vault://review/source.md"})),
        })
        .expect("human may approve publication gate");

    let history = ReviewStore::new(&root)
        .history(None)
        .expect("history reloads");
    assert_eq!(history.items.len(), 1);
    assert_eq!(history.items[0].status, ReviewStatus::Resolved);
    let profile = history.items[0].governance_profile.as_ref().unwrap();
    assert_eq!(profile.candidate_id.as_deref(), Some("candidate:gov-test"));
    assert_eq!(
        profile.orchestration_id.as_deref(),
        Some("orchestration:gov-test")
    );
    assert_eq!(profile.stage_records[0].stage, "submitted");

    let open = store
        .inbox(ReviewInboxFilter {
            status: Some(ReviewStatus::Open),
            source: None,
            limit: None,
        })
        .expect("open inbox");
    assert!(open.items.is_empty());
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s5-review-governance-{test_name}-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
