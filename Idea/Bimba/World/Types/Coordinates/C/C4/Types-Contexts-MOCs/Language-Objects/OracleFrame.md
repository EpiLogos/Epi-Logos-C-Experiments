---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/OracleFrame"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M3"
m_4_nara_domain: "oracle-frame"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# OracleFrame

> "Every reading must be treated as a bounded language event, not as loose cards." — [[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]

[[OracleFrame]] is the **bounded language-event envelope** that wraps every reading. Without an OracleFrame, a reading is just card-text and table-position — symbols loose in air. With an OracleFrame, the reading becomes a bounded utterance with a definite subject, deck-language, entropy provenance, spread grammar, VAK address, and the cross-coordinate context that gives it semantic weight.

## Fields

| Field | Type / range | Authority |
| --- | --- | --- |
| `frame_id` | UUID | locally minted at frame open |
| `subject_ref` | user / entity / session / artifact / relation / system | [[M4]] / [[S3]] |
| `deck_manifest_id` | DeckManifestRef | [[M3]] |
| `deck_version` | semver | [[M3]] |
| `deck_order_hash` | hash | [[M3]] |
| `entropy_mode` | `sacred_random` / `seeded_replay` / `manual` / `graph_selected` | configured at frame open |
| `entropy_provenance` | trace of seed/source | recorded at frame open |
| `spread_grammar` | `single` / `triad` / `sixfold_ql` / `custom_cp_set` / `clock_walk` / `symbolic_orf` | configured at frame open |
| `vak_address` | object with `cpf`, `ct`, `cp`, `cf`, `cfp`, `cs` sub-fields | per VAK runtime |
| `context_handles` | object with `day_now`, `redis_temporal`, `psyche_context`, `kbase_source_pool`, `graph_provenance` | per active runtime |

## Epigenetic contract

Per [[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]: deck-organisation / order / reversals / entropy are **epigenetic conditions over transcription**. They are not decorative — they are the conditions under which symbolic transcription becomes utterance.

## Privacy boundary

Default `privacy_class: protected-local-body`. The OracleFrame may surface its handles (`frame_id`, `subject_ref`, `deck_manifest_id`) into the [[S2]] graph as scalar references, but its body — the actual cards/lines cast and their interpreted positions — stays protected at [[M4]].

## Wikilinks

- Composes: [[ReadingPosition]], [[TranscriptionalClockPacket]], [[SymbolicProtein]], [[NaraDeckContext]]
- Used by: [[Tarot]], [[I-Ching]]
- Engine: [[M3]]
- Inhabitant: [[M4]]
- Runtime hosts: [[S3]], [[S4]]
- Plugin protocols: [[quaternal_tarot_protocol]], [[quaternal_i_ching_protocol]]
