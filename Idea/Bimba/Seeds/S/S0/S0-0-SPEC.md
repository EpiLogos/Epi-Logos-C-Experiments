---
coordinate: "S0.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.0 Shard: Executable Ground

## Intent

Own the raw executable substrate: files, executables, processes, stdin, stdout, stderr, and exit status. This is the ground beneath every `epi` command and every local API mirror.

## Build Scope

- Discover executables and filesystem paths without hidden cwd assumptions.
- Preserve stdout, stderr, and exit code as distinct facts.
- Surface process-spawn failures separately from command failures.

## API / Envelope / TS

- Supports `s0.exec`.
- Populates or relies on `s_0_workspace_root`.
- Must match `S0ExecRequest` and `S0ExecResponse`.

## Implementation Hooks

- `epi-cli/` command runtime.
- Shell/process APIs.
- Khora resolver output from [[S0.0']].

## Test Obligations

- Run a benign command and assert stdout/stderr/exit-code separation.
- Run a non-zero command and assert transport success with command failure.
- Verify cwd-sensitive execution with explicit `cwd`.

## Boundaries

S0.0 executes; it does not decide task meaning, permission, or coordinate ontology.
