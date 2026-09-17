use std::collections::BTreeMap;

use epi_s2_graph_services::SemanticDocument;

#[test]
fn semantic_doc_orders_q_vocabulary_and_flattens_locality_signature() {
    let mut q_properties = BTreeMap::new();
    q_properties.insert(
        "q_5_integration_template".to_owned(),
        "integrates the cycle".to_owned(),
    );
    q_properties.insert(
        "q_4'_historical_diagnosis".to_owned(),
        "inverted context reading".to_owned(),
    );
    q_properties.insert(
        "q_4_locality_signature".to_owned(),
        "parent: M4\nlateral: [M4-2, M4-4]\nexcerpts:\n  M4-2: pithy neighbour".to_owned(),
    );
    q_properties.insert(
        "q_1_theoretical_thesis".to_owned(),
        "a node is local, not isolate".to_owned(),
    );
    q_properties.insert(
        "q_2_instantiation_mode".to_owned(),
        "instantiates through relation".to_owned(),
    );

    let doc = SemanticDocument::from_coordinate_parts(
        "M4",
        "Nara",
        "M",
        "M",
        "4",
        Some("context-bearing node"),
        Some("semantic document fixture"),
        q_properties,
        Vec::new(),
        Vec::new(),
    )
    .expect("semantic document should build");

    let q1 = doc.text.find("q_1_theoretical_thesis").unwrap();
    let q2 = doc.text.find("q_2_instantiation_mode").unwrap();
    let q4 = doc.text.find("q_4_locality_signature").unwrap();
    let q4_prime = doc.text.find("q_4'_historical_diagnosis").unwrap();
    let q5 = doc.text.find("q_5_integration_template").unwrap();

    assert!(q1 < q2);
    assert!(q2 < q4);
    assert!(q4 < q4_prime);
    assert!(q4_prime < q5);
    assert!(doc
        .text
        .contains("q_4_locality_signature: parent: M4 | lateral: [M4-2, M4-4]"));
    assert!(doc.text.contains("M4-2: pithy neighbour"));
}
