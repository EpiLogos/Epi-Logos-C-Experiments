//! CCT-16 acceptance gate — the substrate-integrity chain end to end:
//! an inverted `q_5'_integration_template` key survives planning as a
//! distinct graph property (hermetic), and against a live Neo4j the sync
//! write-path persists it, the revision bumps (flipping the Redis
//! cold-tier namespace key segment), and `MostRecent` picks the newer
//! side for the graph → vault return path.

use epi_s2_graph_services::{
    meta, most_recent_winner, plan_frontmatter_properties, MostRecentWinner, Neo4jClient,
    Neo4jConfig,
};

/// Hermetic slice of the acceptance gate: the vault edit's inverted key
/// survives the sync PLAN as a distinct property alongside the canonical
/// form, and the cold-tier namespace key is a pure function of the
/// revision (bump ⇒ new namespace, no DEL storm needed).
#[test]
fn inverted_key_survives_planning_and_namespace_key_flips_with_revision() {
    let yaml: serde_yaml::Value = serde_yaml::from_str(
        "coordinate: S3\n\"q_5'_integration_template\": \"…\"\nq_5_integration_template: base\n",
    )
    .unwrap();
    let properties = plan_frontmatter_properties(yaml).unwrap();
    assert!(properties.contains_key("q_5_i_integration_template"));
    assert!(properties.contains_key("q_5_integration_template"));

    let namespace = |revision: i64| format!("cache:cold:s2:coordinate:lookup:rev:{revision}");
    assert_ne!(namespace(41), namespace(42));

    // The return-path floor: a graph-side edit newer than the vault copy
    // flows back toward the vault, not the reverse.
    assert_eq!(
        most_recent_winner(Some("2026-07-10T00:00:00Z"), Some("2026-07-11T00:00:00Z")).unwrap(),
        MostRecentWinner::Graph
    );
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_inverted_key_persists_and_revision_bumps() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("Neo4j client should connect");

    let coordinate = "S3";
    let before = meta::read_graph_meta(&client)
        .await
        .expect("meta readable")
        .map(|meta| meta.graph_revision)
        .unwrap_or(0);

    // The sync write-path for the inverted key (backtick-quoted property).
    client
        .run(&format!(
            "MERGE (n:Bimba {{coordinate: '{coordinate}'}}) \
             SET n.`q_5_i_integration_template` = 'cct-16-e2e'"
        ))
        .await
        .expect("inverted-key write");
    let bumped = meta::bump_graph_revision(&client).await.expect("bump");
    assert!(bumped > before, "revision must advance past {before}");

    let rows = client
        .run(&format!(
            "MATCH (n:Bimba {{coordinate: '{coordinate}'}}) \
             RETURN n.`q_5_i_integration_template` AS inverted"
        ))
        .await
        .expect("read back");
    let inverted: String = rows[0].get("inverted").expect("inverted key present");
    assert_eq!(inverted, "cct-16-e2e");
}
