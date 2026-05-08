---
coordinate: "S2/S2'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[S0-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S2]]"
  - "[[S2']]"
  - "[[S2'Cx]]"
---

# S2/S2' Specification: Graph Body and Coordinate-Aware Retrieval

## Status

This is the consolidated S2-level master specification. It replaces the older scattered [[S2]], [[S2']], [[S2'Cx]], and S2-y/S2-y' files as the build reference for the graph/cache layer.

S2 is the graph body: raw shared [[Neo4j]] persistence, graph schema bootstrap, coordinate seed storage, raw [[Cypher]], graph sync operations, and graph-semantic cache law. [[Redis]] / RedisVL runtime residency belongs with [[S3]] / [[S3']] Redis context, while S2 owns the graph semantic-cache namespace, payload contract, retrieval use, and graph-context semantics over that runtime substrate.

S2' is coordinate-aware graph law: [[Pleroma]]/[[Parashakti]] graph grammar over that substrate, [[Indra's Net]] retrieval, coordinate resolution, relation law, cross-namespace edges, reranking, disclosure density, and context pool assembly for [[Psyche]], [[Anima]], [[Hen]], and [[Aletheia]].

[[Gnosis]] / [[RAG-Anything]] and [[Graphiti]] are not S2 owners. They use the S2 substrate, but Graphiti's temporal episodic architecture belongs to [[S3']] and its invocation/usage governance belongs to [[S5]] / [[S5']]. S2 must keep the substrate clean enough that those systems can share it without collapsing their laws into the database layer.

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - full reflective lattice held as one dispatch field.
- CT: `CT1` - specification / form-giving law.
- CP: `4.1 Definition` moving toward `4.2 Operation`.
- CF: `(0/1)` primary [[Logos]] with [[Eros]] implementation/test reality.
- CFP: S-family, S2/S2' graph/cache layer.
- CS: `CS2` with dependency on [[S0]] command ground and [[S1]] vault material.

Manual dispatch result: [[Logos]] owns the substrate/law split; [[Eros]] owns the real `epi graph`, Docker, Neo4j, Redis, and test implications; [[Pleroma]] / [[Parashakti]] name the S2' augmentation field; [[Hen]] consumes this layer for vault-to-graph retrieval and sync.

## Preflight. Derivation Notes

### Old S-file carry-forward

The older [[S2]] files correctly preserve the telos: the graph as universal topology where vault knowledge becomes queryable, relational, traversable, and pattern-discoverable. The older [[S2']] files correctly preserve the [[Indra's Net]] image: nodes as jewels, edges as reflections, traversal as following reflections, GraphRAG as perception of the net.

The old base subcoordinate sequence remains useful:

| Old base coordinate | Carry-forward intuition |
|---|---|
| [[S2.0]] Neo4j Nodes | Graph primitive ground, node existence, labels, properties |
| [[S2.1]] Entity Definitions | Node forms, schema, constraints, coordinate families |
| [[S2.2]] Graph Operations | Raw Cypher, CRUD, MATCH/MERGE/SET/DELETE |
| [[S2.3]] Relationship Patterns | Typed relation structures and QL position edges |
| [[S2.4]] Graph Context | Traversal neighborhoods, path finding, context windows |
| [[S2.5]] Graph Queries | GraphRAG, synthesis queries, vault/graph integration |

The old prime subcoordinate sequence survives as graph-law pressure:

| Old prime coordinate | Current expression |
|---|---|
| [[S2.0']] Node CRUD API | Graph schema law and canonical node property contracts |
| [[S2.1']] Relationships API | Graph form contract and relation type registry |
| [[S2.2']] Coordinate Queries API | Operation contract for coordinate-filtered query/ingestion |
| [[S2.3']] Position Traversal API | Relation pattern law and traversal semantics |
| [[S2.4']] Property/Relationship Sync API | Graph context economy, reranking/cache/relevance law |
| [[S2.5']] GraphRAG Retrieval API | Graph return law and disclosure density |

### Corrections / re-homing

The old S2 material sometimes collapses graph substrate, semantic law, and world-return services into one layer. Current architecture separates them:

- [[S2]] is raw shared graph substrate: [[Neo4j]], graph semantic-cache law, driver/session/health, raw query, graph seed, sync primitives.
- [[S2']] is coordinate-aware graph/retrieval law: schema contracts, relation law, coordinate resolution, retrieval/rerank/enrich, context pool assembly.
- [[S1]] / [[S1']] owns vault material and sync queue production; S2 consumes the queue through sync/drain operations.
- [[S3']] / [[Chronos]] owns temporal runtime and session truth. Redis placement should move toward [[S3']] where it grounds live context temporally: session state, active [[NOW]] continuity, kairos windows, episode handles, and short-lived context keys are temporal/contextual facts before they are graph facts. S2 may still operate Redis/RedisVL as graph-cache substrate, but ownership of living runtime context belongs to S3'.
- [[S3']] owns [[Graphiti]] as temporal episodic architecture. [[S5]] / [[S5']] owns [[Gnosis]], Graphiti invocation/usage, [[NotebookLM]], [[Vimarsa]], and governance over world-return knowledge. These systems may store in Neo4j, but their meaning is not S2.

### Current code reality

The live implementation is substantial:

- `Body/S/S0/epi-cli/src/graph/` implements the `epi graph` command mirror plus remaining lifecycle, schema/seed/meta, retrieval execution, vault sync, dataset import, Redis cache, doctor/status, and dev bootstrap wiring. This is now partly thinned: S0 still hosts runtime orchestration, but parser/query/cache/client authority has moved to Body-native S2 modules.
- `Body/S/S2/graph-schema` owns the canonical S2 graph schema constants: `:Bimba`, coordinate property, 3072 embedding dimensions, vector index names, and compatibility labels/properties.
- `Body/S/S2/graph-services` owns the first Body-native S2 service authority: Neo4j primary graph role, live Neo4j config/client, coordinate parser, GraphRAG query grammar, disclosure/query/retrieval result contracts, and Redis semantic-cache role/config/payload/client/health contracts. It resolves the RedisVL Python bridge through `Body/S/S3/redis-context`, because the bridge is Redis runtime residency while S2 owns the graph semantic-cache law using it. `Body/S/S0/epi-cli/src/graph/client.rs`, `coordinate_array_parser.rs`, `retrieval/graphrag.rs`, `retrieval/hybrid.rs`, and `semantic_cache.rs` now mirror or delegate to this S2 authority where those contracts are involved.
- `docker-compose.epi-s2.yml` is the local S2 service topology for Neo4j and Redis.
- `Body/S/S2/external/bimba-mcp/` implements coordinate-aware Neo4j query, schema validation, sync API, coordinate parser, reranking, embeddings, and MCP-facing graph tools for external systems. It is not the PI agent's internal graph interface; PI should consume coordinate-native APIs/context pools rather than reaching through MCP as its own inner organ.
- `Body/S/S5/epi-gnostic/` uses Neo4j as a storage substrate for RAG and currently contains Graphiti compatibility wrapper code. Graphiti should be treated as an S3' temporal library/runtime component; the current HTTP wrapper is integration scaffolding, while S5/S5' governs invocation and usage.

Current implementation gaps:

- The canonical gateway/API methods `s2.graph.query`, `s2.graph.node`, `s2.graph.traverse`, `s2'.retrieve`, `s2'.rerank`, `s2'.enrich`, and `s2'.coordinate.resolve` are not yet cleanly exposed as a single coordinate-native gateway method surface.
- The live CLI has pragmatic commands such as `graph query`, `retrieve`, `graphrag`, and `hybrid`, but they do not perfectly match the TS method contracts.
- `s1.sync.flush` / S1 -> S2 queue drain is still a critical blocker in the audit; direct `epi graph sync <path>` exists, but Khora queue flushing is not complete.
- The legacy `#` coordinate is not a defect by itself. It is the old `bimbaCoordinate` format, and the migration rule is that this branch becomes the [[M]] coordinate branch in the new system. Parser/API work must handle that conversion deliberately rather than treating `#` as an arbitrary invalid string.
- Redis ownership needs final clarification in S3/S3': graph semantic cache may remain S2 substrate, but temporally grounded context, session continuity, kairos windows, and episode handles belong under [[S3']] / [[Chronos]] key law.
- Remaining modularity gap: retrieval execution, seed, sync, enrichment, Redis hot/warm graph cache, and some CLI graph orchestration still live inside the S0 CLI package. These should move behind `Body/S/S2/graph-services` contracts while `epi graph` remains the S0 command mirror.

### Planning consequence

The S2 shard/build pass must produce a clean split:

- S2 substrate commands and tests for Neo4j/Redis/RedisVL health, schema, seed, raw query, sync, retrieval, and import.
- S2' coordinate-law commands/API for resolve, retrieve, rerank, enrich, relation typing, disclosure density, and context pool formation.
- Explicit integration contracts with [[S1]] sync flush, [[S3']] temporal/session Redis, and [[S5]] world-return services.

## A. S2 - Graph Body Base Technology

### What It Is

S2 is the objective graph/cache substrate of [[Epi-Logos]]. It gives the system a durable relational arena and a fast cache/semantic-cache arena.

Current canonical S2 base technology:

- [[Neo4j]] graph database.
- [[Redis]] / Redis Stack / RedisVL where used for graph semantic cache and graph-context hot/warm storage.
- `docker-compose.epi-s2.yml` service topology.
- `epi graph` Rust command surface.
- `bimba-mcp` Neo4j access and sync backend.
- Coordinate seed graph and schema constraints.
- Raw graph import/sync/query/traversal primitives.

### Services, Binaries, Processes

| Component | Coordinate | Language | Runtime / Port | Role |
|---|---:|---|---|---|
| `epi-neo4j` | [[S2.0]] | Neo4j | Bolt `7687` / HTTP depending config | Durable graph substrate |
| `epi-redis` | [[S3]] / [[S3']] runtime, consumed by [[S2.4]] / [[S2.4']] graph cache law | Redis Stack | `6379` | Shared Redis runtime with separated namespaces: S2 graph semantic cache, S3 temporal context |
| `epi graph` | [[S2]] / [[S2']] via [[S0]] | Rust | Local CLI | Graph lifecycle, query, sync, retrieval, doctor, import |
| `bimba-mcp` | [[S2']] external interface | TypeScript at `Body/S/S2/external/bimba-mcp` | MCP server | Coordinate-aware graph query/sync/rerank surface for external systems, not PI-agent internals |
| RedisVL cache service | [[S3]] runtime, consumed by [[S2.4]] | Python | Local subprocess/service | RedisVL bridge residency for prompt/result reuse; graph semantic-cache namespace remains S2 |
| `epi-gnostic` | Uses [[S2]] | Python at `Body/S/S5/epi-gnostic` | Local package/services | RAG-Anything/Gnostic world-return plus current Graphiti wrapper over shared graph substrate |

S2 itself does not own vault residency, gateway sessions, constitutional routing, or gnosis governance. It provides the graph/cache body they use.

### API Methods Homed Here

#### `s2.graph.query`

Runs raw Cypher against Neo4j.

Request type: `S2GraphQueryRequest`

```typescript
interface S2GraphQueryRequest {
  cypher: string;
  params?: Record<string, unknown>;
}
```

Response type: `S2GraphQueryResponse`

```typescript
interface S2GraphQueryResponse {
  rows: Record<string, unknown>[];
  columns: string[];
}
```

Build implications:

- This is raw substrate access and must be permission-gated.
- Parameterized Cypher is required; string interpolation is not acceptable for user-supplied inputs.
- Returned rows must be JSON-safe and must not leak driver internals.

#### `s2.graph.node`

Looks up a graph node by coordinate.

Request type: `S2GraphNodeRequest`

```typescript
interface S2GraphNodeRequest {
  coordinate: CoordinateString;
}
```

Response type: `S2GraphNodeResponse`

```typescript
interface S2GraphNodeResponse {
  node: BimbaNode;
  relations: Relation[];
  maps_to: CoordinateRef[];
  resonates_with: CoordinateRef[];
}
```

Build implications:

- The response is already partly S2' flavored because it exposes cross-namespace relation law.
- If implemented on raw `epi graph`, the method must still delegate relation interpretation to S2' schema law.

#### `s2.graph.traverse`

Traverses graph paths.

Request type: `S2GraphTraverseRequest`

```typescript
interface S2GraphTraverseRequest {
  from: CoordinateString;
  edge_types?: string[];
  direction?: "outbound" | "inbound" | "both";
  depth?: number;
  families?: CoordinateFamily[];
}
```

Response type: `S2GraphTraverseResponse`

```typescript
interface S2GraphTraverseResponse {
  paths: GraphPath[];
  nodes: BimbaNode[];
}
```

Build implications:

- Depth must be bounded.
- Traversal must be namespace-aware where cross-namespace edges are present.
- For GraphRAG usage, traversal results must carry enough provenance for [[S2']] rerank/disclosure decisions.

### Envelope Fields Populated

S2 contributes to graph/context fields, with the Redis ownership caveat noted above:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `s_2_sync_destination` | [[S2.0']] | [[Khora]] sync queue + graph sync | Neo4j sync destination for vault artifacts |
| `s_2_source_set` | [[S2.4']] | `bimba-mcp`, [[Gnosis]], [[Graphiti]], [[kbase]] | Source set for context pool; Graphiti contributes through S3' temporal episodic architecture, S5 governs usage |
| `s_2_retrieval_mode` | [[S2.4']] | `s2'.retrieve` | kbase / semantic / episodic / hybrid |
| `s_2_scope_coordinates` | [[S2.4']] / [[S4']] | [[Anima]] declares, S2' applies | Coordinate scope for retrieval |
| `s_2_disclosure_density` | [[S2.4']] / [[S2.5']] | S2' rerank/return law | minimal / standard / rich |
| `s_2_project_horizon` | [[S2.4']] | [[kbase]] / context boundary | Project-scoped retrieval limit |
| `s_2_graph_region_handles` | [[S2.5']] | `bimba-mcp` | Active graph region handles |
| `s_2_kbase_pool_id` | [[S2.4']] | [[kbase]] / S2' context pool | Session context pool identifier |

Fields requiring S3/S3' clarification:

| Field | Current tension |
|---|---|
| `s_2_redis_context_key` | 04-22 schema places graph context Redis at [[S2.4']]; 04-25 audit moves unified Redis context key to [[S3']] as `s_3_context_key` because live context is temporally grounded before it is graph-retrieved |
| `s_2_episodic_handles` | 04-22 schema places it at [[S2.4']] / [[S5.3']]; corrected home is [[S3']] because Graphiti episode/arc handles are temporal/runtime anchors |

Decision for this spec: S2 owns graph/cache substrate facts and graph semantic-cache law. S3' owns Redis-backed temporal contextual grounding for live runtime context: active session continuity, NOW linkage, kairos state, episode handles, and gateway-facing context keys. Gateway session metadata is not S2.

### CLI Commands

S2/S2' is currently surfaced through `epi graph`.

| Live command | Primary coordinate home | Notes |
|---|---:|---|
| `epi graph init` | [[S2.0]] / [[S2.1]] | Initialize schema and seed coordinate space on empty graph |
| `epi graph bootstrap` | [[S2.0]] | Bootstrap empty graph |
| `epi graph update` | [[S2.1]] / [[S2.3]] | Apply managed seed/schema updates |
| `epi graph reconcile` | [[S2.5]] | Align current graph with managed desired state |
| `epi graph bootstrap-dev` | [[S2.0]] / [[S0]] | Local Neo4j/Redis/RedisVL dev setup; Redis service is substrate, not automatic ownership of temporal context |
| `epi graph doctor` / `status` | [[S2.0]] / [[S2.4]] | Health report for Neo4j, Redis, Redis Stack, semantic cache, graph state |
| `epi graph up` / `down` | [[S2.0]] | Docker compose lifecycle for `epi-S2` |
| `epi graph query` | [[S2.2]] / [[S2']] | Coordinate query; not identical to raw `s2.graph.query` yet |
| `epi graph sync` | [[S1.5]] -> [[S2.5]] | Direct vault-file-to-graph sync |
| `epi graph retrieve` | [[S2.5]] / [[S2']] | Coordinate retrieval |
| `epi graph graphrag` | [[S2.5]] / [[S2']] | GraphRAG retrieval |
| `epi graph hybrid` | [[S2.4']] / [[S2.5']] | Hybrid vector + graph retrieval |
| `epi graph import` | [[S2.2]] / [[S2.5]] | Dataset import |
| `epi graph seed-nara` | [[S2.2]] using [[Nara]] data | Seeds Parashakti/Nara body-zone/decan data; ontology may need S5/M re-home notes |

CLI parity law: `epi graph` is the local operator mirror. Canonical API methods are `s2.graph.*` and `s2'.*`.

### Current Implementation State

Current Rust files include:

- `Body/S/S0/epi-cli/src/graph/mod.rs` - command tree and dispatch.
- `client.rs` - S0 mirror re-export of the Body-native S2 Neo4j client.
- `Body/S/S2/graph-services/src/lib.rs`, `src/coordinate.rs`, and `src/retrieval_query.rs` - S2 Neo4j config/client, primary graph role, coordinate parser, GraphRAG query grammar, retrieval result/mode/disclosure contracts, and Redis semantic-cache contracts.
- `schema.rs`, `seed.rs`, `meta.rs` - schema constraints, coordinate seed space, graph metadata/revisions.
- `sync.rs`, `sync_coordinator.rs`, `bidirectional_sync.rs`, `sync_orchestrator.rs` - vault/graph sync machinery.
- `retrieval/graphrag.rs`, `retrieval/hybrid.rs`, `retrieval/coordinate.rs` - graph retrieval execution; parser/query/mode/result contracts are now S2-owned re-exports.
- `redis_cache.rs`, `semantic_cache.rs` - Redis/RedisVL cache surfaces.
- `doctor.rs`, `dev.rs` - health and dev bootstrap.
- `dataset_import.rs`, `embeddings.rs`, `semantic.rs`, `relationship_manager.rs`, `alignment_validator.rs`, `link_enforcement.rs` - graph enrichment/maintenance.

Current TypeScript/Python supporting implementation:

- `Body/S/S2/external/bimba-mcp/src/api/graph.ts` - coordinate query/traversal, chunking/embedding hooks for external-system graph access.
- `Body/S/S2/external/bimba-mcp/src/api/sync.ts` - vault/Neo4j sync API.
- `Body/S/S2/external/bimba-mcp/src/schemas/graph.ts` - Zod graph schemas and coordinate filters.
- `Body/S/S2/external/bimba-mcp/src/coordinates/parser.ts` - coordinate parser that currently rejects old hash syntax; migration should map old `bimbaCoordinate` / `#` values into the new [[M]] branch.
- `Body/S/S2/external/bimba-mcp/src/reranking/reranker.ts` - reranking cache/precision surface.
- `Body/S/S3/redis-context/scripts/redisvl_cache_service/` - S3-owned RedisVL Python bridge runtime; `epi graph bootstrap-dev` points here while S2 graph-services supplies the graph semantic-cache namespace/payload law.
- `Body/S/S5/epi-gnostic/` - S5 world-return services using Neo4j/vector storage plus current Graphiti HTTP wrapper; target is Graphiti as S3' library/runtime component.

Current test evidence:

- `epi-cli/tests/graph_commands.rs` covers GraphRAG classification, bootstrap-dev dry-run env contract, doctor JSON sections, and ignored live Neo4j retrieval suite.
- `Body/S/S2/graph-services/tests/coordinate_query_contract.rs` covers S2 coordinate parsing, wikilink frontmatter arrays, GraphRAG query classification, coordinate mention extraction, inferred positions, and cacheable retrieval result/mode serialization.
- `epi-cli/tests/graph_sync.rs` covers frontmatter parsing, conflict resolution, and ignored live vault-to-graph sync.
- `epi-cli/tests/graph_seed.rs` covers live seed/semantic behavior.
- `epi-cli/tests/graph_retrieval.rs` covers coordinate retrieval behavior.
- `epi-cli/tests/redis_cache.rs` covers Redis cache tiers and ignored live Redis operations.
- `epi-cli/tests/semantic_cache_contract.rs` covers RedisVL semantic-cache config/payload/health contracts and ignored live bridge tests.
- `Body/S/S5/epi-gnostic/tests/` include Neo4j/vector/cross-namespace/enrichment tests for services over S2 substrate.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S2.0]] Graph primitive ground | Neo4j/Redis connections, Docker lifecycle, health, raw node/relation storage |
| [[S2.1]] Graph node forms | Coordinate node shapes, Bimba families, schema constraints, labels/properties |
| [[S2.2]] Graph ingestion operations | Raw Cypher, dataset import, vault sync ingestion, embeddings/chunk writes |
| [[S2.3]] Graph retrieval patterns | Cypher templates, relation patterns, GraphRAG traversal, cross-namespace path patterns |
| [[S2.4]] Graph context layer | Active retrieval windows, semantic cache, vector proximity, hot/warm graph-context cache |
| [[S2.5]] Graph integration surface | External graph API, `bimba-mcp` for outside systems, sync/reconcile/export/retrieval shape |

## B. S2' - QL Augmentation

### What It Is

S2' is coordinate-aware graph law over S2. It decides how raw nodes become lawful [[Bimba]] nodes, how relations become typed reflections, how retrieval remains coordinate-scoped, and how context is surfaced with the right disclosure density.

The old [[Indra's Net]] image remains useful: each graph node is a jewel, each relation a reflection, each traversal an act of following interbeing. The build contract is the engineering translation of that image: coordinate schema, relation registry, retrieval envelopes, reranking, enrichment, cache law, namespace boundaries, and graph return law.

### Ta-onta Module

S2' module: [[Pleroma]] / [[Parashakti]] graph law, consumed through [[Hen]] and [[Aletheia]].

Responsibilities:

- Coordinate-forward graph schema.
- Canonical node and relation contracts.
- `MAPS_TO_COORDINATE` and `RESONATES_WITH` edge law.
- Coordinate parser/resolver.
- Retrieval pool assembly.
- Rerank and disclosure-density law.
- Cross-namespace enrichment.
- Context source accounting.

### API Methods Homed Here

#### `s2'.retrieve`

Assembles a coordinate-scoped retrieval pool.

Request type: `S2PrimeRetrieveRequest`

```typescript
interface S2PrimeRetrieveRequest {
  query: string;
  scope_coordinates: CoordinateString[];
  mode: RetrievalMode;
  disclosure_density?: DisclosureDensity;
  top_k?: number;
}
```

Response type: `S2PrimeRetrieveResponse`

```typescript
interface S2PrimeRetrieveResponse {
  pool: RetrievalResult[];
  disclosure_density: DisclosureDensity;
  scope_applied: CoordinateString[];
  sources: string[];
}
```

Build implications:

- Sources may include [[Bimba]], [[Gnosis]], [[Graphiti]], [[kbase]], and [[Vault]], but S2' governs assembly and disclosure. PI receives the resulting context pool through coordinate-native runtime/API surfaces; `bimba-mcp` is for external systems and tool-facing graph access. Graphiti source material should arrive through S3' temporal episodic handles and S5/S5' usage policy.
- [[S4]] reads the assembled pool; it should not assemble ad hoc graph context during execution.

#### `s2'.rerank`

Ranks a retrieval pool.

Request type: `S2PrimeRerankRequest`

```typescript
interface S2PrimeRerankRequest {
  pool: RetrievalResult[];
  criteria: RerankCriteria;
}
```

Response type: `S2PrimeRerankResponse`

```typescript
interface S2PrimeRerankResponse {
  ranked: RetrievalResult[];
}
```

Build implications:

- Criteria include coordinate proximity, recency, and disclosure density target.
- Rerank must preserve source provenance and scores.

#### `s2'.enrich`

Creates cross-namespace coordinate edges.

Request type: `S2PrimeEnrichRequest`

```typescript
interface S2PrimeEnrichRequest {
  node_id: string;
  cross_namespace?: boolean;
}
```

Response type: `S2PrimeEnrichResponse`

```typescript
interface S2PrimeEnrichResponse {
  edges_created: EnrichmentEdge[];
}
```

Build implications:

- Only lawful edges are `MAPS_TO_COORDINATE` and `RESONATES_WITH` unless the relation registry expands.
- Cross-namespace enrichment must be idempotent and confidence-scored.

#### `s2'.coordinate.resolve`

Parses and resolves a coordinate string.

Request type: `S2PrimeCoordinateResolveRequest`

```typescript
interface S2PrimeCoordinateResolveRequest {
  coordinate_string: CoordinateString;
}
```

Response type: `S2PrimeCoordinateResolveResponse`

```typescript
interface S2PrimeCoordinateResolveResponse {
  node: BimbaNode | null;
  family: CoordinateFamily;
  position: ArchetypePosition;
  prime: boolean;
  sub_coordinates: CoordinateString[];
  parent: CoordinateString | null;
}
```

Build implications:

- Must resolve hash-era and letter-family coordinate tension intentionally.
- Should name deprecated syntax clearly instead of silently rejecting live graph coordinates that still exist.

### Envelope Fields Populated

S2' populates the Context-Economy layer:

| Envelope field | S2' role |
|---|---|
| `s_2_source_set` | Declares which retrieval backends contributed |
| `s_2_retrieval_mode` | Governs kbase/semantic/episodic/hybrid retrieval |
| `s_2_scope_coordinates` | Applies coordinate scope |
| `s_2_disclosure_density` | Controls minimal/standard/rich surface |
| `s_2_project_horizon` | Bounds project context |
| `s_2_graph_region_handles` | Names graph regions used |
| `s_2_kbase_pool_id` | Identifies assembled context pool |

### S2'Cx Projection

The corrected C-family projection:

| C coordinate | S2'Cx meaning | Graph manifestation |
|---|---|---|
| C0 | Bimba / coordinate ground | Canonical coordinate node properties, uuid, family, position, prime |
| C1 | Form | Entity node with labels, title/name, coordinate form |
| C2 | Entity relation | Typed relationships with coordinate metadata |
| C3 | Process | Traversal/query patterns and GraphRAG path processes |
| C4 | Type | Labels, namespace, type categories, graph schema classification |
| C5 | Pratibimba / instance | Temporal/instance tracking, sync status, source handles, return artifacts |

Decision: S2'Cx is graph law, not vault residency law. It may reflect S1 forms/types, but it does not decide where vault files live.

### Current Implementation State

S2' is partially embodied in:

- `Body/S/S2/external/bimba-mcp/src/schemas/graph.ts` and related schemas.
- `Body/S/S2/external/bimba-mcp/src/api/graph.ts`, `sync.ts`, coordinate parser, validation, reranker.
- `Body/S/S2/graph-services/src/lib.rs` for the Body-native semantic cache and Neo4j client contracts.
- `Body/S/S0/epi-cli/src/graph/retrieval/*` and remaining S0 graph semantic surfaces pending extraction.
- `Body/S/S0/epi-cli/src/graph/alignment_validator.rs`, `relationship_manager.rs`, `link_enforcement.rs`, and enrichment-related code.

S2' is not yet complete:

- No single canonical gateway method surface is visible for all `s2'.*` methods.
- Coordinate parser behavior must intentionally migrate old `#` / `bimbaCoordinate` values into the new [[M]] branch rather than calling that data malformed.
- Rerank/disclosure-density law is not yet uniformly enforced across CLI, MCP, and gateway.
- S2' graph law is entangled operationally with Gnostic/Graphiti code in some paths; the spec must keep ownership clean while allowing shared storage.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S2.0']] Graph schema law | Coordinate-forward schema, canonical node properties, relation type registry |
| [[S2.1']] Graph form contract | Bimba node form, labels, coordinate inheritance, property contracts |
| [[S2.2']] Graph operation contract | Ingestion law, chunk boundaries, embedding contract, sync semantics |
| [[S2.3']] Graph relation patterns | `MAPS_TO_COORDINATE`, `RESONATES_WITH`, QL relation semantics, traversal validity |
| [[S2.4']] Graph context economy | Retrieval source set, mode, rerank, relevance, graph-context cache law |
| [[S2.5']] Graph return law | Disclosure density, returned pool shape, context provenance, allowed surfacing |

## C. Cross-References

### Depends On

- [[S0]] / [[S0']] for `epi graph`, Docker commands, process execution, environment resolution.
- [[S1]] / [[S1']] for vault files, frontmatter, wikilinks, sync queue, and graduated artifacts.
- [[Khora]] for sync queue production and write-edge discipline.
- [[Hen]] for coordinate/vault law feeding graph sync and retrieval.

### Consumed By

- [[S1']] consumes S2' for topology-aware retrieval and sync confirmation.
- [[S3]] / [[S3']] consumes graph/cache health and owns Redis-backed temporal contextual grounding for runtime/session/NOW/kairos/episode state.
- [[S4]] / [[S4']] consumes assembled context pools for [[Anima]], [[Psyche]], and [[VAK]] routing.
- [[S3]] / [[S3']] consumes Neo4j substrate for Graphiti temporal episodic architecture.
- [[S5]] / [[S5']] consumes Neo4j substrate for [[Gnosis]], Graphiti invocation/usage, [[Vimarsa]], [[Aletheia]], and [[Epii]] governance.
- [[Nara]] and [[M']] consume graph substrate for personal/world-boundary coordinate views.

### Envelope Layers Served

S2/S2' serves these [[Envelope]] layers:

- [[Context Economy]]
- [[Coordinate Layer]]
- Residency Layer via sync destination only
- Temporal Layer via graph facts/handles only, not temporal truth
- [[Episodic Layer]] as storage substrate for [[Graphiti]], while Graphiti architecture is S3' and usage law is S5/S5'
- [[Crystallisation Layer]] as graph destination for promoted artifacts
- [[Improvement Layer]] as retrieval/context feedback substrate

### Gaps

- Implement coordinate-native gateway/API parity for all `s2.graph.*` and `s2'.*` methods.
- Complete `s1.sync.flush` or equivalent S1/S2 queue drain so vault writes reach Neo4j automatically.
- Implement the old `bimbaCoordinate` / `#` to new [[M]] coordinate-branch migration rule consistently across Rust, TypeScript, tests, and graph data.
- Clarify Redis key namespaces so S2 graph semantic cache remains distinct from S3' temporal contextual grounding and Graphiti runtime caches.
- Formalize relation registry and cross-namespace edge law in one place consumed by Rust and TypeScript.
- Ensure `epi graph query` has a raw Cypher mode or clearly separate it from coordinate query/retrieval.
- Add non-ignored integration tests where feasible with testcontainers or controlled local services, preserving production-quality behavior.

## D. Key Architectural Decisions

1. S2 is graph/cache substrate; S2' is coordinate-aware retrieval law.
2. The old universal graph telos survives, but substrate and semantics are no longer collapsed.
3. [[Gnosis]] and [[Graphiti]] use S2 storage; [[Graphiti]] is architecturally [[S3']] temporal episodic runtime, while [[S5]] / [[S5']] owns invocation and usage governance.
4. [[Redis]] must be split by law and namespace: S3 owns the Redis runtime substrate and RedisVL bridge residency; S2 owns graph semantic-cache law under `s2:graph:semantic`; S3' temporal contextual grounding owns live session/NOW/kairos/episode context and Graphiti runtime caches under `s3:gateway:temporal`.
5. `bimba-mcp` is the current S2' external-systems query interface layer and must be treated as more than a helper script, but it is not the PI agent's internal graph organ.
6. `epi graph` is a real S2 command mirror, but CLI command names are not final coordinate-native API names.
7. The S1/S2 sync blocker is critical: without queue drain, vault law and graph law remain manually bridged rather than systemically integrated.
