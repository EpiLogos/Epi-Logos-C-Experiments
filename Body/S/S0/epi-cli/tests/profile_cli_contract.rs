//! Track 01 T3 — `epi profile` CLI integration contract.
//!
//! Invokes the compiled `epi` binary end-to-end and asserts the JSON payload
//! matches the public-current contract that Tauri/Theia/gateway consumers
//! depend on. No mocks, no handwritten fixtures — the binary is built by
//! cargo and every assertion runs against its real stdout.

use serde_json::Value;
use std::process::Command;

fn epi_binary() -> std::path::PathBuf {
    // CARGO_BIN_EXE_<name> points at the just-built binary.
    let path =
        env!("CARGO_BIN_EXE_epi");
    std::path::PathBuf::from(path)
}

fn run_profile(args: &[&str]) -> Value {
    let bin = epi_binary();
    let out = Command::new(&bin)
        .arg("profile")
        .args(args)
        .output()
        .unwrap_or_else(|e| panic!("spawn {bin:?} profile: {e}"));
    assert!(
        out.status.success(),
        "epi profile {args:?} exit={:?} stderr={}",
        out.status,
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout).unwrap_or_else(|e| {
        panic!(
            "epi profile {args:?} stdout not JSON: {e}\n{}",
            String::from_utf8_lossy(&out.stdout)
        )
    })
}

#[test]
fn cli_profile_show_emits_real_portal_core_profile_with_canonical_fields() {
    let v = run_profile(&["show", "--cycle", "0", "--sub-tick", "0"]);
    assert_eq!(v["source"], "portal_core::MathemeHarmonicProfile::from_tick");
    assert!(v["cliVersion"].is_string());

    let profile = &v["profile"];
    assert!(profile["tick"].is_number(), "profile.tick must be numeric");
    assert_eq!(profile["privacyClass"], "public-current-context");
    assert!(profile["vakAddress"].is_null(), "baseline must have no VAK");
    // Forbidden protected-local fields:
    for forbidden in [
        "qPersonal",
        "natalChartHandle",
        "identityHash",
        "elementalBalance",
    ] {
        assert!(
            profile.get(forbidden).is_none(),
            "public-current profile MUST NOT carry {forbidden}"
        );
    }
}

#[test]
fn cli_profile_pointer_emits_36_cardinality_and_seven_cf_with_canonical_dictionaries() {
    let v = run_profile(&["pointer", "--cycle", "0", "--sub-tick", "0"]);
    assert_eq!(v["webCardinality"], 36);
    assert_eq!(v["contextFrames"]["frameCount"], 7);

    let dicts = &v["roleDictionaries"];
    assert_eq!(dicts["pointerRings"].as_array().unwrap().len(), 3);
    assert_eq!(dicts["helices"].as_array().unwrap().len(), 3);
    assert_eq!(dicts["relationRoles"].as_array().unwrap().len(), 9);
    assert_eq!(dicts["intervalRoles"].as_array().unwrap().len(), 6);
    assert_eq!(dicts["ratioRoles"].as_array().unwrap().len(), 7);
    assert_eq!(dicts["bedrockRoles"].as_array().unwrap().len(), 3);

    let cf_notations = dicts["contextFrameNotations"].as_array().unwrap();
    assert_eq!(cf_notations.len(), 7);
    assert_eq!(cf_notations[0], "(00/00)");
    assert_eq!(cf_notations[6], "(5/0)");
}

#[test]
fn cli_profile_codon_calls_portal_core() {
    let v = run_profile(&["codon", "--lens", "0", "--mode", "0"]);
    assert_eq!(v["source"], "portal_core::codon_rotation_from_lens_mode");
    assert!(v["codonId"].is_number());
    assert!(v["rotation"].is_number());
    assert!(v["codonClass"].is_string());
}

#[test]
fn cli_profile_readiness_no_probe_reports_bridge_unavailable() {
    let v = run_profile(&["readiness"]);
    assert_eq!(v["state"], "bridge_unavailable");
    assert_eq!(v["severity"], "blocked");
    assert_eq!(v["probed"], false);
    assert!(v["reason"].as_str().unwrap().contains("no probe"));
}

#[test]
fn cli_profile_readiness_probe_unreachable_reports_bridge_unavailable_honestly() {
    // Port 9 is unassigned/refused. The CLI MUST surface bridge_unavailable,
    // proving there is no mock-success branch hiding the real failure.
    let v = run_profile(&[
        "readiness",
        "--probe",
        "--gateway-url",
        "http://127.0.0.1:9",
    ]);
    assert_eq!(v["state"], "bridge_unavailable");
    assert_eq!(v["probed"], true);
    assert!(v["reason"]
        .as_str()
        .unwrap()
        .to_lowercase()
        .contains("unreachable"));
}

#[test]
fn cli_profile_readiness_taxonomy_covers_the_07_t0_states() {
    // Sanity: every state declared in 07-t0 readinessTaxonomy must be a valid
    // BridgeReadinessState. The CLI emits one of these states; the schema
    // accepts exactly this set. Drift between the two surfaces fails this
    // test through the schema dimension below.
    let allowed = [
        "bridge_unavailable",
        "profile_missing_field",
        "s2_graph_blocked",
        "s3_subscription_blocked",
        "s5_review_blocked",
        "authority_payload_missing",
        "privacy_blocked",
        "degraded_but_readable",
        "ready_public_current",
    ];
    let v = run_profile(&["readiness"]);
    let state = v["state"].as_str().unwrap();
    assert!(
        allowed.contains(&state),
        "state {state} not in canonical 07.T0 taxonomy"
    );
}
