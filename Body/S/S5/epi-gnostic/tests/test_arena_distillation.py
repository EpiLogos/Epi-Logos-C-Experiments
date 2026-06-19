import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from epi_gnostic.arena_distillation import (
    ARENA_DIALOGUE_OF,
    DIALOGICAL_RESONANCE_AT,
    build_arena_dialogue_edges,
    moirai_arena_distill,
)


class RecordingGraphitiService:
    def __init__(self):
        self.episodes = []

    def add_episode(self, **episode):
        self.episodes.append(episode)
        return {"episode_id": "episode-41-9"}


class RecordingEdgeWriter:
    def __init__(self):
        self.edges = []

    def write_edges(self, edges):
        self.edges.extend(list(edges))
        return len(self.edges)


def fixture_payload():
    return {
        "scene": {
            "scene_key": "arena:scene-41-9",
            "arc_id": "arc-41-9",
            "pinned_coordinate": "C5",
            "kairos_anchor": "kairos:test",
            "closed_at_ms": 1_788_000_000_000,
        },
        "bodies": {
            "line-egregore": "Egregore amplifies C5 through its constituents.",
            "line-sprite": "Sprite flashes one high-resonance point.",
            "line-daemon": "Daemon reflects the user's cited wound.",
            "line-mantra": "Mantra lands on fire and heart axes.",
            "line-user": "User cites C5.user twice.",
        },
        "dialogue_lines": [
            {
                "scene_key": "arena:scene-41-9",
                "speaker": "vama:egregore",
                "vama_shakti_class": "egregore",
                "dialogue_body_handle": "line-egregore",
                "constituent_reference_coordinates": ["C5.1", "C5.2"],
                "cited_coordinates": ["C5"],
                "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5"},
            },
            {
                "scene_key": "arena:scene-41-9",
                "speaker": "vama:sprite",
                "vama_shakti_class": "sprite",
                "dialogue_body_handle": "line-sprite",
                "cited_coordinates": ["C5.9", "C5.10"],
                "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.9"},
            },
            {
                "scene_key": "arena:scene-41-9",
                "speaker": "user",
                "dialogue_body_handle": "line-user",
                "cited_coordinates": ["C5.user", "C5.user"],
                "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.user"},
            },
            {
                "scene_key": "arena:scene-41-9",
                "speaker": "vama:daemon",
                "vama_shakti_class": "daemon",
                "dialogue_body_handle": "line-daemon",
                "cited_coordinates": ["C5.daemon"],
                "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.daemon"},
            },
            {
                "scene_key": "arena:scene-41-9",
                "speaker": "vama:mantra",
                "vama_shakti_class": "mantra",
                "dialogue_body_handle": "line-mantra",
                "cited_coordinates": ["element:fire", "C5.semantic", "chakra:heart"],
                "vak_address": {"cfp": "m4.arena.dialogue", "cp": "M2'"},
            },
        ],
        "turns": [
            {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
            {"speaker": "vama:sprite", "vama_shakti_class": "sprite"},
            {"speaker": "vama:daemon", "vama_shakti_class": "daemon"},
            {"speaker": "vama:mantra", "vama_shakti_class": "mantra"},
            {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
            {"speaker": "vama:daemon", "vama_shakti_class": "daemon"},
            {"speaker": "vama:sprite", "vama_shakti_class": "sprite"},
            {"speaker": "vama:mantra", "vama_shakti_class": "mantra"},
            {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
        ],
    }


def test_moirai_arena_distill_writes_episode_and_classifier_modulated_edges():
    graphiti = RecordingGraphitiService()
    edge_writer = RecordingEdgeWriter()
    compressor_calls = []

    def compressor(scene, lines, turns):
        compressor_calls.append((scene, lines, turns))
        return "compressed-through-VAK:CCT-17"

    receipt = moirai_arena_distill(
        "arena:scene-41-9",
        payload=fixture_payload(),
        graphiti_service=graphiti,
        edge_writer=edge_writer,
        compressor=compressor,
    )

    assert len(compressor_calls) == 1
    assert graphiti.episodes[0]["name"] == "arena:close:arena:scene-41-9"
    assert graphiti.episodes[0]["episode_body"] == "compressed-through-VAK:CCT-17"
    assert graphiti.episodes[0]["group_id"] == "arena:arc-41-9"
    assert "classifiers=egregore:1,sprite:1,daemon:1,mantra:1" in graphiti.episodes[0]["source_description"]

    dialogue_edges = [edge for edge in edge_writer.edges if edge["type"] == ARENA_DIALOGUE_OF]
    resonance_edges = [edge for edge in edge_writer.edges if edge["type"] == DIALOGICAL_RESONANCE_AT]

    assert receipt.episode_id == "episode-41-9"
    assert receipt.graphiti_group_id == "arena:arc-41-9"
    assert receipt.edge_count_by_class == {
        "egregore": 2,
        "sprite": 1,
        "daemon": 1,
        "mantra": 2,
    }
    assert receipt.edge_count == len(edge_writer.edges)

    by_class = {}
    for edge in dialogue_edges:
        by_class.setdefault(edge["properties"]["vama_shakti_class"], []).append(edge)

    assert {edge["target"] for edge in by_class["egregore"]} == {"C5.1", "C5.2"}
    assert by_class["sprite"][0]["target"] == "C5.9"
    assert by_class["sprite"][0]["properties"]["edge_pattern"] == "sprite_sparse_high_resonance"
    assert by_class["sprite"][0]["properties"]["edge_weight"] > 1.0
    assert by_class["daemon"][0]["source"] == "C5.user"
    assert by_class["daemon"][0]["properties"]["user_weighted"] is True
    assert by_class["daemon"][0]["properties"]["edge_weight"] > 1.0
    assert {edge["target"] for edge in by_class["mantra"]} == {
        "M2'/planetary-tattva/element/fire",
        "M2'/planetary-tattva/chakra/heart",
    }

    class_pairs = {edge["properties"]["class_pair"] for edge in resonance_edges}
    assert class_pairs >= {
        "egregore<->sprite",
        "daemon<->sprite",
        "daemon<->mantra",
        "egregore<->mantra",
        "daemon<->egregore",
        "mantra<->sprite",
    }


def test_build_arena_dialogue_edges_rejects_unknown_classifier():
    payload = fixture_payload()
    scene = payload["scene"]
    bad_line = {
        "speaker": "vama:unknown",
        "vama_shakti_class": "trickster",
        "cited_coordinates": ["C5"],
    }

    try:
        build_arena_dialogue_edges(scene, [bad_line])
    except Exception as exc:
        assert "unknown vama_shakti_class" in str(exc)
    else:
        raise AssertionError("unknown class must be rejected")
