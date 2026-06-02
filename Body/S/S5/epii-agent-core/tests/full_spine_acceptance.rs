use epi_s5_epii_agent_core::{EpiiAgentAccess, M5ArtifactNamespace};
use epi_s5_epii_autoresearch_core::adapters::{
    AnuttaraShaclFailureReport, NaraDialogicVoiceSignalReport, NonAletheiaPipelineReport,
};
use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
use epi_s5_epii_autoresearch_core::{
    CreateOrchestrationRequest, EvaluationEvidence, EvidenceSourceRef, ImprovementStore,
    OrchestrationState, PromoteRequest, PromotionDestination, PromotionHenTimestamp, RetryPolicy,
    ReviewStage, RouteStatus, TargetSubsystem, TransitionOrchestrationRequest,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::json;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

#[test]
fn full_spine_acceptance_runs_real_persisted_surfacing_review_promotion_and_snapshot() {
    let root = temp_root("full-spine");
    let inbox = InboxStore::new(root.join("Idea/Empty/Present")).expect("inbox opens");
    let improve_root = root.join("s5/epii-autoresearch");
    let review_root = root.join("s5/epii-review");
    let improve_store = ImprovementStore::new(&improve_root);
    let review_store = ReviewStore::new(&review_root);
    let access = EpiiAgentAccess::new(&root);

    inbox
        .append(aletheia_entry("session-full-spine"))
        .expect("real JSONL Aletheia append");
    assert!(root
        .join("Idea/Empty/Present/2026-06-02/session-full-spine.jsonl")
        .exists());
    let aletheia = improve_store
        .surface_aletheia_inbox(&inbox)
        .expect("Aletheia JSONL is consumed")
        .into_iter()
        .next()
        .expect("Aletheia disclosure surfaces a candidate");
    assert!(!aletheia.candidate.candidate_id.contains("placeholder"));
    assert_eq!(aletheia.candidate.run_id, aletheia.run.run_id);
    assert!(Path::new(&improve_root.join("s5-improvement-state.json")).exists());

    let aletheia_routes = improve_store
        .route_candidate(
            &aletheia.candidate.candidate_id,
            vec![TargetSubsystem::Anuttara, TargetSubsystem::Epii],
        )
        .expect("cross-target Aletheia route persists");
    assert_eq!(aletheia_routes.len(), 2);
    assert_eq!(
        aletheia_routes
            .iter()
            .find(|route| route.target_subsystem == TargetSubsystem::Epii)
            .expect("Epii route")
            .status,
        RouteStatus::Blocked
    );

    let anuttara_report_path = root.join("reports/anuttara-shacl.json");
    write_report(
        &anuttara_report_path,
        &NonAletheiaPipelineReport::AnuttaraShaclFailure(AnuttaraShaclFailureReport {
            report_uri: "graph://bimba/shacl/full-spine/shape-repeat".to_owned(),
            shape_id: "ql:CanonicalVakShape".to_owned(),
            severity: "violation".to_owned(),
            failing_focus_nodes: vec!["bimba://M0/full-spine".to_owned()],
            message: "canonical VAK keys missing from imported ontology node".to_owned(),
            observed_at_ms: 1_780_300_000_000,
            fingerprint: Some("full-spine-anuttara-first".to_owned()),
        }),
    );
    let anuttara = improve_store
        .surface_non_aletheia_report_file(&anuttara_report_path)
        .expect("real SHACL report parses")
        .expect("Anuttara failure surfaces");
    let split = improve_store
        .route_candidate(
            &anuttara.candidate.candidate_id,
            vec![TargetSubsystem::Anuttara, TargetSubsystem::Parashakti],
        )
        .expect("Anuttara-first split route persists");
    assert_eq!(
        split
            .iter()
            .find(|route| route.target_subsystem == TargetSubsystem::Parashakti)
            .expect("downstream Parashakti route")
            .status,
        RouteStatus::Blocked
    );

    let nara_report_path = root.join("reports/nara-voice-drift.json");
    write_report(
        &nara_report_path,
        &NonAletheiaPipelineReport::NaraDialogicVoiceSignal(NaraDialogicVoiceSignalReport {
            report_uri: "pratibimba://reports/nara/full-spine-drift".to_owned(),
            consent_handle: "pratibimba://handle/nara-consent-full-spine".to_owned(),
            sample_count: 64,
            quality_score: 0.49,
            quality_threshold: 0.8,
            drift_kind: Some("dialogic-register-drift".to_owned()),
            new_register: None,
            systematic_feedback_count: 4,
            observed_at_ms: 1_780_300_100_000,
            fingerprint: Some("full-spine-nara-anima".to_owned()),
        }),
    );
    let nara = improve_store
        .surface_non_aletheia_report_file(&nara_report_path)
        .expect("Nara report parses")
        .expect("Nara quality drift surfaces");
    let nara_review =
        review_store
            .submit(ReviewSubmission {
                source: ReviewSource::Anima,
                title: "Anima-primary Nara voice drift gate".to_owned(),
                body: "Opaque Nara consent handle only; raw protected body must never render."
                    .to_owned(),
                priority: ReviewPriority::Blocking,
                coordinate_context: json!({
                    "candidate_id": nara.candidate.candidate_id,
                    "consent_handle": "pratibimba://handle/nara-consent-full-spine"
                }),
                proposed_action: None,
                requires_human: true,
                kernel_visibility: None,
                governance_profile: Some(GovernanceProfile {
                    category: ReviewCategory::NaraAnimaPrimaryGate,
                    gate_kind: GateKind::AnimaPrimary,
                    governance_level: GovernanceLevel::HumanRequired,
                    required_actors: vec!["anima".to_owned(), "human".to_owned()],
                    candidate_id: Some(nara.candidate.candidate_id.clone()),
                    orchestration_id: None,
                    source_artifact_refs: vec![
                        "pratibimba://handle/nara-consent-full-spine".to_owned()
                    ],
                    target_subsystem: Some("Nara".to_owned()),
                    vector_kind: Some("NaraDialogueCorpusAddition".to_owned()),
                    promotion_destination: Some("nara:dialogue-adapter".to_owned()),
                    source_actor_detail: Some("anima-primary".to_owned()),
                    stage_records: Vec::new(),
                }),
            })
            .expect("Nara review persists");
    let nara_agent_resolution = review_store
        .resolve(ReviewResolveRequest {
            item_id: nara_review.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "agent must not approve protected Nara gate".to_owned(),
            resolved_by: ResolutionActor::Agent("anima".to_owned()),
            promotion_destination: Some("nara:dialogue-adapter".to_owned()),
            promoted_artifact: None,
        })
        .expect_err("Nara human-required gate blocks agent approval");
    assert!(nara_agent_resolution.contains("requires human resolution"));

    seed_day_note(&root);
    let promotion_review = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Approve full-spine Epii dry-run promotion".to_owned(),
            body: "Human approves only the dry-run promotion plan for the kept run.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({
                "candidate_id": aletheia.candidate.candidate_id,
                "run_id": aletheia.run.run_id,
            }),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::RecursiveSelfModification,
                gate_kind: GateKind::RecursiveSelfModification,
                governance_level: GovernanceLevel::RecursiveLoadBearing,
                required_actors: vec!["human".to_owned()],
                candidate_id: Some(aletheia.candidate.candidate_id.clone()),
                orchestration_id: None,
                source_artifact_refs: vec![
                    format!(
                        "improvement://autoresearch/challenger/{}",
                        aletheia.run.run_id
                    ),
                    "review://s5/full-spine/approval".to_owned(),
                ],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: Some("epii:spine".to_owned()),
                source_actor_detail: Some("full-spine-acceptance".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("promotion review persists");
    let agent_approval = review_store
        .resolve(ReviewResolveRequest {
            item_id: promotion_review.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "agent must not approve recursive promotion".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: None,
        })
        .expect_err("recursive promotion requires human approval");
    assert!(agent_approval.contains("requires human resolution"));
    review_store
        .resolve(ReviewResolveRequest {
            item_id: promotion_review.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "human approves dry-run plan after real persisted evidence".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: Some("epii:spine".to_owned()),
            promoted_artifact: Some(json!({
                "uri": format!("improvement://autoresearch/challenger/{}", aletheia.run.run_id)
            })),
        })
        .expect("human approval persists");

    let evaluated = improve_store
        .evaluate(
            &aletheia.run.run_id,
            vec![EvaluationEvidence {
                dimension: "full_spine_acceptance".to_owned(),
                baseline_score: 0.1,
                challenger_score: 0.94,
                weight: 1.0,
                notes:
                    "Aletheia surfacing, review resolution, route state, and M5 DTOs are linked."
                        .to_owned(),
                source_refs: vec![
                    EvidenceSourceRef {
                        kind: "aletheia_inbox".to_owned(),
                        uri: "run://s5/full-spine/aletheia-inbox/session-full-spine#L0".to_owned(),
                        coordinate: Some("S5/S5'".to_owned()),
                        summary: Some("real JSONL inbox entry consumed".to_owned()),
                    },
                    EvidenceSourceRef {
                        kind: "review_gate".to_owned(),
                        uri: format!("review://s5/full-spine/{}", promotion_review.item_id),
                        coordinate: Some("S5/S5'".to_owned()),
                        summary: Some("human recursive gate resolved".to_owned()),
                    },
                ],
                kernel_evidence: None,
            }],
        )
        .expect("real evaluation persists");
    assert_eq!(format!("{:?}", evaluated.decision), "Some(Keep)");

    let route = aletheia_routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Anuttara)
        .expect("Anuttara route");
    let orchestration = improve_store
        .create_orchestration(CreateOrchestrationRequest {
            candidate_id: aletheia.candidate.candidate_id.clone(),
            route_id: route.route_id.clone(),
            review_item_id: Some(promotion_review.item_id.clone()),
            timeout_after_ms: Some(120_000),
            retry_policy: RetryPolicy::default(),
            now_ms: 1_780_300_200_000,
        })
        .expect("orchestration persists");
    improve_store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::InReview,
            reason: "review submitted through full-spine acceptance".to_owned(),
            now_ms: 1_780_300_210_000,
            review_stage: Some(ReviewStage::Submitted),
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("review transition persists");
    improve_store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::AwaitingUserValidation,
            reason: "human recursive gate is explicit before integration".to_owned(),
            now_ms: 1_780_300_220_000,
            review_stage: Some(ReviewStage::HumanReview),
            discard_reason: None,
            promotion_plan_id: None,
        })
        .expect("continuity transition persists");

    let dto = access
        .m5_promotion_dry_run(PromoteRequest {
            run_id: aletheia.run.run_id.clone(),
            destination: PromotionDestination::EpiiSpineMechanismUpdate {
                spine_component: "full-spine-acceptance".to_owned(),
            },
            legacy_destination: Some("epii:spine".to_owned()),
            approved_review_resolution_id: promotion_review.item_id.clone(),
            review_store_root: review_root.clone(),
            vault_root: root.join("Idea"),
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "full-spine-acceptance".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 9, 15, 0)),
            dry_run: true,
        })
        .expect("typed dry-run promotion uses real review and run");
    assert!(dto.ok);
    assert!(dto.dry_run);
    assert_eq!(dto.run_id, aletheia.run.run_id);
    assert_eq!(
        dto.compile_artifacts[0].namespace,
        M5ArtifactNamespace::Vault
    );

    improve_store
        .transition_orchestration(TransitionOrchestrationRequest {
            orchestration_id: orchestration.orchestration_id.clone(),
            next_state: OrchestrationState::Integrating,
            reason: "dry-run promotion plan created".to_owned(),
            now_ms: 1_780_300_230_000,
            review_stage: Some(ReviewStage::Resolved),
            discard_reason: None,
            promotion_plan_id: Some(format!("promotion-plan:{}", dto.run_id)),
        })
        .expect("integration transition persists");

    let workbench = access
        .m5_workbench_snapshot()
        .expect("M5 snapshot reads real stores");
    let workbench_json = serde_json::to_string(&workbench).expect("workbench json");
    assert!(workbench.spine_state.keep_count >= 1);
    assert!(!workbench.continuity_hints.is_empty());
    assert!(workbench_json.contains("pratibimba://handle/nara-consent-full-spine"));
    assert!(workbench_json.contains("graph://bimba/shacl/full-spine/shape-repeat"));
    assert!(!workbench_json.contains("raw protected body"));
    assert!(!workbench_json.contains("voice corpus body"));

    let deferred = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Deferred recursive full-spine review".to_owned(),
            body: "Real deferred review history for Epii-on-Epii adapter.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii", "run_id": aletheia.run.run_id}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("deferred recursive review submits");
    review_store
        .resolve(ReviewResolveRequest {
            item_id: deferred.item_id,
            decision: ReviewDecision::Defer,
            rationale: "needs another recursive pass".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("defer persists");
    let rejected = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Rejected recursive full-spine shortcut".to_owned(),
            body: "Real rejected review history for Epii-on-Epii adapter.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii", "run_id": aletheia.run.run_id}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("rejected recursive review submits");
    review_store
        .resolve(ReviewResolveRequest {
            item_id: rejected.item_id,
            decision: ReviewDecision::Reject,
            rationale: "shortcut bypasses recursive evidence".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("reject persists");

    let recursive_history = review_store.history(None).expect("review history loads");
    let recursive_surface = improve_store
        .surface_epii_review_inconsistency_from_history(
            &recursive_history,
            "review://s5/full-spine/recursive-window",
            1_780_300_300_000,
        )
        .expect("Epii-on-Epii adapter runs over persisted review history")
        .expect("recursive inconsistency surfaces");
    assert_eq!(
        recursive_surface.candidate.candidate.target_subsystem,
        TargetSubsystem::Epii
    );
}

#[test]
fn tranche_0_state_files_load_after_full_spine_extensions() {
    let root = temp_root("legacy-fixture");
    let improve_root = root.join("s5/epii-autoresearch");
    let review_root = root.join("s5/epii-review");
    std::fs::create_dir_all(&improve_root).expect("improve root");
    std::fs::create_dir_all(&review_root).expect("review root");
    std::fs::copy(
        fixture_path("s5-improvement-state.json"),
        improve_root.join("s5-improvement-state.json"),
    )
    .expect("copy legacy improvement fixture");
    std::fs::copy(
        fixture_path("s5-review-state.json"),
        review_root.join("s5-review-state.json"),
    )
    .expect("copy legacy review fixture");

    let access = EpiiAgentAccess::new(&root);
    let snapshot = access.snapshot().expect("legacy snapshot loads");
    let workbench = access
        .m5_workbench_snapshot()
        .expect("legacy workbench snapshot loads");

    assert!(snapshot.improvement.total_runs > 0);
    assert!(workbench.spine_state.total_runs > 0);
}

fn aletheia_entry(session_id: &str) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".to_owned(),
        source: "aletheia".to_owned(),
        session_id: session_id.to_owned(),
        day_id: "2026-06-02".to_owned(),
        final_vak: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4".to_owned(), "CT5".to_owned()],
            cp: "4.5".to_owned(),
            cf: "(5/0)".to_owned(),
            cfp: "P5/P0".to_owned(),
            cs: CsField {
                code: "CS-full-spine".to_owned(),
                direction: CsDirection::Day,
            },
        },
        improvement_vectors: vec![
            "Epii spine mechanism refinement from full-spine Aletheia disclosure".to_owned(),
        ],
        moirai_summary: BTreeMap::from([(
            "summary".to_owned(),
            "Aletheia disclosed a production-shaped S5 acceptance seam".to_owned(),
        )]),
        artifacts: vec!["vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned()],
        closure_kind: "rehear".to_owned(),
        disclosure_lineage: None,
    }
}

fn write_report(path: &Path, report: &NonAletheiaPipelineReport) {
    std::fs::create_dir_all(path.parent().expect("report parent")).expect("report dir");
    std::fs::write(
        path,
        serde_json::to_string_pretty(report).expect("serialize report"),
    )
    .expect("write report");
}

fn seed_day_note(root: &Path) {
    let day_note = root.join("Idea/Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().expect("day parent")).expect("day dir");
    std::fs::write(
        day_note,
        "# Day\n\nFull-spine acceptance dry-run promotion.\n",
    )
    .expect("write day note");
}

fn fixture_path(file_name: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../fixtures/track-04-t0")
        .join(file_name)
}

fn temp_root(name: &str) -> PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-full-spine-{name}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).unwrap();
    }
    std::fs::create_dir_all(&root).unwrap();
    root
}
