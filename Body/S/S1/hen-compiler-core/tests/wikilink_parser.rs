use epi_s1_hen_compiler_core::wikilinks::{parse_wikilinks, WikilinkTarget};

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
