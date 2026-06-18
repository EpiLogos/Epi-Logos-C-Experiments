import importlib.util
from pathlib import Path

import pytest


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "compose_task.py"


def load_compose_task():
    spec = importlib.util.spec_from_file_location("compose_task", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def mythos_drift_event(**overrides):
    event = {
        "source_agent": "mythos",
        "session_id": "agent:mythos:drift-01",
        "day_id": "16-06-2026",
        "dispatch_purpose": "tier3_ml_training_hook",
        "drift_signal": {
            "kind": "reward_metric_regression",
            "metric_name": "mythos_pattern_reward",
            "current_value": 0.51,
            "minimum_acceptable_value": 0.74,
            "window_id": "mythos-patterns-2026w25",
        },
        "evidence_refs": [
            {
                "path": "Idea/Empty/Present/16-06-2026/agent-mythos/drift.json",
                "kind": "drift_report",
            }
        ],
        "target_surface": "M3/Mahamaya",
        "rollback_handle": "rollback://mahamaya/runtime/mythos-patterns-2026w25",
        "integration_impact_uri": "Idea/Pratibimba/System/impact/mythos-patterns-2026w25.md",
        "slot_refs": [
            {
                "slot_id": "anuttara:R3:T7",
                "privacy_class": "review_gate",
                "handle": "slot://anuttara/R3/T7/mythos-patterns-2026w25",
            }
        ],
        "vak_address": {
            "cpf": "(4.0/1-4.4/5)",
            "ct": ["CT3"],
            "cp": "CP4.3",
            "cf": "(0/1/2/3)",
            "cfp": "CFP0",
            "cs": {"code": "CS3", "direction": "Day"},
        },
    }
    event.update(overrides)
    return event


def test_compose_tuning_proposal_routes_mythos_drift_to_tier2_review():
    module = load_compose_task()

    proposal = module.compose_tuning_proposal(mythos_drift_event())

    assert proposal["kind"] == "aletheia_tuning_proposal"
    assert proposal["source_agent"] == "aletheia"
    assert proposal["origin"]["source_agent"] == "mythos"
    assert proposal["tuning_contract"]["tier"] == 3
    assert proposal["tuning_contract"]["auto_apply"] is False
    assert proposal["review_gate"] == {
        "tier": 2,
        "required": True,
        "status": "pending",
        "resolver": "epii_review",
    }
    assert proposal["dispatch_path"] == [
        {
            "stage": "mythos_drift",
            "actor": "mythos",
            "dispatch_purpose": "tier3_ml_training_hook",
        },
        {
            "stage": "aletheia_proposal",
            "actor": "aletheia_drift_detection",
            "dispatch_purpose": "tier3_ml_training_hook",
        },
        {
            "stage": "tier2_review",
            "actor": "epii_review",
            "dispatch_purpose": "tier3_ml_training_hook",
        },
    ]
    assert proposal["anuttara_verifier"]["slot_privacy_boundary_compliance"] is True
    assert proposal["privacy"]["raw_slot_payloads_elided"] is True
    assert proposal["review_submission"]["source"] == "aletheia"
    assert proposal["review_submission"]["requires_human"] is True
    assert proposal["review_submission"]["category"] == "recursive_self_modification"
    assert proposal["review_submission"]["dispatch_purpose"] == "tier3_ml_training_hook"


def test_compose_tuning_proposal_rejects_raw_slot_payloads():
    module = load_compose_task()
    event = mythos_drift_event(
        slot_refs=[
            {
                "slot_id": "anuttara:R3:T7",
                "privacy_class": "review_gate",
                "handle": "slot://anuttara/R3/T7/mythos-patterns-2026w25",
                "raw_payload": "protected slot body text must not cross this boundary",
            }
        ]
    )

    with pytest.raises(ValueError, match="slot_privacy_boundary_compliance"):
        module.compose_tuning_proposal(event)


def test_compose_tuning_proposal_does_not_surface_when_threshold_is_satisfied():
    module = load_compose_task()
    event = mythos_drift_event(
        drift_signal={
            "kind": "reward_metric_regression",
            "metric_name": "mythos_pattern_reward",
            "current_value": 0.8,
            "minimum_acceptable_value": 0.74,
            "window_id": "mythos-patterns-2026w25",
        }
    )

    assert module.compose_tuning_proposal(event) is None
