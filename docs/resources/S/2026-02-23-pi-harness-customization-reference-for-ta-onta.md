# PI Harness Customization Reference for ta-onta (Epi-claw Deep Substrate Track)

Status: reference + execution-scoping document (deep customization build track)  
Purpose: define the deep PI/OpenClaw customization work required so ta-onta (VAK/Anima/Aletheia/etc.) is built on a deliberately customized Epi-claw substrate rather than treated as a plugin tacked onto the OpenClaw baseline, including explicit agent-team system port/mod work and PI-native agent roster realization.

## Why This Exists

ta-onta is not "just another plugin feature set". It is a system-level runtime paradigm (VAK, Day/NOW, Aletheia gates, Khora/Hen/Chronos/Pleroma integration) that relies on deep agent harness behavior:

- native session spawn/lifecycle correctness
- hook observability and routing integrity
- prompt/profile composition for subagents/teams
- orchestration primitives for agent teams / chains / task discipline
- renderer/tool bridges and interaction surfaces

OpenClaw (PI harness + Gateway + extensions) provides the substrate.  
Epi-claw is the place where we can intentionally diverge from the OpenClaw baseline and install the right substrate primitives for ta-onta.

This document scopes that deep work and tells the agent exactly what to review, compare, map, and then implement in the deep substrate track.

## Layer Model (Canonical Framing)

Use this layering to avoid architectural confusion:

1. **PI / OpenClaw Core (deep substrate)**
- Gateway, embedded PI runner, native hooks, sessions, tool policy, routing, renderer bridges
- generic agent runtime primitives

2. **Epi-claw Deep Customization Layer (fork-level; S3 non-prime substrate)**
- curated PI/OpenClaw extension/customization pack for Epi-Logos usage
- still generic enough to be VAK-agnostic at the primitive level
- this is where "PAI-like" harness concerns now live (hooks, guardrails, orchestration primitives, task discipline, prompt profiles, team mechanics)

3. **ta-onta Plugin (S3-X' specialization / VAK runtime system)**
- Khora / Hen / Pleroma / Chronos / Anima / Aletheia
- Bimba/Empty/Pratibimba ontology
- coordinate semantics and VAK gate/cluster logic
- Day/NOW/CT/CF etc. contracts

Rule:
- push **generic orchestration/runtime primitives** down into the Epi-claw deep customization layer
- keep **VAK semantics and ta-onta ontology** in ta-onta

Role clarification for the agent-system track (scope-critical):

- **Anima** and **Aletheia** are agent systems (real PI-native agent rosters + team/chain/workflow orchestration).
- **Pleroma** is the universal VAK executive skillset/runtime execution layer (skills/tooling/bridge/execution mechanics), and is the primary candidate source for port/mod into deeper PI extension primitives.
- **Aletheia** may additionally own ad hoc integration extensions (project/tool-specific integrations) on top of the universal Pleroma execution layer.

Abstraction rule for "native-izing" capabilities:

- Prefer moving reusable **atomic execution capabilities** (e.g. tmux/mprocs launcher, OneContext bridge, GitButler ops, Ralph launcher primitives) into PI extension-level primitives when they are broadly reusable and benefit from native lifecycle/session integration.
- Keep **skills** as the higher abstraction / invocation / policy layer that composes those primitives for ta-onta workflows.
- Every migration candidate must record `Adopt` / `Adapt` / `Defer` / `Reject` with rationale and downstream impact.

## Key Design Doctrine (Do Not Recreate OpenClaw; Do Not Stay Locked In It)

We do not want:
- a shallow ta-onta plugin forced to work around OpenClaw assumptions forever
- a total rewrite of PI/OpenClaw before ta-onta can evolve

We do want:
- a curated, coherent Epi-claw substrate pack that improves the PI/OpenClaw deep layer for our actual agentic system paradigm
- ta-onta consuming that substrate cleanly via native/session/hook/tool surfaces

This is the "real work" because it determines whether ta-onta remains fragile plugin wiring or becomes a durable system.

## Source Set and Review Scope (Required for the Task)

The task defined by this document must review and map across all of the following:

### A. Current Epi-claw / OpenClaw code reality (deep substrate)
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/pi-embedded-runner*`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/tools/sessions-spawn-tool.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/plugins/hooks.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/routing/session-key.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/sessions/session-key-utils.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/tool-policy.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/system-prompt.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/OPENCLAW_SYSTEM_MAPPING.md`

### B. ta-onta package (full package, not only Anima)
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/**`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/hen/**`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/pleroma/**`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/chronos/**`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/**`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/aletheia/**`

### C. ta-onta/VAK planning sources
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/PLAN.md`
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/plugin-prd-fin/*.md` (especially Anima/Aletheia/Pleroma/Chronos/Khora)

### D. OpenClaw architecture notebook (NotebookLM)
- "OpenClaw: The Personal Multi-Platform AI Assistant Guide"
- Extract details on:
  - PI harness loop
  - teams/chains
  - hooks
  - session routing
  - extension points

### E. External PI extension source (porting candidates)
- `https://github.com/disler/pi-vs-claude-code`

Task requirement:
- produce an **adopt / adapt / defer / reject** mapping for relevant PI extensions and patterns
- do not assume the OpenClaw baseline is optimal for ta-onta

## What to Consider "Deep Customization" (Target Primitive Set)

These are the substrate-level primitives we should likely implement/modify in Epi-claw for ta-onta to sit on correctly.

## PRD Story Split Clarification (Scope Lock to Prevent Drift)

This document is the scope authority for the deep agent-system port/mod track. To prevent future "manifest-only" dilution in the PRD:

- `US-047` (deep customization primitive story) MUST mean:
  - actual PI multi-agent extension primitive port/mod/setup in Epi-claw (at minimum `agent-team`, `agent-chain`, `cross-agent`, `pi-pi`, plus any local support files)
  - `pi-pi` extension + knowledge-base expert files installed in project runtime layout
  - VAK/PLAN-derived 12-agent relationship scaffolding/config for teams/chains/cross-agent dispatch
  - bounded validation against native invocation/session/observability surfaces
- `US-047` MUST NOT be reduced to only manifest/type declarations or generic roster placeholders.

- Follow-on full-realization story (PRD `US-052`) MUST mean:
  - actual 12-agent PI-native agent definition realization (Anima + Aletheia)
  - team/chain instantiation from planning-doc stipulated relationships
  - `pi-pi` knowledge-base docs (`.md` expert/spec files) used as source-of-truth guidance for PI agent best practices, with direct `pi-pi` execution optional (record execution status if attempted)

Planning discipline rule:

- Any tranche doc / appendix that reports `US-047` completion must explicitly state whether it delivered:
  - extension primitive port/mod/setup (required for `US-047`), and
  - full 12-agent PI realization (deferred to `US-052` unless explicitly in scope)
- Any `US-052` implementation record must explicitly state:
  - which `pi-pi` knowledge-base files/spec docs were used as source-of-truth guidance,
  - whether direct `pi-pi` execution was attempted and its status (informational, not a blocker),
  - which workflow surfaces (`/commands`, `.pi/prompts`, or equivalent) orchestrate inter-agent dispatch,
  - how contextual identity composition/injection is derived from workflow "from" context,
  - which session/Day/NOW spine tasks remain deferred to downstream stories (`US-021/022/031/038`)

### 1. Native session naming/parsing + spawn metadata propagation

Why deep:
- this must align with `sessions_spawn`, hook lifecycle, routing, observability, and subagent semantics
- ta-onta currently suffers from bypass/drift when this is not native-aligned

Expected output from the task:
- recommended extension point(s) in PI/OpenClaw
- compatibility strategy with existing `sessions_spawn`
- structured naming/metadata propagation design that ta-onta can consume

### 2. Agent teams / chains / orchestration manifests (generic)

Why deep:
- VAK context frames and Aletheia/Anima teams map naturally onto agent-team mechanics
- team mechanics should be harness-level primitives, not ta-onta-only improvisations

Expected output / build target:
- port/mod PI agent-team/chains/cross-agent primitives into the Epi-claw deep layer (real extension code setup, not just typed manifests) so reflection/runtime coordinate-family routing (`CPF/CT/CP/CF/CFP/CS`) is a native team/mechanics concern
- install `pi-pi` meta-agent extension + expert knowledge base in the project runtime layout as the preferred agent-forge guide surface for the follow-on 12-agent realization
- configurable team/orchestration manifest schema with coordinate-routing fields, profile bindings, tool/policy bindings, and lineage expectations
- chain/pipeline semantics and team invocation ergonomics for native subagent usage
- explicit propagation path from PI-native agent definitions -> Epi-claw registry/config surfaces -> ta-onta bindings (no plugin-local pseudo-team system)
- creation/registration plan for the **combined Anima + Aletheia PI-agent roster (12 total)** as real PI-native agents/subagents (this is the follow-on realization story), including how they are grouped into configurable teams and invoked through native surfaces

### 3. Prompt profile composition beyond simple full/minimal modes

Why deep:
- ta-onta subagents need token-efficient, role-specific prompt modes without re-implementing prompt assembly in plugin code

Expected output:
- proposed profile layering model (identity/rules/tools/memory/skills toggles)
- mapping path for ta-onta agent roles (Anima, Sophia, Anansi, Janus, Moirai, etc.) without embedding VAK semantics in core

### 4. Hook observability substrate (structured telemetry)

Why deep:
- shared telemetry fields for hook/session/tool routing should be native, not per-plugin hacks
- ta-onta conformance depends on this

Expected output / build target:
- common telemetry payload fields
- hook/session correlation points
- testability/log assertion shape

### 5. Task-discipline / execution guardrail primitives (TillDone-class behavior)

Why deep:
- this is a generic agent-runtime constraint mechanism
- ta-onta can bind CT4b task-lane semantics on top of it

Expected output / build target:
- selected `pi-vs-claude-code` task-discipline/guardrail patterns are explicitly marked `Adopt`/`Adapt` and concretely ported/modded into deep substrate code (not matrix-only)
- deep integration loci in hooks/run loop/tool-policy are specified and testable
- generic guardrail primitive contract is defined so ta-onta can bind CT4b/task-lane semantics without VAK hardcoding in core

### 6. Renderer/modelContext bridge conventions (where useful)

Why deep:
- Pleroma already bridges tool registration/invocation with renderer/modelContext
- deep conventions could reduce future fragmentation across UI-aware capabilities

Expected output / build target:
- selected renderer/modelContext bridge conventions from relevant PI extension patterns are concretely ported/modded into deep substrate code where they reduce cross-plugin fragmentation
- explicit deep-vs-plugin boundary for bridge payloads and invocation wiring is documented
- at least one bounded bridge-aware invocation path is identified for validation

### 7. Knowledge/vault/Obsidian-safe deep conventions (with GraphRAG alignment)

Why deep:
- GraphRAG (`Neo4j + Redis`) and vault/Obsidian-safe knowledge operations are foundational mechanics used across Hen/Aletheia/Khora/Anima
- without deep conventions, plugin modules will keep inventing incompatible knowledge-bridge behaviors

Expected output / build target:
- deep conventions/contracts for vault/knowledge retrieval-update envelopes that are Obsidian-safe and compatible with GraphRAG mechanics
- explicit mechanics-vs-semantics split (deep capability vs ta-onta interpretation)
- bounded validation path demonstrating deep convention usage with observability

## Porting / Modding Scope from `pi-vs-claude-code` (Initial Policy)

User direction (locked for this task):
- consider porting/modding **all relevant PI extensions/patterns**
- **exclude status line and tool-counter extensions by default**
- exception: if Epi-claw lacks a capability and the extension supplies essential substrate behavior, mark for reconsideration

Use this classification:

- **Adopt (near as-is)**: generic and immediately useful in Epi-claw substrate
- **Adapt (port-and-mod)**: useful but must be reshaped for Epi-claw + ta-onta compatibility
- **Defer**: useful later, not needed for current ta-onta substrate correctness
- **Reject**: redundant, conflicting, or not aligned with Epi-Logos direction

The task must produce a table for each candidate extension/pattern including:
- capability provided
- overlap with current Epi-claw capability
- ta-onta relevance (Anima/Aletheia/Pleroma/Chronos/Hen/Khora)
- recommended class (Adopt / Adapt / Defer / Reject)
- implementation locus (PI core, Epi-claw extension layer, ta-onta plugin)

## Anima / Aletheia / VAK Integration Lens (Required in the Mapping)

This task is not just "port PI goodies". It must be evaluated through VAK/ta-onta integration needs.

The mapping must explicitly assess how deep substrate mods support:

### Anima
- native `sessions_spawn` alignment (no bypass)
- Day/NOW lineage propagation
- subagent orchestration semantics
- prompt profile specialization
- hook/lifecycle observability

### Aletheia
- contextual skillset execution surfaces ("use aletheia")
- subagent team mechanics (Anansi..Zeithoven)
- gate invocation ergonomics
- non-canonical link reasoning + Hen topology/tool access via native-safe orchestration paths

### Combined Anima + Aletheia PI-agent roster (12 total) [explicit deep-build requirement]

This deep customization track must explicitly account for the planned combined Anima + Aletheia agent roster (12 total) as **PI-native agents/subagents**, not merely plugin-local conceptual roles.

Required outcomes in the deep spec/build plan:
- enumerate the exact 12-agent roster from VAK/PLAN sources (Anima-side + Aletheia-side planned agents) and map each to a PI-native agent definition id
- use the `pi-pi` agent as the preferred agent-forge primitive for generating/seeding PI-native agent definitions, or explicitly leverage `pi-pi` canonical guidance/data/templates when direct invocation is unavailable
- define per-agent deep bindings: prompt profile id, tool/policy defaults, lineage/session expectations, and team/manifest membership hooks
- define configurable team groupings aligned to reflection/runtime coordinate-family routing (especially CF/CT/CFP/CS usage) while keeping VAK semantics out of core
- include deep configurable team preset examples sufficient to support an Anima-oriented organization spanning `CF0..CF5` and an Aletheia-oriented emphasis on `CF4`/`CF5`/`CF0` (as routing/profile/team configuration, not core semantic doctrine)
- ensure native invocation/subagent spawn paths can target these agent definitions directly (or through manifests) without plugin-local bypass routing
- specify what is deep-layer configuration vs what remains ta-onta semantic binding

Roster mapping scaffold (fill from canonical VAK/PLAN sources during implementation):

| source_role (VAK/PLAN) | side (`anima`/`aletheia`) | planned slot | proposed `pi_agent_id` | layer locus (`PI`/`Epi-claw`) | `profile_id` | default team/manifests | default reflection-family routing (`CF/CT/CFP/CS` etc.) | tool/policy binding set | native invocation surfaces | ta-onta semantic binding notes |
|---|---|---:|---|---|---|---|---|---|---|---|
| `<fill>` | `<fill>` | 1 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 2 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 3 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 4 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 5 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 6 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 7 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 8 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 9 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 10 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 11 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | 12 | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |

Configurable team manifest scaffold (deep layer -> ta-onta binding):

| `team_id` | purpose | member `pi_agent_id`s | routing keys (`CF/CT/CFP/CS` ...) | `profile_id` bindings | tool/policy set | native invocation entrypoints | ta-onta semantic owner |
|---|---|---|---|---|---|---|---|
| `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |
| `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` | `<fill>` |

### Pleroma
- execution substrate role
- tool/renderer bridges
- team/pipeline orchestration support
- session and policy integration

### Chronos
- cron-triggered native session execution
- cutover invariants, delivery paths, and observability
- reuse of deep session/hook primitives without bespoke bypasses

### Hen / Khora
- consumption of standardized lifecycle/session/path/telemetry primitives
- less plugin-local adaptation logic

## What Must NOT Be Pushed Down (to avoid doctrinal leakage)

Do not push these into PI/OpenClaw core/Epi-claw substrate as hardcoded semantics:

- VAK gates and cluster metaphysics
- coordinate family meanings/functions
- Bimba/Empty/Pratibimba ontology
- Day/NOW template semantics
- Hen artifact contract ontology

These remain ta-onta/VAK-level concerns.

Deep layer provides:
- mechanics
- routing
- profiles
- observability
- orchestration primitives

ta-onta provides:
- meaning
- contract semantics
- filesystem ontology
- learning/contemplation loops

## Deliverable for the Deep Customization Session (This Task)

The execution session using this reference doc must produce:

1. **Deep Substrate Customization Map (primary deliverable)**
- current OpenClaw/Epi-claw baseline capabilities
- ta-onta/VAK needs that should move deeper
- gaps and overlaps

2. **Porting Matrix for `pi-vs-claude-code`**
- adopt / adapt / defer / reject classification
- rationale tied to actual code in Epi-claw + ta-onta
- explicit tie from `Adopt`/`Adapt` items to concrete deep-substrate implementation subtasks (not matrix-only planning)

3. **Epi-claw Deep Customization Spec (v1)**
- concrete primitives to implement in the Epi-claw substrate layer
- exact integration loci (files/modules)
- acceptance criteria
- explicit port/mod plan for PI agent-team/chains system with reflection-family-aligned configurable team manifests
- explicit combined Anima+Aletheia 12-agent PI-native roster realization plan (agent ids, grouping strategy, invocation path)
- explicit `pi-pi` usage plan (direct invocation vs guidance/templates fallback) for PI-compliant agent definition generation

4. **ta-onta Binding Plan**
- how Anima/Aletheia/Pleroma/Chronos will consume the new substrate primitives
- what ta-onta code can be simplified/removed after deep mods
- how the 12 PI-native agents propagate through Epi-claw configuration into ta-onta invocable subagent/team surfaces

5. **PRD/Wiring Patch Suggestions (or confirmation of implemented alignment)**
- exact updates to:
  - `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-bimba-data-foundation-harmonization.md`
  - `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json`
  - or a follow-on PRD if this deep work should branch

Execution-conversion rule (locked):
- recently discussed deep-integration/modding items (agent-team port/mod, 12-agent PI-native roster, prompt profiles, observability envelope, GraphRAG, task-discipline/guardrails, renderer/modelContext conventions, and vault/Obsidian-safe deep conventions) must appear as concrete implementation subtasks in the foundational infra plan, not only as narrative/planning bullets
- 12-agent PI roster realization must explicitly state how `pi-pi` is used (or how `pi-pi` guidance/templates are consumed) during agent generation/seeding to preserve PI best practices

## Task Method (Review + Contemplation + Mapping + Build Scoping)

This is foundational architecture work that must produce implementation-ready deep substrate build guidance; it is not docs-only handwaving.

The agent should:

1. Read the deep Epi-claw/OpenClaw code paths and tests first
- especially `sessions_spawn`, hook lifecycle, embedded PI runner, prompt assembly, policy layers

2. Read the full ta-onta package with Anima/Aletheia focus
- identify where plugin code is compensating for missing deep primitives
- identify bypasses, adapters, duplicated mechanics

3. Query NotebookLM OpenClaw notebook for architecture context
- PI harness runtime loop
- teams/chains
- extensions
- session routing
- prompt modes

4. Review `pi-vs-claude-code` and classify extension patterns
- not just copy-paste features
- map to Epi-claw + ta-onta needs
- ensure selected `Adopt`/`Adapt` items are tied to concrete deep-substrate implementation tasks (not left at classification stage)

5. Produce a judged, coherent spec + build sequence
- favor a curated substrate pack over maximal feature import
- keep ta-onta semantics out of the deep layer
- make the PI team-system port/mod and 12-agent PI-native roster realization explicit, dependency-ordered, and testable

## Success Criteria (for this deep-customization reference session)

This task is successful when:

- the deep substrate work is scoped clearly enough to execute in the foundational implementation track
- the relationship between PI/OpenClaw core, Epi-claw deep customization, and ta-onta specialization is explicit
- the adopt/adapt/defer/reject matrix exists for relevant PI extension patterns
- selected `Adopt`/`Adapt` PI extension patterns are translated into concrete deep-substrate implementation tasks with explicit loci/acceptance criteria (not left as planning-only entries)
- Anima/Aletheia/Pleroma integration implications are mapped, not hand-waved
- the resulting spec reduces future bypass/duplication risk instead of increasing it
- the PI agent-team/chains port/mod plan is explicit enough to build reflection-family-aligned configurable teams in the deep layer
- the combined Anima+Aletheia 12-agent roster is explicitly represented as PI-native agent/subagent targets with a propagation path through Epi-claw

## Notes for the Agent Running This Task

- Treat this as foundational architecture work, not optional polish.
- Be strict about distinguishing **generic harness primitive** from **ta-onta semantic specialization**.
- Prefer exact code references and tests over high-level assumptions.
- If a feature already exists in Epi-claw/OpenClaw (for example subagent/session primitives), mark it as overlap and specify whether ta-onta should consume, extend, or stop bypassing it.
- Status-line and tool-counter extensions are excluded by default from the porting target unless they prove necessary for a deeper capability gap.
