use portal_core::{
    harmonic_ratio_fraction_for_sub_tick, kernel_energy_evaluate, kernel_resonance_index,
    kernel_resonance_square_emphasis, kernel_tick_from_epogdoon, slash_flip_bimba_prime,
    BioQuaternionState, HarmonicPulse, KernelElement, KernelPhase, KernelProjection,
    KernelResonanceObservation, ResonanceVector72, EPOGDOON_DEN, EPOGDOON_NUM,
};
use std::collections::BTreeSet;

fn near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
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
    let mut observed = ResonanceVector72::default();
    let target = ResonanceVector72::default();
    observed.values[0] = 1.0;

    let energy = kernel_energy_evaluate(&state, Some(&observed), Some(&target), 0.25);
    assert!(near(energy.bimba_pratibimba_energy, 2.0));
    assert!(near(energy.lens_energy, 1.0 / 72.0));
    assert!(near(energy.total_energy, 2.0 + (1.0 / 72.0) + 0.25));

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
    let projection = KernelProjection::from_clock_state(
        7,
        9,
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        None,
        None,
        0.125,
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
