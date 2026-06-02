---
coordinate: "S2.2'"
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

# S2.2' Shard: Semantic Lifecycle Law

## Canonical Role

[[S2.2']] is the [[P2']] / [[CT2]] / [[L2']] operation law of [[S2']]: it governs semantic-document construction, `q_*` extraction, content/source hashing, embedding version drift, and changed-node refresh. Its job is to keep [[GraphRAG]] freshness tied to coordinate evidence rather than stale vector memory.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[GraphRAG]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC: `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Migrated anchors: [[S2-2']], [[S2-S2i-GRAPH]], [[2026-03-10-semantic-graph-lifecycle]], [[2026-03-07-s1-s2-implementation-plan]], and [[PILLAR-I-CANONICAL]].

## Current Body Reality

`Body/S/S2/graph-services/src/semantic.rs` defines `SemanticDocument`, `build_semantic_document`, `find_stale_nodes`, and `maybe_refresh_semantic_embeddings` support. Semantic documents include coordinate, name, family, layer, ql_position, essence, description, `q_*` properties, outgoing/incoming relation summaries, kernel coordinate anchors, pointer-web count, harmonic pointer metadata, and QVData source/command. `Body/S/S2/graph-services/src/retrieval/hybrid.rs` carries `embedding_version` and `q_schema_version` into semantic-cache attributes.

## Build Contract

Semantic refresh must be driven by deterministic source hash, embedding version, q-schema version, and empty/missing embedding detection. Only semantic anchor coordinates should be refreshed. Embedding provider/runtime failures must be observable. `q_*` fields are not optional decoration: they are the semantic extraction inputs that let [[S2']] retrieval remain coordinate-aware.

## Test Obligations

Use `Body/S/S2/graph-services/tests/semantic_cache_contract.rs`, `retrieval_fusion_contract.rs`, `retrieval_vak_bias.rs`, and stale-node/semantic-document tests as the suite expands. Existing tests must assert safe kernel-coordinate anchor material in semantic documents, including pointer-web count and harmonic pointer provenance.

## Open Gaps

The full changed-node-only refresh pipeline exists as contracts and helpers, but operational scheduling and promotion coupling remain incomplete. Embedding execution depends on provider configuration and should not be treated as always-on in specs.

## Boundaries

[[S2.2]] imports and reconciles graph state. [[S2.4]] caches retrieval payloads. [[S2.3']] uses freshness metadata when shaping retrieval. [[S5]] chooses corpus/retrieval strategy for world-return meaning; [[S2.2']] only certifies semantic freshness.
