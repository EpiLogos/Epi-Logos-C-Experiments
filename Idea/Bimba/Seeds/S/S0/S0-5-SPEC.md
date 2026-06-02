---
coordinate: "S0.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.5 Shard: Bootstrap and Return

## Canonical Role

[[S0.5]] is the [[P5]] / [[CT5]] / [[L5]] integration and return surface of [[S0]]: build, package, install, bootstrap, readiness, audit evidence, and the point where higher-layer promises return as runnable substrate.

## Source And Diagram Anchors

Anchors: [[S0-SPEC]], [[S0'-SPEC]], [[S0-5'-SPEC]], [[S0-HARMONIC-POINTER-WEB36-SPEC]], [[S0-CODON-ROTATION-PROJECTION-SPEC]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[KernelBridge]], and [[MathemeHarmonicProfile]]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S0-QV-PIPELINE-AND-PLUGIN]], [[S_Series_Master_CLI_Architecture]], historical [[S0-5]], and Track 01 kernel bridge plan `[[01-kernel-bridge-and-s0-foundation]]`.

## Current Body Reality

`Body/S/S0/epi-cli/src/up.rs` is the current bootstrap return path. It creates/loads session state, validates [[NOW]], starts graph/gateway sidecars when enabled, launches cmux/app surfaces, and emits JSON or human summaries. `Body/S/S0/epi-cli/Cargo.toml`, `build.rs`, `schemas/package.json`, `Body/S/S0/portal-core/Cargo.toml`, and `Body/S/S0/epi-lib/test/test_artifact_paths.sh` are build/package evidence. `Body/S/S0/epi-cli/src/gate/parity.rs` and `contract-inventory/s0-membrane-inventory.json` are return evidence for S0 membrane cleanup.

## Build Contract

- `epi up` must report each layer separately and must not hide partial failure.
- Bootstrap summaries must be deterministic enough for tests and review evidence.
- Build/install paths must be reproducible from repo root.
- Parity evidence must link method, CLI mirror, owner coordinate, authority path, adapter path, status, and test evidence.
- S0.5 may report readiness; it may not certify [[S1]]-[[S5]] completion without their tests.

## API / Envelope / Implementation Hooks

Candidate future fields: `s_0_session_exit_code`, `s_0_tool_resolution_log`, and bootstrap summary handles. Hooks: `up.rs`, `gate/preflight.rs`, `gate/parity.rs`, `contract-inventory`, `portal/surfaces.rs`, `schemas`, `epi-lib` tests, and `portal-core` contract tests.

## Test Obligations

Existing: `up_command.rs`, `gate_release_gate.rs`, `gate_full_parity_contract.rs`, `s0_membrane_guardrails.rs`, `kernel_api_envelope_contract.rs`, `kernel_bridge_runtime_contract.rs`, `portal_surfaces_contract.rs`, and `portal-core/tests/*`. Required: parity-manifest regression that fails when an accepted API lacks CLI/gateway/type status.

## Open Gaps

The S0 return audit is still distributed across JSON output, parity records, inventory, and test suites. A single canonical S/S' parity artifact remains target work from [[S-SYSTEM-INDEX]].

## Boundaries

[[S0.5]] returns system readiness as evidence. [[S0.5']] reflects and audits that evidence. [[Aletheia]] / [[S5']] govern promotion and review meaning.
