---
coordinate: "S3.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.2 Shard: Session Authority

## Intent

Own session listing, retrieval, patching, history, aliases, transcripts, compaction/reset lineage, and workspace scope.

## Build Scope

- Make session identity durable enough for clients.
- Preserve patch/reset/delete/compact lineage.
- Keep history windows explicit.

## API / Envelope / TS

- Owns `s3.session.*`.
- Populates `s_3_session_id`, `s_3_history_limit`, `s_3_patch_lineage`.

## Implementation Hooks

- gateway session store.
- Redis session metadata.

## Test Obligations

- Create/list/get/patch session state.
- Compact/reset lineage remains queryable.

## Boundaries

Session store is transport/runtime state; Psyche lived state belongs to [[S4']].
