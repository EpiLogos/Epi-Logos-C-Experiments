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
];

pub const VECTOR_INDEX: &str = "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS FOR (n:Bimba) ON (n.semantic_embedding) OPTIONS {indexConfig: {`vector.dimensions`: 3072, `vector.similarity_function`: 'cosine'}}";

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
}
