---
name: epii-q-resonance-harvester
description: Read-only Hermes detector for high-confidence cross-namespace RESONATES_WITH promotion candidates.
---

# Epii Q Resonance Harvester

Hermes role: carry discovered resonance to the human-agent pair-development queue. This skill does not promote relations.

## Input

- `RESONATES_WITH` edges from the gnostic enrichment coordinator.
- Source and target namespaces.
- `QDetectorConfig.resonance_promotion_confidence_threshold` from configuration.
- Existing canonical Bimba relation presence.

## Detection

1. Select cross-namespace `RESONATES_WITH` edges above the configured confidence threshold.
2. Exclude edges that already have a canonical Bimba relation.
3. Emit `promotion_candidate` entries for pair-development review.

## Output

Emit `QReviewQueueEntry` JSONL only. Evidence must cite confidence and resonance endpoints.

Hen remains the canon-write authority; this detector only queues candidates.
