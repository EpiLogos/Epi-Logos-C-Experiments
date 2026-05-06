---
coordinate: "S3.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.5' Shard: Return Integration Law

## Intent

Own app projection, history/close/activity projection, cross-system broadcast, and [[Graphiti]] runtime boundary.

## Build Scope

- Treat Graphiti as S3' runtime/library architecture.
- Keep current FastAPI wrapper as adapter only.
- Surface app/device/product state without owning S5 meaning.

## API / Envelope / TS

- Feeds episodic handle fields and app bridge status.

## Implementation Hooks

- `graphiti-core` adapter.
- app bridge.
- gateway logs/activity.

## Test Obligations

- Graphiti adapter can record/search through target boundary.
- Wrapper dependency is optional or clearly transitional.

## Boundaries

S3.5' owns runtime boundary; S5/S5' owns invocation, disclosure, and reflection.
