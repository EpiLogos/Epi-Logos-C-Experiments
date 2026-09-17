use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use epi_s3_gateway_contract::{
    HarnessTurnEvent, OrchestrationTrace, VakAddress, ORCHESTRATION_TRACE_KIND,
};

use super::session_store::slug;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TranscriptEntry {
    pub kind: String,
    pub role: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub harness_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub event: Option<HarnessTurnEvent>,
    /// The deterministic unit a code-mode orchestration produces (50.T50.14).
    ///
    /// Additive and defaulted, so every transcript written before this field
    /// existed still parses — `read_entries` fails the whole file on one bad
    /// line, so a non-defaulted field here would orphan live sessions.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub orchestration_trace: Option<OrchestrationTrace>,
    pub timestamp_ms: u128,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HarnessTurnTranscriptRecord {
    pub harness_id: String,
    pub vak_address: VakAddress,
    pub run_id: String,
    pub event: HarnessTurnEvent,
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
            harness_id: None,
            vak_address: None,
            event: None,
            orchestration_trace: None,
            timestamp_ms: now_ms()?,
        },
    )
}

pub fn append_harness_turn_event(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    record: HarnessTurnTranscriptRecord,
) -> Result<(), String> {
    append_entry(
        gate_root,
        session_key,
        TranscriptEntry {
            kind: "harness_turn_event".to_owned(),
            role: "harness".to_owned(),
            message: event_message(&record.event),
            run_id: Some(record.run_id),
            harness_id: Some(record.harness_id),
            vak_address: Some(record.vak_address),
            event: Some(record.event),
            orchestration_trace: None,
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
            harness_id: None,
            vak_address: None,
            event: None,
            orchestration_trace: None,
            timestamp_ms: now_ms()?,
        },
    )
}

/// Append a completed orchestration's deterministic trace (50.T50.14).
///
/// Written into the SAME session transcript everything else scores from, under
/// its own `kind`, because the point is that the replacement unit lands where
/// the staircase used to — `aeon_eval` reads one file, not two.
pub fn append_orchestration_trace(
    gate_root: impl AsRef<Path>,
    session_key: &str,
    trace: OrchestrationTrace,
    vak_address: Option<VakAddress>,
) -> Result<(), String> {
    let run_id = trace.run_id.clone();
    append_entry(
        gate_root,
        session_key,
        TranscriptEntry {
            kind: ORCHESTRATION_TRACE_KIND.to_owned(),
            role: "orchestration".to_owned(),
            // Human-legible summary only; every reader takes the structured
            // field, never this string.
            message: format!(
                "{} ops over score {} ({})",
                trace.ops.len(),
                trace.score_id,
                &trace.score_hash[..trace.score_hash.len().min(12)]
            ),
            run_id: Some(run_id),
            harness_id: None,
            vak_address,
            event: None,
            orchestration_trace: Some(trace),
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

fn event_message(event: &HarnessTurnEvent) -> String {
    match event {
        HarnessTurnEvent::TextChunk { text } => text.clone(),
        HarnessTurnEvent::ReasoningChunk { text } => text.clone(),
        HarnessTurnEvent::ToolCallRequested { call_id, name, .. } => {
            format!("tool call requested {name} ({call_id})")
        }
        HarnessTurnEvent::ToolCallInProgress { call_id, name } => {
            format!("tool call in progress {name} ({call_id})")
        }
        HarnessTurnEvent::ToolCallObserved {
            call_id,
            name,
            status,
            ..
        } => format!("tool call observed {name} ({call_id}) {status:?}"),
        HarnessTurnEvent::TurnComplete { text, .. } => text.clone(),
        HarnessTurnEvent::TurnCancelled {
            reason,
            partial_text,
        } => format!("turn cancelled {reason}: {partial_text}"),
        HarnessTurnEvent::ContextWindowExceeded {
            max_tokens,
            actual_tokens,
        } => format!("context window exceeded {actual_tokens}/{max_tokens} tokens"),
        HarnessTurnEvent::HarnessError {
            message,
            code,
            retryable,
        } => format!("harness error {code} retryable={retryable}: {message}"),
    }
}
