# UI Visual Regression Baseline Catalog

**Decision register:** DR-WC-DL-5
**Scope:** Cross-cutting primitives + per-extension flagship fixtures (~30 total)
**Diff threshold:** 0.02 (2% pixel-diff tolerance)
**Update procedure:** Fixture changes require visual review + commit of new baseline
**Owning extension:** `@pratibimba/acceptance-harness`
**Baseline root:** `acceptance-harness/fixtures/visual-regression/<fixture-id>/baseline.png`

---

## Cross-Cutting Primitive Fixtures (15)

These fixtures cover primitives shared across all M-extensions. They are the canary set — if any cross-cutting primitive regresses, the entire design language is inconsistent.

### 1. `provenance-border-ready`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** A provenance-border element in `ready` state — green/emerald ring, canonical thickness 2px, readiness id badge visible
- **Update procedure:** Tracked alongside `design-primitives/src/provenance-border.ts`; regenerate baseline when border styles or readiness colour mapping change
- **Diff threshold:** 0.02

### 2. `provenance-border-degraded`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Provenance-border in `degraded` state — amber/gold ring, warning indicator present
- **Update procedure:** Same as `ready` variant
- **Diff threshold:** 0.02

### 3. `provenance-border-blocked`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Provenance-border in `blocked` state — red/crimson ring, blocked overlay visible with reason text
- **Update procedure:** Same as `ready` variant
- **Diff threshold:** 0.02

### 4. `pending-badge-each-id`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Paged catalog page showing all 9 readiness id badges (`pending-0` through `pending-8` plus `ready` and `blocked` variants) rendered in a single composition
- **Update procedure:** Regenerate when any readiness id colour mapping changes (tracked in `design-tokens.ts` readiness palette)
- **Diff threshold:** 0.02
- **Note:** This is a composite fixture covering 9+ badges in one catalog page capture

### 5. `blocked-overlay-with-reason`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Synthetic blocked state with `s5_review_blocked` reason string rendered in the overlay; tests that the reason text is legible against the blocked overlay background
- **Update procedure:** Regenerate when overlay styling or blocked-state chrome changes
- **Diff threshold:** 0.02

### 6. `lemniscate-transition-frames`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Frame-by-frame capture of the cosmic↔personal fold transition — keyframes at 0%, 25%, 50%, 75%, 100% of the lemniscate animation
- **Update procedure:** Regenerate when lemniscate motion curve or fold geometry changes
- **Diff threshold:** 0.02
- **Note:** Multi-frame fixture; baseline contains the full keyframe strip

### 7. `slerp-choreography-12-ticks`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Frame-by-frame capture of the 12-tick K² orientation cycle including the Klein boundary at tick 5→6; each tick frame captured at the profile-tick clock rate
- **Update procedure:** Regenerate when profile-tick clock rate or K² orientation geometry changes
- **Diff threshold:** 0.02
- **Note:** Multi-frame fixture; 12 ticks captured as a strip

### 8. `chromatic-signature-binary`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Cl(4,2) signature cool/warm colour binary rendered as a split panel — cool side (0/1 left, lapis/indigo family) and warm side (0/1 right, gold/emerald family)
- **Update procedure:** Regenerate when palette tier or colour-binary token values change
- **Diff threshold:** 0.02

### 9. `flow-streamline-gold`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** DR_RING_MAHAMAYA gold flow streamline rendered on a neutral background — tests the gold gradient and streamline thickness
- **Update procedure:** Regenerate when streamline token values change
- **Diff threshold:** 0.02

### 10. `flow-streamline-emerald`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** DR_RING_PARASHAKTI emerald flow streamline — counterpart to the gold streamline
- **Update procedure:** Same as gold streamline
- **Diff threshold:** 0.02

### 11. `family-letter-palette-tiers`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** All six family-letter palette tiers (P/S/T/M/L/C) rendered as swatch rows with grade-within-tier variants
- **Update procedure:** Regenerate when any family-letter palette mapping changes
- **Diff threshold:** 0.02

### 12. `readiness-colour-band`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Full readiness colour band — all kernel-bridge ledger semantic colours from blocked (crimson) through degraded (amber) to ready (emerald) in a single horizontal strip
- **Update procedure:** Regenerate when readiness colour mapping changes
- **Diff threshold:** 0.02

### 13. `status-bar-six-entry-canon`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** Status bar rendered with the six-entry canon from Track 15.10 — all six status entries present and correctly aligned
- **Update procedure:** Regenerate when status bar layout or entry canon changes
- **Diff threshold:** 0.02

### 14. `highlight-category-inscription`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** All highlight categories rendered as archetype-aligned inscription registers — each category's colour, typography, and border style captured in a grid
- **Update procedure:** Regenerate when highlight category register changes
- **Diff threshold:** 0.02

### 15. `privacy-class-chrome`
- **Owning extension:** `@pratibimba/design-primitives`
- **Capture:** M4-protected-local chrome rendered on a surface — the distinctive privacy-class visual indicator that marks protected-local content
- **Update procedure:** Regenerate when privacy-class chrome styling changes
- **Diff threshold:** 0.02

---

## Per-Extension Flagship Fixtures (~15)

Each M-extension contributes at least one flagship fixture. These test extension-specific rendering, not cross-cutting primitives.

### 16. `m0-anuttara-verifier-coherence`
- **Owning extension:** `@pratibimba/m0-anuttara`
- **Capture:** M0 9-bit witness panel rendered with readiness-driven layer-selector active — tests that the Verifier panel correctly displays all 9 bits with their readiness colour mapping
- **Update procedure:** Regenerate when M0 witness panel layout or Verifier bit rendering changes
- **Diff threshold:** 0.02

### 17. `m1-paramasiva-played-torus-default`
- **Owning extension:** `@pratibimba/m1-paramasiva`
- **Capture:** The cosmic-1-2-3 flagship — K² torus with DR streamlines and Cl(4,2) halo rendered at default orientation
- **Update procedure:** Regenerate when torus rendering, streamline overlay, or halo shader changes
- **Diff threshold:** 0.02

### 18. `m1-paramasiva-tritone-square-overlay`
- **Owning extension:** `@pratibimba/m1-paramasiva`
- **Capture:** M5 tritone overlay on the Klein V₄ rendering — tests that the tritone square is correctly positioned and coloured within the V₄ group overlay
- **Update procedure:** Regenerate when tritone overlay or V₄ group rendering changes
- **Diff threshold:** 0.02

### 19. `m2-parashakti-cymatic-plate-default`
- **Owning extension:** `@pratibimba/m2-parashakti`
- **Capture:** Cymatic plate at default state with Klein-flip pre/post capture — two panels showing the plate before and after the Klein flip transition
- **Update procedure:** Regenerate when cymatic plate rendering or Klein-flip animation changes
- **Diff threshold:** 0.02

### 20. `m2-parashakti-72-fold-breadcrumb`
- **Owning extension:** `@pratibimba/m2-parashakti`
- **Capture:** Breadcrumb trail rendering: hexagram → half-decan → ... → body-zone — tests the full 72-fold breadcrumb chain visibility and typography
- **Update procedure:** Regenerate when breadcrumb rendering or 72-fold mapping changes
- **Diff threshold:** 0.02

### 21. `m3-mahamaya-wheel-default`
- **Owning extension:** `@pratibimba/m3-mahamaya`
- **Capture:** 360° codon wheel with active position highlighted — tests wheel rendering, position marker, and rotation state
- **Update procedure:** Regenerate when codon wheel rendering or position highlighting changes
- **Diff threshold:** 0.02

### 22. `m3-mahamaya-tarot-deck-default`
- **Owning extension:** `@pratibimba/m3-mahamaya`
- **Capture:** Major + Minor arcana deck view with active card highlighted — tests card rendering, deck layout, and active-card indicator
- **Update procedure:** Regenerate when tarot deck rendering or card layout changes
- **Diff threshold:** 0.02

### 23. `m4-nara-ambient-strip-default`
- **Owning extension:** `@pratibimba/m4-nara`
- **Capture:** The Nara ambient strip rendered with Klein weighting, somatic signature, and live spreads — tests the personal-side strip chrome
- **Update procedure:** Regenerate when ambient strip rendering, Klein weighting display, or spread layout changes
- **Diff threshold:** 0.02

### 24. `m4-nara-canvas-with-highlights`
- **Owning extension:** `@pratibimba/m4-nara`
- **Capture:** Tiptap canvas with all 10 highlight categories rendered — each category's colour and style verified in the rich-text context
- **Update procedure:** Regenerate when highlight category register or Tiptap canvas rendering changes
- **Diff threshold:** 0.02

### 25. `m4-nara-session-close-ceremony`
- **Owning extension:** `@pratibimba/m4-nara`
- **Capture:** Session close view: wisdom-delta + XOR + 4 contemplation seeds + virtue witness — tests the full ceremony composition
- **Update procedure:** Regenerate when session close ceremony layout or content rendering changes
- **Diff threshold:** 0.02

### 26. `m5-epii-resonance-grid`
- **Owning extension:** `@pratibimba/m5-epii`
- **Capture:** 72-dim resonance grid with tritone overlays rendered — tests grid rendering, cell colour mapping, and tritone overlay positioning
- **Update procedure:** Regenerate when resonance grid rendering or tritone overlay changes
- **Diff threshold:** 0.02

### 27. `m5-epii-spine-789-reading`
- **Owning extension:** `@pratibimba/m5-epii`
- **Capture:** 7-8-9 spine reading at session close — tests the spine reading layout and typography
- **Update procedure:** Regenerate when spine reading rendering or layout changes
- **Diff threshold:** 0.02

### 28. `omnipanel-dispatch-trace`
- **Owning extension:** `@pratibimba/omnipanel`
- **Capture:** Pi → Anima → subagent tree rendered in the omnipanel dispatch trace view — tests tree rendering, agent node labels, and dispatch arrows
- **Update procedure:** Regenerate when dispatch trace rendering or agent tree layout changes
- **Diff threshold:** 0.02

### 29. `daily-0-1-layout-cosmic-side`
- **Owning extension:** `@pratibimba/composition-surface`
- **Capture:** The daily 0/1 layout cosmic side — tests the full cosmic-side composition with M0-M5 cosmic extensions rendered in their default positions
- **Update procedure:** Regenerate when composition surface layout or cosmic-side rendering changes
- **Diff threshold:** 0.02

### 30. `daily-0-1-layout-personal-side`
- **Owning extension:** `@pratibimba/composition-surface`
- **Capture:** The daily 0/1 layout personal side — tests the M4 Nara personal side with ambient strip, canvas, and session close elements
- **Update procedure:** Regenerate when composition surface layout or personal-side rendering changes
- **Diff threshold:** 0.02

---

## Verification

### Fixture-Presence Test
Asserts each catalog entry has a baseline image at:
```
acceptance-harness/fixtures/visual-regression/<fixture-id>/baseline.png
```

### Catalog-Completeness Test
Asserts:
1. Every cross-cutting primitive (fixtures 1–15) has a fixture entry
2. Every M-extension (`m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, `m5-epii`, `omnipanel`, `composition-surface`) has at least one flagship fixture

### Visual Regression Run
```bash
pnpm --filter @pratibimba/acceptance-harness test:visual
```
Passes for all catalog entries. Each fixture diff stays within the 0.02 threshold vs baseline.

### Update Procedure (per fixture)
1. Change to the owning extension's source triggers a visual diff
2. If diff exceeds 0.02 threshold → visual review required
3. Approved changes → commit new baseline to `acceptance-harness/fixtures/visual-regression/<fixture-id>/baseline.png`
4. Rejected changes → revert source change or adjust rendering until diff ≤ 0.02

---

## Design Derivation Discipline

Every fixture in this catalog derives from a coordinate-system concept. Decoration without derivation is rejected at lint time. The derivation chain for each fixture type:

| Fixture category | Derivation root |
|---|---|
| Provenance borders | Readiness id → kernel-bridge ledger semantic colour → border chrome |
| Colour binary | Cl(4,2) signature → cool/warm colour-binary → chromatic axis |
| Flow streamlines | DR_RING_MAHAMAYA / DR_RING_PARASHAKTI → gold/emerald → streamline tokens |
| Family-letter palettes | Family-letter (P/S/T/M/L/C) → palette tier → grade-within-tier |
| Readiness band | Readiness id → kernel-bridge ledger semantic colour → colour band |
| Profile-tick clock | Foundation Principle 2 → global render clock → single-primitive discipline |
| Privacy chrome | Privacy class → M4-protected-local → chrome token |
| Highlight categories | Psyche-facet → constitutional-agent function → inscription register |

The matheme `0/1 = 4+2 = 5→0 = 0/1` is structurally honoured:
- `0/1` (signature polarity binary) → chromatic axis fixtures (8)
- `4+2` (K² six-position cycle) → motion grammar fixtures (6, 7)
- `5→0` (Möbius return) → family-tier C-endpoint topology fixtures (11)
- `= 0/1` (polarity invariant preserved) → full-catalog closure assertion

Ontology is lived-conception is living-code is rendered-design.
