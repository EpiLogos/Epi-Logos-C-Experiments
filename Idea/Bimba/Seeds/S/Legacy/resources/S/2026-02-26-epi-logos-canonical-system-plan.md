# Epi-Logos: Canonical System Architecture & Development Plan

> **Status**: Canonical Reference — supersedes all fragmented planning docs for architecture and development sequencing.
> **Date**: 2026-02-26 (updated 2026-02-28)
>
> **For Claude / Dev Agents implementing code**: Read `docs/plans/2026-02-28-subagent-development-heuristic.md` FIRST. It tells you how to orient, what the current codebase state means (existing code = pseudo-code in progress), and how to proceed by coordinate stipulation. This document is the architecture map; the heuristic is the operating guide.
>
> **Primary Source of Truth for all contracts and wiring details**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` — when anything is ambiguous, that doc answers it. This canonical plan defers to it.

---

## CRITICAL: Named Functions, Not Separate Systems

**This is the most important principle in the codebase.** Pre-generated code in this project systematically failed by treating differently-named modules (Janus, Chronos, Kairos, Moirai, Aletheia, etc.) as *separate systems* requiring complex interoperability bridges, integration contracts, and E2E proof chains between them.

**This is categorically wrong.**

These names designate **specific, well-planned functions** within an already-integral design. The entire system — epi-claw → ta-onta → PI agent layer — was designed holistically. The functional relationships are already considered. There are no surprise integration problems to solve between them.

**The correct mental model when encountering a module name**:
> "What function does this name designate in the integral system?"

**NOT**:
> "How does this system communicate with the other systems? What integration contract do I need?"

**Concrete examples of the wrong reasoning (do not repeat)**:
- "Janus needs to integrate with Chronos" → Wrong. Janus IS the subagent Chronos spawns for temporal boundary execution. It's a named function within Chronos's operational scope, not a peer system.
- "Moirai needs three separate orchestration paths" → Wrong. Moirai is the CF2 cluster. The CF code `(0/1/2)` *defines* its internal complexity (3 positionally-assigned roles). It's invoked as a unit.
- "Kairos needs an E2E integration proof with Janus" → Wrong. Kairos tools are invoked within the session that Chronos spawns. The `kyrekeion` package provides those tools. No inter-system contract needed.
- "Aletheia needs complex wiring to Anima" → Wrong. Aletheia IS a mode of Anima, accessible via registered tools and the 6-subagent apparatus. The wiring IS the tool registration.

**When in doubt**: the names in this system are coordinate-semantic designations of function within a coherent whole. Read the VAK spec and harmonization doc before assuming any integration complexity.

---

## How to Read This Document

This file is the **pattern file** — it exists so any AI agent (or human) can navigate the system without reading everything. It is not a code inventory. It does not describe what has been built. It defines:

1. **Module locations** — where in the filesystem each concern lives
2. **Module interfaces** — what each module exposes (the simple, controllable API)
3. **Module intent** — why each module exists (its telos in the paradigm)
4. **Authority chain** — which planning docs define each module's deeper contracts

### The Deep Modules Principle

Every module in this system is a **graybox**: a large implementation hidden behind a simple, intentional interface. The interface is designed by the architect (human + this doc). The implementation is delegated to the AI.

**As an agent reading this**:
- Read the interface to understand what a module does
- Read the authority docs to understand the contracts
- Do NOT read all implementation files to understand the system — that defeats the purpose
- The file tree shows WHERE things live, not a file-naming prescription

### Progressive Disclosure

The structure of this document mirrors the coordinate system itself:
- **Runtime home** (PI/S, S4/S4', S3/S3') — the coarsest level: PI/S = PI agent extensions (`.pi/extensions/`); S4/S4' = epi-claw gateway + VAK; S3/S3' = ta-onta plugin + domains
- **Coordinate** (S0, S1', S3-2', etc.) — the module
- **Submodule** (S0-0, S0-1, etc.) — further nesting, open to depth as needed

An agent should read until it has enough context — stop when you understand the interface, not when you've read every line.

---

## Module Nesting Philosophy

The coordinate system defines the module nesting. This is not arbitrary — the file structure **IS** the mental map.

```
S (parent — explicit/technical)
├── S0  (terminal)
│   ├── S0-0  (CLI tool subset A — open to further nesting)
│   └── S0-1  (CLI tool subset B — open to further nesting)
├── S1  (obsidian)
├── S2  (graphdb)
├── S3  (harness)
├── S4  (gateway)
└── S5  (external)

S' → s_i (parent — implicate/QL-augmented)
├── S0' (ql_types)
├── S1' (ql_obsidian)
│   ├── S1'-0  (filesystem ops subset — open to further nesting)
│   └── S1'-1  (frontmatter subset — open to further nesting)
├── S2' (ql_graph)
├── S3' (ta_onta loader)
├── S4' (vak_system)
└── S5' (automations)
```

**Nesting rules**:
- Current plan: mostly depth 1 (S → Sx) with a few depth-2 submodules within each Sx
- Depth 2 (Sx → Sx-y) is the primary expansion surface — add submodules when a concern is distinct enough to have its own interface
- Depth 3+ is reserved for genuinely nested coordinate semantics (e.g., S3-0' within S3' domain layer)
- Every level has an `index.ts` that exposes only the module's public interface — nothing leaks through without going through the index

**Path-safe prime encoding**: `'` → `i` in all filesystem tokens (S' → `s_i`, S0' → `s0_i`, etc.)

---

## Authority Stack (Priority Order — Higher Wins on Conflict)

> **THE PRIMARY SOURCE OF TRUTH for all implementation details, wiring contracts, filesystem ontology, runtime contracts, session semantics, graph relation law, and e2e scenarios is:**
>
> **`docs/plans/2026-02-22-bimba-data-foundation-harmonization.md`**
>
> When any detail is unclear, ambiguous, or in conflict between docs: read the harmonization doc. It wins. This document is the navigation/architecture map; the harmonization doc has the contracts.

1. **`docs/plans/2026-02-22-bimba-data-foundation-harmonization.md`** — **PRIMARY SOURCE OF TRUTH**. Shared contracts, filesystem ontology, runtime wiring contracts, session naming centralization, gate matrix, NOW lineage model, Redis tier model, relation law operational implications, e2e scenario blueprints.
2. **`Idea/epi-claw/extensions/ta-onta/PLAN.md`** — relation law, coordinate/form/frontmatter/system contract, canonical graph schema (canonical law source — harmonization doc imports from here)
3. **`Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`** — VAK system dynamics, CF cluster semantics, 12-agent roster, Pleroma/obra superpowers fork identity, Technē substrate commands, CFP thread types
4. **`Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/ta-onta-anima-superpowers-vak-integration-spec.md`** — Anima+Aletheia VAK integration specifics, Pleroma proxy skill framework, Technē spawn/relay
5. **This document** — architecture navigation map, module locations, interface definitions, development sequencing. Read this to know WHERE things live; read #1-4 for HOW they work.
6. **PRD: `docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json`** — full US contract, acceptance criteria, dependencies (53 stories)
7. **PI harness: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`** — deep PI/OpenClaw extension scope, agent-team/agent-chain port/mod specifics
8. **Deep QL tranches**: `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-*.md` — deep mechanics/wiring implementation guidance
9. **FR Layer Assignment**: `docs/plans/2026-02-27-fr-layer-assignment-full.md` — full FR tabulation per module with runtime home, push-down clarifications, NFR cross-system table (harmonized against #1-4)

**Architecture diagrams** (`Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/`):
- **Primary S/S' layer map**: `01-stack-layer-map-s-and-s-prime.mmd` ← canonical visual reference
- Capability ownership: `02-capability-ownership-matrix.mmd`
- Module topology: `03-s3x-s4x-module-topology.mmd`
- Runtime interaction: `04-runtime-interaction-topology.mmd`
- Day/NOW/session lineage: `05-day-now-session-lineage-artifacts.mmd`
- CLI/TUI traceability: `06-s0-cli-tui-traceability-map.mmd`

---

## The Three Runtime Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   LAYER 1 — PI AGENT LAYER     →  .pi/extensions/s/ and s_i/   │
│   LAYER 2 — EPI-CLAW LAYER     →  extensions/ta-onta/          │
│   LAYER 3 — TA-ONTA DOMAINS    →  extensions/ta-onta/modules/  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Layer 1 (PI Agent — S / S')** — raw and QL-augmented technical capabilities. Two paradigmatic extension trees that provide everything the layers above consume. No semantic doctrine lives here — only primitives and their QL interpretations.

**Layer 2 (Epi-Claw Plugin Shell)** — lifecycle integration, shared contracts, no-bypass enforcement. The connective tissue between Layer 1 primitives and Layer 3 doctrine. Does not own raw capabilities.

**Layer 3 (Ta-Onta Plugin Domains)** — semantic doctrine for each coordinate domain (S3-0' through S3-5'). Owns *what things mean*, not *how they work mechanically*. All mechanics route up through Layer 2 → Layer 1.

---

## Paradigmatic Nature of S and S'

S and S' are **paradigmatic extension pairs** — the structural patterns that organize ALL capabilities across the system. This is not a naming convention; it is an ontological distinction.

| Aspect | S (Unprimed) | S' (Primed / `s_i`) |
|--------|-------------|---------------------|
| **Level** | Explicit | Implicate |
| **Nature** | Objective technologies | Philosophically augmented specifications |
| **What it provides** | Raw technical capabilities | QL/coordinate-aligned interpretations |
| **Relationship** | The base stack layers as-they-are | The paradigm OVER the base |
| **Interface character** | Function-centric (do X) | Contract-centric (X means Y in our paradigm) |

S makes available the explicit technologies — the tools as they are.
S' provides the implicate framework — the technologies as they *mean* within the QL paradigm.

Together: S is the explicit ground, S' is the implicate interpretation. Every raw capability (Sx) has a corresponding QL interpretation (Sx'). Neither is complete without the other.

---

## Layer 1: PI Agent Extensions (`.pi/extensions/`)

### Module Location Map

This tree shows WHERE modules live. It is a navigation aid, not a file-naming prescription. Every `index.ts` is the module's public interface — what it exposes to the rest of the system. Submodules under `modules/` are the hidden implementation.

```
.pi/extensions/
│
├── s/                              (S parent — explicit/technical capabilities)
│   ├── index.ts                    ← S public interface (aggregates S0–S5)
│   └── modules/
│       ├── terminal/               (S0 — CLI/TUI primitives)
│       │   ├── index.ts            ← S0 public interface
│       │   └── modules/            ← S0 implementation (hidden)
│       │       └── cli_tools.ts    (open to S0-0, S0-1 submodules as needed)
│       ├── obsidian/               (S1 — Obsidian CLI service)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── obsidian_cli.ts
│       ├── graphdb/                (S2 — Neo4j + Redis raw access)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── neo4j_redis.ts
│       ├── harness/                (S3 — PI agent harness primitives)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── pi_harness.ts
│       ├── gateway/                (S4 — Epi-claw runtime/session management)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── epiclw_runtime.ts
│       └── external/               (S5 — external API access)
│           ├── index.ts
│           └── modules/
│               └── external_apis.ts
│
├── s_i/                            (S' parent — implicate/QL-augmented)
│   ├── index.ts                    ← S' public interface (aggregates S0'–S5')
│   └── modules/
│       ├── ql_types/               (S0' — QL type system and coordinate grammar)
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── coordinate_validator.ts
│       │       └── type_definitions.ts
│       ├── ql_obsidian/            (S1' — QL-aligned Obsidian operations)
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── ql_types.ts
│       │       ├── filesystem_ops.ts
│       │       ├── frontmatter_schema.ts
│       │       ├── canvas_moc.ts
│       │       ├── bimba_pratibimba_forms.ts
│       │       ├── plugin_handling.ts
│       │       └── day_now.ts
│       ├── ql_graph/               (S2' — coordinate-aware graph/cache)
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── ql_schema.ts
│       │       ├── redis_cache.ts
│       │       └── now_dynamics.ts
│       ├── ta_onta/                (S3' — ta-onta plugin loader / svabhāva)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── plugin_loader.ts
│       ├── vak_system/             (S4' — VAK orchestration and context frames)
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── vak_orchestration.ts
│       │       └── context_frames.ts
│       └── automations/            (S5' — QL-augmented automation rules)
│           ├── index.ts
│           └── modules/
│               ├── automation_rules.ts
│               └── api_integrations.ts
│
└── (non-coordinated extensions — do not reorganize into S/S' yet)
    ├── diff.ts
    ├── files.ts
    ├── obsidian.ts          (migration source for s/modules/obsidian/)
    └── pi-vs-claude-code/   (port/mod source for s/modules/gateway/ primitives)
```

---

### S Layer — Explicit Technical Capabilities

#### S0 | Terminal (`s/modules/terminal/`)

**Telos**: The raw terminal surface. Provides all CLI/TUI tool access as first-class primitives for the system — the foundation on which all external tool interaction is built. No semantic doctrine. No coordinate awareness. Just the primitives.

**Public Interface** — what `s/modules/terminal/index.ts` exposes:
- Native PI/OpenClaw CLI commands (agent/tool/session invocation surface) — S0-0
- Ralph/TUI execution flows (operator orchestration surface for terminal-level agent/task execution) — S0-1
- External terminal runtime surfaces (tmux/mprocs launcher hooks via approved native/PI primitives) → US-026 — S0-2
- Native cron service / scheduler (native scheduler surface; integrates with hook runner) — S0-3
- Credential executor boundary (`${ENV}` + `op://...` materialization seam for secret injection) — S0-4
- Hook observability output channels (raw terminal-level telemetry emission)
- Shell/process primitives (no semantic wrapping)
- Filesystem + vault IO root surfaces (raw file/vault access; S1/S1' add Obsidian semantics)

**Hides** (internal implementation — delegate to AI):
- Process lifecycle management details
- Shell quoting/escaping mechanics
- Output parsing and buffering internals
- Cron scheduling trigger internals (interfaces with native cron hook runner)

**Delegates to**: Nothing at Layer 1 — this is ground-floor

**Authority**: `06-s0-cli-tui-traceability-map.mmd` for full S0 tool surface traceability (contains S0p subgraph enumerating all surfaces above)

**Module nesting open to**: S0-0 (native PI/OpenClaw CLI), S0-1 (Ralph/TUI surfaces), S0-2 (external tmux/mprocs), S0-3 (native cron), S0-4 (credential executor) — expand as needed

---

#### S1 | Obsidian (`s/modules/obsidian/`)

**Telos**: Obsidian CLI as a raw shared service. Makes vault read/write/watch operations available to the entire system as infrastructure — no coordinate meaning applied here, no path opinions, no semantic type system. Just vault access.

**Public Interface** — what `s/modules/obsidian/index.ts` exposes:
- Vault connection and communication (IPC/CLI)
- Raw CRUD: create, read, update, delete, move vault notes
- File event emission (raw vault filesystem events)
- Frontmatter read/write (raw YAML — no schema enforcement at this layer)
- Search (content + metadata — raw results, no ranking)
- Smart Connections pool access (raw — Aletheia provides semantic consumption)
- Daily note / now-file operations (raw — no Day/NOW doctrine here)

**Hides**:
- obsidian-cli protocol details and argument construction
- Vault path inference and connection retry logic
- Raw plugin IPC mechanics

**Delegates to**: Nothing at Layer 1 — pure infrastructure

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §Obsidian CLI shared service

---

#### S2 | GraphDB (`s/modules/graphdb/`)

**Telos**: Neo4j + Redis as raw shared infrastructure. The combined GraphRAG substrate exposed as primitives — connection management, query execution, key-value store operations. No coordinate semantics. No cache tier opinions. Just database access.

**Public Interface** — what `s/modules/graphdb/index.ts` exposes:
- Neo4j: driver connection/session/transaction management
- Neo4j: Cypher query execution (raw — no schema enforcement)
- Redis: connection, key-value, pub/sub operations (raw)
- Health/retry primitives for both backends

**Hides**:
- Driver connection pooling details
- Retry backoff and circuit-breaker logic
- Low-level protocol handling

**Delegates to**: Nothing at Layer 1

**Important**: GraphRAG = combined Neo4j + Redis (not Neo4j-only). S2 exposes both. S2' (`ql_graph`) gives them coordinate-aware semantics. Do not use S2 directly from Layer 3 — route through S2'.

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §GraphRAG combined substrate

---

#### S3 | Harness (`s/modules/harness/`)

**Telos**: The native PI agent runtime extension surface. Provides all hook registration, PAI guidance, and learning pipeline primitives that make ta-onta a *native* extension of the PI/OpenClaw runtime — not a parallel system bolted alongside it.

**Public Interface** — what `s/modules/harness/index.ts` exposes:
- Native hook registration (`agent:bootstrap`, `session:start`, `session:stop`, custom hooks)
- Native hook invocation flow (the only valid hook channel — no parallel event buses)
- PAI (PI Agent Interface) guidance primitives
- Learning pipeline integration points
- Hook/event observability envelope primitives → US-045
- Deep task-discipline and execution-guardrail primitives → US-049
- Prompt-profile composition seam (beyond `full|minimal|none`) → US-044

**Hides**:
- Native hook registration mechanics (PI runtime internals)
- Profile composition resolution details
- Learning pipeline routing details

**Delegates to**: Native PI/OpenClaw runtime (this module wraps/extends it, does not replace it)

**Non-bypass rule**: All ta-onta runtime behavior must route through these native hook surfaces. Missing capability = extend this module, not create a side channel.

**Authority**: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`

---

#### S4 | Gateway (`s/modules/gateway/`)

**Telos**: The native Epi-claw runtime gateway. Provides subagent spawning, agent-team coordination, session lifecycle management, and the M'/Pratibimba bridge as first-class primitives. The orchestration spine of the entire system runs through here.

**Public Interface** — what `s/modules/gateway/index.ts` exposes:
- Native `sessions_spawn` and announce/return/handoff paths
- Agent-team configuration and routing primitives
- Agent-chain orchestration primitives
- `pi-pi` agent primitive for PI-native agent definition patterns — **`pi-pi` is guidance/reference (six-section identity: Rupa/Ontology/Frame Contract/Temporal/Capability/Sattva), NOT auto code-generation**; agents are materialized in `.pi/agents/pi-ql-*.md` following pi-pi guidance
- Session-propagation spine foundation → US-034
- **Native orchestration spawn/session metadata envelope** → US-043:
  - `sessionId` (unique identifier), `sessionKey` (OpenClaw format: `agent:<scope>:main` / `agent:<scope>:subagent:<token>`)
  - `parentSessionId` + `parentSessionKey` (lineage ancestry for child spawns)
  - `invocationSurface` ("native-spawn" / "native-hook" / "cron-triggered" / etc.)
  - `qlWorkflowId`, `qlChainId`, `qlTeamId` (reflection-family routing context)
- Renderer/modelContext bridge conventions (M' ↔ Epi-Claw) → US-050
- PI-native subagent spawning as first-class harness capability → US-053
- PI multi-agent extension primitives (agent-team/agent-chain/cross-agent/pi-pi) → US-047

**Hides**:
- Native session ID generation and naming details
- Agent-team manifest resolution internals
- IPC/RPC protocol to M' Pratibimba layer

**Delegates to**: S3/Harness (for lifecycle hooks), native PI runtime (for spawn mechanics)

**M'/Pratibimba bridge**: This module owns the communication protocol with the Pratibimba electron app (M' layer). All data between Epi-Claw and `epiClawGatewayStore` passes through this module's bridge interface.

**Authority**: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md` + `.pi/extensions/pi-vs-claude-code/` (port/mod source)

---

#### S5 | External (`s/modules/external/`)

**Telos**: Raw external API access. The thinnest layer in the system — pure API mechanics with no state ownership, no scheduling, no coordinate semantics. Receives calls from S5' (which provides the QL context) and executes them.

**Public Interface** — what `s/modules/external/index.ts` exposes:
- **Notion API client** (raw CRUD on Notion objects) — **optional/feature-flagged for core e2e** (not required to prove integrated runtime core; bounded and non-blocking until explicitly promoted)
- **Telegram bot API** (send, react, edit, delete messages):
  - Receives structured notification payloads from Chronos (via S5' → S5 dispatch)
  - Payload includes lineage: `sessionId`, `parentSessionId`, `dayId`, `nowId`, `runId`, `invocationSurface`
  - Workflows that emit via Telegram: `six_am_bootstrap`, `temporal_health`, `mobius_return`, `rollup_execute`
  - Non-throwing on dispatch failure: failures emit telemetry in `details.dispatch` (status=failed, error details)
- **n8n/workflow builder HTTP connectors** (open/underspecified — extensibility placeholder; trigger patterns and workflow semantics not yet defined in authority docs)
- Generic webhook/HTTP integration surface

**Hides**:
- API authentication details
- Request/response serialization
- Rate limiting and retry logic

**Delegates to**: Nothing at Layer 1 — raw HTTP/API calls only

**Boundary rule**: S5 asks "how do I call this API?". S5' asks "which API should I call and why?". Chronos asks "when?". Keep these separate.

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §External integrations

---

### S' Layer — Implicate QL/Coordinate-Augmented Capabilities

The S' layer gives coordinate meaning and paradigmatic semantics to every S layer capability. Each Sx' module corresponds exactly to Sx — it is the QL interpretation of that raw capability.

---

#### S0' | QL Types (`s_i/modules/ql_types/`)

**Telos**: The foundational grammar of the entire paradigm — both a type validator AND an orchestration grammar. Every other module that uses coordinates, talks about QL semantics, or needs to validate coordinate strings depends on this module. It is the single source of truth for what coordinates ARE and what they MEAN for routing. The reflection/runtime coordinate family (CPF/CT/CP/CF/CFP/CS) is the interpretive grammar for invocation routing and orchestration — not merely a validation concern.

**Public Interface** — what `s_i/modules/ql_types/index.ts` exposes:

From `coordinate_validator.ts`:
- Canonical coordinate parsing: `^([CPMSLT])(\d+)(?:[-.](\d+))*(?:\.\([^)]+\))?(')?$`
- Coordinate type validation for the foundational family — **canonical order: C/P/L/S/T/M** (#0=C Ground, #1=P Material, #2=L Operative, #3=S Formal, #4=T Contextual, #5=M Synthetic); existing code has M and L swapped — this is the authoritative correct order
- Reflection/runtime coordinate family validation (CPF/CT/CP/CF/CFP/CS) — canonical order matches array `["CPF","CT","CP","CF","CFP","CS"]` (existing code already correct)
- Path-safe inverse encoding: `'` → `i` in all path tokens, property keys, cache keys
- Context frame parsing with parentheses (e.g., `M1-3-4.(0000)`, `S2.(session-123)`)
- Prime/Pratibimba marker detection and normalization — **`prime: boolean` is semantically insufficient**; type as `isImplicate: boolean` minimum, or `MobiusAxis` type to carry inversion semantics (a prime coordinate enters the implicate order — it is a Möbius inversion, not just a boolean flag)
- Coordinate range and inner-position parsing (`M2-5` range, `M4.4` inner position)

From `type_definitions.ts`:
- TypeScript parity models for Python canonical references → US-041
  - **Alias normalization**: parity layer normalizes Python `snake_case` field names to TS `camelCase` (e.g., `query_timeout_ms → queryTimeoutMs`, `key_prefix → keyPrefix`, `default_ttl → ttlSec`, `file_path → filePath`, `cache_ms → cacheMs`, `neo4j_ms → neo4jMs`, `total_ms → totalMs`)
- Foundational coordinate family types — **canonical order: C, P, L, S, T, M** (toroidal 4g+2g: C=#0 void-ground, P=#1 material, L=#2 operative/efficient, S=#3 formal/pattern, T=#4 contextual, M=#5 synthetic/final; M is open-ended because synthesis is unbounded); **fix required**: existing code has M and L swapped
- Reflection coordinate family types (CPF, CT, CP, CF, CFP, CS) — the shared runtime ontology (six distinct families, not sub-types of one); canonical array `["CPF","CT","CP","CF","CFP","CS"]` matches CX alignment (CPF=C0, CT=C1, CP=C2, CF=C3, CFP=C4, CS=C5)
- QL coordinate-kernel runtime payload contracts → US-042
- CT/CT' type family — **7 frames total** (CT4a and CT4b are structurally distinct; agents frequently confuse them — encode explicitly):
  - **CT4b = CT' parent** (fractal meta-frame / frame-of-frames): CF gate = `(4.0-4.4/5)` → Psyche (L4); includes ALL CT content types {0,1,2,3,4,5}; `CT_PARENT_FRAME = "CT4b"` const encodes parent status explicitly
  - **CT4a** = distinct integration-preview frame: CF gate = `(4.5/0)`; includes {CT4, CT5, CT0} non-cumulatively; no primary agent assigned
  - CT0'..CT3', CT5' = 5 standard cumulative frames: CT0'={0}, CT1'={0,1}, CT2'={0,1,2}, CT3'={0,1,2,3}, CT5'={5,0} (Möbius)
  - `CT_CF_GATE` const — maps each CTLevel to its available positions; type-checked `satisfies Record<CTLevel, ...>`; prevents arbitrary 6-fold template imposition
  - `CTX = CT(x)` notation means "any concrete CT instance" in prose
  - CT-MEF Lens mapping: CT0 Relational ↔ L0/L5', CT1 Definitional ↔ L1/L4', CT2 Operational ↔ L2/L3', CT3 Pattern ↔ L3/L2', CT4 Contextual ↔ L4/L1', CT5 Integrative ↔ L5/L0'
  - CT4b' has **dual profiles**: `day_parent` (CT4b' authority artifact = daily-note.md) and `now_child` (CT4b' invocation artifact = now.md per subsession)

**Hides**:
- Regex compilation and caching
- Multi-atom coordinate parsing internals (e.g., `C3-P2-M2'` splitting logic)
- Parity test fixture generation and alias normalization registry

**Delegates to**: Nothing — this is the foundation all others build on

**Canonical Python references** (for parity):
- `Idea/Pratibimba/System/Subsystems/Anuttara/models/coordinate_types.py`
- `Idea/Pratibimba/System/Subsystems/Parashakti/graph/graphrag_retriever.py`

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §QL coordinate system + `docs/plans/2026-02-28-coordinate-type-system-and-reflection-families.md` (validated type system reasoning — canonical ordering, CT4a/CT4b, CT_CF_GATE const design, MobiusAxis type)

---

#### S1' | QL Obsidian (`s_i/modules/ql_obsidian/`)

**Telos**: Gives coordinate semantics and paradigmatic meaning to all Obsidian/filesystem operations. Where S1 provides raw vault access, S1' provides *what that access means* — which paths are canonical, which are temporal, what constitutes a valid artifact, how the Day/NOW lifecycle maps to vault structure.

**Public Interface** — what `s_i/modules/ql_obsidian/index.ts` exposes:

From `ql_types.ts`:
- QL-typed Obsidian entity shapes (World form, Seeds entity, Types artifact, Thought, Day, NOW)
- Typed artifact class definitions (Canonical Form, Canvas Artifact, Error Class)

From `filesystem_ops.ts`:
- Canonical path resolution for: `Idea/Bimba/World`, `Idea/Bimba/Seeds`, `Idea/Bimba/World/Types`, `Idea/Empty/Present`, `Idea/Thought`
- **Day/NOW path contract**:
  - Day folder: `Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md` (CT4b' day_parent profile)
  - NOW folder: `Idea/Empty/Present/{DD-MM-YYYY}/{YYYYMMDD-HHmmss}-{sessionId}/now.md` (CT4b' now_child profile)
  - **Naming rule**: NOW folders are datetime-prefixed — NO sequential counters (`now-1/`, `now-2/` are FORBIDDEN)
  - Each bounded execution (subsession spawn) creates its own NOW folder under its Day parent
- **Nara live docs** (in Day folder under `nara/` subfolder — Electron app user data, NOT prompt injections):
  - `nara/FLOW.md` — daily execution flow record
  - `nara/DREAMS.md` — aspirational/vision artifacts
  - These are CT0/CT3 invocations respectively (not generic working files)
- Residency rule enforcement: Bimba (canonical + enduring) vs Present (temporal/active) vs Pratibimba (reflective/archived)
- Promotion lifecycle gate: Seeds → Types → World (checked)
- Path uniqueness and link-safety validation
- Workspace/config-driven paths (no hardcoded host paths)
- **Archive destination**: `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/` (entire Day folder moves here on rollover)

From `frontmatter_schema.ts`:
- **Canonical coordinate-key schema** (authority: ta-onta `PLAN.md`) — format `{x}_{n}_{semantic}`:

```yaml
# P: Position (6-fold QL)
p_0_grounds: ["[[Node]]"]          # grounding references
p_1_title: "Artifact Name"         # definitional
p_1_definitions: ["key: value"]    # definitional supplementary
p_2_operations: ["action"]         # operational
p_2_skills: ["[[SkillRef]]"]       # operational supplementary
p_3_patterns: ["pattern"]          # pattern
p_4_temporals: "2026-02-22"        # temporal
p_4_spatials: "[[SessionRef]]"     # spatial
p_5_integrations: ["[[Ref]]"]      # integrative
p_5_crystallizations: ["[[Form]]"] # crystallization (prime direction)

# Other coordinate families:
c_0_links_to: "[[Node]]"           # C0: category/relation
c_4_classifies: "type-name"        # C4: categorization
m_3_archived_to: "[[Path]]"        # M3: archive relation
m_5_mobius_return: "[[Next]]"      # M5: synthesis/return
s_0_source: "git:sha"              # S0: source provenance
s_1_file_path: "Idea/..."          # S1: vault path
s_2_graph_id: "uuid"               # S2: graph identifier
s_3_pack: "ta-onta"                # S3: plugin/pack
s_4_session: "session-id"          # S4: session binding
t_1_extracted_from: "[[Session]]"  # T1: thought provenance
t_3_duplicates: "[[OtherThought]]" # T3: duplication relation
t_5_crystallized_to: "[[Form]]"    # T5: crystallization
```

- **Deprecated forms — REMOVE on canonical writes** (never perpetuate):
  - `coordinate:` standalone field → REMOVE
  - `ql_position:` → REMOVE
  - `pos_*` forms (e.g., `pos0_grounds`) → rewrite to canonical `p_*` form
  - `ctx_*` → map to appropriate `c_*` or `ct_*` key
- CT/CT' template-lens artifact contract types: CTX = CT(x) notation, CT4a/CT4b split
- Coordinate key law consumption (no local reinvention)
- `Sx'Cx` content structure rule (embedded in `Sx'.md`, not standalone `Sx'Cx.md`)
  - **Structure**: `Sx'Cx` is a folder + `.canvas` + `.md` (CT5 synthesis) trio for bimba/world types. C0–C5 content is already frontmatter in canonical form; `/world` root is flat for canonical Sx'Cx forms; `/types` organises incubating Neo4j label hierarchy

From `canvas_moc.ts`:
- `.canvas` extension enforcement as canonical process/MOC/workspace artifact type
- Error class detection: `.canvas.md` (do not create; deprecation pathway)
- Canvas artifact reference management within MOC structure

From `bimba_pratibimba_forms.ts`:
- S1'Cx Bimba-Pratibimba form contract shapes
- Canonical World promotion gate logic
- `Sx'Cx` embedding rule enforcement

From `plugin_handling.ts`:
- Obsidian plugin lifecycle interface (install, enable, disable, reload)
- Plugin coordination contracts (Smart Connections, Dataview, etc.)
- Memory boundary contract with Khora queue (prevents race conditions)

From `day_now.ts`:
- Day = temporal parent context (CT4b' lens); carries 4.0–4.5 fractal structure
- NOW = per-subsession child artifact (one per native session spawn)
- Day/NOW lineage tracking and linking (NOW links back to parent Day)
- Chronos thread continuity across day transitions
- `now.md` per-subsession rule (not a single undifferentiated global file)

**Hides**:
- Path construction string manipulation details
- Frontmatter YAML parse/emit internals
- Plugin IPC state management

**Delegates to**: S1/Obsidian (for raw vault operations), S0'/QL Types (for coordinate validation)

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §Canonical Filesystem Ontology + §Day/NOW Temporal Contract

---

#### S2' | QL Graph (`s_i/modules/ql_graph/`)

**Telos**: Makes the Neo4j + Redis substrate coordinate-aware. Where S2 exposes raw graph and cache operations, S2' defines what those operations *mean* in QL terms — which node types correspond to which coordinates, how cache tiers map to artifact volatility, how the NOW/session lifecycle is represented in the graph.

**Public Interface** — what `s_i/modules/ql_graph/index.ts` exposes:

From `ql_schema.ts`:
- Neo4j entity and relation schema for QL coordinate types (authority: Python canonical refs + ta-onta PLAN.md relation law)
- TypeScript parity for `Parashakti/graph/graphrag_retriever.py` payload shapes → US-041:
  - `QlGraphRagCapabilityConfigEnvelope` (Neo4j + Redis combined config)
  - `QlGraphRagRetrievalRequestEnvelope` (query mode, limit, correlation, cache controls)
  - `QlGraphRagRetrievalResultEnvelope` (items[], cache metadata, timings, diagnostics)
- Coordinate entity nodes and relation law (from ta-onta PLAN.md)
- GraphRAG combined substrate interface (Neo4j + Redis) → US-046
- **Combined retrieval algorithm** (cache-miss flow): Try Redis → on miss: Neo4j Cypher query → write result back to Redis
- **`__qlObs` observable error envelopes**: emitted on cache/graph failures (non-blocking; failures emit telemetry rather than throwing — caller observes the channel)
- **Vector search is NOT a S2' concern** — lives in Aletheia (`taonta.aletheia.vector_search` is a deprecation target; use Hen GraphRAG retrieval path instead)

From `redis_cache.ts`:
- **4-tier cache model by artifact residency** (World > Seeds > Present > Thought):
  - World: longest TTL (stable canonical forms)
  - Seeds: medium TTL (evolving, incubation content)
  - Present: per-session TTL (Day/NOW context)
  - Thought: shortest TTL / ephemeral (transient runtime output)
- Session/state namespaces for Day/NOW/thought lineage
- Cache key generation: `{scope}:{coordinate_path_safe}:{content_hash}` — `'` → `i` encoding via S0' coordinate_validator
- **Redis pub/sub is raw infra (S2/GraphDB) only** — NOT for ta-onta orchestration; session lineage propagates via native hooks, not Redis signals

From `now_dynamics.ts`:
- Graph dynamics for NOW/session artifacts
- Session-to-graph lineage: every NOW bound to a Day parent node (no floating global NOW in graph)
- Parent/child encoding: `session_id` → NOW node; `parent_session_id` → Day node
- Temporal ordering across day transitions (Chronos cutover reflected in graph state)

**Hides**:
- Cypher query construction
- Redis key namespace prefixing logic
- Graph traversal optimization internals
- `__qlObs` emission internals (callers see the observable interface, not channel mechanics)

**Delegates to**: S2/GraphDB (for raw queries/cache ops), S0'/QL Types (for coordinate encoding)

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §GraphRAG substrate + `QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-2.md` (US-046, US-041)

---

#### S3' | Ta-Onta Loader (`s_i/modules/ta_onta/`)

**Telos**: The bridge between Layer 1 capabilities and the ta-onta plugin. S3' *is* ta-onta from the PI layer's perspective — svabhāva (self-nature). This module instantiates the plugin, wires it to Layer 1 surfaces, and establishes the lifecycle hooks that make ta-onta a native Epi-Claw extension.

**Public Interface** — what `s_i/modules/ta_onta/index.ts` exposes:

From `plugin_loader.ts`:
- Plugin registration with Epi-Claw runtime
- Domain module instantiation order (Khora first — provides workspace/config for others)
- Lifecycle hook wiring: `agent:bootstrap` → Khora; `session:start/stop` → Anima/Chronos
- S' dependency injection into plugin (QL types, QL obsidian, QL graph, VAK system)

**Dependency chain** (what the loader wires together):
```
s_i/modules/ta_onta/index.ts
    ├── consumes: s_i/modules/ql_types/      (coordinate validation)
    ├── consumes: s_i/modules/ql_obsidian/   (Obsidian operations)
    ├── consumes: s_i/modules/ql_graph/      (QL graph schema)
    ├── consumes: s_i/modules/vak_system/    (VAK/context frames)
    └── instantiates: khora → hen → pleroma → chronos → anima → aletheia
```

**Hides**:
- Plugin registration protocol details
- Hook binding ordering and dependency resolution

**Delegates to**: All other S' modules (consumes them); all S3-x' domain modules (instantiates them)

**Authority**: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md` + `Idea/epi-claw/extensions/ta-onta/PLAN.md`

---

#### S4' | VAK System (`s_i/modules/vak_system/`)

**Telos**: Gives coordinate semantics to the gateway runtime. Where S4 provides raw session/agent spawning mechanics, S4' defines what those mechanics *mean* in the VAK paradigm — which CF clusters exist, how context frames guide routing, what the reflection coordinate family (CPF/CT/CP/CF/CFP/CS) means operationally.

**Public Interface** — what `s_i/modules/vak_system/index.ts` exposes:

From `vak_orchestration.ts`:
- VAK-defined orchestration semantics (what CF clusters mean, how agents relate)
- 12-agent roster intent: combined Anima + Aletheia CF-cluster definitions → US-052
- Team/chain semantic configuration (routing by reflection coordinate family context)
- CF4a/CF4b split: learning mode (retrieval-first) vs coordination mode (ecosystem assessment)
- Agent team presets: CF0..CF5 organization and Aletheia cluster emphasis
- These are *semantics* — mechanics stay in S4/Gateway

From `context_frames.ts`:
- Reflection/runtime coordinate family (CPF/CT/CP/CF/CFP/CS) — shared runtime ontology (six distinct families)
  - **CPF (S4-0')** — Context Frame Polarity: `(00/00)` = user-engaged/dialogical (→ brainstorming, human gate); `(4.0/1–4.4/5)` = autonomous execution (→ vak-evaluate → anima-orchestration dispatch)
  - **CT (S4-1')** — Content/process primitive typing lens (C1/Form; asks "what type of content?" first — definitional gate; asked BEFORE processing to determine what agent/frame is needed); **7 total frames**: CT0'..CT3', CT4a, CT4b, CT5'; **CT4b = CT' parent** (Psyche/fractal meta-frame, CF(4.0-4.4/5), ALL types); **CT4a** = integration-preview frame (CF(4.5/0), {CT4,CT5,CT0}, no primary agent); CTX = CT(x); CT_CF_GATE + CT_PARENT_FRAME consts (see S0'); CT-MEF Lens mapping (see S0')
  - **CP (S4-2')** — Context Positions (execution plotting / positional emphasis):
    - 4.0 Ground — "What do we have?" (starting condition, thrown context)
    - 4.1 Definition — "What must be true?" (scope, boundaries, requirements)
    - 4.2 Operation — "What is being done?" (work executed, processes run)
    - 4.3 Pattern — "What shape does it take?" (structures, types, templates)
    - 4.4 Context — "Where/when in the larger frame?" (temporal/spatial placement)
    - 4.5 Integration — "What was produced?" (synthesis, outcomes, artifacts)
  - **CF (S4-3')** — Context Frames / constitutional/functional contact modes (cluster codes below); **CF(0000) special rule**: the CF(0000) agent (Nous for Anima; Anansi for Aletheia) does NOT dispatch a task executor — it invokes a fresh-perspective inquiry agent (minimal prior context) to surface assumptions and clear epistemic contamination; output goes to Patient (Psyche) who re-runs vak-evaluate before dispatching the actual CF executor
  - **CFP (S4-4')** — Context Frame Thread Types:
    - CFP0 Base: single task, single executor
    - CFP1 P-Thread: N different tasks → N agents in parallel (independent)
    - CFP2 C-Thread: multi-phase chained execution with validation gates between phases
    - CFP3 F-Thread: 1 task → N agents in parallel → aggregate (fusion / multiple approaches to same goal; used for all-Moirai dispatch)
    - CFP4 L-Thread: long-running execution with stop hooks (Ralph Loop archetype)
    - CFP5 B-Thread: meta-nested orchestration (primary orchestrates, spawns sub-agents internally)
    - Z-Thread: zero-touch automation (cron/heartbeat / conceptual; no human in the loop)
    - **Critical**: P-Thread (CFP1) ≠ F-Thread (CFP3) — different work, different semantics
  - **CS (S4-5')** — Context Sequences (paths through 4.x with Day/Night' directionality):
    - CS0: Full 6-step traverse (4.0→4.5 forward, 4.5→4.0 Night') — Day + Night' Möbius
    - CS1: 2-step quick (4.0↔4.5 → 4.1↔4.4)
    - CS2: 3-step ground→context→operation (adds 4.2↔4.3)
    - CS3: 4-step (adds pattern 4.3↔4.2)
    - CS4: Context-focused (4.0↔4.5 → 4.4↔4.1 → 4.5↔4.0)
    - CS5: Direct synthesis (4.0↔4.5 → 4.5↔4.0)
    - **Direction**: Day = forward (4.0→4.5, building/synthesis); Night' = backward (4.5→4.0, analysis/questioning — NOT a review, a genuinely orthogonal inquiry mode)
- **P' Night' positions** (Night' maps orthogonally to Day CP positions — analysis/questioning mode; traversal order P5'→P4'→P3'→P2'→P1'→P0'):
  - P0' Questions (what don't we know?) → vault: `/Thought/Questions/` — opens the inquiry; generated by P5' Insight (Möbius return)
  - P1' Traces (what evidence exists?) → vault: `/Thought/Traces/` → **Klotho** (Assert)
  - P2' Challenges (what blocks us?) → vault: `/Thought/Challenges/` — surface blockers
  - P3' Patterns (what repeats?) → vault: `/Thought/Patterns/` — recurring forms / The Recurrent / Cycle
  - P4' Discovery (what sources inform?) → vault: `/Thought/Discovery/` → **Lachesis** (Query)
  - P5' Insight (what crystallizes?) → vault: `/Thought/Insight/` → **Atropos** (Reflect)
  - **Moirai routing**: Full Night' pass (CFP3 F-Thread) → Moirai invoked as a unit (CF2 cluster); internal positional routing to Klotho/Lachesis/Atropos is Moirai's concern, not the dispatch caller's
  - **Möbius return**: P5' Insight generates P0' Questions — Night' does not resolve; it opens the next Day cycle
- CF cluster realization (Aletheia-side — VAK-defined) with CF codes:
  - CF code `(0000)` → **Anansi** (orientation, coordinate web, blueprint/present gap; navigates `/empty` vs `/present`)
  - CF code `(0/1)` → **Janus** (temporal envelope, scheduling boundaries, session transitions) — single agent
  - CF code `(0/1/2)` → **Moirai** (CF2 cluster — the CF code `(0/1/2)` *defines* internal complexity: 3 positionally-assigned roles: Klotho [pos 0/Assert], Lachesis [pos 1/Query], Atropos [pos 2/Reflect]; invoked as a unit, primarily by Eros)
  - CF code `(0/1/2/3)` → **Mercurius** (kairos signal transport / qualitative temporal pattern / cross-boundary messaging)
  - CF code `(4.0–4.4/5)` → **Agora** (dual-mode: CF4a = retrieval-first / learning "what already exists?"; CF4b = coordination / ecosystem integration assessment)
  - CF code `(5/0)` → **Zeithoven** (creative advance / self-extension / coordinate-system map evolution — **guarded, explicit invocation only**)
- **12-agent PI-native roster** (mechanics in S4/Gateway; persona semantics in S4'/VAK):
  - Anima 6: `pi-ql-anima-nous`, `pi-ql-anima-logos`, `pi-ql-anima-eros`, `pi-ql-anima-mythos`, `pi-ql-anima-psyche`, `pi-ql-anima-sophia`
  - Aletheia 6: `pi-ql-aletheia-anansi`, `pi-ql-aletheia-janus`, `pi-ql-aletheia-moirai`, `pi-ql-aletheia-mercurius`, `pi-ql-aletheia-agora`, `pi-ql-aletheia-zeithoven`
  - Deep layer owns mechanics (registration, routing); ta-onta/VAK owns persona semantics and doctrinal role interpretation
- Context frame invocation process wiring (6-step VAK-evaluate sequence → Anima-orchestration → CFP-appropriate dispatch → Day/Night' pass if CS requires)
- No module treats CT, CF, CFP, etc. as isolated local enums — all consume this shared map

**Hides**:
- Routing resolution internals
- Team preset serialization
- Context frame resolution precedence details

**Delegates to**: S4/Gateway (for mechanics of routing/spawning); S0'/QL Types (for coordinate family validation)

**Authority**: `Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` + `docs/plans/2026-02-28-coordinate-type-system-and-reflection-families.md` (validated type system — CT4a/CT4b distinction, CT_CF_GATE, all CFP/CS/CF semantic tables, Night' positions)

---

#### S5' | Automations (`s_i/modules/automations/`)

**Telos**: Gives coordinate semantics to external API access. Where S5 provides raw API mechanics, S5' defines *when* and *why* to call them in QL terms — automation rules tied to CF/CS context frames, coordinate-aware routing of notifications, QL-aligned integration policies.

**Public Interface** — what `s_i/modules/automations/index.ts` exposes:

From `automation_rules.ts`:
- Coordinate-aware automation rule definitions
- Trigger/action mappings aligned to CF/CS context frames
- **CPF gating (mandatory)**: S5' MUST evaluate CPF before dispatching any S5 call:
  - CPF=`(00/00)` (user-engaged) → do NOT execute autonomously; surface to Patient/human for decision
  - CPF=`(4.0/1–4.4/5)` (autonomous) → execute automation dispatch
- **Chronos cron notification workflows** (when routing deliveries from Chronos to S5):
  - `six_am_bootstrap` skipped/failure → Telegram delivery via S5
  - `temporal_health` threshold → Telegram alert aggregation → S5
  - `mobius_return` failure → S5 delivery (23:00 and task_completion paths)
  - `rollup_execute` failure → S5 delivery
- Automation rule syntax: **authored at creation time** — rules are self-defined when the automation is built, in response to emerging workflow needs. The VAK relationship (CF/CS code) is what gets defined at that point; there is no pre-specified evaluator registry to design

From `api_integrations.ts`:
- QL-aligned Notion integration (coordinate-structured data in/out) — optional/feature-flagged; schema not yet specified
- n8n workflow coordination with coordinate-aware routing — **open/underspecified** (listed as capability; trigger patterns and workflow semantics TBD)
- Telegram automation (cron-result delivery → US-037; routed from Chronos via native dispatch adapter)

**Hides**:
- Rule evaluation engine internals
- Policy resolution ordering
- Integration protocol-specific details (delegate raw calls to S5)

**Delegates to**: S5/External (for raw API calls); S4'/VAK System (for context frame evaluation); Chronos (for scheduling — "when?")

**Boundary rule**: S5' asks "which API, under what coordinate context, and is it authorized?". S5 asks "how do I send it?". Chronos asks "when?".

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md` §External integrations + automation contracts

---

## Layer 2: Epi-Claw Plugin Layer (`extensions/ta-onta/`)

This layer is the plugin shell. It does NOT own raw technical primitives (those are Layer 1). It owns:
- Native lifecycle integration (no bypass)
- Shared contracts consumed by all domain modules
- Foundation gate enforcement

### Non-Negotiable Rule: Native Surface, No Bypass

> ta-onta must extend native Epi-Claw/OpenClaw/PI infrastructure and deep QL wrappers.
> ta-onta must NOT build parallel bootstrap/pathing/invocation/graph/frontmatter/runtime systems.

Concretely:
- `agent:bootstrap`, `session:start`, `session:stop` → native; Khora adds deltas only, does not replace
- Subagent spawn → native `sessions_spawn`; no plugin-local pseudo-agent systems
- Hook registration/invocation → native Epi-Claw flow; no parallel event buses
- If a capability is missing: extend the native surface (Layer 1); do not side-step it
- Chronos cron jobs must appear as native invocation/lifecycle traffic

### Foundation Gates (Must Pass Before E2E Discharge)

#### Gate 1: Bootstrap Source-of-Truth

- Native bootstrap file loading/hook overrides remain source-of-truth
- Khora may add session-scoped NOW/cache context deltas only
- No plugin-local replacement bootstrap loading
- **Primary owner**: S3-0' Khora
- **US**: US-003, US-005, US-015

#### Gate 2: Shared Path/Workspace Conformance

- No hardcoded/host-specific runtime path fallbacks anywhere
- No legacy global `Present/NOW.md` assumptions in active runtime codepaths
- Chronos and Khora agree on Day/NOW/archive lineage semantics via shared path service
- **Primary owner**: S3-0' Khora + S3-3' Chronos
- **US**: US-003, US-006, US-031

#### Gate 3: Graph/Invocation No-Bypass

- Pleroma/Aletheia/Hen mechanics route through native/deep seams where available
- Plugin semantics remain local; mechanics/contracts/wiring use deep/native surfaces
- **Primary owner**: S3-1' Hen + S3-2' Pleroma + S3-5' Aletheia
- **US**: US-021, US-022, US-040, US-041

**Until Gates 1-3 pass: do not discharge US-017..US-020 as readiness evidence.**

### Shared Contract Surfaces

**Location**: `extensions/ta-onta/modules/shared/`

These are centralized contracts consumed by ALL domain modules. No domain module invents local variants. Defined once here, consumed everywhere.

#### Path Service (`shared/path-service.ts`) — US-003

**Telos**: Single source of truth for all filesystem path resolution in the plugin.

- Canonical Bimba/World/Seeds/Types/Present/Thought path resolution
- Day/NOW pathing and naming (no hardcoded paths)
- Path-safe coordinate encoding (uses S0' `coordinate_validator` for `'` → `i`)
- Residency rule enforcement
- Workspace/config-driven (no host fallback literals)

#### Session Service (`shared/session-service.ts`) — US-031

**Telos**: Single source of truth for session naming, parsing, and lineage propagation.

- Centralized session-key naming/parsing (no per-module string grammars)
- Native `sessions_spawn` / OpenClaw-compatible session key generation
- Parent/child session semantics (Day/NOW lineage propagation)
- Session naming compatible with native subagent detection/handling
- Source of truth for: Day/NOW lineage propagation, observability correlation, breadcrumb generation

#### Normalization (`shared/normalization.ts`) — US-008

**Telos**: Single source of truth for coordinate key and frontmatter normalization.

- Canonical `p` coordinate key normalization (authority: ta-onta `PLAN.md`)
- Deprecated forms (`pos`, `coordinate`, `ql_position`) → normalize to `p` canonical
- Plugin coordinate corrections locked: Anima = `S3-4'`, Aletheia = `S3-5'`
- No module invents local relation-naming variants

#### Janus Envelope (`shared/janus-envelope.ts`) — US-012

**Telos**: Temporal context injection — required precondition for all gate invocations.

- Temporal context injection for gate invocations (Day/NOW/temporal window/provenance)
- Required precondition before any gate reasoning begins
- Provides: current Day ID, active NOW ID, temporal window, session provenance
- Both policy-triggered and LLM-invoked gate calls require this envelope

#### Observability (`shared/observability.ts`) — US-022, US-045

**Telos**: Unified telemetry contract — the system's audit trail across all modules.

- Hook/lifecycle routing observability contract (auditable across integrated system)
- Minimum required fields:
  - `hook_id`, `event_type`, `module`, `phase`
  - `started_at`, `completed_at`, `duration_ms`, `status`
  - `error_code`, `error_message` (on failure)
  - `session_id`, `day_id`, `now_id`, `parent_session_id`
  - `invocation_surface` (native hook / native spawn / cron-triggered / etc.)
- Chronos cron-triggered behavior must appear as native invocation traffic

#### Fail-Fast Policy (`shared/fail-fast.ts`) — US-016

**Telos**: System-wide error policy — no silent failures at contract boundaries.

- Shared error policy across all shared contracts and runtime seams
- No silent degrade on contract violations
- Required-contract paths: fail-fast on error
- Advisory-enrichment paths: explicitly non-blocking with telemetry (must be documented)

### Session-Propagation Spine (End-to-End — One Coherent Chain)

The core runtime wiring. All steps must be implemented. Any gap breaks lineage, breadcrumbs, or lifecycle semantics:

```
native invocation / sessions_spawn (S4 gateway)
    ↓
shared session naming/parsing resolution (shared/session-service.ts) [US-031]
    ↓
Anima Day/NOW child-context binding (modules/anima/) [US-032, US-034]
    ↓
Khora runtime lineage + filesystem persistence (modules/khora/) [US-005, US-032]
    ↓
template invocation/render via Hen contract (modules/hen/) [US-033]
    ↓
native completion/handoff path back to parent context (S4 gateway) [US-034]
```

Design rule: one explicit propagation spine, not duplicated partial implementations.

---

## Layer 3: Ta-Onta Plugin Domains (`extensions/ta-onta/modules/`)

These are the semantic modules. They own **what things mean** (doctrine), not **how they work mechanically** (mechanics live in Layers 1 and 2).

All domains consume Layer 2 shared contracts. All mechanics route through Layer 1 native surfaces.

**Module location map**:
```
extensions/ta-onta/modules/
├── shared/          (Layer 2 shared contracts — consumed by all below)
├── khora/           (S3-0' — Foundation)
├── hen/             (S3-1' — GraphRAG)
├── pleroma/         (S3-2' — Pattern orchestration)
├── chronos/         (S3-3' — Time/sessions)
├── anima/           (S3-4' — Holographic runtime)
└── aletheia/        (S3-5' — Learning/feedback)
```

---

### S3-0' | Khora — Foundation (`modules/khora/`)

**Coordinate**: S3-0'
**Telos**: The filesystem edge of the system. Khora is the ground — it provides workspace/config foundation and is the single module that may stage writes to disk and manage the sync queue. Everything that touches the vault as a *write operation* passes through or is staged by Khora.

**Public Interface** — what `modules/khora/index.ts` exposes:
- Runtime artifact writes/reads on disk (via shared path service)
- **Khora queue staging for sync intents** (Obsidian-safe update proposals):
  - Queue event semantics: `obsidian_sync`, `neo4j_sync`
  - Provenance labels: `obsidian_harmonization_write`, `smart_connections_proposal`
  - **Obsidian-safe `.md` target path guard**: blocks `.obsidian` internals from queue writes; only `.md` paths admitted
  - Idempotent finalization: duplicate end-signals do NOT cause duplicate queue writes; aliases purged on completion
- Session-scoped NOW/cache context deltas (Gate 1 constraint: deltas only — does NOT replace bootstrap)
- Filesystem events/intents emission for Anima orchestration
- PARADIGM.md integration with existing epi-claw bootstrap surface (alongside other bootstrap files — not a separate "kernel"; already exists in bootstrap logic) → US-035

**Hides**:
- Queue serialization format and file management
- Cache delta merge internals
- Disk write ordering and conflict resolution

**Delegates to**: S1'/QL Obsidian (for path resolution + artifact validation), shared/path-service.ts, shared/session-service.ts

**What Khora is NOT**:
- Not the bootstrap source-of-truth (native is)
- Not the semantic reasoner (Aletheia is)
- Not the template authority (Hen is)
- Not the temporal orchestrator (Chronos/Anima are)

**US Stories**:
| US | Title |
|----|-------|
| US-003 | Implement shared ta-onta path service |
| US-005 | Refactor Khora filesystem writes to shared path service |
| US-015 | Constrain Khora queue to minimal operational contract |
| US-032 | Normalize Khora lifecycle session identity (idempotent finalization) |
| US-035 | Integrate PARADIGM.md with epi-claw bootstrap surface |

**Checklist**:
- [ ] Native bootstrap is source-of-truth — no plugin-local bootstrap replacement
- [ ] No `Present/NOW.md` global source-of-truth in active runtime
- [ ] Session finalization/cutover uses shared path service and explicit lineage
- [ ] Queue/sync resolved through shared path/deep contract
- [ ] Fail-fast on contract violations (no silent degrade)

---

### S3-1' | Hen — GraphRAG (`modules/hen/`)

**Coordinate**: S3-1'
**Telos**: The artifact contract authority and template authority of the system. Hen defines what makes a valid artifact, enforces frontmatter schema, owns wikilink topology, and provides the canonical GraphRAG interface that all other modules use for knowledge retrieval. If something needs to know "is this a valid artifact?", it asks Hen.

**Public Interface** — what `modules/hen/index.ts` exposes:
- Artifact typing/classification (Day, NOW, template output, thought, canonical-form)
- Template authority and invocation contracts (CT/CT' family)
- Frontmatter parsing/writing — canonical normalization law (from `shared/normalization.ts`)
- Wikilink topology indexing/query (canonical document-structure graph)
- Sync validation, coordinate locking, memory boundary contracts
- GraphRAG mechanics consuming S2' deep substrate (Neo4j + Redis combined)

**First-class tool surface** (consumed by Aletheia — do not duplicate):
- `taonta.hen.hybrid_retrieve`
- `taonta.hen.topology_coordinate_query`
- `taonta.hen.graph_query`

**Wikilink breadcrumb template renderer** (`modules/hen/breadcrumb-template.ts` — US-033):
- Produces wikilink breadcrumb sections on-demand (not programmatic canvas injection)
- Consumed by: Anima NOW canonical artifact content, Day-merge closure payload, Khora continuation artifact
- Supports artifact kind classification: `"day"`, `"now"`, `"task"` for context-appropriate breadcrumb generation

**Hides**:
- GraphRAG query construction internals
- Wikilink graph traversal mechanics
- Template resolution caching

**Delegates to**: S2'/QL Graph (for coordinate-aware graph ops), shared/normalization.ts

**Hen / Aletheia boundary** (anti-fragmentation guardrail):
- **Hen owns**: template authority, frontmatter schema validation, wikilink topology, sync validation
- **Aletheia owns**: reasoning, contemplation, extraction, verification interpretation, closure synthesis
- Non-canonical link suggestions: via Khora queue/Smart Connections pool → staged as proposal inputs for Aletheia; Hen does NOT become a duplicate thought/extraction layer
- `taonta.aletheia.vector_search` → deprecation target; use Hen GraphRAG path instead

**US Stories**:
| US | Title |
|----|-------|
| US-007 | Normalize canonical target paths in Hen and Aletheia to Bimba World contract |
| US-008 | Implement shared relation/frontmatter law normalization |
| US-009 | Wire Hen frontmatter parsing to canonical coordinate-key law |
| US-010 | Implement Hen CT/CT' template-lens artifact contract validators (CTX = CT(x) explicit) |
| US-027 | Canonical template-definition vs runtime-invocation lineage contract (CT/CT' families) |
| US-028 | Template-alignment analysis and redesign-suggestion conformance workflow |
| US-051 | Deep knowledge/vault and Obsidian-safe retrieval-update conventions with GraphRAG alignment |

**Checklist**:
- [ ] Frontmatter parsing/writing uses shared canonical normalization law
- [ ] Deprecated `coordinate` / `ql_position` fields not used in canonical write paths
- [ ] Topology/index/query paths do not reintroduce legacy schema assumptions
- [ ] GraphRAG mechanics consume S2' deep substrate (not a parallel graph system)

---

### S3-2' | Pleroma — Superpowers Execution Substrate (`modules/pleroma/`)

**Coordinate**: S3-2'
**Telos**: The execution substrate and skills surface — **a port of obra/superpowers v4.3.0 into a PI-native extension**. Pleroma exposes the highest-value atomic capabilities from the obra superpowers system with explicit agent-scope policy bindings, enabling Anima+Aletheia PI agents and team/chain subagents to invoke first-class tools. It routes work to the right agent/skill, manages credential boundaries, orchestrates external terminal execution, and handles Moirai coordination for graph operations.

> **⚠ FORK/MOD STATUS — PENDING**: The actual fork of `obra/superpowers` v4.3.0 into a ta-onta-specific repo (working name: `epi-logos-superpowers` or `ta-onta-superpowers`) and the paradigmatic modding of that fork has **not been done**. This is a foundational prerequisite for Pleroma. The fork task (US-026-FORK below) must be completed before Pleroma's tool registration can proceed. See VAK-SUPERPOWERS-INTEGRATION-SPEC.md §FORK BASE for specifics.

**Atomic Capabilities Exposed** (from the obra fork):
- `tmux` — terminal multiplexer for session/window management
- `mprocs` — process launcher for parallel task execution
- `bkmr`/`epi-kbase` — knowledge base semantic search
- `onecontext` — cross-session memory aggregation
- `ralph` — task UI launcher (headless capable)
- **`repl` (Darshana)** — document topology navigator; non-spawning utility skill for QL-structured large-file exploration (`scout`/`read`/`threads` operations). Owner: Aletheia; shared access: Anansi, Sophia, Nous, Logos. Lives at `epi-claw/skills/repl/SKILL.md` + `darshana.py`. Copy to `extensions/pleroma/skills/repl/SKILL.md` at fork time.
- All exposed with explicit **agent-scope policy bindings** via patched `agent-team`/`agent-chain` primitives (child extension propagation; preserves `--no-extensions` discovery lockout)

**Technē Substrate Commands** (infrastructure management, not a subagent):
- `technē-spawn` — launch external CLI agent in aletheia-workshop with full constitutional config
- `technē-relay` — retrieve result from agent window to calling skill
- `technē-list` — enumerate active workshop windows with agent/task/status
- `technē-close` — graceful shutdown, OneContext commit, window cleanup

**Public Interface** — what `modules/pleroma/index.ts` exposes:
- Tool registry with agent-scope policy bindings (coordinate-aware skill policy/dispatch)
- Subagent spawn via native `sessions_spawn` / deep orchestration envelope (no plugin-local pseudo-agents)
- Renderer/modelContext bridge invocation following deep bridge envelope conventions
- **Moirai coordination** (CF2 cluster — invoked as a unit, primarily by Eros):
  - The CF code `(0/1/2)` defines Moirai's internal complexity: 3 positionally-assigned roles
  - Klotho [pos 0]: Assert / write graph relations, canonicality checks
  - Lachesis [pos 1]: Query / retrieve/traverse graph, pattern detection
  - Atropos [pos 2]: Reflect / crystallization, inverse relations, sedimentation
  - Intra-plugin invocation: `taonta.pleroma.moirai_gate_mechanics`
- Credential boundary management (1Password integration → US-025)
- External terminal runtime via Technē substrate commands → US-026

**Hides**:
- Skill routing resolution internals
- Credential fetch and injection mechanics
- Bridge protocol details
- Fork/mod specifics of obra primitives

**Delegates to**: S4/Gateway (native spawn mechanics), S4'/VAK System (CF routing semantics), shared/observability.ts

**Rule**: Plugin-local bridge state = semantic/UI cache only (NOT a parallel core invocation surface)

**US Stories**:
| US | Title |
|----|-------|
| US-026-FORK | **Fork obra/superpowers v4.3.0 → ta-onta-superpowers; apply paradigmatic mods** ← PREREQUISITE |
| US-014 | Verify and harden Pleroma/Moirai gate mechanics path |
| US-025 | Centralize runtime credential access through 1Password skill boundary |
| US-026 | Integrate tmux/mprocs/Technē through native invocation policy with agent-scope bindings |
| US-049 | Deep task-discipline and execution-guardrail primitives (PI extension patterns) |
| US-050 | Deep renderer/modelContext bridge conventions |

**Checklist**:
- [ ] obra/superpowers v4.3.0 forked to ta-onta-specific repo
- [ ] Paradigmatic mods applied (agent-scope policy bindings, coordinate-aware gating, QL metadata extension)
- [ ] `agent-team`/`agent-chain` patched for child extension propagation
- [ ] Subagent spawn uses native `sessions_spawn` / deep orchestration envelope
- [ ] No plugin-local pseudo-agent system replacing native PI/OpenClaw surfaces
- [ ] Renderer/modelContext bridge follows deep bridge envelope conventions
- [ ] Plugin-local bridge state is semantic/UI cache only

---

### S3-3' | Chronos — Time/Sessions (`modules/chronos/`)

**Coordinate**: S3-3'
**Telos**: Temporal continuity and session threading. Chronos is not a file-rotation daemon — it carries the thread of time through the system, managing Day lifecycle transitions, KAIROS temporal enrichment, cron-result delivery, and the cutover invariant that keeps two-day presence coherent. Everything that touches time asks Chronos.

**Public Interface** — what `modules/chronos/index.ts` exposes:
- Day rollover/archive path handling via shared path service (Gate 2 dependency)
- Temporal threading across Day lifecycle transitions (not just file rotation)
- KAIROS temporal enrichment for runtime context → US-023
- **Cron-result delivery** via `taonta.chronos.temporal_notify` → US-037:
  - Channel envelopes: `notification-center` (default), `telegram` (configured ready path)
  - Lineage/observability metadata: `sessionId`, `parentSessionId`, `dayId`, `nowId`, `runId`, `invocationSurface`
  - **Dispatch via native**: `api.invokeTool("nodes", ...)` — NO ad hoc HTTP/subprocess path
  - Workflows that emit notifications: `six_am_bootstrap` (skipped/failure), `temporal_health` (threshold), `mobius_return` (failure), `rollup_execute` (rollup failure)
- **Cutover invariant** (`runSixAmBootstrap(...)`) → US-036:
  - Idempotency dedupe signal (replay-safe; duplicate signals do not re-trigger side effects)
  - Two-day presence invariant fields: `activeDayPath`, `boundedYesterdayPath`, `preserved`
  - **Khora quiescence handshake**: `taonta.khora.status` check blocks cutover when active sessions / invalid status
  - **Khora finalization ack handshake**: `taonta.khora.finalization_ack` gates cutover completion
  - Lifecycle telemetry: `blocked_active_sessions` / `replay_deduplicated` / `ready_first_cutover` with phase/transition/nextAction fields
- **Declarative runtime file-set** contract for Nara live docs → US-039:
  - Registry entries with `pathSlot` (e.g., `"nara/FLOW"`), `includeModes` (archive/review/resurface), `required` flag
  - Examples: `nara/FLOW.md` (CT0 invocation — daily execution flow), `nara/DREAMS.md` (CT3 invocation — aspirational artifacts)
  - Mode-specific manifests: `review-nara-links.md`, `resurface-nara-links.md` generated on day transitions

**Hides**:
- Cron scheduling mechanics (delegates to native cron service via S3/Harness)
- Archive bundling internals
- Temporal enrichment payload construction

**Delegates to**: S3/Harness (native cron/hook primitives), shared/path-service.ts, shared/session-service.ts, shared/observability.ts

**Chronos is NOT just a file-rotation daemon.** It carries temporal continuity/threading.

**US Stories**:
| US | Title |
|----|-------|
| US-006 | Refactor Chronos day rollover/archive path handling to shared path service |
| US-023 | Implement Chronos KAIROS temporal enrichment as required runtime integration |
| US-036 | Chronos cutover invariant preserving two-day presence |
| US-037 | Native configurable cron-result delivery (Telegram-ready, traceable session lineage) |
| US-039 | Declarative Chronos runtime file-set contract for Nara live docs |

**Checklist**:
- [ ] Day rollover/archive uses shared path service + deep archive contract
- [ ] No host-specific absolute defaults in runtime config
- [ ] Runtime file-set / cutover invariants match PRD + PLAN Day/NOW bundle semantics
- [ ] Cron-result notification path preserves native invocation/session lineage (appears as native traffic)

---

### S3-4' | Anima — Holographic Runtime (`modules/anima/`)

**Coordinate**: S3-4'
**Telos**: The runtime executor. Anima is the orchestration integrator — it materializes NOW child contexts, drives the Day/NOW paradigm at execution time, and coordinates across Khora/Hen/Chronos/Aletheia for each operation. Everything flows through Anima at the orchestration layer. Anima IS the system in operation.

**Public Interface** — what `modules/anima/index.ts` exposes:
- Runtime decisioning and execution windows
- NOW child context materialization under a Day parent
- Coordinate interpretation/validation requests through the Aletheia pathway (before risky/ontology-sensitive actions)
- **TaskNotes integration** for CT4b task-lane handling → US-024:
  - Storage path: `Idea/Empty/Present/<day>/<now>/tasks/*.md` (under the NOW child folder)
  - Required frontmatter fields: `ct_n_invocation_profile`, `s_4_task_breadcrumbs_markdown` (Hen-rendered), `s_4_day_id`, `s_4_now_id`, `project_id`, `project_path`
  - CT4b fields: `p_n_template_lane`, `t_n_thought_lane` (task-lane context)
  - Live write path: `taonta.anima.tasknote_write` tool
- VAK-driven semantic routing (does NOT replace native invocation/session/deep routing mechanics)

**Hides**:
- NOW artifact construction internals
- Orchestration state machine
- VAK routing decision details

**Delegates to**: Khora (filesystem staging), Hen (template authority), Chronos (temporal threading), Aletheia (coordinate checking), S4/Gateway (session spawn), shared/session-service.ts

**What Anima does NOT own**:
- Graph semantics (Aletheia/Moirai does)
- Template authority (Hen does)
- Filesystem staging (Khora does)
- Temporal threading (Chronos does)

**US Stories**:
| US | Title |
|----|-------|
| US-004 | Refactor Anima NOW pathing to Day-parent child-NOW model |
| US-011 | Wire Anima Day/NOW creation and closure events through Hen template-lens contracts |
| US-024 | Implement TaskNotes integration for CT4b task-lane handling |
| US-029 | NOW-thought lifecycle contract (flat NOW/thoughts, T-prefixed naming) |
| US-030 | Wire contextual "use Aletheia" activity surface |
| US-033 | Template-driven content wikilink breadcrumbs for Day/NOW/task artifacts |
| US-034 | Wire native session-propagation spine |
| US-038 | claude-mem dual-harness parity contract |

**Checklist**:
- [ ] NOW coordination pathing uses shared path service (Day parent / NOW child)
- [ ] VAK-driven semantics do not replace native invocation/session/deep routing mechanics
- [ ] TaskNotes path derivation is workspace/config-driven (no host fallback literals)
- [ ] Lineage + breadcrumbs conform to Hen template-lens contract

---

### S3-5' | Aletheia — Learning/Feedback (`modules/aletheia/`)

**Coordinate**: S3-5'
**Telos**: Aletheia is a **mode of Anima** — the checking and orientation intelligence accessible via registered tools and the 6-subagent apparatus. When Anima enters Aletheia mode ("use aletheia"), it activates this apparatus for coordinate validation, gate logic, crystallization, and specialized reasoning. The tools ARE the activity surface — there is no separate integration contract between Anima and Aletheia.

**Public Interface** — what `modules/aletheia/index.ts` exposes:
- Registered tool surface (the "use aletheia" entry point — tools activate the subagent apparatus)
- Coordinate-aware checking, orientation, graph-linked validation (accessible via tools, not direct function calls)
- Gate invocation (dynamic + invocable by Anima/LLM — not all hard-automated)
- Crystallization path using canonical Bimba World targets and fail-fast policy
- 6-subagent cluster apparatus (each subagent = a CF-level functional role, complexity defined by CF code)

**Hides**:
- Individual cluster dispatch mechanics
- Gate evaluation internals
- Crystallization merge resolution

**Delegates to**: Hen (for graph ops + template authority), S4'/VAK System (for CF cluster routing semantics), shared/janus-envelope.ts (temporal precondition for all gates)

**"Use aletheia" entry point**: entering Aletheia mode activates the full 6-subagent apparatus (Anansi through Zeithoven). The registered tools ARE the interface — no separate wiring needed between Anima and Aletheia.

**CF Cluster Roster** (defined in S4'/vak_system, realized here):

**Principle**: The CF code *defines* the internal complexity of each cluster. Read the positional notation as the number and nature of assigned roles within the cluster — not as a count of "separate systems."

| CF Code | Agent | PI-native ID | Internal Complexity |
|---------|-------|-------------|-------------------|
| `(0000)` | **Anansi** | `pi-ql-aletheia-anansi` | Single node — coordinate orientation; `COORDINATE-MAP.md` in `/empty/present` as source (kept warm in cache); navigates blueprint vs current-state gaps |
| `(0/1)` | **Janus** | `pi-ql-aletheia-janus` | 2 positional roles — temporal envelope checks (Day/NOW/archive/transition); the subagent Chronos spawns for temporal boundary execution |
| `(0/1/2)` | **Moirai** | `pi-ql-aletheia-moirai` | 3 positional roles — Klotho [0/Assert], Lachesis [1/Query], Atropos [2/Reflect]; invoked as a unit, primarily by Eros |
| `(0/1/2/3)` | **Mercurius** | `pi-ql-aletheia-mercurius` | 4 positional roles — signal transport/relay; kairos-facing message shaping |
| `(4.0–4.4/5)` | **Agora** | `pi-ql-aletheia-agora` | Contextual range — CF4a (retrieval-first: "what exists?") / CF4b (coordination: ecosystem integration assessment) |
| `(5/0)` | **Zeithoven** | `pi-ql-aletheia-zeithoven` | Synthesis/return node — self-extension, coordinate-system map evolution (guarded, explicit) |

**Gate Matrix** (from VAK spec + harmonization doc):

| Gate | Primary Purpose | Contact / Cluster | Moirai Path | Invocation Mode |
|------|----------------|-------------------|-------------|-----------------|
| `ql-gate` | Coordinate frame integrity / valid QL placement | Nous + Anansi | Klotho (Assert) | **Mandatory** — ontology-sensitive writes; ambiguous coordinate scope |
| `m-gate` | M-coordinate (MEF/philosophical ground) alignment | Sophia / integrative reflection | Atropos (Reflect) | Invocable by Anima/Aletheia when foundational alignment matters |
| `s-gate` | S/S' stack coherence | Eros / operational alignment | Lachesis (Query) | **Recommended** — stack/runtime/implementation-impacting changes |
| `m-prime-gate` | M'/Pratibimba-frontend alignment | Psyche household coherence | Lachesis + Klotho | **Mandatory** — frontend / Electron / Pratibimba-architecture changes |
| `rupa-gate` | CT3 archetypal/Rupa coherence | Mythos + CF3 pattern seeing | Full F-Thread (all Moirai) | **Mandatory** — agent Rupa/persona/identity-form injection changes |
| `collab-gate` | Human-in-loop escalation | exits to human authority | none | **Mandatory** — hold / escalation / high-risk novelty |

**Gate invocation policy** (not over-automated):
- Policy-triggered invocation (required pre-write checks for certain operations)
- LLM-invoked checks (Anima, Aletheia skills, or operator-triggered gate calls)
- Janus temporal envelope is a required precondition for all gate reasoning

**Aletheia → Hen adapter rule** (anti-fragmentation):
- Any `Aletheia → Hen` helper layer = thin intra-plugin adapter to `taonta.hen.*` tools only
- Must NOT become a second Aletheia capability surface
- Must preserve Hen tool payload/response contracts exactly (no silent shape drift)
- Each Aletheia→Hen call site must classify: **required-contract path** (fail-fast) OR **advisory-enrichment path** (non-blocking, with telemetry, documented)

**US Stories**:
| US | Title |
|----|-------|
| US-013 | Wire Aletheia gate invocation contract into ta-onta runtime surfaces |
| US-028 | Template-alignment analysis / redesign-suggestion conformance workflow |
| US-030 | Wire contextual "use Aletheia" activity surface |
| US-038 | claude-mem dual-harness parity contract |

**Checklist**:
- [ ] Gate invocation path uses shared Janus envelope + native/deep invocation seam
- [ ] No direct plugin-owned graph writes when Hen/deep graph contracts available
- [ ] Crystallization path uses canonical Bimba World targets and fail-fast policy
- [ ] `taonta.aletheia.vector_search` deprecated → use Hen GraphRAG path

---

## Deep Substrate Track (US-040..US-053)

These stories concern the deep PI/OpenClaw/QL infrastructure underpinning all domain modules. They primarily extend Layer 1 (S/S' extensions) but are coordinated through Layer 2.

**Primary authority**: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`

**Implementation rule**: Do not treat existing deep-tranche docs as blanket completion evidence. For each US: verify actual code path is consumed by ta-onta runtime; classify backfill-doc vs verify vs redo; record PI pattern provenance.

| US | Area | Layer 1 Location | Notes |
|----|------|-----------------|-------|
| US-040 | Quaternal Logic deep substrate foundation | `s_i/modules/ql_types/` + `s_i/modules/ql_graph/` | Foundation for US-041..US-051 |
| US-041 | TypeScript parity models for QL/GraphRAG from Python refs | `s_i/modules/ql_types/modules/type_definitions.ts` | Parity test must pin field names across Python/TS |
| US-042 | QL coordinate-kernel runtime payload contracts | `s_i/modules/ql_types/modules/coordinate_validator.ts` | Depends US-001 |
| US-043 | Native orchestration spawn/session metadata envelope | `s/modules/gateway/modules/epiclw_runtime.ts` | Depends US-042 |
| US-044 | Deep prompt-profile composition seam (coordinate/team-aware) | `s/modules/harness/modules/pi_harness.ts` | Depends US-043 |
| US-045 | Unified hook/lifecycle/invocation observability envelope | `s/modules/harness/` + Layer 2 `shared/observability.ts` | Depends US-043 |
| US-046 | GraphRAG deep substrate (Neo4j + Redis combined interface) | `s_i/modules/ql_graph/` | Depends US-042, US-045 |
| US-047 | PI multi-agent extension primitives (team/chain/cross-agent/pi-pi) | `s/modules/gateway/` + `s_i/modules/vak_system/` | Port/mod target; pi-pi as preferred primitive |
| US-048 | Bounded deep-substrate consumption path proof + appendix | Cross-layer verification | Depends US-043..US-051 |
| US-049 | Deep task-discipline + execution-guardrail primitives | `s/modules/harness/modules/pi_harness.ts` | Depends US-043..US-047 |
| US-050 | Deep renderer/modelContext bridge conventions | `s/modules/gateway/modules/epiclw_runtime.ts` | Depends US-043, US-045, US-047 |
| US-051 | Deep knowledge/vault + Obsidian-safe retrieval-update conventions | `s_i/modules/ql_obsidian/` | Depends US-045, US-046 |
| US-052 | Combined Anima+Aletheia 12-agent roster as PI-native agents | `s_i/modules/vak_system/` + `s/modules/gateway/` | Depends US-047, US-043, US-044, US-045 |
| US-053 | PI-native subagent spawning as first-class harness capability | `s/modules/gateway/modules/epiclw_runtime.ts` | Depends US-052, US-022 |

**Agent roster execution lock** (from harmonization doc):
- Port/mod PI team/chains/orchestration so configurable teams route by reflection-family context (CPF/CT/CP/CF/CFP/CS) without hardcoding VAK doctrine into core
- Register 12 combined Anima+Aletheia agents as PI-native agents/subagents in deep/Epi-claw layer
- Use `pi-pi` agent as preferred primitive when generating/seeding PI-native agent definitions
- Seed CF0..CF5 organization and CF4/CF5/CF0 Aletheia emphasis as configurable team presets
- Boundary: deep layer owns mechanics; ta-onta/VAK owns persona semantics and doctrinal role interpretation

---

## M / M' Integration

The M coordinate family and M' Pratibimba layer are cross-cutting concerns that touch all three runtime layers.

### M Coordinates — Philosophical/Ontological Ground

M0-M5 are the subsystem coordinates in the Pratibimba architecture (material through purposive epistemic positions):
- M0 — Ground/foundation (material)
- M1 — Form/structure
- M2 — Dynamic/process
- M3 — Pattern/formal
- M4 — Context/relational (**Nara** — the contextual awareness/editor subsystem)
- M5 — Purpose/integrative

The **`m-gate`** in Aletheia enforces M-coordinate (MEF/philosophical ground) alignment:
- Contact mode: Sophia / integrative reflection
- Moirai path: Atropos (Reflect)
- Invocation mode: callable by Anima/Aletheia when foundational alignment matters

### M' — Pratibimba Frontend Layer (`Idea/Pratibimba/System/`)

The Pratibimba electron app is the M' layer — the reflected/mirrored operational surface of the system.

**Active M' subsystem**: M4_Nara (contextual awareness / editor)
```
Idea/Pratibimba/System/src/renderer/domains/M4_Nara/
├── ui/
│   ├── NaraDashboard.tsx
│   ├── NaraEditor.tsx
│   └── NaraBackground.tsx
└── editor/
```

**Bridge point** (Pratibimba ↔ Epi-Claw):
```
Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts
```
All data flowing between M' and Epi-Claw/ta-onta passes through here. Changes to this store must respect both sides.

**`m-prime-gate` enforcement**:
- **Mandatory** before ANY frontend/Electron/Pratibimba-architecture changes
- Moirai: Lachesis (Query) + Klotho (Assert)
- Checks: Psyche household coherence
- This gate protects the M'/S boundary from drift

**Layer 1 integration points for M'**:
- `s/modules/gateway/modules/epiclw_runtime.ts` — owns the M' communication protocol
- `s_i/modules/vak_system/modules/context_frames.ts` — must be M'/Pratibimba-aware in context frame resolution

**Layer 2 impact**:
- Session-propagation spine must correctly propagate M4 Nara context into Day/NOW lineage
- Chronos file-set contract (US-039) covers Nara live docs in Day archival flows

---

## Data Foundation: Bimba Filesystem Ontology

**Authority**: `docs/plans/2026-02-22-bimba-data-foundation-harmonization.md`
**Layer 1 owner**: S1'/QL Obsidian
**Layer 3 owners**: S3-0' Khora (writes), S3-3' Chronos (temporal), S3-1' Hen (canonical authority)

### Canonical Filesystem Structure

```
Idea/
├── Bimba/
│   ├── World/              ← Canonical entity/forms (flat *.md)
│   │   └── Types/          ← Type-local organization, MOC canvases, process workspace
│   ├── Seeds/              ← Basin/Bucket incubation (coordinate-scoped, high churn)
│   └── Map/                ← Coordinate system mapping/reference/navigation
│
├── Thought/                ← Runtime outputs, active context, extracted thoughts
│
└── Empty/
    └── Present/            ← Active temporal/contextual organization (Day/NOW)
```

### Residency Rule

| Location | Role | Rule |
|----------|------|------|
| `Bimba` | Canonical + templates + enduring ontological structures | Stable, high-scrutiny changes |
| `Empty/Present` | Active temporal/contextual organization (Day/NOW coordination) | Operational; per-session lifecycle |
| `Pratibimba` | Historical/reflective sedimentation and archived action traces | Append-only; archive path |

### Artifact Classes

| Extension | Class | Default Location | Notes |
|-----------|-------|-----------------|-------|
| `.md` | Canonical Form | `Idea/Bimba/World` | Stable, named, link-safe |
| `.canvas` | Canvas/Process/MOC | `Idea/Bimba/World/Types/` | Process workspace; not canonical entity |
| `.canvas.md` | **ERROR CLASS** | Anywhere | Do not create; deprecate/rename on encounter |

### Locked Non-Negotiables

- Physical canonical path = `Idea/Bimba/World` (no repo-root `/world` migration this phase)
- `/Forms` subfolder is not canonical — canonical forms are flat in `Idea/Bimba/World`
- `P*.canvas.md` files are naming/classification errors — treat as misnamed `.md` docs
- `Sx'Cx` content must be embedded within the corresponding `Sx'.md` file — standalone `Sx'Cx.md` files are documentation drift to consolidate
- Day is parent; NOWs are child contexts (per-subsession, not a single undifferentiated runtime file)

### Promotion Lifecycle: Seeds → Types → World

1. **Seeds incubation** — multi-file exploration, specs, PRDs, drafts, parsing old docs (high churn expected)
2. **Types staging** — organize by type/coordinate context, attach canvas/process artifacts, resolve naming
3. **World canon promotion** — produce canonical `*.md` at `Idea/Bimba/World`, validate uniqueness/links

**Promotion gate**:
- [ ] Canonical name chosen
- [ ] Artifact class resolved (`.md` vs `.canvas`)
- [ ] Type placement understood
- [ ] Provenance links present
- [ ] No duplicate canonical in `World`

---

## Testing Approach: TDD Against Real System Dynamics

**Tests first. Always.** No implementation precedes a failing test. This applies at every phase.

### OpenClaw is Reachable for E2E Testing

OpenClaw can be reached **two ways** during testing — both valid, both expected:

1. **TUI chat interface** — interact with OpenClaw as a user would; use the chat surface to trigger plugin behavior, validate NOW context, observe hook outputs
2. **Direct via gateway** — call gateway endpoints directly; validate plugin registration, hook chains, session lifecycle, tool invocations at the API level

Both are valid e2e test surfaces. Tests should use the system **as a user uses it** — not mock the system and test internals in isolation.

### E2E Scenario Source

The authoritative e2e scenario blueprints are in the **harmonization doc** (`docs/plans/2026-02-22-bimba-data-foundation-harmonization.md`). Read that before writing tests. The conformance test files are:
- `Idea/epi-claw/extensions/ta-onta/conformance/e2e-01-08.test.ts`
- `Idea/epi-claw/extensions/ta-onta/conformance/e2e-09-24.test.ts`
- `Idea/epi-claw/extensions/ta-onta/ta-onta.e2e.test.ts`

### Testing by Coordinate Stipulation

Each agent working on a module works within a **coordinate-stipulated scope**. Tests for that coordinate scope are written first:
1. Write a failing test that describes the REAL behavior (not a mock) — use the harmonization doc e2e scenarios as the blueprint
2. Implement against that test
3. Gate discharge on green tests with evidence — not on "looks done"

Tests at every layer:
- **S/S' PI extensions** — unit tests for each atomic capability (S0-S5, S0'-S5')
- **Shared contracts** (Phase 1) — integration tests verifying cross-module contract surfaces
- **Module-level** (Phases 2-3) — tests using real OpenClaw plugin system, real hooks, real session lifecycle
- **E2E** (Phase 5) — full system scenarios via TUI chat or gateway; no mocking

---

## Development Phases

### Phase 0: Foundation Gates (Block All Other Discharge)

**Do not proceed to Phase 1 discharge until these are green with evidence.**

| Gate | Owner Modules | Primary US |
|------|--------------|-----------|
| Gate 1 — Bootstrap source-of-truth | Khora | US-003, US-005, US-015 |
| Gate 2 — Shared path/workspace | Khora + Chronos | US-003, US-006, US-031 |
| Gate 3 — No-bypass enforcement | Hen + Pleroma + Aletheia | US-021, US-022, US-040, US-041 |

### Phase 1: Shared Contracts (Consumed by All Domains)

Build these before domain implementation. All domains depend on them.

| US | Contract | Layer |
|----|----------|-------|
| US-003 | Shared path service | Layer 2 `shared/path-service.ts` |
| US-008 | Relation/frontmatter normalization | Layer 2 `shared/normalization.ts` |
| US-012 | Janus temporal envelope | Layer 2 `shared/janus-envelope.ts` |
| US-016 | Fail-fast error policy | Layer 2 `shared/fail-fast.ts` |
| US-031 | Session naming/parsing centralization | Layer 2 `shared/session-service.ts` |
| US-021 | Native hook/invocation surfaces (no bypass) | Layer 2 enforcement |
| US-022 | Hook/lifecycle observability | Layer 2 `shared/observability.ts` |

### Phase 2: Domain Foundation (Path/Schema/Template Wiring)

Wire each domain against Phase 1 contracts.

| US | Domain | Depends |
|----|--------|---------|
| US-005 | Khora filesystem writes → shared path service | US-003 |
| US-004 | Anima NOW pathing → Day-parent child-NOW | US-003 |
| US-006 | Chronos day rollover → shared path service | US-003 |
| US-007 | Hen + Aletheia canonical target paths | US-003 |
| US-009 | Hen frontmatter parsing → canonical coordinate-key law | US-008 |
| US-010 | Hen CT/CT' template-lens validators (CTX = CT(x)) | US-009 |
| US-011 | Anima Day/NOW events → Hen template-lens contracts | US-004, US-010 |
| US-015 | Khora queue minimal operational contract | US-005 |

### Phase 3: Runtime Integration

| US | Area | Key Depends |
|----|------|------------|
| US-013 | Aletheia gate invocation wiring | US-012 |
| US-014 | Pleroma/Moirai gate mechanics | US-008, US-013 |
| US-023 | Chronos KAIROS temporal enrichment | US-006, US-012 |
| US-024 | Anima TaskNotes CT4b integration | US-004, US-011 |
| US-025 | 1Password credential centralization | US-013, US-014 |
| US-026 | tmux/mprocs through native invocation | US-014, US-021 |
| US-027 | CT/CT' template-definition vs runtime-invocation lineage | US-003, US-010, US-011 |
| US-029 | NOW-thought lifecycle contract (T-prefixed naming) | US-003, US-011, US-015, US-027 |
| US-030 | "use Aletheia" contextual activity surface | US-001, US-015, US-027, US-029, US-040, US-041 |
| US-032 | Khora lifecycle session identity / idempotent finalization | US-004, US-021, US-022, US-031 |
| US-033 | Template-driven wikilink breadcrumbs | US-003, US-004, US-011, US-027, US-031 |
| US-034 | Native session-propagation spine end-to-end | US-021, US-022, US-031, US-032, US-033 |
| US-035 | Integrate PARADIGM.md with existing epi-claw bootstrap surface | US-001, US-004, US-011 |
| US-036 | Chronos cutover invariant (two-day presence) | US-004, US-011, US-021, US-022, US-031, US-032, US-034 |
| US-037 | Cron-result delivery (Telegram-ready) | US-021, US-022, US-031 |
| US-038 | claude-mem dual-harness parity | US-015, US-021, US-022, US-023, US-040 |
| US-039 | Chronos runtime file-set contract for Nara live docs | US-011, US-023, US-031, US-036 |

### Phase 4: Deep Substrate (PI/OpenClaw/QL Layer)

US-040 through US-053 — see Deep Substrate Track section above.

**Execution order within Phase 4**: US-042 → US-043, US-045 → US-044, US-046, US-047 → US-049, US-050, US-051 → US-048 → US-052 → US-053 → US-040 (foundation complete) → US-041

### Phase 5: E2E Validation (Only After Gates 1-3 Green)

| US | Title |
|----|-------|
| US-017 | Conformance harness for E2E-01 to E2E-08 |
| US-018 | Conformance harness for E2E-09 to E2E-24 |
| US-019 | Install and e2e run command path for external terminal execution |
| US-020 | Final readiness verification: ta-onta first working version |

E2E test files (guide then evidence):
- `Idea/epi-claw/extensions/ta-onta/conformance/e2e-01-08.test.ts`
- `Idea/epi-claw/extensions/ta-onta/conformance/e2e-09-24.test.ts`
- `Idea/epi-claw/extensions/ta-onta/ta-onta.e2e.test.ts`

---

## Full US → Runtime Home / Module Reference

| US | Title | Runtime Home | Primary Module | Gate |
|----|-------|-------------|---------------|------|
| US-001 | Freeze centralized wiring doc | S4/S4' |Authority docs | — |
| US-002 | Architecture diagrams | Docs | `.mmd` files | — |
| US-003 | Shared path service | S4/S4' |`shared/path-service.ts` | Gate 2 |
| US-004 | Anima NOW pathing → Day-parent model | S3/S3' |`modules/anima/` | — |
| US-005 | Khora filesystem writes → shared path service | S3/S3' |`modules/khora/` | Gate 2 |
| US-006 | Chronos rollover → shared path service | S3/S3' |`modules/chronos/` | Gate 2 |
| US-007 | Normalize Hen + Aletheia to Bimba World | S3/S3' |`modules/hen/`, `modules/aletheia/` | — |
| US-008 | Shared relation/frontmatter normalization | S4/S4' |`shared/normalization.ts` | — |
| US-009 | Hen frontmatter parsing → canonical key law | S3/S3' |`modules/hen/` | — |
| US-010 | Hen CT/CT' template-lens validators | S3/S3' |`modules/hen/` | — |
| US-011 | Anima Day/NOW events → Hen template-lens | S3/S3' |`modules/anima/` | — |
| US-012 | Janus temporal-envelope utility | S4/S4' |`shared/janus-envelope.ts` | — |
| US-013 | Aletheia gate invocation contract | S3/S3' |`modules/aletheia/` | — |
| US-014 | Pleroma/Moirai gate mechanics | S3/S3' |`modules/pleroma/` | — |
| US-015 | Khora queue minimal contract | S3/S3' |`modules/khora/` | Gate 1 |
| US-016 | Fail-fast error policy | S4/S4' |`shared/fail-fast.ts` | — |
| US-017 | Conformance harness E2E-01..08 | S4/S4' |`conformance/e2e-01-08.test.ts` | Gate 5 |
| US-018 | Conformance harness E2E-09..24 | S4/S4' |`conformance/e2e-09-24.test.ts` | Gate 5 |
| US-019 | Install + e2e run command path | S4/S4' |`INSTALL.md` | Gate 5 |
| US-020 | Final readiness verification | Cross | — | Gate 5 |
| US-021 | Native hook/invocation (no bypass) | S4/S4' |L2 enforcement + US-040 | Gate 3 |
| US-022 | Hook/lifecycle observability | S4/S4' |`shared/observability.ts` | Gate 3 |
| US-023 | Chronos KAIROS temporal enrichment | S3/S3' |`modules/chronos/` | — |
| US-024 | Anima TaskNotes CT4b integration | S3/S3' |`modules/anima/` | — |
| US-025 | 1Password credential centralization | S3/S3' |`modules/pleroma/` | — |
| US-026 | tmux/mprocs via native invocation | S3/S3' |`modules/pleroma/` | — |
| US-027 | CT/CT' template lineage contract | S3/S3' |`modules/hen/` | — |
| US-028 | Template-alignment analysis workflow | S3/S3' |`modules/aletheia/` | — |
| US-029 | NOW-thought lifecycle contract | S3/S3' |`modules/anima/` | — |
| US-030 | "use Aletheia" activity surface | S3/S3' |`modules/aletheia/` | — |
| US-031 | Session naming/parsing centralization | S4/S4' |`shared/session-service.ts` | Gate 2 |
| US-032 | Khora lifecycle session identity | S3/S3' |`modules/khora/` | — |
| US-033 | Template-driven wikilink breadcrumbs | S3/S3' |`modules/anima/` + Hen | — |
| US-034 | Native session-propagation spine | S4/S4' + S3/S3' |spine (see above) | — |
| US-035 | PARADIGM.md bootstrap integration | S3/S3' |`modules/khora/` | — |
| US-036 | Chronos cutover invariant | S3/S3' |`modules/chronos/` | — |
| US-037 | Cron-result delivery (Telegram) | S3/S3' |`modules/chronos/` + S5 external | — |
| US-038 | claude-mem dual-harness parity | S4/S4' + S3/S3' |`modules/anima/` | — |
| US-039 | Chronos Nara file-set contract | S3/S3' |`modules/chronos/` | — |
| US-040 | QL deep substrate foundation | PI/S |`s_i/modules/ql_types/` + `s_i/modules/ql_graph/` | Gate 3 |
| US-041 | TypeScript parity models (Python refs) | PI/S |`s_i/modules/ql_types/modules/type_definitions.ts` | Gate 3 |
| US-042 | QL coordinate-kernel payload contracts | PI/S |`s_i/modules/ql_types/modules/coordinate_validator.ts` | — |
| US-043 | Native spawn/session metadata envelope | PI/S |`s/modules/gateway/modules/epiclw_runtime.ts` | — |
| US-044 | Deep prompt-profile composition seam | PI/S |`s/modules/harness/modules/pi_harness.ts` | — |
| US-045 | Unified hook/invocation observability envelope | PI/S + S4/S4' |`s/modules/harness/` + `shared/observability.ts` | — |
| US-046 | GraphRAG deep substrate (Neo4j + Redis) | PI/S |`s_i/modules/ql_graph/` | — |
| US-047 | PI multi-agent primitives (team/chain/pi-pi) | PI/S |`s/modules/gateway/` + `s_i/modules/vak_system/` | — |
| US-048 | Bounded deep-substrate path proof | Cross | verification appendix | — |
| US-049 | Deep task-discipline + guardrail primitives | PI/S |`s/modules/harness/modules/pi_harness.ts` | — |
| US-050 | Deep renderer/modelContext bridge | PI/S |`s/modules/gateway/modules/epiclw_runtime.ts` | — |
| US-051 | Deep knowledge/vault retrieval-update | PI/S |`s_i/modules/ql_obsidian/` | — |
| US-052 | 12-agent roster as PI-native agents | PI/S |`s_i/modules/vak_system/` + `s/modules/gateway/` | — |
| US-053 | PI-native subagent as first-class capability | PI/S |`s/modules/gateway/modules/epiclw_runtime.ts` | — |

---

## Cross-System Architectural Clarifications

> **Full FR/NFR analysis**: `docs/plans/2026-02-27-fr-layer-assignment-full.md` (harmonized against harmonization doc, VAK spec, conformance plan)

These correct misconceptions that appear in PRD-level analysis and pre-generated code. Read before implementing any module:

| Concern | Correct Home | Note |
|---------|-------------|------|
| Redis cache tier model (HOT/WARM/COLD) | **Khora (S3-0')** — already correctly homed | Khora defines the Bimba-aware tier model by artifact role/volatility; S2' provides the Redis backend. No push-down needed — Khora IS the tier authority. |
| Session identity normalization | **Shared ta-onta/OpenClaw-aligned surface** (plugin-internal utility) | Wraps/extends native `sessions_spawn` constraints — not a free-standing S4 contract layer. Centralized once; all modules consume. |
| Filesystem writes + path validation | **Via Khora** (filesystem edge/transport/queue) | Khora preserves Obsidian link health through sync queue. "Shared path service" (US-003) is plugin-internal — not a new S4 contract. |
| Coordinate key/relation naming | **Hen S3-1' enforces; ta-onta `PLAN.md` is authority** | Canonical format: `{coord}_{n}_{semantic}` (e.g., `c_4_template_id`, `p_0_grounds`, `t_1_extracted_from`). `pos_x_*` forms are deprecated. All modules consume Hen normalization — no local reimplementation. |
| QL coordinate validation/parsing | **S0' QL Types** (`s_i/modules/ql_types/`) | No module carries local coordinate grammar. S0' is the canonical validator. |
| Context compaction hook mechanics | **PI/S session lifecycle via OpenClaw** | Modules subscribe to the hook; OpenClaw exposes the seam. Not module-owned. |
| LLM tier optimization | **Per-invocation agent operational pattern** — rule in `.claude/rules/llm-invocation.md` | FREE: `gemini-cli` (bulk extraction/classification); CHEAP: `glm` (moderate reasoning); FULL: `claude` (synthesis/Möbius). Each agent applies per-task — no shared gateway service. Aletheia uses Gemini-free for QL/S-gate checks; fuller tiers for crystallization/Möbius. |
| Agent orchestration thread types | **CFP types baked into PI agent harness (S3/Harness)** | CFP types: P-Thread (parallel), C-Thread (chained), F-Thread (fusion/N-agents), L-Thread (long autonomous) — these ARE the execution thread types. Topology metaphors (torus/lemniscate/klein) describe CS (Context Sequence) traversal shapes at S4-5'. Both live in PI harness planning docs, not module-level governance. |
| NOW lineage closure + TaskNotes schema | **Anima (S3-4') owns NOW execution; Aletheia (S3-5') consumes/validates** | Anima is the runtime executor (materializes/operates NOW child contexts). Aletheia is the consumer/validator (coordinate checking, crystallization support). Hen owns artifact contracts; Khora owns I/O. |

### Plugin Module Integration

ta-onta is **one plugin over one shared filesystem/memory substrate**. Modules are NOT serially initialized. They integrate through shared contract surfaces, gate-constrained:

- **Gate 1** — Shared contract baseline: shared path service (US-003), normalization law (US-008), session identity surface
- **Gate 2** — Plugin registration: all modules registered via OpenClaw with verified hook subscriptions; no parallel buses
- **Gate 3** — Module integration: all cross-module contracts (Khora↔Hen, Pleroma↔Hen, Chronos↔Khora, Anima↔all) with evidence

Aletheia (S3-5') is the **integration apex** of the S3 module stack — a functional layer within the Anima system, structurally present. Its CF routing clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) activate via CF dispatch, not a separate dormancy/wakeup mechanism.

---

## Open Questions / Genuine Gaps

These are genuine gaps requiring validation, a decision, or a future spec before implementation. Non-questions and resolved items have been removed — see CRITICAL note at top for the common reasoning errors that generate false questions.

---

### Q1: Session Metadata Envelope — Validate Against Existing Gateway

**Task**: US-043 session metadata envelope fields are inferred from tranche implementation records (`taonta-session-identity-contracts.ts`). The session logic needs to be validated against the **existing epi-claw gateway session logic**. The authoritative ground truth is in Khora planning docs + the existing gateway implementation — not a new schema to design.

**Known fields**: `sessionId`, `sessionKey`, `parentSessionId`, `parentSessionKey`, `invocationSurface`, `qlWorkflowId`, `qlChainId`, `qlTeamId`.

**Action**: When implementing US-043, read the existing epi-claw gateway session handling first; reconcile, don't replace.

---

### Q2: n8n Integration — Underspecified, Non-Blocking

**Status**: n8n is listed as a S5' extensibility capability. No concrete workflow patterns or trigger semantics are specified in authority docs.

**Current treatment**: Treat as optional (non-blocking for core e2e). Spec will be written when workflow needs emerge.

---

### Q3: Architecture Diagram — S5 Label Incorrect

**Issue**: `Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/01-stack-layer-map-s-and-s-prime.mmd` labels S5 as "Notion (primary external)" — incorrect. S5 is a generic external API layer; Notion is one optional integration.

**Action**: Update label to "External APIs (raw API access layer)" when next touching architecture diagrams.

---

### Q4: Chronos → Janus → kyrekeion — v3 PRD Spec Pending

**Context**: Chronos (cron scheduling) spawns a session AS Janus for temporal boundary execution. Kairos tools from the `kyrekeion` package are invoked within that session — simple, no inter-system contract needed. Full kyrekeion Kairos data flow spec will be in the **v3 Chronos PRD**.

**Status**: No action needed before v3 PRD; do not treat as an integration problem to solve.

---

### Q5: Cutover Full State Machine — Foundation Done, Orchestration Deferred

**Status**: US-036 cutover invariant has foundation implemented (`runSixAmBootstrap()` idempotency, Khora quiescence, two-day presence metadata), but the full state machine is not complete:
- No Chronos lifecycle/session-aware cutover for active child NOW spanning cutover boundary
- No policy-driven backoff profiles / active-participant coordination semantics
- No end-to-end gateway cron-run invocation proof

**Deferred**: Full orchestration to later tranche.
