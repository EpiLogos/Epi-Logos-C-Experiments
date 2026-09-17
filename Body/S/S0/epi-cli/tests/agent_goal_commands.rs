mod common;

use common::{read_to_string, run_epi, write_file, TestEnv};
use std::fs;

/// The goal-prelude filename is stamped with `vault::paths::local_stamp`, i.e.
/// the LOCAL wall clock. Deriving it here rather than freezing the UTC spelling
/// keeps the test honest in every timezone: `2026-05-18T12:34:56Z` is 13:34:56
/// in BST, so the frozen `...-123456.md` only ever passed under TZ=UTC.
fn local_stamp_of(rfc3339: &str) -> String {
    let instant = chrono::DateTime::parse_from_rfc3339(rfc3339)
        .expect("test instant parses")
        .with_timezone(&chrono::Utc);
    epi_logos::vault::paths::local_stamp(instant)
}

#[test]
fn goal_prelude_writes_now_bound_markdown_without_run_side_effects() {
    let env = TestEnv::repo_with_assets();
    let now_path = env
        .root
        .join("vault/Empty/Present/18-05-2026/20260518-120000-goal01/now.md");
    write_file(&now_path, "# NOW\n");
    let env = env.with_env("EPI_NOW_PATH", now_path.display().to_string());

    let output = run_epi(
        [
            "agent",
            "goal",
            "prelude",
            "Clean up the VAK goal surface without scheduling cron yet",
            "--created-at",
            "2026-05-18T12:34:56Z",
        ]
        .as_slice(),
        &env,
    );

    assert!(
        output.status.success(),
        "goal prelude failed:\nstdout:\n{}\nstderr:\n{}",
        output.stdout,
        output.stderr
    );
    assert!(output.stdout.contains("GOAL_PRELUDE_PATH="));
    assert!(output
        .stdout
        .contains("EPI_SESSION_ID=20260518-120000-goal01"));
    assert!(output.stdout.contains("EPI_DAY_ID=18-05-2026"));

    let prelude_path = env.root.join(format!(
        "vault/Empty/Present/18-05-2026/20260518-120000-goal01/goals/goal-prelude-{}.md",
        local_stamp_of("2026-05-18T12:34:56Z")
    ));
    let body = read_to_string(&prelude_path);
    assert!(body.contains("c_4_artifact_role: \"goal-prelude\""));
    assert!(body.contains("c_4_cpf: \"(00/00)\""));
    assert!(body.contains("c_4_cf: \"(0000)\""));
    assert!(body.contains("Chronos may schedule only a confirmed `GoalSpec`"));
    assert!(!body.contains("c_4_artifact_role: \"goal-run\""));

    let goals = fs::read_dir(prelude_path.parent().unwrap())
        .unwrap()
        .count();
    assert_eq!(goals, 1);
}

#[test]
fn goal_prelude_rejects_over_limit_raw_goal_text() {
    let env = TestEnv::repo_with_assets();
    let now_path = env
        .root
        .join("vault/Empty/Present/18-05-2026/20260518-130000-goal02/now.md");
    write_file(&now_path, "# NOW\n");
    let env = env.with_env("EPI_NOW_PATH", now_path.display().to_string());
    let too_long = "x".repeat(4_001);

    let output = run_epi(
        [
            "agent",
            "goal",
            "prelude",
            too_long.as_str(),
            "--created-at",
            "2026-05-18T13:00:00Z",
        ]
        .as_slice(),
        &env,
    );

    assert!(!output.status.success());
    assert!(output.stderr.contains("limit is 4000"));
    assert!(!fs::exists(now_path.parent().unwrap().join("goals")).unwrap());
}
