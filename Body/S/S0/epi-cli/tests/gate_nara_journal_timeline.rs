//! 25.T25.3 — `nara.journal.timeline` serves the NOW-inscription timeline.
//!
//! The rows are read off the REAL Present day law: `Empty/Present/{MM-DD-YYYY}/
//! {YYYYMMDD-HHmmss-suffix}/now.md`. A row carries day id, the NOW timestamp
//! (decoded from the session-dir stamp — datetime-prefixed by law, no
//! counters), the session key, and the artifact KINDS the session inscribed
//! (`c_4_artifact_role` frontmatter only — no artifact body ever crosses).
//! Ordering is newest-first ACROSS days, which the month-first day id cannot
//! deliver lexically — a date-aware sort is part of the contract.

mod support;

use chrono::{Duration, Utc};
use serde_json::json;
use std::fs;
use std::path::{Path, PathBuf};
use support::{TestEnv, TestGatewayClient};

const DAY_ID_FORMAT: &str = "%m-%d-%Y";

fn seed_session(day_dir: &Path, session_key: &str, artifacts: &[(&str, &str)]) {
    let session = day_dir.join(session_key);
    fs::create_dir_all(&session).unwrap();
    fs::write(session.join("now.md"), "---\nc_4_artifact_role: now\n---\n# NOW\n").unwrap();
    for (name, body) in artifacts {
        fs::write(session.join(name), body).unwrap();
    }
}

fn seed_vault(vault_root: &PathBuf) -> (String, String, String) {
    let today = today();
    let yesterday = today - Duration::days(1);
    let ancient = today - Duration::days(40);
    let present = vault_root.join("Empty").join("Present");

    let today_id = today.format(DAY_ID_FORMAT).to_string();
    let yesterday_id = yesterday.format(DAY_ID_FORMAT).to_string();
    let ancient_id = ancient.format(DAY_ID_FORMAT).to_string();

    let today_dir = present.join(&today_id);
    let stamp = today.format("%Y%m%d").to_string();
    seed_session(
        &today_dir,
        &format!("{stamp}-090000-aaaaaa"),
        &[
            (
                "oracle-cast.md",
                "---\nc_4_artifact_role: \"oracle\"\n---\nthe reading body must never cross\n",
            ),
            ("dream-entry.md", "---\nc_4_artifact_role: dream\n---\nprivate\n"),
        ],
    );
    seed_session(&today_dir, &format!("{stamp}-110000-bbbbbb"), &[]);
    // A non-session dir (no datetime prefix / no now.md) and a stray file are
    // both ignored rather than misread as sessions.
    fs::create_dir_all(today_dir.join("notes")).unwrap();
    fs::write(present.join("FLOW-stray.md"), "not a day folder\n").unwrap();

    let ystamp = yesterday.format("%Y%m%d").to_string();
    seed_session(
        &present.join(&yesterday_id),
        &format!("{ystamp}-200000-cccccc"),
        &[("unmarked.md", "no frontmatter at all\n")],
    );

    let astamp = ancient.format("%Y%m%d").to_string();
    seed_session(
        &present.join(&ancient_id),
        &format!("{astamp}-120000-dddddd"),
        &[],
    );

    (today_id, yesterday_id, ancient_id)
}

fn today() -> chrono::NaiveDate {
    // Mirrors the server's own day law (`vault::paths::day_of(Utc::now())`).
    Utc::now().date_naive()
}

#[tokio::test]
async fn journal_timeline_reads_the_real_now_inscriptions_newest_first() {
    let env = TestEnv::with_fake_pi();
    let vault_root = env.home.join("vault");
    let (today_id, yesterday_id, ancient_id) = seed_vault(&vault_root);
    let env = env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let mut client = TestGatewayClient::connect(env, 18998).await;
    client.request("connect", json!({})).await.unwrap();

    let reply = client
        .request("nara.journal.timeline", json!({}))
        .await
        .expect("nara.journal.timeline should be gateway-callable");

    assert_eq!(reply["dayRange"], 30);
    assert_eq!(reply["privacyClass"], "protected-local");
    let rows = reply["rows"].as_array().expect("rows must be a list");
    assert_eq!(rows.len(), 3, "the 40-day-old session is outside the window");

    // Newest-first across days: today's 11:00, today's 09:00, yesterday's.
    assert_eq!(rows[0]["day"], today_id);
    assert!(rows[0]["sessionKey"].as_str().unwrap().ends_with("bbbbbb"));
    assert_eq!(rows[1]["day"], today_id);
    assert!(rows[1]["sessionKey"].as_str().unwrap().ends_with("aaaaaa"));
    assert_eq!(rows[2]["day"], yesterday_id);
    assert!(
        !rows.iter().any(|r| r["day"] == ancient_id),
        "ancient day must not appear"
    );

    // The NOW timestamp is decoded from the session stamp, RFC3339.
    let ts = rows[1]["nowTimestamp"].as_str().unwrap();
    assert!(ts.contains("T09:00:00"), "stamp 090000 must decode: {ts}");

    // Kinds: declared roles come through verbatim; a role-less artifact is
    // `unclassified`; and NO row carries a body field.
    let kinds1: Vec<&str> = rows[1]["artifactKinds"]
        .as_array()
        .unwrap()
        .iter()
        .map(|k| k.as_str().unwrap())
        .collect();
    assert!(kinds1.contains(&"now") && kinds1.contains(&"oracle") && kinds1.contains(&"dream"));
    let kinds2: Vec<&str> = rows[2]["artifactKinds"]
        .as_array()
        .unwrap()
        .iter()
        .map(|k| k.as_str().unwrap())
        .collect();
    assert_eq!(kinds2, vec!["now", "unclassified"]);
    let raw = serde_json::to_string(&reply).unwrap();
    assert!(
        !raw.contains("the reading body must never cross"),
        "an artifact body crossed the timeline wire"
    );
}

#[tokio::test]
async fn journal_timeline_bounds_and_refusals() {
    let env = TestEnv::with_fake_pi();
    let vault_root = env.home.join("vault");
    let (today_id, yesterday_id, _) = seed_vault(&vault_root);
    let env = env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let mut client = TestGatewayClient::connect(env, 18999).await;
    client.request("connect", json!({})).await.unwrap();

    // dayRange 1 = today only.
    let reply = client
        .request("nara.journal.timeline", json!({ "dayRange": 1 }))
        .await
        .unwrap();
    let rows = reply["rows"].as_array().unwrap();
    assert_eq!(rows.len(), 2);
    assert!(rows.iter().all(|r| r["day"] == today_id));
    assert!(!rows.iter().any(|r| r["day"] == yesterday_id));

    // Out-of-law ranges and non-integers are refused, not clamped silently.
    for bad in [json!({ "dayRange": 0 }), json!({ "dayRange": 200 }), json!({ "dayRange": "x" })] {
        let refused = client.request("nara.journal.timeline", bad.clone()).await;
        assert!(refused.is_err(), "{bad} must be refused, got {refused:?}");
    }
}
