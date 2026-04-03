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
