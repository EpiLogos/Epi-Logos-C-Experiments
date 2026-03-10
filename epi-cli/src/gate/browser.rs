use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct BrowserState {
    #[serde(default)]
    requests: Vec<BrowserRequest>,
    #[serde(default)]
    logins: BTreeMap<String, LoginFlow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct BrowserRequest {
    request_id: String,
    url: String,
    method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LoginFlow {
    login_id: String,
    channel: String,
    workspace: String,
    status: String,
}

pub fn request(state_root: impl AsRef<Path>, url: &str, method: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let request_id = Uuid::new_v4().to_string();
    state.requests.push(BrowserRequest {
        request_id: request_id.clone(),
        url: url.to_owned(),
        method: method.to_owned(),
    });
    save_state(state_root, &state)?;
    Ok(json!({ "requestId": request_id }))
}

pub fn login_start(
    state_root: impl AsRef<Path>,
    channel: &str,
    workspace: &str,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let login_id = Uuid::new_v4().to_string();
    state.logins.insert(
        login_id.clone(),
        LoginFlow {
            login_id: login_id.clone(),
            channel: channel.to_owned(),
            workspace: workspace.to_owned(),
            status: "pending".to_owned(),
        },
    );
    save_state(state_root, &state)?;
    Ok(json!({
        "loginId": login_id,
        "status": "pending",
        "message": format!("{channel} login started"),
        "qrDataUrl": "data:image/png;base64,ZXBpLWdhdGU=",
    }))
}

pub fn login_wait(state_root: impl AsRef<Path>, login_id: Option<&str>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let login_key = match login_id {
        Some(login_id) => login_id.to_owned(),
        None => state
            .logins
            .keys()
            .last()
            .cloned()
            .ok_or_else(|| "login not found".to_owned())?,
    };
    let flow = state
        .logins
        .get_mut(&login_key)
        .ok_or_else(|| format!("login not found: {login_key}"))?;
    flow.status = "complete".to_owned();
    let status = flow.status.clone();
    let channel = flow.channel.clone();
    save_state(state_root, &state)?;
    Ok(json!({
        "loginId": login_key,
        "status": status,
        "channel": channel,
        "connected": true,
        "message": format!("{channel} connected"),
    }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<BrowserState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(BrowserState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &BrowserState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("browser.json")
}
