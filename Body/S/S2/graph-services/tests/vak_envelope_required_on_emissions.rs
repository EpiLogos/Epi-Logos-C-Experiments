use portal_core::assert_coordinate_phase_preserved;

#[test]
fn rejects_vak_emission_that_erases_prime_coordinate_phase() {
    let err = assert_coordinate_phase_preserved("C3'", "C3").expect_err("phase collapse fails");
    assert!(err.contains("phase-erasing"));
}

#[test]
fn rejects_vak_emission_that_erases_property_level_i_phase() {
    let err = assert_coordinate_phase_preserved("m_2_i_colour", "m_2_colour")
        .expect_err("property-level inversion collapse fails");
    assert!(err.contains("phase-erasing"));
}

#[test]
fn accepts_vak_emission_that_preserves_phase_qualified_coordinate() {
    assert_coordinate_phase_preserved("M5'", "M5'").expect("prime M phase survives");
    assert_coordinate_phase_preserved("q_5_i_integration_template", "q_5_i_integration_template")
        .expect("property-level _i_ phase survives");
}
