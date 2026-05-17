pub const SCHEMA_VERSION: &str = "2026-05-01-s2-bimba-3072";
pub const GRAPH_ID: &str = "primary";
pub const EMBEDDING_VERSION: &str = "q-semantic-v2-3072";
pub const Q_SCHEMA_VERSION: &str = "q-prefix-v1";

pub const BIMBA_LABEL: &str = "Bimba";
pub const COORDINATE_PROPERTY: &str = "coordinate";
pub const UUID_PROPERTY: &str = "uuid";
pub const SEMANTIC_EMBEDDING_PROPERTY: &str = "semantic_embedding";
pub const SEMANTIC_EMBEDDING_DIMENSIONS: usize = 3072;
pub const SEMANTIC_EMBEDDING_INDEX: &str = "coord_embedding";

pub const COMPAT_LABELS: &[&str] = &["BimbaNode", "BimbaCoordinate"];
pub const COMPAT_COORDINATE_PROPERTIES: &[&str] = &["bimbaCoordinate"];
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
        key: "name",
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
        key: "description",
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
        key: "family",
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "ql_position",
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Integer,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "layer",
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Public,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "topo_mode",
        coordinate_home: "S2.1",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::String,
        cardinality: GraphPropertyCardinality::One,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "coordinate",
        indexed: true,
        compatibility: false,
    },
    GraphPropertySpec {
        key: "vault_path",
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
    GraphPropertySpec {
        key: SEMANTIC_EMBEDDING_PROPERTY,
        coordinate_home: "S2.4",
        owner: GraphPropertyOwner::Node,
        value_type: GraphPropertyType::Embedding,
        cardinality: GraphPropertyCardinality::Many,
        disclosure: GraphPropertyDisclosure::Internal,
        source_family: "embedding",
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
];

pub const CONSTRAINTS: &[&str] = &[
    "CREATE CONSTRAINT bimba_coord_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.coordinate IS UNIQUE",
    "CREATE CONSTRAINT bimba_uuid_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.uuid IS UNIQUE",
];

pub const INDEXES: &[&str] = &[
    "CREATE INDEX coord_family IF NOT EXISTS FOR (n:Bimba) ON (n.family)",
    "CREATE INDEX coord_position IF NOT EXISTS FOR (n:Bimba) ON (n.ql_position)",
    "CREATE INDEX coord_layer IF NOT EXISTS FOR (n:Bimba) ON (n.layer)",
    "CREATE INDEX coord_topo IF NOT EXISTS FOR (n:Bimba) ON (n.topo_mode)",
    "CREATE INDEX coord_vault_path IF NOT EXISTS FOR (n:Bimba) ON (n.vault_path)",
    "CREATE INDEX coord_ct_type IF NOT EXISTS FOR (n:Bimba) ON (n.c_1_ct_type)",
    "CREATE INDEX coord_artifact_role IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_artifact_role)",
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
];

pub const VECTOR_INDEX: &str = "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS FOR (n:Bimba) ON (n.semantic_embedding) OPTIONS {indexConfig: {`vector.dimensions`: 3072, `vector.similarity_function`: 'cosine'}}";

pub fn node_property_spec(key: &str) -> Option<&'static GraphPropertySpec> {
    NODE_PROPERTY_SPECS.iter().find(|spec| spec.key == key)
}

pub fn relationship_property_spec(key: &str) -> Option<&'static GraphPropertySpec> {
    RELATIONSHIP_PROPERTY_SPECS
        .iter()
        .find(|spec| spec.key == key)
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
        assert!(VECTOR_INDEX.contains("n.semantic_embedding"));
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
        assert!(node_property_spec("random").is_none());

        assert!(relationship_property_spec("c_2_relation_type").is_some());
        assert!(relationship_property_spec("c_0_source_coordinate").is_some());
        assert!(relationship_property_spec("random").is_none());
    }
}
