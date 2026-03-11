/**
 * m0.h — Anuttara: The Multi-Level Language Runtime (Subsystem #0)
 *
 * Implements: M0 (#0) = bare-metal VM of six nested micro-algebras
 * Context frame: (00/00) — CF_VOID (Receptive Dynamism)
 * Anchored to: Psychoid_0 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h (HC struct), vak.h (instruction dispatch)
 * Feeds into: M1-M5 via holographic Eckhartian correspondence
 *
 * ARCHITECTURE RULE: M0_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 *
 * Public interface — all consumers need only:
 *   m0_init(arena, hc)          — allocate and HC-link the M0 root struct
 *   m0_read_cosmic_clock(deg)   — O(1) unified M1/M2/M3 clock accessor
 *   m0_compute_logos_state(tick) — branchless 12-stage pipeline state
 *   m0_teardown(root)           — release heap state (not the HC itself)
 *   m0_cli_dispatch(argc, argv, root) — CLI entry point
 */

#ifndef M0_H
#define M0_H

#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m1.h"
#include "vak.h"
#include <stdbool.h>

/* ===================================================================
 * I. COMPILED FORMULATION — every M0 coordinate's concrescence trace
 *
 * The formulation is the SOURCE CODE of the ontological element.
 * The compiled fields are its executable PRATIBIMBA reflection.
 * =================================================================== */

/* Forward ref — Spanda_Discriminator defined below */
typedef union Spanda_Discriminator Spanda_Discriminator;

typedef struct {
    uint8_t  signature;        /* 7-bit operator mask + 1 Spanda bit (Spanda_Discriminator.raw) */
    uint8_t  reduction_depth;  /* number of -> steps in full formulation (2-8) */
    uint8_t  dimensionality;   /* terminal form: 0, 1, or 2 (/D suffix) */
    uint8_t  terminal_opcode;  /* final Vimarsa opcode this reduces to (0x0-0x7) */
    uint16_t core_chain;       /* 4-step reduction kernel (Vimarsa_Bytecode) */
    uint16_t _pad;             /* alignment to 8 bytes */
    const char* source;        /* full human-readable formulation (Obsidian only) */
} Compiled_Formulation;

_Static_assert(sizeof(Compiled_Formulation) == 16, "Compiled_Formulation must be 16 bytes");


/* ===================================================================
 * II. FR 2.0.0: VIMARSA ENGINE — 3-bit bytecode ISA
 * =================================================================== */

typedef enum {
    OP_VIMARSA_NULL = 0x0,
    OP_ILLUMINATE   = 0x1,   /* ?!  — Vimarsa-Prakasa       */
    OP_PROVOKE      = 0x2,   /* !?  — Prakasa-Vimarsa       */
    OP_WITHHOLD     = 0x3,   /* (-) — Negation/Withholding  */
    OP_ADD_PRESENCE = 0x4,   /* +@  — Additive Presence     */
    OP_ENCLOSE      = 0x5,   /* (@) — Enclosed Presence     */
    OP_EQUATE       = 0x6,   /* =   — Equivalence           */
    OP_DISTINGUISH  = 0x7    /* !=  — Distinction           */
} Vimarsa_Opcode;

#define VIMARSA_OP_COUNT 7

/* 4-step reduction chain packed into 16 bits:
 * (OP1 << 9) | (OP2 << 6) | (OP3 << 3) | OP4 */
typedef uint16_t Vimarsa_Bytecode;

/* Extract opcode at step N (0-3) from a Vimarsa_Bytecode */
#define VBC_STEP(bc, n) ((Vimarsa_Opcode)(((bc) >> (9 - (n)*3)) & 0x07u))

/* Pack 4 opcodes into a Vimarsa_Bytecode */
#define VBC_PACK(a, b, c, d) \
    ((Vimarsa_Bytecode)(((a)<<9)|((b)<<6)|((c)<<3)|(d)))

typedef struct {
    const char*      symbol;     /* display form — Obsidian only */
    Vimarsa_Opcode   opcode;     /* 3-bit identity */
    Vimarsa_Bytecode reduction;  /* 4-step core reduction */
    uint8_t          arity;      /* 0=nullary, 1=unary, 2=binary */
} Vimarsa_Operator;

extern const Vimarsa_Operator VIMARSA_TABLE[VIMARSA_OP_COUNT];


/* ===================================================================
 * III. FR 2.0.0-B: CONCRESCENCE STATE MACHINE
 * =================================================================== */

typedef enum {
    TETRAL_ZERO    = 0,   /* 0: neutral ground              */
    TETRAL_PLUSMIN = 1,   /* +/-0: fused 0/1 singularity    */
    TETRAL_NEG     = 2,   /* -0: primal withholding         */
    TETRAL_POS     = 3,   /* +0: existent withholding       */
    TETRAL_VOID    = 4    /* 00: void recurrence            */
} Tetralemmic_Position;

#define CONCRESCENCE_TETRALEMMIC_STATES 5u
#define CONCRESCENCE_STEPS 12u

typedef struct {
    Tetralemmic_Position states[CONCRESCENCE_STEPS];
    uint8_t              step_count;
    uint8_t              is_descending;
} Concrescence_Trace;

_Static_assert(CONCRESCENCE_STEPS == RING_SIZE,
    "Concrescence helix must match the 12-step SU(2) ring");

/* The Quaternionic Ground — Purnata (#0-3-7)
 * q = 0 + 0i + 0j + 0k — all rotation latent, none manifest. */
static const Quaternion PURNATA_QUATERNION_SEED = {
    .w = 0.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f
};


/* ===================================================================
 * IV. FR 2.0.1: SPANDA DISCRIMINATOR — 8-bit atomic state
 * =================================================================== */

union Spanda_Discriminator {
    uint8_t raw;
    struct {
        uint8_t op_masks : 7;  /* bits 0-6: one bit per Vimarsa operator */
        uint8_t spanda   : 1;  /* bit 7: 0=AND (boundless), 1=OR (limitation) */
    } bits;
};

_Static_assert(sizeof(Spanda_Discriminator) == 1, "Spanda_Discriminator must be 1 byte");

#define SPANDA_AND  0u   /* inclusive simultaneity */
#define SPANDA_OR   1u   /* exclusive choice      */


/* ===================================================================
 * V. FR 2.0.2: VOID ARITHMETIC
 * =================================================================== */

typedef uint8_t void_ops_t;

#define VOID_OP_TRANSCEND   (1u << 0)
#define VOID_OP_REFLECT     (1u << 1)
#define VOID_OP_GENERATE    (1u << 2)
#define VOID_OP_SYNTHESIZE  (1u << 3)
#define VOID_OP_DUAL(x)     ((x) << 4)

#define VOID_9  9u  /* Wholeness constant: (00+00) = 9 */

typedef struct {
    uint8_t  r_factor;
    uint8_t  divine_act;
    uint16_t cross_branch_refs;
} Virtue_Entry;

extern const Virtue_Entry VIRTUE_LUT[9];

#define VIRTUE_TO_RFACTOR(v) ((v) >= 3u ? (uint8_t)((v) - 3u) : 0xFFu)


/* ===================================================================
 * VI. FR 2.0.3: ARCHETYPAL NUMBER LANGUAGE — 12-FOLD
 *
 * 12 elements: (-) mirror + 0/1 singularity + numbers 0-9
 * =================================================================== */

/* Sub-table forward declarations */
typedef struct Zodiacal_Entry   Zodiacal_Entry;
typedef struct Monopoly_Entry   Monopoly_Entry;
typedef struct DivineAct_Entry  DivineAct_Entry;

#define SUB_TABLE_NONE      0u
#define SUB_TABLE_ZODIACAL  1u
#define SUB_TABLE_MONOPOLY  2u
#define SUB_TABLE_DIVINE    3u
#define SUB_TABLE_VIRTUE    4u

#define ARCHETYPE_LUT_SIZE 12  /* (-) + 0/1 + 0-9 */

typedef struct {
    uint8_t  index;
    uint8_t  dimensionality;
    uint8_t  polarity;         /* 0=ADAM, 1=EVE, 2=NEUTRAL */
    uint8_t  complement_idx;   /* ADAM_EVE partner (0xFF if none) */
    uint8_t  weave_anchor[2];
    uint8_t  sub_table_type;
    uint8_t  sub_table_size;

    union {
        const void*            raw_ptr;
        const Zodiacal_Entry*  zodiacal_grammar;
        const Monopoly_Entry*  monopoly_dialectic;
        const DivineAct_Entry* divine_acts;
        const Virtue_Entry*    virtue_entries;
    } sub_table;

    Compiled_Formulation formulation;
} Archetype_Entry;

extern const Archetype_Entry ARCHETYPE_LUT[ARCHETYPE_LUT_SIZE];

/* FR 2.0.3-H: Zodiacal Quality Augment */
#define ZOD_ELEM_FIRE    0x00u
#define ZOD_ELEM_EARTH   0x04u
#define ZOD_ELEM_AIR     0x08u
#define ZOD_ELEM_WATER   0x0Cu

#define ZOD_MODE_CARDINAL  0x00u
#define ZOD_MODE_FIXED     0x01u
#define ZOD_MODE_MUTABLE   0x02u

struct Zodiacal_Entry {
    uint8_t symbol_pair;
    uint8_t resonance;
    uint8_t successor;
    uint8_t zodiacal_quality;
};

extern const Zodiacal_Entry ZODIACAL_LUT[12];

#define ZOD_GET_ELEMENT(q)   (((q) >> 2) & 0x03u)
#define ZOD_GET_MODALITY(q)  ((q) & 0x03u)

struct Monopoly_Entry {
    uint8_t position;
    uint8_t shadow_opposite;
    uint8_t light_opposite;
};

extern const Monopoly_Entry MONOPOLY_LUT[7];

/* FR 2.0.3-I: Divine Act CF and Weave Augment */
typedef uint8_t DivineAct_WeaveMask;

struct DivineAct_Entry {
    uint8_t position;
    uint8_t enables_next;
    uint8_t manifests_arch;
    uint8_t cf_id;
    DivineAct_WeaveMask weave_mask;
};

extern const DivineAct_Entry DIVINE_ACT_LUT[7];


/* ===================================================================
 * VII. FR 2.0.4: FIVE-LEVEL QL META-LOGIC STACK
 * =================================================================== */

typedef struct {
    uint8_t     frame_id;       /* 0=O#, 1=X#, 2=N#, 3=M#, 4=# */
    const char* designation;    /* Obsidian layer only */
    uint8_t     torus_next[6];  /* internal mod-6 walk */
    uint8_t     generates;      /* next frame_id in cascade (0xFF=terminal) */
    Compiled_Formulation formulation;
} QL_Frame;

extern const QL_Frame QL_STACK[5];

/* FR 2.0.4-H: Nara bridge entries */
#define NARA_POLARITY_YIN    0u
#define NARA_POLARITY_YANG   1u
#define NARA_POLARITY_BOTH   2u

typedef struct {
    uint8_t frame_position;
    uint8_t polarity;
    uint8_t dominant_val;
    uint8_t archetype_role;
} Nara_Entry;

extern const Nara_Entry NARA_MSHARP_LUT[5];


/* ===================================================================
 * VIII. FR 2.0.5: SIVA-SHAKTI OPERATOR/PROCESSOR DUALITY
 * =================================================================== */

typedef void (*Siva_Operator)(struct Holographic_Coordinate* self, void* operand);

typedef struct {
    const char*   symbol;
    Siva_Operator execute;
    uint8_t       cross_logical;
    uint8_t       cross_archetype;
} Siva_Entry;

extern const Siva_Entry SIVA_TABLE[6];


/* ===================================================================
 * IX. FR 2.0.6: R-FACTOR ROUTING
 *
 * R-Factor = "Reality Factor" — a form of context sequence (CS)
 * operating at the cross-M scale. Expresses emanation chains
 * (descending from higher M-levels) and absorption chains
 * (ascending back). Complementarity law: Rx + Ry -> x+y = 5.
 * =================================================================== */

typedef uint16_t R_Factor_Route;

#define GET_R_POS(route, r_idx) (((route) >> ((r_idx) * 3)) & 0x07u)

/* Route words — 3 bits per R-factor, value 7 = absent
 * Complementarity law: Rx + R(5-x) = 5 where both present */
#define ROUTE_O_SHARP   ((R_Factor_Route)0x5FC0u)
#define ROUTE_X_SHARP   ((R_Factor_Route)0x4A09u)
#define ROUTE_N_SHARP   ((R_Factor_Route)0x3852u)
#define ROUTE_M_SHARP   ((R_Factor_Route)0x269Bu)
#define ROUTE_NARA      ((R_Factor_Route)0x14E4u)
#define ROUTE_SIVA      ((R_Factor_Route)0x032Du)
#define ROUTE_SHAKTI    ((R_Factor_Route)0x717Fu)

#define R_FACTOR_ROUTE_COUNT 7

extern const R_Factor_Route R_FACTOR_ROUTE_TABLE[R_FACTOR_ROUTE_COUNT];


/* ===================================================================
 * X. FR 2.0.9: DIVINE ACT ENUM — 6-to-6 isomorphism
 * =================================================================== */

typedef enum {
    ACT_SRISHTI   = 0,
    ACT_STHITI    = 1,
    ACT_SAMHARA   = 2,
    ACT_TIRODHANA = 3,
    ACT_ANUGRAHA  = 4,
    ACT_SAMAVESA  = 5
} Divine_Act;

_Static_assert((int)ACT_SAMAVESA == 5, "Divine_Act must span 0-5");


/* ===================================================================
 * XI. FR 2.0.8 + 2.0.10: UNIFIED CLOCK + LOGOS STATE
 * =================================================================== */

typedef struct {
    uint8_t  m1_torus_stage;
    uint8_t  m2_decan_phase;
    uint8_t  m3_hexagram_id;
    bool     is_implicate_phase;
} Unified_Clock_State;

static inline Unified_Clock_State m0_read_cosmic_clock(uint16_t degree_0_to_719) {
    Unified_Clock_State s;
    s.is_implicate_phase = (degree_0_to_719 >= 360u);
    uint16_t base = degree_0_to_719 % 360u;
    s.m1_torus_stage = (uint8_t)(base / 30u);
    uint8_t base_decan = (uint8_t)(base / 10u);
    s.m2_decan_phase = s.is_implicate_phase ? (uint8_t)(base_decan + 36u) : base_decan;
    s.m3_hexagram_id = (uint8_t)((base * 64u) / 360u);
    return s;
}

typedef uint8_t LogosStage;

typedef struct {
    uint8_t    pipeline_tick;
    LogosStage current_stage;
    Divine_Act active_divine_act;
    bool       is_implicate;
    uint8_t    active_r_factor;
} Unified_Logos_State;

static inline Unified_Logos_State m0_compute_logos_state(uint8_t tick_0_to_11) {
    Unified_Logos_State s;
    s.pipeline_tick = tick_0_to_11;
    s.is_implicate  = (tick_0_to_11 >= 6u);
    s.current_stage = (LogosStage)(s.is_implicate
                          ? (11u - tick_0_to_11)
                          : tick_0_to_11);
    s.active_divine_act = (Divine_Act)s.current_stage;
    s.active_r_factor   = (uint8_t)s.current_stage;
    return s;
}


/* ===================================================================
 * XII. FR 2.0.X: CROSS-BRANCH EDGE REGISTRY
 * =================================================================== */

typedef enum {
    QL_CAT_FOUNDATIONAL_TRANSCENDENT = 0,
    QL_CAT_IMPLICATE                 = 1,
    QL_CAT_IMPLICATE_EXPLICATE       = 2,
} M0_QL_Category;

typedef struct {
    uint8_t m0_sub_branch;
    uint8_t macro_m_branch;
    uint8_t relation_type;
    uint8_t cf_id;
} Cross_Branch_Edge;

#define HOLOGRAPHIC_MICRO_IMAGE_REL 0u
#define VEILED_BY_SKIN_REL          1u
#define GENERATES_REL               2u

#define M0_CROSS_BRANCH_COUNT 7u

extern const Cross_Branch_Edge M0_CROSS_BRANCH_REGISTRY[M0_CROSS_BRANCH_COUNT];
extern const uint8_t M0_GOVERNING_CF[6];


/* ===================================================================
 * XIII. M0 ROOT STRUCT — HC-anchored module state
 * =================================================================== */

typedef struct {
    Holographic_Coordinate* hc;           /* FIRST FIELD — always. HC_LINK'd. */
    const Holographic_Coordinate* active_cf;  /* CF_TABLE[CF_VOID] */
    Spanda_Discriminator spanda_state;
    void_ops_t active_void_ops;
    Unified_Logos_State logos_state;
} M0_Root;


/* ===================================================================
 * XIV. PUBLIC API (<=6 functions)
 * =================================================================== */

M0_Root* m0_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);
void     m0_teardown(M0_Root* root);
int      m0_cli_dispatch(int argc, char** argv, M0_Root* root);

/* R-factor weave dispatcher — dispatches across 7 frames */
void m0_execute_r_factor_weave(Unified_Logos_State* state);

/* Verify holographic registry at boot */
bool m0_verify_holographic_registry(void);


#endif /* M0_H */
