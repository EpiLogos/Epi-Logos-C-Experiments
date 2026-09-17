<!--
Coordinate: M' (design-language layer — iconography system, rerun 30.T30.9).
  Subject matter spans the five left-sidebar modes, the 0/1 chrome toggle, the lemniscate
  transition glyph, the six Mn subsystems and the six family letters; the doc itself is
  carrier-wide M', not the property of any coordinate it draws.
Residency: Body/M/pratibimba-app/contracts/ui-iconography.md
Position (#n): #4 — Context/Type (the doc that names WHICH glyphs exist, what each one
  means, and which surface is licensed to wear it — the type law of the carrier's glyph
  surface)
Actualises: Tranche 30.9 of the design-recon spec
  `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md:210`
  ("Iconography system"). Retarget of the frozen epi-theia target
  `extensions/contracts/ui-iconography.{ts,md}` + `extensions/contracts/icons/` to the live
  carrier per CHARTER.md rule 2.
Public surface: the §1 icon inventory, the §2 binding tables, the §3 fallback convention
  (the Codicons ruling), and the §4 authoring law. These are the prose contract behind
  `src/ui/iconography.ts`.
Does NOT own: the register VALUES — those are `src/ui/iconography.ts`; the glyph artwork —
  `src/assets/icons/*.svg`; the mode inventory — `src/ui/leftSidebarModes.ts`; the family
  hues — `src/ui/tokens.ts` (`FAMILY_HUES`); the rendering of any activity rail — Track 52
  wires it; `src/assets/lemniscate-mask.svg`, which is the DR-UI-4 shader mask law
  (r² = a²·cos 2θ), a different asset from the `lemniscate` transition glyph.
-->

# Iconography System

**A glyph in M′ is a coordinate concept drawn small.** The carrier already refuses decorative colour (see `ui-family-palette-derivation.md`); it refuses decorative iconography on the same ground. Every glyph in this set stands for something the coordinate system already holds — a mode of navigation, a fold of the 0/1 face, a subsystem, a family letter — and nothing in the set exists because a surface "needed an icon there".

> **Carrier note (CHARTER.md rule 2).** The 30.9 spec targets `Body/M/epi-theia/extensions/contracts/ui-iconography.{ts,md}` and lands the contribution through a Theia `IconThemeContribution`. epi-theia is FROZEN and the widget paradigm is retired: the contract *law* is realised here against the live carrier. The artwork is ported from the frozen contract (it is real, authored, single-colour monoline work); the Theia registration mechanism is not — see §3.

---

## §1 — The set

Nineteen glyphs, five categories. Every one lives at `src/assets/icons/{name}.svg` and resolves through Vite via `iconAssetUrl(name)`; the register id is always `pratibimba.icon.{name}`.

### Left-sidebar modes (5)

| Glyph | Meaning |
|---|---|
| `coordinate-tree` | Branching coordinate tree with marker nodes — the navigation backbone every surface roots in. |
| `bimba-graph-viewer` | Graph, solar and tree renderings converging into one mode glyph. |
| `canon-studio` | Markdown text with a structured-marker glyph for canon editing. |
| `backend-studio` | Code brackets converging with a cog for substrate work. |
| `smart-connections` | Semantic links with a haloed relationship node. |

### Chrome toggle (1)

| Glyph | Meaning |
|---|---|
| `coin-flip` | The coin mid-flip, showing the 0 face and the 1 face at once — the lemniscate fold made a single mark. Worn by `.face-toggle-icon` in `FaceToggleChrome`. |

### Transition primitive (1)

| Glyph | Meaning |
|---|---|
| `lemniscate` | Figure-eight with the `#4` cross-binding anchor visible and a gradient marking the crossing. The default glyph of the cosmic↔personal fold. |

### Mn subsystem glyphs (6)

| Glyph | Subsystem | Reading |
|---|---|---|
| `family-m0-anuttara` | M0 | void / recognition |
| `family-m1-paramasiva` | M1 | Spanda / pulse |
| `family-m2-parashakti` | M2 | cymatic / vibration |
| `family-m3-mahamaya` | M3 | wheel / codon |
| `family-m4-nara` | M4 | vessel / personal |
| `family-m5-epii` | M5 | recursion / atelier |

### Family-letter glyphs (6)

`family-p` · `family-s` · `family-t` · `family-m` · `family-l` · `family-c` — the inline family-tier marker `CoordinateString` renders before the coordinate text.

---

## §2 — Bindings

### Left-sidebar modes

The bindings are **derived** from `LEFT_SIDEBAR_MODES`, not written beside it: `SIDEBAR_MODE_ICON_NAMES` is a `Record<LeftSidebarModeId, SidebarModeIconName>`, so a mode added or renamed in `src/ui/leftSidebarModes.ts` fails typecheck until it names its glyph. Drift is not policed here; it is structurally impossible.

| Mode id | Glyph | Layouts |
|---|---|---|
| `coordinate-tree` | `coordinate-tree` | `daily-0-1`, `ide-deep` |
| `bimba-graph` | `bimba-graph-viewer` | `daily-0-1`, `ide-deep` |
| `canon-studio` | `canon-studio` | `daily-0-1`, `ide-deep` |
| `backend-studio` | `backend-studio` | `ide-deep` |
| `smart-connections` | `smart-connections` | `ide-deep` |

**One reconciliation is recorded here rather than silently smoothed:** the carrier's mode id is `bimba-graph` while the frozen glyph is named `bimba-graph-viewer`. The map is where the two names meet; neither was renamed to flatter the other.

**Scope.** Per DR-FACE-7 the carrier has *two poles over one spine*, not one Theia activity bar: the cosmic left-sidebar mode registry and the personal `4-5-0` face-1 reachables (`commands/crossLayoutIntent`). Tranche 30.9 names glyphs for the cosmic pole only, and this register glyphs only that pole. The personal pole is unglyphed — stated, not hidden.

### Family letters

`FAMILY_LETTER_ICON` is keyed upper-case, exactly as `FAMILY_HUES` in `src/ui/tokens.ts` is keyed, so a consumer resolves the hue and the glyph from one letter. `familyLetterIcon(letter)` is case-insensitive and returns `null` for anything outside P/S/T/M/L/C — **an unknown family renders no glyph rather than borrowing another family's mark.**

### Mn subsystems

`MN_FAMILY_ICON` maps `M0`…`M5` onto the six subsystem glyphs.

---

## §3 — The fallback convention: Codicons is retired genealogy

The frozen 30.9 spec closes with a "Codicons fallback convention": any UI element outside the custom set uses Theia's Codicon font, with a documented icon→Codicon mapping.

**That convention does not survive the retarget, and declaring it would fabricate a dependency this carrier does not have.** `pratibimba-app` ships no icon font — there are zero `codicon` references anywhere in the tree. Writing `codiconFallback: 'list-tree'` into the register would produce a table that looks like a contract and resolves to nothing.

The honest carrier fallback is the one the shell already uses everywhere else: **the text label.** Border tabs carry text. Buttons carry text. `active-coordinate-display` carries the coordinate itself. So:

- Every `UiIconDefinition` carries a `label` — the text that stands in when the glyph cannot paint.
- Every `SidebarModeIconBinding` carries `fallbackLabel`, which **is** its mode's own `label` from `LEFT_SIDEBAR_MODES` — one string, asserted equal, not a second copy free to drift.
- For a surface with no custom glyph, the fallback is its own label. There is no second icon vocabulary to consult.

This is the same ruling DR-FACE-7 applies to "activity bar" as a dead Theia noun, applied to Codicons. Recorded rather than quietly dropped.

---

## §4 — Authoring law

Every glyph in `src/assets/icons/` obeys all five, each mechanically checked (§5):

1. **`viewBox="0 0 32 32"`, exactly one viewBox.** One asset therefore serves 16 / 24 / 32 — the `UI_ICON_SIZES` triple — with no per-size artwork.
2. **Monoline, `currentColor` only.** No hex, no named colour. A hardcoded colour would survive a CSS mask (masks read alpha) while breaking every inline and `<img>` consumer, and would fork a second palette off `ui/tokens.ts`. The single permitted indirection is `url(#…)` for a gradient whose stops are themselves `currentColor` — `lemniscate` is the only glyph that uses one.
3. **Globally unique DOM ids.** Each `<title>` is `id="{name}-title"` and each gradient is namespaced (`lemniscate-cross-binding`). The frozen set used `id="title"` in all nineteen files; inlining any two of those would have broken `aria-labelledby` for both. Fixed on the port.
4. **Consumed as a mask over `currentColor`.** The convention `.face-toggle-icon` already used: `background: currentColor` plus `mask: url(...)`. A glyph therefore inherits whatever colour its consumer resolved — the family hue on a coordinate string, ink in chrome — instead of carrying its own.
5. **A missing asset is a build defect, not a runtime degrade.** `iconAssetUrl` throws rather than returning a broken path, and the register is resolved through an eager `import.meta.glob`, so a deleted or misnamed SVG fails the suite instead of rendering an empty box on a user's screen.

---

## §5 — Verification map

| Claim | Proven by |
|---|---|
| Nineteen icons, five categories, no duplicate name or id | `src/ui/iconography.test.ts` |
| The asset directory holds exactly the declared set (no orphan, no missing) | `src/ui/iconography.test.ts` — compares the `?raw` glob against the register in both directions |
| 32×32 viewBox, `currentColor`-only, globally unique DOM ids | `src/ui/iconography.test.ts` — reads the real SVG source |
| Each resolved URL serves that glyph's own drawing | `src/ui/iconography.test.ts` — decodes the inlined `data:` payload and compares normalised markup |
| One asset resolves at 16 / 24 / 32, prefixed property included | `src/ui/iconography.test.ts` |
| One glyph per sidebar mode, in registry order, fallback label equals the mode label | `src/ui/iconography.test.ts` |
| Six family letters ↔ six distinct glyphs, keyed as `FAMILY_HUES` is keyed | `src/ui/iconography.test.ts` |
| Unknown family letter renders no glyph | `src/ui/iconography.test.ts` + `src/ui/primitives.test.tsx` |
| `CoordinateString` renders the right glyph per family, decoratively | `src/ui/primitives.test.tsx` |
| The glyph really paints in the running app, at real size, in the family hue | `tests/e2e/iconography.spec.ts` |
| The coin-flip chrome toggle still resolves after the asset move | `tests/e2e/iconography.spec.ts` |
