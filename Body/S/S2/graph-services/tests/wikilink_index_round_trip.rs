//! CCT-17b — the wikilink span-pointer retrieval primitive round trip:
//! entity files under World/Types produce coordinate suggestions with
//! `{file}:{line}:{column}` span pointers; coordinate-literal targets
//! resolve directly, named targets resolve through sibling entity files,
//! unresolvable targets stay out, and non-Types files never contribute.

use epi_s2_graph_services::retrieval::wikilink_index::{
    suggest_world_links_by_coordinate, WorldEntityFile,
};

fn fixture() -> Vec<WorldEntityFile> {
    vec![
        (
            "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md".to_owned(),
            "---\ncoordinate: C2-1\ntitle: Anima\n---\n\nAnima is shaped by [[C2]] and resonates with [[Kairos Bell|the bell]].\nSecond line names [[Unknown Thing]].\n".to_owned(),
        ),
        (
            "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Kairos Bell.md".to_owned(),
            "---\ncoordinate: C2-2\ntitle: Kairos Bell\n---\n\nThe bell refers back to [[Anima]].\n".to_owned(),
        ),
        (
            "Idea/Empty/Present/11-07-2026/entities/Loose.md".to_owned(),
            "---\ncoordinate: C2\ntitle: Loose\n---\n\nA candidate naming [[Anima]] — outside World/Types, never indexed.\n".to_owned(),
        ),
    ]
}

#[test]
fn wikilink_index_round_trip() {
    let suggestions = suggest_world_links_by_coordinate(&fixture(), "C2");

    // Anima (C2-1) contributes: coordinate-literal [[C2]] + named
    // [[Kairos Bell]] → C2-2; [[Unknown Thing]] resolves nowhere.
    // Kairos Bell (C2-2) contributes [[Anima]] → C2-1.
    let coordinates: Vec<&str> = suggestions
        .iter()
        .map(|suggestion| suggestion.coordinate.as_str())
        .collect();
    assert!(coordinates.contains(&"C2"));
    assert!(coordinates.contains(&"C2-2"));
    assert!(coordinates.contains(&"C2-1"));
    assert!(!suggestions
        .iter()
        .any(|suggestion| suggestion.raw_target == "Unknown Thing"));

    // Span pointers carry the c_1_source_artifact_span pointer shape.
    let c2_literal = suggestions
        .iter()
        .find(|suggestion| suggestion.raw_target == "C2")
        .expect("coordinate-literal target resolves");
    assert!(c2_literal.span.starts_with(
        "Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Anima.md:"
    ));
    let mut span_tail = c2_literal.span.rsplit(':');
    let column: usize = span_tail.next().unwrap().parse().unwrap();
    let line: usize = span_tail.next().unwrap().parse().unwrap();
    assert!(line >= 1 && column >= 1);

    // The Empty-residency candidate never contributes rows.
    assert!(!suggestions
        .iter()
        .any(|suggestion| suggestion.span.contains("Idea/Empty/")));

    // Direction discipline: asking for an unrelated coordinate yields nothing.
    assert!(suggest_world_links_by_coordinate(&fixture(), "M5").is_empty());
}
