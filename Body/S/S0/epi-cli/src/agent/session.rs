use crate::{
    agent::session_propagation::{
        default_gateway_state_root, propagate_agent_session_runtime, GatewaySessionPropagation,
        GatewaySessionPropagationOperation,
    },
    gate::sessions::{SessionRecord, SessionStore},
    sesh::session::{
        read_session_state, repo_root_from_env, AgentSessionRuntime, AgentSessionRuntimeFactory,
        AgentSessionRuntimeRequest,
    },
};
use chrono::{DateTime, Utc};
use clap::Subcommand;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[derive(Subcommand)]
pub enum SessionCmd {
    /// Initialize a Khora session and persist its state for this workspace
    Init {
        /// Override the current time for deterministic automation/tests
        #[arg(long)]
        now: Option<String>,
        /// Override the random suffix for deterministic automation/tests
        #[arg(long = "random-suffix")]
        random_suffix: Option<String>,
    },
    /// Create a new runtime-backed gateway session
    New {
        /// Override the current time for deterministic automation/tests
        #[arg(long)]
        now: Option<String>,
        /// Override the random suffix for deterministic automation/tests
        #[arg(long = "random-suffix")]
        random_suffix: Option<String>,
        /// Gateway session key to write; defaults to agent:{agent}:main
        #[arg(long = "session-key")]
        session_key: Option<String>,
        /// Human-readable gateway session label
        #[arg(long)]
        label: Option<String>,
    },
    /// Resume an existing gateway session through a fresh PI runtime projection
    Resume {
        /// Source gateway session key or alias
        #[arg(long = "source-session-key")]
        source_session_key: String,
        /// Target gateway session key; defaults to the source key
        #[arg(long = "target-session-key")]
        target_session_key: Option<String>,
        /// Override the current time for deterministic automation/tests
        #[arg(long)]
        now: Option<String>,
        /// Override the random suffix for deterministic automation/tests
        #[arg(long = "random-suffix")]
        random_suffix: Option<String>,
        /// Human-readable gateway session label
        #[arg(long)]
        label: Option<String>,
    },
    /// Fork an existing gateway session through a fresh PI runtime projection
    Fork {
        /// Source gateway session key or alias
        #[arg(long = "source-session-key")]
        source_session_key: String,
        /// Target gateway session key for the fork
        #[arg(long = "target-session-key")]
        target_session_key: String,
        /// Override the current time for deterministic automation/tests
        #[arg(long)]
        now: Option<String>,
        /// Override the random suffix for deterministic automation/tests
        #[arg(long = "random-suffix")]
        random_suffix: Option<String>,
        /// Human-readable gateway session label
        #[arg(long)]
        label: Option<String>,
    },
    /// Import an external session reference through a fresh PI runtime projection
    Import {
        /// External/source session key
        #[arg(long = "source-session-key")]
        source_session_key: String,
        /// Target gateway session key for the imported run
        #[arg(long = "target-session-key")]
        target_session_key: String,
        /// Override the current time for deterministic automation/tests
        #[arg(long)]
        now: Option<String>,
        /// Override the random suffix for deterministic automation/tests
        #[arg(long = "random-suffix")]
        random_suffix: Option<String>,
        /// Human-readable gateway session label
        #[arg(long)]
        label: Option<String>,
    },
    /// Show current session identity and bootstrap context
    Status,
    /// Finalize the current session and run close hooks
    Close,
    /// Write CONTINUATION.md with a resumable state snapshot
    Continuation {
        /// Optional free-form summary line appended to the continuation
        #[arg(long)]
        summary: Option<String>,
    },
}

pub fn run(cmd: &SessionCmd, _json: bool) -> Result<String, String> {
    match cmd {
        SessionCmd::Init { now, random_suffix } => init(now.as_deref(), random_suffix.as_deref()),
        SessionCmd::New {
            now,
            random_suffix,
            session_key,
            label,
        } => create_lifecycle_session(
            GatewaySessionPropagationOperation::New,
            None,
            session_key.clone(),
            label.clone(),
            now.as_deref(),
            random_suffix.as_deref(),
        ),
        SessionCmd::Resume {
            source_session_key,
            target_session_key,
            now,
            random_suffix,
            label,
        } => {
            let source = resolve_gateway_session(source_session_key)?;
            create_lifecycle_session(
                GatewaySessionPropagationOperation::Resume {
                    source_session_key: Some(source.canonical_key.clone()),
                },
                Some(source),
                target_session_key
                    .clone()
                    .or_else(|| Some(source_session_key.clone())),
                label.clone(),
                now.as_deref(),
                random_suffix.as_deref(),
            )
        }
        SessionCmd::Fork {
            source_session_key,
            target_session_key,
            now,
            random_suffix,
            label,
        } => {
            let source = resolve_gateway_session(source_session_key)?;
            create_lifecycle_session(
                GatewaySessionPropagationOperation::Fork {
                    source_session_key: source.canonical_key.clone(),
                    parent_session_key: Some(source.canonical_key.clone()),
                },
                Some(source),
                Some(target_session_key.clone()),
                label.clone(),
                now.as_deref(),
                random_suffix.as_deref(),
            )
        }
        SessionCmd::Import {
            source_session_key,
            target_session_key,
            now,
            random_suffix,
            label,
        } => create_lifecycle_session(
            GatewaySessionPropagationOperation::Import {
                source_session_key: source_session_key.clone(),
                source_session_kind: Some("import".to_owned()),
            },
            None,
            Some(target_session_key.clone()),
            label.clone(),
            now.as_deref(),
            random_suffix.as_deref(),
        ),
        SessionCmd::Status => status(),
        SessionCmd::Close => close(),
        SessionCmd::Continuation { summary } => continuation(summary.as_deref()),
    }
}

fn init(now_override: Option<&str>, random_suffix: Option<&str>) -> Result<String, String> {
    let repo_root = repo_root_from_env();
    let now = parse_now(now_override)?;
    let runtime = AgentSessionRuntimeFactory::new().create(AgentSessionRuntimeRequest {
        effective_cwd: repo_root.clone(),
        now,
        random_suffix: random_suffix.map(ToOwned::to_owned),
        force_new: now_override.is_some() || random_suffix.is_some(),
        agent_id: std::env::var("EPI_AGENT_ID")
            .ok()
            .or_else(|| std::env::var("EPI_AGENT_NAME").ok()),
        pi_event: Some("session_start".to_string()),
    })?;
    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: default_gateway_state_root(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: None,
            label: None,
        },
    )?;

    let mut lines = runtime_lines(&runtime, &record);
    if runtime.now_write == "created" {
        let hook_output =
            run_hook(repo_root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/pre-session-init.sh"))?;
        if !hook_output.is_empty() {
            lines.push(hook_output.trim().to_string());
        }
    }
    lines.push(format!(
        "bootstrap: {}",
        runtime
            .bootstrap
            .iter()
            .map(|artifact| artifact.name.as_str())
            .collect::<Vec<_>>()
            .join(" -> ")
    ));
    if Command::new("varlock").arg("--help").output().is_err() {
        lines.push("varlock unavailable: using .epi-logos.env only; 1Password materialization remains external".to_string());
    }

    Ok(lines.join("\n"))
}

fn create_lifecycle_session(
    operation: GatewaySessionPropagationOperation,
    source: Option<SessionRecord>,
    target_session_key: Option<String>,
    label: Option<String>,
    now_override: Option<&str>,
    random_suffix: Option<&str>,
) -> Result<String, String> {
    let now = parse_now(now_override)?;
    let runtime = AgentSessionRuntimeFactory::new().create(AgentSessionRuntimeRequest {
        effective_cwd: source_runtime_cwd(source.as_ref()),
        now,
        random_suffix: random_suffix.map(ToOwned::to_owned),
        force_new: true,
        agent_id: lifecycle_agent_id(source.as_ref()),
        pi_event: Some(pi_event_for_operation(&operation).to_owned()),
    })?;
    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: default_gateway_state_root(),
            operation,
            target_session_key,
            label,
        },
    )?;

    Ok(runtime_lines(&runtime, &record).join("\n"))
}

fn runtime_lines(runtime: &AgentSessionRuntime, record: &SessionRecord) -> Vec<String> {
    vec![
        format!("EPI_SESSION_ID={}", runtime.context.session_id),
        format!("EPI_DAY_ID={}", runtime.context.day_id),
        format!("EPI_NOW_PATH={}", runtime.context.now_path.display()),
        format!("GATEWAY_SESSION_KEY={}", record.canonical_key),
    ]
}

fn resolve_gateway_session(identifier: &str) -> Result<SessionRecord, String> {
    SessionStore::new(default_gateway_state_root())?.resolve(identifier)
}

fn source_runtime_cwd(source: Option<&SessionRecord>) -> PathBuf {
    source
        .and_then(|record| record.runtime_cwd.as_ref())
        .map(PathBuf::from)
        .unwrap_or_else(repo_root_from_env)
}

fn lifecycle_agent_id(source: Option<&SessionRecord>) -> Option<String> {
    std::env::var("EPI_AGENT_ID")
        .ok()
        .or_else(|| std::env::var("EPI_AGENT_NAME").ok())
        .or_else(|| source.map(|record| record.active_agent_id.clone()))
}

fn pi_event_for_operation(operation: &GatewaySessionPropagationOperation) -> &'static str {
    match operation {
        GatewaySessionPropagationOperation::SessionStart => "session_start",
        GatewaySessionPropagationOperation::New => "new",
        GatewaySessionPropagationOperation::Resume { .. } => "resume",
        GatewaySessionPropagationOperation::Fork { .. } => "fork",
        GatewaySessionPropagationOperation::Import { .. } => "import",
        GatewaySessionPropagationOperation::ResourceReload => "resource_reload",
        GatewaySessionPropagationOperation::CloseCompact => "close_compact",
    }
}

fn status() -> Result<String, String> {
    let repo_root = repo_root_from_env();
    let state = read_session_state(&repo_root)?;
    let elapsed = state.context.elapsed_summary(Utc::now());
    Ok(format!(
        "session {}\nday {}\nnow {}\nelapsed {}\nbootstrap: {}",
        state.context.session_id,
        state.context.day_id,
        state.context.now_path.display(),
        elapsed,
        state
            .bootstrap
            .iter()
            .map(|artifact| artifact.name.as_str())
            .collect::<Vec<_>>()
            .join(" -> ")
    ))
}

fn continuation(summary: Option<&str>) -> Result<String, String> {
    let repo_root = repo_root_from_env();
    let state = read_session_state(&repo_root)?;
    let mut body = String::new();
    body.push_str("# CONTINUATION\n\n");
    body.push_str(&format!("- session_id: {}\n", state.context.session_id));
    body.push_str(&format!("- day_id: {}\n", state.context.day_id));
    body.push_str(&format!(
        "- now_path: {}\n",
        state.context.now_path.display()
    ));
    body.push_str("- bootstrap:\n");
    for artifact in &state.bootstrap {
        body.push_str(&format!(
            "  - {} -> {}\n",
            artifact.name,
            artifact.path.display()
        ));
    }
    if let Some(summary) = summary {
        body.push_str("\n## Summary\n\n");
        body.push_str(summary);
        body.push('\n');
    }

    let path = repo_root.join("CONTINUATION.md");
    fs::write(&path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))?;
    Ok(format!("wrote {}", path.display()))
}

fn close() -> Result<String, String> {
    let repo_root = repo_root_from_env();
    let state = read_session_state(&repo_root)?;
    let runtime = AgentSessionRuntimeFactory::new().create(AgentSessionRuntimeRequest {
        effective_cwd: repo_root.clone(),
        now: state.context.started_at,
        random_suffix: None,
        force_new: false,
        agent_id: std::env::var("EPI_AGENT_ID")
            .ok()
            .or_else(|| std::env::var("EPI_AGENT_NAME").ok()),
        pi_event: Some("close_compact".to_string()),
    })?;
    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: default_gateway_state_root(),
            operation: GatewaySessionPropagationOperation::CloseCompact,
            target_session_key: None,
            label: None,
        },
    )?;
    let mut lines = Vec::new();
    let hook_output =
        run_hook(repo_root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/post-session-close.sh"))?;
    if !hook_output.is_empty() {
        lines.push(hook_output.trim().to_string());
    }
    lines.push(format!("archived session {}", state.context.session_id));
    let state_path = crate::sesh::session::session_state_path(&repo_root);
    if state_path.exists() {
        fs::remove_file(&state_path)
            .map_err(|err| format!("failed to remove {}: {err}", state_path.display()))?;
    }
    lines.push(format!("GATEWAY_SESSION_KEY={}", record.canonical_key));
    Ok(lines.join("\n"))
}

fn parse_now(now_override: Option<&str>) -> Result<DateTime<Utc>, String> {
    match now_override {
        Some(raw) => DateTime::parse_from_rfc3339(raw)
            .map(|dt| dt.with_timezone(&Utc))
            .map_err(|err| format!("invalid --now value {raw:?}: {err}")),
        None => Ok(Utc::now()),
    }
}

fn run_hook(path: PathBuf) -> Result<String, String> {
    if !path.exists() {
        return Ok(String::new());
    }
    let output = Command::new("sh")
        .arg(path.as_os_str())
        .output()
        .map_err(|err| format!("failed to run {}: {err}", path.display()))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}
