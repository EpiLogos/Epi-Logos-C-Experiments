#!/usr/bin/env python3
"""Local-only MLX LoRA training entrypoint for the Nara parser slot."""

from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
from pathlib import Path
from typing import Any


LOCAL_ONLY = "local-only"
MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"


def main() -> int:
    parser = argparse.ArgumentParser(description="Run local-only MLX LoRA training.")
    parser.add_argument("--config", required=True, help="JSON config path. YAML may be converted before invocation.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and write local manifest without importing MLX.")
    args = parser.parse_args()

    try:
        config_path = local_path(args.config, "config")
        config = json.loads(config_path.read_text(encoding="utf-8"))
        manifest = build_manifest(config, dry_run=args.dry_run)
        checkpoint_dir = Path(manifest["checkpoint_path"])
        checkpoint_dir.mkdir(parents=True, exist_ok=True)
        (checkpoint_dir / "checkpoint.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if not args.dry_run:
            run_mlx_lora(config, checkpoint_dir)
        print(json.dumps(manifest, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001 - CLI boundary should convert every refusal into stderr.
        print(str(exc), file=sys.stderr)
        return 2


def build_manifest(config: dict[str, Any], *, dry_run: bool) -> dict[str, Any]:
    assert_local_only(config.get("privacy_class"), "mlx-lora training")
    corpus_manifest = local_path(str_value(config, "corpus_manifest"), "corpus_manifest")
    checkpoint_root = local_path(str_value(config, "checkpoint_dir"), "checkpoint_dir")
    checkpoint_version = str_value(config, "checkpoint_version")
    base_model = str_value(config, "base_model")
    adapter_rank = positive_number(config.get("adapter_rank"), "adapter_rank")
    learning_rate = positive_number(config.get("learning_rate"), "learning_rate")
    if not corpus_manifest.exists():
        raise ValueError(f"corpus_manifest must exist locally: {corpus_manifest}")
    checkpoint_path = checkpoint_root / checkpoint_version
    return {
        "runtime": "mlx-lora",
        "privacy_class": LOCAL_ONLY,
        "base_model": base_model,
        "adapter_rank": adapter_rank,
        "learning_rate": learning_rate,
        "checkpoint_version": checkpoint_version,
        "checkpoint_path": str(checkpoint_path),
        "corpus_manifest": str(corpus_manifest),
        "dry_run": dry_run,
        "target": {
            "platform": platform.system().lower(),
            "machine": platform.machine().lower(),
        },
        "model_slot_policy": MODEL_SLOT_REF,
    }


def run_mlx_lora(config: dict[str, Any], checkpoint_dir: Path) -> None:
    if platform.system().lower() != "darwin" or platform.machine().lower() != "arm64":
        raise RuntimeError("mlx-lora requires Apple Silicon for non-dry-run execution.")
    command = [
        sys.executable,
        "-m",
        "mlx_lm.lora",
        "--model",
        str_value(config, "base_model"),
        "--train",
        "--data",
        str(local_path(str_value(config, "corpus_manifest"), "corpus_manifest").parent),
        "--adapter-path",
        str(checkpoint_dir),
    ]
    subprocess.run(command, check=True)


def assert_local_only(value: Any, surface: str) -> None:
    if value != LOCAL_ONLY:
        raise ValueError(f"{surface} is {LOCAL_ONLY} only per {MODEL_SLOT_REF}; refused privacy_class={value!r}.")


def local_path(value: str, field: str) -> Path:
    if "://" in value and not value.startswith("file://"):
        raise ValueError(f"{field} must be {LOCAL_ONLY} per {MODEL_SLOT_REF}; refused non-local path {value!r}.")
    path = Path(value.removeprefix("file://")).expanduser()
    return path


def str_value(config: dict[str, Any], key: str) -> str:
    value = config.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a non-empty string.")
    return value


def positive_number(value: Any, key: str) -> float:
    if not isinstance(value, (int, float)) or value <= 0:
        raise ValueError(f"{key} must be a positive number from config.")
    return float(value)


if __name__ == "__main__":
    raise SystemExit(main())
