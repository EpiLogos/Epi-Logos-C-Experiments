use epi_s2_graph_schema::{
    compatibility_labels, label_spec, labels_for_coordinate_node, COORDINATE_PROPERTY,
};

#[test]
fn coordinate_node_labels_are_descriptive_and_schema_derived() {
    let labels = labels_for_coordinate_node("S2", "vault_markdown").unwrap();

    assert_eq!(COORDINATE_PROPERTY, "coordinate");
    assert!(labels.contains(&"Bimba".to_owned()));
    assert!(labels.contains(&"Stack".to_owned()));
    assert!(!labels.contains(&"Coordinate".to_owned()));
    assert!(!labels.contains(&"VaultArtifact".to_owned()));
}

#[test]
fn compatibility_labels_are_listed_separately_from_canonical_derivation() {
    let compat = compatibility_labels();

    assert!(compat.contains(&"BimbaNode"));
    assert!(compat.contains(&"BimbaCoordinate"));
    assert!(compat.contains(&"Coordinate"));
    assert!(compat.contains(&"VaultArtifact"));
    assert!(label_spec("Bimba").is_some_and(|spec| !spec.compatibility));
    assert!(label_spec("Stack").is_some_and(|spec| !spec.compatibility));
}
