---
name: llama-cpp
description: GGUF quantization and local inference, including Apple-Silicon paths.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# llama-cpp

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: GGUF quantization and local inference, including Apple-Silicon paths.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show llama-cpp` and `epi skill register llama-cpp` after vendoring.
