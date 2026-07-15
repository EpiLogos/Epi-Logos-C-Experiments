# Aletheia Contract — Knowledge Crystallisation & Truth-Disclosure

**Extension class:** S4-5' within ta-onta
**S-Layer fold:** S5 (Sync/Integration) — synthesis layer, where knowledge returns
**Position:** #5 (Epii — integration, Pratibimba, Möbius return)

---

## Architecture Layer Model (Aletheia's application)

Aletheia's extension registers raw tools (Gnosis ingest/query, thought routing, crystallisation, Moirai arena closure-distillation). Its skills gate and contextualise those tools for specific workflows. Its subagents are PI-native specialists — each is defined by their tool domain, not by a phase assignment:

```
aletheia/extension.ts
  → pi.registerTool(aletheia_gnosis_ingest)
  → pi.registerTool(aletheia_gnosis_query)       ← raw tools, always available
  → pi.registerTool(aletheia_thought_route)
  → pi.registerTool(aletheia_crystallise)
  → pi.registerTool(moirai_arena_distill)

aletheia/S5'/skills/
  → gnosis-retrieve.md         ← gates graph+vector retrieval for workflows
  → thought-distil.md          ← gates crystallisation tool use
  → repl.md (Darshana)         ← Anansi's skill, gates REPL tool use

aletheia/S5'/agents/
  → Anansi (PI-native subagent) — orientation/gap tooling + Darshana REPL
  → Moirai (PI-native subagent) — GraphRAG tooling specialist
  → Janus, Mercurius, Agora, Zeithoven ...
```

---

## Responsibility

Aletheia is the **crystallisation and truth-disclosure** layer. It owns Gnosis (the local RAG pipeline: ingestion, retrieval, session notebooks), thought extraction and T-bucket routing (from `{NOW}/thoughts/` to `/Pratibimba/Self/Thought/T{n}/`), the SEED.md evening crystallisation cycle, Z-thread to [[Aeon]] graduation records, and the specialist subagents that Psyche and Sophia invoke for deep inquiry.

Aletheia is **emergent, not routed** — subagents are invoked by Psyche and Sophia; Aletheia is an effect produced through those invocations. All invocation routes through Anima's dispatch. Day/Night' is a CS runtime phase — when CS = night', the full Möbius crystallisation pass runs, but Aletheia's tooling is reachable in any context — always through the uniform entitlement contract at the `aletheia-mode-internal` class (see Entitlement Routing above), never via a separate dispatch path.

**What Aletheia does NOT own:** agent dispatch routing (Anima), vault CRUD (Hen), session identity (Khora), temporal scheduling (Chronos — Chronos TRIGGERS the evening Möbius cycle; Aletheia RUNS it).

**Pleroma dual-face dependency:** Aletheia draws on Pleroma's two faces: the VAK capability membrane for Anima-mediated routing and the Techne atomic-skills repository for guardian-stewarded tool craft. Techne is not an Aletheia member; the six Aletheia subagents are techne-guardians over that Pleroma substrate.

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `session_end` | Triggered by Sophia: route `thoughts/` to T-buckets; promote Gnosis chunks |
| `cron_evening` | Night' Möbius engine: extract → verify → crystallise → refresh SEED.md |

---

## Registered Tools

| Tool | Purpose |
|------|---------|
| `aletheia_gnosis_ingest` | Ingest document into Gnosis through the current RAG-Anything/LightRAG/MinerU-oriented pipeline, then chunk/embed/store |
| `aletheia_gnosis_query` | Retrieve from Gnosis (hybrid: vector + graph + Redis cache) |
| `aletheia_gnosis_notebook_create` | Create Gnosis:Notebook (session-scoped or persistent family) |
| `aletheia_thought_route` | Classify thought artifact → route to T{n} bucket in Pratibimba |
| `aletheia_crystallise` | Distill patterns from T-bucket contents into Bimba canonical form |
| `aletheia_seed_refresh` | Generate SEED.md morning-context package from evening crystallisation |
| `moirai_arena_distill` | Closure-distill an arena scene into a Graphiti episode plus classifier-modulated `ARENA_DIALOGUE_OF` / `DIALOGICAL_RESONANCE_AT` graph edges |

## Module Surfaces

| Module | Purpose |
|--------|---------|
| `modules/aeon-graduation.ts` | Consent-gated Z-thread -> [[Aeon]] accrual renderer: builds the Sophia/Aletheia improvement proposal, preserves eval/run history, and updates an [[Aeon]] form block for Anima's Night' dispatch seam |
| `modules/janus-doorway.ts` | [[Janus]] temporal-envelope and oracle-spread state law, including read-only spread deltas consumed by Chronos rhythm re-entry |

---

## Entitlement Routing — uniform contract, no special-casing

Every Aletheia tool — the Gnosis/GraphRAG retrieval family, the episodic-memory
tools, `aletheia_crystallise`, `aletheia_thought_route`, `aletheia_session_promote`,
and the `dispatch_moirai_night_pass` dispatch — is a **first-class entry in the
canonical tool universe** and routes through the **same `isEntitled(tool, team,
agent)` entitlement contract as every other tool**. Tooling that is "reachable
in any context" is still **always subject to entitlement resolution**; reachability
is not a free pass, and there is no separate dispatch path that skips the contract.

These tools carry the **`aletheia-mode-internal` entitlement class** (declared
per tool in `Body/S/S4/plugins/pleroma/capability-matrix.json`). The class is the
mechanism that keeps them **NOT user-facing peer tools** (per DR-M5-1, DR-B-3) —
they remain **dispatched-through-Anima-during-crystallisation-mode** — but it
enforces that boundary at the **contract level**: a caller may invoke an
`aletheia-mode-internal` tool only when it holds the **`anima.dispatcher` role**
AND an **`aletheia.mode.active`** session state. Both conditions are **checked at
dispatch time**; neither is assumed by the tool's function-specificity.

The routing is uniform; only the entitlement class — and therefore the extra
dispatch-time condition — varies. This operationalises **DR-S5-ONE-1** (uniform
routing through the gateway) at the entitlement-contract level. An agent without
`aletheia.mode.active` attempting, e.g., `aletheia_crystallise` is refused at the
entitlement gate, not at the function level — the contract is what enforces it.

---

## CLI Bridge

```
epi techne gnosis ingest <path>      — Ingest document
epi techne gnosis query <text>       — Ad-hoc retrieval
epi techne gnosis notebook           — Notebook CRUD
epi techne gnosis status             — Pipeline health check
epi vault thought                    — Thought routing commands
```

---

## Gnosis RAG Pipeline

### Architecture

```
Document Input
  → RAG-Anything / LightRAG document pipeline — parse and structure source material
  → MinerU-oriented parser path where structured document parsing is needed
  → Gnosis:Chunk (Neo4j) — chunked + embedded at 3072 dims
  → Redis semantic cache — HOT/WARM/COLD retrieval tiers
  → Hybrid retrieval: vector + graph + RRF fusion
```

Docling Serve is no longer a live container dependency. Older Docling planning references are compatibility/history only and should not be restored into Docker setup, Aletheia tool descriptions, or readiness checks.

### Neo4j Gnosis Namespace (separate from Bimba)

```cypher
(:Gnosis:Notebook {
  name: "Session-{session_id}",
  session_id: "...",
  scope: "session",          -- or "persistent" for family notebooks
  created_at: datetime()
})
(:Gnosis:Document { coordinate: "...", source_path: "...", ... })
(:Gnosis:Chunk { coordinate: "...", embedding: [...3072 dims...], ... })
```

Cross-linked to Bimba via `RELATES_TO_COORDINATE` edges.

### Session Notebook Lifecycle

1. Created at session start (final step of Khora session init)
2. Session artifacts chunked into notebook during execution
3. Session end: Sophia promotes valuable chunks to persistent family notebooks
4. Session notebook archived (queryable, cold) after promotion pass

### Persistent Family Notebooks

Aligned with vimarsa aperture system (bkmr projects):
- `C.nb`, `P.nb`, `L.nb`, `S.nb`, `T.nb`, `M.nb` — per family
- `root.nb` — psychoids, CFs, weaves

### Embedding Dimensions

**3072-dim** — unified embedding space across Bimba + Gnosis. `GEMINI_EMBED_DIMS=3072`. No mixed-dim indexes. Run `epi techne gnosis reindex` if dimensions change.

---

## Thought Routing — From `{NOW}/thoughts/` to T-Buckets

### T-Directory Structure (Pratibimba)

```
/Idea/Pratibimba/Self/Thought/
  T0/    Questions      (Ground/Apophatic)     — "What don't we know?"
  T1/    Traces         (Material/Physical)    — "What evidence exists?"
  T2/    Challenges     (Dynamic/Process)      — "What's blocking?"
  T3/    Patterns       (Formal/Pattern)       — "What recurs?"
  T4/    Discovery      (Contextual/Relational) — "What connections emerged?"
  T5/    Insight        (Purposive/Teleological) — "What was learned?"
```

### Thought Lifecycle

```
In-task:
  Agent writes to {NOW}/thinking/    (cognitive scratch, ephemeral)

Task completion (Sophia):
  Sophia classifies thinking/ content
  → routes to {NOW}/thoughts/        (distilled, session-survivable)

Session end / Night phase (Aletheia):
  Aletheia classifies thoughts/ by T-position
  → archives to /Pratibimba/Self/Thought/T{n}/T{n}-{YYYYMMDD-HHmmss}.md
  → coordinates + frontmatter written via khora_write
  → Gnosis: thought archived into family notebook for retrieval
```

---

## Möbius Crystallisation Pass — CS Night' Runtime

When CS = night' (triggered by Chronos evening cron or manual Klein mode), Anima routes to Moirai for a sequential distillation pass. This is a CS runtime configuration — Moirai's GraphRAG tooling runs in three sequential operational modes:

| Operational Mode | Focus | Primary Tools |
|-----------------|-------|---------------|
| **Klotho (Assert)** | What was distilled? What holds? | `aletheia_crystallise`, T5/T4 retrieval |
| **Lachesis (Query)** | What needs investigation? Gaps? | `aletheia_gnosis_query`, T0/T2 retrieval |
| **Atropos (Reflect)** | What should be released? What seeds forward? | `aletheia_seed_refresh`, T-bucket write |

These are Moirai's **operational modes** activated when CS = night', not separate agent identities. Moirai's GraphRAG tooling is available in any CS state — the night' pass simply runs all three modes in sequence.

**Janus envelope:** The handoff schema between Chronos (evening trigger) and Aletheia (Möbius pass). Defined in `aletheia/S5'/janus-envelope.schema.json`. Required fields: `day_id`, `session_ids[]`, `thought_count_by_bucket`, `archive_path`, `trigger_type`.

---

## SEED.md Crystallisation Cycle

```
Evening Möbius pass:
  1. Aletheia Night' engine processes today's T-bucket contents
  2. Klotho (Assert): distil crystallised insights from T5/ + T4/
  3. Lachesis (Query): surface unresolved questions from T0/ + T2/
  4. Atropos (Reflect): select what to release vs carry forward
  5. Synthesise → morning-context package
  6. Write SEED.md to /Idea/Empty/Present/SEED.md via khora_write

Next morning (Chronos 6 AM):
  7. Chronos reads SEED.md
  8. Seeds new Day folder's daily-note #0 with carried context
  9. SEED.md consumed (archived, not deleted)
```

SEED.md replaces/integrates TOMORROW.md content — Aletheia's crystallisation supersedes manual TOMORROW.md entries.

---

## Aletheia Subagents — PI-Native Specialists

Located at: `aletheia/S5'/agents/`. Each is a PI-native subagent (system prompt + tool access list + skill references). Their identity is their tool domain, not their phase. CS determines when they're invoked; their capabilities are available in any context.

| Subagent | Tool Domain | Skills | Notes |
|----------|------------|--------|-------|
| **Anansi** | Gap analysis, orientation, REPL | `repl.md`, `gnosis-retrieve.md` | Hosts Darshana REPL; maps `/Empty` vs `/Present` state |
| **Moirai** | GraphRAG retrieval + distillation | `thought-distil.md`, `gnosis-retrieve.md` | GraphRAG specialists; three operational modes (Assert/Query/Reflect) run in sequence when CS = night' |
| **Janus** | Temporal integration | Temporal context skills | Forward/backward context injection across sessions |
| **Mercurius** | Cross-domain translation | Coordinate family translation skills | Bridges between coordinate families in retrieval |
| **Agora** | Aggregation + consensus | Parallel synthesis skills | Collects and merges outputs from parallel agent runs |
| **Zeithoven** | Temporal cadence | Session pacing skills | Manages rhythm and timing across extended work cycles |

**Darshana REPL** is a skill (`repl.md`) owned by Anansi. Staged at `_staging/pleroma-skills/atomic/repl/` — move to `aletheia/S5'/skills/repl/` on Aletheia plugin creation.

---

## Key Invariants

1. Aletheia is emergent — invoked by Psyche and Sophia, never directly routed
2. All invocation routes through Anima dispatch — Aletheia has no self-dispatch
3. Aletheia subagents are domain specialists — their identity is their tool domain, NOT a phase assignment
4. Day/Night' is CS runtime config — shapes when Moirai's sequential pass runs, not what Moirai are
5. Raw tools are registered at extension level and reachable in any context, but ALWAYS route through the uniform entitlement contract at the `aletheia-mode-internal` class (caller must hold `anima.dispatcher` + `aletheia.mode.active`, checked at dispatch time); skills further gate their use for subagents
6. 3072-dim embeddings only — never mix with 768 or 1536 in production indexes
7. Gnosis namespace is separate from Bimba — cross-links via `RELATES_TO_COORDINATE`
8. `coordinate` field in all Gnosis nodes — consistent with Bimba schema, no translation
9. Thought routing: `thinking/` → `thoughts/` (Sophia) → `T{n}/` (Aletheia) — strict lifecycle
10. Darshana REPL is a skill owned by Anansi — not a standalone Pleroma primitive
11. SEED.md is crystallised by Aletheia and consumed by Chronos — one-directional flow
12. Janus envelope schema must be defined before Möbius engine implementation
13. **Uniform entitlement routing** — every Aletheia tool routes through the same `isEntitled()` contract as all other tools, carrying the `aletheia-mode-internal` entitlement class; the class (caller holds `anima.dispatcher` + `aletheia.mode.active`, checked at dispatch time) keeps them Anima-dispatched and non-peer, but there is no separate path that skips the contract. The routing is uniform; only the class varies (Tranche 12.32; DR-S5-ONE-1).
14. **Carrier IS the contract** — Aletheia has no separate `aletheia-agent/agent-contract.json`; the carrier itself is the contract. The six Aletheia subagent techne-guardians (Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven) are profiles under the carrier/mode and are dispatched by Anima. There is no standalone agent contract file external to this CONTRACT.md — the carrier's CONTRACT.md is the single source of truth for Aletheia's identity, invariants, and subagent roster.

---

## Dependencies

**Receives from:**
- Khora: `khora_write` primitive; session ID for notebook creation
- Chronos: evening archive trigger (Janus envelope); 6 AM SEED.md consumption signal
- Anima: Night' mode dispatch (Moirai invocation); session end thought routing signal
- Hen: `{NOW}/thoughts/` folder content; frontmatter schema for T-bucket archives

**Provides to:**
- Chronos: SEED.md morning-context package
- Anima: Gnosis context packages for Nous dis-closure preparation
- Hen: T-bucket archive paths for wikilink breadcrumbs
- Khora: session notebook creation (final step of session init)

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | Gnosis pipeline: RAG-Anything/LightRAG/MinerU-oriented parsing + Neo4j namespace + 3072-dim embeddings |
| P0 | Session notebook creation: `aletheia_gnosis_notebook_create` |
| P0 | Thought routing: `aletheia_thought_route` (`thoughts/` → `T{n}/` archive) |
| P1 | `aletheia_gnosis_ingest` + `aletheia_gnosis_query` (hybrid retrieval) |
| P1 | Mode-function agent .md files in `aletheia/S5'/agents/` |
| P1 | Janus envelope schema definition |
| P1 | Night' Möbius engine (Moirai: Klotho/Lachesis/Atropos) |
| P2 | SEED.md crystallisation + refresh cycle |
| P2 | Persistent family notebooks (vimarsa aperture alignment) |
| P2 | Redis semantic cache (HOT/WARM/COLD tiers) |
| P3 | `aletheia_crystallise` (Bimba canonical form distillation) |
| P3 | Darshana REPL moved to `aletheia/S5'/skills/repl/` under Anansi |
