mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn agent_wait_returns_completed_snapshot_after_run_finishes() {
    let mut client = TestGatewayClient::connected_with_temp_store(18826).await;

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"wait for cached completion",
                "idempotencyKey":"gate-agent-wait-complete",
            }),
        )
        .await
        .expect("agent should accept a fake-pi backed run");
    let run_id = accepted["runId"]
        .as_str()
        .expect("accepted run should include run id")
        .to_owned();

    let finished = client
        .request(
            "agent.wait",
            json!({
                "runId": run_id,
                "timeoutMs": 2_000,
            }),
        )
        .await
        .expect("agent.wait should observe the completed run");

    assert_eq!(finished["status"], "ok");
    assert!(finished["startedAt"].as_u64().is_some());
    assert!(finished["endedAt"].as_u64().is_some());
    assert!(finished["error"].is_null());
}

#[tokio::test]
async fn agent_wait_returns_error_snapshot_when_pi_launch_fails() {
    let env = TestEnv::repo_with_pi().with_env("PATH", "/tmp/empty-pi-path");
    let mut client = TestGatewayClient::connect(env, 18827).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"this run should fail without pi installed",
                "idempotencyKey":"gate-agent-wait-error",
            }),
        )
        .await
        .expect("agent should still accept before the background launch fails");
    let run_id = accepted["runId"]
        .as_str()
        .expect("accepted run should include run id")
        .to_owned();

    let failed = client
        .request(
            "agent.wait",
            json!({
                "runId": run_id,
                "timeoutMs": 2_000,
            }),
        )
        .await
        .expect("agent.wait should surface the failed run snapshot");

    assert_eq!(failed["status"], "error");
    assert!(failed["endedAt"].as_u64().is_some());
    assert!(failed["error"]
        .as_str()
        .expect("failed run should include error text")
        .contains("failed to launch pi"));
}

#[tokio::test]
async fn agent_wait_times_out_cleanly_for_unknown_run() {
    let mut client = TestGatewayClient::connected_with_temp_store(18828).await;

    let wait = client
        .request(
            "agent.wait",
            json!({
                "runId":"missing-run",
                "timeoutMs": 1,
            }),
        )
        .await
        .expect("unknown runs should resolve to timeout snapshots");

    assert_eq!(wait["status"], "timeout");
}
