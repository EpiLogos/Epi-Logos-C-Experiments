---
coordinate: "S3/S3'"
c_4_artifact_role: "shard-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S3-SPEC]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3/S3' Shard Index

[[S3]] / [[S3']] owns gateway transport, sessions, routing, temporal state, presence, shared context, app bridge, and [[Graphiti]] runtime architecture. These shards must separate product/runtime RPC from coordinate-native API parity.

## Harmonization Standard

Each shard below is now expected to satisfy [[S-SHARD-HARMONIZATION-PROTOCOL]] by linking its umbrella spec, traceability index, migrated legacy sources, current [[Body]] substrate, tests, and explicit diagram anchors. For this lane the minimum diagram consumption set is [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], with [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] used wherever gateway, [[SpaceTimeDB]], [[Graphiti]], or [[M']] app projection is being specified. Matching MOC canvases live at `Idea/Bimba/World/Types/Coordinates/S/S3/S3.canvas` and `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.canvas`.

## Base Shards

| Shard | Build focus |
|---|---|
| [[S3-0-SPEC]] | WebSocket transport, connect, auth, health |
| [[S3-1-SPEC]] | wire frame, request ids, manifest, routing acks |
| [[S3-2-SPEC]] | sessions, history, transcripts, aliases, workspace scope |
| [[S3-3-SPEC]] | routing, channels, callbacks, event fanout |
| [[S3-4-SPEC]] | presence, context, Day/NOW/Kairos, Redis temporal state |
| [[S3-5-SPEC]] | app bridge, devices, approvals, logs, Graphiti handoff |

## Prime Shards

| Shard | Build focus |
|---|---|
| [[S3-0'-SPEC]] | protocol version, connect-first invariant, error shape |
| [[S3-1'-SPEC]] | coordinate-native method manifest and parity map |
| [[S3-2'-SPEC]] | session lineage and temporal authority |
| [[S3-3'-SPEC]] | state projection, broadcast, SpacetimeDB boundary |
| [[S3-4'-SPEC]] | Chronos Day/NOW/Kairos/context law |
| [[S3-5'-SPEC]] | return/integration law, app projection, Graphiti runtime boundary |

## Shard Gate

Treat Universal NOW and SpacetimeDB as target state until real networked integration is proven.
