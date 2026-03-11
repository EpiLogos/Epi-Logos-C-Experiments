/**
 * m1.h — Paramasiva: The Mathematical DNA (Subsystem #1)
 *
 * Implements: M1 (#1) = The generative number-system of the entire engine.
 * Context frame: (0/1) — CF_BINARY (Non-Dual Binary)
 * Anchored to: Psychoid_1 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h
 * Feeds into: M2 (72-space), M3 (64-bit word), M4 (QL stages), M5 (Logos FSM)
 *
 * No arbitrary numbers. Every constant traces back to 16/9.
 *
 * FR Coverage: 2.1.0 – 2.1.12 (M1-paramasiva-mathematical-dna.md, Rev 2)
 *
 * ARCHITECTURE RULE: M1_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 */

#ifndef M1_H
#define M1_H

#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include <stdbool.h>
#include <math.h>
#include <stdint.h>

/* ===================================================================
 * FR 2.1.0: BIMBA/PRATIBIMBA — Compile-Time Type Enforcement
 *
 * BIMBA and PRATIBIMBA are already defined in ontology.h as:
 *   #define BIMBA       const struct Holographic_Coordinate
 *   #define PRATIBIMBA  struct Holographic_Coordinate
 *
 * This is the law: .rodata = const (Siva). Heap = mutable (Shakti).
 * Any attempt to mutate a BIMBA is a compile-time error.
 *
 * #1-0 (Bimba — Archetypal Source): every .rodata entity IS a BIMBA.
 * #1-1 (Pratibimba — Living Mirror): every arena-alloc'd entity IS a PRATIBIMBA.
 * The MIRROR_I_MAGIC_UNITY relation: arena_coord->c points to its .rodata archetype.
 * =================================================================== */


/* ===================================================================
 * FR 2.1.1: #1-2 — ANANDA (The Harmonic System)
 *
 * Six 12×12 matrices, nibble-packed into 72 bytes each.
 * Total: 6 × 72 = 432 bytes of .rodata harmony.
 * 10×10 archetypal core (indices 0-9 × 0-9) embedded in 12×12 extension.
 * Rows/cols 10-11 = SU(2) shadow extension (transitional harmonics).
 * =================================================================== */

typedef struct {
    uint8_t packed_cells[72];   /* 144 harmonic relationships, 4 bits each */
} DR_Matrix_12x12;

_Static_assert(sizeof(DR_Matrix_12x12) == 72, "DR_Matrix_12x12 must be 72 bytes");

/* O(1) bitwise extraction — single CPU cycle */
static inline uint8_t get_ananda_harmonic(
        const DR_Matrix_12x12* mat,
        uint8_t row_0_to_11,
        uint8_t col_0_to_11)
{
    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
    uint8_t byte_val = mat->packed_cells[flat / 2u];
    return (flat % 2u == 0u) ? (uint8_t)(byte_val & 0x0Fu) : (uint8_t)(byte_val >> 4u);
}

/* The six Ananda matrices — all .rodata (BIMBA), defined in m1.c */
extern const DR_Matrix_12x12 ANANDA_BIMBA;         /* #X+0 — Original source        */
extern const DR_Matrix_12x12 ANANDA_PRATIBIMBA;    /* #X+1 — Offset reflection      */
extern const DR_Matrix_12x12 ANANDA_SUM;           /* (#X+0)+(#X+1) — Synthesis     */
/* ANANDA_DIFF_A: all cells = 9 — no storage (FR 2.1.9)                              */
/* ANANDA_DIFF_B: all cells = 1 — no storage (FR 2.1.9)                              */
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
static inline uint8_t get_quint_bimba(uint8_t row_0_to_11, uint8_t col_0_to_11) {
    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
    uint8_t byte_val = ANANDA_QUINTESSENCE.bimba[flat / 2u];
    return (flat % 2u == 0u) ? (uint8_t)(byte_val & 0x0Fu) : (uint8_t)(byte_val >> 4u);
}

/* Read one Quintessence sum cell — O(1) */
static inline uint8_t get_quint_sum(uint8_t row_0_to_11, uint8_t col_0_to_11) {
    uint8_t flat = (uint8_t)((row_0_to_11 * 12u) + col_0_to_11);
    uint8_t byte_val = ANANDA_QUINTESSENCE.sum[flat / 2u];
    return (flat % 2u == 0u) ? (uint8_t)(byte_val & 0x0Fu) : (uint8_t)(byte_val >> 4u);
}

/* Quintessence diff (DIFF_A) — always M1_QUINT_DIFF = -1, no storage needed */
static inline int8_t get_quint_diff(uint8_t row, uint8_t col) {
    (void)row; (void)col;
    return (int8_t)M1_QUINT_DIFF;
}

#define ANANDA_RING_SIZE 12
/* Indexed 0-5  = matrices (ANANDA_BIMBA through ANANDA_QUINTESSENCE)
 * Indexed 6-11 = their DR reflections
 * INFINITY_LOOP_WEAVING: ring[6] <-> ring[7] (Bimba DR <-> Pratibimba DR lemniscate) */

/* Matrix operation enum — 4+2 implicate/explicate layout */
typedef enum {
    MATRIX_BIMBA        = 0,    /* Implicate boundary (source) */
    MATRIX_PRATIBIMBA   = 1,    /* Explicate */
    MATRIX_SUM          = 2,    /* Explicate */
    MATRIX_DIFF_A       = 3,    /* Explicate — constant 9, no storage */
    MATRIX_DIFF_B       = 4,    /* Explicate — constant 1, no storage */
    MATRIX_QUINTESSENCE = 5,    /* Implicate boundary (paradox) */
} Ananda_Matrix_Op;

/* DR rings — the dual-track architecture */
extern const uint8_t DR_RING_MAHAMAYA[6];    /* {1,2,4,8,7,5} — doubling,  64-bit */
extern const uint8_t DR_RING_PARASHAKTI[6];  /* {3,6,9,3,6,9} — tripling,  72-bit */


/* ===================================================================
 * FR 2.1.2: #1-3 — SPANDA (The Dynamic Intelligence Engine)
 *
 * 6-stage topological concrescence state machine.
 * Dual-track generation: Mahamaya (stage 1) and Parashakti (stage 2).
 * SPANDA_COMPILER_PASSES[6]: typed mutators that compile QL constants.
 * =================================================================== */

/* Typed mutator — Spanda actively mutates a PRATIBIMBA in place */
typedef void (*Spanda_Mutator)(PRATIBIMBA* target_coordinate);

/* The six compiler passes — .rodata, in Spanda stage order */
extern const Spanda_Mutator SPANDA_COMPILER_PASSES[6];

/* Spanda stage enum */
typedef enum {
    SPANDA_SEED      = 0,    /* Genus-0 sphere: fused (0/1) — state 0x03      */
    SPANDA_POLE_A    = 1,    /* Original Pole: (0/1) — Mahamaya track generator */
    SPANDA_POLE_B    = 2,    /* Reflection Pole: (1/0) — Parashakti generator   */
    SPANDA_TRIKA     = 3,    /* Trika Synthesis: (0/1/2) — first stable torus   */
    SPANDA_FLOWERING = 4,    /* Contextual Flowering — 6 CF sub-stages → QL     */
    SPANDA_META      = 5,    /* Meta-Reflection — fold-count sieve              */
} Spanda_Stage;

/* -------------------------------------------------------------------
 * SPANDA_SEED_TOTALIZATION_INVARIANT
 *
 * The six coordinates forming the complete boundary of the QL field:
 *
 *   P0  — Position ground (Torus outward start)    TOPO_TORUS
 *   P5  — Position synthesis (Torus return point)  TOPO_TORUS
 *   P0' — Position ground inverted (Klein start)   TOPO_KLEIN
 *   P5' — Position synthesis inverted (Klein end)  TOPO_KLEIN
 *   C0  — Bimba (categorical ground / source)      TOPO_ZERO_SPHERE
 *   C5  — Pratibimba (categorical synthesis/refl.) TOPO_ZERO_SPHERE
 *
 * Invariant: (0/1) seed = P0 ↔ P5 = C0 ↔ C5
 *   The binary poles (0 and 1) ARE the ground and synthesis of the Torus
 *   (P0 and P5), which ARE the Bimba and Pratibimba (C0 and C5).
 *   "0 and 1 are equal to 5 and 0" — they are the same oscillation at
 *   different ontological registers. The Spanda seed totalizes the system
 *   by simultaneously encapsulating both registers.
 *
 * These six coordinates are the only ones that can validly claim
 * TOPO_ZERO_SPHERE (C0/C5) or serve as the seed boundary (P0/P5/P0'/P5').
 * All other coordinates are TOPO_TORUS (P normal), TOPO_KLEIN (P'),
 * or TOPO_LEMNISCATE (P4 specifically).
 * ------------------------------------------------------------------- */

/* The Trika (#1-3-3) — odd-cardinality singularity */
typedef enum {
    TRIKA_GROUND   = 0,  /* Fused (0/1)/(1/0) — the non-dual synthesis itself  */
    TRIKA_FORM     = 1,  /* First differentiated position                       */
    TRIKA_MEDIATOR = 2,  /* Relational bridge                                   */
} Trika_Position;

/* -------------------------------------------------------------------
 * SPANDA CHAIN — how binary non-dual generates the 6-state system
 * and the complete 36+64=100% QL field:
 *
 * STEP 0 — S⁰ Seed (SPANDA_SEED_BITS = 0x03, TOPO_ZERO_SPHERE):
 *   The (0/1) binary as two disconnected poles, not yet connected.
 *   Both SPANDA_BIT_POLE_A and SPANDA_BIT_POLE_B are simultaneously
 *   active. This is the non-dual ground — "0 and 1 are equal to 5 and 0."
 *   Maps to: P0/P5 (ground and synthesis of the Torus) and
 *             C0/C5 (Bimba/Pratibimba — source and reflection).
 *   See SPANDA_SEED_TOTALIZATION_INVARIANT below.
 *
 * STEP 1 — Differentiation (SPANDA_POLE_A / SPANDA_POLE_B):
 *   Pole A (0x01): (0/1) outward = Mahamaya track {1,2,4,8,7,5}, 64-bit
 *   Pole B (0x02): (1/0) return  = Parashakti track {3,6,9,3,6,9}, 72-bit
 *   Pole A → P (Torus outward). Pole B → P' (Klein return).
 *
 * STEP 2 — Trika (SPANDA_TRIKA):
 *   (0/1)+(1/0) = (0/1/2) — the first stable genus-1 torus.
 *   The two punctures = the two generators of π₁(T²) = Z⊕Z.
 *
 * STEP 3 — Torus arithmetic (4g+2g = 6 positions, QL_POSITIONS):
 *   4g = 4 edges of the fundamental polygon (positions 1-4: the explicates)
 *   2g = 2 identification vertices (positions 0 and 5: ground and synthesis)
 *   Total: 4(1) + 2(1) = 6 [QL_POSITIONS]
 *
 * STEP 4 — Complete QL field:
 *   P × P' = 6 × 6 = 36 [M2_TATTVA]  — all position-inversion combinations
 *   P / P' = 2^6    = 64 [M3_WORD]   — all 6-bit binary sequences
 *   36 + 64 = 100% — the complete QL field
 *
 * STEP 5 — Klein double-cover:
 *   P (outward 0-5) + P' (return 0'-5') = 12 positions [RING_SIZE]
 *   Klein bottle needs 6 colours (Heawood) = the 6 QL positions.
 *   P alone IS the Torus. P + P' IS the Klein. P' COMPLETES the Klein.
 * ------------------------------------------------------------------- */

/* Spanda state_bits bitmask — 2-bit field encoding active poles */
#define SPANDA_BIT_POLE_A  (1u << 0u)   /* bit 0: Mahamaya pole active   */
#define SPANDA_BIT_POLE_B  (1u << 1u)   /* bit 1: Parashakti pole active */
#define SPANDA_SEED_BITS   (SPANDA_BIT_POLE_A | SPANDA_BIT_POLE_B)  /* 0x03: both fused at seed */

/* Spanda state machine struct */
typedef struct {
    Spanda_Stage stage;
    uint8_t      state_bits;    /* 2-bit field: SPANDA_BIT_POLE_A | SPANDA_BIT_POLE_B */
    uint8_t      track;         /* 0=Mahamaya, 1=Parashakti                            */
    uint8_t      cf_substage;   /* 0-5 within Flowering stage                          */
} Spanda_Engine;

/* Fold-count sieve — 14 valid topological fold-counts (FR 2.1.2-F) */
#define VALID_FOLD_COUNT 14
static const uint8_t VALID_FOLDS[VALID_FOLD_COUNT] = {
    0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 18, 24
};

static inline bool is_valid_fold(uint8_t n) {
    for (int i = 0; i < VALID_FOLD_COUNT; i++)
        if (VALID_FOLDS[i] == n) return true;
    return false;
}


/* ===================================================================
 * FR 2.1.3: SU(2) DOUBLE COVER RING ARITHMETIC
 *
 * 12-state integer ring: 0-5 = Explicate (first 360°), 6-11 = Implicate.
 * Float M_PI BANNED from the traversal hot path.
 * =================================================================== */

/* Full SU(2) double-cover ring */
#define RING_SIZE       12u    /* 6 × 2 (ascent + descent) */
#define RING_HALF        6u    /* One 360° cycle            */

/* Safely wrap any position into the 0-11 ring */
#define RING_WRAP(pos)          ((uint8_t)((pos) % RING_SIZE))

/* True if traversal is in the Implicate/Night/Shadow phase */
#define IS_SHADOW_PHASE(pos)    ((pos) >= RING_HALF)

/* Returns the underlying 0-5 QL archetype regardless of which 360° */
#define GET_BASE_QL_POS(pos)    ((uint8_t)((pos) % RING_HALF))

#define RING_MOD(i)             RING_WRAP(i)    /* alias */


/* ===================================================================
 * FR 2.1.4: QL TICK — The Heartbeat (M5 Logos Cycle FSM belongs to M5)
 *
 * M1 provides the tick type and the branchless stage derivation.
 * The M5_Logos_Cycle FSM struct belongs in m5.h — M1 is its substrate.
 * =================================================================== */

/* QL_Tick: the 12-fold SU(2) ring tick — 0 to RING_SIZE-1 */
typedef uint8_t QL_Tick;

/* Branchless: tick 0-5 = ascending (Explicate), 6-11 = descending (Implicate) */
static inline bool ql_is_ascending(QL_Tick tick) {
    return tick < (QL_Tick)RING_HALF;
}

/* Branchless stage computation — CMOV-friendly, no branches on hot path
 * tick 0 -> stage 0, tick 5 -> stage 5 (ascending)
 * tick 6 -> stage 5, tick 11 -> stage 0 (descending: Möbius return moment) */
static inline uint8_t ql_get_stage(QL_Tick tick) {
    return ql_is_ascending(tick) ? tick : (uint8_t)(11u - tick);
}


/* ===================================================================
 * FR 2.1.5: #1-4 — QL FLOWERING (The #define Cascade)
 *
 * All system cardinalities derive from the foundational 16:9 ratio.
 * No magic numbers — every constant traces back to this cascade.
 * =================================================================== */

/* Stage 0: Foundational ratio — 16/9 = 4²/3² */
#define QL_EXPLICATE      4u    /* 4-fold: What, How, Which/Who, When/Where */
#define QL_PROCESSUAL     6u    /* 6-fold: Why-Source through Why-Synthesis  */
#define QL_RATIO_NUM     16u    /* 4² — explicate squared                   */
#define QL_RATIO_DEN      9u    /* 3² — trika squared                       */

/* Stage 1: Frame dimensions */
#define FRAME_EXPLICATE   4u    /* positions 1-4 */
#define FRAME_PROCESSUAL  6u    /* positions 0-5 */
#define FRAME_TOTAL      10u    /* 4 + 6         */

/* Stage 2: Inversion table — QL_INVERT[i] gives the mirror of position i */
static const uint8_t QL_INVERT[6] = { 5u, 4u, 3u, 2u, 1u, 0u };

/* Stage 3: Bidirectional ring (aligns with FR 2.1.3 macros) — already defined above */
/* RING_SIZE = 12, RING_HALF = 6 */

/* Stage 4: Nesting variants */
#define VARIANT_7         7u    /* odd: 0/1 + 2-7             */
#define VARIANT_8         8u    /* even: 0-7                  */
#define VARIANT_9         9u    /* odd: 0/1 + 2-9 (Paramesvara) */
#define VARIANT_10       10u    /* even: 0-9                  */

/* Stage 5: Downstream cardinalities */
#define M3_WORD          64u    /* 4² × 4 = Mahamaya 64-bit word */
#define M2_TATTVA        36u    /* 6² = 36 Tattvas               */
#define M2_NAMES         72u    /* 36 × 2 = 72 (Epogdoon)        */
#define COSMIC_TIME     360u    /* 6 × 10 × 6 = 360-degree cycle */
#define M2_DECANS        72u    /* = M2_NAMES (72 Decans)         */

/* QL Stage struct — mod-6 ring */
typedef struct {
    uint8_t     stage;          /* 0-5                              */
    const char* name;           /* Obsidian layer only              */
    const char* formulation;    /* Obsidian layer only              */
    uint8_t     next;           /* (stage + 1) % 6                 */
    uint8_t     inverse;        /* QL_INVERT[stage]                 */
} QL_Stage;

/* The 6-stage mod-6 ring — defined in m1.c */
extern const QL_Stage QL_FLOWERING[6];


/* ===================================================================
 * FR 2.1.6: #1-5 — TOROIDAL RECOGNITION (Quaternionic Foundation)
 *
 * WHY 6 positions: 4g + 2g = 6 for genus g = 1 (torus necessity proof).
 * WHY 720°: π₁(T²) = Z⊕Z — two independent 2π generators.
 * =================================================================== */

/* Quaternion struct — torus parametrization formalism */
typedef struct {
    float w;    /* real part (scalar)           */
    float x;    /* i component (meridian)       */
    float y;    /* j component (longitude)      */
    float z;    /* k component (interaction ij=k) */
} Quaternion;

_Static_assert(sizeof(Quaternion) == 16, "Quaternion must be 16 bytes");

static inline float quat_norm_sq(Quaternion q) {
    return q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z;
}

static inline Quaternion quat_mul(Quaternion a, Quaternion b) {
    return (Quaternion){
        .w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
        .x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
        .y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
        .z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w
    };
}

static inline Quaternion quat_conj(Quaternion q) {
    return (Quaternion){ .w = q.w, .x = -q.x, .y = -q.y, .z = -q.z };
}

static inline Quaternion quat_neg(Quaternion q) {
    return (Quaternion){ .w = -q.w, .x = -q.x, .y = -q.y, .z = -q.z };
}

static inline Quaternion quat_normalize(Quaternion q) {
    float norm_sq = quat_norm_sq(q);
    if (norm_sq <= 0.0f) {
        return q;
    }
    float scale = 1.0f / sqrtf(norm_sq);
    return (Quaternion){
        .w = q.w * scale,
        .x = q.x * scale,
        .y = q.y * scale,
        .z = q.z * scale
    };
}

static inline Quaternion quat_rotate(Quaternion q, Quaternion v) {
    return quat_mul(quat_mul(q, v), quat_conj(q));
}

static inline Quaternion quat_slerp(Quaternion a, Quaternion b, float t) {
    float dot = a.w*b.w + a.x*b.x + a.y*b.y + a.z*b.z;
    if (dot < 0.0f) {
        b = quat_neg(b);
        dot = -dot;
    }
    if (dot > 0.9995f) {
        Quaternion lerp = {
            .w = a.w + t * (b.w - a.w),
            .x = a.x + t * (b.x - a.x),
            .y = a.y + t * (b.y - a.y),
            .z = a.z + t * (b.z - a.z)
        };
        return quat_normalize(lerp);
    }
    if (dot < -1.0f) dot = -1.0f;
    if (dot > 1.0f) dot = 1.0f;
    float theta = acosf(dot);
    float sin_theta = sinf(theta);
    if (fabsf(sin_theta) < 0.0001f) {
        return quat_normalize(a);
    }
    float wa = sinf((1.0f - t) * theta) / sin_theta;
    float wb = sinf(t * theta) / sin_theta;
    return (Quaternion){
        .w = wa*a.w + wb*b.w,
        .x = wa*a.x + wb*b.x,
        .y = wa*a.y + wb*b.y,
        .z = wa*a.z + wb*b.z
    };
}

/* Topological constants — derived from genus-1 necessity */
#define TORUS_GENUS              1u
#define QL_POSITIONS             (4u * TORUS_GENUS + 2u * TORUS_GENUS)  /* = 6 */
#define EULER_CHARACTERISTIC     (2 - 2 * (int)TORUS_GENUS)             /* = 0 */
#define DOUBLE_COVER_STEPS       (2u * QL_POSITIONS)                    /* = 12 = RING_SIZE */
#define PARASHAKTI_TOTAL         (M2_TATTVA * 2u)                       /* 36 × 2 = 72 */

_Static_assert(QL_POSITIONS == 6u,          "QL_POSITIONS must be 6 (genus-1 necessity)");
_Static_assert(DOUBLE_COVER_STEPS == 12u,   "DOUBLE_COVER_STEPS must equal RING_SIZE");
_Static_assert(PARASHAKTI_TOTAL == 72u,     "PARASHAKTI_TOTAL must be 72");

static const Quaternion RING_QUATERNION_LUT[12] = {
    [0]  = { .w = 1.0f,    .x = 0.0f,    .y = 0.0f, .z = 0.0f },
    [1]  = { .w = 0.8660254f,  .x = 0.5f,    .y = 0.0f, .z = 0.0f },
    [2]  = { .w = 0.5f,    .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
    [3]  = { .w = 0.0f,    .x = 1.0f,    .y = 0.0f, .z = 0.0f },
    [4]  = { .w = -0.5f,   .x = 0.8660254f,  .y = 0.0f, .z = 0.0f },
    [5]  = { .w = -0.8660254f, .x = 0.5f,    .y = 0.0f, .z = 0.0f },
    [6]  = { .w = 0.8660254f,  .x = -0.5f,   .y = 0.0f, .z = 0.0f },
    [7]  = { .w = 0.5f,    .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
    [8]  = { .w = 0.0f,    .x = -1.0f,   .y = 0.0f, .z = 0.0f },
    [9]  = { .w = -0.5f,   .x = -0.8660254f, .y = 0.0f, .z = 0.0f },
    [10] = { .w = -0.8660254f, .x = -0.5f,   .y = 0.0f, .z = 0.0f },
    [11] = { .w = -1.0f,   .x = 0.0f,    .y = 0.0f, .z = 0.0f },
};

static inline Quaternion quat_from_ring_pos(QL_Tick tick) {
    return RING_QUATERNION_LUT[tick % RING_SIZE];
}

#define M1_FULL_DOUBLE_COVER_STEPS  (2u * RING_SIZE)


/* ===================================================================
 * FR 2.1.7: TOPOLOGICAL ELEMENT COUNT LUT
 *
 * Maps each of the 12 SU(2) ring positions to topological element count.
 * Source: dataset topologicalElementCount property.
 * =================================================================== */

static const uint8_t TOPOLOGICAL_ELEMENT_COUNT_LUT[12] = {
     1,  2,  2,  3,  4,  5,   /* Explicate phase (positions 0-5) */
     8, 10, 12,  6,  7, 11    /* Implicate phase (positions 6-11) */
};

_Static_assert(sizeof(TOPOLOGICAL_ELEMENT_COUNT_LUT) == 12,
    "TOPOLOGICAL_ELEMENT_COUNT_LUT must have exactly 12 entries");

static inline uint8_t get_topological_element_count(uint8_t ring_pos) {
    return TOPOLOGICAL_ELEMENT_COUNT_LUT[RING_WRAP(ring_pos)];
}


/* ===================================================================
 * FR 2.1.8: M1 QL CATEGORY AND OPERATOR TYPES
 *
 * 7-value QL category for M1 nodes.
 * C11-compatible enum (typedef enum, NOT typedef enum : uint8_t).
 * =================================================================== */

typedef enum {
    M1_QL_CAT_IMPLICATE            = 0,  /* Pure implicate (Bimba / #1-0)           */
    M1_QL_CAT_IMPLICATE_EXPLICATE  = 1,  /* Transition (Pratibimba / #1-1)          */
    M1_QL_CAT_EXPLICATE_1          = 2,  /* 1st explicate (Ananda bimba matrix)     */
    M1_QL_CAT_EXPLICATE_2          = 3,  /* 2nd explicate (Ananda pratibimba)       */
    M1_QL_CAT_EXPLICATE_3          = 4,  /* 3rd explicate (Ananda sum/diff)         */
    M1_QL_CAT_EXPLICATE_4          = 5,  /* 4th explicate (Spanda contextual)       */
    M1_QL_CAT_IMPLICATE_BOUNDARY   = 6,  /* Implicate boundary (Quintessence/Torus) */
} M1_QL_Category;

/* 3-bit operator types bitmask */
#define M1_OP_UNARY      (1u << 0u)   /* unary operators applicable    */
#define M1_OP_BINARY     (1u << 1u)   /* binary operators applicable   */
#define M1_OP_RELATIONAL (1u << 2u)   /* relational operators applicable */

/* Category assignments for M1 sub-branches (indexed 0-5 = #1-0 through #1-5) */
extern const M1_QL_Category M1_BRANCH_QL_CATEGORY[6];


/* ===================================================================
 * FR 2.1.9: CONSTANT MATRIX OPTIMIZATION
 *
 * ANANDA_DIFF_A (#1-2-3): all cells = 9 (Paramesvara wholeness constant)
 * ANANDA_DIFF_B (#1-2-4): all cells = 1 (Unity constant)
 * Neither stored as a 72-byte array. Savings: 144 bytes .rodata.
 * =================================================================== */

#define ANANDA_DIFF_A_CONSTANT  9u   /* DR of all (#X+0)-(#X+1) differences */
#define ANANDA_DIFF_B_CONSTANT  1u   /* DR of all (#X+1)-(#X+0) differences */

static inline uint8_t get_ananda_diff_a(uint8_t row, uint8_t col) {
    (void)row; (void)col;
    return ANANDA_DIFF_A_CONSTANT;
}

static inline uint8_t get_ananda_diff_b(uint8_t row, uint8_t col) {
    (void)row; (void)col;
    return ANANDA_DIFF_B_CONSTANT;
}


/* ===================================================================
 * FR 2.1.10: PARALLEL ROLE TRACK INVARIANT (Ananda / Spanda)
 *
 * Ananda matrix ops (0-5) and Spanda stages (0-5) share identical QL roles.
 * Direct index translation: no lookup table required.
 * =================================================================== */

_Static_assert((int)MATRIX_BIMBA        == (int)SPANDA_SEED,
    "Ananda-Spanda track: index 0 must align");
_Static_assert((int)MATRIX_PRATIBIMBA   == (int)SPANDA_POLE_A,
    "Ananda-Spanda track: index 1 must align");
_Static_assert((int)MATRIX_SUM          == (int)SPANDA_POLE_B,
    "Ananda-Spanda track: index 2 must align");
_Static_assert((int)MATRIX_DIFF_A       == (int)SPANDA_TRIKA,
    "Ananda-Spanda track: index 3 must align");
_Static_assert((int)MATRIX_DIFF_B       == (int)SPANDA_FLOWERING,
    "Ananda-Spanda track: index 4 must align");
_Static_assert((int)MATRIX_QUINTESSENCE == (int)SPANDA_META,
    "Ananda-Spanda track: index 5 must align");

/* Direct index translation — no lookup overhead */
#define ANANDA_TO_SPANDA_STAGE(matrix_op)   ((Spanda_Stage)(matrix_op))
#define SPANDA_TO_ANANDA_OP(spanda_stage)   ((Ananda_Matrix_Op)(spanda_stage))


/* ===================================================================
 * FR 2.1.11: QUATERNION CONSTANTS AND MEF_DOUBLED
 * =================================================================== */

/* Quaternion algebra identities — i² = j² = k² = ijk = -1 */
#define QUAT_II_IDENTITY    (-1)
#define QUAT_JJ_IDENTITY    (-1)
#define QUAT_KK_IDENTITY    (-1)
#define QUAT_IJK_IDENTITY   (-1)

/* Torus radii derived from the 16:9 QL ratio (for .rodata constant derivation ONLY) */
#define TORUS_R_MAJOR_NUM   16u          /* Numerator of R (in units of r)  */
#define TORUS_R_MINOR_DEN    9u          /* Denominator (r = 1 unit)        */
#define TORUS_R_MAJOR_F     (16.0f / 9.0f)
#define TORUS_R_MINOR_F     1.0f

/* MEF_DOUBLED: 6 base × 2 phases (#-inverted) × 6 positions = 72 */
#define MEF_DOUBLED         72u
#define MEF_BASE_LENSES      6u
#define MEF_INV_FACTOR       2u

_Static_assert(MEF_BASE_LENSES * MEF_INV_FACTOR * QL_PROCESSUAL == MEF_DOUBLED,
    "MEF_DOUBLED must equal MEF_BASE_LENSES * 2 * QL_PROCESSUAL = 72");


/* ===================================================================
 * FR 2.1.12: M0 CROSS-LINK POINTER TABLE (12 entries)
 *
 * Links the 12-element Ananda ring to M0 archetype (Psychoid_*) pointers.
 * Note: spec uses Archetype_N — corrected to Psychoid_N (renamed 2026-03-05).
 * =================================================================== */

extern const Holographic_Coordinate* const M1_M0_CROSSLINK[12];

/* Boot-time verification */
static inline bool verify_m1_m0_crosslink(void) {
    for (int i = 0; i < 12; i++) {
        if (M1_M0_CROSSLINK[i] == NULL) return false;
    }
    return true;
}

_Static_assert(ANANDA_RING_SIZE == 12, "M1_M0_CROSSLINK size must match ANANDA_RING_SIZE");


/* ===================================================================
 * SPANDA MUTATOR PROTOTYPES — forward declarations for compiler passes
 * (Implementations are static in m1.c — these are not exported)
 * =================================================================== */

/* Declared here for documentation; implemented static in m1.c */


/* ===================================================================
 * M1 ROOT STRUCT — HC-anchored module state
 * =================================================================== */

typedef struct {
    Holographic_Coordinate*       hc;          /* FIRST FIELD — HC_LINK'd to Psychoid_1 mirror */
    const Holographic_Coordinate* active_cf;   /* CF_TABLE[CF_BINARY]                          */
    Spanda_Engine                 spanda;       /* Active Spanda concrescence state             */
    QL_Tick                       torus_pos;   /* Current SU(2) ring position (0 to RING_SIZE-1) */
    const DR_Matrix_12x12*        ananda;      /* Active Ananda matrix (default: ANANDA_BIMBA)  */
} M1_Root;


/* ===================================================================
 * PUBLIC API
 * =================================================================== */

/* Allocate and HC-link M1_Root; hc must be Psychoid_1's mutable mirror */
M1_Root* m1_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Release M1_Root heap state (not the HC itself) */
void     m1_teardown(M1_Root* root);

/* CLI dispatch entry point: argv[0] = "m1" */
int      m1_cli_dispatch(int argc, char** argv, M1_Root* root);

/* Boot-time holographic registry check */
bool     m1_verify(void);


#endif /* M1_H */
