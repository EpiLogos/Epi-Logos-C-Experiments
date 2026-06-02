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
//! and consume by FFI; see the IOD-17 follow-up note on
//! `s4'.mediation.capabilities.list`.
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
    "Body/M/epi-tauri/",
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
    let skill_path = pleroma_skill_path(VAK_EVALUATE_SKILL)?;

    Ok(json!({
        "owner": "S4'",
        "agent": agent,
        "coordinates": coordinates,
        "capability": capability(VAK_EVALUATE_SKILL, &skill_path),
        "authority": authority(),
    }))
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
        "state": state,
    }))
}

pub fn psyche_update(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let session_key = optional_str(params, "sessionKey").unwrap_or_else(|| "main".to_owned());
    let patch = params
        .get("patch")
        .and_then(Value::as_object)
        .ok_or_else(|| "patch must be an object".to_owned())?;
    let mut state = read_psyche_state(state_root.as_ref(), &session_key)?;
    merge_psyche_patch(&mut state, patch);
    state["updatedAtMs"] = json!(current_time_ms()?);
    write_psyche_state(state_root.as_ref(), &session_key, &state)?;
    Ok(json!({
        "owner": "S4'",
        "sessionKey": session_key,
        "state": state,
    }))
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
        "visibilityStance": "observable",
        "runLocalContinuity": {},
        "updatedAtMs": current_time_ms()?,
    }))
}

fn merge_psyche_patch(state: &mut Value, patch: &Map<String, Value>) {
    if let Some(state_obj) = state.as_object_mut() {
        for key in [
            "operativeNotebook",
            "currentTask",
            "currentSubtasks",
            "activeArtifactSet",
            "visibilityStance",
            "runLocalContinuity",
        ] {
            if let Some(value) = patch.get(key) {
                state_obj.insert(key.to_owned(), value.clone());
            }
        }
    }
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
