mod common;

use common::{read_to_string, run_epi, write_executable, TestEnv};
use epi_logos::gate::{session_store::SessionStore, transcripts};
use serde_json::Value;

#[test]
fn terminal_backed_subagent_lists_binding_and_stop_kills_terminal() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.root.join("gate");
    let tmux_log = base_env.root.join("tmux-subagent.log");
    let tmux_bin = write_executable(
        base_env.root.join("bin/tmux"),
        &format!(
            "#!/bin/sh\ncmd=\"$1\"\nprintf '%s' \"$cmd\" >> \"{log}\"\nshift\nfor arg in \"$@\"; do printf ' <%s>' \"$arg\" >> \"{log}\"; done\nprintf '\\n' >> \"{log}\"\ncase \"$cmd\" in\n  has-session) exit 1 ;;\n  display-message)\n    case \"$*\" in\n      *window_id*) printf '@subagent-window' ;;\n      *pane_id*) printf '%%subagent-pane' ;;\n    esac\n    exit 0\n    ;;\n  *) exit 0 ;;\nesac\n",
            log = tmux_log.display()
        ),
    );
    let env = base_env
        .with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string())
        .with_env("EPI_AGENT_TERMINAL_BACKED", "1")
        .with_env("EPI_AGENT_TMUX_BIN", tmux_bin.display().to_string());

    let run = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "run",
            "--agent",
            "vak",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Hold a terminal-backed session",
        ],
        &env,
    );
    assert!(
        run.status.success(),
        "terminal-backed subagent failed: {}",
        run.stderr
    );
    let run_value: Value = serde_json::from_str(&run.stdout).expect("run json");
    assert_eq!(run_value["status"], "running");
    let session_key = run_value["sessionKey"].as_str().expect("session key");
    assert_eq!(
        run_value["terminalBinding"]["attachedSessionKey"],
        session_key
    );
    assert_eq!(run_value["terminalBinding"]["tmuxPaneId"], "%subagent-pane");

    let store = SessionStore::new(&gate_root).expect("session store");
    let stored = store.resolve(session_key).expect("terminal session");
    assert!(
        stored.terminal_binding.is_some(),
        "terminal-backed run must patch terminal metadata before launch"
    );
    assert_eq!(
        gate_root
            .join("terminal-leases")
            .read_dir()
            .unwrap()
            .count(),
        1,
        "terminal-backed run must persist exactly one child lease"
    );

    let list = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "list",
            "--parent-session",
            "agent:main:main",
        ],
        &env,
    );
    assert!(
        list.status.success(),
        "subagent list failed: {}",
        list.stderr
    );
    let list_value: Value = serde_json::from_str(&list.stdout).expect("list json");
    let listed = list_value["sessions"]
        .as_array()
        .expect("sessions")
        .iter()
        .find(|entry| entry["sessionKey"] == session_key)
        .expect("listed terminal session");
    assert_eq!(listed["cmuxPaneId"], Value::Null);
    assert_eq!(listed["terminalBinding"]["tmuxPaneId"], "%subagent-pane");

    let stop = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "stop",
            "--session-key",
            session_key,
        ],
        &env,
    );
    assert!(
        stop.status.success(),
        "subagent stop failed: {}",
        stop.stderr
    );
    let stop_value: Value = serde_json::from_str(&stop.stdout).expect("stop json");
    assert_eq!(stop_value["stopMode"], "terminal");
    assert_eq!(
        stop_value["terminalBinding"]["terminalStatus"], "detached",
        "stop must surface changed terminal status"
    );

    let log = read_to_string(tmux_log);
    assert!(
        log.contains("kill-session <-t> <epi-khora-repo-vak>"),
        "stop_runtime must terminate the bound terminal session, log:\n{log}"
    );
    let entries = transcripts::read_entries(&gate_root, session_key).expect("transcript entries");
    assert!(
        !entries
            .iter()
            .any(|entry| entry.role == "system" && entry.kind == "abort"),
        "terminal-backed stop must not be transcript-only abort semantics"
    );
}

#[test]
fn captured_subagent_stop_remains_transcript_abort_without_terminal_binding() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.root.join("gate");
    let env = base_env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let run = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "run",
            "--agent",
            "vak",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Captured non-terminal session",
        ],
        &env,
    );
    assert!(run.status.success(), "captured run failed: {}", run.stderr);
    let run_value: Value = serde_json::from_str(&run.stdout).expect("run json");
    assert_eq!(run_value["terminalBinding"], Value::Null);
    let session_key = run_value["sessionKey"].as_str().expect("session key");

    let stop = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "stop",
            "--session-key",
            session_key,
        ],
        &env,
    );
    assert!(
        stop.status.success(),
        "captured stop failed: {}",
        stop.stderr
    );
    let stop_value: Value = serde_json::from_str(&stop.stdout).expect("stop json");
    assert_eq!(stop_value["stopMode"], "transcript");

    let entries = transcripts::read_entries(&gate_root, session_key).expect("transcript entries");
    assert!(entries
        .iter()
        .any(|entry| entry.role == "system" && entry.kind == "abort"));
}
