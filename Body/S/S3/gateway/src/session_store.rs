use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::{Map, Value};

use super::{bootstrap, subagents, transcripts, workspace};

pub use epi_s3_gateway_contract::{SessionPatch, SessionRecord};

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct CreateSessionContext {
    pub session_id: Option<String>,
    pub day_id: Option<String>,
    pub vault_now_path: Option<String>,
    pub runtime_cwd: Option<String>,
    pub vault_root: Option<String>,
}

pub struct SessionStore {
    gate_root: PathBuf,
}

impl SessionStore {
    pub fn new(gate_root: impl AsRef<Path>) -> Result<Self, String> {
        let gate_root = gate_root.as_ref().to_path_buf();
        fs::create_dir_all(gate_root.join("sessions")).map_err(|err| err.to_string())?;
        fs::create_dir_all(gate_root.join("transcripts")).map_err(|err| err.to_string())?;
        Ok(Self { gate_root })
    }

    pub fn create(&self, canonical_key: &str) -> Result<SessionRecord, String> {
        self.create_with_context(canonical_key, CreateSessionContext::default())
    }

    pub fn create_with_context(
        &self,
        canonical_key: &str,
        context: CreateSessionContext,
    ) -> Result<SessionRecord, String> {
        let record = SessionRecord {
            canonical_key: canonical_key.to_owned(),
            aliases: Vec::new(),
            label: None,
            session_id: context
                .session_id
                .unwrap_or_else(epi_s3_gateway_contract::default_session_id),
            day_id: context.day_id,
            spawned_by: None,
            parent_session_key: None,
            source_session_key: None,
            source_session_kind: None,
            vault_now_path: context.vault_now_path,
            runtime_cwd: context.runtime_cwd,
            vault_root: context.vault_root,
            resource_loader_id: None,
            retry_settlement_state: None,
            diagnostics: Vec::new(),
            delivery_context: None,
            channel: None,
            thread_id: None,
            group_id: None,
            group_channel: None,
            group_space: None,
            team_id: None,
            team_role: None,
            orchestration_kind: None,
            cmux_workspace: None,
            cmux_surface: None,
            cmux_pane_id: None,
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
            vak_address: None,
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

    pub fn ensure_with_context(
        &self,
        canonical_key: &str,
        context: CreateSessionContext,
    ) -> Result<SessionRecord, String> {
        match self.resolve(canonical_key) {
            Ok(record) => Ok(record),
            Err(_) => self.create_with_context(canonical_key, context),
        }
    }

    pub fn list(&self) -> Result<Vec<SessionRecord>, String> {
        let session_dir = self.gate_root.join("sessions");
        let mut records = Vec::new();
        for entry in fs::read_dir(session_dir).map_err(|err| err.to_string())? {
            let entry = entry.map_err(|err| err.to_string())?;
            let content = fs::read_to_string(entry.path()).map_err(|err| err.to_string())?;
            let record = decode_session_record(&self.gate_root, &content)?;
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
            if let Some(session_id) = patch.session_id {
                record.session_id = session_id;
            }
            if let Some(day_id) = patch.day_id {
                record.day_id = day_id;
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
            if let Some(parent_session_key) = patch.parent_session_key {
                record.parent_session_key = parent_session_key;
            }
            if let Some(source_session_key) = patch.source_session_key {
                record.source_session_key = source_session_key;
            }
            if let Some(source_session_kind) = patch.source_session_kind {
                record.source_session_kind = source_session_kind;
            }
            if let Some(vault_now_path) = patch.vault_now_path {
                record.vault_now_path = vault_now_path;
            }
            if let Some(runtime_cwd) = patch.runtime_cwd {
                record.runtime_cwd = runtime_cwd;
            }
            if let Some(vault_root) = patch.vault_root {
                record.vault_root = vault_root;
            }
            if let Some(resource_loader_id) = patch.resource_loader_id {
                record.resource_loader_id = resource_loader_id;
            }
            if let Some(retry_settlement_state) = patch.retry_settlement_state {
                record.retry_settlement_state = retry_settlement_state;
            }
            if let Some(diagnostics) = patch.diagnostics {
                record.diagnostics = diagnostics;
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
            if let Some(team_id) = patch.team_id {
                record.team_id = team_id;
            }
            if let Some(team_role) = patch.team_role {
                record.team_role = team_role;
            }
            if let Some(orchestration_kind) = patch.orchestration_kind {
                record.orchestration_kind = orchestration_kind;
            }
            if let Some(cmux_workspace) = patch.cmux_workspace {
                record.cmux_workspace = cmux_workspace;
            }
            if let Some(cmux_surface) = patch.cmux_surface {
                record.cmux_surface = cmux_surface;
            }
            if let Some(cmux_pane_id) = patch.cmux_pane_id {
                record.cmux_pane_id = cmux_pane_id;
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
            if let Some(vak_address) = patch.vak_address {
                record.vak_address = Some(vak_address);
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

pub fn slug(value: &str) -> String {
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

fn decode_session_record(gate_root: &Path, content: &str) -> Result<SessionRecord, String> {
    let mut value: Value = serde_json::from_str(content).map_err(|err| err.to_string())?;
    normalize_session_record_value(gate_root, &mut value)?;
    serde_json::from_value(value).map_err(|err| err.to_string())
}

fn normalize_session_record_value(gate_root: &Path, value: &mut Value) -> Result<(), String> {
    let Some(object) = value.as_object_mut() else {
        return Err("session record must be a JSON object".to_owned());
    };

    copy_first_string(
        object,
        "canonical_key",
        &["canonicalKey", "sessionKey", "key"],
    );
    copy_first_string(object, "label", &["displayName"]);
    copy_camel_aliases(object);

    let canonical_key = object
        .get("canonical_key")
        .and_then(Value::as_str)
        .ok_or_else(|| "session record missing canonical_key/sessionKey/key".to_owned())?
        .to_owned();

    if !object.contains_key("session_id") {
        object.insert(
            "session_id".to_owned(),
            Value::String(epi_s3_gateway_contract::default_session_id()),
        );
    }
    if !object.contains_key("active_agent_id") {
        object.insert(
            "active_agent_id".to_owned(),
            Value::String(canonical_key.clone()),
        );
    }
    if !object.contains_key("workspace_root") {
        let lineage = string_array(object.get("subagent_lineage"));
        object.insert(
            "workspace_root".to_owned(),
            Value::String(
                workspace::derive_workspace_root(gate_root, &canonical_key, &lineage)
                    .display()
                    .to_string(),
            ),
        );
    }
    if !object.contains_key("bootstrap_scope") {
        let lineage = string_array(object.get("subagent_lineage"));
        object.insert(
            "bootstrap_scope".to_owned(),
            Value::String(
                bootstrap::derive_bootstrap_scope(gate_root, &canonical_key, &lineage)
                    .display()
                    .to_string(),
            ),
        );
    }
    if !object.contains_key("updated_at_ms") {
        object.insert(
            "updated_at_ms".to_owned(),
            Value::Number(serde_json::Number::from(now_ms()? as u64)),
        );
    }

    Ok(())
}

fn copy_camel_aliases(object: &mut Map<String, Value>) {
    for (snake, camel) in [
        ("day_id", "dayId"),
        ("spawned_by", "spawnedBy"),
        ("parent_session_key", "parentSessionKey"),
        ("source_session_key", "sourceSessionKey"),
        ("source_session_kind", "sourceSessionKind"),
        ("vault_now_path", "vaultNowPath"),
        ("runtime_cwd", "runtimeCwd"),
        ("vault_root", "vaultRoot"),
        ("resource_loader_id", "resourceLoaderId"),
        ("retry_settlement_state", "retrySettlementState"),
        ("delivery_context", "deliveryContext"),
        ("thread_id", "threadId"),
        ("group_id", "groupId"),
        ("group_channel", "groupChannel"),
        ("group_space", "groupSpace"),
        ("team_id", "teamId"),
        ("team_role", "teamRole"),
        ("orchestration_kind", "orchestrationKind"),
        ("cmux_workspace", "cmuxWorkspace"),
        ("cmux_surface", "cmuxSurface"),
        ("cmux_pane_id", "cmuxPaneId"),
        ("active_agent_id", "activeAgentId"),
        ("subagent_lineage", "subagentLineage"),
        ("workspace_root", "workspaceRoot"),
        ("bootstrap_scope", "bootstrapScope"),
        ("thinking_level", "thinkingLevel"),
        ("verbose_level", "verboseLevel"),
        ("reasoning_level", "reasoningLevel"),
        ("model_override", "modelOverride"),
        ("provider_override", "providerOverride"),
        ("cli_session_ids", "cliSessionIds"),
        ("updated_at_ms", "updatedAtMs"),
    ] {
        if !object.contains_key(snake) {
            if let Some(value) = object.get(camel).cloned() {
                object.insert(snake.to_owned(), value);
            }
        }
    }
}

fn copy_first_string(
    object: &mut Map<String, Value>,
    canonical_key: &str,
    compatibility_keys: &[&str],
) {
    if object.contains_key(canonical_key) {
        return;
    }

    if let Some(value) = compatibility_keys
        .iter()
        .filter_map(|key| object.get(*key))
        .find(|value| value.is_string())
        .cloned()
    {
        object.insert(canonical_key.to_owned(), value);
    }
}

fn string_array(value: Option<&Value>) -> Vec<String> {
    value
        .and_then(Value::as_array)
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default()
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
