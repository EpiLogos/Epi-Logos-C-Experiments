mod common;

use std::path::PathBuf;
use std::process::Command;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("epi-cli lives under repo root")
        .to_path_buf()
}

#[test]
fn vendored_claude_mem_bundle_is_present_and_validates() {
    let repo_root = repo_root();
    let plugin_root = repo_root.join("vendor/claude-mem-v10.5.5/plugin");
    let registry_path = repo_root.join("plugins/registry.jsonl");

    assert!(
        plugin_root.join(".claude-plugin/plugin.json").exists(),
        "missing vendored claude-mem plugin manifest at {}",
        plugin_root.display()
    );
    assert!(
        plugin_root.join("hooks/hooks.json").exists(),
        "missing vendored claude-mem hooks config at {}",
        plugin_root.display()
    );
    assert!(
        registry_path.exists(),
        "missing plugin registry at {}",
        registry_path.display()
    );

    let output = Command::new(env!("CARGO_BIN_EXE_epi"))
        .current_dir(&repo_root)
        .env("EPI_REPO_ROOT", &repo_root)
        .args([
            "agent",
            "plugin",
            "validate",
            plugin_root.to_str().unwrap(),
            "--json",
        ])
        .output()
        .expect("run epi");
    let out = common::TestOutput::from(output);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(
        out.stdout.contains("\"valid\": true"),
        "stdout: {}",
        out.stdout
    );
    assert!(out.stdout.contains("\"name\": \"claude-mem\""));
    assert!(out.stdout.contains("\"hookEventCount\": 8"));
}
