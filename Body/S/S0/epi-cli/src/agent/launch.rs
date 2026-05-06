use crate::agent::runtime::PiLaunchPlan;
use std::process::{Command, Stdio};

pub fn launch_interactive(plan: &PiLaunchPlan) -> Result<String, String> {
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

pub fn configure_std_command(plan: &PiLaunchPlan) -> Command {
    let mut command = Command::new("pi");
    command.args(&plan.args);
    command.env("EPI_REPO_ROOT", &plan.repo_root);
    command.env("EPI_AGENT_NAME", &plan.agent_id);
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
