# Deep Bimba Property Map

**Status:** Draft for review before Cypher generation.

**Purpose:** Classify recurring deep dataset source keys into coordinate-family property regions so updates can be batched by semantic shape, not by one-off branch handling.

**Rule:** A source key's name is evidence, not authority. The target property is chosen by what the content does in the Bimba graph.

**M/M-prime rule:** M coordinates are the Bimba nodes themselves. M-derived properties describe the M-prime/Pratibimba expression surface of those nodes, not the bare M identity. The canonical serialized property form is `m_{n}_{i?}_{semantic}`: `n` is the M-root coordinate and optional `i` is the immediate sub-coordinate slot of the owning node. Example: a Parashakti name-matrix field on `M2-4-*` is `m_2_4_abjad_value`, not the loose global `m_2_abjad_value`.

**Q rule:** `q_n_{semantic}` is its own quintessential quick-view family. It is the graph-side detail surface for pithy node views baked into `src/qv_data.c` by `epi core knowing --bake` and updated through `epi core knowing <COORD> --update "pithy"`.

## Review States

| State | Meaning |
| --- | --- |
| `approved` | Safe to register and generate Cypher. |
| `review` | Plausible, needs human confirmation. |
| `split` | Source key likely contains multiple semantic functions. |
| `branch-local` | Keep inside an M branch unless a wider invariant is proven. |

## C Region: Universal Ontological Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `name` | `c_1_name` | string | all deep branches | approved | Human-readable node label. |
| `primaryDesignation` | `c_1_primary_designation` | string | all deep branches | review | More specific than name; keep distinct when present. |
| `description` | `c_1_description` | string | all deep branches | approved | Extended descriptive prose. |
| `coreNature` | `c_0_core_nature` | string | all deep branches | approved | Existing graph-schema key. |
| `operationalEssence` | `c_0_essence` or `c_3_operational_essence` | string | all deep branches | split | If it states essential nature, C0; if it states operation, C3. |
| `internalStructure` | `c_1_structure` | string | all deep branches | approved | Existing importer behavior. |
| `completeFormulation` | `c_1_complete_formulation` | string | M0, M1 | review | Form-level complete expression. |
| `formulationBreakdown` | `c_1_formulation_breakdown` | string/list | M0 | review | Structural decomposition of form. |
| `architecturalFunction` | `c_1_architectural_function` or `s_*` | string | all deep branches | split | C1 when it describes node role; S when it describes system layer/API. |
| `keyPrinciples` | `c_1_key_principles` | string list | all deep branches | approved | Already in schema-context. |
| `practicalApplications` | `c_3_practical_applications` | string list | all deep branches | approved | Existing schema-context slot. |
| `relatedCoordinates` | `c_3_related_coordinates` | string/list | all deep branches | review | May become relationships later; keep as property for import patch. |
| `lastUpdated` | `c_3_updated_at` | datetime/string | all deep branches | approved | Normalize with `updatedAt` / `updated_at`. |
| `updatedAt` | `c_3_updated_at` | datetime/string | all deep branches | approved | Normalize with `lastUpdated` / `updated_at`. |
| `updated_at` | `c_3_updated_at` | datetime/string | all deep branches | approved | Normalize with camelCase variants. |
| `contextFrame` | `c_3_context_frame` | string | all deep branches | approved | Context-frame runtime/process address. |
| `qlCategory` | `c_4_ql_category` | string | all deep branches | approved | Implicate/explicate/both classification. |
| `qlOperatorTypes` | `c_4_ql_operator_types` | string list | all deep branches | approved | Always list. |
| `accessLevel` | `c_4_access_level` | string | all deep branches | approved | Disclosure/access class. |
| `resonances` | `c_5_resonances` | string list | all deep branches | approved | Always list. |
| `bimbaCoordinate` | compatibility only | string | all deep branches | approved | Preserve only as legacy compatibility; do not prefer over `coordinate`. |
| `coordinate` | `coordinate` | string | all deep branches | approved | The only unprefixed graph property. |
| `notionPageId` | drop | n/a | all deep branches | approved | Not semantic. |
| `id` | drop | n/a | all deep branches | approved | Legacy integer/source artifact. |

## P Region: Positional Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `qlPosition` | `p_0_position_index` through `p_5_position_index` or computed `c_4_ql_position` | integer/string | all deep branches | split | If pure coordinate metadata, computed C4. If content explains a position, use P region. |
| `qlVariant` | `p_<n>_variant` | string | M0, M2 | review | Variant of QL position, not universal C type. |
| `qlPositionWeave` | `p_<n>_weave` | string | M0 | review | Positional weave semantics. |
| `positionId` | `p_<n>_position_id` | string | M5 | review | Epii stage/position identity. |
| `stageId` | `p_<n>_stage_id` | string | M5 | review | Stage may be P or T depending content. |
| `sequence` | `p_<n>_sequence` or `c_3_sequence` | integer/string | M3 | split | P when coordinate-position sequence; C3 when temporal/process order. |

## L Region: Lens And Epistemic Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `elementalNature` | `l_<n>_elemental_nature` | string | M0 | review | Lens/element reading rather than node ontology. |
| `seasonalPosition` | `l_<n>_seasonal_position` | string | M0 | review | Chronological/elemental lens. |
| `modality` | `l_<n>_modality` | string | M0 | review | Lens stance if epistemic; C4 if access/type. |
| `mefCondition` | `l_<n>_mef_condition` | string | M4 | review | Direct MEF/lens condition. |
| `interpretiveRole` | `l_<n>_interpretive_role` | string | M4 | review | Lens interpretation role. |
| `reflectionTable` | `l_<n>_reflection_table` | json/string | M4 | review | Lens reflection structure. |
| `therapeuticProperties` | `l_<n>_therapeutic_properties` or M2-prime field | string/list | M2 | split | Lens if diagnostic/phenomenal; M2-prime if name-matrix expression. |
| `temperamentBalance` | `l_<n>_temperament_balance` or M2-prime field | string | M2 | split | Same as above. |
| `healingSpecialty` | `l_<n>_healing_specialty` or M2-prime field | string | M2 | split | Same as above. |
| `chakraCorrespondence` | `l_<n>_chakra_correspondence` or M2-prime field | string | M2 | split | Lens if diagnostic body-map; M2-prime if matrix expression. |
| `breathPattern` | `l_<n>_breath_pattern` or M2-prime field | string | M2 | split | Lens/practice stance versus M2-prime name practice. |

## S Region: System And Runtime Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `subsystem` | `s_<n>_subsystem` or drop | string/integer | all branches | split | Drop legacy integer; keep semantic subsystem names if present. |
| `architecturalFunction` | `s_<n>_architectural_function` | string | system-facing branches | split | Use S when describing system stack responsibility. |
| `f_role` | `s_<n>_function_role` | string | M4, M5 | review | Function/API role. |
| `f_description` | `s_<n>_function_description` | string | M4 | review | Function/API description. |
| `f_inputContracts` | `s_<n>_input_contracts` | string/json | M4 | review | API/system contract. |
| `f_outputContracts` | `s_<n>_output_contracts` | string/json | M4 | review | API/system contract. |
| `f_queryableProperties` | `s_<n>_queryable_properties` | string/json | M4 | review | System query surface. |
| `f_translationSchema` | `s_<n>_translation_schema` | string/json | M4 | review | System translation surface. |
| `f_agent` | `s_<n>_agent` | string | M5 | review | Agent identity/property. |
| `f_tool_affinity` | `s_<n>_tool_affinity` | string/list | M5 | review | Tool-routing surface. |
| `f_system_prompt` | `s_<n>_system_prompt` | string | M5 | protected review | May be protected/internal. |
| `f_capabilities` | `s_<n>_capabilities` | string/list | M5 | review | Capability surface. |
| `safetyClass` | `s_<n>_safety_class` | string | M4 | review | Access/safety contract. |
| `eligibleFormats` | `s_<n>_eligible_formats` | string/list | M4 | review | Output/interface formats. |

## T Region: Thought And Reflective Process Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `developmentalStage` | `t_<n>_developmental_stage` or `c_3_developmental_stages` | string | M2, broader | split | T if thought/evolution stage; C3 if process stage. |
| `nextEvolutionPhase` | `t_5_next_evolution_phase` | string | M5 | review | Reflective next-stage content. |
| `epistemicFunction` | `t_<n>_epistemic_function` | string | M1 | review | Thought/knowledge function. |
| `practicalApplications` | `c_3_practical_applications` or `t_<n>_practice_applications` | list | all branches | split | Usually C3; T only if describing thought practice mode. |
| `processRealization` | `t_<n>_process_realization` or M1-prime field | string | M1 | split | T if epistemic realization; M1-prime if QL topology expression. |

## Q Region: Quintessential Quick-View Properties

| Source key | Proposed target | Type | Batch scope | State | Notes |
| --- | --- | --- | --- | --- | --- |
| `q_theoreticalThesis` | `q_1_theoretical_thesis` | string | M5 / cross-node quick-view | review | Compact thesis surface for quick node orientation. |
| `q_sophiaLogosDialectic` | `q_2_sophia_logos_dialectic` | string | M5 / cross-node quick-view | review | Dialectic as quintessential movement, not M5 branch-local prose. |
| `q_integrationTemplate` | `q_5_integration_template` | string | M5 / cross-node quick-view | review | Integration-facing quick-view template. |
| `q_instantiationMode` | `q_2_instantiation_mode` | string | M5 / cross-node quick-view | review | How the quintessential insight instantiates operationally. |
| `q_historicalDiagnosis` | `q_4_historical_diagnosis` | string | M5 / cross-node quick-view | review | Context/horizon quick diagnosis. |
| `q_dialecticalMovement` | `q_3_dialectical_movement` | string | M5 / cross-node quick-view | review | Pattern/process quick movement. |
| `q_conjunctiveThreshold` | `q_5_conjunctive_threshold` | string | M5 / cross-node quick-view | review | Threshold/return quick-view field. |

## M-Prime Region: Branch-Local Expressive Properties

These keys are serialized as `m_{n}_{i?}_{semantic}` because the graph property grammar does not encode apostrophes. Conceptually they are M-prime properties: reflected, operational, dataset-exposed expressions of an M coordinate. The M coordinate itself remains the node's `coordinate`; the property prefix is derived from that node's M root and immediate sub-coordinate slot.

### M0' Anuttara Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `consciousnessOperation` | `m_0_consciousness_operation` | string | branch-local | M0' void/consciousness operation. |
| `consciousnessFunction` | `m_0_consciousness_function` | string | branch-local | M0' function field. |
| `grammaticalFunction` | `m_0_grammatical_function` | string | branch-local | Para-vak/grammar specific. |
| `spandaRelationship` | `m_0_spanda_relationship` | string | branch-local | M0' Spanda relation. |
| `metaphysicalNames` | `m_0_metaphysical_names` | string/list | branch-local | Name set. |
| `adamEveClassification` | `m_0_adam_eve_classification` | string | branch-local | M0' symbolic classification. |

### M1' Paramasiva Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `topologicalSignificance` | `m_1_topological_significance` | string | branch-local | QL topology. |
| `topologicalFormula` | `m_1_topological_formula` | string | branch-local | Formula content. |
| `processualTopologyRole` | `m_1_processual_topology_role` | string | branch-local | Paramasiva process topology. |
| `matrixType` | `m_1_matrix_type` | string | branch-local | Matrix taxonomy. |
| `constructionPhase` | `m_1_construction_phase` | string | branch-local | QL construction stage. |
| `algebraicCorrespondence` | `m_1_algebraic_correspondence` | string | branch-local | Algebraic mapping. |

### M2' Parashakti Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `abjadValue` | `m_2_abjad_value` | integer/string | branch-local | Name matrix value. |
| `arabicText` | `m_2_arabic_text` | string | branch-local | Divine-name text. |
| `trilateralRoot` | `m_2_trilateral_root` | string | branch-local | Root morphology. |
| `dhikrApplication` | `m_2_dhikr_application` | string | branch-local | Practice use. |
| `recitationCount` | `m_2_recitation_count` | integer/string | branch-local | Practice count. |
| `zodiacalInfluence` | `m_2_zodiacal_influence` | string | branch-local | Astro-vibrational content. |
| `therapeuticCluster` | `m_2_therapeutic_cluster` | string | branch-local | Cluster grouping. |
| `digitalRoot` | `m_2_digital_root` | integer/string | branch-local | Numeric property. |
| `matrixConstant` | `m_2_matrix_constant` | integer/string | branch-local | Matrix property. |
| `magicSquareSum` | `m_2_magic_square_sum` | integer/string | branch-local | Matrix property. |

### M3' Mahamaya Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `degree` | `m_3_degree` | integer/string | branch-local | 360-degree field. |
| `quadrant` | `m_3_quadrant` | string/integer | branch-local | Quadrant field. |
| `rotationalPhase` | `m_3_rotational_phase` | string | branch-local | Rotational state. |
| `yinYangBalance` | `m_3_yin_yang_balance` | string | branch-local | Symbolic polarity. |
| `elementalAffinity` | `m_3_elemental_affinity` | string | branch-local | Symbolic transcription element. |
| `aminoAcidCode` | `m_3_amino_acid_code` | string | branch-local | Codon/protein mapping. |
| `positive_codon_binary` | `m_3_positive_codon_binary` | string | branch-local | Codon binary. |
| `negative_codon_binary` | `m_3_negative_codon_binary` | string | branch-local | Codon binary. |
| `upper_Pair_binary` | `m_3_upper_pair_binary` | string | branch-local | Pair binary. |
| `lower_Pair_binary` | `m_3_lower_pair_binary` | string | branch-local | Pair binary. |
| `tarotCard` | `m_3_tarot_card` | string | branch-local | Symbolic transcription. |
| `hebrewLetter` | `m_3_hebrew_letter` | string | branch-local | Symbolic transcription. |

### M4' Nara Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `twoStrokeDoctrine` | `m_4_two_stroke_doctrine` | string | branch-local | Existing schema-context concept. |
| `temporalStructure` | `m_4_temporal_structure` | string | branch-local | Nara temporal layer. |
| `temporalIntelligenceLayer` | `m_4_temporal_intelligence_layer` | string | branch-local | Temporal intelligence. |
| `kashmirShaivismAlignment` | `m_4_kashmir_shaivism_alignment` | string | branch-local | Nara alignment content. |
| `practicalManifestations` | `m_4_practical_manifestations` | string/list | branch-local | Nara manifestation content. |
| `capabilitySignals` | `m_4_capability_signals` | string/list | branch-local | Nara capability hints. |
| `preferredTiming` | `m_4_preferred_timing` | string | branch-local | Nara interface timing. |

### M5' Epii Expression

| Source key | Proposed target | Type | State | Notes |
| --- | --- | --- | --- | --- |
| `lacanianPublicInterface` | `m_5_lacanian_interface` | string | branch-local | Existing schema-context concept. |
| `whiteheadLacanSynthesis` | `m_5_whitehead_lacanian` | string | branch-local | Existing schema-context concept. |
| `lacanianEtymologicalArchaeology` | `m_5_archaeology_method` | string | branch-local | Existing schema-context concept. |

## Immediate Next Step

Before generating Cypher, promote reviewed non-C keys into the S2 graph-schema registry with tests. The current registry is intentionally narrow; executing `p_*`, `l_*`, `s_*`, `t_*`, `q_*`, or M-prime properties before registration would create schema drift.
