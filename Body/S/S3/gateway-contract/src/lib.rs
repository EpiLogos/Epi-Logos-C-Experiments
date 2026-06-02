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
pub const SPACETIME_CLOCK_PROTOCOL_VERSION: &str = "2026-06-01.s3-clock-v1";
// 03.T4: bumped from v1 → v2 because the shared-cosmos schema now includes
// world_clock_tick, coincidence_tick, and module_version. The
// epi-spacetime-module crate carries identically-versioned constants so
// drift between host and module is observable via the module_version row.
pub const SPACETIME_PROJECTION_SCHEMA_VERSION: &str = "2026-06-02.s3-projection-v2";
pub const SPACETIME_REDUCER_ABI_VERSION: &str = "2026-06-02.s3-reducer-v2";
pub const SPACETIME_SUBSCRIBE_METHOD: &str = "s3'.temporal.subscribe";
pub const SPACETIME_SUBSCRIBE_ALIAS_METHOD: &str = "s3'.spacetime.subscribe";

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
    "world_clock",
    "world_clock_tick",
    "pratibimba_presence",
    "shared_archetype_event",
    "coincidence",
    "coincidence_tick",
    "module_version",
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
    "world_clock",
    "world_clock_tick",
    "pratibimba_presence",
    "shared_archetype_event",
    "coincidence",
    "coincidence_tick",
    "module_version",
];

pub const SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS: &[&str] = &[
    "requested",
    "applied",
    "delta",
    "resync",
    "error",
    "closed",
    "fallback-active",
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
    "s3'.temporal.subscribe",
    "s3'.spacetime.subscribe",
    // 03.T6.5: S1 vault gateway surface.
    "s1'.vault.read_file",
    "s1'.vault.write_file",
    "s1'.vault.rename_file",
    "s1'.vault.move_file",
    "s1'.semantic.suggest_links",
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

// =================== 13.T2 executable dispatch-plan contract ===================
//
// Track 13 Tranche T2 — Plan section 13.3 lines 73–91. The dispatch-plan
// contract is the S3-owned **route law** that every gateway method MUST be
// mapped against. It answers a single question per method: which substrate
// owns the executable implementation?
//
// The original plan deliverable enumerates six dispatch kinds:
//
// 1. `S3 native handler` — implementation lives in `Body/S/S3/gateway` (or
//    `Body/S/S3/graphiti-runtime` adjacent to it); S3 is its own authority.
// 2. `S2 graph service adapter` — gateway forwards to `Body/S/S2/graph-services`
//    or `Body/S/S2/graph-schema`.
// 3. `S4 orchestration adapter` — gateway forwards to `Body/S/S4/ta-onta` (or
//    the PI agent runtime via S4 anima/pleroma).
// 4. `S5 governance adapter` — gateway forwards to `Body/S/S5/{epii-agent-core,
//    epii-review-core, epii-autoresearch-core, epi-kbase-core, epi-gnostic, ...}`.
// 5. `S0 product adapter` — surface intrinsic to the S0 product membrane
//    (system/config/devices/skills/wizard/talk/etc.).
// 6. `Missing` — declared in METHOD_NAMES but no executable home yet; carries
//    a `needs_extraction_to` annotation so Track 13 follow-up tranches can
//    target it.
//
// **Plan extension (13.T2 closure)**: 03.T6.5 introduced the `s1'.vault.*` and
// `s1'.semantic.suggest_links` surface — an adapter onto the S1 Hen vault
// gatekeeper. This pre-dates Track 13 but post-dates the six-kind enumeration
// in the plan body. We surface it as the seventh kind `S1HenAdapter` and the
// 13.T2 evidence flags it explicitly so future readers know the canonical
// enumeration grew by one.
//
// The plan also tracks two methods that are currently routed through
// `GatewayDispatchOwner::S0ProductAdapter` in the S3 gateway crate but whose
// **execution body** lives in the S5 episodic / S5 epii surfaces in the
// future. Those keep their CURRENT S0 product adapter classification here
// because right now the gateway dispatch lands in S0 — Track 13 T7 owns the
// graduation to S5 governance.
//
// **S0 is not allowed to maintain a parallel route table.** It MUST consume
// this contract (or `GatewayDispatchRoute` in `epi_s3_gateway::dispatch`) and
// MUST NOT re-classify a method on its own. The test
// `s0_gate_server_dispatches_only_via_s3_route_metadata` in
// `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs` enforces this.

/// The six (plus one) dispatch kinds that classify every method in
/// [`METHOD_NAMES`]. See module-level comment for the canonical enumeration.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MethodDispatchKind {
    /// `S3 native handler` — the implementation is owned by the S3 gateway
    /// substrate itself (`Body/S/S3/gateway` and adjacent crates).
    S3NativeHandler,
    /// `S2 graph service adapter` — the gateway dispatches into the S2
    /// graph-services / graph-schema authority.
    S2GraphServiceAdapter,
    /// `S4 orchestration adapter` — the gateway dispatches into the S4
    /// ta-onta orchestration authority (or PI agent runtime).
    S4OrchestrationAdapter,
    /// `S5 governance adapter` — the gateway dispatches into one of the S5
    /// governance crates (epii agent/review/improve/gnosis/kbase/episodic).
    S5GovernanceAdapter,
    /// `S0 product adapter` — the surface belongs to the S0 product membrane
    /// (operator CLI, devices, system, config, skills, wizard, voice).
    S0ProductAdapter,
    /// `S1 Hen vault adapter` — 03.T6.5 vault gateway surface routing into
    /// the S1 Hen vault gatekeeper. Plan extension beyond the original six
    /// dispatch kinds, see module-level 13.T2 comment.
    S1HenAdapter,
    /// `Missing` — method appears in METHOD_NAMES but no executable home
    /// exists yet. The `needs_extraction_to` annotation on
    /// [`MethodDispatchPlanEntry`] names where the work is expected to land.
    Missing,
}

impl MethodDispatchKind {
    pub fn label(&self) -> &'static str {
        match self {
            Self::S3NativeHandler => "S3 native handler",
            Self::S2GraphServiceAdapter => "S2 graph service adapter",
            Self::S4OrchestrationAdapter => "S4 orchestration adapter",
            Self::S5GovernanceAdapter => "S5 governance adapter",
            Self::S0ProductAdapter => "S0 product adapter",
            Self::S1HenAdapter => "S1 Hen vault adapter",
            Self::Missing => "Missing",
        }
    }
}

/// One row of the executable dispatch-plan contract. Every method name in
/// [`METHOD_NAMES`] MUST have exactly one corresponding entry in
/// [`METHOD_DISPATCH_PLAN`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MethodDispatchPlanEntry {
    /// The gateway method this entry classifies. MUST exist in
    /// [`METHOD_NAMES`].
    pub method: &'static str,
    /// The kind of dispatch performed by the gateway for this method.
    pub kind: MethodDispatchKind,
    /// The Body-native authority crate / module path that ultimately
    /// executes this method's law. For `S3NativeHandler` this points at the
    /// S3 gateway runtime itself; for adapter kinds, at the target authority.
    /// For `Missing`, this is the *planned* authority path or an empty hint.
    pub authority_path: &'static str,
    /// For `Missing` entries, the Track-13 (or follow-on) tranche where the
    /// implementation should land. `None` for non-Missing entries.
    pub needs_extraction_to: Option<&'static str>,
}

/// The S3-owned executable dispatch-plan. Every entry in [`METHOD_NAMES`]
/// MUST have a row here.
pub const METHOD_DISPATCH_PLAN: &[MethodDispatchPlanEntry] = &[
    // ----- S3 native handlers (gateway runtime surfaces) -----
    MethodDispatchPlanEntry {
        method: "connect",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::protocol",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "agent",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::dispatch (S4 ta-onta call-out wired via S3)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "agent.identity.get",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::dispatch",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "agent.wait",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::dispatch",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "agents.list",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::dispatch",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "channels.status",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (channel runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "channels.send",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (channel runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "channels.files.list",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (channel runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "channels.logout",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (channel runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "chat.history",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (chat runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "chat.abort",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (chat runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "chat.send",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (chat runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "chat.inject",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (chat runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "send",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway (session runtime, planned 13.T3 extraction)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.list",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.preview",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.resolve",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.run-state",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.patch",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.reset",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.delete",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.compact",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.fork",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.resume",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.import",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "sessions.tree",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::sessions",
        needs_extraction_to: None,
    },
    // S3' temporal/spacetime surfaces are part of the S3 native handler set.
    MethodDispatchPlanEntry {
        method: "s3'.temporal.context",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal + Body/S/S0/portal-core kernel",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.temporal.subscribe",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal subscription multiplex",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.spacetime.subscribe",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal subscription multiplex (spacetime alias)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.kernel.envelope.publish",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway-contract::KERNEL_ENVELOPE_CONTRACT",
        needs_extraction_to: None,
    },
    // Heartbeat/wake are S3 native runtime surfaces.
    MethodDispatchPlanEntry {
        method: "last-heartbeat",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::runtime",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "set-heartbeats",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::runtime",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "wake",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::runtime",
        needs_extraction_to: None,
    },

    // ----- S2 graph service adapters -----
    MethodDispatchPlanEntry {
        method: "s2.graph.query",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.node",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.traverse",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.pointer_web.compute",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.pointer_web.refresh",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.kernel_resonance.record",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services + Body/S/S5/epi-kernel kernel arena",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.cypher",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::coordinate",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.ingest",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::coordinate",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.analyse_resonance",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::resonance",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.persist_analysis",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::resonance",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.aggregate_resonance",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::resonance",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.constraint.list",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::constraint",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.constraint.register",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::constraint",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.constraint.test",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::constraint",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.coordinate.resolve",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::coordinate",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.retrieve",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::retrieval",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.rerank",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::retrieval",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2'.enrich",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::retrieval",
        needs_extraction_to: None,
    },

    // ----- S4 orchestration adapters -----
    MethodDispatchPlanEntry {
        method: "s4.agent.query",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4.agent.notify",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4.agent.status",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.vak.evaluate",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta/S4-4p-anima",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.orchestrate",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta/S4-4p-anima",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.mediation.route",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta/S4-4p-anima",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.psyche.state",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta/S4-4p-anima",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.psyche.update",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/ta-onta/S4-4p-anima",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s4'.permission.get",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/plugins/pleroma/capability-matrix.json",
        needs_extraction_to: None,
    },

    // ----- S5 governance adapters -----
    MethodDispatchPlanEntry {
        method: "s5.trajectory.verify",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.ebm.train",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.ebm.export_state",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.anuttara.diagnose",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core (anuttara diagnostic)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.improve.status",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.improve.propose",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.improve.evaluate",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.improve.promote",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.improve.history",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-autoresearch-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.epii.status",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.epii.deposit",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.epii.runtime.context",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnosis.context.retrieve",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-agent-core (gnosis context)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.episodic.search",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S3/graphiti-runtime + Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.episodic.deposit",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S3/graphiti-runtime + Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.episodic.kernel_resonance.deposit",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S3/graphiti-runtime + Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5.episodic.kernel_profile_observation.deposit",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S3/graphiti-runtime + Body/S/S5/epii-agent-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.review.inbox",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-review-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.review.submit",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-review-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.review.resolve",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-review-core",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.review.history",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epii-review-core",
        needs_extraction_to: None,
    },

    // ----- S1 Hen vault adapter (plan extension; see module-level comment) -----
    MethodDispatchPlanEntry {
        method: "s1'.vault.read_file",
        kind: MethodDispatchKind::S1HenAdapter,
        authority_path: "Body/S/S1/hen-compiler-core (vault gatekeeper)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s1'.vault.write_file",
        kind: MethodDispatchKind::S1HenAdapter,
        authority_path: "Body/S/S1/hen-compiler-core (vault gatekeeper)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s1'.vault.rename_file",
        kind: MethodDispatchKind::S1HenAdapter,
        authority_path: "Body/S/S1/hen-compiler-core (vault gatekeeper)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s1'.vault.move_file",
        kind: MethodDispatchKind::S1HenAdapter,
        authority_path: "Body/S/S1/hen-compiler-core (vault gatekeeper)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s1'.semantic.suggest_links",
        kind: MethodDispatchKind::S1HenAdapter,
        authority_path: "Body/S/S1/hen-compiler-core (smart_env semantic reader)",
        needs_extraction_to: None,
    },

    // ----- S0 product adapters (operator membrane surfaces) -----
    MethodDispatchPlanEntry {
        method: "browser.request",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/browser.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "web.login.start",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/auth.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "web.login.wait",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/auth.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "config.get",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/config.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "config.schema",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/config.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "config.set",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/config.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "config.patch",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/config.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "config.apply",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/config.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s0.command.exec",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/portal/command.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s0.command.completion",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/portal/command.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.add",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.update",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.remove",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.run",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "cron.runs",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/cron.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "device.pair.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/devices.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "device.pair.approve",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/devices.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "device.pair.reject",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/devices.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "device.token.rotate",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/devices.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "device.token.revoke",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/devices.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approval.request",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approval.resolve",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approvals.get",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approvals.set",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approvals.node.get",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "exec.approvals.node.set",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/approvals.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "logs.tail",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/logs.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "models.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/models.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "health",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "status.summary",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "health.snapshot",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "presence.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "skills.status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/skills.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "skills.bins",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/skills.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "skills.install",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/skills.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "skills.update",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/skills.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "usage.status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "usage.cost",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.pair.request",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.pair.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.pair.approve",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.pair.reject",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.pair.verify",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.rename",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.list",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.describe",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.invoke",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.invoke.result",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "node.event",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/nodes.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "system-presence",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "system-event",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/system.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "talk.mode",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice/talk runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.enable",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.disable",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.convert",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.setProvider",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "tts.providers",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "voicewake.get",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "voicewake.set",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate (voice runtime)",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "update.run",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/update.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "wizard.start",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/wizard.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "wizard.next",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/wizard.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "wizard.cancel",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/wizard.rs",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "wizard.status",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-cli/src/gate/wizard.rs",
        needs_extraction_to: None,
    },
];

/// Return the executable dispatch-plan contract — every method that appears
/// in [`METHOD_NAMES`] is mapped to a [`MethodDispatchKind`] here. S0 (and any
/// other consumer) MUST consult this rather than maintaining its own table.
pub fn method_dispatch_plan() -> &'static [MethodDispatchPlanEntry] {
    METHOD_DISPATCH_PLAN
}

/// Find the dispatch-plan entry for a given method name. `None` indicates
/// the method is not registered as part of the executable dispatch contract;
/// callers SHOULD treat that as a hard error since the
/// `every_method_has_dispatch_plan_entry` integrity test in the gateway
/// crate forbids it.
pub fn method_dispatch_plan_entry(method: &str) -> Option<&'static MethodDispatchPlanEntry> {
    METHOD_DISPATCH_PLAN
        .iter()
        .find(|entry| entry.method == method)
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
    pub clock_protocol_version: String,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct SpacetimeProjectionRows {
    pub session: Option<Value>,
    pub kairos: Option<Value>,
    pub global: Option<Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeReadinessContract {
    pub gateway_websocket_health: String,
    pub reducer_registration_health: String,
    pub native_subscription_readiness: String,
    pub active_fallback_mode: String,
    pub graphiti_runtime_compatibility_mode: String,
    pub clock_protocol_version: String,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeSubscriptionLifecycleEnvelope {
    pub event: String,
    pub method: String,
    pub session_key: String,
    pub subscription_mode: String,
    pub projection_schema_version: String,
    pub payload: Value,
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
            clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
            projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
            reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
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
                // 03.T4: pratibimba_presence has a session_key column.
                "pratibimba_presence" => Some(format!(
                    "SELECT * FROM pratibimba_presence WHERE session_key = {session_key}"
                )),
                // 03.T4: shared-cosmos tables are keyed by gateway_id / day_id /
                // identity_handle — not by session_key — so they subscribe
                // without a WHERE clause. Per-day or per-cell visibility is
                // enforced at the consumer side (and via SpaceTimeDB RLS when
                // it lands, per IOD-02).
                "world_clock"
                | "world_clock_tick"
                | "shared_archetype_event"
                | "coincidence"
                | "coincidence_tick"
                | "module_version" => Some(format!("SELECT * FROM {table}")),
                _ => None,
            })
            .collect()
    }

    pub fn readiness_contract(&self) -> SpacetimeReadinessContract {
        SpacetimeReadinessContract {
            gateway_websocket_health: "reported-by-gateway".to_owned(),
            reducer_registration_health: "reported-by-spacetimedb".to_owned(),
            native_subscription_readiness: self.mode.clone(),
            active_fallback_mode: self.sql_fallback_mode.clone(),
            graphiti_runtime_compatibility_mode: GRAPHITI_RUNTIME_AUTHORITY.to_owned(),
            clock_protocol_version: self.clock_protocol_version.clone(),
            projection_schema_version: self.projection_schema_version.clone(),
            reducer_abi_version: self.reducer_abi_version.clone(),
        }
    }

    pub fn lifecycle_envelope(
        &self,
        event: impl Into<String>,
        payload: Value,
    ) -> SpacetimeSubscriptionLifecycleEnvelope {
        self.lifecycle_envelope_for_method(SPACETIME_SUBSCRIBE_METHOD, event, payload)
    }

    /// 13.T4: emit a lifecycle envelope under EITHER `s3'.temporal.subscribe`
    /// OR `s3'.spacetime.subscribe`. Both methods MUST emit envelopes of THIS
    /// exact type — the S3-owned subscription registry is unified per the
    /// 13.T4 contract. Callers are expected to pass one of
    /// `SPACETIME_SUBSCRIBE_METHOD` or `SPACETIME_SUBSCRIBE_ALIAS_METHOD`;
    /// other method strings are accepted verbatim so downstream introspection
    /// can carry the method through unchanged.
    pub fn lifecycle_envelope_for_method(
        &self,
        method: impl Into<String>,
        event: impl Into<String>,
        payload: Value,
    ) -> SpacetimeSubscriptionLifecycleEnvelope {
        SpacetimeSubscriptionLifecycleEnvelope {
            event: event.into(),
            method: method.into(),
            session_key: self.session_key.clone(),
            subscription_mode: self.subscription_mode.clone(),
            projection_schema_version: self.projection_schema_version.clone(),
            payload,
        }
    }
}

/// 13.T4: the explicit fallback discipline. The S3-owned spacetime module
/// MUST publish exactly one of these states when native subscription is
/// unavailable. `SilentHttpFallback` is the negative space — it must NEVER be
/// emitted; the silent-HTTP-fallback sentinel test in the gateway crate proves
/// that no code path constructs this value. `FallbackActive` is the explicit
/// degraded mode named in 03.T2 deliverable 5.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeFallbackPolicy {
    /// Native WS subscription is configured and the projection plan binds it.
    NativeWebsocket,
    /// Native WS subscription has failed or is not configured AND the consumer
    /// has been told explicitly. The runtime continues with HTTP SQL polling
    /// but downstream consumers KNOW the projection source is degraded.
    FallbackActive,
    /// Subscription is disabled (no SPACETIMEDB_URL / EPI_GATE_SPACETIME_URL).
    Disabled,
}

impl SpacetimeFallbackPolicy {
    pub fn as_str(self) -> &'static str {
        match self {
            SpacetimeFallbackPolicy::NativeWebsocket => SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            SpacetimeFallbackPolicy::FallbackActive => SPACETIME_FALLBACK_ACTIVE,
            SpacetimeFallbackPolicy::Disabled => SPACETIME_FALLBACK_DISABLED,
        }
    }
}

/// 13.T4: the silent-HTTP-fallback sentinel. No code path inside the
/// S3-owned spacetime module may emit this string as a `projectionSource` or
/// as a `SpacetimeFallbackPolicy`. The gateway-side
/// `spacetime::silent_fallback_refused()` returns this constant so callers can
/// assert against it; the contract-level guard is that NO production code path
/// ever returns it.
pub const SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN: &str = "silent-http-fallback-forbidden";
pub const SPACETIME_FALLBACK_ACTIVE: &str = "fallback-active";
pub const SPACETIME_FALLBACK_DISABLED: &str = "disabled";

/// 13.T4: the canonical S3-owned subscription registry facts surfaced through
/// gateway readiness. Both `s3'.temporal.subscribe` and `s3'.spacetime.subscribe`
/// register under THIS schema; the registry is single-owner (S3), and the
/// `envelope_type_name` is fixed to `SpacetimeSubscriptionLifecycleEnvelope`
/// so downstream consumers can verify the envelope identity by name.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S3SubscriptionRegistryFacts {
    pub coordinate_owner: String,
    pub envelope_type_name: String,
    pub temporal_method: String,
    pub spacetime_alias_method: String,
    pub fallback_policy: SpacetimeFallbackPolicy,
    pub silent_fallback_forbidden_sentinel: String,
    pub native_endpoint: Option<String>,
}

impl S3SubscriptionRegistryFacts {
    pub fn new(fallback_policy: SpacetimeFallbackPolicy, native_endpoint: Option<String>) -> Self {
        Self {
            coordinate_owner: "S3'".to_owned(),
            envelope_type_name: "SpacetimeSubscriptionLifecycleEnvelope".to_owned(),
            temporal_method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
            spacetime_alias_method: SPACETIME_SUBSCRIBE_ALIAS_METHOD.to_owned(),
            fallback_policy,
            silent_fallback_forbidden_sentinel: SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN.to_owned(),
            native_endpoint,
        }
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

/// The SpaceTimeDB subscription message kind. 03.T3 typed-delta surface:
/// consumers branch on this to handle the lifecycle phases explicitly rather
/// than treating every payload as the same "rows". `Unknown` covers
/// IdentityToken/Ping/server-control frames the consumer should ignore.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeMessageKind {
    InitialSubscription,
    SubscribeMultiApplied,
    TransactionUpdate,
    TransactionUpdateLight,
    Unknown,
}

/// A row delta for one of the projection tables, tagged by table identity so
/// downstream consumers (Theia kernel-bridge, gateway lifecycle multiplex,
/// debugging tools) can route by surface without re-parsing table names.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "table")]
pub enum SpacetimeTableDelta {
    SessionSurface { row: Value },
    KairosSurface { row: Value },
    GlobalTemporalSurface { row: Value },
    WorldClock { row: Value },
    PratibimbaPresence { row: Value },
    SharedArchetypeEvent { row: Value },
    Coincidence { row: Value },
    GatewayInstance { row: Value },
    AgentInstance { row: Value },
    ClientRegistration { row: Value },
    TemporalEvent { row: Value },
    // 03.T4 audit/version surfaces.
    WorldClockTick { row: Value },
    CoincidenceTick { row: Value },
    ModuleVersion { row: Value },
    #[serde(rename = "other")]
    Other { table_name: String, row: Value },
}

impl SpacetimeTableDelta {
    /// Construct a delta from a raw `table_name` + row payload. Unknown table
    /// names fall back to `Other`, preserving the original `table_name` so
    /// debug tooling can still surface the table identity.
    pub fn from_table_name(table_name: &str, row: Value) -> Self {
        match table_name {
            "session_surface" => SpacetimeTableDelta::SessionSurface { row },
            "kairos_surface" => SpacetimeTableDelta::KairosSurface { row },
            "global_temporal_surface" => SpacetimeTableDelta::GlobalTemporalSurface { row },
            "world_clock" => SpacetimeTableDelta::WorldClock { row },
            "pratibimba_presence" => SpacetimeTableDelta::PratibimbaPresence { row },
            "shared_archetype_event" => SpacetimeTableDelta::SharedArchetypeEvent { row },
            "coincidence" => SpacetimeTableDelta::Coincidence { row },
            "gateway_instance" => SpacetimeTableDelta::GatewayInstance { row },
            "agent_instance" => SpacetimeTableDelta::AgentInstance { row },
            "client_registration" => SpacetimeTableDelta::ClientRegistration { row },
            "temporal_event" => SpacetimeTableDelta::TemporalEvent { row },
            // 03.T4 audit/version surfaces.
            "world_clock_tick" => SpacetimeTableDelta::WorldClockTick { row },
            "coincidence_tick" => SpacetimeTableDelta::CoincidenceTick { row },
            "module_version" => SpacetimeTableDelta::ModuleVersion { row },
            other => SpacetimeTableDelta::Other {
                table_name: other.to_owned(),
                row,
            },
        }
    }
}

/// The typed delta surface returned by `SpacetimeProjectionSubscription`.
/// Carries the message kind explicitly so consumers can distinguish initial
/// snapshot (full table state) from steady-state updates (incremental rows).
/// `inserts` and `deletes` are typed by surface; unknown tables are preserved
/// as `SpacetimeTableDelta::Other` rather than silently dropped.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionDelta {
    pub message_kind: SpacetimeMessageKind,
    pub inserts: Vec<SpacetimeTableDelta>,
    pub deletes: Vec<SpacetimeTableDelta>,
}

impl SpacetimeProjectionDelta {
    pub fn empty(message_kind: SpacetimeMessageKind) -> Self {
        Self {
            message_kind,
            inserts: Vec::new(),
            deletes: Vec::new(),
        }
    }

    /// Decode a single SpaceTimeDB subscription frame into a typed delta.
    /// Recognises InitialSubscription, SubscribeMultiApplied,
    /// TransactionUpdate, and TransactionUpdateLight. For unknown or
    /// non-delta frames (IdentityToken, server pings) returns
    /// `(SpacetimeMessageKind::Unknown, empty inserts/deletes)`.
    pub fn from_subscription_message(message: &Value) -> Result<Self, String> {
        let message_kind = classify_subscription_message(message);
        if matches!(message_kind, SpacetimeMessageKind::Unknown) {
            return Ok(Self::empty(message_kind));
        }
        let Some(update) = subscription_database_update(message) else {
            return Ok(Self::empty(message_kind));
        };
        let tables = update
            .get("tables")
            .and_then(Value::as_array)
            .ok_or_else(|| "spacetimedb subscription update missing tables".to_owned())?;
        let mut inserts = Vec::new();
        let mut deletes = Vec::new();
        for table in tables {
            let table_name = table
                .get("table_name")
                .or_else(|| table.get("tableName"))
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let updates = match table.get("updates").and_then(Value::as_array) {
                Some(arr) => arr,
                None => continue,
            };
            for update_entry in updates {
                if let Some(rows) = update_entry.get("inserts").and_then(Value::as_array) {
                    for row in rows {
                        inserts
                            .push(SpacetimeTableDelta::from_table_name(&table_name, row.clone()));
                    }
                }
                if let Some(rows) = update_entry.get("deletes").and_then(Value::as_array) {
                    for row in rows {
                        deletes
                            .push(SpacetimeTableDelta::from_table_name(&table_name, row.clone()));
                    }
                }
            }
        }
        Ok(Self {
            message_kind,
            inserts,
            deletes,
        })
    }

    /// Convenience: does the delta carry the first `KairosSurface` insert?
    /// 03.T3 verification rider invokes `bind_kairos_surface` and expects the
    /// `KairosSurface` delta to round-trip within 100 ms.
    pub fn first_kairos_insert(&self) -> Option<&Value> {
        self.inserts.iter().find_map(|delta| match delta {
            SpacetimeTableDelta::KairosSurface { row } => Some(row),
            _ => None,
        })
    }
}

fn classify_subscription_message(message: &Value) -> SpacetimeMessageKind {
    if message.get("InitialSubscription").is_some() {
        SpacetimeMessageKind::InitialSubscription
    } else if message.get("SubscribeMultiApplied").is_some() {
        SpacetimeMessageKind::SubscribeMultiApplied
    } else if message.get("TransactionUpdateLight").is_some() {
        SpacetimeMessageKind::TransactionUpdateLight
    } else if message.get("TransactionUpdate").is_some() {
        SpacetimeMessageKind::TransactionUpdate
    } else {
        SpacetimeMessageKind::Unknown
    }
}

// =============== 03.T5 kernel-bridge stream contract ================
//
// The TypeScript-facing stream contract consumed by the Theia kernel-bridge
// extension (`Idea/Pratibimba/System/extensions/kernel-bridge/`) and the
// `/body` shell layout. Both consumers receive the same envelope shapes via
// serde-JSON over the gateway WebSocket multiplex; there is no Tauri-native
// alternative (PRD-01 obviated it).
//
// The kernel-bridge maintains an in-process row cache PER session_key and
// emits these envelopes to downstream M-extensions through Theia DI. Privacy
// filtering happens at the gateway boundary via `privacy_filter_*` helpers
// below so protected-reference-only rows cannot accidentally cross with
// hidden detail attached.

/// Connection state to the gateway from the kernel-bridge's perspective.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KernelBridgeConnectionState {
    Connecting,
    Connected,
    Disconnected,
    Reconnecting,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeConnectionStatus {
    pub gateway_id: String,
    pub state: KernelBridgeConnectionState,
    pub protocol_version: u32,
    pub clock_protocol_version: String,
    /// 03.T6: surface the Graphiti runtime status so agents can decide
    /// whether episodic operations (s5.episodic.*) are available before
    /// invoking them. `Available` means the runtime answered its health
    /// probe; `Degraded` means the gateway reached it but with a non-ok
    /// status; `Unavailable` means no response within the probe timeout.
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub at_ms: u64,
}

/// 03.T6: typed status of the Graphiti runtime (the HTTP compatibility
/// adapter at port 37778 currently). Surfaced through the gateway readiness
/// AND through every subscription metadata envelope so consumers don't have
/// to make a separate readiness call to know whether episodic operations
/// will succeed.
///
/// Per IOD-08 the native-library boundary is unresolved; this enum is the
/// CURRENT compatibility-mode status, not a commitment to runtime shape.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiRuntimeStatus {
    Available,
    Degraded,
    Unavailable,
}

/// Subscription lifecycle from the kernel-bridge's perspective — mirrors the
/// SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS phase enumeration.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeSubscriptionStatus {
    pub subscription_id: String,
    pub method: String,
    pub session_key: String,
    pub phase: String,
    pub source: String,
    pub privacy_class: String,
    /// 03.T6: Graphiti runtime status at the time this subscription
    /// envelope was emitted. Agents subscribing to KairosSurface +
    /// GlobalTemporalSurface use this to gate s5.episodic.* invocations
    /// without a separate readiness round-trip.
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub at_ms: u64,
}

/// 03.T6: typed envelope for routing S5/S5' Graphiti invocation through
/// the gateway RPC layer (instead of consumers reaching Graphiti directly).
/// Carries the explicit session/day/NOW/namespace/privacy axes named in
/// the deliverable so the gateway can refuse requests that don't supply
/// them, and so downstream tools can route by namespace.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphitiInvocationEnvelope {
    pub session_key: String,
    pub day_id: String,
    pub now_path: String,
    pub namespace_ref: String,
    pub session_arc_id: String,
    pub privacy_class: GraphitiPrivacyClass,
    /// `agent_id` is the invoking agent identity (`epii`, `nara`, …) —
    /// surfaced for audit/provenance, not for authorisation.
    pub agent_id: String,
}

/// 03.T6: Graphiti invocation privacy classification. `ProtectedEpisodic`
/// means the body contains personal episodic memory that MUST NOT be
/// persisted to SpaceTimeDB or any other public projection — only the
/// `session_arc_id` + `namespace_ref` references cross the gateway
/// boundary. `PublicProvenance` means a provenance event that can be
/// safely persisted as a reference.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GraphitiPrivacyClass {
    ProtectedEpisodic,
    PublicProvenance,
}

/// 03.T6: refuse a SpaceTimeDB row payload if it carries any field that
/// would leak Graphiti episode body content into the public projection.
/// Returns `Ok(())` when the row is safe (only references); `Err` naming
/// the offending field when an episode body field is present.
///
/// The forbidden field names are the ones used in the Graphiti
/// compatibility surface (`Body/S/S3/graphiti-runtime/src/lib.rs`): any
/// raw `episode_id` + body, raw `episode`, `episode_body`, `memory_body`,
/// `protected_payload`, or `journal_text`. SAFE references are
/// `graphiti_namespace_ref` and `graphiti_session_arc_id` only.
pub fn assert_no_graphiti_body_in_row(row: &Value) -> Result<(), String> {
    let forbidden = [
        "episode_id",
        "episode",
        "episode_body",
        "memory_body",
        "protected_payload",
        "journal_text",
        "dream_body",
        "raw_episode",
    ];
    let Value::Object(map) = row else {
        return Ok(());
    };
    for field in forbidden {
        if map.contains_key(field) {
            return Err(format!(
                "Graphiti episode body field `{field}` must not be persisted to SpaceTimeDB; only `graphiti_namespace_ref` and `graphiti_session_arc_id` references are safe (see 03.T6 IOD-08)"
            ));
        }
    }
    Ok(())
}

/// Privacy classification — applied at the gateway boundary before a row
/// crosses to the kernel-bridge. Downstream consumers may further restrict
/// but MUST NOT loosen.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KernelBridgePrivacyClass {
    PublicSafe,
    ProtectedReferenceOnly,
    OptInShared,
}

/// One row in the kernel-bridge's latest-row cache. `surface` matches the
/// `SpacetimeTableDelta` variant identity; `row` carries the post-privacy
/// payload (NOT the raw native-WS row).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeCachedSurface {
    pub surface: String,
    pub privacy_class: KernelBridgePrivacyClass,
    pub row: Value,
    pub updated_at_ms: u64,
}

/// Snapshot of the kernel-bridge's row cache for a single session at a
/// single point in time. Emitted on (re)connection and after a resync.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeLatestRowCache {
    pub session_key: String,
    pub surfaces: Vec<KernelBridgeCachedSurface>,
}

/// A typed delta emitted to the kernel-bridge after privacy filtering.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeDelta {
    pub subscription_id: String,
    pub session_key: String,
    pub message_kind: SpacetimeMessageKind,
    pub inserts: Vec<KernelBridgeCachedSurface>,
    pub deletes: Vec<KernelBridgeCachedSurface>,
}

/// Resync envelope — emitted after the kernel-bridge reconnects and the
/// gateway has recovered the projection generation. Carries the recovered
/// surfaces so the consumer can re-render without polling.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeResync {
    pub subscription_id: String,
    pub session_key: String,
    pub stale_profile_generation: Option<u64>,
    pub recovered_profile_generation: u64,
    pub recovered_surfaces: Vec<KernelBridgeCachedSurface>,
}

/// Protocol mismatch — emitted when the kernel-bridge detects that any of
/// the gateway's announced version constants diverge from what the local
/// build expects. Downstream consumers MUST refuse to render data that
/// crossed a mismatched protocol.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeProtocolMismatch {
    pub local_projection_schema_version: String,
    pub remote_projection_schema_version: String,
    pub local_reducer_abi_version: String,
    pub remote_reducer_abi_version: String,
    pub local_clock_protocol_version: String,
    pub remote_clock_protocol_version: String,
    pub at_ms: u64,
}

/// The top-level stream contract. Every event the kernel-bridge consumes
/// from the gateway WS multiplex serialises into this enum. `kind`
/// (serde-internal-tag) is the discriminator the TypeScript side switches on.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "kind", content = "body")]
pub enum KernelBridgeStreamEvent {
    ConnectionStatus(KernelBridgeConnectionStatus),
    SubscriptionStatus(KernelBridgeSubscriptionStatus),
    LatestRowCache(KernelBridgeLatestRowCache),
    Delta(KernelBridgeDelta),
    Resync(KernelBridgeResync),
    ProtocolMismatch(KernelBridgeProtocolMismatch),
}

/// The kernel-bridge API contract — methods Theia consumers invoke against
/// the bridge frontend service. Each variant maps to a gateway RPC the
/// bridge translates and forwards. The bridge owns the WS connection and
/// the row cache; M-extensions consume via Theia DI.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "method", content = "params")]
pub enum KernelBridgeApiRequest {
    SubscribeWorldClock {
        #[serde(rename = "gatewayId")]
        gateway_id: String,
    },
    SubscribePratibimbaPresence {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    SubscribeSharedArchetypeEvent {
        #[serde(rename = "dayId")]
        day_id: String,
        #[serde(rename = "aspectGridCellFilter")]
        aspect_grid_cell_filter: Option<u32>,
    },
    SubscribeKairosSurface {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    SubscribeGlobalTemporalSurface {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    InvokeGatewayRpc {
        #[serde(rename = "gatewayMethod")]
        gateway_method: String,
        #[serde(rename = "gatewayParams")]
        gateway_params: Value,
    },
    ObserveConnectionState,
}

/// Privacy classification for a known surface. Used by the gateway to
/// decide which fields cross to the kernel-bridge.
pub fn surface_privacy_class(surface: &str) -> KernelBridgePrivacyClass {
    match surface {
        // Personal/protected surfaces — only fingerprints/handles cross.
        "pratibimba_presence" => KernelBridgePrivacyClass::ProtectedReferenceOnly,
        // Opt-in surfaces — caller must have asserted consent.
        "shared_archetype_event" | "coincidence" => KernelBridgePrivacyClass::OptInShared,
        // Public-safe operational surfaces.
        _ => KernelBridgePrivacyClass::PublicSafe,
    }
}

/// 03.T5: privacy filter for a typed table delta crossing the gateway →
/// kernel-bridge boundary. Strips fields per the surface's privacy class:
///
/// - `ProtectedReferenceOnly` (pratibimba_presence): emits ONLY
///   `identity_handle` + `day_id` + `aspect_grid_cell` + `present`. The
///   `quintessence_hash` is a fingerprint but still a derived identity
///   shape, so it stays behind the gateway. `session_key`,
///   `installation_id`, and `gateway_id` are correlation handles consumers
///   don't need.
///
/// - `OptInShared` (shared_archetype_event, coincidence): emits the safe
///   subset — no `installation_id`, no `gateway_id`, no raw `payload_json`.
///   `event_kind` + `aspect_grid_cell` + `day_id` + `publisher_identity_handle`
///   (which is already a BLAKE3 fingerprint) cross.
///
/// - `PublicSafe`: row passes through unmodified.
///
/// The input may be a positional array (live SpaceTimeDB native WS shape) or
/// an object (synthetic test shape); both are normalised to an object using
/// the surface's known column layout before filtering.
pub fn privacy_filter_table_delta(delta: &SpacetimeTableDelta) -> KernelBridgeCachedSurface {
    let (surface_name, raw_row) = match delta {
        SpacetimeTableDelta::SessionSurface { row } => ("session_surface", row),
        SpacetimeTableDelta::KairosSurface { row } => ("kairos_surface", row),
        SpacetimeTableDelta::GlobalTemporalSurface { row } => ("global_temporal_surface", row),
        SpacetimeTableDelta::WorldClock { row } => ("world_clock", row),
        SpacetimeTableDelta::PratibimbaPresence { row } => ("pratibimba_presence", row),
        SpacetimeTableDelta::SharedArchetypeEvent { row } => ("shared_archetype_event", row),
        SpacetimeTableDelta::Coincidence { row } => ("coincidence", row),
        SpacetimeTableDelta::GatewayInstance { row } => ("gateway_instance", row),
        SpacetimeTableDelta::AgentInstance { row } => ("agent_instance", row),
        SpacetimeTableDelta::ClientRegistration { row } => ("client_registration", row),
        SpacetimeTableDelta::TemporalEvent { row } => ("temporal_event", row),
        SpacetimeTableDelta::WorldClockTick { row } => ("world_clock_tick", row),
        SpacetimeTableDelta::CoincidenceTick { row } => ("coincidence_tick", row),
        SpacetimeTableDelta::ModuleVersion { row } => ("module_version", row),
        SpacetimeTableDelta::Other { table_name, row } => (table_name.as_str(), row),
    };
    let privacy_class = surface_privacy_class(surface_name);
    let normalised = normalise_row_to_object(surface_name, raw_row);
    let filtered = match privacy_class {
        KernelBridgePrivacyClass::ProtectedReferenceOnly => filter_protected_row(&normalised),
        KernelBridgePrivacyClass::OptInShared => filter_opt_in_row(&normalised),
        KernelBridgePrivacyClass::PublicSafe => normalised,
    };
    KernelBridgeCachedSurface {
        surface: surface_name.to_owned(),
        privacy_class,
        row: filtered,
        updated_at_ms: 0,
    }
}

/// Convert a raw row payload — which may be a JSON array (live SpaceTimeDB
/// native-WS positional shape), a JSON object (synthetic/test shape OR live
/// InitialSubscription shape), or a JSON-encoded string of either form —
/// into a normalised object using the schema column order for the named
/// surface.
fn normalise_row_to_object(surface: &str, raw: &Value) -> Value {
    // Resolve the row to an inner Value, peeling off the JSON-string wrapper
    // that SpaceTimeDB 2.2's wire format applies to some row payloads.
    let inner = match raw {
        Value::String(s) => match serde_json::from_str::<Value>(s) {
            Ok(parsed) => parsed,
            Err(_) => return raw.clone(),
        },
        other => other.clone(),
    };
    // Object-shaped rows (live InitialSubscription, synthetic tests) pass
    // through unchanged — column names are already present.
    if matches!(inner, Value::Object(_)) {
        return inner;
    }
    let Value::Array(array) = inner else {
        return raw.clone();
    };
    let columns: &[&str] = match surface {
        "pratibimba_presence" => &[
            "identity_handle",
            "installation_id",
            "gateway_id",
            "session_key",
            "day_id",
            "quintessence_hash",
            "aspect_grid_cell",
            "privacy_class",
            "present",
            "updated_at",
        ],
        "shared_archetype_event" => &[
            "event_id",
            "installation_id",
            "gateway_id",
            "publisher_identity_handle",
            "day_id",
            "aspect_grid_cell",
            "event_kind",
            "payload_json",
            "privacy_class",
            "created_at",
        ],
        "coincidence" => &[
            "coincidence_id",
            "day_id",
            "aspect_grid_cell",
            "participant_identity_handles",
            "confidence_score",
            "related_event_ids",
            "detected_at",
        ],
        "world_clock" => &[
            "gateway_id",
            "tick",
            "source_now_ms",
            "dominant_aspect",
            "clock_kind",
            "kerykeion_state_hash",
            "clock_protocol_version",
            "kerykeion_version",
            "updated_at",
        ],
        // For surfaces we don't carry an explicit column map for, return the
        // raw array — consumers know the per-surface schema.
        _ => return raw.clone(),
    };
    let mut object = serde_json::Map::new();
    for (idx, column) in columns.iter().enumerate() {
        if let Some(value) = array.get(idx) {
            object.insert((*column).to_owned(), value.clone());
        }
    }
    Value::Object(object)
}

fn filter_protected_row(row: &Value) -> Value {
    let Value::Object(map) = row else {
        return row.clone();
    };
    let safe_keys = [
        "identity_handle",
        "day_id",
        "aspect_grid_cell",
        "present",
        "privacy_class",
        "updated_at",
    ];
    let mut filtered = serde_json::Map::new();
    for key in safe_keys {
        if let Some(value) = map.get(key) {
            filtered.insert(key.to_owned(), value.clone());
        }
    }
    Value::Object(filtered)
}

fn filter_opt_in_row(row: &Value) -> Value {
    let Value::Object(map) = row else {
        return row.clone();
    };
    // Strip raw correlation fields + raw payload_json (which may carry
    // arbitrary publisher-supplied content) — keep the safe public-shared
    // subset.
    let strip = ["installation_id", "gateway_id", "payload_json"];
    let mut filtered = map.clone();
    for key in strip {
        filtered.remove(key);
    }
    Value::Object(filtered)
}

/// 03.T5: detect a protocol mismatch between local and remote module-version
/// reporting. Returns `Some(KernelBridgeProtocolMismatch)` when any of the
/// version triple drifts; `None` when versions align.
pub fn detect_protocol_mismatch(
    remote_projection_schema_version: &str,
    remote_reducer_abi_version: &str,
    remote_clock_protocol_version: &str,
    at_ms: u64,
) -> Option<KernelBridgeProtocolMismatch> {
    let projection_match = remote_projection_schema_version == SPACETIME_PROJECTION_SCHEMA_VERSION;
    let reducer_match = remote_reducer_abi_version == SPACETIME_REDUCER_ABI_VERSION;
    let clock_match = remote_clock_protocol_version == SPACETIME_CLOCK_PROTOCOL_VERSION;
    if projection_match && reducer_match && clock_match {
        return None;
    }
    Some(KernelBridgeProtocolMismatch {
        local_projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
        remote_projection_schema_version: remote_projection_schema_version.to_owned(),
        local_reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
        remote_reducer_abi_version: remote_reducer_abi_version.to_owned(),
        local_clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
        remote_clock_protocol_version: remote_clock_protocol_version.to_owned(),
        at_ms,
    })
}

// ============= 03.T7 release gate =============
//
// Track 03 release-gate criteria, expressed as contract types so the
// gateway can self-report whether the gates are open and the kernel-bridge
// can refuse to advertise capabilities that have not yet passed their
// gate.

/// 03.T7: production fallback policy. By default HTTP SQL polling is a
/// development-only degraded mode; production requires explicit operator
/// opt-in via the `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1` env var.
/// The gateway surfaces the active policy on every readiness probe so
/// downstream consumers (kernel-bridge, M-extensions, alert dashboards)
/// can refuse to render data that crossed an undeclared fallback.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProductionFallbackPolicy {
    /// Default: HTTP SQL polling is permitted only for local development;
    /// any production environment refuses to use it.
    DevelopmentOnly,
    /// Operator-opted-in: HTTP SQL polling is permitted as a visible
    /// degraded mode, with an explicit `fallback-active` lifecycle event
    /// on every subscription that uses it.
    OperatorOptIn,
}

/// 03.T7: detect the active fallback policy from the environment. Defaults
/// to `DevelopmentOnly`; flips to `OperatorOptIn` when
/// `EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK=1`.
pub fn detect_production_fallback_policy() -> ProductionFallbackPolicy {
    match std::env::var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK") {
        Ok(value) if value == "1" || value.eq_ignore_ascii_case("true") => {
            ProductionFallbackPolicy::OperatorOptIn
        }
        _ => ProductionFallbackPolicy::DevelopmentOnly,
    }
}

/// 03.T7: forbidden field names that MUST NOT appear in any SpaceTimeDB
/// row serialised to the public projection or in any Graphiti search
/// result envelope. The privacy audit harness scans live row payloads for
/// these strings and fails the release gate if any are present.
pub const PRIVACY_FORBIDDEN_FIELD_NAMES: &[&str] = &[
    // From 03.T6 (Graphiti episode bodies).
    "episode_id",
    "episode",
    "episode_body",
    "memory_body",
    "protected_payload",
    "journal_text",
    "dream_body",
    "raw_episode",
    // From the alpha spec privacy invariants (Nara personal mandala).
    "raw_birth_data",
    "birth_data",
    "dream_content",
    "profile_hash_preview",
    "layer_mask",
    "personal_nexus_body",
    "personalnexus_body",
    "personal_nexus",
    // Catch-all for raw identity that should only ever cross as a
    // BLAKE3 fingerprint.
    "raw_identity",
    "raw_quaternionic_bytes",
];

/// 03.T7: scan a serialised row payload (as a JSON Value, or any value
/// renderable to a String via Display) for forbidden field names. Returns
/// the list of forbidden fields found; empty list means the row is safe.
///
/// The scan is intentionally string-based (rather than walking JSON
/// structurally) so it catches forbidden fields buried in
/// arbitrary-shape payload_json blobs that the gateway has not pre-typed.
pub fn scan_for_forbidden_privacy_fields(payload: &str) -> Vec<&'static str> {
    let mut hits = Vec::new();
    for field in PRIVACY_FORBIDDEN_FIELD_NAMES {
        // Match `"field"` to avoid false positives from prefix/substring
        // matches (e.g. `episode_id` matching inside `non_episode_id_field`).
        let needle = format!("\"{field}\"");
        if payload.contains(&needle) {
            hits.push(*field);
        }
    }
    hits
}

/// 03.T7: Track 03 release-gate criteria, machine-readable. The release
/// gate is *open* when every required field is true.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Track03ReleaseGateReport {
    pub multi_subscriber_clock_within_tolerance: bool,
    pub bind_kairos_p95_under_100ms: bool,
    pub reconnect_recovers_latest_state: bool,
    pub privacy_audit_no_forbidden_fields: bool,
    pub production_fallback_policy: ProductionFallbackPolicy,
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
    pub clock_protocol_version: String,
}

impl Track03ReleaseGateReport {
    pub fn is_open(&self) -> bool {
        self.multi_subscriber_clock_within_tolerance
            && self.bind_kairos_p95_under_100ms
            && self.reconnect_recovers_latest_state
            && self.privacy_audit_no_forbidden_fields
    }
}

// ============= 03.T6.5 S1 vault gateway surface =============
//
// The gateway is the canonical write gatekeeper for the Obsidian vault per
// IOD-19. Theia and agents NEVER write directly to the vault filesystem —
// they invoke `s1'.vault.{read_file, write_file, move_file, rename_file}`
// and the gateway delegates to Hen (the S1 compiler) which enforces
// wikilink integrity, path soundness, and the protected-path privacy class.
//
// `s1'.semantic.suggest_links` wraps Hen's `suggest_link_candidates` so the
// kernel-bridge and M-extensions can consume the same typed candidate
// payload (ExplicitOutlink / SemanticSource / SemanticBlock) via gateway
// RPC instead of reading the smart_env JSON directly.

/// 03.T6.5: privacy classification for a vault path. `Public` means
/// ordinary vault content (notes, blocks, frontmatter). `Protected` means
/// content under `Idea/Pratibimba/Nara/<day>/protected/...` — Nara journal
/// bodies, dream bodies, raw birth data — which MUST NOT be exposed
/// through s1'.vault.* or s1'.semantic.* unless the caller carries the
/// governed protected capability per UFV-01 + IOD-17.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1VaultPathPrivacyClass {
    Public,
    Protected,
}

/// 03.T6.5: classify a vault-relative path. Returns `Protected` when the
/// path lies under any `Idea/Pratibimba/Nara/<day>/protected/...` segment;
/// `Public` otherwise. Paths are normalised to forward-slash form before
/// matching so Windows-style separators are accepted on caller's behalf.
pub fn classify_vault_path_privacy(vault_relative_path: &str) -> S1VaultPathPrivacyClass {
    let normalised = vault_relative_path.replace('\\', "/");
    let trimmed = normalised.trim_start_matches('/');
    // Match the alpha-spec invariant: any `Nara/<day>/protected` segment
    // marks the rest of the path as protected, regardless of depth.
    if trimmed
        .split('/')
        .collect::<Vec<_>>()
        .windows(3)
        .any(|window| window[0] == "Nara" && window[2] == "protected")
    {
        return S1VaultPathPrivacyClass::Protected;
    }
    // Also catch the direct `Idea/Pratibimba/Nara/<day>/protected/...` form
    // as the canonical vault root layout.
    if trimmed.contains("Pratibimba/Nara/") && trimmed.contains("/protected/") {
        return S1VaultPathPrivacyClass::Protected;
    }
    S1VaultPathPrivacyClass::Public
}

/// 03.T6.5: a wikilink reference inside a markdown document, located so
/// rename/move reconciliation can rewrite it atomically.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1WikilinkReference {
    pub source_path: String,
    pub target_title: String,
    pub line_index: usize,
    pub byte_start: usize,
    pub byte_end: usize,
}

/// 03.T6.5: the result of a vault rename or move. Carries the list of
/// referring documents that were reconciled (their `[[X]]` updated to
/// `[[Y]]`) and any documents that were refused because the rename would
/// orphan a heading or break a Bimba-coordinate anchor.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1VaultRenameReceipt {
    pub from_path: String,
    pub to_path: String,
    pub reconciled_documents: Vec<String>,
    pub reconciled_link_count: usize,
    pub refusals: Vec<S1VaultRenameRefusal>,
}

/// 03.T6.5: a refusal carried in `S1VaultRenameReceipt.refusals` when the
/// rename would break a wikilink the gateway cannot safely rewrite (e.g.,
/// heading anchor `[[X#heading]]` and the heading no longer exists in the
/// destination).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1VaultRenameRefusal {
    pub source_path: String,
    pub reason: S1VaultRenameRefusalReason,
    pub detail: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1VaultRenameRefusalReason {
    OrphanHeading,
    OrphanBlockAnchor,
    BimbaCoordinateBreak,
    ProtectedPath,
}

/// 03.T6.5: typed candidate kind from Hen's `LinkCandidateKind`. Mirrored
/// in the gateway contract so consumers don't need to depend on the Hen
/// crate directly to consume the semantic response.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1SemanticCandidateKind {
    ExplicitOutlink,
    SemanticSource,
    SemanticBlock,
}

/// 03.T6.5: one semantic link candidate.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1SemanticCandidate {
    pub target_path: String,
    pub wikilink_title: String,
    pub score: f32,
    pub kind: S1SemanticCandidateKind,
    pub evidence_source_path: String,
    pub evidence_lines: Option<(usize, usize)>,
    pub stale: bool,
    pub privacy_class: S1VaultPathPrivacyClass,
}

/// 03.T6.5: a `s1'.semantic.suggest_links` response. Carries staleness so
/// consumers can decide whether to act on the candidates or refresh.
/// `staleness` aggregates per-candidate `stale` flags into a single
/// kernel-bridge-friendly state.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1SemanticResponse {
    pub seed_sources: Vec<String>,
    pub candidates: Vec<S1SemanticCandidate>,
    pub warnings: Vec<String>,
    pub staleness: S1SemanticStaleness,
    pub smart_env_index_path: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1SemanticStaleness {
    /// Every candidate's underlying source was indexed after the note's
    /// last mtime — the index is current.
    Current,
    /// At least one candidate's underlying source has been modified since
    /// it was last indexed — consumer may want to refresh.
    Stale,
    /// The smart_env index could not be located at all (e.g., the vault
    /// hasn't been indexed yet) — consumer should treat candidates as
    /// best-effort and refresh before acting.
    NoIndex,
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
            plan.clock_protocol_version,
            SPACETIME_CLOCK_PROTOCOL_VERSION
        );
        assert_eq!(
            plan.projection_schema_version,
            SPACETIME_PROJECTION_SCHEMA_VERSION
        );
        assert!(METHOD_NAMES.contains(&SPACETIME_SUBSCRIBE_METHOD));
        assert!(METHOD_NAMES.contains(&SPACETIME_SUBSCRIBE_ALIAS_METHOD));
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
        for shared_table in [
            "world_clock",
            "pratibimba_presence",
            "shared_archetype_event",
            "coincidence",
        ] {
            assert!(
                SPACETIME_PROJECTION_TABLES.contains(&shared_table),
                "{shared_table} should be in the complete projection table contract"
            );
            assert!(
                full_plan.tables.iter().any(|table| table == shared_table),
                "{shared_table} should be available in full subscription mode"
            );
        }
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query
                == "SELECT * FROM temporal_event WHERE session_key = 'agent:main:main'"));
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM world_clock"));
        // 03.T4: shared_archetype_event is keyed by day_id + publisher_identity_handle,
        // not by session_key. The subscription has no WHERE clause; consumer-side
        // and SpaceTimeDB RLS handle visibility.
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM shared_archetype_event"));
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM coincidence"));
        // 03.T4 audit/version surfaces.
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM world_clock_tick"));
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM coincidence_tick"));
        assert!(full_plan
            .subscription_queries()
            .iter()
            .any(|query| query == "SELECT * FROM module_version"));

        let readiness = full_plan.readiness_contract();
        assert_eq!(
            readiness.projection_schema_version,
            SPACETIME_PROJECTION_SCHEMA_VERSION
        );
        assert_eq!(
            readiness.clock_protocol_version,
            SPACETIME_CLOCK_PROTOCOL_VERSION
        );
        assert_eq!(
            readiness.active_fallback_mode,
            SPACETIME_PROJECTION_SOURCE_HTTP_SQL
        );

        for event in [
            "requested",
            "applied",
            "delta",
            "resync",
            "error",
            "closed",
            "fallback-active",
        ] {
            assert!(SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS.contains(&event));
        }
        let envelope = full_plan.lifecycle_envelope("requested", json!({"scope":"full"}));
        assert_eq!(envelope.method, SPACETIME_SUBSCRIBE_METHOD);
        assert_eq!(envelope.session_key, "agent:main:main");
        assert_eq!(
            envelope.projection_schema_version,
            SPACETIME_PROJECTION_SCHEMA_VERSION
        );

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

    #[test]
    fn typed_delta_decodes_initial_subscription_with_kairos_insert_and_routes_by_table_identity() {
        let message = json!({
            "InitialSubscription": {
                "database_update": {
                    "tables": [
                        {
                            "table_name": "kairos_surface",
                            "updates": [{
                                "inserts": [{"kairos_snapshot_id": "kairos-test-1", "available": true}]
                            }]
                        },
                        {
                            "table_name": "session_surface",
                            "updates": [{
                                "inserts": [{"session_key": "agent:main:main", "day_id": "07-05-2026"}]
                            }]
                        }
                    ]
                }
            }
        });
        let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
        assert_eq!(delta.message_kind, SpacetimeMessageKind::InitialSubscription);
        assert_eq!(delta.inserts.len(), 2);
        assert!(delta.deletes.is_empty());

        // KairosSurface insert is routable by surface identity.
        let kairos = delta
            .first_kairos_insert()
            .expect("KairosSurface insert must be tagged by surface");
        assert_eq!(kairos["kairos_snapshot_id"], "kairos-test-1");
        assert_eq!(kairos["available"], true);

        // SessionSurface insert is also typed correctly.
        let has_session = delta.inserts.iter().any(|delta| matches!(
            delta,
            SpacetimeTableDelta::SessionSurface { row } if row["session_key"] == "agent:main:main"
        ));
        assert!(has_session, "SessionSurface insert must be typed");
    }

    #[test]
    fn typed_delta_handles_transaction_update_with_inserts_and_deletes() {
        let message = json!({
            "TransactionUpdate": {
                "status": {
                    "Committed": {
                        "tables": [{
                            "table_name": "world_clock",
                            "updates": [{
                                "inserts": [{"world_clock_id": "clock-1", "tick": 42}],
                                "deletes": [{"world_clock_id": "clock-0", "tick": 41}]
                            }]
                        }]
                    }
                }
            }
        });
        let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
        assert_eq!(delta.message_kind, SpacetimeMessageKind::TransactionUpdate);
        assert_eq!(delta.inserts.len(), 1);
        assert_eq!(delta.deletes.len(), 1);
        assert!(matches!(
            delta.inserts[0],
            SpacetimeTableDelta::WorldClock { .. }
        ));
        assert!(matches!(
            delta.deletes[0],
            SpacetimeTableDelta::WorldClock { .. }
        ));
    }

    #[test]
    fn typed_delta_classifies_subscribe_multi_applied_and_transaction_update_light() {
        let multi = json!({
            "SubscribeMultiApplied": {
                "update": {"tables": []}
            }
        });
        let delta = SpacetimeProjectionDelta::from_subscription_message(&multi).unwrap();
        assert_eq!(delta.message_kind, SpacetimeMessageKind::SubscribeMultiApplied);

        let light = json!({
            "TransactionUpdateLight": {
                "update": {"tables": []}
            }
        });
        let delta = SpacetimeProjectionDelta::from_subscription_message(&light).unwrap();
        assert_eq!(
            delta.message_kind,
            SpacetimeMessageKind::TransactionUpdateLight
        );
    }

    #[test]
    fn typed_delta_treats_unknown_message_kinds_as_unknown_with_empty_delta() {
        let identity_token = json!({"IdentityToken": {"identity": "abc"}});
        let delta = SpacetimeProjectionDelta::from_subscription_message(&identity_token).unwrap();
        assert_eq!(delta.message_kind, SpacetimeMessageKind::Unknown);
        assert!(delta.inserts.is_empty() && delta.deletes.is_empty());
    }

    #[test]
    fn kernel_bridge_stream_event_round_trips_through_serde_for_every_variant() {
        let events = vec![
            KernelBridgeStreamEvent::ConnectionStatus(KernelBridgeConnectionStatus {
                gateway_id: "gateway-main".to_owned(),
                state: KernelBridgeConnectionState::Connected,
                protocol_version: 3,
                clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
                graphiti_runtime_status: GraphitiRuntimeStatus::Available,
                at_ms: 1_000,
            }),
            KernelBridgeStreamEvent::SubscriptionStatus(KernelBridgeSubscriptionStatus {
                subscription_id: "sub-1".to_owned(),
                method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
                session_key: "agent:main:main".to_owned(),
                phase: "applied".to_owned(),
                source: "websocket-multiplex".to_owned(),
                privacy_class: "session-local".to_owned(),
                graphiti_runtime_status: GraphitiRuntimeStatus::Available,
                at_ms: 1_001,
            }),
            KernelBridgeStreamEvent::Delta(KernelBridgeDelta {
                subscription_id: "sub-1".to_owned(),
                session_key: "agent:main:main".to_owned(),
                message_kind: SpacetimeMessageKind::SubscribeMultiApplied,
                inserts: vec![KernelBridgeCachedSurface {
                    surface: "kairos_surface".to_owned(),
                    privacy_class: KernelBridgePrivacyClass::PublicSafe,
                    row: json!({"kairos_snapshot_id": "k1"}),
                    updated_at_ms: 1_010,
                }],
                deletes: vec![],
            }),
            KernelBridgeStreamEvent::Resync(KernelBridgeResync {
                subscription_id: "sub-1".to_owned(),
                session_key: "agent:main:main".to_owned(),
                stale_profile_generation: Some(7),
                recovered_profile_generation: 8,
                recovered_surfaces: vec![],
            }),
            KernelBridgeStreamEvent::ProtocolMismatch(KernelBridgeProtocolMismatch {
                local_projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
                remote_projection_schema_version: "ancient".to_owned(),
                local_reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
                remote_reducer_abi_version: "ancient".to_owned(),
                local_clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
                remote_clock_protocol_version: "ancient".to_owned(),
                at_ms: 1_020,
            }),
        ];
        for event in events {
            let json = serde_json::to_value(&event).expect("event must serialise");
            // External tag is the `kind` field for the kebab-case discriminator.
            assert!(
                json.get("kind").and_then(Value::as_str).is_some(),
                "every kernel-bridge event must carry a `kind` discriminator: {json}"
            );
            let decoded: KernelBridgeStreamEvent =
                serde_json::from_value(json).expect("event must deserialise");
            assert_eq!(event, decoded);
        }
    }

    #[test]
    fn privacy_filter_strips_quintessence_hash_from_pratibimba_presence() {
        // Live native-WS row arrives as a positional array.
        let delta = SpacetimeTableDelta::PratibimbaPresence {
            row: json!([
                "handle-fingerprint",
                "install-xyz",
                "gateway-xyz",
                "agent:user:main",
                "07-05-2026",
                "quint-fingerprint",
                42_u32,
                "public-safe-fingerprint-only",
                true,
                1_780_000_000_u64,
            ]),
        };
        let cached = privacy_filter_table_delta(&delta);
        assert_eq!(cached.surface, "pratibimba_presence");
        assert_eq!(
            cached.privacy_class,
            KernelBridgePrivacyClass::ProtectedReferenceOnly
        );
        let row = cached.row;
        assert_eq!(row["identity_handle"], "handle-fingerprint");
        assert_eq!(row["day_id"], "07-05-2026");
        assert_eq!(row["aspect_grid_cell"], 42);
        assert_eq!(row["present"], true);
        // Correlation handles MUST be stripped at the boundary.
        assert!(
            row.get("session_key").is_none(),
            "session_key must not cross to frontend: {row}"
        );
        assert!(
            row.get("installation_id").is_none(),
            "installation_id must not cross to frontend: {row}"
        );
        assert!(
            row.get("gateway_id").is_none(),
            "gateway_id must not cross to frontend: {row}"
        );
        // quintessence_hash is a derived fingerprint but still identity-shaped —
        // keep it gateway-side per the deliverable privacy invariant.
        assert!(
            row.get("quintessence_hash").is_none(),
            "quintessence_hash must not cross to frontend: {row}"
        );
    }

    #[test]
    fn privacy_filter_strips_payload_json_and_correlation_from_shared_archetype_event() {
        let delta = SpacetimeTableDelta::SharedArchetypeEvent {
            row: json!([
                123_u64,
                "install-secret",
                "gateway-secret",
                "publisher-handle",
                "07-05-2026",
                42_u32,
                "shared.dream.symbol",
                r#"{"raw_publisher_content":"hidden"}"#,
                "public-opt-in-archetype",
                1_780_000_001_u64,
            ]),
        };
        let cached = privacy_filter_table_delta(&delta);
        assert_eq!(cached.privacy_class, KernelBridgePrivacyClass::OptInShared);
        let row = cached.row;
        assert_eq!(row["event_kind"], "shared.dream.symbol");
        assert_eq!(row["publisher_identity_handle"], "publisher-handle");
        assert_eq!(row["day_id"], "07-05-2026");
        // payload_json carries publisher-supplied content — strip at boundary.
        assert!(
            row.get("payload_json").is_none(),
            "payload_json must not cross: {row}"
        );
        assert!(
            row.get("installation_id").is_none(),
            "installation_id must not cross: {row}"
        );
        assert!(
            row.get("gateway_id").is_none(),
            "gateway_id must not cross: {row}"
        );
    }

    #[test]
    fn privacy_filter_passes_public_safe_surfaces_through_unmodified() {
        let delta = SpacetimeTableDelta::WorldClock {
            row: json!([
                "gateway-main",
                100_u64,
                1_780_000_000_000_u64,
                3_u8,
                "regular",
                "kerykeion-hash",
                SPACETIME_CLOCK_PROTOCOL_VERSION,
                "kerykeion-gateway-fed-v1",
                1_780_000_000_u64,
            ]),
        };
        let cached = privacy_filter_table_delta(&delta);
        assert_eq!(cached.surface, "world_clock");
        assert_eq!(cached.privacy_class, KernelBridgePrivacyClass::PublicSafe);
        let row = cached.row;
        assert_eq!(row["tick"], 100);
        assert_eq!(row["gateway_id"], "gateway-main");
        assert_eq!(row["clock_kind"], "regular");
    }

    #[test]
    fn detect_protocol_mismatch_returns_none_when_versions_align() {
        let result = detect_protocol_mismatch(
            SPACETIME_PROJECTION_SCHEMA_VERSION,
            SPACETIME_REDUCER_ABI_VERSION,
            SPACETIME_CLOCK_PROTOCOL_VERSION,
            42,
        );
        assert!(result.is_none(), "aligned versions must not flag mismatch");
    }

    #[test]
    fn detect_protocol_mismatch_flags_any_version_drift() {
        let mismatch = detect_protocol_mismatch(
            "different-projection-schema",
            SPACETIME_REDUCER_ABI_VERSION,
            SPACETIME_CLOCK_PROTOCOL_VERSION,
            777,
        )
        .expect("drift on projection schema must flag");
        assert_eq!(
            mismatch.local_projection_schema_version,
            SPACETIME_PROJECTION_SCHEMA_VERSION
        );
        assert_eq!(
            mismatch.remote_projection_schema_version,
            "different-projection-schema"
        );
        assert_eq!(mismatch.at_ms, 777);
    }

    #[test]
    fn kernel_bridge_api_request_serialises_with_method_discriminator() {
        let request = KernelBridgeApiRequest::SubscribeWorldClock {
            gateway_id: "gateway-main".to_owned(),
        };
        let json = serde_json::to_value(&request).unwrap();
        assert_eq!(json["method"], "subscribe-world-clock");
        assert_eq!(json["params"]["gatewayId"], "gateway-main");

        let request = KernelBridgeApiRequest::SubscribeSharedArchetypeEvent {
            day_id: "07-05-2026".to_owned(),
            aspect_grid_cell_filter: Some(42),
        };
        let json = serde_json::to_value(&request).unwrap();
        assert_eq!(json["method"], "subscribe-shared-archetype-event");
        assert_eq!(json["params"]["dayId"], "07-05-2026");
        assert_eq!(json["params"]["aspectGridCellFilter"], 42);

        let request = KernelBridgeApiRequest::ObserveConnectionState;
        let json = serde_json::to_value(&request).unwrap();
        assert_eq!(json["method"], "observe-connection-state");
    }

    #[test]
    fn graphiti_runtime_status_round_trips_through_kernel_bridge_envelopes() {
        // ConnectionStatus must carry graphiti_runtime_status.
        let connection = KernelBridgeConnectionStatus {
            gateway_id: "gateway-main".to_owned(),
            state: KernelBridgeConnectionState::Connected,
            protocol_version: 3,
            clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
            graphiti_runtime_status: GraphitiRuntimeStatus::Available,
            at_ms: 1_000,
        };
        let json = serde_json::to_value(&connection).unwrap();
        assert_eq!(json["graphitiRuntimeStatus"], "available");

        // SubscriptionStatus likewise.
        let subscription = KernelBridgeSubscriptionStatus {
            subscription_id: "sub-1".to_owned(),
            method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
            session_key: "agent:main:main".to_owned(),
            phase: "applied".to_owned(),
            source: "websocket-multiplex".to_owned(),
            privacy_class: "session-local".to_owned(),
            graphiti_runtime_status: GraphitiRuntimeStatus::Unavailable,
            at_ms: 1_001,
        };
        let json = serde_json::to_value(&subscription).unwrap();
        assert_eq!(json["graphitiRuntimeStatus"], "unavailable");

        // All three variants of GraphitiRuntimeStatus must serialise to
        // the kebab-case discriminator the TypeScript side switches on.
        for (status, expected) in [
            (GraphitiRuntimeStatus::Available, "available"),
            (GraphitiRuntimeStatus::Degraded, "degraded"),
            (GraphitiRuntimeStatus::Unavailable, "unavailable"),
        ] {
            let json = serde_json::to_value(&status).unwrap();
            assert_eq!(json, expected);
        }
    }

    #[test]
    fn graphiti_invocation_envelope_carries_required_axes_in_camel_case() {
        let envelope = GraphitiInvocationEnvelope {
            session_key: "agent:main:main".to_owned(),
            day_id: "07-05-2026".to_owned(),
            now_path: "/vault/Empty/Present/07-05-2026/session-main/now.md".to_owned(),
            namespace_ref: "pratibimba-local".to_owned(),
            session_arc_id: "day:07-05-2026:session:session-main".to_owned(),
            privacy_class: GraphitiPrivacyClass::ProtectedEpisodic,
            agent_id: "epii".to_owned(),
        };
        let json = serde_json::to_value(&envelope).unwrap();
        assert_eq!(json["sessionKey"], "agent:main:main");
        assert_eq!(json["dayId"], "07-05-2026");
        assert_eq!(
            json["nowPath"],
            "/vault/Empty/Present/07-05-2026/session-main/now.md"
        );
        assert_eq!(json["namespaceRef"], "pratibimba-local");
        assert_eq!(json["sessionArcId"], "day:07-05-2026:session:session-main");
        assert_eq!(json["privacyClass"], "protected-episodic");
        assert_eq!(json["agentId"], "epii");

        let public = GraphitiInvocationEnvelope {
            privacy_class: GraphitiPrivacyClass::PublicProvenance,
            ..envelope
        };
        let json = serde_json::to_value(&public).unwrap();
        assert_eq!(json["privacyClass"], "public-provenance");
    }

    #[test]
    fn assert_no_graphiti_body_in_row_accepts_safe_reference_only_rows() {
        // A SessionSurface-shaped row: only the references cross.
        let safe_row = json!({
            "session_key": "agent:main:main",
            "day_id": "07-05-2026",
            "graphiti_namespace_ref": "pratibimba-local",
            "graphiti_arc_id": "day:07-05-2026:session:session-main",
        });
        assert!(assert_no_graphiti_body_in_row(&safe_row).is_ok());

        // A GlobalTemporalSurface-shaped row likewise.
        let safe_global = json!({
            "surface_key": "global",
            "day_id": "07-05-2026",
            "graphiti_namespace_ref": "pratibimba-local",
            "graphiti_session_arc_id": "day:07-05-2026:session:session-main",
        });
        assert!(assert_no_graphiti_body_in_row(&safe_global).is_ok());
    }

    #[test]
    fn assert_no_graphiti_body_in_row_refuses_every_episode_body_field() {
        for forbidden in [
            "episode_id",
            "episode",
            "episode_body",
            "memory_body",
            "protected_payload",
            "journal_text",
            "dream_body",
            "raw_episode",
        ] {
            let row = json!({
                "session_key": "agent:main:main",
                forbidden: "should-not-be-here",
            });
            let result = assert_no_graphiti_body_in_row(&row);
            assert!(
                result.is_err(),
                "row containing `{forbidden}` must be refused"
            );
            let err = result.unwrap_err();
            assert!(
                err.contains(forbidden),
                "error must name the offending field `{forbidden}`: {err}"
            );
        }
    }

    #[test]
    fn classify_vault_path_marks_nara_protected_under_any_day() {
        // Canonical layout: Idea/Pratibimba/Nara/<day>/protected/...
        let protected = [
            "Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
            "Idea/Pratibimba/Nara/01-01-2026/protected/dream/2026-01-01.md",
            "Pratibimba/Nara/07-05-2026/protected/birth-data.md",
            // Windows-style separator must normalise.
            "Idea\\Pratibimba\\Nara\\07-05-2026\\protected\\journal.md",
            // Leading slash form.
            "/Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
        ];
        for path in protected {
            assert_eq!(
                classify_vault_path_privacy(path),
                S1VaultPathPrivacyClass::Protected,
                "path {path} must be classified Protected"
            );
        }
    }

    #[test]
    fn classify_vault_path_treats_non_protected_nara_paths_as_public() {
        let public = [
            // Public-safe Nara surfaces (not under /protected/).
            "Idea/Pratibimba/Nara/07-05-2026/now.md",
            "Idea/Pratibimba/Nara/07-05-2026/oracle/draw.md",
            // Other vault content.
            "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md",
            "Idea/Empty/Present/07-05-2026/session-1/now.md",
            // Edge: a path that *contains* protected as a substring but
            // not as a positional Nara/<day>/protected segment.
            "Idea/Other/protected-but-not-nara.md",
        ];
        for path in public {
            assert_eq!(
                classify_vault_path_privacy(path),
                S1VaultPathPrivacyClass::Public,
                "path {path} must be classified Public"
            );
        }
    }

    #[test]
    fn s1_vault_rename_receipt_round_trips_through_serde() {
        let receipt = S1VaultRenameReceipt {
            from_path: "Idea/A.md".to_owned(),
            to_path: "Idea/B.md".to_owned(),
            reconciled_documents: vec![
                "Idea/Index.md".to_owned(),
                "Idea/Other.md".to_owned(),
            ],
            reconciled_link_count: 5,
            refusals: vec![S1VaultRenameRefusal {
                source_path: "Idea/Refused.md".to_owned(),
                reason: S1VaultRenameRefusalReason::OrphanHeading,
                detail: "heading `#Foo` no longer exists in B.md".to_owned(),
            }],
        };
        let json = serde_json::to_value(&receipt).unwrap();
        assert_eq!(json["fromPath"], "Idea/A.md");
        assert_eq!(json["reconciledLinkCount"], 5);
        assert_eq!(json["refusals"][0]["reason"], "orphan-heading");
        let decoded: S1VaultRenameReceipt = serde_json::from_value(json).unwrap();
        assert_eq!(decoded, receipt);
    }

    #[test]
    fn s1_semantic_response_carries_typed_candidates_with_staleness_and_privacy() {
        let response = S1SemanticResponse {
            seed_sources: vec!["Idea/Seed.md".to_owned()],
            candidates: vec![
                S1SemanticCandidate {
                    target_path: "Idea/A.md".to_owned(),
                    wikilink_title: "A".to_owned(),
                    score: 0.92,
                    kind: S1SemanticCandidateKind::SemanticBlock,
                    evidence_source_path: "Idea/A.md".to_owned(),
                    evidence_lines: Some((12, 18)),
                    stale: false,
                    privacy_class: S1VaultPathPrivacyClass::Public,
                },
                S1SemanticCandidate {
                    target_path: "Idea/Pratibimba/Nara/07-05-2026/protected/dream.md".to_owned(),
                    wikilink_title: "Dream".to_owned(),
                    score: 0.85,
                    kind: S1SemanticCandidateKind::SemanticSource,
                    evidence_source_path: "Idea/Pratibimba/Nara/07-05-2026/protected/dream.md".to_owned(),
                    evidence_lines: None,
                    stale: true,
                    privacy_class: S1VaultPathPrivacyClass::Protected,
                },
            ],
            warnings: vec![],
            staleness: S1SemanticStaleness::Stale,
            smart_env_index_path: Some(".smart-env/multi/index.ajson".to_owned()),
        };
        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["candidates"][0]["kind"], "semantic-block");
        assert_eq!(json["candidates"][0]["privacyClass"], "public");
        assert_eq!(json["candidates"][1]["privacyClass"], "protected");
        assert_eq!(json["candidates"][1]["stale"], true);
        assert_eq!(json["staleness"], "stale");
        let decoded: S1SemanticResponse = serde_json::from_value(json).unwrap();
        assert_eq!(decoded, response);
    }

    #[test]
    fn scan_for_forbidden_privacy_fields_catches_every_canonical_invariant() {
        for field in PRIVACY_FORBIDDEN_FIELD_NAMES {
            let payload = format!(r#"{{"safe":"ok","{field}":"should-not-be-here"}}"#);
            let hits = scan_for_forbidden_privacy_fields(&payload);
            assert!(
                hits.contains(field),
                "field {field} must be detected in {payload}"
            );
        }
    }

    #[test]
    fn scan_for_forbidden_privacy_fields_does_not_false_positive_on_substring_matches() {
        // `episode_id` is forbidden as a top-level key; a different key
        // ending in `_episode_id` must NOT trip the scan.
        let safe = r#"{"safe":"ok","other_episode_id_field":"reference-handle"}"#;
        let hits = scan_for_forbidden_privacy_fields(safe);
        assert!(
            hits.is_empty(),
            "substring match must not false-positive; hits={hits:?}"
        );
    }

    #[test]
    fn scan_for_forbidden_privacy_fields_accepts_safe_reference_only_payloads() {
        let safe = r#"{
            "session_key": "agent:main:main",
            "day_id": "07-05-2026",
            "graphiti_namespace_ref": "pratibimba-local",
            "graphiti_arc_id": "day:07-05-2026:session:session-main",
            "identity_handle": "blake3-fingerprint-hex",
            "quintessence_hash": "blake3-quaternionic-hex"
        }"#;
        let hits = scan_for_forbidden_privacy_fields(safe);
        assert!(
            hits.is_empty(),
            "safe row with only references and fingerprints must pass; hits={hits:?}"
        );
    }

    #[test]
    fn production_fallback_policy_defaults_to_development_only_without_opt_in() {
        // Clear the env first so the default is observed.
        std::env::remove_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK");
        assert_eq!(
            detect_production_fallback_policy(),
            ProductionFallbackPolicy::DevelopmentOnly
        );
        std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "1");
        assert_eq!(
            detect_production_fallback_policy(),
            ProductionFallbackPolicy::OperatorOptIn
        );
        std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "TRUE");
        assert_eq!(
            detect_production_fallback_policy(),
            ProductionFallbackPolicy::OperatorOptIn
        );
        std::env::set_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK", "no");
        assert_eq!(
            detect_production_fallback_policy(),
            ProductionFallbackPolicy::DevelopmentOnly
        );
        std::env::remove_var("EPI_GATE_ALLOW_PRODUCTION_HTTP_FALLBACK");
    }

    #[test]
    fn track03_release_gate_open_requires_every_criterion_true() {
        let mut report = Track03ReleaseGateReport {
            multi_subscriber_clock_within_tolerance: true,
            bind_kairos_p95_under_100ms: true,
            reconnect_recovers_latest_state: true,
            privacy_audit_no_forbidden_fields: true,
            production_fallback_policy: ProductionFallbackPolicy::DevelopmentOnly,
            graphiti_runtime_status: GraphitiRuntimeStatus::Available,
            projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
            reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
            clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
        };
        assert!(report.is_open(), "all gates true => open");
        // Each individual criterion gates the open state.
        for flip in [
            |r: &mut Track03ReleaseGateReport| {
                r.multi_subscriber_clock_within_tolerance = false;
            },
            |r: &mut Track03ReleaseGateReport| {
                r.bind_kairos_p95_under_100ms = false;
            },
            |r: &mut Track03ReleaseGateReport| {
                r.reconnect_recovers_latest_state = false;
            },
            |r: &mut Track03ReleaseGateReport| {
                r.privacy_audit_no_forbidden_fields = false;
            },
        ] {
            let mut clone = report.clone();
            flip(&mut clone);
            assert!(
                !clone.is_open(),
                "flipping a single criterion to false must close the gate"
            );
        }
        // Production fallback policy and graphiti status do NOT directly
        // gate the release — they are operator-facing context, not pass/fail
        // criteria. Verify that change.
        report.production_fallback_policy = ProductionFallbackPolicy::OperatorOptIn;
        assert!(
            report.is_open(),
            "production fallback policy is operator context, not a gate"
        );
    }

    #[test]
    fn typed_delta_preserves_unknown_table_identity_via_other_variant() {
        let message = json!({
            "SubscribeMultiApplied": {
                "update": {
                    "tables": [{
                        "table_name": "future_table_not_yet_modelled",
                        "updates": [{"inserts": [{"id": 1}]}]
                    }]
                }
            }
        });
        let delta = SpacetimeProjectionDelta::from_subscription_message(&message).unwrap();
        assert_eq!(delta.inserts.len(), 1);
        match &delta.inserts[0] {
            SpacetimeTableDelta::Other { table_name, row } => {
                assert_eq!(table_name, "future_table_not_yet_modelled");
                assert_eq!(row["id"], 1);
            }
            other => panic!("expected Other variant, got {other:?}"),
        }
    }

    // ====== 13.T2 dispatch-plan contract tests ======

    #[test]
    fn every_method_in_metadata_has_a_dispatch_plan_entry() {
        let missing: Vec<&str> = METHOD_NAMES
            .iter()
            .copied()
            .filter(|method| method_dispatch_plan_entry(method).is_none())
            .collect();
        assert!(
            missing.is_empty(),
            "METHOD_NAMES entries without a dispatch-plan row: {missing:?}"
        );
    }

    #[test]
    fn dispatch_plan_does_not_carry_methods_outside_metadata() {
        let stray: Vec<&str> = METHOD_DISPATCH_PLAN
            .iter()
            .map(|entry| entry.method)
            .filter(|method| !METHOD_NAMES.contains(method))
            .collect();
        assert!(
            stray.is_empty(),
            "dispatch-plan rows reference methods absent from METHOD_NAMES: {stray:?}"
        );
    }

    #[test]
    fn dispatch_plan_has_unique_method_rows() {
        let mut seen = std::collections::HashSet::new();
        for entry in METHOD_DISPATCH_PLAN {
            assert!(
                seen.insert(entry.method),
                "duplicate dispatch-plan row for {}",
                entry.method
            );
        }
    }

    #[test]
    fn dispatch_plan_carries_all_six_canonical_kinds_or_extensions() {
        // The plan body enumerates six kinds: S3 native handler, S2 graph
        // service adapter, S4 orchestration adapter, S5 governance adapter,
        // S0 product adapter, Missing. The plan-extension `S1HenAdapter`
        // is permitted to surface alongside them per the module-level
        // 13.T2 comment.
        let mut s3 = 0;
        let mut s2 = 0;
        let mut s4 = 0;
        let mut s5 = 0;
        let mut s0 = 0;
        let mut s1 = 0;
        let mut missing = 0;
        for entry in METHOD_DISPATCH_PLAN {
            match entry.kind {
                MethodDispatchKind::S3NativeHandler => s3 += 1,
                MethodDispatchKind::S2GraphServiceAdapter => s2 += 1,
                MethodDispatchKind::S4OrchestrationAdapter => s4 += 1,
                MethodDispatchKind::S5GovernanceAdapter => s5 += 1,
                MethodDispatchKind::S0ProductAdapter => s0 += 1,
                MethodDispatchKind::S1HenAdapter => s1 += 1,
                MethodDispatchKind::Missing => missing += 1,
            }
        }
        assert!(s3 > 0, "expected at least one S3 native handler row");
        assert!(s2 > 0, "expected at least one S2 graph adapter row");
        assert!(s4 > 0, "expected at least one S4 orchestration row");
        assert!(s5 > 0, "expected at least one S5 governance row");
        assert!(s0 > 0, "expected at least one S0 product adapter row");
        // S1 Hen adapter is a 13.T2 plan extension and 03.T6.5 introduced
        // five vault/semantic methods; the count should be five.
        assert_eq!(s1, 5, "expected exactly five s1' Hen vault rows");
        // Missing is currently 0 because no Missing-status methods appear
        // in METHOD_NAMES (parity.rs Missing records all live outside the
        // shipped manifest). The variant must still be expressible.
        assert_eq!(missing, 0);
    }

    #[test]
    fn dispatch_plan_authority_paths_are_non_empty() {
        for entry in METHOD_DISPATCH_PLAN {
            assert!(
                !entry.authority_path.is_empty(),
                "dispatch plan entry for {} has empty authority_path",
                entry.method
            );
        }
    }

    #[test]
    fn dispatch_plan_missing_entries_carry_extraction_annotation() {
        // If a future entry is added with kind=Missing, it MUST carry the
        // `needs_extraction_to` annotation per the plan's "Missing with a
        // needs_extraction_to annotation" rule (line 91 of 13.T2 plan body).
        for entry in METHOD_DISPATCH_PLAN {
            if matches!(entry.kind, MethodDispatchKind::Missing) {
                assert!(
                    entry.needs_extraction_to.is_some(),
                    "Missing dispatch entry for {} must carry needs_extraction_to annotation",
                    entry.method
                );
            }
        }
    }
}
