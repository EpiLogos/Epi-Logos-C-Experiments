# Track 30 — Design Language Layer

Stage 1 (Tracks 21-26) closed per-Mn frontend depth and the integration tracks (11, 15, 19) named the cross-cutting affordances scattered across the cycle: ten highlight categories (11.11), Cl(4,2) signature halos (15.8), gold/emerald DR streamlines (15.8), the lemniscate transition primitive (15.5), the slerp choreography single primitive (15.9), the ambient state strip palette (11.12), the chronos response-orbit visual cues (19.11), the privacy-class chrome triplet (25.18), the tattva element palette (23.x), the psyche-facet badge palette (26.8). The substance for the design language ALREADY EXISTS. What does not exist is the unification: one chromatic system, one motion grammar, one typography contract, one state-grammar primitive shelf, one token bundle, one consume-not-fork lint. Track 30 lands the cross-cutting design language as a binding contract grounded in the coordinate logic. Every visual choice traceable to a coordinate-system concept (Cl(4,2) signature → cool/warm colour-binary, DR rings → gold/emerald flow streamlines, family-letter → palette tier, archetype-position → grade-within-tier, profile-tick → global render clock) honours that derivation. Decoration without derivation is rejected at lint time.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (Three-Layer Coordinate Architecture: `#0`–`#5` raw archetypes as foundation; P/S/T/M/L/C as Layer-2 manifestations; cpf/ct/cp/cf/cfp/cs as Layer-3 reflective in `()`; `#` as inversion operation); `M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6` (Cl(4,2) signature as colour-binary axis; DR_RING_MAHAMAYA / DR_RING_PARASHAKTI as canonical flow pair; slerp as single tick primitive); `M3'/alpha_rasa_bridge_ql.md` (α / 16:9 / 4π gauge geometry as proof-overlay typography source)
- Stage-1 fragment sources: 11.11 (highlight categories), 11.12 (ambient strip), 15.5 (lemniscate transition), 15.6 (profile-tick + readiness inline rendering), 15.8 (Cl(4,2) halo + DR streamlines), 15.9 (slerp choreography), 15.10 (status bar discipline), 19.11 (chronos response orbit), 21.x (M0 verifier coherence + provenance-pills 8-state), 22.x (M1 Klein-flip glyphs + tritone-square overlay), 23.x (tattva palette + signature arrow tints), 24.x (suit-element colouring + codonClass cell colour), 25.18 (M4 privacy chrome triplet), 26.x (psyche-facet badges + SkeletonEvents gold/emerald)
- Full row-level evidence: `plan.runs/wave-c-design-language-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — Theia `ThemeService`, `ColorContribution`, `IconThemeService`, `StatusBarContribution`, `KeybindingContribution`, `MenuContribution`, `--theia-*` CSS-var convention; `Body/M/epi-theia/extensions/m-extension-runtime/style/index.css` (`mext-banner-{ok,degraded,blocked}` with `--theia-{success,warning,error}Foreground` CSS-var fallbacks — the canonical token-fallback convention); `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/theme/resolveTheme.ts` (seven-theme set `dark|light|glass|discause|nara-dark|nara-light|nara-glass` + M4-nara-domain remap); `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` `readinessTaxonomy[]` 9-id set with `severity ∈ {ready, degraded, blocked}` + `ownerTrack`; `Body/M/epi-theia/extensions/integrated-composition/` (shared composition extension as the design-primitive shelf host); `m-extension-runtime` `SharedBridgeAdapter` (the readiness + profile subscription point all primitives consume). Per Foundation Principle 8: consume the platform, extend through `--epilogos-*` namespace overrides only where Theia defaults conflict with coordinate-system derivation. No competing theme engine. No competing token system. No greenfield design framework.

## Design System Contracts

The design language lands as **eight binding contracts** that every M-extension consumes:

1. **`ui-typography.{ts,md}`** — type scale (heading 1–4 / body / small / caption / mono / matheme); coordinate-strings in monospace with family-tier tint; mathemes in KaTeX at heading-2 scale.
2. **`ui-colour-tokens.{json,ts,md}`** — eleven sub-namespaces: family-tier (P/S/T/M/L/C × #0–#5), Cl(4,2) signature (cool/warm), DR flow (mahamaya gold / parashakti emerald), highlight category (10 entries from 11.11), tattva element (6 entries post-5.16), psyche-facet (7 entries), privacy class (3 entries), mode-chip (3 entries), readiness (9 ids × 3 severity bands), status-bar (6 entries), provenance-pill (8 entries from 21.x).
3. **`ui-motion-tokens.{json,ts,md}`** — `motion.transition.lemniscate.*`, `motion.tick.slerp.*`, `motion.flow.streamline.advance`, `motion.profile-tick.*`, `motion.klein-flip.*`, `motion.flow-watcher.debounceMs`. Single-primitive discipline per 15.9.
4. **`ui-accessibility.{ts,md}`** — focus-ring contract, reduced-motion implementation, screen-reader contract, pause/scrub keybindings, contrast minimums.
5. **`ui-iconography.{ts,md}`** — activity-bar mode icons, coin-flip glyph, lemniscate ∞ glyph, six per-Mn family glyphs.
6. **`ui-composition-rules.md`** — composition-over-juxtaposition rules + bento spacing tokens + single-surface rule.
7. **`ui-family-palette-derivation.md`** — explicit per-tier derivation explaining why P-tier is foundation-neutral, S-tier is substrate-slate, T-tier is thought-parchment, M-tier is subsystem-saturated, L-tier is epistemic-mist, C-tier is ontological-deep-violet.
8. **`ui-visual-regression-catalog.md`** — per-fixture catalog (owning extension, state captured, update procedure, diff threshold).

Plus a **design-primitive shelf** at `Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/` with: `ProvenanceBorder`, `PendingBadge`, `BlockedOverlay`, `ReadinessIndicator`, `EmptyState`, `LoadingPulse`, `LemniscateTransition`, `SlerpChoreographyClock`, `CoordinateString`, `CodonString`, `HexagramString`, `SymbolicCoordinateString`, `HighlightCategoryRegistry`.

Plus a **consumption lint** at `Body/M/epi-theia/extensions/scripts/validate-design-token-consumption.mjs` that fails on raw hex codes / hardcoded font-sizes / hardcoded animation-durations / locally-reimplemented border-badge-overlay primitives in every M-extension `src/**/*.{ts,tsx,css}`.

## Tranches

1. **30.1 — Typography scale contract** *(doc-ahead-landing + spec-ahead-integration; cross-link 15.6, 22.6 Mersenne proof overlay, 21.x M0 verifier renderer)*

   Author `Body/M/epi-theia/extensions/contracts/ui-typography.ts` (typed exports) + `ui-typography.md` (human-readable spec). The typed scale (with per-level token name + Theia-CSS-var consumption + use-case):

   - `epilogos.typography.heading.1` — page title (e.g. `M5' Epii Atelier`); 24px (default `--theia-ui-font-size3` ×1.5); weight 600; family `--theia-ui-font-family`
   - `epilogos.typography.heading.2` — section title (e.g. `Mersenne Proof Overlay`, `Resonance Grid`); 18px; weight 600. **Matheme tokens use this scale via KaTeX block render.**
   - `epilogos.typography.heading.3` — sub-section / card title; 15px; weight 600
   - `epilogos.typography.heading.4` — micro-section / chip label group; 13px; weight 600
   - `epilogos.typography.body.base` — body text; 14px; weight 400; family `--theia-ui-font-family`
   - `epilogos.typography.body.small` — secondary body; 12px; weight 400
   - `epilogos.typography.caption` — captions / hover tooltips / `aria-label`-style asides; 11px; weight 400
   - `epilogos.typography.mono.default` — generic code / handle / hex; `--theia-monospace-font-family`; 13px
   - `epilogos.typography.mono.coordinate` — `[[wikilink]]` coordinate-strings; `--theia-monospace-font-family`; 13px; **family-tier tint via `epilogos.colour.family.{p,s,t,m,l,c}.{0..5}` (per consumed wikilink's family-letter)**
   - `epilogos.typography.mono.codon` — codon strings (`AUG`, `UAA`, `CGU`); `--theia-monospace-font-family`; 13px; amino-acid badge appended via `CodonString` primitive (DL-16)
   - `epilogos.typography.mono.hexagram` — hexagram glyphs (䷀ ䷁ ䷂); 16px; rendered via `HexagramString` primitive with line-change overlay (DL-16)
   - `epilogos.typography.matheme.block` — KaTeX block rendering (e.g. `0/1 = 4+2 = 5\\to 0 = 0/1`); heading-2 prominence; centred or left-flushed per consumer
   - `epilogos.typography.matheme.inline` — KaTeX inline rendering (e.g. `\\alpha = 16/9 \\cdot \\sqrt[3]{4\\pi}`); body-base size

   KaTeX integration: add `katex` dependency to `Body/M/epi-theia/extensions/integrated-composition/package.json` (already a peer host for design primitives). Matheme tokens render via small wrapper at `integrated-composition/src/browser/design-primitives/matheme.tsx` consuming KaTeX with the typography tokens above. The wrapper carries `aria-label` with plain-text equivalent for screen-reader access.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-typography.ts`; `test -f Body/M/epi-theia/extensions/contracts/ui-typography.md`; typed-export integrity test asserts every scale level is exported with name + size + weight + family; KaTeX matheme smoke test renders `0/1 = 4+2 = 5\\to 0 = 0/1` at heading-2 scale via the matheme primitive; coordinate-string family-tier tint test asserts `CoordinateString` consumes the wikilink target's family-letter and applies the correct `epilogos.colour.family.<letter>.<archetype>` tint.

2. **30.2 — Coordinate-derived chromatic system** *(spec-ahead-integration + no-orphan-fill; cross-link 15.8 Cl(4,2), 11.11 highlight categories, 23.x tattva palette, 25.18 privacy chrome, 26.8 psyche-facet, 19.11 response orbit, 21.x provenance pills)*

   Author `Body/M/epi-theia/extensions/contracts/ui-colour-tokens.json` (canonical machine-readable W3C-draft format) + `ui-colour-tokens.ts` (typed exports) + `ui-colour-tokens.md` (human-readable spec with per-token derivation citation).

   **Eleven token sub-namespaces**, each derived from coordinate-system concepts:

   - **`epilogos.colour.family.{p,s,t,m,l,c}.{0,1,2,3,4,5}`** (36 tokens) — family-tier hue × archetype-position grade. P-tier foundation-neutral (grade 0 = neutral-50, grade 5 = neutral-700 with subtle warmth-grade per Möbius-return polarity); S-tier substrate-slate (cool grey-blue grade); T-tier thought-parchment (warm cream grade); M-tier subsystem-saturated (per-M0 indigo / M1 amber / M2 violet-tattva / M3 gold / M4 earth-slate-gold / M5 EBM-amber); L-tier epistemic-mist (cool faded-blue grade); C-tier ontological-deep-violet (C0/Bimba and C5/Pratibimba at the violet endpoints per Cl(4,2) signature −1 polarity, per DR-WC-DL-1 default). Derivation document at `ui-family-palette-derivation.md` (Tranche 30.8).
   - **`epilogos.colour.signature.{cool, warm}`** (2 tokens) — Cl(4,2) signature −1 (P0/P5, sin/cos) = `cool-indigo` `#5a73a8` (light) / `#8a9bbd` (dark); signature +1 (P1-P4, tan/sec/cot/csc) = `warm-amber` `#d4a14a` (light) / `#e0b366` (dark). Per 15.8 (`M1-2-ANANDA-VORTEX-ARCHITECTURE.md §5`). Light/dark preserve polarity (cool stays cool, warm stays warm across inversion).
   - **`epilogos.colour.flow.{mahamaya_gold, parashakti_emerald}`** (2 tokens) — DR_RING_MAHAMAYA `{1,2,4,8,7,5}` ascending = `gold` `#d4a574` (light) / `#e0b67e` (dark); DR_RING_PARASHAKTI `{3,6,9,3,6,9}` descending = `emerald` `#4a8b6f` (light) / `#5fa886` (dark). Per `m1.c:122-123` substrate. Paired with `motion.flow.streamline.advance` (Tranche 30.3) for per-tick streamline advance.
   - **`epilogos.colour.highlight-category.{daily-note, oracle, dream, expand, recognition, prospective-surfacing, retrospective-surfacing, kairos-touch, somatic-mark, live-spread}`** (10 tokens) — promoted from 11.11. Exact values: user-side TBD per existing m4-nara `highlight-mark.ts` user-side palette; agent-side `recognition #d4a574` · `prospective-surfacing #e8a3a3` · `retrospective-surfacing #8090a3` · `kairos-touch #b8c0cc` · `somatic-mark #8a7355` · `live-spread #5b3a7e` (canon-locked per 11.11 + 19.11 alignment). Consumed by `HighlightCategoryRegistry` primitive (Tranche 30.7).
   - **`epilogos.colour.element.{aether, earth, water, air, fire, salt}`** (6 tokens) — tattva palette per L2' canonical post-5.16: aether `#7d4f9e` (violet-akasha), earth `#8a7355` (earth/umber), water `#5fa9b8` (aquamarine), air `#6ec1c8` (cyan-vayu), fire `#c5564b` (vermilion-agni), salt `#7d4f9e` (violet-akasha, same as aether — prima/ultima materia routing to akasha at different polarities per 19.10c). Per 23.4 + 25.10 element-glyphs.
   - **`epilogos.colour.psyche-facet.{anima, eros, logos, mythos, nous, psyche, sophia}`** (7 tokens) — per DR-WC-DL-2 default (agent-function semantics, not M-tier mapping): anima `#a89c8e` (root-neutral), eros `#e8a3a3` (relation-rose, deliberately aligned with `prospective-surfacing` category — eros and prospective-surfacing share a colour vocabulary), logos `#6b7588` (structure-slate), mythos `#d4a14a` (narrative-amber), nous `#5a73a8` (clarity-indigo, deliberately aligned with `signature.cool` — nous AS Cl(4,2) signature-anchor), psyche `#8a7355` (depth-umber, deliberately aligned with `somatic-mark`), sophia `#d4a574` (wisdom-gold, deliberately aligned with `recognition` + `flow.mahamaya_gold`).
   - **`epilogos.colour.privacy.{protected_local, handle_only, opt_in}`** (3 tokens) — `protected_local #8a7355` (earth) · `handle_only #6b7588` (slate) · `opt_in #d4a574` (gold). Per 25.18. Note that these tokens ALIGN with psyche-facet (psyche/logos/sophia) — the alignment is structural, not coincidental: protected-local is psyche's depth, handle-only is logos's structure, opt-in is sophia's wisdom-sharing. The application stays M4-owned per 25.18.
   - **`epilogos.colour.mode-chip.{tranche-mode, response-orbit, sense-override}`** (3 tokens) — for tuning-bar segmented controls per 11.12. Each token is a base mid-saturation hue with active/inactive light/dark variants.
   - **`epilogos.colour.readiness.severity.{ready, degraded, blocked}`** (3 tokens) — base hues from existing `mext-banner-{ok,degraded,blocked}` convention: ready `#59c75a` (Theia successForeground); degraded `#d4a14a` (Theia warningForeground); blocked `#f48771` (Theia errorForeground). Per `m-extension-runtime/style/index.css`. **`epilogos.colour.readiness.id.{bridge_unavailable, profile_missing_field, s2_graph_blocked, s3_subscription_blocked, s5_review_blocked, authority_payload_missing, privacy_blocked, degraded_but_readable, ready_public_current}`** (9 tokens) — per-id semantic variants. Each id inherits its severity-band base hue but adds a per-id distinguishing tint (e.g. `bridge_unavailable` carries a slightly-cyan blocked-red signaling connection-level issue vs `s5_review_blocked` carries an orange-tinted blocked-red signaling review-level issue). The per-id tints land in the JSON; consumers always render the id, never just the severity band, so user can identify owner.
   - **`epilogos.colour.status-bar.{profile-tick, day-now, session-id, gateway-readiness, profile-generation, active-coordinate}`** (6 tokens) — per 15.10 six-entry canon. Each entry carries one of: family-tier hue (`active-coordinate` consumes its coordinate's family-tier), readiness state (`gateway-readiness` consumes `readiness.severity.*`), neutral (`session-id`, `profile-generation`). Status bar discipline preserved — no privacy-chrome entries leak in per 15.10 + 25.18.
   - **`epilogos.colour.provenance-pill.{canonical, canonical_absent, derived, inferred, review_pending, blocked, bridged_local, bridged_public}`** (8 tokens) — promoted from 21.x M0 anuttara provenance-pills palette. Canonical green; canonical_absent gray; derived amber; inferred amber-dim; review_pending amber-pulse; blocked red; bridged_local purple; bridged_public blue.

   Light/dark variants per Tranche 30.4. Polarity preservation invariant (cool stays cool, warm stays warm). nara-{dark,light,glass} variants tune M-tier and privacy-chrome only.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-colour-tokens.{json,ts,md}`; per-namespace export integrity test (every token resolves to a hex + light/dark variant); polarity preservation test (`signature.cool` light-mode and dark-mode are both cool-hued; `signature.warm` light-mode and dark-mode are both warm-hued); contrast minimum test (each foreground token against its background passes WCAG AA at 4.5:1 for body, 3:1 for large text); coordinate-derivation citation test asserts every token's MD entry cites its substrate source.

3. **30.3 — Motion grammar** *(spec-ahead-integration; cross-link 15.5, 15.6, 15.9, 19.11)*

   Author `Body/M/epi-theia/extensions/contracts/ui-motion-tokens.{json,ts,md}` + land design-primitive motion components.

   **Motion tokens:**

   - `epilogos.motion.profile-tick.duration` — derived from profile-tick advance cadence; **NOT a free parameter** — read from kernel-bridge `subscribeToProfileTick.intervalMs` per profile generation. Default fallback 500ms when bridge unavailable (per `bridge_unavailable` readiness state).
   - `epilogos.motion.profile-tick.easing` — `linear` (the tick IS the clock; no easing adds meaning).
   - `epilogos.motion.transition.lemniscate.{duration, easing, path}` — cosmic ↔ personal fold per 15.5. duration 600ms; easing `cubic-bezier(0.4, 0.0, 0.2, 1)`; path is the figure-eight lemniscate SVG path (cross-binding through (4,0) inflection point — the `#4` Lemniscate anchor made visible). Implementation in `LemniscateTransition` primitive.
   - `epilogos.motion.tick.slerp.{angularStep, choreography, kleinBoundaryTick}` — per 15.9 single primitive. `angularStep = 30°` (360° SO(3) / 12 ticks); `kleinBoundaryTick = 5` (Hopf-fibre flag flip at tick 5→6 boundary); `choreography` = quaternion-array reference (`RING_QUATERNION_LUT[12]`). Implementation in `SlerpChoreographyClock` primitive providing the single subscription point.
   - `epilogos.motion.flow.streamline.advance` — DR streamline per-tick advance (one position per tick along the 6-element ring). Animation: 200ms per tick advance, easing `ease-out`. Implementation reads from `MathemeHarmonicProfile.ananda_vortex.dr_ring_*` driven by profile-tick.
   - `epilogos.motion.klein-flip.{flagDuration, crossfadeMs}` — Hopf-fibre flag flip animation at tick 5→6: flag rotates 180° over `flagDuration = 300ms`; active Ananda matrix cross-fades to dual over `crossfadeMs = 500ms`.
   - `epilogos.motion.flow-watcher.debounceMs` — Khora flow-watcher debounce per 19.11; default 2000ms; consumed by `chronos.tranche.complete.quiet` event scheduling.

   **Design primitives:**

   - `Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/lemniscate-transition.tsx` — wraps any composition surface; renders the lemniscate fold on `cmd-period` per 15.5. Per `prefers-reduced-motion`: collapse to 100ms snap (per DR-WC-DL-4).
   - `Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/slerp-choreography-clock.tsx` — single subscription point to kernel-bridge `subscribeToProfileTick`; exposes `useSlerpClock(): {tick12, position6, slerpFraction, kleinAtBoundary, hopfFlagFlipped}` React hook consumed by every tick-driven widget. **No widget subscribes to profile-tick independently** — they all go through this hook (the 15.9 single-primitive discipline operationalised).
   - Per Foundation Principle 2 (profile-tick as primary clock): NO `requestAnimationFrame` / `setInterval` in M-extension `src/`. Lint enforced per Tranche 30.11.

   Verification: `pnpm --filter @pratibimba/integrated-composition build` clean; primitive presence test asserts `LemniscateTransition` + `SlerpChoreographyClock` exported; single-subscription audit `! grep -rnE 'requestAnimationFrame|setInterval|setTimeout' Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii,plugin-integrated-1-2-3,plugin-integrated-4-5-0}/src/` returns zero hits (except in `m1-paramasiva-played-torus` where Bevy/wgpu owns the render loop per 22.2); reduced-motion test asserts continuous-motion paused under `prefers-reduced-motion: reduce`.

4. **30.4 — Light/dark theme mapping** *(spec-ahead-integration; cross-link 15.0 foundation 8, omnipanel-shell `resolveTheme.ts`)*

   Per-token light/dark variants emitted in `ui-colour-tokens.json` (Tranche 30.2). The seven canonical themes (`dark`, `light`, `glass`, `discause`, `nara-dark`, `nara-light`, `nara-glass`) each receive a per-token resolution rule. Consume `omnipanel-shell/src/browser/theme/resolveTheme.ts` `resolveThemeForDomain(theme, domainId)` as the existing remap convention — design-system extends it through per-token resolution at consumption time (`epilogos.colour.X.value(theme)` returns the per-theme hex).

   **Cl(4,2) polarity preservation invariant:** cool tokens (`signature.cool`, `psyche-facet.nous`) stay cool across theme inversion; warm tokens (`signature.warm`, `flow.mahamaya_gold`, `psyche-facet.sophia`, `psyche-facet.mythos`) stay warm. Dark-mode cool tokens lean toward slate-blue; light-mode cool tokens lean toward steel-indigo. Dark-mode warm tokens lean toward ember/saffron; light-mode warm tokens lean toward gold/amber. The polarity binary is meaning-bearing per `M1-2-ANANDA-VORTEX-ARCHITECTURE.md §5`; theme switch maps WITHIN polarity, never across.

   **nara-domain remap:** when `domainId === 'm4'` and theme ∈ {`nara-dark`, `nara-light`, `nara-glass`}, M-tier tokens (`family.m.*`) and privacy-class tokens (`privacy.*`) tune slightly warmer (earth-toned bias) per UX intent. Per `resolveTheme.ts` legacy mappings `nara-forest → nara-dark` etc. honoured.

   Implementation: `Body/M/epi-theia/extensions/contracts/ui-theme-mapping.ts` provides `resolveToken(tokenId, theme, domainId): string` consuming `resolveThemeForDomain`. Every M-extension imports through `m-extension-runtime` (avoiding direct theming dependency).

   Verification: per-token light/dark resolution test for all 7 themes; polarity preservation test for cool/warm token pairs; nara-domain remap test for M4 surface; legacy theme mapping test (`nara-forest → nara-dark` etc.).

5. **30.5 — Accessibility contracts** *(doc-ahead-landing + spec-ahead-integration; cross-link 15.9 a11y note, 15.0 foundation 8)*

   Author `Body/M/epi-theia/extensions/contracts/ui-accessibility.{ts,md}` declaring binding a11y contracts:

   - **Focus-ring contract:** every interactive element renders a visible focus ring at minimum 2px outline; outline colour binds `epilogos.colour.family.<consumer-family>.<archetype>` (focus inherits family-tier identity). Theia default focus-ring (`--theia-focusBorder`) honoured as fallback when family context absent.
   - **Reduced-motion implementation (per DR-WC-DL-4 default):** `@media (prefers-reduced-motion: reduce)` disables continuous tick choreography (slerp pauses, DR streamlines freeze at last tick) but PRESERVES discrete state transitions (lemniscate toggle collapses to 100ms snap, layout switch instantaneous). The discrete-vs-continuous distinction matters: transitions communicate state change semantics; continuous animations communicate temporal flow that may not need to be visible.
   - **Screen-reader contract:** every visual-encoded datum carries text equivalent.
     - `CoordinateString` primitive: `aria-label` text equivalent of coordinate string + family-tier name (e.g. `[[M4-3]]` → `aria-label="M4 dash 3, subsystem family, nara"`).
     - `CodonString` primitive: `aria-label` codon + amino acid name (e.g. `AUG` → `aria-label="A U G, methionine, start codon"`).
     - `HexagramString` primitive: `aria-label` hexagram number + name + lines (e.g. `䷀` → `aria-label="Hexagram 1, the Creative, six solid lines"`).
     - `SymbolicCoordinateString` primitive (Verifier-emitted): `aria-label` decomposes to component parts (e.g. `#R0-0/1/A-T7-pending?` → `aria-label="R-virtue 0, lens 0 slash 1 axis A, action archetype 7, pending question"`).
     - Cl(4,2) signature visual cue: `aria-label="signature minus one, cool indigo"` or `aria-label="signature plus one, warm amber"`.
     - Profile-tick state change: `aria-live="polite"` announcement on tick advance carrying `tick12 / 11` (rate-limited to one announcement per second to avoid screen-reader spam).
   - **Pause/scrub keybindings:** `space` toggles tick choreography pause/resume; `shift-left` / `shift-right` scrubs by tick (calls `bridge.requestScrubToTick`). Per 15.9 a11y note.
   - **Colour-contrast minimums:** WCAG 2.1 AA: 4.5:1 for body text, 3:1 for large text (>= 18px or >= 14px bold), 3:1 for UI components and graphical objects. Asserted at token-emission lint (Tranche 30.11) — any foreground/background combination fails the lint if below minimum.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-accessibility.ts`; focus-ring presence test against every interactive element in `m-extension-runtime` + `integrated-composition` design primitives; reduced-motion test asserts `prefers-reduced-motion: reduce` pauses slerp while preserving lemniscate transition (at 100ms); screen-reader smoke test asserts each design-primitive renders `aria-label` containing the text equivalent; keybinding registration test asserts `space` and `shift-left/right` registered globally; contrast minimum test enumerates every token-pair and asserts WCAG AA.

6. **30.6 — Empty / loading / pending / blocked state grammar** *(spec-ahead-integration + no-orphan-fill; cross-link 15.6 + 07-t0 readiness taxonomy)*

   Land state-grammar design primitives at `Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/`:

   - **`EmptyState`** — rendered when a binding has no data AND no readiness blocker (e.g. day calendar shows no journal entries for selected day, but bridge is ready). Renders: family-tier illustration (per consumer's family-letter via Tranche 30.9 iconography), onboarding hint text (consumer-provided), optional call-to-action. Token-bound: `epilogos.colour.family.<letter>.<archetype>` for tint; `epilogos.typography.body.base` for hint text; `epilogos.spacing.composition.surface.margin` for padding.
   - **`LoadingPulse`** — rendered when a binding is awaiting data AND bridge is ready (e.g. RPC call in flight). Renders: family-tier subtle pulse (200ms-period opacity 0.5↔1.0 fade) honouring profile-tick when bridge available (the pulse advances in sync with `tick12`), falling back to local 200ms timer ONLY when `bridge_unavailable`. Per Foundation Principle 2: when bridge available, NO local timer.
   - **`PendingBadge`** — rendered when readiness state is `degraded` severity or any pending-id. Renders: small inline badge with id label (e.g. `pending: klein_flip_state`), bound to `epilogos.colour.readiness.id.<id>` token (per-id semantic colour, not generic amber). Hover-tooltip shows kernel-bridge `readiness.reasons[id]` plus `ownerTrack` (the user can identify which track owns the missing field).
   - **`BlockedOverlay`** — rendered when readiness state is `blocked` severity. Renders: full-overlay covering the consumer surface with reason text from readiness packet + `ownerTrack` call-to-action button (e.g. for `bridge_unavailable`: "Reconnect to kernel bridge"; for `s5_review_blocked`: "Open Review tab" with deep-link to OmniPanel Review tab per 15.2). Token-bound: `epilogos.colour.readiness.id.<id>` for border-and-tint; severity-band `blocked` as background-overlay alpha.
   - **`ReadinessIndicator`** — small status chip (8x8 dot or 16x16 icon depending on consumer mode), rendered alongside or within any binding to surface its readiness state without a full badge. Per-id colour from `epilogos.colour.readiness.id.<id>`. Hover-tooltip carries id + reason + ownerTrack.

   Every primitive consumes `SharedBridgeAdapter.subscribeToReadiness` from `m-extension-runtime` and `epilogos.colour.readiness.*` tokens from `ui-colour-tokens.ts`. No primitive owns state.

   Per Foundation Principle 3 (provenance always visible): every datum binding in every M-extension MUST render one of: `ProvenanceBorder`, `PendingBadge`, `BlockedOverlay`, `ReadinessIndicator`. Lint enforces consumption at Tranche 30.11.

   Verification: per-primitive widget test against synthetic readiness packets for each of the nine readiness ids in `contracts/07-t0-extension-contract-preflight.json` (9 × 5 primitives = 45 test cases); reason-routing test asserts hover-tooltip surfaces `ownerTrack`; deep-link test asserts `BlockedOverlay` call-to-action routes correctly (e.g. `s5_review_blocked` opens OmniPanel Review tab); consume-not-fork lint asserts no extension reimplements badge/overlay locally.

7. **30.7 — Highlight category register canonical set** *(spec-ahead-integration; cross-link 11.10, 11.11, 19.11)*

   Promote 11.11's ten-category register to canonical `HighlightCategoryRegistry` shared at `Body/M/epi-theia/extensions/integrated-composition/src/common/highlight-category-registry.ts`. Define per category:

   ```ts
   export type HighlightCategoryId =
     | 'daily-note' | 'oracle' | 'dream' | 'expand'        // user-side (4)
     | 'recognition' | 'prospective-surfacing'             // agent-side (6)
     | 'retrospective-surfacing' | 'kairos-touch'
     | 'somatic-mark' | 'live-spread';

   export interface HighlightCategoryEntry {
     id: HighlightCategoryId;
     side: 'user' | 'agent';
     colourToken: string;                            // 'epilogos.colour.highlight-category.<id>'
     semanticMeaning: string;                        // human-readable
     allowedSourceExtensions: string[];              // e.g. user-side: ['m4-nara'] only; agent-side: ['s4-3p-chronos', 's4-0p-khora', 's4-5p-aletheia']
     floatingMenuEligible: boolean;                  // true for user-side only
     archetypeAffinity?: number;                     // optional #0–#5 / 3/5/7/9 alignment
   }

   export const HIGHLIGHT_CATEGORY_REGISTRY: Record<HighlightCategoryId, HighlightCategoryEntry>;
   ```

   The registry IS the single source of truth consumed by:
   - `m4-nara/src/browser/editor/extensions/highlight-mark.ts` (per 11.10/11.11) — replaces local enum
   - `s4-3p-chronos/extension.ts::chronos_response_orbit` (per 19.11) — replaces local category constant
   - `s4-0p-khora/extension.ts::khora_write_highlighted_inscription` (per 19.11) — replaces local category constant
   - Any future surface needing the category language

   The alignment between 11.11 highlight categories AND 19.11 chronos response orbit IS structural (the orbit IS the inscription; an `immediate` orbit writes a `recognition` highlight; a `next-morning` orbit writes a `retrospective-surfacing` highlight; etc.) — promoting to a shared registry codifies the alignment.

   Verification: `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/highlight-category-registry.ts`; registry export integrity test asserts all 10 entries present with required fields; consumer-presence test asserts m4-nara highlight-mark and chronos/khora extensions import from registry (not local constants); FloatingMenu-eligibility test asserts user-side categories enter FloatingMenu and agent-side categories do not.

8. **30.8 — Family-letter palette derivation** *(spec-ahead-integration + contradiction-decision; sources DR-WC-DL-1; cross-link M'-SYSTEM-SPEC, 15.0 foundation 1)*

   Author `Body/M/epi-theia/extensions/contracts/ui-family-palette-derivation.md` documenting the per-tier derivation with explicit citation to M'-SYSTEM-SPEC. The derivation:

   - **P-tier (Position) foundation-neutral** — Position is the most-primal coordinate family (P0 Ground / P1 Definition / P2 Operation / P3 Pattern / P4 Context / P5 Integration). Visually: near-greyscale with subtle warmth grade as archetype ascends; grade 0 = neutral-50 cool-grey (P0 Ground); grade 5 = neutral-700 warm-grey (P5 Integration, leaning toward the Möbius-return). Rationale: P is the foundation that precedes hue.
   - **S-tier (Stack) substrate-slate** — Stack is technology layers (S0 Terminal / S1 Obsidian / S2 GraphDB / S3 Gateway / S4 Agent Runtime / S5 Integral World). Visually: cool grey-blue base. Grade by depth: S0 = darkest slate, S5 = lightest slate. Rationale: substrate is structural; slate carries the "structural cool" without hue commitment.
   - **T-tier (Thought) thought-parchment** — Thought is artifacts/cognition (T0 Seed / T1 Spec / T2 Form / T3 Process / T4 Pattern / T5 Insight). Visually: warm cream / parchment base. Grade by maturity: T0 = palest cream (seed), T5 = aged-vellum (insight). Rationale: thought-artifacts are inscribed; parchment is the canonical inscription medium.
   - **M-tier (Subsystem) subsystem-saturated** — Subsystem is consciousness domains (M0 Anuttara / M1 Paramasiva / M2 Parashakti / M3 Mahamaya / M4 Nara / M5 Epii). Visually: per-archetype saturated hue. M0 indigo (recognition-void), M1 amber (spanda-pulse), M2 violet-tattva (vibration-shakti), M3 gold (codon-arcana), M4 earth-slate-gold (lived-personal triplet per 25.18), M5 amber-EBM (resonance-energy). Each is a distinct hue family because each subsystem owns a distinct consciousness modality — they are NOT graded along one axis. The #0–#5 grade WITHIN each M-tier hue (e.g. M3-0 pale gold → M3-5 deep gold) preserves archetype-position grading.
   - **L-tier (Lens) epistemic-mist** — Lens is epistemic modes (L0 Literal / L1 Functional / L2 Structural / L3 Archetypal / L4 Paradigmatic / L5 Integral). Visually: cool faded blue mist. Grade by depth: L0 = palest blue (literal surface), L5 = deepest blue (integral synthesis). Rationale: lenses are translucent epistemic apertures; mist carries the "see-through" quality.
   - **C-tier (Category) ontological-deep-violet** *(per DR-WC-DL-1 default; routes to user final-validation)* — Category is ontological foundation (C0 Bimba / C1 Form / C2 Entity / C3 Process / C4 Type / C5 Pratibimba). Visually: deep violet. C0 (Bimba) and C5 (Pratibimba) are the violet endpoints sharing Cl(4,2) signature −1 polarity (cool); C1–C4 grade through warmer violet variants (closer to magenta). Rationale: C-tier carries the ontological depth; deep-violet is the colour of unmanifest-becoming-manifest. **DR-WC-DL-1 alternative reading (C-tier as foundation-neutral, hueless)** rejected at default level because C-tier is the most-mediated category (ontological foundation IS a strong claim) — the tier deserves a strong hue, not absence-of-hue.

   Per-tier × per-archetype grade (36 tokens) emitted as `epilogos.colour.family.{letter}.{archetype}` in Tranche 30.2.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-family-palette-derivation.md`; per-tier × per-archetype token export integrity test (36 entries); coordinate-string renderer test asserts `[[M3-2]]` carries M-tier × archetype-2 grade tint (gold-mid-saturation); decision register entry DR-WC-DL-1 documents the default + alternative.

9. **30.9 — Iconography system** *(spec-ahead-integration; cross-link 15.3 left-sidebar modes, 15.5 coin-flip, 15.0 foundation 8)*

   Author `Body/M/epi-theia/extensions/contracts/ui-iconography.{ts,md}` declaring the icon set + emit SVG assets at `Body/M/epi-theia/extensions/contracts/icons/`. The contract:

   - **Activity-bar mode icons (5 custom + Codicons fallback per 15.3):**
     - `coordinate-tree.svg` — branching tree with coordinate-marker nodes (e.g. small `M4-3` label)
     - `bimba-graph-viewer.svg` — three-rendering icon (graph + solar + tree convergent)
     - `canon-studio.svg` — markdown rendering glyph (text + structured-marker)
     - `backend-studio.svg` — Theia rust-analyzer / LSP convergent glyph (cog + code)
     - `smart-connections.svg` — semantic-link glyph (linked nodes with halo)
   - **Coin-flip glyph for 0/1 toggle (per 15.5):** `coin-flip.svg` — coin in motion mid-flip, showing 0 face and 1 face simultaneously (representing the lemniscate fold). Embedded in title-bar chrome per 15.5.
   - **Lemniscate glyph for transition primitive:** `lemniscate.svg` — figure-eight ∞ with subtle gradient marking the cross-binding point (the `#4` Lemniscate anchor visible). Used by `LemniscateTransition` primitive (Tranche 30.3) as default glyph.
   - **Per-Mn family glyphs (6 SVGs):** `family-m0-anuttara.svg` (void/recognition), `family-m1-paramasiva.svg` (Spanda/pulse), `family-m2-parashakti.svg` (cymatic/vibration), `family-m3-mahamaya.svg` (wheel/codon), `family-m4-nara.svg` (vessel/personal), `family-m5-epii.svg` (recursion/atelier). Each is a minimal monoline glyph derivable to single-colour at any size.
   - **Per-family-letter glyphs (6 SVGs):** `family-p.svg`, `family-s.svg`, `family-t.svg`, `family-m.svg`, `family-l.svg`, `family-c.svg` — used by `CoordinateString` primitive as inline family-tier marker (small 8x8 glyph preceding the coordinate text).
   - **Codicons fallback convention:** for any UI element not in the custom set, use Theia's Codicons. Documented icon→Codicon mapping in the MD spec.

   Iconography lands via Theia `IconThemeContribution` at `Body/M/epi-theia/extensions/integrated-composition/src/browser/icons-contribution.ts`. Activity-bar icons land via `widget.application-shell-left` activity-bar contribution per 15.3.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-iconography.ts`; per-SVG presence test asserts each icon resolves at multiple sizes (16, 24, 32); Theia icon-theme contribution test asserts each icon registers under expected id; activity-bar icon binding test asserts each mode-icon binds to its mode; CoordinateString family-glyph integration test asserts inline glyph renders per family-letter.

10. **30.10 — Provenance / coordinate-string / state design primitives canonical land** *(no-orphan-fill; cross-link 15.6, 21.x M0 verifier, 22.x M1 inspectors, 24.x M3 codon, 25.x M4 highlights, 26.x M5 verifier)*

    Land the **complete design-primitive shelf** at `Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives/`. Existing primitives from Tranche 30.3 + 30.6 plus the coordinate-rendering primitives from Tranche 30.13. Final shelf:

    ```
    integrated-composition/src/browser/design-primitives/
    ├── README.md                          # design-system overview, foundation principle alignment
    ├── matheme.tsx                        # KaTeX wrapper consuming typography tokens
    ├── coordinate-string.tsx              # [[wikilink]] renderer with family-tier tint
    ├── codon-string.tsx                   # AUG/UAA/CGU with amino-acid badge
    ├── hexagram-string.tsx                # ䷀ glyph with line-change overlay
    ├── symbolic-coordinate-string.tsx     # Verifier-emitted #R0-0/1/A-T7-pending? with R-virtue colour
    ├── provenance-border.tsx              # border-tint per readiness state
    ├── pending-badge.tsx                  # inline badge per pending-id
    ├── blocked-overlay.tsx                # full-overlay with reason + action
    ├── readiness-indicator.tsx            # small status chip
    ├── empty-state.tsx                    # family-tier illustration + hint
    ├── loading-pulse.tsx                  # family-tier pulse honouring profile-tick
    ├── lemniscate-transition.tsx          # cosmic↔personal fold primitive (Tranche 30.3)
    ├── slerp-choreography-clock.tsx       # single tick-subscription primitive (Tranche 30.3)
    ├── highlight-category-registry.ts     # shared 10-category registry (Tranche 30.7)
    ├── icons-contribution.ts              # Theia IconThemeContribution (Tranche 30.9)
    └── index.ts                           # public exports
    ```

    Every M-extension imports through `@pratibimba/integrated-composition/design-primitives` — NO local reimplementation. CI lint at Tranche 30.11 enforces consumption.

    Cross-cutting consumption examples (binding contracts):
    - 21.x M0 verifier-coherence renders coherence score via `ProvenanceBorder` + `ReadinessIndicator` (replaces local colour band L360)
    - 21.x M0 layer-selector pill renders via `PendingBadge` per `layerReadiness` (replaces local 8-state palette L681 — instead consume `provenance-pill.*` tokens)
    - 22.x M1 inspectors render Cl(4,2) signature via `epilogos.colour.signature.*` tokens (replaces local hex L119)
    - 22.x M1 vortex matrices browser renders DR cells via `epilogos.colour.flow.*` tokens (replaces local gold/emerald hex L211)
    - 23.x M2 cymatic engine renders tattva palette via `epilogos.colour.element.*` tokens (replaces local hex L65, L120)
    - 24.x M3 wheel renders suit-elements via `epilogos.colour.element.*` (replaces local L249); readiness chip via `ReadinessIndicator` (replaces local L500)
    - 25.18 M4 privacy chrome consumes `epilogos.colour.privacy.*` tokens (replaces inline hex)
    - 26.x M5 EBM observatory renders tritone overlay via `epilogos.colour.signature.cool` + `epilogos.colour.signature.warm` + `epilogos.colour.flow.parashakti_emerald` (replaces local A indigo / B amber / C emerald hex L67); psyche-facet badges via `epilogos.colour.psyche-facet.*` (replaces local palette L167); SkeletonEvents via `epilogos.colour.flow.mahamaya_gold` + `epilogos.colour.flow.parashakti_emerald` (replaces local gold/emerald L272)
    - 11.10/11.11 m4-nara highlight-mark consumes `HighlightCategoryRegistry`
    - 19.11 chronos response-orbit consumes `HighlightCategoryRegistry`

    Verification: shelf presence test asserts every primitive file exists with public export; `! grep -rnE 'border-left.*solid.*#[0-9a-fA-F]{3,6}|pending-badge|blocked-overlay|readiness-chip' Body/M/epi-theia/extensions/{m0,m1,m2,m3,m4,m5}*/src/` (local variants rejected); consumer-presence test asserts every M-extension imports at least one primitive from `@pratibimba/integrated-composition/design-primitives`; coordinate-string family-tier-tint integration test asserts every `[[wikilink]]` render carries the family-letter token.

11. **30.11 — Design tokens emission and consume-not-fork lint** *(spec-ahead-integration; cross-link 30.2, 30.3, 30.10)*

    Author the canonical token bundle at `Body/M/epi-theia/extensions/contracts/ui-design-tokens.{json,ts,md}` consolidating Tranches 30.1 (typography) + 30.2 (colour) + 30.3 (motion) into one machine-readable JSON + typed TS exports + human-readable MD spec. Format: W3C Design Tokens Community Group draft. Each token carries: `$value` (per-theme hex / size / duration), `$type` (colour / dimension / duration / cubicBezier), `$description` (semantic meaning + coordinate-system derivation citation).

    Token namespace tree (final):

    ```
    epilogos.
      colour.
        family.{p,s,t,m,l,c}.{0..5}              # 36 tokens
        signature.{cool, warm}                    # 2 tokens
        flow.{mahamaya_gold, parashakti_emerald}  # 2 tokens
        highlight-category.<10 entries>           # 10 tokens
        element.<6 entries>                       # 6 tokens
        psyche-facet.<7 entries>                  # 7 tokens
        privacy.<3 entries>                       # 3 tokens
        mode-chip.<3 entries>                     # 3 tokens
        readiness.severity.<3 entries>            # 3 tokens
        readiness.id.<9 entries>                  # 9 tokens
        status-bar.<6 entries>                    # 6 tokens
        provenance-pill.<8 entries>               # 8 tokens
      typography.
        heading.{1,2,3,4}                         # 4 tokens
        body.{base, small}                        # 2 tokens
        caption                                   # 1 token
        mono.{default, coordinate, codon, hexagram} # 4 tokens
        matheme.{block, inline}                   # 2 tokens
      motion.
        profile-tick.{duration, easing}           # 2 tokens
        transition.lemniscate.{duration, easing, path} # 3 tokens
        tick.slerp.{angularStep, choreography, kleinBoundaryTick} # 3 tokens
        flow.streamline.advance                   # 1 token
        klein-flip.{flagDuration, crossfadeMs}    # 2 tokens
        flow-watcher.debounceMs                   # 1 token
      spacing.
        composition.{bento.gap, bento.padding, surface.margin} # 3 tokens
      elevation.
        surface.{level0, level1, level2, level3}  # 4 tokens
    ```

    **Total: ~126 tokens.** All derive from coordinate-system concepts or Theia substrate.

    **Consume-not-fork lint** at `Body/M/epi-theia/extensions/scripts/validate-design-token-consumption.mjs`:

    ```javascript
    // pseudocode contract
    const FORBIDDEN_PATTERNS = [
      /#[0-9a-fA-F]{3,6}/,                          // raw hex codes
      /font-size:\s*\d+(px|rem|em)/,                 // hardcoded font-sizes
      /(transition|animation)(-duration)?:\s*\d+m?s/, // hardcoded animation durations
      /requestAnimationFrame|setInterval|setTimeout/, // parallel animation timers (per 15.9)
    ];
    const ALLOWED_FILES = [
      'contracts/ui-*.{ts,json,md}',                 // the token sources themselves
      'integrated-composition/src/browser/design-primitives/**/*', // primitives implement tokens
      '**/style/index.css',                          // Theia CSS-var fallbacks (`var(--theia-X, #fallback)`)
    ];
    // fail when any FORBIDDEN_PATTERN matches outside ALLOWED_FILES
    ```

    Test at `Body/M/epi-theia/extensions/test/validate-design-token-consumption.test.mjs` asserts the lint catches violations and passes on a clean tree.

    Per-extension package.json adds `"contributes": { "uiDesignTokenAdherence": true }` declaring the consumption contract. Extension contract preflight validator at `validate-extension-contract-preflight.mjs` is extended to require the flag (mirroring 15.1 `uiFoundationPrincipleAdherence` pattern).

    Verification: `node Body/M/epi-theia/extensions/scripts/validate-design-token-consumption.mjs` passes against current substrate after Tranche 30.10 migrations; `node --test Body/M/epi-theia/extensions/test/validate-design-token-consumption.test.mjs` passes; per-token export integrity test asserts every namespaced token resolves to a complete entry (`$value`, `$type`, `$description`).

12. **30.12 — Composition design rules** *(doc-ahead-landing; cross-link 15.4, 07.x integrated 1-2-3, 08.x integrated 4-5-0)*

    Author `Body/M/epi-theia/extensions/contracts/ui-composition-rules.md` documenting composition-over-juxtaposition contract per 15.4. The rules:

    - **Single-surface composition (per 15.4):** integrated plugins compose three M-extensions into ONE editor-area composition surface. Cosmic 1-2-3 composes M1 K² torus + M2 cymatic engine + M3 codon-rotation as ONE geometric composition (K² holds the lens-ring; M2 renders frequencies on the K² surface; M3 projects codon-rotation onto lens-ring cells). Personal 4-5-0 composes M4 journal + M5 Mahamaya recognition + M0 Möbius-return as ONE geometric composition (Nara journal at left composition slot; personal cymatic field (Hopf-linked tori at personal scale) at center; Mahamaya recognition layer at right composition slot — but ALL THREE OVER THE SAME SURFACE not as three panes).
    - **Bento grid spacing tokens:** `epilogos.spacing.composition.bento.gap = 16px`, `epilogos.spacing.composition.bento.padding = 24px`, `epilogos.spacing.composition.surface.margin = 32px`. Bento elements share gap; surface margins frame the composition.
    - **Three-pane juxtaposition is the antipattern (per 15-foundation 6):** any plugin contributing three side-by-side widgets to the editor area FAILS composition validation. Composition-contract preflight (`08-t0`) extends to assert single-surface composition for integrated plugins.
    - **Editor-area geometric composition primitives:** the M1 played-torus, M2 cymatic-engine, and M3 codon-rotation each contribute a "geometric composition layer" (texture / heatmap / overlay) NOT a "widget body". The integrated plugin owns the composition surface; M-extensions contribute layers.
    - **No three-pane juxtaposition in editor area:** lint asserts `plugin-integrated-{1-2-3,4-5-0}/src/` does not contain three peer-widget contributions.

    Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-composition-rules.md`; `! grep -rnE 'three-pane|side-by-side widget|panel-side-(left|right|center)' Body/M/epi-theia/extensions/plugin-integrated-*/src/`; composition-contract preflight test (extension of `validate-composition-contract-preflight.test.mjs`) asserts integrated plugins declare exactly one editor-area composition surface (not three).

13. **30.13 — Coordinate-string rendering convention** *(spec-ahead-integration + no-orphan-fill; cross-link 30.10, 30.1, 30.8)*

    Land canonical coordinate-string renderers as part of the design-primitive shelf (Tranche 30.10). Each renderer is a small typed React component consuming tokens:

    - **`CoordinateString`** at `coordinate-string.tsx`:
      ```tsx
      <CoordinateString value="M4-3" />
      // renders: family-glyph + monospace text in family-tier tint
      // → consumes epilogos.typography.mono.coordinate + epilogos.colour.family.m.3
      // → aria-label="M4 dash 3, subsystem family, nara"
      ```
      The renderer parses the `[[wikilink]]` syntax (optional `[[` `]]` brackets), extracts family-letter + archetype-position, looks up the family-tier token, and renders monospace + tinted + inline family-glyph (per 30.9).
    - **`CodonString`** at `codon-string.tsx`:
      ```tsx
      <CodonString value="AUG" />
      // renders: monospace codon + amino-acid badge (Met) + STOP-codon indicator if applicable
      // → consumes epilogos.typography.mono.codon
      // → aria-label="A U G, methionine, start codon"
      ```
      Consumes `M3_CODON_TO_AA[64]` via gateway RPC `s2.codon.aa_lookup`. Badge colour from `epilogos.colour.family.m.3` (M3 codon family).
    - **`HexagramString`** at `hexagram-string.tsx`:
      ```tsx
      <HexagramString value={1} lineChange={[false, false, true, false, false, false]} />
      // renders: 16px hexagram glyph + optional line-change overlay
      // → consumes epilogos.typography.mono.hexagram
      // → aria-label="Hexagram 1, the Creative, line 3 changing"
      ```
      Glyph lookup via `HEXAGRAM_UNICODE_LUT[64]` (added to typography spec as Unicode reference). Line-change overlay rendered as small dashes alongside the glyph.
    - **`SymbolicCoordinateString`** at `symbolic-coordinate-string.tsx`:
      ```tsx
      <SymbolicCoordinateString value="#R0-0/1/A-T7-pending?" />
      // renders: decomposed token-segments each tinted per its sub-coordinate type
      // → consumes epilogos.typography.mono.coordinate + epilogos.colour.family.*
      // → aria-label="R-virtue 0, lens 0 slash 1 axis A, action archetype 7, pending question"
      ```
      Parses Verifier-emitted symbolic-coordinate-strings per Tranche 1.11 convention. R-virtue prefix tinted per `epilogos.colour.family.l.0` (epistemic-mist); archetype-position per `epilogos.colour.family.m.<n>`; `pending?` suffix as italicised query.

    All four primitives carry `aria-label` per Tranche 30.5 accessibility contract.

    Verification: per-primitive widget test against synthetic value strings; family-tier tint test asserts correct token consumption; STOP-codon indicator test for `CodonString` ('UAA' → STOP indicator); line-change overlay test for `HexagramString`; symbolic-coordinate decomposition test for `SymbolicCoordinateString` (Verifier-emitted string parses correctly); consume-not-fork lint (per 30.11) asserts no M-extension renders coordinates / codons / hexagrams locally.

14. **30.14 — Visual regression baseline catalog** *(doc-ahead-landing; cross-link 15.12, DR-WC-DL-5)*

    Author `Body/M/epi-theia/extensions/contracts/ui-visual-regression-catalog.md` listing per-fixture: owning extension, what state is captured, update procedure, diff threshold. Per DR-WC-DL-5 default scope: cross-cutting primitives + per-extension flagship fixture (~30 total).

    Track 44.9 binds the [[m5-prime-pratibimba-surface-standard]] into this design-language layer: `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md` names the Surface-Standard dependency on the token/typography/motion/accessibility/composition contracts, and `acceptance-harness/fixtures/visual-regression/block-host-widget/` is the G8 `BlockHostWidget` baseline family.

    **Cross-cutting primitive fixtures (15 fixtures):**
    - `provenance-border-{ready,degraded,blocked}` (3) — each readiness severity band
    - `pending-badge-each-id` (9 fixtures combined as one paged catalog page — covers all 9 readiness ids)
    - `blocked-overlay-with-reason` (1) — synthetic blocked state with `s5_review_blocked` reason
    - `lemniscate-transition-frames` (1) — frame-by-frame capture of the cosmic↔personal fold
    - `slerp-choreography-12-ticks` (1) — frame-by-frame capture of the 12-tick K² orientation cycle including Klein boundary at 5→6

    **Per-extension flagship fixtures (~15 fixtures):**
    - `m0-anuttara-verifier-coherence` (M0 9-bit witness panel) — captures readiness-driven layer-selector
    - `m1-paramasiva-played-torus-default` (15.8 K² + DR streamlines + Cl(4,2) halo) — the cosmic-1-2-3 flagship
    - `m1-paramasiva-tritone-square-overlay` (M5 tritone overlay) — Klein V₄ overlay rendering
    - `m2-parashakti-cymatic-plate-default` (23.x cymatic plate) — Klein-flip pre/post
    - `m2-parashakti-72-fold-breadcrumb` (23.7) — hexagram→half-decan→...→body-zone breadcrumb
    - `m3-mahamaya-wheel-default` (24.x) — 360° codon wheel with active position highlighted
    - `m3-mahamaya-tarot-deck-default` (24.x) — Major + Minor arcana with active card
    - `m4-nara-ambient-strip-default` (11.12) — Klein weighting + somatic signature + live spreads
    - `m4-nara-canvas-with-highlights` (11.10 + 11.11) — Tiptap canvas with all 10 highlight categories rendered
    - `m4-nara-session-close-ceremony` (25.19) — wisdom-delta + XOR + 4 contemplation seeds + virtue witness
    - `m5-epii-resonance-grid` (26.1) — 72-dim resonance grid with tritone overlays
    - `m5-epii-spine-789-reading` (26.x) — 7-8-9 spine reading at session close
    - `omnipanel-dispatch-trace` (15.11) — Pi→Anima→subagent tree
    - `daily-0-1-layout-cosmic-side` (composition surface)
    - `daily-0-1-layout-personal-side` (composition surface)

    Each fixture: owning extension's `test/visual-regression/<fixture-id>/` directory; baseline image; diff threshold 0.02 (2% pixel-diff tolerance). Update procedure: fixture changes require visual review + commit of new baseline.

    Verification: `pnpm --filter @pratibimba/acceptance-harness test:visual` passes for catalog entries; fixture-presence test asserts each catalog entry has a baseline in `acceptance-harness/fixtures/visual-regression/<fixture-id>/baseline.png`; catalog-completeness test asserts every cross-cutting primitive has a fixture and every M-extension has at least one flagship fixture.

---

**End of Track 30.** The design-language substrate is **rich at the fragment level** (every palette / motion / state choice already exists in stage-1) and **structurally unified at the cross-cutting level** by Track 30's eight contracts + design-primitive shelf + token bundle + consume-not-fork lint. The fourteen tranches close the gap between "the fragments exist" (stage-1 truth) and "the design system exists as one binding contract" (Track 30 truth). Foundation Principles 2 (profile-tick clock), 3 (provenance visible), 6 (composition over juxtaposition), and 8 (Theia conventions) become enforceable, not aspirational. Five decisions go to DR-WC-DL-1 through DR-WC-DL-5 (Track 13 register).

Every chromatic, typographic, and motion choice in the design system derives from a coordinate-system concept. Cl(4,2) signature → cool/warm colour-binary. DR_RING_MAHAMAYA / DR_RING_PARASHAKTI → gold/emerald flow streamlines. Family-letter (P/S/T/M/L/C) → palette tier. #0–#5 raw archetype position → grade-within-tier. Profile-tick → global render clock (single-primitive discipline). Highlight category → archetype-aligned inscription register. Privacy class → M4-protected-local chrome. Psyche-facet → constitutional-agent function. Tattva element → L2' canonical element vocabulary. Readiness id → kernel-bridge ledger semantic colour. Status-bar entry → 15.10 six-entry canon. The matheme `0/1 = 4+2 = 5→0 = 0/1` is structurally honoured: `0/1` (signature polarity binary) carries the chromatic axis; `4+2` (the K² six-position cycle) carries the motion grammar; `5→0` (Möbius return) carries the family-tier C-endpoint topology; the loop closes with `= 0/1` (the polarity invariant preserved across the cycle).

Decoration without derivation is rejected at lint time. Ontology is lived-conception is living-code is rendered-design.
