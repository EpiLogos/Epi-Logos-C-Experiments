# M1 (Paramasiva) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `include/m1.h` (fix Quintessence) + `src/m1.c` (all .rodata + API) + integrate into `src/main.c`.

**Architecture:** M1 is the Mathematical DNA subsystem anchored to `Psychoid_1`/`mirrors[1]`. It follows the exact same HC_LINK / malloc / arena pattern as M0. The Quintessence matrix is a dyadic struct (bimba + sum nibble-packed arrays), not a scalar DR_Matrix_12x12. All constants derive from the 16:9 ratio with zero magic numbers.

**Tech Stack:** C11, clang, existing ontology.h / psychoid_numbers.h / arena.h / m0.h patterns.

---

## Reference Data (from CSV digi-rooted section)

### ANANDA_BIMBA — 12×12 digi-rooted (row = vortex 0X–11X, col = position 0–11)
```
Row  0: 0,0,0,0,0,0,0,0,0,0,0,0
Row  1: 0,1,2,3,4,5,6,7,8,9,1,2
Row  2: 0,2,4,6,8,1,3,5,7,9,2,4
Row  3: 0,3,6,9,3,6,9,3,6,9,3,6
Row  4: 0,4,8,3,7,2,6,1,5,9,4,8
Row  5: 0,5,1,6,2,7,3,8,4,9,5,1
Row  6: 0,6,3,9,6,3,9,6,3,9,6,3
Row  7: 0,7,5,3,1,8,6,4,2,9,7,5
Row  8: 0,8,7,6,5,4,3,2,1,9,8,7
Row  9: 0,9,9,9,9,9,9,9,9,9,9,9
Row 10: 0,1,2,3,4,5,6,7,8,9,1,2   ← SU(2) shadow extension
Row 11: 0,2,4,6,8,1,3,5,7,9,2,4   ← SU(2) shadow extension
```

### ANANDA_PRATIBIMBA — 12×12 digi-rooted
```
Row  0: 1,1,1,1,1,1,1,1,1,1,1,1
Row  1: 1,2,3,4,5,6,7,8,9,1,2,3
Row  2: 1,3,5,7,9,2,4,6,8,1,3,5
Row  3: 1,4,7,1,4,7,1,4,7,1,4,7
Row  4: 1,5,9,4,8,3,7,2,6,1,5,9
Row  5: 1,6,2,7,3,8,4,9,5,1,6,2
Row  6: 1,7,4,1,7,4,1,7,4,1,7,4
Row  7: 1,8,6,4,2,9,7,5,3,1,8,6
Row  8: 1,9,8,7,6,5,4,3,2,1,9,8
Row  9: 1,1,1,1,1,1,1,1,1,1,1,1
Row 10: 1,2,3,4,5,6,7,8,9,1,2,3
Row 11: 1,3,5,7,9,2,4,6,8,1,3,5
```

### ANANDA_SUM — 12×12 digi-rooted
```
Row  0: 1,1,1,1,1,1,1,1,1,1,1,1
Row  1: 1,3,5,7,9,2,4,6,8,1,3,5
Row  2: 1,5,9,4,8,3,7,2,6,1,5,9
Row  3: 1,7,4,1,7,4,1,7,4,1,7,4
Row  4: 1,9,8,7,6,5,4,3,2,1,9,8
Row  5: 1,2,3,4,5,6,7,8,9,1,2,3
Row  6: 1,4,7,1,4,7,1,4,7,1,4,7
Row  7: 1,6,2,7,3,8,4,9,5,1,6,2
Row  8: 1,8,6,4,2,9,7,5,3,1,8,6
Row  9: 1,1,1,1,1,1,1,1,1,1,1,1
Row 10: 1,3,5,7,9,2,4,6,8,1,3,5
Row 11: 1,5,9,4,8,3,7,2,6,1,5,9
```

### Quintessence — per cell: {DIFF_A=-1(const) / BIMBA_dr / SUM_dr}
- `Quintessence_Matrix.bimba[]` = same nibble-packed values as ANANDA_BIMBA
- `Quintessence_Matrix.sum[]`   = same nibble-packed values as ANANDA_SUM
- DIFF_A = -1 throughout — compile-time constant `M1_QUINT_DIFF`, no storage

### Nibble packing formula
`byte[flat/2] = (val[flat+1] << 4) | val[flat]`  where `flat = row*12 + col`
- Even flat → lower nibble (`byte & 0x0F`)
- Odd flat  → upper nibble (`byte >> 4`)

### Pre-computed packed hex for ANANDA_BIMBA (72 bytes)
```
0x00,0x00,0x00,0x00,0x00,0x00,  /* Row  0 */
0x10,0x32,0x54,0x76,0x98,0x21,  /* Row  1 */
0x20,0x64,0x18,0x53,0x97,0x42,  /* Row  2 */
0x30,0x96,0x63,0x39,0x96,0x63,  /* Row  3 */
0x40,0x38,0x27,0x16,0x95,0x84,  /* Row  4 */
0x50,0x61,0x72,0x83,0x94,0x15,  /* Row  5 */
0x60,0x93,0x36,0x69,0x93,0x36,  /* Row  6 */
0x70,0x35,0x81,0x46,0x92,0x57,  /* Row  7 */
0x80,0x67,0x45,0x23,0x91,0x78,  /* Row  8 */
0x90,0x99,0x99,0x99,0x99,0x99,  /* Row  9 */
0x10,0x32,0x54,0x76,0x98,0x21,  /* Row 10 */
0x20,0x64,0x18,0x53,0x97,0x42   /* Row 11 */
```

### Pre-computed packed hex for ANANDA_PRATIBIMBA (72 bytes)
```
0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  0 */
0x21,0x43,0x65,0x87,0x19,0x32,  /* Row  1 */
0x31,0x75,0x29,0x64,0x18,0x53,  /* Row  2 */
0x41,0x17,0x74,0x41,0x17,0x74,  /* Row  3 */
0x51,0x49,0x38,0x27,0x16,0x95,  /* Row  4 */
0x61,0x72,0x83,0x94,0x15,0x26,  /* Row  5 */
0x71,0x14,0x47,0x71,0x14,0x47,  /* Row  6 */
0x81,0x46,0x92,0x57,0x13,0x68,  /* Row  7 */
0x91,0x78,0x56,0x34,0x12,0x89,  /* Row  8 */
0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  9 */
0x21,0x43,0x65,0x87,0x19,0x32,  /* Row 10 */
0x31,0x75,0x29,0x64,0x18,0x53   /* Row 11 */
```

### Pre-computed packed hex for ANANDA_SUM (72 bytes)
```
0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  0 */
0x31,0x75,0x29,0x64,0x18,0x53,  /* Row  1 */
0x51,0x49,0x38,0x27,0x16,0x95,  /* Row  2 */
0x71,0x14,0x47,0x71,0x14,0x47,  /* Row  3 */
0x91,0x78,0x56,0x34,0x12,0x89,  /* Row  4 */
0x21,0x43,0x65,0x87,0x19,0x32,  /* Row  5 */
0x41,0x17,0x74,0x41,0x17,0x74,  /* Row  6 */
0x61,0x72,0x83,0x94,0x15,0x26,  /* Row  7 */
0x81,0x46,0x92,0x57,0x13,0x68,  /* Row  8 */
0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  9 */
0x31,0x75,0x29,0x64,0x18,0x53,  /* Row 10 */
0x51,0x49,0x38,0x27,0x16,0x95   /* Row 11 */
```

---

## Task 1: Fix include/m1.h — Add Quintessence_Matrix

**Files:**
- Modify: `include/m1.h`

### Step 1: Replace the ANANDA_QUINTESSENCE extern in m1.h

In `include/m1.h`, find and replace:

OLD (around line 75):
```c
extern const DR_Matrix_12x12 ANANDA_QUINTESSENCE;  /* DR(BIMBA×PRATIBIMBA) — Paradox */
```

NEW — insert BEFORE it, then replace the extern line:
```c
/* ===================================================================
 * QUINTESSENCE MATRIX — Dyadic storage {bimba_dr, sum_dr} per cell
 * DIFF_A = -1 is invariant — no storage needed (M1_QUINT_DIFF).
 * Ontology: Quintessence IS the C5 synthesis: source (C0/Bimba) +
 * reflection (C5/Pratibimba) held together at position #1-2-5 (Integration).
 * =================================================================== */
#define M1_QUINT_DIFF  (-1)    /* Shadow differential — constant, no storage */

typedef struct {
    uint8_t bimba[72];   /* nibble-packed BIMBA_dr per cell  (= ANANDA_BIMBA values) */
    uint8_t sum[72];     /* nibble-packed SUM_dr per cell    (= ANANDA_SUM values)   */
} Quintessence_Matrix;   /* 144 bytes — 2.25 cache lines */

_Static_assert(sizeof(Quintessence_Matrix) == 144, "Quintessence_Matrix must be 144 bytes");

extern const Quintessence_Matrix ANANDA_QUINTESSENCE;  /* #1-2-5: Dyadic integration */

/* Read one Quintessence bimba cell — O(1) */
static inline uint8_t get_quint_bimba(uint8_t row, uint8_t col) {
    uint8_t flat = (uint8_t)(row * 12u + col);
    uint8_t b = ANANDA_QUINTESSENCE.bimba[flat / 2u];
    return (flat % 2u == 0u) ? (uint8_t)(b & 0x0Fu) : (uint8_t)(b >> 4u);
}

/* Read one Quintessence sum cell — O(1) */
static inline uint8_t get_quint_sum(uint8_t row, uint8_t col) {
    uint8_t flat = (uint8_t)(row * 12u + col);
    uint8_t b = ANANDA_QUINTESSENCE.sum[flat / 2u];
    return (flat % 2u == 0u) ? (uint8_t)(b & 0x0Fu) : (uint8_t)(b >> 4u);
}
```

### Step 2: Build to verify header compiles cleanly

```bash
clang -std=c11 -Wall -Wextra -I include -fsyntax-only \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c src/main.c
```

Expected: zero errors, zero warnings. (m1.c doesn't exist yet — main.c doesn't include m1.h yet, so this just checks header syntax.)

---

## Task 2: Create src/m1.c — .rodata section

**Files:**
- Create: `src/m1.c`

### Step 1: Write the file header + includes

```c
/**
 * m1.c — Paramasiva: Mathematical DNA (.rodata + API)
 *
 * All matrix data lives in .rodata (const). No magic numbers.
 * Every value traces to the 16:9 foundational ratio.
 */

#include "m1.h"
#include "psychoid_numbers.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

### Step 2: Write ANANDA_BIMBA

```c
/* =============================================================================
 * ANANDA_BIMBA (#1-2-0) — Original Source Matrix
 * Digi-rooted (0X+0) through (11X+0): kX+0 mod 9.
 * Row 0 = all zeros (0 * X = 0). Row k, col n = DR(k*n) mod 9.
 * ============================================================================= */
const DR_Matrix_12x12 ANANDA_BIMBA = { .packed_cells = {
    0x00,0x00,0x00,0x00,0x00,0x00,  /* Row  0: 0,0,0,0,0,0,0,0,0,0,0,0 */
    0x10,0x32,0x54,0x76,0x98,0x21,  /* Row  1: 0,1,2,3,4,5,6,7,8,9,1,2 */
    0x20,0x64,0x18,0x53,0x97,0x42,  /* Row  2: 0,2,4,6,8,1,3,5,7,9,2,4 */
    0x30,0x96,0x63,0x39,0x96,0x63,  /* Row  3: 0,3,6,9,3,6,9,3,6,9,3,6 */
    0x40,0x38,0x27,0x16,0x95,0x84,  /* Row  4: 0,4,8,3,7,2,6,1,5,9,4,8 */
    0x50,0x61,0x72,0x83,0x94,0x15,  /* Row  5: 0,5,1,6,2,7,3,8,4,9,5,1 */
    0x60,0x93,0x36,0x69,0x93,0x36,  /* Row  6: 0,6,3,9,6,3,9,6,3,9,6,3 */
    0x70,0x35,0x81,0x46,0x92,0x57,  /* Row  7: 0,7,5,3,1,8,6,4,2,9,7,5 */
    0x80,0x67,0x45,0x23,0x91,0x78,  /* Row  8: 0,8,7,6,5,4,3,2,1,9,8,7 */
    0x90,0x99,0x99,0x99,0x99,0x99,  /* Row  9: 0,9,9,9,9,9,9,9,9,9,9,9 */
    0x10,0x32,0x54,0x76,0x98,0x21,  /* Row 10: 0,1,2,3,4,5,6,7,8,9,1,2 (shadow) */
    0x20,0x64,0x18,0x53,0x97,0x42   /* Row 11: 0,2,4,6,8,1,3,5,7,9,2,4 (shadow) */
}};
```

### Step 3: Write ANANDA_PRATIBIMBA

```c
/* =============================================================================
 * ANANDA_PRATIBIMBA (#1-2-1) — Offset Reflection Matrix
 * Digi-rooted (kX+1): all rows start at 1, step by k.
 * Row 0 = all ones (0*X+1 = 1 always). Row k, col n = DR(k*n+1) mod 9.
 * ============================================================================= */
const DR_Matrix_12x12 ANANDA_PRATIBIMBA = { .packed_cells = {
    0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  0: 1,1,1,1,1,1,1,1,1,1,1,1 */
    0x21,0x43,0x65,0x87,0x19,0x32,  /* Row  1: 1,2,3,4,5,6,7,8,9,1,2,3 */
    0x31,0x75,0x29,0x64,0x18,0x53,  /* Row  2: 1,3,5,7,9,2,4,6,8,1,3,5 */
    0x41,0x17,0x74,0x41,0x17,0x74,  /* Row  3: 1,4,7,1,4,7,1,4,7,1,4,7 */
    0x51,0x49,0x38,0x27,0x16,0x95,  /* Row  4: 1,5,9,4,8,3,7,2,6,1,5,9 */
    0x61,0x72,0x83,0x94,0x15,0x26,  /* Row  5: 1,6,2,7,3,8,4,9,5,1,6,2 */
    0x71,0x14,0x47,0x71,0x14,0x47,  /* Row  6: 1,7,4,1,7,4,1,7,4,1,7,4 */
    0x81,0x46,0x92,0x57,0x13,0x68,  /* Row  7: 1,8,6,4,2,9,7,5,3,1,8,6 */
    0x91,0x78,0x56,0x34,0x12,0x89,  /* Row  8: 1,9,8,7,6,5,4,3,2,1,9,8 */
    0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  9: 1,1,1,1,1,1,1,1,1,1,1,1 */
    0x21,0x43,0x65,0x87,0x19,0x32,  /* Row 10: 1,2,3,4,5,6,7,8,9,1,2,3 (shadow) */
    0x31,0x75,0x29,0x64,0x18,0x53   /* Row 11: 1,3,5,7,9,2,4,6,8,1,3,5 (shadow) */
}};
```

### Step 4: Write ANANDA_SUM

```c
/* =============================================================================
 * ANANDA_SUM (#1-2-2) — Additive Synthesis Matrix
 * DR(BIMBA + PRATIBIMBA): each cell = DR(bimba_raw + pratibimba_raw).
 * Structurally: SUM rows are shifted PRATIBIMBA rows (row k of SUM = row k of
 * a mod-9 Cayley table offset by +1 at col 0).
 * ============================================================================= */
const DR_Matrix_12x12 ANANDA_SUM = { .packed_cells = {
    0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  0: 1,1,1,1,1,1,1,1,1,1,1,1 */
    0x31,0x75,0x29,0x64,0x18,0x53,  /* Row  1: 1,3,5,7,9,2,4,6,8,1,3,5 */
    0x51,0x49,0x38,0x27,0x16,0x95,  /* Row  2: 1,5,9,4,8,3,7,2,6,1,5,9 */
    0x71,0x14,0x47,0x71,0x14,0x47,  /* Row  3: 1,7,4,1,7,4,1,7,4,1,7,4 */
    0x91,0x78,0x56,0x34,0x12,0x89,  /* Row  4: 1,9,8,7,6,5,4,3,2,1,9,8 */
    0x21,0x43,0x65,0x87,0x19,0x32,  /* Row  5: 1,2,3,4,5,6,7,8,9,1,2,3 */
    0x41,0x17,0x74,0x41,0x17,0x74,  /* Row  6: 1,4,7,1,4,7,1,4,7,1,4,7 */
    0x61,0x72,0x83,0x94,0x15,0x26,  /* Row  7: 1,6,2,7,3,8,4,9,5,1,6,2 */
    0x81,0x46,0x92,0x57,0x13,0x68,  /* Row  8: 1,8,6,4,2,9,7,5,3,1,8,6 */
    0x11,0x11,0x11,0x11,0x11,0x11,  /* Row  9: 1,1,1,1,1,1,1,1,1,1,1,1 */
    0x31,0x75,0x29,0x64,0x18,0x53,  /* Row 10: 1,3,5,7,9,2,4,6,8,1,3,5 (shadow) */
    0x51,0x49,0x38,0x27,0x16,0x95   /* Row 11: 1,5,9,4,8,3,7,2,6,1,5,9 (shadow) */
}};
```

### Step 5: Write ANANDA_QUINTESSENCE

```c
/* =============================================================================
 * ANANDA_QUINTESSENCE (#1-2-5) — Dyadic Integration
 * C5 resonance: holds {BIMBA_dr, SUM_dr} per cell.
 * DIFF_A = -1 is invariant (M1_QUINT_DIFF) — no storage.
 * .bimba[] mirrors ANANDA_BIMBA exactly.
 * .sum[]   mirrors ANANDA_SUM exactly.
 * This is not redundancy — it is non-dual self-recognition:
 * the source and its synthesis held together at position #5 (Integration).
 * ============================================================================= */
const Quintessence_Matrix ANANDA_QUINTESSENCE = {
    .bimba = {
        0x00,0x00,0x00,0x00,0x00,0x00,
        0x10,0x32,0x54,0x76,0x98,0x21,
        0x20,0x64,0x18,0x53,0x97,0x42,
        0x30,0x96,0x63,0x39,0x96,0x63,
        0x40,0x38,0x27,0x16,0x95,0x84,
        0x50,0x61,0x72,0x83,0x94,0x15,
        0x60,0x93,0x36,0x69,0x93,0x36,
        0x70,0x35,0x81,0x46,0x92,0x57,
        0x80,0x67,0x45,0x23,0x91,0x78,
        0x90,0x99,0x99,0x99,0x99,0x99,
        0x10,0x32,0x54,0x76,0x98,0x21,
        0x20,0x64,0x18,0x53,0x97,0x42
    },
    .sum = {
        0x11,0x11,0x11,0x11,0x11,0x11,
        0x31,0x75,0x29,0x64,0x18,0x53,
        0x51,0x49,0x38,0x27,0x16,0x95,
        0x71,0x14,0x47,0x71,0x14,0x47,
        0x91,0x78,0x56,0x34,0x12,0x89,
        0x21,0x43,0x65,0x87,0x19,0x32,
        0x41,0x17,0x74,0x41,0x17,0x74,
        0x61,0x72,0x83,0x94,0x15,0x26,
        0x81,0x46,0x92,0x57,0x13,0x68,
        0x11,0x11,0x11,0x11,0x11,0x11,
        0x31,0x75,0x29,0x64,0x18,0x53,
        0x51,0x49,0x38,0x27,0x16,0x95
    }
};
```

### Step 6: Write DR rings and supporting .rodata

```c
/* =============================================================================
 * DR RINGS — Dual-track generation roots (#1-3-1 and #1-3-2+3)
 * ============================================================================= */

/* Mahamaya: doubling track {1×2^n mod 9} — 64-bit word alignment */
const uint8_t DR_RING_MAHAMAYA[6]   = { 1, 2, 4, 8, 7, 5 };

/* Parashakti: tripling track {3×n mod 9} — 72-name space */
const uint8_t DR_RING_PARASHAKTI[6] = { 3, 6, 9, 3, 6, 9 };

/* =============================================================================
 * M1_BRANCH_QL_CATEGORY — QL category per top-level #1-x branch
 * ============================================================================= */
const M1_QL_Category M1_BRANCH_QL_CATEGORY[6] = {
    M1_QL_CAT_IMPLICATE,            /* #1-0 Bimba: pure .rodata source  */
    M1_QL_CAT_IMPLICATE_EXPLICATE,  /* #1-1 Pratibimba: transition      */
    M1_QL_CAT_EXPLICATE_1,          /* #1-2 Ananda: 1st explicate block */
    M1_QL_CAT_EXPLICATE_4,          /* #1-3 Spanda: contextual compiler  */
    M1_QL_CAT_EXPLICATE_3,          /* #1-4 QL: constant cascade        */
    M1_QL_CAT_IMPLICATE_BOUNDARY,   /* #1-5 Toroidal: implicate closure */
};

/* =============================================================================
 * M1_M0_CROSSLINK — 12-entry Ananda ring → Psychoid_* pointer table
 * Positions 0-5: ascending (Explicate) → Psychoid_0 through Psychoid_5
 * Positions 6-11: descending (Implicate/Shadow) → Psychoid_5 down to Psychoid_0
 * ============================================================================= */
const Holographic_Coordinate* const M1_M0_CROSSLINK[12] = {
    &Psychoid_0, &Psychoid_1, &Psychoid_2,
    &Psychoid_3, &Psychoid_4, &Psychoid_5,   /* 0-5: ascending  */
    &Psychoid_5, &Psychoid_4, &Psychoid_3,
    &Psychoid_2, &Psychoid_1, &Psychoid_0    /* 6-11: descending */
};

/* =============================================================================
 * QL_FLOWERING — 6-stage mod-6 constant cascade ring (#1-4)
 * Each stage: {position, name, formulation, next, inverse}
 * next    = (stage + 1) % 6
 * inverse = QL_INVERT[stage]
 * ============================================================================= */
const QL_Stage QL_FLOWERING[6] = {
    { 0, "Ground",      "Pure implicate; 16:9 root ratio",        1, 5 },
    { 1, "Form",        "Mathematical DNA seed; 4^2 / 3^2",       2, 4 },
    { 2, "Entity",      "72-space deployment; 36x2 Parashakti",   3, 3 },
    { 3, "Pattern",     "64-bit word ring; Mahamaya doubling",     4, 2 },
    { 4, "Context",     "QL-staging lemniscate; RING_SIZE=12",     5, 1 },
    { 5, "Integration", "Logos synthesis; Mobius return to #0",    0, 0 },
};
```

### Step 7: Write Spanda mutators + SPANDA_COMPILER_PASSES

```c
/* =============================================================================
 * SPANDA COMPILER PASSES (#1-3) — Typed mutators, static scope
 * Each pass encodes a topological concrescence stage onto a PRATIBIMBA.
 * weave_state encodes the stage semantics; inversion_state = pole polarity.
 * ============================================================================= */

static void spanda_pass_seed(PRATIBIMBA* hc) {
    /* Stage 0: Genus-0 sphere — fused (0/1), both poles undifferentiated */
    hc->weave_state     = 0.0f;
    hc->inversion_state = 0;
}

static void spanda_pass_pole_a(PRATIBIMBA* hc) {
    /* Stage 1: Original Pole — Mahamaya track, doubling {1,2,4,8,7,5} */
    hc->weave_state     = 1.0f;
    hc->inversion_state = 0;   /* Normal: explicate */
}

static void spanda_pass_pole_b(PRATIBIMBA* hc) {
    /* Stage 2: Reflection Pole — Parashakti track, tripling {3,6,9,...} */
    hc->weave_state     = 1.0f;
    hc->inversion_state = 1;   /* Inverted: implicate mirror */
}

static void spanda_pass_trika(PRATIBIMBA* hc) {
    /* Stage 3: Trika Synthesis — (0/1/2) first stable torus */
    hc->weave_state     = 1.5f;  /* midpoint of the 3-fold */
    hc->inversion_state = 0;
}

static void spanda_pass_flower(PRATIBIMBA* hc) {
    /* Stage 4: Contextual Flowering — 6 CF sub-stages → QL constants */
    hc->weave_state     = 4.0f;  /* anchors to #4 (Lemniscate / Context) */
    hc->inversion_state = 0;
}

static void spanda_pass_meta(PRATIBIMBA* hc) {
    /* Stage 5: Meta-Reflection — fold-count sieve, Möbius look-back */
    hc->weave_state     = 5.0f;  /* integration position */
    hc->inversion_state = 1;     /* inverted: retrospective */
}

const Spanda_Mutator SPANDA_COMPILER_PASSES[6] = {
    spanda_pass_seed,
    spanda_pass_pole_a,
    spanda_pass_pole_b,
    spanda_pass_trika,
    spanda_pass_flower,
    spanda_pass_meta,
};
```

### Step 8: Write m1_verify, m1_init, m1_teardown

```c
/* =============================================================================
 * PUBLIC API
 * ============================================================================= */

bool m1_verify(void) {
    /* Spot-check: BIMBA[1][1] = 1 */
    if (get_ananda_harmonic(&ANANDA_BIMBA, 1, 1) != 1u) return false;
    /* BIMBA[9][1] = 9 */
    if (get_ananda_harmonic(&ANANDA_BIMBA, 9, 1) != 9u) return false;
    /* PRATIBIMBA[0][0] = 1 */
    if (get_ananda_harmonic(&ANANDA_PRATIBIMBA, 0, 0) != 1u) return false;
    /* PRATIBIMBA[3][3] = 1 (3*3+1=10, DR=1) */
    if (get_ananda_harmonic(&ANANDA_PRATIBIMBA, 3, 3) != 1u) return false;
    /* SUM[1][2] = 5 (BIMBA=2, PRATIBIMBA=3, sum=5) */
    if (get_ananda_harmonic(&ANANDA_SUM, 1, 2) != 5u) return false;
    /* Quintessence bimba[1][1] == BIMBA[1][1] */
    if (get_quint_bimba(1, 1) != get_ananda_harmonic(&ANANDA_BIMBA, 1, 1)) return false;
    /* Quintessence sum[1][2] == SUM[1][2] */
    if (get_quint_sum(1, 2) != get_ananda_harmonic(&ANANDA_SUM, 1, 2)) return false;
    /* DR rings */
    if (DR_RING_MAHAMAYA[0] != 1u || DR_RING_MAHAMAYA[3] != 8u) return false;
    if (DR_RING_PARASHAKTI[0] != 3u || DR_RING_PARASHAKTI[2] != 9u) return false;
    /* Crosslink non-null */
    return verify_m1_m0_crosslink();
}

M1_Root* m1_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    (void)arena;   /* M1_Root is malloc'd, not arena-alloc'd */
    if (!hc) return NULL;
    M1_Root* root = (M1_Root*)malloc(sizeof(M1_Root));
    if (!root) return NULL;
    memset(root, 0, sizeof(M1_Root));
    root->hc         = hc;
    root->active_cf  = cf_get(CF_BINARY);
    root->spanda.stage       = SPANDA_SEED;
    root->spanda.state_bits  = 0x03u;  /* pole_a | pole_b fused at seed */
    root->spanda.track       = 0;
    root->spanda.cf_substage = 0;
    root->torus_pos  = 0;
    root->ananda     = &ANANDA_BIMBA;
    HC_LINK(hc, root);
    return root;
}

void m1_teardown(M1_Root* root) {
    if (!root) return;
    if (root->hc) HC_UNLINK(root->hc);
    free(root);
}
```

### Step 9: Write m1_cli_dispatch

```c
int m1_cli_dispatch(int argc, char** argv, M1_Root* root) {
    /* argv[0] = "m1" */
    if (argc < 2) {
        printf("[m1] Paramasiva — Mathematical DNA (CF: 0/1 Binary)\n");
        printf("[m1] torus_pos: %u | spanda_stage: %u | track: %u\n",
               root->torus_pos, (uint8_t)root->spanda.stage, root->spanda.track);
        printf("[m1] Commands: ananda, pratibimba, sum, quint, spanda, ring, ql\n");
        return 0;
    }
    if (strcmp(argv[1], "ananda") == 0) {
        printf("[m1] ANANDA_BIMBA (12x12 digi-rooted):\n");
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++)
                printf("%2u ", get_ananda_harmonic(&ANANDA_BIMBA, r, c));
            printf("\n");
        }
        return 0;
    }
    if (strcmp(argv[1], "pratibimba") == 0) {
        printf("[m1] ANANDA_PRATIBIMBA (12x12 digi-rooted):\n");
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++)
                printf("%2u ", get_ananda_harmonic(&ANANDA_PRATIBIMBA, r, c));
            printf("\n");
        }
        return 0;
    }
    if (strcmp(argv[1], "sum") == 0) {
        printf("[m1] ANANDA_SUM (12x12 digi-rooted):\n");
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++)
                printf("%2u ", get_ananda_harmonic(&ANANDA_SUM, r, c));
            printf("\n");
        }
        return 0;
    }
    if (strcmp(argv[1], "quint") == 0) {
        printf("[m1] ANANDA_QUINTESSENCE (DIFF_A=%d constant):\n", M1_QUINT_DIFF);
        printf("[m1] Bimba layer (C0 source):\n");
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++)
                printf("%2u ", get_quint_bimba((uint8_t)r, (uint8_t)c));
            printf("\n");
        }
        printf("[m1] Sum layer (C5 integration):\n");
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++)
                printf("%2u ", get_quint_sum((uint8_t)r, (uint8_t)c));
            printf("\n");
        }
        return 0;
    }
    if (strcmp(argv[1], "spanda") == 0) {
        printf("[m1] Spanda stage: %u | track: %u | cf_sub: %u | state_bits: 0x%02X\n",
               (uint8_t)root->spanda.stage, root->spanda.track,
               root->spanda.cf_substage, root->spanda.state_bits);
        return 0;
    }
    if (strcmp(argv[1], "ring") == 0) {
        printf("[m1] Mahamaya  ring: {1,2,4,8,7,5} — doubling  (64-bit)\n");
        printf("[m1] Parashakti ring: {3,6,9,3,6,9} — tripling (72-name)\n");
        return 0;
    }
    if (strcmp(argv[1], "ql") == 0) {
        printf("[m1] QL_FLOWERING (6-stage mod-6 ring):\n");
        for (int i = 0; i < 6; i++)
            printf("[m1]  [%d] %-12s  next=%u inv=%u  %s\n",
                   QL_FLOWERING[i].stage, QL_FLOWERING[i].name,
                   QL_FLOWERING[i].next, QL_FLOWERING[i].inverse,
                   QL_FLOWERING[i].formulation);
        return 0;
    }
    fprintf(stderr, "[m1] Unknown command: %s\n", argv[1]);
    return 1;
}
```

### Step 10: Compile src/m1.c in isolation (no main yet)

```bash
clang -std=c11 -Wall -Wextra -I include -c src/m1.c -o /tmp/m1.o
```

Expected: zero errors, zero warnings.

---

## Task 3: Update src/main.c — Wire M1 into boot

**Files:**
- Modify: `src/main.c`

### Step 1: Add #include "m1.h" after #include "m0.h"

At line 14 (after `#include "m0.h"`):
```c
#include "m1.h"
```

### Step 2: Add M1 init after M0 init (Phase 4.6)

After the M0 init block (currently lines 142–154), insert:

```c
    /* Phase 4.6: Initialize M1 (Paramasiva) */
    M1_Root* m1 = m1_init(&arena, mirrors[1]);
    if (!m1) {
        fprintf(stderr, "[boot] Aborting: M1 init failed.\n");
        m0_teardown(m0);
        arena_destroy(&arena);
        return 1;
    }
    if (!m1_verify()) {
        fprintf(stderr, "[boot] FAIL: M1 verification failed.\n");
        m1_teardown(m1);
        m0_teardown(m0);
        arena_destroy(&arena);
        return 1;
    }
    printf("[boot] M1 (Paramasiva) initialized. CF=BINARY. Ananda+Spanda+QL loaded.\n");
```

### Step 3: Add M1 CLI dispatch after M0 dispatch (currently line 157)

After the M0 CLI dispatch block:
```c
    if (argc > 1 && strcmp(argv[1], "m1") == 0) {
        int rc = m1_cli_dispatch(argc - 1, argv + 1, m1);
        m1_teardown(m1);
        m0_teardown(m0);
        arena_destroy(&arena);
        return rc;
    }
```

### Step 4: Add m1_teardown to cleanup (before arena_destroy)

Find the cleanup section (currently `m0_teardown(m0);`), add before it:
```c
    m1_teardown(m1);
```

### Step 5: Full build

```bash
clang -std=c11 -Wall -Wextra -I include \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/main.c -o epi-logos
```

Expected: zero errors, zero warnings. Binary produced.

### Step 6: Smoke test

```bash
./epi-logos
```

Expected output includes:
```
[boot] M0 (Anuttara) initialized. CF=VOID. 12-fold archetypes loaded.
[boot] M1 (Paramasiva) initialized. CF=BINARY. Ananda+Spanda+QL loaded.
```

### Step 7: CLI smoke tests

```bash
./epi-logos m1
./epi-logos m1 ananda
./epi-logos m1 quint
./epi-logos m1 ring
./epi-logos m1 ql
```

Each should print valid data without crashing. Verify BIMBA row 1 prints: `0 1 2 3 4 5 6 7 8 9 1 2`.

### Step 8: Commit

```bash
git add include/m1.h src/m1.c src/main.c
git commit -m "feat: implement M1 Paramasiva — Ananda matrices, Spanda, QL Flowering

Adds Quintessence_Matrix (dyadic bimba+sum storage), three DR_Matrix_12x12
matrices (BIMBA/PRATIBIMBA/SUM) with full nibble-packed .rodata, DR rings,
QL_FLOWERING 6-stage cascade, Spanda mutators, M1_M0_CROSSLINK 12-entry
table, and boot-time m1_verify(). Integrates into main.c at Phase 4.6.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Write and run test_m1.c

**Files:**
- Create: `src/test_m1.c`

### Step 1: Write test file

```c
/**
 * test_m1.c — Pillar II M1 verification tests
 * Tests: matrix spot-checks, ring checks, static_asserts, API lifecycle.
 */

#include "m1.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

static int passed = 0, failed = 0;

#define EXPECT(cond, msg) \
    do { if (cond) { passed++; } \
         else { fprintf(stderr, "FAIL: %s\n", msg); failed++; } } while(0)

int main(void) {
    printf("=== test_m1: M1 Paramasiva Verification ===\n\n");

    /* --- ANANDA_BIMBA spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 0, 0) == 0u,  "BIMBA[0][0] == 0");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 1, 1) == 1u,  "BIMBA[1][1] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 1, 9) == 9u,  "BIMBA[1][9] == 9");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 8, 8) == 1u,  "BIMBA[8][8] == 1 (DR(64)=1)");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 9, 1) == 9u,  "BIMBA[9][1] == 9");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 3, 3) == 9u,  "BIMBA[3][3] == 9 (DR(9)=9)");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 7, 7) == 4u,  "BIMBA[7][7] == 4 (DR(49)=4)");

    /* --- ANANDA_PRATIBIMBA spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 0, 0) == 1u, "PRAT[0][0] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 1, 2) == 3u, "PRAT[1][2] == 3");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 3, 3) == 1u, "PRAT[3][3] == 1 (DR(10)=1)");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 9, 5) == 1u, "PRAT[9][5] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 8, 1) == 9u, "PRAT[8][1] == 9");

    /* --- ANANDA_SUM spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 0, 0) == 1u,  "SUM[0][0] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 1, 2) == 5u,  "SUM[1][2] == 5 (BIMBA=2+PRAT=3)");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 3, 1) == 7u,  "SUM[3][1] == 7 (BIMBA=3+PRAT=4)");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 9, 9) == 1u,  "SUM[9][9] == 1");

    /* --- SUM coherence: SUM[r][c] == DR(BIMBA[r][c] + PRAT[r][c]) --- */
    for (int r = 0; r < 10; r++) {
        for (int c = 0; c < 10; c++) {
            uint8_t b = get_ananda_harmonic(&ANANDA_BIMBA, r, c);
            uint8_t p = get_ananda_harmonic(&ANANDA_PRATIBIMBA, r, c);
            uint8_t s = get_ananda_harmonic(&ANANDA_SUM, r, c);
            uint8_t expected = (uint8_t)((b + p) % 9u);
            if (expected == 0u && (b + p) > 0) expected = 9u;
            if (b == 0 && p == 0) expected = 0u;
            if (s != expected) {
                fprintf(stderr, "FAIL: SUM[%d][%d]: got %u, expected %u (b=%u p=%u)\n",
                        r, c, s, expected, b, p);
                failed++;
            } else {
                passed++;
            }
        }
    }

    /* --- QUINTESSENCE consistency --- */
    EXPECT(get_quint_bimba(1, 1) == get_ananda_harmonic(&ANANDA_BIMBA, 1, 1),
           "QUINT.bimba[1][1] == BIMBA[1][1]");
    EXPECT(get_quint_sum(1, 2) == get_ananda_harmonic(&ANANDA_SUM, 1, 2),
           "QUINT.sum[1][2] == SUM[1][2]");
    EXPECT(get_quint_bimba(9, 1) == get_ananda_harmonic(&ANANDA_BIMBA, 9, 1),
           "QUINT.bimba[9][1] == BIMBA[9][1]");

    /* --- Constant matrix helpers --- */
    EXPECT(get_ananda_diff_a(0, 0) == 9u,  "DIFF_A constant == 9");
    EXPECT(get_ananda_diff_a(5, 7) == 9u,  "DIFF_A constant == 9 (any cell)");
    EXPECT(get_ananda_diff_b(0, 0) == 1u,  "DIFF_B constant == 1");

    /* --- DR rings --- */
    EXPECT(DR_RING_MAHAMAYA[0] == 1u, "Mahamaya[0] == 1");
    EXPECT(DR_RING_MAHAMAYA[1] == 2u, "Mahamaya[1] == 2");
    EXPECT(DR_RING_MAHAMAYA[3] == 8u, "Mahamaya[3] == 8");
    EXPECT(DR_RING_MAHAMAYA[4] == 7u, "Mahamaya[4] == 7");
    EXPECT(DR_RING_MAHAMAYA[5] == 5u, "Mahamaya[5] == 5");
    EXPECT(DR_RING_PARASHAKTI[0] == 3u, "Parashakti[0] == 3");
    EXPECT(DR_RING_PARASHAKTI[2] == 9u, "Parashakti[2] == 9");
    EXPECT(DR_RING_PARASHAKTI[3] == 3u, "Parashakti[3] == 3 (cycle repeats)");

    /* --- Ring arithmetic macros --- */
    EXPECT(RING_WRAP(12u) == 0u,        "RING_WRAP(12) == 0");
    EXPECT(RING_WRAP(7u)  == 7u,        "RING_WRAP(7)  == 7");
    EXPECT(IS_SHADOW_PHASE(6u)  == true,  "IS_SHADOW_PHASE(6)  == true");
    EXPECT(IS_SHADOW_PHASE(5u)  == false, "IS_SHADOW_PHASE(5)  == false");
    EXPECT(GET_BASE_QL_POS(7u)  == 1u,   "GET_BASE_QL_POS(7)  == 1");
    EXPECT(GET_BASE_QL_POS(11u) == 5u,   "GET_BASE_QL_POS(11) == 5");

    /* --- QL tick helpers --- */
    EXPECT(ql_get_stage(0u)  == 0u,  "ql_get_stage(0)  == 0");
    EXPECT(ql_get_stage(5u)  == 5u,  "ql_get_stage(5)  == 5");
    EXPECT(ql_get_stage(6u)  == 5u,  "ql_get_stage(6)  == 5 (descending)");
    EXPECT(ql_get_stage(11u) == 0u,  "ql_get_stage(11) == 0 (Mobius return)");
    EXPECT(ql_is_ascending(3u) == true,  "ql_is_ascending(3)  == true");
    EXPECT(ql_is_ascending(6u) == false, "ql_is_ascending(6)  == false");

    /* --- VALID_FOLDS --- */
    EXPECT(is_valid_fold(0u)  == true,  "is_valid_fold(0)  == true");
    EXPECT(is_valid_fold(24u) == true,  "is_valid_fold(24) == true");
    EXPECT(is_valid_fold(7u)  == false, "is_valid_fold(7)  == false");
    EXPECT(is_valid_fold(11u) == false, "is_valid_fold(11) == false");

    /* --- QL_FLOWERING ring integrity --- */
    for (int i = 0; i < 6; i++) {
        EXPECT(QL_FLOWERING[i].stage == (uint8_t)i,      "QL_FLOWERING stage index");
        EXPECT(QL_FLOWERING[i].next  == (uint8_t)((i+1)%6), "QL_FLOWERING next = (i+1)%6");
        EXPECT(QL_FLOWERING[i].inverse == (uint8_t)(5-i),   "QL_FLOWERING inverse = 5-i");
    }

    /* --- M1_M0_CROSSLINK --- */
    EXPECT(verify_m1_m0_crosslink(), "M1_M0_CROSSLINK all non-null");
    EXPECT(M1_M0_CROSSLINK[0]  == &Psychoid_0, "CROSSLINK[0]  == Psychoid_0");
    EXPECT(M1_M0_CROSSLINK[5]  == &Psychoid_5, "CROSSLINK[5]  == Psychoid_5");
    EXPECT(M1_M0_CROSSLINK[6]  == &Psychoid_5, "CROSSLINK[6]  == Psychoid_5 (shadow)");
    EXPECT(M1_M0_CROSSLINK[11] == &Psychoid_0, "CROSSLINK[11] == Psychoid_0 (Mobius)");

    /* --- m1_init / m1_verify lifecycle --- */
    Coordinate_Arena arena;
    arena_init(&arena, 16);
    Holographic_Coordinate* hc = arena_alloc(&arena);
    hc->ql_position = 1;

    M1_Root* m1 = m1_init(&arena, hc);
    EXPECT(m1 != NULL,                            "m1_init returns non-null");
    EXPECT(m1->hc == hc,                          "m1->hc linked to arena coord");
    EXPECT(m1->active_cf != NULL,                 "m1->active_cf set (CF_BINARY)");
    EXPECT(m1->spanda.stage == SPANDA_SEED,        "spanda.stage == SPANDA_SEED");
    EXPECT(m1->torus_pos == 0u,                   "torus_pos == 0");
    EXPECT(m1->ananda == &ANANDA_BIMBA,           "ananda defaults to ANANDA_BIMBA");
    EXPECT(m1_verify(),                           "m1_verify() passes");

    m1_teardown(m1);
    EXPECT(hc->payload.process_state == NULL, "HC_UNLINK on teardown");
    arena_destroy(&arena);

    /* --- Topological element count LUT --- */
    EXPECT(get_topological_element_count(0u) == 1u,  "TOPO_LUT[0] == 1");
    EXPECT(get_topological_element_count(5u) == 5u,  "TOPO_LUT[5] == 5");
    EXPECT(get_topological_element_count(6u) == 8u,  "TOPO_LUT[6] == 8");
    EXPECT(get_topological_element_count(12u) == 1u, "TOPO_LUT[12] wraps to 0 -> 1");

    printf("\n=== Results: %d passed, %d failed ===\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
```

### Step 2: Build and run test with sanitizers

```bash
clang -std=c11 -Wall -Wextra -I include \
  -fsanitize=address,undefined \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/test_m1.c -o test_m1 && ./test_m1
```

Expected:
```
=== test_m1: M1 Paramasiva Verification ===
...
=== Results: N passed, 0 failed ===
```

Zero failures required before proceeding.

### Step 3: Commit

```bash
git add src/test_m1.c
git commit -m "test: add test_m1.c — full M1 Paramasiva verification suite

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Verification Checklist

- [ ] `include/m1.h` compiles cleanly (no warnings)
- [ ] `src/m1.c` compiles cleanly (no warnings)
- [ ] Full build (`epi-logos`) produces zero warnings
- [ ] `./epi-logos` boots and prints M1 init line
- [ ] `./epi-logos m1 ananda` prints correct 12×12 grid (row 1 = `0 1 2 3 4 5 6 7 8 9 1 2`)
- [ ] `./epi-logos m1 quint` prints both bimba and sum layers
- [ ] `./test_m1` → 0 failures with ASan+UBSan

---

**Plan complete and saved to `Idea/Bimba/Seeds/M/M1'/Legacy/plans/2026-03-05-m1-paramasiva-implementation.md`.**

Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Parallel Session (separate)** — Open a new session in this directory, use `superpowers:executing-plans` to run task-by-task with checkpoints.

Which approach?
