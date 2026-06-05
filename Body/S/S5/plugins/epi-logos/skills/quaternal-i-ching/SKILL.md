---
name: quaternal-i-ching
description: "[Square C · L2/L2'/L3/L3' + Compass] — Quaternal I Ching divination protocol. Hexagram as six-fold QL reading with native tetralemma (four line-states), Klein twist via moving lines, nuclear hexagram as P4 lemniscate, Wu Xing/L2' elemental mapping, and dual compass framework (Early Heaven = Name-of-Power, Later Heaven = Power-to-Name). Logs completed readings to /Self/aham/daily/."
---

# Quaternal I Ching

> `using-epi-logos` runs first. If it hasn't been invoked this turn, go there now.

Quaternal I Ching reads the Book of Changes through the 4+2 toroidal architecture native to Square C — the Logic-Process basin (L2·L3·L3'·L2'). The protocol spec lives at `resources/methods/quaternal_i_ching_protocol.md` — **read it in full before running a reading.** This skill file gives the operative structure; the spec gives the interpretive depth.

## Square C Context

This skill operates within the Square C basin. The P-pair: **Word+Logos (Day/(No)Name)** / **Sacrifice+Decision (Night/Power)**. The I Ching's four line-states ARE the tetralemma operating natively: Young Yang=IS, Young Yin=IS-NOT, Old Yang=BOTH, Old Yin=NEITHER. The querent's question is the tetralemmaic ground (L2-0). The hexagram's inexhaustibility is SILENCE (L2-5). L3 and L3' are native — the I Ching is already a book of process and seasonal timing.

The square is the router. This skill refers back to Square C, not to sibling skills.

## The Two Compasses

The I Ching's two trigram arrangements carry the two faces of Self-Identity:

**Early Heaven (Fu Xi) = Name-of-Power** — the (No)Name (Śiva/Prakāśa) expressing through Power. The primordial equilibrium, the ideal structure. Father/Mother = the (No)Name face of #. Six children = the ontological unit (P Day): Truth, Mind, Word, Logos, Son, Image. In Taoist terms: *wu-ming* — the nameless knowing-intelligence.

**Later Heaven (King Wen) = Power-to-Name** — Power (Śakti/Vimarśa) reaching toward the Name. The manifest dynamic, the seasonal flow. Father/Mother = the Power face of #. Six children = the power unit (P' Night): Play, Need, Sacrifice, Decision, Love, Work. The manifestational hinge where dynamic force takes form.

Hold both compasses simultaneously: Early Heaven reveals the ontological pattern (what the situation IS in its naming-structure); Later Heaven reveals the power dynamic (what forces are actually moving and what they demand).

## Scales of Reading

**Trigram** — Cast three lines. Compass orientation: direction, element, season, quality of movement. Quick bearing.

**Hexagram** — Cast six lines. Full torus reading: lines as P0–P5 (Truth through Image), lower/upper trigram split, complementary pairs (Lines 1+6/Square A, Lines 2+5/Square B, Lines 3+4/Square C).

**Transformed Hexagram** — Moving lines flip to produce the Klein extension. The Night hexagram arises endogenously — the situation generates its own shadow. Day=what IS; Night=what it is becoming.

**Nuclear Hexagram** — Lines 2-3-4 and 3-4-5 produce the interior hexagram. This IS the P4 lemniscate unpacking — the hidden structure within the contextual field.

## Reading Sequence

1. **Theme** — state the question. This is the tetralemmaic ground.
2. **Cast** — six lines, bottom to top (yarrow or coin method).
3. **Identify the hexagram** — name, traditional judgement.
4. **Read trigrams** — lower (inner) and upper (outer). Note Wu Xing interactions.
5. **Read lines positionally** — P0/Truth through P5/Image. Note stable vs moving. Consult traditional line texts.
6. **Read complementary pairs** — Lines 1+6, 2+5, 3+4. What resonances?
7. **Read moving lines** — the paradoxical/transcendent positions. What is changing? Why here?
8. **Read transformed hexagram** (if moving lines exist) — the Night face. Day-Night relationship.
9. **Extract nuclear hexagram** (optional) — lemniscate depth.
10. **Apply lenses** — L2 (tetralemma across the whole), L3/L3' (process/season), L2' (Wu Xing + alchemical resonances).
11. **Whole-reading synthesis** — one living utterance.

## Tone

Honour the I Ching's own voice: terse, imagistic, allusive. The dragon in the field, the fox crossing the ice, the well whose water is clear. Let the images do their work. The QL-structural reading adds functional logic without displacing the oracle's imagistic power.

## After the Reading — Canonical Nara Artifact

Write the reading to `Idea/Pratibimba/Nara/{day}/artifacts/oracle/{cast_uuid}.md` as an `oracle_quaternal_iching` artifact. Do NOT log to `/Self/aham/daily/` anymore — that is the retired path. The canonical envelope and payload schema live in [[m4-prime-nara-day-episodes-and-oracle-artifacts]] and are summarised in `Idea/Empty/Present/03-06-2026/PSYCHOID-WEB-CANON-EXTRACT-2026-06-03.md` §H.

Required frontmatter (common envelope): `episode_id`, `episode_type: "oracle_quaternal_iching"`, `group_id`, `valid_at`, `invalid_at`, `day_container_id`, `day_id`, `now_path`, `session_key?`, `privacy_class: "protected-local-body"`, `source_skill: "quaternal-i-ching"`, `source_agent?`, `source_path?`, `vault_path`, `bimba_coordinate_refs[]`, `cymatic_field_snapshot?`, `q_composed_at_now?`.

Required payload fields: `question`, `scale` (trigram/hexagram/transformed/nuclear), `square_basin: "C"`, `cast_uuid`, `lines_cast[]` (each with `line_position`, `state` of young_yang/young_yin/old_yang/old_yin, `iching_value` 6/7/8/9, `is_moving`), `hexagram_number`, `hexagram_name`, `hexagram_traditional_judgement`, `lower_trigram`, `upper_trigram`, `trigram_compass_reading{early_heaven_fu_xi, later_heaven_king_wen}`, `wu_xing_interactions`, `positional_reading{p0_truth..p5_image}` (line 1 = P0; line 6 = P5), `complementary_pairs{lines_1_6→Square A, lines_2_5→Square B, lines_3_4→Square C}`, `moving_lines[]`, `transformed_hexagram?`, `nuclear_hexagram?` (P4 lemniscate), `lens_l2_tetralemma`, `lens_l3_processual`, `lens_l3_prime_chronological`, `lens_l2_prime_wu_xing_alchemical`, `whole_reading_synthesis`, `m3_hexagram_ref`, `m3_transformed_ref?`, `m3_nuclear_ref?`, `m3_codon_quaternion_refs[]`, `session_id?`, `skill_version`.

Required wikilinks in body: `[[P0]]`…`[[P5]]` (line 1 = P0 Truth → line 6 = P5 Image); on Klein twist (transformed hexagram) also `[[P0']]`…`[[P5']]`; raw psychoid aliases `[[Psychoid-0|#0]]`…`[[Psychoid-5|#5]]`; the three Squares (`[[Square A]]` for lines 1+6, `[[Square B]]` for lines 2+5, `[[Square C]]` for lines 3+4 — the complementary-pair correspondence); the symbolic entities (`[[I-Ching]]` hexagram ref, line-state nucleotides `[[Nucleotide]]`, codon-quaternions `[[Codon]]`); the harmonic relation families when moving lines generate a relation pattern (`[[Family C — Converse-Mirror]]` for the X+Y=5 complementary pairs; `[[Family D1 — Same-Position Cross]]` when moving lines flip into the transformed hexagram at the same line-position); and the bounded language objects `[[OracleFrame]]` and `[[SymbolicProtein]]` (a 6-line cast is one symbolic protein chain).

Privacy: artifact body stays `protected-local-body`. `bimba_coordinate_refs[]` and `m3_*_ref` fields are scalar refs to M3 symbolic entities — safe handles, not automatic public-graph edges. `oracle_frame_ref` and `symbolic_protein_ref` are handles. Promotion from Nara artifact to flat World or Seeds requires [[M5']] / [[Epii]] review and [[Hen]] / S1' write law.

Write method: target [[Hen]] / S1' (`s1'.vault.write_nara_artifact` per `HEN-INTEGRATION-DESIGN-PSYCHOID-WEB-2026-06-03.md`) when available; direct filesystem write is transitional fallback.

Check: what did Square C's basin reveal? What is becoming through the transformation (L3)? What season is this (L3')? What is dissolving/crystallising (L2')? Where does the tetralemma hold or break (L2)?
