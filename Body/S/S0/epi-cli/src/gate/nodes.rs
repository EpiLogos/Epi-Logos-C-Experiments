use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct NodeState {
    #[serde(default)]
    nodes: BTreeMap<String, NodeRecord>,
    #[serde(default)]
    results: BTreeMap<String, NodeResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct NodeRecord {
    node: String,
    status: String,
    verified: bool,
    #[serde(default)]
    events: Vec<NodeEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct NodeEvent {
    kind: String,
    payload: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct NodeResult {
    result_id: String,
    node: String,
    command: String,
    ok: bool,
}

pub fn pair_request(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.nodes.insert(
        node.to_owned(),
        NodeRecord {
            node: node.to_owned(),
            status: "pending".to_owned(),
            verified: false,
            events: Vec::new(),
        },
    );
    save_state(state_root, &state)?;
    Ok(json!({ "node": node, "status": "pending" }))
}

pub fn pair_list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let items = state
        .nodes
        .values()
        .map(|record| json!({"node": record.node, "status": record.status, "verified": record.verified}))
        .collect::<Vec<_>>();
    Ok(json!({ "items": items, "nodes": items }))
}

pub fn pair_approve(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    update_node(state_root, node, |record| {
        record.status = "approved".to_owned();
        record.verified = true;
    })?;
    Ok(json!({ "node": node, "status": "approved" }))
}

pub fn pair_reject(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    update_node(state_root, node, |record| {
        record.status = "rejected".to_owned();
        record.verified = false;
    })?;
    Ok(json!({ "node": node, "status": "rejected" }))
}

pub fn pair_verify(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let record = state
        .nodes
        .get(node)
        .ok_or_else(|| format!("node not found: {node}"))?;
    Ok(json!({ "node": node, "verified": record.verified }))
}

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    pair_list(state_root)
}

pub fn describe(state_root: impl AsRef<Path>, node: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let record = state
        .nodes
        .get(node)
        .ok_or_else(|| format!("node not found: {node}"))?;
    Ok(json!({
        "node": record.node,
        "status": record.status,
        "verified": record.verified,
    }))
}

pub fn rename(state_root: impl AsRef<Path>, node: &str, name: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let Some(mut record) = state.nodes.remove(node) else {
        return Err(format!("node not found: {node}"));
    };
    record.node = name.to_owned();
    state.nodes.insert(name.to_owned(), record);
    save_state(state_root, &state)?;
    Ok(json!({ "node": name }))
}

pub fn invoke(state_root: impl AsRef<Path>, node: &str, command: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    if !state.nodes.contains_key(node) {
        state.nodes.insert(
            node.to_owned(),
            NodeRecord {
                node: node.to_owned(),
                status: "approved".to_owned(),
                verified: true,
                events: Vec::new(),
            },
        );
    }
    let result_id = Uuid::new_v4().to_string();
    state.results.insert(
        result_id.clone(),
        NodeResult {
            result_id: result_id.clone(),
            node: node.to_owned(),
            command: command.to_owned(),
            ok: true,
        },
    );
    save_state(state_root, &state)?;
    Ok(json!({ "resultId": result_id }))
}

pub fn invoke_result(state_root: impl AsRef<Path>, result_id: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let result = state
        .results
        .get(result_id)
        .ok_or_else(|| format!("result not found: {result_id}"))?;
    Ok(json!({
        "ok": result.ok,
        "node": result.node,
        "command": result.command,
        "resultId": result.result_id,
    }))
}

pub fn event(
    state_root: impl AsRef<Path>,
    node: &str,
    kind: &str,
    payload: Value,
) -> Result<Value, String> {
    update_node(state_root, node, |record| {
        record.events.push(NodeEvent {
            kind: kind.to_owned(),
            payload,
        });
    })?;
    Ok(json!({ "ok": true, "node": node, "kind": kind }))
}

fn update_node<F>(state_root: impl AsRef<Path>, node: &str, mutate: F) -> Result<(), String>
where
    F: FnOnce(&mut NodeRecord),
{
    let mut state = load_state(&state_root)?;
    let record = state.nodes.entry(node.to_owned()).or_insert(NodeRecord {
        node: node.to_owned(),
        status: "pending".to_owned(),
        verified: false,
        events: Vec::new(),
    });
    mutate(record);
    save_state(state_root, &state)
}

fn load_state(state_root: impl AsRef<Path>) -> Result<NodeState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(NodeState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &NodeState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("nodes.json")
}
