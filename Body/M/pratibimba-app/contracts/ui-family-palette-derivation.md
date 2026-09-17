<!--
Coordinate: M' (design-language layer — family-letter palette derivation, rerun 30.T30.8).
  Subject matter spans all six families P/S/T/M/L/C × #0–#5; the doc itself is carrier-wide
  M', not the property of any one family it describes.
Residency: Body/M/pratibimba-app/contracts/ui-family-palette-derivation.md
Position (#n): #4 — Context/Type (the doc that names WHY each family letter carries its
  tier hue and each raw archetype its grade; the #4 Lemniscate frame that the 36 emitted
  tokens sit inside)
Actualises: Tranche 30.8 of the design-recon spec
  `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md:195`
  ("Family-letter palette derivation"), under DR-WC-DL-1 as VALIDATED 2026-07-23 by the
  Architect (`13-decision-register.md:2099`). Retarget of the frozen epi-theia target
  `extensions/contracts/ui-family-palette-derivation.md` to the live carrier per
  CHARTER.md rule 2.
Public surface: the six per-tier derivation sections (§2.P … §2.C), the §3 DR-WC-DL-1
  default-vs-alternative record, and the §5 verification map. These are the grep-anchored
  prose contract for why `FAMILY_PALETTE` holds the hexes it holds.
Does NOT own: the token VALUES or their emission — those are `src/ui/tokens.ts:92`
  (`FAMILY_PALETTE`) + `:243` (`familyGrade`) + `:252` (`coordinateFamilyGrade`), landed by
  30.T30.2; the per-theme resolution rules (Tranche 30.4, `src/ui/themeMapping.ts`); the
  renderer that consumes a tint (`src/ui/primitives.tsx`, Tranche 30.10/30.13); the DR law
  itself (`13-decision-register.md`).
-->

# Family-Letter Palette Derivation

**Colour in M′ is derived, never decorative.** `M'-SYSTEM-SPEC.md:34` holds that M′ "is not a separate app family and not a UI layer floating above the stack" — it is the way the coordinate system *becomes present*. A hue that does not descend from a coordinate concept is therefore not a style choice in this carrier; it is a category error. This document records the descent for all 36 family-tier × archetype-grade tokens.

> **Carrier note (CHARTER.md rule 2).** The 30.8 spec targets `Body/M/epi-theia/extensions/contracts/ui-family-palette-derivation.md`. epi-theia is FROZEN; the contract *law* is realised here, against the live carrier's `src/ui/tokens.ts`. No prose was ported from epi-theia — this is written from the 30.8 spec section and from the values that actually landed.

---

## §1 The two axes

The coordinate system supplies exactly two axes, and the palette uses both:

| Axis | Source | Palette role |
|------|--------|--------------|
| **Family letter** — `P S T M L C` | The six coordinate families (CLAUDE.md §II.C) | **TIER** — which hue-world the token belongs to |
| **Raw archetype** — `#0 … #5` | The pre-categorical positions each family manifests | **GRADE** — position within that tier |

`coordinateFamilyGrade` (`src/ui/tokens.ts:252`) is the resolver: it reads the leading family letter as the tier and the first `0–5` after it as the grade, so `M3-2` resolves to **M-tier, grade 3** — deeper branch segments do not change the tint. A coordinate outside the six families (a bare `#4` raw archetype, a reflective `cpf`) returns `null` rather than a fallback hue: absence of a family is not a colour.

**Grade semantics differ by tier, and this is the load-bearing asymmetry.** For five tiers the grade is a *ramp*. For the M-tier it is an *identity*.

---

## §2 Per-tier derivation

### §2.P — Position: foundation-neutral

Position is the most primal family (P0 Ground / P1 Definition / P2 Operation / P3 Pattern / P4 Context / P5 Integration): it is the foundation that *precedes hue*. The tier is therefore near-greyscale — a violet-leaning neutral (hue ≈ 255°, saturation 10–14%) rather than a pure grey, so it reads as belonging to the same chromatic system as the hued tiers rather than as unstyled chrome. The ramp darkens on a light ground from `#aaa6b6` (P0) to `#453f54` (P5).

> **Measured divergence from the 2026-06-02 spec prose.** The spec describes the P ramp as "neutral-50 cool-grey (P0) → neutral-700 warm-grey (P5), leaning toward the Möbius-return". What landed does **not** rotate hue: P0 is 255° and P5 is 257°, so the grade is a *luminance* ramp (L 68% → 29%) at essentially constant hue, with saturation rising slightly (10% → 14%). The Möbius return is carried by the C-tier's hue arc (§2.C), not by a warm shift in P. Recorded rather than repaired: the values are the ratified ones, and a prose claim the hexes do not support is the kind of drift this document exists to prevent.

### §2.S — Stack: substrate-slate

Stack is technology layers (S0 Terminal / S1 Obsidian / S2 GraphDB / S3 Gateway / S4 Agent Runtime / S5 Integral World). Substrate is structural, so the tier takes a cool grey-blue slate: structural coolness without a hue commitment that would compete with the subsystem worlds. `#9aa4b8` (S0) → `#384663` (S5).

### §2.T — Thought: thought-parchment

Thought is artifacts and cognition (T0 Seed / T1 Spec / T2 Form / T3 Process / T4 Pattern / T5 Insight). Thought-artifacts are *inscribed*, and parchment is the canonical inscription medium — so the tier is a warm cream ramp graded by maturity: `#b3a889` (T0, palest cream/seed) → `#4f4526` (T5, aged vellum/insight).

### §2.M — Subsystem: the canonical colour-worlds

**This tier is not a ramp.** Subsystem is consciousness domains, and each domain owns a distinct modality, so each M-archetype is its own hue-world; the grade *is* the subsystem identity. Per DR-WC-DL-1 as ratified:

| Grade | Subsystem | World | Light | Dark |
|-------|-----------|-------|-------|------|
| M0 | Anuttara | achromatic ground (black/white/rainbow) | `#33313d` | `#cfccda` |
| M1 | Paramasiva | deep blue (+ gold accent) | `#2e4680` | `#7f99d6` |
| M2 | Parashakti | red / pink | `#bb3a52` | `#e88198` |
| M3 | Mahamaya | yellow / brown / orange (gold-mid) | `#a9761f` | `#e0b062` |
| M4 | Nara | deep green / teal | `#1f7a63` | `#5cc0a2` |
| M5 | Epii | purple (+ pink accent) | `#7a44a8` | `#b98ad9` |

M0's achromatic ground is the palette's own statement of Anuttara: the void that holds all colour is rendered as the absence of a hue commitment, not as a dark neutral borrowed from the P-tier.

### §2.L — Lens: epistemic-mist

Lens is epistemic modes (L0 Literal / L1 Functional / L2 Structural / L3 Archetypal / L4 Paradigmatic / L5 Integral). Lenses are translucent apertures, so the tier is a cool faded-blue mist, deliberately held at **lower saturation than the S-tier**: the lens is the veil, the stack is the substrate, and the two must not read alike. `#a3adbd` (L0) → `#45526b` (L5). The separation is real and measurable, not nominal — L and S share a blue hue band (L 216–219°, S 220–222°) but L runs both paler and less saturated at every grade (L: 15–22% saturation, lightness 69→35%; S: 17–28%, 66→30%). Any future edit that raises L's saturation into S's band erases the veil/substrate distinction and should be treated as a regression.

### §2.C — Category: ontological-deep-violet

Category is the ontological foundation (C0 Bimba / C1 Form / C2 Entity / C3 Process / C4 Type / C5 Pratibimba) — deep violet, the colour of unmanifest-becoming-manifest. **This is the one tier whose grade is a hue arc rather than a luminance ramp** (lightness is near-flat at 34–39%), and the arc is the derivation:

| Grade | C0 | C1 | C2 | C3 | C4 | C5 |
|-------|----|----|----|----|----|----|
| Hue | 263° | 276° | 292° | **305°** | 297° | 276° |

**C0 (Bimba) and C5 (Pratibimba) sit at the cool violet endpoints** (`#5a3a8c`, `#5f2e80`) sharing Cl(4,2) signature −1 polarity, while C1–C4 arc out through magenta-ward violet, turning at C3 Process (`#85357e`, 305°). The Möbius return is literally visible here: the arc departs cool violet, reaches its magenta extreme at the processual middle, and returns *toward* cool — but C5 lands at 276°, not back on C0's 263°. It does not close into a circle, which is the point: the return arrives at tomorrow's ground, not at yesterday's.

---

## §3 DR-WC-DL-1 — the decision on the record

**Status: VALIDATED 2026-07-23 (the Architect)** — `13-decision-register.md:2099`.

- **Chosen (default):** family-tier gradient with signature modulation, as derived above. The M-tier grades ARE the canonical subsystem colour-worlds; the five non-M tiers keep the spec's tier-derivation scheme.
- **Rejected alternative (C-tier as foundation-neutral, hueless):** rejected because C-tier is the *most-mediated* category — "ontological foundation" is a strong claim, and the tier deserves a strong hue rather than an absence of one. Hueless neutrality is the P-tier's meaning, and giving it to two tiers would erase the distinction.

**The ratified M-tier supersedes the 30.8 spec prose.** The spec section as written (2026-06-02) proposed M0 indigo · M1 amber · M2 violet-tattva · M3 gold · M4 earth-slate-gold · M5 amber-EBM. The DR (2026-07-23) is later and Architect-validated, and it names a different set of worlds. The landed values follow the DR, and so does this document; the spec prose is superseded on this point, not partially blended with it.

---

## §4 Consumption, and one named open seam

`familyGrade(family, grade)` (`:243`) and `coordinateFamilyGrade(coordinate)` (`:252`) are the two intended readers. Per-theme resolution across the seven canonical themes is Tranche 30.4's `src/ui/themeMapping.ts`, which resolves `family.{letter}.{grade}` ids against this matrix.

**Open seam — two family palettes coexist.** `FAMILY_HUES` (`src/ui/tokens.ts:60`) is the older flat one-hue-per-family map for graph surfaces (P teal · S violet · T green · M gold · L rose · C mint). It carries no grade axis and its values do not agree with `FAMILY_PALETTE`. The coordinate-string primitive `ln` and the empty-state/mark primitives still tint from it (`src/ui/primitives.tsx:93`, `:282`, `:327`), so **a rendered coordinate today shows its family tier but not its archetype grade.** This is recorded, not silently repaired: migrating the renderer is a visible change to every coordinate chip and to the visual-regression baselines, and it belongs to the coordinate-rendering primitive tranches (30.10 / 30.13), not to this derivation doc. What 30.8 does fix is the stale claim at `tokens.ts:60` that DR-WC-DL-1 is "an OPEN Architect decision" — it is validated, and the comment now says so.

---

## §5 Verification map

Each claim above is pinned by a landed test in `src/ui/familyPalette.test.ts`:

| Claim | Test |
|-------|------|
| 36-token matrix, every entry a valid light/dark hex, all 72 values distinct | `:71` |
| M-tier worlds are the ratified ones (M0 achromatic; M1 blue; M2 red/pink; M3 gold/orange; M4 green/teal; M5 purple) | `:84` |
| M-tier identity tints clear WCAG large-text contrast (≥ 3:1) in both themes | `:101` |
| The five ramped tiers (P/S/T/L/C) grade monotonically, grade 0 faintest → grade 5 strongest | `:108` |
| `M3-2` resolves to M-tier grade 3 and reads gold/orange; `#4` and `cpf` resolve to null | `:116` |
| Cl(4,2) signature polarity survives inversion (cool stays cool, warm stays warm) | `:133` |

The document's own presence is the 30.8 spec's first verification criterion (`test -f …/ui-family-palette-derivation.md`).
