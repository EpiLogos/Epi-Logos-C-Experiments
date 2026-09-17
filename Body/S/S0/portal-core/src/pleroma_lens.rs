// Coordinate: M3' pleromatic lens (Lens 6) — 30 aeons / 15 syzygies over the clock face.
// Residency: Body/S/S0/portal-core.
// Position (#n): #3 pattern / symbolic decomposition.
// Actualises: the Lens-6 Pleromatic identity — fixed aeon seats, opposition-syzygy law,
//             Ring-1 element derivation, Fibonacci-ground dyad inheritance.
// Public surface: PLEROMA_AEONS, PleromaArc, PleromaAeon, PleromaLayout, PleromaElement,
//                 layout/segment/element/ground-dyad functions and the threshold constants.
// Does NOT own: the 16-division table (kernel phase_space::CLOCK_LENSES_16), the
//               Fibonacci/Pisano law, the Ring-1 zodiac table, or any wire projection
//               (the pleromatic packet is a flagged follow-up tranche, not built here).
// Contract: [[M3'-SPEC]] + `Idea/Bimba/Map/datasets/mahamaya-deep/pleroma-30-syzygy-lens6-integration.md`
//           (canon v1, ratified 2026-07-19; fixed seats MAY become dynamic later).

use serde::{Deserialize, Serialize};

use crate::kernel::projections::phase_space::PhaseSpaceAddress;

/// Lens 6 in `CLOCK_LENSES_16` — slice 12°, 30 sections, name "Pleromatic".
pub const PLEROMA_LENS_ID: u8 = 6;
pub const PLEROMA_AEON_COUNT: usize = 30;
pub const PLEROMA_SYZYGY_COUNT: usize = 15;

/// The two threshold diameters — the only diameters touching the four Pisano
/// cardinal zeros. d=0 starts ON the 0°/180° boundaries (explicit threshold,
/// zeros at ground positions 0 and 30); d=7 CONTAINS 90°/270° at its segment
/// midpoints (implicit threshold, zeros at positions 15 and 45).
pub const PLEROMA_THRESHOLD_DIAMETERS: [u8; 2] = [0, 7];

/// The three arcs of the Pleroma. Syzygy quotas 4/5/6 — quaternary, pentad,
/// QL-hexad; LCM(4,5,6) = 60 = the Fibonacci ground period.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PleromaArc {
    Ogdoad,
    Decad,
    Dodecad,
}

impl PleromaArc {
    pub const fn syzygy_quota(self) -> u8 {
        match self {
            PleromaArc::Ogdoad => 4,
            PleromaArc::Decad => 5,
            PleromaArc::Dodecad => 6,
        }
    }
}

/// One pleromatic element (aeon). `syzygy` is the emanation-order syzygy index
/// (0..15); `prior` marks the first-named member, seated on Strand A
/// (explicit hemisphere, segments 0..14); the consort sits on Strand B.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PleromaAeon {
    pub emanation_index: u8, // 1..=30
    pub name: &'static str,
    pub meaning: &'static str,
    pub arc: PleromaArc,
    pub syzygy: u8, // 0..15, emanation order
    pub prior: bool,
}

const fn aeon(
    emanation_index: u8,
    name: &'static str,
    meaning: &'static str,
    arc: PleromaArc,
) -> PleromaAeon {
    PleromaAeon {
        emanation_index,
        name,
        meaning,
        arc,
        syzygy: (emanation_index - 1) / 2,
        prior: emanation_index % 2 == 1,
    }
}

/// The 30 aeons in Valentinian emanation order (Irenaeus, Adv. Haer. I.1.1–3).
pub const PLEROMA_AEONS: [PleromaAeon; 30] = [
    aeon(1, "Bythos", "Depth", PleromaArc::Ogdoad),
    aeon(2, "Sige", "Silence", PleromaArc::Ogdoad),
    aeon(3, "Nous", "Mind", PleromaArc::Ogdoad),
    aeon(4, "Aletheia", "Truth", PleromaArc::Ogdoad),
    aeon(5, "Logos", "Word", PleromaArc::Ogdoad),
    aeon(6, "Zoe", "Life", PleromaArc::Ogdoad),
    aeon(7, "Anthropos", "Humanity", PleromaArc::Ogdoad),
    aeon(8, "Ecclesia", "Assembly", PleromaArc::Ogdoad),
    aeon(9, "Bythios", "Profound", PleromaArc::Decad),
    aeon(10, "Mixis", "Mingling", PleromaArc::Decad),
    aeon(11, "Ageratos", "Unaging", PleromaArc::Decad),
    aeon(12, "Henosis", "Union", PleromaArc::Decad),
    aeon(13, "Autophyes", "Self-born", PleromaArc::Decad),
    aeon(14, "Hedone", "Delight", PleromaArc::Decad),
    aeon(15, "Acinetos", "Unmoved", PleromaArc::Decad),
    aeon(16, "Syncrasis", "Blending", PleromaArc::Decad),
    aeon(17, "Monogenes", "Only-begotten", PleromaArc::Decad),
    aeon(18, "Macaria", "Blessedness", PleromaArc::Decad),
    aeon(19, "Paracletus", "Advocate", PleromaArc::Dodecad),
    aeon(20, "Pistis", "Faith", PleromaArc::Dodecad),
    aeon(21, "Patricos", "Paternal", PleromaArc::Dodecad),
    aeon(22, "Elpis", "Hope", PleromaArc::Dodecad),
    aeon(23, "Metricos", "Maternal", PleromaArc::Dodecad),
    aeon(24, "Agape", "Love", PleromaArc::Dodecad),
    aeon(25, "Ainos", "Praise", PleromaArc::Dodecad),
    aeon(26, "Synesis", "Understanding", PleromaArc::Dodecad),
    aeon(27, "Ecclesiasticus", "Communal", PleromaArc::Dodecad),
    aeon(28, "Macariotes", "Felicity", PleromaArc::Dodecad),
    aeon(29, "Theletos", "Willed", PleromaArc::Dodecad),
    aeon(30, "Sophia", "Wisdom", PleromaArc::Dodecad),
];

/// Seat layouts. `Interleaved456` (default, ratified 2026-07-19): Sainte-Laguë
/// sequencing of the 4/5/6 arc quotas over the 15 diameters, rotated so an
/// Ogdoad diameter holds d=0 — both threshold diameters land in the Ogdoad,
/// and the five Decad diameters form a perfect pentagram (36° apart).
/// `Emanation`: contiguous arc blocks, diameter = emanation syzygy index.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum PleromaLayout {
    #[default]
    Interleaved456,
    Emanation,
}

/// Interleaved-4/5/6 seat table: emanation-order syzygy index → diameter.
/// Ogdoad syzygies 0..=3 → {0,4,7,12}; Decad 4..=8 → {2,5,8,11,14} (pentagram);
/// Dodecad 9..=14 → {1,3,6,9,10,13}.
pub const INTERLEAVED_456_DIAMETER_BY_SYZYGY: [u8; PLEROMA_SYZYGY_COUNT] =
    [0, 4, 7, 12, 2, 5, 8, 11, 14, 1, 3, 6, 9, 10, 13];

/// Diameter (0..15) carrying the given emanation-order syzygy under a layout.
pub fn diameter_for_syzygy(layout: PleromaLayout, syzygy: u8) -> u8 {
    match layout {
        PleromaLayout::Interleaved456 => INTERLEAVED_456_DIAMETER_BY_SYZYGY[syzygy as usize],
        PleromaLayout::Emanation => syzygy,
    }
}

/// Emanation-order syzygy index seated at the given diameter under a layout.
pub fn syzygy_at_diameter(layout: PleromaLayout, diameter: u8) -> u8 {
    match layout {
        PleromaLayout::Interleaved456 => INTERLEAVED_456_DIAMETER_BY_SYZYGY
            .iter()
            .position(|&d| d == diameter)
            .expect("diameter in 0..15") as u8,
        PleromaLayout::Emanation => diameter,
    }
}

/// Segment (0..30) seating the given aeon: prior on the diameter's Strand-A
/// segment (0..15), consort on Strand B (diameter + 15).
pub fn segment_for_aeon(layout: PleromaLayout, emanation_index: u8) -> u8 {
    let a = &PLEROMA_AEONS[(emanation_index - 1) as usize];
    let d = diameter_for_syzygy(layout, a.syzygy);
    if a.prior {
        d
    } else {
        d + 15
    }
}

/// The aeon seated at a Lens-6 segment (0..30) under a layout.
pub fn aeon_at_segment(layout: PleromaLayout, segment: u8) -> &'static PleromaAeon {
    let diameter = segment % 15;
    let prior = segment < 15;
    let syzygy = syzygy_at_diameter(layout, diameter);
    PLEROMA_AEONS
        .iter()
        .find(|a| a.syzygy == syzygy && a.prior == prior)
        .expect("every (syzygy, strand) pair is seated")
}

/// The pleromatic element vocabulary IS the generic lens-field vocabulary —
/// the instance inherits the law, it does not redeclare it.
pub use crate::lens_field::LensElement as PleromaElement;

/// Element law (canon §3): the generic 720-unit midpoint law specialized to
/// Lens 6 (slice 12). Reduces to sign = ⌊(12k+6)/30⌋; determinate everywhere —
/// the boundary-straddling segments 7 and 22 have midpoints exactly ON the
/// 90°/270° pivots.
pub fn segment_element(segment: u8) -> PleromaElement {
    crate::lens_field::segment_element_at(12, u16::from(segment))
}

/// The Fibonacci-ground dyad an aeon-seat inherits: Lens 6 is the half-ground
/// (12° = two 6° steps), so segment k holds Pisano positions {2k, 2k+1}.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PleromaGroundDyad {
    pub positions: [u8; 2],
    pub digits: [u8; 2],
}

pub fn segment_ground_dyad(segment: u8) -> PleromaGroundDyad {
    let base_degree = u16::from(segment) * 12;
    let first = PhaseSpaceAddress::from_degree720(base_degree).fibonacci_ground;
    let second = PhaseSpaceAddress::from_degree720(base_degree + 6).fibonacci_ground;
    PleromaGroundDyad {
        positions: [first.position, second.position],
        digits: [first.digit, second.digit],
    }
}

/// Digit sum across a diameter (both opposed segments) — layout-independent.
/// Inherits the 10-complement law: 20 everywhere except the two threshold
/// diameters (10 each); total across all 15 diameters = 280 = the full
/// Pisano digit sum.
pub fn diameter_digit_sum(diameter: u8) -> u16 {
    let a = segment_ground_dyad(diameter);
    let b = segment_ground_dyad(diameter + 15);
    a.digits.iter().chain(b.digits.iter()).map(|&d| u16::from(d)).sum()
}

// ─────────────────────────────────────────────────────────────────────────────
// Wire packet decoration — the pleromatic INSTANCE of the generic lens field
// (owned/serializable; the generic field carries structure + activation, this
// carries the symbolic system seated on it).
// ─────────────────────────────────────────────────────────────────────────────

/// Serialized layout discriminator for the wire.
pub fn layout_wire_name(layout: PleromaLayout) -> &'static str {
    match layout {
        PleromaLayout::Interleaved456 => "interleaved456",
        PleromaLayout::Emanation => "emanation",
    }
}

pub fn layout_from_wire_name(name: &str) -> Option<PleromaLayout> {
    match name {
        "interleaved456" => Some(PleromaLayout::Interleaved456),
        "emanation" => Some(PleromaLayout::Emanation),
        _ => None,
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PleromaSeatPacket {
    pub segment: u8,
    pub aeon: String,
    pub meaning: String,
    pub emanation_index: u8,
    pub arc: String,
    pub syzygy: u8,
    pub prior: bool,
    pub element: PleromaElement,
    pub fibonacci_positions: [u8; 2],
    pub fibonacci_digits: [u8; 2],
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PleromaSyzygyPacket {
    pub syzygy: u8,
    pub diameter: u8,
    pub arc: String,
    pub prior_aeon: String,
    pub consort_aeon: String,
    pub prior_element: PleromaElement,
    pub consort_element: PleromaElement,
    pub digit_sum: u16,
    pub threshold: bool,
}

/// The full pleromatic instance decoration for the Lens-6 field packet.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PleromaInstancePacket {
    pub kind: String,
    pub layout: String,
    pub seats: Vec<PleromaSeatPacket>,
    pub syzygies: Vec<PleromaSyzygyPacket>,
}

fn arc_name(arc: PleromaArc) -> &'static str {
    match arc {
        PleromaArc::Ogdoad => "ogdoad",
        PleromaArc::Decad => "decad",
        PleromaArc::Dodecad => "dodecad",
    }
}

pub fn pleroma_instance_packet(layout: PleromaLayout) -> PleromaInstancePacket {
    let seats = (0..30u8)
        .map(|segment| {
            let aeon = aeon_at_segment(layout, segment);
            let dyad = segment_ground_dyad(segment);
            PleromaSeatPacket {
                segment,
                aeon: aeon.name.to_string(),
                meaning: aeon.meaning.to_string(),
                emanation_index: aeon.emanation_index,
                arc: arc_name(aeon.arc).to_string(),
                syzygy: aeon.syzygy,
                prior: aeon.prior,
                element: segment_element(segment),
                fibonacci_positions: dyad.positions,
                fibonacci_digits: dyad.digits,
            }
        })
        .collect();
    let syzygies = (0..PLEROMA_SYZYGY_COUNT as u8)
        .map(|syzygy| {
            let diameter = diameter_for_syzygy(layout, syzygy);
            let prior = &PLEROMA_AEONS[(syzygy as usize) * 2];
            let consort = &PLEROMA_AEONS[(syzygy as usize) * 2 + 1];
            PleromaSyzygyPacket {
                syzygy,
                diameter,
                arc: arc_name(prior.arc).to_string(),
                prior_aeon: prior.name.to_string(),
                consort_aeon: consort.name.to_string(),
                prior_element: segment_element(diameter),
                consort_element: segment_element(diameter + 15),
                digit_sum: diameter_digit_sum(diameter),
                threshold: PLEROMA_THRESHOLD_DIAMETERS.contains(&diameter),
            }
        })
        .collect();
    PleromaInstancePacket {
        kind: "pleroma".to_string(),
        layout: layout_wire_name(layout).to_string(),
        seats,
        syzygies,
    }
}
