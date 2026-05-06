---
coordinate: "S0.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.1' Shard: Command Law and Parity

## Intent

Own the law that maps `epi` command affordances to coordinate-native API methods without confusing command nesting for ontology.

## Build Scope

- Build API/CLI parity manifest.
- Mark aliases, temporary wrappers, and retired names.
- Keep `epi gnostic`, `epi kbase`, and Graphiti command decisions explicit.

## API / Envelope / TS

- Cross-checks every accepted local command mirror against API and TS.

## Implementation Hooks

- `epi-cli` command registry.
- Gateway method manifest from [[S3.1']].

## Test Obligations

- Parity test fails when a documented method loses its CLI or gateway status unexpectedly.

## Boundaries

This shard maps names; it does not implement S1-S5 semantics.
