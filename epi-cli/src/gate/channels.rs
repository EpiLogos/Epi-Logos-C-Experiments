use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::skills;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct ChannelsState {
    #[serde(default)]
    channels: BTreeMap<String, ChannelRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ChannelRecord {
    configured: bool,
    running: bool,
    connected: bool,
    mode: String,
    last_probe_at: u128,
    last_start_at: u128,
    last_connected_at: u128,
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(&state_root)?;
    let invocation_surface = skills::invocation_surface(&state_root)?;

    let mut channel_order = vec![
        "telegram".to_owned(),
        "slack".to_owned(),
        "whatsapp".to_owned(),
    ];
    for key in state.channels.keys() {
        if !channel_order.contains(key) {
            channel_order.push(key.clone());
        }
    }

    let channels = channel_order
        .iter()
        .map(|id| {
            let record = state
                .channels
                .get(id)
                .cloned()
                .unwrap_or_else(default_channel_record);
            (
                id.clone(),
                json!({
                    "configured": record.configured,
                    "running": record.running,
                    "connected": record.connected,
                    "mode": record.mode,
                    "probe": true,
                    "lastProbeAt": record.last_probe_at,
                    "lastStartAt": record.last_start_at,
                    "lastConnectedAt": record.last_connected_at,
                }),
            )
        })
        .collect::<serde_json::Map<String, Value>>();

    let channel_accounts = channel_order
        .iter()
        .map(|id| {
            let record = state
                .channels
                .get(id)
                .cloned()
                .unwrap_or_else(default_channel_record);
            (
                id.clone(),
                json!([{
                    "accountId": format!("{id}-main"),
                    "configured": record.configured,
                    "connected": record.connected,
                    "running": record.running,
                    "tokenSource": if record.connected { "gateway" } else { "none" },
                }]),
            )
        })
        .collect::<serde_json::Map<String, Value>>();

    let labels = channel_order
        .iter()
        .map(|id| (id.clone(), json!(title_case(id))))
        .collect::<serde_json::Map<String, Value>>();
    let default_account = channel_order
        .iter()
        .map(|id| (id.clone(), json!(format!("{id}-main"))))
        .collect::<serde_json::Map<String, Value>>();

    let channel_meta = json!([{
        "id":"skills",
        "label": format!("skills:{}", invocation_surface["skills"].as_array().map(|v| v.len()).unwrap_or(0))
    }]);
    let snapshot = json!({
        "ts": now_ms()? as u64,
        "channelOrder": channel_order,
        "channelLabels": labels,
        "channelDetailLabels": {},
        "channelAccounts": channel_accounts,
        "channelDefaultAccountId": default_account,
        "channelMeta": channel_meta,
        "channels": channels,
    });

    let mut response = snapshot.as_object().cloned().unwrap_or_default();
    response.insert("channelsSnapshot".to_owned(), snapshot);
    response.insert("invocationSurface".to_owned(), invocation_surface);
    Ok(Value::Object(response))
}

pub fn mark_login_start(state_root: impl AsRef<Path>, channel: &str) -> Result<(), String> {
    update_channel(state_root, channel, |record| {
        record.configured = true;
        record.running = true;
        record.mode = "login".to_owned();
        record.last_start_at = now_ms().unwrap_or_default();
        record.last_probe_at = record.last_start_at;
    })
}

pub fn mark_login_wait(state_root: impl AsRef<Path>, channel: &str) -> Result<(), String> {
    update_channel(state_root, channel, |record| {
        record.configured = true;
        record.running = true;
        record.connected = true;
        record.mode = "connected".to_owned();
        record.last_connected_at = now_ms().unwrap_or_default();
        record.last_probe_at = record.last_connected_at;
    })
}

pub fn logout(state_root: impl AsRef<Path>, channel: &str) -> Result<Value, String> {
    update_channel(state_root, channel, |record| {
        record.connected = false;
        record.running = false;
        record.mode = "logged-out".to_owned();
        record.last_probe_at = now_ms().unwrap_or_default();
    })?;
    Ok(json!({ "ok": true, "channel": channel }))
}

fn update_channel<F>(state_root: impl AsRef<Path>, channel: &str, mutate: F) -> Result<(), String>
where
    F: FnOnce(&mut ChannelRecord),
{
    let mut state = load_state(&state_root)?;
    let record = state
        .channels
        .entry(channel.to_owned())
        .or_insert_with(default_channel_record);
    mutate(record);
    save_state(state_root, &state)
}

fn load_state(state_root: impl AsRef<Path>) -> Result<ChannelsState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(ChannelsState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &ChannelsState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("channels.json")
}

fn default_channel_record() -> ChannelRecord {
    ChannelRecord {
        configured: false,
        running: false,
        connected: false,
        mode: "idle".to_owned(),
        last_probe_at: 0,
        last_start_at: 0,
        last_connected_at: 0,
    }
}

fn title_case(value: &str) -> String {
    let mut chars = value.chars();
    match chars.next() {
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
        None => value.to_owned(),
    }
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
