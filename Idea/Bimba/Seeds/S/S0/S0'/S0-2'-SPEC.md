---
coordinate: "S0.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.2' Shard: Permissioned Execution Contract

## Intent

Own the reflective execution contract: S0 can run commands only through S4 permission boundaries and declared sandbox intent.

## Build Scope

- Define pre-exec permission checks.
- Preserve structured args and env boundaries.
- Record denied execution as a typed result.

## API / Envelope / TS

- Consumes `s_4_permission_boundary`.
- Supports `s0.exec` failure modes.

## Implementation Hooks

- S4 permission source.
- S0 process spawning.

## Test Obligations

- Denied command does not spawn.
- Approved benign command does spawn.
- Denial shape is distinguishable from process failure.

## Boundaries

Authority belongs to [[S4.2']]; S0.2' enforces the received boundary.
