use crate::agent::capabilities::CapabilityRegistry;
use crate::agent::skills::parse_markdown_frontmatter;
use crate::agent::SubagentCmd;
use crate::agent::{launch, runtime, tmux};
use crate::gate::{
    config,
    session_store::{slug, SessionPatch, SessionStore},
    subagents as gate_subagents, transcripts,
};
use epi_s3_gateway_contract::{
    TerminalBinding, TerminalLease as GatewayTerminalLease, TerminalStatus,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubagentDefinition {
    pub path: String,
    pub name: String,
    pub description: String,
    pub tools: Vec<String>,
    pub skills: Vec<String>,
    pub model: Option<String>,
    pub permission_mode: Option<String>,
    pub body: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubagentValidationReport {
    pub valid: bool,
    pub path: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub tools: Vec<String>,
    pub skills: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct RuntimeSubagentRequest {
    pub agent_id: String,
    pub parent_session_key: String,
    pub session_key: Option<String>,
    pub prompt: String,
    pub team_id: Option<String>,
    pub team_role: Option<String>,
    pub orchestration_kind: Option<String>,
    pub cmux_workspace: Option<String>,
    pub cmux_surface: Option<String>,
    pub cmux_pane_id: Option<String>,
    pub terminal_backed: bool,
    pub terminal_lease: Option<tmux::TerminalLease>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeSubagentReport {
    pub ok: bool,
    pub status: String,
    pub session_key: String,
    pub parent_session_key: String,
    pub agent_id: String,
    pub team_id: Option<String>,
    pub orchestration_kind: Option<String>,
    pub cmux_workspace: Option<String>,
    pub cmux_surface: Option<String>,
    pub cmux_pane_id: Option<String>,
    pub terminal_binding: Option<TerminalBinding>,
    pub output: String,
    pub exit_code: i32,
    pub elapsed_ms: u128,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SubagentFrontmatter {
    name: String,
    description: String,
    #[serde(default)]
    tools: Vec<String>,
    #[serde(default)]
    disallowed_tools: Vec<String>,
    model: Option<String>,
    permission_mode: Option<String>,
    #[serde(default)]
    skills: Vec<String>,
}

pub fn validate_path(path: &Path, registry: &CapabilityRegistry) -> SubagentValidationReport {
    match parse_subagent(path, registry) {
        Ok(subagent) => SubagentValidationReport {
            valid: true,
            path: subagent.path.clone(),
            name: Some(subagent.name.clone()),
            description: Some(subagent.description.clone()),
            tools: subagent.tools.clone(),
            skills: subagent.skills.clone(),
            errors: Vec::new(),
        },
        Err(errors) => SubagentValidationReport {
            valid: false,
            path: display_path(path),
            name: None,
            description: None,
            tools: Vec::new(),
            skills: Vec::new(),
            errors,
        },
    }
}

pub fn run(cmd: &SubagentCmd, json: bool) -> Result<String, String> {
    match cmd {
        SubagentCmd::Validate { path } => {
            let report = validate_path(path, &CapabilityRegistry::default());
            if json {
                serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
            } else {
                Ok(format!(
                    "{} {}",
                    if report.valid { "valid" } else { "invalid" },
                    report.path
                ))
            }
        }
        SubagentCmd::Run {
            agent,
            parent_session,
            session_key,
            task,
        } => render_runtime_report(
            &run_runtime(RuntimeSubagentRequest {
                agent_id: agent.clone(),
                parent_session_key: parent_session.clone(),
                session_key: session_key.clone(),
                prompt: task.clone(),
                team_id: None,
                team_role: None,
                orchestration_kind: None,
                cmux_workspace: None,
                cmux_surface: None,
                cmux_pane_id: None,
                terminal_backed: terminal_backed_from_env(),
                terminal_lease: None,
            })?,
            json,
        ),
        SubagentCmd::Continue { session_key, task } => {
            let record = SessionStore::new(config::gate_root_from_env()?)?.resolve(session_key)?;
            render_runtime_report(
                &run_runtime(RuntimeSubagentRequest {
                    agent_id: agent_id_from_session_key(&record.canonical_key),
                    parent_session_key: record
                        .spawned_by
                        .clone()
                        .unwrap_or_else(|| "agent:epii:main".to_owned()),
                    session_key: Some(record.canonical_key),
                    prompt: task.clone(),
                    team_id: record.team_id,
                    team_role: record.team_role,
                    orchestration_kind: record.orchestration_kind,
                    cmux_workspace: record.cmux_workspace,
                    cmux_surface: record.cmux_surface,
                    cmux_pane_id: record.cmux_pane_id,
                    terminal_backed: terminal_backed_from_env(),
                    terminal_lease: None,
                })?,
                json,
            )
        }
        SubagentCmd::List { parent_session } => {
            let sessions = list_runtime(parent_session.as_deref())?;
            if json {
                serde_json::to_string_pretty(&json!({ "sessions": sessions }))
                    .map_err(|err| err.to_string())
            } else {
                Ok(sessions
                    .into_iter()
                    .map(|entry| {
                        format!(
                            "{} [{}] {}",
                            entry["sessionKey"].as_str().unwrap_or("-"),
                            entry["agentId"].as_str().unwrap_or("-"),
                            entry["status"].as_str().unwrap_or("-"),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        SubagentCmd::Stop { session_key } => {
            let stopped = stop_runtime(session_key)?;
            if json {
                serde_json::to_string_pretty(&stopped).map_err(|err| err.to_string())
            } else {
                Ok(format!("stopped {}", session_key))
            }
        }
    }
}

pub fn run_runtime(request: RuntimeSubagentRequest) -> Result<RuntimeSubagentReport, String> {
    let gate_root = config::gate_root_from_env()?;
    let store = SessionStore::new(&gate_root)?;
    store.ensure(&request.parent_session_key)?;

    let session_key = request
        .session_key
        .clone()
        .unwrap_or_else(|| default_subagent_session_key(&request.agent_id));
    let session_file = gate_root
        .join("pi-sessions")
        .join(format!("{}.json", slug(&session_key)));
    let resume = session_file.exists();
    if let Some(parent) = session_file.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }

    let mut args = vec![
        "-p".to_owned(),
        "--session".to_owned(),
        session_file.display().to_string(),
    ];
    if resume {
        args.push("-c".to_owned());
    }
    args.push(request.prompt.clone());

    let mut plan = runtime::plan_run(Some(&request.agent_id), None, &[], &args)?;
    plan.gate_state_root = gate_root.clone();
    let mut request = request;
    let inherited = gate_subagents::resolve_agent_launch_context(
        &store,
        &session_key,
        Some(&request.parent_session_key),
    )?
    .ok_or_else(|| "subagent lineage context should resolve".to_owned())?;
    apply_result_drop_from_parent_now(&mut plan, inherited.vault_now_path.as_deref());
    if request.terminal_backed && request.terminal_lease.is_none() {
        request.terminal_lease = Some(tmux::create_session(&plan, &session_key)?);
    }
    let terminal_binding = request
        .terminal_lease
        .as_ref()
        .map(|lease| terminal_binding_from_lease(&request.agent_id, lease));
    let _record = prepare_runtime_session(&store, &request, &session_key)?;

    transcripts::append_message(&gate_root, &session_key, "user", &request.prompt, None)?;

    let start = now_ms()?;
    if request.terminal_backed {
        let lease = request.terminal_lease.as_ref().ok_or_else(|| {
            "terminal-backed subagent dispatch requires a TerminalLease".to_owned()
        })?;
        inject_runtime_command(&lease.tmux_pane_id, &launch::pi_command_argv(&plan))?;
        let elapsed_ms = now_ms()?.saturating_sub(start);
        return Ok(RuntimeSubagentReport {
            ok: true,
            status: "running".to_owned(),
            session_key,
            parent_session_key: request.parent_session_key,
            agent_id: request.agent_id,
            team_id: request.team_id,
            orchestration_kind: request.orchestration_kind,
            cmux_workspace: request.cmux_workspace,
            cmux_surface: request.cmux_surface,
            cmux_pane_id: request.cmux_pane_id,
            terminal_binding,
            output: String::new(),
            exit_code: 0,
            elapsed_ms,
        });
    }

    let output = launch::configure_std_command(&plan)
        .output()
        .map_err(|err| format!("failed to launch pi: {err}"))?;
    let elapsed_ms = now_ms()?.saturating_sub(start);
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
    let rendered = if stdout.is_empty() {
        stderr.clone()
    } else {
        stdout.clone()
    };

    transcripts::append_message(&gate_root, &session_key, "assistant", &rendered, None)?;

    Ok(RuntimeSubagentReport {
        ok: output.status.success(),
        status: if output.status.success() {
            "completed".to_owned()
        } else {
            "error".to_owned()
        },
        session_key,
        parent_session_key: request.parent_session_key,
        agent_id: request.agent_id,
        team_id: request.team_id,
        orchestration_kind: request.orchestration_kind,
        cmux_workspace: request.cmux_workspace,
        cmux_surface: request.cmux_surface,
        cmux_pane_id: request.cmux_pane_id,
        terminal_binding,
        output: rendered,
        exit_code: output.status.code().unwrap_or(1),
        elapsed_ms,
    })
}

pub fn discover_under(
    plugin_root: &Path,
    registry: &CapabilityRegistry,
) -> (Vec<SubagentDefinition>, Vec<String>) {
    let agents_dir = plugin_root.join("agents");
    let mut files = Vec::new();
    collect_markdown_files(&agents_dir, &mut files);
    files.sort();

    let mut definitions = Vec::new();
    let mut errors = Vec::new();
    for path in files {
        match parse_subagent(&path, registry) {
            Ok(subagent) => definitions.push(subagent),
            Err(mut path_errors) => errors.append(&mut path_errors),
        }
    }

    (definitions, errors)
}

pub fn parse_subagent(
    path: &Path,
    registry: &CapabilityRegistry,
) -> Result<SubagentDefinition, Vec<String>> {
    let contents = fs::read_to_string(path).map_err(|err| {
        vec![format!(
            "{}: unable to read subagent definition: {err}",
            display_path(path)
        )]
    })?;
    let (frontmatter, body) = parse_markdown_frontmatter(&contents, path)?;
    let metadata = serde_yaml::from_value::<SubagentFrontmatter>(frontmatter).map_err(|err| {
        vec![format!(
            "{}: invalid subagent frontmatter: {err}",
            display_path(path)
        )]
    })?;

    let mut errors = Vec::new();
    if metadata.name.trim().is_empty() {
        errors.push(format!(
            "{}: subagent `name` must not be empty",
            display_path(path)
        ));
    }
    if metadata.description.trim().is_empty() {
        errors.push(format!(
            "{}: subagent `description` must not be empty",
            display_path(path)
        ));
    }
    if body.trim().is_empty() {
        errors.push(format!(
            "{}: subagent body must not be empty",
            display_path(path)
        ));
    }
    errors.extend(
        registry
            .validate_tools(&metadata.tools)
            .into_iter()
            .map(|err| format!("{}: {err}", display_path(path))),
    );
    errors.extend(
        registry
            .validate_tools(&metadata.disallowed_tools)
            .into_iter()
            .map(|err| format!("{}: {err}", display_path(path))),
    );

    if errors.is_empty() {
        Ok(SubagentDefinition {
            path: display_path(path),
            name: metadata.name,
            description: metadata.description,
            tools: metadata.tools,
            skills: metadata.skills,
            model: metadata.model,
            permission_mode: metadata.permission_mode,
            body,
        })
    } else {
        Err(errors)
    }
}

fn collect_markdown_files(root: &Path, output: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown_files(&path, output);
        } else if path.extension().and_then(|ext| ext.to_str()) == Some("md") {
            output.push(path);
        }
    }
}

fn display_path(path: &Path) -> String {
    path.canonicalize()
        .unwrap_or_else(|_| path.to_path_buf())
        .display()
        .to_string()
}

fn render_runtime_report(report: &RuntimeSubagentReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(report).map_err(|err| err.to_string())
    } else {
        Ok(report.output.clone())
    }
}

fn list_runtime(parent_session: Option<&str>) -> Result<Vec<serde_json::Value>, String> {
    let store = SessionStore::new(config::gate_root_from_env()?)?;
    let mut sessions = store
        .list()?
        .into_iter()
        .filter(|record| gate_subagents::is_subagent_session_key(&record.canonical_key))
        .collect::<Vec<_>>();
    sessions.sort_by(|left, right| right.updated_at_ms.cmp(&left.updated_at_ms));
    Ok(sessions
        .into_iter()
        .filter(|record| {
            parent_session
                .map(|parent| record.spawned_by.as_deref() == Some(parent))
                .unwrap_or(true)
        })
        .map(|record| {
            json!({
                "sessionKey": record.canonical_key,
                "agentId": record.active_agent_id,
                "spawnedBy": record.spawned_by,
                "teamId": record.team_id,
                "teamRole": record.team_role,
                "orchestrationKind": record.orchestration_kind,
                "cmuxWorkspace": record.cmux_workspace,
                "cmuxSurface": record.cmux_surface,
                "cmuxPaneId": record.cmux_pane_id,
                "terminalBinding": record.terminal_binding,
                "status": "tracked",
                "updatedAtMs": record.updated_at_ms,
            })
        })
        .collect())
}

fn stop_runtime(session_key: &str) -> Result<serde_json::Value, String> {
    let gate_root = config::gate_root_from_env()?;
    let store = SessionStore::new(&gate_root)?;
    let record = store.resolve(session_key)?;
    if let Some(binding) = record.terminal_binding.clone() {
        if binding.tmux_pane_id.is_some()
            || binding.terminal_status == Some(TerminalStatus::Attached)
        {
            if let Some(anchor) = binding.session_anchor.as_deref() {
                run_tmux(["kill-session", "-t", anchor])?;
            } else {
                tmux::kill_session(&record.canonical_key, &gate_root)?;
            }
            let mut detached = binding;
            detached.terminal_status = Some(TerminalStatus::Detached);
            let updated = store.patch(
                &record.canonical_key,
                SessionPatch {
                    terminal_binding: Some(Some(detached.clone())),
                    ..SessionPatch::default()
                },
            )?;
            return Ok(json!({
                "ok": true,
                "stopped": true,
                "stopMode": "terminal",
                "sessionKey": updated.canonical_key,
                "terminalBinding": detached,
            }));
        }
    }

    let run_id = format!("cli-stop-{}", now_ms()?);
    transcripts::append_abort(&gate_root, &record.canonical_key, &run_id)?;
    Ok(json!({
        "ok": true,
        "stopped": true,
        "stopMode": "transcript",
        "sessionKey": record.canonical_key,
        "runId": run_id,
    }))
}

fn prepare_runtime_session(
    store: &SessionStore,
    request: &RuntimeSubagentRequest,
    session_key: &str,
) -> Result<(), String> {
    let inherited = gate_subagents::resolve_agent_launch_context(
        store,
        session_key,
        Some(&request.parent_session_key),
    )?
    .ok_or_else(|| "subagent lineage context should resolve".to_owned())?;
    store.ensure(session_key)?;
    if request.terminal_backed && request.terminal_lease.is_none() {
        return Err("terminal-backed subagent dispatch requires a TerminalLease".to_owned());
    }
    let terminal_binding = request
        .terminal_lease
        .as_ref()
        .map(|lease| {
            if lease.session_key != session_key {
                return Err(format!(
                    "terminal lease for {} cannot attach to child session {session_key}",
                    lease.session_key
                ));
            }
            Ok(terminal_binding_from_lease(&request.agent_id, lease))
        })
        .transpose()?;
    store.patch(
        session_key,
        SessionPatch {
            active_agent_id: Some(request.agent_id.clone()),
            subagent_lineage: Some(inherited.subagent_lineage),
            spawned_by: Some(Some(request.parent_session_key.clone())),
            vault_now_path: Some(inherited.vault_now_path),
            delivery_context: Some(inherited.delivery_context),
            channel: Some(inherited.channel),
            thread_id: Some(inherited.thread_id),
            group_id: Some(request.team_id.clone().or(inherited.group_id)),
            group_channel: Some(
                request
                    .orchestration_kind
                    .clone()
                    .or(inherited.group_channel),
            ),
            group_space: Some(request.cmux_workspace.clone().or(inherited.group_space)),
            team_id: Some(request.team_id.clone()),
            team_role: Some(request.team_role.clone()),
            orchestration_kind: Some(request.orchestration_kind.clone()),
            cmux_workspace: Some(request.cmux_workspace.clone()),
            cmux_surface: Some(request.cmux_surface.clone()),
            cmux_pane_id: Some(request.cmux_pane_id.clone()),
            terminal_binding: Some(terminal_binding),
            ..SessionPatch::default()
        },
    )?;
    Ok(())
}

fn default_subagent_session_key(agent_id: &str) -> String {
    format!("agent:{agent_id}:subagent:{}", Uuid::new_v4().simple())
}

fn apply_result_drop_from_parent_now(
    plan: &mut runtime::PiLaunchPlan,
    parent_now_path: Option<&str>,
) {
    let Some(parent_now_path) = parent_now_path
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
    else {
        return;
    };
    let Some(now_dir) = parent_now_path.parent().map(Path::to_path_buf) else {
        return;
    };
    let day_dir = now_dir.parent().map(Path::to_path_buf);
    plan.result_parent_now_path = Some(parent_now_path);
    plan.result_drop_dir = Some(now_dir);
    plan.result_day_dir = day_dir;
}

fn agent_id_from_session_key(session_key: &str) -> String {
    let mut parts = session_key.split(':');
    match (parts.next(), parts.next()) {
        (Some("agent"), Some(agent_id)) if !agent_id.is_empty() => agent_id.to_owned(),
        _ => "main".to_owned(),
    }
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}

pub(super) fn terminal_backed_from_env() -> bool {
    std::env::var("EPI_AGENT_TERMINAL_BACKED")
        .map(|value| matches!(value.as_str(), "1" | "true" | "TRUE" | "yes" | "on"))
        .unwrap_or(false)
}

fn terminal_binding_from_lease(agent_id: &str, lease: &tmux::TerminalLease) -> TerminalBinding {
    TerminalBinding {
        terminal_identifier: Some(format!(
            "tmux:{}:{}",
            lease.tmux_session_name, lease.tmux_pane_id
        )),
        session_anchor: Some(lease.tmux_session_name.clone()),
        tmux_pane_id: Some(lease.tmux_pane_id.clone()),
        attached_session_key: Some(lease.session_key.clone()),
        terminal_status: Some(TerminalStatus::Attached),
        lease: Some(GatewayTerminalLease {
            lease_owner: Some(format!("pi.{agent_id}")),
            lease_purpose: Some("subagent-runtime".to_owned()),
            lease_expires_at_ms: Some(
                lease.created_at + u128::from(lease.lease_ttl_seconds) * 1000,
            ),
        }),
        capture_policy: None,
    }
}

fn inject_runtime_command(pane_id: &str, argv: &[String]) -> Result<(), String> {
    let Some((program, args)) = argv.split_first() else {
        return Err("missing PI runtime command".to_owned());
    };
    send_literal(pane_id, program)?;
    for arg in args {
        run_tmux(["send-keys", "-t", pane_id, "Space"])?;
        send_literal(pane_id, &shell_single_quote(arg))?;
    }
    run_tmux(["send-keys", "-t", pane_id, "Enter"])
}

fn send_literal(pane_id: &str, text: &str) -> Result<(), String> {
    let mut command = tmux_command();
    command
        .arg("send-keys")
        .arg("-t")
        .arg(pane_id)
        .arg("-l")
        .arg("--")
        .arg(text);
    run_command(command)
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
    Command::new(resolve_tmux_binary().unwrap_or_else(|| OsString::from("tmux")))
}

fn resolve_tmux_binary() -> Option<OsString> {
    if let Some(path) = std::env::var_os("EPI_AGENT_TMUX_BIN") {
        return Some(path);
    }
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .map(|dir| dir.join("tmux"))
        .find(|candidate| candidate.is_file())
        .map(|candidate| candidate.into_os_string())
}

fn shell_single_quote(value: &str) -> String {
    if value.is_empty() {
        return "''".to_owned();
    }
    if value.chars().all(|ch| {
        ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '/' | '.' | ':' | '=' | ',')
    }) {
        return value.to_owned();
    }
    let mut quoted = String::from("'");
    for ch in value.chars() {
        if ch == '\'' {
            quoted.push_str("'\\''");
        } else {
            quoted.push(ch);
        }
    }
    quoted.push('\'');
    quoted
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::runtime::{PiLaunchMode, PiLaunchPlan};

    #[test]
    fn inherited_parent_now_path_becomes_child_result_drop_env() {
        let mut plan = fixture_plan();

        apply_result_drop_from_parent_now(
            &mut plan,
            Some("/vault/Empty/Present/19-06-2026/20260619-120000-parent/now.md"),
        );

        let env = crate::agent::launch::plan_env(&plan, &[])
            .into_iter()
            .map(|(key, value)| (key, value.to_string_lossy().to_string()))
            .collect::<std::collections::BTreeMap<_, _>>();

        assert_eq!(
            env.get("EPI_PARENT_NOW_PATH").map(String::as_str),
            Some("/vault/Empty/Present/19-06-2026/20260619-120000-parent/now.md")
        );
        assert_eq!(
            env.get("EPI_RESULT_DROP_DIR").map(String::as_str),
            Some("/vault/Empty/Present/19-06-2026/20260619-120000-parent")
        );
        assert_eq!(
            env.get("EPI_RESULT_DAY_DIR").map(String::as_str),
            Some("/vault/Empty/Present/19-06-2026")
        );
    }

    fn fixture_plan() -> PiLaunchPlan {
        let root = PathBuf::from("/repo");
        PiLaunchPlan {
            launch_mode: PiLaunchMode::CapturedPrompt,
            capture_output: true,
            agent_id: "eros".to_owned(),
            role: None,
            args: vec!["-p".to_owned(), "task".to_owned()],
            repo_root: root.clone(),
            agent_dir: root.join(".epi/agents/eros/agent"),
            prompts_dir: root.join(".epi/agents/eros/agent/prompts"),
            plugin_runtime_path: root.join(".epi/agents/eros/agent/plugin-runtime.json"),
            epi_home: root.join(".epi"),
            gate_state_root: root.join(".epi/gate"),
            gateway_port: 7331,
            gateway_url: "ws://127.0.0.1:7331".to_owned(),
            codex_home: root.join(".codex"),
            skill_roots: Vec::new(),
            result_parent_now_path: None,
            result_drop_dir: None,
            result_day_dir: None,
            runtime_root: None,
            working_dir: None,
            home_override: None,
        }
    }
}
