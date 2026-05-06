---
coordinate: "S5.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S5.5' Shard: Return-to-Ground Law

## Intent

Own keep/discard, promotion, SEED generation, QL schema evolution, and the return of S5 decisions to S0/S1.

## Build Scope

- Promote accepted changes through Seeds/World.
- Generate next-cycle questions from insights.
- Evolve QL schema only through reviewed decisions.

## API / Envelope / TS

- Owns `s5'.seed.generate`, `s5'.ql.schema`, and promotion targets.

## Implementation Hooks

- Epii improvement outputs.
- Hen residency law.
- S0 parity return.

## Test Obligations

- SEED contains review/improvement provenance.
- QL schema change is versioned.

## Boundaries

S5.5' completes return; S0 verifies executability.
