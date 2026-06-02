use std::collections::BTreeMap;

pub use crate::adapters::MahamayaRuntimeTier;
use crate::adapters::{
    AnuttaraShaclFailureReport, MahamayaRuntimeTrainingReport, NaraDialogicVoiceSignalReport,
    NonAletheiaPipelineReport, ParamasivaCorpusRefreshReport, ParashaktiEmbeddingDriftReport,
};
use epi_s5_epii_review_core::{
    GateKind, GovernanceLevel, GovernanceProfile, ResolutionActor, ReviewDecision,
    ReviewInboxFilter, ReviewInboxItem, ReviewPriority, ReviewProposedAction, ReviewResolveRequest,
    ReviewSource, ReviewStageRecord, ReviewStore, ReviewSubmission,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::spine::{CanonicalVakKeys, ImprovementVectorKind, ObservationEvidence};
use crate::{
    AletheiaLineageSurfaceReceipt, ArtifactRef, ClosureKind, ContentTypeRegister,
    CreateOrchestrationRequest, EvaluationEvidence, EvidenceSourceRef, ImprovementCandidate,
    ImprovementStore, OrchestrationRecord, OrchestrationState, PromoteRequest,
    PromotionHenTimestamp, PromotionPlan, ProposeRequest, RetryPolicy, ReviewCategory, ReviewStage,
    SensitivityClass, SurfaceActor, SurfacedCandidateReceipt, SurfacingPipelineId, TargetSubsystem,
    TransitionOrchestrationRequest,
};
use crate::{PromotionDestination, RouteRecord};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CapacityId {
    Anuttara,
    Paramasiva,
    Parashakti,
    Mahamaya,
    Nara,
    EpiiOnEpii,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CapacityWorkflowRegistryEntry {
    pub capacity_id: CapacityId,
    pub target_subsystem: TargetSubsystem,
    pub governance_lead: String,
    pub evidence_requirements: Vec<String>,
    pub first_trigger_types: Vec<String>,
    pub review_category: ReviewCategory,
    pub required_agents: Vec<String>,
    pub user_final_gate_conditions: Vec<String>,
    pub promotion_destination_family: String,
    pub ide_surface_anchor: String,
    pub source_spec_anchors: Vec<String>,
    pub vector_kind: ImprovementVectorKind,
    pub surfacing_pipeline: SurfacingPipelineId,
    pub initial_orchestration_state: OrchestrationState,
    pub gate_kind: GateKind,
    pub governance_level: GovernanceLevel,
    pub promotion_destination: PromotionDestination,
}

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
pub struct SpineRoutingConfigurationEntry {
    pub route_id: String,
    pub candidate_id: String,
    pub target_subsystem: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpineGovernanceGateEntry {
    pub review_item_id: String,
    pub category: ReviewCategory,
    pub gate_kind: GateKind,
    pub governance_level: GovernanceLevel,
    pub required_actors: Vec<String>,
    pub source_artifact_refs: Vec<String>,
    pub promotion_destination: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpineMetaLoopEvent {
    pub review_item_id: String,
    pub title: String,
    pub status: String,
    pub resolution: Option<ReviewDecision>,
    pub resolved_by: Option<ResolutionActor>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EpiiSpineStateInspectorSnapshot {
    pub routing_configuration: Vec<SpineRoutingConfigurationEntry>,
    pub governance_gates: Vec<SpineGovernanceGateEntry>,
    pub recent_meta_loop_events: Vec<SpineMetaLoopEvent>,
    pub continuity_hints: Vec<String>,
    pub effect_verification_schedules: Vec<String>,
    pub canon_evolution_refs: Vec<String>,
    pub recursive_review_item_ids: Vec<String>,
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

pub fn capacity_workflow_registry() -> Vec<CapacityWorkflowRegistryEntry> {
    vec![
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::Anuttara,
            target_subsystem: TargetSubsystem::Anuttara,
            governance_lead: "sophia".to_owned(),
            evidence_requirements: vec![
                "SHACL or OWL source report URI".to_owned(),
                "Pi axiom translation artifact".to_owned(),
                "Aletheia disclosure/source trace".to_owned(),
            ],
            first_trigger_types: vec![
                "anuttara_shacl_failure".to_owned(),
                "axiom_translation_gap".to_owned(),
            ],
            review_category: ReviewCategory::UserFinalValidation,
            required_agents: vec!["sophia".to_owned(), "pi".to_owned(), "aletheia".to_owned()],
            user_final_gate_conditions: vec![
                "load-bearing axiom or grammar mutation".to_owned(),
            ],
            promotion_destination_family: "m5-prime://anuttara/ontology".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/anuttara".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md#6".to_owned(),
                "docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md#tranche-8".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::AnuttaraAxiomElaboration {
                axiom_class: "ql:LoadBearingAxiom".to_owned(),
            },
            surfacing_pipeline: SurfacingPipelineId::AnuttaraConstruction,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::HumanFinal,
            governance_level: GovernanceLevel::HumanRequired,
            promotion_destination: PromotionDestination::AnuttaraOntologyExtension {
                axiom_target: "ql:LoadBearingAxiom".to_owned(),
            },
        },
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::Paramasiva,
            target_subsystem: TargetSubsystem::Paramasiva,
            governance_lead: "sophia".to_owned(),
            evidence_requirements: vec![
                "corpus segment manifest".to_owned(),
                "retrieval or CPT metric report".to_owned(),
                "synthetic-proof review trace".to_owned(),
            ],
            first_trigger_types: vec![
                "paramasiva_retrieval_gap".to_owned(),
                "synthetic_proof_validation".to_owned(),
            ],
            review_category: ReviewCategory::StandardImprovement,
            required_agents: vec!["sophia".to_owned(), "epii".to_owned(), "pi".to_owned()],
            user_final_gate_conditions: vec![
                "corpus refresh changes future canonical outputs".to_owned(),
            ],
            promotion_destination_family: "m5-prime://paramasiva/corpus".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/paramasiva".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md#6".to_owned(),
                "Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md#5.2".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::ParamasivaRetrievalGapFilling,
            surfacing_pipeline: SurfacingPipelineId::ParamasivaDerivational,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::Standard,
            governance_level: GovernanceLevel::Advisory,
            promotion_destination: PromotionDestination::ParamasivaCorpusInclusion {
                corpus_destination: "m5-prime://paramasiva/corpus/refresh".to_owned(),
            },
        },
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::Parashakti,
            target_subsystem: TargetSubsystem::Parashakti,
            governance_lead: "sophia".to_owned(),
            evidence_requirements: vec![
                "embedding-quality metric report".to_owned(),
                "graph namespace/lens source refs".to_owned(),
                "Aletheia disclosure/source trace".to_owned(),
            ],
            first_trigger_types: vec![
                "parashakti_embedding_drift".to_owned(),
                "lens_klein_handling_gap".to_owned(),
            ],
            review_category: ReviewCategory::UserFinalValidation,
            required_agents: vec!["sophia".to_owned(), "anima".to_owned(), "pi".to_owned()],
            user_final_gate_conditions: vec![
                "load-bearing embedding or lens hotswap".to_owned(),
            ],
            promotion_destination_family: "m5-prime://parashakti/embedding".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/parashakti".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md#7".to_owned(),
                "docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md#t8".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::ParashaktiEmbeddingRefresh {
                embedding_kind: "lens-kge".to_owned(),
            },
            surfacing_pipeline: SurfacingPipelineId::ParashaktiRelational,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::HumanFinal,
            governance_level: GovernanceLevel::HumanRequired,
            promotion_destination: PromotionDestination::ParashaktiEmbeddingDeployment {
                embedding_kind: "lens-kge".to_owned(),
                version: "review-candidate".to_owned(),
            },
        },
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::Mahamaya,
            target_subsystem: TargetSubsystem::Mahamaya,
            governance_lead: "sophia".to_owned(),
            evidence_requirements: vec![
                "process-reward evaluation report".to_owned(),
                "runtime integration or rollback plan".to_owned(),
                "pathway diversity evidence".to_owned(),
            ],
            first_trigger_types: vec![
                "mahamaya_process_reward_drift".to_owned(),
                "runtime_policy_update".to_owned(),
            ],
            review_category: ReviewCategory::DeploymentGate,
            required_agents: vec!["sophia".to_owned(), "anima".to_owned(), "pi".to_owned()],
            user_final_gate_conditions: vec![
                "runtime policy or rollback-affecting deployment".to_owned(),
            ],
            promotion_destination_family: "m5-prime://mahamaya/runtime-policy".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/mahamaya".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md#6".to_owned(),
                "docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md#tranche-9".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::MahamayaProcessRewardRefinement,
            surfacing_pipeline: SurfacingPipelineId::MahamayaCalculation,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::DeploymentGate,
            governance_level: GovernanceLevel::DeploymentBlocking,
            promotion_destination: PromotionDestination::MahamayaPolicyWeightDeployment {
                policy_version: "review-candidate".to_owned(),
            },
        },
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::Nara,
            target_subsystem: TargetSubsystem::Nara,
            governance_lead: "anima".to_owned(),
            evidence_requirements: vec![
                "consent-safe dialogic handle".to_owned(),
                "voice drift or DPO quality report".to_owned(),
                "PII-stripping proof artifact".to_owned(),
            ],
            first_trigger_types: vec![
                "nara_dialogic_voice_signal".to_owned(),
                "nara_consent_corpus_refresh".to_owned(),
            ],
            review_category: ReviewCategory::NaraAnimaPrimaryGate,
            required_agents: vec!["anima".to_owned(), "sophia".to_owned()],
            user_final_gate_conditions: vec![
                "protected personal corpus or voice-profile mutation".to_owned(),
            ],
            promotion_destination_family: "m5-prime://nara/dialogue-adapter".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/nara".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md#6".to_owned(),
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md#8".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::NaraDialogueCorpusAddition,
            surfacing_pipeline: SurfacingPipelineId::NaraDialogic,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::AnimaPrimary,
            governance_level: GovernanceLevel::Advisory,
            promotion_destination: PromotionDestination::NaraDialogueAdapterDeployment {
                adapter_version: "review-candidate".to_owned(),
            },
        },
        CapacityWorkflowRegistryEntry {
            capacity_id: CapacityId::EpiiOnEpii,
            target_subsystem: TargetSubsystem::Epii,
            governance_lead: "sophia".to_owned(),
            evidence_requirements: vec![
                "spine-state inspector evidence".to_owned(),
                "recursive review inconsistency or self-observation trace".to_owned(),
                "anti-self-justification source refs".to_owned(),
            ],
            first_trigger_types: vec![
                "epii_self_observation".to_owned(),
                "recursive_review_inconsistency".to_owned(),
            ],
            review_category: ReviewCategory::RecursiveSelfModification,
            required_agents: vec!["sophia".to_owned(), "epii".to_owned(), "anima".to_owned()],
            user_final_gate_conditions: vec![
                "recursive self-modification or agent-config mutation".to_owned(),
            ],
            promotion_destination_family: "m5-prime://epii/self-modification".to_owned(),
            ide_surface_anchor: "pratibimba://system/control-room/capacity/epii-on-epii".to_owned(),
            source_spec_anchors: vec![
                "Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md#6".to_owned(),
                "Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md#9.2".to_owned(),
            ],
            vector_kind: ImprovementVectorKind::EpiiSpineMechanismRefinement {
                spine_phase: "recursive-review".to_owned(),
            },
            surfacing_pipeline: SurfacingPipelineId::EpiiOnEpiiMeta,
            initial_orchestration_state: OrchestrationState::Queued,
            gate_kind: GateKind::RecursiveSelfModification,
            governance_level: GovernanceLevel::RecursiveLoadBearing,
            promotion_destination: PromotionDestination::EpiiSpineMechanismUpdate {
                spine_component: "recursive-review".to_owned(),
            },
        },
    ]
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

pub fn build_epii_spine_state_inspector(
    autoresearch: &ImprovementStore,
    review: &ReviewStore,
) -> Result<EpiiSpineStateInspectorSnapshot, String> {
    let routes = autoresearch.routes()?;
    let orchestrations = autoresearch.orchestrations()?;
    let inbox = review.inbox(ReviewInboxFilter::default())?;
    let history = review.history(None)?;

    let recursive_items = inbox
        .items
        .iter()
        .chain(history.items.iter())
        .filter(|item| is_recursive_spine_item(item))
        .collect::<Vec<_>>();
    let recursive_review_item_ids = recursive_items
        .iter()
        .map(|item| item.item_id.clone())
        .collect::<Vec<_>>();
    let route_ids = recursive_items
        .iter()
        .filter_map(|item| {
            item.coordinate_context
                .get("route_id")
                .and_then(Value::as_str)
                .map(str::to_owned)
        })
        .collect::<Vec<_>>();

    let mut routing_configuration = routes
        .into_iter()
        .filter(|route| {
            route.target_subsystem == TargetSubsystem::Epii || route_ids.contains(&route.route_id)
        })
        .map(|route| SpineRoutingConfigurationEntry {
            route_id: route.route_id,
            candidate_id: route.candidate_id,
            target_subsystem: format!("{:?}", route.target_subsystem),
            status: format!("{:?}", route.status),
        })
        .collect::<Vec<_>>();
    routing_configuration.sort_by(|left, right| left.route_id.cmp(&right.route_id));

    let mut governance_gates = recursive_items
        .iter()
        .filter_map(|item| {
            item.governance_profile
                .as_ref()
                .map(|profile| SpineGovernanceGateEntry {
                    review_item_id: item.item_id.clone(),
                    category: profile.category,
                    gate_kind: profile.gate_kind,
                    governance_level: profile.governance_level,
                    required_actors: profile.required_actors.clone(),
                    source_artifact_refs: profile.source_artifact_refs.clone(),
                    promotion_destination: profile.promotion_destination.clone(),
                })
        })
        .collect::<Vec<_>>();
    governance_gates.sort_by(|left, right| left.review_item_id.cmp(&right.review_item_id));

    let mut recent_meta_loop_events = history
        .items
        .iter()
        .filter(|item| {
            is_recursive_spine_item(item)
                || item
                    .governance_profile
                    .as_ref()
                    .and_then(|profile| profile.target_subsystem.as_deref())
                    == Some("Epii")
        })
        .map(|item| {
            let resolution = history
                .resolutions
                .iter()
                .find(|resolution| resolution.item_id == item.item_id);
            SpineMetaLoopEvent {
                review_item_id: item.item_id.clone(),
                title: item.title.clone(),
                status: format!("{:?}", item.status),
                resolution: resolution.map(|resolution| resolution.decision),
                resolved_by: resolution.map(|resolution| resolution.resolved_by.clone()),
            }
        })
        .collect::<Vec<_>>();
    recent_meta_loop_events.sort_by(|left, right| left.review_item_id.cmp(&right.review_item_id));

    let mut effect_verification_schedules = orchestrations
        .iter()
        .filter(|orchestration| {
            orchestration
                .review_item_id
                .as_ref()
                .is_some_and(|item_id| recursive_review_item_ids.contains(item_id))
        })
        .map(|orchestration| {
            format!(
                "{}:{:?}:deadline_at={}",
                orchestration.orchestration_id,
                orchestration.state,
                orchestration.deadline_at.unwrap_or_default()
            )
        })
        .collect::<Vec<_>>();
    effect_verification_schedules.sort();

    let mut canon_evolution_refs = governance_gates
        .iter()
        .flat_map(|gate| gate.source_artifact_refs.iter().cloned())
        .collect::<Vec<_>>();
    canon_evolution_refs.sort();
    canon_evolution_refs.dedup();

    let continuity_hints = vec![
        format!("recursive_review_items={}", recursive_review_item_ids.len()),
        "agent_terminal_resolution_allowed=false".to_owned(),
        "human_final_validation_before_spine_promotion=true".to_owned(),
    ];

    Ok(EpiiSpineStateInspectorSnapshot {
        routing_configuration,
        governance_gates,
        recent_meta_loop_events,
        continuity_hints,
        effect_verification_schedules,
        canon_evolution_refs,
        recursive_review_item_ids,
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

fn is_recursive_spine_item(item: &ReviewInboxItem) -> bool {
    let Some(profile) = item.governance_profile.as_ref() else {
        return false;
    };
    profile.category == ReviewCategory::RecursiveSelfModification
        && profile.gate_kind == GateKind::RecursiveSelfModification
        && profile.governance_level == GovernanceLevel::RecursiveLoadBearing
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

fn stable_uri_suffix(value: &str) -> String {
    value
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric() || *ch == '-' || *ch == '_')
        .take(48)
        .collect::<String>()
}

fn capacity_entry(capacity_id: CapacityId) -> Result<CapacityWorkflowRegistryEntry, String> {
    capacity_workflow_registry()
        .into_iter()
        .find(|entry| entry.capacity_id == capacity_id)
        .ok_or_else(|| format!("capacity registry entry missing for {:?}", capacity_id))
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

fn sanitize_id_component(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '-'
            }
        })
        .collect()
}
