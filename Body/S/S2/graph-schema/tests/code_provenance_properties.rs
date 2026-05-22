use epi_s2_graph_schema::{node_property_spec, GraphPropertyType};

#[test]
fn registers_s_and_m_code_provenance_properties_for_agent_reasoning() {
    let expected = [
        ("s_0_repo_path", GraphPropertyType::String),
        ("s_0_repo_root", GraphPropertyType::String),
        ("s_0_file_kind", GraphPropertyType::String),
        ("s_0_component", GraphPropertyType::String),
        ("s_0_symbol_refs", GraphPropertyType::StringList),
        ("s_0_execution_flow_refs", GraphPropertyType::StringList),
        ("s_0_depends_on_paths", GraphPropertyType::StringList),
        ("s_0_owned_by_coordinate", GraphPropertyType::String),
        ("m_0_repo_path", GraphPropertyType::String),
        ("m_0_component", GraphPropertyType::String),
        ("m_0_symbol_refs", GraphPropertyType::StringList),
    ];

    for (key, value_type) in expected {
        let spec = node_property_spec(key).unwrap_or_else(|| panic!("{key} missing"));
        assert_eq!(spec.value_type, value_type, "{key} type");
        assert!(spec.indexed, "{key} should be queryable/indexed");
        assert!(!spec.compatibility, "{key} must be canonical");
    }
}
