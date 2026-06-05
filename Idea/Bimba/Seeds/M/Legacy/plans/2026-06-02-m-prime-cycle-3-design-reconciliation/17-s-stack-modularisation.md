# Track 17 — S-Stack Modularisation Campaign

The Phase-A S-stack total-shape audit (six S-architecture docs at `Idea/Bimba/Seeds/S/S{0..5}/S{n}-ARCHITECTURE.md`) surfaced a consistent pattern: substrate-monolith files exceeding 1000 LOC that block per-method contract tests, hide load-bearing invariants, and force consumers (every M' surface) through unnecessarily-wide boundaries. This tranche groups those refactors into a single coherent campaign — **anti-greenfield throughout**: no rebuild, only modularisation under named scope with pure `pub use` re-exports preserving public API.

**Substrate-residency vs conceptual-coordinate note:** physical crate location does not always equal conceptual S-coordinate. Example: `Body/S/S3/graphiti-runtime/` physically resides under S3 while conceptually actualising S5 world-return via Graphiti episodic memory. Rows below follow the physical path for implementation and cite the conceptual owner when different.

## Discipline

Every row in this tranche follows the same shape:
- **Scope**: single file or module to split
- **Current shape**: LOC + concerns currently fused
- **Proposed shape**: target file structure
- **Blast radius**: M' surfaces affected (always low if re-export façade preserved)
- **Verification**: `cargo check -p <crate>` clean; downstream consumer tests pass; old file path becomes thin re-exports
- **Reference**: the S{n}-ARCHITECTURE.md § that documented the finding

## Source

- S0-ARCHITECTURE.md §5 (`Body/S/S0`)
- S1-ARCHITECTURE.md §5 (`Body/S/S1/hen-compiler-core`)
- S2-ARCHITECTURE.md §5 (`Body/S/S2/{graph-schema, graph-services}`)
- S3-ARCHITECTURE.md §5 (`Body/S/S3/{gateway, gateway-contract, graphiti-runtime, ...}`)
- S4-ARCHITECTURE.md §5 (`Body/S/S4/ta-onta`)
- S5-ARCHITECTURE.md §5 (`Body/S/S5/{epi-gnostic, epi-kbase, epii-autoresearch-core, epii-agent-core, epii-review-core}`)
- Phase-C verification report: `plan.runs/phase-c-s-stack-theia-verification-report.md`

## Priority-1 file splits (highest blast leverage, lowest risk)

1. **17.1 — Split `gateway-contract/lib.rs` (4,883 LOC, largest file in repo)** *(code-cleanup-refactor)*

   The single most blocking monolith — fuses protocol / dispatch_plan / session / portal_events / temporal / spacetime / kernel_bridge / graphiti / privacy / s1_vault / release into one file. Split into `lib.rs` (re-export façade only) + 11 sibling modules. Per S3-ARCHITECTURE.md §5.1.

   Verification: `cargo check -p gateway-contract && cargo test -p gateway-contract`; downstream `cargo check -p gateway -p portal-core -p epi-cli` clean; `wc -l Body/S/S3/gateway-contract/src/lib.rs` < 500.

2. **17.2 — Split `Body/S/S0/epi-cli/src/gate/server.rs` (3,235 LOC)** *(code-cleanup-refactor)*

   Split into `gate/server/{mod, dispatch, websocket, method_envelope, subscription, observability}.rs`. Blocks per-method contract tests. Per S0-ARCHITECTURE.md §5 finding 1.

   Verification: `cargo check -p portal-core && cargo test -p portal-core --test gate_server_contract`.

3. **17.3 — Split `graph-schema/src/lib.rs` (3,072 LOC)** *(code-cleanup-refactor)*

   Split into 9 files: `constants.rs / labels.rs / relationships/{mod, node, rel, deep_bimba}.rs / properties.rs / coordinate_law.rs / validation.rs / constraints.rs`. Per S2-ARCHITECTURE.md §5 finding 1.

   Verification: `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema`; `cargo check -p epi-s2-graph-services` clean.

4. **17.4 — Split `capacity_workflows.rs` (2,584 LOC)** *(code-cleanup-refactor)*

   Split into `capacity_workflows/{mod, registry, nara_voice, recursive_review, spine_inspector, aletheia_lineage, runner}.rs`. Per S5-ARCHITECTURE.md §5 finding F1.

   Verification: `cargo check -p epii-autoresearch-core && cargo test -p epii-autoresearch-core`.

5. **17.5 — Split `Body/S/S0/epi-cli/src/core/mod.rs` (2,485 LOC)** *(code-cleanup-refactor)*

   Split into `core/{mod, pointer_web, walk, quintessential_view, help}.rs`. Per S0-ARCHITECTURE.md §5 finding 2.

   Verification: `cargo check -p portal-core && cargo test -p portal-core`.

6. **17.6 — Split `Body/S/S0/portal-core/src/kernel.rs` (1,266 LOC)** *(code-cleanup-refactor; gating Tranche 18)*

   Split into 9+ files behind the existing `harmonic_profile.rs` re-export façade. One file per `Matheme*Projection`. **Gates Tranche 18** (typed kernel-bridge JSON edge) — cleaner per-projection sites enable typed JSON shape extraction. Per S0-ARCHITECTURE.md §5 finding 3.

   Verification: `cargo check -p portal-core`; `harmonic_profile.rs` re-export still resolves all `Matheme*Projection` types; every M' extension build unchanged.

## Priority-2 file splits

7. **17.7 — Split `Body/S/S3/gateway/src/spacetime.rs` (1,765 LOC)** *(code-cleanup-refactor)*

   Split into `spacetime/{mod, fallback, resync, registration, presence, retry, projection, identity, lifecycle}.rs`. Per S3-ARCHITECTURE.md §5 finding 2.

   Verification: `cargo check -p gateway`.

8. **17.8 — Split `Body/S/S2/graph-services/src/sync_coordinator.rs` (1,384 LOC)** *(code-cleanup-refactor)*

   Split into `sync/{mod, intent_types, policy, property_proposals, frontmatter_rules, code_provenance, graphiti_episode, plan, coordinator, report}.rs`. Per S2-ARCHITECTURE.md §5 finding 2.

   Verification: `cargo check -p epi-s2-graph-services`.

9. **17.9 — Split `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` (1,114 LOC)** *(code-cleanup-refactor)*

   Split into `S5'/tools/{gnosis,thought,episodic,seed}-tools.ts` mirroring Anima's `S4/agent-team.ts` pattern. Per S4-ARCHITECTURE.md §5 finding 1.

   Verification: `pnpm --filter @epi-logos/aletheia build`; Aletheia tool tests pass.

10. **17.10 — Split `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` (761 LOC)** *(code-cleanup-refactor)*

    Extract `S4'/tools/dispatch-tools.ts` (6 dispatch tools, 400+ LOC). Isolate `nous_disclose` into its own module. Per S4-ARCHITECTURE.md §5 finding 2.

    Verification: `pnpm --filter @epi-logos/anima build`.

11. **17.11 — Split `Body/S/S1/hen-compiler-core/src/lib.rs` (881 LOC)** *(code-cleanup-refactor)*

    Split into seven small modules (`residency.rs`, `coordinate.rs`, `frontmatter.rs`, `l_alignments.rs`, `ledger.rs`, `compile_plan.rs`, `graph_sync.rs`). Pure `pub use` preserves API. Per S1-ARCHITECTURE.md §5.1.

    Verification: `cargo check -p hen-compiler-core && cargo test -p hen-compiler-core`.

## Priority-3 file splits

12. **17.12 — Split `Body/S/S0/epi-cli/src/nara/oracle.rs` (2,203 LOC) + `medicine.rs` (1,271 LOC)** *(code-cleanup-refactor)*

    Per S0-ARCHITECTURE.md §5 finding 4.

13. **17.13 — Split `Body/S/S0/portal-core/src/events.rs` (522 LOC)** *(code-cleanup-refactor; gating CCT-5)*

    Split into 7 files; **lands the `KleinFlipEvent` 3-variant discriminated union** (per CCT-5 / DR-IG-2). Per S0-ARCHITECTURE.md §5 finding 7.

    Verification: `cargo check -p portal-core && cargo test -p portal-core --test klein_flip_event_variants_exhaustive`.

14. **17.14 — Split `Body/S/S2/graph-services/src/dataset_import.rs` (1,655 LOC)** *(code-cleanup-refactor)*

    Split into `dataset_import/{mod, importer, branch, plans, property_mapping, json_utils, cypher}.rs`. Per S2-ARCHITECTURE.md §5 finding 7.

15. **17.15 — Split `Body/S/S5/epii-autoresearch-core/src/lib.rs` (2,049 LOC) + `epii-agent-core/src/lib.rs` (1,170 LOC)** *(code-cleanup-refactor)*

    Per S5-ARCHITECTURE.md §5 findings F2 + F3. F2 splits `epii-autoresearch-core/src/lib.rs`; F3 splits `epii-agent-core/src/lib.rs`.

## Adjacent cleanup items (smaller scope, similar discipline)

16. **17.16 — Collapse `classify_method` (270 LOC) + `METHOD_DISPATCH_PLAN` (940 LOC)** *(code-cleanup-refactor; DR-S3-3 VALIDATED 2026-06-03)*

    Both duplicate the 134-method list. Make `METHOD_DISPATCH_PLAN` canonical; derive `classify_method` by lookup. Co-PR rule: `METHOD_NAMES` and `METHOD_DISPATCH_PLAN` change together. Per S3-ARCHITECTURE.md §5 finding 3 and DR-S3-3.

17. **17.17 — `coordinate_home: &'static str` → typed `CoordinateHome` enum** *(code-cleanup-refactor)*

    ~30 distinct strings repeated ~150 times across S2 spec tables. Compiler proves home consistency. Per S2-ARCHITECTURE.md §5 finding 3.

18. **17.18 — Unify S1 rename-reconciliation** *(code-cleanup-refactor; DR-S1-2 PROPOSED)*

    Move literal-text rewrite from `gate/s1_hen.rs:155-205` to `hen-compiler-core::wikilinks::reconcile_rename`. The integrity authority IS the mutation authority. Per S1-ARCHITECTURE.md §5.3. **Load-bearing for DR-M1-4.**

19. **17.19 — Land S1 `WikilinkTarget::PathBlock` + `PathHeadingBlock` variants** *(code-cleanup-refactor)*

    Closes silent-corruption hole for Obsidian `[[Note^block-id]]` syntax. Per S1-ARCHITECTURE.md §5.4.

20. **17.20 — S1 coordinate-residency-on-move enforcement** *(no-orphan-fill; CCT-12; DR-S1-3 PROPOSED)*

    Add `S1VaultRenameRefusalReason::CoordinateResidencyMismatch`. **Load-bearing for DR-M1-4 / DR-M1-1 / cross-cutting closure CCT-12.** Per S1-ARCHITECTURE.md §5.6.

21. **17.21 — `Body/S/S0/luts/` subdir consolidation** *(code-cleanup-refactor; low priority)*

    Consolidate oracle_lut, mahamaya, transcription, rotational, codon, planet_keplerian under one subdir. Per S0-ARCHITECTURE.md §5 finding 8.

## Crate-level / housekeeping

22. **17.22 — Declare `Body/S/S1/hen-compiler/` compatibility-only via `STATUS.md`** *(doc-ahead-landing)*

    Pure documentation: prevents future Python pipeline extension. No deletion. Per S1-ARCHITECTURE.md §5.10.

23. **17.23 — Migrate/decommission `Body/S/S3/epi-app`** *(code-cleanup-refactor; DR-S3-1 VALIDATED 2026-06-03)*

    Stale Electron carry-over; M' shell authority moved to `Body/M/epi-theia`. Patch S3-SPEC to remove stale "`Body/S/S3` currently also holds `epi-app`" wording. Per S3-ARCHITECTURE.md §5.6.

24. **17.24 — Pi-agent symlink fragility** *(code-cleanup-refactor)*

    Replace `pi-agent/extensions/ta-onta -> ../../ta-onta` symlink with explicit `../ta-onta/composite-entry.ts` import. Per S4-ARCHITECTURE.md §5 finding 8.

25. **17.25 — Capability matrix schema co-location** *(code-cleanup-refactor)*

    Co-locate `capability-matrix.schema.ts` next to `capability-matrix.json` (Pleroma authority). Anima loader + ACR parser + e2e parity all consume one schema. Per S4-ARCHITECTURE.md §5 finding 5.

26. **17.26 — Graphiti native-library landing + sidecar deprecation** *(code-migration; DR-S3-2 / DR-S5-1 VALIDATED)*

    Land `NativeLibraryClient` as the canonical impl in `Body/S/S3/graphiti-runtime/`; introduce `GraphitiClient` as a transitional trait; mark `HttpCompatibilityClient` and `sidecar-compat/` with `#[deprecated(since = "2026-06-03", note = "Sidecar deprecated per DR-S3-2; use NativeLibraryClient")]`; lift the logic of `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` into Rust modules under `graphiti-runtime`; mark the Python Graphiti wrapper package `_deprecated/` for cycle-4 deletion. Physical destination is S3; conceptual actualisation is S5 world-return.

    Verification: `cargo check -p graphiti-runtime --no-default-features --features native_library_client`; `cargo test -p graphiti-runtime --test parity_with_python_service`; `grep -rn 'sidecar\\|FastAPI' Body/S/S3/graphiti-runtime/src/` returns only deprecated compatibility paths.

27. **17.27 — `epi-kernel-contract` parent-role wording patch** *(doc-ahead-landing; DR-S0-1 VALIDATED)*

    Patch S0-ARCHITECTURE §1 / §2.4 / §5.9 and S-SYSTEM-INDEX framing from "sibling-to-S0" to "`Body/S/epi-kernel-contract/` is the parent crate / parent-role envelope of the S-stack." This is doc-only but prevents S0 from swallowing the stack-parent contract in future refactors.

    Verification: `grep -n 'parent crate\\|parent-role envelope' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md`; `grep -n 'sibling-to-S0' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` returns no live wrong-parent attribution.

## Execution Discipline

- Each refactor is a single PR landing the file move + re-export façade + downstream compile check
- No public API surface change in any 17.x row
- Pre-PR: `cargo check -p <crate>` + `cargo test -p <crate>` clean on main
- Post-PR: same plus all M' extension builds clean
- 17.1 (gateway-contract split) lands FIRST — gates 17.2 / 17.7 / 17.16 dependency chains
- 17.6 (kernel.rs split) lands BEFORE Tranche 18 (typed JSON edge)
- 17.13 (events.rs split) lands BEFORE CCT-5 (KleinFlipEvent enum)
- 17.20 (coordinate-residency) closes CCT-12 + DR-M1-4 + DR-M1-1 dependency

## What this tranche does NOT touch

- No public API change (zero blast radius to M' surfaces if discipline is honored)
- No new functionality
- No greenfield (zero rebuild of any S substrate)
- No M-extension files (those follow per-Mn tranches)
