"""Integration test: vector similarity search + cross-namespace graph traversal."""
import os
import pytest

pytestmark = pytest.mark.asyncio

SKIP_NEO4J = os.getenv("SKIP_NEO4J_TESTS", "false").lower() == "true"
skip_if_no_neo4j = pytest.mark.skipif(SKIP_NEO4J, reason="Neo4j not available")


@skip_if_no_neo4j
async def test_unified_vector_graph_query():
    """Query gnostic entities and resolve their Bimba coordinate links."""
    from neo4j import AsyncGraphDatabase

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    driver = AsyncGraphDatabase.driver(uri)

    # Setup: create a gnostic node with coordinate link
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (g:gnostic:test_xns {entity_id: 'xns_test_1', "
            "  entity_name: 'Spanda Vibration', "
            "  description: 'The subtle vibration underlying all manifestation', "
            "  bimba_coordinate: '#1', "
            "  coordinate_family: 'M', "
            "  assignment_method: 'direct'}) "
            "WITH g "
            "MATCH (b:BimbaCoordinate {bimbaCoordinate: '#1'}) "
            "MERGE (g)-[:MAPS_TO_COORDINATE {confidence: 1.0, method: 'direct'}]->(b)"
        )

    # Run the unified query pattern from the spec
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic {entity_id: 'xns_test_1'}) "
            "OPTIONAL MATCH (n)-[r:MAPS_TO_COORDINATE|RESONATES_WITH]->(b:BimbaCoordinate) "
            "RETURN n.entity_name AS name, n.bimba_coordinate AS coord, "
            "n.coordinate_family AS family, "
            "collect({target: b.bimbaCoordinate, rel: type(r), conf: r.confidence}) AS links"
        )
        record = await result.single()
        assert record is not None
        assert record["name"] == "Spanda Vibration"
        assert record["coord"] == "#1"
        assert record["family"] == "M"
        assert len(record["links"]) > 0
        assert record["links"][0]["target"] == "#1"
        assert record["links"][0]["rel"] == "MAPS_TO_COORDINATE"

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MATCH (n:gnostic {entity_id: 'xns_test_1'}) DETACH DELETE n"
        )
    await driver.close()


@skip_if_no_neo4j
async def test_family_label_filtering():
    """Verify coordinate family filtering uses properties, not labels."""
    from neo4j import AsyncGraphDatabase

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    driver = AsyncGraphDatabase.driver(uri)

    # Create nodes with different coordinate-family properties.
    async with driver.session(database="neo4j") as session:
        await session.run(
            "MERGE (a:gnostic:test_fam {entity_id: 'fam_m1', coordinate_family: 'M'}) "
            "MERGE (b:gnostic:test_fam {entity_id: 'fam_s1', coordinate_family: 'S'}) "
            "MERGE (c:gnostic:test_fam {entity_id: 'fam_u1', coordinate_family: '#'})"
        )

    # Filter by family property.
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic:test_fam {coordinate_family: 'M'}) RETURN count(n) AS cnt"
        )
        record = await result.single()
        assert record["cnt"] == 1

    # Filter unassigned family property.
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic:test_fam {coordinate_family: '#'}) RETURN count(n) AS cnt"
        )
        record = await result.single()
        assert record["cnt"] == 1

    # Coordinate values must not appear as labels.
    async with driver.session(database="neo4j") as session:
        result = await session.run(
            "MATCH (n:gnostic:test_fam) "
            "WHERE n:M OR n:S OR n:UNASSIGNED "
            "RETURN count(n) AS cnt"
        )
        record = await result.single()
        assert record["cnt"] == 0

    # Cleanup
    async with driver.session(database="neo4j") as session:
        await session.run("MATCH (n:test_fam) DETACH DELETE n")
    await driver.close()
