#!/usr/bin/env python3
"""Small-sample TrueSkill-style conservative rating update."""

from __future__ import annotations

import argparse
import json
import math
import sys

from config import load_config


def update(mu: float, sigma: float, score: float, config: dict) -> dict:
    elo = config["aletheia"]["elo"]
    beta = elo["trueskill_beta"]
    tau = elo["trueskill_tau"]
    draw_probability = elo["trueskill_draw_probability"]
    direction = score - draw_probability
    adjusted_sigma = math.sqrt((sigma * sigma) + (tau * tau))
    next_mu = mu + direction * (adjusted_sigma / beta)
    next_sigma = max(adjusted_sigma / (elo["bootstrap_trials"] + elo["outcome_win"]), elo["confidence_sigma"])
    return {"mu": mu, "sigma": sigma, "score": score, "next_mu": next_mu, "next_sigma": next_sigma}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config")
    parser.add_argument("--mu", type=float, required=True)
    parser.add_argument("--sigma", type=float, required=True)
    parser.add_argument("--score", type=float, required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(update(args.mu, args.sigma, args.score, load_config(args.config)), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
