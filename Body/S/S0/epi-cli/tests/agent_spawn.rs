mod common;

use common::{create_plugin_bundle, read_to_string, run_epi, write_file, TestEnv};

#[test]
fn spawn_includes_epi_citta_extension() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18861");
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success(), "stderr: {}", out.stderr);
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(!argv.lines().any(|line| line == "spawn"));
    assert!(argv.lines().any(|line| line == "--no-extensions"));
    assert!(argv.contains("extensions/epi-citta.ts"));
}

#[test]
fn spawn_exports_selected_agent_dir_to_pi() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18862");
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success(), "stderr: {}", out.stderr);
    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("EPI_AGENT_NAME=anima"));
    assert!(captured_env.contains("PI_CODING_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_HOME="));
    assert!(captured_env.contains("EPI_AGENT_PROMPTS_DIR="));
    assert!(captured_env.contains("CODEX_HOME="));
    assert!(captured_env.contains("EPI_GATE_STATE_ROOT="));
    assert!(captured_env.contains("EPI_GATE_SKILLS_PATHS="));
    assert!(captured_env.contains(&format!(
        "PI_CODING_AGENT_DIR={}",
        env.repo_root.join(".epi/agents/anima/agent").display()
    )));
}

#[test]
fn run_forwards_real_pi_flags_without_legacy_run_subcommand() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18863");
    let out = run_epi(
        ["agent", "run", "--agent", "anima", "--", "-p", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success(), "stderr: {}", out.stderr);
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(!argv.lines().any(|line| line == "run"));
    assert!(argv.lines().any(|line| line == "-p"));
}

#[test]
fn spawn_indexes_explicit_plugin_dirs() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18864");
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

    assert!(out.status.success(), "stderr: {}", out.stderr);
    let runtime_path = env
        .repo_root
        .join(".epi/agents/anima/agent/plugin-runtime.json");
    assert!(runtime_path.exists());
    let runtime = read_to_string(&runtime_path);
    assert!(runtime.contains("\"name\": \"pleroma\""));
    assert!(runtime.contains(plugin.root.to_str().unwrap()));

    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("EPI_AGENT_PLUGIN_RUNTIME_PATH="));
    assert!(!env
        .repo_root
        .join(".epi/agents/anima/agent/plugins/cache/pleroma@0.1.0")
        .exists());
}

#[test]
fn spawn_auto_loads_repo_plugin_registry_entries() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18865");
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

    assert!(out.status.success(), "stderr: {}", out.stderr);
    let runtime_path = env
        .repo_root
        .join(".epi/agents/anima/agent/plugin-runtime.json");
    let runtime = read_to_string(runtime_path);
    assert!(runtime.contains("\"name\": \"claude-mem\""));
    assert!(runtime.contains(plugin.root.to_str().unwrap()));
}

#[test]
fn spawn_disables_ambient_skill_discovery_and_loads_repo_skill_roots() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18866");

    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(argv.lines().any(|line| line == "--no-skills"));
    assert!(argv.contains(env.repo_root.join("skills").to_str().unwrap()));
    assert!(argv.contains(
        env.repo_root
            .join("Body/S/S4/ta-onta/S4-4p-anima/S4'/skills")
            .to_str()
            .unwrap()
    ));
    assert!(argv.contains(
        env.repo_root
            .join("Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills")
            .to_str()
            .unwrap()
    ));
    assert!(argv.contains(
        env.repo_root
            .join("Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills")
            .to_str()
            .unwrap()
    ));
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

    assert!(
        out.stdout.contains("\"status\": \"ok\""),
        "stdout: {}",
        out.stdout
    );
    assert!(
        out.stdout.contains("\"eventLogPath\":"),
        "stdout: {}",
        out.stdout
    );
}

#[test]
fn chat_alias_uses_the_same_native_pi_launch_contract() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18867");

    let out = run_epi(
        ["agent", "chat", "--agent", "anima", "hello"].as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(!argv.lines().any(|line| line == "chat"));
    assert!(argv.lines().any(|line| line == "--no-extensions"));
    assert!(argv.contains("extensions/epi-citta.ts"));
}

#[test]
fn bare_agent_command_defaults_to_native_launch_contract_when_preflight_skipped() {
    let port = "18868";
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", port);
    let gate_root = env.repo_root.join(".epi/gate");

    let out = run_epi(["agent"].as_slice(), &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(!gate_root.join("up/gateway-process.json").exists());
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(argv.lines().any(|line| line == "--no-extensions"));
    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains(&format!("EPI_AGENT_GATEWAY_PORT={port}")));
}
