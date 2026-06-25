use serde::ser::SerializeSeq;
use serde::{Deserialize, Serialize};

use crate::codon_rotation_projection::{
    codon_charge_quaternion, codon_rotation_from_lens_mode, CodonRotationProjection,
    MathemeLensMode,
};
use crate::events::KleinFlipEvent;
use crate::mahamaya::MahamayaCodecProjection;
use crate::parashakti::vimarsha_read_profile;
use crate::personal_identity::{PersonalIdentityProfile, PersonalResonance};
use crate::profile_projections::{
    AnuttaraWitnessProjection, CanonRecognitionEvent, CosmicCompositionState,
    PasuBeingPatternProjection, PersonalPoleProjection, PsychoidFieldProjection,
};
use crate::vak_address::VakAddress;
use std::fmt;

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
}

impl KernelTemporalProjection {
    pub const COORDINATE_OWNER: &'static str = "S0/QL-meta";
    pub const PROJECTION_OWNER: &'static str = "S3'";
    pub const PRIVACY: &'static str = "safe-public-current-kernel-tick";
    pub const COMPUTATION_SOURCE: &'static str = "portal-core::KernelProjection";

    pub fn from_kernel_projection(generation: u64, projection: &KernelProjection) -> Self {
        Self {
            coordinate_owner: Self::COORDINATE_OWNER.to_owned(),
            projection_owner: Self::PROJECTION_OWNER.to_owned(),
            privacy: Self::PRIVACY.to_owned(),
            computation_source: Self::COMPUTATION_SOURCE.to_owned(),
            generation,
            tick: KernelTemporalTick::from_tick(projection.tick),
            harmonic_pulse: KernelTemporalPulse::from_pulse(projection.harmonic_pulse),
            energy: KernelTemporalEnergy::from_energy(projection.energy),
            harmonic_profile: MathemeHarmonicProfile::from_tick(projection.tick),
        }
    }

    pub fn from_clock_tick(timestamp_ms: u64, generation: u64) -> Self {
        let total_seconds = timestamp_ms / 1_000;
        let cycle = total_seconds / 12;
        let sub_tick = (total_seconds % 12) as u8;
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

pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 1;

fn default_profile_schema_version() -> u16 {
    CURRENT_PROFILE_SCHEMA_VERSION
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeProfileProvenance {
    pub owner: String,
    pub contract: String,
    pub source: String,
    pub compatibility: MathemeProfileCompatibility,
}

impl MathemeProfileProvenance {
    fn current_public() -> Self {
        Self::default()
    }
}

impl Default for MathemeProfileProvenance {
    fn default() -> Self {
        Self {
            owner: "portal-core".to_owned(),
            contract: "MathemeHarmonicProfile.public-current".to_owned(),
            source: "S0 kernel tick + portal-core harmonic/codon/Vimarsha projections".to_owned(),
            compatibility: MathemeProfileCompatibility::default(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeProfileCompatibility {
    pub binary_alias: String,
    pub mahamaya_alias: String,
    pub policy: String,
}

impl Default for MathemeProfileCompatibility {
    fn default() -> Self {
        Self {
            binary_alias: "binary".to_owned(),
            mahamaya_alias: "mahamaya".to_owned(),
            policy: "binary and mahamaya serialize the same projection during IOD-04 migration"
                .to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeTickAddress {
    pub cycle: u64,
    pub sub_tick: u8,
    pub tick12: u8,
    pub absolute_tick: u64,
    pub phase: KernelPhase,
}

impl MathemeTickAddress {
    fn from_tick(tick: KernelTick, absolute_tick: u64, tick12: u8) -> Self {
        Self {
            cycle: tick.cycle,
            sub_tick: tick.sub_tick,
            tick12,
            absolute_tick,
            phase: tick.phase,
        }
    }
}

impl Default for MathemeTickAddress {
    fn default() -> Self {
        Self {
            cycle: 0,
            sub_tick: 0,
            tick12: 0,
            absolute_tick: 0,
            phase: KernelPhase::Descent,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeFutureAnchor {
    pub coordinate: String,
    pub readiness: String,
    pub provenance: String,
}

impl MathemeFutureAnchor {
    fn s2_coordinate_anchor(coordinate: &str) -> Self {
        Self {
            coordinate: coordinate.to_owned(),
            readiness: "cycle-2-s2-coordinate-anchor".to_owned(),
            provenance: "Body/S/S2/graph-services/src/pointers.rs::kernel_coordinate_anchor_for"
                .to_owned(),
        }
    }

    fn s3_profile_observation_anchor(coordinate: &str) -> Self {
        Self {
            coordinate: coordinate.to_owned(),
            readiness: "cycle-2-s3-profile-observation-anchor".to_owned(),
            provenance:
                "Body/S/S0/portal-core/src/events/kernel_events.rs::KernelProfileObservationEvent::from_profile"
                    .to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BedrockProvenanceHandle {
    KernelMathemeBedrockProjectionV1,
}

impl BedrockProvenanceHandle {
    pub fn provenance_chain(self) -> String {
        match self {
            Self::KernelMathemeBedrockProjectionV1 => format!(
                "{}:{} -> .rodata -> MathemeHarmonicProfile.bedrock -> readinessLedger.bedrock_link",
                "Body/S/S0/portal-core/src/kernel.rs",
                line!()
            ),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MathemeHarmonicProfileReadinessState {
    Authoritative,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct MathemeHarmonicProfileReadinessFact {
    pub field: String,
    pub state: MathemeHarmonicProfileReadinessState,
    pub bedrock_link: BedrockProvenanceHandle,
    pub provenance_chain: String,
}

impl MathemeHarmonicProfileReadinessFact {
    fn bedrock() -> Self {
        let bedrock_link = BedrockProvenanceHandle::KernelMathemeBedrockProjectionV1;
        Self {
            field: "bedrock".to_owned(),
            state: MathemeHarmonicProfileReadinessState::Authoritative,
            bedrock_link,
            provenance_chain: bedrock_link.provenance_chain(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositionAnchorProjection {
    pub source_coordinate: String,
    pub resonance72_index: usize,
    pub mahamaya_address64: Option<u8>,
    pub s3_method: String,
    pub privacy_boundary: String,
}

impl DepositionAnchorProjection {
    fn from_profile_parts(
        source_coordinate: &str,
        resonance72_index: usize,
        mahamaya_address64: Option<u8>,
    ) -> Self {
        Self {
            source_coordinate: source_coordinate.to_owned(),
            resonance72_index,
            mahamaya_address64,
            s3_method: "s5.episodic.kernel_profile_observation.deposit".to_owned(),
            privacy_boundary: "public-current-context-to-protected-local-episodic-memory"
                .to_owned(),
        }
    }
}

impl Default for DepositionAnchorProjection {
    fn default() -> Self {
        Self::from_profile_parts("M0", 0, None)
    }
}

/// Typed graph residency home for a profile-bus coordinate.
///
/// Mirrors the M-branch + kernel-observation slice of
/// `epi_s2_graph_schema::CoordinateHome` (S2 graph-schema canon, Tranche 17.17).
/// portal-core (S0) does not link the S2 graph-schema crate — `epi-cli` is the
/// S0 crate that depends on it directly — so this is the projection mirror
/// published through the harmonic profile bus. Variants serialise to the
/// identical canon strings (`"M"`, `"M0'"`, `"S2-5"`, …) so an M' surface reads
/// the typed home here instead of re-parsing the coordinate string per tick.
///
/// The bus only ever produces M-branch psychoid homes; canon defines specific
/// `Mn'` variants for every pratibimba position but only the generic `M` family
/// home and the explicit `M5` for the bimba helix, so bimba positions 0..4 land
/// on the generic family home (the exact position stays in `canonical_form`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoordinateHome {
    #[serde(rename = "M")]
    M,
    #[serde(rename = "M0'")]
    M0Prime,
    #[serde(rename = "M1'")]
    M1Prime,
    #[serde(rename = "M2'")]
    M2Prime,
    #[serde(rename = "M3'")]
    M3Prime,
    #[serde(rename = "M4'")]
    M4Prime,
    #[serde(rename = "M5")]
    M5,
    #[serde(rename = "M5'")]
    M5Prime,
    #[serde(rename = "S2-5")]
    S2_5,
}

impl CoordinateHome {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::M => "M",
            Self::M0Prime => "M0'",
            Self::M1Prime => "M1'",
            Self::M2Prime => "M2'",
            Self::M3Prime => "M3'",
            Self::M4Prime => "M4'",
            Self::M5 => "M5",
            Self::M5Prime => "M5'",
            Self::S2_5 => "S2-5",
        }
    }

    /// Resolve the canon home for a tick-derived M-branch anchor. Pratibimba
    /// positions map to their explicit `Mn'` home; the bimba helix carries the
    /// generic `M` family home except for the explicit `M5` boundary.
    fn from_anchor(position6: u8, is_prime: bool) -> Self {
        if is_prime {
            match position6 % 6 {
                0 => Self::M0Prime,
                1 => Self::M1Prime,
                2 => Self::M2Prime,
                3 => Self::M3Prime,
                4 => Self::M4Prime,
                _ => Self::M5Prime,
            }
        } else if position6 % 6 == 5 {
            Self::M5
        } else {
            Self::M
        }
    }
}

/// Option-1 GDS overlay readiness for the active coordinate, surfaced so Theia
/// can render the cycle gate without a separate `graph doctor` call. Mirrors the
/// S2 readiness ladder (`Body/S/S2/graph-services/src/gds.rs`): `blocked` is the
/// production state for the default APOC-only local topology, `projection_ready`
/// once the `s2_public_bimba_option1_v1` projection exists, `algorithm_active`
/// once the projection runner is explicitly invoked.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GdsOverlayState {
    #[default]
    Blocked,
    ProjectionReady,
    AlgorithmActive,
}

/// Pre-resolved S2 graph anchor for the active coordinate, published on the
/// profile bus so M' surfaces stop re-parsing `canonical_form` through the S2
/// `CoordinateArrayParser` on every tick (S2-ARCHITECTURE.md §4.3 / §10.4).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphAnchorProjection {
    pub canonical_form: String,
    pub depth: i8,
    pub prefix: String,
    pub parent: Option<String>,
    pub axis: String,
    pub coordinate_home: CoordinateHome,
    pub gds_overlay_state: GdsOverlayState,
    pub resolver_provenance: String,
}

impl GraphAnchorProjection {
    fn from_anchor(source_coordinate: &str, position6: u8, helix: &str) -> Self {
        let is_prime = helix == "pratibimba";
        Self {
            canonical_form: source_coordinate.to_owned(),
            // Tick-derived anchors are top-level psychoid positions; S2 raises
            // `depth` for `-`/`.` sub-coordinates (M0-2 is depth 1, M0-2-4 is 2).
            depth: 0,
            prefix: "M".to_owned(),
            parent: Some("M".to_owned()),
            axis: helix.to_owned(),
            coordinate_home: CoordinateHome::from_anchor(position6, is_prime),
            gds_overlay_state: GdsOverlayState::Blocked,
            resolver_provenance:
                "Body/S/S2/graph-services/src/coordinate.rs::CoordinateArrayParser (pre-resolved at the S0 profile bus to avoid per-tick re-parse)"
                    .to_owned(),
        }
    }
}

impl Default for GraphAnchorProjection {
    fn default() -> Self {
        Self::from_anchor("M0", 0, "bimba")
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicProfile {
    #[serde(default = "default_profile_schema_version")]
    pub profile_schema_version: u16,
    #[serde(default)]
    pub profile_provenance: MathemeProfileProvenance,
    #[serde(default)]
    pub tick_address: MathemeTickAddress,
    pub tick: u64,
    pub tick12: u8,
    pub cycle: u64,
    pub degree720: u16,
    pub degree360: u16,
    pub su2_layer: String,
    pub phase: KernelPhase,
    pub position6: u8,
    pub helix: String,
    pub ratio_role: String,
    pub lens_mode: MathemeLensMode,
    #[serde(default)]
    pub klein_flip: Option<KleinFlipEvent>,
    #[serde(default)]
    pub ananda_vortex: AnandaVortexProjection,
    pub chromatic: MathemeChromaticProfile,
    pub diatonic: Option<MathemeDiatonicContext>,
    pub resonance72: MathemeResonance72Projection,
    #[serde(default)]
    pub deposition_anchor: DepositionAnchorProjection,
    #[serde(default)]
    pub graph_handle: GraphAnchorProjection,
    pub audio_octet: [f32; 8],
    pub nodal_quartet: [MathemeNodalConstraint; 4],
    pub elements: MathemeElementalProjection,
    pub planetary_chakral: MathemePlanetaryChakralProjection,
    pub binary: MathemeBinaryProjection,
    pub mahamaya: MathemeBinaryProjection,
    pub codon_rotation_projection: CodonRotationProjection,
    pub q_cosmic: [f32; 4],
    pub resonance: Option<f32>,
    pub conjugate_form_character: ConjugateFormCharacter,
    pub privacy_class: ProfilePrivacyClass,
    pub bedrock: MathemeBedrockProjection,
    #[serde(default)]
    pub readiness_ledger: Vec<MathemeHarmonicProfileReadinessFact>,
    pub pointer_anchor: MathemePointerAnchorProjection,
    pub context_frames: MathemeContextFrameWebProjection,
    pub harmonic_grammar: MathemeHarmonicGrammarProjection,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pasu_being_pattern: Option<PasuBeingPatternProjection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anuttara_witness: Option<AnuttaraWitnessProjection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cosmic_composition_state: Option<CosmicCompositionState>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub personal_pole: Option<PersonalPoleProjection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub psychoid_field: Option<PsychoidFieldProjection>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub canon_recognition_stream: Vec<CanonRecognitionEvent>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
    #[serde(default)]
    pub s2_anchor: Option<MathemeFutureAnchor>,
    #[serde(default)]
    pub s3_anchor: Option<MathemeFutureAnchor>,
}

impl MathemeHarmonicProfile {
    pub fn from_tick(tick: KernelTick) -> Self {
        let tick12 = tick.sub_tick % 12;
        let helix = if tick12 < 6 { "bimba" } else { "pratibimba" };
        let position = tick12 % 6;
        let pitch_class = pitch_class_for_tick(tick12);
        let degree720 = tick12 as u16 * 60;
        let degree360 = degree720 % 360;
        let diatonic = MathemeDiatonicContext::from_pitch_class(pitch_class);
        let resonance72 = MathemeResonance72Projection::from_tick(tick12, position);
        let lens_mode = MathemeLensMode::new(
            tick12,
            diatonic
                .as_ref()
                .map(|context| context.degree - 1)
                .unwrap_or(position % 7),
        )
        .expect("tick-derived lens-mode remains in the 12x7 landscape");
        let codon_rotation_projection =
            codon_rotation_from_lens_mode(lens_mode.lens, lens_mode.mode)
                .expect("tick-derived lens-mode maps into the codon-rotation surface");
        let q_cosmic = codon_charge_quaternion(codon_rotation_projection.codon_id);
        let vimarsha_reading = vimarsha_read_profile(tick, lens_mode);
        let absolute_tick = tick.cycle * 12 + tick12 as u64;
        let source_coordinate = anchor_coordinate_for_profile(position, helix);
        let binary = MathemeBinaryProjection::from_clock(
            degree360,
            position,
            resonance72.lens_anchor_index,
            tick12 >= 6,
        );
        let deposition_anchor = DepositionAnchorProjection::from_profile_parts(
            &source_coordinate,
            resonance72.lens_anchor_index,
            binary.mahamaya_address64,
        );
        let graph_handle =
            GraphAnchorProjection::from_anchor(&source_coordinate, position, helix);
        Self {
            profile_schema_version: CURRENT_PROFILE_SCHEMA_VERSION,
            profile_provenance: MathemeProfileProvenance::current_public(),
            tick_address: MathemeTickAddress::from_tick(tick, absolute_tick, tick12),
            tick: absolute_tick,
            tick12,
            cycle: tick.cycle,
            degree720,
            degree360,
            su2_layer: if degree720 >= 360 {
                "shadow"
            } else {
                "primary"
            }
            .to_owned(),
            phase: tick.phase,
            position6: position,
            helix: helix.to_owned(),
            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),
            lens_mode,
            klein_flip: vimarsha_reading.klein_flip,
            ananda_vortex: AnandaVortexProjection::from_tick(tick12, position, degree720),
            chromatic: MathemeChromaticProfile::from_tick(tick12, position, pitch_class),
            diatonic: diatonic.clone(),
            resonance72,
            deposition_anchor,
            graph_handle,
            audio_octet: vimarsha_reading.audio_octet,
            nodal_quartet: vimarsha_reading.nodal_quartet,
            elements: MathemeElementalProjection::from_position(position),
            planetary_chakral: MathemePlanetaryChakralProjection::from_diatonic(diatonic.as_ref()),
            binary: binary.clone(),
            mahamaya: binary,
            codon_rotation_projection,
            q_cosmic,
            resonance: None,
            conjugate_form_character: conjugate_form_character_for_mode(lens_mode.mode),
            privacy_class: ProfilePrivacyClass::PublicCurrentContext,
            bedrock: MathemeBedrockProjection::from_position(position),
            readiness_ledger: vec![MathemeHarmonicProfileReadinessFact::bedrock()],
            pointer_anchor: MathemePointerAnchorProjection::from_tick(
                tick12,
                position,
                helix,
                pitch_class,
            ),
            context_frames: MathemeContextFrameWebProjection::from_diatonic(diatonic.as_ref()),
            harmonic_grammar: MathemeHarmonicGrammarProjection::from_tick(tick12, position),
            pasu_being_pattern: None,
            anuttara_witness: None,
            cosmic_composition_state: None,
            personal_pole: None,
            psychoid_field: None,
            canon_recognition_stream: Vec::new(),
            vak_address: None,
            s2_anchor: Some(MathemeFutureAnchor::s2_coordinate_anchor(
                &source_coordinate,
            )),
            s3_anchor: Some(MathemeFutureAnchor::s3_profile_observation_anchor(
                &source_coordinate,
            )),
        }
    }

    /// Construct a profile for the given tick and attach the supplied
    /// `VakAddress` as the current coordinate-state correlate.
    ///
    /// All other fields follow `from_tick` exactly — this constructor exists so
    /// callers (E4 Tauri command, kernel-side reasoners) can publish harmonic
    /// state and VAK state in a single artifact without reaching past the
    /// public API. The base `from_tick` constructor remains the canonical
    /// path; `vak_address` defaults to `None` there for backward compatibility.
    pub fn with_vak(tick: KernelTick, vak: VakAddress) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.vak_address = Some(vak);
        profile
    }

    pub fn with_pasu_being_pattern(
        tick: KernelTick,
        pasu_being_pattern: PasuBeingPatternProjection,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.pasu_being_pattern = Some(pasu_being_pattern);
        profile
    }

    pub fn with_anuttara_witness(
        tick: KernelTick,
        anuttara_witness: AnuttaraWitnessProjection,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.anuttara_witness = Some(anuttara_witness);
        profile
    }

    pub fn with_composition_projections(
        tick: KernelTick,
        cosmic_composition_state: CosmicCompositionState,
        personal_pole: PersonalPoleProjection,
        psychoid_field: PsychoidFieldProjection,
        canon_recognition_stream: Vec<CanonRecognitionEvent>,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.cosmic_composition_state = Some(cosmic_composition_state);
        profile.personal_pole = Some(personal_pole);
        profile.psychoid_field = Some(psychoid_field);
        profile.canon_recognition_stream = canon_recognition_stream;
        profile
    }

    pub fn from_tick_with_personal_identity(
        tick: KernelTick,
        identity: &PersonalIdentityProfile,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        let resonance = PersonalResonance::from_quaternions(identity.q_personal, profile.q_cosmic);
        profile.resonance = Some(resonance.score);
        profile.conjugate_form_character = resonance.conjugate_form_character;
        profile
    }
}

fn anchor_coordinate_for_profile(position: u8, helix: &str) -> String {
    let prime = if helix == "pratibimba" { "'" } else { "" };
    format!("M{position}{prime}")
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexProjection {
    pub active_matrix_op: AnandaMatrixOp,
    pub active_cell: (u8, u8),
    pub active_cell_value: AnandaVortexCell,
    pub dr_ring_phase: DrRingPhase,
    pub cl42_signature_at_position: i8,
    pub ring_quaternion: [f32; 4],
    pub helix_sheet: u8,
    pub klein_flip_at_this_tick: bool,
}

impl Default for AnandaVortexProjection {
    fn default() -> Self {
        Self::from_tick(0, 0, 0)
    }
}

impl AnandaVortexProjection {
    pub fn from_tick(tick12: u8, position6: u8, degree720: u16) -> Self {
        let row = tick12 % 12;
        let position = position6 % 6;
        let active_matrix_op = AnandaMatrixOp::from_position(position);
        Self {
            active_matrix_op,
            active_cell: (row, position),
            active_cell_value: AnandaVortexCell::from_address(active_matrix_op, row, position),
            dr_ring_phase: DrRingPhase::from_tick12(row),
            cl42_signature_at_position: cl42_signature(position),
            ring_quaternion: ring_quaternion(row),
            helix_sheet: if degree720 >= 360 { 1 } else { 0 },
            klein_flip_at_this_tick: row == 5,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexCell {
    pub family: AnandaMatrixOp,
    pub row_k: u8,
    pub position_p: u8,
    pub raw_value: Option<i16>,
    pub raw_bimba: i16,
    pub raw_pratibimba: i16,
    pub raw_sum: i16,
    pub raw_delta: i8,
    pub dr_value: Option<u8>,
    pub dr_bimba: u8,
    pub dr_pratibimba: u8,
    pub dr_sum: u8,
    pub rule_value: Option<String>,
    pub skeleton_event: Option<AnandaSkeletonEvent>,
}

impl AnandaVortexCell {
    pub fn from_address(family: AnandaMatrixOp, row_k: u8, position_p: u8) -> Self {
        let row = (row_k % 12) as i16;
        let position = (position_p % 12) as i16;
        let raw_bimba = row * position;
        let raw_pratibimba = raw_bimba + 1;
        let raw_sum = raw_bimba + raw_pratibimba;
        let raw_delta = 1;
        let dr_bimba = digit_root(raw_bimba);
        let dr_pratibimba = digit_root(raw_pratibimba);
        let dr_sum = digit_root(raw_sum);
        let (raw_value, dr_value, rule_value) = match family {
            AnandaMatrixOp::Bimba => (Some(raw_bimba), Some(dr_bimba), None),
            AnandaMatrixOp::Pratibimba => (Some(raw_pratibimba), Some(dr_pratibimba), None),
            AnandaMatrixOp::Sum => (Some(raw_sum), Some(dr_sum), None),
            AnandaMatrixOp::DiffA => (Some(-1), Some(9), None),
            AnandaMatrixOp::DiffB => (Some(1), Some(1), None),
            AnandaMatrixOp::Quintessence => (
                None,
                None,
                Some(format!("{raw_bimba}/{raw_pratibimba}/{raw_sum}")),
            ),
        };

        Self {
            family,
            row_k: row as u8,
            position_p: position as u8,
            raw_value,
            raw_bimba,
            raw_pratibimba,
            raw_sum,
            raw_delta,
            dr_value,
            dr_bimba,
            dr_pratibimba,
            dr_sum,
            rule_value,
            skeleton_event: ananda_skeleton_event(family, row as u8, position as u8),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum AnandaSkeletonEvent {
    Hit36 = 0,
    Hit64 = 1,
    Hit72 = 2,
    Ratio64Over36 = 3,
    Additive137 = 4,
    IdentityReturn4Plus2 = 5,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrRingPhase {
    pub mahamaya_idx: u8,
    pub parashakti_idx: u8,
}

impl DrRingPhase {
    fn from_tick12(tick12: u8) -> Self {
        const MAHAMAYA: [u8; 6] = [1, 2, 4, 8, 7, 5];
        const PARASHAKTI: [u8; 6] = [3, 6, 9, 3, 6, 9];
        let idx = (tick12 % 6) as usize;
        Self {
            mahamaya_idx: MAHAMAYA[idx],
            parashakti_idx: PARASHAKTI[idx],
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
#[repr(u8)]
pub enum AnandaMatrixOp {
    Bimba = 0,
    Pratibimba = 1,
    Sum = 2,
    DiffA = 3,
    DiffB = 4,
    Quintessence = 5,
}

impl AnandaMatrixOp {
    fn from_position(position6: u8) -> Self {
        match position6 % 6 {
            0 => Self::Bimba,
            1 => Self::Pratibimba,
            2 => Self::Sum,
            3 => Self::DiffA,
            4 => Self::DiffB,
            _ => Self::Quintessence,
        }
    }
}

fn digit_root(value: i16) -> u8 {
    if value == 0 {
        0
    } else {
        let reduced = value.abs() % 9;
        if reduced == 0 {
            9
        } else {
            reduced as u8
        }
    }
}

fn ananda_skeleton_event(
    family: AnandaMatrixOp,
    row_k: u8,
    position_p: u8,
) -> Option<AnandaSkeletonEvent> {
    let raw_bimba = (row_k as i16) * (position_p as i16);
    let raw_pratibimba = raw_bimba + 1;
    match (family, row_k, position_p, raw_bimba, raw_pratibimba) {
        (AnandaMatrixOp::Pratibimba, 7, 5, _, 36) => Some(AnandaSkeletonEvent::Hit36),
        (AnandaMatrixOp::Pratibimba, 7, 9, _, 64) => Some(AnandaSkeletonEvent::Ratio64Over36),
        (AnandaMatrixOp::Bimba, 8, 8, 64, _) => Some(AnandaSkeletonEvent::Hit64),
        (AnandaMatrixOp::Bimba, 8, 9, 72, _) => Some(AnandaSkeletonEvent::Hit72),
        (AnandaMatrixOp::Sum, 8, 9, 72, _) => Some(AnandaSkeletonEvent::Additive137),
        (AnandaMatrixOp::Quintessence, 4, 2, _, _) => {
            Some(AnandaSkeletonEvent::IdentityReturn4Plus2)
        }
        _ => None,
    }
}

fn cl42_signature(position6: u8) -> i8 {
    match position6 % 6 {
        0 | 5 => -1,
        _ => 1,
    }
}

fn ring_quaternion(tick12: u8) -> [f32; 4] {
    const RING_QUATERNION_LUT: [[f32; 4]; 12] = [
        [1.0, 0.0, 0.0, 0.0],
        [0.8660254, 0.5, 0.0, 0.0],
        [0.5, 0.8660254, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [-0.5, 0.8660254, 0.0, 0.0],
        [-0.8660254, 0.5, 0.0, 0.0],
        [0.8660254, -0.5, 0.0, 0.0],
        [0.5, -0.8660254, 0.0, 0.0],
        [0.0, -1.0, 0.0, 0.0],
        [-0.5, -0.8660254, 0.0, 0.0],
        [-0.8660254, -0.5, 0.0, 0.0],
        [-1.0, 0.0, 0.0, 0.0],
    ];
    RING_QUATERNION_LUT[(tick12 % 12) as usize]
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicGrammarProjection {
    pub position_substance: String,
    pub lens_refraction: String,
    pub harmonic_relation: String,
    pub base_pair: String,
    pub active_lenses: Vec<String>,
    pub primary_anchor: String,
    pub d_face: String,
    pub depth: u8,
    pub families: Vec<MathemeHarmonicFamilyProjection>,
}

impl MathemeHarmonicGrammarProjection {
    fn from_tick(tick12: u8, position: u8) -> Self {
        let helix_is_prime = tick12 >= 6;
        let second = if helix_is_prime {
            5 - position
        } else {
            (position + 1) % 6
        };
        let d_face = if helix_is_prime { "D_LEFT" } else { "NONE" };
        let depth = if helix_is_prime { 3 } else { 2 };
        let families = harmonic_families_for_pair(position, second)
            .into_iter()
            .map(MathemeHarmonicFamilyProjection::from_family)
            .collect();

        Self {
            position_substance: "P/P'=0".to_owned(),
            lens_refraction: "L/L'=/".to_owned(),
            harmonic_relation: "A/B/C+D=1".to_owned(),
            base_pair: format!("L{position}/L{second}"),
            active_lenses: if helix_is_prime {
                vec![format!("L{position}'"), format!("L{second}")]
            } else {
                vec![format!("L{position}"), format!("L{second}")]
            },
            primary_anchor: if helix_is_prime { "Night" } else { "Day" }.to_owned(),
            d_face: d_face.to_owned(),
            depth,
            families,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicFamilyProjection {
    pub family: String,
    pub register: String,
    pub relation_type: String,
    pub interval_signature: String,
}

impl MathemeHarmonicFamilyProjection {
    fn from_family(family: HarmonicFamily) -> Self {
        Self {
            family: family.name().to_owned(),
            register: family.register().to_owned(),
            relation_type: family.relation_type().to_owned(),
            interval_signature: family.interval_signature().to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum HarmonicFamily {
    A,
    B,
    C,
}

impl HarmonicFamily {
    fn name(self) -> &'static str {
        match self {
            Self::A => "A",
            Self::B => "B",
            Self::C => "C",
        }
    }

    fn register(self) -> &'static str {
        match self {
            Self::A => "Being",
            Self::B => "Becoming",
            Self::C => "KnowingUnknowing",
        }
    }

    fn relation_type(self) -> &'static str {
        match self {
            Self::A => "ADJACENTLY_ARTICULATES",
            Self::B => "MIRRORS_COMPLEMENT",
            Self::C => "CROSSES_KNOWING_LIMIT",
        }
    }

    fn interval_signature(self) -> &'static str {
        match self {
            Self::A => "chromatic:whole-tone; fifths:perfect-fourth",
            Self::B => "chromatic:minor-seventh/tritone/whole-tone; fifths:perfect-fifth/minor-third/major-seventh",
            Self::C => "chromatic:whole-tone-with-cycle-close-minor-third; fifths:perfect-fourth-with-cycle-close-minor-second",
        }
    }
}

fn harmonic_families_for_pair(first: u8, second: u8) -> Vec<HarmonicFamily> {
    match (first % 6, second % 6) {
        (0, 1) | (4, 5) => vec![HarmonicFamily::A],
        (2, 3) => vec![HarmonicFamily::A, HarmonicFamily::B],
        (0, 5) | (1, 4) => vec![HarmonicFamily::B],
        (1, 2) | (3, 4) | (5, 0) => vec![HarmonicFamily::C],
        _ => Vec::new(),
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
pub struct MathemeChromaticProfile {
    pub position: u8,
    pub pitch_class: u8,
    pub note: String,
    pub x_prime_pitch_class: u8,
    pub x_prime_note: String,
    pub mirror_position: u8,
    pub mirror_pitch_class: u8,
    pub mirror_note: String,
    pub mirror_square: String,
    pub mirror_span_whole_tones: u8,
    pub mirror_span_semitones: u8,
}

impl MathemeChromaticProfile {
    fn from_tick(tick12: u8, position: u8, pitch_class: u8) -> Self {
        let mirror_position = 5 - position;
        let mirror_tick = if tick12 < 6 {
            mirror_position
        } else {
            6 + mirror_position
        };
        let mirror_pitch_class = pitch_class_for_tick(mirror_tick);
        let x_prime_pitch_class = if tick12 < 6 {
            pitch_class + 1
        } else {
            pitch_class - 1
        };
        let mirror_span_whole_tones = match position {
            0 | 5 => 5,
            1 | 4 => 3,
            _ => 1,
        };
        Self {
            position,
            pitch_class,
            note: note_name(pitch_class).to_owned(),
            x_prime_pitch_class,
            x_prime_note: note_name(x_prime_pitch_class).to_owned(),
            mirror_position,
            mirror_pitch_class,
            mirror_note: note_name(mirror_pitch_class).to_owned(),
            mirror_square: mirror_square(position).to_owned(),
            mirror_span_whole_tones,
            mirror_span_semitones: mirror_span_whole_tones * 2,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeDiatonicContext {
    pub degree: u8,
    pub pitch_class: u8,
    pub note: String,
    pub context_frame: String,
    pub context_agent: String,
    pub vak_register: String,
}

impl MathemeDiatonicContext {
    fn from_pitch_class(pitch_class: u8) -> Option<Self> {
        let (degree, context_frame, context_agent, vak_register) = match pitch_class {
            0 => (1, "00/00", "Nous", "Para"),
            2 => (2, "0/1", "Logos", "Madhyama-nomos"),
            4 => (3, "0/1/2", "Eros", "Madhyama-chreia"),
            5 => (4, "0/1/2/3", "Mythos", "Pasyanti"),
            7 => (5, "4.0/1-4.4/5", "Anima/Psyche", "Madhyama-oikonomia"),
            9 => (6, "4.5/0", "Psyche", "partial-Aletheia"),
            11 => (7, "5/0", "Sophia", "Spanda-Shakti"),
            _ => return None,
        };
        Some(Self {
            degree,
            pitch_class,
            note: note_name(pitch_class).to_owned(),
            context_frame: context_frame.to_owned(),
            context_agent: context_agent.to_owned(),
            vak_register: vak_register.to_owned(),
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeResonance72Projection {
    pub legacy_resonance_index: usize,
    pub lens_anchor_index: usize,
    pub base_lens: u8,
    pub helix_bit: u8,
    pub lens_anchor: u8,
    pub position: u8,
}

impl MathemeResonance72Projection {
    fn from_tick(tick12: u8, position: u8) -> Self {
        let helix_bit = tick12 / 6;
        let base_lens = position;
        Self {
            legacy_resonance_index: kernel_resonance_index(base_lens, helix_bit == 1, position)
                .expect("tick-derived resonance address remains in the 72-fold domain"),
            lens_anchor_index: tick12 as usize * 6 + position as usize,
            base_lens,
            helix_bit,
            lens_anchor: tick12,
            position,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeElementalProjection {
    pub p_position_element: String,
    pub l2_prime_element: String,
    pub rendering_role: String,
}

impl MathemeElementalProjection {
    fn from_position(position: u8) -> Self {
        Self {
            p_position_element: p_position_element(position).to_owned(),
            l2_prime_element: l2_prime_element(position).to_owned(),
            rendering_role: if matches!(position, 0 | 5) {
                "nodal-boundary"
            } else {
                "explicate-sounded"
            }
            .to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemePlanetaryChakralProjection {
    pub body: String,
    pub chakra_role: String,
    pub element: String,
    pub musical_role: String,
    pub modal_color: String,
    pub provenance: String,
}

impl MathemePlanetaryChakralProjection {
    fn from_diatonic(diatonic: Option<&MathemeDiatonicContext>) -> Self {
        let (body, chakra_role, element, musical_role, modal_color) =
            match diatonic.map(|context| context.degree) {
                Some(1) => (
                    "Earth",
                    "Muladhara / grounding center",
                    "Earth",
                    "1/1 tonic",
                    "Rast / stable tonic ground",
                ),
                Some(2) => (
                    "Venus",
                    "Svadhisthana / generative water",
                    "Water",
                    "9/8 epogdoon pulse",
                    "Bayati / living difference",
                ),
                Some(3) => (
                    "Mars",
                    "Manipura / active fire",
                    "Fire",
                    "5/4 major-third fire articulation",
                    "Hijaz / charged action",
                ),
                Some(4) => (
                    "Jupiter",
                    "Anahata / expansive heart",
                    "Air",
                    "4/3 perfect fourth",
                    "Saba / relational opening",
                ),
                Some(5) => (
                    "Saturn",
                    "Vishuddha-Ajna discipline bridge",
                    "Ether/structure",
                    "3/2 perfect fifth",
                    "Kurd / structuring resonance",
                ),
                Some(6) => (
                    "Uranus",
                    "Ajna transpersonal extension",
                    "Light/Air",
                    "5/3 major sixth",
                    "Nahawand / disruptive insight",
                ),
                Some(7) => (
                    "Neptune",
                    "Crown/transpersonal ocean",
                    "Consciousness/Water",
                    "15/8 leading-toward-octave",
                    "Ajam / luminous expansion",
                ),
                _ => (
                    "Pluto",
                    "underworld/transmutation",
                    "Mineral/depth",
                    "chromatic shadow pressure",
                    "Locrian/shadow mode pressure",
                ),
            };
        Self {
            body: body.to_owned(),
            chakra_role: chakra_role.to_owned(),
            element: element.to_owned(),
            musical_role: musical_role.to_owned(),
            modal_color: modal_color.to_owned(),
            provenance:
                "initial M2/M' alignment; canonical values must be governed by S2 graph law"
                    .to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeBinaryProjection {
    pub mahamaya_address64: Option<u8>,
    pub codon: Option<String>,
    pub hexagram: Option<String>,
    pub line_change_operator: Option<String>,
    pub hexagram_id: u8,
    pub upper_trigram: u8,
    pub lower_trigram: u8,
    pub codon_id: u8,
    pub nucleotide_bits: [u8; 3],
    pub dna_rna_phase: String,
    pub line_index: u8,
    pub line_change_operator_address: u16,
    pub m2_vibration_index: usize,
    pub m2_to_m3_symbol: u8,
    pub evolutionary_gap: bool,
    pub tarot_minor_id: Option<u8>,
    pub tarot_shadow_codon: Option<u8>,
    pub amino_acid_code: Option<String>,
    pub dataset_lut_state: String,
    pub transcription_state: String,
    pub frame_breathing_role: String,
    pub m3_codec_provenance: String,
}

impl MathemeBinaryProjection {
    fn from_clock(
        degree360: u16,
        position: u8,
        m2_vibration_index: usize,
        rna_phase: bool,
    ) -> Self {
        let codec =
            MahamayaCodecProjection::from_clock(degree360, position, m2_vibration_index, rna_phase);
        Self {
            mahamaya_address64: Some(codec.address64),
            codon: Some(codec.codon),
            hexagram: Some(format!("H{:02}", codec.hexagram_id + 1)),
            line_change_operator: Some(format!(
                "H{:02}.{}",
                codec.hexagram_id + 1,
                codec.line_index + 1
            )),
            hexagram_id: codec.hexagram_id,
            upper_trigram: codec.upper_trigram,
            lower_trigram: codec.lower_trigram,
            codon_id: codec.codon_id,
            nucleotide_bits: codec.nucleotide_bits,
            dna_rna_phase: codec.dna_rna_phase,
            line_index: codec.line_index,
            line_change_operator_address: codec.line_change_operator,
            m2_vibration_index: codec.m2_vibration_index,
            m2_to_m3_symbol: codec.m2_to_m3_symbol,
            evolutionary_gap: codec.evolutionary_gap,
            tarot_minor_id: None,
            tarot_shadow_codon: None,
            amino_acid_code: None,
            dataset_lut_state: "pending-dataset-lut".to_owned(),
            transcription_state: codec.transcription_state,
            frame_breathing_role: match position {
                0 | 5 => "sq1-boundary-totality",
                1 | 4 => "sq2-active-tritone",
                _ => "sq3-inner-epogdoon",
            }
            .to_owned(),
            m3_codec_provenance: "portal-core::mahamaya address law; tarot/amino LUTs pending"
                .to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeBedrockProjection {
    pub hash_operator: String,
    pub psychoid_number: String,
    pub inverted_psychoid_number: String,
    pub successor_psychoid_number: String,
    pub successor_relation: String,
    pub inversion_relation: String,
    pub bimba_pitch_class: u8,
    pub inversion_pitch_class: u8,
}

impl MathemeBedrockProjection {
    fn from_position(position: u8) -> Self {
        let successor = (position + 1) % 6;
        Self {
            hash_operator: "#".to_owned(),
            psychoid_number: format!("#{position}"),
            inverted_psychoid_number: format!("#{position}'"),
            successor_psychoid_number: format!("#{successor}"),
            successor_relation: if position == 5 {
                "mobius-return"
            } else {
                "epogdoon-tick"
            }
            .to_owned(),
            inversion_relation: "inversion-spanda".to_owned(),
            bimba_pitch_class: bimba_pitch_class_for_position(position),
            inversion_pitch_class: pratibimba_pitch_class_for_position(position),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemePointerAnchorProjection {
    pub source_coordinate: String,
    pub ql_position: u8,
    pub helix: String,
    pub web_index: u8,
    pub bedrock_index: u8,
    pub family_ring_size: u8,
    pub position_ring_size: u8,
    pub lens_ring_size: u8,
    pub web_cardinality: u8,
    pub lens_anchor: String,
    pub relation_role: String,
    pub pitch_class: u8,
    pub provenance: String,
}

impl MathemePointerAnchorProjection {
    fn from_tick(tick12: u8, position: u8, helix: &str, pitch_class: u8) -> Self {
        Self {
            source_coordinate: "S0/QL-meta".to_owned(),
            ql_position: position,
            helix: helix.to_owned(),
            web_index: tick12,
            bedrock_index: position,
            family_ring_size: 12,
            position_ring_size: 12,
            lens_ring_size: 12,
            web_cardinality: 36,
            lens_anchor: lens_anchor_label(tick12),
            relation_role: if tick12 < 6 {
                "position-identity"
            } else {
                "inversion-spanda"
            }
            .to_owned(),
            pitch_class,
            provenance: "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract".to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeContextFrameWebProjection {
    pub frame_count: u8,
    pub active_frame_index: Option<u8>,
    pub active_frame: Option<String>,
    pub active_agent: Option<String>,
    pub projection: String,
}

impl MathemeContextFrameWebProjection {
    fn from_diatonic(diatonic: Option<&MathemeDiatonicContext>) -> Self {
        Self {
            frame_count: 7,
            active_frame_index: diatonic.map(|context| context.degree - 1),
            active_frame: diatonic.map(|context| context.context_frame.clone()),
            active_agent: diatonic.map(|context| context.context_agent.clone()),
            projection: "CF7 diatonic lemniscate overlay".to_owned(),
        }
    }
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
        _ => "Mineral",
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
