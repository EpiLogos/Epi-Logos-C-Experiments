---
coordinate: "S4.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.3 Shard: Thread and Dispatch Patterns

## Intent

Own thread patterns, team/chain/subagent execution, dispatch law, and Day/NOW pathing.

## Build Scope

- Separate parallel dispatch from chain/fusion execution.
- Define pipeline handoff and callback semantics.
- Preserve Day/NOW context in spawned work.

## API / Envelope / TS

- Supports `s4'.team.*`, `s4.agent.query`, `s4.agent.notify`.
- Feeds execution and lived-environs layers.

## Implementation Hooks

- agent-team.
- agent-chain.
- subagent runtime.
- OMX team/pipeline concepts.

## Test Obligations

- Parallel team returns all expected results.
- Chain/fusion preserves order and handoff payload.

## Boundaries

S4.3 dispatches; Epii review belongs to S5'.
