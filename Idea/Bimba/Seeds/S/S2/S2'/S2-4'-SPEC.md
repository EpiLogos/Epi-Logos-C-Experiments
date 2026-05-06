---
coordinate: "S2.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.4' Shard: Cache Boundary Law

## Intent

Own S2 cache key law, RedisVL semantics, context-pool caching, and exclusion from S3 temporal/session Redis.

## Build Scope

- Define S2 key prefix and value shape.
- Keep NOW/session temporal data out of S2 cache.
- Support cache pool identifiers consumed by S4.

## API / Envelope / TS

- Populates S2 cache/context fields retained in the envelope.
- Coordinates with `s5'.kbase.pool`.

## Implementation Hooks

- Redis.
- RedisVL.
- kbase pool bridge.

## Test Obligations

- Key namespace collision test with S3 prefixes.
- Cache invalidation on source drift.

## Boundaries

Cache law is S2'; temporal authority is [[S3']].
