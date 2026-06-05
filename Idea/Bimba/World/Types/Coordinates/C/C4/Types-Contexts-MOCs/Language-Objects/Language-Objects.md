---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects"
c_4_artifact_role: "type-moc-pointer"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "language-objects"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M4'-SPEC]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# Language Objects

## Scope

[[Language-Objects]] is the **type-authority** for the runtime composability layer that turns readings into structured language events. Where [[Symbolic-Systems]] holds the *substrate* (Tarot, I-Ching, Codon, Nucleotide, QL Music), this folder holds the *grammar by which readings are composed, transmitted, and interpreted*.

Per the Open Decisions of [[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]: language objects **incubate** under C4 type/context with the matching relation-field schema stubs going to **`Coordinates/C/C2/Entities-Properties-Tags/Relation-Fields/Symbolic-Relations/**`** as the next step. The split keeps type-definition (here) cleanly distinct from graph-relation-field schema (C2).

## What Belongs Here

- The six language-object types: [[OracleFrame]], [[ReadingPosition]], [[TranscriptionalClockPacket]], [[SymbolicProtein]], [[NaraDeckContext]], [[PatternPacket]].
- Field-level structure incubation (what fields each object carries, what authority each field is bound to, what its privacy class is).

## What Does Not Belong Here

- Runtime instances of any object (these live as Nara M4 artifacts in the user's lived runtime, not as type entries).
- Graph relation-field schemas — those go to **C2 Relation-Fields / Symbolic-Relations** (next step).
- Plugin protocols — those reference these types but live with the plugins themselves.

## Entries

- [[OracleFrame]] — bounded language-event envelope; every reading is one frame.
- [[ReadingPosition]] — typed position within a spread inside an OracleFrame.
- [[TranscriptionalClockPacket]] — deterministic per-tick packet emitted by [[M3]].
- [[SymbolicProtein]] — ordered chain of clock-packets; the peptide of a reading.
- [[NaraDeckContext]] — deck-inhabitation handle (macro vs session deck roles).
- [[PatternPacket]] — [[M4]]-3 interpretation surface; (p,q) torus-knot classification.

## Authority

- **Engine authority:** [[M3]] Mahamaya — emits TranscriptionalClockPackets, owns the SymbolicProtein algebra.
- **Inhabitant authority:** [[M4]] Nara — owns OracleFrame, ReadingPosition, NaraDeckContext, PatternPacket as M4's lived-symbolic layer.
- **Substrate reference:** [[Symbolic-Systems]] — every language object refers back to one or more symbolic systems for its content.
