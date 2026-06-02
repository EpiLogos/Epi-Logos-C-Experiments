---
coordinate: "S2.1"
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

# S2.1 Shard: Node And Index Schema

## Canonical Role

[[S2.1]] is the [[P1]] / [[CT1]] / [[L1]] form-giving shard of [[S2]]: it owns graph labels, registered properties, constraints, relationship indexes, vector index declarations, and coordinate identity persistence for the raw graph substrate. Its role is schema law as infrastructure, not the fuller semantic interpretation owned by [[S2.1']].

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S2']], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and `Idea/Bimba/World/Types/Coordinates/S/S2/S2.canvas`. Legacy anchors: [[S2-1]], [[S2-S2i-GRAPH]], [[2026-04-04-neo4j-m-branch-coordinate-schema-population-design]], [[2026-02-22-bimba-data-foundation-harmonization]], and [[S2'Cx]] for old C-level graph property pressure.

## Current Body Reality

The canonical registry is `Body/S/S2/graph-schema/src/lib.rs`. It defines `SCHEMA_VERSION = "2026-05-17-s2-bimba-coord-driven-3072"`, `EMBEDDING_VERSION = "q-semantic-v2-3072"`, the `:Bimba` label, coordinate properties, compatibility labels, kernel-resonance labels, pointer-web properties, and registered node/relationship property specs. `Body/S/S2/graph-services/src/schema.rs` exposes `coordinate_node_property_specs`, `coordinate_relationship_property_specs`, `validate_node_properties`, `validate_relationship_properties`, and `create_schema`. Tests in `Body/S/S2/graph-schema/tests/*` and `Body/S/S2/graph-services/tests/schema_creation_contract.rs` already assert registry coverage.

## Build Contract

Every graph write that claims canonical [[Bimba]] status must use `coordinate` as identity, assign registered labels/properties, and validate unknown properties through the registry or the coordinate-prefix property law. The vector index must remain explicit about 3072 dimensions and `coord_embedding`. Compatibility labels are allowed for migration, but new canonical law should use coordinate-driven `c_*`, `s_*`, and `m_*` property families.

## Test Obligations

Run the schema crate tests for property, label, relationship, coordinate-prefix, and authority-drift contracts. Run graph-service tests for schema creation, frontmatter property rules, relationship manager contracts, property proposals, and graph promotion. Live Neo4j schema creation must be tested against a real service when changing constraints or index declarations.

## Open Gaps

Some compatibility properties and old `#`/`bimbaCoordinate` traces still exist by design. The gap is not their existence; the gap is finishing the migration path so every compatibility read exposes provenance and every canonical write uses [[S2.1]] registry law.

## Boundaries

[[S2.0]] owns service readiness. [[S2.2]] owns ingestion/reconciliation that uses this schema. [[S2.1']] owns semantic relation/type law above raw schema. [[S1']] owns frontmatter shape before promotion. [[S5]] and [[Graphiti]] may store data in the graph, but they do not mint raw [[S2.1]] schema outside registry review.
