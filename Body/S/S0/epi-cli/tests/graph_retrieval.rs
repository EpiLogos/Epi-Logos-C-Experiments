use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use epi_logos::graph::retrieval::coordinate::CoordinateRetrieval;
use epi_logos::graph::retrieval::graphrag::{DisclosureLevel, GraphRAGRetriever};
use epi_logos::graph::schema;
use epi_logos::graph::seed;
use epi_logos::graph::semantic;

/// Helper: connect, clean, schema, seed — returns client for tests.
async fn setup() -> Neo4jClient {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect failed");
    client.run("MATCH (n:Bimba) DETACH DELETE n").await.unwrap();
    schema::create_schema(&client).await.unwrap();
    seed::seed_coordinate_space(&client).await.unwrap();
    client
}

/// Helper: remove all Bimba nodes.
async fn teardown(client: &Neo4jClient) {
    client.run("MATCH (n:Bimba) DETACH DELETE n").await.unwrap();
}

// ---------------------------------------------------------------------------
// All retrieval tests in a single function to avoid parallel data clobbering
// ---------------------------------------------------------------------------

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
async fn test_retrieval_suite() {
    let client = setup().await;

    // -- Task 13: Coordinate Retrieval --

    // Single coordinate lookup
    let cr = CoordinateRetrieval::new(&client);
    let results = cr.query_by_coordinate("#4").await.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0]["coordinate"], "#4");
    assert_eq!(results[0]["name"], "Context");
    assert_eq!(results[0]["layer"], "PSYCHOID");

    // Multi-coordinate lookup
    let results = cr.query_multi(&["P3", "M4'"]).await.unwrap();
    assert_eq!(results.len(), 2, "Expected 2 results for P3 + M4'");
    let coords: Vec<&str> = results
        .iter()
        .map(|r| r["coordinate"].as_str().unwrap())
        .collect();
    assert!(coords.contains(&"P3"));
    assert!(coords.contains(&"M4'"));

    // Context query
    let ctx = cr.query_context("#4", 1).await.unwrap();
    assert_eq!(ctx["center"], "#4");
    assert_eq!(ctx["depth"], 1);
    let count = ctx["neighbor_count"].as_u64().unwrap();
    assert!(count > 0, "Expected neighbors for #4, got 0");

    // Family query
    let results = cr.query_by_family("M").await.unwrap();
    assert!(
        results.len() >= 6,
        "Expected >=6 M-family coords, got {}",
        results.len()
    );
    for r in &results {
        assert_eq!(r["family"], "M");
    }
    assert!(cr.query_by_family("Z").await.is_err());

    // -- Task 15: Progressive Disclosure --

    let gr = GraphRAGRetriever::new(&client);

    // Level 0 — UuidOnly
    let r0 = gr
        .progressive_disclosure("#4", DisclosureLevel::UuidOnly)
        .await
        .unwrap();
    assert_eq!(r0["coordinate"], "#4");
    assert!(r0["uuid"].as_str().is_some());
    assert_eq!(r0["disclosure_level"], 0);
    assert!(r0.get("name").is_none());

    // Level 1 — Identity
    let r1 = gr
        .progressive_disclosure("#4", DisclosureLevel::Identity)
        .await
        .unwrap();
    assert_eq!(r1["disclosure_level"], 1);
    assert!(r1["name"].as_str().is_some());
    assert!(r1["family"].as_str().is_some());
    assert!(r1.get("s0_pithy").is_none());

    // Level 2 — Summary
    let r2 = gr
        .progressive_disclosure("#4", DisclosureLevel::Summary)
        .await
        .unwrap();
    assert_eq!(r2["disclosure_level"], 2);
    assert!(r2.get("layer").is_some());

    // Level 3 — Content
    let r3 = gr
        .progressive_disclosure("#4", DisclosureLevel::Content)
        .await
        .unwrap();
    assert_eq!(r3["disclosure_level"], 3);
    assert!(r3.get("topo_mode").is_some());

    // Level 4 — Connected
    let r4 = gr
        .progressive_disclosure("#4", DisclosureLevel::Connected)
        .await
        .unwrap();
    assert_eq!(r4["disclosure_level"], 4);
    assert!(r4.get("relationships_out").is_some());

    // Level 5 — Complete
    let r5 = gr
        .progressive_disclosure("#4", DisclosureLevel::Complete)
        .await
        .unwrap();
    assert_eq!(r5["disclosure_level"], 5);
    assert!(r5.get("relationships_out").is_some());
    assert!(r5.get("relationships_in").is_some());

    // Non-existent coordinate should error
    assert!(gr
        .progressive_disclosure("#9", DisclosureLevel::UuidOnly)
        .await
        .is_err());

    client
        .run(
            r#"MATCH (n:Bimba {coordinate: '#4'})
               SET n.q_semantics = 'Context as the semantic center of the weave',
                   n.q_surface_bias = 'Prefer surfacing for context questions',
                   n.extra_detail = 'should not be embedded by default',
                   n.q_dynamic = 'No allowlist, every q_ key counts',
                   n.c_1_description = 'Context organizes relation-aware retrieval',
                   n.c_0_essence = 'The center of disclosed context',
                   n.c_5_embedding = [0.1, 0.2, 0.3]"#,
        )
        .await
        .unwrap();

    let doc = semantic::build_semantic_document(&client, "#4")
        .await
        .unwrap();
    assert_eq!(doc.coordinate, "#4");
    assert!(doc.text.contains("coordinate: #4"));
    assert!(doc
        .text
        .contains("q_dynamic: No allowlist, every q_ key counts"));
    assert!(doc
        .text
        .contains("q_surface_bias: Prefer surfacing for context questions"));
    assert!(!doc.text.contains("extra_detail"));
    assert!(doc.text.contains("MANIFESTS"));
    assert!(!doc.source_hash.is_empty());

    let stale = semantic::find_stale_nodes(&client, semantic::EMBEDDING_VERSION)
        .await
        .unwrap();
    assert!(stale.contains(&"#4".to_string()));

    let rows = client
        .run(
            "MATCH (n:Bimba {coordinate: 'C1'})-[:BEDROCK]->(root)<-[:BEDROCK]-(peer:Bimba) \
             RETURN DISTINCT peer.coordinate AS coord \
             ORDER BY coord",
        )
        .await
        .unwrap();

    let coords: Vec<String> = rows
        .iter()
        .filter_map(|row| row.get::<String>("coord").ok())
        .collect();

    assert!(!coords.contains(&"C1".to_string()));
    assert!(coords.contains(&"P1".to_string()));
    assert!(coords.contains(&"M1".to_string()));

    teardown(&client).await;
}
