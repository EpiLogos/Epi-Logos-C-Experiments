---
coordinate: "S0.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.3' Shard: Reflected Workflow Law

## Intent

Own the reflective law for terminal patterns, cmux/tmux surfaces, workflow templates, and repeatable local operator shapes.

## Build Scope

- Define layout creation, destruction, focus, and listing semantics.
- Keep headless and interactive modes distinct.
- Preserve Anima/Epii two-window target without forcing it before gateway readiness.

## API / Envelope / TS

- Owns `s0'.cmux.list`, `s0'.cmux.surface`, `s0'.cmux.focus`.
- Populates `s_0_terminal_substrate`.

## Implementation Hooks

- cmux/tmux commands.
- `epi up` terminal orchestration.

## Test Obligations

- Typed empty surface when unavailable.
- Real topology listing when available.

## Boundaries

Terminal topology is not team topology; [[S4']] owns agent composition.
