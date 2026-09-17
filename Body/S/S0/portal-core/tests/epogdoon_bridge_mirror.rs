//! Coordinate: S0/#2/#3 (the 72→64 epogdoon bridge — cross-engine mirror)
//! Actualises: Track 36 mirror-law mandate ("m2ToM3 == floor(res·8/9)" as
//! Rust/C property tests) + the DET superposition law
//! (`transduce_vibration_to_symbol` = OR of `M2_TO_M3_CYMATIC_PROJECTION`
//! masks, m2.h "Wave superposition: OR active M2 states into M3 bitboard").
//! One law, every engine: the Rust luts/mahamaya.rs bridge and the C m2.c
//! bridge must compute the identical 9:8 compression, and the identity
//! 72·8 == 64·9 == 576 is pinned as arithmetic.
//! Does NOT own: the 12×12 raw Ananda core (expected-red, Track 10.10) or the
//! wire-side mirror (live-wire `mahamayaBridgeLaws` manifest entry).

use portal_core::mahamaya::{apply_epogdoon_compression, epogdoon_has_round_trip_loss};

// Non-inline C symbols from the statically-linked epi-lib (m2.c).
extern "C" {
    static M2_TO_M3_CYMATIC_PROJECTION: [u64; 72];
    fn m2_epogdoon_compress(val_72: u8) -> u8;
    fn m3_epogdoon_expand(val_64: u8) -> u8;
    fn transduce_vibration_to_symbol(m2_active_indices: *const u8, count: u8) -> u64;
}

#[test]
fn epogdoon_bridge_identity_72_times_8_equals_64_times_9_equals_576() {
    assert_eq!(72 * 8, 576, "the M2 side of the bridge constant");
    assert_eq!(64 * 9, 576, "the M3 side of the bridge constant");
}

#[test]
fn rust_and_c_epogdoon_compression_mirror_the_floor_8_over_9_law() {
    let mut resolved = 0u8;
    for index in 0usize..72 {
        // Independent spec arithmetic.
        let expected = ((index * 8) / 9) as u8;
        assert_eq!(
            apply_epogdoon_compression(index),
            expected,
            "Rust compression diverges from floor({index}·8/9)"
        );
        let c_value = unsafe { m2_epogdoon_compress(index as u8) };
        assert_eq!(
            c_value, expected,
            "C m2_epogdoon_compress diverges at {index}"
        );

        // Gap law: the fold round-trips exactly on multiples of 9 —
        // 8 resolved slots, 64 provisional gaps across the 72-space.
        let gap = epogdoon_has_round_trip_loss(index);
        assert_eq!(
            gap,
            index % 9 != 0,
            "round-trip law: exact ⇔ index ≡ 0 (mod 9), broken at {index}"
        );
        if !gap {
            resolved += 1;
            // The C expansion inverts exactly on the resolved slots.
            let expanded = unsafe { m3_epogdoon_expand(expected) };
            assert_eq!(
                expanded as usize, index,
                "m3_epogdoon_expand must recover resolved slot {index}"
            );
        }
    }
    assert_eq!(
        resolved, 8,
        "exactly 8 of 72 slots round-trip through 8/9·9/8"
    );
}

#[test]
fn det_transduction_is_the_or_superposition_of_the_72_masks() {
    // Singleton law: transducing one active M2 state IS its mask.
    for index in 0u8..72 {
        let single = unsafe { transduce_vibration_to_symbol(&index, 1) };
        let mask = unsafe { M2_TO_M3_CYMATIC_PROJECTION[index as usize] };
        assert_eq!(single, mask, "singleton transduction != mask[{index}]");
    }
    // Superposition law: multiple active states OR their masks.
    let active: [u8; 3] = [0, 35, 71];
    let expected = unsafe {
        M2_TO_M3_CYMATIC_PROJECTION[0]
            | M2_TO_M3_CYMATIC_PROJECTION[35]
            | M2_TO_M3_CYMATIC_PROJECTION[71]
    };
    let combined = unsafe { transduce_vibration_to_symbol(active.as_ptr(), 3) };
    assert_eq!(
        combined, expected,
        "superposition must be the OR of the masks"
    );
    // Empty superposition is silence.
    assert_eq!(
        unsafe { transduce_vibration_to_symbol(std::ptr::null(), 0) },
        0
    );
    // Full-union coverage: the 72 masks together light all 64 codon bits
    // (the C-side test_det_coverage law, mirrored from Rust).
    let union = (0usize..72).fold(0u64, |acc, i| {
        acc | unsafe { M2_TO_M3_CYMATIC_PROJECTION[i] }
    });
    assert_eq!(union, u64::MAX, "the 72 DET masks must cover the 64-space");
}
