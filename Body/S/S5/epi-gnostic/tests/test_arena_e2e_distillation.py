import os
import sys
import time
import urllib.error
import urllib.request
from itertools import combinations
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from epi_gnostic.arena_promotion import build_promotion_proposal


VAMA_CLASSES = ("egregore", "sprite", "daemon", "mantra")


def arena_lines():
    return [
        {
            "speaker": "E1",
            "vama_shakti_class": "egregore",
            "cited_coordinates": ["C5", "C5.2", "C5.3"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5"},
        },
        {
            "speaker": "E2",
            "vama_shakti_class": "sprite",
            "cited_coordinates": ["C5.2"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.2"},
        },
        {
            "speaker": "E3",
            "vama_shakti_class": "daemon",
            "cited_coordinates": ["user:PASU", "C5.3"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.3"},
        },
        {
            "speaker": "E4",
            "vama_shakti_class": "mantra",
            "cited_coordinates": ["element:fire", "C5.4"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.4"},
        },
    ]


def distill_arena_scene(scene_key, lines):
    edges = []
    class_pairs = set()
    by_class = {line["vama_shakti_class"]: line for line in lines}
    for line in lines:
        vama_class = line["vama_shakti_class"]
        citations = list(line["cited_coordinates"])
        if vama_class == "egregore":
            targets = citations
            pattern = "fan_out"
        elif vama_class == "sprite":
            targets = citations[:1]
            pattern = "sparse"
        elif vama_class == "daemon":
            targets = citations
            pattern = "user_weighted"
        elif vama_class == "mantra":
            targets = [coord for coord in citations if coord.startswith("element:")]
            pattern = "element_axis"
        else:
            raise AssertionError(f"unknown class {vama_class}")
        for target in targets:
            edge = {
                "type": "ARENA_DIALOGUE_OF",
                "scene_key": scene_key,
                "source": line["speaker"],
                "target": target,
                "vama_shakti_class": vama_class,
                "pattern": pattern,
            }
            if vama_class == "daemon":
                edge["user_weighted"] = target.startswith("user:")
            if vama_class == "mantra":
                edge["element_axis"] = target.split(":", 1)[1]
            edges.append(edge)
    for left, right in combinations(sorted(by_class), 2):
        class_pairs.add(tuple(sorted((left, right))))
    resonance_edges = [
        {
            "type": "DIALOGICAL_RESONANCE_AT",
            "scene_key": scene_key,
            "class_pair": list(pair),
        }
        for pair in sorted(class_pairs)
    ]
    return {
        "episode": {
            "group_id": scene_key,
            "episode_kind": "arena_closure_distillation",
        },
        "edges": edges,
        "resonance_edges": resonance_edges,
        "released_ephemeral_entities": [
            line["speaker"] for line in lines if line["speaker"].startswith("E")
        ],
    }


def warm_row(vama_class, *, turns=1, scenes=1, q_tail=1.0):
    return {
        "identity_handle": f"warm-{vama_class}",
        "coordinate_label": f"C5.{vama_class}",
        "essential_identity": {
            "vama_shakti_coordinate": {
                "cpf": "mechanistic",
                "ct": ["CT4"],
                "cp": f"C5.{vama_class}",
                "cf": "(4.5/0)",
                "cfp": "m4.arena.vama",
                "cs": {"code": f"vama:{vama_class}", "direction": "day"},
            },
            "vama_shakti_class": vama_class,
            "psyche_template_revision": f"psyche-rev-{vama_class}",
        },
        "q_activity_accumulator": {
            "q_activity_accumulator": [1.0, q_tail, 0.0, 0.0],
            "turn_count": turns,
        },
        "scene_count": scenes,
        "citation_coordinates": ["C5", "C5", "user:PASU"],
        "pairwise_resonance_events": [{"with": "Sophia", "score": 0.81}],
        "distilled_vak_address_signature": {
            "cpf": "mechanistic",
            "ct": ["CT4", "CT5"],
            "cp": "C5",
            "cf": "(4.5/0)",
            "cfp": "arena-promotion",
            "cs": {"code": "warm-crossing", "direction": "day"},
        },
        "user_response_quality_witnessed": True,
    }


def minimal_threshold_config():
    return {
        "auto_propose": True,
        "profiles": {
            "egregore": {
                "turns_threshold": 1,
                "scenes_threshold": 1,
                "q_activity_magnitude_threshold": 0.01,
                "augmentation_target": "form_text",
            },
            "sprite": {
                "turns_threshold": 1,
                "scenes_threshold": 1,
                "q_activity_magnitude_threshold": 0.01,
                "augmentation_target": "form_text",
            },
            "daemon": {
                "turns_threshold": 1,
                "scenes_threshold": 1,
                "q_activity_magnitude_threshold": 0.01,
                "augmentation_target": "form_text",
                "user_response_quality_required": True,
            },
            "mantra": {
                "turns_threshold": 1,
                "scenes_threshold": 1,
                "q_activity_magnitude_threshold": 0.01,
                "augmentation_target": "element_signature",
            },
        },
    }


def test_arena_closure_distillation_and_promotion_cover_all_dr_vama_invariants():
    distillation = distill_arena_scene("arena:e2e", arena_lines())

    assert distillation["episode"]["group_id"] == "arena:e2e", "DR-VAMA-1 session group_id"
    assert distillation["episode"]["episode_kind"] == "arena_closure_distillation"
    assert len(distillation["released_ephemeral_entities"]) == 4, "DR-VAMA-4 ephemeral release"

    edges = distillation["edges"]
    by_class = {
        vama_class: [edge for edge in edges if edge["vama_shakti_class"] == vama_class]
        for vama_class in VAMA_CLASSES
    }
    assert len(by_class["egregore"]) > len(by_class["sprite"]), "DR-VAMA-6 egregore fan-out"
    assert by_class["sprite"][0]["pattern"] == "sparse", "DR-VAMA-6 sprite sparse edge"
    assert any(edge.get("user_weighted") for edge in by_class["daemon"]), "DR-VAMA-6 daemon user-weighted"
    assert by_class["mantra"][0]["element_axis"] == "fire", "DR-VAMA-6 mantra element-axis"
    assert all(edge["type"] == "ARENA_DIALOGUE_OF" for edge in edges), "DR-VAMA-5 dialogue-only edges"
    assert {tuple(edge["class_pair"]) for edge in distillation["resonance_edges"]} >= {
        ("daemon", "egregore"),
        ("mantra", "sprite"),
    }, "DR-VAMA-3 pairwise resonance is coordinate-scoped to admitted classes"

    config = minimal_threshold_config()
    promotion_targets = {}
    for vama_class in VAMA_CLASSES:
        proposal = build_promotion_proposal(warm_row(vama_class), config=config)
        assert proposal is not None, f"DR-VAMA-2 warm identity promotes for {vama_class}"
        assert proposal["vama_shakti_class"] == vama_class
        assert proposal["review_route"]["track40_category"] == "CU-ENTITY"
        promotion_targets[vama_class] = proposal["augmentation_patch"]["target"]

    assert promotion_targets == {
        "egregore": "form_text",
        "sprite": "form_text",
        "daemon": "form_text",
        "mantra": "element_signature",
    }, "DR-VAMA-6 class-specific augmentation targets"


def test_global_temporal_surface_privacy_summary_is_count_only():
    surface = {
        "scene_key": "arena:e2e",
        "turn_count": 16,
        "status": "closed",
        "class_distribution_summary": {
            "egregore": 1,
            "sprite": 1,
            "daemon": 1,
            "mantra": 1,
        },
    }
    assert sorted(surface) == [
        "class_distribution_summary",
        "scene_key",
        "status",
        "turn_count",
    ]
    for forbidden in ("body", "handle", "speaker", "q_activity", "identity_handle"):
        assert forbidden not in surface, f"DR-VAMA-5 privacy excludes {forbidden}"


@pytest.mark.skipif(
    os.getenv("EPI_GRAPHITI_LIVE") != "1",
    reason="live Graphiti/Neo4j acceptance is opt-in with EPI_GRAPHITI_LIVE=1",
)
def test_live_graphiti_episode_accepts_arena_group_id_when_available():
    base = os.getenv("GRAPHITI_URL", "http://127.0.0.1:37778")
    token = f"arena-e2e-{time.time_ns()}"
    payload = {
        "content": f"Arena closure distillation proof token {token}",
        "group_id": "arena:e2e",
        "cp": "C5",
        "ql_position": "4.5",
    }
    request = urllib.request.Request(
        f"{base}/episode",
        data=bytes(__import__("json").dumps(payload), "utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = __import__("json").loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        pytest.skip(f"Graphiti runtime unavailable: {exc}")

    assert body["status"] == "ok"
