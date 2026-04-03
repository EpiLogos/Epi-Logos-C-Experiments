"""Neo4j-backed vector storage implementing LightRAG's BaseVectorStorage.

Uses Neo4j native vector indexes (HNSW, cosine) with db.create.setNodeVectorProperty
for storage-efficient embedding persistence. All nodes carry a workspace label for
multi-tenant isolation.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

import numpy as np
from lightrag.base import BaseVectorStorage
from neo4j import AsyncGraphDatabase

logger = logging.getLogger(__name__)

# Default batch size for UNWIND upserts
_DEFAULT_BATCH_SIZE = 500


@dataclass
class Neo4jVectorStorage(BaseVectorStorage):
    """BaseVectorStorage implementation backed by Neo4j native vector indexes.

    Dataclass fields inherited from BaseVectorStorage / StorageNameSpace:
        namespace, workspace, global_config, embedding_func,
        cosine_better_than_threshold, meta_fields

    Extra fields:
        vector_index_name: Name of the Neo4j vector index.
        embedding_dim: Dimensionality of stored vectors.
    """

    vector_index_name: str = ""
    embedding_dim: int = 0

    # Internal — not part of the dataclass public API
    _driver: Any = field(default=None, init=False, repr=False)
    _db: str = field(default="neo4j", init=False, repr=False)

    # ------------------------------------------------------------------ #
    # Lifecycle
    # ------------------------------------------------------------------ #

    async def initialize(self) -> None:
        """Create the async Neo4j driver, btree + vector indexes."""
        cfg = self.global_config

        uri = cfg.get("neo4j_uri", "bolt://localhost:7687")
        self._db = cfg.get("neo4j_database", "neo4j")

        # Derive defaults when the caller left them at sentinel values
        if not self.vector_index_name:
            self.vector_index_name = f"vec_{self.workspace}_{self.namespace}"
        if self.embedding_dim == 0:
            self.embedding_dim = getattr(self.embedding_func, "embedding_dim", 3072)

        self._driver = AsyncGraphDatabase.driver(uri, auth=None)
        await self._ensure_btree_index()
        await self._ensure_vector_index()

    async def finalize(self) -> None:
        """Close the Neo4j driver."""
        if self._driver is not None:
            await self._driver.close()
            self._driver = None

    # ------------------------------------------------------------------ #
    # Index management (private)
    # ------------------------------------------------------------------ #

    async def _ensure_btree_index(self) -> None:
        """Create a btree index on vector_id for fast lookups."""
        label = self.workspace
        idx_name = f"btree_{self.workspace}_{self.namespace}_vid"
        query = (
            f"CREATE INDEX `{idx_name}` IF NOT EXISTS "
            f"FOR (n:`{label}`) ON (n.vector_id)"
        )
        async with self._driver.session(database=self._db) as session:
            await session.run(query)

    async def _ensure_vector_index(self) -> None:
        """Create the HNSW cosine vector index if it does not already exist."""
        label = self.workspace
        idx = self.vector_index_name
        dim = self.embedding_dim

        # Neo4j 5.x CREATE VECTOR INDEX syntax
        query = (
            f"CREATE VECTOR INDEX `{idx}` IF NOT EXISTS "
            f"FOR (n:`{label}`) ON (n.embedding) "
            f"OPTIONS {{indexConfig: {{"
            f"  `vector.dimensions`: {dim},"
            f"  `vector.similarity_function`: 'cosine'"
            f"}}}}"
        )
        async with self._driver.session(database=self._db) as session:
            await session.run(query)

        # Wait briefly for the index to come online
        await self._wait_for_index_online()

    async def _wait_for_index_online(self, timeout: float = 10.0) -> None:
        """Poll until the vector index reports ONLINE (or timeout)."""
        idx = self.vector_index_name
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            async with self._driver.session(database=self._db) as session:
                result = await session.run(
                    "SHOW INDEXES YIELD name, state "
                    "WHERE name = $idx RETURN state",
                    idx=idx,
                )
                record = await result.single()
                if record and record["state"] == "ONLINE":
                    return
            await asyncio.sleep(0.25)
        logger.warning("Vector index %s did not come ONLINE within %.1fs", idx, timeout)

    # ------------------------------------------------------------------ #
    # Abstract method implementations
    # ------------------------------------------------------------------ #

    async def query(
        self,
        query: str,
        top_k: int,
        query_embedding: list[float] | None = None,
    ) -> list[dict[str, Any]]:
        """Cosine-similarity search via Neo4j vector index."""
        if query_embedding is None:
            emb_result = await self.embedding_func([query])
            query_embedding = emb_result[0].tolist()

        label = self.workspace
        idx = self.vector_index_name
        threshold = self.cosine_better_than_threshold

        cypher = (
            f"CALL db.index.vector.queryNodes('{idx}', $top_k, $vec) "
            f"YIELD node, score "
            f"WHERE score >= $threshold AND node:`{label}` "
            f"RETURN node {{.*, score: score}} AS doc"
        )

        results: list[dict[str, Any]] = []
        async with self._driver.session(database=self._db) as session:
            cursor = await session.run(
                cypher,
                top_k=top_k,
                vec=query_embedding,
                threshold=threshold,
            )
            records = await cursor.data()
            for rec in records:
                doc = rec["doc"]
                # Strip the embedding from returned data (large)
                doc.pop("embedding", None)
                results.append(doc)

        return results

    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        """Batch upsert nodes with embeddings into Neo4j.

        Each value in *data* is a dict that MUST contain a ``"content"`` key
        (the text to embed). Any extra keys are stored as node properties.
        """
        if not data:
            return

        label = self.workspace
        ids = list(data.keys())

        # Compute embeddings for items that don't already have one
        texts_to_embed: list[str] = []
        idx_map: list[int] = []
        items = list(data.values())
        for i, item in enumerate(items):
            if "embedding" not in item:
                texts_to_embed.append(item.get("content", ""))
                idx_map.append(i)

        if texts_to_embed:
            embeddings = await self.embedding_func(texts_to_embed)
            for j, i in enumerate(idx_map):
                items[i]["embedding"] = embeddings[j].tolist()

        # Build parameter rows
        rows: list[dict[str, Any]] = []
        for vid, item in zip(ids, items):
            emb = item.pop("embedding")
            row: dict[str, Any] = {"vector_id": vid, "embedding": emb}
            # Store entity_name and all meta_fields as node properties
            for key in ("entity_name", "content", *self.meta_fields):
                if key in item:
                    row[key] = item[key]
            rows.append(row)

        # Batch via UNWIND
        batch_size = self.global_config.get("upsert_batch_size", _DEFAULT_BATCH_SIZE)
        for start in range(0, len(rows), batch_size):
            batch = rows[start : start + batch_size]
            cypher = (
                f"UNWIND $rows AS row "
                f"MERGE (n:`{label}` {{vector_id: row.vector_id}}) "
                f"SET n += row "
                f"WITH n, row "
                f"CALL db.create.setNodeVectorProperty(n, 'embedding', row.embedding)"
            )
            async with self._driver.session(database=self._db) as session:
                await session.run(cypher, rows=batch)

    async def delete_entity(self, entity_name: str) -> None:
        """Delete nodes matching the given entity_name."""
        label = self.workspace
        cypher = f"MATCH (n:`{label}` {{entity_name: $name}}) DETACH DELETE n"
        async with self._driver.session(database=self._db) as session:
            await session.run(cypher, name=entity_name)

    async def delete_entity_relation(self, entity_name: str) -> None:
        """Delete relationships attached to nodes with the given entity_name."""
        label = self.workspace
        cypher = (
            f"MATCH (n:`{label}` {{entity_name: $name}})-[r]-() DELETE r"
        )
        async with self._driver.session(database=self._db) as session:
            await session.run(cypher, name=entity_name)

    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        """Return a single node's properties by vector_id, or None."""
        label = self.workspace
        cypher = (
            f"MATCH (n:`{label}` {{vector_id: $vid}}) "
            f"RETURN properties(n) AS props LIMIT 1"
        )
        async with self._driver.session(database=self._db) as session:
            cursor = await session.run(cypher, vid=id)
            record = await cursor.single()
            if record is None:
                return None
            props = dict(record["props"])
            props.pop("embedding", None)
            return props

    async def get_by_ids(self, ids: list[str]) -> list[dict[str, Any]]:
        """Return node properties for each found vector_id."""
        if not ids:
            return []
        label = self.workspace
        cypher = (
            f"MATCH (n:`{label}`) WHERE n.vector_id IN $ids "
            f"RETURN properties(n) AS props"
        )
        results: list[dict[str, Any]] = []
        async with self._driver.session(database=self._db) as session:
            cursor = await session.run(cypher, ids=ids)
            records = await cursor.data()
            for rec in records:
                props = dict(rec["props"])
                props.pop("embedding", None)
                results.append(props)
        return results

    async def delete(self, ids: list[str]) -> None:
        """Delete nodes by their vector_ids."""
        if not ids:
            return
        label = self.workspace
        cypher = f"MATCH (n:`{label}`) WHERE n.vector_id IN $ids DETACH DELETE n"
        async with self._driver.session(database=self._db) as session:
            await session.run(cypher, ids=ids)

    async def get_vectors_by_ids(self, ids: list[str]) -> dict[str, list[float]]:
        """Return {vector_id: embedding} for the requested ids."""
        if not ids:
            return {}
        label = self.workspace
        cypher = (
            f"MATCH (n:`{label}`) WHERE n.vector_id IN $ids "
            f"RETURN n.vector_id AS vid, n.embedding AS emb"
        )
        result: dict[str, list[float]] = {}
        async with self._driver.session(database=self._db) as session:
            cursor = await session.run(cypher, ids=ids)
            records = await cursor.data()
            for rec in records:
                if rec["emb"] is not None:
                    result[rec["vid"]] = list(rec["emb"])
        return result

    async def index_done_callback(self) -> None:
        """No-op for Neo4j — writes are immediately durable."""
        pass

    async def drop(self) -> dict[str, str]:
        """Remove all nodes with this workspace label and drop the vector index."""
        label = self.workspace
        try:
            async with self._driver.session(database=self._db) as session:
                # Delete all nodes with workspace label
                await session.run(f"MATCH (n:`{label}`) DETACH DELETE n")
                # Drop the vector index
                await session.run(
                    f"DROP INDEX `{self.vector_index_name}` IF EXISTS"
                )
                # Drop the btree index
                btree_idx = f"btree_{self.workspace}_{self.namespace}_vid"
                await session.run(f"DROP INDEX `{btree_idx}` IF EXISTS")
            return {"status": "success", "message": "data dropped"}
        except Exception as exc:
            logger.error("drop() failed: %s", exc)
            return {"status": "error", "message": str(exc)}
