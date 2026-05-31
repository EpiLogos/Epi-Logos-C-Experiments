//! The unified `KernelTickEnvelope` — what every surface (gateway,
//! portal, deposit, render) carries to describe one operational tick.
//!
//! The envelope intentionally subsumes the existing
//! [`KernelTemporalProjection`] (tick, harmonic pulse, energy) and adds
//! the optional shapes the matheme's 3:3 split requires: resonance
//! vectors, physical-pole snapshot, mental-pole snapshot, trajectory
//! deposit reference, and Anuttara diagnostic.
//!
//! Optionality is load-bearing: at present the physical-pole render
//! stack (Tauri/Bevy) and the EBM/Verifier rings are partial, so most
//! ticks will carry `Option::None` for those fields. The envelope type
//! is the explicit boundary that says *what would be there once it is
//! computed*, and it round-trips through serde without losing the
//! optional shape.

use serde::{Deserialize, Serialize};

use portal_core::{
    BioQuaternionState, EnergyDecomposition, HarmonicPulse, KernelProjection,
    KernelResonanceObservation, KernelTemporalProjection, KernelTick, ResonanceVector72,
    TRITONE_SQUARES,
};

use crate::deposit::TrajectoryDepositRef;
use crate::diagnostic::AnuttaraDiagnostic;
use crate::poles::{MentalPoleState, PhysicalPoleState};

/// Canonical coordinate owner for the kernel-tick envelope, matching
/// `KernelTemporalProjection::COORDINATE_OWNER`.
pub const ENVELOPE_COORDINATE_OWNER: &str = "S0/QL-meta";

/// Canonical projection owner for the envelope. `S3'` is the temporal
/// context surface that publishes the envelope into session and global
/// projections.
pub const ENVELOPE_PROJECTION_OWNER: &str = "S3'";

/// Privacy class used by `KernelTemporalProjection` and inherited here.
pub const ENVELOPE_PRIVACY_CLASS: &str = "safe-public-current-kernel-tick";

/// The canonical computation source — `portal-core::KernelProjection`
/// remains the algebra surface that produced the tick.
pub const ENVELOPE_COMPUTATION_SOURCE: &str = "portal-core::KernelProjection";

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct KernelTickEnvelope {
    pub coordinate_owner: String,
    pub projection_owner: String,
    pub privacy: String,
    pub computation_source: String,
    pub generation: u64,

    pub tick: KernelTick,
    pub harmonic_pulse: HarmonicPulse,
    pub bioquaternion: BioQuaternionState,
    pub energy: EnergyDecomposition,
    pub resonance_square_emphasis: [f32; TRITONE_SQUARES],

    /// The resonance vector observed at this tick (e.g., from EBM
    /// forward pass). `None` until the EBM ring is live.
    pub observed_resonance: Option<ResonanceVector72>,

    /// The target resonance vector for the engaged coordinate (the
    /// coordinate's accumulated `targetResonanceVector` per mental-pole
    /// mechanics §2). `None` until the coordinate has accumulated
    /// contributions.
    pub target_resonance: Option<ResonanceVector72>,

    pub physical_pole: Option<PhysicalPoleState>,
    pub mental_pole: Option<MentalPoleState>,

    pub trajectory_deposit: Option<TrajectoryDepositRef>,
    pub anuttara_diagnostic: Option<AnuttaraDiagnostic>,

    pub session_key: Option<String>,
    pub source_coordinate: Option<String>,
}

impl KernelTickEnvelope {
    pub fn from_kernel_projection(generation: u64, projection: &KernelProjection) -> Self {
        Self {
            coordinate_owner: ENVELOPE_COORDINATE_OWNER.to_owned(),
            projection_owner: ENVELOPE_PROJECTION_OWNER.to_owned(),
            privacy: ENVELOPE_PRIVACY_CLASS.to_owned(),
            computation_source: ENVELOPE_COMPUTATION_SOURCE.to_owned(),
            generation,
            tick: projection.tick,
            harmonic_pulse: projection.harmonic_pulse,
            bioquaternion: projection.bioquaternion.clone(),
            energy: projection.energy,
            resonance_square_emphasis: projection.resonance_square_emphasis,
            observed_resonance: None,
            target_resonance: None,
            physical_pole: None,
            mental_pole: None,
            trajectory_deposit: None,
            anuttara_diagnostic: None,
            session_key: None,
            source_coordinate: None,
        }
    }

    pub fn with_session_key(mut self, session_key: impl Into<String>) -> Self {
        self.session_key = Some(session_key.into());
        self
    }

    pub fn with_source_coordinate(mut self, coord: impl Into<String>) -> Self {
        self.source_coordinate = Some(coord.into());
        self
    }

    pub fn with_observed_resonance(mut self, resonance: ResonanceVector72) -> Self {
        self.observed_resonance = Some(resonance);
        self
    }

    pub fn with_target_resonance(mut self, resonance: ResonanceVector72) -> Self {
        self.target_resonance = Some(resonance);
        self
    }

    pub fn with_physical_pole(mut self, state: PhysicalPoleState) -> Self {
        self.physical_pole = Some(state);
        self
    }

    pub fn with_mental_pole(mut self, state: MentalPoleState) -> Self {
        self.mental_pole = Some(state);
        self
    }

    pub fn with_trajectory_deposit(mut self, deposit_ref: TrajectoryDepositRef) -> Self {
        self.trajectory_deposit = Some(deposit_ref);
        self
    }

    pub fn with_anuttara_diagnostic(mut self, diag: AnuttaraDiagnostic) -> Self {
        self.anuttara_diagnostic = Some(diag);
        self
    }

    /// Project this envelope to the legacy `KernelTemporalProjection`
    /// already used by `s3'.temporal.context` and the Tauri TS mirror.
    /// This is the bridge that keeps existing consumers working while
    /// new consumers migrate to the typed envelope.
    pub fn to_temporal_projection(&self) -> KernelTemporalProjection {
        let projection = KernelProjection {
            tick: self.tick,
            harmonic_pulse: self.harmonic_pulse,
            bioquaternion: self.bioquaternion.clone(),
            energy: self.energy,
            resonance_square_emphasis: self.resonance_square_emphasis,
        };
        KernelTemporalProjection::from_kernel_projection(self.generation, &projection)
    }

    /// Materialise a resonance observation from this envelope. Returns
    /// `None` if the envelope has no source coordinate / session key,
    /// or no observed resonance to attribute. Errors propagate from
    /// [`KernelResonanceObservation::from_projection`] when invariants
    /// fail.
    pub fn resonance_observation(
        &self,
        timestamp_ms: u64,
        lens: u8,
        ascent_helix: bool,
        position: u8,
        score: f32,
    ) -> Option<Result<KernelResonanceObservation, String>> {
        let coord = self.source_coordinate.as_deref()?;
        let session = self.session_key.as_deref()?;
        let projection = KernelProjection {
            tick: self.tick,
            harmonic_pulse: self.harmonic_pulse,
            bioquaternion: self.bioquaternion.clone(),
            energy: self.energy,
            resonance_square_emphasis: self.resonance_square_emphasis,
        };
        Some(KernelResonanceObservation::from_projection(
            coord,
            session,
            timestamp_ms,
            lens,
            ascent_helix,
            position,
            score,
            &projection,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::deposit::{TrajectoryDeposit, TrajectoryElement};
    use crate::diagnostic::AnuttaraDiagnostic;
    use crate::poles::{
        ChakralActivation, CodonClockCell, LensWeights12, MentalPoleState, NaraArticulation,
        PhysicalPoleState, TorusPoint, VerifierOutcome, WindingNumber,
    };
    use portal_core::{KernelElement, KernelProjection};

    fn projection() -> KernelProjection {
        KernelProjection::from_clock_state(
            1,
            5,
            [1.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5],
            None,
            None,
            0.0,
        )
    }

    #[test]
    fn envelope_inherits_canonical_owner_and_privacy() {
        let env = KernelTickEnvelope::from_kernel_projection(0, &projection());
        assert_eq!(env.coordinate_owner, ENVELOPE_COORDINATE_OWNER);
        assert_eq!(env.projection_owner, ENVELOPE_PROJECTION_OWNER);
        assert_eq!(env.privacy, ENVELOPE_PRIVACY_CLASS);
        assert_eq!(env.computation_source, ENVELOPE_COMPUTATION_SOURCE);
        assert!(env.observed_resonance.is_none());
        assert!(env.physical_pole.is_none());
    }

    #[test]
    fn envelope_projects_to_legacy_temporal_projection() {
        let env = KernelTickEnvelope::from_kernel_projection(42, &projection());
        let temporal = env.to_temporal_projection();
        assert_eq!(temporal.generation, 42);
        assert_eq!(temporal.coordinate_owner, ENVELOPE_COORDINATE_OWNER);
        assert_eq!(temporal.privacy, ENVELOPE_PRIVACY_CLASS);
        assert_eq!(temporal.tick.cycle, env.tick.cycle);
        assert_eq!(temporal.tick.sub_tick, env.tick.sub_tick);
    }

    #[test]
    fn full_envelope_serde_round_trip_preserves_optional_shapes() {
        let torus = TorusPoint::new(0.0, 0.0, 9.0 / 8.0, WindingNumber::DOUBLE_COVER).unwrap();
        let chakra = ChakralActivation::new(0, "muladhara", "Earth", "Earth", 256.0, 0.8).unwrap();
        let codon = CodonClockCell::new(0, ['A', 'T', 'G'], [false; 6], 'M').unwrap();
        let physical = PhysicalPoleState::new(torus, vec![chakra], codon, Some(440.0)).unwrap();

        let mut weights = [0.0f32; 12];
        weights[0] = 0.5;
        weights[11] = 0.5;
        let lens = LensWeights12::new(weights).unwrap();
        let nara = Some(NaraArticulation {
            text: "recognition speaks".to_owned(),
            session_key: Some("session-1".to_owned()),
            model: Some("local-candle".to_owned()),
        });
        let verifier =
            VerifierOutcome::Diagnostic(AnuttaraDiagnostic::parse("?#2-1-3-4{2,4}").unwrap());
        let mental = MentalPoleState::new(nara, lens, verifier);

        let mut deposit =
            TrajectoryDeposit::new("session-1", "#4.4.4.4-frank", "M2-1-3", 100).unwrap();
        let elem = TrajectoryElement::new(
            KernelElement::BimbaEncoding,
            0,
            BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]),
            EnergyDecomposition {
                bimba_pratibimba_energy: 0.0,
                lens_energy: 0.0,
                r_energy: 0.0,
                total_energy: 0.0,
            },
        )
        .unwrap();
        deposit.push_element(elem).unwrap();
        deposit.close(200, 0.0).unwrap();
        let deposit_ref = deposit.as_ref();
        let diag = AnuttaraDiagnostic::silence();

        let env = KernelTickEnvelope::from_kernel_projection(7, &projection())
            .with_session_key("session-1")
            .with_source_coordinate("M2-1-3")
            .with_observed_resonance(ResonanceVector72::default())
            .with_target_resonance(ResonanceVector72::default())
            .with_physical_pole(physical)
            .with_mental_pole(mental)
            .with_trajectory_deposit(deposit_ref)
            .with_anuttara_diagnostic(diag);

        let json = serde_json::to_string(&env).expect("envelope serialises");
        let restored: KernelTickEnvelope =
            serde_json::from_str(&json).expect("envelope round-trips");
        assert_eq!(env, restored);
        assert_eq!(restored.session_key.as_deref(), Some("session-1"));
        assert!(restored.physical_pole.is_some());
        assert!(restored.mental_pole.is_some());
    }

    #[test]
    fn resonance_observation_requires_coord_and_session() {
        let env = KernelTickEnvelope::from_kernel_projection(0, &projection());
        assert!(env.resonance_observation(1, 0, false, 0, 0.5).is_none());

        let env = env
            .with_session_key("session-1")
            .with_source_coordinate("M2-1-3");
        let obs = env.resonance_observation(123, 1, true, 4, 0.5).unwrap();
        let obs = obs.expect("resonance observation valid");
        assert_eq!(obs.source_coordinate, "M2-1-3");
        assert_eq!(obs.session_key, "session-1");
        assert_eq!(obs.lens, 1);
        assert_eq!(obs.position, 4);
        assert!(obs.ascent_helix);
        assert_eq!(obs.tritone_square, 1);
    }

    #[test]
    fn resonance_observation_rejects_out_of_range_score() {
        let env = KernelTickEnvelope::from_kernel_projection(0, &projection())
            .with_session_key("session-1")
            .with_source_coordinate("M2-1-3");
        let err = env
            .resonance_observation(123, 0, false, 0, 1.5)
            .unwrap()
            .expect_err("score out of range should fail");
        assert!(err.contains("normalized"));
    }
}
