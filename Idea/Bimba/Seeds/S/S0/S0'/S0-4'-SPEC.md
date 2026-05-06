---
coordinate: "S0.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.4' Shard: CLI Context Frame

## Intent

Own reflective runtime context: environment config, workspace frame, QV/session injection, and interactive tool boundaries.

## Build Scope

- Define what context S0 may surface at bootstrap.
- Keep interactive selectors human-in-the-loop only.
- Separate runtime context from [[VAK]] task context.

## API / Envelope / TS

- Supports `s0.env` and `s0.tool_surface`.
- Populates `s_0_env_config` and `s_0_workspace_root`.

## Implementation Hooks

- env/base config.
- workspace detection.
- zoxide and PATH facts.

## Test Obligations

- Headless mode never blocks on interactive selectors.
- Env output masks secrets.

## Boundaries

S0.4' supplies runtime facts; [[S4']] supplies CPF/CT/CP/CF/CFP/CS.
