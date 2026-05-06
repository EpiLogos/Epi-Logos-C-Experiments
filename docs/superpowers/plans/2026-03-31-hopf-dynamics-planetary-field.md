# Hopf Dynamics & Planetary Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Cosmic Clock from kinematic display to a living dynamical system — quaternion composition, walk modes, bifurcation parameter, planetary aspect rendering, codon bridge, and resolution-aware display.

**Architecture:** Two parallel workstreams after a shared foundation task. Agent A handles dynamics engine (clock_state.rs computations + engine.c Walk_Mode). Agent B handles planetary display + codon bridge + plugin rendering. Both read/write the same PortalClockState struct whose new fields are added in Task 0.

**Tech Stack:** Rust (epi-cli portal + nara), C (epi-lib engine), ratatui TUI rendering

**Spec:** `docs/plans/CLOCK-AND-NARA-SPECS/HOPF-INTEGRATION-READ.md` (v2.0, §I–§XIX)

**Parallel execution:** Tasks 0 is sequential (shared foundation). Then Agent A runs Tasks 1–6, Agent B runs Tasks 7–14. Both can run simultaneously. Merge A first, then B (B reads A's fields but only for display).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `epi-cli/src/portal/clock_state.rs` | Modify | New fields, quaternion composition, walk mode derivation, aspect computation, codon bridge, resonance stub |
| `epi-cli/src/nara/identity.rs` | Modify | Journal NLP elemental weighting stub |
| `epi-cli/src/portal/plugins/clock.rs` | Modify | Planetary glyphs, aspect lines, micro-orbit trail, resolution ticks, active codon |
| `epi-cli/src/portal/plugins/mini_clock.rs` | Modify | Walk-mode indicator, element colouring |
| `epi-cli/src/portal/plugins/m4.rs` | Modify | Oracle post-cast display (walk_mode, λ, codon) |
| `epi-cli/src/portal/plugins/m2.rs` | Modify | Active cell highlighting, resolution dimming |
| `epi-cli/src/portal/plugins/spine.rs` | Modify | λ-modulated chakra glow |
| `epi-lib/include/engine.h` | Modify | Walk_Mode enum, engine_walk_by_mode() declaration |
| `epi-lib/src/engine.c` | Modify | engine_walk_by_mode() implementation |
| `epi-lib/test/test_engine.c` | Modify | Walk mode dispatch tests |

---

## AGENT A — Dynamics Engine

### Task 0: Shared Foundation — Add New Fields to PortalClockState

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs:105-183`

- [ ] **Step 1: Add new fields to PortalClockState struct**

After the `orbital_position` field (line 162), before the closing brace, add:

```rust
    // ── Hopf dynamics layer ─────────────────────────────────────────────────
    /// QL position derived from quaternion base-space projection (0–5).
    /// Spec: HOPF-INTEGRATION-READ §VII-B
    pub ql_position:       u8,

    /// Active walk mode: 0=GROUND(w), 1=TORUS(x), 2=FIBER(y), 3=SPANDA(z).
    /// Derived from argmax(|w|, |x|, |y|, |z|) of live_quaternion.
    /// Spec: HOPF-INTEGRATION-READ §III
    pub walk_mode:         u8,

    /// Bifurcation parameter λ = sqrt(x² + y² + z²) = sqrt(1 - w²).
    /// 0.0 = Akasha equilibrium; 1.0 = full chaos (w=0).
    /// Spec: HOPF-INTEGRATION-READ §V
    pub bifurcation_param: f32,

    /// Clock resolution level derived from λ thresholds:
    /// 0 = 6-fold, 1 = 12-fold, 2 = 36-fold, 3 = 72-fold.
    /// Spec: HOPF-INTEGRATION-READ §V (period-doubling cascade)
    pub resolution_level:  u8,

    /// Kairos-derived quaternion from planetary elemental weights.
    /// Updated on kairos sync. Represents the transit layer (Q_transit).
    pub kairos_quaternion: [f32; 4],

    // ── Codon bridge layer ──────────────────────────────────────────────────
    /// Active codon index (0–63) at current degree position.
    /// Derived from degree → decan → codon mapping (Clock A path).
    pub active_codon_idx:  u8,

    /// Rotational state of the active codon (0–7 for dual, 0–6 for non-dual).
    /// Currently binary: 0=upright, 4=reversed. Full 8-fold spectrum deferred.
    pub rotational_state:  u8,

    // ── Planetary aspect layer ──────────────────────────────────────────────
    /// Planetary aspects: (planet_a_idx, planet_b_idx, aspect_type).
    /// Updated on kairos sync. Rendered as lines in CosmicClockPlugin.
    pub aspects:           Vec<(u8, u8, u8)>,

    /// Micro-orbit trail: last 24 oracle cast degree positions.
    /// Most recent at index 0. Rendered as connected path on clock ring.
    pub micro_orbit:       Vec<u16>,
```

- [ ] **Step 2: Update Default impl**

Replace the Default impl (lines 165-183) to include new fields:

```rust
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
            // Hopf dynamics
            ql_position:             0,
            walk_mode:               0, // GROUND
            bifurcation_param:       0.0,
            resolution_level:        0, // 6-fold
            kairos_quaternion:       [1.0, 0.0, 0.0, 0.0],
            // Codon bridge
            active_codon_idx:        0,
            rotational_state:        0,
            // Planetary aspects
            aspects:                 Vec::new(),
            micro_orbit:             Vec::new(),
        }
    }
}
```

- [ ] **Step 3: Add AspectType constants**

After the `OracleFaces` struct definition (around line 90), add:

```rust
// ── Aspect type constants ───────────────────────────────────────────────────
/// Planetary aspect types (angular relationships on the degree ring).
/// These ARE the QL modal nesting expressed as angular geometry.
pub const ASPECT_CONJUNCTION: u8 = 0;  // 0° ± 8° — identity/resonance
pub const ASPECT_SEXTILE:    u8 = 1;  // 60° ± 6° — 6-fold QL quantum
pub const ASPECT_SQUARE:     u8 = 2;  // 90° ± 8° — 4-fold quaternity
pub const ASPECT_TRINE:      u8 = 3;  // 120° ± 8° — 3-fold Trika
pub const ASPECT_OPPOSITION: u8 = 4;  // 180° ± 8° — 2-fold # inversion
```

- [ ] **Step 4: Build to verify compilation**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: `Finished` with no errors (warnings OK)

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add Hopf dynamics, codon bridge, and aspect fields to PortalClockState"
```

---

### Task 1: Quaternion Helper Functions

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Add quaternion multiplication and helper functions**

After `quantize_to_spanda_substage()` (line 224), add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// QUATERNION ALGEBRA
// ─────────────────────────────────────────────────────────────────────────────

/// Hamilton product of two unit quaternions.
/// q1 × q2 (non-commutative). Used for Q_actual = Q_natal × Q_transit × Q_oracle.
fn quat_mul(a: [f32; 4], b: [f32; 4]) -> [f32; 4] {
    let [aw, ax, ay, az] = a;
    let [bw, bx, by, bz] = b;
    [
        aw*bw - ax*bx - ay*by - az*bz,
        aw*bx + ax*bw + ay*bz - az*by,
        aw*by - ax*bz + ay*bw + az*bx,
        aw*bz + ax*by - ay*bx + az*bw,
    ]
}

/// Normalize a quaternion to unit length. Returns identity if magnitude is zero.
fn quat_normalize(q: [f32; 4]) -> [f32; 4] {
    let mag = (q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]).sqrt();
    if mag < f32::EPSILON { return [1.0, 0.0, 0.0, 0.0]; }
    [q[0]/mag, q[1]/mag, q[2]/mag, q[3]/mag]
}

/// Derive walk mode from dominant quaternion component.
/// 0=GROUND(w/EARTH), 1=TORUS(x/FIRE), 2=FIBER(y/WATER), 3=SPANDA(z/AIR).
fn derive_walk_mode(q: [f32; 4]) -> u8 {
    let abs = [q[0].abs(), q[1].abs(), q[2].abs(), q[3].abs()];
    let mut max_idx = 0u8;
    let mut max_val = abs[0];
    for i in 1..4 {
        if abs[i] > max_val {
            max_val = abs[i];
            max_idx = i as u8;
        }
    }
    max_idx
}

/// Compute bifurcation parameter λ = sqrt(x² + y² + z²) = sqrt(1 - w²).
/// Range: 0.0 (Akasha equilibrium) to 1.0 (full chaos).
fn derive_bifurcation_param(q: [f32; 4]) -> f32 {
    (q[1]*q[1] + q[2]*q[2] + q[3]*q[3]).sqrt()
}

/// Resolution level from bifurcation parameter (period-doubling cascade).
/// 0 = 6-fold, 1 = 12-fold, 2 = 36-fold, 3 = 72-fold.
fn derive_resolution_level(lambda: f32) -> u8 {
    if lambda < 0.25 { 0 }
    else if lambda < 0.50 { 1 }
    else if lambda < 0.75 { 2 }
    else { 3 }
}

/// Project quaternion onto base-space to derive QL position (0–5).
/// Uses atan2(z, w) for the base-space angle, quantized to 6 sectors.
fn derive_ql_position(q: [f32; 4]) -> u8 {
    let angle = q[3].atan2(q[0]); // z.atan2(w)
    let normalized = (angle + std::f32::consts::PI) / std::f32::consts::TAU;
    ((normalized * 6.0).round() as u8) % 6
}
```

- [ ] **Step 2: Build to verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished` (functions are private, no unused warnings yet since they'll be called in Task 2)

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add quaternion algebra helpers (mul, normalize, walk_mode, λ, ql_position)"
```

---

### Task 2: Quaternion Composition in update_from_cast()

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs:236-294`

- [ ] **Step 1: Write test for quaternion composition**

At the bottom of `clock_state.rs`, add a test module:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quat_mul_identity() {
        let id = [1.0f32, 0.0, 0.0, 0.0];
        let q = [0.5, 0.5, 0.5, 0.5];
        let result = quat_mul(id, q);
        for i in 0..4 { assert!((result[i] - q[i]).abs() < 1e-6, "idx {i}"); }
    }

    #[test]
    fn walk_mode_ground_when_w_dominant() {
        assert_eq!(derive_walk_mode([0.9, 0.1, 0.1, 0.1]), 0); // GROUND
    }

    #[test]
    fn walk_mode_spanda_when_z_dominant() {
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.1, 0.9]), 3); // SPANDA
    }

    #[test]
    fn bifurcation_zero_at_akasha() {
        let lambda = derive_bifurcation_param([1.0, 0.0, 0.0, 0.0]);
        assert!(lambda < 1e-6);
    }

    #[test]
    fn bifurcation_near_one_when_w_zero() {
        let q = quat_normalize([0.0, 0.577, 0.577, 0.577]);
        let lambda = derive_bifurcation_param(q);
        assert!((lambda - 1.0).abs() < 0.01);
    }

    #[test]
    fn resolution_cascade() {
        assert_eq!(derive_resolution_level(0.1), 0);  // 6-fold
        assert_eq!(derive_resolution_level(0.3), 1);  // 12-fold
        assert_eq!(derive_resolution_level(0.6), 2);  // 36-fold
        assert_eq!(derive_resolution_level(0.9), 3);  // 72-fold
    }

    #[test]
    fn update_from_cast_sets_hopf_fields() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        // pp-dominant → w-dominant → GROUND walk mode
        update_from_cast(&state, 10.0, 1.0, 1.0, 1.0, 90, 5, 7, 0b000011);
        let s = state.lock().unwrap();
        assert_eq!(s.walk_mode, 0); // GROUND (pp/w dominant)
        assert!(s.bifurcation_param < 0.5); // w dominant → low λ
        assert_eq!(s.resolution_level, 0); // low λ → 6-fold
        assert_eq!(s.current_degree, 90);
        assert!(s.micro_orbit.contains(&90));
    }

    #[test]
    fn quaternion_composition_differs_from_overwrite() {
        let state = Arc::new(Mutex::new(PortalClockState::default()));
        // Set a non-identity quintessence (natal) quaternion
        state.lock().unwrap().quintessence_quaternion = quat_normalize([0.5, 0.5, 0.5, 0.5]);
        // Cast with equal charges (oracle quaternion ≈ identity-ish)
        update_from_cast(&state, 3.0, 3.0, 3.0, 3.0, 45, 1, 2, 0);
        let s = state.lock().unwrap();
        // live_quaternion should NOT be [0.5, 0.5, 0.5, 0.5] — it's composed
        // Q_actual = Q_natal × Q_transit × Q_oracle
        assert!(s.live_quaternion[0] != 0.5 || s.live_quaternion[1] != 0.5,
            "composition should differ from raw oracle charges");
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state::tests 2>&1 | tail -15`
Expected: `update_from_cast_sets_hopf_fields` and `quaternion_composition_differs_from_overwrite` FAIL (fields not populated yet). Helper tests should PASS.

- [ ] **Step 3: Update update_from_cast() to compose quaternions and derive Hopf fields**

Replace the body of `update_from_cast()` (lines 243-293):

```rust
    let total = pp + nn + np + pn;
    if total < f32::EPSILON { return; }

    // Oracle quaternion from charges (same normalization as before)
    let q_oracle = quat_normalize([pp/total, nn/total, np/total, pn/total]);

    // Quantized Spanda substage — integer, not float cast
    let tick12 = quantize_to_spanda_substage(np/total, nn/total);

    // Deficient degree via # operator (antiparallel offset)
    let deficient = (degree as u32 + 180) % 360;
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

    // ── Quaternion composition: Q_actual = Q_natal × Q_transit × Q_oracle ──
    // Non-commutative: identity > cosmos > divination priority ordering.
    let q_composed = quat_normalize(
        quat_mul(quat_mul(s.quintessence_quaternion, s.kairos_quaternion), q_oracle)
    );
    s.live_quaternion = q_composed;

    // ── Hopf dynamics derivation ───────────────────────────────────────────
    s.walk_mode         = derive_walk_mode(q_composed);
    s.bifurcation_param = derive_bifurcation_param(q_composed);
    s.resolution_level  = derive_resolution_level(s.bifurcation_param);
    s.ql_position       = derive_ql_position(q_composed);

    // ── Standard state updates ─────────────────────────────────────────────
    s.current_degree      = degree;
    s.tick12              = tick12;
    s.orbital_position    = orbital;
    s.last_cast_timestamp = ts;

    // ── Micro-orbit trail (last 24 cast positions) ─────────────────────────
    s.micro_orbit.insert(0, degree);
    s.micro_orbit.truncate(24);

    // ── Codon bridge: degree → decan → codon index ─────────────────────────
    s.active_codon_idx = degree_to_codon(degree);
    // Rotational state: binary for now (upright=0 if primary_hex even, reversed=4 if odd)
    s.rotational_state = if primary_hex % 2 == 0 { 0 } else { 4 };

    s.last_cast = Some(OracleFaces {
        primary_degree:     degree,
        deficient_degree:   deficient as u16,
        implicate_degree:   implicate,
        temporal_hex,
        primary_hex,
        changing_lines_mask,
    });
```

- [ ] **Step 4: Add degree_to_codon() stub**

After `derive_ql_position()`, add:

```rust
/// Map a degree (0–359) to a codon index (0–63) via the decan system.
/// Degree → decan (degree / 10, 0–35) → codon (decan mapped to codon space).
/// The 36 decans map to 36 of the 64 codons (pip card coverage).
/// For degrees outside pip decan range, uses degree % 64 as fallback.
fn degree_to_codon(degree: u16) -> u8 {
    // Each decan spans 10°. 36 decans map to 36 codon slots.
    // Mapping: decan_idx → codon is via the ZODIAC_DECAN_TABLE ordering.
    // Phase 1: simple modular mapping. Phase 2: wire to actual dataset LUT.
    let decan_idx = (degree / 10) as u8; // 0–35
    // Decans 0–35 map linearly to codons 0–35 in the pip card ordering.
    // Remaining codons 36–63 are court/major arcana territory.
    decan_idx % 64
}
```

- [ ] **Step 5: Run tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state::tests 2>&1 | tail -20`
Expected: ALL PASS

- [ ] **Step 6: Run full test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test 2>&1 | tail -10`
Expected: All existing tests still pass

- [ ] **Step 7: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): quaternion composition Q_natal×Q_transit×Q_oracle + Hopf field derivation"
```

---

### Task 3: Kairos Quaternion Derivation + Aspect Computation

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Write tests for aspect classification and kairos quaternion**

Add to the existing `mod tests`:

```rust
    #[test]
    fn classify_aspect_conjunction() {
        assert_eq!(classify_aspect(0, 5), Some(ASPECT_CONJUNCTION));
        assert_eq!(classify_aspect(355, 3), Some(ASPECT_CONJUNCTION)); // wraps
    }

    #[test]
    fn classify_aspect_opposition() {
        assert_eq!(classify_aspect(0, 180), Some(ASPECT_OPPOSITION));
        assert_eq!(classify_aspect(10, 190), Some(ASPECT_OPPOSITION));
    }

    #[test]
    fn classify_aspect_trine() {
        assert_eq!(classify_aspect(0, 120), Some(ASPECT_TRINE));
    }

    #[test]
    fn classify_aspect_none() {
        assert_eq!(classify_aspect(0, 45), None); // no standard aspect at 45°
    }

    #[test]
    fn kairos_quaternion_from_planets() {
        let mut kairos = KairosState::default();
        kairos.valid = true;
        // Sun at 0° Aries (Fire), Moon at 90° Cancer (Water)
        kairos.planets[0].degree = 0;
        kairos.planets[1].degree = 90;
        // Rest at 0xFFFF (unavailable)
        for i in 2..10 { kairos.planets[i].degree = 0xFFFF; }
        let q = compute_kairos_quaternion(&kairos);
        // Should have non-trivial FIRE (x) and WATER (y) components
        assert!(q[1] > 0.1 || q[2] > 0.1, "should have elemental weight");
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state::tests 2>&1 | grep "FAILED\|error"`
Expected: FAIL — `classify_aspect` and `compute_kairos_quaternion` not found

- [ ] **Step 3: Implement classify_aspect()**

After the Hopf helper functions, add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY ASPECTS
// ─────────────────────────────────────────────────────────────────────────────

/// Classify the aspect between two planetary degrees.
/// Returns None if no major aspect within orb.
pub fn classify_aspect(deg_a: u16, deg_b: u16) -> Option<u8> {
    let diff = {
        let d = (deg_a as i32 - deg_b as i32).unsigned_abs();
        if d > 180 { 360 - d } else { d }
    };
    // Standard orbs: conjunction ±8°, sextile ±6°, square ±8°, trine ±8°, opposition ±8°
    if diff <= 8             { Some(ASPECT_CONJUNCTION) }
    else if (54..=66).contains(&diff)   { Some(ASPECT_SEXTILE) }
    else if (82..=98).contains(&diff)   { Some(ASPECT_SQUARE) }
    else if (112..=128).contains(&diff) { Some(ASPECT_TRINE) }
    else if (172..=180).contains(&diff) { Some(ASPECT_OPPOSITION) }
    else { None }
}

/// Compute all pairwise aspects between the 10 planets.
/// Returns Vec of (planet_a_idx, planet_b_idx, aspect_type).
pub fn compute_aspects(kairos: &KairosState) -> Vec<(u8, u8, u8)> {
    let mut aspects = Vec::new();
    if !kairos.valid { return aspects; }
    for a in 0..10u8 {
        if kairos.planets[a as usize].degree == 0xFFFF { continue; }
        for b in (a+1)..10u8 {
            if kairos.planets[b as usize].degree == 0xFFFF { continue; }
            if let Some(aspect_type) = classify_aspect(
                kairos.planets[a as usize].degree,
                kairos.planets[b as usize].degree,
            ) {
                aspects.push((a, b, aspect_type));
            }
        }
    }
    aspects
}
```

- [ ] **Step 4: Implement compute_kairos_quaternion()**

```rust
/// Derive a quaternion from planetary elemental weights.
/// Each planet's zodiac sign → element → contributes to [w=EARTH, x=FIRE, y=WATER, z=AIR].
/// Sign→element: Aries/Leo/Sag=FIRE, Tau/Vir/Cap=EARTH, Gem/Lib/Aqu=AIR, Can/Sco/Pis=WATER.
pub fn compute_kairos_quaternion(kairos: &KairosState) -> [f32; 4] {
    if !kairos.valid { return [1.0, 0.0, 0.0, 0.0]; }
    let mut elem = [0.0f32; 4]; // [EARTH, FIRE, WATER, AIR]
    let mut count = 0.0f32;
    for p in &kairos.planets {
        if p.degree == 0xFFFF { continue; }
        let sign = (p.degree / 30) as u8 % 12;
        let idx = match sign {
            0 | 4 | 8  => 1, // Aries, Leo, Sagittarius → FIRE
            1 | 5 | 9  => 0, // Taurus, Virgo, Capricorn → EARTH
            2 | 6 | 10 => 3, // Gemini, Libra, Aquarius → AIR
            _           => 2, // Cancer, Scorpio, Pisces → WATER
        };
        elem[idx] += 1.0;
        count += 1.0;
    }
    if count < f32::EPSILON { return [1.0, 0.0, 0.0, 0.0]; }
    // Normalize to unit quaternion [w=EARTH, x=FIRE, y=WATER, z=AIR]
    quat_normalize([elem[0]/count, elem[1]/count, elem[2]/count, elem[3]/count])
}
```

- [ ] **Step 5: Update update_kairos() to derive quaternion and aspects**

Replace `update_kairos()`:

```rust
/// Update kairos state from a fresh Kerykeion reading.
/// Derives kairos_quaternion (Q_transit) and planetary aspects.
pub fn update_kairos(state: &SharedClockState, kairos: KairosState) {
    let q = compute_kairos_quaternion(&kairos);
    let aspects = compute_aspects(&kairos);
    let mut s = state.lock().unwrap();
    s.kairos = kairos;
    s.kairos_quaternion = q;
    s.aspects = aspects;
}
```

- [ ] **Step 6: Run tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state::tests 2>&1 | tail -15`
Expected: ALL PASS

- [ ] **Step 7: Run full test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test 2>&1 | tail -5`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): kairos quaternion derivation + planetary aspect computation"
```

---

### Task 4: Walk_Mode Enum + Dispatch in engine.c

**Files:**
- Modify: `epi-lib/include/engine.h`
- Modify: `epi-lib/src/engine.c`
- Modify: `epi-lib/test/test_engine.c`

- [ ] **Step 1: Add Walk_Mode enum and engine_walk_by_mode() to engine.h**

Before the closing `#endif`, add:

```c
/* ── Walk Mode Dispatch ────────────────────────────────────────────────────
 * Unifies the 4 fundamental walk modes from the quaternion's dominant
 * component. Spec: HOPF-INTEGRATION-READ §III (Four Walk Modes).
 *
 * GROUND (w): no-op — stable attractor, system at rest.
 * TORUS  (x): 6-step QL advance via engine_torus_walk.
 * FIBER  (y): # inversion (strand flip) on the given tick12.
 * SPANDA (z): 12-step full double-helix via engine_spanda_walk.
 */
typedef enum {
    WALK_MODE_GROUND = 0,
    WALK_MODE_TORUS  = 1,
    WALK_MODE_FIBER  = 2,
    WALK_MODE_SPANDA = 3,
} Walk_Mode;

/* Dispatch a walk by mode. `on_step` is called for each position visited.
 * GROUND: calls on_step once with start_position.
 * TORUS:  6 steps from start_position (QL cycle).
 * FIBER:  calls on_step with inverted position (11 - start_position).
 * SPANDA: 12 steps from start_position (full double-helix). */
void engine_walk_by_mode(
    Walk_Mode mode,
    uint8_t   start_position,
    void*     context_state,
    void    (*on_step)(uint8_t position, void* ctx)
);
```

- [ ] **Step 2: Implement engine_walk_by_mode() in engine.c**

Before the VAK section (around line 113), add:

```c
/* ── Walk Mode Dispatch ──────────────────────────────────────────────── */

void engine_walk_by_mode(
    Walk_Mode mode,
    uint8_t   start_position,
    void*     context_state,
    void    (*on_step)(uint8_t position, void* ctx)
) {
    if (!on_step) return;

    switch (mode) {
    case WALK_MODE_GROUND:
        /* No movement — just report the current position. */
        on_step(start_position, context_state);
        break;

    case WALK_MODE_TORUS:
        /* 6-step QL cycle: advance through base positions. */
        for (uint8_t i = 0; i < 6; i++) {
            on_step((start_position + i) % 6, context_state);
        }
        break;

    case WALK_MODE_FIBER:
        /* # inversion: flip to the complementary strand position. */
        on_step(11u - (start_position % 12), context_state);
        break;

    case WALK_MODE_SPANDA:
        /* 12-step full double-helix walk. */
        engine_spanda_walk(start_position % 12, 12, context_state, on_step);
        break;
    }
}
```

- [ ] **Step 3: Add test for walk mode dispatch**

In `epi-lib/test/test_engine.c`, add (in the test function list):

```c
/* Walk mode dispatch tests */
static uint8_t walk_positions[12];
static int walk_count;

static void walk_recorder(uint8_t pos, void* ctx) {
    (void)ctx;
    if (walk_count < 12) walk_positions[walk_count++] = pos;
}

static void test_walk_mode_ground(void) {
    walk_count = 0;
    engine_walk_by_mode(WALK_MODE_GROUND, 3, NULL, walk_recorder);
    ASSERT(walk_count == 1, "GROUND should visit exactly 1 position");
    ASSERT(walk_positions[0] == 3, "GROUND should stay at start");
}

static void test_walk_mode_torus(void) {
    walk_count = 0;
    engine_walk_by_mode(WALK_MODE_TORUS, 0, NULL, walk_recorder);
    ASSERT(walk_count == 6, "TORUS should visit 6 positions");
    ASSERT(walk_positions[0] == 0 && walk_positions[5] == 5, "TORUS walks 0-5");
}

static void test_walk_mode_fiber(void) {
    walk_count = 0;
    engine_walk_by_mode(WALK_MODE_FIBER, 3, NULL, walk_recorder);
    ASSERT(walk_count == 1, "FIBER should visit 1 position");
    ASSERT(walk_positions[0] == 8, "FIBER(3) = 11 - 3 = 8");
}

static void test_walk_mode_spanda(void) {
    walk_count = 0;
    engine_walk_by_mode(WALK_MODE_SPANDA, 0, NULL, walk_recorder);
    ASSERT(walk_count == 12, "SPANDA should visit 12 positions");
}
```

Register these tests in the test runner array.

- [ ] **Step 4: Build and run C tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test 2>&1 | tail -10`
Expected: All tests pass including new walk mode tests

- [ ] **Step 5: Commit**

```bash
git add epi-lib/include/engine.h epi-lib/src/engine.c epi-lib/test/test_engine.c
git commit -m "feat(engine): add Walk_Mode enum and engine_walk_by_mode() dispatch"
```

---

### Task 5: Resonance Stub

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Add resonance function**

After `update_kairos()`, add:

```rust
/// Compute resonance between two users' clock states.
/// Returns cos(angle) between their S³ quaternionic positions.
/// Range: 0.0 (orthogonal) to 1.0 (identical state).
/// Spec: HOPF-INTEGRATION-READ §XIII (Multiplayer Resonance)
pub fn resonance(a: &PortalClockState, b: &PortalClockState) -> f32 {
    let [aw, ax, ay, az] = a.live_quaternion;
    let [bw, bx, by, bz] = b.live_quaternion;
    (aw*bw + ax*bx + ay*by + az*bz).abs()
}
```

- [ ] **Step 2: Add test**

```rust
    #[test]
    fn resonance_identical_states() {
        let a = PortalClockState::default();
        let b = PortalClockState::default();
        assert!((resonance(&a, &b) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn resonance_orthogonal_states() {
        let a = PortalClockState { live_quaternion: [1.0, 0.0, 0.0, 0.0], ..Default::default() };
        let b = PortalClockState { live_quaternion: [0.0, 1.0, 0.0, 0.0], ..Default::default() };
        assert!(resonance(&a, &b) < 0.01);
    }
```

- [ ] **Step 3: Run tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state::tests 2>&1 | tail -10`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add resonance() stub for multiplayer quaternion comparison"
```

---

### Task 6: Journal NLP Elemental Weighting Stub

**Files:**
- Modify: `epi-cli/src/nara/identity.rs`

- [ ] **Step 1: Add stub function**

At the end of `identity.rs` (before any test module), add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL NLP → IDENTITY STATE (STUB)
// ─────────────────────────────────────────────────────────────────────────────

/// Extract elemental weights from journal text via NLP classification.
///
/// Returns [FIRE, WATER, EARTH, AIR] weights normalized to sum=1.0.
/// These feed into the identity quaternion update pipeline:
///   journal text → elemental vector → exponential moving average into
///   elemental_profile → quintessence_quaternion recalculation → clock modulation.
///
/// Architecture (future, non-stub):
/// - Text classified by dominant element: EARTH=practical/grounded,
///   FIRE=creative/willful, WATER=emotional/relational, AIR=intellectual/abstract
/// - Obsidian wikilink detection for family-domain activation weighting
/// - 72-fold MEF lens depth: elemental weights are further refined through
///   the epogdoon vibrational template (12 spanda × 6 QL = 72 cells),
///   where each cell carries an elemental signature. The journal's elemental
///   vector is projected onto the 72-fold template to determine which
///   vibrational region the text resonates with most strongly.
/// - Consent-gated, local-only, α-tunable via NaraWeights config
/// - Runs as chronos scheduled task (nightly at day-archive step)
///
/// Spec: HOPF-INTEGRATION-READ §XVIII (Journal NLP → Identity State Flow)
pub fn journal_elemental_weights(_text: &str) -> [f32; 4] {
    // Stub: equal weights across all elements (Akasha equilibrium)
    [0.25, 0.25, 0.25, 0.25]
}
```

- [ ] **Step 2: Build**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished` (warning about unused function is OK)

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/nara/identity.rs
git commit -m "feat(nara): add journal_elemental_weights() stub with 72-fold MEF architecture docs"
```

---

## AGENT B — Planetary Field + Display

### Task 7: CosmicClockPlugin — Planetary Glyph Rendering

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add planet glyph constant array**

Near the top of `clock.rs`, after imports, add:

```rust
/// Unicode glyphs for the 10 planets (mod-10: Sun=0 through Pluto=9).
const PLANET_GLYPHS: [&str; 10] = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "⛢", "♆", "♇"];
/// Short names for compact display
const PLANET_NAMES: [&str; 10] = ["Su", "Mo", "Me", "Ve", "Ma", "Ju", "Sa", "Ur", "Ne", "Pl"];
```

- [ ] **Step 2: Add render_planets() method to CosmicClockPlugin**

Add a private method that renders planet glyphs on the degree ring:

```rust
/// Render planetary glyphs at their current degree positions on the ring.
fn render_planets(&self, area: Rect, buf: &mut Buffer, state: &PortalClockState) {
    if !state.kairos.valid { return; }
    let cx = area.x + area.width / 2;
    let cy = area.y + area.height / 2;
    let radius = (area.width.min(area.height) / 2).saturating_sub(2) as f32;

    for (i, planet) in state.kairos.planets.iter().enumerate() {
        if planet.degree == 0xFFFF { continue; }
        let angle = (planet.degree as f32) * std::f32::consts::TAU / 360.0 - std::f32::consts::FRAC_PI_2;
        let px = cx as f32 + radius * angle.cos();
        let py = cy as f32 + radius * angle.sin();
        let px = px.round() as u16;
        let py = py.round() as u16;
        if px >= area.x && px < area.x + area.width && py >= area.y && py < area.y + area.height {
            let style = ratatui::style::Style::default().fg(match i {
                0 => ratatui::style::Color::Yellow,      // Sun
                1 => ratatui::style::Color::White,        // Moon
                4 => ratatui::style::Color::Red,          // Mars
                3 => ratatui::style::Color::Green,        // Venus
                5 => ratatui::style::Color::Magenta,      // Jupiter
                6 => ratatui::style::Color::DarkGray,     // Saturn
                _ => ratatui::style::Color::Cyan,         // others
            });
            buf.set_string(px, py, PLANET_NAMES[i], style);
        }
    }
}
```

- [ ] **Step 3: Call render_planets() from the main render method**

In the existing `render()` method, after the degree ring is drawn but before the user marker, add:

```rust
    self.render_planets(area, buf, &state);
```

- [ ] **Step 4: Build and verify visually**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(portal): render planetary glyphs on CosmicClockPlugin degree ring"
```

---

### Task 8: CosmicClockPlugin — Aspect Lines

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add render_aspects() method**

```rust
/// Render aspect lines between planets on the degree ring.
fn render_aspects(&self, area: Rect, buf: &mut Buffer, state: &PortalClockState) {
    use crate::portal::clock_state::*;
    let cx = area.x as f32 + area.width as f32 / 2.0;
    let cy = area.y as f32 + area.height as f32 / 2.0;
    let radius = (area.width.min(area.height) / 2).saturating_sub(4) as f32;

    for &(a, b, aspect_type) in &state.aspects {
        let deg_a = state.kairos.planets[a as usize].degree;
        let deg_b = state.kairos.planets[b as usize].degree;
        if deg_a == 0xFFFF || deg_b == 0xFFFF { continue; }

        let angle_a = deg_a as f32 * std::f32::consts::TAU / 360.0 - std::f32::consts::FRAC_PI_2;
        let angle_b = deg_b as f32 * std::f32::consts::TAU / 360.0 - std::f32::consts::FRAC_PI_2;

        let color = match aspect_type {
            ASPECT_CONJUNCTION => ratatui::style::Color::Yellow,
            ASPECT_SEXTILE    => ratatui::style::Color::Green,
            ASPECT_SQUARE     => ratatui::style::Color::Red,
            ASPECT_TRINE      => ratatui::style::Color::Blue,
            ASPECT_OPPOSITION => ratatui::style::Color::Magenta,
            _ => ratatui::style::Color::Gray,
        };

        // Draw a simple line using Bresenham-style character placement
        let x1 = cx + radius * 0.85 * angle_a.cos();
        let y1 = cy + radius * 0.85 * angle_a.sin();
        let x2 = cx + radius * 0.85 * angle_b.cos();
        let y2 = cy + radius * 0.85 * angle_b.sin();

        let steps = ((x2 - x1).abs().max((y2 - y1).abs()) as usize).max(1);
        let style = ratatui::style::Style::default().fg(color);
        for s in 0..=steps {
            let t = s as f32 / steps as f32;
            let px = (x1 + t * (x2 - x1)).round() as u16;
            let py = (y1 + t * (y2 - y1)).round() as u16;
            if px >= area.x && px < area.x + area.width && py >= area.y && py < area.y + area.height {
                buf.set_string(px, py, "·", style);
            }
        }
    }
}
```

- [ ] **Step 2: Call from render()**

In the main render method, before `render_planets()`:

```rust
    self.render_aspects(area, buf, &state);
```

- [ ] **Step 3: Build**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(portal): render planetary aspect lines (conjunction/sextile/square/trine/opposition)"
```

---

### Task 9: CosmicClockPlugin — Micro-Orbit Trail

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add render_micro_orbit() method**

```rust
/// Render the user's micro-orbit trail (last 24 cast positions).
fn render_micro_orbit(&self, area: Rect, buf: &mut Buffer, state: &PortalClockState) {
    if state.micro_orbit.is_empty() { return; }
    let cx = area.x as f32 + area.width as f32 / 2.0;
    let cy = area.y as f32 + area.height as f32 / 2.0;
    let radius = (area.width.min(area.height) / 2).saturating_sub(3) as f32;

    for (i, &deg) in state.micro_orbit.iter().enumerate() {
        let angle = deg as f32 * std::f32::consts::TAU / 360.0 - std::f32::consts::FRAC_PI_2;
        let px = (cx + radius * 0.92 * angle.cos()).round() as u16;
        let py = (cy + radius * 0.92 * angle.sin()).round() as u16;
        if px >= area.x && px < area.x + area.width && py >= area.y && py < area.y + area.height {
            // Fade trail: most recent = bright, oldest = dim
            let brightness = if i == 0 { ratatui::style::Color::White }
                else if i < 8 { ratatui::style::Color::LightCyan }
                else { ratatui::style::Color::DarkGray };
            buf.set_string(px, py, if i == 0 { "◆" } else { "◇" },
                ratatui::style::Style::default().fg(brightness));
        }
    }
}
```

- [ ] **Step 2: Call from render()**

After `render_planets()`:

```rust
    self.render_micro_orbit(area, buf, &state);
```

- [ ] **Step 3: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(portal): render micro-orbit trail on CosmicClockPlugin"
```

---

### Task 10: CosmicClockPlugin — Resolution-Aware Tick Marks

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add render_resolution_ticks() method**

```rust
/// Render tick marks at granularity determined by resolution_level.
/// 0 = 6 ticks (60° apart), 1 = 12 ticks (30°), 2 = 36 ticks (10°), 3 = 72 ticks (5°).
fn render_resolution_ticks(&self, area: Rect, buf: &mut Buffer, state: &PortalClockState) {
    let cx = area.x as f32 + area.width as f32 / 2.0;
    let cy = area.y as f32 + area.height as f32 / 2.0;
    let radius = (area.width.min(area.height) / 2).saturating_sub(1) as f32;

    let tick_count: u16 = match state.resolution_level {
        0 => 6,
        1 => 12,
        2 => 36,
        _ => 72,
    };
    let tick_char = match state.resolution_level {
        0 => "█",
        1 => "▮",
        2 => "│",
        _ => "·",
    };

    for i in 0..tick_count {
        let angle = i as f32 * std::f32::consts::TAU / tick_count as f32 - std::f32::consts::FRAC_PI_2;
        let px = (cx + radius * angle.cos()).round() as u16;
        let py = (cy + radius * angle.sin()).round() as u16;
        if px >= area.x && px < area.x + area.width && py >= area.y && py < area.y + area.height {
            let style = ratatui::style::Style::default().fg(ratatui::style::Color::DarkGray);
            buf.set_string(px, py, tick_char, style);
        }
    }
}
```

- [ ] **Step 2: Call from render() FIRST (before other elements)**

At the start of the ring drawing section:

```rust
    self.render_resolution_ticks(area, buf, &state);
```

- [ ] **Step 3: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(portal): resolution-aware tick marks on CosmicClockPlugin (6/12/36/72-fold)"
```

---

### Task 11: MiniClockPlugin — Walk Mode + Element Colour

**Files:**
- Modify: `epi-cli/src/portal/plugins/mini_clock.rs`

- [ ] **Step 1: Add walk mode indicator to render()**

In the MiniClockPlugin's `render()` method, after the tick12 display, add:

```rust
    // Walk mode indicator
    let walk_indicator = match state.walk_mode {
        0 => ("·", ratatui::style::Color::Green),      // GROUND / EARTH
        1 => ("→", ratatui::style::Color::Red),         // TORUS / FIRE
        2 => ("↕", ratatui::style::Color::Blue),        // FIBER / WATER
        3 => ("⟳", ratatui::style::Color::White),       // SPANDA / AIR
        _ => ("?", ratatui::style::Color::Gray),
    };
    let walk_text = format!(" {} λ={:.2}", walk_indicator.0, state.bifurcation_param);
    buf.set_string(
        area.x + 1,
        area.y + area.height.saturating_sub(2),
        &walk_text,
        ratatui::style::Style::default().fg(walk_indicator.1),
    );
```

- [ ] **Step 2: Colour the active tick by walk mode element**

In the existing tick rendering loop, modify the active tick's style:

```rust
    // For the active tick (tick12 == current_tick):
    let tick_color = match state.walk_mode {
        0 => ratatui::style::Color::Green,   // EARTH
        1 => ratatui::style::Color::Red,     // FIRE
        2 => ratatui::style::Color::Blue,    // WATER
        3 => ratatui::style::Color::White,   // AIR
        _ => ratatui::style::Color::Yellow,
    };
```

- [ ] **Step 3: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/mini_clock.rs
git commit -m "feat(portal): walk-mode indicator + element colouring on MiniClockPlugin"
```

---

### Task 12: M4OraclePlugin — Post-Cast Hopf Display

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

- [ ] **Step 1: Enhance the post-cast display in M4OraclePlugin**

In the M4OraclePlugin's cast result display section (where `last_cast` is shown), append the Hopf dynamics info:

```rust
    // After the hexagram / line display, add Hopf dynamics info:
    if let Some(clock) = &self.clock_state {
        let s = clock.lock().unwrap();
        let walk_name = match s.walk_mode {
            0 => "GROUND",
            1 => "TORUS",
            2 => "FIBER",
            3 => "SPANDA",
            _ => "?",
        };
        let hopf_line = format!(
            "Walk: {} | λ={:.2} | Res: {}-fold | Codon: {} | QL: {}",
            walk_name,
            s.bifurcation_param,
            match s.resolution_level { 0 => 6, 1 => 12, 2 => 36, _ => 72 },
            s.active_codon_idx,
            s.ql_position,
        );
        // Render hopf_line at appropriate position in the cast output area
    }
```

- [ ] **Step 2: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(portal): show walk_mode, λ, resolution, codon after oracle cast"
```

---

### Task 13: M2VibrationalPlugin — Active Cell + Resolution Dimming

**Files:**
- Modify: `epi-cli/src/portal/plugins/m2.rs`

- [ ] **Step 1: Highlight active (tick12, ql) cell in the 72-fold grid**

In the cell rendering loop of M2VibrationalPlugin's `render()`, add logic to highlight the active cell:

```rust
    // Read Hopf state for highlighting
    let (active_tick, active_ql, res_level) = if let Some(ref clock) = self.shared_clock {
        let s = clock.lock().unwrap();
        (s.tick12 as usize, s.ql_position as usize, s.resolution_level)
    } else {
        (0, 0, 0)
    };

    // In the cell rendering loop:
    for tick in 0..12 {
        for ql in 0..6 {
            let is_active = tick == active_tick && ql == active_ql;

            // Dim cells outside current resolution level
            let half_decan_idx = tick * 6 + ql;
            let is_visible = match res_level {
                0 => ql < 6 && tick < 6,        // 6-fold: only first 6 positions
                1 => true,                        // 12-fold: all 72 visible
                2 => true,                        // 36-fold: all visible, decans highlighted
                _ => true,                        // 72-fold: full resolution
            };

            let style = if is_active {
                ratatui::style::Style::default()
                    .fg(ratatui::style::Color::Black)
                    .bg(ratatui::style::Color::Yellow)
            } else if !is_visible {
                ratatui::style::Style::default().fg(ratatui::style::Color::DarkGray)
            } else {
                // existing cell style
                cell_style
            };
        }
    }
```

- [ ] **Step 2: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/m2.rs
git commit -m "feat(portal): active cell highlighting + resolution dimming in M2VibrationalPlugin"
```

---

### Task 14: M4SpinePlugin — λ-Modulated Chakra Glow

**Files:**
- Modify: `epi-cli/src/portal/plugins/spine.rs`

- [ ] **Step 1: Modulate chakra activation by bifurcation parameter**

In M4SpinePlugin's tick/sync handler where chakra_levels are read from SharedClockState, add λ modulation:

```rust
    // Read bifurcation parameter for glow intensity
    let lambda = state.bifurcation_param;

    // Modulate chakra levels: higher λ = more chakras activated
    // Each chakra's display intensity = base_level * (0.3 + 0.7 * λ)
    // At λ=0 (Akasha), all chakras show at 30% base. At λ=1, full intensity.
    for i in 0..8 {
        let base = state.chakra_levels[i];
        self.chakra_levels[i] = base * (0.3 + 0.7 * lambda);
    }
```

- [ ] **Step 2: Build and commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build
git add epi-cli/src/portal/plugins/spine.rs
git commit -m "feat(portal): λ-modulated chakra glow intensity in M4SpinePlugin"
```

---

## POST-MERGE

### Task 15: Full Build + Test Verification

- [ ] **Step 1: Run full Rust test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test 2>&1 | tail -15`
Expected: All tests pass

- [ ] **Step 2: Run full C test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test 2>&1 | tail -10`
Expected: `=== All test suites passed ===` including new walk mode tests

- [ ] **Step 3: Manual TUI verification**

Follow `docs/plans/CLOCK-AND-NARA-SPECS/TESTING-PROTOCOL.md`:
```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli"
cargo build && ./target/debug/epi portal --tab structural
```

Verify:
- [ ] Planetary glyphs visible on CosmicClock ring
- [ ] Aspect lines drawn between aspected planets (after kairos sync)
- [ ] Resolution tick marks at 6-fold (before any oracle cast)
- [ ] Switch to Tab 1, cast oracle (`c` → `y`)
- [ ] Walk mode + λ shown in oracle output
- [ ] MiniClock shows walk-mode indicator + element colour
- [ ] Switch to Tab 2: micro-orbit dot visible on ring
- [ ] M2 matrix shows highlighted active cell
- [ ] Spine chakras respond to cast (glow modulated by λ)

- [ ] **Step 4: Final commit with all changes verified**

```bash
git add -A
git commit -m "feat: Hopf dynamics + planetary field — full integration verified"
```
