mod support;

use serde_json::json;
use support::{run_epi, TestEnv, TestGatewayClient};

#[tokio::test]
async fn models_config_and_skills_surfaces_reflect_real_gateway_state() {
    let env = TestEnv::repo_with_assets();
    let add_provider = run_epi(["agent", "models", "add-provider", "glm"].as_slice(), &env);
    assert!(add_provider.status.success());
    let set_default = run_epi(
        ["agent", "models", "set-default", "glm/glm-4.5"].as_slice(),
        &env,
    );
    assert!(set_default.status.success());
    let auth = run_epi(
        ["agent", "auth", "set", "glm", "--api-key", "top-secret"].as_slice(),
        &env,
    );
    assert!(auth.status.success());

    let mut client = TestGatewayClient::connect(env, 18833).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    let config = client.request("config.get", json!({})).await.unwrap();
    let models = client.request("models.list", json!({})).await.unwrap();

    client
        .request("skills.install", json!({ "skill": "telegram-squad" }))
        .await
        .unwrap();
    client
        .request(
            "skills.update",
            json!({ "skill": "telegram-squad", "enabled": false }),
        )
        .await
        .unwrap();
    let skills = client.request("skills.status", json!({})).await.unwrap();

    assert_ne!(config["gateway"]["authMode"], "placeholder");
    assert_eq!(models["defaultModel"], "glm/glm-4.5");
    assert_eq!(models["defaultProvider"], "glm");
    assert!(models["models"]
        .as_array()
        .unwrap()
        .iter()
        .any(|model| model["id"] == "glm/glm-4.5" && model["authenticated"] == true));
    assert!(skills["skills"]
        .as_array()
        .unwrap()
        .iter()
        .any(|skill| skill["skillKey"] == "telegram-squad" && skill["disabled"] == true));
}

#[tokio::test]
async fn config_logs_cron_update_and_wizard_surfaces_round_trip_real_state() {
    let mut client = TestGatewayClient::connected_with_temp_store(18834).await;

    let set = client
        .request(
            "config.set",
            json!({ "key": "gateway.port", "value": 18834 }),
        )
        .await
        .unwrap();
    let apply = client
        .request(
            "config.apply",
            json!({ "patch": { "gateway": { "workspaceRoot": "/tmp/epi-workspace" } } }),
        )
        .await
        .unwrap();

    client
        .request(
            "system-event",
            json!({ "kind": "gateway.method-parity", "payload": { "step": "logs" } }),
        )
        .await
        .unwrap();
    let logs = client
        .request("logs.tail", json!({ "limit": 5 }))
        .await
        .unwrap();

    let cron_add = client
        .request(
            "cron.add",
            json!({
                "name":"method-parity",
                "description":"parity job",
                "schedule":{"kind":"every","everyMs":60000},
                "payload":{"kind":"systemEvent","text":"ping"}
            }),
        )
        .await
        .unwrap();
    let cron_id = cron_add["job"]["id"].as_str().unwrap().to_owned();
    let cron_run = client
        .request("cron.run", json!({ "id": cron_id }))
        .await
        .unwrap();
    let cron_runs = client
        .request("cron.runs", json!({ "id": cron_id }))
        .await
        .unwrap();
    let cron_remove = client
        .request("cron.remove", json!({ "id": cron_id }))
        .await
        .unwrap();

    let update = client.request("update.run", json!({})).await.unwrap();
    let wizard_start = client
        .request("wizard.start", json!({ "flow": "method-parity" }))
        .await
        .unwrap();
    let wizard_next = client.request("wizard.next", json!({})).await.unwrap();
    let wizard_cancel = client.request("wizard.cancel", json!({})).await.unwrap();

    assert_eq!(set["gateway"]["port"], 18834);
    assert_eq!(apply["ok"], true);
    assert!(logs["entries"]
        .as_array()
        .unwrap()
        .iter()
        .any(|entry| entry["raw"]
            .as_str()
            .unwrap_or_default()
            .contains("gateway.method-parity")));
    assert_eq!(cron_run["ok"], true);
    assert_eq!(cron_runs["runs"].as_array().unwrap().len(), 1);
    assert_eq!(cron_remove["removed"], true);
    assert_eq!(update["ok"], true);
    assert_eq!(wizard_start["active"], true);
    assert_eq!(wizard_next["step"], 1);
    assert_eq!(wizard_cancel["active"], false);
}

#[tokio::test]
async fn node_device_browser_and_approval_surfaces_mutate_backing_state() {
    let mut client = TestGatewayClient::connected_with_temp_store(18835).await;

    let node_pair = client
        .request("node.pair.request", json!({ "node": "alpha" }))
        .await
        .unwrap();
    let node_approve = client
        .request("node.pair.approve", json!({ "node": "alpha" }))
        .await
        .unwrap();
    let node_run = client
        .request(
            "node.invoke",
            json!({ "node": "alpha", "command": "inspect" }),
        )
        .await
        .unwrap();
    let node_result = client
        .request(
            "node.invoke.result",
            json!({ "resultId": node_run["resultId"] }),
        )
        .await
        .unwrap();

    let browser = client
        .request(
            "browser.request",
            json!({ "url": "https://example.com", "method": "GET" }),
        )
        .await
        .unwrap();
    let login_start = client
        .request(
            "web.login.start",
            json!({ "channel": "slack", "workspace": "epi" }),
        )
        .await
        .unwrap();
    let login_wait = client
        .request(
            "web.login.wait",
            json!({ "loginId": login_start["loginId"] }),
        )
        .await
        .unwrap();

    let device_approve = client
        .request("device.pair.approve", json!({ "device": "ios-main" }))
        .await
        .unwrap();
    let rotated = client
        .request("device.token.rotate", json!({ "device": "ios-main" }))
        .await
        .unwrap();
    let revoked = client
        .request(
            "device.token.revoke",
            json!({ "device": "ios-main", "token": rotated["token"] }),
        )
        .await
        .unwrap();

    let approval = client
        .request(
            "exec.approval.request",
            json!({ "command": "cargo test", "node": "alpha" }),
        )
        .await
        .unwrap();
    let approval_id = approval["approvalId"].as_str().unwrap().to_owned();
    let approvals = client
        .request("exec.approvals.get", json!({}))
        .await
        .unwrap();
    let node_mode = client
        .request(
            "exec.approvals.node.set",
            json!({ "node": "alpha", "mode": "always" }),
        )
        .await
        .unwrap();
    let resolved = client
        .request(
            "exec.approval.resolve",
            json!({ "approvalId": approval_id, "decision": "approved" }),
        )
        .await
        .unwrap();

    assert_eq!(node_pair["status"], "pending");
    assert_eq!(node_approve["status"], "approved");
    assert_eq!(node_result["ok"], true);
    assert!(browser["requestId"].is_string());
    assert_eq!(login_wait["connected"], true);
    assert_eq!(device_approve["status"], "approved");
    assert_eq!(revoked["revoked"], true);
    assert_eq!(approvals["items"].as_array().unwrap().len(), 1);
    assert_eq!(node_mode["mode"], "always");
    assert_eq!(resolved["decision"], "approved");
}
