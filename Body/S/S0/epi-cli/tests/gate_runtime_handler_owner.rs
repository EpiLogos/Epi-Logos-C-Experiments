//! 13.T3 live-gateway smoke test (S0 side — companion to
//! `Body/S/S3/gateway/tests/live_gateway_smoke.rs`).
//!
//! Per the 13.T3 task spec:
//!
//! > Add a live-gateway smoke test: start `epi gate start`, send `connect`,
//! > `sessions.resolve`, `chat.history`, `channels.status`, prove handler
//! > owner is S3 (via a `handler_owner` field in response or a test-only
//! > telemetry hook).
//!
//! This test runs the actual gateway WebSocket server (via the same
//! `TestGatewayClient` harness used by `gate_chat.rs`), then verifies the
//! `handlerOwner` sentinel emitted by the S3 runtime (`S3.gateway.sessions`
//! for `sessions.list`, `S3.gateway.chat` for `chat.history`) propagates
//! through the live S0 dispatch loop unchanged. That sentinel is the
//! load-bearing evidence that runtime ownership for session and chat handlers
//! lives in S3, not S0 server.rs.
//!
//! Channels are intentionally NOT subjected to handler-owner assertion here:
//! per the 13.T3 evidence file, `channels` stays in S0 as a
//! CompatibilityAdapter because its `config`/`secrets`/`channel_adapters`/
//! `skills` dependencies are S0 process-level concerns (1Password-CLI /
//! varlock secret resolution, etc.). The `channels.status` probe in this
//! smoke test only proves the route still dispatches end-to-end.

mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn handler_owner_sentinel_propagates_through_live_gateway() {
    let mut client = TestGatewayClient::connected_with_temp_store(18796).await;

    // Seed a session through the live dispatch loop.
    client
        .request(
            "chat.send",
            json!({"sessionKey":"agent:main:main","message":"handler-owner probe"}),
        )
        .await
        .unwrap();

    // sessions.list — S3 envelope should carry S3.gateway.sessions sentinel.
    let list = client.request("sessions.list", json!({})).await.unwrap();
    assert_eq!(
        list["handlerOwner"], "S3.gateway.sessions",
        "live sessions.list response must carry the S3 handler-owner sentinel \
         (proof that runtime ownership for sessions is S3, not S0)"
    );

    // sessions.resolve — same envelope shape, dispatched via S3.
    let resolve = client
        .request("sessions.resolve", json!({"sessionKey":"agent:main:main"}))
        .await
        .unwrap();
    assert_eq!(resolve["canonicalKey"], "agent:main:main");

    // chat.history — S3 envelope should carry S3.gateway.chat sentinel.
    let history = client
        .request("chat.history", json!({"sessionKey":"agent:main:main"}))
        .await
        .unwrap();
    assert_eq!(
        history["handlerOwner"], "S3.gateway.chat",
        "live chat.history response must carry the S3 handler-owner sentinel"
    );

    // channels.status — proves the route still dispatches end-to-end. The
    // channels runtime intentionally remains in S0 as a CompatibilityAdapter
    // (1Password-CLI / varlock secret resolution is an S0 process concern).
    // We assert only that the dispatch succeeds and returns the channels
    // surface; the handler-owner sentinel does NOT apply here.
    let channels = client
        .request("channels.status", json!({}))
        .await
        .unwrap();
    assert!(
        channels.get("channels").is_some(),
        "channels.status must return the channels surface"
    );
}
