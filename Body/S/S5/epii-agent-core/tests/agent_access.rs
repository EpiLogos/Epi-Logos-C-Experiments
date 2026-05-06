use epi_s5_epii_agent_core::{DepositArtifact, DepositRequest, DepositType, EpiiAgentAccess};
use epi_s5_epii_autoresearch_core::{
    ArtifactRef, EvaluationEvidence, EvidenceSourceRef, ImprovementStore, ProposeRequest,
};
use epi_s5_epii_review_core::{ReviewPriority, ReviewSource, ReviewStore, ReviewSubmission};
use serde_json::json;
use std::path::PathBuf;

#[test]
fn snapshot_reads_real_review_and_autoresearch_state() {
    let root = temp_root("snapshot");
    let review_store = ReviewStore::new(root.join("s5/epii-review"));
    let improve_store = ImprovementStore::new(root.join("s5/epii-autoresearch"));

    review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Anima,
            title: "Validate dispatch result".to_owned(),
            body: "Anima requests Epii meaning review before promotion.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S4/S4' -> S5/S5'"}),
            proposed_action: None,
            requires_human: false,
        })
        .expect("review deposit should persist");

    let run = improve_store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "tighten Epii agent access to review/autoresearch".to_owned(),
            source_review_item_id: None,
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("improvement proposal should persist");
    improve_store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "agent_access".to_owned(),
                baseline_score: 0.2,
                challenger_score: 0.8,
                weight: 1.0,
                notes: "Challenger exposes the real stores to the Epii agent core.".to_owned(),
                source_refs: vec![EvidenceSourceRef {
                    kind: "epii_agent_snapshot".to_owned(),
                    uri: "s5'.epii.status#/world_return".to_owned(),
                    coordinate: Some("S5/S5'".to_owned()),
                    summary: Some(
                        "Epii observed review and autoresearch state through real stores."
                            .to_owned(),
                    ),
                }],
            }],
        )
        .expect("improvement evaluation should persist");

    let snapshot = EpiiAgentAccess::new(&root)
        .snapshot()
        .expect("snapshot should read real state");

    assert_eq!(snapshot.agent_id, "epii");
    assert_eq!(snapshot.coordinate, "S5/S5'");
    assert_eq!(snapshot.review.open_count, 1);
    assert_eq!(snapshot.improvement.keep_count, 1);
    assert!(snapshot
        .gateway_methods
        .contains(&"s5'.review.submit".to_owned()));
    assert!(snapshot
        .gateway_methods
        .contains(&"s5'.improve.propose".to_owned()));
}

#[test]
fn anima_review_deposit_creates_inbox_item_without_resolution_authority() {
    let root = temp_root("anima-review-deposit");
    let access = EpiiAgentAccess::new(&root);

    let receipt = access
        .deposit(DepositRequest {
            source_agent: "anima".to_owned(),
            source_coordinate: "S4/S4'".to_owned(),
            deposit_type: DepositType::ValidationGate,
            title: "Validate Pleroma skill boundary".to_owned(),
            body: "Anima requests Epii validation; Anima must not resolve the gate.".to_owned(),
            artifact: DepositArtifact {
                path: "Body/S/S4/plugins/pleroma/capability-matrix.json".to_owned(),
                coordinate: Some("S4/S4'".to_owned()),
                kind: Some("capability_matrix".to_owned()),
            },
            requires_human: true,
        })
        .expect("Anima deposit should create review item");

    assert_eq!(receipt.review_item.unwrap().source, "anima");
    assert!(receipt.improvement_run.is_none());

    let snapshot = access
        .snapshot()
        .expect("snapshot should read deposit state");
    assert_eq!(snapshot.review.open_count, 1);
    assert_eq!(snapshot.review.human_required_count, 1);
    assert_eq!(snapshot.review.resolved_count, 0);
}

#[test]
fn aletheia_improvement_deposit_creates_review_item_and_improvement_run() {
    let root = temp_root("aletheia-improvement-deposit");
    let access = EpiiAgentAccess::new(&root);

    let receipt = access
        .deposit(DepositRequest {
            source_agent: "aletheia".to_owned(),
            source_coordinate: "S4.5'".to_owned(),
            deposit_type: DepositType::ImprovementRequest,
            title: "Crystallise better autoresearch evidence".to_owned(),
            body: "Aletheia proposes richer source-aware evidence for Epii autoresearch."
                .to_owned(),
            artifact: DepositArtifact {
                path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
                coordinate: Some("S5.4'".to_owned()),
                kind: Some("seed_spec".to_owned()),
            },
            requires_human: false,
        })
        .expect("Aletheia improvement deposit should create linked run");

    let review_item = receipt.review_item.expect("review item");
    let run = receipt.improvement_run.expect("improvement run");

    assert_eq!(review_item.source, "aletheia");
    assert_eq!(
        run.source_review_item_id.as_deref(),
        Some(review_item.item_id.as_str())
    );
    assert_eq!(run.baseline.path, "Idea/Bimba/Seeds/S/S5/S5-SPEC.md");
    assert!(run.direction.contains("richer source-aware evidence"));
}

fn temp_root(name: &str) -> PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-epii-agent-{name}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).unwrap();
    }
    std::fs::create_dir_all(&root).unwrap();
    root
}
