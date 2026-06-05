# Canon Audit: S5 Integral World Boundary (Tranche 17 sub-rows)

**Auditor scope:** Audit the S5-touching sub-rows of Tranche 17 (S-stack modularisation) against S5-SPEC, S5-ARCHITECTURE, and the ratified DR rows DR-S5-1 / DR-S5-2 / DR-S3-2.
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (offset 0 limit 505, then 506 limit 200)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md`
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md` (offset 0 limit 384, then 385 limit 200)
- `Idea/Bimba/Seeds/S/S5/S5-0-SPEC.md`

(S5-1..S5-5 SPEC files are nominal sibling-shards per the canonical S5-SPEC index; they were available but the Tranche 17 sub-rows in scope only reference S5-ARCHITECTURE §5 substrate findings, which are themselves cross-referenced to S5-SPEC. The S5-0 shard was sampled as representative; per S5-SPEC §"Canonical Source Lock - 2026-06-02" line 711, all sibling-shard files are canonical S5 spec authority.)

## Per-row audit

The Tranche 17 sub-rows that touch S5 substrate (physical or conceptual): **17.4, 17.15**. DR-S5-1 + DR-S3-2 require a graphiti-runtime migration sub-row ("17.S3-graphiti-native") which is NOT present in Tranche 17 — flagged as MISSING-CITATION below.

### 17.4 — Split `capacity_workflows.rs` (2,584 LOC) into `capacity_workflows/{mod, registry, nara_voice, recursive_review, spine_inspector, aletheia_lineage, runner}.rs`

- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:284-288` (F1 file-split proposal with exact target submodule layout) and `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:160-167` (substrate file LOC + concern enumeration).
- **Current framing in tranche:** Code-cleanup-refactor; modularise the largest single S5 file behind a re-export façade, blast radius LOW.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche row matches F1 exactly (same six target submodules, same anti-greenfield posture, same `pub use` re-export discipline). DR-S5-2 (`RecursiveReviewProtocolKind` ownership at autoresearch-core `capacity_workflows.rs:240-246` per `13-decision-register.md:582-584`) is preserved by the `recursive_review.rs` submodule; nothing in the row reframes the classifier as moving to review-core.

### 17.15 — Split `Body/S/S5/epii-autoresearch-core/src/lib.rs` (2,049 LOC) + `epii-agent-core/src/lib.rs` (1,170 LOC). Per S5-ARCHITECTURE §5 findings F2 + F4.

- **Status:** WRONG-EXTRACTION (citation drift — finding is F2 + **F3**, not F2 + F4)
- **Cited:** `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:290-294` (F2 `epii-autoresearch-core/src/lib.rs` 2049 LOC split) and `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:296-300` (F3 `epii-agent-core/src/lib.rs` 1170 LOC split).
- **Current framing in tranche:** Bundled split of two S5 facade files into typed submodules.
- **Canon framing (if not ALIGNED):** The S5-ARCHITECTURE §5.1 section names only three file-level findings: F1 (`capacity_workflows.rs`), F2 (`epii-autoresearch-core/src/lib.rs`), F3 (`epii-agent-core/src/lib.rs`). There is no F4. The 17.15 reference "F2 + F4" mislabels F3 as F4 (`Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:296`).
- **Recommendation:** REWRITE
- **Recommendation detail:** Substrate scope is correct (the two files and their LOC counts match canon exactly per `S5-ARCHITECTURE.md:147-149` and `:67-83`). Only the §-reference is wrong; rewrite the trailing attribution as "Per S5-ARCHITECTURE.md §5 findings F2 + F3" and (optionally) name the target submodule shapes from canon (F2: `types | kernel_evidence | orchestration | promotion`; F3: `m5_workbench | deposits`). Keep substrate file:line cites and LOC counts; only the finding-ID label changes.

### 17.S3-graphiti-native (MISSING ROW — Tranche 17 omits the named sub-row that DR-S5-1 and DR-S3-2 both depend on)

- **Status:** MISSING-CITATION
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:572-580` (DR-S5-1: graphiti_service.py → Rust migration to `Body/S/S3/graphiti-runtime/`; "**Depends:** Tranche 17 (sub-row 17.S3-graphiti-native, shared with DR-S3-2)"). Also `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:558-566` (DR-S3-2: NativeLibraryClient as load-bearing; sidecar-compat deprecated at landing; "**Depends:** Tranche 17 (sub-row 17.S3-graphiti-native)"). Substrate cite for the source file: `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:111` (`graphiti_service.py` 534 LOC FastAPI wrapper, transitional, target `Body/S/S3/graphiti-runtime`) and `Idea/Bimba/Seeds/S/S5/S5-SPEC.md:104-105` (Graphiti is architecturally S3' temporal episodic runtime/library; current HTTP wrapper is not target architecture).
- **Current framing in tranche:** Not present. Tranche 17 lists rows 17.1 through 17.25 plus 17.6/17.13/17.20 gating notes; no row migrates `epi-gnostic/epi_gnostic/graphiti_service.py` into `Body/S/S3/graphiti-runtime/` Rust.
- **Canon framing:** Two ratified DRs (DR-S5-1 and DR-S3-2, both validated 2026-06-03) name Tranche 17 as the owning tranche for the migration AND require landing `NativeLibraryClient` as canonical Rust impl with `HttpCompatibilityClient` + `sidecar-compat/` marked `#[deprecated]` at landing.
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add Tranche row **17.S3-graphiti-native** (code-migration; DR-S5-1 + DR-S3-2 binding) under the Priority-2 or Adjacent-cleanup section. Scope: (1) lift `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` (534 LOC) logic into `Body/S/S3/graphiti-runtime/` Rust modules; (2) mark Python wrapper `_deprecated/` during cutover; (3) land `NativeLibraryClient` as load-bearing impl; (4) mark `HttpCompatibilityClient` + `Body/S/S3/graphiti-runtime/sidecar-compat/` with `#[deprecated(since = "2026-06-03", note = "Sidecar deprecated per DR-S3-2; use NativeLibraryClient")]`; (5) verification: `cargo check -p graphiti-runtime --no-default-features --features native_library_client` clean as default. Substrate-residency note (per `S5-SPEC.md:104-105` + `13-decision-register.md:550`): the destination crate physically lives at S3, but the row is in scope for S5 conceptually (world-return via Graphiti episodic) — flag with a citation to the residency-vs-conceptual rule so the reader doesn't propose moving the destination back into `Body/S/S5/`.

### Cross-check — Does Tranche 17 contain any drift CONTRADICTING ratified DRs touching S5?

- **DR-S5-1 (graphiti → Rust at `Body/S/S3/graphiti-runtime/`):** Tranche 17 makes no contradicting proposal — it simply omits the row. Not a contradiction; a gap (covered above).
- **DR-S5-2 (`RecursiveReviewProtocolKind` ownership at autoresearch-core `capacity_workflows.rs:240-246`):** Tranche 17.4 places `recursive_review.rs` in `capacity_workflows/` submodule, which preserves crate-level ownership. **ALIGNED.** Cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:582-584` + `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:286` (proposed submodule list includes `recursive_review.rs`).
- **DR-S3-2 (sidecar deprecated):** See MISSING-CITATION above.

### Cross-check — Tranche 17 scope statement / discipline

Lines 1-24 (scope + discipline + sources) name S5-ARCHITECTURE.md §5 substrate findings as the source for S5 rows; this is the correct authority chain per `S5-ARCHITECTURE.md:7` ("Domain authority for the S5 substrate layout"). **ALIGNED.** Cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:1-24`.

## Drift patterns observed

The Tranche 17 S5 sub-rows are **substrate-cite-correct** but **DR-binding-incomplete**. Two patterns surface:

1. **Citation-label drift inside a single row.** 17.15 cites "F2 + F4" where canon names "F2 + F3". The substrate file paths and LOC counts are correct (2,049 + 1,170 LOC, the two named `lib.rs` facades); only the finding-letter is wrong. This is the cheapest possible drift to fix — a one-character edit — but it indicates the row was written without re-opening S5-ARCHITECTURE §5.1 to confirm finding IDs. The same kind of drift caused DR-TUI-1's standalone-bimba-graph-viewer mistake (proposing extensions the canon already specs as chrome).

2. **DR-binding gap.** Two ratified DRs (DR-S5-1, DR-S3-2 — both validated 2026-06-03) explicitly name Tranche 17 as the owning tranche and even name the sub-row ("17.S3-graphiti-native"), but Tranche 17 was not patched to add the row when those DRs ratified. This is the inverse of DR-TUI-1's pattern: rather than inflating a new extension, the tranche silently dropped a ratified migration. The substrate finding (the 534-LOC `graphiti_service.py` FastAPI wrapper marked transitional in S5-ARCHITECTURE §2.3.1 + S5-SPEC §"Current Implementation State") is real; only the tranche wiring is missing.

The S-stack-modularisation tranche otherwise honors the anti-greenfield, re-export-façade, preserve-public-API discipline (per `S5-ARCHITECTURE.md:5-7, 442` "no forbidden greenfield items"). The S5 substrate-residency-vs-conceptual-coordinate distinction (per `S5-SPEC.md:104-105` + the cleanup note at `13-decision-register.md:550`) is observed implicitly (17.S5-* rows refactor under `Body/S/S5/`; the missing graphiti row would refactor under `Body/S/S3/` though conceptually S5 — the residency rule needs to be a citation inside the row, not implicit).

## Tranche augmentation / removal / addition recommendations

- **REWRITE 17.15:** Change trailing "Per S5-ARCHITECTURE.md §5 findings F2 + F4" to "Per S5-ARCHITECTURE.md §5 findings F2 + F3". (Cited: `Idea/Bimba/Seeds/S/S5/S5-ARCHITECTURE.md:290-300`.) Optionally inline the canon submodule shapes — F2: `types | kernel_evidence | orchestration | promotion`; F3: `m5_workbench | deposits`.

- **ADD 17.S3-graphiti-native (NEW TRANCHE PROPOSAL):** Per DR-S5-1 + DR-S3-2. Scope and verification per the row description above. Citation backbone: `13-decision-register.md:572-580` (DR-S5-1), `13-decision-register.md:558-566` (DR-S3-2), `S5-SPEC.md:104-105` (Graphiti at S3' law), `S5-ARCHITECTURE.md:111` (file substrate at 534 LOC). Mark as priority-2 because it's a migration not a sub-1k LOC split, and gate it on DR-S3-2's `NativeLibraryClient` landing pattern (so the trait abstraction `GraphitiClient` + `HttpCompatibilityClient` ships marked `#[deprecated]` at the same commit).

- **AUGMENT 17 SCOPE STATEMENT:** Add an explicit citation of the substrate-residency-vs-conceptual-coordinate rule at the top of the tranche so the 17.S3-graphiti-native row's "destination at S3, conceptual S5" framing isn't read as a category error. Citation: `13-decision-register.md:550` ("Substrate-residency vs conceptual-coordinate: `Body/S/S3/graphiti-runtime/` physically resides under S3 but conceptually actualises S5").

- **NO REMOVAL** of any current S5 sub-row. 17.4 is correctly scoped and aligned to DR-S5-2.

## Open questions for user

- **DR-S5-1 implementation seam choice (cycle-3 vs cycle-4):** DR-S5-1 (`13-decision-register.md:572-580`) names cycle-4 for the deletion of the Python wrapper; cycle-3 lands the Rust migration with the wrapper marked deprecated. Tranche 17.S3-graphiti-native (proposed) should land the migration only. Is the user OK with deferring deletion to cycle-4, or do they want one combined PR? Canon-silent on which cycle owns the final deletion-PR.
- **Recursive-self-review classifier "duplicate" concern (per `S5-ARCHITECTURE.md:540-542`):** S5-ARCHITECTURE §10.3 proposes DR-S5-2 with a recommendation that review-core's `ReviewCategory::RecursiveSelfModification` is the canonical authorisation gate and autoresearch-core's `RecursiveReviewProtocolKind` is a finer sub-classifier. DR-S5-2 as ratified (`13-decision-register.md:582-584`) only names the autoresearch-core ownership; it does NOT explicitly ratify or reject the review-core-as-authorisation-gate framing. Should Tranche 17.4's `recursive_review.rs` submodule include a doc-comment naming the review-core relationship, or is that out-of-scope for a pure file-split row?
