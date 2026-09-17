// Coordinate: M3'/M1' :: phase-space core (S0 projection, Sprint-8 E1+E2)
// Actualises: the 720 phase-space law (Architect correction #3) — the clock's
//   two planes (codon vs hexagram valence per degree) give every generated
//   state a spot in the 720 possibility space, and the tick is CARRIED across
//   the 16+1 functional lenses (the primary 60-position Fibonacci Ground and
//   the 16 derived static divisions that structure temporality).
//   Source of truth is the C substrate: `CLOCK_DEGREE_LUT[360]` (.rodata,
//   epi-lib src/m3_clock_lut.c, 384 = 360 + 24 = 64×6 topology law) — this
//   module BINDS it, it never re-derives degree/hexagram/codon law.
// Does NOT own: the LUT contents (epi-lib .rodata), lens SEMANTICS beyond the
//   §4 division table, renderer choreography, personal identity.

use serde::{Deserialize, Serialize};
use std::sync::Once;

/// Raw FFI mirror of `Clock_Degree_Entry` (epi-lib include/m3.h). Field order
/// and types MUST match the C struct exactly — the layout test pins sizeof
/// and spot-checks entries against the generated table's own comments.
#[repr(C)]
#[derive(Clone, Copy, Debug)]
pub struct RawClockDegreeEntry {
    pub degree_node_360: u16,
    pub exact_degree_720: f32,
    pub zodiac_sign: u8,
    pub zodiac_degree: u8,
    pub decan_idx: u8,
    pub decan_position: u8,
    pub is_backbone_node: u8,
    pub hexagram_id: u8,
    pub hexagram_line_active: u8,
    pub is_non_dual_codon: u8,
    pub codon_class: u8,
    pub codon_upper_pair: u8,
    pub codon_lower_pair: u8,
    pub tarot_card_id: u8,
    pub decan_planet: u8,
    pub decan_element: u8,
    pub decan_chakra: u8,
    pub tick12: u8,
    pub strand: u8,
    pub dr_ring: u8,
    pub m1_ananda_value: u8,
    pub m0_archetype: u8,
    pub shadow_degree: u16,
    pub polar_opposite: u16,
    pub enneadic_chamber: u8,
    pub chamber_day_night: u8,
}

extern "C" {
    static CLOCK_DEGREE_LUT: [RawClockDegreeEntry; 360];
    static pisano_digit_lut: [u8; 60];
    static CLOCK_BACKBONE: [RawClockBackboneNode; 24];
    fn m3_build_backbone();
}

#[repr(C)]
#[derive(Clone, Copy, Debug)]
struct RawClockBackboneNode {
    degree: u16,
    backbone_index: u8,
    hour_of_day: u8,
    zodiac_sign: u8,
    is_cusp: u8,
    amino_acid_idx: u8,
    is_palindromic: u8,
    _pad: [u8; 4],
}

static BACKBONE_INIT: Once = Once::new();

fn fibonacci_digit_lut() -> Vec<u8> {
    // SAFETY: `pisano_digit_lut` is the immutable 60-byte C .rodata table
    // declared by epi-lib's public m3.h contract.
    unsafe { pisano_digit_lut.to_vec() }
}

fn clock_backbone_degrees() -> Vec<u16> {
    BACKBONE_INIT.call_once(|| {
        // SAFETY: the C populator is idempotent and owns the exact 24-entry
        // CLOCK_BACKBONE allocation declared in m3.h.
        unsafe { m3_build_backbone() };
    });
    // SAFETY: initialization above populated every one of the fixed 24 rows.
    unsafe { CLOCK_BACKBONE.iter().map(|node| node.degree).collect() }
}

/// Safe view into the C `.rodata` table.
pub fn raw_clock_degree_entry(degree360: u16) -> &'static RawClockDegreeEntry {
    // SAFETY: CLOCK_DEGREE_LUT is a const .rodata array of exactly 360
    // entries, compiled into the same archive (epi-lib build.rs); the index
    // is wrapped into range.
    unsafe { &CLOCK_DEGREE_LUT[(degree360 % 360) as usize] }
}

/// One of the 16 sacred division lenses (cosmic-clock §4 LUT — the formula
/// `segment = degree / slice` is the authority; the prose example block's
/// errata are pinned in the app tests). `slice` is degrees per segment;
/// `slice * sections == 360` for every row.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ClockLensDivision {
    pub slice: u16,
    pub sections: u16,
    pub name: &'static str,
    /// The Architect-named temporality structurers: the 4-, 12-, and
    /// 24-section divisions. These gear rhythm/time through the primary
    /// 60-position Fibonacci Ground lens; the others remain analytic divisions.
    pub temporal_canon: bool,
}

/// The 16 derived static apertures. The primary Fibonacci Ground is functional
/// lens 16, but is not a seventeenth static division row in this homogeneous
/// table because its 60 positions carry Fibonacci/Pisano growth semantics.
pub const CLOCK_LENSES_16: [ClockLensDivision; 16] = [
    ClockLensDivision {
        slice: 1,
        sections: 360,
        name: "Microscopic",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 2,
        sections: 180,
        name: "Binary",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 4,
        sections: 90,
        name: "Quaternary",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 8,
        sections: 45,
        name: "Octagonal",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 9,
        sections: 40,
        name: "Enneadic",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 10,
        sections: 36,
        name: "Decan",
        temporal_canon: false,
    },
    // Lens 6 drift correction (2026-07-19): a 30-fold division cannot carry the
    // 12-fold zodiac (that is Lens 9 "Solar Month"). Lens 6 is the Pleromatic
    // lens — 30 aeons in 15 opposition syzygies; law and table in
    // `crate::pleroma_lens` + `pleroma-30-syzygy-lens6-integration.md`.
    ClockLensDivision {
        slice: 12,
        sections: 30,
        name: "Pleromatic",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 15,
        sections: 24,
        name: "Hourly",
        temporal_canon: true,
    },
    ClockLensDivision {
        slice: 24,
        sections: 15,
        name: "Expanded Hours",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 30,
        sections: 12,
        name: "Solar Month",
        temporal_canon: true,
    },
    ClockLensDivision {
        slice: 36,
        sections: 10,
        name: "Decadic",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 40,
        sections: 9,
        name: "Greater Chamber",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 45,
        sections: 8,
        name: "Octant",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 90,
        sections: 4,
        name: "Quadrant",
        temporal_canon: true,
    },
    ClockLensDivision {
        slice: 180,
        sections: 2,
        name: "Hemisphere",
        temporal_canon: false,
    },
    ClockLensDivision {
        slice: 360,
        sections: 1,
        name: "Unity",
        temporal_canon: false,
    },
];

/// The primary `+1` lens id following the sixteen derived division ids 0..15.
pub const PRIMARY_GROUND_LENS_ID: u8 = CLOCK_LENSES_16.len() as u8;

/// Pisano-60: fib(n) mod 10 over one full period — the Fibonacci Ground's
/// digit at each of the 60 Level-0 positions (M3'-SPEC `fibonacci_digit`).
fn pisano60_digit(position: u8) -> u8 {
    // SAFETY: modulo 60 bounds the immutable C table access.
    unsafe { pisano_digit_lut[(position % 60) as usize] }
}

/// Typed kernel view of one clock degree — the C entry made profile-safe,
/// plus the computed 16-lens membership the C struct does not yet carry.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClockDegreeNode {
    pub degree360: u16,
    /// The C law `exact_degree_720 = degree * 2` — each degree spans TWO
    /// phase units of the 720 sweep: its codon face and its hexagram face.
    pub exact_degree720: f32,
    pub zodiac_sign: u8,
    pub zodiac_degree: u8,
    pub decan36: u8,
    pub decan_position: u8,
    /// Palindromic anchor (degree % 15 == 0) — one of the 24 stable backbone
    /// nodes of the 384 = 360 + 24 topology.
    pub is_backbone_node: bool,
    pub hexagram_id: u8,
    pub hexagram_line_active: u8,
    pub is_non_dual_codon: bool,
    /// 0=perfect, 1=imperfect, 2=non-palindromic-non-dual, 3=dual.
    pub codon_class: u8,
    pub codon_upper_pair: u8,
    pub codon_lower_pair: u8,
    /// 0 currently means dataset-unavailable (honest pending state — the
    /// generator ran without the Neo4j dataset pass).
    pub tarot_card_id: u8,
    pub decan_planet: u8,
    pub decan_element: u8,
    pub decan_chakra: u8,
    /// The DEGREE's 30°-arc index (floor(degree/30)) — the clock-face tick12,
    /// distinct from the profile's temporal tick12.
    pub degree_tick12: u8,
    /// 0 = Strand-A/explicate, 1 = Strand-B/implicate.
    pub strand: u8,
    /// 0 = Mahamaya {1,2,4,8,7,5}, 1 = Parashakti {3,6,9}.
    pub dr_ring: u8,
    pub m1_ananda_value: u8,
    pub m0_archetype: u8,
    pub shadow_degree: u16,
    pub polar_opposite: u16,
    pub enneadic_chamber: u8,
    pub chamber_day_night: u8,
    /// `lensSegment[i] = floor(degree / CLOCK_LENSES_16[i].slice)` — which
    /// segment of each sacred division this degree falls in (the §4 formula,
    /// computed here because the implemented C entry omits the spec field;
    /// u16 because the Microscopic lens has 360 segments — the spec's
    /// `uint8_t lens_segment[16]` cannot hold its own first row, an erratum
    /// to flag when the C struct gains the field).
    pub lens_segment: [u16; 16],
}

impl ClockDegreeNode {
    pub fn from_degree360(degree360: u16) -> Self {
        let degree = degree360 % 360;
        let raw = raw_clock_degree_entry(degree);
        let mut lens_segment = [0u16; 16];
        for (i, lens) in CLOCK_LENSES_16.iter().enumerate() {
            lens_segment[i] = degree / lens.slice;
        }
        Self {
            degree360: raw.degree_node_360,
            exact_degree720: raw.exact_degree_720,
            zodiac_sign: raw.zodiac_sign,
            zodiac_degree: raw.zodiac_degree,
            decan36: raw.decan_idx,
            decan_position: raw.decan_position,
            is_backbone_node: raw.is_backbone_node != 0,
            hexagram_id: raw.hexagram_id,
            hexagram_line_active: raw.hexagram_line_active,
            is_non_dual_codon: raw.is_non_dual_codon != 0,
            codon_class: raw.codon_class,
            codon_upper_pair: raw.codon_upper_pair,
            codon_lower_pair: raw.codon_lower_pair,
            tarot_card_id: raw.tarot_card_id,
            decan_planet: raw.decan_planet,
            decan_element: raw.decan_element,
            decan_chakra: raw.decan_chakra,
            degree_tick12: raw.tick12,
            strand: raw.strand,
            dr_ring: raw.dr_ring,
            m1_ananda_value: raw.m1_ananda_value,
            m0_archetype: raw.m0_archetype,
            shadow_degree: raw.shadow_degree,
            polar_opposite: raw.polar_opposite,
            enneadic_chamber: raw.enneadic_chamber,
            chamber_day_night: raw.chamber_day_night,
            lens_segment,
        }
    }
}

/// Which plane of the 720 double-cover the address sits on, and therefore
/// which VALENCE of the degree is active: the primary/explicate traversal
/// reads the degree's codon face; the shadow/implicate traversal reads its
/// hexagram face (the clock's two planes — every degree carries both).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PhasePlane {
    PrimaryCodon,
    ShadowHexagram,
}

/// The active valence reading of the degree for the current plane.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "kind")]
pub enum PhaseValence {
    #[serde(rename_all = "camelCase")]
    Codon {
        upper_pair: u8,
        lower_pair: u8,
        codon_class: u8,
        is_non_dual: bool,
    },
    #[serde(rename_all = "camelCase")]
    Hexagram { hexagram_id: u8, line_active: u8 },
}

/// The tick carried across one lens division: which segment the degree sits
/// in and how far through it the sweep has travelled.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensSegmentPhase {
    pub lens_index: u8,
    pub slice: u16,
    pub sections: u16,
    pub name: String,
    pub temporal_canon: bool,
    pub segment: u16,
    pub degree_in_segment: u16,
    /// 0.0 at the segment's opening degree, approaching 1.0 at its close.
    pub phase01: f32,
}

/// The Fibonacci Ground Level-0 aperture: primary functional lens 16 and the
/// grounding address through which the sixteen static division lenses operate.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FibonacciGroundPhase {
    /// Functionally the seventeenth lens; id 16 follows derived ids 0..15.
    pub lens_id: u8,
    /// Serialized role discriminator shared with the on-demand lens endpoint.
    pub role: String,
    pub slice: u16,
    pub sections: u8,
    /// 0-59: which 6° Level-0 position.
    pub position: u8,
    /// fib(position) mod 10 (Pisano-60 digit law).
    pub digit: u8,
    /// Full C-authored Pisano-60 digit table for read-only renderers. `None`
    /// represents a legacy profile and must render pending, never a fallback.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub digit_lut: Option<Vec<u8>>,
    /// The 24 C-authored CLOCK_BACKBONE degree positions.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub backbone_degrees: Option<Vec<u16>>,
    pub phase01: f32,
    pub temporal_canon: bool,
}

/// One tick's address in the 720 possibility space: the plane, the active
/// valence, the degree node (both faces + all ring memberships), and the
/// tick carried across the 16+1 temporal apertures. Additive on profile
/// schema v1; derived entirely from `degree720` — pure kernel law.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhaseSpaceAddress {
    pub degree720: u16,
    pub degree360: u16,
    pub plane: PhasePlane,
    pub active_valence: PhaseValence,
    pub node: ClockDegreeNode,
    pub lens_carrier: Vec<LensSegmentPhase>,
    pub fibonacci_ground: FibonacciGroundPhase,
    pub authority: String,
}

impl PhaseSpaceAddress {
    pub fn from_degree720(degree720: u16) -> Self {
        let degree720 = degree720 % 720;
        let degree360 = degree720 % 360;
        let plane = if degree720 < 360 {
            PhasePlane::PrimaryCodon
        } else {
            PhasePlane::ShadowHexagram
        };
        let node = ClockDegreeNode::from_degree360(degree360);
        let active_valence = match plane {
            PhasePlane::PrimaryCodon => PhaseValence::Codon {
                upper_pair: node.codon_upper_pair,
                lower_pair: node.codon_lower_pair,
                codon_class: node.codon_class,
                is_non_dual: node.is_non_dual_codon,
            },
            PhasePlane::ShadowHexagram => PhaseValence::Hexagram {
                hexagram_id: node.hexagram_id,
                line_active: node.hexagram_line_active,
            },
        };
        let lens_carrier = CLOCK_LENSES_16
            .iter()
            .enumerate()
            .map(|(i, lens)| {
                let segment = degree360 / lens.slice;
                let degree_in_segment = degree360 % lens.slice;
                LensSegmentPhase {
                    lens_index: i as u8,
                    slice: lens.slice,
                    sections: lens.sections,
                    name: lens.name.to_owned(),
                    temporal_canon: lens.temporal_canon,
                    segment,
                    degree_in_segment,
                    phase01: degree_in_segment as f32 / lens.slice as f32,
                }
            })
            .collect();
        let fib_position = (degree360 / 6) as u8;
        Self {
            degree720,
            degree360,
            plane,
            active_valence,
            node,
            lens_carrier,
            fibonacci_ground: FibonacciGroundPhase {
                lens_id: PRIMARY_GROUND_LENS_ID,
                role: "primary-ground".to_owned(),
                slice: 6,
                sections: 60,
                position: fib_position,
                digit: pisano60_digit(fib_position),
                digit_lut: Some(fibonacci_digit_lut()),
                backbone_degrees: Some(clock_backbone_degrees()),
                phase01: (degree360 % 6) as f32 / 6.0,
                temporal_canon: true,
            },
            authority: "epi-lib::CLOCK_DEGREE_LUT (.rodata, 384 = 360 + 24 = 64x6)".to_owned(),
        }
    }
}
