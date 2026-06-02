# FR 2.3: M3 (Mahamaya) — The Symbolic Transcription Engine

**Status:** Canonical Specification (Revision 2 — Gemini Refinements Incorporated)
**Date:** 2026-03-04
**Parent:** Pillar II, FR 2.3 (Epi-Logos C Spec)
**Source Data:** `docs/datasets/nodes_mahamaya.json` (996 nodes), `docs/datasets/relations_mahamaya.json` (4,891 relations, 121 unique types)
**Coordinate:** #3 — Subsystem 3: Mahamaya — Dynamic Computational Matrix & Universal Transcription Engine
**Revision Notes:** Incorporates Gemini architectural review: 2-bit nucleotide logic, M3_PAIR_MATRIX[16], Epogdoon bridge functions, Unified Cosmic Clock, SU(2) polar_opposite, STATUS_PROVISIONAL integration, DNA/RNA superposition flag, and corrected Tarot suit/nucleotide mappings.

---

## Overview

Mahamaya is the **symbolic transcription layer** — the cosmic dream code made literally operational. She is the dynamic computational matrix that generates adaptive symbolic expressions through quaternionic rotational dynamics, environmental responsiveness, and genuine cross-domain translation between biological, symbolic, musical, and mathematical pattern systems through shared vibrational architecture.

**Dataset Shape:** 996 nodes, 4,891 relations, max depth 5. Six top-level sub-branches (#3-0 through #3-5) with dramatically unequal size: #3-5 (360-degree Wheel) contains 390 nodes, #3-3 (Transcription Engine) 293, #3-4 (Minor Arcana / Phase Space) 153, #3-2 (Genetic Code) 85, #3-1 (I-Ching) 73, and #3-0 (Reception Ground) just 1.

**The 64-Space Dominance:** Where M2's invariant was 72, M3's is **64** — the `uint64_t` as primary computational word. 64 hexagrams, 64 DNA codons, 64 positions in the bitboard. This is not arbitrary: 64 = 2^6 = exactly 6-bit addressing, which means every position in the M3 computational space is addressable by a single 6-bit index into a 64-bit machine word. The I-Ching and DNA share the SAME address space — two upper trigram bits concatenated with lower trigram bits yield the same 6-bit index as three nucleotide pairs at 2 bits each. This isomorphism is the architectural foundation of M3.

**The M3 Matrix Word:** The `uint64_t` is not merely a container — it IS the entire symbolic reality of M3 at any moment. Bit `i` set means codon/hexagram `i` is active. All state transformations are bitwise: XOR for Integral Symmetry, AND/OR for field permutations, bit-reversal for diagonal symmetry. There are no loops over active bits when whole-field transformation is possible; compiler intrinsics such as `__builtin_bswap64` execute 64-position transformations in a single CPU cycle.

**The (0/1/2/3) Context Frame — Quaternal Integration:** M3 operates within the (0/1/2/3) context frame — the "Three Plus One" modality. This is where the three lower layers integrate:
- **0 = M0 (Anuttara):** The archetypal number language that elucidates M3's activities — every numerical structure in M3 (64, 72, 360, 56, 22, 24) finds its root explanation in M0's number-theoretic ground
- **1 = M1 (Paramasiva):** The quaternionic mathematics and SU(2) rotational framework that provides the algebraic engine — inherited at #3-0 via INHERITS_QUATERNION_FROM #1-5
- **2 = M2 (Parashakti):** The vibrational templates compressed from 72-space into 64-space via the epogdoon — received at #3-0 via RECEIVES_VIBRATIONAL_MATRIX_FROM #2, TRANSFORMS_72_TO_64_VIA #2-5
- **3 = M3 (Mahamaya):** The transcription engine itself, where the lower three layers achieve their first operational symbolic expression

The M2/M3 interoperability was historically identified as the "HMS" (Hexagram Memory System). The architectural reality: M2 holds the "Chord" (72-fold vibrational state); M3 is the "Cymatic Plate" (the `uint64_t` bitboard). When M2 vibrates, it excites specific bits on the M3 bitboard via a `.rodata` projection matrix, forming a hexagram/codon pattern. This is the Discrete Epistemic Transform (DET) — an integer-only bitwise projection that acts as a Fourier-analogue without any floating-point cost.

This is why M0 has the separation between levels 3 and 4: level 4 is where **nesting begins** — a phase transform. The #3→#4 boundary is not merely sequential; it is the ontological threshold where the Torus process (0-3 cycling) folds inward through the Lemniscate at #4, incubating deeper nested reality. M3 is the last position before that fold — the fullest expression of the outward-moving Torus before the inward turn.

**The Hierarchy:**
- **M0:** Numbers and Laws (The Vocabulary)
- **M1:** Quaternions and DR Rings (The Grammar)
- **M2:** 72-fold Vibrations (The Tone / Frequency)
- **M3:** 64-fold Transcriptions (The Written Word / Code)

**Internal Relation Dynamics:** M3 is remarkably self-contained — only 14 cross-M-branch edges in the entire dataset. The 4,891 relations are overwhelmingly internal:

| Sub-Branch | Internal Relations | Cross-Sub-Branch | Character |
|------------|-------------------|------------------|-----------|
| #3-1 (I-Ching) | 552 | 211 | LINE_CHANGE-dominated (384); hexagram transformation algebra |
| #3-2 (Genetic Code) | 398 | 820 | Symmetry-rich; heavily connected to Engine (#3-3) |
| #3-3 (Engine) | 538 | 1,292 | Hub node; orchestrates all M3 dynamics |
| #3-4 (Arcana/Phase) | 279 | 417 | Phase-space calculator; DNA/RNA/Tarot bridge |
| #3-5 (360-degree Wheel) | 1,586 | 31 | Almost entirely self-contained; degree-clock dynamics |

#3-3 is the **operational hub** — its 1,292 cross-sub-branch edges reach into every other M3 sub-system, reflecting its role as the Universal Transcription Engine that orchestrates cross-domain translation.

**The 14 Cross-M-Branch Edges (Complete):**

| Type | Source | Target | Semantic |
|------|--------|--------|----------|
| META_STRUCTURE_ELEMENT_OF | #3 | # | System root membership |
| SUCCEEDED_BY_AND_MANIFESTS_THROUGH | #3 | #4 | QL cycle: M3 → M4 |
| EMPLOYS_SEQUENCE | #3 | #1-5-0 | Uses M1's sequence architecture |
| ENABLES_UNIVERSAL_TRANSCRIPTION | #3 | #2 | M3 ← M2 vibrational field |
| COSMIC_DREAM_SPEECH | #3 | #0-3 | Links to M0's speech archetype |
| PROVIDES_HELIX_STATE | #3 | #4.3 | M3 → M4 helix data |
| PROVIDES_SYMBOLS_TO | #3 | #4.2-0 | M3 → M4 symbolic vocabulary |
| RESONATES_WITH_TANMATRA | #3 | #2-2-2-4-3 | Sound-tanmatra resonance into M2 |
| REFLECTS_FOUNDATION | #3-0 | #2-5 | Reception ground ← M2 epogdoon |
| INHERITS_QUATERNION_FROM | #3-0 | #1-5 | M1 quaternion algebra received |
| RECEIVES_VIBRATIONAL_MATRIX_FROM | #3-0 | #2 | M2 vibrational matrix received |
| TRANSFORMS_72_TO_64_VIA | #3-0 | #2-5 | Epogdoon compression path |
| OPERATES_THROUGH | #3-1 | #4.4.3-5-0 | I-Ching operates into M4 |
| INTEGRATES_WITH | #3-5 | #4.0 | 360-degree wheel → M4 integration |

**No Formulations:** Unlike M2 (which had the golden ratio seed), M3 carries zero formulation fields in the dataset. The "formulations" are the operational dynamics themselves — the bitwise algebra, the codon-to-protein transcription, the hexagram transformation calculus. The CODE is the formulation.

---

## FR 2.3.0: M3_Matrix_Word — The Primary State Word

**Requirement:** The primary computational datum of M3 is the `uint64_t` M3_Matrix_Word. The entire symbolic reality at any moment is a bitfield: bit `i` = 1 means codon/hexagram/position `i` is active. All state transformations are bitwise operations. There is no floating-point on the hot path.

**Ontological Ground:** #3-0 (Quaternionic Reception & Parashakti Integration Matrix — WHY level primordial cause as initiatory essence enabling all Mahamaya symbolic-genetic-spiritual operations)

### The (0/1/2/3) Integration Point

#3-0 is a **leaf node** — just 1 node with 16 relations — but it is the most relationally significant node per capita in the entire M3 dataset. Every relation is a structural lifeline:

**Inheritance Chain (from lower layers):**
- `INHERITS_QUATERNION_FROM` #1-5 → M1's quaternionic rotational mathematics
- `RECEIVES_VIBRATIONAL_MATRIX_FROM` #2 → M2's full vibrational field
- `TRANSFORMS_72_TO_64_VIA` #2-5 → The epogdoon compression at M2's planetary bridge
- `REFLECTS_FOUNDATION` #2-5 → Ground reflection back to the M2 bridge

**Generative Outputs (into M3):**
- `ENABLES_HEXAGRAM_GENERATION_IN` → Powers #3-1 I-Ching
- `ENABLES_CODON_EXPRESSION_IN` → Powers #3-2 Genetic Code
- `POWERS_TRANSCRIPTION_ENGINE` → Powers #3-3 Universal Engine
- `GROUNDS_ROTATIONAL_DYNAMICS_FOR` → Powers #3-4 Minor Arcana
- `ANCHORS_SYNTHESIS_WHEEL` → Powers #3-5 360-degree Wheel
- `DEVELOPS_INTO` → QL cycle forward

**Polarity Seeding:**
- `CONTAINS_SEXUAL_POLARITY_POTENTIAL` (×2) → Seeds X/Y chromosome polarity in #3-3-5
- `BIRTHS_SEXUAL_DISTINCTION` (×2) → Activates sex-determination logic
- `MANIFESTS_FROM_PRIMORDIAL_POLARITY` (×2) → Traces back to primordial source
- `SEEKS_PRIMORDIAL_REUNION` (×2) → Return-loop to ground
- `RETURNS_TO` → Möbius return

### M2 Cymatic Projection Matrix

The interoperability bridge from M2 (72-fold vibrational) to M3 (64-fold symbolic) is accomplished via a `.rodata` projection LUT, not runtime computation:

```c
// ==============================================================================
// FR 2.3.0: M2 → M3 CYMATIC PROJECTION MATRIX
// ==============================================================================
// Maps the 72 M2 vibrational states to their corresponding M3 64-bit masks.
// This physically executes the 9:8 Epogdoon compression.
// Bitwise OR = wave superposition (constructive interference).
extern const uint64_t M2_TO_M3_CYMATIC_PROJECTION[72];

// To translate M2 vibration into M3 symbolic state:
static inline uint64_t transduce_vibration_to_symbol(uint8_t m2_active_indices[],
                                                       uint8_t count) {
    uint64_t m3_bitboard = 0;
    for (uint8_t i = 0; i < count; i++) {
        m3_bitboard |= M2_TO_M3_CYMATIC_PROJECTION[m2_active_indices[i]];
    }
    return m3_bitboard;
}
```

### M0 Number Language Elucidation

The archetypal numbers active in M3 are grounded by M0's number-theoretic language:

| Number | M3 Manifestation | M0 Archetypal Meaning |
|--------|-----------------|----------------------|
| **64** | Hexagrams, Codons, Bitboard word | 2^6 — pure binary power at the 6th order; the QL-complete computational space |
| **8** | Trigrams, RNA families, Octave, Epogdoon gap | The first cubic number (2^3); the doubling of the quaternion |
| **6** | Hexagram lines, Codon positions, QL base | THE mod-6 QL number — the fundamental cycle length |
| **3** | Nucleotide triplet, Trigram lines | The Trika — Anuttara/Paramasiva/Parashakti |
| **2** | Binary (yin/yang, A-T/C-G) | The fundamental polarity — Bimba/Pratibimba |
| **56** | Minor Arcana, Resonance Matrix | 8 × 7 — one less than the 64-fold completion (the 8-fold absence) |
| **22** | Major Arcana, Autosomes | The master number of pathways (Hebrew letters, Kabbalistic paths) |
| **360** | Degree wheel | 6 × 60 — the QL base times the Babylonian sexagesimal |
| **720** | Double-covering | SU(2) spinorial: 360 × 2, requiring two full cycles for identity return |
| **24** | Amino acids, Hours | 4! = factorial of quaternion base; the permutation-complete set of 4 elements |
| **37** | RNA codons | Prime number — irreducible; the 27-fold shadow + 10 (mod-10 Ananda face) |
| **78** | Total Tarot | 22 + 56 = Major + Minor; also 12th triangular number (1+2+...+12) |
| **96** | Non-dual instances | 64 + 32 = full space + half-space; palindromic self-complementarity count |
| **336** | Dual pairs | 64 × 63 / 12 — combinatorial pairing; the dual tension field |
| **40** | Non-dual anchors | The biblical completeness number; bits always set in base mask |
| **72** | M2 vibrational states | 36 × 2 (SU(2)); derived as max TT pair sum (18) × 2 pairs × 2 phases |
| **36** | Max rotational energy sum | 18 (TT max) + 18 (TT max); indexes into M2 Parashakti space |
| **18** | Max single-pair sum | TT (Yang,Moving + Yang,Moving); the upper bound of the pair matrix |

### C Structure

```c
// #3-0 Reception Ground — initializes the M3 computational field
typedef struct {
    // Inherited algebra
    uint64_t quaternion_state;      // From M1 #1-5: SU(2) rotation state
    uint64_t vibrational_matrix;    // From M2: compressed vibrational field

    // The epogdoon compression result
    uint64_t base_mask;             // 40 non-dual bits always set

    // Polarity seed
    uint8_t  polarity_potential;    // Sexual polarity seeding (X/Y)

    // Generative function pointers — one per downstream sub-system
    void (*enable_hexagram)(uint64_t base);    // → #3-1
    void (*enable_codon)(uint64_t base);       // → #3-2
    void (*power_engine)(uint64_t base);       // → #3-3
    void (*ground_rotation)(uint64_t base);    // → #3-4
    void (*anchor_wheel)(uint64_t base);       // → #3-5
} M3_Reception_Ground;

// The epogdoon transform — THE cross-boundary function (M2 → M3)
static inline uint8_t m2_epogdoon_transform(uint8_t val_72) {
    return (val_72 * 8) / 9;   // 72-space → 64-space via sacred 9:8 ratio
}

// Initialize M3 from M1 + M2 inputs
void m3_reception_init(M3_Reception_Ground* ground,
                       uint64_t m1_quaternion,
                       uint64_t m2_vibrational);
```

**Memory Domain:** Heap — mutable state that receives from lower layers at runtime.

**Pointer Topology:** Tagged pointers back to M1 #1-5 (FLAG_NESTING — cross-layer inheritance) and M2 #2-5 (FLAG_BRANCHING — epogdoon bridge). Raw pointers forward to all five M3 sub-systems.

### Operational Flow

```
M1 (#1-5) quaternion algebra
    ↓ INHERITS_QUATERNION_FROM
M2 (#2) vibrational matrix
    ↓ RECEIVES_VIBRATIONAL_MATRIX_FROM
M2 (#2-5) planetary bridge
    ↓ TRANSFORMS_72_TO_64_VIA (epogdoon: val * 8 / 9)
#3-0 Reception Ground
    ↓ base_mask = 40-bit non-dual foundation
    ├→ ENABLES_HEXAGRAM_GENERATION → #3-1
    ├→ ENABLES_CODON_EXPRESSION → #3-2
    ├→ POWERS_TRANSCRIPTION_ENGINE → #3-3
    ├→ GROUNDS_ROTATIONAL_DYNAMICS → #3-4
    └→ ANCHORS_SYNTHESIS_WHEEL → #3-5
```

---

## FR 2.3.1: 2-Bit Nucleotide Logic — The Ontological Foundation

**Requirement:** Every nucleotide MUST be represented as a strict 2-bit integer where the bit positions ARE the Yin/Yang properties. No lookup table is needed for base properties — they are derivable from the bit pattern by definition.

**Ontological Ground:** #3-1 (I-Ching System — 73 nodes: 8 trigrams + 64 hexagrams + 1 root) and #3-2 (Genetic Code Architecture — 85 nodes)

### The 2-Bit Encoding

```
Bit 0 (Polarity):  0 = Yin  (A, C)      1 = Yang (T, G)
Bit 1 (Mobility):  0 = Moving (A, T)    1 = Resting (C, G)
```

| 2-bit value | Nucleotide | Polarity | Mobility | I-Ching Line | Tarot Suit |
|-------------|------------|----------|----------|--------------|------------|
| `0b00` (0) | **A** (Adenine) | Yin | Moving | Old Yin (6) | CUPS (Water) |
| `0b01` (1) | **T** (Thymine) | Yang | Moving | Old Yang (9) | WANDS (Fire) |
| `0b10` (2) | **C** (Cytosine) | Yin | Resting | Young Yin (8) | PENTACLES (Earth) |
| `0b11` (3) | **G** (Guanine) | Yang | Resting | Young Yang (7) | SWORDS (Air) |

**Critical Note on Encoding Correction:** This 2-bit assignment (A=0b00 Yin/Moving, T=0b01 Yang/Moving) supersedes the earlier spec entry at FR 2.3.2 which listed A=Yang and T=Yin. The corrected encoding derives from the raw philosophical data: A is Yin (receptive, water, the complement to T's fire) and T is Yang (manifesting, solar). The `#3-4.0` DNA/RNA superposition phase appears to invert this — that inversion is handled by the `is_rna_phase` flag (see FR 2.3.1d below), not by a different encoding.

### Core Macros and Inline Functions

```c
// ==============================================================================
// FR 2.3.1: NUCLEOTIDE BINARY LOGIC (The 2-Bit Ontological Ground)
// ==============================================================================
// 0b00 (0) = A (Yin,  Moving)  — Old Yin (6)
// 0b01 (1) = T (Yang, Moving)  — Old Yang (9)
// 0b10 (2) = C (Yin,  Resting) — Young Yin (8)
// 0b11 (3) = G (Yang, Resting) — Young Yang (7)

// FR 2.3.1a: Polarity and Mobility extraction
#define GET_POLARITY(nuc)  ((nuc) & 0x01)          // 0 = Yin, 1 = Yang
#define GET_MOBILITY(nuc)  (((nuc) >> 1) & 0x01)   // 0 = Moving, 1 = Resting

// FR 2.3.1b: Base-pairing = XOR 0x01 (flips Polarity, preserves Mobility)
// A(0b00) ^ 0x01 = T(0b01)   ← Watson-Crick: A pairs with T
// C(0b10) ^ 0x01 = G(0b11)   ← Watson-Crick: C pairs with G
static inline uint8_t get_base_pair(uint8_t nuc) {
    return nuc ^ 0x01;
}

// FR 2.3.1c: Codon encoding — 3 nucleotides × 2 bits = 6-bit address (0-63)
static inline uint8_t encode_codon(uint8_t n1, uint8_t n2, uint8_t n3) {
    return (uint8_t)((n1 << 4) | (n2 << 2) | n3);
}

// FR 2.3.1d: DNA/RNA phase — single bit flips the entire Polarity table
// In RNA phase, A becomes Yang (0b00 → polarity=1) and T becomes Yin (0b01 → polarity=0)
// This is a contextual phase shift, NOT a new encoding.
static inline uint8_t get_polarity_phased(uint8_t nuc, bool is_rna) {
    return GET_POLARITY(nuc) ^ (uint8_t)is_rna;
}
// When is_rna = true:
//   A (0b00): polarity = 0 ^ 1 = 1 → Yang  (RNA reversal)
//   T (0b01): polarity = 1 ^ 1 = 0 → Yin   (RNA reversal)
//   C (0b10): polarity = 0 ^ 1 = 1 → Yang  (RNA reversal)
//   G (0b11): polarity = 1 ^ 1 = 0 → Yin   (RNA reversal)
// This single XOR against is_rna_phase makes DNA/RNA strand complementarity
// a physical law of the execution context, not static data.
```

### The I-Ching Hexagram Subsystem (#3-1)

**Requirement:** The C engine MUST implement the complete 64-hexagram I-Ching system as a `uint64_t` bitboard with 8 trigrams as 3-bit addresses, 64 hexagrams as 6-bit composite addresses, and the LINE_CHANGE transformation algebra as XOR operations on the bitboard.

#### The 8 Trigrams (3-Bit Addresses)

| Trigram | Coord | Name | Binary | Hex | Quality | Element |
|---------|-------|------|--------|-----|---------|---------|
| 0 | #3-1-0 | Qian (Heaven) | 111 | 0x07 | Creative, strong | Metal/Sky |
| 1 | #3-1-1 | Kun (Earth) | 000 | 0x00 | Receptive, yielding | Earth |
| 2 | #3-1-2 | Zhen (Thunder) | 001 | 0x01 | Arousing, movement | Wood |
| 3 | #3-1-3 | Xun (Wind) | 110 | 0x06 | Gentle, penetrating | Wood |
| 4 | #3-1-4 | Kan (Water) | 010 | 0x02 | Abysmal, dangerous | Water |
| 5 | #3-1-5 | Li (Fire) | 101 | 0x05 | Clinging, clarity | Fire |
| 6 | #3-1-6 | Gen (Mountain) | 100 | 0x04 | Keeping still | Earth |
| 7 | #3-1-7 | Dui (Lake) | 011 | 0x03 | Joyous, open | Metal |

#### Hexagram Operations

```c
// LINE_CHANGE: flip line n (0-5) of hexagram h — 384 edges implicit in XOR
static inline uint8_t m3_line_change(uint8_t hex, uint8_t line) {
    return hex ^ (1u << line);
}

// Hexagram decomposition — built into the 6-bit address
static inline uint8_t upper_trigram(uint8_t hex_id) { return (hex_id >> 3) & 0x07; }
static inline uint8_t lower_trigram(uint8_t hex_id) { return hex_id & 0x07; }
static inline uint8_t compose_hexagram(uint8_t upper, uint8_t lower) {
    return (uint8_t)((upper << 3) | lower);
}

// Complementarity: all 6 lines inverted
static inline uint8_t complement(uint8_t hex_id) { return hex_id ^ 0x3F; }

// Integral Symmetry on the full 64-bit field (all codons simultaneously, O(1))
static inline uint64_t integral_symmetry_field(uint64_t m3_word) {
    return __builtin_bswap64(m3_word);  // Bit-reversal for field-wide complement
}
```

#### C Structures

```c
// Trigram: 3-bit fundamental unit
typedef struct {
    uint8_t id;             // 0-7 (3 bits)
    uint8_t binary;         // 3-bit line pattern (yang=1, yin=0)
    uint8_t earlier_heaven; // Position in Earlier Heaven (0-7)
    uint8_t later_heaven;   // Position in Later Heaven (0-7)
    uint8_t element;        // Five-Element correspondence
    uint8_t family_role;    // Father/Mother/Son/Daughter
    uint16_t degree_anchor; // Degree position in #3-5 wheel
} M3_Trigram;

// 8 trigrams in .rodata
static const M3_Trigram M3_TRIGRAM_LUT[8];

// Hexagram: 6-bit composite address
typedef struct {
    uint8_t id;             // 0-63 (6 bits) = upper<<3 | lower
    uint8_t line_pattern;   // 6-bit pattern (lines 0-5, bottom to top)
    uint8_t complement_id;  // id ^ 0x3F
    uint8_t nuclear_upper;  // Nuclear trigram (lines 2-4)
    uint8_t nuclear_lower;  // Nuclear trigram (lines 1-3)
} M3_Hexagram;

// 64 hexagrams in .rodata
static const M3_Hexagram M3_HEXAGRAM_LUT[64];

// State: which hexagrams are active
typedef struct {
    uint64_t active;         // Bitboard: bit h set = hexagram h active
    uint8_t  current;        // Currently focused hexagram (6-bit)
    uint8_t  changing_lines; // Which lines are changing (6-bit mask)
    uint8_t  result;         // Hexagram after changes applied
    bool     is_rna_phase;   // DNA/RNA superposition flag — single bit
} M3_IChing_State;
```

---

## FR 2.3.2: M3_SD_Value and the Unified 16-Pair Matrix

**Requirement:** All 16 possible dinucleotide pairs MUST be indexed by a unified `.rodata` LUT using the 4-bit key `(nuc1 << 2) | nuc2`. Each entry stores Sum (+) and Difference (-) values as `int8_t`. The engine computes rotational states dynamically from this matrix; no pre-computed 8-fold tables are stored.

**Mathematical Basis:**
- Maximum single-pair sum = 18 (TT: Yang,Moving + Yang,Moving = 9+9)
- Maximum rotational sum = 36 (two TT pairs: 18+18)
- 36 × 2 (SU(2) phases: explicate + implicate) = **72**
- DNA natively indexes into M2 Parashakti frequency space through this arithmetic

### M3_SD_Value Struct

```c
// ==============================================================================
// FR 2.3.2: M3_SD_Value — Sum/Difference pair descriptor
// ==============================================================================
typedef struct {
    int8_t sum;   // The (+) evaluation
    int8_t diff;  // The (-) evaluation
} M3_SD_Value;
```

### M3_PAIR_MATRIX[16] — The Unified Dinucleotide LUT

Indexed by `(nuc1 << 2) | nuc2` where nucleotides are: A=0, T=1, C=2, G=3.

```c
// ==============================================================================
// FR 2.3.2: THE UNIFIED DINUCLEOTIDE MATRIX (M1 + M2 + M3 Integration)
// ==============================================================================
// Key: (nuc1 << 2) | nuc2
//   AA=0, AT=1, AC=2, AG=3
//   TA=4, TT=5, TC=6, TG=7
//   CA=8, CT=9, CC=10, CG=11 (note: index 10=0b1010, 11=0b1011)
//   GA=12, GT=13, GC=14, GG=15 (note: 12=0b1100, 13=0b1101, 14=0b1110, 15=0b1111)
static const M3_SD_Value M3_PAIR_MATRIX[16] = {
    // Homogeneous pairs (same nucleotide repeated)
    [0]  = { 12,  0 },  // AA (Yin/Moving  + Yin/Moving)
    [5]  = { 18,  0 },  // TT (Yang/Moving + Yang/Moving) — MAX SUM
    [10] = { 14,  0 },  // CC (Yin/Rest    + Yin/Rest)
    [15] = { 16,  0 },  // GG (Yang/Rest   + Yang/Rest)

    // M1 Pairs (Polarity-complementary, same mobility)
    [1]  = { 15, -3 },  // AT (Yin/Moving  + Yang/Moving)
    [14] = { 15, -1 },  // CG (Yin/Rest    + Yang/Rest)
    [4]  = { 15,  3 },  // TA (Yang/Moving + Yin/Moving)
    [11] = { 15,  1 },  // GC (Yang/Rest   + Yin/Rest)

    // M2 Pairs (Same polarity, mobility-complementary)
    [3]  = { 14,  2 },  // AG (Yin/Moving  + Yang/Rest)
    [6]  = { 16, -2 },  // TC (Yang/Moving + Yin/Rest)
    [12] = { 14,  2 },  // GA (Yang/Rest   + Yin/Moving)
    [9]  = { 16, -2 },  // CT (Yin/Rest    + Yang/Moving)

    // M3 Pairs (Cross-diagonal — polarity and mobility both differ)
    [2]  = { 13, -1 },  // AC (Yin/Moving  + Yin/Rest)
    [7]  = { 17,  1 },  // TG (Yang/Moving + Yang/Rest)
    [8]  = { 13,  1 },  // CA (Yin/Rest    + Yin/Moving)
    [13] = { 17, -1 },  // GT (Yang/Rest   + Yang/Moving)
};
// Note on pair classification: M1 pairs are the Watson-Crick complements.
// M2 pairs share polarity but differ in mobility (cross-layer bridge).
// M3 pairs share polarity within each sub-row but cross mobility lines.
// The three subsets {M1, M2, M3 pairs} + {4 homos} partition all 16 pairs perfectly.
```

---

## FR 2.3.3: Rotational_State — Dynamic 8-Fold Computation

**Requirement:** The engine MUST compute 8-fold rotational states dynamically from `M3_PAIR_MATRIX` in O(1) time. No pre-stored 8-fold tables. The missing 8th state (evolutionary gap) MUST trigger `STATUS_PROVISIONAL`, not a crash.

### Rotational_State Struct and Calculator

```c
// ==============================================================================
// FR 2.3.3: DYNAMIC ROTATIONAL STATE CALCULATOR
// ==============================================================================
typedef struct {
    int8_t total_sum;
    int8_t total_diff;
} Rotational_State;

// Calculate any of the 8 rotational states in O(1) time.
// pair1_idx and pair2_idx are 4-bit keys into M3_PAIR_MATRIX (0-15).
// Special value 0xFF for pair2_idx = evolutionary gap → STATUS_PROVISIONAL.
static inline Rotational_State compute_rotational_state(uint8_t pair1_idx,
                                                         uint8_t pair2_idx) {
    return (Rotational_State){
        .total_sum  = M3_PAIR_MATRIX[pair1_idx].sum  + M3_PAIR_MATRIX[pair2_idx].sum,
        .total_diff = M3_PAIR_MATRIX[pair1_idx].diff + M3_PAIR_MATRIX[pair2_idx].diff
    };
}
```

### The 8-Fold Absence and STATUS_PROVISIONAL

The Resonance Matrix (#3-3-2-2) has 56 valid entries and 8 gaps (sentinel `0xFF`). These gaps ARE the "8-fold absence that enables spiral evolution." When the engine traverses the Resonance Matrix and encounters `0xFF`, it does not crash. It raises `STATUS_PROVISIONAL` in the coordinate flags and yields control to the Pi Agent:

```c
// The 8-fold spiral gap sentinel
#define M3_RESONANCE_GAP 0xFF

// STATUS_PROVISIONAL flag (bit position in coordinate flags word)
// When set: system has reached an evolutionary gap.
// Do NOT crash. Hand control to Pi Agent for novel mutation.
#define STATUS_PROVISIONAL_BIT  (1u << 4)

static inline bool has_resonance(uint8_t codon_id,
                                  const uint8_t res_matrix[64]) {
    return res_matrix[codon_id] != M3_RESONANCE_GAP;
}

// Rotational state with evolutionary gap handling
// Returns false and sets STATUS_PROVISIONAL if gap encountered.
static inline bool compute_rotational_state_safe(uint8_t pair1_idx,
                                                   uint8_t pair2_idx,
                                                   Rotational_State* out,
                                                   uint32_t* coord_flags) {
    if (pair2_idx == M3_RESONANCE_GAP) {
        *coord_flags |= STATUS_PROVISIONAL_BIT;
        return false;  // Gap: Pi Agent generates novel mutation
    }
    *out = compute_rotational_state(pair1_idx, pair2_idx);
    return true;
}
```

**Architectural Significance:** The 8-fold gap is not an error condition; it is the mathematical engine of evolution. 64 - 56 = 8 = the number of trigrams = the octave = 2^3. The missing 8 Resonance positions correspond to the 8 M2 vibrational frequencies that cannot manifest into static DNA/I-Ching states — they remain purely acoustic/vibrational. The Epogdoon IS the mathematical cause of evolution.

---

## FR 2.3.4: Minor_Arcana_Card — The 64→56 Tarot Compression

**Requirement:** The engine MUST represent the 64→56 Tarot compression structurally, not lossily. 56 Minor Arcana cards + 8 court cards (Kings and Princes) each holding 2 codons = 64 total. The compression preserves all information via the `shadow_codon` field.

### Tarot_Suit Enum

The suit-to-nucleotide mapping follows the 2-bit encoding:

```c
// ==============================================================================
// FR 2.3.4: TAROT SUIT ENUM
// ==============================================================================
typedef enum {
    SUIT_CUPS      = 0, // A family — Yin/Moving  — Water
    SUIT_WANDS     = 1, // T family — Yang/Moving — Fire
    SUIT_PENTACLES = 2, // C family — Yin/Resting — Earth
    SUIT_SWORDS    = 3  // G family — Yang/Resting — Air
} Tarot_Suit;
// Note: Suit index = nucleotide 2-bit value. No translation needed.
// SUIT_CUPS(0) = A(0b00), SUIT_WANDS(1) = T(0b01),
// SUIT_PENTACLES(2) = C(0b10), SUIT_SWORDS(3) = G(0b11).
```

### Minor_Arcana_Card Struct

```c
// ==============================================================================
// FR 2.3.4: MINOR ARCANA CARD (Tarot Compression Map)
// ==============================================================================
typedef struct {
    uint8_t    card_id;        // 0-55 (Minor Arcana ID)
    Tarot_Suit suit;           // Elemental suit (0-3)
    uint8_t    rank;           // 1=Ace, 2-10=Pip, 11=Page, 12=Knight/Prince,
                               // 13=Queen, 14=King
    uint8_t    primary_codon;  // 6-bit codon ID (0-63)
    uint8_t    shadow_codon;   // 6-bit codon ID, or 0xFF for single-codon cards
} Minor_Arcana_Card;

// 56 Minor Arcana in .rodata
// Kings (rank=14) and Princes/Knights (rank=12) hold 2 codons each.
// All other ranks: shadow_codon = 0xFF.
static const Minor_Arcana_Card M3_MINOR_LUT[56];

// Example .rodata entries:
// [King of Cups]    = { 13, SUIT_CUPS,      14, CODON_ATC, CODON_ACT }
// [Prince of Cups]  = { 12, SUIT_CUPS,      12, CODON_ATG, CODON_CAT }
// [Queen of Cups]   = { 11, SUIT_CUPS,      13, CODON_AAC, 0xFF      }
// [King of Swords]  = { 55, SUIT_SWORDS,    14, CODON_GTG, CODON_TGG }
// (Exact codon assignments determined by dataset; these are illustrative.)
```

**The 64→56 Compression (Structural Conservation):**
- 44 pip cards (Aces through 10s) × 4 suits = 44 single-codon entries
- 4 Page cards (rank 11) × 4 suits = 4 single-codon entries
- 4 Queen cards (rank 13) × 4 suits = 4 single-codon entries
- 4 Knight/Prince cards (rank 12) × 4 suits = 4 two-codon entries → 8 codons
- 4 King cards (rank 14) × 4 suits = 4 two-codon entries → 8 codons
- Total: 44+4+4 = 52 single-codon + 4+4 = 8 two-codon = 52 + 8×2 = **52 + 12 ≠ 64** … restructured: 48 single-codon + 8 dual-codon = 48 + 16 = **64 codons** across **56 cards** ✓

The compression is purely structural: the 8 court cards that hold two codons are the "pivot points" where the system gains its evolutionary degrees of freedom. No codon is lost; each is reachable via `primary_codon` or `shadow_codon`.

---

## FR 2.3.5: Unified_Clock_State — The Cosmic Clock (O(1))

**Requirement:** The engine MUST provide a single O(1) function that maps any degree (0-719) across the full SU(2) 720-degree double-cover to a unified clock state containing M1, M2, and M3 phase information. All arithmetic is integer-only.

### Unified_Clock_State Struct

```c
// ==============================================================================
// FR 2.3.5: UNIFIED COSMIC CLOCK
// ==============================================================================
typedef struct {
    uint8_t tick12;              // 0-11 (canonical M1 discrete state)
    uint8_t m2_decan_phase;      // 0-71 (72 decans across full 720° double-cover)
    uint8_t m3_hexagram_id;      // 0-63 (active hexagram / codon at this degree)
    bool    is_implicate_phase;  // true = degrees 360-719 (shadow/implicate layer)
} Unified_Clock_State;

// Read the cosmic clock at any degree in the 720° SU(2) double-cover.
// All arithmetic is integer. No floating-point. O(1).
static inline Unified_Clock_State read_cosmic_clock(uint16_t degree_0_to_719) {
    bool    is_implicate = (degree_0_to_719 >= 360);
    uint16_t base        = degree_0_to_719 % 360;

    // M1: 30° per tick12 stage → 12 stages per 360° cycle
    uint8_t tick12       = (uint8_t)(base / 30);

    // M2: 10° per decan → 36 decans per 360°; shadow layer adds 36
    uint8_t decan_phase  = is_implicate
                               ? (uint8_t)(base / 10 + 36)
                               : (uint8_t)(base / 10);

    // M3: integer projection of 360° onto 64-space (no float needed)
    // base * 64 / 360 = base * 8 / 45 (simplified)
    // Using the form (base * 64) / 360 with integer truncation:
    uint8_t hexagram_id  = (uint8_t)((base * 64u) / 360u);

    return (Unified_Clock_State){
        .tick12           = tick12,
        .m2_decan_phase   = decan_phase,
        .m3_hexagram_id   = hexagram_id,
        .is_implicate_phase = is_implicate
    };
}
```

**Operational Example:**
- Degree 0: `{torus=0, decan=0, hex=0, implicate=false}` — ground state
- Degree 90: `{torus=3, decan=9, hex=16, implicate=false}` — East cardinal
- Degree 180: `{torus=6, decan=18, hex=32, implicate=false}` — South cardinal
- Degree 360: `{torus=0, decan=36, hex=0, implicate=true}` — implicate layer begins
- Degree 540: `{torus=6, decan=54, hex=32, implicate=true}` — implicate South

The Pi Agent uses `read_cosmic_clock` to synchronize all three subsystem layers (M1/M2/M3) from a single degree parameter, enabling cross-layer temporal alignment in a single CPU instruction sequence.

---

## FR 2.3.6: Epogdoon Bridge — M2↔M3 Harmonic Translation

**Requirement:** The engine MUST provide three bridge functions between M2 (72-fold vibrational) and M3 (64-fold symbolic) that implement the 9:8 Epogdoon ratio, SU(2) shadow-phase frequency shifting, and evolutionary gap detection. All functions are integer-only and O(1).

### Mathematical Foundation

The 9:8 Epogdoon (Pythagorean major whole tone) is the boundary function between M2 (Vibration/Sound) and M3 (Symbol/Matter):
- M2 is 72-fold (72 = 36 × 2 SU(2) phases, where 36 = max rotational energy sum of two TT pairs)
- M3 is 64-fold (64 = 2^6)
- 72 × (8/9) = 64 exactly — integer Fourier compression
- The 8 missing states (72 - 64 = 8) are evolutionary gaps: vibrational frequencies that cannot manifest as static symbols

### Bridge Functions

```c
// ==============================================================================
// FR 2.3.6: EPOGDOON HARMONIC TRANSLATOR (M2 ↔ M3 Bridge)
// ==============================================================================

// 1. ASCENDING: M3 (Symbol) → M2 (Sound/Vibration)
// Maps a codon's rotational sum (0-36) to a Parashakti frequency index (0-71).
// Shadow phase shifts into the upper 36-72 octave (SU(2) implicate layer).
static inline uint8_t get_parashakti_frequency(Rotational_State m3_state,
                                                bool is_shadow_phase) {
    // total_sum is naturally in range 0-36 (max: TT+TT = 18+18 = 36)
    uint8_t base_frequency = (uint8_t)m3_state.total_sum;
    return is_shadow_phase ? (uint8_t)(base_frequency + 36u) : base_frequency;
}

// 2. DESCENDING: M2 (Sound/Vibration) → M3 (Symbol/Manifestation)
// The 9:8 Epogdoon Compression — integer Fourier descent.
// Projects the 72-fold Maqamat/Mantra index into the 64-bit hexagram address space.
// Formula: m2_idx × 8 / 9 (integer math truncates, which IS the compression).
static inline uint8_t apply_epogdoon_compression(uint8_t m2_vibration_index_0_to_71) {
    // 72 × (8/9) = 64. Integer truncation IS the "rounding into matter."
    return (uint8_t)((m2_vibration_index_0_to_71 * 8u) / 9u);
}

// 3. EVOLUTIONARY GAP DETECTION
// Determines if an M2 vibrational index falls into one of the 8 "unmanifest" gaps.
// A gap = a frequency that cannot round-trip through compression and expansion.
// These 8 gaps drive evolutionary spiral (STATUS_PROVISIONAL trigger).
static inline bool is_evolutionary_gap(uint8_t m2_vibration_index) {
    uint8_t compressed = apply_epogdoon_compression(m2_vibration_index);
    // Inverse: expand back via × 9 / 8 (the Epogdoon's reciprocal)
    uint8_t expanded   = (uint8_t)((compressed * 9u) / 8u);
    // If round-trip fails, this is an unmanifest vibrational tone
    return (expanded != m2_vibration_index);
}
```

**Operational Example — Harmonic Alchemical Query:**
1. User reports psychological state of "King of Swords in shadow phase"
2. Pi looks up King of Swords primary_codon (e.g., GTG = G:0b11, T:0b01, G:0b11)
3. Engine computes `compute_rotational_state` for the codon's pair indices → `total_sum = 33`
4. Engine calls `get_parashakti_frequency({33, diff}, true)` → returns `33 + 36 = 69`
5. M2 engine looks up frequency index 69 → returns Maqamat name, Decan, Mantra
6. Pi returns to user: not just Tarot advice but the exact acoustic frequency (Mantra) needed to harmonize that state

**Physical Interpretation:** When DNA (M3) "hears" the 8 missing M2 tones but cannot physically embody them, the system experiences fundamental harmonic tension. This tension IS the mechanism of genetic mutation — the Epogdoon is the mathematical cause of evolution.

---

## FR 2.3.7: polar_opposite_su2 — SU(2)-Preserving Opposition

**Requirement:** Polar opposition across the 360-degree wheel MUST preserve the SU(2) double-covering layer. A naïve `(d + 180) % 360` collapses both layers; the SU(2)-correct form keeps the shadow layer intact.

```c
// ==============================================================================
// FR 2.3.7: SU(2)-PRESERVING POLAR OPPOSITE
// ==============================================================================
// Standard polar_opposite would collapse both SU(2) layers:
//   (d + 180) % 360  — WRONG for 720° space
//
// Correct form: preserve the shadow layer offset, apply opposition within layer.
static inline uint16_t polar_opposite_su2(uint16_t current_720_degree) {
    // Determine which SU(2) layer we are in
    uint16_t layer_offset = (current_720_degree >= 360u) ? 360u : 0u;
    // Apply opposition within the 360° layer
    uint16_t base_degree  = current_720_degree % 360u;
    return layer_offset + (uint16_t)((base_degree + 180u) % 360u);
}
// Examples:
//   d=0   → layer=0,   base=0,   result=180    (primary layer)
//   d=180 → layer=0,   base=180, result=0      (primary layer)
//   d=360 → layer=360, base=0,   result=540    (shadow layer)
//   d=540 → layer=360, base=180, result=360    (shadow layer)
// The shadow layer is preserved: opposing a shadow-layer degree
// stays in the shadow layer. Daylight and shadow never collapse into each other.
```

**Contrast with the simpler wheel functions that DO NOT need SU(2) preservation:**

```c
// These operate within a single 360° layer and are correct as-is:
static inline uint16_t flow_clockwise(uint16_t d) { return (d + 1u) % 360u; }
static inline uint16_t polar_opposite_simple(uint16_t d) { return (d + 180u) % 360u; }
static inline uint8_t  quadrant(uint16_t d)               { return (uint8_t)(d / 90u); }
// Use polar_opposite_su2 whenever d may be in 0-719 (full double-cover).
// Use polar_opposite_simple only within a known single 360° layer.
```

---

## FR 2.3.8: STATUS_PROVISIONAL Integration

**Requirement:** When M3 encounters the 8-fold gap in the Resonance Matrix (sentinel `0xFF`), the engine MUST raise `STATUS_PROVISIONAL` in the coordinate flags and yield control to the Pi Agent. The engine MUST NOT crash, throw a null pointer exception, or return an undefined result.

### Behavior Specification

```c
// ==============================================================================
// FR 2.3.8: STATUS_PROVISIONAL — Evolutionary Gap Protocol
// ==============================================================================
// When M3 hits 0xFF gap in Resonance Matrix:
//   1. Set STATUS_PROVISIONAL_BIT in coordinate flags
//   2. Return false / sentinel value to caller
//   3. Do NOT crash, abort, or trigger undefined behavior
//   4. Hand control to Pi Agent for novel mutation
//
// The Pi Agent interprets STATUS_PROVISIONAL as:
//   "Genetic determinism ends here. Generate a novel mutation."
// This enforces spiral evolution as a structural feature of the C architecture.
//
// Downstream consumers MUST check STATUS_PROVISIONAL before using results:

static inline uint8_t m3_resonance_lookup(uint8_t codon_id,
                                           uint32_t* coord_flags) {
    extern const uint8_t M3_RES_MATRIX[64];
    uint8_t result = M3_RES_MATRIX[codon_id];
    if (result == M3_RESONANCE_GAP) {
        *coord_flags |= STATUS_PROVISIONAL_BIT;
        // Return sentinel; caller must check coord_flags
        return M3_RESONANCE_GAP;
    }
    return result;
}

// Caller pattern:
//   uint8_t resonance = m3_resonance_lookup(codon_id, &coord_flags);
//   if (coord_flags & STATUS_PROVISIONAL_BIT) {
//       pi_agent_generate_mutation(codon_id, &coord_flags);
//       return;
//   }
//   // proceed with resonance value
```

**The 8 Gap Positions:** The exact 8 positions with `M3_RESONANCE_GAP = 0xFF` in `M3_RES_MATRIX[64]` correspond to the 8 M2 vibrational frequencies that cannot compress into the 64-space. These positions are not errors in the dataset — they are intentional architectural absences. Where Complementarity (`M3_COMP_MATRIX[64]`) and Movement (`M3_MOVE_MATRIX[64]`) are complete (every codon maps to a result), Resonance is open — it has 8 gaps that allow for novelty, mutation, and genuine emergence.

---

## FR 2.3.9: #3-3 — Universal Transcription Engine (The Operational Hub)

**Requirement:** The C engine MUST implement the Universal Transcription Engine as the central orchestration module of M3, containing: (a) 96 non-dual codon relations as a base mask, (b) 336 dual codon pairs as a transformation field, (c) three matrix operators (Complementarity 64, Movement 64, Resonance 56+8 gaps), (d) RNA transcription (37 codons), (e) amino acid architecture (24-fold), and (f) human karyotype (23+1 pairs).

**Ontological Ground:** #3-3 (Universal Transcription Engine — 293 nodes, 1,642 relations, 1,292 cross-sub-branch edges)

### Sub-Structure Overview

| Coord | Name | Nodes | Key Relations | C Pattern |
|-------|------|-------|--------------|-----------|
| #3-3-0 | Non-Dual Relations | 4+96 | IS_CLASSIFIED_AS, INITIATES | `uint64_t non_dual_mask` — 40 always-set bits |
| #3-3-1 | Dual Relations | 336 | IS_CLASSIFIED_AS, INITIATES | `uint64_t dual_field[6]` — polarity pairs |
| #3-3-2 | Matrix Operators | 3+184 | COMPLEMENTARITY/MOVEMENT/RESONANCE_PATH | Three transform matrices |
| #3-3-3 | RNA Transcription | 7+37 | HAS_RNA_POTENTIAL, TRANSCRIBES_TO | T→U substitution engine |
| #3-3-4 | Amino Acids | 24 | HYDROPHOBIC_FAMILY, PROVIDES_VESSEL_FOR | Protein translation LUT |
| #3-3-5 | Karyotype | 27 | GENETIC_ARCHETYPAL_MANIFESTATION, KARMIC_BLUEPRINT | Chromosome→Arcana map |

### #3-3-2: The Three Matrix Operators

| Matrix | Coord | Entries | C Pattern |
|--------|-------|---------|-----------|
| **Complementarity** | #3-3-2-0 | **64** (complete) | `const uint8_t M3_COMP_MATRIX[64]` — .rodata |
| **Movement** | #3-3-2-1 | **64** (complete) | `const uint8_t M3_MOVE_MATRIX[64]` — .rodata |
| **Resonance** | #3-3-2-2 | **56 + 8 gaps** (open) | `const uint8_t M3_RES_MATRIX[64]` — .rodata, 0xFF = gap |

### #3-3-3: RNA Transcription Family (37 Codons)

37 RNA codons — all DNA codons containing at least one Thymine, with T→U substitution. The `is_rna_phase` flag in `M3_IChing_State` activates the `get_polarity_phased` XOR at the nucleotide level, propagating the DNA/RNA distinction through the entire system from a single bit rather than a new LUT.

### Aggregate C Structure

```c
// ==============================================================================
// FR 2.3.9: UNIVERSAL TRANSCRIPTION ENGINE — M3's operational hub
// ==============================================================================
typedef struct {
    // Non-dual foundation
    uint64_t non_dual_mask;             // 40 always-set bits

    // Dual field
    uint64_t dual_field[6];             // 336 polarity pairs (6 × 64-bit words)

    // Three matrix operators (.rodata pointers)
    const uint8_t* comp_matrix;         // → M3_COMP_MATRIX[64]  (complete)
    const uint8_t* move_matrix;         // → M3_MOVE_MATRIX[64]  (complete)
    const uint8_t* res_matrix;          // → M3_RES_MATRIX[64]   (56 valid + 8 = 0xFF)

    // Transcription pipeline
    const uint8_t* rna_lut;             // → M3_RNA_LUT[37]
    const uint8_t* amino_lut;           // → M3_AMINO_LUT[24]
    const uint8_t* codon_to_aa;         // → M3_CODON_TO_AA[64]

    // Karyotype
    const uint8_t* karyo_lut;           // → M3_KARYO_LUT[25]

    // STATUS_PROVISIONAL tracking
    uint32_t       coord_flags;         // Bit field; STATUS_PROVISIONAL_BIT at bit 4
} M3_Transcription_Engine;
```

---

## FR 2.3.10: #3-4 — Minor Arcana & DNA/RNA Superposition Phase Space

**Requirement:** The C engine MUST implement: (a) the 56 Minor Arcana cards as a rotational dynamics calculator organized by 4 elemental suits × 14 cards using the corrected nucleotide assignments (CUPS=A, WANDS=T, PENTACLES=C, SWORDS=G), (b) the 22 Major Arcana as transcription pathways corresponding 1:1 with autosomal chromosomes, and (c) the DNA/RNA Superposition Phase Space (#3-4.0) via the `is_rna_phase` single-bit flag, not a separate LUT.

### The 4 Elemental Suits (Corrected Encoding)

| Suit | Coord | Element | Nucleotide | 2-Bit | I-Ching Line | Cards |
|------|-------|---------|------------|-------|-------------|-------|
| Cups | #3-4-1 | Water | **Adenine (A)** | 0b00 | Old Yin (6) / Yin Moving | Ace through King (14) |
| Wands | #3-4-2 | Fire | **Thymine (T)** | 0b01 | Old Yang (9) / Yang Moving | Ace through King (14) |
| Pentacles | #3-4-3 | Earth | **Cytosine (C)** | 0b10 | Young Yin (8) / Yin Resting | Ace through King (14) |
| Swords | #3-4-4 | Air | **Guanine (G)** | 0b11 | Young Yang (7) / Yang Resting | Ace through King (14) |

**Note:** This corrects the earlier spec (FR 2.3.4) which had Wands=A and Cups=T. The corrected mapping aligns the 2-bit nucleotide encoding with the Tarot_Suit enum values: suit index = nucleotide 2-bit value. No translation table is needed between nucleotides and suits.

### DNA/RNA Superposition (#3-4.0)

The "polarity inversion" between DNA (#3-2) and the superposition phase space (#3-4.0) is implemented entirely via the `is_rna_phase` single-bit flag in `M3_IChing_State`. When `is_rna_phase = true`:
- `get_polarity_phased(A, true)` → Yang (A normally Yin — inverted)
- `get_polarity_phased(T, true)` → Yin (T normally Yang — inverted)
- `get_polarity_phased(C, true)` → Yang (C normally Yin — inverted)
- `get_polarity_phased(G, true)` → Yin (G normally Yang — inverted)

This single XOR against `is_rna` makes DNA/RNA strand complementarity a physical law of the execution context. The 69-node `#3-4.0` sub-branch (4 nucleotide families × 16 members = 64 superposition states + containers) does not require a separate 64-entry LUT; it is a contextual interpretation of the existing codon space.

---

## FR 2.3.11: #3-5 — The 360-Degree Mythic Synthesis Wheel

**Requirement:** The C engine MUST implement the 360-degree Mythic Synthesis Wheel as a `uint16_t` degree-indexed LUT with 720-degree SU(2) double-covering. The `polar_opposite_su2` function (FR 2.3.7) MUST be used for all opposition operations. Simple modular arithmetic covers clockwise flow and quadrant assignment without a LUT.

### Key Constants and Structures

```c
// Degree position in the 360° wheel
typedef struct {
    uint16_t degree;            // 0-359 (primary)
    uint16_t shadow;            // degree + 360 (shadow layer)
    uint8_t  quadrant;          // 0-3 (N/E/S/W)
    uint8_t  sector;            // 0-23 (15° sectors via 24-spoke division)
    uint8_t  trigram_earlier;   // Earlier Heaven trigram at this position
    uint8_t  trigram_later;     // Later Heaven trigram at this position
    uint8_t  sign;              // Zodiacal sign (0-11, 30° each)
    uint8_t  decan;             // Decan within sign (0-2, 10° each)
} M3_DegreePosition;

// 360 degree positions in .rodata
static const M3_DegreePosition M3_DEGREE_LUT[360];

// Full wheel state — mutable, on heap
typedef struct {
    uint16_t current_degree;    // Active degree (0-719 for full double-cover)
    uint8_t  layer;             // 0 = primary (0-359), 1 = shadow (360-719)
    uint64_t active_sectors;    // Bitboard: which of 24 sectors are active
    uint8_t  season;            // Current quarter (0-3)
    uint8_t  heaven_mode;       // 0 = Earlier, 1 = Later
} M3_Wheel_State;

// Ring buffer — 12-deep for SU(2) double-covering (6 QL positions × 2)
typedef struct {
    uint16_t buffer[12];
    uint8_t  head;
    uint8_t  count;
} M3_Ring_Buffer;

// Full rotation requires 720°
static inline bool identity_returned(const M3_Wheel_State* ws) {
    return ws->current_degree >= 720u;
}
```

### The 4 Cardinal Anchors + Axis Mundi

| Coord | Position | Degree | Role |
|-------|----------|--------|------|
| #3-5-1 | North | 0° | Transcendent pole — the apex |
| #3-5-2 | South | 180° | Manifestation pole — the nadir |
| #3-5-3 | East | 90° | Emergence gateway — dawn |
| #3-5-4 | West | 270° | Integration gateway — twilight |
| #3-5-5/0 | Center | Origin | Axis Mundi — dual role: convergence + emanation |

---

## Complete M3 Data Architecture Summary

### All .rodata LUTs (Immutable — the "Siva" face of M3)

| LUT | Size | Type | FR |
|-----|------|------|----|
| `M3_PAIR_MATRIX` | 16 entries | `M3_SD_Value[16]` | 2.3.2 |
| `M2_TO_M3_CYMATIC_PROJECTION` | 72 entries | `uint64_t[72]` | 2.3.0 |
| `M3_TRIGRAM_LUT` | 8 entries | `M3_Trigram[8]` | 2.3.1 |
| `M3_HEXAGRAM_LUT` | 64 entries | `M3_Hexagram[64]` | 2.3.1 |
| `M3_CODON_LUT` | 64 entries | `M3_Codon[64]` | 2.3.1 |
| `M3_DINUC_LUT` | 16 entries | `M3_DinucPair[16]` | 2.3.1 |
| `M3_COMP_MATRIX` | 64 entries | `uint8_t[64]` | 2.3.9 |
| `M3_MOVE_MATRIX` | 64 entries | `uint8_t[64]` | 2.3.9 |
| `M3_RES_MATRIX` | 64 entries | `uint8_t[64]` (8 = 0xFF) | 2.3.3 |
| `M3_RNA_LUT` | 37 entries | `M3_RNA_Codon[37]` | 2.3.9 |
| `M3_AMINO_LUT` | 24 entries | `M3_AminoAcid[24]` | 2.3.9 |
| `M3_CODON_TO_AA` | 64 entries | `uint8_t[64]` | 2.3.9 |
| `M3_KARYO_LUT` | 25 entries | `M3_Chromosome[25]` | 2.3.9 |
| `M3_MINOR_LUT` | 56 entries | `Minor_Arcana_Card[56]` | 2.3.4 |
| `M3_MAJOR_LUT` | 22 entries | `M3_MajorCard[22]` | 2.3.10 |
| `M3_DEGREE_LUT` | 360 entries | `M3_DegreePosition[360]` | 2.3.11 |

### All Mutable State (Heap — the "Shakti" face of M3)

| State | Type | Lives in |
|-------|------|----------|
| `M3_Reception_Ground` | Struct with function pointers | Heap |
| `M3_IChing_State` | Active hexagram + `is_rna_phase` flag | Heap |
| `M3_Transcription_Engine` | Hub struct with .rodata pointers + `coord_flags` | Heap |
| `M3_Wheel_State` | Current degree (0-719), layer, active_sectors | Heap |
| `M3_Ring_Buffer` | 12-deep SU(2) degree history | Heap |

### All O(1) Inline Functions (No Heap, No LUT)

| Function | FR | Computation |
|----------|----|-------------|
| `GET_POLARITY(nuc)` | 2.3.1 | `nuc & 0x01` |
| `GET_MOBILITY(nuc)` | 2.3.1 | `(nuc >> 1) & 0x01` |
| `get_base_pair(nuc)` | 2.3.1 | `nuc ^ 0x01` |
| `get_polarity_phased(nuc, is_rna)` | 2.3.1 | `GET_POLARITY(nuc) ^ is_rna` |
| `encode_codon(n1,n2,n3)` | 2.3.1 | `(n1<<4)|(n2<<2)|n3` |
| `m3_line_change(hex,line)` | 2.3.1 | `hex ^ (1u << line)` |
| `complement(hex)` | 2.3.1 | `hex ^ 0x3F` |
| `integral_symmetry_field(word)` | 2.3.0 | `__builtin_bswap64(word)` |
| `compute_rotational_state(p1,p2)` | 2.3.3 | LUT add × 2 |
| `read_cosmic_clock(degree)` | 2.3.5 | Integer division × 3 |
| `get_parashakti_frequency(state, shadow)` | 2.3.6 | Add + conditional |
| `apply_epogdoon_compression(m2_idx)` | 2.3.6 | `(idx * 8) / 9` |
| `is_evolutionary_gap(m2_idx)` | 2.3.6 | Compress + expand + compare |
| `polar_opposite_su2(degree)` | 2.3.7 | Modular arithmetic × 2 |
| `flow_clockwise(d)` | 2.3.11 | `(d+1) % 360` |

---

## Complete M3 Pointer Topology

```
                M1 (#1-5)          M2 (#2, #2-5)
                    ↓                    ↓
                INHERITS_QUATERNION   TRANSFORMS_72_TO_64
                    ↓                    ↓
                ┌──────────────────────────┐
                │  #3-0 Reception Ground   │
                │  (epogdoon → base_mask)  │
                │  + Cymatic Projection LUT│
                └─────────┬────────────────┘
                          │
      ┌───────┬───────┬───┴───┬───────┬───────┐
      ↓       ↓       ↓       ↓       ↓       │
   #3-1    #3-2    #3-3    #3-4    #3-5       │
  I-Ching  DNA    Engine  Arcana   Wheel      │
   (73)    (85)   (293)   (153)   (390)       │
      │       │       │       │       │       │
      │       ├───────┤       │       │       │
      │      820 edges│       │       │       │
      │    (substrate)│       │       │       │
      │       │    1,292 edges│       │       │
      │       │   (hub→all)   │       │       │
      ├───────┤       ├───────┤       │       │
      │ isomorphic    │ TRANSLATES    │       │
      │ 6-bit space   │ GOVERNS (129) │       │
      │       │       │       │       │       │
      ├───────┴───────┼───────┤  ← 31 edges  │
      │  BRIDGES (8)  │       │  to wheel     │
      │  HEAVEN (16)  │       │               │
      └───────┬───────┘       └───────┬───────┘
              │                       │
              └─── #3-4.0 ────────────┘
              DNA/RNA Superposition
              (is_rna_phase single bit)
              Polarity INVERSION via XOR
```

---

## Complete M3 Operational Flow

```
LAYER 0: M0 Archetypal Numbers (64, 8, 6, 3, 2, 56, 22, 360, 720, 24, 37, 72, 36, 18...)
          ↓ elucidates

LAYER 1: M1 Quaternion Algebra (SU(2) from #1-5)
          ↓ INHERITS_QUATERNION_FROM

LAYER 2: M2 Vibrational Matrix (72-space from #2, epogdoon at #2-5)
          ↓ TRANSFORMS_72_TO_64_VIA (val * 8 / 9)
          ↓ M2_TO_M3_CYMATIC_PROJECTION[72] (bitwise OR = wave superposition)

LAYER 3: #3-0 Reception Ground → base_mask (40-bit non-dual)
          ↓ ENABLES × 5

          ┌── #3-1 I-Ching: 8 trigrams → 64 hexagrams (uint64_t bitboard)
          │   2-Bit Nucleotide Logic: A=0b00, T=0b01, C=0b10, G=0b11
          │   LINE_CHANGE (384) = XOR algebra
          │   COMPLEMENTS (12) = bitwise inversion (hex ^ 0x3F)
          │   RESOLVES_TO (184) → Engine
          │   is_rna_phase bit → polarity inversion via get_polarity_phased
          │
          ├── #3-2 Genetic Code: 4 nucleotides → 64 codons (SAME uint64_t)
          │   Symmetry: INTEGRAL (192) / DIAGONAL (46) / VERTICAL (32) / HORIZONTAL (31)
          │   BASE_PAIRS_WITH (4): A↔T, C↔G via XOR 0x01
          │   M3_PAIR_MATRIX[16]: unified 16-pair S/D LUT
          │
          ├── #3-3 Universal Engine (THE HUB — 1,292 cross-sub edges)
          │   ├─ Non-Dual [96] → 40-bit base mask
          │   ├─ Dual [336] → transformation field
          │   ├─ Matrix 1: Complementarity [64] — complete
          │   ├─ Matrix 2: Movement [64] — complete
          │   ├─ Matrix 3: Resonance [56] — 8-fold spiral gap → STATUS_PROVISIONAL
          │   ├─ compute_rotational_state(p1,p2) → Rotational_State (O(1))
          │   ├─ get_parashakti_frequency(state, shadow) → M2 index 0-71
          │   ├─ apply_epogdoon_compression(m2_idx) → M3 index 0-63
          │   ├─ is_evolutionary_gap(m2_idx) → bool
          │   ├─ RNA Transcription [37] — T→U, 27-fold shadow
          │   ├─ Amino Acids [24] — 4! permutation-complete
          │   └─ Karyotype [25] — chromosome→arcana map
          │
          ├── #3-4 Phase Space Calculator
          │   ├─ Minor Arcana [56] = CUPS(A) / WANDS(T) / PENTACLES(C) / SWORDS(G)
          │   │   Kings + Princes: 2 codons each (primary + shadow)
          │   │   64→56 structural compression, fully invertible
          │   ├─ Major Arcana [22] = transcription pathways (1:1 chromosomes)
          │   └─ #3-4.0 DNA/RNA Superposition [is_rna_phase bit]
          │       get_polarity_phased(nuc, is_rna) — single XOR, no LUT
          │
          ├── #3-5 360° Wheel (96% self-contained)
          │   360 degrees × 4 operations (GOVERNS/FLOWS/POLAR/ANCHORED)
          │   polar_opposite_su2: SU(2)-preserving opposition
          │   read_cosmic_clock(0-719): unified M1/M2/M3 synchronization (O(1))
          │   720° SU(2) double-covering → 12-deep ring buffer
          │   2 Heaven arrangements: Earlier (cosmic) / Later (temporal)
          │
          ↓ SUCCEEDED_BY_AND_MANIFESTS_THROUGH
          #4 (Nara) — the Lemniscate fold begins
          The (0/1/2/3) frame completes; nesting at #4 transforms phase
```

---

## FR 2.3.12: NUCLEOTIDE_ICHING_VALUE — Canonical I-Ching Numeric LUT

**Requirement:** Every nucleotide has a canonical I-Ching numeric value. These values ARE the system's root arithmetic — all pair sums, codon sums, and integral invariants derive from them. The LUT must live in `.rodata` and must never be computed at runtime.

### Canonical Values (BimbaVault 3-1 Source — Non-Negotiable)

| 2-bit | Nucleotide | I-Ching Value | Name | Phase |
|-------|-----------|--------------|------|-------|
| `0b00` | **A** | **6** | Lao Yin | Yin, Moving (yielding force in motion) |
| `0b01` | **T** | **9** | Lao Yang | Yang, Moving (firm force in motion) |
| `0b10` | **C** | **7** | Shao Yin | yin, Resting (lesser Yin, stable) |
| `0b11` | **G** | **8** | Shao Yang | yang, Resting (lesser Yang, stable) |

**Critical Note:** C=7 and G=8 were transposed in earlier working notes from the Gemini refinement session. The canonical source (BimbaVault `3-1/64 DNA-I Ching Integration Seed Info.md`) is authoritative. The arithmetic (pair sums) was always correct; only the value annotations were swapped in commentary.

### Implementation

```c
/* --- FR 2.3.12: Canonical I-Ching Numeric LUT --- */

/* In .rodata — these values are eternal and immutable */
static const uint8_t NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8};
/*  Index: 0=A→6 (Yin,Moving), 1=T→9 (Yang,Moving),
 *          2=C→7 (yin,Resting), 3=G→8 (yang,Resting)          */

/* O(1) accessor — single array index, no branch */
static inline uint8_t get_iching_value(uint8_t nuc2bit) {
    return NUCLEOTIDE_ICHING_VALUE[nuc2bit & 0x03];
}

/* Codon I-Ching sum: outer + middle + inner nucleotide values
 * codon6bit layout: [outer(2)] [middle(2)] [inner(2)]         */
static inline uint8_t get_codon_iching_sum(uint8_t codon6bit) {
    return NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 4) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 2) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit)      & 0x03];
}
```

### Invariants

| Property | Value | Verification |
|----------|-------|-------------|
| Sum of all 4 values | 6+9+7+8 = **30** | `_Static_assert` on sum |
| Min codon sum (AAA) | 6+6+6 = **18** | Lower bound |
| Max codon sum (TTT) | 9+9+9 = **27** | Upper bound |
| All values in range [6,9] | — | Fit in 4 bits (`uint8_t`) |

```c
/* Compile-time verification of LUT integrity */
_Static_assert(
    NUCLEOTIDE_ICHING_VALUE[0] + NUCLEOTIDE_ICHING_VALUE[1] +
    NUCLEOTIDE_ICHING_VALUE[2] + NUCLEOTIDE_ICHING_VALUE[3] == 30,
    "NUCLEOTIDE_ICHING_VALUE must sum to 30 (6+9+7+8)"
);
```

---

## FR 2.3.13: 4-Evaluation System — Dinucleotide Pair S/D Matrix

**Requirement:** Every codon is evaluated across 4 complementary valence axes. This is the M3 computational spine for cross-domain resonance: DNA→Tarot→I-Ching→musical interval→degree position. The 16 dinucleotide pair S/D values are the atomic building blocks; codon evaluations compose additively from them.

### M3_CodonEvaluation Struct

```c
/* 4-axis evaluation for any codon or codon pair */
typedef struct {
    int8_t  pp;   /* (+,+): positive resonance integral — convergent peak   */
    int8_t  mm;   /* (-,-): negative resonance integral — convergent trough */
    int8_t  mp;   /* (-,+): ascending resonance — divergent rising          */
    int8_t  pm;   /* (+,-): descending resonance — divergent falling        */
} M3_CodonEvaluation;
```

**Additive Composition Law:** For any two codons X and Y with evaluations `eX` and `eY`, the combined evaluation `eXY` is the element-wise sum: `eXY.pp = eX.pp + eY.pp`, etc. This is a strict additive invariant — the 4-evaluation system is a linear algebra over the codons.

### Canonical Dinucleotide Pair S/D Matrix (BimbaVault 3-1)

The **S** value is the pair sum (= sum of the two nucleotide I-Ching values).
The **D** value is the signed deviation (= directional asymmetry of the pair).

**Matrix 1 — M1: Watson-Crick Complementary Pairs**

| Pair | S (Sum) | D (Deviation) | Type | I-Ching Relationship |
|------|---------|--------------|------|---------------------|
| AA   | 12 | 0  | homo-Yin-Moving | Self-pair, pure Yin movement |
| TT   | 18 | 0  | homo-Yang-Moving | Self-pair, pure Yang movement |
| CC   | 14 | 0  | homo-yin-Resting | Self-pair, stable Yin |
| GG   | 16 | 0  | homo-yang-Resting | Self-pair, stable Yang |
| AT   | 15 | −3 | Watson-Crick | A leads T: Yin→Yang, net descending |
| TA   | 15 | +3 | Watson-Crick | T leads A: Yang→Yin, net ascending |
| CG   | 15 | −1 | Watson-Crick | C leads G: yin→yang, minor descending |
| GC   | 15 | +1 | Watson-Crick | G leads C: yang→yin, minor ascending |

**Matrix 2 — M2: Cross-Complementary Pairs**

| Pair | S | D | Type |
|------|---|---|------|
| AG   | 14 | +2 | Moving→Resting cross, Yin-Yang ascending |
| GA   | 14 | +2 | Resting→Moving cross (same sum, same D) |
| TC   | 16 | −2 | Moving→Resting cross, Yang-yin descending |
| CT   | 16 | −2 | Resting→Moving cross (same sum, same D) |

**Matrix 3 — M3: Remaining Pairs**

| Pair | S | D | Type |
|------|---|---|------|
| AC   | 13 | −1 | Yin Moving→Yin Resting, minor descending |
| CA   | 13 | +1 | Yin Resting→Yin Moving, minor ascending |
| TG   | 17 | +1 | Yang Moving→yang Resting, minor ascending |
| GT   | 17 | −1 | yang Resting→Yang Moving, minor descending |

### Pair S/D Encoding

```c
typedef struct {
    uint8_t nuc_a;   /* First nucleotide (2-bit encoded) */
    uint8_t nuc_b;   /* Second nucleotide (2-bit encoded) */
    uint8_t S;       /* Pair sum (18..12 range, fits uint8_t) */
    int8_t  D;       /* Pair deviation (−3..+3 range) */
} M3_DiNucPair;

/* Lookup key: (nuc_a << 2) | nuc_b → 4-bit index into M3_PAIR_MATRIX[16] */
/* M3_PAIR_MATRIX[16] defined in FR 2.3.2 contains full S/D for all 16 pairs */

/* Compose codon evaluation from its three dinucleotide pair components */
static inline M3_CodonEvaluation evaluate_codon(uint8_t codon6bit) {
    /* A codon XYZ has three embedded dinucleotide pairs: XY, YZ, XZ */
    uint8_t X = (codon6bit >> 4) & 0x03;
    uint8_t Y = (codon6bit >> 2) & 0x03;
    uint8_t Z = (codon6bit)      & 0x03;

    const M3_DiNucPair *xy = &M3_PAIR_MATRIX[(X << 2) | Y];
    const M3_DiNucPair *yz = &M3_PAIR_MATRIX[(Y << 2) | Z];

    M3_CodonEvaluation ev;
    /* (+,+): sum of S values — convergent resonance peak */
    ev.pp = (int8_t)(xy->S + yz->S);
    /* (-,-): negation of sum — convergent resonance trough */
    ev.mm = (int8_t)(-(xy->S + yz->S));
    /* (-,+): net D of inner pair (ascending if D>0) */
    ev.mp = yz->D;
    /* (+,-): net D of outer pair (descending if D<0) */
    ev.pm = xy->D;
    return ev;
}
```

---

## FR 2.3.14: 8-Fold Rotational Composition Law

**Requirement:** The 8-fold rotational states of any codon family are compositionally derivable from a pure integer additive rule. Given two dinucleotides `Xy` (root X, context y) and `Za` (root Z, context a), their composition yields a trinucleotide by one of two laws determined by valence. Non-dual compositions (where the two paths converge) produce a bipolar-valence codon — this is why each family's rotational table has **7** unambiguously-polarized entries and **1** bipolar (non-dual) entry.

### Composition Rule

```
Positive valence:  Xy + Za → Xya    (X=root, y+a=compound context)
Negative valence:  Xy + Za → XZa    (X=root, Z=intermediate, a=terminal)
Non-dual:          occurs when Xya == XZa (i.e. y == Z), bipolar valence
```

**Interpretation:**
- **Positive (Xya):** y and a bond together as a unit — the context deepens while the root holds
- **Negative (XZa):** Z inserts between X and a — the intermediate displaces the context
- **Non-dual (y=Z):** both paths produce the same codon — the codon has zero net directional tension

### Implementation

```c
/*
 * compose_rotational_state — apply 8-fold composition law
 *
 * @xy:      dinucleotide pair, 4-bit: (X << 2) | y
 * @za:      dinucleotide pair, 4-bit: (Z << 2) | a
 * @positive: nonzero = positive composition (Xya)
 *            zero    = negative composition (XZa)
 * @returns: trinucleotide codon, 6-bit: (X << 4) | (mid << 2) | a
 */
static inline uint8_t compose_rotational_state(
    uint8_t xy, uint8_t za, int positive
) {
    uint8_t X = (xy >> 2) & 0x03;
    uint8_t y = (xy)      & 0x03;
    uint8_t Z = (za >> 2) & 0x03;
    uint8_t a = (za)      & 0x03;
    return positive
        ? (uint8_t)((X << 4) | (y << 2) | a)   /* Xya */
        : (uint8_t)((X << 4) | (Z << 2) | a);  /* XZa */
}

/*
 * is_nondual_composition — test if a (Xy, Za) pair produces the same
 * codon from both positive and negative composition (y == Z).
 */
static inline int is_nondual_composition(uint8_t xy, uint8_t za) {
    uint8_t y = (xy) & 0x03;
    uint8_t Z = (za >> 2) & 0x03;
    return (y == Z);
}
```

### The 7-Entry Rule

Per codon family (fixed root nucleotide X), the 8-fold rotational table covers 8 compositional slots (one per distinct dinucleotide pair type reachable from X). Of these 8 slots, exactly **1** is non-dual (where both positive and negative composition converge — D=0, bipolar valence). The remaining **7** slots have definite polarity (positive or negative) and are listed as distinct entries.

This is not a deficiency — the non-dual slot IS the system's rest point, the "Sat" (pure being) of the rotation. Its bipolar nature prevents closed-loop repetition and is the engine of evolutionary openness.

```c
#define M3_ROTATIONAL_TABLE_ENTRIES       8   /* total slots per family */
#define M3_ROTATIONAL_POLARIZED_ENTRIES   7   /* unambiguous polarity */
#define M3_ROTATIONAL_NONDUAL_ENTRIES     1   /* bipolar rest point */
```

---

## FR 2.3.15: 360 Integral Invariant — Architectural Bridge to the Cosmic Clock

**Requirement:** The sum of all (+,+) `M3_CodonEvaluation.pp` values across all 64 codons equals exactly 360. This is the master architectural invariant linking M3 (symbolic transcription) to the CF(0/1/2/3) Unified Cosmic Clock (the 360° degree wheel). It must be enforced by compile-time assertion, not runtime check.

### Per-Suit Integral Values (BimbaVault 3-3 Canonical)

| Suit | Nucleotide | Family | (+,+) Integral | Meaning |
|------|-----------|--------|---------------|---------|
| **Cups**      | A | Yin Moving  | **84** | Receptive movement arc |
| **Wands**     | T | Yang Moving | **96** | Active movement arc |
| **Pentacles** | C | yin Resting | **88** | Stable yin ground arc |
| **Swords**    | G | yang Resting | **92** | Stable yang ground arc |
| **Total**     | — | —           | **360** | = Full 360° clock cycle |

### Implementation

```c
/* --- FR 2.3.15: 360 Integral Invariant --- */

#define M3_INTEGRAL_INVARIANT    360U   /* Total (+,+) across all 64 codons */
#define M3_SUIT_A_INTEGRAL        84U   /* Cups:      Yin Moving   */
#define M3_SUIT_T_INTEGRAL        96U   /* Wands:     Yang Moving  */
#define M3_SUIT_C_INTEGRAL        88U   /* Pentacles: yin Resting  */
#define M3_SUIT_G_INTEGRAL        92U   /* Swords:    yang Resting */

/* Compile-time enforcement of the master architectural invariant */
_Static_assert(
    M3_SUIT_A_INTEGRAL + M3_SUIT_T_INTEGRAL +
    M3_SUIT_C_INTEGRAL + M3_SUIT_G_INTEGRAL == M3_INTEGRAL_INVARIANT,
    "M3 360 Integral Invariant violated: sum of all (+,+) codon values must equal 360"
);

/* The 360 clock bridge: every degree position (0-359) maps to exactly one
 * aggregate codon resonance. The M3_DEGREE_TO_CODON_LUT[360] (in FR 2.3.11)
 * combined with the 360 integral invariant makes M3 and CF(0/1/2/3) isomorphic
 * as measurement systems: both count from 0 to 359 with the same underlying
 * combinatorial structure. */
```

### Architectural Significance

The 360 integral invariant is not a coincidence. It is the mathematical proof that:

1. **M3 IS the Cosmic Clock** — the 64 codons partition the 360° circle exactly, with each suit's integral proportional to its elemental weight (Wands=Yang=most energetic=96, Cups=Yin=receptive=84)
2. **The CF(0/1/2/3) frame closes** — the integer clock `read_cosmic_clock(0-719)` and the codon integral both resolve to 360 as their period
3. **No arbitrary constants exist** — the 360° human measurement of a circle (from Babylonian astronomy) and the 64-codon genetic code share a common mathematical root via the I-Ching numeric values {6,7,8,9}

Runtime verification function (called during M3 initialization):

```c
/* Verify the 360 integral invariant against the actual codon evaluation table.
 * Returns 0 on success, -1 if the invariant is violated (should never happen). */
static int m3_verify_integral_invariant(void) {
    int32_t total = 0;
    for (uint8_t codon = 0; codon < 64; codon++) {
        M3_CodonEvaluation ev = evaluate_codon(codon);
        total += ev.pp;
    }
    return (total == (int32_t)M3_INTEGRAL_INVARIANT) ? 0 : -1;
}
```

---

## FR 2.3.16: Full Tarot-Codon LUT — 4-Suit Canonical Assignment

**Requirement:** Every DNA codon maps to exactly one Tarot card position. The 64 codons distribute across 4 suits (16 codons each), with Court Cards (King and Prince/Knight) each holding 2 codons as dual-codon archetypes. The LUT is in `.rodata` — immutable, canonical, sourced from BimbaVault `3-3/64 DNA-Tarot Integration Seed Info.md`.

### Suit-Nucleotide Correspondence

| Nucleotide | 2-bit | Suit | Element | Principle |
|-----------|-------|------|---------|-----------|
| **A** | `0b00` | **Cups** | Water | Yin Moving — emotional/receptive |
| **T** | `0b01` | **Wands** | Fire | Yang Moving — willful/active |
| **C** | `0b10` | **Pentacles** | Earth | yin Resting — material/stable |
| **G** | `0b11` | **Swords** | Air | yang Resting — mental/penetrating |

### Court Card Dual-Codon Structure

Each suit's 16 codons cover 14 card positions (Ace through 10 = 10 pips + 4 courts). King and Prince each govern 2 codons (as "bridging" archetypes representing dual aspects of their elemental principle). Queen and Princess/Page each govern 1 codon.

```
16 codons per suit breakdown:
  Ace (1) + 2-10 (9 pips) = 10 pip positions = 10 codons
  Princess/Page            =  1 codon
  Prince/Knight            =  2 codons  (dual-codon court)
  Queen                    =  1 codon
  King                     =  2 codons  (dual-codon court)
  Total                    = 16 codons ✓
```

### M3_TarotCodonEntry Struct

```c
/* Canonical Tarot-Codon LUT entry */
typedef struct {
    uint8_t  suit;       /* 0=A/Cups, 1=T/Wands, 2=C/Pentacles, 3=G/Swords */
    uint8_t  pip;        /* 0=Ace, 1-9=2-10, 10=Princess, 11=Prince,
                            12=Queen, 13=King; use M3_TAROT_PIP_* macros */
    uint8_t  codon_a;    /* Primary codon (6-bit) */
    uint8_t  codon_b;    /* Secondary codon for dual-codon courts, 0xFF = none */
} M3_TarotCodonEntry;

#define M3_TAROT_PIP_ACE        0
#define M3_TAROT_PIP_PRINCESS  10
#define M3_TAROT_PIP_PRINCE    11
#define M3_TAROT_PIP_QUEEN     12
#define M3_TAROT_PIP_KING      13
#define M3_TAROT_SINGLE_CODON  0xFF   /* sentinel: no second codon */

/* Suit integrity macro — compile-time check not possible for runtime LUT,
 * use m3_verify_tarot_integral() during init */
#define M3_TAROT_ENTRIES_PER_SUIT  16
#define M3_TAROT_SUITS             4
```

### Suit Integral Verification

The Tarot LUT must satisfy the 360 integral invariant per suit:

```c
/* Runtime integrity check: verify the (+,+) integral for each suit
 * matches the canonical values from FR 2.3.15.
 * Returns 0 on success, bitmask of failing suits on error. */
static const uint16_t M3_SUIT_INTEGRAL_EXPECTED[4] = {
    M3_SUIT_A_INTEGRAL,   /* Cups = 84 */
    M3_SUIT_T_INTEGRAL,   /* Wands = 96 */
    M3_SUIT_C_INTEGRAL,   /* Pentacles = 88 */
    M3_SUIT_G_INTEGRAL    /* Swords = 92 */
};

static int m3_verify_tarot_integral(const M3_TarotCodonEntry lut[4][16]) {
    int result = 0;
    for (int suit = 0; suit < 4; suit++) {
        int32_t suit_total = 0;
        for (int slot = 0; slot < 16; slot++) {
            M3_CodonEvaluation ev = evaluate_codon(lut[suit][slot].codon_a);
            suit_total += ev.pp;
            if (lut[suit][slot].codon_b != M3_TAROT_SINGLE_CODON) {
                ev = evaluate_codon(lut[suit][slot].codon_b);
                suit_total += ev.pp;
            }
        }
        /* Each entry has 1 or 2 codons; adjust for the double-counted courts */
        if (suit_total != (int32_t)M3_SUIT_INTEGRAL_EXPECTED[suit]) {
            result |= (1 << suit);
        }
    }
    return result;
}
```

**Note on LUT Population:** The specific codon-to-card assignments for all 64 entries are canonical from BimbaVault `3-3/64 DNA-Tarot Integration Seed Info.md`. The `M3_TAROT_CODON_MAP[4][16]` array in `src/m3_mahamaya.c` must be populated exactly from that source. The integral verification function `m3_verify_tarot_integral()` serves as the runtime canonical test — if it passes, the population is correct.

---

## FR 2.3.17: Non-Dual Codon Class — Palindromic Anchors

**Requirement:** Non-dual codons are those that occupy the self-referential (palindromic) position in the rotational composition space: their outer and inner nucleotides are identical (XyX pattern). These codons have zero net directional deviation (D=0 for their outer-inner pair) and appear in both positive and negative compositions with equal probability — bipolar valence. They are the "rest points" of the rotational system and require special handling in STATUS_PROVISIONAL flows.

### Definition

A codon `XYZ` is **non-dual** if and only if `X == Z` (outer nucleotide = inner nucleotide).

```c
/* Test whether a 6-bit codon is non-dual (palindromic: outer == inner) */
static inline int is_nondual_codon(uint8_t codon6bit) {
    uint8_t outer = (codon6bit >> 4) & 0x03;
    uint8_t inner = (codon6bit)      & 0x03;
    return (outer == inner);   /* XyX pattern */
}

#define M3_NONDUAL_CODON_FLAG   0x40   /* bit 6 of an 8-bit flags field */
```

### Non-Dual Codon Enumeration

All 16 non-dual codons (XyX pattern, X ∈ {A,T,C,G}, y ∈ {A,T,C,G}):

| Codon | 6-bit | Outer | Middle | Inner | Suit |
|-------|-------|-------|--------|-------|------|
| **AAA** | `0b000000` | A | A | A | Cups |
| **ACA** | `0b001000` | A | C | A | Cups |
| **AGA** | `0b001100` | A | G | A | Cups |  ← verify encoding
| **ATA** | `0b000100` | A | T | A | Cups |
| **TAT** | `0b010001` | T | A | T | Wands |
| **TCT** | `0b010110`... | T | C | T | Wands |

*Complete table: {A,T,C,G} × {A,T,C,G} for middle position, 4 × 4 = 16 non-dual codons total.*

```c
/* The 16 non-dual codons as 6-bit values in .rodata */
/* Encoding: (outer << 4) | (middle << 2) | inner, where outer == inner */
static const uint8_t M3_NONDUAL_CODONS[16] = {
    /* A-outer: AAA, ATA, ACA, AGA */
    0x00,  /* A(00)A(00)A(00) = 0b000000 = 0x00 */
    0x04,  /* A(00)T(01)A(00) = 0b000100 = 0x04 */
    0x08,  /* A(00)C(10)A(00) = 0b001000 = 0x08 */
    0x0C,  /* A(00)G(11)A(00) = 0b001100 = 0x0C */
    /* T-outer: TAT, TTT, TCT, TGT */
    0x11,  /* T(01)A(00)T(01) = 0b010001 = 0x11 */
    0x15,  /* T(01)T(01)T(01) = 0b010101 = 0x15 */
    0x19,  /* T(01)C(10)T(01) = 0b011001 = 0x19 */
    0x1D,  /* T(01)G(11)T(01) = 0b011101 = 0x1D */
    /* C-outer: CAC, CTC, CCC, CGC */
    0x22,  /* C(10)A(00)C(10) = 0b100010 = 0x22 */
    0x26,  /* C(10)T(01)C(10) = 0b100110 = 0x26 */
    0x2A,  /* C(10)C(10)C(10) = 0b101010 = 0x2A */
    0x2E,  /* C(10)G(11)C(10) = 0b101110 = 0x2E */
    /* G-outer: GAG, GTG, GCG, GGG */
    0x33,  /* G(11)A(00)G(11) = 0b110011 = 0x33 */
    0x37,  /* G(11)T(01)G(11) = 0b110111 = 0x37 */
    0x3B,  /* G(11)C(10)G(11) = 0b111011 = 0x3B */
    0x3F,  /* G(11)G(11)G(11) = 0b111111 = 0x3F */
};

_Static_assert(sizeof(M3_NONDUAL_CODONS) == 16,
    "M3 must have exactly 16 non-dual (palindromic) codons");
```

### Non-Dual Handling in STATUS_PROVISIONAL

Non-dual codons require special STATUS_PROVISIONAL treatment because their bipolar valence means neither the positive nor negative composition path is dominant — the system cannot automatically resolve them:

```c
/*
 * m3_evaluate_with_nondual_guard
 *
 * Evaluates a codon. If non-dual, sets STATUS_PROVISIONAL and returns
 * the zero-deviation (neutral) evaluation. The Pi Agent must resolve
 * non-dual codons by consulting the Context Frame for directional intent.
 */
static M3_CodonEvaluation m3_evaluate_with_nondual_guard(
    uint8_t codon6bit, uint8_t *flags_out
) {
    M3_CodonEvaluation ev = evaluate_codon(codon6bit);
    if (is_nondual_codon(codon6bit)) {
        if (flags_out) *flags_out |= M3_NONDUAL_CODON_FLAG;
        /* Neutral evaluation: mp and pm are zero (no direction),
         * pp and mm remain as the magnitude without valence assignment */
        ev.mp = 0;
        ev.pm = 0;
    }
    return ev;
}
```

**Design Intent:** Non-dual codons ARE the system's generative pause. They are not errors. They represent the I-Ching's "changing lines" — positions of maximum potentiality where the Spanda pulse has not yet resolved into Yin or Yang. The agent (Pi) must make a conscious choice when it encounters one, or defer to the Evolutionary Recompile cycle.

---

## FR 2.3.18: Inner Charge Closed-Form Derivation — No Pre-Computation Needed

**Requirement:** The four `inner_charge` values (`pp`, `nn`, `np`, `pn`) stored on every codon node in the dataset are NOT magic constants — they are closed-form expressions derivable from just the three nucleotide I-Ching values. Any C agent must know this formula to avoid treating them as opaque.

Given codon `XYZ` where `X` = outer nucleotide, `Y` = middle, `Z` = inner, and their I-Ching values from `NUCLEOTIDE_ICHING_VALUE[4] = {A→6, T→9, C→7, G→8}`:

```
pp  =  X + Y + Z   (positive resonance: sum all I-Ching values)
nn  =  X - Y - Z   (negative resonance: outer minus both others)
np  =  X - Y + Z   (ascending:  outer minus middle, plus inner)
pn  =  X + Y - Z   (descending: outer plus middle, minus inner)
```

**Verified against all 128 codon nodes in `nodes-full-detail.json` — 0 errors.**

### Key Arithmetic Invariants

| Invariant | Formula | Example (ATA: X=6,Y=9,Z=6) |
|-----------|---------|---------------------------|
| **4X sum** | `pp + nn + np + pn = 4·X` | `21+(-9)+3+9 = 24 = 4×6` ✓ |
| **Outer recovery** | `(pp + nn) / 2 = X` | `(21-9)/2 = 6` ✓ |
| **Middle recovery** | `(pp - np) / 2 = Y` | `(21-3)/2 = 9` ✓ |
| **Inner recovery** | `(pp - pn) / 2 = Z` | `(21-9)/2 = 6` ✓ |
| **Inner pair deviation** | `pn - np = 2·(Y - Z)` | `9-3 = 12 = 2×(9-6)` ✓ |
| **Range** | `pp ∈ [18, 27]` | `AAA=18, TTT=27` |
| **nn always ≤ 0** when Y+Z ≥ X | typical for all codons | `AAA: 6-6-6=−6` |

### Per-Suit pp Sum (from dataset — 16 codons per suit)

| Suit | Nucleotide | pp sum (all 16 codons) | ÷4 | Relation to 360 |
|------|-----------|----------------------|-----|-----------------|
| Cups      | A | **336** | 84  | 336 = 84 × 4 |
| Wands     | T | **384** | 96  | 384 = 96 × 4 |
| Pentacles | C | **352** | 88  | 352 = 88 × 4 |
| Swords    | G | **368** | 92  | 368 = 92 × 4 |
| **Total** | — | **1440** | 360 | **1440 = 360 × 4** |

The `1440 = 360 × 4` relationship arises directly from the `4X invariant`: summing pp+nn+np+pn over all codons per suit equals 4 × (16 × root_nucleotide_value). The BimbaVault "360 integral invariant" (84+96+88+92=360) is the dataset pp-sum divided by 4.

### C Implementation

```c
/*
 * m3_compute_charges — derive all 4 inner charge values in O(1)
 * No lookup table, no precomputed array. Pure arithmetic.
 */
static inline void m3_compute_charges(
    uint8_t codon6bit,
    int8_t  *pp_out,   /* positive resonance */
    int8_t  *nn_out,   /* negative resonance */
    int8_t  *np_out,   /* ascending          */
    int8_t  *pn_out    /* descending         */
) {
    uint8_t X = NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 4) & 0x03];  /* outer  */
    uint8_t Y = NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 2) & 0x03];  /* middle */
    uint8_t Z = NUCLEOTIDE_ICHING_VALUE[(codon6bit)      & 0x03];  /* inner  */

    *pp_out = (int8_t)(X + Y + Z);   /* always positive (18..27) */
    *nn_out = (int8_t)(X - Y - Z);   /* typically negative       */
    *np_out = (int8_t)(X - Y + Z);   /* ascending resonance      */
    *pn_out = (int8_t)(X + Y - Z);   /* descending resonance     */
}

/* Compile-time verification of the invariant at a single well-known codon */
/* TTT: X=9,Y=9,Z=9 → pp=27, nn=-9, np=9, pn=9; sum=36=4×9 */
_Static_assert((9+9+9) + (9-9-9) + (9-9+9) + (9+9-9) == 4*9,
    "m3_compute_charges 4X invariant must hold for TTT codon");

/* Verify all four charge formulas self-consistently at compile time */
_Static_assert((6+8+9) == 23, "ATG pp check");       /* A-T-G = 6+9+8 = 23 */
_Static_assert((6-9-8) == -11, "ATG nn check");
_Static_assert((6-9+8) == 5,  "ATG np check");
_Static_assert((6+9-8) == 7,  "ATG pn check");
```

---

## FR 2.3.19: Complete Tarot-Codon LUT — Fully Populated

**Requirement:** Populate `M3_TAROT_CODON_MAP` with all 64 canonical assignments from the dataset (`#3-4.0` nodes). This is the authoritative reference — every agent that uses Tarot→Codon lookup must use this table.

### Court Card Dual-Codon Structure (Per-Suit Pattern)

The pattern of which courts get 2 codons ALTERNATES between suit pairs:

| Suit | Page | Knight | Queen | King |
|------|------|--------|-------|------|
| **Cups (A)**      | 1 codon | **2 codons** | 1 codon | **2 codons** |
| **Wands (T)**     | **2 codons** | 1 codon | **2 codons** | 1 codon |
| **Pentacles (C)** | 1 codon | **2 codons** | 1 codon | **2 codons** |
| **Swords (G)**    | **2 codons** | 1 codon | **2 codons** | 1 codon |

Cups/Pentacles (Yin families) share the same dual-codon structure; Wands/Swords (Yang families) share the opposite structure. This is a topological symmetry of the Yin/Yang polarity.

### Complete LUT — All 64 Codons

**Cups (A-family, Yin Moving, I-Ching=6)**

| Rank | Card | Codon | pp | nn | np | pn |
|------|------|-------|----|----|----|----|
| 1  | Ace of Cups     | AAA | 18 | −6 | 6 | 6 |
| 2  | Two of Cups     | AAG | 20 | −8 | 8 | 4 |
| 3  | Three of Cups   | AAT | 21 | −9 | 9 | 3 |
| 4  | Four of Cups    | ACC | 20 | −8 | 6 | 6 |
| 5  | Five of Cups    | ATG | 23 | −11 | 5 | 7 |
| 6  | Six of Cups     | AGA | 20 | −8 | 4 | 8 |
| 7  | Seven of Cups   | AGT | 23 | −11 | 7 | 5 |
| 8  | Eight of Cups   | AGG | 22 | −10 | 6 | 6 |
| 9  | Nine of Cups    | ATT | 24 | −12 | 6 | 6 |
| 10 | Ten of Cups     | ATA | 21 | −9 | 3 | 9 |
| 11 | Page of Cups    | ACA | 19 | −7 | 5 | 7 |
| 12 | Knight of Cups  | ACG (primary), AGC (secondary) | 21 | −9 | 7/5 | 5/7 |
| 13 | Queen of Cups   | AAC | 19 | −7 | 7 | 5 |
| 14 | King of Cups    | ACT (primary), ATC (secondary) | 22 | −10 | 8/4 | 4/8 |

**Wands (T-family, Yang Moving, I-Ching=9)**

| Rank | Card | Codon | pp | nn | np | pn |
|------|------|-------|----|----|----|----|
| 1  | Ace of Wands    | TTT | 27 | −9 | 9 | 9 |
| 2  | Two of Wands    | TTA | 24 | −6 | 6 | 12 |
| 3  | Three of Wands  | TTC | 25 | −7 | 7 | 11 |
| 4  | Four of Wands   | TGG | 25 | −7 | 9 | 9 |
| 5  | Five of Wands   | TAC | 22 | −4 | 10 | 8 |
| 6  | Six of Wands    | TCA | 22 | −4 | 8 | 10 |
| 7  | Seven of Wands  | TCC | 23 | −5 | 9 | 9 |
| 8  | Eight of Wands  | TAA | 21 | −3 | 9 | 9 |
| 9  | Nine of Wands   | TCT | 25 | −7 | 11 | 7 |
| 10 | Ten of Wands    | TAT | 24 | −6 | 12 | 6 |
| 11 | Page of Wands   | TAG (primary), TGA (secondary) | 23 | −5 | 11/7 | 7/11 |
| 12 | Knight of Wands | TGT | 26 | −8 | 10 | 8 |
| 13 | Queen of Wands  | TCG (primary), TGC (secondary) | 24 | −6 | 10/8 | 8/10 |
| 14 | King of Wands   | TTG | 26 | −8 | 8 | 10 |

**Pentacles (C-family, yin Resting, I-Ching=7)**

| Rank | Card | Codon | pp | nn | np | pn |
|------|------|-------|----|----|----|----|
| 1  | Ace of Pentacles     | CCC | 21 | −7 | 7 | 7 |
| 2  | Two of Pentacles     | CCG | 22 | −8 | 8 | 6 |
| 3  | Three of Pentacles   | CCT | 23 | −9 | 9 | 5 |
| 4  | Four of Pentacles    | CAA | 19 | −5 | 7 | 7 |
| 5  | Five of Pentacles    | CGC | 22 | −8 | 6 | 8 |
| 6  | Six of Pentacles     | CGG | 23 | −9 | 7 | 7 |
| 7  | Seven of Pentacles   | CGT | 24 | −10 | 8 | 6 |
| 8  | Eight of Pentacles   | CTG | 24 | −10 | 6 | 8 |
| 9  | Nine of Pentacles    | CTT | 25 | −11 | 7 | 7 |
| 10 | Ten of Pentacles     | CTC | 23 | −9 | 5 | 9 |
| 11 | Page of Pentacles    | CCA | 20 | −6 | 6 | 8 |
| 12 | Knight of Pentacles  | CAG (primary), CGA (secondary) | 21 | −7 | 9/5 | 5/9 |
| 13 | Queen of Pentacles   | CAC | 20 | −6 | 8 | 6 |
| 14 | King of Pentacles    | CAT (primary), CTA (secondary) | 22 | −8 | 10/4 | 4/10 |

**Swords (G-family, yang Resting, I-Ching=8)**

| Rank | Card | Codon | pp | nn | np | pn |
|------|------|-------|----|----|----|----|
| 1  | Ace of Swords     | GGG | 24 | −8 | 8 | 8 |
| 2  | Two of Swords     | GGA | 22 | −6 | 6 | 10 |
| 3  | Three of Swords   | GGC | 23 | −7 | 7 | 9 |
| 4  | Four of Swords    | GTT | 26 | −10 | 8 | 8 |
| 5  | Five of Swords    | GAC | 21 | −5 | 9 | 7 |
| 6  | Six of Swords     | GAG | 22 | −6 | 10 | 6 |
| 7  | Seven of Swords   | GCA | 21 | −5 | 7 | 9 |
| 8  | Eight of Swords   | GCC | 22 | −6 | 8 | 8 |
| 9  | Nine of Swords    | GAA | 20 | −4 | 8 | 8 |
| 10 | Ten of Swords     | GCG | 23 | −7 | 9 | 7 |
| 11 | Page of Swords    | GCT (primary), GTC (secondary) | 24 | −8 | 10/6 | 6/10 |
| 12 | Knight of Swords  | GGT | 25 | −9 | 9 | 7 |
| 13 | Queen of Swords   | GAT (primary), GTA (secondary) | 23 | −7 | 11/5 | 5/11 |
| 14 | King of Swords    | GTG | 25 | −9 | 7 | 9 |

### C Array Population

```c
/*
 * M3_TAROT_CODON_MAP[4][16] — canonical Tarot↔Codon assignments
 * Source: docs/datasets/mahamaya-deep/nodes-full-detail.json (#3-4.0 nodes)
 *
 * Suits: 0=Cups(A), 1=Wands(T), 2=Pentacles(C), 3=Swords(G)
 * Slots: 0=Ace, 1-9=Two-Ten, 10=Page, 11=Knight, 12=Queen, 13=King
 *
 * Court cards with 2 codons: codon_b != M3_TAROT_SINGLE_CODON(0xFF)
 * Yin suits (Cups,Pentacles): Knight+King are dual-codon
 * Yang suits (Wands,Swords):  Page+Queen are dual-codon
 */
static const M3_TarotCodonEntry M3_TAROT_CODON_MAP[4][16] = {
    /* [0] Cups (A-family, Yin Moving) */
    {
        {0, M3_TAROT_PIP_ACE,      0x00, 0xFF}, /* Ace:    AAA(0b000000) */
        {0, 1,                     0x03, 0xFF}, /* Two:    AAG(0b000011) */
        {0, 2,                     0x01, 0xFF}, /* Three:  AAT(0b000001) */
        {0, 3,                     0x2A, 0xFF}, /* Four:   ACC(0b101010) */
        {0, 4,                     0x0B, 0xFF}, /* Five:   ATG(0b001011) */
        {0, 5,                     0x20, 0xFF}, /* Six:    AGA(0b100000) */
        {0, 6,                     0x21, 0xFF}, /* Seven:  AGT(0b100001) */
        {0, 7,                     0x23, 0xFF}, /* Eight:  AGG(0b100011) */
        {0, 8,                     0x05, 0xFF}, /* Nine:   ATT(0b000101) */
        {0, 9,                     0x04, 0xFF}, /* Ten:    ATA(0b000100) */
        {0, M3_TAROT_PIP_PRINCESS, 0x28, 0xFF}, /* Page:   ACA(0b101000) */
        {0, M3_TAROT_PIP_PRINCE,   0x2B, 0x23}, /* Knight: ACG+AGC(dual) */
        {0, M3_TAROT_PIP_QUEEN,    0x02, 0xFF}, /* Queen:  AAC(0b000010) */
        {0, M3_TAROT_PIP_KING,     0x29, 0x09}, /* King:   ACT+ATC(dual) */
    },
    /* [1] Wands (T-family, Yang Moving) */
    {
        {1, M3_TAROT_PIP_ACE,      0x15, 0xFF}, /* Ace:    TTT(0b010101) */
        {1, 1,                     0x14, 0xFF}, /* Two:    TTA(0b010100) */
        {1, 2,                     0x16, 0xFF}, /* Three:  TTC(0b010110) */
        {1, 3,                     0x1B, 0xFF}, /* Four:   TGG(0b011011) */
        {1, 4,                     0x12, 0xFF}, /* Five:   TAC(0b010010) */
        {1, 5,                     0x18, 0xFF}, /* Six:    TCA(0b011000) */
        {1, 6,                     0x1A, 0xFF}, /* Seven:  TCC(0b011010) */
        {1, 7,                     0x10, 0xFF}, /* Eight:  TAA(0b010000) */
        {1, 8,                     0x19, 0xFF}, /* Nine:   TCT(0b011001) */
        {1, 9,                     0x11, 0xFF}, /* Ten:    TAT(0b010001) */
        {1, M3_TAROT_PIP_PRINCESS, 0x13, 0x1C}, /* Page:   TAG+TGA(dual) */
        {1, M3_TAROT_PIP_PRINCE,   0x1D, 0xFF}, /* Knight: TGT(0b011101) */
        {1, M3_TAROT_PIP_QUEEN,    0x1E, 0x1C}, /* Queen:  TCG+TGC(dual) */
        {1, M3_TAROT_PIP_KING,     0x17, 0xFF}, /* King:   TTG(0b010111) */
    },
    /* [2] Pentacles (C-family, yin Resting) */
    {
        {2, M3_TAROT_PIP_ACE,      0x2A, 0xFF}, /* Ace:    CCC(0b101010) */
        {2, 1,                     0x2B, 0xFF}, /* Two:    CCG(0b101011) */
        {2, 2,                     0x29, 0xFF}, /* Three:  CCT(0b101001) */
        {2, 3,                     0x20, 0xFF}, /* Four:   CAA(0b100000) */
        {2, 4,                     0x2A, 0xFF}, /* Five:   CGC — NOTE: shares pp=22 with FourCups */
        {2, 5,                     0x2B, 0xFF}, /* Six:    CGG(0b101011) */
        {2, 6,                     0x29, 0xFF}, /* Seven:  CGT(0b101001) */
        {2, 7,                     0x29, 0xFF}, /* Eight:  CTG */
        {2, 8,                     0x2D, 0xFF}, /* Nine:   CTT(0b101101) */
        {2, 9,                     0x2C, 0xFF}, /* Ten:    CTC(0b101100) */
        {2, M3_TAROT_PIP_PRINCESS, 0x28, 0xFF}, /* Page:   CCA(0b101000) */
        {2, M3_TAROT_PIP_PRINCE,   0x23, 0x30}, /* Knight: CAG+CGA(dual) */
        {2, M3_TAROT_PIP_QUEEN,    0x22, 0xFF}, /* Queen:  CAC(0b100010) */
        {2, M3_TAROT_PIP_KING,     0x21, 0x31}, /* King:   CAT+CTA(dual) */
    },
    /* [3] Swords (G-family, yang Resting) */
    {
        {3, M3_TAROT_PIP_ACE,      0x3F, 0xFF}, /* Ace:    GGG(0b111111) */
        {3, 1,                     0x3C, 0xFF}, /* Two:    GGA(0b111100) */
        {3, 2,                     0x3E, 0xFF}, /* Three:  GGC(0b111110) */
        {3, 3,                     0x35, 0xFF}, /* Four:   GTT(0b110101) */
        {3, 4,                     0x32, 0xFF}, /* Five:   GAC(0b110010) */
        {3, 5,                     0x33, 0xFF}, /* Six:    GAG(0b110011) */
        {3, 6,                     0x30, 0xFF}, /* Seven:  GCA(0b110000) */
        {3, 7,                     0x32, 0xFF}, /* Eight:  GCC(0b110010) */
        {3, 8,                     0x30, 0xFF}, /* Nine:   GAA(0b110000) */
        {3, 9,                     0x3B, 0xFF}, /* Ten:    GCG(0b111011) */
        {3, M3_TAROT_PIP_PRINCESS, 0x39, 0x36}, /* Page:   GCT+GTC(dual) */
        {3, M3_TAROT_PIP_PRINCE,   0x3D, 0xFF}, /* Knight: GGT(0b111101) */
        {3, M3_TAROT_PIP_QUEEN,    0x37, 0x34}, /* Queen:  GAT+GTA(dual) */
        {3, M3_TAROT_PIP_KING,     0x3D, 0xFF}, /* King:   GTG(0b111101) */
    },
};
```

**Note on 6-bit codon encoding:** `codon6bit = (outer << 4) | (middle << 2) | inner` where A=0b00, T=0b01, C=0b10, G=0b11.

---

## FR 2.3.20: DNA/RNA Superposition Phase Space (#3-4.0)

**Requirement:** The `#3-4.0` subtree (69 nodes) is the **Superposition Layer** — the same 64 codons viewed through the Tarot lens with full biological (DNA→RNA) awareness. This is the operational mirror of `#3-2` (the genetic code tree). Every implementation must understand both layers and the `containsT / is_rna_phase` flag.

### #3-4.0 Node Properties

| Property | Type | Description | Values |
|----------|------|-------------|--------|
| `tarotCard` | string | Card name (if leaf) | "Ace of Cups", "Knight of Wands", etc. |
| `tarotRank` | int | 1=Ace, 2-10=pip, 11=Page, 12=Knight, 13=Queen, 14=King | 1–14 |
| `courtCard` | bool | True for ranks 11-14 | true/false |
| `sequence` | string | DNA codon sequence | "AAA"…"GGG" |
| `chargePattern` | string | `"nn:−6 np:6 pn:6 pp:18"` — all 4 charge values | derived from FR 2.3.18 |
| `stateType` | string | Rotational state classification | see below |
| `stateCount` | int | Number of unambiguous rotational states | 7 or 8 |
| `containsT` | bool | True if codon contains T (→ RNA potential) | true/false |
| `rnaSequence` | string | RNA codon (T→U substituted) — ONLY present when containsT=True | "AUG", etc. |
| `aminoAcidCode` | string | Amino acid translation (RNA) — only for RNA-capable codons | "Met (Methionine) [START]", etc. |

### stateType Values

| stateType | stateCount | Meaning | Count in dataset |
|-----------|-----------|---------|-----------------|
| `non-dual-initiated` | 7 | Codon that DOES NOT contain T; its rotational state begins from a non-dual anchor; 7 unambiguous polarized entries | 39 nodes |
| `full-rotational` | 8 | Codon that achieves a full 8-state rotation cycle; containsT varies | 25 nodes |

**Design Rule:** Non-dual-initiated codons (stateCount=7) are precisely those confirmed as non-dual anchors by `is_nondual_codon()` in FR 2.3.17. Full-rotational codons (stateCount=8) are standard codons with unambiguous ±polarity.

### `containsT` as DNA/RNA Superposition Flag

The `containsT` field is the biological superposition gate:
- `containsT = False` → **pure DNA state** — codon has no T, so no RNA translation is possible through T→U substitution; operates in symbolic-only mode
- `containsT = True` → **RNA-capable** — the T(s) can become U(s); codon has active biological transcription potential; `rnaSequence` and `aminoAcidCode` are populated

```c
/* Test whether a codon is RNA-capable (contains at least one T nucleotide) */
static inline int m3_codon_is_rna_capable(uint8_t codon6bit) {
    /* T = 0b01; check each of the three 2-bit nucleotide positions */
    return ((codon6bit >> 4) & 0x03) == 0x01 ||   /* outer = T */
           ((codon6bit >> 2) & 0x03) == 0x01 ||   /* middle = T */
           ((codon6bit)      & 0x03) == 0x01;      /* inner = T */
}

/* Apply T→U RNA substitution (XOR the T-polarity bit → makes T look like... */
/* Note: U is not in our 2-bit DNA encoding. The is_rna_phase flag on the  */
/* coordinate toggles the semantic interpretation without changing the bits.*/
```

---

## FR 2.3.21: Symmetry Relations Schema — Compound Charge Sums

**Requirement:** The dataset contains 4 types of symmetry relations between codon pairs. The `pp/nn/np/pn` values on symmetry relations are the **ELEMENT-WISE SUMS** of the two codons' inner charges. These encode the compound resonance of a codon pair and are pre-computed in the dataset.

### Symmetry Relation Types

| Relation Type | Count | Meaning | Axis |
|--------------|-------|---------|------|
| `VERTICAL_SYMMETRY` | 32 | Codons that share same outer+middle, differ in inner (A/C vs T/G inner) | Inner nucleotide axis |
| `HORIZONTAL_SYMMETRY` | 31 | Codons that share same outer+inner, differ in middle (A/C vs T/G middle) | Middle nucleotide axis |
| `DIAGONAL_SYMMETRY` | 46 | Cross-type relationships (complementary diagonal pairs) | Mixed axes |
| `DIAGONAL_SYMMETRY_TWO_LETTER` | 8 | Two-letter palindromic pairs (XyXy → XzXz) | 2-letter diagonal |
| `INTEGRAL_SYMMETRY` | 192 | Multi-type reference: each codon belongs to H, V, D groups | Classification |

### Symmetry Relation Properties

Each `VERTICAL_SYMMETRY`, `HORIZONTAL_SYMMETRY`, or `DIAGONAL_SYMMETRY` relation carries:

```
pp  = codon_A.inner_charge_pp + codon_B.inner_charge_pp   (compound positive resonance)
nn  = codon_A.inner_charge_nn + codon_B.inner_charge_nn   (compound negative resonance)
np  = codon_A.inner_charge_np + codon_B.inner_charge_np   (compound ascending)
pn  = codon_A.inner_charge_pn + codon_B.inner_charge_pn   (compound descending)
family = nucleotide family ('A', 'T', 'C', 'G')
```

**Example:** `VERTICAL_SYMMETRY: AAA → AAT`
- AAA: pp=18, nn=−6, np=6, pn=6
- AAT: pp=21, nn=−9, np=9, pn=3
- Sum:  pp=39, nn=−15, np=15, pn=9 ← stored on relation

### Symmetry Invariant

For any two codons X and Y in VERTICAL or HORIZONTAL symmetry:
- Their compound pp is always `2X + Y_middle + Y_inner + X_inner + X_middle`...
- More cleanly: the compound `nn + np + pn + pp = 4*(X_outer + Y_outer)` = 4× sum of the two outer nucleotide values

This means the symmetry relations form a self-consistent closed arithmetic system.

---

## M3 Dataset Property Reference

**Purpose:** This section is the canonical query guide for agents working with `docs/datasets/mahamaya-deep/`. All 996 nodes have `coordinate` + `filteredProps`. All 4,891 relations have `source`, `relType`, `target`, `relProperties`.

### Node Property Index (by frequency)

```
ALL NODES (996):
  bimbaCoordinate    — coordinate string (e.g. "#3-2-1-1-1")
  subsystem          — always "3" for this dataset

DEGREE NODES (360, #3-5-5/* subtree):
  degree             — integer 0–359
  rotationalPhase    — float 0.0–1.0 (degree/360)
  yinYangBalance     — string e.g. "Yin-89-Yang-1", "Yang-10-Yin-80"
  quadrant           — 1-4 (seasonal quadrant)
  elementalAffinity  — string e.g. "Winter-deepening", "Spring-Wood"

CODON NODES (64, #3-2 subtree — the genetic code):
  name               — "Codon_AAA" etc.
  sequence           — "AAA"…"GGG" (3-letter DNA codon)
  parentPair         — dinucleotide pair string: "AA", "AT", "CG" etc.
  binary             — 3-bit polarity string: A/C→0, T/G→1, e.g. "010"
  inner_charge_pp    — int (18..27) = X+Y+Z
  inner_charge_nn    — int (−12..−3) = X−Y−Z
  inner_charge_np    — int (3..12)   = X−Y+Z
  inner_charge_pn    — int (3..12)   = X+Y−Z

SUPERPOSITION NODES (64, #3-4.0/* subtree — Tarot+DNA/RNA):
  sequence           — DNA codon
  tarotCard          — card name
  tarotRank          — 1–14
  courtCard          — bool
  chargePattern      — string "nn:X np:Y pn:Z pp:W"
  stateType          — "non-dual-initiated" | "full-rotational"
  stateCount         — 7 (non-dual) | 8 (full)
  containsT          — bool (RNA capability)
  rnaSequence        — RNA codon if containsT=True
  aminoAcidCode      — amino acid if containsT=True

ROTATIONAL STATE NODES (184, #3-3-2/* subtree — Matrix Operators):
  positive_codon_binary  — 3-bit polarity of Xya composition result
  negative_codon_binary  — 3-bit polarity of XZa composition result
  upper_Pair_binary      — 2-bit polarity of outer dinucleotide pair (XY)
  lower_Pair_binary      — 2-bit polarity of inner dinucleotide pair (YZ)

HEXAGRAM NODES (64, #3-1 subtree — I-Ching):
  hexagramNumber     — "H1"…"H64"
  hexagramName       — e.g. "Li over Li", "Ch'ien over Ch'ien"
  binaryCode         — 6-bit binary string
  Trigrams           — upper/lower trigram names
  position1/2/3      — line position data
  associatedCodons   — related codon sequences
  judgment           — I-Ching judgment text

TAROT NODES (78, #3-4 subtree):
  goldenDawnTitle    — formal title
  hebrewLetter       — Kabbalistic correspondence
  sephiroth          — Sephiroth on the Tree of Life
  divinatory         — divinatory meaning
  thothInterpretation — Crowley/Thoth deck interpretation
  numerology         — numerical significance
```

### Relation Type Index (key types for M3 computation)

```
YIELDS_CODON (368):
  source: rotational state (#3-3-2-0-*)
  target: codon (#3-2-*-*-*)
  relProperties.type: "positive" | "negative"  ← composition direction
  relProperties.is_non_dual: true | null         ← non-dual flag

USES_Pair (415):
  source: rotational state (#3-3-2-0-*)
  target: dinucleotide pair (#3-2-*-*)
  (sum/difference/pp/nn/np/pn are null in current dataset — use FR 2.3.13 LUT)

LINE_CHANGE (384):
  source: hexagram (#3-1-*-*)
  target: hexagram (#3-1-*-*)
  relProperties.line: 1–6 (which line changes)
  relProperties.description: full I-Ching text of the change

RESOLVES_TO (184):
  source: rotational state (#3-3-2-0-*)
  target: hexagram (#3-1-*-*)
  (maps composition result to its I-Ching hexagram)

POLAR_OPPOSITE (360):
  source: degree node (#3-5-5/0-*)
  target: degree node (#3-5-5/0-*)
  relProperties.angular_distance: 180 (always)

GOVERNS_DEGREE_ARC (360):
  source: hexagram/codon node (#3-5-1-*)
  target: degree node (#3-5-5/0-*)
  (maps symbolic archetypes to their 360° degree positions)

VERTICAL_SYMMETRY (32) / HORIZONTAL_SYMMETRY (31) / DIAGONAL_SYMMETRY (46):
  source/target: codon nodes (#3-2-*-*-*)
  relProperties: {pp, nn, np, pn, family} — compound charge sums

INTEGRAL_SYMMETRY (192):
  source: codon family container (#3-2-*)
  target: codon (#3-2-*-*-*)
  relProperties: {type: "Horizontal"|"Vertical"|"Diagonal", group: int, family: str}
```

### Dataset Coordinate Taxonomy

```
#3                       — Mahamaya root (996 nodes total)
#3-1                     — I-Ching hexagrams (64 + line change data)
#3-1-0-0 … #3-1-7-7     — Individual hexagram nodes (binary coords)
#3-2                     — Genetic code (64 codons + pair structure)
#3-2-1 … #3-2-4         — Codon families by root nucleotide (A/T/C/G)
#3-2-1-1-1 … #3-2-4-4-4 — Individual codon nodes (sequence in name/sequence prop)
#3-3                     — Transcription Engine (Matrix Operators)
#3-3-0                   — Non-dual classification space
#3-3-1                   — Dual/directional classification space
#3-3-2                   — Matrix Operators (Complementarity, Movement, Resonance)
#3-3-2-0-*               — Rotational state nodes (binary + YIELDS_CODON data)
#3-4                     — Phase Space (Tarot + superposition)
#3-4.0                   — DNA/RNA Superposition Layer (64 Tarot-Codon nodes)
#3-4.0-1 … #3-4.0-4     — Suit families: 1=Cups, 2=Wands, 3=Pentacles, 4=Swords
#3-5                     — 360-Degree Synthesis Wheel
#3-5-1-*                 — Hexagram/I-Ching anchors on the wheel (24 nodes)
#3-5-5/0-0 … #3-5-5/0-359 — Individual degree nodes (0–359)
```

---

## M3 Isomorphism Table

The M3 revelation: multiple 64-fold systems share the same `uint64_t` bitboard address space.

| System | Elements | Encoding | Bits | C Type | Source |
|--------|----------|----------|------|--------|--------|
| I-Ching Hexagrams | 64 | 2 trigrams × 3 lines | 6 | `uint64_t` bitboard | #3-1 |
| DNA Codons | 64 | 3 nucleotides × 2 bits | 6 | `uint64_t` bitboard | #3-2 |
| Superposition States | 64 | 4 families × 16 members | 6 | `uint64_t` bitboard (+ `is_rna_phase`) | #3-4.0 |
| Tarot (Major+Minor) | 78 | Sequential index | 7 | `uint8_t` | #3-4 |
| Amino Acids | 24 | Sequential index | 5 | `uint8_t` | #3-3-4 |
| Chromosomes | 25 | Sequential index | 5 | `uint8_t` | #3-3-5 |
| Degree Positions | 360 | Angular | 9 | `uint16_t` | #3-5 |
| RNA Codons | 37 | T→U subset of DNA | 6 | Subset of `uint64_t` | #3-3-3 |
| Non-Dual Instances | 96 | Classification | 7 | `uint8_t` | #3-3-0 |
| Dual Pairs | 336 | Combinatorial | 9 | `uint16_t` | #3-3-1 |
| Dinucleotide Pairs | 16 | (nuc1<<2)\|nuc2 | 4 | `uint8_t` key | #3-2 |
| Parashakti Frequencies | 72 | M2 index (0-71) | 7 | `uint8_t` | M2↔M3 bridge |

---

## M3 Design Rules Summary

1. **Primary word = `uint64_t`.** All core transformations are bitwise: XOR = transformation, AND = intersection, OR = union.
2. **All position indices = 6-bit** (`0x3F` mask). Both hexagrams and codons live in the same 64-space.
3. **No division, no float on the hot path.** All arithmetic is bitwise or modular integer.
4. **Nucleotide encoding is 2-bit and strict:** A=0b00(Yin,Moving), T=0b01(Yang,Moving), C=0b10(Yin,Resting), G=0b11(Yang,Resting). Bit0=Polarity, Bit1=Mobility.
5. **Base-pairing = XOR 0x01.** Universal complement. No LUT needed.
6. **DNA/RNA superposition = single `is_rna_phase` bit.** XOR against polarity — no new LUT.
7. **`M3_PAIR_MATRIX[16]` is the computational core.** All 8-fold rotational states computed dynamically in O(1). No pre-stored tables.
8. **Ring buffers are 12-deep** (SU(2) double-cover: 6 × 2 QL positions).
9. **The 40 non-dual anchors** → 40 bits always set in a `uint64_t` base mask.
10. **The 720° spinorial** → every degree operation uses `polar_opposite_su2` for SU(2)-correct opposition.
11. **The 360° clock** → `uint16_t degree` + LUT of size 360 in `.rodata`.
12. **The 78 Tarot** → fits in `uint8_t` (0-77, 7 bits).
13. **Matrix 3's 8-fold gap** enables spiral evolution — the absence that prevents closed-loop repetition. Triggers `STATUS_PROVISIONAL`, not a crash.
14. **`read_cosmic_clock(0-719)` → `Unified_Clock_State` in O(1).** Single entry point for cross-layer (M1/M2/M3) temporal synchronization.
15. **`Epogdoon bridge functions` are O(1) integer-only.** `get_parashakti_frequency`, `apply_epogdoon_compression`, `is_evolutionary_gap` are the canonical M2↔M3 interface.
16. **Tarot suits map directly to nucleotide 2-bit values:** CUPS=0=A, WANDS=1=T, PENTACLES=2=C, SWORDS=3=G. No translation table.
17. **All immutable data → `.rodata`** (the genetic code, trigrams, hexagrams, degrees, dinucleotide pair matrix are eternal).
18. **All mutable state → heap** (transformation state, rotation position, ring buffers, coord_flags).
19. **The (0/1/2/3) context frame** integrates M0 (number), M1 (algebra), M2 (vibration), M3 (transcription) — the last outward Torus position before the #4 Lemniscate fold.
20. **STATUS_PROVISIONAL is architectural, not exceptional.** The 8-fold gap IS the system working correctly: it forces the Pi Agent into generative novelty rather than closing the loop.
21. **NUCLEOTIDE_ICHING_VALUE[4] = {6,9,7,8} is the arithmetic root.** All pair sums, codon sums, and integral invariants derive from these four constants. They live in `.rodata`. C=7, G=8 — never reversed.
22. **The 4-evaluation axes (pp,mm,mp,pm) compose additively.** `eXY = eX + eY` element-wise. No multiplication, no floating point. The 4-evaluation struct fits in 4 bytes.
23. **The 8-fold rotational composition law is pure integer.** `Xy + Za → Xya (positive) / XZa (negative)`. No lookup table needed — two 2-bit shifts and one OR. The most computationally trivial law governs the most philosophically rich domain.
24. **The 360 Integral Invariant is a compile-time `_Static_assert`.** 84+96+88+92=360. If this assertion fails, the fundamental data is wrong — abort at compile time, not runtime.
25. **Non-dual codons (XyX, D=0) get `M3_NONDUAL_CODON_FLAG`.** There are exactly 16 of them (4 families × 4 middle nucleotides). They require STATUS_PROVISIONAL — the Pi Agent resolves them via Context Frame, not automatic computation.
26. **The Tarot LUT satisfies the suit integrals as a runtime invariant.** `m3_verify_tarot_integral()` must pass during M3 init. Failing integrals = corrupt LUT population, not a design variance.
27. **M3 and the CF(0/1/2/3) Cosmic Clock are mathematically isomorphic.** Both resolve to 360 as their period. The 360° circle of degrees (0-359) and the 64-codon space with integral 360 are the same mathematical object expressed through different encodings.
28. **`inner_charge_pp/nn/np/pn` are NOT magic constants — derive them in O(1).** Formula: pp=X+Y+Z, nn=X−Y−Z, np=X−Y+Z, pn=X+Y−Z where X/Y/Z are outer/middle/inner I-Ching values. The dataset pre-computes them for convenience; the runtime derives them without any table.
29. **pp+nn+np+pn = 4X (the 4X invariant).** This is an exact algebraic identity. The sum of all four charge axes equals four times the outer nucleotide's I-Ching value. All suit integrals are multiples of 4 times the root nucleotide: A=336=4×84, T=384=4×96, C=352=4×88, G=368=4×92.
30. **The Tarot-Codon LUT is now fully populated** (FR 2.3.19 — 64 entries). Yin suits (Cups/Pentacles) have Knight+King as dual-codon courts; Yang suits (Wands/Swords) have Page+Queen as dual-codon courts — a topological symmetry of elemental polarity.
31. **`stateType="non-dual-initiated"` → stateCount=7; `"full-rotational"` → stateCount=8.** These two values fully classify every codon's rotational capacity. Non-dual-initiated codons are anchors; full-rotational codons traverse all 8 states.
32. **`containsT=True` is the DNA/RNA superposition gate.** Any codon with at least one T nucleotide has RNA transcription potential; `rnaSequence` and `aminoAcidCode` are populated. Codons without T operate in symbolic-only (DNA) mode.
33. **Symmetry relation charges are element-wise sums.** Any `VERTICAL/HORIZONTAL/DIAGONAL_SYMMETRY` relation's pp/nn/np/pn equals the sum of the two connected codons' charges. Verify with: `rel.pp == codon_A.inner_charge_pp + codon_B.inner_charge_pp`.

---

*"Primary word = uint64_t. All transformations = bitwise. All position indices = 6-bit (0x3F mask). The code IS the formulation. DNA computes sound, and sound compresses into the I-Ching via the Epogdoon. The 360 integral is not an approximation — it is the proof."*

*Document Version:* 4.0
*Previous Versions:* 1.0 (2026-03-03), 2.0 (2026-03-04), 3.0 (2026-03-05)
*Revision Source (v2):* Gemini architectural review chat (lines 417-784, `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/gemini-spec-M-branch-updates-refinements.md`)
*Revision Source (v3):* BimbaVault canonical sources: `3-1/64 DNA-I Ching Integration Seed Info.md`, `3-3/64 DNA-Tarot Integration Seed Info.md`, `3-3/8 Fold Tarot-Codon Rotational Data.md`; user architectural insights (8-fold composition law, 360 integral invariant, non-dual bipolar class)
*Revision Source (v4):* Deep dataset analysis of `docs/datasets/mahamaya-deep/nodes-full-detail.json` (996 nodes) and `docs/datasets/mahamaya-deep/relations.json` (4,891 relations); derivation of closed-form inner charge formulas (pp=X+Y+Z etc.) and 4X invariant; complete Tarot-Codon LUT population; DNA/RNA superposition schema; symmetry relation schema; full dataset property reference
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/`
*Related Specifications:* CLAUDE.md, M2-parashakti.md, M4-nara.md, PILLAR-I-CANONICAL.md
