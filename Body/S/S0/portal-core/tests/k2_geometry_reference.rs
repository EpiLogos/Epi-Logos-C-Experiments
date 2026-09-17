//! Coordinate: S0/#1/#5 (K² geometry + codon annulus — kernel reference tests)
//! Actualises: hardening ledger §5 C5 — "K² torus aspect, codon annulus 2π/64
//! geometry: render-only; no kernel/reference assertion" — authored as kernel
//! assertions (2026-07-06 computational-core truth session).
//!
//! The codon annulus law is uncontested canon: 64 cells of angular size
//! 2π/64 on the equator, cell n at angle n·2π/64
//! ([[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §5.4); the kernel
//! discretisation is `addr64 = floor(deg·64/360)` (luts/mahamaya.rs).
//!
//! The K² aspect ratio is DERIVATION-RESOLVED (2026-07-06, Architect-directed,
//! from [[ql-musical-derivation-v3]] register discipline): 16/9 is the ONLY
//! canonical ratio in the internal-proportion register — "the ratio-face of
//! 1/1, the way 100% internally-decomposes into 64+36" (v3 §II-0). A torus
//! body IS one standing whole decomposed into two radii, so R/r = 16/9 with
//! R + r = 1 (R = 0.64 Mahāmāyā 2⁶, r = 0.36 Paraśakti 6²; outer equator =
//! the unit 1/1). The epogdoon 9/8 is a GENERATOR/step-register ratio — its
//! torus seats are the 30°/tick stepping arc and the double-cover relation
//! 2r/R = 72/64 = 9/8 (v3's third epogdoon derivation made geometric); it is
//! never the body aspect. The old 9/8-aspect claim traces to an illustrative
//! aside (physical-pole-stack-architecture.md:110 "setting R/r = 9/8…"), not
//! a derivation.
//! Does NOT own: the renderer's screen-scale factor (M' may scale R+r
//! uniformly; the PROPORTIONS are law).

use portal_core::mahamaya::mahamaya_address64_from_degree;
use portal_core::state::compute_orbital_position;

// Non-inline C symbols from the statically-linked epi-lib (m1.c).
extern "C" {
    fn hopf_project(degree_720: u16) -> u16;
    fn hopf_fiber(degree_720: u16) -> u8;
    fn hopf_tick12(degree_720: u16) -> u8;
}

#[test]
fn codon_annulus_addr64_is_floor_degree_times_64_over_360_for_every_degree() {
    for degree in 0u16..720 {
        // Independent spec arithmetic: floor((deg mod 360)·64/360).
        let expected = ((u32::from(degree % 360) * 64) / 360) as u8;
        assert_eq!(
            mahamaya_address64_from_degree(degree),
            expected,
            "annulus address law broken at degree {degree}"
        );
    }
}

#[test]
fn codon_annulus_has_64_cells_of_width_2pi_over_64() {
    // Discrete face of the 2π/64 law: the 64 addresses partition the 360
    // integer degrees with cell widths of 5 or 6 degrees (360/64 = 5.625°,
    // the integer shadow of the continuous 2π/64 sector), covering exactly
    // once with no gaps and monotone cell boundaries.
    let mut counts = [0u16; 64];
    let mut previous = 0u8;
    for degree in 0u16..360 {
        let addr = mahamaya_address64_from_degree(degree);
        assert!(addr < 64, "address {addr} escapes the 64-cell annulus");
        assert!(
            addr == previous || addr == previous + 1,
            "annulus addresses must advance monotonically by ≤1 (degree {degree})"
        );
        previous = addr;
        counts[addr as usize] += 1;
    }
    let total: u16 = counts.iter().sum();
    assert_eq!(
        total, 360,
        "annulus cells must cover the wheel exactly once"
    );
    for (cell, count) in counts.iter().enumerate() {
        assert!(
            *count == 5 || *count == 6,
            "cell {cell} spans {count}° — the 2π/64 sector discretises to 5° or 6°"
        );
    }
    // The continuous law itself: 64 sectors of 2π/64 close the circle.
    let sector = std::f64::consts::TAU / 64.0;
    assert!((64.0 * sector - std::f64::consts::TAU).abs() < 1e-12);
}

#[test]
fn hopf_bundle_laws_mirror_across_rust_and_c() {
    for degree in 0u16..720 {
        // Spec arithmetic, independent of both engines.
        let project = degree % 360;
        let fiber = u8::from(degree >= 360);
        let tick12 = (project / 30) as u8;

        // Rust engine (f64 surface).
        let rust_project = portal_core::hopf::hopf_project(f64::from(degree));
        assert!(
            (rust_project - f64::from(project)).abs() < 1e-9,
            "Rust hopf_project diverges at {degree}"
        );
        assert_eq!(portal_core::hopf::hopf_fiber(f64::from(degree)), fiber);

        // C engine (m1.c), via FFI.
        let (c_project, c_fiber, c_tick12) = unsafe {
            (
                hopf_project(degree),
                hopf_fiber(degree),
                hopf_tick12(degree),
            )
        };
        assert_eq!(c_project, project, "C hopf_project diverges at {degree}");
        assert_eq!(c_fiber, fiber, "C hopf_fiber diverges at {degree}");
        assert_eq!(c_tick12, tick12, "C hopf_tick12 diverges at {degree}");
    }
}

#[test]
fn k2_torus_carries_the_standing_identity_as_its_body_proportions() {
    // DERIVED LAW (ql-musical-derivation-v3, internal-proportion register):
    // the torus body is the standing identity 100% = 64 + 36 in geometry.
    let (r_minor, r_major) = (0.36f64, 0.64f64);

    // (1) R + r = 1: the outer equator is the unit circle — the 1/1.
    assert!(
        (r_major + r_minor - 1.0).abs() < 1e-9,
        "R + r must close on the standing identity 1/1 = 100%"
    );
    // (2) R/r = 16/9 = 64/36: the totality-ratio as the body's aspect
    //     ("16/9 is the ratio-face of 1/1" — v3 §II-0).
    assert!(
        (r_major / r_minor - 16.0 / 9.0).abs() < 1e-9,
        "the K² aspect is the 64:36 totality-ratio 16/9"
    );
    // (3) The epogdoon's own seat on the SAME body: the Paraśakti double-cover
    //     of the minor circle against the Mahāmāyā major — 2r/R = 72/64 = 9/8
    //     (v3's third epogdoon derivation, 2·6²/2⁶, rendered geometric).
    //     The 9/8 lives IN the 16/9 torus; it is a step/double-cover relation,
    //     never the aspect.
    assert!(
        ((2.0 * r_minor) / r_major - 9.0 / 8.0).abs() < 1e-9,
        "the epogdoon must re-emerge as the double-cover relation 2r/R = 72/64"
    );

    for &(degree, tick12) in &[(0u16, 0u8), (90, 3), (180, 6), (270, 9), (359, 11)] {
        let [x, y, z] = compute_orbital_position(degree, tick12);
        // Point-on-torus law: (√(x²+y²) − R)² + z² = r².
        let ring = f64::from(x).hypot(f64::from(y));
        let residue = (ring - r_major).powi(2) + f64::from(z).powi(2);
        assert!(
            (residue - r_minor * r_minor).abs() < 1e-6,
            "orbital position ({degree},{tick12}) leaves the torus surface: residue {residue}"
        );
    }
}
