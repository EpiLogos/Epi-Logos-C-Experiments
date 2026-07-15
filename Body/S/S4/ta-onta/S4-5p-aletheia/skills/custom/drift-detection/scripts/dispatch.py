#!/usr/bin/env python3
"""Queue diagnosed retrain tasks for Anima dispatch."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


TUNING_DISPATCH_PURPOSE = "tuning-calibration"
TUNING_REVIEW_PIPELINE = "tuning_review"
TUNING_PRIVACY_CLASSES = {"local-only", "vector-derived", "non-sensitive"}


def dispatch(task: dict[str, Any], queue_jsonl: Path) -> dict[str, Any]:
    kind = task.get("kind")
    if kind == "aletheia_tuning_proposal":
        dispatch_contract = _validate_tuning_dispatch(task)
        receipt_id_key = "proposal_id"
    elif kind == "aletheia_retrain_task":
        dispatch_contract = None
        receipt_id_key = "retrain_id"
    else:
        raise ValueError("unsupported Aletheia dispatch task kind")

    receipt_id = task.get(receipt_id_key)
    if not isinstance(receipt_id, str) or not receipt_id.strip():
        raise ValueError(f"{receipt_id_key} is required")
    queue_jsonl.parent.mkdir(parents=True, exist_ok=True)
    with queue_jsonl.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(task, sort_keys=True) + "\n")
    receipt = {"queued": True, receipt_id_key: receipt_id, "queue": str(queue_jsonl)}
    if dispatch_contract is not None:
        receipt["dispatch_purpose"] = dispatch_contract["dispatch_purpose"]
    return receipt


def _validate_tuning_dispatch(task: dict[str, Any]) -> dict[str, Any]:
    contract = task.get("dispatch")
    if not isinstance(contract, dict):
        raise ValueError("tuning proposal dispatch contract is required")
    if contract.get("dispatch_purpose") != TUNING_DISPATCH_PURPOSE:
        raise ValueError(
            f"dispatch_purpose must be '{TUNING_DISPATCH_PURPOSE}' for tuning proposals"
        )
    if contract.get("review_pipeline") != TUNING_REVIEW_PIPELINE:
        raise ValueError(
            f"review_pipeline must be '{TUNING_REVIEW_PIPELINE}' for tuning proposals"
        )

    privacy_class = contract.get("tuning_target_knob_privacy_class")
    slot_state = contract.get("actual_resolved_slot_state")
    pasu_count = contract.get("evidence_window_pasu_count")
    if privacy_class not in TUNING_PRIVACY_CLASSES:
        raise ValueError("tuning dispatch requires a valid target knob privacy class")
    if not isinstance(slot_state, str) or not slot_state.strip():
        raise ValueError("tuning dispatch requires actual_resolved_slot_state")
    if isinstance(pasu_count, bool) or not isinstance(pasu_count, int) or pasu_count < 0:
        raise ValueError("tuning dispatch requires a non-negative evidence_window_pasu_count")
    if privacy_class == "local-only" and (
        slot_state != "local-default"
        or pasu_count > 1
    ):
        raise ValueError(
            "privacy-boundary-violation: local-only tuning dispatch escaped its PASU boundary"
        )
    return contract


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
