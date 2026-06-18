#!/usr/bin/env python3
"""Confidence-adjusted effective rating."""

from __future__ import annotations

import argparse
import json
import sys

from config import load_config


def confidence(rating: float, sigma: float, config: dict) -> dict:
    alpha = config["aletheia"]["elo"]["confidence_penalty_alpha"]
    return {"rating": rating, "sigma": sigma, "effective_rating": rating - alpha * sigma}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config")
    parser.add_argument("--rating", type=float, required=True)
    parser.add_argument("--sigma", type=float, required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(confidence(args.rating, args.sigma, load_config(args.config)), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
