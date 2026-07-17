//! Coordinate: S0/#1 (the four foundational ratios + epogdoon over the tick)
//! Actualises: [[epi-logos-kernel-spec]] §0 Table D — the kernel's harmonic
//! skeleton is exactly {4/3, 3/4, 2/3, 3/2} with the epogdoon 9/8 as the
//! fifth/fourth difference ((3/2)/(4/3) = 9/8) and 1/1 as the standing
//! identity; every sub-tick's harmonic ratio is drawn from that closed set.
//! Also pins MODE_INTERVALS = [0,2,4,5,7,9,11] — the diatonic interval law
//! carrying the 12×7 = 84 landscape ([[M2-ARCHITECTURE]] §2.5).
//! Does NOT own: the per-subtick assignment table (implementation placement);
//! the law is the closed ratio-set + presence of all four directions.

use portal_core::harmonic_ratio_fraction_for_sub_tick;
use portal_core::parashakti::vimarsha_reading::MODE_INTERVALS;
use std::collections::HashSet;

#[test]
fn every_sub_tick_ratio_is_drawn_from_the_matheme_ratio_set() {
    // Spec Table D: unison, fourths both ways, fifths both ways, epogdoon.
    let lawful: HashSet<(u16, u16)> = [(1, 1), (4, 3), (3, 4), (2, 3), (3, 2), (9, 8)]
        .into_iter()
        .collect();
    let mut seen = HashSet::new();
    for sub_tick in 0u8..12 {
        let ratio = harmonic_ratio_fraction_for_sub_tick(sub_tick);
        assert!(
            lawful.contains(&ratio),
            "sub-tick {sub_tick} carries {ratio:?} — outside the matheme's harmonic skeleton"
        );
        seen.insert(ratio);
    }
    // All four foundational directions AND the epogdoon must actually sound
    // across one 12-tick cycle.
    for required in [(4, 3), (3, 4), (2, 3), (3, 2), (9, 8)] {
        assert!(
            seen.contains(&required),
            "ratio {required:?} never sounds across the 12-tick cycle"
        );
    }
}

#[test]
fn the_epogdoon_is_the_fifth_over_the_fourth() {
    // (3/2) / (4/3) = 9/8 — independent arithmetic, the kernel-spec identity.
    let fifth = 3.0f64 / 2.0;
    let fourth = 4.0f64 / 3.0;
    assert!((fifth / fourth - 9.0 / 8.0).abs() < 1e-12);
    // And the kernel's own epogdoon accessors carry exactly that quantum.
    assert_eq!(portal_core::epogdoon_ratio(), 1.125);
    assert!((portal_core::epogdoon_log() as f64 - (9.0f64 / 8.0).ln()).abs() < 1e-6);
}

#[test]
fn mode_intervals_carry_the_diatonic_seven() {
    // The diatonic law: seven intervals [0,2,4,5,7,9,11] spanning the octave —
    // the modal half of the 12×7 = 84 (lens, mode) landscape.
    assert_eq!(MODE_INTERVALS, [0, 2, 4, 5, 7, 9, 11]);
    assert_eq!(
        MODE_INTERVALS.len() * 12,
        84,
        "12 lenses × 7 modes = 84 states"
    );
}
