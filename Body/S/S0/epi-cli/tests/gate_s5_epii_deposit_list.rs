//! 26.T26.10 — `s5'.epii.deposit.list` reads deposits back out.
//!
//! The write path (`s5'.epii.deposit`) submits into the review store, so the
//! read is a PROJECTION of that store. These tests drive both halves over a
//! real spawned gateway: what goes in through the write method must come back
//! out through the read one, which is the only way to know the two agree.
//!
//! The Evidence fold (26.T26.4) has been rendering its honest-empty state
//! because this sibling did not exist — the write had no reader.

mod support;

use serde_json::{json, Value};
use support::TestGatewayClient;

fn deposit(session_key: &str, kind: &str, title: &str) -> Value {
    json!({
        "source_agent": "anima",
        "source_coordinate": "S4-4'",
        "deposit_type": kind,
        "title": title,
        "body": format!("body of {title}"),
        "artifact": { "path": format!("Idea/Empty/Present/{title}.md") },
        "session_key": session_key,
        "requires_human": false
    })
}

async fn deposit_all(client: &mut TestGatewayClient, requests: &[Value]) {
    for request in requests {
        client
            .request("s5'.epii.deposit", request.clone())
            .await
            .expect("s5'.epii.deposit should accept the deposit");
    }
}

#[tokio::test]
async fn a_deposited_item_comes_back_out_of_the_list() {
    let mut client = TestGatewayClient::connected_with_temp_store(18997).await;

    deposit_all(
        &mut client,
        &[deposit("session-a", "review_item", "first-deposit")],
    )
    .await;

    let listed = client
        .request("s5'.epii.deposit.list", json!({}))
        .await
        .expect("s5'.epii.deposit.list should be gateway-callable");

    assert_eq!(listed["matched"], 1);
    assert_eq!(listed["returned"], 1);
    assert_eq!(listed["governance_owner"], "S5'");

    let entry = &listed["deposits"][0];
    assert_eq!(entry["title"], "first-deposit");
    assert_eq!(entry["body"], "body of first-deposit");
    assert_eq!(entry["depositType"], "review_item");
    assert_eq!(entry["sourceAgent"], "anima");
    assert_eq!(entry["sourceCoordinate"], "S4-4'");
    assert_eq!(entry["sessionKey"], "session-a");
    assert_eq!(entry["requiresHuman"], false);
    assert_eq!(entry["artifact"]["path"], "Idea/Empty/Present/first-deposit.md");
    // the review item id is what a reviewer resolves against — it has to survive
    assert!(entry["itemId"].as_str().is_some_and(|id| !id.is_empty()));
}

#[tokio::test]
async fn the_list_filters_by_deposit_type_and_by_session() {
    let mut client = TestGatewayClient::connected_with_temp_store(18998).await;

    deposit_all(
        &mut client,
        &[
            deposit("session-a", "review_item", "a-review"),
            deposit("session-a", "improvement_request", "a-improvement"),
            deposit("session-b", "review_item", "b-review"),
        ],
    )
    .await;

    let by_type = client
        .request(
            "s5'.epii.deposit.list",
            json!({ "depositType": "improvement_request" }),
        )
        .await
        .expect("depositType filter should answer");
    assert_eq!(by_type["matched"], 1);
    assert_eq!(by_type["deposits"][0]["title"], "a-improvement");

    let by_session = client
        .request("s5'.epii.deposit.list", json!({ "sessionKey": "session-a" }))
        .await
        .expect("sessionKey filter should answer");
    assert_eq!(by_session["matched"], 2);
    let titles: Vec<&str> = by_session["deposits"]
        .as_array()
        .expect("deposits should be a list")
        .iter()
        .map(|entry| entry["title"].as_str().unwrap_or_default())
        .collect();
    assert!(titles.contains(&"a-review"));
    assert!(titles.contains(&"a-improvement"));
    assert!(!titles.contains(&"b-review"));
}

#[tokio::test]
async fn limit_truncates_the_page_but_matched_still_reports_the_whole_set() {
    let mut client = TestGatewayClient::connected_with_temp_store(18999).await;

    deposit_all(
        &mut client,
        &[
            deposit("session-a", "review_item", "one"),
            deposit("session-a", "review_item", "two"),
            deposit("session-a", "review_item", "three"),
        ],
    )
    .await;

    let page = client
        .request("s5'.epii.deposit.list", json!({ "limit": 2 }))
        .await
        .expect("limit should answer");

    // The load-bearing distinction: a page is not the set. Passing `limit`
    // through to the store's own filter would truncate BEFORE deposits are
    // separated from plain review items, so a caller asking for two deposits
    // could receive fewer and never know.
    assert_eq!(page["returned"], 2);
    assert_eq!(page["matched"], 3);
    assert_eq!(page["deposits"].as_array().map(Vec::len), Some(2));
}

#[tokio::test]
async fn an_empty_store_answers_an_honest_empty_set() {
    let mut client = TestGatewayClient::connected_with_temp_store(19001).await;

    let listed = client
        .request("s5'.epii.deposit.list", json!({}))
        .await
        .expect("an empty store should still answer");

    assert_eq!(listed["matched"], 0);
    assert_eq!(listed["returned"], 0);
    assert_eq!(listed["deposits"], json!([]));
}

#[tokio::test]
async fn an_unknown_status_is_refused_rather_than_silently_ignored() {
    let mut client = TestGatewayClient::connected_with_temp_store(19002).await;

    let refused = client
        .request("s5'.epii.deposit.list", json!({ "status": "archived" }))
        .await;
    assert!(
        refused.is_err(),
        "an unknown status must be refused — silently returning every status \
         would answer a narrower question than the caller asked"
    );

    // the three real ones are accepted
    for status in ["open", "resolved", "deferred"] {
        client
            .request("s5'.epii.deposit.list", json!({ "status": status }))
            .await
            .unwrap_or_else(|error| panic!("status {status} should be accepted: {error:?}"));
    }
}

// 26.T26.4 producer substrate: a MediatedRunEvidencePacket needs deposition
// anchors that a dispatch run cannot know. They ride the deposit and have to
// survive the review-store round trip, or the packet cannot be composed on the
// far side.
#[tokio::test]
async fn evidence_anchors_survive_the_deposit_round_trip() {
    let mut client = TestGatewayClient::connected_with_temp_store(19003).await;

    let mut request = deposit("session-a", "review_item", "anchored-deposit");
    request["evidence_anchors"] = json!({
        "candidate_id": "cand-7",
        "graph_anchor": "bimba://M5-4/evidence",
        "review_id": "rev-7",
        "test_anchor": "tests/e2e/evidence-deposition-loop.spec.ts",
        "privacy_class": "safe-public-current-kernel-tick"
    });
    deposit_all(&mut client, &[request]).await;

    let listed = client
        .request("s5'.epii.deposit.list", json!({}))
        .await
        .expect("s5'.epii.deposit.list should be gateway-callable");

    let anchors = &listed["deposits"][0]["evidenceAnchors"];
    assert_eq!(anchors["candidate_id"], "cand-7");
    assert_eq!(anchors["graph_anchor"], "bimba://M5-4/evidence");
    assert_eq!(anchors["review_id"], "rev-7");
    assert_eq!(
        anchors["test_anchor"],
        "tests/e2e/evidence-deposition-loop.spec.ts"
    );
    assert_eq!(anchors["privacy_class"], "safe-public-current-kernel-tick");
}

// A deposit that is not evidence for a run carries no anchors, and that has to
// read as ABSENT rather than as a packet with empty ones.
#[tokio::test]
async fn a_deposit_without_anchors_reports_them_absent_rather_than_empty() {
    let mut client = TestGatewayClient::connected_with_temp_store(19004).await;

    deposit_all(
        &mut client,
        &[deposit("session-a", "review_item", "plain-deposit")],
    )
    .await;

    let listed = client
        .request("s5'.epii.deposit.list", json!({}))
        .await
        .expect("s5'.epii.deposit.list should be gateway-callable");

    assert!(
        listed["deposits"][0]["evidenceAnchors"].is_null(),
        "an un-anchored deposit must not present as an anchored one"
    );
}
