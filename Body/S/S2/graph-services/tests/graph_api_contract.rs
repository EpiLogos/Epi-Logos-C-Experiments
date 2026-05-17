use epi_s2_graph_services::{
    schema, GraphMethodParams, GraphMethodService, GraphNodeRequest, GraphQueryRequest,
    GraphTraverseDirection, GraphTraverseRequest, Neo4jClient, Neo4jConfig,
};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

#[test]
fn graph_method_requests_are_s2_owned_and_parameterized() {
    let query = GraphQueryRequest {
        cypher: "MATCH (n:Bimba {coordinate: $coord}) RETURN n.coordinate AS coordinate".into(),
        params: GraphMethodParams::from_json(json!({ "coord": "S2" })).unwrap(),
    };
    assert_eq!(query.params.get_string("coord"), Some("S2"));

    let rejected = GraphQueryRequest {
        cypher: "MATCH (n:Bimba {coordinate: 'S2'}) RETURN n".into(),
        params: GraphMethodParams::default(),
    }
    .validate();
    assert!(rejected.unwrap_err().contains("parameterized"));

    let node = GraphNodeRequest {
        coordinate: "S2".into(),
    };
    assert_eq!(node.validate().unwrap(), "S2");

    let traverse = GraphTraverseRequest {
        from: "S2".into(),
        edge_types: vec!["POS5_INTEGRATES_INTO".into()],
        direction: GraphTraverseDirection::Both,
        depth: 9,
    };
    assert_eq!(traverse.bounded_depth(), 4);
}

#[test]
fn coordinate_resolution_handles_legacy_bimba_coordinates() {
    let resolved = GraphMethodService::resolve_coordinate_string("#2").unwrap();
    assert_eq!(resolved.input, "#2");
    assert_eq!(resolved.canonical, "M2");
    assert_eq!(resolved.compatibility_property.as_deref(), Some("bimbaCoordinate"));

    let resolved = GraphMethodService::resolve_coordinate_string("M4").unwrap();
    assert_eq!(resolved.canonical, "M4");
    assert!(resolved.compatibility_property.is_none());
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_graph_methods_write_read_traverse_and_cleanup_test_owned_data() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect to live Neo4j");
    schema::create_schema(&client).await.expect("create schema");
    let service = GraphMethodService::new(&client);
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let source = format!("Weave_S2_GRAPH_METHOD_TEST_{suffix}");
    let target = format!("Weave_S2_GRAPH_METHOD_TARGET_{suffix}");

    let create = format!(
        "MERGE (a:Bimba:EpiGraphMethodTest {{coordinate: '{source}'}})
         SET a.uuid = 'uuid:{source}',
             a.name = 'Graph method source',
             a.family = 'S',
             a.layer = 'S2',
             a.ql_position = 2,
             a.c_1_ct_type = 'CT1',
             a.c_4_artifact_role = 'test'
         MERGE (b:Bimba:EpiGraphMethodTest {{coordinate: '{target}'}})
         SET b.uuid = 'uuid:{target}',
             b.name = 'Graph method target',
             b.family = 'S',
             b.layer = 'S2',
             b.ql_position = 2,
             b.c_1_ct_type = 'CT1',
             b.c_4_artifact_role = 'test'
         MERGE (a)-[r:POS5_INTEGRATES_INTO]->(b)
         SET r.c_0_source_coordinate = a.coordinate,
             r.c_0_target_coordinate = b.coordinate,
             r.c_1_relation_family = 'position',
             r.c_2_relation_type = 'POS5_INTEGRATES_INTO'
         RETURN a.coordinate AS source"
    );
    client.run(&create).await.expect("create test graph");

    let node = service
        .node(GraphNodeRequest {
            coordinate: source.clone(),
        })
        .await
        .expect("node method");
    assert_eq!(node["node"]["coordinate"], source);

    let traversed = service
        .traverse(GraphTraverseRequest {
            from: source.clone(),
            edge_types: vec!["POS5_INTEGRATES_INTO".into()],
            direction: GraphTraverseDirection::Outbound,
            depth: 2,
        })
        .await
        .expect("traverse method");
    assert!(traversed["nodes"]
        .as_array()
        .unwrap()
        .iter()
        .any(|node| node["coordinate"] == target));

    let queried = service
        .query(GraphQueryRequest {
            cypher: "MATCH (n:Bimba {coordinate: $coord}) RETURN n.coordinate AS coordinate, n.name AS name".into(),
            params: GraphMethodParams::from_json(json!({ "coord": target })).unwrap(),
        })
        .await
        .expect("query method");
    assert_eq!(queried["rowCount"], 1);

    client
        .run(&format!(
            "MATCH (n:EpiGraphMethodTest)
             WHERE n.coordinate IN ['{source}', '{target}']
             DETACH DELETE n"
        ))
        .await
        .expect("cleanup test graph");
}
