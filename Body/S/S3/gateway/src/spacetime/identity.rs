use std::path::Path;

use serde_json::Value;
use sha2::{Digest, Sha256};

// shared helpers (lifted from S0)
// =============================================================================

pub(crate) fn row_string(row: &Value, snake: &str, camel: &str, fallback: &str) -> String {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_str)
        .unwrap_or(fallback)
        .to_owned()
}

pub(crate) fn row_bool(row: &Value, snake: &str, camel: &str, fallback: bool) -> bool {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_bool)
        .unwrap_or(fallback)
}

pub(crate) fn row_u64(row: &Value, snake: &str, camel: &str, fallback: u64) -> u64 {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_u64)
        .unwrap_or(fallback)
}

pub(crate) fn sql_string(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}

pub(crate) fn session_id_from_now_path(path: &str) -> Option<String> {
    let parts = path.split('/').collect::<Vec<_>>();
    let empty_idx = parts.iter().position(|part| *part == "Empty")?;
    if parts.get(empty_idx + 1).copied() != Some("Present") {
        return None;
    }
    parts.get(empty_idx + 3).map(|value| (*value).to_owned())
}

pub(crate) fn optional_env(key: &str) -> Option<String> {
    std::env::var(key)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

pub(crate) fn workspace_root_hash(state_root: &Path) -> String {
    let workspace = optional_env("EPI_REPO_ROOT")
        .or_else(|| {
            std::env::current_dir()
                .ok()
                .map(|path| path.display().to_string())
        })
        .unwrap_or_else(|| state_root.display().to_string());
    let mut hasher = Sha256::new();
    hasher.update(workspace.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn agent_instance_id(gateway_id: &str, agent_id: &str, session_id: &str) -> String {
    format!("{gateway_id}:{agent_id}:{session_id}")
}

pub fn global_temporal_surface_key(
    installation_id: &str,
    gateway_id: &str,
    session_key: &str,
) -> String {
    format!("{installation_id}:{gateway_id}:{session_key}")
}

pub fn redis_global_context_key(installation_id: &str, gateway_id: &str, day_id: &str) -> String {
    format!("s3:gateway:temporal:global:{installation_id}:{gateway_id}:day:{day_id}")
}

pub fn day_wikilink(day_id: &str) -> String {
    if day_id == "unknown-day" {
        String::new()
    } else {
        format!("[[{day_id}]]")
    }
}

pub fn capability_surface_hash(agent_id: &str, session_key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(agent_id.as_bytes());
    hasher.update(b":");
    hasher.update(session_key.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn agent_kind(agent_id: &str) -> String {
    match agent_id {
        "epii" => "epii",
        "anima" => "anima",
        value if value.starts_with("subagent:") => "subagent",
        _ => "pi-agent",
    }
    .to_owned()
}

pub fn string_at<'a>(value: &'a Value, pointer: &str, fallback: &'a str) -> &'a str {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .unwrap_or(fallback)
}

pub fn kairos_snapshot_id(context: &Value) -> String {
    let day_id = string_at(context, "/day/dayId", "unknown-day");
    let session_id = string_at(context, "/session/sessionId", "unknown-session");
    format!("kairos-{day_id}-{session_id}")
}

pub(crate) fn require_nonempty(value: &str, field: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} must not be empty"));
    }
    Ok(())
}

/// 03.T4: derive the canonical quintessence_hash. The hash is a BLAKE3
/// indexing fingerprint over canonical quaternionic bytes + caps — NOT the
/// identity itself. Hex-encoded for stable transport over JSON RPC.
pub fn quintessence_hash_blake3(canonical_quaternionic_bytes: &[u8]) -> String {
    blake3::hash(canonical_quaternionic_bytes)
        .to_hex()
        .to_string()
}

/// 03.T4: derive a public-safe `identity_handle` from raw identity bytes via
/// BLAKE3. The handle is a one-way fingerprint suitable for use as the
/// primary key of `pratibimba_presence` — the raw identity NEVER leaves the
/// caller's process.
pub fn identity_handle_blake3(canonical_identity_bytes: &[u8]) -> String {
    blake3::hash(canonical_identity_bytes).to_hex().to_string()
}

// =============================================================================
