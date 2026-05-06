---
coordinate: "S0.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.2 Shard: Execution Operation

## Intent

Own structured subprocess execution: args, cwd, env, timeouts, process termination, and result capture.

## Build Scope

- Accept structured `command` plus `args`; avoid string-concatenated shells.
- Enforce timeout and cleanup behavior.
- Respect permission decisions supplied by [[S4.2']].

## API / Envelope / TS

- Implements `s0.exec`.
- Consumes `s_4_permission_boundary`.
- May later emit S0 audit fields if promoted by [[S0.5']].

## Implementation Hooks

- Rust process spawning in `epi-cli`.
- Gateway/API dispatch when S3 parity is wired.

## Test Obligations

- Timeout kills the child process.
- Secret/env masking policy is not bypassed through explicit env.
- Stderr-only command remains a valid response.

## Boundaries

S0.2 performs execution after permission; it does not grant permission.
