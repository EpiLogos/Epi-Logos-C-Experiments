# Pleroma (#2) Extension Analysis — Functional Requirements & Port Assessment

**Date:** 2026-03-10
**Status:** Comprehensive analysis for implementation planning
**Scope:** Pleroma = S4-2' (Graph Access & Tool Registration)
**Position:** #2 in the ta-onta meta-extension package (6 classes)

---

## Source Documents Analyzed

| Document | Location | Role |
|----------|----------|------|
| S4' Pleroma Port Matrix | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md` | Classification of all capabilities |
| Pleroma Canonical Brief | `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-pleroma-canonical-brief.md` | Identity and guardrails |
| Superpowers Source Inventory | `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-superpowers-pleroma-source-inventory.md` | File-by-file upstream analysis |
| PI Skills & Plugin Spec | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | S4/S4' architecture |
| S2/S2' Graph Spec | `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md` | Neo4j/Redis schema and port map |
| Ta-Onta Extension Spec | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | Package structure |
| NOW Integration Spec | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-NOW-INTEGRATION-AND-ENVIRONMENT.md` | Cross-layer NOW threading |
| VAK-Superpowers Integration | `ARCHIVE-2026-02-25-taonta-install/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` | VAK language spec + 66 USs |
| Ta-Onta-Anima-Superpowers | `ARCHIVE-2026-02-25-taonta-install/ta-onta-anima-superpowers-vak-integration-spec.md` | Full system integration |
| Orchestrator Spec | `ARCHIVE-2026-02-25-taonta-install/ORCHESTRATOR-SPEC.md` | Cross-plugin lifecycle |
| Ouroboros Dev Spec | `ARCHIVE-2026-02-25-taonta-install/OUROBOROS_DEV_SPEC.md` | Dialogical protocol |
| FR Layer Assignment Full | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-27-fr-layer-assignment-full.md` | Runtime home assignments |
| Pleroma PI Primitives Plan | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-24-pleroma-pi-primitives-extension-port-plan.md` | PI extension port |
| US-023..039 Wiring Plan | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-24-ta-onta-us023-us039-wiring-unlock-tranche-plan.md` | Dependency unlock |
| PI Extensions Coordinate Arch | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-pi-extensions-coordinate-architecture.md` | Coordinate architecture |
| Staging artifacts | `_staging/pleroma-skills/`, `_staging/pleroma-evals/`, `_staging/pleroma-hooks/`, `_staging/plugin.json`, `_staging/settings.json` | Current parked content |

---

## A. Functional Requirements (FRs)

### A.1 Graph Access & Raw Primitives (S2 Layer)

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-001** | Neo4j bolt connection pool with health check, retry, and Cypher execution | S2-S2i-GRAPH.md Phase 1; graph/client.rs (stub) | Specified in S2 spec; Rust stub exists | **P0 — Critical** |
| **FR-P-002** | Redis connection with get/set, TTL, tier key patterns (HOT/WARM/COLD) | S2-S2i-GRAPH.md Phase 1; graph/redis_cache.rs (stub) | Specified; Khora owns tier model, S2 provides backend | **P0 — Critical** |
| **FR-P-003** | Docker lifecycle management for Neo4j 5.x + Redis 7.x (`epi graph up/down/status`) | S2-S2i-GRAPH.md; graph/mod.rs (compose_file_path exists) | Specified in S2 spec | **P1 — High** |
| **FR-P-004** | Schema bootstrap: constraints, indexes, vector index creation (`epi graph init`) | S2-S2i-GRAPH.md Phase 2; graph/schema.rs (stub) | Full Cypher specified | **P0 — Critical** |
| **FR-P-005** | Seed full coordinate space (~96 nodes: #, #0-#5, weaves, CFs, families, VAK) | S2-S2i-GRAPH.md Phase 2; graph/seed.rs (stub) | Full seed Cypher specified | **P0 — Critical** |
| **FR-P-006** | Structural relationships: MANIFESTS, BEDROCK, INVERTS_TO, ANCHORED_TO, FAMILY_LINK, REFLECTS_VIA | S2-S2i-GRAPH.md Phase 2 | Fully specified in S2 spec | **P1 — High** |
| **FR-P-007** | Coordinate CRUD: upsert with S0' validation gate, single/multi-coordinate query | S2-S2i-GRAPH.md Phase 3 | Specified | **P1 — High** |
| **FR-P-008** | Position-based relationships: POS0_LINKS_TO through POS5_INTEGRATES_INTO with bidirectional inverses | S2-S2i-GRAPH.md Phase 4; relationship_manager.rs (stub) | Fully specified | **P2 — Medium** |
| **FR-P-009** | Progressive disclosure (6 levels of detail per coordinate query) | S2-S2i-GRAPH.md retrieval section | Specified | **P2 — Medium** |
| **FR-P-010** | Hybrid retrieval: RRF fusion, vector + graph parallel queries, coordinate_boost | S2-S2i-GRAPH.md Phase 5; retrieval/hybrid.rs (stub) | Python source exists (~874 LOC), Rust stub | **P2 — Medium** |
| **FR-P-011** | Embeddings: 3072-dim unified embedding space, Gemini API client | S2-S2i-GRAPH.md Phase 6; embeddings.rs (stub) | Specified; Python source 598 LOC | **P2 — Medium** |
| **FR-P-012** | Bidirectional Obsidian<->Neo4j sync with 6 conflict resolution strategies | S2-S2i-GRAPH.md Phase 7; bidirectional_sync.rs (stub) | Python source 1105 LOC | **P3 — Low** |

### A.2 Tool Registration & Primitive Registry (S2' Layer)

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-020** | Bounded primitive registry: 9 primitives (tmux, cmux, mprocs, bkmr_kbase, onecontext, ralph_tui, gitbutler, worktrunk, notebooklm) with stable IDs | Pleroma PI Primitives Plan Task 1; port matrix "bounded primitive registry" = true-port | Upstream: `pleroma-pi-primitives.ts` | **P0 — Critical** |
| **FR-P-021** | Per-agent primitive policy bindings: constitutional + Aletheia agents with fail-fast on unknown capability | Pleroma PI Primitives Plan Task 1; FR Layer Assignment FR-3 | Upstream: `pleroma-pi-primitives.ts` policies | **P0 — Critical** |
| **FR-P-022** | `pi.registerTool()` for each bounded primitive with preview/dry-run default | Ta-Onta Extension Spec (pleroma/extension.ts); PI Primitives Plan Task 2 | Upstream: `pleroma-pi-extension.ts` | **P1 — High** |
| **FR-P-023** | Execution mode enforcement: bounded / interactive / background per primitive | Pleroma Canonical Brief; FR Layer Assignment US-009 | Specified in canonical brief | **P1 — High** |
| **FR-P-024** | Child-extension propagation for PI team/chain subagents (PI_AGENT_CHILD_EXTENSIONS env var) | PI Primitives Plan Task 3; port matrix "native PI child lane" = port-and-refine | Upstream: `pi-launcher.ts`, `agent-team.ts`, `agent-chain.ts` | **P1 — High** |
| **FR-P-025** | Theme management: themeMap.ts (144 LOC) — coordinate-to-theme mapping for display surfaces | PI Extensions Coordinate Arch; ta-onta S2/themeMap.ts | Existing file: `plugins/ta-onta/pleroma/S2/themeMap.ts` | **P3 — Low** |
| **FR-P-026** | Skill discovery by filesystem/frontmatter — skills are `SKILL.md` artifacts with YAML frontmatter | PI Skills spec; Superpowers Source Inventory (skills-core.js) | Fully specified in S4 spec | **P0 — Critical** |
| **FR-P-027** | Plugin command aliases that dispatch into canonical skills (command trampoline pattern) | Superpowers Source Inventory (brainstorm.md, write-plan.md, execute-plan.md) | Pattern identified; port-as-command-pattern | **P2 — Medium** |

### A.3 Orchestration & VAK Executive Skills

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-030** | VAK coordinate evaluation: 6-step schema (CPF->CT->CP->CF->CFP->CS) with contextual adaptation | VAK-Superpowers spec SS4.2; staging skill: vak-evaluate/SKILL.md | true-port; upstream SKILL.md exists | **P0 — Critical** |
| **FR-P-031** | Constitutional agent routing table: (0000)->Nous, (0/1)->Logos, (0/1/2)->Eros, (0/1/2/3)->Mythos, (4.0-4.4/5)->Psyche, (5/0)->Sophia | VAK-Superpowers spec SS1.6; Pleroma Canonical Brief | Non-negotiable per canonical brief | **P0 — Critical** |
| **FR-P-032** | Day/Night' topology: forward synthesis + backward analysis with P0'-P5' semantic positions | VAK-Superpowers spec SS2, SS4.4; staging skill: day-night-pass/SKILL.md | true-port; fully specified | **P0 — Critical** |
| **FR-P-033** | Mobius return: P5' Insight -> P0' Questions cycle closure | VAK-Superpowers spec; Day-Night-Pass SKILL.md | Part of day-night-pass; non-negotiable | **P0 — Critical** |
| **FR-P-034** | Thread type dispatch (CFP0-CFP5 + Z-Thread) mapped to execution skills | VAK-Superpowers spec SS1.7; anima-orchestration/SKILL.md | true-port; fully specified in VAK spec | **P1 — High** |
| **FR-P-035** | Ouroboros protocol: CPF (00/00) user-engaged dialogical workflow with Ralph agent collaboration | Ouroboros Dev Spec; VAK spec; staging skill: ouroboros/SKILL.md | port-and-refine; upstream SKILL.md exists | **P1 — High** |
| **FR-P-036** | Klein-mode: S4-5' closure and inversion semantics | Pleroma Canonical Brief; port matrix = fresh-design | Canonically required; no upstream artifact | **P3 — Low** |
| **FR-P-037** | VAK coordinate frame reference grammar (lookup skill, not process) | VAK-Superpowers spec SS4.1; staging skill: vak-coordinate-frame/SKILL.md | true-port | **P1 — High** |

### A.4 Techne Workshop Lifecycle

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-040** | techne-spawn: ordered spawn protocol for external-agent workshop launch | Port matrix = true-port; upstream SKILL.md | Staging: `_staging/pleroma-skills/atomic/techne-spawn/SKILL.md` | **P1 — High** |
| **FR-P-041** | techne-relay: bounded result retrieval from workshop windows (stdout/file/auto) | Port matrix = true-port; upstream SKILL.md | Staging: techne-relay/SKILL.md | **P1 — High** |
| **FR-P-042** | techne-list: workshop window enumeration, status, elapsed time, budget | Port matrix = true-port; upstream SKILL.md | Staging: techne-list/SKILL.md | **P1 — High** |
| **FR-P-043** | techne-close: graceful shutdown, summary persistence, workshop cleanup | Port matrix = true-port; upstream SKILL.md | Staging: techne-close/SKILL.md | **P1 — High** |
| **FR-P-044** | Constitutional progeny: external CLI agents inherit canonical skills, CF identity, session capture, bounded recursion | Pleroma Canonical Brief; pleroma-skill-proxy SKILL.md | true-port; non-negotiable per canonical brief | **P0 — Critical** |

### A.5 Moirai Subagent Cluster

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-050** | Moirai roles: Klotho (Assert/L2), Lachesis (Query/L2), Atropos (Reflect/L2) as CF2 cluster | FR Layer Assignment US-002/003/004; upstream moirai.ts | port-and-refine from upstream `moirai.ts` | **P1 — High** |
| **FR-P-051** | Per-Moira tool policy boundaries (Assert = embed/validate, Query = search/traverse, Reflect = context/disclosure/write) | FR Layer Assignment FR-3 | Specified in FR layer assignment | **P1 — High** |
| **FR-P-052** | Moirai invoked as unit by Eros; internal positional routing is Moirai's concern | FR Layer Assignment critical note | Specified | **P1 — High** |
| **FR-P-053** | Parent-child session coordination with Neo4j via Hen contracts | FR Layer Assignment US-005, FR-5 | Hen coordination consumption | **P2 — Medium** |
| **FR-P-054** | Per-subagent worktree isolation with QL coordinate type in naming | FR Layer Assignment US-006, FR-6 | Khora filesystem delegation | **P2 — Medium** |
| **FR-P-055** | Redis namespace isolation per Moira with lens coordinate type in keys | FR Layer Assignment US-007, FR-7 | Khora session namespace | **P2 — Medium** |
| **FR-P-056** | Orphaned child detection/cleanup with Chronos heartbeat tracking | FR Layer Assignment FR-9 | Chronos integration | **P2 — Medium** |

### A.6 Verification & Observability

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-060** | Reflection-family runtime schemas: CPF/CT/CP/CF/CFP/CS runtime payload parity | Port matrix = true-port; upstream `parity-models.ts` | Upstream source exists | **P1 — High** |
| **FR-P-061** | Skill evaluation harness: YAML suite schema, transcript capture, pass/fail rubric | PI Skills spec Phase 4; staging eval suites (5 suites) | Specified in S4 spec | **P2 — Medium** |
| **FR-P-062** | Hook discipline: PreToolUse (preflight-validate), PostToolUse (postflight-verify), Stop (discharge + worktree-cleanup) | Staging: `_staging/pleroma-hooks/hooks.json` (4 hooks) | Staging hooks exist | **P1 — High** |
| **FR-P-063** | Cross-plugin runtime verification (Pleroma with Khora, Hen, Chronos) | FR Layer Assignment US-010 | Specified but deferred in FR layer doc | **P3 — Low** |
| **FR-P-064** | QL coordinate gating: full C/P/M/S/T/L parsing with prime notation enforcement | FR Layer Assignment US-009 | S0' QL Types validator consumption | **P1 — High** |

### A.7 Contract & Boundary

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-P-070** | No parallel runtime: Pleroma is an executive package, not a sovereign alternative | Pleroma Canonical Brief; upstream CONTRACT.md | Non-negotiable | **P0 — Critical** |
| **FR-P-071** | Skills are instructional artifacts only — no custom SkillRegistry/SkillInvoker in Pleroma | FR Layer Assignment FR-2 | Specified | **P0 — Critical** |
| **FR-P-072** | Preserve SQL/session transcript ownership — Neo4j for coordination only | FR Layer Assignment FR-12; upstream CONTRACT.md | Non-negotiable | **P0 — Critical** |
| **FR-P-073** | Atomic vs VAK skill taxonomy: atomic skills cannot silently grow into constitutional routers | Pleroma Canonical Brief | Binding per canonical brief | **P0 — Critical** |
| **FR-P-074** | Feature-flaggable rollout with reversibility without data loss | FR Layer Assignment FR-13 | Specified | **P1 — High** |
| **FR-P-075** | Centralized API key management via 1Password — no Pleroma-local key stores | FR Layer Assignment US-013 | Specified | **P1 — High** |
| **FR-P-076** | Wikilink protocol enforcement for all coordinate/file references in outputs | FR Layer Assignment FR-11 | Specified | **P2 — Medium** |

---

## B. User Stories (USs)

### US-P-001: Graph Infrastructure Bootstrap

**As** a developer setting up a new Epi-Logos environment,
**I want** to run `epi graph up && epi graph init` and have a fully seeded Neo4j + Redis environment,
**So that** all coordinate-aware features have a functional graph substrate.

**Acceptance Criteria:**
- Docker containers for Neo4j 5.x and Redis 7.x start successfully
- Schema constraints and indexes are created (including vector index)
- All ~96 seed nodes are created with correct properties
- Structural relationships (MANIFESTS, BEDROCK, INVERTS_TO, ANCHORED_TO) are wired
- 16-fold intra-openness relationships (FAMILY_LINK, REFLECTS_VIA) are established
- `epi graph status` reports healthy for both backends
- Idempotent: re-running `epi graph init` does not create duplicates

### US-P-002: Bounded Primitive Registration

**As** an agent (Anima/Aletheia/constitutional agent),
**I want** a registry of bounded primitives (tmux, mprocs, gitbutler, etc.) with explicit per-agent policy bindings,
**So that** I can invoke tools through approved channels without policy bypass.

**Acceptance Criteria:**
- Registry contains all 9 primitives with stable IDs
- Each primitive has an execution mode (bounded/interactive/background)
- Agent-scope policy bindings restrict which agents can use which primitives
- Unknown capabilities produce fail-fast errors
- Preview/dry-run is default; explicit opt-in for execution
- `pi.registerTool()` is called for each primitive on extension load

### US-P-003: VAK Coordinate Evaluation

**As** the Anima orchestration system,
**I want** to evaluate any incoming task through the 6-step VAK schema (CPF->CT->CP->CF->CFP->CS),
**So that** work is correctly routed to the appropriate constitutional agent with the right execution topology.

**Acceptance Criteria:**
- Clear tasks can be inferred silently with coordinate output
- Ambiguous tasks trigger explicit walk-through with user/Patient
- CPF=(00/00) hands off to brainstorming (Ouroboros mode)
- CPF=(4.0/1-4.4/5) proceeds through full 6-step pipeline
- CF=(0000) triggers Nous fresh-perspective pass before actual CF selection
- Output follows canonical format: `VAK: [name] CPF: (xx/xx) CT: CTn CP: 4.n CF: (code) -> Agent CFP: CFPn CS: CSn / [Day|Night']`
- Multiple CT values supported per task

### US-P-004: Constitutional Agent Routing

**As** the anima-orchestration skill,
**I want** to map CF codes to constitutional agents and determine dispatch instructions based on CF+CFP combination,
**So that** the correct agent executes with the appropriate thread type.

**Acceptance Criteria:**
- All 6 CF codes map to their constitutional agents (Nous through Sophia)
- CF+CFP matrix produces correct dispatch instructions (see VAK spec SS4.3)
- Nous dispatches fresh minimal-context invocation, reports to Patient
- Psyche = Patient = coordinator for CFP4/CFP5 threads
- Sophia handles finishing + Mobius return signal

### US-P-005: Day/Night' Topology Execution

**As** an agent executing a complex task,
**I want** Day (forward synthesis 4.0->4.5) and Night' (backward analysis 4.5->4.0) passes with P0'-P5' semantic content,
**So that** work is both executed and reflectively validated before Mobius return.

**Acceptance Criteria:**
- Day pass traverses CP positions with Day questions
- Night' pass traverses backward with genuinely orthogonal P0'-P5' questions (not "review")
- P2' Challenges gate: if challenges identified, return to Patient before Mobius
- Mobius return: P5' Insight + P0' Questions emitted as signal
- CS determines when Day+Night' is required vs Day-only

### US-P-006: Techne Workshop Lifecycle

**As** an agent needing external CLI execution,
**I want** to spawn, monitor, relay results from, and close external-agent workshop windows,
**So that** external work is bounded, tracked, and cleanly concluded.

**Acceptance Criteria:**
- techne-spawn: skill-proxy configured, OneContext set, budget checked, workshop launched
- techne-relay: results captured from stdout/file/auto with timeout handling
- techne-list: all workshop windows enumerated with status/elapsed/budget
- techne-close: graceful shutdown, OneContext milestone committed, final output captured
- Constitutional progeny principle: spawned agents inherit canonical skills and CF identity

### US-P-007: Ouroboros Collaborative Development

**As** a user (architect/patient),
**I want** to engage in dialogical development with a Ralph agent through the Ouroboros protocol,
**So that** complex tasks benefit from equal-agency collaboration with baked-in checkpoint markers.

**Acceptance Criteria:**
- CPF=(00/00) triggers Ouroboros mode
- 12-fold helical positions (P0-P5 surgeon + P0'-P5' patient) respected
- Interaction points baked into PRD via `[OUROBOROS]` markers
- Session continuity across multiple Ralph runs
- Identity updates after each successful cycle (P5/Integration')

### US-P-008: Hook Discipline for Agent Execution

**As** the Pleroma plugin,
**I want** hooks that validate before tool use, verify after tool use, structure discharge on stop, and clean up worktrees,
**So that** agent execution has guardrails beyond prompt conventions.

**Acceptance Criteria:**
- PreToolUse: `preflight-validate.sh` runs before agent tool invocations
- PostToolUse: `postflight-verify.sh` verifies work completeness
- Stop (discharge): `subagent-discharge.sh` emits structured metadata and capture summary
- Stop (cleanup): `worktree-cleanup.sh` cleans workshop windows and temp worktrees
- Hooks accept JSON stdin and return structured JSON decisions

### US-P-009: Graph Coordinate Query

**As** a user or agent,
**I want** to query the Neo4j graph by QL coordinate notation and receive progressively detailed results,
**So that** coordinate knowledge is accessible at the right level of detail.

**Acceptance Criteria:**
- `epi graph query "#4"` returns single coordinate with requested disclosure level (1-5)
- `epi graph query "P3,M4'"` returns multi-coordinate AND result
- `epi graph query --family T` returns all T-family coordinates
- `epi graph query --cf CF_TRIKA` returns all coordinates in CF(0/1/2) frame
- `epi graph query-context "M2.4'" --depth 2` returns 2-hop neighborhood
- Progressive disclosure: level 0 = id/uuid only, level 5 = everything + embeddings

### US-P-010: Eval Suite Execution

**As** a developer,
**I want** to run evaluation suites that test skill selection, routing, and execution quality,
**So that** Pleroma behavior is validated beyond unit tests.

**Acceptance Criteria:**
- `epi agent skills eval --suite suites/topology-routing.yaml` executes the suite
- Each case has: prompt, enabled plugins/skills, expected skill selection, expected output criteria
- Output includes: transcript, selected skills/subagents, hooks fired, pass/fail rubric
- All 5 staged suites (topology-routing, atomic-tools, ouroboros, klein, discharge) are runnable

---

## C. S-Level Inventory (S2 Raw Primitives)

### What Exists in `epi-cli/src/graph/`

| File | Status | LOC (approx) | Notes |
|------|--------|--------------|-------|
| `mod.rs` | Partial | ~100 | GraphCmd enum with Init/Status/Up/Down/Query/Sync/Retrieve/GraphRAG/Hybrid/Import; `parse_yaml_frontmatter` + `compose_file_path` implemented |
| `types.rs` | Complete | — | NodeRef, EdgeRef, GraphResult, RelationshipType |
| `alignment_validator.rs` | Complete (basic) | — | 36 valid coordinates |
| `coordinate_array_parser.rs` | Complete (basic) | — | Comma-separated parsing |
| `client.rs` | **STUB** | — | Needs real neo4rs connection pool |
| `api.rs` | **STUB** | — | Needs real API surface |
| `mapper.rs` | **STUB** | — | Needs full vault ontology mapping |
| `embeddings.rs` | **STUB** | — | Needs Gemini API client |
| `redis_cache.rs` | **STUB** | — | Needs real redis + tier model |
| `relationship_manager.rs` | **STUB** | — | Needs POS0-POS5 + bidirectional |
| `link_enforcement.rs` | **STUB** | — | Needs wiki-link validation |
| `schema.rs` | **STUB** | — | Needs constraint/index creation |
| `seed.rs` | **STUB** | — | Needs 96-node seed |
| `dataset_import.rs` | Partial | — | M-branch dataset import |
| `retrieval/coordinate.rs` | **STUB** | — | Needs full multi-coordinate retrieval |
| `retrieval/graphrag.rs` | **STUB** | — | Needs progressive disclosure |
| `retrieval/hybrid.rs` | **STUB** | — | Needs RRF fusion |
| `sync.rs` | **STUB** | — | Needs file event handlers |
| `sync_coordinator.rs` | **STUB** | — | Needs hash-based change detection |
| `sync_orchestrator.rs` | **STUB** | — | Needs full workflow |
| `bidirectional_sync.rs` | **STUB** | — | Needs 6 conflict strategies |

### What's Needed

**Cargo.toml dependencies (missing):**
- `neo4rs` — Neo4j Bolt driver
- `redis` — Redis client
- `tokio` — async runtime (may already be present for other uses)
- `reqwest` — HTTP client for embeddings API

**Python port sources (14K LOC production):**

| Python File | LOC | Priority | Notes |
|-------------|-----|----------|-------|
| `coordinate_retrieval.py` | 2143 | P1 | Most complex; multi-coordinate filtering |
| `redis_cache.py` | 1810 | P0 | Three-tier cache model |
| `sync_coordinator.py` | 1451 | P2 | Hash-based change detection |
| `graphrag_retriever.py` | 1293 | P1 | NL query classification, context modes |
| `relationship_manager.py` | 1134 | P1 | POS0-POS5 with bidirectional |
| `link_enforcement.py` | 1117 | P2 | Wiki-link validation, sunya detection |
| `bidirectional_sync.py` | 1105 | P3 | 6 conflict strategies |
| `hybrid_retrieval.py` | 874 | P2 | RRF fusion |
| `coordinate_array_parser.py` | 652 | Done | Basic form complete |
| `embeddings.py` | 598 | P2 | Gemini API client |
| `sync_orchestrator.py` | 474 | P3 | Full sync workflow |
| `sync.py` | 391 | P2 | File event handlers |
| `client.py` | 349 | P0 | Connection management |
| `mapper.py` | 303 | P1 | Vault ontology mapping |

---

## D. S'-Level Inventory (S2' QL Augmentations)

### Tool Registration Surface

Pleroma's S2' role is **folding S2 into the agent layer** via tool registration and policy enforcement.

| Capability | Current State | Target State |
|------------|---------------|--------------|
| `pi.registerTool()` per primitive | Not implemented (PI not installed) | Each of 9 primitives registered with execution mode and policy |
| Primitive registry (stable IDs) | Upstream: `pleroma-pi-primitives.ts` (true-port) | Rust registry in `epi-cli/src/agent/` + plugin-level SKILL.md artifacts |
| Per-agent policy bindings | Upstream: policy tables in primitives.ts | Rust policy engine; agent-scope bindings fail-fast on unknown |
| Execution mode enforcement | Upstream: `pleroma-pi-extension.ts` preview/run wrappers | Bounded/interactive/background modes per primitive |
| Child-extension propagation | Upstream: `pi-launcher.ts` + `agent-team.ts` patches | `PI_AGENT_CHILD_EXTENSIONS` env var; explicit `-e` args |

### Extension Management

| Capability | Current State | Target State |
|------------|---------------|--------------|
| Plugin manifest parsing | `epi-cli/src/agent/plugins.rs` exists | Parse `plugin.json` format; staging version exists |
| Plugin namespacing | Specified in S4 spec | `pleroma:skill-name` namespacing |
| Plugin cache (installed mode) | Specified in S4 spec | `~/.epi/agents/<agent>/plugins/cache/pleroma@version/` |
| Local dev mode (`--plugin-dir`) | Specified in S4 spec | In-place loading without cache copy |
| Skill validation CLI | `epi agent skill validate` specified | Validate SKILL.md frontmatter + layout |

### Reflection-Family Runtime Schemas

| Schema | Upstream Source | Port Status |
|--------|----------------|-------------|
| Foundational family envelopes | `parity-models.ts` | true-port; needs Rust types |
| Reflection family envelopes (CPF/CT/CP/CF/CFP/CS) | `parity-models.ts` | true-port; needs Rust types |
| Orchestration payloads | `parity-models.ts` | true-port |
| Observability envelopes | `parity-models.ts` | true-port |
| Manifest snapshots | `parity-models.ts` | true-port |

---

## E. M-Level Mapping

### M3 Mahamaya Symbolic Codec

Per the Ta-Onta Extension Spec, Pleroma's `/M` folder maps to **M3 (Mahamaya)** for symbolic codec concerns in tool typing.

| M3 Concern | Relationship to Pleroma | Implementation Notes |
|------------|------------------------|---------------------|
| Symbolic tool typing | M3's symbolic system (hexagrams, codons, archetypes) provides a typing layer for tool categorization | Type stubs + documentation in `pleroma/M/` |
| Codon mapping | 64-codon mapping can classify tool execution patterns | Cross-cutting concern; not executable code |
| Archetype LUT | M3's archetype lookup table classifies tool invocations by their archetypal quality | Reference from `epi-lib/include/m3.h` |

**Current state:** The M3 C implementation is complete (`epi-lib/src/m3.c`). The Pleroma M/ folder does not yet exist. The mapping is documentation + Rust type stubs that bridge between M3's symbolic vocabulary and the tool registry.

**Key integration point:** When Pleroma registers a tool, it can optionally annotate with M3 symbolic metadata (codon, hexagram, archetype) for richer context injection into agent workflows. This is an augmentation, not a gate.

---

## F. Staging Disposition

### F.1 Atomic Skills (15 staged in `_staging/pleroma-skills/atomic/`)

| Skill | Port Classification | Belongs To | Disposition |
|-------|--------------------|-----------:|-------------|
| `tmux` | port-and-refine | **Pleroma** | Substrate primitive + atomic skill. Adapts upstream SKILL.md for new runtime. |
| `cmux` | fresh-design | **Pleroma** | New bounded CLI coordination protocol. No upstream artifact. |
| `mprocs` | port-and-refine | **Pleroma** | Workshop grid management. Adapts upstream. |
| `worktrunk` | fresh-design | **Pleroma** | Bounded worktree protocol. No upstream artifact. |
| `ralph-tui` | port-and-refine | **Pleroma** | Long-thread execution/checkpoint substrate. |
| `gitbutler` | port-and-refine | **Pleroma** | Deterministic child VCS orchestration. |
| `notebooklm` | port-and-refine | **Aletheia** (shared with Pleroma) | Notebook query/create/add-source. Gnosis replaces over time. |
| `repl` / Darshana | true-port | **Aletheia** (owner); shared Anansi/Sophia/Nous/Logos | Large-file topology scanning. Owner is Aletheia per FR layer assignment. |
| `chatlog-fetcher` | fresh-design | **Pleroma** or **Aletheia** | Evidence acquisition. No upstream artifact. |
| `youtube-transcript` | fresh-design | **Pleroma** or **Aletheia** | Evidence acquisition. No upstream artifact. |
| `pleroma-skill-proxy` | true-port | **Pleroma** | Constitutional progeny configuration. Core Pleroma surface. |
| `techne-spawn` | true-port | **Pleroma** | Workshop spawn protocol. Core Pleroma surface. |
| `techne-relay` | true-port | **Pleroma** | Workshop result retrieval. Core Pleroma surface. |
| `techne-list` | true-port | **Pleroma** | Workshop observability. Core Pleroma surface. |
| `techne-close` | true-port | **Pleroma** | Workshop shutdown. Core Pleroma surface. |

### F.2 Orchestration Skills (6 staged in `_staging/pleroma-skills/orchestration/`)

| Skill | Port Classification | Belongs To | Disposition |
|-------|--------------------|-----------:|-------------|
| `vak-coordinate-frame` | true-port | **Anima** (S4-4') | Reference grammar. VAK is Anima's executive language. Should move to Anima extension. |
| `vak-evaluate` | true-port | **Anima** (S4-4') | 6-step evaluation pipeline. Core Anima surface. Should move to Anima extension. |
| `anima-orchestration` | true-port | **Anima** (S4-4') | CF->agent routing + dispatch. Core Anima surface. Should move to Anima extension. |
| `day-night-pass` | true-port | **Anima** (S4-4') or **Chronos** (S4-3') | Day/Night' topology. Temporal execution semantics. Boundary decision needed. |
| `ouroboros` | port-and-refine | **Anima** (S4-4') | CPF user-engaged workflow. Core Anima orchestration. |
| `klein-mode` | fresh-design | **Anima** (S4-4') or **Aletheia** (S4-5') | Klein inversion semantics. S4-5' closure. Boundary decision needed. |

**Critical observation:** The 6 orchestration skills staged under `pleroma-skills/orchestration/` are almost entirely **Anima concerns**, not Pleroma concerns. The VAK evaluation, constitutional routing, and Day/Night' topology are the agent orchestration layer (S4-4'), not the graph access / tool registration layer (S4-2').

The canonical brief says Pleroma is "the executive S4' layer that ports the high-value Superpowers workflow body." However, the Ta-Onta Extension Spec (S4-TA-ONTA-EXTENSION-SPEC.md) explicitly maps:
- Pleroma = S4-2' = "Graph Access & Tool Registration"
- Anima = S4-4' = "Agent Orchestration & Meta-Dispatch" with `S4'/agents/` containing constitutional agents

**Recommendation:** The orchestration skills should be reassigned to Anima (S4-4'). Pleroma keeps atomic skills + substrate capabilities. This aligns with the Extension Spec's positional mapping.

### F.3 Eval Suites (5 staged + manifest in `_staging/pleroma-evals/`)

| Suite | Disposition |
|-------|-------------|
| `topology-routing.yaml` | Likely **Anima** — tests VAK routing topology |
| `atomic-tools.yaml` | **Pleroma** — tests bounded primitive invocation |
| `ouroboros.yaml` | **Anima** — tests Ouroboros workflow |
| `klein.yaml` | **Anima/Aletheia** — tests Klein inversion |
| `discharge.yaml` | **Pleroma** — tests stop/discharge hooks |
| `manifest.yaml` | Registry — stays as manifest; split entries to respective owners |
| `fixtures/vak-eval-input.json` | **Anima** — VAK evaluation fixture |

### F.4 Hooks (4 staged in `_staging/pleroma-hooks/`)

| Hook | Disposition |
|------|-------------|
| `preflight-validate.sh` | **Pleroma** — tool validation is tool-registry concern |
| `postflight-verify.sh` | **Pleroma** or shared — work verification spans layers |
| `subagent-discharge.sh` | **Anima** or shared — subagent lifecycle is orchestration |
| `worktree-cleanup.sh` | **Pleroma** — worktree is substrate/tool concern |

### F.5 Plugin Metadata (staged)

| File | Disposition |
|------|-------------|
| `_staging/plugin.json` | **Split** — this manifest contains both Pleroma-proper and Anima-proper content. The `agents` section (13 agents) belongs in Anima/Aletheia extensions, not Pleroma. |
| `_staging/settings.json` | **Pleroma** — namespace/priority configuration |

### F.6 Constitutional Agents (staged under `plugins/ta-onta/anima/S4'/agents/`)

All 7 constitutional agents (nous, logos, eros, mythos, psyche, sophia, techne-helper) are correctly placed under Anima. The 6 Aletheia agents (anansi, janus, moirai, mercurius, agora, zeithoven) are correctly placed under Aletheia. **None belong in Pleroma.**

---

## G. Port Matrix Analysis

### G.1 True-Port Capabilities

| Capability | Upstream Accessible? | Adaptation Needed | Priority |
|------------|---------------------|-------------------|----------|
| `repl` / Darshana | Yes: `/Epi-Logos/Idea/epi-claw/skills/repl/SKILL.md` + `darshana.py` | Minimal — SKILL.md carries forward; darshana.py may need path adjustments | P1 |
| `pleroma-skill-proxy` | Yes: `/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/pleroma-skill-proxy/SKILL.md` | Moderate — provider-fork config must target new plugin structure | P0 |
| `techne-spawn` | Yes: upstream SKILL.md | Moderate — workshop substrate references need updating | P1 |
| `techne-relay` | Yes: upstream SKILL.md | Moderate — retrieval protocol references need updating | P1 |
| `techne-list` | Yes: upstream SKILL.md | Minimal — monitoring/reporting prompt stable | P1 |
| `techne-close` | Yes: upstream SKILL.md | Moderate — closure handoff into Night' references need updating | P1 |
| `vak-coordinate-frame` | Yes: upstream SKILL.md | Minimal — reference grammar is stable | P0 (but assign to Anima) |
| `vak-evaluate` | Yes: upstream SKILL.md | Minimal — 6-step schema is well-defined | P0 (but assign to Anima) |
| `anima-orchestration` | Yes: upstream SKILL.md + `moirai.ts` | Moderate — dispatch instructions reference Epi-Claw patterns | P0 (but assign to Anima) |
| `day-night-pass` | Yes: upstream SKILL.md | Minimal — topology semantics are canonical | P0 (but assign to Anima) |
| `bounded primitive registry` | Yes: `pleroma-pi-primitives.ts` | Significant — TypeScript -> Rust translation | P0 |
| `reflection-family runtime schemas` | Yes: `parity-models.ts` | Significant — TypeScript -> Rust types | P1 |
| `native PI child lane` | Yes: `pi-native-subagent-adapter.ts`, `pi-launcher.ts` | Significant — TypeScript -> Rust + PI-compatible adaptation | P1 |

### G.2 Port-and-Refine Capabilities

| Capability | Upstream Accessible? | Adaptation Needed | Priority |
|------------|---------------------|-------------------|----------|
| `tmux` | Yes: installed skill + primitives plan | Moderate — command cookbook adapts; runtime boundaries change | P1 |
| `mprocs` | Yes: local Pleroma + primitives plan | Moderate — process management patterns adapt | P1 |
| `ralph-tui` | Yes: Ouroboros + primitives plan | Moderate — headless launch adapts | P2 |
| `gitbutler` | Yes: local Pleroma extension | Moderate — VCS orchestration adapts | P2 |
| `notebooklm` | Yes: installed skill + run.sh | Minor — packaging update for plugin discovery | P2 |
| `ouroboros` | Yes: installed skill + workflow scripts | Significant — packaging must remain faithful to CPF/user-engaged telos | P1 (assign to Anima) |

### G.3 Fresh-Design Capabilities

| Capability | Upstream Accessible? | Adaptation Needed | Priority |
|------------|---------------------|-------------------|----------|
| `cmux` | No direct artifact | Full design needed — multiplexed CLI coordination | P3 |
| `worktrunk` | No direct artifact | Full design needed — bounded worktree protocol | P2 |
| `klein-mode` | No direct artifact | Full design needed — Klein inversion semantics | P3 (assign to Anima/Aletheia) |
| `chatlog-fetcher` | No direct artifact | Full design needed — evidence acquisition | P3 |
| `youtube-transcript` | No direct artifact | Full design needed — transcript retrieval | P3 |
| `constitutional agent set` | No direct artifact for THIS repo | Full design from canonical sources | P1 (assign to Anima) |
| `Aletheia cluster` | No direct artifact for THIS repo | Full design from canonical sources | P2 (assign to Aletheia) |

---

## H. Ambiguities & Open Decisions

### H.1 Pleroma Scope Boundary (CRITICAL)

**The staging content conflates two distinct extension classes.** The staged `plugin.json` puts 21 skills, 13 agents, 4 hooks, and 5 eval suites all under "pleroma." However, the Ta-Onta Extension Spec clearly maps:

- **Pleroma (S4-2'):** Graph Access & Tool Registration
- **Anima (S4-4'):** Agent Orchestration & Meta-Dispatch

The VAK orchestration skills (vak-evaluate, vak-coordinate-frame, anima-orchestration, day-night-pass, ouroboros, klein-mode) and constitutional agents (nous through sophia) are **Anima concerns**, not Pleroma concerns.

**Decision needed:** Should Pleroma be limited to its positional S4-2' role (graph/tools/primitives), or should it retain the broader "executive layer" identity from the Canonical Brief? The Extension Spec and the Canonical Brief give contradictory signals. The Extension Spec is more recent (2026-03-09 vs 2026-03-08).

**Recommendation:** Follow the Extension Spec. Pleroma keeps S2 raw primitives, S2' tool registration, bounded primitive registry, Techne lifecycle, pleroma-skill-proxy. The orchestration skills and agents move to Anima.

### H.2 Superpowers Fork Base Version

The intended fork base is `obra/superpowers v4.3.0` per the VAK integration spec. The locally installed source is confirmed at `v4.2.0` (commit `a98c5dfc`). This provenance mismatch must be tracked. The v4.3.0 delta is unknown and may contain behavioral changes relevant to parity.

### H.3 Moirai Surfacing Model

The canonical brief notes: "The exact surfacing of Moirai as one agent with internal roles versus separate surfaced subagents remains an implementation choice constrained by canonical semantics." The FR layer assignment says Moirai is a CF2 cluster invoked as a unit. The staging `plugin.json` lists `moirai` as a single agent under `aletheia-mode`. This seems correct but the internal Klotho/Lachesis/Atropos routing mechanism is unspecified for the new Rust/plugin architecture.

### H.4 notebooklm vs Gnosis

Per MEMORY.md: "Gnosis REPLACES NotebookLM in KnowingDossier." The notebooklm skill is staged under Pleroma as a "port-and-refine" atomic skill, but its long-term role is temporary quality benchmark for A/B testing until Gnosis matches. Decision: keep notebooklm as Aletheia-owned atomic skill, with explicit deprecation timeline.

### H.5 chatlog-fetcher and youtube-transcript Ownership

These are evidence acquisition skills with no upstream artifact. They could belong to either Pleroma (as tool-access primitives) or Aletheia (as knowledge-acquisition instruments). The port matrix puts them under Pleroma, but their function is closer to Aletheia's S5' role (knowledge crystallization).

### H.6 day-night-pass Ownership

Day/Night' topology has elements of both Chronos (temporal pathing, S4-3') and Anima (orchestration, S4-4'). The VAK spec places it as an orchestration skill. The Extension Spec maps Chronos to "Temporal Pathing & Day/NOW Lifecycle." Decision: assign to Anima (it routes agents through the topology), but document Chronos dependency for temporal mechanics.

### H.7 Neo4j Property Key: `coordinate` vs `bimbaCoordinate`

MEMORY.md says `Property key: coordinate (not bimbaCoordinate)`. The S2 spec uses `bimbaCoordinate` throughout. This inconsistency must be resolved before seed implementation. MEMORY.md is the more recent correction.

### H.8 Embedding Dimensions

MEMORY.md says "3072-dim embeddings — unified embedding space." The S2 spec's vector index creation uses `vector.dimensions: 768`. The Python source supports 768/1536/3072. Decision needed on which dimension is canonical for initial seed.

### H.9 PI Agent Runtime Dependency

Many Pleroma capabilities depend on PI (the coding agent runtime) being installed and available. PI is explicitly noted as "not installed" in MEMORY.md. The S4 substrate (agent module in epi-cli) provides the Rust-side infrastructure, but the PI runtime extensions (the 6 `.ts` files specified in the Extension Spec) require PI. Implementation must sequence accordingly.

### H.10 Redis Tier Model Authority

The FR layer assignment clarifies: "Khora defines the Bimba-aware tier model (HOT/WARM/COLD). S2' provides the Redis backend primitives." Pleroma therefore does NOT own the tier model — it consumes Khora's tier definitions through S2's raw Redis access. This must be respected in implementation.

### H.11 OneContext Integration

OneContext (cross-session memory) appears in the upstream source inventory as a key Pleroma dependency, but it is listed as "out of scope" in the VAK spec. Its status in the new architecture is unclear. If it maps to the Gnosis RAG pipeline (Aletheia), then Pleroma's dependency may be satisfied differently.

### H.12 Skill Evaluation Harness Precedence

The S4 spec (Phase 4) specifies building the evaluation harness BEFORE the Pleroma port (Phase 6). The 5 staged eval suites assume the harness exists. Implementation must follow this ordering.

### H.13 Constitutional Progeny and Rust Substrate

The constitutional progeny principle (external agents inherit canonical skills, CF identity, etc.) is specified at the SKILL.md level but requires substrate support in Rust (`epi-cli/src/agent/spawn.rs`). The spawn module exists but is not yet wired to the plugin/skill system.

### H.14 Pleroma CONTRACT.md

The upstream `CONTRACT.md` (from epi-claw) specifies: "no parallel runtime, subagents not skills, transcript ownership, prime handling, relation law, GitButler lane." A Pleroma `CONTRACT.md` for the new architecture does not yet exist and must be authored.

### H.15 S4 Spec Phase Ordering

Per the S4 spec, the correct implementation sequence is:
1. Phase 1-3: Registry, validation, plugin runtime (S4 substrate)
2. Phase 4: Evaluation harness
3. Phase 5: epi-core plugin
4. Phase 6: Pleroma plugin
5. Phase 7: ta-onta module plugins

Pleroma implementation should NOT begin until Phase 1-5 are substantially complete. This is the "correct prerequisite sequence" per the S4 spec's own language.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Functional Requirements | 42 (FR-P-001 through FR-P-076) |
| User Stories | 10 (US-P-001 through US-P-010) |
| Staged atomic skills | 15 (13 Pleroma-proper, 2 reassign to Aletheia) |
| Staged orchestration skills | 6 (all reassign to Anima) |
| Staged eval suites | 5 + manifest (2 Pleroma-proper, 3 reassign) |
| Staged hooks | 4 (2-3 Pleroma-proper, 1-2 shared/reassign) |
| True-port capabilities | 13 |
| Port-and-refine capabilities | 8 |
| Fresh-design capabilities | 7 |
| Open decisions | 15 |
| S2 Rust stubs needing implementation | 17 files |
| Python port source LOC | ~14K production |
