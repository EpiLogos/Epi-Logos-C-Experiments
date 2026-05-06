use chrono::Utc;
use epi_s3_gateway_contract::{ProvenanceEvent, GRAPHITI_BASE_URL, GRAPHITI_PORT};
use serde::Serialize;

/// Fire-and-forget: POST a provenance event to the Graphiti runtime adapter.
/// Spawns a detached tokio task — caller does not wait for result.
/// Silently ignores all errors because the adapter may not be running.
pub fn fire_provenance(event: ProvenanceEvent) {
    tokio::spawn(async move {
        let client = reqwest::Client::new();
        let _ = client
            .post(format!("{GRAPHITI_BASE_URL}/provenance"))
            .json(&event)
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;
    });
}

fn iso8601_now() -> String {
    Utc::now().to_rfc3339()
}

/// Build a ProvenanceEvent from a SessionRecord snapshot.
pub fn provenance_from_record(
    event_type: &str,
    session_id: &str,
    canonical_key: &str,
    channel: Option<&str>,
    day_id: Option<&str>,
    vault_now_path: Option<&str>,
) -> ProvenanceEvent {
    ProvenanceEvent {
        event_type: event_type.to_owned(),
        session_id: session_id.to_owned(),
        channel_id: canonical_key.to_owned(),
        channel_type: channel.unwrap_or("unknown").to_owned(),
        day_id: day_id.unwrap_or("").to_owned(),
        vault_now_path: vault_now_path.unwrap_or("").to_owned(),
        timestamp: iso8601_now(),
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphitiStatus {
    pub running: bool,
    pub url: String,
    pub health: Option<serde_json::Value>,
}

fn compose_file_path() -> Result<String, String> {
    let candidates = [
        std::env::var("EPILOGOS_ROOT").unwrap_or_default(),
        std::env::current_dir()
            .unwrap_or_default()
            .display()
            .to_string(),
        std::env::var("HOME")
            .map(|h| format!("{h}/Documents/Epi-Logos C Experiments"))
            .unwrap_or_default(),
    ];
    for candidate in &candidates {
        if candidate.is_empty() {
            continue;
        }
        let path = std::path::Path::new(candidate).join("docker-compose.epi-s2.yml");
        if path.exists() {
            return Ok(path.display().to_string());
        }
    }
    Err("docker-compose.epi-s2.yml not found — set EPILOGOS_ROOT env var".into())
}

pub fn start(json: bool) -> Result<String, String> {
    let compose_file = compose_file_path()?;
    // Compatibility launcher for the current HTTP adapter while Graphiti moves to native S3 runtime ownership.
    let output = std::process::Command::new("docker")
        .args([
            "compose",
            "-f",
            &compose_file,
            "up",
            "-d",
            "--build",
            "graphiti",
        ])
        .output()
        .map_err(|e| format!("docker compose failed: {e}"))?;

    if output.status.success() {
        let msg = "graphiti compatibility runtime started (epi-graphiti on port 37778)";
        if json {
            serde_json::to_string(&serde_json::json!({"ok": true, "message": msg}))
                .map_err(|e| e.to_string())
        } else {
            Ok(msg.to_string())
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

pub fn stop(json: bool) -> Result<String, String> {
    let compose_file = compose_file_path()?;
    let output = std::process::Command::new("docker")
        .args(["compose", "-f", &compose_file, "stop", "graphiti"])
        .output()
        .map_err(|e| format!("docker compose failed: {e}"))?;

    if output.status.success() {
        let msg = "graphiti compatibility runtime stopped";
        if json {
            serde_json::to_string(&serde_json::json!({"ok": true, "message": msg}))
                .map_err(|e| e.to_string())
        } else {
            Ok(msg.to_string())
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

pub async fn status(json: bool) -> Result<String, String> {
    let report = status_value().await;

    if json {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else if report.running {
        Ok(format!(
            "graphiti: running at {} (port {GRAPHITI_PORT})",
            GRAPHITI_BASE_URL
        ))
    } else {
        Ok(format!(
            "graphiti: not running (expected at port {GRAPHITI_PORT})\n  compatibility start: epi gate graphiti start"
        ))
    }
}

pub async fn status_value() -> GraphitiStatus {
    let url = format!("{GRAPHITI_BASE_URL}/health");
    let result = reqwest::Client::new()
        .get(&url)
        .timeout(std::time::Duration::from_millis(750))
        .send()
        .await;

    let (running, health) = match result {
        Ok(resp) if resp.status().is_success() => {
            let body: serde_json::Value = resp
                .json()
                .await
                .unwrap_or(serde_json::json!({"status": "ok"}));
            (true, Some(body))
        }
        _ => (false, None),
    };

    GraphitiStatus {
        running,
        url: GRAPHITI_BASE_URL.to_string(),
        health,
    }
}
