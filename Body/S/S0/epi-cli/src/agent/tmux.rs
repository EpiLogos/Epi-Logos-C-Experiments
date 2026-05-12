use crate::agent::runtime::PiLaunchPlan;
use crate::agent::{AgentLayout, TmuxCmd, DEFAULT_PI_AGENT_ID};
use serde::Serialize;
use std::process::Command;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TmuxReport {
    status: String,
    session_name: String,
    agent_id: String,
    command: String,
}

pub fn run(cmd: &TmuxCmd, json: bool) -> Result<String, String> {
    match cmd {
        TmuxCmd::Up { name, agent } => {
            let layout = AgentLayout::resolve(Some(agent))?;
            let session_name = resolve_session_name(name.as_deref(), &layout)?;
            ensure_session(&session_name, &layout, agent, None, json)
        }
        TmuxCmd::Attach { name } => {
            let layout = AgentLayout::resolve(Some(DEFAULT_PI_AGENT_ID))?;
            let session_name = resolve_session_name(name.as_deref(), &layout)?;
            run_tmux(["attach-session", "-t", &session_name])?;
            render(
                TmuxReport {
                    status: "attached".to_owned(),
                    session_name,
                    agent_id: layout.agent_id,
                    command: "tmux attach-session".to_owned(),
                },
                json,
            )
        }
        TmuxCmd::Status { name } => {
            let layout = AgentLayout::resolve(Some(DEFAULT_PI_AGENT_ID))?;
            let session_name = resolve_session_name(name.as_deref(), &layout)?;
            let status = if has_session(&session_name)? {
                "running"
            } else {
                "missing"
            };
            render(
                TmuxReport {
                    status: status.to_owned(),
                    session_name,
                    agent_id: layout.agent_id,
                    command: "tmux has-session".to_owned(),
                },
                json,
            )
        }
        TmuxCmd::Down { name } => {
            let layout = AgentLayout::resolve(Some(DEFAULT_PI_AGENT_ID))?;
            let session_name = resolve_session_name(name.as_deref(), &layout)?;
            if has_session(&session_name)? {
                run_tmux(["kill-session", "-t", &session_name])?;
            }
            render(
                TmuxReport {
                    status: "down".to_owned(),
                    session_name,
                    agent_id: layout.agent_id,
                    command: "tmux kill-session".to_owned(),
                },
                json,
            )
        }
    }
}

pub(super) fn run_plan(plan: &PiLaunchPlan, json: bool) -> Result<String, String> {
    let session_name = tmux_session_name(&plan.repo_root, &plan.agent_id);
    ensure_session(&session_name, plan, &plan.agent_id, Some(plan), json)
}

fn ensure_session(
    session_name: &str,
    env_source: &impl TmuxEnvSource,
    agent_id: &str,
    plan: Option<&PiLaunchPlan>,
    json: bool,
) -> Result<String, String> {
    if !has_session(session_name)? {
        let mut command = tmux_command();
        command
            .arg("new-session")
            .arg("-d")
            .arg("-s")
            .arg(session_name)
            .arg("-c")
            .arg(env_source.repo_root().display().to_string());
        command.env("EPI_REPO_ROOT", env_source.repo_root());
        command.env("EPI_AGENT_ID", agent_id);
        command.env("EPI_AGENT_NAME", agent_id);
        if let Some(plan) = plan {
            command.env("EPI_AGENT_HOME", &plan.epi_home);
            command.env("EPI_AGENT_DIR", &plan.agent_dir);
            command.env("PI_CODING_AGENT_DIR", &plan.agent_dir);
            command.env("EPI_AGENT_GATEWAY_URL", &plan.gateway_url);
            command.env("EPI_AGENT_PLUGIN_RUNTIME_PATH", &plan.plugin_runtime_path);
            if let Some(role) = &plan.role {
                command.env("EPI_AGENT_ROLE", role);
                command.env(
                    "EPI_AGENT_SCOPED_SURFACE",
                    format!("{}:{role}", plan.agent_id),
                );
            }
        }
        run_command(command)?;
    }

    render(
        TmuxReport {
            status: "running".to_owned(),
            session_name: session_name.to_owned(),
            agent_id: agent_id.to_owned(),
            command: "tmux new-session".to_owned(),
        },
        json,
    )
}

trait TmuxEnvSource {
    fn repo_root(&self) -> &std::path::Path;
}

impl TmuxEnvSource for AgentLayout {
    fn repo_root(&self) -> &std::path::Path {
        &self.repo_root
    }
}

impl TmuxEnvSource for PiLaunchPlan {
    fn repo_root(&self) -> &std::path::Path {
        &self.repo_root
    }
}

fn resolve_session_name(name: Option<&str>, layout: &AgentLayout) -> Result<String, String> {
    Ok(name
        .map(str::to_owned)
        .unwrap_or_else(|| tmux_session_name(&layout.repo_root, &layout.agent_id)))
}

fn tmux_session_name(repo_root: &std::path::Path, agent_id: &str) -> String {
    let repo_slug = repo_root
        .file_name()
        .and_then(|name| name.to_str())
        .map(slug)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "repo".to_owned());
    format!("epi-khora-{repo_slug}-{agent_id}")
}

fn slug(value: &str) -> String {
    value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_owned()
}

fn has_session(session_name: &str) -> Result<bool, String> {
    let status = tmux_command()
        .arg("has-session")
        .arg("-t")
        .arg(session_name)
        .status()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    Ok(status.success())
}

fn run_tmux<const N: usize>(args: [&str; N]) -> Result<(), String> {
    let mut command = tmux_command();
    command.args(args);
    run_command(command)
}

fn run_command(mut command: Command) -> Result<(), String> {
    let status = command
        .status()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("tmux exited with status {status}"))
    }
}

fn tmux_command() -> Command {
    std::env::var_os("EPI_AGENT_TMUX_BIN")
        .map(Command::new)
        .unwrap_or_else(|| Command::new("tmux"))
}

fn render(report: TmuxReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "{} {} ({})",
            report.status, report.session_name, report.agent_id
        ))
    }
}
