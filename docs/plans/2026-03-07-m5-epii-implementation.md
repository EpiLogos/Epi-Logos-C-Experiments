# M5 Epii Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement M5 (Epii) — the holographic integration layer at #5 — as a C library module with quintessential view self-API, Logos FSM, agent rosters, and full coordinate family containment.

**Architecture:** M5's HC at #5 holographically contains all 6 coordinate families via its sub-branches (#5-0=M+M', #5-1=L+P+L'+P', #5-2=S+S', #5-3=M' UI, #5-4=S4-4'/S4-5' agents, #5-5=T+C+T'+C'). The quintessential view system provides per-coordinate self-descriptions at three granularity levels (S0'/S1'/S2' compression trika). The Logos FSM (1 byte) governs all traversal with Mobius write-back at tick 11.

**Tech Stack:** C11, clang, ontology.h HC struct, tagged pointers, arena allocator. Design doc: `docs/plans/2026-03-07-m5-epii-design.md`

**Build command (tests):**
```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    src/test_m5.c -o test_m5
./test_m5
```

---

### Task 1: Logos FSM Core Types (m5.h top section)

**Files:**
- Create: `include/m5.h`
- Create: `src/m5.c`
- Create: `src/test_m5.c`

**Step 1: Write the test file skeleton + Logos FSM tests**

Create `src/test_m5.c` with the test harness (matching M4 pattern) and initial tests for the Logos FSM types:

```c
/**
 * test_m5.c — M5 (Epii) Verification Suite
 *
 * Build: clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
 *        -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
 *        -fsanitize=address,undefined \
 *        src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
 *        src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
 *        vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
 *        src/test_m5.c -o test_m5
 */

#include <stdio.h>
#include <string.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m0.h"
#include "m1.h"
#include "m2.h"
#include "m3.h"
#include "m4.h"
#include "m5.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)


/* ===================================================================
 * LOGOS FSM TYPES
 * =================================================================== */

static void test_logos_fsm_types(void) {
    /* LogosStage enum values */
    TEST("ALOGOS == 0",   ALOGOS   == 0);
    TEST("PROLOGOS == 1", PROLOGOS == 1);
    TEST("DIALOGOS == 2", DIALOGOS == 2);
    TEST("LOGOS == 3",    LOGOS    == 3);
    TEST("EPILOGOS == 4", EPILOGOS == 4);
    TEST("ANALOGOS == 5", ANALOGOS == 5);

    /* compute_logos_state — ascending */
    for (uint8_t t = 0; t < 6; t++) {
        Unified_Logos_State s = compute_logos_state(t);
        TEST("ascending tick", s.pipeline_tick == t);
        TEST("ascending not implicate", !s.is_implicate);
        TEST("ascending stage == tick", s.current_stage == t);
        TEST("ascending r_factor == stage", s.active_r_factor == (uint8_t)s.current_stage);
    }

    /* compute_logos_state — descending */
    for (uint8_t t = 6; t < 12; t++) {
        Unified_Logos_State s = compute_logos_state(t);
        TEST("descending tick", s.pipeline_tick == t);
        TEST("descending is implicate", s.is_implicate);
        TEST("descending stage == 11-tick", s.current_stage == (11 - t));
        TEST("descending r_factor == stage", s.active_r_factor == (uint8_t)s.current_stage);
    }

    /* Boundary: tick 0 = ALOGOS ascending */
    Unified_Logos_State s0 = compute_logos_state(0);
    TEST("tick0 = ALOGOS", s0.current_stage == ALOGOS);
    TEST("tick0 ascending", !s0.is_implicate);

    /* Boundary: tick 11 = ALOGOS descending (Mobius) */
    Unified_Logos_State s11 = compute_logos_state(11);
    TEST("tick11 = ALOGOS", s11.current_stage == ALOGOS);
    TEST("tick11 descending", s11.is_implicate);

    /* Symmetry: tick 5 and tick 6 both = ANALOGOS */
    Unified_Logos_State s5 = compute_logos_state(5);
    Unified_Logos_State s6 = compute_logos_state(6);
    TEST("tick5 = ANALOGOS", s5.current_stage == ANALOGOS);
    TEST("tick6 = ANALOGOS", s6.current_stage == ANALOGOS);
    TEST("tick5 ascending", !s5.is_implicate);
    TEST("tick6 descending", s6.is_implicate);
}


int main(void) {
    test_logos_fsm_types();

    printf("\n=== M5 (Epii) Test Results: %d passed, %d failed ===\n",
           pass_count, fail_count);
    return fail_count > 0 ? 1 : 0;
}
```

**Step 2: Write m5.h header — Logos FSM section**

Create `include/m5.h` with the header doc block (matching M4 pattern) and the Logos FSM types:

```c
/**
 * m5.h — Epii: The Holographic Integration Layer (Subsystem #5)
 *
 * Implements: M5 (#5) = holographic container, Logos FSM, quintessential view self-API.
 * Context frame: (5/0) — CF_MOBIUS (Total Synthesis / Mobius Return)
 * Anchored to: Psychoid_5 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h, m0.h, m1.h, m2.h, m3.h, m4.h
 * Feeds into: M0 (Mobius write-back at tick 11)
 *
 * Sub-branch = coordinate family home (holographic containment):
 *   #5-0 = M+M' (integral identity, M0-M5 mirror)
 *   #5-1 = L+P+L'+P' (theory topology, accumulated understanding)
 *   #5-2 = S+S' (full stack objective + project-specific)
 *   #5-3 = M' UI (Electron app, WebMCP hooks)
 *   #5-4 = S4-4'/S4-5' (Anima+Aletheia agent rosters)
 *   #5-5 = T+C+T'+C' (Logos Cycle, cadence of immanence)
 *
 * ARCHITECTURE RULE: M5_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 *
 * Public interface — all consumers need only:
 *   m5_init(arena, hc)                — allocate and HC-link M5 root
 *   m5_advance_logos(root)            — advance Logos FSM, return state
 *   m5_execute_mobius_return(root, m0)— Sacred Violation (tick 11 only)
 *   m5_lookup(root, coord, gran)      — quintessential view self-API
 *   m5_teardown(root)                 — release heap state
 *   m5_cli_dispatch(argc, argv, root) — CLI entry point
 */

#ifndef M5_H
#define M5_H

#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include <stdbool.h>
#include <stdint.h>

/* ===================================================================
 * I. LOGOS FSM — The Cadence of Immanence (#5-5)
 *
 * 6 stages, 12-tick SU(2) double-cover pipeline.
 * Entire FSM state = 1 byte (pipeline_tick).
 * All derived properties computed in O(1) without branching.
 * =================================================================== */

typedef enum {
    ALOGOS    = 0,  /* Without word: pregnant silence               */
    PROLOGOS  = 1,  /* Before word: first differentiation           */
    DIALOGOS  = 2,  /* Through word: relational exchange            */
    LOGOS     = 3,  /* The word: rational articulation              */
    EPILOGOS  = 4,  /* Upon/after word: reflexive turn              */
    ANALOGOS  = 5   /* According to ratio: proportional recognition */
} LogosStage;

typedef struct {
    uint8_t      pipeline_tick;     /* 0-11 (the 12-fold Torus rhythm)     */
    LogosStage   current_stage;     /* 0-5                                 */
    bool         is_implicate;      /* true if tick >= 6 (descending)      */
    uint8_t      active_r_factor;   /* 0-5 — always == current_stage       */
} Unified_Logos_State;

/* O(1) branchless state computation.
 * Stage == Divine_Act == R_Factor (the profound isomorphism). */
static inline Unified_Logos_State compute_logos_state(uint8_t tick) {
    Unified_Logos_State s;
    s.pipeline_tick   = tick;
    s.is_implicate    = (tick >= 6);
    s.current_stage   = s.is_implicate ? (LogosStage)(11 - tick) : (LogosStage)tick;
    s.active_r_factor = (uint8_t)s.current_stage;
    return s;
}

#endif /* M5_H */
```

**Step 3: Write minimal m5.c**

Create `src/m5.c`:

```c
/**
 * m5.c — Epii: The Holographic Integration Layer (Implementation)
 *
 * All .rodata LUT data + API implementation for M5.
 * FR Coverage: 2.5.0 – 2.5.13
 */

#include "m5.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```

**Step 4: Build and run tests**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/test_m5.c -o test_m5
./test_m5
```

Expected: All Logos FSM tests PASS. Zero warnings.

**Step 5: Commit**

```bash
git add include/m5.h src/m5.c src/test_m5.c
git commit -m "feat(m5): Logos FSM core types — LogosStage, Unified_Logos_State, compute_logos_state"
```

---

### Task 2: Quintessential View System + Granularity Hooks

**Files:**
- Modify: `include/m5.h`
- Modify: `src/test_m5.c`

**Step 1: Add QV tests to test_m5.c**

```c
/* ===================================================================
 * QUINTESSENTIAL VIEW SYSTEM
 * =================================================================== */

static void test_quintessential_view(void) {
    M5_Quintessential_View qv = {0};
    TEST("qv zero coord_id", qv.coord_id == 0);
    TEST("qv zero register_count", qv.register_count == 0);
    TEST("qv zero refinement_cycle", qv.refinement_cycle == 0);
    TEST("qv null pithy", qv.pithy == NULL);

    /* Populated view */
    qv.coord_id = M5_COORD_ID(FAMILY_M, 0, 0);
    qv.register_count = 1;
    qv.pithy = "Anuttara: bare-metal VM of six nested micro-algebras";
    TEST("qv has pithy", qv.pithy != NULL);
    TEST("qv register_count", qv.register_count == 1);

    /* Granularity hook */
    M5_Granularity_Hook gh = {0};
    gh.s0_pithy = "M0: void arithmetic";
    TEST("gh s0 present", gh.s0_pithy != NULL);
    TEST("gh s1 null", gh.s1_obsidian_path == NULL);
    TEST("gh s2 null", gh.s2_neo4j_query == NULL);
}
```

Add `test_quintessential_view();` to `main()`.

**Step 2: Run tests — expect FAIL (types not defined)**

```bash
clang ... src/test_m5.c -o test_m5
```

Expected: compilation error — `M5_Quintessential_View` undeclared.

**Step 3: Add QV types to m5.h**

After the Logos FSM section, before `#endif`:

```c
/* ===================================================================
 * II. QUINTESSENTIAL VIEW — Per-coordinate self-description
 *
 * The master self-API. Every coordinate can have a pithy summary
 * (always in C memory) plus hooks to deeper granularity layers.
 * Registers[0-5] match L0-L5 lens modes for multi-framing.
 * =================================================================== */

/* Pack a coordinate ID: family(3 bits) + position(3 bits) + branch(3 bits) + flags(7 bits) */
#define M5_COORD_ID(fam, pos, branch) \
    ((uint16_t)( ((fam) & 0x7) << 13 | ((pos) & 0x7) << 10 | ((branch) & 0x7) << 7 ))

#define M5_COORD_FAMILY(id)   (((id) >> 13) & 0x7)
#define M5_COORD_POSITION(id) (((id) >> 10) & 0x7)
#define M5_COORD_BRANCH(id)   (((id) >> 7) & 0x7)

typedef struct {
    uint16_t    coord_id;           /* Packed coordinate address                */
    uint8_t     register_count;     /* How many registers populated (1-6)      */
    uint8_t     refinement_cycle;   /* Mobius cycles that have refined this     */
    const char* pithy;              /* One-liner, <=128 chars, always present   */
    const char* registers[6];       /* Multi-framing: terse -> verbose (L0-L5) */
} M5_Quintessential_View;

/* S0'/S1'/S2' compression trika — three granularity levels */
typedef struct {
    const char* s0_pithy;           /* Always present — C-level summary        */
    const char* s1_obsidian_path;   /* Path to .md file (NULL if unwritten)    */
    const char* s2_neo4j_query;     /* Cypher template (NULL if unmapped)      */
} M5_Granularity_Hook;

/* Granularity levels for m5_lookup() */
#define M5_GRAN_PITHY    0   /* S0' — terse, always available   */
#define M5_GRAN_OBSIDIAN 1   /* S1' — markdown path             */
#define M5_GRAN_NEO4J    2   /* S2' — graph query template      */
```

**Step 4: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add include/m5.h src/test_m5.c
git commit -m "feat(m5): quintessential view system + S0'/S1'/S2' granularity hooks"
```

---

### Task 3: Sub-Branch Structs (#5-0 through #5-5)

**Files:**
- Modify: `include/m5.h`
- Modify: `src/test_m5.c`

**Step 1: Write sub-branch struct tests**

```c
/* ===================================================================
 * SUB-BRANCH STRUCTS
 * =================================================================== */

static void test_sub_branch_structs(void) {
    /* #5-0: Identity — M+M' */
    M5_Identity id = {0};
    TEST("identity m_roots null", id.m_roots[0] == NULL);
    TEST("identity 6 m_views", sizeof(id.m_views) == 6 * sizeof(M5_Quintessential_View));

    /* #5-1: Theory — L+P+L'+P' */
    M5_Theory th = {0};
    TEST("theory session_depth zero", th.session_depth == 0);
    TEST("theory 36 hooks", sizeof(th.hooks) == 36 * sizeof(M5_Granularity_Hook));

    /* #5-2: Stack — S+S' */
    M5_Stack st = {0};
    TEST("stack 6 s_views", sizeof(st.s_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("stack 6 s_prime", sizeof(st.s_prime) == 6 * sizeof(M5_Quintessential_View));

    /* #5-3: UI — M' */
    M5_UI ui = {0};
    TEST("ui webmcp_hook null", ui.webmcp_hook == NULL);

    /* #5-4: Agents — Anima+Aletheia */
    M5_Agents ag = {0};
    TEST("agents anima_count zero", ag.anima_count == 0);
    TEST("agents aletheia_count zero", ag.aletheia_count == 0);
    TEST("agents anima_roster null", ag.anima_roster == NULL);

    /* #5-5: Logos — T+C+T'+C' */
    M5_Logos lg = {0};
    TEST("logos tick zero", lg.pipeline_tick == 0);
    TEST("logos 6 archetype_charge", sizeof(lg.archetype_charge) == 6 * sizeof(uint64_t));
    TEST("logos 6 inverse_charge", sizeof(lg.inverse_charge) == 6 * sizeof(uint64_t));
    TEST("logos 6 frame_charge", sizeof(lg.frame_charge) == 6 * sizeof(uint64_t));

    /* Agent entry */
    M5_Agent_Entry ae = {0};
    TEST("agent entry name null", ae.name == NULL);
    TEST("agent entry size", sizeof(ae) <= 16);
}
```

Add `test_sub_branch_structs();` to `main()`.

**Step 2: Run tests — expect FAIL**

Expected: compilation error — sub-branch types undeclared.

**Step 3: Add sub-branch structs to m5.h**

After the QV section, before `#endif`:

```c
/* ===================================================================
 * III. AGENT ENTRY — Dynamic roster element for Anima/Aletheia
 * =================================================================== */

typedef struct {
    const char* name;
    uint8_t     id;
    uint8_t     capability_flags;
    uint8_t     tool_flags;
    uint8_t     active;              /* 1 = in roster, 0 = disabled */
} M5_Agent_Entry;

/* Agent capability flags */
#define M5_AGENT_CAP_NEO4J       (1u << 0)
#define M5_AGENT_CAP_VECTOR      (1u << 1)
#define M5_AGENT_CAP_SYMBOLIC    (1u << 2)
#define M5_AGENT_CAP_NARRATIVE   (1u << 3)
#define M5_AGENT_CAP_PERSONAL    (1u << 4)
#define M5_AGENT_CAP_MOBIUS      (1u << 5)

/* Agent tool flags */
#define M5_AGENT_TOOL_MCP_BIMBA  (1u << 0)
#define M5_AGENT_TOOL_MCP_NOTION (1u << 1)
#define M5_AGENT_TOOL_OBSIDIAN   (1u << 2)
#define M5_AGENT_TOOL_TENSOR     (1u << 3)
#define M5_AGENT_TOOL_CLOCK      (1u << 4)


/* ===================================================================
 * IV. SUB-BRANCH STRUCTS — One per coordinate family home
 * =================================================================== */

/* #5-0: M+M' — Integral Identity */
typedef struct {
    void*                   m_roots[6];     /* -> M0-M5 root ptrs        */
    M5_Quintessential_View  m_views[6];     /* M0-M5 self-descriptions   */
    M5_Quintessential_View  m_prime[6];     /* M0'-M5' inverted          */
} M5_Identity;

/* #5-1: L+P+L'+P' — Theory Topology */
typedef struct {
    M5_Quintessential_View  l_views[6];     /* L0-L5 lens modes          */
    M5_Quintessential_View  l_prime[6];     /* L0'-L5' inverted          */
    M5_Quintessential_View  p_views[6];     /* P0-P5 positions           */
    M5_Quintessential_View  p_prime[6];     /* P0'-P5' inverted          */
    M5_Granularity_Hook     hooks[36];      /* 6L x 6P coordinate space  */
    uint32_t                session_depth;  /* Sessions that enriched    */
    uint64_t                enrichment_charge;
} M5_Theory;

/* #5-2: S+S' — Full Stack */
typedef struct {
    M5_Quintessential_View  s_views[6];     /* S0-S5 objective           */
    M5_Quintessential_View  s_prime[6];     /* S0'-S5' project-specific  */
} M5_Stack;

/* #5-3: M' UI — Electron/WebMCP */
typedef struct {
    M5_Quintessential_View  m_prime_ui[6];  /* M0'-M5' UI face           */
    void (*webmcp_hook)(uint8_t branch, const void* msg, void* response);
} M5_UI;

/* #5-4: S4-4'/S4-5' — Anima + Aletheia Agent Rosters */
typedef struct {
    M5_Agent_Entry* anima_roster;           /* Dynamic: VAK agents       */
    uint8_t         anima_count;
    uint8_t         anima_capacity;
    M5_Agent_Entry* aletheia_roster;        /* Dynamic: knowledge agents */
    uint8_t         aletheia_count;
    uint8_t         aletheia_capacity;
} M5_Agents;

/* #5-5: T+C+T'+C' — Logos Cycle / Cadence of Immanence */
typedef struct {
    uint8_t                 pipeline_tick;       /* 0-11: THE ENTIRE FSM  */
    M5_Quintessential_View  t_views[6];          /* T0-T5 thought types   */
    M5_Quintessential_View  t_prime[6];          /* T0'-T5'               */
    M5_Quintessential_View  c_views[6];          /* C0-C5 categories      */
    M5_Quintessential_View  c_prime[6];          /* C0'-C5'               */
    uint64_t                archetype_charge[6]; /* Per #0-#5             */
    uint64_t                inverse_charge[6];   /* Per #0'-#5'           */
    uint64_t                frame_charge[6];     /* Per context frame     */
    void (*mobius_write_back)(void* m0_ground, uint64_t charge);
} M5_Logos;
```

**Step 4: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add include/m5.h src/test_m5.c
git commit -m "feat(m5): sub-branch structs — Identity, Theory, Stack, UI, Agents, Logos"
```

---

### Task 4: M5_Root + Etymology/Paradox/Scent Sub-FSMs

**Files:**
- Modify: `include/m5.h`
- Modify: `src/test_m5.c`

**Step 1: Write M5_Root and sub-FSM tests**

```c
/* ===================================================================
 * M5_ROOT + SUB-FSMs
 * =================================================================== */

static void test_m5_root_struct(void) {
    /* M5_Root first field is hc */
    TEST("hc is first field", offsetof(M5_Root, hc) == 0);

    /* Etymology FSM */
    M5_Etymology_FSM etym = {0};
    TEST("etym stage zero", etym.stage == ETYM_STAGE_PIE_ROOT);
    TEST("etym not ready", !etym.write_back_ready);
    m5_etymology_advance(&etym);
    TEST("etym advanced to cognate", etym.stage == ETYM_STAGE_COGNATE_MAP);
    TEST("etym still not ready", !etym.write_back_ready);
    /* Advance to write-back */
    for (int i = 0; i < 4; i++) m5_etymology_advance(&etym);
    TEST("etym at writeback", etym.stage == ETYM_STAGE_MOBIUS_WRITEBACK);
    TEST("etym ready", etym.write_back_ready);
    /* Cannot advance past writeback */
    m5_etymology_advance(&etym);
    TEST("etym stays at writeback", etym.stage == ETYM_STAGE_MOBIUS_WRITEBACK);

    /* Paradox holding */
    M5_Paradox_Hold ph = {0};
    TEST("paradox not holding", !ph.holding);
    m5_hold_paradox(&ph, 0xAA, 0x55, 3);
    TEST("paradox holding", ph.holding);
    TEST("paradox not resolved", !ph.resolved);
    TEST("paradox thesis", ph.thesis_mask == 0xAA);
    TEST("paradox antithesis", ph.antithesis_mask == 0x55);
    uint64_t synth = m5_resolve_paradox(&ph);
    TEST("paradox synthesis XOR", synth == (0xAA ^ 0x55));
    TEST("paradox resolved", ph.resolved);
    TEST("paradox no longer holding", !ph.holding);

    /* Scent state */
    M5_Scent_State sc = {0};
    TEST("scent zero vector", sc.scent_vector == 0);
    TEST("scent zero confidence", sc.confidence == 0);
}
```

Add `test_m5_root_struct();` to `main()`.

**Step 2: Run tests — expect FAIL**

Expected: `M5_Root`, `M5_Etymology_FSM`, etc. undeclared.

**Step 3: Add M5_Root and sub-FSM types to m5.h**

After sub-branch structs, before `#endif`:

```c
/* ===================================================================
 * V. ETYMOLOGY ARCHAEOLOGY FSM (within ANALOGOS stage)
 * =================================================================== */

typedef enum {
    ETYM_STAGE_PIE_ROOT        = 0,
    ETYM_STAGE_COGNATE_MAP     = 1,
    ETYM_STAGE_SEMANTIC_DRIFT  = 2,
    ETYM_STAGE_PSYCHOID_CHARGE = 3,
    ETYM_STAGE_PROS_HEN        = 4,
    ETYM_STAGE_MOBIUS_WRITEBACK = 5
} M5_Etymology_Stage;

typedef struct {
    M5_Etymology_Stage stage;
    uint8_t            position;
    uint64_t           semantic_charge;
    bool               write_back_ready;
} M5_Etymology_FSM;

static inline void m5_etymology_advance(M5_Etymology_FSM* fsm) {
    if (fsm->stage < ETYM_STAGE_MOBIUS_WRITEBACK) {
        fsm->stage = (M5_Etymology_Stage)(fsm->stage + 1);
    }
    fsm->write_back_ready = (fsm->stage == ETYM_STAGE_MOBIUS_WRITEBACK);
}


/* ===================================================================
 * VI. PARADOX-HOLDING + SCENT-FOLLOWING
 * =================================================================== */

typedef struct {
    uint64_t scent_vector;
    uint8_t  confidence;
    uint8_t  following_since;
    uint8_t  m_branch_of_origin;
    uint8_t  _pad;
} M5_Scent_State;

typedef struct {
    uint64_t thesis_mask;
    uint64_t antithesis_mask;
    uint8_t  hold_since_tick;
    uint8_t  resolution_stage;
    bool     holding;
    bool     resolved;
} M5_Paradox_Hold;

static inline void m5_hold_paradox(M5_Paradox_Hold* ph, uint64_t thesis,
                                    uint64_t antithesis, uint8_t current_tick) {
    ph->thesis_mask     = thesis;
    ph->antithesis_mask = antithesis;
    ph->hold_since_tick = current_tick;
    ph->resolution_stage = ANALOGOS;
    ph->holding         = true;
    ph->resolved        = false;
}

static inline uint64_t m5_resolve_paradox(M5_Paradox_Hold* ph) {
    if (!ph->holding) return 0;
    uint64_t synthesis = ph->thesis_mask ^ ph->antithesis_mask;
    ph->resolved = (synthesis != 0);
    ph->holding  = !ph->resolved;
    return synthesis;
}


/* ===================================================================
 * VII. M5_ROOT — The Holographic Container
 * =================================================================== */

typedef struct {
    Holographic_Coordinate* hc;              /* FIRST FIELD — Psychoid_5  */
    const Holographic_Coordinate* active_cf; /* -> CF_TABLE[CF_MOBIUS]    */

    M5_Identity   identity;  /* #5-0: M+M'                               */
    M5_Theory     theory;    /* #5-1: L+P+L'+P'                           */
    M5_Stack      stack;     /* #5-2: S+S'                                */
    M5_UI         ui;        /* #5-3: M' UI                               */
    M5_Agents     agents;    /* #5-4: S4-4'/S4-5'                         */
    M5_Logos      logos;     /* #5-5: T+C+T'+C'                           */

    M5_Etymology_FSM etymology;
    M5_Paradox_Hold  paradox;
    M5_Scent_State   scent;
} M5_Root;
```

**Step 4: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add include/m5.h src/test_m5.c
git commit -m "feat(m5): M5_Root + etymology FSM + paradox-holding + scent-following"
```

---

### Task 5: Public API Declarations + m5_init / m5_teardown

**Files:**
- Modify: `include/m5.h`
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write init/teardown tests**

```c
/* ===================================================================
 * M5_INIT / M5_TEARDOWN
 * =================================================================== */

static Coordinate_Arena test_arena;
static Holographic_Coordinate* test_mirrors[6];

static void setup_test_arena(void) {
    arena_init(&test_arena, 64);
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    for (int i = 0; i < 6; i++) {
        test_mirrors[i] = arena_alloc(&test_arena);
        test_mirrors[i]->ql_position = raw[i]->ql_position;
        test_mirrors[i]->family = FAMILY_NONE;
        test_mirrors[i]->weave_state = raw[i]->weave_state;
        test_mirrors[i]->invoke_process = raw[i]->invoke_process;
        test_mirrors[i]->c = (i == 0) ? test_mirrors[0] : test_mirrors[i - 1];
    }
    test_mirrors[5]->c = test_mirrors[0];
    test_mirrors[4]->cf = test_mirrors[4];
    test_mirrors[3]->cf = test_mirrors[4];
    families_init(&test_arena, test_mirrors);
    families_crosslink(&test_arena);
    families_wire_reflective(&test_arena);
}

static void teardown_test_arena(void) {
    arena_destroy(&test_arena);
}

static void test_m5_init_teardown(void) {
    setup_test_arena();

    /* Must be #5 */
    M5_Root* bad = m5_init(&test_arena, test_mirrors[0]);
    TEST("m5_init rejects non-#5", bad == NULL);

    /* Good init */
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);
    TEST("m5_init succeeds", m5 != NULL);
    TEST("m5 hc bound", m5->hc == test_mirrors[5]);
    TEST("m5 hc payload bound", test_mirrors[5]->payload.process_state == m5);
    TEST("m5 active_cf is CF_MOBIUS", m5->active_cf == cf_get(CF_MOBIUS));
    TEST("m5 logos tick zero", m5->logos.pipeline_tick == 0);
    TEST("m5 etymology at PIE_ROOT", m5->etymology.stage == ETYM_STAGE_PIE_ROOT);
    TEST("m5 paradox not holding", !m5->paradox.holding);

    /* Identity mirrors should have m_roots wired */
    /* (m5_init wires these if M0-M4 roots are available via HC payload) */

    m5_teardown(m5);
    TEST("m5 teardown clears payload", test_mirrors[5]->payload.process_state == NULL);

    teardown_test_arena();
}
```

Add `test_m5_init_teardown();` to `main()`.

**Step 2: Add API declarations to m5.h**

After `M5_Root`, before `#endif`:

```c
/* ===================================================================
 * VIII. PUBLIC API
 * =================================================================== */

/* Allocate and HC-link M5 root, wire all sub-branches */
M5_Root* m5_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Advance the Logos FSM by one tick, return computed state */
Unified_Logos_State m5_advance_logos(M5_Root* root);

/* Execute Mobius write-back (Sacred Violation — tick 11 only).
 * Returns 0 on success, -1 if not at tick 11. */
int m5_execute_mobius_return(M5_Root* root, void* m0_ground);

/* Master self-API: lookup any coordinate's quintessential view.
 * granularity: M5_GRAN_PITHY / M5_GRAN_OBSIDIAN / M5_GRAN_NEO4J */
const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity);

/* Release heap state (not the HC itself — arena owns that) */
void m5_teardown(M5_Root* root);

/* CLI entry point: ./epi-logos m5 <command> [args...] */
int m5_cli_dispatch(int argc, char** argv, M5_Root* root);

/* Boot-time verification */
bool m5_verify(void);
```

**Step 3: Implement m5_init and m5_teardown in m5.c**

```c
/* ===================================================================
 * API: m5_init — Allocate and HC-link M5_Root
 * =================================================================== */

M5_Root* m5_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    if (!arena || !hc) return NULL;
    if (hc->ql_position != 5) return NULL;  /* Must be #5 */

    M5_Root* root = calloc(1, sizeof(M5_Root));
    if (!root) return NULL;

    HC_LINK(hc, root);
    root->active_cf = cf_get(CF_MOBIUS);

    /* Wire identity mirrors from sibling HC payloads.
     * Navigate via the arena: mirrors[0..5] are at known positions. */
    for (int i = 0; i < 6; i++) {
        /* Try to find M-branch roots via HC chain */
        root->identity.m_roots[i] = NULL;  /* Populated when cross-M links wired */
    }

    /* Initialize logos FSM to tick 0 */
    root->logos.pipeline_tick = 0;
    memset(root->logos.archetype_charge, 0, sizeof(root->logos.archetype_charge));
    memset(root->logos.inverse_charge, 0, sizeof(root->logos.inverse_charge));
    memset(root->logos.frame_charge, 0, sizeof(root->logos.frame_charge));

    /* Agent rosters start empty */
    root->agents.anima_roster = NULL;
    root->agents.anima_count = 0;
    root->agents.anima_capacity = 0;
    root->agents.aletheia_roster = NULL;
    root->agents.aletheia_count = 0;
    root->agents.aletheia_capacity = 0;

    return root;
}


/* ===================================================================
 * API: m5_teardown — Release M5_Root heap state
 * =================================================================== */

void m5_teardown(M5_Root* root) {
    if (!root) return;

    /* Free dynamic agent rosters */
    free(root->agents.anima_roster);
    free(root->agents.aletheia_roster);

    /* Unlink HC */
    if (root->hc) {
        HC_UNLINK(root->hc);
    }

    free(root);
}
```

**Step 4: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add include/m5.h src/m5.c src/test_m5.c
git commit -m "feat(m5): m5_init + m5_teardown + public API declarations"
```

---

### Task 6: m5_advance_logos + Logos Guard LUT

**Files:**
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write advance_logos tests**

```c
static void test_m5_advance_logos(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* Initial state */
    TEST("initial tick 0", m5->logos.pipeline_tick == 0);

    /* Advance through full 12-tick cycle */
    for (uint8_t t = 0; t < 12; t++) {
        Unified_Logos_State s = m5_advance_logos(m5);
        TEST("advance tick correct", s.pipeline_tick == t);
        if (t < 6) {
            TEST("ascending", !s.is_implicate);
        } else {
            TEST("descending", s.is_implicate);
        }
    }

    /* After 12 advances, tick wraps to 0 */
    TEST("tick wraps to 0", m5->logos.pipeline_tick == 0);

    /* Verify archetype_charge accumulates */
    m5->logos.archetype_charge[0] = 100;
    Unified_Logos_State s0 = m5_advance_logos(m5);
    TEST("charge persists", m5->logos.archetype_charge[0] == 100);
    (void)s0;

    m5_teardown(m5);
    teardown_test_arena();
}
```

Add `test_m5_advance_logos();` to `main()`.

**Step 2: Implement m5_advance_logos in m5.c**

```c
/* ===================================================================
 * .RODATA: LOGOS STAGE NAMES
 * =================================================================== */

static const char* const M5_LOGOS_STAGE_NAMES[6] = {
    "A-logos",   "Pro-logos", "Dia-logos",
    "Logos",     "Epi-logos", "An-a-logos"
};


/* ===================================================================
 * API: m5_advance_logos — Advance Logos FSM by one tick
 * =================================================================== */

Unified_Logos_State m5_advance_logos(M5_Root* root) {
    uint8_t tick = root->logos.pipeline_tick;
    Unified_Logos_State state = compute_logos_state(tick);

    /* Advance tick (wraps at 12) */
    root->logos.pipeline_tick = (uint8_t)((tick + 1) % 12);

    return state;
}
```

**Step 3: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add src/m5.c src/test_m5.c
git commit -m "feat(m5): m5_advance_logos — 12-tick Logos FSM with wrap"
```

---

### Task 7: m5_execute_mobius_return (The Sacred Violation)

**Files:**
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write Mobius tests**

```c
static void test_m5_mobius_return(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* A fake "M0 ground" — just a uint64_t we can XOR-check */
    uint64_t fake_ground = 0x1234;

    /* Cannot execute at tick 0 */
    int rc = m5_execute_mobius_return(m5, &fake_ground);
    TEST("mobius rejected at tick 0", rc == -1);
    TEST("ground unchanged", fake_ground == 0x1234);

    /* Advance to tick 11 (descending ALOGOS) */
    for (int i = 0; i < 11; i++) m5_advance_logos(m5);
    TEST("at tick 11", m5->logos.pipeline_tick == 11);

    /* Deposit some charge */
    m5->logos.archetype_charge[5] = 0xFF00;

    /* Execute Sacred Violation */
    rc = m5_execute_mobius_return(m5, &fake_ground);
    TEST("mobius accepted at tick 11", rc == 0);
    TEST("ground XOR'd", fake_ground == (0x1234 ^ 0xFF00));

    /* Tick resets to 0 after Mobius */
    TEST("tick reset to 0", m5->logos.pipeline_tick == 0);

    m5_teardown(m5);
    teardown_test_arena();
}
```

Add `test_m5_mobius_return();` to `main()`.

**Step 2: Implement in m5.c**

```c
/* ===================================================================
 * API: m5_execute_mobius_return — The Sacred Violation
 *
 * Casts away const on M0 ground state at tick 11 ONLY.
 * This is philosophically mandated (Spanda) and FSM-guarded.
 * m0_ground points to the uint64_t field to XOR-enrich.
 * =================================================================== */

int m5_execute_mobius_return(M5_Root* root, void* m0_ground) {
    if (!root || !m0_ground) return -1;

    /* Sacred Violation is ONLY authorized at tick 11 (descending ALOGOS) */
    if (root->logos.pipeline_tick != 11) return -1;

    /* The Sacred Violation: XOR-enrich the ground with accumulated charge.
     * archetype_charge[5] = synthesis position charge. */
    uint64_t* ground = (uint64_t*)m0_ground;
    *ground ^= root->logos.archetype_charge[5];

    /* Reset for next cycle */
    root->logos.pipeline_tick = 0;

    return 0;
}
```

**Step 3: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add src/m5.c src/test_m5.c
git commit -m "feat(m5): execute_mobius_return — Sacred Violation at tick 11"
```

---

### Task 8: m5_lookup (Quintessential View Self-API)

**Files:**
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write lookup tests**

```c
static void test_m5_lookup(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* Set a pithy view on M0 identity */
    m5->identity.m_views[0].coord_id = M5_COORD_ID(FAMILY_M, 0, 0);
    m5->identity.m_views[0].pithy = "Anuttara: bare-metal VM";
    m5->identity.m_views[0].register_count = 1;

    /* Lookup by coord_id at S0' granularity */
    uint16_t cid = M5_COORD_ID(FAMILY_M, 0, 0);
    const char* result = m5_lookup(m5, cid, M5_GRAN_PITHY);
    TEST("lookup M0 pithy", result != NULL);
    TEST("lookup M0 content", strcmp(result, "Anuttara: bare-metal VM") == 0);

    /* Lookup nonexistent coord */
    uint16_t bad_cid = M5_COORD_ID(FAMILY_P, 3, 7);
    const char* bad = m5_lookup(m5, bad_cid, M5_GRAN_PITHY);
    TEST("lookup unknown returns NULL", bad == NULL);

    /* Set a theory L-view */
    m5->theory.l_views[2].coord_id = M5_COORD_ID(FAMILY_L, 2, 1);
    m5->theory.l_views[2].pithy = "Structural lens";
    uint16_t lcid = M5_COORD_ID(FAMILY_L, 2, 1);
    const char* lresult = m5_lookup(m5, lcid, M5_GRAN_PITHY);
    TEST("lookup L2 pithy", lresult != NULL);

    m5_teardown(m5);
    teardown_test_arena();
}
```

Add `test_m5_lookup();` to `main()`.

**Step 2: Implement m5_lookup in m5.c**

```c
/* ===================================================================
 * API: m5_lookup — Quintessential View Self-API
 *
 * Master self-knowledge call. Any coordinate, any granularity.
 * Searches sub-branches by family to find matching coord_id.
 * =================================================================== */

/* Internal: search an array of QVs for a matching coord_id */
static const M5_Quintessential_View* qv_find(const M5_Quintessential_View* arr,
                                               size_t count, uint16_t coord_id) {
    for (size_t i = 0; i < count; i++) {
        if (arr[i].coord_id == coord_id && arr[i].pithy != NULL) {
            return &arr[i];
        }
    }
    return NULL;
}

const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity) {
    if (!root) return NULL;

    const M5_Quintessential_View* qv = NULL;
    uint8_t fam = M5_COORD_FAMILY(coord_id);

    /* Route by family to the appropriate sub-branch */
    switch (fam) {
        case FAMILY_M:
            qv = qv_find(root->identity.m_views, 6, coord_id);
            if (!qv) qv = qv_find(root->identity.m_prime, 6, coord_id);
            break;
        case FAMILY_L:
            qv = qv_find(root->theory.l_views, 6, coord_id);
            if (!qv) qv = qv_find(root->theory.l_prime, 6, coord_id);
            break;
        case FAMILY_P:
            qv = qv_find(root->theory.p_views, 6, coord_id);
            if (!qv) qv = qv_find(root->theory.p_prime, 6, coord_id);
            break;
        case FAMILY_S:
            qv = qv_find(root->stack.s_views, 6, coord_id);
            if (!qv) qv = qv_find(root->stack.s_prime, 6, coord_id);
            break;
        case FAMILY_T:
            qv = qv_find(root->logos.t_views, 6, coord_id);
            if (!qv) qv = qv_find(root->logos.t_prime, 6, coord_id);
            break;
        case FAMILY_C:
            qv = qv_find(root->logos.c_views, 6, coord_id);
            if (!qv) qv = qv_find(root->logos.c_prime, 6, coord_id);
            break;
        default:
            return NULL;
    }

    if (!qv) return NULL;

    switch (granularity) {
        case M5_GRAN_PITHY:    return qv->pithy;
        case M5_GRAN_OBSIDIAN: return (qv->register_count > 1) ? qv->registers[1] : NULL;
        case M5_GRAN_NEO4J:    return (qv->register_count > 2) ? qv->registers[2] : NULL;
        default:               return qv->pithy;
    }
}
```

**Step 3: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add src/m5.c src/test_m5.c
git commit -m "feat(m5): m5_lookup — quintessential view self-API with family routing"
```

---

### Task 9: m5_verify + .rodata Logos Stage Names

**Files:**
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write verify tests**

```c
static void test_m5_verify(void) {
    TEST("m5_verify passes", m5_verify());

    /* Stage name LUT */
    TEST("stage name ALOGOS", strcmp(M5_LOGOS_STAGE_NAMES[ALOGOS], "A-logos") == 0);
    TEST("stage name ANALOGOS", strcmp(M5_LOGOS_STAGE_NAMES[ANALOGOS], "An-a-logos") == 0);
}
```

Add `test_m5_verify();` to `main()`. Also need to make `M5_LOGOS_STAGE_NAMES` extern.

**Step 2: Implement m5_verify in m5.c**

```c
/* ===================================================================
 * API: m5_verify — Boot-time .rodata verification
 * =================================================================== */

bool m5_verify(void) {
    /* Psychoid_5 Mobius return */
    if (GET_PTR(Psychoid_5.c) != &Psychoid_0) return false;

    /* CF_MOBIUS anchored to #4 */
    const Holographic_Coordinate* cf_mob = cf_get(CF_MOBIUS);
    if (!cf_mob) return false;
    if (GET_PTR(cf_mob->cf) != &Psychoid_4) return false;

    /* Logos stage names count */
    if (M5_LOGOS_STAGE_NAMES[0] == NULL) return false;
    if (M5_LOGOS_STAGE_NAMES[5] == NULL) return false;

    return true;
}
```

Move `M5_LOGOS_STAGE_NAMES` to be `extern` in m5.h and defined in m5.c:

In m5.h, add:
```c
extern const char* const M5_LOGOS_STAGE_NAMES[6];
```

**Step 3: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add include/m5.h src/m5.c src/test_m5.c
git commit -m "feat(m5): m5_verify + extern Logos stage names LUT"
```

---

### Task 10: m5_cli_dispatch

**Files:**
- Modify: `src/m5.c`
- Modify: `src/test_m5.c`

**Step 1: Write CLI dispatch tests**

```c
static void test_m5_cli_dispatch(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* "info" command */
    char* argv_info[] = {"m5", "info"};
    int rc = m5_cli_dispatch(2, argv_info, m5);
    TEST("cli info returns 0", rc == 0);

    /* "logos" command — show tick */
    char* argv_logos[] = {"m5", "logos", "tick"};
    rc = m5_cli_dispatch(3, argv_logos, m5);
    TEST("cli logos tick returns 0", rc == 0);

    /* "logos advance" */
    char* argv_adv[] = {"m5", "logos", "advance"};
    rc = m5_cli_dispatch(3, argv_adv, m5);
    TEST("cli logos advance returns 0", rc == 0);
    TEST("cli advanced tick", m5->logos.pipeline_tick == 1);

    /* Unknown command */
    char* argv_bad[] = {"m5", "unknown"};
    rc = m5_cli_dispatch(2, argv_bad, m5);
    TEST("cli unknown returns -1", rc == -1);

    /* No args */
    char* argv_none[] = {"m5"};
    rc = m5_cli_dispatch(1, argv_none, m5);
    TEST("cli no args returns 0 (prints help)", rc == 0);

    m5_teardown(m5);
    teardown_test_arena();
}
```

Add `test_m5_cli_dispatch();` to `main()`.

**Step 2: Implement m5_cli_dispatch in m5.c**

```c
/* ===================================================================
 * API: m5_cli_dispatch — CLI entry point
 *
 * Commands:
 *   info              — Print HC anchoring + sub-branch status
 *   lookup <fam> <pos>— Quintessential view (pithy)
 *   logos tick         — Show current Logos FSM state
 *   logos advance      — Advance one tick
 *   agents list        — List Anima + Aletheia rosters
 *   stack              — Show S + S' status
 *   theory             — Show L+P topology summary
 * =================================================================== */

int m5_cli_dispatch(int argc, char** argv, M5_Root* root) {
    if (!root) return -1;

    if (argc < 2) {
        printf("M5 (Epii) — Holographic Integration Layer\n");
        printf("  info              — HC anchoring + status\n");
        printf("  lookup <fam> <pos>— Quintessential view\n");
        printf("  logos tick        — Current FSM state\n");
        printf("  logos advance     — Advance one tick\n");
        printf("  agents list       — Agent rosters\n");
        printf("  stack             — S + S' status\n");
        printf("  theory            — L+P topology\n");
        return 0;
    }

    if (strcmp(argv[1], "info") == 0) {
        printf("[M5] Epii — Holographic Integration Layer\n");
        printf("  HC position: %u, family: %u\n",
               root->hc->ql_position, root->hc->family);
        printf("  CF: MOBIUS (5/0)\n");
        printf("  Logos tick: %u/11\n", root->logos.pipeline_tick);
        printf("  Theory sessions: %u\n", root->theory.session_depth);
        printf("  Anima agents: %u, Aletheia agents: %u\n",
               root->agents.anima_count, root->agents.aletheia_count);
        return 0;
    }

    if (strcmp(argv[1], "logos") == 0) {
        if (argc < 3) {
            printf("[M5] logos: specify 'tick' or 'advance'\n");
            return -1;
        }
        if (strcmp(argv[2], "tick") == 0) {
            Unified_Logos_State s = compute_logos_state(root->logos.pipeline_tick);
            printf("[M5] Logos tick %u: %s (%s)\n",
                   s.pipeline_tick,
                   M5_LOGOS_STAGE_NAMES[s.current_stage],
                   s.is_implicate ? "descending" : "ascending");
            return 0;
        }
        if (strcmp(argv[2], "advance") == 0) {
            Unified_Logos_State s = m5_advance_logos(root);
            printf("[M5] Advanced to tick %u: %s (%s)\n",
                   root->logos.pipeline_tick,
                   M5_LOGOS_STAGE_NAMES[s.current_stage],
                   s.is_implicate ? "descending" : "ascending");
            return 0;
        }
        printf("[M5] Unknown logos command: %s\n", argv[2]);
        return -1;
    }

    if (strcmp(argv[1], "agents") == 0) {
        if (argc >= 3 && strcmp(argv[2], "list") == 0) {
            printf("[M5] Anima roster (%u agents):\n", root->agents.anima_count);
            for (uint8_t i = 0; i < root->agents.anima_count; i++) {
                printf("  [%u] %s (cap=0x%02x, tools=0x%02x, %s)\n",
                       root->agents.anima_roster[i].id,
                       root->agents.anima_roster[i].name,
                       root->agents.anima_roster[i].capability_flags,
                       root->agents.anima_roster[i].tool_flags,
                       root->agents.anima_roster[i].active ? "active" : "disabled");
            }
            printf("[M5] Aletheia roster (%u agents):\n", root->agents.aletheia_count);
            for (uint8_t i = 0; i < root->agents.aletheia_count; i++) {
                printf("  [%u] %s (cap=0x%02x, tools=0x%02x, %s)\n",
                       root->agents.aletheia_roster[i].id,
                       root->agents.aletheia_roster[i].name,
                       root->agents.aletheia_roster[i].capability_flags,
                       root->agents.aletheia_roster[i].tool_flags,
                       root->agents.aletheia_roster[i].active ? "active" : "disabled");
            }
            return 0;
        }
        printf("[M5] agents: specify 'list'\n");
        return -1;
    }

    if (strcmp(argv[1], "stack") == 0) {
        printf("[M5] Stack (S + S'):\n");
        for (int i = 0; i < 6; i++) {
            printf("  S%d: %s\n", i,
                   root->stack.s_views[i].pithy ? root->stack.s_views[i].pithy : "(empty)");
            printf("  S%d': %s\n", i,
                   root->stack.s_prime[i].pithy ? root->stack.s_prime[i].pithy : "(empty)");
        }
        return 0;
    }

    if (strcmp(argv[1], "theory") == 0) {
        printf("[M5] Theory Topology (L+P+L'+P'):\n");
        printf("  Session depth: %u\n", root->theory.session_depth);
        for (int i = 0; i < 6; i++) {
            printf("  L%d: %s\n", i,
                   root->theory.l_views[i].pithy ? root->theory.l_views[i].pithy : "(empty)");
        }
        for (int i = 0; i < 6; i++) {
            printf("  P%d: %s\n", i,
                   root->theory.p_views[i].pithy ? root->theory.p_views[i].pithy : "(empty)");
        }
        return 0;
    }

    if (strcmp(argv[1], "lookup") == 0) {
        if (argc < 4) {
            printf("[M5] lookup: specify <family_num> <position>\n");
            return -1;
        }
        uint8_t fam = (uint8_t)atoi(argv[2]);
        uint8_t pos = (uint8_t)atoi(argv[3]);
        uint16_t cid = M5_COORD_ID(fam, pos, 0);
        const char* view = m5_lookup(root, cid, M5_GRAN_PITHY);
        if (view) {
            printf("[M5] %s\n", view);
        } else {
            printf("[M5] No quintessential view for family=%u pos=%u\n", fam, pos);
        }
        return 0;
    }

    printf("[M5] Unknown command: %s\n", argv[1]);
    return -1;
}
```

**Step 3: Build and run**

```bash
clang ... src/test_m5.c -o test_m5 && ./test_m5
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add src/m5.c src/test_m5.c
git commit -m "feat(m5): m5_cli_dispatch — info, logos, agents, stack, theory, lookup"
```

---

### Task 11: main.c Integration

**Files:**
- Modify: `src/main.c`

**Step 1: Add M5 to boot sequence in main.c**

After the M4 section (`Phase 4.9`), add:

```c
    /* Phase 5.0: Initialize M5 (Epii) */
    M5_Root* m5 = m5_init(&arena, mirrors[5]);
    if (!m5) {
        fprintf(stderr, "[boot] Aborting: M5 init failed.\n");
        m4_teardown(m4); m3_teardown(m3); m2_teardown(m2); m1_teardown(m1); m0_teardown(m0);
        arena_destroy(&arena);
        return 1;
    }
    if (!m5_verify()) {
        fprintf(stderr, "[boot] FAIL: M5 verification failed.\n");
        m5_teardown(m5); m4_teardown(m4); m3_teardown(m3); m2_teardown(m2); m1_teardown(m1); m0_teardown(m0);
        arena_destroy(&arena);
        return 1;
    }
    printf("[boot] M5 (Epii) initialized. CF=MOBIUS. Holographic container loaded.\n");
```

Add `#include "m5.h"` at top.

Add CLI dispatch block (before the double covering section):

```c
    if (argc > 1 && strcmp(argv[1], "m5") == 0) {
        int rc = m5_cli_dispatch(argc - 1, argv + 1, m5);
        m5_teardown(m5); m4_teardown(m4); m3_teardown(m3); m2_teardown(m2);
        m1_teardown(m1); m0_teardown(m0); arena_destroy(&arena);
        return rc;
    }
```

Add `m5_teardown(m5);` to the cleanup section (before `m4_teardown`).

Update all existing CLI dispatch blocks and error paths to include `m5_teardown(m5);`.

**Step 2: Build full system**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c src/main.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    -o epi-logos
./epi-logos
```

Expected: All `[boot] ... OK` lines including `[boot] M5 (Epii) initialized.`

**Step 3: Test CLI**

```bash
./epi-logos m5 info
./epi-logos m5 logos tick
./epi-logos m5 logos advance
./epi-logos m5 agents list
./epi-logos m5 stack
```

Expected: Each prints the appropriate M5 state.

**Step 4: Commit**

```bash
git add src/main.c
git commit -m "feat(m5): integrate M5 into boot sequence and CLI dispatch"
```

---

### Task 12: Final Test Count + Cleanup

**Files:**
- Modify: `src/test_m5.c`

**Step 1: Review test_m5.c main() calls all test functions**

Ensure `main()` calls:
1. `test_logos_fsm_types()`
2. `test_quintessential_view()`
3. `test_sub_branch_structs()`
4. `test_m5_root_struct()`
5. `test_m5_init_teardown()`
6. `test_m5_advance_logos()`
7. `test_m5_mobius_return()`
8. `test_m5_lookup()`
9. `test_m5_verify()`
10. `test_m5_cli_dispatch()`

**Step 2: Build with sanitizers and run**

```bash
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/test_m5.c -o test_m5
./test_m5
```

Expected: Zero warnings, zero sanitizer errors, all tests PASS. Target: ~120+ tests.

**Step 3: Build full system with zero warnings**

```bash
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c src/main.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    -o epi-logos
./epi-logos
```

Expected: Full boot sequence with M5 line, zero warnings.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(m5): M5 Epii complete — holographic integration layer at #5

- Logos FSM: 12-tick SU(2) pipeline, 1-byte state, branchless O(1)
- Quintessential View: per-coordinate self-API with S0'/S1'/S2' trika
- Sub-branches: M+M'(#5-0), L+P+L'+P'(#5-1), S+S'(#5-2), M' UI(#5-3),
  Anima+Aletheia(#5-4), T+C+T'+C'(#5-5)
- Sacred Violation: Mobius write-back at tick 11, FSM-guarded
- Etymology FSM, paradox-holding, scent-following sub-FSMs
- CLI: info, logos, agents, stack, theory, lookup
- Full boot integration in main.c"
```

---

## Task Dependency Graph

```
Task 1 (FSM types)
  └→ Task 2 (QV system)
      └→ Task 3 (sub-branch structs)
          └→ Task 4 (M5_Root + sub-FSMs)
              └→ Task 5 (init/teardown)
                  ├→ Task 6 (advance_logos)
                  ├→ Task 7 (mobius_return)
                  ├→ Task 8 (m5_lookup)
                  └→ Task 9 (m5_verify)
                      └→ Task 10 (CLI dispatch)
                          └→ Task 11 (main.c integration)
                              └→ Task 12 (final verification)
```
