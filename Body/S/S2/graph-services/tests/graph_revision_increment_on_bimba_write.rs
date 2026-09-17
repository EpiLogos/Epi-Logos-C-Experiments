//! CCT-16 (v) — `graph_revision` bumps monotonically on :Bimba writes so
//! the Redis cold-tier coordinate-lookup namespace flips atomically
//! (`cache:cold:s2:coordinate:lookup:rev:{graph_revision}:…`) without DEL
//! storms. Live-gated like the other Neo4j contract tests.

use epi_s2_graph_services::{meta, Neo4jClient, Neo4jConfig};

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_graph_revision_bump_is_monotonic() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("Neo4j client should connect");

    let first = meta::bump_graph_revision(&client).await.expect("first bump");
    let second = meta::bump_graph_revision(&client)
        .await
        .expect("second bump");
    assert_eq!(second, first + 1, "revision must be monotonic");

    let stored = meta::read_graph_meta(&client)
        .await
        .expect("meta readable")
        .expect("meta present after bump");
    assert_eq!(stored.graph_revision, second);
}
