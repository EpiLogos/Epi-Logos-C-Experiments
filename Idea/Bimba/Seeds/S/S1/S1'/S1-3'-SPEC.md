---
coordinate: "S1.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-05-19-hen-coordinate-graph-promotion]]"
---

# S1.3' Shard: Compiler Spine

## Canonical Role

[[S1.3']] is the [[P3]] / [[CT3]] / [[L2']] [[Hen]] compiler spine: compile planning, ledger channels, query/injection contracts, executor selection, and mutation review. [[S1.3]] records the material vendor/Rust substrate; [[S1.3']] decides the lawful compiler invocation that agents may use.

## Source And Diagram Anchors

Primary seed sources: [[S1'-SPEC]], [[S1-SPEC]], [[S1'-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], and [[2026-05-19-hen-coordinate-graph-promotion]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for compiler output consumed by [[Anima]], [[Epii]], [[Pleroma]], and [[M']], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S1' placement, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] for dry-run/current-state honesty. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

`Body/S/S1/hen-compiler-core/src/lib.rs` defines 12 envelope ledger channels, QL-first ordering, `CompilerResidencyPlan`, `CompilerInvocation`, `CompilePlanRequest`, and `plan_compile`. `compiler_invocation` distinguishes `PiAgent`, `Service`, and `VendorClaudeSdk`, plus [[Anima]] and [[Epii]] target agents. `plan_compile` currently supports dry-run planning with concrete source/output paths and refuses non-dry-run mutation unless the executor is `PiAgent`; even then non-dry-run is not implemented yet. Paired tests exist in Rust (`hen-compiler-core/tests/compile_plan.rs`) and Python vendor compatibility (`hen-compiler/tests/test_hen_compile_plan.py`).

## Build Contract

Every compiler job must include vault root, compiler root, day timestamp, ledger channel, thought lane `T0`-`T5`, artifact slug, executor kind, target agent, required skill/plugin body, dry-run flag, tool boundary, and review policy. Source path is canonical Day `daily-note.md`; compiled output is canonical `Idea/Pratibimba/Self/Thought/T/Tn/{slug}.md`; vendor paths are aliases only. Ledger order must place `ql` first, then the remaining envelope channels. Mutation requires review and must never silently use vendor SDK as canonical execution.

## API / Envelope / Implementation Hooks

Target methods: `s1'.compile`, `s1'.ledger.append`, `s1'.query`, `s1'.injection`, and `CompilerInvocation`. Current public functions: `resolve_compiler_residency`, `plan_compile`, `ql_first_channels`, `compiler_invocation`, and `validate_compile_artifact_frontmatter`. Envelope fields should carry ledger channel, source path, artifact path, target agent, required skill, compatibility backend flag, review policy, mutation mode, and errors.

## Test Obligations

Required tests: dry-run compile uses canonical Day source and Thought artifact output, QL channel compiles first, Epii invocation uses the epi-logos plugin body, unknown channels fail, invalid T lanes fail, missing source path is reported, non-dry-run compile requires `PiAgent`, and compiled artifact frontmatter must match residency/invocation. Tests must create real temp source files.

## Open Gaps

The compiler spine is not yet a non-dry-run mutation engine. Query and injection contracts are specified but not fully exposed as a gateway method family. Review/promotion policy is named but needs the S5'/Epii receipt path before mutation can become production behavior.

## Boundaries

[[S1.3']] owns compiler law. [[S1.3]] owns material substrate inventory. [[S4]] / [[Anima]] and [[S5]] / [[Epii]] may execute bounded compiler jobs but do not own residency. [[S2']] receives graph-sync or promotion evidence after validation. [[Pleroma]] supplies plugin/skill bodies, not vault law.
