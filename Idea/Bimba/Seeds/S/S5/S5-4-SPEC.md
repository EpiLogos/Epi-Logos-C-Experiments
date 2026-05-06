---
coordinate: "S5.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.4 Shard: Review and Improvement Context

## Intent

Own Epii review inbox, human validation gates, consent thresholds, autoresearch context, and evaluation/promotion decisions.

## Build Scope

- Define `s5'.review.*` request/response shapes.
- Promote review envelope fields.
- Route Anima/Aletheia/Sophia outputs to Epii as meaning-recipient.

## API / Envelope / TS

- Owns `s5'.review.*` and `s5'.improve.*`.
- Populates `s_5_review_inbox_item`, `s_5_review_resolution`, and improvement fields.

## Implementation Hooks

- Epii PI target.
- `vendors/autoresearch`.
- Darshana/Zeithoven evaluation concepts.

## Test Obligations

- Submit/resolve real review item.
- Autoresearch proposal links to baseline/challenger/evaluation.

## Boundaries

Review inbox is not a generic queue; it is Epii's user-position meaning surface.
