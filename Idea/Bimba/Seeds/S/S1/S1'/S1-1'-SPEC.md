---
coordinate: "S1.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S1-S1i-OBSIDIAN]]"
---

# S1.1' Shard: CT And Metadata Identity

## Canonical Role

[[S1.1']] is the [[P1]] / [[CT1]] / [[L4']] law surface where [[Hen]] decides whether a vault artifact's identity is coordinate-valid, CT-valid, temporally complete, and safe to treat as canonical evidence. It is the prime partner of [[S1.1]]: the base shard parses material frontmatter, while this shard defines the normative metadata contract.

## Source And Diagram Anchors

Primary seed sources: [[S1'-SPEC]], [[S1-SPEC]], [[S1-SHARD-INDEX]], [[S1'-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], and the migrated S1' legacy forms [[S1']], [[S1'Cx]], [[S1-1']], and [[S1-2']]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for prime-law placement, [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[World]] / [[World/Types]] identity, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for [[Theia]], agents, and [[M']] consuming S1' write law. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

`Body/S/S1/hen-compiler-core/src/lib.rs` is the current Rust authority for identity validation. It accepts coordinate families `C/P/L/S/T/M`, prime suffixes, VAK names, `CF_*` names, and `#`/`#0`-`#5`; it rejects invalid coordinates before graph sync or compile validation. It whitelists canonical metadata keys and validates temporal requirements for `now` and `thought` artifacts. `Body/S/S0/epi-cli/src/vault/frontmatter.rs` mirrors this authority for CLI access, and `Body/S/S0/epi-cli/tests/gate_parity_manifest.rs` records `Body/S/S1/hen-compiler-core` as the S1' parity body.

## Build Contract

All CT/frontmatter identity decisions used by agents, [[Theia]], compiler jobs, and promotion flows must call or mirror the Hen core validator. Deprecated `bimbaCoordinate` may be preserved as compatibility evidence but must not become the canonical identity property. `coordinate` is the ground key. Temporal artifacts must include `day_id` and `session_id`; thought artifacts must include `thought_type`. Compiled artifacts must match their `CompilerResidencyPlan` and `CompilerInvocation`.

## API / Envelope / Implementation Hooks

The target API family includes `s1'.frontmatter.validate`, `s1'.type.validate`, and the deferred `s1'.vault.update_frontmatter`. Current reachable hooks are `validate_frontmatter`, `validate_compile_artifact_frontmatter`, `is_valid_coordinate`, and the S0 `frontmatter-validate` command. Gateway writes in `Body/S/S0/epi-cli/src/gate/s1_hen.rs` are already canonical for file write/rename/move, but frontmatter update remains deferred and must be represented as an open gap.

## Test Obligations

Keep tests in `Body/S/S1/hen-compiler-core/tests/frontmatter.rs`, `Body/S/S0/epi-cli/tests/vault_frontmatter.rs`, and `Body/S/S0/epi-cli/tests/gate_parity_manifest.rs`. Required cases: valid CT4a/CT4b-style metadata, invalid coordinates, deprecated-key warnings, temporal required keys, compile artifact residency mismatch, and S0 mirror parity. Tests must parse real YAML values or real files.

## Open Gaps

The validator currently enforces coordinate and metadata law but not a full CT registry with every CT/CT' artifact family. `s1'.vault.update_frontmatter` is deferred, so identity mutation is not yet governed with the same strength as write/rename/move. The vault still contains mixed `c_*` and unprefixed metadata conventions.

## Boundaries

[[S1.1']] defines identity law. [[S1.1]] exposes material parsed fields. [[S1.2']] creates lawful form identities. [[S4']] can route by [[VAK]] but does not own vault schema. [[S2']] treats identity as graph evidence only after Hen validation.
