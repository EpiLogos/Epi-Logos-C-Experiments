# Epii Corpus Ingestion Pipeline — Design Document

**Date:** 2026-02-21
**Coordinate:** M5' (Epii' — Knowledge Work Engine)
**Plugin:** epi-logos (next plugin, MX' coordinate layer)
**Module:** `epi-logos/modules/epii/corpus/`
**Status:** Design approved, pending implementation plan

---

## 1. Context & Motivation

### Where This Lives

The **epi-logos plugin** is the next plugin after ta-onta, targeting the **MX' coordinate layer** — the Pratibimba/reflected dimension that bridges epi-claw to the Electron app. Within that plugin, the **epii module** (M5') is the Knowledge Work Engine: the integration layer where external knowledge enters the Bimba graph.

This corpus ingestion pipeline is the foundational capability of the epii module — the ingestion end of what the early epii_app implemented as a full 6-stage analysis pipeline. Here we build the durable, properly-architected ingestion layer that the subsequent analysis and synthesis stages will build upon.

### What We're Solving

The Epi-Logos system has a rich coordinate-structured Neo4j graph (Bimba map) but no pipeline for ingesting the *source materials* that the coordinates reference — canonical texts, philosophical source books, and conversation records. These materials currently exist only as external files with no structured, queryable, coordinatized presence in the knowledge graph.

### Source Material Types

| Type | Examples | Parser |
|------|----------|--------|
| **Books** | Tantraloka, Spanda-Karikas, Malinivijayottara | docling |
| **Canonical** | QL-COORDINATE-MAP, Bimba seed files, coordinate definitions | docling (markdown passthrough) |
| **SourceTexts** | Academic papers, etymological references | docling |
| **ChatLogs** | Conversation sessions (user + agent turns) | turn-splitter |

---

## 2. Architecture

### Data Flow

```
Source file (PDF / DOCX / EPUB / MD / chat log)
  │
  ▼
PARSE
  docling DocumentConverter    ← structured docs
  turn-splitter                ← chat logs (per-turn chunking)
  │
  ▼
CONTEXTUALIZE  (Anthropic contextual RAG)
  for each raw chunk:
    Gemini Flash (free) → 1-2 sentence situating context
    final_text = "{context}\n\n{raw_chunk}"
  │
  ▼
EMBED
  existing Gemini embed client (epi-claw memory tools)
  dimension: 1536
  │
  ▼
STORE
  Neo4j: find existing T1Document node (Hen-synced) → write T1Chunk children
  (T1 folder already IS the library; Hen sync manages T1Document lifecycle)
```

### No Separate Server

Tools are registered as **first-class pi agent tools** via the epi-logos plugin's tool registration — same mechanism as Hen's `hybrid_retrieve`, `kbase_search`, etc. No separate MCP server or HTTP layer.

### Relationship to Existing Systems

| System | Role |
|--------|------|
| **Hen (S3-1')** | Manages T1Document node lifecycle via vault sync; provides `hybrid_retrieve` / `kbase_search` that extend naturally to T1Chunk |
| **Parashakti (M2')** | Existing Neo4j client + `hybrid_retrieval.py` (RRF fusion) — corpus query reuses this |
| **Anuttara (M0')** | `ql_type_api.py` — coordinate validation for chunk frontmatter |
| **Aletheia (S3-5')** | Consumer — calls `corpus_query` during Night' evidence gathering phases |

---

## 3. Chunking Strategy — Anthropic Contextual RAG

Standard fixed-size chunking loses document structure and context. The Anthropic contextual retrieval approach situates each chunk within its source before embedding, significantly improving retrieval precision.

### Algorithm

```python
CONTEXT_PROMPT = """
<document>
{whole_document_content}
</document>

Here is the chunk we want to situate within the above document:

<chunk>
{chunk_content}
</chunk>

Give a short succinct context (1-2 sentences) to situate this chunk within
the overall document for search retrieval purposes. Answer only with the
succinct context and nothing else.
"""

def contextualize_chunk(whole_doc: str, chunk: str) -> str:
    context = gemini_flash(CONTEXT_PROMPT.format(
        whole_document_content=whole_doc,
        chunk_content=chunk
    ))
    return f"{context}\n\n{chunk}"
```

**Model:** Gemini Flash (free, per LLM hierarchy rule — bulk contextualization is exactly this tier's use case)
**Embedding:** Existing Gemini embed client from epi-claw memory tools (1536-dim)

### Chat Log Chunking

Chat logs are turn-based: each turn = one chunk. Turn boundaries are natural semantic units — no fixed-size splitting needed.

```python
# Contextual prefix for chat turns
CHAT_CONTEXT = (
    "In a conversation between {speakers}, "
    "this is turn {turn_index} of {total_turns}. "
    "Speaker: {speaker}."
)
```

Speaker metadata and turn_index are preserved as chunk properties.

---

## 4. Neo4j Schema

### Additive — Builds on Hen-Synced T1Document Nodes

The T1 directory IS the library. Hen already syncs T1 folder contents to Neo4j as T1Document nodes with coordinate relationships to the Bimba map. The corpus pipeline adds T1Chunk nodes as children of these existing nodes.

```cypher
-- Already exists (managed by Hen):
(:T1Document {
  uuid, title, path, coordinate,
  raw_content, ...
})
-[:pos_m_relates_to]->(:BimbaNode)   -- already mapped to Bimba graph

-- New (added by corpus pipeline):
(:T1Chunk {
  uuid,
  raw_content,            -- original chunk text
  contextual_content,     -- context prefix + raw_content (embedded form)
  embedding,              -- float[1536] — vector search
  chunk_index,            -- position in document (0-based)
  total_chunks,           -- total chunks in source document
  section_heading,        -- from docling structural parse (null for chat)
  speaker,                -- "user" | "agent" | null (chat logs only)
  turn_index,             -- position in conversation (chat logs only)
  source_type,            -- Books | Canonical | SourceTexts | ChatLogs
  coordinate              -- inherited from parent T1Document
})
```

### Relationships

```cypher
-- Core chunk linkage:
(:T1Document)-[:pos_t_has_chunk]->(:T1Chunk)
(:T1Chunk)-[:pos_t_extracted_from]->(:T1Document)

-- Progressive coordinate deepening (added over time as analysis matures):
(:T1Chunk)-[:pos_m_relates_to]->(:BimbaNode)
```

The chunks start with only the parent relationship and inherit coordinate context from the T1Document's existing Bimba edges. Specific chunk-level coordinate alignments are added progressively as cluster analysis and deeper analysis stages run — not forced upfront.

### Vector Index

```cypher
CREATE VECTOR INDEX t1chunk_embeddings
FOR (n:T1Chunk) ON n.embedding
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}
```

Query pattern (extends Parashakti hybrid_retrieval scope):
```cypher
CALL db.index.vector.queryNodes('t1chunk_embeddings', $top_k, $query_embedding)
YIELD node AS chunk, score
MATCH (chunk)<-[:pos_t_has_chunk]-(doc:T1Document)
RETURN chunk, doc, score
```

---

## 5. Tool Surface (Pi Agent)

Three tools registered in the epi-logos plugin:

### `corpus_ingest`

Ingest a structured document (PDF, DOCX, EPUB, MD) into the T1 corpus.

```typescript
interface CorpusIngestInput {
  file_path: string;          // absolute path to source file
  coordinate: string;         // e.g. "M5", "M1-3", "M2"
  source_type: "Books" | "Canonical" | "SourceTexts";
  author?: string;            // optional, for Books
  title?: string;             // optional override (else derived from file)
}
```

**Pipeline:** parse → contextualize chunks → embed → find/create T1Document in Neo4j → write T1Chunk nodes

### `corpus_ingest_chat`

Ingest a chat log session as turn-level chunks.

```typescript
interface CorpusIngestChatInput {
  session_id: string;         // conversation session identifier
  platform: "claude" | "chatgpt" | "gemini" | "custom";
  coordinate: string;         // primary coordinate this conversation relates to
  log_path?: string;          // if already extracted to file
  raw_turns?: Turn[];         // or provide turns directly
}

interface Turn {
  speaker: "user" | "agent";
  content: string;
  turn_index: number;
  timestamp?: string;
}
```

### `corpus_query`

Semantic + graph retrieval over T1Chunk nodes.

```typescript
interface CorpusQueryInput {
  query: string;              // natural language query
  coordinate?: string;        // optional coordinate filter
  source_type?: string;       // optional type filter
  top_k?: number;             // default 5
  include_context?: boolean;  // return full T1Document metadata with chunks
}
```

---

## 6. Module File Structure

```
epi-logos/
  modules/
    epii/
      corpus/
        core/
          ingester.py         ← docling DocumentConverter wrapper
          chunker.py          ← HybridChunker + contextual RAG pass
          embedder.py         ← thin wrapper over existing epi-claw embed client
          neo4j_store.py      ← T1Chunk CRUD, extends Parashakti client
          turn_splitter.py    ← chat log → Turn[] → chunk pipeline
        tools/
          corpus_ingest.py    ← tool handler: structured docs
          corpus_ingest_chat.py  ← tool handler: chat logs
          corpus_query.py     ← tool handler: retrieval
        cli.py                ← batch CLI for bulk ingestion
        __init__.py
      __init__.py
```

**Python dependencies:**
```
docling              ← IBM document parsing (PDF, DOCX, EPUB, HTML, MD)
neo4j                ← driver (already in Parashakti)
google-generativeai  ← Gemini Flash (contextualization) + embed client (already in epi-claw)
```

---

## 7. Integration Points & Consumers

### How Hen Sync Interacts

Hen's vault sync creates `:T1Document` nodes from T1-typed files in the Obsidian vault. The corpus pipeline treats these as the authoritative parent nodes — it **finds** them by path/coordinate rather than creating them independently. If a T1Document doesn't exist yet (e.g., a PDF not in the vault), the pipeline creates it as a minimal node and flags it for Hen to enrich on next sync.

### How Aletheia Consumes

During Night' evidence gathering phases, Aletheia's Klotho (P1' Traces: "What evidence exists?") calls `corpus_query` to find relevant passages from source texts. The corpus becomes the evidentiary substrate for alignment validation and learning proposals.

### How Parashakti's Hybrid Retrieval Extends

`hybrid_retrieval.py`'s existing RRF fusion (vector + graph + BM25) extends naturally to include `:T1Chunk` nodes in its query scope. The coordinate filter already in the retrieval logic means corpus chunks surface appropriately alongside Bimba nodes when coordinate-filtered queries run.

---

## 8. Progressive Deepening

The design intentionally starts simple and deepens over time:

| Phase | What gets added |
|-------|----------------|
| **Phase 1 (this)** | Raw chunks linked to T1Document; vector search live |
| **Phase 2** | GraphRAG pass: entity extraction from chunks → `:T1Entity` nodes, `pos_t_*` edges |
| **Phase 3** | Cluster analysis: chunk co-occurrence → `pos_m_relates_to` BimbaNode edges on high-confidence chunks |
| **Phase 4** | Analysis pipeline (from epii_app stages -4 through -0): deeper semantic alignment, Notion crystallization |

Phases 2-4 are not in scope for this pipeline — they build on what Phase 1 establishes.

---

## 9. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chunking | Anthropic contextual RAG | Context prefix dramatically improves retrieval over naive fixed-size |
| Embedding | Existing epi-claw Gemini client, 1536-dim | Reuse; consistency with memory tool embeddings |
| LLM for context | Gemini Flash (free) | Bulk contextualization is exactly Tier 1 use case per LLM hierarchy |
| Storage | T1 folder (Hen-managed) + Neo4j chunks | T1 IS the library; Hen owns document lifecycle; we add chunk precision |
| Chat logs | Turn-per-chunk with speaker metadata | Natural semantic units; preserves conversational structure |
| Tool surface | Pi agent first-class tools | No MCP abstraction overhead; fits epi-logos plugin tool registration pattern |
| Plugin home | epi-logos plugin / epii module | M5' coordinate = Knowledge Work Engine; Aletheia + Hen consume, not own |
| Neo4j namespace | T1Chunk / T1Document labels in existing pratibimba DB | Additive to existing schema; coordinate label hierarchy handles namespace |
| Progressive depth | Start minimal, deepen over time | Avoid premature GraphRAG complexity; Phase 1 makes corpus queryable immediately |

---

*Design approved: 2026-02-21. Next: implementation plan via writing-plans.*
