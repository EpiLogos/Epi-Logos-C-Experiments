---
coordinate: "S5.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.3' Shard: Episodic Pattern Governance

## Intent

Own episodic usage patterns, Graphiti search/record/arc governance, memory weave, and prior-episode surfacing.

## Build Scope

- Govern when to record and when to search.
- Preserve arc policy and reporting density.
- Use S3' temporal architecture without owning it.

## API / Envelope / TS

- Supports `s5.episodic.*` policy and episodic envelope fields.

## Implementation Hooks

- Graphiti adapter.
- Moirai memory weave target.

## Test Obligations

- Search respects arc/time filters.
- Reporting density changes capture behavior.

## Boundaries

S5.3' governs use; S3' owns runtime.
