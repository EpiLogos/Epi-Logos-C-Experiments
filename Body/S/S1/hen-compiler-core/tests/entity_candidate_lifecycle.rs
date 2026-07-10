use epi_s1_hen_compiler_core::birth_codon::BirthCodonState;
use epi_s1_hen_compiler_core::entity_lifecycle::{
    plan_entity_capture, plan_entity_classify, plan_entity_promote_to_type, plan_world_graduate,
    entity_list_entry,
};
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

#[test]
fn cct_14_full_lifecycle_capture_classify_promote_graduate() {
    // 1. Dangling-wikilink capture: bare target name, no source file.
    let capture = plan_entity_capture("Kairos Bell", "10-07-2026", Some("hen"), None).unwrap();
    assert_eq!(
        capture.candidate_path,
        "Idea/Empty/Present/10-07-2026/entities/Kairos Bell.md"
    );
    assert_eq!(capture.title, "Kairos Bell");
    assert_eq!(capture.birth_codon.state, BirthCodonState::Provisional);
    assert!(capture.markdown.contains("candidate_state: candidate"));
    assert!(capture.markdown.contains("c_5_birth_codon:"));
    assert!(capture.markdown.contains("birth_codon_state: provisional"));

    // 2. Classify to C2 (explicit layer).
    let classify =
        plan_entity_classify(&capture.candidate_path, &capture.markdown, Some("C2")).unwrap();
    assert_eq!(classify.type_coordinate, "C2");
    assert!(classify.markdown.contains(
        "type_path: Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Kairos Bell"
    ));
    assert_eq!(classify.birth_codon.state, BirthCodonState::Provisional);

    // 3. Promote Empty -> World/Types: codon ratifies, value preserved,
    //    transition event fires on the promotion intent.
    let promotion =
        plan_entity_promote_to_type(&classify.candidate_path, &classify.markdown).unwrap();
    assert_eq!(
        promotion.to_path,
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Kairos Bell.md"
    );
    assert_eq!(promotion.birth_codon.state, BirthCodonState::Ratified);
    assert_eq!(
        promotion.birth_codon.record.codon,
        classify.birth_codon.record.codon,
        "the territory archetype is invariant across the lifecycle"
    );
    assert!(promotion.birth_codon.preserved_from_frontmatter);
    assert_eq!(
        promotion.birth_codon.transition_event.as_deref(),
        Some("birth_codon_provisional_ratified")
    );
    assert!(promotion.markdown.contains("birth_codon_state: ratified"));
    assert!(promotion
        .intent
        .node
        .requested_label_hints
        .contains(&"World".to_owned()));

    // 4. Graduate World/Types -> flat World: codon carried unchanged, the
    //    type-local file is retained as a MOC pointer.
    let graduation = plan_world_graduate(&promotion.to_path, &promotion.markdown).unwrap();
    assert_eq!(graduation.flat_world_path, "Idea/Bimba/World/Kairos Bell.md");
    assert_eq!(
        graduation.birth_codon.record.codon,
        promotion.birth_codon.record.codon
    );
    assert!(graduation.birth_codon.preserved_from_frontmatter);
    assert!(graduation
        .flat_markdown
        .contains("crystallisation_state: crystallised_world_form"));
    assert!(graduation
        .moc_pointer_markdown
        .contains("Graduated to [[Kairos Bell]]"));
    assert_eq!(
        graduation
            .intent
            .node
            .properties
            .get("crystallisation_state")
            .unwrap(),
        "crystallised_world_form"
    );

    // Review surface reads each stage back with the right state.
    let candidate_row = entity_list_entry(&capture.candidate_path, &classify.markdown).unwrap();
    assert_eq!(candidate_row.state, "candidate");
    assert_eq!(
        candidate_row.birth_codon,
        Some(classify.birth_codon.record.codon)
    );
    let promoted_row = entity_list_entry(&promotion.to_path, &promotion.markdown).unwrap();
    assert_eq!(promoted_row.state, "promoted");
    let graduated_row =
        entity_list_entry(&graduation.flat_world_path, &graduation.flat_markdown).unwrap();
    assert_eq!(graduated_row.state, "graduated");
    assert_eq!(graduated_row.birth_codon_state.as_deref(), Some("ratified"));
}

#[test]
fn cct_14_root_note_capture_carries_the_loose_body_over() {
    let capture = plan_entity_capture(
        "Loose Root Note.md",
        "10-07-2026",
        None,
        Some("The loose root note body, referring to [[Anima]]."),
    )
    .unwrap();
    assert_eq!(capture.title, "Loose Root Note");
    assert!(capture
        .markdown
        .contains("The loose root note body, referring to [[Anima]]."));
    // The capture intent carries the wikilink as relation evidence.
    assert!(capture
        .intent
        .link_evidence
        .iter()
        .any(|evidence| evidence.target_text == "Anima"));
}
