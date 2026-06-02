---
coordinate: "S4.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4'-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.3' Shard: CF Dispatch Law

## Canonical Role

[[S4.3']] is the [[Chronos]] carrier of [[S4']]: [[P3]] / [[CT3]] temporal-process law, [[CF]] path conditioning, [[Day]] / [[NOW]] lifecycle triggers, [[Kairos]], heartbeat/Z-thread timing, and the temporal context under which Anima dispatch happens.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4'-SPEC]], [[S4-SPEC]], [[S4'-TRACEABILITY-INDEX]], [[S4-3-SPEC]], [[S3'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]].
- World/MOC anchors: [[S4']], [[Chronos]], `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[2026-04-04-graphiti-unified-temporal-context-service]], [[2026-03-23-nara-clock-canonical-runtime-implementation-plan]], [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]].

## Current Body Reality

The Chronos implementation is `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts`, `CONTRACT.md`, `S3'/kairos-python-adapter.ts`, and `spine-contribution.ts`. It registers `chronos_day_init`, `chronos_now_init`, `chronos_archive_day`, cron tools, kairos fetch/status, temporal status, Graphiti day arc, and decan check. The traceability index records that the historical CONTRACT was stale; the current extension registers more tools than older tables described.

Chronos triggers creation; [[Hen]] defines structures; [[Khora]] writes. Graphiti and Redis temporal state are adjacent runtime systems owned by [[S3']] / [[S5']] seams, not by Chronos alone.

## Build Contract

Every dispatch must know its temporal frame: day id, NOW path, session id, [[CS]] direction, and whether the run is Day, Night', cron, or manual. Chronos may schedule or trigger, but it does not perform review and does not define content templates.

[[Kairos]] is additive. Missing natal/realtime/kairotic data must degrade gracefully and never block ordinary [[S4]] operation.

## API / Envelope / Implementation Hooks

- `chronos_day_init`, `chronos_now_init`, `chronos_archive_day`, `chronos_cron_register`, `chronos_cron_list`, `chronos_kairos_fetch`, `chronos_kairos_status`, `chronos_temporal_status`, `chronos_graphiti_day_arc`, `chronos_decan_check`.
- Target S4' method family: `s4'.orchestrate`, `s4'.team.compose`, and `s4'.team.status` must include temporal context.
- Archive paths must preserve `{YYYY}/{MM}/W{WW}/{DD}`.
- Z-thread heartbeat is Chronos's view of the background temporal-awareness runner; [[S4.4']] owns `/goal` discovery before scheduling.

## Test Obligations

- Chronos tool tests should assert real Day/NOW creation handoff through Hen/Khora rather than direct filesystem bypass.
- Kairos tests should prove feature-flag/additive behavior and no hard dependency when data is absent.
- Graphiti day arc tests must be non-fatal when the sidecar is unavailable.
- Dispatch tests must distinguish [[CFP1]] parallel from [[CFP3]] fusion in temporal traces.

## Open Gaps

- Public `s4'.team.*` surfaces remain named but incomplete.
- Real-time and kairotic Kairos modes are future work; natal mode is the stronger current substrate.
- Automated cron/Z-thread behavior depends on [[S3]] gateway runtime maturity.

## Boundaries

[[S4.3']] conditions dispatch temporally. [[S3]] / [[S3']] own gateway, Redis, Graphiti runtime; [[S4.4']] dispatches; [[S1']] defines and [[S4.0']] writes Day/NOW artifacts; [[S5']] receives review/meaning outputs.
