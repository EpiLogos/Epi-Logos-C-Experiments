mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn debug_and_presence_methods_match_electron_controller_contract() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    client
        .request(
            "set-heartbeats",
            json!({ "heartbeats": { "operator-1": "ready" } }),
        )
        .await
        .unwrap();

    let status = client.request("status.summary", json!({})).await.unwrap();
    let health = client.request("health.snapshot", json!({})).await.unwrap();
    let presence = client.request("presence.list", json!({})).await.unwrap();

    assert!(status["running"].is_boolean());
    assert!(status["connectionState"].is_string());
    assert!(health["ok"].is_boolean());
    assert!(health["checks"].is_object());
    assert!(presence["entries"].is_array());
}

#[tokio::test]
async fn chat_and_session_methods_match_electron_controller_contract() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    client
        .request(
            "chat.send",
            json!({
                "sessionKey": "agent:main:main",
                "message": "hello omni",
                "deliver": true,
                "idempotencyKey": "run-1"
            }),
        )
        .await
        .unwrap();

    let history = client
        .request("chat.history", json!({ "sessionKey": "agent:main:main", "limit": 200 }))
        .await
        .unwrap();
    assert!(history["messages"].is_array());
    assert_eq!(history["messages"][0]["role"], "user");

    let sessions = client
        .request(
            "sessions.list",
            json!({
                "includeGlobal": true,
                "includeUnknown": true,
                "activeMinutes": 120,
                "limit": 50
            }),
        )
        .await
        .unwrap();
    assert!(sessions["sessions"].is_array());
    assert_eq!(sessions["sessions"][0]["key"], "agent:main:main");

    client
        .request(
            "sessions.patch",
            json!({
                "key": "agent:main:main",
                "label": "Main Session",
                "thinkingLevel": "medium",
                "verboseLevel": "on",
                "reasoningLevel": "stream"
            }),
        )
        .await
        .unwrap();

    let sessions_after_patch = client
        .request("sessions.list", json!({ "includeGlobal": true }))
        .await
        .unwrap();
    let patched = sessions_after_patch["sessions"]
        .as_array()
        .unwrap()
        .iter()
        .find(|row| row["key"] == "agent:main:main")
        .unwrap();
    assert_eq!(patched["label"], "Main Session");
    assert_eq!(patched["thinkingLevel"], "medium");
    assert_eq!(patched["verboseLevel"], "on");
    assert_eq!(patched["reasoningLevel"], "stream");

    client
        .request(
            "sessions.delete",
            json!({ "key": "agent:main:main", "deleteTranscript": true }),
        )
        .await
        .unwrap();
    let sessions_after_delete = client
        .request("sessions.list", json!({ "includeGlobal": true }))
        .await
        .unwrap();
    assert_eq!(sessions_after_delete["sessions"].as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn channels_skills_and_cron_methods_match_electron_controller_contract() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let channels = client
        .request("channels.status", json!({ "probe": true, "timeoutMs": 8000 }))
        .await
        .unwrap();
    assert!(channels["channelOrder"].is_array());
    assert!(channels["channelAccounts"]["whatsapp"][0]["accountId"].is_string());

    let login_start = client
        .request(
            "web.login.start",
            json!({ "force": true, "timeoutMs": 30000 }),
        )
        .await
        .unwrap();
    assert!(login_start["loginId"].is_string());
    assert!(login_start["message"].is_string());
    assert!(login_start["qrDataUrl"].is_string());

    let login_wait = client
        .request("web.login.wait", json!({ "timeoutMs": 120000 }))
        .await
        .unwrap();
    assert_eq!(login_wait["connected"], true);

    let install = client
        .request(
            "skills.install",
            json!({ "name": "telegram-squad", "installId": "install", "timeoutMs": 120000 }),
        )
        .await
        .unwrap();
    assert!(install["message"].is_string());

    client
        .request(
            "skills.update",
            json!({ "skillKey": "telegram-squad", "enabled": false }),
        )
        .await
        .unwrap();

    let skills = client.request("skills.status", json!({})).await.unwrap();
    assert!(skills["workspaceDir"].is_string());
    assert!(skills["managedSkillsDir"].is_string());
    assert!(skills["skills"][0]["filePath"].is_string());
    assert_eq!(skills["skills"][0]["disabled"], true);

    let cron_add = client
        .request(
            "cron.add",
            json!({
                "name": "heartbeat-check",
                "description": "Check gateway heartbeat",
                "enabled": true,
                "schedule": { "kind": "every", "everyMs": 60000 },
                "sessionTarget": "main",
                "wakeMode": "next-heartbeat",
                "payload": { "kind": "systemEvent", "text": "heartbeat" }
            }),
        )
        .await
        .unwrap();
    assert!(cron_add["job"]["createdAtMs"].is_number());
    let cron_id = cron_add["job"]["id"].as_str().unwrap().to_owned();

    let cron_status = client.request("cron.status", json!({})).await.unwrap();
    assert!(cron_status["nextWakeAtMs"].is_number() || cron_status["nextWakeAtMs"].is_null());

    client
        .request("cron.update", json!({ "id": cron_id, "patch": { "enabled": false } }))
        .await
        .unwrap();

    client
        .request("cron.run", json!({ "id": cron_id, "mode": "force" }))
        .await
        .unwrap();
    let cron_runs = client
        .request("cron.runs", json!({ "id": cron_id, "limit": 50 }))
        .await
        .unwrap();
    assert!(cron_runs["entries"].is_array());
}

#[tokio::test]
async fn config_devices_nodes_and_logs_methods_match_electron_controller_contract() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let config = client.request("config.get", json!({})).await.unwrap();
    assert!(config["raw"].is_string());
    assert!(config["hash"].is_string());
    assert!(config["valid"].is_boolean());

    let hash = config["hash"].as_str().unwrap().to_owned();
    let raw = config["raw"].as_str().unwrap().to_owned();
    let updated_raw = raw.replace("\"tlsEnabled\": false", "\"tlsEnabled\": true");
    let set_result = client
        .request(
            "config.set",
            json!({ "raw": updated_raw, "baseHash": hash }),
        )
        .await
        .unwrap();
    assert!(set_result["hash"].is_string());

    let schema = client.request("config.schema", json!({})).await.unwrap();
    assert!(schema["uiHints"].is_object());
    assert!(schema["generatedAt"].is_string());

    let apply_hash = set_result["hash"].as_str().unwrap().to_owned();
    let apply_raw = set_result["raw"].as_str().unwrap().to_owned();
    let apply_result = client
        .request(
            "config.apply",
            json!({ "raw": apply_raw, "baseHash": apply_hash, "sessionKey": "main" }),
        )
        .await
        .unwrap();
    assert_eq!(apply_result["ok"], true);

    let devices = client.request("device.pair.list", json!({})).await.unwrap();
    assert!(devices["pending"].is_array());
    assert!(devices["paired"].is_array());

    let nodes = client.request("node.list", json!({})).await.unwrap();
    assert!(nodes["nodes"].is_array());

    client
        .request("system-event", json!({ "kind": "gateway.tick", "payload": { "phase": "heartbeat" } }))
        .await
        .unwrap();
    let logs = client
        .request("logs.tail", json!({ "limit": 100 }))
        .await
        .unwrap();
    assert!(logs["entries"].is_array());
    assert!(logs["cursor"].is_number() || logs["cursor"].is_null());
}
