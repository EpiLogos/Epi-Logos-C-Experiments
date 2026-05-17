use epi_s2_graph_services::schema::{
    create_schema, coordinate_node_property_specs, coordinate_relationship_property_specs,
    validate_node_properties, validate_relationship_properties, CONSTRAINTS, INDEXES,
    RELATIONSHIP_INDEXES, VECTOR_INDEX,
};

#[test]
fn schema_creation_entrypoint_and_cypher_are_s2_owned() {
    let function_name = std::any::type_name_of_val(&create_schema);

    assert!(function_name.contains("epi_s2_graph_services"));
    assert_eq!(CONSTRAINTS.len(), 2);
    assert!(INDEXES.len() >= 5);
    assert!(!RELATIONSHIP_INDEXES.is_empty());
    assert!(VECTOR_INDEX.contains("FOR (n:Bimba)"));
    assert!(VECTOR_INDEX.contains("3072"));
}

#[test]
fn coordinate_property_registry_covers_nodes_and_relationships() {
    let node_specs = coordinate_node_property_specs();
    let rel_specs = coordinate_relationship_property_specs();

    assert!(node_specs.iter().any(|spec| spec.key == "c_0_source_coordinates"));
    assert!(node_specs.iter().any(|spec| spec.key == "c_1_ct_type"));
    assert!(node_specs.iter().any(|spec| spec.key == "coordinate"));

    assert!(rel_specs.iter().any(|spec| spec.key == "c_2_relation_type"));
    assert!(rel_specs.iter().any(|spec| spec.key == "c_0_source_coordinate"));
    assert!(rel_specs.iter().any(|spec| spec.key == "c_0_target_coordinate"));

    assert!(node_specs.iter().all(|spec| !spec.coordinate_home.is_empty()));
    assert!(node_specs.iter().any(|spec| spec.coordinate_home.starts_with("S1")));
    assert!(node_specs.iter().any(|spec| spec.coordinate_home.starts_with("S2")));
    assert!(rel_specs.iter().all(|spec| !spec.coordinate_home.is_empty()));
}

#[test]
fn coordinate_property_validation_rejects_unregistered_graph_drift() {
    let valid_node = serde_json::json!({
        "coordinate": "S2",
        "c_0_source_coordinates": ["[[S2-SPEC]]"],
        "c_1_ct_type": "CT1",
        "bimbaCoordinate": "#2"
    });
    assert!(validate_node_properties(valid_node.as_object().unwrap()).is_ok());

    let invalid_node = serde_json::json!({
        "coordinate": "S2",
        "randomAdHocProperty": "drift"
    });
    let err = validate_node_properties(invalid_node.as_object().unwrap()).unwrap_err();
    assert!(err.contains("randomAdHocProperty"));

    let invalid_rel = serde_json::json!({
        "c_2_relation_type": "RELATES_TO",
        "uncoordinated": true
    });
    let err = validate_relationship_properties(invalid_rel.as_object().unwrap()).unwrap_err();
    assert!(err.contains("uncoordinated"));
}
