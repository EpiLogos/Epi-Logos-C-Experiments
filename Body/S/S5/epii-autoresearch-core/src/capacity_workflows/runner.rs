//! Deterministic capacity-slice runner — routing, snapshot assembly, and the
//! per-subsystem deterministic slices (Anuttara / Parashakti / Paramasiva /
//! Mahamaya) with their governance classification, agent annotations, and
//! evidence deposits.
//!
//! Restored verbatim from the pre-split `capacity_workflows.rs` (commit
//! `f8dfa5b7^`): the 17.T17.4 split declared `mod runner;` but never landed
//! this file, and the follow-up "fix" dropped the declaration together with
//! the only remaining copy of these implementations.

use std::collections::BTreeMap;

use crate::adapters::{
    AnuttaraShaclFailureReport, MahamayaRuntimeTier, MahamayaRuntimeTrainingReport,
    NonAletheiaPipelineReport, ParamasivaCorpusRefreshReport, ParashaktiEmbeddingDriftReport,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewDecision,
    ReviewInboxFilter, ReviewInboxItem, ReviewPriority, ReviewProposedAction, ReviewResolveRequest,
    ReviewSource, ReviewStageRecord, ReviewStore, ReviewSubmission,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::spine::{CanonicalVakKeys, ObservationEvidence};
use crate::{
    ArtifactRef, ClosureKind, ContentTypeRegister, CreateOrchestrationRequest, EvaluationEvidence,
    EvidenceSourceRef, ImprovementCandidate, ImprovementStore, OrchestrationRecord,
    OrchestrationState, PromoteRequest, PromotionDestination, PromotionHenTimestamp, PromotionPlan,
    ProposeRequest, RetryPolicy, ReviewCategory, ReviewStage, RouteRecord, SensitivityClass,
    SurfaceActor, SurfacedCandidateReceipt, TargetSubsystem, TransitionOrchestrationRequest,
};

use super::registry::capacity_entry;
use super::{
    capacity_workflow_registry, sanitize_id_component, stable_uri_suffix,
    CapacityWorkflowRegistryEntry, CapacityId,
};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CapacityWorkflowReceipt {
    pub entry: CapacityWorkflowRegistryEntry,
    pub surfaced: SurfacedCandidateReceipt,
    pub route: RouteRecord,
    pub review_item: ReviewInboxItem,
    pub orchestration: OrchestrationRecord,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BodyCapacityAlertDto {
    pub capacity_id: CapacityId,
    pub title: String,
    pub priority: ReviewPriority,
    pub target_subsystem: TargetSubsystem,
    pub candidate_id: String,
    pub route_id: String,
    pub review_item_id: String,
    pub orchestration_id: String,
    pub requires_human: bool,
    pub ide_surface_anchor: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PratibimbaControlRoomCapacityDto {
    pub capacity_id: CapacityId,
    pub target_subsystem: TargetSubsystem,
    pub governance_lead: String,
    pub required_agents: Vec<String>,
    pub review_category: ReviewCategory,
    pub gate_kind: GateKind,
    pub orchestration_state: OrchestrationState,
    pub candidate_id: String,
    pub route_id: String,
    pub review_item_id: String,
    pub orchestration_id: String,
    pub promotion_destination_family: String,
    pub ide_surface_anchor: String,
    pub source_spec_anchors: Vec<String>,
    pub source_artifact_refs: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CapacityWorkflowSnapshot {
    pub body_alerts: Vec<BodyCapacityAlertDto>,
    pub control_room_panels: Vec<PratibimbaControlRoomCapacityDto>,
    pub real_candidate_count: usize,
    pub real_review_item_count: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SliceGovernanceClass {
    Routine,
    LoadBearing,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgentAnnotationKind {
    SophiaReview,
    EpiiCoReview,
    AnimaAestheticCheck,
    PiFormalTranslation,
    PiMetricsCheck,
    PiTrainingDispatch,
    PiRollbackImpactCheck,
    AletheiaDisclosureNote,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AgentAnnotation {
    pub kind: AgentAnnotationKind,
    pub actor: String,
    pub note: String,
    pub source_refs: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvidenceDeposit {
    pub deposit_uri: String,
    pub source_uri: String,
    pub summary: String,
    pub mutates_graph_or_canon: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParashaktiScorecard {
    pub report: ParashaktiEmbeddingDriftReport,
    pub load_bearing_lens_change: bool,
    pub affected_coordinates: Vec<String>,
    pub gds_projection_uri: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DeterministicCapacitySliceReceipt {
    pub capacity: TargetSubsystem,
    pub governance_class: SliceGovernanceClass,
    pub surfaced: SurfacedCandidateReceipt,
    pub routes: Vec<RouteRecord>,
    pub review_item: ReviewInboxItem,
    pub orchestration: OrchestrationRecord,
    pub annotations: Vec<AgentAnnotation>,
    pub evidence_deposits: Vec<EvidenceDeposit>,
    pub promotion_plan: Option<PromotionPlan>,
}


pub fn route_capacity_workflow(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    capacity_id: CapacityId,
    now_ms: u128,
) -> Result<CapacityWorkflowReceipt, String> {
    let entry = capacity_entry(capacity_id)?;
    let mut candidate = candidate_for_entry(&entry, now_ms)?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    candidate.vak_keys = Some(CanonicalVakKeys {
        cpf: Some("(00/01)".to_owned()),
        ct: Some("CT4".to_owned()),
        cp: Some("4.5".to_owned()),
        cf: Some("(5/0)".to_owned()),
        cfp: Some("P5/P0".to_owned()),
        cs: Some("CS-mediation".to_owned()),
    });

    let surfaced = autoresearch.surface_candidate(candidate)?;
    let route = surfaced
        .routes
        .iter()
        .find(|route| route.target_subsystem == entry.target_subsystem)
        .cloned()
        .ok_or_else(|| format!("route missing for capacity {:?}", entry.capacity_id))?;

    let review_item = review.submit(review_submission_for_entry(
        &entry, &surfaced, &route, now_ms,
    ))?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(86_400_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;

    Ok(CapacityWorkflowReceipt {
        entry,
        surfaced,
        route,
        review_item,
        orchestration,
    })
}

pub fn build_capacity_workflow_snapshot(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
) -> Result<CapacityWorkflowSnapshot, String> {
    let candidates = autoresearch.candidates()?;
    let routes = autoresearch.routes()?;
    let orchestrations = autoresearch.orchestrations()?;
    let inbox = review.inbox(ReviewInboxFilter::default())?;
    let registry = capacity_workflow_registry()
        .into_iter()
        .map(|entry| (entry.capacity_id, entry))
        .collect::<BTreeMap<_, _>>();

    let candidate_by_id = candidates
        .iter()
        .map(|record| (record.candidate_id.as_str(), record))
        .collect::<BTreeMap<_, _>>();
    let route_by_id = routes
        .iter()
        .map(|record| (record.route_id.as_str(), record))
        .collect::<BTreeMap<_, _>>();
    let orchestration_by_id = orchestrations
        .iter()
        .map(|record| (record.orchestration_id.as_str(), record))
        .collect::<BTreeMap<_, _>>();

    let mut body_alerts = Vec::new();
    let mut control_room_panels = Vec::new();

    for item in inbox.items {
        let Some(capacity_value) = item.coordinate_context.get("capacity_id") else {
            continue;
        };
        let capacity_id = parse_capacity_id(capacity_value)?;
        let entry = registry
            .get(&capacity_id)
            .ok_or_else(|| format!("capacity registry entry missing for {:?}", capacity_id))?;
        let governance = item
            .governance_profile
            .as_ref()
            .ok_or_else(|| format!("capacity review {} lacks governance_profile", item.item_id))?;
        let candidate_id = governance
            .candidate_id
            .as_deref()
            .ok_or_else(|| format!("capacity review {} lacks candidate_id", item.item_id))?;
        let orchestration_id = governance
            .orchestration_id
            .as_deref()
            .ok_or_else(|| format!("capacity review {} lacks orchestration_id", item.item_id))?;
        let route_id = required_context_str(&item.coordinate_context, "route_id")?;

        let candidate = candidate_by_id.get(candidate_id).ok_or_else(|| {
            format!("capacity review references missing candidate {candidate_id}")
        })?;
        let route = route_by_id
            .get(route_id)
            .ok_or_else(|| format!("capacity review references missing route {route_id}"))?;
        let orchestration = orchestration_by_id.get(orchestration_id).ok_or_else(|| {
            format!("capacity review references missing orchestration {orchestration_id}")
        })?;
        if orchestration.review_item_id.as_deref() != Some(item.item_id.as_str()) {
            return Err(format!(
                "capacity review {} is not linked from orchestration {}",
                item.item_id, orchestration_id
            ));
        }
        if candidate.candidate.target_subsystem != entry.target_subsystem {
            return Err(format!(
                "capacity review {} target mismatch for {:?}",
                item.item_id, entry.capacity_id
            ));
        }
        if route.candidate_id != candidate_id {
            return Err(format!(
                "capacity review {} route {} does not point at candidate {}",
                item.item_id, route_id, candidate_id
            ));
        }
        reject_placeholder(&item.title, "review title")?;
        reject_placeholder(
            &entry.promotion_destination_family,
            "promotion destination family",
        )?;
        if governance.source_artifact_refs.is_empty() {
            return Err(format!(
                "capacity review {} has no source anchors",
                item.item_id
            ));
        }

        body_alerts.push(BodyCapacityAlertDto {
            capacity_id,
            title: item.title.clone(),
            priority: item.priority,
            target_subsystem: entry.target_subsystem,
            candidate_id: candidate_id.to_owned(),
            route_id: route_id.to_owned(),
            review_item_id: item.item_id.clone(),
            orchestration_id: orchestration_id.to_owned(),
            requires_human: item.requires_human,
            ide_surface_anchor: entry.ide_surface_anchor.clone(),
        });
        control_room_panels.push(PratibimbaControlRoomCapacityDto {
            capacity_id,
            target_subsystem: entry.target_subsystem,
            governance_lead: entry.governance_lead.clone(),
            required_agents: entry.required_agents.clone(),
            review_category: governance.category,
            gate_kind: governance.gate_kind,
            orchestration_state: orchestration.state,
            candidate_id: candidate_id.to_owned(),
            route_id: route_id.to_owned(),
            review_item_id: item.item_id,
            orchestration_id: orchestration_id.to_owned(),
            promotion_destination_family: entry.promotion_destination_family.clone(),
            ide_surface_anchor: entry.ide_surface_anchor.clone(),
            source_spec_anchors: entry.source_spec_anchors.clone(),
            source_artifact_refs: governance.source_artifact_refs.clone(),
        });
    }

    body_alerts.sort_by_key(|alert| alert.capacity_id);
    control_room_panels.sort_by_key(|panel| panel.capacity_id);

    Ok(CapacityWorkflowSnapshot {
        real_candidate_count: candidates.len(),
        real_review_item_count: body_alerts.len(),
        body_alerts,
        control_room_panels,
    })
}

pub fn run_anuttara_deterministic_slice(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    report: AnuttaraShaclFailureReport,
    downstream_targets: Vec<TargetSubsystem>,
    vault_root: impl Into<std::path::PathBuf>,
    compiler_root: impl Into<std::path::PathBuf>,
    now_ms: u128,
) -> Result<DeterministicCapacitySliceReceipt, String> {
    let source_uri = report.report_uri.clone();
    let governance_class = classify_anuttara_report(&report)?;
    let surfaced = autoresearch
        .surface_non_aletheia_report(NonAletheiaPipelineReport::AnuttaraShaclFailure(report))?
        .ok_or_else(|| "Anuttara SHACL report did not surface a candidate".to_owned())?;
    let routes =
        autoresearch.route_candidate(&surfaced.candidate.candidate_id, downstream_targets)?;
    let anuttara_route = routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Anuttara)
        .cloned()
        .ok_or_else(|| "Anuttara route missing from deterministic slice".to_owned())?;

    let destination = PromotionDestination::AnuttaraOntologyExtension {
        axiom_target: "ql:CanonicalVakShape".to_owned(),
    };
    let review_item = submit_slice_review(
        review,
        TargetSubsystem::Anuttara,
        governance_class,
        &surfaced,
        &anuttara_route,
        &destination,
        annotations_for_anuttara(&source_uri),
        now_ms,
    )?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: anuttara_route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(86_400_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;
    autoresearch.transition_orchestration(TransitionOrchestrationRequest {
        orchestration_id: orchestration.orchestration_id.clone(),
        next_state: OrchestrationState::InReview,
        reason: "Anuttara deterministic slice submitted to governed review".to_owned(),
        now_ms: now_ms.saturating_add(1),
        review_stage: Some(ReviewStage::HumanReview),
        discard_reason: None,
        promotion_plan_id: None,
    })?;

    review.resolve(ReviewResolveRequest {
        item_id: review_item.item_id.clone(),
        decision: ReviewDecision::Approve,
        rationale: "Human approves dry-run construction planning for Anuttara evidence".to_owned(),
        resolved_by: ResolutionActor::Human,
        promotion_destination: Some("anuttara:ontology".to_owned()),
        promoted_artifact: Some(json!({"artifact": surfaced.run.challenger.path.clone()})),
    })?;
    autoresearch.evaluate(
        &surfaced.run.run_id,
        vec![slice_evaluation_evidence(
            "anuttara_shacl_construction",
            &source_uri,
            "SHACL evidence supports a bounded dry-run construction plan.",
        )],
    )?;
    let vault_root = vault_root.into();
    let source_path = vault_root.join("Empty/Present/02-06-2026/daily-note.md");
    if !source_path.exists() {
        std::fs::create_dir_all(
            source_path
                .parent()
                .ok_or_else(|| "daily-note source path has no parent".to_owned())?,
        )
        .map_err(|err| format!("{}: {err}", source_path.display()))?;
        std::fs::write(
            &source_path,
            format!(
                "# 09.T5 Anuttara Slice\n\nSource evidence: {source_uri}\n\nDry-run construction planning only.\n"
            ),
        )
        .map_err(|err| format!("{}: {err}", source_path.display()))?;
    }
    let promotion_plan = autoresearch.promote(PromoteRequest {
        run_id: surfaced.run.run_id.clone(),
        destination,
        legacy_destination: Some("anuttara:ontology".to_owned()),
        approved_review_resolution_id: review_item.item_id.clone(),
        review_store_root: review.root_path().to_path_buf(),
        vault_root,
        compiler_root: compiler_root.into(),
        artifact_slug: "anuttara-deterministic-shacl-slice".to_owned(),
        requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 9, 0, 0)),
        dry_run: true,
    })?;

    Ok(DeterministicCapacitySliceReceipt {
        capacity: TargetSubsystem::Anuttara,
        governance_class,
        surfaced,
        routes,
        review_item,
        orchestration,
        annotations: annotations_for_anuttara(&source_uri),
        evidence_deposits: vec![evidence_deposit(
            "anuttara-shacl",
            &source_uri,
            "Sophia/Anima/Pi/Aletheia annotations deposited for SHACL construction evidence.",
        )],
        promotion_plan: Some(promotion_plan),
    })
}

pub fn classify_parashakti_scorecard(
    scorecard: &ParashaktiScorecard,
) -> Result<SliceGovernanceClass, String> {
    if scorecard.affected_coordinates.is_empty() {
        return Err("affected_coordinates is required".to_owned());
    }
    if scorecard.gds_projection_uri.trim().is_empty() {
        return Err("gds_projection_uri is required".to_owned());
    }
    let deficit = scorecard.report.minimum_acceptable_value - scorecard.report.current_value;
    if scorecard.load_bearing_lens_change || deficit >= 0.20 {
        Ok(SliceGovernanceClass::LoadBearing)
    } else {
        Ok(SliceGovernanceClass::Routine)
    }
}

pub fn run_parashakti_deterministic_slice(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    scorecard: ParashaktiScorecard,
    now_ms: u128,
) -> Result<DeterministicCapacitySliceReceipt, String> {
    let governance_class = classify_parashakti_scorecard(&scorecard)?;
    let source_uri = scorecard.report.report_uri.clone();
    let surfaced = autoresearch
        .surface_non_aletheia_report(NonAletheiaPipelineReport::ParashaktiEmbeddingDrift(
            scorecard.report.clone(),
        ))?
        .ok_or_else(|| {
            "Parashakti scorecard did not surface a metric-drift candidate".to_owned()
        })?;
    let route = surfaced
        .routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Parashakti)
        .cloned()
        .ok_or_else(|| "Parashakti route missing from deterministic slice".to_owned())?;
    let destination = PromotionDestination::ParashaktiEmbeddingDeployment {
        embedding_kind: "lens-kge".to_owned(),
        version: "review-candidate".to_owned(),
    };
    let annotations = annotations_for_parashakti(&source_uri, &scorecard, governance_class);
    let review_item = submit_slice_review(
        review,
        TargetSubsystem::Parashakti,
        governance_class,
        &surfaced,
        &route,
        &destination,
        annotations.clone(),
        now_ms,
    )?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(86_400_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;

    Ok(DeterministicCapacitySliceReceipt {
        capacity: TargetSubsystem::Parashakti,
        governance_class,
        surfaced,
        routes: vec![route],
        review_item,
        orchestration,
        annotations,
        evidence_deposits: vec![evidence_deposit(
            "parashakti-scorecard",
            &source_uri,
            "Pi metrics, Sophia coherence, Anima aesthetic, and Aletheia disclosure evidence deposited without graph mutation.",
        )],
        promotion_plan: None,
    })
}

pub fn run_paramasiva_training_capacity_slice(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    report: ParamasivaCorpusRefreshReport,
    vault_root: impl Into<std::path::PathBuf>,
    compiler_root: impl Into<std::path::PathBuf>,
    now_ms: u128,
) -> Result<DeterministicCapacitySliceReceipt, String> {
    let governance_class = classify_paramasiva_report(&report)?;
    let source_uri = report.manifest_uri.clone();
    let surfaced = autoresearch
        .surface_non_aletheia_report(NonAletheiaPipelineReport::ParamasivaCorpusRefresh(
            report.clone(),
        ))?
        .ok_or_else(|| "Paramasiva report did not surface a corpus-refresh candidate".to_owned())?;
    let route = surfaced
        .routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Paramasiva)
        .cloned()
        .ok_or_else(|| "Paramasiva route missing from training slice".to_owned())?;
    let destination = PromotionDestination::ParamasivaCorpusInclusion {
        corpus_destination: format!("m5-prime://paramasiva/corpus/{}", report.corpus_segment),
    };
    let annotations = annotations_for_paramasiva(&source_uri, &report, governance_class);
    let review_item = submit_slice_review(
        review,
        TargetSubsystem::Paramasiva,
        governance_class,
        &surfaced,
        &route,
        &destination,
        annotations.clone(),
        now_ms,
    )?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(86_400_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;

    review.resolve(ReviewResolveRequest {
        item_id: review_item.item_id.clone(),
        decision: ReviewDecision::Approve,
        rationale:
            "Human approves dry-run Paramasiva corpus refresh planning after Sophia/Epii co-review."
                .to_owned(),
        resolved_by: ResolutionActor::Human,
        promotion_destination: Some("paramasiva:corpus".to_owned()),
        promoted_artifact: Some(json!({"artifact": surfaced.run.challenger.path.clone()})),
    })?;
    autoresearch.evaluate(
        &surfaced.run.run_id,
        vec![slice_evaluation_evidence_for_target(
            TargetSubsystem::Paramasiva,
            "paramasiva_corpus_refresh",
            &source_uri,
            "Corpus manifest, synthetic-proof review, and CPT/RAG metric evidence support dry-run refresh planning.",
        )],
    )?;
    let vault_root = vault_root.into();
    ensure_slice_source_note(
        &vault_root,
        "09.T6 Paramasiva Slice",
        &source_uri,
        "Dry-run CPT/RAG corpus refresh planning only.",
    )?;
    let promotion_plan = autoresearch.promote(PromoteRequest {
        run_id: surfaced.run.run_id.clone(),
        destination,
        legacy_destination: Some("paramasiva:corpus".to_owned()),
        approved_review_resolution_id: review_item.item_id.clone(),
        review_store_root: review.root_path().to_path_buf(),
        vault_root,
        compiler_root: compiler_root.into(),
        artifact_slug: "paramasiva-training-corpus-slice".to_owned(),
        requested_at: Some(PromotionHenTimestamp::new(2026, 6, 2, 10, 0, 0)),
        dry_run: true,
    })?;

    Ok(DeterministicCapacitySliceReceipt {
        capacity: TargetSubsystem::Paramasiva,
        governance_class,
        surfaced,
        routes: vec![route],
        review_item,
        orchestration,
        annotations,
        evidence_deposits: vec![evidence_deposit(
            "paramasiva-corpus-refresh",
            &source_uri,
            "Sophia/Epii co-review, Pi CPT/RAG dispatch, synthetic-proof trace, and anti-drift metrics deposited without corpus mutation.",
        )],
        promotion_plan: Some(promotion_plan),
    })
}

pub fn run_mahamaya_runtime_capacity_slice(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
    report: MahamayaRuntimeTrainingReport,
    now_ms: u128,
) -> Result<DeterministicCapacitySliceReceipt, String> {
    let governance_class = classify_mahamaya_report(&report)?;
    let source_uri = report.report_uri.clone();
    let surfaced = autoresearch
        .surface_non_aletheia_report(NonAletheiaPipelineReport::MahamayaRuntimeTraining(
            report.clone(),
        ))?
        .ok_or_else(|| "Mahamaya report did not surface a runtime-training candidate".to_owned())?;
    let route = surfaced
        .routes
        .iter()
        .find(|route| route.target_subsystem == TargetSubsystem::Mahamaya)
        .cloned()
        .ok_or_else(|| "Mahamaya route missing from runtime slice".to_owned())?;
    let destination = match report.tier {
        MahamayaRuntimeTier::GeneticProgram => {
            PromotionDestination::MahamayaSymbolicProgramRegistration {
                program_id: report.training_round_id.clone(),
            }
        }
        _ => PromotionDestination::MahamayaPolicyWeightDeployment {
            policy_version: report.training_round_id.clone(),
        },
    };
    let annotations = annotations_for_mahamaya(&source_uri, &report, governance_class);
    let review_item = submit_slice_review(
        review,
        TargetSubsystem::Mahamaya,
        governance_class,
        &surfaced,
        &route,
        &destination,
        annotations.clone(),
        now_ms,
    )?;
    let orchestration = autoresearch.create_orchestration(CreateOrchestrationRequest {
        candidate_id: surfaced.candidate.candidate_id.clone(),
        route_id: route.route_id.clone(),
        review_item_id: Some(review_item.item_id.clone()),
        timeout_after_ms: Some(86_400_000),
        retry_policy: RetryPolicy::default(),
        now_ms,
    })?;

    Ok(DeterministicCapacitySliceReceipt {
        capacity: TargetSubsystem::Mahamaya,
        governance_class,
        surfaced,
        routes: vec![route],
        review_item,
        orchestration,
        annotations,
        evidence_deposits: vec![evidence_deposit(
            "mahamaya-runtime-training",
            &source_uri,
            &format!(
                "Mahamaya {:?} runtime evidence deposited with rollback handle {}; no runtime mutation.",
                report.tier, report.rollback_handle
            ),
        )],
        promotion_plan: None,
    })
}

fn classify_paramasiva_report(
    report: &ParamasivaCorpusRefreshReport,
) -> Result<SliceGovernanceClass, String> {
    if report.manifest_uri.trim().is_empty() {
        return Err("manifest_uri is required".to_owned());
    }
    if report.corpus_segment.trim().is_empty() {
        return Err("corpus_segment is required".to_owned());
    }
    if report.retrieval_metric_name.trim().is_empty() {
        return Err("retrieval_metric_name is required".to_owned());
    }
    if report.synthetic_proof_review_uri.trim().is_empty() {
        return Err("synthetic_proof_review_uri is required".to_owned());
    }
    if report.gds_augmentation_uri.trim().is_empty() {
        return Err("gds_augmentation_uri is required".to_owned());
    }
    if report.current_metric_value > report.maximum_acceptable_value
        || report.new_derivational_tokens >= 50_000
    {
        Ok(SliceGovernanceClass::LoadBearing)
    } else {
        Ok(SliceGovernanceClass::Routine)
    }
}

fn classify_mahamaya_report(
    report: &MahamayaRuntimeTrainingReport,
) -> Result<SliceGovernanceClass, String> {
    if report.report_uri.trim().is_empty() {
        return Err("report_uri is required".to_owned());
    }
    if report.training_round_id.trim().is_empty() {
        return Err("training_round_id is required".to_owned());
    }
    if report.reward_metric_name.trim().is_empty() {
        return Err("reward_metric_name is required".to_owned());
    }
    if report.rollback_handle.trim().is_empty() {
        return Err("rollback_handle is required".to_owned());
    }
    if report.integration_impact_uri.trim().is_empty() {
        return Err("integration_impact_uri is required".to_owned());
    }
    if matches!(
        report.tier,
        MahamayaRuntimeTier::RuntimePolicy | MahamayaRuntimeTier::RewardModel
    ) || report.current_reward_score < report.minimum_reward_score
        || report.pathway_diversity_score < report.minimum_pathway_diversity
    {
        Ok(SliceGovernanceClass::LoadBearing)
    } else {
        Ok(SliceGovernanceClass::Routine)
    }
}

fn classify_anuttara_report(
    report: &AnuttaraShaclFailureReport,
) -> Result<SliceGovernanceClass, String> {
    if report.report_uri.trim().is_empty() {
        return Err("report_uri is required".to_owned());
    }
    if report.shape_id.trim().is_empty() {
        return Err("shape_id is required".to_owned());
    }
    if report.failing_focus_nodes.is_empty() {
        return Err("failing_focus_nodes is required".to_owned());
    }
    if report.severity == "violation" || report.message.contains("load-bearing") {
        Ok(SliceGovernanceClass::LoadBearing)
    } else {
        Ok(SliceGovernanceClass::Routine)
    }
}

fn submit_slice_review(
    review: &ReviewStore,
    target: TargetSubsystem,
    governance_class: SliceGovernanceClass,
    surfaced: &SurfacedCandidateReceipt,
    route: &RouteRecord,
    destination: &PromotionDestination,
    annotations: Vec<AgentAnnotation>,
    now_ms: u128,
) -> Result<ReviewInboxItem, String> {
    let requires_human = governance_class == SliceGovernanceClass::LoadBearing;
    let (category, gate_kind, governance_level) =
        governance_for_slice(target, governance_class, destination);
    review.submit(ReviewSubmission {
        source: ReviewSource::Autoresearch,
        title: format!("{target:?} deterministic capacity slice"),
        body: format!(
            "{target:?} slice deposited {} bounded annotations and requires_human={requires_human}.",
            annotations.len()
        ),
        priority: if requires_human {
            ReviewPriority::Blocking
        } else {
            ReviewPriority::High
        },
        coordinate_context: json!({
            "candidate_id": surfaced.candidate.candidate_id,
            "run_id": surfaced.run.run_id,
            "route_id": route.route_id,
            "target_subsystem": format!("{target:?}"),
            "governance_class": format!("{governance_class:?}")
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "deterministic_capacity_slice".to_owned(),
            target: Some(json!({
                "target_subsystem": format!("{target:?}"),
                "annotations": annotations,
            })),
            destination: Some(destination_legacy_label_for_slice(destination).to_owned()),
            payload: Some(json!({
                "dry_run_only": true,
                "direct_graph_or_canon_mutation": false
            })),
        }),
        requires_human,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category,
            gate_kind,
            governance_level,
            required_actors: required_actors_for_slice(target, governance_class),
            candidate_id: Some(surfaced.candidate.candidate_id.clone()),
            orchestration_id: Some(format!(
                "orchestration:{}:{}",
                sanitize_id_component(&surfaced.candidate.candidate_id),
                sanitize_id_component(&route.route_id)
            )),
            source_artifact_refs: vec![surfaced
                .candidate
                .candidate
                .observation_evidence
                .source_uri
                .clone()],
            target_subsystem: Some(format!("{target:?}")),
            vector_kind: Some(format!("{:?}", surfaced.candidate.candidate.vector_kind)),
            promotion_destination: Some(destination_legacy_label_for_slice(destination).to_owned()),
            source_actor_detail: Some("deterministic-capacity-slice".to_owned()),
            stage_records: vec![ReviewStageRecord {
                stage: "submitted".to_owned(),
                actor: "s5-autoresearch".to_owned(),
                at_ms: now_ms,
                note: "bounded agent annotations deposited; no graph/canon mutation".to_owned(),
            }],
        }),
    })
}

fn annotations_for_anuttara(source_uri: &str) -> Vec<AgentAnnotation> {
    vec![
        AgentAnnotation {
            kind: AgentAnnotationKind::SophiaReview,
            actor: "sophia".to_owned(),
            note: "Sophia reviews Anuttara coherence before construction planning.".to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AnimaAestheticCheck,
            actor: "anima".to_owned(),
            note: "Anima checks symbolic/aesthetic fit without approving canon mutation."
                .to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::PiFormalTranslation,
            actor: "pi".to_owned(),
            note: "Pi prepares formal translation evidence for the SHACL/OWL seam.".to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AletheiaDisclosureNote,
            actor: "aletheia".to_owned(),
            note: "Aletheia records a disclosure note linking the SHACL report to S5 review."
                .to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
    ]
}

fn annotations_for_parashakti(
    source_uri: &str,
    scorecard: &ParashaktiScorecard,
    governance_class: SliceGovernanceClass,
) -> Vec<AgentAnnotation> {
    vec![
        AgentAnnotation {
            kind: AgentAnnotationKind::PiMetricsCheck,
            actor: "pi".to_owned(),
            note: format!(
                "Pi checks {} against threshold {:.4} using {}.",
                scorecard.report.metric_name,
                scorecard.report.minimum_acceptable_value,
                scorecard.gds_projection_uri
            ),
            source_refs: vec![source_uri.to_owned(), scorecard.gds_projection_uri.clone()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::SophiaReview,
            actor: "sophia".to_owned(),
            note: format!("Sophia classifies Parashakti coherence as {governance_class:?}."),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AnimaAestheticCheck,
            actor: "anima".to_owned(),
            note:
                "Anima performs cluster/rotation/Klein aesthetic review over affected coordinates."
                    .to_owned(),
            source_refs: scorecard.affected_coordinates.clone(),
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AletheiaDisclosureNote,
            actor: "aletheia".to_owned(),
            note: "Aletheia records metric-drift disclosure without graph mutation.".to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
    ]
}

fn annotations_for_paramasiva(
    source_uri: &str,
    report: &ParamasivaCorpusRefreshReport,
    governance_class: SliceGovernanceClass,
) -> Vec<AgentAnnotation> {
    vec![
        AgentAnnotation {
            kind: AgentAnnotationKind::SophiaReview,
            actor: "sophia".to_owned(),
            note: format!(
                "Sophia reviews corpus composition for {} as {governance_class:?}.",
                report.corpus_segment
            ),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::EpiiCoReview,
            actor: "epii".to_owned(),
            note: "Epii co-reviews derivational register fidelity before corpus refresh."
                .to_owned(),
            source_refs: vec![source_uri.to_owned(), report.synthetic_proof_review_uri.clone()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::PiTrainingDispatch,
            actor: "pi".to_owned(),
            note: format!(
                "Pi dispatches bounded CPT/RAG refresh planning with {} and GDS augmentation.",
                report.retrieval_metric_name
            ),
            source_refs: vec![
                source_uri.to_owned(),
                report.synthetic_proof_review_uri.clone(),
                report.gds_augmentation_uri.clone(),
            ],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AnimaAestheticCheck,
            actor: "anima".to_owned(),
            note: "Anima performs light oversight at the promotion gate without taking corpus authority."
                .to_owned(),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AletheiaDisclosureNote,
            actor: "aletheia".to_owned(),
            note: "Aletheia records synthetic-proof and anti-drift disclosure for the refresh."
                .to_owned(),
            source_refs: vec![source_uri.to_owned(), report.synthetic_proof_review_uri.clone()],
        },
    ]
}

fn annotations_for_mahamaya(
    source_uri: &str,
    report: &MahamayaRuntimeTrainingReport,
    governance_class: SliceGovernanceClass,
) -> Vec<AgentAnnotation> {
    vec![
        AgentAnnotation {
            kind: AgentAnnotationKind::SophiaReview,
            actor: "sophia".to_owned(),
            note: format!(
                "Sophia reviews {:?} pipeline evidence as {governance_class:?}.",
                report.tier
            ),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AnimaAestheticCheck,
            actor: "anima".to_owned(),
            note: format!(
                "Anima checks user-pathway diversity {:.4} against {:.4}.",
                report.pathway_diversity_score, report.minimum_pathway_diversity
            ),
            source_refs: vec![source_uri.to_owned()],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::PiRollbackImpactCheck,
            actor: "pi".to_owned(),
            note: "Pi checks rollback and runtime integration impact before deployment planning."
                .to_owned(),
            source_refs: vec![
                source_uri.to_owned(),
                report.rollback_handle.clone(),
                report.integration_impact_uri.clone(),
            ],
        },
        AgentAnnotation {
            kind: AgentAnnotationKind::AletheiaDisclosureNote,
            actor: "aletheia".to_owned(),
            note: "Aletheia records runtime-training disclosure and rollback lineage.".to_owned(),
            source_refs: vec![source_uri.to_owned(), report.rollback_handle.clone()],
        },
    ]
}

fn evidence_deposit(kind: &str, source_uri: &str, summary: &str) -> EvidenceDeposit {
    EvidenceDeposit {
        deposit_uri: format!("s5://evidence/{kind}/{}", stable_uri_suffix(source_uri)),
        source_uri: source_uri.to_owned(),
        summary: summary.to_owned(),
        mutates_graph_or_canon: false,
    }
}

fn slice_evaluation_evidence(dimension: &str, source_uri: &str, notes: &str) -> EvaluationEvidence {
    slice_evaluation_evidence_for_target(TargetSubsystem::Anuttara, dimension, source_uri, notes)
}

fn slice_evaluation_evidence_for_target(
    target: TargetSubsystem,
    dimension: &str,
    source_uri: &str,
    notes: &str,
) -> EvaluationEvidence {
    EvaluationEvidence {
        dimension: dimension.to_owned(),
        baseline_score: 0.40,
        challenger_score: 0.85,
        weight: 1.0,
        notes: notes.to_owned(),
        source_refs: vec![EvidenceSourceRef {
            kind: "deterministic_capacity_slice_source".to_owned(),
            uri: source_uri.to_owned(),
            coordinate: Some(target_coordinate(target).to_owned()),
            summary: Some(format!(
                "{target:?} evidence consumed by deterministic capacity slice"
            )),
        }],
        kernel_evidence: None,
    }
}

fn ensure_slice_source_note(
    vault_root: &std::path::Path,
    title: &str,
    source_uri: &str,
    note: &str,
) -> Result<(), String> {
    let source_path = vault_root.join("Empty/Present/02-06-2026/daily-note.md");
    if source_path.exists() {
        return Ok(());
    }
    std::fs::create_dir_all(
        source_path
            .parent()
            .ok_or_else(|| "daily-note source path has no parent".to_owned())?,
    )
    .map_err(|err| format!("{}: {err}", source_path.display()))?;
    std::fs::write(
        &source_path,
        format!("# {title}\n\nSource evidence: {source_uri}\n\n{note}\n"),
    )
    .map_err(|err| format!("{}: {err}", source_path.display()))
}

fn governance_for_slice(
    target: TargetSubsystem,
    governance_class: SliceGovernanceClass,
    destination: &PromotionDestination,
) -> (ReviewCategory, GateKind, GovernanceLevel) {
    if target == TargetSubsystem::Mahamaya && governance_class == SliceGovernanceClass::LoadBearing
    {
        return (
            ReviewCategory::DeploymentGate,
            GateKind::DeploymentGate,
            GovernanceLevel::DeploymentBlocking,
        );
    }
    let requires_human = governance_class == SliceGovernanceClass::LoadBearing;
    let category = match destination {
        PromotionDestination::MahamayaPolicyWeightDeployment { .. }
        | PromotionDestination::MahamayaSymbolicProgramRegistration { .. } => {
            ReviewCategory::DeploymentGate
        }
        _ => ReviewCategory::StandardImprovement,
    };
    if requires_human {
        (
            category,
            GateKind::HumanFinal,
            GovernanceLevel::HumanRequired,
        )
    } else {
        (category, GateKind::Standard, GovernanceLevel::Advisory)
    }
}


fn required_actors_for_slice(
    target: TargetSubsystem,
    governance_class: SliceGovernanceClass,
) -> Vec<String> {
    match (target, governance_class) {
        (TargetSubsystem::Anuttara, SliceGovernanceClass::LoadBearing) => vec![
            "human".to_owned(),
            "sophia".to_owned(),
            "anima".to_owned(),
            "pi".to_owned(),
            "aletheia".to_owned(),
        ],
        (TargetSubsystem::Parashakti, SliceGovernanceClass::LoadBearing) => vec![
            "human".to_owned(),
            "pi".to_owned(),
            "sophia".to_owned(),
            "anima".to_owned(),
            "aletheia".to_owned(),
        ],
        (TargetSubsystem::Parashakti, SliceGovernanceClass::Routine) => {
            vec!["pi".to_owned(), "sophia".to_owned(), "aletheia".to_owned()]
        }
        (TargetSubsystem::Paramasiva, SliceGovernanceClass::LoadBearing) => vec![
            "human".to_owned(),
            "sophia".to_owned(),
            "epii".to_owned(),
            "pi".to_owned(),
            "anima".to_owned(),
            "aletheia".to_owned(),
        ],
        (TargetSubsystem::Paramasiva, SliceGovernanceClass::Routine) => {
            vec!["sophia".to_owned(), "epii".to_owned(), "pi".to_owned()]
        }
        (TargetSubsystem::Mahamaya, SliceGovernanceClass::LoadBearing) => vec![
            "human".to_owned(),
            "sophia".to_owned(),
            "anima".to_owned(),
            "pi".to_owned(),
            "aletheia".to_owned(),
        ],
        (TargetSubsystem::Mahamaya, SliceGovernanceClass::Routine) => {
            vec!["sophia".to_owned(), "pi".to_owned(), "aletheia".to_owned()]
        }
        _ => vec!["sophia".to_owned(), "aletheia".to_owned()],
    }
}

fn destination_legacy_label_for_slice(destination: &PromotionDestination) -> &'static str {
    match destination {
        PromotionDestination::AnuttaraOntologyExtension { .. } => "anuttara:ontology",
        PromotionDestination::ParamasivaCorpusInclusion { .. } => "paramasiva:corpus",
        PromotionDestination::ParamasivaVoiceLoRADeployment { .. } => "paramasiva:checkpoint",
        PromotionDestination::ParashaktiEmbeddingDeployment { .. } => "parashakti:embedding",
        PromotionDestination::MahamayaPolicyWeightDeployment { .. } => "mahamaya:policy",
        PromotionDestination::MahamayaSymbolicProgramRegistration { .. } => "mahamaya:program",
        _ => "capacity:slice",
    }
}


fn candidate_for_entry(
    entry: &CapacityWorkflowRegistryEntry,
    now_ms: u128,
) -> Result<ImprovementCandidate, String> {
    ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: target_coordinate(entry.target_subsystem).to_owned(),
            direction: format!(
                "Route {:?} operational capacity through governed M5-4 mediation",
                entry.capacity_id
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: entry.source_spec_anchors[0].clone(),
                coordinate: Some(target_coordinate(entry.target_subsystem).to_owned()),
                kind: Some("capacity_workflow_source_spec".to_owned()),
            },
        },
        entry.target_subsystem,
        entry.vector_kind.clone(),
        entry.surfacing_pipeline,
        ObservationEvidence {
            source_uri: entry.source_spec_anchors[0].clone(),
            summary: format!(
                "{:?} capacity workflow trigger: {}",
                entry.capacity_id,
                entry.first_trigger_types.join(", ")
            ),
            observed_at: Some(now_ms),
            fingerprint: Some(format!(
                "capacity-workflow:{:?}:{now_ms}",
                entry.capacity_id
            )),
        },
        now_ms,
        surface_actor(entry.capacity_id),
        SensitivityClass::RequiresReview,
    )
}

fn review_submission_for_entry(
    entry: &CapacityWorkflowRegistryEntry,
    surfaced: &SurfacedCandidateReceipt,
    route: &RouteRecord,
    now_ms: u128,
) -> ReviewSubmission {
    let requires_human = !entry.user_final_gate_conditions.is_empty()
        && matches!(
            entry.gate_kind,
            GateKind::HumanFinal | GateKind::DeploymentGate | GateKind::RecursiveSelfModification
        );
    ReviewSubmission {
        source: review_source(entry.capacity_id),
        title: format!("{:?} operational capacity mediation", entry.capacity_id),
        body: format!(
            "{} leads {:?}; evidence: {}",
            entry.governance_lead,
            entry.capacity_id,
            entry.evidence_requirements.join("; ")
        ),
        priority: if requires_human {
            ReviewPriority::Blocking
        } else {
            ReviewPriority::High
        },
        coordinate_context: json!({
            "capacity_id": capacity_id_wire(entry.capacity_id),
            "candidate_id": surfaced.candidate.candidate_id,
            "run_id": surfaced.run.run_id,
            "route_id": route.route_id,
            "target_subsystem": format!("{:?}", entry.target_subsystem),
            "ide_surface_anchor": entry.ide_surface_anchor
        }),
        proposed_action: Some(ReviewProposedAction {
            kind: "capacity_workflow_mediation".to_owned(),
            target: Some(json!({
                "target_subsystem": format!("{:?}", entry.target_subsystem),
                "vector_kind": format!("{:?}", entry.vector_kind),
            })),
            destination: Some(entry.promotion_destination_family.clone()),
            payload: Some(json!({
                "promotion_destination": entry.promotion_destination,
                "first_trigger_types": entry.first_trigger_types,
            })),
        }),
        requires_human,
        kernel_visibility: None,
        governance_profile: Some(GovernanceProfile {
            category: entry.review_category,
            gate_kind: entry.gate_kind,
            governance_level: entry.governance_level,
            required_actors: entry.required_agents.clone(),
            candidate_id: Some(surfaced.candidate.candidate_id.clone()),
            orchestration_id: Some(format!(
                "orchestration:{}:{}",
                sanitize_id_component(&surfaced.candidate.candidate_id),
                sanitize_id_component(&route.route_id)
            )),
            source_artifact_refs: entry.source_spec_anchors.clone(),
            target_subsystem: Some(format!("{:?}", entry.target_subsystem)),
            vector_kind: Some(format!("{:?}", entry.vector_kind)),
            promotion_destination: Some(entry.promotion_destination_family.clone()),
            source_actor_detail: Some(entry.governance_lead.clone()),
            stage_records: vec![ReviewStageRecord {
                stage: format!("{:?}", ReviewStage::Submitted),
                actor: entry.governance_lead.clone(),
                at_ms: now_ms,
                note: "capacity workflow routed through S5 mediation adapter".to_owned(),
            }],
        }),
    }
}

fn target_coordinate(target: TargetSubsystem) -> &'static str {
    match target {
        TargetSubsystem::Anuttara => "M0/Anuttara",
        TargetSubsystem::Paramasiva => "M1/Paramasiva",
        TargetSubsystem::Parashakti => "M2/Parashakti",
        TargetSubsystem::Mahamaya => "M3/Mahamaya",
        TargetSubsystem::Nara => "M4/Nara",
        TargetSubsystem::Epii => "M5/Epii",
    }
}

fn surface_actor(capacity_id: CapacityId) -> SurfaceActor {
    match capacity_id {
        CapacityId::Nara => SurfaceActor::Anima,
        CapacityId::EpiiOnEpii => SurfaceActor::Epii,
        _ => SurfaceActor::Sophia,
    }
}

fn review_source(capacity_id: CapacityId) -> ReviewSource {
    match capacity_id {
        CapacityId::Nara => ReviewSource::Anima,
        _ => ReviewSource::Autoresearch,
    }
}

fn capacity_id_wire(capacity_id: CapacityId) -> &'static str {
    match capacity_id {
        CapacityId::Anuttara => "anuttara",
        CapacityId::Paramasiva => "paramasiva",
        CapacityId::Parashakti => "parashakti",
        CapacityId::Mahamaya => "mahamaya",
        CapacityId::Nara => "nara",
        CapacityId::EpiiOnEpii => "epii_on_epii",
    }
}

fn parse_capacity_id(value: &Value) -> Result<CapacityId, String> {
    match value.as_str() {
        Some("anuttara") => Ok(CapacityId::Anuttara),
        Some("paramasiva") => Ok(CapacityId::Paramasiva),
        Some("parashakti") => Ok(CapacityId::Parashakti),
        Some("mahamaya") => Ok(CapacityId::Mahamaya),
        Some("nara") => Ok(CapacityId::Nara),
        Some("epii_on_epii") => Ok(CapacityId::EpiiOnEpii),
        Some(other) => Err(format!("unsupported capacity_id: {other}")),
        None => Err("capacity_id must be a string".to_owned()),
    }
}

fn required_context_str<'a>(context: &'a Value, key: &str) -> Result<&'a str, String> {
    context
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("coordinate_context.{key} is required"))
}

fn reject_placeholder(value: &str, field: &str) -> Result<(), String> {
    if value.to_ascii_lowercase().contains("placeholder") {
        return Err(format!("{field} must not contain placeholder text"));
    }
    Ok(())
}

