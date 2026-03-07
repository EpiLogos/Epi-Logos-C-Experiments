use std::collections::HashMap;

/// Stub Neo4j client — real implementation requires neo4j crate
pub struct Neo4jClient {
    uri: String,
}

pub struct Neo4jConfig {
    pub uri: String,
    pub user: String,
    pub password: String,
}

impl Neo4jClient {
    pub fn new(config: Neo4jConfig) -> Result<Self, String> {
        Ok(Self { uri: config.uri })
    }

    pub fn run(
        &self,
        query: &str,
        _params: HashMap<String, String>,
    ) -> Result<Vec<HashMap<String, serde_json::Value>>, String> {
        Err(format!(
            "Neo4j stub: cannot execute '{}' — connect to {}",
            query, self.uri
        ))
    }
}
