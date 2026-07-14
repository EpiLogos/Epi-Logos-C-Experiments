"""12.T12.2 ONE-substrate smoke: the six new CLI commands answer honestly.

Live-Neo4j house style (conftest env defaults). Graph fixtures use a
dedicated test workspace label so the production `gnostic` workspace is
never touched; :Episodic is only read (improbable-string search), never
written — that space belongs to Graphiti.
"""
import asyncio
import json

import pytest
from neo4j import AsyncGraphDatabase

from epi_gnostic.cli import _graph_read, _list_notebooks, _notebook, _run
from epi_gnostic.config import GnosticConfig

TEST_WS = "gnostic_smoke_test"
NEO4J_DB = "neo4j"


@pytest.fixture
def smoke_config(tmp_path):
    return GnosticConfig(working_dir=str(tmp_path))


def _test_config_for_ws(tmp_path) -> GnosticConfig:
    config = GnosticConfig(working_dir=str(tmp_path))
    config.workspace = TEST_WS
    return config


async def _seed_nodes(uri: str) -> None:
    driver = AsyncGraphDatabase.driver(uri)
    try:
        async with driver.session(database=NEO4J_DB) as session:
            await session.run(f"MATCH (n:`{TEST_WS}`) DETACH DELETE n")
            await session.run(
                f"CREATE (:`{TEST_WS}` {{vector_id: 'smoke-orphan', entity_name: 'Orphan Entity', "
                f"content: 'unassigned', source_id: 'chunk-a<SEP>chunk-b'}})"
            )
            await session.run(
                f"CREATE (:`{TEST_WS}` {{vector_id: 'smoke-assigned', entity_name: 'Assigned Entity', "
                f"content: 'assigned', bimba_coordinate: 'M2-1', coordinate_family: 'M', "
                f"assignment_method: 'direct', source_id: 'chunk-c'}})"
            )
    finally:
        await driver.close()


async def _teardown_nodes(uri: str) -> None:
    driver = AsyncGraphDatabase.driver(uri)
    try:
        async with driver.session(database=NEO4J_DB) as session:
            await session.run(f"MATCH (n:`{TEST_WS}`) DETACH DELETE n")
    finally:
        await driver.close()


@pytest.fixture
def seeded_graph(neo4j_uri, tmp_path):
    asyncio.run(_seed_nodes(neo4j_uri))
    yield _test_config_for_ws(tmp_path)
    asyncio.run(_teardown_nodes(neo4j_uri))


def test_candidates_orphan_and_promotable_read_the_real_enrichment_vocabulary(seeded_graph):
    orphans = asyncio.run(_graph_read(seeded_graph, "candidates", ["--filter", "orphan"]))
    assert orphans["status"] == "ok"
    assert any(c["entity_id"] == "smoke-orphan" for c in orphans["candidates"])
    assert all(c["entity_id"] != "smoke-assigned" for c in orphans["candidates"])

    promotable = asyncio.run(_graph_read(seeded_graph, "candidates", ["--filter", "promotable"]))
    assert any(c["entity_id"] == "smoke-assigned" for c in promotable["candidates"])

    bad = asyncio.run(_graph_read(seeded_graph, "candidates", ["--filter", "bogus"]))
    assert bad["status"] == "error"


def test_etymology_returns_anchors_for_the_coordinate_and_honest_empty_otherwise(seeded_graph):
    cluster = asyncio.run(_graph_read(seeded_graph, "etymology", ["M2-1"]))
    assert cluster["status"] == "ok"
    assert any(a["entity_id"] == "smoke-assigned" for a in cluster["cluster"]["anchors"])

    empty = asyncio.run(_graph_read(seeded_graph, "etymology", ["M9-9-9"]))
    assert empty["status"] == "ok"
    assert empty["count"] == 0
    assert empty["cluster"] == {"anchors": [], "resonant": []}


def test_evidence_trace_splits_the_source_chain_and_reports_missing_honestly(seeded_graph):
    trace = asyncio.run(_graph_read(seeded_graph, "evidence-trace", ["smoke-orphan"]))
    assert trace["status"] == "ok"
    assert trace["found"] is True
    assert trace["anchors"] == ["chunk-a", "chunk-b"]

    missing = asyncio.run(_graph_read(seeded_graph, "evidence-trace", ["nope-no-such-id"]))
    assert missing["found"] is False
    assert missing["anchors"] == []


def test_resolve_consolidates_by_coordinate_and_by_vector_id(seeded_graph):
    by_coord = asyncio.run(_graph_read(seeded_graph, "resolve", ["M2-1"]))
    assert by_coord["status"] == "ok"
    assert by_coord["found"] is True
    entity = next(e for e in by_coord["entities"] if e["entity_id"] == "smoke-assigned")
    assert entity["coordinate"] == "M2-1"
    assert entity["anchors"] == ["chunk-c"]

    by_id = asyncio.run(_graph_read(seeded_graph, "resolve", ["smoke-orphan"]))
    assert by_id["found"] is True
    assert by_id["entities"][0]["anchors"] == ["chunk-a", "chunk-b"]

    missing = asyncio.run(_graph_read(seeded_graph, "resolve", ["no-such-ref"]))
    assert missing["found"] is False


def test_episode_search_reads_graphiti_space_without_writing_it(seeded_graph):
    res = asyncio.run(
        _graph_read(seeded_graph, "episode-search", ["zx-improbable-smoke-needle-2026"])
    )
    assert res["status"] == "ok"
    assert res["count"] == 0
    assert res["episodes"] == []


def test_notebook_coordinate_stamp_and_list_notebooks_filter(smoke_config):
    created = _notebook(smoke_config, ["create", "alpha", "--coordinate", "M2-1"])
    assert created["notebook"]["coordinate"] == "M2-1"
    _notebook(smoke_config, ["create", "beta"])

    everything = _list_notebooks(smoke_config, None)
    assert everything["count"] == 2

    filtered = _list_notebooks(smoke_config, "M2-1")
    assert filtered["count"] == 1
    assert filtered["notebooks"][0]["name"] == "alpha"


def test_query_with_layers_refuses_unknown_layers_before_rag_init(capsys, smoke_config, monkeypatch):
    monkeypatch.setenv("EPI_GNOSTIC_WORKSPACE", TEST_WS)
    asyncio.run(_run(["query-with-layers", "what is M2-1?", "--layers", "local,bogus"]))
    out = json.loads(capsys.readouterr().out.strip())
    assert out["status"] == "error"
    assert "bogus" in out["message"]

    asyncio.run(_run(["query-with-layers", "--layers", "local"]))
    out = json.loads(capsys.readouterr().out.strip())
    assert out["status"] == "error"
    assert "question" in out["message"]
