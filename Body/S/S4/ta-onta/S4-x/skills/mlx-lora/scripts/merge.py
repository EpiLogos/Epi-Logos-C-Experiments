#!/usr/bin/env python3
"""Merge a local MLX LoRA adapter into a local base model path."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"


def main() -> int:
    parser = argparse.ArgumentParser(description="Merge local-only MLX LoRA adapter.")
    parser.add_argument("--adapter", required=True)
    parser.add_argument("--base-model", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        adapter = local_path(args.adapter, "adapter")
        output = local_path(args.output, "output")
        if not adapter.exists():
            raise ValueError(f"adapter must exist locally: {adapter}")
        output.mkdir(parents=True, exist_ok=True)
        manifest = {
            "runtime": "mlx-lora",
            "operation": "merge",
            "privacy_class": "local-only",
            "adapter": str(adapter),
            "base_model": args.base_model,
            "output": str(output),
            "model_slot_policy": MODEL_SLOT_REF,
        }
        (output / "merge-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if not args.dry_run:
            subprocess.run(
                [sys.executable, "-m", "mlx_lm.fuse", "--model", args.base_model, "--adapter-path", str(adapter), "--save-path", str(output)],
                check=True,
            )
        print(json.dumps(manifest, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


def local_path(value: str, field: str) -> Path:
    if "://" in value and not value.startswith("file://"):
        raise ValueError(f"{field} must be local-only per {MODEL_SLOT_REF}; refused non-local path {value!r}.")
    return Path(value.removeprefix("file://")).expanduser()


if __name__ == "__main__":
    raise SystemExit(main())
