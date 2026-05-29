//! Inbox store — Rust-side receiver of Aletheia's JSONL handoff.
//!
//! C4 (TypeScript / Aletheia side) writes canonical
//! `epii_autoresearch_inbox_entry` payloads as JSONL lines to
//! `${VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl` using `appendFileSync`
//! semantics — repeated invocations grow the file. C5 (this module) is the
//! Rust-side consumer: `InboxStore::append` persists one canonical entry per
//! file (uuid-disambiguated for same-session repeats), and
//! `InboxStore::list_pending` returns all stored entries deterministically.
//!
//! C6 will consume the `InboxStore` via `recompose_pass` to produce
//! next-cycle compose hints — the Möbius return through the seam.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Canonical inbox entry as handed off by Aletheia.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InboxEntry {
    pub kind: String,
    pub source: String,
    pub session_id: String,
    pub day_id: String,
    pub improvement_vectors: Vec<String>,
    /// Full original JSON payload, preserved for forwards-compatibility with
    /// fields the Rust side does not yet model.
    pub raw: serde_json::Value,
}

/// A persisted inbox entry, paired with the id that names it on disk.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoredInboxEntry {
    pub id: String,
    pub entry: InboxEntry,
}

/// File-backed inbox at `${root}/inbox_<sanitised_session>_<uuid>.json`.
pub struct InboxStore {
    root: PathBuf,
}

impl InboxStore {
    /// Open or create the inbox root directory.
    pub fn new(root: impl AsRef<Path>) -> Result<Self, String> {
        let root = root.as_ref().to_path_buf();
        fs::create_dir_all(&root).map_err(|e| format!("create inbox root: {e}"))?;
        Ok(Self { root })
    }

    /// Append an entry to the inbox. Returns the generated id (also the file stem).
    ///
    /// Unsafe filename characters in `session_id` (`:`, `/`, `\\`, space) are
    /// replaced with `_` for cross-platform safety. The original `session_id`
    /// is preserved in the persisted entry body.
    pub fn append(&self, entry: InboxEntry) -> Result<String, String> {
        let sanitised = sanitise_for_filename(&entry.session_id);
        let id = format!("inbox_{}_{}", sanitised, uuid::Uuid::new_v4());
        let path = self.root.join(format!("{id}.json"));
        let stored = StoredInboxEntry {
            id: id.clone(),
            entry,
        };
        let body = serde_json::to_string_pretty(&stored)
            .map_err(|e| format!("serialize inbox entry: {e}"))?;
        fs::write(&path, body)
            .map_err(|e| format!("write inbox entry {}: {}", path.display(), e))?;
        Ok(id)
    }

    /// List all pending entries (deterministic — sorted by filename).
    ///
    /// Non-`.json` files in `root` are silently skipped. Parse failures are
    /// surfaced as `Err` so a malformed entry cannot be silently ignored.
    pub fn list_pending(&self) -> Result<Vec<StoredInboxEntry>, String> {
        let mut paths: Vec<PathBuf> = fs::read_dir(&self.root)
            .map_err(|e| format!("read_dir {}: {}", self.root.display(), e))?
            .filter_map(|res| res.ok())
            .map(|entry| entry.path())
            .filter(|p| p.extension().and_then(|s| s.to_str()) == Some("json"))
            .collect();
        paths.sort();

        let mut out = Vec::with_capacity(paths.len());
        for path in paths {
            let raw = fs::read_to_string(&path)
                .map_err(|e| format!("read {}: {}", path.display(), e))?;
            let stored: StoredInboxEntry = serde_json::from_str(&raw)
                .map_err(|e| format!("parse {}: {}", path.display(), e))?;
            out.push(stored);
        }
        Ok(out)
    }
}

fn sanitise_for_filename(s: &str) -> String {
    s.replace([':', '/', '\\', ' '], "_")
}
