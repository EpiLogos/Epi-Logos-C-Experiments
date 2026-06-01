//! Inbox store — Rust-side receiver of Aletheia's JSONL handoff.
//!
//! C4 (TypeScript / Aletheia side) writes canonical
//! `epii_autoresearch_inbox_entry` payloads as JSONL lines under the live
//! daily inbox substrate, `${VAULT}/Empty/Present/{day_id}/${session_id}.jsonl`,
//! using `appendFileSync` semantics — repeated invocations grow the file.
//! C5 (this module) is the Rust-side consumer that reads the **exact same wire
//! format**:
//!
//! - **Layer 1 — source of truth:** one file per session,
//!   `${present_root}/{day_id}/${session_id}.jsonl`, one compact JSON object
//!   per non-empty line. Legacy flat `${root}/${session_id}.jsonl` files remain
//!   readable for migration fixtures, but new appends use the day folder.
//! - **Layer 2 — store API:** `append` writes a new line to the session's
//!   jsonl file with `appendFileSync`-equivalent semantics;
//!   `list_pending` aggregates every entry across day/session files, tagging
//!   each with a deterministic id `${session_id}#L${line_index}` where
//!   `line_index` counts **non-empty** lines from 0. This makes ids stable for
//!   the same file content and serves as the idempotency key for C6.
//!
//! C6 will consume the `InboxStore` via `recompose_pass` to produce
//! next-cycle compose hints — the Möbius return through the seam.

use portal_core::VakAddress;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};

/// Canonical inbox entry as handed off by Aletheia.
///
/// Mirrors `EpiiInboxEntry` in `Body/S/S4/ta-onta/S4-5p-aletheia/modules/
/// sophia-ingest.ts` exactly — every field is top-level, no opaque `raw`
/// catch-all. The schema is the contract; any divergence is a wire break.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InboxEntry {
    pub kind: String,
    pub source: String,
    pub session_id: String,
    pub day_id: String,
    pub final_vak: VakAddress,
    pub improvement_vectors: Vec<String>,
    #[serde(default)]
    pub moirai_summary: BTreeMap<String, String>,
    #[serde(default)]
    pub artifacts: Vec<String>,
    /// Discriminator propagated from Sophia disclosure through Aletheia.
    /// "rehear" = `khora_session_close` tool was invoked (deliberate Möbius
    /// return synthesis). "force_closed" = lifecycle event fired without the
    /// explicit tool call (process killed mid-perform). Older entries that
    /// predate this field default to "rehear" — the historical assumption.
    /// C6 `recompose_pass` consumes this to decide canonical recompose vs
    /// interrupted-flow salvage.
    #[serde(default = "default_closure_kind")]
    pub closure_kind: String,
}

fn default_closure_kind() -> String {
    "rehear".to_string()
}

/// A persisted inbox entry, paired with a deterministic, line-derived id.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoredInboxEntry {
    pub id: String,
    pub entry: InboxEntry,
}

/// File-backed inbox over per-session JSONL files.
///
/// Storage layout: `${present_root}/{day_id}/${session_id}.jsonl`, one compact
/// JSON object per non-empty line.
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

    /// Append an entry to its day/session JSONL file with semantics matching
    /// C4's `appendFileSync`: one compact JSON line, newline-terminated,
    /// created if absent. The store root is the `Empty/Present` folder; the
    /// entry's `day_id` selects the `{day}` child folder.
    ///
    /// Returns the deterministic id `${session_id}#L${line_index}`, where
    /// `line_index` is the 0-based index of this entry among non-empty lines
    /// in the file. The id is stable for the same file content; if blank
    /// lines change, indexes among non-empty lines remain stable.
    pub fn append(&self, entry: InboxEntry) -> Result<String, String> {
        let session_id = entry.session_id.clone();
        let day_id = entry.day_id.clone();
        let path = self
            .root
            .join(sanitize_path_component(&day_id))
            .join(format!("{session_id}.jsonl"));

        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("create parent {}: {}", parent.display(), e))?;
        }

        // Count existing non-empty lines first so the returned id is the
        // pre-write index — avoids any race with our own read-after-write.
        let prev_count = if path.exists() {
            fs::read_to_string(&path)
                .map_err(|e| format!("read {}: {}", path.display(), e))?
                .lines()
                .filter(|l| !l.trim().is_empty())
                .count()
        } else {
            0
        };

        let body =
            serde_json::to_string(&entry).map_err(|e| format!("serialize inbox entry: {e}"))?;
        let line = format!("{body}\n");

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .map_err(|e| format!("open {}: {}", path.display(), e))?;
        file.write_all(line.as_bytes())
            .map_err(|e| format!("write {}: {}", path.display(), e))?;

        Ok(format!("{session_id}#L{prev_count}"))
    }

    /// Aggregate every entry across all day/session JSONL files in `root`,
    /// returning each tagged with `${session_id}#L${line_index}`.
    ///
    /// Deterministic ordering: legacy root session files and one-level day
    /// child session files are sorted lexicographically by path, then entries
    /// within each file in file order. The `line_index` is the 0-based
    /// position among **non-empty** lines — blank lines are skipped and do not
    /// consume indexes. Non-`.jsonl` files are ignored. Parse failures surface
    /// as `Err` so a malformed entry cannot be silently dropped.
    pub fn list_pending(&self) -> Result<Vec<StoredInboxEntry>, String> {
        let mut paths: Vec<PathBuf> = Vec::new();
        for entry in fs::read_dir(&self.root)
            .map_err(|e| format!("read_dir {}: {}", self.root.display(), e))?
        {
            let path = entry
                .map_err(|e| format!("read_dir {}: {}", self.root.display(), e))?
                .path();
            if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                paths.push(path);
                continue;
            }
            if path.is_dir() {
                for child in fs::read_dir(&path)
                    .map_err(|e| format!("read_dir {}: {}", path.display(), e))?
                {
                    let child_path = child
                        .map_err(|e| format!("read_dir {}: {}", path.display(), e))?
                        .path();
                    if child_path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                        paths.push(child_path);
                    }
                }
            }
        }
        paths.sort();

        let mut out = Vec::new();
        for path in paths {
            let session_id = path
                .file_stem()
                .and_then(|s| s.to_str())
                .ok_or_else(|| format!("invalid filename: {}", path.display()))?
                .to_string();
            let content =
                fs::read_to_string(&path).map_err(|e| format!("read {}: {}", path.display(), e))?;
            let mut line_index: usize = 0;
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                let entry: InboxEntry = serde_json::from_str(trimmed)
                    .map_err(|e| format!("parse {}#L{}: {}", path.display(), line_index, e))?;
                out.push(StoredInboxEntry {
                    id: format!("{session_id}#L{line_index}"),
                    entry,
                });
                line_index += 1;
            }
        }
        Ok(out)
    }
}

fn sanitize_path_component(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.') {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_owned()
}
