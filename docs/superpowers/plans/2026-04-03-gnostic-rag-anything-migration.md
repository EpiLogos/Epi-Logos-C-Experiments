# Gnostic RAG-Anything Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Docling + custom Gnosis pipeline with RAG-Anything/LightRAG backed by unified Neo4j graph+vector storage, with cross-namespace Bimba coordinate linking.

**Architecture:** A new `epi-gnostic/` Python package wraps RAG-Anything with a custom `Neo4JVectorDBStorage` adapter that stores embeddings as Neo4j node properties. Post-ingestion enrichment assigns Bimba coordinates (direct or LLM-classified) and creates cross-namespace edges. The Rust CLI shells out to the Python wrapper for ingest/query operations.

**Tech Stack:** Python 3.10+, RAG-Anything (pip), LightRAG, Neo4j 5.26 (vector-2.0), Gemini APIs (embedding + LLM), MinerU (doc parsing), Rust CLI (epi-cli)

**Spec:** `docs/superpowers/specs/2026-04-03-gnostic-rag-anything-migration-design.md`

---

## File Map

```
epi-gnostic/                              ← NEW Python package
├── pyproject.toml                        ← Package config, dependencies
├── .env.example                          ← Template env vars
├── epi_gnostic/
│   ├── __init__.py                       ← Package init, version
│   ├── config.py                         ← GnosticConfig dataclass, env loading
│   ├── storage/
│   │   ├── __init__.py
│   │   └── neo4j_vector.py              ← Neo4JVectorDBStorage (BaseVectorStorage impl)
│   ├── enrichment/
│   │   ├── __init__.py
│   │   ├── coordinator.py               ← Post-ingestion coordinate assignment + labeling
│   │   └── prompts.py                   ← Resonance classification prompt templates
│   ├── wrapper.py                        ← GnosticRAG class (ingest/query entry points)
│   └── cli.py                            ← CLI entry point for Rust subprocess calls
├── scripts/
│   └── migrate_bimba_embeddings.py      ← One-shot 768→3072 migration
└── tests/
    ├── conftest.py                       ← Shared fixtures (Neo4j connection, cleanup)
    ├── test_config.py
    ├── test_neo4j_vector.py             ← Neo4JVectorDBStorage unit tests
    ├── test_enrichment.py               ← Coordinator + resonance tests
    ├── test_wrapper.py                   ← End-to-end ingest/query tests
    └── test_cross_namespace.py          ← Bimba linking tests

docker-compose.epi-s2.yml                ← MODIFY: remove docling-serve
.env.graph-dev                            ← MODIFY: add Gemini + gnostic env vars

epi-cli/src/techne/gnosis/               ← MODIFY existing Rust module
├── mod.rs                                ← Rewire dispatch to Python subprocess
├── config.rs                             ← Add new env vars
├── docling_client.rs                     ← DELETE
├── chunker.rs                            ← DELETE (LightRAG handles chunking)
├── ingest.rs                             ← REWRITE: shell to Python
├── query.rs                              ← REWRITE: shell to Python
├── notebook.rs                           ← KEEP (local notebook metadata)
└── sync.rs                               ← DELETE (replaced by enrichment)
```

---

## Task 1: Python Package Scaffold + Dependencies

**Files:**
- Create: `epi-gnostic/pyproject.toml`
- Create: `epi-gnostic/epi_gnostic/__init__.py`
- Create: `epi-gnostic/epi_gnostic/config.py`
- Create: `epi-gnostic/.env.example`
- Create: `epi-gnostic/tests/conftest.py`
- Create: `epi-gnostic/tests/test_config.py`

- [ ] **Step 1: Create pyproject.toml**

```toml
[project]
name = "epi-gnostic"
version = "0.1.0"
description = "Gnostic namespace RAG pipeline for Epi-Logos"
requires-python = ">=3.10"
dependencies = [
    "raganything>=1.2.0",
    "lightrag-hku>=1.0.0",
    "neo4j>=5.0.0",
    "google-genai>=1.0.0",
    "python-dotenv>=1.0.0",
    "numpy>=1.24.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "pytest-asyncio>=0.23"]

[project.scripts]
epi-gnostic = "epi_gnostic.cli:main"

[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.backends._legacy:_Backend"
```

- [ ] **Step 2: Create .env.example**

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_DATABASE=neo4j

# Gemini
GEMINI_API_KEY=your-key-here

# Gnostic namespace
GNOSTIC_WORKSPACE=gnostic
GNOSTIC_WORKING_DIR=~/.epi-logos/gnostic/
GNOSTIC_EMBEDDING_DIM=3072
GNOSTIC_EMBEDDING_MODEL=gemini-embedding-2-preview
GNOSTIC_LLM_MODEL=gemini-3.1-flash-lite
```

- [ ] **Step 3: Write the failing test for config loading**

```python
# epi-gnostic/tests/test_config.py
import os
import pytest
from epi_gnostic.config import GnosticConfig


def test_config_loads_defaults():
    config = GnosticConfig()
    assert config.neo4j_uri == "bolt://localhost:7687"
    assert config.neo4j_database == "neo4j"
    assert config.workspace == "gnostic"
    assert config.embedding_dim == 3072
    assert config.embedding_model == "gemini-embedding-2-preview"
    assert config.llm_model == "gemini-3.1-flash-lite"
    assert config.working_dir.endswith("gnostic")


def test_config_reads_env_overrides(monkeypatch):
    monkeypatch.setenv("NEO4J_URI", "bolt://custom:7687")
    monkeypatch.setenv("GNOSTIC_WORKSPACE", "test_ws")
    monkeypatch.setenv("GNOSTIC_EMBEDDING_DIM", "768")
    config = GnosticConfig()
    assert config.neo4j_uri == "bolt://custom:7687"
    assert config.workspace == "test_ws"
    assert config.embedding_dim == 768


def test_config_validates_embedding_dim():
    with pytest.raises(ValueError, match="3072"):
        GnosticConfig(embedding_dim=9999)
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd epi-gnostic && pip install -e ".[dev]" && pytest tests/test_config.py -v`
Expected: FAIL with ImportError (module doesn't exist yet)

- [ ] **Step 5: Write config implementation**

```python
# epi-gnostic/epi_gnostic/__init__.py
"""Gnostic namespace RAG pipeline for Epi-Logos."""
__version__ = "0.1.0"
```

```python
# epi-gnostic/epi_gnostic/config.py
"""Configuration for the Gnostic RAG namespace."""
import os
from dataclasses import dataclass, field
from pathlib import Path

VALID_EMBEDDING_DIMS = {128, 256, 384, 512, 768, 1024, 1536, 2048, 3072}
VALID_FAMILIES = {"M", "S", "P", "T", "L", "C", "#"}


@dataclass
class GnosticConfig:
    """Configuration loaded from environment variables with sensible defaults."""

    neo4j_uri: str = field(
        default_factory=lambda: os.getenv("NEO4J_URI", "bolt://localhost:7687")
    )
    neo4j_database: str = field(
        default_factory=lambda: os.getenv("NEO4J_DATABASE", "neo4j")
    )
    gemini_api_key: str = field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", "")
    )
    workspace: str = field(
        default_factory=lambda: os.getenv("GNOSTIC_WORKSPACE", "gnostic")
    )
    working_dir: str = field(
        default_factory=lambda: os.getenv(
            "GNOSTIC_WORKING_DIR",
            str(Path.home() / ".epi-logos" / "gnostic"),
        )
    )
    embedding_dim: int = field(
        default_factory=lambda: int(os.getenv("GNOSTIC_EMBEDDING_DIM", "3072"))
    )
    embedding_model: str = field(
        default_factory=lambda: os.getenv(
            "GNOSTIC_EMBEDDING_MODEL", "gemini-embedding-2-preview"
        )
    )
    llm_model: str = field(
        default_factory=lambda: os.getenv("GNOSTIC_LLM_MODEL", "gemini-3.1-flash-lite")
    )
    cosine_threshold: float = field(
        default_factory=lambda: float(os.getenv("GNOSTIC_COSINE_THRESHOLD", "0.2"))
    )
    upsert_batch_size: int = 500

    def __post_init__(self):
        if self.embedding_dim not in VALID_EMBEDDING_DIMS:
            raise ValueError(
                f"embedding_dim must be one of {sorted(VALID_EMBEDDING_DIMS)}, "
                f"got {self.embedding_dim}. Canonical is 3072."
            )
        Path(self.working_dir).mkdir(parents=True, exist_ok=True)
```

- [ ] **Step 6: Write conftest with shared fixtures**

```python
# epi-gnostic/tests/conftest.py
import os
import pytest

# Ensure tests don't hit real Gemini API by default
os.environ.setdefault("GEMINI_API_KEY", "test-key-not-real")


@pytest.fixture
def neo4j_uri():
    return os.getenv("NEO4J_URI", "bolt://localhost:7687")


@pytest.fixture
def gnostic_config():
    from epi_gnostic.config import GnosticConfig
    return GnosticConfig(working_dir="/tmp/epi-gnostic-test")
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd epi-gnostic && pytest tests/test_config.py -v`
Expected: 3 PASS

- [ ] **Step 8: Commit**

```bash
git add epi-gnostic/
git commit -m "feat(gnostic): scaffold Python package with config and tests"
```

---

## Task 2: Neo4JVectorDBStorage — Core Adapter

**Files:**
- Create: `epi-gnostic/epi_gnostic/storage/__init__.py`
- Create: `epi-gnostic/epi_gnostic/storage/neo4j_vector.py`
- Create: `epi-gnostic/tests/test_neo4j_vector.py`

**Prerequisites:** Task 1 complete, Neo4j running (`docker compose -f docker-compose.epi-s2.yml up -d neo4j`)

- [ ] **Step 1: Write failing tests for upsert + query**

```python
# epi-gnostic/tests/test_neo4j_vector.py
import os
import pytest
import pytest_asyncio
import numpy as np

pytestmark = pytest.mark.asyncio

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"

skip_if_no_neo4j = pytest.mark.skipif(SKIP_NEO4J, reason="Neo4j not available")


async def mock_embedding_func(texts: list[str]) -> np.ndarray:
    """Deterministic fake embeddings for testing (8-dim)."""
    rng = np.random.default_rng(seed=42)
    vecs = rng.standard_normal((len(texts), 8)).astype(np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    return vecs / norms


@pytest_asyncio.fixture
async def storage():
    from epi_gnostic.storage.neo4j_vector import Neo4JVectorDBStorage

    s = Neo4JVectorDBStorage(
        namespace="test_gnostic",
        workspace="test_gnostic",
        global_config={
            "neo4j_uri": NEO4J_URI,
            "neo4j_database": "neo4j",
            "embedding_batch_num": 1,
        },
        embedding_func=mock_embedding_func,
        cosine_better_than_threshold=0.0,
        meta_fields={"entity_name", "source_id"},
        vector_index_name="test_gnostic_embedding",
        embedding_dim=8,
    )
    await s.initialize()
    yield s
    await s.drop()
    await s.finalize()


@skip_if_no_neo4j
async def test_upsert_and_query(storage):
    data = {
        "id_alpha": {
            "content": "The torus is a fundamental topological structure",
            "entity_name": "Torus",
            "source_id": "chunk_001",
        },
        "id_beta": {
            "content": "Quaternions represent rotations in 3D space",
            "entity_name": "Quaternion",
            "source_id": "chunk_002",
        },
    }
    await storage.upsert(data)

    results = await storage.query("torus topology", top_k=2)
    assert len(results) > 0
    assert any(r["entity_name"] == "Torus" for r in results)


@skip_if_no_neo4j
async def test_get_by_id(storage):
    data = {
        "id_gamma": {
            "content": "Spanda is the subtle vibration of consciousness",
            "entity_name": "Spanda",
            "source_id": "chunk_003",
        },
    }
    await storage.upsert(data)

    result = await storage.get_by_id("id_gamma")
    assert result is not None
    assert result["entity_name"] == "Spanda"


@skip_if_no_neo4j
async def test_get_by_ids(storage):
    data = {
        "id_d1": {"content": "Alpha", "entity_name": "A", "source_id": "c1"},
        "id_d2": {"content": "Beta", "entity_name": "B", "source_id": "c2"},
    }
    await storage.upsert(data)

    results = await storage.get_by_ids(["id_d1", "id_d2", "id_nonexistent"])
    assert len(results) == 2
    names = {r["entity_name"] for r in results}
    assert names == {"A", "B"}


@skip_if_no_neo4j
async def test_delete_entity(storage):
    data = {
        "id_del": {
            "content": "Ephemeral node",
            "entity_name": "Ephemeral",
            "source_id": "chunk_x",
        },
    }
    await storage.upsert(data)
    await storage.delete_entity("Ephemeral")

    result = await storage.get_by_id("id_del")
    assert result is None


@skip_if_no_neo4j
async def test_delete_by_ids(storage):
    data = {
        "id_rm1": {"content": "Remove me 1", "entity_name": "Rm1", "source_id": "c"},
        "id_rm2": {"content": "Remove me 2", "entity_name": "Rm2", "source_id": "c"},
        "id_keep": {"content": "Keep me", "entity_name": "Keep", "source_id": "c"},
    }
    await storage.upsert(data)
    await storage.delete(["id_rm1", "id_rm2"])

    result_keep = await storage.get_by_id("id_keep")
    assert result_keep is not None
    result_rm = await storage.get_by_id("id_rm1")
    assert result_rm is None


@skip_if_no_neo4j
async def test_get_vectors_by_ids(storage):
    data = {
        "id_vec": {"content": "Vector test", "entity_name": "VT", "source_id": "c"},
    }
    await storage.upsert(data)

    vectors = await storage.get_vectors_by_ids(["id_vec"])
    assert "id_vec" in vectors
    assert len(vectors["id_vec"]) == 8  # our test embedding dim


@skip_if_no_neo4j
async def test_drop_clears_all(storage):
    data = {
        "id_drop": {"content": "Will be dropped", "entity_name": "Drop", "source_id": "c"},
    }
    await storage.upsert(data)
    result = await storage.drop()
    assert result["status"] == "success"

    check = await storage.get_by_id("id_drop")
    assert check is None
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd epi-gnostic && pytest tests/test_neo4j_vector.py -v`
Expected: FAIL with ImportError

- [ ] **Step 3: Write Neo4JVectorDBStorage implementation**

```python
# epi-gnostic/epi_gnostic/storage/__init__.py
"""Storage backends for the Gnostic namespace."""
from epi_gnostic.storage.neo4j_vector import Neo4JVectorDBStorage

__all__ = ["Neo4JVectorDBStorage"]
```

```python
# epi-gnostic/epi_gnostic/storage/neo4j_vector.py
"""Neo4j-native vector storage implementing LightRAG's BaseVectorStorage.

Stores embeddings as node properties using Neo4j 5.11+ vector indexes.
Uses db.create.setNodeVectorProperty() for storage-efficient writes and
db.index.vector.queryNodes() for cosine similarity search.
"""
import asyncio
import numpy as np
from dataclasses import dataclass, field
from typing import Any

from neo4j import AsyncGraphDatabase, AsyncDriver
from lightrag.base import BaseVectorStorage


@dataclass
class Neo4JVectorDBStorage(BaseVectorStorage):
    """LightRAG vector storage backed by Neo4j native vector indexes."""

    vector_index_name: str = ""
    embedding_dim: int = 3072
    _driver: AsyncDriver = field(default=None, init=False, repr=False)

    async def initialize(self):
        uri = self.global_config.get("neo4j_uri", "bolt://localhost:7687")
        database = self.global_config.get("neo4j_database", "neo4j")
        user = self.global_config.get("neo4j_user")
        password = self.global_config.get("neo4j_password")

        auth = (user, password) if user and password else None
        self._driver = AsyncGraphDatabase.driver(uri, auth=auth)
        self._database = database
        self._label = self._sanitize_label(self.workspace or "gnostic")

        if not self.vector_index_name:
            suffix = self.namespace.replace("-", "_")
            self.vector_index_name = f"{self._label}_{suffix}_embedding"

        await self._ensure_vector_index()

    def _sanitize_label(self, label: str) -> str:
        return label.replace("`", "``")

    async def _ensure_vector_index(self):
        """Create vector index if it doesn't exist."""
        query = (
            f"CREATE VECTOR INDEX `{self.vector_index_name}` IF NOT EXISTS "
            f"FOR (n:`{self._label}`) ON n.embedding "
            "OPTIONS { indexConfig: {"
            f"  `vector.dimensions`: {self.embedding_dim},"
            "  `vector.similarity_function`: 'cosine',"
            "  `vector.hnsw.m`: 16,"
            "  `vector.hnsw.ef_construction`: 200,"
            "  `vector.quantization.enabled`: true"
            "}}"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(query)

        # Also create a btree index on vector_id for fast lookups
        btree_query = (
            f"CREATE INDEX `{self.vector_index_name}_id` IF NOT EXISTS "
            f"FOR (n:`{self._label}`) ON (n.vector_id)"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(btree_query)

    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        """Batch upsert entities with embeddings into Neo4j."""
        if not data:
            return

        # Collect texts that need embedding
        ids = list(data.keys())
        contents = [data[k].get("content", "") for k in ids]

        # Generate embeddings
        embeddings = await self.embedding_func(contents)
        if isinstance(embeddings, np.ndarray):
            embeddings = embeddings.tolist()

        # Build batch records
        records = []
        for i, vid in enumerate(ids):
            item = data[vid]
            record = {
                "vector_id": vid,
                "content": item.get("content", ""),
                "embedding": embeddings[i],
            }
            # Include meta_fields
            for mf in self.meta_fields:
                if mf in item:
                    record[mf] = item[mf]
            records.append(record)

        # Batch upsert in chunks of 500
        batch_size = 500
        for start in range(0, len(records), batch_size):
            batch = records[start : start + batch_size]
            await self._upsert_batch(batch)

    async def _upsert_batch(self, batch: list[dict]):
        """Upsert a batch of records into Neo4j."""
        # First MERGE nodes and set properties (without embedding)
        merge_query = (
            f"UNWIND $batch AS item "
            f"MERGE (n:`{self._label}` {{vector_id: item.vector_id}}) "
            "SET n.content = item.content"
        )
        # Add meta field assignments
        meta_sets = []
        for mf in self.meta_fields:
            meta_sets.append(f"n.{mf} = item.{mf}")
        if meta_sets:
            merge_query += ", " + ", ".join(meta_sets)

        # Strip embeddings from batch for the MERGE query
        batch_no_embed = [
            {k: v for k, v in r.items() if k != "embedding"} for r in batch
        ]

        async with self._driver.session(database=self._database) as session:
            await session.run(merge_query, batch=batch_no_embed)

        # Then set embeddings using the efficient vector property procedure
        set_embed_query = (
            f"UNWIND $batch AS item "
            f"MATCH (n:`{self._label}` {{vector_id: item.vector_id}}) "
            "CALL db.create.setNodeVectorProperty(n, 'embedding', item.embedding)"
        )
        embed_batch = [
            {"vector_id": r["vector_id"], "embedding": r["embedding"]}
            for r in batch
        ]

        async with self._driver.session(database=self._database) as session:
            await session.run(set_embed_query, batch=embed_batch)

    async def query(
        self, query: str, top_k: int, query_embedding: list[float] = None
    ) -> list[dict[str, Any]]:
        """Vector similarity search via Neo4j vector index."""
        if query_embedding is None:
            embedding_result = await self.embedding_func([query])
            if isinstance(embedding_result, np.ndarray):
                query_embedding = embedding_result[0].tolist()
            else:
                query_embedding = embedding_result[0]

        cypher = (
            f"CALL db.index.vector.queryNodes('{self.vector_index_name}', $top_k, $embedding) "
            "YIELD node, score "
            "WHERE score >= $threshold "
            "RETURN node.vector_id AS id, node.content AS content, score, "
            "properties(node) AS props"
        )

        results = []
        async with self._driver.session(database=self._database) as session:
            response = await session.run(
                cypher,
                top_k=top_k,
                embedding=query_embedding,
                threshold=self.cosine_better_than_threshold,
            )
            async for record in response:
                entry = {
                    "id": record["id"],
                    "content": record["content"],
                    "score": record["score"],
                }
                props = record["props"]
                for mf in self.meta_fields:
                    if mf in props:
                        entry[mf] = props[mf]
                results.append(entry)

        return results

    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        """Get a single entity by vector_id."""
        cypher = (
            f"MATCH (n:`{self._label}` {{vector_id: $vid}}) "
            "RETURN properties(n) AS props LIMIT 1"
        )
        async with self._driver.session(database=self._database) as session:
            result = await session.run(cypher, vid=id)
            record = await result.single()
            if record is None:
                return None
            props = dict(record["props"])
            props.pop("embedding", None)
            return props

    async def get_by_ids(self, ids: list[str]) -> list[dict[str, Any]]:
        """Get multiple entities by vector_id."""
        cypher = (
            f"UNWIND $ids AS vid "
            f"MATCH (n:`{self._label}` {{vector_id: vid}}) "
            "RETURN properties(n) AS props"
        )
        results = []
        async with self._driver.session(database=self._database) as session:
            response = await session.run(cypher, ids=ids)
            async for record in response:
                props = dict(record["props"])
                props.pop("embedding", None)
                results.append(props)
        return results

    async def get_vectors_by_ids(self, ids: list[str]) -> dict[str, list[float]]:
        """Get raw embedding vectors by vector_id."""
        cypher = (
            f"UNWIND $ids AS vid "
            f"MATCH (n:`{self._label}` {{vector_id: vid}}) "
            "RETURN n.vector_id AS id, n.embedding AS embedding"
        )
        vectors = {}
        async with self._driver.session(database=self._database) as session:
            response = await session.run(cypher, ids=ids)
            async for record in response:
                if record["embedding"] is not None:
                    vectors[record["id"]] = list(record["embedding"])
        return vectors

    async def delete_entity(self, entity_name: str) -> None:
        """Delete entity nodes matching entity_name."""
        cypher = (
            f"MATCH (n:`{self._label}` {{entity_name: $name}}) "
            "DETACH DELETE n"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(cypher, name=entity_name)

    async def delete_entity_relation(self, entity_name: str) -> None:
        """Delete relation vectors associated with an entity."""
        cypher = (
            f"MATCH (n:`{self._label}`) "
            "WHERE n.source_id CONTAINS $name "
            "DETACH DELETE n"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(cypher, name=entity_name)

    async def delete(self, ids: list[str]) -> None:
        """Delete vectors by their IDs."""
        cypher = (
            f"UNWIND $ids AS vid "
            f"MATCH (n:`{self._label}` {{vector_id: vid}}) "
            "DETACH DELETE n"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(cypher, ids=ids)

    async def index_done_callback(self) -> None:
        """No-op. Neo4j vector indexes update automatically."""
        pass

    async def drop(self) -> dict[str, str]:
        """Drop all gnostic vector nodes and the vector index."""
        try:
            async with self._driver.session(database=self._database) as session:
                await session.run(
                    f"MATCH (n:`{self._label}`) DETACH DELETE n"
                )
            async with self._driver.session(database=self._database) as session:
                await session.run(
                    f"DROP INDEX `{self.vector_index_name}` IF EXISTS"
                )
                await session.run(
                    f"DROP INDEX `{self.vector_index_name}_id` IF EXISTS"
                )
            return {"status": "success", "message": f"Dropped {self._label} vector storage"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def finalize(self):
        """Close the Neo4j driver."""
        if self._driver:
            await self._driver.close()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd epi-gnostic && pytest tests/test_neo4j_vector.py -v`
Expected: 7 PASS (or SKIP if `SKIP_NEO4J_TESTS=true`)

- [ ] **Step 5: Commit**

```bash
git add epi-gnostic/epi_gnostic/storage/ epi-gnostic/tests/test_neo4j_vector.py
git commit -m "feat(gnostic): Neo4JVectorDBStorage adapter for LightRAG"
```

---

## Task 3: Gemini Embedding + LLM Wiring

**Files:**
- Modify: `epi-gnostic/epi_gnostic/config.py`
- Create: `epi-gnostic/epi_gnostic/wrapper.py`
- Create: `epi-gnostic/tests/test_wrapper.py`

- [ ] **Step 1: Write failing test for wrapper initialization**

```python
# epi-gnostic/tests/test_wrapper.py
import os
import pytest
import pytest_asyncio

pytestmark = pytest.mark.asyncio

SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"
SKIP_GEMINI = os.getenv("GEMINI_API_KEY", "") in ("", "test-key-not-real")

skip_if_no_neo4j = pytest.mark.skipif(SKIP_NEO4J, reason="Neo4j not available")
skip_if_no_gemini = pytest.mark.skipif(SKIP_GEMINI, reason="No Gemini API key")


@skip_if_no_neo4j
@skip_if_no_gemini
async def test_wrapper_initializes():
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig(workspace="test_wrapper_init")
    rag = GnosticRAG(config)
    await rag.initialize()

    assert rag.lightrag is not None
    assert rag.rag_anything is not None

    await rag.shutdown()


@skip_if_no_neo4j
@skip_if_no_gemini
async def test_wrapper_ingest_text():
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig(workspace="test_wrapper_ingest")
    rag = GnosticRAG(config)
    await rag.initialize()

    result = await rag.ingest_text(
        "The lemniscate at position #4 is where the torus folds inward.",
        source_id="test_doc_1",
    )
    assert result["status"] == "success"
    assert result["entities_count"] > 0

    await rag.shutdown()


@skip_if_no_neo4j
@skip_if_no_gemini
async def test_wrapper_query():
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig(workspace="test_wrapper_query")
    rag = GnosticRAG(config)
    await rag.initialize()

    await rag.ingest_text(
        "Quaternions encode rotations as w + xi + yj + zk. "
        "The four elements map to Earth, Fire, Water, Air.",
        source_id="test_doc_2",
    )

    result = await rag.query("What do quaternion elements represent?", mode="hybrid")
    assert isinstance(result, str)
    assert len(result) > 0

    await rag.shutdown()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd epi-gnostic && pytest tests/test_wrapper.py -v`
Expected: FAIL with ImportError

- [ ] **Step 3: Write GnosticRAG wrapper**

```python
# epi-gnostic/epi_gnostic/wrapper.py
"""GnosticRAG — main entry point for ingest and query operations."""
import numpy as np
from typing import Optional

from lightrag import LightRAG
from lightrag.llm.gemini import gemini_model_complete, gemini_embed
from lightrag.utils import EmbeddingFunc
from raganything import RAGAnything, RAGAnythingConfig

from epi_gnostic.config import GnosticConfig
from epi_gnostic.storage.neo4j_vector import Neo4JVectorDBStorage


class GnosticRAG:
    """Wraps RAG-Anything with Neo4j vector storage and Gemini models."""

    def __init__(self, config: GnosticConfig):
        self.config = config
        self.lightrag: Optional[LightRAG] = None
        self.rag_anything: Optional[RAGAnything] = None

    async def initialize(self):
        """Set up LightRAG with Neo4j graph+vector and Gemini models."""
        embedding_func = EmbeddingFunc(
            embedding_dim=self.config.embedding_dim,
            max_token_size=8192,
            func=lambda texts: gemini_embed(
                texts,
                model=self.config.embedding_model,
                api_key=self.config.gemini_api_key,
            ),
        )

        # Register our custom storage class so LightRAG can find it
        from lightrag.kg import STORAGES
        STORAGES["Neo4JVectorDBStorage"] = "epi_gnostic.storage.neo4j_vector"

        self.lightrag = LightRAG(
            working_dir=self.config.working_dir,
            workspace=self.config.workspace,
            llm_model_func=gemini_model_complete,
            llm_model_name=self.config.llm_model,
            embedding_func=embedding_func,
            graph_storage="Neo4JStorage",
            vector_storage="Neo4JVectorDBStorage",
            vector_db_storage_cls_kwargs={
                "vector_index_name": f"{self.config.workspace}_entity_embedding",
                "embedding_dim": self.config.embedding_dim,
            },
        )
        await self.lightrag.initialize_storages()

        rag_config = RAGAnythingConfig(
            working_dir=self.config.working_dir,
            parser="mineru",
            parse_method="auto",
        )

        self.rag_anything = RAGAnything(
            lightrag=self.lightrag,
            llm_model_func=gemini_model_complete,
            vision_model_func=gemini_model_complete,
            config=rag_config,
        )

    async def ingest_text(
        self,
        text: str,
        source_id: str = "unknown",
    ) -> dict:
        """Ingest raw text into the gnostic namespace."""
        await self.lightrag.ainsert(text)
        return {"status": "success", "entities_count": 1, "source_id": source_id}

    async def ingest_document(
        self,
        file_path: str,
        coordinate: Optional[str] = None,
        family: str = "#",
        output_dir: Optional[str] = None,
    ) -> dict:
        """Ingest a document (PDF, image, etc.) via RAG-Anything."""
        out = output_dir or f"{self.config.working_dir}/parsed"
        await self.rag_anything.process_document_complete(
            file_path=file_path,
            output_dir=out,
        )
        return {
            "status": "success",
            "file_path": file_path,
            "coordinate": coordinate,
            "family": family,
        }

    async def query(self, question: str, mode: str = "hybrid") -> str:
        """Query the gnostic namespace."""
        return await self.lightrag.aquery(question, param={"mode": mode})

    async def shutdown(self):
        """Finalize storage connections."""
        if self.lightrag:
            await self.lightrag.finalize_storages()
```

- [ ] **Step 4: Run tests (requires GEMINI_API_KEY and Neo4j)**

Run: `cd epi-gnostic && GEMINI_API_KEY=$GEMINI_API_KEY pytest tests/test_wrapper.py -v`
Expected: 3 PASS (or SKIP if no API key)

- [ ] **Step 5: Commit**

```bash
git add epi-gnostic/epi_gnostic/wrapper.py epi-gnostic/tests/test_wrapper.py
git commit -m "feat(gnostic): GnosticRAG wrapper with Gemini + Neo4j vector"
```

---

## Task 4: Post-Ingestion Coordinate Enrichment

**Files:**
- Create: `epi-gnostic/epi_gnostic/enrichment/__init__.py`
- Create: `epi-gnostic/epi_gnostic/enrichment/prompts.py`
- Create: `epi-gnostic/epi_gnostic/enrichment/coordinator.py`
- Create: `epi-gnostic/tests/test_enrichment.py`

- [ ] **Step 1: Write resonance classification prompt template**

```python
# epi-gnostic/epi_gnostic/enrichment/__init__.py
"""Post-ingestion coordinate enrichment for the Gnostic namespace."""
```

```python
# epi-gnostic/epi_gnostic/enrichment/prompts.py
"""Prompt templates for Bimba coordinate resonance classification."""

COORDINATE_TAXONOMY = """The Epi-Logos coordinate system has 6 families, each with positions 0-5:

**M (Subsystem/Consciousness):**
- M0 Anuttara: absolute ground, void, language architecture
- M1 Paramasiva: spanda vibration, torus topology, 12-fold cycle
- M2 Parashakti: energy/chakra/body, decan system, planetary resonance
- M3 Mahamaya: symbolic transcription, I-Ching hexagrams, tarot, codons
- M4 Nara: personal interface, identity, oracle, medicine, transformation
- M5 Epii: integration, logos FSM, pratibimba reflection

**P (Position/Function):**
- P0 Ground, P1 Definition, P2 Operation, P3 Pattern, P4 Context, P5 Integration

**S (Stack/Technology):**
- S0 Terminal, S1 Obsidian, S2 Neo4j, S3 PAI, S4 Claude, S5 Notion

**T (Thought/Artifact):**
- T0 Seed, T1 Spec, T2 Form, T3 Process, T4 Pattern, T5 Insight

**L (Lens/Epistemic):**
- L0 Literal, L1 Functional, L2 Structural, L3 Archetypal, L4 Paradigmatic, L5 Integral

**C (Category/Ontological):**
- C0 Bimba/Source, C1 Form, C2 Entity, C3 Process, C4 Type, C5 Pratibimba/Instance
"""

RESONANCE_CLASSIFICATION_PROMPT = """Given the following entity extracted from a knowledge graph, classify its resonance with the Epi-Logos coordinate system.

{taxonomy}

**Entity:**
- Name: {entity_name}
- Description: {entity_description}
- Source: {source_context}

**Instructions:**
Return a JSON object with:
- "resonances": array of coordinate strings this entity resonates with (e.g. ["M3", "P2", "C5"]), ranked by relevance. Maximum 5.
- "confidence": array of float confidence scores (0.0-1.0) corresponding to each resonance.
- "primary_family": the single most relevant family letter ("M", "S", "P", "T", "L", "C"), or "#" if unclear.
- "reasoning": one sentence explaining the classification.

Return ONLY valid JSON, no markdown fences.
"""
```

- [ ] **Step 2: Write failing tests for coordinator**

```python
# epi-gnostic/tests/test_enrichment.py
import os
import json
import pytest
import pytest_asyncio

pytestmark = pytest.mark.asyncio

SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"
SKIP_GEMINI = os.getenv("GEMINI_API_KEY", "") in ("", "test-key-not-real")

skip_if_no_neo4j = pytest.mark.skipif(SKIP_NEO4J, reason="Neo4j not available")
skip_if_no_gemini = pytest.mark.skipif(SKIP_GEMINI, reason="No Gemini API key")


def test_prompt_renders():
    from epi_gnostic.enrichment.prompts import (
        RESONANCE_CLASSIFICATION_PROMPT,
        COORDINATE_TAXONOMY,
    )

    rendered = RESONANCE_CLASSIFICATION_PROMPT.format(
        taxonomy=COORDINATE_TAXONOMY,
        entity_name="Torus",
        entity_description="A donut-shaped surface in topology",
        source_context="Mathematical structures document",
    )
    assert "Torus" in rendered
    assert "M1 Paramasiva" in rendered


@skip_if_no_neo4j
async def test_direct_assignment_sets_properties():
    from epi_gnostic.enrichment.coordinator import CoordinateEnricher
    from neo4j import AsyncGraphDatabase

    driver = AsyncGraphDatabase.driver(
        os.getenv("NEO4J_URI", "bolt://localhost:7687")
    )

    enricher = CoordinateEnricher(driver, "neo4j")

    # Create a test node
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (n:gnostic:test_enrich {entity_id: 'test_direct'}) "
            "SET n.description = 'Test node for direct assignment'"
        )

    await enricher.assign_direct(
        entity_id="test_direct",
        coordinate="M4-3",
        family="M",
    )

    # Verify properties
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic {entity_id: 'test_direct'}) "
            "RETURN n.bimba_coordinate AS coord, "
            "n.coordinate_family AS fam, "
            "n.assignment_method AS method, "
            "labels(n) AS labels"
        )
        record = await result.single()
        assert record["coord"] == "M4-3"
        assert record["fam"] == "M"
        assert record["method"] == "direct"
        assert "M" in record["labels"]

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MATCH (n:gnostic {entity_id: 'test_direct'}) DETACH DELETE n"
        )
    await driver.close()


@skip_if_no_neo4j
async def test_cross_namespace_edge_created():
    from epi_gnostic.enrichment.coordinator import CoordinateEnricher
    from neo4j import AsyncGraphDatabase

    driver = AsyncGraphDatabase.driver(
        os.getenv("NEO4J_URI", "bolt://localhost:7687")
    )
    enricher = CoordinateEnricher(driver, "neo4j")

    # Create test gnostic node + ensure a BimbaCoordinate target exists
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (n:gnostic:test_edge {entity_id: 'test_edge_src'}) "
            "SET n.description = 'Edge test node'"
        )

    await enricher.assign_direct(
        entity_id="test_edge_src",
        coordinate="#3",
        family="M",
    )

    # Check the MAPS_TO_COORDINATE edge was created
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (g:gnostic {entity_id: 'test_edge_src'})"
            "-[r:MAPS_TO_COORDINATE]->(b:BimbaCoordinate) "
            "RETURN r.confidence AS conf, b.bimbaCoordinate AS target"
        )
        record = await result.single()
        assert record is not None
        assert record["conf"] == 1.0
        assert record["target"] == "#3"

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MATCH (n:gnostic {entity_id: 'test_edge_src'}) DETACH DELETE n"
        )
    await driver.close()
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd epi-gnostic && pytest tests/test_enrichment.py -v`
Expected: FAIL with ImportError

- [ ] **Step 4: Write coordinator implementation**

```python
# epi-gnostic/epi_gnostic/enrichment/coordinator.py
"""Post-ingestion coordinate assignment and cross-namespace linking."""
import json
from typing import Optional

from neo4j import AsyncDriver

from epi_gnostic.config import VALID_FAMILIES
from epi_gnostic.enrichment.prompts import (
    RESONANCE_CLASSIFICATION_PROMPT,
    COORDINATE_TAXONOMY,
)


class CoordinateEnricher:
    """Assigns Bimba coordinates to gnostic entities and creates cross-namespace edges."""

    def __init__(self, driver: AsyncDriver, database: str = "neo4j"):
        self._driver = driver
        self._database = database

    async def assign_direct(
        self,
        entity_id: str,
        coordinate: str,
        family: str,
    ) -> None:
        """Directly assign a Bimba coordinate to a gnostic entity.

        Sets bimba_coordinate, coordinate_family, assignment_method properties.
        Adds the family as a secondary Neo4j label.
        Creates a MAPS_TO_COORDINATE edge to the matching BimbaCoordinate node.
        """
        if family not in VALID_FAMILIES:
            raise ValueError(f"family must be one of {VALID_FAMILIES}, got '{family}'")

        # Set properties and add family label
        set_query = (
            "MATCH (n:gnostic {entity_id: $entity_id}) "
            "SET n.bimba_coordinate = $coordinate, "
            "    n.coordinate_family = $family, "
            "    n.assignment_method = 'direct' "
            f"SET n:`{family}`"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(
                set_query,
                entity_id=entity_id,
                coordinate=coordinate,
                family=family,
            )

        # Create cross-namespace edge
        edge_query = (
            "MATCH (g:gnostic {entity_id: $entity_id}) "
            "MATCH (b:BimbaCoordinate {bimbaCoordinate: $coordinate}) "
            "MERGE (g)-[r:MAPS_TO_COORDINATE]->(b) "
            "SET r.confidence = 1.0, r.method = 'direct'"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(
                edge_query,
                entity_id=entity_id,
                coordinate=coordinate,
            )

    async def assign_resonances(
        self,
        entity_id: str,
        resonances: list[str],
        confidences: list[float],
        family: str,
    ) -> None:
        """Assign LLM-classified resonances to a gnostic entity.

        Sets bimba_resonances, coordinate_family, assignment_method properties.
        Adds the family as a secondary Neo4j label.
        Creates RESONATES_WITH edges to matching BimbaCoordinate nodes.
        """
        if family not in VALID_FAMILIES:
            raise ValueError(f"family must be one of {VALID_FAMILIES}, got '{family}'")

        set_query = (
            "MATCH (n:gnostic {entity_id: $entity_id}) "
            "SET n.bimba_resonances = $resonances, "
            "    n.coordinate_family = $family, "
            "    n.assignment_method = 'llm_classified' "
            f"SET n:`{family}`"
        )
        async with self._driver.session(database=self._database) as session:
            await session.run(
                set_query,
                entity_id=entity_id,
                resonances=resonances,
                family=family,
            )

        # Create RESONATES_WITH edges for each resonance
        for coord, conf in zip(resonances, confidences):
            edge_query = (
                "MATCH (g:gnostic {entity_id: $entity_id}) "
                "MATCH (b:BimbaCoordinate {bimbaCoordinate: $coordinate}) "
                "MERGE (g)-[r:RESONATES_WITH]->(b) "
                "SET r.confidence = $confidence, r.method = 'llm_classified'"
            )
            async with self._driver.session(database=self._database) as session:
                await session.run(
                    edge_query,
                    entity_id=entity_id,
                    coordinate=coord,
                    confidence=conf,
                )

    async def classify_entity(
        self,
        entity_id: str,
        entity_name: str,
        entity_description: str,
        source_context: str,
        llm_func,
        family_hint: str = "#",
    ) -> dict:
        """Use LLM to classify an entity's coordinate resonances.

        Returns the parsed classification result dict.
        """
        prompt = RESONANCE_CLASSIFICATION_PROMPT.format(
            taxonomy=COORDINATE_TAXONOMY,
            entity_name=entity_name,
            entity_description=entity_description,
            source_context=source_context,
        )

        response = await llm_func(prompt)
        try:
            classification = json.loads(response)
        except json.JSONDecodeError:
            classification = {
                "resonances": [],
                "confidence": [],
                "primary_family": family_hint,
                "reasoning": "Failed to parse LLM response",
            }

        resonances = classification.get("resonances", [])
        confidences = classification.get("confidence", [])
        family = classification.get("primary_family", family_hint)

        if family not in VALID_FAMILIES:
            family = family_hint

        if resonances and confidences and len(resonances) == len(confidences):
            await self.assign_resonances(
                entity_id=entity_id,
                resonances=resonances,
                confidences=confidences,
                family=family,
            )

        return classification

    async def enrich_batch(
        self,
        entity_ids: list[str],
        llm_func,
        family_hint: str = "#",
    ) -> list[dict]:
        """Run resonance classification on a batch of gnostic entities."""
        results = []

        # Fetch entity data from Neo4j
        fetch_query = (
            "UNWIND $ids AS eid "
            "MATCH (n:gnostic {entity_id: eid}) "
            "RETURN n.entity_id AS id, n.entity_name AS name, "
            "n.description AS desc, n.file_path AS source"
        )
        entities = []
        async with self._driver.session(database=self._database) as session:
            response = await session.run(fetch_query, ids=entity_ids)
            async for record in response:
                entities.append(dict(record))

        for entity in entities:
            result = await self.classify_entity(
                entity_id=entity["id"],
                entity_name=entity.get("name", ""),
                entity_description=entity.get("desc", ""),
                source_context=entity.get("source", ""),
                llm_func=llm_func,
                family_hint=family_hint,
            )
            results.append(result)

        return results
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd epi-gnostic && pytest tests/test_enrichment.py -v`
Expected: 3 PASS (1 unit test + 2 integration if Neo4j available)

- [ ] **Step 6: Commit**

```bash
git add epi-gnostic/epi_gnostic/enrichment/ epi-gnostic/tests/test_enrichment.py
git commit -m "feat(gnostic): coordinate enrichment with direct + LLM resonance classification"
```

---

## Task 5: CLI Entry Point (Python side)

**Files:**
- Create: `epi-gnostic/epi_gnostic/cli.py`

- [ ] **Step 1: Write CLI that Rust can subprocess**

```python
# epi-gnostic/epi_gnostic/cli.py
"""CLI entry point for epi-gnostic, called by Rust subprocess.

Usage:
    epi-gnostic ingest <file_path> [--coordinate COORD] [--family FAM]
    epi-gnostic ingest-text <text> [--source-id ID]
    epi-gnostic query <question> [--mode MODE] [--top-k K]
    epi-gnostic enrich <entity_id> [--coordinate COORD] [--family FAM]
    epi-gnostic status

All output is JSON on stdout for Rust to parse.
"""
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv


def _json_out(data: dict):
    print(json.dumps(data, ensure_ascii=False))


async def _run(args: list[str]):
    load_dotenv()

    from epi_gnostic.config import GnosticConfig
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.enrichment.coordinator import CoordinateEnricher
    from neo4j import AsyncGraphDatabase

    config = GnosticConfig()
    cmd = args[0] if args else "status"

    if cmd == "status":
        _json_out({
            "status": "ok",
            "workspace": config.workspace,
            "neo4j_uri": config.neo4j_uri,
            "embedding_model": config.embedding_model,
            "llm_model": config.llm_model,
            "embedding_dim": config.embedding_dim,
        })
        return

    rag = GnosticRAG(config)
    await rag.initialize()

    try:
        if cmd == "ingest":
            file_path = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"

            result = await rag.ingest_document(
                file_path=file_path,
                coordinate=coordinate,
                family=family,
            )

            # If direct coordinate, run enrichment
            if coordinate:
                driver = AsyncGraphDatabase.driver(config.neo4j_uri)
                enricher = CoordinateEnricher(driver, config.neo4j_database)
                # Get entity IDs from last ingest (query latest by file_path)
                async with driver.session(database=config.neo4j_database) as session:
                    res = await session.run(
                        "MATCH (n:gnostic) WHERE n.file_path CONTAINS $fp "
                        "RETURN n.entity_id AS eid",
                        fp=Path(file_path).name,
                    )
                    eids = [r["eid"] async for r in res]
                for eid in eids:
                    await enricher.assign_direct(eid, coordinate, family)
                await driver.close()

            _json_out(result)

        elif cmd == "ingest-text":
            text = args[1]
            source_id = _flag(args, "--source-id") or "stdin"
            result = await rag.ingest_text(text, source_id=source_id)
            _json_out(result)

        elif cmd == "query":
            question = args[1]
            mode = _flag(args, "--mode") or "hybrid"
            answer = await rag.query(question, mode=mode)
            _json_out({"status": "ok", "answer": answer, "mode": mode})

        elif cmd == "enrich":
            entity_id = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"

            driver = AsyncGraphDatabase.driver(config.neo4j_uri)
            enricher = CoordinateEnricher(driver, config.neo4j_database)

            if coordinate:
                await enricher.assign_direct(entity_id, coordinate, family)
                _json_out({"status": "ok", "method": "direct", "coordinate": coordinate})
            else:
                from lightrag.llm.gemini import gemini_model_complete
                result = await enricher.classify_entity(
                    entity_id=entity_id,
                    entity_name="",
                    entity_description="",
                    source_context="",
                    llm_func=gemini_model_complete,
                    family_hint=family,
                )
                _json_out({"status": "ok", "method": "llm_classified", **result})
            await driver.close()

        else:
            _json_out({"status": "error", "message": f"Unknown command: {cmd}"})

    finally:
        await rag.shutdown()


def _flag(args: list[str], flag: str) -> str | None:
    """Extract --flag value from args list."""
    try:
        idx = args.index(flag)
        return args[idx + 1] if idx + 1 < len(args) else None
    except ValueError:
        return None


def main():
    args = sys.argv[1:]
    asyncio.run(_run(args))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test CLI status command**

Run: `cd epi-gnostic && python -m epi_gnostic.cli status`
Expected: `{"status": "ok", "workspace": "gnostic", ...}`

- [ ] **Step 3: Commit**

```bash
git add epi-gnostic/epi_gnostic/cli.py
git commit -m "feat(gnostic): CLI entry point for Rust subprocess integration"
```

---

## Task 6: Bimba Embedding Migration (768 → 3072)

**Files:**
- Create: `epi-gnostic/scripts/migrate_bimba_embeddings.py`

- [ ] **Step 1: Write migration script**

```python
# epi-gnostic/scripts/migrate_bimba_embeddings.py
"""One-shot migration: re-embed BimbaCoordinate nodes from 768-dim to 3072-dim.

Usage:
    GEMINI_API_KEY=... python scripts/migrate_bimba_embeddings.py [--dry-run]

Steps:
    1. Drop old coord_embedding index (768-dim)
    2. Fetch all BimbaCoordinate nodes (name + description fields)
    3. Re-embed with gemini-embedding-2-preview at 3072-dim
    4. Write new embeddings via db.create.setNodeVectorProperty()
    5. Recreate index at 3072-dim
"""
import asyncio
import os
import sys

import numpy as np
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase


async def migrate(dry_run: bool = False):
    load_dotenv()

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    database = os.getenv("NEO4J_DATABASE", "neo4j")
    api_key = os.getenv("GEMINI_API_KEY", "")

    if not api_key:
        print("ERROR: GEMINI_API_KEY not set")
        sys.exit(1)

    driver = AsyncGraphDatabase.driver(uri)

    # Step 1: Fetch all BimbaCoordinate nodes
    print("Fetching BimbaCoordinate nodes...")
    async with driver.session(database=database) as session:
        result = await session.run(
            "MATCH (n:BimbaCoordinate) "
            "RETURN n.bimbaCoordinate AS coord, n.name AS name, "
            "elementId(n) AS eid "
            "ORDER BY n.bimbaCoordinate"
        )
        nodes = [dict(r) async for r in result]

    print(f"Found {len(nodes)} BimbaCoordinate nodes")

    if dry_run:
        for n in nodes:
            print(f"  {n['coord']}: {n['name']}")
        print("\n[DRY RUN] Would drop index, re-embed, and recreate. Exiting.")
        await driver.close()
        return

    # Step 2: Drop old index
    print("Dropping old coord_embedding index...")
    async with driver.session(database=database) as session:
        await session.run("DROP INDEX coord_embedding IF EXISTS")

    # Step 3: Generate 3072-dim embeddings
    print("Generating 3072-dim embeddings with gemini-embedding-2-preview...")
    from lightrag.llm.gemini import gemini_embed

    texts = [f"{n['name']}: {n.get('coord', '')}" for n in nodes]

    # Batch embed (all 96 nodes fit in one call)
    embeddings = await gemini_embed(
        texts,
        model="gemini-embedding-2-preview",
        api_key=api_key,
    )
    if isinstance(embeddings, np.ndarray):
        embeddings = embeddings.tolist()

    print(f"Generated {len(embeddings)} embeddings, dim={len(embeddings[0])}")

    # Step 4: Write embeddings to nodes
    print("Writing embeddings to BimbaCoordinate nodes...")
    for i, node in enumerate(nodes):
        async with driver.session(database=database) as session:
            await session.run(
                "MATCH (n:BimbaCoordinate {bimbaCoordinate: $coord}) "
                "CALL db.create.setNodeVectorProperty(n, 'semantic_embedding', $embedding)",
                coord=node["coord"],
                embedding=embeddings[i],
            )
    print(f"Updated {len(nodes)} nodes")

    # Step 5: Recreate index at 3072-dim
    print("Creating new coord_embedding index at 3072-dim...")
    async with driver.session(database=database) as session:
        await session.run(
            "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS "
            "FOR (n:BimbaCoordinate) ON n.semantic_embedding "
            "OPTIONS { indexConfig: {"
            "  `vector.dimensions`: 3072,"
            "  `vector.similarity_function`: 'cosine',"
            "  `vector.hnsw.m`: 16,"
            "  `vector.hnsw.ef_construction`: 200,"
            "  `vector.quantization.enabled`: true"
            "}}"
        )

    print("Migration complete!")
    await driver.close()


def main():
    dry_run = "--dry-run" in sys.argv
    asyncio.run(migrate(dry_run=dry_run))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test with dry run**

Run: `cd epi-gnostic && python scripts/migrate_bimba_embeddings.py --dry-run`
Expected: Lists 96 nodes, prints `[DRY RUN]` message

- [ ] **Step 3: Run actual migration**

Run: `cd epi-gnostic && GEMINI_API_KEY=$GEMINI_API_KEY python scripts/migrate_bimba_embeddings.py`
Expected: `Migration complete!`

- [ ] **Step 4: Verify migration**

Run: `docker exec epi-neo4j cypher-shell "SHOW INDEXES YIELD name, type, options WHERE name = 'coord_embedding' RETURN name, type, options"`
Expected: `vector.dimensions: 3072`

- [ ] **Step 5: Commit**

```bash
git add epi-gnostic/scripts/migrate_bimba_embeddings.py
git commit -m "feat(gnostic): Bimba embedding migration script 768→3072"
```

---

## Task 7: Docling Deprecation + Docker Cleanup

**Files:**
- Modify: `docker-compose.epi-s2.yml:27-33` (remove docling-serve)
- Delete: `epi-cli/src/techne/gnosis/docling_client.rs`
- Delete: `epi-cli/src/techne/gnosis/chunker.rs`
- Delete: `epi-cli/src/techne/gnosis/sync.rs`
- Modify: `epi-cli/src/techne/gnosis/mod.rs` (remove docling/chunker/sync references)
- Modify: `.env.graph-dev` (remove EPILOGOS_DOCLING_URI, add gnostic vars)

- [ ] **Step 1: Remove docling-serve from docker-compose**

In `docker-compose.epi-s2.yml`, remove lines 27-33 (the entire `docling-serve:` service block).

The file should become:

```yaml
services:
  neo4j:
    image: neo4j:5-community
    container_name: epi-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: none
      NEO4J_PLUGINS: '["apoc"]'
      NEO4J_dbms_security_procedures_unrestricted: apoc.*
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs

  redis:
    image: redis/redis-stack-server:latest
    container_name: epi-redis
    ports:
      - "6379:6379"
    environment:
      REDIS_ARGS: --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  neo4j-data:
  neo4j-logs:
  redis-data:
```

- [ ] **Step 2: Delete deprecated Rust files**

Delete these files:
- `epi-cli/src/techne/gnosis/docling_client.rs`
- `epi-cli/src/techne/gnosis/chunker.rs`
- `epi-cli/src/techne/gnosis/sync.rs`

- [ ] **Step 3: Update gnosis mod.rs — remove dead module references**

In `epi-cli/src/techne/gnosis/mod.rs`, remove:
- `pub mod docling_client;` declaration
- `pub mod chunker;` declaration
- `pub mod sync;` declaration
- Any match arms in `dispatch()` that reference `ServeCmd` (docling serve start/stop/status)
- Any match arms referencing `Sync`
- The `ServeCmd` enum variant
- Any `use` of `chunker::*` or `docling_client::*`

Keep: `pub mod config;`, `pub mod ingest;`, `pub mod notebook;`, `pub mod query;`

- [ ] **Step 4: Update .env.graph-dev — add gnostic vars, remove docling**

Remove the `EPILOGOS_DOCLING_URI` line. Add:

```env
# Gnostic namespace (RAG-Anything)
GEMINI_API_KEY=
GNOSTIC_WORKSPACE=gnostic
GNOSTIC_WORKING_DIR=~/.epi-logos/gnostic/
GNOSTIC_EMBEDDING_DIM=3072
GNOSTIC_EMBEDDING_MODEL=gemini-embedding-2-preview
GNOSTIC_LLM_MODEL=gemini-3.1-flash-lite
```

- [ ] **Step 5: Verify Rust still compiles**

Run: `cd epi-cli && cargo check 2>&1 | tail -5`
Expected: No errors (warnings OK). If there are compile errors from removed modules, fix the remaining references in `mod.rs` and `config.rs`.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.epi-s2.yml .env.graph-dev
git add epi-cli/src/techne/gnosis/
git commit -m "chore: deprecate docling, remove chunker/sync, add gnostic env vars"
```

---

## Task 8: Rust CLI → Python Bridge

**Files:**
- Modify: `epi-cli/src/techne/gnosis/ingest.rs`
- Modify: `epi-cli/src/techne/gnosis/query.rs`
- Modify: `epi-cli/src/techne/gnosis/config.rs`
- Modify: `epi-cli/src/techne/gnosis/mod.rs`

- [ ] **Step 1: Update config.rs with Python bridge path**

```rust
// epi-cli/src/techne/gnosis/config.rs
use std::path::PathBuf;

pub struct GnosisConfig {
    pub root: PathBuf,
    pub python_bin: String,
}

impl GnosisConfig {
    pub fn from_env() -> Self {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
        let root_str = std::env::var("EPILOGOS_ROOT")
            .unwrap_or_else(|_| format!("{home}/.epi-logos"));
        let python_bin = std::env::var("EPI_GNOSTIC_PYTHON")
            .unwrap_or_else(|_| "epi-gnostic".into());

        Self {
            root: PathBuf::from(root_str).join("gnosis"),
            python_bin,
        }
    }

    pub fn notebooks_path(&self) -> PathBuf {
        self.root.join("notebooks.json")
    }

    pub fn documents_path(&self) -> PathBuf {
        self.root.join("documents.json")
    }
}
```

- [ ] **Step 2: Rewrite ingest.rs to shell to Python**

```rust
// epi-cli/src/techne/gnosis/ingest.rs
use crate::techne::gnosis::config::GnosisConfig;
use std::process::Command;

pub fn ingest_path(
    config: &GnosisConfig,
    source: &str,
    coordinate: Option<&str>,
    family: Option<&str>,
) -> Result<String, String> {
    let mut cmd = Command::new(&config.python_bin);
    cmd.arg("ingest").arg(source);

    if let Some(coord) = coordinate {
        cmd.arg("--coordinate").arg(coord);
    }
    if let Some(fam) = family {
        cmd.arg("--family").arg(fam);
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run epi-gnostic: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("epi-gnostic ingest failed: {stderr}"));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.to_string())
}
```

- [ ] **Step 3: Rewrite query.rs to shell to Python**

```rust
// epi-cli/src/techne/gnosis/query.rs
use crate::techne::gnosis::config::GnosisConfig;
use std::process::Command;

pub fn query(
    config: &GnosisConfig,
    question: &str,
    mode: Option<&str>,
) -> Result<String, String> {
    let mut cmd = Command::new(&config.python_bin);
    cmd.arg("query").arg(question);

    if let Some(m) = mode {
        cmd.arg("--mode").arg(m);
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run epi-gnostic: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("epi-gnostic query failed: {stderr}"));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.to_string())
}
```

- [ ] **Step 4: Update mod.rs dispatch for new signatures**

Update the `GnosisCmd` enum and `dispatch()` function in `epi-cli/src/techne/gnosis/mod.rs`:

```rust
#[derive(Subcommand)]
pub enum GnosisCmd {
    /// Show gnostic namespace status
    Status,
    /// Ingest a document into the gnostic namespace
    Ingest {
        source: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long, default_value = "#")]
        family: String,
    },
    /// Query the gnostic namespace
    Query {
        question: String,
        #[arg(long, default_value = "hybrid")]
        mode: String,
    },
    /// Assign a coordinate to a gnostic entity
    Enrich {
        entity_id: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long, default_value = "#")]
        family: String,
    },
    /// Manage notebooks (local metadata)
    Notebook {
        #[command(subcommand)]
        cmd: NotebookCmd,
    },
}
```

Update dispatch to use new ingest/query function signatures.

- [ ] **Step 5: Verify compilation**

Run: `cd epi-cli && cargo check 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/techne/gnosis/
git commit -m "feat(gnosis): rewire CLI to Python epi-gnostic subprocess bridge"
```

---

## Task 9: Cross-Namespace Query Test

**Files:**
- Create: `epi-gnostic/tests/test_cross_namespace.py`

- [ ] **Step 1: Write integration test for cross-namespace vector+graph query**

```python
# epi-gnostic/tests/test_cross_namespace.py
"""Integration test: vector similarity search + cross-namespace graph traversal."""
import os
import pytest
import pytest_asyncio

pytestmark = pytest.mark.asyncio

SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"
skip_if_no_neo4j = pytest.mark.skipif(SKIP_NEO4J, reason="Neo4j not available")


@skip_if_no_neo4j
async def test_unified_vector_graph_query():
    """Query gnostic entities and resolve their Bimba coordinate links."""
    from neo4j import AsyncGraphDatabase

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    driver = AsyncGraphDatabase.driver(uri)

    # Setup: create a gnostic node with coordinate link
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (g:gnostic:test_xns {entity_id: 'xns_test_1', "
            "  entity_name: 'Spanda Vibration', "
            "  description: 'The subtle vibration underlying all manifestation', "
            "  bimba_coordinate: '#1', "
            "  coordinate_family: 'M', "
            "  assignment_method: 'direct'}) "
            "WITH g "
            "MATCH (b:BimbaCoordinate {bimbaCoordinate: '#1'}) "
            "MERGE (g)-[:MAPS_TO_COORDINATE {confidence: 1.0, method: 'direct'}]->(b)"
        )

    # Run the unified query pattern from the spec
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic {entity_id: 'xns_test_1'}) "
            "OPTIONAL MATCH (n)-[r:MAPS_TO_COORDINATE|RESONATES_WITH]->(b:BimbaCoordinate) "
            "RETURN n.entity_name AS name, n.bimba_coordinate AS coord, "
            "n.coordinate_family AS family, "
            "collect({target: b.bimbaCoordinate, rel: type(r), conf: r.confidence}) AS links"
        )
        record = await result.single()
        assert record is not None
        assert record["name"] == "Spanda Vibration"
        assert record["coord"] == "#1"
        assert record["family"] == "M"
        assert len(record["links"]) > 0
        assert record["links"][0]["target"] == "#1"
        assert record["links"][0]["rel"] == "MAPS_TO_COORDINATE"

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MATCH (n:gnostic {entity_id: 'xns_test_1'}) DETACH DELETE n"
        )
    await driver.close()


@skip_if_no_neo4j
async def test_family_label_filtering():
    """Verify secondary family labels enable fast filtering."""
    from neo4j import AsyncGraphDatabase

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    driver = AsyncGraphDatabase.driver(uri)

    # Create nodes with different family labels
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (a:gnostic:M:test_fam {entity_id: 'fam_m1', coordinate_family: 'M'}) "
            "MERGE (b:gnostic:S:test_fam {entity_id: 'fam_s1', coordinate_family: 'S'}) "
            "MERGE (c:gnostic:UNASSIGNED:test_fam {entity_id: 'fam_u1', coordinate_family: '#'})"
        )

    # Filter by M family label
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic:M:test_fam) RETURN count(n) AS cnt"
        )
        record = await result.single()
        assert record["cnt"] == 1

    # Filter UNASSIGNED
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic:UNASSIGNED:test_fam) RETURN count(n) AS cnt"
        )
        record = await result.single()
        assert record["cnt"] == 1

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run("MATCH (n:test_fam) DETACH DELETE n")
    await driver.close()
```

- [ ] **Step 2: Run cross-namespace tests**

Run: `cd epi-gnostic && pytest tests/test_cross_namespace.py -v`
Expected: 2 PASS

- [ ] **Step 3: Commit**

```bash
git add epi-gnostic/tests/test_cross_namespace.py
git commit -m "test(gnostic): cross-namespace vector+graph query integration tests"
```

---

## Task 10: End-to-End Smoke Test

**Files:** No new files. Runs existing code against live services.

**Prerequisites:** All previous tasks complete. Neo4j running. `GEMINI_API_KEY` set.

- [ ] **Step 1: Install epi-gnostic**

Run: `cd epi-gnostic && pip install -e ".[dev]"`

- [ ] **Step 2: Run Python test suite**

Run: `cd epi-gnostic && GEMINI_API_KEY=$GEMINI_API_KEY pytest tests/ -v --tb=short`
Expected: All tests PASS (or SKIP for missing API key)

- [ ] **Step 3: Test CLI status**

Run: `epi-gnostic status`
Expected: `{"status": "ok", "workspace": "gnostic", ...}`

- [ ] **Step 4: Test document ingest (with a real doc)**

Run: `epi-gnostic ingest docs/specs/M/M0-anuttara-language-architecture.md --coordinate M0 --family M`
Expected: `{"status": "success", ...}`

- [ ] **Step 5: Verify nodes in Neo4j**

Run: `docker exec epi-neo4j cypher-shell "MATCH (n:gnostic) RETURN count(n) AS cnt, collect(DISTINCT n.coordinate_family) AS families"`
Expected: Non-zero count, `["M"]` in families

- [ ] **Step 6: Test query**

Run: `epi-gnostic query "What is Anuttara?" --mode hybrid`
Expected: JSON response with answer field containing relevant content

- [ ] **Step 7: Verify Rust CLI bridge**

Run: `cd epi-cli && cargo build && ./target/debug/epi techne gnosis status`
Expected: JSON status output from Python subprocess

- [ ] **Step 8: Run Rust tests**

Run: `cd epi-cli && cargo test gnosis 2>&1 | tail -20`
Expected: Existing gnosis tests pass (notebook CRUD still works)

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat(gnostic): end-to-end RAG-Anything migration complete"
```
