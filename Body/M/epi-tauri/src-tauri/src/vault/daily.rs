use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::AppError;
use crate::state::VaultPaths;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DailyNote {
    pub date: String,
    pub content: String,
    pub path: String,
}

/// Resolve daily note path. Tries `YYYY-MM-DD/daily-note.md`, then `YYYY-MM-DD/YYYY-MM-DD.md`.
pub fn daily_note_path(vault: &VaultPaths, date: &str) -> PathBuf {
    let day_folder = vault.present_root.join(date);
    let canonical = day_folder.join("daily-note.md");
    if canonical.exists() {
        return canonical;
    }
    let alt = day_folder.join(format!("{date}.md"));
    if alt.exists() {
        return alt;
    }
    canonical
}

/// Get today's date as YYYY-MM-DD.
pub fn today_string() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

/// Ensure the day folder exists and return its path.
pub fn ensure_day_folder(vault: &VaultPaths, date: &str) -> Result<PathBuf, AppError> {
    let day_folder = vault.present_root.join(date);
    std::fs::create_dir_all(&day_folder)?;
    Ok(day_folder)
}

/// Read daily note for a given date.
pub fn get_daily_note(vault: &VaultPaths, date: &str) -> Result<Option<DailyNote>, AppError> {
    let path = daily_note_path(vault, date);
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)?;
    Ok(Some(DailyNote {
        date: date.to_string(),
        content,
        path: path.to_string_lossy().to_string(),
    }))
}

/// Create daily note from canonical template if it doesn't exist yet.
pub fn create_daily_note_if_absent(vault: &VaultPaths, date: &str) -> Result<PathBuf, AppError> {
    let day_folder = ensure_day_folder(vault, date)?;
    let path = day_folder.join("daily-note.md");
    if path.exists() {
        return Ok(path);
    }

    let template = format!(
        "---\ncoordinate: \"M4\"\nc_4_artifact_role: daily-note\nc_1_ct_type: CT4b'\nc_3_day_id: \"{date}\"\nc_3_created_at: \"{now}\"\nc_3_ctx_frame: \"(4.0/1-4.4/5)\"\nc_0_source_coordinates: []\n---\n# {date}\n\n## Quilt Points\n\n- \n\n## Flow\n\n\n## Notes\n\n",
        now = chrono::Utc::now().to_rfc3339(),
    );
    std::fs::write(&path, template)?;
    Ok(path)
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
    fn create_daily_note() {
        let (_tmp, vault) = test_vault();
        let path = create_daily_note_if_absent(&vault, "2026-05-12").unwrap();
        assert!(path.exists());
        let content = std::fs::read_to_string(&path).unwrap();
        assert!(content.contains("c_4_artifact_role: daily-note"));
        assert!(content.contains("# 2026-05-12"));
    }

    #[test]
    fn no_double_create() {
        let (_tmp, vault) = test_vault();
        let p1 = create_daily_note_if_absent(&vault, "2026-05-12").unwrap();
        std::fs::write(&p1, "modified").unwrap();
        let p2 = create_daily_note_if_absent(&vault, "2026-05-12").unwrap();
        assert_eq!(std::fs::read_to_string(p2).unwrap(), "modified");
    }

    #[test]
    fn get_missing_daily_note() {
        let (_tmp, vault) = test_vault();
        assert!(get_daily_note(&vault, "1999-01-01").unwrap().is_none());
    }
}
