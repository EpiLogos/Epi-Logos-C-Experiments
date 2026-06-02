---
coordinate: "S0.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.4 Shard: Runtime Context

## Canonical Role

[[S0.4]] is the [[P4]] / [[CT4a]] / [[L4]] context layer of [[S0]]: cwd, repo root, vault root, environment configuration, PATH/tool availability, session-local state, and local runtime facts. It says where execution is happening, not why the task exists.

## Source And Diagram Anchors

Anchors: [[S0-SPEC]], [[S0'-SPEC]], [[S0-4'-SPEC]], [[S0-SOURCE-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S0]], [[S0']], [[Day]], and [[NOW]]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S_Series_Master_CLI_Architecture]], [[2026-02-28-coordinate-type-system-and-reflection-families]], historical [[S0-4]], and [[S0-4']].

## Current Body Reality

`Body/S/S0/epi-cli/src/sesh/session.rs` resolves repo/vault/session state, loads `.epi-logos.env`, creates [[Day]] / [[NOW]] paths, and writes `.epi/session.json`. `Body/S/S0/epi-cli/src/vault/mod.rs` reads `EPILOGOS_VAULT`, `EPI_REPO_ROOT`, `EPI_VAULT_NAME`, `EPI_NOW_PATH`, and writes `~/.epi-logos/env/base.env` for vault name inheritance. `Body/S/S0/epi-cli/src/up.rs` injects `EPI_GATE_STATE_ROOT`. `Body/S/S0/epi-cli/src/portal/runtime_state.rs` reads session and gateway temporal context, but its coordinate owner fields correctly point temporal authority to [[S3']] and agent access to [[S4]] / [[S5]].

## Build Contract

- Workspace root resolution must be deterministic from cwd/env.
- Runtime context facts must be separate from task facts and [[VAK]] evaluation.
- Non-secret config may be surfaced; secret values must be redacted or omitted.
- Context output should carry provenance: env file, process env, session state, gateway context, or fallback.
- Interactive selectors such as [[fzf]] are allowed only when human-in-the-loop is explicit.

## API / Envelope / Implementation Hooks

Target API: `s0.env`. Envelope: `s_0_workspace_root`, `s_0_env_config`, and supporting context for `s_0_terminal_substrate`. Hooks: `sesh/session.rs`, `vault/mod.rs`, `vault/paths.rs`, `up.rs`, `portal/runtime_state.rs`, and `gate/config.rs`.

## Test Obligations

Existing: `session_lifecycle.rs`, `agent_session_commands.rs`, `vault_paths_templates.rs`, `vault_commands.rs`, `up_command.rs`, `portal_temporal_surface_contract.rs`, and `gate_config_system.rs`. Required: explicit protected-secret masking tests for `s0.env` and nested-directory workspace-root stability.

## Open Gaps

The spec names `varlock` and provider-aware secret posture, but current S0 evidence is stronger around env/base.env than a fully resolved provider abstraction. Keep this as an honest [[S0.4']] / [[S3]] channel-readiness gap.

## Boundaries

[[S0.4]] describes runtime locality. [[S1']] owns vault residency law. [[S3']] owns temporal session semantics. [[S4']] owns CPF/CT/CP/CF/CFP/CS task context.
