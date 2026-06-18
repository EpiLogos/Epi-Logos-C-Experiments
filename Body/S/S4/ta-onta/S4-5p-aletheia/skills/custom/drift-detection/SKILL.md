---
name: aletheia-drift-detection
description: Config-gated drift diagnosis and retrain task composition for the autoresearch loop.
version: 0.1.0
tags: [aletheia, drift-detection, retrain, ml]
dependencies: [aletheia-elo-rating, Body/S/S3/spacetime-context/schemas/retrain-loop.sql]
---

# aletheia-drift-detection

Use this skill when Mercurius rating state, veto patterns, coverage gaps, or verifier-violation rates indicate calibration drift.

## Contract

- Refuse daemon startup when any required `[aletheia.drift_detection]` or `[aletheia.elo]` config key is missing.
- Diagnose rating-trend, veto-pattern, coverage, and verifier-violation drift from real event payloads.
- Compose retrain tasks for Anima with calibration provenance.
- Route Nara drift to `nara-voice-training`, Parashakti EBM drift to `parashakti-ebm-head`, and verifier violations to `anuttara-constraint-discovery` or developer review.
