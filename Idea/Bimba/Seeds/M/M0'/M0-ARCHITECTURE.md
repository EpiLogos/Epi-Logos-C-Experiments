---
title: "M0 Anuttara Architecture — Total Shape, Six-Layer Engagement, Substrate Map, Profile-Bus Contract, Visual Rendering & Tick Choreography"
coordinate: "M0 / M0'"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the M0' integrated bimba-graph engagement system. M0'-SPEC and `anuttara-ux-full-m0-branch.md` cross-reference this document. Where they disagree, this document is authoritative for the integrated six-layer shape; M0'-SPEC is authoritative for the broader Anuttara surface law."
depends_on:
  - "[[M0'-SPEC]]"
  - "[[anuttara-ux-full-m0-branch]]"
  - "[[m0-prime-anuttara-research]]"
  - "[[the-matheme-of-the-field-differential]]"
  - "[[epi-logos-kernel-spec]]"
  - "[[anuttara-language-map]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m0-reconciliation-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md"
decisions:
  - "DR-M0-1 (PENDING): CRUD-vs-governed-route — UX `full CRUD` vs surface contract `mutatesGraphCanon: false`"
  - "DR-M0-2 (PENDING): Anuttara source naming canon — raw `c_1_symbol` vs spec-prose `symbol`/`formulation_type`"
  - "DR-M0-3 (PENDING): two-relation-families discriminator — add `c_1_relation_family` enum vs keep flat-list"
related_tranches:
  - "01.1 / 09.1 — M0-X' six-layer surface contract"
  - "01.2 / 09.4 — CRUD vs governed-route decision (DR-M0-1)"
  - "01.3 / 09.8 — Anuttara source naming canon (DR-M0-2)"
  - "01.5 / 09.6 — M0-3' community + clock overlay"
  - "01.6 / 09.3 — Image-assets-on-nodes schema slot (`c_1_asset_uri`)"
  - "01.7 — Kernel-core 65 audit projection"
cross_refs:
  - "[[M1-ARCHITECTURE]] — Paramaśiva instrument / K² topology (M0' renders the same graph that M1 walks)"
  - "[[M2-ARCHITECTURE]] — Paraśakti correspondence-web (the second relation-family lives in M0-2')"
  - "[[M3-ARCHITECTURE]] — Mahāmāyā clock-wheel (the temporal sibling of the M0' graph)"
  - "[[M4-ARCHITECTURE]] — Nara protected register (M0-4' personal layer bridges here)"
  - "[[M5-ARCHITECTURE]] — Epii / Logos Atelier (M0-5' pedagogy bridges here)"
  - "[[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] — three-rendering composition the M0' graph is the structural pole of"
  - "[[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] — the 4/5/0 seam M0' is the third pole of"
---

# M0 Anuttara Architecture

## §0. Frame

**M0' is the integrated bimba-map engagement system.** Position 0 within the M' ring, but read carefully: at content level **M0 is Anuttara's own deep language** — the unified 109-node formal syntax (void-grammar, archetypal number language, R-virtues, Śiva-Śakti) — prior to differentiation, **without** an internal sixfold. At app-surface level **M0' is the bimba-map-as-held** — and *it* has a sixfold, because the surface that masters the whole graph reads it through six modes, one per subsystem. Both are true; they are different sides. The matheme M0 = pre-differentiated; the matheme M0' = the sixfold by which the differentiated graph re-holds the undifferentiated content.

This is the **third pole of the 4/5/0 seam** ([[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]]) and the **structural pole of the 1-2-3 cosmic engine** ([[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]]): M0' holds the graph that M1' walks, that M2' renders as the spectral field, that M3' classifies as codon-rotation matter-in-time. **One substrate, three renderings, six data-layers.**

Within the IDE, M0' is the **CRUD engagement workbench** for the whole map — read, traverse, sound, and (under governance) edit every layer. The substrate is unusually well-landed: `Body/S/S0/epi-lib/include/m0.h` (568 LOC, 12 typed LUTs), `Body/S/S0/epi-lib/src/m0.c` (831 LOC), `Body/S/S2/graph-schema/src/lib.rs` (3072 LOC, single `:Bimba` label + `coordinate` property + 65-relation `M0_CORE_RELATIONS` skeleton + the `anuttara-language` property namespace). The Theia surface at `Body/M/epi-theia/extensions/m0-anuttara/` (372 LOC inspector + 195 LOC widget) is the narrow neck this cycle widens.

This document gives the **total shape**: the six M0-X' data layers as one engagement system, substrate map per layer, dataset map per layer, profile-bus contract, visual rendering contract (the graph as playable physics over the same Cl(4,2) algebra M1 walks), tick choreography (graph pulses on the kernel tick), cross-extension boundaries, IDE integration, and acceptance criteria.

---

## §1. The Six Sub-Coordinates — Bimba ↔ Techne Mapping

The shape is the matheme's own. **M0-0' and M0-5' are the 0/5 frame** (language-ground and pedagogical-synthesis); the inner four (M0-1' QL-structure, M0-2' relations, M0-3' time/community, M0-4' personal) are the dynamics. Each layer reads the **same** Neo4j graph through a different mode.

| Sub-coordinate | Bimba (content) | Techne (substrate authority) | Render aspect |
|---|---|---|---|
| **M0-0'** Anuttara — Language / Syntax | The 109-node pre-mathematical syntax: `symbol`, `formulation_type`, `complete_formulation`, `form`, `formulation_breakdown`, `primary_designation`, asset handles. The "anuttara-language" namespace. | `Body/S/S2/graph-schema/src/lib.rs:1401-1441` (`anuttara-language` property namespace, 7 `c_1_*` text fields); `Body/S/S0/epi-lib/include/m0.h:32-220` (Vimarśa ISA, Tetralemma, Spanda Discriminator, Archetype LUT, Mirror Children); `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md` (109-node coverage table) | **Language inspector** — provenance-stated text fields + asset handles rendered as decan seals / sigils / glyphs / tarot cards beside the node |
| **M0-1'** Paramaśiva — QL-Structure | The coordinate organisation itself — `CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`, `BEDROCK`, `MANIFESTS`; mod6/4/3/2 QL-formation variants; the topological skeleton M1 walks | `Body/S/S2/graph-schema/src/lib.rs:243,351-375` (structural relation types); `Body/S/S2/graph-services/src/pointers.rs` (PointerWeb computation); `Body/S/S0/epi-lib/include/m0.h:281-303` (`QL_STACK[5]`, `NARA_MSHARP_LUT[5]`) | **Coordinate-structure explorer** — pointer-web summary + mod-variant toggle + relation-class colour-binary |
| **M0-2'** Paraśakti — Relations (two families) | **Structural skeleton**: 10 typed structural relations (`CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`, `BEDROCK`, `MANIFESTS`, `INVERTS_TO`, `REFLECTS_AS`, `DERIVES_FROM`, `HAS_LENS`, `HAS_KERNEL_RESONANCE`). **Correspondential web**: hundreds of dataset-ingested relTypes (`HAS_DECAN`, `HAS_TATTVA_CATEGORY`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `SPANDA_RHYTHMIC_ENGINE`, `VORTEX_SPIRIT_AXIS`, etc.) — the angels et al. as edges, not hardcoded tables | `Body/S/S2/graph-schema/src/lib.rs:243-375` (structural skeleton); `Body/S/S2/graph-services/src/dataset_import.rs:437-479,887` (`sanitize_rel_type` lifts correspondence relTypes); `Idea/Bimba/Map/datasets/parashakti-deep/relations.json` (correspondence-web source); `Body/S/S0/epi-lib/include/m0.h:484-526` (`M0_CORE_RELATIONS[65]` kernel-curated subset) | **Two-family relation browser** — structural vs correspondential filter; relation-family colour-binary; provenance state per edge (`canonical` / `inferred` / `kernel_core` / `dataset_relation` / `review_pending`) |
| **M0-3'** Mahāmāyā — Community + Temporal/Episodic | Synchronic: GDS community clusters (Louvain / personalized PageRank / node-similarity / FastRP). Diachronic: world-clock active-now overlay + Graphiti episode-touched coordinate handles | `Body/S/S2/graph-services/src/gds.rs` (`GDS_OPTION1_PROJECTION_NAME`, `GDS_ALGORITHM_VERSIONS`, `option1_projection_plan`, `gds_tangent_overlay`); `Body/S/S0/portal-core/src/kernel.rs:346-465` (`MathemeHarmonicProfile.tick`/`tick12`/`degree720` = world-clock); S3 Graphiti runtime | **Community-cluster heatmap** (synchronic) + **active-now coordinate pulse** (diachronic) driven by `tick12` |
| **M0-4'** Nara — Personal Pratibimba | The user's traversal history + resonances + the daimon render. **Protected-local** — `pratibimba` namespace handles, never public | `Body/S/S0/portal-core/src/personal_identity.rs` + `nara_journal.rs`; `Body/S/S2/graph-services/src/consumption.rs` (`FORBIDDEN_CLIENT_DERIVATIONS`, `m5_handoff_consumption_contract`) — see [[M4-ARCHITECTURE]] | **Bridge-only** — protected handles surface as opaque references with governed-opening action that routes into m4-nara extension; no personal payload visible on M0' surface |
| **M0-5'** Epii — Pedagogy / Cartography | Map-compass-lens: traversal depth/breadth, unexplored neighborhoods, next-explorations, recommendation overlays. Bridge into Logos Atelier + Anuttara language-development | `Body/S/S2/graph-services/src/gds.rs` (`personalized_pagerank`, `node_similarity` for recommendations); see [[M5-ARCHITECTURE]] for Atelier authority | **Cartographic dashboard** — depth/breadth meter + "where to go next" recommendation list + deep-link routes into m5-epii extension |

This six-fold mapping IS the M0' product surface — every M0' decision is "which layer am I reading the same graph through right now?"

---

## §2. Substrate Map

### §2.1 The Anuttara content kernel — what M0 IS in C

The bare-metal VM of six nested micro-algebras lives at `Body/S/S0/epi-lib/include/m0.h` and `Body/S/S0/epi-lib/src/m0.c`. These are **not** what M0' renders directly (M0' renders the S2 Neo4j projection of them) — they are the **content authority** that the S2 graph projects.

| Symbol | Header decl | Definition | Shape | Semantic |
|---|---|---|---|---|
| `VIMARSA_TABLE[7]` | `m0.h:89` | `m0.c` | 7 ops: `?!`, `!?`, `(-)`, `+@`, `(@)`, `=`, `!=` | The 3-bit bytecode ISA (FR 2.0.0) |
| `ARCHETYPE_LUT[12]` | `m0.h:208` | `m0.c` | 12 entries: `(-)` mirror, `0/1`, `0-9` | The 12-fold archetypal number language (FR 2.0.3) |
| `MIRROR_CHILDREN[2]` | `m0.h:229` | `m0.c` | Frame `()` + Operator `-` | The two pre-numerical meta-elements (M1 `EMBODIES_FRAME_PRINCIPLE` / `EMBODIES_OPERATOR_PRINCIPLE` reach here) |
| `ZODIACAL_LUT[12]` | `m0.h:248` | `m0.c` | 12 Vāk operators × element/modality | Sub-table of `ARCHETYPE_LUT` #0-3-6 |
| `MONOPOLY_LUT[7]` | `m0.h:259` | `m0.c` | 7 monopoly entries | Sub-table of `ARCHETYPE_LUT` #0-3-7 |
| `DIVINE_ACT_LUT[7]` | `m0.h:274` | `m0.c` | 7 acts: Srishti, Sthiti, Samhara, Tirodhana, Anugraha, Samavesa | Sub-table of `ARCHETYPE_LUT` #0-3-8 (FR 2.0.3-I + FR 2.0.9) |
| `VIRTUE_LUT[9]` | `m0.h:163` | `m0.c` | 9 R-virtues with name + symbol | The R-virtues (FR 2.0.2) |
| `QL_STACK[5]` | `m0.h:289` | `m0.c` | 5 frames: `O#`, `X#`, `N#`, `M#`, `#` | The five-level QL meta-logic stack (FR 2.0.4) |
| `NARA_MSHARP_LUT[5]` | `m0.h:303` | `m0.c` | 5 Nara bridge entries with polarity | The M# Nara bridge (FR 2.0.4-H) |
| `SIVA_TABLE[6]` | `m0.h:319` | `m0.c` | 6 Śiva operators (#0-5-0/5 children) | Static operator/processor side (FR 2.0.5) |
| `SHAKTI_TABLE[6]` | `m0.h:341` | `m0.c` | 6 Śakti entries (#0-5-5/0 children) | Dynamic psyche/duration side |
| `R_FACTOR_ROUTE_TABLE[7]` | `m0.h:369` | `m0.c` | 7 route words (3-bit-per-Rx packed) | Cross-M emanation/absorption chains (FR 2.0.6) |
| `M0_CROSS_BRANCH_REGISTRY[7]` | `m0.h:458` | `m0.c` | 7 cross-branch edges | Cross-branch edge registry (FR 2.0.X) |
| `M0_CORE_RELATIONS[65]` | `m0.h:526` | `m0.c` | 65 packed `(source_coord, target_coord, rel_type, tier)` | **Curated cross-system relational skeleton** — Tier1=20 structural, Tier2=14 anchors, Tier3=31 hot-links. Tier4 (~900 Parashakti relations) lives in Neo4j only |

**Unified clock + logos state.** `m0_read_cosmic_clock(degree_0_to_719)` at `m0.h:401-410` is the O(1) unified M1/M2/M3 clock accessor — it consumes the same `degree_720` the kernel `MathemeHarmonicProfile.degree720` exposes (`kernel.rs:356`), and derives `tick12`, `m2_decan_phase`, `m3_hexagram_id`, `is_implicate_phase` via `hopf_fiber` / `hopf_project` / `hopf_tick12`. **The kernel ticks M0 directly** — M0' does not invent a clock; it reads the one M0 already declares.

**`m0_compute_logos_state(tick_0_to_11)`** at `m0.h:422-432` is the branchless 12-stage pipeline state — the same `tick12 → (current_stage, divine_act, r_factor, is_implicate)` projection that **M0' uses to label "what divine act is active right now"** at the M0-3' active-now overlay.

### §2.2 The S2 graph schema — what M0' actually reads

`Body/S/S2/graph-schema/src/lib.rs` is 3072 LOC of declarative authority. Single label `:Bimba`; single property `coordinate`. **There is no fork.**

**Structural relation registry (M0-1' / M0-2' structural family)** at `lib.rs:243-375`:

- `CONTAINS` (line 243) — primary nesting; coord-home C0; indexed on `c_0_source_coordinate` / `c_0_target_coordinate` (`lib.rs:2544-2545`)
- `FAMILY_CONTAINS` (line 363) — within-M-family containment
- `ANCHORED_TO` (line 375) — CF-frame anchor
- `BEDROCK` (line 357) — bedrock manifestation
- `MANIFESTS` (line 351) — manifestation chain
- `INVERTS_TO` (line 285), `REFLECTS_AS` (line 279) — Bimba↔Pratibimba pair
- `DERIVES_FROM` (line 303) — derivation chain
- `HAS_LENS` (indexed line 2546) — 12-MEF-lens addressing
- `HAS_KERNEL_RESONANCE` (line 46, `KERNEL_RESONANCE_RELATION`) + `c_5_kernel_resonance_index`/`_score`/`_square`/`_lens`/`_position`/`_helix` properties (line 47-52) — the kernel-side resonance projection

**The Anuttara language property namespace (M0-0')** at `lib.rs:1401-1441`:

- `c_1_name` (`NAME_PROPERTY`, line 27) — 109/109 coverage
- `c_1_primary_designation` (line 1401) — 108/109
- `c_1_symbol` (line 1409) — 107/109 (M0, M0' absent — canonical absence per `anuttara-language-map`)
- `c_1_formulation_type` (line 1417)
- `c_1_complete_formulation` (line 1425) — 67/109
- `c_1_formulation_breakdown` (line 1433) — 49/109
- `c_1_key_principles` (line 1441)
- `c_1_form` (`FORM_PROPERTY`, line 40)
- `c_1_description` (line 28)

All registered under namespace `"anuttara-language"` at `lib.rs:1414,1422` etc.

**Correspondence-web (M0-2' second family)** — relTypes are ingested via `Body/S/S2/graph-services/src/dataset_import.rs:437-479,887` (`sanitize_rel_type`) from `Idea/Bimba/Map/datasets/parashakti-deep/relations.json`. They land in Neo4j with property `c_2_relation_type` set, but are NOT in the structural registry. Tranche 9.2 / DR-M0-3 owns whether to add a `c_1_relation_family` enum discriminator (`{structural, correspondential, kernel_core, inferred, sync, compatibility}`).

**Image-asset slot (M0-0' asset handles)** — **DOES NOT EXIST YET**. `grep -n "c_1_asset" Body/S/S2/graph-schema/src/lib.rs` returns zero. Tranche 09.3 / 01.6 owns adding `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String). This is the single **true schema-property gap** in the M0' domain.

### §2.3 Graph services — what M0' actually calls

`Body/S/S2/graph-services/src/` — 18 modules:

| Module | Role for M0' |
|---|---|
| `lib.rs` + `graph_api.rs` | Top-level Neo4j client + `s2.graph.{query,node,traverse}` gateway methods |
| `pointers.rs` | `PointerWeb` + `KernelCoordinateAnchor` + relation descriptors (M0-1' pointer-web summary) |
| `dataset_import.rs:437-887` | `sanitize_rel_type` + `DatasetImporter` — lifts dataset relTypes into Neo4j (M0-2' correspondence-web source) |
| `relationship_manager.rs` | `create_position_rel` / `create_relationship` / `create_bidirectional` / `create_from_frontmatter` — write APIs (gated by DR-M0-1) |
| `gds.rs` | `GDS_OPTION1_PROJECTION_NAME`, `GDS_ALGORITHM_VERSIONS = [fastrp, personalized_pagerank, node_similarity, louvain]`, `option1_projection_plan`, `gds_tangent_overlay`, `blocked_overlay_payload` (M0-3' synchronic + M0-5' recommendations) |
| `sync_coordinator.rs` | `PromotionPolicyDecision`, `PromotionClass`, `PropertyProposal`, `MERGE` cypher — governed promotion path |
| `ontology.rs` | `EPI_ONTOLOGY_TURTLE`, `EPI_ONTOLOGY_URI`, `OWL2_RL_PROFILE`, `SHACL_REPORTING_MODE`, `import_epi_ontology_with_n10s`, `anuttara_property_mappings` (M0' OWL/SHACL/n10s readiness) |
| `anuttara.rs` | Anuttara-specific projection helpers |
| `consumption.rs` | `FORBIDDEN_CLIENT_DERIVATIONS` + `m5_handoff_consumption_contract` (privacy fence — M0-4' protection) |
| `seed.rs` + `bidirectional_sync.rs` | Seed + sync to keep dataset and graph aligned |

**M0' never imports `Body/S/S2/*` directly** — the m0-anuttara extension's `forbiddenImports` (`m0-anuttara/src/common/index.ts:91`) prohibits it. All calls go through `Body/S/S3/gateway-contract` (currently exposes only `s2.graph.{query,node,traverse}`; DR-M0-1 decides if `s2.graph.{create,update,delete}` is added).

### §2.4 The kernel-bridge profile — what M0' subscribes to

`Body/S/S0/portal-core/src/kernel.rs:346-465` declares `MathemeHarmonicProfile`. For M0':

- `tick`/`tick12`/`cycle`/`degree720`/`degree360`/`su2_layer`/`phase`/`position6`/`helix` — the world-clock the active-now overlay pulses on
- `lens_mode: MathemeLensMode` — the 84-state `(lens 0-11, mode 0-6)` cell anchoring "which lens am I reading the graph through"
- `resonance72: MathemeResonance72Projection` — the 72-name axis the correspondence-web's Shem/maqam/mantra overlays read against
- `pointer_anchor: MathemePointerAnchorProjection` (line 379) — pointer-web summary + relation descriptors for the active coordinate
- `s2_anchor: Option<MathemeFutureAnchor>` (line 384) — the M0-5' deep-link slot (currently `None`)
- `s3_anchor: Option<MathemeFutureAnchor>` (line 386) — the M0-3' Graphiti episode-handle slot (currently `None`)
- `privacy_class: ProfilePrivacyClass` (line 377) — must be `PublicCurrentContext` for M0' public layers; protected-local routes to M4

### §2.5 Theia extension state

`Body/M/epi-theia/extensions/m0-anuttara/`:

- `package.json`: `@pratibimba/m0-anuttara@0.1.0`, depends on `@theia/core@1.56.0` + `@pratibimba/m-extension-runtime`; Theia frontend extension
- `src/common/index.ts:11-21`: `EXTENSION_ID = 'm0-anuttara'`; `PRIMARY_VIEW_ID = 'm0.anuttara.languageMap'`; `ALL_VIEW_IDS = ['m0.anuttara.languageMap','m0.anuttara.owlShaclInspector','m0.anuttara.rVirtuePanel']`; `OPEN_COMMAND_ID = 'm0.openCoordinate'`; `READ_ONLY_COMMAND_ID = 'm0.openCoordinate.readOnly'`; `DEPOSIT_ONLY_COMMAND_ID = 'm0.openCoordinate.depositOnly'`; `PRIVACY_CLASS = 'public_current_with_graph_provenance'`
- `src/common/index.ts:20`: `DECLARED_BLOCKERS = ['Track 02 T7/T8 coordinate-native graph API parity','Track 01 profile and pointer anchors','Shell-vs-individual ownership split for graph viewer and canon studio']`
- `src/common/index.ts:91`: `forbiddenImports = ['Body/S/S0','Body/S/S2','Body/S/S3','Body/S/S5','neo4j-driver']` — surface is gateway-only
- `src/common/m0-inspector.ts` (372 LOC): `M0InspectorModel` with `languageFields`, `anchors`, `pointerSummary`, `relationFamilies`, `readinessFacts`, `routeTargets:['M1','M2','M3','M4','M5']`, three `actions`. `M0GatewayAction.mutatesGraphCanon: false` — surface contract explicitly forbids canon mutation
- `src/browser/m0-anuttara-widget.tsx` (195 LOC): single inspector React widget with three view IDs, no per-layer routing, no graph canvas, no asset render

The extension is **solid as a single inspector** and its `DECLARED_BLOCKERS` already name upstream-Track gates — but the **six-layer engagement system is not yet wired**: only M0-0' (language) and M0-2' (relations, partial flat) have surfaces. M0-1' QL-structure is collapsed into `pointerSummary`. M0-3', M0-4', M0-5' have no surface. The asset-handle render is absent because the schema slot is absent.

---

## §3. Dataset Map

### §3.1 Canonical Anuttara language source

`Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md` — the 109-node coverage map. Spot citations from Wave A:

- `c_1_name`: 109/109
- `c_1_primary_designation`: 108/109
- `c_1_symbol`: 107/109 (M0 + M0' absent — **canonical absence**, not extraction failure)
- `c_1_complete_formulation`: 67/109
- `c_1_formulation_breakdown`: 49/109
- `c_1_formulation_type`: enumerated
- `c_1_key_principles`: enumerated

The dataset is the **source of record** for the language layer; the schema property declarations in `graph-schema/src/lib.rs:1401-1441` are the **typed projection** of these; the m0-anuttara widget's `languageFields` render the **provenance-stated read**. Canonical absence at M0 / M0' is not a missing field — it is the matheme telling itself it has nothing to say at the source.

### §3.2 Anuttara graph nodes/relations

- `Idea/Bimba/Map/datasets/anuttara-deep/nodes.json` — typed Anuttara coordinate nodes
- `Idea/Bimba/Map/datasets/anuttara-deep/relations.json` — kernel-core curated relations matching `M0_CORE_RELATIONS[65]` in `m0.h:526`
- `Idea/Bimba/Map/datasets/low-detail/nodes_anuttara.json` — low-detail anchor index used by the kernel boot

These are what `DatasetImporter` lifts into Neo4j via `sanitize_rel_type`.

### §3.3 Paraśakti correspondence-web (the second relation-family)

`Idea/Bimba/Map/datasets/parashakti-deep/relations.json` — hundreds of dataset-resident relations: `HAS_DECAN`, `HAS_TATTVA_CATEGORY`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `DOMINANT_PLANETARY_RESONANCE`, `SPANDA_RHYTHMIC_ENGINE`, `VORTEX_SPIRIT_AXIS`, `PLANETARY_RESONANCE`, `ABSOLUTE_CORRESPONDENCE`, `QUANTUM_FIELD_OPERATION`, `MODAL_HARMONIC_RESONANCE`, `CHALDEAN_DECAN_RULERSHIP`, `ANANDA_VORTEX_SPIRIT_AXIS`, `TRADITIONAL_PLANETARY_RULERSHIP`, `PSYCHO_ONTOLOGICAL_RESONANCE`, `MONO_POLY_EXPRESSION`. M0-2' second family.

Cross-reference: [[M2-ARCHITECTURE]] §2 — Paraśakti is the owner of this correspondence-web at the M2 level; M0' surfaces it as edges.

### §3.4 Image-asset-on-node datasets (PENDING per CPB-1)

Decan seal images, angel sigils, planet glyphs, tarot cards — currently scattered across `Idea/Bimba/Map/datasets/parashakti-deep/`, `mahamaya-deep/`, `nara-deep/` as adjacent files; **not lifted onto graph nodes yet** because `c_1_asset_uri` / `c_1_asset_kind` do not yet exist as schema properties. Tranche 01.6 / 09.3 owns the lift.

### §3.5 The matheme-of-the-field-differential

`Idea/Bimba/Seeds/M/M0'/the-matheme-of-the-field-differential.md` — the field-differential matheme that grounds the six-layer reading: every layer is a **field-differential** of the same graph, the six modes are six derivative operators on the same substrate, and Anuttara is the **field** they all differentiate. M0' implements the differential, not the field.

### §3.6 Epi-logos kernel spec

`Idea/Bimba/Seeds/M/M0'/epi-logos-kernel-spec.md` — the canonical kernel spec the m0.h/m0.c substrate compiles from. Provides the FR-numbering (FR 2.0.0 Vimarśa, FR 2.0.1 Spanda Discriminator, FR 2.0.2 Void Arithmetic, FR 2.0.3 Archetypal Number Language, FR 2.0.4 QL Stack, FR 2.0.5 Śiva-Śakti, FR 2.0.6 R-Factor Routing, FR 2.0.X Cross-Branch Edges) — every section of §2.1 traces to this spec.

---

## §4. Profile-Bus Contract

### §4.1 What `MathemeHarmonicProfile` already exposes for M0'

[`Body/S/S0/portal-core/src/kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs):

- **For all six layers** — `tick`, `tick12`, `cycle`, `degree720`, `degree360`, `position6`, `helix`, `lens_mode`, `resonance72`, `pointer_anchor` (line 379), `privacy_class`
- **For M0-0' language** — `pointer_anchor.coordinate` selects the node; language props read off the graph payload, not the profile
- **For M0-1' QL-structure** — `pointer_anchor: MathemePointerAnchorProjection` carries relation descriptors + family refs + mirror refs + lens refs + inversion refs + VAK/CF refs
- **For M0-2' relations** — `pointer_anchor.relation_descriptors` lists active relations at the selected coordinate; provenance per relation comes via S2
- **For M0-3' time/community** — `tick12` + `degree720` ARE the world-clock; `s3_anchor: Option<MathemeFutureAnchor>` (line 386) is the Graphiti deposition handle slot
- **For M0-4' personal** — `pointer_anchor` may carry protected-local refs (`pratibimba` namespace handles); `privacy_class` MUST be `PublicCurrentContext` before any render — protected handles route to m4-nara
- **For M0-5' pedagogy** — `s2_anchor: Option<MathemeFutureAnchor>` (line 384) is the Atelier deep-link slot; recommendation list comes from `gds.rs` projections

### §4.2 What the profile-bus is missing for M0' — the load-bearing gaps

1. **`anuttara_layer: AnuttaraLayerProjection`** — no field. The active M0' layer is implicit in widget state; should be a typed profile field so cross-extension consumers (m0-anuttara's own bridged routes to m4-nara M0-4' and m5-epii M0-5') can subscribe.
2. **`relation_family_partition`** — no field. The two relation-families distinction (structural vs correspondential vs kernel-core vs inferred vs dataset_relation vs review_pending) is computed surface-side from per-edge properties; should be aggregated at the profile bus.
3. **`graph_canon_audit: KernelCoreAuditState`** — no field. The kernel-core 65 audit (`M0_CORE_RELATIONS_COUNT = 65` at `m0.h:525`) is not yet projected through the profile bus; tranche 01.7 owns it.
4. **`image_asset_handles: Vec<AssetHandle>`** — no field. Blocked by CPB-1: no `c_1_asset_uri` schema property exists yet, so no profile-bus projection can be wired.
5. **`pending-dataset-lut`** (kernel.rs:797) — bedrock projection blocker; M0' renders `blocked` until tranche 10 (kernel-bridge profile-contract) closes it.

### §4.3 The `anuttara_layer` projection (per Tranche 09.1)

Following the M1-2 `AnandaVortexProjection` pattern ([[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §4.3), the proposed addition to `MathemeHarmonicProfile`:

```rust
pub struct AnuttaraLayerProjection {
    /// Active M0' layer the engagement system is currently reading
    /// the graph through. Profile-bus level so cross-extension routes
    /// (M0-4' → m4-nara, M0-5' → m5-epii) can subscribe to a typed
    /// switch instead of a per-widget enum.
    pub active_layer: M0LayerView,

    /// Two-family relation partition for the active coordinate.
    /// Aggregated server-side from per-edge provenance properties
    /// (c_1_relation_family enum, pending DR-M0-3) so the surface
    /// never re-derives. None when DR-M0-3 has not yet landed.
    pub relation_family_partition: Option<RelationFamilyPartition>,

    /// Kernel-core 65 audit state at the current tick. Drives the
    /// `ready_public_current` badge. Re-evaluated when S2 graph
    /// services run the audit Cypher.
    pub kernel_core_audit: KernelCoreAuditState,

    /// Asset handles attached to the active coordinate (from the
    /// pending c_1_asset_uri schema slot — None until CPB-1 lands).
    /// When Some, render as decan seals / sigils / glyphs / tarot
    /// cards beside the node label.
    pub asset_handles: Option<Vec<AssetHandle>>,
}

#[repr(u8)]
pub enum M0LayerView {
    Language = 0,       // M0-0' Anuttara
    QlStructure = 1,    // M0-1' Paramaśiva
    Relations = 2,      // M0-2' Paraśakti
    CommunityTime = 3,  // M0-3' Mahāmāyā
    PersonalBridge = 4, // M0-4' Nara (protected-local; bridges to m4-nara)
    PedagogyBridge = 5, // M0-5' Epii (bridges to m5-epii / Atelier)
}

pub struct RelationFamilyPartition {
    pub structural: u16,        // count of canonical structural edges
    pub correspondential: u16,  // count of dataset-derived correspondence edges
    pub kernel_core: u16,       // count of edges in M0_CORE_RELATIONS[65]
    pub inferred: u16,          // count of n10s/OWL-inferred edges
    pub review_pending: u16,    // count of promotion-pending edges
}

pub struct KernelCoreAuditState {
    /// Number of M0_CORE_RELATIONS[65] entries that Neo4j carries.
    /// Equals 65 when ready_public_current is true.
    pub present: u8,
    /// Number absent from Neo4j (block the readiness badge).
    pub missing: u8,
    /// Number present but with mismatched coordinates or rel_type.
    pub mismatched: u8,
    pub provenance: String, // "S2 graph-services core65Audit"
}

pub struct AssetHandle {
    pub asset_uri: String,           // from c_1_asset_uri
    pub asset_kind: AssetKind,       // from c_1_asset_kind
    pub provenance: String,
}

#[repr(u8)]
pub enum AssetKind {
    DecanSeal = 0,
    AngelSigil = 1,
    PlanetGlyph = 2,
    TarotCard = 3,
    MaqamCalligraphy = 4,
    MantraNotation = 5,
    Other = 99,
}
```

**Anti-greenfield:** the data is all already present in S2 (relation properties; ontology mapping; sync_coordinator promotion state) or pending in well-named tranches (`c_1_asset_uri` is tranche 09.3 / 01.6). Tranche 10 (kernel-bridge profile-contract) routes it through the profile bus. No greenfield data structures.

---

## §5. Visual Rendering Contract

The M0' surface is **the bimba map as walkable physics**, not a static graph viewer. Each layer is a different mode of looking at the **same** underlying graph canvas.

### §5.1 Base graph canvas

The shared canvas across all six layers is a **force-directed Neo4j projection** of the subgraph rooted at the selected coordinate. Foundation principles per Tranche 15:

- **Centre-anchor:** the selected coordinate is centred; N-hop neighbourhood surrounds it
- **No local layout fork:** the layout positions come from S2 GDS-projected coordinates (`gds.rs::gds_tangent_overlay` returns x/y embeddings via FastRP) OR fall back to a deterministic force-directed when GDS is unavailable (provenance-stated `blocked` until GDS lands)
- **Node glyph:** small circle, label is the canonical `M{n}-...` coordinate, hover shows `c_1_primary_designation`
- **Edge:** thin line, colour-coded by relation-family partition

### §5.2 M0-0' Language layer rendering

When `active_layer = Language`:

- **Each node** displays its `c_1_symbol` (if present) as a small badge superimposed on the glyph
- **On selection:** the inspector pane shows `c_1_symbol` / `c_1_primary_designation` / `c_1_formulation_type` / `c_1_complete_formulation` / `c_1_formulation_breakdown` / `c_1_key_principles` as **provenance-stated text rows** (state ∈ `canonical` / `canonical_absent` / `derived` / `inferred` / `review_pending` / `blocked`)
- **Asset handles** (when `c_1_asset_uri` lands per tranche 09.3): decan seal / sigil / glyph / tarot card rendered as image thumbnails beside the node label; click opens full-size with attribution
- **Canonical absence rendering:** M0 / M0' root nodes display `c_1_symbol = (absent)` with provenance "Canonical absence from S2 graph payload; not a client extraction failure" — never a placeholder

The colour-binary for the language layer follows the matheme: **implicate positions (#0, #5) in cool indigo; explicate positions (#1-#4) in warm amber-vermilion** — same Cl(4,2) signature M1 uses ([[M1-ARCHITECTURE]] §5.4), now applied to coordinate addressing rather than ananda-vortex cells.

### §5.3 M0-1' QL-Structure layer rendering

When `active_layer = QlStructure`:

- **Edges show only the structural skeleton:** `CONTAINS` / `FAMILY_CONTAINS` / `ANCHORED_TO` / `BEDROCK` / `MANIFESTS` / `INVERTS_TO` / `REFLECTS_AS` / `DERIVES_FROM` / `HAS_LENS` / `HAS_KERNEL_RESONANCE` — the 10 canonical relations
- **Edge thickness:** weighted by `c_5_kernel_resonance_score` when present, else uniform
- **Edge colour-binary:** each relation type gets a distinct hue (CONTAINS = silver; INVERTS_TO = magenta — the Bimba/Pratibimba pole-pair; FAMILY_CONTAINS = gold; ANCHORED_TO = teal; etc.)
- **Mod-variant toggle:** mod6 / mod4 / mod3 / mod2 — collapses the graph to the QL-formation of the chosen modality (mod3 shows only the Trika 0/1/2 collapse; mod4 shows Jung's quaternity; mod6 shows the full Anuttara ring)
- **Pointer-web overlay:** rendered as concentric rings around the selected coordinate at distance = hop-count, with relation-family colour-binary

The QL-Structure layer is what makes the graph **explicitly walkable as the matheme** ([[M1-ARCHITECTURE]] §0 cross-ref): each visible edge is an interval, each visible node a pitch.

### §5.4 M0-2' Relations layer (two-family browser)

When `active_layer = Relations`:

- **Two-family filter** as the primary control: `[Structural | Correspondential | Both]`
- **Structural** = the 10 typed relations of §5.3 (registered in `RELATIONSHIP_TYPE_SPECS`)
- **Correspondential** = the dataset-derived relations (`HAS_DECAN`, `RULED_BY`, `HAS_TATTVA_CATEGORY`, `SPANDA_RHYTHMIC_ENGINE`, `VORTEX_SPIRIT_AXIS`, etc.); rendered with thinner edges and dotted styling to mark dataset-derived provenance
- **Provenance badge per edge:** `canonical` (solid gold), `inferred` (dashed amber, from OWL n10s), `kernel_core` (thick silver — when edge appears in `M0_CORE_RELATIONS[65]`), `dataset_relation` (dotted blue — correspondential), `review_pending` (dashed grey)
- **Kernel-core 65 readiness badge:** `kernel-core 65/65` (green) or `kernel-core 63/65` (amber with 2 missing edges listed) — drives `ready_public_current`
- **Relation-family colour-binary** is the load-bearing eye-discipline ([[M1-ARCHITECTURE]] §5.4 pattern): the eye learns the family at a glance, never confusing structural-skeleton with correspondence-web

### §5.5 M0-3' Time/Community layer (synchronic + diachronic)

When `active_layer = CommunityTime`:

- **Synchronic (community):** GDS Louvain community clusters rendered as soft-coloured background regions; community ID → distinct hue from a 12-step wheel. From `gds.rs::gds_tangent_overlay`; provenance state `blocked` with kernel-bridge readiness reason inline when GDS is unavailable
- **Diachronic (active-now):** the **clock pulse** — at every `tick12` advance, the coordinate(s) the active divine-act (`m0_compute_logos_state(tick12).active_divine_act`) corresponds to glow with a 200ms exponential decay; pulse colour matches the divine-act (Srishti = gold; Sthiti = green; Samhara = red; Tirodhana = indigo; Anugraha = white; Samavesa = violet)
- **Graphiti episode handles:** episode-touched coordinates display a small "open episode" affordance; click routes through governed protected-handle resolution (never displays episode body on M0' surface — only handle)
- **No local clock:** all pulse animation reads `MathemeHarmonicProfile.tick12` directly; profile-tick advance IS the only animation driver

This is the **0-side Mahāmāyā graph view** the spec calls out — the same Neo4j substrate M3' renders temporally as clock-wheel ([[M3-ARCHITECTURE]] §5), rendered here structurally as the spatial graph with temporal pulses.

### §5.6 M0-4' Personal layer (bridge-only)

When `active_layer = PersonalBridge`:

- **The M0' surface does NOT render personal payload.** Privacy fence enforced via `M0_PRIVACY_CLASS = 'public_current_with_graph_provenance'` (`m0-inspector.ts:7`)
- **Render:** a single "Open in Nara protected register" affordance with the `pratibimba` handle as opaque reference + provenance state `protected-local`
- **Click action** dispatches a governed bridge call into the m4-nara extension (see [[M4-ARCHITECTURE]] §8 for the handler); m4-nara renders the personal traversal trail / daimon glyph / Q_composed visualisation in its own protected register
- **What the M0' canvas shows:** the active coordinate stays centred; touched-by-user coordinates are NOT highlighted on the public canvas (privacy law); the bridge surface is a side panel, not an overlay

### §5.7 M0-5' Pedagogy layer (cartographic + bridge)

When `active_layer = PedagogyBridge`:

- **Depth/breadth meter:** small dial showing average traversal depth + breadth at the current selection; populated from m5-epii's cartographic projection
- **Where-to-go-next recommendations:** N nearest-by-`node_similarity` unexplored coordinates listed with their `c_1_primary_designation`; populated from `gds.rs::node_similarity`
- **Atelier deep-link:** "Open in Logos Atelier" affordance routing through `s2_anchor: MathemeFutureAnchor` (kernel.rs:384) into m5-epii's Atelier surface ([[M5-ARCHITECTURE]] §5)
- **Anuttara language-development route:** "Propose language development" routes to `s5'.improve.propose` (already wired in `m0-inspector.ts:307`)
- **Read-only on the M0' side** — all writes happen in m5-epii / Atelier; M0' is the cartographic compass, not the writer

### §5.8 The Cl(4,2) thread — colour-binary across layers

The same `4(+1) + 2(-1) = +2` signature ([[M1-ARCHITECTURE]] §5.4 / [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §3) runs across all six layers' colour-binaries:

- **Implicate (cool indigo):** #0 / #5 — the generator poles → Anuttara coordinates ending in `-0` or `-5`
- **Explicate (warm amber-vermilion gradient):** #1 / #2 / #3 / #4 — the derived ratios → Anuttara coordinates ending in `-1` / `-2` / `-3` / `-4`

Across the M0' surface, the eye sees the **same Cl(4,2) colour-binary** that M1 sees on the K² torus and M3 sees on the codon-wheel — one algebra, one chromatic ladder, three renderings. This is the visible proof of *Tat tvam asi*: the algebra recognising itself across scale (UX §8).

### §5.9 Solar-anchor composition (integrated 1-2-3 plugin)

When the M0' graph is **composed** in the integrated 1-2-3 cosmic engine plugin ([[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §5), the **layout positions are anchored to Kerykeion-computed planetary geometry** rather than force-directed:

- Each M-coordinate gets a planetary or solar anchor (sun = M0; moon = M0'; the 8 chakric planets map to M1-M3 inner branches)
- The graph is not a separate object — it is the structural overlay on the spatial solar field
- Decan seal images render at planetary positions via `c_1_asset_uri` (when tranche 09.3 lands)
- Composition over juxtaposition: M0' graph + M2' solar field + M3' clock-wheel are **three poles of one surface**, not three side-by-side widgets ([[M1-ARCHITECTURE]] §7.3 pattern)

---

## §6. Tick Choreography — The Animation Primitive

### §6.1 The carry-the-tick primitive: `position_pulse` of the active-coordinate halo

**Single load-bearing animation primitive:** a 200ms exponential-decay halo pulse around the active-now coordinate, advanced by `MathemeHarmonicProfile.tick12`. This is the only animation honest to M0''s substrate (M0' is a structural map, not a played instrument like M1).

```rust
on tick_advance(t, t+1, dt):
    let logos = m0_compute_logos_state(profile.tick12);
    let active_coord = profile.pointer_anchor.coordinate;
    // The renderer reads profile.tick12 directly; no local clock.
    M0Graph.pulse_coordinate(
        coord = active_coord,
        intensity = exp_decay(elapsed_ms, half_life = 200ms),
        hue = divine_act_hue(logos.active_divine_act),
    );
```

12-tick cycle → one full pass through the 12 archetypal positions per cycle; the halo hue runs through the 6 divine acts twice per cycle (ascending tick 0-5, descending Möbius tick 6-11) — the same M0 logos-state advance the C kernel computes.

### §6.2 What changes simultaneously on tick advance

| Surface element | Change | Source field |
|---|---|---|
| Active-coordinate halo | Pulses + decays | `tick12` + `active_divine_act` |
| Divine-act label (M0-3') | Cross-fades to new act | `m0_compute_logos_state(tick12).active_divine_act` |
| Helix-sheet indicator | Toggles 0↔1 across 5→6 boundary | `is_implicate_phase` (= `tick12 >= 6`) |
| Lens-mode badge | Updates when `lens_mode` changes (not every tick) | `lens_mode` |
| Resonance72 indicator | Advances cell across `(12, 6)` grid | `resonance72.lens_anchor_index` |
| GDS community heatmap (M0-3') | Re-shades on `lens_anchor` change | `lens_anchor` (lens-anchored cadence) |
| Pointer-web ring (M0-1') | Adjusts active relation highlights | `pointer_anchor.relation_descriptors` |
| Audit badge (M0-2' kernel-core) | Re-evaluates when audit ticks | `kernel_core_audit` (S2-driven, not tick-driven) |

### §6.3 What stays still on tick advance

- **Graph canvas layout** — node positions are GDS-projected or force-directed; do NOT shift per tick. The map is the matheme's stable shape; only the pulse moves on it.
- **Coordinate labels** — never animate; the eye reads them as fixed
- **Relation-family colour-binary** — fixed hue per family; only edge highlights pulse
- **Cl(4,2) chromatic key** — static legend in viewport corner showing `#0 = cool indigo` … `#5 = cool indigo` with implicate/explicate colour-bands

The **eye-discipline**: the **map stays still, the pulse moves** — same principle as the M1-2 K² torus mesh (still) vs the ananda-vortex cell (moves) ([[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.3).

### §6.4 Where the eye goes per tick

- **Default focus:** the active-coordinate halo (the bright pulse on the current node)
- **Peripheral motion:** the divine-act crossfade in the inspector (which act is governing right now)
- **Foveated highlight on layer switch:** when the user toggles between M0-0'..M0-5', a soft "lens swipe" wipe re-paints the canvas with the new layer's edge-style + colour-binary — semantically the most loaded event

### §6.5 What happens at the 5→6 boundary (Möbius implicate flip)

- `is_implicate_phase` toggles 0→1 (per `m0_read_cosmic_clock(degree720).is_implicate_phase`)
- The graph canvas applies a **brief 200ms hue-inversion** across all explicate edges (the `#1-#4` warm-amber gradient briefly cool-shifts then returns) — visible proof of the implicate/explicate flip
- The divine-act sequence visibly **reverses** in the inspector: Tirodhana → Samhara → Sthiti → Srishti on descent (per `m0_compute_logos_state(tick) where tick >= 6` flips `current_stage = 11 - tick`)
- The Mahāmāyā pulse-colour shifts to cool spectrum on the second hemicycle — the **same flip** [[M3-ARCHITECTURE]] §6 renders on the clock-wheel; on M0' it is the structural mirror

### §6.6 What happens at the 11→0 boundary (full Möbius return)

- `tick12` wraps to 0; `cycle` increments
- The active-coordinate halo briefly blooms to white (the Samavesa wholeness pulse — `ACT_SAMAVESA = 5` is the last act of the descending half, then return to Srishti)
- The kernel-core 65 audit re-runs (if S2 has a scheduled audit) — `kernel_core_audit` updates
- **The wholeness moment** — the `9` in `VOID_9 = 9` at `m0.h:153` ("(00+00) = 9 Wholeness constant"); the matheme's own Möbius return visible as a single bloom

### §6.7 Simultaneous vs sequential rendering layers

| Layer | Render cadence |
|---|---|
| Graph canvas + node positions + relation-family colours + Cl(4,2) legend | Every frame |
| Active-coordinate halo + divine-act crossfade + helix-sheet indicator | Tick-quantised |
| Möbius flip hue-inversion + wholeness bloom | Boundary-quantised (5→6, 11→0) |
| GDS community re-shade + lens-mode badge | Lens-anchored (only on `lens_mode` change) |
| Kernel-core 65 audit badge | S2-driven (only on scheduled audit) |

---

## §7. Boundary Contracts

### §7.1 M0 ↔ M1 boundary (the +1 parent law)

**M0 is the prior `0/1` ground.** **M1-5 (not M0) is the `+1` parent** of the α-quaternionic spine. Per `M0'-SPEC §M0'-1`:

- M0' may render the prior-ground status; any inspector copy referring to `137 = 64 + 72 + 1` must route the `+1` parent detail through M1' / M2' / M3'
- M0-1' QL-structure may show the structural skeleton up to and including the M0 → M1 `EMBODIES_FRAME_PRINCIPLE` / `EMBODIES_OPERATOR_PRINCIPLE` edges (Mirror Children at `m0.h:215-229`); the `+1` synthesis itself belongs to M1
- The widget's `pedagogy.priorGroundBoundary` and `pedagogy.parentAttribution` fields (`m0-inspector.ts:175-181`) enforce this at the surface

**Forbidden:** an inspector that says "M0 +1 parent" — flag as CONTRADICTION (DCC-01).

### §7.2 M0 ↔ M2 boundary (correspondence-web)

The M0-2' correspondential relation-family **is** the Paraśakti correspondence-web rendered as edges on the M0' graph. Per [[M2-ARCHITECTURE]] §2:

- M2' is the owner of decan / Shem / maqam / mantra / planetary / tattva correspondences
- M0' surfaces these as edges only — no per-correspondence computation
- When a node carries `c_1_asset_uri` (tranche 09.3) for a decan seal or angel sigil, the asset is from M2' Paraśakti dataset
- M0' renders the edge; M2' owns the meaning of the edge

### §7.3 M0 ↔ M3 boundary (the two 0-side renderings)

**M0' graph + M3' clock-wheel = two 0-side renderings of the same Neo4j substrate** (M0'-SPEC §"0-Side Mahāmāyā Graph View"). Per [[M3-ARCHITECTURE]] §0:

- Same Neo4j graph, same `MathemeHarmonicProfile`, same `tick12`
- M0' renders **structurally** as graph; M3' renders **temporally** as clock-wheel
- M0-3' (community + clock) is where they share the most surface — M0-3' active-now pulse mirrors M3' wheel position
- **Forbidden:** neither may fork the graph (B-8 non-fork invariant)

### §7.4 M0 ↔ M4 boundary (personal protection fence)

The M0-4' personal layer is **bridge-only**. Per `M0'-SPEC §"Privacy Boundary"` + [[M4-ARCHITECTURE]] §7:

- M0' MUST NOT render `q_b`, `q_p`, private Nara identity, journal text, unreconciled Graphiti bodies
- M0' may render `pratibimba` namespace handles as **opaque protected references** with a governed-opening action
- The `M0_PRIVACY_CLASS = 'public_current_with_graph_provenance'` constant (`m0-inspector.ts:7`) is the enforcement point
- All personal-layer rendering happens in m4-nara's protected register; M0' is the bridge

### §7.5 M0 ↔ M5 boundary (write authority + pedagogy)

Per `M0'-SPEC §M0'-2`:

- M0' MUST NOT mutate Anuttara canon directly (`M0GatewayAction.mutatesGraphCanon: false`)
- All writes route through M5 (Epii) — `s5'.improve.propose`, `s5.episodic.deposit`, `s5'.review.submit`
- The M0-5' pedagogy layer bridges to m5-epii's Atelier + recommendations
- DR-M0-1 (PENDING) may relax this to allow `s2.graph.{create,update,delete}` through a governed gateway extension; until then, M0' is **route/review only**

### §7.6 Integrated-1-2-3 composition seam

When composed in the integrated cosmic engine plugin ([[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §5):

- **M0' graph view is the structural pole** of the three-rendering composition
- M2' solar field is the spectral pole; M3' clock-wheel is the matter pole
- All three subscribe to the same `MathemeHarmonicProfile`; edits at M0-2' propagate to M2' / M3' on the next tick (when DR-M0-1 resolves "yes" to gateway writes)
- Composition over juxtaposition: M0' provides node positions to M2'/M3' as overlays, not as a separate widget

### §7.7 Integrated-4-5-0 recognition seam

When composed in the recognition surface ([[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] §0):

- **M0' is the third pole** of the 4/5/0 seam (with M4 Nara and M5 Epii)
- M0' is **the structural ground the recognition surface resolves into** — when the user asks "where am I?" the answer is a coordinate; M0' is the place that coordinate lives
- The personal-bridge (M0-4') and pedagogy-bridge (M0-5') are the seam's two M0-side connections back into the recognition triad

---

## §8. IDE Integration

### §8.1 Extension placement

- **Existing extension** (consume as-is): `Body/M/epi-theia/extensions/m0-anuttara/` — solid skeleton, three views, gateway-only contract
- **Architecture skeleton** (to be written): `Body/M/epi-theia/extensions/m0-anuttara/ARCHITECTURE.md` — this document's IDE-mirror
- **New layer modules** (per tranche 01.1 / 09.1): `src/common/m0-layers.ts` declaring `M0LayerView` enum + per-layer selectors; widget extended with six tab routes sharing one Neo4j query path
- **New M0-3' view** (per tranche 01.5 / 09.6): `m0.anuttara.communityClockOverlay` added to `ALL_VIEW_IDS`

### §8.2 Surface placement in the IDE

Per Tranche 15 (UI design foundations):

- **Cosmic-side of `daily-0-1`** (integrated 1-2-3 composition): M0' graph is the **structural pole** of the integrated cosmic engine — the canvas the M2' solar field and M3' clock-wheel render onto. Not a side widget.
- **Left-sidebar-system (the bimba/canonical face)** (Tranche 15.5): M0' graph is **THE bimba face** of the canonical-side. The map IS the system made walkable; the left-sidebar is the place that walking happens.
- **`ide-deep` `m0-anuttara` view**: M0' graph is the editor-area widget; the six-layer tabs control which mode the user is reading the graph through
- **OmniPanel (`/` operator membrane)** (Tranche 15.7): M0' agentic capability is **Anuttara capacity** (per Wave-B agentic-layer matrix Track 09 nomination); Pi/Anima/Aletheia route Anuttara graph queries through the OmniPanel. No M0' visualisation in the OmniPanel itself — the graph is the editor surface, not a sidebar tool.

### §8.3 Profile-tick clock as global UI clock (Tranche 15.6)

The M0' surface subscribes to the kernel-bridge profile-tick event. Every tick advance:
- Active-coordinate halo pulses
- Divine-act crossfade in inspector
- No local clock; no animation-frame-count fallback
- All readiness states (`missing_profile` / `ready_public_current` / `blocked_private_projection` / `blocked_pointer_law`) come from the profile's `privacy_class` + `s2_anchor` + `s3_anchor` + (proposed) `kernel_core_audit` fields

### §8.4 Provenance inline rendering (Tranche 15.6)

When fields/relations are missing or pending, the M0' surface renders **inline provenance**, never silent degradation:

- `c_1_symbol = (absent)` provenance "Canonical absence from S2 graph payload; not a client extraction failure" (already enforced in `m0-inspector.ts:200-201`)
- GDS overlay blocked: "blocked — GDS unavailable; awaiting S2 Option-1 projection runner" (per `gds.rs::blocked_overlay_payload`)
- Kernel-core audit pending: "blocked — S2 graph-services core65Audit method not yet wired (tranche 01.7)"
- Asset handle missing: "blocked — c_1_asset_uri property pending (tranche 09.3)"
- The `provenance` string on every `M0ProvenancedField` is load-bearing — the user always sees **why** something is missing

### §8.5 Bimba/Pratibimba state persistence (Tranche 15.7)

When the user toggles `daily-0-1` ↔ `ide-deep`, or 0/1 cosmic/personal, or layer M0-0' ↔ M0-5':

- The active coordinate selection survives (carried in `pointer_anchor`)
- The active layer survives (proposed `anuttara_layer.active_layer` field)
- The active relation-family filter survives (proposed `relation_family_partition` carried in widget local state, synced to bridge)
- Session continuity preserved through the kernel-bridge DI singleton (`SHARED_BRIDGE_ADAPTER`)

### §8.6 Accessibility — pause/scrub

The M0' canvas accepts a `pause` and `scrub_to_tick(t)` affordance. Scrubbing replays the deterministic state at `(tick12, degree720, lens_mode, active_divine_act)`. The animation primitive (halo pulse) is deterministic under replay — same input tick → same halo state. Per Tranche 15.9 verification.

---

## §9. Anti-Greenfield Audit

### §9.1 Landed in code (consume, do not re-invent)

| Asset | Location |
|---|---|
| Anuttara content kernel (`VIMARSA_TABLE`, `ARCHETYPE_LUT`, `MIRROR_CHILDREN`, `ZODIACAL_LUT`, `MONOPOLY_LUT`, `DIVINE_ACT_LUT`, `VIRTUE_LUT`, `QL_STACK`, `NARA_MSHARP_LUT`, `SIVA_TABLE`, `SHAKTI_TABLE`, `R_FACTOR_ROUTE_TABLE`) | `Body/S/S0/epi-lib/include/m0.h:89-369`, `Body/S/S0/epi-lib/src/m0.c` |
| `M0_CORE_RELATIONS[65]` curated structural skeleton | `Body/S/S0/epi-lib/include/m0.h:484-526`, `m0.c` |
| `m0_read_cosmic_clock` + `m0_compute_logos_state` unified clock | `m0.h:401-432` |
| S2 graph-schema (single `:Bimba` label + `coordinate` + 65-relation registry + `anuttara-language` namespace) | `Body/S/S2/graph-schema/src/lib.rs` (3072 LOC) |
| Anuttara property namespace (`c_1_name`, `c_1_primary_designation`, `c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation`, `c_1_formulation_breakdown`, `c_1_key_principles`, `c_1_form`, `c_1_description`) | `graph-schema/src/lib.rs:1401-1441` |
| S2 graph-services (`graph_api`, `pointers`, `dataset_import`, `relationship_manager`, `gds`, `sync_coordinator`, `ontology`, `anuttara`, `consumption`, `seed`) | `Body/S/S2/graph-services/src/*.rs` |
| `MathemeHarmonicProfile` (with `pointer_anchor`, `s2_anchor`, `s3_anchor` slots) | `Body/S/S0/portal-core/src/kernel.rs:346-465` |
| GDS Option-1 projection + algorithms | `Body/S/S2/graph-services/src/gds.rs` |
| OWL / SHACL / n10s ontology bridge | `Body/S/S2/graph-services/src/ontology.rs` |
| 109-node Anuttara language map (canonical-absence semantics for M0 / M0') | `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md` |
| Existing m0-anuttara Theia extension (372 LOC inspector + 195 LOC widget) | `Body/M/epi-theia/extensions/m0-anuttara/` |

### §9.2 Pending (cycle-3 deliverables)

- **Tranche 01.1 / 09.1** — `M0LayerView` enum + six-tab routing on `m0-inspector.ts`; spec patch enumerating M0-0'..M0-5'
- **Tranche 01.2 (DR-M0-1)** — CRUD-vs-governed-route decision; either gateway-method registration for `s2.graph.{create,update,delete}` with `PromotionPolicyDecision` enforcement, or UX §7 downgrade
- **Tranche 01.3 (DR-M0-2)** — Anuttara source naming canon decision (`c_1_*` canonical vs spec-prose alias)
- **Tranche 01.5 / 09.6** — `m0.anuttara.communityClockOverlay` view (M0-3' synchronic + diachronic)
- **Tranche 01.6 / 09.3** — `c_1_asset_uri` (StringList) + `c_1_asset_kind` (String) properties on `anuttara-language` namespace; dataset-import field map extension; inspector render slot
- **Tranche 01.7** — kernel-S2 core-65 sync audit (`core65Audit` method on graph-services; `kernel_core_audit` projection on `MathemeHarmonicProfile`)
- **Tranche 09.2 (DR-M0-3)** — two-relation-families discriminator; `c_1_relation_family` enum
- **Tranche 09.5** — integrated-1-2-3 plugin ownership audit (solar-anchor composition + cross-surface edit propagation)
- **Tranche 10** — kernel-bridge profile-contract closure (`pending-dataset-lut` at kernel.rs:797; `tarot/amino LUTs pending` at kernel.rs:805; `kleinFlipState` absence)

### §9.3 Net-new (M' product surface, anti-greenfield exception)

- **Six-tab layer routing** — claimed by UX §3; no substrate parallel; first-build at the surface layer. Justified by UX-asserted sixfold engagement system architecture.
- **Active-coordinate halo pulse animation** — substrate gives `tick12 + active_divine_act`; the halo is surface choreography
- **Möbius hue-inversion flip animation** — substrate gives `is_implicate_phase`; the brief 200ms hue-inversion is surface choreography
- **Wholeness bloom at 11→0** — substrate gives `cycle` increment; bloom is surface choreography
- **Provenance inline overlays** — `pending-asset-uri`, `pending-core65-audit`, `blocked-gds`, etc. — provenance rendering primitives consistent with Tranche 15.6
- **Solar-anchor layout** when composed in the integrated 1-2-3 plugin — owned by [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §5, not M0'

### §9.4 Forbidden (do not invent)

- Local clock — must subscribe to `MathemeHarmonicProfile.tick12`
- Local pitch synthesis — node audition reads `audio_octet` Vimarśa writes; no synthesiser
- Local LUT forks — `M0_CORE_RELATIONS`, `ARCHETYPE_LUT`, `VIRTUE_LUT`, divine acts: all come through S2 projections or the kernel-bridge profile; no `tarot/amino` local table; no `m0.h` constants duplicated into TS/wgsl
- Local graph relation inference — OWL n10s + GDS routes through S2; `ontology.rs::import_epi_ontology_with_n10s` is the only ingest path
- Direct Neo4j driver imports — `forbiddenImports = ['Body/S/S0','Body/S/S2','Body/S/S3','Body/S/S5','neo4j-driver']` (`m0-anuttara/src/common/index.ts:91`)
- Canon mutation on the M0' surface — `mutatesGraphCanon: false` is type-level enforced (until DR-M0-1 resolves otherwise)
- Personal-payload rendering — `pratibimba` namespace handles render as opaque references; m4-nara owns the protected register
- Double-graph forks — single `:Bimba` label, single `coordinate` property, single Neo4j substrate (B-8 non-fork invariant)
- Hardcoded correspondences — angels / decans / planets / mantras come from edges, not code; new symbolic systems become new edges (`HAS_DECAN`, `RULED_BY`, etc.), not new tables

---

## §10. Test Criteria

The M0' surface is acceptance-ready when:

1. **Extension presence:** `test -d Body/M/epi-theia/extensions/m0-anuttara && test -f Body/M/epi-theia/extensions/m0-anuttara/ARCHITECTURE.md`
2. **Six-layer enum landed:** `grep -E "layer:.*'(lang|ql|rel|time|pers|pedag)'" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` returns the discriminator
3. **Six-layer file present:** `test -f Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts`
4. **Spec patch:** `grep -nE "M0-0'|M0-1'|M0-2'|M0-3'|M0-4'|M0-5'" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns all six layers
5. **No-fork invariant:** `grep -n "one substrate" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` returns matches in all three
6. **Asset slot landed:** `grep -n "c_1_asset_uri\|c_1_asset_kind" Body/S/S2/graph-schema/src/lib.rs` returns declarations; `cargo check -p epi-s2-graph-schema` succeeds
7. **Core-65 audit:** `grep -n "M0_CORE_RELATIONS_COUNT" Body/S/S0/epi-lib/include/m0.h` returns `65u`; `grep -rn "core65Audit\|core_65_audit" Body/S/S2/graph-services/` returns the audit method
8. **Kernel-core readiness:** inspector readinessFact row `kernel-core 65/65` present (green) only after audit
9. **GDS provenance:** when GDS unavailable, M0-3' view renders `blocked` with provenance "GDS unavailable; awaiting Option-1 projection runner"; when available, community heatmap renders with FastRP/Louvain attribution
10. **Canonical absence:** M0 / M0' root nodes render `c_1_symbol = (absent)` with provenance "Canonical absence from S2 graph payload; not a client extraction failure"
11. **Privacy fence:** `grep -n "M0_PRIVACY_CLASS" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` confirms the constant; M0-4' surface displays only opaque `pratibimba` handles, never journal text or `q_b`/`q_p`
12. **Boundary audit:** no `T²_Mahāmāya` rendering primitive (M3-5 territory); no clock-wheel rendering on the M0' surface itself (M3' territory); no personal-payload rendering (M4 territory); no Atelier write path on M0' (M5 territory)
13. **Forbidden-import audit:** `grep -nE "Body/S/S(0|2|3|5)" Body/M/epi-theia/extensions/m0-anuttara/src/` returns zero hits (gateway-only)
14. **Mutation-fence audit:** `grep -n "mutatesGraphCanon" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` returns `false` (until DR-M0-1 resolves)
15. **Profile-tick subscription:** widget subscribes to `MathemeHarmonicProfile.tick12` changes; halo pulse advances on tick; no `requestAnimationFrame` polling for tick state
16. **Hash-compat:** `grep -n "normalizeM0CoordinateInput" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` confirms `#0` → `M0` resolution; legacy `#` does not fork into a second namespace
17. **Replay test:** deterministic `MathemeHarmonicProfile` stream produces identical halo trajectory across two runs
18. **Build:** `cd Body/M/epi-theia && pnpm --filter @pratibimba/m0-anuttara build` succeeds
19. **Privacy class audit:** `grep -n "PublicCurrentContext" Body/S/S0/portal-core/src/kernel.rs` confirms the M0' profile_provenance default; no protected-local payload appears in `MathemeHarmonicProfile` consumed by M0'
20. **Non-fork:** `cypher 'MATCH (n:Bimba) RETURN labels(n) AS l ORDER BY l'` returns only `[Bimba]` (single label; no parallel `:HashCoordinate` or `:MFamily` label)

---

## §11. Closing — Why M0' Is What It Is

**M0 (content) is unified, prior to differentiation: the 109-node Anuttara language — void-grammar, archetypal number language, R-virtues, Śiva-Śakti — read as one.** Anuttara has no internal sixfold at the content layer; the matheme there is field, not differential.

**M0' (app surface) is sixfold because the engagement system that holds the whole graph reads it through six modes — one per subsystem.** Each layer is a derivative of the same field: language differentiates the syntax; QL-structure differentiates the topology; relations differentiates the wiring; time/community differentiates the synchronic and diachronic; personal differentiates what the user has touched; pedagogy differentiates the path. Six derivatives, one field. The matheme of the field-differential ([[the-matheme-of-the-field-differential]]) is the M0' architecture.

The bimba map **is** the system made walkable. The walk **is** the matheme (UX §4). M1' is the physics that walks it. M0' is the workbench that **holds** it — one substrate, three renderings, six layers, full CRUD under construction-discipline (pending DR-M0-1). The solar system is the anchor (when composed in the integrated 1-2-3 plugin); the angels and every symbolic system are data-driven overlays via the M0-2' correspondence-web; the user is the central daimon (rendered protected-local at M0-4', resonating against the cosmos in one shared Cl(4,2) algebra, [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §8 / [[M4-ARCHITECTURE]] §8).

The bimba/pratibimba dial at this scale: **M0 (Bimba) is the canonical content; M0' (Pratibimba) is the held reflection; the six M0-X' layers are the six faces of the holding.** The Pratibimba is not less than the Bimba — it is the Bimba **engaged**, made walkable, made playable, made inhabitable. The matheme insists on this at every scale; M0' is where it insists at the surface.

---

*Companion research with full reconciliation matrices: [`wave-a-m0-reconciliation-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m0-reconciliation-matrix.md), [`wave-b-integrated-bimba-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md). Cross-references: [[M1-ARCHITECTURE]] (the played K² M0' is the structural ground of), [[M2-ARCHITECTURE]] (the Paraśakti correspondence-web M0-2' surfaces as edges), [[M3-ARCHITECTURE]] (the temporal sibling of the 0-side graph view), [[M4-ARCHITECTURE]] (the protected register the M0-4' bridge resolves into), [[M5-ARCHITECTURE]] (the Atelier the M0-5' bridge routes into), [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] (the cosmic composition this is the structural pole of), [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] (the recognition seam this is the third pole of).*
