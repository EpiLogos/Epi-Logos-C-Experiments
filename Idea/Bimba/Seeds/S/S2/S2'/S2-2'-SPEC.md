---
coordinate: "S2.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.2' Shard: Semantic Lifecycle Law

## Intent

Own `q_*` extraction, semantic-document hashing, embedding version drift, and changed-node-only refresh.

## Build Scope

- Define extraction fields and hash inputs.
- Record embedding model/version/dimension.
- Prevent stale embedding reuse.

## API / Envelope / TS

- Supports enrich and embedding lifecycle methods.
- Feeds retrieval freshness metadata.

## Implementation Hooks

- semantic graph lifecycle plan.
- embedding provider.
- RedisVL bridge.

## Test Obligations

- Changed `q_*` fields trigger refresh.
- Embedding version bump marks stale nodes.

## Boundaries

S2.2' manages semantic freshness; S5 chooses retrieval strategy.
