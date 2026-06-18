use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::atomic::{AtomicU8, Ordering};

use epi_s3_gateway_contract::{
    method_dispatch_plan, method_dispatch_plan_entry, MethodDispatchKind, MethodDispatchPlanEntry,
    SessionPatch, METHOD_DISPATCH_PLAN, METHOD_NAMES,
};
use portal_core::VakAddress;

use crate::{transcripts, SessionStore};

// =============== 13.T2: S3-owned route ownership re-exports ===============
//
// Per Track 13 Tranche T2 (plan section 13.3 lines 73–91), S3 owns the
// **route law** for every method in the gateway contract. The plan
// articulates this with two complementary surfaces:
//
// 1. [`GatewayDispatchRoute`] / [`classify_method`] (already in this module)
//    — the in-process route metadata consumed by the S0 gateway host process
//    (server.rs) to determine ownership for an inbound RPC frame.
// 2. [`MethodDispatchKind`] / [`MethodDispatchPlanEntry`] (in the
//    `epi_s3_gateway_contract` crate) — the executable dispatch-plan
//    contract that names, for every entry in `METHOD_NAMES`, exactly which
//    substrate owns the law.
//
// These re-exports let downstream callers (S0 server.rs, the M3' kernel
// bridge, etc.) reach both surfaces through the S3 gateway crate without
// independently importing the contract crate — preserving the rule that S0
// MUST NOT maintain a parallel route table.
//
// The staged extraction boundary: **S0 currently hosts the process, S3 owns
// route law.** S0 is allowed to run the Tokio listener, the WebSocket
// upgrade, and the per-frame dispatch loop in `gate::server::dispatch_rpc`;
// it is NOT allowed to maintain a parallel route-ownership table.
pub use epi_s3_gateway_contract::{
    method_dispatch_plan as contract_method_dispatch_plan,
    method_dispatch_plan_entry as contract_method_dispatch_plan_entry,
    MethodDispatchKind as DispatchKind, MethodDispatchPlanEntry as DispatchPlanEntry,
};

/// Return the executable S3-owned dispatch-plan contract: for every method
/// in [`METHOD_NAMES`], the substrate that owns the law and the authority
/// path that executes it. This is the canonical surface that S0
/// `gate::server::dispatch_rpc` MUST consult — and the only surface allowed
/// to declare route ownership for product methods.
pub fn dispatch_plan() -> &'static [MethodDispatchPlanEntry] {
    method_dispatch_plan()
}

/// Look up the executable dispatch-plan entry for a method name. Returns
/// `None` for methods absent from [`METHOD_NAMES`]; downstream callers (S0
/// server.rs, observability tools, debug ops) MUST treat that as a contract
/// violation.
pub fn dispatch_plan_entry(method: &str) -> Option<&'static MethodDispatchPlanEntry> {
    method_dispatch_plan_entry(method)
}

/// Resolve only the dispatch *kind* for a method name. Convenience helper for
/// S0 dispatch logging and for hosts that need the substrate identity but
/// not the full plan entry.
pub fn dispatch_kind(method: &str) -> Option<MethodDispatchKind> {
    method_dispatch_plan_entry(method).map(|entry| entry.kind)
}

/// Sanity surface used by `tests/dispatch_contract.rs`: enumerate every
/// method that the legacy `classify_method` route table covers BUT the
/// executable dispatch-plan does NOT. The two surfaces are required to agree
/// 1:1 for product methods (the legacy table additionally accepts the
/// `nara.*` prefix extension which the contract list does not enumerate).
pub fn methods_in_route_table_missing_from_dispatch_plan() -> Vec<&'static str> {
    METHOD_NAMES
        .iter()
        .copied()
        .filter(|method| {
            classify_method(method).is_some() && method_dispatch_plan_entry(method).is_none()
        })
        .collect()
}

/// Inverse of [`methods_in_route_table_missing_from_dispatch_plan`]: methods
/// in the dispatch-plan that lack a [`GatewayDispatchRoute`]. Used by the
/// regression test to assert S0 cannot dispatch a method the gateway crate's
/// `classify_method` doesn't recognise.
pub fn methods_in_dispatch_plan_missing_from_route_table() -> Vec<&'static str> {
    METHOD_DISPATCH_PLAN
        .iter()
        .filter(|entry| classify_method(entry.method).is_none())
        .map(|entry| entry.method)
        .collect()
}

/// Request payload for `route_anima_invoke` — the multi-session endpoint that
/// lets a constitutional agent (Anima today, Epii via the same mechanism per
/// Concern 2) invoke another Anima session by `target_session_key`, patching
/// its VAK address and queueing a task on its transcript.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimaInvokeRequest {
    pub target_session_key: String,
    pub task: String,
    pub vak_address: VakAddress,
}

/// Response confirming the dispatch landed.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimaInvokeResponse {
    pub dispatched_to: String,
    pub task_queued: bool,
}

/// Tag used on the transcript role when an `anima_invoke` arrives, so that
/// receivers (and tests) can distinguish multi-session invocations from
/// ordinary user/agent messages.
pub const ANIMA_INVOKE_ROLE: &str = "anima_invoke";

/// M4' Nara lens RPCs consumed by the `m4.nara.lensApplication` widget.
/// S3 owns the route law via the existing `nara.*` extension route; these
/// names are declared here so gateway audits can assert the concrete lens
/// surface without expanding the product-method contract table.
pub const NARA_LENS_RPC_METHODS: [&str; 3] =
    ["nara.lens.list", "nara.lens.apply", "nara.lens.synthesize"];

/// M4 session lifecycle RPCs. Route ownership stays under the S4/S5 Nara
/// domain adapter; the profile bus receives protected handles only.
pub const NARA_SESSION_RPC_METHODS: [&str; 2] = ["nara.session_open", "nara.session_close"];

static NARA_SESSION_STOP_ROUND_ROBIN: AtomicU8 = AtomicU8::new(0);

fn default_nara_session_protein_capacity() -> u32 {
    256
}

fn default_nara_session_stop_codon_policy() -> String {
    "kairos-derived".to_owned()
}

fn default_nara_session_write_through_mode() -> String {
    "immediate".to_owned()
}

fn default_nara_session_protected_handle_strict() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionConfig {
    #[serde(default = "default_nara_session_protein_capacity")]
    pub protein_capacity: u32,
    #[serde(default = "default_nara_session_stop_codon_policy")]
    pub stop_codon_policy: String,
    #[serde(default = "default_nara_session_write_through_mode")]
    pub write_through_mode: String,
    #[serde(default = "default_nara_session_protected_handle_strict")]
    pub protected_handle_strict: bool,
    #[serde(default)]
    pub allow_raw_protein_bus: bool,
}

impl Default for NaraSessionConfig {
    fn default() -> Self {
        Self {
            protein_capacity: default_nara_session_protein_capacity(),
            stop_codon_policy: default_nara_session_stop_codon_policy(),
            write_through_mode: default_nara_session_write_through_mode(),
            protected_handle_strict: default_nara_session_protected_handle_strict(),
            allow_raw_protein_bus: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionOpenRequest {
    pub session_id: String,
    pub kairos: u64,
    #[serde(default)]
    pub config: NaraSessionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionCloseRequest {
    pub session_id: String,
    pub protein_handle: String,
    pub kairos_close: u64,
    #[serde(default)]
    pub config: NaraSessionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NaraSessionProteinHandle {
    pub ok: bool,
    pub session_id: String,
    pub protein_handle: String,
    pub start_codon: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_codon: Option<u8>,
    pub protected_handle: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pattern_packet: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub graphiti_relation: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<Value>,
}

pub fn route_nara_session_open(
    req: NaraSessionOpenRequest,
) -> Result<NaraSessionProteinHandle, String> {
    if req.session_id.trim().is_empty() {
        return Err("nara.session_open requires session_id".to_owned());
    }
    let start_codon = portal_core::transcription::c_start_codon();
    Ok(NaraSessionProteinHandle {
        ok: true,
        session_id: req.session_id.clone(),
        protein_handle: format!("m4-protein://session/{}/{}", req.session_id, req.kairos),
        start_codon,
        stop_codon: None,
        protected_handle: req.config.protected_handle_strict,
        pattern_packet: None,
        graphiti_relation: None,
        body: raw_body_if_allowed(&req.config, json!({"codons":[start_codon]})),
    })
}

pub fn route_nara_session_close(
    req: NaraSessionCloseRequest,
) -> Result<NaraSessionProteinHandle, String> {
    if req.session_id.trim().is_empty() {
        return Err("nara.session_close requires session_id".to_owned());
    }
    if req.protein_handle.trim().is_empty() {
        return Err("nara.session_close requires protein_handle".to_owned());
    }
    let start_codon = portal_core::transcription::c_start_codon();
    let stop_codon =
        select_nara_session_stop_codon(&req.config.stop_codon_policy, req.kairos_close)?;
    let protected = req.config.protected_handle_strict;
    let transcription = json!({
        "protein_handle": req.protein_handle,
        "start_codon": start_codon,
        "stop_codon": stop_codon,
        "protected_handle": protected,
        "capacity": req.config.protein_capacity,
    });
    let pattern_packet = json!({
        "type": "PatternPacket",
        "session_id": req.session_id,
        "mahamaya_transcription": transcription,
        "write_through_mode": req.config.write_through_mode,
    });
    let graphiti_relation = json!({
        "api": "nara_insert_relation",
        "kind": "episodic_packet",
        "session_id": req.session_id,
        "protein_handle": req.protein_handle,
        "stop_codon": stop_codon,
    });
    Ok(NaraSessionProteinHandle {
        ok: true,
        session_id: req.session_id,
        protein_handle: req.protein_handle,
        start_codon,
        stop_codon: Some(stop_codon),
        protected_handle: protected,
        pattern_packet: Some(pattern_packet),
        graphiti_relation: Some(graphiti_relation),
        body: raw_body_if_allowed(&req.config, json!({"codons":[start_codon, stop_codon]})),
    })
}

fn select_nara_session_stop_codon(policy: &str, kairos_close: u64) -> Result<u8, String> {
    let stops = portal_core::transcription::c_stop_codons();
    match policy {
        "kairos-derived" => Ok(stops[(kairos_close % 3) as usize]),
        "round-robin" => {
            let idx = NARA_SESSION_STOP_ROUND_ROBIN.fetch_add(1, Ordering::SeqCst) % 3;
            Ok(stops[idx as usize])
        }
        "fixed-taa" => Ok(stops[0]),
        "fixed-tag" => Ok(stops[1]),
        "fixed-tga" => Ok(stops[2]),
        other => Err(format!("unknown nara.session.stop_codon_policy `{other}`")),
    }
}

fn raw_body_if_allowed(config: &NaraSessionConfig, body: Value) -> Option<Value> {
    if !config.protected_handle_strict && config.allow_raw_protein_bus {
        Some(body)
    } else {
        None
    }
}

/// Patch the target session's VAK address and append the task into its
/// transcript as an `anima_invoke`-tagged message.
///
/// Returns `Err` if the target session cannot be resolved (e.g. unknown
/// `target_session_key`).
pub fn route_anima_invoke(
    store: &SessionStore,
    req: AnimaInvokeRequest,
) -> Result<AnimaInvokeResponse, String> {
    let patch = SessionPatch {
        vak_address: Some(req.vak_address.clone()),
        ..Default::default()
    };
    let record = store.patch(&req.target_session_key, patch)?;

    transcripts::append_message(
        store.gate_root(),
        &record.canonical_key,
        ANIMA_INVOKE_ROLE,
        &req.task,
        None,
    )?;

    Ok(AnimaInvokeResponse {
        dispatched_to: req.target_session_key,
        task_queued: true,
    })
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewayDispatchOwner {
    S2GraphService,
    S3Gateway,
    S3TemporalGateway,
    S3GraphitiRuntime,
    S4S5DomainAdapter,
    S4TaOntaAgent,
    S5EpiiAgent,
    S5Autoresearch,
    S0ProductAdapter,
    /// 03.T6.5: S1 vault gateway surface backed by Hen (canonical
    /// vault-write gatekeeper per IOD-19; canonical semantic-index reader
    /// per IOD-18).
    S1HenGateway,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewayDispatchClass {
    GraphService,
    Connection,
    SessionRuntime,
    ChatRuntime,
    AgentRuntime,
    TemporalContext,
    GraphitiInvocation,
    ReviewInbox,
    EpiiAgentRuntime,
    GnosticRuntime,
    AutoresearchRuntime,
    TaOntaAgentRuntime,
    NaraExtension,
    SystemSurface,
    ConfigurationSurface,
    AutomationSurface,
    DeviceSurface,
    NodeSurface,
    SkillSurface,
    VerifierSurface,
    ProductCompatibility,
    /// 03.T6.5: vault read/write through Hen; semantic suggest via
    /// Hen's smart_env reader.
    VaultGateway,
    SemanticSurface,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayDispatchRoute {
    pub method: &'static str,
    pub owner: GatewayDispatchOwner,
    pub class: GatewayDispatchClass,
    pub coordinate_owner: &'static str,
    pub agent_access_owner: &'static str,
    pub route_id: &'static str,
}

pub fn classify_method(method: &str) -> Option<GatewayDispatchRoute> {
    method_dispatch_plan_entry(method)
        .and_then(dispatch_route_for_plan_entry)
        .or_else(|| extension_route(method))
}

pub fn dispatch_route_for_plan_entry(
    entry: &MethodDispatchPlanEntry,
) -> Option<GatewayDispatchRoute> {
    route_metadata_for_plan_entry(entry).map(|metadata| GatewayDispatchRoute {
        method: entry.method,
        owner: metadata.owner,
        class: metadata.class,
        coordinate_owner: metadata.coordinate_owner,
        agent_access_owner: metadata.agent_access_owner,
        route_id: metadata.route_id,
    })
}

#[derive(Debug, Clone, Copy)]
struct RouteMetadata {
    owner: GatewayDispatchOwner,
    class: GatewayDispatchClass,
    coordinate_owner: &'static str,
    agent_access_owner: &'static str,
    route_id: &'static str,
}

fn route_metadata_for_plan_entry(entry: &MethodDispatchPlanEntry) -> Option<RouteMetadata> {
    match entry.kind {
        MethodDispatchKind::S3NativeHandler => s3_native_route_metadata(entry),
        MethodDispatchKind::S2GraphServiceAdapter => Some(RouteMetadata {
            owner: GatewayDispatchOwner::S2GraphService,
            class: GatewayDispatchClass::GraphService,
            coordinate_owner: "S2/S2'",
            agent_access_owner: "S4/S5",
            route_id: "s2.graph-service",
        }),
        MethodDispatchKind::S4OrchestrationAdapter => Some(RouteMetadata {
            owner: GatewayDispatchOwner::S4TaOntaAgent,
            class: GatewayDispatchClass::TaOntaAgentRuntime,
            coordinate_owner: "S4/S4'",
            agent_access_owner: "S4",
            route_id: "s4-prime.ta-onta-runtime",
        }),
        MethodDispatchKind::S5GovernanceAdapter => s5_governance_route_metadata(entry),
        MethodDispatchKind::S0ProductAdapter => s0_product_route_metadata(entry),
        MethodDispatchKind::S1HenAdapter => s1_hen_route_metadata(entry),
        MethodDispatchKind::Missing => None,
    }
}

fn s3_native_route_metadata(entry: &MethodDispatchPlanEntry) -> Option<RouteMetadata> {
    let authority = entry.authority_path;
    if authority.contains("::protocol") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3Gateway,
            class: GatewayDispatchClass::Connection,
            coordinate_owner: "S3",
            agent_access_owner: "S0/S4/S5",
            route_id: "s3.gateway.connect",
        })
    } else if authority.contains("::dispatch") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3Gateway,
            class: GatewayDispatchClass::AgentRuntime,
            coordinate_owner: "S3",
            agent_access_owner: "S4/S5",
            route_id: "s3.gateway.agent-runtime",
        })
    } else if authority.contains("temporal") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3TemporalGateway,
            class: GatewayDispatchClass::TemporalContext,
            coordinate_owner: "S3'",
            agent_access_owner: "S4/S5",
            route_id: "s3-prime.temporal-context",
        })
    } else if authority.contains("KERNEL_ENVELOPE_CONTRACT") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3TemporalGateway,
            class: GatewayDispatchClass::TemporalContext,
            coordinate_owner: "S3'",
            agent_access_owner: "S4/S5",
            route_id: "s3-prime.kernel-envelope",
        })
    } else if authority.contains("::runtime") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3Gateway,
            class: GatewayDispatchClass::SystemSurface,
            coordinate_owner: "S3",
            agent_access_owner: "S0/S4/S5",
            route_id: "s3.gateway.runtime-surface",
        })
    } else if authority.contains("::sessions")
        || authority.contains("channel runtime")
        || authority.contains("chat runtime")
        || authority.contains("session runtime")
    {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3Gateway,
            class: GatewayDispatchClass::SessionRuntime,
            coordinate_owner: "S3",
            agent_access_owner: "S4/S5",
            route_id: "s3.gateway.session-runtime",
        })
    } else {
        None
    }
}

fn s5_governance_route_metadata(entry: &MethodDispatchPlanEntry) -> Option<RouteMetadata> {
    let authority = entry.authority_path;
    if authority.contains("graphiti-runtime") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S3GraphitiRuntime,
            class: GatewayDispatchClass::GraphitiInvocation,
            coordinate_owner: "S3/S5",
            agent_access_owner: "S5",
            route_id: "s3.graphiti-runtime.s5-episodic",
        })
    } else if authority.contains("epii-review-core") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S5EpiiAgent,
            class: GatewayDispatchClass::ReviewInbox,
            coordinate_owner: "S5'",
            agent_access_owner: "S5",
            route_id: "s5-prime.epii-review-inbox",
        })
    } else if authority.contains("epii-agent-core") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S5EpiiAgent,
            class: GatewayDispatchClass::EpiiAgentRuntime,
            coordinate_owner: "S5'",
            agent_access_owner: "S5",
            route_id: "s5-prime.epii-agent-runtime",
        })
    } else if authority.contains("epi-gnostic") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S5EpiiAgent,
            class: GatewayDispatchClass::GnosticRuntime,
            coordinate_owner: "S5'",
            agent_access_owner: "S5",
            route_id: "s5-prime.gnostic-runtime",
        })
    } else if authority.contains("epii-autoresearch-core") {
        let route_id = if entry.method.starts_with("s5'.improve.") {
            "s5-prime.autoresearch-runtime"
        } else {
            "s5.autoresearch-kernel"
        };
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S5Autoresearch,
            class: GatewayDispatchClass::AutoresearchRuntime,
            coordinate_owner: if entry.method.starts_with("s5'.") {
                "S5'"
            } else {
                "S5/S5'"
            },
            agent_access_owner: "S5",
            route_id,
        })
    } else {
        None
    }
}

fn s1_hen_route_metadata(entry: &MethodDispatchPlanEntry) -> Option<RouteMetadata> {
    let is_semantic = entry.authority_path.contains("semantic");
    Some(RouteMetadata {
        owner: GatewayDispatchOwner::S1HenGateway,
        class: if is_semantic {
            GatewayDispatchClass::SemanticSurface
        } else {
            GatewayDispatchClass::VaultGateway
        },
        coordinate_owner: "S1'",
        agent_access_owner: "S4/S5",
        route_id: if is_semantic {
            "s1-prime.semantic-surface"
        } else {
            "s1-prime.vault-gateway"
        },
    })
}

fn s0_product_route_metadata(entry: &MethodDispatchPlanEntry) -> Option<RouteMetadata> {
    let authority = entry.authority_path;
    if authority.contains("config.rs") || authority.contains("portal/command.rs") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::ConfigurationSurface,
            coordinate_owner: "S0'",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0-prime.command-surface",
        })
    } else if authority.contains("verifier") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::VerifierSurface,
            coordinate_owner: "S0'",
            agent_access_owner: "S4/S5",
            route_id: "s0-prime.anuttara-verifier",
        })
    } else if authority.contains("cron.rs") || authority.contains("wizard.rs") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::AutomationSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S4/S5",
            route_id: "s0.product-automation",
        })
    } else if authority.contains("devices.rs")
        || authority.contains("browser.rs")
        || authority.contains("auth.rs")
    {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::DeviceSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-device-surface",
        })
    } else if authority.contains("nodes.rs") || authority.contains("approvals.rs") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::NodeSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-node-surface",
        })
    } else if authority.contains("skills.rs") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::SkillSurface,
            coordinate_owner: "S0/S5",
            agent_access_owner: "S4/S5",
            route_id: "s0.product-skill-surface",
        })
    } else if authority.contains("gate/")
        || authority.contains("src/gate ")
        || authority.contains("portal-core::parashakti::cymatic_invert")
    {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::SystemSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-system-surface",
        })
    } else {
        None
    }
}

fn extension_route(method: &str) -> Option<GatewayDispatchRoute> {
    if method.starts_with("nara.") {
        route(
            method,
            GatewayDispatchOwner::S4S5DomainAdapter,
            GatewayDispatchClass::NaraExtension,
            "M4'/S4",
            "S4/S5",
            "m4-prime.nara-extension",
        )
    } else if matches!(
        method,
        "s5'.epii.user.orientation" | "s5'.epii.pratibimba.status" | "s5'.epii.kairos.context"
    ) {
        route(
            method,
            GatewayDispatchOwner::S5EpiiAgent,
            GatewayDispatchClass::EpiiAgentRuntime,
            "S5'",
            "S5",
            "s5-prime.epii-agent-runtime",
        )
    } else {
        None
    }
}

fn route(
    method: &str,
    owner: GatewayDispatchOwner,
    class: GatewayDispatchClass,
    coordinate_owner: &'static str,
    agent_access_owner: &'static str,
    route_id: &'static str,
) -> Option<GatewayDispatchRoute> {
    let method = canonical_method_name(method)?;
    Some(GatewayDispatchRoute {
        method,
        owner,
        class,
        coordinate_owner,
        agent_access_owner,
        route_id,
    })
}

fn canonical_method_name(method: &str) -> Option<&'static str> {
    epi_s3_gateway_contract::method_names()
        .iter()
        .copied()
        .find(|candidate| *candidate == method)
        .or_else(|| match method {
            "s5'.epii.user.orientation" => Some("s5'.epii.user.orientation"),
            "s5'.epii.pratibimba.status" => Some("s5'.epii.pratibimba.status"),
            "s5'.epii.kairos.context" => Some("s5'.epii.kairos.context"),
            _ if method.starts_with("nara.") => Some("nara.*"),
            _ => None,
        })
}
