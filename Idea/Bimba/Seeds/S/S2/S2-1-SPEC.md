---
coordinate: "S2.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.1 Shard: Node and Index Schema

## Intent

Own graph node labels, properties, vector indexes, relation tables, and coordinate identity persistence.

## Build Scope

- Define canonical node properties and labels.
- Create vector indexes with explicit embedding dimension/version.
- Preserve coordinate identity as graph ground.

## API / Envelope / TS

- Supports `s2.graph.node`, `s2.graph.query`.
- Feeds `s_2_graph_region_handles`.

## Implementation Hooks

- Neo4j schema migrations.
- vector index setup.
- Bimba dataset import.

## Test Obligations

- Create/query a test coordinate node.
- Assert vector index dimension and version.

## Boundaries

Schema is substrate; lawful retrieval ranking belongs to [[S2.3']].
