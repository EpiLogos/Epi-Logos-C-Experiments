---
coordinate: "S0.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0'-SPEC]]"
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.1' Shard: Command Law and Parity

## Canonical Role

[[S0.1']] is the [[P1']] / [[CT1]] / [[L1']] law of [[S0']]: the reflective mapping between `epi` command affordances, coordinate-native API methods, gateway method names, TypeScript/schema contracts, and owner coordinates.

## Source And Diagram Anchors

Anchors: [[S0'-SPEC]], [[S0-SPEC]], [[S0-1-SPEC]], [[S0-SHARD-INDEX]], [[S-SYSTEM-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S0]], and [[S0']]. Migrated sources: [[S0-S0i-CLI-CORE]], [[S_Series_Master_CLI_Architecture]], [[2026-03-05-epi-cli-design]], [[2026-03-05-epi-cli-expansion]], historical [[S0-1']], and [[13-s-sprime-modularity-and-s0-membrane-cleanup]].

## Current Body Reality

`Body/S/S0/epi-cli/src/gate/parity.rs` is the strongest current parity surface. It re-exports `METHOD_NAMES` from `epi_s3_gateway_contract`, defines `CoordinateParityStatus`, and records owner/status/CLI mirror/body path/test evidence/authority path/adapter path. `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs` explicitly prevents S0 from inventing gateway routes outside [[S3]] contract law. `Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json` gives machine-readable membrane evidence.

## Build Contract

- Every accepted method needs owner coordinate, canonical method, live gateway method if any, CLI mirror if any, authority path, adapter path, status, and tests.
- S0 may maintain an operator-facing parity ledger, but route classification must come from [[S3]] contract law.
- Temporary wrappers such as Graphiti sidecars must stay labelled as transitional.
- `epi gnostic`, `epi kbase`, and similar naming decisions must be resolved by [[S5]] / [[S5']] before becoming canonical.

## API / Envelope / Implementation Hooks

This shard feeds parity, portal surfaces, and CI guardrails rather than a single envelope field. Hooks: `gate/parity.rs`, `gate/server.rs`, `gate_full_parity_contract.rs`, `s0_membrane_guardrails.rs`, `portal/surfaces.rs`, and `contract-inventory`.

## Test Obligations

Existing: `gate_full_parity_contract.rs`, `gate_parity_manifest.rs`, `s0_membrane_guardrails.rs`, `portal_surfaces_contract.rs`, and `gate_method_parity.rs`. Required: a shard-level docs/spec check that every S0/S0' method named in seeds has a parity row or an explicit "target only" status.

## Open Gaps

The target coordinate-native API is richer than the live gateway manifest. This shard must prevent panic-normalisation: do not turn current product-native gateway names into eternal coordinate law.

## Boundaries

[[S0.1']] maps command law. [[S3]] owns route classification. [[S1]]-[[S5]] own method semantics. [[S0.1]] owns the raw CLI grammar.
