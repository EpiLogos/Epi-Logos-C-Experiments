use epi_s2_graph_services::seed::{
    coord_uuid, seed_baseline_coordinates, seed_baseline_snapshot_queries, seed_coordinate_space,
    seed_relationship_types,
};
use epi_s2_graph_services::{
    schema, GraphMethodService, GraphNodeRequest, Neo4jClient, Neo4jConfig,
};
use neo4rs::query;

#[test]
fn coordinate_uuid_generation_is_deterministic_s2_seed_law() {
    assert_eq!(coord_uuid("#4"), coord_uuid("#4"));
    assert_ne!(coord_uuid("#4"), coord_uuid("M4"));
    assert_eq!(coord_uuid("#4").len(), 36);
}

#[test]
fn coordinate_seed_entrypoint_is_owned_by_s2_graph_services() {
    let function_name = std::any::type_name_of_val(&seed_coordinate_space);

    assert!(function_name.contains("epi_s2_graph_services"));
}

#[test]
fn seed_baseline_query_set_covers_m_prime_smoke_consumers() {
    let coordinates = seed_baseline_coordinates();

    assert_eq!(coordinates.len(), 102);
    assert!(coordinates.contains(&"#".to_string()));
    assert!(coordinates.contains(&"#4".to_string()));
    assert!(coordinates.contains(&"M0".to_string()));
    assert!(coordinates.contains(&"M1'".to_string()));
    assert!(coordinates.contains(&"M5".to_string()));
    assert!(coordinates.contains(&"CF_FRACTAL".to_string()));
    assert!(coordinates.contains(&"CPF".to_string()));
    assert!(seed_relationship_types().contains(&"FAMILY_CONTAINS"));

    let queries = seed_baseline_snapshot_queries();
    assert_eq!(queries.len(), 3);
    assert!(queries
        .iter()
        .any(|query| query.name == "seed_node_group_counts"
            && query.cypher.contains("family_meta_nodes")
            && query.cypher.contains("vak_nodes")));
    assert!(queries
        .iter()
        .any(|query| query.name == "m_prime_smoke_nodes"
            && query.cypher.contains("M0")
            && query.cypher.contains("M1")
            && query.cypher.contains("M5")));
}

#[tokio::test]
#[ignore] // requires live Neo4j: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_seed_baseline_is_idempotent_and_queryable_by_coordinate_api() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect to live Neo4j");
    schema::create_schema(&client).await.expect("create schema");

    seed_coordinate_space(&client)
        .await
        .expect("first seed pass");
    let first = read_seed_counts(&client).await;

    seed_coordinate_space(&client)
        .await
        .expect("second seed pass");
    let second = read_seed_counts(&client).await;

    assert_eq!(first.seed_nodes, 102);
    assert_eq!(first.root_nodes, 1);
    assert_eq!(first.psychoids, 6);
    assert_eq!(first.weaves, 4);
    assert_eq!(first.context_frames, 7);
    assert_eq!(first.family_meta_nodes, 6);
    assert_eq!(first.family_coordinates, 72);
    assert_eq!(first.vak_nodes, 6);
    assert_eq!(first, second);

    let rel_count = read_seed_relationship_count(&client).await;
    assert!(
        rel_count >= 306,
        "expected at least the canonical 306 seed relationships, got {rel_count}"
    );

    let service = GraphMethodService::new(&client);
    let root = service
        .node(GraphNodeRequest {
            coordinate: "#".into(),
        })
        .await
        .expect("root node lookup");
    assert_eq!(root["resolution"]["canonical"], "#");
    assert_eq!(root["node"]["coordinate"], "#");
    assert!(root["relations"].as_array().unwrap().len() >= 8);

    let legacy_m4 = service
        .node(GraphNodeRequest {
            coordinate: "#4".into(),
        })
        .await
        .expect("#4 compatibility lookup");
    assert_eq!(legacy_m4["resolution"]["canonical"], "M4");
    assert_eq!(legacy_m4["node"]["coordinate"], "M4");
    assert!(!legacy_m4["relations"].as_array().unwrap().is_empty());

    for coordinate in ["M0", "M2", "M4", "M5", "CF_FRACTAL", "CPF"] {
        let node = service
            .node(GraphNodeRequest {
                coordinate: coordinate.into(),
            })
            .await
            .unwrap_or_else(|err| panic!("{coordinate} lookup failed: {err}"));
        assert_eq!(node["node"]["coordinate"], coordinate);
        assert!(
            !node["relations"].as_array().unwrap().is_empty(),
            "{coordinate} should expose real seeded relations"
        );
    }

    let stale_vak = client
        .run_query(
            query(
                "MATCH (n:Bimba:Vak)
                 WHERE n.coordinate IN $coords
                 RETURN count(n) AS stale",
            )
            .param(
                "coords",
                ["CPF", "CT", "CP", "CF", "CFP", "CS"]
                    .iter()
                    .map(|coord| (*coord).to_string())
                    .collect::<Vec<_>>(),
            ),
        )
        .await
        .expect("read stale VAK labels");
    assert_eq!(
        stale_vak
            .first()
            .and_then(|row| row.get::<i64>("stale").ok()),
        Some(0)
    );
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct SeedCounts {
    seed_nodes: i64,
    root_nodes: i64,
    psychoids: i64,
    weaves: i64,
    context_frames: i64,
    family_meta_nodes: i64,
    family_coordinates: i64,
    vak_nodes: i64,
}

async fn read_seed_counts(client: &Neo4jClient) -> SeedCounts {
    let query_set = seed_baseline_snapshot_queries();
    let counts_query = query_set
        .iter()
        .find(|query| query.name == "seed_node_group_counts")
        .expect("seed count query");
    let rows = client
        .run_query(query(counts_query.cypher).param("coordinates", seed_baseline_coordinates()))
        .await
        .expect("read seed counts");
    let row = rows.first().expect("seed count row");
    SeedCounts {
        seed_nodes: row.get("seed_nodes").unwrap_or_default(),
        root_nodes: row.get("root_nodes").unwrap_or_default(),
        psychoids: row.get("psychoids").unwrap_or_default(),
        weaves: row.get("weaves").unwrap_or_default(),
        context_frames: row.get("context_frames").unwrap_or_default(),
        family_meta_nodes: row.get("family_meta_nodes").unwrap_or_default(),
        family_coordinates: row.get("family_coordinates").unwrap_or_default(),
        vak_nodes: row.get("vak_nodes").unwrap_or_default(),
    }
}

async fn read_seed_relationship_count(client: &Neo4jClient) -> i64 {
    let query_set = seed_baseline_snapshot_queries();
    let rel_query = query_set
        .iter()
        .find(|query| query.name == "seed_relationship_count")
        .expect("seed relationship query");
    let rows = client
        .run_query(
            query(rel_query.cypher)
                .param("coordinates", seed_baseline_coordinates())
                .param(
                    "relationship_types",
                    seed_relationship_types()
                        .iter()
                        .map(|rel_type| (*rel_type).to_string())
                        .collect::<Vec<_>>(),
                ),
        )
        .await
        .expect("read seed relationship count");
    rows.first()
        .and_then(|row| row.get::<i64>("seed_relationships").ok())
        .unwrap_or_default()
}
