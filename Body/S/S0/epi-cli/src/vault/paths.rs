use chrono::{DateTime, NaiveDate, Utc};
use std::path::{Path, PathBuf};

pub fn day_folder(vault_root: &Path, now: DateTime<Utc>) -> PathBuf {
    vault_root
        .join("Empty")
        .join("Present")
        .join(now.format("%d-%m-%Y").to_string())
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
