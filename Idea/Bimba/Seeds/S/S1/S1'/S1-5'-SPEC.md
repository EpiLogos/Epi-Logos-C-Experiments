---
coordinate: "S1.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.5' Shard: Vault Return Law

## Intent

Own promotion destinations, sync/backlink output, archive state, and return-to-ground vault effects.

## Build Scope

- Define Present -> Seeds -> World promotion evidence.
- Keep sync flush honest about implementation state.
- Ensure archive and backlink outputs are durable.

## API / Envelope / TS

- Supports `s1.sync.flush`, `s1.backlinks`, and form graduation.
- Populates `s_1_graduation_path`.

## Implementation Hooks

- Hen promotion law.
- vault search/backlinks.
- sync queue.

## Test Obligations

- Search/backlink over real files.
- Promote only to lawful destination.

## Boundaries

S1.5' moves artifacts lawfully; Epii supplies reflective approval when required.
