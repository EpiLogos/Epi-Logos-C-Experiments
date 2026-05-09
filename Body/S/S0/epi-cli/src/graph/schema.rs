pub use epi_s2_graph_services::schema::{
    create_schema, CONSTRAINTS, INDEXES, SCHEMA_VERSION, VECTOR_INDEX,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constraint_count() {
        assert_eq!(CONSTRAINTS.len(), 2);
    }

    #[test]
    fn test_index_count() {
        assert_eq!(INDEXES.len(), 5);
    }

    #[test]
    fn test_vector_index_has_3072_dims() {
        assert!(VECTOR_INDEX.contains("3072"));
        assert!(VECTOR_INDEX.contains("cosine"));
    }

    #[test]
    fn test_constraints_use_bimba_label() {
        for constraint in CONSTRAINTS {
            assert!(
                constraint.contains("(n:Bimba)"),
                "constraint should use Bimba label: {constraint}"
            );
            assert!(
                !constraint.contains("BimbaCoordinate"),
                "constraint should not use old label: {constraint}"
            );
        }
    }

    #[test]
    fn test_constraints_use_coordinate_property() {
        assert!(
            CONSTRAINTS[0].contains("n.coordinate"),
            "first constraint should use coordinate property"
        );
        assert!(
            !CONSTRAINTS[0].contains("bimbaCoordinate"),
            "should not use old property name"
        );
    }
}
