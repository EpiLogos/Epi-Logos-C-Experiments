use serde::{Deserialize, Serialize};

use crate::error::AppError;
use crate::state::VaultPaths;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BacklinksData {
    pub target: String,
    pub references: Vec<BacklinkRef>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BacklinkRef {
    pub source_path: String,
    pub line_number: usize,
    pub context: String,
}

/// Scan all markdown files for [[wikilink]] references to a target.
/// Target matching is case-insensitive on filename stem.
pub fn get_backlinks(vault: &VaultPaths, target_path: &str) -> Result<BacklinksData, AppError> {
    let target_stem = std::path::Path::new(target_path)
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();

    let pattern = format!("[[{}]]", target_stem);
    let mut references = Vec::new();

    for entry in walkdir::WalkDir::new(&vault.idea_root)
        .max_depth(8)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if !path.is_file() || path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }

        let rel = path
            .strip_prefix(&vault.idea_root)
            .unwrap_or(path)
            .to_string_lossy()
            .to_string();

        if rel == target_path {
            continue;
        }

        if let Ok(content) = std::fs::read_to_string(path) {
            let lower_content = content.to_lowercase();
            for (line_num, line) in lower_content.lines().enumerate() {
                if line.contains(&pattern) {
                    let original_line = content.lines().nth(line_num).unwrap_or("").to_string();
                    references.push(BacklinkRef {
                        source_path: rel.clone(),
                        line_number: line_num + 1,
                        context: original_line,
                    });
                }
            }
        }
    }

    Ok(BacklinksData {
        target: target_path.to_string(),
        references,
    })
}

/// Resolve a [[wikilink]] text to a vault file path.
/// Returns the first matching file (case-insensitive stem match).
pub fn resolve_wikilink(vault: &VaultPaths, link_text: &str) -> Result<Option<String>, AppError> {
    let target = link_text.to_lowercase();

    for entry in walkdir::WalkDir::new(&vault.idea_root)
        .max_depth(8)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if !path.is_file() || path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        let stem = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_lowercase();
        if stem == target {
            let rel = path
                .strip_prefix(&vault.idea_root)
                .unwrap_or(path)
                .to_string_lossy()
                .to_string();
            return Ok(Some(rel));
        }
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn test_vault() -> (TempDir, VaultPaths) {
        let tmp = TempDir::new().unwrap();
        let idea = tmp.path().join("Idea");
        std::fs::create_dir_all(idea.join("notes")).unwrap();
        std::fs::write(idea.join("target.md"), "# Target").unwrap();
        std::fs::write(idea.join("notes/ref.md"), "See [[target]] for details").unwrap();
        std::fs::write(idea.join("notes/other.md"), "No links here").unwrap();
        let present = idea.join("Empty/Present");
        std::fs::create_dir_all(&present).unwrap();
        (tmp, VaultPaths { idea_root: idea, present_root: present })
    }

    #[test]
    fn finds_backlinks() {
        let (_tmp, vault) = test_vault();
        let result = get_backlinks(&vault, "target.md").unwrap();
        assert_eq!(result.references.len(), 1);
        assert!(result.references[0].source_path.contains("ref.md"));
    }

    #[test]
    fn resolve_wikilink_finds_file() {
        let (_tmp, vault) = test_vault();
        let result = resolve_wikilink(&vault, "target").unwrap();
        assert!(result.is_some());
        assert!(result.unwrap().contains("target.md"));
    }

    #[test]
    fn resolve_wikilink_missing() {
        let (_tmp, vault) = test_vault();
        assert!(resolve_wikilink(&vault, "nonexistent").unwrap().is_none());
    }
}
