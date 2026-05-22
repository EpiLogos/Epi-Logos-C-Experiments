use epi_s1_hen_compiler_core::artifact_evidence::{collect_artifact_evidence, ArtifactKind};

#[test]
fn combines_frontmatter_and_body_wikilink_evidence() {
    let markdown = r#"---
coordinate: C0/T5
title: The Seed
source_coordinates:
  - C0
  - T5
---

This note references [[C0/T4|prior seed]] and [[C1]].
"#;

    let evidence = collect_artifact_evidence("Idea/Empty/seed.md", markdown).unwrap();

    assert_eq!(evidence.coordinate.as_deref(), Some("C0/T5"));
    assert_eq!(evidence.title.as_deref(), Some("The Seed"));
    assert_eq!(evidence.artifact_kind, ArtifactKind::VaultMarkdown);
    assert_eq!(evidence.frontmatter_source_coordinates, vec!["C0", "T5"]);
    assert_eq!(evidence.body_wikilinks.len(), 2);
    assert_eq!(evidence.headings.len(), 0);
    assert!(evidence.content_hash.starts_with("sha256:"));
    assert!(evidence.markdown_body_hash.starts_with("sha256:"));
}

#[test]
fn preserves_unknown_frontmatter_and_collects_headings() {
    let markdown = r#"---
coordinate: T5
title: Insight
custom_signal: keep me
source_coordinate: C0
---

# Primary

Text [[Target]].

## Secondary
"#;

    let evidence = collect_artifact_evidence("Idea/Empty/insight.md", markdown).unwrap();

    assert_eq!(evidence.frontmatter_source_coordinates, vec!["C0"]);
    assert!(evidence.unknown_frontmatter.contains_key("custom_signal"));
    assert_eq!(evidence.headings.len(), 2);
    assert_eq!(evidence.headings[0].level, 1);
    assert_eq!(evidence.headings[0].title, "Primary");
    assert_eq!(evidence.headings[1].line, 12);
}

#[test]
fn hashes_change_when_body_changes() {
    let first = collect_artifact_evidence("Idea/Empty/a.md", "---\ntitle: A\n---\nBody").unwrap();
    let second =
        collect_artifact_evidence("Idea/Empty/a.md", "---\ntitle: A\n---\nBody changed").unwrap();

    assert_ne!(first.content_hash, second.content_hash);
    assert_ne!(first.markdown_body_hash, second.markdown_body_hash);
}

#[test]
fn content_hash_uses_sha256_digest() {
    let evidence = collect_artifact_evidence("Idea/Empty/hash.md", "abc").unwrap();

    assert_eq!(
        evidence.content_hash,
        "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    assert_eq!(evidence.markdown_body_hash, evidence.content_hash);
}

#[test]
fn starting_thematic_break_without_closing_frontmatter_is_markdown_body() {
    let markdown = "---\n\n# Not Frontmatter\n\nBody [[Visible]].";

    let evidence = collect_artifact_evidence("Idea/Empty/thematic.md", markdown).unwrap();

    assert!(evidence.frontmatter.is_none());
    assert_eq!(evidence.title.as_deref(), Some("Not Frontmatter"));
    assert_eq!(evidence.body_wikilinks.len(), 1);
}

#[test]
fn headings_ignore_unmatched_fence_marker_inside_code_block() {
    let markdown = r#"---
coordinate: T5
---

````
# Hidden
~~~
## Also Hidden
````
# Visible
"#;

    let evidence = collect_artifact_evidence("Idea/Empty/fenced.md", markdown).unwrap();

    assert_eq!(evidence.headings.len(), 1);
    assert_eq!(evidence.headings[0].title, "Visible");
}

#[test]
fn retains_legacy_coordinate_frontmatter_as_compatibility_evidence() {
    let markdown = r#"---
coordinate: C0/T5
bimbaCoordinate: LEGACY/C0/T5
bimba_coordinate: legacy_snake
source_coordinates:
  - C0
---

# Canonical

Body [[Target]].
"#;

    let evidence = collect_artifact_evidence("Idea/Bimba/Seeds/S/S1/canonical.md", markdown)
        .expect("artifact evidence should parse real vault-like markdown");

    assert_eq!(evidence.coordinate.as_deref(), Some("C0/T5"));
    assert_eq!(evidence.title.as_deref(), Some("Canonical"));
    assert_eq!(evidence.frontmatter_source_coordinates, vec!["C0"]);
    assert_eq!(evidence.body_wikilinks.len(), 1);
    assert_eq!(
        evidence
            .unknown_frontmatter
            .get("bimbaCoordinate")
            .and_then(serde_yaml::Value::as_str),
        Some("LEGACY/C0/T5")
    );
    assert_eq!(
        evidence
            .unknown_frontmatter
            .get("bimba_coordinate")
            .and_then(serde_yaml::Value::as_str),
        Some("legacy_snake")
    );
}

#[test]
fn legacy_coordinate_without_canonical_coordinate_does_not_become_canonical() {
    let markdown = r#"---
bimbaCoordinate: LEGACY/C0/T5
title: Legacy Only
---

Body [[Target]].
"#;

    let evidence = collect_artifact_evidence("Idea/Bimba/Seeds/S/S1/legacy.md", markdown)
        .expect("legacy frontmatter should parse");

    assert_eq!(evidence.coordinate, None);
    assert_eq!(evidence.title.as_deref(), Some("Legacy Only"));
    assert!(evidence.unknown_frontmatter.contains_key("bimbaCoordinate"));
}
