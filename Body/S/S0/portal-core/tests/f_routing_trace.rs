use portal_core::{f_routing, kernel_tick_from_epogdoon, KerykeionRoutingState, RoutingAxisViews};

const COMPLETE_NATAL: &str = include_str!("fixtures/kerykeion_natal_complete.json");

#[test]
fn f_routing_is_deterministic_for_fixed_intent_kerykeion_and_time() {
    let kerykeion =
        KerykeionRoutingState::from_json(COMPLETE_NATAL).expect("fixture is valid Kerykeion state");
    let tick = kernel_tick_from_epogdoon(4, 9);

    let first = f_routing("clarity", &kerykeion, tick);
    let second = f_routing("clarity", &kerykeion, tick);

    assert_eq!(first, second);
    assert_eq!(first.planetary_hour_ruler, 2);
    assert_eq!(first.active_decan, 12);
    assert_eq!(first.shem_pair.light_idx, 24);
    assert_eq!(first.shem_pair.shadow_idx, 25);
    assert_eq!(first.maqam_family, 3);
    assert_eq!(first.maqam_mode, 0);
    assert_eq!(first.mantra_index, 41);
    assert_eq!(first.asma_name, 51);
    assert_eq!(first.index72, 25);
    assert_eq!(first.det64, 1_u64 << 25);
    assert_eq!(first.axis_views.index72(), Some(first.index72));

    let json = serde_json::to_value(&first).expect("routing trace serializes");
    assert_eq!(json["planetaryHourRuler"], 2);
    assert_eq!(json["shemPair"]["lightIdx"], 24);
    assert_eq!(json["maqamFamily"], 3);
    assert_eq!(json["det64"], serde_json::json!(1_u64 << 25));
    assert_eq!(
        json["depositHandle"],
        "m4.deposit://nara-journal/m2/f-routing/index72/25/det64/0000000002000000"
    );
    assert_eq!(
        json["depositHandlePrivacyClass"],
        "protected_local_handle_only"
    );
}

#[test]
fn index72_round_trips_through_all_six_axis_views() {
    for index72 in 0..72 {
        let views = RoutingAxisViews::for_index72(index72).expect("0..71 is routable");
        assert_eq!(views.index72(), Some(index72));
        assert_eq!(views.mef.index72(), index72);
        assert_eq!(views.tattva.index72(), index72);
        assert_eq!(views.decan.index72(), index72);
        assert_eq!(views.shem.index72(), index72);
        assert_eq!(views.maqam.index72(), index72);
        assert_eq!(views.det.index72(), index72);
    }

    assert!(RoutingAxisViews::for_index72(72).is_none());
}
