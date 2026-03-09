use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use epi_logos::graph::schema;
use epi_logos::graph::seed;

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
async fn test_seed_creates_expected_nodes() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();

    // Clean slate
    client
        .run("MATCH (n:Bimba) DETACH DELETE n")
        .await
        .unwrap();

    // Schema + seed
    schema::create_schema(&client).await.unwrap();
    seed::seed_coordinate_space(&client).await.unwrap();

    // Count total nodes
    let rows = client
        .run("MATCH (n:Bimba) RETURN count(n) AS c")
        .await
        .unwrap();
    let count: i64 = rows[0].get("c").unwrap();
    assert!(count >= 90, "Expected ~96 nodes, got {}", count);

    // Verify # node
    let hash = client
        .run("MATCH (n:Bimba {coordinate: '#'}) RETURN n.name AS name")
        .await
        .unwrap();
    assert_eq!(hash.len(), 1);

    // Verify psychoids
    let psychoids = client
        .run("MATCH (n:Bimba {layer: 'PSYCHOID'}) RETURN count(n) AS c")
        .await
        .unwrap();
    let p_count: i64 = psychoids[0].get("c").unwrap();
    assert_eq!(p_count, 7); // # + #0-#5

    // Verify CF anchor invariant
    let anchors = client
        .run("MATCH (cf:Bimba {layer: 'CONTEXT_FRAME'})-[:ANCHORED_TO]->(p4) RETURN count(cf) AS c")
        .await
        .unwrap();
    let a_count: i64 = anchors[0].get("c").unwrap();
    assert_eq!(a_count, 7);

    // Verify inversions
    let inv = client
        .run("MATCH ()-[:INVERTS_TO]->() RETURN count(*) AS c")
        .await
        .unwrap();
    let inv_count: i64 = inv[0].get("c").unwrap();
    assert_eq!(inv_count, 36); // 6 families x 6 positions

    // Cleanup
    client
        .run("MATCH (n:Bimba) DETACH DELETE n")
        .await
        .unwrap();
}
