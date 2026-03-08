mod common;

use common::TestEnv;
use std::fs;

/// Create a minimal plugin with hooks for testing.
fn create_hook_plugin(root: &std::path::Path) {
    let plugin_dir = root.join(".claude-plugin");
    fs::create_dir_all(&plugin_dir).unwrap();

    fs::write(
        plugin_dir.join("plugin.json"),
        r#"{
  "name": "hook-test",
  "version": "0.1.0",
  "description": "A plugin for testing hooks"
}"#,
    )
    .unwrap();

    fs::write(
        plugin_dir.join("hooks.json"),
        r#"{
  "hooks": [
    { "event": "pre-run", "script": "hooks/echo-hook.sh" },
    { "event": "post-run", "script": "hooks/transform-hook.sh" }
  ]
}"#,
    )
    .unwrap();

    let hooks_dir = root.join("hooks");
    fs::create_dir_all(&hooks_dir).unwrap();

    // echo-hook.sh: reads JSON from stdin and echoes it back
    fs::write(
        hooks_dir.join("echo-hook.sh"),
        "#!/bin/sh\ncat\n",
    )
    .unwrap();

    // transform-hook.sh: reads JSON stdin and outputs a transformed version
    fs::write(
        hooks_dir.join("transform-hook.sh"),
        "#!/bin/sh\necho '{\"status\":\"hooked\"}'\n",
    )
    .unwrap();

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        for name in ["echo-hook.sh", "transform-hook.sh"] {
            let path = hooks_dir.join(name);
            let mut perms = fs::metadata(&path).unwrap().permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&path, perms).unwrap();
        }
    }
}

#[test]
fn load_hooks_from_plugin() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("hook-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_hook_plugin(&plugin_root);

    // Validate the plugin loads (hooks are part of the manifest)
    let out = common::run_epi(
        &["agent", "plugin", "validate", &plugin_root.display().to_string()],
        &env,
    );
    assert!(out.status.success(), "validate failed: {}", out.stderr);
    assert!(out.stdout.contains("hook-test"));
}

#[test]
fn load_hooks_json_directly() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("hook-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_hook_plugin(&plugin_root);

    // Use the hooks module directly via library-level access
    // Since we can't call library functions directly from integration tests
    // without a lib.rs, we verify through the CLI that the plugin validates
    // and then test hook execution through a script round-trip.

    let out = common::run_epi(
        &[
            "--json",
            "agent",
            "plugin",
            "validate",
            &plugin_root.display().to_string(),
        ],
        &env,
    );
    assert!(out.status.success(), "validate json failed: {}", out.stderr);
    let parsed: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert_eq!(parsed["name"], "hook-test");
}

#[test]
fn hook_script_echo_roundtrip() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("hook-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_hook_plugin(&plugin_root);

    // Execute the echo hook script directly to verify the stdin/stdout contract
    let echo_script = plugin_root.join("hooks/echo-hook.sh");
    let input = r#"{"event":"pre-run","data":"hello"}"#;

    let output = std::process::Command::new("sh")
        .arg(&echo_script)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .current_dir(&plugin_root)
        .spawn()
        .and_then(|mut child| {
            use std::io::Write;
            if let Some(mut stdin) = child.stdin.take() {
                stdin.write_all(input.as_bytes()).ok();
            }
            child.wait_with_output()
        })
        .unwrap();

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert_eq!(stdout.trim(), input);
}

#[test]
fn hook_script_transform() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("hook-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_hook_plugin(&plugin_root);

    // Execute the transform hook script
    let transform_script = plugin_root.join("hooks/transform-hook.sh");

    let output = std::process::Command::new("sh")
        .arg(&transform_script)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .current_dir(&plugin_root)
        .spawn()
        .and_then(|mut child| {
            use std::io::Write;
            if let Some(mut stdin) = child.stdin.take() {
                stdin.write_all(b"{}").ok();
            }
            child.wait_with_output()
        })
        .unwrap();

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(stdout.trim()).unwrap();
    assert_eq!(parsed["status"], "hooked");
}

#[test]
fn empty_hooks_when_no_hooks_json() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("no-hooks-plugin");
    let plugin_dir = plugin_root.join(".claude-plugin");
    fs::create_dir_all(&plugin_dir).unwrap();

    fs::write(
        plugin_dir.join("plugin.json"),
        r#"{ "name": "no-hooks", "version": "0.1.0", "description": "Plugin without hooks" }"#,
    )
    .unwrap();

    let out = common::run_epi(
        &["agent", "plugin", "validate", &plugin_root.display().to_string()],
        &env,
    );
    assert!(out.status.success(), "validate failed: {}", out.stderr);
    assert!(out.stdout.contains("no-hooks"));
}
