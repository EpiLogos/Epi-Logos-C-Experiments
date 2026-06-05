---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/SymbolicProtein"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "symbolic-protein"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[M3'-SPEC]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# SymbolicProtein

> "A single packet is a motif. A packet chain is a peptide/protein." — [[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]

[[SymbolicProtein]] is the **ordered chain of [[TranscriptionalClockPacket]]s** emitted by a reading or clock-walk. Where a single packet names one tonal signature in one moment, a SymbolicProtein names a *trajectory* — the way the readings sequence themselves into something that can be read as a coherent utterance with biochemical-grade structural specificity.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `sequence_id` | UUID | identifies the protein |
| `frame_id` | UUID | parent [[OracleFrame]] |
| `sequence_mode` | `single_packet` / `triad` / `sixfold_ql` / `clock_walk` / `symbolic_orf` | the spread-shape that emitted the chain |
| `packets[]` | array of [[TranscriptionalClockPacket]] refs | ordered |
| `tarot_sequence[]` | array of TarotCardRef | the Tarot projection |
| `iching_sequence[]` | array of IChingRef | the I-Ching projection |
| `codon_sequence[]` | array of CodonRef | the underlying codon-chain |
| `modulators` | object | `identity`, `journal`, `transit`, `dream`, `kbase_context` |
| `nara_pattern_packet_ref` | UUID? | back-reference once [[PatternPacket]] interprets this chain |

## Reciprocal projection invariant

Per [[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]: Tarot and I-Ching are **reciprocal projections over the same symbolic substrate**. A SymbolicProtein with `tarot_sequence[]` populated has an equivalent `iching_sequence[]` derivable from the underlying `codon_sequence[]` — they are two readings of one peptide.

## Privacy boundary

Protected-local-derived. The `sequence_id`, `frame_id`, and `sequence_mode` are safe scalar handles; the full packet-chain body stays in the protected M4 vault under `Pratibimba/Nara/{day}/artifacts/oracle/`.

## Wikilinks

- Composed of: [[TranscriptionalClockPacket]]
- Parent: [[OracleFrame]]
- Interpreted by: [[PatternPacket]] in [[M4]]-3
- Symbolic substrate: [[Codon]], [[Tarot]], [[I-Ching]]
- Engine: [[M3]]
