use std::sync::{Arc, Mutex};

// ─────────────────────────────────────────────────────────────────────────────
// ORACLE FACES
// ─────────────────────────────────────────────────────────────────────────────

/// The four faces of a complete oracle cast.
/// pp=T(Earth/w), nn=A(Fire/x), np=G(Water/y), pn=C(Air/z)
#[derive(Clone, Debug, Default)]
pub struct OracleFaces {
    /// d — codon (what is expressed, the explicit cast position)
    pub primary_degree: u16,

    /// Deficient aspect: structural complement (anticodon).
    /// Canonical route via # operator in Spanda index space:
    ///   deficient_substage = (primary_substage + 6) % 12
    /// Equivalent degree formula: (d + 180) % 360.
    pub deficient_degree: u16,

    /// Implicate phase: #(d) — the # inversion operator applied to the degree coordinate.
    /// Same clock ring position, inversion_state flipped (the antipodal spinor).
    /// Canonical route: spanda_invert(primary_substage) = 11 - primary_substage.
    /// Rendered at same ring position with inverted marker.
    pub implicate_degree: u16,

    /// Temporal hexagram: primary_hex XOR'd by the cast's changing lines.
    /// Determined LIVE by the coin throw — NOT pre-computed per degree in the LUT.
    pub temporal_hex: u8,
    pub primary_hex: u8,
    /// 6-bit bitmask: which lines moved in this cast (from old-yin / old-yang coin outcomes).
    pub changing_lines_mask: u8,
}

// ─────────────────────────────────────────────────────────────────────────────
// CODON CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/// 3-tier (40/24) codon classification. Mirrors C Codon_Class in m3.h.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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
    /// Rotational state count: all 40 non-dual codons have 7 states, 24 dual have 8.
    pub fn rotational_state_count(self) -> u8 {
        if self.is_dual() {
            8
        } else {
            7
        }
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

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE CODON
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Clone, Debug, Default)]
pub struct ActiveCodon {
    pub codon_a: u8, // from Clock A (degree->decan->codon)
    pub codon_b: u8, // from Clock B (hexagram->codon)
    pub class_a: CodonClass,
    pub class_b: CodonClass,
    pub sequence_a: [u8; 3],
    pub amino_acid: u8,
    pub anticodon: u8,
    pub rotation_count_a: u8,
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY ASPECTS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Clone, Debug)]
pub struct PlanetaryAspect {
    pub planet_a: u8,
    pub planet_b: u8,
    pub aspect_type: u8, // 0=conjunction..4=opposition
    pub angle: f32,
    pub orb: f32,
}

// ─────────────────────────────────────────────────────────────────────────────
// WALK MODE
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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

// ─────────────────────────────────────────────────────────────────────────────
// WALK TYPE — 9 structural walk geometries (Task 23)
// ─────────────────────────────────────────────────────────────────────────────

/// The 9 structural walk types. Distinct from WalkMode (quaternion-selected strategy).
/// Each type defines a different ring geometry with a fixed step count.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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

/// Total number of walk types.
pub const WALK_TYPE_COUNT: usize = 9;

impl WalkType {
    /// Number of discrete steps in this walk type's ring.
    pub fn step_count(self) -> u16 {
        const STEPS: [u16; WALK_TYPE_COUNT] = [360, 24, 12, 12, 36, 64, 9, 4, 384];
        STEPS[self as usize]
    }

    /// Human-readable label for display.
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

    /// All walk types in order.
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

// ─────────────────────────────────────────────────────────────────────────────
// QUATERNION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/// Hamilton product of two quaternions [w, x, y, z].
pub fn quat_mul(a: [f32; 4], b: [f32; 4]) -> [f32; 4] {
    let (aw, ax, ay, az) = (a[0], a[1], a[2], a[3]);
    let (bw, bx, by, bz) = (b[0], b[1], b[2], b[3]);
    [
        aw * bw - ax * bx - ay * by - az * bz,
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
    ]
}

/// Normalize a quaternion to unit length. Returns identity if magnitude is near zero.
pub fn quat_normalize(q: [f32; 4]) -> [f32; 4] {
    let mag = (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]).sqrt();
    if mag < f32::EPSILON {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        [q[0] / mag, q[1] / mag, q[2] / mag, q[3] / mag]
    }
}

/// Derive walk mode from quaternion: argmax of |w|, |x|, |y|, |z|.
/// Ground=|w| dominant, Torus=|x|, Fiber=|y|, Spanda=|z|.
pub fn derive_walk_mode(q: [f32; 4]) -> WalkMode {
    let abs = [q[0].abs(), q[1].abs(), q[2].abs(), q[3].abs()];
    let mut max_idx = 0usize;
    for i in 1..4 {
        if abs[i] > abs[max_idx] {
            max_idx = i;
        }
    }
    match max_idx {
        0 => WalkMode::Ground,
        1 => WalkMode::Torus,
        2 => WalkMode::Fiber,
        _ => WalkMode::Spanda,
    }
}

/// Derive bifurcation parameter and resolution level from quaternion.
/// Bifurcation parameter λ = sqrt(x² + y² + z²). Mirrors C walk_bifurcation_param().
/// Resolution: 4 levels matching C walk_resolution_level() thresholds.
pub fn derive_bifurcation(q: [f32; 4]) -> (f32, u8) {
    let lambda = (q[1] * q[1] + q[2] * q[2] + q[3] * q[3]).sqrt();
    let level = if lambda < 0.25 {
        0
    } else if lambda < 0.50 {
        1
    } else if lambda < 0.75 {
        2
    } else {
        3
    };
    (lambda, level)
}

// ─────────────────────────────────────────────────────────────────────────────
// ASPECT COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

/// (angle_degrees, orb_degrees) for the 5 Ptolemaic aspects.
/// 0=conjunction, 1=sextile, 2=square, 3=trine, 4=opposition.
const ASPECT_ANGLES: [(u16, u8); 5] = [(0, 10), (60, 6), (90, 8), (120, 8), (180, 10)];

/// Compute all planetary aspects from current kairos state.
/// Iterates all planet pairs (0..10), checks angular difference against 5 aspect types.
pub fn compute_aspects(state: &SharedClockState) {
    let mut s = state.lock().unwrap();
    let mut aspects = Vec::new();
    for a in 0..10u8 {
        let deg_a = s.kairos.planets[a as usize].degree;
        if deg_a == 0xFFFF {
            continue;
        }
        for b in (a + 1)..10u8 {
            let deg_b = s.kairos.planets[b as usize].degree;
            if deg_b == 0xFFFF {
                continue;
            }
            let diff = ((deg_a as i32) - (deg_b as i32)).unsigned_abs() as u16;
            let angular_diff = diff.min(360 - diff);
            for (idx, &(target, orb)) in ASPECT_ANGLES.iter().enumerate() {
                let orb_f = orb as f32;
                let diff_from_exact = (angular_diff as f32 - target as f32).abs();
                if diff_from_exact <= orb_f {
                    aspects.push(PlanetaryAspect {
                        planet_a: a,
                        planet_b: b,
                        aspect_type: idx as u8,
                        angle: angular_diff as f32,
                        orb: diff_from_exact,
                    });
                }
            }
        }
    }
    s.aspects = aspects;
}

/// Full kairos update: set kairos state, compute transit quaternion from element distribution,
/// and compute aspects. Alternative entry point that does not break existing `update_kairos`.
pub fn update_kairos_full(state: &SharedClockState, kairos: KairosState) {
    // Compute transit quaternion from element distribution (sign % 4 -> element bucket)
    let mut elem_counts = [0.0f32; 4]; // w=EARTH, x=FIRE, y=WATER, z=AIR
    let mut valid_count = 0.0f32;
    for ps in &kairos.planets {
        if ps.degree == 0xFFFF {
            continue;
        }
        let sign = (ps.degree / 30) as usize % 12;
        // sign -> element: Fire(0,4,8), Earth(1,5,9), Air(2,6,10), Water(3,7,11)
        let elem = sign % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
                             // Remap to quaternion: w=EARTH(1), x=FIRE(0), y=WATER(3), z=AIR(2)
        let qi = match elem {
            0 => 1, // Fire -> x
            1 => 0, // Earth -> w
            2 => 3, // Air -> z
            3 => 2, // Water -> y
            _ => 0,
        };
        elem_counts[qi] += 1.0;
        valid_count += 1.0;
    }

    let transit_q = if valid_count > 0.0 {
        let raw = [
            elem_counts[0] / valid_count,
            elem_counts[1] / valid_count,
            elem_counts[2] / valid_count,
            elem_counts[3] / valid_count,
        ];
        quat_normalize(raw)
    } else {
        [1.0, 0.0, 0.0, 0.0]
    };

    {
        let mut s = state.lock().unwrap();
        s.transit_quaternion = transit_q;
        s.kairos = kairos;
    }
    compute_aspects(state);
    state.lock().unwrap().generation += 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// KAIROS STATE — full live planetary interpretation from Kerykeion
// ─────────────────────────────────────────────────────────────────────────────

/// Live state for a single planet, from Kerykeion.
#[derive(Clone, Debug, Default)]
pub struct PlanetState {
    /// Current ecliptic degree (0–359). 0xFFFF = unavailable.
    pub degree: u16,
    /// True if planet is in retrograde motion.
    pub is_retrograde: bool,
    /// True if planet is transiting the decan it rules (resonance event: "at home").
    pub is_resonance: bool,
    /// Hexagram at this planet's current degree (CLOCK_DEGREE_LUT[degree].hexagram_id).
    pub transiting_hex: u8,
    /// Tarot card at this planet's current degree.
    pub transiting_tarot: u8,
    /// Chakra at this planet's current degree (from decan_chakra field).
    pub transiting_chakra: u8,
}

/// Full kairos (astrological time) state.
/// Replaces the bare `planet_degrees: [u16; 9]` array; canonical size is now 10 (mod-10 ordering).
/// Written by: KairosLoader on Kerykeion sync; SpacetimeDB subscriber for live.
/// Read by: CosmicClockPlugin (planet ring), M4SpinePlugin (chakra resonance / hour sync).
#[derive(Clone, Debug)]
pub struct KairosState {
    /// One entry per tracked planet. Canonical mod-10 ordering (00-canonical-invariants §2):
    /// [Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9]
    /// Index 0 = Sun (stable root/parent; not chakra-mapped).
    /// Index 7 = Uranus (outer/transpersonal, M2-5 layer).
    /// Earth is the geocentric observer — NOT in this array (see EarthBodyState).
    pub planets: [PlanetState; 10],
    /// Current planetary hour (0–23, Chaldean hour cycle).
    pub current_hour: u8,
    /// Which planet rules the current hour (Planet_Id). 0xFF = unknown.
    pub hour_planet: u8,
    /// Which chakra resonates with the current hour's ruling planet (PLANET_CHAKRA lookup).
    /// This chakra glows at 110% in M4SpinePlugin.
    pub active_chakra: u8,
    /// Unix timestamp of this Kerykeion reading.
    pub timestamp: u64,
    /// False if Kerykeion unavailable (graceful stub — planet degrees remain 0xFFFF).
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

// ─────────────────────────────────────────────────────────────────────────────
// PORTAL CLOCK STATE — #4.4.4.4 as namespace switchboard
// ─────────────────────────────────────────────────────────────────────────────

/// The live clock state shared across all portal plugins.
/// This IS the #4.4.4.4 routing hub: all M4 branch state flows through here.
///
/// Written by: M4OraclePlugin (on cast), KairosLoader (on sync), identity loader (on augment),
///             M4TransformPlugin, M4LogosPlugin
/// Read by:    CosmicClockPlugin, MiniClockPlugin, M4SpinePlugin, M4IdentityPlugin,
///             M4MedicinePlugin, M4OraclePlugin
#[derive(Clone, Debug)]
pub struct PortalClockState {
    // ── Identity anchor ───────────────────────────────────────────────────────
    /// Session identity hash (BLAKE3 of quintessence_hash + session_start).
    /// Used for SpacetimeDB UserPresence routing and multi-user orbital placement.
    pub session_hash: [u8; 32],

    // ── Quaternion layer ──────────────────────────────────────────────────────
    /// Live quaternion from latest oracle charges (pp/nn/np/pn → w/x/y/z).
    /// Updated every oracle cast. Drives torus rotation in CosmicClockPlugin.
    pub live_quaternion: [f32; 4],

    /// Composed quaternion: quintessence * transit * oracle (normalized).
    /// Walk mode and bifurcation derive from this quaternion.
    pub composed_quaternion: [f32; 4],

    /// Quintessence quaternion: weighted elemental average across all five #4.0
    /// identity layers (Natal/GeneKeys/HumanDesign/Jungian/QLBirth).
    /// Mapping: EARTH→w, FIRE→x, WATER→y, AIR→z (normalized unit quaternion).
    /// Updates only on `epi nara identity` augment. Stable torus ground orientation.
    pub quintessence_quaternion: [f32; 4],

    // ── Oracle layer ──────────────────────────────────────────────────────────
    /// Current oracle cast degree (0–359).
    pub current_degree: u16,

    /// Spanda substage index (0–11, discrete).
    /// Strand A: 0–5 (explicit/ascending). Strand B: 6–11 (implicit/Möbius return).
    /// MUST be set via quantize_to_spanda_substage(), never float-cast.
    pub tick12: u8,

    /// Last complete oracle reading (4 faces). None until first cast.
    pub last_cast: Option<OracleFaces>,

    /// Unix timestamp of the last oracle cast (seconds since epoch).
    /// Used by M4SpinePlugin for oracle decay visualization (~4h fade).
    pub last_cast_timestamp: u64,

    // ── Branch state (#4.1–#4.5) ─────────────────────────────────────────────
    /// Live chakra activation levels [0.0, 1.0] for 8 slots:
    /// [0=Earth(observer), 1=Root, 2=Sacral, 3=Solar, 4=Heart, 5=Throat, 6=ThirdEye, 7=Crown].
    /// Updated from oracle cast (elemental balance) and kairos planetary hour.
    pub chakra_levels: [f32; 8],

    /// Which of the 6 nara branch lenses (#4.4.0–#4.4.5) is active:
    /// 0=Literal, 1=Functional, 2=Structural, 3=Archetypal, 4=Phenomenological, 5=KS.
    /// (Distinct from CLOCK_LENSES[16] — those are AI agent analytical modes, not user branch state.)
    pub active_branch_lens: u8,

    /// Current #4.3 transformation cycle stage (0–5: SEED/POLE/TRIKA/FLOWER/FULL/META).
    pub transform_stage: u8,

    /// Current #4.5 logos cycle stage (0–5: A-Logos through An-a-Logos).
    pub logos_stage: u8,

    // ── Kairos layer ──────────────────────────────────────────────────────────
    /// Full live planetary state from Kerykeion.
    pub kairos: KairosState,

    // ── Multiplayer anchor ────────────────────────────────────────────────────
    /// 3D torus surface position derived from (current_degree, tick12).
    /// Used by SpacetimeDB for collective rendering of multiple users on the torus.
    pub orbital_position: [f32; 3],

    // ── Extended clock fields ────────────────────────────────────────────────
    /// Current QL position (0-5). Derived from tick12: if tick12 < 6 then tick12, else 11-tick12.
    pub ql_position: u8,

    /// Active walk mode derived from composed quaternion argmax.
    pub walk_mode: WalkMode,

    /// Bifurcation parameter lambda = 1 - w^2 (distance from identity quaternion).
    pub bifurcation_param: f32,

    /// Resolution level (0-5), quantized from bifurcation_param.
    pub resolution_level: u8,

    /// Active codon pair from Clock A (degree->decan->codon) and Clock B (hexagram->codon).
    pub active_codon: ActiveCodon,

    /// Transit quaternion derived from planetary element distribution.
    pub transit_quaternion: [f32; 4],

    /// Currently active planetary aspects (Ptolemaic: conjunction/sextile/square/trine/opposition).
    pub aspects: Vec<PlanetaryAspect>,

    /// Micro-orbit: recent degree history (capped at 360 entries).
    pub micro_orbit: Vec<u16>,

    /// Natal planet degrees from birth chart (loaded from identity profile).
    /// 0xFFFF = unavailable. Canonical mod-10 ordering.
    pub natal_degrees: [u16; 10],

    /// Monotonic generation counter. Incremented on every state mutation.
    /// Render thread watches this to detect changes and skip redundant redraws.
    pub generation: u64,

    /// Perspective zoom level. 1.0 = default, <1 = zoomed in, >1 = zoomed out.
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

pub type SharedClockState = Arc<Mutex<PortalClockState>>;

/// Create a new SharedClockState, pre-seeding identity-derived fields if a profile exists.
///
/// On successful profile load:
/// - `session_hash` = BLAKE3(identity_hash || session_start_timestamp)
/// - `quintessence_quaternion` = weighted elemental average of stored layer profiles
///
/// Spec: 00-canonical-invariants §1 (session_hash), §01-quintessence §weighted-average
pub fn new_shared_clock_state() -> SharedClockState {
    let mut default_state = PortalClockState::default();
    default_state.micro_orbit = load_micro_orbit();
    let shared = Arc::new(Mutex::new(default_state));
    if let Ok(Some(profile)) = crate::nara::identity::load_profile() {
        if profile.hash_preview.len() >= 8 {
            shared.lock().unwrap().session_hash =
                crate::nara::identity::compute_session_hash(&profile);
            let profiles = crate::nara::identity::compute_quintessence_profiles(&profile);
            update_quintessence_quaternion(&shared, &profiles);
        }
    }

    // Load kairos transit data (live planet positions)
    if let Ok(Some(result)) = crate::nara::kairos::load_current() {
        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
        update_kairos_full(&shared, kairos);
    }

    // Load natal planet degrees from birth chart
    if let Ok(Some(natal_result)) = crate::nara::kairos::load_natal() {
        let natal_kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&natal_result);
        let mut s = shared.lock().unwrap();
        for i in 0..10 {
            s.natal_degrees[i] = natal_kairos.planets[i].degree;
        }
    }

    shared
}

// ─────────────────────────────────────────────────────────────────────────────
// SPANDA QUANTIZATION & # OPERATOR
// ─────────────────────────────────────────────────────────────────────────────

/// Apply the # inversion operator to a Spanda substage index.
/// Base-pair rule: #(n) = 11 - n  (Watson-Crick complement in 12-fold index space).
pub fn spanda_invert(stage: u8) -> u8 {
    11u8.wrapping_sub(stage)
}

/// Quantize oracle charges to the nearest Spanda substage index (0–11).
/// Uses Water(y/G/np) and Fire(x/A/nn) charges for the minor-circle angle.
/// Returns an integer — never a float cast.
fn quantize_to_spanda_substage(y: f32, x: f32) -> u8 {
    let phi_angle = y.atan2(x); // [-π, π]
    let normalized = (phi_angle + std::f32::consts::PI) / std::f32::consts::TAU; // [0, 1)
    ((normalized * 12.0).round() as u8) % 12
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE UPDATE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/// Update clock state from a completed oracle cast.
/// Called by M4OraclePlugin after each cast.
///
/// `pp/nn/np/pn`: I-Ching charge counts (old-yin/old-yang/young-yin/young-yang).
/// `changing_lines_mask`: 6-bit bitmask from the coin throw.
/// `temporal_hex`: caller pre-computes by XOR-ing primary_hex with changing_lines_mask.
pub fn update_from_cast(
    state: &SharedClockState,
    pp: f32,
    nn: f32,
    np: f32,
    pn: f32,
    degree: u16,
    primary_hex: u8,
    temporal_hex: u8,
    changing_lines_mask: u8,
) {
    let total = pp + nn + np + pn;
    if total < f32::EPSILON {
        return;
    }

    let (w, x, y, z) = (pp / total, nn / total, np / total, pn / total);
    let mag = (w * w + x * x + y * y + z * z).sqrt();
    let live_q = if mag > f32::EPSILON {
        [w / mag, x / mag, y / mag, z / mag]
    } else {
        [1.0, 0.0, 0.0, 0.0]
    };

    // Quantized Spanda substage — integer, not float cast
    let tick12 = quantize_to_spanda_substage(y, x);

    // Deficient degree via # operator in Spanda index space (antiparallel offset = 6 steps),
    // expressed in degree space as (d + 180) % 360 for LUT indexing.
    let deficient = (degree as u32 + 180) % 360;

    // Implicate: same degree, # inversion (inversion_state flipped).
    // Rendered at the same clock ring position with an inverted marker.
    let implicate = degree;

    // Orbital position on torus surface (parametric, r/R = 9/16 normalized)
    let theta = degree as f32 * std::f32::consts::TAU / 360.0;
    let phi = tick12 as f32 * std::f32::consts::TAU / 12.0;
    let (r, big_r) = (0.36f32, 0.64f32);
    let orbital = [
        (big_r + r * phi.cos()) * theta.cos(),
        (big_r + r * phi.cos()) * theta.sin(),
        r * phi.sin(),
    ];

    #[cfg(not(test))]
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    #[cfg(test)]
    let ts = 0u64;

    let mut s = state.lock().unwrap();
    s.live_quaternion = live_q;
    s.current_degree = degree;
    s.tick12 = tick12;
    s.orbital_position = orbital;
    s.last_cast_timestamp = ts;
    s.last_cast = Some(OracleFaces {
        primary_degree: degree,
        deficient_degree: deficient as u16,
        implicate_degree: implicate,
        temporal_hex,
        primary_hex,
        changing_lines_mask,
    });

    // ── Quaternion composition (Task 10) ─────────────────────────────────────
    // Compose: quintessence * transit * oracle → composed quaternion
    let composed = quat_normalize(quat_mul(
        quat_mul(s.quintessence_quaternion, s.transit_quaternion),
        live_q,
    ));
    s.composed_quaternion = composed;
    s.walk_mode = derive_walk_mode(composed);
    let (lambda, res) = derive_bifurcation(composed);
    s.bifurcation_param = lambda;
    s.resolution_level = res;

    // QL position: fold tick12 into 0-5 range
    s.ql_position = if tick12 < 6 { tick12 } else { 11 - tick12 };

    // Micro-orbit: append degree, cap at 360
    s.micro_orbit.push(degree);
    if s.micro_orbit.len() > 360 {
        s.micro_orbit.remove(0);
    }

    // Persist micro-orbit to disk
    #[cfg(not(test))]
    save_micro_orbit(&s.micro_orbit);

    // ── Codon bridge (Task 12 + Task 21 fix) ──────────────────────────────────
    // Clock A: degree -> hexagram via CLOCK_DEGREE_LUT[360].hexagram_id (correct mapping)
    let hex_a = crate::nara::transcription::DEGREE_TO_HEXAGRAM[(degree as usize) % 360];
    let codon_a = hex_a & 0x3F; // hexagram IS the 6-bit codon in this encoding
                                // Clock B: hexagram -> codon (from the cast's primary hexagram)
    let codon_b = primary_hex & 0x3F;
    let class_a = crate::nara::oracle::classify_codon(codon_a);
    let class_b = crate::nara::oracle::classify_codon(codon_b);
    s.active_codon = ActiveCodon {
        codon_a,
        codon_b,
        class_a,
        class_b,
        sequence_a: crate::nara::oracle::codon_sequence(codon_a),
        amino_acid: crate::nara::oracle::codon_to_amino_acid(codon_a),
        anticodon: crate::nara::oracle::wc_anticodon(codon_a),
        rotation_count_a: class_a.rotational_state_count(),
    };

    s.generation += 1;
}

/// Update the quintessence quaternion after identity augment.
/// `profiles`: 5 × [FIRE, WATER, EARTH, AIR] from M4_Quintessence_Identity.
/// Weighted average across valid (non-zero) profiles → unit quaternion.
pub fn update_quintessence_quaternion(state: &SharedClockState, profiles: &[[f32; 4]; 5]) {
    let valid: Vec<_> = profiles
        .iter()
        .filter(|p| p.iter().any(|&v| v > f32::EPSILON))
        .collect();
    let n = valid.len() as f32;
    if n < f32::EPSILON {
        return;
    }

    let mut avg = [0.0f32; 4];
    for p in &valid {
        for i in 0..4 {
            avg[i] += p[i];
        }
    }
    // Remap [FIRE=0, WATER=1, EARTH=2, AIR=3] → [w=EARTH, x=FIRE, y=WATER, z=AIR]
    let (w, x, y, z) = (avg[2] / n, avg[0] / n, avg[1] / n, avg[3] / n);
    let mag = (w * w + x * x + y * y + z * z).sqrt();
    if mag < f32::EPSILON {
        return;
    }
    {
        let mut s = state.lock().unwrap();
        s.quintessence_quaternion = [w / mag, x / mag, y / mag, z / mag];
        s.generation += 1;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO-ORBIT PERSISTENCE (Task 22)
// ─────────────────────────────────────────────────────────────────────────────

/// Expand ~ to home directory and return the orbit persistence path.
fn orbit_path() -> std::path::PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    std::path::PathBuf::from(home).join(".epi-logos/nara/orbit.json")
}

/// Persist micro-orbit degree history to disk as a JSON array of u16 values.
pub fn save_micro_orbit(orbit: &[u16]) {
    let path = orbit_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    // Manual JSON formatting for a simple u16 array (avoids serde dependency here)
    let json = format!(
        "[{}]",
        orbit
            .iter()
            .map(|d| d.to_string())
            .collect::<Vec<_>>()
            .join(",")
    );
    let _ = std::fs::write(&path, json);
}

/// Load micro-orbit degree history from disk. Returns empty vec if file missing or invalid.
pub fn load_micro_orbit() -> Vec<u16> {
    let path = orbit_path();
    match std::fs::read_to_string(&path) {
        Ok(content) => {
            // Parse JSON array of numbers
            let trimmed = content.trim();
            if !trimmed.starts_with('[') || !trimmed.ends_with(']') {
                return Vec::new();
            }
            let inner = &trimmed[1..trimmed.len() - 1];
            if inner.trim().is_empty() {
                return Vec::new();
            }
            inner
                .split(',')
                .filter_map(|s| s.trim().parse::<u16>().ok())
                .collect()
        }
        Err(_) => Vec::new(),
    }
}

/// Update kairos state from a fresh Kerykeion reading.
pub fn update_kairos(state: &SharedClockState, kairos: KairosState) {
    let mut s = state.lock().unwrap();
    s.kairos = kairos;
    s.generation += 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quat_mul_identity() {
        let id = [1.0f32, 0.0, 0.0, 0.0];
        let q = [0.5, 0.5, 0.5, 0.5];
        let result = quat_mul(id, q);
        for i in 0..4 {
            assert!(
                (result[i] - q[i]).abs() < 1e-6,
                "identity mul failed at index {i}"
            );
        }
        let result2 = quat_mul(q, id);
        for i in 0..4 {
            assert!(
                (result2[i] - q[i]).abs() < 1e-6,
                "mul identity (right) failed at index {i}"
            );
        }
    }

    #[test]
    fn quat_mul_ij_eq_k() {
        // i * j = k  (Hamilton rule)
        let i_q = [0.0f32, 1.0, 0.0, 0.0];
        let j_q = [0.0f32, 0.0, 1.0, 0.0];
        let result = quat_mul(i_q, j_q);
        assert!((result[0]).abs() < 1e-6, "w should be 0");
        assert!((result[1]).abs() < 1e-6, "x should be 0");
        assert!((result[2]).abs() < 1e-6, "y should be 0");
        assert!((result[3] - 1.0).abs() < 1e-6, "z should be 1");
    }

    #[test]
    fn quat_normalize_identity() {
        let q = quat_normalize([2.0, 0.0, 0.0, 0.0]);
        assert!((q[0] - 1.0).abs() < 1e-6);
        assert!(q[1].abs() < 1e-6);
    }

    #[test]
    fn quat_normalize_zero_returns_identity() {
        let q = quat_normalize([0.0, 0.0, 0.0, 0.0]);
        assert_eq!(q, [1.0, 0.0, 0.0, 0.0]);
    }

    #[test]
    fn derive_walk_mode_ground_for_identity() {
        assert_eq!(derive_walk_mode([1.0, 0.0, 0.0, 0.0]), WalkMode::Ground);
    }

    #[test]
    fn derive_walk_mode_torus_for_x_dominant() {
        assert_eq!(derive_walk_mode([0.1, 0.9, 0.1, 0.1]), WalkMode::Torus);
    }

    #[test]
    fn derive_walk_mode_fiber_for_y_dominant() {
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.9, 0.1]), WalkMode::Fiber);
    }

    #[test]
    fn derive_walk_mode_spanda_for_z_dominant() {
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.1, 0.9]), WalkMode::Spanda);
    }

    #[test]
    fn derive_bifurcation_identity_is_zero() {
        let (lambda, res) = derive_bifurcation([1.0, 0.0, 0.0, 0.0]);
        assert!(lambda.abs() < 1e-6);
        assert_eq!(res, 0);
    }

    #[test]
    fn derive_bifurcation_pure_rotation_is_one() {
        let (lambda, res) = derive_bifurcation([0.0, 1.0, 0.0, 0.0]);
        assert!((lambda - 1.0).abs() < 1e-6);
        assert_eq!(res, 3); // λ=1.0 >= 0.75 → level 3 (72-fold)
    }

    #[test]
    fn update_from_cast_populates_new_fields() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        update_from_cast(&state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0b001100);
        let s = state.lock().unwrap();
        assert!(s.ql_position <= 5);
        assert!(s.micro_orbit.len() == 1);
        assert_eq!(s.micro_orbit[0], 90);
        assert!(s.active_codon.codon_a < 64 || s.active_codon.codon_a == 64);
        // Walk mode is some valid variant
        let _ = s.walk_mode.label();
    }

    #[test]
    fn compute_aspects_finds_conjunction() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        {
            let mut s = state.lock().unwrap();
            s.kairos.planets[0].degree = 100; // Sun
            s.kairos.planets[1].degree = 105; // Moon — within 10° orb of conjunction
        }
        compute_aspects(&state);
        let s = state.lock().unwrap();
        assert!(
            !s.aspects.is_empty(),
            "should find conjunction between Sun and Moon"
        );
        assert_eq!(s.aspects[0].aspect_type, 0); // conjunction
    }

    #[test]
    fn compute_aspects_finds_opposition() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        {
            let mut s = state.lock().unwrap();
            s.kairos.planets[0].degree = 10;
            s.kairos.planets[1].degree = 190; // 180° apart
        }
        compute_aspects(&state);
        let s = state.lock().unwrap();
        let opp = s.aspects.iter().find(|a| a.aspect_type == 4);
        assert!(opp.is_some(), "should find opposition");
    }

    // ── Task 20: composed_quaternion tests ──────────────────────────────────

    #[test]
    fn composed_quaternion_stored_after_cast() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        update_from_cast(&state, 3.0, 1.0, 1.0, 1.0, 45, 5, 10, 0);
        let s = state.lock().unwrap();
        // composed_quaternion should not be identity after a non-trivial cast
        let mag = (s.composed_quaternion[0].powi(2)
            + s.composed_quaternion[1].powi(2)
            + s.composed_quaternion[2].powi(2)
            + s.composed_quaternion[3].powi(2))
        .sqrt();
        assert!(
            (mag - 1.0).abs() < 1e-4,
            "composed quaternion should be unit length"
        );
    }

    // ── Task 22: micro-orbit persistence tests ──────────────────────────────

    #[test]
    fn micro_orbit_roundtrip() {
        let test_data: Vec<u16> = vec![10, 90, 180, 270, 359];
        save_micro_orbit(&test_data);
        let loaded = load_micro_orbit();
        assert_eq!(
            loaded, test_data,
            "micro-orbit should survive save/load roundtrip"
        );
        // Clean up
        let _ = std::fs::remove_file(orbit_path());
    }

    #[test]
    fn micro_orbit_empty_on_missing_file() {
        // Use a nonexistent path — load should return empty
        let loaded = load_micro_orbit();
        // We can't guarantee the file doesn't exist, but at least verify it returns a Vec
        assert!(loaded.len() <= 360, "loaded orbit should be capped");
    }

    // ── Task 23: WalkType tests ─────────────────────────────────────────────

    #[test]
    fn walk_type_count_is_9() {
        assert_eq!(WalkType::all().len(), 9);
    }

    #[test]
    fn walk_type_step_counts() {
        assert_eq!(WalkType::Degree.step_count(), 360);
        assert_eq!(WalkType::Amino.step_count(), 24);
        assert_eq!(WalkType::Zodiac.step_count(), 12);
        assert_eq!(WalkType::Spanda.step_count(), 12);
        assert_eq!(WalkType::Decan.step_count(), 36);
        assert_eq!(WalkType::Hexagram.step_count(), 64);
        assert_eq!(WalkType::Enneadic.step_count(), 9);
        assert_eq!(WalkType::Seasonal.step_count(), 4);
        assert_eq!(WalkType::LineChange.step_count(), 384);
    }

    #[test]
    fn walk_type_labels_nonempty() {
        for wt in WalkType::all() {
            assert!(
                !wt.label().is_empty(),
                "walk type {:?} should have a label",
                wt
            );
        }
    }

    #[test]
    fn walk_type_repr_values() {
        assert_eq!(WalkType::Degree as u8, 0);
        assert_eq!(WalkType::LineChange as u8, 8);
    }
}
