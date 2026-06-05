---
name: quaternal-tarot
description: "[Square C · L2/L2'/L3/L3'] — Quaternal Tarot divination protocol. Six-position toroidal reading through the full Square C basin. Day and Night arcs, complementary pairs, P4 lemniscate sub-reading, and three-level interpretation (concrete/psychological/archetypal). Logs completed readings to /Self/aham/daily/."
---

# Quaternal Tarot

> `using-epi-logos` runs first. If it hasn't been invoked this turn, go there now.

Quaternal Tarot reads any spread through the 4+2 toroidal architecture native to Square C — the Logic-Process basin (L2·L3·L3'·L2'). The protocol spec lives at `resources/methods/quaternal_tarot_protocol.md` — **read it in full before running a reading.** This skill file gives the operative structure; the spec gives the interpretive depth.

## Square C Context

This skill operates within the Square C basin. The P-pair: **Word+Logos (Day/(No)Name)** / **Sacrifice+Decision (Night/Power)**. The tetralemma (L2) is always co-present — every card position can be read through IS/IS-NOT/BOTH/NEITHER/SILENCE. The processual lens (L3) tracks what is becoming; the chronological lens (L3') reads the season; the alchemical lens (L2') reads what dissolves and what crystallises.

The square is the router. This skill refers back to Square C, not to sibling skills.

## Scales of Reading

**Sphere** — Single card. Compass orientation: what quality of energy characterises the moment? Quick bearing.

**Torus** — Six-card Day spread. One card per P-position (P0–P5). Full six-fold QL reading in its explicate form. The core reading.

**Klein** — Six-card Day + six-card Night spread. The Night arc inverts the Day: not contradiction but the analytic face, the shadow, what the Day reading rests on without naming. Together they complete the Klein double-cover.

## Reading Sequence

1. **Theme** — state the question in its deeper form. This is the tetralemmaic ground (L2-0).
2. **Draw and place** — cards into positions P0–P5 (and P0'–P5' if running Klein).
3. **Read positionally** — each card at its P-position. Use the position's question (Why/What/How/Who/Where/Why-for) as the interpretive key.
4. **Read complementary pairs** — P0+P5, P1+P4, P2+P3. What resonances and contradictions emerge?
5. **P4 lemniscate sub-reading** (optional) — draw an additional card or use the P4 card's internal symbolism to unpack the contextual frame's recursive depth.
6. **Night arc** (if Klein scale) — read the six Night cards as the analytic interior of the Day spread.
7. **Apply lenses to the whole** — L2 (tetralemma across the full reading), L3/L3' (growth phase, season), L2' (elemental transformation).
8. **Three-level interpretation** — each card on at least three levels: concrete (life situation), psychological (consciousness), spiritual/archetypal (deep pattern).
9. **Whole-reading synthesis** — weave into a single living utterance, not a sequence of technical observations.

## Tone

The Tarot's own voice is imagistic, symbolic, and allusive. Honour this: let the images speak before the structural analysis arrives. The QL-structural reading adds functional logic, dialectical relationship, and transformation structure — these should be offered clearly but without displacing the cards' own imagistic power.

## After the Reading — Canonical Nara Artifact

Write the reading to `Idea/Pratibimba/Nara/{day}/artifacts/oracle/{cast_uuid}.md` as an `oracle_quaternal_tarot` artifact. Do NOT log to `/Self/aham/daily/` anymore — that is the retired path. The canonical envelope and payload schema live in [[m4-prime-nara-day-episodes-and-oracle-artifacts]] and are summarised in `Idea/Empty/Present/03-06-2026/PSYCHOID-WEB-CANON-EXTRACT-2026-06-03.md` §H.

Required frontmatter (common envelope): `episode_id`, `episode_type: "oracle_quaternal_tarot"`, `group_id`, `valid_at`, `invalid_at`, `day_container_id`, `day_id`, `now_path`, `session_key?`, `privacy_class: "protected-local-body"`, `source_skill: "quaternal-tarot"`, `source_agent?`, `source_path?`, `vault_path`, `bimba_coordinate_refs[]`, `cymatic_field_snapshot?`, `q_composed_at_now?`.

Required payload fields: `question`, `spread_scale` (sphere/torus/klein), `square_basin: "C"`, `cast_uuid`, `cards_drawn[]`, `positional_reading{p0..p5, p4_lemniscate_sub?}`, `night_arc{p0'..p5'}?` (Klein only), `complementary_pairs{p0_p5, p1_p4, p2_p3}`, `three_level_per_card{}`, `lens_l2_tetralemma`, `lens_l3_processual`, `lens_l3_prime_chronological`, `lens_l2_prime_alchemical`, `whole_reading_synthesis`, `m3_tarot_card_refs[]`, `session_id?`, `skill_version`.

Required wikilinks in body: the spread positions `[[P0]]`…`[[P5]]` (and `[[P0']]`…`[[P5']]` on Klein scale); the raw psychoid aliases `[[Psychoid-0|#0]]`…`[[Psychoid-5|#5]]`; the Square C lenses `[[L2]]`, `[[L3]]`, `[[L3']]`, `[[L2']]`; the symbolic entities drawn (`[[Tarot]]` card refs, codon refs); the harmonic relation family when a complementary pair or moving-line pattern makes it obvious (`[[Family C — Converse-Mirror]]` for any X+Y=5 pair); and the bounded language objects `[[OracleFrame]]` (and `[[SymbolicProtein]]` if more than one packet is present in the spread).

Privacy: artifact body stays `protected-local-body`. `bimba_coordinate_refs[]` are scalar refs to M3 symbolic entities — safe handles, not automatic public-graph edges. `oracle_frame_ref` and `symbolic_protein_ref` are handles. Promotion from Nara artifact to flat World or Seeds requires [[M5']] / [[Epii]] review and [[Hen]] / S1' write law.

Write method: target [[Hen]] / S1' (`s1'.vault.write_nara_artifact` per `HEN-INTEGRATION-DESIGN-PSYCHOID-WEB-2026-06-03.md`) when available; direct filesystem write is transitional fallback.

Check: what did Square C's basin reveal as the primary transformation? What is dissolving (L2'), what is becoming (L3), what season is this (L3'), and where does the logic hold or break (L2)?
