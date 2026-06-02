---
coordinate: "S2.3'"
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

# S2.3' Shard: Retrieval And Disclosure Law

## Canonical Role

[[S2.3']] is the [[P3']] / [[CT3]] / [[L3']] pattern law of [[S2']]: coordinate-aware retrieval, hybrid rerank, disclosure density, result shaping, and context-pool source discipline. It is where [[Indra's Net]] becomes a usable retrieval contract instead of a pile of candidate rows.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[GraphRAG]], [[Indra's Net]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC: `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Migrated anchors: [[S2-3']], [[S2-5']], [[S2']], [[S2-S2i-GRAPH]], and [[2026-03-08-knowing-graph-convergence-plan]].

## Current Body Reality

`Body/S/S2/graph-services/src/retrieval/graphrag.rs` implements query classification, coordinate mention extraction, position inference, progressive disclosure, context depth clamp, and batch disclosure. `Body/S/S2/graph-services/src/retrieval/hybrid.rs` supports `graph_only`, `vector_only`, `hybrid_rrf`, and `hybrid_weighted` modes with semantic-cache lookup/store. `Body/S/S2/graph-services/src/retrieval_query.rs` defines query type, disclosure level, retrieval mode, tokenization, fusion, and VAK/position hints. Tests include `retrieval_fusion_contract.rs` and `retrieval_vak_bias.rs`.

## Build Contract

Retrieval requests must carry coordinate scope, mode, disclosure density/depth, top_k bounds, provenance, and result source. Graph/vector fusion must be deterministic enough to test, and disclosure levels must change returned detail rather than only labels. Context-pool outputs for [[Anima]], [[Psyche]], [[Hen]], [[Aletheia]], [[Epii]], and [[Nara]] must include source handles that can be reviewed later.

## Test Obligations

Test coordinate-scope enforcement, disclosure-level differences, VAK/position bias, hybrid fusion, cache hit/miss path, and graph-only fallback without embeddings. Any test that requires live [[Neo4j]] or embeddings must be explicitly marked and documented, not mocked into false confidence.

## Open Gaps

Canonical methods `s2'.retrieve`, `s2'.rerank`, and `s2'.enrich` are present in contract language but not fully unified across [[S3]] gateway transport, [[S0]] CLI mirror, and graph-services API. Disclosure density is implemented in graph-services terms, but final [[S5']] pedagogy/review shaping is adjacent.

## Boundaries

[[S2.3]] supplies traversal/candidates. [[S2.4']] governs cache boundaries. [[S4']] declares retrieval scope through [[Anima]]/[[VAK]] context. [[S5']] owns pedagogical meaning, review, and world-return interpretation.
