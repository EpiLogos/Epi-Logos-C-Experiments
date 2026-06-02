use epi_s5_epii_autoresearch_core::adapters::{
    AnuttaraShaclFailureReport, ParashaktiEmbeddingDriftReport,
};
use epi_s5_epii_autoresearch_core::capacity_workflows::{
    classify_parashakti_scorecard, run_anuttara_deterministic_slice,
    run_parashakti_deterministic_slice, AgentAnnotationKind, ParashaktiScorecard,
    SliceGovernanceClass,
};
use epi_s5_epii_autoresearch_core::{ImprovementStore, RouteStatus, TargetSubsystem};
use epi_s5_epii_review_core::ReviewStore;
use std::path::PathBuf;

#[test]
fn anuttara_shacl_slice_records_agent_annotations_blocks_downstream_and_plans_dry_run() {
    let root = temp_root("anuttara-shacl-slice");
    let vault = root.join("Idea");
    let seed = vault.join("Bimba/Seeds/M/M0'/M0'-SPEC.md");
    std::fs::create_dir_all(seed.parent().unwrap()).expect("seed parent");
    std::fs::write(&seed, "# M0\n\nAnuttara seed fixture.\n").expect("seed fixture");

    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));
    let receipt = run_anuttara_deterministic_slice(
        &autoresearch,
        &review,
        AnuttaraShaclFailureReport {
            report_uri: "graph://s2/shacl/reports/anuttara-load-bearing-001".to_owned(),
            shape_id: "ql:CanonicalVakShape".to_owned(),
            severity: "violation".to_owned(),
            failing_focus_nodes: vec!["bimba://M0/0".to_owned(), "bimba://M0/1".to_owned()],
            message: "load-bearing Anuttara axiom lacks canonical VAK keys".to_owned(),
            observed_at_ms: 1_780_400_000_000,
            fingerprint: Some("anuttara-load-bearing-001".to_owned()),
        },
        vec![TargetSubsystem::Anuttara, TargetSubsystem::Parashakti],
        vault,
        root.join("Body/S/S1/hen-compiler"),
        1_780_400_000_000,
    )
    .expect("Anuttara deterministic slice should run");

    assert_eq!(receipt.capacity, TargetSubsystem::Anuttara);
    assert_eq!(receipt.governance_class, SliceGovernanceClass::LoadBearing);
    assert_eq!(receipt.annotations.len(), 4);
    assert!(receipt
        .annotations
        .iter()
        .any(|annotation| annotation.kind == AgentAnnotationKind::SophiaReview));
    assert!(receipt
        .annotations
        .iter()
        .any(|annotation| annotation.kind == AgentAnnotationKind::PiFormalTranslation));
    assert!(receipt.annotations.iter().all(|annotation| annotation
        .source_refs
        .iter()
        .any(|source| source.contains("graph://s2/shacl"))));
    assert!(receipt.evidence_deposits.iter().all(|deposit| {
        deposit.deposit_uri.starts_with("s5://evidence/")
            && deposit.source_uri.starts_with("graph://s2/shacl/")
            && !deposit.mutates_graph_or_canon
    }));

    let downstream = receipt
        .routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Parashakti)
        .expect("Parashakti downstream route");
    assert_eq!(downstream.status, RouteStatus::Blocked);
    assert!(downstream.blocked_by_route_id.is_some());

    let promotion = receipt
        .promotion_plan
        .as_ref()
        .expect("Anuttara dry-run promotion plan");
    assert!(promotion.ok);
    assert!(promotion.dry_run);
    assert_eq!(promotion.promoted_path, None);
}

#[test]
fn parashakti_scorecards_classify_routine_vs_load_bearing_and_deposit_only() {
    let routine = ParashaktiScorecard {
        report: ParashaktiEmbeddingDriftReport {
            report_uri: "graph://s2/gds/parashakti/window-routine".to_owned(),
            embedding_kind: "lens-kge".to_owned(),
            metric_name: "neighbourhood_recall".to_owned(),
            current_value: 0.68,
            minimum_acceptable_value: 0.72,
            window_id: "2026-W23".to_owned(),
            observed_at_ms: 1_780_400_100_000,
            fingerprint: Some("parashakti-routine".to_owned()),
        },
        load_bearing_lens_change: false,
        affected_coordinates: vec!["M2".to_owned(), "M2-1".to_owned()],
        gds_projection_uri: "graph://s2/gds/projections/option1-public-v1".to_owned(),
    };
    let load_bearing = ParashaktiScorecard {
        report: ParashaktiEmbeddingDriftReport {
            current_value: 0.41,
            fingerprint: Some("parashakti-load-bearing".to_owned()),
            report_uri: "graph://s2/gds/parashakti/window-load-bearing".to_owned(),
            ..routine.report.clone()
        },
        load_bearing_lens_change: true,
        affected_coordinates: vec!["M2".to_owned(), "M2-5".to_owned(), "M2-5-8".to_owned()],
        gds_projection_uri: "graph://s2/gds/projections/option1-public-v1".to_owned(),
    };

    assert_eq!(
        classify_parashakti_scorecard(&routine).expect("routine classification"),
        SliceGovernanceClass::Routine
    );
    assert_eq!(
        classify_parashakti_scorecard(&load_bearing).expect("load-bearing classification"),
        SliceGovernanceClass::LoadBearing
    );

    let root = temp_root("parashakti-scorecard-slice");
    let autoresearch = ImprovementStore::new(root.join("s5/autoresearch"));
    let review = ReviewStore::new(root.join("s5/review"));
    let routine_receipt =
        run_parashakti_deterministic_slice(&autoresearch, &review, routine, 1_780_400_100_000)
            .expect("routine Parashakti slice should run");
    let load_bearing_receipt =
        run_parashakti_deterministic_slice(&autoresearch, &review, load_bearing, 1_780_400_200_000)
            .expect("load-bearing Parashakti slice should run");

    assert_eq!(
        routine_receipt.governance_class,
        SliceGovernanceClass::Routine
    );
    assert_eq!(
        load_bearing_receipt.governance_class,
        SliceGovernanceClass::LoadBearing
    );
    assert!(!routine_receipt.review_item.requires_human);
    assert!(load_bearing_receipt.review_item.requires_human);
    assert!(load_bearing_receipt.promotion_plan.is_none());
    assert!(load_bearing_receipt
        .evidence_deposits
        .iter()
        .all(|deposit| !deposit.mutates_graph_or_canon));
    assert!(load_bearing_receipt.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::AnimaAestheticCheck
            && annotation.note.contains("cluster/rotation/Klein")
    }));
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-s5-09t5-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
