use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use super::sessions::slug;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatEntry {
    pub kind: String,
    pub role: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_id: Option<String>,
    pub timestamp_ms: u128,
}

pub fn transcript_path(gate_root: impl AsRef<Path>, session_key: &str) -> PathBuf {
    gate_root
        .as_ref()
        .join("transcripts")
        .join(format!("{}.json", slug(session_key)))
}

pub fn send_message(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    message: &str,
) -> Result<String, String> {
    let run_id = Uuid::new_v4().to_string();
    append_entry(
        gate_root,
        session_key,
        ChatEntry {
            kind: "message".to_owned(),
            role: "user".to_owned(),
            message: message.to_owned(),
            run_id: Some(run_id.clone()),
            timestamp_ms: now_ms()?,
        },
    )?;
    Ok(run_id)
}

pub fn inject_message(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    role: &str,
    message: &str,
) -> Result<(), String> {
    append_entry(
        gate_root,
        session_key,
        ChatEntry {
            kind: "message".to_owned(),
            role: role.to_owned(),
            message: message.to_owned(),
            run_id: None,
            timestamp_ms: now_ms()?,
        },
    )
}

pub fn abort_run(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    run_id: &str,
) -> Result<(), String> {
    append_entry(
        gate_root,
        session_key,
        ChatEntry {
            kind: "abort".to_owned(),
            role: "system".to_owned(),
            message: format!("aborted {run_id}"),
            run_id: Some(run_id.to_owned()),
            timestamp_ms: now_ms()?,
        },
    )
}

pub fn history(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Vec<ChatEntry>, String> {
    read_entries(gate_root, session_key)
}

pub fn history_response(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Value, String> {
    let items = read_entries(gate_root, session_key)?;
    let messages = items
        .iter()
        .filter(|entry| entry.kind == "message")
        .map(|entry| {
            json!({
                "role": entry.role,
                "content": [{"type":"text","text": entry.message}],
                "timestamp": entry.timestamp_ms as u64,
                "runId": entry.run_id,
            })
        })
        .collect::<Vec<_>>();

    Ok(json!({
        "messages": messages,
        "items": items,
        "thinkingLevel": Value::Null,
    }))
}

pub fn preview(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Value, String> {
    let items = read_entries(gate_root, session_key)?;
    let last_message = items.last().map(|entry| entry.message.clone());
    Ok(json!({
        "messageCount": items.len(),
        "lastMessage": last_message,
    }))
}

pub fn reset(gate_root: impl AsRef<Path>, session_key: &str) -> Result<(), String> {
    write_entries(gate_root, session_key, &[])
}

pub fn compact(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Value, String> {
    let items = read_entries(gate_root, session_key)?;
    Ok(json!({
        "compacted": true,
        "messageCount": items.len(),
    }))
}

fn append_entry(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    entry: ChatEntry,
) -> Result<(), String> {
    let mut items = read_entries(&gate_root, session_key)?;
    items.push(entry);
    write_entries(gate_root, session_key, &items)
}

fn read_entries(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Vec<ChatEntry>, String> {
    let path = transcript_path(gate_root, session_key);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn write_entries(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    items: &[ChatEntry],
) -> Result<(), String> {
    let path = transcript_path(gate_root, session_key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let payload = serde_json::to_string(items).map_err(|err| err.to_string())?;
    fs::write(path, payload).map_err(|err| err.to_string())
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
