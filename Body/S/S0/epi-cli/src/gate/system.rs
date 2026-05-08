use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::graph::doctor;
use crate::sesh::session::{read_session_state, repo_root_from_env};

use super::logs;
use super::parity::DEFAULT_GATEWAY_PORT;
use super::spacetimedb_bridge;

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
    let state_root = state_root.as_ref();
    let state = load_state(state_root)?;
    let session = session_health();
    let vault = vault_health(&session);
    let graph = graph_health(state_root)?;
    let spacetimedb = spacetimedb_bridge::readiness_value(DEFAULT_GATEWAY_PORT, state_root);
    let ok = session["ok"] == Value::Bool(true)
        && vault["ok"] == Value::Bool(true)
        && graph["ok"] == Value::Bool(true);
    Ok(json!({
        "ok": ok,
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
            },
            "session": session,
            "vault": vault,
            "graph": graph,
            "spacetimedb": spacetimedb,
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

fn session_health() -> Value {
    let repo_root = repo_root_from_env();
    match read_session_state(&repo_root) {
        Ok(state) => json!({
            "ok": true,
            "workspaceRoot": repo_root.display().to_string(),
            "sessionId": state.context.session_id,
            "dayId": state.context.day_id,
            "nowPath": state.context.now_path.display().to_string(),
            "startedAt": state.context.started_at,
        }),
        Err(error) => json!({
            "ok": false,
            "workspaceRoot": repo_root.display().to_string(),
            "error": error,
        }),
    }
}

fn vault_health(session: &Value) -> Value {
    let now_path = session
        .get("nowPath")
        .and_then(Value::as_str)
        .map(PathBuf::from);
    match now_path {
        Some(now_path) => json!({
            "ok": now_path.exists(),
            "nowPath": now_path.display().to_string(),
            "present": now_path.exists(),
        }),
        None => json!({
            "ok": false,
            "error": "no active session now path",
        }),
    }
}

fn graph_health(state_root: &Path) -> Result<Value, String> {
    const GRAPH_CACHE_TTL_MS: u128 = 5_000;

    let cache_path = state_root.join("graph-health.json");
    if let Ok(cached) = load_graph_cache(&cache_path) {
        let age_ms = now_ms()?.saturating_sub(cached.checked_at_ms);
        if age_ms <= GRAPH_CACHE_TTL_MS {
            return Ok(json!({
                "ok": cached.report["ok"].as_bool().unwrap_or(false),
                "cachedAtMs": cached.checked_at_ms as u64,
                "source": "cache",
                "report": cached.report,
            }));
        }
    }

    let repo_root = repo_root_from_env();
    let report = collect_graph_report(repo_root)?;
    let checked_at_ms = now_ms()?;
    save_graph_cache(
        &cache_path,
        &CachedGraphHealth {
            checked_at_ms,
            report: report.clone(),
        },
    )?;
    Ok(json!({
        "ok": report["ok"].as_bool().unwrap_or(false),
        "cachedAtMs": checked_at_ms as u64,
        "source": "fresh",
        "report": report,
    }))
}

fn collect_graph_report(repo_root: PathBuf) -> Result<Value, String> {
    let join_result = std::thread::spawn(move || -> Result<Value, String> {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .map_err(|err| err.to_string())?;
        let report = runtime.block_on(doctor::collect_report(&repo_root));
        serde_json::to_value(report).map_err(|err| err.to_string())
    })
    .join();

    match join_result {
        Ok(result) => result,
        Err(_) => Err("graph doctor thread panicked".to_owned()),
    }
}

fn load_graph_cache(path: &Path) -> Result<CachedGraphHealth, String> {
    let body = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&body).map_err(|err| err.to_string())
}

fn save_graph_cache(path: &Path, cached: &CachedGraphHealth) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let body = serde_json::to_string_pretty(cached).map_err(|err| err.to_string())?;
    fs::write(path, body).map_err(|err| err.to_string())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CachedGraphHealth {
    checked_at_ms: u128,
    report: Value,
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
