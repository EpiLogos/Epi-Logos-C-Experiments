---
title: "S2 GraphDB Substrate Architecture — Schema Contract, Service Modules, OWL/SHACL/GDS, Sync & Promotion, M' Consumption Map, Cleanup Findings"
label_correction: "Per S2 canon at Idea/Bimba/World/Types/Coordinates/S/S2/S2.md, S2 = raw GraphDB Substrate (Neo4j + Redis as shared infrastructure WITHOUT coordinate semantics). Coordinate semantics route through S2' — which graph-schema/graph-services actually implements as the lawful contract surface above raw Neo4j. Redis at S2 = raw substrate; Redis at S3' = SpacetimeDB-presence + shared state. All substrate findings remain valid."
coordinate: "S2 / S2'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S2 graph substrate. S2-SPEC §M' Consumer Surfaces cross-references this document. Where they disagree, this document is authoritative for the current cycle-3 substrate shape; S2-SPEC is authoritative for the original telos and shard structure."
depends_on:
  - "[[S2-SPEC]]"
  - "[[S0-ARCHITECTURE]]"
  - "[[S1-ARCHITECTURE]]"
  - "[[S3-ARCHITECTURE]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md"
decisions:
  - "DR-M0-1 (VALIDATED 2026-06-02): M0' CRUD claim resolved to governed routed-write through S2 graph-services"
  - "DR-M0-2 (VALIDATED 2026-06-02): Anuttara raw exports stay under c_1_symbol / c_1_complete_formulation; unprefixed symbol / formulation_type reserved as documented aliases only"
  - "DR-IG-1 (VALIDATED 2026-06-02): c_1_relation_family enum {structural, correspondential, kernel_core, inferred, sync, compatibility} added as the two-relation-families discriminator"
related_tranches:
  - "01.5 — image-assets-on-nodes schema property (M0)"
  - "01.6 — c_1_* naming round-trip (M0 / DR-M0-2)"
  - "01.7 — Kernel-S2 core-65 relations sync audit"
  - "09.1 — DR-IG-1 c_1_relation_family enum landing"
  - "09.2 — DatasetImporter sanitize_rel_type discriminator"
  - "09.5 — GDS-fed M0-3' synchronic/diachronic overlay"
  - "10.x — kernel-bridge profile-contract additions"
---

# S2 Graph Substrate Architecture

## §0. Frame

**S2 is the graph body of Epi-Logos.** It is the only coordinate-addressable persistent substrate in the stack. Every M' surface that addresses a node by `coordinate` consumes S2; every dataset that lands in Neo4j is mediated by `Body/S/S2/graph-services/src/dataset_import.rs`; every promotion from vault to graph is governed by `Body/S/S2/graph-services/src/sync_coordinator.rs`; every OWL/SHACL fact about the coordinate ontology lives in `Body/S/S2/ontology/epi.ttl` and is imported via `Body/S/S2/graph-services/src/ontology.rs`. The 65 kernel-core relations of `Body/S/S0/epi-lib/include/m0.h` are mirrored into the relation registry at `Body/S/S2/graph-schema/src/lib.rs:229-380`.

This document gives the total shape: the substrate-fact inventory (two Rust crates, 25 source files in `graph-services`, one 3072-line `graph-schema/src/lib.rs`, one 102-line OWL/SHACL TTL, ~117 typed property declarations); the M' consumption map (which M' surfaces read which S2 sub-coordinate); the cleanup findings (the schema lib is the largest split candidate at 3072 LOC; `sync_coordinator.rs` at 1384 LOC carries policy + plan + cypher + validation all in one module; the relationship registry hard-codes `coordinate_home` strings instead of typed S/M coordinate enums); and the contract gap surface (e.g. the gateway exposes six `s2.graph.*` methods but the rich `GraphMethodService` carries un-exposed `gds_tangent_overlay()`, `ontology_import_plan()`, and promotion-plan validation that M' would want to call).

**The substrate is landed.** Cycle 3 owns extension, audit, and the named refactors below — never a rebuild.

---

## §1. The Six Sub-Coordinates (verified against the live layout)

Per `S2-SPEC.md:64-84`, S2 carries an old base-prime sequence (S2.0–S2.5 base + S2.0'–S2.5' prime). The current Rust crate layout collapses base/prime into a single module surface but preserves the QL position semantics through the `coordinate_home` field of every `GraphPropertySpec` (`Body/S/S2/graph-schema/src/lib.rs:413-424`). The six are realized as:

| Sub-coord | Bimba intuition | Prime expression | Current Rust module(s) | Key types |
|---|---|---|---|---|
| **S2-0 / S2-0'** | Neo4j nodes / Node CRUD API | `:Bimba` label + `coordinate` property + node base | `graph-schema/src/lib.rs` constants 1-100; `graph-services/src/lib.rs` Neo4jClient; `graph-services/src/coordinate.rs` | `BIMBA_LABEL`, `COORDINATE_PROPERTY`, `Neo4jClient`, `ParsedCoordinate`, `CoordinateArrayParser` |
| **S2-1 / S2-1'** | Entity definitions / Relationships API | Relation registries; DR-IG-1 c_1_relation_family enum | `graph-schema/src/lib.rs:229-380` (`RELATIONSHIP_TYPE_SPECS`); `graph-services/src/relationship_manager.rs` | `RelationshipWritePlan`, `POSITION_REL_TYPES`, `RelationshipManager` |
| **S2-2 / S2-2'** | Graph operations / Coordinate Queries API | OWL/SHACL/n10s ontology bridge | `graph-services/src/ontology.rs`; `Body/S/S2/ontology/epi.ttl` | `OntologyImportPlan`, `OntologyPropertyMapping`, `import_epi_ontology_with_n10s` |
| **S2-3 / S2-3'** | Relationship patterns / Position Traversal API | GDS Option 1 projection + algorithm descriptors | `graph-services/src/gds.rs`; `graph-services/src/graph_api.rs` (`gds_tangent_overlay`) | `GdsProjectionPlan`, `GdsOverlayPayload`, `GDS_ALGORITHM_VERSIONS` |
| **S2-4 / S2-4'** | Graph context / Property/Relationship Sync API | RelationshipManager + PromotionPolicy (DR-M0-1 governed-route) | `graph-services/src/sync_coordinator.rs`; `graph-services/src/relationship_manager.rs`; `graph-services/src/bidirectional_sync.rs` | `PromotionPlan`, `PromotionPolicyDecision`, `PropertyProposal`, `SyncCoordinator`, `BidirectionalSyncer` |
| **S2-5 / S2-5'** | Graph queries / GraphRAG Retrieval API | dataset_import + retrieval (GraphRAG + hybrid + coordinate) | `graph-services/src/dataset_import.rs`; `graph-services/src/retrieval/{coordinate.rs,graphrag.rs,hybrid.rs}`; `graph-services/src/retrieval_query.rs` | `DatasetImporter`, `DatasetBranch`, `GraphRAGRetriever`, `HybridRetriever`, `GraphRetrievalQuery`, `RetrievalMode` |

`coordinate_home` strings in `LABEL_SPECS` (`lib.rs:142-227`) and `RELATIONSHIP_TYPE_SPECS` (`lib.rs:229-380`) carry the bimba-coordinate assignment for each schema item directly in the typed registry — these are the canonical S2 sub-coordinate anchors.

### 1.1 Two cross-cutting concerns

Two services span multiple sub-coordinates and resist clean placement:

- **`pointers.rs`** (493 LOC) — computes the 16-fold pointer web per the C foundation in `CLAUDE.md §III.D`. Reads `M1_M0_CROSSLINK`, `RING_QUATERNION_LUT`, Cl(4,2) basis from M1. It is mathematical/kernel content surfacing in S2-5 (synthesis) but with semantics from S2-0 (identity). Decision: belongs at S2-5 because the pointer-web is a refresh-on-tick projection, not an identity attribute.
- **`semantic.rs` / `embeddings.rs`** (375 + 177 LOC) — the embedding pipeline. Reads `SEMANTIC_EMBEDDING_DIMENSIONS = 3072` from schema, computes via Gemini client. Semantically S2-5' (synthesis embedding) but bootstrapped at S2-0' (alongside node identity). Decision: belongs at S2-5'.

---

## §2. Substrate Map — file:line citations for every named code unit

### 2.1 graph-schema crate — the contract layer (3072 LOC, one file)

**`Body/S/S2/graph-schema/src/lib.rs`** is the single source of truth for what the graph IS — every label, every relationship type, every property, every coordinate-prefix family.

**Schema constants block (lines 1-93):**
- `SCHEMA_VERSION = "2026-05-17-s2-bimba-coord-driven-3072"` (line 3)
- `GRAPH_ID = "primary"` (line 4)
- `EMBEDDING_VERSION = "q-semantic-v2-3072"` (line 5)
- `Q_SCHEMA_VERSION = "q-prefix-v2"` (line 6)
- `BIMBA_LABEL = "Bimba"` (line 8) — the singular canonical node label
- `COORDINATE_PROPERTY = "coordinate"` (line 9) — the identity property
- `SEMANTIC_EMBEDDING_DIMENSIONS: usize = 3072` (line 92)

**Compatibility surface (lines 95-124):**
- `COMPAT_LABELS` — `Coordinate`, `VaultArtifact`, `MarkdownArtifact`, `BimbaNode`, `BimbaCoordinate` (legacy retained as read-only compat)
- `COMPAT_NODE_PROPERTIES` — 20 bare property names (`name`, `description`, `family`, …) that must remain readable but never written; canonical writes use the prefixed forms.
- `COMPAT_EMBEDDING_DIMENSIONS = [768, 1536]` — legacy dimensions accepted from older imports.

**Label registry (lines 142-227):** 13 `GraphLabelSpec` entries. Canonical: `ThoughtArtifact` (T), `DailyNote` (S1.4), `NowSession` (S1.4'), `Psychoid` (M), `ContextFrame` (CF), `VakCoordinate` (VAK), `KernelResonanceObservation` (S2.5), `Bimba` (C0), `Stack` (S). Compat: `Coordinate`, `VaultArtifact`, `MarkdownArtifact`, `BimbaNode`, `BimbaCoordinate`.

**Relationship type registry (lines 229-380):** 25 `GraphRelationshipTypeSpec` entries.
- **Structural/co-ordinate** (compatibility=false): `REFERENCES` (S1.2), `SOURCES` (S1.0), `CONTAINS` / `PART_OF` (C0), `INVERTS_TO` (#).
- **LLM-inferred** (compatibility=false): `ELABORATES` (T5), `CONTRASTS` (L2), `IMPLEMENTS` (S4), `OPERATES_IN` (S), `REFLECTS_AS` (C5), `SUPPORTS` (P2), `CRITIQUES` (L4), `DERIVES_FROM` (C1).
- **Sync** (compatibility=false): `PROMOTES_TO` (S1/S2), `SYNCED_FROM` (S2).
- **Seed-topology** (compatibility=false): `GENERATES`, `ENTANGLES`, `INTERLEAVES` (C0); `MANIFESTS`, `BEDROCK`, `FAMILY_CONTAINS`, `MOBIUS_RETURN` (M); `ANCHORED_TO` (CF).
- **Compatibility-only**: `POS0_LINKS_TO`, `POS5_INTEGRATES_INTO` (M.compat).

Note: the **65 kernel-core relations** in `M0_CORE_RELATIONS` (`Body/S/S0/epi-lib/include/m0.h`) are NOT mirrored individually in this 25-entry list. The correspondential family (e.g. `HAS_DECAN`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `VORTEX_SPIRIT_AXIS`) currently lands via `DatasetImporter::sanitize_rel_type` without an entry in `RELATIONSHIP_TYPE_SPECS`. This is the load-bearing gap DR-IG-1 closes by adding a `c_1_relation_family` discriminator instead of bloating the type registry.

**Coordinate-prefix families (lines 474-512):** 7 families — `c`, `p`, `l`, `s`, `t`, `m`, `q` — each with a `CoordinatePrefixFamilySpec`. These drive the dynamic property law: any property key matching `{family}_{position}_[i_]{semantic_suffix}` is validatable without being pre-registered.

**Coordinate semantic registry (lines 514-635):**
- `COORDINATE_SEMANTIC_FAMILY_SPECS` — per-family `semantic_domain`, `direct_axis`, `inverted_axis`, `property_guidance` (the live agent rules).
- `COORDINATE_POSITION_SEMANTICS` — per-position `c_role`, `p_question`, `p_semantic_dual`, `property_guidance`. The 6 positions × 7 families × 2 axes = the addressing matrix.
- `COORDINATE_PROPERTY_AGENT_RULES` (9 entries, lines 625-635) — the canonical PI-agent rules. `coordinate` is never replaced by `bimbaCoordinate`. Property keys use `i` not `prime`/`inverted` for the inversion axis. `semantic_suffix` is `[a-z0-9]+` snake_case.
- `COORDINATE_PROPERTY_CONSTRUCTION_LAW` (lines 644-656) — the typed construction law: `{family}_{position}_{semantic_suffix}` direct, `{family}_{position}_i_{semantic_suffix}` inverted.

**Node property specs (lines 721-2700, approximately 117 `node_spec` / `indexed_node_spec` / direct-literal entries):** every typed property the graph accepts.
- S1 vault: `vault_path`, `artifact_kind`, `content_hash`, `title`, `summary`, `source_mtime`.
- S2 sync: `sync_status`, `sync_version`, `last_promoted_at`, `promotion_source`.
- C-family identity: `c_2_uuid`, `c_1_name`, `c_1_description`, `c_4_family`, `c_4_ql_position`, `c_4_layer`, `c_4_topo_mode`, `c_4_weave_state`, `c_4_inversion_state`, `c_4_flags`, `c_5_embedding`, `c_0_essence`, `c_0_core_nature`, `c_1_form`, `c_1_structure`, `c_3_source_dataset`, `c_3_dataset_branch`.
- S2-5 kernel resonance (lines 45-53): `c_5_kernel_resonance_index`, `_score`, `_square`, `_lens`, `_position`, `_helix`, `c_5_kernel_tick`.
- Pointer web (lines 54-63): `c_5_pointer_web_json`, `c_5_pointer_count`, `c_5_pointer_{family,reflective,inversion,position,lens,lens_inversion}_refs`, `c_5_harmonic_pointer_anchor_json`, `c_3_pointer_refreshed_at`.
- S3 Graphiti binding (lines 64-65): `s_3_session_key`, `s_3_graphiti_arc_id`.
- S0 code provenance (lines 66-73): `s_0_repo_path`, `s_0_repo_root`, `s_0_file_kind`, `s_0_component`, `s_0_symbol_refs`, `s_0_execution_flow_refs`, `s_0_depends_on_paths`, `s_0_owned_by_coordinate`.
- M0' deep-bimba (lines 1600-1650): `m_0_consciousness_operation`, `_function`, `_grammatical_function`, `_spanda_relationship`, `_metaphysical_names`, `_adam_eve_classification`.
- M1' deep-bimba (lines 1656-1700): `m_1_topological_formula`, `_processual_topology_role`, `_matrix_type`, `_construction_phase`, `_algebraic_correspondence`, `m_1_topological_significance`.
- M2' deep-bimba (lines 1688-1760): `m_2_arabic_text`, `_trilateral_root`, `_dhikr_application`, `_recitation_count`, `_zodiacal_influence`, `_therapeutic_cluster`, `_digital_root`, `_matrix_constant`, `_magic_square_sum`, `_abjad_value`.
- M3' deep-bimba (lines 1760-1850): `m_3_quadrant`, `_rotational_phase`, `_yin_yang_balance`, `_elemental_affinity`, `_amino_acid_code`, `_positive_codon_binary`, `_negative_codon_binary`, `_upper_pair_binary`, `_lower_pair_binary`, `_tarot_card`, `_hebrew_letter`, `_degree`.
- M4' deep-bimba (lines 1850-1900): `m_4_temporal_structure`, `_temporal_intelligence_layer`, `_kashmir_shaivism_alignment`, `_practical_manifestations`, `_capability_signals`, `_preferred_timing`, `_two_stroke_doctrine`.
- M5' deep-bimba (lines 1895+): `m_5_whitehead_lacanian`, `_lacanian_interface`, etc.
- L2/L3/L4 lens (lines 1184-1535): `l_2_therapeutic_properties`, `_temperament_balance`, `_healing_specialty`, `_chakra_correspondence`, `_breath_pattern`, `_elemental_nature`, `l_3_seasonal_position`, `l_4_mef_condition`, `_interpretive_role`, `_modality`, `_reflection_table`.
- S4'/S5' subsystem (lines 1240-1290, 1536-1582): `s_4_function_role`, `_input_contracts`, `_output_contracts`, `_queryable_properties`, `_function_description`, `_translation_schema`, `_safety_class`, `_eligible_formats`; `s_5_agent`, `_tool_affinity`, `_system_prompt`, `_capabilities`.
- T1/T3/T5 thought (lines 1288-1350, 1584-1598): `t_1_epistemic_function`, `t_3_developmental_stage`, `_process_realization`, `t_5_next_evolution_phase`.
- Q-family quickview (lines 1304-1359): `q_1_theoretical_thesis`, `q_2_sophia_logos_dialectic`, `_instantiation_mode`, `q_3_dialectical_movement`, `q_4_historical_diagnosis`, `q_5_integration_template`, `_conjunctive_threshold`.
- C1 anuttara-language (lines 1408-1431) — the **DR-M0-2 surface**: `c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation`, `c_1_formulation_breakdown`, `c_1_key_principles`, `c_1_primary_designation`.

**Relationship property specs (similar volume, scattered ~2100-2680 of the file):**
- Evidence: `evidence_kind`, `evidence_text`, `source_path`, `source_line`, `target_text`, `confidence`, `inferred_by`, `prompt_hash`, `created_by_sync_version`, `last_verified_at` (lines 78-87).
- Required: `REQUIRED_RELATIONSHIP_EVIDENCE_PROPERTIES = [evidence_kind, evidence_text]` (lines 89-90).
- The relation registry uses `c_0_source_coordinate`, `c_0_target_coordinate`, `c_1_relation_family` (post-DR-IG-1), `c_2_relation_type`, `c_3_created_at`, `c_4_provenance` — see usage in `graph_api.rs:319-327` (kernel resonance observation cypher).

**API surface (lines 2700-2872):**
- `coordinate_semantic_registry()` returns the full registry struct
- `coordinate_prefix_property_key(prefix, position, suffix)` + `_for_axis()` build canonical property keys
- `labels_for_coordinate_node(coordinate, artifact_kind)` derives label set
- `canonical_property_key(key)` canonicalizes legacy names
- `property_spec(key)` resolves any property to its spec
- `validate_coordinate_prefix_property(key)` typed validation of dynamic keys
- `relationship_required_evidence_property_keys()` exposes the required evidence set
- `canonical_node_property_keys()` enumerates non-compat keys

**Constants for constraints (separately, not in the LOC count): `CONSTRAINTS`, `VECTOR_INDEX`** — Cypher snippets ensuring `(:Bimba {coordinate})` unique and the `coord_embedding` vector index over `c_5_embedding`.

**Tests (lines 2874-3072):** 12 unit tests verifying canonical schema, label correctness, relationship registration, deep-bimba surface coverage, prefix-property convention.

### 2.2 graph-services crate — the runtime layer (25 modules, ~12,026 LOC total)

**Module manifest** at `Body/S/S2/graph-services/src/lib.rs:9-34`:

| Module | LOC | Primary responsibility |
|---|---|---|
| `analyse` | 328 | Graph analysis utilities |
| `anuttara` | 124 | M0' anuttara-language helpers |
| `bidirectional_sync` | 165 | Two-way vault↔graph reconciliation |
| `constraint` | 320 | Schema-constraint enforcement |
| `consumption` | 306 | M5 handoff consumption contract |
| `coordinate` (private) | 736 | `CoordinateArrayParser`, `ParsedCoordinate`, `WikiLink`, `CoordLayer`, `wrap_context_frames`, `convert_hash_to_m_family` |
| `cypher` | 326 | Cypher guard (read/write mode), row limits, statement check |
| `dataset_import` | **1655** | Bimba dataset import (low-detail + deep) |
| `doctor` | 1200 | `graph doctor --json` readiness contract |
| `embeddings` | 177 | Gemini embedding client |
| `gds` | 192 | GDS Option 1 projection plan + blocked overlay payload |
| `graph_api` | 844 | `GraphMethodService` — typed query / node / traverse / pointer_web / kernel_resonance / gds_tangent_overlay |
| `lib` | 633 | `Neo4jClient`, `SemanticCacheClient`, re-exports, role/config types |
| `lifecycle` | 150 | Embedding refresh, live-graph evidence |
| `link_enforcement` | 82 | Wikilink-to-graph validation |
| `meta` | 306 | `GraphMeta` lifecycle, `is_bootstrapped`, `read_graph_meta`, `write_graph_meta`, `desired_meta`, `manual_drift_fields` |
| `ontology` | 112 | OWL/SHACL/n10s bridge (`ontology_import_plan`, `record_ontology_bridge_facts`, `import_epi_ontology_with_n10s`) |
| `pointers` | 493 | `PointerWeb`, `KernelCoordinateAnchor`, `HarmonicPointerAnchor` — 16-fold pointer web |
| `relationship_manager` | 424 | `RelationshipWritePlan`, `RelationshipManager`, `POSITION_REL_TYPES` |
| `retrieval/coordinate` | 157 | Coordinate-only retrieval |
| `retrieval/graphrag` | 306 | GraphRAG retrieval |
| `retrieval/hybrid` | 552 | Hybrid (graph + vector) fusion |
| `retrieval_query` (private) | 340 | Query classification, RRF/weighted fusion, disclosure |
| `schema` | 101 | Schema bootstrap (constraints + vector index install) |
| `seed` | 992 | Canonical seed (`seed_coordinate_space`, `seed_baseline_snapshot_queries`, `seed_parashakti_body_zones`, `seed_decan_body_data`) |
| `semantic` | 375 | `SemanticDocument` |
| `sync_coordinator` | **1384** | Promotion policy, plan, validation, cypher generation, sync result |
| `types` | 68 | `EdgeRef`, `NodeRef`, `PathResult`, `RelationshipType`, `GraphResult` |
| `vault` | 193 | `GraphAPI`, `SyncOrchestrator`, `EntityMapper`, `QLAlignmentValidator`, `parse_yaml_frontmatter` |

**Two largest modules — `dataset_import.rs` (1655) and `sync_coordinator.rs` (1384) — together carry ~25% of the runtime LOC.** Both are core load-bearers and primary split candidates (see §5).

### 2.3 The Neo4j client surface (lib.rs)

`Body/S/S2/graph-services/src/lib.rs`:
- `Neo4jConfig` (line 146), `Neo4jClient` (line 163) — wraps the `neo4rs::Graph` Bolt driver.
- `SemanticCacheConfig` (line 219), `SemanticCacheClient` (line 401), `SearchPayload`/`StorePayload`/`SearchResult` (lines 336-388), `SemanticCacheHealth` (line 388), `SemanticCacheMatchStrategy` (line 330) — the Redis-backed semantic cache.
- `GraphRedisRole` (line 108), `Neo4jGraphRole` (line 119) — role markers for the dual-substrate.
- `SEMANTIC_REDIS_NAMESPACE = "s2:graph:semantic"` (line 104), `SEMANTIC_CACHE_NAME = "epi_semantic_cache"` (line 105).

### 2.4 The ontology (Body/S/S2/ontology/epi.ttl, 102 lines)

OWL2 RL bridge:
- `epi:` namespace = `https://epi-logos.org/ontology#` (line 1).
- `epi:BimbaNode` (line 15) — the OWL class matching `:Bimba` label.
- `epi:CoordinateNode` ⊂ `epi:BimbaNode` (line 19).
- `epi:AnuttaraNode` ⊂ `epi:CoordinateNode` (line 23) — carries S2-owned symbol / formulation_type / complete_formulation per DR-M0-2.
- `epi:SourceAnchor` ⊂ `prov:Entity` (line 29) with subclasses `SpecAnchor` (line 33), `CodeAnchor` (line 37), `TestAnchor` (line 41) — PROV-O grounded provenance classes.
- `epi:RelationFamily` (line 45) — the abstract class DR-IG-1 enum values instantiate.
- `epi:CoordinateRelation` (line 47) — the abstract object property all coordinate-coordinate edges subProperty.
- SHACL shapes (lines 50-100 approx) — node shape constraints, severity reporting through `n10s.validation.shacl.validate`.

### 2.5 External (Body/S/S2/external/bimba-mcp)

The `bimba-mcp` MCP server (Node-based) exposes a subset of the S2 graph surface to MCP clients. This is read-mostly; promotion writes still flow through Rust. Treat as a consumer of `GraphMethodService`, not a parallel substrate.

---

## §3. M' Dependency Map

Every M' surface that addresses graph nodes consumes S2. The cycle-3 Phase A architecture docs ratify the specific M' methods. Cross-references below cite the surface and the consuming code/contract path.

### 3.1 M0' Anuttara

**Direct consumer.** M0' is the densest consumer:
- The `anuttara-language` namespace at `graph-schema/src/lib.rs:1408-1431` (`c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation`, `c_1_formulation_breakdown`, `c_1_key_principles`, `c_1_primary_designation`) is read directly by `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` (per DR-M0-2 ratified spec).
- The 65 kernel-core relations from `Body/S/S0/epi-lib/include/m0.h:M0_CORE_RELATIONS[65]` are mirrored in two phases: the structural 25 in `RELATIONSHIP_TYPE_SPECS`; the correspondential ones via `DatasetImporter::sanitize_rel_type` + the post-DR-IG-1 `c_1_relation_family` enum on the relationship.
- The M0' six data layers (`{lang, ql, rel, time, pers, pedag}`) — Tranche 1.1 (m0-anuttara reconciliation) — each routes a distinct subset of property keys through a single S2 query path.
- DR-M0-1 governed-route: `MutationProposal` flows through `SyncCoordinator::validate_property_proposals` (`sync_coordinator.rs:529-623`) before any node-upsert cypher fires.
- Tranche 1.5 image-assets: needs new schema property `c_1_asset_uri` (StringList) + `c_1_asset_kind` (String) at `graph-schema/src/lib.rs:1408-1431`.
- See [[M0'-ARCHITECTURE]] §3, §4.

### 3.2 M1' Paramaśiva

**Indirect consumer.** M1' carries math-substrate, not graph reads. Touch points:
- `RING_QUATERNION_LUT[12]` and `M1_M0_CROSSLINK[12]` from `Body/S/S0/epi-lib/include/m1.h:551-564, m1.c:145-150` are consumed by `pointers.rs:169-243` for the harmonic pointer-anchor. The graph carries the projection; the kernel owns the data.
- The M1-2' 12-fold harmonic vortex matrices are surfaced through the profile bus's `ananda_vortex` projection — written by S0/portal-core kernel, not by S2.
- See [[M1'-ARCHITECTURE]].

### 3.3 M2-1' Vimarśa

**Direct consumer of correspondence-tree relations.** The Vimarśa-read correspondence-tree (audio_octet, nodal_quartet) writes through to graph nodes via:
- `KernelResonanceObservationRequest` / `Plan` (`graph_api.rs:179-200, 243-356`) — Vimarśa-driven cypher MERGE that creates `:KernelResonanceObservation` nodes off `:Bimba` sources with the kernel tick, lens, ascent helix, position6, resonance score, tritone square recorded.
- The `KERNEL_RESONANCE_*` property block (`graph-schema/src/lib.rs:45-53`) and the kernel-resonance relation `HAS_KERNEL_RESONANCE` (line 46) carry the surface.
- See [[M2'-ARCHITECTURE]].

### 3.4 M3-5 Mahamaya codon-graph

**Direct consumer.** The M3' deep-bimba properties (`m_3_amino_acid_code`, `m_3_positive_codon_binary`, `m_3_negative_codon_binary`, `m_3_upper_pair_binary`, `m_3_lower_pair_binary`, `m_3_tarot_card`, `m_3_hebrew_letter`, `m_3_degree`, `m_3_quadrant`, `m_3_rotational_phase`, `m_3_yin_yang_balance`, `m_3_elemental_affinity`) at `graph-schema/src/lib.rs:1760-1850` are all M3' consumer properties for the codon-graph M3' surface.
- The codon-graph data lands through `mahamaya-deep/nodes-full-detail.json` + `mahamaya-deep/relations.json` per `deep_dataset_plan()` (`dataset_import.rs:747-786`).
- See [[M3'-ARCHITECTURE]].

### 3.5 M4 Nara protected-handles cross-namespace

**Boundary consumer.** M4 Nara carries protected/local bodies that MUST NOT enter the canonical projection:
- `GDS_EXCLUDED_LABELS = ["GraphitiEpisode", "NaraBody", "ProtectedLocalBody", "PrivateProjection"]` (`gds.rs:11-16`) — the Option 1 projection privacy boundary.
- `M4'-SPEC` consumes the `c_1_relation_family = 'sync'` and `'inferred'` distinctions to keep its temporal projections clean from canonical writes.
- See [[M4'-ARCHITECTURE]].

### 3.6 M5' Epii (atelier)

**Governed-write consumer.** M5' is the atelier authority for canonical mutation:
- `M5_HANDOFF_CONTRACT_VERSION = "2026-06-01.02-T8"` and `m5_handoff_consumption_contract()` (`consumption.rs:8-50`) lock the M5 handoff surface.
- `FORBIDDEN_CLIENT_DERIVATIONS` (`consumption.rs:10-19`) lists client-side derivations M5 must not perform (graph-side computations stay graph-side).
- `PromotionPolicyDecision::CanonicalBimbaSeed` and `BimbaWorldTemplate` (sync_coordinator.rs:80-89) are the M5-atelier write targets.
- See [[M5'-ARCHITECTURE]].

### 3.7 Integrated bimba-graph plugin (Wave-B 09)

The cycle-3 integrated Wave-B reconciliation (`09-integrated-bimba-graph-reconciliation.md`) names three live integration tranches over S2:
- 09.1 — DR-IG-1 c_1_relation_family enum landing in `RELATIONSHIP_PROPERTY_SPECS`.
- 09.2 — `DatasetImporter::sanitize_rel_type` discriminator wired to enum.
- 09.5 — `gds_tangent_overlay()` output bridged through kernel-bridge into M0-3' synchronic/diachronic panel.

### 3.8 Cosmic-engine plugin (Wave-B 07)

The integrated 1-2-3 cosmic engine reads Anuttara nodes (M0), Ananda matrices (M1, kernel-side), and Parashakti decans (M2 dataset) — composable through a single graph traverse with `c_1_relation_family = 'kernel_core'` filter once DR-IG-1 lands. See `07-integrated-1-2-3-cosmic-engine-reconciliation.md`.

### 3.9 Recognition plugin (Wave-B 08)

The integrated 4-5-0 recognition consumes M4 Nara protected handles + M5 atelier-write + M0 anuttara nodes. The `c_1_relation_family = 'sync'` discriminator is the operational filter that prevents recognition writes from polluting canonical seed reads. See `08-integrated-4-5-0-recognition-reconciliation.md`.

---

## §4. Contract Surface — what is exposed, what should be

### 4.1 What the gateway (`epi-s3-gateway-contract`) currently exposes

Six methods at `Body/S/S3/gateway-contract/src/lib.rs:139-144`:
- `s2.graph.query` (line 139) — generic Cypher pass-through (guarded by `cypher::check_statement`)
- `s2.graph.node` (line 140) — node by `coordinate`
- `s2.graph.traverse` (line 141) — bounded traversal
- `s2.graph.pointer_web.compute` (line 142) — typed `PointerWeb` for a coordinate (no write)
- `s2.graph.pointer_web.refresh` (line 143) — writes pointer-web JSON + counts on the node
- `s2.graph.kernel_resonance.record` (line 144) — Vimarśa-driven observation MERGE

Each is registered with a contract block (`lib.rs:1100-1130 of gateway-contract`) that names `GraphMethodService` as the executor.

### 4.2 What `GraphMethodService` exposes internally but the gateway does NOT

`graph-services/src/graph_api.rs:217-844` carries methods that are NOT in the gateway six:
- `gds_tangent_overlay(GdsOverlayRequest) -> GdsOverlayPayload` — the Option 1 GDS recommendation surface (currently returns blocked payload in APOC-only topology, but typed). **Not callable from M' Theia through the kernel-bridge.** Wave-B 09.5 wants this for the M0-3' synchronic panel.
- Promotion-plan construction — `PromotionPlan::new()`, `PromotionPlan::node_upsert_query()`, `PromotionPlan::attach_vak_address()`. M5' Atelier needs governed-route access to this surface.
- Ontology surface — `import_epi_ontology_with_n10s`, `record_ontology_bridge_facts`. M0' inspector cannot trigger ontology reload.
- Seed surface — `seed_baseline_snapshot_queries()`, `seed_coordinate_space()`, `seed_parashakti_body_zones()`, `seed_decan_body_data()`. M0/M2/M5 inspectors cannot interrogate seed coverage.

### 4.3 Profile-bus integration

S2 currently has **one profile-bus surface** — kernel resonance, written through `KernelResonanceObservationPlan`. The plan format itself (`graph_api.rs:192-200`) is the bus payload. The plan's `resonance_index`, `tritone_square`, `lens`, `position`, `ascent_helix`, `kernel_tick` all mirror `MathemeHarmonicProfile` (`Body/S/S0/portal-core/src/kernel.rs:346-465`) fields.

**Gap:** no `graph_handle` or `coordinate_resolution_cache` projection on `MathemeHarmonicProfile`. M' surfaces re-resolve `coordinate` strings through `CoordinateArrayParser` on every tick. The fix per cycle-3 Tranche 10 (kernel-bridge profile-contract) would add a `graph: GraphAnchorProjection` field carrying the canonical-form coordinate, depth, prefix, parent, axis already computed.

### 4.4 What should be exposed but isn't (load-bearing gaps)

| Gap | Surface | Tranche |
|---|---|---|
| `gds_tangent_overlay` to M0-3' | Gateway method `s2.graph.gds.tangent_overlay` | 09.5 |
| `c_1_relation_family` enum | Schema constant `RELATION_FAMILY_VALUES: &[&str]` + property spec entry | 09.1 (DR-IG-1) |
| `c_1_asset_uri` / `c_1_asset_kind` on Anuttara | `node_spec` entries at `lib.rs:1408-1431` | 1.5 |
| Kernel-core-65 sync audit | New `graph-services/src/core65_audit.rs` + gateway method `s2.graph.core65.audit` | 1.7 |
| Ontology reload from inspector | Gateway method `s2.graph.ontology.reload` (calls `import_epi_ontology_with_n10s`) | M0' Tranche pending |
| Seed coverage interrogation | Gateway method `s2.graph.seed.snapshot` (wraps `seed_baseline_snapshot_queries`) | M0/M2/M5 inspector pending |
| Promotion-plan dry-run | Gateway method `s2.graph.promotion.dry_run` (wraps `PromotionPlan::node_upsert_cypher` without execution) | M5' atelier governed-route |

---

## §5. Code Cleanup + Modularisation Findings

Concrete, prioritised proposals. Each names location, current shape, proposed refactor, benefit, blast radius.

### 5.1 PRIORITY 1 — Split `graph-schema/src/lib.rs` (3072 LOC, ONE file)

**Location:** `Body/S/S2/graph-schema/src/lib.rs:1-3072`.

**Current shape:** ONE file carries: schema constants, compat surface, label registry, relationship type registry, coordinate-prefix families, coordinate semantic registry, position semantics, agent rules, property construction law, ~117 typed node/relationship property specs, 5 derived registries, validation helpers, label derivation, canonicalization, tests. Multiple distinct concerns interleaved.

**Proposed refactor — module split:**
```
graph-schema/src/
  lib.rs            (~250 LOC: re-exports + crate root)
  constants.rs      (~120 LOC: SCHEMA_VERSION, GRAPH_ID, BIMBA_LABEL, COORDINATE_PROPERTY, …, compat constants)
  labels.rs         (~150 LOC: GraphLabelSpec, LABEL_SPECS, label_spec(), labels_for_coordinate_node())
  relationships.rs  (~250 LOC: GraphRelationshipTypeSpec, RELATIONSHIP_TYPE_SPECS, relationship_spec())
  properties/
    mod.rs          (~200 LOC: GraphPropertySpec, owner/type/cardinality/disclosure enums, node_spec helpers)
    node_specs.rs   (~1200 LOC: NODE_PROPERTY_SPECS — the ~117 declarations)
    rel_specs.rs    (~400 LOC: RELATIONSHIP_PROPERTY_SPECS)
    deep_bimba.rs   (~600 LOC: m_*, l_*, q_*, t_*, s_* deep-bimba property surface — currently the bulk)
  coordinate_law.rs (~250 LOC: prefix families, semantic registry, position semantics, construction law, agent rules)
  validation.rs     (~200 LOC: validate_coordinate_prefix_property, canonical_property_key, property_spec)
  constraints.rs    (~150 LOC: CONSTRAINTS, VECTOR_INDEX Cypher snippets)
```

**Benefit:** searching a property declaration drops from O(3072 lines) to O(200 lines). The deep-bimba property surface — which evolves per cycle as M' surfaces add fields — gets its own file, so cycle-3 additions (M0' asset URIs, DR-IG-1 relation family) land in `node_specs.rs` or `rel_specs.rs` without churn in the registry skeleton.

**Blast radius (M' consumers):** none if `pub use` re-exports are preserved in `lib.rs`. The `epi_s2_graph_schema::*` import surface stays identical. `cargo check -p epi-s2-graph-schema` is the verification.

### 5.2 PRIORITY 1 — Split `sync_coordinator.rs` (1384 LOC)

**Location:** `Body/S/S2/graph-services/src/sync_coordinator.rs:1-1384`.

**Current shape:** one module carries: promotion intent types, promotion policy types, property proposal types, frontmatter rule types, code provenance types, graphiti episode plan, promotion plan, promotion sync report, promotion path classifier (~106 LOC of `classify_promotion_path` chain), property proposal validator (~95 LOC), frontmatter property planner, code provenance planner, plan-to-cypher generation, sync coordinator struct + executor. Too many responsibilities for one module.

**Proposed refactor:**
```
graph-services/src/sync/
  mod.rs                  (re-exports)
  intent_types.rs         (~120 LOC: S2GraphPromotionIntent, Node, PromotionLinkEvidence, PromotionFrontmatterEvidence, PromotionRelationCandidate)
  policy.rs               (~200 LOC: PromotionClass, PromotionTargetSurface, PromotionPolicyDecision, classify_promotion_path)
  property_proposals.rs   (~250 LOC: PropertyProposal, ValidatedPropertyProposal, PropertySchemaStatus, validate_property_proposals)
  frontmatter_rules.rs    (~150 LOC: FrontmatterPropertyRule, canonical_frontmatter_key, plan_frontmatter_properties, FRONTMATTER_PROPERTY_RULES table)
  code_provenance.rs      (~150 LOC: CodeProvenanceEvidence, plan_code_provenance_properties)
  graphiti_episode.rs     (~80 LOC: GraphitiEpisodePlan)
  plan.rs                 (~250 LOC: PromotionPlan, node_upsert_cypher, node_upsert_query, attach_vak_address)
  coordinator.rs          (~200 LOC: SyncCoordinator, executor surface)
  report.rs               (~80 LOC: SyncResult, GraphPromotionSyncReport)
```

**Benefit:** the policy chain becomes its own file and can be tested per-class without spinning up the executor. Property-proposal validation (the load-bearing PI-agent surface for DR-M0-1 governed-route) gets visible separation. Plan generation (the cypher producer) stops being interleaved with policy.

**Blast radius:** moderate — `pub use sync_coordinator::*` in `lib.rs:92-98` needs updating to `pub use sync::*`. All external consumers route through these re-exports, so M' surfaces and CLI commands are insulated.

### 5.3 PRIORITY 2 — Type the `coordinate_home` field

**Location:** `Body/S/S2/graph-schema/src/lib.rs:127-228` (`GraphLabelSpec`), `:135-380` (`GraphRelationshipTypeSpec`), `:413-424` (`GraphPropertySpec`).

**Current shape:** `coordinate_home: &'static str` literally on every spec. Values include `"S2.0"`, `"S1.2"`, `"M.compat"`, `"C0"`, `"CF"`, `"VAK"`, `"S2.compat"`, `"S2.4"`, `"L2'"`, `"M3'"`, etc. ~30 distinct strings repeated ~150 times. No exhaustivity check.

**Proposed refactor:** introduce a typed enum
```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CoordinateHome {
    Compat { family: CoordinateFamily },
    Sub { family: CoordinateFamily, position: u8, axis: CoordinateAxis },
    Namespace(NamespaceTag),
    Root,
}

pub enum CoordinateFamily { C, P, L, S, T, M, Q, VAK, CF }
pub enum CoordinateAxis { Direct, Prime }
pub enum NamespaceTag { Bimba, Stack, Psychoid, ContextFrame, VakCoordinate, AnuttaraLanguage, DeepBimba, ... }
```
Then `coordinate_home: CoordinateHome` everywhere. Provides Display for the legacy string form, but typed at the schema-construction site.

**Benefit:** the compiler proves every spec carries a parseable home. Adding a new namespace becomes an enum variant, not a free string. Validation that a property's home is consistent with its key prefix becomes a typed `Result`.

**Blast radius:** wide within `graph-schema` (every single spec line touched) but the change is mechanical. M' consumers do not read `coordinate_home` directly — they read property keys. The `LABEL_SPECS` / `RELATIONSHIP_TYPE_SPECS` / `NODE_PROPERTY_SPECS` exports stay shape-compatible if `coordinate_home`'s Display impl preserves the old string form.

### 5.4 PRIORITY 2 — Land DR-IG-1 c_1_relation_family enum as typed constant

**Location:** `Body/S/S2/graph-schema/src/lib.rs` (post-DR-IG-1 landing).

**Current shape:** the discriminator is named in cypher in `graph_api.rs:323` (`r.c_1_relation_family = 'kernel-resonance'`) and in the integrated 09 plan, but is NOT a typed constant in schema. `DatasetImporter::sanitize_rel_type` (`dataset_import.rs`) lands correspondential relations without setting the family at all.

**Proposed refactor:**
```rust
pub const RELATION_FAMILY_VALUES: &[&str] = &[
    "structural",
    "correspondential",
    "kernel_core",
    "inferred",
    "sync",
    "compatibility",
];
pub const RELATION_FAMILY_PROPERTY: &str = "c_1_relation_family";

// Add to RELATIONSHIP_PROPERTY_SPECS:
//   key: RELATION_FAMILY_PROPERTY,
//   coordinate_home: <S2.1>,
//   value_type: String,
//   disclosure: Public,
//   source_family: "schema-discriminator",
//   indexed: true,
```
Then `DatasetImporter::sanitize_rel_type` must set the family on every imported relation. `RelationshipWritePlan::new` should accept the family.

**Benefit:** the two-relation-families gap closes. GDS Option 1 projection can filter `WHERE r.c_1_relation_family IN ['structural', 'correspondential']` to exclude inferred/sync overlays from algorithm input.

**Blast radius:** schema crate (1 const + 1 prop spec); `dataset_import.rs` (~10 line additions); `relationship_manager.rs` (~5 line additions). All M' consumers benefit; none break.

### 5.5 PRIORITY 2 — Extract Option 1 GDS plan from `gds.rs:79-102` into typed-cypher fragments

**Location:** `Body/S/S2/graph-services/src/gds.rs:79-102` (`option1_projection_plan`).

**Current shape:** `graph_list_cypher` and `project_cypher` are inline string literals. The `relationship_types` list is filtered from `RELATIONSHIP_TYPE_SPECS` at call time. Inflexible: no per-call algorithm tuning, no incremental projection.

**Proposed refactor:** move to a `GdsProjectionBuilder` with typed methods:
```rust
GdsProjectionBuilder::option1()
    .with_excluded_labels(GDS_EXCLUDED_LABELS)
    .with_relationship_filter(|spec| !spec.compatibility)
    .with_relation_family_filter(&["structural", "correspondential"])  // post DR-IG-1
    .build()
```

**Benefit:** the algorithm-gated state machine (`gds_tangent_overlay` at `gds.rs:146-192`) has explicit phase tracking — `projection-missing` → `projection-ready-algorithm-gated` → `projection-ready-algorithm-active`. Cycle-3 Tranche 09.5 can land the runner without restructuring the projection plan.

**Blast radius:** isolated to `gds.rs`; `option1_projection_plan()` keeps its current shape as a builder shortcut.

### 5.6 PRIORITY 3 — Promote `coordinate` module from private to public (or split)

**Location:** `Body/S/S2/graph-services/src/lib.rs:14` (declared `mod coordinate;` — private) but `Body/S/S2/graph-services/src/coordinate.rs` is 736 LOC and re-exports `ParsedCoordinate`, `CoordinateArrayParser`, `WikiLink`, `CoordLayer`, `wrap_context_frames`, `convert_hash_to_m_family`, `extract_context_frames`, `cf_node_for_frame` through `pub use coordinate::*;` at `lib.rs:40-43`.

**Current shape:** private mod, ~700 LOC, parsing + wikilink extraction + CF frame extraction + hash-to-M-family conversion all in one. M' Theia extensions cannot import the private module directly.

**Proposed refactor:** split into `coordinate/` directory:
```
graph-services/src/coordinate/
  mod.rs              (re-exports)
  parser.rs           (~250 LOC: CoordinateArrayParser, ParsedCoordinate, CoordLayer)
  wikilink.rs         (~150 LOC: WikiLink, extraction)
  context_frame.rs    (~200 LOC: cf_node_for_frame, extract_context_frames, wrap_context_frames)
  legacy.rs           (~100 LOC: convert_hash_to_m_family)
```
Keep `mod coordinate` private at the crate root; re-export through `lib.rs`.

**Benefit:** parser tests live with the parser. Wikilink extraction tests live with the wikilink module. The legacy hash-to-M-family converter is visibly siloed so it can be retired when the last `#0..#5` dataset entry migrates.

**Blast radius:** internal to `graph-services` crate; external re-exports unchanged.

### 5.7 PRIORITY 3 — `dataset_import.rs` split (1655 LOC)

**Location:** `Body/S/S2/graph-services/src/dataset_import.rs:1-1655`.

**Current shape:** `DatasetImporter` (line 117) carries node import (`import_nodes_with_metadata`), relation import (`import_relations_with_metadata`), aggregated-shape relation import, property mapping (`property_value_for_node`, ~150 LOC), `sanitize_rel_type`, `coordinate_from_node`, branch helpers, the canonical plan / low-detail plan / deep plan tables. The `STRING_LIST_TARGETS` constant (line 122) is the bare-minimum string-list whitelist.

**Proposed refactor:**
```
graph-services/src/dataset_import/
  mod.rs              (re-exports)
  importer.rs         (~400 LOC: DatasetImporter struct + import_nodes_with_metadata + import_relations_with_metadata)
  branch.rs           (~150 LOC: DatasetBranch, DatasetImportReport, DatasetBranchReport, DatasetSkip)
  plans.rs            (~150 LOC: canonical_dataset_plan, low_detail_dataset_plan, deep_dataset_plan)
  property_mapping.rs (~300 LOC: node-property mapping + STRING_LIST_TARGETS + sanitize_rel_type)
  json_utils.rs       (~150 LOC: strip_json_bom, sanitize_json_control_chars, coordinate_from_node, relation_type_from_value, relation_endpoint)
  cypher.rs           (~300 LOC: the embedded Cypher templates)
```

**Benefit:** the dataset plan tables (the 14 low-detail branches + 6 deep branches) become a clearly-named data file. Cycle-3 dataset additions (new deep-bimba branches, Mahamaya codon enrichment) edit `plans.rs` only.

**Blast radius:** internal; `pub use dataset_import::DatasetImporter` in `lib.rs:44` unchanged.

### 5.8 PRIORITY 4 — `graph_api.rs` `GraphMethodService` impl bloat (844 LOC)

**Location:** `Body/S/S2/graph-services/src/graph_api.rs:217-844`.

**Current shape:** one `impl<'a> GraphMethodService<'a>` block carries: `resolve_coordinate_string`, `kernel_resonance_observation_plan`, `pointer_web_refresh_plan`, `gds_tangent_overlay`, generic `query` execution, `node` lookup, `traverse`. The `kernel_resonance_observation_plan` alone is ~110 LOC of cypher generation.

**Proposed refactor:** keep the `GraphMethodService` struct, but split impls by sub-coordinate:
```rust
// graph_api/coordinate.rs
impl<'a> GraphMethodService<'a> {
    pub fn resolve_coordinate_string(...) { ... }
    pub async fn graph_node(...) { ... }
    pub async fn graph_traverse(...) { ... }
    pub async fn graph_query(...) { ... }
}

// graph_api/kernel_resonance.rs   (S2-2-3 surface)
impl<'a> GraphMethodService<'a> {
    pub fn kernel_resonance_observation_plan(...) { ... }
    pub async fn record_kernel_resonance(...) { ... }
}

// graph_api/pointer_web.rs        (S2-5 surface — pointers projection)
impl<'a> GraphMethodService<'a> {
    pub fn pointer_web_refresh_plan(...) { ... }
    pub async fn refresh_pointer_web(...) { ... }
}

// graph_api/gds.rs                (S2-3 surface)
impl<'a> GraphMethodService<'a> {
    pub async fn gds_tangent_overlay(...) { ... }
}
```

**Benefit:** the cypher-generation surface is grouped by sub-coordinate. Adding the GDS algorithm runner (Tranche 09.5) lands in `graph_api/gds.rs` only.

**Blast radius:** internal; the gateway methods read the same impl items.

### 5.9 Test coverage findings

Contract tests inventory (`graph-services/tests/`, 22 contracts):
- `code_provenance_contract.rs`, `coordinate_query_contract.rs`, `dataset_import_live_contract.rs`, `doctor_plugin_readiness_contract.rs`, `frontmatter_property_rules_contract.rs`, `gds_overlay_contract.rs`, `graph_api_contract.rs`, `graph_promotion_contract.rs`, `graph_runtime_extraction_contract.rs`, `graphiti_promotion_plan_contract.rs`, `hen_promotion_lifecycle.rs`, `m5_handoff_contract.rs`, `neo4j_client_contract.rs`, `neo4j_contract.rs`, `ontology_bridge_contract.rs`, `promotion_policy_contract.rs`, `promotion_vak.rs`, `property_proposal_contract.rs`, `relationship_manager_contract.rs`, `retrieval_fusion_contract.rs`, `retrieval_vak_bias.rs`, `schema_creation_contract.rs`, `seed_contract.rs`, `semantic_cache_contract.rs`, `vault_contract.rs`.

**Gaps:**
- No `core65_audit_contract.rs` — Tranche 1.7 requires it.
- No `c_1_relation_family_contract.rs` — DR-IG-1 needs typed coverage of the enum + filter.
- No `c_1_asset_uri_contract.rs` — Tranche 1.5 needs schema-property landing test.
- No GDS algorithm-runner contract — Tranche 09.5 will add it once the runner lands.
- `ontology_bridge_contract` is live-only (`-- --ignored`); needs an offline plan-shape unit test that asserts `OntologyImportPlan` carries the right cypher templates without requiring Neo4j.

### 5.10 Crate-level findings

**Workspace dependencies (`graph-services/Cargo.toml:13-24`):** `neo4rs 0.9.0-rc.9`, `reqwest 0.12`, `serde 1`, `serde_json 1`, `serde_yaml 0.9`, `sha2 0.10`, `uuid 1`. Clean. No unused.

**Dev-dependencies (`Cargo.toml:27-28`):** depends on `epi-s1-hen-compiler-core` for tests. Verify whether `hen-compiler-core` is the right crate (Hen is S1') — possibly stale dependency. **Audit item.**

The `epi-s2-graph-schema` crate has only `serde` — minimal, correct.

---

## §6. Boundary Contracts

### 6.1 What S2 produces (upward to M' / Theia / CLI)

- `:Bimba` node fact: identity = `coordinate`, ~117 typed properties.
- Typed relationship fact: ~25 canonical types + correspondential set, evidence-bearing properties.
- `OntologyImportPlan` (`ontology.rs:67-79`): cypher templates for n10s import/export + SHACL validation + GraphMeta fact recording.
- `GdsOverlayPayload` (`gds.rs:46-60`): typed projection state — blocked / projection-ready-algorithm-gated / projection-ready-algorithm-active.
- `PromotionPlan` (`sync_coordinator.rs:236-247`): typed plan with cypher generator + parameterized query.
- `KernelResonanceObservationPlan` (`graph_api.rs:192-200`): Vimarśa observation surface.
- `PointerWebRefreshPlan` (`graph_api.rs:209-215`): pointer-web projection.
- `DoctorReport` (`doctor.rs:163-176`): the readiness contract — all M' surfaces read this for gate-state.
- `GraphMeta` (`meta.rs:12-31`): managed-version snapshot — desired vs live vs drift.

### 6.2 What S2 consumes (from S0, S1, S3, S5)

- **From S0 (`portal-core`):** `MathemeHarmonicProfile`, kernel constants (M1_M0_CROSSLINK, RING_QUATERNION_LUT, M0_CORE_RELATIONS_COUNT=65), `VakAddress` (consumed by `PromotionPlan::attach_vak_address` at `sync_coordinator.rs:344-365`).
- **From S1 (vault):** YAML frontmatter, content hashes, wikilink graph (via `vault.rs:parse_yaml_frontmatter`).
- **From S3 (`gateway-contract`, `redis-context`):** `GraphitiAdapterContract`, `GRAPHITI_INVOCATION_OWNER`, `GRAPHITI_RUNTIME_AUTHORITY`, gateway method registry. S3' owns Graphiti runtime; S2 only carries the binding-property `s_3_graphiti_arc_id`.
- **From `epi-kernel-contract`:** kernel hash for `kernel_source_hash()` in `meta.rs:41`.
- **From `epi-s1-hen-compiler-core`** (dev-deps only): test fixtures for Hen lifecycle.

### 6.3 Privacy / disclosure boundary

`GraphPropertyDisclosure` (`graph-schema/src/lib.rs:407-411`): `Public` | `Internal` | `Protected`.
- `Public` properties may be returned to any consumer (M' Theia, MCP, CLI).
- `Internal` properties stay within service-layer contracts.
- `Protected` properties (e.g. `s_5_system_prompt`) flow only to S5 atelier authority.

`GDS_EXCLUDED_LABELS` enforces the projection privacy boundary — Graphiti episodes, Nara bodies, protected-local bodies, private projections do NOT enter the Option 1 GDS topology.

---

## §7. Theia Integration Points

`Body/M/epi-theia` is the M' shell authority. S2 integrates through the **kernel-bridge** which routes typed S2 method calls from Theia browser extensions to the Rust `GraphMethodService`.

### 7.1 Existing kernel-bridge methods

Per `Body/S/S3/gateway-contract/src/lib.rs:139-144`:
- `s2.graph.query` — browser extensions call this for read-mostly queries.
- `s2.graph.node` — single-node lookup.
- `s2.graph.traverse` — bounded traversal for M0' relation rendering.
- `s2.graph.pointer_web.compute` / `.refresh` — pointer-web projection for M-axis extensions.
- `s2.graph.kernel_resonance.record` — Vimarśa runtime write.

### 7.2 Theia extension consumers (per cycle-3 architecture docs)

- `Body/M/epi-theia/extensions/m0-anuttara/` — consumes `s2.graph.node` for inspector, will consume `s2.graph.traverse` for relation rendering, will consume new `s2.graph.gds.tangent_overlay` (Tranche 09.5) for the M0-3' synchronic/diachronic panel.
- M1 extensions (Paramaśiva, played-torus per DR-M1-2) — consume `s2.graph.pointer_web.compute` for the harmonic anchor data, plus kernel-data from portal-core directly.
- M2 extensions (Parashakti, Vimarśa) — consume `s2.graph.kernel_resonance.record` for observation writes, `s2.graph.node` for decan/maqam reads.
- M3 extensions (Mahamaya codon-graph) — consume `s2.graph.query` for codon-relation reads, will consume `s2.graph.gds.community` (proposed) for codon clustering.
- M4 extensions (Nara) — consume `s2.graph.node` with `c_1_relation_family = 'sync'` filter post-DR-IG-1.
- M5 extensions (atelier) — will consume new `s2.graph.promotion.dry_run` and `s2.graph.promotion.commit` (Tranche M5' pending) for governed-route writes.

### 7.3 Bridge methods needed (cycle-3 gaps)

| New method | Wraps | Tranche |
|---|---|---|
| `s2.graph.gds.tangent_overlay` | `GraphMethodService::gds_tangent_overlay` | 09.5 |
| `s2.graph.core65.audit` | new `core65_audit.rs` | 1.7 |
| `s2.graph.ontology.reload` | `ontology::import_epi_ontology_with_n10s` | M0' inspector |
| `s2.graph.seed.snapshot` | `seed::seed_baseline_snapshot_queries` | M0/M2/M5 inspector |
| `s2.graph.promotion.dry_run` | `PromotionPlan::node_upsert_cypher` (no execute) | M5' atelier |
| `s2.graph.promotion.commit` | `SyncCoordinator::commit_plan` (named per cycle-3) | M5' atelier |
| `s2.graph.relation_family.list` | new `RELATION_FAMILY_VALUES` const | 09.1 |

### 7.4 Theia conventions consumed (UI design foundations Tranche 15)

- **Coordinate-as-nav:** every node a Theia surface renders carries `coordinate` as the navigation key. S2 supplies the canonical form via `resolve_coordinate_string`.
- **Profile-tick-clock:** S2 does NOT own clock state but DOES record per-tick observations (kernel resonance, pointer-web refresh) with `c_5_kernel_tick`. Theia surfaces read these without re-deriving tick.
- **Provenance-visible:** every S2 property has `coordinate_home` + `source_family` (`graph-schema`); Theia inspectors render these as provenance badges. Render directly from the property spec; do NOT invent values (n10s/SHACL enforces this for Anuttara per DR-M0-2).
- **Bimba/Pratibimba-dial:** S2 supplies both the direct (`c_n_...`) and inverted (`c_n_i_...`) axes through the construction law. Theia surfaces toggle between via the dial without S2 round-tripping.
- **OmniPanel-as-membrane:** Pi runtime monitoring reads S2 readiness through `DoctorReport` and `GraphMeta`. The membrane never invokes graph writes directly — it reads, displays, and routes user mutation requests through the gateway.

---

## §8. Anti-Greenfield Audit

### 8.1 Landed (consume as-is)

- `:Bimba` label + `coordinate` property: landed (`graph-schema/src/lib.rs:8-9`).
- 25 canonical relationship types in `RELATIONSHIP_TYPE_SPECS`: landed.
- ~117 typed property declarations covering S1/S2 system properties + C/P/L/M/T/Q/S deep-bimba properties: landed.
- 7-family coordinate-prefix property law + agent rules: landed (lines 474-635).
- `Neo4jClient` + `SemanticCacheClient` (Redis-backed): landed (`lib.rs:163, 401`).
- `RelationshipWritePlan` + `RelationshipManager` with evidence-required validation: landed (`relationship_manager.rs`).
- `OntologyImportPlan` + n10s/OWL2RL/SHACL bridge + 102-line `epi.ttl`: landed (`ontology.rs`, `ontology/epi.ttl`).
- `GdsProjectionPlan` Option 1 + algorithm descriptors + blocked-payload contract: landed (`gds.rs`).
- `PromotionPlan` + `PromotionPolicyDecision` + property-proposal validation: landed (`sync_coordinator.rs`).
- `BidirectionalSyncer` + `LinkEnforcer` + `SemanticDocument`: landed.
- `GraphMeta` lifecycle + `desired_meta` / `applied_meta` / `manual_drift_fields`: landed (`meta.rs`).
- `DoctorReport` + `collect_report` 7-section readiness: landed (`doctor.rs`).
- `seed_coordinate_space` + `seed_baseline_snapshot_queries` + body-zone + decan seeds: landed (`seed.rs`).
- `DatasetImporter` + canonical/low-detail/deep plans (14 + 6 branches): landed (`dataset_import.rs`).
- `PointerWeb` + `KernelCoordinateAnchor` + `HarmonicPointerAnchor` 16-fold web: landed (`pointers.rs`).
- `GraphRAGRetriever` + `HybridRetriever` + `CoordinateRetrieval`: landed.
- 22 contract tests covering every primary surface: landed.

### 8.2 Pending closures (extend / audit only — NOT rebuilds)

- **DR-IG-1 c_1_relation_family enum** (Tranche 09.1): EXTEND `graph-schema` with `RELATION_FAMILY_VALUES` + property spec; EXTEND `dataset_import::sanitize_rel_type` to set family; EXTEND `RelationshipWritePlan::new` to accept family. Net new code: ~50 LOC. Refactor, not rebuild.
- **Kernel-core-65 audit** (Tranche 1.7): NEW module `graph-services/src/core65_audit.rs` (~120 LOC). Reads `Body/S/S0/epi-lib/include/m0.h:M0_CORE_RELATIONS_COUNT` (or kernel-contract version) + queries Neo4j for relation counts; reports mismatches. This IS a net-new named integration audit, NOT a substrate rebuild.
- **c_1_asset_uri / c_1_asset_kind** (Tranche 1.5): EXTEND `node_spec` declarations in the Anuttara block at `graph-schema/src/lib.rs:1408-1431`. Net new code: ~20 LOC.
- **GDS algorithm runner** (Tranche 09.5): EXTEND `gds.rs` with a `run_option1_algorithm(algorithm: GdsAlgorithm, top_k: usize)` executor that gates per `gds_procedure_count` + projection presence. ~100 LOC. Refactor of the existing blocked-state machine.
- **Promotion-plan governed-route gateway methods** (M5' atelier): NEW gateway methods + thin wrappers around existing `PromotionPlan` methods. ~80 LOC across the boundary. Refactor of the gateway surface.

### 8.3 Net new (genuine integration blockers)

None at the substrate level. S2 is the most-landed S-layer.

The only items that are truly "first-build" are M' product surfaces that consume S2 — those belong in the M' architecture docs (`Idea/Bimba/Seeds/M/M{0..5}'/M{n}-ARCHITECTURE.md`), not here.

---

## §9. Test Criteria

### 9.1 graph-schema crate

```bash
cargo test --offline --manifest-path Body/S/S2/graph-schema/Cargo.toml
```

Must verify: 12 existing tests plus (cycle 3 additions):
- `relation_family_enum_present` (DR-IG-1).
- `c_1_asset_uri_present` (Tranche 1.5).
- After Priority-1 split: same tests pass through re-exports.

### 9.2 graph-services crate — offline

```bash
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml
```

22 contract tests; all must pass on every PR.

### 9.3 graph-services crate — live Neo4j (CI nightly)

Per `RUNBOOK.md:147-159`:
```bash
docker compose -f docker-compose.epi-s2.yml up -d neo4j redis graphiti
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test dataset_import_live_contract -- --ignored
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml live_ontology_bridge_records_owl_and_shacl_facts_in_graph_meta -- --ignored
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml live_gds_overlay_reports_blocked_in_apoc_only_local_topology -- --ignored
```

### 9.4 Doctor / reconcile gate

```bash
cargo run --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml -- graph reconcile
cargo run --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml -- --json graph doctor
```

`graph.managedVersions.drift` MUST be empty for release. n10s, owl2Rl, gds, privacyProjection MUST be either `ready` (live procedures) or `blocked` (with named fallback) — never silently green.

### 9.5 Sub-coordinate acceptance

| Sub-coord | Acceptance command |
|---|---|
| S2-0 / S2-0' | `cargo test --offline -p epi-s2-graph-schema canonical_schema_is_bimba_3072 coordinate_identity_is_property_and_labels_are_descriptive` |
| S2-1 / S2-1' | `cargo test --offline -p epi-s2-graph-services relationship_manager_contract` + `cargo test -p epi-s2-graph-schema relationship_types_are_schema_registered legacy_positional_relationships_are_not_canonical_outputs` |
| S2-2 / S2-2' | `cargo test --offline -p epi-s2-graph-services ontology_bridge_contract` (offline plan-shape) + live `-- --ignored` for the n10s import |
| S2-3 / S2-3' | `cargo test --offline -p epi-s2-graph-services gds_overlay_contract` |
| S2-4 / S2-4' | `cargo test --offline -p epi-s2-graph-services promotion_policy_contract property_proposal_contract graph_promotion_contract frontmatter_property_rules_contract` |
| S2-5 / S2-5' | `cargo test --offline -p epi-s2-graph-services dataset_import_live_contract retrieval_fusion_contract retrieval_vak_bias semantic_cache_contract` |

---

## §10. Cross-Cutting Findings (cycle-3 ledger actions)

### 10.1 Tranches to enrich

- **Tranche 09.1 (DR-IG-1 c_1_relation_family enum):** ENRICH with concrete schema landing surface — add named constant `RELATION_FAMILY_VALUES` + property spec entry; specify `DatasetImporter::sanitize_rel_type` extension contract; specify `RelationshipWritePlan::new_with_family` constructor.
- **Tranche 09.5 (GDS-fed M0-3' synchronic/diachronic):** ENRICH with the gateway-method addition `s2.graph.gds.tangent_overlay` and the kernel-bridge contract for `GdsOverlayPayload` serialization.
- **Tranche 1.5 (image-assets-on-nodes):** ENRICH with the typed `node_spec` declarations and the OWL counterpart in `epi.ttl` (new `epi:hasAssetUri`, `epi:hasAssetKind` properties on `epi:AnuttaraNode`).
- **Tranche 1.7 (kernel-core-65 audit):** ENRICH with the new module name `core65_audit.rs`, the audit method signature, and the M0' inspector readinessFact row format.

### 10.2 New tranches needed

- **NEW Tranche S2.A — `graph-schema/src/lib.rs` Priority-1 split** (§5.1). Owner: S2 substrate cleanup. Verification: `cargo check -p epi-s2-graph-schema` + all 12 schema tests pass post-split.
- **NEW Tranche S2.B — `sync_coordinator.rs` Priority-1 split into `sync/` directory** (§5.2). Owner: S2 substrate cleanup. Verification: all promotion contract tests pass post-split.
- **NEW Tranche S2.C — `coordinate_home` typed enum** (§5.3). Owner: S2 schema discipline. Verification: schema crate compiles + all property specs round-trip through Display.
- **NEW Tranche S2.D — Gateway exposure of `gds_tangent_overlay`, `ontology_reload`, `seed_snapshot`, `core65_audit`, `promotion_dry_run`, `promotion_commit`, `relation_family_list`** (§4.4, §7.3). Owner: S3 gateway-contract update + S2 method-routing. Verification: contract additions land in `Body/S/S3/gateway-contract/src/lib.rs` + M' surfaces wire them up.
- **NEW Tranche S2.E — Audit `epi-s1-hen-compiler-core` dev-dependency** (§5.10). Owner: dependency hygiene. Verification: explicit decision recorded in `13-decision-register.md`.

### 10.3 New orphans surfaced

- The `c_1_relation_family` discriminator name appears in cypher (e.g. `graph_api.rs:323` writes `'kernel-resonance'` with a HYPHEN, not underscore) but DR-IG-1 specifies `kernel_core`. **Naming-axis orphan**: verify the canonical form before landing the enum, and audit existing graph data for the hyphenated form.

### 10.4 Profile-bus extensions

- Add `graph: GraphAnchorProjection` field to `MathemeHarmonicProfile` carrying pre-computed `(canonical_form, depth, prefix, parent, axis)` for the active coordinate so M' surfaces stop re-parsing. Tranche 10.x candidate.
- Add `gds_overlay_state: GdsOverlayState` enum field (`blocked` | `projection_ready` | `algorithm_active`) so Theia can render the cycle gate without a separate doctor call.

### 10.5 Kernel-bridge extensions

See §7.3 — seven new bridge methods identified.

---

*Document Version:* 1.0
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S2/`
*Related Specifications:* [[S2-SPEC]], [[S0-ARCHITECTURE]], [[S1-ARCHITECTURE]], [[S3-ARCHITECTURE]], [[M0'-ARCHITECTURE]] (most direct consumer), Wave-B 09 integrated-bimba reconciliation
