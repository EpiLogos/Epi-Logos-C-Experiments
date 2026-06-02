use std::fs;
use std::path::Path;

use epi_s5_epii_review_core::ReviewHistory;
use serde::{Deserialize, Serialize};

use crate::spine::{
    ClosureKind, ContentTypeRegister, ImprovementVectorKind, M2AddressViews, M2CymaticSignature,
    M2ElementalMediumFrame, M2M3ProjectionEvidence, M2MaqamModeFrame, M2MefSemanticFrame,
    M2PlanetaryChakralFrame, M2PrimeMeaningPacket, M2ProvenanceRef, M2SacredSonicFrame,
    ObservationEvidence,
};
use crate::{
    ArtifactRef, ImprovementCandidate, ImprovementStore, ProposeRequest, SensitivityClass,
    SurfaceActor, SurfacedCandidateReceipt, SurfacingPipelineId, TargetSubsystem,
};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "adapter")]
pub enum NonAletheiaPipelineReport {
    AnuttaraShaclFailure(AnuttaraShaclFailureReport),
    ParamasivaCorpusRefresh(ParamasivaCorpusRefreshReport),
    ParashaktiEmbeddingDrift(ParashaktiEmbeddingDriftReport),
    ParashaktiMeaningPacketProfile(ParashaktiMeaningPacketProfileReport),
    MahamayaRuntimeTraining(MahamayaRuntimeTrainingReport),
    NaraDialogicVoiceSignal(NaraDialogicVoiceSignalReport),
    EpiiSelfObservation(EpiiSelfObservationReport),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AnuttaraShaclFailureReport {
    pub report_uri: String,
    pub shape_id: String,
    pub severity: String,
    pub failing_focus_nodes: Vec<String>,
    pub message: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParashaktiEmbeddingDriftReport {
    pub report_uri: String,
    pub embedding_kind: String,
    pub metric_name: String,
    pub current_value: f64,
    pub minimum_acceptable_value: f64,
    pub window_id: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParashaktiMeaningPacketProfileReport {
    pub profile_uri: String,
    pub profile: serde_json::Value,
    pub s2_graph_law_uri: String,
    pub kerykeion_context_uri: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParamasivaCorpusRefreshReport {
    pub manifest_uri: String,
    pub corpus_segment: String,
    pub retrieval_metric_name: String,
    pub current_metric_value: f64,
    pub maximum_acceptable_value: f64,
    pub new_derivational_tokens: usize,
    pub synthetic_proof_review_uri: String,
    pub gds_augmentation_uri: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MahamayaRuntimeTier {
    Sandbox,
    FederatedAggregate,
    GeneticProgram,
    RewardModel,
    RuntimePolicy,
    PathwayTemplate,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MahamayaRuntimeTrainingReport {
    pub report_uri: String,
    pub training_round_id: String,
    pub tier: MahamayaRuntimeTier,
    pub reward_metric_name: String,
    pub current_reward_score: f64,
    pub minimum_reward_score: f64,
    pub pathway_diversity_score: f64,
    pub minimum_pathway_diversity: f64,
    pub rollback_handle: String,
    pub integration_impact_uri: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NaraDialogicVoiceSignalReport {
    pub report_uri: String,
    pub consent_handle: String,
    pub sample_count: usize,
    pub quality_score: f64,
    pub quality_threshold: f64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub drift_kind: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub new_register: Option<String>,
    #[serde(default)]
    pub systematic_feedback_count: usize,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EpiiSelfObservationReport {
    pub report_uri: String,
    pub event_kind: EpiiSelfObservationKind,
    pub summary: String,
    pub severity: String,
    pub observed_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub related_review_item_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub related_orchestration_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fingerprint: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EpiiSelfObservationKind {
    ReviewInconsistency,
    ReviewTimeGrowth,
    VoiceArticulationDrift,
    SpineSelfObservation,
}

impl ImprovementStore {
    pub fn surface_non_aletheia_report_file(
        &self,
        path: impl AsRef<Path>,
    ) -> Result<Option<SurfacedCandidateReceipt>, String> {
        let path = path.as_ref();
        let contents =
            fs::read_to_string(path).map_err(|err| format!("{}: {err}", path.display()))?;
        let report: NonAletheiaPipelineReport =
            serde_json::from_str(&contents).map_err(|err| format!("{}: {err}", path.display()))?;
        self.surface_non_aletheia_report(report)
    }

    pub fn surface_non_aletheia_report(
        &self,
        report: NonAletheiaPipelineReport,
    ) -> Result<Option<SurfacedCandidateReceipt>, String> {
        let candidate = match report {
            NonAletheiaPipelineReport::AnuttaraShaclFailure(report) => {
                Some(candidate_from_anuttara_shacl(report)?)
            }
            NonAletheiaPipelineReport::ParamasivaCorpusRefresh(report) => {
                candidate_from_paramasiva_corpus_refresh(report)?
            }
            NonAletheiaPipelineReport::ParashaktiEmbeddingDrift(report) => {
                candidate_from_parashakti_drift(report)?
            }
            NonAletheiaPipelineReport::ParashaktiMeaningPacketProfile(report) => {
                Some(candidate_from_parashakti_meaning_packet(report)?)
            }
            NonAletheiaPipelineReport::MahamayaRuntimeTraining(report) => {
                candidate_from_mahamaya_runtime_training(report)?
            }
            NonAletheiaPipelineReport::NaraDialogicVoiceSignal(report) => {
                candidate_from_nara_signal(report)?
            }
            NonAletheiaPipelineReport::EpiiSelfObservation(report) => {
                Some(candidate_from_epii_self_observation(report)?)
            }
        };
        candidate
            .map(|candidate| self.surface_candidate(candidate))
            .transpose()
    }

    pub fn surface_epii_review_inconsistency_from_history(
        &self,
        history: &ReviewHistory,
        report_uri: impl Into<String>,
        observed_at_ms: u128,
    ) -> Result<Option<SurfacedCandidateReceipt>, String> {
        let observed_at_ms = u64::try_from(observed_at_ms)
            .map_err(|_| "observed_at_ms does not fit report-file timestamp range".to_owned())?;
        let deferred = history
            .items
            .iter()
            .filter(|item| format!("{:?}", item.status) == "Deferred")
            .count();
        let rejected = history
            .resolutions
            .iter()
            .filter(|resolution| format!("{:?}", resolution.decision) == "Reject")
            .count();
        if deferred + rejected < 2 {
            return Ok(None);
        }
        self.surface_non_aletheia_report(NonAletheiaPipelineReport::EpiiSelfObservation(
            EpiiSelfObservationReport {
                report_uri: report_uri.into(),
                event_kind: EpiiSelfObservationKind::ReviewInconsistency,
                summary: format!(
                    "Review history shows {deferred} deferred and {rejected} rejected gates; Epii should inspect review consistency before further promotion."
                ),
                severity: "recursive_review".to_owned(),
                observed_at_ms,
                related_review_item_id: history.items.first().map(|item| item.item_id.clone()),
                related_orchestration_id: None,
                fingerprint: Some(format!("epii-review-inconsistency:{deferred}:{rejected}")),
            },
        ))
    }
}

fn candidate_from_anuttara_shacl(
    report: AnuttaraShaclFailureReport,
) -> Result<ImprovementCandidate, String> {
    require_non_blank(&report.report_uri, "report_uri")?;
    require_non_blank(&report.shape_id, "shape_id")?;
    if report.failing_focus_nodes.is_empty() {
        return Err("failing_focus_nodes is required".to_owned());
    }
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M0/Anuttara".to_owned(),
            direction: format!(
                "Investigate repeated SHACL failure for {}: {}",
                report.shape_id, report.message
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.report_uri.clone(),
                coordinate: Some("M0/Anuttara".to_owned()),
                kind: Some("shacl_failure_report".to_owned()),
            },
        },
        TargetSubsystem::Anuttara,
        ImprovementVectorKind::AnuttaraAxiomElaboration {
            axiom_class: report.shape_id.clone(),
        },
        SurfacingPipelineId::AnuttaraConstruction,
        ObservationEvidence {
            source_uri: report.report_uri.clone(),
            summary: format!(
                "{} SHACL failure {} affected {} focus nodes",
                report.severity,
                report.shape_id,
                report.failing_focus_nodes.len()
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "anuttara-shacl:{}:{}",
                    report.shape_id,
                    report.failing_focus_nodes.join("|")
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Epii,
        SensitivityClass::RequiresReview,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(candidate)
}

fn candidate_from_parashakti_drift(
    report: ParashaktiEmbeddingDriftReport,
) -> Result<Option<ImprovementCandidate>, String> {
    require_non_blank(&report.report_uri, "report_uri")?;
    require_non_blank(&report.embedding_kind, "embedding_kind")?;
    require_non_blank(&report.metric_name, "metric_name")?;
    require_non_blank(&report.window_id, "window_id")?;
    if report.current_value >= report.minimum_acceptable_value {
        return Ok(None);
    }
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M2/Parashakti".to_owned(),
            direction: format!(
                "Refresh {} embeddings because {} dropped to {:.4} below {:.4} in {}",
                report.embedding_kind,
                report.metric_name,
                report.current_value,
                report.minimum_acceptable_value,
                report.window_id
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.report_uri.clone(),
                coordinate: Some("M2/Parashakti".to_owned()),
                kind: Some("embedding_metric_drift_report".to_owned()),
            },
        },
        TargetSubsystem::Parashakti,
        ImprovementVectorKind::ParashaktiEmbeddingRefresh {
            embedding_kind: report.embedding_kind.clone(),
        },
        SurfacingPipelineId::ParashaktiRelational,
        ObservationEvidence {
            source_uri: report.report_uri.clone(),
            summary: format!(
                "{}={:.4} below threshold {:.4}; metric evidence preserved in {}",
                report.metric_name,
                report.current_value,
                report.minimum_acceptable_value,
                report.window_id
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "parashakti-drift:{}:{}:{}",
                    report.embedding_kind, report.metric_name, report.window_id
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Epii,
        SensitivityClass::RequiresReview,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(Some(candidate))
}

fn candidate_from_parashakti_meaning_packet(
    report: ParashaktiMeaningPacketProfileReport,
) -> Result<ImprovementCandidate, String> {
    require_non_blank(&report.profile_uri, "profile_uri")?;
    require_non_blank(&report.s2_graph_law_uri, "s2_graph_law_uri")?;
    require_non_blank(&report.kerykeion_context_uri, "kerykeion_context_uri")?;
    let packet = meaning_packet_from_profile(&report)?;
    let profile_id = packet.source_profile_id.clone();
    let index72 = packet.index72;
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M2/Parashakti".to_owned(),
            direction: format!(
                "Surface M2PrimeMeaningPacket for profile {profile_id} at index72 {index72} without renderer-local derivation"
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.profile_uri.clone(),
                coordinate: Some("M2/Parashakti".to_owned()),
                kind: Some("m2_prime_meaning_packet_profile".to_owned()),
            },
        },
        TargetSubsystem::Parashakti,
        ImprovementVectorKind::ParashaktiMeaningPacketSurface { profile_id },
        SurfacingPipelineId::ParashaktiRelational,
        ObservationEvidence {
            source_uri: report.profile_uri.clone(),
            summary: format!(
                "M2PrimeMeaningPacket index72={} lens={} mode={} ratio={} s2_provenance={}",
                packet.index72,
                packet.address_views.lens_anchor,
                packet.maqam_mode_frame.mode,
                packet.cymatic_signature.ratio_role,
                report.s2_graph_law_uri
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "parashakti-meaning-packet:{}:{}",
                    packet.source_profile_id, packet.index72
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Epii,
        SensitivityClass::PublicCurrent,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    candidate.m2_meaning_packet = Some(packet);
    candidate.validate()?;
    Ok(candidate)
}

fn candidate_from_paramasiva_corpus_refresh(
    report: ParamasivaCorpusRefreshReport,
) -> Result<Option<ImprovementCandidate>, String> {
    require_non_blank(&report.manifest_uri, "manifest_uri")?;
    require_non_blank(&report.corpus_segment, "corpus_segment")?;
    require_non_blank(&report.retrieval_metric_name, "retrieval_metric_name")?;
    require_non_blank(
        &report.synthetic_proof_review_uri,
        "synthetic_proof_review_uri",
    )?;
    require_non_blank(&report.gds_augmentation_uri, "gds_augmentation_uri")?;
    let has_metric_drift = report.current_metric_value > report.maximum_acceptable_value;
    let has_corpus_growth = report.new_derivational_tokens > 0;
    if !(has_metric_drift || has_corpus_growth) {
        return Ok(None);
    }
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M1/Paramasiva".to_owned(),
            direction: format!(
                "Review Paramasiva corpus refresh for {} with {}={:.4} against {:.4}",
                report.corpus_segment,
                report.retrieval_metric_name,
                report.current_metric_value,
                report.maximum_acceptable_value
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.manifest_uri.clone(),
                coordinate: Some("M1/Paramasiva".to_owned()),
                kind: Some("paramasiva_corpus_manifest".to_owned()),
            },
        },
        TargetSubsystem::Paramasiva,
        if has_corpus_growth {
            ImprovementVectorKind::ParamasivaCorpusAddition {
                corpus_segment: report.corpus_segment.clone(),
            }
        } else {
            ImprovementVectorKind::ParamasivaRetrievalGapFilling
        },
        SurfacingPipelineId::ParamasivaDerivational,
        ObservationEvidence {
            source_uri: report.manifest_uri.clone(),
            summary: format!(
                "{}={:.4} max {:.4}; new_derivational_tokens={}; synthetic_proof={}",
                report.retrieval_metric_name,
                report.current_metric_value,
                report.maximum_acceptable_value,
                report.new_derivational_tokens,
                report.synthetic_proof_review_uri
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "paramasiva-corpus:{}:{}",
                    report.corpus_segment, report.observed_at_ms
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Sophia,
        SensitivityClass::RequiresReview,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(Some(candidate))
}

fn candidate_from_mahamaya_runtime_training(
    report: MahamayaRuntimeTrainingReport,
) -> Result<Option<ImprovementCandidate>, String> {
    require_non_blank(&report.report_uri, "report_uri")?;
    require_non_blank(&report.training_round_id, "training_round_id")?;
    require_non_blank(&report.reward_metric_name, "reward_metric_name")?;
    require_non_blank(&report.rollback_handle, "rollback_handle")?;
    require_non_blank(&report.integration_impact_uri, "integration_impact_uri")?;
    let has_reward_drift = report.current_reward_score < report.minimum_reward_score;
    let has_diversity_drift = report.pathway_diversity_score < report.minimum_pathway_diversity;
    if !(has_reward_drift || has_diversity_drift) {
        return Ok(None);
    }
    let vector_kind = match report.tier {
        MahamayaRuntimeTier::FederatedAggregate => {
            ImprovementVectorKind::MahamayaFederatedRoundExecution
        }
        MahamayaRuntimeTier::GeneticProgram => {
            ImprovementVectorKind::MahamayaSymbolicProgramPromotion {
                program_id: report.training_round_id.clone(),
            }
        }
        MahamayaRuntimeTier::PathwayTemplate => {
            ImprovementVectorKind::MahamayaPathwayPatternIntegration {
                pattern: report.training_round_id.clone(),
            }
        }
        MahamayaRuntimeTier::Sandbox
        | MahamayaRuntimeTier::RewardModel
        | MahamayaRuntimeTier::RuntimePolicy => {
            ImprovementVectorKind::MahamayaProcessRewardRefinement
        }
    };
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M3/Mahamaya".to_owned(),
            direction: format!(
                "Review Mahamaya {:?} runtime learning update {} with rollback {}",
                report.tier, report.training_round_id, report.rollback_handle
            ),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.report_uri.clone(),
                coordinate: Some("M3/Mahamaya".to_owned()),
                kind: Some("mahamaya_runtime_training_report".to_owned()),
            },
        },
        TargetSubsystem::Mahamaya,
        vector_kind,
        SurfacingPipelineId::MahamayaCalculation,
        ObservationEvidence {
            source_uri: report.report_uri.clone(),
            summary: format!(
                "{}={:.4} min {:.4}; pathway_diversity={:.4} min {:.4}; rollback={}",
                report.reward_metric_name,
                report.current_reward_score,
                report.minimum_reward_score,
                report.pathway_diversity_score,
                report.minimum_pathway_diversity,
                report.rollback_handle
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "mahamaya-runtime:{:?}:{}",
                    report.tier, report.training_round_id
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Sophia,
        SensitivityClass::RequiresReview,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(Some(candidate))
}

fn candidate_from_nara_signal(
    report: NaraDialogicVoiceSignalReport,
) -> Result<Option<ImprovementCandidate>, String> {
    require_non_blank(&report.report_uri, "report_uri")?;
    require_non_blank(&report.consent_handle, "consent_handle")?;
    let has_quality_failure = report.quality_score < report.quality_threshold;
    let has_material_signal = report
        .drift_kind
        .as_deref()
        .is_some_and(|value| !value.trim().is_empty())
        || report
            .new_register
            .as_deref()
            .is_some_and(|value| !value.trim().is_empty())
        || report.systematic_feedback_count > 0;
    if !(has_quality_failure && has_material_signal) {
        return Ok(None);
    }
    let vector_kind = if let Some(register) = report.new_register.clone() {
        ImprovementVectorKind::NaraRegisterExtension { register }
    } else if let Some(drift_kind) = report.drift_kind.clone() {
        ImprovementVectorKind::NaraVoiceDriftCorrection { drift_kind }
    } else {
        ImprovementVectorKind::NaraDPORefinement
    };
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "M".to_owned(),
            target_coordinate: "M4/Nara".to_owned(),
            direction: "Review protected Nara dialogic voice signal through Anima-primary gate"
                .to_owned(),
            source_review_item_id: None,
            baseline: ArtifactRef {
                path: report.consent_handle.clone(),
                coordinate: Some("M4/Nara".to_owned()),
                kind: Some("protected_nara_consent_handle".to_owned()),
            },
        },
        TargetSubsystem::Nara,
        vector_kind,
        SurfacingPipelineId::NaraDialogic,
        ObservationEvidence {
            source_uri: report.consent_handle.clone(),
            summary: format!(
                "Protected Nara signal quality {:.4} below {:.4}; samples={}, systematic_feedback={}",
                report.quality_score,
                report.quality_threshold,
                report.sample_count,
                report.systematic_feedback_count
            ),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!("nara-dialogic:{}:{}", report.consent_handle, report.observed_at_ms)
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Anima,
        SensitivityClass::ProtectedLocal,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(Some(candidate))
}

fn candidate_from_epii_self_observation(
    report: EpiiSelfObservationReport,
) -> Result<ImprovementCandidate, String> {
    require_non_blank(&report.report_uri, "report_uri")?;
    require_non_blank(&report.summary, "summary")?;
    let mut candidate = ImprovementCandidate::from_propose(
        ProposeRequest {
            target_family: "S".to_owned(),
            target_coordinate: "S5/Epii".to_owned(),
            direction: format!("Inspect Epii-on-Epii self-observation: {}", report.summary),
            source_review_item_id: report.related_review_item_id.clone(),
            baseline: ArtifactRef {
                path: report.report_uri.clone(),
                coordinate: Some("S5/Epii".to_owned()),
                kind: Some("epii_self_observation_report".to_owned()),
            },
        },
        TargetSubsystem::Epii,
        ImprovementVectorKind::EpiiSpineMechanismRefinement {
            spine_phase: format!("{:?}", report.event_kind),
        },
        SurfacingPipelineId::EpiiOnEpiiMeta,
        ObservationEvidence {
            source_uri: report.report_uri.clone(),
            summary: format!("{}: {}", report.severity, report.summary),
            observed_at: Some(u128::from(report.observed_at_ms)),
            fingerprint: Some(report.fingerprint.unwrap_or_else(|| {
                format!(
                    "epii-self:{:?}:{}",
                    report.event_kind, report.observed_at_ms
                )
            })),
        },
        u128::from(report.observed_at_ms),
        SurfaceActor::Epii,
        SensitivityClass::RequiresReview,
    )?;
    candidate.closure_kind = ClosureKind::Rehear;
    candidate.ct_register = ContentTypeRegister::CT4b;
    Ok(candidate)
}

fn meaning_packet_from_profile(
    report: &ParashaktiMeaningPacketProfileReport,
) -> Result<M2PrimeMeaningPacket, String> {
    let profile = &report.profile;
    let source_profile_id = required_string(profile, "/profileId")?;
    let index72 = required_u8(profile, "/resonance72/index72", 71)?;
    Ok(M2PrimeMeaningPacket {
        source_profile_id: source_profile_id.clone(),
        index72,
        address_views: M2AddressViews {
            legacy_resonance_index: required_u8(profile, "/resonance72/legacyResonanceIndex", 71)?,
            lens_anchor_index: required_u8(profile, "/resonance72/lensAnchorIndex", 11)?,
            lens_anchor: required_string(profile, "/resonance72/lensAnchor")?,
            position: required_u8(profile, "/resonance72/position", 5)?,
            helix_bit: required_u8(profile, "/resonance72/helixBit", 1)?,
            phase: required_string(profile, "/resonance72/phase")?,
        },
        mef_semantic_frame: M2MefSemanticFrame {
            lens_mode_lens: required_u8(profile, "/lensMode/lens", 11)?,
            lens_mode_mode: required_string(profile, "/lensMode/mode")?,
            vak_register: required_string(profile, "/diatonic/vakRegister")?,
            klein_flip_state: required_bool(profile, "/kleinFlipState")?,
        },
        elemental_medium_frame: M2ElementalMediumFrame {
            p_position_element: required_string(profile, "/elements/pPositionElement")?,
            l2_prime_element: required_string(profile, "/elements/l2PrimeElement")?,
        },
        planetary_chakral_frame: M2PlanetaryChakralFrame {
            body_id: required_string(profile, "/planetaryChakral/bodyId")?,
            centre_id: required_string(profile, "/planetaryChakral/centreId")?,
            chakra_role: required_string(profile, "/planetaryChakral/chakraRole")?,
            element: required_string(profile, "/planetaryChakral/element")?,
            musical_role: required_string(profile, "/planetaryChakral/musicalRole")?,
            ratio_role: required_string(profile, "/planetaryChakral/ratioRole")?,
            mode_scale_colour: required_string(profile, "/planetaryChakral/modeScaleColour")?,
            provenance: required_string(profile, "/planetaryChakral/provenance")?,
            configurability_status: required_string(
                profile,
                "/planetaryChakral/configurabilityStatus",
            )?,
        },
        sacred_sonic_frame: M2SacredSonicFrame {
            shem_name: required_string(profile, "/sacredSonic/shemName")?,
            asma_name: required_string(profile, "/sacredSonic/asmaName")?,
            mantra: required_string(profile, "/sacredSonic/mantra")?,
            decan_face: required_string(profile, "/sacredSonic/decanFace")?,
        },
        maqam_mode_frame: M2MaqamModeFrame {
            family: required_string(profile, "/maqamMode/family")?,
            mode: required_string(profile, "/maqamMode/mode")?,
            tuning_path: required_string(profile, "/maqamMode/tuningPath")?,
            diatonic_note: required_string(profile, "/diatonic/note")?,
            diatonic_degree: required_u8(profile, "/diatonic/degree", 7)?,
            diatonic_mode: required_string(profile, "/diatonic/mode")?,
        },
        cymatic_signature: M2CymaticSignature {
            audio_octet: required_f64_array_8(profile, "/harmonic/audio_octet")?,
            nodal_quartet: required_f64_array_4(profile, "/harmonic/nodal_quartet")?,
            ratio_role: required_string(profile, "/harmonic/ratio_role")?,
            bus_source: "M2-1' Vimarsha shared profile bus".to_owned(),
        },
        m3_projection_evidence: M2M3ProjectionEvidence {
            det_index64: required_u8(profile, "/m3Projection/detIndex64", 63)?,
            compression_law: "72x8/9=64".to_owned(),
            evidence_uri: required_string(profile, "/m3Projection/evidenceUri")?,
        },
        provenance: vec![
            M2ProvenanceRef {
                source: "profile".to_owned(),
                uri: report.profile_uri.clone(),
                status: "live_runtime_payload".to_owned(),
            },
            M2ProvenanceRef {
                source: "s2_graph_law".to_owned(),
                uri: report.s2_graph_law_uri.clone(),
                status: "canonical_correspondence_authority".to_owned(),
            },
            M2ProvenanceRef {
                source: "kerykeion".to_owned(),
                uri: report.kerykeion_context_uri.clone(),
                status: "time_keyed_context".to_owned(),
            },
        ],
        pending_fields: Vec::new(),
    })
}

fn require_non_blank(value: &str, label: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{label} is required"))
    } else {
        Ok(())
    }
}

fn required_string(value: &serde_json::Value, pointer: &str) -> Result<String, String> {
    let string = value
        .pointer(pointer)
        .and_then(serde_json::Value::as_str)
        .ok_or_else(|| format!("profile field {pointer} is required"))?;
    require_non_blank(string, pointer)?;
    Ok(string.to_owned())
}

fn required_bool(value: &serde_json::Value, pointer: &str) -> Result<bool, String> {
    value
        .pointer(pointer)
        .and_then(serde_json::Value::as_bool)
        .ok_or_else(|| format!("profile field {pointer} is required"))
}

fn required_u8(value: &serde_json::Value, pointer: &str, max: u8) -> Result<u8, String> {
    let number = value
        .pointer(pointer)
        .and_then(serde_json::Value::as_u64)
        .ok_or_else(|| format!("profile field {pointer} is required"))?;
    let narrowed =
        u8::try_from(number).map_err(|_| format!("profile field {pointer} exceeds u8"))?;
    if narrowed > max {
        return Err(format!("profile field {pointer} must be <= {max}"));
    }
    Ok(narrowed)
}

fn required_f64_array_8(value: &serde_json::Value, pointer: &str) -> Result<[f64; 8], String> {
    let values = required_f64_vec(value, pointer, 8)?;
    Ok([
        values[0], values[1], values[2], values[3], values[4], values[5], values[6], values[7],
    ])
}

fn required_f64_array_4(value: &serde_json::Value, pointer: &str) -> Result<[f64; 4], String> {
    let values = required_f64_vec(value, pointer, 4)?;
    Ok([values[0], values[1], values[2], values[3]])
}

fn required_f64_vec(
    value: &serde_json::Value,
    pointer: &str,
    len: usize,
) -> Result<Vec<f64>, String> {
    let values = value
        .pointer(pointer)
        .and_then(serde_json::Value::as_array)
        .ok_or_else(|| format!("profile field {pointer} is required"))?;
    if values.len() != len {
        return Err(format!("profile field {pointer} must contain {len} values"));
    }
    values
        .iter()
        .map(|value| {
            value
                .as_f64()
                .ok_or_else(|| format!("profile field {pointer} must contain numbers"))
        })
        .collect()
}
