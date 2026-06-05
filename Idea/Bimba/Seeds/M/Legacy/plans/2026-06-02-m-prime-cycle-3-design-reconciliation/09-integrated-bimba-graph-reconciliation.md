# Track 09 — Integrated Bimba-Graph Reconciliation

Reconciles the integrated bimba-graph substrate across the four corpora. The substrate is **stronger than the surface** — S2 already carries Neo4j + n10s + GDS + OWL/SHACL + `RelationshipManager` writes + `PromotionPlan` + the 109-node Anuttara language map; but the m0-anuttara Theia widget is a single inspector with no graph canvas, no per-layer routing, no asset render, no CRUD path. Three live contradictions concentrate here: full-CRUD vs governed-route, two-relation-families discriminator absence, `c_1_*` naming round-trip. One genuine schema-property orphan: image-assets-on-nodes.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`, `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md`, `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … Sheet1.csv` (canonical source for the six Ananda vortex matrices — `0X+1 … 11X+1` rows × 0-9 positions compile to `.rodata` at `m1.c:22-114`; inner-sum totals at rows 5X / 6X source `VORTEX_5X_CEILING=24` / `VORTEX_6X_STRUCTURE=8` at `m1.h:425-426`)
- Companions: `Body/S/S2/graph-schema/src/lib.rs` (relation registries), `Body/S/S2/graph-services` (ontology + GDS + sync_coordinator), `Body/S/S3/gateway-contract/src/lib.rs` (current `s2.graph.{query,node,traverse}` registration)
- Full row-level reconciliation: `plan.runs/wave-b-integrated-bimba-matrix.md` + `plan.runs/15-m1-2-ananda-vortex-research.md` (Vortex Modulae CSV citation)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S2/graph-schema/src/lib.rs` 65-relation registry + `anuttara-language` property namespace; `Body/S/S2/graph-services/src/{ontology.rs,gds.rs,sync_coordinator.rs,relationship_manager.rs,dataset_import.rs}` (all landed); single `:Bimba` label + `coordinate` property; `pointers.rs` PointerWeb computation. Cycle 2 Track 11 closed S2 substrate; cycle 3 closes consumer integration.

## Tranches

1. **9.1 — M0' six-layer surface contract — author per-layer routing model** *(doc-ahead-landing; sibling of Tranche 01.1)*

   Extend `m0-inspector.ts` model with discriminated layer enum `{lang, ql, rel, time, pers, pedag}` + six tab routes in widget. Single S2 query path shared across layers. Sibling of M0 Track 01.1 — M0 owns the spec patch; this tranche owns the integrated routing model that propagates across renderings.

   Verification: `cd Body/M/epi-theia/extensions/m0-anuttara && yarn build`; `grep -E "layer:.*'(lang|ql|rel|time|pers|pedag)'" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`.

2. **9.2 — Two-relation-families schema discriminator** *(spec-ahead-integration; DR-IG-1 VALIDATED)*

   Add `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` to `RELATIONSHIP_PROPERTY_SPECS`. Populate via `dataset_import` + `sync_coordinator`. Current schema has structural skeleton in `RELATIONSHIP_TYPE_SPECS`; correspondential relations (`HAS_DECAN`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `VORTEX_SPIRIT_AXIS`, etc.) land via `DatasetImporter::sanitize_rel_type` without a discriminator. CCT-13 owns the canonical naming sweep (`kernel-resonance` → `kernel_core`).

   Verification: DR-IG-1 ratified; `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema relation_family_enum_present`.

3. **9.3 — Image-assets-on-nodes schema slot + dataset-import path** *(no-orphan-fill; merges with Tranche 01.6)*

   Add `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) to `GraphPropertySpec`. Extend `dataset_import.rs` field map to lift asset/seal/sigil/glyph keys. Add inspector render slot. Tranche 01.6 owns the M0 inspector-side; this tranche owns the schema property + dataset-import. Because this is a new load-bearing schema slot not yet ratified by a DR, gate implementation behind candidate DR-M0-4 / explicit user final-validation.

   Verification: `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-services dataset_import::asset_field_mapping`; `grep -n c_1_asset_uri Body/S/S2/graph-schema/src/lib.rs`.

4. **9.4 — Governed-route gateway posture** *(doc-ahead-landing; DR-M0-1 VALIDATED)*

   Do **not** add raw `s2.graph.{create,update,delete}` as M0' chrome affordances. Patch UX/spec prose to governed-route via M5-5 Logos Atelier review / dry-run / governed-promote. Any future write methods must be M5-governed promotion receipts, not M0' CRUD.

   Verification: `grep -nE 's2\.graph\.(create|update|delete)' Body/S/S3/gateway-contract/src/lib.rs` returns no M0' direct CRUD route; M0' inspector exposes governed-route proposal deep-link only.

5. **9.5 — One-substrate / three-rendering integration plugin ownership** *(spec-ahead-integration; cross-link to Tranche 07.3)*

   Author closing-tranche contract for `plugin-integrated-1-2-3` (Track 07.3) to explicitly own B-8, B-9, B-12: solar anchor, planetary placement, cross-surface edit propagation listener via kernel-bridge profile-tick events.

   Verification: `ls Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`; `cd Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && yarn build`; composition contract names B-8/B-9/B-12 explicitly.

6. **9.6 — M0-3' synchronic community + diachronic clock overlay** *(spec-ahead-integration; sibling of Tranche 01.5)*

   Wire `gds_tangent_overlay()` output through kernel-bridge into M0-3' panel distinguishing synchronic (community) vs diachronic (`world_clock` + Graphiti episode handles). Depends on M3 Track 04.3 (clock overlay rendering) + M5 episodic deposit.

   Verification: `cargo check -p epi-s2-graph-services && cargo test -p epi-s2-graph-services gds::option1_projection_plan_present`; `grep -n 'M0-3' Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx`.

7. **9.7 — One-substrate / no-fork invariant codification** *(aligned-only-note)*

   Codify the **B-8 non-fork invariant** as a cross-referenced note in `M0'-SPEC`, `M2'-SPEC`, `M3'-SPEC`, and the `plugin-integrated-1-2-3` contract. Single `:Bimba` label + `coordinate` property + one schema crate + one rendering composition seam. No code change.

   Verification: `grep -n 'one substrate' Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`.

8. **9.8 — Anuttara property naming round-trip** *(spec-ahead-integration; DR-M0-2 VALIDATED)*

   Owns DR-M0-2 graph-services side. Canonical source properties are coordinate-prefixed `c_1_*`; unprefixed `symbol` / `formulation_type` are alias-only via `OntologyPropertyMapping` and inspector provenance. No either/or remains open.

   Verification: `cargo test -p epi-s2-graph-services ontology::anuttara_property_mappings_round_trip`; `grep -nE 'c_1_(symbol|complete_formulation|form)' Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`.

9. **9.9 — M0' graph chrome ↔ M5-0' library chrome Klein seam** *(spec-ahead-integration; DR-TUI-1 VALIDATED)*

   Wire the existing M0' graph chrome and M5-0' Library/Gnostic Namespace as one Klein surface joined by coordinate tagging: direct `bimba_coordinate` plus LLM-classified `bimba_resonances`. No standalone `bimba-graph-viewer` extension and no generic graph/file/agent "view mode" ontology. The user path is map traversal; the library surfaces under the traversed coordinate.

   Verification: `grep -rn "bimba_coordinate\|bimba_resonances" Body/S/S5/epi-gnostic/ Body/M/epi-theia/extensions/ide-shell-m0-m5`; map-walk → library-surface test passes without adding a new graph-viewer package.

10. **9.10 — S2 gateway exposure of graph methods** *(spec-ahead-integration; S2-ARCHITECTURE §10.2 S2.D)*

   Expose existing S2 graph-services methods through gateway-contract / kernel-bridge so M' surfaces do not bypass the S-stack: `s2.graph.gds.tangent_overlay`, `s2.graph.ontology.reload`, `s2.graph.seed.snapshot`, `s2.graph.core65.audit`, `s2.graph.promotion.dry_run`, `s2.graph.promotion.commit`, and `s2.graph.relation_family.list`. This wraps existing GraphMethodService work; it is not new graph substrate.

   Verification: `grep -n "s2.graph.gds.tangent_overlay\|s2.graph.relation_family.list" Body/S/S3/gateway-contract/src/lib.rs`; gateway tests route each method through S2 graph-services.

11. **9.11 — C-layer graph parser + retrieval intelligence** *(spec-ahead-integration; depends on CCT-15 + DR-S1-5)*

   Make C coordinates operational as the graph's semantic typology layer, not just a valid coordinate prefix. `CoordinateArrayParser` / query extraction must surface C-family metadata (`c_layer_role`, `semantic_authority`, `world_type_path`, `crystallisation_state`) for C0-C5 and must treat C-prime as non-authoritative until the C-prime VAK ancestry audit closes. `CoordinateSearchScope` gains a C-layer/type-ontology scope triggered by terms such as `type`, `kind`, `entity`, `property`, `tag`, `alias`, `relation field`, `template`, `form`, `canvas`, `diagram`, `MOC`, `context`, `World graduation`, and explicit C-coordinate mentions. Hybrid GraphRAG must use coordinate-property prefix filters and C-layer boosts before widening to S/M/P/L qualifiers.

   Implementation targets: `Body/S/S2/graph-services/src/coordinate.rs`, `retrieval_query.rs`, `retrieval/hybrid.rs`, `Body/S/S2/graph-schema/src/lib.rs`, and a new live graph migration linking `C0`-`C5` to `Idea/Bimba/World/Types/Coordinates/C/**` authority paths. The migration must not introduce top-level semantic peer roots under `World/Types`; it should attach same-name `.md` and `.canvas` MOC evidence to C authority nodes.

   Verification: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test coordinate_query_contract c_layer`; `cargo test --offline --manifest-path Body/S/S2/graph-schema/Cargo.toml --test coordinate_prefix_properties`; live GraphRAG query `"entity property alias relation field"` returns C2 authority nodes before general Bimba results; live GraphRAG query `"architecture diagram canvas MOC"` returns C3/C4 authority nodes before S/M qualifiers.

12. **9.12 — Hen graph-promotion C-first evidence contract** *(spec-ahead-integration; depends on CCT-14 + CCT-15)*

   Graph promotion must classify artifacts C-first before applying other coordinate-family qualifiers. Hen emits `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, and `c_layer_path` from World/Types ancestry and frontmatter. These fields become node properties and relation evidence in S2 graph promotion. C2 entity candidates, C3 diagram/canvas forms, C4 type/MOC authorities, and C5 World graduation receipts must produce distinct graph evidence, so agents can track notes/nodes/entities through the Empty -> World/Types -> flat World lifecycle.

   Implementation targets: `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`, Hen artifact evidence collection, S2 `sync_coordinator` property proposal guidance, and S3 gateway receipts for `s1'.type.classify_c_layer`, `s1'.entity.promote_to_type`, and `s1'.world.graduate`. Smart Env remains read-only evidence; it must not mutate graph canon directly.

   Verification: `cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test c_layer_typology_classification`; `cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test entity_candidate_lifecycle`; graph-promotion fixture for a C2 entity candidate includes `type_coordinate = C2`, aliases, candidate state, and accepted wikilinks; fixture for a C5 graduation receipt includes source C authority path and flat World target.
