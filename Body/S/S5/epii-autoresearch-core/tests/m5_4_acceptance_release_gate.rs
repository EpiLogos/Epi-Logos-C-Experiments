use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use epi_s5_epii_autoresearch_core::adapters::{
    AnuttaraShaclFailureReport, MahamayaRuntimeTrainingReport, ParamasivaCorpusRefreshReport,
};
use epi_s5_epii_autoresearch_core::capacity_workflows::{
    build_aletheia_control_room_lineage_cards, run_anuttara_deterministic_slice,
    run_epii_recursive_governance_slice, run_mahamaya_runtime_capacity_slice,
    run_nara_anima_voice_governance, run_paramasiva_training_capacity_slice,
    submit_aletheia_lineage_review, AgentAnnotationKind, MahamayaRuntimeTier, NaraExchangeRecord,
    NaraGateKind, NaraVoiceGovernanceRequest, RecursiveReviewProtocolKind, SliceGovernanceClass,
};
use epi_s5_epii_autoresearch_core::inbox::{
    DisclosureLineage, DisclosureLineageStage, InboxEntry, InboxStore, MoiraiMode,
};
use epi_s5_epii_autoresearch_core::{
    ImprovementStore, PromoteRequest, PromotionDestination, PromotionHenTimestamp,
    SurfacingPipelineId, TargetSubsystem,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewCategory, ReviewDecision,
    ReviewPriority, ReviewResolveRequest, ReviewSource, ReviewStore, ReviewSubmission,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::{json, Value};

#[test]
fn full_m5_4_release_gate_covers_all_capacity_routes_without_placeholders_or_leaks() {
    let root = temp_root("m5-4-release-gate");
    seed_vault_sources(&root);

    let autoresearch = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let review = ReviewStore::new(root.join("s5/epii-review"));

    let present = root.join("Idea/Empty/Present");
    let inbox = InboxStore::new(&present).expect("canonical present inbox opens");
    inbox
        .append(aletheia_entry("release-gate-lineage", full_lineage()))
        .expect("differentiated Aletheia JSONL append succeeds");
    let aletheia_receipt = autoresearch
        .surface_aletheia_lineage_inbox(&inbox)
        .expect("lineage intake should surface")
        .pop()
        .expect("one Aletheia lineage receipt");
    assert_eq!(
        aletheia_receipt
            .surfaced
            .candidate
            .candidate
            .surfacing_pipeline,
        SurfacingPipelineId::AletheiaDisclosure
    );
    assert_eq!(aletheia_receipt.lineage.source_subagent, "anansi");
    assert!(aletheia_receipt
        .lineage
        .stages
        .iter()
        .any(|stage| stage.specialist == "janus"));
    assert!(aletheia_receipt
        .lineage
        .stages
        .iter()
        .any(|stage| stage.specialist == "agora"));
    let aletheia_review = submit_aletheia_lineage_review(&review, &aletheia_receipt, NOW_MS)
        .expect("Aletheia lineage review persists");
    assert!(aletheia_review.requires_human);
    assert_agent_cannot_approve(&review, &aletheia_review.item_id, "anansi");
    let lineage_cards = build_aletheia_control_room_lineage_cards(&review)
        .expect("control room lineage cards reload from persisted review state");
    assert_eq!(lineage_cards.len(), 4);

    let anuttara = run_anuttara_deterministic_slice(
        &autoresearch,
        &review,
        AnuttaraShaclFailureReport {
            report_uri: "graph://s2/shacl/reports/release-gate-anuttara".to_owned(),
            shape_id: "ql:CanonicalVakShape".to_owned(),
            severity: "violation".to_owned(),
            failing_focus_nodes: vec!["bimba://M0/0".to_owned(), "bimba://M0/1".to_owned()],
            message: "load-bearing Anuttara axiom lacks canonical VAK keys".to_owned(),
            observed_at_ms: NOW_MS_U64,
            fingerprint: Some("release-gate-anuttara".to_owned()),
        },
        vec![TargetSubsystem::Anuttara, TargetSubsystem::Paramasiva],
        root.join("Idea"),
        root.join("Body/S/S1/hen-compiler"),
        NOW_MS + 1,
    )
    .expect("Anuttara-first cross-target slice runs");
    assert_eq!(anuttara.capacity, TargetSubsystem::Anuttara);
    assert_eq!(anuttara.governance_class, SliceGovernanceClass::LoadBearing);
    assert!(anuttara
        .routes
        .iter()
        .any(|route| route.target_subsystem == TargetSubsystem::Paramasiva));
    assert!(
        anuttara
            .promotion_plan
            .as_ref()
            .expect("Anuttara dry-run plan")
            .dry_run
    );

    let paramasiva = run_paramasiva_training_capacity_slice(
        &autoresearch,
        &review,
        ParamasivaCorpusRefreshReport {
            manifest_uri: root
                .join("Idea/Bimba/Seeds/M/M5'/paramasiva-corpus-manifest.json")
                .to_string_lossy()
                .to_string(),
            corpus_segment: "alpha-quaternionic-integration".to_owned(),
            retrieval_metric_name: "canonical_eval_perplexity".to_owned(),
            current_metric_value: 1.18,
            maximum_acceptable_value: 1.10,
            new_derivational_tokens: 64_000,
            synthetic_proof_review_uri: "s5://reviews/synthetic-proof/release-gate-paramasiva"
                .to_owned(),
            gds_augmentation_uri: "graph://s2/gds/paramasiva/release-gate".to_owned(),
            observed_at_ms: NOW_MS_U64 + 2,
            fingerprint: Some("release-gate-paramasiva".to_owned()),
        },
        root.join("Idea"),
        root.join("Body/S/S1/hen-compiler"),
        NOW_MS + 2,
    )
    .expect("Paramasiva corpus route runs");
    assert_eq!(paramasiva.capacity, TargetSubsystem::Paramasiva);
    assert!(paramasiva.review_item.requires_human);
    assert!(paramasiva.annotations.iter().any(|annotation| {
        annotation.kind == AgentAnnotationKind::EpiiCoReview
            || annotation.kind == AgentAnnotationKind::SophiaReview
    }));
    assert!(
        paramasiva
            .promotion_plan
            .as_ref()
            .expect("Paramasiva dry-run plan")
            .dry_run
    );

    let mahamaya = run_mahamaya_runtime_capacity_slice(
        &autoresearch,
        &review,
        MahamayaRuntimeTrainingReport {
            report_uri: "s5://training/mahamaya/release-gate-round".to_owned(),
            training_round_id: "release-gate-round".to_owned(),
            tier: MahamayaRuntimeTier::RuntimePolicy,
            reward_metric_name: "process_reward_acceptance".to_owned(),
            current_reward_score: 0.63,
            minimum_reward_score: 0.74,
            pathway_diversity_score: 0.58,
            minimum_pathway_diversity: 0.70,
            rollback_handle: "rollback://mahamaya/policy/release-gate-prior".to_owned(),
            integration_impact_uri: "s5://integration/mahamaya/release-gate-impact".to_owned(),
            observed_at_ms: NOW_MS_U64 + 3,
            fingerprint: Some("release-gate-mahamaya".to_owned()),
        },
        NOW_MS + 3,
    )
    .expect("Mahamaya runtime-pipeline route runs");
    assert_eq!(mahamaya.capacity, TargetSubsystem::Mahamaya);
    assert!(mahamaya.review_item.requires_human);
    assert!(mahamaya.promotion_plan.is_none());
    assert_agent_cannot_approve(&review, &mahamaya.review_item.item_id, "epii");

    let nara = run_nara_anima_voice_governance(
        &autoresearch,
        &review,
        NaraVoiceGovernanceRequest {
            canonical_artifact_path: root.join("Pratibimba/Nara/release-gate/dialogic.jsonl"),
            adapter_version: "nara-qlora-release-gate".to_owned(),
            parser_model_path: "pi://inference/nara-parser/release-gate".to_owned(),
            dialogue_adapter_path: "qlora://nara/dialogue-adapter/release-gate".to_owned(),
            rollback_handle: "rollback://nara/dialogue-adapter/release-gate-prior".to_owned(),
            dpo_preference_pairs: 640,
            exchanges: nara_exchanges(),
            now_ms: NOW_MS + 4,
        },
    )
    .expect("Nara Anima-primary route runs");
    assert_eq!(nara.gate_records.len(), 5);
    assert!(nara
        .gate_records
        .iter()
        .any(|gate| gate.kind == NaraGateKind::Deployment));
    assert_ne!(nara.parser_model_path, nara.dialogue_adapter_path);

    seed_recursive_history(&review);
    let history = review.history(None).expect("review history reloads");
    let recursive_candidate = autoresearch
        .surface_epii_review_inconsistency_from_history(
            &history,
            "review://s5/release-gate/recursive-window",
            NOW_MS + 5,
        )
        .expect("recursive history adapter runs")
        .expect("Epii-on-Epii recursive route surfaces");
    let recursive = run_epii_recursive_governance_slice(
        &autoresearch,
        &review,
        recursive_candidate,
        NOW_MS + 6,
    )
    .expect("Epii-on-Epii recursive governance route runs");
    assert_eq!(
        recursive.surfaced.candidate.candidate.target_subsystem,
        TargetSubsystem::Epii
    );
    assert!(recursive.review_item.requires_human);
    assert!(recursive.protocols.iter().any(|protocol| {
        protocol.kind == RecursiveReviewProtocolKind::SophiaOnSophia && protocol.self_review_marked
    }));
    assert_agent_cannot_approve(&review, &recursive.review_item.item_id, "sophia");

    let non_dry_run = autoresearch.promote(PromoteRequest {
        run_id: recursive.surfaced.run.run_id.clone(),
        destination: PromotionDestination::EpiiSpineMechanismUpdate {
            spine_component: "release-gate-recursive-review".to_owned(),
        },
        legacy_destination: Some("epii:spine".to_owned()),
        approved_review_resolution_id: recursive.review_item.item_id.clone(),
        review_store_root: review.root_path().to_path_buf(),
        vault_root: root.join("Idea"),
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        artifact_slug: "release-gate-recursive-review".to_owned(),
        requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 12, 0, 0)),
        dry_run: false,
    });
    assert!(non_dry_run
        .expect_err("non-dry-run mutation must stay blocked")
        .contains("non-dry-run autoresearch promotion is blocked"));

    let release_report = json!({
        "task": "09.T10",
        "readiness": [
            {"surface": "S5 acceptance harness", "state": "ready", "evidence": "all six capacity routes exercised through persisted S5 stores"},
            {"surface": "/body live UI", "state": "degraded_upstream", "evidence": "Track 06 live surface harness remains the UI readiness authority"},
            {"surface": "/pratibimba/system Theia summon", "state": "degraded_upstream", "evidence": "Track 05/10 Theia harness remains the shell readiness authority"},
            {"surface": "S0/S2/S3 live service startup", "state": "degraded_upstream", "evidence": "Track 01-03 live harnesses gate service readiness"}
        ],
        "aletheia": aletheia_receipt,
        "aletheia_review": aletheia_review,
        "aletheia_cards": lineage_cards,
        "anuttara": anuttara,
        "paramasiva": paramasiva,
        "mahamaya": mahamaya,
        "nara": nara,
        "recursive": recursive
    });
    let report_path = root.join("reports/09-t10-m5-4-release-readiness.json");
    write_report(&report_path, &release_report);
    let persisted_report = std::fs::read_to_string(report_path).expect("report persists");

    assert_no_placeholder_ids(&release_report);
    assert_no_protected_body_leakage(&persisted_report);
    assert!(persisted_report.contains("degraded_upstream"));
    assert!(persisted_report.contains("lineage://aletheia/release-gate-lineage"));
    assert!(persisted_report.contains("graph://s2/shacl/reports/release-gate-anuttara"));
}

const NOW_MS: u128 = 1_780_500_000_000;
const NOW_MS_U64: u64 = 1_780_500_000_000;

fn assert_agent_cannot_approve(review: &ReviewStore, item_id: &str, actor: &str) {
    let err = review
        .resolve(ReviewResolveRequest {
            item_id: item_id.to_owned(),
            decision: ReviewDecision::Approve,
            rationale: format!("{actor} must not approve a human-required M5-4 gate"),
            resolved_by: ResolutionActor::Agent(actor.to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect_err("agent approval should be rejected");
    assert!(err.contains("requires human resolution"));
}

fn assert_no_placeholder_ids(value: &Value) {
    fn visit(value: &Value) {
        match value {
            Value::String(s) => {
                let lower = s.to_ascii_lowercase();
                for forbidden in ["placeholder", "mock", "demo"] {
                    assert!(
                        !lower.contains(forbidden),
                        "release gate leaked forbidden placeholder marker {forbidden}: {s}"
                    );
                }
            }
            Value::Array(values) => {
                for value in values {
                    visit(value);
                }
            }
            Value::Object(map) => {
                for value in map.values() {
                    visit(value);
                }
            }
            _ => {}
        }
    }
    visit(value);
}

fn assert_no_protected_body_leakage(encoded: &str) {
    for forbidden in [
        "RAW_NARA_BODY_DO_NOT_EXPORT",
        "raw journal dream oracle dialogue body",
        "Alice 555-0101",
        "PROTECTED_ALETHEIA_BODY_DO_NOT_EXPORT",
        "protected dialogic journal text",
        "voice corpus body",
    ] {
        assert!(
            !encoded.contains(forbidden),
            "release readiness report leaked protected body fragment: {forbidden}"
        );
    }
}

fn aletheia_entry(session_id: &str, lineage: DisclosureLineage) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".to_owned(),
        source: "aletheia".to_owned(),
        session_id: session_id.to_owned(),
        day_id: "02-06-2026".to_owned(),
        final_vak: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4".to_owned(), "CT5".to_owned()],
            cp: "4.5".to_owned(),
            cf: "(5/0)".to_owned(),
            cfp: "P5/P0".to_owned(),
            cs: CsField {
                code: "CS-release-gate".to_owned(),
                direction: CsDirection::Day,
            },
        },
        improvement_vectors: vec![
            "Epii spine mechanism refinement from differentiated Aletheia release disclosure"
                .to_owned(),
        ],
        moirai_summary: BTreeMap::from([(
            "klotho".to_owned(),
            "Aletheia disclosed a release-gate mediation seam".to_owned(),
        )]),
        artifacts: vec!["vault://Idea/Bimba/Seeds/S/S5/S5-SPEC.md".to_owned()],
        closure_kind: "rehear".to_owned(),
        disclosure_lineage: Some(lineage),
    }
}

fn full_lineage() -> DisclosureLineage {
    DisclosureLineage {
        lineage_id: "lineage://aletheia/release-gate-lineage".to_owned(),
        source_subagent: "anansi".to_owned(),
        moirai_mode: Some(MoiraiMode::Klotho),
        tool_refs: vec!["aletheia_gnosis_query".to_owned()],
        skill_refs: vec!["repl.md".to_owned(), "gnosis-retrieve.md".to_owned()],
        gate_refs: vec!["anima-dispatch://release-gate/lineage".to_owned()],
        namespace_refs: vec![
            "bimba://M5/Epii".to_owned(),
            "gnosis://notebook/release-gate".to_owned(),
            "graphiti://episode/release-gate-handle-only".to_owned(),
        ],
        privacy_class: "requires_review".to_owned(),
        readiness: "ready_with_human_gate".to_owned(),
        day_id: "02-06-2026".to_owned(),
        now_path: Some("Idea/Empty/Present/02-06-2026/release-gate/now.md".to_owned()),
        session_id: "release-gate-lineage".to_owned(),
        parent_session_refs: vec!["session-parent-release-safe-handle".to_owned()],
        child_session_refs: vec!["session-child-release-safe-handle".to_owned()],
        evidence_handles: vec!["evidence://aletheia/release-gate".to_owned()],
        stages: vec![
            DisclosureLineageStage {
                specialist: "anansi".to_owned(),
                stage: "orientation".to_owned(),
                tool_refs: vec!["aletheia_gnosis_query".to_owned()],
                skill_refs: vec!["repl.md".to_owned()],
                evidence_handles: vec!["evidence://anansi/release-gate".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "moirai".to_owned(),
                stage: "klotho_assert".to_owned(),
                tool_refs: vec!["aletheia_crystallise".to_owned()],
                skill_refs: vec!["thought-distil.md".to_owned()],
                evidence_handles: vec!["evidence://moirai/release-gate".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "janus".to_owned(),
                stage: "temporal_integration".to_owned(),
                tool_refs: vec!["aletheia_thought_route".to_owned()],
                skill_refs: vec!["temporal-context.md".to_owned()],
                evidence_handles: vec!["evidence://janus/release-gate".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "agora".to_owned(),
                stage: "consensus_aggregation".to_owned(),
                tool_refs: vec!["aletheia_gnosis_query".to_owned()],
                skill_refs: vec!["parallel-synthesis.md".to_owned()],
                evidence_handles: vec!["evidence://agora/release-gate".to_owned()],
            },
        ],
    }
}

fn nara_exchanges() -> Vec<NaraExchangeRecord> {
    vec![
        NaraExchangeRecord {
            exchange_handle: "nara://exchange/release-consented-pii-stripped".to_owned(),
            consent_handle: Some("consent://nara/release-gate/001".to_owned()),
            consented: true,
            pressure_free: true,
            inspectable: true,
            revoked: false,
            pii_stripped_body: "PII_STRIPPED: dialogic register drift with consent handle"
                .to_owned(),
            raw_body: Some(
                "RAW_NARA_BODY_DO_NOT_EXPORT raw journal dream oracle dialogue body Alice 555-0101"
                    .to_owned(),
            ),
            sample_count: 2_500,
            quality_score: 0.91,
            quality_threshold: 0.82,
            drift_kind: Some("dialogic-register-drift".to_owned()),
            new_register: None,
            systematic_feedback_count: 6,
        },
        NaraExchangeRecord {
            exchange_handle: "nara://exchange/release-volume-only".to_owned(),
            consent_handle: Some("consent://nara/release-gate/volume".to_owned()),
            consented: true,
            pressure_free: true,
            inspectable: true,
            revoked: false,
            pii_stripped_body: "PII_STRIPPED: ordinary volume without drift".to_owned(),
            raw_body: Some("voice corpus body must not leak".to_owned()),
            sample_count: 25_000,
            quality_score: 0.95,
            quality_threshold: 0.80,
            drift_kind: None,
            new_register: None,
            systematic_feedback_count: 0,
        },
    ]
}

fn seed_recursive_history(review: &ReviewStore) {
    let deferred = review
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Deferred recursive release-gate review".to_owned(),
            body: "Review timing grew during recursive release-gate inspection.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii", "window": "release-gate"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("deferred recursive review submits");
    review
        .resolve(ReviewResolveRequest {
            item_id: deferred.item_id,
            decision: ReviewDecision::Defer,
            rationale: "needs another recursive pass".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("defer persists");

    let rejected = review
        .submit(ReviewSubmission {
            source: ReviewSource::Autoresearch,
            title: "Rejected recursive release-gate shortcut".to_owned(),
            body: "Shortcut bypassed recursive evidence discipline.".to_owned(),
            priority: ReviewPriority::High,
            coordinate_context: json!({"coordinate": "S5/Epii", "window": "release-gate"}),
            proposed_action: None,
            requires_human: false,
            kernel_visibility: None,
            governance_profile: None,
        })
        .expect("rejected recursive review submits");
    review
        .resolve(ReviewResolveRequest {
            item_id: rejected.item_id,
            decision: ReviewDecision::Reject,
            rationale: "shortcut bypasses recursive evidence".to_owned(),
            resolved_by: ResolutionActor::Agent("epii".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect("reject persists");

    review
        .submit(ReviewSubmission {
            source: ReviewSource::HumanGate,
            title: "Protected local Nara review".to_owned(),
            body: "protected dialogic journal text must not leave review internals".to_owned(),
            priority: ReviewPriority::Blocking,
            coordinate_context: json!({
                "protected_body": "voice corpus body",
                "safe_handle": "pratibimba://handle/release-gate-nara"
            }),
            proposed_action: None,
            requires_human: true,
            kernel_visibility: None,
            governance_profile: Some(GovernanceProfile {
                category: ReviewCategory::NaraAnimaPrimaryGate,
                gate_kind: GateKind::HumanFinal,
                governance_level: GovernanceLevel::HumanRequired,
                required_actors: vec!["human".to_owned(), "anima".to_owned()],
                candidate_id: None,
                orchestration_id: None,
                source_artifact_refs: vec!["pratibimba://handle/release-gate-nara".to_owned()],
                target_subsystem: Some("Nara".to_owned()),
                vector_kind: Some("ProtectedLocalNaraVoice".to_owned()),
                promotion_destination: None,
                source_actor_detail: Some("nara:protected-local-handle".to_owned()),
                stage_records: Vec::new(),
            }),
        })
        .expect("protected Nara review submits");
}

fn seed_vault_sources(root: &Path) {
    let anuttara_seed = root.join("Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md");
    std::fs::create_dir_all(anuttara_seed.parent().unwrap()).expect("Anuttara seed parent");
    std::fs::write(&anuttara_seed, "# M0\n\nRelease-gate Anuttara seed.\n").expect("Anuttara seed");

    let paramasiva_manifest = root.join("Idea/Bimba/Seeds/M/M5'/paramasiva-corpus-manifest.json");
    std::fs::create_dir_all(paramasiva_manifest.parent().unwrap())
        .expect("Paramasiva manifest parent");
    std::fs::write(
        &paramasiva_manifest,
        r#"{
          "manifest_id": "paramasiva-release-gate",
          "segments": ["M1-prime-spec", "alpha-quaternionic-integration"],
          "synthetic_proof_review_uri": "s5://reviews/synthetic-proof/release-gate-paramasiva"
        }"#,
    )
    .expect("Paramasiva manifest");
}

fn write_report(path: &Path, report: &Value) {
    std::fs::create_dir_all(path.parent().expect("report parent")).expect("report directory");
    std::fs::write(
        path,
        serde_json::to_string_pretty(report).expect("serialize release report"),
    )
    .expect("write release report");
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-s5-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
