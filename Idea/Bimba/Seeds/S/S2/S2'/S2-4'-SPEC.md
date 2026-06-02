---
coordinate: "S2.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2'-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S2']]"
---

# S2.4' Shard: Cache Boundary And Context-Pool Law

## Canonical Role

[[S2.4']] is the [[P4']] / [[CT4]] / [[L4']] context law of [[S2']]: it governs graph semantic-cache key law, context-pool identity, namespace separation, and cache lineage so retrieval acceleration does not overwrite [[S3']] temporal truth or [[S5]] world-return meaning.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[S3']], [[Chronos]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC: `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Migrated anchors: [[S2-4']], [[S2-S2i-GRAPH]], [[2026-03-10-semantic-graph-lifecycle]], and [[2026-04-04-graphiti-unified-temporal-context-service]].

## Current Body Reality

`Body/S/S2/graph-services/tests/semantic_cache_contract.rs` is the strongest current law: it asserts owner `S2`, namespace `s2:graph:semantic`, cache name `epi_semantic_cache`, 3072 embedding dimensions, graph-retrieval description, env contract, S3 RedisVL bridge path, payload attributes, and health fields. `Body/S/S2/graph-services/src/retrieval/hybrid.rs` adds graph revision, embedding version, q-schema version, mode, and top_k as cache attributes.

## Build Contract

Cache keys and context pools must be reproducible from retrieval intent, graph revision, embedding/q-schema versions, and coordinate scope. Cache payloads may store retrieval results but must not store session-local [[NOW]] state, [[Day]] identity, [[Graphiti]] episode bodies, or unreviewed protected content as graph truth. Context-pool identifiers must be passed as handles when [[S4]] or [[S5]] consumes them.

## Test Obligations

Tests must assert namespace collision prevention with [[S3']] prefixes, invalidation attributes after source/embedding drift, cache health serialization, and bridge path provenance. Retrieval tests must verify cache bypass and cache-backed paths produce equivalent result shape.

## Open Gaps

`s_2_kbase_pool_id` and related context-pool envelope fields are described in [[S2-SPEC]] but still need one coordinate-native gateway shape. The Redis runtime split is implemented by path and namespace, but operators can still confuse physical service with coordinate ownership.

## Boundaries

[[S2.4]] owns raw semantic cache substrate. [[S3']] owns temporal/session Redis and [[Graphiti]] runtime handles. [[S4']] uses context pools through [[Anima]] capability routing. [[S5]] and [[Gnosis]] may consume pools but do not own S2 cache key law.
