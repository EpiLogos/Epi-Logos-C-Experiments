---
coordinate: "S2.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.0' Shard: Coordinate Substrate Law

## Intent

Own coordinate parsing, normalization, and substrate law for graph-backed entities.

## Build Scope

- Normalize old `#` / bimbaCoordinate format as M-branch coordinate input.
- Preserve canonical coordinate strings.
- Reject ambiguous coordinate writes.

## API / Envelope / TS

- Supports `s2'.coordinate.resolve`.
- Feeds coordinate-aware retrieval.

## Implementation Hooks

- coordinate parser.
- graph node identity.

## Test Obligations

- Resolve legacy and canonical coordinate forms.
- Fail ambiguous coordinate input.

## Boundaries

Coordinate resolution is graph law; VAK intent belongs to [[S4']].
