---
name: aletheia-elo-rating
description: Multi-channel Bradley-Terry and TrueSkill-style rating math for Mercurius skill calibration.
version: 0.1.0
tags: [aletheia, elo, mercurius, ml]
dependencies: [Body/S/S3/spacetime-context/schemas/elo-runtime.sql]
---

# aletheia-elo-rating

Use this skill when Aletheia needs to update or audit coordinate-conditional ratings for agents, models, harnesses, and skills.

## Contract

- Load all thresholds and rating hyperparameters from `~/.epi-logos/config.toml` sections `[aletheia.elo]` and `[aletheia.drift_detection]`.
- Refuse to run when a required key is missing.
- Persist state through the `mercurius_elo_ratings` family declared in `Body/S/S3/spacetime-context/schemas/elo-runtime.sql`.
- Keep the three rating channels independent: `R_verifier`, `R_lens`, `R_user`.

## Entrypoints

- `scripts/bradley_terry_update.py`
- `scripts/trueskill_update.py`
- `scripts/confidence_interval.py`
- `scripts/query.py`
- `scripts/audit.py`
