# UI Composition Rules Contract

This document is the canonical composition-over-juxtaposition contract for integrated M' Theia editor-area surfaces. It sharpens UI Foundation Principle 6 and Track 15.4 into validation rules for the integrated `1-2-3` and `4-5-0` plugins.

These rules are normative. Integrated plugins MUST satisfy them before contributing editor-area real estate. A plugin that cannot satisfy them MUST publish blocked readiness and stay out of the editor-area composition surface.

Source plan: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` section `30.12`.

## Single-Surface Composition

Integrated plugins compose three M-extensions into one editor-area composition surface. The integrated plugin owns the surface, the layout frame, the active coordinate binding, and the shared profile-tick choreography.

- `plugin-integrated-1-2-3` composes M1 K2 torus, M2 cymatic engine, and M3 codon-rotation as one geometric composition. The M1 K2 torus holds the lens-ring, the M2 cymatic layer renders frequencies on that surface, and the M3 codon-rotation projects onto lens-ring cells.
- `plugin-integrated-4-5-0` composes M4 journal, M5 recognition, and M0 Mobius-return as one geometric composition. The M4 journal, M5 Mahamaya recognition layer, and M0 return geometry occupy differentiated composition roles over the same surface.

The phrase "three M-extensions" describes the source authorities, not three editor widgets. The product unit is the composed surface.

## Bento Spacing Tokens

Composition surfaces MUST consume the canonical spacing tokens below. Bento elements share the bento gap. Surface margin frames the whole editor-area composition.

| Token | Value | Contract |
| --- | ---: | --- |
| `epilogos.spacing.composition.bento.gap` | `16px` | Gap between bento composition elements. |
| `epilogos.spacing.composition.bento.padding` | `24px` | Inner padding inside bento composition elements. |
| `epilogos.spacing.composition.surface.margin` | `32px` | Outer margin framing the editor-area composition surface. |

Implementations MAY map these tokens into CSS custom properties, but they MUST preserve the canonical values unless a later contract explicitly supersedes them.

## Antipattern: Three-Pane Juxtaposition

Three-pane juxtaposition is a validation failure. Any integrated plugin contributing three side-by-side widgets to the editor area FAILS composition validation, even when those widgets individually render correct M-extension content.

Forbidden editor-area patterns include:

- Three adjacent standalone widgets standing in for an integrated composition.
- Layout code that names or models the integrated surface as `panel-side-left`, `panel-side-center`, or `panel-side-right`.
- Any "side-by-side widget" structure where M1/M2/M3 or M4/M5/M0 remain separable widget bodies instead of layers within one composition surface.

Standalone Mn depth widgets MAY exist in `ide-deep`, but they MUST NOT claim to be the integrated daily composition.

## Geometric Composition Primitives

M-extensions contribute geometric composition layers, not widget bodies, when participating in an integrated editor-area surface.

- Texture layers carry surface material, journal ambience, or protected-local visual fields.
- Heatmap layers carry cymatic, resonance, readiness, or recognition intensity.
- Overlay layers carry codon rotation, lens-ring projection, provenance marks, privacy marks, or Mobius-return geometry.

The integrated plugin owns hit testing, coordinate preservation, readiness aggregation, layout persistence, and profile-tick subscription for the surface. Participating M-extensions expose typed layers and metadata only; they do not mount independent editor widgets inside the integrated composition.

## Validation

The composition-contract preflight for integrated plugins MUST assert that each integrated plugin declares exactly one editor-area composition surface. It MUST reject three-pane or side-by-side widget layouts in integrated plugin source.

Required acceptance checks:

```bash
test -f Body/M/epi-theia/extensions/contracts/ui-composition-rules.md
! grep -rnE 'three-pane|side-by-side widget|panel-side-(left|right|center)' Body/M/epi-theia/extensions/plugin-integrated-*/src/
```
