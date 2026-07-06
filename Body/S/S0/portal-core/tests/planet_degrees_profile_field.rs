// Coordinate: M' / S0 profile bus — live-kairos planet degrees (Phase 1 wiring)
// The shared profile carries the Kerykeion sky ONLY when the gateway attaches
// it (cosmic-clock §5.3 kairos_valid law). The kernel constructor never
// fabricates the field; absence is the renderers' honest "kairos pending".

use portal_core::{
    kernel_tick_from_epogdoon, live_planets_from_sky, KernelTick, LivePlanetProjection,
    MathemeHarmonicProfile,
};

fn tick() -> KernelTick {
    kernel_tick_from_epogdoon(3, 4)
}

#[test]
fn from_tick_never_fabricates_planet_degrees_and_serialization_omits_field() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    assert_eq!(profile.planet_degrees, None);

    let json = serde_json::to_value(&profile).expect("profile serializes");
    assert!(
        json.get("planetDegrees").is_none(),
        "absent kairos must serialize as an absent field, not null/zeros"
    );
}

#[test]
fn attached_sky_serializes_camel_case_with_fractional_degrees() {
    let mut profile = MathemeHarmonicProfile::from_tick(tick());
    let mut degrees = [0.0f32; 10];
    for (i, d) in degrees.iter_mut().enumerate() {
        *d = 10.25 + i as f32 * 30.0;
    }
    profile.planet_degrees = Some(degrees);

    let json = serde_json::to_value(&profile).expect("profile serializes");
    let sky = json
        .get("planetDegrees")
        .and_then(|v| v.as_array())
        .expect("planetDegrees present as array");
    assert_eq!(sky.len(), 10);
    assert!((sky[0].as_f64().unwrap() - 10.25).abs() < 1e-6); // Sun fractional
    assert!((sky[9].as_f64().unwrap() - 280.25).abs() < 1e-6); // Pluto index 9
}

#[test]
fn live_planets_carry_kernel_decan_rulers_and_resonance_events() {
    // Mars (id 4) transiting Aries I (0-10°): Chaldean ruler of decan 0 is
    // Mars — the §5.2 resonance event ("at home") must fire kernel-side.
    let mars_home = LivePlanetProjection::from_degree(4, 5.5, false);
    assert_eq!(mars_home.decan36, 0);
    assert_eq!(mars_home.decan_ruler, 4);
    assert!(mars_home.is_resonance);

    // Sun (id 0) in Aries II (10-20°): ruler is the Sun — resonance fires.
    let sun_home = LivePlanetProjection::from_degree(0, 15.0, false);
    assert_eq!(sun_home.decan36, 1);
    assert!(sun_home.is_resonance);

    // Moon (id 1) in Aries I: ruled by Mars — no resonance, honest false.
    let moon_away = LivePlanetProjection::from_degree(1, 5.5, true);
    assert!(!moon_away.is_resonance);
    assert!(moon_away.retrograde);

    // Chaldean pins at the decans where the corrected table diverges from
    // the triplicity-grouped data it replaced (Sprint-8 E1 correction):
    // Venus rules Aries III (decan 2) — resonance fires there…
    let venus_home = LivePlanetProjection::from_degree(3, 25.0, false);
    assert_eq!(venus_home.decan36, 2);
    assert_eq!(venus_home.decan_ruler, 3);
    assert!(venus_home.is_resonance);
    // …and Leo III (decan 14) is ruled by Mars, so Venus at 141.8° is NOT
    // at home (the old mis-grouped table wrongly flagged this live).
    let venus_away = LivePlanetProjection::from_degree(3, 141.8, false);
    assert_eq!(venus_away.decan36, 14);
    assert_eq!(venus_away.decan_ruler, 4);
    assert!(!venus_away.is_resonance);
}

#[test]
fn live_planets_element_identity_mirrors_the_kernel_lut_not_renderer_tables() {
    let degrees = [0.0f32; 10];
    let retro = [false; 10];
    let sky = live_planets_from_sky(&degrees, &retro);
    for (i, planet) in sky.iter().enumerate() {
        assert_eq!(planet.planet_id, i as u8);
        assert_eq!(
            planet.element_id,
            portal_core::PLANET_ELEMENT_ID[i],
            "element identity must come from the M2_PLANET_LUT mirror"
        );
        assert_eq!(planet.keplerian_vel, portal_core::PLANET_KEPLERIAN_VEL[i]);
    }
}

#[test]
fn live_planets_serialize_camel_case_and_stay_absent_by_default() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    assert_eq!(profile.live_planets, None);
    let json = serde_json::to_value(&profile).expect("serializes");
    assert!(json.get("livePlanets").is_none());

    let mut with_sky = MathemeHarmonicProfile::from_tick(tick());
    with_sky.live_planets = Some(live_planets_from_sky(&[100.59; 10], &[false; 10]));
    let json = serde_json::to_value(&with_sky).expect("serializes");
    let planets = json
        .get("livePlanets")
        .and_then(|v| v.as_array())
        .expect("livePlanets array");
    assert_eq!(planets.len(), 10);
    let first = &planets[0];
    assert_eq!(first.get("decan36").and_then(|v| v.as_u64()), Some(10));
    assert!(first.get("isResonance").is_some());
    assert!(first.get("decanRuler").is_some());
    assert!(first.get("elementId").is_some());
}

#[test]
fn legacy_profiles_without_the_field_still_deserialize() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    let mut json = serde_json::to_value(&profile).expect("serializes");
    json.as_object_mut().unwrap().remove("planetDegrees");
    let round: MathemeHarmonicProfile =
        serde_json::from_value(json).expect("legacy payload deserializes");
    assert_eq!(round.planet_degrees, None);
}
