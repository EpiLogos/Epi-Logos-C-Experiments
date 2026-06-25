use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;

#[test]
fn graph_promotion_classifies_world_types_c_first_before_other_families() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/C/C4/Types-Contexts-MOCs/Types-Contexts-MOCs.md",
        r#"---
coordinate: C4
title: Types Contexts MOCs
---

# Types Contexts MOCs
"#,
    )
    .unwrap();

    assert_eq!(intent.node.properties.get("type_family").unwrap(), "C");
    assert_eq!(intent.node.properties.get("type_coordinate").unwrap(), "C4");
    assert_eq!(
        intent.node.properties.get("type_path").unwrap(),
        "Idea/Bimba/World/Types/Coordinates/C/C4/Types-Contexts-MOCs/Types-Contexts-MOCs"
    );
    assert_eq!(
        intent.node.properties.get("semantic_authority").unwrap(),
        "authoritative"
    );
    assert_eq!(
        intent.node.properties.get("crystallisation_state").unwrap(),
        "incubating_type_index"
    );
    assert_eq!(
        intent.node.properties.get("c_layer_path").unwrap(),
        "Idea/Bimba/World/Types/Coordinates/C/C4"
    );
    assert_eq!(
        intent.node.properties.get("graph_evidence_kind").unwrap(),
        "c4_type_moc_authority"
    );
    assert!(intent
        .frontmatter_evidence
        .iter()
        .any(|entry| entry.key == "type_coordinate"
            && entry.value == "C4"
            && entry.evidence_kind == "c_first_typology"));
}

#[test]
fn c5_graduation_receipt_carries_source_authority_and_flat_world_target() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/NOW.md",
        r#"---
coordinate: C5
title: NOW
source_c_authority_path: Idea/Bimba/World/Types/Coordinates/C/C5/Crystallisations-Pratibimba/NOW.md
flat_world_target: Idea/Bimba/World/NOW.md
---

Graduated from [[World/Types]].
"#,
    )
    .unwrap();

    assert_eq!(intent.node.properties.get("type_coordinate").unwrap(), "C5");
    assert_eq!(
        intent
            .node
            .properties
            .get("source_c_authority_path")
            .unwrap(),
        "Idea/Bimba/World/Types/Coordinates/C/C5/Crystallisations-Pratibimba/NOW.md"
    );
    assert_eq!(
        intent.node.properties.get("flat_world_target").unwrap(),
        "Idea/Bimba/World/NOW.md"
    );
    assert_eq!(
        intent.node.properties.get("crystallisation_state").unwrap(),
        "crystallised_world_form"
    );
    assert_eq!(
        intent.node.properties.get("graph_evidence_kind").unwrap(),
        "c5_world_graduation_receipt"
    );
}
