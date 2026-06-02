---
coordinate: "S2.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S2]]"
---

# S2.5 Shard: External Graph Surface

## Canonical Role

[[S2.5]] is the [[P5]] / [[CT5]] / [[L5]] integration shard of [[S2]]: it exposes the graph substrate through operator and adapter surfaces while preserving the S0/S2/S2' ownership split. It is the return interface for graph readiness, query, export, doctor, and external adapter parity.

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S2']], [[M'-SYSTEM-SPEC]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. MOC reference: `Idea/Bimba/World/Types/Coordinates/S/S2/S2.canvas`. Migrated anchors: [[S2-5]], [[S2']], [[S2-5']], [[S2-S2i-GRAPH]], and [[2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population]].

## Current Body Reality

`Body/S/S0/epi-cli/src/graph/*` remains the executable `epi graph` mirror for graph query, sync, retrieval, doctor, cache, seed, dataset import, and bootstrap/dev wiring. `Body/S/S2/external/bimba-mcp/src/index.ts` exposes external MCP graph tools: coordinate resolution, semantic search, context, graph_query, graph_traverse, graph_context, graph_search, graph_disclosure, graph_embed, graph_validate, graph_sync, graph_chunk, graph_rerank, and graph_admin. `Body/S/S2/graph-services/src/doctor.rs`, `graph_api.rs`, and `consumption.rs` carry Body-native graph readiness and M5 handoff contracts.

## Build Contract

External graph access must be mapped to coordinate-native S2/S2' methods, not treated as an alternate ontology. `bimba-mcp` is an external interface; PI/[[Anima]] internals should consume gateway/context-pool contracts rather than use MCP as an inner organ. `epi graph` remains an [[S0]] command membrane for [[S2]] work and must report ownership explicitly.

## Test Obligations

Use `Body/S/S0/epi-cli/tests/graph_commands.rs`, `graph_client.rs`, `graph_retrieval.rs`, `graph_seed.rs`, `graph_sync.rs`, and `Body/S/S2/graph-services/tests/doctor_plugin_readiness_contract.rs`, `graph_api_contract.rs`, `m5_handoff_contract.rs`, and `graph_runtime_extraction_contract.rs`. Adapter parity tests must catch unmapped external methods and missing provenance fields.

## Open Gaps

The canonical gateway/API methods are still not fully collapsed into one clean coordinate-native route table. Some MCP source comments still contain historical TODO language, while compiled/dist surfaces and graph service tests have moved ahead.

## Boundaries

[[S0]] executes. [[S2]] owns substrate exposure. [[S2']] owns lawful graph interpretation. [[S3]] transports gateway calls. [[S4]] governs capability-bounded invocation. [[S5']] interprets graph results for review, pedagogy, and world-return.
