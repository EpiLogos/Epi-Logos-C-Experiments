# Track 29 — Integrated Plugin Composition Deep UX

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Closes the geometric-composition deep design for the two integrated plugins — `plugin-integrated-1-2-3` (cosmic engine: 1-2-3) and `plugin-integrated-4-5-0` (personal recognition: 4-5-0) — beyond the substrate already named by Tracks 07, 08, 11, 15, and 19. Track 29 does NOT re-author the per-pole frontend deep design (Tracks 22 M1, 23 M2, 24 M3, 25 M4, 26 M5, 21 M0 own those); it does NOT re-author the composition contract preflight at `08-t0-composition-contract-preflight.{md,json}`; it does NOT re-author the 137 = 64 + 72 + 1 matheme spine substrate at Tracks 07.2 / 19.8 / 19.9; it does NOT re-author the 4'-5'-0' contemplation RPC at Track 19.6 / 19.7; it does NOT re-author the M4 protected-local privacy substrate at Track 08.1; it does NOT re-author Track 11 §11.8 integrated readiness gate. Track 29 owns the actual geometric composition geometry, the shared composition primitives that make composition-over-juxtaposition real, the readiness gating at composition load, and the cross-coordinate state flow across all six personal slots — over the existing landed substrate. Two roles, one substrate (the same composition substrate serves both plugins) — Wave-C lands the composition pattern that 15.4 names but does not design.

Both compositions pull from their three constituent M-extensions per 15.4; both gate on Wave-A pending profile-fields per 11.8; both compose over a SHARED `integrated-composition` substrate. Track 29 is the bridge between the per-pole frontend depth (21-26) and the integrated surface contracts (07 / 08 / 11.8 / 15.4) — it makes composition real at the geometric level. Anti-greenfield throughout: three packages exist, twenty-four common-side source files in `integrated-composition`, three contribution panes per plugin; Wave-C extends.

## Source Specs and Matrix

- **Canonical UX intent:** `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md` §§5b.1-5b.10 (vortex visible heartbeat on K²), `Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md` §0 axiom + §7.5 alive-and-tarot-like default, `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md` §6.4 Integrated 4/5/0 Recognition Surface + §13.5 The One Loop, `Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md` §8 Parashakti-serves-Nara, `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` §3 one-substrate-three-renderings, `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md` §2.6 scent-following Atelier
- **Canonical seed:** `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` §"Shell layer" L91-149, `Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md` (899 LOC), `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` (838 LOC), `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` §6.7 `Q_composed = Q_identity · Q_transit · Q_activity ∈ S³` + §7 137 spine, `Idea/Bimba/Seeds/M/4-5-0-CONTEMPLATION-INTEGRATION-PLAN.md`, `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §5 K² texture surface + §6 tick choreography
- **Stage-1 Wave-C foundations consumed (read all for composition data inputs):** Track 21 (M0 contemplative panels + Anuttara grounding for under-layer of 4-5-0), Track 22 (M1 played K² torus + ananda vortex), Track 23 (M2 cymatic frequencies on K² surface), Track 24 (M3 codon-rotation projecting onto lens-ring cells), Track 25 (M4 Nara journal + personal cymatic Hopf-tori at personal scale), Track 26 (M5 recognition layer + EBM 72-dim resonance grid + WisdomDeltaInspector + Q_composed), Track 36 (Anuttara pentadic runtime trace overlay and 4-5-0 recognition handoff)
- **Substrate evidence:** `Body/M/epi-theia/extensions/integrated-composition/src/common/{composition-coordinator.ts, layout-claim.ts, profile-field-checker.ts, jiva-siva-fields.ts, consent-gate.ts, epii-review-actions.ts, epii-review-state.ts, privacy-scrubber.ts, recognition-claim.ts, evidence-envelope.ts, evidence-producers.ts, integrated-state.ts, state-coordinator.ts, integrated-deep-links.ts, s5-review-actions.ts, omni-panel.ts, graphiti-source-guard.ts, workspace-persistence.ts, release-gate.ts, empty-state.ts, commands.ts, index.ts}` (24 source files); `Body/M/epi-theia/extensions/integrated-composition/src/browser/{bridge-gate.ts, integrated-empty-state.tsx, index.ts}`; `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/{common/index.ts, browser/{cosmic-engine-panes.tsx, plugin-integrated-1-2-3-widget.tsx, frontend-module.ts}}`; `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/{common/index.ts, browser/{jiva-siva-panes.tsx, epii-review-panel.tsx, plugin-integrated-4-5-0-widget.tsx, frontend-module.ts}}`; `Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}`
- **Contract preflight:** `Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}` (composition contract authority — `IntegratedSurfaceContribution`, `IntegratedViewPart`, `IntegratedMiniInspector`, `IntegratedEvidenceProducer`, `IntegratedLayoutClaim`, `IntegratedReadiness`)
- **Full row-level wave-C reconciliation:** `plan.runs/wave-c-integrated-plugins-composition-matrix.md` (17 rows; DR-WC-IP-1..5 + CP-WC-IP-1..9 + OW-WC-IP-1..3)
- **Cross-references (consumed verbatim, NOT re-authored):** **07** Tranches 7.1-7.9; **08** Tranches 8.1-8.7; **10** Tranches 10.2 (klein_flip) / 10.10 (ananda_vortex) / 10.P5 (AnuttaraPentadicRuntimeTrace) / 10.M4 (PersonalPoleProjection) / 10.M5 (canon_recognition_stream); **11** Tranches 11.6 (state-identity) / 11.8 (integrated-plugin readiness gate) / 11.10 (canvas-editor) / 11.11 (highlight categories) / 11.12 (ambient strip + tuning bar); **15** Tranches 15.1 (foundation principles) / 15.2 (OmniPanel) / 15.4 (composition pattern) / 15.5 (lemniscate toggle) / 15.6 (profile-tick clock) / 15.7 (BimbaPratibimbaUiState) / 15.8 (ananda K² visual contract) / 15.9 (tick choreography slerp) / 15.10 (status bar discipline) / 15.11 (dispatch genealogy) / 15.12 (visual regression harness); **18** Tranches 18.2 (shared three-variant `KleinFlipEvent`); **19** Tranches 19.6 (contemplation RPC) / 19.7 (close-path wire) / 19.8 (Kaprekar LEAN) / 19.9 (7-8-9 spine); **21-26** Wave-C stage-1 outputs; **36** Tranches 36.4-36.6

## Cycle 2 Substrate Inheritance

Consume as-is — the three landed extension packages and the composition contract preflight:

- **`Body/M/epi-theia/extensions/integrated-composition/`**: 24 common-side source files + 3 browser-side files. The composition substrate is rich and load-bearing:
  - `composition-coordinator.ts` — `CompositionCoordinator` class with `resolveClaims()` arbitration over five widget-region singleton slots (`center-stage`, `side-panel`, `audio-bus`, `selection-owner`, `evidence-panel`), plus `mini-inspector` multi-slot mount; `aggregateReadiness()` collapses contributor readiness to worst severity; `enforceProtectedLocalBoundary()` checks M4 contributions for raw-body selectors. Wave-C extends, does NOT replace.
  - `layout-claim.ts` — `IntegratedLayoutSlot` enum (six values); `IntegratedLayoutClaim`, `ResolvedLayoutClaim`, `IntegratedNamedLayout`, `IntegratedContributorRecord`, `IntegratedReadinessAggregate`; `COSMIC_ENGINE_LAYOUT` + `JIVA_SIVA_LAYOUT` named layouts; `NAMED_LAYOUTS` + `findNamedLayout()`. Wave-C extends the enum + adds peer `IntegratedGeometricSlot` enum, does NOT replace.
  - `profile-field-checker.ts` — `ProfileFieldName` (11 values) + `PaneAvailability` + `FIELD_OWNER_TRACKS` map + `M3_CENTER_FIELDS`/`M2_LEFT_FIELDS`/`M1_RIGHT_FIELDS` + `checkField()` + `buildPaneAvailability()`. Wave-C consumes per-pole field watchlists as-is; extends `IntegratedReadiness` envelope to fold these.
  - `jiva-siva-fields.ts` — `JivaSivaFieldName` (9 values) + `JivaSivaPaneAvailability` + `OWNER_TRACKS` + per-pane field sets. Wave-C consumes as-is.
  - `consent-gate.ts`, `epii-review-actions.ts`, `epii-review-state.ts`, `s5-review-actions.ts`, `recognition-claim.ts`, `privacy-scrubber.ts`, `evidence-envelope.ts`, `evidence-producers.ts`, `graphiti-source-guard.ts`, `release-gate.ts`, `integrated-state.ts`, `state-coordinator.ts`, `integrated-deep-links.ts`, `workspace-persistence.ts`, `omni-panel.ts`, `empty-state.ts`, `commands.ts` — landed substrate. Wave-C extends specific files (`workspace-persistence.ts` for composition-state, `integrated-deep-links.ts` for composition routes, `omni-panel.ts` for composition events) but does not rebuild.
  - `bridge-gate.ts` (browser) — `IntegratedBridgeGate` class with `onConnectionStatus` subscription + `isAttached()` + `onChange()` + `dispose()`. Wave-C extends with composition-specific readiness gating, does NOT replace.
  - `integrated-empty-state.tsx` (browser) — shared visual shell rendering blocked contributors with owner track + blocker id. Wave-C extends per readiness state grammar, does NOT replace.

- **`Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`**: `frontend-module.ts` (Container module + frontend contribution + bridge-gate gating + commands registration); `plugin-integrated-1-2-3-widget.tsx` (ReactWidget host); `cosmic-engine-panes.tsx` (three pane render — `m3CenterStage`, `m2LeftStage`, `m1RightInspector`; reads `codon`, `mahamaya`, `resonance72`, `planetaryChakral`, `kleinFlipState`, `lens`, `mode`, `audio_octet`, `nodal_quartet` from profile payload; renders per-pane blockers when `PaneAvailability.allFieldsPresent === false`; no local tables — enforced by `cosmic-engine-no-local-tables.test.mjs`). Wave-C extends widget body for geometric composition geometry; relegates `cosmic-engine-panes.tsx` panes to mini-inspector mode.

- **`Body/M/epi-theia/extensions/plugin-integrated-4-5-0/`**: `frontend-module.ts`; `plugin-integrated-4-5-0-widget.tsx`; `jiva-siva-panes.tsx` (three pane render — `m4Foreground`, `m0Backdrop`, `m5Side`; reads `bedrock_link`, `selected_coordinate`, `activity_resonance_dots`, `field_state_summary`, `gds_clusters`, `m0_coordinate_provenance`, `review_queue_count`, `continuity_handle`, `last_canon_recognition_event` from profile payload; consent-gated deep-actions per slot); `epii-review-panel.tsx` (S5 review actions). Wave-C extends widget body for geometric composition; relegates `jiva-siva-panes.tsx` panes to mini-inspector mode; mounts canvas-editor + personal cymatic + recognition layer + Anuttara grounding.

- **`Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}`** — composition contract authority. Forbidden imports (10 entries) + readiness taxonomy (9 ids) + shared bridge rules. Wave-C honours; does not amend (08-t0 amendments are Wave-B contract jobs).

- **`Body/M/epi-theia/extensions/m-extension-runtime/src/`** — `SharedBridgeAdapter`, `MathemeHarmonicProfileBoundary`, `CoordinateContext`, `MExtensionReadinessSnapshot`, `MExtensionContributionContract`, `ReadinessBanner`, `Disposable`, `Emitter`/`Event`. All read-only at the composition domain.

Cycle 2 Track 08 (cosmic 1-2-3 plugin) + Track 09 (personal 4-5-0 plugin) named the plugins; cycle 3 Tracks 07 + 08 + 11.8 closed the readiness contracts; cycle 3 Tracks 22-26 closed the per-pole frontend depth; cycle 3 Track 29 closes the **integrated composition geometry** — how the three poles compose as ONE surface per 15.4.

## Surface Contracts

### Composition over juxtaposition is the law (per 15.4)

Three pane components from each plugin become **mini-inspectors** when the composition mounts. The editor area becomes **one composition surface**:

- **Cosmic 1-2-3 editor area:** ONE 3D played K² torus surface (M1 owner per Track 22 §22.2) holding the lens-ring; M2 cymatic engine frequencies texture the surface (M2 contribution per Track 23 §23.10); M3 codon-rotation projects cell-state onto the lens-ring cells (M3 contribution per Track 24 §24.13); ananda vortex matrix families cross-fade as perspex layers per 15.8; one profile-tick subscription drives the slerp per 15.9.
- **Personal 4-5-0 editor area:** Nara journal as LEFT composition slot (M4 canvas-editor per 11.10 + ambient strip per 11.12); personal cymatic field as CENTER (M4 psychoid renderer per 25.6, dipyramid + Hopf-linked tori at personal scale per DR-IG-6); Mahamaya recognition layer as RIGHT (M5 recognition surface per 26.11 consuming M3 codon at personal scale via Q_composed); Anuttara grounding as UNDER-LAYER (M0 R-virtue witness vector per 21 + 19.6 Verifier output).

Both compositions reject side-by-side juxtaposition contributions at composition load (hard-fail); both render `integrated-empty-state.tsx` at runtime when a granted slot's contributor is blocked (graceful-degrade).

### Cosmic 1-2-3 composition geometry (the editor area)

**Geometric slot taxonomy** (DR-WC-IP-1 ratified): four slots, distinct from widget-region:

- **`surface`** — owned by `m1-paramasiva-played-torus` (Track 22 §22.2) via `K2SurfaceHandle`. The played K² 3D torus is THE surface. Bevy/wgpu renderer per DR-M1-2.
- **`texture`** — owned by `m2-parashakti` (Track 23 §23.10) via `compositionMountPoint`. M2 cymatic frequencies render ON the K² surface as standing-wave texture. Reads-only — composition NEVER mutates the M2 substrate.
- **`cell-state`** — owned by `m3-mahamaya` (Track 24 §24.13) via codon-rotation composition export. M3 codon-rotation projects onto lens-ring cells of the K² torus. Reads-only.
- **`grounding`** — owned by `m0-anuttara` (Track 21) as backdrop provenance handle (canonical Anuttara reference; Bimba/Pratibimba dial state). Optional in cosmic — present as backdrop only.

**Composition data flow:**
- M1 owns geometry (the K² topology, the played-torus surface mesh, the slerp animation primitive per 15.9, the ananda vortex matrix families perspex cross-fade per 15.8).
- M2 contributes texture (resonance72 + planetaryChakral + Chladni standing-wave reference per 23.10).
- M3 contributes cell-state (codon_rotation_projection per 24.13 binding to lens-ring cells).
- Single `ProfileTickSubscription` drives all three poles via `useCompositionProfile()` React hook (DR-WC-IP-4).
- Single `KleinFlipEvent` subscription drives the three-pole choreography at tick 5→6 (M1 fold + M2 valence invert + M3 axis flip — per DR-IG-3).
- 137 = 64 + 72 + 1 matheme spine renders as visual annotation overlay (29.8): 64-side label on M3 lens-ring (lower-half cells); 72-side label on M2 cymatic surface (upper hemisphere); +1 bridge labelled `9_{M_2} = 8_{M_3} + 1_{M_1}` between them; 7-8-9 spine at over-cycle scale; Mersenne `127 = 2^7 - 1` in proof mode only.
- `AnuttaraPentadicRuntimeTrace` renders as a live profile overlay (29.15 / Track 36.4): 0/1 substrate marker on the M1 tick surface, 5-degree quantum on the M2 texture, Mahamaya address64/codon on the M3 lens-ring, and the 4/5/6 hinge label at the Klein-flip boundary.

**What cosmic composition NEVER does:** mutate the substrate; open a parallel profile subscription; render local codon tables; recompute K² geometry; recompute ananda vortex values; render a fourth pole.

### Personal 4-5-0 composition geometry (the editor area)

**Geometric slot taxonomy** for personal: six slots:

- **`left-composition`** — owned by `m4-nara` via canvas-editor (11.10) + ambient state strip (11.12) + tuning bar (11.12) + highlight service (11.10) for `recognition`/`prospective-surfacing`/`retrospective-surfacing`/`kairos-touch`/`somatic-mark`/`live-spread` categories (11.11). Tiptap mount.
- **`center-composition`** — owned by `m4-nara` via personal cymatic field renderer (25.6) consuming `psychoid_cymatic` opaque renderer handle (Track 5.5 deliverable). Hopf-linked tori at personal scale; dipyramid geometry per DR-IG-6 (apex P5/P5' + interleaved P1-P4/P1'-P4' + axis P0/P0').
- **`right-composition`** — owned by `m5-epii` via recognition layer widget (26.11) consuming both M4 Q_composed opaque handle (25.6) AND M3 codon-rotation reads-only export (24.13). Renders M3 codon at personal scale via `Q_composed = Q_identity · Q_transit · Q_activity ∈ S³` (alpha-quaternionic §6.7). 72-dim resonance grid (26.1) folded into the layer.
- **`grounding`** (UNDER-LAYER) — owned by `m0-anuttara` via Anuttara grounding panel (Track 21). M0 R-virtue witness vector (9-bit per Tranche 1.10 Verifier module) visible as a thin contemplative footer beneath the three-slot row. Cross-link 19.6 Verifier-side reading.
- **`composition-ambient`** — kairos display chrome (25.15) + Mercurius indicator (25.16) + three-mode time-axis switcher (25.17) span the top of the composition (NOT in slot-pane; chrome row).
- **`composition-status`** — privacy-class indicator per slot (per-widget border-tint per 25.18); session-close ceremony pane (25.19) overlays the composition when `m5.session.contemplation.complete` fires.

**Privacy class enforcement:** M4 protected-local throughout 4-5-0 paths. Composition NEVER carries:
- raw `q_personal` / `q_identity` / `q_transit` / `q_activity` quaternions (only opaque handles)
- raw `audio_octet` bodies
- plaintext journal / dream / oracle interpretation text (only canvas-editor reads from the protected vault path)
- Graphiti episode bodies (only opaque references)
- raw natal-chart bodies (only path string)
- raw `c_5_quintessence_hash` bytes (only display-byte-trail per 25.5)

Composition surfaces consume these via Graphiti protected handles / public-safe summaries / visual-state representations. The `enforceProtectedLocalBoundary()` check (already in `composition-coordinator.ts:204-227`) is extended (29.13) to reject any contributor declaring `'raw-quaternion' | 'raw-audio-octet' | 'plaintext-journal' | 'graphiti-episode-body' | 'raw-natal-chart'` on a geometric slot.

**Cross-coordinate state** (shared across all three slots via composition state spine):
- `activeSession`: session id (from `SharedBridgeAdapter.onCoordinateContext.sessionKey`)
- `dayNow`: `Idea/Empty/Present/{day_id}/` (from coordinate context)
- `kairos`: M4_Temporal_Now snapshot (post-19.12 Mercurius populator)
- `qPersonalHandle`: opaque handle (NEVER raw) consumed by all three slots
- `qComposedHandle`: opaque handle (NEVER raw) consumed by center + right slots
- `timeAxisMode`: `natal | real-time | kairotic` (from 25.17 switcher)
- `senseOverride`: `prospective | retrospective | auto` (from 11.12 tuning bar)

**Contemplation RPC integration (19.6 / 19.7):** at session close, `contemplate_session_close(ContemplationObject) → wisdom_delta` fires through the composition geometry as follows:
- **LLM-Nara reading (4')** surfaces in LEFT slot: agent inscription written into canvas via `khora_write_highlighted_inscription` with `recognition` highlight category (per 11.11). Visible as a gold highlight in the journal.
- **EBM evaluation (5')** surfaces in RIGHT slot: 72-dim resonance grid (26.1) renders the energy `E = ‖target_72 − predicted_72‖²`; three tritone-symmetric square overlays (A:(0,5), B:(1,4), C:(2,3)); WisdomDeltaInspector (26.13) visualises the wisdom_delta byte trail.
- **Verifier R-virtue witness (0')** surfaces in UNDER-LAYER Anuttara grounding: 9-bit witness vector displayed as nine lamps; unsatisfied constraints listed as symbolic-coordinate strings (per 1.11).

### What is composition contract from the load side

Per 15.4 verification ("composition-contract test asserts side-by-side widget contributions are rejected at composition load"):

- **Hard reject at load** (29.6) — `compositionLoad(contributors)` returns `Result<MountedComposition, JuxtapositionRejection>`. Any contributor whose `MExtensionContributionContract.compactViews` declares a `'side-by-side'` slot OR is `widget-only-no-claim` shape is rejected. Error names which contributor; surface refuses to mount.
- **Graceful degrade at runtime** (existing) — when a granted geometric slot's contributor reaches `blocked` readiness, render `integrated-empty-state.tsx` for that slot. Other slots continue rendering. Composition does not unmount.

## Tranches

### Tranche 29.1 — Composition slot taxonomy extension: `IntegratedGeometricSlot` enum + `GeometricCompositionCoordinator` *(spec-ahead-integration; DR-WC-IP-1 ratifying decision)*

Extend `Body/M/epi-theia/extensions/integrated-composition/src/common/layout-claim.ts` with a peer enum `IntegratedGeometricSlot = 'surface' | 'texture' | 'cell-state' | 'grounding' | 'left-composition' | 'center-composition' | 'right-composition' | 'composition-ambient' | 'composition-status'`. New `IntegratedGeometricClaim` shape (peer to `IntegratedLayoutClaim` widget-region) carrying `extensionId`, `geometricSlot`, `priority`, `handleClass: 'opaque-handle' | 'public-summary' | 'visual-state' | 'raw-quaternion' | 'raw-audio-octet' | 'plaintext-journal' | 'graphiti-episode-body' | 'raw-natal-chart' | 'k2-surface-handle' | 'cymatic-mount-point' | 'codon-rotation-export' | 'psychoid-renderer-handle' | 'recognition-surface' | 'r-virtue-witness'`, `privacyClass`, `reason`. New `GeometricCompositionCoordinator` peer class to existing `CompositionCoordinator` (does NOT replace; both coordinators run; widget-region arbitrates IDE pane layout; geometric arbitrates editor-area composition surface contract). New named geometric layouts: `COSMIC_ENGINE_GEOMETRIC_LAYOUT` ({surfaceOwner: 'm1-paramasiva-played-torus', textureOwner: 'm2-parashakti', cellStateOwner: 'm3-mahamaya', groundingOwner: 'm0-anuttara' | null}) and `JIVA_SIVA_GEOMETRIC_LAYOUT` ({leftCompOwner: 'm4-nara', centerCompOwner: 'm4-nara', rightCompOwner: 'm5-epii', groundingOwner: 'm0-anuttara', ambientOwners: ['m4-nara', 'chronos-relay'], statusOwners: ['m4-nara', 'm5-epii']}).

`GeometricCompositionCoordinator.resolveGeometricClaims(contributors)` arbitrates each slot per named-owner first (mirrors `composition-coordinator.ts::namedOwnerFor()` pattern), with conflict surfacing per existing `'blocked-conflict'` resolution. `GeometricCompositionCoordinator.enforceGeometricPrivacyBoundary(contributors)` rejects claims whose `handleClass` is in the raw-body set (`raw-quaternion`, `raw-audio-octet`, `plaintext-journal`, `graphiti-episode-body`, `raw-natal-chart`) when the layout is `jiva-siva.integrated`. Reads-only contract: any contributor claiming `texture` or `cell-state` MUST declare `handleClass` that is reads-only (`opaque-handle`, `public-summary`, `visual-state`, `cymatic-mount-point`, `codon-rotation-export`); raw write-back handles rejected.

Verification: `grep -nE 'IntegratedGeometricSlot|GeometricCompositionCoordinator|COSMIC_ENGINE_GEOMETRIC_LAYOUT|JIVA_SIVA_GEOMETRIC_LAYOUT' Body/M/epi-theia/extensions/integrated-composition/src/common/layout-claim.ts` returns the new symbols; `pnpm --filter @pratibimba/integrated-composition test`; new test `composition-coordinator.geometric.test.mjs` asserts (a) geometric-claim arbitration grants surface to m1-played-torus, texture to m2, cell-state to m3 under cosmic layout; (b) personal layout grants left+center to m4-nara, right to m5-epii; (c) raw-body handleClass on geometric slots is rejected with named provenance; (d) widget-region coordinator and geometric coordinator do not arbitrate each other's slots; cross-link 22.2 named owner authority.

### Tranche 29.2 — Cosmic 1-2-3 composition geometry: K²-surface + cymatic-texture + codon-cell-state composition *(spec-ahead-integration; DR-WC-IP-2 ratifying; CP-WC-IP-1/2/3 consumers)*

Extend `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx` body to mount the geometric composition geometry. New component `<CosmicEngineComposition />` replaces the three-pane render in `cosmic-engine-panes.tsx::CosmicEnginePanes` AS THE EDITOR AREA RENDER. `cosmic-engine-panes.tsx` panes are RETAINED but downgraded to mini-inspector mode per existing `miniInspectorOwners` (per `COSMIC_ENGINE_LAYOUT.miniInspectorOwners`).

`<CosmicEngineComposition />` mounts:
- `<K2PlayedTorusSurface />` — consumed via the `K2SurfaceHandle` exported from `m1-paramasiva-played-torus` per Track 22 §22.2. Composition declares an `IntegratedGeometricClaim` of `{geometricSlot: 'surface', handleClass: 'k2-surface-handle', extensionId: 'm1-paramasiva-played-torus'}`. The K² torus is full-bleed editor area; ananda vortex matrix families perspex cross-fade per 15.8 + 22.8; tick choreography slerp per 15.9.
- `<CymaticTextureMount surfaceHandle={k2}/>` — consumes the K² surface handle + reads cymatic frequencies from `m2-parashakti`'s `compositionMountPoint` (Track 23 §23.10) + Chladni standing-wave reference (`renderM2CymaticFrame` + `buildStandingWavePoints` from `m2-parashakti/src/common/meaning-packet.ts:187-271`). M2 texture renders ON the K² surface — composition mounts the texture-binding into the played-torus renderer engine per the reads-only contract. Reads `resonance72`, `planetaryChakral`, `kleinFlipState` from profile.
- `<CodonCellStateProjection surfaceHandle={k2}/>` — consumes the K² surface handle + reads codon-rotation from `m3-mahamaya`'s composition export (Track 24 §24.13). M3 codon-rotation projects onto lens-ring cells; reads-only. Renders cell-state without mutating M3 substrate.
- `<MathemeOverlay137 />` — the 137 visual matheme spine (29.8 lands its details).

`plugin-integrated-1-2-3-widget.tsx` renders `<CosmicEngineComposition />` as primary editor area; mini-inspectors (`M1WalkStrip`, `M2MeaningPacketCard`, `M3CodonProvenance`) render in mini-mode slots per existing arbitration. Subscription: ONE `useCompositionProfile()` hook call at the `<CosmicEngineComposition />` root; passed down via React context to all three mounts.

Declared blockers: `pending-k2-surface` (when 22.2 not landed), `pending-cymatic-mount-point` (when 23.10 not landed), `pending-codon-rotation-export` (when 24.13 not landed), `pending-ananda-vortex` (when 10.10 not landed). When any of the four are blocked, render `IntegratedEmptyState` per existing `integrated-empty-state.tsx` showing which contributor blocks composition; do not unmount the composition itself.

New file: `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-composition.tsx`. Test path: `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/tests/cosmic-engine-composition.test.mjs`. Cross-link 22.2 (played-torus scaffold), 23.10 (cymatic mount), 24.13 (codon export).

Verification: `test -f Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-composition.tsx`; `cd Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && pnpm build && pnpm test`; render test asserts ONE editor surface mounted (no three-pane juxtaposition); slot-presence test asserts `surface` slot occupied by m1-played-torus, `texture` by m2-parashakti, `cell-state` by m3-mahamaya; `grep -nE 'CosmicEngineComposition|K2PlayedTorusSurface|CymaticTextureMount|CodonCellStateProjection' Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/` returns the new symbols; blocker fallback test asserts `IntegratedEmptyState` renders when `pending-k2-surface` is present.

### Tranche 29.3 — Personal 4-5-0 composition geometry: Nara journal LEFT + personal cymatic CENTER + Mahamaya recognition RIGHT + Anuttara grounding UNDER *(spec-ahead-integration; DR-WC-IP-3 ratifying; CP-WC-IP-4/5/6 consumers)*

Extend `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx` body to mount the four-slot personal composition geometry. New component `<PersonalRecognitionComposition />` replaces the three-pane render in `jiva-siva-panes.tsx::JivaSivaPanes` AS THE EDITOR AREA RENDER. `jiva-siva-panes.tsx` panes are RETAINED but downgraded to mini-inspector mode per `JIVA_SIVA_LAYOUT.miniInspectorOwners`.

`<PersonalRecognitionComposition />` mounts:
- **LEFT slot** — `<NaraJournalLeftSlot />` mounts `Body/M/epi-theia/extensions/m4-nara/src/browser/canvas-editor.tsx` (from 11.10) wrapped with `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/ambient-state-strip.tsx` (above; from 11.12) and `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/tuning-bar.tsx` (below; from 11.12). Reads from `naraSurface.daySummary` per `SharedBridgeAdapter.onCoordinateContext`. Highlight categories per 11.11 (all 10 categories live); agent inscriptions render with their visual register.
- **CENTER slot** — `<PersonalCymaticCenterSlot />` mounts `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/personal-cymatic-field.tsx` (from 25.6). Hopf-linked tori at personal scale; dipyramid geometry per DR-IG-6 (apex P5/P5' + interleaved P1-P4/P1'-P4' + axis P0/P0'). Consumes `psychoid_cymatic` opaque renderer handle from `nara-surface.ts::ProtectedPersonalFieldInput` (post-5.5 minimum-viable solver). Reads-only on Q_composed opaque handle.
- **RIGHT slot** — `<MahamayaRecognitionRightSlot />` mounts `Body/M/epi-theia/extensions/m5-epii/src/browser/recognition-layer-widget.tsx` (from 26.11). Consumes M4 Q_composed opaque handle (from 25.6) AND M3 codon-rotation reads-only export (from 24.13) — M3 codon at personal scale via the alpha-quaternionic §6.7 `Q_composed = Q_identity · Q_transit · Q_activity ∈ S³`. 72-dim resonance grid (26.1) folded into the layer. Reads-only on M3 export.
- **UNDER-LAYER (grounding)** — `<AnuttaraGroundingPanel />` mounts a thin contemplative footer (~64px) consuming `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/` virtue-witness display (from Track 21). 9-bit witness vector rendered as nine lamps; one lamp per `VIRTUE_LUT[9]` entry; lamp on when `M0VerifierReport.virtue_witness_vector` bit is set (per 19.6 Verifier-side reading). When no Verifier report present, lamps are dim; not hidden.
- **COMPOSITION-AMBIENT (top chrome)** — `<CompositionAmbientRow />` renders `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/kairos-display.tsx` (from 25.15) + `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/mercurius-relay-indicator.tsx` (from 25.16) + `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/time-axis-switcher.tsx` (from 25.17) horizontally above the composition (32px tall).
- **COMPOSITION-STATUS** — privacy-class chrome border-tint (per 25.18) applied per slot; session-close ceremony pane (from 25.19) overlays when `m5.session.contemplation.complete` event fires.

Subscription: ONE `useCompositionProfile()` hook call at `<PersonalRecognitionComposition />` root; all six slot mounts consume the shared profile snapshot via React context. M4 protected-local privacy preserved: composition never carries raw quaternions or bodies — only opaque handles `qPersonalHandle`, `qComposedHandle`, `qIdentityHandle`, `qTransitHandle`, `qActivityHandle` per `nara-surface.ts::ProtectedPersonalFieldInput`. `enforceProtectedLocalBoundary()` (existing in `composition-coordinator.ts:204-227`) extended in 29.13 for geometric-slot enforcement.

Declared blockers: `pending-psychoid-cymatic-solver` (when 5.5 not landed), `pending-recognition-surface` (when 26.11 not landed), `pending-q-composed` (when 25.6 personal renderer not landed), `pending-virtue-witness` (when Track 21 grounding not landed), `pending-kairos-populator` (when 19.12 not landed). Composition continues mounted; blocked slot renders `IntegratedEmptyState`.

New file: `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.tsx`. Test path: `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/tests/personal-recognition-composition.test.mjs`. Cross-link 11.10 (canvas), 11.11 (highlight categories), 11.12 (ambient strip + tuning bar), 25.6 (psychoid renderer), 26.11 (recognition layer), Track 21 (Anuttara grounding).

Verification: `test -f Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.tsx`; `cd Body/M/epi-theia/extensions/plugin-integrated-4-5-0 && pnpm build && pnpm test`; render test asserts ONE editor surface with four geometric slots (no three-pane juxtaposition); protected-local invariant test asserts no raw quaternion / no raw body crosses; slot-presence test asserts left + center owned by m4-nara, right by m5-epii, grounding by m0-anuttara; `grep -nE 'PersonalRecognitionComposition|NaraJournalLeftSlot|PersonalCymaticCenterSlot|MahamayaRecognitionRightSlot|AnuttaraGroundingPanel' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/` returns the new symbols; consent-gate boundary test asserts deep actions remain consent-gated.

### Tranche 29.4 — Shared `ProfileTickSubscription` primitive: one subscription per composition *(spec-ahead-integration; DR-WC-IP-4 ratifying)*

New file `Body/M/epi-theia/extensions/integrated-composition/src/common/profile-tick-subscription.ts` exporting:

```ts
export interface CompositionProfileTickSubscription {
    readonly currentProfile: MathemeHarmonicProfileBoundary | null;
    readonly currentGeneration: number | null;
    readonly subscribe: (listener: (profile: MathemeHarmonicProfileBoundary) => void) => Disposable;
    readonly dispose: () => void;
}
export function openCompositionProfileSubscription(
    bridge: SharedBridgeAdapter
): CompositionProfileTickSubscription;
```

New file `Body/M/epi-theia/extensions/integrated-composition/src/browser/composition-profile-context.tsx` exporting:

```ts
export const CompositionProfileContext: React.Context<CompositionProfileTickSubscription | null>;
export const CompositionProfileProvider: React.FC<{ bridge: SharedBridgeAdapter; children: React.ReactNode }>;
export function useCompositionProfile(): { profile: MathemeHarmonicProfileBoundary | null; generation: number | null };
```

`<CompositionProfileProvider>` opens EXACTLY ONE subscription via `openCompositionProfileSubscription(bridge)` at mount; disposes on unmount. All three contributors consume via `useCompositionProfile()` hook — they MUST NOT call `bridge.onProfile()` directly. This is the single-clock invariant per 15-foundation principle 2.

Both `<CosmicEngineComposition />` (29.2) and `<PersonalRecognitionComposition />` (29.3) wrap their tree with `<CompositionProfileProvider bridge={bridge}>`. Existing per-pane render in `cosmic-engine-panes.tsx` + `jiva-siva-panes.tsx` is updated to consume the hook when running in mini-inspector mode (mini-inspectors inside a composition continue to consume the shared subscription).

Audit lint (29.4-companion): extend `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` with a check that grep returns no `bridge.onProfile` or `onProfileAdvance` calls in `Body/M/epi-theia/extensions/plugin-integrated-{1-2-3,4-5-0}/src/browser/` — direct subscription opens in plugin code are forbidden (lint fails the package build).

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/profile-tick-subscription.ts`; `test -f Body/M/epi-theia/extensions/integrated-composition/src/browser/composition-profile-context.tsx`; `pnpm --filter @pratibimba/integrated-composition test`; new test `composition-profile-context.test.mjs` asserts (a) opening the provider creates exactly one subscription; (b) two `useCompositionProfile()` consumers receive the same profile snapshot per render cycle; (c) unmount disposes the subscription; (d) lint scan against plugin src returns zero direct `bridge.onProfile` calls.

### Tranche 29.5 — Typed `IntegratedReadiness` envelope + kernel-bridge readiness ledger parity *(spec-ahead-integration; closes 11.8; consumes Track 10 readiness ledger)*

New file `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts` exporting:

```ts
export interface IntegratedReadiness {
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly overall: MExtensionReadinessState;
    readonly perPole: {
        readonly extensionId: MExtensionId;
        readonly readiness: MExtensionReadinessSnapshot;
    }[];
    readonly perGeometricSlot: {
        readonly geometricSlot: IntegratedGeometricSlot;
        readonly ownerId: MExtensionId | null;
        readonly fields: readonly {
            readonly field: string;
            readonly present: boolean;
            readonly blockerOwnerTrack: string;
        }[];
        readonly slotState: 'ready' | 'pending-field' | 'pending-contributor' | 'blocked';
    }[];
    readonly compositionBlockers: readonly {
        readonly id: string; // 'pending-k2-surface' | 'pending-cymatic-mount-point' | 'pending-codon-rotation-export' | 'pending-ananda-vortex' | 'pending-psychoid-cymatic-solver' | 'pending-recognition-surface' | 'pending-q-composed' | 'pending-virtue-witness' | 'pending-kairos-populator' | 'pending-klein-flip' | 'pending-resonance72' | 'pending-planetary-chakral' | 'pending-audio-octet' | 'pending-nodal-quartet'
        readonly ownerTrack: string;
        readonly humanReason: string;
    }[];
}
export function buildIntegratedReadiness(
    compositionId: IntegratedReadiness['compositionId'],
    contributors: readonly IntegratedContributorRecord[],
    profile: MathemeHarmonicProfileBoundary | null
): IntegratedReadiness;
```

`buildIntegratedReadiness()` folds existing `profile-field-checker.ts::buildPaneAvailability()` (cosmic) + `jiva-siva-fields.ts::buildJivaSivaPaneAvailability()` (personal) into the envelope per geometric slot. Each `compositionBlockers` id matches a kernel-bridge readiness-ledger pending-* marker; the `ownerTrack` field carries the exact track id (`Track 02 (M1 klein_flip)`, `Track 10.10 ananda_vortex`, `Track 22.2 played-torus`, etc.). Fixture parity test against `Body/M/epi-theia/extensions/kernel-bridge-readiness/` ledger output (per Tranche 10.1 closure) — every pending-* id used by composition MUST exist in the kernel-bridge ledger.

Plugin widgets consume the envelope: when `overall === 'blocked'`, render `IntegratedEmptyState` from composition `compositionBlockers`. When `overall === 'pending-*'` per slot, render the composition with the blocked slot showing `IntegratedEmptyState` for that slot only.

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts`; `pnpm --filter @pratibimba/integrated-composition test`; new fixture-parity test `integrated-readiness-ledger-parity.test.mjs` asserts every `compositionBlockers[].id` value is present in the kernel-bridge readiness ledger fixture; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test` + `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; new test asserts that toggling profile-field absence (e.g., `klein_flip` set to undefined) propagates to the matching `compositionBlockers[].id` within one render cycle; closes 11.8.

### Tranche 29.6 — Composition-load juxtaposition rejection: hard fail at load, graceful at runtime *(spec-ahead-integration; closes 15.4 verification; DR-WC-IP-5)*

New file `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-load.ts` exporting:

```ts
export type JuxtapositionRejectionReason =
    | 'contribution-declares-side-by-side-slot'
    | 'contribution-has-no-claim'
    | 'contribution-has-no-mini-mode-fallback-and-no-geometric-claim'
    | 'contribution-declares-raw-body-on-geometric-slot';
export interface JuxtapositionRejection {
    readonly compositionId: IntegratedReadiness['compositionId'];
    readonly rejections: readonly {
        readonly extensionId: MExtensionId;
        readonly reason: JuxtapositionRejectionReason;
        readonly humanReason: string;
    }[];
}
export interface MountedComposition {
    readonly compositionId: IntegratedReadiness['compositionId'];
    readonly grantedGeometricClaims: readonly ResolvedGeometricClaim[];
    readonly grantedWidgetClaims: readonly ResolvedLayoutClaim[];
    readonly readiness: IntegratedReadiness;
}
export type CompositionLoadResult =
    | { readonly ok: true; readonly mounted: MountedComposition }
    | { readonly ok: false; readonly rejection: JuxtapositionRejection };
export function compositionLoad(
    compositionId: IntegratedReadiness['compositionId'],
    contributors: readonly IntegratedContributorRecord[],
    profile: MathemeHarmonicProfileBoundary | null
): CompositionLoadResult;
```

`compositionLoad()` runs at composition-mount-time. It invokes both `GeometricCompositionCoordinator.resolveGeometricClaims()` (29.1) AND existing `CompositionCoordinator.resolveClaims()` (widget-region). It rejects:
- any contributor whose `MExtensionContributionContract.compactViews` declares a `slot: 'side-by-side'` — hard fail
- any contributor with no `IntegratedGeometricClaim` AND no widget-region claim AND no `miniModeFallback` — hard fail
- any contributor declaring raw-body `handleClass` on a geometric slot under `jiva-siva.integrated` layout — hard fail

When rejection fires, plugin widget renders a `<JuxtapositionRejectionView rejection={r} />` (new sibling to `integrated-empty-state.tsx`) showing which contributor and why. Composition does not mount; bridge remains attached; bridge-gate (existing `bridge-gate.ts`) is unaffected.

When load succeeds with degraded slots (a granted slot's contributor is blocked at runtime), composition mounts the granted slots and renders `IntegratedEmptyState` for the blocked ones (graceful degrade). Composition does not unmount on runtime blocker.

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/composition-load.ts`; `pnpm --filter @pratibimba/integrated-composition test`; new test `composition-load.test.mjs` asserts (a) `side-by-side` slot rejection at load with named contributor; (b) widget-only-no-claim rejection at load; (c) raw-body handleClass rejection at load on personal layout; (d) graceful runtime degrade when granted slot's profile field absent; closes 15.4 verification "composition-contract test asserts side-by-side widget contributions are rejected at composition load".

### Tranche 29.7 — Klein-flip three-pole composition choreography *(spec-ahead-integration; closes Track 07 §7.7 DR-IG-3; CP-WC-IP-8 consumer)*

New file `Body/M/epi-theia/extensions/integrated-composition/src/common/klein-flip-choreography.ts` exporting:

```ts
export interface CompositionChoreographyDirector {
    readonly start: (event: KleinFlipEvent) => void;
    readonly registerK2Handle: (handle: K2SurfaceHandle) => void;
    readonly registerCymaticMount: (mount: CymaticMountPoint) => void;
    readonly registerCodonRotation: (rotation: CodonRotationExport) => void;
    readonly dispose: () => void;
}
export function openChoreographyDirector(
    bridge: SharedBridgeAdapter
): CompositionChoreographyDirector;
```

`openChoreographyDirector()` subscribes to the shared `KleinFlipEvent` bus per Track 18 §18.2 (three variants exhaustively: `M1TritoneCrossing`, `M2ValenceInvert`, `M3CodonRotationCross`). When the event fires at tick 5→6:
- `K2SurfaceHandle.requestFold(durationMs: 200)` (M1 Hopf-fibre flag flip + K² fold per 15.9)
- `CymaticMountPoint.requestValenceInvert(durationMs: 200)` (M2 cymatic valence invert per Track 07 §7.7)
- `CodonRotationExport.requestAxisFlip(durationMs: 200)` (M3 codon-ring rotation-axis flip per DR-IG-3)

All three calls fire from ONE bus event; no local timer; 15.9 verification "no parallel animation timer competes" honoured. Emits composition observability events `composition.kleinflip.choreography.start` + `.end` consumed by OmniPanel Dispatch Trace per 15.11 (wired in 29.11).

Personal composition (4-5-0) has its own Klein-sense choreography (per DR-M4-2 clause 5 polarity 0=cosmic / 1=personal): when the 0/1 toggle fires (15.5 `cmd-period`), `<PersonalRecognitionComposition />` fades sense per the `senseOverride` tuning bar value (per 11.12). This is NOT the cosmic Klein-flip; it is the personal sense-toggle. The two are orthogonal; cosmic choreography fires on profile-bus event; personal sense-toggle fires on user input.

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/klein-flip-choreography.ts`; `pnpm --filter @pratibimba/integrated-composition test`; new test `klein-flip-choreography.test.mjs` asserts (a) synthetic `KleinFlipEvent` fires three handle-method calls; (b) all three calls fire within the same microtask; (c) `composition.kleinflip.choreography.start` event emitted within 1ms of bus event; (d) `composition.kleinflip.choreography.end` event emitted after 200ms; visual-regression baseline (cross-link 29.12) captures the three-pole simultaneous animation; closes Track 07 §7.7 DR-IG-3 composition wiring.

### Tranche 29.8 — 137 = 64 + 72 + 1 visual matheme overlay on cosmic composition *(spec-ahead-integration; closes Track 07 §7.2 visual contract; cross-link 19.8 + 19.9)*

New file `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/matheme-137-overlay.tsx` exporting `<Matheme137Overlay surfaceHandle={k2} />`. The overlay renders the Third Spanda Equation spine as labelled bridges on the cosmic composition surface (NOT on a separate pane — annotation layer on the K² torus surface itself):

- **64-side annotation** on M3 lens-ring (lower-half cells, ascending region of K² torus). Label: `64 = M3 codons`. Hover surfaces canonical-form `137 = 128 + 8 + 1` per Track 07 §7.2 canonical-form 3 (binary/QCD decomposition).
- **72-side annotation** on M2 cymatic surface (upper hemisphere, descending region). Label: `72 = M2 invariant`. Hover surfaces canonical-form `137 = 64 + 2(36) + 1` (Spanda-bridge form, doubled recognition-square).
- **+1 bridge** labelled `9_{M_2} = 8_{M_3} + 1_{M_1}` between 64-side and 72-side regions on the K² surface. Per Track 07 §7.2 DR-IG-7 translation rule. The M1 parent unit literally sits between them — rendered as a small golden bead at the equatorial seam of K² where 64-region meets 72-region.
- **7-8-9 spine triadic overlay** per 19.9: 7 = actional contraction (`8n − n`), 8 = octave-field/return, 9 = wholeness/epogdoon-extension. Three thin orbit-lines at over-cycle scale: 7 (innermost, gold-warm), 8 (middle, octave-field cyan), 9 (outermost, emerald-wholeness). Rendered as Bevy/wgpu mesh-overlay on the K² surface per 22.2 contract — composition issues the directive; played-torus renders.
- **Mersenne `127 = 2^7 - 1` annotation** in developer/proof mode only (toggled via OmniPanel Diagnostics or `cmd-shift-M`). When active, shows `127 = 2^7 - 1 = M_7` label below the 7-orbit; archetype-7 generator binding.
- **`Additive137` skeleton event consumer** — when the profile's skeleton event says `Additive137` (per Track 07 §7.2 verification), the `64 + 72 + 1 = 137` equation pulse-animates on the surface for 400ms; consume from profile-bus, not local trigger.
- **`KaprekarPedagogyHit` consumer** — when the event fires (per 19.8 enum addition `AnandaSkeletonEvent::KaprekarPedagogyHit = 6`), a small Kaprekar 6174 inspector chip appears at composition status row briefly (3s) linking to the LEAN pedagogy seed `Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md`. Cross-link 22.7 Kaprekar 6174 inspector (standalone).

Render-test asserts `parentAttribution === 'M1-5'` per Track 07 §7.2 (`+1` parent attribution rendered as `M1-5`, NOT `M0-Anuttara-witness`).

Verification: `test -f Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/matheme-137-overlay.tsx`; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; new test `matheme-137-overlay.test.mjs` asserts (a) the four canonical-form strings render on hover; (b) `parentAttribution === 'M1-5'`; (c) `9_{M_2} = 8_{M_3} + 1_{M_1}` bridge label present; (d) 7-8-9 spine orbits render when profile `m1_2_skeleton_events_fired` includes `Additive137`; (e) Mersenne annotation hidden by default, visible in proof mode; (f) `KaprekarPedagogyHit` consumer fires the chip; `grep -rn "matheme-137-overlay\|9_M2 = 8_M3 + 1_M1\|parentAttribution\|Additive137\|KaprekarPedagogyHit" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/` returns the symbolic-skeleton wiring (overlay strings, not local computation); closes Track 07 §7.2 composition wiring.

### Tranche 29.9 — Contemplation RPC flow: LLM/EBM/Verifier across 4-5-0 slots *(spec-ahead-integration; closes 19.6 / 19.7 composition path; cross-link 26.13)*

Extend `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.tsx` (29.3) to wire `contemplate_session_close(ContemplationObject) → wisdom_delta` from Track 19.6 across the four geometric slots. New companion file `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/contemplation-flow-director.tsx` exporting `<ContemplationFlowDirector />`.

`<ContemplationFlowDirector />` subscribes to the `m5.session.contemplation.complete` observability event (fired by gateway per Track 19.7 when `m5_execute_mobius_return` calls `contemplate_session_close()`). On event:

- **LLM-Nara reading (4'/LEFT slot)** — composition invokes `khora_write_highlighted_inscription` (per Track 19.11) with `category: 'recognition'` (per 11.11 — gold `#d4a574` highlight) into the canvas-editor. The inscription text is the LLM-composed reading of the session's bioquaternion trajectory; renders inline in the journal at the session-end position. Author chip: `Pi → Nara`.
- **EBM evaluation (5'/RIGHT slot)** — composition mounts `<WisdomDeltaInspector />` from 26.13 over the recognition layer. Shows: (a) wisdom_delta byte trail rendered as a 16-byte tape with XOR animation showing how the bytes fold into `quintessence_hash`; (b) 72-dim resonance grid (26.1) with predicted-vs-target overlay; (c) energy readout `E = ‖target_72 − predicted_72‖²`; (d) three tritone-symmetric square coherence-scores ((0,5), (1,4), (2,3)) per 26.1; (e) Möbius descent step `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E` as a quaternion arrow over S³ shadow. Reads-only; consumes `wisdom_delta` from gateway envelope.
- **Verifier R-virtue witness (0'/UNDER-LAYER)** — composition updates `<AnuttaraGroundingPanel />` (29.3) with the live `M0VerifierReport`: (a) 9-bit `virtue_witness_vector` (per Tranche 1.10) renders as nine lamps that animate from dim to bright; (b) `unsatisfied_constraints` listed as symbolic-coordinate strings (per Tranche 1.11) below the lamps; (c) coherence score numeric readout. Each Verifier-emitted symbolic-coordinate string (e.g., `#R0-0/1/A-T7-pending?`) is click-routable through the `anuttara-symbolic-parse` skill (per Tranche 5.21) — composition routes via `SharedBridgeAdapter.invokeGatewayRpc('anuttara-symbolic-parse', {expression})` and surfaces the LLM response inline in the journal.

Three further questions surface during contemplation:
- **Gauge-trio coverage** (M3 COMP/MOVE/RES = Pauli σ_x, σ_y, σ_z) — rendered as three small bars on the RIGHT slot above WisdomDeltaInspector; each bar fills to the coverage fraction. EBM-side answer.
- **4-charge invariant `pp + mm + mp + pm = 4·outer`** — rendered as a small balance scale icon on the UNDER-LAYER grounding; left/right pans show the four charges; balance state reads from `M0VerifierReport.virtue_witness_vector` Parameśvara bit. Verifier-side answer.
- **Tarot psyche-anchor coherence** — rendered as a small ribbon at top of LEFT slot showing which session-open cards (per Track 19.4) corresponded to codons in the trajectory; consume from contemplation envelope. LLM-side reading.

Composition emits `composition.contemplation.complete` observability event when all three slot updates land — consumed by OmniPanel Dispatch Trace per 15.11 (29.11).

Verification: `test -f Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/contemplation-flow-director.tsx`; `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; new test `contemplation-flow-director.test.mjs` asserts (a) synthetic `m5.session.contemplation.complete` event triggers canvas inscription with `recognition` category; (b) WisdomDeltaInspector mounts on right slot with wisdom_delta byte trail; (c) virtue lamps animate from dim to lit per 9-bit vector; (d) symbolic-coordinate strings render as clickable chips; (e) gauge-trio bars fill per coverage; (f) `composition.contemplation.complete` event emitted; integration test against synthetic ContemplationObject produces full slot-update sequence; cross-link 19.6 RPC + 19.7 close-path + 26.13 WisdomDeltaInspector + 11.11 highlight categories.

### Tranche 29.10 — Composition-state persistence + cross-layout state preservation *(spec-ahead-integration; closes 15.7 composition-extension)*

Extend `Body/M/epi-theia/extensions/integrated-composition/src/common/workspace-persistence.ts` with the composition-state shape:

```ts
export interface IntegratedCompositionPersistedState {
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    // Cosmic state
    readonly pinnedMatrixFamily: number | null; // Ananda_Matrix_Op 0..5
    readonly selectedLensCell: { readonly lensId: string; readonly cellIndex: number } | null;
    readonly activeCodonCell: number | null; // u8 0..63
    readonly k2OrientationQ: readonly [number, number, number, number] | null;
    readonly mathemeProofModeEnabled: boolean;
    // Personal state
    readonly timeAxisMode: 'natal' | 'real-time' | 'kairotic' | null;
    readonly senseOverride: 'prospective' | 'retrospective' | 'auto' | null;
    readonly qComposedSnapshotId: string | null; // opaque handle id, NEVER raw
    readonly recognitionLayerView: 'codon' | 'resonance72' | 'wisdom-delta' | null;
    readonly anuttaraGroundingExpanded: boolean;
    // Cross
    readonly miniInspectorActiveIds: readonly MExtensionId[];
}
export function persistCompositionState(state: IntegratedCompositionPersistedState): Promise<void>;
export function readCompositionState(
    compositionId: IntegratedCompositionPersistedState['compositionId']
): Promise<IntegratedCompositionPersistedState | null>;
```

Persistence path: `~/.epi-logos/composition/{compositionId}.json` (existing workspace-persistence pattern). Survives:
- `daily-0-1` ↔ `ide-deep` layout toggle (per 15.7)
- cosmic ↔ personal 0/1 toggle (per 15.5 `cmd-period`)
- session restart / Theia reload
- profile generation advance

State spine is `BimbaPratibimbaUiState` extension per 15.7 `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` plus the composition-specific fields above. The DI singleton at `layout-types.ts:7-12` owns the cross-layout core; `IntegratedCompositionPersistedState` is the composition-specific extension consumed via React context.

Extend `acceptance-harness/tests/topology.test.mjs` (per 11.6) with a new sub-test `composition-state-identity` asserting every named field survives both toggle classes.

Verification: `pnpm --filter @pratibimba/integrated-composition test`; new test `composition-state-persistence.test.mjs` asserts (a) round-trip persistence of all 12 fields; (b) state survives `daily-0-1` ↔ `ide-deep` toggle; (c) state survives cosmic ↔ personal 0/1 toggle; (d) `qComposedSnapshotId` is always opaque handle (never raw bytes — privacy invariant); (e) restart re-reads state correctly; `pnpm --filter @pratibimba/acceptance-harness test`; cross-link 11.6 + 15.7 + 25.6 (personal cymatic state) + 26.1 (EBM state).

### Tranche 29.11 — Composition observability event vocabulary + OmniPanel Dispatch Trace wiring *(spec-ahead-integration; closes OW-WC-IP-1; cross-link 15.11)*

New file `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-events.ts` exporting the composition event vocabulary:

```ts
export const COMPOSITION_EVENT_TYPES = [
    'composition.mount',
    'composition.unmount',
    'composition.kleinflip.choreography.start',
    'composition.kleinflip.choreography.end',
    'composition.mobius-return.composed',
    'composition.matrix-family.pin',
    'composition.codon-cell.select',
    'composition.lens-cell.select',
    'composition.sense.toggle',
    'composition.time-axis.switch',
    'composition.contemplation.complete',
    'composition.juxtaposition.rejected',
    'composition.slot.blocked',
    'composition.slot.recovered'
] as const;
export type CompositionEventType = typeof COMPOSITION_EVENT_TYPES[number];
export interface CompositionEvent {
    readonly type: CompositionEventType;
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly timestamp: string;
    readonly profileGeneration: number | null;
    readonly payload: Readonly<Record<string, unknown>>;
}
export function emitCompositionEvent(
    bridge: SharedBridgeAdapter,
    event: CompositionEvent
): void;
```

OmniPanel Dispatch Trace tab (per 15.11) extends its event consumer to recognise `composition.*` events; renders them as a sub-tree under their parent Pi/Anima/subagent invocation when there's a parent dispatch context, or as a root-level composition timeline when standalone. Click-through from Dispatch Trace → Evidence opens the composition snapshot at that event's profile generation; click-through to source opens the contributing slot's source via `epi-logos://ide/<extension>/<view>` route.

Both compositions emit on relevant state changes:
- `<CosmicEngineComposition />` emits `composition.mount` on first render, `composition.unmount` on unmount, `composition.kleinflip.choreography.{start,end}` from 29.7, `composition.matrix-family.pin` when 22.8 vortex matrices browser fires `m1.vortex.family_pinned`, `composition.codon-cell.select` on lens-ring cell click, `composition.lens-cell.select` on M2 axis selection, `composition.mobius-return.composed` on tick 11→0.
- `<PersonalRecognitionComposition />` emits `composition.mount`, `composition.unmount`, `composition.sense.toggle` from 11.12 tuning bar, `composition.time-axis.switch` from 25.17 switcher, `composition.contemplation.complete` from 29.9.
- Both compositions emit `composition.juxtaposition.rejected` from 29.6 on load failure, `composition.slot.blocked` when a slot blocker enters from runtime, `composition.slot.recovered` when blocker resolves.

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/composition-events.ts`; `pnpm --filter @pratibimba/integrated-composition test`; new test `composition-events.test.mjs` asserts (a) all 14 event types are emitted under their named conditions; (b) OmniPanel Dispatch Trace consumes the events and renders them; (c) click-through from event → Evidence opens snapshot; cross-link 15.11 dispatch genealogy.

### Tranche 29.12 — Visual-regression fixtures for both compositions *(spec-ahead-integration; closes OW-WC-IP-2; cross-link 15.12)*

Extend `Body/M/epi-theia/extensions/acceptance-harness/fixtures/visual-regression/` with two new fixture directories:

- `integrated-1-2-3/`
  - `mount.png` — cosmic composition initial mount with default profile
  - `kleinflip-tick-5-to-6-{frame-0,1,2,3,4,5,6}.png` — six frames of the Klein-flip three-pole choreography (29.7); fold + valence-invert + axis-flip all in sync
  - `matrix-pin-family-{0,1,2,3,4,5}.png` — six baselines, one per Ananda_Matrix_Op family pinned (per 22.8)
  - `codon-cell-select-{0,16,32,48,63}.png` — five baselines for lens-ring cell selection at distinct codon positions
  - `mobius-return.png` — composition at tick 11→0 Möbius return (composed wisdom_delta visible)
  - `matheme-137-overlay-default.png` and `matheme-137-overlay-proof-mode.png` — the 137 spine in default vs proof mode (29.8)
- `integrated-4-5-0/`
  - `mount.png` — personal composition initial mount
  - `contemplation-complete.png` — post-`m5.session.contemplation.complete` state with all three slot updates landed (29.9)
  - `sense-toggle-{prospective,retrospective}.png` — two baselines for sense-override
  - `time-axis-switch-{natal,real-time,kairotic}.png` — three baselines for the three modes (25.17)
  - `recognition-layer-update.png` — right slot post recognition update
  - `klein-sense-fade.png` — personal sense polarity fade (DR-M4-2 clause 5)
  - `virtue-witness-lit-{0,1,9}.png` — three baselines for 0-lit, 1-lit, 9-lit virtue witness vector states

Frame-by-frame baselines committed under `Body/M/epi-theia/extensions/acceptance-harness/fixtures/visual-regression/integrated-{1-2-3,4-5-0}/`. Diff threshold documented in `acceptance-harness/README.md`. Cross-link Tranches 22.13 (M1 visual-regression scope), 23.16 (M2), 24.16 (M3), 25.20 (M4), 26.16 (M5), 15.12 (visual-regression harness owner).

Verification: `pnpm --filter @pratibimba/acceptance-harness test:visual`; baselines committed; `test -d Body/M/epi-theia/extensions/acceptance-harness/fixtures/visual-regression/integrated-1-2-3 && test -d Body/M/epi-theia/extensions/acceptance-harness/fixtures/visual-regression/integrated-4-5-0`; diff threshold honoured; closes 15.12 cross-link for the two integrated-composition scopes.

### Tranche 29.13 — M4 protected-local boundary enforcement extended to geometric slots *(spec-ahead-integration; closes IP-15 + DR-M4-3 geometric enforcement)*

Extend `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-coordinator.ts::enforceProtectedLocalBoundary()` to operate on `IntegratedGeometricClaim`s in addition to widget-region claims. The extended check rejects:

```ts
const FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC = [
    'raw-quaternion',      // q_personal, q_identity, q_transit, q_activity, q_composed RAW
    'raw-audio-octet',     // M4 audio-octet body
    'plaintext-journal',   // NOW.md / daily-note.md text body
    'graphiti-episode-body', // Graphiti episode content
    'raw-natal-chart'      // Kerykeion natal-chart JSON body
] as const;
```

Under `jiva-siva.integrated` layout, ANY contributor declaring an `IntegratedGeometricClaim` with `handleClass` in `FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC` on any of the six personal geometric slots (`left-composition`, `center-composition`, `right-composition`, `grounding`, `composition-ambient`, `composition-status`) is rejected at composition-load with reason `'contribution-declares-raw-body-on-geometric-slot'` (per 29.6 `JuxtapositionRejectionReason`). Rejected at hard-fail.

The allow-list is `'opaque-handle' | 'public-summary' | 'visual-state' | 'psychoid-renderer-handle' | 'recognition-surface' | 'r-virtue-witness' | 'cymatic-mount-point' | 'codon-rotation-export'`. The renderer-handle types (`psychoid-renderer-handle`, `k2-surface-handle`, etc.) are opaque-by-construction — they expose only render-directives, not raw data.

Cross-link 8.1 (privacy-first composition contract) — DR-M4-3 ratifying decision; 29.13 enforces it at the geometric-slot layer.

Verification: `pnpm --filter @pratibimba/integrated-composition test`; new test `enforce-protected-local-geometric.test.mjs` asserts each of the five forbidden `handleClass` values is rejected when declared on each of the six personal geometric slots — 30 rejection cases total — each with the named-provenance error string; allow-list test asserts the 8 allowed `handleClass` values pass through; integration test through `compositionLoad()` confirms the rejection rejects the whole composition mount.

### Tranche 29.14 — Composition deep-link routes + cross-layout intent integration *(spec-ahead-integration; closes OW-WC-IP-3; cross-link 11.2 / TS-11)*

Extend `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-deep-links.ts` with two composition routes:

```ts
export const COMPOSITION_ROUTES = {
    cosmicComposition: 'epi-logos://ide/integrated-1-2-3/cosmic-composition',
    personalComposition: 'epi-logos://ide/integrated-4-5-0/personal-composition'
} as const;
export interface CompositionIntent {
    readonly route: typeof COMPOSITION_ROUTES[keyof typeof COMPOSITION_ROUTES];
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly stateHints: Partial<IntegratedCompositionPersistedState>;
}
export function buildCompositionIntent(
    compositionId: CompositionIntent['compositionId'],
    stateHints: Partial<IntegratedCompositionPersistedState>
): CompositionIntent;
export function dispatchCompositionIntent(
    bridge: SharedBridgeAdapter,
    intent: CompositionIntent
): Promise<void>;
```

Each composition route carries a `CrossLayoutIntent` envelope (per Wave-B TS-11 `omnipanel-types.ts:L86-97`) with:
- `requestedExtensionId: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0'`
- `requestedContributionId: 'cosmic-composition' | 'personal-composition'`
- `requestedLayout: 'daily-0-1'` (composition always renders in `daily-0-1` per DR-TS-1)
- composition-state hints (`pinnedMatrixFamily`, `selectedLensCell`, `activeCodonCell` for cosmic; `timeAxisMode`, `senseOverride`, `qComposedSnapshotId` for personal)

OmniPanel Pi Chat (per 15.2) emits composition intents when user asks "show me the cosmic composition with matrix family 3 pinned" or similar; the cross-layout intent dispatcher (per 11.2) routes the intent; the composition mounts with the hinted state pre-loaded from persistence.

Wave-C deep links (e.g., from `m1-paramasiva.openWalkAt(tick=5, family=3)` in 22.1, `m3-mahamaya.openCodon(0x2A)` in 24.X) compose by emitting composition intents instead of standalone widget routes — the integrated surface is the canonical home; standalone is the deep view.

Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-deep-links.ts`; `grep -n "cosmicComposition\|personalComposition\|COMPOSITION_ROUTES\|CompositionIntent" Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-deep-links.ts` returns the new symbols; acceptance-harness intent-routing test traverses both routes; new test `composition-intent.test.mjs` asserts (a) intent dispatch routes to the correct composition widget; (b) state hints pre-load the composition's persisted state; (c) intent emitted from Pi Chat surfaces in OmniPanel Dispatch Trace per 15.11.

### Tranche 29.15 — Pentadic runtime trace overlay across 1-2-3 and 4-5-0 *(spec-ahead-integration; consumes 10.P5 + Track 36.4-36.6)*

Extend the shared `integrated-composition` substrate with a typed overlay/readiness channel for `AnuttaraPentadicRuntimeTrace`.

Common-side substrate:

```ts
export interface IntegratedPentadicTraceOverlay {
    readonly trace: AnuttaraPentadicRuntimeTrace;
    readonly generation: number;
    readonly readiness: IntegratedReadinessAggregate;
    readonly cosmicSlots: {
        readonly tickSurface: 'm1-paramasiva-played-torus';
        readonly frequencyTexture: 'm2-parashakti';
        readonly codonCellState: 'm3-mahamaya';
    };
    readonly personalSlots: {
        readonly grounding: 'm0-anuttara';
        readonly qHandleConsumer: 'm4-nara';
        readonly recognitionConsumer: 'm5-epii';
    };
}
```

- **Files to extend:**
  - `Body/M/epi-theia/extensions/integrated-composition/src/common/profile-tick-subscription.ts` — include the trace in the single profile-tick envelope.
  - `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts` — add trace pending/blocker aggregation.
  - `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-composition.tsx` — render the 0/1 marker, 5-degree quantum, 72-index, 64-address, and codon as one live overlay.
  - `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.tsx` — pass trace handles into M4/M5 slots and show M0 grounding witness.
  - `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-events.ts` — emit `composition.pentadic_trace.advance` when the trace generation changes.

- **Cosmic rules:** M1, M2, and M3 must read the same trace generation. The overlay fails readiness if K2 tick, M2 resonance72, and M3 codon cell disagree with the trace payload. No renderer-local 72->64 conversion.

- **Personal rules:** M4 receives `qComposedHandle` and public-safe trace addresses only. M5 receives the feature-family id `anuttara_pentadic_runtime_trace` plus `learnedPredictorCheckpointRef`. M0 grounding receives the 0/1 substrate marker and R-virtue witness state. No raw quaternion/model feature body crosses the bus.

Verification: `pnpm --filter @pratibimba/integrated-composition test`; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; tests assert a single profile subscription, trace-generation equality across cosmic slots, protected-local rejection on personal raw bodies, `composition.pentadic_trace.advance` emission, and no production local derivation of 72->64 / 24x15 / 360+24.

### Tranche 29.16 — Inhabited Bimba live entity field overlay *(spec-ahead-integration; consumes CCT-21 + 10.PASU + 18.10 + 25.22)*

Extend the integrated composition substrate so the Bimba map can be literally inhabited by live `PasuBeingPatternProjection` entities without making live state canonical. CCT-21 owns the S3 producer stream; this tranche owns composition subscription, rendering, privacy enforcement, and readiness over that stream.

Common-side substrate:

```ts
export interface InhabitedBimbaEntityState {
    readonly entityRef: BeingEntityRef;
    readonly stableIdentity: CanonicalIdentityHandle;
    readonly liveState: LiveStateHandle;
    readonly clockAddress: BeingPatternClockAddress;
    readonly monopolyOperator: MonoPolyOperator;
    readonly perspectiveRole: PerspectiveRole;
    readonly naraFamilyRole?: NaraFamilyRole;
    readonly elementalWeights: ElementalWeightProjection;
    readonly relationEdges: readonly BeingPatternRelationEdge[];
    readonly reviewRisk: 'none' | 'forced-unification' | 'privacy-boundary' | 'canon-candidate';
}
```

Files to extend:
- `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-events.ts` — add `composition.being_pattern.observed`, `composition.being_pattern.projected`, `composition.being_pattern.relation_edge`, `composition.being_pattern.review_candidate`.
- `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts` — add blockers for `pending-pasu-being-pattern`, `pending-spacetime-live-state`, `pending-monopoly-operator`, `pending-perspective-role`.
- `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-composition.tsx` — render public-safe entity markers in the 3D Earth-centred solar/clock field, using backend-supplied `m2M3Relation` edges for planetary/lens aspects.
- `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.tsx` — pass the current entity's `PasuBeingPatternProjection` to M4's `M4BeingPatternPerspectiveCard` (25.22) and M5's recognition layer.
- `Body/M/epi-theia/extensions/integrated-composition/src/common/graphiti-source-guard.ts` — ensure Graphiti episode refs remain protected handles when used as live-state provenance.

Stream law:
- S2/Neo4j is the canonical identity/ontology graph. Composition reads graph anchors but never writes graph canon.
- S3/SpaceTimeDB carries live presence and current entity state via CCT-21. Composition subscribes through `s3'.being_pattern.subscribe`, consumes the current generation carried by 18.10, and drops stale generations.
- Graphiti carries protected episodic provenance. Composition can show handles and public-safe summaries only.
- Redis/Psyche, DAY, and NOW carry runtime temporal state. Composition must serialize handles, not construct temporal keys locally.
- M5/Epii + M0 verifier are the only promotion path from live pattern candidate to canon.

Visual law:
- Cosmic composition renders the many as many: public-safe `Poly` and `ActuallyMany` entities may co-exist around the clock field without clustering into one symbolic object.
- `PotentiallyOne` may render as a suggested shared contour; `ActualisingOne` renders as a warning/review candidate; `MonoPoly` renders as a held many-in-one only when verified.
- Personal composition renders perspective explicitly: I, You, You-and-I, They, We, We-I. Optional Nara family overlay is visual context, not identity assignment.
- Earth remains the observer-centre for the solar/clock projection. The 9-orbiter visual derives from Earth-centred M2 projection while respecting the canonical M2 LUT.

Verification: `pnpm --filter @pratibimba/integrated-composition test`; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; CCT-21 replay fixture asserts `EntityObserved -> BeingPatternProjected -> PerspectiveRoleResolved -> MonoPolyOperatorResolved -> ClockAddressUpdated -> AspectEdgeComputed -> ElementalResonanceChanged -> PatternPacketFormed -> ReviewCandidateEmitted`; protected-local test asserts Graphiti bodies and raw quaternions never cross; canon-boundary test asserts no S2 mutation from composition; visual fixture covers `Mono`, `Poly`, `ActualisingOne`, and `MonoPoly` states.

## Cross-Track Cross-References (summary)

| Tranche | Cross-links to |
|---|---|
| 29.1 | 07 (cosmic readiness), 08 (personal readiness), 11.8 (integrated readiness gate), 15.4 (composition pattern), 22.2 (played-torus named owner), 23.10 (cymatic mount), 24.13 (codon export), 25.6 (psychoid renderer), 26.11 (recognition layer), 21 (Anuttara grounding) |
| 29.2 | 22.2 (K² surface), 23.10 (cymatic texture mount), 24.13 (codon-rotation export), 10.10 (ananda_vortex profile field), 15.8 (ananda K² visual), 15.9 (slerp), 22.8 (vortex matrices browser pin event) |
| 29.3 | 11.10 (canvas-editor), 11.11 (highlight categories), 11.12 (ambient strip + tuning bar), 25.6 (personal cymatic renderer), 26.11 (recognition layer), 21 (Anuttara grounding), 25.15 (kairos display), 25.16 (mercurius indicator), 25.17 (time-axis switcher), 25.18 (privacy chrome), 25.19 (session-close ceremony), DR-IG-6 (dipyramid geometry), DR-M4-3 (privacy boundary), 8.7 (dipyramid renderer) |
| 29.4 | 15.6 (profile-tick clock), 15-foundation principle 2, 22.2 (played-torus tick subscription), 25.6 (personal cymatic tick subscription), 26.1 (EBM tick subscription) |
| 29.5 | 10.1 (kernel-bridge readiness ledger), 11.8 (integrated readiness gate), 7.1 (cosmic readiness pending markers), 8.1 (personal readiness pending markers), 22.2 (played-torus blockers), 23.10 (cymatic blockers), 24.13 (codon blockers), 25.6 (psychoid blockers), 26.11 (recognition blockers), 19.12 (kairos populator) |
| 29.6 | 15.4 (composition pattern verification), 08-t0 composition contract preflight, 29.1 (geometric slots) |
| 29.7 | 07.7 (M3 codon-ring axis flip), 18.2 (shared KleinFlipEvent), 15.9 (tick choreography), DR-IG-3 (M3 axis flip ratification), 22.2 (K² fold), 23.X (M2 valence invert), 24.X (M3 axis flip) |
| 29.8 | 07.2 (137 composition assertion), 19.8 (Kaprekar LEAN seed), 19.9 (7-8-9 spine + Mersenne), M3-ARCHITECTURE (canonical-five-forms), DR-IG-7 (translation rule), 22.7 (Kaprekar 6174 inspector), 22.6 (Mersenne 137 additive proof overlay) |
| 29.9 | 19.6 (contemplation RPC), 19.7 (close-path wire), 19.9 (7-8-9 spine contemplation), 19.11 (khora_write_highlighted_inscription), 11.10 (canvas-editor), 11.11 (recognition highlight category), 26.1 (72-dim resonance grid), 26.13 (WisdomDeltaInspector), 26.14 (PiAxiomTranslationInspector), 1.10 (M0 Verifier module), 1.11 (symbolic-coordinate EBNF), 5.21 (anuttara-symbolic-parse skill), 19.4 (tarot psyche-anchor), 19.5 (m3_major_arcana_from_codon), 8.3 (recursive-self-review gate) |
| 29.10 | 15.7 (BimbaPratibimbaUiState), 11.6 (state-identity acceptance), 15.5 (lemniscate toggle), 25.6 (personal cymatic state), 26.1 (EBM state), 25.17 (time-axis mode), 11.12 (sense override) |
| 29.11 | 15.11 (dispatch genealogy), 15.2 (OmniPanel), 22.8 (vortex pin event), 11.12 (tuning bar state changes), 25.17 (time-axis switcher) |
| 29.12 | 15.12 (visual-regression harness), 22.13 (M1 visual-regression), 23.16 (M2), 24.16 (M3), 25.20 (M4), 26.16 (M5) |
| 29.13 | 08.1 (privacy-first composition contract), DR-M4-3 (no raw bodies cross), DR-M4-2 (polarity 0=cosmic / 1=personal), 25.18 (privacy chrome) |
| 29.14 | 11.2 (cross-layout intent routing), TS-11 (CrossLayoutIntent envelope), 15.2 (OmniPanel Pi Chat), DR-TS-1 (composition in daily-0-1), 22.1 (Spanda walk navigator deep link), 24.X (M3 codon deep link) |
| 29.15 | 10.P5 (AnuttaraPentadicRuntimeTrace), 21 (M0 grounding), 22 (M1 K2 tick surface), 23 (M2 resonance texture), 24.18 (M3 pentadic inspector), 25 (M4 protected Q handles), 26 (M5 EBM recognition), 36.4-36.6 |
| 29.16 | CCT-21 (S3 BeingPattern live-state producer stream), 10.PASU (PasuBeingPatternProjection), 18.10 (typed PASU JSON edge), 25.22 (M4 perspective/family consumer), M0-3-8 (MonoPoly), M0-4.4.0-(4.4/5) (personhood grammar), S2 Neo4j graph anchors, S3 SpaceTimeDB live state, Graphiti protected provenance, Redis/NOW/DAY temporal handles, 26 (M5 review/EBM recognition) |

## Anti-Greenfield Posture

Every Track 29 tranche either:

- **Extends** landed `integrated-composition` substrate — 29.1 extends `layout-claim.ts`, 29.4 adds `profile-tick-subscription.ts`, 29.5 adds `integrated-readiness.ts`, 29.6 adds `composition-load.ts`, 29.7 adds `klein-flip-choreography.ts`, 29.10 extends `workspace-persistence.ts`, 29.11 adds `composition-events.ts`, 29.13 extends `composition-coordinator.ts::enforceProtectedLocalBoundary()`, 29.14 extends `integrated-deep-links.ts`, 29.15 extends `profile-tick-subscription.ts`, `integrated-readiness.ts`, and `composition-events.ts` for the pentadic trace overlay, and 29.16 extends `composition-events.ts`, `integrated-readiness.ts`, and `graphiti-source-guard.ts` for the inhabited Bimba live entity field.
- **Extends** landed `plugin-integrated-1-2-3` widget body — 29.2 adds `cosmic-engine-composition.tsx`, 29.8 adds `matheme-137-overlay.tsx`, 29.15 overlays the pentadic trace on the same composition surface, and 29.16 adds public-safe live entity markers to the Earth-centred clock/solar field. Existing `cosmic-engine-panes.tsx` retained for mini-inspector mode.
- **Extends** landed `plugin-integrated-4-5-0` widget body — 29.3 adds `personal-recognition-composition.tsx`, 29.9 adds `contemplation-flow-director.tsx`, 29.15 passes pentadic trace handles into M4/M5 recognition and M0 grounding, and 29.16 passes `PasuBeingPatternProjection` into the M4 perspective/family card and M5 review layer. Existing `jiva-siva-panes.tsx` and `epii-review-panel.tsx` retained for mini-inspector mode.
- **Consumes** named M' product surface owners — the `m1-paramasiva-played-torus` extension owns the K² surface (DR-M1-2 / 22.2), the `m2-parashakti` extension owns the cymatic mount (23.10), the `m3-mahamaya` extension owns the codon-rotation export (24.13), the `m4-nara` extension owns the canvas (11.10) + ambient strip (11.12) + tuning bar (11.12) + personal cymatic (25.6) + kairos display (25.15) + Mercurius indicator (25.16) + time-axis switcher (25.17) + session-close ceremony (25.19), the `m5-epii` extension owns the recognition layer (26.11) + WisdomDeltaInspector (26.13), the `m0-anuttara` extension owns the virtue witness grounding (Track 21 + 19.6 Verifier).
- **Extends** landed `acceptance-harness` — 29.12 extends visual-regression fixtures.

No greenfield extension. No competing composition coordinator (29.1 adds a peer for geometric slots — the existing widget-region coordinator continues to govern IDE pane layout). No bypass of `SharedBridgeAdapter`. No direct reach into `Body/S/S0`, `portal-core`, `nara_journal.rs`, `medicine.rs`, `oracle.rs`, `personal_identity.rs`, `m5.c`, or any kernel module — `forbiddenImports` per 08-t0 composition contract preflight is enforced at the composition substrate layer.

The composition becomes what 15.4 names: not three side-by-side widgets, but one editor surface where the K² torus holds the lens-ring, M2 cymatic frequencies texture it, M3 codon-rotation projects onto it, ananda vortex matrices cross-fade as perspex layers; on the personal side, the journal opens at left, the personal cymatic field breathes at centre, the recognition layer reads at right, the virtue witness lamps watch from beneath. One surface. Three poles. One profile-tick clock. Composition over juxtaposition, made real.
