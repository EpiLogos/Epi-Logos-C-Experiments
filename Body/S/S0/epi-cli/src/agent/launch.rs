use crate::agent::runtime::PiLaunchPlan;
use std::ffi::OsString;
use std::path::PathBuf;
use std::process::{Command, Stdio};

pub fn pi_command_argv(plan: &PiLaunchPlan) -> Vec<String> {
    let pi = resolve_binary_on_path("pi")
        .map(|path| path.display().to_string())
        .unwrap_or_else(|| "pi".to_owned());
    let mut argv = vec![pi];
    argv.extend(plan.args.iter().cloned());
    argv
}

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
    apply_plan_env(&mut command, plan, &[]);
    command
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

fn resolve_binary_on_path(name: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .map(|dir| dir.join(name))
        .find(|candidate| candidate.is_file())
}
