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
            auth_mode: "placeholder".to_owned(),
            tls_enabled: false,
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
                {"key": "gateway.bootstrapRoot", "type": "path"},
                {"key": "gateway.workspaceRoot", "type": "path"}
            ]
        }
    ]);
    let ui_hints = json!({
        "gateway.port": {"label":"Port","group":"Gateway","order":1},
        "gateway.bindMode": {"label":"Bind Mode","group":"Gateway","order":2},
        "gateway.authMode": {"label":"Auth Mode","group":"Gateway","order":3},
        "gateway.tlsEnabled": {"label":"TLS Enabled","group":"Gateway","order":4}
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
