use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::AppError;
use crate::state::VaultPaths;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FlowEntry {
    pub date: String,
    pub content: String,
    pub version: u32,
    pub path: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FlowMetadata {
    pub coordinate: Option<String>,
    pub thought_lane: Option<String>,
}

fn flow_path(vault: &VaultPaths, date: &str) -> PathBuf {
    vault.present_root.join(date).join(format!("FLOW-{date}.md"))
}

fn flow_version_path(vault: &VaultPaths, date: &str, version: u32) -> PathBuf {
    vault.present_root.join(date).join(format!("FLOW-{date}.v{version}.md"))
}

/// Get the current flow entry for a date.
pub fn get_flow_entry(vault: &VaultPaths, date: &str) -> Result<Option<FlowEntry>, AppError> {
    let path = flow_path(vault, date);
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)?;
    let version = list_flow_versions(vault, date)?.last().copied().unwrap_or(0);
    Ok(Some(FlowEntry {
        date: date.to_string(),
        content,
        version,
        path: path.to_string_lossy().to_string(),
    }))
}

/// Save a flow entry with CAS-style versioning.
/// Archives the current version before writing the new one.
pub fn save_flow_entry(
    vault: &VaultPaths,
    date: &str,
    content: &str,
    _metadata: &FlowMetadata,
) -> Result<(), AppError> {
    let day_folder = vault.present_root.join(date);
    std::fs::create_dir_all(&day_folder)?;

    let main_path = flow_path(vault, date);

    if main_path.exists() {
        let existing = std::fs::read_to_string(&main_path)?;
        let next_version = list_flow_versions(vault, date)?
            .last()
            .map(|v| v + 1)
            .unwrap_or(1);
        let archive_path = flow_version_path(vault, date, next_version);
        std::fs::write(&archive_path, existing)?;
    }

    std::fs::write(&main_path, content)?;
    Ok(())
}

/// List all archived flow versions for a date (sorted ascending).
pub fn list_flow_versions(vault: &VaultPaths, date: &str) -> Result<Vec<u32>, AppError> {
    let day_folder = vault.present_root.join(date);
    if !day_folder.exists() {
        return Ok(vec![]);
    }

    let prefix = format!("FLOW-{date}.v");
    let mut versions: Vec<u32> = std::fs::read_dir(&day_folder)?
        .filter_map(|e| e.ok())
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            if name.starts_with(&prefix) && name.ends_with(".md") {
                let ver_str = &name[prefix.len()..name.len() - 3];
                ver_str.parse::<u32>().ok()
            } else {
                None
            }
        })
        .collect();
    versions.sort();
    Ok(versions)
}

/// Get a specific archived flow version.
pub fn get_flow_version(vault: &VaultPaths, date: &str, version: u32) -> Result<Option<FlowEntry>, AppError> {
    let path = flow_version_path(vault, date, version);
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)?;
    Ok(Some(FlowEntry {
        date: date.to_string(),
        content,
        version,
        path: path.to_string_lossy().to_string(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn test_vault() -> (TempDir, VaultPaths) {
        let tmp = TempDir::new().unwrap();
        let idea = tmp.path().join("Idea");
        let present = idea.join("Empty/Present");
        std::fs::create_dir_all(&present).unwrap();
        (tmp, VaultPaths {
            idea_root: idea,
            present_root: present,
        })
    }

    #[test]
    fn save_and_get_flow() {
        let (_tmp, vault) = test_vault();
        let meta = FlowMetadata { coordinate: None, thought_lane: None };
        save_flow_entry(&vault, "2026-05-12", "first draft", &meta).unwrap();
        let entry = get_flow_entry(&vault, "2026-05-12").unwrap().unwrap();
        assert_eq!(entry.content, "first draft");
    }

    #[test]
    fn versioning_archives_previous() {
        let (_tmp, vault) = test_vault();
        let meta = FlowMetadata { coordinate: None, thought_lane: None };
        save_flow_entry(&vault, "2026-05-12", "v0 content", &meta).unwrap();
        save_flow_entry(&vault, "2026-05-12", "v1 content", &meta).unwrap();

        let versions = list_flow_versions(&vault, "2026-05-12").unwrap();
        assert_eq!(versions, vec![1]);

        let archived = get_flow_version(&vault, "2026-05-12", 1).unwrap().unwrap();
        assert_eq!(archived.content, "v0 content");

        let current = get_flow_entry(&vault, "2026-05-12").unwrap().unwrap();
        assert_eq!(current.content, "v1 content");
    }

    #[test]
    fn multiple_versions() {
        let (_tmp, vault) = test_vault();
        let meta = FlowMetadata { coordinate: None, thought_lane: None };
        save_flow_entry(&vault, "2026-05-12", "a", &meta).unwrap();
        save_flow_entry(&vault, "2026-05-12", "b", &meta).unwrap();
        save_flow_entry(&vault, "2026-05-12", "c", &meta).unwrap();
        let versions = list_flow_versions(&vault, "2026-05-12").unwrap();
        assert_eq!(versions, vec![1, 2]);
    }

    #[test]
    fn get_missing_flow() {
        let (_tmp, vault) = test_vault();
        assert!(get_flow_entry(&vault, "1999-01-01").unwrap().is_none());
    }
}
