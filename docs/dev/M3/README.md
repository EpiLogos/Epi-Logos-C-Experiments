# M3 (Mahamaya) -- Developer Reference

**Subsystem:** M3 (#3) in the Epi-Logos coordinate system
**Context Frame:** CF_QUATERNAL (0/1/2/3) -- Three-Plus-One
**Anchor:** Psychoid_3 (ql_position == 3, Layer 1 .rodata)
**Primary Invariant:** `uint64_t` -- the 64-bit matrix word

---

## 1. Overview

M3 is the Mahamaya subsystem -- the Dynamic Computational Matrix and Universal
Transcription Engine. It is Subsystem #3 in the M-family (Consciousness Domains),
corresponding to the raw archetype #3 (Pattern/Process). M3 encodes the 64-fold
symbolic reality where genetic codons, I-Ching hexagrams, Tarot Minor Arcana, and
rotational state all converge into a single bitwise framework.

M3 is governed by the **64 Invariant**: the `uint64_t` IS the entire symbolic
reality. All state transformations are bitwise. No floating-point on the hot path.
Every codon, hexagram, and symbolic operation resolves to O(1) bit manipulation on
this 64-bit word.

M3 receives input from M2 via the **Epogdoon bridge** (9:8 ratio, 72 -> 64
compression) and feeds forward into M4 (Nara) for helix-state DNA operations.

M3 is anchored to Psychoid_3 via `HC_LINK`, which bidirectionally binds a
`Holographic_Coordinate` to the `M3_Root` struct. Its context frame is CF_QUATERNAL
(Three-Plus-One), retrieved from the canonical `CF_TABLE` via `cf_get(CF_QUATERNAL)`.

### Source Files

| File | Role |
|------|------|
| `include/m3.h` | All M3 types, enums, LUT externs, inline functions, public API |
| `src/m3.c` | All .rodata LUT definitions, init/teardown, verify, CLI dispatch |
| `src/test_m3.c` | 1295 tests validating M3 integrity |

---

## 2. Architecture -- Connection to Pillar I

### M3_Root Struct

```c
typedef struct {
    Holographic_Coordinate*       hc;         /* FIRST FIELD -- HC_LINK'd to Psychoid_3 mirror */
    const Holographic_Coordinate* active_cf;  /* CF_TABLE[CF_QUATERNAL] */
    M3_IChing_State               iching;     /* Active hexagram state */
    M3_Transcription_Engine       engine;     /* Operational hub */
    M3_Wheel_State                wheel;      /* 360-degree wheel state */
    M3_Ring_Buffer                ring;       /* 12-deep SU(2) history */
} M3_Root;
```

The `hc` field is always the first field. This is a structural invariant enforced
across all M-branch modules so that `HC_LINK` and `HC_UNLINK` work uniformly.

### HC_LINK / HC_UNLINK

Defined in `psychoid_numbers.h`:

- `HC_LINK(hc, m_struct)` -- Sets `hc->payload.process_state = m_struct` and
  `m_struct->hc = hc`. Bidirectional binding.
- `HC_UNLINK(hc)` -- Sets `hc->payload.process_state = NULL`. Called during teardown.

### CF_TABLE Integration

M3 references context frames via the canonical `CF_TABLE` lookup:

```c
root->active_cf = cf_get(CF_QUATERNAL);  /* CF_TABLE[3] */
```

The `CF_Id` enum provides indices: CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6.

---

## 3. The 2-Bit Nucleotide Foundation (FR 2.3.1)

All of M3 rests on a 2-bit encoding of the four nucleotide bases:

| Nucleotide | Binary | Decimal | Polarity | Mobility | I-Ching | Suit | Element |
|------------|--------|---------|----------|----------|---------|------|---------|
| **A** | 0b00 | 0 | Yin | Moving | 6 (Old Yin) | Cups | Water |
| **T** | 0b01 | 1 | Yang | Moving | 9 (Old Yang) | Wands | Fire |
| **C** | 0b10 | 2 | Yin | Resting | 7 (Young Yin) | Pentacles | Earth |
| **G** | 0b11 | 3 | Yang | Resting | 8 (Young Yang) | Swords | Air |

### Bit Extraction

```c
#define GET_POLARITY(nuc)  ((nuc) & 0x01)        /* 0=Yin, 1=Yang */
#define GET_MOBILITY(nuc)  (((nuc) >> 1) & 0x01) /* 0=Moving, 1=Resting */
```

### Base Pairing

Watson-Crick base pairing is a single XOR:

```c
static inline uint8_t get_base_pair(uint8_t nuc) { return nuc ^ 0x01; }
```

This flips polarity while preserving mobility: A<->T, C<->G.

### Codon Encoding

Three nucleotides pack into 6 bits:

```c
codon = (outer << 4) | (middle << 2) | inner    /* 0-63 */
```

This gives 64 codons = 64 hexagrams = 64 Tarot Minor Arcana entries. The
`encode_codon()`, `codon_outer()`, `codon_middle()`, `codon_inner()` functions
provide safe access.

### DNA/RNA Phase (FR 2.3.20)

A single boolean flag toggles the entire polarity table between DNA and RNA modes.
`m3_codon_is_rna_capable()` returns true if the codon contains at least one T
(which would become U in RNA).

---

## 4. I-Ching Values (FR 2.3.12)

The root arithmetic of the system:

```c
static const uint8_t NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8};
```

- **Sum = 30** (compile-time asserted)
- A=6 (Old Yin), T=9 (Old Yang), C=7 (Young Yin), G=8 (Young Yang)

These values drive ALL pair sums, codon sums, charge calculations, and the 360
integral invariant. The `get_iching_value()` and `get_codon_iching_sum()` functions
provide O(1) access.

---

## 5. The 3-Matrix Dinucleotide System (FR 2.3.2)

### M3_PAIR_MATRIX[16]

The unified dinucleotide lookup table, indexed by `(nuc1 << 2) | nuc2`:

```c
typedef struct {
    int8_t sum;   /* I-Ching pair sum (nuc1_value + nuc2_value) */
    int8_t diff;  /* Directional asymmetry (nuc1_value - nuc2_value) */
} M3_SD_Value;
```

The 16 pairs are organized into 3 overlapping matrices of 8 pairs each. All 3
matrices share the 4 homogeneous pairs (AA, TT, CC, GG):

| Matrix | Name | Pairing Rule | Unique Pairs | Sum |
|--------|------|-------------|--------------|-----|
| **1** | Watson-Crick | Polarity-complementary, same mobility | AT, TA, CG, GC | all 15 |
| **2** | Cross-complementary | Same polarity, mobility differs | AG, GA, TC, CT | 14 or 16 |
| **3** | Cross-diagonal | Both polarity and mobility differ | AC, CA, TG, GT | 13 or 17 |

### Homogeneous Pairs (Shared Across All 3 Matrices)

| Pair | Index | Sum | Diff | I-Ching |
|------|-------|-----|------|---------|
| AA | 0 | 12 | 0 | K'un (MIN) |
| TT | 5 | 18 | 0 | Ch'ien (MAX) |
| CC | 10 | 14 | 0 | K'an |
| GG | 15 | 16 | 0 | Li |

All homogeneous pairs have diff=0 (perfect internal symmetry).

### Key Properties

- **TT = 18** is the maximum possible pair sum (Old Yang + Old Yang)
- **AA = 12** is the minimum possible pair sum (Old Yin + Old Yin)
- Watson-Crick pairs all sum to **15** (the mean of 12 and 18)
- For every pair XY, there exists a partner YX where `diff(XY) = -diff(YX)`

---

## 6. Rotational State (FR 2.3.3)

Computed dynamically from two pair indices:

```c
typedef struct {
    int8_t total_sum;
    int8_t total_diff;
} Rotational_State;
```

The `compute_rotational_state(p1_idx, p2_idx)` function sums the S and D values
of two pair matrix entries. The safe version `compute_rotational_state_safe()`
detects evolutionary gaps (0xFF sentinel) and sets `STATUS_PROVISIONAL_BIT`.

---

## 7. Hexagrams and Trigrams (FR 2.3.1)

### 8 Trigrams

```c
typedef struct {
    uint8_t  id;             /* 0-7 (3 bits) */
    uint8_t  binary;         /* 3-bit line pattern (yang=1, yin=0) */
    uint8_t  earlier_heaven; /* Position in Earlier Heaven (0-7) */
    uint8_t  later_heaven;   /* Position in Later Heaven (0-7) */
    uint8_t  element;        /* Five-Element correspondence */
    uint8_t  family_role;    /* Father/Mother/Son/Daughter */
    uint16_t degree_anchor;  /* Degree position in #3-5 wheel */
} M3_Trigram;
```

8 entries in `M3_TRIGRAM_LUT[8]`. Qian (Heaven/111) through Dui (Lake/011).

### 64 Hexagrams

```c
typedef struct {
    uint8_t id;              /* 0-63 (6 bits) = upper<<3 | lower */
    uint8_t line_pattern;    /* 6-bit pattern (lines 0-5, bottom to top) */
    uint8_t complement_id;   /* id ^ 0x3F */
    uint8_t nuclear_upper;   /* Nuclear trigram (lines 2-4) */
    uint8_t nuclear_lower;   /* Nuclear trigram (lines 1-3) */
} M3_Hexagram;
```

64 entries in `M3_HEXAGRAM_LUT[64]`, generated via `HEX()` macro at compile time.

### Bitwise Operations (All O(1))

| Operation | Function | Description |
|-----------|----------|-------------|
| Complement | `m3_complement(hex)` | `hex ^ 0x3F` -- all 6 lines inverted |
| Line change | `m3_line_change(hex, line)` | `hex ^ (1 << line)` -- 384 edges in XOR |
| Trigram split | `upper_trigram(hex)`, `lower_trigram(hex)` | Extract 3-bit halves |
| Compose | `compose_hexagram(upper, lower)` | `(upper << 3) | lower` |

### I-Ching State

```c
typedef struct {
    uint64_t active;          /* Bitboard: bit h set = hexagram h active */
    uint8_t  current;         /* Currently focused hexagram (6-bit) */
    uint8_t  changing_lines;  /* Which lines are changing (6-bit mask) */
    uint8_t  result;          /* Hexagram after changes applied */
    bool     is_rna_phase;    /* DNA/RNA superposition flag */
} M3_IChing_State;
```

### Integral Symmetry

```c
static inline uint64_t integral_symmetry_field(uint64_t m3_word) {
    return __builtin_bswap64(m3_word);
}
```

Reverses the byte order of the entire 64-bit field in a single instruction,
enabling O(1) whole-field symmetry transforms.

---

## 8. Three Matrix Operators (FR 2.3.9)

### Complementarity Matrix

```c
extern const uint8_t M3_COMP_MATRIX[64];   /* comp[i] = i ^ 0x3F */
```

All 6 lines inverted. Double complement = identity.

### Movement Matrix

```c
extern const uint8_t M3_MOVE_MATRIX[64];   /* move[i] = swap upper/lower trigram */
```

Swaps the upper and lower trigrams: `((i & 0x07) << 3) | ((i >> 3) & 0x07)`.
Double movement = identity.

### Resonance Matrix

```c
extern const uint8_t M3_RES_MATRIX[64];    /* 56 valid + 8 gaps (0xFF) */
```

56 entries map to valid resonance targets. 8 entries are **evolutionary gaps**
marked with `M3_RESONANCE_GAP` (0xFF). When a gap is encountered, the coordinate's
`STATUS_PROVISIONAL_BIT` is set, signaling that the system has reached an
epogdoon compression boundary.

The 8 gaps occur at Kan/Li crossings and related complementary trigram positions,
reflecting the 72 -> 64 compression where 8 M2 vibrational states cannot manifest
as distinct M3 symbols.

---

## 9. The Transcription Engine (FR 2.3.9)

```c
typedef struct {
    uint64_t non_dual_mask;        /* 16 always-set bits (non-dual codons) */
    uint64_t dual_field[6];        /* 336 polarity pairs (6 x 64-bit words) */
    const uint8_t* comp_matrix;    /* -> M3_COMP_MATRIX */
    const uint8_t* move_matrix;    /* -> M3_MOVE_MATRIX */
    const uint8_t* res_matrix;     /* -> M3_RES_MATRIX */
    const uint8_t* codon_to_aa;    /* -> M3_CODON_TO_AA */
    uint32_t coord_flags;          /* STATUS_PROVISIONAL tracking */
} M3_Transcription_Engine;
```

The operational hub. Wired to .rodata LUTs during `m3_init()`. The `non_dual_mask`
is computed at init time from the 16 non-dual codons.

### Genetic Code Mapping

`M3_CODON_TO_AA[64]` maps each 6-bit codon to an amino acid index (0-23), with
`0xFF` for STOP codons. Uses our 2-bit encoding (A=0, T=1, C=2, G=3), NOT the
standard biology ordering (T=0, C=1, A=2, G=3).

---

## 10. Non-Dual Codons (FR 2.3.17)

16 palindromic codons where outer == inner nucleotide (XyX pattern):

```c
extern const uint8_t M3_NONDUAL_CODONS[16];
```

| Outer | Codons |
|-------|--------|
| A | AAA, ATA, ACA, AGA |
| T | TAT, TTT, TCT, TGT |
| C | CAC, CTC, CCC, CGC |
| G | GAG, GTG, GCG, GGG |

Properties:
- Zero net directional deviation
- Bipolar valence (mp = pm = 0 after non-dual guard)
- `is_nondual_codon()` checks outer == inner in O(1)
- `m3_evaluate_with_nondual_guard()` zeroes the mp/pm channels

---

## 11. Inner Charge Closed-Form (FR 2.3.18)

Four charge axes computed from raw I-Ching values without any lookup table:

```c
pp = X + Y + Z      /* Positive resonance integral */
nn = X - Y - Z      /* Negative resonance integral */
np = X - Y + Z      /* Ascending resonance */
pn = X + Y - Z      /* Descending resonance */
```

Where X, Y, Z are `NUCLEOTIDE_ICHING_VALUE` of outer, middle, inner nucleotides.

### The 4X Invariant

For every codon: `pp + nn + np + pn = 4 * outer_nucleotide_value`.

This is compile-time verified for TTT and runtime-verified for all 64 codons in
the test suite. The 4X invariant is a consequence of the algebraic structure:
the four charge formulas sum to `4X` because `Y` and `Z` cancel.

---

## 12. The 4-Evaluation System (FR 2.3.13)

A different evaluation from the charge system -- this one uses dinucleotide pair
S/D values:

```c
typedef struct {
    int8_t pp;   /* (+,+): S(XY) + S(YZ) -- convergent resonance */
    int8_t mm;   /* (-,-): -(S(XY) + S(YZ)) -- convergent trough */
    int8_t mp;   /* (-,+): D(YZ) -- ascending */
    int8_t pm;   /* (+,-): D(XY) -- descending */
} M3_CodonEvaluation;
```

`evaluate_codon()` computes all four values from the `M3_PAIR_MATRIX`. This is the
dinucleotide-pair-based evaluation, distinct from `m3_compute_charges()` which uses
raw I-Ching values.

---

## 13. The 360 Integral Invariant (FR 2.3.15)

The sum of all 64 codon pp values (using `m3_compute_charges`, pp = X+Y+Z) gives
a raw total of **1440**. Divided by 4, this yields the **360 integral invariant**.

### Per-Suit Breakdown

| Suit | Nucleotide | Raw Sum | / 4 |
|------|-----------|---------|-----|
| Cups | A (Yin/Moving) | 336 | **84** |
| Wands | T (Yang/Moving) | 384 | **96** |
| Pentacles | C (Yin/Resting) | 352 | **88** |
| Swords | G (Yang/Resting) | 368 | **92** |
| **Total** | | **1440** | **360** |

Compile-time asserted: `84 + 96 + 88 + 92 == 360`.

The 360 arises from the 360 degrees of a circle -- M3's wheel maps naturally onto
a full rotation. The per-suit values reflect the asymmetric I-Ching weights of the
four nucleotides.

---

## 14. Rotational Composition (FR 2.3.14)

The 8-fold rotational composition law for combining dinucleotide pairs:

```c
/* Positive valence: Xy + Za -> Xya */
/* Negative valence: Xy + Za -> XZa */
compose_rotational_state(xy, za, positive)

/* Non-dual when y == Z (bipolar) */
is_nondual_composition(xy, za)
```

7 polarized entries + 1 non-dual entry = 8-fold table.

---

## 15. Tarot-Codon Mapping (FR 2.3.16, FR 2.3.19)

### M3_TAROT_CODON_MAP[4][16]

4 suits x 16 entries = 64 codons total:

```c
typedef struct {
    uint8_t suit;     /* 0=Cups, 1=Wands, 2=Pentacles, 3=Swords */
    uint8_t pip;      /* 0=Ace, 1-9=Two-Ten, 10=Page, 11=Knight, 12=Queen, 13=King */
    uint8_t codon_a;  /* Primary codon (6-bit) */
    uint8_t codon_b;  /* Secondary codon for dual-codon courts, 0xFF = none */
} M3_TarotCodonEntry;
```

### Suit = Outer Nucleotide

| Suit | Nucleotide | Element | Polarity/Mobility |
|------|-----------|---------|-------------------|
| Cups | A | Water | Yin/Moving |
| Wands | T | Fire | Yang/Moving |
| Pentacles | C | Earth | Yin/Resting |
| Swords | G | Air | Yang/Resting |

### Court Card Dual-Codon Pattern

Each suit has 10 pip cards (Ace through Ten) with single codons, and 4 court cards.
Two of the four courts are **dual-codon** (carrying two codons), giving
10 + 2 + 2x2 = 16 codons per suit:

| Suit Type | Dual Courts | Single Courts |
|-----------|-------------|---------------|
| **Yin** (Cups, Pentacles) | Knight + King | Page, Queen |
| **Yang** (Wands, Swords) | Page + Queen | Knight, King |

### Ace Codons (Homogeneous Triplets)

| Suit | Ace Codon | pp |
|------|-----------|-----|
| Cups | AAA | 18 |
| Wands | TTT | 27 |
| Pentacles | CCC | 21 |
| Swords | GGG | 24 |

---

## 16. The 360-Degree Mythic Synthesis Wheel (FR 2.3.11)

### Degree Position

```c
typedef struct {
    uint16_t degree;            /* 0-359 (primary layer) */
    uint16_t shadow;            /* degree + 360 (shadow layer) */
    uint8_t  quadrant;          /* 0-3 (N/E/S/W) */
    uint8_t  sector;            /* 0-23 (15-degree sectors) */
    uint8_t  trigram_earlier;   /* Earlier Heaven trigram */
    uint8_t  trigram_later;     /* Later Heaven trigram */
    uint8_t  sign;              /* Zodiacal sign (0-11) */
    uint8_t  decan;             /* Decan within sign (0-2) */
} M3_DegreePosition;
```

### Wheel State

```c
typedef struct {
    uint16_t current_degree;    /* 0-719 for full SU(2) double-cover */
    uint8_t  layer;             /* 0 = primary (0-359), 1 = shadow (360-719) */
    uint64_t active_sectors;    /* Bitboard: which of 24 sectors active */
    uint8_t  season;            /* Current quarter (0-3) */
    uint8_t  heaven_mode;       /* 0 = Earlier, 1 = Later */
} M3_Wheel_State;
```

### Ring Buffer (SU(2) History)

12-deep circular buffer for double-covering history (6 QL positions x 2 layers):

```c
typedef struct {
    uint16_t buffer[12];
    uint8_t  head;
    uint8_t  count;
} M3_Ring_Buffer;
```

Full rotation requires 720 degrees (`identity_returned()` checks `>= 720`).

---

## 17. SU(2) 720-Degree Double-Covering (FR 2.3.7)

The system uses SU(2) double-covering where a full identity return requires 720
degrees, not 360. The primary layer (0-359) and shadow layer (360-719) are linked
via polar opposition:

```c
static inline uint16_t polar_opposite_su2(uint16_t current_720_degree) {
    uint16_t layer_offset = (current_720_degree >= 360u) ? 360u : 0u;
    uint16_t base_degree  = current_720_degree % 360u;
    return layer_offset + (uint16_t)((base_degree + 180u) % 360u);
}
```

Key property: `polar_opposite_su2(polar_opposite_su2(d)) == d` for all d in [0, 719].
Shadow-layer degrees stay in the shadow layer; primary-layer degrees stay primary.

---

## 18. Unified Cosmic Clock (FR 2.3.5)

Maps any degree (0-719) across the full SU(2) double-cover to simultaneous
positions in M1, M2, and M3:

```c
typedef struct {
    uint8_t m1_torus_stage;     /* 0-11 (30-degree sectors) */
    uint8_t m2_decan_phase;     /* 0-71 (10-degree decans, shadow offset +36) */
    uint8_t m3_hexagram_id;     /* 0-63 (proportional mapping into 360) */
    bool    is_implicate_phase; /* true if degree >= 360 */
} Unified_Clock_State;
```

Defined in `m0.h` (shared across all M-branches). M3 provides a convenience alias
`read_cosmic_clock()` that delegates to `m0_read_cosmic_clock()`.

All integer arithmetic. No floating-point.

---

## 19. Epogdoon Bridge -- M2 <-> M3 (FR 2.3.6)

The 9:8 ratio that compresses M2's 72-space into M3's 64-space:

```c
/* M2 -> M3: 72 * 8/9 = 64 */
static inline uint8_t apply_epogdoon_compression(uint8_t m2_idx) {
    return (uint8_t)((m2_idx * 8u) / 9u);
}

/* M3 -> M2: get Parashakti frequency index */
static inline uint8_t get_parashakti_frequency(Rotational_State m3_state,
                                                bool is_shadow_phase);
```

The 8 "missing" states (72 - 64 = 8) create the evolutionary spiral -- they are
the epogdoon tax, manifesting as resonance gaps in `M3_RES_MATRIX`.

### DET Projection (From M2)

The Discrete Epistemic Transform `M2_TO_M3_CYMATIC_PROJECTION[72]` (defined in
`m2.c`, declared in `m2.h`) provides pre-compiled 64-bit bitmasks. The union of
all 72 masks covers all 64 bits (verified at boot time).

---

## 20. Public API

```c
/* Allocate and HC-link an M3 root struct.
 * Returns NULL if arena/hc is NULL or hc->ql_position != 3. */
M3_Root* m3_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Release heap state. Calls HC_UNLINK on root->hc. Does not free the HC itself. */
void m3_teardown(M3_Root* root);

/* CLI entry point. argc/argv parsed for subcommand dispatch.
 * Returns 0 on success, 1 on error. */
int m3_cli_dispatch(int argc, char** argv, M3_Root* root);

/* Boot-time verification of .rodata integrity.
 * Checks: PAIR_MATRIX, non-dual codons, comp/move/res matrices,
 * 360 integral invariant, NUC sum, DET coverage. */
bool m3_verify(void);
```

---

## 21. CLI Commands

Invoked as `epi-logos m3 <subcommand>`:

| Command | Description |
|---------|-------------|
| `info` | Print M3 summary: CF, matrix sizes, LUT counts, 360 breakdown, RNA phase |
| `pair <n1> <n2>` | Lookup dinucleotide pair (n1,n2 = 0-3 for A,T,C,G): sum, diff, I-Ching |
| `codon <XYZ>` | Full codon analysis: I-Ching sum, 4 charges, 4X check, suit, non-dual, RNA, complement |
| `clock <degree>` | Unified cosmic clock at degree (0-719): M1/M2/M3 positions, layer, SU(2) opposite |
| `hexagram <id>` | Hexagram details (0-63): line pattern, trigrams, complement, nuclear, resonance |
| `tarot <suit> <rank>` | Tarot card lookup (suit 0-3, rank 0-13): codons, charges, dual-codon status |

---

## 22. Build and Test

All commands should be run from the project root (`Epi-Logos C Experiments/`).

### Full Binary

```
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/main.c -o epi-logos
```

```
./epi-logos              # Full boot sequence including M3
./epi-logos m3 info      # M3 state summary
./epi-logos m3 codon ATG # Full codon analysis
./epi-logos m3 tarot 1 0 # Ace of Wands
```

### Test Suite (1295 tests)

```
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/test_m3.c -o test_m3 && ./test_m3
```

Expected output: 1295/1295 tests passed.

### Test Coverage

| Area | Tests | What It Verifies |
|------|-------|-----------------|
| Nucleotide I-Ching | 7 | A=6, T=9, C=7, G=8, sum=30, accessor round-trip |
| Nucleotide logic | 16 | Polarity, mobility, base pairing, codon encode/decompose |
| PAIR_MATRIX | 28 | All 16 pairs: sums, diffs, antisymmetry, homo diff=0, min/max bounds |
| Rotational state | 4 | Composition correctness, gap rejection, PROVISIONAL flag |
| Hexagram ops | ~70+ | Complement, line change, trigram compose/split, LUT double-complement |
| Non-dual codons | 48+ | Count=16, LUT entries pass check, outer==inner pattern |
| Inner charges | 68+ | AAA/TTT exact values, 4X invariant for all 64 codons |
| 360 integral | 10 | Raw totals 1440, per-suit 336/384/352/368, /4 = 84/96/88/92 |
| Matrix operators | 136+ | comp[i]=i^0x3F, move[i]=swap trigrams, 8 resonance gaps |
| SU(2) polar | 722+ | Known values, shadow preservation, double application = identity |
| Epogdoon | ~66+ | All 64 values covered, 72-64=8 collisions |
| Cosmic clock | 6 | degree 0/180/360 positions, layer detection |
| Rotational composition | 2 | Non-dual detection positive/negative |
| DNA/RNA | 5 | AAA/CCC/GGG not RNA-capable, ATG/TTT are |
| Tarot LUT | 80+ | All 64 codons covered uniquely, suit matches, dual-codon pattern, ace codons |
| M3 API | 8 | m3_verify(), init/teardown lifecycle, HC link, engine wiring, non_dual_mask |
| DET coverage | 1 | Union of 72 projections = 0xFFFFFFFFFFFFFFFF |

---

## 23. Key Invariants

1. **M3_Root.hc is ALWAYS the first field.** All M-branch structs follow this convention
   so that `HC_LINK` and `HC_UNLINK` work generically.

2. **M3 anchors to ql_position == 3 only.** `m3_init` returns NULL if the provided HC
   has any other position. This enforces that M3 is bound to Psychoid_3 (Pattern).

3. **The 64 Invariant.** All state transformations operate on `uint64_t`. No floating-point
   on the hot path. Complement, movement, line change, and resonance are all O(1) bitwise.

4. **NUCLEOTIDE_ICHING_VALUE sums to 30.** Compile-time asserted. This is the root
   constant from which all pair sums, codon sums, and the 360 integral derive.

5. **4X Invariant.** For every codon, `pp + nn + np + pn = 4 * outer_I-Ching_value`.
   Compile-time verified for TTT, runtime-verified for all 64 in the test suite.

6. **360 Integral Invariant.** Sum of all 64 codon pp values (via `m3_compute_charges`)
   = 1440 = 360 x 4. Per-suit: Cups=336, Wands=384, Pentacles=352, Swords=368.

7. **3-Matrix System.** The 16 dinucleotide pairs decompose into 3 matrices of 8 pairs
   each, all sharing the 4 homogeneous pairs (AA, TT, CC, GG).

8. **8 Evolutionary Gaps.** `M3_RES_MATRIX` has exactly 8 entries = 0xFF, corresponding
   to the epogdoon compression boundary (72 - 64 = 8).

9. **16 Non-Dual Codons.** XyX pattern (outer == inner). Palindromic. Bipolar valence.

10. **SU(2) Double-Covering.** Full identity return requires 720 degrees. Polar opposition
    preserves layer membership. Double application = identity.

11. **DET coverage is complete.** `OR` of all 72 `M2_TO_M3_CYMATIC_PROJECTION` masks
    covers all 64 bits.

12. **GET_PTR before every dereference.** Tagged pointers must be stripped via `GET_PTR()`
    before dereferencing, as the upper bits carry ontological metadata.

---

## 24. Cross-Branch Connections

| Direction | Target | Mechanism |
|-----------|--------|-----------|
| M3 <- M2 | DET projection: 72 -> 64 bit bitboard | `M2_TO_M3_CYMATIC_PROJECTION[72]` (defined in m2.c) |
| M3 <- M2 | Epogdoon compression (9:8 ratio) | `apply_epogdoon_compression()` inline |
| M3 <- M1 | Torus stage in cosmic clock | `Unified_Clock_State.m1_torus_stage` |
| M3 <- M0 | Unified cosmic clock definition | `Unified_Clock_State` struct in m0.h |
| M3 -> M4 | Feeds codon/hexagram state to helix DNA | `M3_Transcription_Engine` output |
| M3 -> M5 | Terminal symbolic state for Logos FSM | `uint64_t` matrix word |
| M3 <- Pillar I | HC struct, tagged pointers, CF_TABLE | `ontology.h`, `psychoid_numbers.h` |
| M3 <- Arena | Memory allocation for M3_Root | `arena.h` |
