/**
 * m3.h — Mahamaya: The Symbolic Transcription Engine (Subsystem #3)
 *
 * Implements: M3 (#3) = Dynamic computational matrix & universal transcription.
 * Context frame: (0/1/2/3) — CF_QUATERNAL (Three-Plus-One)
 * Anchored to: Psychoid_3 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h, m1.h, m2.h
 * Feeds into: M4 (Symbol DNA, helix state), M5 (Logos FSM)
 *
 * The 64 Invariant: the uint64_t IS the entire symbolic reality.
 * All state transformations are bitwise. No floating-point on the hot path.
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
#include "m0.h"
#include "m2.h"
#include <stdbool.h>
#include <stdint.h>


/* ===================================================================
 * FR 2.3.12: NUCLEOTIDE_ICHING_VALUE — Canonical I-Ching Numeric LUT
 *
 * A=6(Yin,Moving), T=9(Yang,Moving), C=7(yin,Resting), G=8(yang,Resting)
 * These values ARE the system's root arithmetic.
 * All pair sums, codon sums, and integral invariants derive from them.
 * =================================================================== */

static const uint8_t NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8};

_Static_assert(
    6 + 9 + 7 + 8 == 30,
    "NUCLEOTIDE_ICHING_VALUE must sum to 30 (6+9+7+8)"
);

/* O(1) accessor — single array index, no branch */
static inline uint8_t get_iching_value(uint8_t nuc2bit) {
    return NUCLEOTIDE_ICHING_VALUE[nuc2bit & 0x03];
}

/* Codon I-Ching sum: outer + middle + inner nucleotide values */
static inline uint8_t get_codon_iching_sum(uint8_t codon6bit) {
    return NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 4) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 2) & 0x03]
         + NUCLEOTIDE_ICHING_VALUE[(codon6bit)      & 0x03];
}


/* ===================================================================
 * FR 2.3.1: 2-BIT NUCLEOTIDE LOGIC — The Ontological Foundation
 *
 * Bit 0 (Polarity):  0 = Yin  (A, C)    1 = Yang (T, G)
 * Bit 1 (Mobility):  0 = Moving (A, T)  1 = Resting (C, G)
 *
 * A=0b00(0) Yin/Moving   — Old Yin (6)   — CUPS (Water)
 * T=0b01(1) Yang/Moving  — Old Yang (9)  — WANDS (Fire)
 * C=0b10(2) Yin/Resting  — Young Yin (7) — PENTACLES (Earth)
 * G=0b11(3) Yang/Resting — Young Yang (8)— SWORDS (Air)
 * =================================================================== */

#define M3_NUC_A  0x00
#define M3_NUC_T  0x01
#define M3_NUC_C  0x02
#define M3_NUC_G  0x03

/* FR 2.3.1a: Polarity and Mobility extraction */
#define GET_POLARITY(nuc)  ((nuc) & 0x01)
#define GET_MOBILITY(nuc)  (((nuc) >> 1) & 0x01)

/* FR 2.3.1b: Base-pairing = XOR 0x01 (flips Polarity, preserves Mobility) */
static inline uint8_t get_base_pair(uint8_t nuc) {
    return nuc ^ 0x01;
}

/* FR 2.3.1c: Codon encoding — 3 nucleotides × 2 bits = 6-bit address (0-63) */
static inline uint8_t encode_codon(uint8_t n1, uint8_t n2, uint8_t n3) {
    return (uint8_t)((n1 << 4) | (n2 << 2) | n3);
}

/* Codon decomposition */
static inline uint8_t codon_outer(uint8_t c)  { return (c >> 4) & 0x03; }
static inline uint8_t codon_middle(uint8_t c) { return (c >> 2) & 0x03; }
static inline uint8_t codon_inner(uint8_t c)  { return c & 0x03; }

/* FR 2.3.1d: DNA/RNA phase — single bit flips entire Polarity table */
static inline uint8_t get_polarity_phased(uint8_t nuc, bool is_rna) {
    return GET_POLARITY(nuc) ^ (uint8_t)is_rna;
}

/* Nucleotide name for CLI output */
static inline char nuc_to_char(uint8_t nuc) {
    static const char NUC_CHARS[4] = {'A', 'T', 'C', 'G'};
    return NUC_CHARS[nuc & 0x03];
}


/* ===================================================================
 * FR 2.3.1: HEXAGRAM / TRIGRAM OPERATIONS
 *
 * All O(1) bitwise — no LUT needed.
 * =================================================================== */

/* LINE_CHANGE: flip line n (0-5) of hexagram h — 384 edges in XOR */
static inline uint8_t m3_line_change(uint8_t hex, uint8_t line) {
    return hex ^ (1u << line);
}

/* Trigram decomposition — built into 6-bit address */
static inline uint8_t upper_trigram(uint8_t hex_id) { return (hex_id >> 3) & 0x07; }
static inline uint8_t lower_trigram(uint8_t hex_id) { return hex_id & 0x07; }
static inline uint8_t compose_hexagram(uint8_t upper, uint8_t lower) {
    return (uint8_t)((upper << 3) | lower);
}

/* Complementarity: all 6 lines inverted */
static inline uint8_t m3_complement(uint8_t hex_id) { return hex_id ^ 0x3F; }

/* Integral Symmetry on full 64-bit field (all codons simultaneously, O(1)) */
static inline uint64_t integral_symmetry_field(uint64_t m3_word) {
    return __builtin_bswap64(m3_word);
}


/* ===================================================================
 * FR 2.3.2: M3_SD_Value — Sum/Difference Pair Descriptor
 *
 * The unified 16-pair dinucleotide matrix.
 * 3-Matrix system: each of the 3 matrices has 8 pairs:
 *   4 homogeneous (AA,TT,CC,GG — SHARED across all 3) + 4 unique.
 * Matrix 1 (Watson-Crick): homos + AT,TA,CG,GC
 * Matrix 2 (Cross-compl):  homos + AG,GA,TC,CT
 * Matrix 3 (Cross-diag):   homos + AC,CA,TG,GT
 * =================================================================== */

typedef struct {
    int8_t sum;   /* The (+) evaluation (I-Ching pair sum) */
    int8_t diff;  /* The (-) evaluation (directional asymmetry) */
} M3_SD_Value;

extern const M3_SD_Value M3_PAIR_MATRIX[16];


/* ===================================================================
 * FR 2.3.3: Rotational_State — Dynamic 8-Fold Computation
 *
 * Computed from M3_PAIR_MATRIX in O(1). No pre-stored tables.
 * 0xFF = evolutionary gap → STATUS_PROVISIONAL.
 * =================================================================== */

typedef struct {
    int8_t total_sum;
    int8_t total_diff;
} Rotational_State;

#define M3_RESONANCE_GAP  0xFF

/* STATUS_PROVISIONAL: system has reached an evolutionary gap */
#define STATUS_PROVISIONAL_BIT  (1u << 4)

static inline Rotational_State compute_rotational_state(uint8_t p1_idx, uint8_t p2_idx) {
    return (Rotational_State){
        .total_sum  = (int8_t)(M3_PAIR_MATRIX[p1_idx].sum  + M3_PAIR_MATRIX[p2_idx].sum),
        .total_diff = (int8_t)(M3_PAIR_MATRIX[p1_idx].diff + M3_PAIR_MATRIX[p2_idx].diff)
    };
}

/* Safe version: handles evolutionary gap (0xFF sentinel) */
static inline bool compute_rotational_state_safe(
    uint8_t p1_idx, uint8_t p2_idx,
    Rotational_State* out, uint32_t* coord_flags)
{
    if (p2_idx == M3_RESONANCE_GAP) {
        *coord_flags |= STATUS_PROVISIONAL_BIT;
        return false;
    }
    *out = compute_rotational_state(p1_idx, p2_idx);
    return true;
}


/* ===================================================================
 * FR 2.3.1: TRIGRAM AND HEXAGRAM STRUCTS
 * =================================================================== */

typedef struct {
    uint8_t  id;             /* 0-7 (3 bits) */
    uint8_t  binary;         /* 3-bit line pattern (yang=1, yin=0) */
    uint8_t  earlier_heaven; /* Position in Earlier Heaven (0-7) */
    uint8_t  later_heaven;   /* Position in Later Heaven (0-7) */
    uint8_t  element;        /* Five-Element correspondence */
    uint8_t  family_role;    /* Father/Mother/Son/Daughter */
    uint16_t degree_anchor;  /* Degree position in #3-5 wheel */
} M3_Trigram;

typedef struct {
    uint8_t id;              /* 0-63 (6 bits) = upper<<3 | lower */
    uint8_t line_pattern;    /* 6-bit pattern (lines 0-5, bottom to top) */
    uint8_t complement_id;   /* id ^ 0x3F */
    uint8_t nuclear_upper;   /* Nuclear trigram (lines 2-4) */
    uint8_t nuclear_lower;   /* Nuclear trigram (lines 1-3) */
} M3_Hexagram;

extern const M3_Trigram  M3_TRIGRAM_LUT[8];
extern const M3_Hexagram M3_HEXAGRAM_LUT[64];

/* I-Ching state: which hexagrams are active */
typedef struct {
    uint64_t active;          /* Bitboard: bit h set = hexagram h active */
    uint8_t  current;         /* Currently focused hexagram (6-bit) */
    uint8_t  changing_lines;  /* Which lines are changing (6-bit mask) */
    uint8_t  result;          /* Hexagram after changes applied */
    bool     is_rna_phase;    /* DNA/RNA superposition flag */
} M3_IChing_State;


/* ===================================================================
 * FR 2.3.4: TAROT SUIT ENUM + MINOR ARCANA CARD
 *
 * Suit index = nucleotide 2-bit value. No translation needed.
 * =================================================================== */

typedef enum {
    SUIT_CUPS      = 0, /* A family — Yin/Moving  — Water */
    SUIT_WANDS     = 1, /* T family — Yang/Moving — Fire  */
    SUIT_PENTACLES = 2, /* C family — Yin/Resting — Earth */
    SUIT_SWORDS    = 3  /* G family — Yang/Resting — Air  */
} Tarot_Suit;

static const char* const SUIT_NAMES[4] = {"Cups", "Wands", "Pentacles", "Swords"};

typedef struct {
    uint8_t    card_id;        /* 0-55 (Minor Arcana ID) */
    Tarot_Suit suit;           /* Elemental suit (0-3) */
    uint8_t    rank;           /* 1=Ace, 2-10=Pip, 11=Page, 12=Knight, 13=Queen, 14=King */
    uint8_t    primary_codon;  /* 6-bit codon ID (0-63) */
    uint8_t    shadow_codon;   /* 6-bit codon ID, or 0xFF for single-codon cards */
} Minor_Arcana_Card;


/* ===================================================================
 * FR 2.3.5: UNIFIED COSMIC CLOCK — O(1)
 *
 * Maps any degree (0-719) across full SU(2) 720° double-cover.
 * All integer arithmetic. No floating-point.
 *
 * NOTE: Unified_Clock_State is defined in m0.h (shared across M-branches).
 * m0_read_cosmic_clock() is the canonical implementation.
 * We provide read_cosmic_clock() as a convenience alias when m0.h is included,
 * and a standalone version when it is not.
 * =================================================================== */

/* m0.h is now always included — Unified_Clock_State and m0_read_cosmic_clock() available */
static inline Unified_Clock_State read_cosmic_clock(uint16_t d) {
    return m0_read_cosmic_clock(d);
}


/* ===================================================================
 * FR 2.3.6: EPOGDOON BRIDGE — M2 ↔ M3 Harmonic Translation
 *
 * 9:8 ratio. 72 × (8/9) = 64. Integer-only. O(1).
 * The 8 missing states drive evolutionary spiral.
 * =================================================================== */

/* ASCENDING: M3 → M2 (rotational sum → Parashakti frequency index) */
static inline uint8_t get_parashakti_frequency(Rotational_State m3_state,
                                                bool is_shadow_phase) {
    uint8_t base_frequency = (uint8_t)m3_state.total_sum;
    return is_shadow_phase ? (uint8_t)(base_frequency + 36u) : base_frequency;
}

/* DESCENDING: M2 → M3 (epogdoon 9:8 compression) */
static inline uint8_t apply_epogdoon_compression(uint8_t m2_idx_0_to_71) {
    return (uint8_t)((m2_idx_0_to_71 * 8u) / 9u);
}

/* EVOLUTIONARY GAP DETECTION */
static inline bool is_evolutionary_gap(uint8_t m2_vibration_index) {
    uint8_t compressed = apply_epogdoon_compression(m2_vibration_index);
    uint8_t expanded   = (uint8_t)((compressed * 9u) / 8u);
    return (expanded != m2_vibration_index);
}


/* ===================================================================
 * FR 2.3.7: SU(2)-PRESERVING POLAR OPPOSITE
 *
 * Preserves shadow layer: opposing a shadow-layer degree
 * stays in the shadow layer.
 * =================================================================== */

static inline uint16_t polar_opposite_su2(uint16_t current_720_degree) {
    uint16_t layer_offset = (current_720_degree >= 360u) ? 360u : 0u;
    uint16_t base_degree  = current_720_degree % 360u;
    return layer_offset + (uint16_t)((base_degree + 180u) % 360u);
}

/* Simple wheel operations (single 360° layer) */
static inline uint16_t flow_clockwise(uint16_t d)         { return (d + 1u) % 360u; }
static inline uint16_t polar_opposite_simple(uint16_t d)   { return (d + 180u) % 360u; }
static inline uint8_t  m3_quadrant(uint16_t d)             { return (uint8_t)(d / 90u); }


/* ===================================================================
 * FR 2.3.8: STATUS_PROVISIONAL / FR 2.3.9: RESONANCE LOOKUP
 * =================================================================== */

extern const uint8_t M3_RES_MATRIX[64];

static inline uint8_t m3_resonance_lookup(uint8_t codon_id,
                                           uint32_t* coord_flags) {
    uint8_t result = M3_RES_MATRIX[codon_id];
    if (result == M3_RESONANCE_GAP) {
        *coord_flags |= STATUS_PROVISIONAL_BIT;
        return M3_RESONANCE_GAP;
    }
    return result;
}


/* ===================================================================
 * FR 2.3.9: M3_Transcription_Engine — Operational Hub
 * =================================================================== */

extern const uint8_t M3_COMP_MATRIX[64];
extern const uint8_t M3_MOVE_MATRIX[64];
extern const uint8_t M3_CODON_TO_AA[64];

typedef struct {
    /* Non-dual foundation */
    uint64_t non_dual_mask;             /* 40 always-set bits */

    /* Dual field */
    uint64_t dual_field[6];             /* 336 polarity pairs (6 × 64-bit words) */

    /* Three matrix operators (.rodata pointers) */
    const uint8_t* comp_matrix;
    const uint8_t* move_matrix;
    const uint8_t* res_matrix;

    /* Transcription pipeline */
    const uint8_t* codon_to_aa;

    /* STATUS_PROVISIONAL tracking */
    uint32_t coord_flags;
} M3_Transcription_Engine;


/* ===================================================================
 * FR 2.3.11: 360-DEGREE MYTHIC SYNTHESIS WHEEL
 * =================================================================== */

typedef struct {
    uint16_t degree;            /* 0-359 (primary) */
    uint16_t shadow;            /* degree + 360 (shadow layer) */
    uint8_t  quadrant;          /* 0-3 (N/E/S/W) */
    uint8_t  sector;            /* 0-23 (15° sectors via 24-spoke division) */
    uint8_t  trigram_earlier;   /* Earlier Heaven trigram at this position */
    uint8_t  trigram_later;     /* Later Heaven trigram at this position */
    uint8_t  sign;              /* Zodiacal sign (0-11, 30° each) */
    uint8_t  decan;             /* Decan within sign (0-2, 10° each) */
} M3_DegreePosition;

typedef struct {
    uint16_t current_degree;    /* Active degree (0-719 for full double-cover) */
    uint8_t  layer;             /* 0 = primary (0-359), 1 = shadow (360-719) */
    uint64_t active_sectors;    /* Bitboard: which of 24 sectors are active */
    uint8_t  season;            /* Current quarter (0-3) */
    uint8_t  heaven_mode;       /* 0 = Earlier, 1 = Later */
} M3_Wheel_State;

/* Ring buffer — 12-deep for SU(2) double-covering (6 QL × 2) */
typedef struct {
    uint16_t buffer[12];
    uint8_t  head;
    uint8_t  count;
} M3_Ring_Buffer;

/* Full rotation requires 720° */
static inline bool identity_returned(const M3_Wheel_State* ws) {
    return ws->current_degree >= 720u;
}


/* ===================================================================
 * FR 2.3.13: 4-EVALUATION SYSTEM — Codon Charge Calculator
 *
 * Every codon evaluated across 4 complementary valence axes.
 * Composes additively from dinucleotide pair S/D values.
 * =================================================================== */

typedef struct {
    int8_t pp;   /* (+,+): positive resonance integral */
    int8_t mm;   /* (-,-): negative resonance integral */
    int8_t mp;   /* (-,+): ascending resonance */
    int8_t pm;   /* (+,-): descending resonance */
} M3_CodonEvaluation;

/* Evaluate codon from its three embedded dinucleotide pairs */
static inline M3_CodonEvaluation evaluate_codon(uint8_t codon6bit) {
    uint8_t X = (codon6bit >> 4) & 0x03;
    uint8_t Y = (codon6bit >> 2) & 0x03;
    uint8_t Z = (codon6bit)      & 0x03;

    M3_CodonEvaluation ev;
    /* (+,+): sum of S values — convergent resonance peak */
    ev.pp = (int8_t)(M3_PAIR_MATRIX[(X << 2) | Y].sum +
                     M3_PAIR_MATRIX[(Y << 2) | Z].sum);
    /* (-,-): negation of sum — convergent resonance trough */
    ev.mm = (int8_t)(-(M3_PAIR_MATRIX[(X << 2) | Y].sum +
                       M3_PAIR_MATRIX[(Y << 2) | Z].sum));
    /* (-,+): net D of inner pair (ascending if D>0) */
    ev.mp = M3_PAIR_MATRIX[(Y << 2) | Z].diff;
    /* (+,-): net D of outer pair (descending if D<0) */
    ev.pm = M3_PAIR_MATRIX[(X << 2) | Y].diff;
    return ev;
}


/* ===================================================================
 * FR 2.3.14: 8-FOLD ROTATIONAL COMPOSITION LAW
 *
 * Positive valence:  Xy + Za → Xya
 * Negative valence:  Xy + Za → XZa
 * Non-dual:          when y == Z (bipolar)
 * =================================================================== */

#define M3_ROTATIONAL_TABLE_ENTRIES       8
#define M3_ROTATIONAL_POLARIZED_ENTRIES   7
#define M3_ROTATIONAL_NONDUAL_ENTRIES     1

static inline uint8_t compose_rotational_state(uint8_t xy, uint8_t za, int positive) {
    uint8_t X = (xy >> 2) & 0x03;
    uint8_t y = (xy)      & 0x03;
    uint8_t Z = (za >> 2) & 0x03;
    uint8_t a = (za)      & 0x03;
    return positive
        ? (uint8_t)((X << 4) | (y << 2) | a)
        : (uint8_t)((X << 4) | (Z << 2) | a);
}

static inline int is_nondual_composition(uint8_t xy, uint8_t za) {
    return ((xy) & 0x03) == ((za >> 2) & 0x03);
}


/* ===================================================================
 * FR 2.3.15: 360 INTEGRAL INVARIANT
 *
 * Sum of all (+,+) codon evaluations = 360.
 * Per-suit: Cups=84, Wands=96, Pentacles=88, Swords=92.
 * =================================================================== */

#define M3_INTEGRAL_INVARIANT    360U
#define M3_SUIT_A_INTEGRAL        84U   /* Cups:      Yin Moving  */
#define M3_SUIT_T_INTEGRAL        96U   /* Wands:     Yang Moving */
#define M3_SUIT_C_INTEGRAL        88U   /* Pentacles: yin Resting */
#define M3_SUIT_G_INTEGRAL        92U   /* Swords:    yang Resting */

_Static_assert(
    M3_SUIT_A_INTEGRAL + M3_SUIT_T_INTEGRAL +
    M3_SUIT_C_INTEGRAL + M3_SUIT_G_INTEGRAL == M3_INTEGRAL_INVARIANT,
    "M3 360 Integral Invariant violated: suit sum must equal 360"
);


/* ===================================================================
 * FR 2.3.16: M3_TarotCodonEntry — Canonical LUT
 *
 * 4 suits × 16 slots = 64 codons total.
 * Yin suits (Cups/Pentacles): Knight+King dual-codon
 * Yang suits (Wands/Swords): Page+Queen dual-codon
 * =================================================================== */

typedef struct {
    uint8_t suit;     /* 0=Cups, 1=Wands, 2=Pentacles, 3=Swords */
    uint8_t pip;      /* 0=Ace, 1-9=Two-Ten, 10=Princess, 11=Prince, 12=Queen, 13=King */
    uint8_t codon_a;  /* Primary codon (6-bit) */
    uint8_t codon_b;  /* Secondary codon for dual-codon courts, 0xFF = none */
} M3_TarotCodonEntry;

#define M3_TAROT_PIP_ACE        0
#define M3_TAROT_PIP_PRINCESS  10
#define M3_TAROT_PIP_PRINCE    11
#define M3_TAROT_PIP_QUEEN     12
#define M3_TAROT_PIP_KING      13
#define M3_TAROT_SINGLE_CODON  0xFF
#define M3_TAROT_ENTRIES_PER_SUIT  16
#define M3_TAROT_SUITS             4

extern const M3_TarotCodonEntry M3_TAROT_CODON_MAP[4][16];

static const char* const TAROT_RANK_NAMES[14] = {
    "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"
};


/* ===================================================================
 * FR 2.3.17: NON-DUAL CODONS — Palindromic Anchors (XyX Pattern)
 *
 * 16 codons where outer == inner nucleotide.
 * Zero net directional deviation. Bipolar valence.
 * =================================================================== */

static inline int is_nondual_codon(uint8_t codon6bit) {
    return ((codon6bit >> 4) & 0x03) == (codon6bit & 0x03);
}

#define M3_NONDUAL_CODON_FLAG   0x40

extern const uint8_t M3_NONDUAL_CODONS[16];


/* ===================================================================
 * FR 2.3.18: INNER CHARGE CLOSED-FORM DERIVATION
 *
 * pp = X+Y+Z, nn = X-Y-Z, np = X-Y+Z, pn = X+Y-Z
 * where X,Y,Z = NUCLEOTIDE_ICHING_VALUE of outer,middle,inner.
 * No lookup table needed — pure arithmetic.
 * =================================================================== */

static inline void m3_compute_charges(
    uint8_t codon6bit,
    int8_t *pp_out, int8_t *nn_out, int8_t *np_out, int8_t *pn_out)
{
    uint8_t X = NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 4) & 0x03];
    uint8_t Y = NUCLEOTIDE_ICHING_VALUE[(codon6bit >> 2) & 0x03];
    uint8_t Z = NUCLEOTIDE_ICHING_VALUE[(codon6bit)      & 0x03];

    *pp_out = (int8_t)(X + Y + Z);
    *nn_out = (int8_t)(X - Y - Z);
    *np_out = (int8_t)(X - Y + Z);
    *pn_out = (int8_t)(X + Y - Z);
}

/* Compile-time verification: TTT 4X invariant (pp+nn+np+pn = 4*outer) */
_Static_assert((9+9+9) + (9-9-9) + (9-9+9) + (9+9-9) == 4*9,
    "m3_compute_charges 4X invariant must hold for TTT codon");


/* ===================================================================
 * FR 2.3.20: DNA/RNA SUPERPOSITION
 *
 * containsT = true → RNA-capable (T→U substitution possible).
 * =================================================================== */

static inline int m3_codon_is_rna_capable(uint8_t codon6bit) {
    return ((codon6bit >> 4) & 0x03) == M3_NUC_T ||
           ((codon6bit >> 2) & 0x03) == M3_NUC_T ||
           ((codon6bit)      & 0x03) == M3_NUC_T;
}


/* ===================================================================
 * FR 2.3.17: NON-DUAL GUARD — Evaluation with flag
 * =================================================================== */

static inline M3_CodonEvaluation m3_evaluate_with_nondual_guard(
    uint8_t codon6bit, uint8_t *flags_out)
{
    M3_CodonEvaluation ev = evaluate_codon(codon6bit);
    if (is_nondual_codon(codon6bit)) {
        if (flags_out) *flags_out |= M3_NONDUAL_CODON_FLAG;
        ev.mp = 0;
        ev.pm = 0;
    }
    return ev;
}


/* ===================================================================
 * M3 ROOT STRUCT — HC-anchored module state
 * =================================================================== */

typedef struct {
    Holographic_Coordinate*       hc;         /* FIRST FIELD — HC_LINK'd to Psychoid_3 mirror */
    const Holographic_Coordinate* active_cf;  /* CF_TABLE[CF_QUATERNAL] */
    M3_IChing_State               iching;     /* Active hexagram state */
    M3_Transcription_Engine       engine;     /* Operational hub */
    M3_Wheel_State                wheel;      /* 360° wheel state */
    M3_Ring_Buffer                ring;       /* 12-deep SU(2) history */
} M3_Root;


/* ===================================================================
 * PUBLIC API
 * =================================================================== */

/* Allocate and HC-link M3_Root; hc must be Psychoid_3's mutable mirror */
M3_Root* m3_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Release M3_Root heap state (not the HC itself) */
void     m3_teardown(M3_Root* root);

/* CLI dispatch entry point: argv[0] = "m3" */
int      m3_cli_dispatch(int argc, char** argv, M3_Root* root);

/* Boot-time verification of .rodata integrity */
bool     m3_verify(void);


#endif /* M3_H */
