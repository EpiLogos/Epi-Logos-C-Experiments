---
coordinate: "S2.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.3 Shard: Traversal and GraphRAG

## Intent

Own graph traversal, GraphRAG substrate, provenance, and cross-namespace edge navigation.

## Build Scope

- Traverse by coordinate, relation, and depth.
- Preserve provenance for returned graph regions.
- Support Bimba/Gnosis/episodic coexistence without merging their authority.

## API / Envelope / TS

- Supports `s2.graph.traverse` and S2' retrieval.
- Feeds `s_2_source_set` and graph handles.

## Implementation Hooks

- Neo4j traversal queries.
- GraphRAG adapter.
- Bimba relation registry.

## Test Obligations

- Traverse known test graph.
- Preserve provenance and namespace on results.

## Boundaries

Traversal supplies candidates; [[Epii]] governs high-level disclosure.
