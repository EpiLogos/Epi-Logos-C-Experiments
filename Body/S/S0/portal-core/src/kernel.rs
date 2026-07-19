use serde::ser::SerializeSeq;
use serde::{Deserialize, Serialize};

use std::fmt;

pub mod profile;
pub mod projections;

pub use profile::*;
pub use projections::*;

pub const EPOGDOON_NUM: u8 = 9;
pub const EPOGDOON_DEN: u8 = 8;
pub const RESONANCE_DIM: usize = 72;
pub const TRITONE_SQUARES: usize = 3;

pub fn epogdoon_ratio() -> f32 {
    EPOGDOON_NUM as f32 / EPOGDOON_DEN as f32
}

pub fn epogdoon_log() -> f32 {
    epogdoon_ratio().ln()
}

/// Kernel-bridge producer for the M2↔M3 16/9 reading relation.
pub fn kernel_bridge_m2m3_lens_orbiter_relations(
    state: &crate::types::PortalClockState,
    lens_stack: &crate::profile_projections::MahamayaLensStack,
) -> crate::profile_projections::LensOrbiterRelationProjection {
    crate::aspect::lens_orbiter_relations(state, lens_stack)
}

// ── Epogdoon 72→64 bridge projection (37.T37.1) ─────────────────────────────
//
// The 9:8 compression as the M2 vibrational address (0..71) descends into the
// M3 codon space (0..63). The compression law lives in C — m3.h
// `apply_epogdoon_compression` / `epogdoon_has_round_trip_loss` and m2.h
// `m3_epogdoon_expand` — and is surfaced here verbatim through FFI so the
// kernel-bridge and the Theia EpogdoonBridgeEngine read ONE authority and never
// recompute the fold locally. (epi-lib is linked crate-wide via `use epi_lib as
// _;` in transcription.rs.)

/// The Parashakti 72-Invariant — every M2 vibrational structure resolves here.
pub const EPOGDOON_M2_ADDRESS_COUNT: u8 = 72;
/// The Mahamaya 64-Invariant — the codon space (0..63).
pub const EPOGDOON_M3_CODON_COUNT: u8 = 64;
pub const EPOGDOON_BLOCK_SIZE: u8 = 9;
pub const EPOGDOON_BLOCK_COUNT: u8 = 8;
pub const EPOGDOON_COLLISION_PAIR_COUNT: u8 = 8;
pub const EPOGDOON_EXACT_ROUND_TRIP_COUNT: u8 = 8;
pub const EPOGDOON_NON_EXACT_ROUND_TRIP_COUNT: u8 = 64;

extern "C" {
    fn apply_epogdoon_compression(m2_idx_0_to_71: u8) -> u8;
    fn epogdoon_has_round_trip_loss(m2_vibration_index: u8) -> bool;
    fn m3_epogdoon_expand(val_64: u8) -> u8;
    static M2_TO_M3_CYMATIC_PROJECTION: [u64; 72];
    static M2_CAUSAL_RESONANCE_MASKS: [u64; 36];
}

/// The typed projection returned by `kernelBridge.m2.epogdoonProjection(address72)`.
///
/// Mirrors the Theia `EpogdoonBridgeProjection` contract (camelCase fields):
/// `apply_epogdoon_compression` (descending M2→M3),
/// `epogdoon_has_round_trip_loss` (the non-exact round-trip detector), and the
/// `m3_epogdoon_expand` round-trip back into the
/// 72-space — all run from the C epogdoon law, never recomputed in Rust.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpogdoonBridgeProjection {
    /// Compressed M3 codon index (0..63) — C `apply_epogdoon_compression(address72)`.
    pub compressed_codon: u8,
    /// True when the 9:8 compression/expansion does not return to address72.
    pub round_trip_loss: bool,
    /// Round-trip back into the 72-space — C `m3_epogdoon_expand(compressedCodon)`.
    pub expanded_back: u8,
}

impl EpogdoonBridgeProjection {
    /// Project one M2 vibrational address (0..71) into the codon lattice by
    /// running the C compression law. The address is taken modulo 72 so the
    /// projection is total over any caller-supplied index.
    pub fn from_address72(address72: u8) -> Self {
        let address72 = address72 % EPOGDOON_M2_ADDRESS_COUNT;
        // SAFETY: the three epogdoon functions (epi-lib m2.c/m3.c) are pure
        // integer transforms with no global state; every u8 is a valid input.
        let compressed_codon = unsafe { apply_epogdoon_compression(address72) };
        let round_trip_loss = unsafe { epogdoon_has_round_trip_loss(address72) };
        let expanded_back = unsafe { m3_epogdoon_expand(compressed_codon) };
        Self {
            compressed_codon,
            round_trip_loss,
            expanded_back,
        }
    }
}

/// The full 72-entry epogdoon descent lattice, address-ordered.
pub fn epogdoon_bridge_lattice() -> [EpogdoonBridgeProjection; EPOGDOON_M2_ADDRESS_COUNT as usize] {
    std::array::from_fn(|address72| EpogdoonBridgeProjection::from_address72(address72 as u8))
}

/// The four-state vocabulary consumed by Track 23.20 and coordinated with the
/// Track 21 MonoPoly dialectic render.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CymaticMonoPolyBehaviourState {
    Mono,
    ActuallyMany,
    ActualisingOne,
    Monopoly,
}

/// Typed projection returned by `kernelBridge.m2.cymaticMonoPolyState(address72)`.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CymaticMonoPolyState {
    pub behaviour_state: CymaticMonoPolyBehaviourState,
    pub active_tone_count: u8,
    pub mutual_resonance: f32,
    pub projection64: u8,
}

/// Project one M2 vibrational address into the cymatic MonoPoly behaviour state.
///
/// The DET bit and causal resonance fan-out are read from the C LUTs
/// `M2_TO_M3_CYMATIC_PROJECTION[72]` and `M2_CAUSAL_RESONANCE_MASKS[36]`.
/// The address is total over caller input by modulo-normalising into 0..71.
pub fn cymatic_monopoly_state(address72: u8) -> CymaticMonoPolyState {
    let address72 = address72 % EPOGDOON_M2_ADDRESS_COUNT;
    let projection64 = cymatic_projection64(address72);
    let condition = (address72 as usize) % 36;
    let resonance_mask = unsafe { M2_CAUSAL_RESONANCE_MASKS[condition] };
    let active_tone_count = causal_active_tone_count(resonance_mask, projection64);
    let mutual_resonance = if active_tone_count <= 1 {
        0.0
    } else {
        (active_tone_count - 1) as f32 / 5.0
    };
    let behaviour_state = match active_tone_count {
        0 | 1 => CymaticMonoPolyBehaviourState::Mono,
        2 | 3 => CymaticMonoPolyBehaviourState::ActuallyMany,
        4 | 5 => CymaticMonoPolyBehaviourState::ActualisingOne,
        _ => CymaticMonoPolyBehaviourState::Monopoly,
    };
    CymaticMonoPolyState {
        behaviour_state,
        active_tone_count,
        mutual_resonance,
        projection64,
    }
}

fn cymatic_projection64(address72: u8) -> u8 {
    let mask =
        unsafe { M2_TO_M3_CYMATIC_PROJECTION[(address72 % EPOGDOON_M2_ADDRESS_COUNT) as usize] };
    if mask == 0 {
        return 0;
    }
    let bit = mask.trailing_zeros() as u8;
    bit.min(EPOGDOON_M3_CODON_COUNT - 1)
}

fn causal_active_tone_count(resonance_mask: u64, projection64: u8) -> u8 {
    let mut active = [false; EPOGDOON_M3_CODON_COUNT as usize];
    active[projection64 as usize] = true;
    for condition in 0..36u8 {
        if resonance_mask & (1u64 << condition) == 0 {
            continue;
        }
        let projected = cymatic_projection64(condition);
        if projected <= projection64 {
            active[projected as usize] = true;
        }
    }
    active.iter().filter(|seen| **seen).count() as u8
}

#[cfg(test)]
mod epogdoon_bridge_tests {
    use super::{
        cymatic_monopoly_state, epogdoon_bridge_lattice, CymaticMonoPolyBehaviourState,
        EpogdoonBridgeProjection, EPOGDOON_M2_ADDRESS_COUNT, EPOGDOON_M3_CODON_COUNT,
    };
    use std::collections::HashSet;

    /// The projection faithfully surfaces the C epogdoon law for every M2
    /// address (0..71): compression, the round-trip-loss flag, and the
    /// round-trip expansion all equal what the C functions compute. This is the
    /// "round-trips against C functions for all 72 indices" verification — the
    /// kernel never recomputes the fold in Rust.
    #[test]
    fn projection_round_trips_against_c_for_all_72_indices() {
        let lattice = epogdoon_bridge_lattice();
        for address72 in 0..EPOGDOON_M2_ADDRESS_COUNT {
            let cell = lattice[address72 as usize];
            assert_eq!(cell, EpogdoonBridgeProjection::from_address72(address72));
            // C apply_epogdoon_compression(i) = (i*8)/9, always inside 0..63.
            assert_eq!(cell.compressed_codon, (address72 as u16 * 8 / 9) as u8);
            assert!(cell.compressed_codon < EPOGDOON_M3_CODON_COUNT);
            // C m3_epogdoon_expand(c) = (c*9)/8.
            assert_eq!(
                cell.expanded_back,
                (cell.compressed_codon as u16 * 9 / 8) as u8
            );
            assert_eq!(cell.round_trip_loss, cell.expanded_back != address72);
        }
    }

    /// Documents the canonical C numbers the bridge surfaces. The literal C
    /// round-trip loss flags 64 of the 72 addresses;
    /// only the eight multiples of nine round-trip cleanly. The eight 9:8
    /// collisions are the "8 missing states" the M3 header (FR 2.3.6) names as
    /// driving the evolutionary spiral, and excluding them leaves exactly 64
    /// distinct codons — the count the Theia EpogdoonBridgeEngine expects.
    ///
    /// NOTE: this differs from the plan's "exactly 9" and the TSX
    #[test]
    fn epogdoon_fold_structure_matches_canonical_c() {
        let lattice = epogdoon_bridge_lattice();
        let c_gap_count = lattice.iter().filter(|cell| cell.round_trip_loss).count();
        assert_eq!(c_gap_count, 64, "C round-trip loss flags 64/72");

        let mut collisions = 0usize;
        let mut distinct_non_collision = HashSet::new();
        let mut prev: Option<u8> = None;
        for cell in lattice.iter() {
            if Some(cell.compressed_codon) == prev {
                collisions += 1;
            } else {
                distinct_non_collision.insert(cell.compressed_codon);
            }
            prev = Some(cell.compressed_codon);
        }
        assert_eq!(collisions, 8, "eight 9:8 collisions (the 'missing states')");
        assert_eq!(
            distinct_non_collision.len(),
            64,
            "non-collision descents reach all 64 codons"
        );
    }

    #[test]
    fn cymatic_monopoly_state_classifies_fixture_resonance_into_four_states() {
        let fixtures = [
            (1, CymaticMonoPolyBehaviourState::Mono, 1, 1),
            (7, CymaticMonoPolyBehaviourState::ActuallyMany, 2, 7),
            (19, CymaticMonoPolyBehaviourState::ActualisingOne, 4, 19),
            (31, CymaticMonoPolyBehaviourState::Monopoly, 6, 31),
        ];

        for (address72, expected, active_tone_count, projection64) in fixtures {
            let state = cymatic_monopoly_state(address72);
            assert_eq!(state.behaviour_state, expected);
            assert_eq!(state.active_tone_count, active_tone_count);
            assert_eq!(state.projection64, projection64);
            assert!((0.0..=1.0).contains(&state.mutual_resonance));
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum KernelPhase {
    Descent = 0,
    Ascent = 1,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum KernelElement {
    BimbaEncoding = 0,
    PratibimbaPrehension = 1,
    MobiusDescent = 2,
    SlashFlip = 3,
    PratibimbaAsBimba = 4,
    DoubledPrehension = 5,
    InverseMobius = 6,
    EnrichedReturn = 7,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BioQuaternionState {
    pub q_b: [f32; 4],
    pub q_p: [f32; 4],
}

impl BioQuaternionState {
    pub fn new(q_b: [f32; 4], q_p: [f32; 4]) -> Self {
        Self {
            q_b: unit_or_identity(q_b),
            q_p: unit_or_identity(q_p),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ResonanceVector72 {
    pub values: [f32; RESONANCE_DIM],
}

impl Default for ResonanceVector72 {
    fn default() -> Self {
        Self {
            values: [0.0; RESONANCE_DIM],
        }
    }
}

impl Serialize for ResonanceVector72 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut seq = serializer.serialize_seq(Some(RESONANCE_DIM))?;
        for value in self.values {
            seq.serialize_element(&value)?;
        }
        seq.end()
    }
}

impl<'de> Deserialize<'de> for ResonanceVector72 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let values = Vec::<f32>::deserialize(deserializer)?;
        if values.len() != RESONANCE_DIM {
            return Err(serde::de::Error::invalid_length(
                values.len(),
                &"exactly 72 resonance values",
            ));
        }
        let mut array = [0.0f32; RESONANCE_DIM];
        array.copy_from_slice(&values);
        Ok(Self { values: array })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct EnergyDecomposition {
    pub bimba_pratibimba_energy: f32,
    pub e_4_personal_energy: f32,
    pub e_5_harmonic_energy: f32,
    pub e_6_verifier_energy: f32,
    pub total_energy: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UnifiedVakActFace {
    CoordinateDesignation,
    MefLensApplication,
    QlPositionCheck,
    HarmonicsReading,
    MusicalTranscriptionalProjection,
    PhysicalPoleEntailment,
}

pub const UNIFIED_VAK_ACT_FACES: [UnifiedVakActFace; 6] = [
    UnifiedVakActFace::CoordinateDesignation,
    UnifiedVakActFace::MefLensApplication,
    UnifiedVakActFace::QlPositionCheck,
    UnifiedVakActFace::HarmonicsReading,
    UnifiedVakActFace::MusicalTranscriptionalProjection,
    UnifiedVakActFace::PhysicalPoleEntailment,
];

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedVakActTuple {
    pub coord: String,
    pub lens: String,
    pub helix: String,
    pub density: u8,
    pub position: u8,
    pub cfp_thread: String,
    pub r_factor_slot: String,
    pub ananda_position: u8,
}

impl UnifiedVakActTuple {
    pub fn faces(&self) -> [UnifiedVakActFace; 6] {
        UNIFIED_VAK_ACT_FACES
    }

    pub fn validate(&self) -> Result<(), UnifiedVakActError> {
        require_unified_vak_field("coord", &self.coord)?;
        require_unified_vak_field("lens", &self.lens)?;
        require_unified_vak_field("helix", &self.helix)?;
        require_unified_vak_field("cfp_thread", &self.cfp_thread)?;
        require_unified_vak_field("r_factor_slot", &self.r_factor_slot)?;
        if !(1..=6).contains(&self.density) {
            return Err(UnifiedVakActError::OutOfRange {
                field: "density",
                value: self.density,
                max_inclusive: 6,
            });
        }
        if self.position > 5 {
            return Err(UnifiedVakActError::OutOfRange {
                field: "position",
                value: self.position,
                max_inclusive: 5,
            });
        }
        if self.ananda_position > 5 {
            return Err(UnifiedVakActError::OutOfRange {
                field: "ananda_position",
                value: self.ananda_position,
                max_inclusive: 5,
            });
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum UnifiedVakActError {
    MissingField(&'static str),
    OutOfRange {
        field: &'static str,
        value: u8,
        max_inclusive: u8,
    },
}

impl fmt::Display for UnifiedVakActError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingField(field) => write!(f, "unified VAK act missing {field}"),
            Self::OutOfRange {
                field,
                value,
                max_inclusive,
            } => write!(f, "unified VAK act {field}={value} exceeds {max_inclusive}"),
        }
    }
}

impl std::error::Error for UnifiedVakActError {}

fn require_unified_vak_field(field: &'static str, value: &str) -> Result<(), UnifiedVakActError> {
    if value.trim().is_empty() {
        Err(UnifiedVakActError::MissingField(field))
    } else {
        Ok(())
    }
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E4PersonalInputs {
    pub pasu_handle: Option<String>,
    pub kairos_handle: Option<String>,
    pub nara_lora_checkpoint_ref: Option<String>,
    pub pasu_snapshot: Option<E4PasuSnapshot>,
    pub kairos: Option<E4KairosState>,
    pub lora_checkpoint: Option<E4LoraCheckpointRef>,
    pub corpus: Option<E4CorpusDigest>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct E4PasuSnapshot {
    pub q_identity: [f32; 4],
    pub q_personal: [f32; 4],
    pub birth_date: String,
    pub birth_location: String,
    pub c_0_natal_chart_path: String,
    pub c_2_jungian: String,
    pub c_3_gene_keys: String,
    pub c_4_human_design: String,
    pub c_5_quintessence_hash: String,
    pub c_5_quintessence_clock: String,
    pub c_4_last_wound: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct E4OracleCharges {
    pub pp: f32,
    pub mm: f32,
    pub mp: f32,
    pub pn: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct E4KairosState {
    pub planet_degrees: [f32; 10],
    pub oracle_charges: E4OracleCharges,
    pub tarot_psyche_anchor_signature: String,
    pub kairos_window_id: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct E4LoraCheckpointRef {
    pub path: String,
    pub version: String,
    pub privacy_class: E4PrivacyClass,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct E4CorpusDigest {
    pub journal_hashes: Vec<String>,
    pub dream_hashes: Vec<String>,
    pub phone_writing_hashes: Vec<String>,
    pub model_version_key: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum E4PrivacyClass {
    LocalOnly,
}

impl E4PrivacyClass {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::LocalOnly => "local-only",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NaraLoraRuntime {
    RustNative,
    MlxLora,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E4EnergyProvenance {
    pub channel: String,
    pub runtime: NaraLoraRuntime,
    pub privacy_class: E4PrivacyClass,
    pub checkpoint_version: String,
    pub kairos_window_id: String,
    pub weighting_coefficient: u8,
    pub decision: String,
    pub model_slot_spec_ref: String,
    pub ml_skill_surface_ref: String,
    pub mental_pole_mechanics_ref: String,
    pub autograd_path: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E4EnergyEvaluation {
    pub scalar: f32,
    pub lora_forward: [f32; 4],
    pub provenance: E4EnergyProvenance,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E4GradientEvaluation {
    pub channel: String,
    pub gradient: [f32; 4],
    pub norm: f32,
    pub scalar: f32,
    pub provenance: E4EnergyProvenance,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum E4PersonalEnergyError {
    MissingTypedInputs(&'static str),
    PrivacyClassViolation(String),
    NonLocalCheckpointPath(String),
    InvalidInput(String),
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E5HarmonicInputs {
    pub channel_set: Vec<String>,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct E6VerifierInputs {
    pub invariant_set: Vec<String>,
    pub severity_weights_handle: Option<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct KernelTick {
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: KernelPhase,
    pub element: KernelElement,
    pub position6: u8,
    pub harmonic_ratio: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct HarmonicPulse {
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: KernelPhase,
    pub element: KernelElement,
    pub ratio_num: u16,
    pub ratio_den: u16,
    pub tempo_multiplier: f32,
    pub period_multiplier: f32,
}

impl HarmonicPulse {
    pub fn from_tick(tick: KernelTick) -> Self {
        let (ratio_num, ratio_den) = harmonic_ratio_fraction_for_sub_tick(tick.sub_tick);
        Self {
            cycle: tick.cycle,
            sub_tick: tick.sub_tick,
            phase: tick.phase,
            element: tick.element,
            ratio_num,
            ratio_den,
            tempo_multiplier: tick.harmonic_ratio,
            period_multiplier: ratio_den as f32 / ratio_num as f32,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct KernelProjection {
    pub tick: KernelTick,
    pub harmonic_pulse: HarmonicPulse,
    pub bioquaternion: BioQuaternionState,
    pub energy: EnergyDecomposition,
    pub resonance_square_emphasis: [f32; TRITONE_SQUARES],
}

impl KernelProjection {
    pub fn from_clock_state(
        cycle: u64,
        tick12: u8,
        q_b: [f32; 4],
        q_p: [f32; 4],
        observed: Option<&ResonanceVector72>,
        e_4_inputs: &E4PersonalInputs,
        e_5_inputs: &E5HarmonicInputs,
        e_6_inputs: &E6VerifierInputs,
    ) -> Self {
        let tick = kernel_tick_from_epogdoon(cycle, tick12);
        let bioquaternion = BioQuaternionState::new(q_b, q_p);
        #[cfg(feature = "resonance_ebm_runtime")]
        let bioquaternion = {
            let outcome = kernel_resonance_ebm_runtime_step(
                &bioquaternion,
                tick,
                kernel_default_resonance_ebm_runtime(),
            );
            outcome.updated_state
        };
        let resonance_square_emphasis = observed
            .map(kernel_resonance_square_emphasis)
            .unwrap_or([0.0; TRITONE_SQUARES]);
        let energy = kernel_energy_evaluate(&bioquaternion, e_4_inputs, e_5_inputs, e_6_inputs);
        Self {
            tick,
            harmonic_pulse: HarmonicPulse::from_tick(tick),
            bioquaternion,
            energy,
            resonance_square_emphasis,
        }
    }
}

impl Default for KernelProjection {
    fn default() -> Self {
        let e_4_inputs = E4PersonalInputs::default();
        let e_5_inputs = E5HarmonicInputs::default();
        let e_6_inputs = E6VerifierInputs::default();
        Self::from_clock_state(
            0,
            0,
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 0.0],
            None,
            &e_4_inputs,
            &e_5_inputs,
            &e_6_inputs,
        )
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelTemporalProjection {
    pub coordinate_owner: String,
    pub projection_owner: String,
    pub privacy: String,
    pub computation_source: String,
    pub generation: u64,
    pub tick: KernelTemporalTick,
    pub harmonic_pulse: KernelTemporalPulse,
    pub energy: KernelTemporalEnergy,
    pub harmonic_profile: MathemeHarmonicProfile,
    /// Kernel-owned Klein-flip surface state (M2' law): primary until the
    /// cymatic valence inversion at tick12 == 7, inverted through the Möbius
    /// return. The profile's `klein_flip` marks the crossing EVENT; this
    /// field is the latched STATE, so wire consumers stop deriving valence
    /// ad hoc (Tranche 03.T3.1 kleinFlipState closure).
    pub klein_flip_state: crate::events::Valence,
}

impl KernelTemporalProjection {
    pub const COORDINATE_OWNER: &'static str = "S0/QL-meta";
    pub const PROJECTION_OWNER: &'static str = "S3'";
    pub const PRIVACY: &'static str = "safe-public-current-kernel-tick";
    pub const COMPUTATION_SOURCE: &'static str = "portal-core::KernelProjection";

    pub fn from_kernel_projection(generation: u64, projection: &KernelProjection) -> Self {
        let harmonic_profile = MathemeHarmonicProfile::from_tick(projection.tick);
        let klein_flip_state =
            crate::parashakti::vimarsha_reading::cymatic_valence_state(harmonic_profile.tick12);
        Self {
            coordinate_owner: Self::COORDINATE_OWNER.to_owned(),
            projection_owner: Self::PROJECTION_OWNER.to_owned(),
            privacy: Self::PRIVACY.to_owned(),
            computation_source: Self::COMPUTATION_SOURCE.to_owned(),
            generation,
            tick: KernelTemporalTick::from_tick(projection.tick),
            harmonic_pulse: KernelTemporalPulse::from_pulse(projection.harmonic_pulse),
            energy: KernelTemporalEnergy::from_energy(projection.energy),
            harmonic_profile,
            klein_flip_state,
        }
    }

    pub fn from_clock_tick(timestamp_ms: u64, generation: u64) -> Self {
        let total_seconds = timestamp_ms / 1_000;
        let cycle = total_seconds / 12;
        let sub_tick = (total_seconds % 12) as u8;
        Self::from_cycle_subtick(cycle, sub_tick, generation)
    }

    /// Projection from the engine-owned spanda phase anchor (02.T2.12 /
    /// DR-M1-5): `tick12` is `spanda::tick12_readout(phase)` — never a
    /// wall-clock dice. `now_ms` evaluates the lazy anchor; it does not
    /// ground the tick. The live heartbeat samples through THIS path;
    /// `from_clock_tick` remains for deterministic test construction and
    /// callers that have not yet grown an anchor.
    pub fn from_phase_anchor(
        anchor: &crate::spanda_anchor::SpandaPhaseAnchor,
        now_ms: u64,
        generation: u64,
    ) -> Self {
        let (cycle, sub_tick) = anchor.projection_inputs(now_ms);
        Self::from_cycle_subtick(cycle, sub_tick, generation)
    }

    fn from_cycle_subtick(cycle: u64, sub_tick: u8, generation: u64) -> Self {
        let e_4_inputs = E4PersonalInputs::default();
        let e_5_inputs = E5HarmonicInputs::default();
        let e_6_inputs = E6VerifierInputs::default();
        let projection = KernelProjection::from_clock_state(
            cycle,
            sub_tick,
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 0.0],
            None,
            &e_4_inputs,
            &e_5_inputs,
            &e_6_inputs,
        );
        Self::from_kernel_projection(generation, &projection)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConjugateFormCharacter {
    Major,
    Minor,
    ShadowInversion,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProfilePrivacyClass {
    ProtectedLocalBody,
    ProtectedLocalDerived,
    PublicCurrentContext,
    ReviewedCanonical,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeNodalConstraint {
    pub ql_position: u8,
    pub helix: String,
    pub m: u8,
    pub n: u8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelTemporalTick {
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: String,
    pub element: String,
    pub position6: u8,
    pub harmonic_ratio: String,
}

impl KernelTemporalTick {
    fn from_tick(tick: KernelTick) -> Self {
        Self {
            cycle: tick.cycle,
            sub_tick: tick.sub_tick,
            phase: format!("{:?}", tick.phase),
            element: format!("{:?}", tick.element),
            position6: tick.position6,
            harmonic_ratio: format!("{:.6}", tick.harmonic_ratio),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelTemporalPulse {
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: String,
    pub element: String,
    pub ratio_num: u16,
    pub ratio_den: u16,
    pub tempo_multiplier: String,
    pub period_multiplier: String,
}

impl KernelTemporalPulse {
    fn from_pulse(pulse: HarmonicPulse) -> Self {
        Self {
            cycle: pulse.cycle,
            sub_tick: pulse.sub_tick,
            phase: format!("{:?}", pulse.phase),
            element: format!("{:?}", pulse.element),
            ratio_num: pulse.ratio_num,
            ratio_den: pulse.ratio_den,
            tempo_multiplier: format!("{:.6}", pulse.tempo_multiplier),
            period_multiplier: format!("{:.6}", pulse.period_multiplier),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelTemporalEnergy {
    pub bimba_pratibimba_energy: String,
    pub e_4_personal_energy: String,
    pub e_5_harmonic_energy: String,
    pub e_6_verifier_energy: String,
    pub total_energy: String,
}

impl KernelTemporalEnergy {
    fn from_energy(energy: EnergyDecomposition) -> Self {
        Self {
            bimba_pratibimba_energy: format!("{:.6}", energy.bimba_pratibimba_energy),
            e_4_personal_energy: format!("{:.6}", energy.e_4_personal_energy),
            e_5_harmonic_energy: format!("{:.6}", energy.e_5_harmonic_energy),
            e_6_verifier_energy: format!("{:.6}", energy.e_6_verifier_energy),
            total_energy: format!("{:.6}", energy.total_energy),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct KernelResonanceObservation {
    pub source_coordinate: String,
    pub session_key: String,
    pub timestamp_ms: u64,
    pub lens: u8,
    pub ascent_helix: bool,
    pub position: u8,
    pub score: f32,
    pub resonance_index: usize,
    pub tritone_square: usize,
    pub kernel_tick: KernelTick,
}

impl KernelResonanceObservation {
    #[allow(clippy::too_many_arguments)]
    pub fn from_projection(
        source_coordinate: &str,
        session_key: &str,
        timestamp_ms: u64,
        lens: u8,
        ascent_helix: bool,
        position: u8,
        score: f32,
        projection: &KernelProjection,
    ) -> Result<Self, String> {
        if source_coordinate.trim().is_empty() {
            return Err("source coordinate is required for kernel resonance observation".into());
        }
        if session_key.trim().is_empty() {
            return Err("session key is required for kernel resonance observation".into());
        }
        if timestamp_ms == 0 {
            return Err("timestamp_ms is required for kernel resonance observation".into());
        }
        if !score.is_finite() {
            return Err("kernel resonance score must be finite".into());
        }
        if !(0.0..=1.0).contains(&score) {
            return Err("kernel resonance score must be normalized between 0 and 1".into());
        }

        let resonance_index = kernel_resonance_index(lens, ascent_helix, position)
            .ok_or_else(|| "kernel resonance lens and position must be in 0..6".to_string())?;
        let tritone_square = tritone_square_for_lens(lens)
            .ok_or_else(|| "kernel resonance lens must map to a tritone square".to_string())?;

        Ok(Self {
            source_coordinate: source_coordinate.trim().to_owned(),
            session_key: session_key.trim().to_owned(),
            timestamp_ms,
            lens,
            ascent_helix,
            position,
            score,
            resonance_index,
            tritone_square,
            kernel_tick: projection.tick,
        })
    }
}

pub fn slash_flip_bimba_prime(state: &BioQuaternionState) -> [f32; 4] {
    unit_or_identity([state.q_p[0], -state.q_p[1], -state.q_p[2], -state.q_p[3]])
}

pub fn quat_distance_sq(a: [f32; 4], b: [f32; 4]) -> f32 {
    let dw = a[0] - b[0];
    let dx = a[1] - b[1];
    let dy = a[2] - b[2];
    let dz = a[3] - b[3];
    dw * dw + dx * dx + dy * dy + dz * dz
}

pub fn kernel_resonance_index(lens: u8, ascent_helix: bool, position: u8) -> Option<usize> {
    if lens >= 6 || position >= 6 {
        return None;
    }
    let helix = if ascent_helix { 1usize } else { 0usize };
    Some((lens as usize * 12) + (helix * 6) + position as usize)
}

pub fn tritone_square_for_lens(lens: u8) -> Option<usize> {
    match lens {
        0 | 5 => Some(0),
        1 | 4 => Some(1),
        2 | 3 => Some(2),
        _ => None,
    }
}

pub fn kernel_resonance_square_emphasis(vector: &ResonanceVector72) -> [f32; 3] {
    let mut sums = [0.0f32; 3];
    let mut counts = [0u8; 3];
    for lens in 0..6u8 {
        let square = tritone_square_for_lens(lens).expect("0..6 lenses are square-mapped");
        for ascent in [false, true] {
            for position in 0..6u8 {
                let idx = kernel_resonance_index(lens, ascent, position)
                    .expect("loop bounds produce valid 72-fold index");
                sums[square] += vector.values[idx];
                counts[square] += 1;
            }
        }
    }
    for square in 0..TRITONE_SQUARES {
        if counts[square] > 0 {
            sums[square] /= counts[square] as f32;
        }
    }
    sums
}

pub fn kernel_energy_evaluate(
    state: &BioQuaternionState,
    e_4_inputs: &E4PersonalInputs,
    _e_5_inputs: &E5HarmonicInputs,
    _e_6_inputs: &E6VerifierInputs,
) -> EnergyDecomposition {
    let bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p);
    let e_4_personal_energy = try_compute_e_4_personal_energy(state, e_4_inputs)
        .map(|evaluation| evaluation.scalar)
        .unwrap_or(0.0);
    let e_5_harmonic_energy = 0.0;
    let e_6_verifier_energy = 0.0;
    EnergyDecomposition {
        bimba_pratibimba_energy,
        e_4_personal_energy,
        e_5_harmonic_energy,
        e_6_verifier_energy,
        total_energy: canonical_total_energy(
            e_4_personal_energy,
            e_5_harmonic_energy,
            e_6_verifier_energy,
        ),
    }
}

pub fn kernel_energy_evaluate_unified_act(
    act: &UnifiedVakActTuple,
    state: &BioQuaternionState,
    e_4_inputs: &E4PersonalInputs,
    e_5_inputs: &E5HarmonicInputs,
    e_6_inputs: &E6VerifierInputs,
) -> Result<EnergyDecomposition, UnifiedVakActError> {
    act.validate()?;
    Ok(kernel_energy_evaluate(
        state, e_4_inputs, e_5_inputs, e_6_inputs,
    ))
}

pub fn compute_e_4_personal_energy(state: &BioQuaternionState, inputs: &E4PersonalInputs) -> f32 {
    try_compute_e_4_personal_energy(state, inputs)
        .expect("E4PersonalInputs must carry local-only PASU, kairos, checkpoint, and corpus")
        .scalar
}

pub fn try_compute_e_4_personal_energy(
    state: &BioQuaternionState,
    inputs: &E4PersonalInputs,
) -> Result<E4EnergyEvaluation, E4PersonalEnergyError> {
    let full = E4FullInputs::try_from(inputs)?;
    let (lora_forward, _) = nara_lora_forward_with_jacobian(state.q_p, full);
    let scalar = finite_e4_scalar(
        (quat_distance_sq(lora_forward, full.pasu.q_personal)
            + quat_distance_sq(state.q_b, full.pasu.q_identity)
            + kairos_coherence_penalty(full.kairos)
            + corpus_adapter_penalty(full.corpus))
            / 4.0,
        "E_4 scalar",
    )?;
    Ok(E4EnergyEvaluation {
        scalar,
        lora_forward,
        provenance: e4_provenance(select_nara_lora_runtime(), full),
    })
}

pub fn compute_e_4_personal_energy_gradient(
    state: &BioQuaternionState,
    inputs: &E4PersonalInputs,
) -> Result<E4GradientEvaluation, E4PersonalEnergyError> {
    let full = E4FullInputs::try_from(inputs)?;
    let evaluation = try_compute_e_4_personal_energy(state, inputs)?;
    let (_lora_forward, jacobian) = nara_lora_forward_with_jacobian(state.q_p, full);
    let d_scalar_d_forward = scale4(sub4(evaluation.lora_forward, full.pasu.q_personal), 0.5);
    let mut ambient = [0.0f32; 4];
    for qp_index in 0..4 {
        ambient[qp_index] = (0..4)
            .map(|out_index| jacobian[out_index][qp_index] * d_scalar_d_forward[out_index])
            .sum();
    }
    let tangent = tangent_projection_s3_f32(state.q_p, ambient);
    Ok(E4GradientEvaluation {
        channel: "E_4".to_owned(),
        gradient: tangent,
        norm: dot4_f32(tangent, tangent).sqrt(),
        scalar: evaluation.scalar,
        provenance: evaluation.provenance,
    })
}

pub fn select_nara_lora_runtime() -> NaraLoraRuntime {
    if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
        NaraLoraRuntime::MlxLora
    } else {
        NaraLoraRuntime::RustNative
    }
}

#[derive(Clone, Copy)]
struct E4FullInputs<'a> {
    pasu: &'a E4PasuSnapshot,
    kairos: &'a E4KairosState,
    checkpoint: &'a E4LoraCheckpointRef,
    corpus: &'a E4CorpusDigest,
}

impl<'a> E4FullInputs<'a> {
    fn try_from(inputs: &'a E4PersonalInputs) -> Result<Self, E4PersonalEnergyError> {
        let full = Self {
            pasu: inputs
                .pasu_snapshot
                .as_ref()
                .ok_or(E4PersonalEnergyError::MissingTypedInputs("pasu_snapshot"))?,
            kairos: inputs
                .kairos
                .as_ref()
                .ok_or(E4PersonalEnergyError::MissingTypedInputs("kairos"))?,
            checkpoint: inputs
                .lora_checkpoint
                .as_ref()
                .ok_or(E4PersonalEnergyError::MissingTypedInputs("lora_checkpoint"))?,
            corpus: inputs
                .corpus
                .as_ref()
                .ok_or(E4PersonalEnergyError::MissingTypedInputs("corpus"))?,
        };
        validate_e4_full_inputs(full)?;
        Ok(full)
    }
}

fn validate_e4_full_inputs(inputs: E4FullInputs<'_>) -> Result<(), E4PersonalEnergyError> {
    for (name, value) in [
        ("birth_date", inputs.pasu.birth_date.as_str()),
        ("birth_location", inputs.pasu.birth_location.as_str()),
        (
            "c_0_natal_chart_path",
            inputs.pasu.c_0_natal_chart_path.as_str(),
        ),
        (
            "c_5_quintessence_hash",
            inputs.pasu.c_5_quintessence_hash.as_str(),
        ),
        (
            "c_5_quintessence_clock",
            inputs.pasu.c_5_quintessence_clock.as_str(),
        ),
        (
            "tarot_psyche_anchor_signature",
            inputs.kairos.tarot_psyche_anchor_signature.as_str(),
        ),
        ("kairos_window_id", inputs.kairos.kairos_window_id.as_str()),
        ("lora_checkpoint.path", inputs.checkpoint.path.as_str()),
        (
            "lora_checkpoint.version",
            inputs.checkpoint.version.as_str(),
        ),
        (
            "model_version_key",
            inputs.corpus.model_version_key.as_str(),
        ),
    ] {
        if value.trim().is_empty() {
            return Err(E4PersonalEnergyError::InvalidInput(format!(
                "{name} must be non-empty"
            )));
        }
    }
    if inputs.checkpoint.privacy_class != E4PrivacyClass::LocalOnly {
        return Err(E4PersonalEnergyError::PrivacyClassViolation(
            inputs.checkpoint.privacy_class.as_str().to_owned(),
        ));
    }
    if is_non_local_uri(&inputs.checkpoint.path) {
        return Err(E4PersonalEnergyError::NonLocalCheckpointPath(
            inputs.checkpoint.path.clone(),
        ));
    }
    for (name, value) in [
        ("q_identity", inputs.pasu.q_identity),
        ("q_personal", inputs.pasu.q_personal),
    ] {
        if !value.iter().all(|component| component.is_finite()) {
            return Err(E4PersonalEnergyError::InvalidInput(format!(
                "{name}[4] must contain finite components"
            )));
        }
    }
    if !inputs
        .kairos
        .planet_degrees
        .iter()
        .all(|degree| degree.is_finite())
    {
        return Err(E4PersonalEnergyError::InvalidInput(
            "planet_degrees[10] must contain finite Sun[0]-Pluto[9] degrees".to_owned(),
        ));
    }
    for hash in inputs
        .corpus
        .journal_hashes
        .iter()
        .chain(inputs.corpus.dream_hashes.iter())
        .chain(inputs.corpus.phone_writing_hashes.iter())
    {
        if hash.trim().is_empty() {
            return Err(E4PersonalEnergyError::InvalidInput(
                "corpus hashes must be non-empty local digests".to_owned(),
            ));
        }
    }
    Ok(())
}

fn nara_lora_forward_with_jacobian(
    q_p: [f32; 4],
    inputs: E4FullInputs<'_>,
) -> ([f32; 4], [[f32; 4]; 4]) {
    let oracle = [
        inputs.kairos.oracle_charges.pp,
        inputs.kairos.oracle_charges.mm,
        inputs.kairos.oracle_charges.mp,
        inputs.kairos.oracle_charges.pn,
    ];
    let corpus_phase = stable_unit_interval_for_e4(inputs.corpus, inputs.checkpoint);
    let mut raw = [0.0f32; 4];
    for index in 0..4 {
        let planet = (normalize_degrees(inputs.kairos.planet_degrees[index]).to_radians()).sin();
        let charge = (oracle[index] / 64.0).tanh();
        raw[index] = q_p[index] + (0.05 * planet) + (0.05 * charge) + (0.01 * corpus_phase);
    }
    let norm = dot4_f32(raw, raw).sqrt();
    let output = if norm == 0.0 {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        [raw[0] / norm, raw[1] / norm, raw[2] / norm, raw[3] / norm]
    };
    let mut jacobian = [[0.0f32; 4]; 4];
    if norm != 0.0 {
        for row in 0..4 {
            for col in 0..4 {
                let identity = if row == col { 1.0 } else { 0.0 };
                jacobian[row][col] = (identity - (output[row] * output[col])) / norm;
            }
        }
    }
    (output, jacobian)
}

fn kairos_coherence_penalty(kairos: &E4KairosState) -> f32 {
    let planet_mean = kairos
        .planet_degrees
        .iter()
        .map(|degree| normalize_degrees(*degree).to_radians().sin())
        .sum::<f32>()
        / kairos.planet_degrees.len() as f32;
    let charge_total = kairos.oracle_charges.pp.abs()
        + kairos.oracle_charges.mm.abs()
        + kairos.oracle_charges.mp.abs()
        + kairos.oracle_charges.pn.abs();
    (planet_mean.abs() / 2.0) + ((charge_total / 64.0).tanh() / 2.0)
}

fn corpus_adapter_penalty(corpus: &E4CorpusDigest) -> f32 {
    let count =
        corpus.journal_hashes.len() + corpus.dream_hashes.len() + corpus.phone_writing_hashes.len();
    if count == 0 {
        1.0
    } else {
        1.0 / (1.0 + count as f32)
    }
}

fn e4_provenance(runtime: NaraLoraRuntime, inputs: E4FullInputs<'_>) -> E4EnergyProvenance {
    E4EnergyProvenance {
        channel: "E_4".to_owned(),
        runtime,
        privacy_class: E4PrivacyClass::LocalOnly,
        checkpoint_version: inputs.checkpoint.version.clone(),
        kairos_window_id: inputs.kairos.kairos_window_id.clone(),
        weighting_coefficient: 4,
        decision: "E_4 = personal/Nara substrate (PASU + kairos + q_personal + q_identity + planet_degrees + oracle charges + Nara-LoRA-adapted user content). Final.".to_owned(),
        model_slot_spec_ref: "[[M'-MODEL-SLOT-SPEC]]".to_owned(),
        ml_skill_surface_ref: "[[M'-ML-SKILL-SURFACE-SPEC]] §3.1 + §3.2 + §7.1".to_owned(),
        mental_pole_mechanics_ref: "[[M4'/mental-pole-mechanics]] §7.5 ∇E_4".to_owned(),
        autograd_path: "rust-native-nara-lora-forward".to_owned(),
    }
}

fn stable_unit_interval_for_e4(corpus: &E4CorpusDigest, checkpoint: &E4LoraCheckpointRef) -> f32 {
    let mut hash = 2166136261u32;
    for part in corpus
        .journal_hashes
        .iter()
        .chain(corpus.dream_hashes.iter())
        .chain(corpus.phone_writing_hashes.iter())
        .chain([&corpus.model_version_key, &checkpoint.version])
    {
        for byte in part.as_bytes() {
            hash ^= *byte as u32;
            hash = hash.wrapping_mul(16777619);
        }
    }
    hash as f32 / u32::MAX as f32
}

fn finite_e4_scalar(value: f32, name: &str) -> Result<f32, E4PersonalEnergyError> {
    if value.is_finite() {
        Ok(value)
    } else {
        Err(E4PersonalEnergyError::InvalidInput(format!(
            "{name} must be finite"
        )))
    }
}

fn is_non_local_uri(value: &str) -> bool {
    let lower = value.to_ascii_lowercase();
    lower.contains("://") && !lower.starts_with("file://")
}

fn normalize_degrees(degree: f32) -> f32 {
    degree.rem_euclid(360.0)
}

fn sub4(left: [f32; 4], right: [f32; 4]) -> [f32; 4] {
    [
        left[0] - right[0],
        left[1] - right[1],
        left[2] - right[2],
        left[3] - right[3],
    ]
}

fn scale4(value: [f32; 4], scalar: f32) -> [f32; 4] {
    [
        value[0] * scalar,
        value[1] * scalar,
        value[2] * scalar,
        value[3] * scalar,
    ]
}

fn dot4_f32(a: [f32; 4], b: [f32; 4]) -> f32 {
    a.iter().zip(b.iter()).map(|(a, b)| a * b).sum()
}

fn tangent_projection_s3_f32(q: [f32; 4], ambient_gradient: [f32; 4]) -> [f32; 4] {
    let radial = dot4_f32(q, ambient_gradient);
    [
        ambient_gradient[0] - (radial * q[0]),
        ambient_gradient[1] - (radial * q[1]),
        ambient_gradient[2] - (radial * q[2]),
        ambient_gradient[3] - (radial * q[3]),
    ]
}

fn canonical_total_energy(e_4: f32, e_5: f32, e_6: f32) -> f32 {
    ((4.0 * e_4) + (5.0 * e_5) + (6.0 * e_6)) / 15.0
}

pub fn harmonic_ratio_fraction_for_sub_tick(sub_tick: u8) -> (u16, u16) {
    match sub_tick % 12 {
        1 => (4, 3),
        2 | 7 => (3, 4),
        3 | 8 | 11 => (9, 8),
        5 | 6 => (2, 3),
        9 | 10 => (3, 2),
        _ => (1, 1),
    }
}

fn pitch_class_for_tick(tick12: u8) -> u8 {
    match tick12 % 12 {
        0 => 0,
        1 => 2,
        2 => 4,
        3 => 6,
        4 => 8,
        5 => 10,
        6 => 1,
        7 => 3,
        8 => 5,
        9 => 7,
        10 => 9,
        _ => 11,
    }
}

fn bimba_pitch_class_for_position(position: u8) -> u8 {
    (2 * (position % 6)) % 12
}

fn pratibimba_pitch_class_for_position(position: u8) -> u8 {
    (bimba_pitch_class_for_position(position) + 1) % 12
}

fn lens_anchor_label(tick12: u8) -> String {
    let position = tick12 % 6;
    if tick12 < 6 {
        format!("L{position}")
    } else {
        format!("L{position}'")
    }
}

fn note_name(pitch_class: u8) -> &'static str {
    match pitch_class % 12 {
        0 => "C",
        1 => "C#",
        2 => "D",
        3 => "D#",
        4 => "E",
        5 => "F",
        6 => "F#",
        7 => "G",
        8 => "G#",
        9 => "A",
        10 => "A#",
        _ => "B",
    }
}

fn mirror_square(position: u8) -> &'static str {
    match position {
        0 | 5 => "Sq1",
        1 | 4 => "Sq2",
        _ => "Sq3",
    }
}

fn ratio_role_for_sub_tick(sub_tick: u8) -> &'static str {
    match harmonic_ratio_fraction_for_sub_tick(sub_tick) {
        (1, 1) => "1/1 unison standing identity",
        (9, 8) => "9/8 epogdoon tick",
        (4, 3) => "4/3 perfect-fourth manifestation",
        (3, 4) => "3/4 perfect-fourth recognition",
        (3, 2) => "3/2 perfect-fifth aspiration",
        (2, 3) => "2/3 perfect-fifth grounding",
        _ => "derived harmonic ratio",
    }
}

fn conjugate_form_character_for_mode(mode: u8) -> ConjugateFormCharacter {
    match mode % 7 {
        0 | 3 | 4 => ConjugateFormCharacter::Major,
        6 => ConjugateFormCharacter::ShadowInversion,
        _ => ConjugateFormCharacter::Minor,
    }
}

fn p_position_element(position: u8) -> &'static str {
    match position % 6 {
        0 => "Aether",
        1 => "Earth",
        2 => "Air",
        3 => "Water",
        4 => "Earth",
        _ => "Aether",
    }
}

fn l2_prime_element(position: u8) -> &'static str {
    match position % 6 {
        0 => "Aether",
        1 => "Earth",
        2 => "Water",
        3 => "Air",
        4 => "Fire",
        _ => "Salt",
    }
}

pub fn kernel_tick_from_epogdoon(cycle: u64, sub_tick: u8) -> KernelTick {
    let tick = sub_tick % 12;
    let element = match tick {
        0 => KernelElement::BimbaEncoding,
        1 => KernelElement::PratibimbaPrehension,
        2 | 3 => KernelElement::MobiusDescent,
        4 => KernelElement::SlashFlip,
        5 => KernelElement::PratibimbaAsBimba,
        6 => KernelElement::DoubledPrehension,
        7 | 8 => KernelElement::InverseMobius,
        _ => KernelElement::EnrichedReturn,
    };
    let (ratio_num, ratio_den) = harmonic_ratio_fraction_for_sub_tick(tick);
    KernelTick {
        cycle,
        sub_tick: tick,
        phase: if tick < 6 {
            KernelPhase::Descent
        } else {
            KernelPhase::Ascent
        },
        element,
        position6: tick % 6,
        harmonic_ratio: ratio_num as f32 / ratio_den as f32,
    }
}

#[cfg(feature = "resonance_ebm_runtime")]
pub const EBM_RUNTIME_NOT_LOADED: &str = "EBM_RUNTIME_NOT_LOADED";
#[cfg(feature = "resonance_ebm_runtime")]
pub const LEGACY_EPI_TAURI_EBM_MODEL_PATH: &str =
    "vendor/legacy/epi-tauri/resonance-ebm-runtime.json";
#[cfg(feature = "resonance_ebm_runtime")]
const EBM_INPUT_DIM: usize = 8;
#[cfg(feature = "resonance_ebm_runtime")]
const EBM_EMBEDDING_DIM: usize = 8;

#[cfg(feature = "resonance_ebm_runtime")]
#[derive(Clone, Debug, PartialEq)]
pub struct ResonanceEbmRuntimeStep {
    pub updated_state: BioQuaternionState,
    pub metric: Option<&'static str>,
    pub descent_steps: u8,
    pub element_boundary_index: Option<u8>,
    pub resonance_vector: Option<ResonanceVector72>,
    pub e_5_harmonic_energy: f32,
    pub ground_state_log_probability: Option<f32>,
    pub checkpoint_ref: Option<String>,
}

#[cfg(feature = "resonance_ebm_runtime")]
#[derive(Clone, Debug, PartialEq)]
pub struct ResonanceEbmEvaluation {
    pub resonance_vector: ResonanceVector72,
    pub e_5_harmonic_energy: f32,
    pub ambient_qp_gradient: [f64; 4],
    pub ground_state_log_probability: f32,
    pub checkpoint_ref: String,
}

#[cfg(feature = "resonance_ebm_runtime")]
#[derive(Clone, Debug, PartialEq)]
pub struct ResonanceEbmRuntime {
    checkpoint_ref: String,
    projection: [[f64; EBM_INPUT_DIM]; EBM_EMBEDDING_DIM],
    projection_bias: [f64; EBM_EMBEDDING_DIM],
    resonance_head: [[f64; EBM_EMBEDDING_DIM]; RESONANCE_DIM],
    resonance_bias: [f64; RESONANCE_DIM],
    ground_state_log_z: f64,
}

#[cfg(feature = "resonance_ebm_runtime")]
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResonanceEbmCheckpointJson {
    checkpoint_ref: String,
    bioquaternion_projection: Vec<Vec<f64>>,
    projection_bias: Vec<f64>,
    resonance_head: Vec<Vec<f64>>,
    resonance_bias: Vec<f64>,
    #[serde(default)]
    ground_state_log_z: f64,
}

#[cfg(feature = "resonance_ebm_runtime")]
impl ResonanceEbmRuntime {
    pub fn from_legacy_vendor_path() -> Option<Self> {
        Self::from_path(LEGACY_EPI_TAURI_EBM_MODEL_PATH).ok()
    }

    pub fn from_path(path: impl AsRef<std::path::Path>) -> Result<Self, String> {
        let contents = std::fs::read_to_string(path.as_ref()).map_err(|err| err.to_string())?;
        Self::from_json_str(&contents)
    }

    pub fn from_json_str(contents: &str) -> Result<Self, String> {
        let checkpoint: ResonanceEbmCheckpointJson =
            serde_json::from_str(contents).map_err(|err| err.to_string())?;
        if checkpoint.checkpoint_ref.trim().is_empty() {
            return Err("EBM checkpointRef must be non-empty".to_owned());
        }
        Ok(Self {
            checkpoint_ref: checkpoint.checkpoint_ref,
            projection: matrix_from_vec::<EBM_EMBEDDING_DIM, EBM_INPUT_DIM>(
                checkpoint.bioquaternion_projection,
                "bioquaternionProjection",
            )?,
            projection_bias: vector_from_vec::<EBM_EMBEDDING_DIM>(
                checkpoint.projection_bias,
                "projectionBias",
            )?,
            resonance_head: matrix_from_vec::<RESONANCE_DIM, EBM_EMBEDDING_DIM>(
                checkpoint.resonance_head,
                "resonanceHead",
            )?,
            resonance_bias: vector_from_vec::<RESONANCE_DIM>(
                checkpoint.resonance_bias,
                "resonanceBias",
            )?,
            ground_state_log_z: checkpoint.ground_state_log_z,
        })
    }

    pub fn checkpoint_ref(&self) -> &str {
        &self.checkpoint_ref
    }

    pub fn forward(&self, state: &BioQuaternionState) -> ResonanceEbmEvaluation {
        let input = [
            state.q_b[0] as f64,
            state.q_b[1] as f64,
            state.q_b[2] as f64,
            state.q_b[3] as f64,
            state.q_p[0] as f64,
            state.q_p[1] as f64,
            state.q_p[2] as f64,
            state.q_p[3] as f64,
        ];
        let mut embedding = [0.0f64; EBM_EMBEDDING_DIM];
        let mut embedding_derivative = [0.0f64; EBM_EMBEDDING_DIM];
        for row in 0..EBM_EMBEDDING_DIM {
            let activation = self.projection_bias[row]
                + self.projection[row]
                    .iter()
                    .zip(input.iter())
                    .map(|(weight, value)| weight * value)
                    .sum::<f64>();
            embedding[row] = activation.tanh();
            embedding_derivative[row] = 1.0 - (embedding[row] * embedding[row]);
        }

        let mut values = [0.0f32; RESONANCE_DIM];
        let mut energy = 0.0f64;
        let mut d_energy_d_embedding = [0.0f64; EBM_EMBEDDING_DIM];
        for channel in 0..RESONANCE_DIM {
            let activation = self.resonance_bias[channel]
                + self.resonance_head[channel]
                    .iter()
                    .zip(embedding.iter())
                    .map(|(weight, value)| weight * value)
                    .sum::<f64>();
            let value = sigmoid(activation);
            values[channel] = value as f32;
            energy += value;
            let d_energy_d_activation = value * (1.0 - value) / RESONANCE_DIM as f64;
            for emb in 0..EBM_EMBEDDING_DIM {
                d_energy_d_embedding[emb] +=
                    d_energy_d_activation * self.resonance_head[channel][emb];
            }
        }
        energy /= RESONANCE_DIM as f64;

        let mut d_energy_d_input = [0.0f64; EBM_INPUT_DIM];
        for emb in 0..EBM_EMBEDDING_DIM {
            let d_embedding = d_energy_d_embedding[emb] * embedding_derivative[emb];
            for input_idx in 0..EBM_INPUT_DIM {
                d_energy_d_input[input_idx] += d_embedding * self.projection[emb][input_idx];
            }
        }

        ResonanceEbmEvaluation {
            resonance_vector: ResonanceVector72 { values },
            e_5_harmonic_energy: energy as f32,
            ambient_qp_gradient: [
                d_energy_d_input[4],
                d_energy_d_input[5],
                d_energy_d_input[6],
                d_energy_d_input[7],
            ],
            ground_state_log_probability: (-energy - self.ground_state_log_z) as f32,
            checkpoint_ref: self.checkpoint_ref.clone(),
        }
    }
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_default_resonance_ebm_runtime() -> Option<&'static ResonanceEbmRuntime> {
    static RUNTIME: std::sync::OnceLock<Option<ResonanceEbmRuntime>> = std::sync::OnceLock::new();
    RUNTIME
        .get_or_init(ResonanceEbmRuntime::from_legacy_vendor_path)
        .as_ref()
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_resonance_ebm_runtime_step(
    state: &BioQuaternionState,
    tick: KernelTick,
    runtime: Option<&ResonanceEbmRuntime>,
) -> ResonanceEbmRuntimeStep {
    let Some(element_boundary_index) = kernel_element_boundary_index_for_tick(tick.sub_tick) else {
        return ResonanceEbmRuntimeStep {
            updated_state: state.clone(),
            metric: None,
            descent_steps: 0,
            element_boundary_index: None,
            resonance_vector: None,
            e_5_harmonic_energy: 0.0,
            ground_state_log_probability: None,
            checkpoint_ref: None,
        };
    };

    let Some(runtime) = runtime else {
        return ResonanceEbmRuntimeStep {
            updated_state: state.clone(),
            metric: Some(EBM_RUNTIME_NOT_LOADED),
            descent_steps: 0,
            element_boundary_index: Some(element_boundary_index),
            resonance_vector: None,
            e_5_harmonic_energy: 0.0,
            ground_state_log_probability: None,
            checkpoint_ref: None,
        };
    };

    let evaluation = runtime.forward(state);
    let mut updated_state = state.clone();
    if tick.element == KernelElement::InverseMobius {
        updated_state.q_b = f64_quat_to_f32(kernel_riemannian_step(
            f32_quat_to_f64(state.q_b),
            evaluation.ambient_qp_gradient,
            epogdoon_log() as f64,
        ));
    } else {
        updated_state.q_p = f64_quat_to_f32(kernel_riemannian_step(
            f32_quat_to_f64(state.q_p),
            evaluation.ambient_qp_gradient,
            -(epogdoon_log() as f64),
        ));
    }

    ResonanceEbmRuntimeStep {
        updated_state,
        metric: None,
        descent_steps: 1,
        element_boundary_index: Some(element_boundary_index),
        resonance_vector: Some(evaluation.resonance_vector),
        e_5_harmonic_energy: evaluation.e_5_harmonic_energy,
        ground_state_log_probability: Some(evaluation.ground_state_log_probability),
        checkpoint_ref: Some(evaluation.checkpoint_ref),
    }
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_element_boundary_index_for_tick(tick12: u8) -> Option<u8> {
    match tick12 % 12 {
        0 => Some(0),
        1 => Some(1),
        2 => Some(2),
        4 => Some(3),
        5 => Some(4),
        6 => Some(5),
        7 => Some(6),
        9 => Some(7),
        _ => None,
    }
}

pub fn kernel_tangent_projection_s3(q: [f64; 4], ambient_gradient: [f64; 4]) -> [f64; 4] {
    let q = unit_or_identity_f64(q);
    let radial = dot4(ambient_gradient, q);
    [
        ambient_gradient[0] - radial * q[0],
        ambient_gradient[1] - radial * q[1],
        ambient_gradient[2] - radial * q[2],
        ambient_gradient[3] - radial * q[3],
    ]
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_exp_map_s3(q: [f64; 4], tangent_delta: [f64; 4]) -> [f64; 4] {
    let q = unit_or_identity_f64(q);
    let theta = dot4(tangent_delta, tangent_delta).sqrt();
    if theta <= f64::EPSILON {
        return q;
    }
    let sin_over_theta = theta.sin() / theta;
    unit_or_identity_f64([
        theta.cos() * q[0] + sin_over_theta * tangent_delta[0],
        theta.cos() * q[1] + sin_over_theta * tangent_delta[1],
        theta.cos() * q[2] + sin_over_theta * tangent_delta[2],
        theta.cos() * q[3] + sin_over_theta * tangent_delta[3],
    ])
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_riemannian_step(
    q: [f64; 4],
    ambient_gradient: [f64; 4],
    signed_learning_rate: f64,
) -> [f64; 4] {
    let tangent = kernel_tangent_projection_s3(q, ambient_gradient);
    kernel_exp_map_s3(
        q,
        [
            signed_learning_rate * tangent[0],
            signed_learning_rate * tangent[1],
            signed_learning_rate * tangent[2],
            signed_learning_rate * tangent[3],
        ],
    )
}

#[cfg(feature = "resonance_ebm_runtime")]
pub fn kernel_slerp_quaternion(a: [f64; 4], b: [f64; 4], t: f64) -> [f64; 4] {
    let a = unit_or_identity_f64(a);
    let mut b = unit_or_identity_f64(b);
    let mut cos_theta = dot4(a, b).clamp(-1.0, 1.0);
    if cos_theta < 0.0 {
        b = [-b[0], -b[1], -b[2], -b[3]];
        cos_theta = -cos_theta;
    }
    let t = t.clamp(0.0, 1.0);
    if cos_theta > 0.9995 {
        return unit_or_identity_f64([
            a[0] + t * (b[0] - a[0]),
            a[1] + t * (b[1] - a[1]),
            a[2] + t * (b[2] - a[2]),
            a[3] + t * (b[3] - a[3]),
        ]);
    }
    let theta = cos_theta.acos();
    let sin_theta = theta.sin();
    let a_scale = ((1.0 - t) * theta).sin() / sin_theta;
    let b_scale = (t * theta).sin() / sin_theta;
    [
        a_scale * a[0] + b_scale * b[0],
        a_scale * a[1] + b_scale * b[1],
        a_scale * a[2] + b_scale * b[2],
        a_scale * a[3] + b_scale * b[3],
    ]
}

#[cfg(feature = "resonance_ebm_runtime")]
fn matrix_from_vec<const ROWS: usize, const COLS: usize>(
    values: Vec<Vec<f64>>,
    field: &str,
) -> Result<[[f64; COLS]; ROWS], String> {
    if values.len() != ROWS {
        return Err(format!("{field} must contain {ROWS} rows"));
    }
    let mut matrix = [[0.0f64; COLS]; ROWS];
    for (row_idx, row) in values.into_iter().enumerate() {
        if row.len() != COLS {
            return Err(format!("{field}[{row_idx}] must contain {COLS} columns"));
        }
        for (col_idx, value) in row.into_iter().enumerate() {
            if !value.is_finite() {
                return Err(format!("{field}[{row_idx}][{col_idx}] must be finite"));
            }
            matrix[row_idx][col_idx] = value;
        }
    }
    Ok(matrix)
}

#[cfg(feature = "resonance_ebm_runtime")]
fn vector_from_vec<const LEN: usize>(values: Vec<f64>, field: &str) -> Result<[f64; LEN], String> {
    if values.len() != LEN {
        return Err(format!("{field} must contain {LEN} values"));
    }
    let mut vector = [0.0f64; LEN];
    for (idx, value) in values.into_iter().enumerate() {
        if !value.is_finite() {
            return Err(format!("{field}[{idx}] must be finite"));
        }
        vector[idx] = value;
    }
    Ok(vector)
}

#[cfg(feature = "resonance_ebm_runtime")]
fn sigmoid(value: f64) -> f64 {
    if value >= 0.0 {
        1.0 / (1.0 + (-value).exp())
    } else {
        let exp = value.exp();
        exp / (1.0 + exp)
    }
}

#[cfg(feature = "resonance_ebm_runtime")]
fn f32_quat_to_f64(q: [f32; 4]) -> [f64; 4] {
    [q[0] as f64, q[1] as f64, q[2] as f64, q[3] as f64]
}

#[cfg(feature = "resonance_ebm_runtime")]
fn f64_quat_to_f32(q: [f64; 4]) -> [f32; 4] {
    [q[0] as f32, q[1] as f32, q[2] as f32, q[3] as f32]
}

fn dot4(a: [f64; 4], b: [f64; 4]) -> f64 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
}

fn unit_or_identity_f64(q: [f64; 4]) -> [f64; 4] {
    let norm_sq = dot4(q, q);
    if norm_sq <= 0.0 || !norm_sq.is_finite() {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        let scale = 1.0 / norm_sq.sqrt();
        [q[0] * scale, q[1] * scale, q[2] * scale, q[3] * scale]
    }
}

fn unit_or_identity(q: [f32; 4]) -> [f32; 4] {
    let norm_sq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    if norm_sq <= 0.0 {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        let scale = 1.0 / norm_sq.sqrt();
        [q[0] * scale, q[1] * scale, q[2] * scale, q[3] * scale]
    }
}

#[cfg(test)]
fn test_near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
}

#[cfg(test)]
#[test]
fn total_energy_4_5_6_weighting() {
    let e_4 = 0.25;
    let e_5 = 0.5;
    let e_6 = 0.75;

    assert!(test_near(
        canonical_total_energy(e_4, e_5, e_6),
        ((4.0 * e_4) + (5.0 * e_5) + (6.0 * e_6)) / 15.0
    ));
}

#[cfg(test)]
#[test]
fn bimba_pratibimba_is_diagnostic_only() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
    let energy = kernel_energy_evaluate(
        &state,
        &E4PersonalInputs::default(),
        &E5HarmonicInputs::default(),
        &E6VerifierInputs::default(),
    );

    assert!(energy.bimba_pratibimba_energy > 0.0);
    assert!(test_near(energy.e_4_personal_energy, 0.0));
    assert!(test_near(energy.e_5_harmonic_energy, 0.0));
    assert!(test_near(energy.e_6_verifier_energy, 0.0));
    assert!(test_near(energy.total_energy, 0.0));
}

#[cfg(test)]
mod energy_decomposition_tests {
    use super::*;

    fn near(a: f32, b: f32) -> bool {
        (a - b).abs() < 0.0001
    }

    #[test]
    fn total_energy_4_5_6_weighting() {
        let e_4 = 0.25;
        let e_5 = 0.5;
        let e_6 = 0.75;

        assert!(near(
            canonical_total_energy(e_4, e_5, e_6),
            ((4.0 * e_4) + (5.0 * e_5) + (6.0 * e_6)) / 15.0
        ));
    }

    #[test]
    fn bimba_pratibimba_is_diagnostic_only() {
        let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
        let energy = kernel_energy_evaluate(
            &state,
            &E4PersonalInputs::default(),
            &E5HarmonicInputs::default(),
            &E6VerifierInputs::default(),
        );

        assert!(energy.bimba_pratibimba_energy > 0.0);
        assert!(near(energy.e_4_personal_energy, 0.0));
        assert!(near(energy.e_5_harmonic_energy, 0.0));
        assert!(near(energy.e_6_verifier_energy, 0.0));
        assert!(near(energy.total_energy, 0.0));
    }

    #[test]
    fn temporal_energy_serializes_canonical_and_diagnostic_fields() {
        let temporal = KernelTemporalEnergy::from_energy(EnergyDecomposition {
            bimba_pratibimba_energy: 9.0,
            e_4_personal_energy: 1.0,
            e_5_harmonic_energy: 2.0,
            e_6_verifier_energy: 3.0,
            total_energy: canonical_total_energy(1.0, 2.0, 3.0),
        });
        let json = serde_json::to_value(temporal).expect("temporal energy serializes");

        assert_eq!(json["bimbaPratibimbaEnergy"], "9.000000");
        assert_eq!(json["e4PersonalEnergy"], "1.000000");
        assert_eq!(json["e5HarmonicEnergy"], "2.000000");
        assert_eq!(json["e6VerifierEnergy"], "3.000000");
        assert_eq!(json["totalEnergy"], "2.133333");
    }

    #[test]
    fn kernel_projection_stub_zero_energy_uses_new_input_handles() {
        let projection = KernelProjection::from_clock_state(
            0,
            0,
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            None,
            &E4PersonalInputs::default(),
            &E5HarmonicInputs::default(),
            &E6VerifierInputs::default(),
        );

        assert!(projection.energy.bimba_pratibimba_energy > 0.0);
        assert!(near(projection.energy.total_energy, 0.0));
    }
}

#[cfg(all(test, feature = "resonance_ebm_runtime"))]
mod resonance_ebm_runtime_tests {
    use super::*;

    fn dot(a: [f64; 4], b: [f64; 4]) -> f64 {
        a.iter().zip(b.iter()).map(|(a, b)| a * b).sum()
    }

    fn norm(q: [f64; 4]) -> f64 {
        dot(q, q).sqrt()
    }

    #[test]
    fn riemannian_projection_is_tangent_to_s3() {
        let q = [0.5, 0.5, 0.5, 0.5];
        let ambient = [0.25, -0.75, 0.5, 0.125];
        let tangent = kernel_tangent_projection_s3(q, ambient);

        assert!(dot(q, tangent).abs() <= f64::EPSILON * 16.0);
    }

    #[test]
    fn mobius_descent_uses_exponential_map_and_preserves_unit_quaternion() {
        let q = [1.0, 0.0, 0.0, 0.0];
        let ambient = [0.0, 1.0, 0.0, 0.0];
        let stepped = kernel_riemannian_step(q, ambient, -epogdoon_log() as f64);

        assert!((norm(stepped) - 1.0).abs() <= f64::EPSILON * 16.0);
        assert!(stepped[1] < 0.0, "descent must move opposite the gradient");
    }

    #[test]
    fn element_boundary_cadence_invokes_ebm_exactly_eight_times_per_cycle() {
        let boundaries: Vec<_> = (0u8..12)
            .filter_map(kernel_element_boundary_index_for_tick)
            .collect();

        assert_eq!(boundaries, vec![0, 1, 2, 3, 4, 5, 6, 7]);
    }

    #[test]
    fn unloaded_ebm_runtime_emits_metric_and_keeps_state_stable() {
        let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
        let tick = kernel_tick_from_epogdoon(2, 2);
        let outcome = kernel_resonance_ebm_runtime_step(&state, tick, None);

        assert_eq!(outcome.metric, Some(EBM_RUNTIME_NOT_LOADED));
        assert_eq!(outcome.updated_state, state);
        assert_eq!(outcome.descent_steps, 0);
    }

    #[test]
    fn loaded_ebm_runtime_forward_injects_gradient_into_mobius_step() {
        let mut projection = vec![vec![0.0; EBM_INPUT_DIM]; EBM_EMBEDDING_DIM];
        for idx in 0..EBM_INPUT_DIM {
            projection[idx][idx] = 1.0;
        }
        let mut resonance_head = vec![vec![0.0; EBM_EMBEDDING_DIM]; RESONANCE_DIM];
        for row in &mut resonance_head {
            row[5] = 1.0;
        }
        let checkpoint = serde_json::json!({
            "checkpointRef": "test-ebm-v1",
            "bioquaternionProjection": projection,
            "projectionBias": vec![0.0; EBM_EMBEDDING_DIM],
            "resonanceHead": resonance_head,
            "resonanceBias": vec![0.0; RESONANCE_DIM],
            "groundStateLogZ": 0.0
        });
        let runtime = ResonanceEbmRuntime::from_json_str(&checkpoint.to_string())
            .expect("synthetic checkpoint should load through the production parser");
        let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]);
        let tick = kernel_tick_from_epogdoon(2, 2);
        let outcome = kernel_resonance_ebm_runtime_step(&state, tick, Some(&runtime));

        assert_eq!(outcome.metric, None);
        assert_eq!(outcome.descent_steps, 1);
        assert_eq!(outcome.checkpoint_ref.as_deref(), Some("test-ebm-v1"));
        assert!(outcome.resonance_vector.is_some());
        assert!(outcome.e_5_harmonic_energy.is_finite());
        assert!(outcome.ground_state_log_probability.unwrap().is_finite());
        assert!(outcome.updated_state.q_p[1] < 0.0);
        assert!((norm(f32_quat_to_f64(outcome.updated_state.q_p)) - 1.0).abs() < 0.000001);
    }
}
