---
coordinate: "S2.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.0 Shard: Graph Substrate Bootstrap

## Intent

Own raw Neo4j and Redis bootstrap, health, driver sessions, docker lifecycle, and connection diagnostics.

## Build Scope

- Start and verify Neo4j and Redis without conflating their roles.
- Expose health and doctor results.
- Keep external-service failures explicit.

## API / Envelope / TS

- Supports `s2.graph.*` readiness.
- Feeds graph/cache handles used by S2' retrieval.

## Implementation Hooks

- `epi graph`.
- Neo4j driver.
- Redis client.
- Docker compose where used.

## Test Obligations

- Real Neo4j connectivity test.
- Real Redis connectivity test.
- Failure reports distinguish Neo4j from Redis.

## Boundaries

S2.0 provides substrate health; it does not own S3 session Redis.
