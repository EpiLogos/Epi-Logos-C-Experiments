#!/usr/bin/env python3
"""Evaluate distillation predictions against teacher/student targets."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def overlap(a: str, b: str) -> float:
    left = set(a.lower().split())
    right = set(b.lower().split())
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset-jsonl", required=True)
    parser.add_argument("--predictions-jsonl", required=True)
    args = parser.parse_args()
    try:
        dataset = [json.loads(line) for line in Path(args.dataset_jsonl).read_text(encoding="utf-8").splitlines() if line.strip()]
        predictions = [json.loads(line) for line in Path(args.predictions_jsonl).read_text(encoding="utf-8").splitlines() if line.strip()]
        if len(dataset) != len(predictions):
            raise ValueError("dataset and predictions must have matching row counts")
        scores = [overlap(row["student_target"], pred["prediction"]) for row, pred in zip(dataset, predictions)]
        metric = sum(scores) / len(scores) if scores else 0.0
        print(json.dumps({"rows": len(scores), "lexical_overlap": metric}, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
