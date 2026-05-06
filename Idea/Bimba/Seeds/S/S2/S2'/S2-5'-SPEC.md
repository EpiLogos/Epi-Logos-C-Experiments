---
coordinate: "S2.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.5' Shard: Graph Interface Parity

## Intent

Own S2/S2' parity for external graph interfaces, CLI mirrors, doctor/export, and API/TS mapping.

## Build Scope

- Map depwire and bimba-mcp exports to canonical methods.
- Keep external system interface separate from PI internal oracle.
- Produce implementation readiness reports.

## API / Envelope / TS

- Requires parity for context, spec, search, rerank, disclosure, embed, chunk, and admin surfaces.

## Implementation Hooks

- `bimba-mcp`.
- `epi graph`.
- depwire API surface.

## Test Obligations

- Parity matrix catches unmapped external method.
- Export includes coordinate and provenance.

## Boundaries

S2.5' exposes graph law; S5' interprets it for users.
