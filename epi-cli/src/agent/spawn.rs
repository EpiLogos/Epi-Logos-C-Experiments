use crate::agent::{extensions, plugins, AgentLayout};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};
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

pub fn spawn(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let (layout, args) = prepare_interactive_invocation(agent, plugin_dirs, prompt)?;
    invoke_pi(&layout, &args, json)
}

pub fn run_prompt(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let (layout, args) = prepare_print_invocation(agent, plugin_dirs, prompt)?;
    invoke_pi(&layout, &args, json)
}

pub fn attach(agent: Option<&str>, session_id: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    extensions::sync_layout(&layout)?;

    invoke_pi(
        &layout,
        &[
            "--session".to_owned(),
            session_id.to_owned(),
            "--extension".to_owned(),
            layout.composite_entry_path.display().to_string(),
            "--extension".to_owned(),
            layout
                .extensions_dir
                .join("epi-citta.ts")
                .display()
                .to_string(),
            "--system-prompt".to_owned(),
            layout
                .prompts_dir
                .join("epi-system.md")
                .display()
                .to_string(),
        ],
        json,
    )
}

pub fn run_pi(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    args: &[String],
    json: bool,
) -> Result<String, String> {
    let layout = prepare_layout(agent, plugin_dirs)?;
    let mut pi_args = base_pi_args(&layout);
    pi_args.extend(args.iter().cloned());
    invoke_pi(&layout, &pi_args, json)
}

pub fn spawn_process(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<SpawnedPiProcess, String> {
    let (layout, args) = prepare_print_invocation(agent, plugin_dirs, prompt)?;
    let command = format!("pi {}", args.join(" "));
    let child = configure_tokio_command(&layout, &args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    Ok(SpawnedPiProcess {
        agent_id: layout.agent_id.clone(),
        child,
        command,
    })
}

pub fn verify_runtime(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let layout = prepare_isolated_layout(agent, plugin_dirs)?;
    let runtime_root = layout
        .epi_home
        .parent()
        .ok_or_else(|| "unable to resolve isolated runtime root".to_owned())?
        .to_path_buf();
    let home_path = runtime_root.join("home");
    let cwd = runtime_root.join("cwd");
    fs::create_dir_all(&home_path).map_err(|err| err.to_string())?;
    fs::create_dir_all(&cwd).map_err(|err| err.to_string())?;

    let mut args = vec!["-p".to_owned()];
    args.extend(base_pi_args(&layout));
    args.extend(minimal_verification_args());
    args.push(
        prompt
            .unwrap_or("Reply with a single line confirming runtime verification.")
            .to_owned(),
    );

    let output = configure_std_command(&layout, &args)
        .current_dir(&cwd)
        .env("HOME", &home_path)
        .env("EPI_AGENT_HOME", &layout.epi_home)
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
        agent_id: layout.agent_id.clone(),
        command: format!("pi {}", args.join(" ")),
        runtime_root: runtime_root.display().to_string(),
        home_path: home_path.display().to_string(),
        cwd: cwd.display().to_string(),
        agent_dir: layout.agent_dir.display().to_string(),
        plugin_runtime_path: layout.plugin_runtime_path.display().to_string(),
        event_log_path: layout
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
        Ok(format!(
            "{}: {}",
            report.status,
            report.event_log_path
        ))
    }
}

fn prepare_interactive_invocation(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<(AgentLayout, Vec<String>), String> {
    let layout = prepare_layout(agent, plugin_dirs)?;
    let mut args = base_pi_args(&layout);
    if let Some(prompt) = prompt {
        args.push(prompt.to_owned());
    }
    Ok((layout, args))
}

fn prepare_print_invocation(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
) -> Result<(AgentLayout, Vec<String>), String> {
    let layout = prepare_layout(agent, plugin_dirs)?;
    let mut args = vec!["-p".to_owned()];
    args.extend(base_pi_args(&layout));
    if let Some(prompt) = prompt {
        args.push(prompt.to_owned());
    }
    Ok((layout, args))
}

fn prepare_layout(agent: Option<&str>, plugin_dirs: &[PathBuf]) -> Result<AgentLayout, String> {
    let layout = AgentLayout::resolve(agent)?;
    prepare_layout_from_resolved(layout, plugin_dirs)
}

fn prepare_isolated_layout(agent: Option<&str>, plugin_dirs: &[PathBuf]) -> Result<AgentLayout, String> {
    let repo_root = AgentLayout::resolve(agent)?.repo_root;
    let runtime_root = repo_root
        .join(".tmp-real-pi-verify")
        .join(unique_runtime_suffix("runtime"));
    let epi_home = runtime_root.join(".epi");
    let layout = AgentLayout::resolve_for_epi_home(agent, epi_home)?;
    prepare_layout_from_resolved(layout, plugin_dirs)
}

fn prepare_layout_from_resolved(
    layout: AgentLayout,
    plugin_dirs: &[PathBuf],
) -> Result<AgentLayout, String> {
    extensions::sync_layout(&layout)?;
    let runtime_plugin_dirs = plugins::resolve_runtime_plugin_dirs(&layout.repo_root, plugin_dirs)?;
    plugins::prepare_runtime(&layout, &runtime_plugin_dirs)?;
    Ok(layout)
}

fn base_pi_args(layout: &AgentLayout) -> Vec<String> {
    vec![
        "--no-extensions".to_owned(),
        "--extension".to_owned(),
        layout.composite_entry_path.display().to_string(),
        "--extension".to_owned(),
        layout
            .extensions_dir
            .join("epi-citta.ts")
            .display()
            .to_string(),
        "--system-prompt".to_owned(),
        layout
            .prompts_dir
            .join("epi-system.md")
            .display()
            .to_string(),
    ]
}

fn minimal_verification_args() -> Vec<String> {
    vec![
        "--no-skills".to_owned(),
        "--no-prompt-templates".to_owned(),
        "--no-themes".to_owned(),
    ]
}

fn invoke_pi(layout: &AgentLayout, args: &[String], json: bool) -> Result<String, String> {
    let output = configure_std_command(layout, args)
        .output()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    if json {
        let report = SpawnReport {
            status: "ok".to_owned(),
            agent_id: layout.agent_id.clone(),
            command: format!("pi {}", args.join(" ")),
        };
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

fn configure_std_command(layout: &AgentLayout, args: &[String]) -> Command {
    let mut command = Command::new("pi");
    command.args(args);
    command.env("PI_CODING_AGENT_DIR", &layout.agent_dir);
    command.env("EPI_AGENT_DIR", &layout.agent_dir);
    command.env("EPI_AGENT_PROMPTS_DIR", &layout.prompts_dir);
    command.env(
        "EPI_AGENT_PLUGIN_RUNTIME_PATH",
        plugins::runtime_path(layout),
    );
    command
}

fn configure_tokio_command(layout: &AgentLayout, args: &[String]) -> TokioCommand {
    let mut command = TokioCommand::new("pi");
    command.args(args);
    command.env("PI_CODING_AGENT_DIR", &layout.agent_dir);
    command.env("EPI_AGENT_DIR", &layout.agent_dir);
    command.env("EPI_AGENT_PROMPTS_DIR", &layout.prompts_dir);
    command.env(
        "EPI_AGENT_PLUGIN_RUNTIME_PATH",
        plugins::runtime_path(layout),
    );
    command
}

fn unique_runtime_suffix(prefix: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    format!("{prefix}-{}-{nanos}", std::process::id())
}
