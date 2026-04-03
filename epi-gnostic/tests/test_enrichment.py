"""Tests for the post-ingestion coordinate enrichment module.

Integration tests require Neo4j on localhost:7687 (no auth, dev mode).
Skip with: SKIP_NEO4J_TESTS=true pytest
"""

from __future__ import annotations

import os
import uuid

import pytest
import pytest_asyncio
from neo4j import AsyncGraphDatabase

from epi_gnostic.enrichment.coordinator import CoordinateEnricher
from epi_gnostic.enrichment.prompts import (
    COORDINATE_TAXONOMY,
    RESONANCE_CLASSIFICATION_PROMPT,
)

# ---------------------------------------------------------------------------
# Skip guard
# ---------------------------------------------------------------------------

pytestmark = pytest.mark.asyncio

_SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "").lower() in ("true", "1", "yes")
_skip_neo4j = pytest.mark.skipif(_SKIP_NEO4J, reason="SKIP_NEO4J_TESTS is set")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _unique_workspace() -> str:
    """Unique workspace label per test run to avoid node collisions."""
    return f"test_enrich_{uuid.uuid4().hex[:8]}"


NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_DB = os.getenv("NEO4J_DATABASE", "neo4j")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def driver():
    """Open an AsyncDriver for the test session, close after."""
    drv = AsyncGraphDatabase.driver(NEO4J_URI, auth=None)
    yield drv
    await drv.close()


@pytest_asyncio.fixture
async def enricher(driver):
    """CoordinateEnricher backed by a unique test workspace."""
    ws = _unique_workspace()
    yield CoordinateEnricher(driver=driver, database=NEO4J_DB, workspace=ws), ws, driver


async def _create_gnostic_node(driver, workspace: str, vector_id: str) -> None:
    """Insert a minimal gnostic node for testing."""
    cypher = (
        f"MERGE (n:`{workspace}` {{vector_id: $vid}}) "
        f"SET n.entity_name = $vid, n.content = 'test content'"
    )
    async with driver.session(database=NEO4J_DB) as session:
        await session.run(cypher, vid=vector_id)


async def _delete_gnostic_node(driver, workspace: str, vector_id: str) -> None:
    """Remove a test gnostic node and all its relationships."""
    cypher = f"MATCH (n:`{workspace}` {{vector_id: $vid}}) DETACH DELETE n"
    async with driver.session(database=NEO4J_DB) as session:
        await session.run(cypher, vid=vector_id)


async def _fetch_node(driver, workspace: str, vector_id: str) -> dict | None:
    """Return properties of a workspace node, or None if missing."""
    cypher = (
        f"MATCH (n:`{workspace}` {{vector_id: $vid}}) "
        f"RETURN properties(n) AS props LIMIT 1"
    )
    async with driver.session(database=NEO4J_DB) as session:
        cursor = await session.run(cypher, vid=vector_id)
        record = await cursor.single()
        if record is None:
            return None
        props = dict(record["props"])
        props.pop("embedding", None)
        return props


async def _fetch_edge(
    driver, workspace: str, vector_id: str, rel_type: str
) -> list[dict]:
    """Return properties of all edges of *rel_type* from the node."""
    cypher = (
        f"MATCH (n:`{workspace}` {{vector_id: $vid}})-[r:{rel_type}]->(bc) "
        f"RETURN properties(r) AS rprops, bc.bimbaCoordinate AS coord"
    )
    async with driver.session(database=NEO4J_DB) as session:
        cursor = await session.run(cypher, vid=vector_id)
        records = await cursor.data()
    return [{"rprops": rec["rprops"], "coord": rec["coord"]} for rec in records]


async def _fetch_labels(driver, workspace: str, vector_id: str) -> list[str]:
    """Return the label list of a node."""
    cypher = (
        f"MATCH (n:`{workspace}` {{vector_id: $vid}}) "
        f"RETURN labels(n) AS lbls LIMIT 1"
    )
    async with driver.session(database=NEO4J_DB) as session:
        cursor = await session.run(cypher, vid=vector_id)
        record = await cursor.single()
        if record is None:
            return []
        return list(record["lbls"])


# ---------------------------------------------------------------------------
# Unit tests (no Neo4j)
# ---------------------------------------------------------------------------


def test_prompt_renders():
    """RESONANCE_CLASSIFICATION_PROMPT renders all placeholders correctly."""
    rendered = RESONANCE_CLASSIFICATION_PROMPT.format(
        taxonomy=COORDINATE_TAXONOMY,
        entity_name="Chakra",
        entity_description="An energy centre in the subtle body.",
        source_context="parashakti-deep dataset",
    )
    assert "Chakra" in rendered
    assert "An energy centre" in rendered
    assert "parashakti-deep dataset" in rendered
    # Taxonomy block should be embedded
    assert "M0 Anuttara" in rendered
    assert "C0 Bimba/Source" in rendered
    # Placeholder keys must all be consumed
    assert "{entity_name}" not in rendered
    assert "{entity_description}" not in rendered
    assert "{source_context}" not in rendered
    assert "{taxonomy}" not in rendered


# ---------------------------------------------------------------------------
# Integration tests
# ---------------------------------------------------------------------------


@_skip_neo4j
async def test_direct_assignment_sets_properties(enricher):
    """assign_direct sets bimba_coordinate, coordinate_family, assignment_method,
    and adds the family label to the node."""
    coord_enricher, ws, drv = enricher
    vid = f"test-direct-{uuid.uuid4().hex[:8]}"

    await _create_gnostic_node(drv, ws, vid)
    try:
        await coord_enricher.assign_direct(
            entity_id=vid,
            coordinate="M3",
            family="M",
        )

        props = await _fetch_node(drv, ws, vid)
        assert props is not None, "Node should exist after assign_direct"
        assert props.get("bimba_coordinate") == "M3"
        assert props.get("coordinate_family") == "M"
        assert props.get("assignment_method") == "direct"

        labels = await _fetch_labels(drv, ws, vid)
        assert "M" in labels, f"Expected 'M' label, got: {labels}"
    finally:
        await _delete_gnostic_node(drv, ws, vid)


@_skip_neo4j
async def test_cross_namespace_edge_created(enricher):
    """assign_direct creates a MAPS_TO_COORDINATE edge to the BimbaCoordinate node."""
    coord_enricher, ws, drv = enricher
    vid = f"test-edge-{uuid.uuid4().hex[:8]}"

    # Use a raw archetype coordinate that the existing Neo4j instance holds
    coordinate = "#0"

    await _create_gnostic_node(drv, ws, vid)
    try:
        await coord_enricher.assign_direct(
            entity_id=vid,
            coordinate=coordinate,
            family="#",
        )

        edges = await _fetch_edge(drv, ws, vid, "MAPS_TO_COORDINATE")
        assert len(edges) == 1, (
            f"Expected 1 MAPS_TO_COORDINATE edge, got {len(edges)}"
        )
        edge = edges[0]
        assert edge["coord"] == coordinate
        assert edge["rprops"].get("confidence") == 1.0
        assert edge["rprops"].get("method") == "direct"
    finally:
        await _delete_gnostic_node(drv, ws, vid)
