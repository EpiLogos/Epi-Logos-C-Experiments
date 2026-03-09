use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct OverlayPaths {
    pub canonical: PathBuf,
    pub live_cache: PathBuf,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct QvOverlay {
    pub version: u32,
    pub updated_at: String,
    pub coordinates: BTreeMap<String, QvEntry>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct QvEntry {
    #[serde(default, alias = "pithy", skip_serializing_if = "Option::is_none")]
    pub essence: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_nature: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_essence: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_formulation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_structure: Option<String>,
}

fn default_overlay() -> QvOverlay {
    QvOverlay {
        version: 1,
        updated_at: String::new(),
        coordinates: BTreeMap::new(),
    }
}

fn default_base_dir() -> PathBuf {
    if let Ok(path) = std::env::var("EPI_KNOWING_DIR") {
        return PathBuf::from(path);
    }
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
        .join("qv")
}

fn build_paths(base: PathBuf) -> OverlayPaths {
    std::fs::create_dir_all(&base).ok();
    OverlayPaths {
        canonical: base.join("overlay.json"),
        live_cache: base.join("snapshot-cache.json"),
    }
}

pub fn overlay_paths() -> OverlayPaths {
    build_paths(default_base_dir())
}

#[cfg(test)]
pub fn test_paths(base: impl Into<PathBuf>) -> OverlayPaths {
    build_paths(base.into())
}

/// Returns the canonical overlay path: ~/.epi-logos/qv/overlay.json
pub fn overlay_path() -> PathBuf {
    overlay_paths().canonical
}

/// Load canonical overlay from disk, returning empty overlay if file doesn't exist.
pub fn load_overlay() -> QvOverlay {
    load_overlay_from_path(&overlay_path())
}

pub fn load_overlay_from_path(path: &Path) -> QvOverlay {
    if !path.exists() {
        return default_overlay();
    }
    match std::fs::read_to_string(path) {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_else(|_| default_overlay()),
        Err(_) => default_overlay(),
    }
}

/// Save canonical overlay to disk.
pub fn save_overlay(overlay: &QvOverlay) -> Result<(), String> {
    let path = overlay_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Create dir error: {}", e))?;
    }
    let json = serde_json::to_string_pretty(overlay)
        .map_err(|e| format!("JSON serialize error: {}", e))?;
    std::fs::write(&path, json).map_err(|e| format!("Write error: {}", e))
}

/// Look up a coordinate's canonical essence text from the overlay.
pub fn overlay_pithy(coord: &str) -> Option<String> {
    let overlay = load_overlay();
    overlay
        .coordinates
        .get(coord)
        .and_then(|entry| entry.essence.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_overlay_and_live_cache_use_separate_files() {
        let paths = test_paths(PathBuf::from("/tmp/epi-knowing-test"));
        assert!(paths.canonical.ends_with("overlay.json"));
        assert!(paths.live_cache.ends_with("snapshot-cache.json"));
    }

    #[test]
    fn legacy_pithy_overlay_still_loads_as_essence_text() {
        let temp_dir =
            std::env::temp_dir().join(format!("epi-knowing-overlay-legacy-{}", std::process::id()));
        std::fs::create_dir_all(&temp_dir).unwrap();
        let overlay_path = temp_dir.join("overlay.json");
        std::fs::write(
            &overlay_path,
            r#"{
  "version": 1,
  "updated_at": "2026-03-08T00:00:00Z",
  "coordinates": {
    "C1": {
      "pithy": "Form -- essential nature"
    }
  }
}"#,
        )
        .unwrap();

        let overlay = load_overlay_from_path(&overlay_path);
        assert_eq!(
            overlay
                .coordinates
                .get("C1")
                .and_then(|entry| entry.essence.as_deref()),
            Some("Form -- essential nature")
        );

        std::fs::remove_dir_all(&temp_dir).ok();
    }
}
