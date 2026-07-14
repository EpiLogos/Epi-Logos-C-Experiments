use crate::agent::launch;
use crate::agent::runtime::PiLaunchPlan;
use crate::agent::{AgentLayout, TmuxCmd, DEFAULT_PI_AGENT_ID};
use crate::gate::session_store::slug as session_slug;
use crate::gate::sessions::{SessionPatch, SessionStore};
use epi_s3_gateway_contract::{
    TerminalBinding, TerminalLease as GatewayTerminalLease, TerminalStatus,
};
use serde::{Deserialize, Serialize};
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};

const DEFAULT_LEASE_TTL_SECONDS: u64 = 12 * 60 * 60;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TmuxReport {
    status: String,
    session_name: String,
    agent_id: String,
    command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    session_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    terminal_binding: Option<TerminalBindingReport>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalLease {
    pub session_key: String,
    pub tmux_session_name: String,
    pub tmux_window_id: String,
    pub tmux_pane_id: String,
    pub created_at: u128,
    pub lease_ttl_seconds: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalBindingReport {
    session_key: String,
    tmux_session_name: String,
    tmux_window_id: String,
    tmux_pane_id: String,
    terminal_lease: TerminalLease,
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
                    session_key: None,
                    terminal_binding: None,
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
                    session_key: None,
                    terminal_binding: None,
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
                    session_key: None,
                    terminal_binding: None,
                },
                json,
            )
        }
    }
}

pub(crate) fn run_plan(plan: &PiLaunchPlan, json: bool) -> Result<String, String> {
    let session_key = allocate_session_key(plan);
    let lease = create_session(plan, &session_key)?;
    inject_runtime_command(&lease.tmux_pane_id, &launch::pi_command_argv(plan))?;
    patch_gateway_session(plan, &lease)?;

    render(
        TmuxReport {
            status: "running".to_owned(),
            session_name: lease.tmux_session_name.clone(),
            agent_id: plan.agent_id.clone(),
            command: launch::pi_command_argv(plan).join(" "),
            session_key: Some(session_key.clone()),
            terminal_binding: Some(TerminalBindingReport {
                session_key,
                tmux_session_name: lease.tmux_session_name.clone(),
                tmux_window_id: lease.tmux_window_id.clone(),
                tmux_pane_id: lease.tmux_pane_id.clone(),
                terminal_lease: lease,
            }),
        },
        json,
    )
}

pub fn create_session(plan: &PiLaunchPlan, session_key: &str) -> Result<TerminalLease, String> {
    let session_name = tmux_session_name(&plan.repo_root, &plan.agent_id);
    let lease_id = session_key.to_owned();
    let extra_env = [
        ("EPI_GATE_SESSION_KEY", session_key.to_owned()),
        ("EPI_TERMINAL_LEASE_ID", lease_id),
    ];
    if !has_session(&session_name)? {
        let mut command = tmux_command();
        command
            .arg("new-session")
            .arg("-d")
            .arg("-s")
            .arg(&session_name)
            .arg("-c")
            .arg(plan.repo_root.display().to_string());
        for (key, value) in launch::plan_env(plan, &extra_env) {
            command.env(key, value);
        }
        run_command(command)?;
    }
    set_session_environment(&session_name, plan, &extra_env)?;

    let tmux_window_id = display_message(&session_name, "#{window_id}")?;
    let tmux_pane_id = display_message(&session_name, "#{pane_id}")?;
    let lease = TerminalLease {
        session_key: session_key.to_owned(),
        tmux_session_name: session_name,
        tmux_window_id,
        tmux_pane_id,
        created_at: now_ms()?,
        lease_ttl_seconds: DEFAULT_LEASE_TTL_SECONDS,
    };
    write_lease(&plan.gate_state_root, &lease)?;
    Ok(lease)
}

pub fn attach_session(session_key: &str, gate_root: impl AsRef<Path>) -> Result<(), String> {
    let lease = read_lease(gate_root, session_key)?;
    run_tmux(["attach-session", "-t", &lease.tmux_session_name])
}

pub fn kill_session(session_key: &str, gate_root: impl AsRef<Path>) -> Result<(), String> {
    let lease = read_lease(gate_root, session_key)?;
    if has_session(&lease.tmux_session_name)? {
        run_tmux(["kill-session", "-t", &lease.tmux_session_name])?;
    }
    Ok(())
}

pub fn list_active_leases(gate_root: impl AsRef<Path>) -> Result<Vec<TerminalLease>, String> {
    let dir = lease_dir(gate_root);
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let now = now_ms()?;
    let mut leases = Vec::new();
    for entry in fs::read_dir(dir).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let content = fs::read_to_string(entry.path()).map_err(|err| err.to_string())?;
        let lease: TerminalLease = serde_json::from_str(&content).map_err(|err| err.to_string())?;
        if lease_expires_at(&lease) > now {
            leases.push(lease);
        }
    }
    leases.sort_by(|left, right| left.session_key.cmp(&right.session_key));
    Ok(leases)
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
            session_key: None,
            terminal_binding: None,
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
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
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
    // Detach the tmux client from the caller's stdio. When `epi` itself runs
    // with piped output (test harnesses, the gateway), an inheriting
    // `tmux new-session` that has to BOOT the server hands those pipe fds to
    // the daemonized server and the client can hang past the caller's
    // deadline (observed as the terminal-safety e2e flake under verify-all).
    let status = command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
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

fn allocate_session_key(plan: &PiLaunchPlan) -> String {
    std::env::var("EPI_GATE_SESSION_KEY")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| {
            let surface = plan.role.as_deref().unwrap_or("main");
            format!("agent:{}:{surface}", plan.agent_id)
        })
}

fn set_session_environment(
    session_name: &str,
    plan: &PiLaunchPlan,
    extra_env: &[(&str, String)],
) -> Result<(), String> {
    for (key, value) in launch::plan_env(plan, extra_env) {
        let value = value.to_string_lossy().to_string();
        let mut command = tmux_command();
        command
            .arg("set-environment")
            .arg("-t")
            .arg(session_name)
            .arg(&key)
            .arg(value);
        run_command(command)?;
    }
    Ok(())
}

fn display_message(target: &str, format: &str) -> Result<String, String> {
    let output = tmux_command()
        .arg("display-message")
        .arg("-p")
        .arg("-t")
        .arg(target)
        .arg(format)
        .stdin(Stdio::null())
        .output()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    if !output.status.success() {
        return Err(format!("tmux exited with status {}", output.status));
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    if value.is_empty() {
        Err(format!("tmux returned empty value for {format}"))
    } else {
        Ok(value)
    }
}

/// Wait for the pane's shell to draw a prompt before typing into it.
/// zsh's line editor FLUSHES pending typeahead during init — under load a
/// command sent into a still-booting pane simply evaporates (observed as
/// the terminal-binding e2e flake under the full repo gate, and as lost
/// launches on slow shells live). A rendered prompt implies the line
/// editor is up; after that, send-keys is safe. Times out to the old
/// fire-and-hope behavior rather than failing the launch.
fn wait_for_pane_shell_ready(pane_id: &str) {
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(15);
    while std::time::Instant::now() < deadline {
        let output = tmux_command()
            .args(["capture-pane", "-p", "-t", pane_id])
            .stdin(Stdio::null())
            .output();
        if let Ok(output) = output {
            if output.status.success()
                && !String::from_utf8_lossy(&output.stdout).trim().is_empty()
            {
                return;
            }
        }
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}

fn inject_runtime_command(pane_id: &str, argv: &[String]) -> Result<(), String> {
    let Some((program, args)) = argv.split_first() else {
        return Err("missing PI runtime command".to_owned());
    };
    wait_for_pane_shell_ready(pane_id);
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

fn patch_gateway_session(plan: &PiLaunchPlan, lease: &TerminalLease) -> Result<(), String> {
    let store = SessionStore::new(&plan.gate_state_root)?;
    store.ensure(&lease.session_key)?;
    store.patch(
        &lease.session_key,
        SessionPatch {
            active_agent_id: Some(plan.agent_id.clone()),
            runtime_cwd: Some(Some(plan.repo_root.display().to_string())),
            terminal_binding: Some(Some(TerminalBinding {
                terminal_identifier: Some(format!(
                    "tmux:{}:{}",
                    lease.tmux_session_name, lease.tmux_pane_id
                )),
                session_anchor: Some(lease.tmux_session_name.clone()),
                tmux_pane_id: Some(lease.tmux_pane_id.clone()),
                attached_session_key: Some(lease.session_key.clone()),
                terminal_status: Some(TerminalStatus::Attached),
                lease: Some(GatewayTerminalLease {
                    lease_owner: Some(format!("pi.{}", plan.agent_id)),
                    lease_purpose: Some("interactive-session".to_owned()),
                    lease_expires_at_ms: Some(lease_expires_at(lease)),
                }),
                capture_policy: None,
            })),
            ..Default::default()
        },
    )?;
    Ok(())
}

fn write_lease(gate_root: impl AsRef<Path>, lease: &TerminalLease) -> Result<(), String> {
    let dir = lease_dir(gate_root);
    fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    let payload = serde_json::to_string_pretty(lease).map_err(|err| err.to_string())?;
    fs::write(
        dir.join(format!("{}.json", session_slug(&lease.session_key))),
        payload,
    )
    .map_err(|err| err.to_string())
}

fn read_lease(gate_root: impl AsRef<Path>, session_key: &str) -> Result<TerminalLease, String> {
    let path = lease_dir(gate_root).join(format!("{}.json", session_slug(session_key)));
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn lease_dir(gate_root: impl AsRef<Path>) -> PathBuf {
    gate_root.as_ref().join("terminal-leases")
}

fn lease_expires_at(lease: &TerminalLease) -> u128 {
    lease.created_at + u128::from(lease.lease_ttl_seconds) * 1000
}

/// 12.T12.2 (c): the lease verdict a gnostic-shell call site checks before a
/// persistent operation — expired/missing leases refuse recoverably
/// (re-acquire and retry) instead of surfacing as mystery shell failures.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase", tag = "state")]
pub enum TerminalLeaseStatus {
    Live { expires_in_ms: u128 },
    Expired { expired_for_ms: u128 },
    Missing,
}

pub fn validate_lease(gate_root: impl AsRef<Path>, session_key: &str) -> TerminalLeaseStatus {
    let Ok(lease) = read_lease(&gate_root, session_key) else {
        return TerminalLeaseStatus::Missing;
    };
    let Ok(now) = now_ms() else {
        return TerminalLeaseStatus::Missing;
    };
    let expires = lease_expires_at(&lease);
    if now < expires {
        TerminalLeaseStatus::Live {
            expires_in_ms: expires - now,
        }
    } else {
        TerminalLeaseStatus::Expired {
            expired_for_ms: now - expires,
        }
    }
}

fn now_ms() -> Result<u128, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .map_err(|err| err.to_string())
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
mod lease_validation_tests {
    use super::*;

    fn temp_gate_root() -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "epi-lease-test-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn lease_at(session_key: &str, created_at: u128, ttl: u64) -> TerminalLease {
        TerminalLease {
            session_key: session_key.to_owned(),
            tmux_session_name: "epi-test".to_owned(),
            tmux_window_id: "@1".to_owned(),
            tmux_pane_id: "%1".to_owned(),
            created_at,
            lease_ttl_seconds: ttl,
        }
    }

    #[test]
    fn validate_lease_reports_live_expired_and_missing() {
        let root = temp_gate_root();

        assert_eq!(
            validate_lease(&root, "agent:ghost:main"),
            TerminalLeaseStatus::Missing
        );

        let now = now_ms().unwrap();
        write_lease(&root, &lease_at("agent:live:main", now, 3600)).unwrap();
        match validate_lease(&root, "agent:live:main") {
            TerminalLeaseStatus::Live { expires_in_ms } => assert!(expires_in_ms > 0),
            other => panic!("expected live lease, got {other:?}"),
        }

        write_lease(&root, &lease_at("agent:stale:main", now - 10_000, 1)).unwrap();
        match validate_lease(&root, "agent:stale:main") {
            TerminalLeaseStatus::Expired { expired_for_ms } => assert!(expired_for_ms > 0),
            other => panic!("expected expired lease, got {other:?}"),
        }

        fs::remove_dir_all(&root).ok();
    }
}
