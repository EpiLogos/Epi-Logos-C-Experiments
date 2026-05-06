---
coordinate: "S5.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.1 Shard: Connector and Rendering Form

## Intent

Own canonical rendering, pedagogy, publication-facing forms, NotebookLM/book surfaces, and optional external connectors.

## Build Scope

- Render explanations and M' outputs in stable form.
- Keep publication/Notion secondary.
- Support book and NotebookLM helper surfaces.

## API / Envelope / TS

- Supports `s5'.explain`, `s5'.teach`, and connector outputs.

## Implementation Hooks

- `epi book`.
- `epi notebook`.
- publication connectors.

## Test Obligations

- Explanation render includes coordinate provenance.
- Connector absence does not fail core S5.

## Boundaries

Rendering teaches; review and improvement belong to S5.4/S5.4'.
