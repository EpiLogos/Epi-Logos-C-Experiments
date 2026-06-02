---
coordinate: "S0.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0'-SPEC]]"
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.3' Shard: Reflected Workflow Law

## Canonical Role

[[S0.3']] is the [[P3']] / [[CT3]] / [[L3']] reflected workflow law of [[S0']]: terminal topology, cmux/tmux surface semantics, workflow templates, and reusable operator patterns made inspectable for agents and humans.

## Source And Diagram Anchors

Anchors: [[S0'-SPEC]], [[S0-3-SPEC]], [[S0-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[Anima]], [[Epii]], and [[Khora]]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S0-QV-PIPELINE-AND-PLUGIN]], [[S_Series_Master_CLI_Architecture]], historical [[S0-3']], and [[2026-03-05-epi-cli-expansion]].

## Current Body Reality

`Body/S/S0/epi-cli/src/agent/tmux.rs` creates/attaches/statuses/kills tmux sessions using `EPI_AGENT_TMUX_BIN` and agent-specific env. `Body/S/S0/epi-cli/src/techne/mod.rs` resolves cmux and exposes `epi techne cmux`. `Body/S/S0/epi-cli/src/up.rs` launches a `main` cmux surface with CP `4.4` and supports attach. `Body/S/S0/epi-cli/src/portal/surfaces.rs` and `portal/topology.rs` make command/config surfaces inspectable in the portal.

## Build Contract

- `s0'.cmux.list`, `s0'.cmux.surface`, and `s0'.cmux.focus` must return typed results.
- Headless tests must have a typed empty/unavailable surface instead of blocking.
- Terminal surfaces may carry agent IDs, cwd, and env posture, but not full team ontology.
- The two-window [[Anima]] / [[Epii]] target is a launch topology, not proof of [[S4']] orchestration.

## API / Envelope / Implementation Hooks

Owns target methods `s0'.cmux.list`, `s0'.cmux.surface`, and `s0'.cmux.focus`; populates `s_0_terminal_substrate`. Hooks: `agent/tmux.rs`, `techne/mod.rs`, `up.rs`, `portal/surfaces.rs`, `portal/topology.rs`, and `sesh`.

## Test Obligations

Existing: `up_command.rs`, `techne_cmux_contract.rs`, `portal_surfaces_contract.rs`, `agent_team_cli_contract.rs`, and `gate_team_runtime_contract.rs`. Required: explicit unavailable-cmux typed response and focus/list tests when a real cmux integration is available.

## Open Gaps

The old S' master CLI addendum envisioned multi-agent broker semantics in the CLI. Current canon routes that through [[S3]] gateway and [[S4']] agent runtime; S0.3' should retain terminal shape only.

## Boundaries

[[S0.3']] reflects terminal workflow topology. [[S4']] owns constitutional team composition. [[S3]] owns live websocket/session transport.
