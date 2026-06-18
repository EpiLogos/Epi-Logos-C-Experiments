---
name: serving-llms-vllm
description: High-throughput LLM serving with adapter-aware inference.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# serving-llms-vllm

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: High-throughput LLM serving with adapter-aware inference.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show serving-llms-vllm` and `epi skill register serving-llms-vllm` after vendoring.
