---
name: epi-logos-argument-cartography
description: Map Epi-Logos essays and sources into sourced argument networks with claims, warrants, counterclaims, coordinates, traversals, and writing paths.
---

# Epi-Logos Argument Cartography

> `using-epi-logos` runs first. If it hasn't been invoked this turn, go there now.

Use this skill when standalone essays, source files, or compiled wiki pages need to become explorable argument networks rather than isolated prose.

## Purpose

Argument cartography turns Epi-Logos writing into a source-grounded graph. It extracts propositions, tracks warrants, preserves counterclaims, maps coordinates, and builds traversable writing paths.

## Inputs

Prefer this order:

1. `swarmvault.schema.md`
2. compiled wiki pages under `Thought/Vault/wiki/`
3. graph report and context packs when present
4. raw source files under `epi-logos/resources/**` when compiled coverage is weak or disputed
5. skill files under `epi-logos/skills/**` when mapping executable behavior back to resources

Do not map claims from memory alone. A claim that cannot be tied to a source or explicitly marked as inference should remain an open question.

`epi-logos/resources/**` is the primary corpus. `epi-logos/skills/**` is the executable surface. Argument maps should connect skills to the resources, coordinates, concepts, and traversal heuristics they operationalize.

## Node Types

Use these node types in `Thought/Vault/wiki/arguments/`, `Thought/Vault/wiki/paths/`, or related compiled pages:

- `source`: canonical document or promoted source artifact.
- `claim`: source-backed proposition.
- `concept`: reusable idea or term.
- `coordinate`: `#`, P, P', L, L', square, traversal, or subsystem coordinate.
- `warrant`: reasoning that supports a claim.
- `counterclaim`: source-backed or inferred tension.
- `question`: unresolved inquiry or missing evidence.
- `synthesis`: provisional integration with visible source support.
- `path`: curated traversal across nodes.

## Relation Types

Use these relation labels:

- `supports`
- `contradicts`
- `qualifies`
- `depends-on`
- `maps-to-coordinate`
- `belongs-to-square`
- `precedes-in-traversal`
- `opens-question`
- `synthesizes`

Every relation must be labeled as one of:

- `extracted`: directly stated or clearly evidenced in a source.
- `inferred`: derived by reasoning from cited source material.
- `ambiguous`: plausible but unresolved or source-conflicted.

Inferred and ambiguous relations require a short explanation.

## Mapping Procedure

1. Identify the source set and cite it.
2. Extract candidate claims as short propositions.
3. Attach each claim to source filenames or compiled source pages.
4. Identify warrants: why the claim follows.
5. Identify counterclaims, tensions, absences, or unresolved questions.
6. Map relevant coordinates:
   - `#` source-condition
   - `P0-P5` Day positions
   - `P0'-P5'` Night positions
   - `L0-L5` Day lenses
   - `L0'-L5'` Night lenses
   - Klein V4 square membership
   - subsystem branch `#0-#5`
7. Build Day, Night, or braided traversal paths.
8. File the result into the vault and update task/context artifacts when appropriate.

## Day and Night Path Rules

Day paths articulate outward:

```text
P0 -> P1 -> P2 -> P3 -> P4 -> P5
```

Night paths examine hidden framing conditions:

```text
P0' -> P1' -> P2' -> P3' -> P4' -> P5'
```

Braided paths may cross Day and Night, but the crossing must be named. Do not treat Night as a generic lint pass.

## Coordinate Safety

- `#` is source-condition, not an ordinary category.
- QL positions and MEF lenses are not interchangeable.
- P4 and P4' are contextual gates, not decorative labels.
- The `epi-logos/` family may initially be read as QL `/` MEF, but later source-grounded mappings may refine that relation.
- Subsystems `#0-#5` organize canonical dataset branches, not arbitrary topic buckets.

## Output Shape

For each mapped argument, prefer compact markdown:

```markdown
---
title: "Argument title"
page_type: argument-map
evidence_status: source-synthesized
source_ids:
  - "relative/source.md"
coordinates:
  - "P4"
  - "L4'"
---

# Argument title

## Claims

- C1: Claim text. Evidence: [[source-page]]. Status: extracted.

## Warrants

- W1 supports C1 because ...

## Tensions

- T1 qualifies C1. Evidence: [[other-source]]. Status: ambiguous.

## Traversal

- Day: P0 -> P1 -> P2 -> P3 -> P4 -> P5

## Open Questions

- Q1: What source would settle the ambiguous relation?
```

## Verification Checklist

Before calling an argument map usable:

- every claim has a source or is marked as a question
- every inferred relation has an explanation
- contradictions are preserved as tensions
- coordinate tags do not flatten P-family into L-family
- Day/Night traversal roles are distinct
- useful output is filed back into the SwarmVault wiki

## Vault Linking (when filesystem access exists)

When this skill persists an artifact (Thought entry, plan, summary, oracle reading, design note), include wikilinks to the World/Types psychoid web at `Idea/Bimba/World/Types/`. Canonical vocabulary:

- Raw psychoid wells: `[[Psychoid-0|#0]]` … `[[Psychoid-5|#5]]`
- Position coordinates: `[[P0]]`…`[[P5]]` / `[[P0']]`…`[[P5']]`
- Lens coordinates: `[[L0]]`…`[[L5]]` / `[[L0']]`…`[[L5']]`
- Klein V₄ Squares: `[[Square A]]` / `[[Square B]]` / `[[Square C]]`
- Relation families: `[[Family A — Adjacent-Identity]]`, `[[Family B — Offset-Transition]]`, `[[Family C — Converse-Mirror]]`, `[[Family D1 — Same-Position Cross]]`, `[[Family D2-Transform]]`, `[[Family D2-Require]]`, `[[Family D2-Complete]]`, `[[Family D3 — Helix-Invariance]]`
- Symbolic systems: `[[Tarot]]` · `[[I-Ching]]` · `[[Codon]]` · `[[Nucleotide]]` · `[[QL Music]]`
- Language objects: `[[OracleFrame]]` · `[[ReadingPosition]]` · `[[TranscriptionalClockPacket]]` · `[[SymbolicProtein]]` · `[[NaraDeckContext]]` · `[[PatternPacket]]`

Hen residency: target [[Hen]] / S1' write methods when available; direct filesystem writes are transitional fallback. See `Idea/Empty/Present/03-06-2026/HEN-INTEGRATION-DESIGN-PSYCHOID-WEB-2026-06-03.md` for the gateway design and `PSYCHOID-WEB-CANON-EXTRACT-2026-06-03.md` for the canonical wikilink vocabulary in full.
