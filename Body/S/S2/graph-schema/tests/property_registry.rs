use epi_s2_graph_schema::{
    canonical_node_property_keys, node_property_spec, property_spec, GraphPropertyCardinality,
    GraphPropertyType,
};

#[test]
fn canonical_promotion_properties_have_query_grade_specs() {
    for key in [
        "coordinate",
        "coordinate_prefix",
        "coordinate_depth",
        "coordinate_parent",
        "coordinate_axis",
        "vault_path",
        "artifact_kind",
        "content_hash",
        "title",
        "summary",
        "source_mtime",
        "sync_status",
        "sync_version",
        "last_promoted_at",
        "promotion_source",
        "relation_evidence_count",
    ] {
        let spec = node_property_spec(key).unwrap_or_else(|| panic!("{key} missing"));
        assert_eq!(spec.cardinality, GraphPropertyCardinality::One);
    }

    assert_eq!(
        node_property_spec("relation_evidence_count")
            .unwrap()
            .value_type,
        GraphPropertyType::Integer
    );
    assert!(node_property_spec("coordinate").unwrap().indexed);
    assert!(node_property_spec("coordinate_prefix").unwrap().indexed);
    assert!(canonical_node_property_keys().contains(&"vault_path"));
}

#[test]
fn unknown_technical_property_keys_are_rejected() {
    assert!(property_spec("bimbaCoordinate").is_err());
    assert!(property_spec("minimum_viable_graph_thing").is_err());
}
