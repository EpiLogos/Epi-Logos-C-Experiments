#[path = "../common/mod.rs"]
mod common;

use std::sync::{Mutex, MutexGuard, OnceLock};
use std::time::Duration;

use epi_logos::gate::{chat, protocol::ResponseFrame, server::TestServerHandle};
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

pub use common::{run_epi, TestEnv, TestOutput};

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

pub struct BackgroundEpiProcess {
    env: TestEnv,
    child: std::process::Child,
}

impl BackgroundEpiProcess {
    pub fn env(&self) -> &TestEnv {
        &self.env
    }
}

impl Drop for BackgroundEpiProcess {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

pub fn spawn_epi_background(args: &[&str], env: TestEnv) -> BackgroundEpiProcess {
    let exe = env!("CARGO_BIN_EXE_epi");
    let mut command = std::process::Command::new(exe);
    command.args(args);
    command.current_dir(&env.repo_root);
    command.env("HOME", &env.home);
    command.env("EPI_REPO_ROOT", &env.repo_root);
    command.env_remove("EPI_AGENT_HOME");
    command.env_remove("EPI_AGENT_DIR");
    command.env_remove("PI_CODING_AGENT_DIR");

    let child = command
        .spawn()
        .expect("background epi process should start");
    BackgroundEpiProcess { env, child }
}

pub struct TestGatewayClient {
    env: TestEnv,
    _server_lock: MutexGuard<'static, ()>,
    _server: TestServerHandle,
    socket: WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>,
    next_id: u64,
}

#[derive(Debug)]
pub struct TestGatewayError {
    pub message: String,
}

impl TestGatewayClient {
    pub async fn connected_with_temp_store(port: u16) -> Self {
        let env = temp_env();
        let mut client = Self::connect(env, port).await;
        client
            .request("connect", json!({}))
            .await
            .expect("connect handshake should succeed");
        client
    }

    pub async fn connect(env: TestEnv, port: u16) -> Self {
        let server_lock = test_server_lock()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
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

        while let Some(message) = self.socket.next().await {
            let message = message.expect("response frame should decode");
            if !message.is_text() {
                continue;
            }

            let response: ResponseFrame =
                serde_json::from_str(message.to_text().expect("response should be text"))
                    .expect("response should match protocol shape");

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

    pub fn gate_root(&self) -> std::path::PathBuf {
        self.env.home.join(".epi").join("gate")
    }

    pub fn transcript_path(&self, session_key: &str) -> std::path::PathBuf {
        chat::transcript_path(self.gate_root(), session_key)
    }
}

fn test_server_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}
