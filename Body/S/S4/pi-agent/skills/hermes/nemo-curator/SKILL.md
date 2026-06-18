---
name: nemo-curator
description: Corpus curation, deduplication, PII redaction, and quality filtering.
version: 0.1.0
tags: [hermes, ml, vendored]
platforms: [darwin, linux]
source: hermes
---

# nemo-curator

Use this vendored Hermes skill when the Epi-Logos ML skill surface needs: Corpus curation, deduplication, PII redaction, and quality filtering.

## Contract

- Keep runtime credentials in the owning model-slot or deployment config.
- Record artifacts in the Agora skill index before Anima dispatch.
- Preserve downstream skill residency; this vendored skill supplies method capability, not subsystem law.

## Verification

Run `epi skill show nemo-curator` and `epi skill register nemo-curator` after vendoring.
