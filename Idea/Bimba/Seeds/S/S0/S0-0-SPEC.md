---
coordinate: "S0.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S0-SOURCE-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S0]]"
  - "[[S0']]"
---

# S0.0 Shard: Executable Ground

## Canonical Role

[[S0.0]] is the [[P0]] / [[CT0]] / [[L0]] ground of [[S0]]: the concrete addressability of files, executables, processes, stdin, stdout, stderr, and exit status. It owns executable honesty before any higher [[S1]]-[[S5]] semantic layer can claim completion. Its boundary is deliberately small: expose material spawn and filesystem facts, but do not infer task meaning, coordinate target, residency, graph law, gateway semantics, or agent authority.

## Source And Diagram Anchors

Primary anchors: [[S0-SPEC]], [[S0-SHARD-INDEX]], [[S-SYSTEM-INDEX]], [[S-SOURCE-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]], [[S0]], and [[S0']]. World/MOC anchors: `Idea/Bimba/World/Types/Coordinates/S/S0/S0.md` and `Idea/Bimba/World/Types/Coordinates/S/S0/S0.canvas`. Migrated sources: [[S0-S0i-CLI-CORE]], [[S_Series_Master_CLI_Architecture]], [[2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger]], plus the historical [[S0-0]] resource under `Legacy/resources/s-deprecated/S0-0.md`.

No diagram delta: this shard reinforces the existing [[S0]] command-membrane node in Diagram 2 rather than changing ownership.

## Current Body Reality

The live command membrane enters through `Body/S/S0/epi-cli/src/main.rs`, where the `epi` root command dispatches concrete command families. Process execution appears in `Body/S/S0/epi-cli/src/up.rs` through `std::process::Command`, `run_command_capture`, repo-root env hydration, and gateway/app/cmux startup. Session filesystem ground is in `Body/S/S0/epi-cli/src/sesh/session.rs`, which resolves repo/vault state, creates [[NOW]] files, and writes `.epi/session.json`. The kernel ground also includes `Body/S/S0/epi-lib/include/*.h`, `Body/S/S0/epi-lib/src/*.c`, and `Body/S/S0/portal-core/src/kernel.rs`, but those are low-level bedrock/profile substrates, not permission to absorb [[M']] or [[S5]] semantics into S0.

## Build Contract

S0.0 must expose structured executable ground:

- Commands are represented as binary plus args, never opaque shell strings when a typed API is possible.
- cwd, env, stdout, stderr, exit code, and process-spawn failure remain separate facts.
- Filesystem creation and reads must name their root: repo, vault, home, gate state, or temp.
- S0.0 may return a failed exit status as a valid command result; transport failure is a different condition.

## API / Envelope / Implementation Hooks

Target API: `s0.exec` with `S0ExecRequest` / `S0ExecResponse` from [[S0-SPEC]]. Runtime envelope participation: `s_0_workspace_root`, process streams, and future audit fields only if [[S0.5']] promotes them. Code hooks: `main.rs`, `up.rs`, `sesh/session.rs`, `techne/mod.rs`, `vault/paths.rs`, and `portal-core` kernel projection surfaces.

## Test Obligations

Real tests should include `Body/S/S0/epi-cli/tests/up_command.rs`, `session_lifecycle.rs`, `profile_cli_contract.rs`, `kernel_ffi_contract.rs`, and `portal-core/tests/kernel_math.rs`. Required additions remain: a direct structured benign command test, a non-zero exit-code test that does not report transport failure, and a cwd-sensitive execution test from a nested directory.

## Open Gaps

The target `s0.exec` API is specified, but the live gateway still exposes product/runtime methods such as `exec.approval.*`; this is an [[S3]] parity and [[S4']] permission integration gap, not proof that S0.0 should invent a private route table. Audit fields such as `s_0_session_exit_code` are still future law.

## Boundaries

[[S0.0]] executes. [[S0.2']] enforces received permission posture. [[S1']] owns vault write law. [[S2]] owns graph persistence. [[S3]] owns gateway routing. [[S4']] owns approval/capability authority. [[S5']] owns review and autoresearch meaning.
