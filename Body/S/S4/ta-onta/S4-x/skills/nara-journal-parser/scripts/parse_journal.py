#!/usr/bin/env python3
"""Local-only Nara journal parser producing handle-safe summaries."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


LOCAL_ONLY = "local-only"
MODEL_SLOT_REF = "[[M'-MODEL-SLOT-SPEC]]"
SIGNAL_TERMS = {
    "dream": re.compile(r"\bdream|dreamt|dreamed\b", re.IGNORECASE),
    "oracle": re.compile(r"\boracle|tarot|i-?ching\b", re.IGNORECASE),
    "mood": re.compile(r"\bmood|feeling|affect|emotion\b", re.IGNORECASE),
    "phone-writing": re.compile(r"\bphone|note-to-self|text fragment\b", re.IGNORECASE),
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse a local Nara journal entry without exposing body text.")
    parser.add_argument("--input", required=True)
    parser.add_argument("--privacy-class", required=True)
    args = parser.parse_args()
    try:
        assert_local_only(args.privacy_class, "nara-journal-parser")
        path = local_path(args.input, "input")
        text = path.read_text(encoding="utf-8")
        print(json.dumps(parse_entry(path, text), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


def parse_entry(path: Path, text: str) -> dict[str, Any]:
    signals = [name for name, pattern in SIGNAL_TERMS.items() if pattern.search(text)]
    title = next((line.lstrip("#").strip() for line in text.splitlines() if line.strip().startswith("#")), path.stem)
    return {
        "skill": "nara-journal-parser",
        "privacy_class": LOCAL_ONLY,
        "body_rendered": False,
        "body_sha256": "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "title": title,
        "signals": signals,
        "source": {
            "path": str(path),
            "kind": "journal",
        },
        "model_slot_policy": MODEL_SLOT_REF,
    }


def assert_local_only(value: str, surface: str) -> None:
    if value != LOCAL_ONLY:
        raise ValueError(f"{surface} is {LOCAL_ONLY} only per {MODEL_SLOT_REF}; refused privacy_class={value!r}.")


def local_path(value: str, field: str) -> Path:
    if "://" in value and not value.startswith("file://"):
        raise ValueError(f"{field} must be {LOCAL_ONLY} per {MODEL_SLOT_REF}; refused non-local path {value!r}.")
    path = Path(value.removeprefix("file://")).expanduser()
    if not path.exists():
        raise ValueError(f"{field} must exist locally: {path}")
    return path


if __name__ == "__main__":
    raise SystemExit(main())
