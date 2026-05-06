---
coordinate: "S2.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.4 Shard: Semantic Cache

## Intent

Own Redis/RedisVL semantic cache, cache tiering, invalidation, and retrieval-context keys.

## Build Scope

- Define S2 cache key namespace.
- Implement RedisVL bridge where required.
- Invalidate cache on source or embedding version changes.

## API / Envelope / TS

- Populates S2 context/cache fields where retained.
- Must not claim S3 temporal context keys.

## Implementation Hooks

- Redis.
- RedisVL.
- semantic cache layer.

## Test Obligations

- Cache hit/miss behavior over real Redis.
- Invalidation after content hash change.
- S2 keys cannot collide with S3 keys.

## Boundaries

S2.4 owns semantic cache; [[S3']] owns session and temporal Redis.
