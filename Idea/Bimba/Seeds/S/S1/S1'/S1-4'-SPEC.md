---
coordinate: "S1.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.4' Shard: Temporal Artifact Law

## Intent

Own the vault-side law for [[Day]] and [[NOW]] artifacts and the handoff to [[Chronos]].

## Build Scope

- Prevent singular-global-NOW drift.
- Create per-session NOW folders under Day.
- Preserve backlinks and provenance.

## API / Envelope / TS

- Provides vault artifacts consumed by `connect` and `s3'.day.*`.
- Feeds temporal residency fields.

## Implementation Hooks

- Hen NOW creation.
- Chronos day/session state.

## Test Obligations

- Multiple NOW children under one Day.
- Backlinks from NOW to Day and session.

## Boundaries

S1.4' anchors time in vault; S3' owns live temporal state.
