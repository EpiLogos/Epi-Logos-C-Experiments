---
name: huggingface-hub
description: Model, dataset, and artifact distribution through the Hugging Face Hub.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# huggingface-hub

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: Model, dataset, and artifact distribution through the Hugging Face Hub.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show huggingface-hub` and `epi skill register huggingface-hub` after vendoring.
