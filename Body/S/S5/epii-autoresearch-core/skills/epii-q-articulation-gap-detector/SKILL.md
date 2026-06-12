---
name: epii-q-articulation-gap-detector
description: Read-only Hermes detector for q_ articulation gaps across Bimba peer clusters.
---

# Epii Q Articulation Gap Detector

Hermes role: carry a pattern signal from corpus to review queue. This skill is not a canon writer, not a proposal author, and not an autonomous reviewer.

## Input

- A crystallised Bimba `CorpusSnapshot`.
- `QDetectorConfig.articulation_gap_peer_ratio` from configuration.
- 3072-dimensional node embeddings.

## Detection

1. Cluster nodes by `(c_4_family, c_4_ql_position, c_4_lens)`.
2. For each node, compare its `q_*_{i?}_*` keys against its peers in the cluster.
3. Emit an `articulation_gap` candidate when at least the configured peer ratio carries a q-key that the target node lacks.

## Output

Emit `QReviewQueueEntry` JSONL only:

```json
{"target_coordinate":"M5-4","q_key":"q_5_i0_integration_template","reason_class":"articulation_gap","evidence_refs":[],"priority":0}
```

The detector must not mutate corpus nodes, q-values, review epochs, graph edges, or canon files.
