mod common;

use common::{read_to_string, run_epi, write_executable, TestEnv};
use epi_logos::gate::{session_store::SessionStore, transcripts};
use serde_json::Value;

#[test]
fn team_create_persists_real_team_and_worker_sessions() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.root.join("gate");
    let env = base_env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let output = run_epi(
        &[
            "--json",
            "agent",
            "team",
            "create",
            "--parent-session",
            "agent:main:main",
            "--strategy",
            "parallel",
            "--task",
            "Investigate contract drift",
            "--agent",
            "vak",
            "--agent",
            "nous",
        ],
        &env,
    );
    assert!(
        output.status.success(),
        "team create failed: {}",
        output.stderr
    );
    let payload: Value = serde_json::from_str(&output.stdout).expect("team create json");
    let team_id = payload["team"]["teamId"].as_str().expect("team id");
    assert_eq!(payload["team"]["strategy"], "parallel");
    assert_eq!(
        payload["team"]["members"]
            .as_array()
            .expect("members")
            .len(),
        2
    );
    assert!(gate_root
        .join("teams")
        .join(format!("{team_id}.json"))
        .exists());

    let store = SessionStore::new(&gate_root).expect("session store");
    let first_worker = payload["team"]["members"][0]["sessionKey"]
        .as_str()
        .expect("worker session key");
    let worker = store.resolve(first_worker).expect("worker resolve");
    assert_eq!(worker.spawned_by.as_deref(), Some("agent:main:main"));
    assert_eq!(worker.team_id.as_deref(), Some(team_id));
    assert!(worker.cmux_workspace.is_some());
    assert!(worker.cmux_surface.is_some());
    assert!(worker.cmux_pane_id.is_some());
}

#[test]
fn team_dispatch_chain_run_and_subagent_runtime_use_real_gate_state() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.root.join("gate");
    let env = base_env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let dispatch = run_epi(
        &[
            "--json",
            "agent",
            "team",
            "dispatch",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Inspect the runtime contract",
            "--agent",
            "vak",
        ],
        &env,
    );
    assert!(
        dispatch.status.success(),
        "team dispatch failed: {}",
        dispatch.stderr
    );
    let dispatch_value: Value = serde_json::from_str(&dispatch.stdout).expect("dispatch json");
    let dispatch_session = dispatch_value["sessionKey"]
        .as_str()
        .expect("dispatch session key");
    assert_eq!(dispatch_value["status"], "completed");
    assert!(dispatch_value["output"]
        .as_str()
        .unwrap()
        .contains("Inspect the runtime contract"));
    assert!(dispatch_value["cmuxWorkspace"].as_str().is_some());

    let chain = run_epi(
        &[
            "--json",
            "agent",
            "chain",
            "run",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Audit the runtime path",
            "--agent",
            "vak",
            "--agent",
            "nous",
        ],
        &env,
    );
    assert!(chain.status.success(), "chain run failed: {}", chain.stderr);
    let chain_value: Value = serde_json::from_str(&chain.stdout).expect("chain json");
    assert_eq!(chain_value["status"], "completed");
    assert_eq!(chain_value["steps"].as_array().expect("steps").len(), 2);
    assert!(chain_value["team"]["cmuxWorkspace"].as_str().is_some());

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
            "Collect the evidence",
        ],
        &env,
    );
    assert!(run.status.success(), "subagent run failed: {}", run.stderr);
    let run_value: Value = serde_json::from_str(&run.stdout).expect("subagent run json");
    let session_key = run_value["sessionKey"]
        .as_str()
        .expect("session key")
        .to_owned();
    assert_eq!(run_value["status"], "completed");
    assert!(run_value["output"]
        .as_str()
        .unwrap()
        .contains("Collect the evidence"));

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
    let list_value: Value = serde_json::from_str(&list.stdout).expect("subagent list json");
    assert!(list_value["sessions"]
        .as_array()
        .expect("sessions")
        .iter()
        .any(|entry| entry["sessionKey"] == session_key));

    let cont = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "continue",
            "--session-key",
            &session_key,
            "--task",
            "Continue the evidence trail",
        ],
        &env,
    );
    assert!(
        cont.status.success(),
        "subagent continue failed: {}",
        cont.stderr
    );
    let cont_value: Value = serde_json::from_str(&cont.stdout).expect("subagent continue json");
    assert_eq!(cont_value["sessionKey"], session_key);
    assert!(cont_value["output"]
        .as_str()
        .unwrap()
        .contains("Continue the evidence trail"));

    let stop = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "stop",
            "--session-key",
            &session_key,
        ],
        &env,
    );
    assert!(
        stop.status.success(),
        "subagent stop failed: {}",
        stop.stderr
    );
    let stop_value: Value = serde_json::from_str(&stop.stdout).expect("subagent stop json");
    assert_eq!(stop_value["stopped"], true);

    let entries = transcripts::read_entries(&gate_root, &session_key).expect("transcript entries");
    assert!(entries
        .iter()
        .any(|entry| entry.role == "system" && entry.kind == "abort"));

    let store = SessionStore::new(&gate_root).expect("session store");
    let dispatched = store
        .resolve(dispatch_session)
        .expect("dispatch session resolve");
    assert_eq!(dispatched.spawned_by.as_deref(), Some("agent:main:main"));
    assert!(dispatched.team_id.is_some());
    assert_eq!(dispatched.orchestration_kind.as_deref(), Some("parallel"));
}

#[test]
fn terminal_backed_team_and_chain_use_terminal_lease_not_cmux_projection() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.root.join("gate");
    let tmux_log = base_env.root.join("tmux-team.log");
    let tmux_counter = base_env.root.join("tmux-counter");
    let tmux_bin = write_executable(
        base_env.root.join("bin/tmux"),
        &format!(
            "#!/bin/sh\ncmd=\"$1\"\nprintf '%s' \"$cmd\" >> \"{log}\"\nshift\nfor arg in \"$@\"; do printf ' <%s>' \"$arg\" >> \"{log}\"; done\nprintf '\\n' >> \"{log}\"\ncase \"$cmd\" in\n  has-session) exit 1 ;;\n  display-message)\n    case \"$*\" in\n      *window_id*) printf '@lease-window' ;;\n      *pane_id*)\n        n=0\n        [ -f \"{counter}\" ] && n=$(cat \"{counter}\")\n        n=$((n + 1))\n        printf '%s' \"$n\" > \"{counter}\"\n        printf '%%lease-pane-%s' \"$n\"\n        ;;\n    esac\n    exit 0\n    ;;\n  *) exit 0 ;;\nesac\n",
            log = tmux_log.display(),
            counter = tmux_counter.display()
        ),
    );
    let env = base_env
        .with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string())
        .with_env("EPI_AGENT_TERMINAL_BACKED", "1")
        .with_env("EPI_AGENT_TMUX_BIN", tmux_bin.display().to_string());

    let dispatch = run_epi(
        &[
            "--json",
            "agent",
            "team",
            "dispatch",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Inspect terminal authority",
            "--agent",
            "vak",
        ],
        &env,
    );
    assert!(
        dispatch.status.success(),
        "terminal team dispatch failed: {}",
        dispatch.stderr
    );
    let dispatch_value: Value = serde_json::from_str(&dispatch.stdout).expect("dispatch json");
    assert_eq!(dispatch_value["status"], "running");
    let projected_cmux_pane = dispatch_value["cmuxPaneId"]
        .as_str()
        .expect("projected cmux pane");
    let terminal_pane = dispatch_value["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("terminal pane");
    assert_ne!(
        projected_cmux_pane, terminal_pane,
        "cmux projection must not impersonate terminal process authority"
    );

    let log = read_to_string(&tmux_log);
    assert!(
        log.contains(&format!("send-keys <-t> <{terminal_pane}>")),
        "runtime command must target the leased terminal pane, log:\n{log}"
    );
    assert!(
        !log.contains(&format!("send-keys <-t> <{projected_cmux_pane}>")),
        "runtime command must not target a guessed cmux pane id, log:\n{log}"
    );

    let chain = run_epi(
        &[
            "--json",
            "agent",
            "chain",
            "run",
            "--parent-session",
            "agent:main:main",
            "--task",
            "Route through terminal workers",
            "--agent",
            "vak",
            "--agent",
            "nous",
        ],
        &env,
    );
    assert!(
        chain.status.success(),
        "terminal chain run failed: {}",
        chain.stderr
    );
    let chain_value: Value = serde_json::from_str(&chain.stdout).expect("chain json");
    assert_eq!(chain_value["status"], "running");
    let steps = chain_value["steps"].as_array().expect("chain steps");
    assert_eq!(steps.len(), 2);
    let first_pane = steps[0]["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("first terminal pane");
    let second_pane = steps[1]["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("second terminal pane");
    assert_ne!(
        first_pane, second_pane,
        "terminal-backed chain workers must receive distinct leases"
    );
}
