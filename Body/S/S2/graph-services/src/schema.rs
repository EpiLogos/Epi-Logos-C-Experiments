use crate::Neo4jClient;

pub use epi_s2_graph_schema::{CONSTRAINTS, INDEXES, SCHEMA_VERSION, VECTOR_INDEX};

/// Create all schema elements in Neo4j and return a human-readable summary.
pub async fn create_schema(client: &Neo4jClient) -> Result<String, String> {
    let mut created = Vec::new();

    for cypher in CONSTRAINTS {
        client
            .run(cypher)
            .await
            .map_err(|err| format!("constraint failed: {err}"))?;
    }
    created.push(format!("{} constraints", CONSTRAINTS.len()));

    for cypher in INDEXES {
        client
            .run(cypher)
            .await
            .map_err(|err| format!("index failed: {err}"))?;
    }
    created.push(format!("{} indexes", INDEXES.len()));

    client
        .run(VECTOR_INDEX)
        .await
        .map_err(|err| format!("vector index failed: {err}"))?;
    created.push("1 vector index".to_owned());

    Ok(format!("Schema created: {}", created.join(", ")))
}
