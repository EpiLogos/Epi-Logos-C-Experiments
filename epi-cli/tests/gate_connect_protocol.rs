mod support;

use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::time::timeout;
use tokio_tungstenite::{connect_async, tungstenite::Message};

#[tokio::test]
async fn open_connection_receives_hello_then_connect_challenge() {
    let _server = support::TestServerFixture::start(support::TestEnv::with_fake_pi(), 18821).await;

    let (mut socket, _) = connect_async("ws://127.0.0.1:18821")
        .await
        .expect("test websocket should connect");

    let hello = next_json(&mut socket).await;
    assert_eq!(hello["type"], "hello-ok");

    let challenge = timeout(Duration::from_secs(2), next_json(&mut socket))
        .await
        .expect("connect.challenge should arrive before timeout");
    assert_eq!(challenge["type"], "event");
    assert_eq!(challenge["event"], "connect.challenge");
    assert!(challenge["payload"]["nonce"].as_str().is_some());

    socket
        .send(Message::Text(
            json!({"type":"req","id":1,"method":"connect","params":{}}).to_string(),
        ))
        .await
        .expect("connect request should send");

    let response = next_json(&mut socket).await;
    assert_eq!(response["type"], "res");
    assert_eq!(response["id"], 1);
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
