---
coordinate: "S3.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.4 Shard: Presence And Temporal Context

## Canonical Role

[[S3.4]] is the [[P4]] / [[CT4]] context layer of [[S3]] where gateway sessions acquire live temporal orientation. It owns presence, heartbeat, session close timing, [[Day]] / [[NOW]] / [[Kairos]] surfacing, Redis temporal context, and the first runtime bridge into [[Chronos]] without taking over [[S1]] vault form or [[S4']] agent law.

## Source And Diagram Anchors

Load [[S3-SPEC]], [[S3'-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3'-TRACEABILITY-INDEX]], [[S3]], [[S3']], `Idea/Bimba/World/Types/Coordinates/S/S3/S3.canvas`, and `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.canvas`. Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Sources include [[2026-04-04-graphiti-unified-temporal-context-service]], [[2026-03-07-s3-universal-now-bridge-notes]], and [[2026-03-10-nara-runtime-full-plan]].

## Current Body Reality

`Body/S/S3/redis-context/src/lib.rs` declares `REDIS_RUNTIME_OWNER = "S3"`, `S2_GRAPH_SEMANTIC_NAMESPACE = "s2:graph:semantic"`, `S3_TEMPORAL_NAMESPACE = "s3:gateway:temporal"`, and RedisVL script residency under `Body/S/S3/redis-context`. `Body/S/S0/epi-cli/src/gate/temporal.rs` is still the live CLI/RPC surface for `s3'.temporal.context`, but the canonical module residency is S3/S3'. `Body/S/S3/gateway-contract/src/lib.rs` lists `s3'.temporal.context`, `s3'.temporal.subscribe`, `s3'.spacetime.subscribe`, `presence.list`, `status.summary`, and `health.snapshot`.

## Build Contract

Temporal state must include safe [[Day]] / [[NOW]] / session handles, history archive placement, Redis key names, Graphiti arc handles, safe [[Kairos]] projection, and safe kernel tick/pulse/energy where available. Redis key law must keep S3 temporal state separate from [[S2]] semantic cache. No raw journal, birth data, protected identity detail, or private graph body may leak through presence or temporal context.

## API / Envelope / Implementation Hooks

Core methods are `s3'.temporal.context`, `s3'.temporal.subscribe`, `s3'.spacetime.subscribe`, `presence.list`, `status`, `health`, `status.summary`, and `health.snapshot`. Hot keys include `s3:gateway:temporal:session:{session_id}:now:md`, `s3:gateway:temporal:day:{day_id}:context`, and Kairos/session orientation keys named in [[S3-SPEC]].

## Test Obligations

`Body/S/S3/redis-context/tests/redis_runtime_contract.rs` must verify Redis ownership and namespace separation. Gateway temporal/projection tests must prove DAY/NOW availability after connect and prevent S2/S3 Redis namespace collision. Use real Redis/runtime contracts where available; do not mock away namespace law.

## Open Gaps

`s3'.temporal.context` is still largely surfaced through S0 gateway code. The spec should keep this explicit until extraction lands in S3-native gateway/runtime modules.

## Boundaries

[[S3.4]] owns live temporal context. [[S1]] writes [[Day]] / [[NOW]] artifacts, [[S2]] owns semantic cache use, [[S3']] projects shared state, [[Chronos]] names temporal law through [[S4']], and [[S5']] governs reflective use.
