use chrono::{DateTime, Local, NaiveDate, Utc};
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

/// THE instant→day reduction: the vault day is the LOCAL calendar day.
///
/// A day folder is a LIVED day, not a UTC accounting period. The carrier mints
/// it from `chrono::Local::now()` (`pratibimba-app/src-tauri/src/vault.rs`) and
/// the m-dev tooling reads the local date (`m-dev-plan-assess.mjs`
/// `presentDayId`), so taking `.date_naive()` off a `DateTime<Utc>` here made
/// epi-cli name a different day from both of them for every instant between
/// local midnight and UTC midnight. Same disease as the `%d-%m-%Y` split that
/// `DAY_ID_FORMAT` above cured — a duplicated authority nobody kept equal —
/// which is why this reduction is a single function every day path routes
/// through, pinned by `vault_present_day_path_authority.rs`.
pub fn day_of(now: DateTime<Utc>) -> NaiveDate {
    now.with_timezone(&Local).date_naive()
}

pub fn format_day_id(now: DateTime<Utc>) -> String {
    format_day_id_for_date(day_of(now))
}

/// THE wall-clock stamp for anything NAMED after the moment it was made —
/// session ids, NOW directories, thought notes, goal preludes, day-start ids.
///
/// Same law as [`day_of`], one level down. These stamps are labels a human
/// reads inside a LOCAL day folder, so a UTC stamp puts `20260727-235612`
/// inside `Empty/Present/07-28-2026/` and the tree contradicts itself at a
/// glance. Every stamp goes through here so the two can never drift apart.
pub const STAMP_FORMAT: &str = "%Y%m%d-%H%M%S";

pub fn local_stamp(now: DateTime<Utc>) -> String {
    now.with_timezone(&Local).format(STAMP_FORMAT).to_string()
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

/// THE Present-root constructor. Day discovery and day creation must share the
/// same authority so a reader cannot silently drift from the writer's root.
pub(crate) fn present_root(vault_root: &Path) -> PathBuf {
    vault_root.join("Empty").join("Present")
}

/// THE day-folder constructor. Present is FLAT: `Empty/Present/{MM-DD-YYYY}`.
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
    present_root(vault_root).join(format_day_id_for_date(day))
}

pub fn day_folder(vault_root: &Path, now: DateTime<Utc>) -> PathBuf {
    day_folder_for_date(vault_root, day_of(now))
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
        .join(format!("T{bounded}-{}.md", local_stamp(now)))
}
