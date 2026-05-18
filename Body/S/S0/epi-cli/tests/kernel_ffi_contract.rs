use epi_logos::ffi::kernel::{
    kernel_bioquaternion_init, kernel_energy_evaluate, kernel_epogdoon_log, kernel_resonance_index,
    kernel_resonance_square_emphasis, kernel_slash_flip_bimba_prime, kernel_tick_from_epogdoon,
    kernel_tritone_square_for_lens, KernelBioquaternion, KernelElement, KernelEnergy, KernelPhase,
    KernelResonanceVector, Quaternion,
};
use portal_core::{
    kernel_resonance_square_emphasis as rust_resonance_square_emphasis,
    kernel_tick_from_epogdoon as rust_tick_from_epogdoon,
    tritone_square_for_lens as rust_tritone_square_for_lens, BioQuaternionState, ResonanceVector72,
};

fn near(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.0001
}

#[test]
fn ffi_kernel_exposes_real_c_bioquaternion_math() {
    let state = unsafe {
        kernel_bioquaternion_init(
            Quaternion {
                w: 2.0,
                x: 0.0,
                y: 0.0,
                z: 0.0,
            },
            Quaternion {
                w: 0.5,
                x: 0.5,
                y: 0.5,
                z: 0.5,
            },
        )
    };
    assert!(near(state.q_b.w, 1.0));

    let b_prime = unsafe { kernel_slash_flip_bimba_prime(state) };
    assert!(near(b_prime.w, 0.5));
    assert!(near(b_prime.x, -0.5));
    assert!(near(b_prime.y, -0.5));
    assert!(near(b_prime.z, -0.5));
    assert!(near(
        unsafe { kernel_epogdoon_log() },
        (9.0f32 / 8.0f32).ln()
    ));
}

#[test]
fn ffi_kernel_energy_combines_latent_lens_and_r_terms() {
    let state = KernelBioquaternion {
        q_b: Quaternion {
            w: 1.0,
            x: 0.0,
            y: 0.0,
            z: 0.0,
        },
        q_p: Quaternion {
            w: 0.0,
            x: 1.0,
            y: 0.0,
            z: 0.0,
        },
    };
    let mut observed = KernelResonanceVector { values: [0.0; 72] };
    let target = KernelResonanceVector { values: [0.0; 72] };
    let idx = unsafe { kernel_resonance_index(0, 0, 0) };
    observed.values[idx as usize] = 1.0;

    let energy: KernelEnergy = unsafe { kernel_energy_evaluate(state, &observed, &target, 0.25) };
    assert!(near(energy.bimba_pratibimba_energy, 2.0));
    assert!(near(energy.lens_energy, 1.0 / 72.0));
    assert!(near(energy.total_energy, 2.0 + (1.0 / 72.0) + 0.25));
}

#[test]
fn ffi_kernel_tick_and_square_contract_match_rust_mirror() {
    for raw_tick in 0..24u8 {
        let c_tick = unsafe { kernel_tick_from_epogdoon(5, raw_tick) };
        let rust_tick = rust_tick_from_epogdoon(5, raw_tick);

        assert_eq!(c_tick.cycle, rust_tick.cycle);
        assert_eq!(c_tick.sub_tick, rust_tick.sub_tick);
        assert_eq!(
            c_tick.phase,
            match rust_tick.phase {
                portal_core::KernelPhase::Descent => KernelPhase::Descent,
                portal_core::KernelPhase::Ascent => KernelPhase::Ascent,
            }
        );
        assert_eq!(
            c_tick.element,
            match rust_tick.element {
                portal_core::KernelElement::BimbaEncoding => KernelElement::BimbaEncoding,
                portal_core::KernelElement::PratibimbaPrehension => {
                    KernelElement::PratibimbaPrehension
                }
                portal_core::KernelElement::MobiusDescent => KernelElement::MobiusDescent,
                portal_core::KernelElement::SlashFlip => KernelElement::SlashFlip,
                portal_core::KernelElement::PratibimbaAsBimba => KernelElement::PratibimbaAsBimba,
                portal_core::KernelElement::DoubledPrehension => KernelElement::DoubledPrehension,
                portal_core::KernelElement::InverseMobius => KernelElement::InverseMobius,
                portal_core::KernelElement::EnrichedReturn => KernelElement::EnrichedReturn,
            }
        );
        assert_eq!(c_tick.position6, rust_tick.position6);
        assert!(near(c_tick.harmonic_ratio, rust_tick.harmonic_ratio));
    }

    for lens in 0..6u8 {
        assert_eq!(
            unsafe { kernel_tritone_square_for_lens(lens) } as usize,
            rust_tritone_square_for_lens(lens).expect("valid lens")
        );
    }
    assert_eq!(unsafe { kernel_resonance_index(6, 0, 0) }, 0xFF);
    assert_eq!(unsafe { kernel_resonance_index(0, 2, 0) }, 0xFF);
    assert_eq!(unsafe { kernel_resonance_index(0, 0, 6) }, 0xFF);
    assert_eq!(unsafe { kernel_tritone_square_for_lens(6) }, 0xFF);
}

#[test]
fn ffi_square_emphasis_matches_rust_mirror_for_full_72_vector() {
    let mut c_vector = KernelResonanceVector { values: [0.0; 72] };
    let mut rust_vector = ResonanceVector72::default();
    for index in 0..72 {
        let value = (index as f32 + 1.0) / 72.0;
        c_vector.values[index] = value;
        rust_vector.values[index] = value;
    }

    let mut c_squares = [0.0f32; 3];
    unsafe { kernel_resonance_square_emphasis(&c_vector, c_squares.as_mut_ptr()) };
    let rust_squares = rust_resonance_square_emphasis(&rust_vector);
    for square in 0..3 {
        assert!(near(c_squares[square], rust_squares[square]));
    }
}

#[test]
fn ffi_and_rust_kernel_normalize_nonzero_near_zero_quaternions_identically() {
    let c_state = unsafe {
        kernel_bioquaternion_init(
            Quaternion {
                w: 0.0,
                x: 0.000001,
                y: 0.0,
                z: 0.0,
            },
            Quaternion {
                w: 0.0,
                x: 0.0,
                y: 0.000001,
                z: 0.0,
            },
        )
    };
    let rust_state = BioQuaternionState::new([0.0, 0.000001, 0.0, 0.0], [0.0, 0.0, 0.000001, 0.0]);

    assert!(near(c_state.q_b.w, rust_state.q_b[0]));
    assert!(near(c_state.q_b.x, rust_state.q_b[1]));
    assert!(near(c_state.q_b.y, rust_state.q_b[2]));
    assert!(near(c_state.q_b.z, rust_state.q_b[3]));
    assert!(near(c_state.q_p.w, rust_state.q_p[0]));
    assert!(near(c_state.q_p.x, rust_state.q_p[1]));
    assert!(near(c_state.q_p.y, rust_state.q_p[2]));
    assert!(near(c_state.q_p.z, rust_state.q_p[3]));
}
