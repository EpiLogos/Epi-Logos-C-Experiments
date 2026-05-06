use std::collections::BTreeMap;
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio_tungstenite::connect_async;

use super::config;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayReady {
    pub port: u16,
    pub pid: Option<u32>,
    pub url: String,
    pub state_root: String,
    pub stdout_log: Option<String>,
    pub stderr_log: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GatewayProcessRecord {
    pid: u32,
    port: u16,
    stdout_log: String,
    stderr_log: String,
}

pub async fn ensure_gateway_ready(
    port: u16,
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> Result<GatewayReady, String> {
    let gate_root = gate_root_from_env_map(env_map)?;
    let url = format!("ws://127.0.0.1:{port}");

    if probe_gateway(&url).await.is_ok() {
        let record = read_gateway_process_record(&gate_root).ok();
        return Ok(GatewayReady {
            port,
            pid: record.as_ref().map(|entry| entry.pid),
            url,
            state_root: gate_root.display().to_string(),
            stdout_log: record.as_ref().map(|entry| entry.stdout_log.clone()),
            stderr_log: record.as_ref().map(|entry| entry.stderr_log.clone()),
        });
    }

    let runtime_dir = gate_root.join("up");
    fs::create_dir_all(&runtime_dir).map_err(|err| err.to_string())?;
    let stdout_log = runtime_dir.join(format!("gateway-{port}.stdout.log"));
    let stderr_log = runtime_dir.join(format!("gateway-{port}.stderr.log"));

    let stdout = File::create(&stdout_log).map_err(|err| err.to_string())?;
    let stderr = File::create(&stderr_log).map_err(|err| err.to_string())?;

    let mut command = current_exe_command()?;
    command
        .args(["--json", "gate", "start", "--port", &port.to_string()])
        .stdin(Stdio::null())
        .stdout(Stdio::from(stdout))
        .stderr(Stdio::from(stderr));
    apply_command_env(&mut command, repo_root, env_map);

    let mut child = command
        .spawn()
        .map_err(|err| format!("gateway-start: {err}"))?;
    let pid = child.id();

    if let Err(err) = wait_for_gateway_ready(&url, &mut child).await {
        let _ = child.kill();
        let stderr_tail = fs::read_to_string(&stderr_log).unwrap_or_default();
        return Err(format!("gateway-ready: {err}\n{stderr_tail}"));
    }

    let record = GatewayProcessRecord {
        pid,
        port,
        stdout_log: stdout_log.display().to_string(),
        stderr_log: stderr_log.display().to_string(),
    };
    write_gateway_process_record(&gate_root, &record)?;

    Ok(GatewayReady {
        port,
        pid: Some(pid),
        url,
        state_root: gate_root.display().to_string(),
        stdout_log: Some(record.stdout_log),
        stderr_log: Some(record.stderr_log),
    })
}

pub async fn probe_gateway(url: &str) -> Result<(), String> {
    let (mut socket, _) = connect_async(url)
        .await
        .map_err(|err| format!("connect failed: {err}"))?;

    let frame = tokio::time::timeout(Duration::from_secs(2), async {
        loop {
            let message = socket
                .next()
                .await
                .ok_or_else(|| "gateway closed before hello".to_owned())?
                .map_err(|err| err.to_string())?;
            if !message.is_text() {
                continue;
            }
            return serde_json::from_str::<Value>(
                message.to_text().map_err(|err| err.to_string())?,
            )
            .map_err(|err| err.to_string());
        }
    })
    .await
    .map_err(|_| "hello probe timed out".to_owned())??;

    if frame.get("type").and_then(Value::as_str) == Some("hello-ok") {
        return Ok(());
    }

    Err(format!("unexpected gateway probe frame: {frame}"))
}

async fn wait_for_gateway_ready(url: &str, child: &mut std::process::Child) -> Result<(), String> {
    let deadline = std::time::Instant::now() + Duration::from_secs(10);
    let mut last_error = "gateway probe did not run".to_owned();

    while std::time::Instant::now() < deadline {
        if let Some(status) = child
            .try_wait()
            .map_err(|err| format!("failed to poll gateway child: {err}"))?
        {
            return Err(format!("gateway process exited early with status {status}"));
        }

        match probe_gateway(url).await {
            Ok(()) => return Ok(()),
            Err(err) => last_error = err,
        }

        tokio::time::sleep(Duration::from_millis(100)).await;
    }

    Err(last_error)
}

fn apply_command_env(command: &mut Command, repo_root: &Path, env_map: &BTreeMap<String, String>) {
    command.current_dir(repo_root);
    command.env("EPI_REPO_ROOT", repo_root);
    command.envs(env_map);
}

fn gate_root_from_env_map(env_map: &BTreeMap<String, String>) -> Result<PathBuf, String> {
    if let Some(root) = env_map.get("EPI_GATE_STATE_ROOT") {
        return Ok(PathBuf::from(root));
    }
    config::gate_root_from_env()
}

fn current_exe_command() -> Result<Command, String> {
    let exe = std::env::current_exe().map_err(|err| err.to_string())?;
    Ok(Command::new(exe))
}

fn gateway_process_record_path(gate_root: &Path) -> PathBuf {
    gate_root.join("up").join("gateway-process.json")
}

fn write_gateway_process_record(
    gate_root: &Path,
    record: &GatewayProcessRecord,
) -> Result<(), String> {
    let path = gateway_process_record_path(gate_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let body = serde_json::to_string_pretty(record).map_err(|err| err.to_string())?;
    fs::write(path, body).map_err(|err| err.to_string())
}

fn read_gateway_process_record(gate_root: &Path) -> Result<GatewayProcessRecord, String> {
    let body = fs::read_to_string(gateway_process_record_path(gate_root))
        .map_err(|err| err.to_string())?;
    serde_json::from_str(&body).map_err(|err| err.to_string())
}
