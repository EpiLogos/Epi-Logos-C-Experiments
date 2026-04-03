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
