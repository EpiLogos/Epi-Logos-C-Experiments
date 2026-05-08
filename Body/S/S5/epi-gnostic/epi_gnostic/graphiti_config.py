"""Configuration for the Graphiti episodic memory compatibility adapter."""
import os
from dataclasses import dataclass, field

GRAPHITI_PORT = 37778


@dataclass
class GraphitiConfig:
    """Config loaded from env vars. Shares Neo4j + Redis with Gnostic and Bimba."""

    neo4j_uri: str = field(
        default_factory=lambda: os.getenv("NEO4J_URI", "bolt://localhost:7687")
    )
    neo4j_user: str = field(
        default_factory=lambda: os.getenv("NEO4J_USER", "neo4j")
    )
    neo4j_password: str = field(
        default_factory=lambda: os.getenv("NEO4J_PASSWORD", "")
    )
    neo4j_database: str = field(
        default_factory=lambda: os.getenv("NEO4J_DATABASE", "neo4j")
    )
    gemini_api_key: str = field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", "")
    )
    llm_model: str = field(
        default_factory=lambda: os.getenv("GNOSTIC_LLM_MODEL", "gemini-3.1-flash-lite")
    )
    port: int = field(
        default_factory=lambda: int(os.getenv("GRAPHITI_PORT", str(GRAPHITI_PORT)))
    )
    # Same embedding config as Gnostic — unified 3072-dim space
    embedding_model: str = field(
        default_factory=lambda: os.getenv(
            "GNOSTIC_EMBEDDING_MODEL", "gemini-embedding-2-preview"
        )
    )
    embedding_dim: int = field(
        default_factory=lambda: int(os.getenv("GNOSTIC_EMBEDDING_DIM", "3072"))
    )
    redis_url: str = field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379")
    )
