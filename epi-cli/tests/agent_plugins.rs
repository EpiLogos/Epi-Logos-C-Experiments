mod common;

use common::{create_plugin_bundle, run_epi, write_file, TestEnv};

#[test]
fn valid_plugin_bundle_passes_validation() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");

    let out = run_epi(
        [
            "agent",
            "plugin",
            "validate",
            plugin.root.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": true"));
    assert!(out.stdout.contains("\"name\": \"pleroma\""));
    assert!(out.stdout.contains("\"skillCount\": 1"));
    assert!(out.stdout.contains("\"subagentCount\": 1"));
    assert!(out.stdout.contains("\"hookEventCount\": 1"));
}

#[test]
fn plugin_discovery_lists_repo_plugins_in_name_order() {
    let env = TestEnv::repo_with_assets();
    create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");
    create_plugin_bundle(env.repo_root.join("plugins"), "epi-core");

    let out = run_epi(["agent", "plugins", "list", "--json"].as_slice(), &env);

    let epi_core = out.stdout.find("\"name\": \"epi-core\"").unwrap();
    let pleroma = out.stdout.find("\"name\": \"pleroma\"").unwrap();
    assert!(epi_core < pleroma);
}

#[test]
fn skill_validate_reports_frontmatter_and_body_path() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");

    let out = run_epi(
        [
            "agent",
            "skill",
            "validate",
            plugin.skill_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": true"));
    assert!(out.stdout.contains("\"name\": \"review\""));
    assert!(out.stdout.contains("\"allowedTools\""));
    assert!(out.stdout.contains(plugin.skill_path.to_str().unwrap()));
}

#[test]
fn subagent_validate_reports_frontmatter_and_skill_preloads() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");

    let out = run_epi(
        [
            "agent",
            "subagent",
            "validate",
            plugin.subagent_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": true"));
    assert!(out.stdout.contains("\"name\": \"reviewer\""));
    assert!(out.stdout.contains("\"skills\""));
    assert!(out.stdout.contains("\"review\""));
}

#[test]
fn hooks_validate_reports_supported_event_inventory() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");

    let out = run_epi(
        [
            "agent",
            "hooks",
            "validate",
            plugin.hooks_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": true"));
    assert!(out.stdout.contains("\"event\": \"PreToolUse\""));
    assert!(out.stdout.contains(plugin.hook_script_path.to_str().unwrap()));
}

#[test]
fn invalid_plugin_bundle_reports_duplicate_skill_names() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");
    write_file(
        plugin.root.join("skills/second/SKILL.md"),
        r#"---
name: review
description: Duplicate review name
allowed-tools:
  - Read
---

# Duplicate
"#,
    );

    let out = run_epi(
        [
            "agent",
            "plugin",
            "validate",
            plugin.root.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": false"));
    assert!(out.stdout.contains("duplicate skill name"));
    assert!(out.stdout.contains("skills/second/SKILL.md"));
}

#[test]
fn invalid_hooks_config_reports_unknown_event() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_plugin_bundle(env.repo_root.join("plugins"), "pleroma");
    write_file(
        &plugin.hooks_path,
        r#"{
  "hooks": [
    {
      "event": "TotallyInvalidEvent",
      "hooks": [
        {
          "type": "command",
          "command": "./scripts/pre_tool_use.sh"
        }
      ]
    }
  ]
}
"#,
    );

    let out = run_epi(
        [
            "agent",
            "hooks",
            "validate",
            plugin.hooks_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.stdout.contains("\"valid\": false"));
    assert!(out.stdout.contains("TotallyInvalidEvent"));
}
