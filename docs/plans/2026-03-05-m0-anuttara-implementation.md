# M0 (Anuttara) — Multi-Level Language Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement M0 (Anuttara) as a C library module — the bare-metal VM comprising six nested micro-algebras, anchored to Psychoid_0 via CF_VOID (00/00).

**Architecture:** M0 is the instruction-set processor for the Epistemic Manifold. It defines: (1) the Vimarsa 3-bit ISA, (2) the Spanda discriminator, (3) void arithmetic, (4) the 12-fold archetypal number language, (5) a 5-frame QL meta-logic stack with R-factor routing, and (6) the Siva-Shakti operator/processor duality. The VAK instruction system is extracted to the engine/ontology level as it operates on the 6 reflective coordinates universally. Every named coordinate carries a Compiled_Formulation encoding its concrescence trace.

**Tech Stack:** C11 (clang), Pillar I ontology (ontology.h, psychoid_numbers.h, arena.h, engine.h)

**Corrections from spec review (applied throughout):**
1. Archetypal number language is 12-fold, not 10-fold (0-9 + 0/1 singularity + (-) mirror)
2. Every M0 coordinate carries a `Compiled_Formulation` (operator signature + reduction kernel + depth + dimensionality + source string)
3. VAK instruction types and dispatcher live at ontology/engine level (`vak.h` + `engine.c`), not inside M0 — M0 defines the semantic handlers
4. R-Factor is a *form of* CS (context sequence) at the cross-M scale — not identical to CS. The complementarity law `Rx + Ry = 5` expresses emanation-absorption chains between M-levels

---

## Task 0: VAK Infrastructure (Ontology/Engine Level)

**Rationale:** VAK instructions operationalize the 6 reflective coordinates (cpf, ct, cp, cf, cfp, cs). They are universal — used by ANY subsystem, not owned by M0. This must exist before M0 can define its semantic handlers.

**Files:**
- Create: `include/vak.h`
- Modify: `src/engine.c` (add VAK dispatcher stub)
- Modify: `include/engine.h` (add VAK declarations)
- Test: `src/test_vak.c`

### Step 1: Write the failing test

```c
/* src/test_vak.c — VAK instruction infrastructure tests */
#include "ontology.h"
#include "psychoid_numbers.h"
#include "vak.h"
#include <stdio.h>
#include <assert.h>

static int tests_passed = 0;
static int tests_run = 0;

#define TEST(name) do { tests_run++; printf("  [%d] %s... ", tests_run, #name);
#define PASS tests_passed++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== VAK Infrastructure Tests ===\n");

    /* T1: VAK_Instruction struct size and field access */
    TEST(vak_instruction_size) {
        VAK_Instruction instr = {
            .vak_family = VAK_FAMILY_CF,
            .vak_index = 3,
            .target_branch = 2,
            .target_pos = 4,
            .is_inverted = 0
        };
        assert(sizeof(VAK_Instruction) == 5);
        assert(instr.vak_family == VAK_FAMILY_CF);
        assert(instr.vak_index == 3);
        assert(instr.target_branch == 2);
        assert(instr.target_pos == 4);
    } PASS;

    /* T2: VAK family constants map to reflective coordinates */
    TEST(vak_family_constants) {
        assert(VAK_FAMILY_CPF == 0);  /* cpf */
        assert(VAK_FAMILY_CT  == 1);  /* ct  */
        assert(VAK_FAMILY_CP  == 2);  /* cp  */
        assert(VAK_FAMILY_CF  == 3);  /* cf  */
        assert(VAK_FAMILY_CFP == 4);  /* cfp */
        assert(VAK_FAMILY_CS  == 5);  /* cs  */
        assert(VAK_FAMILY_COUNT == 6);
    } PASS;

    /* T3: VAK_FAMILY_NAME macro gives correct string */
    TEST(vak_family_names) {
        assert(VAK_FAMILY_NAMES[0][0] == 'C'); /* "CPF" */
        assert(VAK_FAMILY_NAMES[5][0] == 'C'); /* "CS" */
    } PASS;

    /* T4: execute_vak_instruction rejects invalid family */
    TEST(vak_reject_invalid_family) {
        VAK_Instruction bad = { .vak_family = 9 };
        int result = execute_vak_instruction(NULL, bad);
        assert(result == VAK_ERR_FAMILY);
    } PASS;

    /* T5: execute_vak_instruction rejects NULL session for valid families */
    TEST(vak_reject_null_session) {
        VAK_Instruction instr = { .vak_family = VAK_FAMILY_CPF };
        int result = execute_vak_instruction(NULL, instr);
        assert(result == VAK_ERR_SESSION);
    } PASS;

    printf("\n=== VAK Tests: %d/%d passed ===\n", tests_passed, tests_run);
    return (tests_passed == tests_run) ? 0 : 1;
}
```

### Step 2: Run test to verify it fails

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude src/psychoid_numbers.c src/engine.c src/arena.c src/test_vak.c -o test_vak
```
Expected: FAIL — `vak.h` not found.

### Step 3: Write `include/vak.h`

```c
/**
 * vak.h — The VAK Instruction Set (Reflective Coordinate Operations)
 *
 * VAK instructions operationalize the 6 reflective coordinates:
 *   cpf, ct, cp, cf, cfp, cs
 *
 * These are UNIVERSAL — any M-branch or subsystem can issue and receive
 * VAK instructions. M0 (Anuttara) defines the semantic handlers for what
 * each family does when executed; the dispatch infrastructure lives here.
 *
 * Architecture:
 *   VAK_Instruction is a 5-byte struct parsed from coordinate strings.
 *   execute_vak_instruction() dispatches by integer family index (0-5).
 *   Each family maps 1:1 to a reflective coordinate pointer field.
 *   No string comparisons on the execution path.
 *
 * VAK Family → Reflective Coordinate Mapping:
 *   0 CPF → cpf (Category-Position-Frame)
 *   1 CT  → ct  (Context-Time / Content Types)
 *   2 CP  → cp  (Context-Position)
 *   3 CF  → cf  (Context-Frame)
 *   4 CFP → cfp (Context-Frame-Position / Paths)
 *   5 CS  → cs  (Context-Sequence)
 */

#ifndef VAK_H
#define VAK_H

#include "ontology.h"

/* ===================================================================
 * I. VAK FAMILY CONSTANTS — index into reflective coordinate space
 * =================================================================== */

#define VAK_FAMILY_CPF   0u   /* cpf — Category-Position-Frame       */
#define VAK_FAMILY_CT    1u   /* ct  — Context-Time / Content Types   */
#define VAK_FAMILY_CP    2u   /* cp  — Context-Position               */
#define VAK_FAMILY_CF    3u   /* cf  — Context-Frame                  */
#define VAK_FAMILY_CFP   4u   /* cfp — Context-Frame-Position / Paths */
#define VAK_FAMILY_CS    5u   /* cs  — Context-Sequence               */
#define VAK_FAMILY_COUNT 6u

/* Human-readable names — Obsidian/CLI layer ONLY */
static const char* const VAK_FAMILY_NAMES[VAK_FAMILY_COUNT] = {
    "CPF", "CT", "CP", "CF", "CFP", "CS"
};

/* ===================================================================
 * II. VAK INSTRUCTION — 5-byte parsed instruction
 * =================================================================== */

typedef struct {
    uint8_t  vak_family;     /* 0-5: which reflective coordinate      */
    uint8_t  vak_index;      /* coordinate's own index within family   */
    uint8_t  target_branch;  /* which M-branch (0-5) to target        */
    uint8_t  target_pos;     /* position within that branch            */
    uint8_t  is_inverted;    /* 1 if prime (') suffix present          */
} VAK_Instruction;

_Static_assert(sizeof(VAK_Instruction) == 5, "VAK_Instruction must be 5 bytes");

/* ===================================================================
 * III. RETURN CODES
 * =================================================================== */

#define VAK_SUCCESS      0
#define VAK_ERR_FAMILY  (-1)
#define VAK_ERR_INDEX   (-2)
#define VAK_ERR_SESSION (-3)

/* ===================================================================
 * IV. VAK SEMANTIC HANDLER — function pointer type
 *
 * M-branch modules register handlers for each VAK family.
 * The default handler returns VAK_ERR_FAMILY (unimplemented).
 * =================================================================== */

typedef int (*VAK_Handler)(Holographic_Coordinate* session,
                           VAK_Instruction instr);

/* ===================================================================
 * V. VAK DISPATCH — engine-level dispatcher
 * =================================================================== */

/**
 * execute_vak_instruction — dispatch a VAK instruction on a session HC.
 *
 * Looks up the handler for instr.vak_family and calls it.
 * Returns VAK_SUCCESS or VAK_ERR_* code.
 *
 * Session must not be NULL (returns VAK_ERR_SESSION).
 * Family must be 0-5 (returns VAK_ERR_FAMILY).
 */
int execute_vak_instruction(Holographic_Coordinate* session,
                            VAK_Instruction instr);

/**
 * vak_register_handler — register a semantic handler for a VAK family.
 *
 * Called by M-branch init functions to wire their semantics into VAK.
 * E.g., M0 registers handlers for what CPF/CT/CP/CF/CFP/CS mean
 * within the Anuttara VM layer.
 */
void vak_register_handler(uint8_t family, VAK_Handler handler);

#endif /* VAK_H */
```

### Step 4: Add VAK dispatcher to `src/engine.c`

Append to `src/engine.c`:

```c
/* =============================================================================
 * VAK INSTRUCTION DISPATCH — operates on the 6 reflective coordinates
 * ============================================================================= */

#include "vak.h"

/* Default handler table — all return VAK_ERR_FAMILY until M-branches register */
static int vak_default_handler(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)s; (void)i;
    return VAK_ERR_FAMILY;
}

static VAK_Handler vak_handlers[VAK_FAMILY_COUNT] = {
    vak_default_handler, vak_default_handler, vak_default_handler,
    vak_default_handler, vak_default_handler, vak_default_handler
};

void vak_register_handler(uint8_t family, VAK_Handler handler) {
    if (family < VAK_FAMILY_COUNT && handler) {
        vak_handlers[family] = handler;
    }
}

int execute_vak_instruction(Holographic_Coordinate* session,
                            VAK_Instruction instr) {
    if (instr.vak_family >= VAK_FAMILY_COUNT) return VAK_ERR_FAMILY;
    if (!session) return VAK_ERR_SESSION;
    return vak_handlers[instr.vak_family](session, instr);
}
```

Also add to `include/engine.h`:
```c
#include "vak.h"  /* VAK instruction dispatch */
```

### Step 5: Build and run test

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude src/psychoid_numbers.c src/engine.c src/arena.c src/test_vak.c -o test_vak && ./test_vak
```
Expected: ALL 5 tests PASS.

### Step 6: Commit

```bash
git add include/vak.h src/engine.c include/engine.h src/test_vak.c
git commit -m "feat: VAK instruction infrastructure at engine level

VAK instructions operationalize the 6 reflective coordinates (cpf-cs).
Universal dispatch — any M-branch can register semantic handlers.
5 infrastructure tests passing."
```

---

## Task 1: M0 Header (`include/m0.h`)

**Files:**
- Create: `include/m0.h`

### Step 1: Write the header

The header IS the module contract. All types, all LUT externs, all API functions.

```c
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

#define CONCRESCENCE_STEPS 8

typedef struct {
    Tetralemmic_Position states[CONCRESCENCE_STEPS];
    uint8_t              step_count;
} Concrescence_Trace;


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

/* Route words — 3 bits per R-factor, value 7 = absent */
#define ROUTE_O_SHARP   ((R_Factor_Route)0x5F81u)
#define ROUTE_X_SHARP   ((R_Factor_Route)0x4A0Au)
#define ROUTE_N_SHARP   ((R_Factor_Route)0x3853u)
#define ROUTE_M_SHARP   ((R_Factor_Route)0x2537u)
#define ROUTE_NARA      ((R_Factor_Route)0x14E7u)
#define ROUTE_SIVA      ((R_Factor_Route)0x00C7u)
#define ROUTE_SHAKTI    ((R_Factor_Route)0x705Fu)

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
```

### Step 2: Verify header compiles

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
echo '#include "m0.h"
int main(void) { return 0; }' > /tmp/test_m0_header.c
clang -std=c11 -Wall -Wextra -Iinclude -fsyntax-only /tmp/test_m0_header.c
```
Expected: Clean compile, zero warnings.

### Step 3: Commit

```bash
git add include/m0.h
git commit -m "feat: M0 (Anuttara) header — full type contracts

All 14 FRs represented as types and externs.
12-fold ARCHETYPE_LUT, Compiled_Formulation on all named coords.
Inline cosmic clock and logos state computations."
```

---

## Task 2: M0 .rodata Section (`src/m0.c` — LUTs)

**Files:**
- Create: `src/m0.c`
- Test: `src/test_m0_rodata.c`

### Step 1: Write the failing test

```c
/* src/test_m0_rodata.c — M0 .rodata LUT validation tests */
#include "m0.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 .rodata Tests ===\n");

    /* T1: VIMARSA_TABLE has 7 entries, all non-null opcodes */
    TEST(vimarsa_table_count) {
        for (int i = 0; i < VIMARSA_OP_COUNT; i++) {
            assert(VIMARSA_TABLE[i].opcode >= OP_ILLUMINATE);
            assert(VIMARSA_TABLE[i].opcode <= OP_DISTINGUISH);
            assert(VIMARSA_TABLE[i].symbol != NULL);
        }
    } PASS;

    /* T2: ARCHETYPE_LUT has 12 entries */
    TEST(archetype_lut_12fold) {
        /* Index 0: (-) mirror */
        assert(ARCHETYPE_LUT[0].index == 0);
        /* Index 1: 0/1 singularity */
        assert(ARCHETYPE_LUT[1].index == 1);
        /* Indices 2-11: numbers 0-9 */
        for (int i = 2; i < 12; i++) {
            assert(ARCHETYPE_LUT[i].index == (uint8_t)i);
        }
    } PASS;

    /* T3: Zodiacal sub-table is wired to Archetype 3 (Vak) = index 7 */
    TEST(zodiacal_wiring) {
        assert(ARCHETYPE_LUT[7].sub_table_type == SUB_TABLE_ZODIACAL);
        assert(ARCHETYPE_LUT[7].sub_table_size == 12);
        assert(ARCHETYPE_LUT[7].sub_table.zodiacal_grammar == ZODIACAL_LUT);
    } PASS;

    /* T4: MonoPoly sub-table wired to Archetype 5 (Dynamic Harmony) = index 9 */
    TEST(monopoly_wiring) {
        assert(ARCHETYPE_LUT[9].sub_table_type == SUB_TABLE_MONOPOLY);
        assert(ARCHETYPE_LUT[9].sub_table_size == 7);
    } PASS;

    /* T5: Divine Acts sub-table wired to Archetype 7 = index 11 */
    TEST(divine_acts_wiring) {
        assert(ARCHETYPE_LUT[11].sub_table_type == SUB_TABLE_DIVINE);
        assert(ARCHETYPE_LUT[11].sub_table_size == 7);
    } PASS;

    /* T6: VIRTUE_LUT[0] is meta-virtue (r_factor=0xFF) */
    TEST(virtue_lut_anchor) {
        assert(VIRTUE_LUT[0].r_factor == 0xFF);
        assert(VIRTUE_TO_RFACTOR(3) == 0);
        assert(VIRTUE_TO_RFACTOR(8) == 5);
        assert(VIRTUE_TO_RFACTOR(0) == 0xFF);
    } PASS;

    /* T7: QL_STACK has 5 frames, cascade wired */
    TEST(ql_stack_cascade) {
        assert(QL_STACK[0].frame_id == 0); /* O# */
        assert(QL_STACK[0].generates == 1); /* -> X# */
        assert(QL_STACK[4].frame_id == 4); /* # (Nara) */
        assert(QL_STACK[4].generates == 0xFF); /* terminal */
    } PASS;

    /* T8: SIVA_TABLE has 6 entries with non-NULL execute ptrs */
    TEST(siva_table_entries) {
        for (int i = 0; i < 6; i++) {
            assert(SIVA_TABLE[i].execute != NULL);
        }
    } PASS;

    /* T9: R-factor complementarity: Rx + Ry = 5 */
    TEST(r_factor_complementarity) {
        /* R1 + R4 = 5 for O#, X#, N#, Nara, Siva (where both present) */
        for (int f = 0; f < 6; f++) {
            uint8_t r1 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 1);
            uint8_t r4 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 4);
            if (r1 < 7 && r4 < 7) {
                assert(r1 + r4 == 5);
            }
        }
        /* R2 + R3 = 5 for X#, N#, Nara, Siva (where both present) */
        for (int f = 1; f < 6; f++) {
            uint8_t r2 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 2);
            uint8_t r3 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 3);
            if (r2 < 7 && r3 < 7) {
                assert(r2 + r3 == 5);
            }
        }
    } PASS;

    /* T10: Cross-branch registry has 7 entries */
    TEST(cross_branch_registry) {
        assert(M0_CROSS_BRANCH_COUNT == 7);
        for (uint8_t i = 0; i < 6; i++) {
            assert(M0_CROSS_BRANCH_REGISTRY[i].relation_type == HOLOGRAPHIC_MICRO_IMAGE_REL);
            assert(M0_GOVERNING_CF[M0_CROSS_BRANCH_REGISTRY[i].m0_sub_branch]
                   == M0_CROSS_BRANCH_REGISTRY[i].cf_id);
        }
    } PASS;

    /* T11: Cosmic clock at degree 155 */
    TEST(cosmic_clock_155) {
        Unified_Clock_State c = m0_read_cosmic_clock(155);
        assert(c.m1_torus_stage == 5);
        assert(c.m2_decan_phase == 15);
        assert(c.m3_hexagram_id == 27);
        assert(!c.is_implicate_phase);
    } PASS;

    /* T12: Logos state at tick 0 and tick 6 */
    TEST(logos_state) {
        Unified_Logos_State s0 = m0_compute_logos_state(0);
        assert(s0.current_stage == 0);
        assert(s0.active_divine_act == ACT_SRISHTI);
        assert(!s0.is_implicate);

        Unified_Logos_State s6 = m0_compute_logos_state(6);
        assert(s6.current_stage == 5);
        assert(s6.active_divine_act == ACT_SAMAVESA);
        assert(s6.is_implicate);
    } PASS;

    /* T13: Every Compiled_Formulation in ARCHETYPE_LUT has a source string */
    TEST(formulation_sources) {
        for (int i = 0; i < ARCHETYPE_LUT_SIZE; i++) {
            assert(ARCHETYPE_LUT[i].formulation.source != NULL);
        }
    } PASS;

    /* T14: Compiled_Formulation signatures are non-zero for non-ground elements */
    TEST(formulation_signatures) {
        /* The mirror (-) should have OP_WITHHOLD in its signature */
        assert(ARCHETYPE_LUT[0].formulation.signature & (1u << (OP_WITHHOLD - 1)));
    } PASS;

    printf("\n=== M0 .rodata: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
```

### Step 2: Run test to verify it fails

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude src/psychoid_numbers.c src/engine.c src/arena.c src/m0.c src/test_m0_rodata.c -o test_m0_rodata
```
Expected: FAIL — `src/m0.c` doesn't exist.

### Step 3: Write `src/m0.c` — the .rodata section

This is the largest task. Create `src/m0.c` with all static const LUTs.

**Key .rodata contents:**
- `VIMARSA_TABLE[7]` — 7 operator entries with opcodes and reduction chains
- `VIRTUE_LUT[9]` — 9 virtue entries with R-factor links
- `ZODIACAL_LUT[12]` — 12 zodiacal entries with quality augment
- `MONOPOLY_LUT[7]` — 7 dialectic entries
- `DIVINE_ACT_LUT[7]` — 7 divine act entries with CF+weave augment
- `ARCHETYPE_LUT[12]` — 12-fold master LUT with typed sub-table pointers and Compiled_Formulations
- `QL_STACK[5]` — 5 QL frames with torus wiring
- `SIVA_TABLE[6]` — 6 Siva operator function pointers
- `R_FACTOR_ROUTE_TABLE[7]` — 7 route words
- `M0_CROSS_BRANCH_REGISTRY[7]` + `M0_GOVERNING_CF[6]`

**Implementation notes:**
- Every entry in ARCHETYPE_LUT carries a `Compiled_Formulation` with:
  - `.signature` computed from which Vimarsa operators appear in the formulation
  - `.reduction_depth` counted from `->` steps in the source
  - `.dimensionality` from the `/D` suffix
  - `.terminal_opcode` from the final operator
  - `.core_chain` packed via `VBC_PACK()`
  - `.source` = full formulation string
- Siva operator stubs: 6 static functions implementing the operator table
- R-factor route constants need binary verification against the assignment matrix
- FR comment references: `/* FR 2.0.N: ... */` on every section

**The implementer** should follow the spec `docs/specs/M/M0-anuttara-language-architecture.md` for every LUT value. The formulation strings come from `docs/datasets/nodes_anuttara.json`.

### Step 4: Build and run .rodata tests

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/m0.c \
    src/test_m0_rodata.c -o test_m0_rodata && ./test_m0_rodata
```
Expected: ALL 14 tests PASS.

### Step 5: Commit

```bash
git add src/m0.c src/test_m0_rodata.c
git commit -m "feat: M0 .rodata — all LUTs with 12-fold archetypes + compiled formulations

14 .rodata tests passing. R-factor complementarity verified.
VIMARSA_TABLE, ARCHETYPE_LUT[12], QL_STACK, SIVA_TABLE,
DIVINE_ACT_LUT, ZODIACAL_LUT, MONOPOLY_LUT, VIRTUE_LUT,
R_FACTOR_ROUTE_TABLE, cross-branch registry all populated."
```

---

## Task 3: M0 Init, Teardown, and VAK Handler Registration

**Files:**
- Modify: `src/m0.c` (add init/teardown + VAK handlers)
- Test: `src/test_m0_init.c`

### Step 1: Write the failing test

```c
/* src/test_m0_init.c — M0 init/teardown + VAK integration */
#include "m0.h"
#include "arena.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 Init Tests ===\n");

    /* Setup arena and mirrors */
    Coordinate_Arena arena;
    assert(arena_init(&arena, 64) == 0);

    Holographic_Coordinate* mirrors[6];
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    for (int i = 0; i < 6; i++) {
        mirrors[i] = arena_alloc(&arena);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
    }

    /* T1: m0_init creates a valid M0_Root */
    TEST(m0_init_creates_root) {
        M0_Root* root = m0_init(&arena, mirrors[0]);
        assert(root != NULL);
        assert(root->hc == mirrors[0]);
        assert(mirrors[0]->payload.process_state == root);
        assert(root->active_cf == cf_get(CF_VOID));
    } PASS;

    /* T2: m0_init rejects wrong ql_position */
    TEST(m0_init_rejects_wrong_position) {
        M0_Root* bad = m0_init(&arena, mirrors[3]); /* #3, not #0 */
        assert(bad == NULL);
    } PASS;

    /* T3: Holographic registry verification */
    TEST(holographic_registry) {
        assert(m0_verify_holographic_registry());
    } PASS;

    /* T4: VAK handlers registered (unimplemented families return stub) */
    TEST(vak_handler_registered) {
        VAK_Instruction instr = { .vak_family = VAK_FAMILY_CPF, .vak_index = 0 };
        int result = execute_vak_instruction(mirrors[0], instr);
        /* After m0_init, CPF handler should be registered and return success */
        assert(result == VAK_SUCCESS || result == VAK_ERR_INDEX);
    } PASS;

    /* T5: m0_teardown clears HC link */
    TEST(m0_teardown) {
        M0_Root* root = (M0_Root*)mirrors[0]->payload.process_state;
        m0_teardown(root);
        assert(mirrors[0]->payload.process_state == NULL);
    } PASS;

    arena_destroy(&arena);

    printf("\n=== M0 Init: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
```

### Step 2: Implement init/teardown in `src/m0.c`

Add to bottom of `src/m0.c`:

```c
/* =============================================================================
 * M0 INIT / TEARDOWN
 * ============================================================================= */

#include <stdlib.h>

/* VAK semantic handlers for M0 — implementations below */
static int m0_vak_cpf(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_ct(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cp(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cf(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cfp(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cs(Holographic_Coordinate* s, VAK_Instruction i);

M0_Root* m0_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    if (!arena || !hc) return NULL;
    if (hc->ql_position != 0) return NULL;  /* M0 anchors to #0 */

    M0_Root* root = (M0_Root*)malloc(sizeof(M0_Root));
    if (!root) return NULL;

    HC_LINK(hc, root);
    root->active_cf = cf_get(CF_VOID);
    root->spanda_state.raw = 0;
    root->active_void_ops = 0;
    root->logos_state = m0_compute_logos_state(0);

    /* Register VAK semantic handlers */
    vak_register_handler(VAK_FAMILY_CPF, m0_vak_cpf);
    vak_register_handler(VAK_FAMILY_CT,  m0_vak_ct);
    vak_register_handler(VAK_FAMILY_CP,  m0_vak_cp);
    vak_register_handler(VAK_FAMILY_CF,  m0_vak_cf);
    vak_register_handler(VAK_FAMILY_CFP, m0_vak_cfp);
    vak_register_handler(VAK_FAMILY_CS,  m0_vak_cs);

    return root;
}

void m0_teardown(M0_Root* root) {
    if (!root) return;
    if (root->hc) HC_UNLINK(root->hc);
    free(root);
}

bool m0_verify_holographic_registry(void) {
    for (uint8_t i = 0; i < 6u; i++) {
        if (M0_GOVERNING_CF[M0_CROSS_BRANCH_REGISTRY[i].m0_sub_branch]
                != M0_CROSS_BRANCH_REGISTRY[i].cf_id) {
            return false;
        }
    }
    return true;
}

/* =============================================================================
 * VAK SEMANTIC HANDLERS — M0's definition of what each family does
 *
 * These implement FR 2.0.13: the Anuttara VM layer interpretation
 * of each reflective coordinate operation.
 * ============================================================================= */

/* CPF: #0-1 layer — set discrimination/inversion */
static int m0_vak_cpf(Holographic_Coordinate* s, VAK_Instruction i) {
    Spanda_Discriminator disc;
    disc.bits.spanda = i.is_inverted ? SPANDA_OR : SPANDA_AND;
    disc.bits.op_masks = i.vak_index & 0x7Fu;
    s->inversion_state = disc.raw;
    return VAK_SUCCESS;
}

/* CT: #0-4 layer — select QL frame */
static int m0_vak_ct(Holographic_Coordinate* s, VAK_Instruction i) {
    if (i.vak_index >= 5) return VAK_ERR_INDEX;
    (void)s; /* frame selection recorded in session context */
    return VAK_SUCCESS;
}

/* CP: #0-2 layer — anchor to void arithmetic position */
static int m0_vak_cp(Holographic_Coordinate* s, VAK_Instruction i) {
    s->weave_state = (float)i.target_pos;
    return VAK_SUCCESS;
}

/* CF: #0-0 layer — invoke Vimarsa operator */
static int m0_vak_cf(Holographic_Coordinate* s, VAK_Instruction i) {
    if (i.vak_index >= VIMARSA_OP_COUNT) return VAK_ERR_INDEX;
    uint8_t siva_idx = i.vak_index % 6u;
    if (SIVA_TABLE[siva_idx].execute) {
        SIVA_TABLE[siva_idx].execute(s, NULL);
    }
    return VAK_SUCCESS;
}

/* CFP: R-factor layer — trace R-factor thread */
static int m0_vak_cfp(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)s;
    if (i.vak_index > 11) return VAK_ERR_INDEX;
    Unified_Logos_State state = m0_compute_logos_state(i.vak_index);
    m0_execute_r_factor_weave(&state);
    return VAK_SUCCESS;
}

/* CS: #0-5/M5 layer — advance Logos pipeline */
static int m0_vak_cs(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)i;
    (void)s;
    /* M5 integration point — stub until M5 is implemented */
    return VAK_SUCCESS;
}
```

### Step 3: Build and run

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_init.c -o test_m0_init && ./test_m0_init
```
Expected: ALL 5 tests PASS.

### Step 4: Commit

```bash
git add src/m0.c src/test_m0_init.c
git commit -m "feat: M0 init/teardown + VAK semantic handler registration

M0_Root HC-linked to Psychoid_0. VAK handlers for all 6 families.
Holographic registry verification. 5 init tests passing."
```

---

## Task 4: R-Factor Weave Dispatcher + CLI

**Files:**
- Modify: `src/m0.c` (add r-factor weave + CLI dispatch)
- Test: `src/test_m0_rfactor.c`

### Step 1: Write the failing test

```c
/* src/test_m0_rfactor.c — R-factor weave + CLI dispatch tests */
#include "m0.h"
#include "arena.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 R-Factor + CLI Tests ===\n");

    /* T1: R-factor weave dispatch doesn't crash for all 12 ticks */
    TEST(r_factor_weave_all_ticks) {
        for (uint8_t tick = 0; tick < 12; tick++) {
            Unified_Logos_State s = m0_compute_logos_state(tick);
            m0_execute_r_factor_weave(&s);  /* must not crash */
        }
    } PASS;

    /* T2: R1 ascending sweep — positions 0,1,2,3,4,5 across O#..Siva */
    TEST(r1_ascending_sweep) {
        assert(GET_R_POS(ROUTE_O_SHARP, 1) == 0);
        assert(GET_R_POS(ROUTE_X_SHARP, 1) == 1);
        assert(GET_R_POS(ROUTE_N_SHARP, 1) == 2);
        assert(GET_R_POS(ROUTE_M_SHARP, 1) == 3);
        assert(GET_R_POS(ROUTE_NARA, 1) == 4);
        assert(GET_R_POS(ROUTE_SIVA, 1) == 5);
    } PASS;

    /* T3: R4 descending sweep — positions 5,4,3,2,1,0 */
    TEST(r4_descending_sweep) {
        assert(GET_R_POS(ROUTE_O_SHARP, 4) == 5);
        assert(GET_R_POS(ROUTE_X_SHARP, 4) == 4);
        assert(GET_R_POS(ROUTE_N_SHARP, 4) == 3);
        assert(GET_R_POS(ROUTE_M_SHARP, 4) == 2);
        assert(GET_R_POS(ROUTE_NARA, 4) == 1);
        assert(GET_R_POS(ROUTE_SIVA, 4) == 0);
    } PASS;

    /* T4: CLI dispatch with "info" command */
    TEST(cli_info_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);
        assert(root != NULL);

        char* argv[] = {"m0", "info"};
        int rc = m0_cli_dispatch(2, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    /* T5: CLI dispatch with "clock" command */
    TEST(cli_clock_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);

        char* argv[] = {"m0", "clock", "155"};
        int rc = m0_cli_dispatch(3, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    /* T6: CLI dispatch with "logos" command */
    TEST(cli_logos_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);

        char* argv[] = {"m0", "logos", "7"};
        int rc = m0_cli_dispatch(3, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    printf("\n=== M0 R-Factor + CLI: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
```

### Step 2: Implement R-factor weave + CLI in `src/m0.c`

```c
/* =============================================================================
 * FR 2.0.11: R-FACTOR WEAVE DISPATCHER
 * ============================================================================= */

void m0_execute_r_factor_weave(Unified_Logos_State* state) {
    if (!state) return;
    uint8_t r_idx = state->active_r_factor;

    for (uint8_t frame = 0; frame < R_FACTOR_ROUTE_COUNT; frame++) {
        uint8_t pos = GET_R_POS(R_FACTOR_ROUTE_TABLE[frame], r_idx);
        if (pos == 7u) continue;  /* absent from this frame */
        /* Dispatch point: frame + pos + direction available.
         * Full M-branch dispatch deferred until M1-M5 exist.
         * For now, record that the position was touched. */
    }
}

/* =============================================================================
 * CLI DISPATCH
 * ============================================================================= */

#include <string.h>

int m0_cli_dispatch(int argc, char** argv, M0_Root* root) {
    if (argc < 2 || !root) return -1;

    if (strcmp(argv[1], "info") == 0) {
        printf("[M0 Anuttara] HC position=%u, family=%u, CF=VOID\n",
               root->hc->ql_position, root->hc->family);
        printf("  Spanda state: 0x%02x\n", root->spanda_state.raw);
        printf("  Logos tick: %u (stage=%u, %s)\n",
               root->logos_state.pipeline_tick,
               root->logos_state.current_stage,
               root->logos_state.is_implicate ? "implicate" : "explicate");
        printf("  Vimarsa operators: %d\n", VIMARSA_OP_COUNT);
        printf("  Archetypes: %d (12-fold)\n", ARCHETYPE_LUT_SIZE);
        printf("  QL frames: 5 (O#, X#, N#, M#, #)\n");
        printf("  Siva operators: 6\n");
        printf("  R-factor routes: %d\n", R_FACTOR_ROUTE_COUNT);
        return 0;
    }

    if (strcmp(argv[1], "clock") == 0) {
        uint16_t degree = (argc > 2) ? (uint16_t)atoi(argv[2]) : 0;
        Unified_Clock_State c = m0_read_cosmic_clock(degree);
        printf("[M0 Clock] degree=%u\n", degree);
        printf("  M1 Torus stage: %u\n", c.m1_torus_stage);
        printf("  M2 Decan phase: %u\n", c.m2_decan_phase);
        printf("  M3 Hexagram ID: %u\n", c.m3_hexagram_id);
        printf("  Phase: %s\n", c.is_implicate_phase ? "Implicate" : "Explicate");
        return 0;
    }

    if (strcmp(argv[1], "logos") == 0) {
        uint8_t tick = (argc > 2) ? (uint8_t)atoi(argv[2]) : 0;
        if (tick > 11) tick = 11;
        Unified_Logos_State s = m0_compute_logos_state(tick);
        static const char* act_names[] = {
            "Srishti", "Sthiti", "Samhara",
            "Tirodhana", "Anugraha", "Samavesa"
        };
        printf("[M0 Logos] tick=%u\n", s.pipeline_tick);
        printf("  Stage: %u\n", s.current_stage);
        printf("  Divine Act: %s (R%u)\n", act_names[s.active_divine_act], s.active_r_factor);
        printf("  Phase: %s\n", s.is_implicate ? "Implicate (descending)" : "Explicate (ascending)");
        return 0;
    }

    if (strcmp(argv[1], "vimarsa") == 0) {
        printf("[M0 Vimarsa ISA] 7 operators:\n");
        for (int i = 0; i < VIMARSA_OP_COUNT; i++) {
            printf("  0x%x %s (arity %u)\n",
                   VIMARSA_TABLE[i].opcode,
                   VIMARSA_TABLE[i].symbol,
                   VIMARSA_TABLE[i].arity);
        }
        return 0;
    }

    if (strcmp(argv[1], "archetypes") == 0) {
        printf("[M0 Archetypal Number Language] 12-fold:\n");
        for (int i = 0; i < ARCHETYPE_LUT_SIZE; i++) {
            printf("  [%2d] dim=%uD sub=%u depth=%u src=%s\n",
                   ARCHETYPE_LUT[i].index,
                   ARCHETYPE_LUT[i].dimensionality,
                   ARCHETYPE_LUT[i].sub_table_type,
                   ARCHETYPE_LUT[i].formulation.reduction_depth,
                   ARCHETYPE_LUT[i].formulation.source ? "yes" : "no");
        }
        return 0;
    }

    fprintf(stderr, "[M0] Unknown command: %s\n", argv[1]);
    fprintf(stderr, "Usage: epi-logos m0 {info|clock [deg]|logos [tick]|vimarsa|archetypes}\n");
    return -1;
}
```

### Step 3: Build and run

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_rfactor.c -o test_m0_rfactor && ./test_m0_rfactor
```
Expected: ALL 6 tests PASS.

### Step 4: Commit

```bash
git add src/m0.c src/test_m0_rfactor.c
git commit -m "feat: M0 R-factor weave dispatcher + CLI dispatch

R1 ascending + R4 descending sweeps verified (complementarity Rx+Ry=5).
CLI commands: info, clock, logos, vimarsa, archetypes.
6 R-factor + CLI tests passing."
```

---

## Task 5: Main.c Integration + Full Boot

**Files:**
- Modify: `src/main.c` (add M0 init + CLI routing)
- Test: full build + boot

### Step 1: Modify `src/main.c`

Add after existing includes:
```c
#include "m0.h"
```

Add after Phase 4 (family init), before Phase 5 (double covering):
```c
    /* Phase 4.5: Initialize M0 (Anuttara) */
    M0_Root* m0 = m0_init(&arena, mirrors[0]);
    if (!m0) {
        fprintf(stderr, "[boot] Aborting: M0 init failed.\n");
        arena_destroy(&arena);
        return 1;
    }
    if (!m0_verify_holographic_registry()) {
        fprintf(stderr, "[boot] FAIL: M0 holographic registry broken.\n");
        arena_destroy(&arena);
        return 1;
    }
    printf("[boot] M0 (Anuttara) initialized. CF=VOID. 12-fold archetypes loaded.\n");
```

Add CLI dispatch block before cleanup:
```c
    /* CLI dispatch */
    if (argc > 1 && strcmp(argv[1], "m0") == 0) {
        int rc = m0_cli_dispatch(argc - 1, argv + 1, m0);
        m0_teardown(m0);
        arena_destroy(&arena);
        return rc;
    }
```

Update `main` signature to accept args:
```c
int main(int argc, char** argv) {
```

Add cleanup before return:
```c
    m0_teardown(m0);
```

### Step 2: Build full system

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c src/main.c \
    -o epi-logos
```
Expected: Zero warnings.

### Step 3: Boot test

```bash
./epi-logos
```
Expected: All `[boot] ... OK` lines including `[boot] M0 (Anuttara) initialized`.

### Step 4: CLI smoke tests

```bash
./epi-logos m0 info
./epi-logos m0 clock 155
./epi-logos m0 logos 7
./epi-logos m0 vimarsa
./epi-logos m0 archetypes
```
Expected: Each prints its respective output, returns 0.

### Step 5: Run all test suites

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"

# Pillar I tests
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/test_pillar1_gaps.c -o test_pillar1 && ./test_pillar1

# VAK tests
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c \
    src/test_vak.c -o test_vak && ./test_vak

# M0 .rodata tests
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/m0.c \
    src/test_m0_rodata.c -o test_m0_rodata && ./test_m0_rodata

# M0 init tests
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_init.c -o test_m0_init && ./test_m0_init

# M0 R-factor + CLI tests
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_rfactor.c -o test_m0_rfactor && ./test_m0_rfactor
```
Expected: ALL test suites pass with address+UB sanitizers enabled.

### Step 6: Commit

```bash
git add src/main.c
git commit -m "feat: M0 integrated into boot sequence + CLI routing

epi-logos m0 {info|clock|logos|vimarsa|archetypes} fully operational.
All test suites pass with sanitizers. Zero warnings."
```

---

## Spec Fidelity Checklist

After implementation, verify against `docs/specs/M/M0-anuttara-language-architecture.md`:

- [ ] FR 2.0.0: VIMARSA_TABLE[7] with opcodes, reductions, arities
- [ ] FR 2.0.0-B: Concrescence_Trace with Tetralemmic_Position
- [ ] FR 2.0.1: Spanda_Discriminator as union, sizeof==1
- [ ] FR 2.0.2: void_ops_t, VIRTUE_LUT[9], VOID_9
- [ ] FR 2.0.3: ARCHETYPE_LUT[12] (corrected from 10) with typed sub-tables
- [ ] FR 2.0.3-H: Zodiacal quality augment in ZODIACAL_LUT
- [ ] FR 2.0.3-I: Divine act CF+weave augment in DIVINE_ACT_LUT
- [ ] FR 2.0.4: QL_STACK[5] with torus wiring and cascade
- [ ] FR 2.0.4-H: NARA_MSHARP_LUT[5] bridge entries
- [ ] FR 2.0.5: SIVA_TABLE[6] with function pointers
- [ ] FR 2.0.6: R_FACTOR_ROUTE_TABLE[7], GET_R_POS, complementarity verified
- [ ] FR 2.0.7: No strcmp on hot path
- [ ] FR 2.0.8: m0_read_cosmic_clock() inline, O(1)
- [ ] FR 2.0.9: Divine_Act enum 0-5
- [ ] FR 2.0.10: m0_compute_logos_state() branchless
- [ ] FR 2.0.11: m0_execute_r_factor_weave() dispatcher
- [ ] FR 2.0.12: Cross-branch registry + verify_holographic_registry()
- [ ] FR 2.0.13: VAK handlers at engine level, M0 defines semantics
- [ ] FR 2.0.X: M0_CROSS_BRANCH_REGISTRY, M0_GOVERNING_CF
- [ ] All Compiled_Formulations populated with source strings
- [ ] Root struct HC_LINK'd, CF via cf_get(CF_VOID)
- [ ] boot_verify_web() extended with M0 checks
- [ ] CLI covers all public operations
- [ ] Build produces zero warnings
- [ ] All tests pass with -fsanitize=address,undefined

---

## Build Command (Complete)

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/main.c \
    -o epi-logos
./epi-logos
```
