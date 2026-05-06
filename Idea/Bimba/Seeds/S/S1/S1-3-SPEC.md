---
coordinate: "S1.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.3 Shard: Compiler Vendor Lift

## Intent

Own the practical lift from `epi-dev-vault` vendor basis into a typed compiler facade.

## Build Scope

- Define compile inputs, outputs, ledger channels, query, and injection.
- Avoid treating vendor seams as final ontology.
- Make ledger records testable and durable.

## API / Envelope / TS

- Supports `s1'.compile`, `s1'.ledger.append`, `s1'.query`, `s1'.injection`.
- Requires explicit TS parity for ledger shapes.

## Implementation Hooks

- `epi-dev-vault/`.
- Hen compiler spine.

## Test Obligations

- Compile a real artifact.
- Append and query a ledger entry.
- Verify injection does not bypass residency law.

## Boundaries

The compiler writes lawful vault form; graph enrichment belongs to [[S2']].
