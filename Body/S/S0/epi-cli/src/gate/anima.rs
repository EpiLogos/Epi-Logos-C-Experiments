//! S0 gateway adapter to the S4/S4' Anima orchestration authority.
//!
//! ## Adapter contract (Track-13.T6 closure)
//!
//! This module is a *thin adapter* into the S4/S4' orchestration authority.
//! All mediation-route law, VAK evaluation, capability-matrix enforcement,
//! and dispatch-tool gating below is a mirror of S4-owned canon. The
//! authoritative sources are:
//!
//! - `Body/S/S4/plugins/pleroma/capability-matrix.json` — `dispatch_tools[*]`,
//!   `constitutional_agents`, `forbidden_authority`, `agent_capability_gates`,
//!   `agent_run_contract.vak_required_keys`.
//! - `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` —
//!   `AGENT_CF` (CF→agent), `MOIRAI_HOST_CF`, `validateFusionDispatch`,
//!   `validateParallelDispatch`, `dispatchGuardrails`.
//! - `Body/S/S4/plugins/pleroma/skills/vak-evaluate/SKILL.md` and
//!   `Body/S/S4/plugins/pleroma/skills/anima-orchestration/SKILL.md` — skill
//!   contracts the adapter advertises.
//! - `Body/S/S4/pi-agent/agents/anima.md` — Anima identity, CF, allowed tools.
//!
//! Constants tagged `S4_AUTHORITY` below MUST stay in sync with those
//! sources. Any drift is a Track-13 follow-up tranche to extract into S4
//! and consume by FFI.
//!
//! 12.T12.10 closes the IOD-17 follow-up for the capability set itself: this
//! adapter now serves `s4'.mediation.capabilities.list`, reading the dispatch
//! + aletheia-mode-internal capability set verbatim from the S4
//! `capability-matrix.json` (no second copy). The Pi runtime — owner of the
//! capability gate — calls it at startup to assert parity. (The `route_outcome`
//! routing-derivation note below remains a distinct, still-open follow-up.)
//!
//! ## Persistence classification
//!
//! Two JSONL files are appended under the gate state root:
//!
//! - `s4/agent-events.jsonl` — **S3 session telemetry**: gateway-side
//!   accepted/delivered receipts for `s4.agent.query` / `s4.agent.notify`.
//!   Not authoritative mediation evidence; lives next to the session store.
//! - `s4/mediation-routes.jsonl` — **S4 orchestration evidence**: the
//!   adapter's record of every `s4'.mediation.route` decision dispatched
//!   through this gateway. Tagged with `s4_authority_origin` so it is
//!   never confused with an S4-internal second store.
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use serde_json::{json, Map, Value};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::agent::{vak, AgentLayout};
use crate::gate::sessions::{SessionPatch, SessionStore};

const PLEROMA_ROOT: &str = "Body/S/S4/plugins/pleroma";
const VAK_EVALUATE_SKILL: &str = "vak-evaluate";
const ANIMA_ORCHESTRATION_SKILL: &str = "anima-orchestration";
const MEDIATION_ROUTE_METHOD: &str = "s4'.mediation.route";
const CAPABILITIES_LIST_METHOD: &str = "s4'.mediation.capabilities.list";

/// S4_AUTHORITY: entitlement-class identifiers tagged onto every capability in
/// the `s4'.mediation.capabilities.list` response. Mirror of
/// `STANDARD_ENTITLEMENT_CLASS` / `ALETHEIA_MODE_INTERNAL_CLASS` in
/// `Body/S/S4/ta-onta/shared/entitlement.ts`; the Pi capability-parity check
/// compares against these exact strings.
const STANDARD_ENTITLEMENT_CLASS: &str = "standard";
const ALETHEIA_MODE_INTERNAL_CLASS: &str = "aletheia-mode-internal";

/// File name of the S4 capability matrix under [`PLEROMA_ROOT`].
const CAPABILITY_MATRIX_FILE: &str = "capability-matrix.json";

/// S4_AUTHORITY: mirror of `MOIRAI_HOST_CF` in
/// `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts` (klotho →
/// (0/1/2), lachesis → (4.0/1-4.4/5), atropos → (5/0)). The literal CF
/// values are duplicated here because dispatch_moirai_night_pass routing
/// must be enforceable at the S0 gateway edge before the S4 plugin
/// receives the call. Drift = Track-13 follow-up.
const MOIRAI_HOST_CF: &[&str] = &["(0/1/2)", "(4.0/1-4.4/5)", "(5/0)"];

/// S4_AUTHORITY: mirror of `capability-matrix.json:dispatch_tools[*].name`.
/// Membership defines which tool names carry the `upstream_required:
/// ["vak-evaluate"]` gate at the gateway edge. Drift = Track-13 follow-up.
const DISPATCH_TOOLS: &[&str] = &[
    "dispatch_agent",
    "dispatch_parallel_agents",
    "dispatch_fusion_agents",
    "dispatch_moirai_night_pass",
    "anima_self_invoke",
    "run_chain",
];

/// S0_GATEWAY: locally enforced CFP set. Subset of the canonical VAK
/// grammar declared by `capability-matrix.json:agent_run_contract.vak_required_keys`
/// expanded with CFP0..CFP4 thread modes. Pure gateway pre-validation —
/// S4 plugin re-validates on receipt.
const SUPPORTED_CFP: &[&str] = &["CFP0", "CFP1", "CFP2", "CFP3", "CFP4"];

/// S0_GATEWAY: thread modes the gateway accepts in envelope
/// `requestedThreadMode` until runtime verification expands the set.
const SUPPORTED_THREAD_MODES: &[&str] = &["single", "session"];

/// S0_GATEWAY: declared-write-scope prefixes the gateway will route. S4'
/// capacity governance (`m5_4_governance.capacity_governance`) holds the
/// final authority over what writes are permitted; this list is only the
/// gateway pre-filter.
const SUPPORTED_WRITE_SCOPES: &[&str] = &[
    "Body/M/epi-theia/",
    "Body/S/S4/",
    "Body/S/S5/",
    "Idea/Pratibimba/System/",
];

/// Stable provenance tag stamped onto every payload this adapter returns so
/// callers (and the parity manifest) can verify S0 is acting as an S4
/// adapter, not as a second authority store.
const S4_AUTHORITY_ORIGIN: &str = "Body/S/S4 (capability-matrix.json + ta-onta/S4-4p-anima)";

pub fn vak_evaluate(params: &Value) -> Result<Value, String> {
    let task = required_str(params, "task")?;
    let coordinates = vak::evaluate_vak(task);
    let agent = vak::cf_to_agent(coordinates.cf.as_deref().unwrap_or(""));

    // Read the audible half BEFORE touching the filesystem: a malformed
    // coordinate should be named as a malformed coordinate, not masked by a
    // skill-path error from an unrelated lookup.
    let audible = audible_reading(params, coordinates.cf.as_deref().unwrap_or(""))?;
    let skill_path = pleroma_skill_path(VAK_EVALUATE_SKILL)?;

    let mut response = json!({
        "owner": "S4'",
        "agent": agent,
        "coordinates": coordinates,
        "capability": capability(VAK_EVALUATE_SKILL, &skill_path),
        "authority": authority(),
    });
    if let (Some(object), Some(fields)) = (response.as_object_mut(), audible.as_object()) {
        for (key, value) in fields {
            object.insert(key.clone(), value.clone());
        }
    }
    Ok(response)
}

// ── DR-VAK-6 / 50.T50.13: the audible reading on `s4'.vak.evaluate` ───────
//
// The kernel has read the diatonic degree of a CF since DR-VAK-3, but only on
// the profile bus — at the dispatch layer a VAK evaluation was an opaque
// coordinate string. DR-VAK-6's action line is "plumb the diatonic computation
// through `s4'.vak.evaluate`", which is what this does, plus the run-level
// reading 50.T50.13 adds: a run is a SEQUENCE of CF-addressed steps, and read
// in order that sequence is a line in one mode-tonic frame.
//
// Division of labour is deliberate: the DEGREE depends only on which CF sits at
// tonic (rotation), so it is always computable and always present. The PITCH
// additionally needs the lens — the scale-beneath — which no trace carries, so
// `tonalReading` appears only when a caller declares `lens`. Refusing there
// rather than defaulting to L0 is the same discipline `elo-trial-hook.ts`
// applies to `mef_lens`: a guessed lens reads the run in an epistemic mode it
// never claimed.

/// The Ionian default (DR-VAK-6 item 3: "absent the field, defaults to Ionian").
const DEFAULT_TONIC_CF: &str = "(00/00)";

/// Build the audible half of a VAK evaluation response.
fn audible_reading(params: &Value, evaluated_cf: &str) -> Result<Value, String> {
    let tonic_cf = optional_str(params, "modeTonicCf").unwrap_or_else(|| DEFAULT_TONIC_CF.to_owned());
    let tonic_ordinal = portal_core::cf_ordinal(&tonic_cf)
        .ok_or_else(|| format!("modeTonicCf '{tonic_cf}' is not one of the seven context-frames"))?;
    let mode = tonic_ordinal - 1;

    // The degree is the CF's parent ordinal rotated onto the mode's ground.
    let diatonic_degree = portal_core::cf_ordinal(evaluated_cf)
        .map(|ordinal| ((ordinal - 1 + 7 - mode) % 7) + 1)
        .unwrap_or(0);

    let mut reading = json!({
        "diatonicDegree": diatonic_degree,
        "modeTonicCf": tonic_cf,
    });
    let object = reading.as_object_mut().expect("literal object");

    // DR-VAK-6 item 2 — carried only when the caller has an active M2
    // resonance72 binding. There is no producer on this path, so it is supplied
    // or absent; the half-decan is the DR's own `index / 2`.
    if let Some(index) = params.get("resonance72Index").and_then(Value::as_u64) {
        if index > 71 {
            return Err(format!(
                "resonance72Index {index} is outside the 72-fold domain (0..71)"
            ));
        }
        object.insert("resonance72Index".to_owned(), json!(index));
        object.insert("halfDecanIndex".to_owned(), json!(index / 2));
    }

    if let Some(steps) = parse_trace(params)? {
        let lens = optional_str(params, "lens").ok_or_else(|| {
            "a trace cannot be read without `lens`: the scale-beneath has no producer in a run, \
             and defaulting it would assert an epistemic mode the run never claimed"
                .to_owned()
        })?;
        let tonal = portal_core::VakTonalReading::from_trace(&lens, Some(&tonic_cf), &steps)
            .map_err(|err| err.to_string())?;
        object.insert(
            "tonalReading".to_owned(),
            serde_json::to_value(&tonal).map_err(|err| err.to_string())?,
        );
    }

    Ok(reading)
}

/// Parse the optional run trace. `None` when no trace was supplied; an error
/// when one was supplied but is not a readable sequence of VAK-addressed steps.
fn parse_trace(params: &Value) -> Result<Option<Vec<portal_core::VakTraceStep>>, String> {
    let Some(raw) = params.get("trace") else {
        return Ok(None);
    };
    let entries = raw
        .as_array()
        .ok_or_else(|| "trace must be an array of steps".to_owned())?;
    if entries.is_empty() {
        return Err("trace was supplied but is empty — there is no line to read".to_owned());
    }

    let mut steps = Vec::with_capacity(entries.len());
    for (index, entry) in entries.iter().enumerate() {
        let step_id = optional_str(entry, "stepId").unwrap_or_else(|| format!("step-{index}"));
        let address_value = entry
            .get("address")
            .ok_or_else(|| format!("trace step '{step_id}' carries no VAK address"))?;
        let address: VakAddress = serde_json::from_value(address_value.clone()).map_err(|err| {
            format!("trace step '{step_id}' has an unreadable VAK address: {err}")
        })?;
        steps.push(portal_core::VakTraceStep {
            step_id,
            address,
            agent: optional_str(entry, "agent"),
        });
    }
    Ok(Some(steps))
}

/// The `portal.vak_eval` payload for an evaluation, or `None` when the response
/// carries no audible reading to broadcast.
///
/// Assembled here rather than in the dispatch arm so the payload law lives with
/// the rest of the S4' adapter contract, and the arm stays a broadcast.
pub fn vak_eval_event(params: &Value, response: &Value) -> Option<Value> {
    let coordinates = response.get("coordinates")?;
    let degree = response.get("diatonicDegree")?.clone();

    let mut payload = json!({
        "sessionKey": optional_str(params, "sessionKey"),
        "cpf": coordinates.get("cpf").cloned().unwrap_or(Value::Null),
        "ct": coordinates.get("ct").cloned().unwrap_or(Value::Null),
        "cp": coordinates.get("cp").cloned().unwrap_or(Value::Null),
        "cf": coordinates.get("cf").cloned().unwrap_or(Value::Null),
        "cfp": coordinates.get("cfp").cloned().unwrap_or(Value::Null),
        "cs": coordinates.get("cs").cloned().unwrap_or(Value::Null),
        "diatonicDegree": degree,
    });
    let object = payload.as_object_mut().expect("literal object");
    for key in [
        "modeTonicCf",
        "resonance72Index",
        "halfDecanIndex",
        "tonalReading",
    ] {
        if let Some(value) = response.get(key) {
            object.insert(key.to_owned(), value.clone());
        }
    }
    Some(payload)
}

pub fn orchestrate(params: &Value) -> Result<Value, String> {
    let cf = params
        .get("cf")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .or_else(|| {
            params
                .get("task")
                .and_then(Value::as_str)
                .and_then(|task| vak::evaluate_vak(task).cf)
        })
        .ok_or_else(|| "cf or task is required".to_owned())?;

    let skill_path = pleroma_skill_path(ANIMA_ORCHESTRATION_SKILL)?;
    Ok(json!({
        "owner": "S4'",
        "agent": vak::cf_to_agent(&cf),
        "cf": cf,
        "capability": capability(ANIMA_ORCHESTRATION_SKILL, &skill_path),
        "authority": authority(),
    }))
}

pub fn mediation_route(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let envelope = params.get("envelope").unwrap_or(params);
    validate_mediation_envelope(envelope)?;

    let task_text = required_str(envelope, "taskText")?;
    let evaluated = evaluated_vak(params, task_text)?;
    let cf = required_str(&evaluated, "cf")?;
    let cpf = required_str(&evaluated, "cpf")?;
    let cfp = required_str(&evaluated, "cfp")?;
    let cs_direction = evaluated
        .get("cs")
        .and_then(|value| value.as_str())
        .or_else(|| {
            evaluated
                .get("cs")
                .and_then(|value| value.get("direction"))
                .and_then(Value::as_str)
        })
        .unwrap_or("Day");

    if !SUPPORTED_CFP.contains(&cfp) {
        return Err(format!("unsupported CFP/thread mode: {cfp}"));
    }

    if let Some(mode) = optional_str(envelope, "requestedThreadMode") {
        if !SUPPORTED_THREAD_MODES.contains(&mode.as_str()) {
            return Err(format!(
                "unsupported requestedThreadMode until runtime verified: {mode}"
            ));
        }
    }

    if let Some(caller_cf) = optional_str(envelope, "callerSuppliedCf") {
        if caller_cf != cf {
            return Err(format!(
                "callerSuppliedCf {caller_cf} disagrees with VAK-evaluated CF {cf}"
            ));
        }
    }

    let dispatch_tool = optional_str(envelope, "dispatchTool");
    if let Some(tool) = dispatch_tool.as_deref() {
        if DISPATCH_TOOLS.contains(&tool) && !has_upstream_vak_evidence(params, envelope) {
            return Err(format!(
                "{tool} requires upstreamRequired/upstreamEvidence containing vak-evaluate"
            ));
        }

        validate_mediation_entitlement(envelope, tool)?;
    }

    let outcome = route_outcome(cpf, cf, cfp, cs_direction, dispatch_tool.as_deref())?;
    let agent = route_agent_for_outcome(&outcome, cf);
    let vak_address = vak_address_from_evaluated(&evaluated)?;
    let session_patch = patch_session_if_requested(state_root.as_ref(), envelope, &vak_address)?;

    let result = json!({
        "owner": "S4'",
        "method": MEDIATION_ROUTE_METHOD,
        "outcome": outcome,
        "agent": agent,
        "dispatchTool": dispatch_tool,
        "upstreamRequired": ["vak-evaluate"],
        "envelope": envelope,
        "evaluatedVak": evaluated,
        "vakAddress": vak_address,
        "sessionPatch": session_patch,
        "decision": {
            "source": "anima.mediation_route",
            "routeLaw": "vak_evaluate -> anima_orchestrate -> dispatch_agent",
            "persisted": true,
            "s4AuthorityOrigin": S4_AUTHORITY_ORIGIN,
        },
        "capability": {
            "gatewayMethod": MEDIATION_ROUTE_METHOD,
            "baseBridge": "epi gate dispatch anima-invoke",
            "s4AuthorityOrigin": S4_AUTHORITY_ORIGIN,
        },
        "authority": authority(),
        "timestampMs": current_time_ms()?,
    });

    append_mediation_decision(state_root, &result)?;
    Ok(result)
}

/// Keeps the gateway adapter aligned with the S4-owned capability matrix.
/// The adapter enforces the declared class at the live mediation boundary; it
/// does not define a second capability universe.
fn validate_mediation_entitlement(envelope: &Value, dispatch_tool: &str) -> Result<(), String> {
    let matrix = read_capability_matrix()?;
    let is_aletheia_internal = matrix
        .get("aletheia_mode_internal")
        .and_then(|section| section.get("tools"))
        .and_then(Value::as_array)
        .is_some_and(|tools| {
            tools
                .iter()
                .any(|tool| tool.get("name").and_then(Value::as_str) == Some(dispatch_tool))
        });

    if !is_aletheia_internal {
        return Ok(());
    }

    let context = envelope
        .get("entitlementContext")
        .and_then(Value::as_object)
        .ok_or_else(|| {
            format!(
                "{dispatch_tool} requires aletheia-mode-internal entitlementContext with \
                 effectiveTools, anima.dispatcher, and aletheia.mode.active"
            )
        })?;

    let has_effective_tool = context
        .get("effectiveTools")
        .and_then(Value::as_array)
        .is_some_and(|tools| {
            tools
                .iter()
                .any(|tool| tool.as_str() == Some(dispatch_tool))
        });
    if !has_effective_tool {
        return Err(format!(
            "{dispatch_tool} entitlement denied: effectiveTools does not include the requested tool"
        ));
    }

    let has_dispatcher_role = context
        .get("roles")
        .and_then(Value::as_array)
        .is_some_and(|roles| {
            roles
                .iter()
                .any(|role| role.as_str() == Some("anima.dispatcher"))
        });
    if !has_dispatcher_role {
        return Err(format!(
            "{dispatch_tool} entitlement denied: aletheia-mode-internal requires anima.dispatcher"
        ));
    }

    let aletheia_mode_active = context
        .get("session")
        .and_then(|session| session.get("aletheiaModeActive"))
        .and_then(Value::as_bool)
        .unwrap_or(false);
    if !aletheia_mode_active {
        return Err(format!(
            "{dispatch_tool} entitlement denied: aletheia.mode.active is required"
        ));
    }

    Ok(())
}

/// 12.T12.10 — capability-parity surface (`s4'.mediation.capabilities.list`).
///
/// Returns the canonical mediation capability set verbatim from the S4 authority
/// `Body/S/S4/plugins/pleroma/capability-matrix.json`: the dispatch-tool family
/// plus the aletheia-mode-internal family, each tagged with its entitlement
/// class. This closes the IOD-17 follow-up noted on [`route_outcome`]: the Pi
/// runtime (which owns the capability gate, NOT the ACR) calls this at startup
/// and asserts parity against its local capability-matrix view. The adapter does
/// NOT invent the list — it reads it from the S4 matrix so there is one source
/// of truth and no second authority store.
pub fn mediation_capabilities_list(_params: &Value) -> Result<Value, String> {
    let matrix = read_capability_matrix()?;

    // dispatch_tools[*].name — the vak-dispatch family.
    let dispatch_tools = matrix
        .get("dispatch_tools")
        .and_then(Value::as_array)
        .map(|tools| {
            tools
                .iter()
                .filter_map(|tool| tool.get("name").and_then(Value::as_str))
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    // aletheia_mode_internal.tools[*].name — the GraphRAG/crystallisation family
    // that routes through s4'.mediation.route. Each carries the
    // aletheia-mode-internal entitlement class explicitly in the matrix.
    let aletheia_block = matrix.get("aletheia_mode_internal");
    let aletheia_tools = aletheia_block
        .and_then(|block| block.get("tools"))
        .and_then(Value::as_array)
        .map(|tools| {
            tools
                .iter()
                .filter_map(|tool| tool.get("name").and_then(Value::as_str))
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let aletheia_set: std::collections::HashSet<&str> =
        aletheia_tools.iter().map(String::as_str).collect();

    // Build the flat capability list, tagging each name with its class. A name
    // that appears in the aletheia table classifies as aletheia-mode-internal
    // (this mirrors `entitlementClassOf` in the TS core); everything else is
    // standard. Dedupe (dispatch_moirai_night_pass appears in both tables).
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut capabilities: Vec<Value> = Vec::new();
    for name in dispatch_tools.iter().chain(aletheia_tools.iter()) {
        if !seen.insert(name.clone()) {
            continue;
        }
        let class = if aletheia_set.contains(name.as_str()) {
            ALETHEIA_MODE_INTERNAL_CLASS
        } else {
            STANDARD_ENTITLEMENT_CLASS
        };
        capabilities.push(json!({
            "name": name,
            "entitlementClass": class,
        }));
    }

    let entitlement_classes = matrix
        .get("entitlement_classes")
        .cloned()
        .unwrap_or_else(|| json!({}));

    Ok(json!({
        "owner": "S4'",
        "method": CAPABILITIES_LIST_METHOD,
        "entitlementClasses": entitlement_classes,
        "dispatchTools": dispatch_tools,
        "aletheiaModeInternalTools": aletheia_tools,
        "capabilities": capabilities,
        "routesThrough": MEDIATION_ROUTE_METHOD,
        "authority": authority(),
        "s4AuthorityOrigin": S4_AUTHORITY_ORIGIN,
    }))
}

pub fn agent_status(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let agent_id = optional_str(params, "agentId").unwrap_or_else(|| "anima".to_owned());
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let now_ms = current_time_ms()?;
    let uptime_ms = state_root_age_ms(state_root.as_ref(), now_ms)?;

    Ok(json!({
        "owner": "S4",
        "agentId": agent_id,
        "state": "available",
        "sessionKey": session_key,
        "dayId": current_day_id(),
        "teamComposition": constitutional_agents(),
        "csPosition": "dispatchable",
        "cfFrame": "(4.0/1-4.4/5)",
        "uptimeMs": uptime_ms,
        "observedAtMs": now_ms,
        "coordinateContext": {
            "s": "S4",
            "sPrime": "S4'",
            "runtime": state_root.as_ref().to_string_lossy(),
        },
    }))
}

pub fn agent_query(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let target_agent = required_str(params, "targetAgent")?;
    let method = required_str(params, "method")?;
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let ack_id = Uuid::new_v4().to_string();
    let timestamp_ms = current_time_ms()?;
    let query_params = params.get("params").cloned().unwrap_or_else(|| json!({}));
    let event = json!({
        "kind": "agent.query",
        "status": "accepted",
        "ackId": ack_id,
        "targetAgent": target_agent,
        "method": method,
        "sessionKey": session_key,
        "params": query_params,
        "resultChannel": format!("agent.result.{ack_id}"),
        "coordinateContext": {
            "owner": "S4",
            "sPrime": "S4'",
            "authority": "gateway-temporal-ack",
        },
        "timestampMs": timestamp_ms,
    });
    append_agent_event(state_root, &event)?;
    Ok(event)
}

pub fn agent_notify(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let target_agent = required_str(params, "targetAgent")?;
    let kind = required_str(params, "kind")?;
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let receipt_id = Uuid::new_v4().to_string();
    let payload = params.get("payload").cloned().unwrap_or_else(|| json!({}));
    let event = json!({
        "kind": kind,
        "status": "delivered",
        "receiptId": receipt_id,
        "targetAgent": target_agent,
        "sessionKey": session_key,
        "payload": payload,
        "coordinateContext": {
            "owner": "S4",
            "sPrime": "S4'",
            "delivery": "fire-and-forget",
        },
        "timestampMs": current_time_ms()?,
    });
    append_agent_event(state_root, &event)?;
    Ok(event)
}

pub fn psyche_state(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let state = read_psyche_state(state_root.as_ref(), &session_key)?;
    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "handles": psyche_handles(&session_key)?,
        "state": state,
    }))
}

pub fn psyche_update(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let patch = params
        .get("patch")
        .and_then(Value::as_object)
        .ok_or_else(|| "patch must be an object".to_owned())?;
    validate_psyche_patch(patch)?;
    let mut state = read_psyche_state(state_root.as_ref(), &session_key)?;
    merge_psyche_patch(&mut state, patch);
    state["updatedAtMs"] = json!(current_time_ms()?);
    write_psyche_state(state_root.as_ref(), &session_key, &state)?;
    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "handles": psyche_handles(&session_key)?,
        "state": state,
    }))
}

/// 51.T51.1 — `s4'.context.assemble`: serve the session-context pack the
/// ta-onta spine actually injected.
///
/// The S4' compositor (`Body/S/S4/ta-onta/spine/compositor.ts`) is the ONE
/// assembler. On `before_agent_start` it assembles a [`ContextPack`], injects
/// `pack.injection` as the session system prompt, and publishes that same
/// object to `<state-root>/s4/context-pack/<slug>.json`. This adapter READS
/// that file. It deliberately does not re-assemble: two code paths that both
/// "assemble the pack" is exactly how the injection drifted into being dead
/// with nothing able to notice.
///
/// When a session has not assembled a pack, the response says so
/// (`present: false`) rather than fabricating one — an unassembled session and
/// a session with an empty context must not read alike.
pub fn context_assemble(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let path = context_pack_path(state_root.as_ref(), &session_key);

    if !path.exists() {
        return Ok(json!({
            "owner": "S4'",
            "sessionKey": session_key,
            "present": false,
            "reason": "no context pack has been published for this session",
            "assembler": CONTEXT_PACK_ASSEMBLER,
            "packPath": path.display().to_string(),
            "pack": Value::Null,
        }));
    }

    let body = fs::read_to_string(&path).map_err(|err| err.to_string())?;
    let pack: Value = serde_json::from_str(&body).map_err(|err| err.to_string())?;

    // Fail closed on a pack missing its load-bearing field: an operator being
    // shown "the context" that has no injection is worse than an honest error.
    if !pack.get("injection").map(Value::is_string).unwrap_or(false) {
        return Err(format!(
            "published context pack at {} carries no injection string",
            path.display()
        ));
    }

    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "present": true,
        "assembler": CONTEXT_PACK_ASSEMBLER,
        "packPath": path.display().to_string(),
        "pack": pack,
    }))
}

/// The S4' authority that assembles and publishes the pack this adapter serves.
const CONTEXT_PACK_ASSEMBLER: &str =
    "Body/S/S4/ta-onta/spine/compositor.ts::SpineCompositor.assembleContextPack";

/// Twin of `Body/S/S4/ta-onta/spine/context-pack-store.ts::contextPackPath`.
fn context_pack_path(state_root: &Path, session_key: &str) -> PathBuf {
    state_root
        .join("s4")
        .join("context-pack")
        .join(format!("{}.json", slug(session_key)))
}

/// 50.T50.10 — `s4'.orchestration.score`: the orchestration-run surface.
///
/// Track 50 makes a generated TypeScript program the way Anima composes tool
/// calls. One execution of such a program is a bounded song; a repeatable one is
/// persisted as a SCORE, and runs accumulate against it. This method serves that
/// score and its run history as observable data.
///
/// **This adapter READS. It does not run.** Pi->subagent is the only agentic
/// path, so a gateway that executed orchestrations would be a second one — and
/// the run state belongs to the parent Anima session that holds it
/// (`S4-4p-anima/lib/orchestration-run.ts`), not to a stateless RPC. The same
/// reader discipline `context_assemble` follows: the S4' authority produces, the
/// S0 adapter serves what was produced.
///
/// With `scoreId`: the score document and every run recorded against it.
/// Without: the ids in the store, so a caller can discover what exists.
///
/// A score whose content hash no longer matches its body is an ERROR, not a
/// result. `loadScore` refuses a drifted score because re-running one would not
/// reproduce the run it claims to be; serving it here would let a caller read a
/// program that is not the one that was scored.
pub fn orchestration_score(params: &Value) -> Result<Value, String> {
    let dir = scores_dir();
    let Some(score_id) = optional_str(params, "scoreId") else {
        return Ok(json!({
            "owner": "S4'",
            "store": dir.display().to_string(),
            "authority": SCORE_STORE_AUTHORITY,
            "scores": list_score_ids(&dir),
        }));
    };
    assert_score_id(&score_id)?;

    let path = dir.join(format!("{score_id}.json"));
    if !path.exists() {
        return Ok(json!({
            "owner": "S4'",
            "scoreId": score_id,
            "present": false,
            "reason": "no score with that id has been persisted",
            "store": dir.display().to_string(),
            "authority": SCORE_STORE_AUTHORITY,
            "score": Value::Null,
            "runs": [],
        }));
    }

    let body = fs::read_to_string(&path).map_err(|err| err.to_string())?;
    let score: Value = serde_json::from_str(&body).map_err(|err| err.to_string())?;

    // Fail closed on a score that has lost its identity. A caller reading a
    // program without the hash it was scored under cannot tell whether it is
    // the program that ran.
    let recorded_hash = score
        .get("hash")
        .and_then(Value::as_str)
        .ok_or_else(|| format!("persisted score at {} carries no hash", path.display()))?;

    Ok(json!({
        "owner": "S4'",
        "scoreId": score_id,
        "present": true,
        "store": dir.display().to_string(),
        "authority": SCORE_STORE_AUTHORITY,
        "hash": recorded_hash,
        "score": score,
        "runs": read_score_runs(&dir, &score_id),
    }))
}

/// The S4' authority that persists the scores this adapter serves.
const SCORE_STORE_AUTHORITY: &str =
    "Body/S/S4/ta-onta/S4-1p-hen/modules/score-store.ts::saveScore/recordScoreRun";

/// Twin of `score-store.ts::scoresDir()` — same precedence, same layout.
///
/// `.epi/` is runtime state, not the vault: a score is machinery, not canon.
/// The env var comes first exactly as it does in TS, which is also what lets a
/// test point both halves at one throwaway directory.
fn scores_dir() -> PathBuf {
    if let Some(dir) = std::env::var_os("EPI_SCORES_DIR") {
        return PathBuf::from(dir);
    }
    let root = std::env::var_os("EPI_REPO_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
    root.join(".epi").join("scores")
}

/// Twin of `score-store.ts::assertScoreId` — ids are never path segments.
fn assert_score_id(score_id: &str) -> Result<(), String> {
    let valid = !score_id.is_empty()
        && !score_id.contains("..")
        && score_id
            .chars()
            .next()
            .is_some_and(|c| c.is_ascii_alphanumeric())
        && score_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'));
    if valid {
        return Ok(());
    }
    Err(format!(
        "invalid score id '{score_id}': ids are [A-Za-z0-9._-] and never path segments"
    ))
}

/// Twin of `score-store.ts::listScores` — `.runs.jsonl` is excluded by suffix.
fn list_score_ids(dir: &Path) -> Vec<String> {
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };
    let mut ids: Vec<String> = entries
        .filter_map(Result::ok)
        .filter_map(|entry| {
            let name = entry.file_name().to_string_lossy().into_owned();
            name.strip_suffix(".json").map(str::to_owned)
        })
        .collect();
    ids.sort();
    ids
}

/// Twin of `score-store.ts::readScoreRuns` — the append-only run log, in order.
///
/// A malformed line is skipped rather than failing the whole read: the log is
/// append-only evidence, and one bad row must not hide the rest of a score's
/// history.
fn read_score_runs(dir: &Path, score_id: &str) -> Vec<Value> {
    let path = dir.join(format!("{score_id}.runs.jsonl"));
    let Ok(body) = fs::read_to_string(path) else {
        return Vec::new();
    };
    body.lines()
        .filter(|line| !line.trim().is_empty())
        .filter_map(|line| serde_json::from_str::<Value>(line).ok())
        .collect()
}

pub fn permission_get(_state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let agent_id = optional_str(params, "agentId").unwrap_or_else(|| "anima".to_owned());
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    Ok(json!({
        "owner": "S4'",
        "agentId": agent_id,
        "sessionKey": session_key,
        "boundary": authority(),
        "coordinateContext": {
            "sPrime": "S4'",
            "branch": "ta-onta",
            "module": "permission-boundary",
        },
    }))
}

fn capability(skill: &str, skill_path: &Path) -> Value {
    json!({
        "plugin": "pleroma",
        "skill": skill,
        "skillPath": display_path(skill_path),
        "invocation": "bounded_pi_skill",
    })
}

/// S4_AUTHORITY: the `forbidden` list mirrors
/// `capability-matrix.json:forbidden_authority`. The boolean flags mirror
/// the Anima `m5_4_governance.review_surface_roles.anima` action set.
/// Source-of-truth: `Body/S/S4/plugins/pleroma/capability-matrix.json`.
pub fn authority() -> Value {
    json!({
        "mayDispatch": true,
        "mayInvokeBoundedSkill": true,
        "mayDepositToEpii": true,
        "mayResolveEpiiReview": false,
        "forbidden": [
            "resolve_epii_review_gate",
            "mutate_epii_identity_state",
            "bypass_epii_inbox"
        ],
        "s4AuthorityOrigin": S4_AUTHORITY_ORIGIN,
    })
}

/// S3 session telemetry: gateway acceptance/delivery receipts for
/// `s4.agent.query` / `s4.agent.notify`. NOT authoritative mediation
/// evidence; lives next to the S3 session store at `<state_root>/s4/`.
fn append_agent_event(state_root: impl AsRef<Path>, event: &Value) -> Result<(), String> {
    let path = state_root.as_ref().join("s4").join("agent-events.jsonl");
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|err| err.to_string())?;
    let line = serde_json::to_string(event).map_err(|err| err.to_string())?;
    writeln!(file, "{line}").map_err(|err| err.to_string())
}

/// S4 orchestration evidence: the adapter's record of every
/// `s4'.mediation.route` decision dispatched through this gateway. Tagged
/// with `s4AuthorityOrigin` in the payload so it cannot be confused with
/// any S4-internal store. NOT a second authority — re-derivable from the
/// envelope + S4 capability matrix at any time.
fn append_mediation_decision(state_root: impl AsRef<Path>, event: &Value) -> Result<(), String> {
    let path = state_root
        .as_ref()
        .join("s4")
        .join("mediation-routes.jsonl");
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|err| err.to_string())?;
    let line = serde_json::to_string(event).map_err(|err| err.to_string())?;
    writeln!(file, "{line}").map_err(|err| err.to_string())
}

fn validate_mediation_envelope(envelope: &Value) -> Result<(), String> {
    for key in ["taskText", "sessionKey", "dayId", "nowPath", "privacyClass"] {
        required_str(envelope, key)?;
    }
    require_array(envelope, "artifactRefs")?;
    require_array(envelope, "declaredWriteScope")?;
    require_object(envelope, "coordinateContext")?;
    require_present(envelope, "actorRequest")?;
    require_present(envelope, "profileGeneration")?;
    require_present(envelope, "readinessSnapshot")?;
    require_present(envelope, "requestedCapacityProfile")?;
    validate_write_scope(envelope)?;
    Ok(())
}

fn validate_write_scope(envelope: &Value) -> Result<(), String> {
    for scope in require_array(envelope, "declaredWriteScope")? {
        let Some(scope) = scope.as_str().filter(|value| !value.trim().is_empty()) else {
            return Err("declaredWriteScope entries must be non-empty strings".to_owned());
        };
        let normalized = scope.trim_end_matches("**");
        if !SUPPORTED_WRITE_SCOPES
            .iter()
            .any(|prefix| normalized.starts_with(prefix) || scope.starts_with(prefix))
        {
            return Err(format!("unsupported declaredWriteScope: {scope}"));
        }
    }
    Ok(())
}

fn evaluated_vak(params: &Value, task_text: &str) -> Result<Value, String> {
    if let Some(value) = params.get("evaluatedVak") {
        if !has_upstream_vak_evidence(params, params.get("envelope").unwrap_or(params)) {
            return Err("evaluatedVak requires upstream vak-evaluate evidence".to_owned());
        }
        for key in ["cpf", "ct", "cp", "cf", "cfp", "cs"] {
            require_present(value, key)?;
        }
        return Ok(value.clone());
    }

    let coordinates = vak::evaluate_vak(task_text);
    let mut value = serde_json::to_value(coordinates).map_err(|err| err.to_string())?;
    if let Some(obj) = value.as_object_mut() {
        obj.insert(
            "source".to_owned(),
            json!("epi agent vak evaluate library equivalent"),
        );
    }
    Ok(value)
}

fn has_upstream_vak_evidence(params: &Value, envelope: &Value) -> bool {
    ["upstreamRequired", "upstreamEvidence"]
        .iter()
        .filter_map(|key| {
            params
                .get(key)
                .or_else(|| envelope.get(key))
                .and_then(Value::as_array)
        })
        .flatten()
        .any(|value| value.as_str() == Some("vak-evaluate"))
}

/// S4_AUTHORITY: mirrors the dispatch-routing law expressed across
/// `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` (CFP fanout) and the
/// Anima skill contract in
/// `Body/S/S4/plugins/pleroma/skills/anima-orchestration/SKILL.md`.
/// Outcome names are S0 adapter labels for the S4-owned routing decision;
/// the S4 plugin re-derives the same routing from VAK + dispatch tool on
/// receipt. Track-13 follow-up: once S4 exposes
/// `s4'.mediation.capabilities.list` over the gateway (IOD-17), this
/// function should call it and return the S4-canonical outcome verbatim
/// rather than re-derive it here.
fn route_outcome(
    cpf: &str,
    cf: &str,
    cfp: &str,
    cs_direction: &str,
    dispatch_tool: Option<&str>,
) -> Result<&'static str, String> {
    if cpf == "(00/00)" {
        return Ok("UserBrainstormRequired");
    }
    if cf == "(0000)" || cf == "(00/00)" {
        return Ok("NousRequired");
    }
    if dispatch_tool == Some("dispatch_moirai_night_pass") {
        if cfp != "CFP3" || cs_direction != "Night'" || !MOIRAI_HOST_CF.contains(&cf) {
            return Err(
                "dispatch_moirai_night_pass requires MOIRAI_HOST_CF with CFP3 Night' VAK"
                    .to_owned(),
            );
        }
        return Ok("MoiraiNightPass");
    }
    if dispatch_tool == Some("dispatch_fusion_agents") {
        if cfp != "CFP3" {
            return Err(
                "dispatch_fusion_agents requires validateFusionDispatch-compatible CFP3".to_owned(),
            );
        }
        return Ok("FusionDispatch");
    }
    if dispatch_tool == Some("anima_self_invoke") && cf == "(4.0/1-4.4/5)" {
        return Ok("AnimaSelfInvoke");
    }
    if cs_direction == "Night'" {
        return Ok("AletheiaDisclosure");
    }
    if cf == "(5/0)" {
        return Ok("SophiaLed");
    }
    if cf == "(4.0/1-4.4/5)" {
        return Ok("AnimaPrimary");
    }
    Ok("PiDispatch")
}

/// S4_AUTHORITY: agent-name selection mirrors the constitutional roster
/// declared in `Body/S/S4/pi-agent/agents/teams.yaml` and the
/// `agent_capability_gates` block of `capability-matrix.json`. The
/// Anima/Sophia/Aletheia special-cases below match the
/// `agent_capability_gates` entries. Track-13 follow-up: see
/// `route_outcome` — once IOD-17 exposes the S4 mediation surface, this
/// table collapses into a thin pass-through.
fn route_agent_for_outcome(outcome: &str, cf: &str) -> String {
    match outcome {
        "UserBrainstormRequired" | "NousRequired" => "nous".to_owned(),
        "MoiraiNightPass" | "AletheiaDisclosure" => "aletheia".to_owned(),
        "FusionDispatch" => "agora".to_owned(),
        "AnimaSelfInvoke" | "AnimaPrimary" => "anima".to_owned(),
        "SophiaLed" => "sophia".to_owned(),
        _ => vak::cf_to_agent(cf).to_owned(),
    }
}

fn vak_address_from_evaluated(evaluated: &Value) -> Result<VakAddress, String> {
    let cpf = match required_str(evaluated, "cpf")? {
        "(00/00)" => CpfState::Dialogical,
        _ => CpfState::Mechanistic,
    };
    let ct = evaluated
        .get("ct")
        .and_then(Value::as_array)
        .map(|items| {
            items
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .filter(|items| !items.is_empty())
        .unwrap_or_else(|| {
            evaluated
                .get("ct")
                .and_then(Value::as_str)
                .map(|value| vec![value.to_owned()])
                .unwrap_or_else(|| vec!["CT4b".to_owned()])
        });
    let cs_direction = evaluated
        .get("cs")
        .and_then(|value| value.get("direction"))
        .and_then(Value::as_str)
        .or_else(|| evaluated.get("cs").and_then(Value::as_str))
        .unwrap_or("Day");
    let cs_code = evaluated
        .get("cs")
        .and_then(|value| value.get("code"))
        .and_then(Value::as_str)
        .unwrap_or("CS0");
    let recognized = evaluated
        .get("recognized")
        .or_else(|| {
            evaluated
                .get("cs")
                .and_then(|value| value.get("recognized"))
        })
        .and_then(Value::as_bool)
        .unwrap_or(false);

    Ok(VakAddress {
        cpf,
        ct,
        cp: required_str(evaluated, "cp")?.to_owned(),
        cf: required_str(evaluated, "cf")?.to_owned(),
        cfp: required_str(evaluated, "cfp")?.to_owned(),
        cs: CsField {
            code: cs_code.to_owned(),
            direction: if cs_direction == "Night'" {
                CsDirection::Night
            } else {
                CsDirection::Day
            },
            recognized,
        },
    })
}

fn patch_session_if_requested(
    state_root: &Path,
    envelope: &Value,
    vak_address: &VakAddress,
) -> Result<Value, String> {
    let session_affecting = envelope
        .get("sessionAffecting")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    if !session_affecting {
        return Ok(Value::Null);
    }

    let target = optional_str(envelope, "targetSessionKey")
        .or_else(|| optional_str(envelope, "sessionKey"))
        .ok_or_else(|| {
            "session-affecting mediation requires targetSessionKey/sessionKey".to_owned()
        })?;
    let store = SessionStore::new(state_root).map_err(|err| err.to_string())?;
    let record = store.patch(
        &target,
        SessionPatch {
            vak_address: Some(vak_address.clone()),
            ..Default::default()
        },
    )?;
    Ok(json!({
        "method": "sessions.patch",
        "sessionKey": target,
        "vakAddress": vak_address,
        "record": crate::gate::sessions::record_to_value(&record),
    }))
}

fn require_present<'a>(params: &'a Value, key: &str) -> Result<&'a Value, String> {
    params
        .get(key)
        .filter(|value| !value.is_null())
        .ok_or_else(|| format!("{key} is required"))
}

fn require_array<'a>(params: &'a Value, key: &str) -> Result<&'a Vec<Value>, String> {
    params
        .get(key)
        .and_then(Value::as_array)
        .filter(|items| !items.is_empty())
        .ok_or_else(|| format!("{key} must be a non-empty array"))
}

fn require_object<'a>(params: &'a Value, key: &str) -> Result<&'a Map<String, Value>, String> {
    params
        .get(key)
        .and_then(Value::as_object)
        .ok_or_else(|| format!("{key} must be an object"))
}

fn read_psyche_state(state_root: &Path, session_key: &str) -> Result<Value, String> {
    let path = psyche_state_path(state_root, session_key);
    if !path.exists() {
        return Ok(default_psyche_state()?);
    }
    let body = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&body).map_err(|err| err.to_string())
}

fn write_psyche_state(state_root: &Path, session_key: &str, state: &Value) -> Result<(), String> {
    let path = psyche_state_path(state_root, session_key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let body = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, body).map_err(|err| err.to_string())
}

fn psyche_state_path(state_root: &Path, session_key: &str) -> PathBuf {
    state_root
        .join("s4")
        .join("psyche")
        .join(format!("{}.json", slug(session_key)))
}

fn default_psyche_state() -> Result<Value, String> {
    Ok(json!({
        "operativeNotebook": Value::Null,
        "currentTask": Value::Null,
        "currentSubtasks": [],
        "activeArtifactSet": [],
        "carryForward": [],
        "renderer": {
            "activeBlockIds": [],
            "pendingVerdict": Value::Null,
            "currentSelection": Value::Null,
            "appliedOperations": [],
        },
        "visibilityStance": "observable",
        "runLocalContinuity": {},
        "updatedAtMs": current_time_ms()?,
    }))
}

fn psyche_handles(session_key: &str) -> Result<Value, String> {
    let handle = epi_s3_gateway_contract::PsycheRuntimeHandle::for_session(session_key);
    serde_json::to_value(handle).map_err(|err| err.to_string())
}

fn validate_psyche_patch(patch: &Map<String, Value>) -> Result<(), String> {
    let max =
        epi_s3_gateway_contract::PsycheRuntimeHandle::for_session("bound").max_carry_forward_items;
    if let Some(carry_forward) = patch.get("carryForward").and_then(Value::as_array) {
        if carry_forward.len() > max {
            return Err(format!(
                "carry-forward exceeds Psyche runtime bound ({}/{max})",
                carry_forward.len()
            ));
        }
    }
    if let Some(renderer) = patch.get("renderer") {
        validate_renderer_patch(renderer)?;
    }
    Ok(())
}

fn merge_psyche_patch(state: &mut Value, patch: &Map<String, Value>) {
    if let Some(state_obj) = state.as_object_mut() {
        for key in [
            "operativeNotebook",
            "currentTask",
            "currentSubtasks",
            "activeArtifactSet",
            "carryForward",
            "renderer",
            "visibilityStance",
            "runLocalContinuity",
        ] {
            if let Some(value) = patch.get(key) {
                state_obj.insert(key.to_owned(), value.clone());
            }
        }
    }
}

fn validate_renderer_patch(renderer: &Value) -> Result<(), String> {
    let renderer = renderer
        .as_object()
        .ok_or_else(|| "renderer must be an object".to_owned())?;
    if let Some(active_block_ids) = renderer.get("activeBlockIds") {
        let ids = active_block_ids
            .as_array()
            .ok_or_else(|| "renderer.activeBlockIds must be an array".to_owned())?;
        if !ids.iter().all(|value| value.as_str().is_some()) {
            return Err("renderer.activeBlockIds must contain only strings".to_owned());
        }
    }
    if let Some(current_selection) = renderer.get("currentSelection") {
        if !(current_selection.is_null() || current_selection.as_str().is_some()) {
            return Err("renderer.currentSelection must be a string or null".to_owned());
        }
    }
    if let Some(pending_verdict) = renderer.get("pendingVerdict") {
        if !(pending_verdict.is_null() || pending_verdict.as_object().is_some()) {
            return Err("renderer.pendingVerdict must be an object or null".to_owned());
        }
    }
    if let Some(applied_operations) = renderer.get("appliedOperations") {
        let operations = applied_operations
            .as_array()
            .ok_or_else(|| "renderer.appliedOperations must be an array".to_owned())?;
        if !operations.iter().all(|value| value.as_object().is_some()) {
            return Err("renderer.appliedOperations must contain only objects".to_owned());
        }
    }
    if let Some(blocks) = renderer.get("blocks") {
        let blocks = blocks
            .as_array()
            .ok_or_else(|| "renderer.blocks must be an array".to_owned())?;
        if !blocks.iter().all(is_valid_renderer_block) {
            return Err("renderer.blocks must contain valid Block wire objects".to_owned());
        }
    }
    Ok(())
}

fn is_valid_renderer_block(value: &Value) -> bool {
    let Some(block) = value.as_object() else {
        return false;
    };
    let has_required_strings = block.get("id").and_then(Value::as_str).is_some()
        && block.get("type").and_then(Value::as_str).is_some();
    let privacy_ok = matches!(
        block.get("privacyClass").and_then(Value::as_str),
        Some("public" | "protected" | "protected-local")
    );
    let ctx_ok = block
        .get("ctx")
        .and_then(Value::as_object)
        .map(|ctx| {
            ctx.get("cf").and_then(Value::as_str).is_some()
                && ctx.get("ct").and_then(Value::as_str).is_some()
                && ctx.get("cp").and_then(Value::as_str).is_some()
        })
        .unwrap_or(false);
    has_required_strings && privacy_ok && ctx_ok && block.contains_key("data")
}

/// Read and parse the S4 capability matrix
/// (`Body/S/S4/plugins/pleroma/capability-matrix.json`). This is the single
/// source of truth for `mediation_capabilities_list`; the adapter never
/// maintains a second copy of the capability set.
fn read_capability_matrix() -> Result<Value, String> {
    let layout = AgentLayout::resolve(Some("anima"))?;
    let path = layout
        .repo_root
        .join(PLEROMA_ROOT)
        .join(CAPABILITY_MATRIX_FILE);
    if !path.exists() {
        return Err(format!(
            "S4 capability matrix is not present at expected path: {}",
            path.display()
        ));
    }
    let body = fs::read_to_string(&path).map_err(|err| err.to_string())?;
    serde_json::from_str(&body).map_err(|err| {
        format!(
            "failed to parse capability matrix at {}: {err}",
            path.display()
        )
    })
}

fn pleroma_skill_path(skill: &str) -> Result<PathBuf, String> {
    let layout = AgentLayout::resolve(Some("anima"))?;
    let root = layout.repo_root.join(PLEROMA_ROOT);
    let skill_path = root.join("skills").join(skill).join("SKILL.md");
    if !skill_path.exists() {
        return Err(format!(
            "Pleroma skill is not installed at expected path: {}",
            skill_path.display()
        ));
    }
    Ok(skill_path)
}

fn required_str<'a>(params: &'a Value, key: &str) -> Result<&'a str, String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("{key} must be a non-empty string"))
}

fn optional_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(str::to_owned)
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn current_time_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}

fn current_day_id() -> String {
    chrono::Utc::now().format("%Y-%m-%d").to_string()
}

fn state_root_age_ms(state_root: &Path, now_ms: u128) -> Result<u128, String> {
    let metadata = fs::metadata(state_root).map_err(|err| err.to_string())?;
    let started_ms = metadata
        .modified()
        .map_err(|err| err.to_string())?
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis();
    Ok(now_ms.saturating_sub(started_ms))
}

/// S4_AUTHORITY: mirror of
/// `capability-matrix.json:constitutional_agents` minus the `anima`
/// orchestrator itself (which queries this list for its team
/// composition). Drift = Track-13 follow-up.
fn constitutional_agents() -> Value {
    json!(["nous", "logos", "eros", "mythos", "psyche", "sophia"])
}

fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect()
}
