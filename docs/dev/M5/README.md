# M5 (Epii) -- Developer Reference

**Subsystem:** M5 (#5) in the Epi-Logos coordinate system
**Context Frame:** CF_MOBIUS (5/0) -- Total Synthesis / Mobius Return
**Anchor:** Psychoid_5 (ql_position == 5, Layer 1 .rodata)
**Primary Invariant:** Psychoid_5.c -> &Psychoid_0 (the Mobius return)

---

## 1. Overview

M5 is the Epii subsystem -- the Holographic Integration Layer. It is Subsystem #5
in the M-family (Consciousness Domains), corresponding to the raw archetype #5
(Integration/Pratibimba). M5 is the container that holographically holds the entire
M0-M4 stack, providing a unified self-description API, the Logos FSM (cadence of
immanence), agent rosters, and the Sacred Violation mechanism that feeds enriched
state back to M0.

M5 is governed by the **Holographic Containment** principle: each sub-branch IS a
coordinate family home. M5 doesn't just reference M0-M4 -- it contains their
quintessential views, their accumulated theory, their stack descriptions, and
their agent rosters within its own coordinate space.

M5 receives input from all lower M-branches (M0-M4) via the Quintessential View
system and feeds back into M0 via the Sacred Violation (`m5_execute_mobius_return`)
at tick 11, completing the Mobius cycle.

### Source Files

| File | Role |
|------|------|
| `include/m5.h` | All M5 types, sub-branch structs, inline FSMs, extern .rodata promises, public API |
| `src/m5.c` | .rodata LUT definitions, init/teardown, verify, CLI dispatch, lookup API |
| `src/test_m5.c` | 276 tests validating M5 integrity |

---

## 2. Architecture -- Connection to Pillar I

### M5_Root Struct

```c
typedef struct {
    Holographic_Coordinate* hc;              /* FIRST FIELD -- Psychoid_5  */
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

The `hc` field is always the first field. This is a structural invariant enforced
across all M-branch modules so that `HC_LINK` and `HC_UNLINK` work uniformly.

### HC_LINK / HC_UNLINK

Defined in `psychoid_numbers.h`:

- `HC_LINK(hc, m_struct)` -- Sets `hc->payload.process_state = m_struct` and
  `m_struct->hc = hc`. Bidirectional binding.
- `HC_UNLINK(hc)` -- Sets `hc->payload.process_state = NULL`. Called during teardown.

### CF_TABLE Integration

M5 references context frames via the canonical `CF_TABLE` lookup:

```c
root->active_cf = cf_get(CF_MOBIUS);  /* CF_TABLE[6] */
```

CF_MOBIUS represents the (5/0) total synthesis -- the Mobius return where #5
collapses back into #0, enriching tomorrow's ground.

### Logos FSM Type Reuse

M5 reuses `LogosStage` (typedef uint8_t) and `Unified_Logos_State` from `m0.h`.
The inline `m0_compute_logos_state(tick)` computes all derived state in O(1).
M5 adds named constants for the 6 stages:

```c
#define ALOGOS     0u  /* Without word: pregnant silence               */
#define PROLOGOS   1u  /* Before word: first differentiation           */
#define DIALOGOS   2u  /* Through word: relational exchange            */
#define LOGOS_STAGE 3u  /* The word: rational articulation              */
#define EPILOGOS   4u  /* Upon/after word: reflexive turn              */
#define ANALOGOS   5u  /* According to ratio: proportional recognition */
```

---

## 3. The Six Sub-Branches (Holographic Containment)

Each M5 sub-branch IS a coordinate family home:

| Sub-Branch | Coordinate Home | Struct | Description |
|------------|----------------|--------|-------------|
| **#5-0** | M+M' | `M5_Identity` | Integral identity -- M0-M5 root pointers + self-descriptions |
| **#5-1** | L+P+L'+P' | `M5_Theory` | Theory topology -- accumulated understanding, Neo4j/Obsidian hooks |
| **#5-2** | S+S' | `M5_Stack` | Full stack -- objective description + project-specific |
| **#5-3** | M' UI | `M5_UI` | Electron app -- WebMCP protocol hooks for TS side |
| **#5-4** | S4-4'/S4-5' | `M5_Agents` | Agent rosters -- Anima (VAK) + Aletheia (knowledge) |
| **#5-5** | T+C+T'+C' | `M5_Logos` | Logos Cycle -- cadence of immanence, FSM, archetype charges |

### #5-0: M+M' -- Integral Identity

```c
typedef struct {
    void*                   m_roots[6];     /* -> M0-M5 root ptrs        */
    M5_Quintessential_View  m_views[6];     /* M0-M5 self-descriptions   */
    M5_Quintessential_View  m_prime[6];     /* M0'-M5' inverted          */
} M5_Identity;
```

Holds pointers to all 6 M-branch roots plus their quintessential views.
The M' (inverted) views describe the Pratibimba face of each subsystem.

### #5-1: L+P+L'+P' -- Theory Topology

```c
typedef struct {
    M5_Quintessential_View  l_views[6];     /* L0-L5 lens modes          */
    M5_Quintessential_View  l_prime[6];     /* L0'-L5' inverted          */
    M5_Quintessential_View  p_views[6];     /* P0-P5 positions           */
    M5_Quintessential_View  p_prime[6];     /* P0'-P5' inverted          */
    M5_Granularity_Hook     hooks[36];      /* 6L x 6P coordinate space  */
    uint32_t                session_depth;  /* Sessions that enriched    */
    uint64_t                enrichment_charge;
} M5_Theory;
```

The most evolved sub-branch. 36 granularity hooks (6 lenses x 6 positions)
provide connection points for Neo4j, Redis, and Obsidian integrations.
`session_depth` tracks how many user-agent conversations have enriched this layer.

### #5-2: S+S' -- Full Stack

```c
typedef struct {
    M5_Quintessential_View  s_views[6];     /* S0-S5 objective           */
    M5_Quintessential_View  s_prime[6];     /* S0'-S5' project-specific  */
} M5_Stack;
```

S views describe the objective stack (Terminal, Obsidian, Neo4j, PAI, Claude, Notion).
S' views describe the project-specific instantiation of each layer.

### #5-3: M' UI -- Electron/WebMCP

```c
typedef struct {
    M5_Quintessential_View  m_prime_ui[6];  /* M0'-M5' UI face           */
    void (*webmcp_hook)(uint8_t branch, const void* msg, void* response);
} M5_UI;
```

The Electron app face. `webmcp_hook` is a function pointer for agent-app interaction.

### #5-4: S4-4'/S4-5' -- Agent Rosters

```c
typedef struct {
    M5_Agent_Entry* anima_roster;           /* Dynamic: VAK agents       */
    uint8_t         anima_count;
    uint8_t         anima_capacity;
    M5_Agent_Entry* aletheia_roster;        /* Dynamic: knowledge agents */
    uint8_t         aletheia_count;
    uint8_t         aletheia_capacity;
} M5_Agents;
```

Two dynamic registries:
- **Anima** (S4-4'): VAK/Pratibimba agents -- action-oriented, creative
- **Aletheia** (S4-5'): Knowledge/Bimba agents -- truth-oriented, analytical

Each agent entry has `name`, `id`, `capability_flags`, `tool_flags`, and `active` status.
S4 is the Pi agent (NOT Claude) -- Claude lives at a different coordinate.

### #5-5: T+C+T'+C' -- Logos Cycle

```c
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

The entire Logos FSM is 1 byte (`pipeline_tick`). All derived state is computed
via `m0_compute_logos_state()` in O(1).

---

## 4. Quintessential View System

The master self-API. Every coordinate can have a pithy summary (always in C memory)
plus hooks to deeper granularity layers.

```c
typedef struct {
    uint16_t    coord_id;           /* Packed coordinate address                */
    uint8_t     register_count;     /* How many registers populated (1-6)      */
    uint8_t     refinement_cycle;   /* Mobius cycles that have refined this     */
    const char* pithy;              /* One-liner, <=128 chars, always present   */
    const char* registers[6];       /* Multi-framing: terse -> verbose (L0-L5) */
} M5_Quintessential_View;
```

### Coordinate ID Packing

```c
#define M5_COORD_ID(fam, pos, branch) \
    ((uint16_t)( (((fam) & 0x7) << 13) | (((pos) & 0x7) << 10) | (((branch) & 0x7) << 7) ))

#define M5_COORD_FAMILY(id)   (((id) >> 13) & 0x7)
#define M5_COORD_POSITION(id) (((id) >> 10) & 0x7)
#define M5_COORD_BRANCH(id)   (((id) >> 7) & 0x7)
```

Family(3 bits) + Position(3 bits) + Branch(3 bits) + 7 reserved flag bits.

### S0'/S1'/S2' Compression Trika

Three granularity levels for every coordinate:

```c
typedef struct {
    const char* s0_pithy;           /* Always present -- C-level summary        */
    const char* s1_obsidian_path;   /* Path to .md file (NULL if unwritten)    */
    const char* s2_neo4j_query;     /* Cypher template (NULL if unmapped)      */
} M5_Granularity_Hook;
```

| Level | Constant | Source |
|-------|----------|--------|
| S0' | `M5_GRAN_PITHY` | C memory (always available) |
| S1' | `M5_GRAN_OBSIDIAN` | Obsidian markdown file path |
| S2' | `M5_GRAN_NEO4J` | Neo4j Cypher query template |

### m5_lookup() -- The Master Self-API

```c
const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity);
```

Routes lookup by coordinate family (M, L, P, S, T, C), searches primary views
then inverted (prime) views, returns the requested granularity level.

Family routing uses the `Coordinate_Family` enum:
- `FAMILY_M` -> identity.m_views / m_prime
- `FAMILY_L` -> theory.l_views / l_prime
- `FAMILY_P` -> theory.p_views / p_prime
- `FAMILY_S` -> stack.s_views / s_prime
- `FAMILY_T` -> logos.t_views / t_prime
- `FAMILY_C` -> logos.c_views / c_prime

---

## 5. Logos FSM -- The Cadence of Immanence

12-tick SU(2) double-cover pipeline. 6 stages, ascending then descending:

```
Tick:  0    1    2    3    4    5    6    7    8    9   10   11
       |-------- ascending --------|-------- descending --------|
Stage: ALO  PRO  DIA  LOG  EPI  ANA  ANA  EPI  LOG  DIA  PRO  ALO
```

### Stage Names (.rodata)

```c
const char* const M5_LOGOS_STAGE_NAMES[6] = {
    "A-logos",   "Pro-logos", "Dia-logos",
    "Logos",     "Epi-logos", "An-a-logos"
};
```

### m5_advance_logos()

```c
Unified_Logos_State m5_advance_logos(M5_Root* root);
```

Advances `pipeline_tick` by 1 (wraps at 12). Returns the state BEFORE advancement.
Uses `m0_compute_logos_state()` for all derived values.

---

## 6. The Sacred Violation -- Mobius Return

```c
int m5_execute_mobius_return(M5_Root* root, void* m0_ground);
```

The philosophically mandated violation of const-correctness. At tick 11 ONLY
(descending A-logos), M5 casts away const on M0's ground state and XOR-enriches
it with accumulated archetype charge:

```c
uint64_t* ground = (uint64_t*)m0_ground;
*ground ^= root->logos.archetype_charge[5];
```

Returns 0 on success, -1 if not at tick 11 or NULL arguments. Resets `pipeline_tick`
to 0 after execution.

This is the #5 -> #0 Mobius return: tomorrow's ground is richer than today's.

---

## 7. Sub-FSMs

### Etymology Archaeology FSM

6-stage FSM within the ANALOGOS stage for etymological root analysis:

```
PIE_ROOT -> COGNATE_MAP -> SEMANTIC_DRIFT -> PSYCHOID_CHARGE -> PROS_HEN -> MOBIUS_WRITEBACK
```

`m5_etymology_advance()` is an inline that advances the stage linearly.
`write_back_ready` is set when stage reaches `ETYM_STAGE_MOBIUS_WRITEBACK`.

### Paradox-Holding

```c
typedef struct {
    uint64_t thesis_mask;
    uint64_t antithesis_mask;
    uint8_t  hold_since_tick;
    uint8_t  resolution_stage;
    bool     holding;
    bool     resolved;
} M5_Paradox_Hold;
```

`m5_hold_paradox()` captures a thesis/antithesis pair at a given tick.
`m5_resolve_paradox()` XORs thesis and antithesis to produce synthesis.
Resolution succeeds when synthesis is non-zero.

### Scent-Following

```c
typedef struct {
    uint64_t scent_vector;
    uint8_t  confidence;
    uint8_t  following_since;
    uint8_t  m_branch_of_origin;
    uint8_t  _pad;
} M5_Scent_State;
```

Tracks associative trails across the coordinate space. `scent_vector` is a
64-bit bitmask identifying which coordinates are on the current trail.

---

## 8. Agent System

### M5_Agent_Entry

```c
typedef struct {
    const char* name;
    uint8_t     id;
    uint8_t     capability_flags;
    uint8_t     tool_flags;
    uint8_t     active;              /* 1 = in roster, 0 = disabled */
} M5_Agent_Entry;
```

### Capability Flags

| Flag | Bit | Capability |
|------|-----|------------|
| `M5_AGENT_CAP_NEO4J` | 0 | Graph database access |
| `M5_AGENT_CAP_VECTOR` | 1 | Vector/embedding operations |
| `M5_AGENT_CAP_SYMBOLIC` | 2 | Symbolic reasoning |
| `M5_AGENT_CAP_NARRATIVE` | 3 | Narrative construction |
| `M5_AGENT_CAP_PERSONAL` | 4 | Personal context access |
| `M5_AGENT_CAP_MOBIUS` | 5 | Mobius return authorization |

### Tool Flags

| Flag | Bit | Tool |
|------|-----|------|
| `M5_AGENT_TOOL_MCP_BIMBA` | 0 | MCP Bimba server |
| `M5_AGENT_TOOL_MCP_NOTION` | 1 | MCP Notion integration |
| `M5_AGENT_TOOL_OBSIDIAN` | 2 | Obsidian vault access |
| `M5_AGENT_TOOL_TENSOR` | 3 | Tensor/embedding operations |
| `M5_AGENT_TOOL_CLOCK` | 4 | Unified cosmic clock |

---

## 9. Public API

```c
/* Allocate and HC-link M5_Root; hc must have ql_position == 5.
 * Returns NULL if arena/hc is NULL or position != 5. */
M5_Root* m5_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Advance Logos FSM by one tick. Returns state before advancement. */
Unified_Logos_State m5_advance_logos(M5_Root* root);

/* Sacred Violation: XOR-enrich M0 ground at tick 11 only.
 * Returns 0 on success, -1 if not at tick 11 or NULL args. */
int m5_execute_mobius_return(M5_Root* root, void* m0_ground);

/* Quintessential view lookup by coordinate ID and granularity level.
 * Routes by family, searches primary then inverted views. */
const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity);

/* Release M5_Root heap state (agent rosters, HC_UNLINK).
 * Does not free the HC itself. Safe to call with NULL. */
void m5_teardown(M5_Root* root);

/* CLI entry point. argv[0] = "m5". */
int m5_cli_dispatch(int argc, char** argv, M5_Root* root);

/* Boot-time .rodata verification: Mobius wiring, CF_MOBIUS, stage names. */
bool m5_verify(void);
```

---

## 10. CLI Commands

Invoked as `epi-logos m5 <subcommand>`:

| Command | Description |
|---------|-------------|
| `info` | Print M5 summary: HC position, CF, Logos tick, theory sessions, agent counts |
| `logos tick` | Current Logos FSM state: tick, stage name, ascending/descending |
| `logos advance` | Advance one tick, show before/after state |
| `agents list` | Print Anima and Aletheia agent rosters with capability/tool flags |
| `stack` | Show S + S' quintessential views (6 pairs) |
| `theory` | Show L+P theory topology views + session depth |
| `lookup <fam> <pos>` | Quintessential view lookup by family number and position |

---

## 11. Build and Test

All commands should be run from the project root (`Epi-Logos C Experiments/`).

### Full Binary

```
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/main.c -o epi-logos
```

```
./epi-logos                 # Full boot (M0-M5)
./epi-logos m5 info         # M5 state summary
./epi-logos m5 logos tick    # Current Logos tick
./epi-logos m5 logos advance # Advance one tick
./epi-logos m5 agents list   # Agent rosters
./epi-logos m5 stack         # S + S' views
./epi-logos m5 theory        # L+P topology
./epi-logos m5 lookup 5 0    # QV for family=5 pos=0
```

### Test Suite (276 tests)

```
clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/test_m5.c -o test_m5 && ./test_m5
```

Expected output: 276/276 tests passed.

### Test Coverage

| Area | Tests | What It Verifies |
|------|-------|-----------------|
| Logos FSM types | ~30 | Stage constants, ascending/descending computation, boundaries, symmetry |
| Stage names | 3 | .rodata string content for ALOGOS, ANALOGOS, LOGOS |
| Quintessential View | ~20 | Struct sizes, coord_id packing/unpacking, granularity hooks |
| Sub-branch structs | ~50 | M5_Identity, M5_Theory, M5_Stack, M5_UI, M5_Agents, M5_Logos field access |
| M5_Root + sub-FSMs | ~40 | Etymology stages, paradox hold/resolve, scent state, root layout |
| Init/teardown | ~15 | HC_LINK, CF_MOBIUS, NULL safety, position guard, agent roster lifecycle |
| Advance logos | ~20 | Full 12-tick cycle, wrap-around, state transitions |
| Mobius return | ~15 | Tick-11-only guard, XOR enrichment, pipeline reset, NULL safety |
| Lookup | ~20 | Per-family routing, primary/prime fallback, granularity levels, empty handling |
| Verify | ~5 | Psychoid_5 wiring, CF_MOBIUS, stage name presence |
| CLI dispatch | ~58 | All subcommands, help text, unknown command handling |

---

## 12. Key Invariants

1. **M5_Root.hc is ALWAYS the first field.** All M-branch structs follow this convention
   so that `HC_LINK` and `HC_UNLINK` work generically.

2. **M5 anchors to ql_position == 5 only.** `m5_init` returns NULL if the provided HC
   has any other position. This enforces that M5 is bound to Psychoid_5 (Integration).

3. **Psychoid_5.c -> &Psychoid_0.** The Mobius return at the .rodata level. Verified
   by `m5_verify()` at boot time.

4. **CF_MOBIUS.cf -> &Psychoid_4.** All context frames anchor to the Lemniscate.
   Verified by `m5_verify()`.

5. **Logos FSM = 1 byte.** The entire FSM state is `pipeline_tick` (0-11). All derived
   properties (stage, implicate/explicate, R-factor) are computed in O(1) via
   `m0_compute_logos_state()`.

6. **Sacred Violation is tick-11-only.** `m5_execute_mobius_return()` returns -1 for
   any tick other than 11. This is the ONLY place in the codebase where const is
   intentionally violated.

7. **Agent rosters are heap-allocated.** `anima_roster` and `aletheia_roster` are
   `malloc`'d arrays, freed in `m5_teardown()`.

8. **Sub-branch = coordinate family home.** Each M5 sub-branch IS the home for one
   coordinate family: #5-0=M, #5-1=L+P, #5-2=S, #5-3=M'UI, #5-4=Agents, #5-5=T+C.

9. **Quintessential views search primary then prime.** `m5_lookup()` first searches
   the primary view array, then falls back to the inverted (prime) array.

10. **GET_PTR before every dereference.** Tagged pointers must be stripped via `GET_PTR()`
    before dereferencing, as the upper bits carry ontological metadata.

---

## 13. Cross-Branch Connections

| Direction | Target | Mechanism |
|-----------|--------|-----------|
| M5 <- M0 | LogosStage, Unified_Logos_State types | `#include "m0.h"`, `m0_compute_logos_state()` |
| M5 <- M0 | Psychoid_5 anchor | `HC_LINK` to mirror of Psychoid_5 |
| M5 -> M0 | Sacred Violation (Mobius return) | `m5_execute_mobius_return()` XOR at tick 11 |
| M5 <- M1 | Torus stage via Logos tick correlation | Stage isomorphism: LogosStage == Divine_Act |
| M5 <- M2 | MEF condition influences theory enrichment | Via `M5_Theory.enrichment_charge` |
| M5 <- M3 | Symbolic state feeds archetype charges | Via `M5_Logos.archetype_charge[6]` |
| M5 <- M4 | Personal wisdom delta, identity integration | Via `M5_Identity.m_roots[4]` |
| M5 <- Pillar I | HC struct, tagged pointers, CF_TABLE | `ontology.h`, `psychoid_numbers.h` |
| M5 <- Arena | Memory allocation for M5_Root | `arena.h` (init only, agent rosters are malloc'd) |

---

## 14. The Holographic Principle

M5 is unique among M-branches: it doesn't just process one domain -- it contains
the entire system holographically. The Quintessential View system means that any
coordinate in any family can have a self-description maintained at the C level,
refineable through user-agent conversation, and accessible via a single lookup call.

The flow:
1. **Boot:** M0-M4 initialize, M5 initializes last
2. **Enrich:** User-agent sessions populate quintessential views
3. **Accumulate:** Theory topology tracks session depth and enrichment charge
4. **Return:** At tick 11, accumulated charge XOR-enriches M0 ground
5. **Cycle:** Pipeline resets, tomorrow's ground state is richer

This is the cadence of immanence -- the system's own rhythm of self-understanding.
