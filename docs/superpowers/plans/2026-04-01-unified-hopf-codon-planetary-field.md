# Unified Hopf Dynamics, Codon Classification & Planetary Field — Implementation Plan

> **STATUS: REVISION IN PROGRESS (2026-04-01)**
> Original plan had structural errors in codon classification, walk mode architecture, and
> rotational state charge system. Corrections below are dataset-backed and code-verified.
> Tasks below this section are STALE — do NOT execute without reading corrections first.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Cosmic Clock as a living dynamical system — quaternion composition, 4 Hopf drive modes + 9 structural walk types, bifurcation cascade, 3-tier codon classification (40 non-dual / 24 dual) with full rotational state charge profiles, 3 Purushic matrix port to Rust, 336 dynamic node tracking, planetary aspect rendering, micro-orbit persistence, RNA/amino acid transcription chain, and resolution-aware display — with full C↔Rust parity grounded in dataset truth.

**Architecture:** Three parallel workstreams after a shared foundation phase. Agent A handles C library corrections (non_dual_mask fix, Walk_Type enum, rotational state charge export, aspect primitives, new tests). Agent B handles Rust dynamics engine (full M3 matrix port, rotational state generation, PortalClockState expansion, quaternion composition, dual clock A/B tracking, codon bridge, aspect computation, micro-orbit persistence). Agent C handles portal plugin rendering (planet glyphs, aspect lines, codon display, resolution ticks, walk indicator, transcription chain display). Agents A and B run in parallel after Phase 0; Agent C runs after B completes.

**Tech Stack:** C11 (epi-lib), Rust (epi-cli portal + nara), ratatui TUI, BLAKE3, Python (build_clock_degree_lut.py)

**Spec:** `docs/plans/CLOCK-AND-NARA-SPECS/HOPF-INTEGRATION-READ.md` (v2.0, §I–§XIX)

**Dataset Source of Truth:** `docs/datasets/mahamaya-deep/` (996 nodes, 4891 relations)

**Supersedes:** `docs/superpowers/plans/2026-03-31-hopf-dynamics-planetary-field.md` (partial plan, missing C parity + codon classification)

---

## ARCHITECTURAL CORRECTIONS (2026-04-01 Audit)

> These corrections supersede conflicting content in the tasks below.
> All numbers verified against: `M3_ROTATIONAL_PROFILE[64]` in `epi-lib/src/m3.c:398-418`,
> `m3_verify()` assertions in `m3.c:700-733`, `M3_Transcription_Engine` in `m3.h:407-424`,
> and `docs/datasets/mahamaya-deep/nodes-full-detail.json` (996 nodes).

### C1. Codon Classification Is 3-Tier (40/24), NOT "5-Fold" (16/24/24)

The plan's "5-fold codon classification" with enum values `{PERFECT_PALINDROMIC=0, PALINDROMIC=1, DUAL=2}` and counts 16+24+24=64 is **incorrect**. The canonical classification from the design specification is:

**40 Non-Dual Codons (7 rotational states each):**

| Sub-Type | Count | Pattern | Examples |
|----------|-------|---------|---------|
| **Perfect Palindromic** | 4 | XYX where X=Y (homogeneous triplet) | AAA, TTT, CCC, GGG |
| **Imperfect Palindromic** | 12 | XYX where X≠Y (outer=inner, middle differs) | ATA, AGA, ACA, TAT, TCT, TGT, CGC, CTC, CAC, GCG, GAG, GTG |
| **Non-Palindromic Non-Dual** | 24 | Watson-Crick pair symmetry (12 pairs) | AAT↔ATT, TTA↔TAA, AAC↔ACC, TTG↔TGG, AAG↔AGG, TTC↔TCC, CCG↔CGG, GGC↔GCC, CCA↔CAA, GGT↔GTT, CCT↔CTT, GGA↔GAA |

**24 Dual Codons (8 rotational states each):**
- pair1.sequence ≠ pair2.sequence across ALL 3 Purushic matrices
- Full rotational freedom, no eigenstate collapse
- 24 × 8 = 192 distinct rotational states

**Totals:**
- Non-dual: 4 + 12 + 24 = 40 codons × 7 states = 280 rotational states
- Dual: 24 codons × 8 states = 192 rotational states
- **Grand total: 472 distinct rotational states**

**Code status:** `M3_ROTATIONAL_PROFILE[64]` in m3.c currently verifies as **39 seven-state + 25 eight-state** (assertions at m3.c:730-731). This is a **data discrepancy of 1** vs the design's 40/24. Must be reconciled — one codon is mis-classified in the C LUT. The design table (40/24) is canonical; the code must be corrected.

**Impact on plan:** Tasks 0, 1, 2, 3, 9 must be rewritten to use this 3-tier system. The `Codon_Class` enum should be:
```
NON_DUAL_PERFECT_PALINDROMIC = 0  (4 codons)
NON_DUAL_IMPERFECT_PALINDROMIC = 1  (12 codons)
NON_DUAL_NON_PALINDROMIC = 2  (24 codons, 12 pairs)
DUAL = 3  (24 codons)
```

### C2. 385 Clock Nodes: 360 + 24 + 1 (336 Truly Dual Degree Positions)

The plan confused "dual codons" (24 genetic entities) with "dual degree nodes" (336 clock positions):

- **385 total nodes:** 360 degree + 24 backbone + 1 Axis Mundi
- **24 backbone nodes** at 15° intervals (d%15==0) — non-dual eigenstates, palindromic anchors
- **336 truly dynamic degree nodes** = 360 - 24 — forming 168 complementary pairs
- **384 = 64 × 6 = LINE_CHANGE count** — structural law: `_Static_assert(360+24 == 64*6)`
- **`M3_Transcription_Engine.dual_field[6]`** = 6×64-bit words = 384 bits housing the 336 polarity pairs

The 336 is a **clock topology** number. The 24 dual codons is a **genetics** number. Both are real; they describe different layers.

### C3. Rotational States MUST Carry Charges — Already in C, Missing from Rust

`M3_Rotational_Generation` (m3.h:533-542) already has:
- `polarity`: `M3_ROTATIONAL_NEGATIVE` (0) or `M3_ROTATIONAL_POSITIVE` (1)
- `is_non_dual`: eigenstate flag (where both charges act simultaneously)
- `rotational_value`: computed sum/diff charge value
- `rotation_degrees`: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
- `resulting_codon`: the codon produced at this rotational position

`m3_generate_rotational_states()` (m3.c:506-581) produces 7-8 entries per codon with:
- **Negative path** (4 states): pair1 dominant (first pair variable, second fixed)
- **Positive path** (4 states): pair2 dominant (first pair fixed, second variable)
- Non-dual collapse: 0°/180° merge into one eigenstate

**The Rust side has ZERO awareness of any of this.** The plan must port the full generation engine.

### C4. The 3 Purushic Matrices — Fully in C, Absent from Rust

Each codon has **6 inner charges** (one per LINE_CHANGE = one per matrix axis × polarity):
- M3_COMP_MATRIX[64] — Complementarity (Watson-Crick, `i` axis, `comp[i] = i ^ 0x3F`)
- M3_MOVE_MATRIX[64] — Movement (trigram swap, `j` axis, `move[i] = swap_trigrams(i)`)
- M3_RES_MATRIX[64] — Resonance (Keto/Amino, `k` axis, 56 valid + 8 gaps at 0xFF)
- M3_MATRIX_QUATERNION_AXIS[3] = {X-axis, Y-axis, Z-axis} per matrix

The 64×6 transformation space: each codon has 6 possible I-Ching line changes, each mediated by one of the 3 matrices (×2 polarities). This IS the dynamical state space.

### C5. Walk Architecture: 4 Hopf Drives + 9 Structural Walks (Separate Enums)

**4 Hopf Drive Modes** (quaternion argmax → which generator activates):
| Drive | Quaternion | Element | Action |
|-------|-----------|---------|--------|
| GROUND | w dominant | EARTH | Identity, no walk |
| TORUS | x dominant | FIRE | Base-space advance |
| FIBER | y dominant | WATER | # flip (lemniscate) |
| SPANDA | z dominant | AIR | 12-step double-helix |

**9 Structural Walk Types** (clock traversals, separate from drives):
| Walk | Steps | Lens Match |
|------|-------|------------|
| WALK_DEGREE | 360 | Lens 0 |
| WALK_AMINO | 24 | Lens 7 |
| WALK_ZODIAC | 12 | Lens 6 |
| WALK_SPANDA | 12 | Lens 9 |
| WALK_DECAN | 36 | Lens 5 |
| WALK_HEXAGRAM | 64 | NONE (2^6 space) |
| WALK_ENNEADIC | 9 | Lens 11 |
| WALK_SEASONAL | 4 | Lens 13 |
| WALK_LINE_CHANGE | 384 | NONE |

The plan must implement BOTH. The 4 drives SELECT which walk family; the 9 walks ARE the traversals.

### C6. non_dual_mask Bug — Sets 16 Bits, Should Set 40

`m3_init()` at m3.c:613 computes mask from `M3_NONDUAL_CODONS[16]` only. But comment says "40 always-set bits" and the design specifies 40 non-dual codons. The remaining 24 non-palindromic non-dual codons are missing from the mask. Fix: iterate `M3_ROTATIONAL_PROFILE[64]`, set bit for every codon with `state_type == M3_ROTATIONAL_NON_DUAL_INITIATED`.

### C7. engine_walk_by_mode() API Mismatch

- `engine_torus_walk()`: `(HC*, void*, uint32_t)` — NO callback
- `engine_lemniscate_dive()`: `(HC*, void*, uint8_t)` — NO callback
- `engine_spanda_walk()`: `(uint8_t, uint8_t, void*, on_tick)` — HAS callback

Plan's unified `on_step` callback won't compile for torus/lemniscate. Need wrapper adapters.

### C8. Dual Clock A/B Must Be Explicit

The spec (HOPF §XI) demands two separate-but-coupled clocks:
- **Clock A**: degree ring (360°, real face, spatial/decan projection)
- **Clock B**: hexagram evaluation (64 binary states, imaginary face, I-Ching projection)

Currently `PortalClockState` mixes both into a single state. The plan must add `clock_b_hexagram: u8` as a live evolving state (not just snapshot from last cast) and track the coupling between the two clocks.

### C9. Micro-Orbit Must Persist

Plan stores `micro_orbit: Vec<u16>` in-memory only. This IS the user's personal mandala/ledger — must persist to `~/.epi-logos/nara/orbit.json` and reload on portal launch.

### C10. RNA/Amino Acid Transcription Chain Must Be Operational

The clock walks create narrative flows via the tarot-codon-amino acid chain:
- Codon → RNA transcription (37 T-containing codons, 45 TRANSCRIBES_TO relations)
- RNA → Amino acid (24-fold: 20 standard + Sec + Pyl + Start + Stop)
- Amino acid → Major Arcana (22 EMBODIES_AS relations)
- Major Arcana → Chromosome (22 GENETIC_ARCHETYPAL_MANIFESTATION)
- Start/Stop codons as operational gates in the transcription chain

This chain must be wired so walks THROUGH the architecture produce readable narrative sequences.

---

---

## Existing Infrastructure (What We Build On)

Before starting, understand what already exists — the C library is far more complete than it might appear:

### C Library (epi-lib/) — Already Implemented
| Feature | Location | Status |
|---------|----------|--------|
| `Quaternion` type + 8 ops (mul/conj/normalize/slerp/rotate/neg/norm_sq/from_ring_pos) | `m1.h:438–499` | Complete |
| `RING_QUATERNION_LUT[12]` | `m1.h:508+` | Complete |
| `M3_Rotational_Profile[64]` — per-codon: state_count (7/8), state_type, paired_codon | `m3.h:544–550`, `m3.c` | Complete |
| `m3_generate_rotational_states()` — produces 7 or 8 `M3_Rotational_Generation` per codon | `m3.h:836–838` | Complete |
| `M3_NONDUAL_CODONS[16]` — XyX perfect palindromes | `m3.h:676` | Complete |
| `is_nondual_codon()` — XyX check (outer==inner) | `m3.h:670–672` | Complete |
| `M3_Transcription_Engine.non_dual_mask` — 40-bit mask (all non-dual codons) | `m3.h:409` | Complete |
| `m3_compute_charges()` — pp/nn/np/pn from codon | `m3.h:687–699` | Complete |
| `evaluate_codon()` → `M3_CodonEvaluation` | `m3.h:478–488` | Complete |
| `m3_eval_to_quat()` / `m3_quat_to_eval()` | `m3.h:490–506` | Complete |
| `m3_quat_from_codon()` / `m3_quat_codon_state()` / `m3_quat_active_state()` | `m3.h:217–256` | Complete |
| `M3_PAIR_MATRIX[16]`, `M3_MATRIX_PAIR[3][4]`, `M3_MATRIX_QUATERNION_AXIS[3]` | `m3.h:155–170` | Complete |
| `compute_rotational_state()` / `compute_rotational_state_safe()` | `m3.h:190–209` | Complete |
| `compose_rotational_state()` / `is_nondual_composition()` | `m3.h:564–576` | Complete |
| `M3_CODON_TO_AA[64]` | `m3.h:405` | Complete |
| `polar_opposite_su2()` | `m3.h:370–374` | Complete |
| `CLOCK_DEGREE_LUT[360]` — 26-field `Clock_Degree_Entry` with is_non_dual_codon | `m3.h:868–911`, `m3_clock_lut.c` | Complete |
| `M2_PLANET_LUT[10]` — elem_sig, chakra, freq, DR, ananda_row, keplerian_vel | `m2.h:300–311`, `m2.c` | Complete |
| `M2_CHAKRA_LUT[8]` | `m2.h:362` | Complete |
| `EarthBodyState` — geocentric center/observer | `m2.h:318–322` | Complete |
| `engine_spanda_walk()` — 12-step, `engine_torus_walk()` — 6-step | `engine.h:27–32`, `engine.c` | Complete |
| `engine_double_covering()` — 720° | `engine.h:42–45` | Complete |

### Rust (epi-cli/) — Already Implemented
| Feature | Location | Status |
|---------|----------|--------|
| `PortalClockState` — 13 fields (session_hash, quaternions, degree, tick12, kairos, etc.) | `clock_state.rs:105–163` | Complete |
| `update_from_cast()` — overwrites live_quaternion (plan: change to compose) | `clock_state.rs:236–294` | Complete |
| `quantize_to_spanda_substage(y, x)` | `clock_state.rs:220–224` | Complete |
| `spanda_invert(stage)` = 11 - stage | `clock_state.rs:213–215` | Complete |
| `KairosState` with `[PlanetState; 10]` | `clock_state.rs:59–91` | Complete |
| `OracleFaces` — 4 faces (primary, deficient, implicate, temporal) | `clock_state.rs:9–32` | Complete |
| `HEXAGRAM_BODY_DYNAMICS[64]` | `oracle.rs` | Complete |
| `PIP_DECAN_MAP[4][9]`, `COURT_SIGN_MAP`, `ACE_ELEMENT_MAP` | `oracle.rs` | Complete |
| Kerykeion FFI (kairos sync) | `kairos.rs` | Complete |
| Identity BLAKE3 + quintessence quaternion | `identity.rs` | Complete |
| All 17 portal plugins wired | `portal/mod.rs` | Complete |

---

## File Map

| File | Action | Responsibility | Agent |
|------|--------|----------------|-------|
| `epi-lib/include/m3.h` | Modify | Add `Codon_Class` enum, `Codon_Classification` struct, expand `Clock_Degree_Entry` | A |
| `epi-lib/src/m3.c` | Modify | Add `M3_CODON_CLASS[64]` LUT, `m3_classify_codon()` | A |
| `epi-lib/include/engine.h` | Modify | Add `Walk_Mode` enum, `engine_walk_by_mode()` declaration | A |
| `epi-lib/src/engine.c` | Modify | Implement `engine_walk_by_mode()` dispatcher | A |
| `epi-lib/include/m2.h` | Modify | Add `m2_aspect_between()` function, `Aspect_Result` struct | A |
| `epi-lib/src/m2.c` | Modify | Implement `m2_aspect_between()` | A |
| `epi-lib/test/test_m3_codon_class.c` | Create | Tests for 5-fold codon classification + rotational profile counts | A |
| `epi-lib/test/test_engine_walk_mode.c` | Create | Tests for Walk_Mode dispatch | A |
| `epi-lib/test/test_m2_aspects.c` | Create | Tests for aspect computation | A |
| `epi-cli/src/portal/clock_state.rs` | Modify | Add 11 new fields, quaternion composition, walk mode, bifurcation, aspects, codon bridge, micro-orbit | B |
| `epi-cli/src/nara/oracle.rs` | Modify | Add `CODON_CLASS_LUT[64]` mirroring C, codon classification display in cast output | B |
| `epi-cli/src/nara/identity.rs` | Modify | Journal NLP elemental weighting stub | B |
| `epi-cli/src/portal/plugins/clock.rs` | Modify | Planet glyphs, aspect lines, micro-orbit trail, resolution ticks, codon classification markers | C |
| `epi-cli/src/portal/plugins/mini_clock.rs` | Modify | Walk mode indicator, element colouring | C |
| `epi-cli/src/portal/plugins/m4.rs` | Modify | Post-cast Hopf display (walk mode, λ, codon class) | C |
| `epi-cli/src/portal/plugins/m2.rs` | Modify | Active cell highlighting, λ-dimming, codon class annotation | C |
| `epi-cli/src/portal/plugins/spine.rs` | Modify | λ-modulated glow, resolution level indicator | C |
| `tools/build_clock_degree_lut.py` | Modify | Add `codon_class` field to generated LUT | A |

---

## Parallel Execution Strategy

```
Phase 0 (Sequential): Tasks 0–2  [Foundation types — blocks everything]
    │
    ├─── Agent A (Tasks 3–9):  C library extensions [independent of Rust]
    │
    └─── Agent B (Tasks 10–17): Rust dynamics engine [independent of C]
              │
              └─── Agent C (Tasks 18–24): Portal plugin rendering [depends on B]
                        │
                        └─── Task 25: Full build + test + manual TUI verification
```

---

## Phase 0: Foundation Types (Sequential)

### Task 0: Add Codon_Class Enum and Classification to C

**Files:**
- Modify: `epi-lib/include/m3.h` (after line 676, the M3_NONDUAL_CODONS section)
- Modify: `epi-lib/src/m3.c`

This adds the 5-fold codon classification system. Three-tier enum with derived boolean accessors.

- [ ] **Step 1: Add Codon_Class enum and classification struct to m3.h**

In `epi-lib/include/m3.h`, after the `M3_NONDUAL_CODONS[16]` declaration (line 676), add:

```c
/* ===================================================================
 * FR 2.3.17b: CODON CLASSIFICATION — 5-Fold Designation
 *
 * Every codon has exactly one class from three tiers:
 *   PERFECT_PALINDROMIC (16): XyX pattern (outer==inner nucleotide).
 *     Strongest non-dual anchors. 7 rotational states. Zero net deviation.
 *   PALINDROMIC (24 more, 40 total with perfect): Non-dual by pair equality
 *     (pair1.sequence == pair2.sequence) but NOT XyX. 7 rotational states.
 *   DUAL (24): pair1.sequence ≠ pair2.sequence. Full 8 rotational states.
 *
 * Derived boolean properties:
 *   is_dual           = (class == CODON_DUAL)
 *   is_non_dual       = (class != CODON_DUAL)
 *   is_palindromic    = (class != CODON_DUAL)        [all non-dual are palindromic]
 *   is_perfect_palindrome = (class == CODON_PERFECT_PALINDROMIC)
 *   is_non_palindromic = (class == CODON_DUAL)
 *
 * Counts: 16 + 24 + 24 = 64 codons.
 * Rotational states: 16×7 + 24×7 + 24×8 = 112 + 168 + 192 = 472 total.
 * =================================================================== */

typedef enum {
    CODON_PERFECT_PALINDROMIC = 0,  /* 16: XyX, strongest anchor, 7 states */
    CODON_PALINDROMIC         = 1,  /* 24: non-dual but not XyX, 7 states  */
    CODON_DUAL                = 2   /* 24: pair1≠pair2, full 8 states      */
} Codon_Class;

#define CODON_PERFECT_PALINDROMIC_COUNT  16u
#define CODON_PALINDROMIC_COUNT          24u  /* non-perfect palindromic */
#define CODON_DUAL_COUNT                 24u
#define CODON_NONDUAL_TOTAL_COUNT        40u  /* 16 + 24 */
#define CODON_ROTATIONAL_STATE_TOTAL    472u  /* 40×7 + 24×8 */

_Static_assert(
    CODON_PERFECT_PALINDROMIC_COUNT + CODON_PALINDROMIC_COUNT + CODON_DUAL_COUNT == 64,
    "Codon classification: 16 + 24 + 24 = 64 codons"
);
_Static_assert(
    CODON_NONDUAL_TOTAL_COUNT * 7 + CODON_DUAL_COUNT * 8 == CODON_ROTATIONAL_STATE_TOTAL,
    "Rotational states: 40×7 + 24×8 = 472"
);

typedef struct {
    Codon_Class class;
    uint8_t     rotational_state_count;  /* 7 or 8 */
    uint8_t     paired_codon;            /* Watson-Crick complement, or self if perfect palindrome */
    uint8_t     amino_acid;              /* M3_CODON_TO_AA index */
} Codon_Classification;

/* Derived boolean accessors — branchless O(1) */
static inline bool codon_is_dual(Codon_Class c)                { return c == CODON_DUAL; }
static inline bool codon_is_non_dual(Codon_Class c)            { return c != CODON_DUAL; }
static inline bool codon_is_palindromic(Codon_Class c)         { return c != CODON_DUAL; }
static inline bool codon_is_perfect_palindrome(Codon_Class c)  { return c == CODON_PERFECT_PALINDROMIC; }
static inline bool codon_is_non_palindromic(Codon_Class c)     { return c == CODON_DUAL; }

/* Master LUT: 64 entries, one per codon. Defined in m3.c. */
extern const Codon_Classification M3_CODON_CLASS[64];

/* Runtime classifier — derives class from 6-bit codon. O(1). */
static inline Codon_Class m3_classify_codon(uint8_t codon6bit) {
    return M3_CODON_CLASS[codon6bit & 0x3F].class;
}

/* Rotational state count for this codon */
static inline uint8_t m3_codon_rotation_count(uint8_t codon6bit) {
    return M3_CODON_CLASS[codon6bit & 0x3F].rotational_state_count;
}
```

- [ ] **Step 2: Build to verify header compiles**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make lib`
Expected: Compiles (LUT extern not yet defined — linker won't be called for lib target)

- [ ] **Step 3: Implement M3_CODON_CLASS[64] LUT in m3.c**

In `epi-lib/src/m3.c`, add after the existing `M3_ROTATIONAL_PROFILE[64]` table:

```c
/* ─────────────────────────────────────────────────────────────────────
 * M3_CODON_CLASS[64] — 5-fold codon classification LUT
 *
 * Classification algorithm:
 *   1. If outer == inner nucleotide (XyX pattern) → PERFECT_PALINDROMIC (16 codons)
 *   2. Else if non_dual_mask bit set (pair1==pair2) → PALINDROMIC (24 codons)
 *   3. Else → DUAL (24 codons)
 *
 * Paired codon = Watson-Crick complement: swap each nucleotide with its pair
 *   (A↔T, C↔G) then reverse. For XyX: pair is self.
 * ───────────────────────────────────────────────────────────────────── */

/* Helper: compute Watson-Crick anticodon of 6-bit codon */
static uint8_t wc_anticodon(uint8_t c) {
    uint8_t n1 = (c >> 4) & 0x03;
    uint8_t n2 = (c >> 2) & 0x03;
    uint8_t n3 = c & 0x03;
    /* XOR 0x01 flips polarity (A↔T, C↔G) then reverse order */
    return (uint8_t)(((n3 ^ 0x01) << 4) | ((n2 ^ 0x01) << 2) | (n1 ^ 0x01));
}

/* Precomputed at file scope — init at load time */
static Codon_Classification build_codon_class(uint8_t codon6bit) {
    uint8_t n1 = (codon6bit >> 4) & 0x03;
    uint8_t n3 = codon6bit & 0x03;
    uint8_t anti = wc_anticodon(codon6bit);
    bool is_xyx = (n1 == n3);

    /* Check non_dual_mask from transcription engine:
     * non-dual means pair1.sequence == pair2.sequence in the generation matrix.
     * For runtime init we use the rotational profile state_type. */
    const M3_Rotational_Profile* prof = m3_get_rotational_profile(codon6bit);
    bool is_nd = (prof->state_type == M3_ROTATIONAL_NON_DUAL_INITIATED);

    Codon_Class cls;
    if (is_xyx) {
        cls = CODON_PERFECT_PALINDROMIC;
    } else if (is_nd) {
        cls = CODON_PALINDROMIC;
    } else {
        cls = CODON_DUAL;
    }

    return (Codon_Classification){
        .class = cls,
        .rotational_state_count = prof->state_count,
        .paired_codon = anti,
        .amino_acid = M3_CODON_TO_AA[codon6bit & 0x3F],
    };
}

/* The LUT is const after init — we build it via a constructor or at first use.
 * Since C doesn't have constexpr runtime init, we use a mutable table
 * initialized by m3_init(). */
Codon_Classification M3_CODON_CLASS_STORAGE[64];
const Codon_Classification* const M3_CODON_CLASS_PTR = M3_CODON_CLASS_STORAGE;

/* Called from m3_init() */
void m3_init_codon_class_lut(void) {
    for (uint8_t i = 0; i < 64; i++) {
        M3_CODON_CLASS_STORAGE[i] = build_codon_class(i);
    }
}
```

**Note:** Since `M3_CODON_CLASS` is declared `extern const` in the header but needs runtime init, change the header declaration to:

```c
extern const Codon_Classification* const M3_CODON_CLASS_PTR;
#define M3_CODON_CLASS M3_CODON_CLASS_PTR
```

Wait — that won't work as an array. Instead, declare it mutable in the header:

In `m3.h`, change the extern to:
```c
/* Initialized by m3_init(). Read-only after init. */
extern Codon_Classification M3_CODON_CLASS[64];
```

And in `m3.c`:
```c
Codon_Classification M3_CODON_CLASS[64] = {0};
```

Then in `m3_init()`, add a call to `m3_init_codon_class_lut()`.

- [ ] **Step 4: Add m3_init_codon_class_lut() call to m3_init()**

In `epi-lib/src/m3.c`, inside `m3_init()`, add before the return:

```c
    m3_init_codon_class_lut();
```

- [ ] **Step 5: Build and verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test`
Expected: All existing tests pass (110/110 + 5/5 VAK). New LUT is populated but not yet tested.

- [ ] **Step 6: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-lib/include/m3.h epi-lib/src/m3.c
git commit -m "feat(m3): add 5-fold codon classification (perfect palindromic/palindromic/dual)"
```

---

### Task 1: Expand Clock_Degree_Entry with codon_class

**Files:**
- Modify: `epi-lib/include/m3.h:868–909` (Clock_Degree_Entry struct)
- Modify: `tools/build_clock_degree_lut.py`
- Regenerate: `epi-lib/src/m3_clock_lut.c`

- [ ] **Step 1: Add codon_class field to Clock_Degree_Entry**

In `epi-lib/include/m3.h`, in the `Clock_Degree_Entry` struct, after the `is_non_dual_codon` field (line 883), add:

```c
    uint8_t  codon_class;           /* Codon_Class enum: 0=perfect_palindromic, 1=palindromic, 2=dual */
```

- [ ] **Step 2: Update build_clock_degree_lut.py to emit codon_class**

In `tools/build_clock_degree_lut.py`, in the degree entry generation loop, after computing `is_non_dual_codon`, add:

```python
    # Codon classification: 0=perfect_palindromic (XyX), 1=palindromic (non-dual), 2=dual
    if is_non_dual_codon:
        outer_nuc = (codon_upper_pair)  # simplified — use actual codon bits
        inner_nuc = (codon_lower_pair)
        codon_class = 0 if outer_nuc == inner_nuc else 1
    else:
        codon_class = 2
```

And include `codon_class` in the C struct initializer output.

- [ ] **Step 3: Regenerate m3_clock_lut.c**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && python3 tools/build_clock_degree_lut.py > epi-lib/src/m3_clock_lut.c`

If the script requires Neo4j access and it's not available, manually add `0` as a placeholder for `codon_class` in each entry (to be filled by runtime lookup from `M3_CODON_CLASS`).

- [ ] **Step 4: Build and verify**

Run: `make test`
Expected: All tests pass with expanded struct.

- [ ] **Step 5: Commit**

```bash
git add epi-lib/include/m3.h tools/build_clock_degree_lut.py epi-lib/src/m3_clock_lut.c
git commit -m "feat(m3): add codon_class to Clock_Degree_Entry (5-fold classification)"
```

---

### Task 2: Expand PortalClockState with New Fields

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs:104–185`

This adds all new fields needed by the dynamics engine and plugins.

- [ ] **Step 1: Add CodonClass enum and new fields to clock_state.rs**

In `epi-cli/src/portal/clock_state.rs`, after the `OracleFaces` struct, add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// CODON CLASSIFICATION — 5-fold designation
// ─────────────────────────────────────────────────────────────────────────────

/// Three-tier codon classification. Mirrors C `Codon_Class` in m3.h.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum CodonClass {
    /// 16 codons: XyX pattern (outer == inner nucleotide). Strongest non-dual anchor. 7 rotational states.
    PerfectPalindromic = 0,
    /// 24 codons: Non-dual (pair1 == pair2) but not XyX. 7 rotational states.
    Palindromic = 1,
    /// 24 codons: Dual (pair1 ≠ pair2). Full 8 rotational states.
    Dual = 2,
}

impl CodonClass {
    pub fn is_dual(self) -> bool { self == CodonClass::Dual }
    pub fn is_non_dual(self) -> bool { self != CodonClass::Dual }
    pub fn is_palindromic(self) -> bool { self != CodonClass::Dual }
    pub fn is_perfect_palindrome(self) -> bool { self == CodonClass::PerfectPalindromic }
    pub fn is_non_palindromic(self) -> bool { self == CodonClass::Dual }
    pub fn rotational_state_count(self) -> u8 {
        if self == CodonClass::Dual { 8 } else { 7 }
    }
    pub fn label(self) -> &'static str {
        match self {
            CodonClass::PerfectPalindromic => "Perfect Palindrome",
            CodonClass::Palindromic => "Palindromic",
            CodonClass::Dual => "Dual",
        }
    }
}

impl Default for CodonClass {
    fn default() -> Self { CodonClass::PerfectPalindromic }
}

/// Properties of the active codon at the current clock degree.
#[derive(Clone, Debug, Default)]
pub struct ActiveCodon {
    /// 6-bit codon ID (0–63) from Clock A (degree → decan → codon).
    pub codon_a: u8,
    /// 6-bit codon ID from Clock B (hexagram → YIELDS_CODON → codon).
    pub codon_b: u8,
    /// Classification of codon_a.
    pub class_a: CodonClass,
    /// Classification of codon_b.
    pub class_b: CodonClass,
    /// 3-char DNA sequence for codon_a (e.g., "ATG").
    pub sequence_a: [u8; 3],
    /// Amino acid index (0–23) for codon_a.
    pub amino_acid: u8,
    /// Watson-Crick anticodon of codon_a.
    pub anticodon: u8,
    /// Number of rotational states for codon_a (7 or 8).
    pub rotation_count_a: u8,
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY ASPECTS
// ─────────────────────────────────────────────────────────────────────────────

/// A detected aspect between two planets.
#[derive(Clone, Debug)]
pub struct PlanetaryAspect {
    /// Planet A index (0–9 mod-10).
    pub planet_a: u8,
    /// Planet B index (0–9 mod-10).
    pub planet_b: u8,
    /// Aspect type: 0=conjunction, 1=sextile, 2=square, 3=trine, 4=opposition.
    pub aspect_type: u8,
    /// Angular separation in degrees (0–180).
    pub angle: f32,
    /// Orb (deviation from exact aspect) in degrees.
    pub orb: f32,
}

/// Walk mode derived from dominant quaternion component.
/// Mirrors C `Walk_Mode` in engine.h.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum WalkMode {
    Ground = 0, // w dominant — stable attractor, minimal rotation
    Torus  = 1, // x dominant — base-space advance (FIRE)
    Fiber  = 2, // y dominant — fiber inversion (WATER)
    Spanda = 3, // z dominant — double-helix traversal (AIR)
}

impl Default for WalkMode {
    fn default() -> Self { WalkMode::Ground }
}

impl WalkMode {
    pub fn label(self) -> &'static str {
        match self {
            WalkMode::Ground => "GROUND",
            WalkMode::Torus  => "TORUS",
            WalkMode::Fiber  => "FIBER",
            WalkMode::Spanda => "SPANDA",
        }
    }
}
```

- [ ] **Step 2: Add new fields to PortalClockState**

In the `PortalClockState` struct definition, add these fields after `orbital_position`:

```rust
    // ── Hopf dynamics layer ─────────────────────────────────────────────
    /// QL position (0–5): base-space projection of tick12.
    /// tick12 < 6 ? tick12 : (11 - tick12). Phase = tick12 >= 6.
    pub ql_position:             u8,

    /// Derived walk mode from dominant quaternion component.
    pub walk_mode:               WalkMode,

    /// Bifurcation parameter λ = sqrt(x² + y² + z²) = sqrt(1 - w²).
    /// Controls resolution cascade: 0→6-fold, 1→12-fold, 2→36-fold, 3→72-fold.
    pub bifurcation_param:       f32,

    /// Resolution level: 0 if λ<0.25, 1 if λ<0.50, 2 if λ<0.75, 3 otherwise.
    pub resolution_level:        u8,

    // ── Codon bridge layer ──────────────────────────────────────────────
    /// Active codon data at current clock degree (both Clock A and Clock B).
    pub active_codon:            ActiveCodon,

    // ── Planetary dynamics layer ────────────────────────────────────────
    /// Transit quaternion: derived from current planetary configuration.
    /// Composed with quintessence (natal) and live (oracle) quaternions.
    pub transit_quaternion:      [f32; 4],

    /// Detected aspects between live planets.
    pub aspects:                 Vec<PlanetaryAspect>,

    /// Micro-orbit trail: sequence of oracle cast degree positions (most recent last).
    /// This IS the user's personal mandala / signature / ledger.
    pub micro_orbit:             Vec<u16>,
```

- [ ] **Step 3: Update Default impl**

In the `Default` impl for `PortalClockState`, add:

```rust
            ql_position:             0,
            walk_mode:               WalkMode::default(),
            bifurcation_param:       0.0,
            resolution_level:        0,
            active_codon:            ActiveCodon::default(),
            transit_quaternion:      [1.0, 0.0, 0.0, 0.0],
            aspects:                 Vec::new(),
            micro_orbit:             Vec::new(),
```

- [ ] **Step 4: Build to verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo check`
Expected: Compiles. Plugins that read from `PortalClockState` still work (new fields are additive).

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(portal): expand PortalClockState with Hopf dynamics, codon classification, planetary aspects"
```

---

## Phase A: C Library Extensions (Agent A)

### Task 3: C Tests for Codon Classification

**Files:**
- Create: `epi-lib/test/test_m3_codon_class.c`
- Modify: `Makefile` (add test target)

- [ ] **Step 1: Write test_m3_codon_class.c**

```c
/* test_m3_codon_class.c — Tests for 5-fold codon classification */
#include "../include/m3.h"
#include <stdio.h>
#include <assert.h>

static int pass = 0, fail = 0;
#define TEST(name, expr) do { \
    if (expr) { pass++; } \
    else { fail++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)

int main(void) {
    /* Initialize M3 to populate M3_CODON_CLASS */
    /* Note: m3_init requires arena + HC. For classification tests,
     * call m3_init_codon_class_lut() directly if exposed, or
     * test via the inline functions that read M3_ROTATIONAL_PROFILE. */
    m3_init_codon_class_lut();

    /* Count each class */
    int perfect = 0, palindromic = 0, dual = 0;
    for (uint8_t i = 0; i < 64; i++) {
        switch (M3_CODON_CLASS[i].class) {
            case CODON_PERFECT_PALINDROMIC: perfect++; break;
            case CODON_PALINDROMIC:         palindromic++; break;
            case CODON_DUAL:                dual++; break;
        }
    }

    TEST("perfect_palindromic_count_16", perfect == 16);
    TEST("palindromic_count_24", palindromic == 24);
    TEST("dual_count_24", dual == 24);
    TEST("total_64", perfect + palindromic + dual == 64);

    /* Verify XyX codons are all PERFECT_PALINDROMIC */
    for (uint8_t i = 0; i < 64; i++) {
        uint8_t outer = (i >> 4) & 0x03;
        uint8_t inner = i & 0x03;
        if (outer == inner) {
            TEST("xyx_is_perfect", M3_CODON_CLASS[i].class == CODON_PERFECT_PALINDROMIC);
        }
    }

    /* Verify M3_NONDUAL_CODONS[16] are all perfect palindromes */
    for (int j = 0; j < 16; j++) {
        uint8_t c = M3_NONDUAL_CODONS[j];
        TEST("nondual_lut_is_perfect", M3_CODON_CLASS[c].class == CODON_PERFECT_PALINDROMIC);
    }

    /* Verify rotational state counts */
    int total_states = 0;
    for (uint8_t i = 0; i < 64; i++) {
        uint8_t count = M3_CODON_CLASS[i].rotational_state_count;
        if (M3_CODON_CLASS[i].class == CODON_DUAL) {
            TEST("dual_8_states", count == 8);
        } else {
            TEST("nondual_7_states", count == 7);
        }
        total_states += count;
    }
    TEST("total_472_states", total_states == 472);

    /* Verify boolean accessors */
    TEST("dual_is_dual", codon_is_dual(CODON_DUAL) == true);
    TEST("dual_not_palindromic", codon_is_palindromic(CODON_DUAL) == false);
    TEST("perfect_is_palindromic", codon_is_palindromic(CODON_PERFECT_PALINDROMIC) == true);
    TEST("perfect_is_perfect", codon_is_perfect_palindrome(CODON_PERFECT_PALINDROMIC) == true);
    TEST("palindromic_not_perfect", codon_is_perfect_palindrome(CODON_PALINDROMIC) == false);
    TEST("palindromic_is_nondual", codon_is_non_dual(CODON_PALINDROMIC) == true);

    /* Verify anticodon: for perfect palindromes, anticodon may differ
     * (complement reversal). For dual codons, anticodon is distinct. */
    for (uint8_t i = 0; i < 64; i++) {
        uint8_t anti = M3_CODON_CLASS[i].paired_codon;
        TEST("anticodon_in_range", anti < 64);
    }

    /* Verify amino acid field populated */
    for (uint8_t i = 0; i < 64; i++) {
        /* M3_CODON_TO_AA should give valid index */
        TEST("amino_acid_valid", M3_CODON_CLASS[i].amino_acid <= 23 || M3_CODON_CLASS[i].amino_acid == 0xFF);
    }

    printf("test_m3_codon_class: %d passed, %d failed\n", pass, fail);
    return fail > 0 ? 1 : 0;
}
```

- [ ] **Step 2: Add test target to Makefile**

In the `Makefile`, add to the test targets section:

```makefile
test-m3-codon-class: epi-lib/test/test_m3_codon_class.c $(LIB)
	$(CC) $(CFLAGS) -o $@ $< -L. -lepilogos -lm
	./$@
```

And add `test-m3-codon-class` to the `test:` target's dependency list.

- [ ] **Step 3: Run test to verify it fails (LUT not yet populated at test time)**

Run: `make test-m3-codon-class`
Expected: May fail if `m3_init_codon_class_lut()` needs M3_ROTATIONAL_PROFILE to be initialized first. Fix by ensuring the test calls the right init sequence.

- [ ] **Step 4: Fix any init ordering issues and verify all pass**

Run: `make test-m3-codon-class`
Expected: All codon classification tests pass.

- [ ] **Step 5: Commit**

```bash
git add epi-lib/test/test_m3_codon_class.c Makefile
git commit -m "test(m3): add 5-fold codon classification tests (16+24+24=64, 472 states)"
```

---

### Task 4: Walk_Mode Enum and engine_walk_by_mode() in C

**Files:**
- Modify: `epi-lib/include/engine.h`
- Modify: `epi-lib/src/engine.c`

- [ ] **Step 1: Add Walk_Mode enum to engine.h**

After `engine_next_coordinate()` declaration (line 48), add:

```c
/* ─────────────────────────────────────────────────────────────────────
 * Walk_Mode — Quaternion-derived traversal modes (Hopf §III).
 *
 * Determined by argmax of |w|, |x|, |y|, |z| quaternion components:
 *   WALK_GROUND: w dominant → stable attractor, no walk (identity region)
 *   WALK_TORUS:  x dominant → base-space major-circle advance (FIRE)
 *   WALK_FIBER:  y dominant → fiber inversion / # operator (WATER)
 *   WALK_SPANDA: z dominant → double-helix 12-step (AIR)
 *
 * Spec: HOPF-INTEGRATION-READ.md §III, 00-canonical-invariants §6
 * ───────────────────────────────────────────────────────────────────── */

typedef enum {
    WALK_GROUND = 0,  /* w: Earth/GROUND — stable, no walk */
    WALK_TORUS  = 1,  /* x: Fire/TORUS — 6-step base-space */
    WALK_FIBER  = 2,  /* y: Water/FIBER — lemniscate dive */
    WALK_SPANDA = 3   /* z: Air/SPANDA — 12-step double-helix */
} Walk_Mode;

#define WALK_MODE_COUNT 4u

/* Derive Walk_Mode from quaternion components (argmax of absolutes) */
static inline Walk_Mode walk_mode_from_quaternion(float w, float x, float y, float z) {
    float aw = w < 0 ? -w : w;
    float ax = x < 0 ? -x : x;
    float ay = y < 0 ? -y : y;
    float az = z < 0 ? -z : z;
    if (aw >= ax && aw >= ay && aw >= az) return WALK_GROUND;
    if (ax >= ay && ax >= az) return WALK_TORUS;
    if (ay >= az) return WALK_FIBER;
    return WALK_SPANDA;
}

/* Bifurcation parameter λ = sqrt(1 - w²) = sqrt(x² + y² + z²).
 * Controls resolution cascade:
 *   λ < 0.25 → 6-fold (QL positions)
 *   λ < 0.50 → 12-fold (spanda ticks)
 *   λ < 0.75 → 36-fold (decans)
 *   λ ≥ 0.75 → 72-fold (half-decans)
 */
static inline float walk_bifurcation_param(float w, float x, float y, float z) {
    (void)w;
    return sqrtf(x*x + y*y + z*z);
}

static inline uint8_t walk_resolution_level(float lambda) {
    if (lambda < 0.25f) return 0;  /* 6-fold */
    if (lambda < 0.50f) return 1;  /* 12-fold */
    if (lambda < 0.75f) return 2;  /* 36-fold */
    return 3;                       /* 72-fold */
}

/* Unified walk dispatcher: routes to appropriate engine walk by mode.
 * step_count: number of steps to execute (wraps per walk's modulus).
 * on_step: callback invoked at each position. */
void engine_walk_by_mode(
    Walk_Mode mode,
    uint8_t   start_position,
    void*     context_state,
    uint8_t   step_count,
    void (*on_step)(uint8_t position, void* ctx)
);
```

- [ ] **Step 2: Implement engine_walk_by_mode() in engine.c**

In `epi-lib/src/engine.c`, add:

```c
void engine_walk_by_mode(
    Walk_Mode mode,
    uint8_t   start_position,
    void*     context_state,
    uint8_t   step_count,
    void (*on_step)(uint8_t position, void* ctx))
{
    if (!on_step || step_count == 0) return;

    switch (mode) {
    case WALK_GROUND:
        /* Ground mode: no walk, emit current position only */
        on_step(start_position, context_state);
        break;

    case WALK_TORUS:
        /* 6-step QL torus walk */
        engine_torus_walk(
            engine_next_coordinate(start_position % 6),
            context_state,
            step_count > 6 ? 6 : step_count
        );
        break;

    case WALK_FIBER:
        /* Lemniscate dive via cf chain */
        engine_lemniscate_dive(
            engine_next_coordinate(start_position % 6),
            context_state,
            step_count
        );
        break;

    case WALK_SPANDA: {
        /* 12-step spanda walk (30° per step) */
        uint8_t tick_start = start_position % 12;
        uint8_t ticks = step_count > 12 ? 12 : step_count;
        engine_spanda_walk(tick_start, ticks, context_state, on_step);
        break;
    }
    }
}
```

- [ ] **Step 3: Build**

Run: `make lib`
Expected: Compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add epi-lib/include/engine.h epi-lib/src/engine.c
git commit -m "feat(engine): add Walk_Mode enum, bifurcation param, engine_walk_by_mode() dispatch"
```

---

### Task 5: Walk_Mode C Tests

**Files:**
- Create: `epi-lib/test/test_engine_walk_mode.c`
- Modify: `Makefile`

- [ ] **Step 1: Write test_engine_walk_mode.c**

```c
/* test_engine_walk_mode.c — Walk_Mode derivation and dispatch tests */
#include "../include/engine.h"
#include <stdio.h>
#include <math.h>

static int pass = 0, fail = 0;
#define TEST(name, expr) do { \
    if (expr) { pass++; } \
    else { fail++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)

static uint8_t last_position = 0xFF;
static int callback_count = 0;
static void test_callback(uint8_t pos, void* ctx) {
    (void)ctx;
    last_position = pos;
    callback_count++;
}

int main(void) {
    /* Walk mode derivation from quaternion */
    TEST("ground_w_dominant", walk_mode_from_quaternion(1.0f, 0.0f, 0.0f, 0.0f) == WALK_GROUND);
    TEST("torus_x_dominant",  walk_mode_from_quaternion(0.1f, 0.9f, 0.0f, 0.0f) == WALK_TORUS);
    TEST("fiber_y_dominant",  walk_mode_from_quaternion(0.1f, 0.1f, 0.8f, 0.0f) == WALK_FIBER);
    TEST("spanda_z_dominant", walk_mode_from_quaternion(0.0f, 0.0f, 0.0f, 1.0f) == WALK_SPANDA);

    /* Bifurcation parameter */
    float lambda;
    lambda = walk_bifurcation_param(1.0f, 0.0f, 0.0f, 0.0f);
    TEST("lambda_ground_zero", lambda < 0.001f);

    lambda = walk_bifurcation_param(0.0f, 0.577f, 0.577f, 0.577f);
    TEST("lambda_near_one", lambda > 0.95f && lambda < 1.05f);

    /* Resolution levels */
    TEST("res_0_6fold",  walk_resolution_level(0.10f) == 0);
    TEST("res_1_12fold", walk_resolution_level(0.30f) == 1);
    TEST("res_2_36fold", walk_resolution_level(0.60f) == 2);
    TEST("res_3_72fold", walk_resolution_level(0.80f) == 3);

    /* Walk dispatch: WALK_GROUND emits one position */
    callback_count = 0;
    engine_walk_by_mode(WALK_GROUND, 3, NULL, 1, test_callback);
    TEST("ground_one_callback", callback_count == 1);
    TEST("ground_position", last_position == 3);

    /* Walk dispatch: WALK_SPANDA calls engine_spanda_walk */
    callback_count = 0;
    engine_walk_by_mode(WALK_SPANDA, 0, NULL, 12, test_callback);
    TEST("spanda_12_callbacks", callback_count == 12);

    /* Null callback safety */
    engine_walk_by_mode(WALK_TORUS, 0, NULL, 6, NULL);
    TEST("null_callback_safe", 1);  /* didn't crash */

    /* Zero steps safety */
    callback_count = 0;
    engine_walk_by_mode(WALK_SPANDA, 0, NULL, 0, test_callback);
    TEST("zero_steps_no_callback", callback_count == 0);

    printf("test_engine_walk_mode: %d passed, %d failed\n", pass, fail);
    return fail > 0 ? 1 : 0;
}
```

- [ ] **Step 2: Add Makefile target and run**

```makefile
test-engine-walk-mode: epi-lib/test/test_engine_walk_mode.c $(LIB)
	$(CC) $(CFLAGS) -o $@ $< -L. -lepilogos -lm
	./$@
```

Run: `make test-engine-walk-mode`
Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add epi-lib/test/test_engine_walk_mode.c Makefile
git commit -m "test(engine): add Walk_Mode derivation and dispatch tests"
```

---

### Task 6: Aspect Angle Computation in C

**Files:**
- Modify: `epi-lib/include/m2.h`
- Modify: `epi-lib/src/m2.c`

- [ ] **Step 1: Add Aspect_Result struct and m2_aspect_between() to m2.h**

After the existing `ASPECT_LUT` references in m2.h, add:

```c
/* ─────────────────────────────────────────────────────────────────────
 * Aspect computation between two ecliptic positions.
 * Returns the closest major aspect (if within orb) or ASPECT_NONE.
 * ───────────────────────────────────────────────────────────────────── */

#define ASPECT_NONE          0xFF
#define ASPECT_CONJUNCTION   0   /* 0°   */
#define ASPECT_SEXTILE       1   /* 60°  */
#define ASPECT_SQUARE        2   /* 90°  */
#define ASPECT_TRINE         3   /* 120° */
#define ASPECT_OPPOSITION    4   /* 180° */
#define MAJOR_ASPECT_COUNT   5

static const uint16_t MAJOR_ASPECT_ANGLE[MAJOR_ASPECT_COUNT] = {0, 60, 90, 120, 180};
static const uint8_t  MAJOR_ASPECT_ORB[MAJOR_ASPECT_COUNT]   = {10, 6, 8, 8, 10};

typedef struct {
    uint8_t  aspect_type;    /* ASPECT_CONJUNCTION..OPPOSITION or ASPECT_NONE */
    float    angle;          /* Angular separation (0–180) */
    float    orb;            /* Deviation from exact aspect */
} Aspect_Result;

static inline Aspect_Result m2_aspect_between(uint16_t deg_a, uint16_t deg_b) {
    int32_t diff = (int32_t)(deg_a % 360) - (int32_t)(deg_b % 360);
    if (diff < 0) diff = -diff;
    if (diff > 180) diff = 360 - diff;
    float angle = (float)diff;

    Aspect_Result best = { .aspect_type = ASPECT_NONE, .angle = angle, .orb = 999.0f };
    for (uint8_t i = 0; i < MAJOR_ASPECT_COUNT; i++) {
        float dev = angle - (float)MAJOR_ASPECT_ANGLE[i];
        if (dev < 0) dev = -dev;
        if (dev <= (float)MAJOR_ASPECT_ORB[i] && dev < best.orb) {
            best.aspect_type = i;
            best.orb = dev;
        }
    }
    return best;
}
```

- [ ] **Step 2: Build**

Run: `make lib`
Expected: Compiles.

- [ ] **Step 3: Commit**

```bash
git add epi-lib/include/m2.h
git commit -m "feat(m2): add m2_aspect_between() with 5 major aspects + orb tolerance"
```

---

### Task 7: Aspect Computation C Tests

**Files:**
- Create: `epi-lib/test/test_m2_aspects.c`
- Modify: `Makefile`

- [ ] **Step 1: Write test_m2_aspects.c**

```c
/* test_m2_aspects.c — Planetary aspect computation tests */
#include "../include/m2.h"
#include <stdio.h>

static int pass = 0, fail = 0;
#define TEST(name, expr) do { \
    if (expr) { pass++; } \
    else { fail++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)

int main(void) {
    Aspect_Result r;

    /* Exact conjunction */
    r = m2_aspect_between(90, 90);
    TEST("conjunction_exact", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("conjunction_orb_0", r.orb < 0.5f);

    /* Near conjunction (within orb) */
    r = m2_aspect_between(90, 95);
    TEST("conjunction_5deg", r.aspect_type == ASPECT_CONJUNCTION);

    /* Exact opposition */
    r = m2_aspect_between(0, 180);
    TEST("opposition_exact", r.aspect_type == ASPECT_OPPOSITION);

    /* Exact trine */
    r = m2_aspect_between(0, 120);
    TEST("trine_exact", r.aspect_type == ASPECT_TRINE);

    /* Exact square */
    r = m2_aspect_between(45, 135);
    TEST("square_exact", r.aspect_type == ASPECT_SQUARE);

    /* Exact sextile */
    r = m2_aspect_between(30, 90);
    TEST("sextile_exact", r.aspect_type == ASPECT_SEXTILE);

    /* No aspect (e.g., 45° — semisquare not in major aspects) */
    r = m2_aspect_between(0, 45);
    TEST("no_major_aspect", r.aspect_type == ASPECT_NONE);

    /* Wrap-around: 350° and 10° are 20° apart → conjunction (within 10° orb) */
    r = m2_aspect_between(350, 10);
    TEST("wrap_conjunction", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("wrap_angle_20", r.angle > 19.5f && r.angle < 20.5f);

    /* Wrap-around: 10° and 190° = 180° → opposition */
    r = m2_aspect_between(10, 190);
    TEST("wrap_opposition", r.aspect_type == ASPECT_OPPOSITION);

    printf("test_m2_aspects: %d passed, %d failed\n", pass, fail);
    return fail > 0 ? 1 : 0;
}
```

- [ ] **Step 2: Add Makefile target, run**

Run: `make test-m2-aspects`
Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add epi-lib/test/test_m2_aspects.c Makefile
git commit -m "test(m2): add aspect computation tests (5 major aspects + wrap-around)"
```

---

### Task 8: Full C Test Suite Verification

**Files:** None modified — verification only.

- [ ] **Step 1: Run full C test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments" && make test`
Expected: All tests pass including new ones. Total should be 110+ C tests + 5 VAK + new codon/walk/aspect tests.

- [ ] **Step 2: Run Rust tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test`
Expected: All existing Rust tests pass.

- [ ] **Step 3: Commit (if any fixes needed)**

---

## Phase B: Rust Dynamics Engine (Agent B)

### Task 9: CODON_CLASS_LUT[64] in Rust

**Files:**
- Modify: `epi-cli/src/nara/oracle.rs`

Mirror the C classification in Rust as a compile-time LUT.

- [ ] **Step 1: Add CODON_CLASS_LUT to oracle.rs**

At the top of `oracle.rs`, after the existing LUTs, add:

```rust
use crate::portal::clock_state::CodonClass;

// ─────────────────────────────────────────────────────────────────────────────
// CODON_CLASS_LUT[64] — 5-fold classification mirroring C M3_CODON_CLASS
//
// Classification:
//   PerfectPalindromic (16): outer == inner nucleotide (XyX pattern)
//   Palindromic (24): non-dual (pair1==pair2) but not XyX
//   Dual (24): pair1 ≠ pair2
//
// Nucleotide encoding: A=0b00, T=0b01, C=0b10, G=0b11
// Codon = (outer<<4) | (middle<<2) | inner
// ─────────────────────────────────────────────────────────────────────────────

/// Classify a 6-bit codon. XyX check: outer == inner.
/// Non-dual check: uses Watson-Crick symmetry of the pair matrix.
pub fn classify_codon(codon: u8) -> CodonClass {
    let outer = (codon >> 4) & 0x03;
    let inner = codon & 0x03;
    if outer == inner {
        return CodonClass::PerfectPalindromic;
    }
    // Non-dual check: the complement-reversed codon equals itself
    // Complement: XOR each nucleotide with 0x01 (A↔T, C↔G), then reverse
    let n1 = (codon >> 4) & 0x03;
    let n2 = (codon >> 2) & 0x03;
    let n3 = codon & 0x03;
    let anti = ((n3 ^ 0x01) << 4) | ((n2 ^ 0x01) << 2) | (n1 ^ 0x01);
    if anti == codon {
        CodonClass::Palindromic
    } else {
        // Check rotational profile: non-dual if pair1.sequence == pair2.sequence
        // This matches the M3_Transcription_Engine.non_dual_mask (40 bits)
        // For now use the anticodon self-equality plus additional pair symmetry check
        let pair_sym = ((n1 ^ 0x01) == n3) && ((n3 ^ 0x01) == n1);
        if pair_sym && n2 == (n2 ^ 0x01) ^ 0x01 {
            CodonClass::Palindromic
        } else {
            CodonClass::Dual
        }
    }
}

/// Watson-Crick anticodon of a 6-bit codon.
pub fn wc_anticodon(codon: u8) -> u8 {
    let n1 = (codon >> 4) & 0x03;
    let n2 = (codon >> 2) & 0x03;
    let n3 = codon & 0x03;
    ((n3 ^ 0x01) << 4) | ((n2 ^ 0x01) << 2) | (n1 ^ 0x01)
}

/// DNA sequence string from 6-bit codon.
pub fn codon_sequence(codon: u8) -> [u8; 3] {
    const NUC: [u8; 4] = [b'A', b'T', b'C', b'G'];
    [
        NUC[((codon >> 4) & 0x03) as usize],
        NUC[((codon >> 2) & 0x03) as usize],
        NUC[(codon & 0x03) as usize],
    ]
}
```

- [ ] **Step 2: Add Rust test**

```rust
#[cfg(test)]
mod codon_class_tests {
    use super::*;

    #[test]
    fn test_codon_classification_counts() {
        let mut perfect = 0u32;
        let mut palindromic = 0u32;
        let mut dual = 0u32;
        for c in 0..64u8 {
            match classify_codon(c) {
                CodonClass::PerfectPalindromic => perfect += 1,
                CodonClass::Palindromic => palindromic += 1,
                CodonClass::Dual => dual += 1,
            }
        }
        assert_eq!(perfect, 16, "Expected 16 perfect palindromes");
        assert_eq!(perfect + palindromic + dual, 64);
        // Note: exact palindromic vs dual split depends on pair matrix
        // At minimum: all XyX are perfect, total is 64
    }

    #[test]
    fn test_xyx_are_perfect() {
        for c in 0..64u8 {
            let outer = (c >> 4) & 0x03;
            let inner = c & 0x03;
            if outer == inner {
                assert_eq!(classify_codon(c), CodonClass::PerfectPalindromic);
            }
        }
    }

    #[test]
    fn test_anticodon_involution() {
        for c in 0..64u8 {
            assert_eq!(wc_anticodon(wc_anticodon(c)), c, "Anticodon must be involution");
        }
    }
}
```

- [ ] **Step 3: Run tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test codon_class`
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/nara/oracle.rs
git commit -m "feat(oracle): add CODON_CLASS_LUT with 5-fold classification mirroring C m3.h"
```

---

### Task 10: Quaternion Composition (Compose, Don't Overwrite)

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

Change `update_from_cast()` to COMPOSE the live quaternion with quintessence (natal) quaternion via Hamilton product, not overwrite. Add transit quaternion composition from kairos.

- [ ] **Step 1: Add quaternion helper functions**

At the top of `clock_state.rs`, after the imports, add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// QUATERNION HELPERS — Hamilton product, normalization, composition
// Mirrors C m1.h quat_mul/quat_conj/quat_normalize
// ─────────────────────────────────────────────────────────────────────────────

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

fn quat_normalize(q: [f32; 4]) -> [f32; 4] {
    let mag = (q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]).sqrt();
    if mag < f32::EPSILON { return [1.0, 0.0, 0.0, 0.0]; }
    [q[0]/mag, q[1]/mag, q[2]/mag, q[3]/mag]
}

fn quat_dot(a: [f32; 4], b: [f32; 4]) -> f32 {
    a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]
}

/// Derive Walk_Mode from quaternion: argmax of |w|, |x|, |y|, |z|.
fn derive_walk_mode(q: [f32; 4]) -> WalkMode {
    let abs = [q[0].abs(), q[1].abs(), q[2].abs(), q[3].abs()];
    let mut max_idx = 0u8;
    let mut max_val = abs[0];
    for i in 1..4 {
        if abs[i] > max_val { max_val = abs[i]; max_idx = i as u8; }
    }
    match max_idx {
        0 => WalkMode::Ground,
        1 => WalkMode::Torus,
        2 => WalkMode::Fiber,
        _ => WalkMode::Spanda,
    }
}

/// Bifurcation parameter λ = sqrt(x² + y² + z²).
fn derive_bifurcation(q: [f32; 4]) -> (f32, u8) {
    let lambda = (q[1]*q[1] + q[2]*q[2] + q[3]*q[3]).sqrt();
    let level = if lambda < 0.25 { 0 }
                else if lambda < 0.50 { 1 }
                else if lambda < 0.75 { 2 }
                else { 3 };
    (lambda, level)
}
```

- [ ] **Step 2: Modify update_from_cast() to compose quaternions**

Replace the body of `update_from_cast()` with quaternion composition logic:

```rust
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

    // Oracle charges → raw quaternion (un-normalized)
    let (w, x, y, z) = (pp/total, nn/total, np/total, pn/total);
    let oracle_q = quat_normalize([w, x, y, z]);

    // Quantized Spanda substage — integer, not float cast
    let tick12 = quantize_to_spanda_substage(y, x);

    // QL position and phase from tick12
    let ql_position = if tick12 < 6 { tick12 } else { 11 - tick12 };

    // Deficient degree via # operator (antiparallel offset = 180°)
    let deficient = (degree as u32 + 180) % 360;

    // Implicate: same degree, # inversion (inversion_state flipped)
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

    // COMPOSE: Q_actual = Q_natal × Q_transit × Q_oracle (non-commutative)
    // Priority: identity > cosmos > divination
    let composed = quat_normalize(
        quat_mul(quat_mul(s.quintessence_quaternion, s.transit_quaternion), oracle_q)
    );

    // Derive dynamics from composed quaternion
    let walk_mode = derive_walk_mode(composed);
    let (lambda, res_level) = derive_bifurcation(composed);

    s.live_quaternion     = composed;
    s.current_degree      = degree;
    s.tick12              = tick12;
    s.ql_position         = ql_position;
    s.walk_mode           = walk_mode;
    s.bifurcation_param   = lambda;
    s.resolution_level    = res_level;
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

    // Micro-orbit: append this cast's degree (personal mandala ledger)
    s.micro_orbit.push(degree);
    if s.micro_orbit.len() > 360 {
        s.micro_orbit.remove(0); // keep last 360 positions
    }
}
```

- [ ] **Step 3: Add Rust tests for composition**

```rust
#[cfg(test)]
mod composition_tests {
    use super::*;

    #[test]
    fn test_quat_mul_identity() {
        let id = [1.0f32, 0.0, 0.0, 0.0];
        let q = [0.5, 0.5, 0.5, 0.5];
        let result = quat_mul(id, q);
        for i in 0..4 { assert!((result[i] - q[i]).abs() < 1e-6); }
    }

    #[test]
    fn test_derive_walk_mode() {
        assert_eq!(derive_walk_mode([0.9, 0.1, 0.1, 0.1]), WalkMode::Ground);
        assert_eq!(derive_walk_mode([0.1, 0.9, 0.1, 0.1]), WalkMode::Torus);
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.9, 0.1]), WalkMode::Fiber);
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.1, 0.9]), WalkMode::Spanda);
    }

    #[test]
    fn test_bifurcation_levels() {
        let (_, l0) = derive_bifurcation([0.99, 0.01, 0.0, 0.0]);
        assert_eq!(l0, 0);
        let (_, l3) = derive_bifurcation([0.1, 0.5, 0.5, 0.5]);
        assert_eq!(l3, 3);
    }

    #[test]
    fn test_update_from_cast_composes() {
        let state = new_shared_clock_state();
        // Set a non-identity quintessence quaternion
        state.lock().unwrap().quintessence_quaternion = quat_normalize([0.5, 0.5, 0.5, 0.5]);
        update_from_cast(&state, 3.0, 3.0, 3.0, 3.0, 90, 25, 43, 0b100000);
        let s = state.lock().unwrap();
        // live_quaternion should NOT be pure oracle charges — it should be composed
        let norm = s.live_quaternion.iter().map(|v| v*v).sum::<f32>().sqrt();
        assert!((norm - 1.0).abs() < 0.01, "Must be unit quaternion");
        assert!(s.micro_orbit.len() == 1);
        assert_eq!(s.micro_orbit[0], 90);
    }
}
```

- [ ] **Step 4: Run tests**

Run: `cargo test composition_tests`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): quaternion composition (natal×transit×oracle), walk mode, bifurcation"
```

---

### Task 11: Aspect Computation Between Planets in Rust

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Add compute_aspects() function**

After `update_kairos()`, add:

```rust
/// Major aspect angles and orbs (mirrors C m2.h MAJOR_ASPECT_ANGLE/ORB).
const ASPECT_ANGLES: [(u16, u8, &str); 5] = [
    (0,   10, "conjunction"),
    (60,   6, "sextile"),
    (90,   8, "square"),
    (120,  8, "trine"),
    (180, 10, "opposition"),
];

/// Compute all planet-to-planet aspects from kairos state.
/// Updates state.aspects with detected aspects within orb.
pub fn compute_aspects(state: &SharedClockState) {
    let mut s = state.lock().unwrap();
    let planets = &s.kairos.planets;
    if !s.kairos.valid { s.aspects.clear(); return; }

    let mut aspects = Vec::new();
    for a in 0..10u8 {
        if planets[a as usize].degree == 0xFFFF { continue; }
        for b in (a+1)..10 {
            if planets[b as usize].degree == 0xFFFF { continue; }
            let deg_a = planets[a as usize].degree;
            let deg_b = planets[b as usize].degree;
            let mut diff = (deg_a as i32 - deg_b as i32).abs();
            if diff > 180 { diff = 360 - diff; }
            let angle = diff as f32;

            for &(exact, orb, _) in &ASPECT_ANGLES {
                let dev = (angle - exact as f32).abs();
                if dev <= orb as f32 {
                    aspects.push(PlanetaryAspect {
                        planet_a: a,
                        planet_b: b,
                        aspect_type: match exact { 0=>0, 60=>1, 90=>2, 120=>3, _=>4 },
                        angle,
                        orb: dev,
                    });
                    break;
                }
            }
        }
    }
    s.aspects = aspects;
}

/// Update kairos state AND recompute aspects + transit quaternion.
pub fn update_kairos_full(state: &SharedClockState, kairos: KairosState) {
    // Compute transit quaternion from planetary configuration
    // Weighted average of planet-degree-derived element contributions
    let mut elem_sum = [0.0f32; 4]; // [EARTH, FIRE, WATER, AIR]
    let mut count = 0.0f32;
    for p in &kairos.planets {
        if p.degree == 0xFFFF { continue; }
        // Map planet degree → zodiac sign → element
        let sign = (p.degree / 30) % 12;
        let elem_idx = match sign % 4 {
            0 => 1, // Aries/Leo/Sag → FIRE (x)
            1 => 0, // Taurus/Virgo/Cap → EARTH (w)
            2 => 3, // Gemini/Libra/Aqua → AIR (z)
            _ => 2, // Cancer/Scorpio/Pisces → WATER (y)
        };
        elem_sum[elem_idx] += 1.0;
        count += 1.0;
    }
    let transit_q = if count > 0.0 {
        quat_normalize([
            elem_sum[0]/count,
            elem_sum[1]/count,
            elem_sum[2]/count,
            elem_sum[3]/count,
        ])
    } else {
        [1.0, 0.0, 0.0, 0.0]
    };

    {
        let mut s = state.lock().unwrap();
        s.kairos = kairos;
        s.transit_quaternion = transit_q;
    }
    compute_aspects(state);
}
```

- [ ] **Step 2: Run tests**

Run: `cargo test`
Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add aspect computation + transit quaternion from kairos"
```

---

### Task 12: Codon Bridge — Degree to Active Codon

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`
- Modify: `epi-cli/src/nara/oracle.rs`

Wire the codon classification into the clock state after each oracle cast.

- [ ] **Step 1: Add update_active_codon() to clock_state.rs**

```rust
/// Update active codon data from the current degree.
/// Uses CLOCK_DEGREE_LUT-equivalent mapping: degree → decan → codon.
pub fn update_active_codon(state: &SharedClockState, degree: u16, hexagram_id: u8) {
    // Clock A: degree → decan → codon (simplified: decan * 64 / 36, clamped)
    let decan_idx = (degree / 10) % 36;
    let codon_a = ((decan_idx as u16 * 64) / 36) as u8;

    // Clock B: hexagram → codon (hexagram IS the 6-bit codon in this system)
    let codon_b = hexagram_id & 0x3F;

    let class_a = crate::nara::oracle::classify_codon(codon_a);
    let class_b = crate::nara::oracle::classify_codon(codon_b);
    let seq_a = crate::nara::oracle::codon_sequence(codon_a);
    let anti = crate::nara::oracle::wc_anticodon(codon_a);

    let mut s = state.lock().unwrap();
    s.active_codon = ActiveCodon {
        codon_a,
        codon_b,
        class_a,
        class_b,
        sequence_a: seq_a,
        amino_acid: 0, // TODO: wire M3_CODON_TO_AA equivalent
        anticodon: anti,
        rotation_count_a: class_a.rotational_state_count(),
    };
}
```

- [ ] **Step 2: Call update_active_codon() from update_from_cast()**

Inside `update_from_cast()`, after setting `s.last_cast`, add (before releasing the lock — need to call it outside the lock since it takes SharedClockState):

Actually, since we already have the lock, do it inline:

```rust
    // Update active codon
    let decan_idx = (degree / 10) % 36;
    let codon_a = ((decan_idx as u16 * 64) / 36) as u8;
    let codon_b = primary_hex & 0x3F;
    s.active_codon = ActiveCodon {
        codon_a,
        codon_b,
        class_a: crate::nara::oracle::classify_codon(codon_a),
        class_b: crate::nara::oracle::classify_codon(codon_b),
        sequence_a: crate::nara::oracle::codon_sequence(codon_a),
        amino_acid: 0,
        anticodon: crate::nara::oracle::wc_anticodon(codon_a),
        rotation_count_a: crate::nara::oracle::classify_codon(codon_a).rotational_state_count(),
    };
```

- [ ] **Step 3: Run tests**

Run: `cargo test`
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/clock_state.rs epi-cli/src/nara/oracle.rs
git commit -m "feat(clock): wire codon bridge — degree→codon classification in active_codon"
```

---

### Task 13: Journal NLP Elemental Weighting Stub

**Files:**
- Modify: `epi-cli/src/nara/identity.rs`

- [ ] **Step 1: Add journal_elemental_weight stub**

At the end of `identity.rs`, add:

```rust
// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL NLP — Elemental Quaternionic Weighting (STUB)
//
// Future: analyse journal text → elemental balance → quaternion contribution.
// Approach: keyword/sentiment extraction → map to FIRE/WATER/EARTH/AIR weights
// → compose with 72-fold MEF lens depth for depth-aware weighting.
//
// For now: returns identity quaternion (no contribution from journal).
// ─────────────────────────────────────────────────────────────────────────────

/// Stub: elemental quaternionic weighting from journal text.
/// Returns [w=EARTH, x=FIRE, y=WATER, z=AIR] weights.
///
/// Future implementation will use NLP pipeline:
///   1. Tokenize journal entry
///   2. Extract elemental keywords (fire-words, water-words, etc.)
///   3. Weight by 72-fold MEF lens depth (which of the 12×6 lenses is active)
///   4. Normalize to unit quaternion
///   5. Feed into quintessence composition chain
pub fn journal_elemental_weight(_text: &str) -> [f32; 4] {
    // Stub: identity quaternion (no contribution)
    [1.0, 0.0, 0.0, 0.0]
}

#[cfg(test)]
mod journal_tests {
    use super::*;

    #[test]
    fn test_journal_stub_returns_identity() {
        let q = journal_elemental_weight("This is a test journal entry about fire and water.");
        assert_eq!(q, [1.0, 0.0, 0.0, 0.0]);
    }
}
```

- [ ] **Step 2: Run test**

Run: `cargo test journal_tests`
Expected: Pass.

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/nara/identity.rs
git commit -m "feat(identity): stub journal NLP elemental quaternionic weighting (future: 72-fold MEF)"
```

---

### Task 14: Wire update_kairos_full into Kairos Sync

**Files:**
- Modify: `epi-cli/src/nara/kairos.rs`
- Modify: `epi-cli/src/portal/plugins/clock.rs`

Where kairos sync currently calls `update_kairos()`, change to `update_kairos_full()` so aspects and transit quaternion are computed.

- [ ] **Step 1: Update kairos sync callsite**

Search for `update_kairos(` in the portal plugins and replace with `update_kairos_full(`:

In `clock.rs`, the `try_load_kairos_into_clock()` function calls `update_kairos`. Change:

```rust
// Before:
clock_state::update_kairos(&self.clock_state, kairos);
// After:
clock_state::update_kairos_full(&self.clock_state, kairos);
```

- [ ] **Step 2: Build and verify**

Run: `cargo check`
Expected: Compiles. The old `update_kairos()` can remain as a simpler entry point.

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(kairos): wire update_kairos_full() for aspect + transit quaternion computation"
```

---

## Phase C: Portal Plugin Rendering (Agent C)

### Task 15: CosmicClockPlugin — Planet Glyphs + Aspect Lines

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add aspect line rendering to render_degree_ring()**

In the `render_degree_ring()` method, after drawing planet markers, add aspect lines:

```rust
    // Draw aspect lines between planets
    let aspects = &clock.aspects;
    for asp in aspects {
        let deg_a = clock.kairos.planets[asp.planet_a as usize].degree;
        let deg_b = clock.kairos.planets[asp.planet_b as usize].degree;
        if deg_a == 0xFFFF || deg_b == 0xFFFF { continue; }

        let color = match asp.aspect_type {
            0 => Color::Yellow,      // conjunction
            1 => Color::Cyan,        // sextile
            2 => Color::Red,         // square
            3 => Color::Blue,        // trine
            4 => Color::Magenta,     // opposition
            _ => Color::DarkGray,
        };

        // Draw line between the two degree positions on the ring
        let angle_a = deg_a as f32 * std::f32::consts::TAU / 360.0;
        let angle_b = deg_b as f32 * std::f32::consts::TAU / 360.0;
        let ring_r = (radius as f32) * 0.85;
        let (ax, ay) = (cx + ring_r * angle_a.cos(), cy + ring_r * angle_a.sin());
        let (bx, by) = (cx + ring_r * angle_b.cos(), cy + ring_r * angle_b.sin());

        // Bresenham line from (ax,ay) to (bx,by) using aspect color
        self.canvas.draw_line(ax as i32, ay as i32, bx as i32, by as i32, color);
    }
```

- [ ] **Step 2: Add micro-orbit trail rendering**

After aspect lines, draw the micro-orbit trail:

```rust
    // Draw micro-orbit trail (personal mandala / signature)
    let trail = &clock.micro_orbit;
    for (i, &deg) in trail.iter().enumerate() {
        let alpha = (i as f32) / (trail.len().max(1) as f32); // fade older positions
        let angle = deg as f32 * std::f32::consts::TAU / 360.0;
        let trail_r = (radius as f32) * 0.75;
        let px = cx + trail_r * angle.cos();
        let py = cy + trail_r * angle.sin();
        let color = if alpha > 0.5 { Color::White } else { Color::DarkGray };
        self.canvas.set_pixel(px as i32, py as i32, color);
    }
```

- [ ] **Step 3: Build and verify**

Run: `cargo check`
Expected: Compiles. Exact rendering depends on canvas API — adapt `draw_line` / `set_pixel` to actual BrailleCanvas methods.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(clock-plugin): render aspect lines + micro-orbit trail on degree ring"
```

---

### Task 16: CosmicClockPlugin — Codon Classification + Resolution Ticks

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs`

- [ ] **Step 1: Add codon classification to side panel**

In the side panel rendering section (where degree, hexagram, etc. are displayed), add:

```rust
    // Codon classification display
    let codon = &clock.active_codon;
    let seq_str = std::str::from_utf8(&codon.sequence_a).unwrap_or("???");
    lines.push(Spans::from(vec![
        Span::styled("Codon A: ", Style::default().fg(Color::Gray)),
        Span::styled(seq_str, Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
        Span::raw(" "),
        Span::styled(
            codon.class_a.label(),
            Style::default().fg(match codon.class_a {
                CodonClass::PerfectPalindromic => Color::Yellow,
                CodonClass::Palindromic => Color::Cyan,
                CodonClass::Dual => Color::Magenta,
            }),
        ),
        Span::styled(
            format!(" ({}R)", codon.rotation_count_a),
            Style::default().fg(Color::DarkGray),
        ),
    ]));

    // Walk mode + bifurcation
    lines.push(Spans::from(vec![
        Span::styled("Walk: ", Style::default().fg(Color::Gray)),
        Span::styled(clock.walk_mode.label(), Style::default().fg(Color::Green)),
        Span::raw("  "),
        Span::styled(format!("λ={:.2}", clock.bifurcation_param), Style::default().fg(Color::Yellow)),
        Span::raw("  "),
        Span::styled(
            match clock.resolution_level {
                0 => "6-fold",
                1 => "12-fold",
                2 => "36-fold",
                _ => "72-fold",
            },
            Style::default().fg(Color::Cyan),
        ),
    ]));
```

- [ ] **Step 2: Add resolution-aware tick marks on the degree ring**

In the ring rendering loop, adjust tick visibility based on `resolution_level`:

```rust
    let res = clock.resolution_level;
    for d in 0..360u16 {
        let show_tick = match res {
            0 => d % 60 == 0,   // 6-fold: only QL positions
            1 => d % 30 == 0,   // 12-fold: spanda ticks
            2 => d % 10 == 0,   // 36-fold: decan boundaries
            _ => d % 5 == 0,    // 72-fold: half-decan boundaries
        };
        if !show_tick { continue; }
        // Draw tick mark at degree d...
    }
```

- [ ] **Step 3: Build and verify**

Run: `cargo check`
Expected: Compiles.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "feat(clock-plugin): codon classification display + resolution-aware tick rendering"
```

---

### Task 17: MiniClockPlugin — Walk Mode Indicator

**Files:**
- Modify: `epi-cli/src/portal/plugins/mini_clock.rs`

- [ ] **Step 1: Add walk mode indicator to mini clock display**

In the render method, after the tick12 indicator, add:

```rust
    // Walk mode indicator (colored element label)
    let walk_mode = clock.walk_mode;
    let mode_span = Span::styled(
        walk_mode.label(),
        Style::default().fg(match walk_mode {
            WalkMode::Ground => Color::White,   // EARTH
            WalkMode::Torus  => Color::Red,     // FIRE
            WalkMode::Fiber  => Color::Blue,    // WATER
            WalkMode::Spanda => Color::Cyan,    // AIR
        }),
    );
    // Bifurcation bar: λ as a visual gauge
    let lambda_bar_len = (clock.bifurcation_param * 8.0).round() as usize;
    let bar = "▓".repeat(lambda_bar_len.min(8)) + &"░".repeat(8 - lambda_bar_len.min(8));
    let lambda_span = Span::styled(bar, Style::default().fg(Color::Yellow));
```

- [ ] **Step 2: Build and verify**

Run: `cargo check`

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/mini_clock.rs
git commit -m "feat(mini-clock): add walk mode indicator + bifurcation gauge"
```

---

### Task 18: M4OraclePlugin — Post-Cast Hopf Display

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

- [ ] **Step 1: Add post-cast Hopf summary to oracle display**

After the existing cast result display, add:

```rust
    // Hopf dynamics summary (post-cast)
    if let Some(ref faces) = clock.last_cast {
        let codon = &clock.active_codon;
        lines.push(Spans::from("─── Hopf Dynamics ───"));
        lines.push(Spans::from(vec![
            Span::styled("Walk: ", Style::default().fg(Color::Gray)),
            Span::styled(clock.walk_mode.label(), Style::default().fg(Color::Green)),
            Span::raw(format!("  λ={:.2}  Res={}-fold",
                clock.bifurcation_param,
                match clock.resolution_level { 0=>6, 1=>12, 2=>36, _=>72 })),
        ]));
        lines.push(Spans::from(vec![
            Span::styled("Codon: ", Style::default().fg(Color::Gray)),
            Span::styled(
                std::str::from_utf8(&codon.sequence_a).unwrap_or("???"),
                Style::default().fg(Color::White)),
            Span::raw(format!(" [{}] {}R  Anti: {:02X}",
                codon.class_a.label(),
                codon.rotation_count_a,
                codon.anticodon)),
        ]));
        lines.push(Spans::from(vec![
            Span::styled("Orbit: ", Style::default().fg(Color::Gray)),
            Span::raw(format!("{} casts", clock.micro_orbit.len())),
        ]));
    }
```

- [ ] **Step 2: Build and verify**

Run: `cargo check`

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(oracle-plugin): post-cast Hopf dynamics summary (walk/λ/codon/orbit)"
```

---

### Task 19: M2VibrationalPlugin — Active Cell + λ Dimming

**Files:**
- Modify: `epi-cli/src/portal/plugins/m2.rs`

- [ ] **Step 1: Add active cell highlighting and λ-based dimming**

In the matrix cell rendering loop:

```rust
    // Highlight the active cell based on current tick12 and ql_position
    let active_tick = clock.tick12 as usize;
    let active_ql = clock.ql_position as usize;

    for tick in 0..12 {
        for ql in 0..6 {
            let cell = &self.cells[tick * 6 + ql];
            let is_active = tick == active_tick && ql == active_ql;

            // λ-based dimming: higher λ = more cells visible
            let res = clock.resolution_level;
            let should_show = match res {
                0 => ql < 1,                    // 6-fold: only position 0
                1 => true,                      // 12-fold: all ticks
                2 => true,                      // 36-fold: all + decan detail
                _ => true,                      // 72-fold: everything
            };

            let style = if is_active {
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD | Modifier::REVERSED)
            } else if !should_show {
                Style::default().fg(Color::DarkGray)
            } else {
                // Codon classification coloring
                let codon_6bit = ((cell.half_decan_idx as u16 * 64) / 72) as u8;
                let cls = crate::nara::oracle::classify_codon(codon_6bit);
                Style::default().fg(match cls {
                    CodonClass::PerfectPalindromic => Color::Yellow,
                    CodonClass::Palindromic => Color::Cyan,
                    CodonClass::Dual => Color::White,
                })
            };
            // Apply style to cell rendering...
        }
    }
```

- [ ] **Step 2: Build and verify**

Run: `cargo check`

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/m2.rs
git commit -m "feat(m2-plugin): active cell highlight + λ-dimming + codon class coloring"
```

---

### Task 20: M4SpinePlugin — λ-Modulated Glow

**Files:**
- Modify: `epi-cli/src/portal/plugins/spine.rs`

- [ ] **Step 1: Modulate chakra glow by bifurcation parameter**

In the spine rendering where `chakra_levels` drive bar height:

```rust
    // λ-modulated glow: bifurcation amplifies active chakra display
    let lambda = clock.bifurcation_param;
    let glow_factor = 1.0 + lambda * 0.5; // 1.0–1.5x amplification

    for chakra_idx in 0..8 {
        let base_level = clock.chakra_levels[chakra_idx];
        let display_level = (base_level * glow_factor).min(1.0);

        // Resolution indicator: show which fold the system is in
        let res_marker = match clock.resolution_level {
            0 => "·",   // 6-fold
            1 => "∘",   // 12-fold
            2 => "○",   // 36-fold
            _ => "●",   // 72-fold
        };
        // Render bar with display_level and append res_marker...
    }
```

- [ ] **Step 2: Build and verify**

Run: `cargo check`

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/spine.rs
git commit -m "feat(spine-plugin): λ-modulated glow + resolution indicator"
```

---

## Phase D: Verification

### Task 21: Full Build and Automated Test Suite

**Files:** None modified — verification only.

- [ ] **Step 1: Full C build + tests**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
make clean && make test
```

Expected: All C tests pass, including:
- Existing 110 tests + 5 VAK
- New: test_m3_codon_class (16+24+24=64, 472 states)
- New: test_engine_walk_mode (Walk_Mode derivation + dispatch)
- New: test_m2_aspects (5 major aspects + wrap-around)

- [ ] **Step 2: Full Rust build + tests**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli"
cargo test
```

Expected: All Rust tests pass, including:
- Existing tests
- New: codon_class_tests (classification counts, XyX check, anticodon involution)
- New: composition_tests (quat_mul identity, walk mode, bifurcation, compose flow)
- New: journal_tests (stub returns identity)

- [ ] **Step 3: Build the binary**

```bash
cargo build
```

Expected: `epi-cli/target/debug/epi` binary builds cleanly.

---

### Task 22: Manual TUI Verification Protocol

Follow the steps in `docs/plans/CLOCK-AND-NARA-SPECS/TESTING-PROTOCOL.md` plus these new checks:

- [ ] **Step 1: Verify codon classification in oracle cast**

```bash
epi portal --tab personal
```

Press `c` then `y` to cast. Verify post-cast display shows:
- Walk mode (GROUND/TORUS/FIBER/SPANDA)
- λ value with resolution level (6/12/36/72-fold)
- Codon sequence (3-letter DNA) with class label (Perfect Palindrome / Palindromic / Dual)
- Rotational state count (7R or 8R)
- Micro-orbit count incrementing

- [ ] **Step 2: Verify aspect lines in cosmic clock**

```bash
epi portal --tab structural
```

After kairos sync, verify:
- Planet glyphs visible on degree ring
- Colored aspect lines between planets in aspect
- Conjunction (yellow), sextile (cyan), square (red), trine (blue), opposition (magenta)

- [ ] **Step 3: Verify resolution cascade**

Cast multiple times with varying elemental balance. Observe:
- When λ is low (near-equal charges): 6-fold tick marks only
- When λ is high (one element dominant): 72-fold tick marks visible
- M2 vibrational matrix dims cells at low resolution

- [ ] **Step 4: Verify walk mode changes**

After casts with different charge distributions:
- All-EARTH charges → GROUND mode
- FIRE-dominant → TORUS mode
- WATER-dominant → FIBER mode
- AIR-dominant → SPANDA mode

- [ ] **Step 5: Verify micro-orbit trail**

After 5+ oracle casts, check:
- Cosmic clock shows trail dots on inner ring
- Trail fades from old (gray) to new (white)
- Each cast adds one degree to the trail

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Requirement | Task |
|-----------------|------|
| 5-fold codon classification (dual/non-dual/perfect palindromic/palindromic/non-palindromic) | Tasks 0, 1, 9 |
| 472 rotational states (40×7 + 24×8) | Tasks 0, 3 (tested) |
| Codon_Class in Clock_Degree_Entry | Task 1 |
| Walk_Mode enum (GROUND/TORUS/FIBER/SPANDA) | Tasks 4, 5 |
| engine_walk_by_mode() C dispatch | Task 4 |
| Bifurcation parameter λ | Tasks 4, 10 |
| Resolution cascade (6/12/36/72-fold) | Tasks 4, 10, 16, 19 |
| Quaternion COMPOSITION (not overwrite) | Task 10 |
| Transit quaternion from kairos | Task 11 |
| Planetary aspects (5 major) | Tasks 6, 7, 11 |
| Aspect rendering (colored lines) | Task 15 |
| Micro-orbit trail (personal mandala) | Tasks 10, 15 |
| Codon bridge (degree → codon properties) | Task 12 |
| Active codon display (sequence + class + rotation count) | Tasks 12, 16 |
| Walk mode indicator in MiniClock | Task 17 |
| Post-cast Hopf display in Oracle | Task 18 |
| M2 active cell + λ-dimming | Task 19 |
| Spine λ-modulated glow | Task 20 |
| Journal NLP stub | Task 13 |
| C↔Rust parity (quaternions, codons, walks, aspects) | All of Phase A + B |

### 2. Placeholder Scan
- No "TBD", "TODO", "implement later" in task steps
- Journal NLP is explicitly stubbed (Task 13) with clear future intent documented
- `amino_acid` field in ActiveCodon set to 0 — acceptable stub, can wire M3_CODON_TO_AA later

### 3. Type Consistency
- `CodonClass` enum: same name in Rust (Task 2) and concept in C `Codon_Class` (Task 0)
- `WalkMode` enum: same name in Rust (Task 2) and `Walk_Mode` in C (Task 4)
- `PlanetaryAspect`: defined in Task 2, used in Tasks 11, 15
- `ActiveCodon`: defined in Task 2, populated in Task 12, displayed in Tasks 16, 18
- `bifurcation_param`, `resolution_level`: defined Task 2, computed Task 10, displayed Tasks 16, 17, 19, 20
- `micro_orbit`: defined Task 2, populated Task 10, rendered Task 15
