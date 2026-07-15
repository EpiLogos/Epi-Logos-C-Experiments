//! Coordinate: S0/M2' :: modal-resonator privacy guard (49.T49.7)
//! Residency: Body/S/S0/portal-core/tests
//! Actualises: public-current modal bus visibility and handle-only protected
//!   personal cymatic serialization at the real Rust JSON boundary.
//! Public surface: none (integration tests only).
//! Does NOT own: modal derivation, personal field bodies, or bridge policy.

use portal_core::{
    build_psychoid_cymatic_renderer_handle, kernel_tick_from_epogdoon, MathemeHarmonicProfile,
    PsychoidCymaticSolverStrategy,
};

const FORBIDDEN_BODY_KEYS: &[&str] = &[
    "fieldBody",
    "rawField",
    "rawPersonalCymaticPayload",
    "personalCymaticField",
    "protectedM4Body",
    "journalBody",
    "rawNaraBody",
    "privateIdentityData",
];

#[test]
fn public_modal_profile_serializes_the_exposed_bus_without_private_bodies() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(7, 9));
    let modal = profile
        .modal_resonator
        .as_ref()
        .expect("real profile carries modal resonator");
    let json = serde_json::to_value(modal).expect("modal profile serializes");
    let encoded = serde_json::to_string(&json).expect("modal JSON encodes");

    assert_eq!(json["privacyClass"], "public-current-context");
    assert_eq!(json["liveOctet"].as_array().unwrap().len(), 8);
    assert_eq!(json["nodalQuartet"].as_array().unwrap().len(), 4);
    for (index, carrier) in json["liveOctet"].as_array().unwrap().iter().enumerate() {
        assert_eq!(
            carrier["hz"].as_f64().unwrap() as f32,
            profile.audio_octet[index],
            "public-current bus value {index} remains available"
        );
    }
    for key in FORBIDDEN_BODY_KEYS {
        assert!(
            !encoded.contains(key),
            "modal public-current JSON must not carry {key}"
        );
    }
}

#[test]
fn protected_personal_cymatic_projection_stays_handle_and_digest_only() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 8));
    let handle =
        build_psychoid_cymatic_renderer_handle(&profile, PsychoidCymaticSolverStrategy::OptionF);
    let json = serde_json::to_value(&handle).expect("personal renderer handle serializes");
    let encoded = serde_json::to_string(&json).expect("handle JSON encodes");

    assert_eq!(json["privacyClass"], "protected-local-handle-only");
    assert!(json["rendererHandle"]
        .as_str()
        .unwrap()
        .starts_with("psychoid-cymatic://"));
    assert_eq!(json["audioBusDigest"].as_str().unwrap().len(), 64);
    assert_eq!(json["nodalDigest"].as_str().unwrap().len(), 64);
    assert!(!encoded.contains("audioOctet"));
    assert!(!encoded.contains("nodalQuartet"));
    for key in FORBIDDEN_BODY_KEYS {
        assert!(
            !encoded.contains(key),
            "protected personal handle JSON must not carry {key}"
        );
    }
}
