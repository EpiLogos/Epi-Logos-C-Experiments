use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct UpdateState {
    last_run_at_ms: u128,
    status: String,
}

pub fn run(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = UpdateState {
        last_run_at_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|err| err.to_string())?
            .as_millis(),
        status: "ok".to_owned(),
    };
    save_state(state_root, &state)?;
    Ok(json!({ "ok": true, "status": state.status, "lastRunAtMs": state.last_run_at_ms }))
}

fn save_state(state_root: impl AsRef<Path>, state: &UpdateState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("update.json")
}
