use serde::{Deserialize, Serialize};

use crate::{
    S2_GRAPH_ANANDA_POSITION_METHOD, S2_GRAPH_CORE65_AUDIT_METHOD,
    S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD, S2_GRAPH_ONTOLOGY_RELOAD_METHOD,
    S2_GRAPH_PROMOTION_COMMIT_METHOD, S2_GRAPH_PROMOTION_DRY_RUN_METHOD,
    S2_GRAPH_RELATION_FAMILY_LIST_METHOD, S2_GRAPH_SEED_SNAPSHOT_METHOD,
    S5_GNOSTIC_MUSICAL_TRANSCRIPT_METHOD,
};

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
        method: "s3'.being_pattern.observe",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal being-pattern producer",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.being_pattern.project",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal being-pattern producer",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.being_pattern.subscribe",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal being-pattern producer",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s3'.being_pattern.review_candidate",
        kind: MethodDispatchKind::S3NativeHandler,
        authority_path: "Body/S/S3/gateway::temporal being-pattern producer",
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
        method: S2_GRAPH_ANANDA_POSITION_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services + Body/S/S0/portal-core::m3_transcription_bridge",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.graph.harmonic_relations.materialize",
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
        method: S2_GRAPH_GDS_TANGENT_OVERLAY_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::GraphMethodService::gds_tangent_overlay",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_ONTOLOGY_RELOAD_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::ontology::import_epi_ontology_with_n10s",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_SEED_SNAPSHOT_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::seed::seed_baseline_snapshot_queries",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_CORE65_AUDIT_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::GraphMethodService::core_65_audit",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_PROMOTION_DRY_RUN_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::SyncCoordinator::validate_promotion_intent",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_PROMOTION_COMMIT_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services::SyncCoordinator::promote_intent",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S2_GRAPH_RELATION_FAMILY_LIST_METHOD,
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path: "Body/S/S2/graph-services + Body/S/S2/graph-schema::c_1_relation_family",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s2.parashaktiCorrespondences",
        kind: MethodDispatchKind::S2GraphServiceAdapter,
        authority_path:
            "Body/S/S0/epi-cli::gate::graph backed by Idea/Bimba/Map/datasets/parashakti-deep",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "m2.cymatic_invert",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/portal-core::parashakti::cymatic_invert",
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
    // 12.T12.10 — capability-parity live-assertion surface. The Pi runtime
    // (NOT the ACR) owns the capability gate; it queries this method at startup
    // and asserts the gateway-exposed mediation capability set is in parity with
    // its local capability-matrix view (close the IOD-17 follow-up on anima.rs).
    MethodDispatchPlanEntry {
        method: "s4'.mediation.capabilities.list",
        kind: MethodDispatchKind::S4OrchestrationAdapter,
        authority_path: "Body/S/S4/plugins/pleroma/capability-matrix.json",
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
        method: "s5'.gnostic.ingest",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnostic.query",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnostic.resolve",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: S5_GNOSTIC_MUSICAL_TRANSCRIPT_METHOD,
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic + Body/S/S0/portal-core::m3_transcription_bridge",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnostic.notebook",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnostic.status",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s5'.gnostic.models",
        kind: MethodDispatchKind::S5GovernanceAdapter,
        authority_path: "Body/S/S5/epi-gnostic",
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
        method: "s0'.anuttara.trace",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/portal-core::coordinate_phase trace",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s0'.verifier.check_state",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-lib::m0_verifier + Body/S/S3/gateway::verifier",
        needs_extraction_to: None,
    },
    MethodDispatchPlanEntry {
        method: "s0'.verifier.emit_question",
        kind: MethodDispatchKind::S0ProductAdapter,
        authority_path: "Body/S/S0/epi-lib::m0_verifier + Body/S/S3/gateway::verifier",
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
