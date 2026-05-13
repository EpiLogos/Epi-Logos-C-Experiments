use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct OracleFaces {
    pub primary_degree: u16,
    pub deficient_degree: u16,
    pub implicate_degree: u16,
    pub temporal_hex: u8,
    pub primary_hex: u8,
    pub changing_lines_mask: u8,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum CodonClass {
    PerfectPalindromic = 0,
    ImperfectPalindromic = 1,
    NonPalindromicNonDual = 2,
    Dual = 3,
}

impl CodonClass {
    pub fn is_dual(self) -> bool {
        self == CodonClass::Dual
    }
    pub fn is_non_dual(self) -> bool {
        !self.is_dual()
    }
    pub fn is_palindromic(self) -> bool {
        matches!(
            self,
            CodonClass::PerfectPalindromic | CodonClass::ImperfectPalindromic
        )
    }
    pub fn is_perfect_palindrome(self) -> bool {
        self == CodonClass::PerfectPalindromic
    }
    pub fn rotational_state_count(self) -> u8 {
        if self.is_dual() { 8 } else { 7 }
    }
    pub fn label(self) -> &'static str {
        match self {
            CodonClass::PerfectPalindromic => "perfect-palindromic",
            CodonClass::ImperfectPalindromic => "imperfect-palindromic",
            CodonClass::NonPalindromicNonDual => "non-palindromic-non-dual",
            CodonClass::Dual => "dual",
        }
    }
}

impl Default for CodonClass {
    fn default() -> Self {
        CodonClass::PerfectPalindromic
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ActiveCodon {
    pub codon_a: u8,
    pub codon_b: u8,
    pub class_a: CodonClass,
    pub class_b: CodonClass,
    pub sequence_a: [u8; 3],
    pub amino_acid: u8,
    pub anticodon: u8,
    pub rotation_count_a: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlanetaryAspect {
    pub planet_a: u8,
    pub planet_b: u8,
    pub aspect_type: u8,
    pub angle: f32,
    pub orb: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum WalkMode {
    Ground = 0,
    Torus = 1,
    Fiber = 2,
    Spanda = 3,
}

impl WalkMode {
    pub fn label(self) -> &'static str {
        match self {
            WalkMode::Ground => "ground",
            WalkMode::Torus => "torus",
            WalkMode::Fiber => "fiber",
            WalkMode::Spanda => "spanda",
        }
    }
}

impl Default for WalkMode {
    fn default() -> Self {
        WalkMode::Ground
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum WalkType {
    Degree = 0,
    Amino = 1,
    Zodiac = 2,
    Spanda = 3,
    Decan = 4,
    Hexagram = 5,
    Enneadic = 6,
    Seasonal = 7,
    LineChange = 8,
}

pub const WALK_TYPE_COUNT: usize = 9;

impl WalkType {
    pub fn step_count(self) -> u16 {
        const STEPS: [u16; WALK_TYPE_COUNT] = [360, 24, 12, 12, 36, 64, 9, 4, 384];
        STEPS[self as usize]
    }
    pub fn label(self) -> &'static str {
        match self {
            WalkType::Degree => "degree",
            WalkType::Amino => "amino",
            WalkType::Zodiac => "zodiac",
            WalkType::Spanda => "spanda",
            WalkType::Decan => "decan",
            WalkType::Hexagram => "hexagram",
            WalkType::Enneadic => "enneadic",
            WalkType::Seasonal => "seasonal",
            WalkType::LineChange => "line-change",
        }
    }
    pub fn all() -> &'static [WalkType; WALK_TYPE_COUNT] {
        &[
            WalkType::Degree,
            WalkType::Amino,
            WalkType::Zodiac,
            WalkType::Spanda,
            WalkType::Decan,
            WalkType::Hexagram,
            WalkType::Enneadic,
            WalkType::Seasonal,
            WalkType::LineChange,
        ]
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct PlanetState {
    pub degree: u16,
    pub is_retrograde: bool,
    pub is_resonance: bool,
    pub transiting_hex: u8,
    pub transiting_tarot: u8,
    pub transiting_chakra: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KairosState {
    pub planets: [PlanetState; 10],
    pub current_hour: u8,
    pub hour_planet: u8,
    pub active_chakra: u8,
    pub timestamp: u64,
    pub valid: bool,
}

impl Default for KairosState {
    fn default() -> Self {
        KairosState {
            planets: std::array::from_fn(|_| PlanetState {
                degree: 0xFFFF,
                ..Default::default()
            }),
            current_hour: 0,
            hour_planet: 0xFF,
            active_chakra: 0xFF,
            timestamp: 0,
            valid: false,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PortalClockState {
    pub session_hash: [u8; 32],
    pub live_quaternion: [f32; 4],
    pub composed_quaternion: [f32; 4],
    pub quintessence_quaternion: [f32; 4],
    pub current_degree: u16,
    pub tick12: u8,
    pub last_cast: Option<OracleFaces>,
    pub last_cast_timestamp: u64,
    pub chakra_levels: [f32; 8],
    pub active_branch_lens: u8,
    pub transform_stage: u8,
    pub logos_stage: u8,
    pub kairos: KairosState,
    pub orbital_position: [f32; 3],
    pub ql_position: u8,
    pub walk_mode: WalkMode,
    pub bifurcation_param: f32,
    pub resolution_level: u8,
    pub active_codon: ActiveCodon,
    pub transit_quaternion: [f32; 4],
    pub aspects: Vec<PlanetaryAspect>,
    pub micro_orbit: Vec<u16>,
    pub natal_degrees: [u16; 10],
    pub generation: u64,
    pub zoom_level: f32,
}

impl Default for PortalClockState {
    fn default() -> Self {
        PortalClockState {
            session_hash: [0u8; 32],
            live_quaternion: [1.0, 0.0, 0.0, 0.0],
            composed_quaternion: [1.0, 0.0, 0.0, 0.0],
            quintessence_quaternion: [1.0, 0.0, 0.0, 0.0],
            current_degree: 0,
            tick12: 0,
            last_cast: None,
            last_cast_timestamp: 0,
            chakra_levels: [0.0; 8],
            active_branch_lens: 0,
            transform_stage: 0,
            logos_stage: 0,
            kairos: KairosState::default(),
            orbital_position: [0.0; 3],
            ql_position: 0,
            walk_mode: WalkMode::default(),
            bifurcation_param: 0.0,
            resolution_level: 0,
            active_codon: ActiveCodon::default(),
            transit_quaternion: [1.0, 0.0, 0.0, 0.0],
            aspects: Vec::new(),
            micro_orbit: Vec::new(),
            natal_degrees: [0xFFFF; 10],
            generation: 0,
            zoom_level: 1.0,
        }
    }
}
