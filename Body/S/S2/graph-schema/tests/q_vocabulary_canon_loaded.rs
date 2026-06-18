use epi_s2_graph_schema::{
    node_property_spec, validate_coordinate_prefix_property, Q_SCHEMA_VERSION,
};

// The q-register family is OPEN: validated by *shape*, not by a fixed slug list.
// Only `q_<0-5>['][_<slot>]_<lower_snake_case>` (and the `qm_` quickview family) is
// fixed; the facet slug is free. The long-standing quickview slots stay registered in
// NODE_PROPERTY_SPECS for typing/disclosure, but any well-formed key is valid.
// See Idea/Bimba/Seeds/M/q-vocabulary-canon.md.

#[test]
fn q_register_open_shape_law() {
    // Well-formed open slugs are accepted: free facet names, position 0, the prime
    // marker, an interior slot, and the qm_ quickview family.
    for key in [
        "q_0_implicate_ground",
        "q_3_free_text_mood",
        "q_4_locality_signature",
        "q_5'_3_integration_template",
        "qm_2_instantiation_mode",
    ] {
        assert!(
            validate_coordinate_prefix_property(key).is_ok(),
            "open q key rejected: {key}"
        );
    }

    // Malformed shapes are still errors.
    for key in ["q_9_overflow", "q_x_nonnumeric", "q_3_", "qm_9_bad"] {
        assert!(
            validate_coordinate_prefix_property(key).is_err(),
            "malformed q key accepted: {key}"
        );
    }

    // The long-standing quickview slots remain registered (typed, Public) so the
    // semantic-doc builder and disclosure logic keep their type information.
    for key in [
        "q_1_theoretical_thesis",
        "q_2_sophia_logos_dialectic",
        "q_2_instantiation_mode",
        "q_3_dialectical_movement",
        "q_4_historical_diagnosis",
        "q_4_locality_signature",
        "q_5_integration_template",
        "q_5_conjunctive_threshold",
    ] {
        assert!(
            node_property_spec(key).is_some(),
            "{key} missing from schema"
        );
    }

    assert_eq!(Q_SCHEMA_VERSION, "q-prefix-v3");
}
