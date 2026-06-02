---
coordinate: "S2.0"
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

# S2.0 Shard: Graph Substrate Bootstrap

## Canonical Role

[[S2.0]] is the [[P0]] / [[CT0]] / [[L0]] ground of the [[S2]] graph body: it owns the raw [[Neo4j]] and graph-semantic [[Redis]] substrate bootstrap before coordinate law, retrieval, or disclosure are layered on top. Its boundary is infrastructure readiness: driver config, health checks, graph role identity, local service topology, and explicit failure reports. It does not own [[S3']] session/temporal Redis, [[S1]] vault residency, or [[S2']] coordinate semantics.

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S2']], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. The matching [[World]] definition and MOC surfaces are `Idea/Bimba/World/Types/Coordinates/S/S2/S2.md` and `Idea/Bimba/World/Types/Coordinates/S/S2/S2.canvas`. Migrated source pressure comes from [[S2]], [[S2-0]], [[S2-S2i-GRAPH]], [[S-STACK-INTEGRATION]], and [[2026-03-10-semantic-graph-lifecycle]].

## Current Body Reality

The real substrate lives in `Body/S/S2/graph-services/src/lib.rs`: `Neo4jConfig::from_env`, `Neo4jClient::connect`, `Neo4jClient::health_check`, `Neo4jGraphRole::primary_bimba`, `GraphRedisRole::semantic_cache`, and `SemanticCacheConfig`. The raw schema constants come from `Body/S/S2/graph-schema/src/lib.rs`, including `GRAPH_ID`, `BIMBA_LABEL`, `COORDINATE_PROPERTY`, `SEMANTIC_EMBEDDING_DIMENSIONS`, and `SEMANTIC_EMBEDDING_INDEX`. `Body/S/S2/RUNBOOK.md` and `docker-compose.epi-s2.yml` are the local service orientation surfaces. [[S0]] still mirrors the command surface through `Body/S/S0/epi-cli/src/graph/*`, so [[S2.0]] must be documented as owned by [[S2]] and invoked through [[S0]], not absorbed into [[S0]].

## Build Contract

[[S2.0]] must expose one reliable readiness contract for [[Neo4j]] and graph-semantic [[Redis]]: environment variables must resolve deterministically, driver creation must fail loudly, health checks must distinguish database unavailability from schema drift, and reports must name the coordinate owner as [[S2]]. The Redis role must remain `s2:graph:semantic` / `epi_semantic_cache`, while [[S3']] remains the owner of temporal/session Redis keys.

## Test Obligations

Real tests: `Body/S/S2/graph-services/tests/neo4j_contract.rs`, `neo4j_client_contract.rs`, `doctor_plugin_readiness_contract.rs`, and `semantic_cache_contract.rs`. Live tests requiring Docker should stay marked as such and point operators to `docker compose -f docker-compose.epi-s2.yml up -d neo4j`; non-live tests must still validate role metadata, env contracts, and Redis namespace separation.

## Open Gaps

The gateway-facing method registry is not yet a single clean `s2.graph.health` or `s2.graph.doctor` surface. The S0 CLI mirror is still operationally important. Redis runtime residency remains cross-coordinate: [[S2.0]] owns semantic-cache law, but the RedisVL bridge is physically under [[S3]].

## Boundaries

[[S2.1]] owns schema and indexes after substrate readiness. [[S2.4]] owns cache behavior over the substrate. [[S2']] owns coordinate graph law. [[S3']] owns session, [[NOW]], [[Graphiti]], and temporal Redis truth. [[S0]] executes commands but must not become the hidden home of graph substrate law.
