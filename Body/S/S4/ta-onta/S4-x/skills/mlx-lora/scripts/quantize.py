#!/usr/bin/env python3
"""Quantize a local merged model for local serving."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"


def main() -> int:
    parser = argparse.ArgumentParser(description="Quantize local-only MLX model output.")
    parser.add_argument("--model", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--bits", required=True, type=int, choices=[4, 5, 8])
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        model = local_path(args.model, "model")
        output = local_path(args.output, "output")
        if not model.exists():
            raise ValueError(f"model must exist locally: {model}")
        output.mkdir(parents=True, exist_ok=True)
        manifest = {
            "runtime": "mlx-lora",
            "operation": "quantize",
            "privacy_class": "local-only",
            "bits": args.bits,
            "model": str(model),
            "output": str(output),
            "model_slot_policy": MODEL_SLOT_REF,
        }
        (output / "quantize-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if not args.dry_run:
            subprocess.run(
                [sys.executable, "-m", "mlx_lm.convert", "--hf-path", str(model), "--mlx-path", str(output), "-q"],
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
