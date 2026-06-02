V# Bimba Data Foundation Harmonization Plan (Documentation-First)

Date: 2026-02-22
Status: Active working foundation (US-001 freeze/cleanup pass applied 2026-02-25)
Scope: Filesystem ontology + data contracts for Bimba/Seeds/World/Thoughts as the basis for ta-onta alignment (Hen/Khora/Aletheia)

## Purpose

Lock in the first explicit, harmonized data foundation for the full system so:

- the filesystem is clean enough to support real testing,
- agents/tools operate against one stable ontology,
- ta-onta implementation can converge toward the intended contracts without guessing,
- old docs can be mined/deprecated systematically without contaminating canonical truth.

This is a documentation-first plan. It does not assume the current ta-onta implementation is already aligned.

## US-001 / US-002 Freeze Addendum (2026-02-25)

This document remains the centralized wiring/harmonization authority for current ta-onta first-working-version contract work.

Freeze scope for this pass:
- `US-002` completed first via a Mermaid diagram set (operator-facing, implementation/testing usable).
- `US-001` cleanup/freeze then reconciles wording here against current tranche grounding records and `INSTALL.md` verification gates.
- Diagrams are visualizations of this contract, not replacement authorities.

Authoritative/adjacent artifacts for this freeze:
- Diagram set index (US-002): `Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/README.md`
- Diagram files (`.mmd`): `Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/`
- Operator verification campaign (`US-018..US-020` evidence intake surface): `Idea/epi-claw/extensions/ta-onta/INSTALL.md`
- Grounding records consumed for runtime reality checks:
  - `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US017-US022.md`
  - `Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US023-US039-WIRING-UNLOCK.md`
- Documentation workflow seed (diagram-first loop, Mermaid now / `.canvas` deferred):
  - `Idea/epi-claw/extensions/ta-onta/docs/documentation-workflow-skill-seed.md`

Layer-framing clarification lock (coordinate-language expression):
- `S` = conceptual/data architecture surfaces (what the layer is as system conception)
- `S'` = API/implementation/development surfaces (how the layer is realized operationally)
- `S0`/`S0'` are foundational and must be traceable upward into higher runtime capabilities (CLI/TUI/services -> deep contracts -> modules -> runtime behavior)
- `S3`/`S3'` distinction is mandatory:
  - `S3` = conceptual plugin-pack coordination layer
  - `S3'` = PI/Epi-claw implementation/deep-extension surfaces
- `S3-X'` is used here as provenance shorthand for PI-level extension/primitives and shared deep contracts/mechanics (Quaternal Logic direction)
- `S4`/`S4'` distinction is mandatory:
  - `S4` = conceptual runtime/agent interaction layer
  - `S4'` = epi-claw/ta-onta runtime ownership/composition surface
- `S4-X'` is used here as provenance shorthand for the Epi-Claw plugin module implementations (Khora/Hen/Pleroma/Chronos/Anima/Aletheia) as consumed in ta-onta runtime composition

Current-vs-target discipline for this pass:
- Preserve target-state contract language where this document is defining intended wiring.
- When referencing implementation reality, defer to `INSTALL.md` + tranche grounding records and name gaps explicitly (no silent target/current conflation).

## Non-Negotiable Clarifications (Locked)

- Physical canonical path remains `Idea/Bimba/World` (no repo-root `/world` migration in this phase).
- Use a strict distinction between:
  - logical `world` (conceptual canonical ontology layer)
  - physical path `Idea/Bimba/World` (current source of truth path)
- `P*.canvas.md` files are errors (naming/classification error, not valid canvas artifacts).
- `/Forms` is not canonical. Canonical forms are flat in `Idea/Bimba/World`.
- Current ta-onta `PLAN.md` is target-state guidance, not implemented truth yet.
- Day is the temporal parent context; NOW artifacts are children/subsessions and must link back to the Day.
- `now.md` is per subsession (including subagent spawns and external invocations), not a single undifferentiated runtime file in the intended model.
- `Sx'Cx` content should be embedded/listed within the corresponding `Sx'.md` file; standalone `Sx'Cx.md` files are documentation drift to consolidate.

## Foundation Thesis

Clean and aligned filesystem semantics are the prerequisite for:

- reliable Hen indexing and coordination,
- predictable Khora sync queue staging,
- correct Aletheia extraction/crystallization paths,
- meaningful Redis cache tiering,
- true end-to-end system testing.

## Canonical Filesystem Ontology (Phase 0 Authority)

### 1. `Idea/Bimba/World` (Canonical ontology/forms)

Role:
- Canonical entity/forms namespace (stable references).
- Coordinate entities are part of the first canonical population.

Rules:
- Root is flat for canonical forms (`*.md`).
- No `/Forms` subfolder.
- Changes are high-scrutiny and minimal.
- Naming must be unique and link-safe.

Examples:
- `S1'.md`
- `C0.md`

### 2. `Idea/Bimba/World/Types` (Type/process workspace)

Role:
- Type-local organization, MOC canvases, process/workspace artifacts.
- Staging area for type-specific exploration before promotion to canonical `World`.

Rules:
- Contains type contexts and canvases (`*.canvas`) and supporting files.
- May contain provisional working docs, but these are not canonical by default.
- Promotion to `World` requires explicit validation.

### 3. `Idea/Bimba/Seeds` (Basin/Bucket incubation)

Role:
- Coordinate-scoped basin for multi-file active work.
- Tight monitoring/pruning area for specs, PRDs, research, drafts, investigations.

Rules:
- High churn is expected.
- Multiple files per coordinate are expected.
- Canonical claims should not be made from Seeds without promotion.
- This is the primary place for temporary coordination bundles.

### 4. `Idea/Bimba/Map` (Coordinate system mapping/reference)

Role:
- Mapping/reference/navigation layer for coordinate system structure.

Rules:
- Do not treat as canonical entity form storage.
- Supports orientation, porting, and mapping workflows.

### 5. `Idea/Thought` and `Idea/Empty/Present` (Pratibimba/runtime edges)

Role:
- Runtime outputs, active context, and extracted thoughts.
- Khora/Aletheia operational surfaces during sessions and day cycles.

Rules:
- These are operational/pratibimba surfaces, not Bimba canon.
- Must preserve strong linkage back to Bimba canon and Seeds provenance.

### Residency rule (simple division)

- `Bimba` = canonical + templates + enduring ontological structures
- `Empty/Present` = active temporal/contextual organization surface (working thought organization, Day/NOW coordination)
- `Pratibimba` = historical/reflective sedimentation and archived action traces

This residency split is the default planning lens unless a stronger coordinate-specific rule overrides it.

## Artifact Classes (Filesystem Semantics)

This classification must be explicit and enforced in docs/tools.

### Canonical Form

- Extension: `.md`
- Default authority: textual/canonical entity form
- Typical location: `Idea/Bimba/World`

### Canvas Artifact

- Extension: `.canvas`
- Default authority: process/MOC/workspace representation
- Typical location: `Idea/Bimba/World/Types/...`

### Error Class (to deprecate/rename)

- Extension pattern: `.canvas.md`
- Problem: conflates markdown canonical docs with canvas naming
- Current known issue: `P*.canvas.md` under `Idea/Bimba/World/Types/Coordinates/P`

Policy:
- Treat existing `.canvas.md` files as misnamed markdown documents.
- Do not create new `.canvas.md` files.
- Future cleanup should rename by semantic type (likely `.md`) after review.

## Promotion Lifecycle (Seeds -> Types -> World)

This is the intended movement of truth:

1. Seeds incubation (basin)
- Multi-file exploration, specs, PRDs, drafts, parsing from old docs.
- Active monitoring and pruning.

2. Types staging (MOC/process)
- Organize by type/coordinate context.
- Attach canvas/process representations.
- Resolve naming, links, and category fit.

3. World canon promotion
- Produce a canonical form (`*.md`) at `Idea/Bimba/World`.
- Validate naming uniqueness and link integrity.
- Record provenance to Seed/Thought sources.

Promotion gate (documentation-level for now):
- Canonical name chosen
- Artifact class resolved
- Type placement understood
- Provenance links present
- No duplicate canonical in `World`

## Day / NOW Temporal Contract (Parent-Child Hierarchy)

This section records the intended temporal dynamics from the `22-02-2026-USEFUL-FOR-Ta-Onta` planning set.

### Core rule

- **Day is parent**
- **NOWs are child contexts (subsessions)**
- Each NOW links back to its parent Day for temporal context
- Chronos maintains thread continuity across day transitions and archival windows

### Intended semantics

Day (CT4b'):
- canonical temporal context frame for the period
- contains the 4.0-4.5 fractal structure
- source for temporal horizon, tasks, patterns, context, synthesis

NOW (`now.md` in intended runtime use):
- per-subsession runtime artifact
- created for subagent spawns / external invocations / bounded execution windows
- inherits temporal context from parent Day
- contributes operational traces/learnings back into Day sections (especially #2, #4, #5)

### Practical implication for plugin design

- Khora should not be modeled only as "one global NOW writer".
- Hen should be able to classify/validate Day vs NOW artifact roles and their lineage relationship.
- Aletheia should treat Day and NOW as related but distinct sources (parent context vs sub-session traces).
- Chronos should operate the Day lifecycle and mediate parent/child continuity, rather than only rotating flat files.

## ta-onta Data Foundation Alignment (Documentation Target, Unified Plugin Posture)

ta-onta is one plugin/system over one filesystem/memory substrate.
This document is the wiring contract for shared runtime surfaces, not a sequential implementation script.

Current reality (as of 2026-02-22):
- Many modules still assume older path names (`NOW.md`, `Thought`, `/Bimba/Forms`).
- ta-onta `PLAN.md` has been executed and should be treated as the latest canonical relation-law source.
- Path/file conventions remain the main cross-module ambiguity and must be centralized here for first working-version wiring.

This plan therefore defines the harmonized first working-version wiring model, importing relation-law authority from ta-onta `PLAN.md` and locking shared filesystem/path conventions here.

### Planning posture (avoid markdown proliferation)

- Treat ta-onta as a unified plugin/system in planning, not a set of isolated markdown silos.
- Prefer extending this foundation document (and a small number of canonical contract docs) over spawning many overlapping notes.
- Add focused appendices/sections unless a separate document clearly improves navigability.
- This avoids recreating the same fragmentation problem at the documentation layer.

### Shared contract surfaces (centralize once, consume everywhere)

Architectural rule:
- if multiple ta-onta modules depend on it, define it once as a shared contract surface and consume it (same principle as shared Neo4j/Redis services).

Shared surfaces that must be centralized for first working version:

- **Filesystem + path conventions** (this document is authority)
  - canonical Bimba paths
  - Present Day/NOW pathing and naming
  - Seeds/Thought/World/Types residency rules
- **OpenClaw / Epi-Claw native lifecycle + invocation surfaces** (shared runtime seam; no bypass)
  - `agent:bootstrap`, `session:start`, `session:stop`, native hook registration/invocation surfaces
  - native subagent/session spawn + announce/handoff paths (do not re-create alternate orchestration paths in modules)
- **Relation naming law** (ta-onta `PLAN.md` is authority)
  - foundation doc references it; modules do not invent local variants
- **Redis service semantics** (shared infra; module-specific usage only)
  - cache tiers by artifact role/volatility
  - session/state namespaces
- **Neo4j service semantics** (shared infra; Hen/Moirai coordination authority)
  - relation law from ta-onta plan
  - graph authority boundaries
- **Hook observability contract** (shared runtime observability surface)
  - hook/event IDs, lifecycle stage, timing/duration, outcome/error, session/day/now lineage correlation
  - explicit auditability for native hook/invocation routing (especially Chronos cron -> Anima/Pleroma/Aletheia paths)
- **Coordinate semantics + family engagement rules** (coordinate system authority)
  - canonical meaning/function lives in `Idea/Empty/COORDINATE-MAP.md` and canonical coordinate family docs (`S`, `S'`)
  - runtime docs consume these semantics; they do not redefine them ad hoc
- **CT / CT' template lenses (including `CTX = CT(x)` notation)** (Hen-owned runtime template contract)
  - artifacts are interpreted through CT/CT' template lenses, with `CTX` used as shorthand for `CT(x)` typed instantiations (for example `CT4b'`)
- **Bootstrap paradigm / identity kernel source texts** (documentation authority for runtime-safe compression)
  - root `PARADIGM.md` (Khora bootstrap input) must be materialized from an approved compressed source, not ad hoc narrative paste-ins
  - deep Epi-Logos / Anuttara mission text is distilled into agent identity files selectively (Sophia only), while meta-Anima remains execution-focused
  - current approved source file: `docs/plans/2026-02-22-paradigm-kernel-and-sophia-heart-source.md`
- **PI/OpenClaw deep substrate customization reference (Epi-claw fork-level)**
  - deep harness customization scope for ta-onta alignment is documented separately and should drive a dedicated research/mapping execution session
  - current reference file: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`
- **Quaternal Logic deep extension stance (Epi-claw/PI fork-level, shared substrate)**
  - deep customization may extend OpenClaw fork surfaces **and** PI agent-framework internals where required for ta-onta correctness (runner, spawn, prompt/profile composition, orchestration primitives, hook telemetry)
  - `Quaternal Logic` is the system-level extension name for the coordinate-aware deep substrate direction (not only a plugin-local term)
  - the foundational coordinate family (`C/P/M/S/T/L`) and the reflection/runtime coordinate family (`CPF/CT/CP/CF/CFP/CS`) are treated as equally foundational in the deep layer, with distinct roles (knowledge/retrieval grammar vs orchestration/runtime grammar)
- **GraphRAG substrate (Neo4j + Redis, shared deep capability)**
  - GraphRAG is not "Neo4j only"; it is the combined graph + cache retrieval substrate (`Neo4j` + `Redis`) and should be modeled as one deep capability surface consumed by Hen/Aletheia/Pleroma/Anima
- **Canonical coordinate/GraphRAG model references (Python) + runtime parity requirement**
  - existing Python/Pydantic/dataclass models in `Idea/Pratibimba/System/Subsystems/Anuttara/models/*` and `Idea/Pratibimba/System/Subsystems/Parashakti/graph/*` are valid canonical references for Quaternal Logic and GraphRAG payload shapes
  - ta-onta / Epi-claw runtime integrations should define TypeScript parity models (or generated schemas) for the actual runtime surfaces rather than depending on Python models directly in-process
  - template sources are versioned and shared; modules consume via Hen contract

### Relation-law authority import (ta-onta `PLAN.md`)

This wiring document does **not** redefine relation naming law or canonical frontmatter coordinate-key law.
It imports those from:

- `Idea/epi-claw/extensions/ta-onta/PLAN.md`

Operational implications (already planned there, treated as canonical here):

- `p` coordinate keys are canonical (`pos` forms deprecated)
- no standalone `coordinate` / `ql_position` field in canonical schema
- plugin coordinate corrections (Anima = `S3-4'`, Aletheia = `S3-5'`) are authoritative
- modules must normalize to the canonical relation law instead of inventing local variants

### Path-safe inverse encoding propagation (global rule)

When inverse/prime notation (`'`) is not safe/ergonomic for path tokens or property keys, use:

- `i` = inverse (path-safe encoding)

This rule applies across shared code paths and persisted/runtime surfaces, including:

- filenames and folder-name tokens
- frontmatter/property keys (including coordinate-native keys)
- cache/queue key tokens and derived identifiers
- generated path-safe labels in tooling/observability where `'` is not supported

Do not use `p` as a substitute for inverse/prime. use `i`

Canonical human-readable values may still use `'` where supported (for example `CT4b'`, `T5'` in values/prose).

## Shared Native Hook + Invocation Surfaces (OpenClaw / Epi-Claw) (Foundation Contract)

This is a shared runtime contract surface and must be treated the same way we treat shared Redis/Neo4j services and shared filesystem path conventions.

### Native-surface rule (no bypass)

- ta-onta modules must integrate through the native Epi-Claw/OpenClaw hook and invocation systems
- do not bypass native subagent/session spawn logic (for example, Chronos cron jobs must not sidestep standard spawn/announce/lifecycle handling)
- do not create parallel hook/event buses or alternate subagent invocation paths for core ta-onta runtime behavior
- if a capability is missing, extend the native surface contract and wire through it; do not side-step it

This rule is mandatory because bypassing the existing invocation system creates hidden drift in lifecycle behavior, observability, and coordination semantics.

### Required native lifecycle/invocation surfaces (shared)

At minimum, first working version wiring must explicitly integrate with and validate:

- lifecycle seams: `agent:bootstrap`, `session:start`, `session:stop`
- native subagent/session spawning surfaces (`sessions_spawn` and related announce/return/handoff paths)
- native hook registration and invocation flow used by Epi-Claw/OpenClaw runtime extensions
- native announce/completion paths used for parent-child coordination and return reporting

### Native session naming/parsing centralization (shared contract, no local dialects)

Session naming and parsing is a **shared runtime surface** for ta-onta, not a per-module convenience.

Requirements:

- centralize session-key naming/parsing helpers (shared ta-onta/OpenClaw-aligned surface); do not let `anima`, `khora`, `chronos`, `pleroma`, or `aletheia` invent local session-key string grammars
- work **within native `sessions_spawn` / OpenClaw constraints** and extend shared/native generation/parsing deliberately where richer semantics are required
- preserve compatibility with native parent/child session semantics and lifecycle routing (no naming scheme that breaks native subagent detection/handling)
- treat structured session naming (for example Anima/Aletheia/Chronos specializations) as a shared parsing concern, not an Anima-only concern

Operational implication:
- session-key semantics must be stable enough that parent Day/NOW lineage propagation, observability correlation, and breadcrumb generation all derive from the same naming/parsing source of truth

### Native session-propagation spine (must be wired end-to-end)

This is the core runtime wiring path and must be implemented as one coherent chain:

- native invocation / native subagent spawn
- shared session naming/parsing resolution
- Anima Day/NOW child-context binding
- Khora runtime lineage + filesystem persistence
- template invocation/render (Hen contract) for content-level breadcrumbs
- native completion/handoff path back to parent context

Failure to wire any step in this spine creates false "it worked" behavior while breaking lineage, breadcrumbs, or lifecycle semantics.

Design rule:
- prefer one explicit propagation spine over duplicated partial implementations (for example duplicate finalize paths or side-channel lineage updates)
- if multiple native events fire for the same lifecycle boundary, the resulting ta-onta behavior must be idempotent and must not duplicate finalization writes

Developer requirement (explicit):
- before implementing/rewiring Chronos, Anima, Pleroma, or Aletheia runtime paths, inspect the native Epi-Claw/OpenClaw hook system and invocation/subagent spawn system and wire into those surfaces directly
- any implementation that bypasses native spawn/lifecycle handling is a contract violation

### Hook observability contract (first working version target)

Hook/lifecycle routing must be observable and auditable across the integrated system.

Minimum observability fields (shared expectations):

- `hook_id` / `event_id`
- `event_type` (hook/lifecycle/invocation class)
- `module`
- `phase` / `stage`
- `started_at`, `completed_at`, `duration_ms`
- `status` (`started`, `completed`, `failed`)
- `error_code` / `error_message` (when failed)
- `session_id`
- `day_id` / `now_id` (when applicable)
- `parent_session_id` (for subagent/external runtime flows)
- `invocation_surface` (native hook, native spawn, cron-triggered native invocation, etc.)

Observability rule:
- Chronos cron-triggered runtime behavior must still appear as native invocation/lifecycle traffic with explicit hook/event telemetry
- this is required to prevent "it ran, but outside the system" regressions

## Epi-claw / PI Deep Customization Stance (Quaternal Logic Extension)

This document explicitly permits deep customization at the Epi-claw fork layer, including PI agent-framework internals, when required to achieve ta-onta runtime correctness.

Naming rule (locked):
- `Quaternal Logic` is the system/deep-extension name for the coordinate-aware substrate direction (not just a documentation label for QL semantics).
- OpenClaw and Epi-claw are the same harness stratum in different fork lineages; PI is the agent-framework layer underneath and may be customized as part of Epi-claw deep work.

Deep-layer capability targets (mechanics, not doctrine):
- coordinate-aware native spawn/session/orchestration primitives
- ported/modded PI agent-team/chains/manifests substrate with reflection-family (`CPF/CT/CP/CF/CFP/CS`) routing support
- PI-native agent registry/definition support for the planned combined Anima+Aletheia roster (12 total) so subagents are real harness agents, not plugin-local pseudo-roles
- prompt profile composition lattice (beyond `full|minimal|none`)
- unified hook/event/session telemetry envelope with lineage correlation
- GraphRAG substrate as a shared `Neo4j + Redis` capability surface
- knowledge/vault/Obsidian-safe retrieval/update conventions exposed as native/deep functionality where broadly useful

Boundary rule:
- deep layer may encode coordinate grammar and typed payload contracts
- ta-onta/VAK layers retain semantic doctrine (gate meanings, cluster personas, ontology meanings, template metaphysics)

Operational provenance shorthand for this section:
- `S3-X'` = PI-level extension/primitives + deep contracts/mechanics (Quaternal Logic direction)
- `S4-X'` = ta-onta plugin module implementations consuming those contracts
- `S4'` = ta-onta runtime ownership/composition over the module set and native lifecycle surfaces

### Deep agent-team system port/mod requirement (execution lock)

For the Quaternal Logic deep customization track, the PI/OpenClaw agent-team system is not optional plumbing. It is a required port/mod target.

Execution requirement (locked):
- port/mod PI team/chains/orchestration primitives so configurable teams can route by reflection/runtime coordinate-family context (`CPF/CT/CP/CF/CFP/CS`) without hardcoding VAK doctrine into core
- create/register the **planned combined Anima + Aletheia agent roster (12 total)** as **PI-native agents/subagents** in the deep/Epi-claw layer (with profile ids, tool/policy bindings, and manifest/team membership hooks)
- use the `pi-pi` agent as the preferred primitive (or `pi-pi` guidance/templates as fallback) when generating/seeding these PI-native agent definitions so they follow PI-compliant best-practice patterns
- seed configurable reflection-family-aligned team presets in the deep layer sufficient for Anima-oriented `CF0..CF5` organization and Aletheia-oriented `CF4`/`CF5`/`CF0` emphasis (configuration/routing only; semantics remain ta-onta/VAK)
- expose these agents through native invocation/subagent surfaces so Anima/Aletheia runtime invocation uses real harness subagents and configurable teams, not plugin-local emulation
- propagate the deep agent definitions upward through Epi-claw configuration/registry surfaces so ta-onta can bind semantics/personas/contracts on top

Boundary clarification:
- deep layer owns agent/subagent mechanics, team configuration, routing, and invocation surfaces
- ta-onta/VAK owns persona semantics, gate meanings, and doctrinal role interpretation for those agents

Implementation detail source:
- the deep port/mod specifics, roster mapping, and team-system execution guidance are tracked in `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`

## Unified Runtime Execution Contract (Anima-Centered, ta-onta Integrated)

This plan treats ta-onta as one integrated system over a unified memory/filesystem model.
The modules are distinct implementation surfaces, but the runtime contract is shared.

### Core integrated stance (locked)

- **Anima is the runtime executor** of the Day/NOW paradigm for agent operation.
- **Hen + Khora** are the artifact-contract + filesystem-edge layers Anima relies on.
- **Aletheia** performs coordinate checking/orientation/crystallization support for Anima (including graph-facing validation via Moirai).
- **Pleroma** is the skills/execution substrate (fork/mod of superpowers), and coordinate-awareness should be integrated at that layer for skill dispatch and execution policy.
- **Chronos** carries temporal continuity/threading across Day lifecycle transitions (not just file rotation).

This is a single execution system, not a set of disconnected plugins.

### Quaternal Logic Reflection Coordinate Family (VAK formal layer, shared runtime map)

This wiring document treats VAK as the formalization/culmination of the context-frame coordinate system used by ta-onta runtime orchestration.
This family should be treated as the **Quaternal Logic reflection/runtime coordinate family** (not named in runtime architecture as "S4-X'" even if S4-X' remains useful provenance notation in source plans/docs).
`CTx` and `CFx` are shorthand notations used inside the full **six-type reflection coordinate family**. They must be mapped first at system level, then consumed by plugin/module logic.

Equal-foundation rule (locked):
- the foundational coordinate family (`C/P/M/S/T/L`) and the reflection/runtime coordinate family (`CPF/CT/CP/CF/CFP/CS`) are both foundational to the system layer
- they are not competitors; they are complementary grammars:
  - foundational family -> knowledge, storage, retrieval, relation semantics (Hen/GraphRAG/Khora-facing)
  - reflection family -> invocation, orchestration, routing, execution topology (Anima/Aletheia/Pleroma/Chronos-facing)

The six reflection-family frame types (shared runtime coordinates) are:

1. **CPF (S4-0')** — Context Frame Polarity
- dialogical/mechanistic polarity and Day/Night′ handling posture
- governs human-in-loop vs autonomous execution shape

2. **CT (S4-1') / CT template lenses (with `CTX = CT(x)` notation)**
- content/process primitive typing lens (CT0'..CT5' and typed instantiations such as `CT4a`, `CT4b`, with prime/template variants where applicable)
- used by Hen template authority and Anima runtime structuring
- primary bridge between canonical templates and runtime artifacts

#### `CTX` notation clarification (locked)

- `CTX` is **not** a different coordinate family from `CT` / `CT'`
- `CTX` means **`CT(x)`** where `x` is a specific position/variant selection within the CT system
- Example:
  - `CT4b'` = a specific CT typed template/process form (the primary Day-context example)
  - "CTX lens" means "a concrete CT(x) lens is active for this artifact/runtime context"

Practical use in this wiring doc:
- We may say "CTx template lens" as shorthand in prose.
- The underlying coordinate law remains CT / CT' with explicit typed instances (`CT0'..CT5'`, `CT4a`, `CT4b`, etc.).

CT lens handling must include the **6+1 runtime-relevant split** already present in the template/VAK planning:
- `CT0`, `CT1`, `CT2`, `CT3`, `CT4a`, `CT4b`, `CT5` (with prime/template variants as applicable)
- `CT4` is not treated as a single opaque bucket in runtime logic when `CT4a` vs `CT4b` distinctions are semantically active

3. **CP (S4-2')** — Context Positions
- execution plotting / positional runtime emphasis (4.0..4.5 and related transitions)
- binds orchestration movement to QL positional semantics

4. **CF (S4-3')** — Context Frames / functional cluster contact
- constitutional/functional contact mode for orchestration and Aletheia cluster invocation
- includes the 6+1 Aletheia cluster realization (`CF4` split into `CF4a` and `CF4b`)

5. **CFP (S4-4')** — Context Frame Thread Types
- thread topology for runtime execution (parallel/chained/fusion/etc.)
- controls interaction shape without redefining semantic roles

6. **CS (S4-5')** — Context Sequences
- sequence/path law (Day, Night′, Day+Night′, Klein-style passes)
- governs traversal and closure shape across execution + learning loops

Architectural rule:
- plugin/module contracts must consume this six-type map as a shared runtime ontology
- no module should treat `CT`, `CF`, `CFP`, etc. as isolated local enums divorced from the full S4-X' system

### Quaternal Logic canonical type-model references (Python) and TypeScript parity rule

Existing Python models already encode the dual-family contract shape and are useful canonical references for design and parity:
- `Idea/Pratibimba/System/Subsystems/Anuttara/models/__init__.py` (QL/Quaternal Logic model package)
- `Idea/Pratibimba/System/Subsystems/Anuttara/models/coordinate_types.py` (canonical coordinate parser + foundational family + reflection-family `AgentInvocation`)
- `Idea/Pratibimba/System/Subsystems/Parashakti/graph/graphrag_retriever.py` (GraphRAG config/result dataclasses)

Implementation rule (first working version + deep-customization follow-on):
- Epi-claw / ta-onta runtime surfaces must expose TypeScript parity models (or generated JSON-schema/type artifacts) for these payloads.
- Do not couple the Node/TS runtime directly to Python dataclasses in-process.
- If Python remains the canonical reference for a period, parity tests/docs must pin field names and meanings across Python and TS models.

### CF cluster realization (Aletheia 6+1 cluster mapping, VAK-imported)

The Aletheia cluster system is the runtime CF realization used for alignment/checking and self-development surfaces.

- `CF0`  -> **Anansi** (orientation, coordinate web, blueprint/present gap)
- `CF1`  -> **Janus** (temporal envelope, scheduling boundaries, transitions)
- `CF2`  -> **Moirai** (graph operations: assert/query/reflect mechanics)
- `CF3`  -> **Mercurius** (kairos signal transport/messaging)
- `CF4a` -> **Agora (learning mode)** (retrieval-first: "what already exists?")
- `CF4b` -> **Agora (coordination mode)** (ecosystem coordination / integration assessment)
- `CF5`  -> **Zeithoven** (creative advance / self-extension / map evolution)

This mapping is VAK-defined behavior and should be consumed in ta-onta runtime wiring, not re-invented per module.

Runtime integration requirement (deep substrate + ta-onta binding):
- the CF mapping above must bind to configurable PI/Epi-claw team/orchestration manifests, not only plugin-local routing switches
- Aletheia and Anima combined planned agents (12 total) should be realized as PI-native agent/subagent definitions with reflection-family-aware team routing and native invocation paths

### Runtime ownership model (operational, not siloed)

Terminology lock for this section:
- the module ownership bullets below describe `S4-X'` module responsibilities
- the integrated runtime behavior they compose into is the `S4'` ownership surface
- this section does not collapse module boundaries into one undifferentiated runtime blob

1. Anima (executor/orchestrator)
- Owns runtime decisioning and execution windows.
- Materializes/operates NOW child contexts under a Day parent.
- Requests coordinate interpretation/validation through the Aletheia pathway before risky or ontology-sensitive actions.

2. Hen (artifact contract authority)
- Owns artifact typing/classification and template-derived schema expectations.
- Defines what a Day, NOW, template output, thought artifact, or canonical-form artifact is.
- Serves canonical contract metadata to Anima/Khora/Aletheia.

3. Khora (filesystem edge + queue/cache)
- Writes/reads runtime artifacts on disk and stages sync intents.
- Should expose filesystem events/intents in a way Anima can orchestrate without hardcoding path assumptions.
- Implements transport/staging, not semantic truth.

4. Aletheia (coordinate intelligence + crystallization)
- Provides coordinate-aware checking, orientation, and graph-linked validation for Anima.
- Uses subagent/cluster specialization to apportion checks rather than forcing Anima to interpret every coordinate family itself.
- Moirai remains the graph-facing operator; Anima should not be forced to own graph semantics directly.
- Aletheia thought/crystallization reasoning remains in the Aletheia subagent/skill apparatus (Sophia/Anansi/Mercurius/etc.), not in ad hoc "Hen client" helper logic.

5. Pleroma (skills/execution substrate)
- Provides the execution/skills substrate for routed work (including subagent plans/policies).
- Coordinate-awareness should live at skill policy/dispatch level so execution behavior matches the engaged coordinate family and artifact role.

### Aletheia subagent apportioning (planning target)

This is the intended routing lens for Anima requests into Aletheia, using the existing six-subagent structure.

- **Anansi**: coordinate orientation and placement checks (use `COORDINATE-MAP.md` as primary orientation source; identify family/role before action)
- **Moirai**: graph validation / lineage / relation checks for coordinate and artifact claims
- **Janus**: temporal envelope checks (Day/NOW/archive/transition constraints; Chronos-facing continuity signals)
- **Mercurius**: signal transport/relay and kairos-facing message shaping when runtime events must propagate
- **Agora**: retrieval and ecosystem coordination across docs/specs/history when Anima needs contextual grounding
- **Zeithoven**: self-extension / map evolution / coordinate-system refinement proposals (guarded, explicit)

This keeps Anima as executor while distributing validation/intelligence work across the designed Aletheia surfaces.

### Aletheia invocation contract (VAK-imported, dynamic + invocable)

This section imports the "when/how" of Aletheia from VAK and makes it explicit for ta-onta runtime wiring.

Key rule:
- Aletheia checks are **dynamic and invocable by LLM/Anima**, not all hard-automated.
- Some checks are mandatory preconditions in specific contexts; others are callable tools/skills when judgment is needed.

#### Gate behavior model (imported from VAK)

- Aletheia is a functional layer within the Anima runtime, not a separate infrastructure stack.
- Gate skills specify **what** to check.
- Moirai (via Pleroma) perform graph/retrieval mechanics (**how** to check).
- Janus temporal envelope injection is a precondition for gate reasoning.
- Gate 6 (collab-gate) is the explicit human authority boundary.

#### Gate invocation precondition (Janus temporal envelope)

Before gate reasoning begins, gate skills should operate with Janus temporal envelope context (Day/NOW/temporal window/provenance) so alignment checks are contextually grounded.

This is a runtime precondition for gate invocation behavior, whether the gate is triggered automatically by policy or manually invoked by the LLM/agent.

#### Gate matrix (what it checks + how it wires)

| Gate | Primary purpose | Contact mode / cluster | Primary Moirai path | Invocation mode in runtime wiring |
|---|---|---|---|---|
| `ql-gate` | Coordinate frame integrity / valid QL placement | Nous contact + Anansi orientation support | Klotho (Assert) | **Mandatory** before ontology-sensitive writes and when coordinate scope is ambiguous |
| `m-gate` | M-coordinate (MEF/philosophical ground) alignment | Sophia / integrative reflection | Atropos (Reflect) | Invocable by Anima/Aletheia when foundational alignment matters |
| `s-gate` | S/S′ stack coherence | Eros / operational alignment | Lachesis (Query) | **Recommended** for stack/runtime/implementation-impacting changes |
| `m-prime-gate` | M′ / Pratibimba-frontend alignment | Psyche household coherence | Lachesis + Klotho | **Mandatory** for frontend / Electron / Pratibimba-architecture changes |
| `rupa-gate` | CT3 archetypal/Rupa coherence | Mythos + CF3 pattern seeing | Full F-Thread (all Moirai) | **Mandatory** for agent Rupa/persona/identity-form injection changes |
| `collab-gate` (Gate 6) | Human-in-loop escalation and approval boundary | exits to human authority | none (or supporting evidence only) | **Mandatory on hold/escalation/high-risk novelty** |

#### Dynamic invocation policy (not over-automated)

The runtime should support both:

- **policy-triggered invocation** (e.g., required pre-write checks for certain operations)
- **LLM-invoked checks** (Anima, Aletheia skills, or operator-triggered gate calls)

Examples:
- Anima may invoke `s-gate` explicitly before stack-affecting implementation work.
- Aletheia may invoke `m-gate` during reflective evaluation when foundational coherence is in question.
- Operators/LLMs can invoke gate skills directly for diagnosis/audit without an automated trigger.

#### Capability composition model (atomic vs contextual skills; explicit)

To keep execution surfaces precise without flattening real activities:

- **atomic skills** are UNIX-like tools (one thing well; modular/composable)
- **contextual skills / skillsets** are activity-context capabilities that make multiple atomic tools operant under one conversational/runtime surface

Runtime implication:
- Aletheia-facing operation for Sophia/Anima should support a contextual activity surface such as **"use aletheia"** that exposes the full thinking apparatus (`Anansi` through `Zeithoven`) while keeping gates/Moirai/Janus/etc. modular beneath it
- avoid reducing this to only atomic actions like "extract thoughts"; contemplation/review/learning should remain a natural contextual activity with composable tools underneath

#### VAK import boundary (important)

This wiring doc imports Aletheia gate/cluster behavior from VAK.
It does **not** redefine:

- gate philosophical semantics
- cluster characterizations
- Moirai functional distinctions

### Aletheia <-> Hen boundary clarification (anti-fragmentation guardrail)

This is an integrated-system boundary, not a "separate plugin client" architecture.

Lock the remit split:

- **Aletheia** (via contextual `"use aletheia"` and subagent/skill apparatus) owns:
  - reasoning, contemplation, extraction, verification interpretation, closure synthesis
  - subagent definitions/skill-scoping quality (including how capabilities are described in operational docs such as `TOOLS.md` and related system-facing definitions)
- **Hen** owns:
  - template authority / template invocation contracts
  - frontmatter + coordinate schema validation/mapping
  - wikilink topology indexing/query (canonical document-structure graph)
  - sync validation, coordinate locking, memory boundary contracts
- **Khora queue / Smart Connections pool** supplies:
  - non-canonical proposal artifacts/links for Aletheia to reason through
  - Obsidian-safe transport/harmonization path

Important distinction:
- non-canonical link suggestions/proposals are **not** Hen's reasoning output; they are proposal inputs staged (via Khora queue/Smart Connections pool) for Aletheia/Hen consumption under explicit non-canonical labeling
- Hen may validate/index canonicalized outcomes and provide topology context, but should not become a duplicate Aletheia thought/extraction layer

Retrieval/caching apportioning clarification (first working version):
- Aletheia subagents should use existing first-class tool surfaces for retrieval/caching operations:
  - **Hen GraphRAG/topology/graph tools** (for example `taonta.hen.hybrid_retrieve`, `taonta.hen.topology_coordinate_query`, `taonta.hen.graph_query`)
  - **Aletheia Redis/OneContext tools** for cache/project-memory operations where appropriate
- `taonta.aletheia.vector_search` is currently a placeholder and should be treated as a deprecation target in favor of the Hen GraphRAG path + existing cache tools
- Aletheia subagents should not depend on a standalone Aletheia vector tool when Hen provides the real first-class semantic retrieval surface

Implementation shape rule:
- any `Aletheia -> Hen` helper layer in code (for example `hen-integration.ts`) should be a **thin intra-plugin adapter** to `taonta.hen.*` tools/contracts only
- it must not become a second Aletheia capability surface, and it must not duplicate subagent reasoning functions already owned by the Aletheia/VAK model

Adapter hardening rules (first working version):
- Aletheia->Hen adapter functions must preserve Hen tool payload/response contracts exactly (no silent shape drift such as reading `documents` when Hen returns `items`)
- helper/adapters may perform light normalization only when explicitly documented and test-covered; otherwise pass through canonical tool shapes
- each Aletheia->Hen call site must classify the Hen dependency as either:
  - **required contract path** (fail-fast on error), or
  - **advisory enrichment path** (explicitly non-blocking, with telemetry)
- this classification must be documented in the implementation/tests for touched call paths so non-blocking behavior does not spread silently into required flows

Those remain in the VAK spec and Aletheia gate/cluster docs.
This wiring doc only specifies how ta-onta runtime surfaces consume them.

#### Planning/source precedence for implementation resolution (explicit)

When planned behavior diverges across planning sources, resolve implementation using this precedence:

1. `Idea/epi-claw/extensions/ta-onta/PLAN.md`
2. `Idea/Empty/Present/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`
3. v3 plugin PRDs (`Idea/Empty/Present/plugin-prd-fin/*.md`)

Execution requirement:
- implementation tasks must review the sources above **and** current ta-onta package code to confirm whether behavior exists, is partially wired, or is missing
- if missing, implement from the highest-precedence source that specifies the behavior
- record divergences explicitly in touched docs/tests/comments rather than silently blending conflicting plans

#### claude-mem parity status + contract direction (explicit)

Current reality (as of this wiring lock):
- claude-mem dual-harness memory parity is specified in VAK/TOOLS docs but is not yet wired as ta-onta runtime code in the package
- OneContext (`oc_*`) is currently the implemented first-class cross-session memory tooling in Aletheia

Contract direction:
- preserve the VAK three-layer memory model (`claude-mem` hook-level -> OneContext project-level -> Khora/Hen plugin-level)
- implement claude-mem parity via native integration surfaces (Claude Code plugin / OpenClaw external integration path) rather than bespoke ta-onta wrapper reimplementation
- ta-onta should consume the outputs/contracts of this layer (session completion summaries, lineage handoff) through the shared Khora/Hen/Aletheia wiring, not fork a parallel memory stack

### Day/NOW execution target for Anima (must converge here)

Anima should execute the temporal runtime model as:

- Day = parent runtime context frame (`CT4b'` authority artifact)
- NOW = child subsession runtime artifact(s), one per bounded execution context (subagent spawn, external invocation, etc.)
- Every NOW carries a backlink/provenance link to its parent Day
- Chronos picks up the thread across archival/day rollover
- Day and NOW are both **CT4b-template invocations** with different runtime functions/natures (they are not competing template families)

Implication:
- Singular global `NOW.md` behavior in current code is a divergence from the intended runtime semantics.
- Anima should orchestrate Day/NOW via Hen contracts and Khora IO, with Aletheia validating coordinate/lineage correctness where needed.
- Native subagent spawn and return paths must propagate Day/NOW lineage through the shared session-propagation spine (session naming/parsing -> Khora lineage -> template-rendered content breadcrumbs), not via module-local patches.

#### CT4b' and named runtime files (template vs invocation clarity)

Lock this explicitly:

- `CT4b'` is the canonical template-level form (a CT/CT' template lens authority)
- `daily-note.md` is a named **invocation artifact** of the CT4b' template family (Day-parent function)
- `now.md` is a named **invocation artifact** of the CT4b' template family (bounded child-runtime function)
- from each invoked template (diaily-note.md, now.md etc) we then generate specific instances (DD-MM-YYYY.md as daily note invocation; DD-MM-YYYY-Time-Now.md as invocation of now.md - both are derived of the ct4b parent template) - **THIS IS THE CORRECT WAY TO MAP THE INVOCATION SYSTEM OF THE HEN TEMPLATES** 

This removes the false contradiction between:
- having canonical CT/CTX template forms, and
- using practical named runtime files (`daily-note.md`, `now.md`, etc.)

Template principle:
- the canonical template ground (Bimba) is versioned and may evolve
- invocation artifacts (Pratibimba) remain concrete runtime instantiations with lineage to the template version used

#### Wikilink breadcrumbs are content-level template outputs (not code literals)

Lock this explicitly:

- `[[wikilinks]]` breadcrumbs belong in artifact **content** (for example Day/NOW/task artifacts), not as hardcoded string literals in runtime codepaths
- breadcrumb content should be produced/updated through the template invocation/rendering process (Hen template authority + Khora/Anima write flows), not via ad hoc runtime string concatenation
- runtime code is responsible for supplying the lineage/session/time context needed by template rendering
- templates/artifact contracts should define where breadcrumbs appear in content and which breadcrumb forms are expected (for example `[[date-time]]`, `[[session/now]]`, Day<->NOW references)

Implication:
- "wikilink wiring" is a template/contract + invocation-propagation problem, not a request to embed Obsidian link literals directly in TypeScript logic

### Shared Day/NOW path conventions (locked for first working version)

These path conventions are centralized here as a shared contract surface.
Khora, Chronos, Anima, Aletheia, and Hen should consume the same path resolver/constants rather than hardcoding local path literals.

#### Present runtime layout (`Idea/Empty/Present`)

```
/Idea/Empty/Present/
  {DD-MM-YYYY}/
    daily-note.md                     ← Day parent artifact (CT4b' runtime form)
    daily-note.canvas                 ← Day visual/MOC surface (optional but canonical path slot)
    nara/                             ← personal user data objects for Electron app (live docs, not injected prompts)
      FLOW.md                         ← CT0-derived invocation (journal/flow operational surface; example canonical type)
      DREAMS.md                       ← CT3-derived invocation (dream/archetypal surface; example canonical type)
    {YYYYMMDD-HHmmss}-{sessionId}/    ← one child NOW folder per bounded execution context
      now.md                          ← NOW child artifact (subsession runtime form)
      now.canvas                      ← NOW visual/spatial context state
    (ad hoc working files)            ← scoped to the Day basin when needed
```

Naming rules:
- Day folder name: `DD-MM-YYYY`
- Child NOW folder: `{YYYYMMDD-HHmmss}-{sessionId}`
- No sequential `now-1`, `now-2` counters
- Ordering is datetime-derived; lineage is explicit via IDs/links, not inferred by position in folder

Semantic rules:
- `daily-note.md` is the **Day parent**
- `nara/FLOW.md` and `nara/DREAMS.md` (and future Nara file types) are live Present-basin user data objects managed/stored for the Electron app, not prompt bootstrap injections by default
- each child folder contains exactly one bounded NOW context (`now.md`, optional `now.canvas`)
- all NOW contexts link back to the Day parent and carry session lineage
- Nara live docs participate in the daily archival/cutover flow through the Chronos file-set contract (below), not by ad hoc hardcoded cron file lists

#### Chronos runtime file-set contract (add/remove/update without rewiring cron logic)

To keep cron flows evolvable (for example adding `FLOW.md`, `DREAMS.md`, or future Nara files), Chronos should operate against a declarative runtime file-set contract rather than hardcoded filename lists spread across jobs.

Contract requirements:

- define a shared Chronos-consumed file-set registry/config for Day-basin runtime artifacts and subtrees included in:
  - evening review inputs
  - archival/cutover bundle operations
  - resurfacing/review scans (where applicable)
- support add/remove/update of file types (for example Nara `FLOW.md`, `DREAMS.md`) by configuration/contract change + tests, not cron-job code rewrites
- each file-set entry should declare at minimum:
  - path slot (relative to Day or NOW basin)
  - artifact/template family expectation (CT/CT' lineage where applicable)
  - inclusion mode per cron flow (`review`, `archive`, `resurface`, etc.)
  - required/optional status
- shared path service resolves concrete paths; Chronos jobs consume the resolved set
- Khora/Hen/Anima contracts must not infer file participation from ad hoc filename heuristics when a file-set declaration exists

Nara examples (first working version planning direction):
- `nara/FLOW.md` as a CT0-derived invocation profile (journal/flow)
- `nara/DREAMS.md` as a CT3-derived invocation profile (dream/archetypal)
- daily-note data piped to the Electron app remains stored as Day/Nara Present artifacts and enters archival through the same file-set contract

#### Canonical Bimba path reminder (shared across modules)

```
/Idea/Bimba/World/
  {EntityName}.md                     ← canonical loose form/spec file (flat root)
  Daily-Note.md                       ← canonical loose form for daily-note artifact family (example)
  NOW.md                              ← canonical loose form for NOW artifact family (example)
  Types/
    Templates/
      CT4b'.canvas                    ← canonical template canvas (example)
      CT4b'-NOW.canvas                ← canonical NOW-profile template canvas (optional profile-specific canvas)
      (other CT/CT' template canvases)
    {EntityName}/
      {EntityName}.canvas             ← process/MOC workspace / type-local MOC
      (working files)
```

Rule:
- no module should write canonical forms to `/Bimba/Forms/`
- canonical form target is `Idea/Bimba/World/*.md`

Template residency rule (locked):
- canonical template definitions/canvases live under `Idea/Bimba/World/Types/Templates/`
- canonical loose files in `Idea/Bimba/World/*.md` represent named canonical artifact forms/specs that can be instantiated at runtime
- runtime Day/NOW files in `Idea/Empty/Present/...` are invocations (Pratibimba artifacts), not template definitions

#### Archival path convention (Chronos-managed)

Chronos archives the entire Day folder as a unit:

- `Idea/Empty/Present/{DD-MM-YYYY}/`
- → `Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`

This preserves Day + all child NOW contexts as one temporal lineage bundle.

#### Chronos cutover invariant (two-day presence across thresholds)

Chronos + Khora + native lifecycle integration must preserve a hard Day cutover invariant:

- across evening review / archive thresholds and day-boundary transitions, the system must maintain stable access to:
  - the active `today` Day context
  - the immediately prior `yesterday` Day context (bounded archived Day folder)
- no cutover phase may leave a gap where neither prior-day nor current-day Day context is stably available
- cutover handling must be idempotent under retries/re-entrancy (cron rerun, hook replay, partial failure recovery)
- active child NOW subsessions that cross the threshold must preserve correct Day lineage and avoid duplicate archival/finalization writes
- the bounded `yesterday` archive location/label must be produced and resolved through the shared path service contract

Implementation direction:
- use existing Chronos cron/heartbeat/calendar + Obsidian periodic-note integration surfaces for cutover and resurfacing behavior
- do not introduce a separate new Chronos skill path for this

#### Shared path service requirement (ta-onta package architecture)

For first working version implementation:

- path conventions must be implemented as a **shared ta-onta path service/module** (single source)
- consumers (`khora`, `chronos`, `anima`, `aletheia`, `hen`) call the shared service
- direct module-local string path construction for shared runtime paths is a contract violation

### Anima runtime interaction matrix (first working version target)

This table is the decisive wiring contract for runtime execution. It is intentionally simple and uses the existing module/tool boundaries.
It is an interaction matrix, not a rigid serial pipeline; agentic dynamics remain runtime-driven.

| Runtime action | Anima (executor) | Aletheia check path | Hen contract role | Khora IO/queue role | Moirai/Neo4j role | Chronos role |
|---|---|---|---|---|---|---|
| Start day session | Request/open Day context (`CT4b'`) | Anansi orients against `COORDINATE-MAP.md`; Janus validates temporal envelope | Classify Day artifact + required template/provenance fields | Read/write Day artifact; stage session sync intent | Optional lineage/query checks if Day references prior graph state | Establish active day thread / continuity |
| Spawn subsession NOW | Create child NOW execution context under Day | Anansi confirms coordinate family scope; Janus checks Day->NOW temporal fit | Define NOW artifact contract and Day backlink requirements | Write NOW artifact + queue event + cache HOT state | Optional assert/query of Day->NOW lineage | Register subsession in thread continuity |
| Subagent / external invocation | Bind execution to a specific NOW child | Anansi validates coordinate placement; Agora retrieves context if needed | Validate artifact role + template output expectations | Persist runtime traces / outputs; queue handoff | Moirai query/assert only when graph update is required | Track bounded execution window in day thread |
| Ontology-sensitive write (Seeds/World/Types) | Pause execution for semantic checks before write | Anansi (placement) + Moirai (lineage/relation) + Agora (supporting context) | Validate artifact class, schema, and canonical/provisional status | Perform filesystem write and stage sync envelope | Execute graph operations on demand | Note temporal event if it affects day synthesis |
| Day synthesis / close-loop update | Merge NOW outputs back into Day sections | Janus checks temporal closure; Agora/Anansi validate placement of conclusions | Validate Day section schema + provenance fields | Write Day updates and stage sync | Moirai reflect/assert crystallized links when needed | Mark continuity state for next Day / archive boundary |
| Archive / day rollover | Trigger bounded close and handoff | Janus leads temporal checks; Anansi verifies placement of carry-forward artifacts | Confirm archival artifact roles and day lineage closure | Persist archive artifacts and queue terminal events | Optional final graph assertions/links | Execute thread handoff into next Day context |

### Coordinate retrieval guidance for agents/skills (simple, existing-tool first)

Do not overbuild a new coordination mechanism when the existing docs/tools can provide canonical orientation.

Preferred sources for coordinate meaning/function during execution:
- `Idea/Empty/COORDINATE-MAP.md` (primary orientation source)
- relevant canonical family docs in `Idea/Bimba/World/*` (once consolidated, e.g. `Sx'.md` with embedded `Cx` listings)
- paradigm references when needed for deeper interpretive context (use as secondary support, not substitute for canonical map/contracts)

Source-of-truth placement rule:
- coordinate family engagement rules belong in the coordinate-system sources (primarily `COORDINATE-MAP.md`, then canonical `S` / `S'` family docs)
- this wiring document specifies how ta-onta consumes/enforces those rules at runtime

Design rule:
- Coordinates + wikilinks + Hen artifact contracts should carry most linking semantics.
- Queue metadata and runtime state should support execution/handoff, not replace coordinate semantics.

Relational-forward reasoning rule (Aletheia/Hen/Khora workflows):
- workflows that reason over links/proposals/search neighborhoods should be aware of the six `C`-family types (`C0..C5`, including inversions) and their functions/natures
- this awareness is sourced from `COORDINATE-MAP.md` / canonical coordinate docs, not hardcoded as ad hoc local enums in helper layers
- this enables Aletheia to think over canonical + latent relations using coordinate semantics rather than flat fuzzy-link lists

## Hen Module Focus: Contract and Staging Implications

Hen is the right place to formalize and protect the filesystem contracts because it already spans:

- template registry (`Seeds/S` as template source),
- frontmatter parsing/splitting,
- topology indexing across markdown files,
- sync invocation validation,
- Neo4j coordination and lock boundaries.

### Ownership clarification (intended)

- **Hen owns artifact contracts** (identity, schema, template provenance, classification).
- Artifacts are products of the template system.
- `CT4b'` is a canonical template-level authority in this sense (not just a helpful note).
- Khora writes/queues runtime artifacts at the filesystem edge, but Hen should remain the semantic gatekeeper for what kind of artifact was created and how it is classified.
- Artifact classification should be **coordinate-native via CT/CT' template lenses** (with `CTX = CT(x)` typed instances) wherever possible; generic `artifact_role` labels are transport/runtime conveniences, not replacements for coordinate semantics.

This should reduce ambiguity around "who owns what" once the coordinate system is fully fleshed out.

### Canonical template definitions vs runtime invocations (Bimba / Pratibimba distinction)

This needs to be explicit so template-ground evolution and runtime artifact naming do not conflict.

#### Template law (locked)

- Canonical CTx/CT' template types are invocable template authorities (Bimba-side ground)
- Invocations produce specific runtime artifact files (Pratibimba-side instances)
- The same CT/CT' template family can produce multiple named artifact forms with different runtime functions

Primary example (CT4b'):
- `CT4b'` canonical template family (versioned template ground)
- `daily-note.md` = CT4b' invocation profile for Day-parent context
- `now.md` = CT4b' invocation profile for bounded child runtime context

This allows:
- versioned canonical template evolution (improving the frozen process)
- stable named operational files
- meaningful artifact lineage (`invoked_from_template`, `template_version`, profile/nature)

#### Invocation lineage requirement (Hen contract implication)

Hen contracts should distinguish at least:

- template definition identity (`template_id`, `template_version`, `template_coordinate`)
- invocation identity (`artifact_id`, `artifact_name`, `invocation_profile`, `invocation_kind`)
- lineage (`invoked_from_template_id`, `invoked_from_template_version`, parent Day/NOW lineage where applicable)

This is how the system can improve templates while preserving the historical meaning of prior runtime invocations.

#### Frontmatter / Neo4j naming alignment for template invocations (locked)

This naming alignment should be implemented in frontmatter and mirrored into Neo4j node properties so template lineage and runtime context-frame state are visible at file level and graph level.

Key harmonization rule:
- canonical persisted frontmatter / Neo4j properties should follow the same coordinate-key pattern as the rest of the system: `{x}_{n}_{semantic_or_data_type}`
- human-readable labels like `template_id`, `template_version`, `invocation_profile`, `artifact_name` may still be used in docs/service interfaces as conceptual aliases, but should not remain floating canonical persisted properties

Primary conceptual naming convention (for readability in docs/contracts):

- `template_id` = canonical template family identifier (for example `CT4b'`)
- `template_version` = canonical template version used for the invocation
- `invocation_profile` = profile/function of the invocation within the template family
  - examples: `day_parent`, `now_child`
- `artifact_name` = practical filename identity (for example `daily-note.md`, `now.md`)

Coordinate-native persisted alignment (first working version target):

- template lineage/invocation profile data should be stored under canonical coordinate keys (Hen-normalized), for example:
  - `c_4_template_id`
  - `c_4_template_version`
  - `c_4_invocation_profile`
  - `c_1_artifact_name`
- exact final key names must obey the ta-onta `PLAN.md` relation/frontmatter law and Hen normalization rules, but the principle is now locked: **coordinate-native persisted keys, not floating ad hoc properties**

Why this convention:
- keeps canonical template law (`CT/CT'`) separate from operational file naming
- avoids inventing separate template families for named runtime files
- makes lineage explicit and stable across template evolution
- keeps all invocation data traversable along coordinate lines (important for future ML over the coordinate system)

#### Room in frontmatter and Neo4j for the six S4-X' context-frame coordinates (explicit)

We now make this explicit:
- any relevant S4-X' context-frame coordinates may be stored in canonical coordinate-based frontmatter and mirrored into Neo4j schema/properties
- this is how file-level lineage/identity remains genuinely aligned with the paradigm

Recommended coordinate-native persisted keys (frontmatter + Neo4j property mapping):

- use the **context-frame coordinate families directly** as `{x}_{n}_{semantic}` keys (no `S4` wrapper prefix)
- examples:
  - `cpf_0_polarity`  -> Context Frame Polarity (CPF)
  - `ct_4_type`       -> CT / CT' typed lens (this is where `CTX = CT(x)` is represented)
  - `cp_2_position`   -> Context Positions
  - `cf_3_mode`       -> Context Frame / contact mode
  - `cfp_0_thread`    -> Context Frame Thread Type
  - `cs_0_sequence`   -> Context Sequence
- exact semantic suffixes remain Hen-normalized, but the family prefix must be the direct context-frame family (`cpf`, `ct`, `cp`, `cf`, `cfp`, `cs`)

Important rule (`CTX` handling):
- do **not** create a separate `ctx_*` family for persisted context-frame data
- `CTX = CT(x)` is represented in the `ct_*` family (for example `ct_4_type: "CT4b'"`)

Important rule (inverse/path-safe encoding across persisted keys and path tokens):
- when inverse/prime notation `'` is not safe or ergonomic in filenames/path tokens/property keys, encode inverse as `i`
- do **not** use `p` as a substitute for inverse/prime
- keep canonical human-readable values free to use `'` where supported (for example `ct_4_type: "CT4b'"`)

These S4-X' coordinate fields are:
- optional unless required by the artifact contract/profile
- allowed in frontmatter for runtime/canonical artifacts where they carry real meaning
- mirrored into Neo4j when present so graph queries and lineage checks can reason over runtime context frames

Example (Day invocation artifact frontmatter concept; coordinate-native persisted form):

```yaml
c_4_template_id: "CT4b'"
c_4_template_version: "v1"
c_4_invocation_profile: "day_parent"
c_1_artifact_name: "daily-note.md"
c_4_invoked_from_template_id: "CT4b'"
c_4_invoked_from_template_version: "v1"
ct_4_type: "CT4b'"
cpf_0_polarity: "(00/00)"
cfp_0_thread: "CFP0"
cs_0_sequence: "CS0"
```

Neo4j mapping rule:
- Hen frontmatter-to-Neo4j mapping should preserve these coordinate-native fields deterministically as node properties (or normalized equivalents) without dropping S4-X' fields when present
- relation naming law still comes from ta-onta `PLAN.md`; this section is about node/property schema room, not relation-type renaming

### Template lens grounding (documented sources already available)

This plan is not inventing template semantics from scratch. It imports from existing template docs and planning work, including:

- `Idea/Empty/Present/22-02-2026-USEFUL-FOR-Ta-Onta/CT4b-MASTER-TEMPLATE.md` (CT4b' Day hub + Day/NOW distinction)
- `Idea/Bimba/Seeds/S/S1/S1'/S1-TEMPLATE-PRINCIPLES.md` (CT vs CT' and daily note metatemplate principles)
- `Idea/Bimba/Seeds/S/S1/S1'/S1-CONTEXT-OPERATIONS.md` (context/template operations and runtime implications)
- `Idea/Bimba/Seeds/S/S1/S1'/S1-STRUCTURE-PROPOSAL.md` (S1-X' template alignment, CT4b' master framing)

### Day/NOW artifact fields (Hen-owned contract minimums)

Hen should define the minimum required fields for Day and NOW artifacts so Anima/Khora/Aletheia operate against one contract.

| Artifact | Role | Required lineage/provenance (minimum) | Required contract fields (minimum) | Produced/managed by |
|---|---|---|---|---|
| Day (`CT4b'` invocation) | Parent temporal context frame | `session_id` (opening session), `day_id`, `created_at`, `updated_at` | `artifact_role=day`, `ctx_type=CT4b`, coordinate-native template lineage/profile fields (Hen-normalized; conceptual aliases: `template_id`, `template_version`, `artifact_name=daily-note.md`, `invocation_profile=day_parent`), `source_coordinate`, optional context-frame coordinate-family fields (`ct_*`, `cpf_*`, `cp_*`, `cf_*`, `cfp_*`, `cs_*`) | Anima executes; Hen defines contract; Khora persists |
| NOW (child `CT4b'` invocation) | Bounded runtime execution context | `session_id`, `now_id`, `parent_day_id`, `created_at`, `invocation_kind` | `artifact_role=now`, `ctx_type` (child context), coordinate-native template lineage/profile fields (Hen-normalized; conceptual aliases: `template_id`, `template_version`, `artifact_name=now.md`, `invocation_profile=now_child`), `source_coordinate_scope`, optional context-frame coordinate-family fields (`ct_*`, `cpf_*`, `cp_*`, `cf_*`, `cfp_*`, `cs_*`) | Anima executes; Hen defines contract; Khora persists |
| Day synthesis update | Parent-context merge event | `parent_day_id`, `source_now_id` (or list), `merged_at`, `operator_session_id` | `artifact_role=day_update`, `merge_reason`, `provenance_refs` | Anima executes; Hen validates; Khora persists |
| NOW terminal record (close/return) | Subsession closure trace | `now_id`, `parent_day_id`, `closed_at`, `outcome_status` | `artifact_role=now_terminal`, `closure_type`, `handoff_target` (if any) | Anima executes; Hen validates; Khora persists/queues |

### What Hen already gives us (usable foundation)

- `templates.seedsRoot` default points at `Idea/Bimba/Seeds/S`
- template get/render/invoke path exists
- topology index can walk markdown and split metadata vs coordinate fields
- sync invocation validation exists (gate-able)

### Critical contract drift to fix (document now, implement later)

1. Frontmatter schema drift
- Hen template invocation still writes deprecated fields like `coordinate` and `ql_position`.
- Hen frontmatter splitting still whitelists deprecated metadata and old key grammar.

2. Coordinate-key grammar drift
- Current frontmatter regex is old-style (`pos...` and `c0_...` style patterns), not the planned `c_0_*` / `p_4_*` grammar.
- This blocks proper parsing/indexing of the intended canonical schema.

3. Topology classification assumptions
- `now.md` and dated daily filename assumptions are narrow and still reflect older layout conventions.
- Must evolve to support the day-as-context structure once finalized.

## Khora Obsidian Sync Queue Staging (Foundation Contract)

Khora currently writes sync queue artifacts (`.khora-sync-queue.jsonl`) and acts as the filesystem edge.
This queue exists to preserve Obsidian link health for file updates and to stage non-canonical Smart Connections proposals.

### Queue purpose (locked)

- Route filesystem updates through Obsidian harmonization paths to preserve link integrity.
- Carry non-canonical Smart Connections proposals for review/consumption.
- Provide a simple auditable handoff record for runtime update actions.

Clarification (Aletheia/Hen apportioning):
- the Smart Connections proposal pool is the intended source of **non-canonical link suggestions** for Aletheia reasoning/assessment
- Hen's role on this path is contract/topology support (and canonical indexing after approved writes), not owning proposal interpretation logic

Derived link aggregation naming rule (if materialized in frontmatter/cache projections):
- aggregated link summaries/projections should use the `c_*` coordinate family (not `p_*`)
- examples (conceptual, Hen-normalized): `c_0_links`, `c_0_link_targets`, `c_4_link_clusters`
- these are **derived/projection fields**, not canonical link assertions by themselves
- canonical link truth remains:
  - artifact content `[[wikilinks]]`
  - Hen-indexed topology relations (for example `c_0_links_to`)

### Queue classes already visible

- `obsidian_sync` (high priority session handoff)
- `neo4j_sync` (thought extraction / graph sync intent)

### Constraint: do not overcomplicate linking

Do not turn the queue into a second graph, schema registry, or artifact ontology service.

Preferred linking strategy:
- coordinates
- wikilinks
- provenance fields

The queue should support Obsidian-safe file harmonization and proposal transport only.

### Minimal queue contract (first working version)

Keep queue records minimal and operational:

- `event_type` (for example `obsidian_sync`, `neo4j_sync`)
- `source_module`
- `target_path` or `target_paths`
- `priority`
- `timestamp`
- `provenance` (session/day/now linkage ids when available)

If additional fields are needed later, they must be justified by concrete runtime behavior, not speculative schema design.

## Cron Result Delivery Contract (Native Configurable Channels)

Cron-produced outputs (for example evening review summaries) should be deliverable through native Epi-Claw-configured session channels rather than ad hoc transport logic.

Contract direction:

- cron execution remains visible as native invocation/lifecycle traffic (shared hook observability applies)
- delivery targets (for example Telegram) are configured through native/runtime config surfaces, not hardcoded in ta-onta modules
- delivery should use isolated, traceable session naming under the shared session naming/parsing contract (cron execution session + delivery interaction lineage)
- delivery payloads should be concise and operational (summary/status + artifact references/links), with natural metadata logging for lineage/correlation
- delivery failures must be visible in lifecycle/hook telemetry and cron execution results (no silent success)
- when delivery is interactive (for example Telegram evening review), the resulting thread/session should remain replyable/inspectable through the native channel workflow

## Error Policy (Fail Fast, No Silent Fallbacks)

Foundational runtime rule for first working version:

- If a required contract/path/service is unavailable or invalid, **throw explicit errors** with actionable diagnostics.
- Do not silently degrade, silently fall back, or invent alternate semantics at runtime.
- "Fallback" behavior is only acceptable when explicitly declared as a bounded dev/test mode in module-specific contracts.

This is to prevent hidden drift and preserve trust in the system during bring-up.

## First Working Version In-Scope Lock (No Silent De-Scoping)

This section exists to prevent a recurring failure mode where planned capabilities are treated as optional during execution despite being explicitly required for system bring-up.

Rule:
- if a capability is listed here as in-scope, Ralph/Codex execution must either implement + validate it or fail the run with an explicit blocker
- "we'll do it later" is not an acceptable implicit outcome for these items

### In-scope capability lock (first working version)

| Capability | Status for first working version | Why it is in-scope | Notes |
|---|---|---|---|
| Native hook/lifecycle integration | **Required** | Core runtime coordination depends on native Epi-Claw/OpenClaw lifecycle and invocation surfaces | No bypass paths for Chronos/Anima/Pleroma/Aletheia |
| Hook observability (IDs/timing/outcomes/lineage) | **Required** | Needed to verify routing correctness and debug integrated runtime behavior | Must cover cron-triggered native invocations too |
| KAIROS temporal enrichment (Chronos) | **Required** | Temporal context quality is part of intended runtime contract, not a cosmetic add-on | Integrate via existing Chronos cron/heartbeat/calendar/Obsidian periodic-note systems (no separate new Chronos skill) |
| TaskNotes integration (Anima task surface) | **Required** | Task orchestration must bind to real markdown task artifacts in CT4b Day/NOW task spaces | Position #1 task lane integration; may use TaskNotes `.md` and/or `TASK.md` in NOW folders as locked variant |
| 1Password skill credential boundary centralization | **Required** | Credential/secrets centralization already exists and must be consumed instead of plugin-local handling | Pleroma/Anima/Chronos integrations consume existing skill/runtime surfaces |
| tmux / external terminal runtime integration (including mprocs launcher surfaces where used) | **Required** | External CLI/terminal execution is part of intended orchestration/runtime operation | Use native invocation policies + tmux skill; integrate mprocs launcher/session management surfaces |
| Notion mediation/content publishing | **Feature-flagged / optional for core e2e** | Useful but not required to prove ta-onta integrated runtime core | Keep bounded and non-blocking for core e2e unless explicitly promoted |

### Scope-clarity rule for execution artifacts (`prd.json`, Ralph loop)

The execution PRD must make explicit for each in-scope capability:

- implementation task(s)
- wiring boundary (what shared/native surface it integrates with)
- validation path (unit/integration/e2e scenario)
- non-goals (what is not being built)

If these are not explicit, the capability is likely to be silently de-scoped during execution.

## Full-System Conformance Test Matrix (first working version readiness)

The goal of this matrix is to reach the point where we can tell Epi-Claw:
- install ta-onta plugin
- run end-to-end scenarios
- trust failures as real contract violations (not hidden fallback behavior)

These are **cross-surface** conformance scenarios, not module-isolated tests.

### Core conformance scenarios (required before e2e discharge)

| Scenario ID | Scenario | Surfaces under test | Pass condition (contract-level) |
|---|---|---|---|
| `E2E-01` | Day open / parent context initialization | Anima + Khora + Hen + Chronos | Day parent artifact created/read at locked path; Hen contract fields present; Chronos thread initialized |
| `E2E-02` | Child NOW spawn for bounded execution | Anima + Khora + Hen + Chronos | Child NOW folder/name follows locked convention; NOW links to parent Day; lineage IDs recorded |
| `E2E-03` | Aletheia gate invocation with Janus envelope | Anima/Aletheia + Janus + Pleroma/Moirai | Gate receives temporal envelope; Moirai path invoked correctly; result returned with explicit assessment |
| `E2E-04` | Ontology-sensitive write with coordinate checks | Anima + Aletheia (Anansi/Moirai/Agora as needed) + Hen + Khora | Required gate/checks invoked; Hen contract validates artifact; write lands in correct filesystem zone/path |
| `E2E-05` | Obsidian-safe file update queue path | Khora + Obsidian sync path | Queue record written (minimal contract); file harmonization preserves link integrity; no queue schema overreach |
| `E2E-06` | Smart Connections non-canonical proposal flow | Khora + Aletheia/Hen consumers | Proposal transported as non-canonical artifact/proposal path, no canonical write implied |
| `E2E-07` | Aletheia closure -> Day merge | Aletheia + Anima + Khora + Hen + Chronos | Closure payload binds NOW lineage; Day synthesis update recorded with provenance; parent Day updated cleanly |
| `E2E-08` | Chronos rollover (Day archive + thread continuity) | Chronos + Khora + Anima + Hen | Day folder archived as unit; child NOW bundle preserved; next-Day continuity state established |
| `E2E-09` | Shared path service enforcement | Khora + Chronos + Anima + Aletheia + Hen | Shared path service used for common paths; no module-local divergent shared path literals in runtime codepaths |
| `E2E-10` | Fail-fast contract violation behavior | Any affected surface | Invalid/missing path/contract/service throws explicit error; no silent fallback semantics |
| `E2E-11` | Native lifecycle + hook routing (no bypass) | Khora + Chronos + Anima + Pleroma + Aletheia + OpenClaw hook/invocation surfaces | Chronos/agent-triggered work flows through native hook + native spawn/invocation paths; no alternate bypass execution path used |
| `E2E-12` | Hook observability and lifecycle telemetry completeness | Khora + Chronos + Anima + Pleroma + Aletheia | Hook/lifecycle events emit IDs, timing, status, module, and lineage correlation fields for key runtime actions |
| `E2E-13` | KAIROS temporal enrichment integration (essential) | Chronos + Anima + Janus/Aletheia consumers | KAIROS context is produced and propagated into runtime temporal envelope/capsule paths per contract using existing Chronos cron/heartbeat/calendar/periodic-note integration surfaces (no separate Chronos skill path) |
| `E2E-14` | TaskNotes/CT4b task-lane integration across Day and NOW | Anima + Khora + Hen + Chronos + Obsidian task markdown surface | Task markdown artifacts in Day/NOW task spaces map into Anima orchestration with CT4b-aware provenance and explicit update boundaries |
| `E2E-15` | 1Password skill credential boundary centralization | Pleroma + Anima + Chronos (as needed) + native skill invocation | Runtime integrations resolve secrets via existing 1Password skill surfaces; no plugin-local credential store/orchestration duplication |
| `E2E-16` | tmux / external terminal runtime + mprocs launcher integration | Pleroma + Anima + native invocation surfaces + tmux skill | External runtime execution is invoked via declared/native policy surfaces with explicit telemetry and parent-child lineage/handoff metadata |
| `E2E-17` | Template alignment analysis + redesign suggestion loop (CT/CT' template improvement) | Hen + Aletheia + Anima (+ coordinate-map sources) | System can inspect a named canonical artifact family (for example `Daily-Note.md`, `NOW.md`, `anima.md`, `identity.md`, `paradigm.md`, `Tools.md`), identify QL/CT template alignment, and produce explicit redesign suggestions with lineage to the canonical template definition rather than mutating runtime invocations directly |
| `E2E-18` | NOW-thought lifecycle -> T5 extraction -> paradigm refinement loop | Anima + Khora + Hen + Aletheia + Chronos (+ `Idea/Thought` + `World`) | Task-run thoughts are emitted into flat `NOW/.../thoughts/` with T-prefixed filenames, programmatically routed/preserved with provenance, Aletheia extracts value (not file-organization) into T5 / CT5-aligned canonical refinement inputs, and outputs retain lineage back to Day/NOW/task/template context |
| `E2E-19` | Parallel research + contemplation execution (Pleroma + contextual Aletheia use) | Anima + Pleroma + Aletheia + Khora + Hen + Chronos | Anima can run research and contemplation as concurrent/related runtime activities using Pleroma execution plus a contextual "use aletheia" skillset surface, producing T-aligned thought artifacts and CT5-aligned outputs with preserved lineage/gating and explicit approval boundaries where required |
| `E2E-20` | Native session-propagation spine + template-rendered wikilink breadcrumbs | OpenClaw native spawn/invocation + Anima + Khora + Hen templates + Chronos (when triggered) | Native subagent/agentic execution uses centralized session naming/parsing and propagates Day/NOW lineage through the shared spine; Khora/Hen template invocation writes content-level `[[wikilink]]` breadcrumbs (not code literals) into the correct Day/NOW/task artifacts; finalize paths are idempotent (no duplicate session-end writes) |
| `E2E-21` | Chronos cutover invariant (two-day presence across evening review/day change thresholds) | Chronos + Khora + Anima + Hen + native lifecycle/hook surfaces | Across evening review/day-boundary cutover (including retry/re-entry), the active `today` Day and bounded archived `yesterday` Day remain stably accessible with correct parent/child NOW lineage and no duplicate archival/finalization writes |
| `E2E-22` | Cron evening review delivery via native configurable Telegram session path | Chronos + native cron/invocation surfaces + Khora observability + native Telegram channel integration | Evening review output is generated in cron flow and delivered via a native-configured Telegram session/channel path with traceable lineage/metadata, visible lifecycle telemetry, and replyable interaction context (no ad hoc delivery bypass) |
| `E2E-23` | Aletheia retrieval/tooling deprecation + claude-mem parity verification | Aletheia + Hen + Khora + OneContext + native Claude/OpenClaw memory surfaces | Aletheia retrieval paths use Hen GraphRAG/topology + cache/OneContext surfaces (not placeholder `taonta.aletheia.vector_search`); claude-mem parity assumptions are verified against wired native integration surfaces and documented handoff behavior |
| `E2E-24` | Chronos declarative file-set flow for Nara live docs (`FLOW.md`, `DREAMS.md`) | Chronos + Khora + Hen + shared path/file-set services + Electron-facing Present storage conventions | Day-basin file-set config can include/update/remove Nara live docs (e.g. `nara/FLOW.md`, `nara/DREAMS.md`) for review/archive/resurfacing flows without cron-job code rewiring; archival/cutover behavior remains correct and testable |

### Coverage expectation (not just smoke tests)

Testing posture for first working version:

- unit tests for shared path service + relation normalization + Hen contract validators
- integration tests for module-to-module tool calls (intra-plugin `api.invokeTool()` surfaces)
- conformance/e2e tests for the scenarios above
- failure-path tests for explicit error behavior (no silent fallback drift)

This matrix is the readiness target for generating and running the external execution PRD (`prd.json`) and for issuing the runtime command: "install ta-onta plugin and run the e2e scenarios".

### Conformance expansion requirement (no partial e2e closure)

For first working version readiness, "e2e scenarios" means the full matrix above (including native hook/lifecycle, KAIROS, TaskNotes, 1Password, tmux/external runtime coverage, template-alignment redesign suggestion testing, NOW-thought -> T5 -> paradigm refinement loop testing, parallel research+contemplation execution testing, the native session-propagation spine + template-rendered wikilink breadcrumb path, Chronos two-day cutover invariants, native-channel cron delivery paths, Aletheia retrieval/tooling deprecation + claude-mem parity verification, and Chronos declarative Nara file-set flow coverage), not only the first ten scenarios.

## Redis Cache Coverage (Bimba-aware tier model)

### Current useful baseline

Khora already defines cache keys for:
- HOT now state (`cache:hot:present:now.md` / `cache:hot:empty:now.md`)
- session NOW (`session:{id}:now:md`)
- session metadata (`session:{id}:now:meta`)
- WARM thought buckets (`cache:warm:thought:{bucket}/{file}`)

Aletheia docs/tools also describe HOT/WARM/COLD tiers, but still include outdated path assumptions (for example `/Bimba/Forms/*`).

### Foundation requirement (documentation target)

Redis coverage must reflect the full Bimba ontology, not just NOW/thought flows.

#### HOT (runtime surfaces)
- `Idea/Empty/Present/*` active day/NOW/session working files
- session NOW + metadata

#### WARM (recent operational knowledge)
- `Idea/Thought/T*/...`
- recent extracted learnings
- continuation and near-session artifacts

#### COLD (canonical and semi-canonical Bimba)
- `Idea/Bimba/World/*` canonical forms
- `Idea/Bimba/World/Types/*` MOCs and stable type work products (read-mostly subsets)
- selected template material under `Idea/Bimba/Seeds/S/*` when used frequently by Hen/Aletheia

### Important distinction

Cache tiering should be based on artifact role and volatility, not only path string matching.

Example:
- A template under `Seeds/S/...` may be COLD if it is stable and reused often.
- A temporary PRD under `Seeds/...` should not be treated like canonical cold cache without explicit policy.

## Seeds <-> Thoughts Relationship (To Formalize)

This relation is foundational and currently under-specified.

### Working model (locked)

- `Seeds` = pre-canonical coordination basin (design/spec/pruning bundles)
- `NOW/.../thoughts/` = task-run-local thought artifact basin (HOT, invocation-scoped)
- `Idea/Thought/` = present-focused thought pool (WARM) after programmatic routing from task runs

### NOW-local thought handling (clarified)

Within each child NOW folder:

- use a single flat `thoughts/` folder
- do **not** create deeper `T0`/`T1`/... subfolders inside the NOW folder
- the thought artifact's T-alignment is encoded in the filename prefix

Naming rule (minimum):
- every thought file in `NOW/.../thoughts/` begins with a T-family alignment token (`T0..T5`, including inverse/prime form where applicable)
- filename should also include enough identity for tracking outside the NOW context (datetime + name/slug + session/task relation)

Path-safe inversion encoding rule (locked):
- canonical/prose coordinate notation may use `'` (for example `T5'`, `CT4b'`)
- when `'` is not path-safe (filenames, path tokens, frontmatter/property keys), use `i` for **inverse**
- do **not** use `p` for prime/inverse encoding (that collides conceptually with existing coordinate semantics)
- apply the same inversion encoding rule across coordinate families for path-safe/persisted forms

Example shape (illustrative only; Hen normalization finalizes exact syntax):
- `T2__20260223-143012__task-foo__session-abc.md`
- `T5i__20260223-151901__mobius-return__session-abc.md`

### T-family <-> CT-family alignment (locked simplification)

For first working version, align thought roles (`T`) with template/process lenses (`CT/CT'`) directly:

- `T0` <-> `CT0`
- `T1` <-> `CT1`
- `T2` <-> `CT2`
- `T3` <-> `CT3`
- `T4` <-> `CT4a` and `CT4b` (runtime distinction remains active)
- `T5` <-> `CT5`

Implications:
- thought artifacts remain T-aligned while also carrying CT/CT' template lineage/context where meaningful
- `T5` extraction outputs should default to `CT5` template-family outputs (contemplation/insight/wisdom forms)
- template prompting/task types/content types should make this alignment legible in normal runtime use (for example CT1 data-grab templates yielding T1-aligned artifacts)

### Programmatic move to `Idea/Thought/` (not manual foldering)

Routing from NOW-local `thoughts/` into the shared `Idea/Thought/` space should be programmatic (Khora/Chronos/Hen/Anima runtime handling as contracted).

Implication:
- humans/agents working in NOW context do not need to hand-sort thought files into `T0..T5` folders during execution
- T-alignment in the filename/frontmatter is sufficient for later routing/storage

### Aletheia role clarification (important)

Aletheia's core role here is **not** thought-file organization.

Aletheia is responsible for:
- extracting value from thought artifacts (learnings, insights, wisdom)
- generating/promoting higher-value outputs (especially `CT5`-template-aligned outputs for `T5` contemplative pool and crystallization inputs)
- feeding canonical refinement loops (World / paradigm/specification layer) through Anima/Hen/Chronos contracts

Aletheia is **not** the primary file janitor for NOW-local thought routing.

### T-bucket semantics (clarified)

- Thought buckets (`T0..T5` and inversions) are semantic/coordinate roles, not arbitrary folders
- Coordinate alignment should express genuine role (including inverse `'` semantics where applicable)
- Avoid splitting "semantic type" and "coordinate role" into separate taxonomies unless a real conflict is demonstrated

### After-task and post-crystallization behavior

- Task-run thought artifacts remain in NOW-local `thoughts/` during execution
- Programmatic routing may place thought artifacts into `Idea/Thought/` for present-focused pool use
- After relevant value is extracted/crystallized, thought artifacts can be archived so `Idea/Thought/` stays relatively clean and present-focused
- Archive on crystallization success should be gated through the Aletheia collaboration gate when approval-sensitive promotion/refinement is involved
- Unresolved/long-standing thoughts may remain in `Idea/Thought/` as "back-of-mind" material
- Chronos should resurface those thoughts through existing cron/heartbeat/calendar + Obsidian periodic-note integrations (weekly/monthly review windows), not a separate new Chronos skill
- Day-history archival preserves the NOW bundle lineage regardless of thought routing

### Paradigm-driven development loop (core design intent)

This is a central loop, not a side detail:

- task execution generates thought artifacts (NOW-local, T-aligned)
- Aletheia extracts learnings/insights/wisdom (especially toward `T5` contemplative pool)
- Aletheia can materialize context-appropriate `CT5` outputs (for example insight/wisdom forms) that re-enter canonical/template refinement loops
- contemplation/refinement operates over canonical entities/paradigm files (`World`, coordinate families, system specs)
- refined canonical ground (Bimba) drives future design/development processes
- new runtime tasks flow through Day/NOW, generating new thoughts again

In this sense:
- the specification layer is the paradigm layer
- the paradigm layer drives development praxis

### Contract requirement

Thought artifacts should include enough provenance to answer:
- which session produced this?
- which day/NOW context?
- which task/invocation produced this?
- which seed/spec bundle informed it?
- what T-family alignment was assigned initially?
- whether it was routed to `Idea/Thought/`, extracted from, crystallized from, archived, superseded, or deprecated?

Lineage/provenance fields should remain coordinate-native in frontmatter/Neo4j mapping (Hen-normalized `{x}_{n}_{semantic}` law) rather than ad hoc metadata.

## Deprecation + Truth Extraction Workflow (Old Docs Mining)

We need a disciplined way to extract truth from old files while tracking deprecation.

### Goal

Build the harmonized foundation by parsing historical docs without inheriting their contradictions silently.

### Process (documentation workflow)

1. Candidate intake
- Add old file to review list (not canonical by default).

2. Claim extraction
- Pull concrete claims (path, schema, naming, lifecycle, relation semantics).

3. Classification
- Mark each claim as:
  - `true-current`
  - `true-target` (planned, not implemented)
  - `false/deprecated`
  - `unknown/needs verification`

4. Canonicalization
- Copy validated claims into this foundation plan (or successor canonical contract docs).

5. Deprecation annotation
- Record source file + what was extracted + what is deprecated.

### Tracking table (to extend)

| Source file | Domain | Status | Extracted truth | Deprecated content | Follow-up |
|---|---|---|---|---|---|
| `Idea/Bimba/World/S1'Cx.md` | S1 ontology | mixed | Forms flat in `World`, Types as MOC/process context | `posx_*` field naming | Update wording + schema examples |
| `Idea/Bimba/World/S1'.md` | S1 API | mixed | S1 layer framing | `World/Forms/` reference | Patch doc after foundation lock |
| `Idea/epi-claw/extensions/ta-onta/CONTRACT.md` | plugin contract | outdated | plugin boundaries still useful | `pos_x_*` relation format | Align to target schema |
| `Idea/epi-claw/extensions/ta-onta/PLAN.md` | relation/schema law | canonical (for relation law) | coordinate schema law, relation naming law, frontmatter law, plugin coordinate corrections | path conventions may still need central harmonization here | Treat as canonical relation-law source; import into this wiring doc |

## Documentation Structure Consolidation Rules (to stop drift)

### `Sx'Cx` consolidation

Rule:
- `Sx'Cx` listings live as sections inside the canonical `Sx'.md` file.

Implications:
- Standalone `S0'Cx.md`, `S1'Cx.md`, etc. are transitional drift artifacts.
- They may still be mined as sources during consolidation.
- Their surviving truths should be merged into the parent `Sx'.md`, then the standalone files can be deprecated.

Rationale:
- reduces duplicate canonical-looking files
- prevents independent drift between `Sx'.md` and `Sx'Cx.md`
- supports the "single canonical per concept family" principle

### Temporary use of `Idea/Empty/Present/22-02-2026-USEFUL-FOR-Ta-Onta`

Current interpretation:
- a focused thought-organization cluster for centralizing Day/NOW/Chronos/Ta-Onta integration thinking

Note:
- This is acceptable as an active planning basin.
- Consider later renaming/rehousing only after the foundation contract is stable (to avoid churn during definition).

## Action Plan (Wiring Lock -> Implementation)

### Action A: Wiring Lock (current)

- Finalize filesystem ontology and artifact classes.
- Finalize Seeds/Types/World/Thought roles.
- Finalize Day(parent) -> NOW(child) temporal artifact contract.
- Finalize centralized shared path conventions (Day/NOW pathing, naming, residency).
- Lock native Epi-Claw/OpenClaw hook + invocation surfaces as shared contract (no bypass).
- Lock hook observability contract for runtime lifecycle verification.
- Lock relation-law authority reference to ta-onta `PLAN.md`.
- Keep queue contract minimal and operational (Obsidian-safe harmonization + proposal transport).
- Establish deprecation extraction workflow.
- Record doc consolidation rules (`Sx'Cx` -> `Sx'.md`).
- Add architecture diagrams for the intended final integrated system (first proper actionable). Completed in US-002 Mermaid-first tranche; see `Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/README.md`.

### Action B: Shared Contract Consolidation (still documentation, no code)

- Hen canonical frontmatter grammar lock (`c_0_*`, `p_4_*`, etc.)
- Hen artifact typing via CT/CT' template lenses (`CTX = CT(x)` shorthand; coordinate-native contract)
- Shared Day/NOW path convention service contract (consumed by Khora/Chronos/Anima/Aletheia)
- Shared native hook/lifecycle + invocation surface contract (consumed by Khora/Chronos/Anima/Pleroma/Aletheia)
- Hook observability contract (IDs/timing/status/lineage fields)
- Aletheia path/caching contract aligned to Bimba ontology
- Chronos day/NOW/day-folder contract aligned to finalized day-as-context structure
- Lock explicit grammar/notation for the six context-frame-based coordinates, including clear `CTX = CT(x)` usage, so ownership and artifact-role ambiguity collapses into coordinate grammar
- Lock first working version in-scope capability list in execution PRD (KAIROS, TaskNotes, 1Password, tmux/external runtime, native hook/lifecycle integration)
- Lock canonical template definition vs runtime invocation law (CT/CT' template family -> named artifact files + lineage) including template residency under `World/Types/Templates`
- Lock bootstrap-safe paradigm kernel + Sophia-only distilled mission infusion from the approved source file (`docs/plans/2026-02-22-paradigm-kernel-and-sophia-heart-source.md`)
- Add PI/OpenClaw deep substrate customization mapping task reference (Epi-claw fork-level primitives for ta-onta alignment) using `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`

### Action C: First Working Version Implementation (after wiring verification)

- Code changes against locked shared contracts
- Tests updated in lockstep
- Observability added for hook/lifecycle and shared-contract drift detection
- Full-system conformance tests across the integrated runtime surfaces

## Immediate Documentation Actions (next passes)

1. Maintain/refine the system diagram set for the intended final integrated architecture (US-002 complete, now iterative)
- current diagram set index: `Idea/epi-claw/extensions/ta-onta/docs/architecture-diagrams/README.md`
- shared services/surfaces (filesystem paths, Hen template/contract, Redis, Neo4j)
- canonical template definitions vs runtime invocations (CT4b' -> `daily-note.md` / `now.md`) and template residency (`World/Types/Templates`)
- runtime interactions (Anima executor + Khora/Hen/Aletheia/Pleroma/Chronos)
- native hook/lifecycle + invocation routing (including cron-triggered native execution and no-bypass rule)
- Day(parent) <-> NOW(children) temporal/runtime topology
- write/update flow via Obsidian sync queue (link-health preserving, non-canonical Smart Connections proposals)

1b. Run diagram-first documentation reconciliation loop (US-001/US-002 seed)
- use `Idea/epi-claw/extensions/ta-onta/docs/documentation-workflow-skill-seed.md`
- Mermaid remains the active diagram form; `.canvas` is deferred until native support is stable
- reconcile this wiring doc against `INSTALL.md` and tranche grounding records before claiming freeze on any new contract slice

2. Materialize paradigm kernel + Sophia identity infusion from approved source
- source file: `docs/plans/2026-02-22-paradigm-kernel-and-sophia-heart-source.md`
- create/refresh root `PARADIGM.md` (bootstrap-safe compressed functional kernel)
- patch Sophia `ANIMA.md` only (distilled `Ontology` / `Sattva` infusion); do not inject full deep paradigm text into meta-Anima `ANIMA.md`
- verify Khora bootstrap resolves non-empty `PARADIGM.md` and Anima prompt compilation remains structurally valid

3. Run deep PI/OpenClaw customization mapping task (separate session) from reference doc
- reference file: `docs/plans/2026-02-23-pi-harness-customization-reference-for-ta-onta.md`
- output should produce an Epi-claw deep substrate customization map + port/adapt matrix (`pi-vs-claude-code`) + ta-onta binding plan
- use this to decide what moves below ta-onta into Epi-claw before further ta-onta wiring simplification

4. Patch canonical Bimba docs for internal contradictions
- remove `/Forms` references
- mark `.canvas.md` as error class
- clarify logical vs physical `world`
- fold `Sx'Cx` content into `Sx'.md` sections (begin with S1)

3. Extend this foundation document with appendices (instead of standalone notes unless needed)
- shared path conventions reference (Day/NOW folders, naming, residency)
- cache coverage matrix
- deprecation ledger

## Cross-Document Audit Appendix (Step 1 + Step 2)

This appendix records the first explicit cross-audit of:

- the unified memory system vision file (`ARCH-PLUGIN-VISION.md`)
- the six v3 plugin PRDs (`Khora`, `Hen`, `Pleroma`, `Chronos`, `Anima`, `Aletheia`)

Purpose:
- eliminate "wiring was not specified" as a blocker before implementation work,
- surface contradictions early,
- lock the first working-version integration contract across docs.

### Step 1: Unified Memory System File Audit (`ARCH-PLUGIN-VISION.md`)

Source:
- `Idea/Empty/Present/plugin-prd-fin/ARCH-PLUGIN-VISION.md`

Assessment:
- high-value architectural integration framing
- mixed truth status on filesystem paths and Day/NOW runtime semantics
- should be treated as a major source of system intent, not direct canonical filesystem contract authority

| Claim cluster (ARCH-PLUGIN-VISION) | Classification | Foundation alignment | Action in first working version docs |
|---|---|---|---|
| "One unified memory system, six aspects" (not six separate systems) | `true-target` and adopted | Strongly aligned | Keep as primary architectural principle |
| QL coordinate architecture (C/P/M/S/T/L, prime inversion, context frames) as foundational integration grammar | `true-target` | Aligned, but foundation needed explicit `CTX = CT(x)` clarification within CT/CT' template lens handling | Keep and extend in foundation doc without treating CTX as separate family |
| Shared integration map across Khora/Hen/Pleroma/Chronos/Anima/Aletheia | `true-target` | Aligned | Keep as overview, but subordinate exact ownership/path rules to foundation contract |
| Universal Neo4j relation convention `pos_x_{semantics}` | `true-target` (planning) | Broadly aligned with current foundation direction | Keep as target naming family, but note ongoing naming drift across PRDs/code |
| Memory continuum (HOT/WARM/COLD) as core organizing model | `true-target` | Aligned in principle | Reframe by artifact role + volatility (not path-only) |
| HOT/WARM/COLD examples using `/Bimba/Forms/` as canonical COLD path | `false/deprecated` | Conflicts with locked `Idea/Bimba/World` canon | Mark path examples as deprecated; replace with `Idea/Bimba/World` and `World/Types` subsets |
| Aletheia crystallization target `/Bimba/Forms/` | `false/deprecated` | Conflicts with flat `Idea/Bimba/World` canonical path | Replace with canonical `Idea/Bimba/World` in future cleanup pass |
| Khora/Chronos flow centered on singular `NOW.md` lifecycle | `mixed` | Partially aligned (runtime NOW exists) but incomplete | Rewrite in terms of Day parent + NOW child subsessions |
| Chronos described mainly as daily file rotation/cron flow | `mixed` | Partially aligned | Expand to thread continuity + Day/NOW governance model |
| Pleroma framed as "meaning/verification" plugin in integration map | `mixed` | Incomplete vs current clarified stance | Reframe as skills/execution substrate with Moirai orchestration and coordinate-aware dispatch |
| "User Context (NOW.md)" as primary bkmr injection surface | `mixed` | Acceptable runtime surface, but incomplete | Keep runtime injection boundary, but tie injections to parent Day / child NOW lineage and non-canonical labeling |

### Step 2: Six v3 PRDs Cross-Module Audit (Ownership / Inputs / Outputs / Gaps)

Sources:
- `Idea/Empty/Present/plugin-prd-fin/prd-khora-s3-0-foundation-v3.md`
- `Idea/Empty/Present/plugin-prd-fin/prd-hen-s3-1-graphrag-v3.md`
- `Idea/Empty/Present/plugin-prd-fin/prd-pleroma-s3-2-v3.md`
- `Idea/Empty/Present/plugin-prd-fin/prd-chronos-s3-3-v3.md`
- `Idea/Empty/Present/plugin-prd-fin/prd-anima-s3-4-holographic-v3.md`
- `Idea/Empty/Present/plugin-prd-fin/prd-aletheia-s3-5-learning-v3.md`

#### Module Matrix (first working version planning lens)

| Module PRD | Stated ownership (audit reading) | Key inputs expected | Key outputs / artifacts | Alignment with foundation doc | Gaps / contradictions to plug before implementation commitment |
|---|---|---|---|---|---|
| **Khora (S3-0')** | Runtime context bootstrap/orchestration, Redis hot/warm cache, sync queue staging, session lifecycle finalization, thought routing support | OpenClaw hooks/bootstrap seams, Redis infra, Hen coordination tools, Chronos timing, Aletheia thought routing requests | session NOW state, sync queue items, cache entries, routed thought files, lifecycle completion signals | Strong on "filesystem edge, not semantic truth"; strong on Hen coordination dependency; strong infra-reuse stance; addendum includes nested NOW lineage contract | Base sections still heavily singular-`NOW.md`; SEED->NOW wording still file-centric rather than Day parent -> NOW children; some path assumptions still use generic `/Thought`; needs explicit Hen-owned Day/NOW artifact contract consumption |
| **Hen (S3-1')** | Coordination + graph authority, tool contracts, retrieval orchestration, template registry/primitive authority, coordinate grammar normalization, frontmatter<->Neo4j mapping | Neo4j/GraphRAG, bimba-mcp, sync adapters, template sources (S1-X'), Parashakti cache, downstream plugin requests | coordination APIs, graph queries, normalized coordinates, topology/slice retrieval, template instantiation, provenance-rich contract outputs | Strongest alignment overall; explicitly names Hen as canonical template owner and Anima/Aletheia/Khora as clients; strong coordinate-semantic retrieval stance | PRD intent exceeds current code reality (frontmatter grammar, deprecated fields, topology assumptions); still needs explicit Day/NOW artifact role schema table wired into Hen contract docs |
| **Pleroma (S3-2')** | Moirai subagent orchestration + skill coordination + execution substrate over OpenClaw primitives; coordinate-gated skill teaching/dispatch | `sessions_spawn`, Hen coordination, OpenClaw skill discovery/gating, Redis, Neo4j, Anima QL context crystal pointers, 1Password skill | child sessions, worktree/redis scoped execution, Moirai invocation artifacts, skill policy outputs, relation-keyed orchestration metadata | Strongly aligned with your clarification ("skills/execution substrate", integrated surface, no duplicate registries/caches) | Naming drift in relation conventions (`pos{x}_{semantic_type}` / `pos2_*`) vs `pos_x_{semantics}` family used elsewhere; coordinate awareness is strong on gating/prime/Lens but not yet clearly linked to Anima+Aletheia family-aware checking flow |
| **Chronos (S3-3')** | Temporal orchestration, cron extension, queue priority scheduling, daily cycle jobs, temporal envelopes, nested NOW governance, temporal health | OpenClaw cron/heartbeat/hooks, Khora lifecycle/cache paths, Hen coordination + retrieval slices, Aletheia Mobius return status, optional Notion calendar, KAIROS provider | schedule runs, queue processing, temporal envelopes, daily rollover actions, archival signals, temporal relation payloads, window metadata | Very strong addenda: daily-note parent-now model, additive hook model, Khora ownership preserved, Hen slice-retrieval reuse, nested NOW temporal authority | Base PRD still centered on `NOW.md` file updates and 6 AM "create NEW NOW.md" wording; needs explicit Day artifact contract and parent-child NOW language normalized across base sections, not only addenda |
| **Anima (S3-4')** | Central executor/orchestrator, S4-X' invocation runtime, multi-agent coordination, NOW hierarchy governance (CGO), QL Context Crystal, skill assignment/capability policy | Hen template primitives/contracts, Khora IO/queue/cache surfaces, Chronos temporal envelopes/windows, Pleroma/Moirai execution substrate, Aletheia outputs for learning/closure | orchestration decisions, child NOWs, lineage telemetry, handoff metadata, compiled prompts/contracts, task orchestration updates | Strongly aligned with current foundation direction and your corrections; explicitly supports daily note parent NOW + typed child NOWs; explicitly consumes Hen template authority | Still mixes shared singular `NOW.md + now.canvas` workspace language with parent/child NOW hierarchy; Aletheia-as-coordinate-checking path (Anansi/Moirai) is not yet explicit enough in PRD wiring language |
| **Aletheia (S3-5')** | Extraction, verification (via Pleroma/Moirai), crystallization, Mobius return, closure envelopes, learning lineage; additive Sophia intake | Khora NOW/Thought access, Hen GraphRAG/Neo4j, Pleroma Moirai verification, Chronos triggers, Sophia knowledge envelopes | thought artifacts, crystallized canonical forms, SEED.md, TaskNotes closure envelopes, lineage-bound closure payloads, verification outputs | Strong on integrated cross-plugin role; D1 addendum aligns well with NOW lineage closure for Anima re-entry; good provenance/closure-envelope direction | Major path drift remains (`/Bimba/Forms/` in FRs/examples/appendices); base PRD still speaks in singular NOW refresh patterns; Aletheia's coordinate-checking role for Anima (Anansi-led orientation + Moirai validation) is implicit in package docs but not explicit in this PRD |

#### Cross-PRD Gap Summary (must be closed in docs before "build" commitment)

1. **Canonical Bimba path drift**
- `ARCH-PLUGIN-VISION` and Aletheia PRD still use `/Bimba/Forms/`.
- Foundation is locked on `Idea/Bimba/World` (flat canonical forms).
- This must be normalized across architecture + Aletheia docs.

2. **Day/NOW semantics are unevenly distributed**
- Anima and Chronos addenda are strong on parent Day -> child NOWs.
- Khora and ARCH base sections still lean on singular `NOW.md` lifecycle.
- Day/NOW hierarchy must be normalized into shared first-working-version wording across all module PRDs.

3. **Relation-key naming authority drift (now resolvable)**
- Old docs/PRDs use multiple relation-key phrasings (`pos_x_{semantics}`, `pos{x}_{semantic_type}`, `pos2_*` examples).
- ta-onta `PLAN.md` is now treated as canonical relation-law authority; foundation doc should reference/import that law rather than restating variants.

4. **Artifact-contract ownership is strongest in Hen/Anima but not uniformly mirrored**
- Hen explicitly owns templates/contracts.
- Anima increasingly consumes Hen as template authority.
- Khora/Chronos/Aletheia still need more explicit wording that they consume Hen artifact role contracts rather than infer file semantics ad hoc.

5. **Aletheia-as-coordinate-checking service for Anima is under-specified in PRDs**
- The ta-onta package and Aletheia cluster docs (Anansi/Moirai/Janus/etc.) support this model.
- The v3 PRDs do not yet make that operational call chain explicit.
- This is now covered in the foundation doc call-chain table and should be echoed in relevant PRD sections.

6. **Cache model still often path-first instead of artifact-role-first**
- ARCH especially encodes tiering as path categories.
- Foundation now frames cache by role + volatility.
- PRDs should reference tier-by-role rules where possible.

7. **CT/CT' template-lens notation (`CTX = CT(x)`) still not explicit across all docs**
- Hen + Anima are closest.
- Foundation needed the explicit six context-frame grammar plus `CTX = CT(x)` notation clarity to collapse ownership ambiguity.

### Audit Conclusion (Step 1 + Step 2)

The document set is now strong enough to support a first working-version implementation push, **if** the above cross-PRD gaps are closed explicitly in docs before coding begins.

Most important practical result of this audit:
- the core integrated wiring is already present across the PRDs,
- the remaining blockers are primarily terminology/path/runtime-contract inconsistencies,
- those inconsistencies are now identified in a single place and can be patched deliberately rather than rediscovered during implementation.

## Open Questions (to resolve in later layering)

- Exact canonical location/naming for day templates and artifact templates that conceptually belong to Bimba but operationally feed Present/NOW.
- Whether `Idea/Thought` remains the runtime thought root or is normalized into a more explicit `Pratibimba` subtree.
- Whether some `World/Types/Coordinates/*` markdown files are canonical forms that should be promoted/mirrored into `World` root vs retained as type-local documentation.
- Exact explicit grammar and naming set for the six context-frame-based coordinates (including explicit `CTX = CT(x)` notation usage within CT/CT') and how inverse `'` is represented across them.

## Definition of Done for This Document (current version)

This document is useful when:

- a human can decide where a new file belongs without ambiguity,
- a ta-onta engineer can derive path/queue/cache implementation tasks from it,
- old docs can be mined without silently reintroducing deprecated assumptions,
- filesystem cleanup can proceed in reversible slices.
