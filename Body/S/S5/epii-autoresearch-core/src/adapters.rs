use std::fs;
use std::path::Path;

use epi_s5_epii_review_core::ReviewHistory;
use serde::{Deserialize, Serialize};

use crate::spine::{ClosureKind, ContentTypeRegister, ImprovementVectorKind, ObservationEvidence};
use crate::{
    ArtifactRef, ImprovementCandidate, ImprovementStore, ProposeRequest, SensitivityClass,
    SurfaceActor, SurfacedCandidateReceipt, SurfacingPipelineId, TargetSubsystem,
};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "adapter")]
pub enum NonAletheiaPipelineReport {
    AnuttaraShaclFailure(AnuttaraShaclFailureReport),
    ParashaktiEmbeddingDrift(ParashaktiEmbeddingDriftReport),
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
            NonAletheiaPipelineReport::ParashaktiEmbeddingDrift(report) => {
                candidate_from_parashakti_drift(report)?
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

fn require_non_blank(value: &str, label: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{label} is required"))
    } else {
        Ok(())
    }
}
