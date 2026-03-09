mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn node_invoke_records_result_for_later_lookup() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let pair_request = client
        .request("node.pair.request", json!({"node":"alpha"}))
        .await
        .unwrap();
    let pair_list = client.request("node.pair.list", json!({})).await.unwrap();
    let pair_approve = client
        .request("node.pair.approve", json!({"node":"alpha"}))
        .await
        .unwrap();
    let verify = client
        .request("node.pair.verify", json!({"node":"alpha"}))
        .await
        .unwrap();
    let run = client
        .request("node.invoke", json!({"node":"alpha","command":"inspect"}))
        .await
        .unwrap();
    let result_id = run["resultId"].as_str().unwrap().to_owned();
    let result = client
        .request("node.invoke.result", json!({"resultId":result_id}))
        .await
        .unwrap();
    let list = client.request("node.list", json!({})).await.unwrap();
    let describe = client
        .request("node.describe", json!({"node":"alpha"}))
        .await
        .unwrap();
    let rename = client
        .request("node.rename", json!({"node":"alpha","name":"alpha-renamed"}))
        .await
        .unwrap();
    let event = client
        .request(
            "node.event",
            json!({"node":"alpha-renamed","kind":"ping","payload":{"ok":true}}),
        )
        .await
        .unwrap();

    assert_eq!(pair_request["status"], "pending");
    assert_eq!(pair_list["items"].as_array().unwrap().len(), 1);
    assert_eq!(pair_approve["status"], "approved");
    assert_eq!(verify["verified"], true);
    assert_eq!(result["ok"], true);
    assert_eq!(list["items"].as_array().unwrap().len(), 1);
    assert_eq!(describe["node"], "alpha");
    assert_eq!(rename["node"], "alpha-renamed");
    assert_eq!(event["ok"], true);
}

#[tokio::test]
async fn browser_device_and_approval_state_round_trip() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let browser = client
        .request(
            "browser.request",
            json!({"url":"https://example.com","method":"GET"}),
        )
        .await
        .unwrap();
    let login_start = client
        .request(
            "web.login.start",
            json!({"channel":"slack","workspace":"epi"}),
        )
        .await
        .unwrap();
    let login_wait = client
        .request(
            "web.login.wait",
            json!({"loginId": login_start["loginId"]}),
        )
        .await
        .unwrap();
    let device_list = client
        .request("device.pair.list", json!({}))
        .await
        .unwrap();
    let device_approve = client
        .request("device.pair.approve", json!({"device":"ios-main"}))
        .await
        .unwrap();
    let device_reject = client
        .request("device.pair.reject", json!({"device":"android-sidecar"}))
        .await
        .unwrap();
    let rotated = client
        .request("device.token.rotate", json!({"device":"ios-main"}))
        .await
        .unwrap();
    let revoked = client
        .request(
            "device.token.revoke",
            json!({"device":"ios-main","token": rotated["token"]}),
        )
        .await
        .unwrap();
    let approval = client
        .request(
            "exec.approval.request",
            json!({"command":"cargo test","node":"alpha"}),
        )
        .await
        .unwrap();
    let approval_id = approval["approvalId"].as_str().unwrap().to_owned();
    let approvals_get = client
        .request("exec.approvals.get", json!({}))
        .await
        .unwrap();
    let approvals_set = client
        .request("exec.approvals.set", json!({"mode":"prompt"}))
        .await
        .unwrap();
    let node_set = client
        .request(
            "exec.approvals.node.set",
            json!({"node":"alpha","mode":"always"}),
        )
        .await
        .unwrap();
    let node_get = client
        .request(
            "exec.approvals.node.get",
            json!({"node":"alpha"}),
        )
        .await
        .unwrap();
    let resolve = client
        .request(
            "exec.approval.resolve",
            json!({"approvalId":approval_id,"decision":"approved"}),
        )
        .await
        .unwrap();

    assert!(browser["requestId"].is_string());
    assert_eq!(login_wait["status"], "complete");
    assert_eq!(device_list["items"].as_array().unwrap().len(), 0);
    assert_eq!(device_approve["status"], "approved");
    assert_eq!(device_reject["status"], "rejected");
    assert!(rotated["token"].as_str().unwrap().starts_with("tok_"));
    assert_eq!(revoked["revoked"], true);
    assert_eq!(approvals_get["items"].as_array().unwrap().len(), 1);
    assert_eq!(approvals_set["mode"], "prompt");
    assert_eq!(node_set["mode"], "always");
    assert_eq!(node_get["mode"], "always");
    assert_eq!(resolve["decision"], "approved");
}
