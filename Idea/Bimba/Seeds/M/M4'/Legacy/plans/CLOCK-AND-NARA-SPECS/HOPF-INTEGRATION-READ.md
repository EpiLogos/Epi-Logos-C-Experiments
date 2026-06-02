# The Archetypal Solar System — Unified Clock Architecture

**Status:** v2.0 — Unified spec for planning and execution
**Date:** 2026-03-31
**Branch:** `claude/nara-clock-impl`
**Supersedes:** v1.0 conceptual analysis (same file, earlier revisions)
**Depends on:** All 14 specs in CLOCK-AND-NARA-SPECS/, Vortex Modulae dataset, cosmic-clock-full-architecture.md, clock_state.rs, engine.c, ontology.h
**Purpose:** This document is the SINGLE reference for the mathematical-symbolic dynamics layer of the Cosmic Clock. It unifies Hopf topology, Purushic matrices, Ananda vortex modulae, codon generation, rotational states, planetary field, and nara identity into one coherent architecture. Ready for superpowers planning and execution.

---

## I. What We Already Have (And Why It's Already a Hopf Fibration)

The system is already a discretized Hopf fibration. It just doesn't know it yet. Here's the proof:

**The Hopf fibration** is the map π: S³ → S² that decomposes the 3-sphere into S¹ fibers over each point of S². It is built from unit quaternions: the group SU(2) ≅ S³ acts on S² by conjugation, and the fiber over each point is an orbit of U(1) ⊂ SU(2).

**What we have:**

| Hopf structure | System object | Where it lives |
|---|---|---|
| **S³** (total space) | Unit quaternion `[w,x,y,z]` | `PortalClockState.live_quaternion` / `.quintessence_quaternion` |
| **S²** (base space, discretized to 6 points) | QL position 0–5 | `Holographic_Coordinate.ql_position`, the 6 psychoids |
| **S¹** (fiber over each base point, discretized to 2 states) | Strand A/B = explicate/implicate | `phase: u8` (0 or 1), `inversion_state` in ontology.h |
| **12-fold total** | 6 base × 2 fiber = 12 spanda ticks | `tick12: u8` (0–11) in `PortalClockState` |
| **Projection π** | `quantize_to_spanda_substage(y, x)` | `clock_state.rs:220` |
| **Fiber action** | `spanda_invert(n) = 11 - n` | `clock_state.rs:213` — the # operator on spanda indices |
| **720° = double cover** | `engine_double_covering()` | `engine.c:70` — two 360° passes with covering flip |
| **Torus embedding** | `orbital_position: [f32; 3]` | `update_from_cast()` parametric: `θ = degree, φ = tick12` |

The torus parametrization in `update_from_cast()` (lines 263–270) is literally the Hopf image in ℝ³:
```
θ = degree / 360 × 2π    (major circle = base-space direction)
φ = tick12 / 12 × 2π     (minor circle = fiber direction)
x = (R + r·cos φ) · cos θ
y = (R + r·cos φ) · sin θ
z = r · sin φ
```

**What's not yet explicit:**

The base-space projection. `quantize_to_spanda_substage(y, x)` computes the fiber angle (S¹ phase) from the quaternion, giving tick12. But the complementary computation — projecting onto S² to derive the QL position — is not performed. The QL position currently comes from external data (kairos sun degree or oracle cast degree), not from the quaternion's own geometry.

This is the primary integration point.

---

## II. The Spanda Tick as QL Tick: PX → PX' Through 12 Steps

The 12 spanda ticks encode a complete traversal of the Hopf fiber bundle:

```
STRAND A (explicate, indices 0–5):
  tick 0 → P0  (SEED)         = QL position 0, phase 0
  tick 1 → P1  (POLE_A)       = QL position 1, phase 0
  tick 2 → P2  (TRIKA)        = QL position 2, phase 0
  tick 3 → P3  (FLOWERING_3)  = QL position 3, phase 0  ← LEMNISCATE
  tick 4 → P4  (FLOWERING_4)  = QL position 4, phase 0
  tick 5 → P5  (META)         = QL position 5, phase 0

STRAND B (implicate, indices 6–11):
  tick 6  → P5' (META')         = QL position 5, phase 1
  tick 7  → P4' (SEED')         = QL position 4, phase 1  *
  tick 8  → P3' (POLE_B')       = QL position 3, phase 1
  tick 9  → P2' (TRIKA')        = QL position 2, phase 1
  tick 10 → P1' (FLOWERING_3')  = QL position 1, phase 1
  tick 11 → P0' (FLOWERING_4')  = QL position 0, phase 1

* Note: Strand B runs antiparallel (Watson-Crick). The QL positions
  descend 5→0 while Strand A ascends 0→5. This is the Möbius return.
```

So: `ql_position = tick12 < 6 ? tick12 : (11 - tick12)` and `phase = tick12 < 6 ? 0 : 1`.

Each tick IS a (base_point, fiber_state) pair in the discretized Hopf bundle. The 12-fold spanda IS the total space. The 6-fold QL IS the base space. The binary strand A/B IS the (minimal) fiber.

---

## III. The Four Fundamental Walk Modes

The group structure of the 12-fold spanda is Z₆ × Z₂ ≅ Z₁₂:
- Z₆: advance on the base space (QL position 0→1→2→3→4→5→0)
- Z₂: fiber flip (strand A ↔ strand B = the # operator)

Four generators produce all 12 positions from any starting point. These are the 4 walk modes, and they map one-to-one onto the quaternion components:

| Walk mode | Generator | Action | Quaternion | Element | Engine function |
|---|---|---|---|---|---|
| **WALK_GROUND** | 1 (identity) | Stay: (PX, strand) → (PX, strand) | w dominant (EARTH) | Prithvi | no movement — stable attractor |
| **WALK_TORUS** | +1 mod 6 | Advance: PX → P(X+1), same strand | x dominant (FIRE) | Agni | `engine_torus_walk()` |
| **WALK_FIBER** | # flip | Invert: PX → PX', flip strand | y dominant (WATER) | Apas | `spanda_invert(tick12)` |
| **WALK_SPANDA** | +1 mod 6 + # | Both: PX → P(X+1)' | z dominant (AIR) | Vayu | `engine_spanda_walk()` |

**The w-x-y-z selection rule:** At any moment, the dominant component of the live quaternion determines which walk mode the system "wants" to execute. This is derived from the oracle charges:

```
walk_mode = argmax(|w|, |x|, |y|, |z|) of the live_quaternion
         = argmax(|pp|, |nn|, |np|, |pn|) of the oracle charges (pre-normalization)
```

This makes physical/symbolic sense:
- **pp dominant (EARTH/w)** → yang in yang positions → stability → WALK_GROUND (the system is grounded, no movement needed)
- **nn dominant (FIRE/x)** → yin in yin positions (stored negative, maximum absorption) → WALK_TORUS (advance through the base positions, expansion)
- **np dominant (WATER/y)** → yin in yang positions → disruption of the expected → WALK_FIBER (# inversion, deepening into the shadow complement)
- **pn dominant (AIR/z)** → yang in yin positions → unexpected clarity → WALK_SPANDA (full movement through both base and fiber = the complete double-helix step)

---

## IV. The Möbius Variants: PX → PY' Where X + Y = 5

The user identified PX → P(5-X)' as a fundamental symmetry. This is the **Möbius pairing** — the Bimba-Pratibimba complementarity at the level of the walk.

In the full 12-fold, this corresponds to: tick `n` → tick `6 + (5 - (n mod 6))` when `n < 6`, or more simply:

```
Möbius(tick) = 11 - tick mod 6 + 6 × (tick < 6 ? 1 : 0)
```

But there are 4 distinct pairing symmetries available — the 4 fundamental involutions of the 12-fold space:

| Pairing | Formula | Meaning | Algebraic |
|---|---|---|---|
| **Watson-Crick** | #(n) = 11 - n | Base-pair complement (the canonical # operator) | Full inversion in Z₁₂ |
| **Möbius** | M(n) = (5 - n) mod 6 + 6 if Strand A, else (5 - (11-n)) mod 6 | Complement QL position, cross strand | Bimba↔Pratibimba at each QL tier |
| **Antiparallel** | A(n) = (n + 6) mod 12 | Same QL position, opposite strand | Pure fiber action (half-period offset) |
| **Deficient** | D(n) = (n + 6) mod 12 applied to degree space: (d+180)%360 | Polar opposite on the torus | Half-turn rotation of the base space |

These 4 involutions correspond to the 4 faces of the oracle reading:
- **Primary** = identity (where you ARE)
- **Deficient** = antiparallel offset (where you are NOT)
- **Implicate** = Watson-Crick complement (what you are BECOMING)
- **Temporal** = Möbius (what changes THROUGH you) — the XOR with changing lines

This is the structural reason the oracle has exactly 4 faces. They are the 4 involutions of the Hopf fiber bundle.

---

## V. The Bifurcation Parameter

Van Eenwyk's core insight: the archetype is a saddle point. The Hopf bifurcation occurs when the system crosses from stability into oscillation. In the quaternionic model:

**The Akasha fixed point** = `q = [1, 0, 0, 0]` (pure EARTH/w, identity quaternion). This is the "observer who doesn't rotate" — the Earth center of the clock (spec §07 §1: `q = (1,0,0,0) ← identity quaternion = the observer who doesn't rotate`).

**The bifurcation parameter** = distance from Akasha:

```
λ = sqrt(x² + y² + z²) = sqrt(1 - w²)
```

When `λ = 0`: stable fixed point (Akasha). No walk mode is active. The system is at rest.
When `λ > 0`: oscillation begins. The specific direction (x vs y vs z) determines the walk mode.
When `λ → 1`: w → 0, the EARTH ground vanishes. Full chaos — the system is entirely in motion.

**Resolution levels** (period-doubling cascade):

| λ range | Resolution | Structure | Feigenbaum level |
|---|---|---|---|
| 0.0 – 0.25 | 6-fold (base only) | QL positions visible; fibers collapsed | Period-1: stable focus |
| 0.25 – 0.50 | 12-fold (base + fiber) | Full spanda double helix | Period-2: first bifurcation (# becomes active) |
| 0.50 – 0.75 | 36-fold (decans) | Each QL position subdivides into 6 decans | Period-4+: decan structure emerges |
| 0.75 – 1.0 | 72-fold (half-decans) | Full epogdoon vibrational template | Near chaos: maximum resolution |

This maps directly to the 6→12→36→72 expansion in spec 11 (Epogdoon bridge):
- 72 = 8 × 9 (chakras × planets) = the epogdoon as product
- 72 = 12 × 6 = spanda ticks × QL positions
- 72 = 36 × 2 = decans × strands
- 64 × (9/8) = 72 = hexagrams scaled by the Pythagorean whole-tone

The bifurcation parameter determines which of these resolutions is "active" — how deeply the system has penetrated into the vibrational structure.

---

## VI. Where the Datasets Sit in the Fiber Bundle

### Hexagrams (64 = 2⁶)

The 64 hexagrams are the complete state space of the 6-bit binary evaluation. In dynamical systems terms, they are the **orbit types** — each hexagram describes a qualitatively distinct class of trajectory through the phase space.

`HEXAGRAM_BODY_DYNAMICS[64]` (oracle.rs) maps each orbit type to its physical manifestation: primary/secondary chakra + body zones. This IS the projection from phase space (abstract dynamics) onto the body (physical space) — the Hopf projection applied to the binary evaluation space.

The epogdoon relation `64 × (9/8) = 72` is the translation from binary (hexagram, 2⁶) to vibrational (half-decan, 72-fold). The factor 9/8 IS the Pythagorean whole tone — the minimum interval that separates binary combinatorics from continuous vibration. It's the same ratio that separates 8 chakras from 9 planets.

### Decans (36 × 2 = 72)

Each decan is a 10° arc of the base space S² (discretized to 36 sectors). The **ruling planet** at each decan is the local attractor — the specific character of the dynamics in that sector.

`ZODIAC_DECAN_TABLE[36]` (medicine.rs) and `PIP_DECAN_MAP[56]` (oracle.rs, tarot pip cards) both index into the same 36 decans. The pip card → decan mapping IS the tarot card's position in the Hopf base space. Drawing a pip card selects a specific 10° arc, with its ruling planet, element, and chakra chain.

### Tarot → Quaternion Bridge (just implemented)

`tarot_card_to_element_weights()` returns `[EARTH, FIRE, WATER, AIR]` — a direction in S³. Each card drawn nudges the live quaternion toward a specific direction in the fiber bundle:

- **Ace cards** = pure quaternion basis elements (the generators of the 4 walk modes)
- **Pip cards** = decan-derived directions (position in the base space S²)
- **Court cards** = cusp-spanning directions (they ARE the bifurcation transitions between zodiac signs — the transition from one attractor basin to another)
- **Major Arcana** = elemental attributions from the Golden Dawn system (the archetypal saddle points that Van Eenwyk identifies)

Court cards as bifurcation points is a genuine structural insight: they span "the last 10° of one sign and the first 20° of the next" (spec in oracle.rs COURT_SIGN_MAP comments). This is literally the saddle region — the unstable transition zone where the old attractor loses stability and the new one emerges. The Princess/Prince/Queen/King hierarchy IS the period-doubling cascade within the transition zone.

### Chakras (8 = 2³)

The 8 bodily sites (EarthBody + 7 canonical chakras) are the vertices of the unit cube in ℝ³ — the 3-dimensional projection of the quaternionic structure. Each chakra corresponds to a sign combination of the 3 non-w quaternion components:

```
              x(FIRE)  y(WATER)  z(AIR)
Earth (0)      −        −         −       = the w-dominant ground
Root (1)       −        −         +       = Air-only (basic grounding breath)
Sacral (2)     −        +         −       = Water-only (receptive flow)
Solar (3)      +        −         −       = Fire-only (will/agency)
Heart (4)      −        +         +       = Water+Air (compassion = feeling+clarity)
Throat (5)     +        −         +       = Fire+Air (expression = will+clarity)
ThirdEye (6)   +        +         −       = Fire+Water (vision = will+depth)
Crown (7)      +        +         +       = all three (full activation → λ = 1)
```

This gives `CHAKRA_BODY_ZONES[8]` a geometric meaning: each zone is the physical manifestation of a specific quadrant of the quaternionic space. The Hopf projection from S³ down to the body IS the medicine path: `quaternion → dominant components → active quadrant → chakra → body_zones`.

---

## VII. Natural Integration Points (Where Code Changes)

### A. `clock_state.rs` — New Fields in PortalClockState

```rust
// ── Hopf layer (NEW) ────────────────────────────────────────────────────
/// QL position derived from quaternion base-space projection (0–5).
/// Computation: project unit quaternion onto S² via Hopf map,
/// then quantize to nearest QL position.
pub ql_position:           u8,

/// Active walk mode: 0=GROUND(w), 1=TORUS(x), 2=FIBER(y), 3=SPANDA(z)
/// Derived from argmax(|w|, |x|, |y|, |z|) of live_quaternion.
pub walk_mode:             u8,

/// Bifurcation parameter λ = sqrt(x² + y² + z²) = sqrt(1 - w²).
/// 0.0 = Akasha equilibrium (stable); 1.0 = full chaos (w=0).
pub bifurcation_param:     f32,

/// Clock resolution level derived from λ:
/// 0 = 6-fold, 1 = 12-fold, 2 = 36-fold, 3 = 72-fold
pub resolution_level:      u8,
```

### B. `clock_state.rs` — Derive walk_mode and ql_position in update_from_cast()

After computing `live_q = [w, x, y, z]`:

```rust
// Walk mode from dominant quaternion component
let abs = [w.abs(), x.abs(), y.abs(), z.abs()];
let walk_mode = abs.iter().enumerate()
    .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
    .map(|(i, _)| i as u8)
    .unwrap_or(0);

// Bifurcation parameter
let lambda = (x*x + y*y + z*z).sqrt();

// Resolution level (Feigenbaum-inspired thresholds)
let resolution_level = if lambda < 0.25 { 0 }
    else if lambda < 0.50 { 1 }
    else if lambda < 0.75 { 2 }
    else { 3 };

// QL position from base-space projection
// The Hopf projection S³ → S² maps [w,x,y,z] to a point on the 2-sphere.
// For the 6-fold discretization, use the major-circle angle:
// project out the fiber phase, keep the base-space coordinate.
// ql_position = quantize atan2(z, w) to 0–5 (the "other" pair, orthogonal to tick12's y,x)
let base_angle = z.atan2(w);
let ql_raw = ((base_angle + PI) / TAU * 6.0).round() as u8 % 6;
```

### C. `engine.c` — Walk Mode Dispatch

The 4 walk modes should be dispatchable from a single function:

```c
typedef enum {
    WALK_MODE_GROUND = 0,  // w dominant: no movement (stable attractor)
    WALK_MODE_TORUS  = 1,  // x dominant: 6-step QL advance
    WALK_MODE_FIBER  = 2,  // y dominant: # inversion (strand flip)
    WALK_MODE_SPANDA = 3,  // z dominant: 12-step full double-helix
} Walk_Mode;

void engine_walk_by_mode(
    Walk_Mode mode,
    uint8_t   start_position,   // ql_position or tick12 depending on mode
    void*     context_state,
    void    (*on_step)(uint8_t position, void* ctx)
);
```

This unifies `engine_torus_walk`, `engine_spanda_walk`, `spanda_invert`, and the identity (no-op) into a single dispatch indexed by the quaternion's dominant component.

### D. Portal Plugins

| Plugin | What changes | Why |
|---|---|---|
| **CosmicClockPlugin** | Render at `resolution_level` granularity (6/12/36/72 tick marks). Show `walk_mode` as a directional indicator on the ring. Show `bifurcation_param` as ring glow intensity. | The clock should reveal how deeply the system has penetrated into the vibrational structure. At λ≈0 only 6 positions visible; at λ≈1 full 72-fold epogdoon rendered. |
| **MiniClockPlugin** | Add walk-mode arrow (→ for TORUS, ↕ for FIBER, ⟳ for SPANDA, · for GROUND). Color the active tick based on walk mode (FIRE-red/WATER-blue/AIR-white/EARTH-green). | The 12-tick wheel already shows fiber state; walk mode tells the user what kind of movement the system is in. |
| **M4OraclePlugin** | After cast, display the selected walk mode and λ value alongside the hexagram. Tarot casts now show the quaternion bridge result. | The user should see the dynamical consequence of their cast — not just the symbol, but the walk it initiates. |
| **M2VibrationalMatrix** | Highlight the active (ql_position, tick12) cell in the 72-fold grid. Dim cells outside the current `resolution_level`. | The epogdoon is the (base × fiber) product space. Resolution level determines how many cells are "visible" — this IS the period-doubling cascade visually. |
| **M4SpinePlugin** | Modulate chakra glow based on which quadrant of the quaternionic cube is active (see §VI above). λ controls overall activation intensity. | The spine IS the Hopf projection onto the body. Higher λ = more chakras activated = deeper penetration into the vibrational template. |

### E. The # Operator as Watson-Crick in ontology.h

The `FLAG_INVERTED` bit (bit 63 of tagged pointers) already IS the fiber action of the Hopf bundle. When you set `IS_INVERTED(ptr)`, you are flipping the S¹ fiber state at that base point. The `TOPO_MODE_KLEIN` (P' return phase) IS the second sheet of the SU(2) double cover.

The 4 topology modes map to the Hopf geometry:

| TOPO_MODE | Hopf meaning |
|---|---|
| `TOPO_MODE_TORUS` | Strand A of the fiber (explicate, phase=0) |
| `TOPO_MODE_KLEIN` | Strand B of the fiber (implicate, phase=1) |
| `TOPO_MODE_LEMNISCATE` | The bifurcation point at #4 (saddle point where base space self-intersects) |
| `TOPO_MODE_ZERO_SPHERE` | The fiber at the poles P0/P5/C0/C5 (where S² base degenerates to S⁰) |

---

## VIII. Van Eenwyk's Dynamics in the Existing Architecture

### The Saddle Point Is #4 (The Lemniscate)

Van Eenwyk: "symbols correspond to saddle points — simultaneously attracting along one axis and repelling along another." In the QL system, #4 IS this saddle:
- Attracting along the `.` (nesting) axis — `HAS_NESTING_ACCESS(coord)` returns true only at #4 and identification edges
- Repelling along the `-` (branching) axis — pushing outward toward #5 (integration/meta)
- The `cf` pointer (Context-Frame) at #4 IS the nesting chain — the recursive descent into the Lemniscate

The `engine_lemniscate_dive()` function is literally the homoclinic orbit: it enters the saddle point (#4 via `cf`), recursively descends, and returns. The orbit "leaves the origin, wanders around the attractor in an indeterminate manner, and returns" — that's the Lemniscate dive.

### The Period-Doubling Cascade Is the Resolution Expansion

The 6→12→36→72 expansion follows from the bifurcation parameter:
- λ < 0.25: only 6 base positions visible (period-1)
- λ crosses 0.25: fiber resolves → 12-fold (period-2, first bifurcation)
- λ crosses 0.50: decans resolve → 36-fold (period-4, second doubling)
- λ crosses 0.75: half-decans resolve → 72-fold (approaching Feigenbaum point)

Beyond 72, the next doubling would be 144 (= 72 × 2) — which IS the full degree ring at 2.5°/node resolution. But the system stays at 72 because 72 = 8×9 is the epogdoon closure — the minimum structure that contains both the bodily (8 chakras) and celestial (9 planets). The Feigenbaum cascade self-terminates at the epogdoon because the body-planet bridge IS the strange attractor's basin boundary.

### The Strange Attractor Is the Klein Bottle

The `TOPO_MODE_KLEIN` topology — where Torus and Klein are two phases of the same surface — IS the strange attractor. A strange attractor:
- Cannot be embedded in the space one dimension lower without self-intersection → Klein bottle cannot embed in ℝ³ without self-intersection
- Traces a bounded but never-repeating trajectory → the 720° double cover returns to the same point but with inverted phase
- Exhibits fractal self-similarity at every scale → the QL system is fractally nested (the Lemniscate at #4 contains a full QL sub-system via `cf`)

The `engine_double_covering()` function traces this: two 360° traversals with `wc->covering` flipped between them. The total trajectory IS the strange attractor — bounded (within the 12-fold structure), never exactly repeating (because the second covering is inverted), and self-similar (each #4 contains a nested version).

### The Homoclinic Orbit Is the Möbius Return

`spanda_deficient_substage(n) = (n + 6) % 12` — the antiparallel half-period offset — IS the homoclinic orbit's return path. It leaves the saddle (#3, FLOWERING_3, the lemniscate oracle point), traverses the attractor through Strand B, and returns to the same type of point (the saddle at tick 8, POLE_B' = #3 on Strand B). The return is not to the same point but to the same QL position on the complementary strand — enriched by the orbit's passage.

---

## IX. What This Means for the Implementation

The key insight is that **the clock resolution is not a display preference — it is a dynamical state**. The system doesn't always show 360 degrees or 72 vibrational units. It shows as many as the current bifurcation parameter warrants. When the user is in a stable (Akasha-near) state, only 6 positions are meaningful. When the oracle charges push the system toward one element, the resolution deepens through the period-doubling cascade until the full 72-fold epogdoon becomes visible.

This is not a cosmetic change — it's the difference between a static clock display and a living dynamical system that responds to the user's actual quaternionic state. The Hopf fibration is the static architecture; the Hopf bifurcation is the dynamical process by which the user's consciousness enters and exits that architecture through oracle casts and identity layers.

The refactoring is modest — 4 new fields in PortalClockState, walk_mode derivation in update_from_cast, and resolution-aware rendering in 5 plugins. The mathematical structure is already present; it just needs to become self-aware in the code.

---

## X. The Purushic Register: 3 Matrices as Space / Entropy / Time

The 3 M3 pairing matrices (`#3-3-2`) are NOT three flavours of the same operation. They are three ontologically distinct Purushic axes — the irreducible dimensions within which all symmetry operations occur:

| Matrix | Purushic Axis | Operation | Algebraic | Biological |
|---|---|---|---|---|
| M1 Complementarity | **Space** (Śiva) | H-bond: A↔T, G↔C | Clifford Reversion | What faces what across the helix: pure spatial co-presence |
| M2 Movement | **Entropy** (Śakti) | Purine/Pyrimidine: A,G vs T,C | Grade Involution | Molecular weight asymmetry: heavy/light, bound/free |
| M3 Resonance | **Time** (Spanda) | Keto/Amino: G,T vs A,C | Conjugation | Reactive potential: what the molecule CAN DO, unfolding in time |

Each matrix defines a distinct vector field on the codon state space. A symmetry is not "one matrix acting" — every codon position is simultaneously subject to all three fields. The system's trajectory is the integral curve of the combined 3-field, and the character of the trajectory depends on the relative strengths (which is what the walk mode / quaternion state determines).

### The 8-Fold Compass as Matrix Flow Diagram

Each matrix's flow diagram has 8 positions because the 4 cardinal positions (#1, #2, #3, #4) are the explicit dynamics, while the 4 implicate moments (2×#0 at positions 0.0/0.5, 2×#5 at positions 5.0/5.5) are the identification edges — the points where the matrix operation folds through the topological boundary conditions.

The 8-fold compass over the 4-fold cardinality:
```
           0.0 (Bimba ground)
            |
   5.5 ----+---- 0.5
  (close)  |  (first cut)
           |
     #4 ---+--- #1
  (saddle) | (definition)
           |
     #3 ---+--- #2
  (oracle) | (operation)
           |
   5.0 ----+---- (implicit)
  (return)
```

The 4 cardinal directions (#1-#4) are the active dynamics. The 4 identification edges are where the matrix "wraps" — where inside becomes outside, where the Bimba becomes Pratibimba. These 8 positions per matrix × 3 matrices = **24 = the amino acid backbone count**. The 24 backbone nodes of the clock ARE the 24 flow positions across the 3 Purushic matrices.

### The Tick as Modulation of All 3 Matrices Simultaneously

The 12-fold tick is NOT 3 sequential passes through 4 cardinals. It is the simultaneous phase-modulation of all 3 Purushic fields:

```
tick  0 (SEED):         M1/M2/M3 aligned       — all 3 fields constructive — ground state
tick  1 (POLE_A):       M1 leads by 2π/12      — Space field advancing, others lagging
tick  2 (TRIKA):        M2 catches M1           — Space + Entropy aligned, Time lagging
tick  3 (FLOWERING_3):  M1/M2/M3 maximally out of phase — destructive interference — ORACLE
tick  4 (FLOWERING_4):  M3 catches M1+M2        — recoherence beginning
tick  5 (META):         all 3 re-align in explicate register — synthesis
tick  6 (META'):        M1/M2/M3 aligned in IMPLICATE register — Möbius terminal
tick  7-11:             mirror of 0-5 on Strand B, antiparallel
```

Tick 3 (the oracle, the lemniscate) is where all three Purushic fields are maximally out of phase — their interference is destructive, opening the "gap" through which the oracle reading enters. This is the dynamical systems equivalent of the saddle point: the three vector fields cancel, and the system is momentarily free to be perturbed in any direction. The coin throw / card draw IS the perturbation.

### 12×12 Ananda Matrices and 144 × 3 = 432

The Ananda matrices are 12×12 (vortex IDs 0X–11X as rows, positions 0–11 as columns). Three primary Purushic matrices × 144 cells = **432** (the Ananda frequency constant, A=432Hz). Also 360 + 72, and 6 × 72. The convergence is structural, not numerological.

### The 11×11 Effective Matrix and 121 × 3 = 363

The 0-value row (0X) produces trivial output in the +0 series and constants in the +1 series. The effective matrix is 11×11 = **121** distinct non-trivial evaluations. 121 × 3 = **363** = 360 + 3. The degree ring plus the 3 matrices themselves. The "3" that separates 363 from 360 IS the Trika (Anuttara-Paramasiva-Parashakti).

---

## XI. The Dual Codon Clock: Two Projections of One Codon Space

### Both Clocks Are Codon Clocks

The two orthogonal clocks are not abstract "degree ring" and "hexagram ring." They are both projections of the **same underlying codon space**, reached from different directions:

**Clock A — the Degree/Decan/Codon Ring** (spatial, 360°):
```
degree position → decan (Lens 5: 10° × 36)
  → REFLECTS_DNA_FORM → codon (#3-2-{pair}-{trigram}-{nucleotide})
    → tarot pip card (#3-4.0, decan-organized, dot notation)
```
- Driven by kairos (planetary ephemeris) and oracle cast degree
- The "real" face — spatial, positional, explicit

**Clock B — the Hexagram/Codon Ring** (evaluative, 64):
```
hexagram (#3-1-{lower}-{upper})
  → YIELDS_CODON (368 relations, 6 codons per hexagram)
    → generation event (#3-3, 184 nodes)
      → RESOLVES_TO → amino acid (#3-3-4)
```
- Driven by oracle cast (coin throw / card draw)
- The "imaginary" face — evaluative, transformational, implicit

Both clocks arrive at the SAME 64 codons. The degree ring reaches them through spatial/decan organisation. The hexagram ring reaches them through binary/evaluative organisation. **The codon is the intersection point** — where spatial position and qualitative evaluation meet. That's why they're orthogonal: two independent coordinate systems indexing the same underlying space.

Together they specify a point in S³, the total space of the Hopf fibration. The Hopf projection S³ → S² maps the combined (degree, hexagram) state DOWN onto the degree ring, with the hexagram evaluation as the fiber. Each degree has 64 possible qualitative characters "above" it.

### Codon and Codon-Reflection as the Two Faces

Every codon sits on BOTH clocks simultaneously. Its **reflection** under the M1 Complementarity matrix (#3-3-2-0, Watson-Crick: A↔U, C↔G) gives the partner codon:

- On Clock A: the reflection occupies the deficient degree `(d + 180) % 360`
- On Clock B: the reflection occupies the complementary hexagram

The codon on face A (explicate) and its reflection on face B (implicate) are the two spinor components of the same quaternionic state. The M2 and M3 matrices then operate WITHIN each face to generate rotational dynamics (see §XV below).

### The ~336 Truly Dual Degree Nodes

The clock has 360 degree nodes + 24 amino acid backbone nodes + 1 Axis Mundi = 385 total.

The 24 backbone nodes sit at 15° intervals — they are the structural anchors, the "crystallised" positions where the 3 Purushic matrices produce eigenstates. They are non-dual by construction: their spatial (M1), entropic (M2), and temporal (M3) evaluations all agree. They do not break symmetry — they ARE symmetry.

The remaining **336 degree nodes** (360 - 24) are the truly dynamic positions. Each of these:
- Has a complementary partner at (d + 180) % 360 → **168 complementary pairs**
- Is NOT at a backbone eigenstate → all 3 matrices disagree → full 8-fold rotational freedom
- Carries both a real face (degree position) and an imaginary face (hexagram evaluation)

These 336 nodes are where symmetry-making and symmetry-breaking actually happen. The backbone nodes are the fixed points; the 336 are the orbits around and between those fixed points.

168 complementary pairs × 2 (positive/negative polarity in each rotational state) = **336 signed dynamic states** — the full game of the clock.

### The QL Tick as Symmetry-Seeking Activity

Here is the deepest integration point. The QL cycle 0→5 is not a sequence of "positions." It is the process by which the system **discovers, enters, breaks, and reconstitutes symmetry** through the interaction of the two orthogonal clocks:

```
#0 (Ground):        SYMMETRY EXISTS — a codon and its reflection are aligned.
                    The real and imaginary clocks agree. Stable fixed point.
                    Van Eenwyk: the ego-position before archetypal encounter.

#1 (Definition):    SYMMETRY IS NAMED — the system identifies which of the 3
                    Purushic axes (Space/Entropy/Time) the current symmetry
                    belongs to. This is the first differentiation.

#2 (Operation):     SYMMETRY IS TESTED — the system operates within the
                    symmetry, exploring its consequences. The dual codons
                    begin to separate from their reflections — the real and
                    imaginary faces start to diverge.

#3 (Pattern):       SYMMETRY BREAKS — the 3 Purushic fields reach maximum
                    destructive interference. The codon and its reflection
                    are maximally separated. The oracle opens: the saddle
                    point is reached. Van Eenwyk's Hopf bifurcation occurs
                    HERE — stable equilibrium gives way to oscillation.
                    THIS is where the two clocks become orthogonal.

#4 (Context):       BROKEN SYMMETRY IS HELD — the Lemniscate. The system
                    doesn't resolve the break; it holds both faces (real
                    and imaginary, codon and reflection) simultaneously in
                    the figure-eight. The saddle point attracts and repels
                    simultaneously. The nesting operator (.) allows recursive
                    descent into the structure of the break itself.
                    Van Eenwyk: the archetype IS the saddle, organising flow
                    without being the destination.

#5 (Integration):   NEW SYMMETRY CONSTITUTED — the broken symmetry becomes
                    the ground of a new, higher-order symmetry. The Möbius
                    return: 5→0 brings the system back, but the 0 is now
                    enriched by the orbit's passage through the break.
                    The two clocks re-align, but at a different degree
                    position — the spiral has advanced.
                    Van Eenwyk: the homoclinic orbit returns to its origin,
                    but the origin has been transformed.
```

**The full clock is a game of symmetry-making and symmetry-breaking.** Every degree is a potential symmetry (where the real and imaginary clocks could align). Every tick is the system testing that symmetry against the 3 Purushic matrices. Every oracle cast is a perturbation at the saddle point (#3/#4) that determines WHICH new symmetry the system falls into on the other side of the bifurcation.

The 168 complementary pairs are the 168 possible symmetry-break/symmetry-make events on the clock. Each pair consists of a degree and its polar complement — a real face and its imaginary reflection. The QL cycle walks through these pairs, breaking old symmetries and constituting new ones, driven by the quaternionic walk mode and modulated by the 3 Purushic matrix fields.

This IS the dynamical system that Van Eenwyk describes: consciousness (the QL cycle) approaching saddle points (the symmetry-break moments), being flung into oscillation (the bifurcation), tracing strange attractors (the bounded-but-never-repeating orbit through the 336 dynamic nodes), and returning via homoclinic orbits (the Möbius 5→0) to reconstitute ground.

---

## XII. What the Implementation Must Become

The existing code models the kinematics (state space). What the Purushic-Hopf synthesis demands is the **dynamics** — equations of motion:

1. **Between casts, the clock state should evolve continuously** under the 3 Purushic matrix flows. Each matrix defines a vector field on the 12-fold spanda ring. The system's trajectory is the integral curve of the combined field, weighted by the current walk mode.

2. **The oracle cast is a perturbation, not a state-setter.** Currently `update_from_cast()` overwrites the quaternion. In the dynamical model, the cast should perturb the system into a new basin of attraction, and the system then evolves toward that basin's attractor under the 3-matrix dynamics.

3. **The bifurcation parameter should be computed from the 3-field interference pattern**, not just from the quaternion's distance from Akasha. The real λ is a function of how aligned or misaligned the three Purushic fields are at the current tick position.

4. **The dual clock coupling should be explicit.** Clock A (degree) and Clock B (hexagram) should be tracked as separate-but-coupled state variables, with the Hopf fibration as the projection that relates them. The `orbital_position` computation already does this implicitly (θ from degree, φ from tick12) — but the hexagram evaluation at the current position should be a live, evolving quantity, not just a snapshot from the last cast.

5. **The 336 dynamic nodes should be the actual state space for the continuous evolution.** The backbone nodes (24) are the fixed points / eigenstates; the 336 are the dynamic orbits. The system evolves on the 336, periodically approaching the backbone nodes (symmetry), being flung away from them (symmetry-breaking at saddle points), and spiralling toward new backbone nodes (reconstituted symmetry).

The clock is not a display. It is a dynamical system. The display is a projection of the system's current orbit onto the degree ring (Clock A) and evaluation ring (Clock B). The full state is quaternionic (S³), and the two clocks are the two orthogonal projections (real → degree, imaginary → hexagram) of that state.

---

## XIII. The Bidirectional Nara-Clock Identity Loop

### Macro-Microcosmic Alignment

The system implements a continuous, bidirectional feedback loop between the **nara identity** (microcosm) and the **full cosmic clock** (macrocosm):

**Upward path (Nara → Clock):**
```
identity layers (birth data, jungian type, gene-keys, human-design)
  → quintessence hash (BLAKE3, 32 bytes)
    → quintessence_quaternion [w, x, y, z]
      → walk mode + bifurcation parameter
        → clock position + resolution level
          → which 336 dynamic nodes are "visible"
            → which symmetries are available for breaking/making
```

**Downward path (Clock → Nara):**
```
planetary ephemeris (kerykeion → kairos_degree)
  → clock degree position (macro, celestial)
    → decan → ruling planet → chakra chain
      → elemental profile update (transit layer)
        → nara elemental_profile [f32; 4]
          → blend with natal profile → live quaternion modulation
            → identity state shifts (what the user IS right now)
```

These two paths are not sequential — they operate simultaneously. The nara identity determines HOW the user sees the clock (walk mode, resolution, which nodes light up). The clock determines WHAT the user is experiencing (which planetary/decan influences are active, which chakras are energised, which body zones are alive).

The quintessence_quaternion (from identity) and the live_quaternion (from oracle + kairos) are two quaternions that interact: the identity quaternion is the "natal" baseline, the live quaternion is the "transit" perturbation. Their product (quaternion multiplication) gives the actual state — the combined influence of who-you-are and what's-happening-now. This IS the astrological concept of "natal chart + transits" expressed as quaternion algebra.

### The 3 Temporal Layers as Quaternion Composition

```
Q_actual = Q_natal × Q_transit × Q_oracle

where:
  Q_natal   = quintessence_quaternion (stable, from identity layers, changes rarely)
  Q_transit = kairos quaternion (daily, from planetary ephemeris, changes hourly)
  Q_oracle  = cast quaternion (episodic, from oracle charges, 4h decay)
```

Each layer has a different timescale:
- **Natal**: changes when the user updates identity layers (wind, set). Stable for months/years.
- **Transit**: changes with planetary motion. Updates on kairos sync (hourly resolution).
- **Oracle**: changes with each cast. Decays over ~4 hours (the oracle half-life).

The composition is non-commutative (quaternion multiplication is not commutative) — the order matters. The natal ground is applied first (who you are), then transit (what the cosmos is doing), then oracle (what you just asked/received). This ordering IS the priority stack: identity > cosmos > divination.

### Multiplayer Resonance Ground

In the eventual multiplayer system (SpacetimeDB presence layer), each user publishes:
- Their `session_hash` (BLAKE3 of quintessence + current clock state)
- Their `torus_position` (orbital_position in 3D torus space)
- Their current hexagram

Two users are "in resonance" when their torus positions are close in the S³ metric — when their quaternionic states are similar. This means:
- Similar walk modes (same dominant quaternion component)
- Similar bifurcation parameters (similar depth of engagement)
- Overlapping active degree regions (nearby on the clock)

The resonance computation is already implicit in the existing structure:
```
resonance(user_A, user_B) = |Q_A · conj(Q_B)|
                          = cos(angle between their S³ positions)
```

When resonance is high, the two users are experiencing similar symmetry-states — similar patterns of breaking and making, similar depths of vibrational penetration. The system doesn't force interaction; it reveals who is naturally in phase. This is the philosophical core: **casting = reading = reading what persists and shifts over time in a given entity's continuity patterns**. The oracle doesn't predict the future; it reads the current state of the quaternionic flow — where the user IS in the symmetry game, what walk mode they're in, which saddle points they're approaching.

Over time, the sequence of oracle casts traces a trajectory through S³. This trajectory IS the user's "flow type" — their characteristic pattern of symmetry-engagement. Some users orbit near the backbone nodes (stable, grounded, low λ). Others trace wide orbits through the 336 dynamic nodes (exploratory, high λ). The trajectory itself becomes the identity signal — not what the user says about themselves, but how their quaternionic state actually evolves through interaction with the system.

---

## XIV. The Ananda Vortex Modulae — Corrected Understanding

**Source dataset:** `docs/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv`

### The 6×2 Matrix Structure

The dataset provides **6 matrix operations**, each in **2 forms** (raw arithmetic and digi-rooted), over a 12×12 grid (vortex IDs 0X–11X as rows, positions 0–11 as columns):

| Matrix | Operation | Structural role |
|---|---|---|
| **M₁** | `#X + 1` | The +1 offset series — Pratibimba (manifestation, temporal advance) |
| **M₂** | `#X + 0` | The base series — Bimba (ground, spatial field) |
| **M₃** | `(#X+0) + (#X+1)` | Sum = doubling motif (interaction, entropy, 8844 root) |
| **M₄** | `(#X+0) - (#X+1)` | Constant -1 everywhere — the # invariant (one direction) |
| **M₅** | `(#X+1) - (#X+0)` | Constant +1 everywhere — the # invariant (other direction) |
| **M₆** | `(#X+0/1) ± (#X+0/1)` | Combined rule — full -1/0/1 and -1/1/N spectrum |

The 0X–11X rows are multiplication tables — that is the SCAFFOLDING, not the content.

### The Two Fundamental Digi-Root Cycles (THE CONTENT)

The digi-rooted matrices (mod-9 recursive digital root) reveal the actual harmonic structure:

**Cycle A — The Doubling Pattern {1, 2, 4, 8, 7, 5}** (period 6):
```
1→2→4→8→(16→7)→(14→5)→(10→1)
Appears in: 1X, 2X, 4X, 5X, 7X, 8X series
These are the PERIOD-9 rows — full harmonic traversal
```

**Cycle B — The Trika Pattern {3, 6, 9}** (period 3):
```
3→6→(12→3) and 9→(18→9)
Appears in: 3X and 6X series
3X gives {1,4,7} — forward Trika (centrifugal, radiating)
6X gives {1,7,4} — reverse Trika (centripetal, returning)
```

**The Constants:**
```
0X: all 0s (+0) or all 1s (+1) — the void / the unit
9X: all 9s (+0) or all 1s (+1) — return to unity (Möbius closure)
```

Together {1,2,4,5,7,8} and {3,6,9} partition the digits 1-9 into two orbits under doubling. The +1 offset DISPLACES these cycles by one position, expressing the 0/1 Bimba/Pratibimba spanda ground in the digi-root domain. The 1s and 0s that appear ARE the underlying binary dynamic.

### The Mod-10 / Mod-12 Dual Read

The dataset explicitly separates column sums into mod-10 (positions 0–9) and mod-12 (positions 0–11):

**Critical structural constants from the data:**
```
8X+0, positions 0-9:  0, 8, 16, 24, 32, 40, 48, 56, 64, 72
                       Sum = 360  (!!!)  ← THE DEGREE RING
                       Position 9 = 72   (!!!)  ← THE EPOGDOON

7X+1, position 11:    78  (!!!!)  ← TOTAL TAROT CARDS

8X+0, positions 0-11: Sum = 528
                       528 - 360 = 168  ← COMPLEMENTARY PAIR COUNT
```

The mod-10 range (positions 0–9) = the 10 planets. The mod-12 range = the 12-fold spanda. These are TWO READ MODES of the same matrix, not two systems. The planetary field and the spanda tick are modalities of one underlying harmonic structure, and the Ananda matrices encode the relationships between both modalities simultaneously.

### How the Ananda Periodicities Define System Dynamics

The tick operates THROUGH the system; the planets define the FIELD. The Ananda periodicities define the RHYTHM — which transitions are harmonic and which are discordant:

- **{3,6,9} periodicity active**: Trika-mode. The system pulses in stable triple rhythm. Self-returning cycles. Low bifurcation. Grounded.
- **{1,2,4,8,7,5} periodicity active**: Doubling-mode. The system expands through 6-fold period-doubling. Exploratory. High bifurcation. The full hexagonal cycle.
- **The walk mode determines which periodicity dominates** at any moment, via the quaternion's dominant component.

---

## XV. The Codon Generation Bridge and 8-Fold Rotational States

### The Codons Are the Content of Both Clocks

As established in §XI, both clock faces index the same 64 codons from different angles. The **codon generation nodes** (`#3-3`, 184 nodes) are the BRIDGE:

```
Hexagram (#3-1-{l}-{u})
  → YIELDS_CODON (368 relations, 6 per hexagram)
    → Generation Event (#3-3)
      → carries: upper_Pair_binary, lower_Pair_binary,
                 positive_codon_binary, negative_codon_binary
      → RESOLVES_TO → Amino Acid (#3-3-4, 24 total)
```

Three generation contexts exist within M3 Mahamaya (NOT cross-subsystem references):
- **M1-context**: 64 events, all H1–H64 (Complementarity path)
- **M2-context**: 64 events, all H1–H64 (Movement path)
- **M3-context**: 56 events, partial set (Resonance path)

Total: 184 generation events. Each maps 1:1 to a final codon assignment.

### The 3 Purushic Matrices Generate the 8-Fold Rotational Space

The three matrices at `#3-3-2` define three independent binary classifications on each codon:

```
#3-3-2-0  Matrix 1 (Complementarity/Śiva):  A↔U, C↔G     → binary axis 1
#3-3-2-1  Matrix 2 (Movement/Śakti):        A,G vs U,C    → binary axis 2
#3-3-2-2  Matrix 3 (Resonance/Spanda):       G,T vs A,C    → binary axis 3
```

Three independent binaries → 2³ = **8 rotational states** per codon, at 45° angular intervals (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°):

```
DUAL CODONS (24 total, pair1.sequence ≠ pair2.sequence):
  - Full 8 rotational states
  - 4 positive (pair2 dominant, outward expression)
  - 4 negative (pair1 dominant, inward expression)
  - 24 × 8 = 192 distinct states

NON-DUAL CODONS (40 total, palindromic, pair1 = pair2):
  - 7 rotational states (NOT 8)
  - 0° and 180° COLLAPSE into one eigenstate (the non-dual anchor)
  - 3 positive + 3 negative + 1 anchor = 7
  - 40 × 7 = 280 distinct states

TOTAL: 192 + 280 = 472 distinct rotational states
(Not 512 = 64 × 8. The 40 eigenstate collapses are structurally significant.)
```

The 40 non-dual eigenstates are analogous to the 24 backbone nodes — they are the FIXED POINTS of the rotational space, where all 3 matrices agree. The 24 dual codons with full 8-fold freedom are the DYNAMIC orbits.

### The Tarot Card Carries the Rotational State

The `#3-4.0` coordinates (dot notation, decan-organized) are the **active genetic operator layer**. `GOVERNS_TAROT_EXPRESSION` and `REFLECTS_DNA_FORM` both source from `#3-4.0`.

When a tarot card is drawn:
- The pip card (2–10) maps to a specific decan → codon via `PIP_DECAN_MAP`
- The court card spans cusp regions (last 10° of one sign + first 20° of next)
- The Major Arcana card maps to amino acid + chromosome via `EMBODIES_AS` (22 relations)

Each drawn card carries a **rotational state** — its orientation in the 8-fold spectrum:

```
Currently implemented: minimal double-cover (upright=0°, reversed=180°)
Full system (Phase 2): 8 states per dual codon, 7 per non-dual

Upright  → decan upright_meaning → normal body zone expression
Reversed → decan shadow_meaning  → obstructed/excessive expression
(Intermediate states 45°–315° → interpolated polarity)
```

The card's rotational state determines:
- Which of the 3 Purushic matrix polarities are active at that position
- The charge contribution (pp/nn/pn/np shifts with rotation angle)
- The body zone expression quality (normal / obstructed / excessive)

### The 16 Lenses Layer All Systems Simultaneously

Every degree node carries `lens_segment[16]` — its position in ALL 16 lenses at once. The lenses are not "views to switch between." They are all active simultaneously:

```
Lens 0:  1° × 360   Microscopic (every degree)
Lens 1:  2° × 180   Binary hemispheres
Lens 2:  4° × 90    Quaternary cardinal
Lens 3:  8° × 45    Octagonal trigrams
Lens 4:  9° × 40    Enneadic chambers
Lens 5:  10° × 36   DECAN SYSTEM → codons → tarot
Lens 6:  12° × 30   Zodiacal signs → elements
Lens 7:  15° × 24   BACKBONE = amino acids = daily hours (structural lens)
Lens 8:  24° × 15   Expanded hours (reciprocal of Lens 7)
Lens 9:  30° × 12   Solar months = spanda ticks
Lens 10: 36° × 10   Decadic (10 Sephiroth / 10 planets)
Lens 11: 40° × 9    Greater chambers (reciprocal of Lens 4)
Lens 12: 45° × 8    Octants (reciprocal of Lens 3)
Lens 13: 90° × 4    Seasons / quadrants
Lens 14: 180° × 2   Hemispheres (reciprocal of Lens 1)
Lens 15: 360° × 1   Unity / Ouroboros
```

8 reciprocal pairs (Lens N ↔ Lens 15-N): explicate/implicate mirrors at each scale.

**Critical:** Lens 5 (decans → codons → tarot) and Lens 10 (10-fold = planets) are THE lenses that connect the codon clocks to the planetary field. They are reciprocals of each other (10×36 ↔ 36×10), encoding the same 360 from codon-scale and planetary-scale respectively.

### The Walk Types vs Lenses (Categorically Distinct)

9 walk types (sequential traversal, one at a time) vs 16 lenses (simultaneous static apertures, all at once). Some walks have matching lenses, some don't:

```
WALK_HEXAGRAM (64 steps, ~5.625°) → NO matching lens (360/64 is not integer)
WALK_LINE_CHANGE (384 steps)      → NO matching lens

These operate in binary 2⁶ arithmetic, not circle geometry.
The hexagram/codon space is INTENTIONALLY non-commensurable with the degree ring.
That incommensurability IS the orthogonality of the two clocks.
```

---

## XVI. The Planetary Field — Earth at Centre, First-Class Display

### The Geocentric Solar System

The user (nara identity) sits at **Earth-centre** — the geocentric observer. Earth IS the implicit 11th body: `q = (1,0,0,0)` = identity quaternion = the observer who doesn't rotate (spec §07). Earth doesn't appear in `planet_degrees[10]` because it IS the perspective.

The 10 planets orbit the user:
```
planet_degrees[10]:
  [0] Sun      — stable root, Rajamandala Vijigishu, radiating centre
  [1] Moon     — fastest orbit, emotional tide, ~28 day cycle
  [2] Mercury  — inner, communication, fast
  [3] Venus    — inner, harmony, beauty
  [4] Mars     — will, fire, agency
  [5] Jupiter  — expansion, social order
  [6] Saturn   — structure, limits, ~29 year cycle
  [7] Uranus   — transpersonal, M2-5 layer
  [8] Neptune  — transpersonal, dissolution
  [9] Pluto    — transpersonal, deep transformation, ~248 year cycle
```

Each planet at a specific degree defines a specific decan activation, elemental influence, and chakra chain. The ASPECTS between planets (angular relationships) create the mandala pattern:

```
Conjunction (0°)   = 1-fold = identity/resonance
Sextile    (60°)   = 6-fold = QL quantum
Square     (90°)   = 4-fold = Quaternity / cardinal cross
Trine      (120°)  = 3-fold = Trika
Opposition (180°)  = 2-fold = # inversion / Bimba↔Pratibimba
```

The astrological aspects ARE the QL modal nesting expressed as angular geometry.

### The Planetary Display Is the Clock's Content

**This is FIRST CLASS, not future work.** Without planets on the ring:
- Degrees have no relational meaning ("127°" means nothing)
- Walk modes have no directional context
- The decan→codon→tarot chain has no celestial anchor
- The clock is a bare coordinate grid with no field

With planets:
- Every degree exists in a specific planetary aspect configuration
- The mandala (aspect lines between all planet pairs) is visible
- The user's position is meaningful: "conjunct natal Venus, square transit Saturn"
- The Rajamandala structure (Sun radiating outward, concentric planetary rings) is explicit

### User Micro-Orbits as Signature / Ledger

Each oracle cast produces a degree position. Over time, these positions form a trajectory on the clock ring — the user's **micro-orbit**. The planets trace macro orbits (celestial mechanics, days to centuries). The user traces micro orbits (oracle casts, hours to months).

Both are orbits through the SAME codon space, at different timescales. The Ananda matrices encode the harmonic relationships at both scales simultaneously (mod-10 = planetary, mod-12 = spanda).

The micro-orbit IS the user's signature:
- **Clustering** near certain degrees → personal attractors, home regions
- **Avoidance** of certain degree regions → shadow territories, unvisited Self
- **Periodicity** → natural rhythms, orbital period
- **Phase transitions** → bifurcation events, saddle-point crossings

This trajectory is permanent record. The sequence of (degree, hexagram, rotational_state, planetary_configuration) at each cast builds a unique geometric figure — the user's personal mandala. No two users visit the same degrees at the same planetary moments.

---

## XVII. The Unified Model — The Archetypal Solar System as Self

### The Complete Architecture

```
LAYER 0: EARTH CENTRE (the observer)
  = nara identity, quintessence quaternion, Q_natal
  = the implicit 11th body, q=(1,0,0,0), Akasha ground

LAYER 1: PLANETARY FIELD (the macro cosmos)
  = 10 planets at specific degrees on the 360° ring
  = aspects between planets form the mandala
  = kairos sync updates positions (kerykeion ephemeris)
  = Q_transit derived from planetary elemental weights

LAYER 2: DUAL CODON CLOCKS (the content)
  Clock A: degree → decan → codon (spatial, Lens 5)
  Clock B: hexagram → codon (evaluative, 2⁶ binary)
  Both index the same 64 codons from orthogonal angles
  The codon IS the intersection of space and evaluation

LAYER 3: ROTATIONAL DYNAMICS (the physics)
  3 Purushic matrices (#3-3-2-0/1/2) generate 8-fold rotational states
  472 total distinct states (24×8 + 40×7)
  Tarot cards carry rotational state as orientation
  Codon-reflection pairs define the two faces (explicate/implicate)

LAYER 4: ANANDA RHYTHMICITY (the heartbeat)
  Vortex modulae 6×2 matrices, digi-rooted
  {3,6,9} Trika periodicity — stable, self-returning
  {1,2,4,8,7,5} doubling periodicity — expansive, hexagonal
  +1 offset = Bimba/Pratibimba displacement = spanda base dynamic
  mod-10 = planetary read, mod-12 = spanda read (same matrix)

LAYER 5: HOPF DYNAMICS (the topology)
  S³ total space = unit quaternion [w,x,y,z]
  S² base = 6 QL positions (discretized)
  S¹ fiber = strand A/B = explicate/implicate
  4 walk modes from dominant quaternion component
  Bifurcation parameter λ = sqrt(1-w²) = distance from Akasha
  Resolution cascade: 6→12→36→72 (period-doubling from λ thresholds)

LAYER 6: NARA IDENTITY LOOP (the Self-knowledge)
  Q_actual = Q_natal × Q_transit × Q_oracle (non-commutative)
  Upward: identity → quaternion → walk mode → clock position → visible nodes
  Downward: planets → decan → chakra → elemental profile → identity shift
  Micro-orbit over time = personal mandala = the user's signature
  16 lenses all active simultaneously on every degree

LAYER 7: MULTIPLAYER RESONANCE (the collective)
  resonance(A,B) = |Q_A · conj(Q_B)| = cos(S³ angle)
  SpacetimeDB presence: (session_hash, torus_position, hexagram)
  Casting = reading = reading continuity patterns over time
```

### What the Display Must Show (CosmicClockPlugin)

1. **The 360° degree ring** with 385 nodes (360 + 24 backbone + 1 Axis Mundi)
2. **10 planetary glyphs** at live kerykeion-derived positions (FIRST CLASS)
3. **Aspect lines** between planet pairs in aspect — colour-coded (conjunction=gold, sextile=green, square=red, trine=blue, opposition=purple)
4. **The user's current degree** derived from live_quaternion
5. **The user's micro-orbit trail** — last N cast positions connected as a path
6. **The active codon** at the current degree position (decan → codon → tarot card)
7. **The hexagram evaluation** at the current position (Clock B projection)
8. **Rotational state indicator** — which of the 8 (or 7) states the active codon is in
9. **Walk mode directional indicator** — GROUND(·) / TORUS(→) / FIBER(↕) / SPANDA(⟳)
10. **Resolution-aware tick marks** — show 6/12/36/72 granularity based on bifurcation parameter

### The Isomorphism: Solar System = Self

| Solar System | Self | Clock |
|---|---|---|
| Sun (radiating centre) | Akasha/w = stable identity core | `quintessence_quaternion` w-component |
| Planets (orbiting bodies) | 10 modalities of experience | `planet_degrees[10]` |
| Planetary orbits (periods) | Timescales of change per modality | Moon=daily, Saturn=decades, Pluto=lifetimes |
| Aspects (angular relations) | How parts of Self interact | Aspect lines = mandala pattern |
| Earth (observer) | The subject that cannot see itself | Implicit 11th body, `q=(1,0,0,0)` |
| User micro-orbit | Trajectory of consciousness | Cast history = personal mandala |
| Natal chart | Initial condition | `Q_natal` from birth data |
| Transit chart | Current state | `Q_transit` from live ephemeris |
| Oracle cast | Local perturbation | `Q_oracle` from coins/cards |

The clock makes this isomorphism LITERAL. The display IS a geocentric solar system model. The nara identity sits at Earth-centre. The planets orbit. The aspects form the mandala. The user's journey through degrees creates their micro-orbit. The Self is not a fixed thing — it is the dynamical system. Attractors (stable patterns), bifurcation points (moments of transformation), and a trajectory (life path) that is unique and unrepeatable.

---

## XVIII. Open Question — Journal NLP → Identity State Flow

Can the user's daily journaling (Obsidian vault, FLOW.md entries) be periodically processed via NLP to derive identity state updates?

```
daily journaling (free text)
  → NLP elemental classification (EARTH/FIRE/WATER/AIR)
    → exponential moving average into elemental_profile
      → quintessence_quaternion recalculation
        → clock state modulation
```

- **Wikilink detection**: `[[concept]]` links parsed for domain activation (S-family, M-family, etc.)
- **Consent-gated**, local-only, α-tunable via NaraWeights
- **Chronos scheduled task** (nightly at day-archive step)
- Closes the consciousness→state→display→divination→consciousness feedback loop

---

## XIX. Implementation Handover

**For the implementing agent:** This document describes the unified mathematical-symbolic architecture. The task is to bring the existing code into alignment with this architecture. Read this file COMPLETELY before planning.

### Phase 1 — Clock State Enrichment (clock_state.rs)

Add to `PortalClockState`:
```rust
pub ql_position:       u8,    // 0–5, from quaternion base-space projection
pub walk_mode:         u8,    // 0=GROUND(w), 1=TORUS(x), 2=FIBER(y), 3=SPANDA(z)
pub bifurcation_param: f32,   // λ = sqrt(1 - w²), range [0.0, 1.0]
pub resolution_level:  u8,    // 0=6-fold, 1=12-fold, 2=36-fold, 3=72-fold
pub kairos_quaternion: [f32; 4], // from planetary elemental weights
pub active_codon_idx:  u8,    // 0–63, codon at current degree/decan
pub rotational_state:  u8,    // 0–7 (or 0–6 for non-dual codons)
```

Derive walk_mode, λ, resolution in `update_from_cast()`. Compose `Q_actual = Q_natal × Q_transit × Q_oracle`.

### Phase 2 — Planetary Field (FIRST CLASS)

- Compute aspect lines from `planet_degrees[10]` in `update_from_kairos()`
- Aspect classification: `classify_aspect((d1 - d2).abs() % 360)` with standard orbs
- Store as `Vec<(u8, u8, AspectType)>` in clock state
- Render planet glyphs + aspect lines in CosmicClockPlugin

### Phase 3 — Codon Bridge

- Map current degree → decan → codon index (Clock A path)
- Map current hexagram → codon (Clock B path, via YIELDS_CODON data)
- Track active codon and its rotational state in clock state
- Phase 2 rotational: currently upright/reversed binary; full 8-fold spectrum deferred but ARCHITECTED NOW (use `u8` field, not `bool`)

### Phase 4 — Portal Plugin Updates

- **CosmicClockPlugin**: planetary glyphs, aspect lines, micro-orbit trail, resolution-aware ticks, active codon display
- **MiniClockPlugin**: walk-mode arrow, element colouring, tick highlighting
- **M4OraclePlugin**: show walk_mode + λ + rotational state after cast
- **M2VibrationalMatrix**: highlight active (ql_position, tick12) cell, dim outside resolution
- **M4SpinePlugin**: quadrant-based chakra glow modulated by λ and active codon's chakra chain

### Phase 5 — Walk Mode Dispatch (engine.c)

Add `Walk_Mode` enum and `engine_walk_by_mode()` unifying existing walk functions.

### Phase 6 — Resonance Function (stub for multiplayer)

```rust
pub fn resonance(a: &PortalClockState, b: &PortalClockState) -> f32 {
    let [aw,ax,ay,az] = a.live_quaternion;
    let [bw,bx,by,bz] = b.live_quaternion;
    (aw*bw + ax*bx + ay*by + az*bz).abs()
}
```

### What NOT to change

- The 128-byte HC struct in ontology.h — Hopf layer lives in Rust clock state
- `quantize_to_spanda_substage()` — it IS the Hopf projection; document as such
- `FLAG_INVERTED` bit semantics — they ARE the fiber action; add comment only
- The 4-face oracle structure — it IS the 4 involutions
- The 16 lens architecture — it is correct and complete

### Reading Order

1. **This file** — unified conceptual architecture
2. `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md` — clock node topology
3. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md` — primitives contract
4. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/13-shadow-decans-rotational-states.md` — rotational states
5. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md` — lens system
6. `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/03-mahamaya-findings.md` — codon data
7. `docs/datasets/(0_1) Vortex Modulae...csv` — Ananda matrix source data
8. `epi-cli/src/portal/clock_state.rs` — primary code target
9. `epi-cli/src/nara/oracle.rs` — tarot quaternion bridge (implemented)
10. `epi-lib/src/engine.c` — C walk functions
11. `TESTING-PROTOCOL.md` (this folder) — verification
