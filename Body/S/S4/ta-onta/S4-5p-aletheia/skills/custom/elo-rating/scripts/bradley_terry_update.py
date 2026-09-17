#!/usr/bin/env python3
"""Bradley-Terry / Elo update using config-resolved constants."""

from __future__ import annotations

import argparse
import json
import math
import sys

from config import load_config


def update_rating(current: float, opponent: float, score: float, config: dict) -> dict:
    elo = config["aletheia"]["elo"]
    expected = elo["outcome_win"] / (
        elo["outcome_win"]
        + math.pow(elo["expected_score_base"], (opponent - current) / elo["expected_score_divisor"])
    )
    next_rating = current + elo["k_factor"] * (score - expected)
    return {"current": current, "opponent": opponent, "score": score, "expected": expected, "next_rating": next_rating}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config")
    parser.add_argument("--current", type=float, required=True)
    parser.add_argument("--opponent", type=float, required=True)
    parser.add_argument("--score", type=float, required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(update_rating(args.current, args.opponent, args.score, load_config(args.config)), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
