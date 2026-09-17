#!/usr/bin/env python3
"""Query JSONL Mercurius Elo state by identity/context fields."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state-jsonl", required=True)
    parser.add_argument("--where", action="append", default=[], help="field=value filter")
    args = parser.parse_args()
    filters = dict(item.split("=", maxsplit=1) for item in args.where)
    matches = []
    try:
        for line in Path(args.state_jsonl).read_text(encoding="utf-8").splitlines():
            record = json.loads(line)
            if all(str(record.get(key)) == value for key, value in filters.items()):
                matches.append(record)
        print(json.dumps(matches, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
