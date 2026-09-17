//! Coordinate: S2 (Q-articulation verification contract)
//! Residency: Body/S/S2/graph-services/tests
//! Position (#n): graph-backed amendment verification
//! Actualises: Q amendment preflight refusal and Anuttara diagnostic shape.
//! Public surface: integration contract for `verify_bimba_q_articulation`.
//! Does NOT own: Bimba mutation, Hen frontmatter planning, or review decisions.
//! Contract: [[S2-SPEC]] / [[S2-ARCHITECTURE]].

use epi_s2_graph_services::{q_articulation_review_epoch_key, validate_q_articulation_key};

#[test]
fn q_articulation_keys_map_to_their_own_review_epoch_key() {
    validate_q_articulation_key("q_5_return").expect("canonical Q key");
    assert_eq!(
        q_articulation_review_epoch_key("q_5_return").expect("review epoch key"),
        "qm_5_review_epoch_return"
    );
}

#[test]
fn q_articulation_verification_refuses_metadata_and_private_q_partitions() {
    assert!(validate_q_articulation_key("qm_5_review_epoch_return").is_err());
    assert!(validate_q_articulation_key("q_personal_return").is_err());
}
