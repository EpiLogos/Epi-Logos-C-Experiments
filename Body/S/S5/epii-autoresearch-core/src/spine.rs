use serde::{Deserialize, Serialize};

use crate::{ArtifactRef, KernelEvidence, ProposeRequest};

pub const SPINE_SCHEMA_VERSION: u16 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TargetSubsystem {
    Anuttara,
    Paramasiva,
    Parashakti,
    Mahamaya,
    Nara,
    Epii,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "kind")]
pub enum ImprovementVectorKind {
    AnuttaraAxiomElaboration { axiom_class: String },
    AnuttaraShapeRefinement,
    AnuttaraSymbolicCorrespondence { source_tradition: String },
    ParamasivaCorpusAddition { corpus_segment: String },
    ParamasivaCorpusDeprecation { reason: String },
    ParamasivaSyntheticProofValidation,
    ParamasivaRetrievalGapFilling,
    ParashaktiEmbeddingRefresh { embedding_kind: String },
    ParashaktiLensLoRARefinement { lens_id: u8 },
    ParashaktiNewEdgeTypeIntegration { edge_type: String },
    ParashaktiKleinHandlingRefinement,
    MahamayaProcessRewardRefinement,
    MahamayaFederatedRoundExecution,
    MahamayaSymbolicProgramPromotion { program_id: String },
    MahamayaPathwayPatternIntegration { pattern: String },
    NaraDialogueCorpusAddition,
    NaraVoiceDriftCorrection { drift_kind: String },
    NaraDPORefinement,
    NaraRegisterExtension { register: String },
    EpiiSpineMechanismRefinement { spine_phase: String },
    EpiiVoiceCanonRefinement,
    EpiiPedagogyRegisterUpdate { depth: String },
    EpiiAgentConfigurationUpdate { agent: String, scope: String },
}

impl ImprovementVectorKind {
    pub fn target_subsystem(&self) -> TargetSubsystem {
        match self {
            Self::AnuttaraAxiomElaboration { .. }
            | Self::AnuttaraShapeRefinement
            | Self::AnuttaraSymbolicCorrespondence { .. } => TargetSubsystem::Anuttara,
            Self::ParamasivaCorpusAddition { .. }
            | Self::ParamasivaCorpusDeprecation { .. }
            | Self::ParamasivaSyntheticProofValidation
            | Self::ParamasivaRetrievalGapFilling => TargetSubsystem::Paramasiva,
            Self::ParashaktiEmbeddingRefresh { .. }
            | Self::ParashaktiLensLoRARefinement { .. }
            | Self::ParashaktiNewEdgeTypeIntegration { .. }
            | Self::ParashaktiKleinHandlingRefinement => TargetSubsystem::Parashakti,
            Self::MahamayaProcessRewardRefinement
            | Self::MahamayaFederatedRoundExecution
            | Self::MahamayaSymbolicProgramPromotion { .. }
            | Self::MahamayaPathwayPatternIntegration { .. } => TargetSubsystem::Mahamaya,
            Self::NaraDialogueCorpusAddition
            | Self::NaraVoiceDriftCorrection { .. }
            | Self::NaraDPORefinement
            | Self::NaraRegisterExtension { .. } => TargetSubsystem::Nara,
            Self::EpiiSpineMechanismRefinement { .. }
            | Self::EpiiVoiceCanonRefinement
            | Self::EpiiPedagogyRegisterUpdate { .. }
            | Self::EpiiAgentConfigurationUpdate { .. } => TargetSubsystem::Epii,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SurfacingPipelineId {
    AletheiaDisclosure,
    AnuttaraConstruction,
    ParamasivaDerivational,
    ParashaktiRelational,
    MahamayaCalculation,
    NaraDialogic,
    EpiiOnEpiiMeta,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ClosureKind {
    Rehear,
    ForceClosed,
    LegacyUnspecified,
}

impl Default for ClosureKind {
    fn default() -> Self {
        Self::LegacyUnspecified
    }
}

impl ClosureKind {
    pub fn from_inbox_wire(value: &str) -> Result<Self, String> {
        match value {
            "rehear" => Ok(Self::Rehear),
            "force_closed" => Ok(Self::ForceClosed),
            other => Err(format!("unsupported closure_kind: {other}")),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ContentTypeRegister {
    CT4a,
    CT4b,
    LegacyUnspecified,
}

impl Default for ContentTypeRegister {
    fn default() -> Self {
        Self::LegacyUnspecified
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CanonicalVakKeys {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cpf: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ct: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cp: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cf: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cfp: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cs: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SensitivityClass {
    PublicCurrent,
    ProtectedLocal,
    RequiresReview,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "kind", content = "id")]
pub enum SurfaceActor {
    Aletheia,
    Anima,
    Sophia,
    Pi,
    KernelObserver,
    Epii,
    Agent(String),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ObservationEvidence {
    pub source_uri: String,
    pub summary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub observed_at: Option<u128>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CandidateLinkage {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub originating_inbox_entry: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub originating_review_item: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImprovementCandidate {
    pub schema_version: u16,
    pub propose: ProposeRequest,
    pub target_subsystem: TargetSubsystem,
    pub vector_kind: ImprovementVectorKind,
    pub surfacing_pipeline: SurfacingPipelineId,
    pub observation_evidence: ObservationEvidence,
    pub closure_kind: ClosureKind,
    pub ct_register: ContentTypeRegister,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub challenger_artifact: Option<ArtifactRef>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub originating_kernel_evidence: Option<KernelEvidence>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_keys: Option<CanonicalVakKeys>,
    pub linkage: CandidateLinkage,
    pub surfaced_at: u128,
    pub surfaced_by: SurfaceActor,
    pub sensitivity_class: SensitivityClass,
}

impl ImprovementCandidate {
    pub fn from_propose(
        propose: ProposeRequest,
        target_subsystem: TargetSubsystem,
        vector_kind: ImprovementVectorKind,
        surfacing_pipeline: SurfacingPipelineId,
        observation_evidence: ObservationEvidence,
        surfaced_at: u128,
        surfaced_by: SurfaceActor,
        sensitivity_class: SensitivityClass,
    ) -> Result<Self, String> {
        let candidate = Self {
            schema_version: SPINE_SCHEMA_VERSION,
            propose,
            target_subsystem,
            vector_kind,
            surfacing_pipeline,
            observation_evidence,
            closure_kind: ClosureKind::LegacyUnspecified,
            ct_register: ContentTypeRegister::LegacyUnspecified,
            challenger_artifact: None,
            originating_kernel_evidence: None,
            vak_keys: None,
            linkage: CandidateLinkage {
                originating_inbox_entry: None,
                originating_review_item: None,
            },
            surfaced_at,
            surfaced_by,
            sensitivity_class,
        };
        candidate.validate()?;
        Ok(candidate)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.schema_version != SPINE_SCHEMA_VERSION {
            return Err(format!(
                "unsupported improvement candidate schema_version: {}",
                self.schema_version
            ));
        }
        validate_non_blank(&self.propose.target_family, "target_family")?;
        validate_non_blank(&self.propose.target_coordinate, "target_coordinate")?;
        validate_non_blank(&self.propose.direction, "direction")?;
        validate_non_blank(&self.propose.baseline.path, "baseline artifact path")?;
        validate_non_blank(
            &self.observation_evidence.source_uri,
            "observation source_uri",
        )?;
        validate_non_blank(&self.observation_evidence.summary, "observation summary")?;
        if self.target_subsystem != self.vector_kind.target_subsystem() {
            return Err(format!(
                "vector kind targets {:?}, not {:?}",
                self.vector_kind.target_subsystem(),
                self.target_subsystem
            ));
        }
        validate_vector_fields(&self.vector_kind)?;
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "kind")]
pub enum MutationKind {
    AddOwlAxiom { axiom_target: String },
    SwapVoiceLoRA { lora_version: String },
    HotReloadEmbeddingIndex { embedding_kind: String },
    SwapPolicyWeights { policy_version: String },
    LoadDialogueAdapter { adapter_version: String },
    UpdateAgentConfig { agent: String, scope: String },
    HenSeedDeposit,
    WorldPromotion,
    PresentScratchpad,
    KernelLawUpdate,
    SpaceTimeDBTableChange,
    SpacedRetrievalReindexing,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "kind")]
pub enum PromotionDestination {
    AnuttaraOntologyExtension {
        axiom_target: String,
    },
    AnuttaraShapeAddition {
        shape_target: String,
    },
    ParamasivaCorpusInclusion {
        corpus_destination: String,
    },
    ParamasivaVoiceLoRADeployment {
        lora_version: String,
    },
    ParashaktiEmbeddingDeployment {
        embedding_kind: String,
        version: String,
    },
    ParashaktiLensLoRADeployment {
        lens_id: u8,
        version: String,
    },
    MahamayaPolicyWeightDeployment {
        policy_version: String,
    },
    MahamayaSymbolicProgramRegistration {
        program_id: String,
    },
    NaraDialogueAdapterDeployment {
        adapter_version: String,
    },
    EpiiAgentConfigDeployment {
        agent: String,
        config_version: String,
    },
    EpiiSpineMechanismUpdate {
        spine_component: String,
    },
    SeedDeposit {
        seed_path: String,
    },
    WorldPromotion {
        world_path: String,
        source_seed_path: String,
    },
    PresentScratchpad {
        day_id: String,
        path_suffix: String,
    },
    KernelLawUpdate {
        law_id: String,
    },
    SpaceTimeDBTableChange {
        module: String,
        change: String,
    },
    SpacedRetrievalReindexing {
        affected_namespaces: Vec<String>,
    },
}

impl PromotionDestination {
    pub fn mutation_kind(&self) -> MutationKind {
        match self {
            Self::AnuttaraOntologyExtension { axiom_target } => MutationKind::AddOwlAxiom {
                axiom_target: axiom_target.clone(),
            },
            Self::ParamasivaVoiceLoRADeployment { lora_version } => MutationKind::SwapVoiceLoRA {
                lora_version: lora_version.clone(),
            },
            Self::ParashaktiEmbeddingDeployment { embedding_kind, .. } => {
                MutationKind::HotReloadEmbeddingIndex {
                    embedding_kind: embedding_kind.clone(),
                }
            }
            Self::MahamayaPolicyWeightDeployment { policy_version } => {
                MutationKind::SwapPolicyWeights {
                    policy_version: policy_version.clone(),
                }
            }
            Self::NaraDialogueAdapterDeployment { adapter_version } => {
                MutationKind::LoadDialogueAdapter {
                    adapter_version: adapter_version.clone(),
                }
            }
            Self::EpiiAgentConfigDeployment { agent, .. } => MutationKind::UpdateAgentConfig {
                agent: agent.clone(),
                scope: "agent_config".to_owned(),
            },
            Self::SeedDeposit { .. } => MutationKind::HenSeedDeposit,
            Self::WorldPromotion { .. } => MutationKind::WorldPromotion,
            Self::PresentScratchpad { .. } => MutationKind::PresentScratchpad,
            Self::KernelLawUpdate { .. } => MutationKind::KernelLawUpdate,
            Self::SpaceTimeDBTableChange { .. } => MutationKind::SpaceTimeDBTableChange,
            Self::SpacedRetrievalReindexing { .. } => MutationKind::SpacedRetrievalReindexing,
            Self::AnuttaraShapeAddition { .. }
            | Self::ParamasivaCorpusInclusion { .. }
            | Self::ParashaktiLensLoRADeployment { .. }
            | Self::MahamayaSymbolicProgramRegistration { .. }
            | Self::EpiiSpineMechanismUpdate { .. } => MutationKind::HenSeedDeposit,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        match self {
            Self::AnuttaraOntologyExtension { axiom_target } => {
                validate_non_blank(axiom_target, "axiom_target")
            }
            Self::AnuttaraShapeAddition { shape_target } => {
                validate_non_blank(shape_target, "shape_target")
            }
            Self::ParamasivaCorpusInclusion { corpus_destination } => {
                validate_non_blank(corpus_destination, "corpus_destination")
            }
            Self::ParamasivaVoiceLoRADeployment { lora_version } => {
                validate_non_blank(lora_version, "lora_version")
            }
            Self::ParashaktiEmbeddingDeployment {
                embedding_kind,
                version,
            } => {
                validate_non_blank(embedding_kind, "embedding_kind")?;
                validate_non_blank(version, "version")
            }
            Self::ParashaktiLensLoRADeployment { lens_id, version } => {
                validate_lens_id(*lens_id)?;
                validate_non_blank(version, "version")
            }
            Self::MahamayaPolicyWeightDeployment { policy_version } => {
                validate_non_blank(policy_version, "policy_version")
            }
            Self::MahamayaSymbolicProgramRegistration { program_id } => {
                validate_non_blank(program_id, "program_id")
            }
            Self::NaraDialogueAdapterDeployment { adapter_version } => {
                validate_non_blank(adapter_version, "adapter_version")
            }
            Self::EpiiAgentConfigDeployment {
                agent,
                config_version,
            } => {
                validate_non_blank(agent, "agent")?;
                validate_non_blank(config_version, "config_version")
            }
            Self::EpiiSpineMechanismUpdate { spine_component } => {
                validate_non_blank(spine_component, "spine_component")
            }
            Self::SeedDeposit { seed_path } => validate_non_blank(seed_path, "seed_path"),
            Self::WorldPromotion {
                world_path,
                source_seed_path,
            } => {
                validate_non_blank(world_path, "world_path")?;
                validate_non_blank(source_seed_path, "source_seed_path")
            }
            Self::PresentScratchpad {
                day_id,
                path_suffix,
            } => {
                validate_non_blank(day_id, "day_id")?;
                validate_non_blank(path_suffix, "path_suffix")
            }
            Self::KernelLawUpdate { law_id } => validate_non_blank(law_id, "law_id"),
            Self::SpaceTimeDBTableChange { module, change } => {
                validate_non_blank(module, "module")?;
                validate_non_blank(change, "change")
            }
            Self::SpacedRetrievalReindexing {
                affected_namespaces,
            } => {
                if affected_namespaces.is_empty() {
                    return Err("affected_namespaces is required".to_owned());
                }
                for namespace in affected_namespaces {
                    validate_non_blank(namespace, "affected_namespace")?;
                }
                Ok(())
            }
        }
    }

    pub fn validate_legacy_destination(value: &str) -> Result<(), String> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return Err("promotion destination is required".to_owned());
        }
        if trimmed.starts_with('/') || trimmed.contains("..") {
            return Err(
                "promotion destination must be a governed destination, not a raw path".to_owned(),
            );
        }
        Ok(())
    }
}

fn validate_vector_fields(vector_kind: &ImprovementVectorKind) -> Result<(), String> {
    match vector_kind {
        ImprovementVectorKind::AnuttaraAxiomElaboration { axiom_class } => {
            validate_non_blank(axiom_class, "axiom_class")
        }
        ImprovementVectorKind::AnuttaraSymbolicCorrespondence { source_tradition } => {
            validate_non_blank(source_tradition, "source_tradition")
        }
        ImprovementVectorKind::ParamasivaCorpusAddition { corpus_segment } => {
            validate_non_blank(corpus_segment, "corpus_segment")
        }
        ImprovementVectorKind::ParamasivaCorpusDeprecation { reason } => {
            validate_non_blank(reason, "reason")
        }
        ImprovementVectorKind::ParashaktiEmbeddingRefresh { embedding_kind } => {
            validate_non_blank(embedding_kind, "embedding_kind")
        }
        ImprovementVectorKind::ParashaktiLensLoRARefinement { lens_id } => {
            validate_lens_id(*lens_id)
        }
        ImprovementVectorKind::ParashaktiNewEdgeTypeIntegration { edge_type } => {
            validate_non_blank(edge_type, "edge_type")
        }
        ImprovementVectorKind::MahamayaSymbolicProgramPromotion { program_id } => {
            validate_non_blank(program_id, "program_id")
        }
        ImprovementVectorKind::MahamayaPathwayPatternIntegration { pattern } => {
            validate_non_blank(pattern, "pattern")
        }
        ImprovementVectorKind::NaraVoiceDriftCorrection { drift_kind } => {
            validate_non_blank(drift_kind, "drift_kind")
        }
        ImprovementVectorKind::NaraRegisterExtension { register } => {
            validate_non_blank(register, "register")
        }
        ImprovementVectorKind::EpiiSpineMechanismRefinement { spine_phase } => {
            validate_non_blank(spine_phase, "spine_phase")
        }
        ImprovementVectorKind::EpiiPedagogyRegisterUpdate { depth } => {
            validate_non_blank(depth, "depth")
        }
        ImprovementVectorKind::EpiiAgentConfigurationUpdate { agent, scope } => {
            validate_non_blank(agent, "agent")?;
            validate_non_blank(scope, "scope")
        }
        ImprovementVectorKind::AnuttaraShapeRefinement
        | ImprovementVectorKind::ParamasivaSyntheticProofValidation
        | ImprovementVectorKind::ParamasivaRetrievalGapFilling
        | ImprovementVectorKind::ParashaktiKleinHandlingRefinement
        | ImprovementVectorKind::MahamayaProcessRewardRefinement
        | ImprovementVectorKind::MahamayaFederatedRoundExecution
        | ImprovementVectorKind::NaraDialogueCorpusAddition
        | ImprovementVectorKind::NaraDPORefinement
        | ImprovementVectorKind::EpiiVoiceCanonRefinement => Ok(()),
    }
}

fn validate_lens_id(lens_id: u8) -> Result<(), String> {
    if (1..=12).contains(&lens_id) {
        Ok(())
    } else {
        Err("lens_id must be in 1..=12".to_owned())
    }
}

fn validate_non_blank(value: &str, label: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{label} is required"))
    } else {
        Ok(())
    }
}
