use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct CronState {
    #[serde(default)]
    jobs: Vec<CronJob>,
    #[serde(default)]
    runs: Vec<CronRun>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronJob {
    id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    agent_id: Option<String>,
    name: String,
    description: String,
    schedule: Value,
    enabled: bool,
    payload: Value,
    session_target: String,
    wake_mode: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    isolation: Option<Value>,
    created_at_ms: u128,
    updated_at_ms: u128,
    state: CronJobState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronJobState {
    next_run_at_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CronRun {
    job_id: String,
    ts: u128,
    status: String,
    summary: String,
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let next_wake = state
        .jobs
        .iter()
        .filter(|job| job.enabled)
        .map(|job| job.state.next_run_at_ms)
        .min();
    Ok(json!({ "enabled": true, "jobs": state.jobs.len(), "nextWakeAtMs": next_wake }))
}

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    Ok(json!({ "jobs": state.jobs }))
}

pub fn add(
    state_root: impl AsRef<Path>,
    name: &str,
    description: &str,
    agent_id: Option<&str>,
    enabled: bool,
    schedule: Value,
    session_target: &str,
    wake_mode: &str,
    payload: Value,
    isolation: Option<Value>,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let now = now_ms()?;
    let job = CronJob {
        id: Uuid::new_v4().to_string(),
        agent_id: agent_id.map(str::to_owned),
        name: name.to_owned(),
        description: description.to_owned(),
        schedule,
        enabled,
        payload,
        session_target: session_target.to_owned(),
        wake_mode: wake_mode.to_owned(),
        isolation,
        created_at_ms: now,
        updated_at_ms: now,
        state: CronJobState {
            next_run_at_ms: now + 60_000,
        },
    };
    state.jobs.push(job.clone());
    save_state(state_root, &state)?;
    Ok(json!({ "job": job }))
}

pub fn update(
    state_root: impl AsRef<Path>,
    id: &str,
    enabled: Option<bool>,
    description: Option<&str>,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let job = state
        .jobs
        .iter_mut()
        .find(|job| job.id == id)
        .ok_or_else(|| format!("cron job not found: {id}"))?;
    if let Some(enabled) = enabled {
        job.enabled = enabled;
    }
    if let Some(description) = description {
        job.description = description.to_owned();
    }
    job.updated_at_ms = now_ms()?;
    let job_value = serde_json::to_value(job.clone()).map_err(|err| err.to_string())?;
    save_state(state_root, &state)?;
    Ok(json!({ "job": job_value }))
}

pub fn run(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let job = state
        .jobs
        .iter()
        .find(|job| job.id == id)
        .cloned()
        .ok_or_else(|| format!("cron job not found: {id}"))?;
    state.runs.push(CronRun {
        job_id: id.to_owned(),
        ts: now_ms()?,
        status: "ok".to_owned(),
        summary: job.name,
    });
    save_state(state_root, &state)?;
    Ok(json!({ "ok": true, "id": id }))
}

pub fn runs(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let runs = state
        .runs
        .into_iter()
        .filter(|run| run.job_id == id)
        .collect::<Vec<_>>();
    Ok(json!({ "runs": runs, "entries": runs }))
}

pub fn remove(state_root: impl AsRef<Path>, id: &str) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.jobs.retain(|job| job.id != id);
    save_state(state_root, &state)?;
    Ok(json!({ "removed": true, "id": id }))
}

fn load_state(state_root: impl AsRef<Path>) -> Result<CronState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(CronState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &CronState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("cron.json")
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
