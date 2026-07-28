//! Coordinate: S0/S3 first-day gateway proof (32.T32.11)
//! Actualises: real WebSocket and filesystem proof for day ensure + Khora start.
//! Does NOT own: onboarding UI, Kairos, or oracle law.

mod support;

use chrono::NaiveDate;
use serde_json::json;
use std::fs;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn day_ensure_and_khora_start_are_live_and_idempotent() {
    let env = TestEnv::with_fake_pi();
    fs::create_dir_all(env.repo_root.join("Idea")).unwrap();
    let mut client = TestGatewayClient::connect(env, 18963).await;
    client.request("connect", json!({})).await.unwrap();

    // The caller names an explicit CALENDAR day, so no instant→day reduction is
    // involved: `vault.day.ensure` must echo it back in the one canonical
    // spelling, month-first `MM-DD-YYYY` (`src/vault/paths.rs`, CHARTER:28).
    // Formatted from the date rather than pasted so the expectation states the
    // law instead of a literal.
    //
    // KNOWN SOURCE DEFECT (fails in any zone WEST of UTC, verified under
    // TZ=America/New_York and TZ=Pacific/Midway): `vault::day::ensure_day_folder`
    // parses this id to a `NaiveDate`, then throws the date away — it synthesises
    // UTC midnight and routes that instant through `paths::day_folder`, whose
    // `day_of` correctly reduces an instant to the LOCAL day. UTC midnight IS the
    // previous local day west of UTC, so "2026-07-20" yields the 19th's folder.
    // `gate::day_start::session_id_for` documents this exact hazard and keeps its
    // synthetic midnight in UTC; `ensure_day_folder` should likewise route the
    // parsed date to `paths::day_folder_for_date`/`format_day_id_for_date` rather
    // than round-trip it through an instant. The assertion below states the law
    // and is deliberately NOT relaxed to match the defect.
    let day_id = NaiveDate::from_ymd_opt(2026, 7, 20)
        .unwrap()
        .format("%m-%d-%Y")
        .to_string();

    let day = client
        .request("vault.day.ensure", json!({"dayId": "2026-07-20"}))
        .await
        .expect("day ensure must be a live gateway method");
    assert_eq!(day["rpc"], "vault.day.ensure");
    assert_eq!(day["dayId"], day_id.as_str());
    let daily_note = day["dailyNotePath"].as_str().unwrap();
    assert!(std::path::Path::new(daily_note).is_file());

    let first = client
        .request("khora.session_start", json!({"dayId": day_id.clone()}))
        .await
        .expect("Khora start must be a live gateway method");
    assert_eq!(first["rpc"], "khora.session_start");
    assert_eq!(first["createdNow"], true);
    let now_path = first["nowPath"].as_str().unwrap();
    let body = fs::read_to_string(now_path).unwrap();
    assert!(body.contains("c_4_artifact_role: \"now\""));
    assert!(body.contains(&format!("c_3_day_id: \"{day_id}\"")));

    let second = client
        .request("khora.session_start", json!({"dayId": day_id.clone()}))
        .await
        .expect("Khora start retry must succeed");
    assert_eq!(second["createdNow"], false);
    assert_eq!(second["nowPath"], first["nowPath"]);
    assert_eq!(second["sessionId"], first["sessionId"]);
}
