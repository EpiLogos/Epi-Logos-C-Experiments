---
coordinate: "S2.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.3' Shard: Retrieval and Disclosure Law

## Intent

Own coordinate-aware retrieval, rerank, disclosure density, and lawful result shaping.

## Build Scope

- Apply coordinate scope and disclosure density.
- Rerank graph/vector candidates.
- Preserve source handles for S4 context assembly.

## API / Envelope / TS

- Supports `s2'.retrieve`, `s2'.rerank`.
- Populates `s_2_source_set`, `s_2_retrieval_mode`, `s_2_disclosure_density`.

## Implementation Hooks

- graph/vector retriever.
- reranker.
- context assembly bridge.

## Test Obligations

- Retrieval respects coordinate scope.
- Disclosure density changes returned detail.

## Boundaries

S2.3' shapes candidates; [[Epii]] governs meaning and pedagogy.
