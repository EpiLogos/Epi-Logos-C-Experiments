---
coordinate: "M/M'"
status: "cross-system-architecture"
updated: "2026-06-03"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[S4'-SPEC]]"
  - "[[ql_physics_anthropic_chemistry_alignment_v2]]"
---

# M Symbolic Language Architecture

This file names the cross-system linguistic unity that has been implicit in the Mahamaya and Nara work: codon, hexagram, Tarot, element, amino/operator, clock, and VAK are one symbolic language when they are carried through a bounded context frame.

The codon is the system's symbolic transcription unit. It is not an apology to biological genetics and not a metaphor pasted onto Tarot. In this architecture, a codon is the binary-symbolic unit through which I-Ching line state, Tarot expression, elemental quaternion, and amino/operator translation become one readable language. A single codon/card is a motif; an ordered chain of clocked packets is a symbolic peptide or protein. Nara reads that protein as an identity-pattern, event-pattern, entity-pattern, or session-pattern according to VAK and privacy law.

## Register

This file follows [[ql_physics_anthropic_chemistry_alignment_v2]] in register: the mathematics here is psychoid-symbolic and operational inside the Epi-Logos system. The physical bridges in the v2 alignment paper are source-warranted correspondences and inspector surfaces. The reading engine does not need to reduce itself to physical genetics in order to be exact. Its exactness is the determinacy of its own symbolic algebra and graph-backed runtime chain.

The internal formula is:

```text
VAK-addressed context
  -> bounded oracle/deck/clock frame
  -> Mahamaya codon/hexagram/Tarot transcription
  -> ordered packet-chain
  -> Nara PatternPacket / Q_activity / trajectory evidence
  -> M5/Epii review and canon-return when needed
```

## M0-M4 Descent Of The Language

The language is distributed across the M stack:

| Layer | Function in the language |
|---|---|
| M0 | archetypal number grammar, 10+2 / 12-fold mirror-frame/operator source language, zodiacal/archetypal pre-grammar |
| M1 | mod12 vortex motion, tick, +1 parent, toroidal rotation, Ananda matrix arithmetic |
| M2 | 72-fold correspondential field, zodiac/decan/element/chakral/solar modulation, epigenetic regulatory context |
| M3 | 64-fold binary transcription, 384 generated states, 472 codon-rotation surface, Tarot/I-Ching/amino/operator sequence emission |
| M4 | Nara interpretation, deck-inhabitation, lived identity/context, oracle artifacts, strange-attractor/trajectory integration |
| M5 | reviewed teaching, source archaeology, canonization, pathway review, and return into future readings |

The v2 physics/chemistry bridge sharpens the 12-fold seam. M0-3 gives the twelve number-archetypes; M1-2 gives the mod12 vortex motion of that number language; M2 gives the zodiacal/decanic field in which four elements occur threefold; M3 gives the binary transcription engine. Carbon is the physical-symbolic hinge because C12 is `3 x 4` at the nuclear level and `2 + 4` at the electronic/valence level. This is not a side analogy: it is the same 3/4 dilemma becoming a life-chemistry archetype, then reappearing in the reading grammar as four elements expressed across three zodiacal modes and thirty-six decans.

```text
M0-3 twelve archetypes
  -> M1-2 mod12 vortex rows
  -> M2 4 elements x 3 modalities = 12 signs
  -> M2 decans: 12 x 3 = 36; polarity/day-night doubling = 72
  -> M3 72 -> 64 DET reception and codon transcription
  -> M4 embodied recognition
```

## OracleFrame

Every reading must be treated as a bounded language event, not as loose cards. The runtime frame is:

```yaml
OracleFrame:
  frame_id: string
  subject_ref: user | entity | session | artifact | relation | system
  deck_manifest_id: string
  deck_version: string
  deck_order_hash: string
  entropy_mode: sacred_random | seeded_replay | manual | graph_selected
  entropy_provenance: string
  spread_grammar: single | triad | sixfold_ql | custom_cp_set | clock_walk | symbolic_orf
  vak_address:
    cpf: "(00/00)" | "(4.0/1-4.4/5)"
    ct: [CT0, CT1, CT2, CT3, CT4, CT4b, CT5]
    cp: [CP4.0, CP4.1, CP4.2, CP4.3, CP4.4, CP4.5]
    cf: string
    cfp: CFP0 | CFP1 | CFP2 | CFP3 | CFP4 | CFP5 | Z
    cs:
      code: CS0 | CS1 | CS2 | CS3 | CS4 | CS5
      direction: Day | Night'
  context_handles:
    day_now: optional string
    redis_temporal: optional string
    psyche_context: optional string
    kbase_source_pool: optional string
    graph_provenance: [string]
```

The deck is therefore an active bounded alphabet. A user's macro deck can be part of their inhabited Nara identity context; a session deck can be a bounded reading language for a specific encounter. Deck organization, order, reversals, spread grammar, and entropy provenance are not decorative. They are epigenetic conditions over transcription.

True randomness and replayability must both exist. Sacred random draw/cast produces the living event; seeded replay makes review, tests, and Epii audit possible. Both modes must record provenance.

## VAK As Reading Grammar

VAK is the orchestration economy of the language. It decides what kind of utterance a reading is, how many positions are in play, which QL positions are active, which direction the sequence moves, and what kind of agentic/narrative work may follow.

| VAK layer | Reading role |
|---|---|
| CPF | consent and dialogical/autonomous polarity of the read |
| CT | content type: relational, definitional, operational, pattern, contextual, integrative |
| CP | active QL position set; the spread's actual semantic skeleton |
| CF | constitutional function / agentic register through which the reading speaks |
| CFP | thread/frame composition: base, parallel, chained, fusion, long-running, nested/meta, Z-cycle |
| CS | context sequence and direction: Day forward synthesis or Night' inverse return |

CP is the bridge between spread size and QL reasoning. A six-card reading can traverse all six CP positions. A three-card reading is not a smaller truth; it is a compressed CP-set with an explicit context-frame law, such as `CP4.0 -> CP4.3 -> CP4.5` for ground-pattern-integration, or `CP4.1 -> CP4.2 -> CP4.4` for definition-operation-context. A single-card pull is a CP point-address. The reading is valid only when its CP-set and CS direction are explicit.

Day/Night' controls direction:

```text
Day:    4.0 -> 4.1 -> 4.2 -> 4.3 -> 4.4 -> 4.5
Night': 4.5 -> 4.4 -> 4.3 -> 4.2 -> 4.1 -> 4.0
```

An inverse pass is therefore not a vibe. It is `CS.direction = Night'` applied to the same OracleFrame, often with a changed CP-set or CFP nesting. A 4/5 depth pass is likewise not arbitrary: it foregrounds CP4.4/CP4.5 and the `(4.5/0)` Psyche/Sophia bridge so the reading can move from lived context into integration and review.

## SymbolicProtein

The output of Mahamaya transcription is:

```yaml
SymbolicProtein:
  sequence_id: string
  frame_id: string
  sequence_mode: single_packet | triad | sixfold_ql | clock_walk | symbolic_orf
  packets: [TranscriptionalClockPacket]
  tarot_sequence:
    - card_ref: string
      position_ref: string
      orientation: upright | reversed | rotational_indexed
      cp: string
      cs_direction: Day | Night'
  iching_sequence:
    - hexagram_id: number
      line_states: [6 | 7 | 8 | 9]
      changing_mask: number
      result_hexagram_id: optional number
  codon_sequence:
    - dna_codon: string
      generated_state: string
      rotational_index: number
      amino_or_operator: optional string
  modulators:
    identity_context: optional string
    journal_context: optional string
    transit_context: optional string
    dream_context: optional string
    kbase_context: optional string
  nara_pattern_packet_ref: optional string
```

Tarot and I-Ching are reciprocal projections over the same symbolic substrate. Tarot gives imaginal/decanic/elemental expression; I-Ching gives line-state and transformation dynamics; codon gives binary/transcriptional address; amino/operator gives sequence function. A Tarot reading can always carry an I-Ching dynamic side, and an I-Ching cast can always surface Tarot/codon expression, because both are projections of the same Mahamaya address field.

## Nara Boundary

Nara receives symbolic proteins as evidence, not as immediate identity mutation. M4-3 integrates packet chains into PatternPacket, Q_activity, trajectory, and strange-attractor/phase-portrait surfaces. M4-0 identity branch data remains stable and review-governed. A recurring sequence may become identity-relevant only through M4.5/M5 review.

Nara's macro cards and inhabited deck define the user's stable language-context. Session decks and bounded reading frames define local utterance-context. The relationship between them is regulatory: the macro deck constrains the user's long-range symbolic register; the session deck emits the local sequence; M4-3 compares, contrasts, and integrates.

## S/S' Runtime Placement

| Stack layer | Responsibility |
|---|---|
| S0 | C/Rust kernel: sacred random, I-Ching cast, Tarot draw, M3 codec, clock/profile, deterministic packet emission |
| S1/S1' | Hen/vault/deck manifests, artifact schemas, seed/source forms |
| S2/S2' | Neo4j/Bimba graph: codon, hexagram, Tarot, amino/operator, VAK, deck and provenance relations |
| S3/S3' | Redis/session/DAY/NOW/SpaceTimeDB temporal context, OracleFrame persistence, replay handles |
| S4/S4' | VAK evaluation, Anima/Psyche orchestration, consent, capability routing, context economy |
| S5/S5' | Epii/Aletheia review, canon promotion, source-pool archaeology, teaching and pathway review |

The implementation target is not a new oracle subsystem. It is a typed bridge so the existing M3 and M4 engines speak the same runtime language.

## Code-Level Integration Anchors

The architecture is already partially present in code. The next implementation work should bind existing pieces through explicit typed projections rather than rebuild oracle logic.

| Code surface | Existing responsibility | Integration implication |
|---|---|---|
| `Body/S/S0/epi-lib/src/m4.c::m4_sacred_random` | consent-gated sacred randomness | supplies `OracleFrame.entropy_mode = sacred_random` and entropy provenance |
| `Body/S/S0/epi-lib/src/m4.c::m4_cast_iching` | six-line three-coin I-Ching cast, changing mask, result hexagram | supplies `iching_sequence`, line states, and reciprocal codon/Tarot projection seed |
| `Body/S/S0/epi-lib/src/m4.c::m4_draw_tarot` | Fisher-Yates Tarot draw over 78 cards | supplies session-deck event tokens and deck-order/draw provenance |
| `Body/S/S0/epi-lib/src/m3.c` / `m3_clock_lut.c` | Tarot-codon LUT, line-change graph, charge/quaternion and wheel law | remains authority for packet transcription and scalar M3 refs |
| `Body/S/S0/portal-core/src/kernel.rs::MathemeHarmonicProfile::with_vak` | attaches `VakAddress` to tick/profile | natural bridge point for `OracleFrame.vak_address` at the profile edge |
| `Body/S/S0/portal-core/src/vak_address.rs` and `Body/S/S4/ta-onta/shared/vak_address.ts` | canonical Rust/TS `VakAddress` shape | do not redefine VAK in reading code; import/mirror this shape |
| `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` | validates dialogical vs mechanistic VAK dispatch | reading dispatch must pass the same CPF/CFP/CF validation |
| `Body/S/S3/graphiti-runtime` | flattened VAK fields and protected episode handling | oracle artifacts should persist VAK attrs without exposing protected bodies |
| `Body/S/S0/epi-cli/src/vault/templates.rs` | VAK frontmatter rendering | reusable pattern for Hen/Nara artifact frontmatter |

The missing typed objects are therefore narrow and explicit:

```text
OracleFrameProjection
ReadingPosition
TranscriptionalClockPacket.vak + .oracle_frame + .cp_position_ref
SymbolicProteinProjection / OracleSequenceProjection
NaraDeckContext / deck_context_handle
```

These belong at the kernel-bridge/profile edge first, then in Nara artifact envelopes, Graphiti episode metadata, and Theia M3/M4 renderers. They should not be introduced as renderer-local ad hoc JSON.
