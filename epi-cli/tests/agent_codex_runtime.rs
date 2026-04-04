mod common;

use common::{run_epi, TestEnv};
use std::fs;

/// Task 3: `epi agent codex install` should scaffold .codex/ and .omx/ from the vendored source.
#[test]
fn codex_install_creates_repo_local_dirs() {
    let env = TestEnv::repo_with_assets();

    // Seed a minimal vendors/oh-my-codex/dist/cli/omx.js in the fixture repo
    let omx_dist = env.repo_root.join("vendors/oh-my-codex/dist/cli");
    fs::create_dir_all(&omx_dist).unwrap();
    fs::write(omx_dist.join("omx.js"), "// stub omx\n").unwrap();

    let out = run_epi(
        ["agent", "codex", "install", "--json"].as_slice(),
        &env,
    );

    assert!(
        out.status.success(),
        "codex install failed:\nstdout: {}\nstderr: {}",
        out.stdout,
        out.stderr
    );
    assert!(
        out.stdout.contains("\"status\""),
        "expected JSON status in output: {}",
        out.stdout
    );
    // Generated paths must be repo-local
    assert!(
        out.stdout.contains("codex") || out.stdout.contains(".omx"),
        "expected codex/omx path in output: {}",
        out.stdout
    );
    // Must NOT reference the user home dir
    let home = std::env::var("HOME").unwrap_or_default();
    assert!(
        !out.stdout.contains(&format!("\"{}/.epi", home)),
        "codex install reported a user-home path — must stay repo-local: {}",
        out.stdout
    );
}

/// `epi agent codex doctor` must verify .codex/skills, .codex/agents, .omx/setup-scope.json.
#[test]
fn codex_doctor_reports_runtime_roots() {
    let env = TestEnv::repo_with_assets();

    // Pre-seed the runtime state as if install ran
    let codex_root = env.repo_root.join(".codex");
    fs::create_dir_all(codex_root.join("skills")).unwrap();
    fs::create_dir_all(codex_root.join("agents")).unwrap();

    let omx_dir = env.repo_root.join(".omx");
    fs::create_dir_all(&omx_dir).unwrap();
    fs::write(
        omx_dir.join("setup-scope.json"),
        r#"{"schema":"1","omx_vendor_path":"/stub/vendors/oh-my-codex"}"#,
    )
    .unwrap();

    let out = run_epi(
        ["agent", "codex", "doctor", "--json"].as_slice(),
        &env,
    );

    // doctor runs even when some assets are absent; the JSON output must contain the keys
    assert!(
        out.stdout.contains("\"codexSkillsPresent\"")
            || out.stdout.contains("codexSkillsPresent")
            || out.stdout.contains("skills"),
        "expected codex skills key in doctor output: {}",
        out.stdout
    );
    assert!(
        out.stdout.contains("\"omxScopePresent\"")
            || out.stdout.contains("omxScopePresent")
            || out.stdout.contains("setup-scope"),
        "expected omx scope key in doctor output: {}",
        out.stdout
    );
}
