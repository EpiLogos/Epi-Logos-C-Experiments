//! Capacity-workflow registry — the six operational-capacity profiles and the
//! lookup that resolves a `CapacityId` to its registry entry.

use serde::{Deserialize, Serialize};

use epi_s5_epii_review_core::{GateKind, GovernanceLevel};

use crate::spine::ImprovementVectorKind;
use crate::{
    OrchestrationState, PromotionDestination, ReviewCategory, SurfacingPipelineId, TargetSubsystem,
};

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
                "Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md#tranche-8".to_owned(),
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
                "Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md#t8".to_owned(),
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
                "Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md#tranche-9".to_owned(),
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

pub(super) fn capacity_entry(
    capacity_id: CapacityId,
) -> Result<CapacityWorkflowRegistryEntry, String> {
    capacity_workflow_registry()
        .into_iter()
        .find(|entry| entry.capacity_id == capacity_id)
        .ok_or_else(|| format!("capacity registry entry missing for {:?}", capacity_id))
}
