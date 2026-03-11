use std::collections::BTreeMap;
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::Duration;

use clap::Args;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio_tungstenite::connect_async;

use crate::sesh::session::{load_env_file, read_session_state, repo_root_from_env, SessionState};
use crate::{
    agent::session::{self, SessionCmd},
    app,
    gate::{config, parity},
    sesh, techne,
};

#[derive(Args, Debug, Clone)]
pub struct UpCmd {
    #[arg(long)]
    pub no_app: bool,
    #[arg(long)]
    pub no_graph: bool,
    #[arg(long)]
    pub no_tmux: bool,
    #[arg(long)]
    pub attach: bool,
    #[arg(long, default_value_t = parity::DEFAULT_GATEWAY_PORT)]
    pub port: u16,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct UpStep {
    name: String,
    status: String,
    detail: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct GatewaySummary {
    port: u16,
    pid: Option<u32>,
    url: String,
    state_root: String,
    stdout_log: Option<String>,
    stderr_log: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct UpSummary {
    ok: bool,
    repo_root: String,
    session: Value,
    gateway: GatewaySummary,
    steps: Vec<UpStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GatewayProcessRecord {
    pid: u32,
    port: u16,
    stdout_log: String,
    stderr_log: String,
}

pub async fn dispatch(cmd: &UpCmd, json_output: bool) -> Result<String, String> {
    if cmd.attach && cmd.no_tmux {
        return Err("epi up attach: --attach requires tmux support".to_owned());
    }

    let repo_root = repo_root_from_env();
    let env_map = load_env_file(&repo_root)?;
    let mut steps = Vec::new();

    steps.push(ok_step(
        "repo-env",
        format!(
            "loaded {} env entries from {}",
            env_map.len(),
            repo_root.join(".epi-logos.env").display()
        ),
    ));

    let session = ensure_session(&repo_root)?;
    steps.push(ok_step(
        "session-init",
        format!("session {}", session.context.session_id),
    ));

    if !session.context.now_path.exists() {
        return Err(format!(
            "epi up vault-check: NOW path missing at {}",
            session.context.now_path.display()
        ));
    }
    steps.push(ok_step(
        "vault-check",
        format!("NOW path ready at {}", session.context.now_path.display()),
    ));

    if !cmd.no_graph {
        run_graph_step("graph-up", &["--json", "graph", "up"], &repo_root, &env_map)?;
        let doctor = run_graph_step(
            "graph-doctor",
            &["--json", "graph", "doctor"],
            &repo_root,
            &env_map,
        )?;
        let doctor_json: Value =
            serde_json::from_str(&doctor).map_err(|err| format!("epi up graph-doctor: {err}"))?;
        if doctor_json["ok"] != Value::Bool(true) {
            return Err(format!(
                "epi up graph-doctor: graph stack is degraded\n{}",
                serde_json::to_string_pretty(&doctor_json).unwrap_or_else(|_| doctor)
            ));
        }
        steps.push(ok_step("graph-up", "graph stack started".to_owned()));
        steps.push(ok_step(
            "graph-doctor",
            "graph stack reported healthy".to_owned(),
        ));
    }

    let gateway = ensure_gateway(cmd.port, &repo_root, &env_map).await?;
    steps.push(ok_step(
        "gateway-start",
        match gateway.pid {
            Some(pid) => format!("spawned gateway pid {pid}"),
            None => "reusing existing gateway".to_owned(),
        },
    ));
    steps.push(ok_step(
        "gateway-ready",
        format!("gateway answered at {}", gateway.url),
    ));

    if !cmd.no_tmux {
        run_command(
            sesh::command_for(&sesh::SeshCmd::Launch),
            "tmux-launch",
            &repo_root,
            &env_map,
        )?;
        steps.push(ok_step(
            "tmux-launch",
            "tmux session bootstrapped".to_owned(),
        ));
    }

    if !cmd.no_app {
        run_command(
            app::launch_command_for_repo(&repo_root),
            "app-launch",
            &repo_root,
            &env_map,
        )?;
        steps.push(ok_step(
            "app-launch",
            "app launch command completed".to_owned(),
        ));
    }

    if cmd.attach {
        let args = vec!["list-workspaces".to_owned()];
        run_command(
            techne::cmux_command(&args),
            "cmux-attach",
            &repo_root,
            &env_map,
        )?;
        steps.push(ok_step("cmux-attach", "cmux surface attached".to_owned()));
    }

    let summary = UpSummary {
        ok: true,
        repo_root: repo_root.display().to_string(),
        session: json!({
            "sessionId": session.context.session_id,
            "dayId": session.context.day_id,
            "nowPath": session.context.now_path.display().to_string(),
        }),
        gateway,
        steps,
    };

    if json_output {
        serde_json::to_string(&summary).map_err(|err| err.to_string())
    } else {
        Ok(render_human(&summary))
    }
}

fn ensure_session(repo_root: &Path) -> Result<SessionState, String> {
    match read_session_state(repo_root) {
        Ok(state) => Ok(state),
        Err(_) => {
            session::run(
                &SessionCmd::Init {
                    now: None,
                    random_suffix: None,
                },
                false,
            )?;
            read_session_state(repo_root)
        }
    }
}

fn run_graph_step(
    name: &str,
    args: &[&str],
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> Result<String, String> {
    let mut command = current_exe_command()?;
    command.args(args);
    run_command_capture(command, name, repo_root, env_map)
}

async fn ensure_gateway(
    port: u16,
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> Result<GatewaySummary, String> {
    let gate_root = config::gate_root_from_env()?;
    let url = format!("ws://127.0.0.1:{port}");

    if probe_gateway(&url).await.is_ok() {
        let record = read_gateway_process_record(&gate_root).ok();
        return Ok(GatewaySummary {
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
        .map_err(|err| format!("epi up gateway-start: {err}"))?;
    let pid = child.id();

    if let Err(err) = wait_for_gateway_ready(&url, &mut child).await {
        let _ = child.kill();
        let stderr_tail = fs::read_to_string(&stderr_log).unwrap_or_default();
        return Err(format!("epi up gateway-ready: {err}\n{stderr_tail}"));
    }

    let record = GatewayProcessRecord {
        pid,
        port,
        stdout_log: stdout_log.display().to_string(),
        stderr_log: stderr_log.display().to_string(),
    };
    write_gateway_process_record(&gate_root, &record)?;

    Ok(GatewaySummary {
        port,
        pid: Some(pid),
        url,
        state_root: gate_root.display().to_string(),
        stdout_log: Some(record.stdout_log),
        stderr_log: Some(record.stderr_log),
    })
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

async fn probe_gateway(url: &str) -> Result<(), String> {
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

    Err(format!("unexpected gateway probe frame: {}", frame))
}

fn run_command_capture(
    mut command: Command,
    step_name: &str,
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> Result<String, String> {
    apply_command_env(&mut command, repo_root, env_map);
    let output = command
        .output()
        .map_err(|err| format!("epi up {step_name}: {err}"))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_owned())
    } else {
        Err(format!(
            "epi up {step_name}: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

fn run_command(
    command: Command,
    step_name: &str,
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> Result<(), String> {
    run_command_capture(command, step_name, repo_root, env_map).map(|_| ())
}

fn apply_command_env(command: &mut Command, repo_root: &Path, env_map: &BTreeMap<String, String>) {
    command.current_dir(repo_root);
    command.env("EPI_REPO_ROOT", repo_root);
    command.envs(env_map);
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

fn ok_step(name: &str, detail: String) -> UpStep {
    UpStep {
        name: name.to_owned(),
        status: "ok".to_owned(),
        detail,
    }
}

fn render_human(summary: &UpSummary) -> String {
    let mut lines = vec![
        format!("repo: {}", summary.repo_root),
        format!(
            "session: {}",
            summary.session["sessionId"].as_str().unwrap_or_default()
        ),
        format!("gateway: {}", summary.gateway.url),
    ];
    for step in &summary.steps {
        lines.push(format!("{} [{}] {}", step.name, step.status, step.detail));
    }
    lines.join("\n")
}
