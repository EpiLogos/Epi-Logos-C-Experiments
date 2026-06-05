---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/TranscriptionalClockPacket"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "transcriptional-clock-packet"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[M3'-SPEC]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# TranscriptionalClockPacket

[[TranscriptionalClockPacket]] is the **deterministic packet emitted by the [[M3]] reading-engine at every clock tick or oracle event**. It is the smallest fully-typed unit of symbolic transcription — one codon, one line-state, one Tarot card, one amino-or-operator — clocked, indexed, and provenance-stamped.

## Field families (per [[M3'-SPEC]] §8.15)

| Family | Sub-fields |
| --- | --- |
| `clock` | `degree720`, `degree360`, `walk_type`, `line_change_slot`, `hexagram_id`, `active_line`, `target_hexagram_id`, `line_change_operator` |
| `aperture` | `m2_mef_lens`, `m3_lens_segments`, `m3_growth_aperture`, `namespace_state` |
| `codon` | `codon_id`, `dna_codon`, `nucleotide_bits`, `i_ching_values`, `quaternion_pp_mm_mp_pm` |
| `generation` | `matrix_path`, `polarity`, `generated_codon`, `rotational_index`, `rotational_state_count`, `rotational_degrees` |
| `transcription` | `rna_codon`, `transcription_state`, `amino_or_operator`, `translation_provenance` |
| `expression` | `tarot_reflection_node`, `tarot_card`, `hexagram_label`, `graph_provenance` |
| `vak` | `cpf`, `ct`, `cp`, `cf`, `cfp`, `cs.code`, `cs.direction` |
| `oracle_frame` | `frame_id`, `subject_ref`, `deck_manifest_id`, … , `cp_position_ref` |
| `readiness` | `dataset_lut_state`, `warnings` |

## Authority and ownership

- **Emit authority:** [[M3]] Mahamaya — only the M3 reading-engine emits valid TranscriptionalClockPackets.
- **Recipient:** [[M4]] Nara — receives the packet as evidence; never mutates [[M4]]-0 identity sources from a live packet.
- **Persistence:** packets persist into [[SymbolicProtein]] chains and as scalar refs in oracle artifacts under `Pratibimba/Nara/{day}/artifacts/oracle/`.

## Privacy boundary

The packet header (clock, frame_id, codon_id) is safe scalar; the full body with VAK address, oracle_frame, and expression is protected-local-derived. [[Hen]] graph-promotion-intent surfaces only the scalar handles.

## Wikilinks

- Aggregates into: [[SymbolicProtein]]
- Bound to: [[OracleFrame]]
- Symbolic substrate: [[Codon]], [[Nucleotide]], [[Tarot]], [[I-Ching]]
- Engine: [[M3]]
- Recipient: [[M4]]
