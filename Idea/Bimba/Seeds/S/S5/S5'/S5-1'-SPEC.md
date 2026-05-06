---
coordinate: "S5.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.1' Shard: Crystallised Form

## Intent

Own synthesis receive, explanation, teaching, canonical render, and M' output form.

## Build Scope

- Render Epii/Nara outputs for human-facing use.
- Preserve coordinate and source provenance.
- Keep publication connector optional.

## API / Envelope / TS

- Supports `s5'.explain`, `s5'.teach`, and M' output rendering.

## Implementation Hooks

- Epii teaching prompts.
- Nara M' outputs.

## Test Obligations

- Explanation includes coordinate context.
- Teaching output cites source handles.

## Boundaries

S5.1' renders; S5.4' evaluates.
