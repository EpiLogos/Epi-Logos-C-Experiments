use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct QvOverlay {
    pub version: u32,
    pub updated_at: String,
    pub coordinates: BTreeMap<String, QvEntry>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct QvEntry {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pithy: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_nature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_essence: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_formulation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_structure: Option<String>,
}

/// Returns ~/.epi-logos/qv/overlay.json, creating parent dirs if needed
pub fn overlay_path() -> PathBuf {
    let base = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join(".epi-logos").join("qv");
    std::fs::create_dir_all(&dir).ok();
    dir.join("overlay.json")
}

/// Load overlay from disk, returning empty overlay if file doesn't exist
pub fn load_overlay() -> QvOverlay {
    let path = overlay_path();
    if !path.exists() {
        return QvOverlay {
            version: 1,
            updated_at: String::new(),
            coordinates: BTreeMap::new(),
        };
    }
    match std::fs::read_to_string(&path) {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
        Err(_) => QvOverlay::default(),
    }
}

/// Save overlay to disk
pub fn save_overlay(overlay: &QvOverlay) -> Result<(), String> {
    let path = overlay_path();
    let json = serde_json::to_string_pretty(overlay)
        .map_err(|e| format!("JSON serialize error: {}", e))?;
    std::fs::write(&path, json).map_err(|e| format!("Write error: {}", e))
}

/// Look up a coordinate's pithy from the overlay
pub fn overlay_pithy(coord: &str) -> Option<String> {
    let overlay = load_overlay();
    overlay
        .coordinates
        .get(coord)
        .and_then(|e| e.pithy.clone())
}
