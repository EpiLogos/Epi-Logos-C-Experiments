use std::sync::{Arc, Mutex};

use epi_logos::portal::clock_state::{
    update_from_cast, update_quintessence_quaternion, PortalClockState,
};
use portal_core::{KernelElement, KernelPhase};

fn near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
}

#[test]
fn cli_portal_clock_uses_real_kernel_projection_after_cast() {
    let state = Arc::new(Mutex::new(PortalClockState::default()));

    update_from_cast(&state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0b001100);

    let state = state.lock().unwrap();
    let kernel = &state.kernel_projection;
    assert_eq!(kernel.tick.sub_tick, state.tick12);
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
fn cli_quintessence_update_refreshes_kernel_q_b() {
    let state = Arc::new(Mutex::new(PortalClockState::default()));
    update_from_cast(&state, 3.0, 1.0, 1.0, 1.0, 45, 5, 10, 0);

    let profiles = [
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
    ];
    update_quintessence_quaternion(&state, &profiles);

    let state = state.lock().unwrap();
    assert_eq!(
        state.kernel_projection.bioquaternion.q_b,
        state.quintessence_quaternion
    );
    assert_eq!(
        state.kernel_projection.bioquaternion.q_p,
        state.composed_quaternion
    );
}
