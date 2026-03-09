use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct WizardState {
    active: bool,
    flow: String,
    step: usize,
}

pub fn start(state_root: impl AsRef<Path>, flow: &str) -> Result<Value, String> {
    let state = WizardState {
        active: true,
        flow: flow.to_owned(),
        step: 0,
    };
    save_state(state_root, &state)?;
    render(&state)
}

pub fn next(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    if state.active {
        state.step += 1;
    }
    save_state(state_root, &state)?;
    render(&state)
}

pub fn cancel(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.active = false;
    save_state(state_root, &state)?;
    render(&state)
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    render(&load_state(state_root)?)
}

fn render(state: &WizardState) -> Result<Value, String> {
    Ok(json!({
        "active": state.active,
        "flow": state.flow,
        "step": state.step,
    }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<WizardState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(WizardState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &WizardState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("wizard.json")
}
