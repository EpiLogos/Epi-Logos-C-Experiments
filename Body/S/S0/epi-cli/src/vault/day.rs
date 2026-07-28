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

/// Ensure the folder for a day the CALLER named.
///
/// The day id is already a calendar date, so it goes straight to the path
/// constructor. It must NOT be widened into an instant and reduced back: an
/// instant reduces via [`crate::vault::paths::day_of`] to the *local* day, and
/// UTC midnight of 20 July IS 19 July everywhere west of UTC — so
/// `vault.day.ensure {"dayId":"2026-07-20"}` created the 19th's folder in
/// `America/New_York`. `gate/day_start.rs:81` warns about exactly this hazard
/// for session ids; this function sat one call below it and did the thing the
/// warning describes.
pub fn ensure_day_folder(
    vault_root: &Path,
    repo_root: &Path,
    home_root: &Path,
    day_id: &str,
) -> Result<DayEnsureReceipt, String> {
    let day = parse_day_id(day_id)?;
    // Display-only instant for the daily-note template. Noon, not midnight, so
    // a template that renders it in local time still names the right date over
    // the usual offsets. Nothing about the folder or the receipt id derives
    // from it — those come from `day` directly, which is the whole fix.
    let template_now = Utc
        .with_ymd_and_hms(day.year(), day.month(), day.day(), 12, 0, 0)
        .single()
        .ok_or_else(|| format!("invalid dayId {day_id:?}"))?;
    ensure_day_folder_for_date(vault_root, repo_root, home_root, day, template_now)
}

pub fn ensure_day_folder_for_now(
    vault_root: &Path,
    repo_root: &Path,
    home_root: &Path,
    now: DateTime<Utc>,
) -> Result<DayEnsureReceipt, String> {
    ensure_day_folder_for_date(
        vault_root,
        repo_root,
        home_root,
        crate::vault::paths::day_of(now),
        now,
    )
}

/// The one body both entry points share: the day is a `NaiveDate` by the time
/// it gets here, so there is no second place a date can be re-derived.
fn ensure_day_folder_for_date(
    vault_root: &Path,
    repo_root: &Path,
    home_root: &Path,
    day: chrono::NaiveDate,
    now: DateTime<Utc>,
) -> Result<DayEnsureReceipt, String> {
    let day_path = crate::vault::paths::day_folder_for_date(vault_root, day);
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
        day_id: crate::vault::paths::format_day_id_for_date(day),
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

    /// A day the caller NAMED must come back as that day, in every timezone.
    ///
    /// This is the regression pin for the round-trip defect: `ensure_day_folder`
    /// used to widen the parsed date into UTC midnight and hand it to
    /// `day_of()`, which reduces an instant to the LOCAL day — so UTC midnight
    /// of 20 July became 19 July everywhere west of UTC and the wrong folder was
    /// created. Nothing here derives from an instant any more, so the assertion
    /// holds under TZ=America/New_York and TZ=Pacific/Midway as well as UTC.
    #[test]
    fn a_named_day_round_trips_to_itself_independent_of_timezone() {
        let root = unique_root("epi-day-roundtrip");
        let vault = root.join("Idea");
        let repo = root.join("repo");
        let home = root.join("home");
        fs::create_dir_all(&repo).unwrap();
        fs::create_dir_all(&home).unwrap();

        for (input, expected) in [
            ("2026-07-20", "07-20-2026"),
            ("07-20-2026", "07-20-2026"),
            ("2026-01-01", "01-01-2026"),
            ("2026-12-31", "12-31-2026"),
        ] {
            let receipt = ensure_day_folder(&vault, &repo, &home, input).unwrap();
            assert_eq!(
                receipt.day_id, expected,
                "dayId {input} must round-trip to {expected}, not shift a day"
            );
            assert_eq!(
                receipt.day_path,
                vault.join("Empty/Present").join(expected),
                "the folder must be the named day's"
            );
        }

        let _ = fs::remove_dir_all(root);
    }
}
