use std::error::Error;
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::events::{KleinFlipEvent, Valence};
use crate::kernel::{KernelPhase, KernelTick};
use crate::oracle_lut::{element, planet};

const PLANET_COUNT: usize = 10;
const SHEM_PER_DECAN: u8 = 2;
const DECAN_COUNT: u8 = 36;
const INDEX72_COUNT: u8 = 72;
const DEPOSIT_HANDLE_PRIVACY_CLASS: &str = "protected_local_handle_only";

// M2'-SPEC §9.2 names this Chaldean planetary-hour cycle explicitly.
const PLANETARY_HOUR_RULERS: [u8; 7] = [
    planet::SUN,
    planet::VENUS,
    planet::MERCURY,
    planet::MOON,
    planet::SATURN,
    planet::JUPITER,
    planet::MARS,
];

/// Chaldean decan rulers in ZODIAC-DEGREE order (decan n = degrees n*10 to
/// n*10+9): the descending Chaldean cycle Mars→Sun→Venus→Mercury→Moon→
/// Saturn→Jupiter repeating from Aries I, closing on Mars at Pisces III —
/// the cosmic-clock §5.2 rulership law, agreeing with `CLOCK_DEGREE_LUT`
/// (.rodata, epi-lib) and the m2 portal plugin's DECAN_RULER_TABLE.
///
/// CORRECTED 2026-07-02 (Sprint-8 E1 cross-LUT test): the previous data was
/// a Vedic drekkana table GROUPED BY TRIPLICITY (fire signs' nine decans
/// first: Mars/Sun/Jupiter…), which diverges from the zodiac-degree indexing
/// every consumer of this table uses (DecanAxisView.ruling_planet and the
/// live-planet resonance events both index by floor(degree/10)). Flagged for
/// [[M2'-SPEC]] harmonisation write-back — if a triplicity-grouped drekkana
/// axis is ever needed, it must be its own table with its own index law.
const DECAN_RULERS_36: [u8; 36] = [
    planet::MARS,    // 0  Aries I
    planet::SUN,     // 1  Aries II
    planet::VENUS,   // 2  Aries III
    planet::MERCURY, // 3  Taurus I
    planet::MOON,    // 4  Taurus II
    planet::SATURN,  // 5  Taurus III
    planet::JUPITER, // 6  Gemini I
    planet::MARS,    // 7  Gemini II
    planet::SUN,     // 8  Gemini III
    planet::VENUS,   // 9  Cancer I
    planet::MERCURY, // 10 Cancer II
    planet::MOON,    // 11 Cancer III
    planet::SATURN,  // 12 Leo I
    planet::JUPITER, // 13 Leo II
    planet::MARS,    // 14 Leo III
    planet::SUN,     // 15 Virgo I
    planet::VENUS,   // 16 Virgo II
    planet::MERCURY, // 17 Virgo III
    planet::MOON,    // 18 Libra I
    planet::SATURN,  // 19 Libra II
    planet::JUPITER, // 20 Libra III
    planet::MARS,    // 21 Scorpio I
    planet::SUN,     // 22 Scorpio II
    planet::VENUS,   // 23 Scorpio III
    planet::MERCURY, // 24 Sagittarius I
    planet::MOON,    // 25 Sagittarius II
    planet::SATURN,  // 26 Sagittarius III
    planet::JUPITER, // 27 Capricorn I
    planet::MARS,    // 28 Capricorn II
    planet::SUN,     // 29 Capricorn III
    planet::VENUS,   // 30 Aquarius I
    planet::MERCURY, // 31 Aquarius II
    planet::MOON,    // 32 Aquarius III
    planet::SATURN,  // 33 Pisces I
    planet::JUPITER, // 34 Pisces II
    planet::MARS,    // 35 Pisces III — the Chaldean closure on Mars
];

const MAQAM_RANGES: [(u8, u8, u8); 10] = [
    (0, 9, planet::SUN),
    (9, 8, planet::VENUS),
    (17, 8, planet::MOON),
    (25, 5, planet::MERCURY),
    (30, 7, planet::SATURN),
    (37, 8, planet::JUPITER),
    (45, 6, planet::VENUS),
    (51, 7, planet::MARS),
    (58, 9, planet::NEPTUNE),
    (67, 5, planet::PLUTO),
];

const MAQAM_RATIOS: [(u16, u16); 10] = [
    (0, 0),
    (27, 22),
    (12, 11),
    (24, 23),
    (75, 64),
    (6, 5),
    (5, 4),
    (16, 15),
    (13, 12),
    (45, 32),
];

const MANTRA_FREQUENCIES: [u16; 100] = [
    432, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 384, 380, 376, 372, 368, 364, 360,
    356, 352, 348, 344, 340, 336, 332, 328, 324, 320, 316, 312, 308, 304, 300, 296, 292, 288, 284,
    280, 276, 272, 268, 264, 260, 256, 252, 248, 244, 240, 236, 232, 228, 224, 220, 216, 212, 208,
    204, 200, 196, 192, 188, 184, 180, 176, 172, 168, 164, 160, 158, 156, 154, 152, 150, 148, 147,
    146, 145, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144,
    144, 144, 144, 144, 144,
];

const ASMA_DIGITAL_ROOTS: [u8; 100] = [
    1, 9, 8, 2, 2, 3, 4, 1, 3, 2, 4, 9, 5, 8, 7, 3, 2, 7, 2, 1, 8, 1, 5, 2, 1, 3, 4, 7, 3, 3, 6, 8,
    1, 4, 4, 8, 4, 5, 5, 5, 2, 2, 7, 7, 7, 4, 4, 2, 7, 8, 5, 1, 5, 5, 4, 7, 3, 7, 7, 8, 6, 9, 3, 4,
    4, 2, 4, 4, 5, 8, 5, 7, 4, 5, 5, 3, 1, 1, 4, 4, 2, 5, 4, 3, 5, 3, 1, 1, 9, 4, 3, 3, 1, 5, 1, 8,
    3, 2, 7, 9,
];

// M2'-SPEC §9.3 Asma overlay: 99 names + 1 supreme name (index 99 = Allah / Hu).
// Group 0: Jalal (majesty) indices 0-32, Group 1: Jamal (beauty) indices 33-65,
// Group 2: Kamal (perfection) indices 66-98, index 99 = supreme name (no mirror).
// mirror_idx cross-references the mirror-pair within each group. 0xFF means no mirror.
const MIRROR_ABSENT: u8 = 0xFF;
const ASMA_JALAL_COUNT: u8 = 33;
const ASMA_JAMAL_COUNT: u8 = 33;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AsmaNameDesc {
    pub name_idx: u8,
    pub group: u8,
    pub index_in_group: u8,
    pub mirror_idx: u8,
    pub has_mirror: bool,
}

impl AsmaNameDesc {
    pub fn for_index(name_idx: u8) -> Self {
        let group = if name_idx < ASMA_JALAL_COUNT {
            0
        } else if name_idx < ASMA_JALAL_COUNT + ASMA_JAMAL_COUNT {
            1
        } else if name_idx < 99 {
            2
        } else {
            3
        };

        let index_in_group = match group {
            0 => name_idx,
            1 => name_idx - ASMA_JALAL_COUNT,
            2 => name_idx - ASMA_JALAL_COUNT - ASMA_JAMAL_COUNT,
            _ => 0,
        };

        let mirror_idx = match group {
            0 => {
                let mirror = name_idx + ASMA_JALAL_COUNT;
                if mirror < 99 {
                    mirror
                } else {
                    MIRROR_ABSENT
                }
            }
            1 => {
                let mirror = name_idx - ASMA_JALAL_COUNT;
                mirror
            }
            2 => {
                // Kamal group: pair within the group (0↔1, 2↔3, ...)
                let pair = index_in_group ^ 1;
                if pair < (99 - ASMA_JALAL_COUNT - ASMA_JAMAL_COUNT) {
                    ASMA_JALAL_COUNT + ASMA_JAMAL_COUNT + pair
                } else {
                    MIRROR_ABSENT
                }
            }
            _ => MIRROR_ABSENT,
        };

        Self {
            name_idx,
            group,
            index_in_group,
            mirror_idx,
            has_mirror: mirror_idx != MIRROR_ABSENT,
        }
    }
}

/// Cymatic phase state — mirrors the Klein-flip valence on the Asma overlay.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CymaticPhase {
    Primary,
    Inverted,
}

impl CymaticPhase {
    pub fn flip(self) -> Self {
        match self {
            Self::Primary => Self::Inverted,
            Self::Inverted => Self::Primary,
        }
    }
}

/// Query result for `cymatic_invert(address72)` — the Asma mirror state.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CymaticInvertState {
    pub address72: u8,
    pub asma: AsmaNameDesc,
    pub phase: CymaticPhase,
    pub mirror_name_idx: Option<u8>,
    pub mirror_relation: String,
    pub phase_law: String,
    pub last_flip_candidate: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutingPlanetPosition {
    pub planet_id: u8,
    pub degree: f32,
    pub retrograde: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KerykeionRoutingState {
    pub planets: [RoutingPlanetPosition; PLANET_COUNT],
    #[serde(default)]
    pub planetary_hour: Option<u8>,
    #[serde(default)]
    pub planetary_hour_ruler: Option<u8>,
}

impl KerykeionRoutingState {
    pub fn from_json(json: &str) -> Result<Self, RoutingError> {
        let value: serde_json::Value = serde_json::from_str(json)
            .map_err(|err| RoutingError::InvalidKerykeionJson(err.to_string()))?;
        let planets = value
            .get("planets")
            .and_then(|planets| planets.as_array())
            .ok_or(RoutingError::MissingPlanetsArray)?;
        let mut slots: [Option<RoutingPlanetPosition>; PLANET_COUNT] = [None; PLANET_COUNT];
        for planet_value in planets {
            let planet_id = planet_id_from_value(planet_value)?;
            let degree = degree_from_value(planet_value, planet_id)?;
            let retrograde = planet_value
                .get("retrograde")
                .or_else(|| planet_value.get("is_retrograde"))
                .or_else(|| planet_value.get("isRetrograde"))
                .and_then(|value| value.as_bool())
                .unwrap_or(false);
            let idx = planet_id as usize;
            if slots[idx].is_some() {
                return Err(RoutingError::DuplicatePlanet { planet_id });
            }
            slots[idx] = Some(RoutingPlanetPosition {
                planet_id,
                degree,
                retrograde,
            });
        }
        for planet_id in 0..PLANET_COUNT {
            if slots[planet_id].is_none() {
                return Err(RoutingError::MissingPlanet {
                    planet_id: planet_id as u8,
                });
            }
        }

        Ok(Self {
            planets: std::array::from_fn(|idx| slots[idx].expect("all planets checked")),
            planetary_hour: optional_u8(&value, &["planetary_hour", "planetaryHour"])?,
            planetary_hour_ruler: optional_u8(
                &value,
                &["planetary_hour_ruler", "planetaryHourRuler"],
            )?,
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShemPair {
    pub light_idx: u8,
    pub shadow_idx: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutingTrace {
    pub planetary_hour_ruler: u8,
    pub active_decan: u8,
    pub shem_pair: ShemPair,
    pub maqam_family: u8,
    pub maqam_mode: u8,
    pub mantra_index: u8,
    pub asma_name: u8,
    /// Asma overlay record with mirror metadata (03.T3.10).
    #[serde(default)]
    pub asma: AsmaNameDesc,
    pub index72: u8,
    pub det64: u64,
    #[serde(default)]
    pub deposit_handle: String,
    #[serde(default = "default_deposit_handle_privacy_class")]
    pub deposit_handle_privacy_class: String,
    pub axis_views: RoutingAxisViews,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutingAxisViews {
    pub mef: MefAxisView,
    pub tattva: TattvaAxisView,
    pub decan: DecanAxisView,
    pub shem: ShemAxisView,
    pub maqam: MaqamAxisView,
    pub det: DetAxisView,
}

impl RoutingAxisViews {
    pub fn for_index72(index72: u8) -> Option<Self> {
        if index72 >= INDEX72_COUNT {
            return None;
        }
        Some(Self {
            mef: MefAxisView::from_index72(index72),
            tattva: TattvaAxisView::from_index72(index72),
            decan: DecanAxisView::from_index72(index72),
            shem: ShemAxisView::from_index72(index72),
            maqam: MaqamAxisView::from_index72(index72),
            det: DetAxisView::from_index72(index72),
        })
    }

    pub fn index72(&self) -> Option<u8> {
        let index = self.mef.index72();
        if self.tattva.index72() == index
            && self.decan.index72() == index
            && self.shem.index72() == index
            && self.maqam.index72() == index
            && self.det.index72() == index
        {
            Some(index)
        } else {
            None
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MefAxisView {
    pub lens: u8,
    pub position: u8,
    pub is_inverted: bool,
    pub l_family_link: u8,
}

impl MefAxisView {
    fn from_index72(index72: u8) -> Self {
        let lens = index72 / 6;
        Self {
            lens,
            position: index72 % 6,
            is_inverted: lens >= 6,
            l_family_link: lens % 6,
        }
    }

    pub fn index72(&self) -> u8 {
        self.lens * 6 + self.position
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TattvaAxisView {
    pub tattva_index: u8,
    pub phase: u8,
}

impl TattvaAxisView {
    fn from_index72(index72: u8) -> Self {
        Self {
            tattva_index: index72 / 2,
            phase: index72 % 2,
        }
    }

    pub fn index72(&self) -> u8 {
        self.tattva_index * 2 + self.phase
    }
}

/// Chaldean ruler of a decan (0-35). The kernel-owned rulership law the
/// resonance event of cosmic-clock §5.2 reads from — renderers consume the
/// projected flag and never carry their own decan tables.
pub fn decan_ruler(decan36: u8) -> u8 {
    DECAN_RULERS_36[(decan36 % DECAN_COUNT) as usize]
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecanAxisView {
    pub element_id: u8,
    pub sign: u8,
    pub decan: u8,
    pub face: u8,
    pub ruling_planet: u8,
}

impl DecanAxisView {
    fn from_index72(index72: u8) -> Self {
        let decan36 = index72 / 2;
        Self {
            element_id: element_for_decan_family(decan36 / 9),
            sign: (decan36 % 9) / 3,
            decan: decan36 % 3,
            face: index72 % 2,
            ruling_planet: DECAN_RULERS_36[decan36 as usize],
        }
    }

    pub fn index72(&self) -> u8 {
        let element_family = decan_family_for_element(self.element_id);
        ((element_family * 9 + self.sign * 3 + self.decan) * 2) + self.face
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShemAxisView {
    pub shem_idx: u8,
    pub choir: u8,
    pub position: u8,
    pub element_id: u8,
    pub decan_link: u8,
}

impl ShemAxisView {
    fn from_index72(index72: u8) -> Self {
        const SHEM_ELEMENT_CYCLE: [u8; 5] = [
            element::AGNI,
            element::PRITHVI,
            element::VAYU,
            element::APAS,
            element::AKASHA,
        ];
        Self {
            shem_idx: index72,
            choir: index72 / 9,
            position: index72 % 9,
            element_id: SHEM_ELEMENT_CYCLE[index72 as usize % SHEM_ELEMENT_CYCLE.len()],
            decan_link: index72,
        }
    }

    pub fn index72(&self) -> u8 {
        self.choir * 9 + self.position
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MaqamAxisView {
    pub index72: u8,
    pub family: u8,
    pub mode_in_family: u8,
    pub planet_ruler: u8,
}

impl MaqamAxisView {
    fn from_index72(index72: u8) -> Self {
        let (family, mode_in_family, planet_ruler) = maqam_family_mode(index72);
        Self {
            index72,
            family,
            mode_in_family,
            planet_ruler,
        }
    }

    pub fn index72(&self) -> u8 {
        self.index72
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetAxisView {
    pub index72: u8,
    pub compressed64: u8,
    pub det64: u64,
}

impl DetAxisView {
    fn from_index72(index72: u8) -> Self {
        Self {
            index72,
            compressed64: (index72 as u16 * 8 / 9) as u8,
            det64: det64_for_index72(index72),
        }
    }

    pub fn index72(&self) -> u8 {
        self.index72
    }
}

pub fn f_routing(intent: &str, kerykeion: &KerykeionRoutingState, t: KernelTick) -> RoutingTrace {
    let planetary_hour_ruler = planetary_hour_ruler(kerykeion, t);
    let active_decan = active_decan_for_ruler(kerykeion, planetary_hour_ruler);
    let face = match t.phase {
        KernelPhase::Descent => 0,
        KernelPhase::Ascent => 1,
    };
    let index72 = active_decan * SHEM_PER_DECAN + face;
    let axis_views =
        RoutingAxisViews::for_index72(index72).expect("active decan face remains in 0..72");
    let maqam_family = axis_views.maqam.family;
    let maqam_mode = axis_views.maqam.mode_in_family;
    let mantra_index = select_mantra_index(maqam_family, t.phase);
    let asma_name = select_asma_name(intent, index72, planetary_hour_ruler);
    let asma = AsmaNameDesc::for_index(asma_name);
    let det64 = axis_views.det.det64;
    let deposit_handle = deposit_handle_for_trace(index72, det64);

    // 03.T3.10: Emit M2CymaticValenceInvert when the Asma mirror_idx crosses
    // a phase boundary (0→1 or 1→0 in the binary mirror field). The tick12
    // sub-tick % 12 == 7 is the canonical M2 cymatic inversion boundary per
    // vimarsha_reading.rs. When the selected Asma name has a mirror and the
    // tick lands on the flip boundary, the phase flips.
    let _flip_candidate = t.sub_tick % 12 == 7 && asma.has_mirror;

    RoutingTrace {
        planetary_hour_ruler,
        active_decan,
        shem_pair: ShemPair {
            light_idx: active_decan * SHEM_PER_DECAN,
            shadow_idx: active_decan * SHEM_PER_DECAN + 1,
        },
        maqam_family,
        maqam_mode,
        mantra_index,
        asma_name,
        asma,
        index72,
        det64,
        deposit_handle,
        deposit_handle_privacy_class: DEPOSIT_HANDLE_PRIVACY_CLASS.to_owned(),
        axis_views,
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RoutingError {
    InvalidKerykeionJson(String),
    MissingPlanetsArray,
    MissingPlanet { planet_id: u8 },
    DuplicatePlanet { planet_id: u8 },
    InvalidPlanetId(u64),
    UnknownPlanetName(String),
    InvalidPlanetDegree { planet_id: u8, degree: String },
    InvalidOptionalU8 { field: &'static str, value: u64 },
}

impl fmt::Display for RoutingError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidKerykeionJson(err) => write!(f, "invalid kerykeion JSON: {err}"),
            Self::MissingPlanetsArray => write!(f, "kerykeion routing state must contain planets"),
            Self::MissingPlanet { planet_id } => write!(f, "missing planet id {planet_id}"),
            Self::DuplicatePlanet { planet_id } => write!(f, "duplicate planet id {planet_id}"),
            Self::InvalidPlanetId(planet_id) => write!(f, "invalid planet id {planet_id}"),
            Self::UnknownPlanetName(name) => write!(f, "unknown planet name {name}"),
            Self::InvalidPlanetDegree { planet_id, degree } => {
                write!(f, "invalid degree for planet {planet_id}: {degree}")
            }
            Self::InvalidOptionalU8 { field, value } => {
                write!(f, "{field} must fit in u8, got {value}")
            }
        }
    }
}

impl Error for RoutingError {}

fn planetary_hour_ruler(kerykeion: &KerykeionRoutingState, tick: KernelTick) -> u8 {
    if let Some(ruler) = kerykeion.planetary_hour_ruler {
        return ruler.min((PLANET_COUNT - 1) as u8);
    }
    let hour = kerykeion
        .planetary_hour
        .unwrap_or_else(|| ((tick.cycle * 12 + tick.sub_tick as u64) % 24) as u8);
    PLANETARY_HOUR_RULERS[hour as usize % PLANETARY_HOUR_RULERS.len()]
}

fn active_decan_for_ruler(kerykeion: &KerykeionRoutingState, ruler: u8) -> u8 {
    let degree = kerykeion.planets[ruler as usize].degree.rem_euclid(360.0);
    ((degree / 10.0).floor() as u8).min(DECAN_COUNT - 1)
}

fn maqam_family_mode(index72: u8) -> (u8, u8, u8) {
    for (family, (start, len, planet_ruler)) in MAQAM_RANGES.iter().enumerate() {
        if (*start..(*start + *len)).contains(&index72) {
            return (family as u8, index72 - *start, *planet_ruler);
        }
    }
    unreachable!("index72 is bounded before maqam lookup")
}

fn select_mantra_index(maqam_family: u8, phase: KernelPhase) -> u8 {
    let (num, den) = MAQAM_RATIOS[maqam_family as usize];
    let target = if num == 0 || den == 0 {
        256.0
    } else {
        256.0 * num as f32 / den as f32
    };
    let preferred_phase = match phase {
        KernelPhase::Descent => 0,
        KernelPhase::Ascent => 1,
    };
    MANTRA_FREQUENCIES
        .iter()
        .enumerate()
        .min_by(|(left_idx, left), (right_idx, right)| {
            let left_delta = (**left as f32 - target).abs();
            let right_delta = (**right as f32 - target).abs();
            let left_matches = (mantra_phase(*left_idx) == preferred_phase) as u8;
            let right_matches = (mantra_phase(*right_idx) == preferred_phase) as u8;
            left_delta
                .partial_cmp(&right_delta)
                .unwrap_or(std::cmp::Ordering::Equal)
                .then_with(|| left_matches.cmp(&right_matches).reverse())
                .then_with(|| left_idx.cmp(right_idx))
        })
        .map(|(idx, _)| idx as u8)
        .expect("mantra frequency LUT is non-empty")
}

fn mantra_phase(index: usize) -> u8 {
    if index < 50 {
        0
    } else {
        1
    }
}

fn select_asma_name(intent: &str, index72: u8, planetary_hour_ruler: u8) -> u8 {
    let group = asma_group_for_intent(intent);
    let desired_root = digital_root(index72 as u16 + planetary_hour_ruler as u16 + 1);
    let (start, end) = match group {
        0 => (0, 33),
        1 => (33, 66),
        _ => (66, 99),
    };
    (start..end)
        .find(|idx| ASMA_DIGITAL_ROOTS[*idx] == desired_root)
        .unwrap_or(99) as u8
}

fn asma_group_for_intent(intent: &str) -> u8 {
    let lower = intent.to_ascii_lowercase();
    if lower.contains("protect")
        || lower.contains("justice")
        || lower.contains("awe")
        || lower.contains("cut")
        || lower.contains("release")
    {
        0
    } else if lower.contains("clar")
        || lower.contains("learn")
        || lower.contains("truth")
        || lower.contains("wisdom")
        || lower.contains("integr")
    {
        1
    } else {
        2
    }
}

fn digital_root(value: u16) -> u8 {
    let rem = value % 9;
    if rem == 0 {
        9
    } else {
        rem as u8
    }
}

fn det64_for_index72(index72: u8) -> u64 {
    if index72 < 64 {
        1_u64 << index72
    } else {
        1_u64 << ((index72 - 64) * 8)
    }
}

fn deposit_handle_for_trace(index72: u8, det64: u64) -> String {
    format!("m4.deposit://nara-journal/m2/f-routing/index72/{index72}/det64/{det64:016x}")
}

fn default_deposit_handle_privacy_class() -> String {
    DEPOSIT_HANDLE_PRIVACY_CLASS.to_owned()
}

fn element_for_decan_family(family: u8) -> u8 {
    match family {
        0 => element::AGNI,
        1 => element::PRITHVI,
        2 => element::VAYU,
        _ => element::APAS,
    }
}

fn decan_family_for_element(element_id: u8) -> u8 {
    match element_id {
        element::AGNI => 0,
        element::PRITHVI => 1,
        element::VAYU => 2,
        _ => 3,
    }
}

fn optional_u8(
    value: &serde_json::Value,
    field_names: &[&'static str],
) -> Result<Option<u8>, RoutingError> {
    for field in field_names {
        if let Some(raw) = value.get(*field).and_then(|value| value.as_u64()) {
            return u8::try_from(raw)
                .map(Some)
                .map_err(|_| RoutingError::InvalidOptionalU8 { field, value: raw });
        }
    }
    Ok(None)
}

fn planet_id_from_value(value: &serde_json::Value) -> Result<u8, RoutingError> {
    if let Some(id) = value
        .get("planet_id")
        .or_else(|| value.get("planetId"))
        .and_then(|value| value.as_u64())
    {
        return if id < PLANET_COUNT as u64 {
            Ok(id as u8)
        } else {
            Err(RoutingError::InvalidPlanetId(id))
        };
    }
    let name = value
        .get("name")
        .and_then(|value| value.as_str())
        .ok_or(RoutingError::InvalidPlanetId(u64::MAX))?;
    planet_id_from_name(name).ok_or_else(|| RoutingError::UnknownPlanetName(name.to_owned()))
}

fn degree_from_value(value: &serde_json::Value, planet_id: u8) -> Result<f32, RoutingError> {
    let raw = value
        .get("degree")
        .or_else(|| value.get("absolute_degree"))
        .or_else(|| value.get("absoluteDegree"))
        .ok_or_else(|| RoutingError::InvalidPlanetDegree {
            planet_id,
            degree: "missing".to_owned(),
        })?;
    let degree = raw
        .as_f64()
        .ok_or_else(|| RoutingError::InvalidPlanetDegree {
            planet_id,
            degree: raw.to_string(),
        })? as f32;
    if degree.is_finite() && (0.0..360.0).contains(&degree) {
        Ok(degree)
    } else {
        Err(RoutingError::InvalidPlanetDegree {
            planet_id,
            degree: raw.to_string(),
        })
    }
}

fn planet_id_from_name(name: &str) -> Option<u8> {
    match name.to_ascii_lowercase().as_str() {
        "sun" => Some(planet::SUN),
        "moon" => Some(planet::MOON),
        "mercury" => Some(planet::MERCURY),
        "venus" => Some(planet::VENUS),
        "mars" => Some(planet::MARS),
        "jupiter" => Some(planet::JUPITER),
        "saturn" => Some(planet::SATURN),
        "uranus" => Some(planet::URANUS),
        "neptune" => Some(planet::NEPTUNE),
        "pluto" => Some(planet::PLUTO),
        _ => None,
    }
}

// ══════════════════════════════════════════════════════════════════════
// 03.T3.10: Asma mirror overlay + kernel phase-flip integration
// ══════════════════════════════════════════════════════════════════════

/// Query the current Asma mirror state for a given address72 index.
/// Returns the Asma overlay record, current phase, mirror information,
/// and whether the current tick is a flip candidate.
///
/// This is the gateway-facing projection of the M2CymaticValenceInvert
/// observable — consumed by the S3 gateway `m2.cymatic_invert` method
/// and the `epi m2 cymatic-invert` CLI command.
pub fn cymatic_invert(
    address72: u8,
    intent: &str,
    planetary_hour_ruler: u8,
    tick12: u8,
) -> CymaticInvertState {
    let asma_name = select_asma_name(intent, address72, planetary_hour_ruler);
    let asma = AsmaNameDesc::for_index(asma_name);
    let flip_candidate = tick12 % 12 == 7 && asma.has_mirror;
    let phase = if flip_candidate {
        CymaticPhase::Inverted
    } else {
        CymaticPhase::Primary
    };

    CymaticInvertState {
        address72,
        asma,
        phase,
        mirror_name_idx: if asma.has_mirror {
            Some(asma.mirror_idx)
        } else {
            None
        },
        mirror_relation: if asma.has_mirror {
            "domain_mirror".to_owned()
        } else {
            "none".to_owned()
        },
        phase_law: "#/inversion_spanda".to_owned(),
        last_flip_candidate: flip_candidate,
    }
}

/// 03.T3.10: Emit an M2CymaticValenceInvert event when the Asma mirror_idx
/// crosses a phase boundary. Returns `Some(KleinFlipEvent::M2CymaticValenceInvert)`
/// at the canonical flip boundary (tick12 % 12 == 7) when the selected Asma
/// name has a declared domain mirror; returns `None` otherwise.
///
/// This is the M2-side emission site for the global `#` phase-flip law.
/// The existing three-variant `KleinFlipEvent` enum carries the event — no
/// new event enum is created. The same `address72` is conserved; only the
/// interpretive phase / surface valence flips.
pub fn emit_m2_cymatic_flip(
    address72: u8,
    intent: &str,
    planetary_hour_ruler: u8,
    tick12: u8,
) -> Option<KleinFlipEvent> {
    let asma_name = select_asma_name(intent, address72, planetary_hour_ruler);
    let asma = AsmaNameDesc::for_index(asma_name);
    let is_flip_boundary = tick12 % 12 == 7;

    if is_flip_boundary && asma.has_mirror {
        Some(KleinFlipEvent::M2CymaticValenceInvert {
            valence_before: Valence::Primary,
            valence_after: Valence::Inverted,
        })
    } else {
        None
    }
}
