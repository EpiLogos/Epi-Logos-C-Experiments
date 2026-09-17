#!/usr/bin/env python3
"""Map drift events to retrain actions using config-resolved gates."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2] / "elo-rating" / "scripts"))
from config import load_config  # noqa: E402


def diagnose(event: dict, config: dict) -> dict | None:
    drift = config["aletheia"]["drift_detection"]
    kind = event.get("kind")
    target = event.get("target", {})
    action = None
    if kind == "rating-trend":
        drop = event["baseline_rating"] - event["current_rating"]
        if drop >= drift["delta_elo"] and event["trial_count"] >= drift["min_trials"]:
            action = action_for_rating_target(target)
    elif kind == "coverage":
        if event["coverage_gap_days"] >= drift["coverage_days"]:
            action = {"skill": "parashakti-corpus-curation", "reason": "coverage_gap"}
    elif kind == "verifier-violation":
        if event["violation_rate"] >= event["baseline_rate"] * drift["verifier_violation_multiplier"]:
            action = {"skill": "anuttara-constraint-discovery", "reason": "verifier_violation"}
    elif kind == "veto-pattern":
        if (
            event["veto_count"] >= drift["veto_count_per_facet"]
            and event["consecutive_sessions"] >= drift["veto_consecutive_sessions"]
        ):
            action = {"skill": "developer-review", "reason": "veto_pattern"}
    if not action:
        return None
    return {
        "drift_event_id": event["drift_event_id"],
        "kind": kind,
        "target": target,
        "action": action,
        "calibration_provenance": event.get("calibration_provenance", {}),
    }


def action_for_rating_target(target: dict) -> dict:
    subsystem = target.get("subsystem")
    skill = target.get("skill")
    if subsystem == "M4" or skill == "journal-parser":
        return {"skill": "nara-voice-training", "reason": "nara_rating_trend"}
    if subsystem == "M2" or skill == "parashakti-ebm-head":
        return {"skill": "parashakti-ebm-head", "reason": "parashakti_ebm_rating_trend"}
    return {"skill": "developer-review", "reason": "unmapped_rating_trend"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config")
    parser.add_argument("--event-json", required=True)
    args = parser.parse_args()
    try:
        event = json.loads(Path(args.event_json).read_text(encoding="utf-8"))
        print(json.dumps(diagnose(event, load_config(args.config)), sort_keys=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
