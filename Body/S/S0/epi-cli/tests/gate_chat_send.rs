mod support;

use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::net::TcpStream;
use tokio::time::timeout;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

type TestSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;

#[tokio::test]
async fn chat_send_streams_real_deltas_and_persists_final_transcript() {
    let (_server, mut socket) = connected_socket(18829).await;

    let accepted = rpc_request(
        &mut socket,
        2,
        "chat.send",
        json!({
            "sessionKey":"agent:main:main",
            "message":"__FAKE_PI_STREAM__",
            "idempotencyKey":"gate-chat-send-stream",
        }),
    )
    .await;

    assert_eq!(accepted["status"], "started");
    let run_id = accepted["runId"].as_str().unwrap().to_owned();

    let delta_one = next_chat_state(&mut socket, &run_id, "delta").await;
    let delta_two = next_chat_state(&mut socket, &run_id, "delta").await;
    let final_event = next_chat_state(&mut socket, &run_id, "final").await;

    assert_eq!(delta_one["payload"]["seq"], 1);
    assert_eq!(delta_one["payload"]["message"], "delta one");
    assert_eq!(delta_two["payload"]["seq"], 2);
    assert_eq!(delta_two["payload"]["message"], "delta one\ndelta two");
    assert_eq!(final_event["payload"]["seq"], 3);
    assert_eq!(final_event["payload"]["message"], "delta one\ndelta two");

    let history = rpc_request(
        &mut socket,
        3,
        "chat.history",
        json!({
            "sessionKey":"agent:main:main",
        }),
    )
    .await;
    let items = history["items"].as_array().unwrap();
    assert!(
        items
            .iter()
            .any(|item| item["message"] == "delta one\ndelta two"),
        "history should include final assistant output"
    );
}

async fn connected_socket(port: u16) -> (support::TestServerFixture, TestSocket) {
    let fixture = support::TestServerFixture::start(support::TestEnv::with_fake_pi(), port).await;
    let (mut socket, _) = connect_async(format!("ws://127.0.0.1:{port}"))
        .await
        .expect("test websocket should connect");
    let hello = next_json(&mut socket).await;
    assert_eq!(hello["type"], "hello-ok");
    let _challenge = next_json(&mut socket).await;
    let connected = rpc_request(&mut socket, 1, "connect", json!({})).await;
    assert_eq!(connected["ok"], true);
    (fixture, socket)
}

async fn rpc_request(socket: &mut TestSocket, id: u64, method: &str, params: Value) -> Value {
    let frame = json!({
        "type": "req",
        "id": id,
        "method": method,
        "params": params,
    });
    socket
        .send(Message::Text(frame.to_string()))
        .await
        .expect("request should send");

    loop {
        let frame = next_json(socket).await;
        if frame["type"] != "res" || frame["id"] != id {
            continue;
        }
        if frame.get("error").is_some() && !frame["error"].is_null() {
            panic!(
                "{method} should succeed, received error: {}",
                frame["error"]["message"]
            );
        }
        return frame["result"].clone();
    }
}

async fn next_chat_state(socket: &mut TestSocket, run_id: &str, state: &str) -> Value {
    timeout(Duration::from_secs(2), async {
        loop {
            let frame = next_json(socket).await;
            if frame["type"] == "event"
                && frame["event"] == "chat"
                && frame["payload"]["runId"] == run_id
                && frame["payload"]["state"] == state
            {
                return frame;
            }
        }
    })
    .await
    .expect("expected matching chat event before timeout")
}

async fn next_json(socket: &mut TestSocket) -> Value {
    loop {
        let message = socket
            .next()
            .await
            .expect("socket should remain open")
            .expect("websocket frame should decode");
        if message.is_text() {
            return serde_json::from_str(message.to_text().expect("message should be text"))
                .expect("gateway frame should be valid json");
        }
    }
}
