# C' VAK Grammar Layer Reference

This document is the canonical bridge between the reflective `C'` ladder and the operational VAK grammar used by ta-onta's Anima layer.

## Canonical Mapping

| C' coordinate | VAK layer | Meaning |
|---|---|---|
| C0' | CPF | Category/Context Frame Polarity |
| C1' | CT | Content Type |
| C2' | CP | Context Position |
| C3' | CF | Context Frame |
| C4' | CFP | Context Frame Position / thread type |
| C5' | CS | Context Sequence / runtime phase |

## Ordering Note

Some earlier materials invert `C2'` and `C4'`. The authoritative mapping for this repo is:

- `C2' -> CP`
- `C4' -> CFP`

Entity belongs to positional address; type belongs to traversal/thread form.

## CPF

| CPF | Meaning |
|---|---|
| `(00/00)` | dialogical, user-engaged Ouroboros mode |
| `(4.0/1-4.4/5)` | mechanistic, autonomous Ralph/Anima mode |

## CT

| CT | Meaning |
|---|---|
| CT0 | Relational |
| CT1 | Definitional |
| CT2 | Operational |
| CT3 | Pattern |
| CT4 | Contextual |
| CT4b' | contextual artifact family for daily/NOW style notes |
| CT5 | Integrative |

## CP

| CP | Meaning |
|---|---|
| 4.0 | Ground |
| 4.1 | Definition |
| 4.2 | Operation |
| 4.3 | Pattern |
| 4.4 | Context |
| 4.5 | Integration |

## CF

The seven CFs are positionally structured: one parent at outer #4 (the lemniscate), six inner positions 0–5 within the parent. Canonical positional law lives in [[05-ql-7fold-law-and-vak-c-substrate]] §Seven-CFs-As-Positions.

| CF | Lemniscate Position | Agent | Vāk-level |
|---|---|---|---|
| `(00/00)` | inner 0 | Nous | Parā |
| `(0/1)` | inner 1 | Logos | Madhyamā-as-nomos |
| `(0/1/2)` | inner 2 | Eros | Madhyamā-as-chreia |
| `(0/1/2/3)` | inner 3 | Mythos | Paśyantī |
| `(4/5/0)` | inner 4 | (synthesis bridge) | recursion-gate |
| `(5/0)` | inner 5 | Sophia | Spanda-Shakti |
| `(4.0/1-4.4/5)` | **outer #4** (the parent) | Anima / Psyche contextual envelope | Madhyamā-as-oikonomia |
| `(4.5/0)` | lemniscate-anchored stage | Psyche executive bridge | partial-Aletheia .5 |

Lemniscate-anchored stages — `(4.0/1)`, `(4.0/1/2)`, `(4.0/1/2/3)`, `(4.4/5)`, `(4.5/0)` — are doubled-register instances of the inner positions 1–5, all carrying CF_FRACTAL as their parent.

## Diatonic Interpretation (CF Grammar As Audible Scale)

The seven CFs at their positions form the diatonic scale read as a relational grammar. Each unique diatonic note carries one CF configuration; the scale traversal is the CF-progression rendered audible. See [[S0-HARMONIC-POINTER-WEB36-SPEC]] §E for the chromatic-substrate-vs-diatonic-overlay law and [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] for the `MathemeHarmonicProfile` contract.

| Diatonic | CF | Position | Role |
|---|---|---|---|
| C  | `(00/00)`     | inner 0 | tonic ground / Nous / Parā |
| D  | `(0/1)`       | inner 1 | first articulation / Logos |
| E  | `(0/1/2)`     | inner 2 | triadic circulation / Eros |
| F  | `(0/1/2/3)`   | inner 3 | tetradic closure / Mythos |
| G  | `(4.0/1-4.4/5)` | outer #4 (parent) | perfect fifth / Anima executive |
| A  | `(4.5/0)`     | lemniscate-stage | bridge stewardship / Psyche |
| B  | `(5/0)`       | inner 5 | leading-tone / Sophia Spanda |
| C' | `(00/00)`     | inner 0 (next register) | enriched ground / Möbius return |

The Mod 4/6 fractal `(4.0/1-4.4/5)` lives at G (perfect fifth) because the perfect fifth is the harmonic generator of the chromatic cycle — structurally identical to Anima's role as dispatch-function. The leading-tone B = `(5/0)` is Sophia's Spanda-pulse rendered as audible pull-toward-resolution. The octave return C' = `(00/00)` enriched is the `§5→§0'` move.

Modal rotation = CF-anchoring shift: each of the seven modes is the diatonic scale anchored at a different CF as tonic. Ionian = `(00/00)` at tonic; Mixolydian = `(4.0/1-4.4/5)` at tonic; Locrian = `(5/0)` at tonic. The mode's characteristic emotional color comes from which agent-archetype-and-Vāk-level sits at the tonic position.

## CFP

| CFP | Meaning |
|---|---|
| CFP0 | base thread |
| CFP1 | P-thread, independent parallel work |
| CFP2 | C-thread, chained execution |
| CFP3 | F-thread, same task to multiple agents with aggregation |
| CFP4 | L-thread, long-running/autonomous |
| CFP5 | B-thread, nested/meta orchestration |
| Z | zero-touch or structural automation thread |

## CS

| CS | Meaning |
|---|---|
| CS0 | full traverse |
| CS1 | quick ground to context |
| CS2 | ground to operation |
| CS3 | through pattern |
| CS4 | context-focused |
| CS5 | direct synthesis |

Day is forward synthesis through the left-facing sequence. Night' is backward inquiry through the right-facing return. Day/Night' is therefore a runtime `CS` state, not an agent identity.

## Day and Night'

| Day CP | Day question | Night' position | Night' question |
|---|---|---|---|
| 4.0 | What do we have? | P0' | What don't we know? |
| 4.1 | What must be true? | P1' | What evidence exists? |
| 4.2 | What is being done? | P2' | What blocks us? |
| 4.3 | What shape does it take? | P3' | What repeats? |
| 4.4 | Where/when? | P4' | What sources inform? |
| 4.5 | What was produced? | P5' | What crystallizes? |

Night' traversal runs `4.5 -> 4.4 -> 4.3 -> 4.2 -> 4.1 -> 4.0`, and P5' insight reopens the cycle as P0' questions.

## 40-Sequence Formula

`20 context frames x 2 directions = 40 sequences`

The Day traverse and the Night' traverse are not mirror-image documentation passes. Together they form the 40-sequence operational law of the VAK grammar layer.
