#!/usr/bin/env python3
"""Audit Elo records for required coordinate-conditional fields."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REQUIRED_FIELDS = ("agent", "model", "harness", "skill", "channel", "rating", "sigma", "trial_count")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state-jsonl", required=True)
    args = parser.parse_args()
    errors = []
    for index, line in enumerate(Path(args.state_jsonl).read_text(encoding="utf-8").splitlines()):
        record = json.loads(line)
        missing = [field for field in REQUIRED_FIELDS if field not in record]
        if missing:
            errors.append({"line": index, "missing": missing})
    print(json.dumps({"valid": not errors, "errors": errors}, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
