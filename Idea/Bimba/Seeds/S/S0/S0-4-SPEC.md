---
coordinate: "S0.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.4 Shard: Runtime Context

## Intent

Own local runtime context: cwd, workspace root, PATH, env config, zoxide hints, and session-local shell facts.

## Build Scope

- Resolve workspace root deterministically.
- Read non-secret env config and mask protected values.
- Keep runtime facts separate from task facts.

## API / Envelope / TS

- Implements `s0.env`.
- Populates `s_0_workspace_root` and `s_0_env_config`.
- Uses `S0EnvRequest` / `S0EnvResponse`.

## Implementation Hooks

- Shell environment.
- `~/.epi-logos/env/base.env`.
- varlock or equivalent secret boundary.

## Test Obligations

- Known non-secret variable is returned.
- Protected variable is masked without authority.
- Workspace root resolution is stable from nested directories.

## Boundaries

S0.4 describes environment. It does not determine coordinate target or residency.
