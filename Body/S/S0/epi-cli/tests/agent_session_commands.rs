mod common;

use common::{read_to_string, run_epi, write_file, TestEnv};
use epi_logos::gate::sessions::SessionStore;

#[test]
fn init_status_continuation_and_close_manage_session_state() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPILOGOS_VAULT", "/tmp/epilogos-test-vault-agent-session");

    write_file(
        env.repo_root.join(".epi-logos.env"),
        "EPILOGOS_VAULT=/tmp/epilogos-test-vault-agent-session\n",
    );
    write_file(env.repo_root.join("ANIMA.md"), "# ANIMA\n");
    write_file(env.repo_root.join("PARADIGM.md"), "# PARADIGM\n");
    write_file(env.repo_root.join("PASU.md"), "# PASU\n");
    write_file(env.repo_root.join("TOOLS.md"), "# TOOLS\n");
    write_file(
        env.repo_root
            .join("Body/S/S4/ta-onta/S4-0p-khora/S0/pre-session-init.sh"),
        "#!/bin/sh\nprintf 'pre-hook\\n'\n",
    );
    write_file(
        env.repo_root
            .join("Body/S/S4/ta-onta/S4-0p-khora/S0/post-session-close.sh"),
        "#!/bin/sh\nprintf 'post-hook\\n'\n",
    );

    let init = run_epi(
        [
            "agent",
            "session",
            "init",
            "--now",
            "2026-03-10T09:08:07Z",
            "--random-suffix",
            "abc123",
        ]
        .as_slice(),
        &env,
    );
    assert!(init
        .stdout
        .contains("EPI_SESSION_ID=20260310-090807-abc123"));
    assert!(init.stdout.contains("EPI_DAY_ID=10-03-2026"));
    assert!(init.stdout.contains("pre-hook"));

    let status = run_epi(["agent", "session", "status"].as_slice(), &env);
    assert!(status.stdout.contains("20260310-090807-abc123"));
    assert!(status.stdout.contains(
        "bootstrap: CONTINUATION.md -> ANIMA.md -> PARADIGM.md -> PASU -> NOW.md -> TOOLS.md"
    ));

    let continuation = run_epi(
        [
            "agent",
            "session",
            "continuation",
            "--summary",
            "resume from here",
        ]
        .as_slice(),
        &env,
    );
    assert!(continuation.stdout.contains("CONTINUATION.md"));
    let continuation_body = read_to_string(env.repo_root.join("CONTINUATION.md"));
    assert!(continuation_body.contains("resume from here"));
    assert!(continuation_body.contains("20260310-090807-abc123"));

    let close = run_epi(["agent", "session", "close"].as_slice(), &env);
    assert!(close.stdout.contains("post-hook"));
    assert!(close
        .stdout
        .contains("archived session 20260310-090807-abc123"));
}

#[test]
fn lifecycle_commands_create_runtime_backed_gateway_sessions() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPILOGOS_VAULT", "/tmp/epilogos-test-vault-agent-lifecycle")
        .with_env("EPI_AGENT_ID", "anima");

    write_file(
        env.repo_root.join(".epi-logos.env"),
        "EPILOGOS_VAULT=/tmp/epilogos-test-vault-agent-lifecycle\n",
    );

    let new_session = run_epi(
        [
            "agent",
            "session",
            "new",
            "--now",
            "2026-05-08T10:00:00Z",
            "--random-suffix",
            "new001",
            "--session-key",
            "agent:anima:new:one",
            "--label",
            "Anima NEW session",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        new_session.status.success(),
        "new failed:\nstdout:\n{}\nstderr:\n{}",
        new_session.stdout,
        new_session.stderr
    );
    assert!(new_session
        .stdout
        .contains("GATEWAY_SESSION_KEY=agent:anima:new:one"));

    let fork_session = run_epi(
        [
            "agent",
            "session",
            "fork",
            "--source-session-key",
            "agent:anima:new:one",
            "--target-session-key",
            "agent:anima:fork:one",
            "--label",
            "Anima forked execution",
            "--now",
            "2026-05-08T10:15:00Z",
            "--random-suffix",
            "fork01",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        fork_session.status.success(),
        "fork failed:\nstdout:\n{}\nstderr:\n{}",
        fork_session.stdout,
        fork_session.stderr
    );

    let store = SessionStore::new(env.home.join(".epi/gate")).unwrap();
    let new_record = store.resolve("agent:anima:new:one").unwrap();
    let fork_record = store.resolve("agent:anima:fork:one").unwrap();

    assert_eq!(new_record.session_id, "20260508-100000-new001");
    assert_eq!(new_record.label.as_deref(), Some("Anima NEW session"));
    assert_eq!(new_record.active_agent_id, "anima");
    assert_eq!(
        new_record.vault_now_path.as_deref(),
        Some("/tmp/epilogos-test-vault-agent-lifecycle/Empty/Present/08-05-2026/20260508-100000-new001/now.md")
    );

    assert_eq!(fork_record.session_id, "20260508-101500-fork01");
    assert_eq!(fork_record.label.as_deref(), Some("Anima forked execution"));
    assert_eq!(
        fork_record.source_session_key.as_deref(),
        Some("agent:anima:new:one")
    );
    assert_eq!(
        fork_record.parent_session_key.as_deref(),
        Some("agent:anima:new:one")
    );
    assert_eq!(fork_record.source_session_kind.as_deref(), Some("fork"));
    assert_eq!(fork_record.active_agent_id, "anima");
}
