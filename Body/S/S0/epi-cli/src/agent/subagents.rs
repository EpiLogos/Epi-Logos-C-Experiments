use crate::agent::capabilities::CapabilityRegistry;
use crate::agent::skills::parse_markdown_frontmatter;
use crate::agent::SubagentCmd;
use crate::agent::{launch, runtime};
use crate::gate::{
    config,
    session_store::{slug, SessionPatch, SessionStore},
    subagents as gate_subagents, transcripts,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::{Path, PathBuf};
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
                        .unwrap_or_else(|| "agent:main:main".to_owned()),
                    session_key: Some(record.canonical_key),
                    prompt: task.clone(),
                    team_id: record.team_id,
                    team_role: record.team_role,
                    orchestration_kind: record.orchestration_kind,
                    cmux_workspace: record.cmux_workspace,
                    cmux_surface: record.cmux_surface,
                    cmux_pane_id: record.cmux_pane_id,
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
    let _record = prepare_runtime_session(&store, &request, &session_key)?;

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

    transcripts::append_message(&gate_root, &session_key, "user", &request.prompt, None)?;

    let plan = runtime::plan_run(Some(&request.agent_id), &[], &args)?;
    let start = now_ms()?;
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
    let run_id = format!("cli-stop-{}", now_ms()?);
    transcripts::append_abort(&gate_root, &record.canonical_key, &run_id)?;
    Ok(json!({
        "ok": true,
        "stopped": true,
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
            ..SessionPatch::default()
        },
    )?;
    Ok(())
}

fn default_subagent_session_key(agent_id: &str) -> String {
    format!("agent:{agent_id}:subagent:{}", Uuid::new_v4().simple())
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
