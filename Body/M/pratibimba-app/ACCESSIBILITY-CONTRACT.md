# Accessibility Contract — `pratibimba-app`

Tranche `30.T30.5`. Carrier retarget of the frozen
`Body/M/epi-theia/extensions/contracts/ui-accessibility.{ts,md}`: the executable
half is `src/ui/accessibility.ts`, this file is its prose half. Every clause
below is machine-checked by `src/ui/accessibility.test.ts` unless it says
otherwise.

Original ledger status for this tranche was **quarantine**. Nothing here was
inherited from that claim; each clause was re-derived against the live carrier.

## 1. Focus-ring contract

Every interactive element renders a visible focus ring of at least
`FOCUS_RING_MIN_PX` (2) CSS pixels. The ring's colour binds the consumer's
family-tier identity where a family context exists (`ui/tokens.ts`
`coordinateFamilyGrade`), and falls back to `--ring` where it does not.

**Known gap, named not hidden.** Several carrier rules currently express focus
as a 1px `border-color` swap with `outline: none`
(`.face-toggle-button:focus-visible`, `.m0-coordinate-summary-card-open:focus-visible`,
`.m4-nara-floating-menu button:focus-visible`). That is a real indicator but it
is *below* this contract's 2px minimum. It is recorded here rather than silently
restyled: the affected surfaces belong to tranches 15.10 / 21.T21.17 / 25.x, and
a focus-ring sweep across their chrome is a visual change their owners should
make deliberately.

## 2. Reduced motion — DR-WC-DL-4

`@media (prefers-reduced-motion: reduce)` distinguishes two kinds of motion, and
the distinction is the point:

- **Continuous** motion communicates temporal *flow* — the profile-tick slerp,
  DR flow streamlines, ambient drift. Under `reduce` it stops entirely (0ms);
  streamlines freeze at their last tick.
- **Discrete** motion communicates a state *change* — the lemniscate face
  inversion, the Klein flip, the layout switch. Under `reduce` it is
  **preserved**, collapsed to a `REDUCED_MOTION_SNAP_MS` (100ms) snap. Removing
  it would remove the semantics of the transition itself. The layout switch is
  the one exception canon makes instantaneous.

`reducedMotionDurationMs(channel, fullMs, prefersReducedMotion)` is the single
resolver; `MOTION_KIND` is the classification.

## 3. Screen-reader contract

Every visually-encoded datum carries a text equivalent.

| Primitive | Text equivalent | State |
| --- | --- | --- |
| `CoordinateString` | spoken coordinate + family tier + archetype (`M4-3` → "M4 dash 3, subsystem family, nara") | **live** via `coordinateAriaLabel`; naming authority is `ui/coordinateNames.ts` |
| `CodonString` | codon + amino acid + start/stop (`AUG` → "Codon AUG, amino acid methionine, start") | **live**; identity comes from the real gateway codon lookup, never a browser LUT |
| Cl(4,2) signature cue | "signature minus one, cool indigo" / "signature plus one, warm amber" | **live** via `cl42SignatureAriaLabel` |
| Profile tick | `aria-live="polite"`, "tick N of 11", rate-limited to one per second | **live** via `createTickAnnouncer` |
| `HexagramString` | number + **name** + lines ("Hexagram 1, the Creative, six solid lines") | **partial — bounded** |
| `SymbolicCoordinateString` | decomposed reading of the verifier-authored address | **partial — bounded** |

**Why the last two are bounded rather than built.** Both need a vocabulary the
carrier does not own and must not invent:

- I-Ching hexagram **names** are M3 kernel law. The carrier has no
  hexagram-name authority and no gateway method returning one — writing a
  64-entry name table in `src/ui/` would put kernel law in M', the same
  violation `28.T28.4` refused for the frontmatter key-shape law.
- The symbolic-coordinate **grammar** (`#R0-0/1/A-T7-pending?` → "R-virtue 0,
  lens 0 slash 1 axis A, action archetype 7, pending question") is
  verifier-authored M0/Anuttara law, with no carrier-reachable surface.

`CodonString` shows the shape the fix takes when the authority exists: it reads
a real lookup and speaks what came back. Both gaps close the same way — a read
method, not a local table. Until then each primitive announces what it can
verify (`HexagramString` announces number and changing lines;
`SymbolicCoordinateString` announces the address) rather than announcing a name
it guessed.

## 4. Pause / scrub keybindings

`A11Y_KEYBINDINGS` declares the contract (15.9 a11y note): `space` toggles tick
choreography, `shift+left` / `shift+right` scrub by one tick. The declaration is
the contract surface; registration against the carrier's command registry and
the scrub transport belong to the tick-choreography owner.

## 5. Colour contrast — WCAG 2.1 AA

`WCAG_AA` fixes the thresholds: 4.5:1 body text, 3:1 large text (≥18px, or
≥14px bold), 3:1 UI components and graphical objects. `contrastRatio` is the
sRGB relative-luminance ratio; `meetsContrast` is the assertion helper.

`contrastRatio` returns `null` — never a number — for an unparseable colour
(a `var(--…)` reference, say), and `meetsContrast` treats that as a failure.
A pair that cannot be asserted must not read as a pair that passed.

Both themes' body pairs are asserted green in `accessibility.test.ts`. The
token-emission lint that enumerates *every* declared pair is tranche `30.11`'s
(`lint-carrier-tokens`); this contract supplies the threshold and the ratio
function it asserts with.
