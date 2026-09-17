#!/usr/bin/env python3
"""Compose distillation training artifacts without hiding runtime choice."""

from __future__ import annotations

import argparse
import json
import platform
import sys
from pathlib import Path


def select_backend(config: dict) -> str:
    requested = config.get("backend")
    if requested:
        return str(requested)
    if platform.system().lower() == "darwin" and platform.machine().lower() == "arm64":
        return "mlx-lora"
    return "peft-unsloth"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset-jsonl", required=True)
    parser.add_argument("--artifact-dir", required=True)
    parser.add_argument("--config-json", required=True)
    args = parser.parse_args()
    try:
        config = json.loads(Path(args.config_json).read_text(encoding="utf-8"))
        dataset = Path(args.dataset_jsonl)
        if not dataset.exists():
            raise ValueError(f"dataset-jsonl does not exist: {dataset}")
        rows = [json.loads(line) for line in dataset.read_text(encoding="utf-8").splitlines() if line.strip()]
        if not rows:
            raise ValueError("distillation dataset is empty")
        artifact_dir = Path(args.artifact_dir)
        artifact_dir.mkdir(parents=True, exist_ok=True)
        manifest = {
            "backend": select_backend(config),
            "dataset": str(dataset),
            "rows": len(rows),
            "loss": "teacher_student + multi_channel_preservation",
            "config": config,
        }
        (artifact_dir / "distillation-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(manifest, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
