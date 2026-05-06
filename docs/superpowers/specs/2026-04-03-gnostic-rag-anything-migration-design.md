# Gnostic Namespace: RAG-Anything Migration Design

**Status:** Approved
**Date:** 2026-04-03
**Approach:** Pure LightRAG Extension (Approach 1)

---

## Summary

Replace the Docling + custom Gnosis ingestion pipeline with RAG-Anything (built on LightRAG), storing all knowledge graph entities and embeddings in Neo4j under a `gnostic` workspace namespace. A custom `Neo4JVectorDBStorage` adapter enables unified graph + vector storage in a single Neo4j instance. Cross-namespace linking to the existing Bimba coordinate map uses two distinct mechanisms: direct canonical assignment (`bimba_coordinate`) and LLM-classified resonance (`bimba_resonances`).

---

## Provider Stack

| Function | Provider | Model |
|----------|----------|-------|
| Embeddings (3072-dim, multimodal) | Google Gemini | `gemini-embedding-2-preview` |
| LLM (entity extraction, resonance classification) | Google Gemini | `gemini-3.1-flash-lite` |
| Vision (tables, images, equations) | Google Gemini | `gemini-3.1-flash-lite` |
| Document parsing | MinerU | MinerU core (no Docling, no fallback) |
| Graph + Vector storage | Neo4j 5.26 | Single instance, vector-2.0 provider |

---

## Data Model

### Neo4j Node Schema (Gnostic Namespace)

Every entity extracted by LightRAG gets:

```
Labels:  :gnostic  :M  (or :S, :P, :T, :L, :C, :UNASSIGNED)
         + entity_type as additional label (LightRAG standard)
```

**Properties (LightRAG standard):**

| Property | Type | Source |
|----------|------|--------|
| `entity_id` | string | LightRAG extraction |
| `entity_type` | string | LightRAG extraction (becomes additional label) |
| `description` | string | LLM-extracted |
| `source_id` | string | Chunk IDs (pipe-separated) |
| `file_path` | string | Source document path |
| `embedding` | float[] | 3072-dim from gemini-embedding-2-preview |

**Properties (Epi-Logos coordinate layer):**

| Property | Type | Source |
|----------|------|--------|
| `bimba_coordinate` | string or null | Direct assignment at ingest time (e.g. `"M4-3"`) — canonical docs only |
| `bimba_resonances` | string[] | LLM post-ingestion classification (e.g. `["M1", "P3", "C5"]`) |
| `coordinate_family` | string | Primary family: `"M"`, `"S"`, `"P"`, `"T"`, `"L"`, `"C"`, `"#"` |
| `assignment_method` | string | `"direct"`, `"llm_classified"`, or `"unassigned"` |

### Cross-Namespace Edges

```cypher
-- Canonical assignment (1:1, direct)
(g:gnostic)-[:MAPS_TO_COORDINATE {confidence: 1.0, method: "direct"}]->(b:BimbaCoordinate)

-- Resonance (many:many, LLM-classified with confidence)
(g:gnostic)-[:RESONATES_WITH {confidence: 0.75, method: "llm_classified"}]->(b:BimbaCoordinate)
```

### Vector Indexes

```cypher
-- Gnostic entities (new)
CREATE VECTOR INDEX gnostic_embedding FOR (n:gnostic) ON n.embedding
OPTIONS { indexConfig: {
  `vector.dimensions`: 3072,
  `vector.similarity_function`: 'cosine',
  `vector.hnsw.m`: 16,
  `vector.hnsw.ef_construction`: 200,
  `vector.quantization.enabled`: true
}}

-- Bimba coordinates (MIGRATE from 768 → 3072, re-embed with gemini-embedding-2-preview)
DROP INDEX coord_embedding;
CREATE VECTOR INDEX coord_embedding FOR (n:BimbaCoordinate) ON n.semantic_embedding
OPTIONS { indexConfig: {
  `vector.dimensions`: 3072,
  `vector.similarity_function`: 'cosine',
  `vector.hnsw.m`: 16,
  `vector.hnsw.ef_construction`: 200,
  `vector.quantization.enabled`: true
}}
```

Both at 3072-dim enables direct cross-namespace similarity queries.

---

## Neo4JVectorDBStorage Adapter

Custom implementation of LightRAG's `BaseVectorStorage` interface. Single file, not a fork.

**File:** `epi-gnostic/storage/neo4j_vector.py`

**Interface contract:**

| Method | Implementation |
|--------|---------------|
| `upsert(data)` | `UNWIND` batch (500/tx), `MERGE` on entity_id, `db.create.setNodeVectorProperty()` |
| `query(query_text, top_k, query_embedding)` | `db.index.vector.queryNodes()` with cosine threshold |
| `delete_entity(name)` | `MATCH (n:gnostic {entity_id: $name}) DETACH DELETE n` |
| `delete_entity_relation(name)` | Delete relation vectors by source entity |
| `index_done_callback()` | No-op (Neo4j indexes update automatically) |
| `drop()` | Drop vector index + delete all `:gnostic` nodes |

**Key decisions:**
- Embeddings stored via `db.create.setNodeVectorProperty()` (storage-efficient)
- Batch upserts: 500 items per transaction via `UNWIND`
- Two vector indexes: `gnostic_entity_embedding` + `gnostic_relation_embedding`
- Shares Neo4j driver instance with graph storage (single connection pool)
- Registered in LightRAG's `STORAGE_IMPLEMENTATIONS["VECTOR_STORAGE"]` at init time

**Unified query pattern (vector + graph in one Cypher):**
```cypher
CALL db.index.vector.queryNodes('gnostic_entity_embedding', $top_k, $query_vector)
YIELD node, score
WHERE score >= $threshold
OPTIONAL MATCH (node)-[:MAPS_TO_COORDINATE|RESONATES_WITH]->(b:BimbaCoordinate)
RETURN node.entity_id, node.description, node.bimba_coordinate,
       score, collect(b.bimbaCoordinate) AS linked_coordinates
```

---

## Ingestion Pipeline

### Path 1: Canonical Document (direct coordinate assignment)

```bash
epi gnosis ingest paper.pdf --coordinate M4-3 --family M
```

1. RAG-Anything parses (MinerU multimodal) → content list
2. LightRAG extracts entities + embeddings → Neo4j gnostic namespace
3. All entities from this doc get `bimba_coordinate="M4-3"`, `coordinate_family="M"`, `assignment_method="direct"`, secondary label `:M`
4. Cross-namespace edge: `MAPS_TO_COORDINATE` → matching BimbaCoordinate node
5. LLM resonance classification still runs — populates `bimba_resonances` for secondary connections

### Path 2: Resonance-only Document (LLM classifies)

```bash
epi gnosis ingest lecture-notes.pdf --family M
```

1. Parse + extract (same)
2. `bimba_coordinate=null`, `coordinate_family="M"`, `assignment_method="llm_classified"`
3. Post-ingestion LLM pass: entity descriptions + Bimba taxonomy → resonance list with confidence
4. `bimba_resonances=["M1", "M3", "P2"]`, edges: `RESONATES_WITH`

### Path 3: Unassigned Document

```bash
epi gnosis ingest random-paper.pdf
```

1. Parse + extract
2. `bimba_coordinate=null`, `coordinate_family="#"`, `assignment_method="unassigned"`, label `:UNASSIGNED`
3. Resonance classification still runs
4. User can reclassify later: `epi gnosis assign <entity_id> --coordinate S2`

### Post-Ingestion Enrichment (shared)

Async function after every ingest batch:

1. **Resonance classification** — batch entities to Gemini with Bimba coordinate descriptions → coordinate resonances + confidence scores
2. **Cross-namespace edges** — create `MAPS_TO_COORDINATE` / `RESONATES_WITH` edges
3. **Family label application** — add `:M`, `:S`, `:P` etc. as secondary Neo4j labels

---

## Deprecation

### Remove completely:
- `docling-serve` service from `docker-compose.epi-s2.yml`
- `epi-cli/src/techne/gnosis/docling_client.rs`
- Any Docling-related environment variables (`EPILOGOS_DOCLING_URI`)

### Replace:
- `epi-cli/src/techne/gnosis/ingest.rs` — rewire to call Python RAG-Anything wrapper
- `epi-cli/src/techne/gnosis/chunker.rs` — LightRAG handles chunking internally
- `epi-cli/src/techne/gnosis/query.rs` — rewire to LightRAG query modes

### Keep:
- `epi-cli/src/techne/gnosis/mod.rs` — module shell, rewired commands
- `epi-cli/src/techne/gnosis/config.rs` — updated for new env vars

---

## Bimba Vector Migration

Upgrade existing 96 BimbaCoordinate nodes from 768-dim to 3072-dim:

1. Drop `coord_embedding` index
2. Re-embed all 96 nodes using `gemini-embedding-2-preview` (concatenate name + description fields)
3. Write new embeddings via `db.create.setNodeVectorProperty()`
4. Recreate index at 3072-dim

Small batch (96 nodes) — single script, runs in seconds.

---

## File Structure

```
epi-gnostic/                          ← New Python package
├── __init__.py
├── storage/
│   ├── __init__.py
│   └── neo4j_vector.py              ← Custom Neo4JVectorDBStorage
├── enrichment/
│   ├── __init__.py
│   ├── coordinator.py               ← Post-ingestion coordinate assignment
│   └── prompts.py                   ← Resonance classification prompts
├── config.py                         ← Gemini keys, Neo4j URI, workspace config
├── wrapper.py                        ← RAGAnything init + convenience functions
└── migrate_bimba_embeddings.py       ← One-shot 768→3072 migration script

# RAG-Anything installed via: pip install raganything (not vendored)
```

---

## Configuration

```env
# Neo4j (existing)
NEO4J_URI=bolt://localhost:7687
NEO4J_DATABASE=neo4j

# Gemini
GEMINI_API_KEY=...

# Gnostic namespace
GNOSTIC_WORKSPACE=gnostic
GNOSTIC_WORKING_DIR=~/.epi-logos/gnostic/
GNOSTIC_EMBEDDING_DIM=3072
GNOSTIC_EMBEDDING_MODEL=gemini-embedding-2-preview
GNOSTIC_LLM_MODEL=gemini-3.1-flash-lite
```
