use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const DEFAULT_GATEWAY_PORT: u16 = 18794;
pub const TEST_GATEWAY_PORT: u16 = 18794;
pub const PROTOCOL_VERSION: u8 = 3;
pub const PROTOCOL_DEV_VERSION: &str = "s3-gateway-dev";
pub const GRAPHITI_PORT: u16 = 37778;
pub const GRAPHITI_BASE_URL: &str = "http://127.0.0.1:37778";
pub const GRAPHITI_RUNTIME_AUTHORITY: &str = "S3 graphiti runtime adapter";
pub const GRAPHITI_INVOCATION_OWNER: &str = "S5 episodic invocation and arc governance";
pub const TEMPORAL_REDIS_NAMESPACE: &str = "s3:gateway:temporal";

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

pub const EVENT_NAMES: &[&str] = &["agent", "chat", "tick", "health", "heartbeat"];

pub const METHOD_NAMES: &[&str] = &[
    "connect",
    "agent",
    "agent.identity.get",
    "agent.wait",
    "agents.list",
    "browser.request",
    "web.login.start",
    "web.login.wait",
    "channels.status",
    "channels.logout",
    "chat.history",
    "chat.abort",
    "chat.send",
    "chat.inject",
    "config.get",
    "config.schema",
    "config.set",
    "config.patch",
    "config.apply",
    "cron.list",
    "cron.status",
    "cron.add",
    "cron.update",
    "cron.remove",
    "cron.run",
    "cron.runs",
    "device.pair.list",
    "device.pair.approve",
    "device.pair.reject",
    "device.token.rotate",
    "device.token.revoke",
    "exec.approval.request",
    "exec.approval.resolve",
    "exec.approvals.get",
    "exec.approvals.set",
    "exec.approvals.node.get",
    "exec.approvals.node.set",
    "logs.tail",
    "models.list",
    "status",
    "health",
    "status.summary",
    "health.snapshot",
    "presence.list",
    "skills.status",
    "skills.bins",
    "skills.install",
    "skills.update",
    "s4.agent.query",
    "s4.agent.notify",
    "s4.agent.status",
    "s4'.vak.evaluate",
    "s4'.orchestrate",
    "s4'.psyche.state",
    "s4'.psyche.update",
    "s4'.permission.get",
    "s5'.improve.status",
    "s5'.improve.propose",
    "s5'.improve.evaluate",
    "s5'.improve.promote",
    "s5'.improve.history",
    "s5'.epii.status",
    "s5'.epii.deposit",
    "s5'.review.inbox",
    "s5'.review.submit",
    "s5'.review.resolve",
    "s5'.review.history",
    "usage.status",
    "usage.cost",
    "node.pair.request",
    "node.pair.list",
    "node.pair.approve",
    "node.pair.reject",
    "node.pair.verify",
    "node.rename",
    "node.list",
    "node.describe",
    "node.invoke",
    "node.invoke.result",
    "node.event",
    "send",
    "sessions.list",
    "sessions.preview",
    "sessions.resolve",
    "sessions.patch",
    "sessions.reset",
    "sessions.delete",
    "sessions.compact",
    "last-heartbeat",
    "set-heartbeats",
    "wake",
    "system-presence",
    "system-event",
    "talk.mode",
    "tts.status",
    "tts.enable",
    "tts.disable",
    "tts.convert",
    "tts.setProvider",
    "tts.providers",
    "voicewake.get",
    "voicewake.set",
    "update.run",
    "wizard.start",
    "wizard.next",
    "wizard.cancel",
    "wizard.status",
];

pub fn method_names() -> &'static [&'static str] {
    METHOD_NAMES
}

pub fn event_names() -> &'static [&'static str] {
    EVENT_NAMES
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
    pub team_id: Option<Option<String>>,
    pub team_role: Option<Option<String>>,
    pub orchestration_kind: Option<Option<String>>,
    pub cmux_workspace: Option<Option<String>>,
    pub cmux_surface: Option<Option<String>>,
    pub cmux_pane_id: Option<Option<String>>,
    pub model_override: Option<Option<String>>,
    pub provider_override: Option<Option<String>>,
    pub cli_session_ids: Option<Vec<String>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RedisTemporalContextRole {
    pub coordinate_owner: &'static str,
    pub redis_namespace: &'static str,
    pub ttl_seconds: u64,
    pub description: &'static str,
}

impl RedisTemporalContextRole {
    pub fn session_now() -> Self {
        Self {
            coordinate_owner: "S3",
            redis_namespace: TEMPORAL_REDIS_NAMESPACE,
            ttl_seconds: 300,
            description: "Redis temporal context for gateway sessions, NOW markdown, presence, and heartbeat state",
        }
    }

    pub fn session_now_key(&self, session_id: &str) -> String {
        format!("{}:session:{}:now:md", self.redis_namespace, session_id)
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiAdapterMode {
    NativeLibrary,
    HttpCompatibility,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct GraphitiAdapterContract {
    pub coordinate_owner: &'static str,
    pub invocation_owner: &'static str,
    pub mode: GraphitiAdapterMode,
    pub compatibility_mode: Option<GraphitiAdapterMode>,
    pub required_capabilities: &'static [&'static str],
    pub description: &'static str,
}

impl GraphitiAdapterContract {
    pub fn native_library() -> Self {
        Self {
            coordinate_owner: "S3",
            invocation_owner: "S5",
            mode: GraphitiAdapterMode::NativeLibrary,
            compatibility_mode: Some(GraphitiAdapterMode::HttpCompatibility),
            required_capabilities: &[
                "add_episode",
                "search",
                "build_indices_and_constraints",
                "provenance_event",
            ],
            description: "Graphiti runtime adapter loaded as a native/library-backed S3 service; S5 owns invocation, search policy, and arc governance",
        }
    }
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

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn gateway_protocol_contract_is_s3_protocol_three() {
        assert_eq!(PROTOCOL_VERSION, 3);
        assert_eq!(PROTOCOL_DEV_VERSION, "s3-gateway-dev");
        assert_eq!(DEFAULT_GATEWAY_PORT, TEST_GATEWAY_PORT);
    }

    #[test]
    fn product_method_manifest_keeps_execution_spine() {
        for required in [
            "connect",
            "agent",
            "chat.send",
            "sessions.resolve",
            "skills.install",
            "health.snapshot",
            "wizard.status",
        ] {
            assert!(METHOD_NAMES.contains(&required));
        }
    }

    #[test]
    fn graphiti_contract_keeps_runtime_separate_from_invocation_governance() {
        assert_eq!(GRAPHITI_PORT, 37778);
        assert_eq!(GRAPHITI_BASE_URL, "http://127.0.0.1:37778");
        assert!(GRAPHITI_RUNTIME_AUTHORITY.contains("S3"));
        assert!(GRAPHITI_INVOCATION_OWNER.contains("S5"));
        assert!(!GRAPHITI_RUNTIME_AUTHORITY.contains("sidecar"));
    }

    #[test]
    fn graphiti_adapter_contract_prefers_native_library_runtime() {
        let adapter = GraphitiAdapterContract::native_library();

        assert_eq!(adapter.coordinate_owner, "S3");
        assert_eq!(adapter.invocation_owner, "S5");
        assert_eq!(adapter.mode, GraphitiAdapterMode::NativeLibrary);
        assert_eq!(
            adapter.compatibility_mode,
            Some(GraphitiAdapterMode::HttpCompatibility)
        );
        assert!(adapter.required_capabilities.contains(&"add_episode"));
        assert!(adapter.required_capabilities.contains(&"search"));
        assert!(adapter
            .required_capabilities
            .contains(&"build_indices_and_constraints"));
        assert!(!adapter.description.contains("sidecar"));
    }

    #[test]
    fn redis_temporal_context_contract_owns_session_now_keys() {
        let role = RedisTemporalContextRole::session_now();

        assert_eq!(role.coordinate_owner, "S3");
        assert_eq!(role.redis_namespace, "s3:gateway:temporal");
        assert_eq!(role.ttl_seconds, 300);
        assert_eq!(
            role.session_now_key("test-session-123"),
            "s3:gateway:temporal:session:test-session-123:now:md"
        );
        assert!(role.description.contains("session"));
        assert!(!role.description.contains("graph retrieval"));
    }

    #[test]
    fn session_record_contract_covers_omnipanel_metadata() {
        let record = SessionRecord {
            canonical_key: "agent:main:main".to_owned(),
            aliases: vec!["NOW-main".to_owned()],
            label: Some("Main".to_owned()),
            session_id: "session-1".to_owned(),
            day_id: Some("02-05-2026".to_owned()),
            spawned_by: None,
            vault_now_path: Some("/vault/now.md".to_owned()),
            delivery_context: Some(json!({"mode":"reply"})),
            channel: Some("telegram".to_owned()),
            thread_id: Some("thread-1".to_owned()),
            group_id: Some("group-1".to_owned()),
            group_channel: Some("ops".to_owned()),
            group_space: Some("alpha".to_owned()),
            team_id: Some("team-1".to_owned()),
            team_role: Some("lead".to_owned()),
            orchestration_kind: Some("anima".to_owned()),
            cmux_workspace: Some("workspace".to_owned()),
            cmux_surface: Some("pane".to_owned()),
            cmux_pane_id: Some("pane-1".to_owned()),
            active_agent_id: "pi.main".to_owned(),
            subagent_lineage: vec!["vak".to_owned(), "pi.main".to_owned()],
            workspace_root: "/tmp/workspace".to_owned(),
            bootstrap_scope: "/tmp/bootstrap".to_owned(),
            thinking_level: Some("high".to_owned()),
            verbose_level: Some("normal".to_owned()),
            reasoning_level: Some("high".to_owned()),
            model_override: Some("gpt".to_owned()),
            provider_override: Some("openai".to_owned()),
            cli_session_ids: vec!["cli-1".to_owned()],
            updated_at_ms: 1,
        };

        let value = serde_json::to_value(&record).expect("session record should serialize");
        for storage_field in [
            "canonical_key",
            "aliases",
            "label",
            "active_agent_id",
            "subagent_lineage",
            "workspace_root",
            "bootstrap_scope",
            "team_id",
            "team_role",
            "orchestration_kind",
            "cmux_workspace",
            "cmux_surface",
            "cmux_pane_id",
        ] {
            assert!(
                value.get(storage_field).is_some(),
                "{storage_field} should be present in the session storage contract"
            );
        }
    }

    #[test]
    fn run_and_event_contracts_preserve_temporal_context() {
        let context = RunContext::new("run-1", "agent:main:main", "agent");
        let snapshot = RunSnapshot::ok("run-1", "agent:main:main", 10, 20);
        let event = GatewayEvent::new(
            "agent",
            Some("run-1"),
            Some("agent:main:main"),
            Some(1),
            json!({"state":"accepted"}),
        );

        assert_eq!(context.session_key, "agent:main:main");
        assert_eq!(snapshot.ended_at_ms, Some(20));
        assert_eq!(event.seq, Some(1));
    }

    #[test]
    fn chat_run_registry_tracks_active_runs_by_session() {
        let mut registry = ChatRunRegistry::default();
        registry.add("agent:main:main", "run-a");
        registry.add("agent:main:main", "run-b");

        assert_eq!(registry.list("agent:main:main"), vec!["run-a", "run-b"]);
        assert_eq!(
            registry.remove_run("run-a").as_deref(),
            Some("agent:main:main")
        );
        assert_eq!(registry.pop("agent:main:main").as_deref(), Some("run-b"));
        assert!(registry.list("agent:main:main").is_empty());
    }
}
