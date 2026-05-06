---
coordinate: "S1.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.0' Shard: Residency Law

## Intent

Own [[Hen]] residency resolution and canonical path law.

## Build Scope

- Distinguish `World` as flat ontology from `World/Types` as type mirror.
- Encode ordered `#`, psychoid, and `C..M` mirror expectations.
- Decide residency class before writes.

## API / Envelope / TS

- Supports `s1'.residency.resolve`.
- Populates `s_1_target_vault_zone` and `s_1_target_residency_class`.

## Implementation Hooks

- Hen residency resolver.
- Vault path registry.

## Test Obligations

- Resolve each residency class to the correct path.
- Reject stale path conventions.

## Boundaries

Residency law decides where artifacts live, not what they mean to Epii.
