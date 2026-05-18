pub const SCHEMA_VERSION: &str = "2026-05-17-s2-bimba-coord-driven-3072";
pub const GRAPH_ID: &str = "primary";
pub const EMBEDDING_VERSION: &str = "q-semantic-v2-3072";
pub const Q_SCHEMA_VERSION: &str = "q-prefix-v2";

pub const BIMBA_LABEL: &str = "Bimba";
pub const COORDINATE_PROPERTY: &str = "coordinate";

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
pub const POINTER_REFRESHED_AT_PROPERTY: &str = "c_3_pointer_refreshed_at";
pub const SESSION_KEY_PROPERTY: &str = "s_3_session_key";
pub const GRAPHITI_ARC_ID_PROPERTY: &str = "s_3_graphiti_arc_id";

pub const SEMANTIC_EMBEDDING_DIMENSIONS: usize = 3072;
pub const SEMANTIC_EMBEDDING_INDEX: &str = "coord_embedding";

pub const COMPAT_LABELS: &[&str] = &["BimbaNode", "BimbaCoordinate"];
pub const COMPAT_COORDINATE_PROPERTIES: &[&str] = &["bimbaCoordinate"];
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
    GraphPropertySpec {
        key: "bimbaCoordinate",
        coordinate_home: "M.compat",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "compatibility",
        indexed: false,
        compatibility: true,
    },
];

pub const RELATIONSHIP_PROPERTY_SPECS: &[GraphPropertySpec] = &[
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
    fn legacy_schema_is_compatibility_only() {
        assert!(COMPAT_LABELS.contains(&"BimbaNode"));
        assert!(COMPAT_LABELS.contains(&"BimbaCoordinate"));
        assert!(COMPAT_COORDINATE_PROPERTIES.contains(&"bimbaCoordinate"));
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
        for bare in ["name", "family", "description", "ql_position", "layer", "topo_mode", "vault_path", "essence", "core_nature", "semantic_embedding"] {
            assert!(
                COMPAT_NODE_PROPERTIES.contains(&bare),
                "bare property '{}' missing from compat list",
                bare
            );
        }
    }
}
