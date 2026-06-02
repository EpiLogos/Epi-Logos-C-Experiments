pub use epi_s3_gateway_contract::{
    gateway_session_method_names, DEFAULT_GATEWAY_PORT, EVENT_NAMES, METHOD_NAMES,
    OMNIPANEL_SESSION_METADATA, TEST_GATEWAY_PORT,
};

/// Parity status for a coordinate-family record on the S0 gateway membrane.
///
/// Recast under Track 13 T1 so that the previous ambiguous `Mirror` status is
/// split into explicit kinds:
///
/// - [`Native`] — the Body-native crate IS the canonical authority; S0 carries
///   only entrypoint glue or a thin re-export.
/// - [`Adapter`] — S0 hosts a named long-term adapter that routes operator
///   intent into the Body-native authority. Load-bearing as the operator
///   membrane.
/// - [`CompatibilityAdapter`] — S0 adapter exists to preserve a deprecated or
///   in-transition wire shape until the canonical Body-native replacement
///   lands. Tagged for extraction in a known Track 13 tranche.
/// - [`TemporaryLiveHost`] — S0 currently runs the process or publishes the
///   row because no canonical Body-native host exists yet. Architecturally
///   transitional, not a refactor target.
/// - [`Missing`] — method appears in the canonical method namespace but
///   neither S0 nor Body-native carries an implementation. Targets a future
///   plugin/extraction tranche.
///
/// The variants `Mirror` and `Compatibility` are preserved as deprecated
/// associated constants so external tests retain a smooth migration path. New
/// code MUST use the explicit variants directly.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CoordinateParityStatus {
    Native,
    Adapter,
    CompatibilityAdapter,
    TemporaryLiveHost,
    Missing,
}

impl CoordinateParityStatus {
    /// Deprecated alias for [`CoordinateParityStatus::Adapter`].
    ///
    /// Track 13 T1 recast `Mirror` into the explicit `Adapter` /
    /// `CompatibilityAdapter` / `TemporaryLiveHost` triad. Existing tests and
    /// downstream tooling may still reference `Mirror`; new code should not.
    #[allow(non_upper_case_globals)]
    #[deprecated(
        since = "track-13-T1",
        note = "Mirror was ambiguous. Use Adapter, CompatibilityAdapter, or TemporaryLiveHost explicitly."
    )]
    pub const Mirror: Self = Self::Adapter;

    /// Deprecated alias for [`CoordinateParityStatus::CompatibilityAdapter`].
    ///
    /// Track 13 T1 renamed `Compatibility` to `CompatibilityAdapter` so that
    /// the status word reads as a parity classification rather than a generic
    /// compatibility hint.
    #[allow(non_upper_case_globals)]
    #[deprecated(
        since = "track-13-T1",
        note = "Renamed to CompatibilityAdapter for clarity."
    )]
    pub const Compatibility: Self = Self::CompatibilityAdapter;

    /// Render the status as a portal/UI-friendly string.
    pub fn label(&self) -> &'static str {
        match self {
            Self::Native => "Native",
            Self::Adapter => "Adapter",
            Self::CompatibilityAdapter => "CompatibilityAdapter",
            Self::TemporaryLiveHost => "TemporaryLiveHost",
            Self::Missing => "Missing",
        }
    }

    /// Render a portal-rendered descriptive phrase suitable for the `/`
    /// readiness reports — distinguishes adapter vs compatibility shim vs
    /// temporary live host vs canonical authority for the operator.
    pub fn describe_for_portal(&self) -> &'static str {
        match self {
            Self::Native => "Body-native authority; S0 holds entrypoint glue only.",
            Self::Adapter => "S0 hosts a long-term adapter to a Body-native authority.",
            Self::CompatibilityAdapter => {
                "S0 hosts a compatibility shim preserving a deprecated wire shape; tagged for extraction."
            }
            Self::TemporaryLiveHost => {
                "S0 currently runs this as a temporary live host; no canonical Body-native host yet."
            }
            Self::Missing => "Method declared but unimplemented; targets future plugin/extraction.",
        }
    }
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
    /// Body-native authority path. Required for every non-S0 method that is
    /// adapted from S0 (`Adapter` / `CompatibilityAdapter`). May be `None`
    /// only when S0 itself is the canonical authority (a `Native` record
    /// rooted in S0 substrate) or when no implementation exists yet
    /// (`Missing`).
    pub authority_path: Option<&'static str>,
    /// S0 adapter path that carries the live behavior, when an adapter exists.
    /// `None` for pure-Native records that do not need an adapter and for
    /// `Missing` records that have no implementation.
    pub adapter_path: Option<&'static str>,
    /// The Track 13 tranche identifier (e.g. "13.T2", "13.T7") that owns the
    /// extraction work for this record, or `None` if extraction is complete or
    /// the record is canonical-by-design.
    pub extraction_task: Option<&'static str>,
    /// Explicit list of behaviors S0 is permitted to keep for this record
    /// after Track 13 cleanup completes. The list narrows what S0 may
    /// re-implement in future commits.
    pub allowed_s0_responsibilities: &'static [&'static str],
}

pub const COORDINATE_PARITY_RECORDS: &[CoordinateParityRecord] = &[
    CoordinateParityRecord {
        canonical_method: "connect",
        owner: "S3",
        status: CoordinateParityStatus::CompatibilityAdapter,
        live_gateway_method: Some("connect"),
        cli_mirror: Some("epi gate start"),
        body_path: "Body/S/S0/epi-cli/src/gate/protocol.rs",
        test_evidence: &["gate_connect_protocol.rs", "gate_full_parity_contract.rs"],
        authority_path: Some("Body/S/S3/gateway::protocol"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/protocol.rs"),
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "preserve hello-ok feature handshake until S3 owns connect frame end-to-end",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "agent.capabilities",
        owner: "S3",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S3/gateway capability manifest",
        test_evidence: &["gate_parity_manifest.rs"],
        authority_path: Some("Body/S/S3/gateway-contract (future capability manifest)"),
        adapter_path: None,
        extraction_task: Some("13.T2"),
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s0.*",
        owner: "S0/S0'",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("exec.approval.*"),
        cli_mirror: Some("epi"),
        body_path: "Body/S/S0/epi-cli/src/main.rs",
        test_evidence: &[
            "up_command.rs",
            "core_knowing.rs",
            "techne_cmux_contract.rs",
        ],
        authority_path: Some("Body/S/S0/epi-cli"),
        adapter_path: None,
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "operator-facing CLI parser",
            "command tree and top-level orchestrator",
            "process launcher membrane",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s1.*",
        owner: "S1",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: None,
        cli_mirror: Some("epi vault"),
        body_path: "Body/S/S0/epi-cli/src/vault",
        test_evidence: &[
            "vault_commands.rs",
            "vault_frontmatter.rs",
            "vault_paths_templates.rs",
        ],
        authority_path: Some("Body/S/S1/hen-compiler-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/vault"),
        extraction_task: Some("13.T8"),
        allowed_s0_responsibilities: &[
            "epi vault CLI shape",
            "raw fs reads for operator-facing tasks",
            "route governed writes through Hen once s1'.vault.* lands",
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
        authority_path: Some("Body/S/S1/hen-compiler-core"),
        adapter_path: None,
        extraction_task: None,
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s2.graph.*",
        owner: "S2",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: Some("s2.graph.query / s2.graph.node / s2.graph.traverse / s2.graph.pointer_web.compute / s2.graph.pointer_web.refresh / s2.graph.kernel_resonance.record"),
        cli_mirror: Some("epi graph"),
        body_path: "Body/S/S0/epi-cli/src/graph",
        test_evidence: &[
            "graph_client.rs",
            "graph_commands.rs",
            "graph_seed.rs",
            "graph_sync.rs",
        ],
        authority_path: Some("Body/S/S2/graph-services + Body/S/S2/graph-schema"),
        adapter_path: Some("Body/S/S0/epi-cli/src/graph"),
        extraction_task: Some("13.T5"),
        allowed_s0_responsibilities: &[
            "named re-export façade for epi graph CLI",
            "operator-facing graph commands wrapping S2 services",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s2'.*",
        owner: "S2'",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: None,
        cli_mirror: Some("epi graph retrieve"),
        body_path: "Body/S/S0/epi-cli/src/graph/retrieval",
        test_evidence: &[
            "graph_retrieval.rs",
            "semantic_cache_contract.rs",
            "redis_cache.rs",
        ],
        authority_path: Some("Body/S/S2/graph-services::retrieval + Body/S/S3/redis-context"),
        adapter_path: Some("Body/S/S0/epi-cli/src/graph/retrieval"),
        extraction_task: Some("13.T5"),
        allowed_s0_responsibilities: &[
            "pure re-export of retrieval primitives backing epi graph retrieve CLI",
        ],
    },
    CoordinateParityRecord {
        // s3.* method namespace: S0 hosts the gateway process as a temporary
        // live host (per Thread I feed-inventory α) while route + envelope law
        // belongs to S3. The status carries `CompatibilityAdapter` because the
        // ledger record describes the adapter shape; the live-host nature of
        // server.rs is recorded separately at extraction_task=13.T3 and in the
        // contract-inventory module entry gate.server (classification
        // temporary-live-host).
        canonical_method: "s3.*",
        owner: "S3",
        status: CoordinateParityStatus::CompatibilityAdapter,
        live_gateway_method: Some("sessions.* / channels.* / chat.* / send"),
        cli_mirror: Some("epi gate"),
        body_path: "Body/S/S0/epi-cli/src/gate",
        test_evidence: &[
            "gate_sessions.rs",
            "gate_channels_cron_voice.rs",
            "gate_chat.rs",
        ],
        authority_path: Some("Body/S/S3/gateway + Body/S/S3/gateway-contract"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/server.rs"),
        extraction_task: Some("13.T2 + 13.T3"),
        allowed_s0_responsibilities: &[
            "host gateway process (Tokio listener + WS upgrade)",
            "epi gate start / status / stop CLI verbs",
            "wire frames to S3-owned route metadata; never re-declare route truth",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s3'.*",
        owner: "S3'",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: Some("presence.list / system-presence / health.snapshot"),
        cli_mirror: Some("epi gate inspect"),
        body_path: "Body/S/S0/epi-cli/src/gate/runtime.rs",
        test_evidence: &[
            "gate_runtime_state.rs",
            "gate_tick_health.rs",
            "gate_spacetimedb_bridge.rs",
        ],
        authority_path: Some("Body/S/S3/gateway::runtime"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/runtime.rs"),
        extraction_task: Some("13.T4"),
        allowed_s0_responsibilities: &[
            "operator inspect surfaces (presence/system/health)",
            "spacetimedb bridge env discovery and startup glue",
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
        authority_path: Some("Body/S/S0/portal-core (kernel authority) + Body/S/S3/gateway-contract"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/temporal.rs"),
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "temporal-context renderer (portal-core kernel → gateway JSON)",
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
        authority_path: Some("Body/S/S4/ta-onta + PI agent runtime"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/anima.rs"),
        extraction_task: Some("13.T6"),
        allowed_s0_responsibilities: &[
            "PI runtime adapter for agent invocation",
            "node.invoke wiring to S4 mediation",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s4'.*",
        owner: "S4'",
        status: CoordinateParityStatus::Adapter,
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
        authority_path: Some("Body/S/S4/ta-onta/S4-4p-anima + Body/S/S4/plugins/pleroma/capability-matrix.json"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/anima.rs"),
        extraction_task: Some("13.T6"),
        allowed_s0_responsibilities: &[
            "thin gateway handler that calls S4 ta-onta crate",
            "permission_get / psyche_state / psyche_update dispatch glue",
            "MUST NOT fork mediation-route or VAK evaluation law",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.gnostic.*",
        owner: "S5",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: None,
        cli_mirror: Some("epi techne gnosis"),
        body_path: "Body/S/S5/epi-gnostic",
        test_evidence: &["gnosis_commands.rs", "Body/S/S5/epi-gnostic/tests"],
        authority_path: Some("Body/S/S5/epi-gnostic"),
        adapter_path: Some("Body/S/S0/epi-cli/src/techne/gnosis"),
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[
            "epi techne gnosis CLI verbs",
            "ingest plumbing into S5 gnostic store",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.episodic.*",
        owner: "S3 runtime / S5 invocation",
        status: CoordinateParityStatus::Native,
        live_gateway_method: Some("s5.episodic.search / s5.episodic.deposit / s5.episodic.kernel_resonance.deposit / s5.episodic.kernel_profile_observation.deposit"),
        cli_mirror: Some("epi gate graphiti"),
        body_path: "Body/S/S3/gateway-contract + Body/S/S0/epi-cli/src/gate/graphiti.rs",
        test_evidence: &[
            "Body/S/S3/gateway-contract graphiti_contract_keeps_runtime_separate_from_invocation_governance",
            "gate_epii_agent_access.rs",
            "graph_client.rs live Neo4j S3/S5 episode ownership proof",
        ],
        authority_path: Some("Body/S/S3/graphiti-runtime + Body/S/S5/epii-agent-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/graphiti.rs"),
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "operator-facing GraphitiCmd start/stop/status (legacy port 37778 wrapper) — see compatibility shim G",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.bimba.*",
        owner: "S5/S2'",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: None,
        cli_mirror: Some("epi core knowing"),
        body_path: "Body/S/S0/epi-cli/src/core",
        test_evidence: &["core_knowing.rs", "graph_retrieval.rs"],
        authority_path: Some("Body/S/S5/epi-kbase-core + Body/S/S2/graph-services"),
        adapter_path: Some("Body/S/S0/epi-cli/src/core/knowing"),
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "pure re-exports backing epi core knowing CLI",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5.m.*",
        owner: "S5/M'",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: Some("nara.*"),
        cli_mirror: Some("epi nara"),
        body_path: "Body/S/S0/epi-cli/src/nara",
        test_evidence: &[
            "nara_e2e_smoke.rs",
            "nara_oracle_payload.rs",
            "portal_clock_state.rs",
        ],
        authority_path: Some("Body/S/S0/portal-core (M-clock kernel authority)"),
        adapter_path: Some("Body/S/S0/epi-cli/src/nara"),
        extraction_task: Some("13.T6"),
        allowed_s0_responsibilities: &[
            "epi nara CLI surface (clock/identity/kairos/lens/etc.)",
            "M3/M5 wind+identity pipeline awaiting full FFI",
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
        authority_path: Some("Body/S/S5/plugins/epi-logos (planned)"),
        adapter_path: None,
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.ql.*",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future QL evaluator tests"],
        authority_path: Some("Body/S/S5/plugins/epi-logos (planned)"),
        adapter_path: None,
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.kbase.*",
        owner: "S5'",
        status: CoordinateParityStatus::Adapter,
        live_gateway_method: None,
        cli_mirror: Some("epi vimarsa"),
        body_path: "Body/S/S0/epi-cli/src/vimarsa",
        test_evidence: &["future kbase governance tests"],
        authority_path: Some("Body/S/S5/epi-kbase-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/vimarsa"),
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[
            "epi vimarsa CLI wrapping S5 kbase core",
        ],
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
        authority_path: Some("Body/S/S5/epii-autoresearch-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/improve.rs"),
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[
            "dispatch pass-through only",
            "MUST move ensure_approved_review cross-store guard into S5 autoresearch core",
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
        authority_path: Some("Body/S/S5/epii-agent-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/epii.rs"),
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[
            "dispatch entrypoint only — S5 DTO construction belongs in epii-agent-core",
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
        authority_path: Some("Body/S/S5/epii-review-core"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/review.rs"),
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[
            "thin S5 adapter; path convention (state_root/s5/epii-review) should move into S5",
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
        authority_path: Some("Body/S/S5/epii-agent-core (gnosis context retrieval)"),
        adapter_path: Some("Body/S/S0/epi-cli/src/gate/epii.rs"),
        extraction_task: None,
        allowed_s0_responsibilities: &[
            "dispatch pass-through; gnosis governance owns law",
        ],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.explain",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future Epii pedagogy tests"],
        authority_path: Some("Body/S/S5/plugins/epi-logos (planned)"),
        adapter_path: None,
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.teach",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: None,
        body_path: "target Body/S/S5/plugins/epi-logos",
        test_evidence: &["future Epii pedagogy tests"],
        authority_path: Some("Body/S/S5/plugins/epi-logos (planned)"),
        adapter_path: None,
        extraction_task: Some("13.T7"),
        allowed_s0_responsibilities: &[],
    },
    CoordinateParityRecord {
        canonical_method: "s5'.seed.generate",
        owner: "S5'",
        status: CoordinateParityStatus::Missing,
        live_gateway_method: None,
        cli_mirror: Some("epi vault template"),
        body_path: "Body/S/S0/epi-cli/src/vault/templates.rs",
        test_evidence: &["idea_tree_templates.rs", "vault_paths_templates.rs"],
        authority_path: Some("Body/S/S5/plugins/epi-logos (planned)"),
        adapter_path: Some("Body/S/S0/epi-cli/src/vault/templates.rs"),
        extraction_task: Some("13.T8"),
        allowed_s0_responsibilities: &[
            "epi vault template CLI as transitional surface until S5 seed.generate lands",
        ],
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
        "browser.request"
        | "web.login.start"
        | "web.login.wait"
        | "logs.tail"
        | "update.run"
        | "wizard.start"
        | "wizard.next"
        | "wizard.cancel"
        | "wizard.status"
        | "s0.command.exec"
        | "s0.command.completion" => Some("s0.*"),
        "s2.graph.query"
        | "s2.graph.node"
        | "s2.graph.traverse"
        | "s2.graph.pointer_web.compute"
        | "s2.graph.pointer_web.refresh" => Some("s2.graph.*"),
        "s2.graph.kernel_resonance.record" => Some("s2.graph.*"),
        "s2'.coordinate.resolve"
        | "s2'.coordinate.cypher"
        | "s2'.coordinate.ingest"
        | "s2'.coordinate.analyse_resonance"
        | "s2'.coordinate.persist_analysis"
        | "s2'.coordinate.aggregate_resonance"
        | "s2'.constraint.list"
        | "s2'.constraint.register"
        | "s2'.constraint.test"
        | "s2'.retrieve"
        | "s2'.rerank"
        | "s2'.enrich" => Some("s2'.*"),
        "s3'.kernel.envelope.publish" => Some("s3'.*"),
        "s1'.vault.read_file"
        | "s1'.vault.write_file"
        | "s1'.vault.rename_file"
        | "s1'.vault.move_file"
        | "s1'.semantic.suggest_links" => Some("s1'.*"),
        "s5.trajectory.verify" | "s5.ebm.train" | "s5.ebm.export_state" => Some("s5'.improve.*"),
        "s5'.anuttara.diagnose" => Some("s5'.ql.*"),
        "channels.status"
        | "channels.send"
        | "channels.files.list"
        | "channels.logout"
        | "chat.history"
        | "chat.abort"
        | "chat.send"
        | "chat.inject"
        | "send"
        | "sessions.list"
        | "sessions.preview"
        | "sessions.resolve"
        | "sessions.run-state"
        | "sessions.patch"
        | "sessions.reset"
        | "sessions.delete"
        | "sessions.compact"
        | "sessions.fork"
        | "sessions.resume"
        | "sessions.import"
        | "sessions.tree"
        | "last-heartbeat"
        | "set-heartbeats"
        | "wake"
        | "talk.mode"
        | "tts.status"
        | "tts.enable"
        | "tts.disable"
        | "tts.convert"
        | "tts.setProvider"
        | "tts.providers"
        | "voicewake.get"
        | "voicewake.set" => Some("s3.*"),
        "config.get" | "config.schema" | "config.set" | "config.patch" | "config.apply"
        | "cron.list" | "cron.status" | "cron.add" | "cron.update" | "cron.remove" | "cron.run"
        | "cron.runs" | "models.list" | "status" | "health" | "status.summary"
        | "health.snapshot" | "presence.list" | "usage.status" | "usage.cost"
        | "system-presence" | "system-event" => Some("s3'.*"),
        "s3'.temporal.context"
        | "s3'.temporal.subscribe"
        | "s3'.spacetime.subscribe" => Some("s3'.temporal.*"),
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
        | "s4'.mediation.route"
        | "s4'.psyche.state"
        | "s4'.psyche.update"
        | "s4'.permission.get" => Some("s4'.*"),
        "s5'.review.inbox" | "s5'.review.submit" | "s5'.review.resolve" | "s5'.review.history" => {
            Some("s5'.review.*")
        }
        "s5.episodic.search"
        | "s5.episodic.deposit"
        | "s5.episodic.kernel_resonance.deposit"
        | "s5.episodic.kernel_profile_observation.deposit" => Some("s5.episodic.*"),
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
        "sessions.run-state",
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
