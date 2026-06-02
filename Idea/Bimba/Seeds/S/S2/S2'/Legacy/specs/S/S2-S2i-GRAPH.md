# S2/S2' — Neo4j + Redis (Relational / Lens)

**Status:** IMPLEMENTING — Body-native graph schema/services and live Neo4j proofs in place
**Coordinate:** S2 (raw graph/cache access), S2' (coordinate-aware GraphRAG)
**Implementation:** `Body/S/S2/graph-schema`, `Body/S/S2/graph-services`, with `Body/S/S0/epi-cli/src/graph/` as CLI adapter
**CLI Namespace:** `epi graph`
**Docker:** `docker-compose.epi-s2.yml` (Neo4j 5.x + Redis 7.x)

---

## Architectural Role

S2 is the **Vector Arena** — the relational substrate where all coordinate entities exist as graph nodes with semantic embeddings. Neo4j manages persistent graph relations and high-dimensional vector storage. Redis is used here only through S2 graph semantic-cache law (`s2:graph:semantic`) over the S3-owned Redis runtime substrate; live session/DAY/NOW/Kairos context belongs to S3/S3'.

### The Non-Negotiable Requirement

Every semantic vector in S2' MUST be anchored to a valid S0' C-engine coordinate primitive. Semantic vectors cannot structurally exist without a topological identity.

### S2 in the Tiered Granularity Model

The same coordinate exists at every S-level at different detail:

| Level | What it holds | Property name |
|-------|--------------|---------------|
| **S0** | 128-byte HC struct (`.rodata` / heap) | C struct fields |
| **S1** | Markdown + frontmatter (`{family}_{n}_{semantic}`) | YAML keys |
| **S2** | Neo4j node + vector embedding + Redis-backed semantic cache | `coordinate` (`bimbaCoordinate` compatibility only) |
| **S3** | Live state subscription (SpacetimeDB row) | Real-time delta |
| **S4** | Agent context window (prompt-compressed) | Tool output |
| **S5** | Published artifact (Notion page) | External form |

S2 holds the **maximum relational detail** — the full graph of cross-coordinate relationships, position-based edges, and vector embeddings that S0 and S1 cannot express.

### S2 (Explicit) — Raw Database Access

- Neo4j: driver connection (bolt), session/transaction management, Cypher execution
- Redis: connection, key-value, pub/sub operations
- Health/retry primitives for both backends
- Docker lifecycle management (`epi graph up`, `epi graph down`)
- No coordinate semantics — just database access

### S2' (Implicate) — Coordinate-Aware GraphRAG

- **QL Schema**: Neo4j node/relationship types grounded in the HC struct
- **Redis cache tiering**: HOT/WARM/COLD based on artifact role + volatility
- **NOW dynamics**: temporal graph state tracking per session
- **Vector similarity search**: coordinate-anchored semantic lookup
- **Graph-driven compilation trigger**: S0' <-> S2' evolutionary recompile
- **Context Frame isolation**: CF-signature scoped Redis namespaces for parallel agents

---

## Current State in This Repo

### What Exists (Rust packages)

`Body/S/S2/graph-schema` owns canonical Neo4j schema constants, `:Bimba` label law, coordinate property keys, relationship property keys, 3072-dimensional embedding index configuration, compatibility properties for old `bimbaCoordinate` data, kernel-resonance observation schema, and the coordinate-owned pointer-web property registry (`c_5_pointer_web_json`, pointer count, pointer ref arrays, refresh timestamp).

`Body/S/S2/graph-services` owns Neo4j client authority, coordinate parsing/resolution, schema creation, graph metadata, seed/import entrypoints, vault frontmatter mapping/alignment helpers, relationship/link/sync/conflict services, semantic embedding refresh, graph doctor/readiness, graph retrieval semantics, hybrid fusion/ranking law, semantic-cache contract over the S3 Redis runtime, the safe kernel-coordinate anchor, pointer-web compute/refresh methods, and parameterized graph API methods. `Body/S/S0/epi-cli/src/graph/` remains the command adapter and must not become a second schema authority.

Implemented gateway/API methods include `s2.graph.query`, `s2.graph.node`, `s2.graph.traverse`, `s2.graph.pointer_web.compute`, `s2.graph.pointer_web.refresh`, `s2'.coordinate.resolve`, retrieval/rerank/enrich methods, and `s2.graph.kernel_resonance.record`.

### Harmonic Pointer-Web Lock-In

S2 must now treat the pointer web as coordinate topology carrying harmonic semantics, not as an opaque set of reference strings. The current grouped `c_5_pointer_*` fields are the compiled projection. Canonical graph law should move toward granular `c_2_*` operation fields and/or typed Neo4j relationships carrying relation descriptors.

The shared descriptor should agree with the S0 kernel/Rust mirror and include:

- bimba/pratibimba helix semantics, with `descent` / `ascent` kept only as compatibility language;
- X/X' semitone spanda pairs;
- X+Y=5 square mirrors: Square C = 1 whole-tone / epogdoon, Square B = tritone, Square A = 16/9 totality / 5 whole-tones plus absent closure epogdoon;
- 12 lens anchors and 72 MEF resonance slots;
- 8+4 partition for future cymatic rendering: inner 8 as sounded/explicate content, outer 4 as nodal/implicate boundary conditions;
- diatonic CF/VAK projection fields where a relation is interpreted through the lemniscatic scale grammar: `context_frame`, `vak_register`, `context_agent`, `diatonic_degree`, `mode_name`, and `mode_anchor_cf`;
- Mahāmāyā / binary symbolic-codec fields where a relation is interpreted through M3: `mahamaya_address64`, `hexagram`, `codon`, `line_change_operator`, `transcription_state`, and `m3_codec_provenance`;
- semantic embedding context that can include the safe `KernelCoordinateAnchor` and harmonic profile without exposing protected live-kernel or private Pratibimba state.

This is the S2 side of the same matheme computed by S0. S0 computes pulse, ratio, energy, resonance, and safe temporal projection; S2 persists the graph topology and relation metadata that make those computations addressable by coordinate.

### S2' Neosemantics, GDS, And Topology Contract

The M0/Anuttara graph-view pass extends S2' beyond pointer-web lock-in into formal graph semantics and graph-data-science support.

**Neosemantics / OWL bridge**:

- maintain an `epi:` namespace OWL ontology for coordinate classes, relation families, M-family node semantics, and source/spec/code/test anchors;
- lift node-level Anuttara properties `symbol` and `formulation_type` into formal inferential semantics;
- encode relation-type characteristics where useful: symmetry, inversion, transitivity, source/provenance class, privacy/disclosure class;
- use OWL2 RL reasoning as the baseline inferential profile;
- keep optional alignment hooks for CIDOC-CRM, FOAF, SKOS, and PROV-O without making them mandatory dependencies.

**Graph Data Science plan**:

- FastRP embeddings over canonical coordinate topology;
- personalised PageRank from active coordinate, current session handles, and review-safe episode-touched coordinates;
- node similarity and K-NN over `c_5_embedding` / semantic embedding fields;
- Louvain/community detection for graph-region and tangent-overlay grouping;
- output surfaced to M0' as GDS tangent overlays and to M5' as review/context evidence, not as private-user inference leakage.

**Two-phase GDS projection contract**:

- Option 1 baseline: canonical structural projection plus local centroid / active-coordinate personalisation outside the canonical graph. Build this first because it proves the privacy boundary under live workload.
- Option 3 enrichment: episode-as-property aggregation where reviewed, privacy-safe episode features enrich ranking. Keep this spec'd but decision-gated; do not silently promote it to baseline.

**Möbius / Klein topology handling**:

- Approach A baseline: coordinate-duplication / preprocessing that makes non-orientable traversals legible to standard GDS algorithms.
- Approach B deferred: custom walks that understand Möbius / Klein transitions directly.
- Approach C deferred: two embeddings per node for opposing orientations.

**C kernel ↔ Neo4j synchronisation**:

- single source of truth for the 65 core relations remains the C kernel / S0 contract;
- S2 sync is build-time materialisation plus runtime audit, not a second relation generator;
- graph doctor must detect drift between S0 constants, S2 node/edge state, and M0' view expectations;
- relation registry versions must be explicit so frontmatter, Neo4j, TypeScript, and kernel mirrors can be reconciled.

Open decisions remain: GDS Option 1 vs Option 3 production choice, and Möbius/Klein Approach A vs B/C production choice.

### Python Source (Port Target)

`/Epi-Logos/Idea/Pratibimba/System/Subsystems/Parashakti/graph/` — 30 files, ~28K LOC:
- 17 production files (~14K LOC), 11 test files (~14K LOC)
- Fully functional against Neo4j 5.x + Redis 7.x with Gemini embeddings
- Key modules: coordinate_retrieval (2143), redis_cache (1810), sync_coordinator (1451), graphrag_retriever (1293)

---

## Neo4j Schema — Grounded in the HC Struct

### The Holographic Coordinate as Node Schema

The Neo4j node schema mirrors the C `Holographic_Coordinate` struct (128 bytes, `include/ontology.h`):

```cypher
// BimbaCoordinate — the universal node type
// Every node in the graph IS a coordinate
(:BimbaCoordinate {
  // === Identity (mirrors HC bytes 0-7) ===
  ql_position: INTEGER,          // 0-5 (or 255 for Hash)
  family: STRING,                // "NONE"|"C"|"P"|"L"|"S"|"T"|"M"
  inversion_state: BOOLEAN,      // false=normal, true=inverted (')
  flags: INTEGER,                // status byte (CANONICAL|PROVISIONAL|BIMBA)
  weave_state: FLOAT,            // 0.0, 0.5, 1.0 ... 5.5
  topo_mode: STRING,             // "TORUS"|"LEMNISCATE"|"KLEIN"|"ZERO_SPHERE"

  // === Tensor Anchor (mirrors HC bytes 8-15) ===
  semantic_embedding: LIST<FLOAT>,  // vector embedding (768/1536/3072 dims)

  // === Identity metadata ===
  bimbaCoordinate: STRING,       // canonical coordinate string: "#0", "P3", "M4'", "CF_TRIKA"
  name: STRING,                  // human-readable name
  uuid: STRING,                  // deterministic UUID from coordinate
  layer: STRING,                 // "PSYCHOID"|"FAMILY"|"CONTEXT_FRAME"|"WEAVE"|"VAK"

  // === Vault anchor (S1 link) ===
  vault_path: STRING,            // Obsidian file path (if materialized)

  // === S0 pithy (compression trika) ===
  s0_pithy: STRING,              // 1-liner <=128 chars from C memory

  // === Temporal ===
  created_at: DATETIME,
  updated_at: DATETIME
})
```

### Seed Data: The Full Coordinate Space

`epi graph init` seeds the complete holographic coordinate space:

#### Layer 0: The # Inversion Act (1 node)

```cypher
CREATE (:BimbaCoordinate {
  bimbaCoordinate: "#",
  name: "The Inversion Act",
  ql_position: 255,
  family: "NONE",
  layer: "PSYCHOID",
  flags: 33  // BIMBA_FLAGS = 0x21
})
```

#### Layer 1: Raw Psychoids #0-#5 (6 nodes)

```cypher
// #0 Ground, #1 Form, #2 Operation, #3 Pattern, #4 Context (Lemniscate), #5 Integration (Mobius)
UNWIND [
  {pos: 0, name: "Ground",      weave: 0.0,  topo: "ZERO_SPHERE"},
  {pos: 1, name: "Form",        weave: 1.0,  topo: "TORUS"},
  {pos: 2, name: "Operation",   weave: 2.0,  topo: "TORUS"},
  {pos: 3, name: "Pattern",     weave: 3.0,  topo: "TORUS"},
  {pos: 4, name: "Context",     weave: 4.0,  topo: "LEMNISCATE"},
  {pos: 5, name: "Integration", weave: 5.0,  topo: "ZERO_SPHERE"}
] AS p
CREATE (:BimbaCoordinate {
  bimbaCoordinate: "#" + p.pos,
  name: p.name,
  ql_position: p.pos,
  family: "NONE",
  layer: "PSYCHOID",
  weave_state: p.weave,
  topo_mode: p.topo,
  flags: 33
})
```

#### Layer 1b: 4 Weave Interleaves (4 nodes)

```cypher
// Weave_0_0 (Pure Ground implicate), Weave_0_5, Weave_5_0, Weave_5_5
UNWIND [
  {weave: 0.0, name: "Pure Ground Implicate"},
  {weave: 0.5, name: "Ground-Instance Bridge"},
  {weave: 5.0, name: "Instance-Ground Return"},
  {weave: 5.5, name: "Pure Instance Implicate"}
] AS w
CREATE (:BimbaCoordinate {
  bimbaCoordinate: "Weave_" + replace(toString(w.weave), ".", "_"),
  name: w.name,
  family: "NONE",
  layer: "WEAVE",
  weave_state: w.weave,
  flags: 33
})
```

#### Layer 1c: 7 Context Frame Roots (7 nodes)

```cypher
UNWIND [
  {id: 0, coord: "CF_VOID",       name: "Receptive Dynamism",  sig: "(00/00)", mod: "Mod%"},
  {id: 1, coord: "CF_BINARY",     name: "Non-Dual Binary",     sig: "(0/1)",   mod: "Mod2"},
  {id: 2, coord: "CF_TRIKA",      name: "The Trika",           sig: "(0/1/2)", mod: "Mod3"},
  {id: 3, coord: "CF_QUATERNAL",  name: "Three-Plus-One",      sig: "(0/1/2/3)", mod: "Mod4"},
  {id: 4, coord: "CF_FRACTAL",    name: "Fractal Doubling",    sig: "(4.0/1-4.4/5)", mod: "Mod4/6"},
  {id: 5, coord: "CF_SYNTHESIS",  name: "Mobius Synthesis",     sig: "(4.5/0)", mod: "Mod6"},
  {id: 6, coord: "CF_MOBIUS",     name: "Total Synthesis",      sig: "(5/0)",   mod: "Mod6"}
] AS cf
CREATE (:BimbaCoordinate {
  bimbaCoordinate: cf.coord,
  name: cf.name,
  ql_position: cf.id,
  family: "NONE",
  layer: "CONTEXT_FRAME",
  flags: 33
})
```

#### Layer 2: Six Coordinate Families (72 nodes: 6 families x 6 positions x 2 phases)

Each family manifests #0-#5 in its domain. Both normal and inverted (') forms:

```cypher
// Family definitions
UNWIND [
  {fam: "C", names: ["Bimba","Form","Entity","Process","Type","Pratibimba"]},
  {fam: "P", names: ["Ground","Definition","Operation","Pattern","Context","Integration"]},
  {fam: "L", names: ["Literal","Functional","Structural","Archetypal","Paradigmatic","Integral"]},
  {fam: "S", names: ["Terminal","Obsidian","Neo4j","Gateway","PiAgent","Sync"]},
  {fam: "T", names: ["Questions","Traces","Challenges","Patterns","Discovery","Insight"]},
  {fam: "M", names: ["Anuttara","Paramasiva","Parashakti","Mahamaya","Nara","Epii"]}
] AS f
UNWIND range(0, 5) AS pos
UNWIND [false, true] AS inv
CREATE (:BimbaCoordinate {
  bimbaCoordinate: f.fam + pos + CASE WHEN inv THEN "'" ELSE "" END,
  name: f.names[pos] + CASE WHEN inv THEN " (Inverted)" ELSE "" END,
  ql_position: pos,
  family: f.fam,
  inversion_state: inv,
  layer: "FAMILY",
  topo_mode: CASE
    WHEN inv THEN "KLEIN"
    WHEN pos = 4 THEN "LEMNISCATE"
    WHEN pos IN [0,5] THEN "ZERO_SPHERE"
    ELSE "TORUS"
  END,
  flags: CASE WHEN inv THEN 1 ELSE 33 END
})
```

#### Layer 3: VAK Reflective Coordinates (6 nodes)

```cypher
UNWIND [
  {idx: 0, coord: "CPF", name: "Category-Position-Frame"},
  {idx: 1, coord: "CT",  name: "Context-Time / Content Types"},
  {idx: 2, coord: "CP",  name: "Context-Position"},
  {idx: 3, coord: "CF",  name: "Context-Frame"},
  {idx: 4, coord: "CFP", name: "Context-Frame-Position / Paths"},
  {idx: 5, coord: "CS",  name: "Context-Sequence"}
] AS v
CREATE (:BimbaCoordinate {
  bimbaCoordinate: v.coord,
  name: v.name,
  ql_position: v.idx,
  family: "NONE",
  layer: "VAK",
  flags: 33
})
```

**Total seed: ~96 nodes** (1 Hash + 6 psychoids + 4 weaves + 7 CFs + 72 family coords + 6 VAK)

### Relationship Types

#### The 16-Fold Intra-Openness (HC Struct Pointer Web)

Each HC has 12 tagged pointers (6 base + 6 reflective). These become Neo4j relationships:

```cypher
// Base family links (from the c,p,l,s,t,m pointer fields)
-[:FAMILY_LINK {family: "C"}]->    // coordinate.c pointer
-[:FAMILY_LINK {family: "P"}]->    // coordinate.p pointer
-[:FAMILY_LINK {family: "L"}]->    // coordinate.l pointer
-[:FAMILY_LINK {family: "S"}]->    // coordinate.s pointer
-[:FAMILY_LINK {family: "T"}]->    // coordinate.t pointer
-[:FAMILY_LINK {family: "M"}]->    // coordinate.m pointer

// Reflective coordinate links (from the cpf,ct,cp,cf,cfp,cs pointer fields)
-[:REFLECTS_VIA {vak: "CPF"}]->    // coordinate.cpf pointer
-[:REFLECTS_VIA {vak: "CT"}]->     // coordinate.ct pointer
-[:REFLECTS_VIA {vak: "CP"}]->     // coordinate.cp pointer
-[:REFLECTS_VIA {vak: "CF"}]->     // coordinate.cf pointer (-> #4 anchor)
-[:REFLECTS_VIA {vak: "CFP"}]->    // coordinate.cfp pointer
-[:REFLECTS_VIA {vak: "CS"}]->     // coordinate.cs pointer
```

#### Context Frame Relationships (CF as relational reality of # and #0-#5)

Context frames express HOW psychoids relate, not just THAT they relate:

```cypher
// Each CF captures a specific modality of relation among the psychoids
-[:FRAMES {cf: "CF_VOID"}]->         // (00/00) — pre-differential ground
-[:FRAMES {cf: "CF_BINARY"}]->       // (0/1) — non-dual binary
-[:FRAMES {cf: "CF_TRIKA"}]->        // (0/1/2) — User-Agent-Code
-[:FRAMES {cf: "CF_QUATERNAL"}]->    // (0/1/2/3) — Media-Medium-Method
-[:FRAMES {cf: "CF_FRACTAL"}]->      // (4.0/1-4.4/5) — fractal doubling
-[:FRAMES {cf: "CF_SYNTHESIS"}]->    // (4.5/0) — Mobius synthesis
-[:FRAMES {cf: "CF_MOBIUS"}]->       // (5/0) — total return

// The invariant: ALL CFs anchor to #4 via their .cf field
MATCH (cf:BimbaCoordinate {layer: "CONTEXT_FRAME"})
MATCH (p4:BimbaCoordinate {bimbaCoordinate: "#4"})
CREATE (cf)-[:ANCHORED_TO]->(p4)
```

#### Position-Based Relationships (P-family semantic edges)

```cypher
-[:POS0_LINKS_TO]->         // P0 Ground: raw connections
-[:POS1_DEFINES]->           // P1 Definition: formal definition
-[:POS2_OPERATES_VIA]->      // P2 Operation: method/process
-[:POS3_INSTANTIATES]->      // P3 Pattern: template/archetype
-[:POS4_SITUATED_IN]->       // P4 Context: contextual placement
-[:POS5_INTEGRATES_INTO]->   // P5 Integration: synthesis

// Bidirectional inverses
-[:POS0_LINKED_FROM]->
-[:POS1_DEFINED_BY]->
-[:POS2_OPERATED_BY]->
-[:POS3_INSTANTIATED_BY]->
-[:POS4_SITUATES]->
-[:POS5_INTEGRATED_FROM]->
```

#### Structural Relationships

```cypher
-[:MANIFESTS]->              // Psychoid -> Family coordinate (#0 -> C0, P0, L0...)
-[:INVERTS_TO]->             // Normal -> Inverted (P3 -> P3')
-[:BEDROCK]->                // Family coord -> its raw psychoid source
-[:RESIDES_IN]->             // Coordinate -> vault path (S1 link)
-[:PRODUCED_IN]->            // Artifact -> Session
```

### Constraints and Indexes

```cypher
// Uniqueness
CREATE CONSTRAINT bimba_coord_unique FOR (n:BimbaCoordinate) REQUIRE n.bimbaCoordinate IS UNIQUE;
CREATE CONSTRAINT bimba_uuid_unique FOR (n:BimbaCoordinate) REQUIRE n.uuid IS UNIQUE;

// Indexes for coordinate retrieval
CREATE INDEX coord_family FOR (n:BimbaCoordinate) ON (n.family);
CREATE INDEX coord_position FOR (n:BimbaCoordinate) ON (n.ql_position);
CREATE INDEX coord_layer FOR (n:BimbaCoordinate) ON (n.layer);
CREATE INDEX coord_topo FOR (n:BimbaCoordinate) ON (n.topo_mode);
CREATE INDEX coord_vault_path FOR (n:BimbaCoordinate) ON (n.vault_path);

// Vector index for semantic search
CREATE VECTOR INDEX coord_embedding FOR (n:BimbaCoordinate) ON (n.semantic_embedding)
OPTIONS {indexConfig: {
  `vector.dimensions`: 768,
  `vector.similarity_function`: 'cosine'
}};
```

---

## Redis Schema — Cache Tiers + Session Scoping

### Cache Temperature Model

Tiering is by **artifact role + volatility**, not path alone:

| Tier | TTL | Scope | Key Pattern | Contents |
|------|-----|-------|-------------|----------|
| **HOT** | 300s | Active session | `cache:hot:{path}` | Active Day/NOW, session metadata |
| **WARM** | 3600s | Recent ops | `cache:warm:thought:T{0-5}/*` | Thought artifacts, recent extractions |
| **COLD** | 86400s | Canonical | `cache:cold:bimba:{path}` | Bimba/World canonical forms |

### Session-Scoped Keys

```
session:{session_id}:now:md              // Session NOW content
session:{session_id}:now:meta            // Session metadata (coordinates, day link)
session:{session_id}:coord:{bimbaCoord}  // Per-coordinate session state
```

### CF-Signature Isolation (Parallel Agent Support)

```
cf:{cf_signature}:coord:{bimbaCoord}     // CF-isolated coordinate exploration
cf:{cf_signature}:query:{hash}           // CF-isolated query cache
```

This enables parallel agents (15-agent swarm) to explore different semantic trajectories simultaneously without polluting each other's state.

### Coordinate Cache Keys

```
coord:{bimbaCoordinate}                  // Direct coordinate lookup cache
vec:{bimbaCoordinate}                    // Vector embedding cache
```

---

## Docker Infrastructure

### `docker-compose.epi-s2.yml`

```yaml
version: "3.9"
services:
  neo4j:
    image: neo4j:5-community
    container_name: epi-neo4j
    ports:
      - "7474:7474"   # HTTP browser
      - "7687:7687"   # Bolt protocol
    environment:
      NEO4J_AUTH: neo4j/epi-logos-dev
      NEO4J_PLUGINS: '["apoc"]'
      NEO4J_dbms_security_procedures_unrestricted: apoc.*
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs

  redis:
    image: redis:7-alpine
    container_name: epi-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  neo4j-data:
  neo4j-logs:
  redis-data:
```

### Environment Variables

```
EPILOGOS_NEO4J_URI=bolt://localhost:7687
EPILOGOS_NEO4J_USER=neo4j
EPILOGOS_NEO4J_PASSWORD=epi-logos-dev
EPILOGOS_NEO4J_DATABASE=neo4j
EPILOGOS_REDIS_URI=redis://localhost:6379
```

---

## Coordinate Retrieval — Full System Awareness

The retrieval engine must understand and parse the complete coordinate space:

### Coordinate Notation Parser

```
#              -> layer=PSYCHOID, the Hash (inversion act)
#0-#5          -> layer=PSYCHOID, position 0-5
Weave_0_0      -> layer=WEAVE
CF_VOID..CF_MOBIUS -> layer=CONTEXT_FRAME, id 0-6
C0-C5, P0-P5, L0-L5, S0-S5, T0-T5, M0-M5 -> layer=FAMILY, normal
C0'-C5', P0'-P5'... -> layer=FAMILY, inverted
CPF,CT,CP,CF,CFP,CS -> layer=VAK
```

### Query Types

```
epi graph query "#4"                   -- single coordinate lookup
epi graph query "P3,M4'"              -- multi-coordinate (AND)
epi graph query --family T             -- all T-family coordinates
epi graph query --cf CF_TRIKA          -- all coordinates in CF(0/1/2) frame
epi graph query-context "M2.4'" --depth 2  -- 2-hop neighborhood
epi graph search-semantic "career decision" -- vector similarity
epi graph traverse --from "#0" --via POS0_LINKS_TO --depth 3  -- relationship traversal
```

### Progressive Disclosure (6 Levels)

| Level | Fields Returned |
|-------|----------------|
| 0 | `bimbaCoordinate`, `uuid` only |
| 1 | + `name`, `family`, `ql_position`, `vault_path` |
| 2 | + `s0_pithy`, position arrays |
| 3 | + content summary, frontmatter |
| 4 | + connected entities (1-hop) |
| 5 | Complete: all properties, all relationships, embedding |

### Hybrid Retrieval (RRF Fusion)

```
Mode: VECTOR_ONLY | GRAPH_ONLY | HYBRID_RRF | HYBRID_WEIGHTED

RRF formula: RRF(d) = SUM(1 / (k + rank(d)))
Default k=60, coordinate_boost=1.5x
```

---

## Python -> Rust Port Map

| Python File | LOC | Rust Target | Status |
|-------------|-----|-------------|--------|
| `client.py` | 349 | `client.rs` | STUB -> real neo4rs |
| `mapper.py` | 303 | `mapper.rs` | MINIMAL -> full vault ontology |
| `coordinate_array_parser.py` | 652 | `coordinate_array_parser.rs` | DONE (basic), extend for full notation |
| `alignment_validator.py` | 1033 | `alignment_validator.rs` | DONE (basic), extend for reconciliation |
| `relationship_manager.py` | 1134 | `relationship_manager.rs` | STUB -> POS0-POS5 + bidirectional |
| `coordinate_retrieval.py` | 2143 | `retrieval/coordinate.rs` | STUB -> full multi-coordinate |
| `hybrid_retrieval.py` | 874 | `retrieval/hybrid.rs` | STUB -> RRF fusion |
| `graphrag_retriever.py` | 1293 | `retrieval/graphrag.rs` | STUB -> progressive disclosure |
| `embeddings.py` | 598 | `embeddings.rs` | STUB -> Gemini API |
| `redis_cache.py` | 1810 | `redis_cache.rs` | STUB -> real redis + tier model |
| `link_enforcement.py` | 1117 | `link_enforcement.rs` | STUB -> wiki-link validation |
| `sync.py` | 391 | `sync.rs` | STUB -> file event handlers |
| `sync_coordinator.py` | 1451 | `sync_coordinator.rs` | STUB -> hash-based change detection |
| `sync_orchestrator.py` | 474 | `sync_orchestrator.rs` | STUB -> full workflow |
| `bidirectional_sync.py` | 1105 | `bidirectional_sync.rs` | STUB -> 6 conflict strategies |

---

## Implementation Plan

### Phase 1: Docker + Rust Clients

- Create `docker-compose.epi-s2.yml` (Neo4j 5.x + Redis 7.x)
- Add `neo4rs`, `redis`, `tokio`, `reqwest` to Cargo.toml
- Implement real `client.rs` (connection pool, health check, Cypher execution)
- Implement real `redis_cache.rs` (connection, get/set, TTLs, tier keys)
- `epi graph status` — live health check for both backends
- `epi graph up` / `epi graph down` — Docker lifecycle
- `epi graph bootstrap-dev` — one-command local bootstrap for Docker services plus RedisVL Python service setup
- `epi graph doctor` — deeper health report covering Neo4j, Redis Stack, RedisVL bridge readiness, graph metadata, and semantic index drift

### Phase 2: Schema Bootstrap + Seed

- `epi graph init` — create constraints, indexes, vector index
- Seed full coordinate space (~96 nodes): #, #0-#5, weaves, CFs, all families + inversions, VAK
- Create structural relationships: MANIFESTS, BEDROCK, INVERTS_TO, ANCHORED_TO
- Wire 16-fold intra-openness as FAMILY_LINK and REFLECTS_VIA edges
- Validate: every seeded node matches its HC struct counterpart

### Phase 3: Coordinate CRUD + Parser

- Extend coordinate parser for full notation (#, #0-#5, families, inversions, CFs, VAK)
- `epi graph upsert` — coordinate-validated node creation (S0' validation gate)
- `epi graph query` — single/multi-coordinate lookup
- `epi graph query-context` — depth-N neighborhood retrieval
- `epi graph translate` — bidirectional coordinate <-> semantic translation

### Phase 4: Relationship Manager + Link Enforcement

- Port POS0-POS5 relationship types with bidirectional inverses
- Port wiki-link validation and sunya candidate detection
- Port alignment validator (property <-> relationship reconciliation)
- `epi graph relate` — create position-based relationships

### Phase 5: Retrieval Engine

- Port coordinate retrieval (multi-coordinate filtering, traversal, scoring)
- Port hybrid retrieval (RRF fusion, vector + graph parallel queries)
- Port progressive disclosure (6-level depth control)
- Port GraphRAG retriever (NL query classification, context modes)

### Phase 6: Embeddings + Vector Arena

- Gemini API client (768/1536/3072 dims, task-aware)
- Vector storage in Neo4j vector index
- Similarity search via `epi graph search-semantic`
- Coordinate anchoring enforcement (every vector -> valid coordinate)
- Drift-aware indexing: only changed nodes and relation-dependent neighbors are re-embedded
- `epi graph doctor` surfaces stale semantic counts, indexed-node counts, and metadata/version alignment

### Phase 7: Sync Engine

- Port file event handlers (created/modified/deleted/renamed)
- Port sync coordinator (hash-based change detection)
- Port bidirectional sync (6 conflict strategies)
- Wire S1 vault mutations -> S2 graph upserts
- Wire Redis-backed S3' gateway temporal events through the S3 runtime substrate, without collapsing them into the S2 graph semantic-cache namespace

### Phase 8: n10s / GDS / Topology Enrichment

- Add neosemantics import/export for the `epi:` ontology, including `symbol` and `formulation_type`.
- Add graph doctor checks for OWL2 RL reasoning readiness and relation-characteristic drift.
- Add FastRP, personalised PageRank, node similarity, Louvain, and K-NN projection jobs with privacy-safe result payloads.
- Implement Option 1 two-phase GDS projection first; keep Option 3 as an explicit enrichment decision.
- Implement Approach A Möbius/Klein preprocessing first; keep custom walks and dual embeddings as deferred production choices.
- Add C kernel ↔ Neo4j sync audit for the 65 core relation laws.

---

## Authority Documents

- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` (GraphRAG combined substrate)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-21-epii-corpus-ingestion-design.md` (Corpus pipeline, T-coordinate chunking)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S2/S2' module definition)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-27-fr-layer-assignment-full.md` (Cache tier ownership, FR-12)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-28-coordinate-type-system-and-reflection-families.md` (Coordinate type system)
- `docs/plans/2026-02-28-t-coordinate-paradigmatic-conception.md` (T-family canonical names + Deleuze grounding)
- `include/ontology.h` (HC struct — the canonical schema source)
- `include/psychoid_numbers.h` (Psychoid + CF + Weave declarations)
- `include/vak.h` (VAK instruction set — reflective coordinate operations)

## Verification Additions

- Tests prove `symbol` and `formulation_type` round-trip from S2 node properties through the M0' inspector without renderer invention.
- Tests prove GDS overlay payloads are generated from real Neo4j/GDS projections or controlled local graph fixtures, not mock-only data.
- Tests prove private Graphiti/Nara episode bodies do not enter canonical GDS projections.
- Tests prove kernel relation registry versions match Neo4j relation materialisation, with drift surfaced by graph doctor.
