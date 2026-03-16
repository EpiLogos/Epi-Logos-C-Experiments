# CosmicClockPlugin — TUI Specification

**Status:** Canonical Spec (2026-03-15)
**Coordinate:** #4.4.4.4 — Personal Pratibimba meets #1 Structural (the clock made personal, the personal made structural)
**Depends on:** 07-unified-architecture-golden-thread.md, 03-spanda-double-helix-12fold.md,
              epi-cli/src/portal/ (actual hypertile plugin API)
**Outputs:**
  - `epi-cli/src/portal/plugins/clock.rs` — CosmicClockPlugin, MiniClockPlugin
  - `epi-cli/src/portal/plugins/m4_spine.rs` — M4SpinePlugin (chakral-elemental spine)
  - `epi-cli/src/portal/clock_state.rs` — PortalClockState shared Arc<Mutex<>>
  - Cargo.toml: add `nalgebra = "0.33"`

---

## I. Role and Philosophy

The CosmicClockPlugin is **Tab 2 in its entirety**. It is not one panel among several — when the
user switches to the structural tab, they are inside the clock. The clock IS the structural view
of the system operating: 385 nodes (360 degrees + 24 backbone + 1 Earth center), 9 planetary
positions orbiting from Kerykeion, the torus rotating continuously from the user's live oracle
quaternion, the φ-stage showing which SPANDA sub-stage they currently occupy.

The MiniClockPlugin is a compact instantiable pane for Tab 1 (the personal/flow tab). It is a
small orientation widget — current degree, torus_stage, active planet transits — that can be
opened alongside flow.md, oracle, identity, or spine as the user configures their workspace.

The M4SpinePlugin is the chakral-elemental spine — 8 vertical bars driven by the live quaternion's
elemental balance (T/A/G/C = Earth/Fire/Water/Air). It compares the live spine to the natal spine
as a subtle background reference.

**The shared clock state is what makes the portal a living system.** Every plugin that surfaces
clock data reads from `Arc<Mutex<PortalClockState>>`. The oracle plugin writes to it on each cast.
The clock state IS the system operating.

---

## II. Dependencies

### Add to `epi-cli/Cargo.toml`

```toml
# Quaternion / matrix math for torus projection
nalgebra = "0.33"
```

No other additions needed. All rendering uses ratatui's `Buffer` (direct cell manipulation) plus
braille Unicode (U+2800–U+28FF). No pixel-graphics crate, no 3D renderer, no plotting library.

**Rationale:** The torus projection math is ~60 lines of custom code tuned to this coordinate
system (R/r = 16/9, φ-stages = SPANDA sub-stages, degree positions = I-Ching/codon nodes).
A generic 3D crate adds overhead and can't be tuned to QL geometry. `nalgebra` provides the
quaternion-to-rotation-matrix, composition, and normalization primitives cleanly. Everything
else — projection, rasterization to braille dots, degree ring rendering — is custom and correct.

---

## III. Shared Clock State — `PortalClockState`

### `epi-cli/src/portal/clock_state.rs`

```rust
use std::sync::{Arc, Mutex};

// ─────────────────────────────────────────────────────────────────────────────
// ORACLE FACES
// ─────────────────────────────────────────────────────────────────────────────

/// The four oracle charges mapping to quaternion components and elements.
/// pp=T(Earth/w), nn=A(Fire/x), np=G(Water/y), pn=C(Air/z)
#[derive(Clone, Debug, Default)]
pub struct OracleFaces {
    /// d — codon (what is expressed, the explicit cast position)
    pub primary_degree:   u16,

    /// Deficient aspect: (d+180)%360 — structural complement (anticodon).
    /// Canonical route via # operator in Spanda index space:
    ///   deficient_substage = (primary_substage + 6) % 12
    ///   deficient_degree   = deficient_substage * 30
    /// Degree-space shortcut (equivalent): (d + 180) % 360.
    pub deficient_degree: u16,

    /// Implicate phase: #(d) — the # inversion operator applied to the degree coordinate.
    /// NOT d+360 arithmetic. Same degree, inversion_state flipped (the antipodal spinor).
    /// Canonical route: spanda_invert(primary_substage) = 11 - primary_substage
    /// In the renderer: same ring position rendered with dim inverted marker.
    pub implicate_degree: u16,

    /// Temporal hexagram: result of applying the cast's changing_lines to primary_hex.
    /// Determined by the live oracle throw (not pre-computed from degree in the LUT).
    /// Formula: temporal_hex = primary_hex XOR'd by bit-flipping lines in changing_lines_mask.
    pub temporal_hex:          u8,
    pub primary_hex:           u8,
    /// 6-bit bitmask: which lines moved in this cast (from coin throw / charge balance).
    pub changing_lines_mask:   u8,
}

// ─────────────────────────────────────────────────────────────────────────────
// KAIROS STATE — Full live planetary interpretation
// ─────────────────────────────────────────────────────────────────────────────

/// Live state for one planet, populated from Kerykeion data.
#[derive(Clone, Debug, Default)]
pub struct PlanetState {
    /// Current ecliptic degree (0–359). 0xFFFF = unavailable.
    pub degree:           u16,
    /// True if planet is in retrograde motion (from Kerykeion motion data).
    pub is_retrograde:    bool,
    /// True if planet is transiting the decan it rules (resonance event: "at home").
    pub is_resonance:     bool,
    /// Hexagram at this planet's current degree (from CLOCK_DEGREE_LUT[degree].hexagram_id).
    pub transiting_hex:   u8,
    /// Tarot card at this planet's current degree.
    pub transiting_tarot: u8,
    /// Chakra at this planet's current degree (from decan_chakra).
    pub transiting_chakra: u8,
}

/// Full kairos (astrological time) state from Kerykeion.
/// Replaces the bare planet_degrees: [u16; 9] array.
/// Written by: KairosLoader on sync, SpacetimeDB subscriber for live updates.
/// Read by:    CosmicClockPlugin (planet ring), M4SpinePlugin (chakra resonance).
#[derive(Clone, Debug)]
pub struct KairosState {
    /// One entry per tracked planet. CANONICAL ORDER (2026-03-16):
    /// [Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9]
    /// Earth = center/observer — NOT in this array (no clock degree).
    /// Sun at index 0 = stable solar root/parent (encapsulates all others).
    /// Uranus/Neptune/Pluto = M2-5 transpersonal (is_transpersonal: true).
    /// 9:8 Epogdoon = 9 non-Sun planets (Moon–Pluto) : 8 chakras.
    /// NOTE: Current m2.h Planet_Id enum uses legacy ordering; reorder pending Parashakti dataset reconciliation.
    pub planets:               [PlanetState; 10],
    /// Current planetary hour (0–23).
    pub current_hour:          u8,
    /// Which planet rules this hour (Planet_Id).
    pub hour_planet:           u8,
    /// Which chakra resonates with the current hour's ruling planet.
    /// PLANET_CHAKRA[hour_planet] — used by M4SpinePlugin for 110% glow.
    pub active_chakra:         u8,
    /// Unix timestamp of this Kerykeion reading.
    pub timestamp:             u64,
    /// False if Kerykeion is unavailable (graceful stub mode).
    pub valid:                 bool,
}

impl Default for KairosState {
    fn default() -> Self {
        KairosState {
            // [PlanetState; 10] — Sun(0) through Pluto(9), Earth excluded
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
// AMINO ACID BODY MAP — backbone chain connecting genetic code to medicine
// ─────────────────────────────────────────────────────────────────────────────

/// Maps each of the 24 backbone amino acids to body zones, chakra, and herbs.
/// This is the structural bridge: clock backbone node → M4 medicine prescription.
/// The chain: codon → amino_acid → backbone_degree → ruling_chakra → body_zones → herbs
#[derive(Clone, Debug)]
pub struct AminoAcidBodyMap {
    pub amino_acid_id:    u8,          // 0-23 (backbone index)
    pub single_letter:    char,        // 'A', 'C', 'D', ...
    pub backbone_degree:  u16,         // 0, 15, 30, ..., 345 (clock position)
    pub ruling_chakra:    u8,          // 0-7 (Chakra_Id — which chakra this AA resonates with)
    pub element:          u8,          // A/T/C/G nucleotide family (0=A/Fire, 1=T/Earth, 2=C/Air, 3=G/Water)
    pub body_zones:       [&'static str; 4],  // anatomical zones (from DECAN_BODY_PARTS dataset)
    pub herbs:            [&'static str; 3],  // herbalism associations (from DECAN_HERBS dataset)
}

// Full 24-entry LUT populated from the mahamaya dataset during build.
// Canonical source: build_clock_degree_lut.py queries M3 backbone nodes
// and M4 medicine CHAKRA_BODY_ZONES[8] for cross-referencing.
// pub static AMINO_ACID_BODY_ZONES: [AminoAcidBodyMap; 24] = [...];  // generated

// ─────────────────────────────────────────────────────────────────────────────
// PORTAL CLOCK STATE — #4.4.4.4 as namespace switchboard
// ─────────────────────────────────────────────────────────────────────────────

/// The live clock state shared across all portal plugins.
/// This IS the #4.4.4.4 namespace: all M4 branch state is routed through here.
/// Written by: M4OraclePlugin (on cast), KairosLoader (on sync), identity loader (on augment)
/// Read by:    CosmicClockPlugin, MiniClockPlugin, M4SpinePlugin, M4IdentityPlugin, M4MedicinePlugin
#[derive(Clone, Debug)]
pub struct PortalClockState {
    // ── Identity anchor ───────────────────────────────────────────────────────
    /// Session identity hash = BLAKE3(quintessence_hash[32] || session_start_u64[8]).
    /// WRITER: Khora (PI extension) — Khora owns session lifecycle.
    ///         Set at portal startup from Khora session-open event.
    ///         Nara reads it; Nara does NOT derive it independently.
    /// Used for SpacetimeDB UserPresence routing and multi-user orbital placement.
    pub session_hash:            [u8; 32],

    // ── Quaternion layer ──────────────────────────────────────────────────────
    /// Live quaternion from latest oracle charges (pp/nn/np/pn → w/x/y/z).
    /// Updated every oracle cast. Drives torus rotation.
    pub live_quaternion:         [f32; 4],

    /// Quintessence quaternion: weighted elemental average across all five #4.0
    /// identity layers (Natal/GeneKeys/HumanDesign/Jungian/QLBirth).
    /// Mapping: EARTH→w, FIRE→x, WATER→y, AIR→z (normalized unit quaternion).
    /// Updates only on identity augment. Stable reference for torus ground orientation.
    pub quintessence_quaternion: [f32; 4],

    // ── Oracle layer ──────────────────────────────────────────────────────────
    /// Current oracle cast degree (0–359).
    pub current_degree:          u16,

    /// Spanda substage index (0–11, discrete — see 03-spanda-double-helix-12fold.md).
    /// Strand A: 0–5 (explicit/ascending). Strand B: 6–11 (implicit/Möbius return).
    /// MUST be quantized via `quantize_to_spanda_substage()`, NOT float-cast.
    pub torus_stage:             u8,

    /// Last complete oracle reading (4 faces). None until first cast.
    pub last_cast:               Option<OracleFaces>,

    /// Unix timestamp of last oracle cast (for decay visualization in M4SpinePlugin).
    /// Chakra highlights fade over ~4h. 0 = no cast yet.
    pub last_cast_timestamp:     u64,

    // ── Branch state layer (#4.1–#4.5) ───────────────────────────────────────
    /// Live chakra activation levels [0.0, 1.0] for 8 chakras (Earth/Root/Sacral/Solar/
    /// Heart/Throat/ThirdEye/Crown). Updated by oracle cast and kairos planetary hour.
    pub chakra_levels:           [f32; 8],

    /// Which of the 6 lenses (#4.4.0–#4.4.5) is currently active for the user's lens view.
    /// 0=Literal 1=Functional 2=Structural 3=Archetypal 4=Phenomenological 5=KS.
    /// Does NOT refer to the 16 CLOCK_LENSES (those are analytical modes applied by agents).
    pub active_branch_lens:      u8,

    /// Current stage of the #4.3 transformation cycle (0–5: SEED/POLE/TRIKA/FLOWER/FULL/META).
    pub transform_stage:         u8,

    /// Current stage of the #4.5 logos cycle (0–5: corresponds to 6 A-Logos→An-a-Logos stages).
    pub logos_stage:             u8,

    // ── Kairos layer ──────────────────────────────────────────────────────────
    /// Full live planetary state from Kerykeion. Replaces bare planet_degrees[9].
    pub kairos:                  KairosState,

    // ── Multiplayer anchor ────────────────────────────────────────────────────
    /// 3D position on torus surface for SpacetimeDB collective rendering.
    /// Derived from (current_degree, torus_stage) → torus parametric coords.
    pub orbital_position:        [f32; 3],
}

impl Default for PortalClockState {
    fn default() -> Self {
        PortalClockState {
            session_hash:            [0u8; 32],
            live_quaternion:         [1.0, 0.0, 0.0, 0.0],
            quintessence_quaternion: [1.0, 0.0, 0.0, 0.0],
            current_degree:          0,
            torus_stage:             0,
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

/// Apply the # inversion operator to a Spanda substage index.
/// Base-pair rule: #(n) = 11 - n. Strand A index n ↔ Strand B index 11-n.
pub fn spanda_invert(stage: u8) -> u8 {
    11u8.wrapping_sub(stage)
}

/// Quantize oracle charges to the nearest Spanda substage (0–11, integer).
/// See 03-spanda-double-helix-12fold.md for full rationale.
fn quantize_to_spanda_substage(y: f32, x: f32) -> u8 {
    // phi_angle: minor-circle angle from Water(G/y) and Fire(A/x) charges
    let phi_angle = y.atan2(x);
    let normalized = (phi_angle + std::f32::consts::PI) / std::f32::consts::TAU;
    ((normalized * 12.0).round() as u8) % 12
}

/// Update clock state from a completed oracle cast.
/// Called by M4OraclePlugin after each cast.
/// `changing_lines_mask`: 6-bit bitmask from the coin throw (old yin / old yang outcomes).
/// `temporal_hex`: result of applying changing_lines to primary_hex (caller computes).
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
    let w = pp / total;
    let x = nn / total;
    let y = np / total;
    let z = pn / total;

    let mag = (w*w + x*x + y*y + z*z).sqrt();
    let live_q = if mag > f32::EPSILON { [w/mag, x/mag, y/mag, z/mag] } else { [1.0,0.0,0.0,0.0] };

    // Quantize to discrete Spanda substage (0–11). No float cast.
    let torus_stage = quantize_to_spanda_substage(y, x);

    // Deficient degree via # operator: antiparallel offset of 6 in Spanda index space,
    // equivalent to (d + 180) % 360 in degree space.
    let deficient_substage = (torus_stage + 6) % 12;
    let deficient = (degree as u32 + 180) % 360;
    let _ = deficient_substage; // structural derivation preserved; degree formula used for LUT indexing

    // Implicate degree: # inversion — same degree, inversion_state flipped (spinor antipodal).
    // Rendered at same clock ring position with inverted marker; NOT degree+360 arithmetic.
    let implicate = degree;  // same position; inversion_state implicit in rendering

    // Orbital position on torus (parametric)
    let theta = degree as f32 * std::f32::consts::TAU / 360.0;
    let phi   = torus_stage as f32 * std::f32::consts::TAU / 12.0;
    let (r, big_r) = (0.36, 0.64); // r/R = 9/16, normalized
    let orbital = [
        (big_r + r * phi.cos()) * theta.cos(),
        (big_r + r * phi.cos()) * theta.sin(),
        r * phi.sin(),
    ];

    // Unix timestamp (seconds since epoch; 0 is fine for tests without std::time)
    #[cfg(not(test))]
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    #[cfg(test)]
    let ts = 0u64;

    let mut s = state.lock().unwrap();
    s.live_quaternion   = live_q;
    s.current_degree    = degree;
    s.torus_stage       = torus_stage;
    s.orbital_position  = orbital;
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

/// Update the quintessence quaternion (called after identity augment).
/// See 01-quintessence-hash-architecture.md for derivation.
/// profiles: 5 × [FIRE, WATER, EARTH, AIR] from M4_Quintessence_Identity.
pub fn update_quintessence_quaternion(state: &SharedClockState, profiles: &[[f32; 4]; 5]) {
    let valid: Vec<_> = profiles.iter().filter(|p| p.iter().any(|&v| v > f32::EPSILON)).collect();
    let n = valid.len() as f32;
    if n < f32::EPSILON { return; }
    let mut avg = [0.0f32; 4];
    for p in &valid { for i in 0..4 { avg[i] += p[i]; } }
    // Remap [FIRE, WATER, EARTH, AIR] → [w=EARTH, x=FIRE, y=WATER, z=AIR]
    let (w, x, y, z) = (avg[2]/n, avg[0]/n, avg[1]/n, avg[3]/n);
    let mag = (w*w + x*x + y*y + z*z).sqrt();
    if mag < f32::EPSILON { return; }
    state.lock().unwrap().quintessence_quaternion = [w/mag, x/mag, y/mag, z/mag];
}

/// Update kairos state from a fresh Kerykeion reading.
pub fn update_kairos(state: &SharedClockState, kairos: KairosState) {
    let mut s = state.lock().unwrap();
    s.kairos = kairos;
}
```

### Wiring in `portal/mod.rs`

At the top of `launch()`, before building the workspace:

```rust
use crate::portal::clock_state::{new_shared_clock_state, SharedClockState};

pub fn launch(epi: &EpiLib, reset: bool, tab: Option<&str>, layout: Option<&str>)
    -> color_eyre::Result<()>
{
    let clock = new_shared_clock_state();

    // Load quintessence quaternion from identity if available
    if let Ok(identity_json) = epi.nara_identity_load() {
        if let Some(profiles) = extract_elemental_profiles(&identity_json) {
            update_quintessence_quaternion(&clock, &profiles);
        }
    }

    // Load kairos from cached Kerykeion reading if available
    if let Ok(kairos_json) = epi.nara_kairos_load() {
        if let Some(kairos) = parse_kerykeion_to_kairos_state(&kairos_json) {
            update_kairos(&clock, kairos);
        }
        let _ = kairos_json; // consumed above
    }

    let tab0 = build_tab0_runtime(&epi, clock.clone());
    let tab1 = build_tab1_runtime(&epi, clock.clone());
    // ...
}
```

---

## IV. Rendering Architecture — Braille Canvas Torus

### The Braille Grid

Unicode braille (U+2800–U+28FF): each character encodes a 2×4 dot pattern:
```
Dot layout per char:   bit 0 (⠁) = col 0, row 0
  col: 0  1             bit 1 (⠂) = col 0, row 1
  row 0: ● ●            bit 2 (⠄) = col 0, row 2
  row 1: ● ●            bit 3 (⠈) = col 1, row 0
  row 2: ● ●            bit 4 (⠐) = col 1, row 1
  row 3: ● ●            bit 5 (⠠) = col 1, row 2
                         bit 6 (⡀) = col 0, row 3
                         bit 7 (⢀) = col 1, row 3
```

For a torus canvas of `W` columns × `H` rows (ratatui buffer cells), the dot grid is `2W × 4H`.

```rust
pub struct BrailleCanvas {
    width:  usize,   // buffer columns
    height: usize,   // buffer rows
    dots:   Vec<Vec<u8>>,   // [row][col] bitmask (2W × 4H dots)
    colors: Vec<Vec<Color>>, // per-cell foreground color
}

impl BrailleCanvas {
    pub fn new(width: usize, height: usize) -> Self {
        BrailleCanvas {
            width, height,
            dots:   vec![vec![0u8; width * 2]; height * 4],
            colors: vec![vec![Color::White; width]; height],
        }
    }

    /// Set a dot at pixel coords (px, py), with a given color.
    pub fn dot(&mut self, px: i32, py: i32, color: Color) {
        if px < 0 || py < 0
            || px >= (self.width * 2) as i32
            || py >= (self.height * 4) as i32 { return; }
        let (px, py) = (px as usize, py as usize);
        let char_col  = px / 2;
        let char_row  = py / 4;
        let bit_col   = px % 2;
        let bit_row   = py % 4;

        // Braille bit index: rows 0-2 in col 0 = bits 0-2; row 3 = bit 6
        //                    rows 0-2 in col 1 = bits 3-5; row 3 = bit 7
        let bit = if bit_row < 3 {
            bit_col * 3 + bit_row
        } else {
            6 + bit_col
        };

        self.dots[char_row][char_col] |= 1 << bit;
        self.colors[char_row][char_col] = color;
    }

    /// Flush to ratatui Buffer at offset (ox, oy).
    pub fn render_to(&self, buf: &mut Buffer, ox: u16, oy: u16) {
        for row in 0..self.height {
            for col in 0..self.width {
                let bits = self.dots[row][col];
                if bits == 0 { continue; }
                let ch = char::from_u32(0x2800 + bits as u32).unwrap_or('⠀');
                let cell = buf.get_mut(ox + col as u16, oy + row as u16);
                cell.set_char(ch);
                cell.set_fg(self.colors[row][col]);
            }
        }
    }
}
```

### Torus Math — `render_torus()`

```rust
use nalgebra::{Unit, UnitQuaternion, Vector3};

/// Draw the torus into a BrailleCanvas.
/// R = major radius (distance from torus center to tube center)
/// r = minor radius (tube radius)  R/r = 16/9 (Epogdoon ratio)
/// q = rotation quaternion from live_quaternion [w, x, y, z]
/// phi_stage = 0-5; used to highlight the current φ-stage ring
pub fn render_torus(
    canvas:     &mut BrailleCanvas,
    q:          [f32; 4],
    phi_stage:  u8,
    width_pts:  usize,   // canvas dot width
    height_pts: usize,   // canvas dot height
) {
    let cx = (width_pts  / 2) as i32;
    let cy = (height_pts / 2) as i32;

    // Scale factors: fit torus in canvas
    let scale = (width_pts.min(height_pts) as f32 / 2.0) * 0.85;
    let R = scale * (16.0 / 25.0);   // major radius
    let r = scale * (9.0  / 25.0);   // minor radius  →  R/r = 16/9 ✓

    let rotation = UnitQuaternion::new_normalize(
        nalgebra::Quaternion::new(q[0], q[1], q[2], q[3])
    );

    let depth_buf_size = width_pts * height_pts;
    let mut z_buf: Vec<f32> = vec![-999.0; depth_buf_size];

    // Sample density: more samples = smoother torus
    let theta_steps = 120;  // major circle (degree ring)
    let phi_steps   = 60;   // minor circle (torus tube / φ-stages)

    for ti in 0..theta_steps {
        let theta = ti as f32 * 2.0 * std::f32::consts::PI / theta_steps as f32;

        for pi in 0..phi_steps {
            let phi = pi as f32 * 2.0 * std::f32::consts::PI / phi_steps as f32;

            // Parametric torus point
            let x = (R + r * phi.cos()) * theta.cos();
            let y = (R + r * phi.cos()) * theta.sin();
            let z = r * phi.sin();

            // Rotate by live quaternion
            let pt    = Vector3::new(x, y, z);
            let rot_pt = rotation * pt;
            let (rx, ry, rz) = (rot_pt.x, rot_pt.y, rot_pt.z);

            // Perspective projection
            let dist  = scale * 3.5;
            let proj  = dist / (dist - rz);
            let sx    = (cx as f32 + rx * proj) as i32;
            let sy    = (cy as f32 - ry * proj * 0.5) as i32;  // 0.5 = terminal char aspect ratio

            let buf_idx = sy.max(0) as usize * width_pts
                        + sx.max(0) as usize;
            if buf_idx < depth_buf_size && rz > z_buf[buf_idx] {
                z_buf[buf_idx] = rz;

                // Color: which φ-stage ring is this tube segment?
                let stage_idx = (pi * 6 / phi_steps) as u8;
                let color = if stage_idx == phi_stage {
                    Color::Yellow      // current φ-stage highlighted
                } else {
                    match stage_idx {
                        0 => Color::DarkGray,    // SEED — void/ground
                        1 => Color::White,        // POLE — first cut
                        2 => Color::Cyan,         // TRIKA — torus locks
                        3 => Color::Green,        // FLOWER/lemniscate — oracle
                        4 => Color::Magenta,      // FULL — double torus
                        5 => Color::Red,          // META — Möbius close
                        _ => Color::White,
                    }
                };

                // Depth shading: nearer = brighter (just affects whether we draw)
                let illumination = (rz / scale + 1.0) * 0.5; // 0.0–1.0
                if illumination > 0.15 {
                    canvas.dot(sx, sy, color);
                }
            }
        }
    }
}
```

### Degree Ring — `render_degree_ring()`

```rust
/// Render the 360° degree ring around the torus.
/// planet_degrees: [u16; 9] — degrees 0-359 for each of the 9 canonical planets
/// current_degree: the current oracle cast degree
/// natal_degrees:  the natal planetary configuration (drawn as dim ghosts)
pub fn render_degree_ring(
    canvas:         &mut BrailleCanvas,
    planet_degrees: &[u16; 9],
    natal_degrees:  &[u16; 9],
    current_degree: u16,
    width_pts:      usize,
    height_pts:     usize,
) {
    let cx    = (width_pts  / 2) as i32;
    let cy    = (height_pts / 2) as i32;
    let scale = (width_pts.min(height_pts) as f32 / 2.0) * 0.85;
    let ring_r = scale * 1.05;  // slightly outside the torus major radius

    // Planet Unicode symbols (order matches planet_id_to_clock_idx)
    const PLANET_SYMBOLS: [&str; 9] = ["☉","♀","☿","☽","♄","♃","♂","♆","♇"];

    // Draw ring base: a circle of dim dots
    for deg in 0..360usize {
        let angle = (deg as f32 - 90.0) * std::f32::consts::PI / 180.0;
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;

        // Backbone nodes (every 15°) slightly brighter
        let color = if deg % 15 == 0 { Color::Gray } else { Color::DarkGray };
        canvas.dot(px, py, color);
    }

    // Current degree: bright yellow marker
    {
        let deg = current_degree as usize;
        let angle = (deg as f32 - 90.0) * std::f32::consts::PI / 180.0;
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        for dx in -1..=1i32 {
            for dy in -1..=1i32 {
                canvas.dot(px + dx, py + dy, Color::Yellow);
            }
        }
    }

    // Anticodon: dim green at degree+180
    {
        let deg = ((current_degree as usize) + 180) % 360;
        let angle = (deg as f32 - 90.0) * std::f32::consts::PI / 180.0;
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        canvas.dot(px, py, Color::Green);
    }

    // Natal ghosts: dim gray dots at natal planetary positions
    for &ndeg in natal_degrees.iter().filter(|&&d| d != 0xFFFF) {
        let angle = (ndeg as f32 - 90.0) * std::f32::consts::PI / 180.0;
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        canvas.dot(px, py, Color::DarkGray);
    }

    // Planet symbols on the ring: write text cells directly to buf
    // (done in CosmicClockPlugin::render() after canvas.render_to(), using buf writes)
    // Planet symbols require ratatui Cell writes (Unicode multi-char), not braille dots.
}

/// Render planet symbols as text cells onto the buffer (called after braille canvas flush).
/// symbol_offset: extra radius so symbols don't overlap the ring dots
pub fn render_planet_symbols(
    buf:            &mut Buffer,
    planet_degrees: &[u16; 9],
    area:           Rect,
    offset_px:      f32,   // additional radial offset for symbol placement
) {
    const PLANET_SYMBOLS: [&str; 9] = ["☉","♀","☿","☽","♄","♃","♂","♆","♇"];
    const PLANET_COLORS:  [Color; 9] = [
        Color::Yellow,    // ☉ Sun
        Color::Green,     // ♀ Venus
        Color::Cyan,      // ☿ Mercury
        Color::White,     // ☽ Moon
        Color::DarkGray,  // ♄ Saturn
        Color::Blue,      // ♃ Jupiter
        Color::Red,       // ♂ Mars
        Color::Magenta,   // ♆ Neptune
        Color::Red,       // ♇ Pluto (dark)
    ];

    let cx    = area.x + area.width  / 2;
    let cy    = area.y + area.height / 2;
    let scale = (area.width.min(area.height) as f32 / 2.0) * 0.85;
    let ring_r = scale * 1.05 + offset_px;

    for (i, &deg) in planet_degrees.iter().enumerate() {
        if deg == 0xFFFF { continue; }
        let angle = (deg as f32 - 90.0) * std::f32::consts::PI / 180.0;
        let col = (cx as f32 + ring_r * angle.cos() / 2.0) as u16;  // /2 = char width
        let row = (cy as f32 + ring_r * angle.sin() * 0.5 / 4.0) as u16;  // /4 = char height
        if col >= area.x && col < area.x + area.width
            && row >= area.y && row < area.y + area.height
        {
            buf.get_mut(col, row)
               .set_symbol(PLANET_SYMBOLS[i])
               .set_fg(PLANET_COLORS[i])
               .set_modifier(Modifier::BOLD);
        }
    }
}
```

---

## V. CosmicClockPlugin

### `epi-cli/src/portal/plugins/clock.rs`

```rust
pub struct CosmicClockPlugin {
    clock: SharedClockState,
    epi:   Arc<EpiLib>,
    // Local render cache (avoid recomputing if state hasn't changed)
    last_q:   [f32; 4],
    tick:     u64,   // increments each render — used for animation pacing
}

impl HypertilePlugin for CosmicClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        // 1. Outer border
        let title = if is_focused {
            " ◎ Cosmic Clock [focused] "
        } else {
            " ◎ Cosmic Clock "
        };
        let block = Block::default()
            .title(title)
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        let state = self.clock.lock().unwrap().clone();  // snapshot

        // 2. Layout: main canvas (torus + ring) + side strip (φ-stages + status)
        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([
                Constraint::Min(40),       // torus + ring canvas
                Constraint::Length(24),    // φ-stage indicator + status + legend
            ])
            .split(inner);

        // 3. Render torus + degree ring into braille canvas
        let canvas_w = chunks[0].width  as usize;
        let canvas_h = chunks[0].height as usize;
        let mut canvas = BrailleCanvas::new(canvas_w, canvas_h);

        render_torus(&mut canvas, state.live_quaternion, state.torus_stage,
                     canvas_w * 2, canvas_h * 4);
        render_degree_ring(&mut canvas, &state.planet_degrees,
                           &state.natal_quaternion_to_degrees(),  // helper
                           state.current_degree,
                           canvas_w * 2, canvas_h * 4);

        canvas.render_to(buf, chunks[0].x, chunks[0].y);

        // 4. Planet symbols (text cells, written after braille flush)
        render_planet_symbols(buf, &state.planet_degrees, chunks[0], 2.0);

        // 5. Side panel: φ-stages, current degree info, kairos status
        Self::render_side_panel(buf, chunks[1], &state);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                // 'k' = force kairos reload
                KeyCode::Char('k') => {
                    if let Ok(kairos) = self.epi.nara_kairos_load() {
                        let mut s = self.clock.lock().unwrap();
                        // update planet_degrees from kairos JSON
                        update_planet_degrees_from_json(&mut s, &kairos);
                        s.kairos_loaded = true;
                    }
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            }
        } else {
            EventOutcome::Ignored
        }
    }
}

impl CosmicClockPlugin {
    fn render_side_panel(buf: &mut Buffer, area: Rect, state: &PortalClockState) {
        let block = Block::default()
            .title(" φ-Stage ")
            .borders(Borders::LEFT)
            .border_style(Style::default().fg(Color::DarkGray));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        // φ-stage names and colors
        const STAGE_NAMES: [&str; 6] = [
            "SEED   (0°)",     // #4.4.4.0
            "POLE   (60°)",    // #4.4.4.1
            "TRIKA  (120°)",   // #4.4.4.2
            "FLOWER (180°)",   // #4.4.4.3 — oracle IS here
            "FULL   (240°)",   // #4.4.4.4
            "META   (300°)",   // #4.4.4.5
        ];
        const STAGE_COLORS: [Color; 6] = [
            Color::DarkGray, Color::White, Color::Cyan,
            Color::Green, Color::Magenta, Color::Red,
        ];

        let mut lines: Vec<Line> = Vec::new();

        // φ-stages
        for (i, (name, color)) in STAGE_NAMES.iter()
            .zip(STAGE_COLORS.iter())
            .enumerate()
        {
            let marker = if i as u8 == state.torus_stage { "▶ " } else { "  " };
            let style = if i as u8 == state.torus_stage {
                Style::default().fg(*color).add_modifier(Modifier::BOLD)
            } else {
                Style::default().fg(Color::DarkGray)
            };
            lines.push(Line::from(vec![
                Span::styled(format!("{}{}", marker, name), style),
            ]));
        }

        lines.push(Line::from(""));

        // Current degree info
        lines.push(Line::from(vec![
            Span::styled("degree: ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!("{}°", state.current_degree),
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
            ),
        ]));

        if let Some(cast) = &state.last_cast {
            lines.push(Line::from(vec![
                Span::styled("anti:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("{}°", cast.deficient_degree),
                    Style::default().fg(Color::Green),
                ),
            ]));
            lines.push(Line::from(vec![
                Span::styled("impl:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("{}°", cast.implicate_degree),
                    Style::default().fg(Color::Magenta),
                ),
            ]));
            lines.push(Line::from(vec![
                Span::styled("hex:    ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("#{} → #{}", cast.primary_hex, cast.temporal_hex),
                    Style::default().fg(Color::White),
                ),
            ]));
        }

        lines.push(Line::from(""));

        // Kairos status
        let kairos_status = if state.kairos_loaded {
            Span::styled("kairos ✓", Style::default().fg(Color::Green))
        } else {
            Span::styled("kairos – (press k)", Style::default().fg(Color::DarkGray))
        };
        lines.push(Line::from(vec![kairos_status]));

        lines.push(Line::from(""));

        // Keybindings
        lines.push(Line::from(vec![
            Span::styled("k  reload kairos", Style::default().fg(Color::DarkGray)),
        ]));

        let para = Paragraph::new(lines)
            .wrap(ratatui::widgets::Wrap { trim: false });
        Widget::render(para, inner, buf);
    }
}
```

---

## VI. MiniClockPlugin

The compact orientation widget for Tab 1 (personal workspace). Opens as a small pane alongside
flow.md, oracle, identity. Shows: current degree, φ-stage, active planet symbols.

```rust
pub struct MiniClockPlugin {
    clock: SharedClockState,
}

impl HypertilePlugin for MiniClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let state = self.clock.lock().unwrap().clone();

        let block = Block::default()
            .title(" ◎ ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(
                if is_focused { Color::Cyan } else { Color::DarkGray }
            ));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        // Planet symbols on one line (only loaded planets)
        const PLANET_SYMBOLS: [&str; 9] = ["☉","♀","☿","☽","♄","♃","♂","♆","♇"];
        let planet_line: String = state.planet_degrees
            .iter()
            .enumerate()
            .filter(|(_, &d)| d != 0xFFFF)
            .map(|(i, &d)| format!("{}{}° ", PLANET_SYMBOLS[i], d))
            .collect();

        const STAGE_LABELS: [&str; 6] = ["SEED","POLE","TRIKA","FLOWER","FULL","META"];
        const STAGE_COLORS: [Color; 6] = [
            Color::DarkGray, Color::White, Color::Cyan,
            Color::Green, Color::Magenta, Color::Red,
        ];

        let stage_name  = STAGE_LABELS[state.torus_stage as usize];
        let stage_color = STAGE_COLORS[state.torus_stage as usize];

        let lines = vec![
            Line::from(vec![
                Span::styled(format!("{}° ", state.current_degree),
                    Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)),
                Span::styled(stage_name,
                    Style::default().fg(stage_color).add_modifier(Modifier::BOLD)),
            ]),
            Line::from(vec![
                Span::styled(
                    if planet_line.is_empty() { "kairos not loaded".to_string() }
                    else { planet_line },
                    Style::default().fg(Color::DarkGray),
                ),
            ]),
        ];

        let para = Paragraph::new(lines);
        Widget::render(para, inner, buf);
    }

    fn on_event(&mut self, _event: &HypertileEvent) -> EventOutcome {
        EventOutcome::Ignored
    }
}
```

---

## VII. M4SpinePlugin — Chakral-Elemental Spine

The 8-chakra vertical column driven by live oracle charges. Natal spine shown as dim ghost.
Lives on Tab 1; instantiable by the user alongside oracle/identity.

```rust
pub struct M4SpinePlugin {
    clock: SharedClockState,
}

const CHAKRA_NAMES:  [&str; 8] = [
    "Earth", "Root ", "Sacrl", "Solar", "Heart", "Throa", "Ajna ", "Crown",
];
const CHAKRA_COLORS: [Color; 8] = [
    Color::White,   // Earth (always-full base, observer anchor)
    Color::Red,     // Muladhara
    Color::LightRed, // Svadhishthana
    Color::Yellow,  // Manipura
    Color::Green,   // Anahata
    Color::Cyan,    // Vishuddha
    Color::Blue,    // Ajna
    Color::Magenta, // Sahasrara
];

/// Quaternion → chakra activation levels (0.0–1.0 per chakra)
/// w=T=Earth, x=A=Fire, y=G=Water, z=C=Air; map elements to chakras via ELEMENT_CHAKRA
fn quaternion_to_chakra_levels(q: [f32; 4]) -> [f32; 8] {
    let [w, x, y, z] = q;
    // Earth (0) = always 1.0 (the observer anchor)
    // Earth element (w/T) → Root(1), Manipura(3)
    // Fire  element (x/A) → Manipura(3), Sahasrara(7)
    // Water element (y/G) → Sacral(2), Heart(4)
    // Air   element (z/C) → Heart(4), Throat(5)
    let mut levels = [0.0f32; 8];
    levels[0] = 1.0;                       // Earth node always full
    levels[1] = (w * 0.8 + z * 0.2).min(1.0);  // Root: Earth+Air blend
    levels[2] = (y * 0.9 + w * 0.1).min(1.0);  // Sacral: Water
    levels[3] = (w * 0.6 + x * 0.4).min(1.0);  // Solar: Earth+Fire
    levels[4] = (z * 0.6 + y * 0.4).min(1.0);  // Heart: Air+Water
    levels[5] = (z * 0.8 + x * 0.2).min(1.0);  // Throat: Air
    levels[6] = (x * 0.5 + y * 0.5).min(1.0);  // Ajna: Fire+Water
    levels[7] = (x * 0.9 + z * 0.1).min(1.0);  // Crown: Fire
    levels
}

impl HypertilePlugin for M4SpinePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let state = self.clock.lock().unwrap().clone();

        let block = Block::default()
            .title(" ⊕ Spine ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(
                if is_focused { Color::Cyan } else { Color::DarkGray }
            ));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        let live_levels  = quaternion_to_chakra_levels(state.live_quaternion);
        let natal_levels = quaternion_to_chakra_levels(state.natal_quaternion);

        let bar_width = (inner.width as usize).saturating_sub(8).max(4);

        // Render top-to-bottom (Sahasrara at top, Earth at bottom)
        let mut lines: Vec<Line> = Vec::new();
        for i in (0..8).rev() {
            let live  = live_levels[i];
            let natal = natal_levels[i];
            let filled = (live  * bar_width as f32) as usize;
            let ghost  = (natal * bar_width as f32) as usize;

            let mut spans = vec![
                Span::styled(
                    format!("{} ", CHAKRA_NAMES[i]),
                    Style::default().fg(CHAKRA_COLORS[i]),
                ),
            ];

            // Draw bar: filled portion, ghost portion, empty
            let max_pos = filled.max(ghost);
            for pos in 0..bar_width {
                let sym = if pos < filled && pos < ghost {
                    // Both live and natal: bright bar
                    Span::styled("█", Style::default().fg(CHAKRA_COLORS[i]))
                } else if pos < filled {
                    // Live only (gained since natal): bright
                    Span::styled("▓", Style::default().fg(CHAKRA_COLORS[i]).add_modifier(Modifier::BOLD))
                } else if pos < ghost {
                    // Natal only (lost since natal): ghost dim
                    Span::styled("░", Style::default().fg(Color::DarkGray))
                } else {
                    Span::styled("·", Style::default().fg(Color::Black))
                };
                spans.push(sym);
            }

            lines.push(Line::from(spans));
        }

        // Quintessence indicator: low variance across levels = Akasha present
        let variance = {
            let non_earth: Vec<f32> = live_levels[1..].to_vec();
            let mean = non_earth.iter().sum::<f32>() / 7.0;
            non_earth.iter().map(|&v| (v - mean).powi(2)).sum::<f32>() / 7.0
        };
        let quin_sym = if variance < 0.02 { "◉ Quintessence" } else { "◎" };
        lines.push(Line::from(""));
        lines.push(Line::from(vec![
            Span::styled(quin_sym, Style::default().fg(
                if variance < 0.02 { Color::White } else { Color::DarkGray }
            ).add_modifier(Modifier::BOLD)),
        ]));

        let para = Paragraph::new(lines);
        Widget::render(para, inner, buf);
    }

    fn on_event(&mut self, _event: &HypertileEvent) -> EventOutcome {
        EventOutcome::Ignored
    }
}
```

---

## VIII. Oracle Plugin Upgrade — 4-Face Reading

The existing m4.oracle plugin (30 lines) must become the most active plugin in Tab 1.
On each cast it writes to `SharedClockState` and displays all 4 faces.

```rust
// Additional state in M4OraclePlugin:
//   clock: SharedClockState

// After cast, instead of just recording history:
if let Ok(result) = self.epi.nara_oracle_cast_raw() {
    let (pp, nn, np, pn, degree, primary_hex, temporal_hex) = parse_oracle_result(&result);
    update_from_cast(&self.clock, pp, nn, np, pn, degree, primary_hex, temporal_hex);
    // CosmicClockPlugin and SpinePlugin will read the updated state on their next render
}

// Rendering: show all 4 faces clearly
let lines = if let Some(cast) = &state.last_cast {
    vec![
        Line::from(vec![
            Span::styled("▶ codon    ", Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)),
            Span::styled(format!("{}° hex #{}", cast.primary_degree, cast.primary_hex),
                Style::default().fg(Color::White)),
        ]),
        Line::from(vec![
            Span::styled("  anti     ", Style::default().fg(Color::Green)),
            Span::styled(format!("{}° (structural complement)", cast.deficient_degree),
                Style::default().fg(Color::DarkGray)),
        ]),
        Line::from(vec![
            Span::styled("  implicit ", Style::default().fg(Color::Magenta)),
            Span::styled(format!("{}° (phase-flipped / unconscious)", cast.implicate_degree),
                Style::default().fg(Color::DarkGray)),
        ]),
        Line::from(vec![
            Span::styled("  temporal ", Style::default().fg(Color::Cyan)),
            Span::styled(format!("hex #{} (changing lines → where this goes)", cast.temporal_hex),
                Style::default().fg(Color::DarkGray)),
        ]),
    ]
} else {
    vec![Line::from("No cast yet — press [space] to cast")]
};
```

---

## IX. Tab 2 Restructure

With CosmicClockPlugin as Tab 2's entire content, the structural tab default layout becomes:

```
epi portal --tab structural
→ single pane, full-screen CosmicClockPlugin
```

The user can split (via hypertile Alt+H/J/K/L or Alt+p command palette) to add:
- `m0.dashboard` — reference pane for psychoid numbers (when needed)
- `m0.families` — coordinate browser
- `mini.clock` — compact overlay (unusual on tab 2 but available)

M1 Walk: absorbed conceptually into the clock (the torus rotation IS the walk). The M1WalkPlugin
remains registered but is no longer in the default Tab 2 layout — accessible via command palette.

M2/M3 stubs: removed from default layout. M2 vibrational is subsumed by the CosmicClockPlugin's
planetary visualization. M3 knowing remains available via palette as a text-mode coordinate
reference (to be built out separately).

---

## X. Plugin Registration — Actual Hypertile API

**Correction from earlier draft:** There is no `PluginRegistry` type or `build_tabN_registry()` function
in the actual stack. The hypertile API is `runtime.register_plugin_type(name, factory_fn)` where
`factory_fn: impl Fn() -> Box<dyn HypertilePlugin> + 'static`. Existing plugins all use `Plugin::new()`
with no constructor args — they self-load data from `crate::nara::*` directly.

The pattern for injecting `SharedClockState` is a **capturing closure**, registered separately from
the existing `register_all_plugins()`:

```rust
// In portal/mod.rs

/// Register all clock-state-dependent plugins on a runtime.
/// Called after register_all_plugins() on each tab's runtime.
fn register_clock_plugins(
    runtime: &mut ratatui_hypertile_extras::HypertileRuntime,
    clock: SharedClockState,
) {
    // Tab 0 clock-aware plugins (instantiable from palette on personal tab)
    {
        let clk = clock.clone();
        runtime.register_plugin_type("m4.spine",   move || M4SpinePlugin::new(clk.clone()));
    }
    {
        let clk = clock.clone();
        runtime.register_plugin_type("mini.clock", move || MiniClockPlugin::new(clk.clone()));
    }
    // Tab 1: the clock itself
    {
        let clk = clock.clone();
        runtime.register_plugin_type("clock",      move || CosmicClockPlugin::new(clk.clone()));
    }
}
```

**M4OraclePlugin** needs one change: it must also capture `SharedClockState` to write on cast.
Since oracle already calls `crate::nara::oracle::cast()` directly, this is a field addition:

```rust
// M4OraclePlugin gains:
clock: SharedClockState

// In new():
pub fn new_with_clock(clock: SharedClockState) -> Self { ... }
// registered as:
let clk = clock.clone();
runtime.register_plugin_type("m4.oracle", move || M4OraclePlugin::new_with_clock(clk.clone()));
```

**`build_workspace()` updated signature:**

```rust
fn build_workspace(clock: SharedClockState) -> color_eyre::Result<WorkspaceRuntime> {
    // ...
    // Tab 0:
    register_all_plugins(workspace.active_runtime_mut());
    register_clock_plugins(workspace.active_runtime_mut(), clock.clone());
    // replace root with m4.flow (not m4.identity — Tab 0 leads with writing space)
    workspace.active_runtime_mut()
        .replace_focused_plugin("m4.flow") ...

    // Tab 1:
    workspace.new_tab();
    workspace.rename_tab(1, "Cosmic Clock".to_string());
    register_all_plugins(workspace.active_runtime_mut());
    register_clock_plugins(workspace.active_runtime_mut(), clock.clone());
    // Single pane — the clock
    workspace.active_runtime_mut()
        .replace_focused_plugin("clock") ...
    // No splits — Tab 1 opens as full-screen clock; user splits via palette
}
```

**Tab labels:**
- Tab 0: `"M4'-M5' Personal"` (unchanged)
- Tab 1: `"Cosmic Clock"` (was `"M0'-M3' Structural"` — the clock IS M0–M3 expressed visually)

**Note on M4OraclePlugin registration conflict:** `register_all_plugins()` currently registers
`"m4.oracle"` with `|| M4OraclePlugin::new()`. With the clock upgrade, `register_all_plugins()`
must skip `"m4.oracle"` (or `register_clock_plugins` must overwrite it). Cleanest: remove
`"m4.oracle"` from `register_all_plugins()` and always register it via `register_clock_plugins()`
since it now requires the clock reference unconditionally.

---

## XI. Implementation Order

```
Phase 1 — Foundation (no M4 data needed; clock renders with default state)
  [x] G0: Add nalgebra to Cargo.toml
  [x] G1: Create clock_state.rs (PortalClockState, SharedClockState, update_from_cast)
  [ ] G2: Create portal/plugins/clock.rs — BrailleCanvas, render_torus, render_degree_ring,
          render_planet_symbols
  [ ] G3: Implement CosmicClockPlugin + MiniClockPlugin in clock.rs
  [ ] G4: Create portal/plugins/m4_spine.rs — M4SpinePlugin
  [ ] G5: Add register_clock_plugins() to portal/mod.rs; create SharedClockState in
          run_event_loop; pass to build_workspace(clock)
  [ ] G6: Remove "m4.oracle" from register_all_plugins(); add to register_clock_plugins()
          as M4OraclePlugin::new_with_clock(clock)
  [ ] G7: Update build_workspace() — Tab 0 root = "m4.flow"; Tab 1 = single "clock" pane;
          rename Tab 1 to "Cosmic Clock"
  [ ] G8: Update plugins/mod.rs to pub mod clock; pub mod m4_spine
  [ ] G9: Update registry.rs tests for new plugin list + clock plugins
  [ ] G10: cargo build; epi portal --tab structural shows torus

Phase 2 — Oracle writes to clock; spine + mini-clock live
  [ ] G11: Add SharedClockState field to M4OraclePlugin; parse cast result → update_from_cast()
  [ ] G12: Upgrade M4OraclePlugin render to show all 4 oracle faces
  [ ] G13: Build + test: oracle cast in Tab 0 updates torus rotation in Tab 1

Phase 3 — Kairos + Natal + Completeness
  [ ] G14: Wire Kerykeion planet_degrees into SharedClockState at launch + k-key reload
           NOTE: Canonical array is [PlanetState; 10] (Sun–Pluto). Kerykeion currently returns
           9 planets (no Uranus); add Uranus stub until Kerykeion adapter updated.
  [ ] G15: Wire quintessence_quaternion from M4_Identity_Matrix at launch (NOT natal_quaternion —
           the stable reference is derived from all 5 #4.0 profiles via extract_elemental_profiles())
  [ ] G16: Verify tick12 tracking: live_quaternion → quantize_to_spanda_substage(y,x) → tick12
           (integer 0–11, not float). Degree comes from oracle cast, NOT from atan2 of quaternion.
  [ ] G17: Verify Quintessence detection in M4SpinePlugin (low variance threshold 0.02 fires)
  [ ] G18: Full portal tests pass; epi portal usable end-to-end

Phase 4 — Oracle Payload + Gateway Contract
  [ ] G19: Emit OraclePayload struct on every cast (§XII above); wire to gateway nara.oracle.payload
  [ ] G20: Wire hexagram_body_lookup() into cast result → body zone fields of OraclePayload
  [ ] G21: Gateway nara.oracle.payload handler returns full OraclePayload (machine + human form)
  [ ] G22: Session hash: add Khora session_start hook → BLAKE3(quintessence_hash||session_start_u64)
```

---

## XII. Oracle Payload Schema [canonical, planned]

Every oracle cast must emit two simultaneous payload forms. The oracle is not just a text output — it is a **rotational state** in the elemental/symbolic space. A library of oracle readings is a library of rotational states.

### Machine Payload (structured)

```rust
pub struct OraclePayload {
    // Identity of the reading
    pub entity_hash:         [u8; 32],    // quintessence_hash
    pub session_hash:        [u8; 32],    // Khora session hash
    pub cast_timestamp:      u64,         // Unix seconds

    // The four oracle faces
    pub faces:               OracleFaces, // primary/deficient/implicate/temporal

    // Elemental rotational state
    pub live_quaternion:     [f32; 4],    // [w=EARTH, x=FIRE, y=WATER, z=AIR]
    pub tick12:              u8,          // M1 spanda ring position 0–11
    pub exact_degree_720:    f32,         // high-precision clock address

    // Ananda coordinate (DR-based M1 processing layer)
    pub ananda_row:          u8,          // digital_root(primary_hex)
    pub ananda_col:          u8,          // digital_root(changing_lines_mask)

    // Oracle body chain (from hexagram_body_lookup)
    pub body_zones:          [u8; 4],     // chakra body zone indices
    pub active_chakra:       u8,          // primary chakra from this hexagram

    // Lens context at time of cast
    pub active_lens:         u8,          // which of 16 CLOCK_LENSES was active
    pub active_branch_lens:  u8,          // which of 6 #4.4 Nara lenses (#4.4.0–#4.4.5)

    // Kairos context (planetary hour at cast moment)
    pub planetary_hour:      u8,          // 0–23 Chaldean hour
    pub hour_planet:         u8,          // ruling Planet_Id
}
```

### Human Payload (readable, generated alongside machine payload)

```
Oracle Reading — {timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary:   Hexagram {n} — {name}    ({codon}, {amino_acid})
           {body_zone}, {chakra}

Deficient: Hexagram {n} — {name}    (what is structurally absent)
Implicate: ↳ {name} in its depth    (the unconscious completion)
Temporal:  → Hexagram {n} — {name}  (where this moves)

Elemental orientation: EARTH {w:.2} | FIRE {x:.2} | WATER {y:.2} | AIR {z:.2}
Spanda stage: {tick12} ({spanda_name})
Planetary hour: {planet_name} hour — {chakra_name} resonance
```

### Routing

Oracle payload is emitted to:
- `SharedClockState` (via `update_from_cast()`)
- Gateway `nara.oracle.payload` method (for frontend and epi-app consumers)
- SpacetimeDB `TorusSync` table (rotational state for multiplayer presence)
- Medicine module (hexagram_body_lookup → body zones for prescription context)

---

*Nota bene: CLOCK_DEGREE_LUT (Gap G2 in 07-unified) is NOT required for Phase 1-2.*
*The clock renders correctly without it — the degree ring shows positions and planet symbols;*
*codon/amino/decan metadata overlay is Phase 3+ once the Python LUT-builder is run.*
