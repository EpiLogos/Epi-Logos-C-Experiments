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
