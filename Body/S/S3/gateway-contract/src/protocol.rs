use serde::{Deserialize, Serialize};

use crate::{
    M1_SPANDA_HALF_TURN_METHOD, M1_SPANDA_HOLD_METHOD, M1_SPANDA_RELEASE_METHOD,
    M1_SPANDA_STEP_METHOD, M1_SPANDA_WALK_TO_METHOD, PORTAL_EVENT_NAMES,
    S0_PRIME_SETTINGS_API_KEY_STATUS_METHOD, S0_PRIME_SETTINGS_OPT_IN_METHOD,
    S0_PRIME_VERIFIER_CHECK_STATE_METHOD, S0_PRIME_VERIFIER_EMIT_QUERY_METHOD,
    S0_PRIME_VERIFIER_OWL_QUERY_METHOD, S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD,
    S2_GRAPH_ANANDA_POSITION_METHOD, S2_GRAPH_CORE65_AUDIT_METHOD,
    S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD, S2_GRAPH_ONTOLOGY_RELOAD_METHOD,
    S2_GRAPH_PROMOTION_COMMIT_METHOD, S2_GRAPH_PROMOTION_DRY_RUN_METHOD,
    S2_GRAPH_RELATION_FAMILY_LIST_METHOD, S2_GRAPH_SEED_SNAPSHOT_METHOD,
    S5_GNOSTIC_MUSICAL_TRANSCRIPT_METHOD,
};

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
pub const EVENT_NAMES: &[&str] = &["agent", "chat", "tick", "health", "heartbeat"];
pub const COMMAND_METHOD_NAMES: &[&str] = &["s0.command.exec", "s0.command.completion"];
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
    "s0'.anuttara.trace",
    S0_PRIME_VERIFIER_CHECK_STATE_METHOD,
    S0_PRIME_VERIFIER_EMIT_QUERY_METHOD,
    S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD,
    S0_PRIME_VERIFIER_OWL_QUERY_METHOD,
    S0_PRIME_SETTINGS_API_KEY_STATUS_METHOD,
    S0_PRIME_SETTINGS_OPT_IN_METHOD,
    "s2.graph.query",
    "s2.graph.node",
    "s2.graph.traverse",
    S2_GRAPH_ANANDA_POSITION_METHOD,
    "s2.graph.harmonic_relations.materialize",
    "s2.graph.pointer_web.compute",
    "s2.graph.pointer_web.refresh",
    "s2.graph.kernel_resonance.record",
    S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD,
    S2_GRAPH_ONTOLOGY_RELOAD_METHOD,
    S2_GRAPH_SEED_SNAPSHOT_METHOD,
    S2_GRAPH_CORE65_AUDIT_METHOD,
    S2_GRAPH_PROMOTION_DRY_RUN_METHOD,
    S2_GRAPH_PROMOTION_COMMIT_METHOD,
    S2_GRAPH_RELATION_FAMILY_LIST_METHOD,
    "s2.parashaktiCorrespondences",
    "m2.cymatic_invert",
    M1_SPANDA_HOLD_METHOD,
    M1_SPANDA_RELEASE_METHOD,
    M1_SPANDA_WALK_TO_METHOD,
    M1_SPANDA_STEP_METHOD,
    M1_SPANDA_HALF_TURN_METHOD,
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
    "s4'.mediation.capabilities.list",
    "s4'.psyche.state",
    "s4'.psyche.update",
    "s4'.permission.get",
    "s3'.temporal.context",
    "s3'.temporal.subscribe",
    "s3'.spacetime.subscribe",
    "s3'.being_pattern.observe",
    "s3'.being_pattern.project",
    "s3'.being_pattern.subscribe",
    "s3'.being_pattern.review_candidate",
    // 03.T6.5: S1 vault gateway surface.
    "s1'.vault.read_file",
    "s1'.vault.write_file",
    "s1'.vault.rename_file",
    "s1'.vault.move_file",
    "s1'.semantic.suggest_links",
    crate::S1_TYPE_CLASSIFY_C_LAYER_METHOD,
    crate::S1_ENTITY_PROMOTE_TO_TYPE_METHOD,
    crate::S1_WORLD_GRADUATE_METHOD,
    // CCT-14 (+14b): entity-candidate lifecycle + review surfaces.
    crate::S1_ENTITY_CAPTURE_METHOD,
    crate::S1_ENTITY_CLASSIFY_METHOD,
    crate::S1_ENTITY_LIST_METHOD,
    crate::S1_WORLD_LIST_ENTITIES_METHOD,
    "s5'.improve.status",
    "s5'.improve.propose",
    "s5'.improve.evaluate",
    "s5'.improve.promote",
    "s5'.improve.history",
    "s5'.epii.status",
    "s5'.epii.deposit",
    "s5'.epii.runtime.context",
    "s5'.gnosis.context.retrieve",
    "s5'.gnostic.ingest",
    "s5'.gnostic.query",
    "s5'.gnostic.resolve",
    S5_GNOSTIC_MUSICAL_TRANSCRIPT_METHOD,
    "s5'.gnostic.notebook",
    "s5'.gnostic.status",
    "s5'.gnostic.models",
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
