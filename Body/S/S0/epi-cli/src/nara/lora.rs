//! Local-only Nara LoRA command adapter.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S0-0-4 |
//! | Residency | Body/S/S0/epi-cli/src/nara/lora.rs (physically S0, actualises M4) |
//! | Position | #4 - Lived context / personal substrate |
//! | Actualises | [[M4'-SPEC]] and [[05-m4-nara-reconciliation]] tranche 5.22 |
//!
//! # Public surface
//! * `train` - executes the repository's local-only Nara training skill.
//!
//! # Does NOT own
//! * Corpus parsing, model training, checkpoint format, or E4 energy computation.

use std::path::{Path, PathBuf};
use std::process::Command;

const TRAIN_SCRIPT: &str =
    "Body/S/S4/ta-onta/S4-x/skills/nara-voice-training/scripts/train_lora.py";

pub fn train(config: &Path, dry_run: bool) -> Result<String, String> {
    let script = repo_root()?.join(TRAIN_SCRIPT);
    if !script.is_file() {
        return Err(format!(
            "Nara LoRA training skill not found: {}",
            script.display()
        ));
    }

    let python = std::env::var_os("EPI_PYTHON").unwrap_or_else(|| "python3".into());
    let mut command = Command::new(python);
    command.arg(script).arg("--config").arg(config);
    if dry_run {
        command.arg("--dry-run");
    }
    let output = command
        .output()
        .map_err(|error| format!("failed to start Nara LoRA training: {error}"))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        return Err(if stderr.is_empty() {
            format!("Nara LoRA training exited with {}", output.status)
        } else {
            stderr
        });
    }
    String::from_utf8(output.stdout)
        .map(|value| value.trim().to_owned())
        .map_err(|error| format!("Nara LoRA training emitted non-UTF-8 output: {error}"))
}

fn repo_root() -> Result<PathBuf, String> {
    if let Some(root) = std::env::var_os("EPI_REPO_ROOT") {
        let root = PathBuf::from(root);
        if root.join(TRAIN_SCRIPT).is_file() {
            return Ok(root);
        }
        return Err(format!(
            "EPI_REPO_ROOT does not contain the Nara LoRA skill: {}",
            root.display()
        ));
    }

    if let Ok(current) = std::env::current_dir() {
        if let Some(root) = current
            .ancestors()
            .find(|candidate| candidate.join(TRAIN_SCRIPT).is_file())
        {
            return Ok(root.to_path_buf());
        }
    }

    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    manifest
        .ancestors()
        .find(|candidate| candidate.join(TRAIN_SCRIPT).is_file())
        .map(Path::to_path_buf)
        .ok_or_else(|| "unable to locate repository root; set EPI_REPO_ROOT".to_owned())
}
