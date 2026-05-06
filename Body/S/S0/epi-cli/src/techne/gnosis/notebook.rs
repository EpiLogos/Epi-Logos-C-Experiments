use super::config::GnosisConfig;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct NotebookRecord {
    pub name: String,
    pub created_at: String,
}

pub fn create(config: &GnosisConfig, name: &str) -> Result<NotebookRecord, String> {
    let mut notebooks = list(config)?;
    if let Some(existing) = notebooks.iter().find(|record| record.name == name) {
        return Ok(existing.clone());
    }
    let record = NotebookRecord {
        name: name.to_string(),
        created_at: Utc::now().to_rfc3339(),
    };
    notebooks.push(record.clone());
    write_all(config, &notebooks)?;
    Ok(record)
}

pub fn list(config: &GnosisConfig) -> Result<Vec<NotebookRecord>, String> {
    let path = config.notebooks_path();
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    serde_json::from_str(&body).map_err(|err| format!("failed to parse {}: {err}", path.display()))
}

pub fn delete(config: &GnosisConfig, name: &str) -> Result<bool, String> {
    let mut notebooks = list(config)?;
    let before = notebooks.len();
    notebooks.retain(|record| record.name != name);
    write_all(config, &notebooks)?;
    Ok(before != notebooks.len())
}

fn write_all(config: &GnosisConfig, notebooks: &[NotebookRecord]) -> Result<(), String> {
    let path = config.notebooks_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let body = serde_json::to_string_pretty(notebooks)
        .map_err(|err| format!("failed to serialize notebooks: {err}"))?;
    fs::write(&path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))
}
