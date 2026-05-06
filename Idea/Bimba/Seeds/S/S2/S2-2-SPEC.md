---
coordinate: "S2.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S2.2 Shard: Ingestion and Reconcile

## Intent

Own ingestion, update, reconciliation, semantic-document building, hashing, and stale-node refresh.

## Build Scope

- Build semantic documents from vault/source graph inputs.
- Track content hash and embedding version.
- Re-embed changed nodes only where possible.

## API / Envelope / TS

- Supports graph upsert/enrich workflows.
- Feeds retrieval source sets and embedding state.

## Implementation Hooks

- semantic graph lifecycle plan.
- `q_*` extraction inputs.
- embedding provider.

## Test Obligations

- Changed content changes semantic hash.
- Unchanged content is not re-embedded.
- Embedding version drift is detected.

## Boundaries

S2.2 ingests structure; S5 owns world-return corpus meaning.
