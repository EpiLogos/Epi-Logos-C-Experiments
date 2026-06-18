# Family-Letter Palette Derivation

This document is the canonical derivation for the family-tier sub-namespace of the Epi-Logos colour system: `epilogos.colour.family.{p,s,t,m,l,c}.{0..5}` (36 tokens). It explains **why** each coordinate family carries the palette character it does, grounded directly in the coordinate-system canon rather than in visual taste. Every chromatic choice here traces to a coordinate-system concept; decoration without derivation is rejected at lint time (Tranche 30.11).

The 36 emitted tokens themselves live in `ui-colour-tokens.{json,ts,md}` (Tranche 30.2). This document is the **rationale of record** those tokens cite.

## Source Authority

- **Canonical spec:** `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` — the Three-Layer Coordinate Architecture: `#0`–`#5` raw archetypes as foundation (Layer 1); **P / S / T / M / L / C as Layer-2 family manifestations**; cpf / ct / cp / cf / cfp / cs as Layer-3 reflective in `()`; `#` as the inversion operation.
- **Source plan:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` §30.8 (this tranche) and §30.2 (the token emission this derivation feeds).
- **Foundation:** Track 15 (`15-ui-design-foundations.md`) Foundation Principle 1 — *coordinate as primary navigation*. Every surface roots in a coordinate; the family-letter is the first axis of that coordinate's visual identity.
- **Decision:** DR-WC-DL-1 (Track 13 register) — the C-tier deep-violet-vs-hueless contradiction; default + alternative documented below, routing to user final-validation.

## Derivation Principle

The family-letter (P / S / T / M / L / C) is a **Layer-2 manifestation** of the raw `#0`–`#5` archetypes — each family expresses the same six archetypal positions through a distinct domain (functional semantics, technology layers, artifacts, consciousness domains, epistemic modes, ontological foundation). The palette therefore carries **two orthogonal axes**:

1. **Family-letter → palette tier** (the hue *character* of the family — its domain identity).
2. **Archetype-position `#0`–`#5` → grade within tier** (the depth/saturation step along the `#0` Ground → `#5` Integration progression).

A coordinate string such as `[[M3-2]]` resolves to *family-tier M × archetype-position 2*. The two-axis split is the whole contract: the tier says *which domain*, the grade says *how deep into the archetypal cycle*.

The tier characters are assigned by reading each family's domain meaning from canon and choosing the chromatic register that **is** that domain rather than decorates it. The six assignments:

| Family | Domain (per M'-SYSTEM-SPEC) | Palette character | One-line rationale |
| --- | --- | --- | --- |
| **P** Position | Functional semantics | foundation-neutral | P precedes hue — it is the ground that other families specialise. |
| **S** Stack | Technology layers | substrate-slate | Substrate is structural; slate is cool-without-hue-commitment. |
| **T** Thought | Artifacts / cognition | thought-parchment | Thought-artifacts are *inscribed*; parchment is the inscription medium. |
| **M** Subsystem | Consciousness domains | subsystem-saturated | Each subsystem owns a distinct modality → a distinct saturated hue. |
| **L** Lens | Epistemic modes | epistemic-mist | Lenses are translucent apertures; mist carries the see-through quality. |
| **C** Category | Ontological foundation | ontological-deep-violet | The deepest mediation deserves the deepest hue (per DR-WC-DL-1). |

## P-tier (Position) — Foundation-Neutral

Position is the most-primal coordinate family: **P0 Ground / P1 Definition / P2 Operation / P3 Pattern / P4 Context / P5 Integration**. Position carries functional semantics and is the foundation that precedes hue — so the P-tier is rendered **near-greyscale with a subtle warmth-grade as the archetype ascends**.

- Grade 0 (P0 Ground) = neutral-50 **cool-grey** — the cool, near-white ground.
- Grade 5 (P5 Integration) = neutral-700 **warm-grey** — leaning toward the Möbius-return (`#5 → #0`), where the cycle warms before folding back to ground.

The warmth-grade across `#0` → `#5` is the only chromatic event in the tier: it is the visual trace of the archetypal progression itself, not a decorative gradient. **Rationale: P is the foundation that precedes hue.**

Emitted grades (light / dark):

| Token | Light | Dark |
| --- | --- | --- |
| `family.p.0` | `#f8fafc` | `#f2f4f7` |
| `family.p.1` | `#e5e7eb` | `#d8dee6` |
| `family.p.2` | `#d1d5db` | `#bec8d4` |
| `family.p.3` | `#9ca3af` | `#94a3b8` |
| `family.p.4` | `#6b645c` | `#7a7268` |
| `family.p.5` | `#3f3a34` | `#5a5147` |

## S-tier (Stack) — Substrate-Slate

Stack is the technology-layer family: **S0 Terminal / S1 Obsidian / S2 GraphDB / S3 Gateway / S4 Agent Runtime / S5 Integral World**. The S-tier is rendered **cool grey-blue**, graded by depth — S0 darkest slate, S5 lightest slate (the surface layer reaches outward to the world boundary).

**Rationale: substrate is structural; slate carries the "structural cool" without committing to a hue.** The S-tier deliberately reads as infrastructure — present, legible, never competing with the saturated M-tier for attention.

Emitted grades (light / dark):

| Token | Light | Dark |
| --- | --- | --- |
| `family.s.0` | `#e8eef6` | `#eef4fb` |
| `family.s.1` | `#c7d3e1` | `#d8e3ef` |
| `family.s.2` | `#9fb2c8` | `#bfd0df` |
| `family.s.3` | `#7891ad` | `#9eb5c9` |
| `family.s.4` | `#5e768f` | `#7f9ab2` |
| `family.s.5` | `#43566d` | `#637d96` |

## T-tier (Thought) — Thought-Parchment

Thought is the artifacts/cognition family: **T0 Seed / T1 Spec / T2 Form / T3 Process / T4 Pattern / T5 Insight**. The T-tier is rendered **warm cream / parchment**, graded by maturity — T0 palest cream (the seed, barely inscribed), T5 aged-vellum (insight, the fully-worked artifact).

**Rationale: thought-artifacts are *inscribed*; parchment is the canonical inscription medium.** The maturity grade reads as ink deepening into the page as a thought moves seed → insight.

Emitted grades (light / dark):

| Token | Light | Dark |
| --- | --- | --- |
| `family.t.0` | `#fff7e6` | `#fff3d2` |
| `family.t.1` | `#f4e7cc` | `#efdba9` |
| `family.t.2` | `#e5d1a9` | `#d8bd82` |
| `family.t.3` | `#d2b983` | `#bf9f62` |
| `family.t.4` | `#b69760` | `#a48147` |
| `family.t.5` | `#8d7146` | `#80653a` |

## M-tier (Subsystem) — Subsystem-Saturated

Subsystem is the consciousness-domains family: **M0 Anuttara / M1 Paramasiva / M2 Parashakti / M3 Mahamaya / M4 Nara / M5 Epii**. The M-tier is the one family rendered with **per-archetype saturated hue** — each subsystem owns a *distinct* hue family because each owns a distinct consciousness modality. The six are **not graded along one axis**; they are six different colours:

| Subsystem | Hue | Why this hue |
| --- | --- | --- |
| M0 Anuttara | **indigo** | recognition-void; the cool ground of the recognition-closure |
| M1 Paramasiva | **amber** | spanda-pulse; the warm pulse of the vibratory engine |
| M2 Parashakti | **violet-tattva** | vibration-shakti; the tattva/element vocabulary of L2' |
| M3 Mahamaya | **gold** | codon-arcana; the gold of the I-Ching/Tarot symbolic layer |
| M4 Nara | **earth-slate-gold** | the lived-personal triplet (protected-local earth / handle slate / opt-in gold) per 25.18 |
| M5 Epii | **amber-EBM** | resonance-energy; the energy-based-model resonance register |

This is the **one tier where the family token index encodes subsystem identity rather than a pure archetype-grade**: `family.m.{n}` selects *which subsystem* (n = M0…M5), carrying that subsystem's base hue.

The `#0`–`#5` archetype-position grade is then applied **within** each M-tier hue as a saturation/lightness modulation (e.g. M3-0 pale gold → M3-5 deep gold), preserving archetype-position grading on top of subsystem identity. A coordinate string `[[M3-2]]` therefore reads as *M3's gold base × archetype-position-2 mid-saturation grade* — the renderer takes `family.m.3` (gold) and applies the `-2` grade step. The two-axis contract is preserved; the M-tier simply binds its tier-axis to subsystem identity because subsystems are genuinely distinct modalities, not points on one scale.

Emitted base hues (light / dark; M4 nara-domain themes tune these slightly warmer per Tranche 30.4):

| Token | Subsystem | Light | Dark |
| --- | --- | --- | --- |
| `family.m.0` | M0 Anuttara (indigo) | `#5a73a8` | `#8a9bbd` |
| `family.m.1` | M1 Paramasiva (amber) | `#d4a14a` | `#e0b366` |
| `family.m.2` | M2 Parashakti (violet) | `#7d4f9e` | `#a783c4` |
| `family.m.3` | M3 Mahamaya (gold) | `#d4a574` | `#e0b67e` |
| `family.m.4` | M4 Nara (earth) | `#8a7355` | `#a88c65` |
| `family.m.5` | M5 Epii (amber-EBM) | `#d9a04f` | `#e6b86d` |

## L-tier (Lens) — Epistemic-Mist

Lens is the epistemic-modes family: **L0 Literal / L1 Functional / L2 Structural / L3 Archetypal / L4 Paradigmatic / L5 Integral**. The L-tier is rendered **cool faded-blue mist**, graded by depth — L0 palest blue (the literal surface), L5 deepest blue (integral synthesis).

**Rationale: lenses are translucent epistemic apertures; mist carries the "see-through" quality.** A lens is something you look *through*; the faded, low-saturation blue reads as a translucent overlay rather than an opaque surface — you see the coordinate through the lens, not the lens instead of the coordinate.

Emitted grades (light / dark):

| Token | Light | Dark |
| --- | --- | --- |
| `family.l.0` | `#edf6fb` | `#e6f1f7` |
| `family.l.1` | `#d6e8f2` | `#cfe0ec` |
| `family.l.2` | `#bdd7e6` | `#adc7d8` |
| `family.l.3` | `#9fbdd0` | `#8faec3` |
| `family.l.4` | `#789caf` | `#7193aa` |
| `family.l.5` | `#5b7d91` | `#5c7b91` |

## C-tier (Category) — Ontological-Deep-Violet *(DR-WC-DL-1)*

Category is the ontological-foundation family: **C0 Bimba / C1 Form / C2 Entity / C3 Process / C4 Type / C5 Pratibimba**. The C-tier is rendered **deep violet** — the colour of unmanifest-becoming-manifest.

The C-tier carries a topological structure the other tiers do not: **C0 (Bimba) and C5 (Pratibimba) are the violet endpoints**, sharing the Cl(4,2) signature `−1` polarity (cool), while **C1–C4 grade through warmer violet variants** (closer to magenta). This is the Möbius-return made chromatic — the canonical source (C0/Bimba) and its reflection (C5/Pratibimba) meet at the same cool-violet endpoint, and the cycle warms through the middle of the category progression. The C0/C5 endpoint-identity is visible in the emitted tokens: `family.c.0` and `family.c.5` carry the same hex.

Emitted grades (light / dark):

| Token | Category | Light | Dark |
| --- | --- | --- | --- |
| `family.c.0` | C0 Bimba (endpoint) | `#3f2a66` | `#7151b8` |
| `family.c.1` | C1 Form | `#4c3175` | `#7e62c0` |
| `family.c.2` | C2 Entity | `#5b3a7e` | `#8d71ca` |
| `family.c.3` | C3 Process | `#6d4791` | `#9c80d2` |
| `family.c.4` | C4 Type | `#7d4f9e` | `#ad91dc` |
| `family.c.5` | C5 Pratibimba (endpoint) | `#3f2a66` | `#7151b8` |

### DR-WC-DL-1 — the contradiction, the default, and the routing

The C-tier derivation is the one tier that is **genuinely contested**, and it routes to user final-validation. Two valid readings of the ontological family exist:

- **(a) Deep-violet (DEFAULT, adopted here).** The ontological tier carries the *deepest* hue because it is the **most-mediated** category — "ontological foundation" IS a strong claim, and the tier that names the categorial structure of being deserves a strong, saturated hue, not absence-of-hue. The family-tier hue stacks *on top of* the Cl(4,2) polarity colour-binary; C0/Bimba and C5/Pratibimba as the violet endpoints of the signature `−1` polarity carry this reading naturally.
- **(b) Foundation-neutral, hueless (ALTERNATIVE, rejected at default level).** The ontological tier carries *no* hue because it IS the foundation — by the same logic that makes P-tier near-greyscale, C-tier could be argued to precede hue entirely. **Rejected at the default level** because C-tier is not the *pre-categorial* foundation (that is `#0`–`#5` raw archetypes and, in the family space, P-tier); C-tier is the most-*mediated* category, a strong ontological commitment that earns a strong hue.

This is a **contradiction-decision**, not a free choice. It cannot be settled by the design layer alone — it depends on whether the architect reads "ontological foundation" as *primal* (→ hueless) or *most-mediated* (→ deepest hue). The cycle-3 default is **deep-violet** per reading (a); the decision is logged as **DR-WC-DL-1** in the Track 13 decision register, carrying both readings, and **routes to user final-validation**. If the user selects reading (b), the C-tier tokens collapse toward the P-tier neutral scale and this section is superseded.

## Coordinate-String Rendering Contract

The `CoordinateString` design primitive (Tranche 30.13) consumes this derivation directly. Given a wikilink, it:

1. Parses the optional `[[` `]]` brackets and extracts **family-letter** + **archetype-position**.
2. Looks up `epilogos.colour.family.<letter>.<archetype>` for the tint.
3. Renders the coordinate in `epilogos.typography.mono.coordinate` with the family-tier tint and inline family-glyph.

Worked example — `[[M3-2]]`:

- family-letter `M` → M-tier subsystem-saturated; index `3` selects M3 Mahamaya (gold base, `family.m.3`).
- archetype-position `2` → mid-saturation grade within the gold hue.
- Result: **gold-mid-saturation tint** (M-tier × archetype-2), `aria-label="M3 dash 2, subsystem family, mahamaya"` per the accessibility contract (Tranche 30.5).

## Verification

```bash
test -f Body/M/epi-theia/extensions/contracts/ui-family-palette-derivation.md
```

- **Token export integrity (36 entries):** `ui-colour-tokens.{json,ts}` exports exactly `family.{p,s,t,m,l,c}.{0..5}` (6 families × 6 grades = 36 tokens), each resolving to a light + dark hex, each MD entry citing this derivation document.
- **Coordinate-string renderer test:** `CoordinateString` for `[[M3-2]]` carries the M-tier × archetype-2 grade tint (gold-mid-saturation, `family.m.3`).
- **C0/C5 endpoint test:** `family.c.0` and `family.c.5` resolve to the same hex (the Möbius-return violet endpoint), with C1–C4 grading through warmer violet between them.
- **Decision register:** DR-WC-DL-1 (Track 13) documents the default (deep-violet) + alternative (foundation-neutral) and the routing to user final-validation.
