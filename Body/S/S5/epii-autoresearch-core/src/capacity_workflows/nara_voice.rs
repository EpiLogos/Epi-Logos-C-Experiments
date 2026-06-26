//! Nara Anima-primary dialogic-voice governance — consent admission, canonical
//! artifact write, candidate surfacing, and the five Anima gate records.

use serde::{Deserialize, Serialize};
use serde_json::json;

use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ReviewPriority, ReviewProposedAction,
    ReviewSource, ReviewStageRecord, ReviewStore, ReviewSubmission,
};

use crate::adapters::{NaraDialogicVoiceSignalReport, NonAletheiaPipelineReport};
use crate::{ImprovementStore, ReviewCategory};

use super::sanitize_id_component;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NaraGateKind {
    Admission,
    RefreshTrigger,
    Deployment,
    Rollback,
    DpoTrigger,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraExchangeRecord {
    pub exchange_handle: String,
    pub consent_handle: Option<String>,
    pub consented: bool,
    pub pressure_free: bool,
    pub inspectable: bool,
    pub revoked: bool,
    pub pii_stripped_body: String,
    #[serde(skip_serializing)]
    pub raw_body: Option<String>,
    pub sample_count: usize,
    pub quality_score: f64,
    pub quality_threshold: f64,
    pub drift_kind: Option<String>,
    pub new_register: Option<String>,
    pub systematic_feedback_count: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraVoiceGovernanceRequest {
    pub canonical_artifact_path: std::path::PathBuf,
    pub adapter_version: String,
    pub parser_model_path: String,
    pub dialogue_adapter_path: String,
    pub rollback_handle: String,
    pub dpo_preference_pairs: usize,
    pub exchanges: Vec<NaraExchangeRecord>,
    pub now_ms: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraAdmittedExchange {
    pub exchange_handle: String,
    pub consent_handle: String,
    pub pii_stripped_body: String,
    pub quality_score: f64,
    pub drift_kind: Option<String>,
    pub new_register: Option<String>,
    pub systematic_feedback_count: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraAnimaGateRecord {
    pub kind: NaraGateKind,
    pub review_item_id: String,
    pub required_actor: String,
    pub evidence_handles: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraVoiceGovernanceReceipt {
    pub admitted_queue: Vec<NaraAdmittedExchange>,
    pub rejected_handles: Vec<String>,
    pub gate_records: Vec<NaraAnimaGateRecord>,
    pub volume_only_rejected: bool,
    pub parser_model_path: String,
    pub dialogue_adapter_path: String,
    pub rollback_handle: String,
    pub candidate_id: Option<String>,
}

pub fn run_nara_anima_voice_governance(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    request: NaraVoiceGovernanceRequest,
) -> Result<NaraVoiceGovernanceReceipt, String> {
    validate_nara_request(&request)?;
    let mut admitted_queue = Vec::new();
    let mut rejected_handles = Vec::new();
    let mut volume_only_rejected = false;

    for exchange in &request.exchanges {
        let consent_handle = match nara_consent_handle(exchange) {
            Ok(handle) => handle,
            Err(_) => {
                rejected_handles.push(exchange.exchange_handle.clone());
                continue;
            }
        };
        if !has_nara_refresh_signal(exchange) {
            volume_only_rejected = true;
            rejected_handles.push(exchange.exchange_handle.clone());
            continue;
        }
        admitted_queue.push(NaraAdmittedExchange {
            exchange_handle: exchange.exchange_handle.clone(),
            consent_handle,
            pii_stripped_body: exchange.pii_stripped_body.clone(),
            quality_score: exchange.quality_score,
            drift_kind: exchange.drift_kind.clone(),
            new_register: exchange.new_register.clone(),
            systematic_feedback_count: exchange.systematic_feedback_count,
        });
    }

    if admitted_queue.is_empty() {
        return Err("no consented PII-stripped Nara exchanges passed Anima admission".to_owned());
    }
    write_nara_canonical_artifact(&request.canonical_artifact_path, &admitted_queue)?;

    let primary = &admitted_queue[0];
    let surfaced = autoresearch.surface_non_aletheia_report(
        NonAletheiaPipelineReport::NaraDialogicVoiceSignal(NaraDialogicVoiceSignalReport {
            report_uri: request
                .canonical_artifact_path
                .to_string_lossy()
                .to_string(),
            consent_handle: primary.consent_handle.clone(),
            sample_count: admitted_queue
                .iter()
                .map(|exchange| {
                    request
                        .exchanges
                        .iter()
                        .find(|input| input.exchange_handle == exchange.exchange_handle)
                        .map(|input| input.sample_count)
                        .unwrap_or(0)
                })
                .sum(),
            quality_score: admitted_queue
                .iter()
                .map(|exchange| exchange.quality_score)
                .fold(f64::INFINITY, f64::min),
            quality_threshold: request
                .exchanges
                .iter()
                .filter(|input| {
                    admitted_queue
                        .iter()
                        .any(|exchange| exchange.exchange_handle == input.exchange_handle)
                })
                .map(|input| input.quality_threshold)
                .fold(0.0, f64::max),
            drift_kind: primary.drift_kind.clone(),
            new_register: primary.new_register.clone(),
            systematic_feedback_count: admitted_queue
                .iter()
                .map(|exchange| exchange.systematic_feedback_count)
                .sum(),
            observed_at_ms: u64::try_from(request.now_ms)
                .map_err(|_| "now_ms does not fit Nara report timestamp range".to_owned())?,
            fingerprint: Some(format!(
                "nara-anima:{}:{}",
                sanitize_id_component(&request.adapter_version),
                admitted_queue.len()
            )),
        }),
    )?;

    let gate_records = submit_nara_anima_gates(review, &request, &admitted_queue)?;

    Ok(NaraVoiceGovernanceReceipt {
        admitted_queue,
        rejected_handles,
        gate_records,
        volume_only_rejected,
        parser_model_path: request.parser_model_path,
        dialogue_adapter_path: request.dialogue_adapter_path,
        rollback_handle: request.rollback_handle,
        candidate_id: surfaced.map(|receipt| receipt.candidate.candidate_id),
    })
}

fn validate_nara_request(request: &NaraVoiceGovernanceRequest) -> Result<(), String> {
    if request.adapter_version.trim().is_empty() {
        return Err("adapter_version is required".to_owned());
    }
    if request.parser_model_path.trim().is_empty() {
        return Err("parser_model_path is required".to_owned());
    }
    if request.dialogue_adapter_path.trim().is_empty() {
        return Err("dialogue_adapter_path is required".to_owned());
    }
    if request.parser_model_path == request.dialogue_adapter_path {
        return Err("parser-as-Pi and dialogue-as-QLoRA paths must remain separate".to_owned());
    }
    if request.rollback_handle.trim().is_empty() {
        return Err("rollback_handle is required".to_owned());
    }
    if request.exchanges.is_empty() {
        return Err("exchanges are required".to_owned());
    }
    Ok(())
}

fn nara_consent_handle(exchange: &NaraExchangeRecord) -> Result<String, String> {
    if exchange.exchange_handle.trim().is_empty() {
        return Err("exchange_handle is required".to_owned());
    }
    if !(exchange.consented && exchange.pressure_free && exchange.inspectable && !exchange.revoked)
    {
        return Err(format!(
            "{} lacks active pressure-free inspectable consent",
            exchange.exchange_handle
        ));
    }
    let handle = exchange
        .consent_handle
        .as_deref()
        .filter(|handle| !handle.trim().is_empty())
        .ok_or_else(|| format!("{} lacks consent_handle", exchange.exchange_handle))?;
    if !exchange.pii_stripped_body.starts_with("PII_STRIPPED:") {
        return Err(format!(
            "{} lacks a PII-stripped review body",
            exchange.exchange_handle
        ));
    }
    Ok(handle.to_owned())
}

fn has_nara_refresh_signal(exchange: &NaraExchangeRecord) -> bool {
    let material_signal = exchange
        .drift_kind
        .as_deref()
        .is_some_and(|value| !value.trim().is_empty())
        || exchange
            .new_register
            .as_deref()
            .is_some_and(|value| !value.trim().is_empty())
        || exchange.systematic_feedback_count > 0;
    material_signal
}

fn write_nara_canonical_artifact(
    path: &std::path::Path,
    admitted: &[NaraAdmittedExchange],
) -> Result<(), String> {
    std::fs::create_dir_all(
        path.parent()
            .ok_or_else(|| "canonical_artifact_path has no parent".to_owned())?,
    )
    .map_err(|err| format!("{}: {err}", path.display()))?;
    let mut body = String::new();
    for exchange in admitted {
        body.push_str(
            &serde_json::to_string(exchange)
                .map_err(|err| format!("serialize Nara admitted exchange: {err}"))?,
        );
        body.push('\n');
    }
    std::fs::write(path, body).map_err(|err| format!("{}: {err}", path.display()))
}

fn submit_nara_anima_gates(
    review: &ReviewStore,
    request: &NaraVoiceGovernanceRequest,
    admitted: &[NaraAdmittedExchange],
) -> Result<Vec<NaraAnimaGateRecord>, String> {
    [
        NaraGateKind::Admission,
        NaraGateKind::RefreshTrigger,
        NaraGateKind::Deployment,
        NaraGateKind::Rollback,
        NaraGateKind::DpoTrigger,
    ]
    .into_iter()
    .map(|kind| submit_nara_anima_gate(review, request, admitted, kind))
    .collect()
}

fn submit_nara_anima_gate(
    review: &ReviewStore,
    request: &NaraVoiceGovernanceRequest,
    admitted: &[NaraAdmittedExchange],
    kind: NaraGateKind,
) -> Result<NaraAnimaGateRecord, String> {
    let evidence_handles = nara_gate_evidence_handles(request, admitted, kind);
    let item = review.submit(ReviewSubmission {
        source: ReviewSource::Anima,
        title: format!("Nara Anima gate: {kind:?}"),
        body: format!(
            "Anima-primary Nara {kind:?} gate over {} PII-stripped exchange handle(s).",
            admitted.len()
        ),
        priority: ReviewPriority::Blocking,
        coordinate_context: json!({
            "capacity_id": "nara",
            "target_subsystem": "Nara",
            "nara_gate": format!("{kind:?}"),
            "adapter_version": request.adapter_version,
            "artifact_path": request.canonical_artifact_path.to_string_lossy(),
            "parser_model_path": request.parser_model_path,
            "dialogue_adapter_path": request.dialogue_adapter_path,
            "rollback_handle": request.rollback_handle,
            "protected_bodies_included": false,
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "nara_anima_primary_gate".to_owned(),
            target: Some(json!({
                "gate": format!("{kind:?}"),
                "exchange_handles": admitted.iter().map(|exchange| exchange.exchange_handle.as_str()).collect::<Vec<_>>(),
            })),
            destination: Some("nara:adapter".to_owned()),
            payload: Some(json!({
                "pii_stripped_only": true,
                "raw_body_included": false,
                "parser_as_pi_inference": request.parser_model_path,
                "dialogue_as_qlora_adapter": request.dialogue_adapter_path,
            })),
        }),
        requires_human: true,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category: ReviewCategory::NaraAnimaPrimaryGate,
            gate_kind: GateKind::AnimaPrimary,
            governance_level: GovernanceLevel::HumanRequired,
            required_actors: vec!["human".to_owned(), "anima".to_owned()],
            candidate_id: None,
            orchestration_id: None,
            source_artifact_refs: evidence_handles.clone(),
            target_subsystem: Some("Nara".to_owned()),
            vector_kind: Some(nara_gate_vector_kind(kind).to_owned()),
            promotion_destination: Some("nara:adapter".to_owned()),
            source_actor_detail: Some("anima-primary-nara-voice-governance".to_owned()),
            stage_records: vec![ReviewStageRecord {
                stage: format!("{kind:?}"),
                actor: "anima".to_owned(),
                at_ms: request.now_ms,
                note: "Nara gate records handle-only, PII-stripped evidence; raw protected bodies excluded."
                    .to_owned(),
            }],
        }),
    })?;
    Ok(NaraAnimaGateRecord {
        kind,
        review_item_id: item.item_id,
        required_actor: "anima".to_owned(),
        evidence_handles,
    })
}

fn nara_gate_evidence_handles(
    request: &NaraVoiceGovernanceRequest,
    admitted: &[NaraAdmittedExchange],
    kind: NaraGateKind,
) -> Vec<String> {
    let mut handles = vec![request
        .canonical_artifact_path
        .to_string_lossy()
        .to_string()];
    handles.extend(
        admitted
            .iter()
            .map(|exchange| exchange.exchange_handle.clone()),
    );
    match kind {
        NaraGateKind::Rollback => handles.push(request.rollback_handle.clone()),
        NaraGateKind::DpoTrigger => handles.push(format!(
            "nara://dpo/preference-pairs/{}",
            request.dpo_preference_pairs
        )),
        NaraGateKind::Deployment => handles.push(request.dialogue_adapter_path.clone()),
        NaraGateKind::Admission | NaraGateKind::RefreshTrigger => {}
    }
    handles
}

fn nara_gate_vector_kind(kind: NaraGateKind) -> &'static str {
    match kind {
        NaraGateKind::Admission => "NaraDialogueCorpusAddition",
        NaraGateKind::RefreshTrigger => "NaraVoiceDriftCorrection",
        NaraGateKind::Deployment => "NaraDialogueAdapterDeployment",
        NaraGateKind::Rollback => "NaraDialogueAdapterRollback",
        NaraGateKind::DpoTrigger => "NaraDPORefinement",
    }
}
