use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::channel_adapters::{self, ChannelOperation};
use super::config::{self, ChannelConfig};
use super::secrets::{SecretResolver, SecretStatus};
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
    let config = config::load_document(&state_root)?.gateway;
    let secret_resolver = SecretResolver::new(config.secrets.clone());
    let invocation_surface = skills::invocation_surface(&state_root)?;

    let mut channel_order = vec![
        "telegram".to_owned(),
        "whatsapp".to_owned(),
        "slack".to_owned(),
        "discord".to_owned(),
        "google-drive".to_owned(),
    ];
    for key in config.channels.keys() {
        if !channel_order.contains(key) {
            channel_order.push(key.clone());
        }
    }
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
            let channel_config = config.channels.get(id);
            let configured = record.configured
                || channel_config
                    .map(|channel| channel.enabled)
                    .unwrap_or(false);
            let secret_state = secret_state(id, channel_config, &config.secrets, &secret_resolver);
            let adapter = adapter_state(id);
            (
                id.clone(),
                json!({
                    "configured": configured,
                    "running": record.running,
                    "connected": record.connected,
                    "mode": record.mode,
                    "probe": true,
                    "lastProbeAt": record.last_probe_at,
                    "lastStartAt": record.last_start_at,
                    "lastConnectedAt": record.last_connected_at,
                    "secret": secret_state,
                    "adapter": adapter,
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
            let channel_config = config.channels.get(id);
            let configured = record.configured
                || channel_config
                    .map(|channel| channel.enabled)
                    .unwrap_or(false);
            let account_id = channel_config
                .and_then(|channel| channel.account_hint.clone())
                .unwrap_or_else(|| format!("{id}-main"));
            (
                id.clone(),
                json!([{
                    "accountId": account_id,
                    "configured": configured,
                    "connected": record.connected,
                    "running": record.running,
                    "tokenSource": token_source(record.connected, channel_config, &config.secrets),
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
        .map(|id| {
            let account_id = config
                .channels
                .get(id)
                .and_then(|channel| channel.account_hint.clone())
                .unwrap_or_else(|| format!("{id}-main"));
            (id.clone(), json!(account_id))
        })
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
        "secretProvider": config.secrets.provider.as_str(),
        "secretProviderDetail": {
            "envPrefix": config.secrets.env_prefix,
            "onePasswordVault": config.secrets.one_password_vault,
            "varlockProfile": config.secrets.varlock_profile,
        },
        "channels": channels,
    });

    let mut response = snapshot.as_object().cloned().unwrap_or_default();
    response.insert("channelsSnapshot".to_owned(), snapshot);
    response.insert("invocationSurface".to_owned(), invocation_surface);
    Ok(Value::Object(response))
}

pub fn send_text(
    state_root: impl AsRef<Path>,
    channel: &str,
    target: &str,
    text: &str,
) -> Result<Value, String> {
    let config = config::load_document(&state_root)?.gateway;
    let channel_config = config
        .channels
        .get(channel)
        .ok_or_else(|| format!("unknown channel: {channel}"))?;
    if !channel_config.enabled {
        return Err(format!("channel is not enabled: {channel}"));
    }
    let secret_ref = channel_config
        .secret_ref
        .as_deref()
        .ok_or_else(|| format!("channel has no secretRef: {channel}"))?;
    let secret = SecretResolver::new(config.secrets.clone()).resolve(secret_ref)?;
    let request = channel_adapters::build_send_text_request(
        channel,
        &secret,
        target,
        text,
        channel_config.workspace.as_deref(),
    )?;
    let response = channel_adapters::execute_request(request)?;
    Ok(json!({
        "ok": true,
        "channel": channel,
        "target": target,
        "response": response,
    }))
}

pub fn list_files(
    state_root: impl AsRef<Path>,
    channel: &str,
    page_size: u32,
) -> Result<Value, String> {
    if channel != "google-drive" {
        return Err(format!("channel does not support file listing: {channel}"));
    }
    let config = config::load_document(&state_root)?.gateway;
    let channel_config = config
        .channels
        .get(channel)
        .ok_or_else(|| format!("unknown channel: {channel}"))?;
    if !channel_config.enabled {
        return Err(format!("channel is not enabled: {channel}"));
    }
    let secret_ref = channel_config
        .secret_ref
        .as_deref()
        .ok_or_else(|| format!("channel has no secretRef: {channel}"))?;
    let secret = SecretResolver::new(config.secrets.clone()).resolve(secret_ref)?;
    let request = channel_adapters::build_google_drive_list_files_request(&secret, page_size)?;
    let response = channel_adapters::execute_request(request)?;
    Ok(json!({
        "ok": true,
        "channel": channel,
        "response": response,
    }))
}

fn adapter_state(channel_id: &str) -> Value {
    let Some(spec) = channel_adapters::adapter_spec(channel_id) else {
        return json!({
            "available": false,
            "operations": [],
        });
    };
    let operations = spec
        .operations
        .iter()
        .map(|operation| match operation {
            ChannelOperation::SendText => "send-text",
            ChannelOperation::ListFiles => "list-files",
        })
        .collect::<Vec<_>>();
    json!({
        "available": true,
        "coordinateOwner": spec.coordinate_owner,
        "accountField": spec.account_field,
        "secretKind": spec.secret_kind,
        "operations": operations,
    })
}

fn secret_state(
    channel_id: &str,
    channel_config: Option<&ChannelConfig>,
    secrets: &config::SecretsConfig,
    resolver: &SecretResolver,
) -> Value {
    let Some(secret_ref) = channel_config.and_then(|channel| channel.secret_ref.as_deref()) else {
        return json!({
            "provider": secrets.provider.as_str(),
            "configured": false,
            "ref": Value::Null,
            "resolved": false,
            "status": "missing",
        });
    };
    let status = resolver.status(secret_ref);
    let (status_label, resolved, diagnostic) = match status {
        SecretStatus::Resolved => ("resolved", true, None),
        SecretStatus::Missing => ("missing", false, None),
        SecretStatus::Unavailable { diagnostic } => ("unavailable", false, Some(diagnostic)),
        SecretStatus::Error { diagnostic } => ("error", false, Some(diagnostic)),
    };
    json!({
        "provider": secrets.provider.as_str(),
        "configured": true,
        "ref": secret_ref,
        "resolved": resolved,
        "status": status_label,
        "diagnostic": diagnostic,
        "channel": channel_id,
    })
}

fn token_source(
    connected: bool,
    channel_config: Option<&ChannelConfig>,
    secrets: &config::SecretsConfig,
) -> &'static str {
    if connected {
        "gateway"
    } else if channel_config
        .and_then(|channel| channel.secret_ref.as_ref())
        .is_some()
    {
        secrets.provider.as_str()
    } else {
        "none"
    }
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
