use serde_json::{json, Map, Value};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::agent::{vak, AgentLayout};

const PLEROMA_ROOT: &str = "Body/S/S4/plugins/pleroma";
const VAK_EVALUATE_SKILL: &str = "vak-evaluate";
const ANIMA_ORCHESTRATION_SKILL: &str = "anima-orchestration";

pub fn vak_evaluate(params: &Value) -> Result<Value, String> {
    let task = required_str(params, "task")?;
    let coordinates = vak::evaluate_vak(task);
    let agent = vak::cf_to_agent(coordinates.cf.as_deref().unwrap_or(""));
    let skill_path = pleroma_skill_path(VAK_EVALUATE_SKILL)?;

    Ok(json!({
        "owner": "S4'",
        "agent": agent,
        "coordinates": coordinates,
        "capability": capability(VAK_EVALUATE_SKILL, &skill_path),
        "authority": authority(),
    }))
}

pub fn orchestrate(params: &Value) -> Result<Value, String> {
    let cf = params
        .get("cf")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .or_else(|| {
            params
                .get("task")
                .and_then(Value::as_str)
                .and_then(|task| vak::evaluate_vak(task).cf)
        })
        .ok_or_else(|| "cf or task is required".to_owned())?;

    let skill_path = pleroma_skill_path(ANIMA_ORCHESTRATION_SKILL)?;
    Ok(json!({
        "owner": "S4'",
        "agent": vak::cf_to_agent(&cf),
        "cf": cf,
        "capability": capability(ANIMA_ORCHESTRATION_SKILL, &skill_path),
        "authority": authority(),
    }))
}

pub fn agent_status(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let agent_id = optional_str(params, "agentId").unwrap_or_else(|| "anima".to_owned());
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let now_ms = current_time_ms()?;
    let uptime_ms = state_root_age_ms(state_root.as_ref(), now_ms)?;

    Ok(json!({
        "owner": "S4",
        "agentId": agent_id,
        "state": "available",
        "sessionKey": session_key,
        "dayId": current_day_id(),
        "teamComposition": constitutional_agents(),
        "csPosition": "dispatchable",
        "cfFrame": "(4.0/1-4.4/5)",
        "uptimeMs": uptime_ms,
        "observedAtMs": now_ms,
        "coordinateContext": {
            "s": "S4",
            "sPrime": "S4'",
            "runtime": state_root.as_ref().to_string_lossy(),
        },
    }))
}

pub fn agent_query(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let target_agent = required_str(params, "targetAgent")?;
    let method = required_str(params, "method")?;
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let ack_id = Uuid::new_v4().to_string();
    let timestamp_ms = current_time_ms()?;
    let query_params = params.get("params").cloned().unwrap_or_else(|| json!({}));
    let event = json!({
        "kind": "agent.query",
        "status": "accepted",
        "ackId": ack_id,
        "targetAgent": target_agent,
        "method": method,
        "sessionKey": session_key,
        "params": query_params,
        "resultChannel": format!("agent.result.{ack_id}"),
        "coordinateContext": {
            "owner": "S4",
            "sPrime": "S4'",
            "authority": "gateway-temporal-ack",
        },
        "timestampMs": timestamp_ms,
    });
    append_agent_event(state_root, &event)?;
    Ok(event)
}

pub fn agent_notify(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let target_agent = required_str(params, "targetAgent")?;
    let kind = required_str(params, "kind")?;
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let receipt_id = Uuid::new_v4().to_string();
    let payload = params.get("payload").cloned().unwrap_or_else(|| json!({}));
    let event = json!({
        "kind": kind,
        "status": "delivered",
        "receiptId": receipt_id,
        "targetAgent": target_agent,
        "sessionKey": session_key,
        "payload": payload,
        "coordinateContext": {
            "owner": "S4",
            "sPrime": "S4'",
            "delivery": "fire-and-forget",
        },
        "timestampMs": current_time_ms()?,
    });
    append_agent_event(state_root, &event)?;
    Ok(event)
}

pub fn psyche_state(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let state = read_psyche_state(state_root.as_ref(), &session_key)?;
    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "state": state,
    }))
}

pub fn psyche_update(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let patch = params
        .get("patch")
        .and_then(Value::as_object)
        .ok_or_else(|| "patch must be an object".to_owned())?;
    let mut state = read_psyche_state(state_root.as_ref(), &session_key)?;
    merge_psyche_patch(&mut state, patch);
    state["updatedAtMs"] = json!(current_time_ms()?);
    write_psyche_state(state_root.as_ref(), &session_key, &state)?;
    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "state": state,
    }))
}

pub fn permission_get(_state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let agent_id = optional_str(params, "agentId").unwrap_or_else(|| "anima".to_owned());
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    Ok(json!({
        "owner": "S4'",
        "agentId": agent_id,
        "sessionKey": session_key,
        "boundary": authority(),
        "coordinateContext": {
            "sPrime": "S4'",
            "branch": "ta-onta",
            "module": "permission-boundary",
        },
    }))
}

fn capability(skill: &str, skill_path: &Path) -> Value {
    json!({
        "plugin": "pleroma",
        "skill": skill,
        "skillPath": display_path(skill_path),
        "invocation": "bounded_pi_skill",
    })
}

pub fn authority() -> Value {
    json!({
        "mayDispatch": true,
        "mayInvokeBoundedSkill": true,
        "mayDepositToEpii": true,
        "mayResolveEpiiReview": false,
        "forbidden": [
            "resolve_epii_review_gate",
            "mutate_epii_identity_state",
            "bypass_epii_inbox"
        ],
    })
}

fn append_agent_event(state_root: impl AsRef<Path>, event: &Value) -> Result<(), String> {
    let path = state_root.as_ref().join("s4").join("agent-events.jsonl");
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|err| err.to_string())?;
    let line = serde_json::to_string(event).map_err(|err| err.to_string())?;
    writeln!(file, "{line}").map_err(|err| err.to_string())
}

fn read_psyche_state(state_root: &Path, session_key: &str) -> Result<Value, String> {
    let path = psyche_state_path(state_root, session_key);
    if !path.exists() {
        return Ok(default_psyche_state()?);
    }
    let body = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&body).map_err(|err| err.to_string())
}

fn write_psyche_state(state_root: &Path, session_key: &str, state: &Value) -> Result<(), String> {
    let path = psyche_state_path(state_root, session_key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let body = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, body).map_err(|err| err.to_string())
}

fn psyche_state_path(state_root: &Path, session_key: &str) -> PathBuf {
    state_root
        .join("s4")
        .join("psyche")
        .join(format!("{}.json", slug(session_key)))
}

fn default_psyche_state() -> Result<Value, String> {
    Ok(json!({
        "operativeNotebook": Value::Null,
        "currentTask": Value::Null,
        "currentSubtasks": [],
        "activeArtifactSet": [],
        "visibilityStance": "observable",
        "runLocalContinuity": {},
        "updatedAtMs": current_time_ms()?,
    }))
}

fn merge_psyche_patch(state: &mut Value, patch: &Map<String, Value>) {
    if let Some(state_obj) = state.as_object_mut() {
        for key in [
            "operativeNotebook",
            "currentTask",
            "currentSubtasks",
            "activeArtifactSet",
            "visibilityStance",
            "runLocalContinuity",
        ] {
            if let Some(value) = patch.get(key) {
                state_obj.insert(key.to_owned(), value.clone());
            }
        }
    }
}

fn pleroma_skill_path(skill: &str) -> Result<PathBuf, String> {
    let layout = AgentLayout::resolve(Some("anima"))?;
    let root = layout.repo_root.join(PLEROMA_ROOT);
    let skill_path = root.join("skills").join(skill).join("SKILL.md");
    if !skill_path.exists() {
        return Err(format!(
            "Pleroma skill is not installed at expected path: {}",
            skill_path.display()
        ));
    }
    Ok(skill_path)
}

fn required_str<'a>(params: &'a Value, key: &str) -> Result<&'a str, String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("{key} must be a non-empty string"))
}

fn optional_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(str::to_owned)
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn current_time_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}

fn current_day_id() -> String {
    chrono::Utc::now().format("%Y-%m-%d").to_string()
}

fn state_root_age_ms(state_root: &Path, now_ms: u128) -> Result<u128, String> {
    let metadata = fs::metadata(state_root).map_err(|err| err.to_string())?;
    let started_ms = metadata
        .modified()
        .map_err(|err| err.to_string())?
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis();
    Ok(now_ms.saturating_sub(started_ms))
}

fn constitutional_agents() -> Value {
    json!(["nous", "logos", "eros", "mythos", "psyche", "sophia"])
}

fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect()
}
