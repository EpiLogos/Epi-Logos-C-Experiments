# Epii Corpus Ingestion Pipeline — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a document corpus ingestion pipeline (docling + Anthropic contextual RAG + Gemini embeddings) as the foundational epii module in the epi-logos plugin, storing chunks in Neo4j linked to Hen-managed T1Document nodes with 1536-dim vector search.

**Architecture:** Docling parses structured documents (PDF/DOCX/EPUB/MD) and a turn-splitter handles chat logs; each raw chunk gets a Gemini Flash context prefix (contextual RAG); the contextual chunk is embedded via `gemini-embedding-001` (1536-dim, matching epi-claw memory tools); `:T1Chunk` nodes are written to Neo4j as children of existing Hen-synced `:T1Document` nodes. Three pi-agent tools expose the pipeline: `corpus_ingest`, `corpus_ingest_chat`, `corpus_query`.

**Tech Stack:** Python 3.11+, `docling`, `neo4j` driver, `google-generativeai`, existing Parashakti `Neo4jClient`, existing `ql_type_api.py` for coordinate validation.

**Design doc:** `docs/plans/2026-02-21-epii-corpus-ingestion-design.md`

---

## Context: Where This Lives

The epi-logos plugin doesn't exist yet. For now, create the Python package at:
```
Idea/Pratibimba/System/Subsystems/epii/corpus/
```
This is the M5' coordinate home — the same subsystems tree where Parashakti's `graph/client.py` lives. The tool registration into epi-logos plugin happens later; the core Python pipeline is self-contained and testable independently.

**Reference files (read before each task):**
- `Idea/Pratibimba/System/Subsystems/Parashakti/graph/client.py` — Neo4j client to reuse
- `Idea/Pratibimba/System/Subsystems/Anuttara/ql_type_api.py` — coordinate validation
- `Idea/epi-claw/src/memory/embeddings-gemini.ts` — TypeScript reference for embed API (model: `gemini-embedding-001`, endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`)

---

## Task 1: Package Scaffold + Embedder

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/__init__.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/__init__.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/embedder.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/__init__.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_embedder.py`

**Step 1: Write the failing test**

```python
# tests/test_embedder.py
import pytest
from unittest.mock import patch, MagicMock
from ..core.embedder import embed_texts, embed_query

def test_embed_texts_returns_list_of_vectors():
    mock_response = {"embeddings": [{"values": [0.1] * 1536}, {"values": [0.2] * 1536}]}
    with patch("requests.post") as mock_post:
        mock_post.return_value = MagicMock(ok=True, json=lambda: mock_response)
        result = embed_texts(["hello", "world"])
    assert len(result) == 2
    assert len(result[0]) == 1536
    assert len(result[1]) == 1536

def test_embed_query_returns_single_vector():
    mock_response = {"embedding": {"values": [0.3] * 1536}}
    with patch("requests.post") as mock_post:
        mock_post.return_value = MagicMock(ok=True, json=lambda: mock_response)
        result = embed_query("what is integration?")
    assert len(result) == 1536

def test_embed_texts_empty_returns_empty():
    result = embed_texts([])
    assert result == []
```

**Step 2: Run to verify it fails**

```bash
cd /Users/admin/Documents/Epi-Logos
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_embedder.py -v
```
Expected: `ModuleNotFoundError` — embedder doesn't exist yet.

**Step 3: Write minimal implementation**

```python
# corpus/core/embedder.py
"""
Gemini embedding client for corpus ingestion.

Mirrors epi-claw src/memory/embeddings-gemini.ts.
Model: gemini-embedding-001 (1536-dim)
Endpoint: https://generativelanguage.googleapis.com/v1beta
"""

import os
import requests
from typing import Optional

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
EMBED_MODEL = "gemini-embedding-001"
MODEL_PATH = f"models/{EMBED_MODEL}"
EMBED_DIM = 1536

def _api_key() -> str:
    key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not key:
        raise EnvironmentError("GOOGLE_API_KEY or GEMINI_API_KEY must be set")
    return key

def _headers() -> dict:
    return {"Content-Type": "application/json", "x-goog-api-key": _api_key()}

def embed_query(text: str) -> list[float]:
    """Embed a single query string (RETRIEVAL_QUERY task type)."""
    if not text.strip():
        return []
    url = f"{GEMINI_BASE_URL}/{MODEL_PATH}:embedContent"
    resp = requests.post(url, headers=_headers(), json={
        "content": {"parts": [{"text": text}]},
        "taskType": "RETRIEVAL_QUERY",
    })
    resp.raise_for_status()
    return resp.json()["embedding"]["values"]

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of document texts (RETRIEVAL_DOCUMENT task type)."""
    if not texts:
        return []
    url = f"{GEMINI_BASE_URL}/{MODEL_PATH}:batchEmbedContents"
    requests_payload = [
        {"model": MODEL_PATH, "content": {"parts": [{"text": t}]}, "taskType": "RETRIEVAL_DOCUMENT"}
        for t in texts
    ]
    resp = requests.post(url, headers=_headers(), json={"requests": requests_payload})
    resp.raise_for_status()
    embeddings = resp.json().get("embeddings", [])
    return [e.get("values", []) for e in embeddings]
```

**Step 4: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_embedder.py -v
```
Expected: All 3 tests PASS.

**Step 5: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/
git commit -m "feat(epii/corpus): scaffold package + Gemini embed client (gemini-embedding-001, 1536-dim)"
```

---

## Task 2: Neo4j Store — T1Chunk CRUD + Vector Index

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/neo4j_store.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_neo4j_store.py`

**Read first:** `Idea/Pratibimba/System/Subsystems/Parashakti/graph/client.py` to understand `Neo4jClient.run()` and `Neo4jConfig.from_env()`.

**Step 1: Write the failing tests**

```python
# tests/test_neo4j_store.py
import pytest
from unittest.mock import MagicMock, patch
from ..core.neo4j_store import CorpusStore, T1ChunkData

def make_store():
    mock_client = MagicMock()
    mock_client.run.return_value = []
    mock_client.run_single.return_value = None
    return CorpusStore(client=mock_client)

def test_ensure_vector_index_executes_cypher():
    store = make_store()
    store.ensure_vector_index()
    # Should have called run with CREATE VECTOR INDEX
    calls = store.client.execute.call_args_list
    assert any("VECTOR INDEX" in str(c) for c in calls)

def test_find_t1document_by_path_returns_none_when_missing():
    store = make_store()
    store.client.run_single.return_value = None
    result = store.find_t1document(path="Idea/Bimba/Library/Books/M5/test.md")
    assert result is None

def test_write_chunks_calls_run_for_each_chunk():
    store = make_store()
    doc_uuid = "doc-123"
    chunks = [
        T1ChunkData(
            uuid="chunk-1", raw_content="text one", contextual_content="ctx one",
            embedding=[0.1] * 1536, chunk_index=0, total_chunks=2,
            section_heading="Intro", speaker=None, turn_index=None,
            source_type="Books", coordinate="M5",
        ),
        T1ChunkData(
            uuid="chunk-2", raw_content="text two", contextual_content="ctx two",
            embedding=[0.2] * 1536, chunk_index=1, total_chunks=2,
            section_heading="Body", speaker=None, turn_index=None,
            source_type="Books", coordinate="M5",
        ),
    ]
    store.write_chunks(doc_uuid=doc_uuid, chunks=chunks)
    assert store.client.execute.call_count >= 2

def test_query_chunks_calls_vector_search():
    store = make_store()
    store.client.run.return_value = [
        {"chunk": {"uuid": "c1", "contextual_content": "result text"}, "score": 0.9}
    ]
    results = store.query_chunks(query_embedding=[0.5] * 1536, top_k=3)
    assert len(results) == 1
    assert results[0]["score"] == 0.9
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_neo4j_store.py -v
```
Expected: `ModuleNotFoundError` — neo4j_store doesn't exist yet.

**Step 3: Write minimal implementation**

```python
# corpus/core/neo4j_store.py
"""
Neo4j store for T1Chunk nodes.

Extends Parashakti Neo4jClient with T1 corpus label namespace.
Schema: (:T1Document)-[:pos_t_has_chunk]->(:T1Chunk)
Vector index: t1chunk_embeddings, 1536-dim cosine.
"""

import sys
import uuid as uuid_lib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Any

# Reuse existing Parashakti client
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
from Parashakti.graph.client import Neo4jClient, Neo4jConfig

EMBED_DIM = 1536
INDEX_NAME = "t1chunk_embeddings"


@dataclass
class T1ChunkData:
    uuid: str
    raw_content: str
    contextual_content: str   # context prefix + raw_content (what gets embedded)
    embedding: list[float]    # 1536-dim
    chunk_index: int
    total_chunks: int
    section_heading: Optional[str]
    speaker: Optional[str]    # "user" | "agent" | None
    turn_index: Optional[int] # for chat logs
    source_type: str          # Books | Canonical | SourceTexts | ChatLogs
    coordinate: str           # e.g. "M5"


class CorpusStore:
    """
    CRUD operations for T1Chunk nodes in Neo4j.

    Chunks are children of existing T1Document nodes (managed by Hen sync).
    """

    def __init__(self, client: Optional[Neo4jClient] = None):
        self.client = client or Neo4jClient(Neo4jConfig.from_env())

    def ensure_vector_index(self) -> None:
        """Create vector index on T1Chunk.embedding if it doesn't exist."""
        self.client.execute(f"""
            CREATE VECTOR INDEX {INDEX_NAME} IF NOT EXISTS
            FOR (n:T1Chunk) ON n.embedding
            OPTIONS {{
                indexConfig: {{
                    `vector.dimensions`: {EMBED_DIM},
                    `vector.similarity_function`: 'cosine'
                }}
            }}
        """)

    def find_t1document(self, path: str) -> Optional[dict]:
        """Find an existing Hen-synced T1Document node by vault path."""
        return self.client.run_single(
            "MATCH (d:T1Document {path: $path}) RETURN d",
            {"path": path}
        )

    def create_t1document(
        self, path: str, title: str, coordinate: str, source_type: str,
        raw_content: str = "", author: str = ""
    ) -> str:
        """
        Create a minimal T1Document node (Hen will enrich on next sync).
        Returns the node uuid.
        """
        doc_uuid = str(uuid_lib.uuid4())
        self.client.execute(
            """
            MERGE (d:T1Document {path: $path})
            ON CREATE SET
                d.uuid = $uuid,
                d.title = $title,
                d.coordinate = $coordinate,
                d.source_type = $source_type,
                d.raw_content = $raw_content,
                d.author = $author,
                d.hen_managed = false
            RETURN d.uuid
            """,
            {
                "path": path, "uuid": doc_uuid, "title": title,
                "coordinate": coordinate, "source_type": source_type,
                "raw_content": raw_content, "author": author,
            }
        )
        return doc_uuid

    def write_chunks(self, doc_uuid: str, chunks: list[T1ChunkData]) -> None:
        """Write T1Chunk nodes linked to a T1Document."""
        for chunk in chunks:
            self.client.execute(
                """
                MATCH (d:T1Document {uuid: $doc_uuid})
                MERGE (c:T1Chunk {uuid: $uuid})
                SET
                    c.raw_content = $raw_content,
                    c.contextual_content = $contextual_content,
                    c.embedding = $embedding,
                    c.chunk_index = $chunk_index,
                    c.total_chunks = $total_chunks,
                    c.section_heading = $section_heading,
                    c.speaker = $speaker,
                    c.turn_index = $turn_index,
                    c.source_type = $source_type,
                    c.coordinate = $coordinate
                MERGE (d)-[:pos_t_has_chunk]->(c)
                MERGE (c)-[:pos_t_extracted_from]->(d)
                """,
                {
                    "doc_uuid": doc_uuid,
                    "uuid": chunk.uuid,
                    "raw_content": chunk.raw_content,
                    "contextual_content": chunk.contextual_content,
                    "embedding": chunk.embedding,
                    "chunk_index": chunk.chunk_index,
                    "total_chunks": chunk.total_chunks,
                    "section_heading": chunk.section_heading,
                    "speaker": chunk.speaker,
                    "turn_index": chunk.turn_index,
                    "source_type": chunk.source_type,
                    "coordinate": chunk.coordinate,
                }
            )

    def query_chunks(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        coordinate: Optional[str] = None,
        source_type: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Vector similarity search over T1Chunk nodes."""
        where_clauses = []
        params: dict = {"query_embedding": query_embedding, "top_k": top_k}
        if coordinate:
            where_clauses.append("chunk.coordinate = $coordinate")
            params["coordinate"] = coordinate
        if source_type:
            where_clauses.append("chunk.source_type = $source_type")
            params["source_type"] = source_type
        where = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        return self.client.run(
            f"""
            CALL db.index.vector.queryNodes($index, $top_k, $query_embedding)
            YIELD node AS chunk, score
            {where}
            MATCH (doc:T1Document)-[:pos_t_has_chunk]->(chunk)
            RETURN chunk, doc, score
            ORDER BY score DESC
            """,
            {**params, "index": INDEX_NAME}
        )
```

**Step 4: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_neo4j_store.py -v
```
Expected: All 4 tests PASS.

**Step 5: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/core/neo4j_store.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_neo4j_store.py
git commit -m "feat(epii/corpus): T1Chunk Neo4j store with vector index (pos_t_has_chunk schema)"
```

---

## Task 3: Chunker — Docling Parse + Anthropic Contextual RAG

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/chunker.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chunker.py`

**What contextual RAG means concretely:**
For each raw chunk, call Gemini Flash with:
```
<document>{whole_doc}</document>
Situate this chunk for retrieval (1-2 sentences):
<chunk>{chunk_text}</chunk>
```
Prepend the 1-2 sentence response to the raw chunk. Embed the combined text.

**Step 1: Write the failing tests**

```python
# tests/test_chunker.py
import pytest
from unittest.mock import patch, MagicMock
from ..core.chunker import contextualize_chunk, chunk_document, RawChunk

def test_contextualize_chunk_prepends_context():
    with patch("google.generativeai.GenerativeModel") as MockModel:
        mock_instance = MagicMock()
        MockModel.return_value = mock_instance
        mock_instance.generate_content.return_value = MagicMock(
            text="This chunk discusses the nature of recognition in Kashmir Shaivism."
        )
        result = contextualize_chunk(
            whole_doc="Full book content here...",
            chunk_text="The nature of recognition (pratyabhijna) is...",
        )
    assert result.startswith("This chunk discusses")
    assert "pratyabhijna" in result

def test_chunk_document_returns_raw_chunks(tmp_path):
    # Create a simple test markdown file
    test_file = tmp_path / "test.md"
    test_file.write_text("# Section One\n\nFirst paragraph content.\n\n# Section Two\n\nSecond paragraph content.")

    chunks = chunk_document(str(test_file))
    assert len(chunks) >= 1
    assert all(isinstance(c, RawChunk) for c in chunks)
    assert all(c.text for c in chunks)
    assert all(c.section_heading is not None or c.chunk_index >= 0 for c in chunks)

def test_chunk_document_pdf_falls_back_gracefully(tmp_path):
    # Non-existent file should raise FileNotFoundError
    with pytest.raises(FileNotFoundError):
        chunk_document("/nonexistent/path/file.pdf")
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chunker.py -v
```
Expected: `ModuleNotFoundError`.

**Step 3: Write minimal implementation**

```python
# corpus/core/chunker.py
"""
Document chunker using docling + Anthropic contextual RAG approach.

For each raw chunk:
  1. Call Gemini Flash with (whole_doc, chunk) → 1-2 sentence context
  2. Final text = "{context}\\n\\n{chunk_text}"  ← this is what gets embedded

docling handles structure-preserving parse for PDF/DOCX/EPUB/HTML/MD.
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY", ""))

CONTEXT_MODEL = "gemini-2.0-flash"  # free tier, bulk op
CHUNK_SIZE = 1500      # characters — docling sections may be shorter
CHUNK_OVERLAP = 150    # characters

CONTEXT_PROMPT = """\
<document>
{whole_doc}
</document>

Here is the chunk we want to situate within the above document:

<chunk>
{chunk_text}
</chunk>

Give a short succinct context (1-2 sentences max) to situate this chunk \
within the overall document for search retrieval purposes. \
Answer only with the context and nothing else."""


@dataclass
class RawChunk:
    text: str
    section_heading: Optional[str]
    chunk_index: int


def contextualize_chunk(whole_doc: str, chunk_text: str) -> str:
    """
    Generate context prefix and prepend to chunk (Anthropic contextual RAG).
    Returns: "{context}\\n\\n{chunk_text}"
    """
    model = genai.GenerativeModel(CONTEXT_MODEL)
    response = model.generate_content(
        CONTEXT_PROMPT.format(whole_doc=whole_doc[:8000], chunk_text=chunk_text)
    )
    context = response.text.strip()
    return f"{context}\n\n{chunk_text}"


def chunk_document(file_path: str) -> list[RawChunk]:
    """
    Parse a document with docling and return raw chunks.

    Supports: PDF, DOCX, EPUB, HTML, MD.
    Uses docling's HybridChunker for section-aware chunking.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    try:
        from docling.document_converter import DocumentConverter
        from docling.chunking import HybridChunker

        converter = DocumentConverter()
        doc_result = converter.convert(str(path))
        doc = doc_result.document

        chunker = HybridChunker(max_tokens=CHUNK_SIZE // 4)  # ~4 chars/token
        chunks = list(chunker.chunk(doc))

        raw_chunks = []
        for i, chunk in enumerate(chunks):
            heading = None
            # docling chunks carry metadata about their section
            if hasattr(chunk, "meta") and chunk.meta:
                headings = getattr(chunk.meta, "headings", None)
                if headings:
                    heading = headings[-1]  # deepest heading
            raw_chunks.append(RawChunk(
                text=chunk.text,
                section_heading=heading,
                chunk_index=i,
            ))
        return raw_chunks

    except ImportError:
        raise ImportError(
            "docling is required: pip install docling"
        )
```

**Step 4: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chunker.py -v
```
Expected: All 3 tests PASS. (Note: `test_chunk_document_returns_raw_chunks` works with markdown without docling if fallback is needed — docling handles .md natively.)

**Step 5: Install docling if needed**

```bash
pip install docling
```

**Step 6: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/core/chunker.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chunker.py
git commit -m "feat(epii/corpus): docling chunker + Anthropic contextual RAG context prefix"
```

---

## Task 4: Turn Splitter — Chat Log Ingestion

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/turn_splitter.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_turn_splitter.py`

**Step 1: Write the failing tests**

```python
# tests/test_turn_splitter.py
import pytest
from ..core.turn_splitter import split_turns, Turn, ChatLog

def test_split_turns_from_raw_list():
    raw = [
        {"speaker": "user", "content": "What is integration?", "turn_index": 0},
        {"speaker": "agent", "content": "Integration is the synthesis...", "turn_index": 1},
    ]
    turns = split_turns(raw)
    assert len(turns) == 2
    assert turns[0].speaker == "user"
    assert turns[1].speaker == "agent"
    assert turns[0].turn_index == 0

def test_split_turns_assigns_indices_if_missing():
    raw = [
        {"speaker": "user", "content": "Hello"},
        {"speaker": "agent", "content": "Hi"},
    ]
    turns = split_turns(raw)
    assert turns[0].turn_index == 0
    assert turns[1].turn_index == 1

def test_chat_log_to_raw_chunks():
    log = ChatLog(
        session_id="sess-123",
        platform="claude",
        coordinate="M5",
        turns=[
            Turn(speaker="user", content="Explain Epii", turn_index=0),
            Turn(speaker="agent", content="Epii is the integration layer...", turn_index=1),
        ]
    )
    from ..core.turn_splitter import chatlog_to_chunks
    chunks = chatlog_to_chunks(log)
    assert len(chunks) == 2
    assert chunks[0].speaker == "user"
    assert chunks[1].speaker == "agent"
    assert "Explain Epii" in chunks[0].text

def test_empty_turns_returns_empty():
    assert split_turns([]) == []
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_turn_splitter.py -v
```
Expected: `ModuleNotFoundError`.

**Step 3: Write minimal implementation**

```python
# corpus/core/turn_splitter.py
"""
Chat log turn splitter.

Each turn (user or agent message) becomes one RawChunk.
Speaker and turn_index are preserved as metadata.
"""

from dataclasses import dataclass, field
from typing import Optional
from .chunker import RawChunk


@dataclass
class Turn:
    speaker: str          # "user" | "agent"
    content: str
    turn_index: int
    timestamp: Optional[str] = None


@dataclass
class ChatLog:
    session_id: str
    platform: str         # "claude" | "chatgpt" | "gemini" | "custom"
    coordinate: str
    turns: list[Turn] = field(default_factory=list)


def split_turns(raw: list[dict]) -> list[Turn]:
    """Parse raw turn dicts into Turn objects, assigning indices if missing."""
    turns = []
    for i, item in enumerate(raw):
        turns.append(Turn(
            speaker=item.get("speaker", "unknown"),
            content=item.get("content", ""),
            turn_index=item.get("turn_index", i),
            timestamp=item.get("timestamp"),
        ))
    return turns


def chatlog_to_chunks(log: ChatLog) -> list[RawChunk]:
    """
    Convert a ChatLog into RawChunks (one per turn).

    Each chunk carries speaker and turn_index via the RawChunk.
    The section_heading encodes speaker context for the contextualizer.
    """
    chunks = []
    for turn in log.turns:
        heading = f"[{turn.speaker.upper()} turn {turn.turn_index}]"
        chunks.append(RawChunk(
            text=turn.content,
            section_heading=heading,
            chunk_index=turn.turn_index,
        ))
    return chunks
```

**Step 4: Note:** `RawChunk` doesn't carry `speaker`/`turn_index` fields yet — these are needed for the Neo4j store. Extend `RawChunk` in `chunker.py`:

```python
@dataclass
class RawChunk:
    text: str
    section_heading: Optional[str]
    chunk_index: int
    speaker: Optional[str] = None       # add these
    turn_index: Optional[int] = None    # add these
```

Update `chatlog_to_chunks` to set them:
```python
chunks.append(RawChunk(
    text=turn.content,
    section_heading=heading,
    chunk_index=turn.turn_index,
    speaker=turn.speaker,
    turn_index=turn.turn_index,
))
```

**Step 5: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_turn_splitter.py -v
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chunker.py -v
```
Expected: All tests PASS.

**Step 6: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/core/turn_splitter.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/core/chunker.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_turn_splitter.py
git commit -m "feat(epii/corpus): chat log turn splitter + extend RawChunk with speaker metadata"
```

---

## Task 5: Ingester — Full Pipeline Orchestrator

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/ingester.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_ingester.py`

This ties together: parse → contextualize → embed → write to Neo4j.

**Step 1: Write the failing tests**

```python
# tests/test_ingester.py
import pytest
from unittest.mock import patch, MagicMock, call
from pathlib import Path
from ..core.ingester import ingest_document, IngestResult

@pytest.fixture
def mock_deps():
    """Mock all external I/O so the pipeline runs without Neo4j or Gemini."""
    with (
        patch("..core.ingester.chunk_document") as mock_chunk,
        patch("..core.ingester.contextualize_chunk") as mock_ctx,
        patch("..core.ingester.embed_texts") as mock_embed,
        patch("..core.ingester.CorpusStore") as MockStore,
    ):
        mock_chunk.return_value = [
            MagicMock(text="chunk one text", section_heading="Section 1", chunk_index=0, speaker=None, turn_index=None),
            MagicMock(text="chunk two text", section_heading="Section 1", chunk_index=1, speaker=None, turn_index=None),
        ]
        mock_ctx.side_effect = lambda whole_doc, chunk_text: f"Context. {chunk_text}"
        mock_embed.return_value = [[0.1] * 1536, [0.2] * 1536]

        store_instance = MagicMock()
        store_instance.find_t1document.return_value = {"uuid": "existing-doc-uuid"}
        MockStore.return_value = store_instance

        yield {
            "chunk": mock_chunk,
            "ctx": mock_ctx,
            "embed": mock_embed,
            "store": store_instance,
        }

def test_ingest_document_calls_full_pipeline(mock_deps, tmp_path):
    test_file = tmp_path / "test.md"
    test_file.write_text("# Test\n\nContent here.")

    result = ingest_document(
        file_path=str(test_file),
        coordinate="M5",
        source_type="Books",
    )

    assert isinstance(result, IngestResult)
    assert result.chunks_written == 2
    assert result.doc_uuid == "existing-doc-uuid"
    mock_deps["embed"].assert_called_once()
    mock_deps["store"].write_chunks.assert_called_once()

def test_ingest_document_creates_doc_if_not_found(mock_deps, tmp_path):
    test_file = tmp_path / "new.md"
    test_file.write_text("# New Doc\n\nContent.")
    mock_deps["store"].find_t1document.return_value = None
    mock_deps["store"].create_t1document.return_value = "new-doc-uuid"

    result = ingest_document(str(test_file), coordinate="M5", source_type="Canonical")

    mock_deps["store"].create_t1document.assert_called_once()
    assert result.doc_uuid == "new-doc-uuid"

def test_ingest_document_embeds_contextual_content(mock_deps, tmp_path):
    """Verify that contextual content (not raw) is what gets embedded."""
    test_file = tmp_path / "ctx.md"
    test_file.write_text("Content.")

    ingest_document(str(test_file), coordinate="M2", source_type="SourceTexts")

    # embed_texts should receive the contextualized strings
    embedded_texts = mock_deps["embed"].call_args[0][0]
    assert all("Context." in t for t in embedded_texts)
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_ingester.py -v
```
Expected: `ModuleNotFoundError`.

**Step 3: Write minimal implementation**

```python
# corpus/core/ingester.py
"""
Full ingestion pipeline orchestrator for structured documents.

Pipeline: parse → contextualize (contextual RAG) → embed → neo4j store
"""

import uuid as uuid_lib
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from .chunker import chunk_document, contextualize_chunk
from .embedder import embed_texts
from .neo4j_store import CorpusStore, T1ChunkData


@dataclass
class IngestResult:
    doc_uuid: str
    file_path: str
    chunks_written: int
    coordinate: str
    source_type: str


def ingest_document(
    file_path: str,
    coordinate: str,
    source_type: str,
    author: str = "",
    title: str = "",
    store: Optional[CorpusStore] = None,
) -> IngestResult:
    """
    Ingest a structured document into the T1 corpus.

    1. Parse with docling → raw chunks
    2. For each chunk: call Gemini Flash → context prefix → contextual_content
    3. Batch embed all contextual_content strings
    4. Find or create T1Document in Neo4j
    5. Write T1Chunk nodes
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Not found: {file_path}")

    store = store or CorpusStore()
    store.ensure_vector_index()

    # 1. Parse
    raw_chunks = chunk_document(file_path)
    whole_doc = " ".join(c.text for c in raw_chunks)[:12000]  # context window cap

    # 2. Contextualize (contextual RAG)
    contextual_texts = [
        contextualize_chunk(whole_doc=whole_doc, chunk_text=c.text)
        for c in raw_chunks
    ]

    # 3. Embed (batch call)
    embeddings = embed_texts(contextual_texts)

    # 4. Find or create T1Document
    vault_path = str(path)
    doc_title = title or path.stem
    doc_record = store.find_t1document(path=vault_path)
    if doc_record:
        doc_uuid = doc_record.get("d", {}).get("uuid") or doc_record.get("uuid", str(uuid_lib.uuid4()))
    else:
        doc_uuid = store.create_t1document(
            path=vault_path,
            title=doc_title,
            coordinate=coordinate,
            source_type=source_type,
            raw_content=whole_doc,
            author=author,
        )

    # 5. Write chunks
    chunk_data = [
        T1ChunkData(
            uuid=str(uuid_lib.uuid4()),
            raw_content=raw.text,
            contextual_content=contextual_texts[i],
            embedding=embeddings[i],
            chunk_index=raw.chunk_index,
            total_chunks=len(raw_chunks),
            section_heading=raw.section_heading,
            speaker=getattr(raw, "speaker", None),
            turn_index=getattr(raw, "turn_index", None),
            source_type=source_type,
            coordinate=coordinate,
        )
        for i, raw in enumerate(raw_chunks)
    ]
    store.write_chunks(doc_uuid=doc_uuid, chunks=chunk_data)

    return IngestResult(
        doc_uuid=doc_uuid,
        file_path=vault_path,
        chunks_written=len(chunk_data),
        coordinate=coordinate,
        source_type=source_type,
    )
```

**Step 4: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_ingester.py -v
```
Expected: All 3 tests PASS.

**Step 5: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/core/ingester.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_ingester.py
git commit -m "feat(epii/corpus): ingester pipeline orchestrator (parse→contextualize→embed→store)"
```

---

## Task 6: Chat Log Ingester

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/core/chat_ingester.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chat_ingester.py`

**Step 1: Write the failing tests**

```python
# tests/test_chat_ingester.py
import pytest
from unittest.mock import patch, MagicMock
from ..core.chat_ingester import ingest_chat_log, IngestResult
from ..core.turn_splitter import Turn, ChatLog

@pytest.fixture
def sample_log():
    return ChatLog(
        session_id="sess-abc",
        platform="claude",
        coordinate="M5",
        turns=[
            Turn(speaker="user", content="What is the Möbius return?", turn_index=0),
            Turn(speaker="agent", content="The Möbius return is the 5→0 cycle...", turn_index=1),
            Turn(speaker="user", content="And how does it relate to epii?", turn_index=2),
        ]
    )

def test_ingest_chat_log_creates_three_chunks(sample_log):
    with (
        patch("..core.chat_ingester.contextualize_chunk") as mock_ctx,
        patch("..core.chat_ingester.embed_texts") as mock_embed,
        patch("..core.chat_ingester.CorpusStore") as MockStore,
    ):
        mock_ctx.side_effect = lambda whole_doc, chunk_text: f"Chat context. {chunk_text}"
        mock_embed.return_value = [[0.1] * 1536] * 3
        store = MagicMock()
        store.find_t1document.return_value = None
        store.create_t1document.return_value = "chat-doc-uuid"
        MockStore.return_value = store

        result = ingest_chat_log(log=sample_log)

    assert result.chunks_written == 3
    chunks_written = store.write_chunks.call_args[1]["chunks"]
    assert chunks_written[0].speaker == "user"
    assert chunks_written[1].speaker == "agent"

def test_ingest_chat_log_preserves_speaker_in_neo4j(sample_log):
    with (
        patch("..core.chat_ingester.contextualize_chunk") as mock_ctx,
        patch("..core.chat_ingester.embed_texts") as mock_embed,
        patch("..core.chat_ingester.CorpusStore") as MockStore,
    ):
        mock_ctx.side_effect = lambda whole_doc, chunk_text: f"Ctx. {chunk_text}"
        mock_embed.return_value = [[0.5] * 1536] * 3
        store = MagicMock()
        store.find_t1document.return_value = {"uuid": "existing"}
        MockStore.return_value = store

        ingest_chat_log(log=sample_log)

    chunks = store.write_chunks.call_args[1]["chunks"]
    speakers = [c.speaker for c in chunks]
    assert speakers == ["user", "agent", "user"]
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chat_ingester.py -v
```

**Step 3: Write minimal implementation**

```python
# corpus/core/chat_ingester.py
"""
Chat log ingestion pipeline.

Each turn = one T1Chunk with speaker and turn_index metadata.
Context prefix describes the conversational position of each turn.
"""

import uuid as uuid_lib
from typing import Optional

from .chunker import contextualize_chunk
from .embedder import embed_texts
from .neo4j_store import CorpusStore, T1ChunkData
from .turn_splitter import ChatLog, chatlog_to_chunks
from .ingester import IngestResult


def ingest_chat_log(
    log: ChatLog,
    store: Optional[CorpusStore] = None,
) -> IngestResult:
    """
    Ingest a ChatLog into the T1 corpus (one chunk per turn).
    """
    store = store or CorpusStore()
    store.ensure_vector_index()

    raw_chunks = chatlog_to_chunks(log)
    # Whole doc = the full conversation for context generation
    whole_doc = "\n\n".join(
        f"[{t.speaker.upper()}]: {t.content}" for t in log.turns
    )[:12000]

    # Contextualize each turn
    contextual_texts = [
        contextualize_chunk(whole_doc=whole_doc, chunk_text=c.text)
        for c in raw_chunks
    ]

    # Embed batch
    embeddings = embed_texts(contextual_texts)

    # Find or create T1Document for this session
    doc_path = f"ChatLogs/{log.platform}/{log.session_id}"
    doc_record = store.find_t1document(path=doc_path)
    if doc_record:
        doc_uuid = doc_record.get("d", {}).get("uuid") or doc_record.get("uuid", str(uuid_lib.uuid4()))
    else:
        doc_uuid = store.create_t1document(
            path=doc_path,
            title=f"Chat session {log.session_id}",
            coordinate=log.coordinate,
            source_type="ChatLogs",
            raw_content=whole_doc,
        )

    chunk_data = [
        T1ChunkData(
            uuid=str(uuid_lib.uuid4()),
            raw_content=raw.text,
            contextual_content=contextual_texts[i],
            embedding=embeddings[i],
            chunk_index=raw.chunk_index,
            total_chunks=len(raw_chunks),
            section_heading=raw.section_heading,
            speaker=raw.speaker,
            turn_index=raw.turn_index,
            source_type="ChatLogs",
            coordinate=log.coordinate,
        )
        for i, raw in enumerate(raw_chunks)
    ]
    store.write_chunks(doc_uuid=doc_uuid, chunks=chunk_data)

    return IngestResult(
        doc_uuid=doc_uuid,
        file_path=doc_path,
        chunks_written=len(chunk_data),
        coordinate=log.coordinate,
        source_type="ChatLogs",
    )
```

**Step 4: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chat_ingester.py -v
```
Expected: Both tests PASS.

**Step 5: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/core/chat_ingester.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_chat_ingester.py
git commit -m "feat(epii/corpus): chat log ingester (turn-per-chunk, speaker metadata preserved)"
```

---

## Task 7: CLI — Batch Ingestion Interface

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/cli.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_cli.py`

**Step 1: Write the failing tests**

```python
# tests/test_cli.py
import pytest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner
from ..cli import cli

def test_cli_ingest_command_runs():
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Create a test file
        with open("test.md", "w") as f:
            f.write("# Test\n\nContent.")

        with patch("..cli.ingest_document") as mock_ingest:
            mock_ingest.return_value = MagicMock(chunks_written=3, doc_uuid="uuid-1")
            result = runner.invoke(cli, ["ingest", "test.md", "--coord", "M5", "--type", "Canonical"])

    assert result.exit_code == 0
    assert "3 chunks" in result.output

def test_cli_query_command_runs():
    runner = CliRunner()
    with patch("..cli.embed_query") as mock_embed:
        with patch("..cli.CorpusStore") as MockStore:
            mock_embed.return_value = [0.1] * 1536
            store = MagicMock()
            store.query_chunks.return_value = [
                {"chunk": {"contextual_content": "Result text"}, "score": 0.92}
            ]
            MockStore.return_value = store
            result = runner.invoke(cli, ["query", "what is integration", "--coord", "M5"])

    assert result.exit_code == 0
    assert "Result text" in result.output or "0.92" in result.output

def test_cli_missing_file_exits_nonzero():
    runner = CliRunner()
    result = runner.invoke(cli, ["ingest", "/nonexistent.pdf", "--coord", "M5", "--type", "Books"])
    assert result.exit_code != 0
```

**Step 2: Run to verify they fail**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_cli.py -v
```

**Step 3: Write minimal implementation**

```python
# corpus/cli.py
"""
Batch CLI for corpus ingestion.

Usage:
  python -m epii.corpus.cli ingest tantraloka.pdf --coord M5 --type Books --author Abhinavagupta
  python -m epii.corpus.cli query "nature of recognition" --coord M5
  python -m epii.corpus.cli list --type Books
"""

import click
from pathlib import Path

from .core.ingester import ingest_document
from .core.chat_ingester import ingest_chat_log
from .core.turn_splitter import ChatLog, Turn, split_turns
from .core.embedder import embed_query
from .core.neo4j_store import CorpusStore

import json


@click.group()
def cli():
    """Epii corpus ingestion pipeline."""
    pass


@cli.command()
@click.argument("file_path")
@click.option("--coord", required=True, help="Bimba coordinate (e.g. M5, M1-3)")
@click.option("--type", "source_type", required=True,
              type=click.Choice(["Books", "Canonical", "SourceTexts"]),
              help="Source type")
@click.option("--author", default="", help="Author name (optional)")
@click.option("--title", default="", help="Title override (optional)")
def ingest(file_path, coord, source_type, author, title):
    """Ingest a structured document (PDF/DOCX/EPUB/MD) into the T1 corpus."""
    path = Path(file_path)
    if not path.exists():
        raise click.ClickException(f"File not found: {file_path}")

    click.echo(f"Ingesting {path.name} → coordinate={coord}, type={source_type}...")
    result = ingest_document(
        file_path=file_path,
        coordinate=coord,
        source_type=source_type,
        author=author,
        title=title,
    )
    click.echo(f"✓ Done: {result.chunks_written} chunks written, doc_uuid={result.doc_uuid}")


@cli.command()
@click.argument("query_text")
@click.option("--coord", default=None, help="Filter by coordinate")
@click.option("--type", "source_type", default=None, help="Filter by source type")
@click.option("--top-k", default=5, help="Number of results")
def query(query_text, coord, source_type, top_k):
    """Semantic search over T1Chunk nodes."""
    click.echo(f"Querying: '{query_text}'...")
    q_embedding = embed_query(query_text)
    store = CorpusStore()
    results = store.query_chunks(
        query_embedding=q_embedding,
        top_k=top_k,
        coordinate=coord,
        source_type=source_type,
    )
    for i, r in enumerate(results, 1):
        chunk = r.get("chunk", {})
        score = r.get("score", 0)
        content = chunk.get("contextual_content", "")[:200]
        click.echo(f"\n[{i}] score={score:.3f}\n{content}...")


@cli.command("list")
@click.option("--type", "source_type", default=None, help="Filter by source type")
@click.option("--coord", default=None, help="Filter by coordinate")
def list_docs(source_type, coord):
    """List indexed T1Document nodes."""
    store = CorpusStore()
    where = []
    params = {}
    if source_type:
        where.append("d.source_type = $source_type")
        params["source_type"] = source_type
    if coord:
        where.append("d.coordinate = $coordinate")
        params["coordinate"] = coord
    where_clause = f"WHERE {' AND '.join(where)}" if where else ""
    docs = store.client.run(
        f"MATCH (d:T1Document) {where_clause} RETURN d.title, d.coordinate, d.source_type, d.path",
        params
    )
    if not docs:
        click.echo("No documents found.")
        return
    for doc in docs:
        click.echo(f"  [{doc.get('d.coordinate')}] {doc.get('d.title')} ({doc.get('d.source_type')})")


if __name__ == "__main__":
    cli()
```

**Step 4: Install click if needed**

```bash
pip install click
```

**Step 5: Run tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_cli.py -v
```
Expected: All 3 tests PASS.

**Step 6: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/cli.py \
        Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_cli.py
git commit -m "feat(epii/corpus): batch CLI — ingest / query / list commands"
```

---

## Task 8: Integration Test — End-to-End Pipeline Smoke Test

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_integration.py`

This test verifies the full pipeline wires together correctly using mocks for all I/O. No live Neo4j or Gemini API needed.

**Step 1: Write the integration test**

```python
# tests/test_integration.py
"""
End-to-end pipeline smoke test.
Verifies parse → contextualize → embed → neo4j write flows without live services.
"""

import pytest
from unittest.mock import patch, MagicMock, call
from pathlib import Path


def test_full_document_pipeline(tmp_path):
    """Ingest a markdown file through the full pipeline."""
    doc = tmp_path / "philosophy.md"
    doc.write_text(
        "# On Integration\n\n"
        "The synthesis point where all streams converge.\n\n"
        "# On Möbius Return\n\n"
        "Synthesis becomes new ground (5→0).\n"
    )

    with (
        patch("Idea.Pratibimba.System.Subsystems.epii.corpus.core.chunker.DocumentConverter") as MockConverter,
        patch("Idea.Pratibimba.System.Subsystems.epii.corpus.core.chunker.HybridChunker") as MockChunker,
        patch("Idea.Pratibimba.System.Subsystems.epii.corpus.core.chunker.genai") as mock_genai,
        patch("Idea.Pratibimba.System.Subsystems.epii.corpus.core.embedder.requests.post") as mock_post,
        patch("Idea.Pratibimba.System.Subsystems.epii.corpus.core.neo4j_store.Neo4jClient") as MockNeo4j,
    ):
        # docling mock
        mock_chunk_obj = MagicMock()
        mock_chunk_obj.text = "The synthesis point where all streams converge."
        mock_chunk_obj.meta = MagicMock(headings=["On Integration"])
        MockChunker.return_value.chunk.return_value = [mock_chunk_obj]

        # Gemini Flash context mock
        mock_genai.GenerativeModel.return_value.generate_content.return_value = MagicMock(
            text="This chunk discusses M5 integration in the QL system."
        )

        # Gemini embed mock
        mock_post.return_value = MagicMock(
            ok=True,
            json=lambda: {"embeddings": [{"values": [0.42] * 1536}]}
        )

        # Neo4j mock
        neo4j_instance = MagicMock()
        neo4j_instance.run_single.return_value = None  # doc not found → create it
        neo4j_instance.run.return_value = []
        MockNeo4j.return_value = neo4j_instance

        from ..core.ingester import ingest_document
        result = ingest_document(
            file_path=str(doc),
            coordinate="M5",
            source_type="Canonical",
        )

    assert result.chunks_written == 1
    assert result.coordinate == "M5"
    # Verify write_chunks was called (via execute)
    assert neo4j_instance.execute.called


def test_full_chat_log_pipeline():
    """Ingest a chat log through the full pipeline."""
    from ..core.turn_splitter import ChatLog, Turn

    log = ChatLog(
        session_id="test-session-001",
        platform="claude",
        coordinate="M5",
        turns=[
            Turn(speaker="user", content="Explain the Möbius return", turn_index=0),
            Turn(speaker="agent", content="The Möbius return is 5→0 synthesis back to ground", turn_index=1),
        ]
    )

    with (
        patch("..core.chat_ingester.contextualize_chunk") as mock_ctx,
        patch("..core.chat_ingester.embed_texts") as mock_embed,
        patch("..core.chat_ingester.CorpusStore") as MockStore,
    ):
        mock_ctx.side_effect = lambda whole_doc, chunk_text: f"Chat ctx: {chunk_text}"
        mock_embed.return_value = [[0.1] * 1536, [0.2] * 1536]
        store = MagicMock()
        store.find_t1document.return_value = None
        store.create_t1document.return_value = "chat-doc-123"
        MockStore.return_value = store

        from ..core.chat_ingester import ingest_chat_log
        result = ingest_chat_log(log=log)

    assert result.chunks_written == 2
    chunks = store.write_chunks.call_args[1]["chunks"]
    assert chunks[0].speaker == "user"
    assert chunks[1].speaker == "agent"
    assert chunks[0].turn_index == 0
    assert chunks[1].turn_index == 1
```

**Step 2: Run all tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/ -v
```
Expected: All tests in all test files PASS.

**Step 3: Commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_integration.py
git commit -m "test(epii/corpus): end-to-end integration smoke tests for document + chat log pipelines"
```

---

## Task 9: Tool Stubs — Pi Agent Interface

**Files:**
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tools/__init__.py`
- Create: `Idea/Pratibimba/System/Subsystems/epii/corpus/tools/corpus_tools.py`

These are the Python-side tool handlers. When the epi-logos plugin is built, these get wired to `api.registerTool()`. For now they expose clean callables that can be imported and called directly.

**Step 1: Write stub tests**

```python
# (add to tests/test_integration.py)

def test_corpus_ingest_tool_interface():
    """Verify the tool interface matches the expected contract."""
    from ..tools.corpus_tools import corpus_ingest, corpus_ingest_chat, corpus_query

    import inspect
    ingest_sig = inspect.signature(corpus_ingest)
    assert "file_path" in ingest_sig.parameters
    assert "coordinate" in ingest_sig.parameters
    assert "source_type" in ingest_sig.parameters

    query_sig = inspect.signature(corpus_query)
    assert "query" in query_sig.parameters
    assert "top_k" in query_sig.parameters
```

**Step 2: Run to verify it fails**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/test_integration.py::test_corpus_ingest_tool_interface -v
```

**Step 3: Write tool handlers**

```python
# corpus/tools/corpus_tools.py
"""
Pi agent tool handlers for the Epii corpus.

These are called by the epi-logos plugin tool registration.
Each function is a clean, typed callable matching the tool contract.
"""

from typing import Optional
from dataclasses import asdict

from ..core.ingester import ingest_document
from ..core.chat_ingester import ingest_chat_log
from ..core.turn_splitter import ChatLog, Turn, split_turns
from ..core.embedder import embed_query
from ..core.neo4j_store import CorpusStore


def corpus_ingest(
    file_path: str,
    coordinate: str,
    source_type: str,
    author: str = "",
    title: str = "",
) -> dict:
    """
    Tool: corpus_ingest
    Ingest a structured document (PDF/DOCX/EPUB/MD) into the T1 corpus.
    Returns: {doc_uuid, chunks_written, coordinate, source_type}
    """
    result = ingest_document(
        file_path=file_path,
        coordinate=coordinate,
        source_type=source_type,
        author=author,
        title=title,
    )
    return {
        "doc_uuid": result.doc_uuid,
        "file_path": result.file_path,
        "chunks_written": result.chunks_written,
        "coordinate": result.coordinate,
        "source_type": result.source_type,
    }


def corpus_ingest_chat(
    session_id: str,
    platform: str,
    coordinate: str,
    raw_turns: Optional[list[dict]] = None,
) -> dict:
    """
    Tool: corpus_ingest_chat
    Ingest a chat log session as turn-level chunks.
    raw_turns: [{speaker, content, turn_index?, timestamp?}]
    Returns: {doc_uuid, chunks_written, coordinate}
    """
    turns = split_turns(raw_turns or [])
    log = ChatLog(
        session_id=session_id,
        platform=platform,
        coordinate=coordinate,
        turns=turns,
    )
    result = ingest_chat_log(log=log)
    return {
        "doc_uuid": result.doc_uuid,
        "chunks_written": result.chunks_written,
        "coordinate": result.coordinate,
        "session_id": session_id,
    }


def corpus_query(
    query: str,
    coordinate: Optional[str] = None,
    source_type: Optional[str] = None,
    top_k: int = 5,
) -> list[dict]:
    """
    Tool: corpus_query
    Semantic search over T1Chunk nodes.
    Returns: [{content, score, coordinate, source_type, doc_title}]
    """
    q_embedding = embed_query(query)
    store = CorpusStore()
    results = store.query_chunks(
        query_embedding=q_embedding,
        top_k=top_k,
        coordinate=coordinate,
        source_type=source_type,
    )
    return [
        {
            "content": r.get("chunk", {}).get("contextual_content", ""),
            "score": r.get("score", 0.0),
            "coordinate": r.get("chunk", {}).get("coordinate"),
            "source_type": r.get("chunk", {}).get("source_type"),
            "doc_title": r.get("doc", {}).get("title"),
            "chunk_index": r.get("chunk", {}).get("chunk_index"),
            "section_heading": r.get("chunk", {}).get("section_heading"),
        }
        for r in results
    ]
```

**Step 4: Run all tests**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/ -v --tb=short
```
Expected: All tests PASS.

**Step 5: Final commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/tools/
git commit -m "feat(epii/corpus): pi agent tool handlers (corpus_ingest, corpus_ingest_chat, corpus_query)"
```

---

## Task 10: Final Run + Requirements File

**Step 1: Run full test suite**

```bash
python -m pytest Idea/Pratibimba/System/Subsystems/epii/corpus/tests/ -v
```
Expected: All tests PASS. Note any failures and fix before continuing.

**Step 2: Create requirements file**

```bash
cat > Idea/Pratibimba/System/Subsystems/epii/corpus/requirements.txt << 'EOF'
docling>=2.0.0
neo4j>=5.14.0
google-generativeai>=0.8.0
requests>=2.31.0
click>=8.1.0
EOF
```

**Step 3: Verify install**

```bash
pip install -r Idea/Pratibimba/System/Subsystems/epii/corpus/requirements.txt
```

**Step 4: Final commit**

```bash
git add Idea/Pratibimba/System/Subsystems/epii/corpus/requirements.txt
git commit -m "chore(epii/corpus): add requirements.txt (docling, neo4j, google-generativeai)"
```

---

## File Tree Summary

```
Idea/Pratibimba/System/Subsystems/epii/corpus/
  __init__.py
  requirements.txt
  cli.py                          ← batch CLI: ingest / query / list
  core/
    __init__.py
    embedder.py                   ← Gemini gemini-embedding-001, 1536-dim
    chunker.py                    ← docling HybridChunker + contextual RAG
    turn_splitter.py              ← chat log → Turn[] → RawChunk[]
    neo4j_store.py                ← T1Chunk CRUD + vector index
    ingester.py                   ← structured doc pipeline orchestrator
    chat_ingester.py              ← chat log pipeline orchestrator
  tools/
    __init__.py
    corpus_tools.py               ← pi agent tool handlers (3 tools)
  tests/
    __init__.py
    test_embedder.py
    test_neo4j_store.py
    test_chunker.py
    test_turn_splitter.py
    test_ingester.py
    test_chat_ingester.py
    test_integration.py
    test_cli.py
```

---

## How to Verify the System Works (Manual Smoke Test)

After all tasks complete, verify with a real markdown file (no Gemini/Neo4j needed for this first check):

```bash
# 1. Verify CLI help renders
python -m Idea.Pratibimba.System.Subsystems.epii.corpus.cli --help

# 2. Ingest a real vault file (requires GOOGLE_API_KEY + Neo4j running)
python -m Idea.Pratibimba.System.Subsystems.epii.corpus.cli \
  ingest "Idea/Bimba/Map/M5.md" \
  --coord M5 \
  --type Canonical

# 3. Query
python -m Idea.Pratibimba.System.Subsystems.epii.corpus.cli \
  query "what is the Möbius return?" \
  --coord M5
```

---

*Plan complete. Implement task-by-task using superpowers:executing-plans.*
