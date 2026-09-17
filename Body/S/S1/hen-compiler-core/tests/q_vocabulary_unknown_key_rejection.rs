use epi_s1_hen_compiler_core::validate_frontmatter;
use serde_yaml::Value;

// The q-register family is OPEN: only the shape `q_<0-5>['][_<slot>]_<lower_snake_case>`
// is fixed; the semantic facet slug is free. There is no closed vocabulary.
// See Idea/Bimba/Seeds/M/q-vocabulary-canon.md.

#[test]
fn q_vocabulary_wellformed_open_keys_are_accepted() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "M4"
q_0_implicate_ground: "the thrown ground a node arises from"
q_4_free_text_mood: "any apt facet slug is valid under the open law"
q_4_locality_signature: "parent: M4"
q_5'_3_integration_template: "inverted-phase slot integration"
qm_2_instantiation_mode: "M-prime quickview mode"
"#,
    )
    .unwrap();

    let result = validate_frontmatter(&yaml);
    assert!(result.errors.is_empty(), "{:?}", result.errors);
}

#[test]
fn q_vocabulary_malformed_shape_keys_are_errors() {
    let yaml: Value = serde_yaml::from_str(
        r#"
coordinate: "M4"
q_7_overflow_position: "position must be 0-5"
q_x_nonnumeric_position: "position must be a digit"
q_3_: "empty semantic suffix"
qm_9_bad: "qm position must be 0-5"
"#,
    )
    .unwrap();

    let result = validate_frontmatter(&yaml);
    for key in [
        "q_7_overflow_position",
        "q_x_nonnumeric_position",
        "q_3_",
        "qm_9_bad",
    ] {
        assert!(
            result.errors.iter().any(|error| error.contains(key)),
            "expected malformed-shape error for '{key}'; got {:?}",
            result.errors
        );
    }
}
