pub use epi_s2_graph_services::{Neo4jClient, Neo4jConfig};

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
    async fn test_neo4j_connect_and_health() {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config).expect("Failed to create Neo4j client");
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
