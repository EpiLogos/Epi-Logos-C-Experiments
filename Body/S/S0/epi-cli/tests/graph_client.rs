use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use std::time::{SystemTime, UNIX_EPOCH};

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

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn test_live_neo4j_namespaces_isolate_bimba_legacy_and_gnosis() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let test_label = "EpiNamespaceIsolationTest";
    let canonical_coordinate = format!("S2_NAMESPACE_TEST_{suffix}");
    let legacy_coordinate = format!("#namespace-test-{suffix}");
    let gnostic_entity_id = format!("gnosis_namespace_test_{suffix}");

    let pre_bimba_count = count_label(&client, "Bimba").await;
    let pre_legacy_count = count_label(&client, "BimbaCoordinate").await;
    let pre_gnostic_count = count_label(&client, "gnostic").await;

    let cypher = format!(
        r#"
        MERGE (canonical:Bimba:{test_label} {{coordinate: '{canonical_coordinate}'}})
        SET canonical.name = 'Namespace isolation canonical Bimba test',
            canonical.embedding_dimensions = 3072,
            canonical.coordinate_family = 'S'
        MERGE (legacy:BimbaCoordinate:{test_label} {{bimbaCoordinate: '{legacy_coordinate}'}})
        SET legacy.name = 'Namespace isolation legacy BimbaCoordinate test',
            legacy.coordinateFamily = 'M'
        MERGE (gnosis:gnostic:{test_label} {{entity_id: '{gnostic_entity_id}'}})
        SET gnosis.entity_name = 'Namespace isolation Gnosis test',
            gnosis.bimba_coordinate = canonical.coordinate,
            gnosis.runtime_coordinate = 'S5',
            gnosis.storage_substrate = 'S2',
            gnosis.governance_owner = "S5'"
        MERGE (gnosis)-[:MAPS_TO_COORDINATE {{
            method: 'namespace-isolation-test',
            runtime_coordinate: 'S5',
            storage_substrate: 'S2'
        }}]->(canonical)
        MERGE (gnosis)-[:REFERENCES_LEGACY_COORDINATE {{
            method: 'namespace-isolation-test',
            compatibility_coordinate: 'M'
        }}]->(legacy)
        RETURN canonical.coordinate AS canonical_coordinate,
               legacy.bimbaCoordinate AS legacy_coordinate,
               gnosis.entity_id AS gnostic_entity_id
        "#
    );
    let rows = client.run(&cypher).await.unwrap();
    assert_eq!(rows.len(), 1);

    let canonical_rows = client
        .run(&format!(
            "MATCH (n:Bimba:{test_label} {{coordinate: '{canonical_coordinate}'}})
             RETURN n.embedding_dimensions AS dims, n.coordinate_family AS family"
        ))
        .await
        .unwrap();
    assert_eq!(canonical_rows.len(), 1);
    let dims: i64 = canonical_rows[0].get("dims").unwrap();
    let family: String = canonical_rows[0].get("family").unwrap();
    assert_eq!(dims, 3072);
    assert_eq!(family, "S");

    let legacy_rows = client
        .run(&format!(
            "MATCH (n:BimbaCoordinate:{test_label} {{bimbaCoordinate: '{legacy_coordinate}'}})
             RETURN n.coordinateFamily AS family"
        ))
        .await
        .unwrap();
    assert_eq!(legacy_rows.len(), 1);
    let family: String = legacy_rows[0].get("family").unwrap();
    assert_eq!(family, "M");

    let cross_namespace_rows = client
        .run(&format!(
            "MATCH (g:gnostic:{test_label} {{entity_id: '{gnostic_entity_id}'}})
             OPTIONAL MATCH (g)-[maps:MAPS_TO_COORDINATE]->(canonical:Bimba:{test_label})
             OPTIONAL MATCH (g)-[legacy:REFERENCES_LEGACY_COORDINATE]->(old:BimbaCoordinate:{test_label})
             RETURN labels(g) AS gnostic_labels,
                    g.runtime_coordinate AS runtime_coordinate,
                    g.storage_substrate AS storage_substrate,
                    g.governance_owner AS governance_owner,
                    canonical.coordinate AS canonical_coordinate,
                    old.bimbaCoordinate AS legacy_coordinate,
                    type(maps) AS maps_type,
                    type(legacy) AS legacy_type"
        ))
        .await
        .unwrap();
    assert_eq!(cross_namespace_rows.len(), 1);
    let gnostic_labels: Vec<String> = cross_namespace_rows[0].get("gnostic_labels").unwrap();
    let runtime_coordinate: String = cross_namespace_rows[0].get("runtime_coordinate").unwrap();
    let storage_substrate: String = cross_namespace_rows[0].get("storage_substrate").unwrap();
    let governance_owner: String = cross_namespace_rows[0].get("governance_owner").unwrap();
    let mapped_coordinate: String = cross_namespace_rows[0].get("canonical_coordinate").unwrap();
    let linked_legacy_coordinate: String =
        cross_namespace_rows[0].get("legacy_coordinate").unwrap();
    let maps_type: String = cross_namespace_rows[0].get("maps_type").unwrap();
    let legacy_type: String = cross_namespace_rows[0].get("legacy_type").unwrap();
    assert_eq!(runtime_coordinate, "S5");
    assert_eq!(storage_substrate, "S2");
    assert_eq!(governance_owner, "S5'");
    assert_eq!(mapped_coordinate, canonical_coordinate);
    assert_eq!(linked_legacy_coordinate, legacy_coordinate);
    assert_eq!(maps_type, "MAPS_TO_COORDINATE");
    assert_eq!(legacy_type, "REFERENCES_LEGACY_COORDINATE");
    assert!(gnostic_labels.iter().any(|label| label == "gnostic"));
    assert!(
        !gnostic_labels.iter().any(|label| label == "S5"),
        "coordinate ownership must be stored as a property, not a label: {gnostic_labels:?}"
    );

    let mixed_label_rows = client
        .run(&format!(
            "MATCH (mixed:{test_label})
             WHERE (mixed:Bimba AND mixed:gnostic)
                OR (mixed:BimbaCoordinate AND mixed:gnostic)
                OR (mixed:Bimba AND mixed:BimbaCoordinate)
             RETURN count(mixed) AS count"
        ))
        .await
        .unwrap();
    let mixed_count: i64 = mixed_label_rows[0].get("count").unwrap();
    assert_eq!(mixed_count, 0);

    client
        .run(&format!("MATCH (n:{test_label}) DETACH DELETE n"))
        .await
        .unwrap();

    assert_eq!(count_label(&client, "Bimba").await, pre_bimba_count);
    assert_eq!(
        count_label(&client, "BimbaCoordinate").await,
        pre_legacy_count
    );
    assert_eq!(count_label(&client, "gnostic").await, pre_gnostic_count);
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn test_live_neo4j_graphiti_temporal_episode_keeps_s3_architecture_and_s5_usage_clear() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).unwrap();
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let test_label = "EpiGraphitiTemporalTest";
    let day_id = "07-05-2026";
    let session_id = format!("graphiti_temporal_session_{suffix}");
    let episode_id = format!("graphiti_episode_{suffix}");
    let redis_key = format!("s3:gateway:temporal:session:{session_id}:now:md");

    let pre_episodic_count = count_label(&client, "Episodic").await;
    let pre_pratibimba_count = count_label(&client, "Pratibimba").await;

    let cypher = format!(
        r#"
        MERGE (day:Bimba:{test_label} {{coordinate: 'DAY-{day_id}-{suffix}'}})
        SET day.name = 'Temporal day anchor',
            day.coordinate_family = 'S3'
        MERGE (episode:Episodic:Pratibimba:{test_label} {{episode_id: '{episode_id}'}})
        SET episode.day_id = '{day_id}',
            episode.session_id = '{session_id}',
            episode.vault_now_path = '/vault/Empty/Present/{day_id}/{session_id}/now.md',
            episode.redis_context_key = '{redis_key}',
            episode.runtime_owner = "S3'",
            episode.invocation_owner = "S5/S5'",
            episode.storage_substrate = 'S2',
            episode.graphiti_adapter_mode = 'native-library-target',
            episode.coordinate = "S3.4'"
        MERGE (episode)-[:GROUNDED_IN_DAY {{
            runtime_owner: "S3'",
            invocation_owner: "S5/S5'"
        }}]->(day)
        RETURN episode.episode_id AS episode_id
        "#
    );
    let rows = client.run(&cypher).await.unwrap();
    assert_eq!(rows.len(), 1);

    let rows = client
        .run(&format!(
            "MATCH (episode:Episodic:Pratibimba:{test_label} {{episode_id: '{episode_id}'}})
             MATCH (episode)-[rel:GROUNDED_IN_DAY]->(day:Bimba:{test_label})
             RETURN labels(episode) AS labels,
                    episode.runtime_owner AS runtime_owner,
                    episode.invocation_owner AS invocation_owner,
                    episode.redis_context_key AS redis_context_key,
                    episode.storage_substrate AS storage_substrate,
                    rel.runtime_owner AS rel_runtime_owner,
                    rel.invocation_owner AS rel_invocation_owner,
                    day.coordinate_family AS day_family"
        ))
        .await
        .unwrap();
    assert_eq!(rows.len(), 1);

    let labels: Vec<String> = rows[0].get("labels").unwrap();
    let runtime_owner: String = rows[0].get("runtime_owner").unwrap();
    let invocation_owner: String = rows[0].get("invocation_owner").unwrap();
    let returned_redis_key: String = rows[0].get("redis_context_key").unwrap();
    let storage_substrate: String = rows[0].get("storage_substrate").unwrap();
    let rel_runtime_owner: String = rows[0].get("rel_runtime_owner").unwrap();
    let rel_invocation_owner: String = rows[0].get("rel_invocation_owner").unwrap();
    let day_family: String = rows[0].get("day_family").unwrap();

    assert!(labels.iter().any(|label| label == "Episodic"));
    assert!(labels.iter().any(|label| label == "Pratibimba"));
    assert!(
        !labels.iter().any(|label| label == "S3"),
        "Graphiti/S3 ownership must be a property, not a coordinate label: {labels:?}"
    );
    assert_eq!(runtime_owner, "S3'");
    assert_eq!(invocation_owner, "S5/S5'");
    assert_eq!(returned_redis_key, redis_key);
    assert_eq!(storage_substrate, "S2");
    assert_eq!(rel_runtime_owner, "S3'");
    assert_eq!(rel_invocation_owner, "S5/S5'");
    assert_eq!(day_family, "S3");

    client
        .run(&format!("MATCH (n:{test_label}) DETACH DELETE n"))
        .await
        .unwrap();

    assert_eq!(count_label(&client, "Episodic").await, pre_episodic_count);
    assert_eq!(
        count_label(&client, "Pratibimba").await,
        pre_pratibimba_count
    );
}

async fn count_label(client: &Neo4jClient, label: &str) -> i64 {
    let rows = client
        .run(&format!("MATCH (n:{label}) RETURN count(n) AS count"))
        .await
        .unwrap();
    rows[0].get("count").unwrap()
}
