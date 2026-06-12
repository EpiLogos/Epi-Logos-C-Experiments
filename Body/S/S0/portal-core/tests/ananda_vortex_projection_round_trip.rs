use portal_core::{
    kernel_tick_from_epogdoon, AnandaMatrixOp, AnandaSkeletonEvent, AnandaVortexCell,
    MathemeHarmonicProfile,
};

fn raw_values_for(cells: &[AnandaVortexCell]) -> Vec<Option<i16>> {
    cells.iter().map(|cell| cell.raw_value).collect()
}

fn dr_values_for(cells: &[AnandaVortexCell]) -> Vec<Option<u8>> {
    cells.iter().map(|cell| cell.dr_value).collect()
}

#[test]
fn profile_exposes_ananda_vortex_dual_register_cell_and_round_trips_json() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 5));

    assert_eq!(
        profile.ananda_vortex.active_matrix_op,
        AnandaMatrixOp::Quintessence
    );
    assert_eq!(profile.ananda_vortex.active_cell, (5, 5));
    assert_eq!(profile.ananda_vortex.dr_ring_phase.mahamaya_idx, 5);
    assert_eq!(profile.ananda_vortex.dr_ring_phase.parashakti_idx, 9);
    assert_eq!(profile.ananda_vortex.cl42_signature_at_position, -1);
    assert_eq!(profile.ananda_vortex.helix_sheet, 0);
    assert!(profile.ananda_vortex.klein_flip_at_this_tick);

    let cell = &profile.ananda_vortex.active_cell_value;
    assert_eq!(cell.family, AnandaMatrixOp::Quintessence);
    assert_eq!(cell.row_k, 5);
    assert_eq!(cell.position_p, 5);
    assert_eq!(cell.raw_bimba, 25);
    assert_eq!(cell.raw_pratibimba, 26);
    assert_eq!(cell.raw_sum, 51);
    assert_eq!(cell.raw_delta, 1);
    assert_eq!(cell.raw_value, None);
    assert_eq!(cell.dr_bimba, 7);
    assert_eq!(cell.dr_pratibimba, 8);
    assert_eq!(cell.dr_sum, 6);
    assert_eq!(cell.dr_value, None);
    assert_eq!(cell.rule_value.as_deref(), Some("25/26/51"));

    let json = serde_json::to_value(&profile).expect("profile serializes");
    assert_eq!(json["anandaVortex"]["activeMatrixOp"], "quintessence");
    assert_eq!(
        json["anandaVortex"]["activeCell"],
        serde_json::json!([5, 5])
    );
    assert_eq!(json["anandaVortex"]["activeCellValue"]["rawBimba"], 25);
    assert_eq!(json["anandaVortex"]["activeCellValue"]["drPratibimba"], 8);

    let wire = serde_json::to_string(&profile).expect("profile serializes to string");
    let decoded: MathemeHarmonicProfile =
        serde_json::from_str(&wire).expect("profile deserializes");
    assert_eq!(decoded.ananda_vortex, profile.ananda_vortex);
}

#[test]
fn typed_json_bridge_preserves_both_csv_faces_and_canonical_event_discriminators() {
    let seven_x_plus_one: Vec<_> = (0..12)
        .map(|position| AnandaVortexCell::from_address(AnandaMatrixOp::Pratibimba, 7, position))
        .collect();
    let eight_x_plus_zero: Vec<_> = (0..12)
        .map(|position| AnandaVortexCell::from_address(AnandaMatrixOp::Bimba, 8, position))
        .collect();

    assert_eq!(
        raw_values_for(&seven_x_plus_one),
        vec![
            Some(1),
            Some(8),
            Some(15),
            Some(22),
            Some(29),
            Some(36),
            Some(43),
            Some(50),
            Some(57),
            Some(64),
            Some(71),
            Some(78)
        ]
    );
    assert_eq!(
        dr_values_for(&seven_x_plus_one),
        vec![
            Some(1),
            Some(8),
            Some(6),
            Some(4),
            Some(2),
            Some(9),
            Some(7),
            Some(5),
            Some(3),
            Some(1),
            Some(8),
            Some(6)
        ]
    );
    assert_eq!(
        raw_values_for(&eight_x_plus_zero),
        vec![
            Some(0),
            Some(8),
            Some(16),
            Some(24),
            Some(32),
            Some(40),
            Some(48),
            Some(56),
            Some(64),
            Some(72),
            Some(80),
            Some(88)
        ]
    );
    assert_eq!(
        dr_values_for(&eight_x_plus_zero),
        vec![
            Some(0),
            Some(8),
            Some(7),
            Some(6),
            Some(5),
            Some(4),
            Some(3),
            Some(2),
            Some(1),
            Some(9),
            Some(8),
            Some(7)
        ]
    );

    let json = serde_json::json!({
        "sevenXPlusOne": seven_x_plus_one,
        "eightXPlusZero": eight_x_plus_zero,
    });

    assert_eq!(json["sevenXPlusOne"][5]["family"], "pratibimba");
    assert_eq!(json["sevenXPlusOne"][5]["rowK"], 7);
    assert_eq!(json["sevenXPlusOne"][5]["positionP"], 5);
    assert_eq!(json["sevenXPlusOne"][5]["rawValue"], 36);
    assert_eq!(json["sevenXPlusOne"][5]["rawBimba"], 35);
    assert_eq!(json["sevenXPlusOne"][5]["rawPratibimba"], 36);
    assert_eq!(json["sevenXPlusOne"][5]["rawSum"], 71);
    assert_eq!(json["sevenXPlusOne"][5]["rawDelta"], 1);
    assert_eq!(json["sevenXPlusOne"][5]["drValue"], 9);
    assert_eq!(json["sevenXPlusOne"][5]["drBimba"], 8);
    assert_eq!(json["sevenXPlusOne"][5]["drPratibimba"], 9);
    assert_eq!(json["sevenXPlusOne"][5]["drSum"], 8);
    assert_eq!(json["sevenXPlusOne"][5]["skeletonEvent"], "Hit36");

    assert_eq!(json["sevenXPlusOne"][9]["rawValue"], 64);
    assert_eq!(
        json["sevenXPlusOne"][9]["skeletonEvent"],
        "Ratio64Over36"
    );
    assert_eq!(json["eightXPlusZero"][8]["rawValue"], 64);
    assert_eq!(json["eightXPlusZero"][8]["skeletonEvent"], "Hit64");
    assert_eq!(json["eightXPlusZero"][9]["rawValue"], 72);
    assert_eq!(json["eightXPlusZero"][9]["skeletonEvent"], "Hit72");
}

#[test]
fn ananda_vortex_cell_marks_csv_skeleton_events_without_coordinate_reconstruction() {
    let hit36 = AnandaVortexCell::from_address(AnandaMatrixOp::Pratibimba, 7, 5);
    assert_eq!(hit36.skeleton_event, Some(AnandaSkeletonEvent::Hit36));
    assert_eq!(hit36.raw_value, Some(36));
    assert_eq!(hit36.dr_value, Some(9));

    let hit64 = AnandaVortexCell::from_address(AnandaMatrixOp::Pratibimba, 7, 9);
    assert_eq!(
        hit64.skeleton_event,
        Some(AnandaSkeletonEvent::Ratio64Over36)
    );
    assert_eq!(hit64.raw_value, Some(64));
    assert_eq!(hit64.dr_value, Some(1));

    let hit72 = AnandaVortexCell::from_address(AnandaMatrixOp::Bimba, 8, 9);
    assert_eq!(hit72.skeleton_event, Some(AnandaSkeletonEvent::Hit72));
    assert_eq!(hit72.raw_value, Some(72));
    assert_eq!(hit72.dr_value, Some(9));

    let additive137 = AnandaVortexCell::from_address(AnandaMatrixOp::Sum, 8, 9);
    assert_eq!(
        additive137.skeleton_event,
        Some(AnandaSkeletonEvent::Additive137)
    );
    assert_eq!(
        (additive137.raw_bimba - 8) + hit72.raw_value.unwrap() + 1,
        137
    );
}
