"""Compose Aletheia drift-detection proposals for governed ML tuning.

This scaffold is intentionally additive: it stages the Tier 3 training hook as
proposal-only contract data until the full drift-detection skill lands. It does
not train, deploy, mutate runtime policy, or resolve review gates.
"""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
import json
from typing import Any


FORBIDDEN_SLOT_PAYLOAD_KEYS = {
    "body",
    "content",
    "payload",
    "raw",
    "raw_payload",
    "raw_text",
    "text",
}


def compose_tuning_proposal(drift_event: dict[str, Any]) -> dict[str, Any] | None:
    """Return a Tier 3 tuning proposal for reviewable Mythos drift.

    The function is a pure composer. It accepts a real drift event, validates
    that only slot handles cross the Anuttara privacy boundary, and emits a
    Tier 2 review submission. If the drift metric is already within threshold,
    no proposal is surfaced.
    """

    event = _require_mapping(drift_event, "drift_event")
    signal = _require_mapping(event.get("drift_signal"), "drift_signal")

    current_value = _require_number(signal.get("current_value"), "current_value")
    threshold = _require_number(
        signal.get("minimum_acceptable_value"),
        "minimum_acceptable_value",
    )
    if current_value >= threshold:
        return None

    dispatch_purpose = _require_non_blank(
        event.get("dispatch_purpose"),
        "dispatch_purpose",
    )
    source_agent = _require_non_blank(event.get("source_agent"), "source_agent")
    if source_agent != "mythos":
        raise ValueError("compose_tuning_proposal requires source_agent='mythos'")

    slot_refs = _validated_slot_refs(event.get("slot_refs", []))
    evidence_refs = _validated_evidence_refs(event.get("evidence_refs", []))
    target_surface = _require_non_blank(event.get("target_surface"), "target_surface")
    rollback_handle = _require_non_blank(event.get("rollback_handle"), "rollback_handle")
    integration_impact_uri = _require_non_blank(
        event.get("integration_impact_uri"),
        "integration_impact_uri",
    )

    proposal_basis = {
        "source_agent": source_agent,
        "session_id": event.get("session_id"),
        "day_id": event.get("day_id"),
        "dispatch_purpose": dispatch_purpose,
        "drift_signal": signal,
        "evidence_refs": evidence_refs,
        "slot_refs": slot_refs,
        "target_surface": target_surface,
    }
    proposal_id = "aletheia-tuning-" + sha256(
        json.dumps(proposal_basis, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()[:16]

    metric_name = _require_non_blank(signal.get("metric_name"), "metric_name")
    window_id = _require_non_blank(signal.get("window_id"), "window_id")

    return {
        "kind": "aletheia_tuning_proposal",
        "proposal_id": proposal_id,
        "source_agent": "aletheia",
        "origin": {
            "source_agent": source_agent,
            "session_id": event.get("session_id"),
            "day_id": event.get("day_id"),
            "vak_address": deepcopy(event.get("vak_address")),
        },
        "dispatch_path": _dispatch_path(dispatch_purpose),
        "drift_signal": deepcopy(signal),
        "target_surface": target_surface,
        "evidence_refs": evidence_refs,
        "slot_refs": slot_refs,
        "privacy": {
            "class": "review_gate",
            "raw_slot_payloads_elided": True,
            "boundary": "anuttara_slot_handle_only",
        },
        "anuttara_verifier": {
            "slot_privacy_boundary_compliance": True,
            "checked_boundary": "slot_privacy_boundary_compliance",
            "allowed_slot_ref_count": len(slot_refs),
        },
        "tuning_contract": {
            "tier": 3,
            "operation": "ml_training_tuning",
            "mode": "proposal_only",
            "auto_apply": False,
            "rollback_handle": rollback_handle,
            "integration_impact_uri": integration_impact_uri,
        },
        "review_gate": {
            "tier": 2,
            "required": True,
            "status": "pending",
            "resolver": "epii_review",
        },
        "review_submission": {
            "source": "aletheia",
            "title": f"Review Tier 3 tuning proposal for {metric_name}",
            "body": (
                f"Mythos drift window {window_id} reported {metric_name}="
                f"{current_value:.4f} below minimum {threshold:.4f}. "
                "Aletheia proposes review-gated Tier 3 tuning only; no runtime "
                "mutation is authorized by this proposal."
            ),
            "category": "recursive_self_modification",
            "requires_human": True,
            "dispatch_purpose": dispatch_purpose,
            "proposed_action": {
                "kind": "tier3_ml_training_tuning",
                "target": {
                    "surface": target_surface,
                    "metric_name": metric_name,
                    "window_id": window_id,
                },
                "payload": {
                    "proposal_id": proposal_id,
                    "rollback_handle": rollback_handle,
                    "integration_impact_uri": integration_impact_uri,
                },
            },
        },
    }


def compose_retrain_task(diagnosis: dict[str, Any]) -> dict[str, Any]:
    """Compose an Anima-dispatchable retrain task from a drift diagnosis.

    This is the Track 12.24 production path. It does not run training; it emits
    queue data for `aletheia_retrain_queue` and the Anima dispatch lane.
    """

    item = _require_mapping(diagnosis, "diagnosis")
    action = _require_mapping(item.get("action"), "action")
    target = _require_mapping(item.get("target"), "target")
    drift_event_id = _require_non_blank(item.get("drift_event_id"), "drift_event_id")
    skill = _require_non_blank(action.get("skill"), "action.skill")
    reason = _require_non_blank(action.get("reason"), "action.reason")
    target_subsystem = _require_non_blank(target.get("subsystem"), "target.subsystem")
    retrain_basis = {
        "drift_event_id": drift_event_id,
        "kind": item.get("kind"),
        "target": target,
        "action": action,
        "calibration_provenance": item.get("calibration_provenance", {}),
    }
    retrain_id = "retrain-" + sha256(
        json.dumps(retrain_basis, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()[:16]
    return {
        "kind": "aletheia_retrain_task",
        "retrain_id": retrain_id,
        "drift_event_id": drift_event_id,
        "drift_kind": item.get("kind"),
        "target_subsystem": target_subsystem,
        "target_skill": skill,
        "target_model_slot": target.get("model_slot"),
        "action": reason,
        "status": "queued",
        "dispatch": {
            "actor": "anima",
            "skill": skill,
            "calibration_provenance": deepcopy(item.get("calibration_provenance", {})),
        },
        "review": {
            "required": skill in {"nara-voice-training", "parashakti-ebm-head", "anuttara-constraint-discovery"},
            "commands": {
                "review": f"epi review-retrain {retrain_id}",
                "promote": f"epi promote-retrain {retrain_id}",
                "reject": f"epi reject-retrain {retrain_id}",
            },
        },
    }


def _dispatch_path(dispatch_purpose: str) -> list[dict[str, str]]:
    return [
        {
            "stage": "mythos_drift",
            "actor": "mythos",
            "dispatch_purpose": dispatch_purpose,
        },
        {
            "stage": "aletheia_proposal",
            "actor": "aletheia_drift_detection",
            "dispatch_purpose": dispatch_purpose,
        },
        {
            "stage": "tier2_review",
            "actor": "epii_review",
            "dispatch_purpose": dispatch_purpose,
        },
    ]


def _validated_slot_refs(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value:
        raise ValueError("slot_refs must contain at least one Anuttara slot handle")

    sanitized: list[dict[str, Any]] = []
    for index, slot_ref in enumerate(value):
        ref = _require_mapping(slot_ref, f"slot_refs[{index}]")
        forbidden = FORBIDDEN_SLOT_PAYLOAD_KEYS.intersection(ref.keys())
        if forbidden:
            names = ", ".join(sorted(forbidden))
            raise ValueError(
                "slot_privacy_boundary_compliance failed: "
                f"slot_refs[{index}] contains raw payload field(s): {names}"
            )
        slot_id = _require_non_blank(ref.get("slot_id"), f"slot_refs[{index}].slot_id")
        handle = _require_non_blank(ref.get("handle"), f"slot_refs[{index}].handle")
        privacy_class = _require_non_blank(
            ref.get("privacy_class"),
            f"slot_refs[{index}].privacy_class",
        )
        sanitized.append(
            {
                "slot_id": slot_id,
                "handle": handle,
                "privacy_class": privacy_class,
            }
        )
    return sanitized


def _validated_evidence_refs(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list) or not value:
        raise ValueError("evidence_refs must contain at least one source artifact")

    refs: list[dict[str, str]] = []
    for index, evidence in enumerate(value):
        ref = _require_mapping(evidence, f"evidence_refs[{index}]")
        refs.append(
            {
                "path": _require_non_blank(ref.get("path"), f"evidence_refs[{index}].path"),
                "kind": _require_non_blank(ref.get("kind"), f"evidence_refs[{index}].kind"),
            }
        )
    return refs


def _require_mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{field} must be an object")
    return value


def _require_non_blank(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} is required")
    return value.strip()


def _require_number(value: Any, field: str) -> float:
    if not isinstance(value, int | float):
        raise ValueError(f"{field} must be numeric")
    return float(value)
