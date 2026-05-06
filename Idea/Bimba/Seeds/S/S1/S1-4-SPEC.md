---
coordinate: "S1.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.4 Shard: Day and NOW Artifacts

## Intent

Own vault artifacts for [[Day]] and [[NOW]]: daily parent notes, per-subsession `now.md`, backlinks, and provenance.

## Build Scope

- Day is parent; NOW is a session child.
- Use `daily-note.md` and per-session `now.md` forms.
- Preserve backlinks between Day, NOW, session, and produced artifacts.

## API / Envelope / TS

- Supports vault writes used by `s3'.day.*` and `connect`.
- Populates residency facts for temporal artifacts.

## Implementation Hooks

- `epi vault day-init` and related commands.
- Hen artifact creation.
- Chronos handoff.

## Test Obligations

- Create Day and NOW in a real test vault.
- Verify lineage and backlinks.

## Boundaries

S1.4 writes temporal artifacts; [[S3']] owns temporal authority.
