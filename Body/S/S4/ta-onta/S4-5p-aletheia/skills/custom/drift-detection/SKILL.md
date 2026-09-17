---
name: aletheia-drift-detection
description: Config-gated drift diagnosis and retrain task composition for the autoresearch loop.
version: 0.1.0
tags: [aletheia, drift-detection, retrain, ml]
dependencies: [aletheia-elo-rating, Body/S/S3/spacetime-context/schemas/retrain-loop.sql]
---

# aletheia-drift-detection

## Coordinate Header

| Field | Value |
|---|---|
| Coordinate | `S4-5'` |
| Residency | `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/SKILL.md` |
| Position (#n) | #5 — Integration / world-return handoff |
| Actualises | [[S4-5'-SPEC]], [[M5-4']], [[M'-ML-SKILL-SURFACE-SPEC]], and [[DR-TUNE-4]] |
| Public surface | `compose_tuning_proposal`, `compose_retrain_task`, and governed JSONL `dispatch` |
| Does NOT own | Training execution, runtime knob mutation, Anima policy, or Tier 2 review resolution |

Use this skill when Mercurius rating state, veto patterns, coverage gaps, or verifier-violation rates indicate calibration drift.

## Contract

- Refuse daemon startup when any required `[aletheia.drift_detection]` or `[aletheia.elo]` config key is missing.
- Diagnose rating-trend, veto-pattern, coverage, and verifier-violation drift from real event payloads.
- Compose retrain tasks for Anima with calibration provenance.
- Compose Tier 3 tuning proposals only for schema-declared `ml_trainable` knobs; stamp `dispatch_purpose: tuning-calibration` and route them into Tier 2 `tuning_review` rather than applying values.
- Emit and recheck `tuning_target_knob_privacy_class`, `evidence_window_pasu_count`, and `actual_resolved_slot_state` at the queue boundary. `local-only` proposals require a `local-default` slot and evidence from at most one PASU.
- Route Nara drift to `nara-voice-training`, Parashakti EBM drift to `parashakti-ebm-head`, and verifier violations to `anuttara-constraint-discovery` or developer review.
