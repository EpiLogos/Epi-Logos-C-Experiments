//! Aletheia expert-lineage disclosure — handle-only review submission and the
//! Pratibimba control-room lineage cards derived from disclosure governance.

use serde::{Deserialize, Serialize};
use serde_json::json;

use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ReviewInboxFilter, ReviewInboxItem,
    ReviewPriority, ReviewProposedAction, ReviewSource, ReviewStageRecord, ReviewStore,
    ReviewSubmission,
};

use crate::{AletheiaLineageSurfaceReceipt, ReviewCategory};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AletheiaExpertLineageCard {
    pub review_item_id: String,
    pub lineage_id: String,
    pub specialist: String,
    pub stage: String,
    pub moirai_mode: Option<String>,
    pub tool_refs: Vec<String>,
    pub skill_refs: Vec<String>,
    pub namespace_refs: Vec<String>,
    pub evidence_handles: Vec<String>,
    pub privacy_class: String,
    pub readiness: String,
}

pub fn submit_aletheia_lineage_review(
    review: &ReviewStore,
    receipt: &AletheiaLineageSurfaceReceipt,
    now_ms: u128,
) -> Result<ReviewInboxItem, String> {
    crate::inbox::validate_disclosure_lineage(&receipt.lineage)?;
    let stage_records = receipt
        .lineage
        .stages
        .iter()
        .enumerate()
        .map(|(index, stage)| ReviewStageRecord {
            stage: stage.stage.clone(),
            actor: stage.specialist.clone(),
            at_ms: now_ms.saturating_add(index as u128),
            note: format!(
                "{} stage recorded with {} tool ref(s), {} skill ref(s), and handle-only evidence.",
                stage.specialist,
                stage.tool_refs.len(),
                stage.skill_refs.len()
            ),
        })
        .collect::<Vec<_>>();
    let mut source_artifact_refs = vec![receipt.safe_source_uri.clone()];
    source_artifact_refs.extend(receipt.lineage.evidence_handles.clone());
    source_artifact_refs.extend(receipt.lineage.namespace_refs.clone());
    source_artifact_refs.extend(
        receipt
            .lineage
            .stages
            .iter()
            .flat_map(|stage| stage.evidence_handles.iter().cloned()),
    );
    source_artifact_refs.sort();
    source_artifact_refs.dedup();

    review.submit(ReviewSubmission {
        source: ReviewSource::Aletheia,
        title: "Aletheia expert-lineage disclosure".to_owned(),
        body: format!(
            "Aletheia lineage {} from {} deposited handle-only disclosure metadata for S5 review.",
            receipt.lineage.lineage_id, receipt.lineage.source_subagent
        ),
        priority: ReviewPriority::Blocking,
        coordinate_context: json!({
            "candidate_id": receipt.surfaced.candidate.candidate_id,
            "run_id": receipt.surfaced.run.run_id,
            "originating_inbox_entry": receipt.surfaced.candidate.candidate.linkage.originating_inbox_entry,
            "safe_source_uri": receipt.safe_source_uri,
            "disclosure_lineage": receipt.lineage,
            "protected_bodies_included": false,
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "aletheia_expert_lineage_disclosure".to_owned(),
            target: Some(json!({
                "lineage_id": receipt.lineage.lineage_id,
                "source_subagent": receipt.lineage.source_subagent,
                "stages": receipt.lineage.stages,
            })),
            destination: Some("epii:spine".to_owned()),
            payload: Some(json!({
                "handle_only": true,
                "review_source_preserved": "aletheia",
                "specialists_have_review_resolution_authority": false,
            })),
        }),
        requires_human: true,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category: ReviewCategory::AletheiaCrystallisation,
            gate_kind: GateKind::HumanFinal,
            governance_level: GovernanceLevel::HumanRequired,
            required_actors: vec![
                "human".to_owned(),
                "aletheia".to_owned(),
                receipt.lineage.source_subagent.clone(),
            ],
            candidate_id: Some(receipt.surfaced.candidate.candidate_id.clone()),
            orchestration_id: None,
            source_artifact_refs,
            target_subsystem: Some("Epii".to_owned()),
            vector_kind: Some(format!(
                "{:?}",
                receipt.surfaced.candidate.candidate.vector_kind
            )),
            promotion_destination: Some("epii:spine".to_owned()),
            source_actor_detail: Some(format!(
                "aletheia:{}:{}",
                receipt.lineage.source_subagent, receipt.lineage.lineage_id
            )),
            stage_records,
        }),
    })
}

pub fn build_aletheia_control_room_lineage_cards(
    review: &ReviewStore,
) -> Result<Vec<AletheiaExpertLineageCard>, String> {
    let inbox = review.inbox(ReviewInboxFilter::default())?;
    let history = review.history(None)?;
    let mut cards = Vec::new();
    for item in inbox.items.iter().chain(history.items.iter()) {
        let Some(profile) = item.governance_profile.as_ref() else {
            continue;
        };
        if profile.category != ReviewCategory::AletheiaCrystallisation {
            continue;
        }
        let Some(lineage_value) = item.coordinate_context.get("disclosure_lineage") else {
            continue;
        };
        let lineage: crate::inbox::DisclosureLineage =
            serde_json::from_value(lineage_value.clone()).map_err(|err| {
                format!(
                    "review {} has invalid disclosure_lineage: {err}",
                    item.item_id
                )
            })?;
        crate::inbox::validate_disclosure_lineage(&lineage)?;
        for stage in &lineage.stages {
            cards.push(AletheiaExpertLineageCard {
                review_item_id: item.item_id.clone(),
                lineage_id: lineage.lineage_id.clone(),
                specialist: stage.specialist.clone(),
                stage: stage.stage.clone(),
                moirai_mode: lineage.moirai_mode.map(|mode| format!("{mode:?}")),
                tool_refs: stage.tool_refs.clone(),
                skill_refs: stage.skill_refs.clone(),
                namespace_refs: lineage.namespace_refs.clone(),
                evidence_handles: stage.evidence_handles.clone(),
                privacy_class: lineage.privacy_class.clone(),
                readiness: lineage.readiness.clone(),
            });
        }
    }
    cards.sort_by(|left, right| {
        left.review_item_id
            .cmp(&right.review_item_id)
            .then_with(|| left.specialist.cmp(&right.specialist))
            .then_with(|| left.stage.cmp(&right.stage))
    });
    Ok(cards)
}
