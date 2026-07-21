# Visual Regression Baseline Catalog — pratibimba-app carrier

**Tranche:** 30.T30.14 (cycle-3 rerun) — retarget of the frozen epi-theia
`extensions/contracts/ui-visual-regression-catalog.md`.
**Decision register:** DR-WC-DL-5 (status **PROPOSED**, not validated — see *Coverage vs the
DR-WC-DL-5 proposal* below for why the carrier does not reproduce its 30-raw-baseline design).
**Proving suite:** `tests/e2e/visual-regression.spec.ts` (landed under 15.T15.12), run by
`pnpm test:e2e` against a real spawned gateway (repo gate `app-ui-flow`).
**Correspondence gate:** `src/ui/visualRegressionCatalog.test.ts` (repo gate `app-test`) binds
this catalog to the committed baselines and their proving tests — it is the fixture-presence
and catalog-completeness gate DR-WC-DL-5 asks for, re-homed to the carrier's real fixture set.
**Baseline root:** `tests/e2e/fixtures/visual-regression/` — Playwright commits one PNG per
platform as `<snapshot-name-without-ext>-<platform>.png` (the committed rig is darwin/swiftshader,
per the proving suite header).

---

## Coverage vs the DR-WC-DL-5 proposal

DR-WC-DL-5 proposes a ~30-fixture catalog (15 cross-cutting primitives + ~15 per-extension
flagships) with a committed raw baseline PNG per fixture at
`acceptance-harness/fixtures/visual-regression/<fixture-id>/`. The carrier does **not** reproduce
that set, for two grounded reasons:

1. **The `@pratibimba/acceptance-harness` package is dead epi-theia plumbing.** It never landed on
   the carrier; the rerun charter (retarget rule 2) marks Theia package/widget plumbing dead. The
   carrier's visual-regression harness is `tests/e2e/visual-regression.spec.ts` instead.
2. **Committing raw live-canvas pixels would be a fraudulent baseline.** The kernel tick content
   (tick12, degree720, kairos sky) is real and differs across runs/days by design — the proving
   suite header documents this at length. The carrier therefore commits deterministic **chrome**
   baselines (live-profile-coupled regions hidden at capture time via
   `visual-regression.hide.css`) and proves the live canvas separately with **in-run frozen-tick**
   determinism (raw pixels compared within one run — never committed).

Most of the ~15 proposed per-extension flagships are also **not yet landed as carrier components**
(no Tarot deck, hexagram browser, 72-dim resonance grid, 7-8-9 spine reading, or dispatch-trace
surface exists in `src/components/` at the time of this catalog). As each flagship component lands
under its owning track, its visual-regression fixture is added to *Committed baselines* or *In-run
determinism proofs* below and is immediately bound by the correspondence gate.

The buckets below are the carrier's honest coverage of the DR-WC-DL-5 concept space:

| DR-WC-DL-5 proposed fixture(s) | Carrier status |
|---|---|
| daily 0/1 layout cosmic side | **committed baseline** — `composition-1-2-3-cosmic` |
| daily 0/1 layout personal side | **committed baseline** — `composition-4-5-0-personal` |
| lemniscate transition frames | **committed baseline** — `face-toggle-mid-crossing` (mid-fold) |
| block-host-widget (44.9 add-on) | **committed baseline** — `block-host-review-fold` |
| six-matrix tick choreography / slerp choreography | **in-run proof** — `tick-choreography` (frozen-tick determinism; no committed pixels by design) |
| m2-parashakti cymatic plate | **in-run proof** — `m2-cymatic-transport` (held-frame determinism) |
| provenance borders, pending badges, readiness band, family-letter palette tiers, chromatic signature binary, status-bar canon, privacy-class chrome | **behavioural coverage** — the wave-C design system is asserted structurally by `src/ui/waveCDesignSystem.test.ts` (`app-test`), not by pixel baselines |
| m0-anuttara verifier coherence, m1 played-torus + tritone overlay, m2 72-fold breadcrumb, m3 wheel + tarot deck, m4 ambient strip + canvas highlights + session-close ceremony, m5 resonance grid + spine reading, omnipanel dispatch trace | **not yet landed** — the owning flagship component is absent on the carrier; the fixture lands with the component under its own track |

---

## Committed baselines

Each entry commits a PNG under the baseline root and is proven by a named test in the proving
suite. The correspondence gate asserts this list is in exact bijection with the committed PNGs and
that every snapshot name below appears in a `toHaveScreenshot(...)` call in the proving suite.

### composition-1-2-3-cosmic
- **Baseline:** `composition-1-2-3-cosmic-darwin.png`
- **Snapshot name:** `composition-1-2-3-cosmic.png`
- **Proving test:** `(c)` in `visual-regression.spec.ts`
- **Owning surface:** the cosmic (face 0) 1-2-3 composition — `src/App.tsx` `COSMIC_DEFAULT` layout (eleven cosmic tabs + the shared OmniPanel border)
- **Captured state:** engine choreography frozen at a paused tick; all live-profile / wall-clock / lived-vault regions hidden via `visual-regression.hide.css`; the eleven-tab inventory and the OmniPanel border are asserted textually before capture
- **Diff threshold:** per-pixel 0.2 (default), maxDiffPixels 400 (~0.04% of the fixed 1280×800 viewport)
- **Update procedure:** re-run `pnpm test:e2e -g "1-2-3 cosmic" -- --update-snapshots` after an approved change to the cosmic composition chrome (`App.tsx` COSMIC_DEFAULT) or the hidden-region inventory; visually review the diff, then commit the new PNG.

### composition-4-5-0-personal
- **Baseline:** `composition-4-5-0-personal-darwin.png`
- **Snapshot name:** `composition-4-5-0-personal.png`
- **Proving test:** `(d)` in `visual-regression.spec.ts`
- **Owning surface:** the personal (face 1) 4-5-0 composition — `src/App.tsx` `PERSONAL_DEFAULT` layout (Vault/Journal/Calendar/Oracle border tabs + Now/M1 Deep/Arena/CU Ledger main tabs)
- **Captured state:** day anchored to today (`begin_today`, idempotent) so the surface is identical in suite order and isolation; the now-pane body rides the hidden-region mask as lived-vault content; the M0 ground / M5 recognition pending states are asserted before capture
- **Diff threshold:** per-pixel 0.2 (default), maxDiffPixels 400
- **Update procedure:** re-run `pnpm test:e2e -g "4-5-0 personal" -- --update-snapshots` after an approved change to the personal composition chrome (`App.tsx` PERSONAL_DEFAULT) or the hidden-region inventory; visually review the diff, then commit the new PNG.

### face-toggle-mid-crossing
- **Baseline:** `face-toggle-mid-crossing-darwin.png`
- **Snapshot name:** `face-toggle-mid-crossing.png`
- **Proving test:** `(a)` in `visual-regression.spec.ts`
- **Owning surface:** the 0/1 lemniscate face-toggle transition — the DR-UI-4 animation consumed by `.face-slot` (`src/styles.css`), with both faces (`src/App.tsx`) in flight
- **Captured state:** the same transition slowed and paused at fraction 0.5 through WAAPI (identical easing curve and fraction to 200 ms into the real 400 ms crossing) so the mid-fold is frozen without racing the window; both `.face-slot` opacities in (0.05, 0.95) with the Bernoulli fold mask consumed; live regions on both faces hidden
- **Diff threshold:** per-pixel 0.2 (default), maxDiffPixels 600 (mid-transition mask exception — absorbs the frozen Bernoulli edge, stays below half the smallest guarded chrome unit)
- **Update procedure:** re-run `pnpm test:e2e -g "face-toggle" -- --update-snapshots` after an approved DR-UI-4 timing/easing or fold-geometry change; visually review the diff, then commit the new PNG.

### block-host-review-fold
- **Baseline:** `block-host-review-fold-darwin.png`
- **Snapshot name:** `block-host-review-fold.png`
- **Proving test:** `(e)` in `visual-regression.spec.ts`
- **Owning surface:** the Track-44 surface standard — the OmniPanel Review fold hosting the synthetic-fixture blocks through `BlockHost` (`src/blocks/BlockHost.tsx`), feeding release gate G8 (44.T44.9)
- **Captured state:** session cleared to the fixture block source (`data-block-source=fixture`, deterministic content by construction); the block-host element captured (not the whole page); live-tick chrome rides the hidden-region mask
- **Diff threshold:** per-pixel 0.2 (default), maxDiffPixels 1000 (element capture over the deterministic fixture blocks)
- **Update procedure:** re-run `pnpm test:e2e -g "block-host" -- --update-snapshots` after an approved change to `BlockHost.tsx`, the block registry, or the Surface-Standard fixture set; visually review the diff, then commit the new PNG.

---

## In-run determinism proofs (no committed baseline by design)

These prove the **live** canvas — raw pixels compared within a single run, never committed
(committing live kernel-tick pixels would be a fraudulent baseline). They carry no PNG under the
baseline root; the correspondence gate deliberately does not require one for them.

### tick-choreography
- **Proving test:** `(b)` in `visual-regression.spec.ts`
- **Proves:** pause ⇒ the cosmic engine canvas is pixel-static across ≥1 live kernel tick
  (`FROZEN_MAX_RATIO` 0.002); scrub step-back ⇒ a different ring record ⇒ visibly different pixels
  (`STEPPED_MIN_RATIO` 0.004); step-forward back to the same record ⇒ pixel-static again; resume ⇒
  pixels flow. This is the tick-choreography determinism law, frame-by-frame over the 720-tick
  scrub ring, exercised through the engine's §8.8 keyboard transport.

### m2-cymatic-transport
- **Proving test:** `(c.1)` in `visual-regression.spec.ts`
- **Proves:** the M2 correspondence pane's Pause deep-captures the exact received profile frame by
  value; the held `CymaticField` stays pixel-static (`FROZEN_MAX_RATIO`) while the real gateway
  advances the status generation underneath — nested live-profile mutation cannot change a held
  raster.

---

## Design derivation discipline

Every committed baseline captures a surface whose chrome derives from a coordinate-system concept
(the 0/1 face polarity, the 4+2 K² engine cycle, the Track-44 block surface standard). Decoration
without derivation is rejected at lint time (`carrier-tokens` gate — raw hex / px / ms live only in
the two token sources). The matheme `0/1 = 4+2 = 5→0 = 0/1` is honoured across the committed set:
`0/1` (face polarity) carries `face-toggle-mid-crossing`; `4+2` (the six-position engine cycle)
carries `tick-choreography`; `5→0` (Möbius return) carries the personal-close surface in
`composition-4-5-0-personal`; and the closure `= 0/1` is the correspondence gate asserting the
catalog and the committed baselines stay in exact bijection — the invariant preserved across the
cycle.

Ontology is lived-conception is living-code is rendered-design.
