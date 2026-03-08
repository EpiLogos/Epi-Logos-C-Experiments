mod common;

use common::TestEnv;
use std::fs;

/// Create a realistic plugin bundle under the given directory.
fn create_test_plugin(root: &std::path::Path) {
    let plugin_dir = root.join(".claude-plugin");
    fs::create_dir_all(&plugin_dir).unwrap();

    fs::write(
        plugin_dir.join("plugin.json"),
        r#"{
  "name": "test-plugin",
  "version": "0.1.0",
  "description": "A test plugin for validation",
  "skills": [
    { "name": "greet", "path": "skills/atomic/greet", "category": "atomic" }
  ],
  "agents": [
    { "name": "helper", "path": "agents/helper", "cluster": "default" }
  ],
  "hooks": {
    "hooks": [
      { "event": "pre-run", "script": "hooks/pre-run.sh" }
    ]
  },
  "eval_suites": ["evals/suites/basic.yaml"]
}"#,
    )
    .unwrap();

    fs::write(
        plugin_dir.join("hooks.json"),
        r#"{ "hooks": [{ "event": "pre-run", "script": "hooks/pre-run.sh" }] }"#,
    )
    .unwrap();

    // Create a skill
    let skill_dir = root.join("skills/atomic/greet");
    fs::create_dir_all(&skill_dir).unwrap();
    fs::write(
        skill_dir.join("SKILL.md"),
        "---\nname: greet\ncategory: atomic\ndescription: Greets the user\n---\n# Greet\nSays hello.\n",
    )
    .unwrap();

    // Create an agent
    let agent_dir = root.join("agents/helper");
    fs::create_dir_all(&agent_dir).unwrap();
    fs::write(
        agent_dir.join("AGENT.md"),
        "---\nname: helper\ncluster: default\ndescription: A helper agent\n---\n# Helper\nHelps with tasks.\n",
    )
    .unwrap();

    // Create an eval suite
    let evals_dir = root.join("evals/suites");
    fs::create_dir_all(&evals_dir).unwrap();
    fs::write(
        evals_dir.join("basic.yaml"),
        "name: basic\ncases:\n  - name: hello-check\n    description: Verify hello output\n    expected: \"Hello, world!\"\n  - name: bye-check\n    description: Verify goodbye output\n    fixture: fixtures/bye.txt\n    expected: \"Goodbye!\"\n",
    )
    .unwrap();

    // Create a hook script
    let hooks_dir = root.join("hooks");
    fs::create_dir_all(&hooks_dir).unwrap();
    fs::write(
        hooks_dir.join("pre-run.sh"),
        "#!/bin/sh\ncat\n",
    )
    .unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(hooks_dir.join("pre-run.sh"))
            .unwrap()
            .permissions();
        perms.set_mode(0o755);
        fs::set_permissions(hooks_dir.join("pre-run.sh"), perms).unwrap();
    }
}

#[test]
fn validate_plugin_root_accepts_valid_bundle() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

    let out = common::run_epi(
        &["agent", "plugin", "validate", &plugin_root.display().to_string()],
        &env,
    );
    assert!(
        out.status.success(),
        "validate failed: {}",
        out.stderr
    );
    assert!(out.stdout.contains("test-plugin"));
    assert!(out.stdout.contains("0.1.0"));
}

#[test]
fn validate_plugin_root_json_output() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

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
    assert!(out.status.success(), "validate failed: {}", out.stderr);
    let parsed: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert_eq!(parsed["name"], "test-plugin");
    assert_eq!(parsed["version"], "0.1.0");
    assert_eq!(parsed["skills"].as_array().unwrap().len(), 1);
}

#[test]
fn validate_plugin_root_rejects_missing_manifest() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("bad-plugin");
    fs::create_dir_all(&plugin_root).unwrap();

    let out = common::run_epi(
        &["agent", "plugin", "validate", &plugin_root.display().to_string()],
        &env,
    );
    assert!(!out.status.success() || out.stderr.contains("no plugin manifest"));
}

#[test]
fn install_and_list_plugins() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

    // Install
    let out = common::run_epi(
        &["agent", "plugin", "install", &plugin_root.display().to_string()],
        &env,
    );
    assert!(out.status.success(), "install failed: {}", out.stderr);
    assert!(out.stdout.contains("installed"));

    // List
    let out = common::run_epi(&["agent", "plugin", "list"], &env);
    assert!(out.status.success(), "list failed: {}", out.stderr);
    assert!(out.stdout.contains("test-plugin"));
}

#[test]
fn install_and_uninstall_plugin() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

    // Install
    let out = common::run_epi(
        &["agent", "plugin", "install", &plugin_root.display().to_string()],
        &env,
    );
    assert!(out.status.success(), "install failed: {}", out.stderr);

    // Uninstall
    let out = common::run_epi(
        &["agent", "plugin", "uninstall", "test-plugin"],
        &env,
    );
    assert!(out.status.success(), "uninstall failed: {}", out.stderr);
    assert!(out.stdout.contains("uninstalled"));

    // List should be empty
    let out = common::run_epi(&["agent", "plugin", "list"], &env);
    assert!(out.status.success());
    assert!(out.stdout.contains("no plugins installed"));
}

#[test]
fn discover_eval_suites_from_plugin() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

    let out = common::run_epi(
        &[
            "--json",
            "agent",
            "skills",
            "eval",
            &plugin_root.join("evals/suites").display().to_string(),
        ],
        &env,
    );
    assert!(out.status.success(), "eval failed: {}", out.stderr);
    let parsed: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    let suites = parsed.as_array().unwrap();
    assert_eq!(suites.len(), 1);
    assert_eq!(suites[0]["name"], "basic");
    assert_eq!(suites[0]["cases"].as_array().unwrap().len(), 2);
}

#[test]
fn discover_skills_from_plugin() {
    let env = TestEnv::empty();
    let plugin_root = env.root.join("my-plugin");
    fs::create_dir_all(&plugin_root).unwrap();
    create_test_plugin(&plugin_root);

    let out = common::run_epi(
        &[
            "--json",
            "agent",
            "skills",
            "list",
            &plugin_root.display().to_string(),
        ],
        &env,
    );
    assert!(out.status.success(), "skills list failed: {}", out.stderr);
    let parsed: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    let skills = parsed.as_array().unwrap();
    assert_eq!(skills.len(), 1);
    assert_eq!(skills[0]["name"], "greet");
    assert_eq!(skills[0]["category"], "atomic");
}

#[test]
fn list_empty_plugins() {
    let env = TestEnv::empty();
    let out = common::run_epi(&["agent", "plugin", "list"], &env);
    assert!(out.status.success());
    assert!(out.stdout.contains("no plugins installed"));
}
