#!/usr/bin/env python3
"""Generate teacher/student distillation rows with multi-channel annotations."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REQUIRED_CHANNELS = ("lens_coherence", "verifier_pass", "user_articulation_simulation")


def annotate(record: dict) -> dict:
    teacher = record.get("teacher_output")
    prompt = record.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("record.prompt is required")
    if not isinstance(teacher, str) or not teacher.strip():
        raise ValueError("record.teacher_output is required")
    annotations = record.get("annotations")
    if not isinstance(annotations, dict):
        raise ValueError("record.annotations is required")
    missing = [key for key in REQUIRED_CHANNELS if key not in annotations]
    if missing:
        raise ValueError(f"record.annotations missing {missing}")
    return {
        "prompt": prompt,
        "teacher_output": teacher,
        "student_target": record.get("student_target", teacher),
        "annotations": {key: annotations[key] for key in REQUIRED_CHANNELS},
        "provenance": record.get("provenance", {}),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-jsonl", required=True)
    parser.add_argument("--output-jsonl", required=True)
    args = parser.parse_args()
    try:
        rows = []
        for line in Path(args.source_jsonl).read_text(encoding="utf-8").splitlines():
            if line.strip():
                rows.append(annotate(json.loads(line)))
        output = Path(args.output_jsonl)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("\n".join(json.dumps(row, sort_keys=True) for row in rows) + "\n", encoding="utf-8")
        print(json.dumps({"rows": len(rows), "output": str(output)}, sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
