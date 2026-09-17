// Coordinate: M1'/M2'/M3' :: modal-resonator-bell-kernel (S0' chime frame)
// Bell-kernel spec §5 acceptance: the chime frame is built from a REAL
// generated profile, its liveOctet survives JSON round-trip byte-compatible
// with the source bus, world-clock mismatches make it incoherent, and no
// private payload key crosses the public-current boundary.

use epi_logos::gate::kernel_bridge_runtime::{
    m123_chime_frame_from_profile, M123ChimeFrameJsonShape, M123WorldClockReading,
    M123_CHIME_EVENT_TYPE, M123_CHIME_FRAME_CONTRACT,
};
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

fn profile() -> MathemeHarmonicProfile {
    MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(7, 9))
}

fn matching_clock(profile: &MathemeHarmonicProfile) -> M123WorldClockReading {
    M123WorldClockReading {
        world_clock_handle: "s3-world-clock-42".to_owned(),
        generation: 42,
        subscription_mode: "gateway-heartbeat".to_owned(),
        tick: profile.tick,
        degree720: profile.degree720,
    }
}

#[test]
fn chime_frame_builds_from_a_real_generated_profile() {
    let profile = profile();
    let frame = m123_chime_frame_from_profile(42, &profile, Some(&matching_clock(&profile)))
        .expect("chime frame builds");

    assert_eq!(frame.event_type, M123_CHIME_EVENT_TYPE);
    assert_eq!(frame.contract, M123_CHIME_FRAME_CONTRACT);
    assert_eq!(frame.source_profile_generation, 42);
    assert_eq!(frame.tick, profile.tick);
    assert_eq!(frame.tick12, profile.tick12);
    assert_eq!(frame.degree720, profile.degree720);
    assert_eq!(frame.m2_address72, profile.resonance72.lens_anchor_index);
    assert_eq!(frame.m1.surface, "K2");
    assert_eq!(frame.m1.strike_route, "profile-bus");
    assert!(frame.m2.exact_profile_bus);
    assert!(frame.m3.codon_rotation_projection.is_some());
    assert_eq!(frame.privacy_class, "public-current-context");
    assert!(frame.is_coherent());
}

#[test]
fn live_octet_stays_byte_compatible_after_json_round_trip() {
    let profile = profile();
    let frame = m123_chime_frame_from_profile(1, &profile, Some(&matching_clock(&profile)))
        .expect("chime frame builds");

    let json = serde_json::to_string(&frame).expect("frame serializes");
    let round: M123ChimeFrameJsonShape = serde_json::from_str(&json).expect("round-trips");
    for (i, carrier) in round.m2.modal_resonator.live_octet.iter().enumerate() {
        assert_eq!(
            carrier.hz, profile.audio_octet[i],
            "liveOctet[{i}] must survive JSON numeric round-trip byte-compatible with the bus"
        );
    }
}

#[test]
fn world_clock_mismatch_makes_the_chime_incoherent() {
    let profile = profile();

    let mut skewed_tick = matching_clock(&profile);
    skewed_tick.tick += 1;
    let frame = m123_chime_frame_from_profile(1, &profile, Some(&skewed_tick)).unwrap();
    assert_eq!(frame.m3.world_clock_binding.state, "stale");
    assert!(!frame.m3.world_clock_binding.tick_matches_profile);
    assert!(frame.m3.world_clock_binding.degree720_matches_profile);
    assert!(
        !frame.is_coherent(),
        "tick mismatch must block integrated readiness"
    );

    let mut skewed_degree = matching_clock(&profile);
    skewed_degree.degree720 = (skewed_degree.degree720 + 60) % 720;
    let frame = m123_chime_frame_from_profile(1, &profile, Some(&skewed_degree)).unwrap();
    assert!(!frame.m3.world_clock_binding.degree720_matches_profile);
    assert!(!frame.is_coherent(), "degree mismatch must block readiness");
}

#[test]
fn absent_world_clock_is_pending_not_fabricated() {
    let profile = profile();
    let frame = m123_chime_frame_from_profile(1, &profile, None).unwrap();
    let binding = &frame.m3.world_clock_binding;
    assert_eq!(binding.state, "pending");
    assert_eq!(binding.tick, None);
    assert_eq!(binding.source, None);
    assert!(!binding.tick_matches_profile);
    assert!(
        frame.is_coherent(),
        "pending carries no mismatch evidence — it is not itself incoherence"
    );
}

#[test]
fn chime_requires_the_modal_resonator() {
    let mut profile = profile();
    profile.modal_resonator = None;
    let err =
        m123_chime_frame_from_profile(1, &profile, None).expect_err("no resonant body, no chime");
    assert!(err.contains("modalResonator"));
}

#[test]
fn cymatic_frame_handle_is_a_deterministic_digest_of_the_bus() {
    let profile = profile();
    let a = m123_chime_frame_from_profile(1, &profile, None).unwrap();
    let b = m123_chime_frame_from_profile(1, &profile, None).unwrap();
    assert_eq!(
        a.m2.cymatic_frame_handle, b.m2.cymatic_frame_handle,
        "same bus + generation must produce the same handle"
    );

    let other_generation = m123_chime_frame_from_profile(2, &profile, None).unwrap();
    assert_ne!(
        a.m2.cymatic_frame_handle,
        other_generation.m2.cymatic_frame_handle
    );

    let other_tick = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(7, 10));
    let other = m123_chime_frame_from_profile(1, &other_tick, None).unwrap();
    assert_ne!(a.m2.cymatic_frame_handle, other.m2.cymatic_frame_handle);
}

#[test]
fn serialized_chime_never_carries_raw_protected_field_bodies() {
    let profile = profile();
    let frame = m123_chime_frame_from_profile(1, &profile, Some(&matching_clock(&profile)))
        .expect("privacy guard admits the public-current frame");
    let s = serde_json::to_string(&frame).unwrap();
    for forbidden in [
        "fieldBody",
        "rawField",
        "rawPersonalCymaticPayload",
        "personalCymaticField",
        "protectedM4Body",
        "journalBody",
        "natalChartHandle",
        "qPersonal",
        "qIdentity",
        "identityHash",
        "elementalBalance",
        "naraBody",
        "journalBody",
        "rawNaraBody",
        "bioquaternion",
        "privateIdentityData",
    ] {
        assert!(
            !s.contains(forbidden),
            "public-current chime frame must not carry {forbidden}"
        );
    }
    // camelCase envelope keys per the serialization law.
    for key in [
        "\"eventType\"",
        "\"sourceProfileGeneration\"",
        "\"m2Address72\"",
        "\"modalResonator\"",
        "\"cymaticFrameHandle\"",
        "\"worldClockBinding\"",
        "\"tickMatchesProfile\"",
        "\"degree720MatchesProfile\"",
    ] {
        assert!(s.contains(key), "serialized frame must carry {key}");
    }
}
