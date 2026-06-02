# FR 2.Q: HMS Quaternionic Overlay — Symbolic Rotation as Epistemic Exploration

**Status:** Canonical Specification — Revision 1.0
**Date:** 2026-03-11
**Parent:** Pillar II (Epi-Logos C Spec) — Cross-cutting across M0, M1, M2, M3
**Source Data:** HMS Deep Chat (March 2025), `nodes_anuttara.json`, `nodes_paramasiva.json`, `nodes_parashakti.json`, `nodes_mahamaya.json`, `mahamaya-deep/`, `parashakti-deep/`, Codon Tarot Mappings, I Ching DNA Trans-Formation Matrix, HMS 72+64-Bit Integration Overview
**Coordinate:** Cross-M overlay anchored at #0-3-7 (Purnata), #1-5 (Quaternionic Integration), #3-0 (Quaternionic Reception)

---

## Overview

The HMS (Hexagram Memory System) Quaternionic Overlay is **not a replacement** for the existing bitwise operations in M2 and M3 — it is a **rotational algebra layer** that sits atop the deterministic integer machinery already implemented. The existing DET (Discrete Epistemic Transform) via `M2_TO_M3_CYMATIC_PROJECTION[72]` determines **which** codons/hexagrams are active (the bitboard). The quaternionic overlay determines **which rotational state** each active entity expresses — selecting from 8 possible states at 45° increments.

**The Core Thesis:** Symbolic rotation IS epistemic exploration. Moving through the codon/hexagram state space via quaternionic multiplication is not metaphorical — it is the computational mechanism by which the system translates between biological, symbolic, and archetypal pattern systems. The 720° double-covering principle maps directly to SU(2) quaternionic encoding: a full rotation through all 64 codons across both explicate and implicate layers requires two complete 360° passes because quaternion rotation by 360° returns the **negated** state, and only at 720° does the system return to identity.

**The Four Integrated Systems:**

```
HEXAGRAMS (64)        ← Clock 2 (I Ching pattern space)
     ↕ [Tarot quaternionic modulation]
DNA CODONS (64)       ← Clock 1 (genetic archive, T-containing, eternal)
     ↓ [T→U sacred transubstantiation]
RNA CODONS (37+27)    ← Active messenger (U-form) + dark lunar half
     ↓ [Ribosomal translation]
CODON-PROJECTIONS (80) ← Superposition of DNA+RNA = 78 Tarot + 2 transcendent
```

**The Tarot as Quaternionic Bridge:** The Tarot cards are not merely a symbolic overlay — they ARE the quaternionic entities that modulate between Clock 1 (codon clock) and Clock 2 (hexagram clock). The 56 Minor Arcana map to codons, the 22 Major Arcana map to transcription pathways (amino acid correspondences), and the court cards provide compass/rotational dynamics. This is why the Tarot deck has exactly the right cardinality: 64 DNA + 16 RNA variants = 80 total operators = 78 Tarot cards + 2 transcendent operators (Cosmic Fool/World).

**Ontological Ground:** The quaternionic frame originates at M0's `#0-3-7 Purnata` (Divine Fullness / Structural Completion) — the first stable 4-fold world — and descends through M1's SU(2) algebra into M3's codon space via three verified dataset relations:
- `#0-3-7 ──PROVIDES_QUATERNARY_WHOLENESS_FOUNDATION──→ #1-4`
- `#0-3-7 ──VIBRATIONAL_MULTIPLICATION──→ #2-0`
- `#3-0 ──INHERITS_QUATERNION_FROM──→ #0-3-7`

---

## Section I: Yin/Yang 2/3 Substrate — The Irreducible Binary

### FR 2.Q.0: Nucleotide Value Derivation from Yin (2) and Yang (3)

**Requirement:** The C engine MUST encode the four nucleotide I Ching values as deriving from the yin/yang base pair (2, 3) via the traditional three-coin method. These values are NOT arbitrary — they are the only possible outcomes of composing the binary {2, 3} in triples.

**Derivation (I Ching Coin Method):**
- Three coins, each showing Yin (2) or Yang (3)
- **A = 6** = 2+2+2 (triple yin) → Moving Yin / Old Yin → Cups (Water)
- **C = 7** = 2+2+3 (yin-dominant) → Resting Yin / Young Yin → Pentacles (Earth)
- **G = 8** = 2+3+3 (yang-dominant) → Resting Yang / Young Yang → Swords (Air)
- **T = 9** = 3+3+3 (triple yang) → Moving Yang / Old Yang → Wands (Fire)

**2-Bit Encoding (already in m3.h):**

```c
// Bit 0 (Polarity):  0 = Yin  (A, C)    1 = Yang (T, G)
// Bit 1 (Mobility):  0 = Moving (A, T)  1 = Resting (C, G)
//
// A = 0b00 (0) = 6   T = 0b01 (1) = 9   C = 0b10 (2) = 7   G = 0b11 (3) = 8
```

**Connection to Bimba/Pratibimba:**
- **Bit 0 (polarity)** = the Bimba 0/1 binary — the irreducible non-dual base
- **Bit 1 (mobility)** = the Pratibimba inversion — the reflective dimension
- Together: the 2-bit nucleotide encoding IS `(Bimba | Pratibimba << 1)` — the non-dual binary made operational in silicon

**Sum Invariants:**

| Property | Value | Significance |
|----------|-------|-------------|
| A+T+C+G | 30 | Total nucleotide sum (digital root 3) |
| A+T | 15 | Complementary pair (digital root 6) |
| C+G | 15 | Complementary pair (digital root 6) |
| Compass sum | 9 | Any complementary cardinal positions sum to 9 |

**Implementation:** Already present in `m3.h` as `NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8}`. No changes needed to existing values. The FR here establishes the **derivation** as canonical, not just the values.

**Static Assertion:**
```c
_Static_assert(NUCLEOTIDE_ICHING_VALUE[M3_NUC_A] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_T] == 15,
               "Complementary pair A+T must sum to 15");
_Static_assert(NUCLEOTIDE_ICHING_VALUE[M3_NUC_C] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_G] == 15,
               "Complementary pair C+G must sum to 15");
_Static_assert(NUCLEOTIDE_ICHING_VALUE[M3_NUC_A] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_T]
             + NUCLEOTIDE_ICHING_VALUE[M3_NUC_C] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_G] == 30,
               "Nucleotide sum must be 30");
```

---

## Section II: M0 Purnata — The Quaternionic Ground (0000)

### FR 2.Q.1: #0-3-7 Purnata as .rodata Quaternionic Seed

**Requirement:** M0 MUST contain a canonical `.rodata` constant representing the quaternionic ground state — the null quaternion `q = 0 + 0i + 0j + 0k` — anchored at `#0-3-7 Purnata`. This is the first stable 4-fold world from which all downstream quaternionic algebra inherits.

**Ontological Position:**
- `#0-3-7` sits within the Archetypal Number Language branch (#0-3)
- Formulation: `(0-3) + 0/1 = (0-3+1)/4D`
- Name: Purnata = "Fullness", "Structural Completion"
- Dimensionality: 4D (1 scalar + 3 imaginary = quaternion)
- Coordinate: `4 ~ 3.5/4.0` (the bridge between Pattern and Context)

**The (0000) as Null Quaternion:**
M0's `(0000)` — the 4-fold zero — is `q = 0 + 0i + 0j + 0k`. All rotation is latent, none manifest. The Tetralemmic Position system (ZERO, PLUSMIN, NEG, POS, VOID) prefigures the quaternion components:

| Tetralemmic Position | Quaternion Component | Value |
|---------------------|---------------------|-------|
| TETRAL_ZERO (0) | w (real/scalar) | Neutral ground |
| TETRAL_PLUSMIN (±0) | Singularity | Fused 0/1 — the Spanda throb |
| TETRAL_NEG (-0) | -i (withholding axis) | Primal negation |
| TETRAL_POS (+0) | +i (affirmation axis) | Existent withholding |
| TETRAL_VOID (00) | j, k (recurrence) | Void generating depth |

**void_ops_t 4-Bit Operators as Quaternionic Primitives:**

| Bit | Operation | Quaternion Analogue |
|-----|-----------|-------------------|
| 0 | VOID_OP_TRANSCEND (-) | Negation/conjugation axis |
| 1 | VOID_OP_REFLECT (/) | Reflection/inversion axis |
| 2 | VOID_OP_GENERATE (×) | Quaternion multiplication (Spanda throb) |
| 3 | VOID_OP_SYNTHESIZE (+) | Quaternion addition/union |

**Cross-Branch Relations (from Neo4j dataset):**

```
#0-3-7 ──PROVIDES_QUATERNARY_WHOLENESS_FOUNDATION──→ #1-4 (QL Flowering)
#0-3-7 ──VIBRATIONAL_MULTIPLICATION──→ #2-0 (Parashakti Mathematical-Mystical Seed)
#0-3-7 ──ADAM_CHARGE──→ #2-1-2 (Tetralemma / Logical Lens)
#3-0   ──INHERITS_QUATERNION_FROM──→ #0-3-7 (Mahamaya Reception Ground)
```

**Implementation — .rodata constant:**

```c
/* m0.h addition */

/* The Quaternionic Ground — Purnata (#0-3-7)
 * q = 0 + 0i + 0j + 0k — all rotation latent, none manifest.
 * First stable 4-fold world. Template for all M1-M5 quaternionic structures.
 * Cross-branch: PROVIDES_QUATERNARY_WHOLENESS_FOUNDATION → #1-4,
 *               VIBRATIONAL_MULTIPLICATION → #2-0,
 *               INHERITS_QUATERNION_FROM ← #3-0 */
static const Quaternion PURNATA_QUATERNION_SEED = {
    .w = 0.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f
};
```

### FR 2.Q.2: Concrescence Extension to 12-Step Helix

**Requirement:** The Concrescence trace MUST be extended from 8 steps to **12 steps**, matching the full toroidal/Klein flow: 0→5 ascent (explicate), 5→0 inverted descent (implicate). This creates the complete helical structure mirroring M1's `RING_SIZE = 12`.

**Current State:** `CONCRESCENCE_STEPS = 8` in m0.h with 5 tetralemmic positions.

**New Architecture:**

```c
#define CONCRESCENCE_STEPS 12  /* was 8 — now matches RING_SIZE */

typedef struct {
    Tetralemmic_Position states[CONCRESCENCE_STEPS];  /* 12 steps */
    uint8_t              step_count;
    uint8_t              is_descending;  /* 0 = ascent (0-5), 1 = descent (5'-0') */
} Concrescence_Trace;
```

**The 12-Step Helix:**

| Step | Phase | Position | Covering | Quaternion Mapping |
|------|-------|----------|----------|-------------------|
| 0 | Ascent | TETRAL_ZERO | Explicate | q₀ = (1, 0, 0, 0) identity |
| 1 | Ascent | TETRAL_PLUSMIN | Explicate | q₁ = (0, 1, 0, 0) i-axis |
| 2 | Ascent | TETRAL_NEG | Explicate | q₂ = (0, 0, 1, 0) j-axis |
| 3 | Ascent | TETRAL_POS | Explicate | q₃ = (0, 0, 0, 1) k-axis |
| 4 | Ascent | TETRAL_VOID | Explicate | q₄ = synthesis |
| 5 | Ascent | TETRAL_ZERO (integration) | Explicate | q₅ = quintessence |
| 6 | Descent | TETRAL_ZERO' (inverted) | Implicate | q₆ = -q₅ |
| 7 | Descent | TETRAL_VOID' | Implicate | q₇ = -q₄ |
| 8 | Descent | TETRAL_POS' | Implicate | q₈ = -q₃ |
| 9 | Descent | TETRAL_NEG' | Implicate | q₉ = -q₂ |
| 10 | Descent | TETRAL_PLUSMIN' | Implicate | q₁₀ = -q₁ |
| 11 | Descent | TETRAL_ZERO (Möbius return) | Implicate | q₁₁ = -q₀ → requires 2nd pass for +q₀ |

**Step 11 → Step 0 (next cycle):** The quaternion returns to -identity after one full 12-step cycle (360°). Only after TWO complete cycles (720°, 24 steps) does the system return to +identity. This IS the SU(2) double-covering principle realised in the concrescence state machine.

**Static Assertion:**
```c
_Static_assert(CONCRESCENCE_STEPS == RING_SIZE,
               "Concrescence helix must match SU(2) ring size");
```

---

## Section III: Quaternion Algebra in M1

### FR 2.Q.3: Quaternion Arithmetic Operations

**Requirement:** The existing `Quaternion` struct in m1.h (16 bytes, w/x/y/z) MUST be activated with a complete set of arithmetic operations. These are pure functions operating on value types — no heap allocation, no side effects.

**Implementation:**

```c
/* m1.h — FR 2.Q.3: Quaternion Algebra */

/* Hamilton product — THE fundamental operation.
 * Noncommutative: quat_mul(a,b) ≠ quat_mul(b,a) in general.
 * This noncommutativity IS the epistemic asymmetry:
 * reading A→T gives different results than T→A. */
static inline Quaternion quat_mul(Quaternion a, Quaternion b) {
    return (Quaternion){
        .w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
        .x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
        .y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
        .z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w
    };
}

/* Conjugate: q* = (w, -x, -y, -z)
 * Geometrically: reverses the rotation direction. */
static inline Quaternion quat_conj(Quaternion q) {
    return (Quaternion){ .w = q.w, .x = -q.x, .y = -q.y, .z = -q.z };
}

/* Norm squared: |q|² = w² + x² + y² + z²
 * Already exists as quat_norm_sq(). Preserved. */

/* Normalize to unit quaternion (for rotation representation) */
static inline Quaternion quat_normalize(Quaternion q) {
    float n = 1.0f / sqrtf(quat_norm_sq(q));
    return (Quaternion){ .w = q.w*n, .x = q.x*n, .y = q.y*n, .z = q.z*n };
}

/* Negate: -q = (-w, -x, -y, -z)
 * Key property: q and -q represent the SAME rotation in SO(3)
 * but DIFFERENT states in SU(2). This IS the double-covering. */
static inline Quaternion quat_neg(Quaternion q) {
    return (Quaternion){ .w = -q.w, .x = -q.x, .y = -q.y, .z = -q.z };
}

/* Rotate a 3-vector by unit quaternion: v' = q * v * q*
 * where v is embedded as (0, vx, vy, vz) */
static inline Quaternion quat_rotate(Quaternion q, Quaternion v) {
    return quat_mul(quat_mul(q, v), quat_conj(q));
}

/* Spherical linear interpolation between two unit quaternions.
 * t in [0, 1]. Used for smooth traversal along the torus. */
static inline Quaternion quat_slerp(Quaternion a, Quaternion b, float t) {
    float dot = a.w*b.w + a.x*b.x + a.y*b.y + a.z*b.z;
    if (dot < 0.0f) { b = quat_neg(b); dot = -dot; }
    if (dot > 0.9995f) {
        /* Linear interpolation for nearly-identical quaternions */
        Quaternion r = {
            .w = a.w + t*(b.w - a.w), .x = a.x + t*(b.x - a.x),
            .y = a.y + t*(b.y - a.y), .z = a.z + t*(b.z - a.z)
        };
        return quat_normalize(r);
    }
    float theta = acosf(dot);
    float sin_theta = sinf(theta);
    float wa = sinf((1.0f-t)*theta) / sin_theta;
    float wb = sinf(t*theta) / sin_theta;
    return (Quaternion){
        .w = wa*a.w + wb*b.w, .x = wa*a.x + wb*b.x,
        .y = wa*a.y + wb*b.y, .z = wa*a.z + wb*b.z
    };
}
```

### FR 2.Q.4: Ring Position to Unit Quaternion Mapping

**Requirement:** Each of the 12 ring positions (0-11) MUST map to a canonical unit quaternion. The mapping MUST satisfy: `quat_from_ring(n) * quat_from_ring(m)` produces a quaternion corresponding to the composed torus traversal.

**The 12 Unit Quaternions:**

Positions 0-5 (ascent, explicate) map to rotations around the torus meridian.
Positions 6-11 (descent, implicate) are the negated quaternions of positions 5-0 respectively.

```c
/* m1.h — FR 2.Q.4: Ring Position → Unit Quaternion LUT */

/* 12 unit quaternions on the SU(2) group.
 * Position n maps to rotation by n×60° on the torus meridian.
 * Descent positions (6-11) are negations of ascent (5-0). */
static const Quaternion RING_QUATERNION_LUT[12] = {
    /* Ascent: 0-5 (explicate, 0°-300° in 60° steps) */
    [0]  = { .w = 1.0f,    .x = 0.0f,    .y = 0.0f,    .z = 0.0f    },  /* identity */
    [1]  = { .w = 0.866f,  .x = 0.5f,    .y = 0.0f,    .z = 0.0f    },  /* 60° */
    [2]  = { .w = 0.5f,    .x = 0.866f,  .y = 0.0f,    .z = 0.0f    },  /* 120° */
    [3]  = { .w = 0.0f,    .x = 1.0f,    .y = 0.0f,    .z = 0.0f    },  /* 180° */
    [4]  = { .w = -0.5f,   .x = 0.866f,  .y = 0.0f,    .z = 0.0f    },  /* 240° */
    [5]  = { .w = -0.866f, .x = 0.5f,    .y = 0.0f,    .z = 0.0f    },  /* 300° */
    /* Descent: 6-11 (implicate, negations of 5-0) */
    [6]  = { .w = 0.866f,  .x = -0.5f,   .y = 0.0f,    .z = 0.0f    },  /* 300°' */
    [7]  = { .w = 0.5f,    .x = -0.866f, .y = 0.0f,    .z = 0.0f    },  /* 240°' */
    [8]  = { .w = 0.0f,    .x = -1.0f,   .y = 0.0f,    .z = 0.0f    },  /* 180°' */
    [9]  = { .w = -0.5f,   .x = -0.866f, .y = 0.0f,    .z = 0.0f    },  /* 120°' */
    [10] = { .w = -0.866f, .x = -0.5f,   .y = 0.0f,    .z = 0.0f    },  /* 60°' */
    [11] = { .w = -1.0f,   .x = 0.0f,    .y = 0.0f,    .z = 0.0f    },  /* 0°' = -identity */
};

static inline Quaternion quat_from_ring_pos(QL_Tick tick) {
    return RING_QUATERNION_LUT[tick % RING_SIZE];
}
```

**Key Property:** `RING_QUATERNION_LUT[11]` = -identity. After 12 steps (one cycle), the quaternion is NEGATED. After 24 steps (two cycles = 720°), it returns to +identity. This IS the SU(2) double cover in the LUT.

### FR 2.Q.5: Bimba/Pratibimba as Quaternion Source/Reflection

**Requirement:** The six Ananda matrices (BIMBA through QUINTESSENCE) MUST be interpretable as quaternionic operations on the torus. The Bimba matrix is the source rotation; the Pratibimba matrix is the reflected rotation.

**Mapping:**

| Ananda Matrix | Index | Quaternion Role |
|--------------|-------|----------------|
| MATRIX_BIMBA | 0 | Source quaternion (identity rotation) |
| MATRIX_PRATIBIMBA | 1 | Conjugate quaternion (reflected rotation) |
| MATRIX_SUM | 2 | Quaternion addition (superposition) |
| MATRIX_DIFF_A | 3 | Left-difference: q_a * conj(q_b) |
| MATRIX_DIFF_B | 4 | Right-difference: conj(q_a) * q_b |
| MATRIX_QUINTESSENCE | 5 | Norm / magnitude (scalar extraction) |

**The asymmetry between DIFF_A and DIFF_B is noncommutativity made manifest:**
`DIFF_A ≠ DIFF_B` precisely because `quat_mul(a, conj(b)) ≠ quat_mul(conj(a), b)`.

---

## Section IV: Non-Dual and Dual Codon Taxonomy

### FR 2.Q.6: Complete Non-Dual Codon Classification

**Requirement:** M3 MUST encode the full non-dual codon taxonomy as `.rodata` classification tables. Non-dual codons are those where the positive and negative forms are identical — they are the fixed points of the quaternionic rotation.

**The Three Classes:**

#### A. Perfect Palindromic (4 unique codons, 24 individuals across 3 matrices)

Self-same trinitarian extremes. Appear 6× each across all 3 matrices (YES matrix repetitions).

| Codon | I Ching Sum | Hexagram | Element | Tarot | Quaternion Class |
|-------|------------|----------|---------|-------|-----------------|
| AAA | 18 | H2 (K'un) | Water×3 | Ace of Cups | SU(2) identity — pure scalar |
| TTT | 18 | H1 (Ch'ien) | Fire×3 | Ace of Wands | SU(2) identity — pure scalar |
| CCC | 21 | H29 (K'an) | Earth×3 | Ace of Pentacles | SU(2) identity — pure scalar |
| GGG | 24 | H30 (Li) | Air×3 | Ace of Swords | SU(2) identity — pure scalar |

**NOTE:** The sums differ (18, 18, 21, 24) because the underlying values are {6, 9, 7, 8}, NOT symmetric. But the rotational behaviour IS identical: each is a fixed point under ALL matrix transformations.

#### B. Imperfect Palindromic (12 unique codons, 24 individuals across 3 matrices)

XyX pattern — outer nucleotides identical, middle differs. Appear 2× each (NO matrix repetitions).

| Codon | Sum | Hexagram | Codon | Sum | Hexagram |
|-------|-----|----------|-------|-----|----------|
| ATA | 21 | H54 | TAT | 24 | H17 |
| AGA | 20 | H53 | TCT | 23 | H54 |
| ACA | 19 | H27 | TGT | 23 | H28 |
| CGC | 22 | H18 | GAG | 22 | H18 |
| CTC | 23 | H17 | GCG | 23 | H53 |
| CAC | 20 | H62 | GTG | 23 | H61 |

**Quaternion Class:** SU(2) 90° rotations — the half-way points. These codons represent the **j-axis** of the quaternionic space.

#### C. Non-Palindromic Non-Dual (24 unique codons in 12 pairs, 48 individuals)

Distinct 3-letter sequences that are nonetheless non-dual (positive = negative). Appear 2× each (NO matrix repetitions). These form **12 transformation pairs**:

| Pair A | Hex | Pair B | Hex |
|--------|-----|--------|-----|
| AAT | H54 | ATT | H45 |
| TTA | H34 | TAA | H24 |
| AAC | H16 | ACC | H3 |
| TTG | H9 | TGG | H50 |
| AAG | H23 | AGG | H56 |
| TTC | H43 | TCC | H60 |
| CCG | H59 | CGG | H50 |
| GGC | H22 | GCC | H39 |
| CCA | H4 | CAA | H15 |
| GGT | H49 | GTT | H10 |
| CCT | H40 | CTT | H25 |
| GGA | H37 | GAA | H46 |

**Quaternion Class:** SU(2) 180° phase shifts — the dynamic transformers that sit INSIDE the clock as "24 hours."

#### D. Summary Table

| | Perfect Palindromic | Imperfect Palindromic | Non-Palindromic | All Non-Dual |
|-|--------------------|-----------------------|-----------------|-------------|
| Total Unique | 4 | 12 | 24 | 40 |
| Total (Non)-Pairs | 12 | 12 | 24 | 48 |
| Individuals | 24 | 24 | 48 | 96 |
| Unique Per Matrix | 4 | 4 | 8 | 16 |
| (Non)-Pairs Per Matrix | 8 | 8 | 16 | 32 |
| Matrix Repetitions | Yes | No | No | — |

**Implementation — Classification Bitmasks:**

```c
/* m3.h — FR 2.Q.6: Non-Dual Codon Classification */

#define M3_NONDUAL_PERFECT_PALINDROMIC  0x01  /* AAA, TTT, CCC, GGG */
#define M3_NONDUAL_IMPERFECT_PALINDROMIC 0x02 /* ATA, TAT, CGC, etc. */
#define M3_NONDUAL_NON_PALINDROMIC      0x04  /* AAT↔ATT, TTA↔TAA, etc. */
#define M3_DUAL_CODON                   0x00  /* All other codons */

/* Classification LUT: one byte per codon, indexed 0-63 */
extern const uint8_t M3_CODON_NONDUAL_CLASS[64];

/* Non-dual pair LUT: for non-palindromic non-dual codons,
 * maps codon → its paired codon. 0xFF = no pair (palindromic or dual). */
extern const uint8_t M3_NONDUAL_PAIR[64];

/* Predicate: is this codon non-dual in any class? */
static inline int m3_is_nondual(uint8_t codon_id) {
    return M3_CODON_NONDUAL_CLASS[codon_id] != M3_DUAL_CODON;
}

/* Predicate: is this codon palindromic (perfect or imperfect)? */
static inline int m3_is_palindromic(uint8_t codon_id) {
    return M3_CODON_NONDUAL_CLASS[codon_id] & (M3_NONDUAL_PERFECT_PALINDROMIC
                                               | M3_NONDUAL_IMPERFECT_PALINDROMIC);
}
```

### FR 2.Q.7: Dual Codon Clock Architecture

**Requirement:** The dual codons MUST be structured as the 360° Codon-Hexagram Clock with precise geometric distribution.

**Structure:**
- **24 palindromic non-dual codons** = stable attractors, marked OUTSIDE the clock as "months and half months" — they transcend the rotational cycle
- **24 non-palindromic non-dual codons** = dynamic transformers, "24 hours" INSIDE the clock
- **336 dual codon positive/negative pairs** = the remaining space
- **24 + 336 = 360 pairs** forming the 360° degree positions of the clock
- The **inverse Hexagram-Codon Clock** intersects the codon clock **orthogonally**

**Clock Geometry:**

```
                    OUTSIDE (transcendent markers)
                    24 palindromic non-dual codons
                    at 15° intervals (360/24)
                    ┌─────────────────────────┐
                    │                         │
                    │   CODON CLOCK (360°)    │
                    │   360 pairs at 1°/pair  │
                    │                         │
                    │   24 non-palindromic    │
                    │   + 336 dual pairs      │
                    │                         │
                    └─────────────────────────┘
                              ⊥
                    ┌─────────────────────────┐
                    │                         │
                    │  HEXAGRAM CLOCK (360°)  │
                    │  64 hexagrams           │
                    │  Orthogonal to          │
                    │  Codon Clock            │
                    │                         │
                    └─────────────────────────┘
```

**The Orthogonal Intersection:**
The codon clock and hexagram clock intersect at 90°. The tarot layer performs quaternionic multiplication to translate between them — a card's quaternion maps a position on the codon clock to a position on the hexagram clock (and vice versa). This orthogonal intersection provides the j and k axes of the full quaternionic space, with the codon clock's own 360° rotation providing the i axis.

---

## Section V: The Three Transformation Matrices

### FR 2.Q.8: Matrix Definitions with Quaternionic Interpretation

**Requirement:** The three transformation matrices MUST be formally defined with their full trigram-nucleotide mappings AND their quaternionic interpretation as rotation operators.

**Matrix 1: DNA-Complementary (A↔T, C↔G) — Clockwise Flow**

| Pair | Nucleotides | Sum | Diff | Trigram | Compass |
|------|-------------|-----|------|---------|---------|
| Self | A-A | 12 | 0 | K'un ☷ | p8 (NW) |
| Self | T-T | 18 | 0 | Ch'ien ☰ | p1 (N) |
| Self | C-C | 14 | 0 | K'an ☵ | p6 (SW) |
| Self | G-G | 16 | 0 | Li ☲ | p3 (E) |
| Hetero | A-T | 15 | -3 | Tui ☱ | p2 (NE) |
| Hetero | T-A | 15 | +3 | Ken ☶ | p7 (W) |
| Hetero | C-G | 15 | -1 | Sun ☴ | p5 (S) |
| Hetero | G-C | 15 | +1 | Chen ☳ | p4 (SE) |

**Quaternionic Role:** Standard transcription — the Watson-Crick base pairing. This matrix performs **i-axis** rotations.

**Matrix 2: Moving↔Resting (A↔G, T↔C) — Hybrid/Metabolic**

| Pair | Nucleotides | Sum | Diff | Trigram | Compass |
|------|-------------|-----|------|---------|---------|
| Self | A-A | 12 | 0 | K'un ☷ | p8 |
| Self | T-T | 18 | 0 | Ch'ien ☰ | p1 |
| Self | C-C | 14 | 0 | K'an ☵ | p6 |
| Self | G-G | 16 | 0 | Li ☲ | p3 |
| Hetero | A-G | 14 | -2 | Ken ☶ | p7 |
| Hetero | G-A | 14 | +2 | Sun ☴ | p5 |
| Hetero | T-C | 16 | +2 | Tui ☱ | p2 |
| Hetero | C-T | 16 | -2 | Chen ☳ | p4 |

**Quaternionic Role:** Cross-dynamic pairing — moving paired with resting. This matrix performs **j-axis** rotations.

**Matrix 3: Same-Quality (A↔C, T↔G) — Anticlockwise Resonance**

| Pair | Nucleotides | Sum | Diff | Trigram | Compass |
|------|-------------|-----|------|---------|---------|
| Self | A-A | 12 | 0 | K'un ☷ | p8 |
| Self | T-T | 18 | 0 | Ch'ien ☰ | p1 |
| Self | C-C | 14 | 0 | K'an ☵ | p6 |
| Self | G-G | 16 | 0 | Li ☲ | p3 |
| Hetero | A-C | 13 | -1 | Chen ☳ | p4 |
| Hetero | C-A | 13 | +1 | Ken ☶ | p7 |
| Hetero | T-G | 17 | +1 | Sun ☴ | p5 |
| Hetero | G-T | 17 | -1 | Tui ☱ | p2 |

**Quaternionic Role:** Same-polarity matching — weakest bonds. This matrix performs **k-axis** rotations.

**The Three Matrices as Quaternion Basis:**
- Matrix 1 (complementary) = **i** rotation
- Matrix 2 (moving/resting) = **j** rotation
- Matrix 3 (same-quality) = **k** rotation
- The **identity** (scalar/w) is the self-same pairs (A-A, T-T, C-C, G-G) — shared by all three matrices

**The Hamilton identity `ij = k` maps to:** Complementary transformation composed with Moving/Resting transformation produces Same-Quality transformation. And `ji = -k` — the composition in reverse order produces the ANTICLOCKWISE same-quality transformation.

**Compass Law:** `p(n) + p(9-n) = 9` for all complementary cardinal positions. This is invariant across all three matrices.

**Implementation — Matrix Selector:**

```c
/* m3.h — FR 2.Q.8: Matrix-Aware Transformation */

typedef enum {
    M3_MATRIX_COMPLEMENTARY = 0,  /* A↔T, C↔G — i-axis */
    M3_MATRIX_MOVING_RESTING = 1, /* A↔G, T↔C — j-axis */
    M3_MATRIX_SAME_QUALITY = 2,   /* A↔C, T↔G — k-axis */
    M3_MATRIX_COUNT = 3
} M3_Matrix_Type;

/* Heterogeneous pair mapping per matrix.
 * Index: [matrix][nucleotide] → paired nucleotide.
 * Self-same pairs (A→A etc.) are the same across all matrices. */
extern const uint8_t M3_MATRIX_PAIR[3][4];
/* M3_MATRIX_PAIR[0] = {1, 0, 3, 2}  (A↔T, C↔G)
 * M3_MATRIX_PAIR[1] = {3, 2, 1, 0}  (A↔G, T↔C)
 * M3_MATRIX_PAIR[2] = {2, 3, 0, 1}  (A↔C, T↔G) */

/* The quaternion rotation axis for each matrix */
static const Quaternion M3_MATRIX_QUATERNION_AXIS[3] = {
    [M3_MATRIX_COMPLEMENTARY]  = { .w=0, .x=1, .y=0, .z=0 },  /* i */
    [M3_MATRIX_MOVING_RESTING] = { .w=0, .x=0, .y=1, .z=0 },  /* j */
    [M3_MATRIX_SAME_QUALITY]   = { .w=0, .x=0, .y=0, .z=1 },  /* k */
};
```

---

## Section VI: The 8-Fold Codon State System

### FR 2.Q.9: Codon Quaternion Encoding

**Requirement:** Each of the 64 codons MUST be encodable as a quaternion using the Sum/Difference/Prime/Mod formula. The 8 rotational states at 45° increments represent the codon's possible expressions under environmental modulation.

**Quaternion Encoding Formula:**

```
q_codon = Sum·1 + Difference·i + Prime·j + Mod·k
```

Where for a codon with nucleotides (n1, n2, n3):
- **Sum** (w, scalar): `ICHING_VAL[n1] + ICHING_VAL[n2] + ICHING_VAL[n3]`
- **Difference** (x, i-axis): `(ICHING_VAL[n1] - ICHING_VAL[n3])` — directional asymmetry, outer minus inner
- **Prime** (y, j-axis): nearest Euler prime attractor contribution (related to 41, 43)
- **Mod** (z, k-axis): `Sum % 6` — modular class alignment with 6-fold QL

**The 8 Rotational States:**

Each codon expresses through 8 states at 45° increments. These arise from the 7 pair-derived expressions plus the direct sum:

| State | Angle | Expression | Description |
|-------|-------|-----------|-------------|
| 0 | 0° | n1 + n2 + n3 | Direct 3-nucleotide sum |
| 1 | 45° | (n1, n2) pair | Outer-middle dinucleotide |
| 2 | 90° | (n2, n3) pair | Middle-inner dinucleotide |
| 3 | 135° | (n1, n3) pair | Outer-inner dinucleotide |
| 4 | 180° | n1 alone | Outer nucleotide isolated |
| 5 | 225° | n2 alone | Middle nucleotide isolated |
| 6 | 270° | n3 alone | Inner nucleotide isolated |
| 7 | 315° | Matrix-context derived | Environmental composite |

**Implementation:**

```c
/* m3.h — FR 2.Q.9: Codon Quaternion Encoding */

typedef struct {
    Quaternion q;           /* Codon quaternion (Sum, Diff, Prime, Mod) */
    uint8_t   active_state; /* Current rotational state 0-7 */
    uint8_t   codon_id;     /* 6-bit codon index */
} M3_Codon_Quaternion;

/* Encode a codon as its base quaternion (state 0, direct sum) */
static inline Quaternion m3_quat_from_codon(uint8_t codon_id) {
    uint8_t n1 = (codon_id >> 4) & 0x03;
    uint8_t n2 = (codon_id >> 2) & 0x03;
    uint8_t n3 = (codon_id)      & 0x03;
    uint8_t v1 = NUCLEOTIDE_ICHING_VALUE[n1];
    uint8_t v2 = NUCLEOTIDE_ICHING_VALUE[n2];
    uint8_t v3 = NUCLEOTIDE_ICHING_VALUE[n3];
    uint8_t sum = v1 + v2 + v3;
    int8_t  diff = (int8_t)v1 - (int8_t)v3;
    return (Quaternion){
        .w = (float)sum,
        .x = (float)diff,
        .y = (float)(sum >= 41 ? (sum <= 43 ? sum : 0) : 0),  /* Prime attractor */
        .z = (float)(sum % 6)
    };
}

/* Rotate codon to a specific state (0-7) by applying 45° × state rotation */
static inline Quaternion m3_quat_codon_state(uint8_t codon_id, uint8_t state) {
    Quaternion base = m3_quat_from_codon(codon_id);
    if (state == 0) return base;
    /* Rotation by state × 45° = state × π/4 around the torus axis */
    float angle = (float)state * 0.7853981633974483f;  /* π/4 */
    Quaternion rot = {
        .w = cosf(angle * 0.5f),
        .x = sinf(angle * 0.5f),
        .y = 0.0f,
        .z = 0.0f
    };
    return quat_mul(rot, base);
}

/* Determine active state given environmental quaternion input */
static inline uint8_t m3_quat_active_state(Quaternion env, uint8_t codon_id) {
    Quaternion base = m3_quat_from_codon(codon_id);
    Quaternion composed = quat_mul(env, base);
    /* Map the composed quaternion's angle to 0-7 state */
    float angle = atan2f(composed.x, composed.w);
    if (angle < 0) angle += 6.2831853f;  /* 2π */
    return (uint8_t)(angle / 0.7853981633974483f) % 8;  /* 45° buckets */
}
```

### FR 2.Q.10: Prime Attractor Stabilisation (Euler Primes 41, 43)

**Requirement:** Codon pairs whose I Ching sums reach 41 or 43 MUST be flagged as **prime attractor lock points**. These represent stable states where the RNA polymerase pauses during transcription — checkpoints in the quaternionic rotation.

**Known Prime Attractor Pairs:**

| Codon A | Codon B | Sum | Prime | Stability |
|---------|---------|-----|-------|-----------|
| ACA (19) | ACT (22) | 41 | Euler | Maximum lock |
| ACG (21) | ACT (22) | 43 | Euler | Secondary lock |

**Implementation:**

```c
/* m3.h — FR 2.Q.10: Prime Attractor Detection */

#define M3_EULER_PRIME_41  41
#define M3_EULER_PRIME_43  43

/* Check if a codon pair sum hits a prime attractor */
static inline int m3_is_prime_attractor(uint8_t codon_a, uint8_t codon_b) {
    uint8_t sum_a = get_codon_iching_sum(codon_a);
    uint8_t sum_b = get_codon_iching_sum(codon_b);
    uint16_t total = (uint16_t)sum_a + (uint16_t)sum_b;
    return (total == M3_EULER_PRIME_41 || total == M3_EULER_PRIME_43);
}

/* The prime attractor check MUST be consulted before any
 * quaternionic state transition. If the composed pair hits
 * 41 or 43, the transition PAUSES — the system stabilises
 * at that point before proceeding. */
```

---

## Section VII: The Four-System Transcriptional Pipeline

### FR 2.Q.11: Hexagram ↔ DNA ↔ RNA ↔ Codon-Projection Integration

**Requirement:** The four systems MUST be implemented as distinct but fully integrated layers with the three matrices serving as transformation operators between them.

**System 1: Hexagrams (I Ching) — 64 patterns of flow**

| Property | Value |
|----------|-------|
| Count | 64 |
| Address space | 6-bit (upper_trigram << 3 | lower_trigram) |
| Trigrams | 8 (Qian, Kun, Zhen, Xun, Kan, Li, Gen, Dui) |
| Each hexagram | 6 lines, each valued 6/7/8/9 (the nucleotide values) |
| Changing lines | 6 (old yin) and 9 (old yang) — moving nucleotides A and T |
| Stable lines | 7 (young yin) and 8 (young yang) — resting nucleotides C and G |
| Complement | `id ^ 0x3F` (bitwise complement) |

**System 2: DNA Codons — 64 eternal archives**

| Property | Value |
|----------|-------|
| Count | 64 |
| Address space | 6-bit (n1 << 4 | n2 << 2 | n3) |
| Nucleotides | 4 (A=6, T=9, C=7, G=8) |
| Contains | Thymine (T) — the methylated base distinguishing DNA from RNA |
| Nature | Static, immutable blueprint |

**System 3: RNA Codons — Active messenger**

| Property | Value |
|----------|-------|
| Functional | 37 codons (T→U transcriptional pathway active) |
| Dark (non-transcribed) | 27 codons (the "dark lunar half") |
| Ratio | 27/37 ≈ 0.73 (the 37/73 archetypal randomness signature) |
| T→U gate | Sacred transubstantiation: static archive → dynamic messenger |
| U-based pairs | 7 fundamental pairs generate 28 RNA codons (4×4 + 3×4) |

**System 4: Codon-Projections — Superposition of DNA and RNA**

| Property | Value |
|----------|-------|
| Total operators | 80 (64 DNA + 16 RNA variants) |
| Tarot correspondence | 78 cards + 2 transcendent operators (Cosmic Fool/World) |
| Nature | The complete consciousness transcription system |

**The DNA/RNA Superposition Flag (already in M3 spec):**

```c
/* m3.h — FR 2.Q.11: RNA phase flag */
/* Already exists in M3_IChing_State.is_rna_phase.
 * When set, codons containing T use U-form transcription rules.
 * The T→U gate changes the codon's quaternionic state but NOT
 * its bitboard position — the address space remains 64-bit. */
```

**Transcription Pipeline Implementation:**

```c
/* m3.h — FR 2.Q.11: Symbolic Transcription */

/* The transcriptional pathway mirrors biological DNA→RNA→Protein:
 *
 * 1. DNA codon (64, static) selected by bitboard position
 * 2. T→U gate: if RNA phase, thymine codons transform
 * 3. Amino acid target: codon_to_aa[64] mapping (22 amino acids + stops)
 * 4. Tarot projection: codon + RNA variant → one of 80 operators
 *
 * The three matrices enable translation BETWEEN systems:
 *   Matrix 1 (complementary) = DNA strand pairing (A↔T, C↔G)
 *   Matrix 2 (moving/resting) = RNA metabolic bridge (A↔G, T↔C)
 *   Matrix 3 (same-quality)   = Codon-projection resonance (A↔C, T↔G)
 */

/* RNA transcription: map DNA codon to RNA codon */
static inline uint8_t m3_transcribe_to_rna(uint8_t dna_codon) {
    /* T→U substitution: replace T (0b01) with U.
     * In our encoding, U occupies T's slot but marks RNA phase. */
    return dna_codon;  /* Address unchanged; is_rna_phase flag does the work */
}

/* The 37/27 split: which codons are RNA-functional? */
extern const uint64_t M3_RNA_FUNCTIONAL_MASK;  /* 37 bits set */
extern const uint64_t M3_RNA_DARK_MASK;        /* 27 bits set, complement */

_Static_assert(__builtin_popcountll(M3_RNA_FUNCTIONAL_MASK) == 37,
               "37 functional RNA codons");

/* Codon-to-amino-acid: the 22 amino acids (20 standard + selenocysteine + pyrrolysine)
 * Already exists as M3_CODON_TO_AA[64]. Maps to 0-21 (amino acids) or 0xFF (stop). */

/* The 80-fold projection: 64 DNA codons + 16 RNA-specific variants.
 * Maps directly to 78 Tarot cards + 2 transcendent operators. */
#define M3_PROJECTION_OPERATORS  80
#define M3_TAROT_CARDS           78
#define M3_TRANSCENDENT_OPS      2   /* Cosmic Fool (0/XXII) + World */
```

---

## Section VIII: Tarot as Quaternionic Modulator

### FR 2.Q.12: Minor Arcana Codon Mapping (56 Cards)

**Requirement:** The 56 Minor Arcana MUST be mapped to specific codons via the four suits, with court cards providing compass/rotational dynamics.

**The Four Suits:**

| Suit | Nucleotide | Yin/Yang | Element | I Ching Value |
|------|-----------|---------|---------|---------------|
| Cups | A (Adenine) | Moving Yin | Water | 6 |
| Wands | T (Thymine) | Moving Yang | Fire | 9 |
| Pentacles | C (Cytosine) | Resting Yin | Earth | 7 |
| Swords | G (Guanine) | Resting Yang | Air | 8 |

**Cups (A-family):**

| Card | Codon | I Ching Sum | Notes |
|------|-------|-------------|-------|
| Ace | AAA | 18 | Perfect palindromic, trinitarian extreme |
| 2 | AAG | 20 | |
| 3 | AAT | 21 | |
| **4 (Portal)** | **ACC** | **20** | **Balanced yin stability anchor** |
| 5 | ATG | 22 | |
| 6 | AGA | 20 | Imperfect palindromic |
| 7 | AGT | 23 | |
| 8 | AGG | 22 | |
| 9 | ATT | 24 | |
| 10 | ATA | 21 | Imperfect palindromic |
| Queen | AAC | 19 | Court card |
| Princess | ACA | 19 | Court card, imperfect palindromic |
| King | ATC + ACT | 22 / 20 | Dual court card |
| Prince | ACG + AGC | 21 / 21 | Dual court card |

**Wands (T-family):**

| Card | Codon | I Ching Sum | Notes |
|------|-------|-------------|-------|
| Ace | TTT | 27 | Perfect palindromic, trinitarian extreme |
| 2 | TTA | 24 | |
| 3 | TTC | 25 | |
| **4 (Portal)** | **TGG** | **25** | **Balanced yang stability anchor** |
| 5 | TAC | 22 | |
| 6 | TCA | 22 | |
| 7 | TCC | 25 | |
| 8 | TAA | 21 | |
| 9 | TCT | 25 | Imperfect palindromic |
| 10 | TAT | 24 | Imperfect palindromic |
| King | TTG | 26 | Court card |
| Prince | TGT | 26 | Court card, imperfect palindromic |
| Queen | TCG + TGC | 24 / 24 | Dual court card |
| Princess | TAG + TGA | 23 / 23 | Dual court card |

**Pentacles (C-family):**

| Card | Codon | I Ching Sum | Notes |
|------|-------|-------------|-------|
| Ace | CCC | 21 | Perfect palindromic |
| 2 | CCG | 22 | |
| 3 | CCT | 23 | |
| **4 (Portal)** | **CAA** | **19** | **Balanced yin stability anchor** |
| 5 | CGC | 22 | Imperfect palindromic |
| 6 | CGG | 23 | |
| 7 | CGT | 22 | |
| 8 | CTG | 24 | |
| 9 | CTT | 23 | |
| 10 | CTA | 20 | |
| Queen | CAC | 20 | Court card, imperfect palindromic |
| Princess | CAG | 21 | Court card |
| King | CAT + CTA | 20 / 20 | Dual court card |
| Prince | CGA + CCA | 21 / 20 | Dual court card |

**Swords (G-family):**

| Card | Codon | I Ching Sum | Notes |
|------|-------|-------------|-------|
| Ace | GGG | 24 | Perfect palindromic |
| 2 | GGA | 22 | |
| 3 | GGC | 23 | |
| **4 (Portal)** | **GTT** | **26** | **Balanced yang stability anchor** |
| 5 | GAC | 21 | |
| 6 | GAG | 22 | Imperfect palindromic |
| 7 | GCA | 21 | |
| 8 | GCC | 22 | |
| 9 | GAA | 20 | |
| 10 | GCT | 22 | |
| King | GTG | 24 | Court card, imperfect palindromic |
| Prince | GGT | 25 | Court card |
| Queen | GAT + GTA | 23 / 23 | Dual court card |
| Princess | GCT + GTC | 22 / 22 | Dual court card |

**Portal Cards (4s):** The four 4-of-suit cards are stability anchors — they sit at the harmonic balance point of each elemental family. They are the quaternionic identity elements within their suit.

**Court Cards as Compass Rotators:** Each suit has 4 court cards providing 8-fold rotational capacity:
- **King**: Pure authority of the suit's element (single codon)
- **Queen**: Balanced harmony with opposing polarity (paired codon)
- **Prince**: Strategic action (single codon)
- **Princess**: Receptive potential (paired codon)

Dual court cards (King, Queen, Prince, Princess with paired codons) represent **quaternionic conjugate pairs** — two codons that together define a rotation axis.

### FR 2.Q.13: Major Arcana as Transcription Pathways (22 Cards)

**Requirement:** The 22 Major Arcana MUST correspond to the amino acid transcription pathways — the archetypal transformations that convert genetic information into manifested form.

**Correspondence:**
- 20 standard amino acids = 20 Major Arcana (I-XX)
- Selenocysteine (#21) = XXI (The World / Universe)
- Pyrrolysine (#22) = 0/XXII (The Fool)
- Start codon (Methionine/AUG) = The Magician (I)
- Stop codons = Death (XIII) — the necessary ending that enables new cycles

**The 22 Major Arcana function as "transcriptional enzymes"** — they don't sit on either clock but rather define the PATHWAYS between codon clock positions and hexagram clock positions. Each Major Arcanum governs a class of quaternionic transformations.

### FR 2.Q.14: Tarot Quaternionic Modulation Between Clocks

**Requirement:** The Tarot layer MUST function as the quaternionic bridge between Clock 1 (codon) and Clock 2 (hexagram). A card's quaternion maps a position on one clock to a position on the other.

**Implementation:**

```c
/* m3.h — FR 2.Q.14: Tarot Quaternionic Bridge */

typedef struct {
    uint8_t    card_id;        /* 0-77 (78 Tarot cards) or 78-79 (transcendent) */
    uint8_t    suit;           /* 0-3 for Minor, 0xFF for Major */
    uint8_t    rank;           /* 0-13 for Minor, 0-21 for Major */
    uint8_t    primary_codon;  /* 6-bit codon (Minor) or amino acid (Major) */
    uint8_t    shadow_codon;   /* For dual court cards, or 0xFF */
    Quaternion rotation;       /* The card's quaternionic transformation */
} M3_Tarot_Quaternion;

/* The 78 Tarot cards + 2 transcendent operators */
extern const M3_Tarot_Quaternion M3_TAROT_QUATERNIONS[80];

/* Apply a Tarot card's quaternion to translate between clocks:
 * codon_clock_pos → hexagram_clock_pos (or vice versa) */
static inline uint8_t m3_tarot_translate(
    uint8_t card_id,
    uint8_t source_pos,
    int codon_to_hexagram  /* 1 = codon→hex, 0 = hex→codon */
) {
    Quaternion q = M3_TAROT_QUATERNIONS[card_id].rotation;
    if (!codon_to_hexagram) q = quat_conj(q);  /* Reverse direction */
    Quaternion pos_q = m3_quat_from_codon(source_pos);
    Quaternion result = quat_mul(q, quat_mul(pos_q, quat_conj(q)));
    /* Extract angular position from result quaternion */
    float angle = atan2f(result.x, result.w);
    if (angle < 0) angle += 6.2831853f;
    return (uint8_t)((angle / 6.2831853f) * 64.0f) % 64;
}
```

---

## Section IX: DET Quaternionic Overlay

### FR 2.Q.15: Bitwise DET + Quaternionic State Selection

**Requirement:** The existing DET (Discrete Epistemic Transform) via `M2_TO_M3_CYMATIC_PROJECTION[72]` MUST be preserved exactly as-is. The quaternionic overlay operates as a **second pass** that determines the rotational state of each active bit.

**Architecture:**

```
PASS 1 (existing, unchanged):
  M2 vibrational state (72-byte)
    → M2_TO_M3_CYMATIC_PROJECTION[72] (bitwise OR)
    → M3 bitboard (uint64_t) — WHICH codons are active

PASS 2 (new, quaternionic overlay):
  For each active bit in M3 bitboard:
    → Current torus position (QL_Tick 0-11) → ring quaternion
    → M2 elemental signature → element quaternion
    → Matrix type (complementary/moving-resting/same-quality) → axis quaternion
    → quat_mul(ring_q, quat_mul(elem_q, axis_q)) → composed quaternion
    → m3_quat_active_state(composed_q, codon_id) → state 0-7

Result: Each active codon now has BOTH a bitboard presence AND a rotational state.
```

**Implementation:**

```c
/* m3.h — FR 2.Q.15: DET with Quaternionic Overlay */

typedef struct {
    uint64_t   active_mask;     /* From bitwise DET (Pass 1) */
    uint8_t    codon_states[64]; /* Rotational state 0-7 per codon (Pass 2) */
    Quaternion composed_q;      /* The overall composed quaternion */
    QL_Tick    torus_tick;      /* Current torus position */
} M3_DET_Overlay_Result;

/* Full DET with quaternionic overlay */
M3_DET_Overlay_Result m3_det_with_quaternion(
    const M2_Root* m2,
    const M3_Root* m3,
    QL_Tick        torus_tick,
    M3_Matrix_Type matrix
);
```

---

## Section X: Integral Symmetry Constants

### FR 2.Q.16: The 360° Integral Invariant

**Requirement:** The system MUST enforce that the sum of all positive-positive (pp) codon evaluations across all 64 codons equals exactly 360. This is the M3 integral invariant.

**Suit Contributions:**

| Suit | Element | Nucleotide | (pp) Sum |
|------|---------|-----------|----------|
| Cups | Water | A | 84 |
| Wands | Fire | T | 96 |
| Pentacles | Earth | C | 88 |
| Swords | Air | G | 92 |
| **Total** | | | **360** |

**Implementation (already exists):**

```c
_Static_assert(M3_SUIT_A + M3_SUIT_T + M3_SUIT_C + M3_SUIT_G == M3_INTEGRAL_INVARIANT,
               "Integral symmetry: suit pp-sums must total 360");
/* M3_INTEGRAL_INVARIANT = 360 (already defined in m3.h) */
```

### FR 2.Q.17: The 4-Valence System as Quaternion Basis

**Requirement:** The existing `M3_CodonEvaluation` struct (pp, mm, mp, pm) MUST be formally recognised as a quaternion in disguise. The mapping is:

| M3_CodonEvaluation | Quaternion Component | Meaning |
|--------------------|--------------------|---------|
| pp (+,+) | w (scalar/real) | Positive resonance integral |
| mm (-,-) | x (i-axis) | Negative resonance integral |
| mp (-,+) | y (j-axis) | Ascending resonance |
| pm (+,-) | z (k-axis) | Descending resonance |

**Implementation — Conversion:**

```c
/* m3.h — FR 2.Q.17: CodonEvaluation ↔ Quaternion Isomorphism */

static inline Quaternion m3_eval_to_quat(M3_CodonEvaluation eval) {
    return (Quaternion){
        .w = (float)eval.pp,
        .x = (float)eval.mm,
        .y = (float)eval.mp,
        .z = (float)eval.pm
    };
}

static inline M3_CodonEvaluation m3_quat_to_eval(Quaternion q) {
    return (M3_CodonEvaluation){
        .pp = (int8_t)q.w,
        .mm = (int8_t)q.x,
        .mp = (int8_t)q.y,
        .pm = (int8_t)q.z
    };
}
```

**The compose_rotational_state() function SHOULD be interpretable as quaternion multiplication:**
When two `M3_CodonEvaluation` values are composed, the result follows the same algebraic structure as Hamilton product — the noncommutativity of `(mp, pm)` vs `(pm, mp)` is the j/k axis noncommutativity of `ij = k, ji = -k`.

---

## Section XI: The 720° Double-Covering Principle

### FR 2.Q.18: SU(2) → SO(3) in the Codon State Space

**Requirement:** The system MUST enforce that a full traversal of the 64-codon space across both explicate and implicate layers requires **720° (two complete 360° passes)** to return to identity. This is the SU(2) double-covering of SO(3) realised in the symbolic transcription engine.

**Why 720°:**
- π₁(T²) = Z⊕Z — two independent 2π generators on the genus-1 torus
- A 360° rotation returns the codon to its **negated** quaternion state (same SO(3) rotation, different SU(2) spinor)
- Only at 720° does the spinor return to +identity
- The "negated" state is the **implicate phase** — the shadow covering where all codons express through their inverted aspect

**Implementation:**

```c
/* m1.h — FR 2.Q.18: 720° Double-Covering Enforcement */

/* Already enforced: */
_Static_assert(DOUBLE_COVER_STEPS == 12u, "SU(2) requires RING_SIZE steps");
_Static_assert(RING_SIZE == 2 * QL_POSITIONS, "Double cover = 2 × base positions");

/* New: Full-cycle quaternion verification */
/* After RING_SIZE steps, RING_QUATERNION_LUT returns to -identity.
 * After 2 × RING_SIZE steps, returns to +identity.
 * This is the 720° principle. */
#define M1_FULL_DOUBLE_COVER_STEPS  (2 * RING_SIZE)  /* 24 steps = 720° */
```

**The Unified Cosmic Clock (already implemented):**

```c
/* m0.h — m0_read_cosmic_clock(degree_0_to_719) already handles this:
 * degree < 360  → explicate phase
 * degree >= 360 → implicate phase (is_implicate_phase = true)
 * M3 hexagram remains 0-63 (symmetric across both layers)
 * M2 decan adjusts by +36 in implicate
 * The quaternionic overlay adds: the SAME codon at degree d and
 * degree d+360 expresses through NEGATED quaternion states. */
```

---

## Section XII: Implementation Phases

### Phase 0: M0 Purnata Grounding
- Add `PURNATA_QUATERNION_SEED` to m0.h `.rodata`
- Extend `CONCRESCENCE_STEPS` from 8 to 12
- Add `is_descending` field to `Concrescence_Trace`
- Update `concrescence_advance()` to handle 12-step helix
- Add static assertions linking to RING_SIZE

### Phase 1: M1 Quaternion Algebra Activation
- Implement `quat_mul()`, `quat_conj()`, `quat_neg()`, `quat_normalize()`, `quat_slerp()`, `quat_rotate()` as `static inline` in m1.h
- Add `RING_QUATERNION_LUT[12]` to `.rodata`
- Add `quat_from_ring_pos(QL_Tick)` accessor
- Add Bimba/Pratibimba quaternionic interpretation to Ananda matrix documentation
- Add sum invariant static assertions (FR 2.Q.0)

### Phase 2: M3 Non-Dual/Dual Codon Taxonomy
- Add `M3_CODON_NONDUAL_CLASS[64]` classification LUT
- Add `M3_NONDUAL_PAIR[64]` pair lookup
- Add predicates: `m3_is_nondual()`, `m3_is_palindromic()`
- Verify all 40 unique / 48 pair / 96 individual counts with static assertions

### Phase 3: M3 Codon Quaternion Encoding
- Implement `m3_quat_from_codon()`
- Implement `m3_quat_codon_state()` (8-fold state selector)
- Implement `m3_quat_active_state()` (environmental modulation)
- Add `M3_Codon_Quaternion` struct

### Phase 4: Three Matrices as Quaternion Axes
- Add `M3_Matrix_Type` enum
- Add `M3_MATRIX_PAIR[3][4]` heterogeneous pair LUTs
- Add `M3_MATRIX_QUATERNION_AXIS[3]` rotation axis LUT
- Verify Hamilton identity `ij = k` holds across matrix compositions

### Phase 5: DET Quaternionic Overlay
- Implement `m3_det_with_quaternion()` — Pass 2 on top of existing bitwise Pass 1
- Add `M3_DET_Overlay_Result` struct with per-codon rotational states
- Integrate with existing `M2_TO_M3_CYMATIC_PROJECTION` (no changes to Pass 1)

### Phase 6: Transcriptional Pipeline
- Add `M3_RNA_FUNCTIONAL_MASK` (37 bits) and `M3_RNA_DARK_MASK` (27 bits)
- Verify 37/27 split with static assertions
- Add Tarot quaternionic bridge: `M3_Tarot_Quaternion` struct, `M3_TAROT_QUATERNIONS[80]` LUT
- Implement `m3_tarot_translate()` for clock-to-clock modulation

### Phase 7: Prime Attractor System
- Add `m3_is_prime_attractor()` predicate
- Integrate prime attractor check into quaternionic state transition pipeline
- Add Euler prime constants (41, 43)

### Phase 8: 4-Valence Isomorphism
- Add `m3_eval_to_quat()` and `m3_quat_to_eval()` conversion functions
- Document the pp/mm/mp/pm ↔ w/x/y/z isomorphism
- Verify that `compose_rotational_state()` produces results consistent with `quat_mul()` on the converted values

---

## Open Questions

1. **RING_QUATERNION_LUT exact values:** The LUT uses cos/sin of 60° increments for meridian rotation. Should the j and k components also carry rotation (longitude + interaction), or is the current i-axis-only rotation correct for the M1 ring? The three matrices add j and k at the M3 level, but M1 may need all four components.

2. **37/27 RNA split:** The exact 37 functional RNA codons need verification against the dataset. The `M3_RNA_FUNCTIONAL_MASK` bits must be set from the canonical HMS data.

3. **Tarot quaternion values:** The 80-entry `M3_TAROT_QUATERNIONS` LUT needs its rotation values derived from the codon/hexagram mappings. Each card's quaternion should encode the transformation it performs between the two clocks.

4. **Prime attractor scope:** Are 41 and 43 the ONLY Euler prime checkpoints, or should the system detect all primes in the codon-pair sum range (18-54)?

5. **Concrescence 8→12 migration:** Existing tests depend on `CONCRESCENCE_STEPS = 8`. Migration path needed — potentially a `CONCRESCENCE_TETRALEMMIC_STEPS = 5` (unchanged) with `CONCRESCENCE_HELIX_STEPS = 12` (new) to preserve both layers.

---

*"Symbolic rotation IS epistemic exploration."*

*Document Version:* 1.0
*Canonical Ground:* /Users/admin/Documents/Epi-Logos C Experiments/
*Related Specifications:* M0-anuttara-language-architecture.md, M1-paramasiva-mathematical-dna.md, M2-parashakti-vibrational-architecture.md, M3-mahamaya-symbolic-transcription.md, HMS Full Deepseek Chat (March 2025)
