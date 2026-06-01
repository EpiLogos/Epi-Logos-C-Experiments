use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub use epi_kernel_contract::{
    AnuttaraDiagnostic, AnuttaraExpression, BioQuaternionState, EnergyDecomposition, KernelElement,
    KernelPhase, KernelProjection, KernelTemporalProjection, KernelTick, KernelTickEnvelope,
    MentalPoleState, PhysicalPoleState, ResonanceVector72, TrajectoryDeposit, TrajectoryDepositRef,
    ENVELOPE_COORDINATE_OWNER, ENVELOPE_PRIVACY_CLASS,
};
pub use portal_core::VakAddress;

pub const DEFAULT_GATEWAY_PORT: u16 = 18794;
pub const TEST_GATEWAY_PORT: u16 = 18794;
pub const PROTOCOL_VERSION: u8 = 3;
pub const PROTOCOL_DEV_VERSION: &str = "s3-gateway-dev";
pub const GRAPHITI_PORT: u16 = 37778;
pub const GRAPHITI_BASE_URL: &str = "http://127.0.0.1:37778";
pub const GRAPHITI_RUNTIME_AUTHORITY: &str = "S3 graphiti runtime adapter";
pub const GRAPHITI_INVOCATION_OWNER: &str = "S5 episodic invocation and arc governance";
pub const TEMPORAL_REDIS_NAMESPACE: &str = "s3:gateway:temporal";
pub const SPACETIME_PROJECTION_SOURCE_HTTP_SQL: &str = "http-sql-poll";
pub const SPACETIME_PROJECTION_SOURCE_NATIVE_WS: &str = "native-websocket";
pub const SPACETIME_PROJECTION_MODE_LITE: &str = "lite";
pub const SPACETIME_PROJECTION_MODE_FULL: &str = "full";

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

pub const PORTAL_EVENT_NAMES: &[&str] = &[
    "portal.token",
    "portal.tool_call",
    "portal.lens_pressure",
    "portal.vak_eval",
    "portal.review_deposit",
    "portal.kairos_shift",
];

pub const COMMAND_METHOD_NAMES: &[&str] = &["s0.command.exec", "s0.command.completion"];

pub const SPACETIME_PROJECTION_TABLES: &[&str] = &[
    "gateway_instance",
    "agent_instance",
    "client_registration",
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
    "temporal_event",
];
pub const SPACETIME_LITE_PROJECTION_TABLES: &[&str] = &[
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
];
pub const SPACETIME_FULL_PROJECTION_TABLES: &[&str] = &[
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
    "gateway_instance",
    "agent_instance",
    "client_registration",
    "temporal_event",
];

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
    "channels.send",
    "channels.files.list",
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
    "s0.command.exec",
    "s0.command.completion",
    "s2.graph.query",
    "s2.graph.node",
    "s2.graph.traverse",
    "s2.graph.pointer_web.compute",
    "s2.graph.pointer_web.refresh",
    "s2.graph.kernel_resonance.record",
    "s2'.coordinate.cypher",
    "s2'.coordinate.ingest",
    "s2'.coordinate.analyse_resonance",
    "s2'.coordinate.persist_analysis",
    "s2'.coordinate.aggregate_resonance",
    "s2'.constraint.list",
    "s2'.constraint.register",
    "s2'.constraint.test",
    "s5.trajectory.verify",
    "s5.ebm.train",
    "s5.ebm.export_state",
    "s5'.anuttara.diagnose",
    "s3'.kernel.envelope.publish",
    "s2'.coordinate.resolve",
    "s2'.retrieve",
    "s2'.rerank",
    "s2'.enrich",
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
    "s4'.mediation.route",
    "s4'.psyche.state",
    "s4'.psyche.update",
    "s4'.permission.get",
    "s3'.temporal.context",
    "s5'.improve.status",
    "s5'.improve.propose",
    "s5'.improve.evaluate",
    "s5'.improve.promote",
    "s5'.improve.history",
    "s5'.epii.status",
    "s5'.epii.deposit",
    "s5'.epii.runtime.context",
    "s5'.gnosis.context.retrieve",
    "s5.episodic.search",
    "s5.episodic.deposit",
    "s5.episodic.kernel_resonance.deposit",
    "s5.episodic.kernel_profile_observation.deposit",
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
    "sessions.run-state",
    "sessions.patch",
    "sessions.reset",
    "sessions.delete",
    "sessions.compact",
    "sessions.fork",
    "sessions.resume",
    "sessions.import",
    "sessions.tree",
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

pub fn portal_event_names() -> &'static [&'static str] {
    PORTAL_EVENT_NAMES
}

pub fn command_method_names() -> &'static [&'static str] {
    COMMAND_METHOD_NAMES
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortalEventContract {
    pub event_name: &'static str,
    pub coordinate_owner: &'static str,
    pub projection_source: &'static str,
    pub payload_keys: &'static [&'static str],
    pub consumer_surfaces: &'static [&'static str],
}

pub const PORTAL_EVENT_CONTRACTS: &[PortalEventContract] = &[
    PortalEventContract {
        event_name: "portal.token",
        coordinate_owner: "S0'/S3",
        projection_source: "gateway transcript stream",
        payload_keys: &["sessionKey", "runId", "delta", "sequence"],
        consumer_surfaces: &["epi portal /", "OmniPanel /"],
    },
    PortalEventContract {
        event_name: "portal.tool_call",
        coordinate_owner: "S0'/S4",
        projection_source: "gateway runtime events",
        payload_keys: &["sessionKey", "toolName", "status", "input", "resultSnippet"],
        consumer_surfaces: &["epi portal /", "OmniPanel /", "run tree"],
    },
    PortalEventContract {
        event_name: "portal.lens_pressure",
        coordinate_owner: "S4'",
        projection_source: "Anima VAK/Psyche runtime",
        payload_keys: &["sessionKey", "lensId", "pressure", "reason"],
        consumer_surfaces: &["epi portal 0", "epi portal /", "Epii workbench"],
    },
    PortalEventContract {
        event_name: "portal.vak_eval",
        coordinate_owner: "S4'",
        projection_source: "Pleroma VAK gate",
        payload_keys: &["sessionKey", "cpf", "ct", "cp", "cf", "cfp", "cs"],
        consumer_surfaces: &["epi portal /", "Anima execution", "OmniPanel /"],
    },
    PortalEventContract {
        event_name: "portal.review_deposit",
        coordinate_owner: "S5'",
        projection_source: "Epii review inbox",
        payload_keys: &[
            "sessionKey",
            "dayId",
            "itemId",
            "requiresHuman",
            "sourceAgent",
        ],
        consumer_surfaces: &["epi portal 1", "OmniPanel /", "Epii inbox"],
    },
    PortalEventContract {
        event_name: "portal.kairos_shift",
        coordinate_owner: "S3'",
        projection_source: "global_temporal_surface",
        payload_keys: &["sessionKey", "dayId", "kairosSnapshotId", "fresh", "source"],
        consumer_surfaces: &["epi portal 0", "epi portal 1", "Tauri M3 clock"],
    },
];

pub fn portal_event_contracts() -> &'static [PortalEventContract] {
    PORTAL_EVENT_CONTRACTS
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewayProtocolFamily {
    JsonRpc,
    Acp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayProtocolContract {
    pub family: GatewayProtocolFamily,
    pub coordinate_owner: &'static str,
    pub session_identity_source: &'static str,
    pub transport_modes: &'static [&'static str],
}

pub const GATEWAY_PROTOCOL_CONTRACTS: &[GatewayProtocolContract] = &[
    GatewayProtocolContract {
        family: GatewayProtocolFamily::JsonRpc,
        coordinate_owner: "S3",
        session_identity_source: "DAY/NOW session key plus subject coordinate",
        transport_modes: &["stdio", "websocket"],
    },
    GatewayProtocolContract {
        family: GatewayProtocolFamily::Acp,
        coordinate_owner: "S3",
        session_identity_source: "DAY/NOW session key plus subject coordinate",
        transport_modes: &["stdio"],
    },
];

pub fn gateway_protocol_contracts() -> &'static [GatewayProtocolContract] {
    GATEWAY_PROTOCOL_CONTRACTS
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformAdapterContract {
    pub trait_name: &'static str,
    pub coordinate_owner: &'static str,
    pub methods: &'static [&'static str],
    pub implementation_internal_methods: &'static [&'static str],
    pub subject_resolver: &'static str,
}

pub const PLATFORM_ADAPTER_CONTRACT: PlatformAdapterContract = PlatformAdapterContract {
    trait_name: "BasePlatformAdapter",
    coordinate_owner: "S3",
    methods: &[
        "connect",
        "disconnect",
        "send",
        "send_typing",
        "send_image",
        "send_document",
        "send_voice",
        "send_video",
        "send_animation",
        "send_image_file",
        "set_message_handler",
    ],
    implementation_internal_methods: &["reconnect_with_backoff", "truncate_message"],
    subject_resolver: "subject-coordinate resolver runs before Anima/Epii invocation",
};

pub fn platform_adapter_contract() -> &'static PlatformAdapterContract {
    &PLATFORM_ADAPTER_CONTRACT
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectCoordinateResolverContract {
    pub coordinate_owner: &'static str,
    pub input_keys: &'static [&'static str],
    pub output_keys: &'static [&'static str],
    pub graph_boundary: &'static str,
}

pub const SUBJECT_COORDINATE_RESOLVER_CONTRACT: SubjectCoordinateResolverContract =
    SubjectCoordinateResolverContract {
        coordinate_owner: "S3",
        input_keys: &[
            "platform",
            "platformUserId",
            "threadId",
            "displayName",
            "dayId",
        ],
        output_keys: &[
            "subjectCoordinate",
            "identityNodeRef",
            "privacyClass",
            "confidence",
        ],
        graph_boundary:
            "may resolve against S2/S5 graph refs; must not mutate protected Pratibimba identity",
    };

pub fn subject_coordinate_resolver_contract() -> &'static SubjectCoordinateResolverContract {
    &SUBJECT_COORDINATE_RESOLVER_CONTRACT
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CronContract {
    pub coordinate_owner: &'static str,
    pub lock_strategy: &'static str,
    pub delivery_target_syntax: &'static [&'static str],
    pub output_writes: &'static [&'static str],
}

pub const CRON_CONTRACT: CronContract = CronContract {
    coordinate_owner: "S3/S3'",
    lock_strategy: "file-locked tick",
    delivery_target_syntax: &["origin", "local", "platform_name", "platform_name:chat_id"],
    output_writes: &[
        "Graphiti episodic record",
        "DAY/NOW vault artifact through Hen/Khora write law",
    ],
};

pub fn cron_contract() -> &'static CronContract {
    &CRON_CONTRACT
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpEventCursorContract {
    pub coordinate_owner: &'static str,
    pub methods: &'static [&'static str],
    pub event_sources: &'static [&'static str],
    pub ordering_key: &'static str,
}

pub const MCP_EVENT_CURSOR_CONTRACT: McpEventCursorContract = McpEventCursorContract {
    coordinate_owner: "S5'",
    methods: &[
        "events_poll(after_cursor)",
        "events_wait(after_cursor, timeout)",
    ],
    event_sources: &["Epii inbox", "autoresearch", "Aletheia crystallisation"],
    ordering_key: "monotonic cursor over created_at + item_id",
};

pub fn mcp_event_cursor_contract() -> &'static McpEventCursorContract {
    &MCP_EVENT_CURSOR_CONTRACT
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelEnvelopeContract {
    pub coordinate_owner: &'static str,
    pub projection_owner: &'static str,
    pub privacy: &'static str,
    pub typed_publish_method: &'static str,
    pub legacy_json_column: &'static str,
    pub legacy_session_method: &'static str,
    pub deposit_method: &'static str,
    pub diagnostic_method: &'static str,
    pub required_optional_fields: &'static [&'static str],
}

pub const KERNEL_ENVELOPE_CONTRACT: KernelEnvelopeContract = KernelEnvelopeContract {
    coordinate_owner: ENVELOPE_COORDINATE_OWNER,
    projection_owner: "S3'",
    privacy: ENVELOPE_PRIVACY_CLASS,
    typed_publish_method: "s3'.kernel.envelope.publish",
    legacy_json_column: "kernel_projection_json",
    legacy_session_method: "s3'.temporal.context",
    deposit_method: "s5.episodic.kernel_resonance.deposit",
    diagnostic_method: "s5'.anuttara.diagnose",
    required_optional_fields: &[
        "observedResonance",
        "targetResonance",
        "physicalPole",
        "mentalPole",
        "trajectoryDeposit",
        "anuttaraDiagnostic",
    ],
};

pub fn kernel_envelope_contract() -> &'static KernelEnvelopeContract {
    &KERNEL_ENVELOPE_CONTRACT
}

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionPlan {
    pub mode: String,
    pub subscription_mode: String,
    pub endpoint: String,
    pub database: String,
    pub session_key: String,
    pub agent_id: String,
    pub coordinate_owner: String,
    pub agent_access_owner: String,
    pub tables: Vec<String>,
    pub sql_fallback_mode: String,
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct SpacetimeProjectionRows {
    pub session: Option<Value>,
    pub kairos: Option<Value>,
    pub global: Option<Value>,
}

impl SpacetimeProjectionPlan {
    pub fn native(endpoint: impl Into<String>, database: impl Into<String>) -> Self {
        Self::new(
            SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            endpoint.into(),
            database.into(),
        )
    }

    pub fn http_sql(endpoint: impl Into<String>, database: impl Into<String>) -> Self {
        Self::new(
            SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
            endpoint.into(),
            database.into(),
        )
    }

    pub fn new(mode: impl Into<String>, endpoint: String, database: String) -> Self {
        Self {
            mode: mode.into(),
            subscription_mode: SPACETIME_PROJECTION_MODE_LITE.to_owned(),
            endpoint,
            database,
            session_key: String::new(),
            agent_id: String::new(),
            coordinate_owner: "S3'".to_owned(),
            agent_access_owner: "S4/S5".to_owned(),
            tables: SPACETIME_LITE_PROJECTION_TABLES
                .iter()
                .map(|table| (*table).to_owned())
                .collect(),
            sql_fallback_mode: SPACETIME_PROJECTION_SOURCE_HTTP_SQL.to_owned(),
        }
    }

    pub fn for_session(
        mut self,
        session_key: impl Into<String>,
        agent_id: impl Into<String>,
    ) -> Self {
        self.session_key = session_key.into();
        self.agent_id = agent_id.into();
        self
    }

    pub fn for_subscription_mode(mut self, subscription_mode: impl AsRef<str>) -> Self {
        match subscription_mode.as_ref() {
            SPACETIME_PROJECTION_MODE_FULL => {
                self.subscription_mode = SPACETIME_PROJECTION_MODE_FULL.to_owned();
                self.tables = SPACETIME_FULL_PROJECTION_TABLES
                    .iter()
                    .map(|table| (*table).to_owned())
                    .collect();
            }
            _ => {
                self.subscription_mode = SPACETIME_PROJECTION_MODE_LITE.to_owned();
                self.tables = SPACETIME_LITE_PROJECTION_TABLES
                    .iter()
                    .map(|table| (*table).to_owned())
                    .collect();
            }
        }
        self
    }

    pub fn subscribe_url(&self) -> String {
        format!(
            "{}/v1/database/{}/subscribe",
            self.endpoint.trim_end_matches('/'),
            self.database
        )
    }

    pub fn subscribe_multi_message(&self) -> Value {
        serde_json::json!({
            "SubscribeMulti": {
                "query_strings": self.subscription_queries(),
                "request_id": 1,
                "query_id": { "id": 1 }
            }
        })
    }

    pub fn subscription_queries(&self) -> Vec<String> {
        let session_key = sql_string(&self.session_key);
        self.tables
            .iter()
            .filter_map(|table| match table.as_str() {
                "session_surface" | "kairos_surface" | "global_temporal_surface" => Some(format!(
                    "SELECT * FROM {table} WHERE session_key = {session_key}"
                )),
                "temporal_event" => Some(format!(
                    "SELECT * FROM temporal_event WHERE session_key = {session_key}"
                )),
                _ => None,
            })
            .collect()
    }
}

impl SpacetimeProjectionRows {
    pub fn from_subscription_message(message: &Value) -> Result<Self, String> {
        let Some(update) = subscription_database_update(message) else {
            return Ok(Self::default());
        };
        let tables = update
            .get("tables")
            .and_then(Value::as_array)
            .ok_or_else(|| "spacetimedb subscription update missing tables".to_owned())?;
        let mut rows = Self::default();

        for table in tables {
            let table_name = table
                .get("table_name")
                .or_else(|| table.get("tableName"))
                .and_then(Value::as_str)
                .unwrap_or_default();
            let Some(row) = first_inserted_row(table) else {
                continue;
            };
            match table_name {
                "session_surface" => rows.session = Some(subscription_session_row(row)?),
                "kairos_surface" => rows.kairos = Some(subscription_kairos_row(row)?),
                "global_temporal_surface" => {
                    rows.global = Some(subscription_global_temporal_row(row)?)
                }
                _ => {}
            }
        }

        Ok(rows)
    }
}

fn subscription_database_update(message: &Value) -> Option<&Value> {
    message
        .get("SubscribeMultiApplied")
        .and_then(|value| value.get("update"))
        .or_else(|| {
            message
                .get("InitialSubscription")
                .and_then(|value| value.get("database_update"))
        })
        .or_else(|| {
            message
                .get("InitialSubscription")
                .and_then(|value| value.get("databaseUpdate"))
        })
        .or_else(|| {
            message
                .get("TransactionUpdateLight")
                .and_then(|value| value.get("update"))
        })
        .or_else(|| {
            message
                .get("TransactionUpdate")
                .and_then(|value| value.get("status"))
                .and_then(|status| status.get("Committed"))
        })
}

fn first_inserted_row(table: &Value) -> Option<&Value> {
    table
        .get("updates")
        .and_then(Value::as_array)?
        .iter()
        .find_map(|update| {
            update
                .get("inserts")
                .and_then(Value::as_array)
                .and_then(|rows| rows.first())
        })
}

fn subscription_session_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row
        .as_array()
        .ok_or_else(|| "session_surface subscription row must be object or array".to_owned())?;
    Ok(serde_json::json!({
        "session_key": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "agent_instance_id": subscription_string(values, 3),
        "day_id": subscription_string(values, 4),
        "parent_session_key": subscription_string(values, 5),
        "source_session_key": subscription_string(values, 6),
        "source_session_kind": subscription_string(values, 7),
        "runtime_cwd": subscription_string(values, 8),
        "vault_root": subscription_string(values, 9),
        "resource_loader_id": subscription_string(values, 10),
        "retry_settlement_state": subscription_string(values, 11),
        "diagnostics_json": subscription_string(values, 12),
        "now_path": subscription_string(values, 13),
        "now_wikilink": subscription_string(values, 14),
        "history_archive_path": subscription_string(values, 15),
        "redis_session_now_key": subscription_string(values, 16),
        "redis_day_context_key": subscription_string(values, 17),
        "graphiti_arc_id": subscription_string(values, 18),
        "pratibimba_anchor_ref": subscription_string(values, 19),
        "kairos_snapshot_id": subscription_string(values, 20),
        "kernel_projection_json": subscription_string(values, 21),
        "updated_at": subscription_u64(values, 22),
    }))
}

fn subscription_kairos_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row
        .as_array()
        .ok_or_else(|| "kairos_surface subscription row must be object or array".to_owned())?;
    Ok(serde_json::json!({
        "kairos_snapshot_id": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "day_id": subscription_string(values, 3),
        "session_key": subscription_string(values, 4),
        "available": subscription_bool(values, 5),
        "fresh": subscription_bool(values, 6),
        "dominant_sign": subscription_u64(values, 7),
        "dominant_element": subscription_u64(values, 8),
        "active_decan": subscription_u64(values, 9),
        "active_tattva": subscription_u64(values, 10),
        "planets_json": subscription_string(values, 11),
        "source": subscription_string(values, 12),
        "privacy_class": subscription_string(values, 13),
        "updated_at": subscription_u64(values, 14),
    }))
}

fn subscription_global_temporal_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row.as_array().ok_or_else(|| {
        "global_temporal_surface subscription row must be object or array".to_owned()
    })?;
    Ok(serde_json::json!({
        "surface_key": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "agent_instance_id": subscription_string(values, 3),
        "session_key": subscription_string(values, 4),
        "day_id": subscription_string(values, 5),
        "day_wikilink": subscription_string(values, 6),
        "now_path": subscription_string(values, 7),
        "now_wikilink": subscription_string(values, 8),
        "now_lineage_key": subscription_string(values, 9),
        "history_archive_path": subscription_string(values, 10),
        "redis_session_now_key": subscription_string(values, 11),
        "redis_day_context_key": subscription_string(values, 12),
        "redis_global_context_key": subscription_string(values, 13),
        "graphiti_namespace_ref": subscription_string(values, 14),
        "graphiti_session_arc_id": subscription_string(values, 15),
        "pratibimba_anchor_ref": subscription_string(values, 16),
        "kairos_snapshot_id": subscription_string(values, 17),
        "kernel_projection_json": subscription_string(values, 18),
        "privacy_class": subscription_string(values, 19),
        "updated_at": subscription_u64(values, 20),
    }))
}

fn subscription_string(values: &[Value], index: usize) -> String {
    values
        .get(index)
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_owned()
}

fn subscription_bool(values: &[Value], index: usize) -> bool {
    values.get(index).and_then(Value::as_bool).unwrap_or(false)
}

fn subscription_u64(values: &[Value], index: usize) -> u64 {
    values.get(index).and_then(Value::as_u64).unwrap_or(0)
}

fn sql_string(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
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
    pub model_override: Option<Option<String>>,
    pub provider_override: Option<Option<String>>,
    pub cli_session_ids: Option<Vec<String>>,
    pub vak_address: Option<portal_core::VakAddress>,
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

    pub fn day_context_key(&self, day_id: &str) -> String {
        format!("{}:day:{}:context", self.redis_namespace, day_id)
    }

    pub fn day_kairos_key(&self, day_id: &str) -> String {
        format!("{}:day:{}:kairos", self.redis_namespace, day_id)
    }

    pub fn session_kairos_key(&self, session_id: &str) -> String {
        format!("{}:session:{}:kairos", self.redis_namespace, session_id)
    }

    pub fn personal_orientation_key(&self, anchor_id: &str) -> String {
        format!(
            "{}:personal:{}:orientation",
            self.redis_namespace, anchor_id
        )
    }

    pub fn agent_orientation_key(&self, agent_id: &str, session_id: &str) -> String {
        format!(
            "{}:agent:{}:session:{}:orientation",
            self.redis_namespace, agent_id, session_id
        )
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
            "sessions.run-state",
            "sessions.resolve",
            "sessions.fork",
            "sessions.resume",
            "sessions.import",
            "sessions.tree",
            "skills.install",
            "health.snapshot",
            "wizard.status",
        ] {
            assert!(METHOD_NAMES.contains(&required));
        }
    }

    #[test]
    fn gateway_session_operation_contract_covers_omnipanel_runtime_surface() {
        let contracts = gateway_session_operation_contracts();
        let methods: Vec<&str> = contracts
            .iter()
            .map(|contract| contract.gateway_method)
            .collect();

        for required in [
            "sessions.list",
            "sessions.resolve",
            "sessions.preview",
            "sessions.patch",
            "sessions.reset",
            "sessions.delete",
            "sessions.compact",
            "sessions.fork",
            "sessions.resume",
            "sessions.import",
            "sessions.tree",
            "chat.history",
            "chat.send",
            "chat.abort",
            "channels.status",
            "channels.logout",
        ] {
            assert!(
                methods.contains(&required),
                "gateway session contract should expose {required}; got {methods:?}"
            );
        }

        let history = contracts
            .iter()
            .find(|contract| contract.kind == GatewaySessionOperationKind::ChatHistory)
            .expect("chat history contract should be present");
        assert_eq!(history.coordinate_owner, "S3");
        assert_eq!(history.projection_table, "session_surface");
        assert_eq!(history.request_keys, &["sessionKey"]);
        assert!(history.response_keys.contains(&"canonicalKey"));
        assert!(METHOD_NAMES.contains(&history.gateway_method));

        let run_state = contracts
            .iter()
            .find(|contract| contract.kind == GatewaySessionOperationKind::RunState)
            .expect("run state contract should be present");
        assert_eq!(run_state.gateway_method, "sessions.run-state");
        assert!(METHOD_NAMES.contains(&run_state.gateway_method));
        assert!(run_state.response_keys.contains(&"retrySettlementState"));
        assert!(run_state.response_keys.contains(&"idleState"));
        assert!(run_state.response_keys.contains(&"diagnostics"));

        let channel_binding = contracts
            .iter()
            .find(|contract| contract.kind == GatewaySessionOperationKind::ChannelBindingStatus)
            .expect("channel binding status contract should be present");
        assert_eq!(channel_binding.gateway_method, "channels.status");
        assert_eq!(channel_binding.agent_access_owner, "S4/S5");
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
        assert_eq!(
            role.day_context_key("07-05-2026"),
            "s3:gateway:temporal:day:07-05-2026:context"
        );
        assert_eq!(
            role.day_kairos_key("07-05-2026"),
            "s3:gateway:temporal:day:07-05-2026:kairos"
        );
        assert_eq!(
            role.session_kairos_key("test-session-123"),
            "s3:gateway:temporal:session:test-session-123:kairos"
        );
        assert_eq!(
            role.personal_orientation_key("pratibimba-abcd1234"),
            "s3:gateway:temporal:personal:pratibimba-abcd1234:orientation"
        );
        assert_eq!(
            role.agent_orientation_key("anima", "test-session-123"),
            "s3:gateway:temporal:agent:anima:session:test-session-123:orientation"
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
            parent_session_key: Some("agent:root:main".to_owned()),
            source_session_key: Some("agent:source:main".to_owned()),
            source_session_kind: Some("fork".to_owned()),
            vault_now_path: Some("/vault/now.md".to_owned()),
            runtime_cwd: Some("/repo".to_owned()),
            vault_root: Some("/vault".to_owned()),
            resource_loader_id: Some("loader-1".to_owned()),
            retry_settlement_state: Some("idle".to_owned()),
            diagnostics: vec![json!({"severity":"info","message":"ready"})],
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
            vak_address: None,
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
            "parent_session_key",
            "source_session_key",
            "source_session_kind",
            "runtime_cwd",
            "vault_root",
            "resource_loader_id",
            "retry_settlement_state",
            "diagnostics",
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

    #[test]
    fn kernel_envelope_contract_registers_typed_publish_method_and_keeps_legacy_json_column() {
        let envelope = kernel_envelope_contract();
        assert_eq!(envelope.coordinate_owner, "S0/QL-meta");
        assert_eq!(envelope.privacy, "safe-public-current-kernel-tick");
        assert_eq!(envelope.typed_publish_method, "s3'.kernel.envelope.publish");
        assert_eq!(envelope.legacy_json_column, "kernel_projection_json");
        assert!(METHOD_NAMES.contains(&envelope.typed_publish_method));
        assert!(METHOD_NAMES.contains(&envelope.deposit_method));
        assert!(METHOD_NAMES.contains(&envelope.diagnostic_method));
        for required in [
            "s2'.coordinate.cypher",
            "s2'.coordinate.ingest",
            "s2'.coordinate.analyse_resonance",
            "s2'.coordinate.persist_analysis",
            "s2'.coordinate.aggregate_resonance",
            "s2'.constraint.list",
            "s2'.constraint.register",
            "s2'.constraint.test",
            "s5.trajectory.verify",
            "s5.ebm.train",
            "s5.ebm.export_state",
            "s5.episodic.kernel_profile_observation.deposit",
        ] {
            assert!(
                METHOD_NAMES.contains(&required),
                "kernel-aligned method {required} missing from METHOD_NAMES"
            );
        }
    }

    #[test]
    fn kernel_tick_envelope_serialises_into_legacy_kernel_projection_json_shape() {
        let projection = KernelProjection::default();
        let envelope = KernelTickEnvelope::from_kernel_projection(1, &projection);
        let value = serde_json::to_value(&envelope).expect("envelope serialises");
        let privacy = value
            .get("privacy")
            .and_then(Value::as_str)
            .expect("privacy field");
        let element = value
            .get("tick")
            .and_then(|tick| tick.get("element"))
            .and_then(Value::as_str)
            .expect("tick.element field");
        assert_eq!(privacy, "safe-public-current-kernel-tick");
        assert_eq!(element, "BimbaEncoding");

        let temporal = envelope.to_temporal_projection();
        let legacy = serde_json::to_value(&temporal).expect("temporal serialises");
        assert_eq!(legacy["privacy"], "safe-public-current-kernel-tick");
        assert_eq!(legacy["coordinateOwner"], "S0/QL-meta");
    }

    #[test]
    fn anuttara_diagnostic_carried_in_envelope_round_trips_through_serde() {
        let projection = KernelProjection::default();
        let diag = AnuttaraDiagnostic::parse("?#2-1-3-4{2,4}; ○").expect("parses");
        let envelope = KernelTickEnvelope::from_kernel_projection(2, &projection)
            .with_session_key("session-1")
            .with_source_coordinate("M2-1-3")
            .with_anuttara_diagnostic(diag.clone());

        let json = serde_json::to_string(&envelope).expect("serialises");
        let restored: KernelTickEnvelope = serde_json::from_str(&json).expect("round-trips");
        assert_eq!(restored.anuttara_diagnostic, Some(diag));
        assert_eq!(restored.source_coordinate.as_deref(), Some("M2-1-3"));
    }

    #[test]
    fn spacetimedb_projection_contract_builds_native_subscribe_multi_and_decodes_updates() {
        let plan = SpacetimeProjectionPlan::native("ws://127.0.0.1:3000", "epi-logos-runtime")
            .for_session("agent:main:main", "epii");
        let message = plan.subscribe_multi_message();

        assert_eq!(plan.mode, "native-websocket");
        assert_eq!(plan.subscription_mode, "lite");
        assert_eq!(plan.coordinate_owner, "S3'");
        assert_eq!(plan.agent_access_owner, "S4/S5");
        assert_eq!(
            plan.tables,
            vec![
                "session_surface",
                "kairos_surface",
                "global_temporal_surface",
            ]
        );
        assert_eq!(
            plan.subscribe_url(),
            "ws://127.0.0.1:3000/v1/database/epi-logos-runtime/subscribe"
        );
        assert_eq!(message["SubscribeMulti"]["request_id"], 1);
        assert!(message["SubscribeMulti"]["query_strings"]
            .as_array()
            .unwrap()
            .iter()
            .any(|query| query
                == "SELECT * FROM session_surface WHERE session_key = 'agent:main:main'"));

        let full_plan = plan
            .clone()
            .for_subscription_mode(SPACETIME_PROJECTION_MODE_FULL);
        assert_eq!(full_plan.subscription_mode, "full");
        assert!(full_plan
            .tables
            .iter()
            .any(|table| table == "temporal_event"));
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query
                == "SELECT * FROM temporal_event WHERE session_key = 'agent:main:main'"));

        let update = json!({
            "SubscribeMultiApplied": {
                "update": {
                    "tables": [{
                        "table_name": "session_surface",
                        "updates": [{
                            "inserts": [[
                                "agent:main:main",
                                "install-local",
                                "gateway-main",
                                "gateway-main:epii:session-main",
                                "07-05-2026",
                                "",
                                "",
                                "",
                                "/repo",
                                "/vault",
                                "loader-main",
                                "idle",
                                "[]",
                                "/vault/Empty/Present/07-05-2026/session-main/now.md",
                                "[[NOW session-main]]",
                                "/vault/Pratibimba/Self/Action/History/2026/05/W19/07",
                                "s3:gateway:temporal:session:session-main:now:md",
                                "s3:gateway:temporal:day:07-05-2026:context",
                                "day:07-05-2026:session:session-main",
                                "pratibimba-abcd1234",
                                "kairos-07-05-2026-session-main",
                                r#"{"privacy":"safe-public-current-kernel-tick","tick":{"element":"SlashFlip"}}"#,
                                1778179200
                            ]]
                        }]
                    }]
                }
            }
        });

        let rows = SpacetimeProjectionRows::from_subscription_message(&update).unwrap();
        let session = rows.session.unwrap();
        assert_eq!(session["session_key"], "agent:main:main");
        assert_eq!(
            session["kernel_projection_json"],
            r#"{"privacy":"safe-public-current-kernel-tick","tick":{"element":"SlashFlip"}}"#
        );
    }
}
