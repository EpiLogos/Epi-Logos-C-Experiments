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

// ===================== CCT-15: classify_c_layer routing law =====================

use epi_s1_hen_compiler_core::classify_c_layer;

#[test]
fn cct_15_frontmatter_beats_ancestry_beats_kind_routing() {
    let with_frontmatter = classify_c_layer(
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md",
        "---\ncoordinate: C2\ntitle: Anima\ntype_coordinate: C2\n---\n\nBody.\n",
    )
    .unwrap();
    assert_eq!(with_frontmatter.classification_source, "frontmatter");
    assert_eq!(with_frontmatter.evidence.type_coordinate, "C2");
    assert_eq!(with_frontmatter.evidence_kind, "c2_entity_candidate");

    let from_ancestry = classify_c_layer(
        "Idea/Bimba/World/Types/Coordinates/C/C4/Types-Contexts-MOCs/Index.md",
        "---\ncoordinate: C4\ntitle: Index\n---\n\nBody.\n",
    )
    .unwrap();
    assert_eq!(from_ancestry.classification_source, "world-types-ancestry");
    assert_eq!(from_ancestry.evidence.type_coordinate, "C4");
    assert_eq!(from_ancestry.evidence_kind, "c4_type_moc_authority");
}

#[test]
fn cct_15_kind_routing_templates_c1_entities_c2_canvases_c3_mocs_c4_world_c5() {
    let template = classify_c_layer(
        "Idea/Templates/daily-note-template.md",
        "---\ncoordinate: C1\ntitle: Daily Note Template\nartifact_role: template\n---\n\nBody.\n",
    )
    .unwrap();
    assert_eq!(template.classification_source, "kind-routing");
    assert_eq!(template.evidence.type_coordinate, "C1");

    let entity = classify_c_layer(
        "Idea/Empty/Present/11-07-2026/entities/Kairos Bell.md",
        "---\ncoordinate: C2\ntitle: Kairos Bell\ncandidate_state: candidate\n---\n\nBody.\n",
    )
    .unwrap();
    assert_eq!(entity.evidence.type_coordinate, "C2");
    assert_eq!(entity.evidence.crystallisation_state, "entity_candidate");

    let canvas = classify_c_layer("Idea/Bimba/World/Types/Some-Flow.canvas", "{}").unwrap();
    assert_eq!(canvas.classification_source, "kind-routing");
    assert_eq!(canvas.evidence.type_coordinate, "C3");
    assert_eq!(canvas.evidence_kind, "c3_diagram_canvas_form");

    // Same-name index canvas = the C4 MOC authority form.
    let moc = classify_c_layer("Idea/Bimba/World/Types/Anima/Anima.canvas", "{}").unwrap();
    assert_eq!(moc.evidence.type_coordinate, "C4");
    assert_eq!(moc.evidence.semantic_authority, "authoritative");
    assert_eq!(moc.evidence_kind, "c4_type_moc_authority");

    let flat_world = classify_c_layer(
        "Idea/Bimba/World/Kairos Bell.md",
        "---\ncoordinate: C5\ntitle: Kairos Bell\n---\n\nBody.\n",
    )
    .unwrap();
    assert_eq!(flat_world.evidence.type_coordinate, "C5");
}

#[test]
fn cct_15_c_prime_branches_are_audited_never_plain_c_authoritative() {
    for path in [
        "Idea/Bimba/World/Types/Coordinates/C/C4'/CT/CT4b.canvas",
        "Idea/Bimba/World/Types/Coordinates/CT/NOW-template.md",
        "Idea/Bimba/World/Types/Coordinates/C/C2'/Reflect.md",
    ] {
        let audited = classify_c_layer(path, "---\ncoordinate: C4\ntitle: X\n---\n\nBody.\n")
            .or_else(|_| classify_c_layer(path, "{}"))
            .unwrap();
        assert_eq!(audited.classification_source, "c-prime-audit", "{path}");
        assert_eq!(
            audited.evidence.semantic_authority,
            "reflective_scaffold_pending_review"
        );
        assert_eq!(audited.evidence_kind, "c_prime_reflective_scaffold");
        assert_ne!(audited.evidence.type_family, "C");
    }
}

#[test]
fn cct_15_unroutable_artifacts_are_refused_never_defaulted() {
    let err = classify_c_layer(
        "docs/random-note.md",
        "---\ncoordinate: M5-4\ntitle: Random\n---\n\nBody.\n",
    )
    .unwrap_err();
    assert!(err.contains("no C-layer route"), "{err}");
}
