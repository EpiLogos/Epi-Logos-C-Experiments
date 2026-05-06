---
coordinate: "S3.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.2' Shard: Session Lineage Law

## Intent

Own session lineage, alias resolution, transcript windows, workspace derivation, and temporal authority over session state.

## Build Scope

- Preserve session ancestry.
- Resolve canonical session keys and aliases.
- Make transcript/history windows explicit.

## API / Envelope / TS

- Extends `s3.session.*` semantics.
- Populates session store handles and lineage fields.

## Implementation Hooks

- SessionStore.
- Redis session metadata.

## Test Obligations

- Alias resolves to canonical session.
- Patch/reset lineage survives restart where required.

## Boundaries

Session lineage is not [[Psyche]] continuity; S4 owns lived state.
