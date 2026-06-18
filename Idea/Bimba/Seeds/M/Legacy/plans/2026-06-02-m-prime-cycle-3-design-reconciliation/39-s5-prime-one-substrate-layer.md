# Track 39 — S5' as ONE Substrate Layer (gateway + Khora + S0 tmux + Redis hierarchical + CLI)

**Status:** Phase-I 2026-06-15 — landed per DR-S5-ONE-1; consolidates Tranche 12.2 EXPANDED + CCT-14 EXPANSION + CCT-17 + DR-WORLD-1 + DR-LIB-ATELIER-1 + DR-COMP-1 into a single coordinated substrate plan.

**Why this plan file exists.** Three independent wave-2 architectural integration scouts (vault namespace, VAK compression, 4/5/0 mental pole) identified the unregistered `s5'.gnostic.*` gateway routes as the single biggest unblock across cycle 3. The wave-2 scout 1 went further and revealed that gateway-only registration is half-assed: the gnostic-substrate work only delivers value if **gateway + Khora session + S0 tmux + Redis hierarchical + CLI parity all work as ONE substrate** (temporal + contextual + informational-conditional + logos-definitional). The user direction during Phase-I synthesis was explicit: no half-assed work; plan for the full usecase of the gnostic retriever; S5' query + management + knowledge layer is ONE LAYER. This file holds that comprehensive plan.

**Anti-rebuild commitment.** This is NOT a new substrate to build. Every component named below either already exists in code (production Python package `epi-gnostic`, `Body/S/S3/redis-context`, `Body/S/S0/epi-cli/src/agent/tmux.rs`, `Body/S/S4/ta-onta/S4-0p-khora/`) or has a clearly defined extension point. Track 39 lifts existing pieces into a single coordinated working substrate; ~750 LOC total across 5 modules (gateway routes ~80, CLI ~120, Khora session-workspace ~150, Redis hierarchical ~80, plus glue/tests). Zero greenfield architecture.

**The ONE-substrate invariant (canonical).** Across the cycle 3 release gate:

- No gnostic operation may bypass the gateway.
- No gateway route may exist without a CLI command.
- No CLI command may write outside Khora's session authority.
- No session may exist without tmux-backed persistence when persistent mode is requested.
- No Redis cache may be flat-namespaced for gnostic-substrate keys (hierarchical mandated).

These five rules together comprise the invariant. They are checked at release gate G14 (per [`14-no-orphan-audit-and-release-gates.md`](14-no-orphan-audit-and-release-gates.md)).

## Source authority

- DR-S5-ONE-1 (Phase-I 2026-06-15; PROPOSED — gates cycle-3 release until validated): ONE-substrate canon.
- DR-WORLD-1 (Phase-I 2026-06-15): `/World` as 1st-class `:World` namespace; psychoid root linked to base C-coordinates; mandates `:Gnostic` label promotion alongside `:World`.
- DR-LIB-ATELIER-1 (Phase-I 2026-06-15): Library + Atelier as Theia IDE projections consuming `s5'.gnostic.list_notebooks`.
- DR-VAK-7 (Phase-I 2026-06-15): VAK four-expression layering. The gnostic substrate carries one expression (C' / S4 dispatch); `s0'.anuttara.trace` carries another (alphabet expression). See CCT-17 for the coordinate-tagging-IS-compression discipline.
- DR-COMP-1 (Phase-I 2026-06-15): spine compositor replaces overflow bodies with dereferenceable VAK coordinate references; the `s0'.anuttara.trace` route this plan registers is one dereference surface.
- DR-FLIP-1 (Phase-L 2026-06-16): kernel `#` phase-flip is the global coordinate-dynamic law; `s5'.gnostic.resolve` and `s0'.anuttara.trace` must preserve prime/inversion phase.
- Tranche 12.2 EXPANDED (Track 12): the canonical execution tranche; this plan file is the supporting comprehensive shape.
- CCT-14 EXPANSION (Track 16): PASU lifecycle CLI parity (consumed here).
- CCT-17 (Track 16): VAK coordinate-reference discipline (the `s0'.anuttara.trace` route lands as part of Tranche 12.2 EXPANDED; overflow references dereference through it or `s5'.gnostic.resolve`).
- CCT-20 (Track 16): coordinate phase preservation across kernel/VAK/S2/OWL/S5.
- M5'-on-Anuttara spec (`Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`): names the M5-0 Library as the gnostic-namespace holding; this plan honours that residency.

## Phase-J reframe (2026-06-15): ONE Indras Net surface, not five

The original draft of this plan listed five surfaces (gateway routes, Khora session layer, S0 tmux integration, Redis hierarchical keys, CLI parity) as if they were peer surfaces of the substrate. That was wrong. There is **one GraphRAG surface — the Indras Net S2/S2' layer**. The five sections below are not five surfaces; they are **five touchpoints into the one Indras Net surface**. Each gives a different access pattern (gateway / Khora / tmux / Redis / CLI), but all access the same substrate (Neo4j `:Bimba` + `:World` + `:Gnostic` graph, 3072-dim Gemini embeddings, Graphiti episodic memory, hybrid retrieval).

The substrate's name is **Indras Net** because every node holographically reflects every other node through the coordinate-language addressing (the C'-branch coordinates of every emission point to the same web). The 4/5/0 nara-epii-anuttara agent system at S5 (per Tranche 12.34) operates over this one substrate — Nara-PI reads through it as LLM-context, Epii-PI scores it as EBM-energy, Anuttara-PI verifies its emissions through the full-7-laws typed-query surface.

**The Indras Net substrate is the persisted projection of the three S0 arenas** (per DR-ARENA-1): **Siva** (`.rodata` immutable archetypes #0–#5 / canonical bimba `q_b`) → `:Bimba` nodes; **Shakti** (mutable heap instances + proposals + parametric experts / pratibimba `q_p`) → `:World`/runtime nodes; **Prana** (`Tensor_Arena` / 3072-dim Gemini embeddings) → the vector layer + EBM-head manifold where `E = ‖q_b − q_p‖²` is scored. The 4/5/0 system above is that triad in motion — Nara proposes Shakti `q_p`, Epii scores it against Siva `q_b` in Prana, Anuttara verifies. **The HOT/WARM/COLD Redis tiering (Access pattern 4) is the orthogonal cache-temperature axis layered *over* Prana — NOT the Siva/Shakti/Prana data-tier axis; the two must never be conflated.** The in-process S0 `Tensor_Arena` and this persisted 3072-dim store are both Prana — related as **pratibimba (lived working-set, HOT) to bimba (recorded substrate, COLD)**, a cache-temperature projection, not a duplicate (per DR-ARENA-1 action 3). The EBM reads the hot arena, hydrated on coordinate-resolve Neo4j(COLD)→Redis(WARM) — only the act's neighborhood, per CCT-22(b) "the substrate IS the lookup tool"; new embeddings crystallize back on the Möbius return via CCT-16 `MostRecent`. The arena is **VAK-aware**: each entry is a `(coordinate ↔ embedding ↔ q_{n}_{semantic})` triple (not a bare float), making it the live surface where compress-to-VAK happens — *recall* projects pre-addressed knowledge in (`query_with_layers`), *genesis* imprints novel session-meaning and derives its coordinate from arena position (→ Hen birth-codon, CCT-14b). This resolves the embedding↔coordinate-language gap canon left open by locating the unification in the lived act, not the static store. **Canonical authority: [[M'-PRANA-ARENA-SPEC]] (DR-PRANA-1).** The role is structural; only residual cache mechanics (projection granularity / write-back cadence → Class B; capacity / eviction → Class C) route to Track 38 §2.4 — not deferred to execution.

The five access patterns below are read as "the Indras Net substrate exposed via X" — not "surface X of the substrate":

## Five access patterns of the ONE Indras Net substrate

### Access pattern 1 — Gateway routes (10 minimum methods)

**Anchor:** `Body/S/S3/gateway-contract/src/lib.rs` (register); `Body/S/S3/gateway/src/` (dispatch).

| Method | Returns | Backing |
|---|---|---|
| `s5'.gnostic.query(coordinate, depth)` | `[GnosticChunk]` | `epi-gnostic/epi_gnostic/wrapper.py::query` |
| `s5'.gnostic.ingest(path, namespace)` | `IngestionReceipt` | `epi-gnostic/epi_gnostic/cli.py::ingest` |
| `s5'.gnostic.notebook(coordinate)` | `NotebookSession` | `epi-gnostic/epi_gnostic/graphiti_service.py::notebook` |
| `s5'.gnostic.status()` | `GnosticNamespaceStatus` | `epi-gnostic/epi_gnostic/cli.py::status` |
| `s5'.gnostic.candidates(filter)` | `[EntityCandidate]` | Hen-side via CCT-14 entity-candidate lifecycle |
| `s5'.gnostic.etymology(coord)` | `EtymologyCluster` | Atelier scent-following lens; sub-namespace per DR-WORLD-1 |
| `s5'.gnostic.resolve(coord)` | `GnosticEntityHandle` | Consolidated read; unified-memory layer 2 |
| `s5'.gnostic.list_notebooks(coord_filter)` | `[NotebookHandle]` | Powers Library projection (DR-LIB-ATELIER-1) |
| `s5'.gnostic.episode_search(query, vak_filter)` | `[GraphitiEpisode]` | Coordinate-aware retrieval over Graphiti |
| `s5'.gnostic.evidence_trace(passage_id)` | `[EvidenceAnchor]` | Provenance pointer chain per CCT-17b |
| `s5'.gnostic.query_with_layers(query, vak_filter)` | `TriLayerRetrievalPlan` | MemoryGraphRAG 3-layer composition per CCT-17b |
| `s0'.anuttara.trace(content, sensitivity, depth)` | `AnuttaraTraceReport` | Per DR-COMP-1; Anuttara grammatical-tracing API; routes to `Body/S/S0/epi-lib/src/m0_verifier.c` |

The `s0'.anuttara.trace` route is the cross-substrate seam: it sits at the **alphabet expression of VAK** (per DR-VAK-7) while the `s5'.gnostic.*` family sits at the **C'/dispatch expression**. Both flow through this plan because the compression cycle walks from alphabet → C' → field → L5'+T/T'.

**Parametric-expert layer — 4th retrieval layer of `query_with_layers` (per DR-PARAM-1).** `s5'.gnostic.query_with_layers` composes ontology-layer + fact-layer + cosine-vector ranking (CCT-17b); Phase-M adds an optional **parametric-expert layer** for the stable-canonical-leaf class. When the Nara (4') slot runs locally and the EBM energy `E = ‖q_b − q_p‖²` (DR-MP-2) spikes for a coordinate whose canonical leaf-facts are carried as a birth-codon-indexed micro-expert, the layer loads that expert into the local model's final FFN (linear ΔΘ sum) **instead of** re-injecting the fact as retrieved text — preserving the KV cache. This layer is **EBM-energy-gated** (not entropy-gated) and **coordinate/`c_5_birth_codon`-routed** (not BM25). It is a leaf-cache companion to the graph layers, **never a replacement**: relational / multi-hop / provenance retrieval always flows through the ontology + fact + vector layers. The retrieval-seam *registration* lands here (Tranche 12.2 EXPANDED); expert *manufacturing* rides Tranche 12.24 (`epii-distillation` expert mode + `mlx-lora`); the expert store is keyed by `c_5_birth_codon` (CCT-14b).

### Access pattern 2 — Khora session layer integration

**Anchor:** `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` (extend with new `session-workspace.ts` module).

The Khora session-workspace.json convergence point (per wave-2 scout 4 finding "Khora session state is in-memory singletons + scattered files"):

**Path:** `{gate_state_root}/sessions/{session_key}/session-workspace.json`

**Contents:**
```json
{
  "session_key": "agent:pi:main",
  "created_at_ms": 1718000000000,
  "day_id": "20260615",
  "now_path": "Idea/Empty/Present/20260615/NOW.md",

  // Terminal binding (from Tranche 12.02)
  "terminal_binding": {
    "tmux_session_name": "epi-khora-repo-pi",
    "tmux_pane_id": "%0",
    "attached_session_key": "agent:pi:main",
    "lease_expires_at_ms": 1718043200000
  },

  // Redis cache namespace
  "redis_namespace": "epi:20260615:agent:pi:main",
  "redis_cache_tiers": {
    "hot": ["epi:20260615:agent:pi:main:turn:1:evidence:*"],
    "warm": ["epi:20260615:agent:pi:main:session:metadata"]
  },

  // Gnostic substrate handles
  "gnostic_handles": {
    "active_notebooks": ["notebook-id-1", "notebook-id-2"],
    "pending_ingestions": ["ingestion-receipt-id"],
    "active_etymology_cluster": null
  },

  // VAK coordinate-reference handles (per CCT-17/CCT-20)
  "vak_reference_handles": [],

  // Bootstrap state (currently in-memory)
  "bootstrap_completed": true,
  "bootstrap_reads": ["CONTINUATION.md", "ANIMA.md", "PASU.md", "PARADIGM.md", "MEMORY.md", "NOW.md", "TOOLS.md"],
  "secrets_materialized_at_ms": 1718000001000,

  // Sync queue handle (currently in-memory)
  "sync_queue_path": ".khora-sync-queue.jsonl",
  "sync_queue_item_count": 42
}
```

**Lifecycle hooks:**
- On `session_start` — load `session-workspace.json` if present, verify terminal lease still valid, skip bootstrap steps already completed.
- On `session_before_compact` — serialize current state to `session-workspace.json` (atomic write via tempfile + rename).
- On `session_shutdown` — final serialize + lease release.
- On Pi process restart — `Khora bootstrap` reads `session-workspace.json` first (before CONTINUATION.md); if terminal lease is live, resume without re-running full bootstrap.

**Write authority enforcement.** Every gnostic write (ingest, notebook, etymology, candidate-promotion) flows through Khora's `khora_write` primitive (existing at `khora/extension.ts:72-101`). The session-workspace.json itself is `khora_write`-authored. **No gnostic operation may bypass Khora.** Gateway-side dispatch validates the calling session has Khora write-authority before any gnostic-write method executes.

### Access pattern 3 — S0 tmux integration

**Anchor:** existing Tranches 12.01-12.08 substrate (inherited as-is); extend lease-checks at gnostic-shell call sites.

The `TerminalBinding` already lands per Tranche 12.02 in gateway session record. This plan extends:
- **Gnostic ingestions get terminal-lease backing** — `epi gnostic ingest <path>` and the corresponding `s5'.gnostic.ingest` route allocate a terminal lease (or use the existing one if session is terminal-backed) so the operation is recoverable on Pi crash.
- **Long-running ingestion progress flows through tmux pane** — the Python `epi-gnostic` ingestor's progress output is captured under the terminal lease's `capturePolicy.maxLines` budget; user can `epi agent tmux capture --session-key <key>` to inspect mid-ingestion.
- **Failure during ingest is recoverable** — if the Pi process dies mid-ingest, Khora's bootstrap reads `pending_ingestions` from session-workspace.json on restart and offers to resume / retry / abort.

**No new tmux code.** This is wiring over Tranches 12.01-12.08.

### Access pattern 4 — Redis hierarchical keys

**Anchor:** `Body/S/S3/redis-context/src/lib.rs` (extend namespace constants + helpers).

**Promote from flat to hierarchical:**

| Today (flat) | This plan (hierarchical) |
|---|---|
| `s2:graph:semantic:{embedding_id}` | `epi:{day}:{session}:{turn}:{coordinate}:semantic:{embedding_id}` |
| `s3:gateway:temporal:{session_key}` | `epi:{day}:{session}:gateway:temporal:*` |
| `claude-mem-obs:{id}` | `epi:{day}:{session}:hot:claude-mem:{id}` |
| `gnosis:promoted:{sessionId}` | `epi:{day}:{session}:cold:gnosis:promoted:{id}` |
| (no key today) | `epi:{day}:{session}:{turn}:{coordinate}:evidence:*` |
| (no key today) | `epi:{day}:{session}:{turn}:{coordinate}:candidate:*` |
| (no key today) | `epi:{day}:{session}:gnostic:notebook:{notebook_id}:*` |
| (no key today) | `epi:{day}:{session}:gnostic:etymology:{cluster_id}:*` |

The `graph_revision` segment (per CCT-16) joins the key under `cold:` tier so cold-tier invalidation flips atomically without DEL storms.

**Helpers:**
- `coordinate_lookup_snapshot(graph_revision, day, session, turn, coordinate) → Vec<CachedSnapshot>` — replaces existing flat lookup helper.
- `session_start_cache_warm(day, session) → CacheWarmReport` — on session start, pre-populate hot tier with `epi:{day}:{session}:*` scope from a recent prior session under the same day (typical: previous turn's working set).
- `turn_scope_evict(day, session, turn) → EvictedCount` — turn-scoped TTL eviction (`EXPIRE epi:{day}:{session}:{turn}:* 86400`).
- `coordinate_conditional_lookup(coordinate, vak_context) → Vec<CachedSnapshot>` — coordinate-conditional dispatch helper (Anima reads per Mercurius rating-state key).
- `grandparent_session_inherit(parent_day, parent_session, child_day, child_session) → InheritReport` — child reads parent prefix, writes own; explicit boundary.

**Per-coordinate metrics** — `cachehit:epi:{day}:{session}:{coordinate}:*` observability events fire per cache hit/miss, enabling per-coordinate cache-hit-rate metrics (e.g., "Paramaśiva cache hit rate this session: 73%").

### Access pattern 5 — CLI parity

**Anchor:** new file `Body/S/S0/epi-cli/src/gnostic.rs`; routes via gateway (NEVER bypassing).

| CLI command | Gateway route called | Notes |
|---|---|---|
| `epi gnostic query <coord> [--depth N]` | `s5'.gnostic.query(coord, depth)` | Coordinate-anchored RAG query |
| `epi gnostic ingest <path> [--namespace gnostic\|world\|etymology\|skills]` | `s5'.gnostic.ingest(path, ns)` | Per DR-WORLD-1 four-sub-namespace plan |
| `epi gnostic notebook <coord>` | `s5'.gnostic.notebook(coord)` | Opens per-session notebook |
| `epi gnostic status` | `s5'.gnostic.status()` | Substrate health check |
| `epi gnostic candidates [--filter promotable\|orphan\|reviewed]` | `s5'.gnostic.candidates(filter)` | Per CCT-14 entity-candidate lifecycle |
| `epi gnostic etymology <coord>` | `s5'.gnostic.etymology(coord)` | Atelier scent-following lens |
| `epi gnostic resolve <coord>` | `s5'.gnostic.resolve(coord)` | Unified-memory layer 2 entry |
| `epi gnostic list [--coordinate <coord>]` | `s5'.gnostic.list_notebooks(coord)` | Powers Library projection |
| `epi gnostic search <query> [--vak <vak-filter>]` | `s5'.gnostic.episode_search(query, vak)` | Coordinate-aware Graphiti search |
| `epi gnostic evidence <passage_id>` | `s5'.gnostic.evidence_trace(passage_id)` | Per CCT-17b span-pointer chain |
| `epi gnostic query_layers <coord> [--vak <filter>]` | `s5'.gnostic.query_with_layers(coord, vak)` | MemoryGraphRAG 3-layer composition |
| `epi entity capture <path>` | `s1'.entity.capture(path)` | Per CCT-14 EXPANSION |
| `epi entity classify <id> [--c-layer C0..C5]` | `s1'.entity.classify(id, c_layer)` | Per CCT-14 EXPANSION |
| `epi entity promote_to_type <id>` | `s1'.entity.promote_to_type(id)` | Per CCT-14 EXPANSION |
| `epi world graduate <type_path>` | `s1'.world.graduate(type_path)` | Per CCT-14 EXPANSION + DR-WORLD-1 |
| `epi world resolve <coord>` | `s1'.world.resolve(coord)` | Unified-memory layer 2 (alongside `s5'.gnostic.resolve`) |
| `epi anuttara trace <content_or_file>` | `s0'.anuttara.trace(content, sensitivity, depth)` | Per DR-COMP-1; alphabet-expression of VAK |

**Headless / scripted / dev use is first-class.** Every CLI command outputs structured JSON when `--json` is passed (per existing epi-cli convention). CI tests + headless dev scripts use the CLI; UI surfaces (OmniPanel tabs, Theia commands) call the same gateway routes.

## Cross-namespace promotion plan

Per DR-WORLD-1, the S2 namespace map after this plan lands:

| Graph label | Vault dir | Sub-namespaces | Role |
|---|---|---|---|
| `:Bimba` | `/Idea/Bimba/Seeds/M/` | (no sub) | canonical M0-M5 + S0-S5 + 17 relations |
| **`:World`** (+ `:Archetypal` alias) | `/Idea/Bimba/World/Types/` | (no sub for now) | entity forms, types, C-layer typology; **psychoid root linked to base C-coords via `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF`** |
| **`:Gnostic`** | (Python wrapper; no vault dir) | **`:Gnostic:Corpus`**, **`:Gnostic:Notebook`**, **`:Gnostic:Etymology`**, **`:Gnostic:Skills`** | RAG corpus, per-session notebooks, etymological clusters, skill manifest |
| (`:Pratibimba`, S0-protected) | `/Idea/Pratibimba/System/` | (no sub; never on public graph) | personal episodic, protected-local |

**Schema landing** (gateway-coordinated):
```rust
// Body/S/S2/graph-schema/src/lib.rs additions
pub const WORLD_LABEL: &str = "World";
pub const ARCHETYPAL_LABEL: &str = "Archetypal"; // alias

pub const GNOSTIC_LABEL: &str = "Gnostic";
pub const GNOSTIC_CORPUS_LABEL: &str = "Gnostic:Corpus";
pub const GNOSTIC_NOTEBOOK_LABEL: &str = "Gnostic:Notebook";
pub const GNOSTIC_ETYMOLOGY_LABEL: &str = "Gnostic:Etymology";
pub const GNOSTIC_SKILLS_LABEL: &str = "Gnostic:Skills";

pub const WORLD_FORM_OF_RELATION: &str = "WORLD_FORM_OF";
pub const WORLD_ONTOLOGY_OF_RELATION: &str = "WORLD_ONTOLOGY_OF";
```

## Tranche sequencing

This plan does NOT introduce a new Tranche numbering — Tranche 12.2 EXPANDED (Track 12) is the canonical execution tranche, and CCT-14 EXPANSION + CCT-17 (Track 16) carry the cross-cutting pieces. Track 39 is the **comprehensive shape** the execution tranches consume.

The order of landing (per dependency chain):

1. **DR-S5-ONE-1 + DR-WORLD-1 ratification** — user final-validation gates everything else.
2. **DR-IG-1 land** (existing, ratified) — `c_1_relation_family` enum schema lands so ontology layer filters work.
3. **CCT-16 close** (existing) — substrate integrity bundle lands (frontmatter `{family}_{n}_{i?}_{semantic}` regex; sync acks; bidirectional `MostRecent`; `graph_revision` increment).
4. **Schema extensions** — `:World` + `:Gnostic` labels + sub-labels + `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` relations land in `graph-schema/src/lib.rs`.
5. **CCT-14 EXPANSION** — PASU lifecycle gateway routes + CLI parity land.
6. **Tranche 12.2 EXPANDED** — `s5'.gnostic.*` gateway routes + CLI parity land; `s0'.anuttara.trace` route lands.
7. **Khora session-workspace.json** — landing per Surface 2 above.
8. **Redis hierarchical helpers** — landing per Surface 4 above.
9. **CCT-17b — wikilink span-pointer** — promotes wikilinks to first-class S2 retrieval primitive.
10. **CCT-17 — VAK coordinate-reference discipline** — closes DR-COMP-1 silent-truncation without a new compression module.
11. **Tranche 12.33 — coordinate-tagging lint lands** — no `Body/S/S4/compress/` directory; no `SymbolicCompressedHandle`.
12. **CCT-20 + Tranche 12.36 — phase preservation** — `resolve` / `trace` / VAK envelope tests prove prime/inversion phase survives dereference.
13. **CCT-19 — Library + Atelier projections activate** — consumes `s5'.gnostic.list_notebooks` per DR-LIB-ATELIER-1.
14. **End-to-end acceptance** (per Tranche 12.2 EXPANDED verification) — single integration test gates the PR.

Total estimate: ~750 LOC across 5 modules; 1 new plan file (this one); spec updates across 5 existing tracks (01, 06, 09, 11, 12); 7 new DR rows.

## What this UNBLOCKS

The wave-2 scout findings made the gate visibility sharp. Without this substrate landing:

- `:World` archetypal namespace cannot surface entity-memory queries through PI/Anima.
- Anuttara aggregation layer is locked from the agentic side.
- Logos Atelier scent-following has no gateway dispatch path.
- Library surface (M5-0' projection) has no read-route.
- PASU orphan-entity lifecycle cannot expose `s1'.entity.classify` results.
- Hermes-style `skill_lookup` cannot semantic-search the skill manifest in Gnostic.
- MemoryGraphRAG 3-layer composition (per DiscoverAI research) cannot land.
- Spine compositor silent-truncation cannot be replaced (no `s0'.anuttara.trace` route).
- Sophia disclosure `q_proposals` cannot be compressed before aphoristic-skill composition.
- Mercurius Elo `(guardian, VAK-context)` lookups have no hierarchical-Redis substrate.
- Dispatch-with-parent-slice cannot carry slice handles (no session-workspace serialization).

With this substrate landing, ALL of the above unblock simultaneously. **The S5' single-substrate layer is the cross-cutting unlock for the cycle 3 wave of work originating from the DiscoverAI research synthesis.**

## Verification (release-gate G14 acceptance)

Single end-to-end integration test:

```
1. epi session start --persist --role psyche (allocates tmux + Khora session-workspace.json)
2. epi gnostic ingest /Idea/Bimba/Seeds/M/M5'/some-spec.md --namespace gnostic
   - Routes through gateway s5'.gnostic.ingest
   - Khora write-authority verified
   - tmux pane carries the operation under terminal lease
   - Redis cache key under epi:{day}:{session}:{turn}:gnostic:* hierarchical namespace
   - Returns IngestionReceipt with VAK coordinate-reference handles when bodies are represented by address
3. epi gnostic query M5-1 --depth 2
   - Returns [GnosticChunk] with coordinate-aware retrieval
4. epi entity capture /Idea/Empty/Present/{day}/some-orphan-note.md
   - Routes through gateway s1'.entity.capture
   - Lands as entity_candidate in Empty/Present/{day}/entities/
   - Birth-codon assigned (per CCT-14b)
5. epi entity promote_to_type {candidate-id} --c-layer C2
   - Lands in /Idea/Bimba/World/Types/Coordinates/C2/
   - Creates :World node with WORLD_FORM_OF relation to parent C2 :Bimba node
   - Wikilinks in the entity file populate c_1_source_artifact_span on the :World node
6. epi world graduate /Idea/Bimba/World/Types/Coordinates/C2/SomeEntity.md
   - Lands flat /Idea/Bimba/World/SomeEntity.md; type-local retained as MOC pointer
   - :World node updated; psychoid root link preserved
7. epi anuttara trace "<content>" --sensitivity protected --depth 3
   - Routes through gateway s0'.anuttara.trace
   - Returns AnuttaraTraceReport with VAK alphabet-expression mapping
8. Session compaction triggers session-workspace.json serialization
9. Kill Pi process
10. epi session resume {session_key}
    - Khora reads session-workspace.json
    - Terminal lease verified live
    - Resumes without re-running full bootstrap
    - All gnostic + entity + world operations from steps 2-7 are observably preserved
```

**Acceptance:** all 10 steps succeed; no operation bypasses gateway; no flat-namespaced Redis keys created; CLI parity round-trips with gateway dispatch; the same set of operations succeed via Theia OmniPanel UI (which calls the same gateway routes).

`cargo test -p epi-s3-gateway s5_one_substrate_e2e_acceptance` runs this scenario and gates the PR.

## Cross-track hooks

- DR-S5-ONE-1, DR-WORLD-1, DR-LIB-ATELIER-1, DR-COMP-1, DR-VAK-7, DR-Q-1, DR-EROS-1 (Phase-I 2026-06-15 PROPOSED rows; all gate cycle-3 release until validated).
- Tranche 12.2 EXPANDED (Track 12 — canonical execution tranche).
- Tranches 12.27-12.36 (Track 12 — Eros rectification, Hermes skill_lookup, constitutional CT/CF canon, tmux topology, dispatch-with-parent-slice, VAK-uniform entitlement, coordinate-tagging discipline, phase-preserving resolve).
- CCT-14 EXPANSION, CCT-17, CCT-17b, CCT-19 (Track 16).
- Tranche 1.18 (Track 01 — VAK four-expression canon).
- Tranches 06.1 REFRAMED, 06.2 REFRAMED (Track 06 — Library + Atelier as projections, NOT new extensions).
- Tranche 11.3 (Track 11 — daily-layer widget ownership trace; Library + Atelier as projection-lenses).
- CCT-16 (Track 16 — substrate integrity bundle; prerequisite).
- DR-IG-1 (already ratified — `c_1_relation_family` enum schema).
- M5'-on-Anuttara spec (canonical residency reference).
- **Track 42 Harness Dynamics Surface** ([`42-harness-dynamics-surface.md`](42-harness-dynamics-surface.md)) — extends **Access Pattern 2** (Khora `session-workspace.json`) with the per-session harness binding (`{harness_id, model_slot, backing, tmux_lease | acp_endpoint, cf_identity, parent_session_key}`, `khora_write`-authored), and makes the gateway transcript-of-record **harness-neutral** so the Sophia/Aletheia → Graphiti episodic pipeline (the ONE Indras Net episodic layer) reads one shape regardless of which harness ran the session. Parent sessions bind `harness = pi`; sub-sessions may bind any authed harness. Track 42 obeys the ONE-substrate invariant verbatim — no harness owns history, no harness write bypasses Khora session authority.

## What this is NOT

- This is NOT a new substrate to build (existing pieces wire as ONE).
- This is NOT a re-architecting of S5' (the spec already names S5' as ONE; this lands the operational reality).
- This is NOT a UI plan (Library + Atelier projections live in Track 11 / 06 — see DR-LIB-ATELIER-1).
- This is NOT a model-training plan (M1' CPT trainer + EKSFT live in Track 02 and Tranche 12.24 Phase 2 epii-distillation; the DR-PARAM-1 parametric-expert *manufacturing* also lives in Tranche 12.24 — this plan hosts only the retrieval-layer *registration* in `query_with_layers`).
- This is NOT the agentic-layer plan (Track 12 carries dispatch, Elo, MoE, evolver; this plan is the substrate those consume).

Track 39 is the **comprehensive substrate plan** that the cycle 3 release-gate G14 explicitly checks. Its single deliverable is the ONE-substrate invariant proved by the end-to-end acceptance test above.
