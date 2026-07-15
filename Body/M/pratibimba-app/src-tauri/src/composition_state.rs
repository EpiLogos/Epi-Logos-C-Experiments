//! Coordinate: M5' integrated composition persistence (29.T29.10)
//! Residency: Body/M/pratibimba-app/src-tauri/src
//! Position (#n): #5 — integration of the M0'..M5' composition state
//! Actualises: strict, atomic host persistence under
//!   ~/.epi-logos/composition/{compositionId}.json.
//! Public surface: composition_state_load/save, read_at, write_at.
//! Does NOT own: composition calculations, the four face stores, vault law,
//!   or raw quaternion bodies.
//! Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.10

use std::collections::BTreeSet;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Deserialize;

const COMPOSITION_IDS: [&str; 2] = ["cosmic-engine.integrated", "jiva-siva.integrated"];
const EXPECTED_KEYS: [&str; 18] = [
    "compositionId",
    "coordinate",
    "lens",
    "mode",
    "profileGeneration",
    "sessionKey",
    "dayNow",
    "pinnedMatrixFamily",
    "selectedLensCell",
    "activeCodonCell",
    "k2OrientationQ",
    "mathemeProofModeEnabled",
    "timeAxisMode",
    "senseOverride",
    "qComposedSnapshotId",
    "recognitionLayerView",
    "anuttaraGroundingExpanded",
    "miniInspectorActiveIds",
];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LensCell {
    lens_id: String,
    cell_index: u8,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CompositionState {
    composition_id: String,
    coordinate: Option<String>,
    lens: Option<String>,
    mode: Option<String>,
    profile_generation: Option<u64>,
    session_key: Option<String>,
    day_now: Option<String>,
    pinned_matrix_family: Option<u8>,
    selected_lens_cell: Option<LensCell>,
    active_codon_cell: Option<u8>,
    k2_orientation_q: Option<[f64; 4]>,
    matheme_proof_mode_enabled: bool,
    time_axis_mode: Option<String>,
    sense_override: Option<String>,
    q_composed_snapshot_id: Option<String>,
    recognition_layer_view: Option<String>,
    anuttara_grounding_expanded: bool,
    mini_inspector_active_ids: Vec<String>,
}

fn valid_composition_id(value: &str) -> bool {
    COMPOSITION_IDS.contains(&value)
}

fn valid_extension_id(value: &str) -> bool {
    let mut parts = value.split('-');
    let Some(prefix) = parts.next() else {
        return false;
    };
    if !matches!(prefix, "m0" | "m1" | "m2" | "m3" | "m4" | "m5") {
        return false;
    }
    let rest: Vec<_> = parts.collect();
    !rest.is_empty()
        && rest.iter().all(|part| {
            !part.is_empty()
                && part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
}

fn bounded_optional(value: &Option<String>) -> bool {
    value
        .as_ref()
        .is_none_or(|value| !value.is_empty() && value.len() <= 256)
}

fn validate_payload(composition_id: &str, json: &str) -> Result<(), String> {
    if !valid_composition_id(composition_id) {
        return Err("unregistered integrated composition id".to_owned());
    }
    let value: serde_json::Value = serde_json::from_str(json).map_err(|error| error.to_string())?;
    let object = value
        .as_object()
        .ok_or_else(|| "composition state must be an object".to_owned())?;
    let actual: BTreeSet<&str> = object.keys().map(String::as_str).collect();
    let expected: BTreeSet<&str> = EXPECTED_KEYS.into_iter().collect();
    if actual != expected {
        return Err("composition state fields do not match the T29.10 contract".to_owned());
    }
    let q_handle_has_raw_shape = object
        .get("qComposedSnapshotId")
        .is_some_and(|value| !value.is_null() && !value.is_string());
    let state: CompositionState = serde_json::from_value(value).map_err(|error| {
        if q_handle_has_raw_shape {
            "qComposedSnapshotId must be an opaque q-composed handle, never raw quaternion material"
                .to_owned()
        } else {
            error.to_string()
        }
    })?;
    if state.composition_id != composition_id {
        return Err(format!(
            "compositionId mismatch: path {composition_id}, payload {}",
            state.composition_id
        ));
    }
    if ![
        &state.coordinate,
        &state.lens,
        &state.mode,
        &state.session_key,
        &state.day_now,
    ]
    .into_iter()
    .all(|value| bounded_optional(value))
    {
        return Err("state-spine strings must be non-empty and at most 256 bytes".to_owned());
    }
    if state
        .profile_generation
        .is_some_and(|value| value > 9_007_199_254_740_991)
    {
        return Err("profileGeneration exceeds the JavaScript safe-integer range".to_owned());
    }
    if state.pinned_matrix_family.is_some_and(|value| value > 5) {
        return Err("pinnedMatrixFamily must be in 0..5".to_owned());
    }
    if state.active_codon_cell.is_some_and(|value| value > 63) {
        return Err("activeCodonCell must be in 0..63".to_owned());
    }
    if state.selected_lens_cell.as_ref().is_some_and(|cell| {
        cell.lens_id.is_empty() || cell.lens_id.len() > 256 || cell.cell_index > 5
    }) {
        return Err("selectedLensCell is outside the lens-cell contract".to_owned());
    }
    if state
        .k2_orientation_q
        .is_some_and(|quaternion| quaternion.iter().any(|value| !value.is_finite()))
    {
        return Err("k2OrientationQ must contain four finite numbers".to_owned());
    }
    if state
        .time_axis_mode
        .as_deref()
        .is_some_and(|value| !matches!(value, "natal" | "real-time" | "kairotic"))
    {
        return Err("invalid timeAxisMode".to_owned());
    }
    if state
        .sense_override
        .as_deref()
        .is_some_and(|value| !matches!(value, "prospective" | "retrospective" | "auto"))
    {
        return Err("invalid senseOverride".to_owned());
    }
    if state
        .recognition_layer_view
        .as_deref()
        .is_some_and(|value| !matches!(value, "codon" | "resonance72" | "wisdom-delta"))
    {
        return Err("invalid recognitionLayerView".to_owned());
    }
    if state
        .q_composed_snapshot_id
        .as_deref()
        .is_some_and(|value| {
            value.len() > 256
                || !value.starts_with("q-composed://")
                || value["q-composed://".len()..].is_empty()
                || value.chars().any(char::is_whitespace)
        })
    {
        return Err("qComposedSnapshotId must be an opaque q-composed handle, never raw quaternion material".to_owned());
    }
    let unique: BTreeSet<&str> = state
        .mini_inspector_active_ids
        .iter()
        .map(String::as_str)
        .collect();
    if unique.len() != state.mini_inspector_active_ids.len()
        || state
            .mini_inspector_active_ids
            .iter()
            .any(|id| !valid_extension_id(id))
    {
        return Err("miniInspectorActiveIds must be unique M-extension ids".to_owned());
    }
    let _ = (
        state.matheme_proof_mode_enabled,
        state.anuttara_grounding_expanded,
    );
    Ok(())
}

fn state_path(root: &Path, composition_id: &str) -> Result<PathBuf, String> {
    if !valid_composition_id(composition_id) {
        return Err("unregistered integrated composition id".to_owned());
    }
    Ok(root.join(format!("{composition_id}.json")))
}

pub fn read_at(root: &Path, composition_id: &str) -> Result<Option<String>, String> {
    let path = state_path(root, composition_id)?;
    match fs::read_to_string(path) {
        Ok(raw) => {
            validate_payload(composition_id, &raw)?;
            Ok(Some(raw))
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

pub fn write_at(root: &Path, composition_id: &str, json: &str) -> Result<(), String> {
    validate_payload(composition_id, json)?;
    fs::create_dir_all(root).map_err(|error| error.to_string())?;
    let target = state_path(root, composition_id)?;
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_nanos();
    let temporary = root.join(format!(
        ".{composition_id}.{}.{}.tmp",
        std::process::id(),
        nonce
    ));
    let result = (|| -> Result<(), String> {
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(&temporary)
            .map_err(|error| error.to_string())?;
        file.write_all(json.as_bytes())
            .map_err(|error| error.to_string())?;
        file.sync_all().map_err(|error| error.to_string())?;
        fs::rename(&temporary, target).map_err(|error| error.to_string())
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

fn composition_root() -> Result<PathBuf, String> {
    dirs::home_dir()
        .map(|home| home.join(".epi-logos").join("composition"))
        .ok_or_else(|| "no home directory".to_owned())
}

#[tauri::command]
pub fn composition_state_load(composition_id: String) -> Result<Option<String>, String> {
    read_at(&composition_root()?, &composition_id)
}

#[tauri::command]
pub fn composition_state_save(composition_id: String, json: String) -> Result<(), String> {
    write_at(&composition_root()?, &composition_id, &json)
}
