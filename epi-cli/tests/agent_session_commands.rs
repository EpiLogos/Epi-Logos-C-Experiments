mod common;

use common::{read_to_string, run_epi, write_file, TestEnv};

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
    write_file(env.repo_root.join("MEMORY.md"), "# MEMORY\n");
    write_file(env.repo_root.join("TOOLS.md"), "# TOOLS\n");
    write_file(
        env.repo_root
            .join(".pi/extensions/ta-onta/khora/S0/pre-session-init.sh"),
        "#!/bin/sh\nprintf 'pre-hook\\n'\n",
    );
    write_file(
        env.repo_root
            .join(".pi/extensions/ta-onta/khora/S0/post-session-close.sh"),
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
