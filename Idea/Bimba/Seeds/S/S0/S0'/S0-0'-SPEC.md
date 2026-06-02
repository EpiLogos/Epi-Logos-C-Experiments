---
coordinate: "S0.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0'-SPEC]]"
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.0' Shard: Khora Tool Law

## Canonical Role

[[S0.0']] is the [[P0']] / [[CT0]] / [[L0']] ground of [[S0']]: the declared preferred-tool and capability-resolution law by which [[Khora]] turns local executables into stable agent/operator affordances. It is reflective ground, not generic agent ontology.

## Source And Diagram Anchors

Anchors: [[S0'-SPEC]], [[S0-SPEC]], [[S0-0-SPEC]], [[S0-SHARD-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[Khora]], [[S0]], and [[S0']]. World/MOC anchors: `Idea/Bimba/World/Types/Coordinates/S/S'/S0'/S0'.md` and `S0'.canvas`. Migrated sources: [[S0-S0i-CLI-CORE]], [[S0-QV-PIPELINE-AND-PLUGIN]], [[2026-02-28-epi-claw-cli-harmonization-daily-commands]], historical [[S0-0']], and [[2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger]].

## Current Body Reality

The S0' spec currently points to [[Khora]] preferred-tool material under `Body/S/S4/ta-onta/S4-0p-khora/S0'/system-select.ts` and the live `epi` root in `Body/S/S0/epi-cli/src/main.rs`. The active S0 code also uses explicit resolver-style behavior in `Body/S/S0/epi-cli/src/techne/mod.rs` (`resolve_cmux_bin`, `resolve_notebooklm_bin`, `resolve_notebooklm_setup`) and env inheritance through `sesh/session.rs`. The old `.pi/extensions/ta-onta/khora/S0/cli/preferred-tools.json` / `resolve.sh` language remains canonical intent where present, but live evidence must be checked against actual Body paths.

## Build Contract

- Capability names are the contract; binary names are resolved implementations.
- Fallbacks must be declared, not improvised silently.
- Missing no-fallback tools must report explicit unresolved status.
- Materialised `.epi/agents/*` copies must not drift from the [[Khora]] source-of-truth.
- Resolver output may feed [[S0.0]] execution but does not grant execution permission.

## API / Envelope / Implementation Hooks

Target API: `s0.tool_surface`. Envelope: `s_0_tool_surface`. Hooks: `techne/mod.rs`, `agent/agent_dirs.rs`, `agent/runtime.rs`, [[Khora]] system-select/tool-selection files, and future generated tool-surface manifests.

## Test Obligations

Existing indirect tests: `techne_cmux_contract.rs`, `agent_dirs.rs`, `agent_extensions_ta_onta.rs`, `gate_s4_coordinate_surfaces.rs`, and `portal_surfaces_contract.rs`. Required: resolver-backed `s0.tool_surface` test that distinguishes found, fallback-found, and unresolved/no-fallback tools.

## Open Gaps

The historical resolver files are not yet the single audited source-of-truth across `.pi` and `.epi/agents/*`. This shard should drive a generated-materialisation check before agents depend on it as vault intelligence.

## Boundaries

[[S0.0']] declares tool law. [[S0.0]] executes with resolved tools. [[S4']] owns capability/approval law. [[Pleroma]] owns plugin/skill affordance beyond raw tool availability.
