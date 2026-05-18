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
