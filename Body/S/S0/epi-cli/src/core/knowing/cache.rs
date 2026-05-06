use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::PathBuf;

use crate::core::overlay;

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct SnapshotCache {
    pub version: u32,
    pub updated_at: String,
    pub coordinates: BTreeMap<String, SnapshotEntry>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct SnapshotEntry {
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_scope: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latest_snapshot: Option<String>,
    #[serde(default)]
    pub kbase_hits: Vec<KbaseHit>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notebook_pulse: Option<NotebookPulse>,
    #[serde(default)]
    pub relation_hits: Vec<RelationHit>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct KbaseHit {
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct NotebookPulse {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct RelationHit {
    pub coordinate: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relation: Option<String>,
}

pub fn snapshot_cache_path() -> PathBuf {
    overlay::overlay_paths().live_cache
}

pub fn load_snapshot_cache() -> SnapshotCache {
    let path = snapshot_cache_path();
    if !path.exists() {
        return SnapshotCache {
            version: 1,
            updated_at: String::new(),
            coordinates: BTreeMap::new(),
        };
    }

    std::fs::read_to_string(&path)
        .ok()
        .and_then(|contents| serde_json::from_str(&contents).ok())
        .unwrap_or_default()
}

pub fn save_snapshot_cache(cache: &SnapshotCache) -> Result<(), String> {
    let path = snapshot_cache_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Create dir error: {}", e))?;
    }
    let json =
        serde_json::to_string_pretty(cache).map_err(|e| format!("JSON serialize error: {}", e))?;
    std::fs::write(&path, json).map_err(|e| format!("Write error: {}", e))
}
