---
coordinate: "S4.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.5 Shard: Subagent and Crystallisation Trigger

## Intent

Own durable subagent orchestration, lineage, synthesis, thought routing, crystallisation trigger, and Aletheia membrane handling.

## Build Scope

- Route thoughts to T-buckets.
- Preserve subagent lineage.
- Trigger crystallisation without absorbing Epii governance.

## API / Envelope / TS

- Supports `s4'.thought.*`, `s4'.crystallise`, `s4'.notify_user`.
- Produces review material for S5' inbox.

## Implementation Hooks

- Aletheia extension.
- thought routing.
- subagent lineage store.

## Test Obligations

- Thought route creates durable artifact.
- Crystallise produces reviewable handoff.

## Boundaries

Aletheia is S4.5' membrane; Epii is S5' deep governance.
