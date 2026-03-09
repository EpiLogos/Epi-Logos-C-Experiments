mod common;

use common::{create_plugin_bundle, read_to_string, run_epi, write_file, TestEnv};

#[test]
fn hooks_test_executes_matching_command_hook_with_json_fixture() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");
    let capture_path = env.root.join("hook-capture.json");
    let fixture_path = write_file(
        env.root.join("fixtures/pre_tool_use.json"),
        "{\n  \"tool\": \"Read\",\n  \"input\": {\"path\": \"docs/spec.md\"}\n}\n",
    );
    let env = env.with_env("HOOK_CAPTURE_PATH", capture_path.display().to_string());

    let out = run_epi(
        [
            "agent",
            "hooks",
            "test",
            "--event",
            "PreToolUse",
            "--fixture",
            fixture_path.to_str().unwrap(),
            plugin.hooks_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": true"));
    assert!(out.stdout.contains("\"decision\": \"allow\""));
    assert!(out.stdout.contains("\"continue\": true"));
    assert_eq!(read_to_string(&capture_path), read_to_string(&fixture_path));
}
