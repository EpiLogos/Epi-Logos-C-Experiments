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
uint8_t get_ananda_harmonic(
        const DR_Matrix_12x12* mat,
        uint8_t row_0_to_11,
        uint8_t col_0_to_11);

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
uint8_t get_quint_bimba(uint8_t row_0_to_11, uint8_t col_0_to_11);

/* Read one Quintessence sum cell — O(1) */
uint8_t get_quint_sum(uint8_t row_0_to_11, uint8_t col_0_to_11);

/* Quintessence diff (DIFF_A) — always M1_QUINT_DIFF = -1, no storage needed */
int8_t get_quint_diff(uint8_t row, uint8_t col);

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
 * ANANDA RUNTIME API — #1-2 dataset, mod10 operational space
 *
 * 6 core matrices (0=Bimba, 1=Pratibimba, 2=Sum, 3=FirstDiff,
 *                  4=SecondDiff, 5=NonDual) + 6 DR reflections.
 *
 * Ananda Axiom: m1_ananda_get(1,i,j) - m1_ananda_get(0,i,j) == 1 (mod10)
 * This is Pratibimba = Bimba + 1 — the non-dual constant.
 * Source: dataset-bridge/06-ananda-matrices-analysis.md
 * =================================================================== */

/* Get cell value from core matrix (matrix_idx 0–5, row/col 0–9) */
uint8_t m1_ananda_get(uint8_t matrix_idx, uint8_t row, uint8_t col);

/* Get digital-root reflection of cell */
uint8_t m1_ananda_dr_get(uint8_t matrix_idx, uint8_t row, uint8_t col);

/* Runtime axiom check: returns 1 if Pratibimba-Bimba=+1 holds, 0 if corrupted */
int m1_ananda_verify_axiom(void);


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

/* SPANDA_SEED_TOTALIZATION_INVARIANT:
 * (0/1) seed binds P0/P5, P0'/P5', and C0/C5 as the valid seed boundary. */

/* The Trika (#1-3-3) — odd-cardinality singularity */
typedef enum {
    TRIKA_GROUND   = 0,  /* Fused (0/1)/(1/0) — the non-dual synthesis itself  */
    TRIKA_FORM     = 1,  /* First differentiated position                       */
    TRIKA_MEDIATOR = 2,  /* Relational bridge                                   */
} Trika_Position;

/* Spanda chain: seed poles split into Mahamaya/Parashakti tracks, stabilize as
 * Trika, close the 6-position torus, and complete the 36+64 QL field. */

/* Spanda state_bits bitmask — 2-bit field encoding active poles */
#define SPANDA_BIT_POLE_A  (1u << 0u)   /* bit 0: Mahamaya pole active   */
#define SPANDA_BIT_POLE_B  (1u << 1u)   /* bit 1: Parashakti pole active */
#define SPANDA_SEED_BITS   (SPANDA_BIT_POLE_A | SPANDA_BIT_POLE_B)  /* 0x03: both fused at seed */

/* Spanda state machine struct */
typedef struct {
    Spanda_Stage stage;
    uint8_t      state_bits;         /* 2-bit field: SPANDA_BIT_POLE_A | SPANDA_BIT_POLE_B */
    uint8_t      track;              /* 0=Mahamaya, 1=Parashakti                            */
    uint8_t      cf_substage;        /* 0-5 within Flowering stage                          */
    uint8_t      dual_track_active;  /* 1 at cf_substage==3: T1/T2 superposition active     */
} Spanda_Engine;

/* Fold-count sieve — 14 valid topological fold-counts (FR 2.1.2-F) */
#define VALID_FOLD_COUNT 14
extern const uint8_t VALID_FOLDS[VALID_FOLD_COUNT];

bool is_valid_fold(uint8_t n);

/* Fold count per CF sub-stage — SPANDA_FLOWERING (#1-3-4) internal progression:
 * sub-stage 0 → 4-fold  static  {0/0, 0/1, 1/0, 1/1}
 * sub-stage 1 → 6-fold  dynamic  0=(0/0)→(0/1)→(1/0)→(1/1)=1
 * sub-stage 2 → 8-fold  nested   0/(0/1) + (1/0)/0
 * sub-stage 3 → 10-fold dual-track  T1/T2 superposition (double-slit)
 * sub-stage 4 → 12-fold synthesis   O(2,6)/O(3,4) complete
 * sub-stage 5 → 0(meta) Möbius return / percentile identity */
extern const uint8_t SPANDA_CF_FOLD_COUNT[6];

/* CF sub-stage formulation entry — one per SPANDA_FLOWERING sub-stage */
typedef struct {
    uint8_t     substage;        /* 0-5 */
    uint8_t     element_count;   /* topological elements active at this stage */
    uint8_t     fold_count;      /* fold-count sieve value (0 = meta/percentile) */
    uint8_t     dual_track;      /* 1 = T1/T2 superposition active (sub-stage 3 only) */
    const char* cf_notation;     /* context frame notation, e.g. "(4.0/1/2/3)" */
    const char* formulation;     /* the specific equation/structure at this stage */
} CF_Substage_Entry;

extern const CF_Substage_Entry SPANDA_CF_SUBSTAGE_LUT[6];


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
bool ql_is_ascending(QL_Tick tick);

/* Branchless stage computation — CMOV-friendly, no branches on hot path
 * tick 0 -> stage 0, tick 5 -> stage 5 (ascending)
 * tick 6 -> stage 5, tick 11 -> stage 0 (descending: Möbius return moment) */
uint8_t ql_get_stage(QL_Tick tick);


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
extern const uint8_t QL_INVERT[6];

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


/* FR 2.1.5b: Percentile identity and vortex constants. */

#define QL_PERCENTILE_TOTAL       100u
#define QL_PERCENTILE_MAHAMAYA     64u   /* P/P' = 2^6 hexagrams (doubling track) */
#define QL_PERCENTILE_PARASHAKTI   36u   /* P×P' = 6×6 tattvas  (tripling track)  */

_Static_assert(QL_PERCENTILE_MAHAMAYA + QL_PERCENTILE_PARASHAKTI == QL_PERCENTILE_TOTAL,
    "100% = 64 (Mahamaya) + 36 (Parashakti)");
_Static_assert(QL_PERCENTILE_MAHAMAYA  == M3_WORD,   "Mahamaya 64 = M3_WORD");
_Static_assert(QL_PERCENTILE_PARASHAKTI == M2_TATTVA, "Parashakti 36 = M2_TATTVA");

/* Archetype 7 ratio alias — 16/9 viewed as Divine Action generative code.
 * Same truth as TORUS_R_MAJOR_F, named for the Archetype 7 vantage.
 * 7 × (16/9) = 1.777... = the infinite decimal of the generative act. */
#define QL_DIVINE_ACT_RATIO_NUM    16u   /* == QL_RATIO_NUM */
#define QL_DIVINE_ACT_RATIO_DEN     9u   /* == QL_RATIO_DEN */
#define QL_DIVINE_ACT_RATIO_F      (16.0f / 9.0f)

/* Vortex fraction inner sums — from the x-fold fraction series */
#define VORTEX_5X_CEILING          24u   /* 5× series inner sum → Spanda ceiling (seeds M2) */
#define VORTEX_6X_STRUCTURE         8u   /* 6× series inner sum → structural perfection     */
/* 9× series inner sum → 2 or 4 (dual cyclical return, not a single constant)              */


/* FR 2.1.6: #1-5 — toroidal recognition / quaternion foundation. */
typedef struct {
    float w;    /* real part — EARTH/cos-pole (P5); Hopf projection axis  */
    float x;    /* i component — FIRE; meridian rotation axis             */
    float y;    /* j component — WATER; longitude rotation axis           */
    float z;    /* k component — AIR; interaction ij=k axis               */
} Quaternion;

_Static_assert(sizeof(Quaternion) == 16, "Quaternion must be 16 bytes");

float quat_norm_sq(Quaternion q);

Quaternion quat_mul(Quaternion a, Quaternion b);

Quaternion quat_conj(Quaternion q);

Quaternion quat_neg(Quaternion q);

Quaternion quat_normalize(Quaternion q);

Quaternion quat_rotate(Quaternion q, Quaternion v);

Quaternion quat_slerp(Quaternion a, Quaternion b, float t);

/* Topological constants — derived from genus-1 necessity */
#define TORUS_GENUS              1u
#define QL_POSITIONS             (4u * TORUS_GENUS + 2u * TORUS_GENUS)  /* = 6 */
#define EULER_CHARACTERISTIC     (2 - 2 * (int)TORUS_GENUS)             /* = 0 */
#define DOUBLE_COVER_STEPS       (2u * QL_POSITIONS)                    /* = 12 = RING_SIZE */
#define PARASHAKTI_TOTAL         (M2_TATTVA * 2u)                       /* 36 × 2 = 72 */

/* Degree constants — 3×60 structure (equilateral triangle → 6 tiles → 360°) */
#define TRIG_STEP_DEG            60u   /* 360° / QL_POSITIONS = 60° per QL position  */
#define HALF_CYCLE_DEG          180u   /* 3 × TRIG_STEP — half the explicate arc     */
#define FULL_CYCLE_DEG          360u   /* Single strand (explicate OR implicate)      */
#define DOUBLE_COVER_DEG        720u   /* Both strands — total space S³              */
#define DEGREE_PER_TICK          30u   /* 360° / 12 = 30° per tick12 step on clock   */

_Static_assert(QL_POSITIONS == 6u,          "QL_POSITIONS must be 6 (genus-1 necessity)");
_Static_assert(DOUBLE_COVER_STEPS == 12u,   "DOUBLE_COVER_STEPS must equal RING_SIZE");
_Static_assert(PARASHAKTI_TOTAL == 72u,     "PARASHAKTI_TOTAL must be 72");
_Static_assert(TRIG_STEP_DEG == FULL_CYCLE_DEG / QL_POSITIONS,
    "60° = 360° / 6 (3×60 geometric origin)");
_Static_assert(DOUBLE_COVER_DEG == 2u * FULL_CYCLE_DEG,
    "720° double cover = 2 × 360°");
_Static_assert(DEGREE_PER_TICK * DOUBLE_COVER_STEPS == FULL_CYCLE_DEG,
    "30° × 12 = 360° (tick12 tiling)");
_Static_assert(TRIG_STEP_DEG == DEGREE_PER_TICK * 2u,
    "60° = 2 × 30° (QL position spans 2 tick12 steps)");

extern const Quaternion RING_QUATERNION_LUT[12];

Quaternion quat_from_ring_pos(QL_Tick tick);

#define M1_FULL_DOUBLE_COVER_STEPS  (2u * RING_SIZE)


/* ===================================================================
 * FR 2.1.7: TOPOLOGICAL ELEMENT COUNT LUT
 *
 * Maps each of the 12 SU(2) ring positions to topological element count.
 * Source: dataset topologicalElementCount property.
 * =================================================================== */

extern const uint8_t TOPOLOGICAL_ELEMENT_COUNT_LUT[12];

_Static_assert(sizeof(TOPOLOGICAL_ELEMENT_COUNT_LUT) == 12,
    "TOPOLOGICAL_ELEMENT_COUNT_LUT must have exactly 12 entries");

uint8_t get_topological_element_count(uint8_t ring_pos);


/* ===================================================================
 * FR 2.1.7b: CLIFFORD ALGEBRA Cl(4,2) — TRIGONOMETRIC IDENTITY
 *
 * 6 QL positions = 6 trig functions. The algebra is Cl(4,2):
 *   4 explicate positions (signature +1) = derived trig ratios
 *   2 implicate positions (signature −1) = generating poles (sin, cos)
 *
 * The two −1 positions (0, 5) ARE sin and cos — the two fundamental
 * trig functions from which all others derive:
 *   tan = sin/cos, sec = 1/cos, cot = cos/sin, csc = 1/sin
 *
 * This mirrors the ontological structure: #0 (Ground) and #5 (Integration)
 * are the implicate poles that generate #1–#4 (the explicate ratios).
 *
 * Hopf bundle: S³ (tick12, 720°) → S² (QL, 360°) → S¹ (phase, binary)
 * The modular reduction exact_degree_720 % 360 IS the Hopf projection.
 * See: 00-canonical-invariants.md §5
 * =================================================================== */

typedef enum {
    TRIG_SIN = 0,   /* sinθ — implicate generator pole 1  */
    TRIG_TAN = 1,   /* tanθ = sin/cos — explicate ratio   */
    TRIG_SEC = 2,   /* secθ = 1/cos — explicate reciprocal */
    TRIG_COT = 3,   /* cotθ = cos/sin — explicate ratio   */
    TRIG_CSC = 4,   /* cscθ = 1/sin — explicate reciprocal */
    TRIG_COS = 5    /* cosθ — implicate generator pole 2  */
} Trig_Function;

_Static_assert((int)TRIG_COS == 5, "Trig_Function must span 0-5 = QL_POSITIONS");

typedef struct {
    uint8_t      position;       /* 0–5: raw archetype index            */
    int8_t       signature;      /* −1 (implicate) or +1 (explicate)    */
    Trig_Function trig_fn;       /* Which trig function this position IS */
} Cl42_Basis_Entry;

extern const Cl42_Basis_Entry CL42_BASIS[6];

_Static_assert(sizeof(CL42_BASIS) == 6 * sizeof(Cl42_Basis_Entry),
    "CL42_BASIS must have exactly 6 entries");

/* Verify Cl(4,2) signature: positions 0,5 = −1; positions 1-4 = +1
 * Total: 4 × (+1) + 2 × (−1) = +2 net signature = Cl(4,2) */

typedef struct {
    const char*   name;            /* "sin", "tan", "sec", "cot", "csc", "cos"     */
    const char*   formula;         /* "sinθ", "sinθ/cosθ", "1/cosθ", etc.          */
    uint8_t       numerator_pos;   /* QL position in numerator (6 = unity)          */
    uint8_t       denominator_pos; /* QL position in denominator (6 = unity)        */
    int8_t        cl42_signature;  /* Copied from CL42_BASIS for cross-reference    */
} QL_Trig_Entry;

#define TRIG_UNITY 6u  /* Sentinel: "1" in numerator/denominator (no QL position) */

extern const QL_Trig_Entry QL_TRIG_TABLE[6];

_Static_assert(sizeof(QL_TRIG_TABLE) == 6 * sizeof(QL_Trig_Entry),
    "QL_TRIG_TABLE must have exactly 6 entries");

/* Hopf bundle projection functions — names the % 360 for what it is */
uint16_t hopf_project(uint16_t exact_degree_720);

uint8_t hopf_fiber(uint16_t exact_degree_720);

uint8_t hopf_tick12(uint16_t exact_degree_720);

/* S³ membership check — quaternion must be unit for Hopf fibration */
bool quat_is_unit(Quaternion q);


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

uint8_t get_ananda_diff_a(uint8_t row, uint8_t col);

uint8_t get_ananda_diff_b(uint8_t row, uint8_t col);


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

/* EPOGDOON (9:8) — the Pythagorean whole tone bridging Parashakti↔Mahamaya.
 * Parashakti space = 72 (MEF_DOUBLED); Mahamaya space = 64 (M3_WORD).
 * 72/64 = 9/8: the computational ratio for translating between the two tracks.
 * "Epogdoon" = the step-ratio in Pythagorean tuning; here it is the gap between
 * binary recursion (64=2⁶) and ternary double-cover (72=36×2=6²×2). */
#define EPOGDOON_NUM        9u    /* Parashakti factor */
#define EPOGDOON_DEN        8u    /* Mahamaya factor   */

_Static_assert(MEF_DOUBLED * EPOGDOON_DEN == M3_WORD * EPOGDOON_NUM,
    "Epogdoon: 72*8 == 64*9 == 576 (Mahamaya×crown)");


/* ===================================================================
 * FR 2.1.12: M0 CROSS-LINK POINTER TABLE (12 entries)
 *
 * Links the 12-element Ananda ring to M0 archetype (Psychoid_*) pointers.
 * Note: spec uses Archetype_N — corrected to Psychoid_N (renamed 2026-03-05).
 * =================================================================== */

extern const Holographic_Coordinate* const M1_M0_CROSSLINK[12];

/* Boot-time verification */
bool verify_m1_m0_crosslink(void);

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
