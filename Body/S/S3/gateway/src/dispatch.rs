use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::BTreeSet;
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

/// 12.T12.10 — the S4'-owned **capability-parity** surface. S3 owns the route
/// law (`S4OrchestrationAdapter` → ta-onta / `capability-matrix.json`); the
/// executable handler lives in the S0 gateway adapter (`gate/anima.rs`) and the
/// authoritative data is `Body/S/S4/plugins/pleroma/capability-matrix.json`.
///
/// The Pi runtime — NOT the ACR — owns the capability gate. At Pi startup it
/// calls `s4'.mediation.capabilities.list` and asserts the gateway-exposed
/// mediation capability set (dispatch tools + the aletheia-mode-internal family,
/// each tagged with its entitlement class) is in parity with its local
/// capability-matrix view. Any drift is a hard startup failure: that is how the
/// "no tool bypasses the entitlement contract" invariant (Tranche 12.32) stays
/// live across the gateway boundary. Declared here so gateway audits can assert
/// the concrete method name without reaching into the contract crate.
pub const S4_MEDIATION_CAPABILITIES_LIST_METHOD: &str = "s4'.mediation.capabilities.list";

/// The two entitlement classes the capabilities-list surface tags each
/// capability with. Mirror of the TS `STANDARD_ENTITLEMENT_CLASS` /
/// `ALETHEIA_MODE_INTERNAL_CLASS` in `Body/S/S4/ta-onta/shared/entitlement.ts`;
/// the Pi parity check compares against these exact strings.
pub const STANDARD_ENTITLEMENT_CLASS: &str = "standard";
pub const ALETHEIA_MODE_INTERNAL_CLASS: &str = "aletheia-mode-internal";

/// M4' Nara lens RPCs consumed by the `m4.nara.lensApplication` widget.
/// S3 owns the route law via the existing `nara.*` extension route; these
/// names are declared here so gateway audits can assert the concrete lens
/// surface without expanding the product-method contract table.
pub const NARA_LENS_RPC_METHODS: [&str; 3] =
    ["nara.lens.list", "nara.lens.apply", "nara.lens.synthesize"];

/// M4 session lifecycle RPCs. Route ownership stays under the S4/S5 Nara
/// domain adapter; the profile bus receives protected handles only.
pub const NARA_SESSION_CLOSE_READ_METHOD: &str = "nara.session_close.read";
pub const NARA_SESSION_RPC_METHODS: [&str; 3] = [
    "nara.session_open",
    "nara.session_close",
    NARA_SESSION_CLOSE_READ_METHOD,
];

/// M4 PASU identity-setup RPCs consumed by the `m4.nara.pasuWizard` widget
/// (Tranche 25.4, DR-WC-M4-3). Like the lens + session surfaces these resolve
/// through the existing `nara.*` extension route → `S4S5DomainAdapter`
/// (`extension_route`); declared here so gateway audits can assert the concrete
/// PASU write/read surface without expanding the product-method contract table.
/// `nara.pasu.set` is the canonical write path (the wizard MUST NOT shell out to
/// `epi vault pasu set`); `nara.pasu.show` returns a handle-only PASU record —
/// the natal-chart raw body stays local, only its path string is surfaced.
pub const NARA_PASU_RPC_METHODS: [&str; 2] = ["nara.pasu.set", "nara.pasu.show"];

/// Headless close-of-session contemplation RPC. It remains a Nara extension
/// route, so the gateway can expose the surface without expanding the product
/// method table before the upstream S0/S4/S5 executors land their live adapters.
pub const CONTEMPLATE_SESSION_CLOSE_METHOD: &str = "nara.contemplate_session_close";

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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PiContemplationInstance {
    pub id: String,
    #[serde(default)]
    pub deterministic_mock: bool,
    #[serde(default)]
    pub loaded_agents: Vec<String>,
    pub recognition_state: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EngagedCoordinateResonance {
    pub coordinate: String,
    pub target_resonance_vector: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ContemplationTick {
    pub tick_id: String,
    pub gauge: String,
    pub actual_resonance: Vec<f64>,
    #[serde(default)]
    pub codon: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PsycheAnchor {
    #[serde(default)]
    pub cards: Vec<String>,
    #[serde(default)]
    pub codons: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct M0VerifierReport {
    pub virtue_witness_vector: Vec<bool>,
    #[serde(default)]
    pub unsatisfied_constraints: Vec<String>,
    pub coherence_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ContemplationObject {
    pub session_id: String,
    pub q_nara: String,
    pub pi_instance: PiContemplationInstance,
    #[serde(default)]
    pub engaged_coordinates: Vec<EngagedCoordinateResonance>,
    pub trajectory: Vec<ContemplationTick>,
    #[serde(default)]
    pub psyche_anchor: PsycheAnchor,
    pub verifier_report: M0VerifierReport,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TritoneSquareCoherence {
    pub square_0_5: f64,
    pub square_1_4: f64,
    pub square_2_3: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EbmContemplationReading {
    pub position: String,
    pub per_tick_energy: Vec<f64>,
    pub gradient: Vec<f64>,
    pub gradient_magnitude: f64,
    pub gauge_trio_coherent: bool,
    pub coherence_scores: TritoneSquareCoherence,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct LlmContemplationReading {
    pub position: String,
    pub pi_instance_id: String,
    pub loaded_agents: Vec<String>,
    pub recognition_state: String,
    pub psyche_anchor_coherent: bool,
    pub matched_anchor_codons: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct VerifierContemplationReading {
    pub position: String,
    pub virtue_witness_vector: Vec<bool>,
    pub unsatisfied_constraints: Vec<String>,
    pub coherence_score: f64,
    pub arch9_wholeness: bool,
    pub syntax_layers_witnessed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ContemplationTripletOutput {
    pub llm: LlmContemplationReading,
    pub ebm: EbmContemplationReading,
    pub verifier: VerifierContemplationReading,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ParsedAnuttaraSymbolicQuestion {
    pub coordinate: String,
    pub tranche: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SymbolicRoundTrip {
    pub raw: String,
    pub parsed: ParsedAnuttaraSymbolicQuestion,
    pub parser_skill: String,
    pub llm_response: String,
    pub anima_reverification_route: String,
    pub routed_back_through_anima: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ContemplateSessionCloseResponse {
    pub method: String,
    pub session_id: String,
    pub wisdom_delta: String,
    pub triplet: ContemplationTripletOutput,
    pub symbolic_round_trips: Vec<SymbolicRoundTrip>,
}

pub fn contemplate_session_close(
    object: ContemplationObject,
) -> Result<ContemplateSessionCloseResponse, String> {
    if object.session_id.trim().is_empty() {
        return Err("contemplate_session_close requires session_id".to_owned());
    }
    if object.trajectory.is_empty() {
        return Err("contemplate_session_close requires a non-empty trajectory".to_owned());
    }
    if object.engaged_coordinates.is_empty() {
        return Err("contemplate_session_close requires engaged coordinate targets".to_owned());
    }

    let ebm = evaluate_ebm_position(&object)?;
    let llm = evaluate_llm_position(&object);
    let verifier = evaluate_verifier_position(&object.verifier_report);
    let symbolic_round_trips = route_verifier_questions_back_through_anima(
        &object.verifier_report.unsatisfied_constraints,
    );

    let wisdom_delta = compose_wisdom_delta(&object, &llm, &ebm, &verifier, &symbolic_round_trips);

    Ok(ContemplateSessionCloseResponse {
        method: CONTEMPLATE_SESSION_CLOSE_METHOD.to_owned(),
        session_id: object.session_id,
        wisdom_delta,
        triplet: ContemplationTripletOutput { llm, ebm, verifier },
        symbolic_round_trips,
    })
}

fn evaluate_ebm_position(object: &ContemplationObject) -> Result<EbmContemplationReading, String> {
    let mut per_tick_energy = Vec::with_capacity(object.trajectory.len());
    for tick in &object.trajectory {
        let target = target_for_tick(tick, &object.engaged_coordinates)
            .ok_or_else(|| format!("no target resonance vector for tick `{}`", tick.tick_id))?;
        per_tick_energy.push(squared_distance(target, &tick.actual_resonance));
    }

    let gradient: Vec<f64> = per_tick_energy
        .windows(2)
        .map(|pair| pair[1] - pair[0])
        .collect();
    let gradient_magnitude = if gradient.is_empty() {
        0.0
    } else {
        gradient.iter().map(|value| value.abs()).sum::<f64>() / gradient.len() as f64
    };
    let gauge_trio_coherent = gauge_trio_covered(&object.trajectory);
    let average_energy = per_tick_energy.iter().sum::<f64>() / per_tick_energy.len().max(1) as f64;
    let base_score = (1.0 / (1.0 + average_energy)).clamp(0.0, 1.0);
    let coverage_factor = if gauge_trio_coherent { 1.0 } else { 0.5 };

    Ok(EbmContemplationReading {
        position: "5'".to_owned(),
        per_tick_energy,
        gradient,
        gradient_magnitude,
        gauge_trio_coherent,
        coherence_scores: TritoneSquareCoherence {
            square_0_5: rounded_score(base_score * coverage_factor),
            square_1_4: rounded_score(base_score * coverage_factor * 0.97),
            square_2_3: rounded_score(base_score * coverage_factor * 0.94),
        },
    })
}

fn evaluate_llm_position(object: &ContemplationObject) -> LlmContemplationReading {
    let trajectory_codons: BTreeSet<&str> = object
        .trajectory
        .iter()
        .filter_map(|tick| tick.codon.as_deref())
        .collect();
    let matched_anchor_codons: Vec<String> = object
        .psyche_anchor
        .codons
        .iter()
        .filter(|codon| trajectory_codons.contains(codon.as_str()))
        .cloned()
        .collect();
    let psyche_anchor_coherent = !object.psyche_anchor.codons.is_empty()
        && matched_anchor_codons.len() == object.psyche_anchor.codons.len();

    LlmContemplationReading {
        position: "4'".to_owned(),
        pi_instance_id: object.pi_instance.id.clone(),
        loaded_agents: object.pi_instance.loaded_agents.clone(),
        recognition_state: object.pi_instance.recognition_state.clone(),
        psyche_anchor_coherent,
        matched_anchor_codons,
    }
}

fn evaluate_verifier_position(report: &M0VerifierReport) -> VerifierContemplationReading {
    VerifierContemplationReading {
        position: "0'".to_owned(),
        virtue_witness_vector: report.virtue_witness_vector.clone(),
        unsatisfied_constraints: report.unsatisfied_constraints.clone(),
        coherence_score: report.coherence_score,
        arch9_wholeness: report
            .virtue_witness_vector
            .get(8)
            .copied()
            .unwrap_or(false),
        syntax_layers_witnessed: [2usize, 4, 6, 8].iter().all(|idx| {
            report
                .virtue_witness_vector
                .get(*idx)
                .copied()
                .unwrap_or(false)
        }),
    }
}

fn target_for_tick<'a>(
    tick: &ContemplationTick,
    targets: &'a [EngagedCoordinateResonance],
) -> Option<&'a [f64]> {
    targets
        .iter()
        .find(|target| {
            target
                .coordinate
                .rsplit(['.', '/', '-'])
                .next()
                .is_some_and(|suffix| suffix.eq_ignore_ascii_case(&tick.gauge))
        })
        .or_else(|| targets.first())
        .map(|target| target.target_resonance_vector.as_slice())
}

fn squared_distance(target: &[f64], actual: &[f64]) -> f64 {
    let shared = target
        .iter()
        .zip(actual.iter())
        .map(|(target, actual)| {
            let delta = target - actual;
            delta * delta
        })
        .sum::<f64>();
    let target_tail = target
        .iter()
        .skip(actual.len())
        .map(|value| value * value)
        .sum::<f64>();
    let actual_tail = actual
        .iter()
        .skip(target.len())
        .map(|value| value * value)
        .sum::<f64>();
    shared + target_tail + actual_tail
}

fn gauge_trio_covered(trajectory: &[ContemplationTick]) -> bool {
    let gauges: BTreeSet<String> = trajectory
        .iter()
        .map(|tick| tick.gauge.to_ascii_uppercase())
        .collect();
    ["COMP", "MOVE", "RES"]
        .iter()
        .all(|required| gauges.contains(*required))
}

fn route_verifier_questions_back_through_anima(raw_questions: &[String]) -> Vec<SymbolicRoundTrip> {
    raw_questions
        .iter()
        .filter_map(|raw| {
            parse_anuttara_symbolic_question(raw).map(|parsed| SymbolicRoundTrip {
                raw: raw.clone(),
                parser_skill: "anuttara-symbolic-parse".to_owned(),
                llm_response: format!(
                    "anuttara-symbolic-parse resolved {}; Anima re-verifies the pending witness.",
                    parsed.coordinate
                ),
                anima_reverification_route: "anima.reverify".to_owned(),
                parsed,
                routed_back_through_anima: true,
            })
        })
        .collect()
}

fn parse_anuttara_symbolic_question(raw: &str) -> Option<ParsedAnuttaraSymbolicQuestion> {
    let trimmed = raw.trim().trim_start_matches('#').trim_end_matches('?');
    let mut parts: Vec<&str> = trimmed.split('-').collect();
    if parts.len() < 3 {
        return None;
    }
    let status = parts.pop()?.to_owned();
    let tranche = parts.pop()?.to_owned();
    let coordinate = parts.join("-");
    if coordinate.is_empty() || tranche.is_empty() || status.is_empty() {
        return None;
    }
    Some(ParsedAnuttaraSymbolicQuestion {
        coordinate,
        tranche,
        status,
    })
}

fn compose_wisdom_delta(
    object: &ContemplationObject,
    llm: &LlmContemplationReading,
    ebm: &EbmContemplationReading,
    verifier: &VerifierContemplationReading,
    round_trips: &[SymbolicRoundTrip],
) -> String {
    format!(
        "4'-5'-0' contemplation closed for {}: {}. gauge-trio={}, arch-9={}, Mobius-return-gradient={:.6}, psyche-anchor={}, syntax-layers={}, verifier-round-trips={}.",
        object.q_nara,
        llm.recognition_state,
        ebm.gauge_trio_coherent,
        verifier.arch9_wholeness,
        ebm.gradient_magnitude,
        llm.psyche_anchor_coherent,
        verifier.syntax_layers_witnessed,
        round_trips.len()
    )
}

fn rounded_score(value: f64) -> f64 {
    (value * 1_000_000.0).round() / 1_000_000.0
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
    let handle_session = req
        .protein_handle
        .strip_prefix("m4-protein://session/")
        .and_then(|value| value.rsplit_once('/'))
        .filter(|(_, opened_at)| opened_at.parse::<u64>().is_ok())
        .map(|(session_id, _)| session_id)
        .ok_or_else(|| {
            "nara.session_close requires a canonical session protein_handle".to_owned()
        })?;
    if handle_session != req.session_id {
        return Err("nara.session_close protein_handle does not belong to session_id".to_owned());
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
    if authority.contains("Body/S/S0/settings") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::ConfigurationSurface,
            coordinate_owner: "S0'",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0-prime.settings-surface",
        })
    } else if authority.contains("config.rs") || authority.contains("portal/command.rs") {
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
    } else if authority.contains("portal-core::coordinate_phase") {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::ProductCompatibility,
            coordinate_owner: "S0'",
            agent_access_owner: "S4/S5",
            route_id: "s0-prime.anuttara-trace",
        })
    } else if authority.contains("::gate::kernel_bridge_runtime")
        || authority.contains("::gate::server::live_portal_clock_state")
    {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::SystemSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-kernel-bridge",
        })
    } else if authority.contains("gate/")
        || authority.contains("src/gate ")
        || authority.contains("portal-core::parashakti::cymatic_invert")
        || authority.contains("portal-core::lens_codon_binary_projection")
    {
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::SystemSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-system-surface",
        })
    } else if authority.contains("portal-core::spanda_anchor") {
        // 02.T2.13 / DR-M1-5 — the m1.spanda.* walk family: engine-walk
        // transport on the kernel-owned phase anchor (M1-3' pulse stratum).
        Some(RouteMetadata {
            owner: GatewayDispatchOwner::S0ProductAdapter,
            class: GatewayDispatchClass::SystemSurface,
            coordinate_owner: "S0",
            agent_access_owner: "S0/S4/S5",
            route_id: "s0.product-spanda-transport",
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

// =============== 05.T5.10: connectivity_check ≠ bounded_access ===============
//
// The S5 world-boundary plumbs the gateway into four external substrates —
// Graphiti (the episodic-memory HTTP runtime), Neo4j (the S2 graph store),
// Redis (the S3' context cache), and SpaceTimeDB (the S3' presence
// projection). A connectivity_check against any of them proves ONLY that the
// wire is up. It is never a grant of bounded access to the personal `nara.*`
// domains:
//
//   * jiva   — the durable self / identity surface (`nara.identity.*`)
//   * jagrat — the waking present-state / oracle surface (`nara.oracle.*`,
//              `nara.kairos.*`)
//   * flow   — the journal / lived-process surface (`nara.journal.*`,
//              `nara.flow.*`)
//
// The law, pinned by [`nara_bounded_access`] and enforced against the real
// route table ([`classify_method`]):
//
//   "can ping an external substrate"  ≠  "may read jiva / jagrat / flow"
//
// Connectivity is owned by the substrate-facing dispatch classes
// (GraphService / GraphitiInvocation / TemporalContext — see
// [`is_substrate_connectivity_class`]). nara.* personal access is owned by
// the S4/S5 agent authority (`agent_access_owner == "S4/S5"`,
// `coordinate_owner == "M4'/S4"`) and requires an explicit
// [`BoundedAccessGrant`]. The [`ConnectivityReport`] parameter of the gate is
// deliberately powerless: it exists in the signature precisely so the
// contract test (`tests/dispatch_contract.rs`,
// `t5_10_connectivity_vs_bounded_access`) can prove the decision is invariant
// to it in both directions.

/// The four external substrates the gateway plumbs into. Each is a
/// *connectivity* concern only — reaching one proves the wire is up, never
/// that the caller may read personal data.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExternalSubstrate {
    Graphiti,
    Neo4j,
    Redis,
    SpacetimeDb,
}

impl ExternalSubstrate {
    /// Canonical probe order for a full connectivity_check sweep.
    pub const ALL: [ExternalSubstrate; 4] = [
        ExternalSubstrate::Graphiti,
        ExternalSubstrate::Neo4j,
        ExternalSubstrate::Redis,
        ExternalSubstrate::SpacetimeDb,
    ];

    pub fn label(self) -> &'static str {
        match self {
            ExternalSubstrate::Graphiti => "Graphiti",
            ExternalSubstrate::Neo4j => "Neo4j",
            ExternalSubstrate::Redis => "Redis",
            ExternalSubstrate::SpacetimeDb => "SpaceTimeDB",
        }
    }
}

/// Outcome of one connectivity_check ping. `Unreachable` is the graceful
/// degradation outcome (offline / CI / DNS failure) — explicitly NOT an
/// error, and explicitly NOT an authorization signal either way.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SubstrateReachability {
    Reachable,
    Unreachable,
}

/// One connectivity_check result: a substrate and whether its wire was up.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ConnectivityCheck {
    pub substrate: ExternalSubstrate,
    pub reachability: SubstrateReachability,
}

/// A connectivity snapshot across all four substrates. This is *pure
/// connectivity* — it deliberately carries no notion of who may read what.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ConnectivityReport {
    checks: [ConnectivityCheck; 4],
}

impl ConnectivityReport {
    /// Build a report by running one connectivity_check per substrate, in
    /// [`ExternalSubstrate::ALL`] order. The caller supplies the live probe;
    /// this crate supplies the law that its result grants nothing.
    pub fn from_reachability(reach: impl Fn(ExternalSubstrate) -> SubstrateReachability) -> Self {
        Self {
            checks: ExternalSubstrate::ALL.map(|substrate| ConnectivityCheck {
                substrate,
                reachability: reach(substrate),
            }),
        }
    }

    /// Fabricated "everything is up" report — the strongest connectivity
    /// input the gate can ever receive, and still worth nothing to it.
    pub fn all_reachable() -> Self {
        Self::from_reachability(|_| SubstrateReachability::Reachable)
    }

    /// Fabricated fully-offline report.
    pub fn all_unreachable() -> Self {
        Self::from_reachability(|_| SubstrateReachability::Unreachable)
    }

    /// The four connectivity_check results, in [`ExternalSubstrate::ALL`]
    /// order.
    pub fn connectivity_checks(&self) -> &[ConnectivityCheck; 4] {
        &self.checks
    }

    pub fn any_reachable(&self) -> bool {
        self.checks
            .iter()
            .any(|check| check.reachability == SubstrateReachability::Reachable)
    }
}

/// The personal nara domains a bounded-access grant can cover — the "what may
/// be read" axis, orthogonal to "what wire is up".
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NaraPersonalDomain {
    /// Durable self / identity surface (`nara.identity.*`).
    Jiva,
    /// Waking present-state / oracle surface (`nara.oracle.*`, `nara.kairos.*`).
    Jagrat,
    /// Journal / lived-process surface (`nara.journal.*`, `nara.flow.*`).
    Flow,
}

/// Map a method name onto the personal nara domain it reads, if any. Only
/// `nara.*` methods can map. Non-personal nara surfaces (lens, session
/// lifecycle, PASU wizard, contemplation close) return `None` and therefore
/// fail CLOSED at the gate until explicit domain law names them.
pub fn nara_personal_domain(method: &str) -> Option<NaraPersonalDomain> {
    let surface = method.strip_prefix("nara.")?;
    if surface.starts_with("identity.") {
        Some(NaraPersonalDomain::Jiva)
    } else if surface.starts_with("oracle.") || surface.starts_with("kairos.") {
        Some(NaraPersonalDomain::Jagrat)
    } else if surface.starts_with("journal.") || surface.starts_with("flow.") {
        Some(NaraPersonalDomain::Flow)
    } else {
        None
    }
}

/// An explicit bounded-access grant: the SEPARATE authorization that personal
/// `nara.*` reads require. It is issued by the agent-access authority (S4/S5),
/// never minted by a connectivity event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BoundedAccessGrant {
    domains: Vec<NaraPersonalDomain>,
}

impl BoundedAccessGrant {
    pub fn covering(domains: &[NaraPersonalDomain]) -> Self {
        Self {
            domains: domains.to_vec(),
        }
    }

    pub fn covers(&self, domain: NaraPersonalDomain) -> bool {
        self.domains.contains(&domain)
    }
}

/// The decision returned by the bounded-access gate, with a reason that keeps
/// the connectivity/authorization distinction explicit in audit output.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BoundedAccessDecision {
    Granted,
    Denied { reason: &'static str },
}

/// Denial: the method is not classified by the S3 route table at all.
pub const BOUNDED_ACCESS_DENIED_UNROUTED: &str =
    "method is not classified by the S3 route table: nothing to grant";
/// Denial: the method is not a nara personal surface — substrate/connectivity
/// and other non-nara routes carry no personal grant to exercise.
pub const BOUNDED_ACCESS_DENIED_SUBSTRATE_SURFACE: &str =
    "method is not a nara personal surface: substrate connectivity carries no personal grant";
/// Denial: a nara method with no mapped personal domain — fail closed pending
/// explicit domain law.
pub const BOUNDED_ACCESS_DENIED_NO_DOMAIN_LAW: &str =
    "nara method has no mapped personal domain: bounded access fails closed";
/// Denial: no grant present. Connectivity — however green — is not
/// authorization.
pub const BOUNDED_ACCESS_DENIED_NO_GRANT: &str =
    "connectivity is not authorization: no bounded-access grant present";
/// Denial: a grant is present but scoped to other domains.
pub const BOUNDED_ACCESS_DENIED_GRANT_SCOPE: &str =
    "bounded-access grant does not cover the requested nara domain";

/// The dispatch classes that are pure *connectivity* surfaces to the external
/// substrates: Neo4j via `GraphService`, Graphiti via `GraphitiInvocation`,
/// Redis + SpaceTimeDB via the S3' `TemporalContext`. None of these is the
/// nara personal-access authority.
pub fn is_substrate_connectivity_class(class: GatewayDispatchClass) -> bool {
    matches!(
        class,
        GatewayDispatchClass::GraphService
            | GatewayDispatchClass::GraphitiInvocation
            | GatewayDispatchClass::TemporalContext
    )
}

/// THE GATE. Decide whether a `nara.*` read of a personal domain is
/// authorized.
///
/// Contract, enforced here and pinned by `tests/dispatch_contract.rs`:
///   1. Connectivity is NOT an input that can grant access. The
///      `_connectivity` parameter is accepted — callers must hand the gate
///      their live report — and is deliberately never read: no reachability
///      outcome may flip a decision in either direction.
///   2. The method must resolve through the REAL route table
///      ([`classify_method`]) to the `NaraExtension` class; substrate and
///      other non-nara routes are refused outright.
///   3. The method must map onto an explicit personal domain
///      ([`nara_personal_domain`]); unmapped nara surfaces fail closed.
///   4. A [`BoundedAccessGrant`] must be present AND cover the requested
///      domain. A `None` grant is denied no matter how many substrates are
///      reachable; a valid grant authorizes even when everything is offline
///      (the subsequent *fetch* may fail, but the access *right* stands).
pub fn nara_bounded_access(
    method: &str,
    _connectivity: &ConnectivityReport,
    grant: Option<&BoundedAccessGrant>,
) -> BoundedAccessDecision {
    let Some(route) = classify_method(method) else {
        return BoundedAccessDecision::Denied {
            reason: BOUNDED_ACCESS_DENIED_UNROUTED,
        };
    };
    if route.class != GatewayDispatchClass::NaraExtension {
        return BoundedAccessDecision::Denied {
            reason: BOUNDED_ACCESS_DENIED_SUBSTRATE_SURFACE,
        };
    }
    let Some(domain) = nara_personal_domain(method) else {
        return BoundedAccessDecision::Denied {
            reason: BOUNDED_ACCESS_DENIED_NO_DOMAIN_LAW,
        };
    };
    match grant {
        None => BoundedAccessDecision::Denied {
            reason: BOUNDED_ACCESS_DENIED_NO_GRANT,
        },
        Some(grant) if grant.covers(domain) => BoundedAccessDecision::Granted,
        Some(_) => BoundedAccessDecision::Denied {
            reason: BOUNDED_ACCESS_DENIED_GRANT_SCOPE,
        },
    }
}
