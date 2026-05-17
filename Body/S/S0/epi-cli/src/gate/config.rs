use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use super::parity::DEFAULT_GATEWAY_PORT;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayConfig {
    pub port: u16,
    pub bind_mode: BindMode,
    pub auth_mode: String,
    pub tls_enabled: bool,
    #[serde(default)]
    pub secrets: SecretsConfig,
    #[serde(default = "default_channel_configs")]
    pub channels: BTreeMap<String, ChannelConfig>,
    pub state_root: Option<String>,
    pub bootstrap_root: Option<String>,
    pub workspace_root: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayConfigDocument {
    pub version: String,
    pub gateway: GatewayConfig,
}

impl GatewayConfig {
    pub fn with_port(port: u16) -> Self {
        Self {
            port,
            ..Self::default()
        }
    }
}

impl Default for GatewayConfig {
    fn default() -> Self {
        Self {
            port: DEFAULT_GATEWAY_PORT,
            bind_mode: BindMode::Loopback,
            auth_mode: "local".to_owned(),
            tls_enabled: false,
            secrets: SecretsConfig::default(),
            channels: default_channel_configs(),
            state_root: None,
            bootstrap_root: None,
            workspace_root: None,
        }
    }
}

impl Default for GatewayConfigDocument {
    fn default() -> Self {
        Self {
            version: "v1".to_owned(),
            gateway: GatewayConfig::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BindMode {
    Auto,
    Lan,
    Loopback,
    Custom,
    Tailnet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretsConfig {
    #[serde(default)]
    pub provider: SecretProvider,
    #[serde(default = "default_env_prefix")]
    pub env_prefix: String,
    #[serde(default)]
    pub one_password_vault: Option<String>,
    #[serde(default)]
    pub varlock_profile: Option<String>,
}

impl Default for SecretsConfig {
    fn default() -> Self {
        Self {
            provider: SecretProvider::Env,
            env_prefix: "EPILOGOS_".to_owned(),
            one_password_vault: None,
            varlock_profile: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SecretProvider {
    Env,
    #[serde(rename = "1password")]
    OnePassword,
    Varlock,
}

impl Default for SecretProvider {
    fn default() -> Self {
        Self::Env
    }
}

fn default_env_prefix() -> String {
    "EPILOGOS_".to_owned()
}

impl SecretProvider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Env => "env",
            Self::OnePassword => "1password",
            Self::Varlock => "varlock",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub secret_ref: Option<String>,
    #[serde(default)]
    pub account_hint: Option<String>,
    #[serde(default)]
    pub workspace: Option<String>,
}

impl ChannelConfig {
    fn disabled(secret_ref: impl Into<String>) -> Self {
        Self {
            enabled: false,
            secret_ref: Some(secret_ref.into()),
            account_hint: None,
            workspace: None,
        }
    }
}

pub fn default_channel_configs() -> BTreeMap<String, ChannelConfig> {
    [
        ("telegram", "TELEGRAM_BOT_TOKEN"),
        ("whatsapp", "WHATSAPP_ACCESS_TOKEN"),
        ("slack", "SLACK_BOT_TOKEN"),
        ("discord", "DISCORD_BOT_TOKEN"),
        ("google-drive", "GOOGLE_DRIVE_CREDENTIALS_JSON"),
    ]
    .into_iter()
    .map(|(id, secret)| (id.to_owned(), ChannelConfig::disabled(secret)))
    .collect()
}

pub fn render_default(json_output: bool) -> Result<String, String> {
    let config = GatewayConfigDocument::default();
    if json_output {
        serde_json::to_string_pretty(&config).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "version: {}\nport: {}\nbind-mode: {}\nauth-mode: {}\ntls-enabled: {}",
            config.version,
            config.gateway.port,
            config.gateway.bind_mode.as_str(),
            config.gateway.auth_mode,
            config.gateway.tls_enabled
        ))
    }
}

pub fn config_value(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let doc = load_document(state_root)?;
    config_snapshot_from_doc(doc)
}

pub fn schema_value() -> Value {
    let domains = json!([
        {
            "key": "gateway",
            "fields": [
                {"key": "gateway.port", "type": "u16"},
                {"key": "gateway.bindMode", "type": "enum"},
                {"key": "gateway.authMode", "type": "string"},
                {"key": "gateway.tlsEnabled", "type": "bool"},
                {"key": "gateway.secrets.provider", "type": "enum"},
                {"key": "gateway.secrets.envPrefix", "type": "string"},
                {"key": "gateway.secrets.onePasswordVault", "type": "string"},
                {"key": "gateway.secrets.varlockProfile", "type": "string"},
                {"key": "gateway.bootstrapRoot", "type": "path"},
                {"key": "gateway.workspaceRoot", "type": "path"}
            ]
        },
        {
            "key": "channels",
            "fields": default_channel_configs().keys().flat_map(|channel| {
                [
                    json!({"key": format!("gateway.channels.{channel}.enabled"), "type": "bool"}),
                    json!({"key": format!("gateway.channels.{channel}.secretRef"), "type": "secret-ref"}),
                    json!({"key": format!("gateway.channels.{channel}.accountHint"), "type": "string"}),
                    json!({"key": format!("gateway.channels.{channel}.workspace"), "type": "string"})
                ]
            }).collect::<Vec<_>>()
        }
    ]);
    let ui_hints = json!({
        "gateway.port": {"label":"Port","group":"Gateway","order":1},
        "gateway.bindMode": {"label":"Bind Mode","group":"Gateway","order":2},
        "gateway.authMode": {"label":"Auth Mode","group":"Gateway","order":3},
        "gateway.tlsEnabled": {"label":"TLS Enabled","group":"Gateway","order":4},
        "gateway.secrets.provider": {"label":"Secret Provider","group":"Secrets","order":10},
        "gateway.secrets.envPrefix": {"label":"Environment Prefix","group":"Secrets","order":11},
        "gateway.secrets.onePasswordVault": {"label":"1Password Vault","group":"Secrets","order":12},
        "gateway.secrets.varlockProfile": {"label":"Varlock Profile","group":"Secrets","order":13},
        "gateway.channels.telegram.enabled": {"label":"Telegram Enabled","group":"Channels","order":20},
        "gateway.channels.whatsapp.enabled": {"label":"WhatsApp Enabled","group":"Channels","order":21},
        "gateway.channels.slack.enabled": {"label":"Slack Enabled","group":"Channels","order":22},
        "gateway.channels.discord.enabled": {"label":"Discord Enabled","group":"Channels","order":23},
        "gateway.channels.google-drive.enabled": {"label":"Google Drive Enabled","group":"Channels","order":24}
    });
    json!({
        "domains": domains,
        "schema": {
            "domains": domains,
        },
        "uiHints": ui_hints,
        "version": "v1",
        "generatedAt": timestamp_iso(),
    })
}

pub fn set_value(state_root: impl AsRef<Path>, key: &str, value: &Value) -> Result<Value, String> {
    let mut doc = load_document(&state_root)?;
    apply_field(&mut doc.gateway, key, value)?;
    bump_version(&mut doc);
    save_document(state_root, &doc)?;
    config_snapshot_from_doc(doc)
}

pub fn patch_value(state_root: impl AsRef<Path>, patch: &Value) -> Result<Value, String> {
    let mut doc = load_document(&state_root)?;
    apply_patch_to_doc(&mut doc, patch)?;
    bump_version(&mut doc);
    save_document(state_root, &doc)?;
    config_snapshot_from_doc(doc)
}

pub fn apply_value(state_root: impl AsRef<Path>, patch: &Value) -> Result<Value, String> {
    let mut doc = load_document(&state_root)?;
    apply_patch_to_doc(&mut doc, patch)?;
    bump_version(&mut doc);
    save_document(state_root, &doc)?;
    let snapshot = config_snapshot_from_doc(doc.clone())?;
    Ok(json!({
        "ok": true,
        "version": doc.version,
        "gateway": doc.gateway,
        "raw": snapshot["raw"],
        "hash": snapshot["hash"],
    }))
}

pub fn load_document(state_root: impl AsRef<Path>) -> Result<GatewayConfigDocument, String> {
    let path = config_path(state_root);
    if !path.exists() {
        return Ok(GatewayConfigDocument::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

pub fn save_document(
    state_root: impl AsRef<Path>,
    doc: &GatewayConfigDocument,
) -> Result<(), String> {
    let path = config_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(doc).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

pub fn gate_root_from_env() -> Result<PathBuf, String> {
    if let Some(root) = std::env::var_os("EPI_GATE_STATE_ROOT") {
        return Ok(PathBuf::from(root));
    }
    let home = dirs::home_dir().ok_or_else(|| "HOME is not configured".to_owned())?;
    Ok(home.join(".epi").join("gate"))
}

pub fn config_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("config.json")
}

impl BindMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Auto => "auto",
            Self::Lan => "lan",
            Self::Loopback => "loopback",
            Self::Custom => "custom",
            Self::Tailnet => "tailnet",
        }
    }
}

fn apply_patch_to_doc(doc: &mut GatewayConfigDocument, patch: &Value) -> Result<(), String> {
    let gateway = patch
        .get("gateway")
        .cloned()
        .unwrap_or_else(|| patch.clone());
    let gateway = gateway
        .as_object()
        .ok_or_else(|| "config patch must be an object".to_owned())?;

    for (key, value) in gateway {
        match key.as_str() {
            "port" => {
                doc.gateway.port = value
                    .as_u64()
                    .ok_or_else(|| "gateway.port must be a number".to_owned())?
                    as u16;
            }
            "bindMode" => {
                doc.gateway.bind_mode = parse_bind_mode(value)?;
            }
            "authMode" => {
                doc.gateway.auth_mode = value
                    .as_str()
                    .ok_or_else(|| "gateway.authMode must be a string".to_owned())?
                    .to_owned();
            }
            "tlsEnabled" => {
                doc.gateway.tls_enabled = value
                    .as_bool()
                    .ok_or_else(|| "gateway.tlsEnabled must be a bool".to_owned())?;
            }
            "secrets" => apply_secrets_patch(&mut doc.gateway.secrets, value)?,
            "channels" => apply_channels_patch(&mut doc.gateway.channels, value)?,
            "bootstrapRoot" => {
                doc.gateway.bootstrap_root = value.as_str().map(str::to_owned);
            }
            "workspaceRoot" => {
                doc.gateway.workspace_root = value.as_str().map(str::to_owned);
            }
            other => return Err(format!("unsupported config patch key: {other}")),
        }
    }

    Ok(())
}

fn apply_field(config: &mut GatewayConfig, key: &str, value: &Value) -> Result<(), String> {
    match key {
        "gateway.port" => {
            config.port = value
                .as_u64()
                .ok_or_else(|| "gateway.port must be a number".to_owned())?
                as u16;
        }
        "gateway.bindMode" => {
            config.bind_mode = parse_bind_mode(value)?;
        }
        "gateway.authMode" => {
            config.auth_mode = value
                .as_str()
                .ok_or_else(|| "gateway.authMode must be a string".to_owned())?
                .to_owned();
        }
        "gateway.tlsEnabled" => {
            config.tls_enabled = value
                .as_bool()
                .ok_or_else(|| "gateway.tlsEnabled must be a bool".to_owned())?;
        }
        "gateway.secrets.provider" => {
            config.secrets.provider = parse_secret_provider(value)?;
        }
        "gateway.secrets.envPrefix" => {
            config.secrets.env_prefix = value
                .as_str()
                .ok_or_else(|| "gateway.secrets.envPrefix must be a string".to_owned())?
                .to_owned();
        }
        "gateway.secrets.onePasswordVault" => {
            config.secrets.one_password_vault = value.as_str().map(str::to_owned);
        }
        "gateway.secrets.varlockProfile" => {
            config.secrets.varlock_profile = value.as_str().map(str::to_owned);
        }
        key if key.starts_with("gateway.channels.") => {
            apply_channel_field(&mut config.channels, key, value)?;
        }
        "gateway.bootstrapRoot" => {
            config.bootstrap_root = value.as_str().map(str::to_owned);
        }
        "gateway.workspaceRoot" => {
            config.workspace_root = value.as_str().map(str::to_owned);
        }
        other => return Err(format!("unsupported config key: {other}")),
    }

    Ok(())
}

fn apply_secrets_patch(config: &mut SecretsConfig, value: &Value) -> Result<(), String> {
    let object = value
        .as_object()
        .ok_or_else(|| "gateway.secrets must be an object".to_owned())?;
    for (key, value) in object {
        match key.as_str() {
            "provider" => config.provider = parse_secret_provider(value)?,
            "envPrefix" => {
                config.env_prefix = value
                    .as_str()
                    .ok_or_else(|| "gateway.secrets.envPrefix must be a string".to_owned())?
                    .to_owned();
            }
            "onePasswordVault" => config.one_password_vault = value.as_str().map(str::to_owned),
            "varlockProfile" => config.varlock_profile = value.as_str().map(str::to_owned),
            other => return Err(format!("unsupported secrets patch key: {other}")),
        }
    }
    Ok(())
}

fn apply_channels_patch(
    channels: &mut BTreeMap<String, ChannelConfig>,
    value: &Value,
) -> Result<(), String> {
    let object = value
        .as_object()
        .ok_or_else(|| "gateway.channels must be an object".to_owned())?;
    for (channel, value) in object {
        let channel_object = value
            .as_object()
            .ok_or_else(|| format!("gateway.channels.{channel} must be an object"))?;
        for (key, field_value) in channel_object {
            apply_channel_leaf(channels, channel, key, field_value)?;
        }
    }
    Ok(())
}

fn apply_channel_field(
    channels: &mut BTreeMap<String, ChannelConfig>,
    key: &str,
    value: &Value,
) -> Result<(), String> {
    let rest = key
        .strip_prefix("gateway.channels.")
        .ok_or_else(|| format!("unsupported channel key: {key}"))?;
    let Some((channel, field)) = rest.rsplit_once('.') else {
        return Err(format!(
            "channel key must be gateway.channels.<id>.<field>: {key}"
        ));
    };
    apply_channel_leaf(channels, channel, field, value)
}

fn apply_channel_leaf(
    channels: &mut BTreeMap<String, ChannelConfig>,
    channel: &str,
    field: &str,
    value: &Value,
) -> Result<(), String> {
    let record = channels
        .entry(channel.to_owned())
        .or_insert_with(|| ChannelConfig::disabled(default_secret_ref(channel)));
    match field {
        "enabled" => {
            record.enabled = value
                .as_bool()
                .ok_or_else(|| format!("gateway.channels.{channel}.enabled must be a bool"))?;
        }
        "secretRef" => record.secret_ref = value.as_str().map(str::to_owned),
        "accountHint" => record.account_hint = value.as_str().map(str::to_owned),
        "workspace" => record.workspace = value.as_str().map(str::to_owned),
        other => return Err(format!("unsupported channel field: {other}")),
    }
    Ok(())
}

fn default_secret_ref(channel: &str) -> String {
    format!(
        "{}_TOKEN",
        channel
            .chars()
            .map(|ch| if ch.is_ascii_alphanumeric() {
                ch.to_ascii_uppercase()
            } else {
                '_'
            })
            .collect::<String>()
    )
}

fn parse_bind_mode(value: &Value) -> Result<BindMode, String> {
    match value.as_str().unwrap_or_default() {
        "auto" => Ok(BindMode::Auto),
        "lan" => Ok(BindMode::Lan),
        "loopback" => Ok(BindMode::Loopback),
        "custom" => Ok(BindMode::Custom),
        "tailnet" => Ok(BindMode::Tailnet),
        _ => Err("gateway.bindMode must be a supported string".to_owned()),
    }
}

fn parse_secret_provider(value: &Value) -> Result<SecretProvider, String> {
    match value.as_str().unwrap_or_default() {
        "env" => Ok(SecretProvider::Env),
        "1password" | "one-password" => Ok(SecretProvider::OnePassword),
        "varlock" => Ok(SecretProvider::Varlock),
        _ => Err("gateway.secrets.provider must be env, 1password, or varlock".to_owned()),
    }
}

fn bump_version(doc: &mut GatewayConfigDocument) {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(1);
    doc.version = format!("v{stamp}");
}

fn config_snapshot_from_doc(doc: GatewayConfigDocument) -> Result<Value, String> {
    let raw = serde_json::to_string_pretty(&doc).map_err(|err| err.to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());
    let hash = hex::encode(hasher.finalize());
    let parsed = serde_json::to_value(&doc).map_err(|err| err.to_string())?;
    Ok(json!({
        "version": doc.version,
        "gateway": doc.gateway,
        "path": Value::Null,
        "exists": true,
        "raw": raw,
        "hash": hash,
        "parsed": parsed,
        "valid": true,
        "config": parsed,
        "issues": [],
    }))
}

pub fn set_raw_value(
    state_root: impl AsRef<Path>,
    raw: &str,
    _base_hash: Option<&str>,
) -> Result<Value, String> {
    let doc: GatewayConfigDocument = serde_json::from_str(raw).map_err(|err| err.to_string())?;
    save_document(&state_root, &doc)?;
    config_value(state_root)
}

pub fn apply_raw_value(
    state_root: impl AsRef<Path>,
    raw: &str,
    base_hash: Option<&str>,
) -> Result<Value, String> {
    let snapshot = set_raw_value(&state_root, raw, base_hash)?;
    Ok(json!({
        "ok": true,
        "raw": snapshot["raw"],
        "hash": snapshot["hash"],
    }))
}

fn timestamp_iso() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or_default();
    format!("{secs}")
}
