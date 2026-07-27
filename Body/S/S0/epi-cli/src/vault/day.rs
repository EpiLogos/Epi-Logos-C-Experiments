// S0 ADAPTER: Body/S/S1 (vault day/NOW law — Hen authority) — day scaffolding
// adapter. Day-path construction is NOT owned here: it belongs to
// `vault::paths`, the one authority (DR-PRANA-1, flat Present). This file used
// to carry a second constructor that nested Present under {YYYY}/{MM}/W{week}/{DD};
// that copy is gone and `tests/vault_present_day_path_authority.rs` keeps it gone.
use crate::vault::templates::{render_template, TemplateRenderContext};
use chrono::{DateTime, Datelike, NaiveDate, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

pub const VAULT_DAY_ENSURE_RPC: &str = "vault.day.ensure";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DayEnsureReceipt {
    pub rpc: &'static str,
    pub day_id: String,
    pub day_path: PathBuf,
    pub daily_note_path: PathBuf,
    pub created_day_folder: bool,
    pub created_daily_note: bool,
}

/// Re-exported from the one authority so existing callers keep working while
/// there remains exactly ONE definition of a Present day path.
pub use crate::vault::paths::day_folder_for_date;

pub fn day_folder_for_now(vault_root: &Path, now: DateTime<Utc>) -> PathBuf {
    crate::vault::paths::day_folder(vault_root, now)
}

pub fn day_note_path_for_date(vault_root: &Path, day: NaiveDate) -> PathBuf {
    day_folder_for_date(vault_root, day).join("daily-note.md")
}

/// Re-exported from the one authority: month-first is canonical (CHARTER),
/// with ISO and legacy day-first accepted so existing folders still resolve.
pub use crate::vault::paths::parse_day_id;

pub fn ensure_day_folder(
    vault_root: &Path,
    repo_root: &Path,
    home_root: &Path,
    day_id: &str,
) -> Result<DayEnsureReceipt, String> {
    let day = parse_day_id(day_id)?;
    let now = Utc
        .with_ymd_and_hms(day.year(), day.month(), day.day(), 0, 0, 0)
        .single()
        .ok_or_else(|| format!("invalid dayId {day_id:?}"))?;
    ensure_day_folder_for_now(vault_root, repo_root, home_root, now)
}

pub fn ensure_day_folder_for_now(
    vault_root: &Path,
    repo_root: &Path,
    home_root: &Path,
    now: DateTime<Utc>,
) -> Result<DayEnsureReceipt, String> {
    let day_path = day_folder_for_now(vault_root, now);
    let created_day_folder = !day_path.exists();
    fs::create_dir_all(&day_path)
        .map_err(|err| format!("failed to create {}: {err}", day_path.display()))?;

    let daily_note_path = day_path.join("daily-note.md");
    let created_daily_note = !daily_note_path.exists();
    if created_daily_note {
        let context = TemplateRenderContext {
            template_type: "daily-note".to_string(),
            coordinate: None,
            session_id: None,
            now,
        };
        let body = render_template(&context, repo_root, home_root)?;
        fs::write(&daily_note_path, body)
            .map_err(|err| format!("failed to write {}: {err}", daily_note_path.display()))?;
    }

    Ok(DayEnsureReceipt {
        rpc: VAULT_DAY_ENSURE_RPC,
        day_id: crate::vault::paths::format_day_id(now),
        day_path,
        daily_note_path,
        created_day_folder,
        created_daily_note,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unique_root(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("{name}-{nanos}"))
    }

    #[test]
    fn ensure_day_folder_creates_canonical_day_path_and_is_idempotent() {
        let root = unique_root("epi-day-ensure");
        let vault = root.join("Idea");
        let repo = root.join("repo");
        let home = root.join("home");
        fs::create_dir_all(&repo).unwrap();
        fs::create_dir_all(&home).unwrap();

        let receipt = ensure_day_folder(&vault, &repo, &home, "2026-03-10").unwrap();
        assert_eq!(receipt.rpc, VAULT_DAY_ENSURE_RPC);
        // Present is FLAT and month-first. This assertion previously read
        // `Empty/Present/2026/03/W11/10` and so PINNED the nesting bug: the
        // archive shape under the Present root. Only History nests.
        assert_eq!(receipt.day_path, vault.join("Empty/Present/03-10-2026"));
        assert!(receipt.created_day_folder);
        assert!(receipt.created_daily_note);
        assert!(receipt.daily_note_path.exists());

        let body = fs::read_to_string(&receipt.daily_note_path).unwrap();
        assert!(
            body.contains("artifact_role: \"daily-note\""),
            "ensure must write a real daily-note template, got:\n{body}"
        );

        // the canonical month-first spelling of the same day resolves to the
        // same folder (day-first "10-03-2026" now means 3 October, correctly)
        let second = ensure_day_folder(&vault, &repo, &home, "03-10-2026").unwrap();
        assert!(!second.created_day_folder);
        assert!(!second.created_daily_note);
        assert_eq!(second.day_path, receipt.day_path);

        let _ = fs::remove_dir_all(root);
    }
}
