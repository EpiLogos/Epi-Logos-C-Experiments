use neo4rs::query;
use sha2::{Digest, Sha256};

use crate::graph::client::Neo4jClient;

pub use epi_s2_graph_schema::{EMBEDDING_VERSION, GRAPH_ID, Q_SCHEMA_VERSION};

#[derive(Debug, Clone)]
pub struct GraphMeta {
    pub graph_id: String,
    pub schema_version: String,
    pub seed_source_hash: String,
    pub embedding_version: String,
    pub q_schema_version: String,
    pub graph_revision: i64,
}

pub fn seed_source_hash() -> String {
    let mut hasher = Sha256::new();
    hasher.update(include_str!("seed.rs").as_bytes());
    format!("{:x}", hasher.finalize())
}

pub async fn is_bootstrapped(client: &Neo4jClient) -> Result<bool, String> {
    let rows = client
        .run("MATCH (n:Bimba) RETURN count(n) AS c")
        .await
        .map_err(|e| format!("bootstrap check failed: {}", e))?;
    let count: i64 = rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();
    Ok(count > 0)
}

pub async fn read_graph_meta(client: &Neo4jClient) -> Result<Option<GraphMeta>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (m:GraphMeta {graph_id: $graph_id})
                 RETURN m.graph_id AS graph_id,
                        m.schema_version AS schema_version,
                        m.seed_source_hash AS seed_source_hash,
                        m.embedding_version AS embedding_version,
                        m.q_schema_version AS q_schema_version,
                        m.graph_revision AS graph_revision",
            )
            .param("graph_id", GRAPH_ID),
        )
        .await
        .map_err(|e| format!("graph meta read failed: {}", e))?;

    let Some(row) = rows.first() else {
        return Ok(None);
    };

    Ok(Some(GraphMeta {
        graph_id: row.get("graph_id").unwrap_or_else(|_| GRAPH_ID.to_string()),
        schema_version: row.get("schema_version").unwrap_or_default(),
        seed_source_hash: row.get("seed_source_hash").unwrap_or_default(),
        embedding_version: row.get("embedding_version").unwrap_or_default(),
        q_schema_version: row.get("q_schema_version").unwrap_or_default(),
        graph_revision: row.get("graph_revision").unwrap_or_default(),
    }))
}

pub async fn write_graph_meta(client: &Neo4jClient, meta: &GraphMeta) -> Result<(), String> {
    client
        .run_query(
            query(
                "MERGE (m:GraphMeta {graph_id: $graph_id})
                 SET m.schema_version = $schema_version,
                     m.seed_source_hash = $seed_source_hash,
                     m.embedding_version = $embedding_version,
                     m.q_schema_version = $q_schema_version,
                     m.graph_revision = $graph_revision,
                     m.updated_at = datetime()",
            )
            .param("graph_id", meta.graph_id.as_str())
            .param("schema_version", meta.schema_version.as_str())
            .param("seed_source_hash", meta.seed_source_hash.as_str())
            .param("embedding_version", meta.embedding_version.as_str())
            .param("q_schema_version", meta.q_schema_version.as_str())
            .param("graph_revision", meta.graph_revision),
        )
        .await
        .map_err(|e| format!("graph meta write failed: {}", e))?;
    Ok(())
}

pub fn desired_meta(schema_version: &str, next_revision: i64) -> GraphMeta {
    GraphMeta {
        graph_id: GRAPH_ID.to_string(),
        schema_version: schema_version.to_string(),
        seed_source_hash: seed_source_hash(),
        embedding_version: EMBEDDING_VERSION.to_string(),
        q_schema_version: Q_SCHEMA_VERSION.to_string(),
        graph_revision: next_revision,
    }
}
