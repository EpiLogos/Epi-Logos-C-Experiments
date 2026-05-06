use std::collections::BTreeMap;
use std::path::Path;
use std::process::Command;

use clap::Args;
use serde::Serialize;
use serde_json::{json, Value};

use crate::sesh::session::{load_env_file, read_session_state, repo_root_from_env, SessionState};
use crate::{
    agent::session::{self, SessionCmd},
    app,
    gate::{parity, preflight},
    techne,
};

#[derive(Args, Debug, Clone)]
pub struct UpCmd {
    #[arg(long)]
    pub no_app: bool,
    #[arg(long)]
    pub no_graph: bool,
    /// Skip cmux workspace launch
    #[arg(long)]
    pub no_cmux: bool,
    #[arg(long, hide = true)] // kept for backwards-compat; alias for --no-cmux
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
struct UpSummary {
    ok: bool,
    repo_root: String,
    session: Value,
    gateway: preflight::GatewayReady,
    steps: Vec<UpStep>,
}

pub async fn dispatch(cmd: &UpCmd, json_output: bool) -> Result<String, String> {
    let skip_cmux = cmd.no_cmux || cmd.no_tmux;
    if cmd.attach && skip_cmux {
        return Err("epi up attach: --attach requires cmux support (remove --no-cmux)".to_owned());
    }

    let repo_root = repo_root_from_env();
    let mut env_map = load_env_file(&repo_root)?;
    env_map.insert(
        "EPI_GATE_STATE_ROOT".to_owned(),
        repo_root.join(".epi").join("gate").display().to_string(),
    );
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

        // Step 6: pasu-init — seed Redis HOT identity tier from PASU.md frontmatter
        match run_graph_step(
            "pasu-init",
            &["--json", "nara", "wind", "--profile"],
            &repo_root,
            &env_map,
        ) {
            Ok(_) => steps.push(ok_step(
                "pasu-init",
                "identity seeded from PASU profile".to_owned(),
            )),
            Err(e) => {
                // Non-fatal: no PASU data yet is acceptable at first run
                steps.push(warn_step(
                    "pasu-init",
                    format!(
                        "skipped (no profile yet): {}",
                        e.lines().next().unwrap_or("?")
                    ),
                ))
            }
        }

        // Step 6b: graphiti-up — start Graphiti episodic sidecar
        match run_graph_step(
            "graphiti-up",
            &["gate", "graphiti", "start"],
            &repo_root,
            &env_map,
        ) {
            Ok(_) => steps.push(ok_step(
                "graphiti-up",
                "graphiti sidecar ready on port 37778".to_owned(),
            )),
            Err(e) => steps.push(warn_step(
                "graphiti-up",
                format!(
                    "graphiti sidecar skipped: {}",
                    e.lines().next().unwrap_or("?")
                ),
            )),
        }
    }

    let gateway = preflight::ensure_gateway_ready(cmd.port, &repo_root, &env_map)
        .await
        .map_err(|err| format!("epi up {err}"))?;
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

    if !skip_cmux {
        run_command(
            techne::cmux_command(&[
                "surface-create".to_owned(),
                "--name".to_owned(),
                "main".to_owned(),
                "--cp".to_owned(),
                "4.4".to_owned(),
            ]),
            "cmux-launch",
            &repo_root,
            &env_map,
        )?;
        steps.push(ok_step("cmux-launch", "cmux workspace ready".to_owned()));
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

fn ok_step(name: &str, detail: String) -> UpStep {
    UpStep {
        name: name.to_owned(),
        status: "ok".to_owned(),
        detail,
    }
}

fn warn_step(name: &str, detail: String) -> UpStep {
    UpStep {
        name: name.to_owned(),
        status: "warn".to_owned(),
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
