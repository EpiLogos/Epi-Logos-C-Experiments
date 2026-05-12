mod common;

use common::{
    create_plugin_bundle, read_to_string, run_epi, write_executable, write_file, TestEnv,
};

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
fn spawn_scopes_repo_plugins_and_skill_roots_by_pi_agent_identity() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18869");
    let pleroma = create_plugin_bundle(env.root.join("agent-bundles"), "pleroma");
    let epi_logos = create_plugin_bundle(env.root.join("agent-bundles"), "epi-logos");
    write_file(
        env.repo_root.join("Body/S/S4/plugins/registry.jsonl"),
        &format!(
            "{{\"name\":\"pleroma\",\"root\":\"{}\",\"agents\":[\"anima\"]}}\n",
            pleroma.root.display()
        ),
    );
    write_file(
        env.repo_root.join("Body/S/S5/plugins/registry.jsonl"),
        &format!(
            "{{\"name\":\"epi-logos\",\"root\":\"{}\",\"agents\":[\"epii\"]}}\n",
            epi_logos.root.display()
        ),
    );

    let anima = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(anima.status.success(), "stderr: {}", anima.stderr);
    let anima_runtime = read_to_string(
        env.repo_root
            .join(".epi/agents/anima/agent/plugin-runtime.json"),
    );
    assert!(anima_runtime.contains("\"name\": \"pleroma\""));
    assert!(!anima_runtime.contains("\"name\": \"epi-logos\""));

    let epii = run_epi(
        ["agent", "spawn", "--agent", "epii", "hello"].as_slice(),
        &env,
    );
    assert!(epii.status.success(), "stderr: {}", epii.stderr);
    let epii_runtime = read_to_string(
        env.repo_root
            .join(".epi/agents/epii/agent/plugin-runtime.json"),
    );
    assert!(epii_runtime.contains("\"name\": \"epi-logos\""));
    assert!(!epii_runtime.contains("\"name\": \"pleroma\""));

    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(
        argv.contains(epi_logos.root.join("skills").to_str().unwrap()),
        "Epii PI launch should receive epi-logos skills: {argv}"
    );
    assert!(
        !argv.contains("Body/S/S4/ta-onta/S4-4p-anima"),
        "Epii PI launch should not inherit Anima ta-onta skill roots: {argv}"
    );
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
    assert!(captured_env.contains("EPI_AGENT_ID=epii"));
    assert!(captured_env.contains("EPI_AGENT_NAME=epii"));
    assert!(captured_env.contains(".epi/agents/epii/agent"));
    assert!(captured_env.contains(&format!("EPI_AGENT_GATEWAY_PORT={port}")));
}

#[test]
fn direct_agent_embodiment_commands_and_roles_export_scoped_surface() {
    let env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18871");

    let out = run_epi(
        ["agent", "anima", "--role", "logos", "define this"].as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);
    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(argv.contains("define this"));
    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("EPI_AGENT_ID=anima"));
    assert!(captured_env.contains("EPI_AGENT_ROLE=logos"));
    assert!(captured_env.contains("EPI_AGENT_SCOPED_SURFACE=anima:logos"));
    assert!(captured_env.contains(".epi/agents/anima/agent"));

    let bad = run_epi(
        ["agent", "epii", "--role", "logos", "wrong surface"].as_slice(),
        &env,
    );
    assert!(!bad.status.success());
    assert!(bad.stderr.contains("unknown role `logos` for agent `epii`"));
}

#[test]
fn roster_lists_epii_anima_and_aletheia_scoped_surfaces() {
    let env = TestEnv::repo_with_assets();

    let out = run_epi(["--json", "agent", "roster", "list"].as_slice(), &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("\"agentId\": \"epii\""));
    assert!(out.stdout.contains("\"agentId\": \"anima\""));
    assert!(out.stdout.contains("\"agentId\": \"aletheia\""));
    assert!(out.stdout.contains("\"id\": \"logos\""));
    assert!(out.stdout.contains("\"id\": \"anansi\""));
    assert!(out.stdout.contains("\"id\": \"ql-cartographer\""));
}

#[test]
fn agent_tmux_surface_manages_khora_terminal_envelope_without_pi_session_identity() {
    let mut env = TestEnv::repo_with_assets();
    let tmux_log = env.root.join("tmux.log");
    let tmux_bin = write_executable(
        env.root.join("bin/tmux"),
        &format!(
            "#!/bin/sh\nprintf '%s %s\n' \"$1\" \"$*\" >> \"{}\"\ncase \"$1\" in\n  has-session) exit 1 ;;\n  *) exit 0 ;;\nesac\n",
            tmux_log.display()
        ),
    );
    env = env.with_env("EPI_AGENT_TMUX_BIN", tmux_bin.display().to_string());

    let up = run_epi(
        [
            "--json",
            "agent",
            "tmux",
            "up",
            "--name",
            "epi-test-khora",
            "--agent",
            "epii",
        ]
        .as_slice(),
        &env,
    );

    assert!(up.status.success(), "stderr: {}", up.stderr);
    assert!(up.stdout.contains("\"status\": \"running\""));
    assert!(up.stdout.contains("\"sessionName\": \"epi-test-khora\""));
    let log = read_to_string(tmux_log);
    assert!(log.contains("has-session has-session -t epi-test-khora"));
    assert!(log.contains("new-session new-session -d -s epi-test-khora"));
}

#[test]
fn persist_launch_routes_pi_plan_into_khora_tmux_envelope() {
    let mut env = TestEnv::with_fake_pi().with_env("EPI_AGENT_GATEWAY_PORT", "18872");
    let tmux_log = env.root.join("tmux-persist.log");
    let tmux_env = env.root.join("tmux-persist.env");
    let tmux_bin = write_executable(
        env.root.join("bin/tmux"),
        &format!(
            "#!/bin/sh\nenv | sort > \"{}\"\nprintf '%s %s\n' \"$1\" \"$*\" >> \"{}\"\ncase \"$1\" in\n  has-session) exit 1 ;;\n  *) exit 0 ;;\nesac\n",
            tmux_env.display(),
            tmux_log.display()
        ),
    );
    env = env.with_env("EPI_AGENT_TMUX_BIN", tmux_bin.display().to_string());

    let out = run_epi(
        [
            "--json",
            "agent",
            "anima",
            "--persist",
            "--role",
            "psyche",
            "hold state",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("\"status\": \"running\""));
    assert!(out.stdout.contains("\"agentId\": \"anima\""));
    assert!(!env.fake_pi_log.join("argv.txt").exists());
    let log = read_to_string(tmux_log);
    assert!(log.contains("new-session new-session -d"));
    let captured_env = read_to_string(tmux_env);
    assert!(captured_env.contains("EPI_AGENT_ID=anima"));
    assert!(captured_env.contains("EPI_AGENT_ROLE=psyche"));
    assert!(captured_env.contains("EPI_AGENT_SCOPED_SURFACE=anima:psyche"));
}
