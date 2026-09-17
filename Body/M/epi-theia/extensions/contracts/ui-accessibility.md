# Epi-Logos UI Accessibility Contract

This contract binds accessibility requirements for the [[M']] Theia design-language layer. It consumes [[THEIA-UI-PATTERNS-ARCHITECTURE]], Track 15 foundation principle 8 (Theia conventions where they fit), Track 15.9 tick-choreography accessibility, and DR-WC-DL-4 reduced-motion defaults.

## Focus Ring

Every interactive element must render a visible focus ring.

- Minimum outline: `2px solid`.
- Outline offset: `2px`.
- Colour: `epilogos.colour.family.<consumer-family>.<archetype>`.
- Fallback when family context is absent: `var(--theia-focusBorder)`.
- Test scope: `m-extension-runtime/src/browser/**/*.{ts,tsx,css}` and `integrated-composition/src/browser/design-primitives/**/*.{ts,tsx,css}`.

The exported `focusRingContract()` and `focusRingCssRule()` functions are the harness surface. A focus-ring audit should enumerate `button`, anchors, form controls, role-based controls, and tabbable elements listed in `UI_ACCESSIBILITY_INTERACTIVE_SELECTOR`.

## Reduced Motion

Reduced motion follows DR-WC-DL-4:

- `@media (prefers-reduced-motion: reduce)` pauses continuous tick choreography.
- `slerp-choreography` pauses at the last delivered profile tick.
- DR streamlines freeze at the last delivered profile tick.
- Discrete state transitions are preserved because they communicate state change semantics.
- Lemniscate toggle collapses to a `100ms` snap.
- Layout switch is instantaneous (`0ms`).

The discrete-vs-continuous distinction is binding: transitions communicate state change, while continuous animations communicate temporal flow that may not need to remain visible.

## Screen Readers

Every visual-encoded datum carries a text equivalent through `aria-label`, except profile-tick announcements, which use `aria-live="polite"`.

| Primitive | Required equivalent |
| --- | --- |
| `CoordinateString` | Coordinate string plus family-tier name, e.g. `[[M4-3]]` -> `M4 dash 3, subsystem family, nara`. |
| `CodonString` | Codon plus amino acid name, e.g. `AUG` -> `A U G, methionine, start codon`. |
| `HexagramString` | Hexagram number, name, and lines, e.g. `䷀` -> `Hexagram 1, the Creative, six solid lines`. |
| `SymbolicCoordinateString` | Component decomposition, e.g. `#R0-0/1/A-T7-pending?` -> `R-virtue 0, lens 0 slash 1 axis A, action archetype 7, pending question`. |
| Cl(4,2) signature cue | `signature minus one, cool indigo` or `signature plus one, warm amber`. |
| Profile-tick state change | `aria-live="polite"` announcement carrying `tick12 / 11`, rate-limited to one announcement per second. |

The exported formatter functions are canonical for smoke tests:

- `formatCoordinateAriaLabel()`
- `formatCodonAriaLabel()`
- `formatHexagramAriaLabel()`
- `formatSymbolicCoordinateAriaLabel()`
- `formatCl42SignatureAriaLabel()`
- `profileTickLiveAnnouncement()`

## Pause And Scrub

Global keybindings:

- `space` -> `epilogos.tickChoreography.togglePause`.
- `shift+left` -> `epilogos.tickChoreography.scrubPrevious`, calling `bridge.requestScrubToTick`.
- `shift+right` -> `epilogos.tickChoreography.scrubNext`, calling `bridge.requestScrubToTick`.

The helper `scrubTickTarget(currentTick12, direction)` wraps the twelve-tick ring and gives the exact tick argument for `bridge.requestScrubToTick`.

## Contrast

WCAG 2.1 AA minimums:

- Body text: `4.5:1`.
- Large text (`>= 18px` or `>= 14px` bold): `3:1`.
- UI components: `3:1`.
- Graphical objects: `3:1`.

The exported `contrastRatio()`, `minimumContrastRatio()`, and `passesWcagAaContrast()` helpers are the Tranche 30.11 token-emission lint surface. The lint must enumerate foreground/background pairs from `ui-colour-tokens.json`; any pair below its required ratio fails.

## Harness Contract

`UI_ACCESSIBILITY_TEST_HARNESS` names the executable checks expected by this tranche:

- Focus-ring presence against every interactive element in `m-extension-runtime` and `integrated-composition` design primitives.
- Reduced-motion behavior: continuous slerp/streamline pause, discrete lemniscate/layout transitions preserved.
- Screen-reader smoke test for each design primitive listed above.
- Global keybinding registration for `space`, `shift+left`, and `shift+right`.
- Contrast minimum enumeration for every token pair emitted by the colour-token contract.
