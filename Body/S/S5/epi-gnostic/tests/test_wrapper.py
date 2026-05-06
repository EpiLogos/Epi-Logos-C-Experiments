"""Integration tests for GnosticRAG wrapper.

These tests require both a live Neo4j instance and a real GEMINI_API_KEY.
They are skipped automatically when either is unavailable.
"""
import os
import pytest

pytestmark = pytest.mark.asyncio

SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"
SKIP_GEMINI = os.getenv("GEMINI_API_KEY", "") in ("", "test-key-not-real")

skip_integration = pytest.mark.skipif(
    SKIP_NEO4J or SKIP_GEMINI,
    reason="Requires Neo4j and GEMINI_API_KEY",
)


@skip_integration
async def test_wrapper_initializes():
    """GnosticRAG.initialize() wires up both lightrag and rag_anything."""
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig(workspace="test_wrapper_init")
    rag = GnosticRAG(config)
    await rag.initialize()
    assert rag.lightrag is not None
    assert rag.rag_anything is not None
    await rag.shutdown()


@skip_integration
async def test_wrapper_ingest_text():
    """Ingesting a text string returns a success response with entities_count > 0."""
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


@skip_integration
async def test_wrapper_ingest_and_query():
    """Ingest text then query in the same session — returns a non-empty string."""
    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig(workspace="test_wrapper_ingest_query")
    rag = GnosticRAG(config)
    await rag.initialize()
    try:
        await rag.ingest_text(
            "Quaternions encode rotations as w + xi + yj + zk. "
            "The four elements map to Earth, Fire, Water, Air.",
            source_id="test_doc_2",
        )
        result = await rag.query("What do quaternion elements represent?", mode="naive")
        assert isinstance(result, str)
        assert len(result) > 0
    finally:
        await rag.shutdown()
