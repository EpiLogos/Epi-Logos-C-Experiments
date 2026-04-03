"""Post-ingestion coordinate enrichment for the Gnostic RAG namespace."""

from epi_gnostic.enrichment.coordinator import CoordinateEnricher
from epi_gnostic.enrichment.prompts import (
    COORDINATE_TAXONOMY,
    RESONANCE_CLASSIFICATION_PROMPT,
)

__all__ = [
    "CoordinateEnricher",
    "COORDINATE_TAXONOMY",
    "RESONANCE_CLASSIFICATION_PROMPT",
]
