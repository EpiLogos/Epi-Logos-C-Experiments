use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};

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

#[tokio::test]
#[ignore]
async fn test_neo4j_create_and_delete_node() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();

    // Create
    client
        .run("CREATE (n:TestNode {name: 'integration_test'}) RETURN n")
        .await
        .unwrap();

    // Verify
    let rows = client
        .run("MATCH (n:TestNode {name: 'integration_test'}) RETURN n.name AS name")
        .await
        .unwrap();
    assert_eq!(rows.len(), 1);

    // Cleanup
    client
        .run("MATCH (n:TestNode {name: 'integration_test'}) DELETE n")
        .await
        .unwrap();

    let rows = client
        .run("MATCH (n:TestNode {name: 'integration_test'}) RETURN n")
        .await
        .unwrap();
    assert_eq!(rows.len(), 0);
}
