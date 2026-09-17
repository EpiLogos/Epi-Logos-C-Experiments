//! Coordinate: M' (vault workspace foundation, plan T2.1)
//! Residency: Body/M/pratibimba-app/src-tauri/src
//! Actualises: S1-law file access for the face — vault root resolution,
//!   scoped tree/read/write, fs watching, and UI-state persistence.
//! Public surface: VaultState, vault commands (vault_root, vault_list,
//!   vault_read, vault_write), ui_state_load/save, start_vault_watcher.
//! Does NOT own: canonical vault law (S1/Hen — writes are scoped to the
//!   Present day tree until Hen routes exist), day/NOW creation (S3/Khora).

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::sync::Mutex;
use std::time::Duration;

use notify::{RecursiveMode, Watcher};
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

/// Writes from this surface are permitted only under this prefix (relative to
/// the vault root, which is the `Idea/` folder) until Hen/S1' routes exist.
pub const WRITE_SCOPE_PREFIX: &str = "Empty/Present/";
pub const VAULT_CHANGED_EVENT: &str = "vault://changed";

#[derive(Default)]
pub struct VaultState {
    pub root: Mutex<Option<PathBuf>>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultFile {
    pub path: String,
    pub content: String,
    pub read_only: bool,
}

pub fn app_config_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".epi").join("app"))
}

/// Resolution order: EPILOGOS_VAULT env → EPI_VAULT_ROOT env →
/// `~/.epi/app/config.json` `vaultRoot`. None = surfaced as a provenance
/// state in the UI, never a silent default.
pub fn resolve_vault_root() -> Option<PathBuf> {
    for var in ["EPILOGOS_VAULT", "EPI_VAULT_ROOT"] {
        if let Some(value) = std::env::var_os(var) {
            let path = PathBuf::from(value);
            if path.is_dir() {
                return Some(path);
            }
        }
    }
    let config_path = app_config_dir()?.join("config.json");
    let raw = fs::read_to_string(config_path).ok()?;
    let value: serde_json::Value = serde_json::from_str(&raw).ok()?;
    let root = PathBuf::from(value.get("vaultRoot")?.as_str()?);
    root.is_dir().then_some(root)
}

fn root_of(state: &State<'_, VaultState>) -> Result<PathBuf, String> {
    state
        .root
        .lock()
        .expect("vault root poisoned")
        .clone()
        .ok_or_else(|| {
            "vault root unresolved (set EPILOGOS_VAULT or ~/.epi/app/config.json)".to_owned()
        })
}

/// Canonical containment check — rejects traversal out of the root.
fn resolve_within(root: &Path, rel: &str) -> Result<PathBuf, String> {
    if rel.split('/').any(|part| part == "..") {
        return Err(format!("path escapes the vault: {rel}"));
    }
    let joined = root.join(rel);
    let canon_root = root
        .canonicalize()
        .map_err(|err| format!("vault root unreadable: {err}"))?;
    // Canonicalize the deepest existing ancestor so new files still validate.
    let mut probe = joined.clone();
    while !probe.exists() {
        probe = match probe.parent() {
            Some(parent) => parent.to_path_buf(),
            None => return Err(format!("path escapes the vault: {rel}")),
        };
    }
    let canon_probe = probe
        .canonicalize()
        .map_err(|err| format!("path unreadable: {err}"))?;
    if !canon_probe.starts_with(&canon_root) {
        return Err(format!("path escapes the vault: {rel}"));
    }
    Ok(joined)
}

pub fn in_write_scope(rel: &str) -> bool {
    rel.starts_with(WRITE_SCOPE_PREFIX)
}

#[tauri::command]
pub fn vault_root(state: State<'_, VaultState>) -> Option<String> {
    state
        .root
        .lock()
        .expect("vault root poisoned")
        .as_ref()
        .map(|p| p.display().to_string())
}

#[tauri::command]
pub fn vault_list(
    state: State<'_, VaultState>,
    path: Option<String>,
) -> Result<Vec<VaultEntry>, String> {
    let root = root_of(&state)?;
    let rel = path.unwrap_or_default();
    let dir = if rel.is_empty() {
        root.clone()
    } else {
        resolve_within(&root, &rel)?
    };
    let mut entries = Vec::new();
    for item in fs::read_dir(&dir).map_err(|err| err.to_string())? {
        let item = item.map_err(|err| err.to_string())?;
        let name = item.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let is_dir = item.file_type().map_err(|err| err.to_string())?.is_dir();
        let child_rel = if rel.is_empty() {
            name.clone()
        } else {
            format!("{rel}/{name}")
        };
        entries.push(VaultEntry {
            name,
            path: child_rel,
            is_dir,
        });
    }
    entries.sort_by(|a, b| {
        (b.is_dir, a.name.to_lowercase())
            .partial_cmp(&(a.is_dir, b.name.to_lowercase()))
            .unwrap()
    });
    Ok(entries)
}

#[tauri::command]
pub fn vault_read(state: State<'_, VaultState>, path: String) -> Result<VaultFile, String> {
    let root = root_of(&state)?;
    let full = resolve_within(&root, &path)?;
    let content = fs::read_to_string(&full).map_err(|err| format!("read {path}: {err}"))?;
    Ok(VaultFile {
        read_only: !in_write_scope(&path),
        path,
        content,
    })
}

#[tauri::command]
pub fn vault_write(
    state: State<'_, VaultState>,
    path: String,
    content: String,
) -> Result<(), String> {
    if !in_write_scope(&path) {
        return Err(format!(
            "S1 scope: this surface writes only under {WRITE_SCOPE_PREFIX} (got {path})"
        ));
    }
    let root = root_of(&state)?;
    let full = resolve_within(&root, &path)?;
    if let Some(parent) = full.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    fs::write(&full, content).map_err(|err| format!("write {path}: {err}"))
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DayAnchor {
    pub day_id: String,
    pub daily_note_path: String,
    pub created: bool,
}

/// Canonical daily-note frontmatter, mirrored from the vault's own
/// `01-06-2026/daily-note.md` exemplar (C-family key law). The app is a
/// legitimate day-parent invoker; session-NOW folders remain Khora's to
/// create (S3/agent law) — this surface only anchors the day.
fn daily_note_template(day_id: &str, created_at: &str) -> String {
    format!(
        "---\ncoordinate: \"\"\nc_4_artifact_role: \"daily-note\"\nc_1_ct_type: \"CT4b\"\nc_3_ctx_frame: \"4.0/1-4.4/5\"\nc_4_invocation_profile: \"day_parent\"\nc_4_invocation_kind: \"app\"\nc_3_day_id: \"{day_id}\"\nc_3_created_at: \"{created_at}\"\nc_0_source_coordinates: []\nc_5_reflection_complete: false\np0_grounds:\np0_adjacencies:\np1_tasks_defined:\np1_intentions:\np2_sessions: []\np2_operations:\np2_manual_activity:\np3_patterns:\np3_observations:\np3_connections:\np4_temporals:\np4_files_touched: []\np4_people_mentioned:\np4_concepts_engaged:\np5_learnings:\np5_synthesis:\np5_tomorrow_focus:\n---\n\n# {day_id}\n\n"
    )
}

pub fn begin_day(root: &Path, day_id: &str, created_at: &str) -> Result<DayAnchor, String> {
    let rel = format!("{WRITE_SCOPE_PREFIX}{day_id}/daily-note.md");
    let full = resolve_within(root, &rel)?;
    let created = if full.exists() {
        false
    } else {
        if let Some(parent) = full.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        fs::write(&full, daily_note_template(day_id, created_at)).map_err(|err| err.to_string())?;
        true
    };
    Ok(DayAnchor {
        day_id: day_id.to_owned(),
        daily_note_path: rel,
        created,
    })
}

#[tauri::command]
pub fn begin_today(state: State<'_, VaultState>) -> Result<DayAnchor, String> {
    let root = root_of(&state)?;
    let now = chrono::Local::now();
    // Month-first day ids (Architect correction 2026-07-02): day-first names
    // interleave across months in the file system. Legacy DD-MM folders from
    // June remain readable; new days sort within the year.
    let day_id = now.format("%m-%d-%Y").to_string();
    let created_at = now.to_utc().to_rfc3339();
    begin_day(&root, &day_id, &created_at)
}

#[tauri::command]
pub fn ui_state_load() -> Option<String> {
    fs::read_to_string(app_config_dir()?.join("ui-state.json")).ok()
}

#[tauri::command]
pub fn ui_state_save(json: String) -> Result<(), String> {
    let dir = app_config_dir().ok_or("no home directory")?;
    fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    fs::write(dir.join("ui-state.json"), json).map_err(|err| err.to_string())
}

/// Recursive vault watcher → debounced `vault://changed` events carrying
/// root-relative paths. A liveness stream for the tree, not a render clock.
pub fn start_vault_watcher(app: AppHandle, root: PathBuf) {
    std::thread::spawn(move || {
        let (tx, rx) = mpsc::channel::<notify::Result<notify::Event>>();
        let mut watcher = match notify::recommended_watcher(tx) {
            Ok(w) => w,
            Err(_) => return,
        };
        if watcher.watch(&root, RecursiveMode::Recursive).is_err() {
            return;
        }
        loop {
            let first = match rx.recv() {
                Ok(evt) => evt,
                Err(_) => return,
            };
            let mut paths: Vec<String> = Vec::new();
            let mut absorb = |evt: notify::Result<notify::Event>| {
                if let Ok(event) = evt {
                    for p in event.paths {
                        if let Ok(rel) = p.strip_prefix(&root) {
                            let rel = rel.to_string_lossy().to_string();
                            if !rel.is_empty() && !paths.contains(&rel) {
                                paths.push(rel);
                            }
                        }
                    }
                }
            };
            absorb(first);
            // debounce window: fold the burst
            let deadline = std::time::Instant::now() + Duration::from_millis(400);
            while let Ok(evt) =
                rx.recv_timeout(deadline.saturating_duration_since(std::time::Instant::now()))
            {
                absorb(evt);
            }
            if !paths.is_empty() {
                let _ = app.emit(VAULT_CHANGED_EVENT, paths);
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn write_scope_admits_present_and_rejects_everything_else() {
        assert!(in_write_scope("Empty/Present/02-07-2026/daily-note.md"));
        assert!(!in_write_scope("Bimba/Seeds/M/M4'-SPEC.md"));
        assert!(!in_write_scope("Empty/History/old.md"));
        assert!(!in_write_scope(""));
    }

    #[test]
    fn resolve_within_rejects_traversal_and_admits_new_files() {
        let dir = tempfile::tempdir().expect("tempdir");
        let root = dir.path();
        fs::create_dir_all(root.join("Empty/Present")).unwrap();
        assert!(resolve_within(root, "../outside.md").is_err());
        assert!(resolve_within(root, "Empty/../../outside.md").is_err());
        // a not-yet-existing file inside the root validates via its ancestor
        assert!(resolve_within(root, "Empty/Present/02-07-2026/now.md").is_ok());
    }

    #[test]
    fn begin_day_creates_canonical_daily_note_idempotently() {
        let dir = tempfile::tempdir().expect("tempdir");
        let root = dir.path();
        fs::create_dir_all(root.join("Empty/Present")).unwrap();
        let first = begin_day(root, "07-02-2026", "2026-07-02T09:00:00+00:00").expect("create");
        assert!(first.created);
        assert_eq!(
            first.daily_note_path,
            "Empty/Present/07-02-2026/daily-note.md"
        );
        let body = fs::read_to_string(root.join(&first.daily_note_path)).unwrap();
        assert!(body.contains("c_3_day_id: \"07-02-2026\""));
        assert!(body.contains("c_4_artifact_role: \"daily-note\""));
        assert!(body.contains("c_4_invocation_kind: \"app\""));
        // exemplar key-set guard (verifier finding 2026-07-02): the full
        // canonical frontmatter key sequence, p5 tail included
        for key in [
            "coordinate:",
            "c_1_ct_type:",
            "c_3_ctx_frame:",
            "c_4_invocation_profile:",
            "c_3_created_at:",
            "c_0_source_coordinates:",
            "c_5_reflection_complete:",
            "p0_grounds:",
            "p0_adjacencies:",
            "p1_tasks_defined:",
            "p1_intentions:",
            "p2_sessions:",
            "p2_operations:",
            "p2_manual_activity:",
            "p3_patterns:",
            "p3_observations:",
            "p3_connections:",
            "p4_temporals:",
            "p4_files_touched:",
            "p4_people_mentioned:",
            "p4_concepts_engaged:",
            "p5_learnings:",
            "p5_synthesis:",
            "p5_tomorrow_focus:",
        ] {
            assert!(body.contains(key), "missing exemplar key: {key}");
        }
        // second call adopts, never clobbers
        fs::write(root.join(&first.daily_note_path), "existing content").unwrap();
        let second = begin_day(root, "07-02-2026", "2026-07-02T10:00:00+00:00").expect("adopt");
        assert!(!second.created);
        assert_eq!(
            fs::read_to_string(root.join(&second.daily_note_path)).unwrap(),
            "existing content"
        );
    }

    #[test]
    fn vault_root_resolution_prefers_env() {
        let dir = tempfile::tempdir().expect("tempdir");
        std::env::set_var("EPILOGOS_VAULT", dir.path());
        assert_eq!(resolve_vault_root(), Some(dir.path().to_path_buf()));
        std::env::remove_var("EPILOGOS_VAULT");
    }
}
