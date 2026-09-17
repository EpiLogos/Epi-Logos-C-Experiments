"""Arena-promotion proposal generation for warm Vama Shakti rows."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from collections import Counter
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

try:  # Python 3.11+
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - exercised only on Python 3.10
    tomllib = None


VAMA_CLASSES = ("egregore", "sprite", "daemon", "mantra")
FORM_TEXT_TARGET = "form_text"
ELEMENT_SIGNATURE_TARGET = "element_signature"


@dataclass(frozen=True)
class PromotionProfile:
    turns_threshold: int
    scenes_threshold: int
    q_activity_magnitude_threshold: float
    augmentation_target: str
    user_response_quality_required: bool = False

    def to_json(self) -> dict[str, Any]:
        return {
            "turns_threshold": self.turns_threshold,
            "scenes_threshold": self.scenes_threshold,
            "q_activity_magnitude_threshold": self.q_activity_magnitude_threshold,
            "augmentation_target": self.augmentation_target,
            "user_response_quality_required": self.user_response_quality_required,
        }


DEFAULT_PROMOTION_PROFILES: dict[str, PromotionProfile] = {
    "egregore": PromotionProfile(60, 6, 0.40, FORM_TEXT_TARGET),
    "sprite": PromotionProfile(15, 2, 0.25, FORM_TEXT_TARGET),
    "daemon": PromotionProfile(30, 4, 0.40, FORM_TEXT_TARGET, True),
    "mantra": PromotionProfile(30, 8, 0.50, ELEMENT_SIGNATURE_TARGET),
}

DEFAULT_PROMOTION_CONFIG: dict[str, Any] = {
    "profiles": {
        key: profile.to_json() for key, profile in DEFAULT_PROMOTION_PROFILES.items()
    },
    "auto_propose": False,
}


def load_promotion_config(path: str | Path | None = None) -> dict[str, Any]:
    """Load ``[arena.promotion]`` TOML, falling back to tranche defaults."""

    if path is None:
        path = Path.home() / ".epi-logos" / "config.toml"
    path = Path(path)
    if not path.exists():
        return deepcopy(DEFAULT_PROMOTION_CONFIG)
    if tomllib is None:
        raise RuntimeError("TOML promotion config requires Python 3.11+ tomllib")
    with path.open("rb") as handle:
        raw = tomllib.load(handle)
    arena_promotion = raw.get("arena", {}).get("promotion", {})
    config = deepcopy(DEFAULT_PROMOTION_CONFIG)
    config["auto_propose"] = bool(arena_promotion.get("auto_propose", False))
    for vama_class in VAMA_CLASSES:
        class_config = arena_promotion.get(vama_class)
        if not isinstance(class_config, Mapping):
            continue
        merged = dict(config["profiles"][vama_class])
        for key in (
            "turns_threshold",
            "scenes_threshold",
            "q_activity_magnitude_threshold",
            "augmentation_target",
            "user_response_quality_required",
        ):
            if key in class_config:
                merged[key] = class_config[key]
        config["profiles"][vama_class] = merged
    return config


def build_promotion_proposal(
    warm_row: Mapping[str, Any],
    *,
    config: Mapping[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Return an arena-promotion proposal when the row crosses its class profile."""

    config = config or DEFAULT_PROMOTION_CONFIG
    vama_class = _vama_class(warm_row)
    profile = _profile_for(config, vama_class)
    turn_count = _turn_count(warm_row)
    scene_count = _scene_count(warm_row)
    q_values = _q_activity_values(warm_row)
    magnitude = q_activity_magnitude(q_values)

    if turn_count < profile.turns_threshold:
        return None
    if scene_count < profile.scenes_threshold:
        return None
    if magnitude + 1e-9 < profile.q_activity_magnitude_threshold:
        return None
    if profile.user_response_quality_required and not bool(
        _get(warm_row, "user_response_quality_witnessed", "userResponseQualityWitnessed")
    ):
        return None

    coordinate = _get_essential(warm_row, "vama_shakti_coordinate", "vamaShaktiCoordinate")
    coordinate_label = _get(warm_row, "coordinate_label", "coordinateLabel") or _coordinate_cp(
        coordinate
    )
    psyche_revision = _get_essential(
        warm_row, "psyche_template_revision", "psycheTemplateRevision"
    )
    citation_frequency = _citation_coordinate_frequency(warm_row)
    pairwise_summary = _pairwise_resonance_summary(warm_row)
    vak_signature = _distilled_vak_signature(warm_row, coordinate)
    patch = _augmentation_patch(
        target=profile.augmentation_target,
        vama_class=vama_class,
        coordinate_label=coordinate_label,
        q_values=q_values,
        magnitude=magnitude,
        turn_count=turn_count,
        scene_count=scene_count,
        citation_frequency=citation_frequency,
        pairwise_summary=pairwise_summary,
        vak_signature=vak_signature,
    )

    proposal_hash = _proposal_hash(coordinate_label, vama_class, turn_count, scene_count, patch)
    return {
        "event": "promotion_proposal_emitted",
        "proposal_id": f"arena-promotion-{proposal_hash[:16]}",
        "intake_kind": "arena-promotion",
        "auto_propose": bool(config.get("auto_propose", False)),
        "vama_shakti_coordinate": coordinate,
        "vama_shakti_coordinate_label": coordinate_label,
        "vama_shakti_class": vama_class,
        "psyche_template_revision": psyche_revision,
        "Q_activity_accumulator": {
            "values": q_values,
            "magnitude": round(magnitude, 6),
            "turns": turn_count,
            "scenes": scene_count,
        },
        "distilled_vak_address_signature": vak_signature,
        "citation_coordinate_frequency": citation_frequency,
        "pairwise_resonance_summary": pairwise_summary,
        "threshold_profile": profile.to_json(),
        "augmentation_patch": patch,
        "review_route": {
            "surface": "M4-5' Review/Promotion",
            "co_governed_by": ["Sophia", "Psyche"],
            "hen_intake": "arena-promotion",
            "track40_category": "CU-ENTITY",
        },
        "warm_update": {"promotion_status": "proposed"},
    }


def q_activity_magnitude(values: list[float]) -> float:
    if len(values) <= 1:
        return abs(values[0]) if values else 0.0
    return math.sqrt(sum(float(value) ** 2 for value in values[1:]))


def apply_augmentation_patch(existing_markdown: str, patch: Mapping[str, Any]) -> str:
    """Apply append-only arena augmentation without overwriting prior content."""

    body = existing_markdown.rstrip()
    comment = str(patch["provenance_comment"])
    if patch["target"] == FORM_TEXT_TARGET:
        addition = f"{comment}\n\n## Arena Promotion Augmentation\n\n{patch['form_text']}"
    elif patch["target"] == ELEMENT_SIGNATURE_TARGET:
        element_delta = json.dumps(
            patch["element_axis_delta"], ensure_ascii=False, sort_keys=True
        )
        addition = (
            f"{comment}\n\n## Arena Promotion Element Signature\n\n"
            f"```json\n{element_delta}\n```"
        )
    else:
        raise ValueError(f"unsupported augmentation target {patch['target']!r}")
    return f"{body}\n\n{addition}\n"


def _profile_for(config: Mapping[str, Any], vama_class: str) -> PromotionProfile:
    raw_profile = config.get("profiles", {}).get(vama_class)
    if raw_profile is None:
        raw_profile = DEFAULT_PROMOTION_CONFIG["profiles"][vama_class]
    target = str(raw_profile["augmentation_target"])
    if target not in {FORM_TEXT_TARGET, ELEMENT_SIGNATURE_TARGET}:
        raise ValueError(f"unsupported augmentation_target {target!r}")
    return PromotionProfile(
        turns_threshold=int(raw_profile["turns_threshold"]),
        scenes_threshold=int(raw_profile["scenes_threshold"]),
        q_activity_magnitude_threshold=float(
            raw_profile["q_activity_magnitude_threshold"]
        ),
        augmentation_target=target,
        user_response_quality_required=bool(
            raw_profile.get("user_response_quality_required", False)
        ),
    )


def _augmentation_patch(
    *,
    target: str,
    vama_class: str,
    coordinate_label: str,
    q_values: list[float],
    magnitude: float,
    turn_count: int,
    scene_count: int,
    citation_frequency: dict[str, int],
    pairwise_summary: dict[str, Any],
    vak_signature: Any,
) -> dict[str, Any]:
    comment = _provenance_comment(turn_count, scene_count, magnitude, vama_class)
    common = {
        "target": target,
        "provenance_comment": comment,
        "preserve_prior_content": True,
        "strategy": "append_only",
        "vama_shakti_class": vama_class,
    }
    if target == ELEMENT_SIGNATURE_TARGET:
        axes = ["fire", "water", "air"]
        tail = q_values[1:4] + [0.0, 0.0, 0.0]
        dominant_index = max(range(3), key=lambda idx: abs(float(tail[idx])))
        return {
            **common,
            "operation": "merge_element_signature",
            "element_axis_delta": {
                "axis": axes[dominant_index],
                "magnitude": round(float(tail[dominant_index]), 6),
                "q_activity_magnitude": round(magnitude, 6),
                "source_coordinate": coordinate_label,
            },
        }
    return {
        **common,
        "operation": "append_section",
        "form_text": _form_text_augmentation(
            coordinate_label=coordinate_label,
            vama_class=vama_class,
            magnitude=magnitude,
            citation_frequency=citation_frequency,
            pairwise_summary=pairwise_summary,
            vak_signature=vak_signature,
        ),
    }


def _form_text_augmentation(
    *,
    coordinate_label: str,
    vama_class: str,
    magnitude: float,
    citation_frequency: dict[str, int],
    pairwise_summary: dict[str, Any],
    vak_signature: Any,
) -> str:
    citations = ", ".join(
        f"{coord} x{count}" for coord, count in citation_frequency.items()
    )
    if not citations:
        citations = "no repeated citations"
    return (
        f"Warm {vama_class} activity around {coordinate_label} crossed the arena "
        f"promotion threshold at Q-activity magnitude {magnitude:.2f}. "
        f"Citation frequency: {citations}. Pairwise resonance: "
        f"{pairwise_summary.get('summary', 'not recorded')}. VAK signature: "
        f"{json.dumps(vak_signature, sort_keys=True)}."
    )


def _provenance_comment(
    turn_count: int, scene_count: int, magnitude: float, vama_class: str
) -> str:
    return (
        "<!-- augmented from arena lifecycle "
        f"T{turn_count}_S{scene_count}_M{magnitude:.2f}_class{vama_class} -->"
    )


def _citation_coordinate_frequency(warm_row: Mapping[str, Any]) -> dict[str, int]:
    existing = _get(
        warm_row, "citation_coordinate_frequency", "citationCoordinateFrequency"
    )
    if isinstance(existing, Mapping):
        return {str(key): int(value) for key, value in existing.items()}
    citations = _get(warm_row, "citation_coordinates", "citationCoordinates") or []
    return dict(Counter(str(item) for item in citations))


def _pairwise_resonance_summary(warm_row: Mapping[str, Any]) -> dict[str, Any]:
    existing = _get(warm_row, "pairwise_resonance_summary", "pairwiseResonanceSummary")
    if isinstance(existing, Mapping):
        return dict(existing)
    events = _get(warm_row, "pairwise_resonance_events", "pairwiseResonanceEvents") or []
    if not events:
        return {"summary": "no pairwise resonance events recorded", "count": 0}
    scores = [float(event.get("score", 0.0)) for event in events if isinstance(event, Mapping)]
    partners = [
        str(event.get("with"))
        for event in events
        if isinstance(event, Mapping) and event.get("with")
    ]
    return {
        "summary": f"{len(events)} events; partners={', '.join(partners)}",
        "count": len(events),
        "average_score": round(sum(scores) / len(scores), 6) if scores else 0.0,
        "max_score": round(max(scores), 6) if scores else 0.0,
    }


def _distilled_vak_signature(warm_row: Mapping[str, Any], coordinate: Any) -> Any:
    existing = _get(
        warm_row, "distilled_vak_address_signature", "distilledVakAddressSignature"
    )
    if existing is not None:
        return existing
    return {
        "cpf": "mechanistic",
        "ct": ["CT4", "CT5"],
        "cp": _coordinate_cp(coordinate),
        "cf": "(4.5/0)",
        "cfp": "arena-promotion",
        "cs": {"code": "warm-threshold-crossing", "direction": "day"},
    }


def _vama_class(warm_row: Mapping[str, Any]) -> str:
    vama_class = _get_essential(warm_row, "vama_shakti_class", "vamaShaktiClass")
    if not vama_class:
        vama_class = _get(warm_row, "vama_shakti_class", "vamaShaktiClass")
    vama_class = str(vama_class).strip().lower()
    if vama_class not in VAMA_CLASSES:
        raise ValueError(f"unknown vama_shakti_class {vama_class!r}")
    return vama_class


def _turn_count(warm_row: Mapping[str, Any]) -> int:
    accumulator = _get(warm_row, "q_activity_accumulator", "qActivityAccumulator") or {}
    return int(_get(accumulator, "turn_count", "turnCount") or 0)


def _scene_count(warm_row: Mapping[str, Any]) -> int:
    return int(_get(warm_row, "scene_count", "sceneCount", "scenes") or 0)


def _q_activity_values(warm_row: Mapping[str, Any]) -> list[float]:
    accumulator = _get(warm_row, "q_activity_accumulator", "qActivityAccumulator") or {}
    values = _get(accumulator, "q_activity_accumulator", "qActivityAccumulator")
    if values is None:
        values = _get(warm_row, "Q_activity_accumulator", "qActivity")
    if not isinstance(values, list) or len(values) != 4:
        raise ValueError("Q_activity_accumulator must contain four numeric values")
    return [float(value) for value in values]


def _get_essential(row: Mapping[str, Any], *names: str) -> Any:
    essential = _get(row, "essential_identity", "essentialIdentity") or {}
    return _get(essential, *names)


def _get(mapping: Any, *names: str) -> Any:
    if not isinstance(mapping, Mapping):
        return None
    for name in names:
        if name in mapping:
            return mapping[name]
    return None


def _coordinate_cp(coordinate: Any) -> str:
    if isinstance(coordinate, Mapping):
        value = _get(coordinate, "cp", "coordinate")
        if value:
            return str(value)
    return str(coordinate or "unknown-coordinate")


def _proposal_hash(*parts: Any) -> str:
    digest = hashlib.blake2s(digest_size=16)
    for part in parts:
        digest.update(json.dumps(part, sort_keys=True, default=str).encode("utf-8"))
    return digest.hexdigest()


def _read_json(path: str) -> Any:
    if path == "-":
        return json.load(sys.stdin)
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "warm_row",
        help="WarmVamaShakti JSON path, or '-' for stdin",
    )
    parser.add_argument(
        "--config",
        help="Path to ~/.epi-logos/config.toml override",
    )
    args = parser.parse_args(argv)

    warm_row = _read_json(args.warm_row)
    proposal = build_promotion_proposal(
        warm_row, config=load_promotion_config(args.config)
    )
    if proposal is None:
        output = {"event": "promotion_not_ready", "proposal": None}
    else:
        output = proposal
    json.dump(output, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
