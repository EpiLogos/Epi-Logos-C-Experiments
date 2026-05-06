---
coordinate: "S3.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.4' Shard: Chronos Temporal Law

## Intent

Own [[Chronos]] law for [[Day]], [[NOW]], [[Kairos]], temporal context, presence, and arc timing.

## Build Scope

- Publish temporal state.
- Open/close Day.
- Fetch/status/natal Kairos.
- Maintain Redis temporal context.

## API / Envelope / TS

- Owns `s3'.temporal.*`, `s3'.day.*`, `s3'.kairos.*`, `s3'.presence.*`, `s3'.context.*`.

## Implementation Hooks

- Chronos extension.
- Kairos adapter.
- Redis temporal namespace.

## Test Obligations

- Temporal state includes Day and NOW.
- Kairos fetch is typed and failure-safe.

## Boundaries

Chronos owns temporal facts; Hen owns vault form.
