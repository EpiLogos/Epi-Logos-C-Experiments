//! Coordinate: S5/M5-4' (governed Tier-2 tunability lifecycle).
//! Residency: Body/S/S5/epii-autoresearch-core.
//! Position (#n): policy authority between the typed tunable registry and the S5 review spine.
//! Actualises: Class A review routing, Class B triplet-gated auto-apply eligibility, and runaway guards.
//! Public surface: `submit_tuning_proposal`, `TuningProposalRequest`, `TuningProposalReceipt`.
//! Does NOT own: registry parsing, config persistence, audit storage, or Tier-3 Aletheia dispatch.
//! Contract: [[S5-SPEC]] / [[M5'-SPEC]] / [[DR-TUNE-1]].

use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ReviewInboxFilter, ReviewInboxItem,
    ReviewPriority, ReviewProposedAction, ReviewSource, ReviewStageRecord, ReviewStatus,
    ReviewStore, ReviewSubmission,
};
use portal_core::tunable::{TripletVerdict, TunableMetadata, TunableValue, TuningRiskClass};
use serde::{Deserialize, Serialize};
use serde_json::json;

const MAX_OPEN_PROPOSALS_PER_KNOB: usize = 3;
const MAX_OPEN_PROPOSALS_PER_WINDOW: usize = 12;
const MAX_RECENT_APPLICATIONS_PER_KNOB: usize = 3;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TuningProposalRequest {
    pub metadata: TunableMetadata,
    pub from_value: TunableValue,
    pub to_value: TunableValue,
    pub proposing_evidence: Vec<String>,
    pub tier: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub triplet_verdict: Option<TripletVerdict>,
    /// Number of successful Tier-2 applications for this knob in the active
    /// policy window, supplied from the append-only tunable audit.
    #[serde(default)]
    pub recent_application_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "kind")]
pub enum TuningProposalDisposition {
    HumanReview { item: ReviewInboxItem },
    AutoApply,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TuningProposalReceipt {
    pub knob_key: String,
    pub risk_class: TuningRiskClass,
    pub tier: u8,
    pub disposition: TuningProposalDisposition,
}

pub fn submit_tuning_proposal(
    review: &ReviewStore,
    request: TuningProposalRequest,
) -> Result<TuningProposalReceipt, String> {
    validate_request(&request)?;
    let open_proposals = open_tuning_proposals(review)?;
    if open_proposals.len() >= MAX_OPEN_PROPOSALS_PER_WINDOW {
        return Err(format!(
            "open tuning proposal window ceiling reached ({MAX_OPEN_PROPOSALS_PER_WINDOW})"
        ));
    }
    let key_open_count = open_proposals
        .iter()
        .filter(|item| tuning_proposal_key(item).as_deref() == Some(request.metadata.key.as_str()))
        .count();
    if key_open_count >= MAX_OPEN_PROPOSALS_PER_KNOB {
        return Err(format!(
            "open proposal ceiling reached for {} ({MAX_OPEN_PROPOSALS_PER_KNOB})",
            request.metadata.key
        ));
    }
    if request.recent_application_count >= MAX_RECENT_APPLICATIONS_PER_KNOB {
        return Err(format!(
            "recent application ceiling reached for {} ({MAX_RECENT_APPLICATIONS_PER_KNOB})",
            request.metadata.key
        ));
    }

    let risk_class = request.metadata.tuning_risk_class;
    let disposition = match risk_class {
        TuningRiskClass::A => TuningProposalDisposition::HumanReview {
            item: review.submit(review_submission(&request))?,
        },
        TuningRiskClass::B => TuningProposalDisposition::AutoApply,
        TuningRiskClass::C => {
            return Err(
                "Class C proposals are owned by the Tier-3 Aletheia lifecycle and cannot enter the Tier-2 gateway"
                    .to_owned(),
            )
        }
    };

    Ok(TuningProposalReceipt {
        knob_key: request.metadata.key,
        risk_class,
        tier: request.tier,
        disposition,
    })
}

fn validate_request(request: &TuningProposalRequest) -> Result<(), String> {
    if request.tier != 2 {
        return Err("Tier-2 tuning proposals must declare tier 2".to_owned());
    }
    if request.metadata.structural_invariant {
        return Err(format!(
            "{} is a structural invariant and cannot be proposed for tuning",
            request.metadata.key
        ));
    }
    if request.from_value == request.to_value {
        return Err("tuning proposal must change the current value".to_owned());
    }
    if request.proposing_evidence.is_empty()
        || request
            .proposing_evidence
            .iter()
            .any(|evidence| evidence.trim().is_empty())
    {
        return Err("tuning proposal requires non-empty proposing evidence".to_owned());
    }
    if request.metadata.tuning_risk_class == TuningRiskClass::B
        && !complete_triplet(request.triplet_verdict.as_ref())
    {
        return Err(
            "Class B tuning proposals require a complete constitutional triplet verdict".to_owned(),
        );
    }
    Ok(())
}

fn complete_triplet(verdict: Option<&TripletVerdict>) -> bool {
    verdict.is_some_and(|verdict| {
        !verdict.narratrix_articulation.trim().is_empty()
            && verdict.ebm_energy_delta.is_finite()
            && !verdict.verifier_questions.is_empty()
            && verdict
                .verifier_questions
                .iter()
                .all(|question| !question.trim().is_empty())
    })
}

fn open_tuning_proposals(review: &ReviewStore) -> Result<Vec<ReviewInboxItem>, String> {
    Ok(review
        .inbox(ReviewInboxFilter::default())?
        .items
        .into_iter()
        .filter(|item| {
            item.status == ReviewStatus::Open
                && item
                    .proposed_action
                    .as_ref()
                    .is_some_and(|action| action.kind == "tuning_proposal")
        })
        .collect())
}

fn tuning_proposal_key(item: &ReviewInboxItem) -> Option<String> {
    item.proposed_action
        .as_ref()?
        .target
        .as_ref()?
        .get("knob_key")?
        .as_str()
        .map(str::to_owned)
}

fn review_submission(request: &TuningProposalRequest) -> ReviewSubmission {
    let source_refs = request.proposing_evidence.clone();
    ReviewSubmission {
        source: ReviewSource::Autoresearch,
        title: format!("Tier-2 Class A tuning proposal: {}", request.metadata.key),
        body: format!(
            "Anamnesis proposes a bounded change to {} from the current registry value; human approval is required before any configuration mutation.",
            request.metadata.key
        ),
        priority: ReviewPriority::Blocking,
        coordinate_context: json!({
            "capacity_id": "tuning_review",
            "knob_key": request.metadata.key,
            "tier": request.tier,
            "risk_class": request.metadata.tuning_risk_class.as_str(),
            "proposing_evidence": request.proposing_evidence,
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "tuning_proposal".to_owned(),
            target: Some(json!({
                "knob_key": request.metadata.key,
                "owning_subsystem": request.metadata.owning_subsystem,
            })),
            destination: Some("m5-prime://tuning/governed-lifecycle".to_owned()),
            payload: Some(json!({
                "from_value": request.from_value,
                "to_value": request.to_value,
                "triplet_verdict": request.triplet_verdict,
                "authoritative_doc": request.metadata.authoritative_doc,
            })),
        }),
        requires_human: true,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category: epi_s5_epii_review_core::ReviewCategory::UserFinalValidation,
            gate_kind: GateKind::HumanFinal,
            governance_level: GovernanceLevel::HumanRequired,
            required_actors: vec!["sophia".to_owned(), "epii".to_owned(), "anima".to_owned()],
            candidate_id: None,
            orchestration_id: None,
            source_artifact_refs: source_refs,
            target_subsystem: Some(request.metadata.owning_subsystem.clone()),
            vector_kind: Some("tuning_review".to_owned()),
            promotion_destination: Some("m5-prime://tuning/governed-lifecycle".to_owned()),
            source_actor_detail: Some("anamnesis-proposer".to_owned()),
            stage_records: vec![ReviewStageRecord {
                stage: "submitted".to_owned(),
                actor: "anamnesis-proposer".to_owned(),
                at_ms: now_ms(),
                note: "Class A tuning proposal routed to the human review gate.".to_owned(),
            }],
        }),
    }
}

fn now_ms() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
