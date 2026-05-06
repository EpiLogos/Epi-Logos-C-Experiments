---
coordinate: "S3.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.3' Shard: State Projection and Broadcast

## Intent

Own state projection, broadcast semantics, SpacetimeDB reducer boundary, and session/presence mirroring.

## Build Scope

- Name Universal NOW as target state until proven.
- Keep one-way local sink distinct from live shared plane.
- Define reducer boundary if SpacetimeDB is active.

## API / Envelope / TS

- Feeds temporal subscriptions and app bridge state.

## Implementation Hooks

- SpacetimeDB bridge.
- local sink events.
- gateway broadcast.

## Test Obligations

- Broadcast event reaches subscriber.
- Target-state features are marked not-ready until networked path passes.

## Boundaries

Projection is S3'; content meaning is S4/S5.
