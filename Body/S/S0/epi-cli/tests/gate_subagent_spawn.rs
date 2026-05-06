mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn subagent_runs_inherit_parent_context_and_persist_child_history() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18829).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    client
        .request(
            "agent",
            json!({
                "sessionKey":"agent:main:main",
                "message":"seed parent session",
                "idempotencyKey":"gate-subagent-parent-seed",
                "groupId":"group-parent",
                "groupChannel":"ops",
                "groupSpace":"alpha",
            }),
        )
        .await
        .expect("parent session should be seeded");

    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey":"agent:main:main",
                "vaultNowPath":"/vault/Present/11-03-2026/now.md",
                "label":"Parent Session",
            }),
        )
        .await
        .expect("parent patch should succeed");

    let child_key = "agent:vak:subagent:child-1";
    let accepted = client
        .request(
            "agent",
            json!({
                "sessionKey":child_key,
                "message":"investigate child lineage",
                "idempotencyKey":"gate-subagent-child-run",
                "spawnedBy":"agent:main:main",
                "label":"Vak Child",
            }),
        )
        .await
        .expect("subagent run should be accepted");

    assert_eq!(accepted["status"], "accepted");
    let run_id = accepted["runId"]
        .as_str()
        .expect("accepted response should include run id")
        .to_owned();

    let waited = client
        .request("agent.wait", json!({ "runId": run_id, "timeoutMs": 2_000 }))
        .await
        .expect("child run should finish");
    assert_eq!(waited["status"], "ok");

    let session = client
        .request("sessions.resolve", json!({ "sessionKey": child_key }))
        .await
        .expect("child session should resolve");

    assert_eq!(session["spawnedBy"], "agent:main:main");
    assert_eq!(session["groupId"], "group-parent");
    assert_eq!(session["groupChannel"], "ops");
    assert_eq!(session["groupSpace"], "alpha");
    assert_eq!(session["vaultNowPath"], "/vault/Present/11-03-2026/now.md");
    assert_eq!(session["activeAgentId"], "vak");
    assert_eq!(session["subagentLineage"], json!(["main", "vak"]));

    let history = client
        .request("chat.history", json!({ "sessionKey": child_key }))
        .await
        .expect("child transcript should be queryable");
    let messages = history["messages"]
        .as_array()
        .expect("history should contain messages");
    assert!(messages.len() >= 2);
    assert_eq!(messages[0]["role"], "user");
    assert_eq!(messages[1]["role"], "assistant");
}
