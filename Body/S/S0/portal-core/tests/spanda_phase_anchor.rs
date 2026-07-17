//! 02.T2.12 / DR-M1-5 acceptance — the engine-owned lazy phase anchor.
//! Held ⇒ constant readout across evaluations; flowing ⇒ the readout advances
//! at the band-cited STEP rate; same anchor + same instant ⇒ identical derived
//! profile content (determinism pinned); the two involutions are named acts.

use portal_core::kernel::KernelTemporalProjection;
use portal_core::spanda;
use portal_core::spanda_anchor::{SpandaDirection, SpandaPhaseAnchor, SpandaTransportMode};

const RATE_HZ: f64 = 2.5; // inside the cited conserved-delta band
const STEP_MS: u64 = 400; // one epogdoon-step at 2.5 steps/sec

#[test]
fn flowing_readout_advances_one_step_per_beat() {
    let anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    assert_eq!(anchor.tick12_at(0), 0);
    // Sample mid-step to stay clear of the boundary at exact multiples.
    assert_eq!(anchor.tick12_at(STEP_MS / 2), 0);
    assert_eq!(anchor.tick12_at(STEP_MS + STEP_MS / 2), 1);
    assert_eq!(anchor.tick12_at(5 * STEP_MS + STEP_MS / 2), 5);
    // One full traversal (12 steps = 4.8 s at 2.5 Hz) wraps the readout.
    assert_eq!(anchor.tick12_at(12 * STEP_MS + STEP_MS / 2), 0);
    // The cycle index counts completed traversals.
    let (cycle, sub_tick) = anchor.projection_inputs(12 * STEP_MS + STEP_MS / 2);
    assert_eq!((cycle, sub_tick), (1, 0));
}

#[test]
fn held_anchor_reads_constant_at_any_instant() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.hold(3 * STEP_MS + STEP_MS / 2); // held mid-step at tick 3
    let held_tick = anchor.tick12_at(3 * STEP_MS + STEP_MS / 2);
    assert_eq!(held_tick, 3);
    for later in [1_000u64, 60_000, 3_600_000, 86_400_000] {
        assert_eq!(
            anchor.tick12_at(3 * STEP_MS + STEP_MS / 2 + later),
            held_tick
        );
    }
    assert_eq!(anchor.mode, SpandaTransportMode::Held);
}

#[test]
fn release_resumes_flow_from_the_held_phase() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.hold(3 * STEP_MS + STEP_MS / 2);
    anchor.release(100_000);
    assert_eq!(anchor.mode, SpandaTransportMode::Flowing);
    // Still tick 3 at the release instant; one beat later it advances to 4.
    assert_eq!(anchor.tick12_at(100_000), 3);
    assert_eq!(anchor.tick12_at(100_000 + STEP_MS), 4);
}

#[test]
fn same_anchor_same_instant_derives_identical_profile_content() {
    let anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    let now = 7 * STEP_MS + STEP_MS / 2;
    let a = KernelTemporalProjection::from_phase_anchor(&anchor, now, 5);
    let b = KernelTemporalProjection::from_phase_anchor(&anchor, now, 5);
    assert_eq!(
        serde_json::to_value(&a).unwrap(),
        serde_json::to_value(&b).unwrap(),
        "determinism: the projection is a pure derivation of (anchor, instant)"
    );
}

#[test]
fn generations_advance_while_held_with_identical_phase_content() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.hold(4 * STEP_MS + STEP_MS / 2);
    let g5 = KernelTemporalProjection::from_phase_anchor(&anchor, 10_000, 5);
    let g6 = KernelTemporalProjection::from_phase_anchor(&anchor, 11_000, 6);
    assert_eq!(g5.harmonic_profile.tick12, g6.harmonic_profile.tick12);
    assert_eq!(g5.harmonic_profile.degree720, g6.harmonic_profile.degree720);
    assert_ne!(
        g5.generation, g6.generation,
        "the portal's emission counter keeps counting"
    );
}

#[test]
fn walk_to_tick_lands_mid_step_and_parks_held() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.walk_to_tick(2 * STEP_MS, 9);
    assert_eq!(anchor.mode, SpandaTransportMode::Held);
    assert_eq!(anchor.tick12_at(2 * STEP_MS), 9);
    assert_eq!(
        anchor.tick12_at(2 * STEP_MS + 500_000),
        9,
        "walked phase holds"
    );
}

#[test]
fn step_moves_one_epogdoon_step_each_way() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.walk_to_tick(0, 5);
    anchor.step(0, false);
    assert_eq!(anchor.tick12_at(0), 6);
    anchor.step(0, true);
    assert_eq!(anchor.tick12_at(0), 5);
    // Backward across the Möbius seam: 0 steps back to 11.
    anchor.walk_to_tick(0, 0);
    anchor.step(0, true);
    assert_eq!(anchor.tick12_at(0), 11);
}

#[test]
fn the_two_involutions_are_named_and_distinct() {
    // Reflection: n → 11−n (traversal-reversal, SU(2) antipode).
    let mut a = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    a.walk_to_tick(0, 3);
    a.apply_reflection(0);
    assert_eq!(a.tick12_at(0), spanda::spanda_invert(3));
    assert_eq!(a.tick12_at(0), 8);
    // Half-turn: n → (n+6) mod 12 (antiphase pole-swap).
    let mut b = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    b.walk_to_tick(0, 3);
    b.apply_half_turn(0);
    assert_eq!(b.tick12_at(0), spanda::spanda_half_turn(3));
    assert_eq!(b.tick12_at(0), 9);
    // Composition closes the Klein four-group: reflection ∘ half-turn = 5−n.
    let mut c = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    c.walk_to_tick(0, 3);
    c.apply_half_turn(0);
    c.apply_reflection(0);
    assert_eq!(c.tick12_at(0), (5 + 12 - 3) % 12);
}

#[test]
fn reflected_flow_descends_the_ring() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.walk_to_tick(0, 6);
    anchor.release(0);
    anchor.set_direction(0, SpandaDirection::Reflected);
    assert_eq!(anchor.tick12_at(0), 6);
    assert_eq!(
        anchor.tick12_at(STEP_MS),
        5,
        "reflected traversal reads backwards"
    );
    assert_eq!(anchor.tick12_at(2 * STEP_MS), 4);
}

#[test]
fn anchor_never_extrapolates_into_its_own_past() {
    let anchor = SpandaPhaseAnchor::flowing(10_000, RATE_HZ);
    assert_eq!(anchor.phase_at(5_000), anchor.phase_at(10_000));
}

#[test]
fn cycle_index_saturates_at_zero_under_reflected_flow() {
    let mut anchor = SpandaPhaseAnchor::flowing(0, RATE_HZ);
    anchor.set_direction(0, SpandaDirection::Reflected);
    // Long reflected flow drives the unwrapped phase negative; the wire's
    // cycle count is a clock index and clamps at 0 (readout still valid).
    let (cycle, sub_tick) = anchor.projection_inputs(100 * STEP_MS);
    assert_eq!(cycle, 0);
    assert!(sub_tick < 12);
}
