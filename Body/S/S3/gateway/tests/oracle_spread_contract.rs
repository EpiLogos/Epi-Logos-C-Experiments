//! 05.T5.17: OracleSpreadPosition per-position aliveness contract.
//!
//! Covers the live-vs-mute state machine (generating → muting → mute, plus
//! reopen on target-aspect proximity) and JSON round-trip of a synthetic spread
//! carrying two target aspects. These are the host-side guarantees Janus's
//! live-spread tracking (Track 12.18) and the briefing live-spreads section
//! (Track 05.18) build on.

use epi_s3_gateway::spacetime::{
    CardKind, KleinFace, LiveState, OracleSpreadPosition, TargetAspect,
};

fn aspect(exact_at: u64) -> TargetAspect {
    // Sun–Saturn square exact at `exact_at` (planet indices per M4 mod-10 model).
    TargetAspect {
        planet_a: 0,
        aspect_kind: 4,
        planet_b_or_natal: 6,
        exact_at,
    }
}

#[test]
fn oracle_spread_state_transitions() {
    // A freshly drawn position is generating, prospective, unrecognized.
    let mut position = OracleSpreadPosition::new(
        "spread-aurora",
        0,
        17,
        CardKind::TarotMajor,
        1_000,
        "agent:nara:main",
        Some(aspect(10_000)),
    );
    assert_eq!(position.live_state, LiveState::Generating);
    assert_eq!(position.klein_face, KleinFace::Prospective);
    assert_eq!(position.recognition_count, 0);
    assert_eq!(position.last_recognition_at, 0);

    // generating → muting → mute. Muting leaves the prospective face; only the
    // completed mute flips to retrospective.
    position.begin_mute().expect("generating → muting");
    assert_eq!(position.live_state, LiveState::Muting);
    assert_eq!(position.klein_face, KleinFace::Prospective);

    position.complete_mute().expect("muting → mute");
    assert_eq!(position.live_state, LiveState::Mute);
    assert_eq!(position.klein_face, KleinFace::Retrospective);

    // Illegal transitions are refused, not silently applied.
    assert!(
        position.begin_mute().is_err(),
        "begin_mute from mute must error"
    );
    assert!(
        position.complete_mute().is_err(),
        "complete_mute from mute must error"
    );
    assert_eq!(position.live_state, LiveState::Mute);

    // Far from the aspect's exact time → no reopen.
    let reopened = position.reopen_if_aspect_proximate(1_000_000, 500);
    assert!(!reopened, "distant aspect must not reopen");
    assert_eq!(position.live_state, LiveState::Mute);
    assert_eq!(position.recognition_count, 0);

    // Within proximity of exact_at (10_000) → reopen to generating/prospective
    // and record a recognition stamped at the proximate moment.
    let reopened = position.reopen_if_aspect_proximate(10_300, 500);
    assert!(reopened, "proximate aspect must reopen the position");
    assert_eq!(position.live_state, LiveState::Generating);
    assert_eq!(position.klein_face, KleinFace::Prospective);
    assert_eq!(position.recognition_count, 1);
    assert_eq!(position.last_recognition_at, 10_300);

    // An already-generating position is a no-op for reopen (no double-count).
    let reopened = position.reopen_if_aspect_proximate(10_300, 500);
    assert!(!reopened, "generating position must not reopen again");
    assert_eq!(position.recognition_count, 1);

    // A position with no target aspect never reopens, even once muted.
    let mut aspectless = OracleSpreadPosition::new(
        "spread-aurora",
        1,
        42,
        CardKind::Hexagram,
        1_000,
        "agent:nara:main",
        None,
    );
    aspectless.begin_mute().unwrap();
    aspectless.complete_mute().unwrap();
    assert!(
        !aspectless.reopen_if_aspect_proximate(1_000, 1_000_000),
        "aspectless position must never reopen"
    );
    assert_eq!(aspectless.live_state, LiveState::Mute);
}

#[test]
fn oracle_spread_round_trips_through_json_with_two_target_aspects() {
    // Synthetic two-position spread: one tarot court card and one hexagram,
    // each carrying a distinct target aspect, in different aliveness states.
    let mut court = OracleSpreadPosition::new(
        "spread-twin-aspects",
        0,
        77,
        CardKind::TarotCourt,
        2_000,
        "agent:nara:weave",
        Some(aspect(50_000)),
    );
    court.record_recognition(2_500);

    let mut hexagram = OracleSpreadPosition::new(
        "spread-twin-aspects",
        1,
        63,
        CardKind::Hexagram,
        2_100,
        "agent:nara:weave",
        Some(TargetAspect {
            planet_a: 1,
            aspect_kind: 0,
            planet_b_or_natal: 9,
            exact_at: 90_000,
        }),
    );
    hexagram.begin_mute().unwrap();
    hexagram.complete_mute().unwrap();

    let spread = vec![court, hexagram];

    // Round-trip the whole spread through JSON and assert structural equality.
    let encoded = serde_json::to_string(&spread).expect("serialize spread");
    let decoded: Vec<OracleSpreadPosition> =
        serde_json::from_str(&encoded).expect("deserialize spread");
    assert_eq!(decoded, spread);

    // Both target aspects survive the round-trip intact.
    assert_eq!(decoded[0].target_aspect.unwrap().exact_at, 50_000);
    assert_eq!(decoded[1].target_aspect.unwrap().exact_at, 90_000);
    assert_eq!(decoded[0].card_kind, CardKind::TarotCourt);
    assert_eq!(decoded[1].card_kind, CardKind::Hexagram);
    assert_eq!(decoded[0].live_state, LiveState::Generating);
    assert_eq!(decoded[1].live_state, LiveState::Mute);
    assert_eq!(decoded[1].klein_face, KleinFace::Retrospective);
}

#[test]
fn oracle_spread_enum_numeric_reprs_are_stable() {
    // The numeric reprs are the on-wire contract carried to the reducer payload
    // (live_state in update_position_state) and must round-trip.
    for (kind, n) in [
        (CardKind::TarotMajor, 0u8),
        (CardKind::TarotPip, 1),
        (CardKind::TarotCourt, 2),
        (CardKind::Hexagram, 3),
    ] {
        assert_eq!(kind.as_u8(), n);
        assert_eq!(CardKind::from_u8(n).unwrap(), kind);
    }
    assert!(CardKind::from_u8(4).is_err());

    for (state, n) in [
        (LiveState::Generating, 0u8),
        (LiveState::Muting, 1),
        (LiveState::Mute, 2),
    ] {
        assert_eq!(state.as_u8(), n);
        assert_eq!(LiveState::from_u8(n).unwrap(), state);
    }
    assert!(LiveState::from_u8(3).is_err());

    for (face, n) in [(KleinFace::Prospective, 0u8), (KleinFace::Retrospective, 1)] {
        assert_eq!(face.as_u8(), n);
        assert_eq!(KleinFace::from_u8(n).unwrap(), face);
    }
    assert!(KleinFace::from_u8(2).is_err());
}
