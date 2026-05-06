---
coordinate: "S4.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.0 Shard: Agent Runtime Bootstrap

## Intent

Own PI runtime bootstrap, session init, hook seams, env propagation, and observability mode.

## Build Scope

- Start agent runtime with declared model/provider context.
- Surface bootstrap context.
- Keep compatibility paths distinct from source-of-truth plugin paths.

## API / Envelope / TS

- Supports `s4.agent.status`.
- Populates `s_4_bootstrap_context` and `s_4_observability_mode`.

## Implementation Hooks

- `epi agent`.
- `.pi/extensions/ta-onta`.
- plugin runtime.

## Test Obligations

- Runtime status reports real provider/auth state.
- Bootstrap context is present in envelope.

## Boundaries

S4.0 starts runtime; S4' inhabits it.
