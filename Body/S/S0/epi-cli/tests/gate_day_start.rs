//! Coordinate: S0/S3 first-day gateway proof (32.T32.11)
//! Actualises: real WebSocket and filesystem proof for day ensure + Khora start.
//! Does NOT own: onboarding UI, Kairos, or oracle law.

mod support;

use serde_json::json;
use std::fs;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn day_ensure_and_khora_start_are_live_and_idempotent() {
    let env = TestEnv::with_fake_pi();
    fs::create_dir_all(env.repo_root.join("Idea")).unwrap();
    let mut client = TestGatewayClient::connect(env, 18963).await;
    client.request("connect", json!({})).await.unwrap();

    let day = client
        .request("vault.day.ensure", json!({"dayId": "2026-07-20"}))
        .await
        .expect("day ensure must be a live gateway method");
    assert_eq!(day["rpc"], "vault.day.ensure");
    assert_eq!(day["dayId"], "20-07-2026");
    let daily_note = day["dailyNotePath"].as_str().unwrap();
    assert!(std::path::Path::new(daily_note).is_file());

    let first = client
        .request("khora.session_start", json!({"dayId": "20-07-2026"}))
        .await
        .expect("Khora start must be a live gateway method");
    assert_eq!(first["rpc"], "khora.session_start");
    assert_eq!(first["createdNow"], true);
    let now_path = first["nowPath"].as_str().unwrap();
    let body = fs::read_to_string(now_path).unwrap();
    assert!(body.contains("c_4_artifact_role: \"now\""));
    assert!(body.contains("c_3_day_id: \"20-07-2026\""));

    let second = client
        .request("khora.session_start", json!({"dayId": "20-07-2026"}))
        .await
        .expect("Khora start retry must succeed");
    assert_eq!(second["createdNow"], false);
    assert_eq!(second["nowPath"], first["nowPath"]);
    assert_eq!(second["sessionId"], first["sessionId"]);
}
