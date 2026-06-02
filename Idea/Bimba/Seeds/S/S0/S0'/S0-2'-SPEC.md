---
coordinate: "S0.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0'-SPEC]]"
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.2' Shard: Permissioned Execution Contract

## Canonical Role

[[S0.2']] is the [[P2']] / [[CT2]] / [[L2']] reflective operation law of [[S0']]: the rule that raw execution is always mediated by declared sandbox intent, structured args/env, and [[S4']] permission boundaries.

## Source And Diagram Anchors

Anchors: [[S0'-SPEC]], [[S0-2-SPEC]], [[S0-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[S4']], [[Capability Matrix]], [[Consent]], and [[Khora]]. Migrated sources: [[S0-S0i-CLI-CORE]], [[2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger]], historical [[S0-2']], and [[13-s-sprime-modularity-and-s0-membrane-cleanup]].

## Current Body Reality

`Body/S/S0/epi-cli/src/gate/approvals.rs` stores approval records and node modes for live gateway methods `exec.approval.request`, `exec.approval.resolve`, `exec.approvals.get`, `exec.approvals.set`, `exec.approvals.node.get`, and `exec.approvals.node.set`. `Body/S/S0/epi-cli/tests/gate_nodes_devices_browser.rs` and `gate_method_parity.rs` verify state mutation. `Body/S/S0/epi-cli/src/core/write_gate.rs` contains a session passphrase gate for QV writes, but this is a mindfulness/write gate, not a full S4 permission model.

## Build Contract

- Denied execution must not spawn.
- Approval records must be distinguishable from process failure and timeout.
- Permission receipts should be carried into execution evidence when `s0.exec` lands.
- Raw env/cwd/command data must be redacted where it could reveal secrets.
- S0 may host approval state for compatibility, but policy authority belongs to [[S4']] and [[Pleroma]] capability governance.

## API / Envelope / Implementation Hooks

Consumes `s_4_permission_boundary`; supports `s0.exec` failure modes. Live hooks: `gate/approvals.rs`, `gate/server.rs` approval match arms, `core/write_gate.rs`, `agent/capabilities.rs`, and [[Capability Matrix]] manifests.

## Test Obligations

Existing: `gate_nodes_devices_browser.rs`, `gate_method_parity.rs`, `gate_s4_coordinate_surfaces.rs`, `agent_vak.rs`, and `vak_constitutional_architecture.rs`. Required: end-to-end denied-command-does-not-spawn test once `s0.exec` is implemented, plus approval receipt propagation in audit output.

## Open Gaps

Current approval state is operationally real but not the final constitutional permission system. The shard must keep the transition visible so S0 does not become an accidental policy engine.

## Boundaries

[[S0.2']] enforces received permission law. [[S0.2]] spawns only after permission. [[S4']] owns permission/capability policy. [[Aletheia]] verifies promotion.
