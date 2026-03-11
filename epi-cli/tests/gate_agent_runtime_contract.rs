mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn live_gateway_exposes_health_status_and_wake_surfaces() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    for (method, params) in [
        ("health", json!({})),
        ("status", json!({})),
        ("wake", json!({"mode":"now","text":"gateway parity wake"})),
    ] {
        let result = client.request(method, params).await.unwrap_or_else(|err| {
            panic!("{method} should be available at runtime: {}", err.message)
        });
        assert!(
            result.is_object(),
            "{method} should return an object result"
        );
    }
}

#[tokio::test]
async fn agent_lane_accepts_runs_and_unknown_waits_timeout_cleanly() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"gateway parity runtime contract",
                "idempotencyKey":"gate-agent-runtime-contract",
            }),
        )
        .await
        .expect("agent should accept a live run");

    assert!(
        accepted["runId"].as_str().is_some(),
        "agent should return a run id"
    );

    let wait = client
        .request(
            "agent.wait",
            json!({
                "runId":"missing-run",
                "timeoutMs": 1,
            }),
        )
        .await
        .expect("agent.wait should return a timeout snapshot for unknown runs");

    assert_eq!(wait["status"], "timeout");
}
