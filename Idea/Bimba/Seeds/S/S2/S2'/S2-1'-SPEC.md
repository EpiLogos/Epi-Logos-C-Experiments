---
coordinate: "S2.1'"
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

# S2.1' Shard: Relation And Type Law

## Canonical Role

[[S2.1']] is the [[P1']] / [[CT1]] / [[L1']] definition shard of [[S2']]: it owns lawful graph relation types, coordinate-domain constraints, node/edge semantic typing, and provenance requirements above the raw [[S2.1]] schema registry. It turns labels and properties into [[Indra's Net]] relation law.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[S2]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Legacy anchors: [[S2-1']], [[S2'Cx]], [[S2-S2i-GRAPH]], [[2026-04-04-neo4j-m-branch-coordinate-schema-population-design]], and [[2026-03-08-knowing-graph-convergence-plan]].

## Current Body Reality

`Body/S/S2/graph-schema/src/lib.rs` registers relationship type specs and relationship evidence properties such as `evidence_kind`, `evidence_text`, `source_path`, `source_line`, `target_text`, `confidence`, and `inferred_by`. `Body/S/S2/graph-services/src/relationship_manager.rs` plans relationship writes and rejects unknown graph relationship property keys. `Body/S/S2/graph-services/src/schema.rs` validates relationship properties. `Body/S/S2/graph-services/src/sync_coordinator.rs` carries `PromotionRelationCandidate` and reviewable evidence for inferred relationships.

## Build Contract

Every lawful relation must name source coordinate, target coordinate, relation type, confidence/evidence where inferred, and source provenance when promoted from [[S1]] or code. Position-style relation semantics may be preserved, but they must pass through registry validation rather than old free-form QL naming. Relation/property sync must never invent graph truth without evidence.

## Test Obligations

Use `Body/S/S2/graph-schema/tests/relationship_registry.rs`, `Body/S/S2/graph-services/tests/relationship_manager_contract.rs`, `graph_promotion_contract.rs`, `property_proposal_contract.rs`, and `code_provenance_contract.rs`. Tests must reject unknown relation properties, assert parameterized source/target coordinate matching, and verify relation evidence survives promotion.

## Open Gaps

Some old [[S2']] texts describe property/relationship equivalence poetically. The current law is stricter: equivalence must be represented as a reviewed sync plan or validated relation candidate, not a silent property rewrite.

## Boundaries

[[S2.1]] owns raw property/label/index schema. [[S2.2']] owns semantic freshness over graph content. [[S1']] owns vault form and wikilink extraction. [[S5']] decides when relation evidence becomes review/pedagogy material; [[S2.1']] only makes it lawful graph evidence.
