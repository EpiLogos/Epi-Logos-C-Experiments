use epi_s2_graph_services::{parse_yaml_frontmatter, EntityMapper, QLAlignmentValidator};

#[test]
fn vault_frontmatter_parser_is_s2_owned_and_handles_obsidian_markdown() {
    let content = "---\ncoordinate: \"P3\"\nql_position: 3\nfamily: \"P\"\nname: \"Pattern\"\np_3_pattern: \"[[Bimba/Seeds/P/P3|Pattern]]\"\n---\n\n# P3 - Pattern\n";
    let parsed = parse_yaml_frontmatter(content).expect("frontmatter should parse");

    assert_eq!(
        parsed.get("coordinate").and_then(|v| v.as_str()),
        Some("P3")
    );
    assert_eq!(parsed.get("ql_position").and_then(|v| v.as_u64()), Some(3));
    assert_eq!(parsed.get("family").and_then(|v| v.as_str()), Some("P"));
}

#[test]
fn vault_mapping_and_coordinate_validation_are_s2_graph_services() {
    let validator = QLAlignmentValidator::new();
    assert!(validator.validate_coordinate("S2"));
    assert!(validator.validate_coordinate("M5"));
    assert!(!validator.validate_coordinate("S6"));

    let mapper = EntityMapper::new();
    assert_eq!(
        mapper.path_to_labels("Empty/Present/NOW.md"),
        vec!["Note".to_owned(), "Present".to_owned()]
    );
    let node = mapper.node_to_ref(
        vec!["Note".to_owned()],
        Some("Empty/Present/NOW.md".to_owned()),
    );
    assert_eq!(node.uuid, "path:Empty/Present/NOW.md");
    assert_eq!(node.file_path.as_deref(), Some("Empty/Present/NOW.md"));
}
