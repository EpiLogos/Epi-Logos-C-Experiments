use portal_core::{
    assert_coordinate_phase_preserved, phase_qualified_vak_token,
    resolve_phase_qualified_coordinate,
};

#[test]
fn resolves_prime_forms_without_collapsing_to_unprimed_address() {
    for coord in ["C3'", "P4'", "L2'", "S5'", "T0'", "M1'"] {
        let resolved = resolve_phase_qualified_coordinate(coord).expect("coordinate resolves");
        assert_eq!(resolved.raw, coord);
        assert_eq!(resolved.phase, "prime");
        assert!(
            resolved.handle.ends_with(coord),
            "handle must carry the original primed coordinate: {:?}",
            resolved
        );
        assert_ne!(resolved.handle, resolved.handle.replace('\'', ""));
    }
}

#[test]
fn resolves_property_level_i_forms_without_collapse() {
    let resolved = resolve_phase_qualified_coordinate("q_5_i_integration_template")
        .expect("property resolves");
    assert_eq!(resolved.raw, "q_5_i_integration_template");
    assert_eq!(resolved.family, "q");
    assert_eq!(resolved.position, "5");
    assert_eq!(resolved.phase, "inverted_property");
    assert!(resolved.handle.contains("q_5_i_integration_template"));
}

#[test]
fn rejects_phase_erasing_round_trip() {
    let err = assert_coordinate_phase_preserved("C3'", "C3").expect_err("must reject collapse");
    assert!(
        err.contains("phase-erasing"),
        "error should explain phase erasure, got {err}"
    );
    assert_coordinate_phase_preserved("C3'", "C3'").expect("same prime phase is accepted");
    assert_coordinate_phase_preserved("q_5_i_integration_template", "q_5_i_integration_template")
        .expect("same property inversion is accepted");
}

#[test]
fn vak_overflow_tokens_preserve_prime_phase_for_dereference() {
    let token = phase_qualified_vak_token("s5'.gnostic.resolve", "C3'").expect("token");
    assert!(token.contains("<vak:"));
    assert!(token.contains("coord=\"C3'\""));
    assert!(token.contains("phase=\"prime\""));
    assert!(token.contains("s5'.gnostic.resolve(C3')"));

    let trace = phase_qualified_vak_token("s0'.anuttara.trace", "q_5_i_integration_template")
        .expect("trace token");
    assert!(trace.contains("coord=\"q_5_i_integration_template\""));
    assert!(trace.contains("phase=\"inverted_property\""));
    assert!(trace.contains("s0'.anuttara.trace(q_5_i_integration_template)"));
}
