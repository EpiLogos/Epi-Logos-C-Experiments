#!/usr/bin/env python3
"""Build a local Nara voice corpus manifest and checkpoint reference."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


LOCAL_ONLY = "local-only"
MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"


def main() -> int:
    parser = argparse.ArgumentParser(description="Train or dry-run the local-only Nara voice LoRA pipeline.")
    parser.add_argument("--config", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        config_path = local_path(args.config, "config")
        config = json.loads(config_path.read_text(encoding="utf-8"))
        payload = build_payload(config, dry_run=args.dry_run)
        checkpoint_path = Path(payload["checkpoint"]["path"])
        checkpoint_path.mkdir(parents=True, exist_ok=True)
        (checkpoint_path / "corpus-manifest.json").write_text(json.dumps(payload["corpus"], indent=2) + "\n", encoding="utf-8")
        (checkpoint_path / "checkpoint-ref.json").write_text(json.dumps(payload["checkpoint"], indent=2) + "\n", encoding="utf-8")
        if not args.dry_run:
            invoke_mlx_lora(config, checkpoint_path)
        print(json.dumps(payload, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


def build_payload(config: dict[str, Any], *, dry_run: bool) -> dict[str, Any]:
    assert_local_only(config.get("privacy_class"), "nara-voice-training")
    checkpoint_dir = local_path(str_value(config, "checkpoint_dir"), "checkpoint_dir")
    checkpoint_version = str_value(config, "checkpoint_version")
    model_version_key = str_value(config, "model_version_key")
    corpus = corpus_digests(config.get("corpus"))
    checkpoint_path = checkpoint_dir / checkpoint_version
    return {
        "skill": "nara-voice-training",
        "privacy_class": LOCAL_ONLY,
        "model_version_key": model_version_key,
        "checkpoint": {
            "path": str(checkpoint_path),
            "version": checkpoint_version,
            "privacy_class": LOCAL_ONLY,
        },
        "corpus": corpus,
        "dry_run": dry_run,
        "model_slot_policy": MODEL_SLOT_REF,
    }


def corpus_digests(raw: Any) -> dict[str, list[str]]:
    if not isinstance(raw, dict):
        raise ValueError("corpus must name journal, dream, and phone_writings lists.")
    return {
        "journal_hashes": hash_files(raw.get("journal"), "journal"),
        "dream_hashes": hash_files(raw.get("dream"), "dream"),
        "phone_writing_hashes": hash_files(raw.get("phone_writings"), "phone_writings"),
    }


def hash_files(raw: Any, field: str) -> list[str]:
    if not isinstance(raw, list):
        raise ValueError(f"corpus.{field} must be a list.")
    hashes: list[str] = []
    for index, value in enumerate(raw):
        path = local_path(str(value), f"corpus.{field}[{index}]")
        data = path.read_bytes()
        hashes.append("sha256:" + hashlib.sha256(data).hexdigest())
    return hashes


def invoke_mlx_lora(config: dict[str, Any], checkpoint_path: Path) -> None:
    corpus_jsonl = checkpoint_path / "corpus.jsonl"
    corpus_jsonl.write_text("", encoding="utf-8")
    mlx_config = checkpoint_path / "mlx-config.json"
    mlx_config.write_text(
        json.dumps(
            {
                "privacy_class": LOCAL_ONLY,
                "base_model": config.get("model_version_key"),
                "adapter_rank": config.get("adapter_rank"),
                "learning_rate": config.get("learning_rate"),
                "corpus_manifest": str(corpus_jsonl),
                "checkpoint_dir": str(checkpoint_path.parent),
                "checkpoint_version": checkpoint_path.name,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    mlx_train = Path(__file__).resolve().parents[2] / "mlx-lora" / "scripts" / "train.py"
    subprocess.run([sys.executable, str(mlx_train), "--config", str(mlx_config)], check=True)


def assert_local_only(value: Any, surface: str) -> None:
    if value != LOCAL_ONLY:
        raise ValueError(f"{surface} is {LOCAL_ONLY} only per {MODEL_SLOT_REF}; refused privacy_class={value!r}.")


def local_path(value: str, field: str) -> Path:
    if "://" in value and not value.startswith("file://"):
        raise ValueError(f"{field} must be {LOCAL_ONLY} per {MODEL_SLOT_REF}; refused non-local path {value!r}.")
    return Path(value.removeprefix("file://")).expanduser()


def str_value(config: dict[str, Any], key: str) -> str:
    value = config.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a non-empty string.")
    return value


if __name__ == "__main__":
    raise SystemExit(main())
