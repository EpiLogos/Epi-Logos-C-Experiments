---
coordinate: "S0.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.2 Shard: Execution Operation

## Canonical Role

[[S0.2]] is the [[P2]] / [[CT2]] / [[L2]] operation of [[S0]]: structured subprocess invocation, stream capture, timeout behavior, and cleanup. It is where command form becomes actual process movement.

## Source And Diagram Anchors

Anchors: [[S0-SPEC]], [[S0-0-SPEC]], [[S0-2'-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S0]], and [[S0']]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S_Series_Master_CLI_Architecture]], [[2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger]], and historical [[S0-2]] / [[S0-2']].

## Current Body Reality

`Body/S/S0/epi-cli/src/up.rs` is the clearest current S0.2 implementation. It shells back into the current `epi` binary for graph setup, starts gateway readiness, creates cmux/app commands, captures stdout/stderr, and reports typed step summaries. `Body/S/S0/epi-cli/src/techne/mod.rs` demonstrates external-tool launching for cmux, NotebookLM, worktrunk, and research helpers. `Body/S/S0/epi-cli/src/agent/tmux.rs` uses `Command` for tmux session lifecycle. Gateway approval state exists in `Body/S/S0/epi-cli/src/gate/approvals.rs`, but approval authority remains [[S4']] policy law.

## Build Contract

- Accept structured command plus args, cwd, env, and timeout.
- Separate stdout, stderr, exit code, spawn failure, timeout, and denied execution.
- Child processes must be cleaned up on timeout or failed bootstrap.
- Explicit env injection must not bypass [[Consent]] or secret redaction.
- Execution errors must preserve enough context for [[Aletheia]] verification and [[Epii]] review.

## API / Envelope / Implementation Hooks

Target API: `s0.exec`. Live compatibility surfaces: `exec.approval.*`, `epi up`, `epi techne cmux`, `epi agent tmux`, and S0-hosted gateway startup. Envelope: consumes `s_4_permission_boundary`; future audit may emit `s_0_session_exit_code`.

## Test Obligations

Existing tests: `up_command.rs` proves JSON step order, gateway readiness, cmux/app launch, and process logs; `gate_nodes_devices_browser.rs` and `gate_method_parity.rs` exercise approval state mutation; `agent_team_cli_contract.rs` and `gate_agent_rpc.rs` constrain operator execution. Needed: a true timeout-kills-child test and a denied-command-does-not-spawn test tied to [[S0.2']].

## Open Gaps

There is no single canonical `s0.exec` gateway method wired end-to-end yet. The spec should keep the target clear while recognising live execution is distributed across bootstrap, tmux, techne, agent, and gateway adapter code.

## Boundaries

[[S0.2]] performs process operation. [[S0.2']] defines permissioned execution law. [[S4']] grants/denies. [[S3]] transports gateway calls. [[S5']] interprets review meaning.
