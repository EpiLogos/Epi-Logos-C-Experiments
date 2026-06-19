"""Moirai arena closure distillation for Graphiti and typed graph edges."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Protocol


ARENA_DIALOGUE_OF = "ARENA_DIALOGUE_OF"
DIALOGICAL_RESONANCE_AT = "DIALOGICAL_RESONANCE_AT"
VAMA_CLASSES = ("egregore", "sprite", "daemon", "mantra")
MANTRA_AXIS_PREFIXES = ("element:", "chakra:", "decan:", "M2'")


class ArenaDistillationError(ValueError):
    """Raised when an arena closure payload cannot be distilled."""


class GraphitiEpisodeService(Protocol):
    def add_episode(
        self,
        *,
        name: str,
        episode_body: str,
        source_description: str,
        group_id: str,
        reference_time: str | int | float | None,
    ) -> str | Mapping[str, Any]:
        ...


class ArenaEdgeWriter(Protocol):
    def write_edges(self, edges: Iterable[Mapping[str, Any]]) -> int:
        ...


@dataclass(frozen=True)
class DistillationReceipt:
    scene_key: str
    episode_id: str
    graphiti_group_id: str
    edge_count: int
    edge_count_by_class: dict[str, int]
    resonance_edge_count: int
    compressed_vak_hash: str

    def to_json(self) -> dict[str, Any]:
        return {
            "scene_key": self.scene_key,
            "episode_id": self.episode_id,
            "graphiti_group_id": self.graphiti_group_id,
            "edge_count": self.edge_count,
            "edge_count_by_class": self.edge_count_by_class,
            "resonance_edge_count": self.resonance_edge_count,
            "compressed_vak_hash": self.compressed_vak_hash,
        }


def moirai_arena_distill(
    scene_key: str,
    *,
    payload: Mapping[str, Any] | None = None,
    graphiti_service: GraphitiEpisodeService | None = None,
    edge_writer: ArenaEdgeWriter | None = None,
    compressor: Callable[[Mapping[str, Any], list[Mapping[str, Any]], list[Mapping[str, Any]]], str]
    | None = None,
    body_resolver: Callable[[str], str] | None = None,
    min_exchange_turns: int = 1,
) -> DistillationReceipt:
    """Closure-distill one arena scene into an episode and typed edges."""

    payload = payload or load_scene_payload(scene_key)
    scene = _scene_from_payload(scene_key, payload)
    lines = _lines_from_payload(scene_key, payload)
    turns = _turns_from_payload(scene_key, payload, lines)
    resolved_lines = [
        _line_with_resolved_body(line, payload=payload, body_resolver=body_resolver)
        for line in lines
    ]
    graphiti_service = graphiti_service or HttpGraphitiEpisodeService()
    edge_writer = edge_writer or Neo4jArenaEdgeWriter.from_env()
    compressor = compressor or compress_through_VAK

    compressed = compressor(scene, resolved_lines, turns)
    class_distribution = _class_distribution(resolved_lines)
    arc_id = str(scene.get("arc_id") or scene.get("arcId") or scene_key.split(":", 1)[-1])
    group_id = f"arena:{arc_id}"

    episode_id_raw = graphiti_service.add_episode(
        name=f"arena:close:{scene_key}",
        episode_body=compressed,
        source_description=(
            "agent:moirai:arena_distill:"
            f"cpf={scene.get('pinned_coordinate') or scene.get('pinnedCoordinate')}:"
            f"classifiers={_class_distribution_label(class_distribution)}"
        ),
        group_id=group_id,
        reference_time=scene.get("closed_at_ms") or scene.get("closedAtMs"),
    )
    episode_id = _episode_id(episode_id_raw)

    dialogue_edges = build_arena_dialogue_edges(scene, resolved_lines)
    resonance_edges = build_dialogical_resonance_edges(
        scene, turns, min_exchange_turns=min_exchange_turns
    )
    edge_count = edge_writer.write_edges([*dialogue_edges, *resonance_edges])
    by_class = Counter(
        edge["properties"]["vama_shakti_class"]
        for edge in dialogue_edges
        if "vama_shakti_class" in edge["properties"]
    )

    return DistillationReceipt(
        scene_key=scene_key,
        episode_id=episode_id,
        graphiti_group_id=group_id,
        edge_count=edge_count,
        edge_count_by_class={key: by_class.get(key, 0) for key in VAMA_CLASSES},
        resonance_edge_count=len(resonance_edges),
        compressed_vak_hash=_stable_hash(compressed),
    )


def compress_through_VAK(
    scene: Mapping[str, Any],
    lines: list[Mapping[str, Any]],
    turns: list[Mapping[str, Any]],
) -> str:
    """Coordinate-tag the closure transcript per CCT-17/DR-COMP-1."""

    transcript = []
    for line in lines:
        transcript.append(
            {
                "speaker": _speaker(line),
                "vama_shakti_class": _vama_class(line),
                "vak_address": line.get("vak_address") or line.get("vakAddress") or {},
                "cited_coordinates": _citations(line),
                "body": line.get("dialogue_body") or line.get("dialogueBody") or "",
            }
        )
    packet = {
        "compression": "coordinate-tagging-is-compression",
        "cross_link": "CCT-17",
        "decision_rule": "DR-COMP-1",
        "scene_key": scene.get("scene_key") or scene.get("sceneKey"),
        "pinned_coordinate": scene.get("pinned_coordinate") or scene.get("pinnedCoordinate"),
        "kairos_anchor": scene.get("kairos_anchor") or scene.get("kairosAnchor"),
        "class_distribution": _class_distribution(lines),
        "turn_count": len(turns),
        "transcript": transcript,
    }
    return json.dumps(packet, ensure_ascii=False, sort_keys=True)


def build_arena_dialogue_edges(
    scene: Mapping[str, Any],
    lines: list[Mapping[str, Any]],
) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    user_citation_counts = _user_citation_counts(lines)
    for line in lines:
        speaker_class = _vama_class(line)
        if speaker_class is None:
            continue
        if speaker_class == "egregore":
            edges.extend(_egregore_edges(scene, line))
        elif speaker_class == "sprite":
            edges.extend(_sprite_edges(scene, line))
        elif speaker_class == "daemon":
            edges.extend(_daemon_edges(scene, line, user_citation_counts))
        elif speaker_class == "mantra":
            edges.extend(_mantra_edges(scene, line))
        else:
            raise ArenaDistillationError(f"unknown vama_shakti_class {speaker_class!r}")
    return edges


def build_dialogical_resonance_edges(
    scene: Mapping[str, Any],
    turns: list[Mapping[str, Any]],
    *,
    min_exchange_turns: int = 1,
) -> list[dict[str, Any]]:
    speakers = {
        _speaker(turn): _vama_class(turn)
        for turn in turns
        if _speaker(turn) and _vama_class(turn) in VAMA_CLASSES
    }
    pair_counts: Counter[tuple[str, str]] = Counter()
    previous: str | None = None
    for turn in turns:
        current = _speaker(turn)
        if current in speakers and previous in speakers and current != previous:
            pair_counts[tuple(sorted((previous, current)))] += 1
        if current in speakers:
            previous = current

    edges = []
    for (left, right), count in sorted(pair_counts.items()):
        if count < min_exchange_turns:
            continue
        left_class = speakers[left]
        right_class = speakers[right]
        edges.append(
            {
                "type": DIALOGICAL_RESONANCE_AT,
                "source": left,
                "target": right,
                "properties": {
                    "scene_key": _scene_key(scene),
                    "kairos_anchor": _kairos_anchor(scene),
                    "class_pair": _class_pair(left_class, right_class),
                    "exchange_turns": count,
                    "c_1_relation_family": "arena-dialogue",
                },
            }
        )
    return edges


def load_scene_payload(scene_key: str) -> Mapping[str, Any]:
    """Load closure payload from fixture path or local arena runtime JSON."""

    fixture_path = os.getenv("EPI_ARENA_DISTILL_FIXTURE_PATH")
    if fixture_path:
        return _payload_for_scene(scene_key, _read_json(Path(fixture_path)))

    runtime_path = os.getenv("EPI_NARA_ARENA_RUNTIME_PATH")
    if runtime_path:
        return _payload_for_scene(scene_key, _read_json(Path(runtime_path)))

    default_path = Path.home() / ".epi-logos" / "nara" / "arena-runtime.json"
    if default_path.exists():
        return _payload_for_scene(scene_key, _read_json(default_path))

    raise ArenaDistillationError(
        "no arena closure payload available; set EPI_ARENA_DISTILL_FIXTURE_PATH "
        "or EPI_NARA_ARENA_RUNTIME_PATH"
    )


class HttpGraphitiEpisodeService:
    def __init__(self, base_url: str | None = None, timeout: float = 15.0) -> None:
        self.base_url = (base_url or os.getenv("GRAPHITI_URL") or "http://127.0.0.1:37778").rstrip("/")
        self.timeout = timeout

    def add_episode(
        self,
        *,
        name: str,
        episode_body: str,
        source_description: str,
        group_id: str,
        reference_time: str | int | float | None,
    ) -> str | Mapping[str, Any]:
        payload = {
            "content": episode_body,
            "ql_position": "5",
            "cpf": "(0/1/2)",
            "cp": "4.5",
            "source": "moirai",
            "arc_id": name,
            "group_id": group_id,
            "reference_time": _reference_time_iso(reference_time),
            "source_description": source_description,
        }
        request = urllib.request.Request(
            f"{self.base_url}/episode",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError) as exc:
            raise ArenaDistillationError(f"Graphiti episode write failed: {exc}") from exc


class Neo4jArenaEdgeWriter:
    def __init__(self, driver: Any, database: str = "neo4j") -> None:
        self.driver = driver
        self.database = database

    @classmethod
    def from_env(cls) -> "Neo4jArenaEdgeWriter":
        try:
            from neo4j import GraphDatabase
        except ModuleNotFoundError as exc:  # pragma: no cover - dependency is declared
            raise ArenaDistillationError("neo4j package is required for arena edge writes") from exc
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER") or "neo4j"
        password = os.getenv("NEO4J_PASSWORD", "neo4j")
        database = os.getenv("NEO4J_DATABASE", "neo4j")
        return cls(GraphDatabase.driver(uri, auth=(user, password)), database=database)

    def write_edges(self, edges: Iterable[Mapping[str, Any]]) -> int:
        rows = list(edges)
        if not rows:
            return 0
        with self.driver.session(database=self.database) as session:
            session.execute_write(self._write_rows, rows)
        return len(rows)

    @staticmethod
    def _write_rows(tx: Any, rows: list[Mapping[str, Any]]) -> None:
        for row in rows:
            rel_type = str(row["type"])
            if rel_type not in {ARENA_DIALOGUE_OF, DIALOGICAL_RESONANCE_AT}:
                raise ArenaDistillationError(f"unsupported arena relationship {rel_type!r}")
            tx.run(
                f"""
                MERGE (src:ArenaClosureNode {{arena_key: $source}})
                MERGE (dst:ArenaClosureNode {{arena_key: $target}})
                MERGE (src)-[r:{rel_type}]->(dst)
                SET r += $properties
                """,
                source=str(row["source"]),
                target=str(row["target"]),
                properties=dict(row["properties"]),
            )


def _egregore_edges(scene: Mapping[str, Any], line: Mapping[str, Any]) -> list[dict[str, Any]]:
    targets = _constituent_coordinates(line) or _citations(line)
    return [
        _dialogue_edge(scene, line, target, pattern="egregore_fan_out", weight=0.72)
        for target in targets
    ]


def _sprite_edges(scene: Mapping[str, Any], line: Mapping[str, Any]) -> list[dict[str, Any]]:
    citations = _citations(line)
    if not citations:
        return []
    target = citations[0]
    return [_dialogue_edge(scene, line, target, pattern="sprite_sparse_high_resonance", weight=1.35)]


def _daemon_edges(
    scene: Mapping[str, Any],
    line: Mapping[str, Any],
    user_citation_counts: Counter[str],
) -> list[dict[str, Any]]:
    weighted_sources = list(user_citation_counts) or _citations(line)
    edges = []
    for source_coord in weighted_sources:
        weight = 1.0 + float(user_citation_counts.get(source_coord, 1)) * 0.25
        edges.append(
            _dialogue_edge(
                scene,
                line,
                _speaker(line),
                source=source_coord,
                pattern="daemon_user_citation_weighted",
                weight=weight,
                extra={"user_weighted": True},
            )
        )
    return edges


def _mantra_edges(scene: Mapping[str, Any], line: Mapping[str, Any]) -> list[dict[str, Any]]:
    axis_targets = [_mantra_axis_coordinate(coord) for coord in _citations(line)]
    axis_targets = [target for target in axis_targets if target]
    return [
        _dialogue_edge(scene, line, target, pattern="mantra_element_chakra_decan_axis", weight=0.88)
        for target in axis_targets
    ]


def _dialogue_edge(
    scene: Mapping[str, Any],
    line: Mapping[str, Any],
    target: str,
    *,
    pattern: str,
    weight: float,
    source: str | None = None,
    extra: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    properties = {
        "scene_key": _scene_key(scene),
        "kairos_anchor": _kairos_anchor(scene),
        "vama_shakti_class": _vama_class(line),
        "edge_pattern": pattern,
        "edge_weight": weight,
        "speaker_handle": _speaker(line),
        "c_1_relation_family": "arena-dialogue",
    }
    if extra:
        properties.update(extra)
    return {
        "type": ARENA_DIALOGUE_OF,
        "source": source or _speaker(line),
        "target": target,
        "properties": properties,
    }


def _payload_for_scene(scene_key: str, payload: Mapping[str, Any]) -> Mapping[str, Any]:
    if "scene" in payload or "dialogue_lines" in payload or "dialogueLines" in payload:
        return payload
    scenes = payload.get("scenes", {})
    if isinstance(scenes, Mapping) and scene_key in scenes:
        scene_runtime = scenes[scene_key]
        scene = scene_runtime.get("handle", scene_runtime)
        return {
            "scene": scene,
            "dialogue_lines": scene_runtime.get("dialogueLines", scene_runtime.get("dialogue_lines", [])),
            "turns": scene_runtime.get("turns", []),
            "bodies": payload.get("bodies", {}),
        }
    raise ArenaDistillationError(f"scene {scene_key!r} not found in arena payload")


def _scene_from_payload(scene_key: str, payload: Mapping[str, Any]) -> Mapping[str, Any]:
    scene = payload.get("scene") or payload.get("arena_scene") or payload.get("arenaScene")
    if scene is None:
        scene = {"scene_key": scene_key, "arc_id": scene_key.split(":", 1)[-1]}
    scene_key_in_payload = scene.get("scene_key") or scene.get("sceneKey") or scene_key
    if scene_key_in_payload != scene_key:
        raise ArenaDistillationError(
            f"payload scene_key {scene_key_in_payload!r} does not match {scene_key!r}"
        )
    return dict(scene)


def _lines_from_payload(scene_key: str, payload: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    lines = payload.get("dialogue_lines") or payload.get("dialogueLines") or []
    out = [dict(line) for line in lines if (line.get("scene_key") or line.get("sceneKey") or scene_key) == scene_key]
    if not out:
        raise ArenaDistillationError(f"scene {scene_key!r} has no ArenaDialogueLine rows")
    return out


def _turns_from_payload(
    scene_key: str,
    payload: Mapping[str, Any],
    lines: list[Mapping[str, Any]],
) -> list[Mapping[str, Any]]:
    turns = payload.get("turns") or payload.get("arena_turns") or payload.get("arenaTurns")
    if turns:
        return [dict(turn) for turn in turns if (turn.get("scene_key") or turn.get("sceneKey") or scene_key) == scene_key]
    return [
        {
            "scene_key": scene_key,
            "speaker": _speaker(line),
            "vama_shakti_class": _vama_class(line),
            "turn_index": index,
        }
        for index, line in enumerate(lines)
    ]


def _line_with_resolved_body(
    line: Mapping[str, Any],
    *,
    payload: Mapping[str, Any],
    body_resolver: Callable[[str], str] | None,
) -> Mapping[str, Any]:
    out = dict(line)
    if out.get("dialogue_body") or out.get("dialogueBody"):
        return out
    handle = out.get("dialogue_body_handle") or out.get("dialogueBodyHandle")
    if handle:
        bodies = payload.get("bodies") or payload.get("dialogue_bodies") or payload.get("dialogueBodies") or {}
        if handle in bodies:
            out["dialogue_body"] = bodies[handle]
        elif body_resolver is not None:
            out["dialogue_body"] = body_resolver(str(handle))
        else:
            raise ArenaDistillationError(f"unresolved dialogue_body_handle {handle!r}")
    return out


def _class_distribution(lines: Iterable[Mapping[str, Any]]) -> dict[str, int]:
    counter = Counter(_vama_class(line) for line in lines if _vama_class(line) in VAMA_CLASSES)
    return {key: counter.get(key, 0) for key in VAMA_CLASSES}


def _class_distribution_label(distribution: Mapping[str, int]) -> str:
    return ",".join(f"{key}:{distribution.get(key, 0)}" for key in VAMA_CLASSES)


def _user_citation_counts(lines: Iterable[Mapping[str, Any]]) -> Counter[str]:
    counts: Counter[str] = Counter()
    for line in lines:
        if _speaker(line).lower() in {"user", "human", "pasu"} or _vama_class(line) is None:
            counts.update(_citations(line))
    return counts


def _constituent_coordinates(line: Mapping[str, Any]) -> list[str]:
    for key in ("constituent_reference_coordinates", "constituentReferenceCoordinates", "reference_coordinates", "referenceCoordinates"):
        value = line.get(key)
        if value:
            return [str(item) for item in value]
    return []


def _citations(line: Mapping[str, Any]) -> list[str]:
    value = line.get("cited_coordinates") or line.get("citedCoordinates") or []
    normalized = []
    for item in value:
        if isinstance(item, Mapping):
            normalized.append(str(item.get("cp") or item.get("coordinate") or item))
        else:
            normalized.append(str(item))
    return normalized


def _speaker(row: Mapping[str, Any]) -> str:
    return str(row.get("speaker") or row.get("speaker_handle") or row.get("speakerHandle") or "")


def _vama_class(row: Mapping[str, Any]) -> str | None:
    value = row.get("vama_shakti_class") or row.get("vamaShaktiClass") or row.get("speaker_class") or row.get("speakerClass")
    if value is None:
        return None
    value = str(value)
    return value if value in VAMA_CLASSES else value


def _scene_key(scene: Mapping[str, Any]) -> str:
    return str(scene.get("scene_key") or scene.get("sceneKey") or "")


def _kairos_anchor(scene: Mapping[str, Any]) -> str:
    return str(scene.get("kairos_anchor") or scene.get("kairosAnchor") or "")


def _class_pair(left_class: str, right_class: str) -> str:
    return "<->".join(sorted((left_class, right_class)))


def _mantra_axis_coordinate(coord: str) -> str | None:
    if coord.startswith("M2'"):
        return coord
    if coord.startswith("element:"):
        return "M2'/planetary-tattva/element/" + coord.split(":", 1)[1]
    if coord.startswith("chakra:"):
        return "M2'/planetary-tattva/chakra/" + coord.split(":", 1)[1]
    if coord.startswith("decan:"):
        return "M2'/planetary-tattva/decan/" + coord.split(":", 1)[1]
    return None


def _episode_id(raw: str | Mapping[str, Any]) -> str:
    if isinstance(raw, str):
        return raw
    for key in ("episode_id", "episodeId", "uuid", "name"):
        value = raw.get(key)
        if value:
            return str(value)
    return json.dumps(raw, sort_keys=True)


def _reference_time_iso(value: str | int | float | None) -> str:
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value) / 1000.0, tz=timezone.utc).isoformat()
    return str(value)


def _stable_hash(value: str) -> str:
    import hashlib

    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _read_json(path: Path) -> Mapping[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Moirai arena closure distillation")
    parser.add_argument("scene_key", help="ArenaScene scene_key, or '-' for JSON stdin payload")
    parser.add_argument("--min-exchange-turns", type=int, default=1)
    args = parser.parse_args(argv)

    try:
        if args.scene_key == "-":
            payload = json.load(sys.stdin)
            scene_key = str(
                payload.get("scene_key")
                or payload.get("sceneKey")
                or payload.get("scene", {}).get("scene_key")
                or payload.get("scene", {}).get("sceneKey")
            )
            if not scene_key or scene_key == "None":
                raise ArenaDistillationError("stdin payload requires scene_key")
        else:
            scene_key = args.scene_key
            payload = None
        receipt = moirai_arena_distill(
            scene_key,
            payload=payload,
            min_exchange_turns=args.min_exchange_turns,
        )
    except Exception as exc:
        print(json.dumps({"status": "error", "error": str(exc)}), file=sys.stderr)
        return 1
    print(json.dumps({"status": "ok", **receipt.to_json()}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
