use crate::agent::launch;
use crate::agent::runtime::{self, PiLaunchMode, PiLaunchPlan};
use crate::gate::preflight;
use crate::sesh::session::load_env_file;
use serde::Serialize;
use std::fs;
use std::process::Stdio;
use tokio::process::{Child, Command as TokioCommand};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SpawnReport {
    status: String,
    agent_id: String,
    command: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRuntimeReport {
    status: String,
    agent_id: String,
    command: String,
    runtime_root: String,
    home_path: String,
    cwd: String,
    agent_dir: String,
    plugin_runtime_path: String,
    event_log_path: String,
    stdout: String,
    stderr: String,
}

pub struct SpawnedPiProcess {
    pub agent_id: String,
    pub child: Child,
    pub command: String,
}

pub async fn spawn(
    agent: Option<&str>,
    role: Option<&str>,
    persist: bool,
    plugin_dirs: &[std::path::PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let plan = runtime::plan_spawn(agent, role, plugin_dirs, prompt)?;
    if persist {
        return crate::agent::tmux::run_plan(&plan, json);
    }
    execute_plan(&plan, json).await
}

pub fn run_prompt(
    agent: Option<&str>,
    plugin_dirs: &[std::path::PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let plan = runtime::plan_prompt(agent, None, plugin_dirs, prompt)?;
    invoke_pi(&plan, json)
}

pub async fn attach(agent: Option<&str>, session_id: &str, json: bool) -> Result<String, String> {
    let plan = runtime::plan_attach(agent, session_id)?;
    execute_plan(&plan, json).await
}

pub async fn run_pi(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[std::path::PathBuf],
    args: &[String],
    json: bool,
) -> Result<String, String> {
    let plan = runtime::plan_run(agent, role, plugin_dirs, args)?;
    execute_plan(&plan, json).await
}

pub fn spawn_process(
    agent: Option<&str>,
    plugin_dirs: &[std::path::PathBuf],
    prompt: Option<&str>,
) -> Result<SpawnedPiProcess, String> {
    let plan = runtime::plan_prompt(agent, None, plugin_dirs, prompt)?;
    let command = format!("pi {}", plan.args.join(" "));
    let child = configure_tokio_command(&plan)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    Ok(SpawnedPiProcess {
        agent_id: plan.agent_id.clone(),
        child,
        command,
    })
}

pub async fn verify_runtime(
    agent: Option<&str>,
    role: Option<&str>,
    plugin_dirs: &[std::path::PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let plan = runtime::plan_verify_runtime(agent, role, plugin_dirs, prompt)?;
    let runtime_root = plan
        .runtime_root
        .clone()
        .ok_or_else(|| "verify plan missing runtime root".to_owned())?;
    let home_path = plan
        .home_override
        .clone()
        .ok_or_else(|| "verify plan missing home override".to_owned())?;
    let cwd = plan
        .working_dir
        .clone()
        .ok_or_else(|| "verify plan missing working directory".to_owned())?;
    fs::create_dir_all(&home_path).map_err(|err| err.to_string())?;
    fs::create_dir_all(&cwd).map_err(|err| err.to_string())?;

    let output = launch::configure_std_command(&plan)
        .current_dir(&cwd)
        .env("HOME", &home_path)
        .env("EPI_AGENT_HOME", &plan.epi_home)
        .output()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    if !output.status.success() {
        return Err(format!(
            "pi runtime verification failed with status {}.\nstdout:\n{}\nstderr:\n{}",
            output.status, stdout, stderr
        ));
    }

    let report = VerifyRuntimeReport {
        status: "ok".to_owned(),
        agent_id: plan.agent_id.clone(),
        command: format!("pi {}", plan.args.join(" ")),
        runtime_root: runtime_root.display().to_string(),
        home_path: home_path.display().to_string(),
        cwd: cwd.display().to_string(),
        agent_dir: plan.agent_dir.display().to_string(),
        plugin_runtime_path: plan.plugin_runtime_path.display().to_string(),
        event_log_path: plan
            .agent_dir
            .join("plugin-runtime-events.jsonl")
            .display()
            .to_string(),
        stdout,
        stderr,
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!("{}: {}", report.status, report.event_log_path))
    }
}

pub async fn execute_plan(plan: &PiLaunchPlan, json: bool) -> Result<String, String> {
    match plan.launch_mode {
        PiLaunchMode::InteractiveInherit => {
            if json {
                Err("interactive PI launches do not support --json".to_owned())
            } else {
                ensure_gateway_preflight(plan).await?;
                launch::launch_interactive(plan)
            }
        }
        PiLaunchMode::CapturedPrompt | PiLaunchMode::IsolatedVerify => invoke_pi(plan, json),
    }
}

fn invoke_pi(plan: &PiLaunchPlan, json: bool) -> Result<String, String> {
    let output = launch::configure_std_command(plan)
        .output()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    if json {
        let report = SpawnReport {
            status: "ok".to_owned(),
            agent_id: plan.agent_id.clone(),
            command: format!("pi {}", plan.args.join(" ")),
        };
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

fn configure_tokio_command(plan: &PiLaunchPlan) -> TokioCommand {
    let mut command = TokioCommand::new("pi");
    command.args(&plan.args);
    if let Ok(current_exe) = std::env::current_exe() {
        command.env("EPI_CLI_BIN", &current_exe);
    }
    if let Some(path) = launch::path_with_current_exe_dir() {
        command.env("PATH", path);
    }
    command.env("EPI_REPO_ROOT", &plan.repo_root);
    command.env("EPI_AGENT_NAME", &plan.agent_id);
    command.env("EPI_AGENT_ID", &plan.agent_id);
    if let Some(role) = &plan.role {
        command.env("EPI_AGENT_ROLE", role);
        command.env(
            "EPI_AGENT_SCOPED_SURFACE",
            format!("{}:{role}", plan.agent_id),
        );
    }
    command.env("PI_CODING_AGENT_DIR", &plan.agent_dir);
    command.env("EPI_AGENT_DIR", &plan.agent_dir);
    command.env("EPI_AGENT_HOME", &plan.epi_home);
    command.env("EPI_AGENT_PROMPTS_DIR", &plan.prompts_dir);
    command.env("EPI_AGENT_PLUGIN_RUNTIME_PATH", &plan.plugin_runtime_path);
    command.env("EPI_GATE_STATE_ROOT", &plan.gate_state_root);
    command.env("EPI_AGENT_GATEWAY_PORT", plan.gateway_port.to_string());
    command.env("EPI_AGENT_GATEWAY_URL", &plan.gateway_url);
    command.env("CODEX_HOME", &plan.codex_home);
    if let Ok(paths) = std::env::join_paths(&plan.skill_roots) {
        command.env("EPI_GATE_SKILLS_PATHS", paths);
    }
    command
}

async fn ensure_gateway_preflight(plan: &PiLaunchPlan) -> Result<(), String> {
    if gateway_preflight_is_disabled() {
        return Ok(());
    }

    let mut env_map = load_env_file(&plan.repo_root)?;
    env_map.insert(
        "EPI_GATE_STATE_ROOT".to_owned(),
        plan.gate_state_root.display().to_string(),
    );
    preflight::ensure_gateway_ready(plan.gateway_port, &plan.repo_root, &env_map)
        .await
        .map(|_| ())
        .map_err(|err| format!("epi agent gateway-preflight: {err}"))
}

fn gateway_preflight_is_disabled() -> bool {
    std::env::var("EPI_AGENT_GATEWAY_PREFLIGHT")
        .map(|value| matches!(value.as_str(), "skip" | "off" | "false" | "0"))
        .unwrap_or(false)
}
