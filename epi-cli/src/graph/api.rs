use super::types::*;

pub struct GraphAPI {
    vault_path: String,
}

impl GraphAPI {
    pub fn new(_neo4j_client: Option<()>, vault_path: Option<String>) -> Self {
        Self {
            vault_path: vault_path.unwrap_or_else(|| {
                std::env::var("EPILOGOS_VAULT")
                    .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string())
            }),
        }
    }

    pub fn query_by_coordinate(&self, coordinate: &str) -> GraphResult {
        // Stub — real queries go through Neo4jClient directly now
        GraphResult {
            error: Some(format!(
                "Use `epi graph status` to verify connection, then query '{}' via retrieval engine",
                coordinate
            )),
            ..Default::default()
        }
    }

    pub fn vault_path(&self) -> &str {
        &self.vault_path
    }
}
