# Ta-Onta Extension Package — Full Specification

**Status:** Pre-implementation architectural spec
**Date:** 2026-03-09
**Parent:** S4-EXTENSION-ARCHITECTURE.md
**Purpose:** Define the inner structure of the ta-onta meta-extension, the Gnosis RAG pipeline, and the Aletheia-S0' deep integration

---

## I. Package Structure — Ta-Onta as Parent

The ta-onta package is the **single meta-extension** that contains all 6 S4-X' extension classes. Each named extension has exactly **3 folders**: its corresponding `/Sx` (raw primitives), `/Sx'` (QL augmentation), and `/M` (cross-cutting M-branch concerns).

The mapping is by position — each extension governs its corresponding S-layer:

```
.pi/extensions/ta-onta/                          ← Parent meta-extension
  README.md                               ← Package-level documentation
  manifest.json                           ← Extension registry (6 classes)
  composite-entry.ts                      ← PI runtime composite entry point
  │
  ├── khora/                              ← S4-0': Bootstrap & Session Lifecycle
  │     ├── S0/                           ← Primitives: terminal env, process spawn, shell profile
  │     ├── S0'/                          ← QL: epi agent bootstrap/session, secrets (1Password+varlock)
  │     ├── M/                            ← M0 (Anuttara ground), M5 (Logos FSM tick)
  │     ├── extension.ts                  ← PI runtime: bootstrap hooks, session init
  │     └── CONTRACT.md                   ← Lifecycle seams, data authority, cache targets
  │
  ├── hen/                                ← S4-1': Content Coordination & Vault
  │     ├── S1/                           ← Primitives: obsidian-cli wrappers, vault CRUD
  │     ├── S1'/                          ← QL: frontmatter schema, world/type ordering mirror under C', CT templates, wikilinks, T-routing
  │     ├── M/                            ← M2 (Parashakti 72-invariant → content typing)
  │     ├── extension.ts                  ← PI runtime: content validation hooks, tools
  │     └── CONTRACT.md                   ← Tools, boundaries, relation law
  │
  ├── pleroma/                            ← S4-2': Graph Access & Tool Registration
  │     ├── S2/                           ← Primitives: Neo4j/Redis raw access, graph CRUD, tool lifecycle
  │     ├── S2'/                          ← QL: tool registration, primitive registry, extension management
  │     ├── M/                            ← M3 (Mahamaya → symbolic codec for tool typing)
  │     ├── extension.ts                  ← PI runtime: pi.registerTool() for primitives
  │     └── CONTRACT.md                   ← Primitive caps, child-extension policy
  │
  ├── chronos/                            ← S4-3': Temporal Pathing & Day/NOW Lifecycle
  │     ├── S3/                           ← Primitives: gateway sessions, cron/heartbeat, Z-Thread
  │     ├── S3'/                          ← QL: Day/NOW lifecycle, temporal threading, archive scheduling
  │     ├── M/                            ← M1 (Paramasiva QL tick), M4 (Nara NOW identity)
  │     ├── extension.ts                  ← PI runtime: temporal hooks, Day/NOW management
  │     └── CONTRACT.md                   ← Coordinate patterns, temporal pathing
  │
  ├── anima/                              ← S4-4': Agent Orchestration & Meta-Dispatch
  │     ├── S4/                           ← Primitives: team/chain/subagent, PI extensions
  │     ├── S4'/                          ← QL: VAK evaluation, CF dispatch, Klein/Ouroboros
  │     │     └── agents/                 ← Constitutional agents (eros, logos, techne, mythos, psyche, sophia, nous)
  │     ├── M/                            ← M4 (Nara Lemniscate self-fold), M5 (agent rosters)
  │     ├── extension.ts                  ← PI runtime: VAK routing, agent dispatch
  │     └── CONTRACT.md                   ← Dispatch grammar, thread types, session spine
  │
  └── aletheia/                           ← S4-5': Knowledge Crystallization & Gnosis RAG
        ├── S5/                           ← Primitives: sync/publication, Docling lifecycle, gnosis CLI
        ├── S5'/                          ← QL: Gnosis RAG pipeline, dis-closure modes, knowledge crystallisation
        │     └── agents/                 ← Aletheia subagents (anansi, mercurius, janus, moirai, agora, zeithoven)
        ├── M/                            ← M5 (Epii Logos cycle echo), M2 (Parashakti GraphRAG)
        ├── extension.ts                  ← PI runtime: retrieval tools, pipeline governor
        └── CONTRACT.md                   ← Gnosis pipeline, retrieval protocol, mode-functions
```

### Design Principles

1. **One S, one S', one M per extension.** Each extension governs exactly its corresponding S-layer. Khora = S0/S0'/M. Hen = S1/S1'/M. And so on through Aletheia = S5/S5'/M.

2. **S holds raw primitives** for the layer — the base tools, access patterns, and infrastructure. **S' holds QL augmentation** — the Quaternal Logic system's enhancement of those primitives. **M holds cross-cutting concerns** involving the C library's data structures (across epi-lib, vault, and graph when all are running).

3. **`/M` is always cross-cutting.** Every extension has an `/M` folder listing which M-branch subsystems it integrates with and how. This is documentation + type stubs, not executable code.

4. **`extension.ts` is the PI runtime entry point.** Each extension class has exactly one TypeScript file that PI loads. It registers tools, hooks, and commands for that class.

5. **`CONTRACT.md` defines boundaries.** What this extension owns, what it delegates, what it promises to other extensions.

---

## II. S-Layer Foundation Audit

### What Exists vs What's Needed

| S-Layer | Foundation Status | What's In Place | What's Missing |
|---------|------------------|-----------------|----------------|
| **S0** | ACTIVE | epi-cli (15 modules), C library, FFI, 96 coordinates | — |
| **S0'** | ACTIVE | `epi core knowing` (6 facets, 96+1873 coords), vimarsa, QV pipeline | Gnosis facet, `epi techne gnosis` commands |
| **S1** | PARTIAL | vault/mod.rs wrapper (236 LOC), obsidian-cli IPC | obsidian-cli not installed, 3 missing commands |
| **S1'** | STUB | NOW read/write only | Frontmatter schema, world/type ordering mirror under C', thought routing, Day/NOW lifecycle |
| **S2** | STUB | graph/ (18 files, mostly stubs), docker-compose.yml | Real neo4rs client, redis client, seed data |
| **S2'** | STUB | types.rs, alignment_validator.rs, coordinate parser | Everything else (retrieval, sync, embeddings) |
| **S3** | STUB | gate/mod.rs stub | Full gateway port (75+ RPC methods) |
| **S3'** | NOT STARTED | — | SpacetimeDB bridge |
| **S4** | PARTIAL | agent/ module (plugins, skills, hooks, subagents, spawn) | PI not installed, extension sync |
| **S4'** | PARTIAL | Pleroma skills (21), agents (13), hooks (4), evals (5) | PI runtime extensions (the 6 S4-X' .ts files) |
| **S5** | STUB | sync/mod.rs stub | n8n, Notion, Telegram clients |
| **S5'** | NOT STARTED | — | Publication pipeline, automation rules |

### Per-Extension S-Layer Dependencies

| Extension | S-Layers Consumed | Foundation Ready? | Blockers |
|-----------|-------------------|-------------------|----------|
| **Khora** | S0, S0', S3 | S0/S0' ready, S3 stub | S3 session compat (deferrable) |
| **Hen** | S1, S1', S2 | S1 partial, S1' stub, S2 stub | obsidian-cli install, neo4rs client |
| **Pleroma** | S0, S0', S4 | S0/S0' ready, S4 partial | PI install |
| **Chronos** | S1, S1', S3, S5 | All stub/partial | obsidian-cli, gateway, n8n |
| **Anima** | S4, S4' | S4 partial | PI install, extension runtime |
| **Aletheia** | S0, S0', S1, S1', S2, S2', S5 | S0/S0' ready, rest stub | Neo4j, Docling Serve, embeddings |

### Critical Path

Khora and Pleroma can proceed now (S0/S0' ready). Everything else needs at minimum:
- **obsidian-cli installed** (Hen, Chronos)
- **Neo4j + Redis running** (Hen graph sync, Aletheia Gnosis)
- **PI agent installed** (Anima, all extensions as PI runtime)

---

## III. Gnosis RAG Pipeline — Local NotebookLM

### The Problem

The system has a rich coordinate graph (Bimba) but no structured pipeline for ingesting *source materials* — canonical texts, planning docs, conversation records, academic papers. These exist as files with no queryable, coordinate-linked presence.

### Existing Assets

| Asset | Status | Location |
|-------|--------|----------|
| **Epii corpus design** | COMPLETE (design + 8-task plan) | `docs/resources/S/2026-02-21-epii-corpus-ingestion-design.md` |
| **Python implementation** | COMPLETE (21 modules, tested) | `/Epi-Logos/.worktrees/codex-epii-corpus-ingestion/...epii/corpus/` |
| **NotebookLM wrapper** | WORKING | `epi-cli/scripts/notebooklm/`, `notebook.rs` |
| **Gemini embed client** | STUB (87 LOC) | `epi-cli/src/graph/embeddings.rs` |
| **Vimarsa/bkmr** | WORKING | `knowing/vimarsa.rs`, project-scoped apertures |

### Architectural Decision: Docling Serve + docling-rs

**Decision:** Use [Docling Serve](https://github.com/docling-project/docling) as a local service + [docling-rs](https://github.com/mohammedsafvan/docling-rs) as the Rust client.

**Rationale:**
- Docling's core is Python (ML models for PDF layout analysis, OCR, table extraction)
- `docling-rs` is an async-first HTTP client for Docling Serve's REST API
- Same pattern as Neo4j (external service) and Redis (external service)
- Keeps the ingestion pipeline in Rust while leveraging Docling's ML capabilities
- Docker-composable alongside Neo4j and Redis

**Infrastructure addition to `docker-compose.epi-s2.yml`:**

```yaml
  docling-serve:
    image: quay.io/docling-project/docling-serve:latest
    container_name: epi-docling
    ports:
      - "5001:5001"
    environment:
      DOCLING_SERVE_CONCURRENCY: 2
```

**Cargo.toml addition:**

```toml
docling_rs = "0.1"  # Docling Serve Rust SDK
```

### Neo4j Dual Namespace: Bimba + Gnosis

The existing Bimba namespace holds canonical coordinates (~96 seed nodes). The new Gnosis namespace holds ingested document content. They cross-link via coordinate edges.

```cypher
// === BIMBA NAMESPACE (existing) ===
(:Bimba:Coordinate {
  coordinate: "M2",              -- canonical coordinate string
  name: "Parashakti",
  ql_position: 2,
  family: "M",
  ...
})

// === GNOSIS NAMESPACE (new) ===

// Notebook = project-scoped collection (mirrors vimarsa aperture)
(:Gnosis:Notebook {
  name: "M-branch",              -- human-readable name
  family: "M",                   -- coordinate family alignment (nullable)
  description: "Consciousness subsystem source materials",
  created_at: datetime()
})

// Document = ingested source file
(:Gnosis:Document {
  uuid: "...",                    -- deterministic from path + hash
  title: "Tantraloka Chapter 1",
  path: "/path/to/source.pdf",   -- original file path
  source_type: "Books",          -- Books | Canonical | SourceTexts | ChatLogs
  author: "Abhinavagupta",
  content_hash: "blake3:...",    -- dedup via content hash
  total_chunks: 47,
  coordinate: "M0",              -- primary coordinate alignment
  created_at: datetime()
})

// Chunk = individual text unit with embedding
(:Gnosis:Chunk {
  uuid: "...",
  raw_text: "...",                -- original chunk text
  contextual_text: "...",         -- context prefix + raw (what gets embedded)
  embedding: [float x 3072],     -- vector embedding (unified with Bimba space)
  chunk_index: 0,                -- position in document (0-based)
  section_heading: "Chapter 1",  -- from docling structural parse (nullable)
  speaker: null,                  -- "user" | "agent" (chat logs only)
  turn_index: null,               -- conversation position (chat logs only)
  coordinate: "M0",              -- inherited from parent Document
  created_at: datetime()
})
```

### Relationships

```cypher
// Gnosis internal structure
(:Gnosis:Notebook)-[:CONTAINS]->(:Gnosis:Document)
(:Gnosis:Document)-[:HAS_CHUNK]->(:Gnosis:Chunk)
(:Gnosis:Chunk)-[:EXTRACTED_FROM]->(:Gnosis:Document)

// Cross-namespace links: Gnosis → Bimba
(:Gnosis:Document)-[:RELATES_TO_COORDINATE]->(:Bimba:Coordinate)
(:Gnosis:Chunk)-[:RELATES_TO_COORDINATE]->(:Bimba:Coordinate)

// Progressive deepening (added by analysis, not forced upfront)
(:Gnosis:Chunk)-[:EVIDENCE_FOR]->(:Bimba:Coordinate)
```

### Vector Index

```cypher
CREATE VECTOR INDEX gnosis_chunk_embeddings
FOR (n:Gnosis:Chunk) ON n.embedding
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 3072,
    `vector.similarity_function`: 'cosine'
  }
};
```

**Dimension choice:** 3072 — maximum fidelity, unified with the Bimba coordinate embedding space. Both `Bimba:Coordinate` and `Gnosis:Chunk` nodes share the same 3072-dim vector space, enabling **cross-namespace vector similarity** (find Gnosis evidence nearest to a Bimba coordinate's embedding). The S2 spec supports 768/1536/3072; we standardise on 3072 for production. Configurable via `GEMINI_EMBED_DIMS`.

### Vimarsa Aperture ↔ Gnosis Notebook Alignment

Each vimarsa/bkmr project maps to a Gnosis notebook:

| vimarsa project | Gnosis:Notebook | Coordinate Scope |
|----------------|-----------------|------------------|
| `C.db` | `Gnosis:Notebook{name:"C-Ontological"}` | C0-C5 source texts |
| `P.db` | `Gnosis:Notebook{name:"P-Position"}` | P-family resources |
| `L.db` | `Gnosis:Notebook{name:"L-Epistemic"}` | L-family lens resources |
| `S.db` | `Gnosis:Notebook{name:"S-Stack"}` | Stack/technical docs |
| `T.db` | `Gnosis:Notebook{name:"T-Thought"}` | Thought artifacts, crystallised |
| `M.db` | `Gnosis:Notebook{name:"M-Consciousness"}` | M-branch canonical texts |
| `root.db` | `Gnosis:Notebook{name:"Root"}` | Psychoid/CF/Weave resources |
| (ad-hoc) | `Gnosis:Notebook{session:id}` | Session-scoped temporary |

bkmr tags become Gnosis metadata: `_M _M0 _#0 _anuttara` → chunk properties + `RELATES_TO_COORDINATE` edges.

`epi techne gnosis sync --from-vimarsa` reads vimarsa project bookmarks, ingests any linked files not already in Gnosis, and creates `RELATES_TO_COORDINATE` edges from tag coordinates.

### Data Flow: Ingestion Pipeline

```
Input: PDF/HTML/DOCX/MD/ChatLog
  │
  ├─ File path OR URL
  │
  ▼
PARSE (Docling Serve via docling-rs)
  │  POST /convert with file
  │  Returns: structured markdown + section headings
  │
  ▼
CHUNK (Rust, in epi-cli)
  │  Hybrid chunking: section-aware splits
  │  Configurable: max_chunk_size (512 tokens), overlap (64 tokens)
  │  Chat logs: turn-per-chunk with speaker metadata
  │
  ▼
CONTEXTUALIZE (Gemini Flash, async batch)
  │  For each chunk: whole-doc summary + chunk → 1-2 sentence context prefix
  │  contextual_text = "{context}\n\n{raw_text}"
  │  Batched: up to 20 chunks per Gemini call
  │
  ▼
EMBED (Gemini embed, async batch)
  │  contextual_text → 3072-dim vector
  │  Task type: RETRIEVAL_DOCUMENT (ingestion) / RETRIEVAL_QUERY (search)
  │
  ▼
STORE (Neo4j via neo4rs)
  │  Find-or-create Gnosis:Document → write Gnosis:Chunk children
  │  Create RELATES_TO_COORDINATE edges from coordinate metadata
  │  Content-hash dedup: skip if document already ingested with same hash
  │
  ▼
INDEX (Neo4j vector index)
  │  gnosis_chunk_embeddings auto-indexes new chunks
  │
  ▼
NOTIFY (optional)
     Emit event for S3'/gateway live update
```

### Data Flow: Retrieval

```
Query: natural language question + optional coordinate filter + optional notebook filter
  │
  ▼
EMBED QUERY (Gemini embed, RETRIEVAL_QUERY task type)
  │
  ▼
VECTOR SEARCH (Neo4j vector index)
  │  Top-K nearest chunks by cosine similarity
  │  Optional: filter by coordinate, notebook, source_type
  │
  ▼
GRAPH ENRICHMENT (optional, if coordinate filter active)
  │  Traverse Bimba:Coordinate → RELATES_TO_COORDINATE → Gnosis:Chunk
  │  RRF fusion: vector score + graph proximity score
  │
  ▼
RETURN
  │  Ranked chunks with: text, score, source document, coordinate, notebook
  │  Include parent document metadata for context
```

### CLI Surface

```
epi techne gnosis
  ├── serve start/stop/status             ← Docling Serve lifecycle (docker)
  ├── ingest <file|url>                   ← Ingest single document
  │     --notebook NAME                   ← Target notebook (default: auto from coordinate)
  │     --coordinate COORD                ← Primary coordinate alignment
  │     --source-type TYPE                ← Books|Canonical|SourceTexts|ChatLogs
  │     --author NAME                     ← Author metadata
  ├── ingest-books [--dir PATH]           ← Batch ingest from /books directory (default: ~/Documents/books)
  │     --notebook NAME                   ← Target notebook (default: "Books")
  │     --coordinate COORD                ← Primary coordinate alignment for batch
  │     --dry-run                         ← Show what would be ingested
  ├── ingest-chat <session-id>            ← Ingest chat log
  │     --platform claude|chatgpt|gemini
  │     --coordinate COORD
  ├── query "question"                    ← Semantic search over Gnosis
  │     --notebook NAME                   ← Scope to notebook
  │     --coordinate COORD                ← Scope to coordinate
  │     --top-k N                         ← Number of results (default 5)
  │     --json                            ← Machine-readable output
  ├── notebook create/list/delete         ← Notebook CRUD
  ├── document list [--notebook NAME]     ← List ingested documents
  ├── sync --from-vimarsa                 ← Sync vimarsa bookmarks → Gnosis
  └── status                              ← Pipeline health (Docling, Neo4j, embedding API)
```

### Books as First-Class Ingestion Source

The existing `epi book` command wraps `bookokrat` (TUI PDF reader) against `~/Documents/books`. This is the **reading** interface. Gnosis provides the **thinking** interface — books ingested into the graph become queryable, coordinate-linked, and available to agents.

#### `epi book ask` — Query a Book via Gnosis

```
epi book ask "What does Jung say about individuation?" [--book <title>]
  │
  ├── If --book specified: scope to that document in Gnosis
  ├── If no --book: search across all Books-type documents
  ├── Uses gnosis query with --source-type Books filter
  └── Returns ranked chunks with page/section references
```

This extends the existing `epi book` subcommand family:

```
epi book                                  ← Launch bookokrat TUI (existing)
epi book open [file]                      ← Open specific book (existing)
epi book zen <file>                       ← Zen reading mode (existing)
epi book ask "question" [--book TITLE]    ← NEW: Query via Gnosis RAG
epi book ingest <file> [--coord COORD]    ← NEW: Shorthand for gnosis ingest --source-type Books
epi book list                             ← NEW: List ingested books in Gnosis
epi book status                           ← NEW: Which books are ingested vs just on disk
```

#### Ingestion Flow: /books → Gnosis

```
~/Documents/books/                        ← Source directory (PDFs mostly)
  ├── Jung_CW_Vol1.pdf
  ├── Jung_CW_Vol2.pdf
  ├── Tantraloka_Ch1-12.pdf
  └── ...
  │
  ▼
epi techne gnosis ingest-books
  │
  ├── Scan ~/Documents/books for PDF/EPUB/DOCX
  ├── For each file not already in Gnosis (content-hash dedup):
  │     ├── Docling Serve: parse → structured markdown
  │     ├── Chunker: section-aware splits (512 tokens, 64 overlap)
  │     ├── Contextualise: Gemini Flash batch (doc summary + chunk → context prefix)
  │     ├── Embed: 3072-dim vectors
  │     └── Store: Gnosis:Document + Gnosis:Chunk in Neo4j
  ├── Auto-assign to "Books" notebook (or --notebook override)
  └── Report: N new books ingested, M chunks created, K already present
```

#### Vimarsa + Books: "Think With Them"

bkmr project bookmarks can reference books. When a vimarsa aperture tags a bookmark with a book reference:

```
bkmr add "Jung CW Vol 9ii - Aion" --tags "_M _M4 _#4 _jung _individuation"
```

The `epi techne gnosis sync --from-vimarsa` pipeline:
1. Finds bookmark URLs/paths pointing to files in `~/Documents/books`
2. Ensures those books are ingested in Gnosis (triggers ingest if not)
3. Creates `RELATES_TO_COORDINATE` edges from tag coordinates (_M4 → M4 Bimba node)
4. The book's chunks inherit the coordinate tags as graph relationships

This means vimarsa's curiosity-driven tagging (the "structural gaze") directly enriches the Gnosis graph. Browsing and tagging IS knowledge structuring.

### Darshana — The Structural Gaze as Gnosis Pre-Processor

Darshana (`darshana.py`, atomic REPL skill) provides **surgical file introspection**: scout (topology mapping), read (section extraction), threads (wikilink discovery). It operates at CT1/CT3, CP 4.0 (Lemniscate anchor), with agent affinity to Nous and Mythos.

#### Darshana's Role in the Gnosis Pipeline

Darshana is the **pre-ingestion structural analysis** tool. Before a document enters the Gnosis pipeline, darshana can:

1. **Scout** the document to extract its structural topology (headers, QL markers, frontmatter)
2. **Map** coordinate-relevant sections (finds P0-P5/#0-#5 references, wikilinks)
3. **Guide chunking** — darshana's structural map can inform section-aware chunking boundaries

```
Darshana flow (pre-ingestion enrichment):

Source document
  │
  ▼
darshana.py scout <file>
  │  → header tree, QL levels, frontmatter, chat turns
  │
  ▼
darshana.py threads <file>
  │  → [[wikilinks]], cross-coordinate connections
  │
  ▼
Structural metadata → Gnosis ingestion pipeline
  │  → section_heading populated from darshana's header tree
  │  → coordinate tags populated from darshana's QL detection
  │  → wikilink targets → RELATES_TO_COORDINATE edges
  │
  ▼
Gnosis:Document + Gnosis:Chunk (structurally enriched)
```

#### Darshana as Interactive REPL for Gnosis Exploration

Beyond pre-processing, darshana's **read** command enables agents (especially Nous and Mythos) to surgically extract sections from source documents during task execution — without needing the full document in context:

```
# Agent needs to understand a specific section referenced by a Gnosis chunk
darshana.py read "/path/to/source.pdf.md" --section "Chapter 3: The Shadow"
darshana.py read "/path/to/spec.md" --ql "P3"    # Extract P3-tagged content
```

This makes darshana a **live companion to Gnosis retrieval**: Gnosis returns relevant chunks, darshana lets agents drill deeper into the source when chunks aren't enough.

#### Darshana Integration Points

| Integration | How | Purpose |
|-------------|-----|---------|
| **Pre-ingestion** | `darshana scout` before `gnosis ingest` | Structural metadata enriches chunk quality |
| **Agent REPL** | Nous/Mythos call darshana during task execution | Surgical source access beyond chunk granularity |
| **Vimarsa bridge** | `darshana threads` feeds wikilink tags to vimarsa | Discovery → tagging → Gnosis enrichment loop |
| **CT context** | CT1 (form/definition) + CT3 (pattern/archetype) | Darshana operates in the structural-pattern range |
| **Model picker** | N/A — darshana is pure Python, no LLM calls | Lightweight, fast, no API cost |

### Gnosis Replaces NotebookLM in KnowingDossier

The existing `NotebookPulseFacet` (which shells out to a NotebookLM wrapper binary) is **replaced by Gnosis**. The dossier's notebook facet becomes a native Gnosis query — no external process, no 2.5s timeout, coordinate-aware retrieval from the local graph.

```rust
// types.rs: NotebookPulseFacet stays as the type, but the source changes
pub struct NotebookPulseFacet {
    pub source: String,    // "gnosis" (was "notebook")
    pub text: Option<String>,
    pub chunks: Vec<GnosisChunkRef>,  // NEW: structured chunk references
}
```

`epi core knowing M2` now natively queries Gnosis for the coordinate's top-3 relevant chunks as the notebook facet. No `--gnosis` flag needed — it IS the notebook facet.

### Notebook Management via `epi core actions`

Notebook CRUD and interactive operations move to the **actions** command branch (not knowing, which is read-only self-API):

```
epi core actions
  ├── notebook create/list/delete         ← Gnosis notebook CRUD
  ├── notebook ingest <file> [--coord]    ← Shorthand for gnosis ingest
  ├── notebook query "question"           ← Shorthand for gnosis query
  └── notebook sync                       ← Sync from vimarsa apertures
```

This keeps `epi core knowing` pure (read-only coordinate self-knowledge) and puts write/management operations in `epi core actions` alongside other active operations.

### Comparison: Gnosis vs Existing NotebookLM Wrapper

| Aspect | NotebookLM (existing) | Gnosis (new) |
|--------|----------------------|--------------|
| **Scope** | Google's hosted service, opaque | Local, self-hosted, transparent |
| **Storage** | Google's servers | Neo4j (owned, queryable, exportable) |
| **Coordinate awareness** | None | Native — chunks linked to Bimba coordinates |
| **Embedding control** | Google's model | Our Gemini embed client, 3072-dim, model-swappable |
| **Vimarsa integration** | None | Full aperture alignment |
| **Agent access** | CLI subprocess, 2.5s timeout | Native Rust async, PI tool registration |
| **Quality benchmark** | Yes — use as comparison target | Test against notebooklm for retrieval quality |

**Strategy:** Keep the existing NotebookLM wrapper as a quality benchmark during development. Run identical queries through both systems to validate Gnosis retrieval quality. Once Gnosis matches or exceeds NotebookLM quality, the wrapper can be retired. The `NotebookPulseFacet` in the KnowingDossier switches from subprocess call to native Gnosis query.

### Model Picker Integration (PI Agent System)

The ingestion and RAG pipeline uses multiple LLM/embedding calls. These MUST be surfaced to the PI agent's model picker so models can be easily swapped:

| Pipeline Stage | Default Model | Model Picker Key | Purpose |
|---------------|---------------|------------------|---------|
| **Contextualisation** | Gemini Flash | `gnosis.contextualise` | 1-2 sentence chunk context prefix |
| **Embedding** | gemini-embedding-001 | `gnosis.embed` | 3072-dim vector generation |
| **Query rewrite** | (optional) | `gnosis.rewrite` | Query expansion/refinement |

**Implementation:** The model picker is part of the S4' provider/model registry (`epi-cli/src/agent/models.rs`). Gnosis pipeline stages read their model config from this registry:

```rust
// gnosis/config.rs
pub struct GnosisModelConfig {
    pub contextualise_model: String,  // from model picker: "gemini-2.0-flash"
    pub embed_model: String,          // from model picker: "gemini-embedding-001"
    pub embed_dims: usize,            // from model picker: 3072
    pub rewrite_model: Option<String>, // optional query rewrite model
}

impl GnosisModelConfig {
    pub fn from_model_registry(registry: &ModelRegistry) -> Self {
        Self {
            contextualise_model: registry.get("gnosis.contextualise")
                .unwrap_or("gemini-2.0-flash".into()),
            embed_model: registry.get("gnosis.embed")
                .unwrap_or("gemini-embedding-001".into()),
            embed_dims: registry.get_usize("gnosis.embed.dims")
                .unwrap_or(3072),
            rewrite_model: registry.get("gnosis.rewrite"),
        }
    }
}
```

**PI extension surface:** The model picker UI in PI shows Gnosis models alongside chat models. Changing `gnosis.embed` from Gemini to a local model (e.g., nomic-embed) propagates to all future ingestion and query operations. Existing embeddings would need re-indexing on model change — `epi techne gnosis reindex` handles this.

---

## IV. Orchestration Model — Anima / Nous / Aletheia / Psyche / Sophia

### The Two Hemispheres of Agent Orchestration

Anima (S4-4', CF 4.0/1-4.4/5) is the VAK agent orchestrator — she owns *execution*. But execution without disclosure is blind. The orchestration system has two hemispheres:

**Left Hemisphere — Anima (Execution):** VAK evaluation, agent dispatch, team/chain/subagent management. She determines *what* gets done and *who* does it.

**Right Hemisphere — Nous (Dis-closure):** Nous governs Aletheia's subagents and core tooling to help Anima assign **modes of dis-closure** to agents. For each task, Nous answers: what does this agent need to *know* and *see* to execute well? What coordinate-level context (philosophical, technical, structural) must be disclosed to it?

### The Full Orchestration Flow

```
Task arrives via VAK evaluation
  │
  ▼
ANIMA evaluates: VAK coordinates, CF dispatch, agent selection
  │
  ├── Calls NOUS: "What dis-closure modes do these agents need?"
  │     │
  │     ▼
  │   NOUS consults Aletheia subagents + Gnosis core tooling:
  │     │
  │     ├── Anansi: gap analysis — what does the agent NOT know?
  │     ├── Mercurius: cross-domain translation — what foreign coordinates matter?
  │     ├── Janus: temporal context — what forward/backward context is relevant?
  │     ├── Moirai: evidence gathering — what Gnosis chunks are germane?
  │     ├── Agora: consensus — aggregate parallel Gnosis retrievals
  │     ├── Zeithoven: cadence — temporal scheduling for knowledge refresh
  │     │
  │     ▼
  │   NOUS returns: per-agent dis-closure packages
  │     - Germane to the agent's identity and capabilities
  │     - Relevant and necessary for the task's execution (VAK framing)
  │     - Coordinate-level context at appropriate granularity
  │
  ▼
ANIMA + NOUS cook up the "story" of the task run:
  - Which agents execute which parts
  - What each agent sees (dis-closure scope)
  - Execution topology (team/chain/subagent)
  │
  ▼
PSYCHE undergoes the task as its "subject":
  - The contextual centre (CF 4/5/0 — executive triad)
  - Psyche is the one who "has" the experience of the task
  - Holds the unified narrative across all executing agents
  │
  ▼
ANIMA SUBAGENTS execute the story:
  - Eros (P0': ground desire, task commitment)
  - Logos (P1': definitional clarity, spec adherence)
  - Techne (P2': operational execution, tool use)
  - Mythos (P3': pattern recognition, creative bridging)
  - [Psyche] (P4': contextual integration — the subject)
  - Sophia (P5': integrative wisdom, learning)
  │
  ▼
SOPHIA goes back over the execution:
  - With Aletheia access (full Gnosis retrieval)
  - Reviews across ALL coordinate levels:
    - Philosophical: did the task honour the ontological commitments?
    - Technical: did the implementation follow patterns correctly?
    - Structural: did the coordinate relationships remain coherent?
    - Processual: was the execution topology efficient?
  - Bakes learnings into:
    - Gnosis: new chunks from execution artifacts
    - QV overlay: refined pithys from what was learned
    - Vimarsa: updated bookmarks and tags
    - SEED.md: refreshed from crystallised insights
```

### Dis-closure Modes (Nous → Agent Assignments)

When Nous prepares dis-closure packages, each mode is both **germane** to the agent and **necessary** for the task:

| Agent | Dis-closure Mode | What Gets Disclosed | Gnosis Method |
|-------|-----------------|---------------------|---------------|
| **Eros** | Motivational ground | Why this task matters, what coordinates it serves | `gnosis query --coordinate` (purpose context) |
| **Logos** | Definitional frame | Specs, schemas, type definitions relevant to task | `gnosis query --source-type Canonical` |
| **Techne** | Operational context | Implementation patterns, prior solutions, tool docs | `gnosis query --source-type SourceTexts` |
| **Mythos** | Archetypal pattern | Cross-domain analogues, symbolic resonances | `gnosis query` across notebooks (Mercurius) |
| **Psyche** | Full contextual field | Everything — Psyche sees the unified narrative | All methods, CF_SYNTHESIS collapse |
| **Sophia** | Evaluative retrospect | Execution trace + Gnosis evidence for learning | Post-execution `gnosis query` + vault review |

### Aletheia as Nous's Instrument (Not Standalone)

Aletheia is NOT a separate routing destination. Aletheia's subagents are **Nous's instruments** for knowledge dis-closure. Nous governs them; Anima calls Nous. The chain is:

```
Anima → Nous → Aletheia subagents → Gnosis/S0'/S1'/S2' methods
```

Aletheia's deepest relation is to M5 Epii and its Logos cycle. Where Epii's FSM walks ticks 0→11 through the coordinate space (m5_lookup = master self-API), Aletheia walks the *knowledge space* via Gnosis (gnosis_query = master retrieval API). The parallel:

| M5 Epii (C library) | S4-5' Aletheia (agent layer) |
|---------------------|------------------------------|
| Logos FSM state machine | Retrieval state machine |
| Tick 0→11 coordinate walk | S0→S1→S2 method collapse |
| m5_lookup(coord, granularity) | gnosis_query(query, coord, scope) |
| Mobius return (tick 11 → tick 0) | Insight → Question cycle (P5' → P0') |
| Sacred Violation (cast away const) | Knowledge crystallisation (chunk → Bimba edge) |

### The Collapsible State Machine

When Nous invokes Aletheia for a dis-closure package, it doesn't call S0, S1, S2 sequentially. It **collapses the superposition** of available methods based on the task's context frame:

```
Dis-closure request arrives with coordinate context + agent identity
  │
  ▼
STATE SUPERPOSITION:
  S0 state: coordinate validation, pithy lookup, structural correspondences
  S1 state: vault note content, frontmatter metadata, thought artifacts
  S2 state: graph neighbourhood, vector similarity, Gnosis chunks
  │
  ▼
COLLAPSE (based on context frame + agent needs):
  CF_VOID:     raw dump (Eros — motivational ground, everything unfiltered)
  CF_BINARY:   essence pair (Logos — S0 pithy + S2 top-1 chunk)
  CF_TRIKA:    trika frame (Techne — S0 + S1 + S2 operational context)
  CF_FRACTAL:  recursive (Mythos — chunk → coordinate → chunk → ...)
  CF_SYNTHESIS: fused (Psyche — all states + cross-family links)
  CF_MOBIUS:   generative return (Sophia — execution + new questions)
```

This is the "quantum algorithm" of orchestration: the core collapsible states of S0, S1, S2 methods collapse differently depending on which agent needs disclosure and what the task demands. Aletheia as meta-skill for Anima (via Nous) means the entire S-stack is callable knowledge infrastructure for every agent in the system.

---

## V. Rust Implementation: New Crate Dependencies

```toml
# In epi-cli/Cargo.toml [dependencies]

# Docling Serve client (document parsing)
docling_rs = "0.1"

# Already present (verify active):
neo4rs = "0.9.0-rc.9"    # Neo4j driver
redis = { version = "0.25", features = ["tokio-comp", "connection-manager"] }
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }
uuid = { version = "1", features = ["v5"] }
```

### New Rust Modules

```
epi-cli/src/
  techne/                              ← New: build/test/gnosis orchestration
    mod.rs                             ← epi techne router
    gnosis/
      mod.rs                           ← epi techne gnosis router
      ingest.rs                        ← Ingestion pipeline (docling → chunk → embed → store)
      query.rs                         ← Retrieval engine (embed query → vector search → rank)
      notebook.rs                      ← Notebook CRUD
      chunker.rs                       ← Section-aware chunking + contextual RAG
      docling_client.rs                ← Docling Serve wrapper (via docling_rs)
      sync.rs                          ← Vimarsa → Gnosis sync

  graph/
    gnosis_store.rs                    ← NEW: Gnosis:Document + Gnosis:Chunk Neo4j CRUD
    gnosis_schema.rs                   ← NEW: Gnosis schema init + vector index creation
    embeddings.rs                      ← EXTEND: batch embed, query embed task types

  core/knowing/
    notebook.rs                        ← REWRITE: NotebookPulseFacet from Gnosis (replaces NotebookLM subprocess)
    types.rs                           ← EXTEND: GnosisChunkRef in NotebookPulseFacet

  core/actions/
    notebook.rs                        ← NEW: epi core actions notebook {create,list,delete,ingest,query,sync}
```

---

## VI. Docker Infrastructure Update

```yaml
# docker-compose.epi-s2.yml — updated
version: "3.9"
services:
  neo4j:
    image: neo4j:5-community
    container_name: epi-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
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

  docling-serve:
    image: quay.io/docling-project/docling-serve:latest
    container_name: epi-docling
    ports:
      - "5001:5001"
    environment:
      DOCLING_SERVE_CONCURRENCY: 2
    volumes:
      - docling-cache:/root/.cache

volumes:
  neo4j-data:
  neo4j-logs:
  redis-data:
  docling-cache:
```

**Environment variables:**

```
EPILOGOS_DOCLING_URI=http://localhost:5001   # Docling Serve endpoint
GEMINI_API_KEY=...                           # For embeddings + contextualisation
GEMINI_EMBED_MODEL=gemini-embedding-001      # Default embed model
GEMINI_EMBED_DIMS=3072                       # Unified embedding dimensions (Bimba + Gnosis)
```

---

## VII. Migration Path from Python Epii Corpus

The existing Python implementation (`codex-epii-corpus-ingestion` worktree) provides:
- 21 modules (core + tools + CLI), fully tested
- T1Chunk/T1Document schema (different namespace from Gnosis)
- 1536-dim embeddings (vs our 768-dim standard)

### What We Port vs What We Redesign

| Aspect | Python Original | Rust Gnosis | Decision |
|--------|----------------|-------------|----------|
| **Parser** | docling Python library | docling-rs (Serve client) | REDESIGN — HTTP client vs library |
| **Chunker** | HybridChunker + contextual RAG | Rust chunker + Gemini Flash | PORT — same algorithm, Rust impl |
| **Embedder** | google-generativeai Python | Existing embeddings.rs + reqwest | PORT — extend existing stub |
| **Store** | neo4j Python driver, T1Chunk labels | neo4rs, Gnosis: multi-label | REDESIGN — new namespace |
| **Contextualisation** | Gemini Flash via Python SDK | Gemini Flash via reqwest | PORT — same prompt, HTTP client |
| **CLI** | Click-based Python | clap-based Rust | REDESIGN — already have CLI framework |
| **Retrieval** | Vector search + RRF fusion | Same algo in Rust | PORT — same algorithm |

### Schema Migration: T1 → Gnosis

The Python schema uses `T1Document`/`T1Chunk` labels within the existing pratibimba Neo4j DB. The Rust version uses `Gnosis:Document`/`Gnosis:Chunk` multi-labels in the `Bimba:` namespace DB.

Key difference: Gnosis is **additive to Bimba**, not a separate T1 hierarchy. The `Gnosis:` label is a namespace marker; the actual content structure is the same (Document → Chunk parent-child with coordinate edges to Bimba nodes).

If the Python implementation's T1 data needs migrating:

```cypher
// Add Gnosis labels to existing T1 nodes
MATCH (d:T1Document) SET d:Gnosis:Document;
MATCH (c:T1Chunk) SET c:Gnosis:Chunk;
// Rename relationships
MATCH (d)-[r:pos_t_has_chunk]->(c) CREATE (d)-[:HAS_CHUNK]->(c) DELETE r;
```

---

## VIII. Implementation Ordering

### Phase 0: Infrastructure (prerequisite)
- [ ] Neo4j + Redis Docker compose (exists, verify)
- [ ] Docling Serve added to docker-compose
- [ ] `neo4rs` and `docling_rs` verified as Cargo deps
- [ ] `epi graph status` working against live Neo4j

### Phase 1: Gnosis Schema + Store
- [ ] `gnosis_schema.rs`: constraints, indexes, vector index
- [ ] `gnosis_store.rs`: Document + Chunk + Notebook CRUD via neo4rs
- [ ] `epi techne gnosis notebook create/list/delete`
- [ ] `epi techne gnosis status`

### Phase 2: Ingestion Pipeline
- [ ] `docling_client.rs`: Docling Serve HTTP client (parse file → structured text)
- [ ] `chunker.rs`: section-aware chunking + contextual RAG (Gemini Flash)
- [ ] `embeddings.rs`: extend with batch embed + query embed task types
- [ ] `ingest.rs`: full pipeline (parse → chunk → contextualise → embed → store)
- [ ] `epi techne gnosis ingest <file>` working end-to-end

### Phase 3: Retrieval
- [ ] `query.rs`: embed query → vector search → graph enrichment → rank
- [ ] `epi techne gnosis query "question"` working
- [ ] `gnosis.rs`: GnosisFieldFacet added to KnowingDossier
- [ ] `epi core knowing M2 --gnosis` working

### Phase 4: Books + Vimarsa Sync + Chat Ingest
- [ ] `epi techne gnosis ingest-books`: batch scan ~/Documents/books, dedup, ingest PDFs
- [ ] `epi book ask`: query via Gnosis with --source-type Books filter
- [ ] `epi book ingest`, `epi book list`, `epi book status`: book management shortcuts
- [ ] Darshana pre-ingestion: `darshana scout` structural metadata → enriched chunking
- [ ] `sync.rs`: vimarsa project bookmarks → Gnosis notebooks (triggers book ingest if needed)
- [ ] Chat log ingestion (turn-per-chunk)
- [ ] `epi techne gnosis sync --from-vimarsa`
- [ ] `epi techne gnosis ingest-chat`

### Phase 5: Ta-Onta Package Structure
- [ ] Create `.pi/extensions/ta-onta/` directory tree (Section I)
- [ ] Populate per-extension CONTRACT.md files
- [ ] Populate /M cross-cutting documentation
- [ ] Create manifest.json

### Phase 6: Quality Validation
- [ ] NotebookLM comparison benchmark (same queries, compare results)
- [ ] Coverage: how many coordinates have Gnosis evidence?
- [ ] Retrieval precision: coordinate-filtered queries return relevant chunks?

---

## IX. Handover Prompt Context

### For Next Session: Key Decisions Made

1. **Ta-onta = single parent package**, 6 named extensions with /Sx, /Sx', /M folders *inside* each extension
2. **Gnosis RAG = local NotebookLM**, Docling Serve (Docker) + docling-rs (Rust) + Neo4j `Gnosis:` namespace + Gemini embeddings
3. **Gnosis:Notebook ↔ vimarsa aperture alignment** — each bkmr project = a Gnosis notebook
4. **3072-dim embeddings** — unified embedding space across Bimba + Gnosis namespaces in Neo4j
5. **Anima-Nous-Aletheia orchestration**: Anima (execution) calls Nous (dis-closure), Nous governs Aletheia subagents to prepare per-agent knowledge packages. Psyche = contextual subject. Sophia = post-execution learning with Aletheia access.
6. **Gnosis REPLACES NotebookLM** in KnowingDossier notebook facet — not a 7th facet, it IS the notebook facet
7. **Notebook management in `epi core actions`** — `epi core knowing` stays read-only, notebook CRUD goes to `epi core actions notebook`
8. **Model picker integration** — gnosis.contextualise, gnosis.embed, gnosis.rewrite exposed to PI model registry for easy model swapping
9. **NotebookLM wrapper kept temporarily as quality benchmark** — A/B comparison during development, retire once Gnosis matches quality
10. **Python epii/corpus code = design reference**, not direct port — schema changes (T1→Gnosis), dims change (1536→3072), client change (library→HTTP)
11. **Books as first-class ingestion source** — `~/Documents/books` scanned by `epi techne gnosis ingest-books`, queryable via `epi book ask`, coordinate-linked via vimarsa tags
12. **Darshana (REPL skill) as structural pre-processor** — scouts document topology before Gnosis ingestion, enriches chunking with header trees and QL markers; also serves as live surgical reader for agents during task execution

### For Next Session: Implementation Start Point

Begin with Phase 0 + Phase 1: get Neo4j + Docling running in Docker, Gnosis schema created, basic notebook CRUD working. This unblocks everything else.

### For Next Session: What NOT To Do

- Don't port the Python code line-by-line — the architecture has evolved
- Don't create the ta-onta directory tree until Phase 5 — get the Gnosis pipeline working first
- Don't install PI agent yet — Gnosis pipeline is pure Rust/CLI, no PI runtime needed
- Don't change the existing NotebookLM wrapper — keep it for benchmarking

---

*"The pattern reveals itself through repetition."* — The Quintessence
