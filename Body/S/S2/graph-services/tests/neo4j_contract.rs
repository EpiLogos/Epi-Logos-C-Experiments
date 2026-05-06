use epi_s2_graph_services::Neo4jGraphRole;

#[test]
fn neo4j_graph_role_uses_s2_bimba_schema_authority() {
    let role = Neo4jGraphRole::primary_bimba();

    assert_eq!(role.coordinate_owner, "S2");
    assert_eq!(role.graph_id, epi_s2_graph_schema::GRAPH_ID);
    assert_eq!(role.node_label, "Bimba");
    assert_eq!(role.coordinate_property, "coordinate");
    assert_eq!(role.semantic_embedding_dimensions, 3072);
    assert_eq!(role.vector_index_name, "coord_embedding");
    assert!(role.compatibility_labels.contains(&"BimbaNode"));
    assert!(role.compatibility_properties.contains(&"bimbaCoordinate"));
    assert!(!role.compatibility_labels.contains(&"Bimba"));
}
