//! Epii-on-Epii recursive governance — the recursive review protocol records,
//! the human-final recursive-spine slice, and recursive gate-weakening validation.

use serde::{Deserialize, Serialize};
use serde_json::json;

use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewDecision,
    ReviewInboxFilter, ReviewInboxItem, ReviewPriority, ReviewProposedAction, ReviewSource,
    ReviewStageRecord, ReviewStore, ReviewSubmission,
};

use crate::{
    CreateOrchestrationRequest, ImprovementStore, OrchestrationRecord, OrchestrationState,
    RetryPolicy, ReviewCategory, ReviewStage, SurfacedCandidateReceipt, TargetSubsystem,
    TransitionOrchestrationRequest,
};

use super::{is_recursive_spine_item, stable_uri_suffix};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RecursiveReviewProtocolKind {
    SophiaOnSophia,
    AnimaOnAnima,
    PiOnPi,
    AletheiaOnAletheia,
    SpineOnSpine,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecursiveReviewProtocolRecord {
    pub kind: RecursiveReviewProtocolKind,
    pub target_actor: String,
    pub self_review_marked: bool,
    pub pi_structured_evidence_ref: String,
    pub anima_tone_check_ref: String,
    pub user_final_gate_ref: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EpiiRecursiveGovernanceReceipt {
    pub surfaced: SurfacedCandidateReceipt,
    pub review_item: ReviewInboxItem,
    pub orchestration: OrchestrationRecord,
    pub protocols: Vec<RecursiveReviewProtocolRecord>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecursiveGateWeakeningRequest {
    pub target_review_item_id: String,
    pub proposed_by: String,
    pub human_meta_review_item_id: Option<String>,
    pub rationale: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecursiveGateWeakeningReceipt {
    pub allowed: bool,
    pub target_review_item_id: String,
    pub meta_review_item_id: String,
    pub proposed_by: String,
}

pub fn run_epii_recursive_governance_slice(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    surfaced: SurfacedCandidateReceipt,
    now_ms: u128,
) -> Result<EpiiRecursiveGovernanceReceipt, String> {
    if surfaced.candidate.candidate.target_subsystem != TargetSubsystem::Epii {
        return Err("recursive governance requires an Epii-targeted candidate".to_owned());
    }
    let route = surfaced
        .routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Epii)
        .cloned()
        .ok_or_else(|| "Epii route missing from recursive governance slice".to_owned())?;
    let protocols = recursive_protocol_records(&surfaced);
    let source_uri = surfaced
        .candidate
        .candidate
        .observation_evidence
        .source_uri
        .clone();
    let review_item = review.submit(ReviewSubmission {
        source: ReviewSource::Autoresearch,
        title: "Epii-on-Epii recursive spine governance".to_owned(),
        body: format!(
            "Pi prepared structured evidence for {} recursive protocol(s); target agents self-review, Anima checks rigorous-not-defensive tone, and human final validation is required before spine or criterion changes.",
            protocols.len()
        ),
        priority: ReviewPriority::Blocking,
        coordinate_context: json!({
            "capacity_id": "epii_on_epii",
            "candidate_id": surfaced.candidate.candidate_id,
            "run_id": surfaced.run.run_id,
            "route_id": route.route_id,
            "target_subsystem": "Epii",
            "recursive_protocols": protocols.iter().map(|protocol| format!("{:?}", protocol.kind)).collect::<Vec<_>>(),
            "protected_bodies_included": false,
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "epii_recursive_spine_governance".to_owned(),
            target: Some(json!({
                "target_subsystem": "Epii",
                "self_review_required": true,
                "protocol_count": protocols.len(),
            })),
            destination: Some("epii:spine".to_owned()),
            payload: Some(json!({
                "dry_run_only": true,
                "requires_user_final_validation": true,
                "agent_terminal_resolution_allowed": false,
                "protocols": protocols,
            })),
        }),
        requires_human: true,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category: ReviewCategory::RecursiveSelfModification,
            gate_kind: GateKind::RecursiveSelfModification,
            governance_level: GovernanceLevel::RecursiveLoadBearing,
            required_actors: vec![
                "human".to_owned(),
                "pi".to_owned(),
                "sophia".to_owned(),
                "anima".to_owned(),
                "aletheia".to_owned(),
                "epii".to_owned(),
            ],
            candidate_id: Some(surfaced.candidate.candidate_id.clone()),
            orchestration_id: None,
            source_artifact_refs: vec![
                source_uri.clone(),
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md#6".to_owned(),
                "Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md#9.2".to_owned(),
            ],
            target_subsystem: Some("Epii".to_owned()),
            vector_kind: Some(format!("{:?}", surfaced.candidate.candidate.vector_kind)),
            promotion_destination: Some("epii:spine".to_owned()),
            source_actor_detail: Some("epii-on-epii-recursive-governance".to_owned()),
            stage_records: vec![
                ReviewStageRecord {
                    stage: "pi_structured_evidence".to_owned(),
                    actor: "pi".to_owned(),
                    at_ms: now_ms,
                    note: "Pi prepares structured evidence for recursive review; no approval authority."
                        .to_owned(),
                },
                ReviewStageRecord {
                    stage: "target_self_review".to_owned(),
                    actor: "epii".to_owned(),
                    at_ms: now_ms.saturating_add(1),
                    note: "Target agent marks the review as self-review rather than external validation."
                        .to_owned(),
                },
                ReviewStageRecord {
                    stage: "anima_tone_check".to_owned(),
                    actor: "anima".to_owned(),
                    at_ms: now_ms.saturating_add(2),
                    note: "Anima checks for rigorous, non-defensive, non-self-aggrandising tone."
                        .to_owned(),
                },
                ReviewStageRecord {
                    stage: "human_final_validation_required".to_owned(),
                    actor: "human".to_owned(),
                    at_ms: now_ms.saturating_add(3),
                    note: "Human final validation is required before dry-run promotion planning."
                        .to_owned(),
                },
            ],
        }),
    })?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(172_800_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;
    autoresearch.transition_orchestration(TransitionOrchestrationRequest {
        orchestration_id: orchestration.orchestration_id.clone(),
        next_state: OrchestrationState::InReview,
        reason: "Epii-on-Epii recursive governance submitted for human-final review".to_owned(),
        now_ms: now_ms.saturating_add(4),
        review_stage: Some(ReviewStage::HumanReview),
        discard_reason: None,
        promotion_plan_id: None,
    })?;

    Ok(EpiiRecursiveGovernanceReceipt {
        surfaced,
        review_item,
        orchestration,
        protocols,
    })
}

pub fn validate_recursive_gate_weakening(
    review: &ReviewStore,
    request: RecursiveGateWeakeningRequest,
) -> Result<RecursiveGateWeakeningReceipt, String> {
    if request.target_review_item_id.trim().is_empty() {
        return Err("target_review_item_id is required".to_owned());
    }
    if request.proposed_by.trim().is_empty() {
        return Err("proposed_by is required".to_owned());
    }
    if request.rationale.trim().is_empty() {
        return Err("rationale is required".to_owned());
    }
    let meta_review_item_id = request
        .human_meta_review_item_id
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| {
            "recursive user-final gate weakening requires a human-approved recursive meta-review"
                .to_owned()
        })?;
    let target_is_recursive = review
        .inbox(ReviewInboxFilter::default())?
        .items
        .iter()
        .chain(review.history(None)?.items.iter())
        .any(|item| item.item_id == request.target_review_item_id && is_recursive_spine_item(item));
    if !target_is_recursive {
        return Err(format!(
            "target review item {} is not a recursive spine gate",
            request.target_review_item_id
        ));
    }

    let history = review.history(None)?;
    let resolution = history
        .resolutions
        .iter()
        .find(|resolution| resolution.item_id == meta_review_item_id)
        .ok_or_else(|| {
            "recursive user-final gate weakening requires a human-approved recursive meta-review"
                .to_owned()
        })?;
    if resolution.decision != ReviewDecision::Approve
        || resolution.resolved_by != ResolutionActor::Human
    {
        return Err(
            "recursive gate meta-review must be approved by a human before weakening is allowed"
                .to_owned(),
        );
    }
    let meta_item = history
        .items
        .iter()
        .find(|item| item.item_id == meta_review_item_id)
        .ok_or_else(|| "human meta-review item is missing from review history".to_owned())?;
    if !is_recursive_spine_item(meta_item) {
        return Err("human meta-review must itself use recursive governance".to_owned());
    }

    Ok(RecursiveGateWeakeningReceipt {
        allowed: true,
        target_review_item_id: request.target_review_item_id,
        meta_review_item_id: meta_review_item_id.to_owned(),
        proposed_by: request.proposed_by,
    })
}

fn recursive_protocol_records(
    surfaced: &SurfacedCandidateReceipt,
) -> Vec<RecursiveReviewProtocolRecord> {
    let suffix = stable_uri_suffix(&surfaced.candidate.candidate_id);
    [
        (RecursiveReviewProtocolKind::SophiaOnSophia, "sophia"),
        (RecursiveReviewProtocolKind::AnimaOnAnima, "anima"),
        (RecursiveReviewProtocolKind::PiOnPi, "pi"),
        (RecursiveReviewProtocolKind::AletheiaOnAletheia, "aletheia"),
        (RecursiveReviewProtocolKind::SpineOnSpine, "epii-spine"),
    ]
    .into_iter()
    .map(|(kind, target_actor)| RecursiveReviewProtocolRecord {
        kind,
        target_actor: target_actor.to_owned(),
        self_review_marked: true,
        pi_structured_evidence_ref: format!("s5://epii/pi-evidence/{suffix}/{target_actor}"),
        anima_tone_check_ref: format!("s5://epii/anima-tone/{suffix}/{target_actor}"),
        user_final_gate_ref: format!("s5://epii/user-final/{suffix}/{target_actor}"),
    })
    .collect()
}
