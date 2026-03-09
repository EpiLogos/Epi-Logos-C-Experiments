use neo4rs::{Graph, Query, query};
use std::sync::Arc;

pub struct Neo4jConfig {
    pub uri: String,
    pub user: String,
    pub password: String,
}

impl Neo4jConfig {
    pub fn from_env() -> Self {
        Self {
            uri: std::env::var("EPILOGOS_NEO4J_URI")
                .unwrap_or_else(|_| "bolt://localhost:7687".into()),
            user: std::env::var("EPILOGOS_NEO4J_USER")
                .unwrap_or_else(|_| "neo4j".into()),
            password: std::env::var("EPILOGOS_NEO4J_PASSWORD")
                .unwrap_or_else(|_| String::new()),
        }
    }
}

pub struct Neo4jClient {
    graph: Arc<Graph>,
}

impl Neo4jClient {
    pub fn connect(config: &Neo4jConfig) -> Result<Self, neo4rs::Error> {
        let graph = Graph::new(&config.uri, &config.user, &config.password)?;
        Ok(Self {
            graph: Arc::new(graph),
        })
    }

    pub async fn health_check(&self) -> Result<bool, neo4rs::Error> {
        let mut result = self.graph.execute(query("RETURN 1 AS ok")).await?;
        Ok(result.next().await?.is_some())
    }

    pub async fn run(&self, cypher: &str) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(query(cypher)).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub async fn run_query(&self, q: Query) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(q).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub fn graph(&self) -> &Graph {
        &self.graph
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
    async fn test_neo4j_connect_and_health() {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config)
            .expect("Failed to create Neo4j client");
        assert!(client.health_check().await.unwrap());
    }

    #[tokio::test]
    #[ignore]
    async fn test_neo4j_run_query() {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config).unwrap();
        let rows = client.run("RETURN 42 AS answer").await.unwrap();
        assert_eq!(rows.len(), 1);
    }
}
