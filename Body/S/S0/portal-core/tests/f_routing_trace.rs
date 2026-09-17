use portal_core::{
    cymatic_invert, emit_m2_cymatic_flip, AsmaNameDesc, CymaticInvertState, CymaticPhase,
};
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

// ══════════════════════════════════════════════════════════════════════
// 03.T3.10: Asma mirror overlay + kernel phase-flip integration tests
// ══════════════════════════════════════════════════════════════════════

#[test]
fn asma_mirror_idx_round_trip() {
    // Every populated mirror_idx resolves to a valid Asma entry.
    for name_idx in 0..100u8 {
        let desc = AsmaNameDesc::for_index(name_idx);
        assert_eq!(desc.name_idx, name_idx);

        if desc.has_mirror {
            // mirror_idx points to a valid entry in 0..100
            assert!(
                desc.mirror_idx < 100,
                "mirror_idx out of range for name_idx {name_idx}"
            );
            // The mirror of the mirror should point back (Jalal↔Jamal symmetry)
            let mirror_desc = AsmaNameDesc::for_index(desc.mirror_idx);
            if mirror_desc.has_mirror && mirror_desc.group < 2 {
                assert!(
                    mirror_desc.mirror_idx == name_idx || mirror_desc.group == desc.group,
                    "mirror symmetry broken for name_idx {name_idx} → mirror {mirror} → back {back}",
                    mirror = desc.mirror_idx,
                    back = mirror_desc.mirror_idx,
                );
            }
        } else {
            // 0xFF means explicit absence — not an error
            assert_eq!(
                desc.mirror_idx, 0xFF,
                "has_mirror=false but mirror_idx != 0xFF"
            );
        }
    }

    // Index 99 (supreme name, Allah) has no mirror.
    let supreme = AsmaNameDesc::for_index(99);
    assert!(!supreme.has_mirror);
    assert_eq!(supreme.mirror_idx, 0xFF);
    assert_eq!(supreme.group, 3);
}

#[test]
fn emit_m2_cymatic_flip_at_boundary() {
    // At tick12=7 (the canonical M2 cymatic flip boundary), when the Asma
    // name has a mirror, emit_m2_cymatic_flip returns Some.
    let flip = emit_m2_cymatic_flip(42, "clarity", 2, 7);
    assert!(flip.is_some());
    let event = flip.unwrap();
    match event {
        portal_core::KleinFlipEvent::M2CymaticValenceInvert {
            valence_before,
            valence_after,
        } => {
            assert_eq!(valence_before, portal_core::Valence::Primary);
            assert_eq!(valence_after, portal_core::Valence::Inverted);
        }
        _ => panic!("expected M2CymaticValenceInvert, got {:?}", event),
    }

    // At tick12=5 (not a flip boundary), emit returns None.
    let no_flip = emit_m2_cymatic_flip(42, "clarity", 2, 5);
    assert!(no_flip.is_none());
}

#[test]
fn cymatic_invert_query_returns_mirror_state() {
    // cymatic_invert returns full mirror state including phase.
    let state = cymatic_invert(42, "clarity", 2, 5);
    assert_eq!(state.address72, 42);
    assert_eq!(state.phase, CymaticPhase::Primary);
    assert_eq!(state.phase_law, "#/inversion_spanda");
    assert!(!state.last_flip_candidate);

    // At the flip boundary with a mirror-capable name, phase is Inverted.
    let flip_state = cymatic_invert(42, "clarity", 2, 7);
    assert!(flip_state.last_flip_candidate);
    // Phase becomes Inverted at the boundary when mirror exists.
    // Note: the actual phase depends on whether the selected Asma name has a mirror.
    if flip_state.asma.has_mirror {
        assert_eq!(flip_state.phase, CymaticPhase::Inverted);
    }
}

#[test]
fn routing_trace_carries_asma_overlay() {
    let kerykeion =
        KerykeionRoutingState::from_json(COMPLETE_NATAL).expect("fixture is valid Kerykeion state");
    let tick = kernel_tick_from_epogdoon(4, 9);

    let trace = f_routing("clarity", &kerykeion, tick);

    // asma_name is still the raw index for backward compat
    assert_eq!(trace.asma_name, 51);
    // asma overlay field carries the full descriptor
    assert_eq!(trace.asma.name_idx, 51);
    assert!(trace.asma.has_mirror);
    assert_eq!(trace.asma.mirror_idx, 51 - 33); // Jalal→Jamal mirror
    assert_eq!(trace.asma.group, 1); // Jamal group (33-65)
}

#[test]
fn asma_mirror_phase_trace_serde_round_trips() {
    let kerykeion =
        KerykeionRoutingState::from_json(COMPLETE_NATAL).expect("fixture is valid Kerykeion state");
    let tick = kernel_tick_from_epogdoon(4, 9);

    let trace = f_routing("clarity", &kerykeion, tick);
    let json = serde_json::to_value(&trace).expect("routing trace serializes");

    // asma overlay is present in serialized form
    assert_eq!(json["asma"]["nameIdx"], 51);
    assert_eq!(json["asma"]["hasMirror"], true);

    // Round-trip: deserialize back
    let round_tripped: portal_core::RoutingTrace =
        serde_json::from_value(json).expect("routing trace deserializes");
    assert_eq!(round_tripped.asma, trace.asma);
}
