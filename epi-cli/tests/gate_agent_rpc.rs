mod support;

use std::fs;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn agent_returns_accepted_snapshot_and_patches_session_before_execution() {
    let env = TestEnv::with_fake_pi();
    let fake_pi_log = env.fake_pi_log.clone();
    let mut client = TestGatewayClient::connect(env, 18824).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"run the real gateway agent lane",
                "idempotencyKey":"gate-agent-rpc-accepted",
                "channel":"telegram",
                "threadId":"thread-42",
                "groupId":"group-42",
                "groupChannel":"squad",
                "groupSpace":"ops",
            }),
        )
        .await
        .expect("agent should accept the request");

    assert_eq!(accepted["status"], "accepted");
    assert!(accepted["acceptedAt"].as_u64().is_some());
    let run_id = accepted["runId"]
        .as_str()
        .expect("accepted agent response should include run id")
        .to_owned();

    let session = client
        .request("sessions.resolve", json!({"sessionKey":"agent:main:main"}))
        .await
        .expect("session should be queryable immediately after acceptance");

    assert_eq!(session["channel"], "telegram");
    assert_eq!(session["threadId"], "thread-42");
    assert_eq!(session["groupId"], "group-42");
    assert_eq!(session["groupChannel"], "squad");
    assert_eq!(session["groupSpace"], "ops");

    let waited = client
        .request(
            "agent.wait",
            json!({
                "runId": run_id,
                "timeoutMs": 2_000,
            }),
        )
        .await
        .expect("completed fake-pi run should be observable");
    assert_eq!(waited["status"], "ok");

    let argv = fs::read_to_string(fake_pi_log.join("argv.txt"))
        .expect("fake pi argv log should be written once background process launches");
    assert!(argv.contains("spawn"));
    assert!(argv.contains("run the real gateway agent lane"));
}

#[tokio::test]
async fn agent_rejects_invalid_request_shapes() {
    let mut client = TestGatewayClient::connected_with_temp_store(18825).await;

    let err = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
            }),
        )
        .await
        .expect_err("missing message should be rejected");

    assert!(err.message.contains("message must be a string"));
}
