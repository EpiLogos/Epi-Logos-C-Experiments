# Canon Audit: S0-terminal-cli-c

**Auditor scope:** Audit Tranche 17 S0-sub-rows + Tranche 18 (kernel-bridge JSON edge owner) against ratified DRs and S0 SPEC canon; verify DR-S0-1 (parent-crate framing) and DR-S0-2 (per-method dispatch tests as 17.2 sub-row).
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (lines 0-505 then 505-669)
- `Idea/Bimba/Seeds/S/S0/S0-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-0-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-1-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-2-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-3-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-4-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-5-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-CODON-ROTATION-PROJECTION-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-HARMONIC-POINTER-WEB36-SPEC.md`
- `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/phase-c-s-stack-theia-verification-report.md`
- `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` (input, not authority)

## Per-row audit

### 17.2 — Split `Body/S/S0/portal-core/src/gate/server.rs` (3,235 LOC)
- **Status:** WRONG-EXTRACTION (substrate path mis-cited) + DRIFT (missing per-method dispatch-test sub-row required by DR-S0-2)
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:33-37`
- **Current framing in tranche:** "Split `Body/S/S0/portal-core/src/gate/server.rs` (3,235 LOC)" into 6 files; "Blocks per-method contract tests."
- **Canon framing (if not ALIGNED):** The 3,235-LOC monolith lives in **`epi-cli`**, not `portal-core`: per S0-ARCHITECTURE §5.1 and §2.3, the file is `Body/S/S0/epi-cli/src/gate/server.rs` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:155-156` and `:304-318`). DR-S0-2 (ratified) requires per-method dispatch contract tests "land as part of Tranche 17.2 (gate/server split), NOT as a separate tranche" (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:500-502`).
- **Recommendation:** REWRITE
- **Recommendation detail:** Correct the path from `portal-core/src/gate/server.rs` → `epi-cli/src/gate/server.rs`. Add an explicit 17.2 sub-row (e.g. 17.2.a) landing per-method dispatch contract tests for each split module, per DR-S0-2. Verification command should be `cargo check -p epi-cli && cargo test -p epi-cli --test gate_server_method_*`, not `portal-core`.

### 17.5 — Split `Body/S/S0/portal-core/src/core/mod.rs` (2,485 LOC)
- **Status:** WRONG-EXTRACTION
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:51-55`
- **Current framing in tranche:** Split `Body/S/S0/portal-core/src/core/mod.rs` into 5 files.
- **Canon framing (if not ALIGNED):** Per S0-ARCHITECTURE §5.2 + §2.3 the 2,485-LOC `core/mod.rs` is in **`epi-cli`**, not `portal-core` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:156` and `:320-334`). `portal-core` has no `core/mod.rs`; the `core` surface is the `epi core` operator command tree.
- **Recommendation:** REWRITE
- **Recommendation detail:** Substrate-cite is solid (2,485 LOC, 5-file split, blast radius LOW); only the crate path is wrong. Patch to `Body/S/S0/epi-cli/src/core/mod.rs`; verification becomes `cargo check -p epi-cli && cargo test -p epi-cli`.

### 17.6 — Split `Body/S/S0/portal-core/src/kernel.rs` (1,266 LOC) (gating Tranche 18)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:57-62`
- **Current framing in tranche:** Split the 1,266-LOC `kernel.rs` into 9+ files behind the existing `harmonic_profile.rs` re-export façade; one file per `Matheme*Projection`; gates Tranche 18.
- **Canon framing (if not ALIGNED):** N/A — matches S0-ARCHITECTURE §5.3 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:336-352`) which proposes the same split behind the existing `Body/S/S0/portal-core/src/harmonic_profile.rs:1-14` façade.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Path correct (`portal-core`), façade discipline preserved, gating relation to T18 substrate-grounded.

### 17.12 — Split `Body/S/S0/portal-core/src/nara/oracle.rs` (2,203 LOC) + `medicine.rs` (1,271 LOC)
- **Status:** WRONG-EXTRACTION
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:97-99`
- **Current framing in tranche:** Split `Body/S/S0/portal-core/src/nara/oracle.rs` + `medicine.rs`.
- **Canon framing (if not ALIGNED):** Per S0-ARCHITECTURE §5.4 + §2.3 these files live in `epi-cli`, not `portal-core`: `Body/S/S0/epi-cli/src/nara/oracle.rs` (2,203 LOC) and `Body/S/S0/epi-cli/src/nara/medicine.rs` (1,271 LOC) (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:157-160` and `:354-373`). `portal-core` has no `nara/` subdir; portal-core's nara-adjacent file is `nara_journal.rs` (466 LOC).
- **Recommendation:** REWRITE
- **Recommendation detail:** Patch path to `epi-cli/src/nara/oracle.rs` and `epi-cli/src/nara/medicine.rs`. Substrate split proposal itself is sound.

### 17.13 — Split `Body/S/S0/portal-core/src/events.rs` (522 LOC) (gating CCT-5)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:101-105`
- **Current framing in tranche:** Split `events.rs` into 7 files; lands the 3-variant `KleinFlipEvent` discriminated union.
- **Canon framing (if not ALIGNED):** N/A — matches S0-ARCHITECTURE §5.7 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:406-421`) and DR-IG-2 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** `portal-core` path correct here (`events.rs` IS in `portal-core`, cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:120`). 3-variant enum landing matches DR-IG-2 ratified resolution.

### 17.14 — Split `Body/S/S0/portal-core/src/dataset_import.rs` (1,655 LOC)
- **Status:** WRONG-EXTRACTION
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:107-109`
- **Current framing in tranche:** Split `Body/S/S0/portal-core/src/dataset_import.rs`.
- **Canon framing (if not ALIGNED):** Tranche header explicitly attributes this to "S2-ARCHITECTURE.md §5 finding 7" — `dataset_import.rs` is S2 substrate (`Body/S/S2/graph-services/src/dataset_import.rs` per S-SYSTEM-INDEX parity matrix). Phase-C report §3.3 also classifies it under S2. The portal-core source listing in S0-ARCHITECTURE §2.2 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:117-138`) does NOT include `dataset_import.rs`.
- **Recommendation:** REWRITE
- **Recommendation detail:** Correct path to `Body/S/S2/graph-services/src/dataset_import.rs`. This is outside S0 scope but lands as a path-correction in T17.14; the substrate citation and refactor proposal otherwise stand.

### 17.21 — `Body/S/S0/luts/` subdir consolidation
- **Status:** DRIFT (path imprecise)
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:137-139`
- **Current framing in tranche:** Consolidate oracle_lut, mahamaya, transcription, rotational, codon, planet_keplerian under one subdir at `Body/S/S0/luts/`.
- **Canon framing (if not ALIGNED):** Per S0-ARCHITECTURE §5.8 the proposed subdir is `Body/S/S0/portal-core/src/luts/` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:424-434`). The LUT files (`oracle_lut.rs`, `mahamaya.rs`, `transcription.rs`, `rotational.rs`, `codon.rs`) are in `portal-core/src/`, not at S0 root.
- **Recommendation:** REWRITE
- **Recommendation detail:** Patch path to `Body/S/S0/portal-core/src/luts/`. Note that `personal_identity.rs:13-15` planet keplerian extraction is part of the proposal (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:430`).

### Tranche 17 — `epi-kernel-contract` framing (implicit, via T17 header citing `Body/S/`)
- **Status:** MISSING-CITATION (Tranche 17 nowhere reflects DR-S0-1's parent-role correction)
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:1-175`
- **Current framing in tranche:** Tranche 17 lists no row patching the S0-ARCHITECTURE.md §1/§5.9 framing of `epi-kernel-contract` as "sibling-to-S0".
- **Canon framing (if not ALIGNED):** DR-S0-1 (VALIDATED 2026-06-03) ratifies `epi-kernel-contract` as the **parent crate** of the S-stack, hosting the inter-layer contract S0..S5 conform to; Action item explicitly: "Patch S0-ARCHITECTURE.md §1 to say 'parent crate of S-stack at Body/S/epi-kernel-contract/' not 'sibling-to-S0'. Update S-SYSTEM-INDEX to reflect parent-role." Depends: "Tranche 17 sub-row for spec patch" (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:490-498`). S0-ARCHITECTURE.md §1 still describes the crate as a "sibling crate at `Body/S/epi-kernel-contract/` (NOT under `Body/S/S0/`)" (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:188-190`); §5.9 calls it "sibling-to-S0" (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:436-444`).
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add a Tranche 17 sub-row (e.g. **17.26 — Patch S0-ARCHITECTURE.md §1/§2.4/§5.9 + S-SYSTEM-INDEX framing to "parent crate of S-stack"** per DR-S0-1). Classify as `doc-ahead-landing`. Verification: `grep -n 'parent crate\|parent-role envelope' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` returns the corrected framing; `grep -n 'sibling-to-S0' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` returns no live attributions. DR-S0-1 explicitly cites this dependency.

### 17.23 — Migrate/decommission `Body/S/S3/epi-app`
- **Status:** ALIGNED (touches S3, not S0; included only because referenced from cycle-3 S-stack campaign)
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:147-149`
- **Current framing in tranche:** Mark `Body/S/S3/epi-app` deprecated; M' shell authority moved to `Body/M/epi-theia`.
- **Canon framing (if not ALIGNED):** N/A — matches DR-S3-1 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:554-557`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Out of S0 scope strictly; included only because tranche row references the S0-side T17 frame. No S0 implication.

### 18.1 — Typed JSON shape extraction (`KernelBridgeProfileJsonShape` + `KernelBridgePerformanceEventJsonShape`)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:46-56`
- **Current framing in tranche:** At `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`, introduce two `Serialize/Deserialize` typed shapes; mirror on TS at `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`.
- **Canon framing (if not ALIGNED):** N/A — matches S0-ARCHITECTURE §5.6 + §10.5 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:390-404` and `:596-609`) and S0-SPEC §"M' Shell Consumed Contract Closure" which fixes `KernelBridgeAPI` as the single typed boundary (cited: `Idea/Bimba/Seeds/S/S0/S0-SPEC.md:39-64`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate paths correct (`epi-cli/src/gate/kernel_bridge_runtime.rs`). 18.1 explicitly depends on 17.6 (`portal-core` kernel.rs split) per cycle-3 dependency note.

### 18.2 — Land `klein_flip` + `KleinFlipEvent` together (closes 10.2 + CCT-5 + DR-IG-2)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:58-73`
- **Current framing in tranche:** (a) Add `klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile`, populate from `vimarsha_reading.rs`; (b) Land 3-variant enum at `events.rs` after 17.13 split; subscribers match exhaustively.
- **Canon framing (if not ALIGNED):** N/A — matches DR-IG-2 ratified resolution which adopts the three-variant `KleinFlipEvent` at the kernel-bridge level with `Body/S/S0/portal-core/src/events.rs` as single source of truth (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318`). DR-IG-3 (M3 codon-ring subscribes to the same event) further reinforces (cited: `:322-332`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** 3-variant enum correctly named (`M1TritoneCrossing`, `M2CymaticValenceInvert`, `M3CodonRotationCross`). Dependency on 17.13 split is correct.

### 18.3 — Land `ananda_vortex: AnandaVortexProjection` (closes 10.10)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:75-84`
- **Current framing in tranche:** Surface through 18.1 typed JSON shape; preserve canonical dual-register cell (raw/no-digit-root + digit-root fields); typed fixture covers `7X+1` and `8X+0` CSV faces; m1-paramasiva-played-torus consumes typed handle.
- **Canon framing (if not ALIGNED):** N/A — substrate citation is `M1-2-ANANDA-VORTEX-ARCHITECTURE.md §4.3` (cited via `18-typed-kernel-bridge-json-edge.md:14`). Cross-aligns with S0-ARCHITECTURE §10.5 item 2 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:601`) and the codon-rotation projection living in `portal-core`, not in M1'/M2' renderer code (cited: `Idea/Bimba/Seeds/S/S0/S0-CODON-ROTATION-PROJECTION-SPEC.md:11-16`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** The dual-register cell preserved; fixture coverage explicit; consumer named (m1-paramasiva-played-torus per DR-M1-2).

### 18.4 — Per-domain typed projections M0-M5
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:86-101`
- **Current framing in tranche:** Six projection structs + reading handles surfaced through 18.1; PersonalPoleProjection exposes only OpaqueProtectedHandle for sensitive fields per DR-M4-3.
- **Canon framing (if not ALIGNED):** N/A — strict-invariant matches DR-M4-3 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:424-434`). VAK-address authority matches DR-VAK-1 active order `CPF, CT, CP, CF, CFP, CS` (cited: `:150-160`). DR-M3-4 transcription packet chain reflected (cited: `:126-134`). DR-M3-5 coupling-flow discipline reflected (cited: `:138-146`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** All M3 reading discipline preserved; coupling-flow caveat language preserved; protected handles for M4 honour DR-M4-3 strict invariant.

### 18.5 — Composition projections (`CosmicCompositionState`, `PsychoidFieldProjection`, `CanonRecognitionStream`)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:103-110`
- **Current framing in tranche:** Three composition state projections; PsychoidFieldProjection is "dipyramid + Hopf-linked tori; per DR-IG-6".
- **Canon framing (if not ALIGNED):** N/A — DR-IG-6 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:364-382`) ratifies dipyramid topology with full 6+6 P/P' mapping (P5/P5' apex + P1-4 base + P1'-4' inverted base + P0/P0' central axis-point). The 18.5 row name `PsychoidFieldProjection` is consistent with the ratified resolution to downgrade "psychoid torus" to colloquial UX prose only.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Naming honours DR-IG-6. Consumers named (integrated-1-2-3 + integrated-4-5-0 plugins).

### 18.6 — Audit `s2_anchor` / `s3_anchor` placeholders (closes 10.4)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:112-116`
- **Current framing in tranche:** Either populate using cycle-2 S2/S3 anchor registries, or downgrade to `#[deprecated]` and remove. No greenfield.
- **Canon framing (if not ALIGNED):** N/A — matches S0-ARCHITECTURE §10.5 item 5 and §3.3 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:604` and `:257`). Anti-greenfield posture preserved.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Binary decision (populate-or-remove) is the correct closure for an always-`None` field.

### 18.7 — Land `bedrock_link: BedrockProvenanceHandle` (closes CCT-6)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:118-122`
- **Current framing in tranche:** Extend `MathemeHarmonicProfileReadinessFact` with `bedrock_link: BedrockProvenanceHandle` enum naming the substrate chain (file:line → .rodata → profile field → here); readiness ledger renders inline per Tranche 15.6.
- **Canon framing (if not ALIGNED):** N/A — matches the Bedrock7 substrate authority described in S0-HARMONIC-POINTER-WEB36-SPEC §C (cited: `Idea/Bimba/Seeds/S/S0/S0-HARMONIC-POINTER-WEB36-SPEC.md:103-166`) and S0-ARCHITECTURE §10.5 item 3 + §7.1 item 3 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:602` and `:516`). Wires to DR-UI-3 unified `ProvenanceState` taxonomy (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:648-650`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Provenance chain naming discipline correct.

### 18.8 — Typed `deposition_anchor` field (closes DR-KB-2)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:124-128`
- **Current framing in tranche:** Add `pub deposition_anchor: DepositionAnchorProjection` to `MathemeHarmonicProfile`; `kernel.rs` is authority; bridge JSON edge reads struct field, not synthesises.
- **Canon framing (if not ALIGNED):** N/A — matches DR-KB-2 ratified resolution (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:264-272`): "Typed `MathemeHarmonicProfile` field. `kernel.rs` is the authority; bridge DTO follows."
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Exact match with ratified DR-KB-2.

### 18.9 — Land `graph_handle: GraphAnchorProjection` (from S2-ARCH §4)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:130-134`
- **Current framing in tranche:** Surface S2 graph anchor through profile bus so M' surfaces don't re-parse coordinates on every tick; includes typed `CoordinateHome` enum (from 17.17 dependency) and `gds_overlay_state` enum projection.
- **Canon framing (if not ALIGNED):** N/A — matches DR-S2-1 ratified resolution (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:537-539`): "Land typed graph anchor on `MathemeHarmonicProfile`. Depends: Tranche 18.9."
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** 17.17 dependency for typed `CoordinateHome` enum correctly linked.

### Tranche 18 Dependency note (depends on 17.6 landing first)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:40-42`
- **Current framing in tranche:** "Tranche 18 depends on **17.6** (split `Body/S/S0/portal-core/src/kernel.rs`) landing first."
- **Canon framing (if not ALIGNED):** N/A — matches S0-ARCHITECTURE §5.3 sequencing (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:336-352`) and §10.2 ordering (cited: `:578-583`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Path is correct here (T17.6 IS in `portal-core`); the dependency relationship is substrate-grounded.

### Tranche 17 dependency on T17.1 (gateway-contract split lands FIRST)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md:165-168`
- **Current framing in tranche:** "17.1 (gateway-contract split) lands FIRST — gates 17.2 / 17.7 / 17.16 dependency chains"; "17.6 (kernel.rs split) lands BEFORE Tranche 18"; "17.13 (events.rs split) lands BEFORE CCT-5".
- **Canon framing (if not ALIGNED):** N/A — gateway-contract is an S3 crate and gates 17.2 (which despite the wrong-path label IS the `epi-cli/src/gate/server.rs` 3,235 LOC split — and `epi-cli` depends on `gateway-contract` per workspace cargo edges).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Sequencing is correct; only the path attribution in 17.2 itself is wrong.

## Drift patterns observed

The dominant drift pattern across Tranche 17's S0 sub-rows is **crate-path mis-attribution**: rows 17.2, 17.5, 17.12, 17.14, and 17.21 all locate substrate inside `Body/S/S0/portal-core/src/...` when the actual landed files live in `Body/S/S0/epi-cli/src/...` (gate/server.rs, core/mod.rs, nara/oracle.rs, nara/medicine.rs) or `Body/S/S2/graph-services/src/...` (dataset_import.rs). The pattern looks like a global path-prefix substitution mistake during tranche authoring rather than conceptual drift — the LOC counts, blast-radius classifications, and proposed split shapes match S0-ARCHITECTURE §5 substrate-grounded findings exactly. S0-ARCHITECTURE §2.2 (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:117-138`) clearly inventories the 19 `portal-core/src/*.rs` files; none of the mis-attributed files appear there. Tranche 17.6 (kernel.rs in portal-core), 17.13 (events.rs in portal-core), and 17.21 (luts/ subdir intended for portal-core/src/) get the crate right because those files genuinely are in portal-core.

The second drift is **missing DR-S0-1 dependency closure**: Tranche 17 contains zero rows patching the S0-ARCHITECTURE.md framing of `epi-kernel-contract` as "sibling-to-S0", despite DR-S0-1 explicitly naming "Tranche 17 sub-row for spec patch" as the dependency. This is a missed cleanup item that DR-S0-1 commits cycle-3 to landing.

The third drift is **soft on DR-S0-2 sub-row attribution**: Tranche 17.2 mentions "Blocks per-method contract tests" but does not include them as a sub-row, despite DR-S0-2 ratifying that per-method dispatch tests "land as part of Tranche 17.2 (gate/server split), NOT as a separate tranche." Without an explicit sub-row the tests risk falling through.

## Tranche augmentation / removal / addition recommendations

- **REWRITE 17.2** — Patch path from `Body/S/S0/portal-core/src/gate/server.rs` to `Body/S/S0/epi-cli/src/gate/server.rs` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:155-156` + `:304-318`). Add sub-row 17.2.a "Per-method dispatch contract tests for each split module" per DR-S0-2 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:500-502`). Verification: `cargo check -p epi-cli && cargo test -p epi-cli --test gate_server_method_*`.
- **REWRITE 17.5** — Patch path from `Body/S/S0/portal-core/src/core/mod.rs` to `Body/S/S0/epi-cli/src/core/mod.rs` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:156` + `:320-334`).
- **REWRITE 17.12** — Patch paths from `Body/S/S0/portal-core/src/nara/{oracle,medicine}.rs` to `Body/S/S0/epi-cli/src/nara/{oracle,medicine}.rs` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:157-160` + `:354-373`).
- **REWRITE 17.14** — Patch path to `Body/S/S2/graph-services/src/dataset_import.rs` (consistent with the row's own "S2-ARCHITECTURE.md §5 finding 7" reference; out of S0 scope but the row's path is wrong).
- **REWRITE 17.21** — Patch subdir path from `Body/S/S0/luts/` to `Body/S/S0/portal-core/src/luts/` (cited: `Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md:424-434`).
- **ADD 17.26 (new sub-row)** — `doc-ahead-landing`: patch S0-ARCHITECTURE.md §1, §2.4, §5.9 + S-SYSTEM-INDEX framing of `epi-kernel-contract` from "sibling-to-S0" to "parent crate of S-stack at `Body/S/epi-kernel-contract/`" per DR-S0-1 (cited: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:490-498`). Verification: `grep -n 'parent crate\|parent-role envelope' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` returns the corrected framing; `grep -n 'sibling-to-S0' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` returns zero live attributions.

## Open questions for user

(none — all canon questions in the audited tranche scope are settled by ratified DRs DR-S0-1, DR-S0-2, DR-IG-2, DR-IG-3, DR-IG-6, DR-KB-2, DR-M3-4, DR-M3-5, DR-M4-3, DR-S2-1, DR-UI-3, DR-VAK-1; remaining work is path-correction and a missing DR-S0-1 closure sub-row in T17, both of which are substrate-grounded edits not requiring fresh user decisions)
