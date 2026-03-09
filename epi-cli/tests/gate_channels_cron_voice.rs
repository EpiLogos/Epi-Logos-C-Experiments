mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn channel_and_cron_surfaces_persist_real_state() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let channels_before = client.request("channels.status", json!({})).await.unwrap();
    let login_start = client
        .request(
            "web.login.start",
            json!({"channel":"telegram","workspace":"epi"}),
        )
        .await
        .unwrap();
    let _login_wait = client
        .request("web.login.wait", json!({"loginId": login_start["loginId"]}))
        .await
        .unwrap();
    let channels_after = client.request("channels.status", json!({})).await.unwrap();
    let logout = client
        .request("channels.logout", json!({"channel":"telegram"}))
        .await
        .unwrap();

    let cron_add = client
        .request(
            "cron.add",
            json!({
                "name":"heartbeat-check",
                "description":"Check gateway heartbeat",
                "schedule":{"kind":"every","amount":15,"unit":"minutes"},
                "payload":{"kind":"systemEvent","text":"heartbeat"}
            }),
        )
        .await
        .unwrap();
    let cron_id = cron_add["job"]["id"].as_str().unwrap().to_owned();
    let cron_status = client.request("cron.status", json!({})).await.unwrap();
    let cron_list = client.request("cron.list", json!({})).await.unwrap();
    let cron_update = client
        .request(
            "cron.update",
            json!({"id":cron_id,"enabled":false,"description":"disabled for maintenance"}),
        )
        .await
        .unwrap();
    let cron_run = client
        .request("cron.run", json!({"id":cron_id}))
        .await
        .unwrap();
    let cron_runs = client
        .request("cron.runs", json!({"id":cron_id}))
        .await
        .unwrap();
    let cron_remove = client
        .request("cron.remove", json!({"id":cron_id}))
        .await
        .unwrap();

    assert_eq!(channels_before["channelsSnapshot"]["channelOrder"][0], "telegram");
    assert_eq!(channels_after["channelsSnapshot"]["channels"]["telegram"]["connected"], true);
    assert_eq!(logout["ok"], true);
    assert_eq!(cron_status["enabled"], true);
    assert_eq!(cron_list["jobs"].as_array().unwrap().len(), 1);
    assert_eq!(cron_update["job"]["enabled"], false);
    assert_eq!(cron_run["ok"], true);
    assert_eq!(cron_runs["runs"].as_array().unwrap().len(), 1);
    assert_eq!(cron_remove["removed"], true);
}

#[tokio::test]
async fn talk_tts_voicewake_and_skills_propagate_into_channel_surface() {
    let mut client = TestGatewayClient::connected_with_temp_store(8421).await;

    let talk_mode = client
        .request("talk.mode", json!({"mode":"voice"}))
        .await
        .unwrap();
    let tts_enable = client.request("tts.enable", json!({})).await.unwrap();
    let tts_provider = client
        .request("tts.setProvider", json!({"provider":"local"}))
        .await
        .unwrap();
    let tts_status = client.request("tts.status", json!({})).await.unwrap();
    let tts_providers = client.request("tts.providers", json!({})).await.unwrap();
    let tts_convert = client
        .request("tts.convert", json!({"text":"hello omni"}))
        .await
        .unwrap();
    let voicewake_set = client
        .request("voicewake.set", json!({"enabled":true,"phrase":"hey epi"}))
        .await
        .unwrap();
    let voicewake_get = client.request("voicewake.get", json!({})).await.unwrap();
    let install = client
        .request("skills.install", json!({"skill":"telegram-squad"}))
        .await
        .unwrap();
    let update = client
        .request("skills.update", json!({"skill":"telegram-squad"}))
        .await
        .unwrap();
    let status = client.request("skills.status", json!({})).await.unwrap();
    let bins = client.request("skills.bins", json!({})).await.unwrap();
    let channels = client.request("channels.status", json!({})).await.unwrap();
    let tts_disable = client.request("tts.disable", json!({})).await.unwrap();

    assert_eq!(talk_mode["mode"], "voice");
    assert_eq!(tts_enable["enabled"], true);
    assert_eq!(tts_provider["provider"], "local");
    assert_eq!(tts_status["enabled"], true);
    assert!(tts_providers["providers"].as_array().unwrap().len() >= 1);
    assert!(tts_convert["artifactPath"].as_str().unwrap().ends_with(".txt"));
    assert_eq!(voicewake_set["phrase"], "hey epi");
    assert_eq!(voicewake_get["enabled"], true);
    assert_eq!(install["installed"], true);
    assert_eq!(update["updated"], true);
    assert!(status["skills"].to_string().contains("telegram-squad"));
    assert!(bins["bins"].as_array().unwrap().len() >= 1);
    assert!(channels["invocationSurface"]["skills"].to_string().contains("telegram-squad"));
    assert!(channels["invocationSurface"]["bins"].as_array().unwrap().len() >= 1);
    assert_eq!(tts_disable["enabled"], false);
}
