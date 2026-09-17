//! Contract: the M1 `KleinFlipEvent::M1TritoneCrossing` variant must fire
//! *precisely* at the Lens N <-> Lens N+3 (mod 12) tritone crossing and must
//! not leak onto any other lens transition in the 12-tick cycle.
//!
//! This guards the detector landed for Tranche 02.T2.2 against false positives:
//! sweeping the full cycle, M1 may appear at exactly one tick (the crossing),
//! and every other lens transition must yield a non-M1 reading.

use portal_core::{kernel_tick_from_epogdoon, KleinFlipEvent, MathemeHarmonicProfile};

/// The tritone crossing sits at the bimba -> pratibimba helix fold: tick 6,
/// where the lens has advanced by a tritone (Lens N <-> Lens N+3 mod 12, each
/// lens step spanning a whole tone in pitch-class space).
const TRITONE_CROSSING_TICK12: u8 = 6;

fn klein_flip_at(sub_tick: u8) -> Option<KleinFlipEvent> {
    MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, sub_tick)).klein_flip
}

#[test]
fn klein_flip_m1_tritone_fires_only_at_the_lens_tritone_boundary() {
    let mut m1_ticks = Vec::new();
    for sub_tick in 0u8..12 {
        if let Some(KleinFlipEvent::M1TritoneCrossing { tick12, lens_pair }) =
            klein_flip_at(sub_tick)
        {
            // The emitted lens pair must itself be a tritone: a 6-semitone gap,
            // i.e. lenses three whole-tone steps apart (mod 12).
            let (lo, hi) = lens_pair;
            let gap = (hi as i16 - lo as i16).rem_euclid(12);
            assert_eq!(
                gap, 6,
                "M1 lens_pair {lens_pair:?} at tick12={tick12} must span a tritone (6 semitones)"
            );
            m1_ticks.push(tick12);
        }
    }

    assert_eq!(
        m1_ticks,
        vec![TRITONE_CROSSING_TICK12],
        "M1TritoneCrossing must fire exactly once per cycle, at the tritone crossing"
    );
}

#[test]
fn klein_flip_m1_absent_on_other_lens_transitions() {
    for sub_tick in 0u8..12 {
        if sub_tick == TRITONE_CROSSING_TICK12 {
            continue;
        }
        let event = klein_flip_at(sub_tick);
        assert!(
            !matches!(event, Some(KleinFlipEvent::M1TritoneCrossing { .. })),
            "tick12={sub_tick} is not the tritone crossing yet reported M1: {event:?}"
        );
    }
}
