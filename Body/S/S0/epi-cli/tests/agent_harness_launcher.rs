use epi_logos::agent::harness::{self, CodeHarnessProfile, HarnessId, HarnessProfile};

#[test]
fn unified_launcher_profiles_prepare_expected_commands_without_spawning() {
    let native =
        harness::prepare_blocking_command(&HarnessProfile::ClaudeNative(CodeHarnessProfile {
            profile: None,
            args: vec!["--dangerously-skip-permissions".to_owned()],
        }))
        .expect("native claude profile should prepare");
    assert_eq!(native.harness_id, HarnessId::ClaudeNative);
    assert_eq!(native.program, "claude");
    assert_eq!(native.args, vec!["--dangerously-skip-permissions"]);

    let profiled =
        harness::prepare_blocking_command(&HarnessProfile::ClaudeNative(CodeHarnessProfile {
            profile: Some("kimi-coding.conf".to_owned()),
            args: vec!["hello world".to_owned()],
        }))
        .expect("profiled claude profile should prepare");
    assert_eq!(profiled.program, "bash");
    assert_eq!(profiled.args[0], "-c");
    assert!(profiled.args[1].contains("source ~/.claude/api-keys.env"));
    assert!(profiled.args[1].contains("source ~/.claude/profiles/kimi-coding.conf"));
    assert!(profiled.args[1].contains("exec claude 'hello world'"));

    let acp = harness::prepare_blocking_command(&HarnessProfile::HermesAcp {
        socket_path: "/tmp/hermes.sock".into(),
    })
    .expect_err("ACP harnesses should not prepare a tmux/std command");
    assert!(acp.contains("ACP socket"));
}

#[test]
fn epi_code_routes_claude_launches_through_agent_harness() {
    let crate_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let code_mod =
        std::fs::read_to_string(crate_root.join("src/code/mod.rs")).expect("read code module");

    assert!(
        code_mod.contains("agent::harness"),
        "epi code must route through the unified agent harness launcher"
    );
    assert!(
        !code_mod.contains("Command::new(\"claude\")"),
        "epi code must not spawn claude directly"
    );
}
