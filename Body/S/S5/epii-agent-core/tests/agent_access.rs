use epi_s5_epii_agent_core::{
    validate_m5_artifact_uri, DepositArtifact, DepositRequest, DepositType, EpiiAgentAccess,
    M5ArtifactNamespace, TypedCandidateDepositRequest,
};
use epi_s5_epii_autoresearch_core::adapters::NonAletheiaPipelineReport;
use epi_s5_epii_autoresearch_core::spine::{
    ClosureKind, ContentTypeRegister, ImprovementVectorKind, ObservationEvidence,
};
use epi_s5_epii_autoresearch_core::{
    ArtifactRef, CreateOrchestrationRequest, EvaluationEvidence, EvidenceSourceRef,
    ImprovementCandidate, ImprovementStore, PromoteRequest, PromotionDestination,
    PromotionHenTimestamp, ProposeRequest, RetryPolicy, SensitivityClass, SurfaceActor,
    SurfacingPipelineId, TargetSubsystem,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
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
            kernel_visibility: None,
            governance_profile: None,
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
                kernel_evidence: None,
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
    assert!(snapshot
        .gateway_methods
        .contains(&"s5'.epii.deposit.typed_candidate".to_owned()));
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
            day_id: Some("12-05-2026".to_owned()),
            now_path: Some("Idea/Empty/Present/12-05-2026/NOW.md".to_owned()),
            session_key: Some("agent:anima:12-05-2026".to_owned()),
            vault_root: Some("Idea".to_owned()),
            requires_human: true,
        })
        .expect("Anima deposit should create review item");

    assert_eq!(receipt.review_item.unwrap().source, "anima");
    assert!(receipt.improvement_run.is_none());
    assert_eq!(
        receipt.inbox_surface.inbox_path.as_deref(),
        Some("Idea/Empty/Present/12-05-2026/")
    );
    assert_eq!(
        receipt.inbox_surface.session_key.as_deref(),
        Some("agent:anima:12-05-2026")
    );

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
            day_id: Some("12-05-2026".to_owned()),
            now_path: Some("Idea/Empty/Present/12-05-2026/NOW.md".to_owned()),
            session_key: Some("agent:aletheia:12-05-2026".to_owned()),
            vault_root: Some("Idea".to_owned()),
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

#[test]
fn typed_candidate_deposit_routes_real_candidate_and_snapshot_summarizes_without_body_leakage() {
    let root = temp_root("typed-candidate-deposit");
    let access = EpiiAgentAccess::new(&root);
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "Refine recursive spine handoff without exposing protected Nara body."
                .to_owned(),
            source_review_item_id: None,
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        },
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "handoff".to_owned(),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: "graphiti://handle/nara-private-arc".to_owned(),
            summary: "Opaque handle summary only; do not leak protected journal body.".to_owned(),
            observed_at: Some(1_780_000_000_000),
            fingerprint: Some("nara-private-handle-fingerprint".to_owned()),
        },
        1_780_000_000_000,
        SurfaceActor::Anima,
        SensitivityClass::ProtectedLocal,
    )
    .expect("typed candidate should validate");
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;

    let receipt = access
        .deposit_typed_candidate(TypedCandidateDepositRequest {
            source_agent: "anima".to_owned(),
            source_coordinate: "S4/S4'".to_owned(),
            candidate,
            title: "Route typed Epii candidate".to_owned(),
            body: "protected-journal-body::must-not-appear-in-snapshot".to_owned(),
            requires_human: true,
        })
        .expect("typed candidate deposit should surface and route");

    assert!(!receipt.suppressed_duplicate);
    assert_eq!(receipt.routes.len(), 1);
    let route = access
        .route_detail(&receipt.routes[0].route_id)
        .expect("route detail should be exposed through access surface");
    assert_eq!(route.candidate_id, receipt.candidate.candidate_id);

    let snapshot = access.snapshot().expect("snapshot should load");
    assert_eq!(snapshot.improvement.active_candidates.len(), 1);
    assert_eq!(snapshot.improvement.route_queues.len(), 1);
    assert_eq!(snapshot.review.human_required_count, 1);

    let snapshot_json = serde_json::to_string(&snapshot).expect("snapshot json");
    assert!(snapshot_json.contains("graphiti://handle/nara-private-arc"));
    assert!(!snapshot_json.contains("protected-journal-body"));
}

#[test]
fn governed_snapshot_counts_pending_human_validations_without_resolution_authority_leak() {
    let root = temp_root("governed-snapshot");
    let access = EpiiAgentAccess::new(&root);
    let item = access
        .submit_review(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Human final validation".to_owned(),
            body: "Private details stay inside review store, not summary surfaces.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"coordinate": "S5/S5'"}),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::RecursiveSelfModification,
                gate_kind: GateKind::RecursiveSelfModification,
                governance_level: GovernanceLevel::RecursiveLoadBearing,
                required_actors: vec!["human".to_owned()],
                candidate_id: Some("candidate:recursive".to_owned()),
                orchestration_id: Some("orchestration:recursive".to_owned()),
                source_artifact_refs: vec!["autoresearch://challenger/recursive".to_owned()],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("epii-on-epii".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("governed review should submit");

    let anima_error = access
        .resolve_review(
            "anima",
            ReviewResolveRequest {
                item_id: item.item_id.clone(),
                decision: ReviewDecision::Approve,
                rationale: "Anima should not resolve Epii recursive gate.".to_owned(),
                resolved_by: ResolutionActor::Agent("anima".to_owned()),
                promotion_destination: None,
                promoted_artifact: None,
            },
        )
        .expect_err("Anima deposits but cannot resolve Epii gates");
    assert!(anima_error.contains("cannot resolve Epii gates"));

    let snapshot = access.snapshot().expect("snapshot should load");
    assert_eq!(
        snapshot
            .review
            .governance_gate_counts
            .recursive_self_modification,
        1
    );
    assert_eq!(snapshot.review.pending_human_validations.len(), 1);
    assert_eq!(
        snapshot.review.pending_human_validations[0].item_id,
        item.item_id
    );
}

#[test]
fn m5_workbench_snapshot_serializes_real_state_with_namespace_refs_and_no_body_leakage() {
    let root = temp_root("m5-workbench-snapshot");
    let access = EpiiAgentAccess::new(&root);
    let improve_store = ImprovementStore::new(root.join("s5/epii-autoresearch"));

    let review_item = access
        .submit_review(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "M5 workbench review gate".to_owned(),
            body: "protected-review-body::must-not-render-in-workbench".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({
                "kernel_trajectory": "run://kernel/session/20260601",
                "graphiti_arc": "graph://bimba/graphiti/arc/private"
            }),
            proposed_action: Some(epi_s5_epii_review_core::ReviewProposedAction {
                kind: "inspect_artifact_set".to_owned(),
                target: Some(json!({
                    "uri": "review://m5/workbench/open-gate",
                    "linked": [
                        {"uri": "vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md"},
                        {"uri": "repo://Body/S/S5/epii-agent-core/src/lib.rs"},
                        {"uri": "graph://bimba/S5/workbench"},
                        {"uri": "run://s5/workbench/contract"},
                        {"uri": "improvement://autoresearch/challenger/workbench"}
                    ]
                })),
                destination: Some("epii".to_owned()),
                payload: Some(json!({"uri": "gnostic://legacy-language-pane"})),
            }),
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::UserFinalValidation,
                gate_kind: GateKind::HumanFinal,
                governance_level: GovernanceLevel::HumanRequired,
                required_actors: vec!["human".to_owned()],
                candidate_id: Some("candidate:m5-workbench".to_owned()),
                orchestration_id: Some("orchestration:m5-workbench".to_owned()),
                source_artifact_refs: vec![
                    "vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
                    "repo://Body/S/S5/epii-agent-core/src/lib.rs".to_owned(),
                    "graph://bimba/S5/workbench".to_owned(),
                    "run://s5/workbench/contract".to_owned(),
                    "review://m5/workbench/open-gate".to_owned(),
                    "improvement://autoresearch/challenger/workbench".to_owned(),
                    "atelier://legacy-etymology-pane".to_owned(),
                ],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("m5-workbench-contract".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("review should persist");

    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "kernel-trajectory-secret::must-not-render-in-workbench".to_owned(),
            source_review_item_id: Some(review_item.item_id.clone()),
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        },
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: "m5-workbench-contract".to_owned(),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: "graphiti://handle/private-pratibimba-arc".to_owned(),
            summary: "Graphiti handle summary only; protected field stays opaque.".to_owned(),
            observed_at: Some(1_780_100_000_000),
            fingerprint: Some("m5-workbench-private-handle".to_owned()),
        },
        1_780_100_000_000,
        SurfaceActor::Anima,
        SensitivityClass::ProtectedLocal,
    )
    .expect("candidate should validate");
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;

    let surfaced = access
        .deposit_typed_candidate(TypedCandidateDepositRequest {
            source_agent: "anima".to_owned(),
            source_coordinate: "S4/S4'".to_owned(),
            candidate,
            title: "Surface workbench candidate".to_owned(),
            body: "protected-candidate-body::must-not-render-in-workbench".to_owned(),
            requires_human: true,
        })
        .expect("typed candidate should surface");
    let route = surfaced.routes.first().expect("route");
    improve_store
        .create_orchestration(CreateOrchestrationRequest {
            candidate_id: surfaced.candidate.candidate_id.clone(),
            route_id: route.route_id.clone(),
            review_item_id: Some(review_item.item_id.clone()),
            timeout_after_ms: Some(60_000),
            retry_policy: RetryPolicy::default(),
            now_ms: 1_780_100_000_000,
        })
        .expect("orchestration should persist");

    let workbench = access
        .m5_workbench_snapshot()
        .expect("workbench snapshot should load");
    let workbench_json = serde_json::to_string(&workbench).expect("workbench json");

    assert_eq!(workbench.schema_version, 1);
    assert_eq!(workbench.review_pane.open_items.len(), 2);
    assert_eq!(workbench.review_pane.pending_human_validations.len(), 1);
    assert_eq!(workbench.route_queues.len(), 1);
    assert_eq!(workbench.candidate_details.len(), 1);
    assert!(workbench
        .gateway_methods
        .contains(&"s5'.epii.workbench.snapshot".to_owned()));
    assert!(workbench_json.contains("\"review_pane\""));
    assert!(workbench_json.contains("\"candidate_details\""));
    assert!(workbench_json.contains("vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md"));
    assert!(workbench_json.contains("repo://Body/S/S5/epii-agent-core/src/lib.rs"));
    assert!(workbench_json.contains("graph://bimba/graphiti/handle/private-pratibimba-arc"));
    assert!(workbench_json.contains("gnosis://legacy-language-pane"));
    assert!(workbench_json.contains("etymology://legacy-etymology-pane"));
    assert!(!workbench_json.contains("protected-review-body"));
    assert!(!workbench_json.contains("protected-candidate-body"));
    assert!(!workbench_json.contains("kernel-trajectory-secret"));
}

#[test]
fn m2_user_surface_exposes_backend_derived_meaning_packet() {
    let root = temp_root("m2-user-surface");
    let improve_store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let report_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("S5 parent")
        .join("fixtures/track-04-t0/m2-live-profile-runtime-report.json");
    let report: NonAletheiaPipelineReport =
        serde_json::from_str(&std::fs::read_to_string(report_path).expect("fixture reads"))
            .expect("fixture is a real report payload");

    improve_store
        .surface_non_aletheia_report(report)
        .expect("profile report should surface")
        .expect("meaning packet should persist");

    let workbench = EpiiAgentAccess::new(&root)
        .m5_workbench_snapshot()
        .expect("workbench should read real persisted candidate");
    let detail = workbench
        .candidate_details
        .iter()
        .find(|detail| detail.target_subsystem == TargetSubsystem::Parashakti)
        .expect("Parashakti candidate detail");
    let packet = detail
        .m2_meaning_packet
        .as_ref()
        .expect("M2 user surface includes meaning packet");
    let workbench_json = serde_json::to_string(&workbench).expect("workbench json");

    assert_eq!(packet.index72, 71);
    assert_eq!(
        packet.cymatic_signature.nodal_quartet,
        [1.0, 0.5, 0.25, 0.125]
    );
    assert_eq!(
        packet.planetary_chakral_frame.provenance,
        "graph://bimba/M2/planetary-chakral/venus-anahata"
    );
    assert!(workbench_json.contains("\"m2_meaning_packet\""));
    assert!(workbench_json.contains("run://kernel/m2-profile/20260602T160623Z/tick-000144"));
    assert!(!workbench_json.contains("placeholder"));
    assert!(!workbench_json.contains("protected-journal-body"));
}

#[test]
fn m5_artifact_uri_validator_accepts_contract_namespaces_and_rejects_raw_paths() {
    for (uri, namespace) in [
        (
            "vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md",
            M5ArtifactNamespace::Vault,
        ),
        (
            "repo://Body/S/S5/epii-agent-core/src/lib.rs",
            M5ArtifactNamespace::Repo,
        ),
        (
            "graph://bimba/S5/workbench",
            M5ArtifactNamespace::GraphBimba,
        ),
        ("gnosis://language/checkpoint", M5ArtifactNamespace::Gnosis),
        ("etymology://term/chreia", M5ArtifactNamespace::Etymology),
        (
            "pratibimba://handle/private-day-container",
            M5ArtifactNamespace::Pratibimba,
        ),
        ("run://s5/workbench/contract", M5ArtifactNamespace::Run),
        (
            "review://m5/workbench/open-gate",
            M5ArtifactNamespace::Review,
        ),
        (
            "improvement://autoresearch/challenger/workbench",
            M5ArtifactNamespace::Improvement,
        ),
    ] {
        assert_eq!(validate_m5_artifact_uri(uri).unwrap(), namespace);
    }

    assert!(validate_m5_artifact_uri("/Users/admin/private/raw.md")
        .unwrap_err()
        .contains("not an absolute path"));
    assert!(validate_m5_artifact_uri("Idea/Bimba/Seeds/S/S5/S5-SPEC.md").is_err());
    assert!(validate_m5_artifact_uri("graphiti://handle/raw-runtime-handle").is_err());
}

#[test]
fn m5_promotion_dry_run_returns_filtered_dto_from_real_review_and_improvement_state() {
    let root = temp_root("m5-promotion-dry-run");
    let vault = root.join("Idea");
    let day_note = vault.join("Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nM5 dry-run promotion DTO.\n").unwrap();

    let access = EpiiAgentAccess::new(&root);
    let improve_store = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let review_root = root.join("s5/epii-review");
    let review_store = ReviewStore::new(&review_root);
    let item = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Approve M5 workbench promotion dry-run".to_owned(),
            body: "Dry-run approval body stays in review history, not promotion DTO.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"coordinate": "S5/S5'"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::RecursiveSelfModification,
                gate_kind: GateKind::RecursiveSelfModification,
                governance_level: GovernanceLevel::RecursiveLoadBearing,
                required_actors: vec!["epii".to_owned()],
                candidate_id: Some("candidate:m5-promotion".to_owned()),
                orchestration_id: Some("orchestration:m5-promotion".to_owned()),
                source_artifact_refs: vec![
                    "improvement://autoresearch/challenger/m5-promotion".to_owned()
                ],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("autoresearch".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("review should submit");
    review_store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "approved through real review store".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: Some(
                json!({"uri": "improvement://autoresearch/challenger/m5-promotion"}),
            ),
        })
        .expect("review should resolve");

    let run = improve_store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "Promote filtered M5 workbench DTO through Hen dry-run.".to_owned(),
            source_review_item_id: Some(item.item_id.clone()),
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("proposal should persist");
    improve_store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "m5_workbench_contract".to_owned(),
                baseline_score: 0.2,
                challenger_score: 0.9,
                weight: 1.0,
                notes: "Real improvement run kept for promotion dry-run DTO.".to_owned(),
                source_refs: vec![EvidenceSourceRef {
                    kind: "workbench_contract".to_owned(),
                    uri: "review://m5/workbench/open-gate".to_owned(),
                    coordinate: Some("S5/S5'".to_owned()),
                    summary: Some("M5 workbench DTO checked through review gate.".to_owned()),
                }],
                kernel_evidence: None,
            }],
        )
        .expect("evaluation should keep challenger");

    let dto = access
        .m5_promotion_dry_run(PromoteRequest {
            run_id: run.run_id.clone(),
            destination: PromotionDestination::EpiiSpineMechanismUpdate {
                spine_component: "m5-workbench-contract".to_owned(),
            },
            legacy_destination: Some("epii:spine".to_owned()),
            approved_review_resolution_id: item.item_id.clone(),
            review_store_root: review_root,
            vault_root: vault,
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "m5-workbench-contract".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 8, 30, 0)),
            dry_run: true,
        })
        .expect("promotion dry-run dto should plan");

    let dto_json = serde_json::to_string(&dto).expect("promotion dto json");
    assert!(dto.ok);
    assert!(dto.dry_run);
    assert_eq!(dto.run_id, run.run_id);
    assert_eq!(
        dto.governance_category,
        ReviewCategory::RecursiveSelfModification
    );
    assert_eq!(dto.compile_artifacts.len(), 1);
    assert_eq!(
        dto.compile_artifacts[0].namespace,
        M5ArtifactNamespace::Vault
    );
    assert!(dto.compile_artifacts[0].uri.starts_with("vault://Idea/"));
    assert!(!dto_json.contains(&root.display().to_string()));
    assert!(!dto_json.contains("Dry-run approval body"));
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
