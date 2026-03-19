---
coordinate: "S0-3"
c_1_ct_type: "CT1"
c_3_created_at: "2026-03-12"
c_4_artifact_role: "plan"
c_4_invocation_profile: "frozen_process"
c_0_source_coordinates: ["S0", "S1", "S2", "S3", "S4", "S5", "M4", "M5"]
---

# CLI Coordinate Reorganisation Plan

[[S0]] · [[S1]] · [[S2]] · [[S3]] · [[S4]] · [[S5]] · [[M4]] · [[M5]]

## 0 Question

How do we reorganise the [[epi-cli]] command surface so that every command sits at its
correct fractal 0-5 coordinate position, giving any agent entering the codebase an
immediate, ontologically grounded mental map?

## 1 Material

### Governing Principles

1. **The 0-5 is fractal, not flat.** `epi core knowing` is a 5-level action within [[S0]].
   `epi agent techne code` is the 4-of-4 context-frame within [[S4]]. Each level can hold
   its own 0-5 sub-structure where complexity warrants it.

2. **S layers ≠ hard 1:1 with M family.** The same archetypal positions underlie both,
   but S-stack = technology infrastructure layers; M-series = consciousness domains.
   Where they align they reinforce; where they diverge the S-coordinate takes precedence.

3. **`.pi` is the API surface; `epi-cli` is the implementation backing.** All S0-S5 and
   S' function tooling is eventually exposed as `.pi` extension tools calling into `epi-cli`.
   The CLI is the machine; `.pi` is the interface.

4. **`epi-lib` stays outside this system** — it is beyond [[S0]], the pure C ontological
   substrate. `epi-app` stays in `Idea/Pratibimba/System/epi-app/`.

5. **Portal = M' parent runtime.** All Mx' domain functions surface through [[epi portal]]
   as composable hypertile plugins. Raw CLI (`epi nara *`, `epi epii *`) = scripting and
   direct invocation path. Portal = composed TUI experience path.

---

### Full Coordinate-Numbered Command Map

#### Inversion Law — All Coordinates Are First-Class

Every coordinate in the system has an inverse. Inverses are NOT implied or derived
at query time — they are first-class entries surfaced in parallel with their day-side
counterpart at every level of the command surface.

**In `epi core knowing [coord]`:** output always shows both `[coord]` AND `[coord]'`
side-by-side. The COORD_REGISTRY[7][6][2] provides both via `coord_invert()`.

**In `epi epii knowing [coord]`:** same — live KnowingDossier for both day and night
positions returned together.

**In the portal plugins:** each Mx' domain plugin renders both the day and night
coordinate views (e.g. M4.2 oracle shows the divinatory entity AND its shadow form).

**In the Bimba/Seeds type hierarchy:** `World/Types/Coordinates/{family}/` already
has `{n}/` and `{n}'/` structure — this confirms the design intent. The plan and all
implementation must treat `C0` and `C0'`, `M4-3` and `M4-3'`, etc. as equal peers,
never as primary + derived.

**The `#` special case:** `#` is self-inverted — complexio oppositorum. `#` IS `#'`.
Calling `epi core knowing` (no arg) or `epi core knowing #` returns the single node
that embodies both poles simultaneously. There is no separate `#'` entry.

---

#### S/S' Infrastructure Layer

```
S0  epi core          #0 — ground / bare-metal / C library interface
  S0.#   hash                  inversion operator (#) applied to coordinate
  S0.0   inspect [coord]       ground inspection of any coordinate
  S0.1   verify / dump         form — .rodata integrity, bedrock dump
  S0.2   families              entity — 36 family coordinate explorer
  S0.3   walk / walk-tui       process — torus walk
  S0.4   dashboard / cf / operators   context — frame visualization
  S0.5   m5 / knowing           integration — two distinct sub-modes:

         epi core knowing               (no arg / bare call)
           → Returns the # root node data: the project's self-description as
             complexio oppositorum. Source: docs/datasets/hashtag_node_data.md
             bimbaCoordinate: "#", contextFrame: "0000", qlCategory: "implicate"
             The bare # is simultaneously: (1) the inversion act, (2) the
             coordinate prefix for the entire graph, (3) the standalone project
             root node. It is self-inverted — # IS #' — the non-dual source
             that contains all subsystem framings (epii_*, nara_*, parashakti_*,
             etc.) as Pratibimba reflections orbiting the indefinite Bimba centre.
             ALSO surfaces: DoV pages 60-85 seed heart excerpt as the
             philosophical grounding layer of the whole system.
             OFFLINE — no external services required.

         epi core knowing [coord]       (specific coordinate lookup)
           → Returns QV pithy data for that coordinate, baked into .rodata
             via `epi core knowing --bake`. Every lookup returns BOTH the
             coordinate AND its inverse as first-class entries (see §Inversion
             Law below). Source: QV_PITHY_* arrays in qv_data.c.
             OFFLINE — no external services required.
             S0' data source for [[Nous]] epistemic clearing (S0'/S1'/S2' gradient).

         These are DIFFERENT data sets on the SAME command branch:
           bare call   → # root (project ground + DoV philosophical layer)
           coord call  → QV pithy (coordinate quintessence, baked C data)

S1  epi vault         #1 — form / Obsidian content layer
  S1.0   status / set-default
  S1.1   create / template-invoke / day-init / now-init / flow-init
  S1.2   read / search / search-content
  S1.3   now-read/write / thought-route / archive-day
  S1.4   frontmatter-* / pasu
  S1.5   open / move / delete

S2  epi graph         #2 — operation / Neo4j + Redis
  S2.0   status / doctor       (checks both Neo4j AND Redis Stack)
  S2.1   init / bootstrap / update / reconcile
  S2.2   query / retrieve
  S2.3   sync / import
  S2.4   graphrag / hybrid     (vector + graph retrieval patterns)
  S2.5   up / down             (manages both epi-neo4j and epi-redis containers)
  S2.R   redis [status/flush/stats]   ← SIDE TASK (see below)

S3  epi gate          #3 — pattern / PAI gateway
  S3.0   status
  S3.1   start / stop / bootstrap
  S3.2   config / methods
  S3.3   inspect / subscribe
  S3.4   pair / workspace
  S3.5   kairos [fetch/status/show]   ← MOVES FROM vault (Chronos owns temporal)

S4  epi agent         #4 — context / Claude orchestration
  S4.0   doctor / auth status
  S4.1   install / agents / models
  S4.2   plugin / skill / subagent / hooks
  S4.3   extensions [sync/status/list]
  S4.4   session [init/list/patch/remove]
  S4.5   spawn / attach / run / chat / vak

  S4.T   agent techne          (4.0/1-4.4/5) — context frame sub-layer
    S4.T.0  notebook           external NotebookLM proxy (ground of craft)
    S4.T.1  ctlg               log fetching (form — record capture)
    S4.T.2  quote              research/attribution (entity)
    S4.T.3  cmux               terminal orchestration (process)
    S4.T.4  code               LLM provider profiles (context frame = LLM choice)
               claude / kimi / glm / deepc / codex / gemini
    S4.T.5  wt                 worktree management (integration)

S5  epi sync          #5 — integration apex
  S5.0   status                n8n integration status
  [expands as cross-system integration features develop]
```

#### Standalone Top-Level Utilities (S/S' class, no coordinate)

```
epi book     S/S'  reader TUI — open / zen / list
                   Clean, no flags. Ingest face → epi epii gnosis
epi sesh     S0    terminal session lifecycle (launch / kill / killall / banner)
epi up       S0    full-stack orchestration shortcut
epi help     S0    CLI reference: command listing, usage, TUI guide, app guide
                   DISTINCT from epi knowing — system nav, not ontology nav
```

#### M' Domain Subsystem Layer

```
M5' epi epii         #5 consciousness domain — synthesis / integration
  M5.0  knowing [coord]    coordinate self-knowledge (LIVE version)
                           QV pithy + vault q_ frontmatter props (via Hen)
                           + Neo4j q_ node properties + full KnowingDossier
                           (graph correspondences + vimarsa field + context notebook)
                           Richer than core knowing; requires live services.
                           Returns BOTH [coord] AND [coord]' as first-class.
                           bare call (no coord) → same as core knowing: # root data
  M5.1  gnosis             doc ingestion pipeline (Aletheia/Gnosis namespace)
    M5.1.C  context        curated RAG context sets (replaces "notebook")
             [create / list / query / update / delete]
             Nous calls aletheia_gnosis_context_create/update via nous_disclose
    M5.1.N  ingest         document ingestion (Docling → chunk → embed → Neo4j)
    M5.1.Q  query          hybrid retrieval query
    M5.1.S  status         pipeline health
  M5.2  vimarsa            reflective knowledge navigation
             [search / sem-search / add / add-file / fetch / project / switch / ...]
  M5.3  logos              Logos FSM cycle
             [run / status / stage / curriculum / export / weekly]
  M5.4  chat               M5 dialogical interface
  M5.5  fsm                FSM state inspection

M4' epi nara         #4 consciousness domain — personal / dialogical
  M4.0  identity           ground — personal identity matrix
             [show / layers / compute / layer-set]
  M4.1  clock / kairos     form — temporal form of self
             [clock --json / kairos --json --planets]
  M4.2  oracle             entity — divinatory interface
             [cast / decan / payload / payload-apply / interpret / hygiene / history]
  M4.3  medicine           process — elemental / chakra pattern
             [balance / chakra / materia / prescribe / safety]
  M4.4  wind / transform / lens   context frame (#4 Lemniscate)
             wind: set temporal-contextual clock
             transform: [status / write / reflect / recipe / commit / history]
             lens: [list / apply / jungian / trika / phenomenal / synthesize]
  M4.5  pratibimba / logos  integration — personal reflection synthesis
             pratibimba: [stats / recent / record / excavate / atlas-sync / atlas-query]
             logos: [run / status / stage / curriculum / export / weekly]

M3' epi mahamaya     #3 — clock / value / C-family deep        STUB
M2' epi parashakti   #2 — cymatics / L-family deep             STUB
M1' epi paramasiva   #1 — topology / P/S-family deep           STUB
M0' epi anuttara     #0 — coordinate ground / psychoid deep    STUB

epi portal           M' container runtime
                     Plugin host for all Mx' functions (17 plugins, M0-M5)
                     Tab 0: M4'-M5' Personal | Tab 1: M0'-M3' Structural
```

---

### Task List

#### Task 1 — Structural: Root Cleanup

- Add compiled test binaries (`test_m0_init`, `test_m1`, ...) to `.gitignore`
- Decide fate of root-level `epi_logos.c`, `epi_logos.h`, `epi_logos` binary
  (prototype artifacts; move to `_scratch/` or `.gitignore`)

#### Task 2 — S3: Kairos Migration

Move `epi vault kairos` → `epi gate kairos` (S3.5).
Chronos [[S3]] owns temporal authority. Kairos is a temporal pattern function.

- Move `epi-cli/src/vault/kairos.rs` → `epi-cli/src/gate/kairos.rs`
- Update `gate/mod.rs` to include `kairos` subcommand at S3.5
- Remove from `vault/mod.rs`
- Update `.pi/extensions/ta-onta/chronos/` to reference `gate kairos`

#### Task 3 — S4: Techne Consolidation

Formalise `epi techne` → `epi agent techne` (S4.T, context frame sub-layer).

- Move `epi-cli/src/techne/` → `epi-cli/src/agent/techne/`
- Update `agent/mod.rs` to include `techne` as S4.T
- Absorb `epi code` into `agent techne code` (S4.T.4 — code = context frame within craft)
- Remove standalone `code/mod.rs` at top level (or alias for backwards compat)
- Dissolve standalone `epi notebook` — it is superseded:
  - External NLM proxy: `agent techne notebook` (S4.T.0) ← already exists
  - Local context functionality: `epii gnosis context` (M5.1.C) ← new

#### Task 4 — M5: Epii Commands

Create `epi-cli/src/epii/` as the M5' CLI surface.

Sub-modules:
- `epii/knowing.rs` — live KnowingDossier (QV + DoV + vault q_ + Neo4j q_)
- `epii/gnosis/mod.rs` — ingestion pipeline root
  - `gnosis/context.rs` — curated RAG context management (`context` replaces `notebook`)
  - `gnosis/ingest.rs` — document ingestion
  - `gnosis/query.rs` — hybrid retrieval
  - `gnosis/status.rs` — pipeline health
- `epii/vimarsa.rs` — move from top-level `vimarsa/` into `epii/vimarsa.rs`
- `epii/logos.rs` — Logos FSM (from `nara/logos.rs` or `core/`)
- `epii/chat.rs` — M5 chat interface
- `epii/fsm.rs` — FSM state inspection

Migration:
- Move `techne/gnosis/` → `epii/gnosis/` (rename `gnosis notebook` → `gnosis context`)
- Move top-level `vimarsa/` → `epii/vimarsa/`
- Remove `vimarsa` from top-level `lib.rs` exports; expose via `epii`

#### Task 5 — M0'-M3': Stub Commands

Create four stub commands following the `epi nara` / `epi epii` pattern.
Each stub: prints domain name, coordinate, Sanskrit name, description.
Each declares its Mx'.(0-5) sub-shape in the enum even if arms are `todo!()`.

Files to create:
- `epi-cli/src/anuttara/mod.rs`    (M0' — Proto-Logos, psychoid ground)
- `epi-cli/src/paramasiva/mod.rs`  (M1' — Pro-Logos, topology / P-family)
- `epi-cli/src/parashakti/mod.rs`  (M2' — Co-Logos, cymatics / L-family)
- `epi-cli/src/mahamaya/mod.rs`    (M3' — Axio-Logos, clock / C-family)

Each mod.rs shape:
```rust
// anuttara/mod.rs — M0' Anuttara: Proto-Logos (#0 consciousness domain)
// Stub — M0'.(0-5) sub-shape declared; implementation pending.
#[derive(Subcommand)]
pub enum AnuttaraCmd {
    /// M0'.0 — psychoid ground inspection
    Ground,
    /// M0'.1 — P-family coordinate deep detail
    Form,
    /// M0'.2 — coordinate entity web
    Entity,
    /// M0'.3 — torus process at M0 level
    Process,
    /// M0'.4 — context frame anchoring
    Context,
    /// M0'.5 — M0 integration synthesis
    Synthesis,
}
pub fn dispatch(cmd: AnuttaraCmd) -> color_eyre::Result<()> {
    println!("M0' Anuttara — Proto-Logos | #0 consciousness domain");
    println!("Stub: full implementation pending.");
    Ok(())
}
```

Register in `lib.rs` and `main.rs` alongside `nara` and `epii`.

#### Task 6 — S2: Redis Explicit Commands (Side Task)

Add explicit Redis management sub-commands to `epi graph` at S2.R:

- `epi graph redis status` — Redis-specific health check + memory stats
- `epi graph redis flush` — clear semantic cache (dev/reset use)
- `epi graph redis stats` — HOT/WARM/COLD tier statistics

Add to `epi-cli/src/graph/mod.rs` GateCmd enum and route to `redis_cache.rs`.

#### Task 7 — S1: Hen q_ Frontmatter Integration

**Currently missing:** Hen's `.pi/extensions/ta-onta/hen/S1'/` operations do not write or
validate `q_*` frontmatter props on vault artifacts. These props are the bridge between
[[S1]] (Obsidian vault) and [[S2]] (Neo4j) — they carry quintessence-level metadata
that graph sync reads and promotes.

Tasks:
- Define the `q_*` key schema (q_essence, q_correspondence, q_vimarsa_field, etc.)
  in Hen's CONTRACT.md — this is a Hen (S1) authority, not invented ad hoc in graph code
- Add `q_` validation to `hen_frontmatter_validate` (alongside existing key law checks)
- Add `q_` writing support to `hen_template_invoke` (templates can emit q_ stubs)
- Ensure `epi graph sync` reads `q_*` props from frontmatter and promotes to Neo4j
  `q_*` node properties during vault→graph sync
- Reference: `epi epii knowing` (M5.0) should read these `q_*` props as part of its
  live KnowingDossier assembly

#### Task 8 — S0.5: core knowing two-mode implementation

Two distinct modes on the same command branch, clearly separated:

**Mode A — bare call: `epi core knowing`**
- Returns the `#` root node data from `docs/datasets/hashtag_node_data.md`
- Key fields: `coreNature`, `operationalEssence`, `description`, `internalStructure`,
  `architecturalFunction`, `epii_soteriology_qua_recognition` (pratyabhijñā / Epi-Logos)
- Also surfaces DoV pages 60-85 seed heart (philosophical grounding for the whole system)
- The `#` node IS self-inverted (complexio oppositorum) — no separate `#'` entry
- `contextFrame: "0000"`, `qlCategory: "implicate"`, `type: "RootProject"`
- OFFLINE — data is baked/static; reference: `docs/The_Doctrine_of_Vibration_Pages_60-85.md`

**Mode B — coord call: `epi core knowing [coord]`**
- Returns QV pithy data for that coordinate from `qv_data.c` (.rodata, baked)
- Output ALWAYS shows both `[coord]` AND `[coord]'` as first-class peers
- `qv_data.c` is generated by `epi core knowing --bake`
- Source priority for --bake (per M0 plan §0.5):
    1. `completeFormulation` from dataset JSON (67+ nodes have this in anuttara alone)
    2. `coreNature`
    3. `operationalEssence` / `operationalDynamics`
    4. `description`
  NOTE: Dataset JSON fields are the primary data source, NOT the DoV directly.
  The DoV is the philosophical framework for interpreting those values.
- `QV_PITHY_*[6]` arrays cover: C, P, L, S, T, M families + inversions + Psychoid + CF
- Future enrichment: `QV_PITHY_M0_BRANCHES[6]`, `QV_PITHY_VAK_SPEECH[12]` (per M0 plan P7)

**These are different data sets — same command branch, different invocation:**
```
epi core knowing        → # root: project ground (complexio oppositorum) + DoV layer
epi core knowing C0     → C0 QV pithy + C0' QV pithy (both, first-class)
epi core knowing M4-3   → M4-3 QV pithy + M4-3' QV pithy (both, first-class)
```

#### Task 9 — Gate/mod.rs API Contract Header

`gate/mod.rs` currently exposes 34 `pub mod` declarations with no introductory comment.
Add a header comment block:

```rust
//! gate — S3 Gateway Layer (PAI / Mahamaya pattern)
//!
//! Public entry points:
//!   server::start()       — gateway runtime lifecycle
//!   session_store         — source of truth for live session state
//!   omnipanel             — OmniPanel RPC dispatch (WebSocket)
//!   protocol              — protocol version negotiation
//!
//! Everything else in this module is implementation.
//! Read these four to understand what the gateway does.
```

#### Task 10 — Documentation Paradigm Migration

This plan is the first document written directly into [[Idea/Bimba/Seeds/]].
New development work goes here (or `Seeds/S/`, `Seeds/M/` etc.) from this point.
Existing `docs/plans/` stays in place; porting happens organically as files are touched.

Test the [[Pleroma]] skills live as part of normal workflow from this session forward.
Each plan or spec written exercises the `.pi` workflow and surfaces gaps in skill
implementations without a dedicated migration sprint.

---

### Sequence

```
Phase 1 (structural, low-risk):
  Task 1  Root cleanup + .gitignore
  Task 9  gate/mod.rs API contract header

Phase 2 (S-layer migrations):
  Task 2  Kairos → gate
  Task 3  Techne consolidation → agent techne
  Task 6  Redis explicit commands (side task, graph)

Phase 3 (M5 creation):
  Task 4  epi epii command surface
          includes gnosis context rename, vimarsa migration

Phase 4 (M0'-M3' stubs):
  Task 5  Four stub commands

Phase 5 (data and integration):
  Task 7  Hen q_ frontmatter integration
  Task 8  DoV seed heart into core knowing --bake
```

---

### Coverage Summary

```
S/S' families  → covered by epi core/vault/graph/gate/agent/sync
M' families    → covered by epi {subsystem} commands + portal plugins
               quick cross-family ref: epi core knowing (offline)
               live cross-family ref:  epi epii knowing (live services)
               deep family-specific:   epi {subsystem} (nara, epii; future stubs)
Portal         → M' parent runtime; each Mx' domain has plugins
               portal + raw CLI = two access paths to the same M' layer
```
