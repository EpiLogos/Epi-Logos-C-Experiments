use std::time::Duration;

use epi_s3_gateway::runtime::GatewayRuntimeState;
use epi_s3_gateway_contract::{GatewayEvent, RunContext, RunSnapshot};
use serde_json::json;
use tokio::time::timeout;

#[test]
fn runtime_tracks_run_context_sequence_and_snapshots() {
    let state = GatewayRuntimeState::default();
    let context = RunContext::new("run-1", "agent:main:main", "agent");

    state.register_run(context.clone());
    state.cache_snapshot(RunSnapshot::ok("run-1", "agent:main:main", 10, 20));

    assert_eq!(state.run_context("run-1"), Some(context));
    assert_eq!(
        state.session_key_for_run("run-1").as_deref(),
        Some("agent:main:main")
    );
    assert_eq!(state.next_seq("run-1"), 1);
    assert_eq!(state.next_seq("run-1"), 2);
    assert_eq!(state.snapshot("run-1").unwrap().status, "ok");
}

#[test]
fn runtime_lists_snapshots_by_session_for_gateway_run_state_projection() {
    let state = GatewayRuntimeState::default();
    state.cache_snapshot(RunSnapshot {
        run_id: "run-later".to_owned(),
        session_key: "agent:main:main".to_owned(),
        status: "running".to_owned(),
        started_at_ms: 20,
        ended_at_ms: None,
        error: None,
    });
    state.cache_snapshot(RunSnapshot::ok("run-earlier", "agent:main:main", 10, 15));
    state.cache_snapshot(RunSnapshot::ok("run-other", "agent:other:main", 5, 6));

    let run_ids = state
        .snapshots_for_session("agent:main:main")
        .into_iter()
        .map(|snapshot| snapshot.run_id)
        .collect::<Vec<_>>();

    assert_eq!(run_ids, vec!["run-earlier", "run-later"]);
}

#[tokio::test]
async fn runtime_broadcasts_to_active_subscribers_only() {
    let state = GatewayRuntimeState::default();
    let mut subscription = state.subscribe();

    state.broadcast(GatewayEvent::new(
        "chat",
        Some("run-chat"),
        Some("agent:main:main"),
        Some(1),
        json!({"state":"delta"}),
    ));

    let first = timeout(Duration::from_millis(100), subscription.recv())
        .await
        .expect("listener should receive first event")
        .expect("event should be delivered");
    assert_eq!(first.channel, "chat");

    state.unsubscribe(subscription.id());
    state.broadcast(GatewayEvent::new(
        "chat",
        Some("run-chat"),
        Some("agent:main:main"),
        Some(2),
        json!({"state":"final"}),
    ));

    let second = timeout(Duration::from_millis(50), subscription.recv()).await;
    assert!(
        matches!(second, Err(_) | Ok(None)),
        "unsubscribed listeners should not receive events"
    );
}

#[test]
fn runtime_tracks_chat_run_process_without_process_handles_for_contract_tests() {
    let state = GatewayRuntimeState::default();

    state.add_chat_run("agent:main:main", "run-chat");
    state.mark_chat_aborted("run-chat");

    assert_eq!(state.active_chat_runs("agent:main:main"), vec!["run-chat"]);
    assert!(state.take_chat_aborted("run-chat"));
    assert!(!state.take_chat_aborted("run-chat"));
    assert_eq!(
        state.remove_chat_run("run-chat").as_deref(),
        Some("agent:main:main")
    );
    assert!(state.active_chat_runs("agent:main:main").is_empty());
}
