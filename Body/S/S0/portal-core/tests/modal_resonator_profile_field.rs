// Coordinate: M1'/M2'/M3' :: modal-resonator-bell-kernel (S0 acceptance)
// Bell-kernel spec §11 test class "S0 profile projection": the generated
// profile carries the modal/bell interpretation of the 8+4 bus, the bus
// stays the only pitch/nodal authority, and the 7+5 / 8+4 cuts tile the
// same 12-slot chromatic body without competing.

use portal_core::{
    kernel_tick_from_epogdoon, KernelTick, MathemeHarmonicProfile, BELL_PARTIAL_ROLES,
    NODAL_ANCHOR_ROLES,
};

fn tick() -> KernelTick {
    kernel_tick_from_epogdoon(3, 4)
}

/// Every sub-tick of two cycles — the invariants must hold across the whole
/// tick landscape, not one curated fixture.
fn all_ticks() -> impl Iterator<Item = KernelTick> {
    (0..2u64).flat_map(|cycle| (0..12u8).map(move |sub| kernel_tick_from_epogdoon(cycle, sub)))
}

#[test]
fn generated_profile_contains_modal_resonator() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile
            .modal_resonator
            .as_ref()
            .expect("from_tick derives the modal resonator from its own bus state");
        assert_eq!(modal.schema_version, 1);
        assert_eq!(modal.source, "MathemeHarmonicProfile");
        assert_eq!(modal.tick, profile.tick);
        assert_eq!(modal.tick12, profile.tick12);
        assert_eq!(modal.degree720, profile.degree720);
    }
}

#[test]
fn live_octet_hz_equals_audio_octet_exactly() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();
        assert_eq!(modal.live_octet.len(), 8);
        for (i, carrier) in modal.live_octet.iter().enumerate() {
            assert_eq!(carrier.octet_index as usize, i);
            assert_eq!(
                carrier.hz, profile.audio_octet[i],
                "liveOctet[{i}].hz must equal audio_octet[{i}] — the bus is the only pitch authority"
            );
        }
    }
}

#[test]
fn nodal_quartet_is_structurally_copied_from_the_bus() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();
        assert_eq!(modal.nodal_quartet.len(), 4);
        for (i, anchor) in modal.nodal_quartet.iter().enumerate() {
            let source = &profile.nodal_quartet[i];
            assert_eq!(anchor.quartet_index as usize, i);
            assert_eq!(anchor.ql_position, source.ql_position);
            assert_eq!(anchor.helix, source.helix);
            assert_eq!(anchor.m, source.m);
            assert_eq!(anchor.n, source.n);
            assert_eq!(anchor.role, NODAL_ANCHOR_ROLES[i]);
        }
    }
}

#[test]
fn chromatic_body_has_twelve_slots_partitioned_seven_plus_five() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();

        assert_eq!(modal.chromatic_body.len(), 12);
        assert_eq!(modal.diatonic_set.len(), 7);
        assert_eq!(modal.silent_complement.len(), 5);

        for (pc, slot) in modal.chromatic_body.iter().enumerate() {
            assert_eq!(slot.pitch_class as usize, pc);
            // Exactly one of diatonic / silent — a partition, not a mask.
            assert_eq!(
                slot.is_diatonic,
                slot.silent_anchor_role.is_none(),
                "slot {pc} must be diatonic XOR silent-anchor"
            );
        }

        // The partition covers 12 without duplication.
        let mut covered = [false; 12];
        for role in &modal.diatonic_set {
            assert!(!covered[role.pitch_class as usize], "diatonic duplicate");
            covered[role.pitch_class as usize] = true;
        }
        for anchor in &modal.silent_complement {
            assert!(!covered[anchor.pitch_class as usize], "silent duplicate");
            covered[anchor.pitch_class as usize] = true;
        }
        assert!(covered.iter().all(|c| *c), "7 + 5 must cover all 12 slots");
    }
}

#[test]
fn octet_and_nodal_labels_tile_the_body_and_overlap_the_partition() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();

        // The 8 + 4 whole-tone-ladder offsets are distinct mod 12, so the
        // live carriers and nodal anchors together tile the chromatic body:
        // every slot carries exactly one octet-or-nodal label, and those
        // labels overlap the 7+5 partition rather than competing with it.
        let mut octet_seen = [false; 8];
        let mut nodal_seen = [false; 4];
        for slot in &modal.chromatic_body {
            assert_eq!(
                slot.octet_indices.len() + slot.nodal_roles.len(),
                1,
                "slot {} must carry exactly one live-or-nodal label",
                slot.pitch_class
            );
            for index in &slot.octet_indices {
                assert!(!octet_seen[*index as usize], "octet index duplicated");
                octet_seen[*index as usize] = true;
            }
            for index in &slot.nodal_roles {
                assert!(!nodal_seen[*index as usize], "nodal index duplicated");
                nodal_seen[*index as usize] = true;
            }
        }
        assert!(octet_seen.iter().all(|s| *s), "all 8 carriers placed");
        assert!(nodal_seen.iter().all(|s| *s), "all 4 anchors placed");
    }
}

#[test]
fn bell_partials_label_the_octet_in_place() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    let modal = profile.modal_resonator.as_ref().unwrap();
    assert_eq!(modal.bell_partials.len(), 8);
    for (i, partial) in modal.bell_partials.iter().enumerate() {
        assert_eq!(
            partial.octet_index as usize, i,
            "bellPartials[{i}].octetIndex must equal its position"
        );
        assert_eq!(partial.role, BELL_PARTIAL_ROLES[i]);
    }
}

#[test]
fn bell_partial_roles_and_octet_offsets_carry_the_spec_table() {
    // T14.C4 — expectations derived from m123-modal-resonator-bell-kernel-spec
    // §2, NOT from the implementation constants: the eight live carriers sit
    // on whole-tone-ladder offsets [2,4,6,8,3,5,7,9] (bimba inner-four P1-P4,
    // then pratibimba inner-four P1'-P4'), and the bell partials label the
    // octet in the fixed role order hum → prime → tierce → quint → nominal →
    // upper → warble → residue.
    const SPEC_OCTET_OFFSETS: [u8; 8] = [2, 4, 6, 8, 3, 5, 7, 9];
    const SPEC_PARTIAL_ROLES: [&str; 8] = [
        "hum", "prime", "tierce", "quint", "nominal", "upper", "warble", "residue",
    ];

    // The declared carrier-offset law is the spec octet, value for value.
    assert_eq!(
        portal_core::parashakti::vimarsha_reading::INNER_FOUR_OFFSETS,
        SPEC_OCTET_OFFSETS,
        "octet offsets drifted from bell-kernel spec §2"
    );

    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();

        // The 8 partial roles, in octet order, from the generated profile.
        let roles: Vec<&str> = modal
            .bell_partials
            .iter()
            .map(|partial| partial.role.as_str())
            .collect();
        assert_eq!(
            roles, SPEC_PARTIAL_ROLES,
            "bell partial roles drifted from spec §2"
        );

        // The offsets asserted BEHAVIORALLY through the computed body: the
        // chromatic interval between carrier i and carrier 0 must equal the
        // spec offset delta (mod 12) — a wrong offset table cannot pass.
        for (i, carrier) in modal.live_octet.iter().enumerate() {
            let expected_delta = (SPEC_OCTET_OFFSETS[i] + 12 - SPEC_OCTET_OFFSETS[0]) % 12;
            let actual_delta = (carrier.pitch_class + 12 - modal.live_octet[0].pitch_class) % 12;
            assert_eq!(
                actual_delta, expected_delta,
                "carrier {i} does not sit on spec offset {} at tick {}",
                SPEC_OCTET_OFFSETS[i], profile.tick12
            );
            // Spec §2: four bimba inner-four positions then four pratibimba
            // inner-four positions (P1-P4 / P1'-P4').
            assert_eq!(
                carrier.helix,
                if i < 4 { "bimba" } else { "pratibimba" },
                "carrier {i} helix face"
            );
            assert_eq!(
                carrier.ql_position,
                (i as u8 % 4) + 1,
                "carrier {i} must be inner-four position P{}",
                (i % 4) + 1
            );
        }
    }
}

#[test]
fn m2_address72_comes_from_resonance72_never_from_lens_mode() {
    for tick in all_ticks() {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();

        // lensModeIndex is the 12x7 landscape index…
        assert!(modal.lens_mode.lens <= 11);
        assert!(modal.lens_mode.mode <= 6);
        assert_eq!(
            modal.lens_mode.lens_mode_index,
            modal.lens_mode.lens * 7 + modal.lens_mode.mode
        );

        // …while the M2 72-address is the resonance72 anchor (tick12*6 +
        // position) — two different surfaces that must not be conflated.
        assert_eq!(
            modal.m2_address72.address72,
            profile.resonance72.lens_anchor_index
        );
        assert_eq!(
            modal.m2_address72.address72,
            profile.tick12 as usize * 6 + profile.position6 as usize,
            "address72 is tick12*6+position by current S0 law"
        );
        assert_eq!(
            modal.m2_address72.source,
            "MathemeHarmonicProfile.resonance72.lensAnchorIndex"
        );
    }
    // At least one tick must distinguish the two derivations, or this guard
    // proves nothing.
    let distinguishing = all_ticks().any(|tick| {
        let profile = MathemeHarmonicProfile::from_tick(tick);
        let modal = profile.modal_resonator.as_ref().unwrap();
        modal.m2_address72.address72 != modal.lens_mode.lens_mode_index as usize
    });
    assert!(
        distinguishing,
        "tick landscape must contain a tick where address72 != lens*7+mode"
    );
}

#[test]
fn serialization_is_camel_case_and_survives_json_round_trip() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    let json = serde_json::to_value(&profile).expect("profile serializes");
    let modal = json.get("modalResonator").expect("camelCase field present");

    for key in [
        "schemaVersion",
        "chromaticBody",
        "liveOctet",
        "nodalQuartet",
        "diatonicSet",
        "silentComplement",
        "bellPartials",
        "m2Address72",
        "lensMode",
        "cymaticMaterial",
        "privacyClass",
        "authority",
        "sourceFields",
    ] {
        assert!(modal.get(key).is_some(), "modalResonator.{key} present");
    }
    assert_eq!(
        modal.get("privacyClass").and_then(|v| v.as_str()),
        Some("public-current-context")
    );
    assert_eq!(
        modal.pointer("/authority/pitch").and_then(|v| v.as_str()),
        Some("MathemeHarmonicProfile.audio_octet")
    );

    // Byte-compatibility after JSON numeric round-trip (§5 rule): the octet
    // values re-read from JSON must equal the source bus exactly.
    let round: MathemeHarmonicProfile = serde_json::from_value(json).expect("round-trips");
    let round_modal = round.modal_resonator.as_ref().unwrap();
    for (i, carrier) in round_modal.live_octet.iter().enumerate() {
        assert_eq!(carrier.hz, profile.audio_octet[i]);
    }
    assert_eq!(round.modal_resonator, profile.modal_resonator);
}

#[test]
fn legacy_profiles_without_the_field_still_deserialize() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    let mut json = serde_json::to_value(&profile).expect("serializes");
    json.as_object_mut().unwrap().remove("modalResonator");
    let round: MathemeHarmonicProfile =
        serde_json::from_value(json).expect("legacy payload deserializes");
    assert_eq!(round.modal_resonator, None);
}
