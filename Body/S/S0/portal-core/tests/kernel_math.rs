use portal_core::{
    compute_e_4_personal_energy_gradient, harmonic_ratio_fraction_for_sub_tick,
    kernel_energy_evaluate, kernel_energy_evaluate_unified_act, kernel_resonance_index,
    kernel_resonance_square_emphasis, kernel_tick_from_epogdoon, slash_flip_bimba_prime,
    try_compute_e_4_personal_energy, BioQuaternionState, E4CorpusDigest, E4KairosState,
    E4LoraCheckpointRef, E4OracleCharges, E4PasuSnapshot, E4PersonalEnergyError, E4PersonalInputs,
    E4PrivacyClass, E5HarmonicInputs, E6VerifierInputs, HarmonicPulse, KernelElement, KernelPhase,
    KernelProjection, KernelResonanceObservation, NaraLoraRuntime, ResonanceVector72,
    UnifiedVakActFace, UnifiedVakActTuple, EPOGDOON_DEN, EPOGDOON_NUM,
};
use std::collections::BTreeSet;

fn near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
}

fn full_e4_inputs() -> E4PersonalInputs {
    E4PersonalInputs {
        pasu_handle: Some("Idea/Pratibimba/Self/PASU.md".to_owned()),
        kairos_handle: Some("local://kairos/2026-06-17T10".to_owned()),
        nara_lora_checkpoint_ref: Some("voice-v7".to_owned()),
        pasu_snapshot: Some(E4PasuSnapshot {
            q_identity: [1.0, 0.0, 0.0, 0.0],
            q_personal: [0.0, 1.0, 0.0, 0.0],
            birth_date: "1990-06-15".to_owned(),
            birth_location: "Berlin, Germany".to_owned(),
            c_0_natal_chart_path: "Pratibimba/Self/natal-chart.json".to_owned(),
            c_2_jungian: "INFJ".to_owned(),
            c_3_gene_keys: "13.7.1".to_owned(),
            c_4_human_design: "Projector".to_owned(),
            c_5_quintessence_hash: "sha256:quintessence".to_owned(),
            c_5_quintessence_clock: "2026-06-17T10:00:00.000Z".to_owned(),
            c_4_last_wound: "protected://nara/wounds/latest".to_owned(),
        }),
        kairos: Some(E4KairosState {
            planet_degrees: [
                14.2, 25.1, 302.4, 112.7, 88.5, 177.3, 201.6, 44.8, 269.9, 11.1,
            ],
            oracle_charges: E4OracleCharges {
                pp: 21.0,
                mm: 8.0,
                mp: 5.0,
                pn: 3.0,
            },
            tarot_psyche_anchor_signature: "tarot://anchor/major-9".to_owned(),
            kairos_window_id: "kairos://window/2026-06-17T10".to_owned(),
        }),
        lora_checkpoint: Some(E4LoraCheckpointRef {
            path: "/Users/admin/.epi-logos/nara/lora/checkpoints/voice-v7".to_owned(),
            version: "voice-v7".to_owned(),
            privacy_class: E4PrivacyClass::LocalOnly,
        }),
        corpus: Some(E4CorpusDigest {
            journal_hashes: vec!["sha256:journal-a".to_owned()],
            dream_hashes: vec!["sha256:dream-a".to_owned()],
            phone_writing_hashes: vec!["sha256:phone-a".to_owned()],
            model_version_key: "gemma4-12b-q4".to_owned(),
        }),
    }
}

#[test]
fn rust_kernel_constants_and_slash_flip_match_c_contract() {
    assert_eq!(EPOGDOON_NUM, 9);
    assert_eq!(EPOGDOON_DEN, 8);

    let state = BioQuaternionState::new([2.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.5, 0.5]);
    assert!(near(state.q_b[0], 1.0));

    let b_prime = slash_flip_bimba_prime(&state);
    assert!(near(b_prime[0], 0.5));
    assert!(near(b_prime[1], -0.5));
    assert!(near(b_prime[2], -0.5));
    assert!(near(b_prime[3], -0.5));
}

#[test]
fn rust_kernel_normalization_matches_c_zero_and_tiny_axis_contract() {
    let zero_state = BioQuaternionState::new([0.0; 4], [0.0; 4]);
    assert_eq!(zero_state.q_b, [1.0, 0.0, 0.0, 0.0]);
    assert_eq!(zero_state.q_p, [1.0, 0.0, 0.0, 0.0]);

    let tiny_state = BioQuaternionState::new([0.0, 0.000001, 0.0, 0.0], [0.0, 0.0, 0.000001, 0.0]);
    assert!(near(tiny_state.q_b[0], 0.0));
    assert!(near(tiny_state.q_b[1], 1.0));
    assert!(near(tiny_state.q_p[0], 0.0));
    assert!(near(tiny_state.q_p[2], 1.0));
}

#[test]
fn rust_resonance_vector_preserves_72_fold_tritone_grouping() {
    assert_eq!(kernel_resonance_index(0, false, 0), Some(0));
    assert_eq!(kernel_resonance_index(0, true, 0), Some(6));
    assert_eq!(kernel_resonance_index(5, true, 5), Some(71));
    assert_eq!(kernel_resonance_index(6, false, 0), None);

    let mut vector = ResonanceVector72::default();
    for helix in [false, true] {
        for position in 0..6 {
            vector.values[kernel_resonance_index(0, helix, position).unwrap()] = 1.0;
            vector.values[kernel_resonance_index(5, helix, position).unwrap()] = 1.0;
        }
    }

    let squares = kernel_resonance_square_emphasis(&vector);
    assert!(near(squares[0], 1.0));
    assert!(near(squares[1], 0.0));
    assert!(near(squares[2], 0.0));
}

#[test]
fn rust_resonance_indexing_is_total_over_valid_72_fold_domain() {
    let mut seen = BTreeSet::new();
    for lens in 0..6 {
        for helix in [false, true] {
            for position in 0..6 {
                let index = kernel_resonance_index(lens, helix, position)
                    .expect("valid lens/helix/position should index");
                assert!(index < 72);
                assert!(seen.insert(index), "duplicate resonance index {index}");
            }
        }
    }
    assert_eq!(seen.len(), 72);
    assert_eq!(kernel_resonance_index(6, false, 0), None);
    assert_eq!(kernel_resonance_index(0, false, 6), None);
}

#[test]
fn rust_energy_and_tick_contract_are_computable() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
    let e_4_inputs = E4PersonalInputs::default();
    let e_5_inputs = E5HarmonicInputs::default();
    let e_6_inputs = E6VerifierInputs::default();

    let energy = kernel_energy_evaluate(&state, &e_4_inputs, &e_5_inputs, &e_6_inputs);
    assert!(near(energy.bimba_pratibimba_energy, 2.0));
    assert!(near(energy.e_4_personal_energy, 0.0));
    assert!(near(energy.e_5_harmonic_energy, 0.0));
    assert!(near(energy.e_6_verifier_energy, 0.0));
    assert!(near(energy.total_energy, 0.0));

    let tick0 = kernel_tick_from_epogdoon(3, 0);
    let tick6 = kernel_tick_from_epogdoon(3, 6);
    let tick11 = kernel_tick_from_epogdoon(3, 11);
    assert_eq!(tick0.phase, KernelPhase::Descent);
    assert_eq!(tick0.element, KernelElement::BimbaEncoding);
    assert_eq!(tick6.phase, KernelPhase::Ascent);
    assert_eq!(tick11.element, KernelElement::EnrichedReturn);
    assert_eq!(kernel_tick_from_epogdoon(3, 12).sub_tick, 0);
    assert_eq!(kernel_tick_from_epogdoon(3, 23).sub_tick, 11);
}

#[test]
fn rust_e4_personal_inputs_carry_pasu_kairos_checkpoint_and_corpus() {
    let inputs = full_e4_inputs();
    let pasu = inputs
        .pasu_snapshot
        .as_ref()
        .expect("PASU snapshot present");
    let kairos = inputs.kairos.as_ref().expect("kairos present");
    let checkpoint = inputs
        .lora_checkpoint
        .as_ref()
        .expect("checkpoint ref present");
    let corpus = inputs.corpus.as_ref().expect("corpus digest present");

    assert_eq!(pasu.q_identity, [1.0, 0.0, 0.0, 0.0]);
    assert_eq!(pasu.q_personal, [0.0, 1.0, 0.0, 0.0]);
    assert_eq!(
        pasu.c_0_natal_chart_path,
        "Pratibimba/Self/natal-chart.json"
    );
    assert_eq!(pasu.c_2_jungian, "INFJ");
    assert_eq!(pasu.c_3_gene_keys, "13.7.1");
    assert_eq!(pasu.c_4_human_design, "Projector");
    assert_eq!(pasu.c_5_quintessence_hash, "sha256:quintessence");
    assert_eq!(pasu.c_5_quintessence_clock, "2026-06-17T10:00:00.000Z");
    assert_eq!(pasu.c_4_last_wound, "protected://nara/wounds/latest");
    assert_eq!(kairos.planet_degrees.len(), 10);
    assert_eq!(kairos.oracle_charges.pp, 21.0);
    assert_eq!(checkpoint.privacy_class, E4PrivacyClass::LocalOnly);
    assert_eq!(corpus.phone_writing_hashes, vec!["sha256:phone-a"]);
}

#[test]
fn rust_e4_refuses_missing_typed_inputs_and_non_local_checkpoint_paths() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
    let missing = try_compute_e_4_personal_energy(&state, &E4PersonalInputs::default())
        .expect_err("legacy handle-only inputs are not enough for E4 scalar evaluation");
    assert!(matches!(
        missing,
        E4PersonalEnergyError::MissingTypedInputs("pasu_snapshot")
    ));

    let mut cloud = full_e4_inputs();
    cloud.lora_checkpoint.as_mut().unwrap().path = "https://example.com/nara.ckpt".to_owned();
    let refused = try_compute_e_4_personal_energy(&state, &cloud)
        .expect_err("cloud checkpoint route must be refused");
    assert!(matches!(
        refused,
        E4PersonalEnergyError::NonLocalCheckpointPath(path) if path == "https://example.com/nara.ckpt"
    ));
}

#[test]
fn rust_e4_scalar_feeds_kernel_total_energy_with_4_5_6_weighting() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.25, 0.75, 0.25, 0.5]);
    let inputs = full_e4_inputs();
    let e4 = try_compute_e_4_personal_energy(&state, &inputs).expect("full E4 inputs evaluate");
    let energy = kernel_energy_evaluate(
        &state,
        &inputs,
        &E5HarmonicInputs::default(),
        &E6VerifierInputs::default(),
    );

    assert!(e4.scalar.is_finite());
    assert!(energy.e_4_personal_energy > 0.0);
    assert!(near(energy.e_4_personal_energy, e4.scalar));
    assert!(near(energy.total_energy, (4.0 * e4.scalar) / 15.0));
    assert_eq!(e4.provenance.weighting_coefficient, 4);
    assert_eq!(e4.provenance.privacy_class, E4PrivacyClass::LocalOnly);
    assert!(matches!(
        e4.provenance.runtime,
        NaraLoraRuntime::RustNative | NaraLoraRuntime::MlxLora
    ));
}

#[test]
fn rust_unified_vak_act_evaluates_once_with_six_faces() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.25, 0.75, 0.25, 0.5]);
    let e4_inputs = full_e4_inputs();
    let e5_inputs = E5HarmonicInputs::default();
    let e6_inputs = E6VerifierInputs::default();
    let act = UnifiedVakActTuple {
        coord: "M4-5-0".to_owned(),
        lens: "L5'-5".to_owned(),
        helix: "prime".to_owned(),
        density: 6,
        position: 5,
        cfp_thread: "CFP3".to_owned(),
        r_factor_slot: "R5".to_owned(),
        ananda_position: 4,
    };

    let faces = act.faces();
    assert_eq!(
        faces,
        [
            UnifiedVakActFace::CoordinateDesignation,
            UnifiedVakActFace::MefLensApplication,
            UnifiedVakActFace::QlPositionCheck,
            UnifiedVakActFace::HarmonicsReading,
            UnifiedVakActFace::MusicalTranscriptionalProjection,
            UnifiedVakActFace::PhysicalPoleEntailment,
        ]
    );

    let unified =
        kernel_energy_evaluate_unified_act(&act, &state, &e4_inputs, &e5_inputs, &e6_inputs)
            .expect("complete unified VAK act tuple evaluates");
    let direct = kernel_energy_evaluate(&state, &e4_inputs, &e5_inputs, &e6_inputs);

    assert_eq!(unified, direct);
    assert!(near(
        unified.total_energy,
        (4.0 * unified.e_4_personal_energy
            + 5.0 * unified.e_5_harmonic_energy
            + 6.0 * unified.e_6_verifier_energy)
            / 15.0
    ));
}

#[test]
fn rust_e4_gradient_is_tangent_to_qp_for_stream_d() {
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.25, 0.75, 0.25, 0.5]);
    let gradient = compute_e_4_personal_energy_gradient(&state, &full_e4_inputs())
        .expect("full E4 inputs produce gradient");
    let tangent_dot = gradient
        .gradient
        .iter()
        .zip(state.q_p.iter())
        .map(|(gradient, qp)| gradient * qp)
        .sum::<f32>();

    assert_eq!(gradient.channel, "E_4");
    assert_eq!(
        gradient.provenance.autograd_path,
        "rust-native-nara-lora-forward"
    );
    assert!(gradient.norm.is_finite());
    assert!(tangent_dot.abs() < 0.000001);
}

#[test]
fn rust_resonance_vector_deserialization_rejects_wrong_length() {
    let too_short = serde_json::Value::Array(vec![serde_json::json!(0.0); 71]);
    let err = serde_json::from_value::<ResonanceVector72>(too_short)
        .expect_err("resonance vector must preserve 72-fold shape");
    assert!(err.to_string().contains("exactly 72 resonance values"));
}

#[test]
fn rust_harmonic_pulse_is_deterministic_from_kernel_tick() {
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(0), (1, 1));
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(1), (4, 3));
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(2), (3, 4));
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(5), (2, 3));
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(9), (3, 2));
    assert_eq!(harmonic_ratio_fraction_for_sub_tick(23), (9, 8));

    let tick = kernel_tick_from_epogdoon(2, 9);
    let pulse = HarmonicPulse::from_tick(tick);
    assert_eq!(pulse.cycle, 2);
    assert_eq!(pulse.sub_tick, 9);
    assert_eq!(pulse.phase, KernelPhase::Ascent);
    assert_eq!(pulse.element, KernelElement::EnrichedReturn);
    assert_eq!(pulse.ratio_num, 3);
    assert_eq!(pulse.ratio_den, 2);
    assert!(near(pulse.tempo_multiplier, 1.5));
    assert!(near(pulse.period_multiplier, 2.0 / 3.0));
}

#[test]
fn rust_kernel_projection_can_emit_validated_resonance_observations() {
    let e_4_inputs = E4PersonalInputs::default();
    let e_5_inputs = E5HarmonicInputs::default();
    let e_6_inputs = E6VerifierInputs::default();
    let projection = KernelProjection::from_clock_state(
        7,
        9,
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        None,
        &e_4_inputs,
        &e_5_inputs,
        &e_6_inputs,
    );

    let observation = KernelResonanceObservation::from_projection(
        "M2",
        "agent:epii:main",
        1_779_000_001_234,
        2,
        true,
        1,
        0.875,
        &projection,
    )
    .expect("valid observation");

    assert_eq!(observation.source_coordinate, "M2");
    assert_eq!(observation.session_key, "agent:epii:main");
    assert_eq!(observation.resonance_index, 31);
    assert_eq!(observation.tritone_square, 2);
    assert_eq!(observation.kernel_tick.sub_tick, 9);
    assert!(near(observation.score, 0.875));

    assert!(KernelResonanceObservation::from_projection(
        "M2",
        "agent:epii:main",
        1_779_000_001_234,
        6,
        true,
        1,
        0.875,
        &projection,
    )
    .unwrap_err()
    .contains("lens"));

    assert!(KernelResonanceObservation::from_projection(
        "M2",
        "agent:epii:main",
        1_779_000_001_234,
        2,
        true,
        1,
        f32::NAN,
        &projection,
    )
    .unwrap_err()
    .contains("finite"));
}
