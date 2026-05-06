---
coordinate: "S2.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.1' Shard: Relation and Type Law

## Intent

Own coordinate-aware relation registry, graph type law, and node/edge semantic constraints.

## Build Scope

- Define relation kinds and allowed coordinate domains.
- Preserve node/edge provenance.
- Keep raw graph schema and lawful graph semantics in sync.

## API / Envelope / TS

- Supports graph context and node response types.
- Requires deliberate split between raw S2 and lawful S2' response shapes.

## Implementation Hooks

- Neo4j constraints.
- relation registry.
- dataset imports.

## Test Obligations

- Invalid relation type is rejected.
- Context query includes relation provenance.

## Boundaries

S2.1' validates graph law; S1 validates vault form.
