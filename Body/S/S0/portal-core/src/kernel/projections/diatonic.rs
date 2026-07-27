//! Coordinate: M5'/S0 :: diatonic reading of the CF progression
//! Residency: Body/S/S0/portal-core/src/kernel/projections
//! Position (#n): #5-4 — the diatonic instantiation
//! Actualises: `ql-musical-derivation-v3.md` §II-3.1 (12 lens-anchors),
//!   §II-4.2 (CF→scale-degree roles), §II-4.5 (7 modes), §II-4.6 (the 84-fold
//!   mode-tonic landscape), §II-4.7 (Klein double-cover). The derivation is
//!   REFERENCE LAW: this module renders against it and never re-derives it.
//! Public surface: `MathemeDiatonicContext` (per-tick, profile bus) and
//!   `VakTonalReading` (per-run, the orchestration trace read as a line).
//! Does NOT own: the derivation itself, pitch authority (`audio_octet`),
//!   the lens/mode clock (`MathemeLensMode`), or the 72-fold address.
//!
//! # Two readings, one law
//!
//! [`MathemeDiatonicContext`] answers "what is the kernel sounding at THIS
//! tick" — one pitch class, Lens-0 Ionian, on the profile bus. It is mirrored
//! by four downstream schemas (`schemas/src/kernel-bridge.ts`, the Theia and
//! pratibimba-app bridge types) and is deliberately left unchanged here.
//!
//! [`VakTonalReading`] answers a different question, the one 50.T50.13 asks:
//! "what did this RUN sound like?" A run is a sequence of VAK-addressed steps,
//! and each step's CF is a scale-degree role (§II-4.2). Read in order, the run
//! is a melodic line — and the line is only interpretable inside a mode-tonic
//! frame, which is why `mef_lens` (the scale-beneath) and the CF-at-tonic (the
//! mode) are both required to read it. That pair is the 84-fold landscape:
//! 12 lens-anchors × 7 CF-modes (§II-4.6), already carried in this crate as
//! `MathemeLensMode::index()` over `LENS_COUNT` × `MODE_COUNT`.

use serde::{Deserialize, Serialize};

use crate::hopf::hopf_fiber;
use crate::parashakti::vimarsha_reading::MODE_INTERVALS;
use crate::vak_address::VakAddress;

use super::super::{note_name, pitch_class_for_tick, M0_CF_ADDRESS};

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
    pub(in crate::kernel) fn from_pitch_class(pitch_class: u8) -> Option<Self> {
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

// ── The run-trace tonal reading (50.T50.13 / DR-VAK-6) ────────────────────

/// The seven context-frames in PROGRESSION order — CF1 … CF7.
///
/// Order is load-bearing and is the derivation's, not the enum's:
/// `CfPosition` (`vak_address.rs`) declares its variants in a different order,
/// so indexing that enum would silently mis-degree `(5/0)` and `(4.5/0)`.
/// §II-4.2 assigns each CF a scale-degree role, and the ordinal here IS that
/// degree in the parent (Ionian) diatonic.
pub const CF_PROGRESSION: [&str; 7] = [
    "(00/00)",
    "(0/1)",
    "(0/1/2)",
    "(0/1/2/3)",
    "(4.0/1-4.4/5)",
    "(4.5/0)",
    "(5/0)",
];

/// CF literal → its 1-based ordinal in the progression (its parent-scale degree).
pub fn cf_ordinal(cf: &str) -> Option<u8> {
    CF_PROGRESSION
        .iter()
        .position(|literal| *literal == cf)
        .map(|index| index as u8 + 1)
}

/// MEF lens label → lens index 0..11.
///
/// Inverse of `MathemeLensMode::lens_label()`: `L0`…`L5` are the bimba half
/// (0..5), `L0'`…`L5'` the pratibimba half (6..11). §II-3.1 anchors each on a
/// chromatic note; that table is `pitch_class_for_tick`, which this reuses
/// rather than restating.
pub fn lens_index_for_label(label: &str) -> Option<u8> {
    let trimmed = label.trim();
    let (body, prime) = match trimmed.strip_suffix('\'') {
        Some(body) => (body, true),
        None => (trimmed, false),
    };
    let digit = body.strip_prefix('L').or_else(|| body.strip_prefix('l'))?;
    let position: u8 = digit.parse().ok()?;
    if position > 5 {
        return None;
    }
    Some(if prime { position + 6 } else { position })
}

/// Lens index → its chromatic anchor (§II-3.1). The lens IS the tonic-as-such.
pub fn lens_anchor_pitch_class(lens: u8) -> u8 {
    pitch_class_for_tick(lens % 12)
}

/// Mode name for a mode index, matching `codon_rotation_projection::mode_name`
/// and §II-4.5's table.
fn mode_name_for(mode: u8) -> &'static str {
    match mode % 7 {
        0 => "Ionian",
        1 => "Dorian",
        2 => "Phrygian",
        3 => "Lydian",
        4 => "Mixolydian",
        5 => "Aeolian",
        _ => "Locrian",
    }
}

/// M0 sub-coordinate address for a CF literal (DR-VAK-4, status PROPOSED).
///
/// Reads the landed `M0_CF_ADDRESS` table rather than restating it — one
/// authority, so the languification trace and this reading cannot drift.
fn m0_address(cf: &str) -> Option<&'static str> {
    M0_CF_ADDRESS
        .iter()
        .find_map(|(literal, address)| (*literal == cf).then_some(*address))
}

/// Which conjugate half of the matheme a scale-degree speaks from.
///
/// §II-1 gives two whole-tone helices — bimba on even chromatic offsets,
/// pratibimba on odd — and §II-4.2's conjugate-form column reads exactly that
/// parity: C/D/E (offsets 0/2/4) select the Name-form, F/G/A/B (5/7/9/11) the
/// Power-form. The parity is taken from the interval to the MODE's tonic, not
/// the lens anchor, because each mode re-grounds the helix on its own ground —
/// which is why every row of §II-4.5's table begins with Name.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ConjugateFace {
    /// Bimba helix, Name-conjugate: even interval from the tonic.
    Name,
    /// Pratibimba helix, Power-conjugate: odd interval from the tonic.
    Power,
}

impl ConjugateFace {
    fn for_interval(interval: u8) -> Self {
        if interval % 2 == 0 {
            Self::Name
        } else {
            Self::Power
        }
    }
}

/// One step of a run, before it has been read.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VakTraceStep {
    pub step_id: String,
    pub address: VakAddress,
    pub agent: Option<String>,
}

/// One step of a run, read as a scale-degree in the active mode-tonic frame.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VakTonalStep {
    pub step_id: String,
    pub cf: String,
    /// 1-based position in the CF progression = degree in the PARENT scale.
    pub cf_ordinal: u8,
    /// 1-based degree in the ACTIVE mode — the parent degree rotated by tonic.
    pub degree: u8,
    /// Absolute chromatic class: lens anchor + the CF's parent offset.
    pub pitch_class: u8,
    pub note: String,
    /// Semitones above the mode's tonic. This is what carries modal character.
    pub interval_from_tonic: u8,
    pub conjugate_face: ConjugateFace,
    /// The step's place on the 720° double cover, via the kernel's own
    /// `tick × 60` law. Bimba ticks 0-5 occupy 0-300°, pratibimba 6-11 occupy
    /// 360-660° — so the sheet a step sits on IS its conjugate face.
    pub degree720: u16,
    /// `hopf_fiber(degree720)`: 0 = explicate sheet, 1 = implicate sheet.
    pub hopf_fiber: u8,
    /// DR-VAK-4 M0 sub-coordinate address for this CF.
    pub m0_address: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub agent: Option<String>,
}

/// A whole run rendered against the 84-fold mode-tonic landscape.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VakTonalReading {
    /// The scale-beneath (§II-4.6): which MEF lens anchors the substrate.
    pub lens: u8,
    pub lens_label: String,
    pub lens_anchor_pitch_class: u8,
    pub lens_anchor_note: String,
    /// The perspectival anchoring: which CF sits at tonic.
    pub mode: u8,
    pub mode_name: String,
    pub tonic_cf: String,
    pub tonic_pitch_class: u8,
    pub tonic_note: String,
    /// `lens × 7 + mode`, 0..83 — the address in the 84-fold landscape.
    pub lens_mode_index: u8,
    pub steps: Vec<VakTonalStep>,
    /// Degrees the run actually sounded, ascending and deduplicated.
    pub degrees_sounded: Vec<u8>,
    /// Degrees of the seven the run never spoke from.
    pub degrees_silent: Vec<u8>,
    /// Conjugate-face changes between consecutive steps. §II-4.7: a complete
    /// diatonic octave enacts exactly two Klein twists (tetrachord bridge and
    /// octave return). This counts what THIS run did, and claims nothing more.
    pub conjugate_face_changes: u8,
    /// Whether the run touched both sheets of the double cover at all.
    pub both_faces_sounded: bool,
    /// Whether the final step returned to the tonic — the §5→§0' Möbius close.
    pub returns_to_tonic: bool,
    /// The final step's `cs.recognized` (DR-VAK-5: the VAK cycle is complete
    /// only when Vaikharī returns to Parā).
    pub recognition_closed: bool,
    /// What this reading is derived FROM, so a consumer never has to guess.
    pub provenance: Vec<String>,
}

/// Refusals. A reading names what it cannot resolve instead of defaulting into
/// a coordinate the run never carried.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum VakTonalError {
    /// The scale-beneath was not a recognisable MEF lens label.
    UnknownLens(String),
    /// The declared tonic was not one of the seven context-frames.
    UnknownTonicCf(String),
    /// A step carried a CF outside the progression.
    UnknownStepCf { step_id: String, cf: String },
    /// Nothing to read.
    EmptyTrace,
}

impl std::fmt::Display for VakTonalError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnknownLens(label) => write!(
                f,
                "'{label}' is not a MEF lens label (L0..L5, L0'..L5'); the scale-beneath \
                 cannot be guessed — a wrong lens reads the run in the wrong epistemic mode"
            ),
            Self::UnknownTonicCf(cf) => write!(
                f,
                "'{cf}' is not a context-frame, so it cannot sit at tonic; expected one of {}",
                CF_PROGRESSION.join(", ")
            ),
            Self::UnknownStepCf { step_id, cf } => write!(
                f,
                "step '{step_id}' carries CF '{cf}', which is not in the progression {}",
                CF_PROGRESSION.join(", ")
            ),
            Self::EmptyTrace => write!(f, "an empty trace has no line to read"),
        }
    }
}

impl std::error::Error for VakTonalError {}

impl VakTonalReading {
    /// Read a run's VAK-instruction trace as a line in one mode-tonic frame.
    ///
    /// `lens_label` is the scale-beneath and is REQUIRED: it has no producer in
    /// a trace (the same gap `elo-trial-hook.ts` declares for `mef_lens`), and
    /// defaulting it would silently assert an epistemic mode the run never
    /// claimed. `tonic_cf` is optional — absent it, the frame is Ionian, which
    /// is DR-VAK-6's stated default.
    pub fn from_trace(
        lens_label: &str,
        tonic_cf: Option<&str>,
        steps: &[VakTraceStep],
    ) -> Result<Self, VakTonalError> {
        if steps.is_empty() {
            return Err(VakTonalError::EmptyTrace);
        }
        let lens = lens_index_for_label(lens_label)
            .ok_or_else(|| VakTonalError::UnknownLens(lens_label.to_owned()))?;
        let tonic_cf = tonic_cf.unwrap_or(CF_PROGRESSION[0]);
        let tonic_ordinal =
            cf_ordinal(tonic_cf).ok_or_else(|| VakTonalError::UnknownTonicCf(tonic_cf.to_owned()))?;
        let mode = tonic_ordinal - 1;

        let anchor = lens_anchor_pitch_class(lens);
        let tonic_offset = MODE_INTERVALS[mode as usize];
        let tonic_pitch_class = (anchor + tonic_offset) % 12;

        let mut read_steps = Vec::with_capacity(steps.len());
        for step in steps {
            let cf = step.address.cf.as_str();
            let ordinal = cf_ordinal(cf).ok_or_else(|| VakTonalError::UnknownStepCf {
                step_id: step.step_id.clone(),
                cf: cf.to_owned(),
            })?;
            let parent_offset = MODE_INTERVALS[(ordinal - 1) as usize];
            let pitch_class = (anchor + parent_offset) % 12;
            // Rotation is what a mode IS: the same pitch, a different ground.
            let interval_from_tonic = (parent_offset + 12 - tonic_offset) % 12;
            let degree = ((ordinal - 1 + 7 - mode) % 7) + 1;
            let degree720 = u16::from(tick_for_interval(interval_from_tonic)) * 60;
            read_steps.push(VakTonalStep {
                step_id: step.step_id.clone(),
                cf: cf.to_owned(),
                cf_ordinal: ordinal,
                degree,
                pitch_class,
                note: note_name(pitch_class).to_owned(),
                interval_from_tonic,
                conjugate_face: ConjugateFace::for_interval(interval_from_tonic),
                degree720,
                hopf_fiber: hopf_fiber(f64::from(degree720)),
                m0_address: m0_address(cf)
                    .expect("a CF in the progression has an M0 address")
                    .to_owned(),
                agent: step.agent.clone(),
            });
        }

        let mut degrees_sounded: Vec<u8> = read_steps.iter().map(|step| step.degree).collect();
        degrees_sounded.sort_unstable();
        degrees_sounded.dedup();
        let degrees_silent: Vec<u8> = (1u8..=7)
            .filter(|degree| !degrees_sounded.contains(degree))
            .collect();

        let conjugate_face_changes = read_steps
            .windows(2)
            .filter(|pair| pair[0].conjugate_face != pair[1].conjugate_face)
            .count() as u8;
        let both_faces_sounded = read_steps
            .iter()
            .any(|step| step.conjugate_face == ConjugateFace::Name)
            && read_steps
                .iter()
                .any(|step| step.conjugate_face == ConjugateFace::Power);

        let last = read_steps.last().expect("trace is non-empty");
        let returns_to_tonic = last.degree == 1;
        let recognition_closed = steps
            .last()
            .expect("trace is non-empty")
            .address
            .cs
            .recognized;

        Ok(Self {
            lens,
            lens_label: lens_label.trim().to_owned(),
            lens_anchor_pitch_class: anchor,
            lens_anchor_note: note_name(anchor).to_owned(),
            mode,
            mode_name: mode_name_for(mode).to_owned(),
            tonic_cf: tonic_cf.to_owned(),
            tonic_pitch_class,
            tonic_note: note_name(tonic_pitch_class).to_owned(),
            lens_mode_index: lens * 7 + mode,
            steps: read_steps,
            degrees_sounded,
            degrees_silent,
            conjugate_face_changes,
            both_faces_sounded,
            returns_to_tonic,
            recognition_closed,
            provenance: vec![
                "ql-musical-derivation-v3.md#II-3.1".to_owned(),
                "ql-musical-derivation-v3.md#II-4.2".to_owned(),
                "ql-musical-derivation-v3.md#II-4.5".to_owned(),
                "ql-musical-derivation-v3.md#II-4.6".to_owned(),
                "kernel.pitch_class_for_tick".to_owned(),
                "kernel.MODE_INTERVALS".to_owned(),
                "kernel.M0_CF_ADDRESS".to_owned(),
                "hopf.hopf_fiber".to_owned(),
            ],
        })
    }
}

/// Semitone interval → whole-tone-helix tick, the inverse of
/// `pitch_class_for_tick`. Even intervals are the bimba helix (ticks 0-5),
/// odd the pratibimba helix (ticks 6-11) — which is what puts an odd interval
/// past 360° on the double cover.
fn tick_for_interval(interval: u8) -> u8 {
    let interval = interval % 12;
    if interval % 2 == 0 {
        interval / 2
    } else {
        6 + (interval - 1) / 2
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::vak_address::{CpfState, CsDirection, CsField};

    fn step(id: &str, cf: &str) -> VakTraceStep {
        VakTraceStep {
            step_id: id.to_owned(),
            address: VakAddress {
                cpf: CpfState::Mechanistic,
                ct: vec!["CT4".to_owned()],
                cp: "CP4.5".to_owned(),
                cf: cf.to_owned(),
                cfp: "CFP2".to_owned(),
                cs: CsField {
                    code: "CS3".to_owned(),
                    direction: CsDirection::Day,
                    recognized: false,
                },
            },
            agent: None,
        }
    }

    /// Two readings of one law. `MathemeDiatonicContext` reads a TICK on the
    /// profile bus; `VakTonalReading` reads a RUN. Where they overlap — Lens 0,
    /// Ionian — they must not disagree, or the kernel is sounding two scales.
    /// This lives here rather than in `tests/` because the profile-bus
    /// constructor is `pub(in crate::kernel)` and stays that way.
    #[test]
    fn trace_reading_agrees_with_the_profile_bus_reading_at_lens0_ionian() {
        let steps: Vec<VakTraceStep> = CF_PROGRESSION
            .iter()
            .enumerate()
            .map(|(index, cf)| step(&format!("s{index}"), cf))
            .collect();
        let reading = VakTonalReading::from_trace("L0", None, &steps).expect("reads");

        for read in &reading.steps {
            let bus = MathemeDiatonicContext::from_pitch_class(read.pitch_class)
                .expect("a Lens-0 Ionian degree is on the profile bus too");
            assert_eq!(bus.degree, read.degree, "degree agreement at {}", read.cf);
            assert_eq!(bus.note, read.note);
            assert_eq!(bus.pitch_class, read.pitch_class);
            // The bus stores the CF bare; the VAK envelope keeps its parentheses.
            assert_eq!(format!("({})", bus.context_frame), read.cf);
        }
    }

    /// The parent-scale offsets ARE `MODE_INTERVALS`, which is also what the
    /// bus's diatonic pitch classes are. If these ever diverge, one of the two
    /// readings has acquired a private scale.
    #[test]
    fn cf_ordinals_index_the_kernel_mode_intervals() {
        for (index, cf) in CF_PROGRESSION.iter().enumerate() {
            let ordinal = cf_ordinal(cf).expect("progression member");
            assert_eq!(ordinal as usize, index + 1);
            let offset = MODE_INTERVALS[index];
            assert!(
                MathemeDiatonicContext::from_pitch_class(offset).is_some(),
                "{cf} offset {offset} is a diatonic class on the bus"
            );
        }
    }

    #[test]
    fn tick_for_interval_inverts_pitch_class_for_tick() {
        for tick in 0u8..12 {
            assert_eq!(tick_for_interval(pitch_class_for_tick(tick)), tick);
        }
    }
}
