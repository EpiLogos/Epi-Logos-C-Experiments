# 20.T20.3 — Wave-C Completion Map (code-verified)

Rewritten 2026-07-16, **superseding** the 09:26/09:36 audit of the same file. That
earlier audit scored the six completion criteria against **ledger claims** and
returned "5 of 6 OPEN, 39 CODE-PENDING, 4 CONTRADICTIONS." A code-verified review
of the carrier (`Body/M/pratibimba-app`) — seven independent passes, one per MX'
space plus the composed-views/color layer, every finding cited to `file:line` —
shows most of that was bookkeeping over unverified claims, not real work. This
document is the corrected record.

Method: read each per-Mn design-deep doc (`21`–`26`, `29`, `30` in
`../2026-06-02-m-prime-cycle-3-design-reconciliation/`), then verify each surface
it specifies against the actual carrier source and substrate (`Body/S/S0/epi-lib`,
`portal-core`, gateway, bridge). The design ontology's Theia "widget" nouns are
superseded by DR-FACE-7 (faces, not widgets); content-law is what was checked.

## Completion criteria — corrected verdicts

| # | Criterion | Prior verdict | Corrected verdict | Evidence |
|---|-----------|---------------|-------------------|----------|
| 1 | Every load-bearing UX claim has a status-bearing matrix row | CLOSED | CLOSED | Unchanged. |
| 2 | Every CONTRADICTION is routed as `DR-WC-*` | OPEN | **NOT A LIVE ISSUE** | The three flagged M2/M3 "contradictions" are already-resolved decisions, not open disagreements. `WC-M2.06` (planet dual-reading) is a ratified two-view toggle. `WC-M3-09` (rotational count) is **data-driven per card** via `compute_rotational_state()` (`Body/S/S0/epi-lib/include/m3.h:171`) — the carrier reads `rotationalStateCount` off the bus, never hardcodes 7/8 (`src/components/M3CosmicWheelRenderService.tsx:146,228`). `WC-M3-10` (lens namespaces) was resolved by naming the 16+1 stack **"apertures"**, applied and kept distinct from MEF lenses ("never a 17th lens", `src/engine/CosmicEngine.tsx:1115`). No user decision is owed. |
| 3 | Every CODE-PENDING names its unblocking contract | OPEN | **MOSTLY FALSE-PENDING** | Of the widgets marked "blocked on backend," the large majority have landed substrate and are buildable now (see Kind 2 below). Only a narrow set is genuinely blocked on a specific un-bussed Wave-B profile field or a missing gateway read-path (Kind 3). |
| 4 | Every non-ALIGNED claim has a landing tranche or downgrade reason | OPEN | COMPLETENESS-ONLY | The flagged rows are `SPEC-AHEAD`/`DOC-AHEAD` with a stated reason; they lack an explicit tranche id on the row. Filing nicety, not missing work. |
| 5 | Track-14 no-orphan audit extended to full Wave-C scope | OPEN | OPEN (real) | The category-wide ownership sweep (widget ids, services, chrome, tokens, onboarding) was never run at Wave-C scope. This one is a genuine owed verification. |
| 6 | Wave-C plan set is routeable by `m-dev-plan-assess.mjs` | OPEN | CLOSED-IN-PRACTICE | The assessor re-indexes all 612 tranches without a hard stop each run; no separate persisted artifact was the real requirement. |

## What is actually applied (core, per space)

All verified live on real kernel data in `Body/M/pratibimba-app/src`:

- **Composed views (the two-view shell).** 1-2-3 cosmic composition = one Three.js
  surface (K² torus + cymatic skin + codon annulus as layered carriers, matheme
  `137 = 64 + 72 + 1` arithmetically asserted) `engine/CosmicEngine.tsx` +
  `engine/compositionMatheme.ts`. 4-5-0 personal composition = one section (virtue
  witness + recognition + EBM + Now) `engine/PersonalRecognitionEngine.tsx`. Two
  faces toggled by cmd-period `#` inversion (`App.tsx:611-615,754-756`).
- **M0:** six-layer rail + selector, virtue-witness panel (live `virtue_witness_vector`),
  community/clock overlay, M0-5' library seam. Face-based host `GraphExplorerPane.tsx`.
- **M1** (best-applied): played-torus / Ananda Vortex (`PlayedTorusPane` + `playedTorusScene.ts`),
  Spanda navigator (12 epogdoon stops), Klein topology, coordinate-tree contribution,
  `#` invert operator, standalone/composed dispatch (`m1SurfaceDispatch.tsx`).
- **M2:** correspondence navigable face (live 72-address, `s2.parashaktiCorrespondences`),
  cymatic field on the K² torus, 0/1 polarity gate, meaning-packet 8+4 bus.
- **M3:** cosmic wheel (64-cell, data-driven rotation), 16+1 aperture switcher
  (`kernelBridge.m3.lensCodonBinary`), quintessence indicator, six inspectors + four
  depth views, pentadic/Maxwell inspector.
- **M4:** day-calendar, journal timeline, oracle cast, medicine view, dia-logical arena;
  lean resonance strip on Now.
- **M5:** EBM standalone observatory (12×6 grid, Klein-V₄ tritones, Möbius gradient),
  review gate + IOD-17 parity, autoresearch + Möbius-pass ribbon, recognition-layer
  slot, mediated-run evidence-packet schema.
- **Color:** token system exists and is genuinely consumed — zero raw hex outside the
  two token sources (`src/ui/tokens.ts`, `src/styles.css`); `FAMILY_HUES` P/S/T/M/L/C
  consumed by 11 non-test files.

## Progress — Wave A landed (2026-07-16, all frontend-only, verified)

Everything below whose data was already bussed has been built + wired + tested.
Integration verified together: `tsc --noEmit` exit 0, 57 new tests passing across
8 files, honesty-lint clean, `vite build` ✓. Not yet committed (tree carries
pre-existing uncommitted work from other lanes).

- **M1** (Kind 2, bridge-ready): four inspector faces built + mounted in
  `m1SurfaceDispatch.tsx` — Cl(4,2) signature, Klein-flip event-strip, vortex-matrices
  browser, audio-bus (audio_octet/nodal_quartet were genuinely bussed). New:
  `m1DeepFaceData.ts`, `m1{Cl42SignatureInspector,KleinFlipEventStrip,VortexMatricesBrowser,AudioBusInspector}.tsx`, `m1DeepFaces.test.tsx` (19 tests).
- **M0** (Kind 1): language + relations reader panels built + mounted in
  `GraphExplorerPane.tsx` (gated on `activeLayer`), reading the real `s2.graph.node`
  seam. New: `M0{Language,Relations}ReaderPanel.tsx` + tests (11). Honest gap logged:
  `M0_LAYER_FIELDS.lang` carries 3 of the spec's 7 `c_1_*` fields — flagged to the
  `m0Layers.ts` model owner, not hardcoded.
- **M2** (Kind 1): `CymaticField` + `AsmaMirrorOverlay` + `ModalDigestStrip` mounted as
  real faces on `M2CorrespondencePane.tsx`; new `SixAxisTree.tsx` consumes the
  previously-orphaned `axisViews.decodeAxisAt`. Tests (26). Psychoid switcher correctly
  deferred (not bridged).
- **M3** (Kind 1 + Kind 2): `M3ThirdSpandaPanel.tsx` (five forms, each verified = 137)
  and `M3HexagramBrowser.tsx` (8×8 King Wen, `hexagramId` confirmed bussed) built +
  mounted in `M3InspectorsPane.tsx`. Tests (10). Un-bussed seams (King Wen line-pattern
  LUT, 384 line-change graph) rendered honest-pending, not faked.

**Re-sorted during Wave A:** the M5 dispatch-trace / evidence folds are NOT Kind-1 —
their built components (`DispatchGenealogyStream/Tree`) have only a synthetic fixture;
the live gateway read-path is owned by 27.3/.5/.7/.8 and is absent. Mounting now would
show fake data. Moved to Wave B (Kind 3) with the gateway read-path.

## The remaining work after Wave A — three kinds, no decisions owed

### Kind 1 — authored & tested, not yet mounted (wiring only)
- M2: `CymaticField`, `AsmaMirrorOverlay`, `ModalDigestStrip`, six-axis decoder
  (`engine/axisViews.ts` `decodeAxisAt`) — built + tested, no live JSX mount.
- M5: `DispatchGenealogyTree`/`Stream` + evidence blocks → mount into the two
  `OmniPendingPane` folds (`omniEvidence`, `omniDispatchTrace`, `App.tsx:315-317`).
- M0: language-layer reader (`m0AssetHandles.ts`) + relations-layer reader
  (`m0RelationFamily.ts`) — models written, no render panel/mount.
- M3: third-spanda proof panel — matheme computed (`compositionMatheme.ts`), no renderer.

### Kind 2 — buildable now: a new face over an already-landed kernel LUT
(needs a profile projection + a panel; substrate confirmed present)
- M1: Cl(4,2) signature inspector, Klein-flip event-strip, vortex-matrices browser,
  audio-bus inspector (the four honestly-stubbed slots at `m1SurfaceDispatch.tsx:280-283`).
- M0: contemplation-prompt footer (`CONTEMPLATION_PROMPT_LUT`, `m0.h:246`),
  archetype-routing reader (`ARCHETYPE_LUT`, `m0.h:237`), M0/M2 parity bridge
  (`M0_M2_ZODIACAL_BRIDGE`, `m0.h:315`), question console.
- M3: 64-hexagram browser (`hexagramId` already bussed), 385-node clock refinement.
- M2: vibrational↔psychoid planetary switcher (`PSYCHOID_PLANETARY_CORRESPONDENCE[7]`,
  `m0.h:329`) — needs a bridge method carrying the LUT + a toggle.

### Kind 3 — genuinely blocked on one narrow upstream (sequence, then build)
- M3: 9-walk navigator, tarot major/minor wheel, decan-chain breadcrumb — each waits
  on a specific un-bussed Wave-B profile field (honest pending in code).
- M5: contemplation / wisdom-delta / axiom inspectors — kernel struct exists
  (`m5.h:311`), no gateway read-path yet; add dispatch first.
- M4: PASU identity-setup wizard — a full wizard exists in the **frozen** epi-theia
  tree (`epi-theia/.../pasu-wizard.tsx`), never ported; backend fully live
  (`epi-cli/src/vault/pasu.rs`, `epi vault pasu`). Port + a `nara.pasu` RPC caller.
  Plus the other M4 contemplative surfaces (lens/logos/transform/consent/cymatic-field/
  time-axis/session-close) — CLI-real, no carrier screen.

### Design residue (low priority, mechanical)
- Color: expand `FAMILY_HUES` from one-hue-per-family to the family×#0-#5 grade matrix.
  The system exists and is consumed; this is completeness, not absence.

## Corrected criterion tally

- Genuinely open verification: **criterion 5** (run the Wave-C-scope ownership sweep).
- Everything else is application work (Kind 1/2/3), not decisions or contradictions.
- The two M3 matrix rows `WC-M3-09` / `WC-M3-10` are flagged to their owning matrices
  (`wave-c-m3-mahamaya-frontend-matrix.md:48-49`) for downgrade from CONTRADICTION to
  a resolved note — a contract-surface flag, not edited here (owned by Track 24).
