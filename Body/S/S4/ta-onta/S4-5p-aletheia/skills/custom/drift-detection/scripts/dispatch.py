#!/usr/bin/env python3
"""Queue diagnosed retrain tasks for Anima dispatch."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def dispatch(task: dict, queue_jsonl: Path) -> dict:
    queue_jsonl.parent.mkdir(parents=True, exist_ok=True)
    with queue_jsonl.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(task, sort_keys=True) + "\n")
    return {"queued": True, "retrain_id": task["retrain_id"], "queue": str(queue_jsonl)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--task-json", required=True)
    parser.add_argument("--queue-jsonl", required=True)
    args = parser.parse_args()
    try:
        task = json.loads(Path(args.task_json).read_text(encoding="utf-8"))
        print(json.dumps(dispatch(task, Path(args.queue_jsonl)), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
