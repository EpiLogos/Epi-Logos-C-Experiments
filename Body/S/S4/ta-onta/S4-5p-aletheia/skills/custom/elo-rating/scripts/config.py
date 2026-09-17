#!/usr/bin/env python3
"""Config loader for Aletheia Elo scripts.

The scripts in this skill intentionally refuse missing config keys. Suggested
defaults live in canon/deployment notes, not in executable source.
"""

from __future__ import annotations

import os
from pathlib import Path
import tomllib
from typing import Any


REQUIRED_ELO_KEYS = (
    "seed_rating",
    "confidence_penalty_alpha",
    "bootstrap_trials",
    "bootstrap_sigma",
    "k_factor",
    "expected_score_base",
    "expected_score_divisor",
    "outcome_win",
    "outcome_loss",
    "outcome_draw",
    "trueskill_beta",
    "trueskill_tau",
    "trueskill_draw_probability",
    "confidence_sigma",
)

REQUIRED_DRIFT_KEYS = (
    "delta_elo",
    "min_trials",
    "coverage_days",
    "verifier_violation_multiplier",
    "veto_count_per_facet",
    "veto_consecutive_sessions",
)


def load_config(path: str | None = None) -> dict[str, Any]:
    config_path = Path(path or os.environ.get("EPI_LOGOS_CONFIG", "~/.epi-logos/config.toml")).expanduser()
    with config_path.open("rb") as handle:
        data = tomllib.load(handle)
    aletheia = data.get("aletheia")
    if not isinstance(aletheia, dict):
        raise ValueError("Missing config.aletheia section")
    elo = require_section(aletheia, "elo")
    drift = require_section(aletheia, "drift_detection")
    for key in REQUIRED_ELO_KEYS:
        require_number(elo, f"config.aletheia.elo.{key}")
    for key in REQUIRED_DRIFT_KEYS:
        require_number(drift, f"config.aletheia.drift_detection.{key}")
    severity = drift.get("severity_weights")
    if not isinstance(severity, dict) or not severity:
        raise ValueError("Missing config.aletheia.drift_detection.severity_weights.*")
    for key, value in severity.items():
        if not isinstance(value, (int, float)):
            raise ValueError(f"config.aletheia.drift_detection.severity_weights.{key} must be numeric")
    return data


def require_section(parent: dict[str, Any], key: str) -> dict[str, Any]:
    value = parent.get(key)
    if not isinstance(value, dict):
        raise ValueError(f"Missing config.aletheia.{key} section")
    return value


def require_number(section: dict[str, Any], dotted_key: str) -> float:
    key = dotted_key.rsplit(".", maxsplit=1)[-1]
    value = section.get(key)
    if not isinstance(value, (int, float)):
        raise ValueError(f"Missing numeric config key {dotted_key}")
    return float(value)
