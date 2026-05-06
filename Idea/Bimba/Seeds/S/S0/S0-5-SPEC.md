---
coordinate: "S0.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.5 Shard: Bootstrap and Return

## Intent

Own the return surface where higher-layer design becomes executable: build, install, bootstrap, `epi up`, audit, and parity evidence.

## Build Scope

- Make full-stack bootstrap explicit and testable.
- Track command/API/envelope/TS parity evidence.
- Decide whether S0 return audit fields enter the next canonical schema.

## API / Envelope / TS

- Candidate future fields: `s_0_session_exit_code`, `s_0_tool_resolution_log`.
- Feeds global parity manifest from [[S-SYSTEM-INDEX]].

## Implementation Hooks

- `epi up`.
- package/build commands.
- gateway/app/agent bootstrap checks.

## Test Obligations

- Bootstrap reports each layer without hiding partial failure.
- Audit output is stable enough for tests.
- Parity manifest detects missing command/API/type mappings.

## Boundaries

S0.5 reports readiness; it does not claim higher-layer systems are complete until their own tests pass.
