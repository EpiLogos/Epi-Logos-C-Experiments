---
coordinate: "C/C4/Types-Contexts-MOCs/Symbolic-Systems/Nucleotide"
c_4_artifact_role: "definition"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "transcription-substrate"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M3'-SPEC]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# Nucleotide

## Definition

[[Nucleotide]] is **2-bit logic** — the smallest unit of [[M3]]'s symbolic-transcription substrate. Three nucleotides compose a [[Codon]]; four nucleotides exhaust the 2-bit space.

## Bit Semantics

- **bit-0 = polarity** — Yin (0) vs Yang (1).
- **bit-1 = mobility** — Resting (0) vs Moving (1).

## The Four Values

| Nucleotide | Byte | I-Ching value | Line state | Tarot suit | Element |
| --- | --- | --- | --- | --- | --- |
| **A** | `0x00` | 6 | Old-Yin | Cups | Water |
| **T** | `0x01` | 9 | Old-Yang | Wands | Fire |
| **C** | `0x02` | 7 | Young-Yin | Pentacles | Earth |
| **G** | `0x03` | 8 | Young-Yang | Swords | Air |

## Base-Pairing

Pairing is **XOR with `0x01`** — polarity flip, mobility preserved:

- `A (0x00) ↔ T (0x01)` — Old-Yin ↔ Old-Yang.
- `C (0x02) ↔ G (0x03)` — Young-Yin ↔ Young-Yang.

## DNA / RNA Phase Toggle

DNA → RNA conversion is a **single XOR on the polarity bit only**, manifesting as the canonical **T ↔ U** substitution. The substrate doesn't change; only its phase rendering does.

## pp-Charge Integral

Per-suit pp-charge integrals sum to **360** — the same 360 that appears as the dynamic-degree-node count in the [[I-Ching]] line-change graph. This is not coincidence: it is the substrate revealing its rotational closure at the suit/line scale.

## Relationships

- Composes into [[Codon]] (three at a time).
- Drives [[Tarot]] suit assignment and [[I-Ching]] 6/7/8/9 line values simultaneously.
- L2' elemental anchor: see [[L2']].
