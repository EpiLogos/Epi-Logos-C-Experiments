use serde::ser::SerializeSeq;
use serde::{Deserialize, Serialize};

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
    pub helix: String,
    pub chromatic: MathemeChromaticProfile,
    pub diatonic: Option<MathemeDiatonicContext>,
    pub binary: MathemeBinaryProjection,
}

impl MathemeHarmonicProfile {
    pub fn from_tick(tick: KernelTick) -> Self {
        let tick12 = tick.sub_tick % 12;
        let helix = if tick12 < 6 { "bimba" } else { "pratibimba" };
        let position = tick12 % 6;
        let pitch_class = pitch_class_for_tick(tick12);
        Self {
            tick12,
            cycle: tick.cycle,
            degree720: tick12 as u16 * 60,
            degree360: tick12 as u16 * 60 % 360,
            helix: helix.to_owned(),
            chromatic: MathemeChromaticProfile::from_tick(tick12, position, pitch_class),
            diatonic: MathemeDiatonicContext::from_pitch_class(pitch_class),
            binary: MathemeBinaryProjection::pending(position),
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

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeBinaryProjection {
    pub mahamaya_address64: Option<u8>,
    pub codon: Option<String>,
    pub hexagram: Option<String>,
    pub line_change_operator: Option<String>,
    pub transcription_state: String,
    pub frame_breathing_role: String,
    pub m3_codec_provenance: String,
}

impl MathemeBinaryProjection {
    fn pending(position: u8) -> Self {
        Self {
            mahamaya_address64: None,
            codon: None,
            hexagram: None,
            line_change_operator: None,
            transcription_state: "pending-m3-codec".to_owned(),
            frame_breathing_role: match position {
                0 | 5 => "sq1-boundary-totality",
                1 | 4 => "sq2-active-tritone",
                _ => "sq3-inner-epogdoon",
            }
            .to_owned(),
            m3_codec_provenance:
                "M3 Mahamaya symbolic codec required for 64-fold codon/hexagram materialisation"
                    .to_owned(),
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
