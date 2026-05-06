---
coordinate: "S1.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.3' Shard: Compiler Spine

## Intent

Own compile, ledger, query, and injection as the Hen compiler spine.

## Build Scope

- Raise `epi-dev-vault` from vendor basis into stable contracts.
- Define ledger event types.
- Make query/injection typed and auditable.

## API / Envelope / TS

- Supports `s1'.compile`, `s1'.ledger.append`, `s1'.query`, `s1'.injection`.
- Needs explicit TS parity for ledger records.

## Implementation Hooks

- `epi-dev-vault`.
- Hen compiler service.

## Test Obligations

- Compile with real input and assert ledger output.
- Query compiler output by coordinate.

## Boundaries

Compiler ledgers are vault law; S0 only executes and S2 only reflects.
