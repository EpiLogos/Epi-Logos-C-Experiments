use portal_core::{
    codon_charge_quaternion, kernel_tick_from_epogdoon, ConjugateFormCharacter,
    KerykeionNatalChart, MathemeHarmonicProfile, PersonalIdentityProfile, PersonalResonance,
    ProfilePrivacyClass,
};

const COMPLETE_NATAL: &str = include_str!("fixtures/kerykeion_natal_complete.json");
const MISSING_PLANET_NATAL: &str = include_str!("fixtures/kerykeion_natal_missing_planet.json");
const IDENTITY_HASH: &str = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const NATAL_HANDLE: &str = "protected://nara/kairos/natal/fixture-2026-05-29";

#[test]
fn identity_profile_is_deterministic_and_normalized_from_kerykeion_fixture() {
    let first =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("complete Kerykeion fixture derives a protected identity profile");
    let second =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("same natal fixture derives the same profile");

    assert_eq!(first, second);
    assert_eq!(
        first.privacy_class,
        ProfilePrivacyClass::ProtectedLocalDerived
    );
    assert_eq!(first.natal_chart_handle, NATAL_HANDLE);
    assert_eq!(first.identity_hash, IDENTITY_HASH);
    assert_unit(first.q_personal);

    let elemental_sum = first.elemental_balance.earth
        + first.elemental_balance.fire
        + first.elemental_balance.water
        + first.elemental_balance.air;
    assert!((elemental_sum - 1.0).abs() < 1e-5);
    assert!(first
        .q_personal
        .iter()
        .all(|component| component.is_finite()));
}

#[test]
fn malformed_or_incomplete_natal_sources_return_honest_errors() {
    let malformed = KerykeionNatalChart::from_json("{not-json")
        .expect_err("malformed natal JSON must not produce fallback identity data");
    assert!(
        malformed
            .to_string()
            .contains("invalid kerykeion natal JSON"),
        "{malformed}"
    );

    let incomplete = PersonalIdentityProfile::from_kerykeion_json(
        NATAL_HANDLE,
        IDENTITY_HASH,
        MISSING_PLANET_NATAL,
    )
    .expect_err("missing natal planets must fail instead of inventing values");
    assert!(
        incomplete.to_string().contains("missing natal planet"),
        "{incomplete}"
    );

    let invalid_hash =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, "not-a-hash", COMPLETE_NATAL)
            .expect_err("identity profile must require a real BLAKE3-style identity hash");
    assert!(
        invalid_hash.to_string().contains("identity_hash must be"),
        "{invalid_hash}"
    );
}

#[test]
fn composed_personal_quaternion_is_unit_and_does_not_mutate_identity() {
    let identity =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("complete Kerykeion fixture derives a protected identity profile");
    let original = identity.q_personal;
    let composed = identity.composed_quaternion([0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0]);

    assert_unit(composed);
    assert_eq!(identity.q_personal, original);
    assert_ne!(composed, original);
}

#[test]
fn resonance_uses_codon_charge_quaternion_and_public_profile_does_not_leak_identity() {
    let identity =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("complete Kerykeion fixture derives a protected identity profile");
    let tick = kernel_tick_from_epogdoon(11, 7);

    let public_profile = MathemeHarmonicProfile::from_tick(tick);
    assert_eq!(public_profile.resonance, None);

    let personal_profile =
        MathemeHarmonicProfile::from_tick_with_personal_identity(tick, &identity);
    let q_cosmic = codon_charge_quaternion(personal_profile.codon_rotation_projection.codon_id);
    assert_approx_quat(personal_profile.q_cosmic, q_cosmic);

    let resonance = personal_profile
        .resonance
        .expect("personal profile carries derived resonance");
    assert!((0.0..=1.0).contains(&resonance));

    let expected = PersonalResonance::from_quaternions(identity.q_personal, q_cosmic);
    assert!((resonance - expected.score).abs() < 1e-6);
    assert_eq!(
        personal_profile.conjugate_form_character,
        expected.conjugate_form_character
    );

    let public_json = serde_json::to_string(&personal_profile).expect("profile serializes");
    assert!(public_json.contains("qCosmic"));
    assert!(public_json.contains("resonance"));
    assert!(!public_json.contains("qPersonal"));
    assert!(!public_json.contains("q_personal"));
    assert!(!public_json.contains("natalChartHandle"));
    assert!(!public_json.contains("identityHash"));
    assert!(!public_json.contains("birth"));
    assert!(!public_json.contains("journal"));
}

#[test]
fn conjugate_form_character_uses_signed_dot_and_major_threshold() {
    let major = PersonalResonance::from_quaternions([1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]);
    assert_eq!(major.score, 1.0);
    assert_eq!(major.signed_dot, 1.0);
    assert_eq!(
        major.conjugate_form_character,
        ConjugateFormCharacter::Major
    );

    let minor =
        PersonalResonance::from_quaternions([0.5, 0.866_025_4, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]);
    assert!((minor.score - 0.5).abs() < 1e-6);
    assert_eq!(
        minor.conjugate_form_character,
        ConjugateFormCharacter::Minor
    );

    let shadow = PersonalResonance::from_quaternions([-1.0, 0.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]);
    assert_eq!(shadow.score, 1.0);
    assert_eq!(shadow.signed_dot, -1.0);
    assert_eq!(
        shadow.conjugate_form_character,
        ConjugateFormCharacter::ShadowInversion
    );
}

fn assert_unit(q: [f32; 4]) {
    let norm = q
        .iter()
        .map(|component| component * component)
        .sum::<f32>()
        .sqrt();
    assert!((norm - 1.0).abs() < 1e-5, "quaternion norm was {norm}");
}

fn assert_approx_quat(left: [f32; 4], right: [f32; 4]) {
    for i in 0..4 {
        assert!(
            (left[i] - right[i]).abs() < 1e-6,
            "component {i}: {} != {}",
            left[i],
            right[i]
        );
    }
}
