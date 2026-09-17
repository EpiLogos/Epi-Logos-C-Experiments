//! Coordinate: S0/#4/#5 (stratum-6 integration — the entity-computation path)
//! Actualises: the system's core claim — "any entity, identity, or user can
//! be computed through and in relation to the archetypal realities" — as ONE
//! test: a fixture identity computed end-to-end to its archetypal reading.
//! Chain ([[alpha_quaternionic_integration_across_M_stack]] §6 + [[M4-ARCHITECTURE]]):
//!   natal chart → elemental_weights_from_chart → Q_identity/q_personal
//!   → Q_composed = (Q_id · Q_transit) · Q_activity ∈ S³
//!   → bioquaternion decomposition (q_b, q_p)
//!   → Hopf projection (visible identity-form)
//!   → resonance |q_personal · q_cosmic| against the codon/hexagram archetypes
//!   → Bimba-map coordinate addresses (64-address, 472-surface, 72-address).
//! Privacy: DR-M4-3 — the public-current profile NEVER carries the identity.
//! Does NOT own: Q_activity accumulation policy (q_activity_accumulator.rs)
//! or the natal parser law (personal_identity_resonance.rs).

use portal_core::personal_identity::{PersonalIdentityProfile, PersonalResonance};
use portal_core::{
    compose_personal_quaternion, decompose_bioquaternion, kernel_tick_from_epogdoon,
    ConjugateFormCharacter, MathemeHarmonicProfile,
};

const COMPLETE_NATAL: &str = include_str!("fixtures/kerykeion_natal_complete.json");
const NATAL_HANDLE: &str = "protected://nara/kairos/natal/fixture-2026-05-29";
const IDENTITY_HASH: &str = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

fn norm4(q: [f32; 4]) -> f32 {
    q.iter().map(|c| c * c).sum::<f32>().sqrt()
}

#[test]
fn a_fixture_identity_computes_end_to_end_to_its_archetypal_reading() {
    // 1. Natal chart → identity quaternions + elemental weights.
    let identity =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("complete natal fixture derives an identity profile");
    assert!(
        (norm4(identity.q_identity) - 1.0).abs() < 1e-4,
        "Q_identity must live on S³"
    );
    assert!(
        (norm4(identity.q_personal) - 1.0).abs() < 1e-4,
        "q_personal must live on S³"
    );
    let balance = &identity.elemental_balance;
    let balance_sum = balance.earth + balance.fire + balance.water + balance.air;
    assert!(
        (balance_sum - 1.0).abs() < 1e-4,
        "elemental weights must normalise to 100%"
    );
    for (name, weight) in [
        ("earth", balance.earth),
        ("fire", balance.fire),
        ("water", balance.water),
        ("air", balance.air),
    ] {
        assert!(
            (0.0..=1.0).contains(&weight),
            "{name} weight {weight} escapes [0,1]"
        );
    }

    // 2. The cosmic side at a real tick: the archetypal state the entity is
    //    read against (Q_transit = q_cosmic(t) per alpha §5).
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(21, 8));
    let q_cosmic = profile.q_cosmic;
    assert!(
        (norm4(q_cosmic) - 1.0).abs() < 1e-4,
        "q_cosmic must live on S³"
    );

    // 3. Q_composed = (Q_identity · Q_transit) · Q_activity ∈ S³ — identity
    //    the stable left operand; a live activity perturbation on the right.
    let q_activity = [0.9848f32, 0.0, 0.1736, 0.0]; // ~20° rotation about j
    let q_composed = compose_personal_quaternion(identity.q_personal, q_cosmic, q_activity);
    assert!(
        (norm4(q_composed) - 1.0).abs() < 1e-4,
        "Q_composed must live on S³"
    );

    // 4. Bioquaternion decomposition: q_b the composed state, q_p its
    //    conjugate reading (slash-flip law: scalar preserved, vector negated).
    let (q_b, q_p) = decompose_bioquaternion(q_composed);
    assert_eq!(
        q_p[0], q_b[0],
        "conjugation preserves the scalar (the 0/1 slash)"
    );
    for axis in 1..4 {
        assert_eq!(
            q_p[axis], -q_b[axis],
            "conjugation flips vector axis {axis}"
        );
    }

    // 5. Hopf projection — the visible identity-form: base degree from the
    //    scalar (2·acos(w), spec arithmetic), fiber from the sign structure.
    let w = f64::from(q_b[0].clamp(-1.0, 1.0));
    let base_degree = (2.0 * w.acos()).to_degrees();
    assert!(
        (0.0..=360.0).contains(&base_degree),
        "Hopf base degree {base_degree} escapes the wheel"
    );

    // 6. Resonance against the archetypal state — the personal-α. Expected
    //    value derived independently from the two quaternions.
    let resonance = PersonalResonance::from_quaternions(identity.q_personal, q_cosmic);
    let expected_dot: f32 = identity
        .q_personal
        .iter()
        .zip(q_cosmic.iter())
        .map(|(a, b)| a * b)
        .sum::<f32>()
        .clamp(-1.0, 1.0);
    assert!((resonance.signed_dot - expected_dot).abs() < 1e-5);
    assert!((resonance.score - expected_dot.abs()).abs() < 1e-5);
    let expected_character = if expected_dot < -f32::EPSILON {
        ConjugateFormCharacter::ShadowInversion
    } else if expected_dot.abs() >= 2.0 / 3.0 {
        ConjugateFormCharacter::Major
    } else {
        ConjugateFormCharacter::Minor
    };
    assert_eq!(resonance.conjugate_form_character, expected_character);

    // 7. The archetypal reading's addresses — the Bimba-map coordinates the
    //    entity is computed in relation to, each held to its own law.
    let expected_addr64 = ((u32::from(profile.degree360 % 360) * 64) / 360) as u8;
    assert_eq!(
        profile.mahamaya.mahamaya_address64,
        Some(expected_addr64),
        "64-address (codon/hexagram cell) must follow floor(deg·64/360)"
    );
    assert_eq!(
        profile.mahamaya.hexagram_id, expected_addr64,
        "hexagram = the 64-address"
    );
    assert!(
        profile.codon_rotation_projection.surface_index < 472,
        "codon-rotation address escapes the 472-state surface"
    );
    let expected_addr72 = usize::from(profile.tick12) * 6 + usize::from(profile.position6);
    assert_eq!(
        profile.resonance72.lens_anchor_index, expected_addr72,
        "72-address must follow tick12·6+position"
    );

    // 8. Privacy (DR-M4-3): the public-current profile computed WITHOUT the
    //    identity never carries a resonance — bodies and identity metrics
    //    only exist where the identity was supplied.
    assert!(
        profile.resonance.is_none(),
        "a from_tick (public-current) profile must not fabricate personal resonance"
    );
    let serialized = serde_json::to_string(&profile).expect("profile serializes");
    assert!(
        !serialized.contains(&format!("{:.4}", identity.q_personal[0])),
        "no personal quaternion component may appear on the public profile wire"
    );
}
