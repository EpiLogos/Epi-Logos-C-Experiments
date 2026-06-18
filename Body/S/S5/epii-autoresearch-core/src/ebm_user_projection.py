"""User-temporal projection utilities for the EBM compatibility channel.

The canonical user-context spec currently routes user-personal energy through
E_4 personal resonance. This module preserves the Track 12.21/33 second-channel
shape as an explicit projection surface: callers may pass learned weights beside
the EBM head, or use the deterministic structural projection for cold-start and
tests.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import math
from typing import Any, Iterable, Mapping, Sequence


DEFAULT_OUTPUT_DIM = 28
MIN_OUTPUT_DIM = 25
MAX_OUTPUT_DIM = 30
LENS_RESONANCE_DIM = 72


@dataclass(frozen=True)
class UserProjectionConfig:
    output_dim: int = DEFAULT_OUTPUT_DIM
    clamp: bool = True

    def validate(self) -> None:
        if not MIN_OUTPUT_DIM <= self.output_dim <= MAX_OUTPUT_DIM:
            raise ValueError("user temporal projection dim must be in 25..30")


@dataclass(frozen=True)
class ProjectionWeights:
    matrix: Sequence[Sequence[float]]
    bias: Sequence[float] | None = None

    def validate(self, input_dim: int, output_dim: int) -> None:
        if len(self.matrix) != output_dim:
            raise ValueError("projection matrix row count must match output_dim")
        for row in self.matrix:
            if len(row) != input_dim:
                raise ValueError("projection matrix column count must match input_dim")
        if self.bias is not None and len(self.bias) != output_dim:
            raise ValueError("projection bias length must match output_dim")


def project_user_context_frame(
    frame: Mapping[str, Any],
    config: UserProjectionConfig | None = None,
    weights: ProjectionWeights | None = None,
) -> list[float]:
    """Project a UserContextFrame into a 25-30 dimensional vector."""

    cfg = config or UserProjectionConfig()
    cfg.validate()
    base = _base_features(frame)
    base = _pad_or_trim(base, cfg.output_dim, _stable_bytes(frame))

    if weights is None:
        return [_clamp01(value) if cfg.clamp else float(value) for value in base]

    weights.validate(len(base), cfg.output_dim)
    projected: list[float] = []
    for row_index, row in enumerate(weights.matrix):
        bias = 0.0 if weights.bias is None else float(weights.bias[row_index])
        value = sum(float(weight) * base[col] for col, weight in enumerate(row)) + bias
        projected.append(math.tanh(value))
    return projected


def build_position_5_prime_input(
    lens_resonance_72: Sequence[float],
    frame: Mapping[str, Any],
    config: UserProjectionConfig | None = None,
    weights: ProjectionWeights | None = None,
) -> dict[str, list[float] | str]:
    """Return the Track 12.21 pair `(lens_resonance_72, user_temporal_N)`."""

    if len(lens_resonance_72) != LENS_RESONANCE_DIM:
        raise ValueError("lens_resonance_72 must contain exactly 72 values")
    return {
        "lens_resonance_72": [float(value) for value in lens_resonance_72],
        "user_temporal_N": project_user_context_frame(frame, config, weights),
        "compatibility_note": "Track 12.21 second-channel shape; current canon routes personal energy through E_4.",
    }


def _base_features(frame: Mapping[str, Any]) -> list[float]:
    kairos = _mapping(frame.get("kairos"))
    identity = _mapping(frame.get("identity"))
    pasu = _mapping(frame.get("pasu"))

    planet_degrees = _number_list(kairos.get("planet_degrees"), expected=10)
    q_identity = _number_list(identity.get("q_identity"), expected=4)
    q_personal = _number_list(identity.get("q_personal"), expected=4)

    features: list[float] = [degree / 720.0 for degree in planet_degrees]
    features.append(_clamp01(_float(kairos.get("moon_phase"))))
    features.extend(q_identity)
    features.extend(q_personal)
    features.append(_clamp01(_float(identity.get("tick12")) / 11.0))
    features.append(_clamp01(_float(identity.get("exact_degree_720")) / 720.0))
    features.append(_clamp01(_float(identity.get("phase"))))
    features.append(1.0 if bool(frame.get("recognized")) else 0.0)
    features.append(_bounded_count(frame.get("recent_sessions")))
    features.append(_bounded_count(frame.get("active_dev_goals")))

    hash_material = {
        "quintessence_hash": pasu.get("quintessence_hash", ""),
        "decan_window": kairos.get("decan_window", ""),
        "epoch_marker": kairos.get("epoch_marker", ""),
        "fired_at": frame.get("fired_at", ""),
    }
    features.extend(byte / 255.0 for byte in _stable_bytes(hash_material)[:8])
    return features


def _pad_or_trim(values: Sequence[float], dim: int, salt: bytes) -> list[float]:
    out = [float(value) for value in values[:dim]]
    index = 0
    while len(out) < dim:
        out.append(salt[index % len(salt)] / 255.0)
        index += 1
    return out


def _stable_bytes(value: Any) -> bytes:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(payload).digest()


def _mapping(value: Any) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise ValueError("UserContextFrame channel must be an object")
    return value


def _number_list(value: Any, expected: int) -> list[float]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
        raise ValueError(f"expected numeric sequence of length {expected}")
    if len(value) != expected:
        raise ValueError(f"expected numeric sequence of length {expected}")
    return [_float(item) for item in value]


def _float(value: Any) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"non-numeric projection value: {value!r}") from exc
    if not math.isfinite(result):
        raise ValueError(f"non-finite projection value: {value!r}")
    return result


def _bounded_count(value: Any) -> float:
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        return _clamp01(len(value) / 12.0)
    return 0.0


def _clamp01(value: float) -> float:
    if not math.isfinite(value):
        return 0.0
    return min(1.0, max(0.0, float(value)))


__all__ = [
    "DEFAULT_OUTPUT_DIM",
    "LENS_RESONANCE_DIM",
    "ProjectionWeights",
    "UserProjectionConfig",
    "build_position_5_prime_input",
    "project_user_context_frame",
]
