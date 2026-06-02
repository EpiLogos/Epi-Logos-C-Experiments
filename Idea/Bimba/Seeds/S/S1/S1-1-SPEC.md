---
coordinate: "S1.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S1-S1i-OBSIDIAN]]"
---

# S1.1 Shard: Frontmatter And Provenance

## Canonical Role

[[S1.1]] is the [[P1]] / [[CT1]] / [[L1]] definition surface for vault identity inside [[S1]]. It owns the material frontmatter facts by which an [[Idea]] note becomes a coordinate-bearing artifact: `coordinate`, `c_1_ct_type`, `c_0_source_coordinates`, temporal keys, legacy compatibility warnings, and source provenance. It is not the whole [[Hen]] law of identity; its boundary is the parsed YAML/frontmatter body in the vault, while [[S1.1']] decides the normative [[CT]] and coordinate-validity contract.

## Source And Diagram Anchors

Primary seed sources: [[S1-SPEC]], [[S1-SHARD-INDEX]], [[S1-TRACEABILITY-INDEX]], [[S-SHARD-HARMONIZATION-PROTOCOL]], and [[S1-S1i-OBSIDIAN]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for the [[S1]]/[[S1']] split, [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[World]] / [[World/Types]] / [[Seeds]] residency, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] for the current CLI/Hen boundary. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S1/S1.md` and `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas`.

## Current Body Reality

The live parser/validator authority is now `Body/S/S1/hen-compiler-core/src/lib.rs`, where `validate_frontmatter`, `validate_compile_artifact_frontmatter`, `is_valid_coordinate`, `CANONICAL_METADATA_KEYS`, and deprecated-key warnings for `bimbaCoordinate`, `ql_position`, and `pos_*` are defined. `Body/S/S0/epi-cli/src/vault/frontmatter.rs` re-exports the Hen core contract, so `epi vault frontmatter-validate` is an [[S0]] executable mirror of [[S1.1]] rather than a separate law. Tests proving the current reality include `Body/S/S1/hen-compiler-core/tests/frontmatter.rs` and `Body/S/S0/epi-cli/tests/vault_frontmatter.rs`, including compiled artifact residency/invocation checks.

## Build Contract

`s1.frontmatter.read` / `epi vault frontmatter-get` may expose raw frontmatter, but validation must delegate to [[Hen]] contract logic. A valid frontmatter pass must preserve the markdown body, parse YAML as a mapping, accept canonical `coordinate` keys, warn on deprecated legacy keys, reject unknown non-coordinate metadata unless explicitly whitelisted, and require temporal keys for `artifact_role: "now"` and `"thought"`. The response envelope should surface `coordinate`, `c_1_ct_type` or `ctx_type`, `c_0_source_coordinates` / `source_coordinates`, warnings, errors, and the file path used as [[S1]] material evidence.

## API / Envelope / Implementation Hooks

Current hooks are `epi vault frontmatter-get`, `epi vault frontmatter-set`, `epi vault frontmatter-delete`, and `epi vault frontmatter-validate` in `Body/S/S0/epi-cli/src/vault/mod.rs`. The set/delete paths remain deprecated operator-local routes because they use `obsidian-cli` and do not yet pass through `s1'.vault.update_frontmatter`; the shard therefore requires any agentic or [[Theia]] mutation to wait for [[S1.1']] / `s1'.vault.update_frontmatter` rather than using the CLI escape hatch as canon.

## Test Obligations

Keep real parser tests in `hen-compiler-core/tests/frontmatter.rs` and S0 mirror tests in `epi-cli/tests/vault_frontmatter.rs`. Required coverage: valid canonical keys, invalid coordinate rejection, deprecated-key warnings, non-mapping frontmatter failure, compiled artifact validation against `CompilerResidencyPlan`, and single-frontmatter preservation when templates/VAK data are later written. Tests must create real YAML values or temp vault files; mock-only frontmatter claims are not sufficient.

## Open Gaps

`s1'.vault.update_frontmatter` is still deferred in `Body/S/S0/epi-cli/src/gate/s1_hen.rs`, so the mutation side of [[S1.1]] is not yet as strong as the validation side. The old `c_*` and newer unprefixed metadata families both exist in vault files, so migration needs an explicit compatibility ledger rather than silent normalization.

## Boundaries

[[S1.1]] parses and reports material identity. [[S1.1']] decides CT/coordinate law. [[S1.2]] and [[S1.2']] create new frontmatter through templates/forms. [[S1.4]] and [[S1.4']] add temporal requirements for [[Day]] and [[NOW]]. [[S2']] consumes the frontmatter as graph evidence but does not define the vault schema.
