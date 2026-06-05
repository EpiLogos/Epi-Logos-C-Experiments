use epi_s1_hen_compiler_core::graph_promotion::GraphPromotionIntent;
use epi_s1_hen_compiler_core::relation_inference::RelationInferenceCandidate;

#[test]
fn promotion_intent_carries_properties_labels_and_typed_relations() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\ntitle: Current\n---\nLinks [[C0/T4]].",
    )
    .unwrap();

    assert_eq!(intent.node.coordinate, "C0/T5");
    assert_eq!(intent.node.identity_property, "coordinate");
    assert!(intent.node.requested_label_hints.is_empty());
    assert_eq!(intent.node.properties.get("title").unwrap(), "Current");
    assert_eq!(intent.node.properties.get("coordinate").unwrap(), "C0/T5");
    assert_eq!(
        intent.node.properties.get("coordinate_prefix").unwrap(),
        "C0"
    );
    assert_eq!(intent.link_evidence.len(), 1);
    assert_eq!(intent.link_evidence[0].target_text, "C0/T4");
    let property_request = intent
        .property_intelligence_request
        .as_ref()
        .expect("Hen promotion intent must carry the PI-agent property reasoning request");
    assert_eq!(
        property_request
            .system_instructions
            .contains("full coordinate-driven schema"),
        true
    );
    assert!(property_request
        .system_instructions
        .contains("Return evidence-backed property proposals only"));
    assert_eq!(
        property_request.coordinate_property_families,
        vec!["c", "p", "l", "s", "t", "m", "q"]
    );
    assert_eq!(intent.frontmatter_evidence.len(), 2);
    assert!(intent.content_hash.starts_with("sha256:"));
    assert!(intent.markdown_body_hash.starts_with("sha256:"));
}

#[test]
fn promotion_intent_counts_wikilink_evidence_and_keeps_labels_descriptive() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/Present/19-05-2026/session/current.md",
        "---\ncoordinate: C0/T5\n---\nLinks [[C0/T4]] and [[C1]].",
    )
    .unwrap();

    assert_eq!(
        intent
            .node
            .properties
            .get("relation_evidence_count")
            .and_then(serde_json::Value::as_u64),
        Some(2)
    );
    assert!(intent
        .node
        .requested_label_hints
        .contains(&"NowSession".to_string()));
    assert_eq!(intent.node.requested_label_hints, vec!["NowSession"]);
}

#[test]
fn promotion_intent_preserves_relation_candidates_without_executing_provider() {
    let candidates = vec![RelationInferenceCandidate {
        source_coordinate: "C0/T5".to_owned(),
        target_coordinate: "C0/T4".to_owned(),
        relation_type: "ELABORATES".to_owned(),
        confidence: 0.92,
        evidence_kind: "llm_inference".to_owned(),
        evidence_text: "The body says it elaborates the target.".to_owned(),
        source_path: Some("Idea/Empty/current.md".to_owned()),
        source_line: Some(4),
        target_text: Some("C0/T4".to_owned()),
        inferred_by: Some("configured-llm".to_owned()),
        prompt_hash: Some("sha256:123".to_owned()),
    }];
    let evidence = epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\n---\nThis elaborates [[C0/T4]].",
    )
    .unwrap();

    let intent = GraphPromotionIntent::from_artifact_evidence(evidence, candidates).unwrap();

    assert_eq!(intent.relation_candidates.len(), 1);
    assert_eq!(intent.relation_candidates[0].relation_type, "ELABORATES");
    assert_eq!(intent.promotion_source, "hen_compiler_core");
    assert_eq!(intent.sync_version, "s1-hen-graph-promotion-v1");
}

#[test]
fn promotion_intent_carries_compatibility_source_fields() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/legacy.md",
        "---\ncoordinate: C0/T5\nbimbaCoordinate: C0/T4\n---\nLinks [[C0/T4]].",
    )
    .unwrap();

    assert_eq!(
        intent.compatibility_source_label.as_deref(),
        Some("BimbaCoordinate")
    );
    assert_eq!(
        intent.compatibility_source_property.as_deref(),
        Some("bimbaCoordinate")
    );
    assert_eq!(
        intent.compatibility_source_coordinate.as_deref(),
        Some("C0/T4")
    );
}

#[test]
fn promotion_intent_preserves_snake_case_legacy_coordinate_property() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/legacy.md",
        "---\ncoordinate: C0/T5\nbimba_coordinate: C0/T4\n---\nLinks [[C0/T4]].",
    )
    .unwrap();

    assert_eq!(
        intent.compatibility_source_property.as_deref(),
        Some("bimba_coordinate")
    );
    assert_eq!(
        intent.compatibility_source_coordinate.as_deref(),
        Some("C0/T4")
    );
}

#[test]
fn promotion_intent_accepts_prime_branch_coordinates_and_derives_cluster_metadata() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/S/S4/S4'/S4.4'.md",
        "---\ncoordinate: S4.4'\ntitle: Agentic Inhabitation Law\n---\nVAK execution grammar.",
    )
    .unwrap();

    assert_eq!(intent.node.coordinate, "S4.4'");
    assert_eq!(
        intent.node.properties.get("coordinate_prefix").unwrap(),
        "S4'"
    );
    assert_eq!(
        intent.node.properties.get("coordinate_parent").unwrap(),
        "S4'"
    );
    assert_eq!(
        intent.node.properties.get("coordinate_namespace").unwrap(),
        "S"
    );
    assert_eq!(intent.node.properties.get("coordinate_axis").unwrap(), "prime");

    let lens = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/World/Types/Coordinates/L/L2/L2'/L2-3'.md",
        "---\ncoordinate: L2-3'\ntitle: Chronological Arc\n---\nNight lens branch.",
    )
    .unwrap();
    assert_eq!(lens.node.properties.get("coordinate_prefix").unwrap(), "L2'");
    assert_eq!(lens.node.properties.get("coordinate_parent").unwrap(), "L2'");

    let m_prime = GraphPromotionIntent::from_markdown(
        "Idea/Bimba/Seeds/M/M5'/agentic-control-room.md",
        "---\ncoordinate: M5-4'\ntitle: Agentic Control Room\n---\nM' affordance.",
    )
    .unwrap();
    assert_eq!(
        m_prime.node.properties.get("coordinate_parent").unwrap(),
        "M5'"
    );
    assert_eq!(
        m_prime.node.properties.get("coordinate_namespace").unwrap(),
        "M"
    );
}

#[test]
fn legacy_coordinate_equal_to_canonical_does_not_request_compatibility_migration() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\nbimbaCoordinate: C0/T5\n---\nLinks [[C0/T4]].",
    )
    .unwrap();

    assert_eq!(intent.compatibility_source_label, None);
    assert_eq!(intent.compatibility_source_property, None);
    assert_eq!(intent.compatibility_source_coordinate, None);
}

#[test]
fn promotion_intent_rejects_legacy_only_coordinate() {
    let err = GraphPromotionIntent::from_markdown(
        "Idea/Empty/legacy.md",
        "---\nbimbaCoordinate: C0/T5\n---\nLinks [[C0/T4]].",
    )
    .unwrap_err();

    assert!(err.contains("graph promotion requires coordinate frontmatter"));
}
