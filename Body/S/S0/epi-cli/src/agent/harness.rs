use crate::agent::runtime::PiLaunchPlan;
use clap::{Args, ValueEnum};
use serde::Serialize;
use std::ffi::OsString;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tokio::process::Command as TokioCommand;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
#[clap(rename_all = "kebab-case")]
pub enum HarnessId {
    Pi,
    ClaudeNative,
    CodexNative,
    HermesAcp,
}

#[derive(Debug, Clone, Args)]
pub struct HarnessLaunchArgs {
    /// Harness profile to launch
    #[arg(long, value_enum)]
    pub harness: HarnessId,
    /// Optional Claude profile file under ~/.claude/profiles/
    #[arg(long)]
    pub profile: Option<String>,
    /// ACP Unix socket path for socket-backed harnesses
    #[arg(long)]
    pub socket: Option<PathBuf>,
    /// Arguments forwarded to the harness process
    #[arg(trailing_var_arg = true, allow_hyphen_values = true)]
    pub args: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CodeHarnessProfile {
    pub profile: Option<String>,
    pub args: Vec<String>,
}

#[derive(Debug, Clone)]
pub enum HarnessProfile {
    Pi(PiLaunchPlan),
    ClaudeNative(CodeHarnessProfile),
    CodexNative(Vec<String>),
    HermesAcp { socket_path: PathBuf },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreparedHarnessCommand {
    pub harness_id: HarnessId,
    pub program: String,
    pub args: Vec<String>,
    pub env: Vec<(String, OsString)>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HarnessLaunchReport {
    status: String,
    harness_id: HarnessId,
    command: Option<String>,
    acp_socket: Option<String>,
}

pub fn launch_cli(args: &HarnessLaunchArgs, json: bool) -> Result<String, String> {
    match args.harness {
        HarnessId::Pi => {
            let plan = crate::agent::runtime::plan_run(
                Some(crate::agent::DEFAULT_PI_AGENT_ID),
                None,
                &[],
                &args.args,
            )?;
            crate::agent::tmux::run_plan(&plan, json)
        }
        HarnessId::ClaudeNative => launch_blocking(
            &HarnessProfile::ClaudeNative(CodeHarnessProfile {
                profile: args.profile.clone(),
                args: args.args.clone(),
            }),
            json,
        ),
        HarnessId::CodexNative => {
            launch_blocking(&HarnessProfile::CodexNative(args.args.clone()), json)
        }
        HarnessId::HermesAcp => {
            let socket_path = args.socket.clone().ok_or_else(|| {
                "epi agent launch --harness hermes-acp requires --socket <path>".to_owned()
            })?;
            connect_acp_socket(&socket_path)?;
            let report = HarnessLaunchReport {
                status: "connected".to_owned(),
                harness_id: HarnessId::HermesAcp,
                command: None,
                acp_socket: Some(socket_path.display().to_string()),
            };
            render_report(report, json)
        }
    }
}

pub fn launch_blocking(profile: &HarnessProfile, json: bool) -> Result<String, String> {
    let prepared = prepare_blocking_command(profile)?;
    let mut command = command_from_prepared(&prepared);
    let status = command
        .stdin(Stdio::inherit())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .map_err(|err| {
            format!(
                "failed to launch {}: {err}",
                harness_label(prepared.harness_id)
            )
        })?;

    if !status.success() {
        std::process::exit(status.code().unwrap_or(1));
    }

    let report = HarnessLaunchReport {
        status: "ok".to_owned(),
        harness_id: prepared.harness_id,
        command: Some(render_command(&prepared)),
        acp_socket: None,
    };
    render_report(report, json)
}

pub fn launch_interactive_pi(plan: &PiLaunchPlan) -> Result<String, String> {
    let status = configure_std_command(plan)
        .stdin(Stdio::inherit())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    if status.success() {
        Ok(String::new())
    } else {
        Err(format!("pi exited with status {status}"))
    }
}

pub fn prepare_blocking_command(
    profile: &HarnessProfile,
) -> Result<PreparedHarnessCommand, String> {
    match profile {
        HarnessProfile::Pi(plan) => Ok(PreparedHarnessCommand {
            harness_id: HarnessId::Pi,
            program: "pi".to_owned(),
            args: plan.args.clone(),
            env: plan_env(plan, &[]),
        }),
        HarnessProfile::ClaudeNative(profile) => {
            if let Some(profile_name) = &profile.profile {
                Ok(PreparedHarnessCommand {
                    harness_id: HarnessId::ClaudeNative,
                    program: "bash".to_owned(),
                    args: vec![
                        "-c".to_owned(),
                        format!(
                            "source ~/.claude/api-keys.env 2>/dev/null; \
                             source ~/.claude/profiles/{}; \
                             exec claude {}",
                            profile_name,
                            profile
                                .args
                                .iter()
                                .map(|arg| shell_escape(arg))
                                .collect::<Vec<_>>()
                                .join(" ")
                        ),
                    ],
                    env: Vec::new(),
                })
            } else {
                Ok(PreparedHarnessCommand {
                    harness_id: HarnessId::ClaudeNative,
                    program: "claude".to_owned(),
                    args: profile.args.clone(),
                    env: Vec::new(),
                })
            }
        }
        HarnessProfile::CodexNative(args) => Ok(PreparedHarnessCommand {
            harness_id: HarnessId::CodexNative,
            program: "codex".to_owned(),
            args: args.clone(),
            env: Vec::new(),
        }),
        HarnessProfile::HermesAcp { .. } => {
            Err("hermes-acp connects over an ACP socket, not a tmux/std command".to_owned())
        }
    }
}

pub fn configure_std_command(plan: &PiLaunchPlan) -> Command {
    let prepared = prepare_blocking_command(&HarnessProfile::Pi(plan.clone()))
        .expect("PI launch profile should prepare");
    command_from_prepared(&prepared)
}

pub fn configure_tokio_command(plan: &PiLaunchPlan) -> TokioCommand {
    let prepared = prepare_blocking_command(&HarnessProfile::Pi(plan.clone()))
        .expect("PI launch profile should prepare");
    let mut command = TokioCommand::new(&prepared.program);
    command.args(&prepared.args);
    for (key, value) in prepared.env {
        command.env(key, value);
    }
    command
}

pub fn pi_command_argv(plan: &PiLaunchPlan) -> Vec<String> {
    let pi = resolve_binary_on_path("pi")
        .map(|path| path.display().to_string())
        .unwrap_or_else(|| "pi".to_owned());
    let mut argv = vec![pi];
    argv.extend(plan.args.iter().cloned());
    argv
}

pub fn plan_env(plan: &PiLaunchPlan, extra: &[(&str, String)]) -> Vec<(String, OsString)> {
    let mut env = Vec::new();
    if let Ok(current_exe) = std::env::current_exe() {
        env.push(("EPI_CLI_BIN".to_owned(), current_exe.into_os_string()));
    }
    if let Some(path) = path_with_current_exe_dir() {
        env.push(("PATH".to_owned(), path));
    }
    env.push((
        "EPI_REPO_ROOT".to_owned(),
        plan.repo_root.clone().into_os_string(),
    ));
    env.push(("EPI_AGENT_NAME".to_owned(), plan.agent_id.clone().into()));
    env.push(("EPI_AGENT_ID".to_owned(), plan.agent_id.clone().into()));
    if let Some(role) = &plan.role {
        env.push(("EPI_AGENT_ROLE".to_owned(), role.clone().into()));
        env.push((
            "EPI_AGENT_SCOPED_SURFACE".to_owned(),
            format!("{}:{role}", plan.agent_id).into(),
        ));
    }
    env.push((
        "PI_CODING_AGENT_DIR".to_owned(),
        plan.agent_dir.clone().into_os_string(),
    ));
    env.push((
        "EPI_AGENT_DIR".to_owned(),
        plan.agent_dir.clone().into_os_string(),
    ));
    env.push((
        "EPI_AGENT_HOME".to_owned(),
        plan.epi_home.clone().into_os_string(),
    ));
    env.push((
        "EPI_AGENT_PROMPTS_DIR".to_owned(),
        plan.prompts_dir.clone().into_os_string(),
    ));
    env.push((
        "EPI_AGENT_PLUGIN_RUNTIME_PATH".to_owned(),
        plan.plugin_runtime_path.clone().into_os_string(),
    ));
    env.push((
        "EPI_GATE_STATE_ROOT".to_owned(),
        plan.gate_state_root.clone().into_os_string(),
    ));
    env.push((
        "EPI_AGENT_GATEWAY_PORT".to_owned(),
        plan.gateway_port.to_string().into(),
    ));
    env.push((
        "EPI_AGENT_GATEWAY_URL".to_owned(),
        plan.gateway_url.clone().into(),
    ));
    env.push((
        "CODEX_HOME".to_owned(),
        plan.codex_home.clone().into_os_string(),
    ));
    if let Ok(paths) = std::env::join_paths(&plan.skill_roots) {
        env.push(("EPI_GATE_SKILLS_PATHS".to_owned(), paths));
    }
    if let Some(path) = &plan.result_parent_now_path {
        env.push((
            "EPI_PARENT_NOW_PATH".to_owned(),
            path.clone().into_os_string(),
        ));
    }
    if let Some(path) = &plan.result_drop_dir {
        env.push((
            "EPI_RESULT_DROP_DIR".to_owned(),
            path.clone().into_os_string(),
        ));
    }
    if let Some(path) = &plan.result_day_dir {
        env.push((
            "EPI_RESULT_DAY_DIR".to_owned(),
            path.clone().into_os_string(),
        ));
    }
    for (key, value) in extra {
        env.push(((*key).to_owned(), value.clone().into()));
    }
    env
}

pub fn apply_plan_env(command: &mut Command, plan: &PiLaunchPlan, extra: &[(&str, String)]) {
    for (key, value) in plan_env(plan, extra) {
        command.env(key, value);
    }
}

pub fn path_with_current_exe_dir() -> Option<OsString> {
    let current_exe = std::env::current_exe().ok()?;
    let current_exe_dir = current_exe.parent()?.to_path_buf();
    let mut paths = vec![current_exe_dir];
    if let Some(existing) = std::env::var_os("PATH") {
        paths.extend(std::env::split_paths(&existing));
    }
    std::env::join_paths(paths).ok()
}

fn command_from_prepared(prepared: &PreparedHarnessCommand) -> Command {
    let mut command = Command::new(&prepared.program);
    command.args(&prepared.args);
    for (key, value) in &prepared.env {
        command.env(key, value);
    }
    command
}

fn connect_acp_socket(socket_path: &std::path::Path) -> Result<(), String> {
    #[cfg(unix)]
    {
        std::os::unix::net::UnixStream::connect(socket_path)
            .map(|_| ())
            .map_err(|err| {
                format!(
                    "failed to connect ACP socket {}: {err}",
                    socket_path.display()
                )
            })
    }
    #[cfg(not(unix))]
    {
        let _ = socket_path;
        Err("hermes-acp socket launch is only supported on Unix platforms".to_owned())
    }
}

fn render_report(report: HarnessLaunchReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else if let Some(command) = report.command {
        Ok(command)
    } else if let Some(socket) = report.acp_socket {
        Ok(format!("{} {}", report.status, socket))
    } else {
        Ok(report.status)
    }
}

fn render_command(prepared: &PreparedHarnessCommand) -> String {
    let mut parts = Vec::with_capacity(prepared.args.len() + 1);
    parts.push(prepared.program.clone());
    parts.extend(prepared.args.clone());
    parts.join(" ")
}

fn resolve_binary_on_path(name: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .map(|dir| dir.join(name))
        .find(|candidate| candidate.is_file())
}

fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

fn harness_label(harness_id: HarnessId) -> &'static str {
    match harness_id {
        HarnessId::Pi => "pi",
        HarnessId::ClaudeNative => "claude",
        HarnessId::CodexNative => "codex",
        HarnessId::HermesAcp => "hermes-acp",
    }
}
