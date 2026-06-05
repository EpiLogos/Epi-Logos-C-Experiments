# Canon Audit: S3-gateway-control-plane

**Auditor scope:** Audit Tranche 17 S3-sub-rows (file splits, dispatch collapse, epi-app deprecation, and the implicit DR-S3-2/DR-S5-1 Graphiti native sub-row) against S3 SPECs, ratified DRs (DR-S3-1, DR-S3-2, DR-S3-3), and S3-ARCHITECTURE.md substrate citations.
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (both pages: offset 0 limit 505 + offset 506 limit 165)
- `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-0-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-1-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-2-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-3-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-4-SPEC.md`
- `Idea/Bimba/Seeds/S/S3/S3-5-SPEC.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/phase-c-s-stack-theia-verification-report.md`
- `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md` (both pages: offset 0 limit 509 + offset 510 limit 298) — INPUT/substrate citation only, not authority

## Per-row audit

### 17.1 — Split `gateway-contract/lib.rs` (4,883 LOC) into 11+ sibling modules behind a `lib.rs` re-export façade
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:308-351` (refactor §5.1 with proposed module tree); `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/phase-c-s-stack-theia-verification-report.md:155` (consolidated cleanup priority #1)
- **Current framing in tranche:** Pure file motion — split the largest file in the repo into protocol/dispatch_plan/session/portal_events/temporal/spacetime/kernel_bridge/graphiti/cron/privacy/s1_vault/release sibling modules; `lib.rs` becomes re-export-only.
- **Canon framing (if not ALIGNED):** n/a
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Pure code-cleanup-refactor; mechanical anti-greenfield split with zero public API change. Substrate-grounded (file:line citations + LOC); does not touch SPEC ontology. SPEC explicitly names `Body/S/S3/gateway-contract/**` as canonical (`S3-SPEC.md:731`); the splitting is implementation hygiene, fully compatible.

### 17.2 — Split `Body/S/S0/portal-core/src/gate/server.rs` (3,235 LOC)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S3/S3-SPEC.md:136-147` (live gateway dispatch is S0-hosted while consulting S3 route ownership; extraction is target shape); `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:500-502` (DR-S0-2 "per-method dispatch contract tests land as part of Tranche 17.2")
- **Current framing in tranche:** Split into `gate/server/{mod,dispatch,websocket,method_envelope,subscription,observability}.rs`; blocks per-method contract tests.
- **Canon framing (if not ALIGNED):** n/a
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Although the file physically lives at S0, this is the live S3 gateway dispatch surface. SPEC `S3-SPEC.md:81` already names extraction as open work; the row is aligned and load-bearing for DR-S0-2.

### 17.7 — Split `Body/S/S3/gateway/src/spacetime.rs` (1,765 LOC)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:353-394` (refactor §5.2 with proposed `spacetime/` mod-dir tree); `Idea/Bimba/Seeds/S/S3/S3-SPEC.md:140-145` (gateway spacetime bridge canonicalised at `Body/S/S3/gateway`)
- **Current framing in tranche:** Split into `spacetime/{mod,fallback,resync,registration,presence,retry,projection,identity,lifecycle}.rs`.
- **Canon framing (if not ALIGNED):** n/a
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Pure file motion. The proposed sub-module names mirror the ten distinct concerns enumerated in S3-ARCHITECTURE.md:357 (fallback / resync / registration / WS subscription wrapper / HTTP reducer client / retry / projection decoder / identity / lifecycle). Substrate-grounded; no SPEC drift.

### 17.16 — Collapse `classify_method` (270 LOC match) + `METHOD_DISPATCH_PLAN` (940 LOC) to single canonical source via lookup
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:568-570` (DR-S3-3 VALIDATED: "Make `METHOD_DISPATCH_PLAN` (940 LOC) canonical; derive `classify_method` (270 LOC match) by lookup. Co-PR rule: `METHOD_NAMES` + `METHOD_DISPATCH_PLAN` change together. **Depends:** Tranche 17.16."); `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:396-423` (§5.3 refactor proposal)
- **Current framing in tranche:** "Make `METHOD_DISPATCH_PLAN` canonical; derive `classify_method` by lookup." Tagged DR-S3-3 PROPOSED in tranche; actually VALIDATED in current DR register.
- **Canon framing (if not ALIGNED):** n/a — current tranche framing aligns; the only stale element is the "PROPOSED" status flag (DR-S3-3 was promoted to VALIDATED 2026-06-03).
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche label correctly cites DR-S3-3 and matches resolution exactly; minor doc-patch — change `DR-S3-3 PROPOSED` → `DR-S3-3 VALIDATED 2026-06-03` per DR register line 568. Also add the co-PR rule (`METHOD_NAMES` + `METHOD_DISPATCH_PLAN` must change together) as an execution-discipline note, since this is the ratified resolution's binding requirement.

### 17.23 — Migrate/decommission `Body/S/S3/epi-app`
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:554-556` (DR-S3-1 VALIDATED: "Mark `Body/S/S3/epi-app` deprecated. **Depends:** Tranche 17.23."); `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:471-484` (§5.6 epi-app legacy carry-over migration proposal); `Idea/Bimba/Seeds/S/S3/S3-5-SPEC.md:42` (open gap: "`Body/S/S3/epi-app` is still Electron rather than the target Tauri v2 / Theia-aligned surface ... Treat it as current evidence plus migration source, not final architecture")
- **Current framing in tranche:** "Stale Electron carry-over; M' shell authority moved to `Body/M/epi-theia`. Per S3-ARCHITECTURE.md §5.6." Tagged DR-S3-1 PROPOSED; actually VALIDATED.
- **Canon framing (if not ALIGNED):** n/a — same minor "PROPOSED" → "VALIDATED" staleness as 17.16.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Update `DR-S3-1 PROPOSED` → `DR-S3-1 VALIDATED 2026-06-03`. Also honour the memory invariant cited in the user MEMORY (`project_theia_shell_moved_to_epi_theia`); the existing tranche row already does so by naming `Body/M/epi-theia` as the M' shell authority. Note: SPEC at S3-SPEC.md:147 still contains stale text ("Body/S/S3 currently also holds `epi-app`") — surface as a SPEC patch sub-row (orphan O-S3-2 in S3-ARCHITECTURE.md:737-738).

### 17.x (IMPLICIT) — Graphiti native-library migration sub-row (referenced by DR-S3-2 + DR-S5-1 as "Tranche 17 sub-row 17.S3-graphiti-native")
- **Status:** MISSING-CITATION
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:558-580` (DR-S3-2 + DR-S5-1 VALIDATED both depend on "Tranche 17 (sub-row 17.S3-graphiti-native)"); `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:1-176` (tranche has no row for this dependency)
- **Current framing in tranche:** **Row absent.** DR-S3-2 and DR-S5-1 both name a `17.S3-graphiti-native` sub-row, but the tranche file enumerates 25 rows (17.1–17.25) with no Graphiti-native landing row. The closest adjacent items are 17.9 (Aletheia `extension.ts` split — TypeScript) and 17.15 (S5 autoresearch split) — neither covers `Body/S/S3/graphiti-runtime/` native-library landing or `graphiti_service.py` Rust migration.
- **Canon framing (if not ALIGNED):** Per DR-S3-2 (`13-decision-register.md:558-566`): "Land `NativeLibraryClient` as the load-bearing impl in `Body/S/S3/graphiti-runtime/`. Mark `HttpCompatibilityClient` + `Body/S/S3/graphiti-runtime/sidecar-compat/` with `#[deprecated(since = "2026-06-03", note = "Sidecar deprecated per DR-S3-2; use NativeLibraryClient")]`. Document cycle-4 deletion target." Per DR-S5-1 (`13-decision-register.md:572-580`): lift `graphiti_service.py` logic into `graphiti-runtime` Rust modules; mark `epi-gnostic/graphiti/` Python sub-package `_deprecated/`. Substrate-grounded in `S3-ARCHITECTURE.md:498-512` (§5.8 `GraphitiClient` trait + `NativeLibraryClient` Cargo feature proposal).
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** ADD row `17.26 — Graphiti native-library landing + sidecar deprecation (DR-S3-2 / DR-S5-1)`. Scope: (1) land `NativeLibraryClient` as default impl in `Body/S/S3/graphiti-runtime/src/`; (2) introduce `GraphitiClient` trait as transitional shim with `#[deprecated]` flag on `HttpCompatibilityClient` and `sidecar-compat/`; (3) lift `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` into Rust modules under `graphiti-runtime`; (4) mark `epi-gnostic/graphiti/` Python sub-package `_deprecated/` for cycle-4 deletion. Verification per DR-S3-2: `cargo check -p graphiti-runtime --no-default-features --features native_library_client` clean; `grep -rn 'sidecar\|FastAPI' Body/S/S3/graphiti-runtime/src/` returns only `#[deprecated]`-tagged paths. This row is currently load-bearing for two VALIDATED DRs and must be landed for cycle-3 closure to be coherent.

### Tranche-level execution discipline — 17.1 lands FIRST, gates 17.7 / 17.16 chain
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:165-167` ("17.1 (gateway-contract split) lands FIRST — gates 17.2 / 17.7 / 17.16 dependency chains"); `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:308-351` (§5.1 module-tree dependency)
- **Current framing in tranche:** Execution sequence pins 17.1 first; 17.2 and 17.16 downstream depend on it because dispatch_plan + session + portal_events + spacetime types currently all share `gateway-contract/src/lib.rs`.
- **Canon framing (if not ALIGNED):** n/a
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Sequencing matches substrate dependency graph. No drift.

### Source list (Tranche §Source) cites S3-ARCHITECTURE.md §5 for S3-residency
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:20` ("S3-ARCHITECTURE.md §5 (`Body/S/S3/{gateway, gateway-contract, graphiti-runtime, ...}`)"); `Idea/Bimba/Seeds/S/S3/S3-SPEC.md:731` (canonical Body substrate enumeration)
- **Current framing in tranche:** Sources reference the ARCHITECTURE.md docs (inputs) and Phase-C verification report.
- **Canon framing (if not ALIGNED):** n/a
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Per audit precedence rule 2d, ARCHITECTURE.md is input/substrate-cite, not authority. The tranche correctly treats it as such (uses it for file:line and LOC counts only; ontological law derives from SPEC).

## Drift patterns observed

The S3 sub-rows in Tranche 17 are among the cleanest in cycle-3. Every row is anti-greenfield (pure refactor / file-split / deprecation), substrate-grounded (file:line + LOC counts), and ties to either a ratified DR (17.16 → DR-S3-3; 17.23 → DR-S3-1) or an explicit SPEC residency claim (17.1, 17.7 anchor to S3-SPEC.md:731 canonical-substrate block). No conceptual framing inflation, no invented extensions, no contradiction of any 2026-06-03 cleanup DR. The only drift surfaced is a missing tranche row: DR-S3-2 + DR-S5-1 both VALIDATED point to a phantom "Tranche 17 sub-row 17.S3-graphiti-native" that does not exist in the tranche file. This is a load-bearing absence — the Graphiti FastAPI sidecar deprecation and the `graphiti_service.py` → Rust migration cannot land without an owning tranche row, and both DRs are explicitly tagged "Cycle-4 closes the sidecar entirely" presupposing the cycle-3 native-library landing. A secondary, minor staleness pattern: tranche rows 17.16 and 17.23 still flag their DRs as PROPOSED when they were promoted to VALIDATED in the 2026-06-03 cleanup. These are doc-patches, not framing drift. There is also a stale SPEC sentence at S3-SPEC.md:147 ("`Body/S/S3` currently also holds `epi-app`") that DR-S3-1 implicitly retires; the existing tranche row 17.23 closes it but should also include a SPEC-patch deliverable. Overall posture: this tranche is structurally faithful; only the Graphiti row gap is a real blocker.

## Tranche augmentation / removal / addition recommendations

- **ADD 17.26 — Graphiti native-library landing + sidecar deprecation (DR-S3-2 / DR-S5-1).** Cited: `13-decision-register.md:558-580` (both DRs VALIDATED); `S3-ARCHITECTURE.md:498-512` (§5.8 trait proposal). Scope: land `NativeLibraryClient` as canonical impl in `Body/S/S3/graphiti-runtime/`; mark `HttpCompatibilityClient` + `sidecar-compat/` `#[deprecated(since = "2026-06-03", note = "...")]`; lift `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` to Rust; mark `epi-gnostic/graphiti/` Python sub-package `_deprecated/` for cycle-4 deletion. Verification: `cargo check -p graphiti-runtime --no-default-features --features native_library_client` clean as default; `cargo test -p graphiti-runtime --test parity_with_python_service` proves behavioural equivalence per DR-S5-1.
- **AUGMENT 17.16** — Update tag `DR-S3-3 PROPOSED` → `DR-S3-3 VALIDATED 2026-06-03`; add co-PR rule note (`METHOD_NAMES` and `METHOD_DISPATCH_PLAN` must change together per the ratified resolution at `13-decision-register.md:570`).
- **AUGMENT 17.23** — Update tag `DR-S3-1 PROPOSED` → `DR-S3-1 VALIDATED 2026-06-03`. Add SPEC-patch deliverable: patch `Idea/Bimba/Seeds/S/S3/S3-SPEC.md:147` to remove the stale "Body/S/S3 currently also holds epi-app" sentence (orphan O-S3-2 per `S3-ARCHITECTURE.md:737-738`).
- **AUGMENT 17.1** — Keep as-is, but cross-reference the verification report ranking (`phase-c-s-stack-theia-verification-report.md:155`, top consolidated-cleanup priority) and link to DR-S3-4 (PROPOSED in `phase-c-s-stack-theia-verification-report.md:732`: "gateway-contract/src/lib.rs is split into a module tree before any further contract additions"). DR-S3-4 is currently not in the 13-decision-register file; surface as Open question for ratification.

## Open questions for user

- DR-S3-4 / DR-S3-5 status. `Idea/Bimba/Seeds/S/S3/S3-ARCHITECTURE.md:726-734` proposes DR-S3-4 (`gateway-contract/src/lib.rs` is split into a module tree before any further contract additions) and DR-S3-5 (every new S3-owned RPC method is registered in BOTH `METHOD_NAMES` and `METHOD_DISPATCH_PLAN` in the same PR). Neither appears in the canonical `13-decision-register.md` ratified block. Should they be added to the PROPOSED list, or are they considered absorbed under DR-S3-3's "co-PR rule" (DR-S3-5) and Tranche 17.1's execution-discipline note (DR-S3-4)? Recommend ratifying DR-S3-5 separately because it is a standing-invariant not bounded to the tranche.
- Cycle-4 sidecar-deletion ownership. DR-S3-2 names cycle-4 as the close-out cycle for FastAPI sidecar; should a placeholder be added to the cycle-3 ledger now (e.g., a tracked "cycle-4 carry-forward" item) to prevent the deletion target from being lost between cycles?
- The Phase-C verification report at `phase-c-s-stack-theia-verification-report.md:400` proposed a "NEW Tranche 17 — S-stack code modularisation campaign" listing 10 file-split items. The tranche-as-landed contains 25 rows that include those 10 plus adjacencies and crate-housekeeping. Is the broader scope (17.16-25) intentionally ratified, or should the verification-report's narrower 10-item scope be the binding cycle-3 commitment, with 17.16-25 deferred? Recommend confirming the broader scope is ratified, since each row has a VALIDATED DR backing (17.11/DR-S1-1, 17.18/DR-S1-2, 17.20/DR-S1-3, 17.16/DR-S3-3, 17.23/DR-S3-1).
