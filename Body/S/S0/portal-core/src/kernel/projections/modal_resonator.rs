// Coordinate: M1'/M2'/M3' :: modal-resonator-bell-kernel (S0 projection)
// Actualises: [[m123-modal-resonator-bell-kernel-spec]] §4 — the additive
//   profile-bus field that makes the existing 8+4 bus explicit as the
//   operational bell body. Derived ENTIRELY from the profile's own state;
//   it is the modal/bell interpretation of the bus, never a second source
//   of pitch truth (§0 ruling).
// Does NOT own: audio_octet / nodal_quartet values (authority pointers only),
//   codon classification, cymatic rendering, audio output.

use serde::{Deserialize, Serialize};

use crate::codon_rotation_projection::MathemeLensMode;
use crate::parashakti::vimarsha_reading::{
    INNER_FOUR_OFFSETS, MODE_INTERVALS, NODAL_ANCHOR_OFFSETS,
};

use super::super::{note_name, pitch_class_for_tick, tick_for_pitch_class, MathemeNodalConstraint};
use super::diatonic::MathemeDiatonicContext;
use super::resonance72::MathemeResonance72Projection;

/// Bell-partial role labels over the eight live carriers (spec §2 table).
/// Labels over the existing carriers — never a second carrier ontology.
pub const BELL_PARTIAL_ROLES: [&str; 8] = [
    "hum", "prime", "tierce", "quint", "nominal", "upper", "warble", "residue",
];

/// Quartet role labels (spec §2): the four still boundary anchors.
pub const NODAL_ANCHOR_ROLES: [&str; 4] = [
    "bimba-p0-anchor",
    "bimba-p5-anchor",
    "pratibimba-p0-anchor",
    "pratibimba-p5-anchor",
];

/// The seven absolute diatonic pitch classes (spec §3; diatonic.rs law).
///
/// Sibling-law note (FR 2.1.10): the M1-2 seat semantics
/// (`ananda_vortex::AnandaSeatBinding`) carry the 8+4 partition of the
/// same twelve — masculine octet / feminine quartet, M0-3 hidden formula
/// "4/(8)/3/(4)" — which grounds the audio_octet[8]/nodal_quartet[4] bus
/// CARDINALITY. This module's 7+5 diatonic/silent partition is a
/// DIFFERENT cut of the twelve. Never conflate the two partitions, and
/// never bind either to seats by pitch-class index equality.
const DIATONIC_PITCH_CLASSES: [u8; 7] = [0, 2, 4, 5, 7, 9, 11];

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalLensMode {
    pub lens: u8,
    pub mode: u8,
    /// MUST equal `lens * 7 + mode` (spec §4 field rule; the Zod
    /// lens-0..6/mode-0..11 bound swap is the flagged drift, not this).
    pub lens_mode_index: u8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalM2Address72 {
    /// MUST equal `resonance72.lensAnchorIndex` (= tick12*6 + position) —
    /// never derived from `lensMode.mode` (spec §4/§6 drift note).
    pub address72: usize,
    pub lens_anchor_index: usize,
    pub tick12: u8,
    pub position: u8,
    pub source: String,
}

/// One of the 12 chromatic slots with COMPOSABLE labels (spec §3: octet-live
/// and diatonic-sounded overlap, so labels compose instead of competing).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalChromaticSlot {
    pub pitch_class: u8,
    pub note: String,
    pub is_diatonic: bool,
    pub diatonic_degree: Option<u8>,
    /// Live-octet carriers currently sounding this slot (indices into liveOctet).
    pub octet_indices: Vec<u8>,
    /// Nodal anchors located at this slot (indices into nodalQuartet).
    pub nodal_roles: Vec<u8>,
    /// Index 0-4 within the five silent chromatic-complement anchors, when
    /// this slot is one of them. Not an absence bucket — a constraint role.
    pub silent_anchor_role: Option<u8>,
    /// Within-helix X+Y=5 mirror pitch class (chromatic.rs mirror law).
    pub mirror: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalOctetCarrier {
    pub octet_index: u8,
    /// MUST equal `MathemeHarmonicProfile.audio_octet[octet_index]` exactly.
    pub hz: f32,
    pub ql_position: u8,
    pub helix: String,
    /// STRUCTURAL ladder class of this carrier in the current (lens, mode)
    /// frame — anchor + offset + mode interval, mod 12. This is the slot
    /// identity on the whole-tone ladder, NOT the rounded sounding class:
    /// the Hz additionally carries texture terms (substrate colour, modal
    /// breath up to ~1.6 semitones, and a full 1-semitone helix lift on
    /// pratibimba carriers) that intentionally detune the sounded pitch away
    /// from this class. Consumers must not name the sounding note from it.
    pub pitch_class: u8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalNodalAnchor {
    pub quartet_index: u8,
    pub ql_position: u8,
    pub helix: String,
    /// Copied from `MathemeHarmonicProfile.nodal_quartet[quartet_index]` —
    /// boundary authority, NOT four extra oscillators (spec §2).
    pub m: u8,
    pub n: u8,
    pub pitch_class: u8,
    pub role: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalDiatonicRole {
    pub pitch_class: u8,
    pub degree: u8,
    pub note: String,
    pub context_frame: String,
    pub context_agent: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalSilentAnchor {
    pub pitch_class: u8,
    pub silent_index: u8,
    pub note: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BellPartialRole {
    /// MUST equal its position in the array (spec §4 field rule).
    pub octet_index: u8,
    pub role: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalCymaticMaterialProfile {
    /// Honest fidelity label — `deterministic-stylised` is the current
    /// reference implementation (spec §8).
    pub mode: String,
    pub antinodal_driver: String,
    pub boundary_constraint: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalAuthority {
    pub pitch: String,
    pub nodal: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalSourceFields {
    pub active_chromatic: String,
    pub active_diatonic_context: String,
    pub resonance72: String,
}

/// The standing resonant body and current modal condition, derived in S0
/// from the profile (spec §4). Optional on profile schema v1 — additive.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModalResonatorProfile {
    pub schema_version: u16,
    pub source: String,
    pub tick: u64,
    pub tick12: u8,
    pub degree720: u16,
    pub lens_mode: ModalLensMode,
    pub m2_address72: ModalM2Address72,
    pub chromatic_body: Vec<ModalChromaticSlot>,
    pub live_octet: Vec<ModalOctetCarrier>,
    pub nodal_quartet: Vec<ModalNodalAnchor>,
    pub diatonic_set: Vec<ModalDiatonicRole>,
    pub silent_complement: Vec<ModalSilentAnchor>,
    pub bell_partials: Vec<BellPartialRole>,
    pub cymatic_material: ModalCymaticMaterialProfile,
    pub privacy_class: String,
    pub authority: ModalAuthority,
    pub source_fields: ModalSourceFields,
}

/// Structural chromatic class of a whole-tone-ladder offset in the current
/// (lens, mode) frame. One law for carriers AND anchors — the 8 + 4 offsets
/// are distinct mod 12, so together they tile the whole chromatic body.
fn ladder_pitch_class(lens_anchor: u8, mode: u8, offset: u8) -> u8 {
    (lens_anchor + offset + MODE_INTERVALS[(mode as usize).min(6)]) % 12
}

/// Within-helix X+Y=5 mirror at the pitch-class register: invert
/// `pitch_class_for_tick`, mirror the position, re-project (chromatic.rs law).
fn mirror_pitch_class(pitch_class: u8) -> u8 {
    let tick = tick_for_pitch_class(pitch_class);
    let position = tick % 6;
    let mirror_position = 5 - position;
    let mirror_tick = if tick < 6 {
        mirror_position
    } else {
        6 + mirror_position
    };
    pitch_class_for_tick(mirror_tick)
}

impl ModalResonatorProfile {
    #[allow(clippy::too_many_arguments)]
    pub(in crate::kernel) fn from_profile_parts(
        absolute_tick: u64,
        tick12: u8,
        degree720: u16,
        lens_mode: MathemeLensMode,
        resonance72: &MathemeResonance72Projection,
        audio_octet: &[f32; 8],
        nodal_quartet: &[MathemeNodalConstraint; 4],
    ) -> Self {
        let lens_anchor = pitch_class_for_tick(lens_mode.lens);

        let live_octet: Vec<ModalOctetCarrier> = INNER_FOUR_OFFSETS
            .iter()
            .enumerate()
            .map(|(slot, offset)| ModalOctetCarrier {
                octet_index: slot as u8,
                hz: audio_octet[slot],
                ql_position: (slot as u8 % 4) + 1,
                helix: if slot < 4 { "bimba" } else { "pratibimba" }.to_owned(),
                pitch_class: ladder_pitch_class(lens_anchor, lens_mode.mode, *offset),
            })
            .collect();

        let nodal: Vec<ModalNodalAnchor> = nodal_quartet
            .iter()
            .enumerate()
            .map(|(i, constraint)| ModalNodalAnchor {
                quartet_index: i as u8,
                ql_position: constraint.ql_position,
                helix: constraint.helix.clone(),
                m: constraint.m,
                n: constraint.n,
                pitch_class: ladder_pitch_class(
                    lens_anchor,
                    lens_mode.mode,
                    NODAL_ANCHOR_OFFSETS[i],
                ),
                role: NODAL_ANCHOR_ROLES[i].to_owned(),
            })
            .collect();

        let silent_classes: Vec<u8> = (0u8..12)
            .filter(|pc| !DIATONIC_PITCH_CLASSES.contains(pc))
            .collect();

        let chromatic_body: Vec<ModalChromaticSlot> = (0u8..12)
            .map(|pc| {
                let diatonic = MathemeDiatonicContext::from_pitch_class(pc);
                ModalChromaticSlot {
                    pitch_class: pc,
                    note: note_name(pc).to_owned(),
                    is_diatonic: diatonic.is_some(),
                    diatonic_degree: diatonic.as_ref().map(|context| context.degree),
                    octet_indices: live_octet
                        .iter()
                        .filter(|carrier| carrier.pitch_class == pc)
                        .map(|carrier| carrier.octet_index)
                        .collect(),
                    nodal_roles: nodal
                        .iter()
                        .filter(|anchor| anchor.pitch_class == pc)
                        .map(|anchor| anchor.quartet_index)
                        .collect(),
                    silent_anchor_role: silent_classes
                        .iter()
                        .position(|silent| *silent == pc)
                        .map(|index| index as u8),
                    mirror: mirror_pitch_class(pc),
                }
            })
            .collect();

        let diatonic_set: Vec<ModalDiatonicRole> = DIATONIC_PITCH_CLASSES
            .iter()
            .filter_map(|pc| MathemeDiatonicContext::from_pitch_class(*pc))
            .map(|context| ModalDiatonicRole {
                pitch_class: context.pitch_class,
                degree: context.degree,
                note: context.note.clone(),
                context_frame: context.context_frame.clone(),
                context_agent: context.context_agent.clone(),
            })
            .collect();

        let silent_complement: Vec<ModalSilentAnchor> = silent_classes
            .iter()
            .enumerate()
            .map(|(index, pc)| ModalSilentAnchor {
                pitch_class: *pc,
                silent_index: index as u8,
                note: note_name(*pc).to_owned(),
            })
            .collect();

        let bell_partials: Vec<BellPartialRole> = BELL_PARTIAL_ROLES
            .iter()
            .enumerate()
            .map(|(index, role)| BellPartialRole {
                octet_index: index as u8,
                role: (*role).to_owned(),
            })
            .collect();

        Self {
            schema_version: 1,
            source: "MathemeHarmonicProfile".to_owned(),
            tick: absolute_tick,
            tick12,
            degree720,
            lens_mode: ModalLensMode {
                lens: lens_mode.lens,
                mode: lens_mode.mode,
                lens_mode_index: lens_mode.lens * 7 + lens_mode.mode,
            },
            m2_address72: ModalM2Address72 {
                address72: resonance72.lens_anchor_index,
                lens_anchor_index: resonance72.lens_anchor_index,
                tick12,
                position: resonance72.position,
                source: "MathemeHarmonicProfile.resonance72.lensAnchorIndex".to_owned(),
            },
            chromatic_body,
            live_octet,
            nodal_quartet: nodal,
            diatonic_set,
            silent_complement,
            bell_partials,
            cymatic_material: ModalCymaticMaterialProfile {
                mode: "deterministic-stylised".to_owned(),
                antinodal_driver: "MathemeHarmonicProfile.audio_octet".to_owned(),
                boundary_constraint: "MathemeHarmonicProfile.nodal_quartet".to_owned(),
            },
            privacy_class: "public-current-context".to_owned(),
            authority: ModalAuthority {
                pitch: "MathemeHarmonicProfile.audio_octet".to_owned(),
                nodal: "MathemeHarmonicProfile.nodal_quartet".to_owned(),
            },
            source_fields: ModalSourceFields {
                active_chromatic: "MathemeHarmonicProfile.chromatic".to_owned(),
                active_diatonic_context: "MathemeHarmonicProfile.diatonic".to_owned(),
                resonance72: "MathemeHarmonicProfile.resonance72".to_owned(),
            },
        }
    }
}
