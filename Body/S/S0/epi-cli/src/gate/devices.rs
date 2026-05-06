use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct DeviceState {
    #[serde(default)]
    devices: BTreeMap<String, DeviceRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct DeviceRecord {
    status: String,
    #[serde(default)]
    tokens: Vec<String>,
}

pub fn pair_list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let paired = state
        .devices
        .iter()
        .map(|(device, record)| {
            json!({
                "deviceId": device,
                "displayName": device,
                "roles": [record.status],
                "tokens": record.tokens.iter().map(|token| json!({"role":"operator","token":token})).collect::<Vec<_>>(),
            })
        })
        .collect::<Vec<_>>();
    Ok(json!({ "items": paired, "pending": Vec::<Value>::new(), "paired": paired }))
}

pub fn pair_approve(state_root: impl AsRef<Path>, device: &str) -> Result<Value, String> {
    update_device(state_root, device, |record| {
        record.status = "approved".to_owned();
    })?;
    Ok(json!({ "device": device, "status": "approved" }))
}

pub fn pair_reject(state_root: impl AsRef<Path>, device: &str) -> Result<Value, String> {
    update_device(state_root, device, |record| {
        record.status = "rejected".to_owned();
    })?;
    Ok(json!({ "device": device, "status": "rejected" }))
}

pub fn token_rotate(state_root: impl AsRef<Path>, device: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let record = state.devices.entry(device.to_owned()).or_default();
    let token = format!("tok_{}", Uuid::new_v4().simple());
    record.tokens.push(token.clone());
    save_state(state_root, &state)?;
    Ok(json!({ "device": device, "token": token }))
}

pub fn token_revoke(
    state_root: impl AsRef<Path>,
    device: &str,
    token: &str,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let record = state.devices.entry(device.to_owned()).or_default();
    record.tokens.retain(|entry| entry != token);
    save_state(state_root, &state)?;
    Ok(json!({ "device": device, "revoked": true }))
}

fn update_device<F>(state_root: impl AsRef<Path>, device: &str, mutate: F) -> Result<(), String>
where
    F: FnOnce(&mut DeviceRecord),
{
    let mut state = load_state(&state_root)?;
    let record = state.devices.entry(device.to_owned()).or_default();
    mutate(record);
    save_state(state_root, &state)
}

fn load_state(state_root: impl AsRef<Path>) -> Result<DeviceState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(DeviceState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &DeviceState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("devices.json")
}
