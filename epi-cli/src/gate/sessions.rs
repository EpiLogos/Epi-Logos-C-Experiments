use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::{bootstrap, workspace};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRecord {
    pub canonical_key: String,
    #[serde(default)]
    pub aliases: Vec<String>,
    pub label: Option<String>,
    pub active_agent_id: String,
    #[serde(default)]
    pub subagent_lineage: Vec<String>,
    pub workspace_root: String,
    pub bootstrap_scope: String,
    #[serde(default)]
    pub thinking_level: Option<String>,
    #[serde(default)]
    pub verbose_level: Option<String>,
    #[serde(default)]
    pub reasoning_level: Option<String>,
    #[serde(default)]
    pub updated_at_ms: u128,
}

pub struct SessionStore {
    gate_root: PathBuf,
}

#[derive(Debug, Clone, Default)]
pub struct SessionPatch {
    pub aliases: Option<Vec<String>>,
    pub label: Option<Option<String>>,
    pub active_agent_id: Option<String>,
    pub subagent_lineage: Option<Vec<String>>,
    pub thinking_level: Option<Option<String>>,
    pub verbose_level: Option<Option<String>>,
    pub reasoning_level: Option<Option<String>>,
}

impl SessionStore {
    pub fn new(gate_root: impl AsRef<Path>) -> Result<Self, String> {
        let gate_root = gate_root.as_ref().to_path_buf();
        fs::create_dir_all(gate_root.join("sessions")).map_err(|err| err.to_string())?;
        Ok(Self { gate_root })
    }

    pub fn create(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        let record = SessionRecord {
            canonical_key: canonical_key.to_owned(),
            aliases: Vec::new(),
            label: None,
            active_agent_id: canonical_key.to_owned(),
            subagent_lineage: Vec::new(),
            workspace_root: workspace::derive_workspace_root(
                &self.gate_root,
                canonical_key,
                &[],
            )
            .display()
            .to_string(),
            bootstrap_scope: bootstrap::derive_bootstrap_scope(
                &self.gate_root,
                canonical_key,
                &[],
            )
            .display()
            .to_string(),
            thinking_level: None,
            verbose_level: None,
            reasoning_level: None,
            updated_at_ms: now_ms()?,
        };
        self.save(&record)?;
        Ok(record)
    }

    pub fn add_alias(&self, canonical_key: &str, alias: &str) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            if !record.aliases.iter().any(|entry| entry == alias) {
                record.aliases.push(alias.to_owned());
            }
        })
    }

    pub fn set_label(
        &self,
        canonical_key: &str,
        label: Option<&str>,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.label = label.map(str::to_owned);
        })
    }

    pub fn set_active_agent(
        &self,
        canonical_key: &str,
        active_agent_id: &str,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.active_agent_id = active_agent_id.to_owned();
        })
    }

    pub fn set_subagent_lineage(
        &self,
        canonical_key: &str,
        subagent_lineage: Vec<String>,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.subagent_lineage = subagent_lineage;
            record.workspace_root = workspace::derive_workspace_root(
                &self.gate_root,
                &record.canonical_key,
                &record.subagent_lineage,
            )
            .display()
            .to_string();
            record.bootstrap_scope = bootstrap::derive_bootstrap_scope(
                &self.gate_root,
                &record.canonical_key,
                &record.subagent_lineage,
            )
            .display()
            .to_string();
        })
    }

    pub fn resolve(&self, identifier: &str) -> Result<SessionRecord, String> {
        self.list()?
            .into_iter()
            .find(|record| {
                record.canonical_key == identifier
                    || record.aliases.iter().any(|alias| alias == identifier)
                    || record.label.as_deref() == Some(identifier)
            })
            .ok_or_else(|| format!("session not found: {identifier}"))
    }

    pub fn ensure(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        match self.resolve(canonical_key) {
            Ok(record) => Ok(record),
            Err(_) => self.create(canonical_key),
        }
    }

    pub fn list(&self) -> Result<Vec<SessionRecord>, String> {
        let session_dir = self.gate_root.join("sessions");
        let mut records = Vec::new();
        for entry in fs::read_dir(session_dir).map_err(|err| err.to_string())? {
            let entry = entry.map_err(|err| err.to_string())?;
            let content = fs::read_to_string(entry.path()).map_err(|err| err.to_string())?;
            let record: SessionRecord =
                serde_json::from_str(&content).map_err(|err| err.to_string())?;
            records.push(record);
        }
        records.sort_by(|left, right| left.canonical_key.cmp(&right.canonical_key));
        Ok(records)
    }

    pub fn session_path(&self, canonical_key: &str) -> PathBuf {
        self.gate_root
            .join("sessions")
            .join(format!("{}.json", slug(canonical_key)))
    }

    pub fn patch(&self, identifier: &str, patch: SessionPatch) -> Result<SessionRecord, String> {
        let canonical_key = self.resolve(identifier)?.canonical_key;
        self.update(&canonical_key, |record| {
            if let Some(aliases) = patch.aliases {
                record.aliases = aliases;
            }
            if let Some(label) = patch.label {
                record.label = label;
            }
            if let Some(active_agent_id) = patch.active_agent_id {
                record.active_agent_id = active_agent_id;
            }
            if let Some(subagent_lineage) = patch.subagent_lineage {
                record.subagent_lineage = subagent_lineage;
                record.workspace_root = workspace::derive_workspace_root(
                    &self.gate_root,
                    &record.canonical_key,
                    &record.subagent_lineage,
                )
                .display()
                .to_string();
                record.bootstrap_scope = bootstrap::derive_bootstrap_scope(
                    &self.gate_root,
                    &record.canonical_key,
                    &record.subagent_lineage,
                )
                .display()
                .to_string();
            }
            if let Some(thinking_level) = patch.thinking_level {
                record.thinking_level = thinking_level;
            }
            if let Some(verbose_level) = patch.verbose_level {
                record.verbose_level = verbose_level;
            }
            if let Some(reasoning_level) = patch.reasoning_level {
                record.reasoning_level = reasoning_level;
            }
        })
    }

    pub fn delete(&self, identifier: &str) -> Result<SessionRecord, String> {
        let record = self.resolve(identifier)?;
        let path = self.session_path(&record.canonical_key);
        if path.exists() {
            fs::remove_file(path).map_err(|err| err.to_string())?;
        }
        Ok(record)
    }

    fn update<F>(&self, canonical_key: &str, mutate: F) -> Result<SessionRecord, String>
    where
        F: FnOnce(&mut SessionRecord),
    {
        let mut record = self.resolve(canonical_key)?;
        mutate(&mut record);
        self.save(&record)?;
        Ok(record)
    }

    fn save(&self, record: &SessionRecord) -> Result<(), String> {
        let path = self.session_path(&record.canonical_key);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        let mut record = record.clone();
        record.updated_at_ms = now_ms()?;
        let payload = serde_json::to_string_pretty(&record).map_err(|err| err.to_string())?;
        fs::write(path, payload).map_err(|err| err.to_string())
    }
}

pub(crate) fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect()
}

pub fn record_to_value(record: &SessionRecord) -> Value {
    json!({
        "canonicalKey": record.canonical_key,
        "aliases": record.aliases,
        "label": record.label,
        "activeAgentId": record.active_agent_id,
        "subagentLineage": record.subagent_lineage,
        "workspaceRoot": record.workspace_root,
        "bootstrapScope": record.bootstrap_scope,
        "thinkingLevel": record.thinking_level,
        "verboseLevel": record.verbose_level,
        "reasoningLevel": record.reasoning_level,
        "updatedAtMs": record.updated_at_ms,
    })
}

pub fn list_result(store: &SessionStore) -> Result<Value, String> {
    let path = store.gate_root.join("sessions").display().to_string();
    let sessions = store
        .list()?
        .into_iter()
        .map(|record| session_row(&record))
        .collect::<Vec<_>>();
    Ok(json!({
        "ts": now_ms()?,
        "path": path,
        "count": sessions.len(),
        "defaults": {
            "model": Value::Null,
            "contextTokens": Value::Null,
        },
        "sessions": sessions,
    }))
}

pub fn session_row(record: &SessionRecord) -> Value {
    json!({
        "key": record.canonical_key,
        "kind": "direct",
        "label": record.label,
        "displayName": record.label.clone().unwrap_or_else(|| record.canonical_key.clone()),
        "surface": "gateway",
        "updatedAt": record.updated_at_ms as u64,
        "thinkingLevel": record.thinking_level,
        "verboseLevel": record.verbose_level,
        "reasoningLevel": record.reasoning_level,
        "model": Value::Null,
    })
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
