use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;

#[test]
fn c2_entity_candidate_fixture_includes_aliases_state_and_accepted_links() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/Present/02-06-2026/entities/anima.md",
        r#"---
coordinate: C2
title: Anima
type_family: C
type_coordinate: C2
type_path: Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima
c_layer_path: Idea/Bimba/World/Types/Coordinates/C/C2
semantic_authority: candidate_pending_review
crystallisation_state: entity_candidate
aliases:
  - Dispatch Function
  - Lemniscate Self-Fold
candidate_state: candidate
accepted_wikilinks:
  - Anima
  - S4
---

Candidate refers to [[Anima]] and [[S4]].
"#,
    )
    .unwrap();

    assert_eq!(intent.node.properties.get("type_coordinate").unwrap(), "C2");
    assert_eq!(
        intent.node.properties.get("aliases").unwrap(),
        &serde_json::json!(["Dispatch Function", "Lemniscate Self-Fold"])
    );
    assert_eq!(
        intent.node.properties.get("candidate_state").unwrap(),
        "candidate"
    );
    assert_eq!(
        intent.node.properties.get("accepted_wikilinks").unwrap(),
        &serde_json::json!(["Anima", "S4"])
    );
    assert_eq!(
        intent.node.properties.get("graph_evidence_kind").unwrap(),
        "c2_entity_candidate"
    );
    assert_eq!(intent.link_evidence.len(), 2);
    assert!(intent
        .link_evidence
        .iter()
        .any(|evidence| evidence.target_text == "Anima"));
    assert!(intent
        .frontmatter_evidence
        .iter()
        .any(|entry| entry.key == "aliases" && entry.value == "Dispatch Function"));
}

#[test]
fn world_entity_promotion_emits_world_labels_root_link_and_wikilink_spans() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md",
        r#"---
coordinate: C2-1
title: Some Entity
type_family: C
type_coordinate: C2
type_path: Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity
c_layer_path: Idea/Bimba/World/Types/Coordinates/C/C2
semantic_authority: candidate_pending_review
crystallisation_state: entity_candidate
---

Some Entity is shaped by [[C2]] and resonates with [[Anima|the dispatch form]].
"#,
    )
    .unwrap();

    assert!(intent
        .node
        .requested_label_hints
        .contains(&"World".to_owned()));
    assert!(intent
        .node
        .requested_label_hints
        .contains(&"Archetypal".to_owned()));
    assert_eq!(
        intent
            .node
            .properties
            .get("c_1_source_artifact_span")
            .unwrap(),
        &serde_json::json!(["C2@12:26", "Anima@12:52"])
    );

    let root_link = intent
        .relation_candidates
        .iter()
        .find(|candidate| candidate.relation_type == "WORLD_FORM_OF")
        .expect("WORLD_FORM_OF relation missing");
    assert_eq!(root_link.source_coordinate, "C2-1");
    assert_eq!(root_link.target_coordinate, "C2");
    assert_eq!(root_link.evidence_kind, "llm_inference");
    assert_eq!(
        root_link.inferred_by.as_deref(),
        Some("pi:hen-world-namespace")
    );
    assert!(root_link
        .prompt_hash
        .as_deref()
        .unwrap()
        .starts_with("sha256:"));
}

#[test]
fn flat_world_graduation_preserves_psychoid_root_link() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/SomeEntity.md",
        r#"---
coordinate: C2-1
title: Some Entity
source_c_authority_path: Idea/Bimba/World/Types/Coordinates/C/C2/SomeEntity.md
flat_world_target: Idea/Bimba/World/SomeEntity.md
---

Graduated from [[SomeEntity]].
"#,
    )
    .unwrap();

    assert!(intent
        .node
        .requested_label_hints
        .contains(&"World".to_owned()));
    assert_eq!(
        intent.node.properties.get("crystallisation_state").unwrap(),
        "crystallised_world_form"
    );

    let root_link = intent
        .relation_candidates
        .iter()
        .find(|candidate| candidate.relation_type == "WORLD_FORM_OF")
        .expect("WORLD_FORM_OF relation missing");
    assert_eq!(root_link.source_coordinate, "C2-1");
    assert_eq!(root_link.target_coordinate, "C2");
}
