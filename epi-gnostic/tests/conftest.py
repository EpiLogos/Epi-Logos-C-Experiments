import os
import pytest

# Ensure tests don't hit real Gemini API by default
os.environ.setdefault("GEMINI_API_KEY", "test-key-not-real")

# LightRAG's Neo4JStorage requires these env vars (even for no-auth dev instances)
os.environ.setdefault("NEO4J_URI", "bolt://localhost:7687")
os.environ.setdefault("NEO4J_USERNAME", "neo4j")
os.environ.setdefault("NEO4J_PASSWORD", "neo4j")


@pytest.fixture
def neo4j_uri():
    return os.getenv("NEO4J_URI", "bolt://localhost:7687")


@pytest.fixture
def gnostic_config():
    from epi_gnostic.config import GnosticConfig
    return GnosticConfig(working_dir="/tmp/epi-gnostic-test")
