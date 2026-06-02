---
coordinate: "S0.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.3 Shard: Workflow Patterns

## Canonical Role

[[S0.3]] is the [[P3]] / [[CT3]] / [[L3]] pattern layer of [[S0]]: repeatable local workflows, small wrappers, cmux/tmux layouts, scripts, and command compositions that turn one-off shell movement into reusable operator surfaces.

## Source And Diagram Anchors

Anchors: [[S0-SPEC]], [[S0'-SPEC]], [[S0-3'-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S0]], and [[S0']]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S0-QV-PIPELINE-AND-PLUGIN]], [[S_Series_Master_CLI_Architecture]], historical [[S0-3]], and [[2026-03-05-epi-cli-expansion]].

## Current Body Reality

The live workflow substrate spans `Body/S/S0/epi-cli/src/up.rs`, `Body/S/S0/epi-cli/src/techne/mod.rs`, `Body/S/S0/epi-cli/src/agent/tmux.rs`, `Body/S/S0/epi-cli/src/sesh`, and helper scripts under `Body/S/S0/epi-cli/scripts`. `epi up` is the strongest crystallised pattern: repo-env, session-init, vault-check, graph/gateway readiness, cmux launch, app launch, and optional attach. `epi techne cmux` and `epi agent tmux` expose terminal topology without pretending to own constitutional team composition.

## Build Contract

- Promote repeated workflows into `epi` only when they need stable operator/agent affordance.
- Keep scripts small and inspectable; avoid hidden ambient cwd/env assumptions.
- Distinguish headless automation from interactive-only flows.
- Use cmux/tmux as terminal topology, not as semantic orchestration.
- Record each workflow's coordinate owner if it reaches into [[S1]]-[[S5]].

## API / Envelope / Implementation Hooks

Supports `s0'.cmux.*` by supplying concrete topology patterns; populates `s_0_terminal_substrate` when topology is observable. Hooks: `up.rs`, `techne/cmux`, `agent/tmux.rs`, `sesh/mod.rs`, `scripts/kbase.sh`, and `scripts/notebooklm/*`.

## Test Obligations

Existing: `up_command.rs` verifies cmux/app/session workflow logs; `techne_cmux_contract.rs` verifies cmux projection behavior; `agent_team_cli_contract.rs` and `gate_team_runtime_contract.rs` constrain team-facing command surfaces. Required: typed empty topology when cmux/tmux is absent and headless workflows that never block on interactive selectors.

## Open Gaps

The target two-agent [[Anima]] / [[Epii]] bootstrap layout is not yet the same as full [[S4']] constitutional orchestration. S0.3 should keep the launch pattern ready without claiming agent runtime completion.

## Boundaries

[[S0.3]] owns workflow patterning. [[S0.3']] reflects topology law. [[S4']] owns team/agent composition. [[S3]] owns live gateway event/session transport.
