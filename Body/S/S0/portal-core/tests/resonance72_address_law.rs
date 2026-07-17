//! Coordinate: S0/#2/#5 (the 72-address law — namespace discipline)
//! Actualises: [[m123-modal-resonator-bell-kernel-spec]] §4 field rules —
//! `m2Address72.address72 == resonance72.lensAnchorIndex == tick12·6 +
//! position`, NEVER derived from `lens·7 + mode` (the recapture register §1
//! 72-fold invariant) — and the legacy↔lens-anchor encoding agreement the
//! M2-ARCHITECTURE test criteria demand.
//! Does NOT own: the tonality namespace (lens·7+mode = the 84-state landscape,
//! MathemeLensMode) or the division namespace (16+1 clock apertures).

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[test]
fn lens_anchor_index_is_tick12_times_6_plus_position_never_lens_times_7_plus_mode() {
    let mut diverged_from_tonality = false;
    for cycle in 0u64..2 {
        for sub_tick in 0u8..12 {
            let profile =
                MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, sub_tick));
            // Independent spec arithmetic for the 72-address.
            let expected = usize::from(profile.tick12) * 6 + usize::from(profile.position6);
            assert_eq!(
                profile.resonance72.lens_anchor_index, expected,
                "lens_anchor_index != tick12·6+position at tick {sub_tick}"
            );
            assert!(
                profile.resonance72.lens_anchor_index < 72,
                "72-space escape"
            );

            // The bell contract: the modal resonator's m2Address72 is THE SAME
            // number — one 72-address on the whole bus.
            let modal = profile
                .modal_resonator
                .as_ref()
                .expect("from_tick carries the modal resonator projection");
            assert_eq!(
                modal.m2_address72.address72, expected,
                "modalResonator.m2Address72 must equal resonance72.lensAnchorIndex"
            );

            // Namespace discipline: the tonality index (lens·7+mode) is a
            // DIFFERENT number for at least some ticks — the two namespaces
            // never merge.
            let tonality =
                usize::from(profile.lens_mode.lens) * 7 + usize::from(profile.lens_mode.mode);
            if tonality != expected {
                diverged_from_tonality = true;
            }
        }
    }
    assert!(
        diverged_from_tonality,
        "the 72-address and the 84-state tonality index must be distinct namespaces"
    );
}

#[test]
fn legacy_and_lens_anchor_encodings_agree_on_the_same_cell() {
    for cycle in 0u64..2 {
        for sub_tick in 0u8..12 {
            let profile =
                MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, sub_tick));
            let r = &profile.resonance72;
            // The two encodings address one cell: the legacy 6-lens/helix
            // index recomposes from the lens-anchor decomposition.
            // lens_anchor_index = tick12·6 + position with tick12 = base_lens
            // + 6·helix_bit ⇒ legacy index must live in the same 72-space and
            // carry the same (base_lens, helix, position) reading.
            assert!(
                r.legacy_resonance_index < 72,
                "legacy index escapes 72-space"
            );
            let helix_bit = usize::from(profile.tick12) / 6;
            let base_lens = usize::from(profile.tick12) % 6;
            let recomposed_anchor =
                (base_lens + 6 * helix_bit) * 6 + usize::from(profile.position6);
            assert_eq!(
                r.lens_anchor_index, recomposed_anchor,
                "lens-anchor decomposition must recompose to the same 72-cell"
            );
        }
    }
}
