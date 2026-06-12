use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const OMNIPANEL_SESSION_METADATA: &[&str] = &[
    "canonicalKey",
    "alias",
    "label",
    "activeAgentId",
    "subagentLineage",
    "workspaceRoot",
    "bootstrapScope",
    "teamId",
    "teamRole",
    "orchestrationKind",
    "cmuxWorkspace",
    "cmuxSurface",
    "cmuxPaneId",
];
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewaySessionOperationKind {
    List,
    Resolve,
    Preview,
    Patch,
    Reset,
    Delete,
    Compact,
    Fork,
    Resume,
    Import,
    Tree,
    Transcript,
    RunState,
    ChatHistory,
    ChatSend,
    ChatAbort,
    ChannelBindingStatus,
    ChannelBindingLogout,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewaySessionOperationContract {
    pub kind: GatewaySessionOperationKind,
    pub operation_id: &'static str,
    pub gateway_method: &'static str,
    pub coordinate_owner: &'static str,
    pub agent_access_owner: &'static str,
    pub projection_table: &'static str,
    pub request_keys: &'static [&'static str],
    pub response_keys: &'static [&'static str],
}

pub const GATEWAY_SESSION_OPERATION_CONTRACTS: &[GatewaySessionOperationContract] = &[
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::List,
        operation_id: "sessions.list",
        gateway_method: "sessions.list",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["includeGlobal"],
        response_keys: &["items", "activeKey", "aliases"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Resolve,
        operation_id: "sessions.resolve",
        gateway_method: "sessions.resolve",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &[
            "canonicalKey",
            "activeAgentId",
            "workspaceRoot",
            "bootstrapScope",
        ],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Preview,
        operation_id: "sessions.preview",
        gateway_method: "sessions.preview",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["canonicalKey", "messages", "summary"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Patch,
        operation_id: "sessions.patch",
        gateway_method: "sessions.patch",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey", "label", "dayId", "activeAgentId"],
        response_keys: &["canonicalKey", "label", "dayId", "updatedAtMs"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Reset,
        operation_id: "sessions.reset",
        gateway_method: "sessions.reset",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["ok", "canonicalKey"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Delete,
        operation_id: "sessions.delete",
        gateway_method: "sessions.delete",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["ok", "canonicalKey"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Compact,
        operation_id: "sessions.compact",
        gateway_method: "sessions.compact",
        coordinate_owner: "S3",
        agent_access_owner: "S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["ok", "canonicalKey", "summaryPath"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Fork,
        operation_id: "sessions.fork",
        gateway_method: "sessions.fork",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey", "label", "activeAgentId"],
        response_keys: &["canonicalKey", "parentSessionKey", "sourceSessionKey"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Resume,
        operation_id: "sessions.resume",
        gateway_method: "sessions.resume",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["canonicalKey", "activeAgentId", "runtimeCwd"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Import,
        operation_id: "sessions.import",
        gateway_method: "sessions.import",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["path", "label", "activeAgentId"],
        response_keys: &["canonicalKey", "sourceSessionKind", "vaultNowPath"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Tree,
        operation_id: "sessions.tree",
        gateway_method: "sessions.tree",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["items", "rootKey", "activeKey"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::Transcript,
        operation_id: "sessions.transcript",
        gateway_method: "chat.history",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["canonicalKey", "messages"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::RunState,
        operation_id: "sessions.run-state",
        gateway_method: "sessions.run-state",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &[
            "canonicalKey",
            "runState",
            "activeRunIds",
            "idleState",
            "retrySettlementState",
            "diagnostics",
            "deliveryContext",
        ],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::ChatHistory,
        operation_id: "chat.history",
        gateway_method: "chat.history",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey"],
        response_keys: &["canonicalKey", "messages"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::ChatSend,
        operation_id: "chat.send",
        gateway_method: "chat.send",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey", "text"],
        response_keys: &["ok", "canonicalKey", "runId"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::ChatAbort,
        operation_id: "chat.abort",
        gateway_method: "chat.abort",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["sessionKey", "runId"],
        response_keys: &["ok", "canonicalKey", "aborted", "runIds"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::ChannelBindingStatus,
        operation_id: "channels.status",
        gateway_method: "channels.status",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &[],
        response_keys: &["channels"],
    },
    GatewaySessionOperationContract {
        kind: GatewaySessionOperationKind::ChannelBindingLogout,
        operation_id: "channels.logout",
        gateway_method: "channels.logout",
        coordinate_owner: "S3",
        agent_access_owner: "S4/S5",
        projection_table: "session_surface",
        request_keys: &["channel"],
        response_keys: &["ok", "channel"],
    },
];

pub fn gateway_session_operation_contracts() -> &'static [GatewaySessionOperationContract] {
    GATEWAY_SESSION_OPERATION_CONTRACTS
}

pub fn gateway_session_method_names() -> Vec<&'static str> {
    let mut methods = Vec::new();
    for contract in GATEWAY_SESSION_OPERATION_CONTRACTS {
        if !methods.contains(&contract.gateway_method) {
            methods.push(contract.gateway_method);
        }
    }
    methods
}
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
    pub parent_session_key: Option<String>,
    #[serde(default)]
    pub source_session_key: Option<String>,
    #[serde(default)]
    pub source_session_kind: Option<String>,
    #[serde(default)]
    pub vault_now_path: Option<String>,
    #[serde(default)]
    pub runtime_cwd: Option<String>,
    #[serde(default)]
    pub vault_root: Option<String>,
    #[serde(default)]
    pub resource_loader_id: Option<String>,
    #[serde(default)]
    pub retry_settlement_state: Option<String>,
    #[serde(default)]
    pub diagnostics: Vec<Value>,
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
    pub team_id: Option<String>,
    #[serde(default)]
    pub team_role: Option<String>,
    #[serde(default)]
    pub orchestration_kind: Option<String>,
    #[serde(default)]
    pub cmux_workspace: Option<String>,
    #[serde(default)]
    pub cmux_surface: Option<String>,
    #[serde(default)]
    pub cmux_pane_id: Option<String>,
    #[serde(default)]
    pub terminal_binding: Option<TerminalBinding>,
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<portal_core::VakAddress>,
    #[serde(default)]
    pub updated_at_ms: u128,
}

#[derive(Debug, Clone, Default)]
pub struct SessionPatch {
    pub aliases: Option<Vec<String>>,
    pub label: Option<Option<String>>,
    pub session_id: Option<String>,
    pub day_id: Option<Option<String>>,
    pub active_agent_id: Option<String>,
    pub subagent_lineage: Option<Vec<String>>,
    pub thinking_level: Option<Option<String>>,
    pub verbose_level: Option<Option<String>>,
    pub reasoning_level: Option<Option<String>>,
    pub spawned_by: Option<Option<String>>,
    pub parent_session_key: Option<Option<String>>,
    pub source_session_key: Option<Option<String>>,
    pub source_session_kind: Option<Option<String>>,
    pub vault_now_path: Option<Option<String>>,
    pub runtime_cwd: Option<Option<String>>,
    pub vault_root: Option<Option<String>>,
    pub resource_loader_id: Option<Option<String>>,
    pub retry_settlement_state: Option<Option<String>>,
    pub diagnostics: Option<Vec<Value>>,
    pub delivery_context: Option<Option<Value>>,
    pub channel: Option<Option<String>>,
    pub thread_id: Option<Option<String>>,
    pub group_id: Option<Option<String>>,
    pub group_channel: Option<Option<String>>,
    pub group_space: Option<Option<String>>,
    pub team_id: Option<Option<String>>,
    pub team_role: Option<Option<String>>,
    pub orchestration_kind: Option<Option<String>>,
    pub cmux_workspace: Option<Option<String>>,
    pub cmux_surface: Option<Option<String>>,
    pub cmux_pane_id: Option<Option<String>>,
    pub terminal_binding: Option<Option<TerminalBinding>>,
    pub model_override: Option<Option<String>>,
    pub provider_override: Option<Option<String>>,
    pub cli_session_ids: Option<Vec<String>>,
    pub vak_address: Option<portal_core::VakAddress>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalBinding {
    #[serde(default)]
    pub terminal_identifier: Option<String>,
    #[serde(default)]
    pub session_anchor: Option<String>,
    #[serde(default)]
    pub tmux_pane_id: Option<String>,
    #[serde(default)]
    pub attached_session_key: Option<String>,
    #[serde(default)]
    pub terminal_status: Option<TerminalStatus>,
    #[serde(default)]
    pub lease: Option<TerminalLease>,
    #[serde(default)]
    pub capture_policy: Option<TerminalCapturePolicy>,
}

impl TerminalBinding {
    pub fn safe_inherited_metadata(&self) -> Self {
        Self {
            terminal_identifier: self.terminal_identifier.clone(),
            session_anchor: self.session_anchor.clone(),
            tmux_pane_id: None,
            attached_session_key: None,
            terminal_status: self
                .terminal_status
                .and_then(TerminalStatus::safe_inherited),
            lease: None,
            capture_policy: self
                .capture_policy
                .as_ref()
                .and_then(TerminalCapturePolicy::safe_inherited),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TerminalStatus {
    Detached,
    Attached,
}

impl TerminalStatus {
    fn safe_inherited(self) -> Option<Self> {
        match self {
            Self::Detached => Some(Self::Detached),
            Self::Attached => None,
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalLease {
    #[serde(default)]
    pub lease_owner: Option<String>,
    #[serde(default)]
    pub lease_purpose: Option<String>,
    #[serde(default)]
    pub lease_expires_at_ms: Option<u128>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCapturePolicy {
    #[serde(default)]
    pub mode: TerminalCaptureMode,
    #[serde(default)]
    pub max_lines: Option<u32>,
    #[serde(default)]
    pub redaction_policy: Option<String>,
}

impl TerminalCapturePolicy {
    fn safe_inherited(&self) -> Option<Self> {
        (self.mode == TerminalCaptureMode::MetadataOnly).then(|| self.clone())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TerminalCaptureMode {
    MetadataOnly,
    Stream,
    Transcript,
}

impl Default for TerminalCaptureMode {
    fn default() -> Self {
        Self::MetadataOnly
    }
}
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsycheRuntimeHandle {
    pub coordinate_owner: &'static str,
    pub continuity_owner: &'static str,
    pub redis_state_key: String,
    pub protected_body_policy: &'static str,
    pub max_carry_forward_items: usize,
}

impl PsycheRuntimeHandle {
    pub fn for_session(session_id: &str) -> Self {
        Self {
            coordinate_owner: "S3",
            continuity_owner: "S4/Psyche",
            redis_state_key: format!("cache:active:s3:gateway:psyche:session:{session_id}:state"),
            protected_body_policy:
                "return Redis/Psyche handles and summaries; do not expose raw protected bodies",
            max_carry_forward_items: 12,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KbaseSourceRuntimeHandle {
    pub coordinate_owner: &'static str,
    pub semantic_owner: &'static str,
    pub kbase_ref_key: String,
    pub source_pool_ref_key: String,
    pub protected_body_policy: &'static str,
}

impl KbaseSourceRuntimeHandle {
    pub fn new(handle_id: &str, source_hash: &str) -> Self {
        Self {
            coordinate_owner: "S3",
            semantic_owner: "S5/Gnosis",
            kbase_ref_key: format!("cache:warm:s5:kbase:ref:{handle_id}"),
            source_pool_ref_key: format!("cache:warm:s5:source-pool:ref:{source_hash}"),
            protected_body_policy:
                "store source manifests and retrieval package refs; raw protected bodies require explicit hot-local TTL",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CoordinateLookupCacheHandle {
    pub coordinate_owner: &'static str,
    pub graph_owner: &'static str,
    pub coordinate_snapshot_key: String,
    pub invalidates_by: Vec<&'static str>,
}

impl CoordinateLookupCacheHandle {
    pub fn new(graph_revision: &str, coordinate: &str) -> Self {
        Self {
            coordinate_owner: "S3",
            graph_owner: "S2",
            coordinate_snapshot_key: format!(
                "cache:cold:s2:coordinate:lookup:{graph_revision}:{coordinate}"
            ),
            invalidates_by: vec![
                "graph_revision",
                "embedding_version",
                "q_schema_version",
                "source_hash",
            ],
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RunContext {
    pub run_id: String,
    pub session_key: String,
    pub method: String,
    pub started_at_ms: u128,
}

impl RunContext {
    pub fn new(
        run_id: impl Into<String>,
        session_key: impl Into<String>,
        method: impl Into<String>,
    ) -> Self {
        Self {
            run_id: run_id.into(),
            session_key: session_key.into(),
            method: method.into(),
            started_at_ms: now_ms(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RunSnapshot {
    pub run_id: String,
    pub session_key: String,
    pub status: String,
    pub started_at_ms: u128,
    pub ended_at_ms: Option<u128>,
    pub error: Option<String>,
}

impl RunSnapshot {
    pub fn ok(
        run_id: impl Into<String>,
        session_key: impl Into<String>,
        started_at_ms: u128,
        ended_at_ms: u128,
    ) -> Self {
        Self {
            run_id: run_id.into(),
            session_key: session_key.into(),
            status: "ok".to_owned(),
            started_at_ms,
            ended_at_ms: Some(ended_at_ms),
            error: None,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct ChatRunRegistry {
    runs_by_session: HashMap<String, VecDeque<String>>,
    session_by_run: HashMap<String, String>,
}

impl ChatRunRegistry {
    pub fn add(&mut self, session_key: &str, run_id: &str) {
        self.runs_by_session
            .entry(session_key.to_owned())
            .or_default()
            .push_back(run_id.to_owned());
        self.session_by_run
            .insert(run_id.to_owned(), session_key.to_owned());
    }

    pub fn pop(&mut self, session_key: &str) -> Option<String> {
        let queue = self.runs_by_session.get_mut(session_key)?;
        let run_id = queue.pop_front();
        if queue.is_empty() {
            self.runs_by_session.remove(session_key);
        }
        if let Some(run_id) = &run_id {
            self.session_by_run.remove(run_id);
        }
        run_id
    }

    pub fn list(&self, session_key: &str) -> Vec<String> {
        self.runs_by_session
            .get(session_key)
            .map(|queue| queue.iter().cloned().collect())
            .unwrap_or_default()
    }

    pub fn remove_run(&mut self, run_id: &str) -> Option<String> {
        let session_key = self.session_by_run.remove(run_id)?;
        let queue = self.runs_by_session.get_mut(&session_key)?;
        if let Some(index) = queue.iter().position(|entry| entry == run_id) {
            queue.remove(index);
        }
        if queue.is_empty() {
            self.runs_by_session.remove(&session_key);
        }
        Some(session_key)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GatewayEvent {
    pub channel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seq: Option<u64>,
    pub payload: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProvenanceEvent {
    pub event_type: String,
    pub session_id: String,
    pub channel_id: String,
    pub channel_type: String,
    pub day_id: String,
    pub vault_now_path: String,
    pub timestamp: String,
}
impl GatewayEvent {
    pub fn new(
        channel: impl Into<String>,
        run_id: Option<&str>,
        session_key: Option<&str>,
        seq: Option<u64>,
        payload: Value,
    ) -> Self {
        Self {
            channel: channel.into(),
            run_id: run_id.map(str::to_owned),
            session_key: session_key.map(str::to_owned),
            seq,
            payload,
        }
    }
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

pub fn default_session_id() -> String {
    uuid::Uuid::new_v4().to_string()
}
