# Epi-Logos: Full FR Layer Assignment Analysis

> **Status**: Harmonized Research Reference — companion to `2026-02-26-epi-logos-canonical-system-plan.md`
> **Date**: 2026-02-27 (harmonized 2026-02-27 against VAK spec, bimba-data-foundation-harmonization, coordinate-semantics, Pleroma plan, conformance plan)
> **Source**: 6 parallel subagent analyses of v3 PRDs; subsequently harmonized against authority planning docs
> **Purpose**: Full tabulation of all functional requirements per ta-onta module, with runtime home assignment, existing method reference, cross-layer integration mapping, and modification notes
>
> **COORDINATE KEY FORMAT**: The canonical coordinate key format is `{coord}_{n}_{semantic}` — e.g., `c_4_template_id`, `p_0_grounds`, `t_1_extracted_from`, `l_2_eros_lens`. The intermediate `pos{x}_{semantic}` form (e.g., `pos0_grounds`) is deprecated. The older `pos_x_{semantics}` with hardcoded semantics per position is fully deprecated. Authority: ta-onta `PLAN.md` → enforced by Hen normalization law. Any reference to `pos_x_{semantics}` in the US rows below reflects the PRD language and should be read as "canonical `{coord}_{n}_{semantic}` format" in implementation.

---

## How to Use This Document

Each module section contains:
1. **FR Table** — every US/FR from the v3 PRD with runtime home assignment (PI/S | S4/S4' | S3/S3')
2. **Push-Down Candidates** — requirements currently implemented at S3/S3' that belong deeper
3. **Initialization Sequence** — how each module comes alive via epi-claw at session start

For actionable architectural decisions derived from this analysis, see the **Cross-System Push-Down Decisions** section in the canonical plan (`2026-02-26-epi-logos-canonical-system-plan.md`).

---

## Cross-System Synthesis

### Cross-System Architectural Clarifications

The following concerns appeared in PRD-level analysis with incorrect framing. Corrections grounded in harmonization doc + VAK spec + conformance plan:

| Concern | Correct Home | Correction |
|---------|-------------|------------|
| Redis cache tier model (HOT/WARM/COLD) | **Khora (S3-0') — already correctly homed** | Khora defines the Bimba-aware tier model based on artifact role/volatility (HOT: `/empty/present` TTL 300; WARM: `/thought` TTL 3600; COLD: `/bimba` TTL 86400). S2' QL Graph provides the Redis backend primitives. **No push-down needed** — Khora IS the tier-model authority. The initial analysis was wrong to suggest S2' QL Graph owns tiers. |
| Session identity normalization (sessionKey parsing, safe-id) | **Shared ta-onta/OpenClaw-aligned surface** — plugin-level utility, not S4 contract | Must work within native `sessions_spawn`/OpenClaw constraints; centralized once, consumed everywhere. Not a free-standing `taonta-session-identity-contracts.ts` at S4 — it extends/wraps native OpenClaw generation deliberately. Authority: harmonization doc §Session naming centralization. |
| Filesystem writes + path validation | **Khora** (filesystem edge/transport/queue) | Khora IS the filesystem edge; it preserves Obsidian link health via sync queue. The "shared path service" (US-003) is a plugin-internal cross-module utility — not a new S4/S4' contract layer. Modules write through Khora-owned paths; they don't need a separate S4 filesystem contract. |
| Coordinate key/relation naming law | **Hen S3-1' enforces; authority is ta-onta `PLAN.md`** | Old `pos_x_{semantics}` form (and intermediate `pos{x}_{semantic}`) are deprecated. Canonical: `{coord}_{n}_{semantic}` (e.g., `c_4_template_id`, `p_0_grounds`, `t_1_extracted_from`). Hen normalizes on write; all modules must adopt. No module reimplements — they call Hen's normalization interface. |
| QL coordinate validation/parsing | **S0' QL Types (PI/S)** — correctly identified | No module should carry local coordinate grammar. S0' is the canonical validator; all modules consume it. |
| Context compaction hook mechanics | **PI/S session lifecycle via OpenClaw** — correctly identified | Modules subscribe to the hook; OpenClaw exposes the seam. Not module-owned. |
| LLM tier optimization (Gemini/GLM/Claude) | **Per-invocation agent operational pattern** — not a gateway policy | Tiers apply at `llm-task` invocation and external session spawning via tmux. Rule set: `.claude/rules/llm-invocation.md` (FREE: gemini-cli bulk ops; CHEAP: glm fallback; FULL: claude orchestration/synthesis). Aletheia uses Gemini-free for lightweight QL/S-gate checks; fuller tiers for Möbius/synthesis. Each agent/module applies the rule per-task — no shared S4 gateway service required. |
| Execution thread types for agent orchestration | **CFP types** (S4-4' coordinate values) — baked into PI agent harness (S3/Harness) | CFP thread types: P-Thread (parallel), C-Thread (chained/validation), F-Thread (fusion/N-agents), L-Thread (long autonomous). Topology metaphors (torus/lemniscate/klein) describe CS (Context Sequence) traversal shapes at S4-5' — VAK-imported behavior governing execution closure shape. Neither is a module-level governance concern; both are in PI harness planning docs. |
| NOW lineage closure + TaskNotes schema | **Anima (S3-4') owns NOW execution; Aletheia consumes/validates** | Anima is the runtime executor of Day/NOW paradigm (materializes/operates NOW child contexts under Day parent). Aletheia performs coordinate checking/orientation/crystallization — it is the consumer/validator. Hen owns artifact contracts; Khora owns filesystem I/O. Contract DEFINITION for the schema lives with Anima (not a separate S4 service). |

### Plugin Module Integration (Gate-Constrained, Not Serial)

**ta-onta is one plugin over one shared filesystem/memory substrate.** Modules are NOT serially initialized. They come up through shared contract integration surfaces and foundation gates.

**Foundation gates** (from architecture conformance plan) determine readiness:
- **Gate 1** — Shared contract baseline: shared path service (US-003), normalization law (US-008), session identity surface verified
- **Gate 2** — Plugin registration: all modules registered via OpenClaw with verified hook subscriptions, no parallel buses
- **Gate 3** — Module integration: all cross-module contracts (Khora↔Hen, Pleroma↔Hen, Chronos↔Khora, Anima↔all) have evidence of working integration

Modules may activate in parallel where file scopes don't conflict. Readiness/e2e discharge (US-017..US-020) remains blocked until all gates are explicitly green with evidence.

Each module registers with S4/S4' epi-claw gateway via native OpenClaw hooks (no parallel event bus). The gateway owns hook mechanics; modules subscribe.

> **NOTE on Aletheia**: Aletheia (S3-5') is the **integration apex** of the S3 module stack — not a "dormant mode" that needs to be woken. It's a functional layer within the Anima system, structurally present. Its CF code routing clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are activated via CF dispatch routing, not a separate dormancy/wakeup mechanism.

### Module Dependency Map

```
Aletheia (S3-5') ─functional-layer-of─► Anima; also depends-on Khora (hooks), Hen (graph), Pleroma (Moirai), Chronos (temporal)
Anima (S3-4') ───depends-on──► Khora (context/NOW), Hen (templates/coordination), Chronos (CPF/temporal), VAK/S4' (12-agent roster)
Chronos (S3-3') ─depends-on──► Khora (NOW ownership/filesystem), Hen (coordination queries), Aletheia (Möbius/SEED)
Pleroma (S3-2') ─depends-on──► Hen (relation law/coordination), Khora (worktree/filesystem), S0' (QL types)
Hen (S3-1') ─────depends-on──► S2' QL Graph (Neo4j/Redis backend), S1' QL Obsidian (filesystem ops)
Khora (S3-0') ───depends-on──► Hen (session_register, conflict_detect), S2' (Redis backend), OpenClaw (hooks)
```

> **Note**: Aletheia (S3-5') is the integration apex of the S3 stack — "functional layer within the Anima system, not a separate plugin" (VAK spec). Its dependency on Anima is integral, not a peer relationship.

---

## Khora (S3-0') — FR Layer Assignment Analysis

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-000 | OpenClaw Plugin Extension Packaging and Registration Contract | S3/S3' | `/extensions/khora/index.ts`, `CONTRACT.md`, `openclaw.plugin.json` | Explicit plugin registration via OpenClaw SDK hooks (no parallel bus) | none / confirm plugin form complete |
| US-001 | Establish Khora Runtime Contract | S3/S3' | `CONTRACT.md`, `src/types.ts`, `src/ql.ts` | Defines QL coordinate types (C,P,M,S,T,L); SQL session store is source of truth | none / confirm v3 contract fully documented |
| US-002 | Bootstrap Override Pipeline for NOW Context | S3/S3' | `src/bootstrap-hook.ts`, `src/bootstrap.ts` | `agent:bootstrap` hook; SEED→CONTINUATION→QRD→SOUL→TOOLS ordering | none / verify hook chain order and fallback degradation |
| US-003 | Redis Hot-Cache First NOW Read | S3/S3' | `src/cache.ts`, `src/session.ts` | Reads `cache:hot:empty/present:now.md` first; fallback to filesystem | none / confirm cache hit/miss telemetry |
| US-004 | Session-Scoped NOW Writes During Active Run | S3/S3' | `src/session.ts`, `src/ql.ts` | Writes to `session:{id}:now:md`; conflict guard via Hen | none / verify lock metadata format matches Hen |
| US-005 | session:stop Coordination Extension | S3/S3' | `src/session.ts`, `session-stop-hook.ts` | Pushes sync queue; calls `obsidian sync` CLI; updates Redis; signals Neo4j via Hen; releases locks | none / confirm queue schema and Neo4j signaling |
| US-006 | Neo4j Coordination Integration for Khora | S3/S3' | `src/hen.ts`, `src/session.ts` | Consumes Hen `session_register`, `conflict_detect`, `session_complete`, `trackInsightEdge` | none / verify Hen tool contract binding |
| US-007 | Session Store Metadata Extension | S3/S3' | `src/session-metadata.ts`, `src/session.ts` | Plugin-scoped metadata patch (backward-compatible); includes QL C,P,M,S,T,L | none / confirm patch format |
| US-008 | Read-Only bkmr → NOW Suggestion Bridge | S3/S3' | `src/bkmr.ts`, `src/session.ts` | Calls `epi kbase suggest --project`; injects non-canonical section in NOW; feature-flagged | none / confirm bkmr CLI invocation contract |
| US-009 | Observability for Khora Lifecycle | S3/S3' | `src/telemetry.ts`, `src/errors.ts`, `src/session.ts` | Structured logs for bootstrap, cache hit/miss, queue push, lock status, completion | none / confirm telemetry surface complete |
| US-010 | Cross-Plugin Integration Verification (S4') | S4/S4' + S3/S3' | `IMPLEMENTATION-REPORT.md` (deferred Phase A/B) | Verified with Hen, Chronos, OpenClaw baseline, SEED Möbius return | deferred / Phase A + B |
| US-011 | SEED.md Bootstrap Priority | S3/S3' | `src/bootstrap.ts`, `src/session.ts` | 6 AM check for SEED.md first; creates NOW.md with SEED as P0; fallback to NOW.md | none / confirm Chronos timing alignment |
| US-012 | CONTINUATION.md Pre-Compaction Flush | S3/S3' | `src/session.ts` (`onBeforeCompaction`), `src/bootstrap.ts` | On 80% token limit, flushes to CONTINUATION.md; post-compaction loads CONTINUATION first | none / confirm token threshold |
| US-013 | /Thought Folder Routing for Aletheia | S3/S3' | `src/thought.ts`, `taonta.khora.route_thought_content` | Maps P0→T0 … P5→T5; frontmatter (source_session, coordinate, timestamp); warm cache + Neo4j sync | none / confirm QL position mapping |
| US-014 | Redis Warm Cache for /Thought | S3/S3' | `src/thought.ts`, `src/cache.ts` | Warm cache keys `cache:warm:thought:T{0-5}/*` TTL 3600 | none / confirm cache invalidation on updates |
| FR-1 | Use existing OpenClaw hook infrastructure | S3/S3' + S4/S4' | `index.ts` hook registration | No parallel lifecycle bus; native OpenClaw seams only | none |
| FR-2 | Bootstrap override seam | S3/S3' | `src/bootstrap-hook.ts` | Plugin-local override; no core replacement | none |
| FR-3 | Redis hot-cache-first NOW reads with fallback | S3/S3' | `src/cache.ts`, `src/session.ts` | Deterministic fallback to filesystem; cache miss provenance logged | none |
| FR-4 | Active session writes in session-scoped Redis namespace | S3/S3' | `src/session.ts` | Isolated until stop; TTL sliding window; conflict guard via Hen | none |
| FR-5 | Extend `session:stop` to coordinate all finalization | S3/S3' + S4/S4' | `session-stop-hook.ts`, `src/session.ts` | Queue push → file write → cache refresh → Neo4j status → lock release | none |
| FR-6 | Consume Hen coordination interfaces | S3/S3' | `src/hen.ts` (HenCoordinator) | No duplicate lock/session models outside Hen contract | none |
| FR-7 | Preserve SQL/session transcript ownership | S4/S4' + S3/S3' | `src/session-metadata.ts` — patch surface only | Khora metadata is optional, backward-compatible patch | none |
| FR-8 | Enforce non-canonical labeling for semantic suggestions | S3/S3' | `src/bkmr.ts` | Non-canonical source/score/provenance labels; no graph mutations | none |
| FR-9 | Emit structured telemetry for each lifecycle phase | S3/S3' | `src/telemetry.ts` | Bootstrap source, cache hit/miss, queue push, lock status | none |
| FR-10 | Support feature flags for staged enablement | S3/S3' | `src/config.ts`, `config.features` | Feature flags for cache, thought routing, bkmr bridge | none |
| FR-11 | Use existing Obsidian CLI integration | S4/S4' + S3/S3' | `session-stop-hook.ts` → `openclaw obsidian sync` CLI | Leverages existing Epi-Claw Obsidian CLI path | none |
| FR-12 | Tier mapping by directory (hot/warm/cold) | S3/S3' | `CONTRACT.md`, `src/config.ts`, `src/cache.ts` | Hot: `/empty/present` TTL 300; Warm: `/thought` TTL 3600; Cold: `/bimba` TTL 86400 | none |
| FR-22 | Prefer existing Parashakti/GraphRAG Redis cache via adapter | S4/S4' + S3/S3' | `src/cache.ts` (Parashakti adapter) | Production uses Redis; in-memory as fallback only | none / confirm adapter stability |
| FR-27 | NOW lineage model (parentNowId, childNowId) | S3/S3' | `src/session.ts`, session metadata `nowLineage` | Lineage spawn/merge/close handlers in `updateSessionNow` | none / confirm lineage schema |
| FR-28 | TaskNotes-compatible NOW handoff envelopes | S3/S3' + S3/S3' (Anima) | `src/session.ts` (tool `taonta.khora.update_now`) | Handoff integrated into `onSessionEnd` | none / confirm TaskNotes compatibility |

### Push-Down Candidates

1. **Redis cache infrastructure abstraction (FR-22)** → PI/S (S2' QL Graph): Cache adapter and coordinate-semantic retrieval should be deep primitives consumed by all modules. Khora should not own the cache implementation.
2. **Session identity normalization** → S4/S4' shared: Session key parsing, safe-id derivation should be in `taonta-session-identity-contracts.ts`.
3. **Filesystem write contracts** → S4/S4' shared: Write-target validation and queue path validation should be in `taonta-filesystem-contracts.ts`.
4. **Day/NOW naming contract helpers** → S4/S4' shared: Path-safe segment validation and canonical target assertions should be in `taonta-filesystem-contracts.ts`.

### Initialization Sequence

1. Plugin registration: cache client, telemetry, Hen coordinator, hooks, tools registered with OpenClaw API
2. `agent:bootstrap` fires → SEED→CONTINUATION→QRD→SOUL→TOOLS ordering; NOW.md injected if 6 AM Möbius window
3. `session_start` → Redis session namespace initialized; Hen `session_register` called; Neo4j locks acquired
4. `before_agent_start` → CONTINUATION.md or cached NOW.md prepended to prompt
5. Active session: `taonta.khora.update_now` tool writes session-scoped NOW updates; Redis TTL managed; Hen conflict detection
6. `before_compaction` (80% token limit) → active focus flushed to CONTINUATION.md; warm cache queued
7. `session_end` → sync queue pushed HIGH priority; Obsidian CLI invoked; Redis refreshed; Hen `session_complete` signaled; locks released

---

## Hen (S3-1') — FR Layer Assignment Analysis

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-001 | Define Canonical Direct Tool Contracts | S3/S3' | `extensions/hen/CONTRACT.md`, `extensions/hen/index.ts` | Gateway tool registration, MCP adapter parity | none / confirm |
| US-002 | Register Hen Tools via OpenClaw Plugin System | S3/S3' | `extensions/hen/index.ts`, `openclaw.plugin.json` | OpenClaw tool registration seam | none / confirm |
| US-003 | Implement Coordination Tool Suite (session/lock/conflict) | S3/S3' | `extensions/ta-onta/modules/hen/service.ts`, `extensions/hen/src/store-neo4j.ts` | Neo4j Session/Coordinate/Lock nodes; Khora/Pleroma consumption | `pos_x_{semantics}` format enforcement |
| US-004 | Canonical POS Taxonomy Parity | S3/S3' | `extensions/ta-onta/modules/hen/relations.ts` | Python core/TS runtime relation parity | Full pos_x_{semantics} taxonomy implemented |
| US-005 | Hybrid Retrieval Pipeline (Production) | S3/S3' | `extensions/ta-onta/modules/hen/retrieval.ts`, `extensions/hen/src/graphrag.ts` | Parashakti GraphRAG bridge, BM25 index, vector DB, Neo4j expansion | Coordinate-aware retrieval by TX type |
| US-006 | Smart Connections Policy Boundary | S3/S3' | `extensions/ta-onta/modules/hen/smart-connections.ts` | Obsidian Smart Connections API; proposals stored as `canonical=false` | Confidence/provenance scoring; explicit promotion gate |
| US-007 | SQL vs Neo4j Memory Boundary Enforcement | S3/S3' + S4/S4' | `extensions/ta-onta/modules/hen/boundary.ts` | OpenClaw SQL session store; Neo4j persistent layer | Transcript write guardrails; degraded sync visibility |
| US-008 | Obsidian Sync Surface Validation | S3/S3' + S4/S4' | `extensions/ta-onta/modules/hen/sync-contract.ts` | EPI-26 gate validation; Obsidian sync API; fallback diagnostics | last_synced tracking, drift visibility |
| US-009 | Retrieval Quality Gates and Benchmark Suite | S3/S3' + PI/S | `extensions/hen/scripts/benchmark.ts`, `extensions/hen/index.test.ts` | CI/release checklist; performance regression detection | Pragmatic latency/relevance targets |
| US-010 | Cross-Plugin Runtime Verification in S4' | S4/S4' | `extensions/ta-onta/conformance/e2e-*.test.ts` | Khora, Pleroma, Anima, Aletheia, Chronos integration tests | Verification evidence capture |
| US-011 | /Thought GraphRAG Integration | S3/S3' | `extensions/ta-onta/modules/hen/thought.ts` | `/Thought/T*/` scan; Neo4j indexing; `pos_t_extracted_from` relationship | Thought node extraction and pos_t_* relations |
| US-012 | kbase Semantic Search Tool | S3/S3' | `extensions/ta-onta/modules/hen/kbase.ts` | bkmr CLI integration (`--gemini sem-search`); project scoping | Graceful fallback if bkmr not installed |
| US-013 | Ouroboros PRD Knowledge Graph | S3/S3' | `extensions/ta-onta/modules/hen/prd.ts` | ralph-tui PRD events; collaboration event lineage; verification tracking | PRD node creation, pos_s_contains/blocked_by/depends_on |
| US-014 | REPL Document Topology Integration | S3/S3' | `extensions/ta-onta/modules/hen/topology.ts` | Wikilink parsing; pos_c_links_to; orphan detection; link centrality | Document coordinate extraction from frontmatter |
| US-015 | Notion Boundary and Deferred Ingestion Contract | S3/S3' | `extensions/ta-onta/modules/hen/service.ts`, `CONTRACT.md` | Notion as visibility layer only; deferred M5' pathway marker | No v3 Notion→Neo4j ingestion |
| US-016 | S1-X' Template Registry Integration | S3/S3' | `extensions/ta-onta/modules/hen/template-registry.ts` | S1-X' sources (CT0'..CT5', CT4b'); Anima/Aletheia/Khora consumers | Template primitive extraction |
| US-017 | Canonical Coordinate Grammar + Prime/Inversion Support | S3/S3' | `extensions/ta-onta/modules/hen/coordinate.ts` | C/P/M/S/T/L, ranges, inner positions, context frames, prime marker | Full grammar normalization |
| US-018 | Frontmatter↔Neo4j 1:1 Coordinate Schema Mapping | S3/S3' | `extensions/ta-onta/modules/hen/frontmatter.ts` | YAML parsing; canonical key format `{coord}{x}_{semantic}`; wikilink→relationship | Non-coordinate schema field allowlist |
| US-019 | Seed→File Template Execution Path | S3/S3' | `extensions/ta-onta/modules/hen/template-registry.ts` (invoke) | CT0'..CT5' instantiation; artifact file creation; canonical frontmatter | Lightweight render+copy |
| US-020 | Coordinate-Native Query and Relation Semantics | S3/S3' | `extensions/ta-onta/modules/hen/service.ts`, `contracts.ts` | Query filters by coordinate type/position/prime | Coordinate-semantic payload delivery |
| US-021 | GraphRAG Bridge Activates Existing Parashakti Redis Cache | S3/S3' + S4/S4' | `extensions/hen/src/graphrag.ts`, `graphrag_bridge.py` | Parashakti Redis; bridge path configuration; cache hit/miss/degraded telemetry | Cache activation without duplicate logic |
| US-022 | Coordinate-Semantic Filters Through GraphRAG Bridge | S3/S3' | `extensions/hen/src/contracts.ts`, `graphrag.ts` | Selector payload schema; bridge execution; provenance preservation | Coordinate-semantic filter pass-through |
| US-023 | REPL-Style Section/Slice Retrieval as Canonical Tool | S3/S3' + S3-3' | `extensions/hen/src/service.ts` (selector-aware); Chronos consumer | Chronos REPL integration; focused slice packaging | Hen selector-aware tool; Chronos owns compact orchestration |
| FR-14 | Enforce pos_x_{semantics} Relationship Format | S3/S3' | `extensions/ta-onta/modules/hen/relations.ts` | Neo4j write paths throughout Hen | 100% adoption of pos_p_*, pos_c_*, pos_m_*, pos_s_*, pos_t_*, pos_l_* |
| FR-15 | Track Session→Artifact→Insight Flow | S3/S3' | `extensions/ta-onta/modules/hen/service.ts`, `thought.ts` | Neo4j node/relationship creation; crystallization paths | Session→Thought (pos_t_extracted_from), Thought→Category, BimbaForm→DailyNote |
| FR-25 | Hen Owns S1-X' Template Registry Access | S3/S3' | `extensions/ta-onta/modules/hen/template-registry.ts` | S1-X' source resolution; Anima/Aletheia/Khora client contracts | Template ownership boundary documentation |
| FR-34 | Expose Canonical Primitive-Resolution APIs | S3/S3' | `extensions/ta-onta/modules/hen/template-registry.ts` | Anima NOW context; CT0'..CT5' and process primitives | Runtime template primitive resolution interface |

### Push-Down Candidates

1. **Frontmatter mechanics normalization** → PI/S or S4/S4' (`taonta-frontmatter-mechanics.ts`): Generic key tokenization and alias application are system-wide; Hen retains semantic law.
2. **Path contract validators** → S4/S4' (`taonta-filesystem-contracts.ts`): Path resolution and segment validation are cross-module utilities.
3. **Session identity normalization** → S4/S4' (`taonta-session-identity-contracts.ts`): Already identified as US-031 target.
4. **Sync invocation validation** → S4/S4' shared: Sync command/flag allowlisting is a shared contract; Hen implements the adapter.

### Initialization Sequence

1. Plugin registration: OpenClaw loads `openclaw.plugin.json`; HenService instantiated; all tools registered
2. Neo4j connection validated; schema for Session/Coordinate/Lock nodes confirmed; indexes created
3. Hook subscription: `session_start`, `session_end`, `before_compaction` via `api.on()`
4. `HenService.start()`: store layers initialized; template registry preloaded; sync contract outcome integrated
5. Hybrid retrieval pipeline activates on first retrieval call (deferred, to gracefully degrade on missing dependencies)

---

## Pleroma (S3-2') — FR Layer Assignment Analysis

**CRITICAL — Pleroma Identity**: Pleroma is a **port of obra/superpowers v4.3.0** into a PI-native extension (VAK spec: "FORK BASE: obra/superpowers (v4.3.0)"). It ports the highest-value modded superpowers/ta-onta atomic capabilities so that Anima+Aletheia PI agents and team/chain subagents can invoke first-class tools with explicit **agent-scope policy bindings**. Core capabilities exposed: `tmux` (terminal multiplexer), `mprocs` (process launcher), `bkmr/epi-kbase` (knowledge base), `onecontext` (context aggregation), `ralph` (task UI launcher), **`repl`/Darshana** (document topology navigator — non-spawning utility skill for QL-structured large-file exploration; owner: Aletheia; shared: Anansi, Sophia, Nous, Logos; source: `epi-claw/skills/repl/SKILL.md` + `darshana.py`). It patches vendored `agent-team`/`agent-chain` primitives to propagate explicitly allowed child extensions while preserving `--no-extensions` discovery lockout. **"Technē"** in the codebase refers to infrastructure substrate management commands (`technē-spawn`, `technē-relay`, `technē-list`, `technē-close`) — not a separate "Techne subagent." These are the mechanism by which external CLI agents are launched and retrieved from workshop windows.

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-001 | Define Pleroma Runtime Contract | S3/S3' | `extensions/ta-onta/modules/pleroma/` | Hen coordination + OpenClaw session system | Contract document + QL coordinate family definition |
| US-002 | Klotho Spawn Path (Assert) | S4/S4' + S3/S3' | `extensions/ta-onta/modules/pleroma/moirai/` | OpenClaw `sessions_spawn`; Hen Neo4j tracking; Redis isolation | L2 lens coordinate binding; `pos2_operates_via` relation |
| US-003 | Lachesis Spawn Path (Query) | S4/S4' + S3/S3' | `extensions/ta-onta/modules/pleroma/moirai/` | OpenClaw `sessions_spawn`; Hen Neo4j tracking; Redis isolation | L2 lens coordinate binding; canonical relation |
| US-004 | Atropos Spawn Path (Reflect) | S4/S4' + S3/S3' | `extensions/ta-onta/modules/pleroma/moirai/` | OpenClaw `sessions_spawn`; Hen Neo4j tracking; Redis isolation | L2 lens coordinate binding; canonical relation |
| US-005 | Parent-Child Session Coordination with Neo4j | S4/S4' | `extensions/ta-onta/modules/hen/` (via Hen contracts) | Hen coordination; Neo4j schema; Chronos orphan detection | Canonical relation key normalization; prime notation support |
| US-006 | Per-Subagent Worktree Isolation | S4/S4' + S3/S3' | `extensions/ta-onta/modules/khora/` (filesystem) | Khora writes; Redis metadata; Neo4j registration | QL coordinate type in worktree naming |
| US-007 | Redis Namespace Isolation for Moirai | S4/S4' | `extensions/ta-onta/modules/khora/cache.ts` | Redis HOT tier; session identity primitives | Lens coordinate type (L0-L5) in Redis keys |
| US-008 | Skill Artifacts That Teach Subagent Spawning | S3/S3' | `extensions/ta-onta/modules/pleroma/skills/` | OpenClaw skill discovery; Pleroma gating | QL metadata extension; prime-aware coordinate support |
| US-009 | QL Coordinate Gating and Prime Notation Enforcement | S3/S3' + S4/S4' | `extensions/ta-onta/modules/pleroma/` + `shared/` | OpenClaw gating; S0' QL Types | Full C/P/M/S/T/L parsing; prime (`'`) trigger for Pratibimba |
| US-010 | Cross-Plugin Runtime Verification | S4/S4' | Conformance test harness | Khora hooks; Hen coordination; Chronos orphan detection | Verify QL coordinate handling; canonical relation consistency |
| US-011 | Moirai Lens Coordinate Assignment (CF2 = L2 Eros) | S3/S3' | `extensions/ta-onta/modules/pleroma/moirai/` | Neo4j metadata via Hen; canonical relation keys | Assign L2 to all three Moirai roles; attach on spawn relationships |
| US-012 | Prime Coordinate Handling in Moirai Context | S3/S3' | `extensions/ta-onta/modules/pleroma/coordinate-gating.ts` | S0' QL Types validator; path-safe encoding | Prime (`'` → `i` in paths); Pratibimba route triggering |
| US-013 | Centralized API Key Management via 1Password | S4/S4' | Existing 1Password skill boundary | S5' External API surface; per-agent key scoping | No Pleroma-local key management |
| US-014 | Moirai Prompt Contract → Canonical QL Sources | S3/S3' + S4/S4' | `extensions/ta-onta/modules/pleroma/moirai/prompts.ts` | Anima versioned QL Context Crystal | Reference Anima Crystal; degrade safely on stale |
| US-015 | Skill Creator Assignation Policy Hook | S3/S3' | `extensions/ta-onta/modules/pleroma/skill-creator.ts` | Anima skill creator workflow | Emit canonical assignation metadata registry |
| FR-1 | Moirai as OpenClaw subagents via `sessions_spawn` | S4/S4' | OpenClaw native spawn | sessions_spawn primitives; announce/return flow | Native integration confirmed |
| FR-2 | Skills as instructional artifacts only | S3/S3' | OpenClaw skill discovery + Pleroma gating | OpenClaw skill registry | Confirm no custom SkillRegistry/SkillInvoker in Pleroma |
| FR-3 | Per-Moira tool policy boundaries (Assert/Query/Reflect) | S3/S3' | `extensions/ta-onta/modules/pleroma/moirai/policies.ts` | OpenClaw tool policy system | Role/operational-mode binding to policies |
| FR-4 | Announce-based return flow for parent-visible outcomes | S4/S4' | OpenClaw announce primitive | Native announce/return/handoff paths | Verify payload includes coordinate context |
| FR-5 | Parent-child session relationships via Hen-backed Neo4j | S4/S4' | Hen coordination contracts | Hen register/lock/heartbeat/complete | `pos2_operates_via` canonical key |
| FR-6 | Child work isolation via dedicated worktree strategy | S4/S4' | Khora worktree provisioning | Khora filesystem; isolated `/empty/present` + symlinked `/bimba`/`/thought` | Reference/symlink strategy; cleanup for orphaned |
| FR-7 | Child Redis namespace isolation with TTL | S4/S4' | Redis HOT tier; Khora session namespace | Khora session identity; Redis key derivation | Per-child metadata registry; TTL/refresh test coverage |
| FR-8 | Conflict detection before write finalization | S4/S4' | Hen lock/conflict APIs | Neo4j coordination; Hen graph authority | Verify conflict checks before Atropos outcome merge |
| FR-9 | Orphaned child detection/cleanup with Chronos | S4/S4' | Chronos periodic job; Pleroma session state | Chronos orphan detection; session stale markers | Heartbeat tracking; coordinate cleanup with Chronos |
| FR-10 | Skill metadata includes prime-aware QL coordinate gating | S3/S3' | `extensions/ta-onta/modules/pleroma/skills/metadata.ts` | OpenClaw gating; S0' QL Types validator | `metadata.openclaw` extensions with coordinate family |
| FR-11 | Outputs preserve wikilink protocol for coordinate/file refs | S3/S3' | Wikilink output validation | Coordinate link generation; path-safe encoding | Enforce wikilink format |
| FR-12 | Preserve SQL/OpenClaw transcript ownership | S4/S4' | OpenClaw session history (SQL) | Session history boundary | Confirm transcript to native SQL; Neo4j = coordination only |
| FR-13 | Pleroma rollout feature-flaggable and reversible | S3/S3' + S4/S4' | Feature flags in ta-onta configuration | Gate ticket status (EPI-25, EPI-26, EPI-27) | Feature flag controls; reversibility without data loss |

**CRITICAL**: Moirai is a CF2 cluster (CF code `(0/1/2)` = 3 positionally-assigned roles). US-002/003/004 specify the spawn paths for Klotho/Lachesis/Atropos but Moirai must be **invoked as a unit** by its caller (primarily Eros). The internal positional routing is Moirai's concern, not the dispatch caller's.

### Push-Down Candidates

1. **Moirai spawn template and tool policy binding** → S4' (epi-claw gateway) or S3/Harness: The spawn template and announce return flow are deep runtime mechanics; OpenClaw `sessions_spawn` primitives are the actual spawn path.
2. **Canonical coordinate key law (`{coord}_{n}_{semantic}`)** → Hen S3-1' normalizes; S0' QL Types validates grammar. Pleroma consumes — no local reimplementation. (Note: old PRD language says `pos_x_{semantics}`; canonical form is `{coord}_{n}_{semantic}` per ta-onta `PLAN.md`.)
3. **Redis HOT tier schema** — see Cross-System note: Khora owns the Bimba-aware tier model; S2' provides backend primitives. Pleroma consumes Khora's Redis interface directly.

### Initialization Sequence

1. Plugin registration: `registerPleromModule` in `index.ts`; lifecycle hooks registered; skills auto-discovered
2. Moirai subagent definitions materialized as PI-native agent references; L2 (Eros) lens coordinate assigned
3. Tool policies bound: Klotho = `{graph_embed, graph_validate}`, Lachesis = `{graph_search, graph_traverse}`, Atropos = `{graph_context, graph_disclosure, graph_write}`
4. Per-child isolation infrastructure prepared: worktree provisioning (Khora), Redis namespace (S2'), Neo4j parent-child link (Hen)
5. QL coordinate validator (S0') activated for all inbound calls; prime notation detection active
6. Credential boundary established: all API key access routed through 1Password skill (S5'); no plugin-local key stores

---

## Chronos (S3-3') — FR Layer Assignment Analysis

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-001 | Chronos Runtime Contract and Integration Boundary | S3/S3' | none | Contracts with Khora hooks, Hen coordination, memory boundaries | Create `extensions/ta-onta/modules/chronos/contract.ts` |
| US-002 | QL-Structured Gateway Cron Metadata Extension | S3/S3' | none | Job schema + metadata availability to execution/observability paths | Extend gateway cron schema with QL coordinates + prime markers |
| US-003 | KAIROS Temporal Context Engine Integration | S3/S3' | none | KAIROS context payload versioning; graceful failure | Create `kairos-provider.ts`; feature-flag rollout |
| US-004 | NOW.md Upcoming Section Temporal Updates | S3/S3' + S4/S4' | none (Khora owns NOW state) | Chronos writes via Khora session-state ownership + lock discipline | Create `now-updater.ts` consuming Khora contracts |
| US-005 | Orphaned Session Detection and Recovery Scheduling | S3/S3' | none | Detection uses Hen coordination queries; cleanup via Hen contract | Create `orphan-detector.ts` (5-min cadence) |
| US-006 | Redis Sync Queue Priority Scheduling | S3/S3' + S4/S4' | none (Khora owns queue) | High/medium/low priority; retry/backoff; Obsidian sync | Create `queue-processor.ts` with priority lanes |
| US-007 | Heartbeat and Temporal Health Coordination | S3/S3' | none | Heartbeat for scheduling; orphan metrics + queue lag | Create `health-coordinator.ts` |
| US-008 | Daily/Weekly/Monthly Temporal Rollup Scheduling | S3/S3' | none | Rollup versioning; memory compaction boundary coordination | Create `rollup-scheduler.ts`; `pos_m_mobius_return` relationships |
| US-009 | Prime Coordinate Temporal Routing | S3/S3' | none | Prime-aware job tagging; routing filters | S0' `coordinate_validator` integration; prime variant tests |
| US-010 | Cross-Plugin Runtime Verification | S4/S4' | `conformance/e2e-01-08.test.ts` | Chronos verified with Khora, Hen, Anima | Mobius return + 6 AM bootstrap e2e verification |
| US-011 | SEED.md Generation Coordination | S3/S3' + S3-5' | none | Triggers Aletheia Möbius return; waits for P5 extraction → crystallization | Create shared `janus-envelope.ts`; retry with exponential backoff |
| US-012 | Daily Note Archival and 6 AM Bootstrap | S3/S3' + S4/S4' | none | 6 AM: Archive previous day → Read SEED → Create NOW; coordinates with Khora | Create `six-am-bootstrap.ts`; archive path service |
| US-013 | Notion Calendar Mediation | S5/S5' | none | Read-before-schedule conflict detection; optional write-back | Create `notion-calendar.ts`; conflict policy enforcement |
| US-014 | Chronos Lifecycle Hook Wiring (A1) | S3/S3' + S4/S4' | none (Khora owns hooks) | Registers `session_start`/`before_agent_start`/`session_end` additively, without replacing Khora | Create `lifecycle-hooks.ts`; additive via S3/Harness |
| US-015 | Daily Note Parent-Now Context Inheritance (A1) | S3/S3' + S4/S4' | none | Temporal context envelope additive into agent-start | Create `temporal-envelope-builder.ts` |
| US-016 | Lane-Concurrency Policy Projection (A1) | S3/S3' | none | Policy defaults for cron lane isolation; contention diagnostics | Create `lane-policy.ts` |
| US-017 | Temporal Notification Bridge (A1) | S3/S3' + S5/S5' | none | Notification payloads to `system.notify`; rate-limiting | Create `temporal-notifications.ts`; rate limiter |
| US-018 | Temporal Storage and Archive Integration Contract (A1) | S3/S3' + S2'/S2 | none | pos_m_* relation payloads; SQL transcript ownership preserved | Create `temporal-relations.ts`; archive integration |
| US-019 | Link-Health and Autotag Temporal Hooks (A1) | S3/S3' + S1'/S1 | none | Hook outputs for daily rollover link-health; canonical temporal tags | Create `link-health-hooks.ts` |
| US-020 | Notion Mediation Mode Tightening (A1) | S5/S5' | none | Default `notion_wins`; write-back restricted to Chronos-owned events | Integrated into US-013 `notion-calendar.ts` |
| US-021 | KAIROS Python Provider Adapter (A1) | S3/S3' + PI/S | none | Python-backed KAIROS; adapter contract with fallback; `kerykeion` package via Janus | Create `kairos-python-adapter.ts` |
| US-022 | Temporal Identity Capsule (A2) | S3/S3' + S4/S4' | none | `identity_core` from IDENTITY.md (default); `identity_deep` from #4.4.4.4 (gated) | Create `identity-capsule.ts`; sensitive-gating guard |
| US-023 | Context Packaging via Hen/REPL Retrieval (A3) | S3/S3' + S3-1' | none | Compact mode: P0 + P5/P5.1 slices from Hen retrieval; no local document parsers | Integrated into US-015 `temporal-envelope-builder.ts` |
| US-024 | Cache Assumptions via Khora Redis Path (A3) | S4/S4' | none | Redis-backed canonical; in-memory fallback with explicit semantics | Create `cache-backend-detection.ts` |
| US-025 | Temporal Authority Over Nested NOW Windows (A4) | S3/S3' + S4/S4' | none | NOW states: active/checkpoint_due/closure_due/reseed_due | Create `now-window-fsm.ts` |
| US-026 | Task Execution Window Contract (A4) | S3/S3' | none | task_id, window times, state, lineage, coordinate_scope | Create `task-window-emitter.ts` |
| FR-1 | Extend OpenClaw Gateway cron (no replacement) | S4/S4' + S3/S3' | Gateway native cron (S0-3') | Additive extension only | QL metadata schema extension in cron job definitions |
| FR-3 | KAIROS enrichment additive, not hard dependency | S3/S3' | S3/Harness hooks | Graceful failure; feature-flagged rollout | Failure handling + feature flag integration |
| FR-9 | Preserve SQL transcript ownership; no Neo4j duplication | S3/S3' + S2/S2' | SQL transcript (OpenClaw); Neo4j coordination (Hen) | Chronos emits temporal relations only | Temporal relations module |
| FR-14 | Implement 6 AM and 11 PM daily cycle jobs | S3/S3' | none | 6 AM: Archive → SEED → NOW; 11 PM: Möbius trigger | Daily cycle job handlers |
| FR-15 | Coordinate SEED.md generation with Aletheia | S3/S3' + S3-5' | none | Triggers P5 extraction → crystallization → SEED.md | Aletheia invocation (US-011 using Janus envelope) |

**Note on kyrekeion**: Chronos spawns a session AS Janus for temporal boundary execution. Kairos tools from the `kyrekeion` package (backed by `pyswisseph`) are invoked within that session. Full kyrekeion Kairos data flow spec in v3 Chronos PRD. No inter-system contract needed — Janus is the named function for this role.

### Push-Down Candidates

| Requirement | Should Be At | Rationale |
|-------------|-------------|-----------|
| KAIROS temporal context generation (US-003, US-021) | PI/S (S0/Terminal via kyrekeion) | KAIROS provider primitive is deep infrastructure; Chronos consumes as service |
| QL coordinate validation (US-002, US-009) | S0' QL Types | Coordinate grammar is foundational to all layers |
| Native cron/scheduler (S0-3') | Remains in S0' Terminal | Chronos EXTENDS gateway cron; does not own scheduler core |
| Redis cache tiers + Neo4j schema semantics | S2'/S2 and Hen (S3-1') | Cache management and relation law are cross-module; Chronos only emits temporal relations |

### Initialization Sequence

1. S3' ta-onta loader → Khora bootstraps → Hen initializes → Pleroma registers → Chronos activates
2. Chronos lifecycle hook registration: `session_start` (temporal envelope), `before_agent_start` (identity capsule), `session_end` (NOW closure state)
3. Cron scheduler bootstrap: jobs registered via S0-3' native cron; QL metadata attached; 6 AM + 11 PM + orphan detection + queue processing armed
4. Janus subagent prepared: kyrekeion tools available; KAIROS provider adapter ready; fallback path in place
5. Daily cycle continuity thread: Chronos checks Day/NOW lineage via Hen; previous session closure read; upcoming section written via Khora
6. Möbius coupling activated: 11 PM → Aletheia Möbius trigger (via Janus envelope) → SEED.md generation; 6 AM → archive + SEED read + fresh NOW creation

---

## Anima (S3-4') — FR Layer Assignment Analysis

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-001 | CPF State Machine: (00/00) dialogical vs (4.0/1-4.4/5) mechanistic | S3/S3' + S4/S4' | Redis `cpf:current`, Neo4j `(a:Anima {cpf})` | Chronos temporal window binding (11 PM/6 AM cycle) | Implement prime (') Day/Night tracking; integrate Chronos time gates |
| US-002 | S4-X' Context Frame System: 6 types (CPF/CT/CP/CF/CFP/CS) | S3/S3' + S4/S4' | Parser/compiler required (none exists) | Hen template registry (CT0'-CT5') | Build S4-X' parser, compiler, serialization layer |
| US-003 | 6-Agent Configuration via `agent-defaults.yaml` | S4/S4' | `~/.epi-claw/agent-defaults.yaml` (to create) | PI/S agent runtime (OpenClaw `sessions_spawn`) | Create config with per-agent skill allowlists |
| US-004 | Agent Modulation: any agent → any other via `sessions_spawn` | S3/S3' + S4/S4' | `buildSubagentSystemPrompt()`, modulation depth tracking | PI/S `sessions_spawn` | Modulation policy, depth tracking, `pos_l_modulated_to` |
| US-005 | Ralph Loop Integration: spawn Ralph in mechanistic mode | S3/S3' | Ralph CLI (`--headless --max-iterations`) | S4/S4' epi-claw gateway spawn/announce protocol | Build PRD generator, Ralph spawn wrapper, result synthesis |
| US-006 | Ouroboros Protocol: dialogical mode consultation | S3/S3' | `~/.epi-claw/soul.yaml`, understanding registry | S4/S4' session/context infrastructure | Consultation flow, soul updater, surgery history, SOUL.md coordinate statement |
| US-007 | Multi-Agent NOW.md + now.canvas Coordination (4-tier) | S3/S3' + S4/S4' | Redis/Neo4j/worktree/Obsidian (partial) | Hen Obsidian sync queue; Chronos orphaned cleanup | Parent/child NOW hierarchy; now.canvas; handoff protocol state machine |
| US-008 | S4-X' Nested Frame Coordination: CFP thread types | S3/S3' | None; requires S4-X' compiler | Cross-agent coordination via Neo4j | CFP orchestrator, thread-type executor, parallel/sequential dispatch |
| US-009 | Inter-Agent Communication: 6 patterns | S3/S3' | Communication events require Neo4j `pos_s_communicated` | PI/S announcement protocol; Hen Neo4j relay | Communication pattern dispatcher, provenance logging |
| US-010 | Möbius Return: CS5, P5 synthesis, 11 PM trigger | S3/S3' + S4/S4' | Synthesis extractor (partial) | Chronos 11 PM/6 AM cycle; Aletheia SEED.md generation | Integrate Chronos time gate; Aletheia learning handoff; Neo4j tracking |
| US-011 | Cross-Plugin Runtime Verification | S4/S4' | Integration test suite (partial) | All S3-X' plugins + PI/S agent runtime | 6-agent parallel spawn test; cross-plugin conformance |
| US-012 | Multi-Agent Session Continuation: CONTINUATION.md flush | S3/S3' + S4/S4' | Token limit warning (80%) handler required | PI/S session lifecycle; OpenClaw compaction event | CONTINUATION.md flush; post-compaction resumption from breadcrumbs |
| US-013 | Neo4j Agent Lineage: pos_x_{semantics} relationships | S4/S4' | Neo4j schema (requires definition) | Hen Neo4j coordination | Define pos_x_{semantics} schema; implement relationship builders |
| US-014 | TaskNotes Adapter: Obsidian task frontmatter → S4-X' | S3/S3' | Adapter contract (none exists) | Khora task ownership; Bases task records | Build TaskNotes parser, frontmatter mapper, S4-X' coordinate injector |
| US-015 | Identity Capsule Routing: core default, deep gated | S3/S3' + S4/S4' | Chronos identity capsule (source of truth) | Chronos capsule generation; subagent bootstrap policy | Implement capsule router; deep-access event tracking |
| US-021 | Canonical QL Context Crystal: versioned bundle | S3/S3' + PI/S | Bundle manifest (requires assembly) | Source files: Bimba Seeds, coordinate-semantics.md, Old Data | Assemble QL source bundle; define Crystal schema; compile source→prompt |
| US-022 | QL-First Prompt Contract: structured sections | S3/S3' | Contract generator (requires implementation) | QL Context Crystal (US-021) provides inputs | Build prompt contract template; compile parent/subagent variants |
| US-023 | QL-Ordered Agent Capability Allocation Matrix | S3/S3' + S4/S4' | Matrix (requires definition) | Routing policy input; skill assignation registry | Define canonical matrix; compile to policy artifacts |
| US-025 | Canonical Skill Assignation Registry | S3/S3' | Registry schema (requires implementation) | Skill invocation in PI/S; Pleroma skill centralization | Build registry schema; enforcement middleware; audit logging |
| US-026 | Sophia Project-Knowledge Orchestration | S3/S3' + PI/S | Sophia skill scoping (requires configuration) | Khora knowledge surfaces; external retrieval services | Configure Sophia skill allowlist; fallback; provenance-preserving output |

_(Full FR table: 50 base + 26 addendum USs mapped; see agent output for complete list)_

**Key architectural notes on Anima:**
- Aletheia (S3-5') is the **integration apex** — a functional layer *within* the Anima system (VAK spec verbatim). When Anima routes to "use aletheia", it dispatches via CF code to the appropriate Aletheia function cluster (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven). Not a "mode" in a runtime-switch sense — Aletheia is structurally present as S3-5'.
- The 12-agent PI-native roster (Anima 6: Nous/Logos/Eros/Mythos/Psyche/Sophia + Aletheia 6: Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) is defined in S4' VAK System; mechanics (registration, routing) live in PI/S; persona semantics live in S4'/VAK
- S4-X' invocation language (CPF/CT/CP/CF/CFP/CS) is Anima's native coordinate syntax for task delegation — requires a parser/compiler (none yet exists)

### Push-Down Candidates

| Requirement | Current Home | Should Be At | Rationale |
|-------------|-------------|-------------|-----------|
| Agent registration & spawning | S3/S3' | PI/S (OpenClaw) | Anima orchestrates behavior; `sessions_spawn` is a PI/S primitive |
| Skill invocation policy enforcement | S3/S3' (soft) | S4/S4' (policy) + PI/S (executor) | Policy is operational governance; invocation execution is PI/S |
| Neo4j relationship builders | S3/S3' proposed | S4/S4' shared (Hen owns) | `pos_x_{semantics}` is cross-system; Hen builds, Anima consumes |
| CPF mode state storage | S3/S3' | S4/S4' (Chronos manages temporal state) | CPF is session state; Chronos manages; Anima reads |
| Context compaction hooks | S3/S3' (soft) | PI/S session lifecycle | OpenClaw exposes hook; Anima subscribes, not owns |
| CFP thread types + CS traversal topology | S3/S3' (soft) | PI agent harness (S3/Harness) — baked into agent-team/agent-chain primitives | CFP types (P/C/F/L-Thread) are S4-4' coordinate values that govern agent orchestration topology; torus/lemniscate/klein describe CS (Context Sequence) traversal shapes at S4-5'. Both are in PI harness planning docs, not Anima's concern to own. |

### Initialization Sequence

1. **Bootstrap context from Chronos + Khora**: Chronos provides `kairos_now` and initial CPF `(00/00)`; Khora loads SEED.md + NOW.md parent
2. **Agent configuration**: Anima reads `agent-defaults.yaml`; 6 agent definitions loaded with per-agent skill allowlists; agent capability matrix compiled to routing policy
3. **QL Context Crystal compilation**: Anima assembles canonical QL source bundle; compiles Crystal with Day/Night' dual prompt sections; generates per-agent prompt overlays
4. **S4-X' invocation language activation**: S4-X' parser/compiler initialized; CPF/CT/CP/CF/CFP/CS frame definitions loaded; CT templates sourced from Hen registry
5. **Neo4j coordination infrastructure**: pos_x_{semantics} relationship factories established (Hen as builder owner); NOW lineage parent node registered as CT4b master
6. **12-agent PI-native roster activation**: Anima spawns 6 constitutional agents (Nous/Logos/Eros/Mythos/Psyche/Sophia) via `sessions_spawn` with scoped identity capsules, skill allowlists, S4-X' state, and child sub-NOW creation; Aletheia function clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are CF routing destinations — always structurally present as S3-5' functional layer; activated via CF dispatch routing, not a separate wakeup

---

## Aletheia (S3-5') — FR Layer Assignment Analysis

### Functional Requirements Table

| US/FR ID | Summary | Runtime Home | Existing Method/File | Cross-Layer Integration | Modification Needed |
|----------|---------|--------------|---------------------|------------------------|---------------------|
| US-001 | Extract Session Learnings to /Thought/ | S3/S3' | Khora + Aletheia extraction hooks | Khora `session:stop` → Aletheia extractor → writes /Thought/ | Implement LearningExtractor; wire to Khora hook |
| US-002 | QL Position Categorization Accuracy (>80%) | S3/S3' | Aletheia LLM classifier (Gemini Tier 1) | Hen S3-1' optional vector similarity for dedup | Implement classifier with pattern indicators per P0-P5 |
| US-003 | Duplicate Learning Detection | S3/S3' + S4/S4' | Hen GraphRAG + vector similarity | Hen `searchVector()`; creates `pos_t_duplicates` relationship | Wire Hen integration; threshold logic (≥0.9) |
| US-004 | Eros Verification Mode Selection | S3/S3' | Aletheia CLI `/verify-eros` | Pleroma Moirai CF2 cluster invocation | Implement mode selector; persist last selection per session |
| US-005 | Assert Mode Verification (4-Check via Klotho) | S3/S3' | Aletheia Eros Assert | Klotho from Moirai CF2 cluster (S4'); <2s | 4-check: semantic coherence, factual basis, relevance, coordinate alignment |
| US-006 | Query Mode Verification (GraphRAG via Lachesis) | S3/S3' + S4/S4' | Hen GraphRAG + Aletheia Query | Lachesis from Moirai CF2; Hen provides GraphRAG; <10s | Wire Hen GraphRAG; implement Lachesis mode |
| US-007 | Reflect Mode Synthesis (Atropos) | S3/S3' | Aletheia Eros Reflect | Assert first; Query if confidence <0.8; Atropos synthesizes | Reflect orchestration using Moirai CF2 cluster |
| US-008 | Crystallize to /Bimba/Forms/ | S3/S3' + S4/S4' | Aletheia Crystallizer class | ULID-based coordinate generation; bimba_state encoding (6-bit QL) | Implement Crystallizer; deterministic coordinate generation |
| US-009 | Create Neo4j POS{N} Relationships | S3/S3' + S4/S4' | Hen Neo4j integration | Aletheia calls `taonta.hen.create_relation` with `pos_x_{semantics}` | Implement relationship creation via Hen |
| US-010 | Update /Thought/ Status to Crystallized | S3/S3' | Aletheia + S1' Obsidian ops | S1' QL Obsidian updates frontmatter; backlink added via Hen | Update /Thought/ frontmatter; add backlink to /Bimba/Forms/ |
| US-011 | Read Daily Note #5 Section | S3/S3' + S4/S4' | Khora NOW reading + Aletheia parser | Khora provides daily note path + content | Wire Khora integration; implement Position #5 parser |
| US-012 | Extract + Verify + Crystallize Pipeline | S3/S3' | Aletheia ExtractVerifyCrystallizePipeline | Orchestrates US-001 → US-007 → US-008; all via `pos_x_{semantics}` | Implement pipeline orchestrator; enforce relationship format |
| US-013 | Create SEED.md for Next Day | S3/S3' + S4/S4' | Aletheia + Khora + Chronos | Aletheia generates SEED; Khora/Chronos coordinate daily boundary | Implement SEED.md generation with unresolved questions + blockers |
| US-014 | Update Bimba Seeds with Backlinks | S3/S3' | Aletheia + S1' Obsidian | Scans `/Idea/Bimba/Seeds/` via S1' QL Obsidian; adds backlinks via Hen | Implement seed-scanning + backlink addition |
| US-015 | Prepare Tomorrow's Ground Context | S3/S3' + S4/S4' | Aletheia + Khora + Chronos | Aletheia generates NOW.md for P0 ground; Khora writes via path service | Implement NOW.md generation; populate with SEED content |
| US-016 | Constitutional Stage Extraction | S3/S3' | Aletheia Sanskrit stage mapper | Maps SENT/SPARSHA/RUPA/RASA/SCENT to QL P0-P5 | Implement stage-to-position mapping |
| US-017 | bkmr Suggestion Bridge (Read-Only) | S3/S3' + S4/S4' | Aletheia + kbase skill | Aletheia queries kbase via `epi kbase suggest`; injects to NOW.md non-canonical | Modify kbase skill; implement bridge injection |
| US-018 | Pedagogical Mode — Socratic | S3/S3' | Aletheia Socratic augment to `capture-thought` | Q0, Q2 tags; output to /Thought/Questions/ | Implement Socratic agent logic |
| US-019 | Pedagogical Mode — Cartographic | S3/S3' | Aletheia Cartographic augment to `extract-thoughts` | P3, P4 tags; output to /Thought/Patterns/ | Implement Cartographic agent logic |
| US-020 | Pedagogical Mode — Synthetic | S3/S3' | Aletheia Synthetic augment to `mobius-return` | P5 tags; triggers Möbius return | Implement Synthetic agent logic |
| US-021 | LLM Tier Optimization | S3/S3' | Aletheia tiered LLM strategy | Tier 1 (FREE): Gemini extraction; Tier 2 (CHEAP): GLM Eros; Tier 3 (FULL): Claude Möbius | **PUSH DOWN** — see Push-Down Candidates |
| US-022 | Cross-Plugin Integration Verification | S3/S3' + S4/S4' | Aletheia + all ta-onta modules | Verified with Khora, Hen, Anima, Chronos, Pleroma | Run integration tests across all plugin boundaries |
| US-023 | kbase Suggestion Bridge Command | S4/S4' | kbase skill (NEW) | NEW: `epi kbase suggest` with flags | Modify kbase skill |
| US-024 | Session→Artifact→Insight Tracking | S3/S3' + S4/S4' | Aletheia + Hen Neo4j | `(Session)-[:pos_t_extracted_from]->(Thought)-[:pos_t_crystallized_to]->(BimbaForm)` | Implement lineage with provenance metadata |
| US-025 | TX Coordinate Type Support (C/P/M/S/T/L + CPF/CT/CF/CS) | S3/S3' + S4/S4' | S0' QL Types + Aletheia metadata | Enforce canonical coordinate syntax in all metadata | Coordinate syntax in all Aletheia outputs |
| US-026 | Curated Notion Publishing | S3/S3' + S5/S5' | Aletheia + S5' Automations | Publishes crystallized forms to Notion; Notion = non-canonical visibility | Implement Notion publish path; opt-in per crystallization |
| FR-3 | Eros verification with 3 Moirai modes (CF2 cluster) | S3/S3' + S4/S4' | Aletheia + Pleroma Moirai | Moirai CF2 cluster (Klotho/Lachesis/Atropos) — invoked as unit | Wire Pleroma Moirai invocation |
| FR-5 | Möbius return (P5→P0) daily or on-completion | S3/S3' + S4/S4' | Aletheia MobiusEngine + Chronos | Chronos 11 PM or task-completion trigger; Aletheia executes | Implement Möbius orchestration |
| FR-11 | Redis warm cache for /Thought/ files | **Push-Down** | S2' QL Graph | TTL 1 hour; read-through cache | **Move to S2' QL Graph** — see Push-Down Candidates |
| FR-12 | P'/T' coordinate locks during Neo4j updates | **Push-Down** | S2' QL Graph | Acquire locks before write; release after | **Move to S2' QL Graph** |
| FR-22 | Attach NOW lineage closure metadata | S3/S3' + S4/S4' | Aletheia + Anima CGO | Outputs record NOW lineage closure for Anima re-entry | **Contract definition should be at S4/S4'** |
| FR-23 | Emit TaskNotes closure envelopes | S3/S3' + S4/S4' | Aletheia + Anima/Chronos | Emit task closure payloads compatible with TaskNotes update flow | **Schema definition should be at S4/S4'** deep contracts |
| FR-24 | Sophia handoff intake contract | S3/S3' + S4/S4' | Aletheia + Anima Sophia | Consume Sophia knowledge envelopes; preserve provenance; feed verification | Implement intake path with provenance tracking |

**CRITICAL — Aletheia Identity**: Aletheia (S3-5') is the **integration apex of the S3 module stack** — "a functional layer *within* the Anima system — not a separate plugin building its own tool stack" (VAK spec, verbatim). It synthesises and reflects on the operation of all other S3 modules. Its 6 function clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are CF code routing designations, not separate systems. Each CF code routes to a PI-native agent: CF0=Anansi (Nous/orientation), CF1=Janus (Logos/temporal), CF2=Moirai (Eros/triad: Klotho/Lachesis/Atropos), CF3=Mercurius (Mythos/kairos), CF4=Agora (Psyche/learning), CF5=Zeithoven (Sophia/synthesis). CF code `(0/1/2)` = Moirai's internal complexity (3 positionally-assigned roles). Invoking Aletheia = routing through the appropriate CF cluster via CF dispatch — not a separate wakeup protocol.

### Push-Down Candidates

1. **LLM tier optimization (US-021)** — **not a gateway policy push-down**. Tiers are a per-invocation operational pattern (rule set: `.claude/rules/llm-invocation.md`): FREE (gemini-cli, bulk extraction), CHEAP (glm, moderate reasoning), FULL (claude, synthesis/Möbius). Aletheia already correctly applies this: Gemini-free for lightweight QL/S-gate checks; GLM/Claude for Möbius/crystallization. The rule is applied per-task by each agent — no shared S4 service needed. Mark US-021 as a **pattern adoption task**, not a push-down.
2. **Redis warm cache for /Thought/ (FR-11)** → S2' QL Graph: Cache tier model (World > Seeds > Present > Thought with TTL hierarchy) is GraphRAG substrate concern. Aletheia consumes S2' cache interfaces.
3. **Coordinate locks during Neo4j updates (FR-12)** → S2' QL Graph: Lock semantics for P'/T' coordinates during graph writes is a GraphRAG safety concern. Aletheia invokes S2' lock primitives.
4. **NOW lineage closure contract definition (FR-22)** → S4/S4' (Anima integration contract): NOW lineage closure is an Anima orchestration contract; Aletheia outputs metadata, Anima consumes.
5. **TaskNotes closure envelope schema (FR-23)** → S4/S4' deep contracts: Closure envelopes are runtime observability contracts; Aletheia consumes, not defines.

### Initialization Sequence

1. S3' ta-onta loader: Aletheia instantiated; S0'/S1'/S2'/S4' layers injected; service dependencies resolved (Khora/Hen/Pleroma/Chronos)
2. Tool registration: `taonta.aletheia.*` tools registered; Khora `session:stop` hook listener registered; Chronos 11 PM + 6 AM cron triggers registered
3. Moirai CF cluster registration via S4' VAK: 6 CF codes mapped to PI-native agents; Moirai CF2 cluster (Klotho/Lachesis/Atropos) internal positional routing established; S4/Gateway instantiates PI-native agents
4. Session-start context binding: Anima routes "use aletheia" → CF code dispatch → Aletheia reads session context via Khora; session-scoped Redis cache registered
5. Workflow execution: on `session:stop` → extraction; on `/verify-eros` → Moirai CF2 cluster verification; on crystallization → /Bimba/Forms/ creation via Hen; on 11 PM Chronos trigger → full Möbius return pipeline
6. Cross-session continuity: Chronos 6 AM reads yesterday's SEED.md (created by Möbius); Khora loads SEED into new NOW.md P0 ground; Aletheia availability signaled in NOW.md frontmatter

---

## Non-Functional Requirements (Cross-System)

The following NFRs emerged consistently across all module analyses:

| NFR | Scope | Specification |
|-----|-------|---------------|
| **Feature flags for all capabilities** | All modules | Each module gates capabilities behind feature flags; enables staged rollout and reversibility without data loss |
| **Fail-fast error policy** | All modules | Fail explicitly; no silent degradation. Log and surface errors; do not mask them |
| **Additive hooks only** | All modules | No module replaces another module's lifecycle hooks; all registrations are additive consumers |
| **Transcript ownership** | S4/S4' native | OpenClaw SQL session store owns transcripts; Neo4j is graph/coordination authority; no duplication |
| **Notion = non-canonical** | Hen, Chronos, Aletheia, Anima | Notion is a visibility layer only. No reverse-sync from Notion to canonical vault |
| **Plugin delivery form** | All modules | Each module delivered as explicit OpenClaw plugin extension with `openclaw.plugin.json`, registration/wiring seam, and contracts |
| **Canonical coordinate key format** | All Neo4j writes + frontmatter | ALL coordinate property keys use `{coord}_{n}_{semantic}` format (e.g., `c_4_template_id`, `p_0_grounds`, `t_1_extracted_from`). The `pos{x}_{semantic}` intermediate form and `pos_x_{semantics}` form are both deprecated. Authority: ta-onta `PLAN.md`; enforced by Hen normalization law. |
| **QL coordinate types** | All metadata | All frontmatter, session metadata, and tooling uses canonical coordinate types (C/P/M/S/T/L) with prime (') notation |
| **Telemetry exposure** | All modules | Each module emits structured telemetry (hook_id, event_type, module, phase, timing, status, error, lineage) |
| **Parashakti Redis as canonical** | Khora, Hen, Chronos | Existing Parashakti/GraphRAG Redis infrastructure is preferred; in-memory cache is fallback-only |
