use std::path::PathBuf;

use epi_s5_epii_autoresearch_core::{
    ArtifactRef, EvaluationEvidence, EvidenceSourceRef, ImprovementDecision, ImprovementStore,
    LoopState, PromoteRequest, ProposeRequest,
};

#[test]
fn propose_creates_generalized_challenger_without_ml_assumptions() {
    let root = temp_store_root("propose_creates_generalized_challenger_without_ml_assumptions");
    let store = ImprovementStore::new(&root);

    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S4/S4'".to_owned(),
            direction: "tighten Pleroma skill boundary".to_owned(),
            source_review_item_id: Some("review-1".to_owned()),
            baseline: ArtifactRef::new("Body/S/S4/plugins/pleroma/capability-matrix.json"),
        })
        .expect("proposal should persist");

    assert_eq!(run.loop_state, LoopState::Hypothesis);
    assert_eq!(run.target_family, "S");
    assert_eq!(run.target_coordinate, "S4/S4'");
    assert_eq!(
        run.baseline.path,
        "Body/S/S4/plugins/pleroma/capability-matrix.json"
    );
    assert!(run
        .challenger
        .path
        .starts_with("autoresearch://challenger/"));
    assert_eq!(run.source_review_item_id.as_deref(), Some("review-1"));

    let status = store.status().expect("status should load");
    assert_eq!(status.loop_state, LoopState::Hypothesis);
    assert_eq!(status.total_runs, 1);
    assert_eq!(status.active_vectors.len(), 1);
}

#[test]
fn evaluation_keeps_challenger_when_weighted_evidence_wins() {
    let root = temp_store_root("evaluation_keeps_challenger_when_weighted_evidence_wins");
    let store = ImprovementStore::new(&root);
    let run = store
        .propose(ProposeRequest {
            target_family: "ql".to_owned(),
            target_coordinate: "S5.5'".to_owned(),
            direction: "simpler schema evolution guard".to_owned(),
            source_review_item_id: None,
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("proposal should persist");

    let evaluated = store
        .evaluate(
            &run.run_id,
            vec![
                EvaluationEvidence {
                    dimension: "correctness".to_owned(),
                    baseline_score: 0.62,
                    challenger_score: 0.81,
                    weight: 0.7,
                    notes: "Challenger names review-gated schema bumps explicitly.".to_owned(),
                    source_refs: Vec::new(),
                },
                EvaluationEvidence {
                    dimension: "simplicity".to_owned(),
                    baseline_score: 0.70,
                    challenger_score: 0.76,
                    weight: 0.3,
                    notes: "Challenger removes an ambiguous branch.".to_owned(),
                    source_refs: Vec::new(),
                },
            ],
        )
        .expect("evaluation should persist");

    assert_eq!(evaluated.loop_state, LoopState::Deciding);
    assert_eq!(evaluated.decision, Some(ImprovementDecision::Keep));
    assert_eq!(evaluated.evaluation.as_ref().unwrap().winner, "challenger");

    let status = store.status().expect("status should load");
    assert_eq!(status.loop_state, LoopState::Deciding);
    assert_eq!(status.keep_count, 1);
    assert_eq!(status.discard_count, 0);
}

#[test]
fn evaluation_persists_source_refs_for_world_return_observations() {
    let root = temp_store_root("evaluation_persists_source_refs");
    let store = ImprovementStore::new(&root);
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "capture service observations as autoresearch evidence".to_owned(),
            source_review_item_id: Some("review-item-1".to_owned()),
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("proposal should persist");

    let evaluated = store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "world_return_observation".to_owned(),
                baseline_score: 0.4,
                challenger_score: 0.8,
                weight: 1.0,
                notes: "Epii saw Gnosis, Nara, and Graphiti status before deciding.".to_owned(),
                source_refs: vec![
                    EvidenceSourceRef {
                        kind: "gnosis_status".to_owned(),
                        uri: "s5'.epii.status#/world_return/gnosis".to_owned(),
                        coordinate: Some("S5.2".to_owned()),
                        summary: Some("documents_count=1 notebooks_count=1".to_owned()),
                    },
                    EvidenceSourceRef {
                        kind: "graphiti_status".to_owned(),
                        uri: "s5'.epii.status#/world_return/graphiti".to_owned(),
                        coordinate: Some("S5.3/S3'".to_owned()),
                        summary: Some(
                            "runtime authority remains S3; invocation owner S5".to_owned(),
                        ),
                    },
                ],
            }],
        )
        .expect("evaluation should persist source refs");

    let evidence = &evaluated.evaluation.as_ref().unwrap().evidence[0];
    assert_eq!(evidence.source_refs.len(), 2);
    assert_eq!(evidence.source_refs[0].kind, "gnosis_status");
    assert_eq!(
        evidence.source_refs[1].coordinate.as_deref(),
        Some("S5.3/S3'")
    );

    let history = store.history(None).expect("history should load");
    assert_eq!(
        history.runs[0].evaluation.as_ref().unwrap().evidence[0].source_refs,
        evidence.source_refs
    );
}

#[test]
fn evaluation_discards_challenger_when_baseline_wins() {
    let root = temp_store_root("evaluation_discards_challenger_when_baseline_wins");
    let store = ImprovementStore::new(&root);
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S3/S3'".to_owned(),
            direction: "try riskier gateway shortcut".to_owned(),
            source_review_item_id: None,
            baseline: ArtifactRef::new("Body/S/S3/gateway-contract/src/lib.rs"),
        })
        .expect("proposal should persist");

    let evaluated = store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "architectural_fit".to_owned(),
                baseline_score: 0.9,
                challenger_score: 0.4,
                weight: 1.0,
                notes: "Shortcut collapses S3 runtime into S5 invocation.".to_owned(),
                source_refs: Vec::new(),
            }],
        )
        .expect("evaluation should persist");

    assert_eq!(evaluated.decision, Some(ImprovementDecision::Discard));
    assert_eq!(evaluated.evaluation.as_ref().unwrap().winner, "baseline");

    let history = store.history(None).expect("history should load");
    assert_eq!(history.runs.len(), 1);
    assert_eq!(history.runs[0].decision, Some(ImprovementDecision::Discard));
}

#[test]
fn promote_is_dry_run_hen_plan_for_kept_challenger() {
    let root = temp_store_root("promote_is_dry_run_hen_plan_for_kept_challenger");
    let vault = root.join("Idea");
    let day_note = vault.join("Empty/Present/03-05-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nAutoresearch improvement record.\n").unwrap();

    let store = ImprovementStore::new(root.join(".epi/s5/autoresearch"));
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "promote accepted improvement through Hen".to_owned(),
            source_review_item_id: Some("review-approved-1".to_owned()),
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("proposal should persist");
    store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "return_law".to_owned(),
                baseline_score: 0.55,
                challenger_score: 0.88,
                weight: 1.0,
                notes: "Challenger routes accepted output through S1 Hen.".to_owned(),
                source_refs: Vec::new(),
            }],
        )
        .expect("evaluation should persist");

    let promotion = store
        .promote(PromoteRequest {
            run_id: run.run_id,
            destination: "seeds".to_owned(),
            approved_review_resolution_id: "resolution-1".to_owned(),
            vault_root: vault,
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "autoresearch-return-law".to_owned(),
            dry_run: true,
        })
        .expect("dry-run promotion should plan through Hen");

    assert!(promotion.ok);
    assert!(promotion.dry_run);
    assert_eq!(promotion.promoted_path, None);
    assert_eq!(
        promotion.compile_plan.ledger_entries,
        vec!["improvement.ledger"]
    );
    assert_eq!(
        promotion
            .compile_plan
            .invocation
            .as_ref()
            .unwrap()
            .required_skill,
        "autoresearch"
    );
    assert_eq!(
        promotion.compile_plan.artifacts,
        vec![PathBuf::from(root.join(
            "Idea/Pratibimba/Self/Thought/T/T5/autoresearch-return-law.md"
        ))]
    );
}

#[test]
fn non_dry_run_promotion_is_blocked_until_review_and_compiler_mutation_are_wired() {
    let root = temp_store_root("non_dry_run_promotion_is_blocked");
    let store = ImprovementStore::new(&root);
    let error = store
        .promote(PromoteRequest {
            run_id: "missing".to_owned(),
            destination: "seeds".to_owned(),
            approved_review_resolution_id: "resolution-1".to_owned(),
            vault_root: root.join("Idea"),
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "blocked".to_owned(),
            dry_run: false,
        })
        .expect_err("non-dry-run promotion must stay blocked");

    assert!(error.contains("non-dry-run autoresearch promotion"));
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s5-autoresearch-{test_name}-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
