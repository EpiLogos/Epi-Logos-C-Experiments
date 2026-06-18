---
name: huggingface-accelerate
description: Distributed and mixed-device training launch surface via Accelerate.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# huggingface-accelerate

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: Distributed and mixed-device training launch surface via Accelerate.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show huggingface-accelerate` and `epi skill register huggingface-accelerate` after vendoring.
