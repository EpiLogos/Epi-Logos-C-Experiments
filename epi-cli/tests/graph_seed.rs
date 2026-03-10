use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use epi_logos::graph::embeddings::{EmbeddingConfig, GeminiEmbeddingClient};
use epi_logos::graph::schema;
use epi_logos::graph::seed;
use epi_logos::graph::semantic;

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
async fn test_seed_creates_expected_nodes() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();

    // Clean slate
    client.run("MATCH (n:Bimba) DETACH DELETE n").await.unwrap();

    // Schema + seed
    schema::create_schema(&client).await.unwrap();
    seed::seed_coordinate_space(&client).await.unwrap();

    // Count total nodes
    let rows = client
        .run("MATCH (n:Bimba) RETURN count(n) AS c")
        .await
        .unwrap();
    let count: i64 = rows[0].get("c").unwrap();
    assert_eq!(count, 102, "Expected the full 102-node seed, got {}", count);

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

    // Verify CF anchor invariant for the current topology rewrite:
    // only CF_FRACTAL anchors to #4.
    let anchors = client
        .run("MATCH (cf:Bimba {layer: 'CONTEXT_FRAME'})-[:ANCHORED_TO]->(p4) RETURN count(cf) AS c")
        .await
        .unwrap();
    let a_count: i64 = anchors[0].get("c").unwrap();
    assert_eq!(a_count, 1);

    // Verify inversions
    let inv = client
        .run("MATCH (:Bimba)-[:INVERTS_TO]->(:Bimba) RETURN count(*) AS c")
        .await
        .unwrap();
    let inv_count: i64 = inv[0].get("c").unwrap();
    assert_eq!(inv_count, 36); // 6 families x 6 positions

    client
        .run(
            r#"MATCH (n:Bimba {coordinate: '#4'})
               SET n.q_semantics = 'Context orchestrates the woven field',
                   n.q_priority = 'High surfacing value for context questions'"#,
        )
        .await
        .unwrap();

    let embedder = GeminiEmbeddingClient::new(EmbeddingConfig::from_env().unwrap());
    let _ = semantic::refresh_coordinate_embedding(
        &client,
        "P4",
        &embedder,
        semantic::EMBEDDING_VERSION,
    )
    .await
    .unwrap();
    let refreshed = semantic::refresh_coordinate_embedding(
        &client,
        "#4",
        &embedder,
        semantic::EMBEDDING_VERSION,
    )
    .await
    .unwrap();
    assert_eq!(refreshed.coordinate, "#4");
    assert!(!refreshed.source_hash.is_empty());

    let rows = client
        .run(
            "MATCH (n:Bimba {coordinate: '#4'})
             RETURN n.semantic_document AS semantic_document,
                    n.semantic_source_hash AS semantic_source_hash,
                    n.semantic_embedding_version AS semantic_embedding_version,
                    size(n.semantic_embedding) AS embedding_size",
        )
        .await
        .unwrap();
    let semantic_document: String = rows[0].get("semantic_document").unwrap();
    let semantic_source_hash: String = rows[0].get("semantic_source_hash").unwrap();
    let semantic_embedding_version: String = rows[0].get("semantic_embedding_version").unwrap();
    let embedding_size: i64 = rows[0].get("embedding_size").unwrap();
    assert!(semantic_document.contains("q_priority"));
    assert_eq!(semantic_source_hash, refreshed.source_hash);
    assert_eq!(semantic_embedding_version, semantic::EMBEDDING_VERSION);
    assert!(embedding_size > 0);

    client
        .run(
            r#"MATCH (n:Bimba {coordinate: 'P4'})
               SET n.q_priority = 'Updated surfacing bias after semantic change'"#,
        )
        .await
        .unwrap();
    let stale = semantic::find_stale_nodes(&client, semantic::EMBEDDING_VERSION)
        .await
        .unwrap();
    assert!(stale.contains(&"P4".to_string()));
    let expanded = semantic::find_stale_nodes_with_dependents(&client, semantic::EMBEDDING_VERSION)
        .await
        .unwrap();
    assert!(expanded.contains(&"P4".to_string()));
    assert!(expanded.contains(&"#4".to_string()));

    // Cleanup
    client.run("MATCH (n:Bimba) DETACH DELETE n").await.unwrap();
}
