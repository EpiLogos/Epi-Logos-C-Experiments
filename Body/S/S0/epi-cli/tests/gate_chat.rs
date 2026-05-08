mod support;

use std::fs;

use epi_logos::gate::sessions::SessionStore;
use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn chat_send_inject_abort_and_history_use_real_transcript() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    let send = client
        .request(
            "chat.send",
            json!({"sessionKey":"agent:main:main","message":"hello from chat.send"}),
        )
        .await
        .unwrap();
    let run_id = send["runId"].as_str().unwrap().to_owned();

    client
        .request(
            "chat.inject",
            json!({"sessionKey":"agent:main:main","role":"assistant","message":"hello from inject"}),
        )
        .await
        .unwrap();
    client
        .request(
            "chat.abort",
            json!({"sessionKey":"agent:main:main","runId": run_id}),
        )
        .await
        .unwrap();

    let history = client
        .request("chat.history", json!({"sessionKey":"agent:main:main"}))
        .await
        .unwrap();
    let transcript = fs::read_to_string(client.transcript_path("agent:main:main")).unwrap();

    assert!(history["items"].as_array().unwrap().len() >= 3);
    assert!(transcript.contains("hello from chat.send"));
    assert!(transcript.contains("hello from inject"));
    assert!(transcript.contains("\"kind\":\"abort\""));
}

#[tokio::test]
async fn sessions_rpc_lifecycle_mutates_real_store() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    client
        .request(
            "chat.send",
            json!({"sessionKey":"agent:main:main","message":"session seed"}),
        )
        .await
        .unwrap();

    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey":"agent:main:main",
                "label":"Main Session",
                "aliases":["NOW-main"],
                "activeAgentId":"pi.main",
                "subagentLineage":["vak.primary", "pi.main"]
            }),
        )
        .await
        .unwrap();

    let list = client.request("sessions.list", json!({})).await.unwrap();
    let resolve = client
        .request("sessions.resolve", json!({"session":"NOW-main"}))
        .await
        .unwrap();
    let preview = client
        .request("sessions.preview", json!({"session":"agent:main:main"}))
        .await
        .unwrap();
    let compact = client
        .request("sessions.compact", json!({"session":"agent:main:main"}))
        .await
        .unwrap();

    assert_eq!(list["items"].as_array().unwrap().len(), 1);
    assert_eq!(resolve["canonicalKey"], "agent:main:main");
    assert_eq!(resolve["activeAgentId"], "pi.main");
    assert_eq!(preview["messageCount"], 1);
    assert_eq!(compact["compacted"], true);

    client
        .request("sessions.reset", json!({"session":"agent:main:main"}))
        .await
        .unwrap();
    let reset_preview = client
        .request("sessions.preview", json!({"session":"agent:main:main"}))
        .await
        .unwrap();
    assert_eq!(reset_preview["messageCount"], 0);

    client
        .request("sessions.delete", json!({"session":"agent:main:main"}))
        .await
        .unwrap();

    let store = SessionStore::new(client.gate_root()).unwrap();
    assert!(store.list().unwrap().is_empty());
}

#[tokio::test]
async fn sessions_rpc_fork_resume_import_and_tree_preserve_lineage() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    client
        .request(
            "chat.send",
            json!({"sessionKey":"agent:main:main","message":"root session"}),
        )
        .await
        .unwrap();

    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "label": "DAY 07-05-2026 / NOW root",
                "dayId": "07-05-2026",
                "vaultNowPath": "/vault/Empty/Present/07-05-2026/20260507-120000-root/now.md",
                "runtimeCwd": "/repo",
                "vaultRoot": "/vault"
            }),
        )
        .await
        .unwrap();

    let fork = client
        .request(
            "sessions.fork",
            json!({
                "sessionKey": "agent:main:main",
                "targetSessionKey": "agent:main:fork:one",
                "label": "DAY 07-05-2026 / NOW fork"
            }),
        )
        .await
        .unwrap();
    let resume = client
        .request(
            "sessions.resume",
            json!({
                "sessionKey": "agent:main:fork:one",
                "targetSessionKey": "agent:main:resume:one"
            }),
        )
        .await
        .unwrap();
    let imported = client
        .request(
            "sessions.import",
            json!({
                "sourceSessionKey": "external:claude:abc",
                "targetSessionKey": "agent:main:import:one",
                "label": "Imported Claude run"
            }),
        )
        .await
        .unwrap();
    let tree = client
        .request("sessions.tree", json!({"sessionKey": "agent:main:main"}))
        .await
        .unwrap();

    assert_eq!(fork["canonicalKey"], "agent:main:fork:one");
    assert_eq!(fork["record"]["parentSessionKey"], "agent:main:main");
    assert_eq!(fork["record"]["sourceSessionKey"], "agent:main:main");
    assert_eq!(fork["record"]["sourceSessionKind"], "fork");
    assert_eq!(fork["record"]["dayId"], "07-05-2026");
    assert_eq!(
        fork["record"]["vaultNowPath"],
        "/vault/Empty/Present/07-05-2026/20260507-120000-root/now.md"
    );

    assert_eq!(resume["canonicalKey"], "agent:main:resume:one");
    assert_eq!(resume["record"]["parentSessionKey"], "agent:main:fork:one");
    assert_eq!(resume["record"]["sourceSessionKind"], "resume");

    assert_eq!(imported["canonicalKey"], "agent:main:import:one");
    assert_eq!(
        imported["record"]["sourceSessionKey"],
        "external:claude:abc"
    );
    assert_eq!(imported["record"]["sourceSessionKind"], "import");
    assert_eq!(imported["record"]["label"], "Imported Claude run");

    let rows = tree["sessions"].as_array().unwrap();
    assert!(rows
        .iter()
        .any(|row| row["canonicalKey"] == "agent:main:main"));
    assert!(rows
        .iter()
        .any(|row| row["canonicalKey"] == "agent:main:fork:one"));
    assert!(rows
        .iter()
        .any(|row| row["canonicalKey"] == "agent:main:resume:one"));
    assert!(tree["lineage"].as_array().unwrap().iter().any(|edge| {
        edge["parentSessionKey"] == "agent:main:main"
            && edge["childSessionKey"] == "agent:main:fork:one"
            && edge["sourceSessionKind"] == "fork"
    }));
}

#[tokio::test]
async fn sessions_compact_deposits_session_summary_evidence_for_epii_review() {
    let mut client = TestGatewayClient::connected_with_temp_store(18794).await;

    client
        .request(
            "chat.send",
            json!({"sessionKey":"agent:main:main","message":"summarise this root event"}),
        )
        .await
        .unwrap();
    client
        .request(
            "chat.inject",
            json!({"sessionKey":"agent:main:main","role":"assistant","message":"captured response"}),
        )
        .await
        .unwrap();

    let compact = client
        .request("sessions.compact", json!({"sessionKey":"agent:main:main"}))
        .await
        .unwrap();
    let inbox = client
        .request("s5'.review.inbox", json!({"status":"open"}))
        .await
        .unwrap();

    assert_eq!(compact["compacted"], true);
    assert_eq!(compact["epiiReview"]["source"], "aletheia");
    assert_eq!(compact["epiiReview"]["requires_human"], true);
    assert!(compact["summary"]["transcriptPath"]
        .as_str()
        .unwrap()
        .contains("agent_main_main.jsonl"));
    assert!(inbox["items"].as_array().unwrap().iter().any(|item| {
        item["title"] == "Session compact summary: agent:main:main"
            && item["coordinate_context"]["sessionKey"] == "agent:main:main"
            && item["proposed_action"]["kind"] == "aletheia_crystallisation"
    }));
}
