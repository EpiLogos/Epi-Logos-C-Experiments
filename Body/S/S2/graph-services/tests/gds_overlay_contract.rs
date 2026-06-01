use epi_s2_graph_services::{
    blocked_overlay_payload, option1_projection_plan, GdsOverlayRequest, GraphMethodService,
    Neo4jClient, Neo4jConfig, GDS_EXCLUDED_LABELS, GDS_OPTION1_PROJECTION_NAME,
};

#[test]
fn option1_projection_policy_is_public_bimba_only_and_does_not_write_canonical_graph() {
    let plan = option1_projection_plan();

    assert_eq!(plan.projection_name, GDS_OPTION1_PROJECTION_NAME);
    assert_eq!(plan.included_labels, vec!["Bimba"]);
    assert!(plan.relationship_types.iter().any(|rel| rel == "CONTAINS"));
    assert!(plan.relationship_types.iter().any(|rel| rel == "PART_OF"));
    assert!(plan
        .excluded_labels
        .iter()
        .any(|label| label == "GraphitiEpisode"));
    assert!(plan.excluded_labels.iter().any(|label| label == "NaraBody"));
    assert!(
        GDS_EXCLUDED_LABELS.iter().all(|label| !plan
            .included_labels
            .iter()
            .any(|included| included == label)),
        "protected-local labels must never enter the public Option 1 projection"
    );

    let write_words = [" MERGE ", " CREATE ", " SET ", " DELETE "];
    let upper = format!(" {} ", plan.project_cypher.to_ascii_uppercase());
    for word in write_words {
        assert!(
            !upper.contains(word),
            "GDS projection plan must not create canonical graph data with {word}: {upper}"
        );
    }
}

#[test]
fn blocked_overlay_payload_is_explicitly_derived_and_empty_when_gds_is_absent() {
    let payload = blocked_overlay_payload("M0", "gds unavailable");

    assert_eq!(payload.coordinate, "M0");
    assert_eq!(payload.status, "blocked");
    assert!(!payload.gds_ready);
    assert!(!payload.canonical_write_performed);
    assert!(payload.derived_nodes.is_empty());
    assert!(payload
        .algorithms
        .iter()
        .all(|algorithm| !algorithm.writes_canonical_graph));
    assert!(payload
        .excluded_labels
        .iter()
        .any(|label| label == "PrivateProjection"));
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_gds_overlay_reports_blocked_in_apoc_only_local_topology() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");
    let service = GraphMethodService::new(&client);

    let payload = service
        .gds_tangent_overlay(GdsOverlayRequest {
            coordinate: "M0".to_owned(),
            top_k: 6,
        })
        .await
        .expect("gds overlay payload");

    assert_eq!(payload["coordinate"], "M0");
    assert_eq!(payload["status"], "blocked");
    assert_eq!(payload["gdsReady"], false);
    assert_eq!(payload["canonicalWritePerformed"], false);
    assert_eq!(payload["derivedNodes"].as_array().unwrap().len(), 0);
    assert!(payload["reason"]
        .as_str()
        .unwrap()
        .contains("GDS procedures are unavailable"));
}
