---
name: peft-fine-tuning
description: LoRA, QLoRA, and other parameter-efficient fine-tuning methods.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# peft-fine-tuning

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: LoRA, QLoRA, and other parameter-efficient fine-tuning methods.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show peft-fine-tuning` and `epi skill register peft-fine-tuning` after vendoring.
