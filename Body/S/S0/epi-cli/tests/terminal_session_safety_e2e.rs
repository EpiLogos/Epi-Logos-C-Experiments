mod common;

use common::{read_to_string, run_epi, write_executable, TestEnv};
use epi_logos::gate::{
    sessions::{SessionPatch, SessionStore},
    spacetimedb_bridge::SpacetimeBridge,
    temporal, transcripts,
};
use epi_logos::portal::runtime_state::{PortalRuntimeState, PortalTemporalSource};
use epi_s3_gateway_contract::{
    TerminalBinding, TerminalCaptureMode, TerminalCapturePolicy, TerminalLease, TerminalStatus,
};
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::{Duration, Instant};

const RAW_TERMINAL_BODY_SENTINEL: &str = "RAW_TERMINAL_BODY_DO_NOT_PROJECT_12_T12_08";

#[test]
fn terminal_session_safety_command_contract_uses_session_scoped_tmux_surfaces() {
    let base_env = TestEnv::with_fake_pi();
    let gate_root = base_env.repo_root.join(".epi").join("gate");
    let tmux_log = base_env.root.join("tmux-command-contract.log");
    let tmux_bin = write_executable(
        base_env.root.join("bin/tmux"),
        &format!(
            "#!/bin/sh\ncmd=\"$1\"\nprintf '%s' \"$cmd\" >> \"{log}\"\nshift\nfor arg in \"$@\"; do printf ' <%s>' \"$arg\" >> \"{log}\"; done\nprintf '\\n' >> \"{log}\"\ncase \"$cmd\" in\n  has-session) exit 1 ;;\n  display-message)\n    case \"$*\" in\n      *window_id*) printf '@terminal-window' ;;\n      *pane_id*) printf '%%terminal-pane' ;;\n    esac\n    exit 0\n    ;;\n  *) exit 0 ;;\nesac\n",
            log = tmux_log.display()
        ),
    );
    let env = base_env
        .with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string())
        .with_env("EPI_AGENT_TMUX_BIN", tmux_bin.display().to_string());

    let launched = run_epi(
        &[
            "--json",
            "agent",
            "anima",
            "--persist",
            "--role",
            "psyche",
            "terminal_session_safety command construction",
        ],
        &env,
    );
    assert!(
        launched.status.success(),
        "persist launch failed:\nstdout:\n{}\nstderr:\n{}",
        launched.stdout,
        launched.stderr
    );
    let report: Value = serde_json::from_str(&launched.stdout).expect("persist report json");
    assert_eq!(report["sessionKey"], "agent:anima:psyche");
    assert_eq!(
        report["terminalBinding"]["tmuxPaneId"],
        "%terminal-pane",
        "fake tmux is only accepted for command-shape assertions"
    );

    let log = read_to_string(&tmux_log);
    assert!(
        log.contains("new-session <-d> <-s> <epi-khora-repo-anima>"),
        "persist launch must create a named tmux session, log:\n{log}"
    );
    assert!(
        log.contains("set-environment <-t> <epi-khora-repo-anima> <EPI_GATE_SESSION_KEY> <agent:anima:psyche>"),
        "terminal launch must bind the gateway session key into tmux env, log:\n{log}"
    );
    assert!(
        log.contains("send-keys <-t> <%terminal-pane> <-l> <-->")
            && log.contains("/bin/pi>"),
        "runtime command must be injected literally, log:\n{log}"
    );
    assert!(
        log.contains("send-keys <-t> <%terminal-pane> <Enter>"),
        "runtime command must be submitted to the pane, log:\n{log}"
    );

    let terminal_tools = read_to_string(repo_file(
        "../../S4/ta-onta/S4-2p-pleroma/S2/terminal-tools.ts",
    ));
    let extension = read_to_string(repo_file("../../S4/ta-onta/S4-2p-pleroma/extension.ts"));
    assert!(
        terminal_tools.contains(
            r#"["agent", "tmux", def.subcommand, "--session-key", sessionKey]"#
        ),
        "Techne terminal tools must route through epi agent tmux with session_key"
    );
    assert!(
        terminal_tools.contains(r#"argv.push("--lease-id", lease)"#),
        "Techne send must require an explicit terminal lease"
    );
    assert!(
        terminal_tools.contains(r#"argv.push("--lines", String(n))"#),
        "Techne capture must construct a bounded line window"
    );
    assert!(
        !extension.contains("tmux send-keys") && !extension.contains("gate teams patch"),
        "Techne must not expose stale raw tmux/cmux authority paths"
    );
}

#[test]
fn redaction_contract_keeps_terminal_body_out_of_global_projection_and_redis_payload() {
    let base_env = TestEnv::empty();
    let vault = base_env.repo_root.join("Idea");
    let gate_root = base_env.home.join(".epi").join("gate");
    let env = base_env
        .with_env("EPILOGOS_VAULT", vault.display().to_string())
        .with_env("EPI_GATE_SESSION_REDIS_HYDRATION", "best-effort")
        .with_env("EPI_INSTALLATION_ID", "install-terminal-safety")
        .with_env("EPI_GATEWAY_ID", "gateway-terminal-safety");
    let _guard = env.apply_to_process();

    let now_path = write_now_file(&vault, "07-05-2026", "session-terminal-safety");
    let store = SessionStore::new(&gate_root).expect("session store");
    let record = store.create("agent:anima:psyche").expect("parent session");
    store
        .patch(
            &record.canonical_key,
            SessionPatch {
                aliases: Some(vec!["NOW-07-05-2026-terminal-safety".to_owned()]),
                vault_now_path: Some(Some(now_path.display().to_string())),
                active_agent_id: Some("anima".to_owned()),
                runtime_cwd: Some(Some(env.repo_root.display().to_string())),
                terminal_binding: Some(Some(TerminalBinding {
                    terminal_identifier: Some(
                        "tmux:epi-khora-repo-anima:%terminal-redacted".to_owned(),
                    ),
                    session_anchor: Some("epi-khora-repo-anima".to_owned()),
                    tmux_pane_id: Some("%terminal-redacted".to_owned()),
                    attached_session_key: Some("agent:anima:psyche".to_owned()),
                    terminal_status: Some(TerminalStatus::Attached),
                    lease: Some(TerminalLease {
                        lease_owner: Some("pi.anima".to_owned()),
                        lease_purpose: Some("interactive-session".to_owned()),
                        lease_expires_at_ms: Some(1_785_000_000_000),
                    }),
                    capture_policy: Some(TerminalCapturePolicy {
                        mode: TerminalCaptureMode::Stream,
                        max_lines: Some(40),
                        redaction_policy: Some("terminal-session-safety-redaction".to_owned()),
                    }),
                })),
                ..Default::default()
            },
        )
        .expect("patch terminal parent");
    transcripts::append_message(
        &gate_root,
        "agent:anima:psyche",
        "assistant",
        RAW_TERMINAL_BODY_SENTINEL,
        None,
    )
    .expect("real transcript append");

    let parent = store
        .resolve("agent:anima:psyche")
        .expect("parent resolves after patch");
    let hydrated = temporal::hydrate_redis_for_record_on_propagation(&gate_root, &parent, "anima")
        .expect("best-effort Redis hydration must not fail when Redis is absent")
        .expect("best-effort hydration returns the temporal context");
    assert_terminal_context_is_redacted(&hydrated);
    assert!(
        hydrated
            .pointer("/redis/terminalMetadataHydrated")
            .and_then(Value::as_bool)
            .unwrap_or(false)
            || hydrated.pointer("/redis/hydrationError").is_some(),
        "best-effort Redis mode must either hydrate real Redis or report the skipped live Redis path"
    );

    let redis_payload = temporal::terminal_redis_payload_from_context(&hydrated)
        .expect("terminal metadata should have a Redis payload");
    assert_eq!(redis_payload["rawPaneBodyStored"], false);
    assert!(
        !redis_payload.to_string().contains(RAW_TERMINAL_BODY_SENTINEL),
        "Redis metadata payload must not contain raw terminal body"
    );

    let bridge = SpacetimeBridge::new(&gate_root).expect("spacetimedb test bridge");
    bridge
        .publish_session_record(&parent, Some("NOW-07-05-2026-terminal-safety"), Some(&hydrated))
        .expect("publish session surface to test bridge");
    let events = bridge.drain_test_events().expect("drain bridge events");
    let session_surface = events
        .iter()
        .find(|event| event.kind == "session_surface")
        .expect("session surface event");
    let global_surface = events
        .iter()
        .find(|event| event.kind == "global_temporal_surface")
        .expect("global temporal surface event");
    assert_eq!(
        session_surface.payload["terminalBinding"]["capturePolicy"]["redactionPolicy"],
        "configured"
    );
    assert_eq!(
        session_surface.payload["terminalBinding"]["rawPaneBodyIncluded"],
        false
    );
    assert_eq!(global_surface.payload["terminal"]["rawPaneBodyIncluded"], false);
    assert!(
        global_surface.payload["terminal"].get("tmuxPaneId").is_none(),
        "global projection must not publish direct pane authority"
    );
    assert!(
        !events_as_string(&events).contains(RAW_TERMINAL_BODY_SENTINEL),
        "SpaceTimeDB test bridge projections must not include raw terminal body"
    );

    let runtime =
        PortalRuntimeState::from_gateway_context_value(hydrated).expect("portal temporal surface");
    let temporal = runtime.temporal();
    let temporal = temporal.lock().expect("portal temporal lock");
    assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
    assert!(temporal.terminal_backed);
    assert_eq!(temporal.terminal_provider.as_deref(), Some("tmux"));
    assert_eq!(
        temporal.terminal_capture_policy_mode.as_deref(),
        Some("stream")
    );
    assert_eq!(
        temporal.terminal_metadata_key.as_deref(),
        Some("cache:hot:s3:gateway:temporal:session:session-terminal-safety:terminal:metadata")
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn session_valid_after_worker_abort_live_tmux_or_explicit_skip() {
    let Some(tmux_bin) = resolve_tmux() else {
        eprintln!(
            "skipping live terminal_session_safety integration: tmux is not installed; contract redaction tests still run"
        );
        return;
    };
    if !tmux_is_usable(&tmux_bin) {
        eprintln!(
            "skipping live terminal_session_safety integration: tmux is installed but unavailable; contract redaction tests still run"
        );
        return;
    }

    let base_env = TestEnv::with_fake_pi();
    let vault = base_env.repo_root.join("Idea");
    let gate_root = base_env.repo_root.join(".epi").join("gate");
    let env = base_env
        .with_env("EPILOGOS_VAULT", vault.display().to_string())
        .with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string())
        .with_env("EPI_AGENT_TERMINAL_BACKED", "1")
        .with_env("EPI_GATE_SESSION_REDIS_HYDRATION", "best-effort")
        .with_env("EPI_INSTALLATION_ID", "install-live-terminal-safety")
        .with_env("EPI_GATEWAY_ID", "gateway-live-terminal-safety");
    let _guard = env.apply_to_process();
    let _server =
        epi_logos::gate::server::spawn_test_server_with_state_root(gate_root.clone(), 19_087)
            .await
            .expect("start gateway test server");

    kill_tmux_session(&tmux_bin, "epi-khora-repo-anima");
    kill_tmux_session(&tmux_bin, "epi-khora-repo-vak");

    let init = run_epi(
        &[
            "agent",
            "session",
            "init",
            "--now",
            "2026-05-07T09:00:00Z",
            "--random-suffix",
            "terminal-safety",
        ],
        &env,
    );
    assert!(
        init.status.success(),
        "NOW-bound session init failed:\nstdout:\n{}\nstderr:\n{}",
        init.stdout,
        init.stderr
    );
    let now_path = parse_line_value(&init.stdout, "EPI_NOW_PATH=")
        .map(PathBuf::from)
        .expect("session init reports NOW path");
    assert!(now_path.exists(), "NOW path should exist: {}", now_path.display());

    let parent_launch = run_epi(
        &[
            "--json",
            "agent",
            "anima",
            "--persist",
            "--role",
            "psyche",
            "terminal_session_safety parent live",
        ],
        &env,
    );
    assert!(
        parent_launch.status.success(),
        "parent persist failed:\nstdout:\n{}\nstderr:\n{}",
        parent_launch.stdout,
        parent_launch.stderr
    );
    let parent_report: Value =
        serde_json::from_str(&parent_launch.stdout).expect("parent report json");
    let parent_session_key = parent_report["sessionKey"]
        .as_str()
        .expect("parent session key")
        .to_owned();
    let parent_pane = parent_report["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("parent pane")
        .to_owned();
    let parent_tmux_session = parent_report["terminalBinding"]["tmuxSessionName"]
        .as_str()
        .expect("parent tmux session")
        .to_owned();
    let parent_capture = wait_for_capture(
        &tmux_bin,
        &parent_pane,
        "assistant: terminal_session_safety parent live",
    );
    assert!(
        parent_capture.contains("assistant: terminal_session_safety parent live"),
        "bounded parent capture did not include fake pi output:\n{parent_capture}"
    );

    let store = SessionStore::new(&gate_root).expect("session store");
    store
        .patch(
            &parent_session_key,
            SessionPatch {
                aliases: Some(vec!["NOW-07-05-2026-terminal-safety-live".to_owned()]),
                vault_now_path: Some(Some(now_path.display().to_string())),
                active_agent_id: Some("anima".to_owned()),
                ..Default::default()
            },
        )
        .expect("bind parent to NOW");

    let worker = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "run",
            "--agent",
            "vak",
            "--parent-session",
            &parent_session_key,
            "--task",
            "terminal_session_safety worker live",
        ],
        &env,
    );
    assert!(
        worker.status.success(),
        "terminal-backed worker dispatch failed:\nstdout:\n{}\nstderr:\n{}",
        worker.stdout,
        worker.stderr
    );
    let worker_report: Value = serde_json::from_str(&worker.stdout).expect("worker report json");
    assert_eq!(worker_report["status"], "running");
    let worker_session_key = worker_report["sessionKey"]
        .as_str()
        .expect("worker session key");
    assert_eq!(
        worker_report["terminalBinding"]["attachedSessionKey"],
        worker_session_key
    );
    let worker_pane = worker_report["terminalBinding"]["tmuxPaneId"]
        .as_str()
        .expect("worker pane");
    let worker_capture = wait_for_capture(
        &tmux_bin,
        worker_pane,
        "assistant: terminal_session_safety worker live",
    );
    assert!(
        worker_capture.contains("assistant: terminal_session_safety worker live"),
        "bounded worker capture did not include fake pi output:\n{worker_capture}"
    );

    let parent = store
        .resolve(&parent_session_key)
        .expect("parent valid before worker abort");
    let hydrated = temporal::hydrate_redis_for_record_on_propagation(&gate_root, &parent, "anima")
        .expect("best-effort Redis hydration after live launch")
        .expect("best-effort hydration returns context");
    assert_terminal_context_is_redacted(&hydrated);
    let bridge = SpacetimeBridge::new(&gate_root).expect("spacetimedb test bridge");
    bridge
        .publish_session_record(&parent, Some("NOW-07-05-2026-terminal-safety-live"), Some(&hydrated))
        .expect("publish parent session surface");
    let events = bridge.drain_test_events().expect("bridge events");
    assert!(
        events.iter().any(|event| event.kind == "global_temporal_surface"
            && event.payload["terminal"]["rawPaneBodyIncluded"] == false),
        "global temporal surface must publish redacted terminal metadata"
    );
    let runtime =
        PortalRuntimeState::from_gateway_context_value(hydrated).expect("portal temporal surface");
    assert!(runtime.temporal().lock().unwrap().terminal_backed);

    let stop = run_epi(
        &[
            "--json",
            "agent",
            "subagent",
            "stop",
            "--session-key",
            worker_session_key,
        ],
        &env,
    );
    assert!(
        stop.status.success(),
        "worker abort failed:\nstdout:\n{}\nstderr:\n{}",
        stop.stdout,
        stop.stderr
    );
    let stop_report: Value = serde_json::from_str(&stop.stdout).expect("stop report json");
    assert_eq!(stop_report["stopMode"], "terminal");
    assert_eq!(
        stop_report["terminalBinding"]["terminalStatus"],
        "detached",
        "worker abort should detach the worker terminal binding"
    );

    let parent_after_abort = store
        .resolve(&parent_session_key)
        .expect("parent session_valid_after_worker_abort resolves");
    assert_eq!(parent_after_abort.canonical_key, parent_session_key);
    assert!(
        parent_after_abort.terminal_binding.is_some(),
        "parent terminal binding must remain valid after worker abort"
    );
    assert!(
        tmux_has_session(&tmux_bin, &parent_tmux_session),
        "parent tmux session must remain alive after worker abort"
    );

    kill_tmux_session(&tmux_bin, &parent_tmux_session);
    kill_tmux_session(&tmux_bin, "epi-khora-repo-vak");
}

fn assert_terminal_context_is_redacted(value: &Value) {
    assert_eq!(value["terminal"]["terminalBacked"], true);
    assert_eq!(value["terminal"]["provider"], "tmux");
    assert_eq!(value["terminal"]["rawPaneBodyIncluded"], false);
    assert!(
        matches!(
            value["terminal"]["capturePolicy"]["redactionPolicy"].as_str(),
            Some("configured" | "metadata-only")
        ),
        "terminal capture must be explicitly redacted or metadata-only by default"
    );
    assert!(
        !value.to_string().contains(RAW_TERMINAL_BODY_SENTINEL),
        "temporal context must not include raw terminal body"
    );
}

fn write_now_file(vault: &Path, day_id: &str, session_id: &str) -> PathBuf {
    let now_path = vault
        .join("Empty")
        .join("Present")
        .join(day_id)
        .join(session_id)
        .join("now.md");
    if let Some(parent) = now_path.parent() {
        std::fs::create_dir_all(parent).expect("NOW parent");
    }
    std::fs::write(
        &now_path,
        format!(
            "---\nsession_id: \"{session_id}\"\nday_id: \"{day_id}\"\n---\n\n# NOW\n\nterminal_session_safety acceptance harness.\n"
        ),
    )
    .expect("write NOW");
    now_path
}

fn repo_file(relative_from_manifest: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(relative_from_manifest)
}

fn events_as_string<T: serde::Serialize>(events: &T) -> String {
    serde_json::to_string(events).expect("events json")
}

fn parse_line_value<'a>(body: &'a str, prefix: &str) -> Option<&'a str> {
    body.lines().find_map(|line| line.strip_prefix(prefix))
}

fn wait_for_capture(tmux_bin: &str, pane_id: &str, needle: &str) -> String {
    let deadline = Instant::now() + Duration::from_secs(6);
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
    let session_name = format!("epi-terminal-safety-probe-{}", std::process::id());
    let started = Command::new(tmux_bin)
        .args(["new-session", "-d", "-s", &session_name])
        .status()
        .map(|status| status.success())
        .unwrap_or(false);
    if started {
        kill_tmux_session(tmux_bin, &session_name);
    }
    started
}

fn tmux_has_session(tmux_bin: &str, session_name: &str) -> bool {
    Command::new(tmux_bin)
        .args(["has-session", "-t", session_name])
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

fn kill_tmux_session(tmux_bin: &str, session_name: &str) {
    let _ = Command::new(tmux_bin)
        .args(["kill-session", "-t", session_name])
        .status();
}
