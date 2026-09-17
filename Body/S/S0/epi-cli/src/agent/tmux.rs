use crate::agent::launch;
use crate::agent::runtime::PiLaunchPlan;
use crate::agent::{AgentLayout, TmuxCmd, DEFAULT_PI_AGENT_ID};
use crate::gate::config;
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TopologyReport {
    status: String,
    session_key: String,
    tmux_socket: String,
    tmux_session_name: String,
    tmux_window_name: String,
    tmux_window_id: String,
    tmux_pane_id: String,
    pane_created: bool,
    cfp_layout: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    visible_projection: Option<String>,
    terminal_binding: TerminalBindingReport,
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
        TmuxCmd::Topology {
            session_key,
            day_session,
            window,
            pane,
            cfp_layout,
            cf,
            cp,
            role,
            agent,
            child_dispatch_command,
            visible,
        } => apply_topology(
            TopologyRequest {
                session_key,
                day_session,
                window,
                pane,
                cfp_layout,
                cf,
                cp,
                role: role.as_deref(),
                agent: agent.as_deref(),
                child_dispatch_command: child_dispatch_command.as_deref(),
                visible: *visible,
            },
            json,
        ),
    }
}

struct TopologyRequest<'a> {
    session_key: &'a str,
    day_session: &'a str,
    window: &'a str,
    pane: &'a str,
    cfp_layout: &'a str,
    cf: &'a str,
    cp: &'a str,
    role: Option<&'a str>,
    agent: Option<&'a str>,
    child_dispatch_command: Option<&'a str>,
    visible: bool,
}

/// The only topology allocator.  Tmux owns the durable process substrate;
/// cmux may attach to this session after allocation but never owns a second
/// session, window, pane, or process lifecycle.
fn apply_topology(request: TopologyRequest<'_>, json: bool) -> Result<String, String> {
    validate_topology_request(&request)?;

    let gate_root = config::gate_root_from_env()?;
    let store = SessionStore::new(&gate_root)?;
    store.ensure(request.session_key)?;

    let socket = topology_socket_path(&gate_root)?;
    let cwd = std::env::current_dir().map_err(|err| err.to_string())?;
    let pane_env = topology_pane_env(&request);

    if !topology_has_session(&socket, request.day_session)? {
        topology_command(&socket)
            .arg("new-session")
            .arg("-d")
            .arg("-s")
            .arg(request.day_session)
            .arg("-n")
            .arg(request.window)
            .arg("-c")
            .arg(&cwd)
            .args(topology_env_args(&pane_env))
            .args(request.child_dispatch_command)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|err| format!("failed to run tmux: {err}"))
            .and_then(success_status)?;
        topology_select_pane_title(&socket, request.day_session, request.window, request.pane)?;
        let report = finish_topology(&store, &gate_root, &socket, &request, true, json)?;
        return Ok(report);
    }

    if !topology_has_window(&socket, request.day_session, request.window)? {
        topology_command(&socket)
            .arg("new-window")
            .arg("-d")
            .arg("-t")
            .arg(request.day_session)
            .arg("-n")
            .arg(request.window)
            .arg("-c")
            .arg(&cwd)
            .args(topology_env_args(&pane_env))
            .args(request.child_dispatch_command)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|err| format!("failed to run tmux: {err}"))
            .and_then(success_status)?;
        topology_select_pane_title(&socket, request.day_session, request.window, request.pane)?;
        let report = finish_topology(&store, &gate_root, &socket, &request, true, json)?;
        return Ok(report);
    }

    let existing = topology_find_pane(&socket, request.day_session, request.window, request.pane)?;
    let (pane_id, pane_created) = match existing {
        Some(pane_id) => (pane_id, false),
        None => {
            let output = topology_command(&socket)
                .arg("split-window")
                .arg("-d")
                .arg("-P")
                .arg("-F")
                .arg("#{pane_id}")
                .arg("-t")
                .arg(format!("{}:{}", request.day_session, request.window))
                .arg("-c")
                .arg(&cwd)
                .args(topology_env_args(&pane_env))
                .args(request.child_dispatch_command)
                .output()
                .map_err(|err| format!("failed to run tmux: {err}"))?;
            if !output.status.success() {
                return Err(format!(
                    "tmux split-window exited with status {}: {}",
                    output.status,
                    String::from_utf8_lossy(&output.stderr).trim(),
                ));
            }
            let pane_id = String::from_utf8_lossy(&output.stdout).trim().to_owned();
            if pane_id.is_empty() {
                return Err("tmux split-window returned no pane id".to_owned());
            }
            topology_set_pane_title(&socket, &pane_id, request.pane)?;
            (pane_id, true)
        }
    };

    let _ = pane_id;
    finish_topology(&store, &gate_root, &socket, &request, pane_created, json)
}

fn finish_topology(
    store: &SessionStore,
    gate_root: &Path,
    socket: &Path,
    request: &TopologyRequest<'_>,
    pane_created: bool,
    json: bool,
) -> Result<String, String> {
    let window_target = format!("{}:{}", request.day_session, request.window);
    let pane_id = topology_find_pane(socket, request.day_session, request.window, request.pane)?
        .ok_or_else(|| "allocated topology pane was not discoverable".to_owned())?;
    topology_apply_layout(socket, &window_target, request.cfp_layout)?;
    let window_id = topology_display_message(socket, &window_target, "#{window_id}")?;
    let lease = TerminalLease {
        session_key: request.session_key.to_owned(),
        tmux_session_name: request.day_session.to_owned(),
        tmux_window_id: window_id.clone(),
        tmux_pane_id: pane_id.clone(),
        created_at: now_ms()?,
        lease_ttl_seconds: DEFAULT_LEASE_TTL_SECONDS,
    };
    write_lease(gate_root, &lease)?;
    patch_topology_gateway_session(store, request, &lease)?;

    let visible_projection = if request.visible {
        Some(open_cmux_projection(
            socket,
            request.day_session,
            request.window,
            &std::env::current_dir()
                .map_err(|err| err.to_string())?
                .display()
                .to_string(),
        ))
    } else {
        None
    };
    let report = TopologyReport {
        status: "allocated".to_owned(),
        session_key: request.session_key.to_owned(),
        tmux_socket: socket.display().to_string(),
        tmux_session_name: request.day_session.to_owned(),
        tmux_window_name: request.window.to_owned(),
        tmux_window_id: window_id,
        tmux_pane_id: pane_id,
        pane_created,
        cfp_layout: request.cfp_layout.to_owned(),
        visible_projection,
        terminal_binding: TerminalBindingReport {
            session_key: request.session_key.to_owned(),
            tmux_session_name: lease.tmux_session_name.clone(),
            tmux_window_id: lease.tmux_window_id.clone(),
            tmux_pane_id: lease.tmux_pane_id.clone(),
            terminal_lease: lease,
        },
    };
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "allocated {}:{} {} ({})",
            request.day_session, request.window, request.pane, report.tmux_socket
        ))
    }
}

fn validate_topology_request(request: &TopologyRequest<'_>) -> Result<(), String> {
    for (label, value) in [
        ("session_key", request.session_key),
        ("day_session", request.day_session),
        ("window", request.window),
        ("pane", request.pane),
    ] {
        if value.trim().is_empty() {
            return Err(format!("{label} must not be empty"));
        }
    }
    for (label, value) in [
        ("day_session", request.day_session),
        ("window", request.window),
        ("pane", request.pane),
    ] {
        if !value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_'))
        {
            return Err(format!(
                "{label} may contain only ASCII letters, digits, '-' and '_'"
            ));
        }
    }
    if !matches!(request.cfp_layout, "CFP0" | "CFP1" | "CFP3") {
        return Err("cfp_layout must be CFP0, CFP1, or CFP3".to_owned());
    }
    if request.cf.trim().is_empty() || request.cp.trim().is_empty() {
        return Err("cf and cp must not be empty".to_owned());
    }
    Ok(())
}

fn topology_socket_path(gate_root: &Path) -> Result<PathBuf, String> {
    let socket = std::env::var_os("EPI_AGENT_TMUX_SOCKET")
        .map(PathBuf::from)
        .unwrap_or_else(|| gate_root.join("tmux").join("anima.sock"));
    let parent = socket
        .parent()
        .ok_or_else(|| "EPI_AGENT_TMUX_SOCKET must include a parent directory".to_owned())?;
    fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    Ok(socket)
}

fn topology_command(socket: &Path) -> Command {
    let mut command = tmux_command();
    command.arg("-S").arg(socket);
    command
}

fn topology_has_session(socket: &Path, session: &str) -> Result<bool, String> {
    let status = topology_command(socket)
        .args(["has-session", "-t", session])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    Ok(status.success())
}

fn topology_has_window(socket: &Path, session: &str, window: &str) -> Result<bool, String> {
    let output = topology_command(socket)
        .args(["list-windows", "-t", session, "-F", "#{window_name}"])
        .output()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    if !output.status.success() {
        return Err(format!(
            "tmux list-windows exited with status {}",
            output.status
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .any(|candidate| candidate.trim() == window))
}

fn topology_find_pane(
    socket: &Path,
    session: &str,
    window: &str,
    title: &str,
) -> Result<Option<String>, String> {
    let output = topology_command(socket)
        .args([
            "list-panes",
            "-t",
            &format!("{session}:{window}"),
            "-F",
            "#{pane_id}\t#{pane_title}",
        ])
        .output()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    if !output.status.success() {
        return Err(format!(
            "tmux list-panes exited with status {}",
            output.status
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .find_map(|line| {
            let (pane_id, pane_title) = line.split_once('\t')?;
            (pane_title == title).then(|| pane_id.to_owned())
        }))
}

fn topology_select_pane_title(
    socket: &Path,
    session: &str,
    window: &str,
    title: &str,
) -> Result<(), String> {
    let pane_id = topology_display_message(socket, &format!("{session}:{window}"), "#{pane_id}")?;
    topology_set_pane_title(socket, &pane_id, title)
}

fn topology_set_pane_title(socket: &Path, pane_id: &str, title: &str) -> Result<(), String> {
    topology_command(socket)
        .args(["select-pane", "-t", pane_id, "-T", title])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|err| format!("failed to run tmux: {err}"))
        .and_then(success_status)
}

fn topology_display_message(socket: &Path, target: &str, format: &str) -> Result<String, String> {
    let output = topology_command(socket)
        .args(["display-message", "-p", "-t", target, format])
        .stdin(Stdio::null())
        .output()
        .map_err(|err| format!("failed to run tmux: {err}"))?;
    if !output.status.success() {
        return Err(format!(
            "tmux display-message exited with status {}",
            output.status
        ));
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    if value.is_empty() {
        Err(format!("tmux returned empty value for {format}"))
    } else {
        Ok(value)
    }
}

fn topology_env_args(env: &[(String, String)]) -> Vec<String> {
    env.iter()
        .flat_map(|(key, value)| ["-e".to_owned(), format!("{key}={value}")])
        .collect()
}

fn topology_pane_env(request: &TopologyRequest<'_>) -> Vec<(String, String)> {
    let mut env = vec![
        (
            "EPI_GATE_SESSION_KEY".to_owned(),
            request.session_key.to_owned(),
        ),
        (
            "EPI_TERMINAL_LEASE_ID".to_owned(),
            request.session_key.to_owned(),
        ),
        ("CF_IDENTITY".to_owned(), request.cf.to_owned()),
        ("CMUX_CP".to_owned(), request.cp.to_owned()),
        ("CMUX_CFP".to_owned(), request.cfp_layout.to_owned()),
        (
            "EPI_TMUX_TOPOLOGY_WINDOW".to_owned(),
            request.window.to_owned(),
        ),
        ("EPI_TMUX_TOPOLOGY_PANE".to_owned(), request.pane.to_owned()),
    ];
    if let Some(role) = request.role.filter(|role| !role.trim().is_empty()) {
        env.push(("EPI_AGENT_NAME".to_owned(), role.to_owned()));
        env.push(("EPI_AGENT_MODE".to_owned(), "dispatch".to_owned()));
    }
    if let Some(agent) = request.agent.filter(|agent| !agent.trim().is_empty()) {
        env.push(("EPI_AGENT_RUNTIME".to_owned(), agent.to_owned()));
    }
    env
}

fn topology_apply_layout(socket: &Path, target: &str, cfp_layout: &str) -> Result<(), String> {
    let layout = match cfp_layout {
        "CFP0" => "even-horizontal",
        "CFP1" => "even-horizontal",
        "CFP3" => "tiled",
        _ => return Err("cfp_layout must be CFP0, CFP1, or CFP3".to_owned()),
    };
    topology_command(socket)
        .args(["select-layout", "-t", target, layout])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|err| format!("failed to run tmux: {err}"))
        .and_then(success_status)
}

fn patch_topology_gateway_session(
    store: &SessionStore,
    request: &TopologyRequest<'_>,
    lease: &TerminalLease,
) -> Result<(), String> {
    let lease_owner = request.agent.or(request.role).unwrap_or("anima");
    store.patch(
        request.session_key,
        SessionPatch {
            active_agent_id: Some(lease_owner.to_owned()),
            runtime_cwd: Some(Some(
                std::env::current_dir()
                    .map_err(|err| err.to_string())?
                    .display()
                    .to_string(),
            )),
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
                    lease_owner: Some(format!("pi.{lease_owner}")),
                    lease_purpose: Some("anima-topology".to_owned()),
                    lease_expires_at_ms: Some(lease_expires_at(lease)),
                }),
                capture_policy: None,
            })),
            ..Default::default()
        },
    )?;
    Ok(())
}

/// cmux has no authority over process state.  A successful call merely opens a
/// terminal workspace whose first command attaches to the already-live tmux
/// session on the exact isolated socket above.
fn open_cmux_projection(socket: &Path, session: &str, window: &str, cwd: &str) -> String {
    let command = format!(
        "tmux -S {} attach-session -t {}",
        shell_single_quote(&socket.display().to_string()),
        shell_single_quote(session),
    );
    match Command::new("cmux")
        .args([
            "new-workspace",
            "--name",
            &format!("{session}-{window}"),
            "--cwd",
            cwd,
            "--command",
            &command,
        ])
        .stdin(Stdio::null())
        .output()
    {
        Ok(output) if output.status.success() => "opened".to_owned(),
        Ok(output) => format!(
            "unavailable: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ),
        Err(err) => format!("unavailable: {err}"),
    }
}

fn success_status(status: std::process::ExitStatus) -> Result<(), String> {
    if status.success() {
        Ok(())
    } else {
        Err(format!("tmux exited with status {status}"))
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
            if output.status.success() && !String::from_utf8_lossy(&output.stdout).trim().is_empty()
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
