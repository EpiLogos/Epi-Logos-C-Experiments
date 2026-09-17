---
name: epii-q-stale-by-non-revisit-detector
description: Read-only Hermes detector for q_/qm_ review epochs stale against graph revision.
---

# Epii Q Stale By Non-Revisit Detector

Hermes role: mark where time has moved and review has not. This skill only queues re-review candidates.

## Input

- A crystallised Bimba `CorpusSnapshot`.
- Current `graph_revision`.
- Node `qm_{n}_{i?}_review_epoch` stamps.
- `QDetectorConfig.stale_revision_threshold` from configuration.

## Detection

1. Read the latest review epoch on each node.
2. Compare it with the current graph revision.
3. Emit `stale_by_non_revisit` only when the revision delta is greater than the configured threshold.

## Output

Emit `QReviewQueueEntry` JSONL only. The entry flags re-review; it is not invalidation and not canon mutation.

No hardcoded threshold is allowed in runtime use; callers supply configuration.
