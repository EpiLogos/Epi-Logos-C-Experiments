mod common;

use chrono::{DateTime, Local, Utc};
use common::{read_to_string, run_epi, write_file, TestEnv};
use epi_logos::gate::sessions::SessionStore;

// Session ids and day folders are named after the LOCAL wall clock of the
// instant they were minted at — `vault::paths::local_stamp` (`%Y%m%d-%H%M%S`)
// and `vault::paths::DAY_ID_FORMAT` (`%m-%d-%Y`, month-first per CHARTER:28).
// Hardcoding a literal stamp bakes in both the author's timezone AND the DST
// offset that happened to be in force on that date: the `2026-03-10` case below
// used to "pass" purely because 10 March is outside BST, while the May cases
// failed by exactly one hour. So every expectation here is re-derived from the
// very `--now` value the command was handed. The two canonical format strings
// stay spelled out literally rather than being imported, so that a silent
// change to either law still fails a test instead of following it around.

fn instant(rfc3339: &str) -> DateTime<Utc> {
    DateTime::parse_from_rfc3339(rfc3339)
        .unwrap_or_else(|err| panic!("invalid test instant {rfc3339:?}: {err}"))
        .with_timezone(&Utc)
}

/// The local wall-clock stamp `epi` will name this instant with.
fn stamp_of(rfc3339: &str) -> String {
    instant(rfc3339)
        .with_timezone(&Local)
        .format("%Y%m%d-%H%M%S")
        .to_string()
}

fn session_id_of(rfc3339: &str, suffix: &str) -> String {
    format!("{}-{suffix}", stamp_of(rfc3339))
}

/// The month-first local day folder this instant belongs to.
fn day_id_of(rfc3339: &str) -> String {
    instant(rfc3339)
        .with_timezone(&Local)
        .format("%m-%d-%Y")
        .to_string()
}

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

    const NOW: &str = "2026-03-10T09:08:07Z";
    let session_id = session_id_of(NOW, "abc123");
    let day_id = day_id_of(NOW);

    let init = run_epi(
        [
            "agent",
            "session",
            "init",
            "--now",
            NOW,
            "--random-suffix",
            "abc123",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        init.stdout
            .contains(&format!("EPI_SESSION_ID={session_id}")),
        "init stdout missing EPI_SESSION_ID={session_id}:\n{}",
        init.stdout
    );
    assert!(
        init.stdout.contains(&format!("EPI_DAY_ID={day_id}")),
        "init stdout missing EPI_DAY_ID={day_id}:\n{}",
        init.stdout
    );
    assert!(init.stdout.contains("pre-hook"));

    let status = run_epi(["agent", "session", "status"].as_slice(), &env);
    assert!(
        status.stdout.contains(&session_id),
        "status stdout missing {session_id}:\n{}",
        status.stdout
    );
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
    assert!(
        continuation_body.contains(&session_id),
        "CONTINUATION.md missing {session_id}:\n{continuation_body}"
    );

    let close = run_epi(["agent", "session", "close"].as_slice(), &env);
    assert!(close.stdout.contains("post-hook"));
    assert!(
        close
            .stdout
            .contains(&format!("archived session {session_id}")),
        "close stdout missing archived session {session_id}:\n{}",
        close.stdout
    );
    assert!(close.stdout.contains("GATEWAY_SESSION_KEY=agent:epii:main"));
    let close_record = SessionStore::new(env.home.join(".epi/gate"))
        .unwrap()
        .resolve("agent:epii:main")
        .unwrap();
    assert!(close_record.diagnostics.iter().any(|diagnostic| {
        diagnostic["message"]
            .as_str()
            .unwrap_or_default()
            .contains("close_compact")
    }));
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

    const NEW_NOW: &str = "2026-05-08T10:00:00Z";
    const FORK_NOW: &str = "2026-05-08T10:15:00Z";
    let new_session_id = session_id_of(NEW_NOW, "new001");
    let fork_session_id = session_id_of(FORK_NOW, "fork01");

    let new_session = run_epi(
        [
            "agent",
            "session",
            "new",
            "--now",
            NEW_NOW,
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
            FORK_NOW,
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

    assert_eq!(new_record.session_id, new_session_id);
    assert_eq!(new_record.label.as_deref(), Some("Anima NEW session"));
    assert_eq!(new_record.active_agent_id, "anima");
    // Present is FLAT — `Empty/Present/{MM-DD-YYYY}/{session-id}/now.md`. The
    // shape stays literal here (a nested `{YYYY}/{MM}/W{n}/{DD}` regression is
    // the archive layout and must fail); only the day/session labels derive.
    let expected_now_path = format!(
        "/tmp/epilogos-test-vault-agent-lifecycle/Empty/Present/{}/{new_session_id}/now.md",
        day_id_of(NEW_NOW)
    );
    assert_eq!(
        new_record.vault_now_path.as_deref(),
        Some(expected_now_path.as_str())
    );

    assert_eq!(fork_record.session_id, fork_session_id);
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

#[test]
fn resume_and_import_commands_preserve_runtime_identity_and_lineage() {
    let env = TestEnv::repo_with_assets()
        .with_env(
            "EPILOGOS_VAULT",
            "/tmp/epilogos-test-vault-agent-resume-import",
        )
        .with_env("EPI_AGENT_ID", "anima");

    write_file(
        env.repo_root.join(".epi-logos.env"),
        "EPILOGOS_VAULT=/tmp/epilogos-test-vault-agent-resume-import\n",
    );

    const ROOT_NOW: &str = "2026-05-08T11:00:00Z";
    const RESUME_NOW: &str = "2026-05-08T11:15:00Z";
    const IMPORT_NOW: &str = "2026-05-08T11:30:00Z";
    let root_session_id = session_id_of(ROOT_NOW, "root01");
    let resumed_session_id = session_id_of(RESUME_NOW, "res001");
    let imported_session_id = session_id_of(IMPORT_NOW, "imp001");

    let new_session = run_epi(
        [
            "agent",
            "session",
            "new",
            "--now",
            ROOT_NOW,
            "--random-suffix",
            "root01",
            "--session-key",
            "agent:anima:resume-source",
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

    let resume_session = run_epi(
        [
            "agent",
            "session",
            "resume",
            "--source-session-key",
            "agent:anima:resume-source",
            "--target-session-key",
            "agent:anima:resume-target",
            "--now",
            RESUME_NOW,
            "--random-suffix",
            "res001",
            "--label",
            "Anima resumed execution",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        resume_session.status.success(),
        "resume failed:\nstdout:\n{}\nstderr:\n{}",
        resume_session.stdout,
        resume_session.stderr
    );

    let import_session = run_epi(
        [
            "agent",
            "session",
            "import",
            "--source-session-key",
            "codex:external:20260508",
            "--target-session-key",
            "agent:anima:imported-codex",
            "--now",
            IMPORT_NOW,
            "--random-suffix",
            "imp001",
            "--label",
            "Imported Codex run",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        import_session.status.success(),
        "import failed:\nstdout:\n{}\nstderr:\n{}",
        import_session.stdout,
        import_session.stderr
    );

    let store = SessionStore::new(env.home.join(".epi/gate")).unwrap();
    let source = store.resolve("agent:anima:resume-source").unwrap();
    let resumed = store.resolve("agent:anima:resume-target").unwrap();
    let imported = store.resolve("agent:anima:imported-codex").unwrap();

    assert_eq!(source.session_id, root_session_id);
    assert_eq!(resumed.session_id, resumed_session_id);
    assert_eq!(resumed.source_session_kind.as_deref(), Some("resume"));
    assert_eq!(
        resumed.source_session_key.as_deref(),
        Some("agent:anima:resume-source")
    );
    assert_eq!(resumed.active_agent_id, "anima");
    assert_eq!(
        resumed.runtime_cwd.as_deref(),
        Some(env.repo_root.to_str().unwrap())
    );
    assert_eq!(
        resumed.vault_root.as_deref(),
        Some("/tmp/epilogos-test-vault-agent-resume-import")
    );
    assert!(resumed
        .resource_loader_id
        .as_deref()
        .unwrap_or_default()
        .contains("agents/anima/agent/plugin-runtime.json"));
    assert!(resumed.diagnostics.iter().any(|diagnostic| {
        diagnostic["source"] == "khora.agent_session_runtime"
            && diagnostic["message"]
                .as_str()
                .unwrap_or_default()
                .contains("resume")
    }));

    assert_eq!(imported.session_id, imported_session_id);
    assert_eq!(imported.source_session_kind.as_deref(), Some("import"));
    assert_eq!(
        imported.source_session_key.as_deref(),
        Some("codex:external:20260508")
    );
    assert_eq!(imported.active_agent_id, "anima");
    assert_eq!(
        imported.runtime_cwd.as_deref(),
        Some(env.repo_root.to_str().unwrap())
    );
}

#[test]
fn epii_lifecycle_session_propagates_as_peer_pi_agent_identity() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPILOGOS_VAULT", "/tmp/epilogos-test-vault-agent-epii")
        .with_env("EPI_AGENT_ID", "epii");

    write_file(
        env.repo_root.join(".epi-logos.env"),
        "EPILOGOS_VAULT=/tmp/epilogos-test-vault-agent-epii\n",
    );

    const NOW: &str = "2026-05-12T11:00:00Z";
    let session_id = session_id_of(NOW, "epii01");

    let session = run_epi(
        [
            "agent",
            "session",
            "new",
            "--now",
            NOW,
            "--random-suffix",
            "epii01",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        session.status.success(),
        "session failed:\nstdout:\n{}\nstderr:\n{}",
        session.stdout,
        session.stderr
    );
    assert!(session
        .stdout
        .contains("GATEWAY_SESSION_KEY=agent:epii:main"));

    let record = SessionStore::new(env.home.join(".epi/gate"))
        .unwrap()
        .resolve("agent:epii:main")
        .unwrap();
    assert_eq!(record.active_agent_id, "epii");
    assert_eq!(record.session_id, session_id);
    assert!(record
        .resource_loader_id
        .as_deref()
        .unwrap_or_default()
        .contains("agents/epii/agent/plugin-runtime.json"));
}
