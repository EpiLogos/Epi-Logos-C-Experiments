pub use epi_s3_gateway_contract::{
    gateway_session_method_names, DEFAULT_GATEWAY_PORT, EVENT_NAMES, METHOD_NAMES,
    OMNIPANEL_SESSION_METADATA, TEST_GATEWAY_PORT,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CoordinateParityStatus {
    Native,
    Mirror,
    Compatibility,
    Missing,
}

#[derive(Debug, Clone, Copy)]
pub struct CoordinateParityRecord {
    pub canonical_method: &'static str,
    pub owner: &'static str,
    pub status: CoordinateParityStatus,
    pub live_gateway_method: Option<&'static str>,
    pub cli_mirror: Option<&'static str>,
    pub body_path: &'static str,
    pub test_evidence: &'static [&'static str],
}

pub const COORDINATE_PARITY_RECORDS: &[CoordinateParityRecord] = &[
    CoordinateParityRecord {
        canonical_method: "connect",
        owner: "S3",
        status: CoordinateParityStatus::Compatibility,
        live_gateway_method: Some("connect"),
        cli_mirror: Some("epi gate start"),
        body_path: "Body/S/S0/epi-cli/src/gate/protocol.rs",
        test_evidence: &["gate_connect_protocol.rs", "gate_full_parity_contract.rs"],
    },
    CoordinateParityRecord {
        canonical_method: "agent.capabilities",
        owner: "S3",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S3/gateway capability manifest",
        test_evidence: &["gate_parity_manifest.rs"],
    },
    CoordinateParityRecord {
        canonical_method: "s0.*",
        owner: "S0/S0'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: Some("exec.approval.*"),
        cli_mirror: Some("epi"),
        body_path: "Body/S/S0/epi-cli/src/main.rs",
        test_evidence: &[
            "up_command.rs",
            "core_knowing.rs",
            "techne_cmux_contract.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s1.*",
        owner: "S1",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi vault"),
        body_path: "Body/S/S0/epi-cli/src/vault",
        test_evidence: &[
            "vault_commands.rs",
            "vault_frontmatter.rs",
            "vault_paths_templates.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s1'.*",
        owner: "S1'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "Body/S/S1/hen-compiler-core",
        test_evidence: &[
            "hen-compiler-core/tests/compile_plan.rs",
            "hen-compiler-core/tests/frontmatter.rs",
            "vault_frontmatter.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s2.graph.*",
        owner: "S2",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi graph"),
        body_path: "Body/S/S0/epi-cli/src/graph",
        test_evidence: &[
            "graph_client.rs",
            "graph_commands.rs",
            "graph_seed.rs",
            "graph_sync.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s2'.*",
        owner: "S2'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi graph retrieve"),
        body_path: "Body/S/S0/epi-cli/src/graph/retrieval",
        test_evidence: &[
            "graph_retrieval.rs",
            "semantic_cache_contract.rs",
            "redis_cache.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s3.*",
        owner: "S3",
        status: CoordinateParityStatus::Compatibility,
        live_gateway_method: Some("sessions.* / channels.* / chat.* / send"),
        cli_mirror: Some("epi gate"),
        body_path: "Body/S/S0/epi-cli/src/gate",
        test_evidence: &[
            "gate_sessions.rs",
            "gate_channels_cron_voice.rs",
            "gate_chat.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s3'.*",
        owner: "S3'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: Some("presence.list / system-presence / health.snapshot"),
        cli_mirror: Some("epi gate inspect"),
        body_path: "Body/S/S0/epi-cli/src/gate/runtime.rs",
        test_evidence: &[
            "gate_runtime_state.rs",
            "gate_tick_health.rs",
            "gate_spacetimedb_bridge.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s3'.temporal.*",
        owner: "S3'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s3'.temporal.context"),
        cli_mirror: Some("epi gate temporal context"),
        body_path: "Body/S/S0/epi-cli/src/gate/temporal.rs",
        test_evidence: &[
            "gate_temporal_context.rs",
            "gate_spacetimedb_bridge.rs",
            "redis_cache.rs",
            "graph_client.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s4.agent.*",
        owner: "S4",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s4.agent.query / s4.agent.notify / s4.agent.status / agent / agent.wait / node.invoke"),
        cli_mirror: Some("epi agent"),
        body_path: "Body/S/S0/epi-cli/src/gate/anima.rs + Body/S/S0/epi-cli/src/agent",
        test_evidence: &[
            "agent_spawn.rs",
            "gate_agent_rpc.rs",
            "gate_s4_coordinate_surfaces.rs",
            "gate_subagent_spawn.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s4'.*",
        owner: "S4'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: Some("s4'.vak.evaluate / s4'.orchestrate / s4'.psyche.state / s4'.psyche.update / s4'.permission.get / skills.* / exec.approval.*"),
        cli_mirror: Some("epi agent vak"),
        body_path: "Body/S/S4/ta-onta/S4-4p-anima",
        test_evidence: &[
            "agent_vak.rs",
            "gate_anima_pleroma_access.rs",
            "gate_s4_coordinate_surfaces.rs",
            "vak_constitutional_architecture.rs",
            "ta_onta_cli_contract.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.gnostic.*",
        owner: "S5",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi techne gnosis"),
        body_path: "Body/S/S5/epi-gnostic",
        test_evidence: &["gnosis_commands.rs", "Body/S/S5/epi-gnostic/tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5.episodic.*",
        owner: "S3 runtime / S5 invocation",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5.episodic.search / s5.episodic.deposit"),
        cli_mirror: Some("epi gate graphiti"),
        body_path: "Body/S/S3/gateway-contract + Body/S/S0/epi-cli/src/gate/graphiti.rs",
        test_evidence: &[
            "Body/S/S3/gateway-contract graphiti_contract_keeps_runtime_separate_from_invocation_governance",
            "gate_epii_agent_access.rs",
            "graph_client.rs live Neo4j S3/S5 episode ownership proof",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.bimba.*",
        owner: "S5/S2'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi core knowing"),
        body_path: "Body/S/S0/epi-cli/src/core",
        test_evidence: &["core_knowing.rs", "graph_retrieval.rs"],
    },
    CoordinateParityRecord {
        canonical_method: "s5.m.*",
        owner: "S5/M'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: Some("nara.*"),
        cli_mirror: Some("epi nara"),
        body_path: "Body/S/S0/epi-cli/src/nara",
        test_evidence: &[
            "nara_e2e_smoke.rs",
            "nara_oracle_payload.rs",
            "portal_clock_state.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.mef.*",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future MEF evaluator tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.ql.*",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future QL evaluator tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.kbase.*",
        owner: "S5'",
        status: CoordinateParityStatus::Mirror,
        live_gateway_method: None,
        cli_mirror: Some("epi vimarsa"),
        body_path: "Body/S/S0/epi-cli/src/vimarsa",
        test_evidence: &["future kbase governance tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.improve.*",
        owner: "S5'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5'.improve.status / s5'.improve.propose / s5'.improve.evaluate / s5'.improve.promote / s5'.improve.history"),
        cli_mirror: None,
        body_path: "Body/S/S5/epii-autoresearch-core",
        test_evidence: &[
            "Body/S/S5/epii-autoresearch-core/tests/improvement_loop.rs",
            "gate_epii_improve.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.epii.*",
        owner: "S5'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5'.epii.status / s5'.epii.deposit / s5'.epii.runtime.context / s5'.epii.user.orientation / s5'.epii.pratibimba.status / s5'.epii.kairos.context"),
        cli_mirror: None,
        body_path: "Body/S/S5/epii-agent-core",
        test_evidence: &[
            "Body/S/S5/epii-agent-core/tests/agent_access.rs",
            "gate_epii_agent_access.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.review.*",
        owner: "S5'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5'.review.inbox / s5'.review.submit / s5'.review.resolve / s5'.review.history"),
        cli_mirror: None,
        body_path: "Body/S/S5/epii-review-core",
        test_evidence: &[
            "Body/S/S5/epii-review-core/tests/review_inbox.rs",
            "gate_epii_review.rs",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.gnosis.*",
        owner: "S5'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5'.gnosis.context.retrieve"),
        cli_mirror: None,
        body_path: "target Body/S/S5/epii-gnosis-governance",
        test_evidence: &["gate_epii_agent_access.rs"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.explain",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future Epii pedagogy tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.teach",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future Epii pedagogy tests"],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.seed.generate",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: Some("epi vault template"),
        body_path: "Body/S/S0/epi-cli/src/vault/templates.rs",
        test_evidence: &["idea_tree_templates.rs", "vault_paths_templates.rs"],
    },
];

pub fn method_names() -> &'static [&'static str] {
    METHOD_NAMES
}

pub fn coordinate_parity_records() -> &'static [CoordinateParityRecord] {
    COORDINATE_PARITY_RECORDS
}

pub fn coordinate_family_for_gateway_method(method: &str) -> Option<&'static str> {
    match method {
        "connect" => Some("connect"),
        "agent" | "agent.identity.get" | "agent.wait" | "agents.list" | "s4.agent.query"
        | "s4.agent.notify" | "s4.agent.status" | "node.invoke" | "node.invoke.result"
        | "node.event" | "node.list" | "node.describe" | "node.rename" => Some("s4.agent.*"),
        "browser.request" | "web.login.start" | "web.login.wait" | "logs.tail" | "update.run"
        | "wizard.start" | "wizard.next" | "wizard.cancel" | "wizard.status" => Some("s0.*"),
        "channels.status" | "channels.logout" | "chat.history" | "chat.abort" | "chat.send"
        | "chat.inject" | "send" | "sessions.list" | "sessions.preview" | "sessions.resolve"
        | "sessions.patch" | "sessions.reset" | "sessions.delete" | "sessions.compact"
        | "sessions.fork" | "sessions.resume" | "sessions.import" | "sessions.tree"
        | "last-heartbeat" | "set-heartbeats" | "wake" | "talk.mode" | "tts.status"
        | "tts.enable" | "tts.disable" | "tts.convert" | "tts.setProvider" | "tts.providers"
        | "voicewake.get" | "voicewake.set" => Some("s3.*"),
        "config.get" | "config.schema" | "config.set" | "config.patch" | "config.apply"
        | "cron.list" | "cron.status" | "cron.add" | "cron.update" | "cron.remove" | "cron.run"
        | "cron.runs" | "models.list" | "status" | "health" | "status.summary"
        | "health.snapshot" | "presence.list" | "usage.status" | "usage.cost"
        | "system-presence" | "system-event" => Some("s3'.*"),
        "s3'.temporal.context" => Some("s3'.temporal.*"),
        "device.pair.list"
        | "device.pair.approve"
        | "device.pair.reject"
        | "device.token.rotate"
        | "device.token.revoke"
        | "exec.approval.request"
        | "exec.approval.resolve"
        | "exec.approvals.get"
        | "exec.approvals.set"
        | "exec.approvals.node.get"
        | "exec.approvals.node.set"
        | "skills.status"
        | "skills.bins"
        | "skills.install"
        | "skills.update"
        | "s4'.vak.evaluate"
        | "s4'.orchestrate"
        | "s4'.psyche.state"
        | "s4'.psyche.update"
        | "s4'.permission.get" => Some("s4'.*"),
        "s5'.review.inbox" | "s5'.review.submit" | "s5'.review.resolve" | "s5'.review.history" => {
            Some("s5'.review.*")
        }
        "s5.episodic.search" | "s5.episodic.deposit" => Some("s5.episodic.*"),
        "s5'.improve.status"
        | "s5'.improve.propose"
        | "s5'.improve.evaluate"
        | "s5'.improve.promote"
        | "s5'.improve.history" => Some("s5'.improve.*"),
        "s5'.epii.status"
        | "s5'.epii.deposit"
        | "s5'.epii.runtime.context"
        | "s5'.epii.user.orientation"
        | "s5'.epii.pratibimba.status"
        | "s5'.epii.kairos.context" => Some("s5'.epii.*"),
        "s5'.gnosis.context.retrieve" => Some("s5'.gnosis.*"),
        "node.pair.request" | "node.pair.list" | "node.pair.approve" | "node.pair.reject"
        | "node.pair.verify" => Some("s4.agent.*"),
        _ => None,
    }
}

pub fn event_names() -> &'static [&'static str] {
    EVENT_NAMES
}

pub fn session_method_names() -> &'static [&'static str] {
    &[
        "sessions.list",
        "sessions.preview",
        "sessions.resolve",
        "sessions.patch",
        "sessions.reset",
        "sessions.delete",
        "sessions.compact",
        "sessions.fork",
        "sessions.resume",
        "sessions.import",
        "sessions.tree",
    ]
}

pub fn chat_method_names() -> &'static [&'static str] {
    &["chat.history", "chat.abort", "chat.send", "chat.inject"]
}

pub fn session_surface_method_names() -> Vec<&'static str> {
    gateway_session_method_names()
}
