use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use super::session_store::slug;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TranscriptEntry {
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
        .join(format!("{}.jsonl", slug(session_key)))
}

pub fn append_message(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    role: &str,
    message: &str,
    run_id: Option<&str>,
) -> Result<(), String> {
    append_entry(
        gate_root,
        session_key,
        TranscriptEntry {
            kind: "message".to_owned(),
            role: role.to_owned(),
            message: message.to_owned(),
            run_id: run_id.map(str::to_owned),
            timestamp_ms: now_ms()?,
        },
    )
}

pub fn append_abort(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    run_id: &str,
) -> Result<(), String> {
    append_entry(
        gate_root,
        session_key,
        TranscriptEntry {
            kind: "abort".to_owned(),
            role: "system".to_owned(),
            message: format!("aborted {run_id}"),
            run_id: Some(run_id.to_owned()),
            timestamp_ms: now_ms()?,
        },
    )
}

pub fn read_entries(
    gate_root: impl AsRef<Path>,
    session_key: &str,
) -> Result<Vec<TranscriptEntry>, String> {
    let path = transcript_path(gate_root, session_key);
    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
    let mut items = Vec::new();
    for (index, line) in content.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let entry = serde_json::from_str(line).map_err(|err| {
            format!(
                "failed to parse {} line {}: {err}",
                path.display(),
                index + 1
            )
        })?;
        items.push(entry);
    }
    Ok(items)
}

pub fn reset(gate_root: impl AsRef<Path>, session_key: &str) -> Result<(), String> {
    let path = transcript_path(gate_root, session_key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    fs::write(path, "").map_err(|err| err.to_string())
}

fn append_entry(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    entry: TranscriptEntry,
) -> Result<(), String> {
    let path = transcript_path(gate_root, session_key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let line = serde_json::to_string(&entry).map_err(|err| err.to_string())?;
    use std::io::Write;
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|err| err.to_string())?;
    writeln!(file, "{line}").map_err(|err| err.to_string())
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
