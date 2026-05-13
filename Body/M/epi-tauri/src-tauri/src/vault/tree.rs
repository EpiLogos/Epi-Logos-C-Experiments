use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::AppError;
use crate::state::VaultPaths;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FileTreeNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub section: VaultSection,
    pub children: Option<Vec<FileTreeNode>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum VaultSection {
    Bimba,
    Pratibimba,
    Empty,
    Other,
}

fn detect_section(rel_path: &str) -> VaultSection {
    let lower = rel_path.to_lowercase();
    if lower.starts_with("bimba") {
        VaultSection::Bimba
    } else if lower.starts_with("pratibimba") {
        VaultSection::Pratibimba
    } else if lower.starts_with("empty") {
        VaultSection::Empty
    } else {
        VaultSection::Other
    }
}

/// Build a file tree of the Idea root, limited to `max_depth` levels.
pub fn get_file_tree(vault: &VaultPaths, max_depth: usize) -> Result<Vec<FileTreeNode>, AppError> {
    build_tree(&vault.idea_root, &vault.idea_root, 0, max_depth)
}

fn build_tree(
    dir: &Path,
    root: &Path,
    depth: usize,
    max_depth: usize,
) -> Result<Vec<FileTreeNode>, AppError> {
    if depth >= max_depth || !dir.is_dir() {
        return Ok(vec![]);
    }

    let mut entries: Vec<_> = std::fs::read_dir(dir)?
        .filter_map(|e| e.ok())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    let mut nodes = Vec::new();
    for entry in entries {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }

        let path = entry.path();
        let rel = path.strip_prefix(root).unwrap_or(&path);
        let rel_str = rel.to_string_lossy().to_string();
        let is_dir = path.is_dir();
        let section = detect_section(&rel_str);

        let children = if is_dir {
            Some(build_tree(&path, root, depth + 1, max_depth)?)
        } else {
            None
        };

        nodes.push(FileTreeNode {
            name,
            path: rel_str,
            is_dir,
            section,
            children,
        });
    }

    Ok(nodes)
}

/// Read file content from a path relative to the idea root.
pub fn get_file_content(vault: &VaultPaths, rel_path: &str) -> Result<Option<String>, AppError> {
    let path = vault.idea_root.join(rel_path);
    if !path.exists() {
        return Ok(None);
    }
    if !path.starts_with(&vault.idea_root) {
        return Err(AppError::Vault("path traversal denied".into()));
    }
    Ok(Some(std::fs::read_to_string(&path)?))
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryMetadata {
    pub path: String,
    pub name: String,
    pub section: VaultSection,
    pub size: u64,
    pub modified: Option<u64>,
}

/// List all markdown entries in the vault.
pub fn list_entries(vault: &VaultPaths) -> Result<Vec<EntryMetadata>, AppError> {
    let mut entries = Vec::new();
    for result in walkdir::WalkDir::new(&vault.idea_root)
        .max_depth(6)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = result.path();
        if !path.is_file() {
            continue;
        }
        let ext = path.extension().and_then(|e| e.to_str());
        if ext != Some("md") {
            continue;
        }

        let rel = path.strip_prefix(&vault.idea_root).unwrap_or(path);
        let rel_str = rel.to_string_lossy().to_string();
        let meta = std::fs::metadata(path).ok();

        entries.push(EntryMetadata {
            path: rel_str.clone(),
            name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
            section: detect_section(&rel_str),
            size: meta.as_ref().map(|m| m.len()).unwrap_or(0),
            modified: meta
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs()),
        });
    }
    Ok(entries)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn test_vault() -> (TempDir, VaultPaths) {
        let tmp = TempDir::new().unwrap();
        let idea = tmp.path().join("Idea");
        std::fs::create_dir_all(idea.join("Bimba/Seeds")).unwrap();
        std::fs::create_dir_all(idea.join("Empty/Present")).unwrap();
        std::fs::write(idea.join("Bimba/Seeds/test.md"), "# Test").unwrap();
        std::fs::write(idea.join("Empty/Present/note.md"), "# Note").unwrap();
        let present = idea.join("Empty/Present");
        (tmp, VaultPaths { idea_root: idea, present_root: present })
    }

    #[test]
    fn file_tree_detects_sections() {
        let (_tmp, vault) = test_vault();
        let tree = get_file_tree(&vault, 4).unwrap();
        let bimba = tree.iter().find(|n| n.name == "Bimba").unwrap();
        assert_eq!(bimba.section, VaultSection::Bimba);
    }

    #[test]
    fn list_entries_finds_md() {
        let (_tmp, vault) = test_vault();
        let entries = list_entries(&vault).unwrap();
        assert!(entries.len() >= 2);
        assert!(entries.iter().any(|e| e.name == "test.md"));
    }

    #[test]
    fn get_file_content_works() {
        let (_tmp, vault) = test_vault();
        let content = get_file_content(&vault, "Bimba/Seeds/test.md").unwrap();
        assert_eq!(content.unwrap(), "# Test");
    }

    #[test]
    fn get_file_content_missing() {
        let (_tmp, vault) = test_vault();
        assert!(get_file_content(&vault, "nonexistent.md").unwrap().is_none());
    }
}
