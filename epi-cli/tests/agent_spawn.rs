mod common;

use common::{create_plugin_bundle, read_to_string, run_epi, write_file, TestEnv};

#[test]
fn spawn_includes_epi_citta_extension() {
    let env = TestEnv::with_fake_pi();
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(!argv.lines().any(|line| line == "spawn"));
    assert!(argv.lines().any(|line| line == "--no-extensions"));
    assert!(argv.contains("extensions/epi-citta.ts"));
}

#[test]
fn spawn_exports_selected_agent_dir_to_pi() {
    let env = TestEnv::with_fake_pi();
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("PI_CODING_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_PROMPTS_DIR="));
}

#[test]
fn run_forwards_real_pi_flags_without_legacy_run_subcommand() {
    let env = TestEnv::with_fake_pi();
    let out = run_epi(
        ["agent", "run", "--agent", "anima", "--", "-p", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(!argv.lines().any(|line| line == "run"));
    assert!(argv.lines().any(|line| line == "-p"));
}

#[test]
fn spawn_indexes_explicit_plugin_dirs() {
    let env = TestEnv::with_fake_pi();
    let plugin = create_plugin_bundle(env.root.join("dev-plugins"), "pleroma");

    let out = run_epi(
        [
            "agent",
            "spawn",
            "--agent",
            "anima",
            "--plugin-dir",
            plugin.root.to_str().unwrap(),
            "hello",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.status.success());
    let runtime_path = env.home.join(".epi/agents/anima/agent/plugin-runtime.json");
    assert!(runtime_path.exists());
    let runtime = read_to_string(&runtime_path);
    assert!(runtime.contains("\"name\": \"pleroma\""));
    assert!(runtime.contains(plugin.root.to_str().unwrap()));

    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("EPI_AGENT_PLUGIN_RUNTIME_PATH="));
    assert!(!env
        .home
        .join(".epi/agents/anima/agent/plugins/cache/pleroma@0.1.0")
        .exists());
}

#[test]
fn spawn_auto_loads_repo_plugin_registry_entries() {
    let env = TestEnv::with_fake_pi();
    let plugin = create_plugin_bundle(env.root.join("vendor-bundles"), "claude-mem");
    write_file(
        env.repo_root.join("plugins/registry.jsonl"),
        &format!(
            "{{\"name\":\"claude-mem\",\"root\":\"{}\"}}\n",
            plugin.root.display()
        ),
    );

    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );

    assert!(out.status.success());
    let runtime_path = env.home.join(".epi/agents/anima/agent/plugin-runtime.json");
    let runtime = read_to_string(runtime_path);
    assert!(runtime.contains("\"name\": \"claude-mem\""));
    assert!(runtime.contains(plugin.root.to_str().unwrap()));
}

#[test]
fn verify_runtime_uses_minimal_pi_discovery_flags() {
    let env = TestEnv::with_fake_pi();
    let plugin = create_plugin_bundle(env.root.join("vendor-bundles"), "claude-mem");

    let out = run_epi(
        [
            "--json",
            "agent",
            "verify-runtime",
            "--agent",
            "anima",
            "--plugin-dir",
            plugin.root.to_str().unwrap(),
            "--prompt",
            "probe runtime",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);

    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(argv.lines().any(|line| line == "-p"));
    assert!(argv.lines().any(|line| line == "--no-extensions"));
    assert!(argv.lines().any(|line| line == "--no-skills"));
    assert!(argv.lines().any(|line| line == "--no-prompt-templates"));
    assert!(argv.lines().any(|line| line == "--no-themes"));
    assert!(argv.lines().any(|line| line == "probe runtime"));

    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("HOME="));
    assert!(captured_env.contains("EPI_AGENT_HOME="));
    assert!(captured_env.contains("EPI_AGENT_PLUGIN_RUNTIME_PATH="));

    assert!(out.stdout.contains("\"status\": \"ok\""), "stdout: {}", out.stdout);
    assert!(
        out.stdout.contains("\"eventLogPath\":"),
        "stdout: {}",
        out.stdout
    );
}
