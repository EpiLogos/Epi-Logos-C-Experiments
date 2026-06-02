---
coordinate: "S4.0"
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

# S4.0 Shard: Agent Runtime Bootstrap

## Canonical Role

[[S4.0]] is the [[P0]] / [[CT0]] ground of [[S4]]: the runtime bootstrap, session identity, hook seam, and observability base that lets [[PI Agent]], [[Codex]], or any later [[claw-rust]] harness begin from a known state. It is the base-runtime analogue of [[S4.0']] [[Khora]], but it does not own [[Khora]]'s vault write law; it owns the harness boot surface that Khora inhabits.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-0'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]].
- World/MOC anchors: [[S4]] at `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md`, `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, paired [[S4']] MOC at `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-S4i-PI-AGENT]], [[2026-03-06-s4-pi-agent-foundation]], [[2026-04-02-native-pi-epi-agent-convergence]], [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]].

## Current Body Reality

The live bootstrap substrate is split between the [[S0]] Rust command membrane and [[S4]] Body packages. The S4-facing runtime evidence is `Body/S/S4/pi-agent/README.md`, `Body/S/S4/pi-agent/composite-entry.ts`, `Body/S/S4/ta-onta/composite-entry.ts`, `Body/S/S4/ta-onta/S4-0p-khora/extension.ts`, and `Body/S/S4/ta-onta/S4-0p-khora/CONTRACT.md`. The composite entry registers six spine contributions and wires `session_start`, `session_shutdown`, and `session_before_compact` injection/extraction hooks; Khora then exposes `khora_session_init`, `khora_session_status`, `khora_write`, `khora_sync_queue_push`, `khora_sync_queue_flush`, `khora_continuation_write`, and `khora_session_close`.

Tests currently grounding this surface include `Body/S/S4/ta-onta/S4-0p-khora/tests/z_phase_vak.test.ts` and `Body/S/S4/ta-onta/S4-0p-khora/tests/sophia_disclosure_wire.test.ts`. The gateway-facing `s4.agent.status` family is specified at [[S4-SPEC]] and proven through S0-side gateway tests, but this shard remains responsible for naming the runtime contract that those methods expose.

## Build Contract

The bootstrap must start from declared runtime identity, never from ambient shell accident. It must surface at least `agent_id`, `session_key`, `day_id`, lifecycle state, [[CS]] position, and observability posture through `s4.agent.status` or the nearest available gateway mirror. It must keep source package residency under `Body/S/S4/**` distinct from managed runtime projection under `.epi/agents/<id>/agent` and from compatibility projections under `.codex` / `.omx`.

Runtime launch must carry [[NOW]], [[Day]], and [[VAK]] context by environment or typed envelope, not by implicit prompt text. Compatibility with old `.pi/extensions/...` references is allowed only as migration evidence; new documentation and agent routing should cite Body-native paths.

## API / Envelope / Implementation Hooks

- `s4.agent.status` returns runtime status; `khora_session_status` is the PI-tool mirror.
- `s_4_bootstrap_context` includes provider/runtime identity, source package path, managed runtime path, and [[NOW]]/[[Day]] references.
- `s_4_observability_mode` records whether the run is interactive, background, team/subagent, or review/crystallising.
- `Body/S/S4/ta-onta/composite-entry.ts` is the six-carrier load point; `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` is the current bootstrap/write primitive implementation.

## Test Obligations

- Exercise real session identity and VAK bootstrap via `Body/S/S4/ta-onta/S4-0p-khora/tests/z_phase_vak.test.ts`.
- Verify Sophia disclosure single-writer behavior through `Body/S/S4/ta-onta/S4-0p-khora/tests/sophia_disclosure_wire.test.ts`.
- Gateway tests for `s4.agent.status` must assert real state shape, not fixture-only mock fields.
- Any runtime projection test must distinguish `Body/S/S4/**` source from `.epi/agents/**` managed projection.

## Open Gaps

- `khora_sync_queue_flush` is still explicitly stubbed for Neo4j wiring.
- Some migrated specs still cite old `.pi/extensions/ta-onta/...` paths; the Seed contract should preserve them as provenance while preferring `Body/S/S4/ta-onta/**`.
- Richer provider/auth status belongs to [[S4.1]] and must not be collapsed into bootstrap.

## Boundaries

[[S4.0]] starts and reports the runtime. [[S4.1]] owns identity/provider/auth form, [[S4.2]] owns skills/plugins/tools, [[S4.0']] [[Khora]] owns vault write authority, and [[S3]] / [[S3']] own gateway/session transport.
