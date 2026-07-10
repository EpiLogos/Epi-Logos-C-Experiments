//! Coordinate: S0/#5 (CCT-1 — synchronised Klein-flip propagation, Track 16.T16.1)
//! Actualises: the cross-cutting acceptance — when the Klein flip fires at
//! the tick 5→6 boundary, the three downstream personal-scale surfaces
//! retune within ONE generation (no surface lags), and a single profile-tick
//! replay is deterministic at all three:
//!   (a) the M3 codon-rotation axis state (DR-IG-3 choreography),
//!   (b) the M4 personal-pole q_composed re-read through the Vāma classifier,
//!   (c) the integrated 4-5-0 lemniscate sweep anchor (phase-space address).
//! The architecture makes same-frame atomicity structural: all three derive
//! from the ONE `from_tick` profile — this test pins that it stays true.
//! Does NOT own: the flip law (flip_events.rs), the Vāma classifier, the
//! phase-space law.

use portal_core::{
    compose_personal_quaternion, kernel_tick_from_epogdoon, perturb_q_activity, CpfState,
    CsDirection, CsField, MathemeHarmonicProfile, VakAddress, VamaShaktiClass,
};

fn vak(label: &str) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: label.to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "cct1.flip.test".to_owned(),
        cs: CsField {
            code: format!("cct1:{label}"),
            direction: CsDirection::Day,
            recognized: false,
        },
    }
}

/// The M4 q_composed re-read at one generation: compose the personal
/// quaternion with the generation's cosmic quaternion standing in the
/// activity slot (the personal identity/transit poles are session-held and
/// constant across one flip — the cosmic re-read is what the fold moves).
fn q_composed_read(profile: &MathemeHarmonicProfile) -> [f32; 4] {
    compose_personal_quaternion([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], profile.q_cosmic)
}

fn profile_at(tick12: u8) -> MathemeHarmonicProfile {
    MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, tick12))
}

#[test]
fn klein_flip_fires_at_the_5_to_6_boundary_and_clears_after() {
    assert!(
        profile_at(5).ananda_vortex.klein_flip_at_this_tick,
        "the flip flag latches AT tick12 == 5 (the fold)"
    );
    assert!(
        !profile_at(6).ananda_vortex.klein_flip_at_this_tick,
        "the flag clears once the fold completes"
    );
    assert_eq!(profile_at(5).helix, "bimba");
    assert_eq!(profile_at(6).helix, "pratibimba", "the helix crosses WITH the flip");
}

/// (a)+(b)+(c) retune within ONE generation — the post-flip profile carries
/// the post-flip state at all three faces simultaneously; no face lags.
#[test]
fn all_three_personal_scale_faces_retune_in_the_same_generation() {
    let before = profile_at(5);
    let after = profile_at(6);

    // (a) M3 codon-rotation axis: the 472-surface state moves with the fold
    assert_ne!(
        before.codon_rotation_projection.surface_index,
        after.codon_rotation_projection.surface_index,
        "M3 codon axis must flip in the same generation"
    );

    // (b) M4 personal pole: the Vāma-classified q_composed re-read differs
    // across the fold and is derived from the SAME generation's quaternion
    let q_before = q_composed_read(&before);
    let q_after = q_composed_read(&after);
    assert_ne!(q_before, q_after, "q_composed re-reads across the fold");
    let vama_after = perturb_q_activity(
        q_after,
        &vak("after"),
        f32::from(after.tick12),
        &[],
        VamaShaktiClass::Daemon,
    );
    let vama_lagged = perturb_q_activity(
        q_before,
        &vak("after"),
        f32::from(after.tick12),
        &[],
        VamaShaktiClass::Daemon,
    );
    assert_ne!(
        vama_after, vama_lagged,
        "a lagging Vāma read (pre-flip quaternion at the post-flip tick) is distinguishable — no surface may lag"
    );

    // (c) the 4-5-0 lemniscate sweep re-anchors: the phase-space address
    // moves and both faces agree on the SAME degree720 (one clock, one frame)
    let ps_before = before.phase_space.as_ref().expect("phase space rides the profile");
    let ps_after = after.phase_space.as_ref().expect("phase space rides the profile");
    assert_ne!(ps_before.degree720, ps_after.degree720, "lemniscate anchor re-anchors");
    assert_eq!(
        ps_after.degree720, after.degree720,
        "the lemniscate anchor and the profile clock are the same frame"
    );
}

/// A single profile-tick REPLAY is deterministic at all three faces — the
/// acceptance's replay clause: same tick in, byte-identical faces out.
#[test]
fn single_profile_tick_replay_is_deterministic_at_all_three_faces() {
    for tick12 in [5u8, 6] {
        let one = profile_at(tick12);
        let two = profile_at(tick12);
        assert_eq!(
            serde_json::to_string(&one.codon_rotation_projection).unwrap(),
            serde_json::to_string(&two.codon_rotation_projection).unwrap(),
            "M3 face replay-deterministic at tick {tick12}"
        );
        let q1 = q_composed_read(&one);
        let q2 = q_composed_read(&two);
        assert_eq!(q1, q2, "M4 face replay-deterministic at tick {tick12}");
        assert_eq!(
            perturb_q_activity(q1, &vak("replay"), f32::from(tick12), &[], VamaShaktiClass::Daemon),
            perturb_q_activity(q2, &vak("replay"), f32::from(tick12), &[], VamaShaktiClass::Daemon),
            "Vāma re-read replay-deterministic at tick {tick12}"
        );
        assert_eq!(
            serde_json::to_string(&one.phase_space).unwrap(),
            serde_json::to_string(&two.phase_space).unwrap(),
            "lemniscate face replay-deterministic at tick {tick12}"
        );
    }
}
