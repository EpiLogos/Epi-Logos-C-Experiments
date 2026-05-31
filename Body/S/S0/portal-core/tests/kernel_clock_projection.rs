use portal_core::{
    update_from_cast, update_kairos_full, update_quintessence_quaternion, KairosState,
    KernelElement, KernelPhase, KernelTemporalProjection, PortalClockState,
};

fn near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
}

fn near_quat(a: [f32; 4], b: [f32; 4]) -> bool {
    a.iter().zip(b.iter()).all(|(a, b)| near(*a, *b))
}

#[test]
fn oracle_cast_refreshes_kernel_projection_from_clock_state() {
    let mut state = PortalClockState::default();

    update_from_cast(&mut state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0b001100, 0);

    let kernel = &state.kernel_projection;
    assert_eq!(kernel.tick.sub_tick, state.tick12);
    assert_eq!(kernel.tick.sub_tick, 7);
    assert_eq!(kernel.tick.phase, KernelPhase::Ascent);
    assert_eq!(kernel.tick.element, KernelElement::InverseMobius);
    assert!(near(kernel.tick.harmonic_ratio, 3.0 / 4.0));
    assert_eq!(kernel.harmonic_pulse.ratio_num, 3);
    assert_eq!(kernel.harmonic_pulse.ratio_den, 4);
    assert_eq!(kernel.bioquaternion.q_b, state.quintessence_quaternion);
    assert_eq!(kernel.bioquaternion.q_p, state.composed_quaternion);
    assert!(kernel.energy.total_energy > 0.0);
}

#[test]
fn kairos_and_quintessence_updates_recompose_kernel_projection() {
    let mut state = PortalClockState::default();
    update_from_cast(&mut state, 3.0, 1.0, 1.0, 1.0, 45, 5, 10, 0, 0);
    let before_transit = state.transit_quaternion;
    let before_composed = state.composed_quaternion;

    let mut kairos = KairosState::default();
    kairos.planets[0].degree = 10;
    kairos.planets[1].degree = 40;
    kairos.planets[2].degree = 70;
    kairos.planets[3].degree = 100;
    update_kairos_full(&mut state, kairos);

    assert_ne!(state.transit_quaternion, before_transit);
    assert_ne!(state.composed_quaternion, before_composed);
    assert!(near_quat(
        state.kernel_projection.bioquaternion.q_p,
        state.composed_quaternion
    ));

    let profiles = [
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
    ];
    update_quintessence_quaternion(&mut state, &profiles);

    assert!(near_quat(
        state.kernel_projection.bioquaternion.q_b,
        state.quintessence_quaternion
    ));
    assert!(state.kernel_projection.energy.total_energy > 0.0);
}

#[test]
fn portal_clock_state_kernel_projection_survives_ipc_json_round_trip() {
    let mut state = PortalClockState::default();
    update_from_cast(&mut state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0b001100, 0);
    state.generation = 42;

    let json = serde_json::to_value(&state).expect("PortalClockState should serialize for IPC");
    assert_eq!(json["kernel_projection"]["tick"]["sub_tick"], 7);
    assert_eq!(json["kernel_projection"]["tick"]["phase"], "Ascent");
    assert_eq!(
        json["kernel_projection"]["tick"]["element"],
        "InverseMobius"
    );
    assert_eq!(json["kernel_projection"]["harmonic_pulse"]["ratio_num"], 3);
    assert_eq!(json["kernel_projection"]["harmonic_pulse"]["ratio_den"], 4);
    assert!(json["kernel_projection"]["bioquaternion"].is_object());
    assert!(
        json["kernel_projection"]["energy"]["total_energy"]
            .as_f64()
            .unwrap()
            > 0.0
    );

    let decoded: PortalClockState =
        serde_json::from_value(json).expect("PortalClockState should deserialize from IPC JSON");
    assert_eq!(decoded.kernel_projection.tick, state.kernel_projection.tick);
    assert_eq!(
        decoded.kernel_projection.harmonic_pulse,
        state.kernel_projection.harmonic_pulse
    );
    assert_eq!(
        decoded.kernel_projection.bioquaternion,
        state.kernel_projection.bioquaternion
    );
    assert_eq!(
        decoded.kernel_projection.energy,
        state.kernel_projection.energy
    );

    let public = KernelTemporalProjection::from_kernel_projection(
        state.generation,
        &state.kernel_projection,
    );
    let public_json = serde_json::to_value(public)
        .expect("safe kernel temporal projection should serialize for gateway/API use");
    assert_eq!(public_json["coordinateOwner"], "S0/QL-meta");
    assert_eq!(public_json["projectionOwner"], "S3'");
    assert_eq!(public_json["privacy"], "safe-public-current-kernel-tick");
    assert_eq!(
        public_json["computationSource"],
        "portal-core::KernelProjection"
    );
    assert_eq!(public_json["generation"], 42);
    assert_eq!(public_json["tick"]["subTick"], 7);
    assert_eq!(public_json["tick"]["phase"], "Ascent");
    assert_eq!(public_json["tick"]["element"], "InverseMobius");
    assert_eq!(public_json["tick"]["harmonicRatio"], "0.750000");
    assert_eq!(public_json["harmonicProfile"]["tick12"], 7);
    assert_eq!(public_json["harmonicProfile"]["degree720"], 420);
    assert_eq!(public_json["harmonicProfile"]["degree360"], 60);
    assert_eq!(public_json["harmonicProfile"]["su2Layer"], "shadow");
    assert_eq!(public_json["harmonicProfile"]["helix"], "pratibimba");
    assert_eq!(
        public_json["harmonicProfile"]["ratioRole"],
        "3/4 perfect-fourth recognition"
    );
    assert_eq!(public_json["harmonicProfile"]["chromatic"]["note"], "D#");
    assert_eq!(
        public_json["harmonicProfile"]["chromatic"]["xPrimeNote"],
        "D"
    );
    assert_eq!(
        public_json["harmonicProfile"]["diatonic"],
        serde_json::Value::Null
    );
    assert_eq!(
        public_json["harmonicProfile"]["resonance72"]["lensAnchorIndex"],
        43
    );
    assert_eq!(
        public_json["harmonicProfile"]["elements"]["renderingRole"],
        "explicate-sounded"
    );
    assert_eq!(
        public_json["harmonicProfile"]["planetaryChakral"]["body"],
        "Pluto"
    );
    assert_eq!(
        public_json["harmonicProfile"]["binary"]["mahamayaAddress64"],
        10
    );
    assert_eq!(public_json["harmonicProfile"]["binary"]["codon"], "UGG");
    assert_eq!(
        public_json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],
        61
    );
    assert_eq!(
        public_json["harmonicProfile"]["binary"]["transcriptionState"],
        "provisional-gap"
    );
    assert_eq!(
        public_json["harmonicProfile"]["binary"]["datasetLutState"],
        "pending-dataset-lut"
    );
    assert_eq!(
        public_json["harmonicProfile"]["bedrock"]["hashOperator"],
        "#"
    );
    assert_eq!(
        public_json["harmonicProfile"]["bedrock"]["psychoidNumber"],
        "#1"
    );
    assert_eq!(
        public_json["harmonicProfile"]["bedrock"]["invertedPsychoidNumber"],
        "#1'"
    );
    assert_eq!(
        public_json["harmonicProfile"]["bedrock"]["successorPsychoidNumber"],
        "#2"
    );
    assert_eq!(
        public_json["harmonicProfile"]["pointerAnchor"]["lensAnchor"],
        "L1'"
    );
    assert_eq!(
        public_json["harmonicProfile"]["pointerAnchor"]["relationRole"],
        "inversion-spanda"
    );
    assert_eq!(
        public_json["harmonicProfile"]["pointerAnchor"]["webCardinality"],
        36
    );
    assert_eq!(
        public_json["harmonicProfile"]["contextFrames"]["frameCount"],
        7
    );
    assert_eq!(
        public_json["harmonicProfile"]["contextFrames"]["activeFrame"],
        serde_json::Value::Null
    );
    assert_eq!(public_json["harmonicPulse"]["ratioNum"], 3);
    assert_eq!(public_json["harmonicPulse"]["ratioDen"], 4);
    assert!(
        public_json.get("bioquaternion").is_none(),
        "public temporal projection must not expose protected bioquaternion state"
    );
    assert!(
        public_json.get("resonanceSquareEmphasis").is_none(),
        "public temporal projection must not expose protected resonance vectors"
    );
}

#[test]
fn kernel_harmonic_profile_maps_tick_to_diatonic_cf_when_pitch_is_sounded() {
    let projection = portal_core::KernelProjection::from_clock_state(
        9,
        10,
        [1.0, 0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0, 0.0],
        None,
        None,
        0.0,
    );
    let public = KernelTemporalProjection::from_kernel_projection(11, &projection);
    let json = serde_json::to_value(public).unwrap();

    assert_eq!(json["harmonicProfile"]["tick12"], 10);
    assert_eq!(json["harmonicProfile"]["degree720"], 600);
    assert_eq!(json["harmonicProfile"]["degree360"], 240);
    assert_eq!(json["harmonicProfile"]["su2Layer"], "shadow");
    assert_eq!(
        json["harmonicProfile"]["ratioRole"],
        "3/2 perfect-fifth aspiration"
    );
    assert_eq!(json["harmonicProfile"]["chromatic"]["note"], "A");
    assert_eq!(json["harmonicProfile"]["chromatic"]["position"], 4);
    assert_eq!(json["harmonicProfile"]["chromatic"]["mirrorNote"], "D#");
    assert_eq!(
        json["harmonicProfile"]["chromatic"]["mirrorSpanWholeTones"],
        3
    );
    assert_eq!(json["harmonicProfile"]["diatonic"]["degree"], 6);
    assert_eq!(json["harmonicProfile"]["diatonic"]["contextFrame"], "4.5/0");
    assert_eq!(
        json["harmonicProfile"]["diatonic"]["contextAgent"],
        "Psyche"
    );
    assert_eq!(
        json["harmonicProfile"]["diatonic"]["vakRegister"],
        "partial-Aletheia"
    );
    assert_eq!(
        json["harmonicProfile"]["resonance72"]["legacyResonanceIndex"],
        58
    );
    assert_eq!(
        json["harmonicProfile"]["resonance72"]["lensAnchorIndex"],
        64
    );
    assert_eq!(
        json["harmonicProfile"]["elements"]["pPositionElement"],
        "Earth"
    );
    assert_eq!(
        json["harmonicProfile"]["elements"]["l2PrimeElement"],
        "Fire"
    );
    assert_eq!(
        json["harmonicProfile"]["planetaryChakral"]["body"],
        "Uranus"
    );
    assert_eq!(
        json["harmonicProfile"]["planetaryChakral"]["musicalRole"],
        "5/3 major sixth"
    );
    assert_eq!(json["harmonicProfile"]["binary"]["mahamayaAddress64"], 42);
    assert_eq!(json["harmonicProfile"]["binary"]["hexagramId"], 42);
    assert_eq!(json["harmonicProfile"]["binary"]["upperTrigram"], 5);
    assert_eq!(json["harmonicProfile"]["binary"]["lowerTrigram"], 2);
    assert_eq!(json["harmonicProfile"]["binary"]["codon"], "GGG");
    assert_eq!(json["harmonicProfile"]["binary"]["dnaRnaPhase"], "RNA");
    assert_eq!(
        json["harmonicProfile"]["binary"]["lineChangeOperatorAddress"],
        256
    );
    assert_eq!(json["harmonicProfile"]["binary"]["m2VibrationIndex"], 64);
    assert_eq!(json["harmonicProfile"]["binary"]["m2ToM3Symbol"], 56);
    assert_eq!(json["harmonicProfile"]["binary"]["evolutionaryGap"], true);
    assert_eq!(
        json["harmonicProfile"]["binary"]["transcriptionState"],
        "provisional-gap"
    );
    assert_eq!(json["harmonicProfile"]["bedrock"]["psychoidNumber"], "#4");
    assert_eq!(
        json["harmonicProfile"]["bedrock"]["invertedPsychoidNumber"],
        "#4'"
    );
    assert_eq!(
        json["harmonicProfile"]["bedrock"]["successorPsychoidNumber"],
        "#5"
    );
    assert_eq!(json["harmonicProfile"]["bedrock"]["inversionPitchClass"], 9);
    assert_eq!(json["harmonicProfile"]["pointerAnchor"]["qlPosition"], 4);
    assert_eq!(json["harmonicProfile"]["pointerAnchor"]["webIndex"], 10);
    assert_eq!(
        json["harmonicProfile"]["pointerAnchor"]["lensAnchor"],
        "L4'"
    );
    assert_eq!(
        json["harmonicProfile"]["pointerAnchor"]["provenance"],
        "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract"
    );
    assert_eq!(
        json["harmonicProfile"]["contextFrames"]["activeFrame"],
        "4.5/0"
    );
    assert_eq!(
        json["harmonicProfile"]["contextFrames"]["activeFrameIndex"],
        5
    );
}

#[test]
fn kernel_harmonic_profile_covers_chromatic_resonance_and_rendering_invariants() {
    let mut pitch_classes = std::collections::BTreeSet::new();
    let mut lens_anchor_indexes = std::collections::BTreeSet::new();

    for tick12 in 0..12 {
        let projection = portal_core::KernelProjection::from_clock_state(
            3,
            tick12,
            [1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 0.0],
            None,
            None,
            0.0,
        );
        let profile =
            KernelTemporalProjection::from_kernel_projection(1, &projection).harmonic_profile;

        pitch_classes.insert(profile.chromatic.pitch_class);
        lens_anchor_indexes.insert(profile.resonance72.lens_anchor_index);

        assert_eq!(profile.tick12, tick12);
        assert_eq!(profile.chromatic.position, tick12 % 6);
        assert_eq!(profile.resonance72.lens_anchor, tick12);
        assert_eq!(profile.resonance72.helix_bit, tick12 / 6);
        assert_eq!(
            profile.resonance72.lens_anchor_index,
            tick12 as usize * 6 + (tick12 % 6) as usize
        );

        let expected_rendering = if matches!(tick12 % 6, 0 | 5) {
            "nodal-boundary"
        } else {
            "explicate-sounded"
        };
        assert_eq!(profile.elements.rendering_role, expected_rendering);

        let expected_mirror_span = match tick12 % 6 {
            0 | 5 => 5,
            1 | 4 => 3,
            _ => 1,
        };
        assert_eq!(
            profile.chromatic.mirror_span_whole_tones,
            expected_mirror_span
        );
        assert_eq!(
            profile.chromatic.mirror_span_semitones,
            expected_mirror_span * 2
        );
    }

    assert_eq!(
        pitch_classes.len(),
        12,
        "12 ticks cover the chromatic substrate"
    );
    assert_eq!(
        lens_anchor_indexes.len(),
        12,
        "coarse tick profile exposes one 72-fold anchor slot per tick"
    );
}

#[test]
fn kernel_harmonic_profile_exposes_canonical_m_prime_contract_fields() {
    let tick = portal_core::kernel_tick_from_epogdoon(9, 10);
    let profile = portal_core::harmonic_profile::MathemeHarmonicProfile::from_tick(tick);

    assert_eq!(profile.tick, 118);
    assert_eq!(profile.tick12, 10);
    assert_eq!(profile.phase, portal_core::KernelPhase::Ascent);
    assert_eq!(profile.position6, 4);
    assert_eq!(profile.lens_mode.lens, 10);
    assert_eq!(profile.lens_mode.mode, 5);
    assert_eq!(profile.audio_octet.len(), 8);
    assert!(profile
        .audio_octet
        .iter()
        .all(|hz| hz.is_finite() && *hz > 0.0));
    assert_eq!(profile.nodal_quartet.len(), 4);
    assert!(profile
        .nodal_quartet
        .iter()
        .all(|node| node.m > 0 && node.n > 0));
    assert_eq!(profile.codon_rotation_projection.lens, 10);
    assert_eq!(profile.codon_rotation_projection.mode, 5);
    assert!(profile.codon_rotation_projection.surface_index < 472);
    assert!(profile.codon_rotation_projection.codon_id < 64);
    assert!(matches!(
        profile.conjugate_form_character,
        portal_core::ConjugateFormCharacter::Major
            | portal_core::ConjugateFormCharacter::Minor
            | portal_core::ConjugateFormCharacter::ShadowInversion
    ));
    assert!(profile
        .q_cosmic
        .iter()
        .all(|component| component.is_finite()));
    assert_eq!(
        profile.privacy_class,
        portal_core::ProfilePrivacyClass::PublicCurrentContext
    );
}
