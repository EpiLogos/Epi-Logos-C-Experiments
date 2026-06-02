---
coordinate: "S4.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S4-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.3 Shard: Thread and Dispatch Patterns

## Canonical Role

[[S4.3]] is the [[P3]] / [[CT3]] pattern layer of [[S4]]: thread patterns, team/chain/fusion/background execution forms, dispatch traces, handoff envelopes, and runtime Day/NOW path preservation in spawned work. It names the patterns of execution; [[S4.4']] applies [[VAK]] and [[CFP]] law to those patterns.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-3'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]].
- World/MOC anchors: [[S4]], [[S4']], `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-S4i-PI-AGENT]], [[2026-04-03-pi-cmux-native-orchestration]], [[2026-03-10-ta-onta-full-implementation]], [[S4-EXTENSION-ARCHITECTURE]].

## Current Body Reality

The execution pattern substrate is in `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts`, `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts`, `Body/S/S4/ta-onta/S4-4p-anima/S4/subagent-widget.ts`, and the Anima extension dispatch tools. `dispatchTeamMember` in `S4-4p-anima/extension.ts` forwards `EPI_SESSION_VAK_ADDRESS` into child processes and uses `epi --json agent team dispatch`, which makes [[S0]] the process executor and [[S4]] the runtime pattern owner.

Validation is not only conceptual: `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` differentiates dialogical [[CPF]] `(00/00)` from mechanistic dispatch, enforces [[CFP1]] for parallel dispatch, and reserves [[CFP3]] for fusion/Moirai-style fan-out. Tests include `parallel_vak.test.ts`, `dispatch_fusion_validate.test.ts`, `dispatch_gate_block.test.ts`, and `moirai_night_pass.test.ts`.

## Build Contract

The contract must separate:

- Parallel dispatch: multiple independent task briefs, each mechanistic task carrying [[CFP1]].
- Chain dispatch: ordered sequential pipeline, [[CFP2]], preserving handoff payload order.
- Fusion dispatch: one shared task, many agents, aggregate semantics, [[CFP3]].
- Background subagent: resumable child session, [[CFP4]] / [[CFP5]] as applicable.

Every spawned unit must inherit enough [[NOW]], [[Day]], session, parent, and [[VAK]] context to make its output auditable. Summary-only subagent returns are acceptable when lineage and transcript/evidence handles remain durable.

## API / Envelope / Implementation Hooks

- `s4'.team.*`, `s4.agent.query`, and `s4.agent.notify` are the specified external families.
- `dispatch_parallel_agents`, `dispatch_fusion_agents`, `run_chain`, and `subagent_*` are current PI-tool mirrors.
- Handoff envelopes should include task id, parent session, [[VakAddress]], agent name, result handle, and error/status.
- `Body/S/S4/pi-agent/agents/teams.yaml` and `agent-chain.yaml` are package-level roster/chain evidence.

## Test Obligations

- `parallel_vak.test.ts` must prove [[CFP1]] enforcement for mechanistic parallel dispatch.
- `dispatch_fusion_validate.test.ts` must prove [[CFP3]] fusion semantics and non-constitutional roster escape hatch limits.
- `moirai_night_pass.test.ts` must prove the Night' review fan-out shape.
- Chain tests must assert ordered handoff payloads and not just completion messages.

## Open Gaps

- The public `s4'.team.*` gateway method family remains named as a gap in [[S4-SPEC]].
- Provider-backed PI extension-level execution is still richer than the current test surface.
- Pipeline callback semantics should be made explicit before M′ Agentic Control Room relies on them.

## Boundaries

[[S4.3]] owns execution patterns. [[S4.3']] [[Chronos]] owns temporal/process conditioning, [[S4.4']] [[Anima]] owns VAK dispatch decision, [[S3]] owns transport/session delivery, and [[S5']] / [[Epii]] owns review meaning.
