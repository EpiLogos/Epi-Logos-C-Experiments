mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn s5_review_gateway_persists_inbox_and_resolutions() {
    let mut client = TestGatewayClient::connected_with_temp_store(18901).await;

    let submitted = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "anima",
                "title": "Review compiler plan",
                "body": "Anima requests Epii validation before promotion.",
                "priority": "high",
                "coordinate_context": {
                    "coordinate": "S1/S1'",
                    "agent_id": "anima"
                },
                "requires_human": false
            }),
        )
        .await
        .expect("review submit should succeed");

    let item_id = submitted["item"]["item_id"]
        .as_str()
        .expect("submitted item id")
        .to_owned();
    assert_eq!(submitted["item"]["status"], "open");

    let inbox = client
        .request(
            "s5'.review.inbox",
            json!({"status": "open", "source": "anima"}),
        )
        .await
        .expect("review inbox should load");

    assert_eq!(inbox["items"].as_array().unwrap().len(), 1);
    assert_eq!(inbox["items"][0]["item_id"], item_id);

    let resolved = client
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": item_id,
                "decision": "approve",
                "rationale": "Compiler dry run is acceptable.",
                "resolved_by": "epii"
            }),
        )
        .await
        .expect("non-human-gated review should resolve by Epii");

    assert_eq!(resolved["resolution"]["decision"], "approve");
    assert_eq!(resolved["resolution"]["resolved_by"], "epii");

    let history = client
        .request("s5'.review.history", json!({}))
        .await
        .expect("review history should load");

    assert_eq!(history["items"].as_array().unwrap().len(), 1);
    assert_eq!(history["items"][0]["status"], "resolved");
    assert_eq!(history["resolutions"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn s5_review_gateway_preserves_human_gate() {
    let mut client = TestGatewayClient::connected_with_temp_store(18902).await;
    let submitted = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "human_gate",
                "title": "Approve live graph mutation",
                "body": "A destructive graph operation needs human validation.",
                "priority": "blocking",
                "coordinate_context": {"coordinate": "S2/S2'"},
                "requires_human": true
            }),
        )
        .await
        .expect("human review submit should succeed");

    let item_id = submitted["item"]["item_id"].as_str().unwrap().to_owned();
    let rejected = client
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": item_id,
                "decision": "approve",
                "rationale": "Agent cannot supply this validation.",
                "resolved_by": "epii"
            }),
        )
        .await
        .expect_err("agent approval must not satisfy human gate");

    assert!(rejected.message.contains("requires human resolution"));
}
