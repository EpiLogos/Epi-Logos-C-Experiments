use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};
use serde_json::Value;

const M2_MEANING_PACKET_SOURCE: &str =
    include_str!("../../../../M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts");

#[test]
fn matheme_profile_round_trips_klein_flip_event_across_flip_sequence() {
    let day = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 2));
    let m1_flip = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    let m2_flip = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 7));
    let m3_flip = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 8));

    assert!(profile_klein_flip(&day).is_null());
    assert_eq!(profile_klein_flip(&m1_flip)["kind"], "m1TritoneCrossing");
    assert_eq!(
        profile_klein_flip(&m2_flip)["kind"],
        "m2CymaticValenceInvert"
    );
    assert_eq!(profile_klein_flip(&m3_flip)["kind"], "m3CodonRotationCross");

    let wire = serde_json::to_string(&m2_flip).expect("profile serializes");
    let decoded: MathemeHarmonicProfile =
        serde_json::from_str(&wire).expect("profile deserializes");
    assert_eq!(
        profile_klein_flip(&decoded)["kind"],
        "m2CymaticValenceInvert"
    );
}

#[test]
fn m2_meaning_packet_consumes_the_profile_klein_flip_event_field() {
    assert!(
        M2_MEANING_PACKET_SOURCE.contains("kleinFlip: kleinFlipFrame(payload)"),
        "M2 meaning-packet must wire the profile payload into kleinFlipFrame"
    );
    assert!(
        M2_MEANING_PACKET_SOURCE.contains("payload.kleinFlip"),
        "M2 meaning-packet must consume profile.kleinFlip"
    );

    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(7, 7));
    let payload = serde_json::to_value(&profile).expect("profile serializes");
    let frame = m2_klein_flip_frame(&payload);

    assert_eq!(frame["source"], "profile.kleinFlip");
    assert_eq!(frame["kind"], "m2CymaticValenceInvert");
    assert_eq!(frame["surfaceValence"], "inverted");
}

fn profile_klein_flip(profile: &MathemeHarmonicProfile) -> Value {
    serde_json::to_value(profile).expect("profile serializes")["kleinFlip"].clone()
}

fn m2_klein_flip_frame(payload: &Value) -> Value {
    let raw = payload.get("kleinFlip").cloned().unwrap_or(Value::Null);
    let surface_valence = if raw
        .get("kind")
        .and_then(Value::as_str)
        .is_some_and(|kind| kind == "m2CymaticValenceInvert")
    {
        "inverted"
    } else {
        "primary"
    };

    serde_json::json!({
        "source": if raw.is_null() { "pending-kleinFlip" } else { "profile.kleinFlip" },
        "kind": raw.get("kind").cloned().unwrap_or(Value::Null),
        "event": raw,
        "surfaceValence": surface_valence
    })
}
