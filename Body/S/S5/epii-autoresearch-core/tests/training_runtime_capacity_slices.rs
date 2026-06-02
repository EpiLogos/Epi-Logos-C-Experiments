use epi_s5_epii_autoresearch_core::adapters::{
    MahamayaRuntimeTrainingReport, ParamasivaCorpusRefreshReport,
};
use epi_s5_epii_autoresearch_core::capacity_workflows::{
    run_mahamaya_runtime_capacity_slice, run_paramasiva_training_capacity_slice,
    AgentAnnotationKind, MahamayaRuntimeTier, SliceGovernanceClass,
};
use epi_s5_epii_autoresearch_core::{ImprovementStore, TargetSubsystem};
use epi_s5_epii_review_core::{ResolutionActor, ReviewDecision, ReviewResolveRequest, ReviewStore};
use std::path::PathBuf;

#[test]
fn paramasiva_corpus_refresh_requires_co_review_and_dry_run_plan() {
    let root = temp_root("paramasiva-training-slice");
    let vault = root.join("Idea");
    let source = vault.join("Bimba/Seeds/M/M5'/paramasiva-corpus-manifest.json");
    std::fs::create_dir_all(source.parent().unwrap()).expect("source parent");
    std::fs::write(
        &source,
        r#"{
          "manifest_id": "paramasiva-corpus-2026-w23",
          "segments": ["M1-prime-spec", "alpha-quaternionic-integration"],
          "synthetic_proof_review_uri": "s5://reviews/synthetic-proof/paramasiva-001"
        }"#,
    )
    .expect("source fixture");

    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));
    let receipt = run_paramasiva_training_capacity_slice(
        &autoresearch,
        &review,
        ParamasivaCorpusRefreshReport {
            manifest_uri: source.to_string_lossy().to_string(),
            corpus_segment: "alpha-quaternionic-integration".to_owned(),
            retrieval_metric_name: "canonical_eval_perplexity".to_owned(),
            current_metric_value: 1.18,
            maximum_acceptable_value: 1.10,
            new_derivational_tokens: 64_000,
            synthetic_proof_review_uri: "s5://reviews/synthetic-proof/paramasiva-001".to_owned(),
            gds_augmentation_uri: "graph://s2/gds/paramasiva/path-patterns/2026-w23".to_owned(),
            observed_at_ms: 1_780_401_000_000,
            fingerprint: Some("paramasiva-corpus-2026-w23".to_owned()),
        },
        vault,
        root.join("Body/S/S1/hen-compiler"),
        1_780_401_000_000,
    )
    .expect("Paramasiva slice should run from a real corpus manifest fixture");

    assert_eq!(receipt.capacity, TargetSubsystem::Paramasiva);
    assert_eq!(receipt.governance_class, SliceGovernanceClass::LoadBearing);
    let required_actors = &receipt
        .review_item
        .governance_profile
        .as_ref()
        .expect("governance profile")
        .required_actors;
    assert!(required_actors.contains(&"sophia".to_owned()));
    assert!(required_actors.contains(&"epii".to_owned()));
    assert!(receipt.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::SophiaReview
            && annotation.note.contains("corpus composition")
    }));
    assert!(receipt.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::PiTrainingDispatch
            && annotation.note.contains("CPT/RAG")
    }));
    assert!(receipt
        .evidence_deposits
        .iter()
        .all(|deposit| !deposit.mutates_graph_or_canon));

    let promotion = receipt
        .promotion_plan
        .as_ref()
        .expect("Paramasiva dry-run promotion plan");
    assert!(promotion.ok);
    assert!(promotion.dry_run);
    assert_eq!(promotion.promoted_path, None);
}

#[test]
fn mahamaya_runtime_slice_enforces_tier_gate_and_rollback_handle() {
    let root = temp_root("mahamaya-runtime-slice");
    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));
    let receipt = run_mahamaya_runtime_capacity_slice(
        &autoresearch,
        &review,
        MahamayaRuntimeTrainingReport {
            report_uri: "s5://training/mahamaya/federated-round-2026-w23".to_owned(),
            training_round_id: "federated-round-2026-w23".to_owned(),
            tier: MahamayaRuntimeTier::RuntimePolicy,
            reward_metric_name: "process_reward_acceptance".to_owned(),
            current_reward_score: 0.63,
            minimum_reward_score: 0.74,
            pathway_diversity_score: 0.58,
            minimum_pathway_diversity: 0.70,
            rollback_handle: "rollback://mahamaya/policy/prior-2026-w22".to_owned(),
            integration_impact_uri: "s5://integration/mahamaya/policy-impact-2026-w23".to_owned(),
            observed_at_ms: 1_780_401_500_000,
            fingerprint: Some("mahamaya-federated-round-2026-w23".to_owned()),
        },
        1_780_401_500_000,
    )
    .expect("Mahamaya runtime slice should run from a structured training report");

    assert_eq!(receipt.capacity, TargetSubsystem::Mahamaya);
    assert_eq!(receipt.governance_class, SliceGovernanceClass::LoadBearing);
    assert!(receipt.review_item.requires_human);
    assert!(receipt.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::PiRollbackImpactCheck
            && annotation
                .source_refs
                .iter()
                .any(|source| source.starts_with("rollback://"))
    }));
    assert!(receipt.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::AnimaAestheticCheck
            && annotation.note.contains("user-pathway diversity")
    }));
    assert!(receipt.evidence_deposits.iter().all(|deposit| {
        deposit.summary.contains("rollback")
            && deposit.source_uri.starts_with("s5://training/mahamaya")
            && !deposit.mutates_graph_or_canon
    }));
    assert!(receipt.promotion_plan.is_none());

    let agent_approval = review.resolve(ReviewResolveRequest {
        item_id: receipt.review_item.item_id.clone(),
        decision: ReviewDecision::Approve,
        rationale: "agent must not approve runtime policy deployment gate".to_owned(),
        resolved_by: ResolutionActor::Agent("epii".to_owned()),
        promotion_destination: Some("mahamaya:policy".to_owned()),
        promoted_artifact: None,
    });
    assert!(agent_approval.is_err());
}

#[test]
fn training_runtime_reports_reject_missing_source_refs_and_metrics() {
    let root = temp_root("training-runtime-rejections");
    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));

    let missing_source = run_paramasiva_training_capacity_slice(
        &autoresearch,
        &review,
        ParamasivaCorpusRefreshReport {
            manifest_uri: " ".to_owned(),
            corpus_segment: "alpha".to_owned(),
            retrieval_metric_name: "canonical_eval_perplexity".to_owned(),
            current_metric_value: 1.2,
            maximum_acceptable_value: 1.1,
            new_derivational_tokens: 1,
            synthetic_proof_review_uri: "s5://reviews/synthetic-proof/paramasiva".to_owned(),
            gds_augmentation_uri: "graph://s2/gds/paramasiva".to_owned(),
            observed_at_ms: 1,
            fingerprint: None,
        },
        root.join("Idea"),
        root.join("Body/S/S1/hen-compiler"),
        1,
    );
    assert!(missing_source
        .expect_err("missing manifest URI should reject")
        .contains("manifest_uri is required"));

    let missing_metrics = run_mahamaya_runtime_capacity_slice(
        &autoresearch,
        &review,
        MahamayaRuntimeTrainingReport {
            report_uri: "s5://training/mahamaya/missing-metrics".to_owned(),
            training_round_id: "missing-metrics".to_owned(),
            tier: MahamayaRuntimeTier::Sandbox,
            reward_metric_name: " ".to_owned(),
            current_reward_score: 0.9,
            minimum_reward_score: 0.8,
            pathway_diversity_score: 0.9,
            minimum_pathway_diversity: 0.8,
            rollback_handle: "rollback://mahamaya/sandbox/prior".to_owned(),
            integration_impact_uri: "s5://integration/mahamaya/sandbox".to_owned(),
            observed_at_ms: 1,
            fingerprint: None,
        },
        1,
    );
    assert!(missing_metrics
        .expect_err("blank reward metric should reject")
        .contains("reward_metric_name is required"));
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-s5-09t6-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
