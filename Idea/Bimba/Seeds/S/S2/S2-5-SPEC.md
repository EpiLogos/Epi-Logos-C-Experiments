---
coordinate: "S2.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.5 Shard: External Graph Surface

## Intent

Own adapters and operator surfaces: `epi graph`, `bimba-mcp`, export, doctor, and external graph interface.

## Build Scope

- Normalize external query/export methods into coordinate-native API.
- Keep `bimba-mcp` as external system interface, not PI internal oracle.
- Expose doctor outputs for graph readiness.

## API / Envelope / TS

- Maps `queryByCoordinate`, `queryByQLCoordinate`, `context`, `search`, `rerank`, `embed`, `chunk`, and `admin` into canonical S2/S2' methods.

## Implementation Hooks

- `epi graph`.
- `bimba-mcp`.
- depwire API surface docs.

## Test Obligations

- External adapter query returns typed result.
- Doctor detects missing Neo4j/Redis.

## Boundaries

Adapters expose S2; Epii oracle behavior belongs to [[S5']].
