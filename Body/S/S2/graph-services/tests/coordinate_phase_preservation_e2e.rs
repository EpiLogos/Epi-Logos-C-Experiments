//! CCT-20 — coordinate phase-flip preservation across the S2 property law:
//! an address survives while its phase may flip. No layer collapses `C`
//! and `C'`, direct and `_i_` properties, or phase into an untyped
//! "mirror". The hermetic slices compose the landed laws; the live sync
//! path is covered by the CCT-16 live test against a standing Neo4j.

use epi_s2_graph_services::{
    plan_frontmatter_properties, resolve_frontmatter_key, FrontmatterKeyResolution,
};

#[test]
fn direct_and_inverted_properties_survive_as_distinct_never_collapsed() {
    let yaml: serde_yaml::Value = serde_yaml::from_str(
        "coordinate: \"C3'\"\nq_5_integration_template: direct-side\n\"q_5'_integration_template\": inverted-side\n",
    )
    .unwrap();
    let properties = plan_frontmatter_properties(yaml).unwrap();
    // Address identity: ONE semantic, TWO phases, ZERO collapse.
    assert_eq!(
        properties.get("q_5_integration_template").map(String::as_str),
        Some("direct-side")
    );
    assert_eq!(
        properties
            .get("q_5_i_integration_template")
            .map(String::as_str),
        Some("inverted-side")
    );
    // The coordinate identity keeps its prime — never silently unprimed.
    assert_eq!(
        properties.get("coordinate").map(String::as_str),
        Some("C3'")
    );
}

#[test]
fn double_phase_application_returns_to_the_original_key() {
    // # applied at the property level: direct → inverted → direct. The
    // canonicalisation is stable — a second pass over the already-`_i_`
    // form stays exactly that form (no phase accumulation, no drift).
    let inverted = match resolve_frontmatter_key("q_5'_integration_template") {
        FrontmatterKeyResolution::Canonical(key) => key,
        other => panic!("prime form must canonicalise, got {other:?}"),
    };
    assert_eq!(inverted, "q_5_i_integration_template");
    let re_resolved = match resolve_frontmatter_key(&inverted) {
        FrontmatterKeyResolution::Canonical(key) => key,
        other => panic!("canonical inverted form must survive, got {other:?}"),
    };
    assert_eq!(re_resolved, inverted, "phase does not accumulate");
    // And the direct form never gains a phase it was not given.
    assert_eq!(
        resolve_frontmatter_key("q_5_integration_template"),
        FrontmatterKeyResolution::Canonical("q_5_integration_template".to_owned())
    );
}

#[test]
fn textual_phase_tokens_are_lint_errors_never_a_parallel_encoding() {
    for key in [
        "q_5_prime_template",
        "c_3_inverted_reading",
        "m_2_inversion_state",
    ] {
        match resolve_frontmatter_key(key) {
            FrontmatterKeyResolution::UnknownFamily(error) => {
                assert!(error.contains("textual phase token"), "{error}");
            }
            other => panic!("{key} must be a lint error, got {other:?}"),
        }
    }
    // The shape-encoded phase stays welcome — the lint targets TEXT, not
    // the `_i_` law.
    assert!(matches!(
        resolve_frontmatter_key("m_2_i_colour"),
        FrontmatterKeyResolution::Canonical(_)
    ));
}

#[test]
fn no_generic_mirror_relation_exists_in_the_s2_relation_space() {
    // OWL/n10s discipline: `epi:hasInverse` is the type-level inverse
    // pair; a generic mirror catch-all must not exist as a relation kind.
    // (The repo-wide grep is part of the tranche verification; this pins
    // the runtime relation registry.)
    use epi_s2_graph_schema::relationship_spec;
    assert!(relationship_spec("MIRRORS_WITH").is_err());
    assert!(relationship_spec("EPI_MIRRORS").is_err());
}
