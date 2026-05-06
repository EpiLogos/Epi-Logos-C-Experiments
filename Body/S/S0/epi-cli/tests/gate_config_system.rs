mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn config_apply_persists_and_reports_new_version() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    let default_config = client.request("config.get", json!({})).await.unwrap();
    let schema = client.request("config.schema", json!({})).await.unwrap();
    let set = client
        .request("config.set", json!({"key":"gateway.port","value":18794}))
        .await
        .unwrap();
    let patch = client
        .request(
            "config.patch",
            json!({"patch":{"gateway":{"tlsEnabled":true}}}),
        )
        .await
        .unwrap();
    let apply = client
        .request(
            "config.apply",
            json!({"patch":{"gateway":{"bootstrapRoot":"/tmp/bootstrap","workspaceRoot":"/tmp/workspace"}}}),
        )
        .await
        .unwrap();
    let persisted = client.request("config.get", json!({})).await.unwrap();

    assert_eq!(default_config["gateway"]["port"], 18794);
    assert_eq!(schema["domains"][0]["key"], "gateway");
    assert_eq!(set["gateway"]["port"], 18794);
    assert_eq!(patch["gateway"]["tlsEnabled"], true);
    assert_eq!(apply["ok"], true);
    assert!(apply["version"].as_str().unwrap().starts_with("v"));
    assert_eq!(persisted["gateway"]["bootstrapRoot"], "/tmp/bootstrap");
    assert_eq!(persisted["gateway"]["workspaceRoot"], "/tmp/workspace");
}

#[tokio::test]
async fn system_models_logs_usage_update_and_wizard_methods_persist_state() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    client
        .request(
            "set-heartbeats",
            json!({"heartbeats":{"gateway":"healthy","pi.main":"idle"}}),
        )
        .await
        .unwrap();
    client
        .request(
            "system-event",
            json!({"kind":"gateway.booted","payload":{"port":18794}}),
        )
        .await
        .unwrap();

    let last_heartbeat = client.request("last-heartbeat", json!({})).await.unwrap();
    let presence = client.request("system-presence", json!({})).await.unwrap();
    let models = client.request("models.list", json!({})).await.unwrap();
    let logs = client
        .request("logs.tail", json!({"lines":10}))
        .await
        .unwrap();
    let usage_status = client.request("usage.status", json!({})).await.unwrap();
    let usage_cost = client.request("usage.cost", json!({})).await.unwrap();
    let update = client.request("update.run", json!({})).await.unwrap();
    let wizard_start = client
        .request("wizard.start", json!({"flow":"gateway-setup"}))
        .await
        .unwrap();
    let wizard_next = client.request("wizard.next", json!({})).await.unwrap();
    let wizard_status = client.request("wizard.status", json!({})).await.unwrap();
    let wizard_cancel = client.request("wizard.cancel", json!({})).await.unwrap();

    assert_eq!(last_heartbeat["agent"], "pi.main");
    assert_eq!(presence["heartbeats"]["gateway"], "healthy");
    assert!(models["models"].as_array().unwrap().len() >= 1);
    assert!(logs["lines"].to_string().contains("gateway.booted"));
    assert_eq!(usage_status["ok"], true);
    assert_eq!(usage_cost["currency"], "USD");
    assert_eq!(update["ok"], true);
    assert_eq!(wizard_start["active"], true);
    assert_eq!(wizard_next["step"], 1);
    assert_eq!(wizard_status["flow"], "gateway-setup");
    assert_eq!(wizard_cancel["active"], false);
}
