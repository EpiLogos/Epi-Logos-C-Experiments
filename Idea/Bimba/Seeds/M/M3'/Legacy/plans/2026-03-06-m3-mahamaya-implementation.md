# M3 (Mahamaya) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement M3 (Mahamaya) — the 64-fold Symbolic Transcription Engine — as a C library module with full .rodata LUTs, CLI dispatch, and boot integration.

**Architecture:** M3 operates in the CF_QUATERNAL (0/1/2/3) context frame, anchored to Psychoid_3 (mirrors[3]). The primary invariant is `uint64_t` — the 64-bit matrix word. All transformations are bitwise. The module bridges M2's 72-space to M3's 64-space via the 9:8 Epogdoon ratio.

**Tech Stack:** C11, clang, POSIX. No floating-point on hot paths. All LUTs in `.rodata`.

---

### Task 1: Create m3.h — Header with all type definitions

**Files:**
- Create: `include/m3.h`

**Step 1: Write the header file**

Create `include/m3.h` with the following sections. Use `m2.h` as the structural template.

```c
/**
 * m3.h — Mahamaya: The Symbolic Transcription Engine (Subsystem #3)
 *
 * Implements: M3 (#3) = Dynamic computational matrix & universal transcription.
 * Context frame: (0/1/2/3) — CF_QUATERNAL (Three-Plus-One)
 * Anchored to: Psychoid_3 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h, m1.h, m2.h
 * Feeds into: M4 (Symbol DNA, helix state), M5 (Logos FSM)
 *
 * The 64 Invariant: every M3 structure resolves to 64-bit words.
 * uint64_t IS the symbolic reality. All operations are bitwise.
 *
 * FR Coverage: 2.3.0 – 2.3.21 (M3-mahamaya-symbolic-transcription.md, Rev 2)
 *
 * ARCHITECTURE RULE: M3_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 */
#ifndef M3_H
#define M3_H

#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m2.h"
#include <stdbool.h>
#include <stdint.h>
```

Then define the following types and inline functions in order:

**FR 2.3.12: NUCLEOTIDE_ICHING_VALUE**
```c
static const uint8_t NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8};
_Static_assert(
    NUCLEOTIDE_ICHING_VALUE[0] + NUCLEOTIDE_ICHING_VALUE[1] +
    NUCLEOTIDE_ICHING_VALUE[2] + NUCLEOTIDE_ICHING_VALUE[3] == 30,
    "NUCLEOTIDE_ICHING_VALUE must sum to 30"
);
static inline uint8_t get_iching_value(uint8_t nuc2bit) {
    return NUCLEOTIDE_ICHING_VALUE[nuc2bit & 0x03];
}
static inline uint8_t get_codon_iching_sum(uint8_t codon6bit) {
    return NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 4) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 2) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit)      & 0x03];
}
```

**FR 2.3.1: 2-Bit Nucleotide Logic**
```c
// A=0b00(Yin,Moving), T=0b01(Yang,Moving), C=0b10(Yin,Resting), G=0b11(Yang,Resting)
#define M3_NUC_A  0x00
#define M3_NUC_T  0x01
#define M3_NUC_C  0x02
#define M3_NUC_G  0x03
#define GET_POLARITY(nuc)  ((nuc) & 0x01)
#define GET_MOBILITY(nuc)  (((nuc) >> 1) & 0x01)
static inline uint8_t get_base_pair(uint8_t nuc) { return nuc ^ 0x01; }
static inline uint8_t encode_codon(uint8_t n1, uint8_t n2, uint8_t n3) {
    return (uint8_t)((n1 << 4) | (n2 << 2) | n3);
}
static inline uint8_t get_polarity_phased(uint8_t nuc, bool is_rna) {
    return GET_POLARITY(nuc) ^ (uint8_t)is_rna;
}
// Hexagram operations
static inline uint8_t m3_line_change(uint8_t hex, uint8_t line) {
    return hex ^ (1u << line);
}
static inline uint8_t upper_trigram(uint8_t hex_id) { return (hex_id >> 3) & 0x07; }
static inline uint8_t lower_trigram(uint8_t hex_id) { return hex_id & 0x07; }
static inline uint8_t compose_hexagram(uint8_t upper, uint8_t lower) {
    return (uint8_t)((upper << 3) | lower);
}
static inline uint8_t m3_complement(uint8_t hex_id) { return hex_id ^ 0x3F; }
static inline uint64_t integral_symmetry_field(uint64_t m3_word) {
    return __builtin_bswap64(m3_word);
}
```

**FR 2.3.2: M3_SD_Value and M3_PAIR_MATRIX[16]**
```c
typedef struct { int8_t sum; int8_t diff; } M3_SD_Value;
extern const M3_SD_Value M3_PAIR_MATRIX[16];
```

**FR 2.3.3: Rotational_State**
```c
typedef struct { int8_t total_sum; int8_t total_diff; } Rotational_State;
#define M3_RESONANCE_GAP  0xFF
#define STATUS_PROVISIONAL_BIT  (1u << 4)
static inline Rotational_State compute_rotational_state(uint8_t p1, uint8_t p2) {
    return (Rotational_State){
        .total_sum  = M3_PAIR_MATRIX[p1].sum  + M3_PAIR_MATRIX[p2].sum,
        .total_diff = M3_PAIR_MATRIX[p1].diff + M3_PAIR_MATRIX[p2].diff
    };
}
static inline bool compute_rotational_state_safe(
    uint8_t p1, uint8_t p2, Rotational_State* out, uint32_t* flags) {
    if (p2 == M3_RESONANCE_GAP) { *flags |= STATUS_PROVISIONAL_BIT; return false; }
    *out = compute_rotational_state(p1, p2);
    return true;
}
```

**FR 2.3.1 Structs: M3_Trigram, M3_Hexagram, M3_IChing_State**
```c
typedef struct {
    uint8_t id; uint8_t binary; uint8_t earlier_heaven; uint8_t later_heaven;
    uint8_t element; uint8_t family_role; uint16_t degree_anchor;
} M3_Trigram;
typedef struct {
    uint8_t id; uint8_t line_pattern; uint8_t complement_id;
    uint8_t nuclear_upper; uint8_t nuclear_lower;
} M3_Hexagram;
typedef struct {
    uint64_t active; uint8_t current; uint8_t changing_lines;
    uint8_t result; bool is_rna_phase;
} M3_IChing_State;
extern const M3_Trigram  M3_TRIGRAM_LUT[8];
extern const M3_Hexagram M3_HEXAGRAM_LUT[64];
```

**FR 2.3.4: Tarot_Suit, Minor_Arcana_Card**
```c
typedef enum { SUIT_CUPS=0, SUIT_WANDS=1, SUIT_PENTACLES=2, SUIT_SWORDS=3 } Tarot_Suit;
typedef struct {
    uint8_t card_id; Tarot_Suit suit; uint8_t rank;
    uint8_t primary_codon; uint8_t shadow_codon;
} Minor_Arcana_Card;
```

**FR 2.3.5: Unified_Clock_State + read_cosmic_clock()**
- Define struct and inline function exactly as spec (integer-only, O(1))

**FR 2.3.6: Epogdoon bridge functions**
- `get_parashakti_frequency()`, `apply_epogdoon_compression()`, `is_evolutionary_gap()`
- All inline, integer-only

**FR 2.3.7: polar_opposite_su2()**
- SU(2)-preserving polar opposite + simple wheel ops

**FR 2.3.9: M3_Transcription_Engine struct**
```c
typedef struct {
    uint64_t non_dual_mask;
    uint64_t dual_field[6];
    const uint8_t* comp_matrix;
    const uint8_t* move_matrix;
    const uint8_t* res_matrix;
    const uint8_t* rna_lut;
    const uint8_t* amino_lut;
    const uint8_t* codon_to_aa;
    const uint8_t* karyo_lut;
    uint32_t coord_flags;
} M3_Transcription_Engine;
```

**FR 2.3.11: M3_DegreePosition, M3_Wheel_State, M3_Ring_Buffer**
- Structs as per spec

**FR 2.3.13: M3_CodonEvaluation + evaluate_codon()**
- Struct and inline function using M3_PAIR_MATRIX

**FR 2.3.14: compose_rotational_state(), is_nondual_composition()**
- Inline functions

**FR 2.3.15: 360 Integral Constants**
```c
#define M3_INTEGRAL_INVARIANT  360U
#define M3_SUIT_A_INTEGRAL      84U
#define M3_SUIT_T_INTEGRAL      96U
#define M3_SUIT_C_INTEGRAL      88U
#define M3_SUIT_G_INTEGRAL      92U
_Static_assert(M3_SUIT_A_INTEGRAL + M3_SUIT_T_INTEGRAL +
    M3_SUIT_C_INTEGRAL + M3_SUIT_G_INTEGRAL == M3_INTEGRAL_INVARIANT,
    "360 integral invariant must hold");
```

**FR 2.3.16: M3_TarotCodonEntry**
```c
typedef struct {
    uint8_t suit; uint8_t pip; uint8_t codon_a; uint8_t codon_b;
} M3_TarotCodonEntry;
#define M3_TAROT_PIP_ACE       0
#define M3_TAROT_PIP_PRINCESS 10
#define M3_TAROT_PIP_PRINCE   11
#define M3_TAROT_PIP_QUEEN    12
#define M3_TAROT_PIP_KING     13
#define M3_TAROT_SINGLE_CODON 0xFF
extern const M3_TarotCodonEntry M3_TAROT_CODON_MAP[4][16];
```

**FR 2.3.17: Non-dual codons**
```c
static inline int is_nondual_codon(uint8_t c) {
    return ((c >> 4) & 0x03) == (c & 0x03);
}
#define M3_NONDUAL_CODON_FLAG 0x40
extern const uint8_t M3_NONDUAL_CODONS[16];
```

**FR 2.3.18: m3_compute_charges()**
- Inline function: pp=X+Y+Z, nn=X-Y-Z, np=X-Y+Z, pn=X+Y-Z

**FR 2.3.20: m3_codon_is_rna_capable()**
- Inline function checking for T in any position

**FR 2.3.14 constants**
```c
#define M3_ROTATIONAL_TABLE_ENTRIES      8
#define M3_ROTATIONAL_POLARIZED_ENTRIES  7
#define M3_ROTATIONAL_NONDUAL_ENTRIES    1
```

**M3_Root struct**
```c
typedef struct {
    Holographic_Coordinate* hc;      /* FIRST FIELD — always */
    const Holographic_Coordinate* active_cf;
    M3_IChing_State iching;
    M3_Transcription_Engine engine;
    M3_Wheel_State wheel;
    M3_Ring_Buffer ring;
} M3_Root;
```

**Public API**
```c
M3_Root* m3_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);
void     m3_teardown(M3_Root* root);
int      m3_cli_dispatch(int argc, char** argv, M3_Root* root);
bool     m3_verify(void);
```

**Step 2: Verify header compiles**

Run: `clang -std=c11 -Wall -Wextra -Iinclude -fsyntax-only include/m3.h`
Expected: 0 warnings, 0 errors

**Step 3: Commit**

```bash
git add include/m3.h
git commit -m "feat(m3): add m3.h header — type definitions and inline functions for Mahamaya"
```

---

### Task 2: Create m3.c — .rodata LUTs (Part 1: Core tables)

**Files:**
- Create: `src/m3.c`

**Step 1: Write m3.c with core .rodata LUTs**

Start the file:
```c
/**
 * m3.c — Mahamaya: The Symbolic Transcription Engine (Implementation)
 *
 * All .rodata LUT data + API implementation for M3.
 * FR Coverage: 2.3.0 – 2.3.21
 */
#include "m3.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

Then populate these LUTs:

**FR 2.3.2: M3_PAIR_MATRIX[16]** — All 16 values from spec:
```c
const M3_SD_Value M3_PAIR_MATRIX[16] = {
    [0]  = { 12,  0 },  // AA
    [5]  = { 18,  0 },  // TT — MAX SUM
    [10] = { 14,  0 },  // CC
    [15] = { 16,  0 },  // GG
    [1]  = { 15, -3 },  // AT
    [14] = { 15, -1 },  // CG
    [4]  = { 15,  3 },  // TA
    [11] = { 15,  1 },  // GC
    [3]  = { 14,  2 },  // AG
    [6]  = { 16, -2 },  // TC
    [12] = { 14,  2 },  // GA
    [9]  = { 16, -2 },  // CT
    [2]  = { 13, -1 },  // AC
    [7]  = { 17,  1 },  // TG
    [8]  = { 13,  1 },  // CA
    [13] = { 17, -1 },  // GT
};
```

Note: The 3-matrix system is documented in comments:
- Matrix 1 (Watson-Crick): homos(AA,TT,CC,GG) + AT,TA,CG,GC = 8 pairs
- Matrix 2 (Cross-complementary): homos + AG,GA,TC,CT = 8 pairs
- Matrix 3 (Cross-diagonal): homos + AC,CA,TG,GT = 8 pairs
- All 4 homogeneous pairs are SHARED across all 3 matrices

**FR 2.3.1: M3_TRIGRAM_LUT[8]** — 8 trigrams:
```c
const M3_Trigram M3_TRIGRAM_LUT[8] = {
    {0, 0x07, 0, 5, 4, 0, 0},    // Qian(Heaven) 111
    {1, 0x00, 7, 0, 4, 1, 180},  // Kun(Earth) 000
    {2, 0x01, 4, 1, 3, 2, 90},   // Zhen(Thunder) 001
    {3, 0x06, 3, 6, 3, 3, 315},  // Xun(Wind) 110
    {4, 0x02, 6, 7, 0, 4, 270},  // Kan(Water) 010
    {5, 0x05, 1, 2, 2, 5, 135},  // Li(Fire) 101
    {6, 0x04, 2, 3, 4, 6, 45},   // Gen(Mountain) 100
    {7, 0x03, 5, 4, 4, 7, 225},  // Dui(Lake) 011
};
```

**FR 2.3.1: M3_HEXAGRAM_LUT[64]** — 64 hexagrams. Generate programmatically:
Each entry: `{id, id, id ^ 0x3F, (id >> 1) & 0x07, (id >> 0) & 0x07 shifted}`
Actually, compute nuclear trigrams: nuclear_upper = lines 2-4 = `(id >> 2) & 0x07`, nuclear_lower = lines 1-3 = `(id >> 1) & 0x07`.

**FR 2.3.17: M3_NONDUAL_CODONS[16]** — all XyX codons:
```c
const uint8_t M3_NONDUAL_CODONS[16] = {
    0x00, 0x04, 0x08, 0x0C,  // AAA, ATA, ACA, AGA
    0x11, 0x15, 0x19, 0x1D,  // TAT, TTT, TCT, TGT
    0x22, 0x26, 0x2A, 0x2E,  // CAC, CTC, CCC, CGC
    0x33, 0x37, 0x3B, 0x3F,  // GAG, GTG, GCG, GGG
};
```

**FR 2.3.9: M3_COMP_MATRIX[64], M3_MOVE_MATRIX[64], M3_RES_MATRIX[64]**
- Complementarity: `comp[i] = i ^ 0x3F` (all 6 bits flipped)
- Movement: `move[i] = ((i >> 3) & 0x07) | ((i & 0x07) << 3)` (swap trigrams)
- Resonance: 56 entries + 8 gaps (0xFF) — the 8 gaps correspond to evolutionary boundaries

**FR 2.3.9: M3_CODON_TO_AA[64]** — codon to amino acid index (standard genetic code)

**Step 2: Verify compiles**

Run: `clang -std=c11 -Wall -Wextra -Iinclude -c src/m3.c -o /dev/null`
Expected: 0 warnings

**Step 3: Commit**

```bash
git add src/m3.c
git commit -m "feat(m3): add m3.c core .rodata LUTs — PAIR_MATRIX, trigrams, hexagrams, non-dual codons"
```

---

### Task 3: Add Tarot-Codon LUT to m3.c

**Files:**
- Modify: `src/m3.c`

**Step 1: Add M3_TAROT_CODON_MAP[4][16]**

Add the complete 64-entry Tarot-Codon LUT from FR 2.3.19. All values are canonical from spec:

```c
/* FR 2.3.19: Complete Tarot-Codon LUT — 4 suits × 16 slots */
const M3_TarotCodonEntry M3_TAROT_CODON_MAP[4][16] = {
    /* [0] Cups (A-family) */
    {
        {0, 0, 0x00, 0xFF},  /* Ace: AAA */
        {0, 1, 0x03, 0xFF},  /* Two: AAG */
        {0, 2, 0x01, 0xFF},  /* Three: AAT */
        {0, 3, 0x2A, 0xFF},  /* Four: ACC — NOTE: verify encoding */
        {0, 4, 0x0B, 0xFF},  /* Five: ATG */
        {0, 5, 0x20, 0xFF},  /* Six: AGA — NOTE: verify A=00,G=11,A=00 = 0b001100 = 0x0C? */
        /* ... full table from FR 2.3.19 spec ... */
    },
    /* ... Wands, Pentacles, Swords ... */
};
```

**CRITICAL:** Verify every codon encoding against `(outer << 4) | (middle << 2) | inner`. Some spec entries have hex values that need re-verification:
- AAA = (0<<4)|(0<<2)|0 = 0x00 ✓
- AAG = (0<<4)|(0<<2)|3 = 0x03 ✓
- AGA = (0<<4)|(3<<2)|0 = 0x0C (spec says 0x20 — may need correction)
- ACC = (0<<4)|(2<<2)|2 = 0x0A (spec says 0x2A — may need correction)

**The codon NAME is authoritative**. If the hex encoding disagrees with the name, recompute from the name.

**Step 2: Add Yin/Yang court card pattern comments**
Document the dual-codon court card alternation:
- Yin suits (Cups/Pentacles): Knight+King dual
- Yang suits (Wands/Swords): Page+Queen dual

**Step 3: Verify compiles, commit**

```bash
git add src/m3.c
git commit -m "feat(m3): add complete Tarot-Codon LUT (FR 2.3.19) — 64 canonical entries"
```

---

### Task 4: Add init/teardown/verify to m3.c

**Files:**
- Modify: `src/m3.c`

**Step 1: Write m3_init()**

Follow the M2 pattern exactly:

```c
M3_Root* m3_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    if (!arena || !hc) return NULL;
    if (hc->ql_position != 3) return NULL;  /* Must be Psychoid_3 mirror */

    M3_Root* root = (M3_Root*)malloc(sizeof(M3_Root));
    if (!root) return NULL;

    memset(root, 0, sizeof(M3_Root));
    HC_LINK(hc, root);
    root->active_cf = cf_get(CF_QUATERNAL);

    /* Wire engine to .rodata matrices */
    root->engine.comp_matrix = M3_COMP_MATRIX;
    root->engine.move_matrix = M3_MOVE_MATRIX;
    root->engine.res_matrix  = M3_RES_MATRIX;
    root->engine.codon_to_aa = M3_CODON_TO_AA;

    /* Compute non-dual base mask (40 bits) */
    root->engine.non_dual_mask = 0;
    for (int i = 0; i < 16; i++) {
        root->engine.non_dual_mask |= (1ULL << M3_NONDUAL_CODONS[i]);
    }
    /* 16 non-dual codons + their 24 complements = 40 bits */

    return root;
}
```

**Step 2: Write m3_teardown()**

```c
void m3_teardown(M3_Root* root) {
    if (!root) return;
    if (root->hc) HC_UNLINK(root->hc);
    free(root);
}
```

**Step 3: Write m3_verify()**

Verify:
1. M3_PAIR_MATRIX[5].sum == 18 (TT max)
2. M3_PAIR_MATRIX[0].sum == 12 (AA min)
3. All homos have diff==0
4. NUCLEOTIDE_ICHING_VALUE sums to 30
5. 360 integral invariant via `m3_verify_integral_invariant()`
6. Non-dual codons: all 16 pass `is_nondual_codon()`
7. Complementarity: comp[i] ^ 0x3F == i for all i

**Step 4: Verify compiles, commit**

```bash
clang -std=c11 -Wall -Wextra -Iinclude -c src/m3.c -o /dev/null
git add src/m3.c
git commit -m "feat(m3): add m3_init, m3_teardown, m3_verify — HC-linked lifecycle"
```

---

### Task 5: Add CLI dispatch to m3.c

**Files:**
- Modify: `src/m3.c`

**Step 1: Write m3_cli_dispatch()**

Commands:
- `info` — Print HC anchoring, context frame, invariants
- `pair <N1> <N2>` — Look up pair in M3_PAIR_MATRIX (A=0,T=1,C=2,G=3)
- `codon <XYZ>` — Evaluate codon: show pp/nn/np/pn charges, suit, non-dual status
- `clock <degree>` — Read cosmic clock at degree 0-719
- `tarot <suit> <rank>` — Look up Tarot card codon assignment
- `hexagram <id>` — Show hexagram details (trigrams, complement, nuclear)

```c
int m3_cli_dispatch(int argc, char** argv, M3_Root* root) {
    if (argc < 2) { m3_print_info(root); return 0; }
    const char* cmd = argv[1];
    if (strcmp(cmd, "info") == 0)     { m3_print_info(root);     return 0; }
    if (strcmp(cmd, "pair") == 0)     { /* parse + print */       return 0; }
    if (strcmp(cmd, "codon") == 0)    { /* parse + evaluate */    return 0; }
    if (strcmp(cmd, "clock") == 0)    { /* parse + read_cosmic */ return 0; }
    if (strcmp(cmd, "tarot") == 0)    { /* parse + lookup */      return 0; }
    if (strcmp(cmd, "hexagram") == 0) { /* parse + show */        return 0; }
    fprintf(stderr, "m3: unknown subcommand '%s'\n", cmd);
    fprintf(stderr, "Usage: m3 [info|pair|codon|clock|tarot|hexagram]\n");
    return 1;
}
```

**Step 2: Write helper print functions (static)**

- `m3_print_info()`: print CF, invariant, LUT sizes, engine state
- `m3_print_pair()`: show S/D values for a pair
- `m3_print_codon()`: show all 4 charges, suit, non-dual flag, RNA capability
- `m3_print_clock()`: show unified M1/M2/M3 state at a degree
- `m3_print_tarot()`: show card name, codons, charges

**Step 3: Verify compiles, commit**

```bash
clang -std=c11 -Wall -Wextra -Iinclude -c src/m3.c -o /dev/null
git add src/m3.c
git commit -m "feat(m3): add m3_cli_dispatch — CLI interface for all M3 operations"
```

---

### Task 6: Integrate M3 into main.c boot sequence

**Files:**
- Modify: `src/main.c`

**Step 1: Add M3 Phase 4.8 initialization**

After the M2 block (line ~192), add:

```c
/* Phase 4.8: Initialize M3 (Mahamaya) */
M3_Root* m3 = m3_init(&arena, mirrors[3]);
if (!m3) {
    fprintf(stderr, "[boot] Aborting: M3 init failed.\n");
    m2_teardown(m2);
    m1_teardown(m1);
    m0_teardown(m0);
    arena_destroy(&arena);
    return 1;
}
if (!m3_verify()) {
    fprintf(stderr, "[boot] FAIL: M3 verification failed.\n");
    m3_teardown(m3);
    m2_teardown(m2);
    m1_teardown(m1);
    m0_teardown(m0);
    arena_destroy(&arena);
    return 1;
}
printf("[boot] M3 (Mahamaya) initialized. CF=QUATERNAL. 64-fold transcription loaded.\n");
```

**Step 2: Add M3 CLI dispatch block**

After the M2 dispatch block:
```c
if (argc > 1 && strcmp(argv[1], "m3") == 0) {
    int rc = m3_cli_dispatch(argc - 1, argv + 1, m3);
    m3_teardown(m3);
    m2_teardown(m2);
    m1_teardown(m1);
    m0_teardown(m0);
    arena_destroy(&arena);
    return rc;
}
```

**Step 3: Add m3_teardown to ALL cleanup paths**

Update every existing cleanup path and the final cleanup to include `m3_teardown(m3)` before `m2_teardown(m2)`.

**Step 4: Add `#include "m3.h"` to includes**

Already should be there after m2.h include.

**Step 5: Full build + run**

```bash
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/main.c \
    -o epi-logos && ./epi-logos
```

Expected output must include:
```
[boot] M3 (Mahamaya) initialized. CF=QUATERNAL. 64-fold transcription loaded.
```

**Step 6: Commit**

```bash
git add src/main.c
git commit -m "feat(m3): integrate M3 into boot sequence — Phase 4.8 + CLI dispatch"
```

---

### Task 7: Write M3 test file

**Files:**
- Create: `src/test_m3.c`

**Step 1: Write comprehensive M3 tests**

Test categories:
1. **Nucleotide encoding**: A=0, T=1, C=2, G=3; polarity/mobility extraction
2. **I-Ching values**: {6,9,7,8}; sum=30; codon sums in [18,27]
3. **PAIR_MATRIX**: all 16 entries; homos have diff==0; TT=max(18)
4. **3-Matrix membership**: verify each pair's matrix membership
5. **Rotational state**: compute_rotational_state for known pairs
6. **Codon evaluation**: evaluate_codon for known codons; verify pp/nn/np/pn
7. **360 integral invariant**: sum of all 64 codons' pp values / appropriate formula
8. **Non-dual codons**: all 16 XyX codons identified; all have outer==inner
9. **Complement**: comp(i) == i ^ 0x3F for all 64
10. **Base pairing**: A↔T, C↔G (XOR 0x01)
11. **Cosmic clock**: degree 0, 90, 180, 360 produce correct states
12. **Epogdoon**: 72×8/9=64; gap detection
13. **Polar opposite SU(2)**: preserves shadow layer
14. **m3_compute_charges**: 4X invariant (pp+nn+np+pn = 4×outer)
15. **RNA capability**: codons with T are RNA-capable
16. **Tarot LUT integrity**: 4 suits × 16 entries, dual-codon courts

**Step 2: Build and run with sanitizers**

```bash
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/test_m3.c \
    -o test_m3 && ./test_m3
```

Expected: all tests pass, no ASAN/UBSAN errors

**Step 3: Commit**

```bash
git add src/test_m3.c
git commit -m "test(m3): add comprehensive M3 verification suite — 16 test categories"
```

---

### Task 8: Final verification + full build

**Files:**
- No new files

**Step 1: Full clean build**

```bash
clang -std=c11 -Wall -Wextra -Werror -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/main.c \
    -o epi-logos
```

Must produce zero warnings and zero errors.

**Step 2: Run boot sequence**

```bash
./epi-logos
```

Must print all `[boot] ... OK` lines including M3.

**Step 3: Test CLI commands**

```bash
./epi-logos m3 info
./epi-logos m3 pair 0 1         # AT pair: S=15, D=-3
./epi-logos m3 codon AAA        # pp=18, nn=-6, np=6, pn=6, non-dual, Cups
./epi-logos m3 clock 0          # torus=0, decan=0, hex=0
./epi-logos m3 clock 90         # torus=3, decan=9, hex=16
./epi-logos m3 hexagram 0       # Kun (Earth/Earth)
```

**Step 4: Run test suite**

```bash
./test_m3
```

All tests must pass.

**Step 5: Commit final state**

```bash
git add -A
git commit -m "feat(m3): complete M3 Mahamaya implementation — 22 FRs, 64-fold transcription engine"
```

---

## Spec Fidelity Checklist

After implementation, verify:
- [ ] All 22 FRs (2.3.0-2.3.21) have corresponding code
- [ ] M3_Root.hc is first field, HC_LINK'd in init
- [ ] Context frame via CF_TABLE[CF_QUATERNAL]
- [ ] All LUTs are `static const` or `const` (.rodata)
- [ ] _Static_assert for: NUCLEOTIDE_ICHING_VALUE sum=30, 360 integral, TTT 4X invariant
- [ ] M3_PAIR_MATRIX has all 16 entries with correct S/D values
- [ ] M3_TAROT_CODON_MAP has all 64 entries (verified codon encodings)
- [ ] 16 non-dual codons correctly identified
- [ ] m3_verify() checks PAIR_MATRIX, integral invariant, non-dual codons
- [ ] m3_cli_dispatch covers all public operations
- [ ] main.c Phase 4.8 with proper teardown ordering
- [ ] Zero compiler warnings with -Wall -Wextra
- [ ] ASAN/UBSAN clean
