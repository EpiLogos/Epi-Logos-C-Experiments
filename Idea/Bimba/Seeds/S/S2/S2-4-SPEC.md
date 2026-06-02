---
coordinate: "S2.4"
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

# S2.4 Shard: Semantic Cache Substrate

## Canonical Role

[[S2.4]] is the [[P4]] / [[CT4]] / [[L4]] context shard of [[S2]]: it owns graph-semantic cache substrate, RedisVL bridge configuration, cache attributes, invalidation inputs, and hot/warm graph retrieval acceleration. It is a graph cache, not a session memory store.

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S2']], [[S3']], [[Chronos]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. MOC reference: `Idea/Bimba/World/Types/Coordinates/S/S2/S2.canvas`. Legacy anchors: [[S2-4]], [[2026-03-10-semantic-graph-lifecycle]], [[2026-04-04-graphiti-unified-temporal-context-service]], and [[S2-S2i-GRAPH]].

## Current Body Reality

`Body/S/S2/graph-services/src/lib.rs` defines `SEMANTIC_REDIS_NAMESPACE = "s2:graph:semantic"`, `SEMANTIC_CACHE_NAME = "epi_semantic_cache"`, `GraphRedisRole::semantic_cache`, and `SemanticCacheConfig`. `SemanticCacheConfig::for_local_dev` deliberately resolves the RedisVL script through `Body/S/S3/redis-context`, showing the runtime-residency split: [[S3]] hosts the bridge, [[S2]] owns graph semantic-cache law. `Body/S/S2/graph-services/src/retrieval/hybrid.rs` uses semantic cache attributes: mode, top_k, graph_revision, embedding_version, and q_schema_version.

## Build Contract

Every cache read/write must include cache namespace, embedding version, q-schema version, graph revision, retrieval mode, and top_k where relevant. Cache hits may accelerate retrieval but must not become canonical graph truth. Keys must never collide with [[S3']] temporal/session keys, [[NOW]] state, [[Day]] state, or [[Graphiti]] episode handles.

## Test Obligations

Use `Body/S/S2/graph-services/tests/semantic_cache_contract.rs` and retrieval fusion tests. The semantic-cache contract must assert S2 ownership, Redis namespace, env variables, RedisVL runtime bridge location, payload attributes, health fields, and safe semantic-document anchor content.

## Open Gaps

The cache invalidation path depends on graph metadata and embedding/source hash state, but full graph-revision governance is still coupled to promotion/sync completion. The physical Redis runtime is shared, so the S2/S3 split must remain loudly documented in every cache-facing spec.

## Boundaries

[[S2.2]] and [[S2.2']] produce changed-source and stale-embedding signals. [[S2.3]] consumes cache for retrieval acceleration. [[S2.4']] owns cache boundary law and context-pool semantics. [[S3']] owns temporal Redis truth; [[S5]] owns kbase/world-return interpretation.
