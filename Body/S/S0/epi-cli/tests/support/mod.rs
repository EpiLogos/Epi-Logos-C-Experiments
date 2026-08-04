#[path = "../common/mod.rs"]
mod common;

use std::sync::{Mutex, MutexGuard, OnceLock};
use std::time::Duration;

use epi_logos::gate::{chat, protocol::ResponseFrame, server::TestServerHandle};
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

pub use common::{run_epi, ProcessEnvGuard, TestEnv, TestOutput};

pub struct EpiProcess {
    env: TestEnv,
    pub output: TestOutput,
}

impl EpiProcess {
    pub fn env(&self) -> &TestEnv {
        &self.env
    }
}

pub fn temp_env() -> TestEnv {
    TestEnv::empty()
}

pub fn spawn_epi(args: &[&str], env: TestEnv) -> EpiProcess {
    let output = run_epi(args, &env);
    EpiProcess { env, output }
}

pub struct TestGatewayClient {
    env: TestEnv,
    _server_lock: MutexGuard<'static, ()>,
    _env_guard: ProcessEnvGuard,
    _server: TestServerHandle,
    socket: WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>,
    next_id: u64,
}

pub struct TestServerFixture {
    pub env: TestEnv,
    _server_lock: MutexGuard<'static, ()>,
    _env_guard: ProcessEnvGuard,
    pub server: TestServerHandle,
}

#[derive(Debug)]
pub struct TestGatewayError {
    pub message: String,
}

impl TestGatewayClient {
    pub async fn connected_with_temp_store(port: u16) -> Self {
        let env = TestEnv::with_fake_pi();
        let mut client = Self::connect(env, port).await;
        client
            .request("connect", json!({}))
            .await
            .expect("connect handshake should succeed");
        client
    }

    pub fn home_dir(&self) -> &std::path::Path {
        &self.env.home
    }

    pub async fn connect(env: TestEnv, port: u16) -> Self {
        let server_lock = test_server_lock()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let env_guard = env.apply_to_process();
        let gate_root = env.home.join(".epi").join("gate");
        let server = epi_logos::gate::server::spawn_test_server_with_state_root(gate_root, port)
            .await
            .expect("test gateway server should start");
        tokio::time::sleep(Duration::from_millis(50)).await;

        let (mut socket, _) = connect_async(format!("ws://127.0.0.1:{port}"))
            .await
            .expect("test websocket should connect");

        // Consume the server hello frame before issuing requests.
        let _ = socket.next().await;

        Self {
            env,
            _server_lock: server_lock,
            _env_guard: env_guard,
            _server: server,
            socket,
            next_id: 1,
        }
    }

    pub async fn request(
        &mut self,
        method: &str,
        params: Value,
    ) -> Result<Value, TestGatewayError> {
        let id = self.next_id;
        self.next_id += 1;

        let frame = json!({
            "type": "req",
            "id": id,
            "method": method,
            "params": params,
        });

        self.socket
            .send(Message::Text(frame.to_string()))
            .await
            .expect("request should send");

        let deadline = tokio::time::sleep(Duration::from_secs(5));
        tokio::pin!(deadline);

        loop {
            let message = tokio::select! {
                message = self.socket.next() => message,
                _ = &mut deadline => {
                    return Err(TestGatewayError {
                        message: format!("timed out waiting for response to {method}#{id}"),
                    });
                }
            };
            let Some(message) = message else {
                break;
            };
            let message = message.expect("response frame should decode");
            if !message.is_text() {
                continue;
            }

            let raw = message.to_text().expect("response should be text");
            let frame: Value =
                serde_json::from_str(raw).expect("gateway frame should be valid json");
            if frame.get("type").and_then(Value::as_str) != Some("res") {
                continue;
            }

            let response: ResponseFrame =
                serde_json::from_value(frame).expect("response should match protocol shape");

            if response.id != id {
                continue;
            }

            if let Some(error) = response.error {
                return Err(TestGatewayError {
                    message: error.message,
                });
            }

            return Ok(response.result.unwrap_or_else(|| json!({})));
        }

        Err(TestGatewayError {
            message: "gateway closed connection".to_owned(),
        })
    }

    pub async fn next_event(&mut self, event_name: &str) -> Value {
        let deadline = tokio::time::sleep(Duration::from_secs(5));
        tokio::pin!(deadline);

        loop {
            let message = tokio::select! {
                message = self.socket.next() => message,
                _ = &mut deadline => panic!("timed out waiting for gateway event {event_name}"),
            };
            let message = message
                .expect("gateway should stay connected")
                .expect("event frame should decode");
            if !message.is_text() {
                continue;
            }
            let frame: Value =
                serde_json::from_str(message.to_text().expect("gateway event should be text"))
                    .expect("gateway event should be valid json");
            if frame.get("type").and_then(Value::as_str) == Some("event")
                && frame.get("event").and_then(Value::as_str) == Some(event_name)
            {
                return frame;
            }
        }
    }

    pub fn gate_root(&self) -> std::path::PathBuf {
        self.env.home.join(".epi").join("gate")
    }

    pub fn transcript_path(&self, session_key: &str) -> std::path::PathBuf {
        chat::transcript_path(self.gate_root(), session_key)
    }

    /// Open a SECOND socket onto the already-running test server.
    ///
    /// `request()` drains and discards every frame that is not the response it
    /// is waiting for, so an event broadcast DURING a request is eaten before
    /// `next_event` can see it. That is fine for `profile.update`, which the
    /// heartbeat keeps producing, but a once-per-request broadcast like
    /// `portal.vak_eval` would be lost. An observer socket is also the more
    /// honest proof: it is what a real subscriber (OmniPanel, `epi portal`)
    /// actually is — a listener registered on the runtime, not the caller.
    ///
    /// Reuses this client's server, so it takes no lock and starts nothing.
    #[allow(dead_code)]
    pub async fn observer(&self, port: u16) -> GatewayObserver {
        let (mut socket, _) = connect_async(format!("ws://127.0.0.1:{port}"))
            .await
            .expect("observer websocket should connect");
        // Consume the server hello frame, exactly as the primary client does.
        let _ = socket.next().await;
        GatewayObserver { socket }
    }
}

/// A read-only second connection used to witness broadcasts.
pub struct GatewayObserver {
    socket: WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>,
}

impl GatewayObserver {
    /// Wait for the next broadcast of `event_name`, returning the whole frame.
    #[allow(dead_code)]
    pub async fn next_event(&mut self, event_name: &str) -> Value {
        let deadline = tokio::time::sleep(Duration::from_secs(5));
        tokio::pin!(deadline);

        loop {
            let message = tokio::select! {
                message = self.socket.next() => message,
                _ = &mut deadline => {
                    panic!("timed out waiting for broadcast of {event_name}")
                }
            };
            let message = message
                .expect("gateway should stay connected")
                .expect("event frame should decode");
            if !message.is_text() {
                continue;
            }
            let frame: Value =
                serde_json::from_str(message.to_text().expect("event should be text"))
                    .expect("gateway event should be valid json");
            if frame.get("type").and_then(Value::as_str) == Some("event")
                && frame.get("event").and_then(Value::as_str) == Some(event_name)
            {
                return frame;
            }
        }
    }

    /// Assert that `event_name` is NOT broadcast within a short window.
    #[allow(dead_code)]
    pub async fn expect_no_event(&mut self, event_name: &str, within: Duration) {
        let deadline = tokio::time::sleep(within);
        tokio::pin!(deadline);

        loop {
            let message = tokio::select! {
                message = self.socket.next() => message,
                _ = &mut deadline => return,
            };
            let Some(Ok(message)) = message else { return };
            if !message.is_text() {
                continue;
            }
            let Ok(frame) =
                serde_json::from_str::<Value>(message.to_text().expect("event should be text"))
            else {
                continue;
            };
            assert_ne!(
                frame.get("event").and_then(Value::as_str),
                Some(event_name),
                "{event_name} should not have been broadcast: {frame}"
            );
        }
    }
}

impl TestServerFixture {
    pub async fn start(env: TestEnv, port: u16) -> Self {
        let server_lock = test_server_lock()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let env_guard = env.apply_to_process();
        let gate_root = env.home.join(".epi").join("gate");
        let server = epi_logos::gate::server::spawn_test_server_with_state_root(gate_root, port)
            .await
            .expect("test gateway server should start");
        tokio::time::sleep(Duration::from_millis(50)).await;

        Self {
            env,
            _server_lock: server_lock,
            _env_guard: env_guard,
            server,
        }
    }
}

fn test_server_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}
