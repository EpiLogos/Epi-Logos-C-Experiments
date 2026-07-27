use chrono::{DateTime, NaiveDate, Utc};
use std::path::{Path, PathBuf};

/// THE day-id format: month-first `MM-DD-YYYY`.
///
/// CHARTER (`2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md:28`), Architect-
/// ratified 2026-07-02: "Day path: month-first `Idea/Empty/Present/{MM-DD-YYYY}/`,
/// flat — supersedes older DD-MM examples." The pratibimba-app carrier
/// (`src-tauri/src/vault.rs`) already conforms; epi-cli spelled `%d-%m-%Y` at ten
/// separate sites and so wrote a DIFFERENT day folder from the app on every day
/// whose day-of-month and month differ. One constant, one format.
pub const DAY_ID_FORMAT: &str = "%m-%d-%Y";

pub fn format_day_id_for_date(day: NaiveDate) -> String {
    day.format(DAY_ID_FORMAT).to_string()
}

pub fn format_day_id(now: DateTime<Utc>) -> String {
    format_day_id_for_date(now.date_naive())
}

/// Parse a day id. Month-first is canonical; ISO and the pre-CHARTER day-first
/// spelling are accepted so existing vault folders and older receipts still
/// resolve. Ambiguous values (both fields <= 12) read as month-first per CHARTER.
pub fn parse_day_id(day_id: &str) -> Result<NaiveDate, String> {
    NaiveDate::parse_from_str(day_id, DAY_ID_FORMAT)
        .or_else(|_| NaiveDate::parse_from_str(day_id, "%Y-%m-%d"))
        .or_else(|_| NaiveDate::parse_from_str(day_id, "%d-%m-%Y"))
        .map_err(|err| format!("invalid dayId {day_id:?}: {err}"))
}

/// THE day-folder constructor. Present is FLAT: `Empty/Present/{DD-MM-YYYY}`.
///
/// This is the only function in this crate permitted to build a Present day
/// path, and `vault_present_day_path_authority.rs` fails the build if a second
/// one appears. That guard exists because a second one DID appear: `vault/day.rs`
/// grew its own copy that nested Present under `{YYYY}/{MM}/W{week}/{DD}` —
/// the ARCHIVE shape (see `archive_day_path`) applied to the wrong root. Nothing
/// kept the two equal, so `epi vault day-init` wrote day folders that session
/// init, the S5 agent core, and the autoresearch spine never looked at, and
/// `archive-day` searched for a source where no live day folder exists.
///
/// The rolling Present is flat by law; only History nests.
pub fn day_folder_for_date(vault_root: &Path, day: NaiveDate) -> PathBuf {
    vault_root
        .join("Empty")
        .join("Present")
        .join(format_day_id_for_date(day))
}

pub fn day_folder(vault_root: &Path, now: DateTime<Utc>) -> PathBuf {
    day_folder_for_date(vault_root, now.date_naive())
}

pub fn day_note_path(vault_root: &Path, now: DateTime<Utc>) -> PathBuf {
    day_folder(vault_root, now).join("daily-note.md")
}

pub fn now_note_path(vault_root: &Path, now: DateTime<Utc>, session_id: &str) -> PathBuf {
    day_folder(vault_root, now).join(session_id).join("now.md")
}

pub fn archive_day_path(vault_root: &Path, day: NaiveDate) -> PathBuf {
    use chrono::Datelike;
    vault_root
        .join("Pratibimba")
        .join("Self")
        .join("Action")
        .join("History")
        .join(day.format("%Y").to_string())
        .join(day.format("%m").to_string())
        .join(format!("W{}", day.iso_week().week()))
        .join(day.format("%d").to_string())
}

pub fn thought_note_path(vault_root: &Path, now: DateTime<Utc>, position: u8) -> PathBuf {
    let bounded = position.min(5);
    vault_root
        .join("Pratibimba")
        .join("Self")
        .join("Thought")
        .join("T")
        .join(format!("T{bounded}"))
        .join(format!("T{bounded}-{}.md", now.format("%Y%m%d-%H%M%S")))
}
