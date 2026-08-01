import os
import pytest
from epi_gnostic.embedding import CANONICAL_EMBEDDING_MODEL
from epi_gnostic.config import GnosticConfig


def test_config_loads_defaults(tmp_path):
    config = GnosticConfig(working_dir=str(tmp_path / "gnostic"))
    assert config.neo4j_uri == "bolt://localhost:7687"
    assert config.neo4j_database == "neo4j"
    assert config.workspace == "gnostic"
    assert config.embedding_dim == 3072
    # gemini-embedding-2 is the STABLE multimodal id (confirmed against the live
    # models.list surface: gemini-embedding-001, -2-preview, -2). Bound to the
    # constant so the default and the adapter cannot drift apart — and note the
    # vectors of -001 and -2 are DIFFERENT coordinate spaces, so changing this
    # invalidates the corpus rather than extending it.
    assert config.embedding_model == CANONICAL_EMBEDDING_MODEL
    assert CANONICAL_EMBEDDING_MODEL == "gemini-embedding-2"
    assert config.llm_model == "gemini-3.1-flash-lite"
    assert str(config.working_dir).endswith("gnostic")


def test_config_reads_env_overrides(monkeypatch, tmp_path):
    monkeypatch.setenv("NEO4J_URI", "bolt://custom:7687")
    monkeypatch.setenv("GNOSTIC_WORKSPACE", "test_ws")
    monkeypatch.setenv("GNOSTIC_EMBEDDING_DIM", "3072")
    config = GnosticConfig(working_dir=str(tmp_path / "gnostic"))
    assert config.neo4j_uri == "bolt://custom:7687"
    assert config.workspace == "test_ws"
    assert config.embedding_dim == 3072


def test_env_embedding_dim_other_than_the_canonical_one_is_rejected(monkeypatch):
    """`GNOSTIC_EMBEDDING_DIM=768` used to be accepted. It is now refused.

    The Gnostic namespace shares one Neo4j vector index (`coord_embedding`,
    3072/COSINE) with Bimba. A config that loads at any other width writes
    vectors the index cannot hold and silently splits the shared space, so the
    dimension is not a tunable — it is a single value, and the only honest
    place to say so is at config load.
    """
    monkeypatch.setenv("GNOSTIC_EMBEDDING_DIM", "768")
    with pytest.raises(ValueError, match="3072"):
        GnosticConfig()


@pytest.mark.parametrize("dim", [128, 256, 384, 512, 768, 1024, 1536, 2048])
def test_previously_allowed_dims_are_now_rejected(dim):
    """Every width the old allowlist admitted must now fail closed."""
    with pytest.raises(ValueError, match="3072"):
        GnosticConfig(embedding_dim=dim)


def test_config_validates_embedding_dim():
    with pytest.raises(ValueError, match="3072"):
        GnosticConfig(embedding_dim=9999)
