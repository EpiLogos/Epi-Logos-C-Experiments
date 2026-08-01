"""GnosticRAG — main entry point for ingest and query operations."""
from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Optional
from functools import partial

from lightrag import LightRAG
from lightrag.base import QueryParam
from lightrag.llm.gemini import gemini_model_complete, gemini_embed
from lightrag.utils import EmbeddingFunc
from raganything import RAGAnything, RAGAnythingConfig

from epi_gnostic.config import GnosticConfig
from epi_gnostic.storage.neo4j_vector import Neo4jVectorStorage, POOL_FIELD


# Suffixes MinerU cannot parse and must not be handed. RAG-Anything's parser is
# for PDFs and images; a markdown file makes it exit non-zero and abort the
# ingest. These go to `ainsert` instead — the correct reader, not a fallback.
TEXT_SUFFIXES = {".md", ".markdown", ".txt", ".rst", ".org"}


def _register_neo4j_vector_storage() -> None:
    """Inject Neo4jVectorStorage into LightRAG's storage registries.

    LightRAG's verify_storage_implementation() rejects unknown storage names, and
    _get_storage_class() resolves names via the STORAGES dict using lazy_external_import
    (which does a relative import from the lightrag package).  For an external class we
    bypass both by:
      1. Adding the class name to STORAGE_IMPLEMENTATIONS so verify passes.
      2. Patching _get_storage_class on the LightRAG class so it returns our class directly
         when the name is "Neo4jVectorStorage".
    """
    from lightrag.kg import STORAGE_IMPLEMENTATIONS, STORAGE_ENV_REQUIREMENTS

    # Allow verify_storage_implementation to pass for our class name.
    if "Neo4jVectorStorage" not in STORAGE_IMPLEMENTATIONS["VECTOR_STORAGE"]["implementations"]:
        STORAGE_IMPLEMENTATIONS["VECTOR_STORAGE"]["implementations"].append(
            "Neo4jVectorStorage"
        )

    # No env vars required beyond what GnosticConfig already manages.
    if "Neo4jVectorStorage" not in STORAGE_ENV_REQUIREMENTS:
        STORAGE_ENV_REQUIREMENTS["Neo4jVectorStorage"] = []

    # Monkey-patch _get_storage_class so the external class is returned directly
    # without going through lazy_external_import (which only works for relative paths
    # inside the lightrag package).
    original_get_storage_class = LightRAG._get_storage_class

    def _patched_get_storage_class(self, storage_name: str):  # type: ignore[override]
        if storage_name == "Neo4jVectorStorage":
            return Neo4jVectorStorage
        return original_get_storage_class(self, storage_name)

    LightRAG._get_storage_class = _patched_get_storage_class  # type: ignore[method-assign]


class GnosticRAG:
    """Wraps RAG-Anything with Neo4j vector storage and Gemini models."""

    def __init__(self, config: GnosticConfig):
        self.config = config
        self.lightrag: Optional[LightRAG] = None
        self.rag_anything: Optional[RAGAnything] = None

    async def initialize(self) -> None:
        """Set up LightRAG with Neo4j graph+vector and Gemini models."""
        _register_neo4j_vector_storage()

        api_key = self.config.gemini_api_key

        embedding_func = EmbeddingFunc(
            embedding_dim=self.config.embedding_dim,
            max_token_size=8192,
            func=lambda texts: gemini_embed(
                texts,
                model=self.config.embedding_model,
                api_key=api_key,
            ),
        )

        # partial-bind the API key so LightRAG can call the function without kwargs
        llm_func = partial(
            gemini_model_complete,
            api_key=api_key,
        )

        self.lightrag = LightRAG(
            working_dir=self.config.working_dir,
            workspace=self.config.workspace,
            llm_model_func=llm_func,
            llm_model_name=self.config.llm_model,
            embedding_func=embedding_func,
            graph_storage="Neo4JStorage",
            vector_storage="Neo4jVectorStorage",
            vector_db_storage_cls_kwargs={
                "vector_index_name": f"{self.config.workspace}_entity_embedding",
                "embedding_dim": self.config.embedding_dim,
            },
            auto_manage_storages_states=False,
        )
        await self.lightrag.initialize_storages()

        rag_config = RAGAnythingConfig(
            working_dir=self.config.working_dir,
            parser="mineru",
            parse_method="auto",
        )

        self.rag_anything = RAGAnything(
            lightrag=self.lightrag,
            llm_model_func=llm_func,
            vision_model_func=llm_func,
            config=rag_config,
        )

    async def ingest_text(
        self,
        text: str,
        source_id: str = "unknown",
    ) -> dict:
        """Ingest raw text into the gnostic namespace."""
        if self.lightrag is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")
        await self.lightrag.ainsert(text, ids=source_id)
        return {"status": "success", "entities_count": 1, "source_id": source_id}

    async def ingest_document(
        self,
        file_path: str,
        coordinate: Optional[str] = None,
        family: str = "#",
        output_dir: Optional[str] = None,
    ) -> dict:
        """Ingest a document into the gnostic corpus.

        Routes by kind. MinerU is a PDF/image parser: handed a `.md` it exits
        non-zero and the whole ingest fails. Plain-text sources therefore go
        straight to `ainsert`, carrying `file_paths` so provenance (and the
        pool stamp, which matches on `file_path`) survives. Everything else —
        PDFs, images, office docs — goes through RAG-Anything's parse pipeline.
        This is not a fallback: it is the correct reader for each kind, and it
        matters because the bkmr pool sources `extract_path_candidate` finds are
        exactly `.md`/`.markdown`/`.txt`.
        """
        if self.lightrag is None or self.rag_anything is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")

        path = Path(file_path)
        if path.suffix.lower() in TEXT_SUFFIXES:
            text = path.read_text(encoding="utf-8", errors="replace")
            if not text.strip():
                return {
                    "status": "error",
                    "message": f"{file_path} is empty; nothing to ingest",
                    "file_path": file_path,
                }
            await self.lightrag.ainsert(text, file_paths=str(path))
            return {
                "status": "success",
                "file_path": file_path,
                "coordinate": coordinate,
                "family": family,
                "reader": "text",
            }

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
            "reader": "raganything",
        }

    def _vector_stores(self) -> list[Neo4jVectorStorage]:
        """Every Neo4j-backed vector store LightRAG built for this instance.

        LightRAG constructs three (`entities_vdb`, `relationships_vdb`,
        `chunks_vdb`) from the same class; a pool filter has to apply to all of
        them or a hybrid query would leak un-pooled entities alongside pooled
        chunks.
        """
        if self.lightrag is None:
            return []
        stores = []
        for name in ("entities_vdb", "relationships_vdb", "chunks_vdb"):
            store = getattr(self.lightrag, name, None)
            if isinstance(store, Neo4jVectorStorage):
                stores.append(store)
        return stores

    @contextmanager
    def _pool_scope(self, pool: str | None):
        """Apply a pool filter to every vector store for one query.

        `QueryParam` has no channel for pool membership, so the filter rides on
        the storage objects and is always removed again — a leaked filter would
        silently narrow every later query in the process.
        """
        if pool is None:
            yield
            return
        stores = self._vector_stores()
        for store in stores:
            store._pool_filter = pool
        try:
            yield
        finally:
            for store in stores:
                store._pool_filter = None

    async def stamp_pool(self, file_path: str, pool: str) -> int:
        """Record pool membership on every chunk ingested from *file_path*.

        Runs after ingestion, the same shape `cli.py` already uses to run
        coordinate enrichment over freshly-ingested nodes. Membership is a LIST
        so one source can sit in several pools (a session pool and a coordinate
        pool at once), and re-stamping is idempotent.
        """
        if self.lightrag is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")
        from neo4j import AsyncGraphDatabase

        name = Path(file_path).name
        cypher = (
            f"MATCH (n:`{self.config.workspace}`) WHERE n.file_path CONTAINS $fp "
            f"SET n.{POOL_FIELD} = "
            f"  CASE WHEN n.{POOL_FIELD} IS NULL THEN [$pool] "
            f"       WHEN $pool IN n.{POOL_FIELD} THEN n.{POOL_FIELD} "
            f"       ELSE n.{POOL_FIELD} + $pool END "
            f"RETURN count(n) AS stamped"
        )
        driver = AsyncGraphDatabase.driver(self.config.neo4j_uri)
        try:
            async with driver.session(database=self.config.neo4j_database) as session:
                cursor = await session.run(cypher, fp=name, pool=pool)
                record = await cursor.single()
                return int(record["stamped"]) if record else 0
        finally:
            await driver.close()

    async def query(
        self,
        question: str,
        mode: str = "hybrid",
        top_k: int | None = None,
        pool: str | None = None,
    ) -> str:
        """Query the gnostic namespace.

        ``top_k`` bounds how many retrieved items the mode considers.
        ``QueryParam`` defaults it from the ``TOP_K`` environment variable, so
        `None` means "leave LightRAG's own default alone" — passing `None`
        explicitly would override that default with nothing and raise.
        """
        if self.lightrag is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")
        param = QueryParam(mode=mode) if top_k is None else QueryParam(mode=mode, top_k=top_k)
        with self._pool_scope(pool):
            result = await self.lightrag.aquery(question, param=param)
        return result if isinstance(result, str) else ""

    async def shutdown(self) -> None:
        """Finalize storage connections."""
        if self.lightrag is not None:
            await self.lightrag.finalize_storages()
