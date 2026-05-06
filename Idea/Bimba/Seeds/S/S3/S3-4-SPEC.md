---
coordinate: "S3.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.4 Shard: Presence and Temporal Context

## Intent

Own presence, heartbeat, Day/NOW/Kairos surfacing, Redis temporal context, session close, and arc timing.

## Build Scope

- Publish live temporal state.
- Keep temporal Redis separate from S2 semantic cache.
- Support context get/set/pool at gateway runtime.

## API / Envelope / TS

- Supports `s3'.temporal.*`, `s3'.day.*`, `s3'.kairos.*`, `s3'.presence.*`, `s3'.context.*`.
- Populates temporal envelope fields.

## Implementation Hooks

- Chronos.
- gateway Redis.
- Kairos adapter.

## Test Obligations

- Day/NOW state available after connect.
- Redis temporal keys cannot collide with S2 keys.

## Boundaries

S3.4 owns live time; S1 writes temporal artifacts.
