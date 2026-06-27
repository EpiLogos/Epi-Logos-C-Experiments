use epi_s1_hen_compiler_core::wikilinks::{
    coordinate_for_residency, coordinate_residency_refusal, parse_wikilinks, RenameRefusalReason,
    WikilinkTarget,
};

#[test]
fn parses_body_wikilinks_with_aliases_lines_and_context() {
    let markdown = r#"
# C0 Overview

This develops [[C0/Seeds/T5|the fifth seed]] and [[#Local Heading]].

```text
Do not parse [[Inside Code]]
```

Later, see [[Bimba/Coordinate Family]].
"#;

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 3);
    assert_eq!(links[0].target, WikilinkTarget::Path("C0/Seeds/T5".into()));
    assert_eq!(links[0].alias.as_deref(), Some("the fifth seed"));
    assert_eq!(links[0].line, 4);
    assert!(links[0].context.contains("This develops"));
    assert_eq!(
        links[1].target,
        WikilinkTarget::Heading("Local Heading".into())
    );
    assert_eq!(
        links[2].target,
        WikilinkTarget::Path("Bimba/Coordinate Family".into())
    );
}

#[test]
fn parses_path_heading_targets_and_preserves_raw_target() {
    let markdown = "See [[C0/Seeds/T5#Local Heading|seed heading]].";

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 1);
    assert_eq!(
        links[0].target,
        WikilinkTarget::PathHeading {
            path: "C0/Seeds/T5".into(),
            heading: "Local Heading".into(),
        }
    );
    assert_eq!(links[0].raw_target, "C0/Seeds/T5#Local Heading");
    assert_eq!(links[0].alias.as_deref(), Some("seed heading"));
    assert_eq!(links[0].line, 1);
    assert_eq!(links[0].column, 5);
}

#[test]
fn parses_path_block_targets_without_collapsing_to_path() {
    let markdown = "See [[C0/Seeds/T5^block-id|seed block]].";

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 1);
    assert_eq!(
        links[0].target,
        WikilinkTarget::PathBlock {
            path: "C0/Seeds/T5".into(),
            block_id: "block-id".into(),
        }
    );
    assert_eq!(links[0].raw_target, "C0/Seeds/T5^block-id");
    assert_eq!(links[0].alias.as_deref(), Some("seed block"));
}

#[test]
fn parses_path_heading_block_targets_without_losing_block_anchor() {
    let markdown = "See [[C0/Seeds/T5#Local Heading^block-id]].";

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 1);
    assert_eq!(
        links[0].target,
        WikilinkTarget::PathHeadingBlock {
            path: "C0/Seeds/T5".into(),
            heading: "Local Heading".into(),
            block_id: "block-id".into(),
        }
    );
    assert_eq!(links[0].raw_target, "C0/Seeds/T5#Local Heading^block-id");
}

#[test]
fn ignores_unclosed_links_and_fenced_code_variants() {
    let markdown = r#"
Before [[Visible]]

~~~
Ignore [[Hidden]]
~~~

After [[Still Visible]]
Broken [[No Close
"#;

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 2);
    assert_eq!(links[0].raw_target, "Visible");
    assert_eq!(links[1].raw_target, "Still Visible");
}

#[test]
fn fenced_code_closes_only_on_matching_marker() {
    let markdown = r#"
````
Ignore [[Hidden]]
~~~
Still ignore [[Also Hidden]]
````
After [[Visible]]
"#;

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 1);
    assert_eq!(links[0].raw_target, "Visible");
}

#[test]
fn ignores_escaped_wikilinks() {
    let markdown = r"Escaped \[[Hidden]] visible [[Shown]].";

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 1);
    assert_eq!(links[0].raw_target, "Shown");
}

#[test]
fn records_columns_for_multiple_links_on_one_line() {
    let markdown = "A [[First]] and [[Second|alias]] after.";

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 2);
    assert_eq!(links[0].raw_target, "First");
    assert_eq!(links[0].column, 3);
    assert_eq!(links[1].raw_target, "Second");
    assert_eq!(links[1].column, 17);
    assert_eq!(links[1].alias.as_deref(), Some("alias"));
}

#[test]
fn infers_coordinate_from_seed_residency_paths() {
    assert_eq!(
        coordinate_for_residency("Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md").as_deref(),
        Some("S2.0")
    );
    assert_eq!(
        coordinate_for_residency("Idea/Bimba/Seeds/S/S1/S1'/S1-0'-SPEC.md").as_deref(),
        Some("S1.0'")
    );
    assert_eq!(
        coordinate_for_residency("Idea/Bimba/World/Types/Coordinates/S/S4/S4'/S4.4'.md").as_deref(),
        Some("S4.4'")
    );
    assert_eq!(
        coordinate_for_residency("Idea/Pratibimba/Self/Thought/T/T4/spine-smoke.md").as_deref(),
        Some("T4")
    );
}

#[test]
fn coordinate_residency_refusal_reports_mismatched_frontmatter() {
    let markdown = r#"---
coordinate: S1.0
title: S1 shard
---

# S1 shard
"#;

    let refusal = coordinate_residency_refusal("Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md", markdown)
        .expect("S1 coordinate under S2 residency must refuse");

    assert_eq!(refusal.relative_path, "Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md");
    assert!(refusal.detail.contains("S1.0"));
    assert!(refusal.detail.contains("S2.0"));
    assert_eq!(
        refusal.reason,
        RenameRefusalReason::CoordinateResidencyMismatch {
            expected_coordinate: "S2.0".to_owned(),
            actual_coordinate: "S1.0".to_owned(),
        }
    );
}
