mod support;

use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::time::timeout;
use tokio_tungstenite::{connect_async, tungstenite::Message};

#[tokio::test]
async fn tick_health_and_heartbeat_events_broadcast_with_monotonic_seq() {
    let _server = support::TestServerFixture::start(support::TestEnv::with_fake_pi(), 18822).await;

    let (mut socket, _) = connect_async("ws://127.0.0.1:18822")
        .await
        .expect("test websocket should connect");
    let _hello = next_json(&mut socket).await;
    let _challenge = next_json(&mut socket).await;

    socket
        .send(Message::Text(
            json!({"type":"req","id":1,"method":"connect","params":{}}).to_string(),
        ))
        .await
        .expect("connect request should send");
    let _connect = next_json(&mut socket).await;

    let tick = wait_for_event(&mut socket, "tick").await;
    let health = wait_for_event(&mut socket, "health").await;
    let heartbeat = wait_for_event(&mut socket, "heartbeat").await;

    assert!(tick["seq"].as_u64().is_some());
    assert!(health["seq"].as_u64().is_some());
    assert!(heartbeat["seq"].as_u64().is_some());
    assert!(
        health["seq"].as_u64().unwrap() > tick["seq"].as_u64().unwrap(),
        "health seq should advance monotonically after tick"
    );
    assert!(
        heartbeat["seq"].as_u64().unwrap() > health["seq"].as_u64().unwrap(),
        "heartbeat seq should advance monotonically after health"
    );
}

#[tokio::test]
async fn agent_and_chat_events_reach_all_connected_clients() {
    let _server = support::TestServerFixture::start(support::TestEnv::with_fake_pi(), 18823).await;

    let (mut first, _) = connect_async("ws://127.0.0.1:18823")
        .await
        .expect("first websocket should connect");
    let (mut second, _) = connect_async("ws://127.0.0.1:18823")
        .await
        .expect("second websocket should connect");

    for socket in [&mut first, &mut second] {
        let _hello = next_json(socket).await;
        let _challenge = next_json(socket).await;
        socket
            .send(Message::Text(
                json!({"type":"req","id":1,"method":"connect","params":{}}).to_string(),
            ))
            .await
            .expect("connect request should send");
        let _connect = next_json(socket).await;
    }

    first
        .send(Message::Text(
            json!({
                "type":"req",
                "id":2,
                "method":"agent",
                "params":{
                    "sessionKey":"agent:main:main",
                    "message":"fanout agent test",
                    "idempotencyKey":"fanout-agent-test"
                }
            })
            .to_string(),
        ))
        .await
        .expect("agent should send");
    let accepted_agent = next_json(&mut first).await;
    let agent_run_id = accepted_agent["result"]["runId"]
        .as_str()
        .expect("agent should return run id")
        .to_owned();

    let first_agent = wait_for_run_event(&mut first, "agent", &agent_run_id).await;
    let second_agent = wait_for_run_event(&mut second, "agent", &agent_run_id).await;
    assert_eq!(first_agent["payload"]["runId"], agent_run_id);
    assert_eq!(second_agent["payload"]["runId"], agent_run_id);

    first
        .send(Message::Text(
            json!({
                "type":"req",
                "id":3,
                "method":"chat.send",
                "params":{"sessionKey":"agent:main:main","message":"fanout test"}
            })
            .to_string(),
        ))
        .await
        .expect("chat.send should send");
    let accepted = next_json(&mut first).await;
    let run_id = accepted["result"]["runId"]
        .as_str()
        .expect("chat.send should return run id")
        .to_owned();

    let first_chat = wait_for_run_event(&mut first, "chat", &run_id).await;
    let second_chat = wait_for_run_event(&mut second, "chat", &run_id).await;
    assert_eq!(first_chat["payload"]["runId"], run_id);
    assert_eq!(second_chat["payload"]["runId"], run_id);
}

async fn wait_for_event(
    socket: &mut tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >,
    event: &str,
) -> Value {
    timeout(Duration::from_secs(2), async {
        loop {
            let frame = next_json(socket).await;
            if frame["type"] == "event" && frame["event"] == event {
                return frame;
            }
        }
    })
    .await
    .expect("expected event before timeout")
}

async fn wait_for_run_event(
    socket: &mut tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >,
    event: &str,
    run_id: &str,
) -> Value {
    timeout(Duration::from_secs(2), async {
        loop {
            let frame = next_json(socket).await;
            if frame["type"] == "event"
                && frame["event"] == event
                && frame["payload"]["runId"] == run_id
            {
                return frame;
            }
        }
    })
    .await
    .expect("expected run event before timeout")
}

async fn next_json(
    socket: &mut tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >,
) -> Value {
    loop {
        let message = socket
            .next()
            .await
            .expect("socket should remain open")
            .expect("frame should decode");
        if message.is_text() {
            return serde_json::from_str(message.to_text().expect("message should be text"))
                .expect("frame should be json");
        }
    }
}
