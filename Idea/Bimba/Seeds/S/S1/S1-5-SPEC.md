---
coordinate: "S1.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.5 Shard: Search, Backlinks, Sync, Graduation

## Intent

Own vault return operations: backlinks, search, sync flush, graduation, archive, and handoff to graph/world layers.

## Build Scope

- Implement real backlinks, not prose-only references.
- Decide executable status of `s1.sync.flush`.
- Promote artifacts through Present -> Seeds -> World when authorised.

## API / Envelope / TS

- Supports `s1.backlinks`, `s1.sync.flush`, `s1'.form.graduate`.
- Populates `s_1_graduation_path` and `s_2_sync_destination`.

## Implementation Hooks

- `epi vault search`.
- sync queue / Pleroma bridge.
- Hen graduation law.

## Test Obligations

- Backlink query over real files.
- Graduation writes to expected residency class.

## Boundaries

S1.5 prepares handoff; [[S2']] owns graph sync semantics and [[S5']] owns promotion meaning.
