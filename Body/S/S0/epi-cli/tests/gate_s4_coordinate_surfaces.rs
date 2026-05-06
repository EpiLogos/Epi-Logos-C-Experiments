mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn s4_coordinate_agent_psyche_and_permission_surfaces_are_gateway_callable() {
    let mut client = TestGatewayClient::connected_with_temp_store(18872).await;

    let status = client
        .request(
            "s4.agent.status",
            json!({
                "agentId": "anima",
                "sessionKey": "s4:anima:runtime",
            }),
        )
        .await
        .expect("S4 agent status should be reachable");

    assert_eq!(status["owner"], "S4");
    assert_eq!(status["agentId"], "anima");
    assert_eq!(status["sessionKey"], "s4:anima:runtime");
    assert_eq!(status["state"], "available");
    assert_eq!(status["coordinateContext"]["s"], "S4");
    assert_eq!(status["coordinateContext"]["sPrime"], "S4'");

    let query = client
        .request(
            "s4.agent.query",
            json!({
                "targetAgent": "epii",
                "method": "s5'.review.inbox",
                "sessionKey": "s4:anima:runtime",
                "params": { "status": "open" },
            }),
        )
        .await
        .expect("S4 agent query should return an async ack");

    assert_eq!(query["status"], "accepted");
    assert_eq!(query["targetAgent"], "epii");
    assert_eq!(
        query["resultChannel"],
        format!("agent.result.{}", query["ackId"].as_str().unwrap())
    );
    assert!(client
        .gate_root()
        .join("s4")
        .join("agent-events.jsonl")
        .exists());

    let notify = client
        .request(
            "s4.agent.notify",
            json!({
                "targetAgent": "anima",
                "kind": "session.boundary",
                "sessionKey": "s4:anima:runtime",
                "payload": { "phase": "handoff" },
            }),
        )
        .await
        .expect("S4 agent notification should return a receipt");

    assert_eq!(notify["status"], "delivered");
    assert_eq!(notify["kind"], "session.boundary");
    assert_eq!(notify["targetAgent"], "anima");

    let initial_psyche = client
        .request(
            "s4'.psyche.state",
            json!({
                "sessionKey": "s4:anima:runtime",
            }),
        )
        .await
        .expect("Psyche state should be readable");

    assert_eq!(initial_psyche["owner"], "S4'");
    assert_eq!(initial_psyche["state"]["visibilityStance"], "observable");
    assert_eq!(
        initial_psyche["state"]["currentSubtasks"]
            .as_array()
            .unwrap()
            .len(),
        0
    );

    let updated = client
        .request(
            "s4'.psyche.update",
            json!({
                "sessionKey": "s4:anima:runtime",
                "patch": {
                    "currentTask": "stabilise S4 coordinate runtime",
                    "currentSubtasks": ["agent status", "psyche state", "permission boundary"],
                    "activeArtifactSet": ["Body/S/S0/epi-cli/src/gate/anima.rs"],
                    "runLocalContinuity": { "phase": "s4-tranche" }
                },
            }),
        )
        .await
        .expect("Psyche state should accept a bounded patch");

    assert_eq!(
        updated["state"]["currentTask"],
        "stabilise S4 coordinate runtime"
    );
    assert_eq!(
        updated["state"]["runLocalContinuity"]["phase"],
        "s4-tranche"
    );

    let reread = client
        .request(
            "s4'.psyche.state",
            json!({
                "sessionKey": "s4:anima:runtime",
            }),
        )
        .await
        .expect("Psyche update should persist through the gateway state store");

    assert_eq!(reread["state"]["currentSubtasks"][2], "permission boundary");

    let permission = client
        .request(
            "s4'.permission.get",
            json!({
                "agentId": "anima",
                "sessionKey": "s4:anima:runtime",
            }),
        )
        .await
        .expect("permission boundary should be gateway-callable");

    assert_eq!(permission["owner"], "S4'");
    assert_eq!(permission["agentId"], "anima");
    assert_eq!(permission["boundary"]["mayInvokeBoundedSkill"], true);
    assert_eq!(permission["boundary"]["mayResolveEpiiReview"], false);
    assert!(permission["boundary"]["forbidden"]
        .as_array()
        .unwrap()
        .iter()
        .any(|value| value == "bypass_epii_inbox"));
}
