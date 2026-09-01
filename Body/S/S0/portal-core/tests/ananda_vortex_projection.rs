use portal_core::{
    kernel_tick_from_epogdoon, AnandaDirectPrimePhase, AnandaMatrixOp,
    AnandaSkeletonEvent, AnandaVortexCell, MathemeHarmonicProfile,
};

#[test]
fn canonical_source_spots_surface_without_register_collapse() {
    let p75 = AnandaVortexCell::project(AnandaMatrixOp::Pratibimba, 7, 5).unwrap();
    let b88 = AnandaVortexCell::project(AnandaMatrixOp::Bimba, 8, 8).unwrap();
    let b89 = AnandaVortexCell::project(AnandaMatrixOp::Bimba, 8, 9).unwrap();

    assert_eq!(p75.raw_value, Some(36));
    assert_eq!(p75.dr_value, Some(9));
    assert_eq!(p75.decimal10_value, Some(6));
    assert_eq!(p75.skeleton_event, Some(AnandaSkeletonEvent::Hit36));

    assert_eq!(b88.raw_value, Some(64));
    assert_eq!(b88.dr_value, Some(1));
    assert_eq!(b88.decimal10_value, Some(4));
    assert_eq!(b88.skeleton_event, Some(AnandaSkeletonEvent::Hit64));

    assert_eq!(b89.raw_value, Some(72));
    assert_eq!(b89.dr_value, Some(9));
    assert_eq!(b89.decimal10_value, Some(2));
    assert_eq!(b89.skeleton_event, Some(AnandaSkeletonEvent::Hit72));
}

#[test]
fn harmonic_profile_carries_active_ananda_source_state() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(9, 10));
    let ananda = &profile.ananda_vortex;

    assert_eq!(ananda.active_matrix_op, AnandaMatrixOp::DiffB);
    assert_eq!(ananda.active_cell, [10, 4]);
    assert_eq!(ananda.active_cell_value.raw_value, Some(1));
    assert_eq!(ananda.active_cell_value.dr_value, Some(1));
    assert_eq!(ananda.active_cell_value.decimal10_value, None);
    assert_eq!(ananda.oscillatory.phase, AnandaDirectPrimePhase::Prime);
    assert_eq!(ananda.oscillatory.conjugate_tick12, 4);
    assert_eq!(ananda.oscillatory.conjugate_position6, 4);
    assert_eq!(
        ananda.oscillatory.conjugate_phase,
        AnandaDirectPrimePhase::Direct
    );
    assert_eq!(ananda.hopf_fiber, 1);
    assert_eq!(ananda.spanda_stage_index, 4);
    assert_eq!(ananda.dr_ring_phase.position_index, 4);
    assert_eq!(ananda.dr_ring_phase.mahamaya_value, 7);
    assert_eq!(ananda.dr_ring_phase.parashakti_value, 6);
    assert_eq!(ananda.cl42_signature_at_position, 1);
    assert_eq!(ananda.ring_quaternion, [-0.866_025_4, -0.5, 0.0, 0.0]);
    assert!(!ananda.klein_flip_at_this_tick);
    assert!(ananda.source_ref.contains("Vortex Modulae"));
    assert!(ananda.derivation_ref.contains("EXECUTABLE-SUBSTRATE-CONTRACT"));
    assert!(ananda.phase_ref.contains("MUSICAL-DERIVATION-LOCK"));
}

#[test]
fn all_four_direct_prime_x_hopf_combinations_are_first_class() {
    let cases = [
        (0u64, 1u8, AnandaDirectPrimePhase::Direct, 0u8),
        (0, 7, AnandaDirectPrimePhase::Prime, 0),
        (1, 1, AnandaDirectPrimePhase::Direct, 1),
        (1, 7, AnandaDirectPrimePhase::Prime, 1),
    ];

    for (cycle, tick12, phase, hopf_fiber) in cases {
        let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12));
        assert_eq!(profile.ananda_vortex.oscillatory.phase, phase);
        assert_eq!(profile.ananda_vortex.hopf_fiber, hopf_fiber);
    }
}

#[test]
fn tick_six_is_prime_boundary_without_becoming_second_hopf_fiber() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, 6));

    assert_eq!(profile.degree360, 180);
    assert_eq!(profile.degree720, 180);
    assert_eq!(profile.helix, "pratibimba");
    assert_eq!(profile.su2_layer, "primary");
    assert_eq!(
        profile.ananda_vortex.oscillatory.phase,
        AnandaDirectPrimePhase::Prime
    );
    assert_eq!(profile.ananda_vortex.hopf_fiber, 0);
    assert!(profile.ananda_vortex.klein_flip_at_this_tick);
}
