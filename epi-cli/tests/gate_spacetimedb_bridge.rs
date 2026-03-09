mod support;

use epi::gate::{
    sessions::SessionStore,
    spacetimedb_bridge::SpacetimeBridge,
    system,
};
use serde_json::json;
use support::{temp_env, TestGatewayClient};

#[test]
fn bridge_emits_session_presence_activity_and_m_clock_surfaces() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let store = SessionStore::new(&gate_root).unwrap();
    let session = store.create("agent:main:main").unwrap();
    store
        .add_alias(&session.canonical_key, "NOW-2026-03-07-main")
        .unwrap();
    system::set_heartbeats(&gate_root, &json!({ "operator-1": "ready" })).unwrap();

    let bridge = SpacetimeBridge::new(&gate_root).unwrap();
    bridge.publish_presence("operator-1").unwrap();
    bridge
        .publish_session("agent:main:main", Some("NOW-2026-03-07-main"))
        .unwrap();
    bridge
        .publish_activity_event("gateway.tick", json!({ "phase": "heartbeat" }))
        .unwrap();
    bridge.publish_m_clock_placeholder("M0").unwrap();

    let events = bridge.drain_test_events().unwrap();

    assert!(events.iter().any(|event| {
        event.kind == "presence"
            && event.payload["operatorId"] == "operator-1"
            && event.payload["heartbeats"]["operator-1"] == "ready"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "session_surface"
            && event.payload["canonicalKey"] == "agent:main:main"
            && event.payload["aliases"]
                .as_array()
                .unwrap()
                .iter()
                .any(|alias| alias == "NOW-2026-03-07-main")
    }));
    assert!(events.iter().any(|event| {
        event.kind == "activity_event" && event.payload["kind"] == "gateway.tick"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "m_clock_state" && event.payload["clock"] == "M0"
    }));
}

#[tokio::test]
async fn gateway_rpc_publishes_bridge_events_for_real_state_changes() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    client
        .request(
            "set-heartbeats",
            json!({ "heartbeats": { "operator-1": "ready" } }),
        )
        .await
        .unwrap();
    client
        .request(
            "chat.send",
            json!({ "sessionKey": "agent:main:main", "message": "hello now" }),
        )
        .await
        .unwrap();
    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "aliases": ["NOW-2026-03-07-main"],
                "activeAgentId": "pi.agent"
            }),
        )
        .await
        .unwrap();
    client
        .request(
            "system-event",
            json!({ "kind": "gateway.tick", "payload": { "phase": "heartbeat" } }),
        )
        .await
        .unwrap();

    let bridge = SpacetimeBridge::new(client.gate_root()).unwrap();
    let events = bridge.drain_test_events().unwrap();

    assert!(events.iter().any(|event| event.kind == "m_clock_state"));
    assert!(events.iter().any(|event| {
        event.kind == "presence" && event.payload["heartbeats"]["operator-1"] == "ready"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "session_surface"
            && event.payload["canonicalKey"] == "agent:main:main"
            && event.payload["activeAgentId"] == "pi.agent"
    }));
    assert!(events.iter().any(|event| {
        event.kind == "activity_event" && event.payload["kind"] == "gateway.tick"
    }));
}
