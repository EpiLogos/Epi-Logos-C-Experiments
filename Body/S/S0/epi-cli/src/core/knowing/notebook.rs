use std::path::PathBuf;
use std::process::Command;
use std::time::{Duration, Instant};

use super::types::{
    LatestSnapshotFacet, NotebookPulseFacet, RelationalFieldFacet, VimarsaFieldFacet,
};

/// Default timeout for NotebookLM queries.
const NOTEBOOK_TIMEOUT: Duration = Duration::from_millis(2500);

pub fn build_notebook_pulse(coord: &str) -> NotebookPulseFacet {
    let binary = notebooklm_path();
    if !binary.exists() {
        return NotebookPulseFacet {
            source: "notebook-unavailable".to_string(),
            text: Some(format!("NotebookLM unavailable at {}", binary.display())),
        };
    }

    let prompt = format!(
        "Provide a tight 2 sentence snapshot for coordinate {} in the Epi-Logos system.",
        coord
    );
    let mut child = match Command::new(&binary)
        .args(["ask", &prompt])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
    {
        Ok(child) => child,
        Err(error) => {
            return NotebookPulseFacet {
                source: "notebook-error".to_string(),
                text: Some(format!("Failed to run NotebookLM: {}", error)),
            };
        }
    };

    let start = Instant::now();
    let output = loop {
        if start.elapsed() >= NOTEBOOK_TIMEOUT {
            let _ = child.kill();
            let _ = child.wait();
            return NotebookPulseFacet {
                source: "notebook-timeout".to_string(),
                text: Some("NotebookLM timed out".to_string()),
            };
        }
        match child.try_wait() {
            Ok(Some(_status)) => break child.wait_with_output(),
            Ok(None) => std::thread::sleep(Duration::from_millis(25)),
            Err(e) => {
                return NotebookPulseFacet {
                    source: "notebook-error".to_string(),
                    text: Some(format!("Failed to wait for NotebookLM: {}", e)),
                };
            }
        }
    };

    match output {
        Ok(output) if output.status.success() => {
            let text = String::from_utf8_lossy(&output.stdout);
            let condensed = text
                .lines()
                .map(str::trim)
                .find(|line| !line.is_empty())
                .unwrap_or("NotebookLM returned no text.")
                .chars()
                .take(280)
                .collect::<String>();
            NotebookPulseFacet {
                source: "notebook".to_string(),
                text: Some(condensed),
            }
        }
        Ok(output) => NotebookPulseFacet {
            source: "notebook-error".to_string(),
            text: Some({
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                if stderr.is_empty() {
                    "NotebookLM query exited unsuccessfully".to_string()
                } else {
                    stderr
                }
            }),
        },
        Err(error) => NotebookPulseFacet {
            source: "notebook-error".to_string(),
            text: Some(format!("Failed to collect NotebookLM output: {}", error)),
        },
    }
}

pub fn synthesize_latest_snapshot(
    relational_field: &RelationalFieldFacet,
    vimarsa_field: &VimarsaFieldFacet,
    notebook_pulse: &NotebookPulseFacet,
) -> LatestSnapshotFacet {
    let mut parts = Vec::new();
    if let Some(summary) = &relational_field.summary {
        parts.push(format!("Graph: {}", summary));
    }
    if let Some(summary) = &vimarsa_field.summary {
        parts.push(format!("Vimarsa: {}", summary));
    }
    if let Some(text) = &notebook_pulse.text {
        parts.push(format!("Notebook: {}", text));
    }

    LatestSnapshotFacet {
        source: "synthesized".to_string(),
        text: Some(parts.join(" | ")),
    }
}

/// Resolve the notebooklm venv binary.
///
/// Search order (mirrors vimarsa.rs pattern):
///   1. `$EPI_NOTEBOOKLM_BIN`                              (explicit override)
///   2. `<exe_dir>/../scripts/notebooklm/.venv/bin/notebooklm` (installed layout)
///   3. `CARGO_MANIFEST_DIR/scripts/notebooklm/.venv/bin/notebooklm` (dev layout)
///   4. `~/.epi-claw/workspace/skills/notebooklm/.venv/bin/notebooklm` (original fallback)
fn notebooklm_path() -> PathBuf {
    // 1. Explicit env override
    if let Ok(path) = std::env::var("EPI_NOTEBOOKLM_BIN") {
        let pb = PathBuf::from(path);
        if pb.exists() {
            return pb;
        }
    }

    let venv_rel = std::path::Path::new("scripts")
        .join("notebooklm")
        .join(".venv")
        .join("bin")
        .join("notebooklm");

    // 2. Relative to running binary (installed layout: bin/../scripts/...)
    if let Ok(exe) = std::env::current_exe() {
        if let Some(bin_dir) = exe.parent() {
            let candidate = bin_dir.join("..").join(&venv_rel);
            if candidate.exists() {
                return candidate;
            }
        }
    }

    // 3. Cargo workspace dev path (baked at compile time)
    let manifest_candidate = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(&venv_rel);
    if manifest_candidate.exists() {
        return manifest_candidate;
    }

    // 4. Original epi-claw location (fallback)
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".epi-claw")
        .join("workspace")
        .join("skills")
        .join("notebooklm")
        .join(".venv")
        .join("bin")
        .join("notebooklm")
}
