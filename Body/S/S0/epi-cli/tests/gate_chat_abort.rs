mod support;

use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::net::TcpStream;
use tokio::time::timeout;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

type TestSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;

#[tokio::test]
async fn chat_abort_stops_an_in_flight_run_and_emits_aborted_event() {
    let (_server, mut socket) = connected_socket(18830).await;

    let accepted = rpc_request(
        &mut socket,
        2,
        "chat.send",
        json!({
            "sessionKey":"agent:main:main",
            "message":"__FAKE_PI_SLOW__",
            "idempotencyKey":"gate-chat-abort-rpc",
        }),
    )
    .await;
    let run_id = accepted["runId"].as_str().unwrap().to_owned();

    let first_delta = next_chat_state(&mut socket, &run_id, "delta").await;
    assert_eq!(first_delta["payload"]["message"], "delta one");

    let aborted = rpc_request(
        &mut socket,
        3,
        "chat.abort",
        json!({
            "sessionKey":"agent:main:main",
            "runId": run_id,
        }),
    )
    .await;
    assert_eq!(aborted["aborted"], true);

    let aborted_event = next_chat_state(
        &mut socket,
        aborted["runIds"][0].as_str().unwrap(),
        "aborted",
    )
    .await;
    assert_eq!(aborted_event["payload"]["stopReason"], "rpc");
}

#[tokio::test]
async fn stop_command_aborts_active_session_chat_runs() {
    let (_server, mut socket) = connected_socket(18831).await;

    let accepted = rpc_request(
        &mut socket,
        2,
        "chat.send",
        json!({
            "sessionKey":"agent:main:main",
            "message":"__FAKE_PI_SLOW__",
            "idempotencyKey":"gate-chat-stop-command",
        }),
    )
    .await;
    let run_id = accepted["runId"].as_str().unwrap().to_owned();
    let _delta = next_chat_state(&mut socket, &run_id, "delta").await;

    let stop_result = rpc_request(
        &mut socket,
        3,
        "chat.send",
        json!({
            "sessionKey":"agent:main:main",
            "message":"/stop",
            "idempotencyKey":"gate-chat-stop-command-signal",
        }),
    )
    .await;

    assert_eq!(stop_result["aborted"], true);
    let aborted_event = next_chat_state(&mut socket, &run_id, "aborted").await;
    assert_eq!(aborted_event["payload"]["stopReason"], "stop");
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
