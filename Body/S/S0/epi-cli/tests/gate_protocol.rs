mod support;

use std::time::Duration;

use epi_logos::gate::{config::GatewayConfig, parity, server};
use futures_util::StreamExt;
use serde_json::Value;
use support::{run_epi, temp_env};
use tokio_tungstenite::connect_async;

#[tokio::test]
async fn gate_status_reports_explicit_test_port() {
    let port = parity::TEST_GATEWAY_PORT;
    let env = temp_env();
    let mut config = GatewayConfig::with_port(port);
    config.state_root = Some(env.home.join(".epi").join("gate").display().to_string());
    let status = server::status_from_config(&config).expect("status should render from config");
    let status_path = env.home.join(".epi").join("gate").join("status.json");
    std::fs::create_dir_all(status_path.parent().expect("status should have parent"))
        .expect("status parent should be creatable");
    std::fs::write(
        &status_path,
        serde_json::to_string_pretty(&status).expect("status should serialize"),
    )
    .expect("status file should be writable");

    let out = run_epi(&["--json", "gate", "status"], &env);
    assert!(out.status.success(), "status failed: {}", out.stderr);
    assert!(
        out.stdout.contains(&format!("\"port\":{port}")),
        "stdout: {}",
        out.stdout
    );
    assert!(
        out.stdout.contains("\"running\":true"),
        "stdout: {}",
        out.stdout
    );
}

#[tokio::test]
async fn gate_server_accepts_real_websocket_connections_on_custom_port() {
    let port = 28794;
    let _server = server::spawn_test_server(port)
        .await
        .expect("test gateway should bind custom port");

    let hello = wait_for_hello(port)
        .await
        .expect("gateway should accept websocket clients");

    assert_eq!(hello["type"], "hello-ok");
    assert_eq!(hello["protocol"], epi_s3_gateway_contract::PROTOCOL_VERSION);
}

async fn wait_for_hello(port: u16) -> Result<Value, String> {
    let url = format!("ws://127.0.0.1:{port}");

    for _ in 0..40 {
        match connect_async(&url).await {
            Ok((mut socket, _)) => {
                let Some(message) = socket.next().await else {
                    return Err("gateway closed connection before hello".to_owned());
                };
                let message = message.map_err(|err| err.to_string())?;
                let text = message.to_text().map_err(|err| err.to_string())?;
                let hello = serde_json::from_str(text).map_err(|err| err.to_string())?;
                return Ok(hello);
            }
            Err(_) => tokio::time::sleep(Duration::from_millis(50)).await,
        }
    }

    Err(format!("gateway did not start listening on {url}"))
}
