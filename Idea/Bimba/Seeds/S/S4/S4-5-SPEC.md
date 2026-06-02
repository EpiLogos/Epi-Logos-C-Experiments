---
coordinate: "S4.5"
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

# S4.5 Shard: Subagent and Crystallisation Trigger

## Canonical Role

[[S4.5]] is the [[P5]] / [[CT5]] integration edge of [[S4]]: durable subagent lineage, synthesis handles, thought-routing trigger, crystallisation initiation, and the reviewable handoff from agent execution toward [[Aletheia]] and [[Epii]].

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-5'-SPEC]], [[S5'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]].
- World/MOC anchors: [[S4]], [[S4']], `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[S4-TA-ONTA-EXTENSION-SPEC]], [[2026-03-10-ta-onta-full-implementation]], [[2026-04-04-graphiti-unified-temporal-context-service]].

## Current Body Reality

The current Body substrate is `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts`, `CONTRACT.md`, `modules/gate-trigger.ts`, `modules/thought-vak.ts`, `modules/sophia-ingest.ts`, and `modules/hen-integration.ts`. It registers `aletheia_session_promote`, Gnosis ingest/query/notebook tools, thought routing, crystallisation, SEED refresh, episodic record/search/arc tools, and `epii_invoke_anima`.

Tests include `z_cycle_smoke.test.ts`, `gate_trigger.test.ts`, `sophia_ingest.test.ts`, and `thought_route_vak.test.ts`. Khora's `sophia-fire.ts` and `sophia_disclosure_wire.test.ts` are also part of the handoff story because single-writer Sophia disclosure prevents duplicated session-end review entries.

## Build Contract

Every thought/crystallisation handoff must preserve source session, [[NOW]], [[Day]], parent/child agent lineage, [[VAK]] address, artifact paths, privacy/review class, and destination. [[S4.5]] may trigger and curate, but any durable improvement decision, autoresearch verdict, or world-return promotion must route to [[S5']] / [[Epii]].

Subagent lineage is not optional telemetry. It is the evidence chain that lets [[Aletheia]] and [[Epii]] decide whether an output is reviewable, promotable, or merely session-local.

## API / Envelope / Implementation Hooks

- `s4'.thought.*`, `s4'.crystallise`, and `s4'.notify_user` are specified external surfaces.
- `aletheia_thought_route`, `aletheia_crystallise`, `aletheia_session_promote`, and episodic arc tools are the current PI-tool mirrors.
- The handoff envelope should include `session_id`, `day_id`, `now_path`, `source_artifacts`, `thought_bucket`, `vak_address`, `review_required`, and `target_coordinate`.
- [[Moirai]] Night' dispatch remains an Anima dispatch path, not direct Aletheia self-spawn.

## Test Obligations

- `thought_route_vak.test.ts` must prove VAK-bearing thought routes to the correct T-bucket/artifact shape.
- `sophia_ingest.test.ts` must prove Sophia disclosure becomes ingestible Aletheia material.
- `z_cycle_smoke.test.ts` must keep compose/perform/rehear/recompose seams coherent.
- Review-required outputs must be asserted as handoffs, not silently promoted.

## Open Gaps

- Full Epii invocation/review reciprocity is specified but still needs richer provider-backed execution.
- Moirai Night' and Sophia hook closure remain explicitly tracked as Z-cycle blockers in [[S4-5'-SPEC]].
- `s4'.notify_user` is named in specs but not yet a mature public method family.

## Boundaries

[[S4.5]] triggers and records the integration edge. [[S4.5']] [[Aletheia]] curates the membrane, [[S5']] [[Epii]] governs deep review and promotion, [[S1']] writes vault artifacts, and [[S3']] handles temporal/episodic runtime.
