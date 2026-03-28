use std::sync::{Arc, Mutex};

// ─────────────────────────────────────────────────────────────────────────────
// ORACLE FACES
// ─────────────────────────────────────────────────────────────────────────────

/// The four faces of a complete oracle cast.
/// pp=T(Earth/w), nn=A(Fire/x), np=G(Water/y), pn=C(Air/z)
#[derive(Clone, Debug, Default)]
pub struct OracleFaces {
    /// d — codon (what is expressed, the explicit cast position)
    pub primary_degree:        u16,

    /// Deficient aspect: structural complement (anticodon).
    /// Canonical route via # operator in Spanda index space:
    ///   deficient_substage = (primary_substage + 6) % 12
    /// Equivalent degree formula: (d + 180) % 360.
    pub deficient_degree:      u16,

    /// Implicate phase: #(d) — the # inversion operator applied to the degree coordinate.
    /// Same clock ring position, inversion_state flipped (the antipodal spinor).
    /// Canonical route: spanda_invert(primary_substage) = 11 - primary_substage.
    /// Rendered at same ring position with inverted marker.
    pub implicate_degree:      u16,

    /// Temporal hexagram: primary_hex XOR'd by the cast's changing lines.
    /// Determined LIVE by the coin throw — NOT pre-computed per degree in the LUT.
    pub temporal_hex:          u8,
    pub primary_hex:           u8,
    /// 6-bit bitmask: which lines moved in this cast (from old-yin / old-yang coin outcomes).
    pub changing_lines_mask:   u8,
}

// ─────────────────────────────────────────────────────────────────────────────
// KAIROS STATE — full live planetary interpretation from Kerykeion
// ─────────────────────────────────────────────────────────────────────────────

/// Live state for a single planet, from Kerykeion.
#[derive(Clone, Debug, Default)]
pub struct PlanetState {
    /// Current ecliptic degree (0–359). 0xFFFF = unavailable.
    pub degree:            u16,
    /// True if planet is in retrograde motion.
    pub is_retrograde:     bool,
    /// True if planet is transiting the decan it rules (resonance event: "at home").
    pub is_resonance:      bool,
    /// Hexagram at this planet's current degree (CLOCK_DEGREE_LUT[degree].hexagram_id).
    pub transiting_hex:    u8,
    /// Tarot card at this planet's current degree.
    pub transiting_tarot:  u8,
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
    /// [Sun=0, Moon=1, Venus=2, Mercury=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9]
    /// Index 0 = Sun (stable root/parent; not chakra-mapped).
    /// Index 7 = Uranus (outer/transpersonal, M2-5 layer).
    /// Earth is the geocentric observer — NOT in this array (see EarthBodyState).
    pub planets:           [PlanetState; 10],
    /// Current planetary hour (0–23, Chaldean hour cycle).
    pub current_hour:      u8,
    /// Which planet rules the current hour (Planet_Id). 0xFF = unknown.
    pub hour_planet:       u8,
    /// Which chakra resonates with the current hour's ruling planet (PLANET_CHAKRA lookup).
    /// This chakra glows at 110% in M4SpinePlugin.
    pub active_chakra:     u8,
    /// Unix timestamp of this Kerykeion reading.
    pub timestamp:         u64,
    /// False if Kerykeion unavailable (graceful stub — planet degrees remain 0xFFFF).
    pub valid:             bool,
}

impl Default for KairosState {
    fn default() -> Self {
        KairosState {
            planets:      std::array::from_fn(|_| PlanetState { degree: 0xFFFF, ..Default::default() }),
            current_hour: 0,
            hour_planet:  0xFF,
            active_chakra: 0xFF,
            timestamp:    0,
            valid:        false,
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
    pub session_hash:            [u8; 32],

    // ── Quaternion layer ──────────────────────────────────────────────────────
    /// Live quaternion from latest oracle charges (pp/nn/np/pn → w/x/y/z).
    /// Updated every oracle cast. Drives torus rotation in CosmicClockPlugin.
    pub live_quaternion:         [f32; 4],

    /// Quintessence quaternion: weighted elemental average across all five #4.0
    /// identity layers (Natal/GeneKeys/HumanDesign/Jungian/QLBirth).
    /// Mapping: EARTH→w, FIRE→x, WATER→y, AIR→z (normalized unit quaternion).
    /// Updates only on `epi nara identity` augment. Stable torus ground orientation.
    pub quintessence_quaternion: [f32; 4],

    // ── Oracle layer ──────────────────────────────────────────────────────────
    /// Current oracle cast degree (0–359).
    pub current_degree:          u16,

    /// Spanda substage index (0–11, discrete).
    /// Strand A: 0–5 (explicit/ascending). Strand B: 6–11 (implicit/Möbius return).
    /// MUST be set via quantize_to_spanda_substage(), never float-cast.
    pub tick12:                  u8,

    /// Last complete oracle reading (4 faces). None until first cast.
    pub last_cast:               Option<OracleFaces>,

    /// Unix timestamp of the last oracle cast (seconds since epoch).
    /// Used by M4SpinePlugin for oracle decay visualization (~4h fade).
    pub last_cast_timestamp:     u64,

    // ── Branch state (#4.1–#4.5) ─────────────────────────────────────────────
    /// Live chakra activation levels [0.0, 1.0] for 8 slots:
    /// [0=Earth(observer), 1=Root, 2=Sacral, 3=Solar, 4=Heart, 5=Throat, 6=ThirdEye, 7=Crown].
    /// Updated from oracle cast (elemental balance) and kairos planetary hour.
    pub chakra_levels:           [f32; 8],

    /// Which of the 6 nara branch lenses (#4.4.0–#4.4.5) is active:
    /// 0=Literal, 1=Functional, 2=Structural, 3=Archetypal, 4=Phenomenological, 5=KS.
    /// (Distinct from CLOCK_LENSES[16] — those are AI agent analytical modes, not user branch state.)
    pub active_branch_lens:      u8,

    /// Current #4.3 transformation cycle stage (0–5: SEED/POLE/TRIKA/FLOWER/FULL/META).
    pub transform_stage:         u8,

    /// Current #4.5 logos cycle stage (0–5: A-Logos through An-a-Logos).
    pub logos_stage:             u8,

    // ── Kairos layer ──────────────────────────────────────────────────────────
    /// Full live planetary state from Kerykeion.
    pub kairos:                  KairosState,

    // ── Multiplayer anchor ────────────────────────────────────────────────────
    /// 3D torus surface position derived from (current_degree, tick12).
    /// Used by SpacetimeDB for collective rendering of multiple users on the torus.
    pub orbital_position:        [f32; 3],
}

impl Default for PortalClockState {
    fn default() -> Self {
        PortalClockState {
            session_hash:            [0u8; 32],
            live_quaternion:         [1.0, 0.0, 0.0, 0.0],
            quintessence_quaternion: [1.0, 0.0, 0.0, 0.0],
            current_degree:          0,
            tick12:                  0,
            last_cast:               None,
            last_cast_timestamp:     0,
            chakra_levels:           [0.0; 8],
            active_branch_lens:      0,
            transform_stage:         0,
            logos_stage:             0,
            kairos:                  KairosState::default(),
            orbital_position:        [0.0; 3],
        }
    }
}

pub type SharedClockState = Arc<Mutex<PortalClockState>>;

pub fn new_shared_clock_state() -> SharedClockState {
    Arc::new(Mutex::new(PortalClockState::default()))
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
    let phi_angle  = y.atan2(x);                               // [-π, π]
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
    state:               &SharedClockState,
    pp: f32, nn: f32, np: f32, pn: f32,
    degree:              u16,
    primary_hex:         u8,
    temporal_hex:        u8,
    changing_lines_mask: u8,
) {
    let total = pp + nn + np + pn;
    if total < f32::EPSILON { return; }

    let (w, x, y, z) = (pp/total, nn/total, np/total, pn/total);
    let mag = (w*w + x*x + y*y + z*z).sqrt();
    let live_q = if mag > f32::EPSILON { [w/mag, x/mag, y/mag, z/mag] } else { [1.0, 0.0, 0.0, 0.0] };

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
    let phi   = tick12 as f32 * std::f32::consts::TAU / 12.0;
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
    s.live_quaternion     = live_q;
    s.current_degree      = degree;
    s.tick12              = tick12;
    s.orbital_position    = orbital;
    s.last_cast_timestamp = ts;
    s.last_cast = Some(OracleFaces {
        primary_degree:     degree,
        deficient_degree:   deficient as u16,
        implicate_degree:   implicate,
        temporal_hex,
        primary_hex,
        changing_lines_mask,
    });
}

/// Update the quintessence quaternion after identity augment.
/// `profiles`: 5 × [FIRE, WATER, EARTH, AIR] from M4_Quintessence_Identity.
/// Weighted average across valid (non-zero) profiles → unit quaternion.
pub fn update_quintessence_quaternion(state: &SharedClockState, profiles: &[[f32; 4]; 5]) {
    let valid: Vec<_> = profiles.iter()
        .filter(|p| p.iter().any(|&v| v > f32::EPSILON))
        .collect();
    let n = valid.len() as f32;
    if n < f32::EPSILON { return; }

    let mut avg = [0.0f32; 4];
    for p in &valid { for i in 0..4 { avg[i] += p[i]; } }
    // Remap [FIRE=0, WATER=1, EARTH=2, AIR=3] → [w=EARTH, x=FIRE, y=WATER, z=AIR]
    let (w, x, y, z) = (avg[2]/n, avg[0]/n, avg[1]/n, avg[3]/n);
    let mag = (w*w + x*x + y*y + z*z).sqrt();
    if mag < f32::EPSILON { return; }
    state.lock().unwrap().quintessence_quaternion = [w/mag, x/mag, y/mag, z/mag];
}

/// Update kairos state from a fresh Kerykeion reading.
pub fn update_kairos(state: &SharedClockState, kairos: KairosState) {
    state.lock().unwrap().kairos = kairos;
}
