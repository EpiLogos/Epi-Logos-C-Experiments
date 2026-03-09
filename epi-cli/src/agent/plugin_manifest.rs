use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

pub const MANIFEST_RELATIVE_PATH: &str = ".claude-plugin/plugin.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
}

pub fn load_from_root(root: &Path) -> Result<PluginManifest, Vec<String>> {
    let manifest_path = manifest_path(root);
    let contents = fs::read_to_string(&manifest_path).map_err(|err| {
        vec![format!(
            "{}: unable to read plugin manifest: {err}",
            manifest_path.display()
        )]
    })?;

    let manifest = serde_json::from_str::<PluginManifest>(&contents).map_err(|err| {
        vec![format!(
            "{}: invalid plugin manifest JSON: {err}",
            manifest_path.display()
        )]
    })?;

    let mut errors = Vec::new();
    if manifest.name.trim().is_empty() {
        errors.push(format!(
            "{}: manifest field `name` must not be empty",
            manifest_path.display()
        ));
    }
    if manifest.version.trim().is_empty() {
        errors.push(format!(
            "{}: manifest field `version` must not be empty",
            manifest_path.display()
        ));
    }

    if errors.is_empty() {
        Ok(manifest)
    } else {
        Err(errors)
    }
}

pub fn manifest_path(root: &Path) -> PathBuf {
    root.join(MANIFEST_RELATIVE_PATH)
}
