use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use crate::sesh::session::{read_session_state, repo_root_from_env};

use super::{bootstrap, subagents, transcripts, workspace};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRecord {
    pub canonical_key: String,
    #[serde(default)]
    pub aliases: Vec<String>,
    #[serde(default)]
    pub label: Option<String>,
    #[serde(default = "default_session_id")]
    pub session_id: String,
    #[serde(default)]
    pub day_id: Option<String>,
    #[serde(default)]
    pub spawned_by: Option<String>,
    #[serde(default)]
    pub vault_now_path: Option<String>,
    #[serde(default)]
    pub delivery_context: Option<Value>,
    #[serde(default)]
    pub channel: Option<String>,
    #[serde(default)]
    pub thread_id: Option<String>,
    #[serde(default)]
    pub group_id: Option<String>,
    #[serde(default)]
    pub group_channel: Option<String>,
    #[serde(default)]
    pub group_space: Option<String>,
    #[serde(default)]
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
    pub model_override: Option<String>,
    #[serde(default)]
    pub provider_override: Option<String>,
    #[serde(default)]
    pub cli_session_ids: Vec<String>,
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
    pub spawned_by: Option<Option<String>>,
    pub vault_now_path: Option<Option<String>>,
    pub delivery_context: Option<Option<Value>>,
    pub channel: Option<Option<String>>,
    pub thread_id: Option<Option<String>>,
    pub group_id: Option<Option<String>>,
    pub group_channel: Option<Option<String>>,
    pub group_space: Option<Option<String>>,
    pub model_override: Option<Option<String>>,
    pub provider_override: Option<Option<String>>,
    pub cli_session_ids: Option<Vec<String>>,
}

impl SessionStore {
    pub fn new(gate_root: impl AsRef<Path>) -> Result<Self, String> {
        let gate_root = gate_root.as_ref().to_path_buf();
        fs::create_dir_all(gate_root.join("sessions")).map_err(|err| err.to_string())?;
        fs::create_dir_all(gate_root.join("transcripts")).map_err(|err| err.to_string())?;
        Ok(Self { gate_root })
    }

    pub fn create(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        let session_snapshot = load_current_session_state();
        let record = SessionRecord {
            canonical_key: canonical_key.to_owned(),
            aliases: Vec::new(),
            label: None,
            session_id: session_snapshot
                .as_ref()
                .map(|state| state.context.session_id.clone())
                .unwrap_or_else(default_session_id),
            day_id: session_snapshot
                .as_ref()
                .map(|state| state.context.day_id.clone()),
            spawned_by: None,
            vault_now_path: session_snapshot
                .as_ref()
                .map(|state| state.context.now_path.display().to_string()),
            delivery_context: None,
            channel: None,
            thread_id: None,
            group_id: None,
            group_channel: None,
            group_space: None,
            active_agent_id: canonical_key.to_owned(),
            subagent_lineage: Vec::new(),
            workspace_root: workspace::derive_workspace_root(&self.gate_root, canonical_key, &[])
                .display()
                .to_string(),
            bootstrap_scope: bootstrap::derive_bootstrap_scope(&self.gate_root, canonical_key, &[])
                .display()
                .to_string(),
            thinking_level: None,
            verbose_level: None,
            reasoning_level: None,
            model_override: None,
            provider_override: None,
            cli_session_ids: Vec::new(),
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
            Ok(())
        })
    }

    pub fn set_label(
        &self,
        canonical_key: &str,
        label: Option<&str>,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.label = label.map(str::to_owned);
            Ok(())
        })
    }

    pub fn set_active_agent(
        &self,
        canonical_key: &str,
        active_agent_id: &str,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.active_agent_id = active_agent_id.to_owned();
            Ok(())
        })
    }

    pub fn set_subagent_lineage(
        &self,
        canonical_key: &str,
        subagent_lineage: Vec<String>,
    ) -> Result<SessionRecord, String> {
        self.update(canonical_key, |record| {
            record.subagent_lineage = subagent_lineage;
            refresh_derived_paths(&self.gate_root, record);
            Ok(())
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

    pub fn transcript_path(&self, canonical_key: &str) -> PathBuf {
        transcripts::transcript_path(&self.gate_root, canonical_key)
    }

    pub fn patch(&self, identifier: &str, patch: SessionPatch) -> Result<SessionRecord, String> {
        let canonical_key = self.resolve(identifier)?.canonical_key;
        self.update(&canonical_key, |record| {
            if let Some(spawned_by) = patch.spawned_by.as_ref() {
                subagents::validate_spawned_by_patch(record, spawned_by.as_deref())?;
            }
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
                refresh_derived_paths(&self.gate_root, record);
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
            if let Some(spawned_by) = patch.spawned_by {
                record.spawned_by = spawned_by;
            }
            if let Some(vault_now_path) = patch.vault_now_path {
                record.vault_now_path = vault_now_path;
            }
            if let Some(delivery_context) = patch.delivery_context {
                record.delivery_context = delivery_context;
            }
            if let Some(channel) = patch.channel {
                record.channel = channel;
            }
            if let Some(thread_id) = patch.thread_id {
                record.thread_id = thread_id;
            }
            if let Some(group_id) = patch.group_id {
                record.group_id = group_id;
            }
            if let Some(group_channel) = patch.group_channel {
                record.group_channel = group_channel;
            }
            if let Some(group_space) = patch.group_space {
                record.group_space = group_space;
            }
            if let Some(model_override) = patch.model_override {
                record.model_override = model_override;
            }
            if let Some(provider_override) = patch.provider_override {
                record.provider_override = provider_override;
            }
            if let Some(cli_session_ids) = patch.cli_session_ids {
                record.cli_session_ids = cli_session_ids;
            }
            Ok::<(), String>(())
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
        F: FnOnce(&mut SessionRecord) -> Result<(), String>,
    {
        let mut record = self.resolve(canonical_key)?;
        mutate(&mut record)?;
        self.save(&record)?;
        Ok(record)
    }

    fn save(&self, record: &SessionRecord) -> Result<(), String> {
        let path = self.session_path(&record.canonical_key);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        let mut record = record.clone();
        if record.active_agent_id.is_empty() {
            record.active_agent_id = record.canonical_key.clone();
        }
        record.updated_at_ms = now_ms()?;
        let payload = serde_json::to_string_pretty(&record).map_err(|err| err.to_string())?;
        fs::write(path, payload).map_err(|err| err.to_string())?;
        Ok(())
    }
}

pub(crate) fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect()
}

fn refresh_derived_paths(gate_root: &Path, record: &mut SessionRecord) {
    record.workspace_root = workspace::derive_workspace_root(
        gate_root,
        &record.canonical_key,
        &record.subagent_lineage,
    )
    .display()
    .to_string();
    record.bootstrap_scope = bootstrap::derive_bootstrap_scope(
        gate_root,
        &record.canonical_key,
        &record.subagent_lineage,
    )
    .display()
    .to_string();
}

fn load_current_session_state() -> Option<crate::sesh::session::SessionState> {
    let repo_root = repo_root_from_env();
    read_session_state(&repo_root).ok()
}

fn default_session_id() -> String {
    Uuid::new_v4().to_string()
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
