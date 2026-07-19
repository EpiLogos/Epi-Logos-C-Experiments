// Coordinate: M3'/M1' :: phase-space core (S0 acceptance, Sprint-8 E1+E2)
// The 720 possibility space: FFI parity with the C .rodata LUT, the
// 384 = 360 + 24 = 64×6 topology law, the two valence planes, the §4 lens
// formula, and the tick carried across the 16+1 temporal apertures.

use portal_core::{
    kernel_tick_from_epogdoon, raw_clock_degree_entry, ClockDegreeNode, MathemeHarmonicProfile,
    PhasePlane, PhaseSpaceAddress, PhaseValence, RawClockDegreeEntry, CLOCK_LENSES_16,
};

#[test]
fn raw_entry_layout_matches_the_c_struct() {
    // Clock_Degree_Entry: u16 + f32 + 20×u8 + 2×u16 + 2×u8, C-aligned to 36.
    assert_eq!(std::mem::size_of::<RawClockDegreeEntry>(), 36);
    assert_eq!(std::mem::align_of::<RawClockDegreeEntry>(), 4);
    // Field-offset pins (verifier note): a silent C-struct reorder must fail
    // here, not corrupt the view — including the currently-all-zero fields
    // the value sweeps cannot distinguish.
    assert_eq!(
        std::mem::offset_of!(RawClockDegreeEntry, exact_degree_720),
        4
    );
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, zodiac_sign), 8);
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, hexagram_id), 13);
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, tarot_card_id), 19);
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, decan_planet), 20);
    assert_eq!(
        std::mem::offset_of!(RawClockDegreeEntry, m1_ananda_value),
        26
    );
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, m0_archetype), 27);
    assert_eq!(std::mem::offset_of!(RawClockDegreeEntry, shadow_degree), 28);
    assert_eq!(
        std::mem::offset_of!(RawClockDegreeEntry, chamber_day_night),
        33
    );
}

#[test]
fn spot_entries_match_the_generated_table() {
    // Values from m3_clock_lut.c's own generated comments.
    let d0 = raw_clock_degree_entry(0);
    assert_eq!(d0.degree_node_360, 0);
    assert_eq!(d0.exact_degree_720, 0.0);
    assert_eq!(d0.is_backbone_node, 1);
    assert_eq!((d0.hexagram_id, d0.hexagram_line_active), (0, 0));
    assert_eq!(d0.is_non_dual_codon, 1);
    assert_eq!(d0.codon_class, 0); // perfect
    assert_eq!(
        (d0.decan_planet, d0.decan_element, d0.decan_chakra),
        (4, 0, 2)
    );
    assert_eq!((d0.shadow_degree, d0.polar_opposite), (360, 180));

    let d6 = raw_clock_degree_entry(6);
    assert_eq!(d6.exact_degree_720, 12.0); // degree × 2 — two phase units per degree
    assert_eq!((d6.hexagram_id, d6.hexagram_line_active), (1, 0));
    assert_eq!(d6.codon_class, 2);
    assert_eq!((d6.codon_upper_pair, d6.codon_lower_pair), (0, 1));
    assert_eq!(d6.dr_ring, 1);

    let d359 = raw_clock_degree_entry(359);
    assert_eq!((d359.hexagram_id, d359.hexagram_line_active), (63, 4));
    assert_eq!((d359.zodiac_sign, d359.decan_idx), (11, 35));
    assert_eq!(d359.is_non_dual_codon, 1);
    assert_eq!(d359.codon_class, 0); // perfect palindrome G|G
    assert_eq!((d359.codon_upper_pair, d359.codon_lower_pair), (3, 3));
    assert_eq!(d359.tick12, 11);
    assert_eq!((d359.shadow_degree, d359.polar_opposite), (719, 179));
    assert_eq!((d359.enneadic_chamber, d359.chamber_day_night), (8, 1));
}

#[test]
fn topology_law_384_equals_360_plus_24_backbone() {
    let mut backbone = 0;
    let mut line_slots = std::collections::BTreeSet::new();
    let mut hexagrams = std::collections::BTreeSet::new();
    for degree in 0u16..360 {
        let raw = raw_clock_degree_entry(degree);
        if raw.is_backbone_node != 0 {
            backbone += 1;
            assert_eq!(degree % 15, 0, "backbone anchors sit at d%15==0");
        }
        assert!(raw.hexagram_id < 64);
        assert!(raw.hexagram_line_active < 6);
        line_slots.insert((raw.hexagram_id, raw.hexagram_line_active));
        hexagrams.insert(raw.hexagram_id);
    }
    assert_eq!(backbone, 24, "24 palindromic anchors");
    assert_eq!(hexagrams.len(), 64, "all 64 hexagrams reach the face");
    assert_eq!(
        line_slots.len(),
        360,
        "the 360 dynamic degrees occupy 360 distinct (hexagram, line) slots — the other 24 of 384 are the backbone anchors"
    );
}

#[test]
fn fibonacci_ground_carries_the_c_lut_and_backbone_for_renderers() {
    let address = PhaseSpaceAddress::from_degree720(144);
    let ground = &address.fibonacci_ground;
    assert_eq!(
        ground.digit_lut.as_deref(),
        Some(
            &[
                0, 1, 1, 2, 3, 5, 8, 3, 1, 4, 5, 9, 4, 3, 7, 0, 7, 7, 4, 1, 5, 6, 1, 7, 8, 5, 3, 8,
                1, 9, 0, 9, 9, 8, 7, 5, 2, 7, 9, 6, 5, 1, 6, 7, 3, 0, 3, 3, 6, 9, 5, 4, 9, 3, 2, 5,
                7, 2, 9, 1,
            ][..]
        ),
        "the profile must carry the compiled C Pisano LUT verbatim"
    );
    assert_eq!(
        ground.backbone_degrees.as_deref(),
        Some(
            &[
                0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255,
                270, 285, 300, 315, 330, 345,
            ][..]
        ),
        "the profile must carry CLOCK_BACKBONE degree positions verbatim"
    );
}

#[test]
fn kernel_cross_lut_consistency_holds_for_all_degrees() {
    for degree in 0u16..360 {
        let raw = raw_clock_degree_entry(degree);
        assert_eq!(raw.degree_node_360, degree);
        assert_eq!(raw.exact_degree_720, degree as f32 * 2.0);
        assert_eq!(raw.decan_idx as u16, degree / 10);
        assert_eq!(raw.decan_position as u16, degree % 10);
        assert_eq!(
            raw.tick12 as u16,
            degree / 30,
            "degree tick12 is the 30° arc"
        );
        assert_eq!(raw.shadow_degree, degree + 360);
        assert_eq!(raw.polar_opposite, (degree + 180) % 360);
        assert_eq!(raw.enneadic_chamber as u16, degree / 40);
        assert_eq!(raw.zodiac_sign as u16, degree / 30);
        assert_eq!(raw.zodiac_degree as u16, degree % 30);
        // ONE decan-ruler law across the whole kernel: the C LUT's ruler,
        // the parashakti table the live-planet resonance events read, and
        // the canonical Chaldean cycle must all agree. (This assertion
        // caught the triplicity-grouped drekkana data that had been living
        // in DECAN_RULERS_36 — corrected 2026-07-02.)
        const CHALDEAN_CYCLE: [u8; 7] = [4, 0, 3, 2, 1, 6, 5]; // Mars Sun Venus Mercury Moon Saturn Jupiter
        assert_eq!(
            raw.decan_planet,
            portal_core::decan_ruler(raw.decan_idx),
            "degree {degree}: LUT decan ruler must match DECAN_RULERS_36"
        );
        assert_eq!(
            raw.decan_planet,
            CHALDEAN_CYCLE[(raw.decan_idx % 7) as usize],
            "degree {degree}: ruler must follow the descending Chaldean cycle"
        );
    }
    // The classic Chaldean closure: the wheel starts AND ends on Mars.
    assert_eq!(portal_core::decan_ruler(0), 4);
    assert_eq!(portal_core::decan_ruler(35), 4);
}

#[test]
fn the_sixteen_lenses_tile_360_and_the_formula_matches_the_pinned_cases() {
    assert_eq!(CLOCK_LENSES_16.len(), 16);
    for lens in CLOCK_LENSES_16.iter() {
        assert_eq!(
            lens.slice * lens.sections,
            360,
            "{} must tile 360",
            lens.name
        );
    }
    // The Architect's temporality structurers: 4-, 12-, 24-section divisions
    // (the 60-fold rides the Fibonacci Ground aperture, never a 17th lens).
    let canon: Vec<u16> = CLOCK_LENSES_16
        .iter()
        .filter(|lens| lens.temporal_canon)
        .map(|lens| lens.sections)
        .collect();
    assert_eq!(canon, vec![24, 12, 4]);

    // §4 formula parity with the app-pinned 144° cases (cosmicMath tests).
    let node = ClockDegreeNode::from_degree360(144);
    assert_eq!(node.lens_segment[0], 144); // Microscopic 1°
    assert_eq!(node.lens_segment[13], 1); // Quadrant 90°
    assert_eq!(node.lens_segment[9], 4); // Solar Month 30°
    assert_eq!(node.lens_segment[7], 9); // Hourly 15°
    assert_eq!(node.lens_segment[11], 3); // Greater Chamber 40°
    assert_eq!(node.lens_segment[6], 12); // Pleromatic LUT row (12°×30)
}

#[test]
fn the_two_planes_select_codon_and_hexagram_valence() {
    // Primary traversal (0-359): the codon face is active.
    let primary = PhaseSpaceAddress::from_degree720(144);
    assert_eq!(primary.plane, PhasePlane::PrimaryCodon);
    assert_eq!(primary.degree360, 144);
    match &primary.active_valence {
        PhaseValence::Codon {
            upper_pair,
            lower_pair,
            ..
        } => {
            assert_eq!(*upper_pair, primary.node.codon_upper_pair);
            assert_eq!(*lower_pair, primary.node.codon_lower_pair);
        }
        other => panic!("primary plane must read the codon face, got {other:?}"),
    }

    // Shadow traversal (360-719): the hexagram face of the SAME degree.
    let shadow = PhaseSpaceAddress::from_degree720(144 + 360);
    assert_eq!(shadow.plane, PhasePlane::ShadowHexagram);
    assert_eq!(shadow.degree360, 144);
    assert_eq!(
        shadow.node, primary.node,
        "one degree node, two valence planes"
    );
    match &shadow.active_valence {
        PhaseValence::Hexagram {
            hexagram_id,
            line_active,
        } => {
            assert_eq!(*hexagram_id, shadow.node.hexagram_id);
            assert_eq!(*line_active, shadow.node.hexagram_line_active);
        }
        other => panic!("shadow plane must read the hexagram face, got {other:?}"),
    }
}

#[test]
fn the_lens_carrier_carries_the_tick_across_all_sixteen_plus_one_apertures() {
    let address = PhaseSpaceAddress::from_degree720(144);
    assert_eq!(address.lens_carrier.len(), 16);
    for (i, carried) in address.lens_carrier.iter().enumerate() {
        let lens = &CLOCK_LENSES_16[i];
        assert_eq!(carried.segment, 144 / lens.slice);
        assert_eq!(carried.degree_in_segment, 144 % lens.slice);
        let expected_phase = (144 % lens.slice) as f32 / lens.slice as f32;
        assert!((carried.phase01 - expected_phase).abs() < 1e-6);
        assert!(carried.phase01 >= 0.0 && carried.phase01 < 1.0);
        assert_eq!(carried.temporal_canon, lens.temporal_canon);
    }
    // The +1 is the primary functional lens: Fibonacci Ground at lens id 16.
    assert_eq!(address.fibonacci_ground.lens_id, 16);
    assert_eq!(address.fibonacci_ground.role, "primary-ground");
    assert_eq!(address.fibonacci_ground.slice, 6);
    assert_eq!(address.fibonacci_ground.sections, 60);
    assert_eq!(address.fibonacci_ground.position, 24); // 144 / 6
    assert!(address.fibonacci_ground.temporal_canon);
    // Pisano-60 digits: fib(0..)=0,1,1,2,3,5,8,13,21,34,55,89 → digit(11)=9.
    let d11 = PhaseSpaceAddress::from_degree720(11 * 6);
    assert_eq!(d11.fibonacci_ground.position, 11);
    assert_eq!(d11.fibonacci_ground.digit, 9);
    let d0 = PhaseSpaceAddress::from_degree720(0);
    assert_eq!(d0.fibonacci_ground.digit, 0);
    let d1 = PhaseSpaceAddress::from_degree720(6);
    assert_eq!(d1.fibonacci_ground.digit, 1);
}

#[test]
fn every_generated_tick_gets_a_spot_in_the_phase_space() {
    for sub_tick in 0u8..12 {
        let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, sub_tick));
        let address = profile
            .phase_space
            .as_ref()
            .expect("from_tick always addresses the phase space");
        assert_eq!(address.degree720, profile.degree720);
        assert_eq!(address.degree360, profile.degree360);
        let expected_plane = if profile.degree720 < 360 {
            PhasePlane::PrimaryCodon
        } else {
            PhasePlane::ShadowHexagram
        };
        assert_eq!(address.plane, expected_plane);
        assert_eq!(
            expected_plane == PhasePlane::ShadowHexagram,
            profile.su2_layer == "shadow",
            "phase plane must agree with the profile's su2 layer"
        );
    }
}

#[test]
fn serialization_is_camel_case_and_legacy_payloads_still_deserialize() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, 4));
    let json = serde_json::to_value(&profile).expect("serializes");
    let phase = json.get("phaseSpace").expect("camelCase field present");
    for key in [
        "degree720",
        "degree360",
        "plane",
        "activeValence",
        "node",
        "lensCarrier",
        "fibonacciGround",
        "authority",
    ] {
        assert!(phase.get(key).is_some(), "phaseSpace.{key} present");
    }
    assert!(phase.pointer("/node/lensSegment").is_some());
    assert!(phase.pointer("/node/hexagramId").is_some());
    assert_eq!(
        phase
            .pointer("/lensCarrier/0/name")
            .and_then(|v| v.as_str()),
        Some("Microscopic")
    );

    let round: MathemeHarmonicProfile = serde_json::from_value(json.clone()).expect("round-trips");
    assert_eq!(round.phase_space, profile.phase_space);

    let mut legacy = json;
    legacy.as_object_mut().unwrap().remove("phaseSpace");
    let legacy: MathemeHarmonicProfile =
        serde_json::from_value(legacy).expect("legacy payload deserializes");
    assert_eq!(legacy.phase_space, None);
}
