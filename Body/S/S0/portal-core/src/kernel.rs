use serde::ser::SerializeSeq;
use serde::{Deserialize, Serialize};

use crate::mahamaya::MahamayaCodecProjection;

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
    pub lens_energy: f32,
    pub r_energy: f32,
    pub total_energy: f32,
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
        target: Option<&ResonanceVector72>,
        r_energy: f32,
    ) -> Self {
        let bioquaternion = BioQuaternionState::new(q_b, q_p);
        let resonance_square_emphasis = observed
            .map(kernel_resonance_square_emphasis)
            .unwrap_or([0.0; TRITONE_SQUARES]);
        let energy = kernel_energy_evaluate(&bioquaternion, observed, target, r_energy);
        let tick = kernel_tick_from_epogdoon(cycle, tick12);
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
        Self::from_clock_state(
            0,
            0,
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 0.0],
            None,
            None,
            0.0,
        )
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
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
        let projection = KernelProjection::from_clock_state(
            cycle,
            sub_tick,
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 0.0],
            None,
            None,
            0.0,
        );
        Self::from_kernel_projection(generation, &projection)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicProfile {
    pub tick12: u8,
    pub cycle: u64,
    pub degree720: u16,
    pub degree360: u16,
    pub su2_layer: String,
    pub helix: String,
    pub ratio_role: String,
    pub chromatic: MathemeChromaticProfile,
    pub diatonic: Option<MathemeDiatonicContext>,
    pub resonance72: MathemeResonance72Projection,
    pub elements: MathemeElementalProjection,
    pub planetary_chakral: MathemePlanetaryChakralProjection,
    pub binary: MathemeBinaryProjection,
    pub bedrock: MathemeBedrockProjection,
    pub pointer_anchor: MathemePointerAnchorProjection,
    pub context_frames: MathemeContextFrameWebProjection,
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
        Self {
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
            helix: helix.to_owned(),
            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),
            chromatic: MathemeChromaticProfile::from_tick(tick12, position, pitch_class),
            diatonic: diatonic.clone(),
            resonance72,
            elements: MathemeElementalProjection::from_position(position),
            planetary_chakral: MathemePlanetaryChakralProjection::from_diatonic(diatonic.as_ref()),
            binary: MathemeBinaryProjection::from_clock(
                degree360,
                position,
                resonance72.lens_anchor_index,
                tick12 >= 6,
            ),
            bedrock: MathemeBedrockProjection::from_position(position),
            pointer_anchor: MathemePointerAnchorProjection::from_tick(
                tick12,
                position,
                helix,
                pitch_class,
            ),
            context_frames: MathemeContextFrameWebProjection::from_diatonic(diatonic.as_ref()),
        }
    }
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
    pub total_energy: String,
}

impl KernelTemporalEnergy {
    fn from_energy(energy: EnergyDecomposition) -> Self {
        Self {
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
    observed: Option<&ResonanceVector72>,
    target: Option<&ResonanceVector72>,
    r_energy: f32,
) -> EnergyDecomposition {
    let bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p);
    let lens_energy = match (observed, target) {
        (Some(observed), Some(target)) => {
            observed
                .values
                .iter()
                .zip(target.values.iter())
                .map(|(a, b)| {
                    let delta = a - b;
                    delta * delta
                })
                .sum::<f32>()
                / RESONANCE_DIM as f32
        }
        _ => 0.0,
    };
    EnergyDecomposition {
        bimba_pratibimba_energy,
        lens_energy,
        r_energy,
        total_energy: bimba_pratibimba_energy + lens_energy + r_energy,
    }
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

fn unit_or_identity(q: [f32; 4]) -> [f32; 4] {
    let norm_sq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    if norm_sq <= 0.0 {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        let scale = 1.0 / norm_sq.sqrt();
        [q[0] * scale, q[1] * scale, q[2] * scale, q[3] * scale]
    }
}
