use crate::sesh::session::{
    bootstrap_sequence, load_env_file, read_session_state, repo_root_from_env, resolve_vault_root,
    write_session_state, SessionContext, SessionState,
};
use chrono::{DateTime, Utc};
use clap::Subcommand;
use std::fs;
use std::path::{Path, PathBuf};
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
        SessionCmd::Status => status(),
        SessionCmd::Close => close(),
        SessionCmd::Continuation { summary } => continuation(summary.as_deref()),
    }
}

fn init(now_override: Option<&str>, random_suffix: Option<&str>) -> Result<String, String> {
    let repo_root = repo_root_from_env();
    let env_map = load_env_file(&repo_root)?;
    let vault_root = resolve_vault_root(&env_map);
    let now = parse_now(now_override)?;
    let context = SessionContext::new(now, random_suffix, &vault_root);
    ensure_now_file(&context)?;

    let bootstrap = bootstrap_sequence(&repo_root, &context.now_path);
    let state = SessionState {
        context: context.clone(),
        bootstrap: bootstrap.clone(),
        env: env_map.clone(),
    };
    write_session_state(&repo_root, &state)?;

    let mut lines = Vec::new();
    let hook_output =
        run_hook(repo_root.join(".pi/extensions/ta-onta/khora/S0/pre-session-init.sh"))?;
    if !hook_output.is_empty() {
        lines.push(hook_output.trim().to_string());
    }
    lines.push(format!("EPI_SESSION_ID={}", context.session_id));
    lines.push(format!("EPI_DAY_ID={}", context.day_id));
    lines.push(format!("EPI_NOW_PATH={}", context.now_path.display()));
    lines.push(format!(
        "bootstrap: {}",
        bootstrap
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
    let mut lines = Vec::new();
    let hook_output =
        run_hook(repo_root.join(".pi/extensions/ta-onta/khora/S0/post-session-close.sh"))?;
    if !hook_output.is_empty() {
        lines.push(hook_output.trim().to_string());
    }
    lines.push(format!("archived session {}", state.context.session_id));
    let state_path = crate::sesh::session::session_state_path(&repo_root);
    if state_path.exists() {
        fs::remove_file(&state_path)
            .map_err(|err| format!("failed to remove {}: {err}", state_path.display()))?;
    }
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

fn ensure_now_file(context: &SessionContext) -> Result<(), String> {
    if let Some(parent) = context.now_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    if !context.now_path.exists() {
        let content = format!(
            "---\nsession_id: \"{}\"\nday_id: \"{}\"\n---\n\n# NOW\n\n## #0 Question\n\n## #1 Material\n\n## #2 Analysis\n\n## #3 Pattern\n\n## #4 Context\n\n## #5 Integration\n",
            context.session_id, context.day_id
        );
        fs::write(&context.now_path, content)
            .map_err(|err| format!("failed to write {}: {err}", context.now_path.display()))?;
    }
    Ok(())
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

#[allow(dead_code)]
fn _read_text(path: &Path) -> Result<String, String> {
    fs::read_to_string(path).map_err(|err| format!("failed to read {}: {err}", path.display()))
}
