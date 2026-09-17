import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from epi_gnostic.graphiti_service import (
    AletheiaEntificationService,
    ExtractedEntity,
    ExtractedRelationship,
    InMemoryGraphitiStore,
    SophiaExtraction,
    ingest_transcript,
    query_graphiti,
    sophia,
)


def _jsonl(messages):
    return "\n".join(json.dumps(message) for message in messages)


def test_sophia_extracts_non_empty_entities_from_20_message_transcript():
    transcript = _jsonl(
        [
            {
                "role": "user" if index % 2 == 0 else "assistant",
                "timestamp": f"2026-06-19T12:{index:02d}:00Z",
                "content": (
                    "Sophia should extract Graphiti entities, Aletheia relationships, "
                    "and Epi-Logos event anchors for the harness-neutral transcript."
                ),
            }
            for index in range(20)
        ]
    )

    extraction = sophia.extract_entities(transcript)

    names = {entity.name for entity in extraction.entities}
    assert {"Sophia", "Graphiti", "Aletheia", "Epi-Logos"} <= names
    assert extraction.relationships
    assert extraction.event_anchors


@pytest.mark.asyncio
async def test_aletheia_entification_deduplicates_entities_and_preserves_provenance():
    graph = InMemoryGraphitiStore()
    extraction = SophiaExtraction(
        entities=[
            ExtractedEntity(
                name="Graphiti",
                type="System",
                description="Episodic graph",
                provenance_handles=["transcript://claude/session-1#L1"],
            ),
            ExtractedEntity(
                name="graphiti",
                type="System",
                description="Duplicate casing",
                aliases=["Graphiti"],
                provenance_handles=["transcript://claude/session-1#L2"],
            ),
            ExtractedEntity(
                name="Aletheia",
                type="Agent",
                description="Entification service",
                provenance_handles=["transcript://claude/session-1#L3"],
            ),
        ],
        relationships=[
            ExtractedRelationship(
                source="Aletheia",
                target="Graphiti",
                predicate="COMMITS_TO",
                description="Aletheia commits deduplicated entities to Graphiti.",
            )
        ],
        event_anchors=[],
        summary="Aletheia deduplicates Graphiti before commit.",
    )
    episode = graph.prepare_episode(
        session_id="session-1",
        harness="claude",
        transcript_ref="transcript://claude/session-1",
        summary=extraction.summary,
    )

    receipt = await AletheiaEntificationService(graph).entify(extraction, episode)

    graphiti_nodes = [
        node for node in graph.entities.values() if node.name.lower() == "graphiti"
    ]
    assert len(graphiti_nodes) == 1
    assert set(graphiti_nodes[0].provenance_handles) == {
        "transcript://claude/session-1#L1",
        "transcript://claude/session-1#L2",
    }
    assert receipt.entities_extracted == 2
    assert receipt.episodic_edges_created == 1


@pytest.mark.asyncio
async def test_ingest_transcript_returns_receipt_and_query_recalls_entities():
    graph = InMemoryGraphitiStore()
    claude_native_jsonl = _jsonl(
        [
            {
                "message": {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Please wire Sophia extraction to Graphiti memory.",
                        }
                    ],
                }
            },
            {
                "message": {
                    "role": "assistant",
                    "content": "Aletheia will entify Sophia output into Graphiti.",
                }
            },
        ]
    )

    receipt = await ingest_transcript(
        claude_native_jsonl,
        session_id="claude-session-42",
        harness="claude-code",
        transcript_ref="transcript://claude/claude-session-42.jsonl",
        graph=graph,
    )
    results = await query_graphiti("Graphiti", graph=graph)

    assert receipt.session_id == "claude-session-42"
    assert receipt.entities_extracted >= 3
    assert receipt.episodic_edges_created >= 1
    assert receipt.graphiti_episode_uuid in graph.episodes
    assert any(result["name"] == "Graphiti" for result in results["entities"])
    episode = graph.episodes[receipt.graphiti_episode_uuid]
    assert episode.transcript_ref == "transcript://claude/claude-session-42.jsonl"
    assert episode.provenance_handles == [
        "transcript://claude/claude-session-42.jsonl"
    ]
