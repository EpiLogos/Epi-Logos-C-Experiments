mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn agent_rejects_subagent_session_without_spawned_by() {
    let mut client = TestGatewayClient::connected_with_temp_store(18830).await;

    let err = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:vak:subagent:child-1",
                "message":"missing parent linkage",
            }),
        )
        .await
        .expect_err("subagent sessions should require spawnedBy");

    assert!(err.message.contains("spawnedBy"));
}

#[tokio::test]
async fn agent_rejects_nested_subagent_spawns() {
    let mut client = TestGatewayClient::connected_with_temp_store(18831).await;
    let child_key = "agent:vak:subagent:child-parent";

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":child_key,
                "message":"first child run",
                "spawnedBy":"agent:main:main",
                "idempotencyKey":"gate-lineage-first-child",
            }),
        )
        .await
        .expect("first child should be allowed");
    let run_id = accepted["runId"].as_str().unwrap().to_owned();
    client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("first child should finish");

    let err = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:ops:subagent:grandchild-1",
                "message":"attempt nested spawn",
                "spawnedBy":child_key,
            }),
        )
        .await
        .expect_err("subagents should not be allowed to spawn further subagents");

    assert!(err.message.contains("subagent"));
}

#[tokio::test]
async fn sessions_patch_rejects_non_subagent_spawned_by_and_immutable_rewrites() {
    let mut client = TestGatewayClient::connected_with_temp_store(18832).await;

    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"seed top-level session",
                "idempotencyKey":"gate-lineage-root-seed",
            }),
        )
        .await
        .expect("top-level seed should succeed");
    let run_id = accepted["runId"].as_str().unwrap().to_owned();
    client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("top-level seed should finish");

    let top_level_err = client
        .request(
            "sessions.patch",
            json!({
                "sessionKey":"agent:main:main",
                "spawnedBy":"agent:root:main",
            }),
        )
        .await
        .expect_err("top-level sessions should not accept spawnedBy");
    assert!(top_level_err.message.contains("subagent"));

    let child_key = "agent:vak:subagent:patch-child";
    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":child_key,
                "message":"seed child for patch contract",
                "spawnedBy":"agent:main:main",
                "idempotencyKey":"gate-lineage-patch-child",
            }),
        )
        .await
        .expect("child seed should succeed");
    let run_id = accepted["runId"].as_str().unwrap().to_owned();
    client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("seeded child should finish");

    let rewrite_err = client
        .request(
            "sessions.patch",
            json!({
                "sessionKey":child_key,
                "spawnedBy":"agent:other:main",
            }),
        )
        .await
        .expect_err("spawnedBy should be immutable once set");
    assert!(rewrite_err.message.contains("cannot be changed"));
}
