use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ApprovalRecord {
    approval_id: String,
    command: String,
    node: String,
    decision: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ApprovalState {
    #[serde(default = "default_mode")]
    mode: String,
    #[serde(default)]
    approvals: Vec<ApprovalRecord>,
    #[serde(default)]
    node_modes: BTreeMap<String, String>,
}

impl Default for ApprovalState {
    fn default() -> Self {
        Self {
            mode: default_mode(),
            approvals: Vec::new(),
            node_modes: BTreeMap::new(),
        }
    }
}

pub fn request(
    state_root: impl AsRef<Path>,
    command: &str,
    node: &str,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let approval_id = Uuid::new_v4().to_string();
    state.approvals.push(ApprovalRecord {
        approval_id: approval_id.clone(),
        command: command.to_owned(),
        node: node.to_owned(),
        decision: "pending".to_owned(),
    });
    save_state(state_root, &state)?;
    Ok(json!({ "approvalId": approval_id }))
}

pub fn resolve(
    state_root: impl AsRef<Path>,
    approval_id: &str,
    decision: &str,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let approval = state
        .approvals
        .iter_mut()
        .find(|approval| approval.approval_id == approval_id)
        .ok_or_else(|| format!("approval not found: {approval_id}"))?;
    approval.decision = decision.to_owned();
    save_state(state_root, &state)?;
    Ok(json!({ "approvalId": approval_id, "decision": decision }))
}

pub fn get(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let items = state
        .approvals
        .iter()
        .map(|approval| {
            json!({
                "approvalId": approval.approval_id,
                "command": approval.command,
                "node": approval.node,
                "decision": approval.decision,
            })
        })
        .collect::<Vec<_>>();
    Ok(json!({ "items": items }))
}

pub fn set_mode(state_root: impl AsRef<Path>, mode: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.mode = mode.to_owned();
    save_state(state_root, &state)?;
    Ok(json!({ "mode": mode }))
}

pub fn node_set(state_root: impl AsRef<Path>, node: &str, mode: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.node_modes.insert(node.to_owned(), mode.to_owned());
    save_state(state_root, &state)?;
    Ok(json!({ "node": node, "mode": mode }))
}

pub fn node_get(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let mode = state
        .node_modes
        .get(node)
        .cloned()
        .unwrap_or_else(|| state.mode.clone());
    Ok(json!({ "node": node, "mode": mode }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<ApprovalState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(ApprovalState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &ApprovalState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("approvals.json")
}

fn default_mode() -> String {
    "prompt".to_owned()
}
