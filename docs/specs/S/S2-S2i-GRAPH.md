# S2/S2' — Neo4j + Redis (Relational / Lens)

**Status:** STUB — CLI module exists, no backend connected
**Coordinate:** S2 (raw graph/cache access), S2' (coordinate-aware GraphRAG)
**Implementation:** `epi-cli/src/graph/` (Rust)
**CLI Namespace:** `epi graph`

---

## Architectural Role

S2 is the **Vector Arena** — the relational substrate where all coordinate entities exist as graph nodes with semantic embeddings. Neo4j manages persistent graph relations and high-dimensional vector storage. Redis handles high-speed ephemeral caching and pub/sub for live sessions.

### The Non-Negotiable Requirement
Every semantic vector in S2' MUST be anchored to a valid S0' C-engine coordinate primitive. Semantic vectors cannot structurally exist without a topological identity.

### S2 (Explicit) — Raw Database Access
- Neo4j: driver connection, session/transaction management, Cypher execution
- Redis: connection, key-value, pub/sub operations
- Health/retry primitives for both backends
- No coordinate semantics — just database access

### S2' (Implicate) — Coordinate-Aware GraphRAG
- **QL Schema**: Neo4j node/relationship types mapped to coordinate families
- **Redis cache tiering**: session-scoped caching with CF signature isolation
- **NOW dynamics**: temporal graph state tracking per session
- **Vector similarity search**: coordinate-anchored semantic lookup
- **Graph-driven compilation trigger**: S0' <-> S2' evolutionary recompile

---

## Current State in This Repo

### What Exists
`epi-cli/src/graph/mod.rs` — stub only (`epi graph: not yet implemented`)

### What's Missing
1. **No Neo4j driver** — need Rust Neo4j client (bolt protocol)
2. **No Redis client** — need async Redis with pub/sub
3. **No QL graph schema** — node types, relationship types undefined
4. **No vector storage** — no embedding pipeline
5. **No cache tier model** — no Redis key strategy

---

## Graph Schema (from Authority Docs)

### Node Types (Coordinate-Mapped)
```
(:Coordinate {id, family, position, prime, weave_state})
(:Artifact {id, type, path, coordinate_id})
(:Session {id, day_id, now_id, started_at})
(:Day {id, date, status})
(:NOW {id, session_id, day_id, created_at})
```

### Relationship Types
```
-[:MANIFESTS {family}]->        // Archetype -> Coordinate
-[:LINKS_TO {weight}]->         // Coordinate -> Coordinate
-[:GROUNDS]->                   // p_0 relation
-[:DEFINES]->                   // p_1 relation
-[:OPERATES_ON]->               // p_2 relation
-[:PATTERNS]->                  // p_3 relation
-[:CONTEXTUALIZES]->            // p_4 relation
-[:INTEGRATES]->                // p_5 relation
-[:RESIDES_IN]->                // Artifact -> vault path
-[:PRODUCED_IN]->               // Artifact -> Session
```

### Redis Key Strategy
```
coord:{coordinate_id}                    // Coordinate cache
session:{session_id}:coord:{id}          // Session-scoped coordinate state
cf:{cf_signature}:coord:{id}             // CF-isolated parallel exploration
vec:{coordinate_id}                      // Vector embedding cache
```

---

## Integration Architecture

```
epi graph <cmd>
    |
    v
graph/mod.rs (Rust)
    |
    +-- Neo4j (bolt://localhost:7687)
    |       |
    |       +-- Cypher queries
    |       +-- Vector similarity (native Neo4j vector index)
    |
    +-- Redis (redis://localhost:6379)
    |       |
    |       +-- Key-value cache
    |       +-- Pub/sub for live updates -> S3'
    |
    +-- <- S0' (coordinate validation before graph writes)
    +-- <- S1' (vault mutations trigger graph upserts)
    +-- -> S3' (pub/sub events for live visualization)
    +-- -> S4' (agent context queries)
```

### Dependencies
- Neo4j 5.x (with vector index support)
- Redis 7.x
- Rust crates: `neo4rs` (async Neo4j), `redis` (async Redis)
- Vector embeddings from external model (initially via S4' agent)

---

## Implementation Plan

### Phase 1: Infrastructure Setup
- Install Neo4j + Redis locally
- Add Rust driver dependencies to Cargo.toml
- Implement connection management with health checks
- `epi graph status` — show connection status for both backends

### Phase 2: Schema Bootstrap
- Implement `epi graph init` — create Neo4j constraints, indexes, vector indexes
- Define canonical node/relationship types
- Seed archetype nodes (#0-#5) from C library .rodata

### Phase 3: Coordinate CRUD
- `epi graph upsert` — create/update coordinate nodes with validation
- `epi graph query` — Cypher query execution
- `epi graph query-context` — depth-N context retrieval around a coordinate
- `epi graph translate` — bidirectional coordinate <-> semantic translation

### Phase 4: Cache + Pub/Sub
- Redis caching layer with TTL and CF-signature isolation
- Pub/sub channel for S3' gateway live updates
- Session-scoped cache management

### Phase 5: Vector Arena
- Embedding storage in Neo4j vector index
- Similarity search via `epi graph search-semantic`
- Coordinate anchoring enforcement

---

## Authority Documents
- `docs/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` (GraphRAG combined substrate)
- `docs/resources/S/2026-02-21-epii-corpus-ingestion-design.md` (Corpus pipeline)
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S2/S2' module definition)
