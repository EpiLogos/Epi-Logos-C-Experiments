use crate::agent::{extensions, plugins, AgentLayout};
use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SpawnReport {
    status: String,
    agent_id: String,
    command: String,
}

pub fn spawn(
    agent: Option<&str>,
    plugin_dirs: &[PathBuf],
    prompt: Option<&str>,
    json: bool,
) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    extensions::sync_layout(&layout)?;
    plugins::prepare_runtime(&layout, plugin_dirs)?;

    let mut args = vec![
        "spawn".to_owned(),
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
    ];

    if let Some(prompt) = prompt {
        args.push(prompt.to_owned());
    }

    invoke_pi(&layout, &args, json)
}

pub fn attach(agent: Option<&str>, session_id: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    extensions::sync_layout(&layout)?;

    invoke_pi(
        &layout,
        &[
            "attach".to_owned(),
            session_id.to_owned(),
            "--extension".to_owned(),
            layout.composite_entry_path.display().to_string(),
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
    let layout = AgentLayout::resolve(agent)?;
    extensions::sync_layout(&layout)?;
    plugins::prepare_runtime(&layout, plugin_dirs)?;

    let mut pi_args = vec![
        "run".to_owned(),
        "--extension".to_owned(),
        layout.composite_entry_path.display().to_string(),
    ];
    pi_args.extend(args.iter().cloned());
    invoke_pi(&layout, &pi_args, json)
}

fn invoke_pi(layout: &AgentLayout, args: &[String], json: bool) -> Result<String, String> {
    let output = Command::new("pi")
        .args(args)
        .env("PI_CODING_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_PROMPTS_DIR", &layout.prompts_dir)
        .env(
            "EPI_AGENT_PLUGIN_RUNTIME_PATH",
            plugins::runtime_path(layout),
        )
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
