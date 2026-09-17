import importlib.util
import json
from pathlib import Path

import pytest


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "compose_task.py"
DISPATCH_PATH = Path(__file__).resolve().parents[1] / "scripts" / "dispatch.py"


def load_compose_task():
    spec = importlib.util.spec_from_file_location("compose_task", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def load_dispatch():
    spec = importlib.util.spec_from_file_location("drift_dispatch", DISPATCH_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def mythos_drift_event(**overrides):
    event = {
        "source_agent": "mythos",
        "session_id": "agent:mythos:drift-01",
        "day_id": "16-06-2026",
        "dispatch_purpose": "tuning-calibration",
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
        "target_knob": {
            "key": "mythos.symbolic_protein_reading.cosmic_weather_weights",
            "privacy_class": "local-only",
            "tuning_risk_class": "A",
            "ml_trainable": True,
        },
        "evidence_window": {"pasu_count": 1},
        "actual_resolved_slot_state": "local-default",
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
            "dispatch_purpose": "tuning-calibration",
        },
        {
            "stage": "aletheia_proposal",
            "actor": "aletheia_drift_detection",
            "dispatch_purpose": "tuning-calibration",
        },
        {
            "stage": "tier2_review",
            "actor": "epii_review",
            "dispatch_purpose": "tuning-calibration",
        },
    ]
    assert proposal["anuttara_verifier"]["slot_privacy_boundary_compliance"] is True
    assert proposal["privacy"]["raw_slot_payloads_elided"] is True
    assert proposal["review_submission"]["source"] == "aletheia"
    assert proposal["review_submission"]["requires_human"] is True
    assert proposal["review_submission"]["category"] == "recursive_self_modification"
    assert proposal["review_submission"]["dispatch_purpose"] == "tuning-calibration"
    assert proposal["dispatch"] == {
        "queue": "anima",
        "dispatch_purpose": "tuning-calibration",
        "target_knob_key": "mythos.symbolic_protein_reading.cosmic_weather_weights",
        "tuning_target_knob_privacy_class": "local-only",
        "evidence_window_pasu_count": 1,
        "actual_resolved_slot_state": "local-default",
        "review_pipeline": "tuning_review",
    }


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


@pytest.mark.parametrize(
    ("override", "message"),
    [
        ({"dispatch_purpose": "calibration"}, "tuning-calibration"),
        (
            {"actual_resolved_slot_state": "cloud-opt-in"},
            "privacy-boundary-violation",
        ),
        ({"evidence_window": {"pasu_count": 2}}, "privacy-boundary-violation"),
        (
            {
                "target_knob": {
                    "key": "mythos.symbolic_protein_reading.cosmic_weather_weights",
                    "privacy_class": "local-only",
                    "tuning_risk_class": "A",
                    "ml_trainable": False,
                }
            },
            "ml_trainable",
        ),
    ],
)
def test_compose_tuning_proposal_refuses_ungoverned_calibration(override, message):
    module = load_compose_task()

    with pytest.raises(ValueError, match=message):
        module.compose_tuning_proposal(mythos_drift_event(**override))


def test_tier3_proposal_round_trips_through_the_real_dispatch_queue(tmp_path):
    composer = load_compose_task()
    dispatcher = load_dispatch()
    queue = tmp_path / "anima" / "tuning-review.jsonl"
    proposal = composer.compose_tuning_proposal(mythos_drift_event())

    receipt = dispatcher.dispatch(proposal, queue)

    assert receipt == {
        "queued": True,
        "proposal_id": proposal["proposal_id"],
        "queue": str(queue),
        "dispatch_purpose": "tuning-calibration",
    }
    queued = queue.read_text(encoding="utf-8").splitlines()
    assert len(queued) == 1
    persisted = json.loads(queued[0])
    assert persisted["proposal_id"] == proposal["proposal_id"]
    assert persisted["dispatch"]["review_pipeline"] == "tuning_review"


def test_dispatch_queue_rechecks_local_only_boundary(tmp_path):
    composer = load_compose_task()
    dispatcher = load_dispatch()
    proposal = composer.compose_tuning_proposal(mythos_drift_event())
    proposal["dispatch"]["actual_resolved_slot_state"] = "cloud-opt-in"

    with pytest.raises(ValueError, match="privacy-boundary-violation"):
        dispatcher.dispatch(proposal, tmp_path / "queue.jsonl")

    assert not (tmp_path / "queue.jsonl").exists()


def test_dispatch_queue_rejects_tuning_proposal_without_tier2_review_route(tmp_path):
    composer = load_compose_task()
    dispatcher = load_dispatch()
    proposal = composer.compose_tuning_proposal(mythos_drift_event())
    proposal["dispatch"]["review_pipeline"] = "direct_apply"
    queue = tmp_path / "queue.jsonl"

    with pytest.raises(ValueError, match="review_pipeline must be 'tuning_review'"):
        dispatcher.dispatch(proposal, queue)

    assert not queue.exists()


def test_vector_derived_tuning_can_use_cloud_opt_in_dispatch(tmp_path):
    composer = load_compose_task()
    dispatcher = load_dispatch()
    event = mythos_drift_event(
        target_knob={
            "key": "aletheia.elo.confidence_penalty_alpha",
            "privacy_class": "vector-derived",
            "tuning_risk_class": "C",
            "ml_trainable": True,
        },
        evidence_window={"pasu_count": 3},
        actual_resolved_slot_state="cloud-opt-in",
    )

    proposal = composer.compose_tuning_proposal(event)
    receipt = dispatcher.dispatch(proposal, tmp_path / "queue.jsonl")

    assert receipt["queued"] is True
    assert proposal["dispatch"]["tuning_target_knob_privacy_class"] == "vector-derived"


def test_existing_retrain_task_dispatch_contract_remains_compatible(tmp_path):
    composer = load_compose_task()
    dispatcher = load_dispatch()
    task = composer.compose_retrain_task(
        {
            "kind": "rating_trend",
            "drift_event_id": "drift-compat-01",
            "target": {"subsystem": "M2", "model_slot": "parashakti-ebm"},
            "action": {"skill": "parashakti-ebm-head", "reason": "rating drift"},
        }
    )

    receipt = dispatcher.dispatch(task, tmp_path / "retrain.jsonl")

    assert receipt["retrain_id"] == task["retrain_id"]
    assert receipt["queued"] is True
