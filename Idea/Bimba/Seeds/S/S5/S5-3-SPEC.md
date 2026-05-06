---
coordinate: "S5.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.3 Shard: Episodic Usage Governance

## Intent

Own [[Graphiti]] record/search/arc usage governance, reporting density, disclosure policy, and prior-episode surfacing.

## Build Scope

- Use S3' Graphiti runtime/library boundary.
- Retire sidecar-first assumptions.
- Govern arc open/close/search semantics.

## API / Envelope / TS

- Owns `s5.episodic.*`.
- Uses S3' episodic handles and temporal fields.

## Implementation Hooks

- Graphiti adapter.
- Aletheia/Epii episodic calls.

## Test Obligations

- Record/search a real episode through target adapter.
- Arc policy respects Day/NOW timing.

## Boundaries

Graphiti architecture is S3'; S5.3 owns invocation and meaning policy.
