use epi_s2_graph_services::{FrontmatterPropertyRuleKind, SyncCoordinator};

#[test]
fn exposes_agent_facing_frontmatter_property_rules() {
    let rules = SyncCoordinator::frontmatter_property_rules();

    let coordinate = rules
        .iter()
        .find(|rule| rule.frontmatter_key == "coordinate")
        .expect("coordinate rule");
    assert_eq!(coordinate.canonical_property, "coordinate");
    assert_eq!(coordinate.kind, FrontmatterPropertyRuleKind::Identity);
    assert!(coordinate.agent_guidance.contains("identity"));

    let source_coordinates = rules
        .iter()
        .find(|rule| rule.frontmatter_key == "source_coordinates")
        .expect("source coordinate rule");
    assert_eq!(
        source_coordinates.canonical_property,
        "c_0_source_coordinates"
    );
    assert_eq!(
        source_coordinates.kind,
        FrontmatterPropertyRuleKind::RelationAndProperty
    );
    assert!(source_coordinates
        .agent_guidance
        .contains("relationship evidence"));

    let ct_type = rules
        .iter()
        .find(|rule| rule.frontmatter_key == "ct_type")
        .expect("ct type rule");
    assert_eq!(ct_type.canonical_property, "c_1_ct_type");
    assert_eq!(ct_type.kind, FrontmatterPropertyRuleKind::SemanticProperty);
}

#[test]
fn plans_frontmatter_properties_without_inventing_unknown_keys() {
    let planned = SyncCoordinator::plan_frontmatter_properties(
        serde_yaml::from_str(
            r#"coordinate: S2
title: Graph Protocol
source_coordinates:
  - "[[S1]]"
ct_type: protocol
unknown_extra_field: nope
"#,
        )
        .unwrap(),
    )
    .unwrap();

    assert_eq!(planned.get("coordinate").unwrap(), "S2");
    assert_eq!(planned.get("title").unwrap(), "Graph Protocol");
    assert_eq!(planned.get("c_0_source_coordinates").unwrap(), "[[S1]]");
    assert_eq!(planned.get("c_1_ct_type").unwrap(), "protocol");
    assert!(!planned.contains_key("unknown_extra_field"));
}
