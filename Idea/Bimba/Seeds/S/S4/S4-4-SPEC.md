---
coordinate: "S4.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.4 Shard: Psyche and Context

## Intent

Own [[Psyche]] state, context-pack assembly, goals, scope, live trace, and inhabited task-world continuity.

## Build Scope

- Define `s4'.psyche.state/update` lifecycle.
- Assemble context from S2/S5 sources without performing retrieval itself.
- Track goals and scope durably enough for handoff.

## API / Envelope / TS

- Supports `s4'.context.assemble`, `s4'.psyche.*`, `s4'.goal.*`.
- Populates lived-environs and execution fields.

## Implementation Hooks

- context assembler.
- Psyche state store.
- goal store.

## Test Obligations

- Context assembly consumes real source handles.
- Psyche update persists and returns typed state.

## Boundaries

Psyche inhabits context; S2/S5 produce source pools.
