use portal_core::{
    codon_charge_quaternion, codon_rotation_from_lens_mode, codon_rotation_surface,
    kernel_tick_from_epogdoon, lens_mode_from_codon_rotation, MathemeHarmonicProfile,
    ProfilePrivacyClass,
};

#[test]
fn public_current_profile_serializes_versioned_bridge_shape_without_protected_fields() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(9, 10));
    let json = serde_json::to_value(&profile).expect("profile serializes");

    assert_eq!(json["profileSchemaVersion"], 1);
    assert_eq!(json["profileProvenance"]["owner"], "portal-core");
    assert_eq!(
        json["profileProvenance"]["contract"],
        "MathemeHarmonicProfile.public-current"
    );
    assert_eq!(json["tickAddress"]["cycle"], 9);
    assert_eq!(json["tickAddress"]["tick12"], 10);
    assert_eq!(json["tickAddress"]["absoluteTick"], profile.tick);
    assert_eq!(json["tick12"], 10);
    assert_eq!(json["degree720"], 600);
    assert_eq!(json["degree360"], 240);
    assert_eq!(json["su2Layer"], "shadow");
    assert_eq!(json["position6"], 4);
    assert_eq!(json["privacyClass"], "public-current-context");
    assert_eq!(json["binary"], json["mahamaya"]);
    assert!(json["s2Anchor"].is_null());
    assert!(json["s3Anchor"].is_null());

    for required in [
        "phase",
        "helix",
        "ratioRole",
        "lensMode",
        "chromatic",
        "diatonic",
        "resonance72",
        "audioOctet",
        "nodalQuartet",
        "elements",
        "planetaryChakral",
        "binary",
        "mahamaya",
        "codonRotationProjection",
        "qCosmic",
        "conjugateFormCharacter",
        "bedrock",
        "pointerAnchor",
        "contextFrames",
    ] {
        assert!(
            json.get(required).is_some(),
            "{required} must be public-current"
        );
    }

    for protected in [
        "q_b",
        "qB",
        "q_p",
        "qPersonal",
        "protectedNatalData",
        "natalChartHandle",
        "journalBody",
        "graphitiEpisodeBody",
        "privateResonanceVector",
        "identityHash",
    ] {
        assert!(
            json.get(protected).is_none(),
            "{protected} must not leak through the public profile"
        );
    }
}

#[test]
fn public_profile_contract_covers_all_12_ticks_and_pointer_web_invariants() {
    for tick12 in 0..12 {
        let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, tick12));
        let position = tick12 % 6;

        assert_eq!(profile.tick_address.tick12, tick12);
        assert_eq!(profile.tick12, tick12);
        assert_eq!(profile.position6, position);
        assert_eq!(
            profile.helix,
            if tick12 < 6 { "bimba" } else { "pratibimba" }
        );
        assert_eq!(profile.chromatic.mirror_position, 5 - position);
        assert_eq!(profile.pointer_anchor.family_ring_size, 12);
        assert_eq!(profile.pointer_anchor.position_ring_size, 12);
        assert_eq!(profile.pointer_anchor.lens_ring_size, 12);
        assert_eq!(profile.pointer_anchor.web_cardinality, 36);
        assert_eq!(profile.context_frames.frame_count, 7);
        assert_eq!(
            profile.privacy_class,
            ProfilePrivacyClass::PublicCurrentContext
        );
        assert_eq!(profile.binary, profile.mahamaya);
    }
}

#[test]
fn codon_rotation_surface_and_q_cosmic_are_total_and_normalized() {
    let surface = codon_rotation_surface();
    let dual_cells = surface
        .iter()
        .filter(|cell| cell.rotational_state_count == 8)
        .count();
    let non_dual_cells = surface
        .iter()
        .filter(|cell| cell.rotational_state_count == 7)
        .count();

    assert_eq!(surface.len(), 472);
    assert_eq!(dual_cells, 24 * 8);
    assert_eq!(non_dual_cells, 40 * 7);

    for lens in 0..12 {
        for mode in 0..7 {
            let projection = codon_rotation_from_lens_mode(lens, mode)
                .expect("all 84 lens-mode cells map forward");
            let reverse = lens_mode_from_codon_rotation(projection.codon_id, projection.rotation)
                .expect("mapped surface cell maps back");
            let q_cosmic = codon_charge_quaternion(projection.codon_id);
            let norm = q_cosmic
                .iter()
                .map(|component| component * component)
                .sum::<f32>()
                .sqrt();

            assert_eq!((reverse.lens, reverse.mode), (lens, mode));
            assert!(
                (norm - 1.0).abs() < 0.000_001,
                "q_cosmic must be normalized"
            );
        }
    }
}
