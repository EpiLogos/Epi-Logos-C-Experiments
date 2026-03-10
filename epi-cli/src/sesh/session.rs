use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BootstrapArtifact {
    pub name: String,
    pub path: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionContext {
    pub session_id: String,
    pub day_id: String,
    pub now_path: PathBuf,
    pub started_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionState {
    pub context: SessionContext,
    pub bootstrap: Vec<BootstrapArtifact>,
    pub env: BTreeMap<String, String>,
}

impl SessionContext {
    pub fn new(now: DateTime<Utc>, suffix: Option<&str>, vault_root: &Path) -> Self {
        let random_suffix = suffix
            .map(ToOwned::to_owned)
            .unwrap_or_else(default_random_suffix);
        let session_id = generate_session_id_with_suffix(now, &random_suffix);
        let day_id = now.format("%d-%m-%Y").to_string();
        let now_path = vault_root
            .join("Empty")
            .join("Present")
            .join(&day_id)
            .join(&session_id)
            .join("now.md");

        Self {
            session_id,
            day_id,
            now_path,
            started_at: now,
        }
    }

    pub fn new_for_tests(now: DateTime<Utc>, suffix: &str, vault_root: &Path) -> Self {
        Self::new(now, Some(suffix), vault_root)
    }

    pub fn elapsed_summary(&self, now: DateTime<Utc>) -> String {
        let elapsed = now.signed_duration_since(self.started_at);
        let total = elapsed.num_seconds().max(0);
        let hours = total / 3600;
        let minutes = (total % 3600) / 60;
        let seconds = total % 60;
        format!("{hours}h {minutes}m {seconds}s")
    }
}

pub fn generate_session_id_with_suffix(now: DateTime<Utc>, suffix: &str) -> String {
    format!("{}-{suffix}", now.format("%Y%m%d-%H%M%S"))
}

pub fn bootstrap_sequence(repo_root: &Path, now_path: &Path) -> Vec<BootstrapArtifact> {
    vec![
        BootstrapArtifact {
            name: "CONTINUATION.md".to_string(),
            path: repo_root.join("CONTINUATION.md"),
        },
        BootstrapArtifact {
            name: "ANIMA.md".to_string(),
            path: repo_root.join("ANIMA.md"),
        },
        BootstrapArtifact {
            name: "PARADIGM.md".to_string(),
            path: repo_root.join("PARADIGM.md"),
        },
        BootstrapArtifact {
            name: "PASU".to_string(),
            path: repo_root.join("PASU.md"),
        },
        BootstrapArtifact {
            name: "NOW.md".to_string(),
            path: now_path.to_path_buf(),
        },
        BootstrapArtifact {
            name: "TOOLS.md".to_string(),
            path: repo_root.join("TOOLS.md"),
        },
    ]
}

pub fn repo_root_from_env() -> PathBuf {
    std::env::var("EPI_REPO_ROOT")
        .map(PathBuf::from)
        .or_else(|_| std::env::current_dir())
        .unwrap_or_else(|_| PathBuf::from("."))
}

pub fn resolve_vault_root(env_map: &BTreeMap<String, String>) -> PathBuf {
    if let Some(path) = env_map.get("EPILOGOS_VAULT") {
        return PathBuf::from(path);
    }
    if let Ok(path) = std::env::var("EPILOGOS_VAULT") {
        return PathBuf::from(path);
    }
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Documents")
        .join("Epi-Logos")
        .join("Idea")
}

pub fn load_env_file(repo_root: &Path) -> Result<BTreeMap<String, String>, String> {
    let path = repo_root.join(".epi-logos.env");
    if !path.exists() {
        return Ok(BTreeMap::new());
    }

    let content = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    let mut values = BTreeMap::new();
    for (index, raw_line) in content.lines().enumerate() {
        let line = raw_line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let (key, value) = line
            .split_once('=')
            .ok_or_else(|| format!("invalid env line {} in {}", index + 1, path.display()))?;
        values.insert(key.trim().to_string(), value.trim().to_string());
    }
    Ok(values)
}

pub fn session_state_path(repo_root: &Path) -> PathBuf {
    repo_root.join(".epi").join("session.json")
}

pub fn write_session_state(repo_root: &Path, state: &SessionState) -> Result<(), String> {
    let path = session_state_path(repo_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let body = serde_json::to_string_pretty(state)
        .map_err(|err| format!("failed to serialize session state: {err}"))?;
    fs::write(&path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))
}

pub fn read_session_state(repo_root: &Path) -> Result<SessionState, String> {
    let path = session_state_path(repo_root);
    let body = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    serde_json::from_str(&body).map_err(|err| format!("failed to parse {}: {err}", path.display()))
}

pub fn default_random_suffix() -> String {
    uuid::Uuid::new_v4().simple().to_string()[..6].to_string()
}
