//! Coordinate: S0/#5 (kernel truth suite — Track 00.T4, cycle-3 full rerun)
//! Actualises: [[00-verification-harness]] T4 — the recapture register §4.7/§5
//! spot-audits as REAL tests. Tests marked
//! `#[ignore = "expected-red: …"]` FAIL while their violation stands; the
//! kernel-truth verify-all stage (.codex/scripts/kernel-truth.mjs) runs them
//! with `--ignored` and holds them against
//! plan.runs/kernel-truth-expected-failures.json — red is the work order, an
//! unexpectedly-green entry is investigated and re-recorded.
//! Does NOT own: the violations' fixes (each names its owning rerun track).

use portal_core::transcription::{
    codon_governance_role, codon_transcript_class, is_start_codon, STOP_CODONS,
};
use portal_core::{
    bioquaternion_transcription, kernel_energy_evaluate, BioQuaternionState,
    BioquaternionElement, E4PersonalInputs, E5HarmonicInputs, E6VerifierInputs,
};
use std::path::PathBuf;

// Non-inline C symbols from the statically-linked epi-lib.
extern "C" {
    static R_FACTOR_ROUTE_TABLE: [u16; 7];
    fn m1_ananda_get(matrix_idx: u8, row: u8, col: u8) -> u8;
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("portal-core lives at Body/S/S0/portal-core")
        .to_path_buf()
}

/// NUCLEOTIDE_ICHING_VALUE law (m3.c): A=6, T=9, C=7, G=8.
fn nucleotide_value(two_bits: u8) -> i16 {
    [6i16, 9, 7, 8][(two_bits & 0x3) as usize]
}

// ---------------------------------------------------------------------------
// (c) DR-R0 route words — truth pin (dataset-authoritative, resolved 2026-06-12)
// ---------------------------------------------------------------------------

#[test]
fn route_words_dr_r0_family_pinned() {
    let expected: [u16; 7] = [0x5FC1, 0x4A0A, 0x3853, 0x269F, 0x14E7, 0x032F, 0x717F];
    let table = unsafe { R_FACTOR_ROUTE_TABLE };
    assert_eq!(table, expected, "DR-R0 route-word family drifted from m0.h");
    // Complementarity law: Rx + R(5-x) = 5 where both present (3 bits per R,
    // value 7 = absent). Only (R1,R4) and (R2,R3) are checkable — R5 is
    // positionless (the u16 cannot encode it), so R0 has no encoded partner.
    for word in table {
        for r in 1..=2u16 {
            let low = (word >> (r * 3)) & 0x7;
            let high = (word >> ((5 - r) * 3)) & 0x7;
            if low != 7 && high != 7 {
                assert_eq!(low + high, 5, "complementarity broken in {word:#06x} at R{r}");
            }
        }
    }
}

// ---------------------------------------------------------------------------
// (d) transcription constants 27 SHARED + 37 TRANSCRIBABLE + 1 START + 3 STOP
// ---------------------------------------------------------------------------

#[test]
fn transcription_constants_27_shared_37_transcribable_1_start_3_stop() {
    let mut shared = 0;
    let mut transcribable = 0;
    let mut starts = 0;
    for codon in 0u8..64 {
        match codon_transcript_class(codon) {
            0 => shared += 1,
            1 => transcribable += 1,
            other => panic!("codon {codon}: unknown transcript class {other}"),
        }
        if is_start_codon(codon) {
            starts += 1;
        }
    }
    assert_eq!(shared, 27, "SHARED codon count law");
    assert_eq!(transcribable, 37, "TRANSCRIBABLE codon count law");
    assert_eq!(starts, 1, "exactly one START codon (ATG)");
    assert_eq!(STOP_CODONS.len(), 3, "exactly three STOP codons");
    for stop in STOP_CODONS {
        assert_eq!(codon_governance_role(stop), 2, "stop codon {stop} governance role");
    }
}

// ---------------------------------------------------------------------------
// (b) canonical element identity — Rust-side pin (the deep converter
// round-trip runs in epi-lib `make test` → test_m_canonical, 60 checks)
// ---------------------------------------------------------------------------

#[test]
fn canonical_element_identity_crosses_m2_m3_as_canonical_b() {
    // DR-37-3: element IDs cross M2↔M3 as canonical-B only. The kernel's
    // charge identity carries the canonical [w=Earth, x=Fire, y=Water, z=Air].
    let transcription = bioquaternion_transcription(0);
    assert_eq!(
        transcription.elements_canonical,
        [
            BioquaternionElement::Earth,
            BioquaternionElement::Fire,
            BioquaternionElement::Water,
            BioquaternionElement::Air,
        ],
        "canonical-B element order drifted"
    );
}

// ---------------------------------------------------------------------------
// (a) m3_compute_charges FFI reachability + 4X invariant — truth pin
// ---------------------------------------------------------------------------

#[test]
fn m3_compute_charges_ffi_reachable_with_4x_invariant_for_all_64_codons() {
    for codon in 0u8..64 {
        let charges = bioquaternion_transcription(codon).charges;
        let outer = nucleotide_value(codon >> 4);
        let sum = charges.pp as i16 + charges.nn as i16 + charges.np as i16 + charges.pn as i16;
        assert_eq!(
            sum,
            4 * outer,
            "codon {codon}: pp+nn+np+pn must equal 4*outer (FR 2.3.18)"
        );
    }
}

// ---------------------------------------------------------------------------
// (a) boot assert sum(pp)==360 — EXPECTED RED (Track 33 / 4.13)
// ---------------------------------------------------------------------------

#[test]
#[ignore = "expected-red: Track 33/4.13 — spec boot assert sum(pp)==360; the raw kernel sum over 64 codons is 1440 (=4*360); the /4 projection normalization (suit-level sum) has not landed"]
fn m3_charges_sum_pp_360_boot_assert() {
    let sum: i32 = (0u8..64)
        .map(|codon| bioquaternion_transcription(codon).charges.pp as i32)
        .sum();
    assert_eq!(sum, 360, "sum(pp) over the codon space must boot-assert 360");
}

// ---------------------------------------------------------------------------
// (e) m1_ananda_get vs canonical 12×12 Vortex Modulae CSV — EXPECTED RED (10.10)
// ---------------------------------------------------------------------------

/// Extract the 12 position values for the `{r}X + {b}` vortex row from the
/// canonical CSV (10 core positions, then the 10/11 columns after one blank).
fn csv_vortex_row(text: &str, r: u8, b: u8) -> Option<[i32; 12]> {
    let label = format!("{r}X + {b}");
    for line in text.lines() {
        let cells: Vec<&str> = line.split(',').collect();
        for (i, cell) in cells.iter().enumerate() {
            if cell.trim().starts_with(&label) {
                let mut values = [0i32; 12];
                for p in 0..10 {
                    values[p] = cells.get(i + 2 + p)?.trim().parse().ok()?;
                }
                values[10] = cells.get(i + 13)?.trim().parse().ok()?;
                values[11] = cells.get(i + 14)?.trim().parse().ok()?;
                return Some(values);
            }
        }
    }
    None
}

#[test]
#[ignore = "expected-red: Track 10.10 — m1_ananda_get carries the 10×10 %10 core; the canonical Vortex Modulae CSV is 12-fold with RAW (un-modded) values"]
fn m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv() {
    let csv_path = repo_root().join(
        "Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv",
    );
    let text = std::fs::read_to_string(&csv_path)
        .unwrap_or_else(|err| panic!("canonical CSV unreadable at {}: {err}", csv_path.display()));

    // matrix 0 = Bimba = rX + 0 rows; matrix 1 = Pratibimba = rX + 1 rows.
    for (matrix, b) in [(0u8, 0u8), (1u8, 1u8)] {
        for r in 0u8..12 {
            let expected = csv_vortex_row(&text, r, b)
                .unwrap_or_else(|| panic!("CSV row {r}X + {b} not parseable — canonical 12-fold row missing"));
            for c in 0u8..12 {
                let actual = unsafe { m1_ananda_get(matrix, r, c) } as i32;
                assert_eq!(
                    actual, expected[c as usize],
                    "m1_ananda_get({matrix},{r},{c}) != canonical CSV raw value"
                );
            }
        }
    }
}

// ---------------------------------------------------------------------------
// (g) Möbius descent step size log(9/8) — truth pin (T14.C1, default build)
// ---------------------------------------------------------------------------

/// Spec (epi-logos-kernel-spec §3): the Möbius-descent step size is the
/// epogdoon log(9/8) — "Not a tunable hyperparameter; the mathematical-musical
/// quantum inherited from the matheme." ln(9/8) = 0.11778303565638346…
/// derived independently here, never from the code under test.
const SPEC_MOBIUS_STEP_LOG_9_8: f64 = 0.117_783_035_656_383_46;

#[test]
fn mobius_descent_step_size_is_the_untunable_epogdoon_log() {
    let ratio = portal_core::epogdoon_ratio();
    assert_eq!(ratio, 1.125, "epogdoon ratio must be exactly 9/8");
    let step = portal_core::epogdoon_log() as f64;
    assert!(
        (step - SPEC_MOBIUS_STEP_LOG_9_8).abs() < 1e-6,
        "Möbius step size drifted from the spec epogdoon log(9/8): got {step}"
    );
}

// ---------------------------------------------------------------------------
// (g) Möbius descent q_p -= log(9/8)·∇E_total — EXPECTED RED under the gate's
// default-features build (Track 33); the REAL law test below runs only with
// --features resonance_ebm_runtime
// ---------------------------------------------------------------------------

#[cfg(not(feature = "resonance_ebm_runtime"))]
#[test]
#[ignore = "expected-red: Track 33 — the Möbius-descent operator (kernel_riemannian_step / kernel_resonance_ebm_runtime_step) is feature-gated behind `resonance_ebm_runtime`, which neither verify-all nor the kernel-truth stage enables; the kernel's core learning law (step size log(9/8) non-tunable + gradient-descent direction) is dark under the gate"]
fn mobius_descent_operator_compiled_into_gate_build() {
    // Narrowest real probe of a compile-time absence: this arm exists only
    // when the descent operator does NOT. The behavioral law test
    // (mobius_descent_steps_q_p_by_log_9_8_and_descends_e_total) replaces it
    // the moment `resonance_ebm_runtime` is part of the gated build.
    panic!(
        "Möbius descent q_p -= log(9/8)·∇E_total (epi-logos-kernel-spec §3) has no \
         compiled surface in the gate's default-features build — the learning \
         operator cannot be observed by verify-all or kernel-truth"
    );
}

#[cfg(feature = "resonance_ebm_runtime")]
mod mobius_descent_law {
    use super::SPEC_MOBIUS_STEP_LOG_9_8;
    use portal_core::{
        kernel_resonance_ebm_runtime_step, kernel_tangent_projection_s3,
        kernel_tick_from_epogdoon, BioQuaternionState, KernelElement, ResonanceEbmRuntime,
    };

    fn dot4(a: [f64; 4], b: [f64; 4]) -> f64 {
        a.iter().zip(b.iter()).map(|(a, b)| a * b).sum()
    }

    fn f64_quat(q: [f32; 4]) -> [f64; 4] {
        [q[0] as f64, q[1] as f64, q[2] as f64, q[3] as f64]
    }

    /// Synthetic-but-real EBM checkpoint through the production parser:
    /// identity bioquaternion projection, one live embedding channel.
    fn runtime() -> ResonanceEbmRuntime {
        let mut projection = vec![vec![0.0; 8]; 8];
        for idx in 0..8 {
            projection[idx][idx] = 1.0;
        }
        let mut resonance_head = vec![vec![0.0; 8]; 72];
        for row in &mut resonance_head {
            row[5] = 1.0;
        }
        let checkpoint = serde_json::json!({
            "checkpointRef": "kernel-truth-mobius-law-v1",
            "bioquaternionProjection": projection,
            "projectionBias": vec![0.0; 8],
            "resonanceHead": resonance_head,
            "resonanceBias": vec![0.0; 72],
            "groundStateLogZ": 0.0
        });
        ResonanceEbmRuntime::from_json_str(&checkpoint.to_string())
            .expect("synthetic checkpoint loads through the production parser")
    }

    /// Spec (epi-logos-kernel-spec §3):
    /// `q_p^(n+1) = q_p^(n) − log(9/8)·∇_{q_p} E_total`. Two laws asserted on
    /// the RUN computation: (1) the geodesic step length is exactly
    /// log(9/8)·|∇_tangent| — the epogdoon, non-tunable; (2) the step moves
    /// OPPOSITE the gradient and REDUCES E_total (here E4/E6 are fixed at 0,
    /// so E_total = 5·E5/15 is monotone in the E5 channel the EBM computes).
    #[test]
    fn mobius_descent_steps_q_p_by_log_9_8_and_descends_e_total() {
        let runtime = runtime();
        let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]);
        let tick = kernel_tick_from_epogdoon(0, 2);
        assert_eq!(tick.element, KernelElement::MobiusDescent);

        let before = runtime.forward(&state);
        let q_p_before = f64_quat(state.q_p);
        let tangent = kernel_tangent_projection_s3(q_p_before, before.ambient_qp_gradient);
        let tangent_norm = dot4(tangent, tangent).sqrt();
        assert!(tangent_norm > 1e-6, "fixture must yield a live gradient");

        let outcome = kernel_resonance_ebm_runtime_step(&state, tick, Some(&runtime));
        assert_eq!(outcome.descent_steps, 1, "descent tick must take one step");
        assert_eq!(
            outcome.updated_state.q_b, state.q_b,
            "Möbius descent updates q_p only — q_b is Element I's output"
        );

        // (1) Step-size law: geodesic angle moved == log(9/8)·|∇_tangent|.
        let q_p_after = f64_quat(outcome.updated_state.q_p);
        let angle = dot4(q_p_before, q_p_after).clamp(-1.0, 1.0).acos();
        let expected_angle = SPEC_MOBIUS_STEP_LOG_9_8 * tangent_norm;
        assert!(
            (angle - expected_angle).abs() < 1e-4,
            "step length must be the epogdoon log(9/8)·|∇| = {expected_angle}, moved {angle}"
        );

        // (2) Direction law: displacement opposes the tangent gradient…
        let displacement_dot_grad: f64 = (0..4)
            .map(|i| (q_p_after[i] - q_p_before[i]) * tangent[i])
            .sum();
        assert!(
            displacement_dot_grad < 0.0,
            "descent must move q_p opposite the E_total gradient"
        );
        // …and the energy actually descends.
        let after = runtime.forward(&outcome.updated_state);
        assert!(
            after.e_5_harmonic_energy < before.e_5_harmonic_energy,
            "one Möbius step must reduce E_total ({} -> {})",
            before.e_5_harmonic_energy,
            after.e_5_harmonic_energy
        );
    }
}

// ---------------------------------------------------------------------------
// (h) C-engine kernel_energy_evaluate vs canonical (4·E4+5·E5+6·E6)/15 —
// EXPECTED RED (Track 33, C-engine side of the 4:5:6 law; T14.C2)
// ---------------------------------------------------------------------------

/// Non-inline C symbols from the statically-linked epi-lib kernel
/// (include/kernel.h). Mirrors are #[repr(C)] so the call is the C ABI.
mod c_engine {
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct CQuaternion {
        pub w: f32,
        pub x: f32,
        pub y: f32,
        pub z: f32,
    }

    #[repr(C)]
    pub struct CKernelBioquaternion {
        pub q_b: CQuaternion,
        pub q_p: CQuaternion,
    }

    #[repr(C)]
    pub struct CKernelResonanceVector {
        pub values: [f32; 72],
    }

    #[repr(C)]
    #[derive(Clone, Copy, Debug)]
    pub struct CKernelEnergy {
        pub bimba_pratibimba_energy: f32,
        pub lens_energy: f32,
        pub r_energy: f32,
        pub total_energy: f32,
    }

    extern "C" {
        pub fn kernel_energy_evaluate(
            state: CKernelBioquaternion,
            observed: *const CKernelResonanceVector,
            target: *const CKernelResonanceVector,
            r_energy: f32,
        ) -> CKernelEnergy;
    }
}

#[test]
#[ignore = "expected-red: Track 33 — epi-lib src/kernel.c kernel_energy_evaluate computes total_energy = bimba_pratibimba + lens + r as a plain unweighted sum (and leaks the diagnostic latent misalignment into the total); the spec law is E_total = (4·E4+5·E5+6·E6)/15 with the latent term diagnostic-only"]
fn c_engine_kernel_energy_total_carries_456_weighted_channels() {
    use c_engine::{CKernelBioquaternion, CKernelResonanceVector, CQuaternion};

    let identity = CQuaternion {
        w: 1.0,
        x: 0.0,
        y: 0.0,
        z: 0.0,
    };
    // q_b == q_p → the diagnostic latent misalignment is 0; only the mental-
    // pole channels are live: lens (harmonic/E5 seat) = 1.0 via a unit delta
    // on all 72 resonance channels, r (verifier/E6 seat) = 1.0.
    let observed = CKernelResonanceVector { values: [1.0; 72] };
    let target = CKernelResonanceVector { values: [0.0; 72] };
    let energy = unsafe {
        c_engine::kernel_energy_evaluate(
            CKernelBioquaternion {
                q_b: identity,
                q_p: identity,
            },
            &observed,
            &target,
            1.0,
        )
    };

    // Spec law over the engine's own channel outputs (E4 personal channel
    // does not exist in the C decomposition → 0): with lens=1 and r=1 the
    // canonical total is (4·0 + 5·1 + 6·1)/15 = 11/15 ≈ 0.7333; the plain
    // sum yields 2.0.
    let expected_total =
        (4.0 * 0.0 + 5.0 * energy.lens_energy + 6.0 * energy.r_energy) / 15.0;
    assert!(
        (energy.total_energy - expected_total).abs() < 1e-6,
        "C engine total_energy must be the 4:5:6/15 weighted combination \
         (expected {expected_total}, got {})",
        energy.total_energy
    );

    // Diagnostic-exclusion half of the same law: an orthogonal q_p moves the
    // latent misalignment but must NOT move E_total (it is not one of the
    // three weighted channels).
    let orthogonal = CQuaternion {
        w: 0.0,
        x: 1.0,
        y: 0.0,
        z: 0.0,
    };
    let misaligned = unsafe {
        c_engine::kernel_energy_evaluate(
            CKernelBioquaternion {
                q_b: identity,
                q_p: orthogonal,
            },
            &observed,
            &target,
            1.0,
        )
    };
    assert!(
        (misaligned.total_energy - energy.total_energy).abs() < 1e-6,
        "bimba–pratibimba misalignment is diagnostic-only and must not leak \
         into E_total (aligned {}, misaligned {})",
        energy.total_energy,
        misaligned.total_energy
    );
}

// ---------------------------------------------------------------------------
// (f) kernel_energy_evaluate carries E4/E5/E6 with 4:5:6 — EXPECTED RED (Track 33)
// ---------------------------------------------------------------------------

#[test]
#[ignore = "expected-red: Track 33 — kernel_energy_evaluate hardcodes e_5_harmonic_energy = 0.0 and e_6_verifier_energy = 0.0 (inputs unused); the 4:5:6 law is dead weight until the E5/E6 channels land"]
fn kernel_energy_carries_e5_e6_with_456_weighting() {
    let state = BioQuaternionState {
        q_b: [1.0, 0.0, 0.0, 0.0],
        q_p: [0.0, 1.0, 0.0, 0.0],
    };
    // Default (empty) inputs → all channels zero.
    let baseline = kernel_energy_evaluate(
        &state,
        &E4PersonalInputs::default(),
        &E5HarmonicInputs::default(),
        &E6VerifierInputs::default(),
    );
    // Non-default harmonic/verifier inputs MUST move their channels; while the
    // E5/E6 stubs stand these stay 0.0 and this test is red.
    let energised = kernel_energy_evaluate(
        &state,
        &E4PersonalInputs::default(),
        &E5HarmonicInputs {
            channel_set: vec!["m123.chime".to_owned(), "profile.update".to_owned()],
        },
        &E6VerifierInputs {
            invariant_set: vec!["sum-pp-360".to_owned()],
            severity_weights_handle: Some("default".to_owned()),
        },
    );
    assert!(
        energised.e_5_harmonic_energy != 0.0 || baseline.e_5_harmonic_energy != 0.0,
        "E5 harmonic channel is a hardcoded zero — inputs cannot move it"
    );
    assert!(
        energised.e_6_verifier_energy != 0.0 || baseline.e_6_verifier_energy != 0.0,
        "E6 verifier channel is a hardcoded zero — inputs cannot move it"
    );
    // 4:5:6 weighting law over the decomposition (holds once channels live).
    let expected_total = (4.0 * energised.e_4_personal_energy
        + 5.0 * energised.e_5_harmonic_energy
        + 6.0 * energised.e_6_verifier_energy)
        / 15.0;
    assert!(
        (energised.total_energy - expected_total).abs() < 1e-6,
        "total_energy must be the 4:5:6 weighted combination"
    );
}

// ---------------------------------------------------------------------------
// (g) Bell octet offsets + 8+4 chromatic tiling — truth pin (hardening T14.C4)
// [[m123-modal-resonator-bell-kernel-spec]] §2: octet [2,4,6,8,3,5,7,9]
// (bimba P1–P4 then pratibimba P1'–P4'), quartet P0/P5 + P0'/P5'. The eight
// bell-partial ROLE behaviors over the octet stay Track 49's resonator corpus.
// ---------------------------------------------------------------------------

#[test]
fn bell_octet_offsets_and_8_plus_4_tiling_pinned() {
    use portal_core::parashakti::vimarsha_reading::{INNER_FOUR_OFFSETS, NODAL_ANCHOR_OFFSETS};

    // Spec-pinned carrier offsets: four bimba inner-four (whole-tone evens)
    // then four pratibimba inner-four (odds) — order is part of the law.
    assert_eq!(INNER_FOUR_OFFSETS, [2, 4, 6, 8, 3, 5, 7, 9]);
    assert_eq!(NODAL_ANCHOR_OFFSETS, [0, 10, 1, 11]);

    // Runtime 12 = 8 + 4 law: octet + quartet tile the chromatic circle
    // exactly once (no gap, no doubling).
    let mut seen = [0u8; 12];
    for offset in INNER_FOUR_OFFSETS.iter().chain(NODAL_ANCHOR_OFFSETS.iter()) {
        assert!(*offset < 12, "offset {offset} escapes the chromatic circle");
        seen[*offset as usize] += 1;
    }
    for (slot, count) in seen.iter().enumerate() {
        assert_eq!(*count, 1, "chromatic slot {slot} covered {count} times — 12=8+4 tiling broken");
    }
}

// ---------------------------------------------------------------------------
// (h) Q_composed operand order — truth pin (hardening T14.C6)
// [[alpha_quaternionic_integration_across_M_stack]] §6: Q_composed =
// (Q_identity · Q_transit) · Q_activity with identity the stable LEFT
// operand. Quaternion multiplication is non-commutative, so basis inputs
// detect any reordering (associativity alone cannot save a swapped order).
// ---------------------------------------------------------------------------

#[test]
fn q_composed_carries_identity_transit_activity_order() {
    use portal_core::compose_personal_quaternion;

    // [w, x, y, z] Hamilton basis: i·j = k, j·i = −k.
    let q_identity = [0.0f32, 1.0, 0.0, 0.0]; // i
    let q_transit = [0.0f32, 0.0, 1.0, 0.0]; // j
    let q_activity = [0.0f32, 0.0, 0.0, 1.0]; // k

    // Hand-derived: (i·j)·k = k·k = −1 → [−1, 0, 0, 0].
    let composed = compose_personal_quaternion(q_identity, q_transit, q_activity);
    let expected = [-1.0f32, 0.0, 0.0, 0.0];
    for (got, want) in composed.iter().zip(expected.iter()) {
        assert!((got - want).abs() < 1e-6, "Q_composed {composed:?} != spec order result {expected:?}");
    }

    // A transit-first reordering yields (j·i)·k = (−k)·k = +1 → [1, 0, 0, 0]:
    // the spec order must NOT equal it.
    let reordered = compose_personal_quaternion(q_transit, q_identity, q_activity);
    assert!(
        (composed[0] - reordered[0]).abs() > 1.0,
        "operand order is not being enforced: identity-first and transit-first coincide"
    );
}

// ---------------------------------------------------------------------------
// Track 02 T2.11 — the Spanda dual-oscillator primitive (the tick floor).
// EXPECTED RED, all six: the (0/1)/(1/0) dual oscillation exists in
// m1.h:147-210 + spanda.rs only as static algebra (SPANDA_SEED_BITS = 0x03,
// spanda_invert(n) = 11−n); there is NO continuous oscillator — no HKB
// relative-phase field, no counter-phase superposition, no standing wave, no
// flowering-generated twelvefold. Each test names the law it will assert the
// day the primitive lands (authored 2026-07-06, computational-core truth
// session; canon: 02-m1-paramasiva-reconciliation.md T2.11).
// ---------------------------------------------------------------------------

#[test]
#[ignore = "expected-red: Track 02 T2.11 — no HKB relative-phase oscillator exists (m1.c/spanda.rs carry only the static pole algebra); the law: integrating the HKB ODE dφ/dt = Δω − a·sin φ − 2b·sin 2φ from perturbed init must converge to φ=0 (in-phase, SPANDA_SEED, the `=`) or φ=π (antiphase, the `≠`)"]
fn spanda_hkb_antiphase_bistability() {
    panic!(
        "the HKB relative-phase field (bistable φ=0 / φ=π, barrier b·cos2φ) has no \
         compiled surface in epi-lib or portal-core — the tick's oscillatory \
         substrate cannot be observed (Track 02 T2.11 primitive unbuilt)"
    );
}

#[test]
#[ignore = "expected-red: Track 02 T2.11 — no standing-wave/superposition surface exists; the law: the counter-phase superposition at the node computes 0/1 + 1/0 = 1/1 (antinode = 2× constructive = the 100%, node = 0 destructive = the ≠ heard as silence)"]
fn spanda_standing_identity_superposition() {
    panic!(
        "the standing-identity superposition (node computes 0/1 + 1/0 = 1/1) has no \
         compiled surface — the matheme's standing identity is asserted in .rodata \
         constants but never computed from counter-phase waves (Track 02 T2.11)"
    );
}

#[test]
#[ignore = "expected-red: Track 02 T2.11 — the twelvefold is a bare integer LUT (RING_SIZE 12 /* 6 × 2 */ reads QL-first); the law: tick12 is GENERATED by spanda's flowering internal to the oscillation (SPANDA_CF_FOLD_COUNT 4→6→8→10→12) and QL derives FROM it — not an independent 12-LUT, not QL-positions-first"]
fn tick12_flowers_from_oscillation() {
    panic!(
        "tick12 has no oscillatory derivation — the 12-ring is asserted as a static \
         LUT with QL-first causality; the flowering→twelvefold→QL generation chain \
         has no compiled surface (Track 02 T2.11)"
    );
}

#[test]
#[ignore = "expected-red: Track 02 T2.11 — the active codon is derived from the bare tick12 integer (from_tick → lens_mode(tick12) → codon_rotation_from_lens_mode); the law: the codon advances on the real quaternionic-rotational state of the oscillation + the clock + the epogdoon, never on the bare tick12 index"]
fn codon_advances_on_rotational_state_not_tick12() {
    panic!(
        "codon advancement reads the bare tick12 integer as its clock \
         (kernel profile from_tick chain); the quaternionic-rotational + epogdoon \
         stepping rule has no compiled surface (Track 02 T2.11)"
    );
}

#[test]
#[ignore = "expected-red: Track 02 T2.11 — no HKB potential exists to sweep; the law: with b/a > 1/4 both attractors hold from perturbed inits; sweeping b/a below 1/4 collapses the antiphase basin into in-phase while φ=0 stays stable at EVERY swept value (V″(0)=a+4b>0 always; V″(π)=4b−a>0 ⇔ b/a>1/4) — identity unconditional, difference conditional, with hysteresis across the sweep"]
fn spanda_bistability_threshold_asymmetry() {
    panic!(
        "the non-dual landscape asymmetry (φ=0 unconditionally stable, φ=π \
         conditional on b/a > 1/4) has no compiled surface — no potential, no \
         sweep, no phase transition observable (Track 02 T2.11)"
    );
}

#[test]
#[ignore = "expected-red: Track 02 T2.11 — the half-turn involution (n ↦ n+6 mod 12, the antiphase pole-swap) has no named operation on any continuous field; the law: on the field the pole-swap leaves every solo-pole observable invariant and is detectable ONLY in superposition, where it exchanges node and antinode (the relational-only audibility of the ≠). The index-arithmetic half (reflection 11−n vs half-turn n+6, Klein four-group closure) is pinned GREEN in tests/spanda_involutions.rs"]
fn spanda_two_involutions_distinct() {
    panic!(
        "the two involutions are distinct as index maps (pinned green in \
         spanda_involutions.rs) but the field-level law — pole-swap invisible on \
         solo poles, audible only in superposition — has no compiled surface: \
         there is no field (Track 02 T2.11)"
    );
}

// ---------------------------------------------------------------------------
// Stratum-2/6 recognition law — the psychoid field's cymatic signature.
// EXPECTED RED: INTEGRATED-4-5-0 §4.3.1 specifies PsychoidFieldProjection with
// `cymatic_signature: [f32; 64]` — 8 audio_octet bands × 8 standing-wave
// modes, a fixed-size signature (never the protected field body).
// ---------------------------------------------------------------------------

#[test]
#[ignore = "expected-red: Track 08 (integrated 4-5-0 §4.3.1, Wave-A M4 row 8) — no PsychoidFieldProjection exists on the profile bus; the law: the psychoid field surfaces a cymatic_signature of exactly 64 floats = 8 audio_octet bands × 8 standing-wave modes (signature, not body; DR-M4-3 handles-only preserved)"]
fn psychoid_field_projection_carries_cymatic_signature_64_as_8x8_spectrum() {
    panic!(
        "PsychoidFieldProjection (cymatic_signature[64] = 8 octet bands × 8 \
         standing-wave modes, hopf_s2_projection, torus_knot_phase) has no \
         compiled surface on MathemeHarmonicProfile — the recognition path's \
         field-signature law cannot be observed (Track 08)"
    );
}
