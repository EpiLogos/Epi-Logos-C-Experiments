//! CCT-14b: the S2 schema regex matcher (CCT-16's coordinate-prefix law)
//! accepts the `c_5_birth_*` family, and the family is registered as
//! canonical node properties (not left as "dynamic, requires review").

use epi_s2_graph_schema::{
    canonical_property_key, node_property_spec, validate_coordinate_prefix_property,
    GraphPropertyType,
};

const BIRTH_FAMILY: [&str; 9] = [
    "c_5_birth_codon",
    "c_5_birth_chromosome",
    "c_5_birth_rotational_class",
    "c_5_birth_transcript_class",
    "c_5_birth_governance_role",
    "c_5_birth_pp",
    "c_5_birth_nn",
    "c_5_birth_np",
    "c_5_birth_pn",
];

#[test]
fn regex_matcher_accepts_the_c_5_birth_family() {
    for key in BIRTH_FAMILY {
        validate_coordinate_prefix_property(key)
            .unwrap_or_else(|err| panic!("{key} must pass the coordinate-prefix regex: {err}"));
    }
}

#[test]
fn birth_family_is_registered_canonical_not_dynamic() {
    for key in BIRTH_FAMILY {
        let canonical = canonical_property_key(key)
            .unwrap_or_else(|err| panic!("{key} must be a canonical registered property: {err}"));
        assert_eq!(canonical, key);
        assert!(node_property_spec(key).is_some());
    }
    // birth_codon_state has no coordinate prefix but must still be canonical.
    assert_eq!(
        canonical_property_key("birth_codon_state").unwrap(),
        "birth_codon_state"
    );
}

#[test]
fn birth_codon_is_an_indexed_integer_and_state_is_a_closed_enum() {
    let codon = node_property_spec("c_5_birth_codon").unwrap();
    assert_eq!(codon.value_type, GraphPropertyType::Integer);
    assert!(codon.indexed, "wheel-density + delete-by-codon key on it");

    let state = node_property_spec("birth_codon_state").unwrap();
    match state.value_type {
        GraphPropertyType::Enum(values) => {
            assert_eq!(values, &["provisional", "ratified"]);
        }
        other => panic!("birth_codon_state must be a closed enum, got {other:?}"),
    }
    assert!(state.indexed);
}
