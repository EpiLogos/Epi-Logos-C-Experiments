use epi_s3_gateway::dispatch::{route_anima_invoke, AnimaInvokeRequest, AnimaInvokeResponse};
use epi_s3_gateway::{transcripts, SessionStore};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use tempfile::tempdir;

fn dialogical_compose_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Dialogical,
        ct: vec!["CT0".into()],
        cp: "CP4.0".into(),
        cf: "(00/00)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS1".into(),
            direction: CsDirection::Day,
        },
    }
}

#[test]
fn anima_invoke_routes_to_session_with_vak_address() {
    let tmp = tempdir().unwrap();
    let store = SessionStore::new(tmp.path()).unwrap();
    let _ = store.create("agent:anima:user-a").unwrap();
    let _ = store.create("agent:anima:user-b").unwrap();

    let req = AnimaInvokeRequest {
        target_session_key: "agent:anima:user-a".into(),
        task: "evaluate this VAK".into(),
        vak_address: dialogical_compose_vak(),
    };
    let resp: AnimaInvokeResponse = route_anima_invoke(&store, req).unwrap();
    assert_eq!(resp.dispatched_to, "agent:anima:user-a");
    assert!(resp.task_queued);

    // VAK address persisted on the target session
    let loaded = store.resolve("agent:anima:user-a").unwrap();
    assert_eq!(loaded.vak_address.as_ref().unwrap().cf, "(00/00)");
    assert_eq!(
        loaded.vak_address.as_ref().unwrap().cs.direction,
        CsDirection::Day
    );
}

#[test]
fn anima_invoke_appends_task_to_transcript() {
    let tmp = tempdir().unwrap();
    let store = SessionStore::new(tmp.path()).unwrap();
    let _ = store.create("agent:anima:user-c").unwrap();

    let req = AnimaInvokeRequest {
        target_session_key: "agent:anima:user-c".into(),
        task: "first invocation".into(),
        vak_address: dialogical_compose_vak(),
    };
    route_anima_invoke(&store, req).unwrap();

    // Read back transcript via the canonical loader — find a message tagged
    // anima_invoke with the task body.
    let entries = transcripts::read_entries(store.gate_root(), "agent:anima:user-c").unwrap();
    let found = entries
        .iter()
        .any(|m| m.role.contains("anima_invoke") && m.message.contains("first invocation"));
    assert!(
        found,
        "task should be appended to transcript as anima_invoke message"
    );
}

#[test]
fn anima_invoke_returns_error_for_unknown_session() {
    let tmp = tempdir().unwrap();
    let store = SessionStore::new(tmp.path()).unwrap();
    // No create() — target session does not exist

    let req = AnimaInvokeRequest {
        target_session_key: "agent:anima:nobody".into(),
        task: "x".into(),
        vak_address: dialogical_compose_vak(),
    };
    let result = route_anima_invoke(&store, req);
    assert!(result.is_err(), "unknown target session should error");
}
