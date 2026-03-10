use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::logs;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SystemState {
    #[serde(default)]
    pub heartbeats: BTreeMap<String, String>,
    #[serde(default)]
    pub events: Vec<SystemEvent>,
    #[serde(default)]
    pub talk_mode: String,
    #[serde(default)]
    pub tts_enabled: bool,
    #[serde(default = "default_tts_provider")]
    pub tts_provider: String,
    #[serde(default)]
    pub voicewake_enabled: bool,
    #[serde(default)]
    pub voicewake_phrase: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEvent {
    pub kind: String,
    pub payload: Value,
}

pub fn set_heartbeats(state_root: impl AsRef<Path>, value: &Value) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let heartbeats = value
        .as_object()
        .ok_or_else(|| "heartbeats must be an object".to_owned())?;
    state.heartbeats = heartbeats
        .iter()
        .map(|(key, value)| (key.clone(), value.as_str().unwrap_or_default().to_owned()))
        .collect();
    save_state(state_root, &state)?;
    Ok(json!({ "ok": true, "heartbeats": state.heartbeats }))
}

pub fn last_heartbeat(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let (agent, status) = state
        .heartbeats
        .iter()
        .next_back()
        .map(|(agent, status)| (agent.clone(), status.clone()))
        .unwrap_or_else(|| ("".to_owned(), "".to_owned()));
    Ok(json!({ "agent": agent, "status": status }))
}

pub fn presence(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({
        "heartbeats": state.heartbeats,
        "events": state.events,
    }))
}

pub fn presence_list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let entries = state
        .heartbeats
        .iter()
        .map(|(instance_id, status)| {
            json!({
                "instanceId": instance_id,
                "host": instance_id,
                "mode": status,
                "platform": "gateway",
                "deviceFamily": "agent",
                "ts": now_ms().unwrap_or_default() as u64,
            })
        })
        .collect::<Vec<_>>();
    Ok(json!({ "entries": entries }))
}

pub fn status_summary(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({
        "running": true,
        "connectionState": "connected",
        "heartbeats": state.heartbeats.len(),
        "events": state.events.len(),
        "ttsEnabled": state.tts_enabled,
        "voicewakeEnabled": state.voicewake_enabled,
    }))
}

pub fn health_snapshot(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({
        "ok": true,
        "checks": {
            "heartbeats": {
                "ok": true,
                "count": state.heartbeats.len(),
            },
            "tts": {
                "ok": true,
                "enabled": state.tts_enabled,
                "provider": state.tts_provider,
            },
            "voicewake": {
                "ok": true,
                "enabled": state.voicewake_enabled,
            }
        }
    }))
}

pub fn event(state_root: impl AsRef<Path>, kind: &str, payload: Value) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let event = SystemEvent {
        kind: kind.to_owned(),
        payload,
    };
    state.events.push(event.clone());
    save_state(&state_root, &state)?;
    logs::append_line(
        state_root,
        &serde_json::to_string(&event).map_err(|err| err.to_string())?,
    )?;
    Ok(json!({ "ok": true, "kind": event.kind }))
}

pub fn usage_status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let _ = load_state(state_root)?;
    Ok(json!({ "ok": true, "tracked": true }))
}

pub fn usage_cost(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let _ = load_state(state_root)?;
    Ok(json!({ "currency": "USD", "total": 0.0 }))
}

pub fn talk_mode(state_root: impl AsRef<Path>, mode: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.talk_mode = mode.to_owned();
    save_state(state_root, &state)?;
    Ok(json!({ "mode": state.talk_mode }))
}

pub fn tts_status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({ "enabled": state.tts_enabled, "provider": state.tts_provider }))
}

pub fn tts_enable(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.tts_enabled = true;
    save_state(state_root, &state)?;
    Ok(json!({ "enabled": true }))
}

pub fn tts_disable(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.tts_enabled = false;
    save_state(state_root, &state)?;
    Ok(json!({ "enabled": false }))
}

pub fn tts_set_provider(state_root: impl AsRef<Path>, provider: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.tts_provider = provider.to_owned();
    save_state(state_root, &state)?;
    Ok(json!({ "provider": provider }))
}

pub fn tts_providers() -> Value {
    json!({ "providers": ["local", "system"] })
}

pub fn tts_convert(state_root: impl AsRef<Path>, text: &str) -> Result<Value, String> {
    let artifact_path = state_root.as_ref().join("tts").join("last-conversion.txt");
    if let Some(parent) = artifact_path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    fs::write(&artifact_path, text).map_err(|err| err.to_string())?;
    Ok(json!({ "artifactPath": artifact_path.display().to_string() }))
}

pub fn voicewake_set(
    state_root: impl AsRef<Path>,
    enabled: bool,
    phrase: &str,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.voicewake_enabled = enabled;
    state.voicewake_phrase = phrase.to_owned();
    save_state(state_root, &state)?;
    Ok(json!({ "enabled": enabled, "phrase": phrase }))
}

pub fn voicewake_get(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({ "enabled": state.voicewake_enabled, "phrase": state.voicewake_phrase }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<SystemState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(SystemState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &SystemState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("system.json")
}

fn default_tts_provider() -> String {
    "system".to_owned()
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
