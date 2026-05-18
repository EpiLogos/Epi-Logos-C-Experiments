//! Parent-role kernel-aligned contract layer for Epi-Logos.
//!
//! This crate sits at `Body/S/` (sibling to S0..S5) and provides the
//! cross-stack typed shapes the kernel specification names load-bearing:
//!
//! - [`BioQuaternionState`], [`ResonanceVector72`], [`EnergyDecomposition`],
//!   [`KernelTick`], [`HarmonicPulse`], [`KernelProjection`],
//!   [`KernelTemporalProjection`], [`KernelResonanceObservation`]
//!   are re-exported from `portal-core`, which carries the algebraic
//!   primitives.
//! - [`KernelTickEnvelope`] braids tick state, energy, resonance, and
//!   pole snapshots into one envelope crossing all surfaces.
//! - [`TrajectoryDeposit`] is the typed shape that lands in graphiti
//!   episodic memory at `#4.4.4.4-{anchor}` (per kernel spec §7).
//! - [`AnuttaraDiagnostic`] models the symbolic-coordinate verifier
//!   notation specified in mental-pole mechanics §6.
//! - [`PhysicalPoleState`] models the 1-2-3 engine (torus, chakral
//!   field, codon-clock) snapshot at a tick.
//! - [`MentalPoleState`] models the 4-5-0 intelligence (LLM-Nara,
//!   EBM-Epii lens weights, Verifier-Anuttara outcome) snapshot.
//!
//! The crate intentionally holds **shapes plus invariant constructors**,
//! not algorithm implementations. Algorithms over these shapes live in
//! `portal-core` (math) and in the per-S subsystem crates (kernel
//! evaluation, deposit, verification).

pub use portal_core::{
    epogdoon_log, epogdoon_ratio, harmonic_ratio_fraction_for_sub_tick, kernel_energy_evaluate,
    kernel_resonance_index, kernel_resonance_square_emphasis, kernel_tick_from_epogdoon,
    quat_distance_sq, slash_flip_bimba_prime, tritone_square_for_lens, BioQuaternionState,
    EnergyDecomposition, HarmonicPulse, KernelElement, KernelPhase, KernelProjection,
    KernelResonanceObservation, KernelTemporalEnergy, KernelTemporalProjection, KernelTemporalPulse,
    KernelTemporalTick, KernelTick, ResonanceVector72, EPOGDOON_DEN, EPOGDOON_NUM, RESONANCE_DIM,
    TRITONE_SQUARES,
};

pub mod analysis;
pub mod constraint;
pub mod deposit;
pub mod diagnostic;
pub mod envelope;
pub mod ingestion;
pub mod poles;

pub use analysis::{DominantPosition, PrehensiveExtractions, ResonanceAnalysis};
pub use constraint::{
    ConstraintRegistryEntry, ConstraintSeverity, ConstraintViolation, VerifierReport,
};
pub use deposit::{TrajectoryDeposit, TrajectoryDepositRef, TrajectoryElement};
pub use diagnostic::{AnuttaraDiagnostic, AnuttaraExpression, AnuttaraParseError};
pub use envelope::{KernelTickEnvelope, ENVELOPE_COORDINATE_OWNER, ENVELOPE_PRIVACY_CLASS};
pub use ingestion::{IngestionSession, IngestionStatus};
pub use poles::{
    ChakralActivation, CodonClockCell, LensWeights12, MentalPoleState, NaraArticulation,
    PhysicalPoleState, TorusPoint, VerifierOutcome, WindingNumber, CHAKRAL_COUNT, LENS_WEIGHT_DIM,
};
