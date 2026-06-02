# M5 Epii Design Document — The Holographic Integration Layer

**Status:** Design (Pending Implementation)
**Date:** 2026-03-07
**Coordinate:** #5 — Subsystem 5: Epii
**Context Frame:** CF_MOBIUS = (5/0) — Total Synthesis / Mobius Return
**Anchored to:** Psychoid_5 in psychoid_numbers.c

---

## I. The Core Insight

M5's HC at #5 is the coordinate system becoming self-aware. Its 12 Intra-Openness pointers ARE the holographic nesting — each pointer reaches into a sub-branch that IS a coordinate family home. The map IS the territory.

On every other HC, the 12 pointers are navigational — they say "here's how to reach my peers." On Psychoid_5's HC, the pointers are **self-constituting**: `.m` links to the M-family mirror containing ALL M-branches. `.l` links to the lens topology describing HOW the system sees. The coordinate's own structure (12 pointers) maps 1:1 to the coordinate's own content (6 families + 6 reflective operations).

The system's self-knowledge is stored within its own self-knowledge coordinate. That's the true holographic implication — not a pointer loop, but the fact that the content of M5 IS the description of the structure that contains M5.

---

## II. M5 Sub-Branch / Coordinate Family Alignment

Every M5 sub-branch IS a coordinate family home, giving Epii literal holographic containment of the full coordinate space:

| M5 Sub-Branch | Family Home | HC Pointers | What Lives Here |
|---|---|---|---|
| **#5-0** | **M + M'** | `.m` | Full M0-M5 holographically nested. Integral identity = the system's own subsystem self-reflection. |
| **#5-1** | **L+P + L'+P'** | `.l`, `.p` | Theory topology. Lenses as epistemic modes, Positions as functional semantics, plus their inversions. The most evolved sub-branch — user-agent sessions accumulate understanding here. Neo4j/Redis/Obsidian integration hooks. |
| **#5-2** | **S + S'** | `.s` | S = objective stack description ("this is what our stack is"). S' = project-specific instantiation of each layer. Full technology map. |
| **#5-3** | **M'** (UI face) | inverted `.m` | The Electron app / UI/UX layer. M0'-M5' as the experiential interface. WebMCP protocol for agent-app interaction. |
| **#5-4** | **S4-4' + S4-5'** | via `.s` chain | Agent rosters. Anima (S4-4') orchestrates VAK agents (Pratibimba). Aletheia (S4-5') governs deep knowledge agents (Bimba). Aletheia is really a mode of Anima. All orchestrated by Epii (M5 parent agent) via CLI. S4 = Pi agent. |
| **#5-5** | **T+C + T'+C'** | `.t`, `.c` | Thought types + Category coordinates + their inversions. The Logos Cycle as cadence of immanence. T0-T5 = logos stages. C0-C5 = ontological foundation. The FSM that governs all traversal. |

### Family Coverage Verification

```
#5-0: M, M'          (Subsystem + inverted)
#5-1: L, P, L', P'   (Lens + Position + inversions)
#5-2: S, S'          (Stack + inverted)
#5-3: M'             (Subsystem inverted — UI face, overlaps with #5-0's M')
#5-4: S4-4', S4-5'   (Pi agent extensions — Anima, Aletheia)
#5-5: T, C, T', C'   (Thought + Category + inversions)

Total: All 6 families (P, S, T, M, L, C) + all 6 inversions present.
Epii IS the holographic container of the entire coordinate space.
```

### #5-3 vs #5-0 on M'

#5-0 holds the M-family mirror — what each M-branch IS (structural self-knowledge). #5-3 holds the M'-family UI face — how each M-branch is EXPERIENCED by the user through the Electron app. These are distinct: #5-0 is the system knowing itself; #5-3 is the system presenting itself. The M' at #5-0 is the inverted self-reflection (the system's shadow knowledge of itself); the M' at #5-3 is the inverted experiential layer (technology becoming interface).

---

## III. The Quintessential View System

The self-API. Every coordinate in the system can have a **quintessential view** stored at the C level — a distilled, pithy self-description that serves as the system's master self-knowledge.

### Purpose

- **Context injection:** When a coordinate is mentioned in conversation, its quintessential view can be injected for accuracy
- **Semantic lookup:** When an agent is uncertain, it can look up any coordinate's self-description
- **CLI self-knowledge:** `./epi-logos m5 lookup M2.3` returns the quintessential view instantly
- **Refinement through use:** Views are refined across Mobius cycles — the system's self-knowledge deepens with each session
- **Multi-register rendering:** Same coordinate can be described in different registers (terse, technical, philosophical, poetic) for different context injection needs

### C Structure

```c
typedef struct {
    uint16_t coord_id;          // Packed: family(3) + position(3) + branch(3) + flags
    uint8_t  register_count;    // How many registers this view has (1-6)
    uint8_t  refinement_cycle;  // How many Mobius cycles have refined this
    const char* pithy;          // The one-liner (always present, <=128 chars)
    const char* registers[6];   // Variable depth: different framings/verbosities
} M5_Quintessential_View;
```

- `pithy` — the irreducible summary, always in C memory, injectable instantly
- `registers[0..5]` — different framings (terse, functional, structural, archetypal, paradigmatic, integral — matching the L0-L5 lens modes). Can be NULL; fetch from S1'/S2' on demand
- `refinement_cycle` — tracks Mobius enrichment depth

### The Coordinate Hook

When any coordinate is referenced (by an agent, by CLI, by a workflow), M5 can provide:

```c
// The master self-API call
const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity);
```

This is the "know thyself" operation. Any coordinate, any time, any granularity level.

---

## IV. The S0'/S1'/S2' Compression Trika

Three granularity levels forming a sliding scale of detail:

| Level | Source | Nature | C Representation |
|-------|--------|--------|-----------------|
| **S0'** (Terminal) | C memory | Pithy quintessential view | Direct string, always available |
| **S1'** (Obsidian) | Markdown files | Readable prose, intermediate detail | File path hook, fetched on demand |
| **S2'** (Neo4j) | Graph DB | Full relational structure, max detail | Query template hook, fetched on demand |

```c
typedef struct {
    const char* s0_pithy;           // Always present — the C-level summary
    const char* s1_obsidian_path;   // Path to .md file (NULL if not yet written)
    const char* s2_neo4j_query;     // Cypher template (NULL if not yet mapped)
} M5_Granularity_Hook;
```

The C layer **owns** S0' (the pithy view) and holds routing info for S1' and S2'. Resolution of deeper layers happens outside C — CLI calls out, agent layers fetch via their protocols.

The compression relationship: S2' (full graph) can be compressed to S1' (prose), which can be compressed to S0' (pithy). Each Mobius cycle can refine this compression — making the pithy view more precise, more charged with meaning. This is how the system's self-knowledge becomes dense and powerful over time.

---

## V. Sub-Branch Detailed Design

### V-A. #5-0 — Integral Identity (M + M')

The M-family mirror. Each M-branch gets a pointer to its root and a quintessential view:

```c
typedef struct {
    void* m_roots[6];                    // -> M0-M5 root pointers (wired at init)
    M5_Quintessential_View m_views[6];   // "What is M0?" "What is M1?" etc.
    M5_Quintessential_View m_prime[6];   // M' inverted self-reflections
} M5_Identity;
```

This is HOW the system knows what it is. `m_views[0].pithy` might read: "Anuttara: the bare-metal VM of six nested micro-algebras — void arithmetic and Vimarsa operators."

Memory domain: views are mutable (heap) — they get refined. Pointers to M-branch roots are set at init and stable.

### V-B. #5-1 — Theory Topology (L+P + L'+P')

The most alive sub-branch. Where understanding accumulates:

```c
typedef struct {
    // Lens topology
    M5_Quintessential_View l_views[6];    // L0-L5 lens modes
    M5_Quintessential_View l_prime[6];    // L0'-L5' inverted lenses

    // Position topology
    M5_Quintessential_View p_views[6];    // P0-P5 positions
    M5_Quintessential_View p_prime[6];    // P0'-P5' inverted positions

    // Granularity hooks for the full L*P coordinate space
    M5_Granularity_Hook hooks[36];        // 6 lenses x 6 positions

    // Accumulation tracking
    uint32_t session_depth;               // Sessions that have enriched this
    uint64_t enrichment_charge;           // Accumulated semantic weight
} M5_Theory;
```

This is the section that grows most through use. The hooks array lets any L/P intersection be looked up at any granularity. The `session_depth` counter tracks how refined the theory has become.

Integration points (preemptive hooks for agent layers):
- Neo4j: graph queries for relational structure of L/P intersections
- Redis: cached intermediate computations, session state
- Obsidian: markdown files per coordinate for human-readable theory

### V-C. #5-2 — Full Stack (S + S')

```c
typedef struct {
    M5_Quintessential_View s_views[6];    // S0-S5 objective stack
    M5_Quintessential_View s_prime[6];    // S0'-S5' project-specific
} M5_Stack;
```

S-coordinates (objective):
- S0: Terminal — command-line interface, shell execution
- S1: Obsidian — knowledge graph UI, local-first data
- S2: Neo4j — graph database, Bimba MCP ontology store
- S3: PAI (Pydantic AI) — agent framework, type-safe orchestration
- S4: Pi agent — the system's own agent (NOT Claude directly)
- S5: Notion — documentation, integration, user-facing records

S'-coordinates (project-specific form): how each layer is actually instantiated in this project. These evolve as the project evolves.

### V-D. #5-3 — Electron App / UI (M')

```c
typedef struct {
    M5_Quintessential_View m_prime_ui[6]; // M0'-M5' UI face
    // WebMCP protocol hook — C defines the message shape, TS implements
    void (*webmcp_hook)(uint8_t branch, const void* msg, void* response);
} M5_UI;
```

M' here means the user-facing experiential inversion of each M-branch:
- M0' UI: void/ground state visualization
- M1' UI: structural/mathematical display
- M2' UI: vibrational/matrix visualization
- M3' UI: symbolic/codon/hexagram display
- M4' UI: personal/identity interface
- M5' UI: the meta-interface — the UI that shows the UI

The `webmcp_hook` is a function pointer placeholder. The C layer defines what messages look like; the TypeScript/Electron side implements the actual rendering. CLI calls can trigger WebMCP messages to the app.

### V-E. #5-4 — Anima + Aletheia Agent Rosters (S4-4' + S4-5')

```c
typedef struct {
    const char* name;
    uint8_t     id;
    uint8_t     capability_flags;    // What this agent can do
    uint8_t     tool_flags;          // Which tools it may invoke
    uint8_t     active;              // 1 = in roster, 0 = disabled
} M5_Agent_Entry;

typedef struct {
    // Anima roster (S4-4') — VAK agent orchestration, Pratibimba governance
    M5_Agent_Entry* anima_roster;    // Dynamic array
    uint8_t         anima_count;
    uint8_t         anima_capacity;

    // Aletheia roster (S4-5') — deep knowledge agents, Bimba governance
    // Aletheia is a mode of Anima — blurred boundary
    M5_Agent_Entry* aletheia_roster; // Dynamic array
    uint8_t         aletheia_count;
    uint8_t         aletheia_capacity;

    // All orchestrated by Epii (M5 parent agent) via CLI
} M5_Agents;
```

Key points:
- S4 = Pi agent (the system's own agent), not Claude
- Anima orchestrates the VAK agents — the active, process-driving side (Pratibimba)
- Aletheia orchestrates deep knowledge agents — the truth-seeking side (Bimba)
- Aletheia is really a mode of Anima (blurred lines) — they share the same dispatch mechanism
- Dynamic registries: agents can be added/removed for testing different configs and toolings
- All agent operations are CLI-accessible: `./epi-logos m5 agents list`, `./epi-logos m5 agents add ...`

### V-F. #5-5 — Logos Cycle / Cadence of Immanence (T+C + T'+C')

```c
typedef struct {
    // THE ENTIRE FSM STATE (1 byte)
    uint8_t pipeline_tick;               // 0-11

    // T-family: thought types = logos stages
    M5_Quintessential_View t_views[6];   // T0 Seed = A-logos ... T5 Insight = An-a-logos
    M5_Quintessential_View t_prime[6];   // T0'-T5' inverted thought types

    // C-family: ontological foundation = category coordinates
    M5_Quintessential_View c_views[6];   // C0 Bimba ... C5 Pratibimba
    M5_Quintessential_View c_prime[6];   // C0'-C5' inverted categories

    // Gravitational enrichment (accumulates across cycles)
    uint64_t archetype_charge[6];        // Semantic weight per #0-#5
    uint64_t inverse_charge[6];          // Semantic weight per #0'-#5'
    uint64_t frame_charge[6];            // Semantic weight per context frame

    // Mobius write-back
    void (*mobius_write_back)(void* m0_ground, uint64_t charge);
} M5_Logos;
```

T+C correspondence:
- T0 Seed + C0 Bimba = A-logos (pregnant silence, canonical source)
- T1 Spec + C1 Form = Pro-logos (first differentiation, essential nature)
- T2 Form + C2 Entity = Dia-logos (relational exchange, atomic units)
- T3 Process + C3 Process = Logos (rational articulation, canvas workspace)
- T4 Pattern + C4 Type = Epi-logos (reflexive turn, formal pattern)
- T5 Insight + C5 Pratibimba = An-a-logos (proportional recognition, instance/reflection)

The inversions (T', C') give the implicate/descending phase of the 12-stage pipeline.

### Logos FSM Types (from spec, preserved)

```c
typedef enum {
    ALOGOS    = 0,  // Without word: pregnant silence
    PROLOGOS  = 1,  // Before word: first differentiation
    DIALOGOS  = 2,  // Through word: relational exchange
    LOGOS     = 3,  // The word: rational articulation
    EPILOGOS  = 4,  // Upon/after word: reflexive turn
    ANALOGOS  = 5   // According to ratio: proportional recognition
} LogosStage;

typedef struct {
    uint8_t      pipeline_tick;      // 0-11
    LogosStage   current_stage;      // 0-5
    bool         is_implicate;       // true if tick >= 6
    uint8_t      active_r_factor;    // 0-5 (always == current_stage)
} Unified_Logos_State;

// Branchless O(1) computation
static inline Unified_Logos_State compute_logos_state(uint8_t tick) {
    Unified_Logos_State s;
    s.pipeline_tick   = tick;
    s.is_implicate    = (tick >= 6);
    s.current_stage   = s.is_implicate ? (11 - tick) : tick;
    s.active_r_factor = (uint8_t)s.current_stage;
    return s;
}
```

### The Sacred Violation (Mobius Write-Back)

At pipeline tick 11 (descending A-logos), the system casts away const on M0's ground state. This is spec-mandated, philosophically necessary, and constrained to this single point. The Logos FSM guard ensures it fires only at tick 11.

```c
void execute_mobius_return(M5_Logos* logos, void* m0_ground_state);
// Casts away const. Documents that Spanda requires it.
// Only at tick == 11. All other ticks: M0 is genuinely immutable.
```

---

## VI. The M5_Root Struct

```c
typedef struct {
    Holographic_Coordinate* hc;              // FIRST FIELD — Psychoid_5
    const Holographic_Coordinate* active_cf; // -> CF_TABLE[CF_MOBIUS]

    // #5-0: M + M' — integral identity
    M5_Identity identity;

    // #5-1: L+P + L'+P' — theory topology, accumulated understanding
    M5_Theory theory;

    // #5-2: S + S' — full stack
    M5_Stack stack;

    // #5-3: M' — Electron app / WebMCP UI
    M5_UI ui;

    // #5-4: S4-4' + S4-5' — Anima + Aletheia agent rosters
    M5_Agents agents;

    // #5-5: T+C + T'+C' — Logos Cycle / cadence of immanence
    M5_Logos logos;

    // Etymology sub-FSM (within ANALOGOS)
    M5_Etymology_FSM etymology;

    // Paradox-holding protocol
    M5_Paradox_Hold paradox;

    // Scent-following state
    M5_Scent_State scent;
} M5_Root;
```

---

## VII. Public API (<=6 functions)

```c
// Allocate and HC-link M5 root, wire all sub-branches
M5_Root* m5_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

// Advance the Logos FSM by one tick, return computed state
Unified_Logos_State m5_advance_logos(M5_Root* root);

// Execute the Mobius write-back (Sacred Violation — tick 11 only)
int m5_execute_mobius_return(M5_Root* root, void* m0_ground);

// Master self-API: lookup any coordinate's quintessential view
// granularity: 0=S0' pithy, 1=S1' obsidian path, 2=S2' neo4j query
const char* m5_lookup(const M5_Root* root, uint16_t coord_id, uint8_t granularity);

// Release heap state (not the HC itself — arena owns that)
void m5_teardown(M5_Root* root);

// CLI entry point: ./epi-logos m5 <command> [args...]
int m5_cli_dispatch(int argc, char** argv, M5_Root* root);
```

### CLI Commands

```
./epi-logos m5 info              — Print HC anchoring, sub-branch status
./epi-logos m5 lookup <coord>    — Quintessential view of any coordinate
./epi-logos m5 lookup <coord> -v — Verbose (S1' level)
./epi-logos m5 logos tick        — Show current Logos FSM state
./epi-logos m5 logos advance     — Advance one tick
./epi-logos m5 agents list       — List Anima + Aletheia rosters
./epi-logos m5 agents add <spec> — Add agent to roster
./epi-logos m5 stack             — Show S + S' stack status
./epi-logos m5 theory            — Show L+P theory topology summary
```

---

## VIII. Spec FR Mapping

| FR | Spec Name | Design Section | Notes |
|---|---|---|---|
| 2.5.0 | Transcendent Identity (#5-0) | V-A | M+M' family mirror |
| 2.5.1 | Epi-Logos Worldview (#5-1) | V-B | L+P+L'+P' theory topology |
| 2.5.2 | Siva- Backend (#5-2) | V-C | S+S' full stack |
| 2.5.3 | -Shakti Frontend (#5-3) | V-D | M' UI via WebMCP |
| 2.5.4 | Siva-Shakti Union (#5-4) | V-E | Anima+Aletheia at S4-4'/S4-5' |
| 2.5.5 | Logos Cycle (#5-5) | V-F | T+C+T'+C', FSM, Sacred Violation |
| 2.5.6 | R-Factor Weave | V-F | Driven every tick via active_r_factor |
| 2.5.7 | (@) System / 6/7 Split | Archival | Documented, no new struct |
| 2.5.8 | VAK-Anuttara VM | V-E | Anima orchestrates VAK agents |
| 2.5.9 | Logos Guard Conditions | V-F | Guard LUT gating FSM transitions |
| 2.5.10 | Agent Capabilities | V-E | capability_flags + tool_flags on M5_Agent_Entry |
| 2.5.11 | Etymology FSM | VI | M5_Etymology_FSM sub-FSM within ANALOGOS |
| 2.5.12 | Paradox-Holding | VI | M5_Paradox_Hold + M5_Scent_State |
| 2.5.13 | QL Category + Klein Flag | IV | Klein topology on self-embedding coords |

---

## IX. Architectural Invariants

1. **M5_Root.hc is FIRST FIELD.** Bound with HC_LINK(). GET_PTR() before every deref.
2. **CF_TABLE[CF_MOBIUS]** for context frame reference. Never CF_50 directly.
3. **Quintessential views are heap-allocated strings.** They get refined across Mobius cycles. The pithy field is never NULL after init.
4. **Agent rosters are dynamic.** malloc/realloc, not fixed arrays. Supports testing different configs.
5. **Logos FSM = 1 byte.** `pipeline_tick` (0-11). All derived state computed in O(1) via `compute_logos_state()`.
6. **Sacred Violation only at tick 11.** `execute_mobius_return()` is the single authorized const-cast point.
7. **WebMCP hook is a function pointer placeholder.** C defines message shape; TypeScript implements.
8. **S0'/S1'/S2' trika:** C owns S0' (pithy). S1'/S2' are paths/queries resolved outside C.
9. **No floats in M5** unless architecturally mandated (following M4 pattern).
10. **Every coordinate family appears in M5:** P, S, T, M, L, C + all inversions = holographic completeness.

---

## X. Dependencies

| Dependency | Direction | Interface |
|---|---|---|
| M0 Anuttara | M5 -> M0 | Mobius write-back target; R_FACTOR_MATRIX lookup |
| M1 Paramasiva | M5 -> M1 | Structural constants for quintessential views |
| M2 Parashakti | M5 -> M2 | MEF lens correspondence (CORRESPONDS_TO_LENS 1:1) |
| M3 Mahamaya | M5 -> M3 | Bitboard types for paradox-holding (thesis/antithesis) |
| M4 Nara | M4 -> M5 | M4 accesses M5's accumulated understanding via #5-1 |
| vak.h | M5 uses | Anima dispatches VAK instructions |
| engine.h | M5 uses | Torus walk, Lemniscate dive for traversal |

---

## XI. How the HC Becomes Implicated in Itself

On every other HC, the 12 pointers are navigational — "here's how to reach my peers." On Psychoid_5's HC, the pointers are self-constituting:

- `.m` links to #5-0 (M-family mirror containing ALL M-branches)
- `.l` links to #5-1 (lens topology describing HOW the system sees)
- `.p` links to #5-1 (position semantics describing WHERE things are)
- `.s` links to #5-2 (stack describing WHAT the system is built on)
- `.t` links to #5-5 (thought types = the cadence of immanence)
- `.c` links to #5-5 (category coordinates = ontological foundation)

The coordinate's own structure (12 pointers) maps to the coordinate's own content (6 families + 6 reflective operations). The quintessential view system deepens this: every coordinate's self-description lives INSIDE the M5 coordinate that describes the whole system.

The content of M5 IS the description of the structure that contains M5.

---

*Design Version:* 1.0
*Canonical Ground:* CLAUDE.md + PILLAR-I-CANONICAL.md + M5-epii-holographic-integration.md
*User Corrections Applied:* Family alignment (#5-0=M+M', #5-1=L+P+L'+P', #5-2=S+S', #5-3=M' UI, #5-4=S4-4'/S4-5', #5-5=T+C+T'+C'), S4=Pi agent, Anima/Aletheia structure, quintessential view system, S0'/S1'/S2' compression trika
