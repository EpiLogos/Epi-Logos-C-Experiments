---
title: "Phase-C Cross-Boundary Verification — S-Stack Architecture Docs + Theia Design Docs vs Cycle-3 Ledger"
created: 2026-06-03
verifier_role: "Phase-C audit. Reads six S-stack arch docs (S0-S5) + two Theia design docs (shell invocation + UI patterns) + eight existing M-stack arch docs + cycle-3 ledger (Tranches 11-16) and returns: boundary consistency findings, consolidated cleanup priorities, Theia verdicts, new DRs, new orphans, new cross-cutting tranches, per-tranche ledger harmonisation actions."
inputs:
  - "Idea/Bimba/Seeds/S/S{0..5}/S{n}-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/THEIA-SHELL-INVOCATION-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/THEIA-UI-PATTERNS-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/M{0..5}'/M{n}-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/INTEGRATED-{1-2-3,4-5-0}-*.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/{13,14,15,16}-*.md"
related_decisions: "DR-IG-1..6, DR-M0-1..3, DR-M1-1..4, DR-M2-1..3, DR-M3-1..5, DR-M4-1..3, DR-M5-1..3, DR-B-1..3, DR-KB-1..2, DR-TS-1, plus PROPOSED DR-TS-2..6, DR-UI-1..5, plus this verifier's proposed DR-S-* / DR-TUI-* / DR-TUX-*"
---

# Phase-C Cross-Boundary Verification Report

## 0. Frame

Phase A produced six S-stack architecture docs (S0-S5). Phase B produced two Theia design docs (shell invocation + UI patterns). Cycle 3 already carries: eight M' total-shape arch docs, 21 VALIDATED + 10 PROPOSED decision rows, 9 UI foundation principles (Tranche 15), 8 cross-cutting closures (Tranche 16), and the no-orphan release gates (Tranche 14).

This report audits eight dimensions:

1. S-stack ↔ M-stack consistency
2. Anti-greenfield posture in S-stack
3. Consolidated cleanup priority list
4. Theia shell design ↔ UI foundation principles
5. Theia UI patterns ↔ Tranches 11 + 15
6. Stacked-tabs decision
7. Bimba graph widget ownership
8. New decisions / orphans / cross-cutting tranches surfaced; per-tranche ledger harmonisation

The substrate-cited basis: all six S-arch docs run 568-805 lines with substantive file:line citations; the two Theia docs run 659-878 lines each. The total corpus under review here is roughly 5500 lines of architectural prose against ~6500 lines of M-stack arch docs already landed.

---

## 1. S-Stack ↔ M-Stack Consistency (Pass / Partial / Fail per S Layer)

The single most consequential question for cycle-3 closure: do the M' dependency maps in the S-arch docs match what the M-arch docs actually consume? Mismatches mean either a missing carrier, a missing decision, or a documentation drift that will burn a downstream tranche.

### 1.1 S0 ↔ M-stack: **PASS**

S0-ARCHITECTURE §3 enumerates the per-M'-surface dependency table cross-referenced against the eight M' arch docs and `wave-b-kernel-bridge-matrix.md`. Every M' surface lands in the table with named contract surface and file:line citation:

- M0' → `MathemeBedrockProjection` / `MathemePointerAnchorProjection` (kernel.rs:811-886) ✓ matches M0-ARCHITECTURE.
- M1' → m1.h Ananda matrices + portal-core codon_rotation + `klein_flip` (events.rs:80) + `m1_performance_event_from_profile` ✓ matches M1-ARCHITECTURE + M1-2-ANANDA-VORTEX-ARCHITECTURE.
- M2' → `resonance72`/`audio_octet`/`nodal_quartet` ✓ matches M2-ARCHITECTURE; six-axes-of-72 decoder correctly owned by M2 extension, not S0.
- M3' → mahamaya/binary aliases on profile ✓ matches M3-ARCHITECTURE.
- M4' → `personal_identity.rs` derived-but-never-raw + Kerykeion wind/kairos/identity/oracle/medicine ✓ matches M4-ARCHITECTURE + DR-M4-3 PROPOSED strict invariant.
- M5' → `epi-kernel-contract` re-exports (KernelTickEnvelope, TrajectoryDeposit, VerifierReport) ✓ matches M5-ARCHITECTURE.
- Integrated 1-2-3 → `PhysicalPoleState`; Integrated 4-5-0 → `MentalPoleState` ✓ matches INTEGRATED-1-2-3/4-5-0.
- OmniPanel → S0-3 epi-cli (`invokeCapability`); body-lite-surface → intent-only ✓ matches DR-TS-1.

Eight load-bearing gaps explicitly named (klein_flip, ananda_vortex, bedrock_link, pattern_packet_handle, s2/s3_anchor, KleinFlipEvent enum, depositionAnchor, planet LUT cardinality) — every one already has a ledger row (Tranches 10.2, 10.4, 10.10; CCT-5, CCT-6, CCT-7; DR-KB-1, DR-KB-2). **No new orphans.**

### 1.2 S1 ↔ M-stack: **PASS (with one PROPOSED tranche surfaced)**

S1-ARCHITECTURE §3 walks every M' surface against S1 sub-coordinates. DR-M1-4 PROPOSED Hen vault-instance contract is correctly anchored to S1-1' / `gate/s1_hen.rs:138-222` substrate, with the load-bearing gap (**no "move that changes residency must update `coordinate` frontmatter" check**) named at §3.4 and §5.6.

M' consumer matrix at §3.1 matches:
- M0' Bimba Map Inspector (S1-1', S1-5') ✓
- M1-1' Instance Manager — under DR-M1-4 PROPOSED ✓
- M4-1' Day Container — DR-M4-1 path ✓
- M5-{0..5}' — correctly differentiated between gnostic library / canon studio / backend studio / atelier ✓

The "writes-through-Hen, reads-direct-FS" invariant is honoured (S1-ARCH §3.3 cites M5-ARCHITECTURE.md:113). Canon Studio + Backend Studio explicitly named as DOC-AHEAD per Tranche 06.4 — consistent.

### 1.3 S2 ↔ M-stack: **PASS**

S2-ARCHITECTURE §3 explicitly walks the six per-M' consumer rows including DR-IG-1 c_1_relation_family enum (six members ratified). Consistent with:
- M0-ARCHITECTURE: `anuttara-language` namespace direct read; M0' six data layers; DR-M0-1 governed-write through `SyncCoordinator::validate_property_proposals`.
- M1-ARCHITECTURE: indirect consumer (math substrate, not graph reads); confirms pointer-anchor at pointers.rs:169-243.
- M2-1' Vimarśa: direct consumer of `KernelResonanceObservationPlan`.
- M3-5: M3' deep-bimba properties at lib.rs:1760-1850.
- M4: `GDS_EXCLUDED_LABELS` privacy boundary (`NaraBody`, `ProtectedLocalBody`, `PrivateProjection`) — honours DR-M4-3 PROPOSED.
- M5': M5_HANDOFF_CONTRACT_VERSION + `FORBIDDEN_CLIENT_DERIVATIONS`.
- Three integrated plugins: Wave-B 07/08/09 cross-references intact.

**Single gap surfaced:** §4.3 names "no `graph_handle` or `coordinate_resolution_cache` projection on `MathemeHarmonicProfile`. M' surfaces re-resolve `coordinate` strings through `CoordinateArrayParser` on every tick." This is genuinely new and load-bearing — **proposes a kernel-bridge profile-bus extension that Tranche 10 doesn't yet name** (see §8.4 new tranches).

### 1.4 S3 ↔ M-stack: **PASS (with five contract gaps surfaced)**

S3-ARCHITECTURE §3 is the densest M' dependency map (nine M' consumer rows). The kernel-bridge consumption rule — every M-extension reaches gateway through `KernelBridgeAPI` singleton fanned out by `SharedBridgeAdapter`, no direct gateway-contract imports — matches Theia-shell-invocation §3.1.

OmniPanel/M5'/M3'/M4'/M1' consumer rows match M-arch docs. Integrated 1-2-3 plugin "renders SpaceTimeDB-delivered K² + 72-resonance + 64-Mahamaya state without re-derivation" cleanly aligns with INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.

§4.2 surfaces five gaps:
- Gap 1 (`s5'.gnostic.*` method family) — already named in Tranche 12.2.
- Gap 2 (`s3'.subscription.registry` method) — NEW; not in ledger.
- Gap 3 (`s3'.kernel.envelope.subscribe`) — NEW; not in ledger.
- Gap 4 (`s3.portal.publish`/`portal.subscribe`) — NEW; not in ledger.
- Gap 5 (Track 13.T3 channel/chat runtime extraction) — already in S3 substrate but routed through cycle-3 §5.6 cleanup.

Gaps 2-4 should land as proposed DR-S3-* rows; see §8.3.

### 1.5 S4 ↔ M-stack: **PASS (with no new orphans, but two cycle-3 disposition gaps confirmed)**

S4-ARCHITECTURE §3 dependency map covers every existing M' consumer. The asymmetry (Anima 761 LOC dispatch spine vs Aletheia 1114 LOC synthesis spine + tool guardian) is correctly framed as load-bearing, not a smell to flatten.

§4.2 nine gap rows — every one already named in cycle-3:
- `s4'.psyche.state` / DR-B-1 → Tranche 12 rewrite
- `s4'.permission.get` → Tranche 12.x
- `s4'.context.assemble` → Tranche 12.x replacing nous_disclose smuggling
- `s4'.crystallise` → Tranche 12.x
- `s4'.team.compose` / `s4'.cs.state` → Tranche 12.x
- Recursive-self-review classifier → CP-B-3, Tranche 12.4
- Pi axiom-translation tooling → DR-B-2, Tranche 12.7
- `MathemeHarmonicProfile.resonance72` consumption by S4 → Wave-A M5 6.3, Tranche 12.13

The Aletheia is tool-guardian, not peer agent constraint (per memory `Aletheia is tool-guardian, not peer agent`; CONTRACT lives at `Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md`) is honoured throughout S4-ARCH §2.7 and §3 — no flag-as-missing of `aletheia-agent/agent-contract.json`.

### 1.6 S5 ↔ M-stack: **PASS (the cleanest closure)**

S5-ARCHITECTURE §3 cross-references against eight M' arch docs and Wave-A M5 matrix. The `137 = 64 + 72 + 1` recognition flow is correctly named as **blocked end-to-end until kernel-bridge profile-bus extensions land (Tranche 10.x)**. No new orphans; the load-bearing autoresearch spine (capacity_workflows.rs 2584 LOC + recursive_self_review_requires_user_final_validation at lib.rs:471-489) survives substrate contact intact.

### 1.7 Summary Table

| S layer | Verdict | New gaps surfaced | Resolved by existing ledger | Needs new ledger row |
|---|---|---|---|---|
| S0 | PASS | 0 | 8 (already named) | 0 |
| S1 | PASS | 0 | 1 (DR-M1-4 PROPOSED, plus coordinate-residency-on-move check) | 0 |
| S2 | PASS | 1 (graph_handle / coordinate_resolution_cache profile field) | 6 | **1 (new Tranche 10.S2)** |
| S3 | PASS | 4 gaps | 1 (Gap 1) | **3 new DR-S3 rows** |
| S4 | PASS | 0 | 9 | 0 |
| S5 | PASS | 0 | 4 | 0 |

**Verdict: full pass.** No S↔M boundary fails. Five new ledger rows surfaced (one Tranche, three DR-S3, plus harmonisation of one S1 substrate gap).

---

## 2. Anti-Greenfield Posture in S-Stack

Per Phase-C kickoff prompt: any S-stack proposal touching landed Body/S/S0..S5 substrate must be phrased "consume as-is", "audit/verify", "extend", or "refactor/modularise/cleanup with named scope" — never "rebuild from scratch". First-build is ONLY for an M' product surface, a named carrier/agent/subagent owner, a method-routing closure, or a concrete named integration blocker.

### 2.1 Per-doc audit

- **S0**: §8 explicitly lists landed substrate; first-build invocation limited to the `KleinFlipEvent` enum (3 variants) and the typed `KernelBridgePerformanceEventJsonShape` struct — both genuine integration blockers, both with cycle-3 ledger rows. **CLEAN.**
- **S1**: §8 lists every refactor finding (10 named splits + the missing coordinate-residency-on-move check) as extend/refactor/audit. No greenfield. **CLEAN.**
- **S2**: §8 names "graph-schema lib.rs 3072 → module split", "sync_coordinator.rs 1384 LOC split", "gds.rs Option 1 GDS plan extraction", every one as refactor with file:line citations. **CLEAN.**
- **S3**: §8.3 explicitly lists "net-new (genuine first-build)" items as the four named contract gaps in §4.2 — three of which need new DR-S3 rows. Refactor items (gateway-contract/lib.rs 4883 LOC split, spacetime.rs 1765 LOC split, SessionRecord 53-field extraction, dispatch routing collapse) all named with file:line scope. **CLEAN.**
- **S4**: §8 lists every Pleroma/Khora/Hen/Anima/Aletheia/Chronos finding as carrier extension / contract addition / split. The `aletheia/extension.ts:1114 LOC` → 5 sub-modules split is mechanical with LOW blast radius. **CLEAN.**
- **S5**: §8 names the autoresearch capacity_workflows.rs split (2584 LOC → mod-dir) as low-blast-radius re-organisation; canon promotion + Möbius write-back honour the M5 Atelier's existing substrate. **CLEAN.**

### 2.2 Verdict

**Anti-greenfield posture PASS across all six S-stack docs.** Every first-build invocation has a concrete owner and cycle-3 ledger row. No S-stack doc proposes rebuild of landed substrate. The `Aletheia is tool-guardian, not peer agent` invariant is honoured (S4 §2.7); the `Theia shell moved to epi-theia` invariant is honoured (every S-doc cites Body/M/epi-theia, not epi-tauri).

---

## 3. Consolidated Cleanup Priority List (top 15 items)

Aggregated across all six S-arch docs, grouped by blast radius. Each named with location, current shape (LOC), and refactor proposal. Order is rough triage priority (highest impact / lowest risk first; named scope makes each landable as one PR).

### 3.1 File Splits (top tier — pure mechanical motion, LOW blast radius)

1. **HIGH — S3 `gateway-contract/src/lib.rs` (4,883 LOC monolith)** → 16-module tree (protocol/dispatch_plan/session/portal_events/temporal/spacetime/kernel_bridge/graphiti/cron/mcp/privacy/s1_vault/release). Re-export façade preserves public surface. Largest single file in the whole repo. Blocks per-method contract tests.
2. **HIGH — S0 `epi-cli/src/gate/server.rs` (3,235 LOC monolith)** → 6 files (mod, dispatch, websocket, method_envelope, subscription, observability). Blocks per-method contract tests.
3. **HIGH — S2 `graph-schema/src/lib.rs` (3,072 LOC monolith)** → per-concern module split (schema constants, label registry, relationship type registry, ~117 property specs, derived registries, validation helpers).
4. **HIGH — S5 `epii-autoresearch-core/src/capacity_workflows.rs` (2,584 LOC)** → `capacity_workflows/` mod-dir (registry, nara_voice, recursive_review, spine_inspector, aletheia_lineage, runner).
5. **HIGH — S0 `epi-cli/src/core/mod.rs` (2,485 LOC)** → 5 files (mod, pointer_web, walk, quintessential_view, help). Primary teaching/operator surface.
6. **HIGH — S0 `epi-cli/src/nara/oracle.rs` (2,203 LOC)** → oracle/{mod, draw, payload, cycle, render}.
7. **HIGH — S5 `epii-autoresearch-core/src/lib.rs` (2,049 LOC)** → extract type modules (types, kernel_evidence, orchestration, promotion); keep `ImprovementStore` impl in lib.rs façade.
8. **HIGH — S3 `gateway/src/spacetime.rs` (1,765 LOC)** → spacetime/{fallback, resync, registration, presence, retry, projection, identity, lifecycle}.
9. **HIGH — S2 `graph-services/src/sync_coordinator.rs` (1,384 LOC)** → sync/{coordinator, policy, validation, write_plan}.
10. **HIGH — S0 `portal-core/src/kernel.rs` (1,266 LOC)** → kernel/{mod, tick, projection, temporal, profile, projections/*, observation, atoms}.

### 3.2 Type-DRY & Contract Tightening (MEDIUM)

11. **MEDIUM — S0 typed kernel-bridge JSON shapes**: introduce `KernelBridgeProfileJsonShape` + `KernelBridgePerformanceEventJsonShape` (separate from `MathemeHarmonicProfile`) with `From<&MathemeHarmonicProfile>` impl as single serialiser. Closes Tranche 10.2 (klein_flip) + 10.10 (ananda_vortex) + CCT-5 (KleinFlipEvent enum) + CCT-6 (BedrockProvenanceHandle) cleanly. The single most leveraged cleanup; downstream contract tests become typed.
12. **MEDIUM — S2 type `coordinate_home` field**: lift from `String` to typed `CoordinateHome` enum; closes the DR-M0-2 alias documentation work end-to-end.
13. **MEDIUM — S2 DR-IG-1 c_1_relation_family typed enum landing**: schema constant `RELATION_FAMILY_VALUES: &[&str]` + property spec entry; dataset_import + sync_coordinator populate; backfill via sync_coordinator (already named in Tranche 09.1/09.2 — surface as concrete refactor row).
14. **MEDIUM — S4 hoist duplicate session-state singletons**: Khora `_sessionId/_dayId/_nowPath` + Anima `sessionCSState` Map → `shared/session-state.ts`. Removes env-vs-singleton drift risk; preconditions `s4'.psyche.state` landing.
15. **MEDIUM — S1 split `lib.rs` (881 LOC, 6 concerns)** → 7 small modules (residency, coordinate, frontmatter, l_alignments, ledger, compile_plan, graph_sync). Pure re-export preservation; zero blast radius.

### 3.3 Module Unification & Test-Gap Closure (LOWER PRIORITY)

- **S0 §5.5** FFI opaque-handle tightening (raw `*mut HolographicCoordinate` → `CoordHandle(NonZeroU64)`)
- **S0 §5.7** events.rs 522 LOC → 7-file split; lands `KleinFlipEvent` enum
- **S1 §5.2** `smart_env.rs` (614 LOC) split (index/scoring/IO concerns)
- **S2 §5.7** `dataset_import.rs` (1655 LOC) split
- **S3 §5.4** `SessionRecord` 53-field bag → Default + sub-record extraction
- **S4 §5.1/§5.2** Aletheia/Anima `extension.ts` per-tool-domain submodule splits
- **S5 §5.6** test coverage gaps (cypher-side `M5_HANDOFF_CONTRACT_VERSION` round-trip, etc.)

### 3.4 By Category Roll-up

| Category | Count | Highest priority items |
|---|---|---|
| File splits (LOW-blast-radius) | 10 of 15 | S3 lib.rs 4883, S0 server.rs 3235, S2 lib.rs 3072 |
| Type DRY / contract tightening | 3 | typed kernel-bridge JSON shapes (single most-leveraged); typed coordinate_home; typed c_1_relation_family enum |
| Module unification | 2 | S4 session-state hoist; S2 OWL/SHACL bridge audit |
| Contract test gaps | many | per-method dispatch tests after S3/S0 gate.rs splits; round-trip JSON schema tests for MathemeHarmonicProfile |

The pattern: **the highest-leverage cleanup is the typed kernel-bridge JSON shape** (item 11). It is the single point where five cycle-3 closures (10.2 klein_flip, 10.10 ananda_vortex, CCT-5 KleinFlipEvent enum, CCT-6 BedrockProvenanceHandle, DR-KB-2 depositionAnchor) land coherently. Doing this first removes coupling between four other tranches.

---

## 4. Theia Shell Design Verdict (against UI foundation principles)

The Theia shell invocation doc (THEIA-SHELL-INVOCATION-ARCHITECTURE.md, 659 lines) walks the operational paths from keystroke to widget to dispatcher to gateway and back, declaring how persistence guarantees survive every transition.

### 4.1 Per-principle honour audit

The 9 UI foundation principles (Tranche 15-ui-design-foundations.md:11-28):

| # | Principle | Shell-doc treatment | Verdict |
|---|---|---|---|
| 1 | Coordinate as primary navigation | §2.4 every editor widget publishes active coordinate to `coordinate-context` key; §9.3 status bar is itself coordinate-aware navigation | HONOURED |
| 2 | Profile-tick as primary clock | §3.2, §7.1 explicit pattern; §7.2 four cadence layers (60Hz / 12Hz / boundary / lens-anchored); §11 forbidden-patterns ban local timers | HONOURED |
| 3 | Provenance always visible | §2.3 capability-aware command visibility; §4.5 Diagnostics tab surfaces drift + readiness ledger inline | HONOURED |
| 4 | Bimba/Pratibimba as UI dial | §1.2 `cmd-period` = intra-layout 0/1 toggle = cosmic↔personal cross-fade; state persists per DR-TS-1 | HONOURED |
| 5 | OmniPanel as `/` operator membrane | §1.3 single widget instance survives every transition; §4 deep spec; §4.3 NO MODALS | HONOURED |
| 6 | Composition over juxtaposition | §6 deep spec; §6.4 composition-mount-point API; §6.5 ide-deep single-pole rejects side-by-side | HONOURED |
| 7 | Activity-bar discipline | §5 left-sidebar spec; modes self-reveal/hide per `LayoutSwitcher.onLayoutChange` | HONOURED |
| 8 | Theia conventions where they fit | §10.2 keybinding consumption; §2 invocation paths route through `CommandRegistry` | HONOURED |
| 9 | Day-now as ambient thread | §9.2 explicitly: status bar is the only day-now navigation surface; no widget owns a date picker | HONOURED |

### 4.2 Specific consistency findings

- The `cmd-period` semantics for `ide-deep` (DR-TS-3 PROPOSED: "swap active Mn pole to its dual — m1↔m4, m2↔m5, m3↔m0") is consistent with the matheme spine (M1↔M4 personal/cosmic dual; M2↔M5 paraśakti/epii; M3↔M0 mahamaya/anuttara via the lemniscate fold at #4).
- The six operational-capacity OmniPanel tabs (`operational-{cf,cfp,ct,cs,cp,cpf}` per §4.2 row 19) **correctly anchor to CLAUDE.md §III.D Layer-3 reflective-coordinate execution matrix**. This is the first cycle-3 doc to make the QL `()` operator visible at the shell. DR-TS-4 (naming canon) needs ratification.
- Five new PROPOSED DR rows (DR-TS-2..6) are surfaced cleanly — none conflict with existing decisions.

### 4.3 Verdict

**PASS.** All 9 foundation principles honoured. The doc adds operational depth without contradicting Tranche 15 or DR-TS-1. Five new DR-TS-* rows (2-6) require user validation; six concrete Tranche 11 / Tranche 15 enrichments named in §12.

---

## 5. Theia UI Patterns Verdict (against Tranche 11 + Tranche 15)

The UI patterns doc (THEIA-UI-PATTERNS-ARCHITECTURE.md, 878 lines) defines 8 UI primitives spanning Bimba Graph Viewer, Stacked Tabs, Provenance Overlay, Lemniscate Transition, Dispatch Genealogy Renderer, Composition Mount-Point, Day-Now Thread, Coordinate Tree, Smart Connections.

### 5.1 Tranche 11 alignment

§10.1 names four new Tranche 11 rows (11.10 Bimba Graph Viewer / 11.11 Coordinate Tree / 11.12 Stacked-Tabs / 11.13 Smart Connections). Each is consistent with Tranche 11's "theia-shell-surface-hosting" mandate; none touch Body/M/epi-tauri (deprecated migration-source).

### 5.2 Tranche 15 alignment

§10.2 names five Tranche 15 expansions (15.5 lemniscate / 15.6 provenance / 15.10 day-now / 15.11 dispatch-genealogy / 15.13 composition mount-point). Each is consistent with Tranche 15's UI principle landing; none contradict the 9 principles.

The doc's load-bearing claim — "no widget invents its own provenance rendering, its own tick-driven re-render, its own transition animation, its own genealogy view, its own composition mount, its own day-now" — IS the operational expression of UI foundation principles 2, 3, 5, 6. The four shared packages (`epi-ui-primitives`, `integrated-composition-contract`, plus `bimba-graph-viewer` + `coordinate-tree` extensions) consolidate scattered patterns into single sources of truth.

### 5.3 Specific findings

- **§3 Provenance Overlay unified ProvenanceState taxonomy** (7 members: canonical / derived / inferred / pending / canonical_absent / review_pending / blocked) collapsed from `KernelBridgeReadinessState` (9 states) + `M0ProvenanceState` (6 states) via existing `readinessSeverity()`. **Clean** — no taxonomy invention, just unification. DR-UI-3 PROPOSED awaits user ratification.
- **§4 Lemniscate Transition as single shader, three configurations** (0/1 toggle 400ms / Klein-flip 240ms / Möbius-return 320ms) is the correct response to "three transitions, one shape." Honours Tranche 15.5 + Tranche 15.8 + Tranche 15.9; closes potential animation-timer-drift risk before it lands.
- **§6 Composition Mount-Point API** with named mount points for K² (k2.{texture,streamlines,cells,halos,particles}) and dipyramid+Hopf-tori (dipyramid.vertices + hopf-tori.{linkage,texture,scent-trace} + dipyramid.psychoid-field) is the operational closure of Tranches 07.3, 08, 15.4. DR-UI-5 PROPOSED.

### 5.4 Verdict

**PASS.** Extends Tranches 11 + 15 cleanly. Five new DR-UI-* rows (1-5) require user validation. Lint enforcement (§3.7 expanded into Tranche 11.5) closes the "fork-by-accident" risk before it manifests.

---

## 6. Stacked-Tabs Decision

The shell-invocation doc (§8) and UI-patterns doc (§2) converge on the same recommendation: **horizontal-tabs default + stacked-single + stacked-pin modes as a per-dock-area preference** (`epi-logos.dock.{left,right,editor,bottom}.layout ∈ { "tabs", "stacked-single", "stacked-pin" }`).

### 6.1 Fit with the lived shape

- **Cosmic-side (daily-0-1):** the editor area renders the integrated 1-2-3 composition surface (single K² torus, three layered renderings). No stacked-tabs needed in editor area. Left sidebar runs three activity-bar modes (Day Calendar / Journal Entries / Personal Coordinate); activity-bar already enforces single-mode. **Stacked-tabs option is dormant on cosmic-side.**
- **Personal-side (daily-0-1):** mirror — integrated 4-5-0 composition; same story; activity-bar runs three modes. **Stacked-tabs option dormant.**
- **ide-deep:** five left-sidebar activity-bar modes; editor area can host multiple Mn extensions. **This is where stacked-tabs is load-bearing.** Operators reading M0 + M2 + M4 simultaneously gain from Obsidian-style vertical accordion.
- **OmniPanel right-sidebar:** tabs, not stacked. The 13+6+6 = 25 tab manifest (§4.2 shell doc) is too wide for stacked; correctly stays horizontal.

### 6.2 DR-TS-2 / DR-UI-2 unification

DR-TS-2 (shell doc §12.4) and DR-UI-2 (UI patterns §10.4) name the same decision under two ids. **Consolidate as single DR row DR-TUX-1 — per-dock-area tab-layout preference** to avoid ledger duplication.

### 6.3 Verdict

The recommendation **fits the lived shape**. Cosmic + personal sides don't need it (composition surfaces are single editor widgets); ide-deep gains from it; OmniPanel correctly excluded. Cycle-3 ships split-mode default; subsequent cycle implements Obsidian-style stacked rendering.

---

## 7. Bimba Graph Widget Ownership

Both Theia docs name the widget. Consistency check between them:

| Aspect | Shell-doc | UI-patterns-doc | Consistent? |
|---|---|---|---|
| Extension home | §5.1 `pratibimba.ide-shell.bimba-graph-viewer` (landed bimba-graph-viewer-widget.tsx 151 LOC inside `ide-shell-m0-m5`) | §1.8 NEW extension `bimba-graph-viewer` (proposed first-build) | **PARTIAL CONFLICT** |
| Daily-0-1 mode | solar-anchor view only | solar-anchor only enabled | ✓ |
| ide-deep mode | all four layout modes | all four layout modes | ✓ |
| Rendering library | not specified | force-graph / 3d-force-graph (vasturiano) per DR-UI-1 | UI-doc decisive |
| Filter palette | not detailed | six-checkbox c_1_relation_family + namespace + prefix + readiness + Cmd-F | UI-doc decisive |

### 7.1 Resolution

The shell doc cites a landed 151-LOC widget inside `ide-shell-m0-m5`. The UI-patterns doc proposes a new standalone extension. These differ:

- The landed `bimba-graph-viewer-widget.tsx:1-151` is a thin placeholder (most likely a stub view contribution; substantive renderer is not present).
- The UI-patterns proposal is the substantive widget (force-graph renderer + filter palette + four layout modes + tick choreography + DR-IG-1 wiring).

**Recommendation: extract the widget into a new dedicated `bimba-graph-viewer` extension** (per UI-patterns §1.8), and downgrade the existing 151-LOC widget inside `ide-shell-m0-m5` to a thin "open Bimba Graph Viewer" view contribution that activates the new extension. This:

- Honours UI-foundation principle 7 (activity-bar discipline) by giving the viewer its own extension home (it is consumed by both daily-0-1 and ide-deep + dockable to editor area + atelier consumer).
- Avoids `ide-shell-m0-m5` becoming a god-widget extension.
- Lets `force-graph` dependency be scoped to the new extension only.
- Lets the four named layout modes (`force-d3` / `solar-anchor` / `radial-cluster` / `hierarchical-coord`) live next to the layout-mode-switching UI.

This is a new proposed decision: **DR-TUI-1 — Bimba Graph Viewer owns its own extension; ide-shell-m0-m5 widget downgraded to view-contribution stub.** Consolidates DR-UI-1 (rendering library choice) under the same row.

---

## 8. New Decisions / Orphans / Cross-Cutting Tranches

### 8.1 New Decisions (PROPOSED)

The two Theia docs propose 11 PROPOSED DR rows (DR-TS-2..6, DR-UI-1..5, plus the shell-doc's DR-TS-3 cmd-period-in-ide-deep semantics). This verifier proposes consolidations + three S-stack additions:

**Consolidations (collapse duplicate rows):**
- **DR-TUX-1** (consolidates DR-TS-2 + DR-UI-2): per-dock-area tab-layout preference; default `split` editor / `tabs` sidebars; ratify Stack Mode for subsequent cycle.
- **DR-TUI-1** (consolidates DR-UI-1 + Bimba Graph Viewer ownership): widget owns standalone extension; force-graph rendering library; ide-shell-m0-m5's existing widget downgrades to view-contribution stub.

**New S-stack decisions surfaced by S-arch docs:**
- **DR-S0-1 (PROPOSED)** — `epi-kernel-contract` workspace location: keep sibling at `Body/S/epi-kernel-contract/` or promote into S0 hierarchy. Documentation only.
- **DR-S0-2 (PROPOSED)** — Per-method dispatch contract tests as part of S3/S0 gate.rs splits, OR as standalone landing tranche.
- **DR-S2-1 (PROPOSED)** — `graph_handle` / `coordinate_resolution_cache` profile-bus extension. New profile field on `MathemeHarmonicProfile.graph: GraphAnchorProjection` carrying canonical-form coordinate, depth, prefix, parent, axis.
- **DR-S3-1 (PROPOSED)** — `s3'.subscription.registry` typed readiness query method.
- **DR-S3-2 (PROPOSED)** — `s3'.kernel.envelope.subscribe` inverse to publish.
- **DR-S3-3 (PROPOSED)** — `s3.portal.publish` + `portal.subscribe` for selective portal-event filtering at gateway boundary.

**Theia shell + UI new decisions (verifier-ratified, awaiting user):**
- DR-TS-3, DR-TS-4, DR-TS-5, DR-TS-6 (shell doc §12.4) — pole-dual swap semantics, six operational-capacity naming canon, diagnostics privacy class, tick-pause policy.
- DR-UI-3, DR-UI-4, DR-UI-5 (UI patterns §10.4) — ProvenanceState unified taxonomy, lemniscate-single-primitive, composition mount-point typed contract.

Total proposed DRs after Phase C: **23 PROPOSED (10 from Phase B, 7 from S-stack arch, 6 from Theia design, after consolidations)** awaiting user validation.

### 8.2 New Orphans

Surfaced beyond Phase B's orphan list:

- **S1 missing coordinate-residency-on-move check** at `gate/s1_hen.rs` — "move that changes residency must update `coordinate` frontmatter" not enforced. Lands as DR-M1-4 closure dependency.
- **S3 portal.publish/portal.subscribe surface** — six portal events enumerated but no publish API; M-extensions cannot filter at gateway. Closes via DR-S3-3.
- **S3 `s3'.kernel.envelope.subscribe`** — publish exists, subscribe does not. Closes via DR-S3-2.
- **S4 `s4'.psyche.state` canonical surface** (S4-ARCH §10.4) — the largest missing S4/S4' surface; PARTIAL CLI shape landed, gateway contract not.
- **S5 `s5'.gnostic.*` family** beyond `context.retrieve` — already on the list but reaffirmed as named integration blocker.

### 8.3 New Cross-Cutting Tranches (extending CCT-1..8)

The eight existing CCTs (Klein-flip personal-scale / cymatic torus pin / geometric-scaffold terminology / torus_knot_phase SSOT / KleinFlipEvent enum / bedrock_link owner / PatternPacket chain / Cl(4,2) audit) close most cross-boundary surfaces. Five new CCTs surfaced:

- **CCT-9 — Typed kernel-bridge JSON edge** (the single most-leveraged cleanup, §3 item 11). Lands `KernelBridgeProfileJsonShape` + `KernelBridgePerformanceEventJsonShape` typed crates with `From<&MathemeHarmonicProfile>` impl. Closes Tranche 10.2 + 10.10 + CCT-5 + CCT-6 + DR-KB-2 coherently.
- **CCT-10 — `epi-ui-primitives` shared package landing.** Provenance overlay (§3 UI-patterns) + lemniscate transition (§4) + day-now thread (§7) ship as one package. Lint enforcement bans local duplicates.
- **CCT-11 — `integrated-composition-contract` shared package landing.** Composition mount-point typed contract (§6 UI-patterns) per surface (k2-torus / dipyramid-hopf-tori) per slot.
- **CCT-12 — Coordinate-residency-on-move enforcement (S1).** Hen-side guard on rename/move; integrates with DR-M1-4 Hen vault-instance contract.
- **CCT-13 — DR-IG-1 c_1_relation_family typed enum landing.** Schema constant + property spec + dataset_import + sync_coordinator population + backfill. Closes 09.1 + 09.2 cleanly.

### 8.4 Per-Tranche Ledger Harmonisation Actions

#### Tranche 11 (theia-shell-surface-hosting) — additions

- **11.10** Bimba Graph Viewer first-build (per UI-patterns §1, ratify DR-TUI-1 first)
- **11.11** Coordinate Tree extension first-build
- **11.12** Stacked-tabs option (per DR-TUX-1)
- **11.13** Smart Connections sidebar first-build (gated on S1 T6.5)
- **11.x.A** Backend Studio LSP contributions (rust-analyzer / clangd / pylsp / typescript-language-server navigating epi-lib / portal-core / S1–S5 cores)
- **11.x.B** Cross-layout intent envelope extension: add `open-omnipanel-tab`, `open-dispatch-trace`, `open-cosmic-side`, `open-personal-side` to `WELL_KNOWN_INTENT_KINDS`
- **11.x.C** Stack-mode preference doc-ahead landing
- **11.5 lint expansion**: ban local provenance border CSS classes + local readiness-state collapse + require `<ProvenanceBadge>` import in data-rendering widgets

#### Tranche 13 (decision register) — additions

Add to PROPOSED block:
- DR-TUI-1 (Bimba Graph Viewer ownership + force-graph)
- DR-TUX-1 (stacked-tabs preference, default split-editor)
- DR-TS-3, DR-TS-4, DR-TS-5, DR-TS-6 (shell semantics)
- DR-UI-3, DR-UI-4, DR-UI-5 (UI primitives)
- DR-S0-1, DR-S0-2 (S0 workspace + dispatch tests)
- DR-S2-1 (graph_handle profile field)
- DR-S3-1, DR-S3-2, DR-S3-3 (S3 contract gaps)

#### Tranche 14 (no-orphan audit + release gates) — updates

Add new release gates:
- **G12 — Phase-C S-stack arch docs landed + verified.** Six S-arch docs present at canonical paths; this verifier report present; Tranche 15+16 references arch docs.
- **G13 — Phase-C Theia design docs landed + verified.** Two Theia docs present; UI foundation principles cross-checked.
- **G14 — New PROPOSED DR rows ratified or downgraded.** The 13 new PROPOSED rows (Phase C) need user disposition before downstream tranches begin work on them.

Update orphan table with new orphan rows (§8.2 above).

#### Tranche 15 (UI design foundations) — expansions

- **15.6 expansion** — `@pratibimba/epi-ui-primitives` package per CCT-10
- **15.5 expansion** — Lemniscate transition primitive (three configurations)
- **15.10 expansion** — Day-Now thread service + status entry + day-note widget
- **15.11 expansion** — Dispatch Genealogy renderer (Trace + Stream tabs)
- **15.13 NEW** — Composition mount-point contract per CCT-11
- **15.7.A** — Extend `PratibimbaSessionState` to carry `activeOmnipanelTab` + `activeActivityBarMode`
- **15.2.A** — Six operational-capacity OmniPanel tabs (cfp/ct/cp/cf/cfp/cs) in ide-deep only
- **15.2.B** — Diagnostics tab spec (dispatch latency / slerp drift / per-extension profile-field consumption / readiness ledger / session-continuity audit)

#### Tranche 16 (cross-cutting closures) — additions

Add CCT-9, CCT-10, CCT-11, CCT-12, CCT-13 (per §8.3).

#### Tranches 17 + 18 (new)

- **NEW Tranche 17 — S-stack code modularisation campaign.** Bundles the 10 file-split items (§3.1) into named landing rows: 17.1 S3 gateway-contract; 17.2 S0 gate/server.rs; 17.3 S2 graph-schema lib.rs; 17.4 S5 capacity_workflows.rs; 17.5 S0 core/mod.rs; 17.6 S0 nara/oracle.rs; 17.7 S5 epii-autoresearch lib.rs; 17.8 S3 spacetime.rs; 17.9 S2 sync_coordinator.rs; 17.10 S0 portal-core kernel.rs. Each row has named scope, verification command, blast radius assessment.

- **NEW Tranche 18 — Profile-bus + kernel-bridge typed JSON edge.** Bundles CCT-9 (typed JSON shapes) + DR-S2-1 (graph_handle field) + the eight named profile-bus extensions from S0-ARCH §10.5 into one coherent landing: klein_flip, ananda_vortex, bedrock_link, pattern_packet_handle, s2_anchor/s3_anchor disposition, KleinFlipEvent 3-variant enum, depositionAnchor typed disposition, planet LUT cardinality + new graph_handle / coordinate_resolution_cache. Sequenced so the typed JSON serialiser lands first, then each field flows through cleanly. This is the single most leveraged cycle-3 cleanup; it consolidates 5+ existing tranches + 3 CCTs + multiple DRs into one named landing column.

---

## 9. Closing Frame

Phase C verification: **PASS across all eight dimensions.** No S↔M boundary failures. Anti-greenfield posture intact in every S-stack doc. Theia shell + UI patterns honour all 9 foundation principles and extend Tranches 11 + 15 cleanly without conflicts. The Stacked-Tabs and Bimba Graph Viewer decisions converge cleanly under consolidated DR-TUX-1 + DR-TUI-1 rows.

The cycle-3 ledger now needs: (a) 13 new PROPOSED DR rows ratified (DR-TUI-1, DR-TUX-1, DR-TS-3..6, DR-UI-3..5, DR-S0-1..2, DR-S2-1, DR-S3-1..3); (b) Tranches 11/15/16 enrichment per §8.4; (c) two new Tranches 17 + 18 covering the consolidated code modularisation campaign and the typed kernel-bridge JSON edge.

The single most-leveraged cleanup is CCT-9 / new Tranche 18 — the typed kernel-bridge JSON edge — because it consolidates five existing tranches (10.2 klein_flip, 10.10 ananda_vortex, CCT-5 KleinFlipEvent enum, CCT-6 BedrockProvenanceHandle, DR-KB-2 depositionAnchor) into one coherent landing. Doing this first removes coupling across the rest of cycle 3.

When the new DR rows are ratified and the new tranches added, cycle 3 is route-able for `/m-dev` execution per the dependency order in `00-overview §Execution Sequence`.
