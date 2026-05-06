---
coordinate: "S2/S2'"
c_4_artifact_role: "shard-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S2-TRACEABILITY-INDEX]]"
  - "[[S2-SPEC]]"
---

# S2/S2' Shard Index

[[S2]] / [[S2']] owns graph, vector, Redis semantic cache, and coordinate-aware retrieval. These shards must recover concrete lifecycle detail: `q_*` extraction, semantic-document hashing, embedding version drift, changed-node refresh, RedisVL, and strict Redis namespace separation from [[S3']].

## Base Shards

| Shard | Build focus |
|---|---|
| [[S2-0-SPEC]] | Neo4j/Redis bootstrap, health, driver plumbing |
| [[S2-1-SPEC]] | node schema, labels, properties, vector indexes |
| [[S2-2-SPEC]] | ingestion, update, reconcile, semantic documents |
| [[S2-3-SPEC]] | traversal, GraphRAG, provenance, cross-namespace edges |
| [[S2-4-SPEC]] | Redis/RedisVL semantic cache, tiering, invalidation |
| [[S2-5-SPEC]] | external adapters, `epi graph`, `bimba-mcp`, exports |

## Prime Shards

| Shard | Build focus |
|---|---|
| [[S2-0'-SPEC]] | coordinate normalization and substrate law |
| [[S2-1'-SPEC]] | coordinate identity, relation registry, graph type law |
| [[S2-2'-SPEC]] | q extraction, embedding versioning, changed-node refresh |
| [[S2-3'-SPEC]] | rerank, disclosure, lawful graph retrieval |
| [[S2-4'-SPEC]] | cache key law and S2/S3 Redis boundary |
| [[S2-5'-SPEC]] | parity, doctor/export, external graph interface |

## Shard Gate

No S2 implementation should proceed without a hard Redis namespace split: S2 semantic/cache Redis is not S3 temporal/session Redis.
