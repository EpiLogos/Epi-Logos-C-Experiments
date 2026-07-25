//! Cross-language `VakAddress` parity against the TS mirror (50.T50.03).
//!
//! `Body/S/S4/ta-onta/shared/vak_address.ts` is the TS mirror of this crate's
//! `vak_address.rs`. Nothing previously bound the two: the mirror had its own
//! contract tests and this crate had its own, so a literal set could drift on one
//! side indefinitely.
//!
//! This test and its TS counterpart
//! (`Body/S/S4/ta-onta/S4-4p-anima/tests/vak_orchestration_surface.test.ts`) read
//! the SAME fixture — `Body/S/S4/ta-onta/shared/vak_address.parity.json` — and
//! must agree on every case. Neither side inspects the other's source; parity is
//! proven by both accepting the canonical cases and both refusing the rejected
//! ones. Adding a coordinate value to the fixture binds it in both languages.

use std::fs;
use std::path::PathBuf;

use portal_core::{CpfState, CsDirection, VakAddress};
use serde_json::Value;

fn repo_root() -> PathBuf {
    // tests/ -> portal-core -> S0 -> S -> Body -> repo root
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../../..")
        .canonicalize()
        .expect("repo root resolves")
}

fn fixture() -> Value {
    let path = repo_root().join("Body/S/S4/ta-onta/shared/vak_address.parity.json");
    let raw = fs::read_to_string(&path)
        .unwrap_or_else(|err| panic!("parity fixture unreadable at {}: {err}", path.display()));
    serde_json::from_str(&raw).expect("parity fixture is valid JSON")
}

#[test]
fn every_canonical_case_deserializes_into_the_rust_vak_address() {
    let fixture = fixture();
    let cases = fixture["canonical"]
        .as_array()
        .expect("fixture.canonical is an array");
    assert!(
        !cases.is_empty(),
        "the parity fixture must carry canonical cases"
    );

    for case in cases {
        let name = case["name"].as_str().unwrap_or("<unnamed>");
        let address = &case["address"];
        let parsed: VakAddress = serde_json::from_value(address.clone())
            .unwrap_or_else(|err| panic!("canonical case '{name}' must deserialize: {err}"));

        // Round-trip: the Rust re-serialisation must equal the fixture bytes
        // field-for-field, so a rename or a shape change on either side fails.
        let round_tripped = serde_json::to_value(&parsed)
            .unwrap_or_else(|err| panic!("case '{name}' must re-serialise: {err}"));

        for key in ["cpf", "ct", "cp", "cf", "cfp"] {
            assert_eq!(
                round_tripped[key], address[key],
                "case '{name}': field `{key}` did not round-trip"
            );
        }
        assert_eq!(
            round_tripped["cs"]["code"], address["cs"]["code"],
            "case '{name}': cs.code did not round-trip"
        );
        assert_eq!(
            round_tripped["cs"]["direction"], address["cs"]["direction"],
            "case '{name}': cs.direction did not round-trip"
        );
    }
}

#[test]
fn the_primed_night_pass_survives_the_round_trip() {
    let fixture = fixture();
    let cases = fixture["canonical"].as_array().unwrap();
    let primed: Vec<&Value> = cases
        .iter()
        .filter(|c| c["address"]["cs"]["direction"] == "Night'")
        .collect();
    assert!(
        !primed.is_empty(),
        "the fixture must exercise the primed Night' pass — phase erasure is the failure mode"
    );

    for case in primed {
        let parsed: VakAddress = serde_json::from_value(case["address"].clone()).unwrap();
        assert_eq!(parsed.cs.direction, CsDirection::Night);
        let out = serde_json::to_value(&parsed).unwrap();
        assert_eq!(
            out["cs"]["direction"], "Night'",
            "the prime must not be erased on the way out"
        );
    }
}

#[test]
fn both_cpf_review_polarities_are_bound() {
    let fixture = fixture();
    let cases = fixture["canonical"].as_array().unwrap();

    let mut saw_dialogical = false;
    let mut saw_mechanistic = false;
    for case in cases {
        let parsed: VakAddress = serde_json::from_value(case["address"].clone()).unwrap();
        match parsed.cpf {
            CpfState::Dialogical => saw_dialogical = true,
            CpfState::Mechanistic => saw_mechanistic = true,
        }
    }
    assert!(saw_dialogical, "fixture must cover CPF (00/00)");
    assert!(saw_mechanistic, "fixture must cover CPF (4.0/1-4.4/5)");
}

#[test]
fn the_loose_epi_cli_shape_is_refused_by_the_canonical_envelope() {
    // `epi agent vak evaluate` emits a separate loose `VakCoordinates` shape.
    // Both languages must refuse it rather than coerce it — guessing which
    // `CP4.x` a bare "CP4" meant would fabricate a coordinate.
    let fixture = fixture();
    let cases = fixture["rejected"]
        .as_array()
        .expect("fixture.rejected is an array");

    let loose = cases
        .iter()
        .find(|c| c["name"] == "epi-cli-loose-vak-coordinates")
        .expect("the loose epi-cli case must be pinned");

    let parsed: Result<VakAddress, _> = serde_json::from_value(loose["address"].clone());
    assert!(
        parsed.is_err(),
        "the loose VakCoordinates shape must NOT deserialize as a canonical VakAddress"
    );
}

#[test]
fn an_unprimed_night_direction_is_refused() {
    let fixture = fixture();
    let cases = fixture["rejected"].as_array().unwrap();
    let unprimed = cases
        .iter()
        .find(|c| c["name"] == "unprimed-night-direction")
        .expect("the unprimed-Night case must be pinned");

    let parsed: Result<VakAddress, _> = serde_json::from_value(unprimed["address"].clone());
    assert!(
        parsed.is_err(),
        "an unprimed \"Night\" must not deserialize — the prime is the phase"
    );
}
