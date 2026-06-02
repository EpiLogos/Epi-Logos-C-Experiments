---
coordinate: "S2.3"
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

# S2.3 Shard: Traversal And GraphRAG Substrate

## Canonical Role

[[S2.3]] is the [[P3]] / [[CT3]] / [[L3]] pattern shard of [[S2]]: it owns bounded traversal, raw graph-region assembly, graph-first retrieval candidates, and provenance-preserving path context. It supplies the substrate for [[GraphRAG]] without deciding final disclosure or pedagogical meaning.

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S2']], [[GraphRAG]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC: `Idea/Bimba/World/Types/Coordinates/S/S2/S2.canvas`. Migrated sources: [[S2-3]], [[S2-4]], [[S2-5]], [[S2']], [[S2-S2i-GRAPH]], and [[2026-03-08-knowing-graph-convergence-plan]].

## Current Body Reality

`Body/S/S2/graph-services/src/graph_api.rs` defines `GraphTraverseRequest`, `GraphTraverseDirection`, and `bounded_depth`, currently clamping traversal depth to 1..4. `Body/S/S2/graph-services/src/retrieval/graphrag.rs` classifies queries, extracts coordinate mentions, infers positions, computes disclosure level, performs progressive disclosure, and optionally attaches context. `Body/S/S2/graph-services/src/retrieval/hybrid.rs` performs graph, vector, RRF, and weighted retrieval modes, falling back cleanly when vector search is unavailable. `Body/S/S2/external/bimba-mcp/src/index.ts` exposes external graph traverse/context/search/disclosure tools, but those are adapter surfaces, not internal PI law.

## Build Contract

Traversal must always be bounded, coordinate-validated, namespace-aware, and provenance-carrying. GraphRAG substrate results must include enough coordinate, relation, source, score, and context metadata for [[S2.3']] rerank/disclosure and [[S5]] review to make meaningful decisions. Cross-namespace traversal must be explicit: [[Bimba]], [[Gnosis]], and [[Graphiti]] may share physical graph space but cannot collapse authority.

## Test Obligations

Use `Body/S/S2/graph-services/tests/graph_api_contract.rs`, `retrieval_fusion_contract.rs`, `retrieval_vak_bias.rs`, `coordinate_query_contract.rs`, and live ignored graph API tests when a real [[Neo4j]] service is available. Any traversal change must assert depth bounds and parameterized queries.

## Open Gaps

The canonical gateway surface for `s2.graph.traverse` exists as contract code, but transport parity across [[S3]] gateway and [[S0]] CLI remains uneven. GraphRAG retrieval is concrete but still partly graph-only unless embeddings and semantic cache are configured.

## Boundaries

[[S2.1]] owns relation registry/schema. [[S2.3']] owns lawful retrieval and disclosure. [[S2.4]] owns semantic-cache acceleration. [[S3']] owns temporal episodes and [[Graphiti]] runtime. [[S5']] owns user-facing review, pedagogy, and meaning synthesis.
