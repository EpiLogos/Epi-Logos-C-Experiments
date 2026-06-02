# FR 2.1: M1 (Paramasiva) — The Mathematical DNA

**Status:** Canonical Specification — Revision 2
**Date:** 2026-03-04
**Parent:** Pillar II, FR 2.1 (Epi-Logos C Spec)
**Source Data:** `docs/datasets/nodes_paramasiva.json` (43 nodes), `docs/datasets/relations_paramasiva.json` (234 relations), Vortex Modulae CSV (10×12 matrices), `#1-Paramasiva-Update-Possibilities.md` (Toroidal Recognition enrichment), `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/gemini-spec-M-branch-updates-refinements.md` (lines 102–252, architectural refinements)
**Coordinate:** #1 — Subsystem 1: Paramasiva — Foundational Architect of Quaternal Logic

---

## Overview

Paramasiva is the **mathematical DNA** of the entire system — no arbitrary numbers are allowed. Every cardinality, constant, ring size, and structural dimension derives from the foundational 16:9 explicate/processual ratio through deterministic transformations. M1 contains the generative machinery (Spanda), the harmonic substrate (Ananda), the constant-production cascade (QL Flowering), and the topological recognition (Toroidal) that together produce every numerical parameter used by M2–M5.

**Dataset Shape:** 43 nodes, 234 relations (192 valid), max depth 4. Six top-level sub-branches (#1-0 through #1-5) with dramatically unequal internal richness (#1-2 Ananda: 13 nodes; #1-3 Spanda: 13 nodes; #1-4 QL: 7 nodes; #1-5 Toroidal: 7 nodes; #1-0 and #1-1: 1 each — leaf types).

**Key Architectural Principle:** Spanda (#1-3) is the **compiler** that generates QL (#1-4) constants. The `PROVIDES_GENERATIVE_LOGIC_FOR` relation (6 edges) creates a 1:1 correspondence between Spanda sub-stages and QL stages. Spanda functions produce QL `#define` values.

---

## Revision 2 Summary of Changes

The following Functional Requirements were refined or added based on architectural review (`gemini-spec-M-branch-updates-refinements.md`):

| FR | Change |
|----|--------|
| FR 2.1.0 | Bimba/Pratibimba enforcement promoted from runtime flags to **compile-time typedef macros** |
| FR 2.1.1 | Ananda matrix corrected to **12×12** (144 cells) with **nibble-packing** into 72 bytes |
| FR 2.1.2 | `Spanda_Mutator` replaces `Spanda_Generator` — function pointer now mutates a `PRATIBIMBA*` directly |
| FR 2.1.3 | SU(2) ring arithmetic solidified with integer macros; float `M_PI` banned from the hot path |
| FR 2.1.4 | M5 Logos Cycle FSM state reduced to a **single uint8_t** with branchless stage derivation |
| FR 2.1.5 | All six Ananda matrix variants clarified as distinct `.rodata` objects totalling 6×72 = 432 bytes |

---

## FR 2.1.0: Bimba/Pratibimba — Compile-Time Type Enforcement

**Requirement:** The C engine MUST enforce the Bimba/Pratibimba duality at **compile time** using typedef macros, not merely at runtime via flag inspection. Every `.rodata` archetype MUST be declared as `BIMBA`. Every heap-allocated coordinate MUST be declared as `PRATIBIMBA*`. If code attempts to mutate a `BIMBA`, the compiler MUST emit a fatal type error before the program runs.

**Ontological Ground:** #1-0 (Bimba — Original Aspect — The Archetypal Source) and #1-1 (Pratibimba — Reflection — The Living Mirror).

### A. The Compile-Time Law

**Previous approach (insufficient):** `BIMBA_FLAG` and `IS_BIMBA(hc)` macros checked a runtime identity byte — this cost CPU cycles and allowed mutation attempts to compile successfully even when logically wrong.

**Revised approach:** Two typedef macros alias the struct with and without `const`. The C compiler then enforces immutability structurally:

```c
// ==============================================================================
// FR 2.1.0: COMPILE-TIME BIMBA / PRATIBIMBA ENFORCEMENT
// ==============================================================================

// BIMBA  = The Original. Immutable. Lives in .rodata.
// PRATIBIMBA = The Reflection. Mutable. Lives on the heap (arena).
#define BIMBA       const struct Holographic_Coordinate
#define PRATIBIMBA  struct Holographic_Coordinate

// Usage:
//   BIMBA Archetype_0 = { ... };           // immutable — .rodata
//   PRATIBIMBA* active_coord = arena_alloc(...);  // mutable — heap

// If any code attempts:
//   Archetype_0.raw_archetype = 3;  // COMPILE ERROR: assignment to read-only object
// The compiler halts. The Siva ground cannot be corrupted.
```

### B. Runtime Flags — LLM Reflection Layer Only

Runtime flags remain present for LLM agent introspection during reflection phases. They do not constitute enforcement — they are read-only annotations:

```c
// Runtime flags — for LLM/agent reflection queries ONLY
// These do NOT enforce immutability; compile-time macros above do that.
#define BIMBA_FLAG      (1 << 0)    // bit 0: coordinate is immutable original
#define IS_BIMBA(hc)    ((hc)->identity_flags & BIMBA_FLAG)
#define IS_PRATIBIMBA(hc) (!IS_BIMBA(hc))
```

### C. Bimba Ontology

#1-0 is a leaf node — it IS the law, not a structure containing sub-laws:

1. **Immutability as ontological priority:** The original is always `const`. What mutates is always a Pratibimba.
2. **`.rodata` as Bimba domain:** Every `static const` declaration is a Bimba instance.
3. **Self-reference:** Bimba points to itself (`C0.c → &C0`) — the source IS its own source.

**Memory Domain:** `.rodata` exclusively. A Bimba instance on the heap is a contradiction.

### D. Pratibimba Ontology

#1-1 is the complementary leaf to #1-0. Every Pratibimba MUST carry a pointer back to its Bimba source (enforced at `arena_alloc` time):

```c
// Every Pratibimba MUST satisfy at allocation:
//   arena_coord->bedrock_archetype != NULL
// This is the MIRROR_I_MAGIC_UNITY relation in C pointer form.
```

**Memory Domain:** Heap (arena) exclusively.

### Key Relations

- `ZERO_ONE_UNITY`: #1-0 <-> #1-1 (bidirectional non-dual pair)
- `BIMBA_PRATIBIMBA_UNITY` / `TOPOLOGICAL_POLARITY`: #1-0 -> #1-1
- `DEVELOPS_INTO`: #1-0 -> #1-1 (Bimba develops into its reflection on the Torus walk)
- `ARCHETYPAL_CORRESPONDENCE`: #1-0 -> #0-3-4 (corresponds to Rosetta Stone archetype)

---

## FR 2.1.1: #1-2 — Ananda (The Harmonic System)

**Requirement:** The C engine MUST implement the Ananda harmonic system as **six 12×12 `.rodata` matrices**, nibble-packed into exactly **72 bytes each**, plus six Digital Root Reflections forming a 12-element ring that instantiates the SU(2) double covering. The 10×10 archetypal core (digital roots 0–9) is embedded within the 12×12 topological extension (SU(2) shadow rows/cols 10–11).

**Ontological Ground:** #1-2 (Ananda — Bliss/Harmony), 6 matrix nodes (#1-2-0 through #1-2-5), 6 DR reflection nodes (#1-2-0-0 through #1-2-5-0).

### A. Matrix Geometry — 10×10 Core Inside 12×12 Extension

**Why 12×12, not 10×12:**

- **10×10 core (indices 0–9 × 0–9, 100 cells):** Pure Archetypal Digital Root core. Rows 0–9 = Vortex IDs (complete digital root space, culminating in Paramesvara at 9). Columns 0–9 = the same pure archetypal positions. This is the timeless, pre-topological harmonic.
- **12×12 extension (indices 0–11 × 0–11, 144 cells):** Topological reality. Rows/columns 10 and 11 are the SU(2) shadow extension — the exact mathematical locations where pure archetypes (0–9) stretch to accommodate implicate/shadow phases of the Torus walk. The 44 cells added beyond the 10×10 core are the **Transitional Harmonics**.

**Architectural rule:** The 10×10 core and 12×12 extension are never severed. Querying `get_ananda_harmonic(mat, 9, 9)` operates within the pure archetypal core. Querying `get_ananda_harmonic(mat, 11, 2)` natively steps into the SU(2) shadow extension. They share the same geometric fabric.

**Why not a separate 100-cell + 44-cell sidecar:** Fracturing the matrix destroys holographic containment. The shadow cells are not an addendum — they are the topology wearing the archetypes further.

### B. Nibble-Packing — 144 Cells into 72 Bytes

Digital root values (0–9) plus SU(2) extension values (10–11) require at most 4 bits each (11 = `0b1011`). Standard `uint8_t` is 8 bits, meaning two cells can be packed into every byte:

```
144 cells × 4 bits = 576 bits = 72 bytes
```

72 bytes leaves 56 bytes of space in a 128-byte L1 cache line for routing pointers and matrix metadata. All six Ananda matrices combined occupy 6 × 72 = **432 bytes** — a tiny fraction of the L1 cache.

```c
// ==============================================================================
// FR 2.1.1: THE 12x12 ANANDA MATRIX — NIBBLE-PACKED, 72 BYTES
// ==============================================================================
// The 10x10 Archetypal Core (indices 0-9 x 0-9) is embedded inside the
// 12x12 Topological Extension (indices 0-11 x 0-11).
// 144 cells x 4 bits per cell = 576 bits = 72 bytes exactly.
// Two cells share each byte: even-indexed cell in low nibble, odd in high nibble.

typedef struct {
    uint8_t packed_cells[72];   // 144 harmonic relationships, 4 bits each
} DR_Matrix_12x12;

// O(1) bitwise extraction — executed in a single CPU cycle
static inline uint8_t get_ananda_harmonic(
        const DR_Matrix_12x12* mat,
        uint8_t row_0_to_11,
        uint8_t col_0_to_11)
{
    // flat index into the 144-cell logical array
    uint8_t flat_index = (row_0_to_11 * 12) + col_0_to_11;

    // which byte holds this cell?
    uint8_t byte_val = mat->packed_cells[flat_index / 2];

    // even index -> low nibble (0x0F mask); odd index -> high nibble (>> 4)
    return (flat_index % 2 == 0) ? (byte_val & 0x0F) : (byte_val >> 4);
}
```

### C. The Six Matrix Operations

Each matrix is a 12×12 table with the same operational logic. Rows 0–9 are the classic Vortex IDs; rows 10–11 are the SU(2) shadow extensions.

| Matrix | Index | Operation | Formula | Ontological Role |
|--------|-------|-----------|---------|------------------|
| #1-2-0 | Bimba | `#X + 0` | `nX + 0` series | Original — the source pattern (implicate boundary) |
| #1-2-1 | Pratibimba | `#X + 1` | `nX + 1` series | Offset reflection (explicate) |
| #1-2-2 | Sum | `(#X+0) + (#X+1)` | Constructive synthesis | Additive harmony (explicate) |
| #1-2-3 | Difference A | `(#X+0) - (#X+1)` | Bimba minus Pratibimba | Polarity — descent (explicate) |
| #1-2-4 | Difference B | `(#X+1) - (#X+0)` | Pratibimba minus Bimba | Polarity — ascent (explicate) |
| #1-2-5 | Quintessence | `(#X+0/1) +/- (#X+0/1)` | Non-dual combination | Paradox resolution (implicate boundary) |

**4+2 Implicate/Explicate Layout:** Matrices 0 and 5 are implicate (boundary positions — source and paradox). Matrices 1–4 are explicate (active transformations). The implicates are the mirrored boundaries; the explicates are the active space between them.

### D. The Six Ananda Variants in .rodata

All six matrices MUST exist as compile-time `.rodata` constants. Combined: 6 × 72 = **432 bytes**.

```c
// The six Ananda matrices — all .rodata (BIMBA)
// Each is a DR_Matrix_12x12 (72 bytes, nibble-packed)
static const DR_Matrix_12x12 ANANDA_BIMBA;         // #X+0 — Original source
static const DR_Matrix_12x12 ANANDA_PRATIBIMBA;    // #X+1 — Offset reflection
static const DR_Matrix_12x12 ANANDA_SUM;           // (#X+0)+(#X+1) — Synthesis
static const DR_Matrix_12x12 ANANDA_DIFF_A;        // (#X+0)-(#X+1) — Descent polarity
static const DR_Matrix_12x12 ANANDA_DIFF_B;        // (#X+1)-(#X+0) — Ascent polarity
static const DR_Matrix_12x12 ANANDA_QUINTESSENCE;  // +/- non-dual — Paradox resolution

// Matrix operation enum (matches 4+2 implicate/explicate layout)
typedef enum {
    MATRIX_BIMBA        = 0,    // Implicate boundary (source)
    MATRIX_PRATIBIMBA   = 1,    // Explicate
    MATRIX_SUM          = 2,    // Explicate
    MATRIX_DIFF_A       = 3,    // Explicate
    MATRIX_DIFF_B       = 4,    // Explicate
    MATRIX_QUINTESSENCE = 5,    // Implicate boundary (paradox)
} Ananda_Matrix_Op;
```

### E. The Digital Root Matrices — Reference Data (10×10 Archetypal Core)

The digi-rooted Bimba (#X+0) matrix for the pure archetypal core (rows 0–9, columns 0–9):

```
Position:  0  1  2  3  4  5  6  7  8  9
0X + 0:    0  0  0  0  0  0  0  0  0  0
1X + 0:    0  1  2  3  4  5  6  7  8  9
2X + 0:    0  2  4  6  8  1  3  5  7  9
3X + 0:    0  3  6  9  3  6  9  3  6  9
4X + 0:    0  4  8  3  7  2  6  1  5  9
5X + 0:    0  5  1  6  2  7  3  8  4  9
6X + 0:    0  6  3  9  6  3  9  6  3  9
7X + 0:    0  7  5  3  1  8  6  4  2  9
8X + 0:    0  8  7  6  5  4  3  2  1  9
9X + 0:    0  9  9  9  9  9  9  9  9  9
```

Columns 10–11 of the full 12×12 matrix extend this by continuing the mod-12 position cycle (positions 10 and 11 repeat the digital root pattern of positions 1 and 2 respectively).

**Structural observations:**
- Column 9 is always `9` for Bimba (except 0X) — the Paramesvara wholeness constant
- The **3-6-9 axis** (rows 3X, 6X, 9X) cycles through {3, 6, 9} exclusively
- The **doubling ring** {1, 2, 4, 8, 7, 5} appears in non-3-6-9 rows — the Mahamaya track
- Rows/columns 10–11 in the 12×12 extension are the SU(2) Transitional Harmonics

### F. The Two DR Rings (Dual-Track Architecture)

| Ring | Elements | Track | Domain | Ring Size |
|------|----------|-------|--------|-----------|
| **Mahamaya (doubling)** | {1, 2, 4, 8, 7, 5} | 64-bit | M3 word processing | 6 |
| **Parashakti (tripling)** | {3, 6, 9, 3, 6, 9} | 72-bit | M2 vibrational | 6 (via repetition of 3-element base) |

```c
static const uint8_t DR_RING_MAHAMAYA[6]   = {1, 2, 4, 8, 7, 5};  // doubling
static const uint8_t DR_RING_PARASHAKTI[6] = {3, 6, 9, 3, 6, 9};  // tripling (repeated)
```

### G. Digital Root Reflections — The 12-Element Ring

Each matrix (#1-2-N) has a DR Reflection (#1-2-N-0) — the "archetypal soul" of that matrix. The `INFINITY_LOOP_WEAVING` relation between #1-2-0-0 and #1-2-1-0 creates a lemniscate bridge between the Bimba and Pratibimba reflections.

6 matrices + 6 DR reflections = **12-element ring**, instantiating the SU(2) double covering from #1-5-2. Ring size 12 = 6 × 2 is not arbitrary — it is the Ananda system physically realized.

```c
#define ANANDA_RING_SIZE 12
// Indexed 0-5  = matrices (ANANDA_BIMBA through ANANDA_QUINTESSENCE)
// Indexed 6-11 = their DR reflections
// INFINITY_LOOP_WEAVING: ring[6] <-> ring[7] (Bimba DR <-> Pratibimba DR lemniscate)
```

### H. Key Structural Numbers from the CSV

| Number | Source | Significance |
|--------|--------|-------------|
| **8844** | Sum of all `(X+0)+(X+1)` digi-rooted = 12 × 737 | "Root of Doubling Motif" — total harmonic energy |
| **4140** | Sum of digi-rooted differences | Bell number B₈ — partitions of 8-element set |
| **72** | Position 9 of 8X+0 row (8×9=72) | Epogdoon compression (M2's 72-space); also nibble-packed matrix byte count |
| **360** | Sum of 8X+0 raw row | Cosmic time cycle |
| **2125** | Sum of raw #X+1 matrix | 25th nonagonal number |

### Key Relations

- `CONTAINS_ANANDA_COMPONENT` (6): #1-2 -> #1-2-{0..5}
- `HAS_DIGITAL_ROOT_REFLECTION` (6): each #1-2-N -> #1-2-N-0
- `INFINITY_LOOP_WEAVING`: #1-2-0-0 <-> #1-2-1-0 (lemniscate bridge)
- `CORRESPONDS_TO_MATRIX`: #1-3-0 -> #1-2-0, #1-3-1 -> #1-2-1, #1-3-3 -> #1-2-5
- `UNIFIED_ENGINE_WITH` / `COMPLEMENTS_AS_MOBIUS_TORUS`: #1-2 <-> #1-3
- `DEVELOPS_INTO`: #1-2 -> #1-3

---

## FR 2.1.2: #1-3 — Spanda (The Dynamic Intelligence Engine)

**Requirement:** The C engine MUST implement the Spanda engine as a 6-stage topological concrescence state machine with explicit formulation-driven transitions, dual-track generation (Mahamaya/Parashakti), and a typed `Spanda_Mutator` function pointer array of exactly 6 elements connecting each Spanda sub-stage to its corresponding QL stage via direct mutation of the active `PRATIBIMBA*` coordinate.

**Ontological Ground:** #1-3 (Spanda — Dynamic Intelligence Engine), 6 stages (#1-3-0 through #1-3-5), 6 nested sub-stages under #1-3-4.

### A. Spanda_Mutator — The Typed Compiler Pass

**Previous approach (insufficient):** `typedef uint32_t (*Spanda_Generator)(uint8_t cf_substage)` — returned generic integers. Spanda is a compiler, not a calculator; its output is a mutated coordinate, not a raw value.

**Revised approach:** The Spanda function pointer takes a `PRATIBIMBA*` directly, physically mutating the active memory space during the Logos FSM execution cycle. This is the formal representation of Spanda puncturing the Genus-0 sphere into Genus-1.

```c
// ==============================================================================
// FR 2.1.2: SPANDA_MUTATOR — Typed Function Pointer for Compiler Passes
// ==============================================================================

// Spanda actively mutates the PRATIBIMBA during the Logos FSM.
// It does not return a value — it transforms the coordinate in place.
typedef void (*Spanda_Mutator)(PRATIBIMBA* target_coordinate);

// The six compiler passes — in .rodata order matching Spanda stages 0-5
static const Spanda_Mutator SPANDA_COMPILER_PASSES[6] = {
    spanda_seed_init,           // Stage 0: Allocates Genus-0 sphere (sets 0x03 both-bits state)
    spanda_puncture_pole_a,     // Stage 1: Sets 0x01 — Original Pole (Mahamaya track generator)
    spanda_puncture_pole_b,     // Stage 2: Sets 0x02 — Reflection Pole (Parashakti track generator)
    spanda_trika_synthesis,     // Stage 3: Achieves Genus-1 — first stable torus
    spanda_contextual_flowering,// Stage 4: 6 CF sub-stages; PROVIDES_GENERATIVE_LOGIC_FOR #1-4
    spanda_meta_reflection      // Stage 5: Fold-count sieve; validates against VALID_FOLDS[14]
};
```

### B. The Spanda Concrescence

**Master Formulation:**
```
Genus-0 sphere (0/1) → creative puncture → inversion (1/0) →
tensional field (0/1)+(1/0) → Trika synthesis ((0/1)/(1/0)) = (0/1/2) →
toroidal structure [0/0, ((0/1)/(1/0)), {T1}, {T2}, sum, 1/1] →
percentile identity (1)
```

This formulation IS the state machine's transition table:

| Stage | Coord | Name | Formulation | State | Track Generation |
|-------|-------|------|-------------|-------|-----------------|
| 0 | #1-3-0 | Seed | `(0/1)` as unified oscillatory element | `0x03` | — |
| 1 | #1-3-1 | Original Pole | `(0/1)` pole of fundamental tension | `0x01` | `GENERATES_MAHAMAYA_TRACK` |
| 2 | #1-3-2 | Reflection Pole | `(1/0)` pole of fundamental tension | `0x02` | `GENERATES_PARASHAKTI_TRACK` |
| 3 | #1-3-3 | Trika Synthesis | `((0/1)/(1/0)) = (0/1/2)` — first stable torus | Trika enum | — |
| 4 | #1-3-4 | Contextual Flowering | 6 nested CF sub-stages (generates QL) | CF array | `PROVIDES_GENERATIVE_LOGIC_FOR` → #1-4 |
| 5 | #1-3-5 | Meta-Reflection | Fold-count sieve: {0,1,2,3,4,5,6,8,9,10,12,16,18,24} | LUT[14] | — |

### C. Spanda State Machine Struct

```c
// Spanda stage enum
typedef enum {
    SPANDA_SEED      = 0,
    SPANDA_POLE_A    = 1,   // Original (Mahamaya track generator)
    SPANDA_POLE_B    = 2,   // Reflection (Parashakti track generator)
    SPANDA_TRIKA     = 3,   // First stable torus (odd-cardinality singularity)
    SPANDA_FLOWERING = 4,   // 6 CF sub-stages (generator of QL)
    SPANDA_META      = 5,   // Fold-count sieve
} Spanda_Stage;

// Spanda state machine
typedef struct {
    Spanda_Stage stage;
    uint8_t      state_bits;    // 2-bit field: pole_a | pole_b
    uint8_t      track;         // 0=Mahamaya, 1=Parashakti
    uint8_t      cf_substage;   // 0-5 within Flowering stage
} Spanda_Engine;
```

### D. The Trika (#1-3-3) — Odd-Cardinality Singularity

Cardinality 3 is odd → position 0 is a fused 0/1 singularity (not "the first of three"):

```c
typedef enum {
    TRIKA_GROUND   = 0,  // Fused (0/1)/(1/0) — the non-dual synthesis itself
    TRIKA_FORM     = 1,  // First differentiated position
    TRIKA_MEDIATOR = 2,  // Relational bridge
} Trika_Position;
// Position 0 is the collapse of the binary, not a member of a sequence.
```

### E. The Contextual Flowering (#1-3-4) — Generator of QL

The 6 sub-stages under #1-3-4 use progressively deeper context frame notation, matching CLAUDE.md's CF table. Each `PROVIDES_GENERATIVE_LOGIC_FOR` the corresponding QL stage:

| Sub-Stage | CF Notation | Mod | Formulation | Generates |
|-----------|-------------|-----|-------------|-----------|
| #1-3-4.0000 | (0000) | % | `{0/0, 0/1, 1/0, 1/1}` — Boolean lattice | → #1-4.0 |
| #1-3-4.0/1 | (0/1) | 2 | Non-dual transition graph | → #1-4.1 |
| #1-3-4.0/1/2 | (0/1/2) | 3 | Extended with hybrid interpolated states | → #1-4.2 |
| #1-3-4.0/1/2/3 | (0/1/2/3) | 4 | Dual-track parallel with T1/T2 interference | → #1-4.3 |
| #1-3-4.4.0-4.4/5 | (4.0-4.4/5) | 4/6 | Flowering synthesis | → #1-4.4 |
| #1-3-4.5/0 | (5/0) | 6 | Transcendent integration (Möbius) | → #1-4.5 |

### F. The Fold-Count Sieve (#1-3-5)

14 valid fold-counts = the divisors of 72 that are ≤ 24, plus 0:

```c
static const uint8_t VALID_FOLDS[14] = {0,1,2,3,4,5,6,8,9,10,12,16,18,24};
#define VALID_FOLD_COUNT 14

static inline bool is_valid_fold(uint8_t n) {
    for (int i = 0; i < VALID_FOLD_COUNT; i++)
        if (VALID_FOLDS[i] == n) return true;
    return false;
}
```

### Key Relations

- `CONTAINS_SPANDA_STAGE` (6): #1-3 -> #1-3-{0..5}
- `HAS_NESTED_STAGE` (6): #1-3-4 -> 6 CF sub-stages
- `PROVIDES_GENERATIVE_LOGIC_FOR` (6): #1-3-4.* -> #1-4.* (the decisive coupling)
- `GENERATES_MAHAMAYA_TRACK`: #1-3-1 -> #1-3-2
- `GENERATES_PARASHAKTI_TRACK`: #1-3-2 -> #1-3-3
- `UNIFIED_ENGINE_WITH`: #1-3 <-> #1-2 (Spanda and Ananda are one engine)
- `DEVELOPS_INTO`: #1-3 -> #1-4

---

## FR 2.1.3: SU(2) Double Cover Ring Arithmetic

**Requirement:** All Torus traversal logic MUST use a 12-state integer ring (0–11) where states 0–5 are Explicate/Day phase and states 6–11 are Implicate/Night phase. Float `M_PI` arithmetic is BANNED from the traversal hot path. Ring arithmetic MUST be expressed via the three macros below, ensuring the FSM natively tracks 720° spinorial state without floating-point overhead.

**Ontological Ground:** #1-5-2 (The 4π=720° Toroidal Cycle), #1-4.3 (Bidirectional synthesis, `RING_SIZE=12`).

### The Problem with mod-6 Alone

Standard `pos % 6` causes the system to "forget" whether it is in the first 360° (Explicate/Day) or the second 360° (Implicate/Night/Shadow). Two traversals that land on the same 0–5 position are structurally different if one is ascending and the other is descending — the SU(2) double cover mandates this distinction be preserved.

### The Solution — 12-State Integer Ring

```c
// ==============================================================================
// FR 2.1.3: SU(2) DOUBLE COVER RING ARITHMETIC
// ==============================================================================
// 12-state ring: 0-5 = Explicate (first 360°), 6-11 = Implicate (second 360°)
// No float M_PI on the traversal hot path. All arithmetic is integer/bitwise.

// Safely wrap any position value into the 0-11 ring
#define RING_WRAP(pos)         ((pos) % 12)

// True if the traversal is in the Implicate/Night/Shadow phase (second 360°)
#define IS_SHADOW_PHASE(pos)   ((pos) >= 6)

// Returns the underlying 0-5 QL archetype regardless of which 360° cycle we are in
#define GET_BASE_QL_POS(pos)   ((pos) % 6)
```

### Usage Mandate

Every function that advances a coordinate along the Torus MUST use these macros:

```c
// Correct — preserves shadow phase information:
uint8_t next_pos = RING_WRAP(current_pos + 1);
bool    in_shadow = IS_SHADOW_PHASE(next_pos);
uint8_t base_arch = GET_BASE_QL_POS(next_pos);

// FORBIDDEN — loses shadow phase information:
// uint8_t next_pos = (current_pos + 1) % 6;  // shadows 6-11 invisible
// float   angle    = next_pos * M_PI / 3.0;  // float on hot path
```

### Alignment with Existing Ring Constants

```c
#define RING_SIZE           12    // Full SU(2) double-cover ring (from FR 2.1.4 Stage 3)
#define RING_HALF            6    // One 360° cycle
#define RING_MOD(i)         RING_WRAP(i)   // alias
```

---

## FR 2.1.4: M5 Logos Cycle FSM — Single-Byte Branchless State

**Requirement:** The M5 Logos Cycle finite state machine MUST represent its entire state as a **single `uint8_t`** (the `pipeline_tick`, values 0–11). Stage identity and traversal direction MUST be computed branchlessly from this single byte using inline functions. No separate `ascending` boolean field, no separate `stage` field, no separate `pipeline_position` field.

**Ontological Ground:** The 12-stage SU(2) double-cover is a perfect bitwise sequence. Packing it into one byte eliminates CPU branch mispredictions on the FSM hot path.

### The Single-Byte FSM

```c
// ==============================================================================
// FR 2.1.4: M5_LOGOS_CYCLE FSM — 1-BYTE STATE, BRANCHLESS COMPUTATION
// ==============================================================================

// LogosStage = the semantic stage name (0-5), derived from pipeline_tick
typedef uint8_t LogosStage;

// The entire FSM state fits in one byte
typedef struct {
    uint8_t pipeline_tick;  // 0 to 11 — the 12-fold Torus rhythm
} M5_Logos_Cycle;

// Is the FSM currently ascending (0-5) or descending (6-11)?
static inline bool is_ascending(uint8_t tick) {
    return tick < 6;    // 0-5 = ascending (Explicate), 6-11 = descending (Implicate)
}

// Branchless stage computation — no if/else on the hot path
// tick 0 -> stage 0 (ascending)
// tick 5 -> stage 5 (ascending)
// tick 6 -> stage 5 (descending: 11-6 = 5)
// tick 7 -> stage 4 (descending: 11-7 = 4)
// tick 11 -> stage 0 (descending: 11-11 = 0) — the Möbius return moment
static inline LogosStage get_current_stage(uint8_t tick) {
    return is_ascending(tick) ? tick : (11 - tick);
}
```

### Design Rationale

**Previous approach (insufficient):** Separate `stage`, `ascending`, and `pipeline_position` fields — three variables that must be kept in sync, with branch-prediction overhead on every FSM advance.

**Revised approach:** One byte, two inline functions. The CPU computes `is_ascending` with a single comparison instruction. `get_current_stage` uses a conditional expression that modern compilers reduce to `CMOV` (conditional move) — a single branch-free instruction.

The Möbius return occurs at `tick == 11`: `get_current_stage(11) = 11 - 11 = 0` — the FSM arrives back at stage 0 (ground) after completing the full 720° double-cover cycle. Advancing by `RING_WRAP(tick + 1)` after tick 11 yields tick 0, completing the loop.

### Integration with FR 2.1.3 Macros

```c
// Advancing the Logos FSM one step
static inline void logos_advance(M5_Logos_Cycle* cycle) {
    cycle->pipeline_tick = (uint8_t)RING_WRAP(cycle->pipeline_tick + 1);
    // Call the appropriate Spanda pass for the new tick:
    uint8_t stage = get_current_stage(cycle->pipeline_tick);
    // SPANDA_COMPILER_PASSES[stage] receives the active PRATIBIMBA* coordinate
}
```

---

## FR 2.1.5: #1-4 — QL Flowering (The #define Cascade)

**Requirement:** The C engine MUST implement the QL Flowering as a 6-stage `#define` derivation cascade generating ALL system cardinalities from the foundational 16:9 ratio. No magic numbers — every constant must trace back to this cascade. The `RECURSIVE_RETURN` relation (#1-4.5 -> #1-4.0) closes the mod-6 ring.

**Ontological Ground:** #1-4 (Quaternal Logic Flowering), 6 stages (#1-4.0 through #1-4.5).

### A. The Master Derivation Chain

```
100% → 64/36 → 16/9 → 4²/3² →
  [4.0: (4×4)+(3²×2)] →
  [4.1: -(4+2)] →
  [4.2: +/-(6+6)] →
  [4.3: (8)(10)] →
  [4.4: (16)×(36)×(60/360)] →
  [4.5: MapCompassLensWhy] → (.)
```

| Stage | Coord | Name | Formulation | Constants Produced |
|-------|-------|------|-------------|-------------------|
| 0 | #1-4.0 | Foundational Encoding | `16/9 = 4²/3²` → {4-Fold Explicate} + {6-Fold Processual} | `QL_EXPLICATE=4`, `QL_PROCESSUAL=6`, `QL_RATIO_NUM=16`, `QL_RATIO_DEN=9` |
| 1 | #1-4.1 | Explicate-Implicate | Explicate 1–4 + Implicate 0–5 | `EXPLICATE_COUNT=4`, `PROCESSUAL_COUNT=6`, total=10 |
| 2 | #1-4.2 | Inversion Principle | `-(6-Fold) → [0↔5, 1↔4, 2↔3]` shadow descent | `INVERT[6]={5,4,3,2,1,0}`, `RING_HALF=6` |
| 3 | #1-4.3 | Bi-Directional Synthesis | `+/-(6-Fold) → 12-Fold recursive loop` | `RING_SIZE=12`, bidirectional traversal |
| 4 | #1-4.4 | Contextual Flowering | `(.) → {8-Fold} + {10-Fold} + {7,9-Fold variants}` | Mixed cardinalities (7,8,9,10), nesting operator |
| 5 | #1-4.5 | Harmonic Meta-Frames | `4²→16→64 + 6²→36→72 + 6×10→60→360` | `M3_WORD=64`, `M2_TATTVA=36`, `M2_NAMES=72`, `COSMIC_TIME=360` |

### B. The Complete Constant Table

```c
// ===== Generated by QL Flowering — NO MAGIC NUMBERS =====

// Stage 0: Foundational ratio
#define QL_EXPLICATE     4    // 4-fold: What, How, Which/Who, When/Where
#define QL_PROCESSUAL    6    // 6-fold: Why-Source through Why-Synthesis
#define QL_RATIO_NUM    16    // 4² — explicate squared
#define QL_RATIO_DEN     9    // 3² — trika squared

// Stage 1: Frame dimensions
#define FRAME_EXPLICATE  4    // positions 1-4
#define FRAME_PROCESSUAL 6    // positions 0-5
#define FRAME_TOTAL     10    // 4 + 6

// Stage 2: Inversion
static const uint8_t QL_INVERT[6] = {5, 4, 3, 2, 1, 0};
#define RING_HALF        6

// Stage 3: Bidirectional — aligns with FR 2.1.3 ring macros
#define RING_SIZE       12    // 6 × 2 (ascent + descent)
#define RING_MOD(i)     ((i) % RING_SIZE)

// Stage 4: Nesting variants
#define VARIANT_7        7    // odd: 0/1 + 2-7
#define VARIANT_8        8    // even: 0-7
#define VARIANT_9        9    // odd: 0/1 + 2-9 (= Paramesvara)
#define VARIANT_10      10    // even: 0-9

// Stage 5: Downstream cardinalities
#define M3_WORD         64    // 4² × 4 = Mahamaya 64-bit word
#define M2_TATTVA       36    // 6² = 36 Tattvas
#define M2_NAMES        72    // 36 × 2 = 72 (Epogdoon: double covering of Tattvas)
#define COSMIC_TIME    360    // 6 × 10 × 6 = 360-degree cycle
#define M2_DECANS       72    // = M2_NAMES (72 Decans)
```

### C. The QL Cycle (mod-6 ring)

```c
typedef struct {
    uint8_t stage;           // 0-5
    const char* name;        // for Obsidian/human rendering only — never used on hot path
    const char* formulation; // same
    uint8_t next;            // (stage + 1) % 6
    uint8_t inverse;         // QL_INVERT[stage]
} QL_Stage;

static const QL_Stage QL_FLOWERING[6];  // .rodata, mod-6 ring
```

### D. Stage 4 — Odd-Cardinality Variants

The 7-fold and 9-fold variants within #1-4.4 require singularity handling:
- **7-fold:** Position 0 = fused 0/1 anchor (fossilized/static); positions 2–7 count onward.
- **9-fold:** Position 0 = dynamic processual ground (same asymmetric layout as Paramesvara #0-2-9).

### Key Relations

- `CONTAINS_LOGIC_STAGE` (6): #1-4 -> #1-4.{0..5}
- `DIFFERENTIATES_INTO` → ... → `RECURSIVE_RETURN`: complete mod-6 cycle
- `PROVIDES_GENERATIVE_LOGIC_FOR` (6, incoming): from #1-3-4.* sub-stages
- `DEVELOPS_INTO`: #1-4 -> #1-5

---

## FR 2.1.6: #1-5 — Toroidal Recognition (The Topological Proof)

**Requirement:** The C engine MUST implement the Toroidal Recognition as the formal mathematical foundation establishing WHY the system has exactly 6 positions (4g+2g=6 for genus g=1), WHY double-covering requires 720°=4π (two independent 2π generators), and HOW quaternionic algebra parametrizes the torus.

**Ontological Ground:** #1-5 (Toroidal Recognition), 6 stages (#1-5-0 through #1-5-5).

### A. The Six-Stage Recognition

| Stage | Coord | Name | Core Contribution |
|-------|-------|------|-------------------|
| 0 | #1-5-0 | Toroidal-Quaternionic Ground | i²=j²=k²=ijk=-1 as torus formalism; i=meridian, j=longitude, k=interaction |
| 1 | #1-5-1 | The Torus in Quaternionic Space | T²=S¹×S¹ explicit construction; A=4π²Rr; parametric embedding in R³ |
| 2 | #1-5-2 | The 4π=720° Toroidal Cycle | π₁(T²)=Z⊕Z; two independent 2π generators; SU(2) double-covering → `RING_SIZE=12` |
| 3 | #1-5-3 | Shadow as Phase-Shift | Opposition = π phase difference: e^(i(θ+π)) = -e^(iθ) |
| 4 | #1-5-4 | The Torus Generating Parashakti | 36×2=72 from genus-1 double covering; rotational→vibrational bridge to M2 |
| 5 | #1-5-5 | Recognition of Toroidal Necessity | **4g+2g=6** for g=1; necessity proof (see below) |

### B. The Necessity Proof (WHY 6 Positions)

**4g + 2g = 6** for genus g=1 from the fundamental polygon of the torus:

- **g=0 (Sphere):** π₁(S²) = {1} — trivial, no non-contractible loops, no self-reference. Fails.
- **g=1 (Torus):** π₁(T²) = Z⊕Z — abelian, two independent generators (ab=ba). χ=0 (perfect balance). Self-reference without infinite regress. **Success.**
- **g≥2 (Higher genus):** π₁ is non-abelian (ab≠ba) — hierarchical conflicts. Fails.

### C. C Architecture

```c
// Quaternion struct — torus parametrization formalism
typedef struct {
    float w;  // real part (scalar)
    float x;  // i component (meridian generator)
    float y;  // j component (longitude generator)
    float z;  // k component (interaction: ij=k)
} Quaternion;

static inline float quat_norm_sq(const Quaternion* q) {
    return q->w*q->w + q->x*q->x + q->y*q->y + q->z*q->z;
}

// Topological constants — derived from genus-1 necessity
// Note: M_PI is used here for .rodata constant derivation ONLY, not on the traversal hot path.
// Hot-path SU(2) arithmetic uses the integer ring macros from FR 2.1.3.
#define TORUS_GENUS              1
#define QL_POSITIONS             (4 * TORUS_GENUS + 2 * TORUS_GENUS)   // = 6
#define EULER_CHARACTERISTIC     (2 - 2 * TORUS_GENUS)                 // = 0
#define DOUBLE_COVER_STEPS       (2 * QL_POSITIONS)                    // = 12 = RING_SIZE
#define PARASHAKTI_TOTAL         (M2_TATTVA * 2)                       // 36 × 2 = 72
```

### Key Relations

- `HAS_INTERNAL_COMPONENT` (6): #1-5 -> #1-5-{0..5}
- `LEADS_TO` (5): #1-5-0 → ... → #1-5-5
- `COMPLETES_CYCLE`: #1-5-4 -> #1-0
- `RETURNS_TO`: #1-5 -> #1-0 (top-level Möbius return)
- `BRIDGES_TO`: #1-5-4 -> #2-0 (cross-branch to Parashakti)
- `PROVIDES_SPINOR_FOUNDATION`: #1-5 -> #3

---

## Cross-Branch Interface Summary

### Exports (what M1 provides to downstream subsystems)

| Target | Relation | What M1 Provides |
|--------|----------|-----------------|
| **#2 (Parashakti)** | `PROVIDES_FOUNDATION`, `BRIDGES_TO` | 36×2=72 architecture, DR rings, Epogdoon constants |
| **#3 (Mahamaya)** | `PROVIDES_SPINOR_FOUNDATION` | 64-bit word size, Quaternion struct, SU(2) double-cover |
| **#4 (Nara)** | `ENABLES_QUANTUM_SEARCH` | QL stage definitions, mod-6 ring |
| **#5 (Epii)** | `ESTABLISHES_FRACTAL_RECURSION` | Recursive return mechanism, Möbius loop, `M5_Logos_Cycle` FSM |

### Imports (what M1 inherits from upstream)

| Source | Relation | What M1 Receives |
|--------|----------|-----------------|
| **#0 (Anuttara)** | `INHERITS_MIRROR_STRUCTURE` | Mirror apparatus (#0-3-0/1), void ground (#0-0) |
| **#0 (Anuttara)** | `MANIFESTS_ZERO_LOGIC` | O# frame (#0-4.0/1) as the Zero Logic foundation |
| **#0 (Anuttara)** | `EMBODIES_ARCHETYPE` (4) | Spanda stages embody Archetypes: seed→Rosetta, trika→Vak, flowering→Purnata, meta→Dynamic Harmony |

### Deferred

Cross-branch edges to #0-4 (QL frames), #0-3 (Archetypal Numbers), and #2-* (Parashakti internals) — approximately 47 edges total. These belong to the respective target branch's FR.

---

## Memory Budget Summary

| Item | Size | Location |
|------|------|----------|
| `DR_Matrix_12x12` (one Ananda matrix) | 72 bytes | `.rodata` |
| Six Ananda matrices combined | 432 bytes | `.rodata` |
| `VALID_FOLDS[14]` | 14 bytes | `.rodata` |
| `DR_RING_MAHAMAYA[6]` + `DR_RING_PARASHAKTI[6]` | 12 bytes | `.rodata` |
| `QL_FLOWERING[6]` (QL_Stage array) | ~48 bytes (indices only; strings excluded from hot path) | `.rodata` |
| `M5_Logos_Cycle` struct | 1 byte | heap / stack |
| `SPANDA_COMPILER_PASSES[6]` (function pointer array) | 48 bytes (6 × 8-byte pointers) | `.rodata` |
| `Quaternion` struct | 16 bytes | stack (computation only) |

**Cache-line alignment note:** A single `DR_Matrix_12x12` (72 bytes) fits within two 64-byte cache lines alongside 56 bytes of metadata — the CPU inhales one full Ananda matrix in two L1 cache reads.

---

## Operational Flow: The M1 Internal Torus

```
#1-0 (Bimba: const law — compile-time BIMBA macro, .rodata domain)
  ↓ DEVELOPS_INTO
#1-1 (Pratibimba: mutable law — compile-time PRATIBIMBA macro, heap domain)
  ↓ DEVELOPS_INTO
#1-2 (Ananda: 6 × DR_Matrix_12x12 nibble-packed + 12-element DR ring)
  ↓ DEVELOPS_INTO + UNIFIED_ENGINE_WITH #1-3
#1-3 (Spanda: 6-stage state machine, Spanda_Mutator[6] compiler passes)
  ↓ PROVIDES_GENERATIVE_LOGIC_FOR (×6)
#1-4 (QL Flowering: #define cascade, mod-6 ring, RING_SIZE=12)
  ↓ DEVELOPS_INTO
#1-5 (Toroidal Recognition: 4g+2g=6, 720°=4π, SU(2) necessity proof)
  ↓ RETURNS_TO + COMPLETES_CYCLE
#1-0 (Möbius return — ground now carries the mathematical DNA)
```

**The Spanda-QL Coupling:** The break between #1-3 and #1-4 is not developmental (`DEVELOPS_INTO`) but **generative** (`PROVIDES_GENERATIVE_LOGIC_FOR`). Spanda doesn't evolve into QL — Spanda *compiles* QL using `SPANDA_COMPILER_PASSES[6]` acting on `PRATIBIMBA*` coordinates.

**The Ananda-Spanda Unity:** `UNIFIED_ENGINE_WITH` makes these two branches a single engine — Ananda provides the harmonic substrate (six nibble-packed matrices), Spanda provides the dynamic animation (six mutator passes). Together they produce the complete numerical vocabulary of the system.

**The SU(2) Thread:** `RING_SIZE=12` (from FR 2.1.4 Stage 3) → `RING_WRAP` / `IS_SHADOW_PHASE` / `GET_BASE_QL_POS` macros (FR 2.1.3) → `pipeline_tick` in `M5_Logos_Cycle` (FR 2.1.4) → the 12×12 Ananda matrix extension (FR 2.1.1) — all four FRs are expressions of the same underlying SU(2) double-cover topology proven necessary in FR 2.1.6.

---

*"No arbitrary numbers. Every constant traces back to 16/9."*

*Document Version:* 2.0
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/`
*Replaces:* M1-paramasiva-mathematical-dna.md v1 (2026-03-03)
*Related Specifications:* CLAUDE.md, M0-anuttara-language-architecture.md, M2-parashakti-vibrational-architecture.md

---

## SPEC PATCH — Cross-M Harmonisation (2026-03-05)

**Source:** Cross-M Harmonisation Agent — Task #7
**Gaps Addressed:** FR 2.1.7 through FR 2.1.12 from M1 dataset review

---

### FR 2.1.7: PT Realization Look-Up Table

**Requirement:** The C engine MUST provide a `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` array encoding the number of topological elements at each of the 12 SU(2) ring positions. This LUT formalises the `topologicalElementCount` property observed in the dataset for Ananda matrix positions.

**Gap addressed:** Missing `topologicalElementCount` LUT for positions 0-11.

```c
// ==============================================================================
// FR 2.1.7: TOPOLOGICAL ELEMENT COUNT LUT
// ==============================================================================
// Maps each of the 12 SU(2) ring positions to the count of topological elements
// at that position. Source: dataset `topologicalElementCount` property.
// Sequence {1,2,2,3,4,5,8,10,12,6,7,11} encodes the Euler characteristic
// expansion across the double-cover (positions 0-5 Explicate, 6-11 Implicate).

static const uint8_t TOPOLOGICAL_ELEMENT_COUNT_LUT[12] = {
    1, 2, 2, 3, 4, 5,    // Explicate phase (positions 0-5)
    8, 10, 12, 6, 7, 11  // Implicate phase (positions 6-11)
};

// Accessor — takes a RING_WRAP'd position (0-11)
static inline uint8_t get_topological_element_count(uint8_t ring_pos) {
    return TOPOLOGICAL_ELEMENT_COUNT_LUT[RING_WRAP(ring_pos)];
}

_Static_assert(sizeof(TOPOLOGICAL_ELEMENT_COUNT_LUT) == 12,
    "TOPOLOGICAL_ELEMENT_COUNT_LUT must have exactly 12 entries");
```

---

### FR 2.1.8: QL Category Enum and Operator Types Bitmask

**Requirement:** The C engine MUST define a 7-value `M1_QL_Category` enum and a `M1_QL_Operator_Types` 3-bit bitmask encoding which operator classes (unary, binary, relational) are active at each QL stage.

**Gap addressed:** Missing `qlCategory` 7-value enum and `qlOperatorTypes` 3-bit bitmask for M1 nodes.

```c
// ==============================================================================
// FR 2.1.8: M1 QL CATEGORY AND OPERATOR TYPES
// ==============================================================================

// 7-value QL category for M1 nodes (extends M0's 3-value enum)
typedef enum : uint8_t {
    M1_QL_CAT_IMPLICATE            = 0,  // Pure implicate (Bimba / #1-0)
    M1_QL_CAT_IMPLICATE_EXPLICATE  = 1,  // Transition (Pratibimba / #1-1)
    M1_QL_CAT_EXPLICATE_1          = 2,  // 1st explicate (Ananda bimba matrix)
    M1_QL_CAT_EXPLICATE_2          = 3,  // 2nd explicate (Ananda pratibimba)
    M1_QL_CAT_EXPLICATE_3          = 4,  // 3rd explicate (Ananda sum/diff)
    M1_QL_CAT_EXPLICATE_4          = 5,  // 4th explicate (Spanda contextual)
    M1_QL_CAT_IMPLICATE_BOUNDARY   = 6,  // Implicate boundary (Quintessence / Toroidal)
} M1_QL_Category;

// 3-bit operator types bitmask — which operator classes are active
#define M1_OP_UNARY     (1u << 0)  // unary operators applicable at this position
#define M1_OP_BINARY    (1u << 1)  // binary operators applicable
#define M1_OP_RELATIONAL (1u << 2) // relational operators applicable

// Category assignments for M1 sub-branches
static const M1_QL_Category M1_BRANCH_QL_CATEGORY[6] = {
    M1_QL_CAT_IMPLICATE,           // #1-0 Bimba
    M1_QL_CAT_IMPLICATE_EXPLICATE, // #1-1 Pratibimba
    M1_QL_CAT_EXPLICATE_1,         // #1-2 Ananda
    M1_QL_CAT_EXPLICATE_2,         // #1-3 Spanda
    M1_QL_CAT_EXPLICATE_3,         // #1-4 QL Flowering
    M1_QL_CAT_IMPLICATE_BOUNDARY,  // #1-5 Toroidal
};
```

---

### FR 2.1.9: Constant Matrix Optimization (ANANDA_DIFF_A / ANANDA_DIFF_B)

**Requirement:** `ANANDA_DIFF_A` and `ANANDA_DIFF_B` MUST NOT be stored as full 72-byte nibble-packed matrices. The dataset shows these are constant matrices (all cells = -1 and all cells = +1 respectively after digital root reduction). They MUST be represented as compile-time scalar sentinels, with accessor functions returning the constant without array allocation.

**Gap addressed:** `ANANDA_DIFF_A` (all -1 = 9 after DR) and `ANANDA_DIFF_B` (all +1 = 1 after DR) waste 144 bytes of `.rodata` if stored as full matrices.

```c
// ==============================================================================
// FR 2.1.9: CONSTANT MATRIX OPTIMIZATION
// ==============================================================================
// ANANDA_DIFF_A (#1-2-3): (#X+0) - (#X+1) → all cells = 9 after digital root
// ANANDA_DIFF_B (#1-2-4): (#X+1) - (#X+0) → all cells = 1 after digital root
// These are NOT stored as 72-byte arrays. They are compile-time constants.

#define ANANDA_DIFF_A_CONSTANT  9u  // Digital root of all (#X+0)-(#X+1) differences
#define ANANDA_DIFF_B_CONSTANT  1u  // Digital root of all (#X+1)-(#X+0) differences

// Constant-time accessors — no memory allocation
static inline uint8_t get_ananda_diff_a(uint8_t row, uint8_t col) {
    (void)row; (void)col;           // Parameters present for API consistency
    return ANANDA_DIFF_A_CONSTANT;  // Always 9 — the Paramesvara wholeness constant
}

static inline uint8_t get_ananda_diff_b(uint8_t row, uint8_t col) {
    (void)row; (void)col;
    return ANANDA_DIFF_B_CONSTANT;  // Always 1 — the Unity constant
}

// Structural note: ANANDA_SUM and ANANDA_QUINTESSENCE still require full 72-byte
// storage as their values vary. Only DIFF_A and DIFF_B are constant-optimizable.
// Savings: 2 × 72 = 144 bytes of .rodata reclaimed.
```

---

### FR 2.1.10: Parallel Role Track Invariant (Ananda/Spanda)

**Requirement:** The C engine MUST document and enforce, via `_Static_assert` on enum values, that the Ananda matrix roles (#1-2-0 through #1-2-5) and the Spanda stage roles (#1-3-0 through #1-3-5) share the same 6-fold QL role sequence in the same index order. This invariant enables direct index translation between the two systems without a lookup table.

**Gap addressed:** The parallel role track between Ananda and Spanda is semantically implied but not formally stated in the spec; the dataset confirms the 1:1 correspondence.

```c
// ==============================================================================
// FR 2.1.10: PARALLEL ROLE TRACK INVARIANT
// ==============================================================================
// Ananda matrix ops (0-5) and Spanda stages (0-5) share identical QL roles:
//   Index 0 = Ground / Seed       (BIMBA / Implicate boundary)
//   Index 1 = Definition / Pole-A (PRATIBIMBA / Explicate onset)
//   Index 2 = Operation / Pole-B  (SUM / Active synthesis)
//   Index 3 = Pattern / Trika     (DIFF_A / Descent polarity)
//   Index 4 = Context / Flowering (DIFF_B / Ascent polarity)
//   Index 5 = Integration / Meta  (QUINTESSENCE / Implicate boundary)
// This 6-fold parallelism is the CORRESPONDS_TO_MATRIX relation in C form.

// Compile-time enforcement: matrix op and spanda stage enums must align.
_Static_assert((int)MATRIX_BIMBA        == (int)SPANDA_SEED,     "Ananda-Spanda track: index 0 must align");
_Static_assert((int)MATRIX_PRATIBIMBA   == (int)SPANDA_POLE_A,   "Ananda-Spanda track: index 1 must align");
_Static_assert((int)MATRIX_SUM         == (int)SPANDA_POLE_B,   "Ananda-Spanda track: index 2 must align");
_Static_assert((int)MATRIX_DIFF_A      == (int)SPANDA_TRIKA,    "Ananda-Spanda track: index 3 must align");
_Static_assert((int)MATRIX_DIFF_B      == (int)SPANDA_FLOWERING,"Ananda-Spanda track: index 4 must align");
_Static_assert((int)MATRIX_QUINTESSENCE== (int)SPANDA_META,     "Ananda-Spanda track: index 5 must align");

// Direct index translation — enabled by the parallel track invariant
#define ANANDA_TO_SPANDA_STAGE(matrix_op)  ((Spanda_Stage)(matrix_op))
#define SPANDA_TO_ANANDA_OP(spanda_stage)   ((Ananda_Matrix_Op)(spanda_stage))
```

---

### FR 2.1.11: Quaternion Constants and MEF Doubled Constant

**Requirement:** The C engine MUST provide compile-time definitions for the quaternion algebra identity `i²=j²=k²=ijk=-1`, the canonical torus major/minor radii (R and r), and the `MEF_DOUBLED=72` constant deriving from the 36-lens MEF doubled to 72 via the # Inversion Operator.

**Gap addressed:** These constants appear in the dataset but are not formally defined in the spec.

```c
// ==============================================================================
// FR 2.1.11: QUATERNION CONSTANTS AND MEF_DOUBLED
// ==============================================================================

// Quaternion algebra identities — i² = j² = k² = ijk = -1
// These are not runtime values; they are the algebraic laws of the Q field.
// Encoding: integer sentinel values used in compile-time documentation.
#define QUAT_II_IDENTITY   (-1)  // i² = -1
#define QUAT_JJ_IDENTITY   (-1)  // j² = -1
#define QUAT_KK_IDENTITY   (-1)  // k² = -1
#define QUAT_IJK_IDENTITY  (-1)  // ijk = -1

// Torus parametrization radii — derived from the 16:9 QL ratio
// Major radius R: distance from torus center to tube center
// Minor radius r: tube radius
// The genus-1 constraint (EULER_CHARACTERISTIC = 0) requires R > r > 0.
// Canonical values derived from QL_RATIO: R/r = QL_RATIO_NUM / QL_RATIO_DEN = 16/9
#define TORUS_R_MAJOR_NUM  16u   // Numerator of R (in units of r)
#define TORUS_R_MINOR_DEN   9u   // Denominator (r = 1 unit)
// Floating-point versions: use for .rodata constant derivation ONLY (never hot path)
#define TORUS_R_MAJOR_F   (16.0f / 9.0f)   // ≈ 1.777...
#define TORUS_R_MINOR_F    1.0f             // normalized

// MEF_DOUBLED: the 12-lens MEF (6 base + 6 inverted) mapped onto the 72-space
// 6 base MEF lenses × 2 phases (#-inverted) × 6 positions = 72
// MEF_DOUBLED = 72 is not a coincidence — it IS the M2 invariant emerging from M1.
#define MEF_DOUBLED    72u
#define MEF_BASE_LENSES 6u
#define MEF_INV_FACTOR  2u   // # Inversion Operator doubles the lens count

_Static_assert(MEF_BASE_LENSES * MEF_INV_FACTOR * QL_PROCESSUAL == MEF_DOUBLED,
    "MEF_DOUBLED must equal MEF_BASE_LENSES * 2 * 6 = 72");
```

---

### FR 2.1.12: M0 Cross-Link Pointer Table

**Requirement:** The C engine MUST provide a 12-entry pointer table linking M1's Ananda matrix ring positions to their corresponding M0 archetype coordinates. This table encodes the `INHERITS_MIRROR_STRUCTURE` and `EMBODIES_ARCHETYPE` cross-branch relations as physical pointer entries.

**Gap addressed:** The M0↔M1 cross-link is documented semantically but not as a physical pointer table; 12 entries (6 matrix + 6 DR reflection nodes) are required.

```c
// ==============================================================================
// FR 2.1.12: M0 CROSS-LINK POINTER TABLE (12 entries)
// ==============================================================================
// Links the 12-element Ananda ring (6 matrices + 6 DR reflections) to their
// corresponding M0 archetype coordinates (Archetype_0 through Archetype_5).
// These are the CORRESPONDS_TO_MATRIX + EMBODIES_ARCHETYPE cross-branch pointers.

// Forward declaration — archetypes defined in archetypes.c (.rodata)
extern BIMBA Archetype_0;
extern BIMBA Archetype_1;
extern BIMBA Archetype_2;
extern BIMBA Archetype_3;
extern BIMBA Archetype_4;
extern BIMBA Archetype_5;

// 12-entry cross-link: Ananda ring index → corresponding M0 archetype pointer
// Indices 0-5:  Ananda matrices (BIMBA, PRATIBIMBA, SUM, DIFF_A, DIFF_B, QUINTESSENCE)
// Indices 6-11: Their DR reflections (index N+6 = DR reflection of matrix N)
static const Holographic_Coordinate* const M1_M0_CROSSLINK[12] = {
    &Archetype_0,  // ANANDA_BIMBA         → #0 Ground (implicate boundary)
    &Archetype_1,  // ANANDA_PRATIBIMBA    → #1 Form (explicate onset)
    &Archetype_2,  // ANANDA_SUM           → #2 Operation (synthesis)
    &Archetype_3,  // ANANDA_DIFF_A        → #3 Pattern (descent polarity)
    &Archetype_4,  // ANANDA_DIFF_B        → #4 Context (ascent polarity)
    &Archetype_5,  // ANANDA_QUINTESSENCE  → #5 Integration (implicate boundary)
    &Archetype_0,  // DR Reflection of BIMBA         → returns to Ground
    &Archetype_1,  // DR Reflection of PRATIBIMBA    → Form's self-reflection
    &Archetype_2,  // DR Reflection of SUM           → Operation's self-reflection
    &Archetype_3,  // DR Reflection of DIFF_A        → Pattern's self-reflection
    &Archetype_4,  // DR Reflection of DIFF_B        → Context's self-reflection
    &Archetype_5,  // DR Reflection of QUINTESSENCE  → Integration's self-reflection
};

_Static_assert(sizeof(M1_M0_CROSSLINK) / sizeof(M1_M0_CROSSLINK[0]) == 12,
    "M1_M0_CROSSLINK must have exactly 12 entries (ANANDA_RING_SIZE)");

// Boot-time verification: all crosslink entries must be non-NULL
static inline bool verify_m1_m0_crosslink(void) {
    for (int i = 0; i < 12; i++) {
        if (M1_M0_CROSSLINK[i] == NULL) return false;
    }
    return true;
}
```

---

*Patch Version:* 1.0
*Applied:* 2026-03-05 by Cross-M Harmonisation Agent
*Addresses:* FR 2.1.7, FR 2.1.8, FR 2.1.9, FR 2.1.10, FR 2.1.11, FR 2.1.12
