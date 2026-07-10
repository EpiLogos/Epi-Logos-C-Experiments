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
fn m3_charges_sum_pp_360_boot_assert() {
    // Canonical integral invariant (parity with C `m3_verify_integral_invariant`
    // at `m3.c:930` and `M3_INTEGRAL_INVARIANT`): the RAW sum of pp over all 64
    // codons is 1440; its /4 suit-level projection is the spec's 360. Normalising
    // the charges themselves by /4 is forbidden — it would break the FR 2.3.18 4X
    // invariant the oracle now routes through (Track 33/4.13).
    let raw_sum: i32 = (0u8..64)
        .map(|codon| bioquaternion_transcription(codon).charges.pp as i32)
        .sum();
    assert_eq!(raw_sum, 1440, "raw sum(pp) over the codon space is 1440 (= 4 × 360)");
    assert_eq!(raw_sum / 4, 360, "the /4 suit-level integral projection is the spec's 360");
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
// GREEN since 2026-07-08: the primitive landed in epi-lib C (m1.c/m1.h) and
// propagates through portal-core/spanda.rs (C ground → Rust surface). Each
// test asserts the law authored 2026-07-06 (computational-core truth session;
// canon: 02-m1-paramasiva-reconciliation.md T2.11) against the live field.
// ---------------------------------------------------------------------------

/// The 12 RING_QUATERNION_LUT states, reconstructed as spec arithmetic
/// (independent of the implementation): ascent half-angles 0..150° at
/// positions 0-5, descent −30..−150° at 6-10, the 180° antipode at 11.
fn ring_quaternion_spec(n: u8) -> portal_core::SpandaQuaternion {
    let half_angle_deg: f64 = match n {
        0..=5 => 30.0 * f64::from(n),
        11 => 180.0,
        _ => -30.0 * (f64::from(n) - 5.0),
    };
    let half_angle = half_angle_deg.to_radians();
    portal_core::SpandaQuaternion {
        w: half_angle.cos() as f32,
        x: half_angle.sin() as f32,
        y: 0.0,
        z: 0.0,
    }
}

#[test]
fn spanda_hkb_antiphase_bistability() {
    // The law: integrating dφ/dt = Δω − a·sin φ − 2b·sin 2φ from a perturbed
    // init converges to φ=0 (in-phase, SPANDA_SEED, the `=`) or φ=π
    // (antiphase, the `≠`) — two real attractors with the slash-as-barrier
    // (the b·cos 2φ term) standing between them.
    let p = portal_core::SpandaHkbParams::default_derived();
    let settled_in = portal_core::hkb_settle(0.4, 1e-3, 200_000, &p);
    assert!(
        settled_in.abs() < 1e-3,
        "perturbed in-phase init must fall back to φ=0, settled {settled_in}"
    );
    let settled_anti = portal_core::hkb_settle(std::f64::consts::PI - 0.4, 1e-3, 200_000, &p);
    assert!(
        (settled_anti.abs() - std::f64::consts::PI).abs() < 1e-3,
        "perturbed antiphase init must fall back to φ=π, settled {settled_anti}"
    );
    assert!(portal_core::hkb_drift(0.0, &p).abs() < 1e-12);
    assert!(portal_core::hkb_curvature(0.0, &p) > 0.0);
    assert!(portal_core::hkb_curvature(std::f64::consts::PI, &p) > 0.0);
    let barrier = portal_core::hkb_potential(std::f64::consts::FRAC_PI_2, &p);
    assert!(barrier > portal_core::hkb_potential(0.0, &p));
    assert!(barrier > portal_core::hkb_potential(std::f64::consts::PI, &p));
}

#[test]
fn spanda_standing_identity_superposition() {
    // The law: the counter-phase superposition computes 0/1 + 1/0 = 1/1 —
    // at the antinode each unit pole contributes exactly 1 and the sum peaks
    // at 2 (the 100%); at the node the SAME two waves cancel to 0 at every
    // instant (the ≠ heard as silence).
    assert!((portal_core::pole_wave(0.0, 0.0, 0, false) - 1.0).abs() < 1e-12);
    assert!((portal_core::pole_wave(0.0, 0.0, 1, false) - 1.0).abs() < 1e-12);
    assert!((portal_core::superposition(0.0, 0.0, false) - 2.0).abs() < 1e-12);
    let mut peak = 0.0f64;
    for i in 0..=1000u32 {
        let t = f64::from(i) * std::f64::consts::TAU / 1000.0;
        peak = peak.max(portal_core::superposition(0.0, t, false).abs());
        assert!(
            portal_core::superposition(std::f64::consts::FRAC_PI_2, t, false).abs() < 1e-9,
            "the node must be silent at every t"
        );
    }
    assert!((peak - 2.0).abs() < 1e-3, "antinode peak must be 2x constructive, got {peak}");
    assert!((portal_core::standing_envelope(0.0, false) - 2.0).abs() < 1e-12);
    assert!(portal_core::standing_envelope(std::f64::consts::FRAC_PI_2, false) < 1e-12);
}

#[test]
fn tick12_flowers_from_oscillation() {
    // The law: the twelvefold is GENERATED by spanda's flowering internal to
    // the oscillation (fold-counts 4→6→8→10→12) and QL derives FROM it — not
    // an independent 12-LUT, not QL-positions-first. The C generator returns
    // 0 if SPANDA_CF_FOLD_COUNT/SPANDA_CF_SUBSTAGE_LUT ever disagree with the
    // +2 progression, so 12 here means generation-and-agreement, never a
    // read-back literal.
    assert_eq!(
        portal_core::intrinsic_twelvefold(),
        12,
        "the flowering progression 4→6→8→10→12 must generate the twelvefold"
    );
    assert_eq!(
        portal_core::ql_positions_derived(),
        6,
        "QL's 6 positions derive from the twelvefold (6 = 12/2), never the reverse"
    );
    // tick12 is a READOUT of the continuous cycle phase — monotone across one
    // oscillation, wrapping on the Möbius return, never an independent counter.
    let readouts: Vec<u8> = (0..12u8)
        .map(|i| {
            let phase = (f64::from(i) + 0.5) * std::f64::consts::TAU / 12.0;
            portal_core::tick12_readout(phase)
        })
        .collect();
    assert_eq!(readouts, (0..12u8).collect::<Vec<u8>>());
    assert_eq!(portal_core::tick12_readout(std::f64::consts::TAU + 0.01), 0);
}

#[test]
fn codon_advances_on_rotational_state_not_tick12() {
    // The law: the active codon steps from the quaternionic-rotational state
    // + the clock + the epogdoon — never from the bare tick12 integer.
    // Spec arithmetic (independent of the implementation): the rotational
    // arc gives (helix, position); the cycle gives the lens class; the
    // 72-address compresses 9:8 into the 64 codon space (m3.c law,
    // apply_epogdoon_compression = addr72 * 8 / 9).
    let expected = |arc: u8, cycle: u64| -> u8 {
        let lens = (cycle % 6) as u8;
        let helix = u8::from(arc >= 6);
        let addr72 = lens * 12 + helix * 6 + (arc % 6);
        (u16::from(addr72) * 8 / 9) as u8
    };
    // LUT index → rotational angle-step: ascent 0-5 sit at 0..150°, the
    // antipode 11 at 180° (step 6), descent 6-10 at 330°..210° (steps 11..7).
    // The rule reads the REAL half-angle, so the arc is the angle-step, not
    // the LUT ordinal.
    let angle_step = |n: u8| -> u8 {
        match n {
            0..=5 => n,
            11 => 6,
            _ => 17 - n,
        }
    };
    // (1) The codon advances as the rotational state advances.
    let codons: Vec<u8> = (0..12u8)
        .map(|n| portal_core::codon_advance(ring_quaternion_spec(n), 0))
        .collect();
    for (n, &codon) in codons.iter().enumerate() {
        assert_eq!(
            codon,
            expected(angle_step(n as u8), 0),
            "ring state {n} must follow the derived rule"
        );
    }
    assert!(
        codons.iter().collect::<std::collections::HashSet<_>>().len() > 1,
        "the codon must actually advance with the rotational state"
    );
    // (2) The SU(2) sign is read: antipodal states q and −q are the SAME
    // SO(3) face — a face-level (tick12-style) clock cannot tell them apart —
    // yet the codon differs, because the double cover is load-bearing.
    let q2 = ring_quaternion_spec(2);
    let q2_antipode = portal_core::SpandaQuaternion { w: -q2.w, x: -q2.x, y: -q2.y, z: -q2.z };
    assert_ne!(
        portal_core::codon_advance(q2, 0),
        portal_core::codon_advance(q2_antipode, 0),
        "q and -q (same SO(3) rotation) must resolve to different codons"
    );
    // (3) The clock enters as the real cycle, not the bare tick12: identical
    // rotational state (hence identical tick12 readout), different cycle →
    // the codon still advances. The bare tick12 integer is provably
    // insufficient as the codon's clock.
    let q3 = ring_quaternion_spec(3);
    assert_ne!(
        portal_core::codon_advance(q3, 0),
        portal_core::codon_advance(q3, 1),
        "same rotational state across cycles must not freeze the codon clock"
    );
}

#[test]
fn spanda_bistability_threshold_asymmetry() {
    // The law: φ=0 is stable at EVERY positive coupling (V″(0)=a+4b>0 —
    // identity unconditional); φ=π is stable ONLY above b/a > 1/4
    // (V″(π)=4b−a>0 — difference real but conditional, a held achievement).
    // Sweeping b/a downward collapses the antiphase basin into in-phase;
    // sweeping back up does NOT recapture it — hysteresis across the sweep.
    let pi = std::f64::consts::PI;
    let params_for = |b_over_a: f64| portal_core::SpandaHkbParams {
        delta_omega: 0.0,
        a: 1.0,
        b: b_over_a,
        base_freq_hz: 2.5,
    };
    let mut phi_carried = pi - 0.15; // the held antiphase state, carried across the sweep
    let mut collapsed = false;
    for i in 0..=11u32 {
        let ratio = 0.60 - 0.05 * f64::from(i); // 0.60 down to 0.05
        let p = params_for(ratio);
        // Identity is unconditional at every swept value.
        let settled_in = portal_core::hkb_settle(0.3, 1e-3, 400_000, &p);
        assert!(settled_in.abs() < 1e-3, "phi=0 must hold at b/a={ratio}");
        assert!(portal_core::hkb_curvature(0.0, &p) > 0.0);
        // The curvature law pins the threshold analytically (skipping only
        // the marginal point itself, where V″(π) crosses zero).
        if (ratio - 0.25).abs() > 1e-6 {
            assert_eq!(
                portal_core::hkb_curvature(pi, &p) > 0.0,
                ratio > 0.25,
                "V''(pi) = 4b-a must change sign exactly at b/a = 1/4 (at {ratio})"
            );
        }
        // Difference is conditional: the carried antiphase state survives
        // clearly above threshold and MUST be gone clearly below it. The
        // probe kick matters: a settled state sits at φ=π to machine
        // precision, and exactly-π has zero drift even once unstable — the
        // "trembling slash" (critical fluctuation near threshold) is what
        // reveals the collapse, so each sweep step perturbs before settling.
        phi_carried = portal_core::hkb_settle(phi_carried - 0.05, 1e-3, 400_000, &p);
        let anti_holds = (phi_carried.abs() - pi).abs() < 1e-2;
        if ratio > 0.30 {
            assert!(anti_holds, "antiphase must hold at b/a={ratio}");
            // And fresh perturbed inits reach BOTH attractors up here.
            let fresh = portal_core::hkb_settle(pi - 0.4, 1e-3, 400_000, &p);
            assert!((fresh.abs() - pi).abs() < 1e-3);
        }
        if ratio < 0.20 {
            assert!(!anti_holds, "antiphase basin must have collapsed at b/a={ratio}");
            collapsed = true;
        }
    }
    assert!(collapsed, "the sweep must actually cross the collapse");
    // Hysteresis: after the collapse the state sits in φ=0; restoring the
    // coupling far above threshold does not lift it back into antiphase.
    let phi_after = portal_core::hkb_settle(phi_carried - 0.05, 1e-3, 400_000, &params_for(0.60));
    assert!(
        phi_after.abs() < 1e-3,
        "the collapsed state must stay in-phase when coupling returns - path dependence"
    );
}

#[test]
fn spanda_two_involutions_distinct() {
    // Index half (cross-pinned in tests/spanda_involutions.rs): reflection
    // 11−n and half-turn n+6 are each order-2, never coincide, and compose
    // to 5−n — Klein four-group closure on the ring.
    for n in 0..12u8 {
        assert_eq!(portal_core::spanda_half_turn(portal_core::spanda_half_turn(n)), n);
        assert_eq!(portal_core::spanda_invert(portal_core::spanda_invert(n)), n);
        assert_ne!(portal_core::spanda_half_turn(n), portal_core::spanda_invert(n));
        assert_eq!(
            portal_core::spanda_half_turn(portal_core::spanda_invert(n)),
            (5 + 12 - n) % 12,
            "reflection then half-turn must compose to 5-n at {n}"
        );
    }
    // Field half — the law this test exists for: the pole-swap (half-turn,
    // the π polarity flip = 6 ticks × 30°) leaves every solo-pole observable
    // invariant …
    for pole in 0..2u8 {
        let unswapped = portal_core::pole_rms(pole, false);
        let swapped = portal_core::pole_rms(pole, true);
        assert!(
            (unswapped - swapped).abs() < 1e-9,
            "solo pole {pole} RMS must be swap-invariant: {unswapped} vs {swapped}"
        );
    }
    for i in 0..100u32 {
        let t = f64::from(i) * 0.1;
        // pole A untouched entirely; pole B a pure sign — inaudible alone.
        assert_eq!(
            portal_core::pole_wave(0.3, t, 0, false),
            portal_core::pole_wave(0.3, t, 0, true)
        );
        assert!(
            (portal_core::pole_wave(0.3, t, 1, true) + portal_core::pole_wave(0.3, t, 1, false))
                .abs()
                < 1e-12
        );
    }
    // … and is detectable ONLY in superposition, where it exchanges node and
    // antinode — the relational-only audibility of the ≠.
    let antinode = 0.0;
    let node = std::f64::consts::FRAC_PI_2;
    assert!((portal_core::standing_envelope(antinode, false) - 2.0).abs() < 1e-12);
    assert!(portal_core::standing_envelope(antinode, true) < 1e-12);
    assert!((portal_core::standing_envelope(node, true) - 2.0).abs() < 1e-12);
    assert!(portal_core::standing_envelope(node, false) < 1e-12);
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
