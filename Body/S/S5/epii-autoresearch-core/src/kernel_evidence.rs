//! Kernel-evidence value types and their public-projection constructors.
//!
//! Split out of `lib.rs` per S5-ARCHITECTURE.md §5.1 finding F2. The validators
//! these constructors rely on (`validate_public_kernel_projection`, `parse_f64`,
//! `required_str`, `required_u64`, `validate_kernel_trajectory`) remain in the
//! crate root and are reached here via `crate::`.

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    parse_f64, required_str, required_u64, validate_kernel_trajectory,
    validate_public_kernel_projection, KERNEL_EVIDENCE_COMPUTATION_SOURCE, KERNEL_EVIDENCE_PRIVACY,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidenceSnapshot {
    pub generation: u64,
    pub phase: String,
    pub element: String,
    pub harmonic_ratio: String,
    pub pulse_ratio: String,
    pub total_energy: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidenceDelta {
    pub energy_delta: String,
    pub harmonic_changed: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resonance_delta: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelEvidence {
    pub baseline: KernelEvidenceSnapshot,
    pub challenger: KernelEvidenceSnapshot,
    pub delta: KernelEvidenceDelta,
    pub privacy: String,
    pub computation_source: String,
    pub advisory_only: bool,
    pub interpretation_boundary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub trajectory: Option<KernelTrajectoryRef>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelTrajectoryRef {
    pub session_key: String,
    pub day_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub now_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacetimedb_session_surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacetimedb_global_surface: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub graphiti_arc_id: Option<String>,
}

impl KernelEvidence {
    pub fn from_public_projections(
        baseline: &Value,
        challenger: &Value,
        resonance_delta: Option<String>,
        interpretation_boundary: impl Into<String>,
    ) -> Result<Self, String> {
        validate_public_kernel_projection(baseline)?;
        validate_public_kernel_projection(challenger)?;

        let baseline = KernelEvidenceSnapshot::from_public_projection(baseline)?;
        let challenger = KernelEvidenceSnapshot::from_public_projection(challenger)?;
        let energy_delta = format!(
            "{:.6}",
            parse_f64(&challenger.total_energy, "challenger totalEnergy")?
                - parse_f64(&baseline.total_energy, "baseline totalEnergy")?
        );
        let harmonic_changed = baseline.phase != challenger.phase
            || baseline.element != challenger.element
            || baseline.harmonic_ratio != challenger.harmonic_ratio
            || baseline.pulse_ratio != challenger.pulse_ratio;
        let interpretation_boundary = interpretation_boundary.into();
        if interpretation_boundary.trim().is_empty() {
            return Err("kernel evidence interpretation_boundary is required".to_owned());
        }

        Ok(Self {
            baseline,
            challenger,
            delta: KernelEvidenceDelta {
                energy_delta,
                harmonic_changed,
                resonance_delta,
            },
            privacy: KERNEL_EVIDENCE_PRIVACY.to_owned(),
            computation_source: KERNEL_EVIDENCE_COMPUTATION_SOURCE.to_owned(),
            advisory_only: true,
            interpretation_boundary,
            trajectory: None,
        })
    }

    pub fn with_trajectory(mut self, trajectory: KernelTrajectoryRef) -> Result<Self, String> {
        validate_kernel_trajectory(&trajectory)?;
        self.trajectory = Some(trajectory);
        Ok(self)
    }
}

impl KernelEvidenceSnapshot {
    fn from_public_projection(value: &Value) -> Result<Self, String> {
        let ratio_num = required_u64(value, "/harmonicPulse/ratioNum")?;
        let ratio_den = required_u64(value, "/harmonicPulse/ratioDen")?;
        Ok(Self {
            generation: required_u64(value, "/generation")?,
            phase: required_str(value, "/tick/phase")?.to_owned(),
            element: required_str(value, "/tick/element")?.to_owned(),
            harmonic_ratio: required_str(value, "/tick/harmonicRatio")?.to_owned(),
            pulse_ratio: format!("{ratio_num}/{ratio_den}"),
            total_energy: required_str(value, "/energy/totalEnergy")?.to_owned(),
        })
    }
}
