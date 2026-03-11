use std::time::Duration;

use epi_logos::gate::{
    events::GatewayEvent,
    runs::{RunContext, RunSnapshot},
    runtime::GatewayRuntimeState,
};
use serde_json::json;
use tokio::time::timeout;

#[test]
fn registering_run_context_tracks_session_keys_by_run() {
    let state = GatewayRuntimeState::default();
    let context = RunContext::new("run-1", "agent:main:main", "agent");

    state.register_run(context.clone());

    assert_eq!(state.run_context("run-1"), Some(context));
    assert_eq!(
        state.session_key_for_run("run-1").as_deref(),
        Some("agent:main:main")
    );
}

#[test]
fn per_run_sequence_numbers_are_monotonic() {
    let state = GatewayRuntimeState::default();

    assert_eq!(state.next_seq("run-a"), 1);
    assert_eq!(state.next_seq("run-a"), 2);
    assert_eq!(state.next_seq("run-b"), 1);
    assert_eq!(state.next_seq("run-a"), 3);
}

#[tokio::test]
async fn listener_subscription_and_unsubscription_control_broadcast_delivery() {
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
        .expect("listener should receive the first event")
        .expect("event should be delivered");
    assert_eq!(first.channel, "chat");
    assert_eq!(first.run_id.as_deref(), Some("run-chat"));

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
fn cached_run_snapshots_support_wait_lookups() {
    let state = GatewayRuntimeState::default();
    let snapshot = RunSnapshot::ok("run-1", "agent:main:main", 10, 20);

    state.cache_snapshot(snapshot.clone());

    assert_eq!(state.snapshot("run-1"), Some(snapshot));
}
