"""Configuration for the Gnostic RAG namespace."""
import os
from dataclasses import dataclass, field
from pathlib import Path

# The Gnostic embedding dimension is a single value, not a tunable.
#
# Gnosis and Bimba share one Neo4j vector index (`coord_embedding`, 3072/COSINE)
# and one cross-namespace edge (`MAPS_TO_COORDINATE`), so a config that loads at
# any other width writes vectors that index cannot hold and quietly splits the
# shared space in two. The old nine-value allowlist advertised a choice the
# substrate never offered; the only accepted width is the canonical one.
CANONICAL_EMBEDDING_DIM = 3072
VALID_EMBEDDING_DIMS = {CANONICAL_EMBEDDING_DIM}
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
                f"embedding_dim must be {CANONICAL_EMBEDDING_DIM}, got "
                f"{self.embedding_dim}. The Gnostic namespace shares the "
                f"3072/COSINE `coord_embedding` index with Bimba; no other "
                f"width is storable."
            )
        Path(self.working_dir).mkdir(parents=True, exist_ok=True)
