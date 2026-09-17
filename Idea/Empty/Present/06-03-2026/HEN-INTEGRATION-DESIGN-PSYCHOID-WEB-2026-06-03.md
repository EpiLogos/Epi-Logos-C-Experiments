---
coordinate: "S1'"
c_4_artifact_role: "design-spec"
c_1_ct_type: "CT2"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "present-design"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
  - "[[S1'-SPEC]]"
  - "[[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]"
  - "[[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]]"
  - "[[m4-prime-nara-day-episodes-and-oracle-artifacts]]"
---

# Hen Integration Design — Psychoid Web And Nara Artifact Routes

## Purpose

The [[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]] introduces a substantial body of new vault artifacts: psychoid wells, relation-family grammars, 3×3 squares, P/L coordinate MOCs, symbolic system definitions, language-object schemas, and the Nara oracle artifact pipeline that links them.

The plan proposes new S1' gateway surfaces. This document reconciles those proposed names with the existing [[Hen]] compiler architecture at `Body/S/S1/hen-compiler/` and `Body/S/S1/hen-compiler-core/`, so implementation does not introduce parallel naming and the proposals can either land as channels in the existing ledger surface or as functions on the existing residency module.

## Existing Hen Surfaces (Inventory)

Per `Body/S/S1/hen-compiler/scripts/hen_residency.py` and `hen_compile_plan.py`:

### Ledger Channels (existing tuple `ENVELOPE_LEDGER_CHANNELS`)

| Channel | Ledger | Compiler | Return |
| --- | --- | --- | --- |
| transport | transport.ledger | transport_compiler | transport_ctx |
| runtime | runtime.ledger | runtime_compiler | runtime_ctx |
| temporal | temporal.ledger | temporal_compiler | temporal_ctx |
| coordinate | coordinate.ledger | coordinate_compiler | coordinate_ctx |
| residency | residency.ledger | residency_compiler | residency_ctx |
| context | context.ledger | context_compiler | context_pool |
| environs | environs.ledger | environs_compiler | environs_ctx |
| execution | execution.ledger | execution_compiler | execution_ctx |
| episodic | episodic.ledger | episodic_compiler | episode_ctx |
| crystallisation | crystallisation.ledger | crystallisation_compiler | crystallisation_ctx |
| improvement | improvement.ledger | improvement_compiler | improvement_ctx |
| ql | ql.ledger | ql_compiler | ql_ctx |

### Existing scripts/modules

- `hen_residency.py` — residency contracts.
- `hen_compile_plan.py` — compile plan generation.
- `compile.py`, `flush.py`, `query.py`, `lint.py` — pipeline operators.
- `hen-compiler-core/src/`: `wikilinks.rs`, `frontmatter.rs`, `relation_inference.rs`, `graph_promotion.rs`, `property_intelligence.rs`, `artifact_evidence.rs`, `compile_plan.rs`, `smart_env_link_candidates.rs`.

The existing Rust core already handles the load-bearing concerns the plan invokes: wikilink integrity, frontmatter parsing, relation inference, graph-promotion-intent generation, and artifact evidence accumulation.

## Plan-Proposed Surfaces — Reconciliation

The plan proposes five new S1' surfaces. Mapping each to existing structure:

### 1. `s1'.type.classify_psychoid_layer`

**Reconciled as:** new operation on `hen_residency.py` returning a `PsychoidLayerClassification` dataclass, NOT a new ledger channel. Reason: classification is a static decision (does this file belong at `Psychoids/#/#n`, `Coordinates/P/Pn`, or `Coordinates/L/Ln`?). It does not produce a ledger episode.

**Behavior:**
- Input: `(file_path, frontmatter, body_wikilinks)`.
- Output: `PsychoidLayerClassification(layer in {0_raw_psychoid, 1a_p_position, 1b_l_lens, 1c_c_classification, none}, confidence, evidence_links[])`.
- Routing rules:
  - If `coordinate:` matches `Psychoids/#/#[0-5]` and `aliases:` includes `#n`, classify as `0_raw_psychoid`.
  - If `coordinate:` matches `P[0-5]` or `P[0-5]'`, classify as `1a_p_position`.
  - If `coordinate:` matches `L[0-5]` or `L[0-5]'`, classify as `1b_l_lens`.
  - Otherwise scan body wikilinks: if 3+ links to psychoid wells AND 2+ links to P/L positions, classify as `1c_c_classification` (composite/derivative).
  - Otherwise `none`.
- Used by [[Hen]] at residency-decision time before folder placement.

### 2. `s1'.type.classify_symbolic_system`

**Reconciled as:** new operation on `hen_residency.py`. Classifier returning `SymbolicSystemClassification`.

**Behavior:**
- Input: `(file_path, frontmatter, body_wikilinks)`.
- Output: `SymbolicSystemClassification(system in {tarot, iching, codon, nucleotide, ql_music, generic, none}, m3_authority_present: bool, nara_usage_present: bool)`.
- Routing rules:
  - Frontmatter `c_0_source_coordinates` containing `[[M3'-SPEC]]` OR body referencing `M3` symbolic transcription → m3_authority_present = true.
  - Filename matches the canonical names OR body has 5+ system-specific keyword refs → identify the system.
  - Routes file to `Coordinates/C/C4/Types-Contexts-MOCs/Symbolic-Systems/{System}/` if m3_authority_present.
  - Routes Nara usage artifacts to `Pratibimba/Nara/{day}/artifacts/oracle/` per the Nara artifact protocol.

### 3. `s1'.type.classify_reading_language_object`

**Reconciled as:** new operation on `hen_residency.py`.

**Behavior:**
- Input: `(file_path, frontmatter, body_wikilinks)`.
- Output: `ReadingLanguageObjectClassification(object_kind in {oracle_frame, reading_position, transcriptional_clock_packet, symbolic_protein, nara_deck_context, pattern_packet, none}, runtime_owner in {m3, m4, s3, s4, none}, privacy_boundary in {protected_local_body, protected_local_derived, public_current_context, public_canonical})`.
- Routing:
  - Schema-incubation files → `Coordinates/C/C4/Types-Contexts-MOCs/Language-Objects/{ObjectName}.md`.
  - Schema refs and graph-side relation forms → `Coordinates/C/C2/Entities-Properties-Tags/Relation-Fields/Symbolic-Relations/{ObjectName}-schema.md`.
  - Runtime instances of `OracleFrame`, `TranscriptionalClockPacket`, `SymbolicProtein`, `PatternPacket` → never to public vault; protected-local under `Pratibimba/Nara/{day}/`. Hen ENFORCES this.

### 4. `s1'.vault.write_nara_artifact`

**Reconciled as:** new entrypoint on `compile.py` that wraps the existing write path with the Nara artifact contract.

**Behavior:**
- Input: `(artifact_payload, oracle_frame_ref?, packet_chain_ref?, day_id, privacy_class = "protected-local-body")`.
- Step 1: classify via `classify_reading_language_object` to confirm artifact kind and privacy.
- Step 2: build canonical frontmatter envelope per `m4-prime-nara-day-episodes-and-oracle-artifacts` §2.2 — `episode_id`, `episode_type`, `group_id`, `valid_at`, `invalid_at`, `day_container_id`, `day_id`, `now_path`, `session_key?`, `privacy_class`, `source_skill?`, `source_agent?`, `source_path?`, `vault_path`, `bimba_coordinate_refs[]`, `cymatic_field_snapshot?`, `q_composed_at_now?`.
- Step 3: build payload-specific section for `oracle_quaternal_tarot` or `oracle_quaternal_iching` (see canon extract section H for field list).
- Step 4: emit wikilinks to: spread positions (`[[P0]]`...`[[P5]]`, `[[P0']]`...`[[P5']]` if Klein), psychoid aliases (`[[Psychoid-0|#0]]`...`[[Psychoid-5|#5]]`), the relevant Square (Square C for Tarot; Square A/B/C trio for I-Ching per moving-line pattern), symbolic entities drawn/cast, and the harmonic relation family when a complementary pair or moving-line relation makes it obvious.
- Step 5: write to `Pratibimba/Nara/{day}/artifacts/oracle/{cast_uuid}.md`.
- Step 6: append a residency-ledger entry recording: source_skill, cast_uuid, oracle_frame_ref (handle, not body), symbolic_protein_ref (handle if multi-packet), bimba_coordinate_refs (scalar refs to M3 symbolic entities), privacy_class.
- Step 7: emit graph-promotion-intent for SAFE handles only — never the protected body.

### 5. `s1'.semantic.link_psychoid_web`

**Reconciled as:** new function in `hen-compiler-core/src/wikilinks.rs` (Rust side) wrapping the existing wikilink resolver with psychoid-web semantic awareness.

**Behavior:**
- Input: `(source_file_path, wikilink: &str)` where the wikilink may be in any of the canonical forms: `[[Psychoid-n|#n]]`, `[[Pn]]`, `[[Pn']]`, `[[Ln]]`, `[[Ln']]`, `[[Square A|B|C]]`, `[[Family X — Y]]`, etc.
- Output: `PsychoidWebLink(target_path, link_kind in {psychoid_well, p_day, p_night, l_day, l_night, square, family, system, language_object, oracle_artifact}, semantic_class)`.
- Used by the relation-inference pass to detect when a file participates in the psychoid web and what its semantic neighborhood is.
- Used by graph-promotion-intent to identify which wikilinks count as `psychoid_membership` evidence vs. `symbolic_system_reference` evidence vs. `lens_refraction` evidence — these become distinct relation labels in the [[S2]]-promoted graph (subject to S2 review per [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]).

## New Ledger Channel — Recommended

The plan implies tracking psychoid-web compilation events distinctly. Add a new channel:

| Channel | Ledger | Compiler | Return |
| --- | --- | --- | --- |
| **psychoid** | psychoid.ledger | psychoid_compiler | psychoid_ctx |

Position this channel between `coordinate` and `residency` in `ENVELOPE_LEDGER_CHANNELS`. It records:
- Which psychoid wells / P-positions / L-lenses an artifact touches.
- Which relation families it instantiates.
- Which symbolic system(s) it references.
- Which language objects it materialises (and their privacy class).

The psychoid_compiler is downstream of `coordinate_compiler` (since classification needs the resolved coordinate context) and upstream of `residency_compiler` (since residency decisions for symbolic / Nara artifacts depend on psychoid-web semantics).

`ql_first_channels()` should include `psychoid` for QL-first runs.

## Privacy Enforcement

Critical contract — Hen MUST enforce these on write:

1. Bodies of any artifact under `Pratibimba/Nara/{day}/artifacts/oracle/` carry `privacy_class: protected-local-body`. No public-graph promotion permits this body content into [[S2]].
2. `bimba_coordinate_refs[]` are SCALAR refs (string identifiers of M3 symbolic entities), not link-tracked relations. They permit safe retrieval of the M3 form without exposing the M4 lived body.
3. `oracle_frame_ref` and `symbolic_protein_ref` are HANDLES (UUIDs or path-style refs to bounded session artifacts), never inlined contents.
4. Promotion from Nara artifact to flat `World/*.md` or `Seeds/` requires [[M5']] / [[Epii]] review through the existing crystallisation channel — `s1'.vault.write_nara_artifact` MUST NOT bypass this.

## Wikilink Integrity On Rename/Move

The plan requires rename and move operations to preserve aliases and inbound links. This is already in scope of `hen-compiler-core/src/wikilinks.rs`. New work:

- Extend `wikilinks.rs` to recognise the psychoid alias pattern `[[Psychoid-n|#n]]` as a single unit so a rename of `Psychoid-2.md` updates references that display as `#2` correctly.
- Add the canonical wikilink vocabulary (per canon extract) to a `known_psychoid_links` constant set used by the link-candidate pool.

## Entity Capture Contract

Per plan, new symbolic entities discovered through readings (e.g. a Tarot card or hexagram that does not yet have an entity file) should enter the C2 entity-candidate lifecycle, NOT appear as loose root files.

`s1'.vault.write_nara_artifact` MUST:
1. Scan the artifact wikilinks for entity refs not yet registered in `Coordinates/C/C2/Entities-Properties-Tags/Entities/`.
2. Emit candidate stubs to `Coordinates/C/C2/Entities-Properties-Tags/Entity-Candidates/{entity-slug}.md` with frontmatter `c_4_artifact_role: "entity-candidate"`, `c_5_crystallisation_state: "candidate"`, `c_0_source_coordinates` containing the oracle artifact path, and a body field listing the contexts in which the candidate appeared.
3. NEVER auto-promote candidates to entities. Promotion requires [[Epii]] review.

## Implementation Order

1. `hen_residency.py` — add the three classifier functions (`classify_psychoid_layer`, `classify_symbolic_system`, `classify_reading_language_object`). Pure functions; testable with fixtures.
2. `hen-compiler-core/src/wikilinks.rs` — extend with `PsychoidWebLink` resolver and `known_psychoid_links` constant.
3. `ENVELOPE_LEDGER_CHANNELS` — add `psychoid` channel; thread compiler through `compile.py`.
4. `compile.py` — add `write_nara_artifact` entrypoint per behavior spec above.
5. Tests:
   - `tests/test_psychoid_classifier.py` — fixtures for each classifier.
   - `tests/test_nara_write.py` — write a sample tarot artifact and confirm wikilinks, frontmatter, privacy_class, and ledger entries.
   - `tests/test_rename_preserves_psychoid_aliases.rs` — rename a psychoid well; confirm `[[Psychoid-2|#2]]` references update.
   - `tests/test_protected_body_isolation.py` — confirm graph-promotion-intent emits handles only, never body content, from a `protected-local-body` artifact.
   - `tests/test_entity_candidate_capture.py` — confirm a new symbolic entity in an oracle artifact creates a candidate stub.

## Open Items For Reconciliation Pass

1. The existing `coordinate_compiler` already does some of what `classify_psychoid_layer` proposes — explicit boundary needed before merging the new classifier so behavior is not duplicated. Recommended pass: read the full `coordinate_compiler` and `hen_compile_plan.py` before naming new functions.
2. The new `psychoid` ledger channel should be approved against the existing channel-naming pattern (single noun, lowercase). Alternative names considered: `symbolic`, `archetype`. `psychoid` is preferred because it names the layer-0 substrate without privileging any one symbolic system.
3. The Nara write path may already partially exist in some form via the Nara skill scripts; before implementing `write_nara_artifact`, audit `Body/S/S4/plugins/` and the Quaternal Tarot / I-Ching skill protocols at `vendors/epi-logos/skills/quaternal-*` to avoid parallel implementations.

## Success Criteria

This integration succeeds when:

1. All five proposed S1' surfaces have either landed as concrete functions on `hen_residency.py` / `compile.py` / `wikilinks.rs` OR have been explicitly subsumed into a pre-existing surface with a documented mapping.
2. The new `psychoid` ledger channel runs cleanly through the existing compile/flush pipeline.
3. A sample oracle artifact written through `write_nara_artifact` validates against canon extract section H frontmatter spec and passes all four privacy-enforcement contracts.
4. Wikilink rename of any psychoid well, P-position, L-lens, relation family, symbolic system, or language object preserves all inbound links INCLUDING the `[[Psychoid-n|#n]]` alias pattern.
5. New symbolic entities discovered in oracle readings appear as C2 entity-candidates, not as loose root files.
6. Tests above land green.
