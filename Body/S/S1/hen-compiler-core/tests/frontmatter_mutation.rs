use epi_s1_hen_compiler_core::append_frontmatter_string;

#[test]
fn appends_and_deduplicates_a_coordinate_prefixed_string_sequence() {
    let source = "---\ncoordinate: M4\nc_4_pinned_materia:\n  - Hawthorn\n---\n\n# NOW\n\nBody stays intact.\n";
    let updated = append_frontmatter_string(source, "c_4_pinned_materia", "Nettle")
        .expect("valid frontmatter append");
    let deduplicated = append_frontmatter_string(&updated, "c_4_pinned_materia", "Nettle")
        .expect("duplicate append is idempotent");

    assert_eq!(updated, deduplicated);
    assert!(updated.contains("- Hawthorn"));
    assert!(updated.contains("- Nettle"));
    assert!(updated.ends_with("# NOW\n\nBody stays intact.\n"));
}

#[test]
fn refuses_missing_frontmatter_and_non_coordinate_keys() {
    assert!(append_frontmatter_string("# NOW\n", "c_4_pinned_materia", "Nettle").is_err());
    assert!(append_frontmatter_string("---\ncoordinate: M4\n---\n", "pinned", "Nettle").is_err());
}
