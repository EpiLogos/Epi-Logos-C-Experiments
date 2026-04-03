"""GnosticRAG — main entry point for ingest and query operations."""
from __future__ import annotations

from typing import Optional
from functools import partial

from lightrag import LightRAG
from lightrag.base import QueryParam
from lightrag.llm.gemini import gemini_model_complete, gemini_embed
from lightrag.utils import EmbeddingFunc
from raganything import RAGAnything, RAGAnythingConfig

from epi_gnostic.config import GnosticConfig
from epi_gnostic.storage.neo4j_vector import Neo4jVectorStorage


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
        """Ingest a document (PDF, image, etc.) via RAG-Anything."""
        if self.rag_anything is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")
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
        if self.lightrag is None:
            raise RuntimeError("GnosticRAG not initialized. Call initialize() first.")
        result = await self.lightrag.aquery(question, param=QueryParam(mode=mode))
        return result if isinstance(result, str) else ""

    async def shutdown(self) -> None:
        """Finalize storage connections."""
        if self.lightrag is not None:
            await self.lightrag.finalize_storages()
