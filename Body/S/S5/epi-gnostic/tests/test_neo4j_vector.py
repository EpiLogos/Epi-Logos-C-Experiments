"""Tests for Neo4jVectorStorage.

Requires Neo4j running on localhost:7687 with no auth (docker dev mode).
Skip with: SKIP_NEO4J_TESTS=true pytest
"""

from __future__ import annotations

import os
import uuid

import numpy as np
import pytest
import pytest_asyncio
from lightrag.base import EmbeddingFunc

from epi_gnostic.storage.neo4j_vector import Neo4jVectorStorage

pytestmark = pytest.mark.asyncio

# Allow skipping when no Neo4j is available
if os.getenv("SKIP_NEO4J_TESTS", "").lower() in ("true", "1", "yes"):
    pytestmark = [pytestmark, pytest.mark.skip(reason="SKIP_NEO4J_TESTS is set")]

EMBEDDING_DIM = 8


# ------------------------------------------------------------------ #
# Helpers
# ------------------------------------------------------------------ #


async def _mock_embed(texts: list[str]) -> np.ndarray:
    """Deterministic 8-dim unit-normalised embeddings."""
    rng = np.random.default_rng(seed=42)
    vecs = rng.standard_normal((len(texts), EMBEDDING_DIM)).astype(np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    return vecs / norms


def _make_embedding_func() -> EmbeddingFunc:
    return EmbeddingFunc(embedding_dim=EMBEDDING_DIM, func=_mock_embed)


def _unique_workspace() -> str:
    """Return a unique workspace label so tests don't collide."""
    return f"test_gnostic_{uuid.uuid4().hex[:8]}"


# ------------------------------------------------------------------ #
# Fixtures
# ------------------------------------------------------------------ #


@pytest_asyncio.fixture
async def storage():
    """Yield a freshly initialised Neo4jVectorStorage, clean up after."""
    ws = _unique_workspace()
    s = Neo4jVectorStorage(
        namespace="vec",
        workspace=ws,
        global_config={
            "neo4j_uri": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            "neo4j_database": os.getenv("NEO4J_DATABASE", "neo4j"),
        },
        embedding_func=_make_embedding_func(),
        cosine_better_than_threshold=0.0,  # accept all matches in tests
        meta_fields={"source_id"},
        embedding_dim=EMBEDDING_DIM,
    )
    await s.initialize()
    yield s
    await s.drop()
    await s.finalize()


# ------------------------------------------------------------------ #
# Tests
# ------------------------------------------------------------------ #


async def test_upsert_and_query(storage: Neo4jVectorStorage):
    data = {
        "id-alpha": {"content": "alpha content", "entity_name": "alpha"},
        "id-beta": {"content": "beta content", "entity_name": "beta"},
    }
    await storage.upsert(data)

    results = await storage.query("alpha content", top_k=5)
    assert len(results) >= 1
    names = [r.get("entity_name") for r in results]
    assert "alpha" in names or "beta" in names  # at least one hit


async def test_get_by_id(storage: Neo4jVectorStorage):
    await storage.upsert(
        {"id-single": {"content": "single item", "entity_name": "single"}}
    )
    result = await storage.get_by_id("id-single")
    assert result is not None
    assert result["vector_id"] == "id-single"
    assert result["entity_name"] == "single"
    # embedding should be stripped
    assert "embedding" not in result


async def test_get_by_ids(storage: Neo4jVectorStorage):
    await storage.upsert(
        {
            "id-x": {"content": "x", "entity_name": "ex"},
            "id-y": {"content": "y", "entity_name": "why"},
        }
    )
    results = await storage.get_by_ids(["id-x", "id-y", "id-nonexistent"])
    assert len(results) == 2
    found_ids = {r["vector_id"] for r in results}
    assert found_ids == {"id-x", "id-y"}


async def test_delete_entity(storage: Neo4jVectorStorage):
    await storage.upsert(
        {"id-del": {"content": "to delete", "entity_name": "doomed"}}
    )
    await storage.delete_entity("doomed")
    result = await storage.get_by_id("id-del")
    assert result is None


async def test_delete_by_ids(storage: Neo4jVectorStorage):
    await storage.upsert(
        {
            "id-a": {"content": "a", "entity_name": "a"},
            "id-b": {"content": "b", "entity_name": "b"},
            "id-c": {"content": "c", "entity_name": "c"},
        }
    )
    await storage.delete(["id-a", "id-b"])
    remaining = await storage.get_by_ids(["id-a", "id-b", "id-c"])
    assert len(remaining) == 1
    assert remaining[0]["vector_id"] == "id-c"


async def test_get_vectors_by_ids(storage: Neo4jVectorStorage):
    await storage.upsert(
        {"id-vec": {"content": "vector me", "entity_name": "v"}}
    )
    vecs = await storage.get_vectors_by_ids(["id-vec"])
    assert "id-vec" in vecs
    assert len(vecs["id-vec"]) == EMBEDDING_DIM


async def test_delete_entity_relation(storage: Neo4jVectorStorage):
    """delete_entity_relation removes Neo4j relationships, not the node itself."""
    await storage.upsert(
        {
            "id-rel-src": {
                "content": "source entity",
                "entity_name": "Source",
                "source_id": "src",
            },
        }
    )
    # Should not raise; node survives but any edges are removed
    await storage.delete_entity_relation("Source")
    result = await storage.get_by_id("id-rel-src")
    assert result is not None
    assert result["entity_name"] == "Source"


async def test_drop_clears_all(storage: Neo4jVectorStorage):
    await storage.upsert(
        {
            "id-drop1": {"content": "drop1", "entity_name": "d1"},
            "id-drop2": {"content": "drop2", "entity_name": "d2"},
        }
    )
    status = await storage.drop()
    assert status["status"] == "success"

    remaining = await storage.get_by_ids(["id-drop1", "id-drop2"])
    assert len(remaining) == 0


# ------------------------------------------------------------------ #
# Pool-scoped retrieval (bkmr pooling -> sync -> RAG)
# ------------------------------------------------------------------ #


async def test_pool_filter_scopes_retrieval_to_pool_members(storage):
    """A pool filter must return ONLY chunks carrying that pool.

    This is the substrate notebook-scoped RAG stands on: a notebook is a pool of
    sources, and retrieval over it has to be real RAG restricted to the pool —
    not keyword search over a side store.
    """
    await storage.upsert({
        "in-pool-1": {"content": "the torus is the primary workflow topology",
                      "gnostic_pools": ["khora-session-alpha"]},
        "in-pool-2": {"content": "the lemniscate folds inward at position four",
                      "gnostic_pools": ["khora-session-alpha", "family-M"]},
        "out-of-pool": {"content": "the klein bottle makes inside and outside one",
                        "gnostic_pools": ["khora-session-beta"]},
        "never-pooled": {"content": "a chunk that belongs to no pool at all"},
    })

    unscoped = await storage.query("topology", top_k=10)
    assert len(unscoped) == 4, f"unscoped retrieval must see everything, got {len(unscoped)}"

    storage._pool_filter = "khora-session-alpha"
    try:
        scoped = await storage.query("topology", top_k=10)
    finally:
        storage._pool_filter = None

    ids = {row["vector_id"] for row in scoped}
    assert ids == {"in-pool-1", "in-pool-2"}, (
        f"pool filter must admit exactly its members, got {ids}"
    )


async def test_pool_membership_is_multi_valued(storage):
    """One source can sit in several pools — a session pool and a coordinate
    pool at once — so membership is a list, not a scalar."""
    await storage.upsert({
        "shared": {"content": "shared source", "gnostic_pools": ["pool-a", "pool-b"]},
    })

    for pool in ("pool-a", "pool-b"):
        storage._pool_filter = pool
        try:
            rows = await storage.query("shared", top_k=5)
        finally:
            storage._pool_filter = None
        assert {r["vector_id"] for r in rows} == {"shared"}, f"{pool} must admit the shared source"


async def test_an_unknown_pool_returns_nothing_rather_than_everything(storage):
    """A filter that matches no member must return empty — silently falling back
    to the unscoped corpus is how a scoped query lies about what it read."""
    await storage.upsert({
        "a": {"content": "some content", "gnostic_pools": ["pool-a"]},
    })
    storage._pool_filter = "pool-that-does-not-exist"
    try:
        rows = await storage.query("content", top_k=5)
    finally:
        storage._pool_filter = None
    assert rows == [], f"expected an honest empty, got {rows}"
