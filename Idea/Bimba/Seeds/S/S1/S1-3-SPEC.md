---
coordinate: "S1.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-05-19-hen-coordinate-graph-promotion]]"
---

# S1.3 Shard: Compiler Vendor Lift

## Canonical Role

[[S1.3]] is the [[P3]] / [[CT3]] / [[L3]] pattern surface that names the material compiler lift from vendor memory tooling into the S1/S1' vault body. Base-side [[S1.3]] owns the real substrate inventory, ledger files, script compatibility, and concrete compile/query/injection file effects. Prime-side [[S1.3']] owns the canonical [[Hen]] compiler contract.

## Source And Diagram Anchors

Primary seed sources: [[S1-SPEC]], [[S1'-SPEC]], [[S1-SHARD-INDEX]], [[S1-S1i-OBSIDIAN]], and [[2026-05-19-hen-coordinate-graph-promotion]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for the compiler's S1/S1' placement, [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for agent/[[M']] consumption, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] because the vendor fork is compatibility substrate, not final ontology. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas` and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

The vendor-compatible body is `Body/S/S1/hen-compiler/`: Python hooks (`hooks/session-start.py`, `session-end.py`, `pre-compact.py`), scripts (`compile.py`, `query.py`, `flush.py`, `lint.py`, `hen_compile_plan.py`, `hen_residency.py`), `daily/`, `knowledge/`, and `ledger/`. The canonical Rust lift is already under `Body/S/S1/hen-compiler-core/src/lib.rs`, where `ENVELOPE_LEDGER_CHANNELS`, `ql_first_channels`, `CompilerResidencyPlan`, `CompilerInvocation`, `CompilePlanRequest`, and `plan_compile` define a dry-run planning facade. Tests exist in both `Body/S/S1/hen-compiler/tests/test_hen_compile_plan.py` and `Body/S/S1/hen-compiler-core/tests/compile_plan.rs`.

## Build Contract

The compiler lift must keep vendor seams intelligible while refusing to mistake them for canon. Vendor `daily/YYYY-MM-DD.md` is a compatibility alias for `Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md`; vendor `knowledge/concepts/{slug}.md` is a compatibility alias for `Idea/Pratibimba/Self/Thought/T/Tn/{slug}.md`. A compile plan must name source paths, output artifacts, ledger channel, target executor, required skill/plugin body, review policy, and mutation mode. Non-dry-run mutation requires `pi_agent` and must remain blocked until review/promotion law is complete.

## API / Envelope / Implementation Hooks

Current API shape is `CompilerInvocation` / `CompilePlanRequest` / `CompilePlanResponse`, plus method-family targets `s1'.compile`, `s1'.ledger.append`, `s1'.query`, and `s1'.injection`. The base shard records material effects: ledger append paths, source day paths, compiled thought artifacts, and vendor aliases. The prime shard records semantic law: executor selection, [[Anima]] / [[Epii]] target agent, required skill, and mutation review.

## Test Obligations

Keep paired Rust/Python tests for dry-run compile planning, QL-first ledger order, missing canonical day source reporting, unknown channel rejection, Epii plugin invocation, and non-dry-run refusal when the executor is not `PiAgent`. Tests must create real temporary daily-note files and assert concrete output paths, not mock compiler success.

## Open Gaps

`plan_compile` currently returns `compiled: 0` in dry-run and reports non-dry-run as unimplemented even for `PiAgent`; this is correct current-state honesty. The injection/query side is still more vendor-shaped than canonical. No shard should claim a working mutable compiler spine until the review gate and ledger mutation are actually implemented.

## Boundaries

[[S1.3]] inventories and constrains the material compiler substrate. [[S1.3']] owns the [[Hen]] compiler spine contract. [[S0]] executes CLI/gateway calls. [[S4]] / [[Anima]] and [[S5]] / [[Epii]] may execute bounded jobs, but neither owns the vault residency law. [[S2']] receives graph-sync intent after the compiler has produced validated artifact evidence.
