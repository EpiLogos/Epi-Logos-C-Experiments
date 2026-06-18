---
name: weights-and-biases
description: Experiment tracking, metric lineage, and artifact provenance.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# weights-and-biases

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: Experiment tracking, metric lineage, and artifact provenance.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show weights-and-biases` and `epi skill register weights-and-biases` after vendoring.
