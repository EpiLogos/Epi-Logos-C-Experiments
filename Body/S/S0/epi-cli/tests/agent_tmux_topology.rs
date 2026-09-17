mod common;

use common::{run_epi, TestEnv};
use epi_logos::gate::sessions::SessionStore;
use serde_json::Value;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::{Duration, Instant};

#[test]
fn topology_command_allocates_a_real_tmux_session_and_gateway_lease() {
    let Some(tmux) = resolve_tmux() else {
        eprintln!("skipping live topology integration: tmux is not installed");
        return;
    };

    let env = TestEnv::empty();
    let socket = std::path::PathBuf::from(format!(
        "/private/tmp/epi-topology-{}.sock",
        std::process::id()
    ));
    if !tmux_socket_is_usable(&tmux, &socket) {
        eprintln!("skipping live topology integration: isolated tmux socket is unavailable");
        return;
    }

    let env = env.with_env("EPI_AGENT_TMUX_SOCKET", socket.display().to_string());
    let first = run_topology(
        &env,
        "agent:anima:topology-nous",
        "p-nous-task-1",
        "nous",
        "CFP3",
        "printf '%s' \"$EPI_GATE_SESSION_KEY/$CF_IDENTITY/$CMUX_CFP\"; sleep 20",
    );
    assert!(
        first.status.success(),
        "topology allocation failed:\nstdout:\n{}\nstderr:\n{}",
        first.stdout,
        first.stderr
    );
    let first_json: Value = serde_json::from_str(&first.stdout).expect("topology report json");
    assert_eq!(first_json["tmuxSessionName"], "epi-2026-07-17");
    assert_eq!(first_json["tmuxWindowName"], "w-nous");
    assert_eq!(first_json["paneCreated"], true);
    assert_eq!(
        first_json["terminalBinding"]["terminalLease"]["sessionKey"],
        "agent:anima:topology-nous"
    );

    let first_pane = first_json["tmuxPaneId"].as_str().expect("first pane id");
    let capture = wait_for_capture(
        &tmux,
        &socket,
        first_pane,
        "agent:anima:topology-nous/(0/1/2/3)/CFP3",
    );
    assert!(
        capture.contains("agent:anima:topology-nous/(0/1/2/3)/CFP3"),
        "topology command did not launch the child in its leased VAK environment:\n{capture}"
    );

    let second = run_topology(
        &env,
        "agent:anima:topology-logos",
        "p-logos-task-2",
        "logos",
        "CFP3",
        "sleep 20",
    );
    assert!(
        second.status.success(),
        "second topology allocation failed: {}",
        second.stderr
    );
    assert_eq!(pane_count(&tmux, &socket, "epi-2026-07-17:w-nous"), 2);

    let repeated = run_topology(
        &env,
        "agent:anima:topology-nous",
        "p-nous-task-1",
        "nous",
        "CFP3",
        "printf 'must-not-restart'; sleep 20",
    );
    assert!(
        repeated.status.success(),
        "idempotent topology allocation failed: {}",
        repeated.stderr
    );
    let repeated_json: Value = serde_json::from_str(&repeated.stdout).expect("repeat report json");
    assert_eq!(repeated_json["paneCreated"], false);
    assert_eq!(pane_count(&tmux, &socket, "epi-2026-07-17:w-nous"), 2);

    let gate_root = env.home.join(".epi/gate");
    let record = SessionStore::new(&gate_root)
        .expect("session store")
        .resolve("agent:anima:topology-nous")
        .expect("topology session record");
    let binding = record.terminal_binding.expect("gateway terminal binding");
    assert_eq!(binding.session_anchor.as_deref(), Some("epi-2026-07-17"));
    assert_eq!(binding.tmux_pane_id.as_deref(), Some(first_pane));
    assert_eq!(
        binding
            .lease
            .as_ref()
            .and_then(|lease| lease.lease_purpose.as_deref()),
        Some("anima-topology")
    );

    let _ = Command::new(&tmux)
        .args([
            "-S",
            socket.to_str().expect("socket path"),
            "kill-session",
            "-t",
            "epi-2026-07-17",
        ])
        .status();
    fs::remove_file(&socket).ok();
}

#[test]
fn topology_command_refuses_unsafe_tmux_targets_before_allocation() {
    let env = TestEnv::empty().with_env(
        "EPI_AGENT_TMUX_SOCKET",
        "/tmp/epi-topology-never-created.sock",
    );
    let output = run_epi(
        &[
            "--json",
            "agent",
            "tmux",
            "topology",
            "--session-key",
            "agent:anima:bad-target",
            "--day-session",
            "epi-2026-07-17",
            "--window",
            "w-nous; kill-server",
            "--pane",
            "p-nous-task-1",
            "--cfp-layout",
            "CFP0",
            "--cf",
            "(0000)",
            "--cp",
            "4.0",
        ],
        &env,
    );
    assert!(!output.status.success());
    assert!(output
        .stderr
        .contains("window may contain only ASCII letters"));
}

fn run_topology(
    env: &TestEnv,
    session_key: &str,
    pane: &str,
    role: &str,
    cfp_layout: &str,
    child_command: &str,
) -> common::TestOutput {
    run_epi(
        &[
            "--json",
            "agent",
            "tmux",
            "topology",
            "--session-key",
            session_key,
            "--day-session",
            "epi-2026-07-17",
            "--window",
            "w-nous",
            "--pane",
            pane,
            "--cfp-layout",
            cfp_layout,
            "--cf",
            "(0/1/2/3)",
            "--cp",
            "4.3",
            "--role",
            role,
            "--agent",
            "codex",
            "--child-dispatch-command",
            child_command,
        ],
        env,
    )
}

fn resolve_tmux() -> Option<String> {
    std::env::var_os("PATH").and_then(|path| {
        std::env::split_paths(&path)
            .map(|dir| dir.join("tmux"))
            .find(|candidate| candidate.is_file())
            .map(|candidate| candidate.display().to_string())
    })
}

fn tmux_socket_is_usable(tmux: &str, socket: &Path) -> bool {
    let Some(socket) = socket.to_str() else {
        return false;
    };
    let started = Command::new(tmux)
        .args(["-S", socket, "new-session", "-d", "-s", "topology-probe"])
        .status()
        .map(|status| status.success())
        .unwrap_or(false);
    if started {
        let _ = Command::new(tmux)
            .args(["-S", socket, "kill-session", "-t", "topology-probe"])
            .status();
    }
    started
}

fn wait_for_capture(tmux: &str, socket: &Path, pane: &str, expected: &str) -> String {
    let deadline = Instant::now() + Duration::from_secs(20);
    let mut last = String::new();
    while Instant::now() < deadline {
        let output = Command::new(tmux)
            .args([
                "-S",
                socket.to_str().expect("socket path"),
                "capture-pane",
                "-p",
                "-t",
                pane,
            ])
            .output()
            .expect("tmux capture-pane runs");
        last = String::from_utf8_lossy(&output.stdout).to_string();
        if last.contains(expected) {
            return last;
        }
        thread::sleep(Duration::from_millis(100));
    }
    last
}

fn pane_count(tmux: &str, socket: &Path, target: &str) -> usize {
    let output = Command::new(tmux)
        .args([
            "-S",
            socket.to_str().expect("socket path"),
            "list-panes",
            "-t",
            target,
            "-F",
            "#{pane_id}",
        ])
        .output()
        .expect("tmux list-panes runs");
    assert!(output.status.success());
    String::from_utf8_lossy(&output.stdout).lines().count()
}
