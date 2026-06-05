---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/ReadingPosition"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "reading-position"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# ReadingPosition

[[ReadingPosition]] is the **typed position within an [[OracleFrame]]'s spread**. Where the OracleFrame is the bounded language-event envelope, the ReadingPosition is one slot inside that envelope: one card-position in a Tarot spread, one line in an I-Ching hexagram, one codon-slot in a clock-walk.

## Fields

| Field | Type / range | Notes |
| --- | --- | --- |
| `frame_id` | UUID | back-reference to parent [[OracleFrame]] |
| `position_index` | int (0–5 for QL spreads; arbitrary for custom) | the index inside the spread |
| `cp_position_ref` | VAK CP-position reference (`P0`–`P5` / `P0'`–`P5'` or custom) | binds to QL coordinate |
| `orientation` | `upright` / `reversed` / `rotational_indexed` | for Tarot rotational positions, the index is one of 7-or-8 codon-rotational states |
| `card_ref` | TarotCardRef | when this position is a Tarot draw |
| `line_ref` | IChingLineRef | when this position is an I-Ching line (1–6) |
| `codon_ref` | CodonRef | when this position is a clock-walk codon |
| `is_moving_line` | bool | I-Ching only — moving lines generate the Klein-twist Night reading |

## Privacy boundary

Lives inside the parent [[OracleFrame]]; same `protected-local-body` privacy as the frame. The position's `cp_position_ref` is a safe scalar handle and can surface to the [[S2]] graph independently of the card/line content.

## Wikilinks

- Parent: [[OracleFrame]]
- Binds to: [[P0]]–[[P5]], [[P0']]–[[P5']]
- Sources: [[Tarot]], [[I-Ching]], [[Codon]]
- Symbolic substrate: [[Symbolic-Systems]]
