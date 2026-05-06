---
coordinate: "S4.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.0' Shard: Bootstrap Law

## Intent

Own the [[Khora]] carrier of [[S4.0']] inside [[ta-onta]]: bootstrap law, [[CPF]] gate, observability visibility, session readiness, lifecycle hooks, and write-edge authority.

This is not the whole [[S0]] system. It is S0/S0' internalized inside S4' so the agent can begin, see its situation, and know whether autonomous action is lawful.

## Build Scope

- Evaluate whether task can proceed autonomously.
- Surface runtime visibility.
- Preserve continuation/compaction state.

## API / Envelope / TS

- Feeds `s_4_bootstrap_context`, continuation status, and VAK readiness.

## Implementation Hooks

- `.pi/extensions/ta-onta/khora/`.
- ta-onta composite entry.
- bootstrap hooks.
- Anima VAK gate consumption.

## Test Obligations

- CPF `(00/00)` routes to clearing rather than execution.
- Continuation status is available.

## Boundaries

Bootstrap law prepares orchestration; it does not execute the task.
