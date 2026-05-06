---
coordinate: "S1.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.1' Shard: CT and Metadata Identity

## Intent

Own CT/frontmatter identity, coordinate metadata, and typification state.

## Build Scope

- Validate CT type and coordinate fields.
- Preserve source-coordinate provenance.
- Mark typification state explicitly.

## API / Envelope / TS

- Supports `s1'.type.*` and frontmatter validation.
- Populates `s_1_typification_state`.

## Implementation Hooks

- Hen CT registry.
- frontmatter validator.

## Test Obligations

- Validate a CT4a spec and CT4b flow.
- Fail invalid coordinate metadata.

## Boundaries

CT identity is form law; runtime routing belongs to [[S4']].
