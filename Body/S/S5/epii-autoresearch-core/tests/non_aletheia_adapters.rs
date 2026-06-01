use epi_s5_epii_autoresearch_core::adapters::{
    AnuttaraShaclFailureReport, NaraDialogicVoiceSignalReport, NonAletheiaPipelineReport,
    ParashaktiEmbeddingDriftReport,
};
use epi_s5_epii_autoresearch_core::{ImprovementStore, TargetSubsystem};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
use serde_json::json;
use std::path::{Path, PathBuf};

#[test]
fn shacl_report_file_routes_repeated_anuttara_failure_and_blocks_downstream_route() {
    let root = temp_root("shacl-adapter");
    let store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let report_path = root.join("reports/anuttara-shacl.json");
    write_report(
        &report_path,
        &NonAletheiaPipelineReport::AnuttaraShaclFailure(AnuttaraShaclFailureReport {
            report_uri: "graph://bimba/shacl/reports/shape-repeat-01".to_owned(),
            shape_id: "ql:CanonicalVakShape".to_owned(),
            severity: "violation".to_owned(),
            failing_focus_nodes: vec!["bimba://M0/A".to_owned(), "bimba://M0/B".to_owned()],
            message: "canonical VAK keys missing from imported ontology nodes".to_owned(),
            observed_at_ms: 1_780_200_000_000,
            fingerprint: Some("shape-repeat-01".to_owned()),
        }),
    );

    let surfaced = store
        .surface_non_aletheia_report_file(&report_path)
        .expect("adapter should read real report file")
        .expect("SHACL failure should surface");
    assert_eq!(
        surfaced.candidate.candidate.target_subsystem,
        TargetSubsystem::Anuttara
    );
    assert_eq!(surfaced.routes.len(), 1);
    assert_eq!(
        surfaced.routes[0].target_subsystem,
        TargetSubsystem::Anuttara
    );

    let split_routes = store
        .route_candidate(
            &surfaced.candidate.candidate_id,
            vec![TargetSubsystem::Anuttara, TargetSubsystem::Parashakti],
        )
        .expect("cross-target route should persist");
    let downstream = split_routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Parashakti)
        .expect("downstream Parashakti route");
    assert_eq!(format!("{:?}", downstream.status), "Blocked");
    assert!(downstream.blocked_by_route_id.is_some());

    let replay = store
        .surface_non_aletheia_report_file(&report_path)
        .expect("adapter replay should read same report")
        .expect("duplicate response returns existing receipt");
    assert!(replay.suppressed_duplicate);
}

#[test]
fn parashakti_metric_drift_report_preserves_metric_evidence() {
    let root = temp_root("parashakti-drift-adapter");
    let store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let report_path = root.join("reports/parashakti-drift.json");
    write_report(
        &report_path,
        &NonAletheiaPipelineReport::ParashaktiEmbeddingDrift(ParashaktiEmbeddingDriftReport {
            report_uri: "graph://bimba/metrics/parashakti/window-42".to_owned(),
            embedding_kind: "lens-kge".to_owned(),
            metric_name: "neighbourhood_recall".to_owned(),
            current_value: 0.61,
            minimum_acceptable_value: 0.72,
            window_id: "2026-W22".to_owned(),
            observed_at_ms: 1_780_200_100_000,
            fingerprint: None,
        }),
    );

    let surfaced = store
        .surface_non_aletheia_report_file(&report_path)
        .expect("adapter should read metric report")
        .expect("metric below threshold should surface");
    let candidate = surfaced.candidate.candidate;
    assert_eq!(candidate.target_subsystem, TargetSubsystem::Parashakti);
    assert!(candidate
        .observation_evidence
        .summary
        .contains("neighbourhood_recall=0.6100 below threshold 0.7200"));
    assert_eq!(
        candidate.observation_evidence.source_uri,
        "graph://bimba/metrics/parashakti/window-42"
    );
}

#[test]
fn nara_adapter_requires_quality_signal_not_volume_alone_and_keeps_handles_opaque() {
    let root = temp_root("nara-adapter");
    let store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let volume_path = root.join("reports/nara-volume.json");
    write_report(
        &volume_path,
        &NonAletheiaPipelineReport::NaraDialogicVoiceSignal(NaraDialogicVoiceSignalReport {
            report_uri: "pratibimba://reports/nara/volume-only".to_owned(),
            consent_handle: "pratibimba://handle/nara-consent-opaque".to_owned(),
            sample_count: 10_000,
            quality_score: 0.91,
            quality_threshold: 0.8,
            drift_kind: None,
            new_register: None,
            systematic_feedback_count: 0,
            observed_at_ms: 1_780_200_200_000,
            fingerprint: Some("volume-only".to_owned()),
        }),
    );
    assert!(store
        .surface_non_aletheia_report_file(&volume_path)
        .expect("volume report should parse")
        .is_none());

    let drift_path = root.join("reports/nara-drift.json");
    write_report(
        &drift_path,
        &NonAletheiaPipelineReport::NaraDialogicVoiceSignal(NaraDialogicVoiceSignalReport {
            report_uri: "pratibimba://reports/nara/drift".to_owned(),
            consent_handle: "pratibimba://handle/nara-consent-opaque".to_owned(),
            sample_count: 42,
            quality_score: 0.52,
            quality_threshold: 0.8,
            drift_kind: Some("dialogic-register-drift".to_owned()),
            new_register: None,
            systematic_feedback_count: 3,
            observed_at_ms: 1_780_200_300_000,
            fingerprint: Some("nara-quality-drift".to_owned()),
        }),
    );

    let surfaced = store
        .surface_non_aletheia_report_file(&drift_path)
        .expect("drift report should parse")
        .expect("quality plus drift should surface");
    let candidate = surfaced.candidate.candidate;
    let encoded = serde_json::to_string(&candidate).expect("candidate json");
    assert_eq!(candidate.target_subsystem, TargetSubsystem::Nara);
    assert_eq!(
        candidate.observation_evidence.source_uri,
        "pratibimba://handle/nara-consent-opaque"
    );
    assert!(!encoded.contains("raw journal"));
    assert!(!encoded.contains("voice corpus body"));
}

#[test]
fn epii_on_epii_adapter_uses_real_review_history_and_preserves_human_recursive_gate() {
    let root = temp_root("epii-self-adapter");
    let store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let review_store = ReviewStore::new(root.join("s5/epii-review"));

    let deferred = review_store
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
    review_store
        .resolve(ReviewResolveRequest {
            item_id: deferred.item_id.clone(),
            decision: ReviewDecision::Defer,
            rationale: "needs another cycle".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("defer should persist");

    let rejected = review_store
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
    review_store
        .resolve(ReviewResolveRequest {
            item_id: rejected.item_id.clone(),
            decision: ReviewDecision::Reject,
            rationale: "unsafe shortcut".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("reject should persist");

    let history = review_store.history(None).expect("history should load");
    let surfaced = store
        .surface_epii_review_inconsistency_from_history(
            &history,
            "review://s5/history/recursive-window",
            1_780_200_400_000,
        )
        .expect("history adapter should run")
        .expect("review inconsistency should surface");
    assert_eq!(
        surfaced.candidate.candidate.target_subsystem,
        TargetSubsystem::Epii
    );

    let human_gate = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Recursive Epii-on-Epii candidate".to_owned(),
            body: "Human gate for recursive self-observation candidate.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"candidate_id": surfaced.candidate.candidate_id}),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::RecursiveSelfModification,
                gate_kind: GateKind::RecursiveSelfModification,
                governance_level: GovernanceLevel::RecursiveLoadBearing,
                required_actors: vec!["human".to_owned()],
                candidate_id: Some(surfaced.candidate.candidate_id.clone()),
                orchestration_id: None,
                source_artifact_refs: vec!["review://s5/history/recursive-window".to_owned()],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("epii-on-epii".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("human gate should submit");
    let agent_approval = review_store
        .resolve(ReviewResolveRequest {
            item_id: human_gate.item_id,
            decision: ReviewDecision::Approve,
            rationale: "agent must not approve recursive gate".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: None,
        })
        .expect_err("recursive candidate must require human approval before promotion planning");
    assert!(agent_approval.contains("requires human resolution"));
}

fn write_report(path: &Path, report: &NonAletheiaPipelineReport) {
    std::fs::create_dir_all(path.parent().expect("parent")).expect("report dir");
    std::fs::write(
        path,
        serde_json::to_string_pretty(report).expect("serialize report"),
    )
    .expect("write report");
}

fn temp_root(name: &str) -> PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-non-aletheia-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
