#!/usr/bin/env python3
"""One-shot watch command for Mercurius drift-event JSONL streams."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from diagnose import diagnose

sys.path.append(str(Path(__file__).resolve().parents[2] / "elo-rating" / "scripts"))
from config import load_config  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config")
    parser.add_argument("--events-jsonl", required=True)
    args = parser.parse_args()
    try:
        config = load_config(args.config)
        outputs = []
        for line in Path(args.events_jsonl).read_text(encoding="utf-8").splitlines():
            action = diagnose(json.loads(line), config)
            if action:
                outputs.append(action)
        print(json.dumps(outputs, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
