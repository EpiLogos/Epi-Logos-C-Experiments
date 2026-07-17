// Coordinate: M4' / S0 profile bus — quintessence identity handle (Sprint-8 E6)
// The shared profile carries the PASU identity ONLY as a handle summary (DR-M4-3):
// natal clock address, weight, enrichment honesty, hash preview, elemental
// quaternion. The kernel constructor never fabricates it; the natal 10-planet
// distribution never crosses this bus at all.

use portal_core::{
    kernel_tick_from_epogdoon, KernelTick, MathemeHarmonicProfile, QuintessenceProjection,
};

fn tick() -> KernelTick {
    kernel_tick_from_epogdoon(3, 4)
}

fn sample_projection() -> QuintessenceProjection {
    QuintessenceProjection {
        natal_degree: 217,
        natal_tick12: 7,
        quintessence_weight: 0.62,
        layer_count: 5,
        partial: false,
        hash_preview: "9f3a1c2b".to_owned(),
        quintessence_quaternion: [0.61, 0.45, 0.42, 0.5],
        authority: "epi nara identity (BLAKE3, hash_to_clock_position)".to_owned(),
    }
}

#[test]
fn from_tick_never_fabricates_identity_and_serialization_omits_field() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    assert_eq!(profile.quintessence, None);

    let json = serde_json::to_value(&profile).expect("profile serializes");
    assert!(
        json.get("quintessence").is_none(),
        "absent identity must serialize as an absent field, not null/zeros"
    );
}

#[test]
fn attached_identity_serializes_camel_case_handles_only() {
    let mut profile = MathemeHarmonicProfile::from_tick(tick());
    profile.quintessence = Some(sample_projection());

    let json = serde_json::to_value(&profile).expect("profile serializes");
    let q = json.get("quintessence").expect("quintessence present");
    assert_eq!(q.get("natalDegree").and_then(|v| v.as_u64()), Some(217));
    assert_eq!(q.get("natalTick12").and_then(|v| v.as_u64()), Some(7));
    assert_eq!(q.get("layerCount").and_then(|v| v.as_u64()), Some(5));
    assert_eq!(q.get("partial").and_then(|v| v.as_bool()), Some(false));
    assert_eq!(
        q.get("hashPreview").and_then(|v| v.as_str()),
        Some("9f3a1c2b")
    );
    assert_eq!(
        q.get("quintessenceQuaternion")
            .and_then(|v| v.as_array())
            .map(|a| a.len()),
        Some(4)
    );
    // handle law, enforced as an ALLOWLIST (E6 verifier closure): the
    // projection may carry EXACTLY these handle fields — any new field is a
    // deliberate contract change that must re-pass privacy review here.
    let mut keys: Vec<&str> = q
        .as_object()
        .expect("quintessence is an object")
        .keys()
        .map(String::as_str)
        .collect();
    keys.sort_unstable();
    assert_eq!(
        keys,
        vec![
            "authority",
            "hashPreview",
            "layerCount",
            "natalDegree",
            "natalTick12",
            "partial",
            "quintessenceQuaternion",
            "quintessenceWeight",
        ],
        "quintessence projection may carry ONLY the reviewed handle fields"
    );
}

#[test]
fn legacy_payloads_without_the_field_still_deserialize() {
    let profile = MathemeHarmonicProfile::from_tick(tick());
    let mut json = serde_json::to_value(&profile).expect("serializes");
    json.as_object_mut().expect("object").remove("quintessence");
    let back: MathemeHarmonicProfile =
        serde_json::from_value(json).expect("legacy payload deserializes");
    assert_eq!(back.quintessence, None);
}

#[test]
fn round_trips_through_json() {
    let mut profile = MathemeHarmonicProfile::from_tick(tick());
    profile.quintessence = Some(sample_projection());
    let json = serde_json::to_string(&profile).expect("serializes");
    let back: MathemeHarmonicProfile = serde_json::from_str(&json).expect("deserializes");
    assert_eq!(back.quintessence, Some(sample_projection()));
}
