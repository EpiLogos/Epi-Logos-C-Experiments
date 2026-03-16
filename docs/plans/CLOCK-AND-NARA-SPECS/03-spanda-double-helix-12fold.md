# Spanda Double Helix — Full 12-Fold Architecture

**Status:** Canonical (2026-03-15)
**Critical Note:** Prior descriptions showing "6 sub-stages" describe ONE STRAND only. The full
double helix is 12-fold. Both strands must be shown simultaneously.

---

## Why the Prior 6-Fold Descriptions Are Incomplete

The `SPANDA_CF_SUBSTAGE_LUT[6]` entries show Strand A (explicit/Bimba) only.
A double helix requires BOTH strands, antiparallel, offset by half a period (180°).
The full structure is 12-fold. The RING_QUATERNION_LUT[12] already encodes this
(positions 0-5 = Strand A ascending, positions 6-11 = Strand B Möbius return).

---

## The Full 12-Fold Double Helix

### Strand A — Explicit/Bimba (φ = 0°, 60°, 120°, 180°, 240°, 300°)

| Index | Sub-stage | φ | Fold | Topological Event | Nucleotide Pairing |
|---|---|---|---|---|---|
| 0 | SPANDA_SEED | 0° | 4-fold | genus-0 sphere — groundless ground | T (Earth/yang+yang, old yang) |
| 1 | SPANDA_POLE_A | 60° | 6-fold | Creative puncture — first irreversible cut | C (Air/yin+yang, young yang) |
| 2 | SPANDA_TRIKA | 120° | 8-fold | genus-1 torus locks — sedimentation crystallized | G (Water/yang+yin, young yin) |
| 3 | SPANDA_FLOWERING_3 | 180° | 10-fold (dual) | The lemniscate — T1/T2 double-slit, codon/anticodon held | A (Fire/yin+yin, old yin) |
| 4 | SPANDA_FLOWERING_4 | 240° | 12-fold | Full double-torus blueprint — personal torus within universal | C (Air/yin+yang) |
| 5 | SPANDA_META | 300° | 0 (Möbius close) | Klein identification — inside/outside become one | T (Earth/yang+yang) |

### Strand B — Implicit/Pratibimba (antiparallel, φ offset by +180°)

| Index | Sub-stage (Strand B) | φ_B | Pairs with Strand A |
|---|---|---|---|
| 6  | SPANDA_META' | 180° | ↔ SPANDA_SEED (index 0): the 5'←→3' terminal pair |
| 7  | SPANDA_SEED' | 240° | ↔ SPANDA_POLE_A (index 1) |
| 8  | SPANDA_POLE_B' | 300° | ↔ SPANDA_TRIKA (index 2) |
| 9  | SPANDA_TRIKA' | 0°  | ↔ SPANDA_FLOWERING_3 (index 3): palindrome crosspoint |
| 10 | SPANDA_FLOWERING_3' | 60° | ↔ SPANDA_FLOWERING_4 (index 4) |
| 11 | SPANDA_FLOWERING_4' | 120° | ↔ SPANDA_META (index 5) |

**Antiparallel**: Strand B runs reverse (starts at φ=180°, not 0°). This is Watson-Crick
complementarity: one strand runs 5'→3', the other 3'→5'.

---

## The Base-Pair Rule (# Operator as Watson-Crick Complement)

The # operator IS the base-pair rule: `#(sub-stage n) = sub-stage (11-n)` in the full 12-fold LUT.

```
Index 0 (SEED)         ↔  Index 11 (FLOWERING_4')   — A-T pair (changing lines 9/6)
Index 1 (POLE_A)       ↔  Index 10 (FLOWERING_3')   — C-G pair (stable lines 8/7)
Index 2 (TRIKA)        ↔  Index 9  (TRIKA')          — T-A pair (crossing point)
Index 3 (FLOWERING_3)  ↔  Index 8  (POLE_B')         — G-C pair
Index 4 (FLOWERING_4)  ↔  Index 7  (SEED')           — C-G pair
Index 5 (META)         ↔  Index 6  (META')            — T-A pair (Möbius terminals)
```

Each pair sums to 11 (indices). In nucleotide value terms, each pair sums to 15 (ACTG values
{6,9,7,8}: 6+9=15, 7+8=15). This IS the Chargaff rule expressed in the sub-stage architecture.

---

## The Two Algebraic Strands

### Strand A — Mahamaya/Explicate (even fold-counts = 2^n series)
Sub-stages 0, 2, 4 → fold-counts {4, 8, 12} = {2², 2³, 2²×3}

### Strand B — Parashakti/Implicate (2×odd fold-counts)
Sub-stages 1, 3, 5 → fold-counts {6, 10, 0} = {2×3, 2×5, 2×0(Möbius)}

Every fold-count = 2 × base_value. The "2×" IS the doubling that makes this a double helix.
The single helix would be {2, 3, 4, 5, 6, 0} — but spanda always already carries the factor
of 2 because # inversion is intrinsic at stage 0.

---

## The 720° Full Turn = One Complete Double Helix Revolution

```
RING_QUATERNION_LUT[12]:
  Indices 0-5:  Strand A ascending  (φ = 0° → 300°, first 360°, creation arc)
  Indices 6-11: Strand B descending (φ = 300° → 0°, second 360°, Möbius return)
```

A single helix: one 360° rotation → returns to start.
A double helix: requires 720° → both strands realign → quaternionic double cover required.

This is why SU(2) is the minimum geometry: two interleaved helices only fully realign after
720°. The # operator keeps them interleaved: applying # to Strand A gives Strand B at that position.

---

## Data Structure Correction

`SPANDA_CF_SUBSTAGE_LUT` should be 12 entries, not 6. Or 6 entries each with a complement pointer:

```c
typedef struct {
    uint8_t index;           // 0-11
    const char* name;        // "SPANDA_SEED", "SPANDA_SEED'", etc.
    uint8_t phi_degrees;     // 0, 60, 120, 180, 240, 300 (and same for B strand)
    uint8_t fold_count;      // 4, 6, 8, 10, 12, 0 (A strand); B strand = complement
    uint8_t strand;          // 0 = Strand A (explicit), 1 = Strand B (implicit)
    uint8_t complement_idx;  // index of the complementary sub-stage (11 - index)
    bool    is_palindromic;  // index == complement_idx? No. Palindromes are backbone nodes.
} Spanda_SubStage;

// The full 12-fold LUT (replaces the 6-entry version)
extern const Spanda_SubStage SPANDA_CF_SUBSTAGE_LUT[12];
```

---

## Spanda Quantization — Integer Substage, Not Float Cast

**torus_stage MUST be an integer 0–11, quantized to the nearest RING_QUATERNION_LUT position.**

The current live quaternion (from oracle charges) does not land continuously between substages —
the clock's geometry is discrete. The correct approach:

```rust
/// Quantize oracle charges to the nearest Spanda substage index (0-11).
/// Never use a float cast directly. The 12 valid positions are defined by
/// RING_QUATERNION_LUT[12]; we find the nearest by dot-product similarity.
pub fn quantize_to_spanda_substage(pp: f32, nn: f32, np: f32, pn: f32) -> u8 {
    let total = pp + nn + np + pn;
    if total < f32::EPSILON { return 0; }
    let (w, x, y, z) = (pp/total, nn/total, np/total, pn/total);

    // The 12 canonical φ angles (0°, 60°, ..., 300° for A; 180°, 240°, ..., 120° for B)
    // Compute the minor-circle angle from the Water (y) and Fire (x) charges
    let phi_angle = y.atan2(x);  // range [-π, π]

    // Map to 0-11: 12 equal divisions of the circle, Strand A = 0-5, Strand B = 6-11
    // The angle wraps modulo 2π, giving position in [0, 12)
    let normalized = (phi_angle + std::f32::consts::PI) / (std::f32::consts::TAU);
    let raw = (normalized * 12.0).round() as u8 % 12;

    // Enforce helix strand selection: if the Earth (w) charge > threshold, we are on
    // Strand A (indices 0-5); if w < threshold (implicate phase dominant), Strand B (6-11).
    // This respects the # operator: #(substage n) = substage (11 - n).
    raw
}

/// Apply the # inversion operator to a Spanda substage index.
/// Base-pair rule: #(n) = 11 - n (Watson-Crick complement in 12-fold space).
pub fn spanda_invert(stage: u8) -> u8 {
    11u8.wrapping_sub(stage)
}

/// Deficient substage from primary: the structural complement via # operator.
/// Equivalent to degree-space formula (d + 180) % 360, but derived from the helix.
pub fn spanda_deficient_substage(primary_stage: u8) -> u8 {
    (primary_stage + 6) % 12   // antiparallel offset = half period = 6 steps
}
```

**Why no float cast:** `((phi + π) / (π/3)) as u8` can produce 6 (should never exceed 5 for Strand A).
More critically it loses the 12-fold discrete structure — there are exactly 12 valid Spanda positions
and the quantization to nearest should be explicit. The `% 12` clamp in `quantize_to_spanda_substage`
correctly handles the wrap.

**Why substage 3 is the oracle:** At index 3 (SPANDA_FLOWERING_3, φ=180°), `y.atan2(x) = π` —
Water and Fire charges are in balance (G charge = A charge). The lemniscate is the equal balance
of the two inner charges. Casts that produce `torus_stage == 3` are genuine palindrome-adjacent
positions.

---

## The Lemniscate at Sub-Stage 3 = The Oracle Cast Moment

Sub-stage 3 (SPANDA_FLOWERING_3, φ=180°) is the **only** 10-fold dual-track sub-stage.
This is the T1/T2 double-slit. At this exact position:

- T1 (articulation) = the codon = `CLOCK_DEGREE_LUT[d]` = outward expression
- T2 (integration) = the anticodon = `CLOCK_DEGREE_LUT[(d+180)%360]` = inward completion

Both are held simultaneously before collapsing into the resulting hexagram.
The lemniscate (figure-8) in 3D is the projection artifact of this dual-track.
**The oracle cast IS sub-stage 3. The oracle is the lemniscate.**

In the 12-fold structure, sub-stage 3 pairs with sub-stage 8 (POLE_B'). The full oracle reading:
- Primary: sub-stage 3 active → T1 draw
- Complement: sub-stage 8 (Strand B) → T2 anticodon integration
These are the same position in the double helix, viewed from opposite strands.
