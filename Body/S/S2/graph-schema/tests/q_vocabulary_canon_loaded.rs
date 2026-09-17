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

// Canon's hybrid cardinality — "A node may carry one or many facets at each position"
// (Idea/Bimba/Seeds/M/q-vocabulary-canon.md:41) — is written with a facet-variant
// letter directly after the position digit: the first facet bare (implicitly `a`), a
// second as `b`. Attested in canon at Idea/Bimba/Map/M2/M2-3/M2-3.md:42
// (`q_2b_ethical_interiorisation`, alongside that node's bare `q_2_…`), and in the live
// graph as `q_4b_…` / `q_5b_…`. Rejecting these is what failed
// graph-services/tests/dataset_import_live_contract.rs with "unregistered node
// properties".
#[test]
fn q_register_accepts_the_canonical_facet_variant_letter() {
    for key in [
        // Real forms carried by canon / the live graph.
        "q_2b_ethical_interiorisation",
        "q_4b_lemniscate_anchor_and_fractal_doubling",
        "q_5b_epogdoon_and_the_supermind_opening",
        // The first variant written explicitly, and composition with the existing
        // prime marker and interior numeric slot.
        "q_0a_implicate_ground",
        "q_3b'_dialectical_movement",
        "q_5b_3_integration_template",
        "qm_2b_instantiation_mode",
    ] {
        assert!(
            validate_coordinate_prefix_property(key).is_ok(),
            "canonical q facet-variant key rejected: {key}"
        );
    }
}

#[test]
fn q_register_rejects_non_canonical_letters_after_the_position() {
    for key in [
        // Only `a` and `b` are attested; a third variant needs a canon ruling first.
        "q_2c_ethical_interiorisation",
        "q_2z_ethical_interiorisation",
        // The letter is exactly one character, and the `_` separator is still required.
        "q_2bb_ethical_interiorisation",
        "q_2ab_ethical_interiorisation",
        "q_2b",
        "q_2b_",
        // The digit still leads, and the position bound still holds.
        "q_b2_ethical_interiorisation",
        "q_9b_ethical_interiorisation",
        // The suffix stays lower_snake_case.
        "q_2b_EthicalInteriorisation",
    ] {
        assert!(
            validate_coordinate_prefix_property(key).is_err(),
            "malformed q facet-variant key accepted: {key}"
        );
    }
}
