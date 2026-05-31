use serde::Serialize;

pub const SCHEMA_VERSION: &str = "2026-05-17-s2-bimba-coord-driven-3072";
pub const GRAPH_ID: &str = "primary";
pub const EMBEDDING_VERSION: &str = "q-semantic-v2-3072";
pub const Q_SCHEMA_VERSION: &str = "q-prefix-v2";

pub const BIMBA_LABEL: &str = "Bimba";
pub const COORDINATE_PROPERTY: &str = "coordinate";
pub const COORDINATE_PREFIX_PROPERTY: &str = "coordinate_prefix";
pub const COORDINATE_DEPTH_PROPERTY: &str = "coordinate_depth";
pub const COORDINATE_PARENT_PROPERTY: &str = "coordinate_parent";
pub const COORDINATE_AXIS_PROPERTY: &str = "coordinate_axis";
pub const CANONICAL_VAULT_PATH_PROPERTY: &str = "vault_path";
pub const ARTIFACT_KIND_PROPERTY: &str = "artifact_kind";
pub const CONTENT_HASH_PROPERTY: &str = "content_hash";
pub const TITLE_PROPERTY: &str = "title";
pub const SUMMARY_PROPERTY: &str = "summary";
pub const SOURCE_MTIME_PROPERTY: &str = "source_mtime";
pub const SYNC_STATUS_PROPERTY: &str = "sync_status";
pub const SYNC_VERSION_PROPERTY: &str = "sync_version";
pub const LAST_PROMOTED_AT_PROPERTY: &str = "last_promoted_at";
pub const PROMOTION_SOURCE_PROPERTY: &str = "promotion_source";
pub const RELATION_EVIDENCE_COUNT_PROPERTY: &str = "relation_evidence_count";

pub const UUID_PROPERTY: &str = "c_2_uuid";
pub const NAME_PROPERTY: &str = "c_1_name";
pub const DESCRIPTION_PROPERTY: &str = "c_1_description";
pub const FAMILY_PROPERTY: &str = "c_4_family";
pub const QL_POSITION_PROPERTY: &str = "c_4_ql_position";
pub const LAYER_PROPERTY: &str = "c_4_layer";
pub const TOPO_MODE_PROPERTY: &str = "c_4_topo_mode";
pub const WEAVE_STATE_PROPERTY: &str = "c_4_weave_state";
pub const INVERSION_STATE_PROPERTY: &str = "c_4_inversion_state";
pub const FLAGS_PROPERTY: &str = "c_4_flags";
pub const VAULT_PATH_PROPERTY: &str = "s_1_vault_path";
pub const SEMANTIC_EMBEDDING_PROPERTY: &str = "c_5_embedding";
pub const ESSENCE_PROPERTY: &str = "c_0_essence";
pub const CORE_NATURE_PROPERTY: &str = "c_0_core_nature";
pub const FORM_PROPERTY: &str = "c_1_form";
pub const STRUCTURE_PROPERTY: &str = "c_1_structure";
pub const SOURCE_DATASET_PROPERTY: &str = "c_3_source_dataset";
pub const DATASET_BRANCH_PROPERTY: &str = "c_3_dataset_branch";
pub const DATASET_BRANCH_LABEL_PROPERTY: &str = "c_3_dataset_branch_label";
pub const KERNEL_RESONANCE_LABEL: &str = "KernelResonanceObservation";
pub const KERNEL_RESONANCE_RELATION: &str = "HAS_KERNEL_RESONANCE";
pub const KERNEL_RESONANCE_INDEX_PROPERTY: &str = "c_5_kernel_resonance_index";
pub const KERNEL_RESONANCE_SCORE_PROPERTY: &str = "c_5_kernel_resonance_score";
pub const KERNEL_RESONANCE_SQUARE_PROPERTY: &str = "c_5_kernel_resonance_square";
pub const KERNEL_RESONANCE_LENS_PROPERTY: &str = "c_5_kernel_resonance_lens";
pub const KERNEL_RESONANCE_POSITION_PROPERTY: &str = "c_5_kernel_resonance_position";
pub const KERNEL_RESONANCE_HELIX_PROPERTY: &str = "c_5_kernel_resonance_helix";
pub const KERNEL_TICK_PROPERTY: &str = "c_5_kernel_tick";
pub const POINTER_WEB_JSON_PROPERTY: &str = "c_5_pointer_web_json";
pub const POINTER_COUNT_PROPERTY: &str = "c_5_pointer_count";
pub const POINTER_FAMILY_REFS_PROPERTY: &str = "c_5_pointer_family_refs";
pub const POINTER_REFLECTIVE_REFS_PROPERTY: &str = "c_5_pointer_reflective_refs";
pub const POINTER_INVERSION_REFS_PROPERTY: &str = "c_5_pointer_inversion_refs";
pub const POINTER_POSITION_REFS_PROPERTY: &str = "c_5_pointer_position_refs";
pub const POINTER_LENS_REFS_PROPERTY: &str = "c_5_pointer_lens_refs";
pub const POINTER_LENS_INVERSION_REFS_PROPERTY: &str = "c_5_pointer_lens_inversion_refs";
pub const POINTER_HARMONIC_ANCHOR_JSON_PROPERTY: &str = "c_5_harmonic_pointer_anchor_json";
pub const POINTER_REFRESHED_AT_PROPERTY: &str = "c_3_pointer_refreshed_at";
pub const SESSION_KEY_PROPERTY: &str = "s_3_session_key";
pub const GRAPHITI_ARC_ID_PROPERTY: &str = "s_3_graphiti_arc_id";
pub const S_REPO_PATH_PROPERTY: &str = "s_0_repo_path";
pub const S_REPO_ROOT_PROPERTY: &str = "s_0_repo_root";
pub const S_FILE_KIND_PROPERTY: &str = "s_0_file_kind";
pub const S_COMPONENT_PROPERTY: &str = "s_0_component";
pub const S_SYMBOL_REFS_PROPERTY: &str = "s_0_symbol_refs";
pub const S_EXECUTION_FLOW_REFS_PROPERTY: &str = "s_0_execution_flow_refs";
pub const S_DEPENDS_ON_PATHS_PROPERTY: &str = "s_0_depends_on_paths";
pub const S_OWNED_BY_COORDINATE_PROPERTY: &str = "s_0_owned_by_coordinate";
pub const M_REPO_PATH_PROPERTY: &str = "m_0_repo_path";
pub const M_COMPONENT_PROPERTY: &str = "m_0_component";
pub const M_SYMBOL_REFS_PROPERTY: &str = "m_0_symbol_refs";

pub const REL_EVIDENCE_KIND_PROPERTY: &str = "evidence_kind";
pub const REL_EVIDENCE_TEXT_PROPERTY: &str = "evidence_text";
pub const REL_SOURCE_PATH_PROPERTY: &str = "source_path";
pub const REL_SOURCE_LINE_PROPERTY: &str = "source_line";
pub const REL_TARGET_TEXT_PROPERTY: &str = "target_text";
pub const REL_CONFIDENCE_PROPERTY: &str = "confidence";
pub const REL_INFERRED_BY_PROPERTY: &str = "inferred_by";
pub const REL_PROMPT_HASH_PROPERTY: &str = "prompt_hash";
pub const REL_CREATED_BY_SYNC_VERSION_PROPERTY: &str = "created_by_sync_version";
pub const REL_LAST_VERIFIED_AT_PROPERTY: &str = "last_verified_at";

pub const REQUIRED_RELATIONSHIP_EVIDENCE_PROPERTIES: &[&str] =
    &[REL_EVIDENCE_KIND_PROPERTY, REL_EVIDENCE_TEXT_PROPERTY];

pub const SEMANTIC_EMBEDDING_DIMENSIONS: usize = 3072;
pub const SEMANTIC_EMBEDDING_INDEX: &str = "coord_embedding";

pub const COMPAT_LABELS: &[&str] = &[
    "Coordinate",
    "VaultArtifact",
    "MarkdownArtifact",
    "BimbaNode",
    "BimbaCoordinate",
];
pub const COMPAT_COORDINATE_PROPERTIES: &[&str] = &[];
pub const COMPAT_NODE_PROPERTIES: &[&str] = &[
    "name",
    "description",
    "family",
    "ql_position",
    "layer",
    "topo_mode",
    "vault_path",
    "essence",
    "core_nature",
    "formulation",
    "structure",
    "weave_state",
    "inversion_state",
    "flags",
    "uuid",
    "semantic_embedding",
    "source_dataset",
    "dataset_branch",
    "dataset_branch_label",
];
pub const COMPAT_EMBEDDING_DIMENSIONS: &[usize] = &[768, 1536];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GraphLabelSpec {
    pub label: &'static str,
    pub coordinate_home: &'static str,
    pub source_family: &'static str,
    pub compatibility: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GraphRelationshipTypeSpec {
    pub rel_type: &'static str,
    pub coordinate_home: &'static str,
    pub source_family: &'static str,
    pub compatibility: bool,
}

pub const LABEL_SPECS: &[GraphLabelSpec] = &[
    GraphLabelSpec {
        label: "Coordinate",
        coordinate_home: "S2.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "VaultArtifact",
        coordinate_home: "S1.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "MarkdownArtifact",
        coordinate_home: "S1.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "ThoughtArtifact",
        coordinate_home: "T",
        source_family: "thought",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "DailyNote",
        coordinate_home: "S1.4",
        source_family: "vault",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "NowSession",
        coordinate_home: "S1.4'",
        source_family: "vault",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "Psychoid",
        coordinate_home: "M",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "ContextFrame",
        coordinate_home: "CF",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "VakCoordinate",
        coordinate_home: "VAK",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "KernelResonanceObservation",
        coordinate_home: "S2.5",
        source_family: "graph-services",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "Bimba",
        coordinate_home: "C0",
        source_family: "namespace",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "Stack",
        coordinate_home: "S",
        source_family: "system",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "BimbaNode",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "BimbaCoordinate",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
];

pub const RELATIONSHIP_TYPE_SPECS: &[GraphRelationshipTypeSpec] = &[
    GraphRelationshipTypeSpec {
        rel_type: "REFERENCES",
        coordinate_home: "S1.2",
        source_family: "wikilink",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SOURCES",
        coordinate_home: "S1.0",
        source_family: "frontmatter",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTAINS",
        coordinate_home: "C0",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PART_OF",
        coordinate_home: "C0",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ELABORATES",
        coordinate_home: "T5",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTRASTS",
        coordinate_home: "L2",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "IMPLEMENTS",
        coordinate_home: "S4",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "OPERATES_IN",
        coordinate_home: "S",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "REFLECTS_AS",
        coordinate_home: "C5",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_TO",
        coordinate_home: "#",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SUPPORTS",
        coordinate_home: "P2",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CRITIQUES",
        coordinate_home: "L4",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "DERIVES_FROM",
        coordinate_home: "C1",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PROMOTES_TO",
        coordinate_home: "S1/S2",
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SYNCED_FROM",
        coordinate_home: "S2",
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS0_LINKS_TO",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS5_INTEGRATES_INTO",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "GENERATES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ENTANGLES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INTERLEAVES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MANIFESTS",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "BEDROCK",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "FAMILY_CONTAINS",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MOBIUS_RETURN",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ANCHORED_TO",
        coordinate_home: "CF",
        source_family: "seed-topology",
        compatibility: false,
    },
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GraphPropertyOwner {
    Node,
    Relationship,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GraphPropertyType {
    String,
    StringList,
    Integer,
    Float,
    Boolean,
    DateTime,
    JsonString,
    Embedding,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GraphPropertyCardinality {
    One,
    Many,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GraphPropertyDisclosure {
    Public,
    Internal,
    Protected,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GraphPropertySpec {
    pub key: &'static str,
    pub coordinate_home: &'static str,
    pub owner: GraphPropertyOwner,
    pub value_type: GraphPropertyType,
    pub cardinality: GraphPropertyCardinality,
    pub disclosure: GraphPropertyDisclosure,
    pub source_family: &'static str,
    pub indexed: bool,
    pub compatibility: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CoordinatePrefixFamilySpec {
    pub prefix: &'static str,
    pub coordinate_home: &'static str,
    pub source_family: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinateSemanticFamilySpec {
    pub prefix: &'static str,
    pub coordinate_home: &'static str,
    pub family_name: &'static str,
    pub semantic_domain: &'static str,
    pub direct_axis: &'static str,
    pub inverted_axis: &'static str,
    pub property_guidance: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinatePositionSemanticSpec {
    pub position: u8,
    pub c_role: &'static str,
    pub p_question: &'static str,
    pub p_semantic_dual: &'static str,
    pub property_guidance: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinatePropertyConstructionLaw {
    pub identity_property: &'static str,
    pub direct_key_pattern: &'static str,
    pub inverted_key_pattern: &'static str,
    pub inversion_marker: &'static str,
    pub direct_example: &'static str,
    pub inverted_example: &'static str,
    pub position_range: &'static str,
    pub semantic_suffix_grammar: &'static str,
    pub agent_rules: &'static [&'static str],
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinateSemanticRegistry {
    pub families: &'static [CoordinateSemanticFamilySpec],
    pub positions: &'static [CoordinatePositionSemanticSpec],
    pub property_law: CoordinatePropertyConstructionLaw,
    pub authority_paths: &'static [&'static str],
}

pub const COORDINATE_PREFIX_FAMILY_SPECS: &[CoordinatePrefixFamilySpec] = &[
    CoordinatePrefixFamilySpec {
        prefix: "c",
        coordinate_home: "C",
        source_family: "coordinate",
    },
    CoordinatePrefixFamilySpec {
        prefix: "p",
        coordinate_home: "P",
        source_family: "position",
    },
    CoordinatePrefixFamilySpec {
        prefix: "l",
        coordinate_home: "L",
        source_family: "lens",
    },
    CoordinatePrefixFamilySpec {
        prefix: "s",
        coordinate_home: "S",
        source_family: "system",
    },
    CoordinatePrefixFamilySpec {
        prefix: "t",
        coordinate_home: "T",
        source_family: "thought",
    },
    CoordinatePrefixFamilySpec {
        prefix: "m",
        coordinate_home: "M",
        source_family: "psychoid",
    },
    CoordinatePrefixFamilySpec {
        prefix: "q",
        coordinate_home: "Q",
        source_family: "quickview",
    },
];

pub const COORDINATE_PREFIX_FAMILIES: &[&str] = &["c", "p", "l", "s", "t", "m", "q"];

pub const COORDINATE_SEMANTIC_FAMILY_SPECS: &[CoordinateSemanticFamilySpec] = &[
    CoordinateSemanticFamilySpec {
        prefix: "c",
        coordinate_home: "C",
        family_name: "Category / C-family",
        semantic_domain: "Ontological identity, source, form, operation, process, context, and integration.",
        direct_axis: "C0-C5 describe the direct categorical unfolding of a thing.",
        inverted_axis: "C0'-C5' carry the reflective VAK ladder: CPF, CT, CFP, CF, CP, CS.",
        property_guidance: "Use c_* for artifact being, identity, source, definition, provenance, structural role, and cross-family grounding. C is the default when the property is about what the artifact is.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "p",
        coordinate_home: "P",
        family_name: "Position / P-family",
        semantic_domain: "Sixfold positional movement: why, what, how, who/which, where/when, why-for.",
        direct_axis: "P0-P5 are the explicate/day positional arc.",
        inverted_axis: "P0'-P5' are the implicate/night positional arc.",
        property_guidance: "Use p_* when the property names the artifact's positional movement, question-form, complement, phase, or day/night placement.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "l",
        coordinate_home: "L",
        family_name: "Lens / L-family",
        semantic_domain: "Interpretive lenses and philosophical modalities.",
        direct_axis: "L0-L5 are direct lens families from quaternal ground through para vak.",
        inverted_axis: "L0'-L5' are inverted/complementary lens operations.",
        property_guidance: "Use l_* when the property is truly lens-specific: causal, logical, processual, phenomenological, vak, elemental, or interpretive modality.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "s",
        coordinate_home: "S",
        family_name: "System / S-family",
        semantic_domain: "Technical-procedural system layers, boundaries, runtime contracts, and implementation responsibilities.",
        direct_axis: "S0-S5 are direct stack layers from executable adapter through agent/runtime integration.",
        inverted_axis: "S0'-S5' are reflective/runtime inversions of those layers.",
        property_guidance: "Use s_* for technical stack properties: repo paths, protocol roles, runtime boundaries, CRUD ownership, gateway surfaces, sync contracts, and implementation provenance.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "t",
        coordinate_home: "T",
        family_name: "Thought / T-family",
        semantic_domain: "Universal thought planes and localized thought crystallizations.",
        direct_axis: "T0-T5 are universal thought planes.",
        inverted_axis: "T0'-T5' are localized instantiated thoughts and session traces.",
        property_guidance: "Use t_* for thought-plane classification, insight/tracing/challenge/pattern/discovery roles, and Thought/T' archive semantics.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "m",
        coordinate_home: "M",
        family_name: "Psychoid / M-family",
        semantic_domain: "Bimba psychoid/subsystem coordinates and M' reflective application surfaces.",
        direct_axis: "M0-M5 are direct psychoid or subsystem coordinates.",
        inverted_axis: "M0'-M5' are reflective/application inversions of those psychoid coordinates.",
        property_guidance: "Use m_* for psychoid/domain-specific facts, M/M' subsystem semantics, Nara/Mahamaya/etc. details, and M' implementation/application properties.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "q",
        coordinate_home: "Q",
        family_name: "Quintessential / Q-family",
        semantic_domain: "Quintessential templates, reusable forms, and world-file synthesis properties.",
        direct_axis: "Q0-Q5 describe direct template/quintessence articulation.",
        inverted_axis: "Q0'-Q5' describe reflective or instantiated template inversions.",
        property_guidance: "Use q_* for Bimba World templates and reusable quintessential form properties rather than ordinary artifact identity.",
    },
];

pub const COORDINATE_POSITION_SEMANTICS: &[CoordinatePositionSemanticSpec] = &[
    CoordinatePositionSemanticSpec {
        position: 0,
        c_role: "Ground / source / origin",
        p_question: "Why?",
        p_semantic_dual: "Ground / source",
        property_guidance: "Use *_0_* for source, ground, provenance, essence, origin references, and source-coordinate links.",
    },
    CoordinatePositionSemanticSpec {
        position: 1,
        c_role: "Form / definition",
        p_question: "What?",
        p_semantic_dual: "Material / definition",
        property_guidance: "Use *_1_* for names, definitions, forms, descriptions, type names, and explicit formal identity.",
    },
    CoordinatePositionSemanticSpec {
        position: 2,
        c_role: "Entity / operation",
        p_question: "How?",
        p_semantic_dual: "Dynamis / operation",
        property_guidance: "Use *_2_* for operational identity, UUIDs, methods, active mechanisms, and procedural handles.",
    },
    CoordinatePositionSemanticSpec {
        position: 3,
        c_role: "Process / canvas",
        p_question: "Who/Which?",
        p_semantic_dual: "Pattern / identity",
        property_guidance: "Use *_3_* for process markers, update times, pattern/canvas references, and execution-flow evidence.",
    },
    CoordinatePositionSemanticSpec {
        position: 4,
        c_role: "Type / context",
        p_question: "Where/When?",
        p_semantic_dual: "Context / horizon",
        property_guidance: "Use *_4_* for contextual role, layer, family, QL position, boundary, invocation kind, and operational horizon.",
    },
    CoordinatePositionSemanticSpec {
        position: 5,
        c_role: "Integration / reflection",
        p_question: "Why-for?",
        p_semantic_dual: "Synthesis / integration",
        property_guidance: "Use *_5_* for integration, embeddings, reflection state, verification, resonance, and synthesis properties.",
    },
];

pub const COORDINATE_PROPERTY_AGENT_RULES: &[&str] = &[
    "coordinate is the canonical identity property and is never replaced by bimbaCoordinate.",
    "Graph labels describe node kind or role; coordinate remains a property.",
    "Construct queryable properties as {family}_{position}_{semantic_suffix}.",
    "For prime/inverted coordinates, insert i after the position: {family}_{position}_i_{semantic_suffix}.",
    "Never spell inversion as prime, inverted, or inversion inside property keys.",
    "semantic_suffix must be lower_snake_case ASCII using lowercase letters, digits, and underscores.",
    "C-family is the ontological default for artifact identity; use non-C families only for genuinely domain-specific facts.",
    "leading families are hints from the artifact class, not restrictions on valid agent reasoning.",
    "Every proposed property must be evidence-backed and schema-validated before Neo4j mutation.",
];

pub const COORDINATE_SEMANTIC_AUTHORITY_PATHS: &[&str] = &[
    "repo-ontology.md",
    "docs/resources/updated-ql-mef/epi_logos_cheat_sheet.md",
    "Idea/Bimba/World/Types/Coordinates",
    "Body/S/S2/graph-schema/src/lib.rs",
];

pub const COORDINATE_PROPERTY_CONSTRUCTION_LAW: CoordinatePropertyConstructionLaw =
    CoordinatePropertyConstructionLaw {
        identity_property: COORDINATE_PROPERTY,
        direct_key_pattern: "{family}_{position}_{semantic_suffix}",
        inverted_key_pattern: "{family}_{position}_i_{semantic_suffix}",
        inversion_marker: "i",
        direct_example: "s_4_runtime_boundary",
        inverted_example: "m_2_i_colour",
        position_range: "0..=5",
        semantic_suffix_grammar:
            "lower_snake_case ASCII: [a-z0-9]+ segments separated by underscores",
        agent_rules: COORDINATE_PROPERTY_AGENT_RULES,
    };

const fn node_spec(
    key: &'static str,
    coordinate_home: &'static str,
    value_type: GraphPropertyType,
    cardinality: GraphPropertyCardinality,
    disclosure: GraphPropertyDisclosure,
    source_family: &'static str,
) -> GraphPropertySpec {
    GraphPropertySpec {
        key,
        coordinate_home,
        owner: GraphPropertyOwner::Node,
        value_type,
        cardinality,
        disclosure,
        source_family,
        indexed: false,
        compatibility: false,
    }
}

const fn indexed_node_spec(
    key: &'static str,
    coordinate_home: &'static str,
    value_type: GraphPropertyType,
    cardinality: GraphPropertyCardinality,
    disclosure: GraphPropertyDisclosure,
    source_family: &'static str,
) -> GraphPropertySpec {
    GraphPropertySpec {
        key,
        coordinate_home,
        owner: GraphPropertyOwner::Node,
        value_type,
        cardinality,
        disclosure,
        source_family,
        indexed: true,
        compatibility: false,
    }
}

const fn relationship_property_spec_const(
    key: &'static str,
    coordinate_home: &'static str,
    value_type: GraphPropertyType,
    cardinality: GraphPropertyCardinality,
    disclosure: GraphPropertyDisclosure,
    source_family: &'static str,
) -> GraphPropertySpec {
    GraphPropertySpec {
        key,
        coordinate_home,
        owner: GraphPropertyOwner::Relationship,
        value_type,
        cardinality,
        disclosure,
        source_family,
        indexed: false,
        compatibility: false,
    }
}

pub const NODE_PROPERTY_SPECS: &[GraphPropertySpec] = &[
    GraphPropertySpec {
        key: COORDINATE_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: COORDINATE_PREFIX_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: COORDINATE_DEPTH_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: COORDINATE_PARENT_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: COORDINATE_AXIS_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: CANONICAL_VAULT_PATH_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: ARTIFACT_KIND_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: CONTENT_HASH_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: TITLE_PROPERTY,
        coordinate_home: "S1.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SUMMARY_PROPERTY,
        coordinate_home: "S1.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SOURCE_MTIME_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::DateTime,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SYNC_STATUS_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SYNC_VERSION_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: LAST_PROMOTED_AT_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::DateTime,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: PROMOTION_SOURCE_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: RELATION_EVIDENCE_COUNT_PROPERTY,
        coordinate_home: "S1.2",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "wikilink",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: UUID_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "system",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: NAME_PROPERTY,
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: DESCRIPTION_PROPERTY,
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: FORM_PROPERTY,
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "dataset",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: STRUCTURE_PROPERTY,
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "dataset",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: FAMILY_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: QL_POSITION_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: LAYER_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: TOPO_MODE_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: WEAVE_STATE_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Float,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "coordinate",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: INVERSION_STATE_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "coordinate",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: FLAGS_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "coordinate",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: VAULT_PATH_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: ESSENCE_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "dataset",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: CORE_NATURE_PROPERTY,
        coordinate_home: "S2.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "dataset",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SOURCE_DATASET_PROPERTY,
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "provenance",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: DATASET_BRANCH_PROPERTY,
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "provenance",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: DATASET_BRANCH_LABEL_PROPERTY,
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "provenance",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_0_source_coordinates",
        coordinate_home: "S1.0'",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_1_ct_type",
        coordinate_home: "S1.1'",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_4_artifact_role",
        coordinate_home: "S1.4'",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "frontmatter",
        indexed: true,
        compatibility: false,
    },
    node_spec(
        "l_2_therapeutic_properties",
        "L2'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_2_temperament_balance",
        "L2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_2_healing_specialty",
        "L2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_2_chakra_correspondence",
        "L2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_2_breath_pattern",
        "L2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_4_mef_condition",
        "L4",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_4_interpretive_role",
        "L4",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "s_4_function_role",
        "S4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_input_contracts",
        "S4'",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_output_contracts",
        "S4'",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_queryable_properties",
        "S4'",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_5_agent",
        "S5'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_5_tool_affinity",
        "S5'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "t_5_next_evolution_phase",
        "T5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-thought",
    ),
    node_spec(
        "t_1_epistemic_function",
        "T1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-thought",
    ),
    node_spec(
        "q_1_theoretical_thesis",
        "Q1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_2_sophia_logos_dialectic",
        "Q2",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_2_instantiation_mode",
        "Q2",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_3_dialectical_movement",
        "Q3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_4_historical_diagnosis",
        "Q4",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_5_integration_template",
        "Q5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "q_5_conjunctive_threshold",
        "Q5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-quickview",
    ),
    node_spec(
        "m_1_topological_significance",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_abjad_value",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_degree",
        "M3'",
        GraphPropertyType::Integer,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_two_stroke_doctrine",
        "M4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_5_lacanian_interface",
        "M5'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "c_1_primary_designation",
        "C1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "c_1_symbol",
        "C1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "anuttara-language",
    ),
    node_spec(
        "c_1_formulation_type",
        "C1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "anuttara-language",
    ),
    node_spec(
        "c_1_complete_formulation",
        "C1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "c_1_formulation_breakdown",
        "C1",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "c_1_key_principles",
        "C1",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "c_3_practical_applications",
        "C3",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "c_3_related_coordinates",
        "C3",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-c",
    ),
    node_spec(
        "p_1_variant",
        "P1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-position",
    ),
    node_spec(
        "p_1_weave",
        "P1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-position",
    ),
    node_spec(
        "p_1_position_id",
        "P1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-position",
    ),
    node_spec(
        "p_1_stage_id",
        "P1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-position",
    ),
    node_spec(
        "p_3_sequence",
        "P3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-position",
    ),
    node_spec(
        "l_2_elemental_nature",
        "L2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_3_seasonal_position",
        "L3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_4_modality",
        "L4",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "l_4_reflection_table",
        "L4",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-lens",
    ),
    node_spec(
        "s_4_function_description",
        "S4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_translation_schema",
        "S4'",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_safety_class",
        "S4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_4_eligible_formats",
        "S4'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "s_5_system_prompt",
        "S5'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Protected,
        "deep-bimba-system",
    ),
    node_spec(
        "s_5_capabilities",
        "S5'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "deep-bimba-system",
    ),
    node_spec(
        "t_3_developmental_stage",
        "T3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-thought",
    ),
    node_spec(
        "t_3_process_realization",
        "T3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-thought",
    ),
    node_spec(
        "m_0_consciousness_operation",
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_0_consciousness_function",
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_0_grammatical_function",
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_0_spanda_relationship",
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_0_metaphysical_names",
        "M0'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_0_adam_eve_classification",
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_1_topological_formula",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_1_processual_topology_role",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_1_matrix_type",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_1_construction_phase",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_1_algebraic_correspondence",
        "M1'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_arabic_text",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_trilateral_root",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_dhikr_application",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_recitation_count",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_zodiacal_influence",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_therapeutic_cluster",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_digital_root",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_matrix_constant",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_2_magic_square_sum",
        "M2'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_quadrant",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_rotational_phase",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_yin_yang_balance",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_elemental_affinity",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_amino_acid_code",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_positive_codon_binary",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_negative_codon_binary",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_upper_pair_binary",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_lower_pair_binary",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_tarot_card",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_3_hebrew_letter",
        "M3'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_temporal_structure",
        "M4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_temporal_intelligence_layer",
        "M4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_kashmir_shaivism_alignment",
        "M4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_practical_manifestations",
        "M4'",
        GraphPropertyType::JsonString,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_capability_signals",
        "M4'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_4_preferred_timing",
        "M4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_5_whitehead_lacanian",
        "M5'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    node_spec(
        "m_5_archaeology_method",
        "M5'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-m-prime",
    ),
    GraphPropertySpec {
        key: SEMANTIC_EMBEDDING_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Embedding,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "embedding",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_INDEX_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_SCORE_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Float,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_SQUARE_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_LENS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_POSITION_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_RESONANCE_HELIX_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Boolean,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: KERNEL_TICK_PROPERTY,
        coordinate_home: "S0.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-clock",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_WEB_JSON_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::JsonString,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_COUNT_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_FAMILY_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_REFLECTIVE_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_INVERSION_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_POSITION_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_LENS_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_LENS_INVERSION_REFS_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::StringList,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_HARMONIC_ANCHOR_JSON_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::JsonString,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: POINTER_REFRESHED_AT_PROPERTY,
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::DateTime,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "pointer-web",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: SESSION_KEY_PROPERTY,
        coordinate_home: "S3.0",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "gateway-session",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: GRAPHITI_ARC_ID_PROPERTY,
        coordinate_home: "S3.5",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "graphiti-episode",
        indexed: true,
        compatibility: false,
    },
    indexed_node_spec(
        S_REPO_PATH_PROPERTY,
        "S0",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_REPO_ROOT_PROPERTY,
        "S0",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_FILE_KIND_PROPERTY,
        "S0",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_COMPONENT_PROPERTY,
        "S0",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_SYMBOL_REFS_PROPERTY,
        "S0",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_EXECUTION_FLOW_REFS_PROPERTY,
        "S0",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_DEPENDS_ON_PATHS_PROPERTY,
        "S0",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        S_OWNED_BY_COORDINATE_PROPERTY,
        "S0",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        M_REPO_PATH_PROPERTY,
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        M_COMPONENT_PROPERTY,
        "M0'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
    indexed_node_spec(
        M_SYMBOL_REFS_PROPERTY,
        "M0'",
        GraphPropertyType::StringList,
        GraphPropertyCardinality::Many,
        GraphPropertyDisclosure::Internal,
        "code-provenance",
    ),
];

pub const RELATIONSHIP_PROPERTY_SPECS: &[GraphPropertySpec] = &[
    GraphPropertySpec {
        key: REL_EVIDENCE_KIND_PROPERTY,
        coordinate_home: "S1.2",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "evidence",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_EVIDENCE_TEXT_PROPERTY,
        coordinate_home: "S1.2",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "evidence",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_SOURCE_PATH_PROPERTY,
        coordinate_home: "S1.0",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "vault",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_SOURCE_LINE_PROPERTY,
        coordinate_home: "S1.2",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "evidence",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_TARGET_TEXT_PROPERTY,
        coordinate_home: "S1.2",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "evidence",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_CONFIDENCE_PROPERTY,
        coordinate_home: "S4.0",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::Float,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "llm-inference",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_INFERRED_BY_PROPERTY,
        coordinate_home: "S4.0",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "llm-inference",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_PROMPT_HASH_PROPERTY,
        coordinate_home: "S4.0",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "llm-inference",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_CREATED_BY_SYNC_VERSION_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: REL_LAST_VERIFIED_AT_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::DateTime,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "sync",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_0_source_coordinate",
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_0_target_coordinate",
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_1_relation_family",
        coordinate_home: "S2.3'",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "relationship",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_2_relation_type",
        coordinate_home: "S2.3'",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "relationship",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_3_created_at",
        coordinate_home: "S0.4",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::DateTime,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "system",
        indexed: false,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_3_dataset_branch",
        coordinate_home: "S2.3",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "provenance",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "c_4_provenance",
        coordinate_home: "S2.4'",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::JsonString,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "provenance",
        indexed: false,
        compatibility: false,
    },
    relationship_property_spec_const(
        "c_1_relation_description",
        "C1",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "c_2_relation_kind",
        "C2",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "c_5_correspondence",
        "C5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "c_5_correspondence_basis",
        "C5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "l_5_realization_level",
        "L5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "l_5_mystical_identity",
        "L5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "s_4_function_role",
        "S4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "s_4_hierarchy_level",
        "S4'",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "t_5_insight",
        "T5",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "p_3_pattern_structure",
        "P3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "p_3_pattern_name",
        "P3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    relationship_property_spec_const(
        "t_3_developmental_function",
        "T3",
        GraphPropertyType::String,
        GraphPropertyCardinality::One,
        GraphPropertyDisclosure::Public,
        "deep-bimba-relation",
    ),
    GraphPropertySpec {
        key: KERNEL_RESONANCE_INDEX_PROPERTY,
        coordinate_home: "S2.5",
        owner: GraphPropertyOwner::Relationship,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "kernel-resonance",
        indexed: true,
        compatibility: false,
    },
];

pub const CONSTRAINTS: &[&str] = &[
    "CREATE CONSTRAINT bimba_coord_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.coordinate IS UNIQUE",
    "CREATE CONSTRAINT bimba_uuid_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.c_2_uuid IS UNIQUE",
];

pub const INDEXES: &[&str] = &[
    "CREATE INDEX coord_family IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_family)",
    "CREATE INDEX coord_position IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_ql_position)",
    "CREATE INDEX coord_layer IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_layer)",
    "CREATE INDEX coord_topo IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_topo_mode)",
    "CREATE INDEX coord_vault_path IF NOT EXISTS FOR (n:Bimba) ON (n.s_1_vault_path)",
    "CREATE INDEX coord_source_dataset IF NOT EXISTS FOR (n:Bimba) ON (n.c_3_source_dataset)",
    "CREATE INDEX coord_dataset_branch IF NOT EXISTS FOR (n:Bimba) ON (n.c_3_dataset_branch)",
    "CREATE INDEX coord_ct_type IF NOT EXISTS FOR (n:Bimba) ON (n.c_1_ct_type)",
    "CREATE INDEX coord_artifact_role IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_artifact_role)",
    "CREATE INDEX coord_kernel_resonance_index IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_resonance_index)",
    "CREATE INDEX coord_kernel_resonance_square IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_resonance_square)",
    "CREATE INDEX coord_kernel_tick IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_tick)",
    "CREATE INDEX coord_pointer_count IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_pointer_count)",
    "CREATE INDEX coord_session_key IF NOT EXISTS FOR (n:Bimba) ON (n.s_3_session_key)",
    "CREATE INDEX coord_graphiti_arc_id IF NOT EXISTS FOR (n:Bimba) ON (n.s_3_graphiti_arc_id)",
];

pub const RELATIONSHIP_INDEXES: &[&str] = &[
    "CREATE LOOKUP INDEX bimba_rel_type_lookup IF NOT EXISTS FOR ()-[r]-() ON EACH type(r)",
    "CREATE INDEX bimba_contains_source_coordinate IF NOT EXISTS FOR ()-[r:CONTAINS]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_contains_target_coordinate IF NOT EXISTS FOR ()-[r:CONTAINS]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_has_lens_source_coordinate IF NOT EXISTS FOR ()-[r:HAS_LENS]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_has_lens_target_coordinate IF NOT EXISTS FOR ()-[r:HAS_LENS]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_pos5_source_coordinate IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_pos5_target_coordinate IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_pos5_relation_type IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_2_relation_type)",
    "CREATE INDEX bimba_kernel_resonance_index IF NOT EXISTS FOR ()-[r:HAS_KERNEL_RESONANCE]-() ON (r.c_5_kernel_resonance_index)",
    "CREATE INDEX bimba_kernel_resonance_source_coordinate IF NOT EXISTS FOR ()-[r:HAS_KERNEL_RESONANCE]-() ON (r.c_0_source_coordinate)",
];

pub const VECTOR_INDEX: &str = "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_embedding) OPTIONS {indexConfig: {`vector.dimensions`: 3072, `vector.similarity_function`: 'cosine'}}";

pub const OBSOLETE_INDEXES: &[&str] = &[
    "DROP INDEX coord_family_legacy IF EXISTS",
    "DROP INDEX coord_position_legacy IF EXISTS",
    "DROP INDEX coord_layer_legacy IF EXISTS",
    "DROP INDEX coord_topo_legacy IF EXISTS",
    "DROP INDEX coord_vault_path_legacy IF EXISTS",
];

pub fn node_property_spec(key: &str) -> Option<&'static GraphPropertySpec> {
    NODE_PROPERTY_SPECS.iter().find(|spec| spec.key == key)
}

pub fn relationship_property_spec(key: &str) -> Option<&'static GraphPropertySpec> {
    RELATIONSHIP_PROPERTY_SPECS
        .iter()
        .find(|spec| spec.key == key)
}

pub fn label_spec(label: &str) -> Option<&'static GraphLabelSpec> {
    LABEL_SPECS.iter().find(|spec| spec.label == label)
}

pub fn relationship_spec(rel_type: &str) -> Result<&'static GraphRelationshipTypeSpec, String> {
    RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type && !spec.compatibility)
        .ok_or_else(|| format!("not a canonical relationship type: {rel_type}"))
}

/// Convention for deep-dataset relationship strings.
///
/// `docs/datasets/{anuttara,paramasiva,parashakti,mahamaya,nara,epii}-deep/relations.json`
/// emit thousands of semantically rich relation types
/// (`ARCHETYPAL_RESONANCE_ACTIVE_AGENCY`, `MIRRORS_SVATANTRYA`, ...). Per-instance
/// registration is infeasible; instead Track 02 T1 declares a CLASS convention:
/// uppercase ASCII + digits + underscores, starts with an uppercase letter,
/// no consecutive underscores. Importers MAY emit any string matching this
/// pattern as a deep-dataset relation; the registry classes them as
/// `deep_dataset_class` for drift accounting without enumerating each one.
///
/// Strings already registered in `RELATIONSHIP_TYPE_SPECS` (canonical or
/// compatibility) are NOT classed as deep-dataset, even when they match the
/// pattern.
pub fn is_deep_dataset_relation_type(rel_type: &str) -> bool {
    if rel_type.is_empty() {
        return false;
    }
    if RELATIONSHIP_TYPE_SPECS
        .iter()
        .any(|spec| spec.rel_type == rel_type)
    {
        return false;
    }
    let bytes = rel_type.as_bytes();
    if !bytes[0].is_ascii_uppercase() {
        return false;
    }
    let mut prev_underscore = false;
    for &b in bytes {
        let allowed = b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_';
        if !allowed {
            return false;
        }
        if b == b'_' && prev_underscore {
            return false;
        }
        prev_underscore = b == b'_';
    }
    !rel_type.ends_with('_')
}

/// Classify a relationship type emitted by seed.rs or dataset_import.rs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RelationshipTypeClass {
    /// Registered canonical relationship (compatibility: false).
    Canonical,
    /// Registered compatibility relationship (compatibility: true).
    Compatibility,
    /// Matches the deep-dataset convention; not individually registered.
    DeepDataset,
    /// Drift — not registered and does not match any allowed class.
    Drift,
}

/// Classify a relationship type against the registry + deep-dataset class.
pub fn classify_relationship_type(rel_type: &str) -> RelationshipTypeClass {
    if let Some(spec) = RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type)
    {
        if spec.compatibility {
            return RelationshipTypeClass::Compatibility;
        }
        return RelationshipTypeClass::Canonical;
    }
    if is_deep_dataset_relation_type(rel_type) {
        return RelationshipTypeClass::DeepDataset;
    }
    RelationshipTypeClass::Drift
}

pub fn relationship_types() -> Vec<&'static str> {
    RELATIONSHIP_TYPE_SPECS
        .iter()
        .filter(|spec| !spec.compatibility)
        .map(|spec| spec.rel_type)
        .collect()
}

pub fn compatibility_labels() -> Vec<&'static str> {
    LABEL_SPECS
        .iter()
        .filter(|spec| spec.compatibility)
        .map(|spec| spec.label)
        .collect()
}

pub fn coordinate_prefix_family_spec(prefix: &str) -> Option<&'static CoordinatePrefixFamilySpec> {
    COORDINATE_PREFIX_FAMILY_SPECS
        .iter()
        .find(|spec| spec.prefix == prefix)
}

pub fn coordinate_prefix_families() -> &'static [&'static str] {
    COORDINATE_PREFIX_FAMILIES
}

pub fn coordinate_semantic_family_specs() -> &'static [CoordinateSemanticFamilySpec] {
    COORDINATE_SEMANTIC_FAMILY_SPECS
}

pub fn coordinate_position_semantics() -> &'static [CoordinatePositionSemanticSpec] {
    COORDINATE_POSITION_SEMANTICS
}

pub fn coordinate_property_construction_law() -> CoordinatePropertyConstructionLaw {
    COORDINATE_PROPERTY_CONSTRUCTION_LAW
}

pub fn coordinate_semantic_registry_authority_paths() -> &'static [&'static str] {
    COORDINATE_SEMANTIC_AUTHORITY_PATHS
}

pub fn coordinate_semantic_registry() -> CoordinateSemanticRegistry {
    CoordinateSemanticRegistry {
        families: COORDINATE_SEMANTIC_FAMILY_SPECS,
        positions: COORDINATE_POSITION_SEMANTICS,
        property_law: COORDINATE_PROPERTY_CONSTRUCTION_LAW,
        authority_paths: COORDINATE_SEMANTIC_AUTHORITY_PATHS,
    }
}

pub fn coordinate_prefix_property_key(
    prefix: &str,
    position: u8,
    semantic_suffix: &str,
) -> Result<String, String> {
    coordinate_prefix_property_key_for_axis(prefix, position, false, semantic_suffix)
}

pub fn coordinate_prefix_property_key_for_axis(
    prefix: &str,
    position: u8,
    inverted: bool,
    semantic_suffix: &str,
) -> Result<String, String> {
    coordinate_prefix_family_spec(prefix)
        .ok_or_else(|| format!("unsupported coordinate-prefix property family: {prefix}"))?;
    if position > 5 {
        return Err(format!(
            "coordinate-prefix property has invalid position: {prefix}_{position}_{semantic_suffix}"
        ));
    }
    if semantic_suffix.is_empty()
        || semantic_suffix.split('_').any(|part| {
            part.is_empty()
                || !part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
    {
        return Err(format!(
            "coordinate-prefix property missing semantic suffix: {prefix}_{position}_{semantic_suffix}"
        ));
    }

    let key = if inverted {
        format!("{prefix}_{position}_i_{semantic_suffix}")
    } else {
        format!("{prefix}_{position}_{semantic_suffix}")
    };
    validate_coordinate_prefix_property(&key)?;
    Ok(key)
}

pub fn labels_for_coordinate_node(
    coordinate: &str,
    artifact_kind: &str,
) -> Result<Vec<String>, String> {
    if coordinate.trim().is_empty() {
        return Err("coordinate is required for label derivation".to_owned());
    }

    let mut labels = vec!["Bimba".to_owned()];

    let root = coordinate
        .chars()
        .find(|ch| ch.is_ascii_alphabetic())
        .map(|ch| ch.to_ascii_uppercase());
    match root {
        Some('S') => labels.push("Stack".to_owned()),
        Some('M') => labels.push("Psychoid".to_owned()),
        Some('C') if coordinate.starts_with("CF") => labels.push("ContextFrame".to_owned()),
        _ => {}
    }

    match artifact_kind {
        "ThoughtArtifact" | "thought" => labels.push("ThoughtArtifact".to_owned()),
        "DailyNote" | "daily_note" => labels.push("DailyNote".to_owned()),
        "NowSession" | "now_session" => labels.push("NowSession".to_owned()),
        _ => {}
    }

    for label in &labels {
        let Some(spec) = label_spec(label) else {
            return Err(format!("derived unregistered label: {label}"));
        };
        if spec.compatibility {
            return Err(format!("derived compatibility label as canonical: {label}"));
        }
    }

    labels.sort();
    labels.dedup();
    Ok(labels)
}

pub fn canonical_property_key(key: &str) -> Result<&'static str, String> {
    match key {
        "bimbaCoordinate" | "bimba_coordinate" => Ok(COORDINATE_PROPERTY),
        canonical
            if node_property_spec(canonical).is_some()
                || relationship_property_spec(canonical).is_some() =>
        {
            Ok(NODE_PROPERTY_SPECS
                .iter()
                .chain(RELATIONSHIP_PROPERTY_SPECS.iter())
                .find(|spec| spec.key == canonical)
                .map(|spec| spec.key)
                .unwrap_or(COORDINATE_PROPERTY))
        }
        prefixed if validate_coordinate_prefix_property(prefixed).is_ok() => Err(format!(
            "dynamic coordinate-prefix property requires registry review: {prefixed}"
        )),
        other => Err(format!("unknown graph property key: {other}")),
    }
}

pub fn property_spec(key: &str) -> Result<&'static GraphPropertySpec, String> {
    node_property_spec(key)
        .or_else(|| relationship_property_spec(key))
        .ok_or_else(|| format!("unknown graph property key: {key}"))
}

pub fn validate_coordinate_prefix_property(key: &str) -> Result<(), String> {
    let mut parts = key.split('_');
    let prefix = parts
        .next()
        .ok_or_else(|| "coordinate-prefix property is empty".to_owned())?;
    if coordinate_prefix_family_spec(prefix).is_none() {
        return Err(format!(
            "unsupported coordinate-prefix property family: {prefix}"
        ));
    }

    let position = parts
        .next()
        .ok_or_else(|| format!("coordinate-prefix property missing position: {key}"))?;
    if !matches!(position, "0" | "1" | "2" | "3" | "4" | "5") {
        return Err(format!(
            "coordinate-prefix property has invalid position: {key}"
        ));
    }

    let mut semantic_parts = parts.collect::<Vec<_>>();
    if semantic_parts.first() == Some(&"i") {
        semantic_parts.remove(0);
    }
    if semantic_parts.is_empty()
        || semantic_parts.iter().any(|part| {
            part.is_empty()
                || matches!(*part, "prime" | "inverted" | "inversion")
                || !part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
    {
        return Err(format!(
            "coordinate-prefix property missing semantic suffix: {key}"
        ));
    }

    Ok(())
}

pub fn relationship_required_evidence_property_keys() -> &'static [&'static str] {
    REQUIRED_RELATIONSHIP_EVIDENCE_PROPERTIES
}

pub fn canonical_node_property_keys() -> Vec<&'static str> {
    NODE_PROPERTY_SPECS
        .iter()
        .filter(|spec| !spec.compatibility)
        .map(|spec| spec.key)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_schema_is_bimba_3072() {
        assert_eq!(BIMBA_LABEL, "Bimba");
        assert_eq!(COORDINATE_PROPERTY, "coordinate");
        assert_eq!(SEMANTIC_EMBEDDING_DIMENSIONS, 3072);
        assert!(VECTOR_INDEX.contains("FOR (n:Bimba)"));
        assert!(VECTOR_INDEX.contains("n.c_5_embedding"));
        assert!(VECTOR_INDEX.contains("3072"));
    }

    #[test]
    fn coordinate_identity_is_property_and_labels_are_descriptive() {
        let labels = labels_for_coordinate_node("S2", "VaultMarkdown").unwrap();

        assert_eq!(COORDINATE_PROPERTY, "coordinate");
        assert!(labels.contains(&"Bimba".to_string()));
        assert!(labels.contains(&"Stack".to_string()));
        assert!(!labels.contains(&"Coordinate".to_string()));
        assert!(!labels.contains(&"VaultArtifact".to_string()));
    }

    #[test]
    fn bimba_is_canonical_namespace_while_old_generic_labels_are_compatibility_only() {
        let compat = compatibility_labels();

        assert!(compat.contains(&"BimbaNode"));
        assert!(compat.contains(&"BimbaCoordinate"));
        assert!(compat.contains(&"Coordinate"));
        assert!(compat.contains(&"VaultArtifact"));
        assert!(label_spec("Bimba").is_some_and(|spec| !spec.compatibility));
        assert!(label_spec("Stack").is_some_and(|spec| !spec.compatibility));
    }

    #[test]
    fn covers_all_coordinate_prefix_property_families() {
        for prefix in ["c", "p", "l", "s", "t", "m", "q"] {
            let key = format!("{prefix}_0_summary");
            assert!(
                validate_coordinate_prefix_property(&key).is_ok(),
                "{key} should be accepted"
            );
        }
    }

    #[test]
    fn property_registry_rejects_unknown_technical_properties() {
        assert!(property_spec("randomGraphThing").is_err());
        assert!(validate_coordinate_prefix_property("x_0_summary").is_err());
        assert!(validate_coordinate_prefix_property("c_6_summary").is_err());
    }

    #[test]
    fn canonicalizes_legacy_coordinate_property_names_as_compatibility_only() {
        assert_eq!(
            canonical_property_key("bimbaCoordinate").unwrap(),
            "coordinate"
        );
        assert_eq!(
            canonical_property_key("bimba_coordinate").unwrap(),
            "coordinate"
        );
    }

    #[test]
    fn relationship_types_are_schema_registered() {
        for rel_type in [
            "REFERENCES",
            "SOURCES",
            "CONTAINS",
            "PART_OF",
            "ELABORATES",
            "CONTRASTS",
            "IMPLEMENTS",
            "OPERATES_IN",
            "REFLECTS_AS",
            "INVERTS_TO",
            "SUPPORTS",
            "CRITIQUES",
            "DERIVES_FROM",
            "PROMOTES_TO",
            "SYNCED_FROM",
        ] {
            assert!(relationship_spec(rel_type).is_ok(), "{rel_type} missing");
        }
    }

    #[test]
    fn legacy_positional_relationships_are_not_canonical_outputs() {
        assert!(relationship_spec("POS0_LINKS_TO").is_err());
        assert!(relationship_spec("MADE_UP").is_err());
        assert!(RELATIONSHIP_TYPE_SPECS
            .iter()
            .any(|spec| spec.rel_type == "POS0_LINKS_TO" && spec.compatibility));
    }

    #[test]
    fn legacy_schema_is_compatibility_only() {
        assert!(COMPAT_LABELS.contains(&"BimbaNode"));
        assert!(COMPAT_LABELS.contains(&"BimbaCoordinate"));
        assert!(!COMPAT_COORDINATE_PROPERTIES.contains(&"bimbaCoordinate"));
        assert!(node_property_spec("bimbaCoordinate").is_none());
        assert!(COMPAT_EMBEDDING_DIMENSIONS.contains(&768));

        for constraint in CONSTRAINTS {
            assert!(!constraint.contains("BimbaNode"));
            assert!(!constraint.contains("BimbaCoordinate"));
            assert!(!constraint.contains("bimbaCoordinate"));
        }
    }

    #[test]
    fn coordinate_property_specs_cover_nodes_and_relationships() {
        assert!(node_property_spec("coordinate").is_some());
        assert!(node_property_spec("c_0_source_coordinates").is_some());
        assert!(node_property_spec("c_1_name").is_some());
        assert!(node_property_spec("c_4_family").is_some());
        assert!(node_property_spec("c_0_essence").is_some());
        assert!(node_property_spec("c_5_embedding").is_some());
        assert!(node_property_spec(KERNEL_RESONANCE_INDEX_PROPERTY).is_some());
        assert!(node_property_spec(SESSION_KEY_PROPERTY).is_some());
        assert!(node_property_spec("random").is_none());

        assert!(relationship_property_spec("c_2_relation_type").is_some());
        assert!(relationship_property_spec("c_0_source_coordinate").is_some());
        assert!(relationship_property_spec("c_3_dataset_branch").is_some());
        assert!(relationship_property_spec(KERNEL_RESONANCE_INDEX_PROPERTY).is_some());
        assert!(relationship_property_spec("random").is_none());
    }

    #[test]
    fn regional_property_specs_cover_deep_bimba_surfaces() {
        assert!(node_property_spec("l_2_therapeutic_properties").is_some());
        assert!(node_property_spec("t_5_next_evolution_phase").is_some());
        assert!(node_property_spec("q_1_theoretical_thesis").is_some());
        assert!(node_property_spec("m_5_lacanian_interface").is_some());
    }

    #[test]
    fn all_canonical_node_props_follow_prefix_convention() {
        for key in canonical_node_property_keys() {
            assert!(
                key == "coordinate"
                    || [
                        COORDINATE_PREFIX_PROPERTY,
                        COORDINATE_DEPTH_PROPERTY,
                        COORDINATE_PARENT_PROPERTY,
                        COORDINATE_AXIS_PROPERTY,
                        CANONICAL_VAULT_PATH_PROPERTY,
                        ARTIFACT_KIND_PROPERTY,
                        CONTENT_HASH_PROPERTY,
                        TITLE_PROPERTY,
                        SUMMARY_PROPERTY,
                        SOURCE_MTIME_PROPERTY,
                        SYNC_STATUS_PROPERTY,
                        SYNC_VERSION_PROPERTY,
                        LAST_PROMOTED_AT_PROPERTY,
                        PROMOTION_SOURCE_PROPERTY,
                        RELATION_EVIDENCE_COUNT_PROPERTY,
                    ]
                    .contains(&key)
                    || key.starts_with("c_")
                    || key.starts_with("p_")
                    || key.starts_with("l_")
                    || key.starts_with("s_")
                    || key.starts_with("t_")
                    || key.starts_with("q_")
                    || key.starts_with("m_"),
                "non-canonical property key escaped: {}",
                key
            );
        }
    }

    #[test]
    fn bare_property_names_are_in_compat_list() {
        for bare in [
            "name",
            "family",
            "description",
            "ql_position",
            "layer",
            "topo_mode",
            "vault_path",
            "essence",
            "core_nature",
            "semantic_embedding",
        ] {
            assert!(
                COMPAT_NODE_PROPERTIES.contains(&bare),
                "bare property '{}' missing from compat list",
                bare
            );
        }
    }
}
