mod support;

use std::fs;

use epi_logos::gate::{anima, sessions::SessionStore};
use serde_json::{json, Value};
use support::temp_env;

fn envelope() -> Value {
    json!({
        "taskText": "coordinate the implementation route",
        "artifactRefs": ["Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/context-09-T1.md"],
        "coordinateContext": {
            "source": "m-dev",
            "track": "09.T1"
        },
        "declaredWriteScope": ["Body/S/S4/**"],
        "actorRequest": {
            "actor": "admin",
            "intent": "route mediation invocation"
        },
        "sessionKey": "agent:anima:mediation",
        "dayId": "2026-06-01",
        "nowPath": "Idea/Empty/Present/01-06-2026/session/now.md",
        "profileGeneration": 7,
        "readinessSnapshot": {
            "status": "ready_public_current"
        },
        "privacyClass": "public_runtime",
        "requestedCapacityProfile": {
            "model": "gpt-5"
        }
    })
}

fn evaluated(cpf: &str, cf: &str, cfp: &str, cs_direction: &str) -> Value {
    json!({
        "cpf": cpf,
        "ct": ["CT4b"],
        "cp": "CP4.4",
        "cf": cf,
        "cfp": cfp,
        "cs": {
            "code": "CS0",
            "direction": cs_direction
        },
        "source": "s4'.vak.evaluate"
    })
}

fn aletheia_entitlement(dispatch_tool: &str) -> Value {
    json!({
        "effectiveTools": [dispatch_tool],
        "roles": ["anima.dispatcher"],
        "session": {
            "aletheiaModeActive": true
        }
    })
}

fn route_with(env: Value, evaluated_vak: Value) -> Value {
    let state = temp_env().home.join(".epi").join("gate");
    anima::mediation_route(
        &state,
        &json!({
            "envelope": env,
            "evaluatedVak": evaluated_vak,
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect("mediation route should succeed")
}

#[test]
fn mediation_route_uses_real_vak_evaluate_when_no_upstream_fixture_is_supplied() {
    let state = temp_env().home.join(".epi").join("gate");
    let result = anima::mediation_route(&state, &json!({ "envelope": envelope() }))
        .expect("default route evaluates VAK itself");

    assert_eq!(
        result["evaluatedVak"]["source"].as_str(),
        Some("epi agent vak evaluate library equivalent")
    );
    assert_eq!(result["outcome"].as_str(), Some("AnimaPrimary"));
    assert_eq!(result["agent"].as_str(), Some("anima"));

    let log = fs::read_to_string(state.join("s4").join("mediation-routes.jsonl"))
        .expect("decision log is persisted");
    assert!(
        log.contains("\"outcome\":\"AnimaPrimary\""),
        "persisted mediation decision records the routing outcome: {log}"
    );
}

#[test]
fn mediation_route_maps_required_vak_special_cases() {
    let nous = route_with(
        envelope(),
        evaluated("(4.0/1-4.4/5)", "(0000)", "CFP0", "Day"),
    );
    assert_eq!(nous["outcome"].as_str(), Some("NousRequired"));

    let brainstorming = route_with(envelope(), evaluated("(00/00)", "(0/1)", "CFP0", "Day"));
    assert_eq!(
        brainstorming["outcome"].as_str(),
        Some("UserBrainstormRequired")
    );

    let sophia = route_with(
        envelope(),
        evaluated("(4.0/1-4.4/5)", "(5/0)", "CFP0", "Day"),
    );
    assert_eq!(sophia["outcome"].as_str(), Some("SophiaLed"));

    let anima = route_with(
        envelope(),
        evaluated("(4.0/1-4.4/5)", "(4.0/1-4.4/5)", "CFP0", "Day"),
    );
    assert_eq!(anima["outcome"].as_str(), Some("AnimaPrimary"));
}

#[test]
fn mediation_route_gates_moirai_fusion_and_anima_self_invoke() {
    let mut moirai_env = envelope();
    moirai_env["dispatchTool"] = json!("dispatch_moirai_night_pass");
    moirai_env["entitlementContext"] = aletheia_entitlement("dispatch_moirai_night_pass");
    let moirai = route_with(
        moirai_env,
        evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'"),
    );
    assert_eq!(moirai["outcome"].as_str(), Some("MoiraiNightPass"));

    let mut fusion_env = envelope();
    fusion_env["dispatchTool"] = json!("dispatch_fusion_agents");
    let fusion = route_with(
        fusion_env,
        evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Day"),
    );
    assert_eq!(fusion["outcome"].as_str(), Some("FusionDispatch"));

    let mut self_env = envelope();
    self_env["dispatchTool"] = json!("anima_self_invoke");
    let self_invoke = route_with(
        self_env,
        evaluated("(4.0/1-4.4/5)", "(4.0/1-4.4/5)", "CFP0", "Day"),
    );
    assert_eq!(self_invoke["outcome"].as_str(), Some("AnimaSelfInvoke"));
}

#[test]
fn mediation_route_rejects_ungrounded_or_incomplete_envelopes() {
    let state = temp_env().home.join(".epi").join("gate");

    let mut missing_now = envelope();
    missing_now.as_object_mut().unwrap().remove("nowPath");
    let err = anima::mediation_route(&state, &json!({ "envelope": missing_now }))
        .expect_err("missing NOW path is rejected");
    assert!(err.contains("nowPath"));

    let mut bad_scope = envelope();
    bad_scope["declaredWriteScope"] = json!(["Body/S/S2/**"]);
    let err = anima::mediation_route(&state, &json!({ "envelope": bad_scope }))
        .expect_err("unsupported write scope is rejected");
    assert!(err.contains("unsupported declaredWriteScope"));

    let mut bad_cf = envelope();
    bad_cf["callerSuppliedCf"] = json!("(5/0)");
    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": bad_cf,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1)", "CFP0", "Day"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect_err("caller CF disagreement is rejected");
    assert!(err.contains("disagrees"));

    let mut dispatch_without_gate = envelope();
    dispatch_without_gate["dispatchTool"] = json!("dispatch_agent");
    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": dispatch_without_gate,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1)", "CFP0", "Day")
        }),
    )
    .expect_err("dispatch tool without upstream VAK evidence is rejected");
    assert!(err.contains("upstream"));
}

#[test]
fn mediation_route_refuses_aletheia_internal_tool_without_active_entitlement_context() {
    let state = temp_env().home.join(".epi").join("gate");
    let mut protected_tool = envelope();
    protected_tool["dispatchTool"] = json!("aletheia_crystallise");

    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": protected_tool,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect_err("Aletheia internal tools require dispatch-time entitlement context");

    assert!(err.contains("entitlement"), "unexpected error: {err}");
    assert!(
        err.contains("aletheia.mode.active"),
        "unexpected error: {err}"
    );
}

#[test]
fn mediation_route_requires_every_aletheia_entitlement_grant() {
    let state = temp_env().home.join(".epi").join("gate");
    let evaluated_vak = evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'");

    let mut missing_tool = envelope();
    missing_tool["dispatchTool"] = json!("aletheia_crystallise");
    missing_tool["entitlementContext"] = json!({
        "effectiveTools": [],
        "roles": ["anima.dispatcher"],
        "session": { "aletheiaModeActive": true }
    });
    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": missing_tool,
            "evaluatedVak": evaluated_vak,
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect_err("the effective tool grant is required");
    assert!(err.contains("effectiveTools"), "unexpected error: {err}");

    let mut missing_role = envelope();
    missing_role["dispatchTool"] = json!("aletheia_crystallise");
    missing_role["entitlementContext"] = json!({
        "effectiveTools": ["aletheia_crystallise"],
        "roles": [],
        "session": { "aletheiaModeActive": true }
    });
    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": missing_role,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect_err("the Anima dispatcher role is required");
    assert!(err.contains("anima.dispatcher"), "unexpected error: {err}");

    let mut inactive_mode = envelope();
    inactive_mode["dispatchTool"] = json!("aletheia_crystallise");
    inactive_mode["entitlementContext"] = json!({
        "effectiveTools": ["aletheia_crystallise"],
        "roles": ["anima.dispatcher"],
        "session": { "aletheiaModeActive": false }
    });
    let err = anima::mediation_route(
        &state,
        &json!({
            "envelope": inactive_mode,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect_err("active Aletheia mode is required");
    assert!(
        err.contains("aletheia.mode.active"),
        "unexpected error: {err}"
    );
}

#[test]
fn mediation_route_accepts_aletheia_internal_tool_with_effective_entitlement() {
    let state = temp_env().home.join(".epi").join("gate");
    let mut protected_tool = envelope();
    protected_tool["dispatchTool"] = json!("aletheia_crystallise");
    protected_tool["entitlementContext"] = aletheia_entitlement("aletheia_crystallise");

    let result = anima::mediation_route(
        &state,
        &json!({
            "envelope": protected_tool,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(0/1/2)", "CFP3", "Night'"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect("an entitled Aletheia internal tool routes through live mediation");

    assert_eq!(
        result["dispatchTool"].as_str(),
        Some("aletheia_crystallise")
    );
    assert_eq!(result["outcome"].as_str(), Some("AletheiaDisclosure"));
}

#[test]
fn mediation_route_carries_vak_address_into_sessions_patch_for_session_affecting_calls() {
    let env = temp_env();
    let state = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&state).expect("session store boots");
    store
        .create("agent:anima:mediation")
        .expect("target session exists");

    let mut session_env = envelope();
    session_env["sessionAffecting"] = json!(true);
    session_env["targetSessionKey"] = json!("agent:anima:mediation");

    let result = anima::mediation_route(
        &state,
        &json!({
            "envelope": session_env,
            "evaluatedVak": evaluated("(4.0/1-4.4/5)", "(5/0)", "CFP0", "Day"),
            "upstreamEvidence": ["vak-evaluate"]
        }),
    )
    .expect("session-affecting mediation route succeeds");

    assert_eq!(
        result["sessionPatch"]["method"].as_str(),
        Some("sessions.patch")
    );
    let record = SessionStore::new(&state)
        .expect("store reopens")
        .resolve("agent:anima:mediation")
        .expect("session resolves after mediation patch");
    assert_eq!(
        record.vak_address.as_ref().map(|vak| vak.cf.as_str()),
        Some("(5/0)")
    );
}
