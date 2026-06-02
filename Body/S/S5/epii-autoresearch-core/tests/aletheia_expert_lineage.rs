use std::collections::BTreeMap;
use std::path::PathBuf;

use epi_s5_epii_autoresearch_core::capacity_workflows::{
    build_aletheia_control_room_lineage_cards, submit_aletheia_lineage_review,
};
use epi_s5_epii_autoresearch_core::inbox::{
    DisclosureLineage, DisclosureLineageStage, InboxEntry, InboxStore, MoiraiMode,
};
use epi_s5_epii_autoresearch_core::{ImprovementStore, SurfacingPipelineId};
use epi_s5_epii_review_core::{
    ResolutionActor, ReviewDecision, ReviewResolveRequest, ReviewSource, ReviewStore,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};

#[test]
fn aletheia_jsonl_lineage_surfaces_candidate_review_governance_and_control_room_cards() {
    let root = temp_root("lineage-surface");
    let present = root.join("Idea/Empty/Present");
    let inbox = InboxStore::new(&present).expect("canonical present inbox opens");
    let entry = lineage_entry("session-lineage", full_lineage());
    inbox.append(entry).expect("lineage JSONL append succeeds");

    let autoresearch = ImprovementStore::new(root.join("s5/epii-autoresearch"));
    let receipts = autoresearch
        .surface_aletheia_lineage_inbox(&inbox)
        .expect("Aletheia lineage intake surfaces");
    assert_eq!(receipts.len(), 1);
    let lineage_receipt = &receipts[0];
    assert_eq!(
        lineage_receipt
            .surfaced
            .candidate
            .candidate
            .surfacing_pipeline,
        SurfacingPipelineId::AletheiaDisclosure
    );
    assert_eq!(lineage_receipt.lineage.source_subagent.as_str(), "anansi");
    assert!(lineage_receipt
        .surfaced
        .candidate
        .candidate
        .observation_evidence
        .source_uri
        .starts_with("vault://Idea/Empty/Present/02-06-2026/session-lineage.jsonl"));
    let candidate_json =
        serde_json::to_string(&lineage_receipt.surfaced.candidate).expect("candidate json");
    assert!(candidate_json.contains("lineage://aletheia/session-lineage"));
    assert!(!candidate_json.contains("PROTECTED_ALETHEIA_BODY_DO_NOT_EXPORT"));

    let review = ReviewStore::new(root.join("s5/epii-review"));
    let item = submit_aletheia_lineage_review(&review, lineage_receipt, 1_780_205_000_000)
        .expect("Aletheia lineage review should persist");
    assert_eq!(item.source, ReviewSource::Aletheia);
    let profile = item
        .governance_profile
        .as_ref()
        .expect("governance profile");
    assert_eq!(
        profile.source_actor_detail.as_deref(),
        Some("aletheia:anansi:lineage://aletheia/session-lineage")
    );
    assert!(profile
        .stage_records
        .iter()
        .any(|stage| stage.actor == "janus"));
    assert!(profile
        .stage_records
        .iter()
        .any(|stage| stage.actor == "agora"));
    assert!(profile
        .source_artifact_refs
        .iter()
        .all(|handle| !handle.contains("PROTECTED_ALETHEIA_BODY_DO_NOT_EXPORT")));

    let agent_resolution = review
        .resolve(ReviewResolveRequest {
            item_id: item.item_id.clone(),
            decision: ReviewDecision::Approve,
            rationale: "Aletheia specialist should not approve Epii gate".to_owned(),
            resolved_by: ResolutionActor::Agent("anansi".to_owned()),
            promotion_destination: None,
            promoted_artifact: None,
        })
        .expect_err("Aletheia specialists cannot resolve human-required Epii gates");
    assert!(agent_resolution.contains("requires human resolution"));

    let reloaded_review = ReviewStore::new(root.join("s5/epii-review"));
    let cards = build_aletheia_control_room_lineage_cards(&reloaded_review)
        .expect("cards reload from persisted review");
    assert_eq!(cards.len(), 4);
    assert!(cards.iter().any(|card| card.specialist == "anansi"));
    assert!(cards.iter().any(|card| card.specialist == "moirai"));
    assert!(cards.iter().any(|card| card.specialist == "janus"));
    assert!(cards.iter().any(|card| card.specialist == "agora"));
    let encoded = serde_json::to_string(&cards).expect("cards json");
    assert!(encoded.contains("gnosis://notebook/session-lineage"));
    assert!(!encoded.contains("PROTECTED_ALETHEIA_BODY_DO_NOT_EXPORT"));
}

#[test]
fn aletheia_lineage_rejects_invalid_specialists_missing_refs_and_legacy_write_only_path() {
    let root = temp_root("lineage-rejects");
    let present = root.join("Idea/Empty/Present");
    let inbox = InboxStore::new(&present).expect("canonical present inbox opens");

    let mut invalid = full_lineage();
    invalid.stages[0].specialist = "archon".to_owned();
    let invalid_error = inbox
        .append(lineage_entry("session-invalid", invalid))
        .expect_err("invalid specialist should be rejected");
    assert!(invalid_error.contains("unknown Aletheia specialist"));

    let mut missing_refs = full_lineage();
    missing_refs.stages[1].tool_refs.clear();
    let missing_error = inbox
        .append(lineage_entry("session-missing", missing_refs))
        .expect_err("claimed specialist stage without tool refs should be rejected");
    assert!(missing_error.contains("tool_refs"));

    let legacy = InboxStore::new(root.join("Pratibimba/Epii/inbox"))
        .expect("legacy path can still be opened for read compatibility");
    let legacy_error = legacy
        .append(lineage_entry("session-legacy", full_lineage()))
        .expect_err("legacy flat write-only path should be rejected");
    assert!(legacy_error.contains("canonical Idea/Empty/Present"));
}

fn lineage_entry(session_id: &str, lineage: DisclosureLineage) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".to_owned(),
        source: "aletheia".to_owned(),
        session_id: session_id.to_owned(),
        day_id: "02-06-2026".to_owned(),
        final_vak: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4".to_owned()],
            cp: "4.4".to_owned(),
            cf: "(4.5/0)".to_owned(),
            cfp: "P4/P5".to_owned(),
            cs: CsField {
                code: "CS-disclosure".to_owned(),
                direction: CsDirection::Day,
            },
        },
        improvement_vectors: vec![
            "Epii spine mechanism refinement from differentiated Aletheia disclosure".to_owned(),
        ],
        moirai_summary: BTreeMap::from([(
            "klotho".to_owned(),
            "Aletheia disclosed a reviewable lineage seam".to_owned(),
        )]),
        artifacts: vec!["vault://Pratibimba/Epii/lineage-safe-handle.md".to_owned()],
        closure_kind: "rehear".to_owned(),
        disclosure_lineage: Some(lineage),
    }
}

fn full_lineage() -> DisclosureLineage {
    DisclosureLineage {
        lineage_id: "lineage://aletheia/session-lineage".to_owned(),
        source_subagent: "anansi".to_owned(),
        moirai_mode: Some(MoiraiMode::Klotho),
        tool_refs: vec!["aletheia_gnosis_query".to_owned()],
        skill_refs: vec!["repl.md".to_owned(), "gnosis-retrieve.md".to_owned()],
        gate_refs: vec!["anima-dispatch://lineage/session-lineage".to_owned()],
        namespace_refs: vec![
            "bimba://M5/Epii".to_owned(),
            "gnosis://notebook/session-lineage".to_owned(),
            "graphiti://episode/handle-only-lineage".to_owned(),
        ],
        privacy_class: "requires_review".to_owned(),
        readiness: "ready_with_human_gate".to_owned(),
        day_id: "02-06-2026".to_owned(),
        now_path: Some("Idea/Empty/Present/02-06-2026/session-lineage/now.md".to_owned()),
        session_id: "session-lineage".to_owned(),
        parent_session_refs: vec!["session-parent-safe-handle".to_owned()],
        child_session_refs: vec!["session-child-safe-handle".to_owned()],
        evidence_handles: vec!["evidence://aletheia/lineage-safe".to_owned()],
        stages: vec![
            DisclosureLineageStage {
                specialist: "anansi".to_owned(),
                stage: "orientation".to_owned(),
                tool_refs: vec!["aletheia_gnosis_query".to_owned()],
                skill_refs: vec!["repl.md".to_owned()],
                evidence_handles: vec!["evidence://anansi/orientation".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "moirai".to_owned(),
                stage: "klotho_assert".to_owned(),
                tool_refs: vec!["aletheia_crystallise".to_owned()],
                skill_refs: vec!["thought-distil.md".to_owned()],
                evidence_handles: vec!["evidence://moirai/klotho".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "janus".to_owned(),
                stage: "temporal_integration".to_owned(),
                tool_refs: vec!["aletheia_thought_route".to_owned()],
                skill_refs: vec!["temporal-context.md".to_owned()],
                evidence_handles: vec!["evidence://janus/temporal".to_owned()],
            },
            DisclosureLineageStage {
                specialist: "agora".to_owned(),
                stage: "consensus_aggregation".to_owned(),
                tool_refs: vec!["aletheia_gnosis_query".to_owned()],
                skill_refs: vec!["parallel-synthesis.md".to_owned()],
                evidence_handles: vec!["evidence://agora/consensus".to_owned()],
            },
        ],
    }
}

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s5-aletheia-lineage-{name}-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
