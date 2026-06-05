use portal_core::{
    codon_rotation_from_lens_mode, codon_rotation_surface, kernel_tick_from_epogdoon,
    lens_mode_from_codon_rotation, ActivityStateEffect, EventPrivacyClass,
    KernelProfileObservationEvent, MPrimePerformanceEvent, MathemeHarmonicProfile,
    NaraActivityEvent, NaraActivityKind, PersonalIdentityProfile,
    PersonalResonanceObservationEvent, RelationDescriptor, RelationFamily,
};

const COMPLETE_NATAL: &str = include_str!("fixtures/kerykeion_natal_complete.json");
const IDENTITY_HASH: &str = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const NATAL_HANDLE: &str = "protected://nara/kairos/natal/fixture-2026-05-29";

#[test]
fn codon_rotation_lut_materializes_the_472_state_surface() {
    let surface = codon_rotation_surface();
    let dual_count = surface
        .iter()
        .filter(|cell| cell.codon_class == "dual")
        .count();
    let non_dual_count = surface.len() - dual_count;

    assert_eq!(surface.len(), 472);
    assert_eq!(dual_count, 24 * 8);
    assert_eq!(non_dual_count, 40 * 7);

    for lens in 0..12 {
        for mode in 0..7 {
            let projection = codon_rotation_from_lens_mode(lens, mode)
                .expect("all 84 lens-mode cells map into the surface");
            let reverse = lens_mode_from_codon_rotation(projection.codon_id, projection.rotation)
                .expect("surface cells reverse-map to a lens-mode anchor");
            assert_eq!((reverse.lens, reverse.mode), (lens, mode));
        }
    }
}

#[test]
fn codon_rotation_projection_is_canonical_kernel_lut_not_placeholder() {
    // 04.T4.1 audit: the forward/reverse proportional projection IS the canonical
    // materialized kernel LUT (M3'-SPEC §7), not a placeholder. Every emitted
    // projection must self-declare the materialized state and the 84<->472 provenance,
    // and its stored reverse anchor must agree with the forward (lens, mode) key.
    for lens in 0..12 {
        for mode in 0..7 {
            let projection = codon_rotation_from_lens_mode(lens, mode)
                .expect("all 84 lens-mode cells materialize a projection");
            assert_eq!(
                projection.dataset_lut_state, "materialized-kernel-lut",
                "lens {lens} mode {mode} must report the materialized kernel LUT, not a pending placeholder"
            );
            assert!(
                projection.provenance.contains("84") && projection.provenance.contains("472"),
                "projection provenance must name the 84<->472 surface LUT, got {:?}",
                projection.provenance
            );
            // Stored reverse anchor (computed at emit time) round-trips to the forward key.
            assert_eq!(
                (projection.reverse_lens, projection.reverse_mode),
                (lens, mode),
                "stored reverse anchor must equal the forward lens-mode key"
            );
            assert!(projection.surface_index < 472);
            assert!(projection.codon_id < 64);
            assert!(projection.rotation < projection.rotational_state_count);
        }
    }
}

#[test]
fn every_surface_cell_reverse_addresses_a_lens_mode() {
    // 04.T4.1 audit, reverse direction: extend round-trip coverage to ALL 472
    // (codon, rotation) surface cells (the forward test only touches 84 of them).
    // Every materialized cell must reverse-map into a valid lens-mode anchor, and
    // out-of-domain (codon, rotation) inputs must reject rather than alias.
    let surface = codon_rotation_surface();
    assert_eq!(surface.len(), 472);
    for cell in &surface {
        let anchor = lens_mode_from_codon_rotation(cell.codon_id, cell.rotation)
            .expect("every materialized surface cell reverse-maps to a lens-mode anchor");
        assert!(anchor.lens < 12, "reverse lens out of range for cell {}", cell.surface_index);
        assert!(anchor.mode < 7, "reverse mode out of range for cell {}", cell.surface_index);
        assert_eq!(
            cell.rotation_degrees,
            cell.rotation as u16 * 45,
            "rotation degrees must stay the canonical 45-degree octave step"
        );
    }
    // Domain guards: an over-range codon and an over-range rotation both reject.
    assert!(lens_mode_from_codon_rotation(64, 0).is_none());
    let last = surface.last().expect("non-empty surface");
    assert!(lens_mode_from_codon_rotation(last.codon_id, last.rotational_state_count).is_none());
}

#[test]
fn shared_m_prime_event_contracts_serialize_without_private_body_leakage() {
    let relation = RelationDescriptor::new(
        "rel-1",
        RelationFamily::B,
        "M1-1",
        "profile-1",
        7,
        "3/2 perfect-fifth aspiration",
        true,
    )
    .expect("valid relation descriptor");

    let performance = MPrimePerformanceEvent::new(
        "event-1",
        "session-1",
        118,
        "m1-prime",
        "M1-0",
        "M1-1",
        relation.clone(),
        10,
        5,
        [440.0; 8],
        [(1, 2); 4],
        [0.0; 12],
    )
    .expect("valid performance event");

    let activity = NaraActivityEvent::new(
        "activity-1",
        NaraActivityKind::Journal,
        "M4-4",
        "29-05-2026",
        "Idea/Empty/Present/29-05-2026/session/now.md",
        "session-1",
        EventPrivacyClass::ProtectedLocalBody,
        "identity-hash-only",
        "matheme-profile-118",
        "protected://journal/activity-1",
        ActivityStateEffect::EphemeralContextOnly,
    )
    .expect("valid activity event");

    let event_json = serde_json::to_value(performance).expect("performance serializes");
    let activity_json = serde_json::to_value(activity).expect("activity serializes");

    assert_eq!(event_json["relationDescriptor"]["relationFamily"], "B");
    assert_eq!(event_json["privacy"], "public-current-context");
    assert_eq!(activity_json["privacy"], "protected-local-body");
    assert_eq!(activity_json["stateEffect"]["kind"], "EphemeralContextOnly");
    assert!(activity_json.get("rawBody").is_none());
    assert_eq!(
        activity_json["rawBodyHandle"],
        "protected://journal/activity-1"
    );
}

#[test]
fn nara_activity_events_require_protected_privacy_for_raw_body_handles() {
    let err = NaraActivityEvent::new(
        "activity-privacy",
        NaraActivityKind::Oracle,
        "M4-4",
        "29-05-2026",
        "Idea/Empty/Present/29-05-2026/session/now.md",
        "session-1",
        EventPrivacyClass::PublicCurrentContext,
        "identity-hash-only",
        "matheme-profile-118",
        "protected://oracle/activity-1",
        ActivityStateEffect::EphemeralContextOnly,
    )
    .expect_err("raw-body-backed Nara activity must stay protected");

    assert!(err.contains("protected-local-body"), "{err}");
}

#[test]
fn kernel_profile_observation_events_derive_safe_profile_anchor_without_private_state() {
    let tick = kernel_tick_from_epogdoon(11, 7);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    let event = KernelProfileObservationEvent::from_profile(
        "profile-observation-1",
        "anima",
        "agent:main:main",
        "pratibimba-test",
        "29-05-2026",
        "Idea/Empty/Present/29-05-2026/20260529-120000-main/now.md",
        "M2",
        44,
        &profile,
    )
    .expect("safe public harmonic profile should yield an observation event");

    let event_json = serde_json::to_value(event).expect("event serializes");

    assert_eq!(event_json["tick12"], profile.tick12);
    assert_eq!(
        event_json["harmonicMedium"],
        "portal-core::MathemeHarmonicProfile"
    );
    assert_eq!(
        event_json["coordinateAnchor"]["coordinate_anchor"]["kernel"]["profile"],
        "portal-core::MathemeHarmonicProfile"
    );
    assert_eq!(
        event_json["coordinateAnchor"]["coordinate_anchor"]["harmonic_pointer"]["pointer_anchor"]
            ["lens_anchor"],
        profile.pointer_anchor.lens_anchor
    );
    assert_eq!(event_json["privacy"], "protected-local-derived");
    assert_eq!(event_json["profilePrivacyClass"], "public-current-context");
    assert!(event_json.get("qPersonal").is_none());
    assert!(event_json.get("identityHash").is_none());
    assert!(event_json.get("natalChartHandle").is_none());
    assert!(event_json.get("bioquaternion").is_none());
    assert!(event_json.get("q_b").is_none());
}

#[test]
fn personal_resonance_observation_events_only_expose_derived_score_and_identity_ref() {
    let identity =
        PersonalIdentityProfile::from_kerykeion_json(NATAL_HANDLE, IDENTITY_HASH, COMPLETE_NATAL)
            .expect("fixture should derive a protected identity profile");
    let profile = MathemeHarmonicProfile::from_tick_with_personal_identity(
        kernel_tick_from_epogdoon(11, 7),
        &identity,
    );

    let event = PersonalResonanceObservationEvent::from_profile(
        "resonance-observation-1",
        "agent:main:main",
        "M4-4",
        &identity.identity_hash,
        &profile,
    )
    .expect("derived resonance should produce a safe observation event");
    let event_json = serde_json::to_value(&event).expect("event serializes");

    assert!((0.0..=1.0).contains(&event.resonance_score));
    assert_eq!(event_json["identityRef"], identity.identity_hash);
    assert!(event_json.get("identityHash").is_none());
    assert!(event_json.get("qPersonal").is_none());
    assert!(event_json.get("natalChartHandle").is_none());
    assert!(event_json.get("qCosmic").is_none());
    assert!(event_json.get("signedDot").is_none());

    let err = PersonalResonanceObservationEvent::new(
        "resonance-observation-2",
        "agent:main:main",
        "M4-4",
        &identity.identity_hash,
        1.5,
        profile.conjugate_form_character,
        profile.tick,
        profile.tick12,
        profile.degree720,
        profile.resonance72.lens_anchor_index as u8,
    )
    .expect_err("resonance observations must enforce normalized scores");
    assert!(err.contains("[0, 1]"), "{err}");
}
