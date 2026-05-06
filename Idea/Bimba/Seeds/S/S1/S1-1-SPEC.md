---
coordinate: "S1.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.1 Shard: Frontmatter and Provenance

## Intent

Own frontmatter parsing, validation, canonical key policy, source-coordinate provenance, and deprecated-key migration.

## Build Scope

- Parse body and frontmatter as structured data.
- Preserve `coordinate`, `c_1_ct_type`, `c_0_source_coordinates`, and residency facts.
- Identify stale key conventions explicitly.

## API / Envelope / TS

- Supports `s1.frontmatter.*`.
- Populates `s_1_artifact_ct_type` and `c_0_source_coordinates`.

## Implementation Hooks

- `epi vault frontmatter`.
- Markdown/frontmatter parser.

## Test Obligations

- Round-trip frontmatter without body loss.
- Validate canonical keys and flag deprecated ones.

## Boundaries

Frontmatter describes artifact form; it does not decide higher-level [[VAK]] routing.
