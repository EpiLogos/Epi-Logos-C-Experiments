use std::path::Path;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use super::transcripts;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatEntry {
    pub kind: String,
    pub role: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_id: Option<String>,
    pub timestamp_ms: u128,
}

pub fn transcript_path(
    gate_root: impl AsRef<std::path::Path>,
    session_key: &str,
) -> std::path::PathBuf {
    transcripts::transcript_path(gate_root, session_key)
}

pub fn send_message(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    message: &str,
) -> Result<String, String> {
    let run_id = Uuid::new_v4().to_string();
    transcripts::append_message(gate_root, session_key, "user", message, Some(&run_id))?;
    Ok(run_id)
}

pub fn inject_message(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    role: &str,
    message: &str,
) -> Result<(), String> {
    transcripts::append_message(gate_root, session_key, role, message, None)
}

pub fn abort_run(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    run_id: &str,
) -> Result<(), String> {
    transcripts::append_abort(gate_root, session_key, run_id)
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
    transcripts::reset(gate_root, session_key)
}

pub fn compact(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Value, String> {
    let items = read_entries(gate_root, session_key)?;
    Ok(json!({
        "compacted": true,
        "messageCount": items.len(),
    }))
}

fn read_entries(gate_root: impl AsRef<Path>, session_key: &str) -> Result<Vec<ChatEntry>, String> {
    transcripts::read_entries(gate_root, session_key).map(|items| {
        items
            .into_iter()
            .map(|entry| ChatEntry {
                kind: entry.kind,
                role: entry.role,
                message: entry.message,
                run_id: entry.run_id,
                timestamp_ms: entry.timestamp_ms,
            })
            .collect()
    })
}
