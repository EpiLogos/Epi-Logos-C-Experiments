---
coordinate: "S0.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0'-SPEC]]"
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.4' Shard: CLI Context Frame

## Canonical Role

[[S0.4']] is the [[P4']] / [[CT4b]] / [[L4']] reflective context frame of [[S0']]: environment config, workspace frame, session identity, QV/session injection, and runtime facts presented to command surfaces without becoming [[VAK]] task context.

## Source And Diagram Anchors

Anchors: [[S0'-SPEC]], [[S0-4-SPEC]], [[S0-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[Day]], [[NOW]], [[KernelBridge]], [[MathemeHarmonicProfile]], and [[VAK]]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S0-QV-PIPELINE-AND-PLUGIN]], historical [[S0-4']], and [[2026-02-28-coordinate-type-system-and-reflection-families]].

## Current Body Reality

`Body/S/S0/epi-cli/src/sesh/session.rs` creates the agent/session runtime with `session_id`, `day_id`, `now_path`, env map, PI session metadata, and diagnostics. `Body/S/S0/epi-cli/src/portal/runtime_state.rs` constructs `PortalTemporalSurface` from session state or gateway context and explicitly labels temporal owner as [[S3']] and agent access owner as [[S4]] / [[S5]]. `Body/S/S0/epi-cli/src/profile/mod.rs`, `portal/clock_state.rs`, and `Body/S/S0/portal-core/src/state.rs` expose safe kernel/profile projections without leaking protected profile detail.

## Build Contract

- Context output must identify source: session state, gateway context, clock-only fallback, env file, or process env.
- [[NOW]] and [[Day]] paths may be surfaced as runtime facts, but residency semantics remain [[S1]] / [[S1']].
- Kernel/profile mirrors must remain safe-public projections.
- Interactive selectors must never block headless command paths.
- [[VAK]] fields CPF/CT/CP/CF/CFP/CS are task context owned by [[S4']], not S0 env context.

## API / Envelope / Implementation Hooks

Supports `s0.env`, `s0.tool_surface`, session bootstrap envelopes, and portal runtime context. Envelope: `s_0_env_config`, `s_0_workspace_root`, safe kernel projection handles. Hooks: `sesh/session.rs`, `portal/runtime_state.rs`, `portal/clock_state.rs`, `profile/mod.rs`, `schemas/src/kernel-bridge.ts`, and `portal-core`.

## Test Obligations

Existing: `agent_session_commands.rs`, `session_lifecycle.rs`, `portal_temporal_surface_contract.rs`, `profile_cli_contract.rs`, `kernel_bridge_runtime_contract.rs`, `kernel_api_envelope_contract.rs`, and `portal-core/tests/profile_carries_vak.rs`. Required: env-provider masking and explicit no-interactive-blocking tests.

## Open Gaps

The context frame is partly mature, but provider-backed secret posture is still uneven. Treat `1password`/`varlock` as live requirements only when real provider commands/protocols are verified.

## Boundaries

[[S0.4']] reflects runtime context. [[S1']] owns vault path law. [[S3']] owns temporal runtime. [[S4']] owns VAK dispatch context. [[S5']] decides which context becomes review evidence.
