//! Track 01 T0 — Baseline Contract Inventory fixture freeze.
//!
//! Generates a safe public-current `MathemeHarmonicProfile` JSON fixture from
//! the real `portal-core::MathemeHarmonicProfile::from_tick` constructor. The
//! fixture committed alongside the inventory in
//! `Body/S/S0/portal-core/contract-inventory/baseline-profile.json` is produced
//! by this test; running `cargo test ... track_01_t0_baseline_fixture` re-emits
//! it and asserts the on-disk artifact is byte-identical to the freshly
//! generated payload.
//!
//! The test purposefully uses tick = (cycle 0, sub_tick 0) so the fixture is
//! deterministic, depends on no personal identity, and stays inside the
//! `PublicCurrentContext` privacy class. No protected-local fields should
//! appear in the rendered JSON.

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile, ProfilePrivacyClass};
use std::path::PathBuf;

fn fixture_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("contract-inventory")
        .join("baseline-profile.json")
}

#[test]
fn baseline_profile_fixture_is_real_code_generated_and_byte_stable() {
    let tick = kernel_tick_from_epogdoon(0, 0);
    let profile = MathemeHarmonicProfile::from_tick(tick);

    assert!(profile.vak_address.is_none(), "baseline fixture must not carry a VAK address");
    assert_eq!(
        profile.privacy_class,
        ProfilePrivacyClass::PublicCurrentContext,
        "baseline fixture must stay in public-current-context"
    );

    let mut json = serde_json::to_string_pretty(&profile).expect("profile serializes");
    json.push('\n');

    let on_disk = std::fs::read_to_string(fixture_path()).expect("baseline fixture exists");

    if json != on_disk {
        if std::env::var("BASELINE_FIXTURE_BLESS").is_ok() {
            std::fs::write(fixture_path(), &json).expect("bless fixture");
        } else {
            panic!(
                "Baseline fixture drift detected.\n\nRe-bless with:\n  BASELINE_FIXTURE_BLESS=1 cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml baseline_profile_fixture_is_real_code_generated_and_byte_stable\n"
            );
        }
    }
}

#[test]
fn baseline_profile_does_not_leak_protected_local_fields() {
    let tick = kernel_tick_from_epogdoon(0, 0);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    let json = serde_json::to_value(&profile).expect("profile serializes");

    let s = json.to_string();
    for forbidden in [
        "natalChartHandle",
        "natal_chart_handle",
        "qPersonal",
        "q_personal",
        "identityHash",
        "identity_hash",
        "elementalBalance",
        "elemental_balance",
        "naraBody",
        "journalBody",
    ] {
        assert!(
            !s.contains(forbidden),
            "baseline public-current profile must not carry {forbidden}; got: {s}"
        );
    }
}
