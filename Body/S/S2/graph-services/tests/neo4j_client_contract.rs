use epi_s2_graph_services::{Neo4jClient, Neo4jConfig};

#[test]
fn neo4j_config_defaults_to_local_docker_connection() {
    let config = Neo4jConfig::from_env();

    assert!(!config.uri.trim().is_empty());
    assert!(!config.user.trim().is_empty());
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_neo4j_client_connects_and_runs_query() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("Neo4j client should connect");

    assert!(client.health_check().await.expect("health check"));
    let rows = client.run("RETURN 42 AS answer").await.expect("query");
    let answer: i64 = rows[0].get("answer").expect("answer column");

    assert_eq!(answer, 42);
}
