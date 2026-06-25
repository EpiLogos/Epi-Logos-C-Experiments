use epi_s2_graph_schema::{
    label_spec, node_property_spec, relationship_spec, GraphPropertyCardinality,
    GraphPropertyDisclosure, GraphPropertyType, ARCHETYPAL_LABEL, SOURCE_ARTIFACT_SPAN_PROPERTY,
    WORLD_FORM_OF_RELATION, WORLD_LABEL, WORLD_ONTOLOGY_OF_RELATION,
};

#[test]
fn world_namespace_round_trip() {
    assert_eq!(WORLD_LABEL, "World");
    assert_eq!(ARCHETYPAL_LABEL, "Archetypal");
    assert_eq!(WORLD_FORM_OF_RELATION, "WORLD_FORM_OF");
    assert_eq!(WORLD_ONTOLOGY_OF_RELATION, "WORLD_ONTOLOGY_OF");

    for label in [WORLD_LABEL, ARCHETYPAL_LABEL] {
        let spec = label_spec(label).unwrap_or_else(|| panic!("{label} missing"));
        assert_eq!(spec.source_family, "world-entity");
        assert!(!spec.compatibility, "{label} must be canonical");
    }

    let form = relationship_spec(WORLD_FORM_OF_RELATION).unwrap();
    assert_eq!(form.coordinate_home, "C0..C5");
    assert_eq!(form.source_family, "world-entity");
    assert!(!form.compatibility);

    let ontology = relationship_spec(WORLD_ONTOLOGY_OF_RELATION).unwrap();
    assert_eq!(ontology.coordinate_home, "C4");
    assert_eq!(ontology.source_family, "world-entity");
    assert!(!ontology.compatibility);

    let span = node_property_spec(SOURCE_ARTIFACT_SPAN_PROPERTY).unwrap();
    assert_eq!(span.key, "c_1_source_artifact_span");
    assert_eq!(span.coordinate_home, "C1");
    assert_eq!(span.value_type, GraphPropertyType::StringList);
    assert_eq!(span.cardinality, GraphPropertyCardinality::Many);
    assert_eq!(span.disclosure, GraphPropertyDisclosure::Public);
    assert_eq!(span.source_family, "wikilink-span-pointer");
}
