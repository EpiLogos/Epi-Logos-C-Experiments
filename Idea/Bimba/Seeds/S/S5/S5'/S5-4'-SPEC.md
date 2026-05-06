---
coordinate: "S5.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.4' Shard: Epii Autoresearch and Review

## Intent

Own Epii autoresearch as dynamic self-improvement spine, review/validation context, Darshana evaluation, Zeithoven challengers, and cross-period synthesis.

## Build Scope

- Define review item lifecycle.
- Evaluate baseline vs challenger.
- Route decisions to Nara action, autoresearch, SEED, or promotion.

## API / Envelope / TS

- Owns `s5'.review.*`, `s5'.improve.*`.
- Populates review and improvement fields.

## Implementation Hooks

- Epii review inbox.
- `vendors/autoresearch`.
- Darshana/Zeithoven.

## Test Obligations

- Review resolution is durable and auditable.
- Autoresearch history records decision chain.

## Boundaries

Autoresearch is Epii's spine, not ambient infrastructure.
