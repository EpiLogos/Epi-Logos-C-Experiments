//! Coordinate: M0' #0-4 (16-fold Void-Structure profile projection)
//! Residency: Body/S/S0/portal-core/tests
//! Position (#n): kernel-to-public-profile contract gate
//! Actualises: the existing 16 clock lenses as an exact, stable M0 ring payload.
//! Public surface: behavioral tests for MathemeHarmonicProfile.m0_void_structure_ring.
//! Does NOT own: renderer geometry, branch selection, or a second lens table.
//! Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.15.

use portal_core::{
    kernel_tick_from_epogdoon, M0VoidLensState, MathemeHarmonicProfile, CLOCK_LENSES_16,
};

#[test]
fn current_profile_projects_all_sixteen_clock_lenses_in_canonical_order() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 7));

    assert_eq!(profile.m0_void_structure_ring.len(), CLOCK_LENSES_16.len());
    for (index, (actual, authority)) in profile
        .m0_void_structure_ring
        .iter()
        .zip(CLOCK_LENSES_16.iter())
        .enumerate()
    {
        assert_eq!(actual.lens_index, index as u8);
        assert_eq!(actual.coordinate, format!("#0-4-{index}"));
        assert_eq!(actual.label, authority.name);
        assert_eq!(actual.state, M0VoidLensState::Canonical);
    }
}

#[test]
fn ring_is_stable_across_ticks_and_serializes_under_the_exact_wire_key() {
    let first = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(1, 0));
    let later = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(9, 11));
    assert_eq!(first.m0_void_structure_ring, later.m0_void_structure_ring);

    let json = serde_json::to_value(&first).expect("profile serializes");
    let ring = json
        .get("m0_void_structure_ring")
        .and_then(serde_json::Value::as_array)
        .expect("exact snake-case ring key is present");
    assert_eq!(ring.len(), 16);
    assert!(json.get("m0VoidStructureRing").is_none());
    assert_eq!(ring[15]["lensIndex"], 15);
    assert_eq!(ring[15]["coordinate"], "#0-4-15");
    assert_eq!(ring[15]["state"], "canonical");
}

#[test]
fn older_profiles_without_the_field_deserialize_to_the_kernel_projection() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 3));
    let mut json = serde_json::to_value(profile).expect("profile serializes");
    json.as_object_mut()
        .expect("profile object")
        .remove("m0_void_structure_ring");

    let decoded: MathemeHarmonicProfile =
        serde_json::from_value(json).expect("legacy profile deserializes");
    assert_eq!(decoded.m0_void_structure_ring.len(), 16);
    assert_eq!(decoded.m0_void_structure_ring[0].label, "Microscopic");
    assert_eq!(decoded.m0_void_structure_ring[15].label, "Unity");
}
