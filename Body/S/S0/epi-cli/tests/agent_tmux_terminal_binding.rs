mod common;

use common::{read_to_string, run_epi, TestEnv};
use serde_json::Value;
use std::process::Command;
use std::thread;
use std::time::{Duration, Instant};

#[test]
fn persist_launch_starts_real_pi_process_inside_tmux_pane() {
    let Some(tmux_bin) = resolve_tmux() else {
        eprintln!("skipping real tmux binding test: tmux not installed");
        return;
    };
    if !tmux_is_usable(&tmux_bin) {
        eprintln!("skipping real tmux binding test: tmux is installed but unavailable");
        return;
    }

    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18873");
    let _ = Command::new(&tmux_bin)
        .args(["kill-session", "-t", "epi-khora-repo-anima"])
        .status();
    let out = run_epi(
        [
            "--json",
            "agent",
            "anima",
            "--persist",
            "--role",
            "psyche",
            "tmux terminal binding",
        ]
        .as_slice(),
        &env,
    );

    assert!(
        out.status.success(),
        "persist failed:\nstdout:\n{}\nstderr:\n{}",
        out.stdout,
        out.stderr
    );

    let value: Value = serde_json::from_str(&out.stdout).expect("persist report is json");
    let session_name = value["terminalBinding"]["tmuxSessionName"]
        .as_str()
        .expect("tmux session name");
    let pane_id = value["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("tmux pane id");

    let captured = wait_for_capture(&tmux_bin, pane_id, "assistant: tmux terminal binding");
    assert!(
        captured.contains("assistant: tmux terminal binding"),
        "capture did not include fake pi output:\n{captured}"
    );

    let lease_path = env
        .repo_root
        .join(".epi/gate/terminal-leases/agent_anima_psyche.json");
    let lease = read_to_string(lease_path);
    assert!(lease.contains("\"sessionKey\": \"agent:anima:psyche\""));
    assert!(lease.contains("\"tmuxPaneId\":"));

    let _ = Command::new(&tmux_bin)
        .args(["kill-session", "-t", session_name])
        .status();
}

fn wait_for_capture(tmux_bin: &str, pane_id: &str, needle: &str) -> String {
    // 45s, not 5s: under the full verify-all gate the machine is saturated
    // and the pane's worker can take well past 5s to appear (same law as
    // terminal_session_safety_e2e::wait_for_capture). Early-exit on match.
    let deadline = Instant::now() + Duration::from_secs(45);
    let mut last = String::new();
    while Instant::now() < deadline {
        let output = Command::new(tmux_bin)
            .args(["capture-pane", "-p", "-t", pane_id])
            .output()
            .expect("tmux capture-pane runs");
        last = String::from_utf8_lossy(&output.stdout).to_string();
        if last.contains(needle) {
            return last;
        }
        thread::sleep(Duration::from_millis(100));
    }
    last
}

fn resolve_tmux() -> Option<String> {
    std::env::var_os("PATH").and_then(|path| {
        std::env::split_paths(&path)
            .map(|dir| dir.join("tmux"))
            .find(|candidate| candidate.is_file())
            .map(|candidate| candidate.display().to_string())
    })
}

fn tmux_is_usable(tmux_bin: &str) -> bool {
    let session_name = format!("epi-tmux-probe-{}", std::process::id());
    let started = Command::new(tmux_bin)
        .args(["new-session", "-d", "-s", &session_name])
        .status()
        .map(|status| status.success())
        .unwrap_or(false);
    if started {
        let _ = Command::new(tmux_bin)
            .args(["kill-session", "-t", &session_name])
            .status();
    }
    started
}
