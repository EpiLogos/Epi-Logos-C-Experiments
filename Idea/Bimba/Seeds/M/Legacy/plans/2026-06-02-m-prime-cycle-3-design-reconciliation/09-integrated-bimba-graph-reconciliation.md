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

2. **9.2 — Two-relation-families schema discriminator** *(contradiction-decision; routes to DR-IG-1)*

   Decision register entry. If extend-schema chosen, add `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` to `RELATIONSHIP_PROPERTY_SPECS`. Populate via `dataset_import` + `sync_coordinator`. Current schema has structural skeleton in `RELATIONSHIP_TYPE_SPECS`; correspondential relations (`HAS_DECAN`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `VORTEX_SPIRIT_AXIS`, etc.) land via `DatasetImporter::sanitize_rel_type` without a discriminator.

   Verification: DR-IG-1 ratified; `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema relation_family_enum_present`.

3. **9.3 — Image-assets-on-nodes schema slot + dataset-import path** *(no-orphan-fill; merges with Tranche 01.6)*

   Add `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) to `GraphPropertySpec`. Extend `dataset_import.rs` field map to lift asset/seal/sigil/glyph keys. Add inspector render slot. Tranche 01.6 owns the M0 inspector-side; this tranche owns the schema property + dataset-import.

   Verification: `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-services dataset_import::asset_field_mapping`; `grep -n c_1_asset_uri Body/S/S2/graph-schema/src/lib.rs`.

4. **9.4 — CRUD-vs-governed-route gateway extension** *(contradiction-decision; routes to DR-M0-1)*

   On DR-M0-1 resolution: if (a) extend `Body/S/S3/gateway-contract` + `gateway/src/dispatch.rs` with `s2.graph.{create,update,delete}` backed by `PromotionPolicyDecision` enforcement; if (b) downgrade UX §7 to governed-route via S5 surfaces + pedagogy note on inspector.

   Verification: `grep -nE 's2\.graph\.(create|update|delete)' Body/S/S3/gateway-contract/src/lib.rs`; `cargo check -p epi-s3-gateway && cargo test -p epi-s3-gateway dispatch::s2_graph_write_governed`.

5. **9.5 — One-substrate / three-rendering integration plugin ownership** *(spec-ahead-integration; cross-link to Tranche 07.3)*

   Author closing-tranche contract for `plugin-integrated-1-2-3` (Track 07.3) to explicitly own B-8, B-9, B-12: solar anchor, planetary placement, cross-surface edit propagation listener via kernel-bridge profile-tick events.

   Verification: `ls Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`; `cd Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && yarn build`; composition contract names B-8/B-9/B-12 explicitly.

6. **9.6 — M0-3' synchronic community + diachronic clock overlay** *(spec-ahead-integration; sibling of Tranche 01.5)*

   Wire `gds_tangent_overlay()` output through kernel-bridge into M0-3' panel distinguishing synchronic (community) vs diachronic (`world_clock` + Graphiti episode handles). Depends on M3 Track 04.3 (clock overlay rendering) + M5 episodic deposit.

   Verification: `cargo check -p epi-s2-graph-services && cargo test -p epi-s2-graph-services gds::option1_projection_plan_present`; `grep -n 'M0-3' Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx`.

7. **9.7 — One-substrate / no-fork invariant codification** *(aligned-only-note)*

   Codify the **B-8 non-fork invariant** as a cross-referenced note in `M0'-SPEC`, `M2'-SPEC`, `M3'-SPEC`, and the `plugin-integrated-1-2-3` contract. Single `:Bimba` label + `coordinate` property + one schema crate + one rendering composition seam. No code change.

   Verification: `grep -n 'one substrate' Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`.

8. **9.8 — Anuttara property naming round-trip** *(contradiction-decision; routes to DR-M0-2)*

   Owns DR-M0-2 graph-services side. Either rename inspector keys to raw `c_1_symbol`/`c_1_complete_formulation`/`c_1_form`, or formalize normalization mapping in `OntologyPropertyMapping` + inspector provenance.

   Verification: `cargo test -p epi-s2-graph-services ontology::anuttara_property_mappings_round_trip`; `grep -nE 'c_1_(symbol|complete_formulation|form)' Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`.
