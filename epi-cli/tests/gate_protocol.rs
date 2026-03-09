mod support;

use std::time::Duration;

use futures_util::StreamExt;
use serde_json::Value;
use support::{run_epi, spawn_epi_background, temp_env};
use tokio_tungstenite::connect_async;

#[tokio::test]
async fn gate_status_reports_explicit_test_port() {
    let handle = spawn_epi_background(&["gate", "start", "--port", "8421"], temp_env());
    let hello = wait_for_hello(8421)
        .await
        .expect("gateway should accept websocket clients");

    let out = run_epi(&["--json", "gate", "status"], handle.env());
    assert!(
        out.status.success(),
        "status failed: {}",
        out.stderr
    );
    assert_eq!(hello["type"], "hello-ok");
    assert!(out.stdout.contains("\"port\":8421"), "stdout: {}", out.stdout);
    assert!(out.stdout.contains("\"running\":true"), "stdout: {}", out.stdout);
}

#[tokio::test]
async fn gate_start_accepts_real_websocket_connections() {
    let port = 18421;
    let handle = spawn_epi_background(
        &["gate", "start", "--port", &port.to_string()],
        temp_env(),
    );

    let hello = wait_for_hello(port).await.expect("gateway should accept websocket clients");

    assert_eq!(hello["type"], "hello-ok");
    assert_eq!(hello["protocol"], 3);

    let status = run_epi(&["--json", "gate", "status"], handle.env());
    assert!(status.status.success(), "status failed: {}", status.stderr);
    assert!(status.stdout.contains(&format!("\"port\":{port}")), "stdout: {}", status.stdout);
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
