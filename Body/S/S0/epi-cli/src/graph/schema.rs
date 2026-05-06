use crate::graph::client::Neo4jClient;

pub use epi_s2_graph_schema::{CONSTRAINTS, INDEXES, SCHEMA_VERSION, VECTOR_INDEX};

/// Create all schema elements (constraints, indexes, vector index) in Neo4j.
///
/// Returns a summary string describing what was created.
pub async fn create_schema(client: &Neo4jClient) -> Result<String, String> {
    let mut created = Vec::new();

    for cypher in CONSTRAINTS {
        client
            .run(cypher)
            .await
            .map_err(|e| format!("constraint failed: {}", e))?;
    }
    created.push(format!("{} constraints", CONSTRAINTS.len()));

    for cypher in INDEXES {
        client
            .run(cypher)
            .await
            .map_err(|e| format!("index failed: {}", e))?;
    }
    created.push(format!("{} indexes", INDEXES.len()));

    client
        .run(VECTOR_INDEX)
        .await
        .map_err(|e| format!("vector index failed: {}", e))?;
    created.push("1 vector index".to_string());

    Ok(format!("Schema created: {}", created.join(", ")))
}

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
        for c in CONSTRAINTS {
            assert!(
                c.contains("(n:Bimba)"),
                "constraint should use Bimba label: {}",
                c
            );
            assert!(
                !c.contains("BimbaCoordinate"),
                "constraint should not use old label: {}",
                c
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
