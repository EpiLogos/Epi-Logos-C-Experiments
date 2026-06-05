---
coordinate: "C/C4/Types-Contexts-MOCs/Symbolic-Systems"
c_4_artifact_role: "type-moc-pointer"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "oracle-symbolic-systems"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M3'-SPEC]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# Symbolic Systems

## Scope

[[Symbolic-Systems]] is the **type-authority** for symbolic systems being incubated under World/Types. It holds the canonical definitions of the five initial systems — [[Tarot]], [[I-Ching]], [[Codon]], [[Nucleotide]], and [[QL Music]] — that operate as M3's symbolic substrate and supply M4's oracle artifact surface.

These entries are **incubating types**, not graduated entities. They live here precisely because the C4 type/context layer is where new symbolic kinds are stabilised *before* any flat-World graduation. Per the Open Decisions of [[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]], no symbolic entity graduates to flat `World/Types/<System>/` until **M3 coordinate refs are verified** *and* **source coverage** (full Cl(4,2) coverage for codons, complete 64-card / 64-hexagram lattices for Tarot/I-Ching, full 12-note palette derivation for QL Music) **is auditably present in the seed corpus**.

## What Belongs Here

- Single-file definitions of each symbolic system (one `.md` + paired `.canvas`).
- Links from each system into its source authority ([[M3]]) and its usage authority ([[M4]]).
- Cross-links between systems sharing substrate (e.g. [[Tarot]] ↔ [[I-Ching]] ↔ [[Codon]] ↔ [[Nucleotide]]).

## What Does Not Belong Here

- Concrete oracle artifacts (those are M4 Nara artifact instances — `oracle_quaternal_tarot`, `oracle_quaternal_iching` — and live under M4's runtime envelope, not in this type folder).
- Tarot-card or hexagram entity records (these are C2 entity definitions once graduated; until then they are seeds under M3).
- Plugin protocols (those live as `[[quaternal_tarot_protocol]]` / `[[quaternal_i_ching_protocol]]` and reference these type definitions).

## Authority

- **Source authority:** [[M3]] Mahamaya (symbolic transcription engine; owns the codon substrate and rotational state algebra).
- **Usage authority:** [[M4]] Nara (consumes M3 output as oracle frames and packet chains).

## Entries

- [[Tarot]] — 80 quaternion-point exact-cover compression of the 64-codon space.
- [[I-Ching]] — 64 hexagrams as codon-quaternions with 384-line-change operator graph.
- [[Codon]] — M3's symbolic-transcription unit; 472 rotational states in Cl(4,2).
- [[Nucleotide]] — 2-bit polarity-mobility logic underlying codons.
- [[QL Music]] — position #5 of the 6-fold-of-layers; chromatic-basis ⊕ fifths-basis derivations.

## Graduation Criteria

A system here graduates to flat World only when:

1. Every claim in its definition body resolves to an M3 source ref under `Body/M/M3/**` or `Idea/Bimba/Seeds/M3/**`.
2. Source coverage is exhaustive (no partial lattices, no hand-waved completions).
3. [[S2]] review accepts the entity for graph promotion (per plan Open Decisions).
