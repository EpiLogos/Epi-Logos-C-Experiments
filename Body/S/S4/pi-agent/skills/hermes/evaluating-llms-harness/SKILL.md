---
name: evaluating-llms-harness
description: lm-eval-harness style benchmark and held-out evaluation workflows.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# evaluating-llms-harness

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: lm-eval-harness style benchmark and held-out evaluation workflows.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show evaluating-llms-harness` and `epi skill register evaluating-llms-harness` after vendoring.
