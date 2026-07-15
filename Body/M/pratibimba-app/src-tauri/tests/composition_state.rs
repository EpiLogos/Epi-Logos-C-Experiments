//! Coordinate: M5' integrated composition persistence (29.T29.10)
//! Residency: Body/M/pratibimba-app/src-tauri/tests/composition_state.rs
//! Position (#n): #5 — behavioral verification of integrated state
//! Actualises: real-filesystem persistence and privacy-boundary acceptance.
//! Public surface: none (integration tests).
//! Does NOT own: production filesystem paths or composition-domain law.
//! Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.10

use pratibimba_app_lib::composition_state::{read_at, write_at};
use serde_json::json;

fn complete_state() -> serde_json::Value {
    json!({
        "compositionId": "cosmic-engine.integrated",
        "coordinate": "M3-2",
        "lens": "L4",
        "mode": "composed-cosmic-1-2-3",
        "profileGeneration": 73,
        "sessionKey": "session-29-10",
        "dayNow": "15-07-2026",
        "pinnedMatrixFamily": 4,
        "selectedLensCell": { "lensId": "L4", "cellIndex": 5 },
        "activeCodonCell": 63,
        "k2OrientationQ": [0.5, -0.5, 0.5, -0.5],
        "mathemeProofModeEnabled": true,
        "timeAxisMode": "kairotic",
        "senseOverride": "retrospective",
        "qComposedSnapshotId": "q-composed://snapshot/73",
        "recognitionLayerView": "wisdom-delta",
        "anuttaraGroundingExpanded": true,
        "miniInspectorActiveIds": ["m1-paramasiva", "m5-epii"]
    })
}

#[test]
fn writes_and_reads_the_complete_state_on_a_real_filesystem() {
    let temp = tempfile::tempdir().expect("tempdir");
    let state = complete_state();
    write_at(temp.path(), "cosmic-engine.integrated", &state.to_string()).expect("write");
    let raw = read_at(temp.path(), "cosmic-engine.integrated")
        .expect("read")
        .expect("state exists");
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&raw).unwrap(),
        state
    );
}

#[test]
fn refuses_raw_quaternion_material() {
    let temp = tempfile::tempdir().expect("tempdir");
    let mut state = complete_state();
    state["qComposedSnapshotId"] = json!([0.5, -0.5, 0.5, -0.5]);
    let error = write_at(temp.path(), "cosmic-engine.integrated", &state.to_string())
        .expect_err("raw quaternion must be refused");
    assert!(error.contains("opaque q-composed handle"));
}

#[test]
fn refuses_a_payload_for_the_other_composition() {
    let temp = tempfile::tempdir().expect("tempdir");
    let error = write_at(
        temp.path(),
        "jiva-siva.integrated",
        &complete_state().to_string(),
    )
    .expect_err("path and payload identity must agree");
    assert!(error.contains("compositionId mismatch"));
}
