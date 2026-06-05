---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/NaraDeckContext"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "deck-context"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[M4'-SPEC]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# NaraDeckContext

[[NaraDeckContext]] is the **deck-inhabitation handle**. It distinguishes and binds two distinct deck-roles whose conflation would erase the difference between a person's lived symbolic language and the bounded reading they happen to be doing today.

## The two deck-roles

**Macro / inhabited deck.** The user's stable symbolic language-context — the deck they have *inhabited* over time. Stored inside the protected [[M4]] personal field as an identity / context handle. Examples: a Tarot reader who has worked the Marseille deck for fifteen years; an I-Ching practitioner whose primary tradition is King Wen with Wilhelm-Baynes overlay. The macro deck shapes long-range symbolic register.

**Session / deck OracleFrame.** The bounded deck/order/spread/randomness field for a specific reading — held inside an [[OracleFrame]]. The session deck may be the macro deck, may overlap partially, or may be a completely different deck for one reading.

## Regulatory relation

- The **macro deck** shapes long-range register.
- The **session deck** emits the local utterance.
- [[M4]]-3 (the integration/interpretation layer) **mediates** between them — and is the only layer with permission to let a session-deck pattern *update* the macro-deck inhabitance, subject to [[M4]].5 / [[M5']] review.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `macro_deck_ref` | DeckManifestRef | identity-layer; protected at M4-0 |
| `session_deck_ref` | DeckManifestRef | bound to an [[OracleFrame]]; protected at M4-3 |
| `inhabitance_strength` | float 0–1 | how deeply the macro deck is inhabited |
| `session_relation` | `identical` / `subset` / `superset` / `disjoint` | session vs macro |
| `update_eligible` | bool | whether session evidence may flow back to macro after review |

## Privacy boundary

The macro deck is the **most protected layer** — identity-relevant; never crosses the [[S2]] graph boundary without explicit [[Epii]] / [[M5']] review. Session decks are protected-local-body per the OracleFrame they inhabit.

## Wikilinks

- Composed with: [[OracleFrame]]
- Interpreted by: [[PatternPacket]] for inhabitance-tracking
- Symbolic substrates: [[Tarot]], [[I-Ching]]
- Authority: [[M4]] Nara — identity layer at M4-0; integration at M4-3
- Review gate: [[M5']] Epii
