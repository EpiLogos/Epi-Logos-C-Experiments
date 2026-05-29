//! E4: integration test for the harmonic-profile Tauri response wrapper.
//!
//! Exercises `HarmonicProfileResponse::compose` with and without a VAK
//! address, and confirms the wire payload omits the field when absent
//! (per `skip_serializing_if`).

use epi_tauri_lib::commands::harmonic_profile::HarmonicProfileResponse;
use portal_core::{CpfState, CsDirection, CsField, VakAddress};

fn sample_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".into()],
        cp: "CP4.4".into(),
        cf: "(4.0/1-4.4/5)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS0".into(),
            direction: CsDirection::Day,
        },
    }
}

#[test]
fn harmonic_profile_response_carries_vak() {
    let vak = sample_vak();
    let resp = HarmonicProfileResponse::compose(7, Some(vak.clone()));
    assert_eq!(resp.tick, 7);
    assert_eq!(resp.vak_address.as_ref().unwrap().cf, "(4.0/1-4.4/5)");
    assert_eq!(
        resp.vak_address.as_ref().unwrap().cs.direction,
        CsDirection::Day
    );
}

#[test]
fn harmonic_profile_response_compose_without_vak_serializes_skip_none() {
    let resp = HarmonicProfileResponse::compose(11, None);
    let json = serde_json::to_string(&resp).unwrap();
    // Field is serialized as `vakAddress` under camelCase rename. With
    // `skip_serializing_if = "Option::is_none"`, the substring "vak"
    // must not appear at all when VAK is absent.
    assert!(
        !json.contains("vak"),
        "vakAddress field should be absent when None (skip_serializing_if), got: {json}"
    );
}

#[test]
fn harmonic_profile_response_round_trips_through_serde() {
    let vak = sample_vak();
    let resp = HarmonicProfileResponse::compose(99, Some(vak.clone()));
    let json = serde_json::to_string(&resp).unwrap();
    let back: HarmonicProfileResponse = serde_json::from_str(&json).unwrap();
    assert_eq!(back.tick, 99);
    assert_eq!(back.vak_address.unwrap(), vak);
}
