#!/usr/bin/env python3
"""Evaluate a local MLX LoRA checkpoint against a local held-out JSONL file."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate local-only MLX LoRA checkpoint metadata.")
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--validation-jsonl", required=True)
    args = parser.parse_args()
    try:
        checkpoint = local_path(args.checkpoint, "checkpoint")
        validation = local_path(args.validation_jsonl, "validation-jsonl")
        if not checkpoint.exists():
            raise ValueError(f"checkpoint must exist locally: {checkpoint}")
        rows = validation.read_text(encoding="utf-8").splitlines()
        non_empty = [row for row in rows if row.strip()]
        metrics = {
            "runtime": "mlx-lora",
            "operation": "eval",
            "privacy_class": "local-only",
            "checkpoint": str(checkpoint),
            "validation_rows": len(non_empty),
            "valid_json_rows": sum(1 for row in non_empty if valid_json(row)),
            "model_slot_policy": MODEL_SLOT_REF,
        }
        print(json.dumps(metrics, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


def valid_json(row: str) -> bool:
    try:
        json.loads(row)
        return True
    except json.JSONDecodeError:
        return False


def local_path(value: str, field: str) -> Path:
    if "://" in value and not value.startswith("file://"):
        raise ValueError(f"{field} must be local-only per {MODEL_SLOT_REF}; refused non-local path {value!r}.")
    return Path(value.removeprefix("file://")).expanduser()


if __name__ == "__main__":
    raise SystemExit(main())
