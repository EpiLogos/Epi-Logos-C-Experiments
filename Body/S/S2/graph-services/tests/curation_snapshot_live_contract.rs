//! Exercises the real S2 Neo4j reader that feeds S5 Q-review night passes.
//! No graph mutation occurs; the test is explicitly live-gated like the
//! neighboring Neo4j contracts.

use epi_s2_graph_services::{
    read_bimba_curation_snapshot, read_graph_meta, Neo4jClient, Neo4jConfig,
};

#[tokio::test]
#[ignore] // requires the local Neo4j corpus: `epi graph doctor` must report graph.ok=true
async fn live_curation_snapshot_contains_only_embedding_complete_bimba_nodes() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");
    let snapshot = read_bimba_curation_snapshot(&client)
        .await
        .expect("read live Bimba curation snapshot");
    let meta = read_graph_meta(&client)
        .await
        .expect("read graph metadata")
        .expect("graph metadata exists");

    assert!(
        !snapshot.nodes.is_empty(),
        "live snapshot must not be empty"
    );
    assert_eq!(snapshot.graph_revision, meta.graph_revision as u64);
    assert!(snapshot
        .nodes
        .iter()
        .all(|node| node.embedding_3072.len() == 3072));
    assert!(snapshot.nodes.iter().all(|node| node.namespace == "bimba"));
}
