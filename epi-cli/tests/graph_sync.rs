use epi_logos::graph::bidirectional_sync::ConflictResolution;
use epi_logos::graph::parse_yaml_frontmatter;

#[test]
fn test_parse_yaml_frontmatter_basic() {
    let content = "---\ncoordinate: \"M5\"\nname: \"Epii\"\n---\n\n# Body\n";
    let fm = parse_yaml_frontmatter(content).unwrap();
    assert_eq!(fm.get("coordinate").and_then(|v| v.as_str()), Some("M5"));
}

#[test]
fn test_parse_yaml_frontmatter_missing() {
    let content = "# No frontmatter here";
    assert!(parse_yaml_frontmatter(content).is_none());
}

#[test]
fn test_conflict_resolution_strategies() {
    assert!(matches!(
        ConflictResolution::from_str("vault-wins"),
        ConflictResolution::VaultWins
    ));
    assert!(matches!(
        ConflictResolution::from_str("graph-wins"),
        ConflictResolution::GraphWins
    ));
    assert!(matches!(
        ConflictResolution::from_str("most-recent"),
        ConflictResolution::MostRecent
    ));
    assert!(matches!(
        ConflictResolution::from_str("manual"),
        ConflictResolution::Manual
    ));
    assert!(matches!(
        ConflictResolution::from_str("merge"),
        ConflictResolution::Merge
    ));
    assert!(matches!(
        ConflictResolution::from_str("anything-else"),
        ConflictResolution::Skip
    ));
}

#[tokio::test]
#[ignore] // requires Neo4j: docker compose -f docker-compose.epi-s2.yml up -d
async fn test_sync_from_frontmatter() {
    use std::io::Write;

    // Create a temp file with frontmatter
    let tmp_dir = std::env::temp_dir();
    let path = tmp_dir.join("epi_test_sync_note.md");
    {
        let mut f = std::fs::File::create(&path).expect("create temp file");
        write!(
            f,
            "---\ncoordinate: \"M5\"\nname: \"Epii\"\nfamily: \"M\"\nql_position: 5\n---\n\n# M5 Epii\n\nHolographic integration.\n"
        )
        .expect("write temp file");
    }

    let path = path.to_string_lossy().to_string();
    let content = std::fs::read_to_string(&path).expect("read temp file");

    let frontmatter = parse_yaml_frontmatter(&content).expect("parse frontmatter");

    let config = epi_logos::graph::client::Neo4jConfig::from_env();
    let neo4j = epi_logos::graph::client::Neo4jClient::connect(&config).expect("connect to Neo4j");

    let coordinator = epi_logos::graph::sync_coordinator::SyncCoordinator::new(&neo4j);
    let result = coordinator
        .sync_from_vault(&path, &frontmatter, &content)
        .await
        .expect("sync should succeed");

    assert_eq!(result.coordinate, "M5");
    assert_eq!(result.vault_path, path);

    // Verify node exists in graph
    let rows = neo4j
        .run("MATCH (n:Bimba {coordinate: 'M5'}) RETURN n.name AS name")
        .await
        .expect("query should succeed");
    assert!(!rows.is_empty(), "M5 node should exist after sync");
}
