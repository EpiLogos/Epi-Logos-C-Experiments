use epi_s2_graph_services::schema::{
    coordinate_node_property_specs, coordinate_relationship_property_specs, create_schema,
    validate_node_properties, validate_relationship_properties, CONSTRAINTS,
    GRAPHITI_ARC_ID_PROPERTY, INDEXES, KERNEL_RESONANCE_INDEX_PROPERTY, KERNEL_RESONANCE_LABEL,
    KERNEL_RESONANCE_RELATION, KERNEL_RESONANCE_SCORE_PROPERTY, KERNEL_TICK_PROPERTY,
    POINTER_COUNT_PROPERTY, POINTER_FAMILY_REFS_PROPERTY, POINTER_HARMONIC_ANCHOR_JSON_PROPERTY,
    POINTER_WEB_JSON_PROPERTY, RELATIONSHIP_INDEXES, SESSION_KEY_PROPERTY, VECTOR_INDEX,
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

    assert!(node_specs
        .iter()
        .any(|spec| spec.key == "c_0_source_coordinates"));
    assert!(node_specs.iter().any(|spec| spec.key == "c_1_ct_type"));
    assert!(node_specs.iter().any(|spec| spec.key == "coordinate"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == POINTER_WEB_JSON_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == POINTER_COUNT_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == POINTER_FAMILY_REFS_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(node_specs.iter().any(|spec| {
        spec.key == POINTER_HARMONIC_ANCHOR_JSON_PROPERTY && spec.coordinate_home == "S2.5"
    }));

    assert!(rel_specs.iter().any(|spec| spec.key == "c_2_relation_type"));
    assert!(rel_specs
        .iter()
        .any(|spec| spec.key == "c_0_source_coordinate"));
    assert!(rel_specs
        .iter()
        .any(|spec| spec.key == "c_0_target_coordinate"));

    assert!(node_specs
        .iter()
        .all(|spec| !spec.coordinate_home.is_empty()));
    assert!(node_specs
        .iter()
        .any(|spec| spec.coordinate_home.starts_with("S1")));
    assert!(node_specs
        .iter()
        .any(|spec| spec.coordinate_home.starts_with("S2")));
    assert!(rel_specs
        .iter()
        .all(|spec| !spec.coordinate_home.is_empty()));
}

#[test]
fn deep_bimba_regional_properties_are_registered_before_import() {
    let node_specs = coordinate_node_property_specs();

    for key in [
        "l_2_therapeutic_properties",
        "s_4_function_role",
        "t_5_next_evolution_phase",
        "q_1_theoretical_thesis",
        "m_5_lacanian_interface",
        "c_1_inversion_dynamics",
        "c_2_prime_attractor_logic",
        "c_2_prime_harmonic_function",
        "c_3_prime_stabilization",
        "c_5_prime_resonance",
    ] {
        assert!(
            node_specs.iter().any(|spec| spec.key == key),
            "{key} must be registered before deep Bimba Cypher can write it"
        );
    }
}

#[test]
fn kernel_resonance_observation_schema_is_coordinate_driven() {
    let node_specs = coordinate_node_property_specs();
    let rel_specs = coordinate_relationship_property_specs();

    assert_eq!(KERNEL_RESONANCE_LABEL, "KernelResonanceObservation");
    assert_eq!(KERNEL_RESONANCE_RELATION, "HAS_KERNEL_RESONANCE");
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == KERNEL_RESONANCE_INDEX_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == KERNEL_RESONANCE_SCORE_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == KERNEL_TICK_PROPERTY && spec.coordinate_home == "S0.5"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == SESSION_KEY_PROPERTY && spec.coordinate_home == "S3.0"));
    assert!(node_specs
        .iter()
        .any(|spec| spec.key == GRAPHITI_ARC_ID_PROPERTY && spec.coordinate_home == "S3.5"));
    assert!(rel_specs
        .iter()
        .any(|spec| spec.key == KERNEL_RESONANCE_INDEX_PROPERTY && spec.coordinate_home == "S2.5"));
    assert!(RELATIONSHIP_INDEXES
        .iter()
        .any(|cypher| cypher.contains(KERNEL_RESONANCE_RELATION)
            && cypher.contains(KERNEL_RESONANCE_INDEX_PROPERTY)));
}

#[test]
fn coordinate_property_validation_rejects_unregistered_graph_drift() {
    let valid_node = serde_json::json!({
        "coordinate": "S2",
        "c_0_source_coordinates": ["[[S2-SPEC]]"],
        "c_1_ct_type": "CT1"
    });
    assert!(validate_node_properties(valid_node.as_object().unwrap()).is_ok());

    let deprecated_node = serde_json::json!({
        "coordinate": "S2",
        "bimbaCoordinate": "#2"
    });
    let err = validate_node_properties(deprecated_node.as_object().unwrap()).unwrap_err();
    assert!(err.contains("bimbaCoordinate"));

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

    let valid_observation = serde_json::json!({
        "coordinate": "S2.kernel.resonance.agent-main.1779000001234.31",
        "c_1_name": "Kernel resonance 31",
        "c_5_kernel_resonance_index": 31,
        "c_5_kernel_resonance_score": 0.875,
        "c_5_kernel_tick": 9,
        "s_3_session_key": "agent:epii:main",
        "s_3_graphiti_arc_id": "day:20260517:session:agent:epii:main:namespace:pratibimba-test"
    });
    assert!(validate_node_properties(valid_observation.as_object().unwrap()).is_ok());

    let valid_pointer_web = serde_json::json!({
        "coordinate": "M2",
        "c_5_pointer_web_json": "{}",
        "c_5_pointer_count": 36,
        "c_5_pointer_family_refs": ["C2", "P2", "L2", "S2", "T2", "M2"]
    });
    assert!(validate_node_properties(valid_pointer_web.as_object().unwrap()).is_ok());

    let valid_regional_surface = serde_json::json!({
        "coordinate": "M5",
        "l_2_therapeutic_properties": ["diagnostic balance"],
        "s_4_function_role": "agent quick-view contributor",
        "t_5_next_evolution_phase": "pithy update loop",
        "q_1_theoretical_thesis": "QV is the compact surface of deep Bimba detail",
        "m_5_4_lacanian_interface": "public interface synthesis"
    });
    assert!(validate_node_properties(valid_regional_surface.as_object().unwrap()).is_ok());

    let invalid_prime_surface = serde_json::json!({
        "coordinate": "M5",
        "m_5_bad-characters": "not canonical",
        "m_2_prime_colour": "prime spelling must use i"
    });
    let err = validate_node_properties(invalid_prime_surface.as_object().unwrap()).unwrap_err();
    assert!(err.contains("m_5_bad-characters"));
    assert!(err.contains("m_2_prime_colour"));
}
