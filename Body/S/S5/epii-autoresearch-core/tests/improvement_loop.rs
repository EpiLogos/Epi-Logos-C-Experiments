use std::path::PathBuf;

use epi_s5_epii_autoresearch_core::{
    ArtifactRef, EvaluationEvidence, EvidenceSourceRef, ImprovementDecision, ImprovementStore,
    KernelEvidence, KernelTrajectoryRef, LoopState, PromoteRequest, PromotionDestination,
    PromotionHenTimestamp, ProposeRequest,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
use serde_json::json;

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
                    kernel_evidence: None,
                },
                EvaluationEvidence {
                    dimension: "simplicity".to_owned(),
                    baseline_score: 0.70,
                    challenger_score: 0.76,
                    weight: 0.3,
                    notes: "Challenger removes an ambiguous branch.".to_owned(),
                    source_refs: Vec::new(),
                    kernel_evidence: None,
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
                kernel_evidence: None,
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
fn kernel_evidence_is_advisory_and_never_final_judgement() {
    let root = temp_store_root("kernel_evidence_is_advisory");
    let store = ImprovementStore::new(&root);
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "consume kernel pulse as autoresearch evidence".to_owned(),
            source_review_item_id: Some("review-kernel-1".to_owned()),
            baseline: ArtifactRef::new("Idea/Bimba/Seeds/S/S5/S5-SPEC.md"),
        })
        .expect("proposal should persist");

    let baseline_kernel = json!({
        "coordinateOwner": "S0/QL-meta",
        "projectionOwner": "S3'",
        "privacy": "safe-public-current-kernel-tick",
        "computationSource": "portal-core::KernelProjection",
        "generation": 100,
        "tick": {
            "cycle": 8,
            "subTick": 4,
            "phase": "Descent",
            "element": "PratibimbaAsBimba",
            "position6": 4,
            "harmonicRatio": "0.666667"
        },
        "harmonicPulse": {
            "cycle": 8,
            "subTick": 4,
            "phase": "Descent",
            "element": "PratibimbaAsBimba",
            "ratioNum": 2,
            "ratioDen": 3,
            "tempoMultiplier": "0.666667",
            "periodMultiplier": "1.500000"
        },
        "energy": { "totalEnergy": "0.120000" }
    });
    let challenger_kernel = json!({
        "coordinateOwner": "S0/QL-meta",
        "projectionOwner": "S3'",
        "privacy": "safe-public-current-kernel-tick",
        "computationSource": "portal-core::KernelProjection",
        "generation": 101,
        "tick": {
            "cycle": 8,
            "subTick": 7,
            "phase": "Ascent",
            "element": "InverseMobius",
            "position6": 1,
            "harmonicRatio": "0.750000"
        },
        "harmonicPulse": {
            "cycle": 8,
            "subTick": 7,
            "phase": "Ascent",
            "element": "InverseMobius",
            "ratioNum": 3,
            "ratioDen": 4,
            "tempoMultiplier": "0.750000",
            "periodMultiplier": "1.333333"
        },
        "energy": { "totalEnergy": "0.270000" }
    });
    let kernel_evidence = KernelEvidence::from_public_projections(
        &baseline_kernel,
        &challenger_kernel,
        Some("tritone-square:2:+0.080000".to_owned()),
        "kernel deltas are advisory evidence only; Epii review decides interpretation",
    )
    .expect("safe public kernel projections should produce advisory evidence")
    .with_trajectory(KernelTrajectoryRef {
        session_key: "agent:epii:main".to_owned(),
        day_id: "17-05-2026".to_owned(),
        now_path: Some("Idea/Empty/Present/17-05-2026/20260517-120000-epii/now.md".to_owned()),
        spacetimedb_session_surface: Some("session_surface".to_owned()),
        spacetimedb_global_surface: Some("global_temporal_surface".to_owned()),
        graphiti_arc_id: Some("day:17-05-2026:session:epii-main".to_owned()),
    })
    .expect("kernel evidence trajectory refs should validate");

    let evaluated = store
        .evaluate(
            &run.run_id,
            vec![EvaluationEvidence {
                dimension: "kernel_harmonic_delta".to_owned(),
                baseline_score: 0.85,
                challenger_score: 0.40,
                weight: 1.0,
                notes: "Kernel delta is available, but the baseline still wins on Epii judgement."
                    .to_owned(),
                source_refs: vec![EvidenceSourceRef {
                    kind: "s3_temporal_context".to_owned(),
                    uri: "s3'.temporal.context#/kernel".to_owned(),
                    coordinate: Some("S3'".to_owned()),
                    summary: Some("safe-public-current-kernel-tick".to_owned()),
                }],
                kernel_evidence: Some(kernel_evidence),
            }],
        )
        .expect("kernel evidence should persist");

    assert_eq!(evaluated.decision, Some(ImprovementDecision::Discard));
    let evidence = &evaluated.evaluation.as_ref().unwrap().evidence[0];
    let kernel = evidence.kernel_evidence.as_ref().unwrap();
    assert!(kernel.advisory_only);
    assert_eq!(kernel.delta.energy_delta, "0.150000");
    assert_eq!(
        kernel.interpretation_boundary,
        "kernel deltas are advisory evidence only; Epii review decides interpretation"
    );
    assert_eq!(kernel.baseline.total_energy, "0.120000");
    assert_eq!(kernel.challenger.total_energy, "0.270000");
    assert_eq!(
        kernel
            .trajectory
            .as_ref()
            .unwrap()
            .spacetimedb_global_surface,
        Some("global_temporal_surface".to_owned())
    );
    assert_eq!(
        kernel
            .trajectory
            .as_ref()
            .unwrap()
            .graphiti_arc_id
            .as_deref(),
        Some("day:17-05-2026:session:epii-main")
    );

    let status = store.status().expect("status should load");
    assert_eq!(status.kernel_evidence_count, 1);
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
                kernel_evidence: None,
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
    let day_note = vault.join("Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nAutoresearch improvement record.\n").unwrap();

    let store = ImprovementStore::new(root.join(".epi/s5/autoresearch"));
    let review_root = root.join(".epi/s5/review");
    let approved_review_id = submit_review_resolution(
        &review_root,
        ReviewDecision::Approve,
        ReviewCategory::StandardImprovement,
        GateKind::Standard,
        GovernanceLevel::Advisory,
        Some("seeds"),
    );
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "promote accepted improvement through Hen".to_owned(),
            source_review_item_id: Some(approved_review_id.clone()),
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
                kernel_evidence: None,
            }],
        )
        .expect("evaluation should persist");

    let promotion = store
        .promote(PromoteRequest {
            run_id: run.run_id,
            destination: PromotionDestination::SeedDeposit {
                seed_path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
            },
            legacy_destination: Some("seeds".to_owned()),
            approved_review_resolution_id: approved_review_id,
            review_store_root: review_root,
            vault_root: vault,
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "autoresearch-return-law".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 8, 30, 0)),
            dry_run: true,
        })
        .expect("dry-run promotion should plan through Hen");

    assert!(promotion.ok);
    assert!(promotion.dry_run);
    assert_eq!(promotion.promoted_path, None);
    assert_eq!(
        promotion.governance_category,
        ReviewCategory::StandardImprovement
    );
    assert!(!promotion.rollback_plan.executable);
    assert_eq!(promotion.legacy_destination.as_deref(), Some("seeds"));
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
            destination: PromotionDestination::SeedDeposit {
                seed_path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
            },
            legacy_destination: Some("seeds".to_owned()),
            approved_review_resolution_id: "resolution-1".to_owned(),
            review_store_root: root.join(".epi/s5/review"),
            vault_root: root.join("Idea"),
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "blocked".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 0, 0, 0)),
            dry_run: false,
        })
        .expect_err("non-dry-run promotion must stay blocked");

    assert!(error.contains("non-dry-run autoresearch promotion"));
}

#[test]
fn promotion_rejects_incompatible_destination_for_candidate_target() {
    let root = temp_store_root("promotion_rejects_incompatible_destination_for_candidate_target");
    let vault = root.join("Idea");
    let day_note = vault.join("Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nTyped mismatch.\n").unwrap();
    let review_root = root.join(".epi/s5/review");
    let approved_review_id = submit_review_resolution(
        &review_root,
        ReviewDecision::Approve,
        ReviewCategory::StandardImprovement,
        GateKind::Standard,
        GovernanceLevel::Advisory,
        Some("anuttara:ontology"),
    );
    let store = ImprovementStore::new(root.join(".epi/s5/autoresearch"));
    let run = kept_run(&store, Some(approved_review_id.clone()));

    let error = store
        .promote(PromoteRequest {
            run_id: run.run_id,
            destination: PromotionDestination::AnuttaraOntologyExtension {
                axiom_target: "ql:UnsafeShortcut".to_owned(),
            },
            legacy_destination: Some("anuttara:ontology".to_owned()),
            approved_review_resolution_id: approved_review_id,
            review_store_root: review_root,
            vault_root: vault,
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "typed-mismatch".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 0, 0, 0)),
            dry_run: true,
        })
        .expect_err("candidate/destination mismatch must be rejected");

    assert!(error.contains("promotion destination targets"));
}

#[test]
fn promotion_requires_approved_review_resolution() {
    let root = temp_store_root("promotion_requires_approved_review_resolution");
    let vault = root.join("Idea");
    let day_note = vault.join("Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nReview gate.\n").unwrap();
    let store = ImprovementStore::new(root.join(".epi/s5/autoresearch"));
    let run = kept_run(&store, None);

    for decision in [ReviewDecision::Reject, ReviewDecision::Defer] {
        let review_root = root.join(format!(".epi/s5/review-{decision:?}"));
        let review_id = submit_review_resolution(
            &review_root,
            decision,
            ReviewCategory::StandardImprovement,
            GateKind::Standard,
            GovernanceLevel::Advisory,
            Some("seeds"),
        );
        let error = store
            .promote(PromoteRequest {
                run_id: run.run_id.clone(),
                destination: PromotionDestination::SeedDeposit {
                    seed_path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
                },
                legacy_destination: Some("seeds".to_owned()),
                approved_review_resolution_id: review_id,
                review_store_root: review_root,
                vault_root: vault.clone(),
                compiler_root: root.join("Body/S/S1/hen-compiler"),
                artifact_slug: format!("review-{decision:?}"),
                requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 0, 0, 0)),
                dry_run: true,
            })
            .expect_err("non-approved review must block promotion planning");
        assert!(error.contains("not approve"));
    }
}

#[test]
fn promotion_requires_governance_category_compatible_with_destination() {
    let root = temp_store_root("promotion_requires_governance_category_compatible");
    let vault = root.join("Idea");
    let day_note = vault.join("Empty/Present/02-06-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nGovernance mismatch.\n").unwrap();
    let review_root = root.join(".epi/s5/review");
    let review_id = submit_review_resolution(
        &review_root,
        ReviewDecision::Approve,
        ReviewCategory::StandardImprovement,
        GateKind::Standard,
        GovernanceLevel::Advisory,
        Some("world"),
    );
    let store = ImprovementStore::new(root.join(".epi/s5/autoresearch"));
    let run = kept_run(&store, Some(review_id.clone()));

    let error = store
        .promote(PromoteRequest {
            run_id: run.run_id,
            destination: PromotionDestination::WorldPromotion {
                world_path: "Idea/Worlds/S5/accepted.md".to_owned(),
                source_seed_path: "Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned(),
            },
            legacy_destination: Some("world".to_owned()),
            approved_review_resolution_id: review_id,
            review_store_root: review_root,
            vault_root: vault,
            compiler_root: root.join("Body/S/S1/hen-compiler"),
            artifact_slug: "governance-mismatch".to_owned(),
            requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 0, 0, 0)),
            dry_run: true,
        })
        .expect_err("wrong governance category must block promotion planning");

    assert!(error.contains("incompatible with destination category"));
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

fn kept_run(
    store: &ImprovementStore,
    source_review_item_id: Option<String>,
) -> epi_s5_epii_autoresearch_core::ImprovementRun {
    let run = store
        .propose(ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/S5'".to_owned(),
            direction: "promote accepted improvement through Hen".to_owned(),
            source_review_item_id,
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
                kernel_evidence: None,
            }],
        )
        .expect("evaluation should persist")
}

fn submit_review_resolution(
    review_root: &std::path::Path,
    decision: ReviewDecision,
    category: ReviewCategory,
    gate_kind: GateKind,
    level: GovernanceLevel,
    promotion_destination: Option<&str>,
) -> String {
    let review_store = ReviewStore::new(review_root);
    let item = review_store
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Promote autoresearch candidate".to_owned(),
            body: "Review the kept challenger before promotion planning.".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({"coordinate": "S5/S5'"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category,
                gate_kind,
                governance_level: level,
                required_actors: vec!["epii".to_owned()],
                candidate_id: Some("candidate:promotion-test".to_owned()),
                orchestration_id: Some("orchestration:promotion-test".to_owned()),
                source_artifact_refs: vec!["autoresearch://challenger/test".to_owned()],
                target_subsystem: Some("Epii".to_owned()),
                vector_kind: Some("EpiiSpineMechanismRefinement".to_owned()),
                promotion_destination: promotion_destination.map(str::to_owned),
                source_actor_detail: Some("autoresearch".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("review should submit");
    review_store
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision,
            rationale: "reviewed through real review store".to_owned(),
            resolved_by: ResolutionActor::Human,
            promotion_destination: promotion_destination.map(str::to_owned),
            promoted_artifact: Some(json!({"artifact": "autoresearch://challenger/test"})),
        })
        .expect("review should resolve");
    item.item_id
}
