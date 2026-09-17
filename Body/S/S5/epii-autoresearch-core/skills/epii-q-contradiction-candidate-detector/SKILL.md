---
name: epii-q-contradiction-candidate-detector
description: Read-only Hermes detector for dialectical q_ contradiction candidates along canonical Bimba relations.
---

# Epii Q Contradiction Candidate Detector

Hermes role: surface a possible tension for pair review. This skill does not decide truth, resolve contradiction, or write canon.

## Input

- A crystallised Bimba `CorpusSnapshot`.
- Canonical Bimba relation edges.
- `q_3_{i?}_dialectical_movement` text on relation endpoints.
- 3072-dimensional embeddings and configured disagreement threshold.

## Detection

1. Traverse node pairs joined by canonical relations.
2. Read each endpoint's dialectical movement q-text.
3. Compare vector disagreement and textual divergence.
4. Emit a `contradiction_candidate` when disagreement exceeds the configured threshold.

## Output

Emit `QReviewQueueEntry` JSONL only. Evidence must cite the relation family and target partner.

The detector is read-only: no corpus mutation, no relation mutation, no q-value rewrite.
