mod common;

use common::{run_epi, TestEnv};
use std::fs;

/// Task 6: Body/S/S4/plugins/pleroma must be discoverable via epi agent plugins list.
#[test]
fn pleroma_plugin_is_discoverable() {
    let env = TestEnv::repo_with_assets();

    // Seed the pleroma plugin in the fixture repo
    seed_pleroma_plugin(&env);

    let out = run_epi(["agent", "plugins", "list", "--json"].as_slice(), &env);
    assert!(
        out.status.success(),
        "plugins list failed:\nstdout: {}\nstderr: {}",
        out.stdout,
        out.stderr
    );
    assert!(
        out.stdout.contains("pleroma"),
        "expected 'pleroma' in plugin list: {}",
        out.stdout
    );
}

#[test]
fn body_native_pleroma_registry_is_discoverable() {
    let env = TestEnv::repo_with_assets();
    seed_pleroma_plugin(&env);
    let root_registry = env.repo_root.join("plugins/registry.jsonl");
    if root_registry.exists() {
        fs::remove_file(&root_registry).unwrap();
    }

    let out = run_epi(["agent", "plugins", "list", "--json"].as_slice(), &env);
    assert!(
        out.status.success(),
        "plugins list failed:\nstdout: {}\nstderr: {}",
        out.stdout,
        out.stderr
    );
    assert!(
        out.stdout.contains("pleroma"),
        "expected Body-native pleroma registry in plugin list: {}",
        out.stdout
    );
}

/// Task 6: Body/S/S4/plugins/pleroma must pass validation.
#[test]
fn pleroma_plugin_validates() {
    let env = TestEnv::repo_with_assets();
    seed_pleroma_plugin(&env);

    let pleroma_path = env.repo_root.join("Body/S/S4/plugins/pleroma");
    let out = run_epi(
        [
            "agent",
            "plugin",
            "validate",
            pleroma_path.to_str().unwrap(),
            "--json",
        ]
        .as_slice(),
        &env,
    );

    assert!(
        out.stdout.contains("\"valid\": true") || out.stdout.contains("\"valid\":true"),
        "pleroma plugin validation failed: {}",
        out.stdout
    );
}

/// Task 6: codex install projects pleroma skills into .codex/skills/
#[test]
fn codex_install_projects_pleroma_skills() {
    let env = TestEnv::repo_with_assets();
    seed_pleroma_plugin(&env);

    // Seed minimal vendor OMX
    let omx_dist = env.repo_root.join("vendors/oh-my-codex/dist/cli");
    fs::create_dir_all(&omx_dist).unwrap();
    fs::write(omx_dist.join("omx.js"), "// stub omx\n").unwrap();

    let out = run_epi(["agent", "codex", "install", "--json"].as_slice(), &env);

    assert!(
        out.status.success(),
        "codex install failed:\nstdout: {}\nstderr: {}",
        out.stdout,
        out.stderr
    );

    // .codex/skills/ must exist after install
    let codex_skills = env.repo_root.join(".codex/skills");
    assert!(
        codex_skills.exists(),
        ".codex/skills/ not created by codex install"
    );
}

/// Task 6: PI compat projections continue to work during the transition.
#[test]
fn pi_compat_projections_still_work() {
    let env = TestEnv::repo_with_assets();

    // The existing PI asset layout must still be resolvable
    let out = run_epi(["agent", "doctor", "--json"].as_slice(), &env);

    // doctor runs and returns JSON with PI-related keys — no regression
    assert!(
        out.stdout.contains("\"piBinaryPresent\"") || out.stdout.contains("piBinaryPresent"),
        "PI compat regression: doctor no longer reports piBinaryPresent: {}",
        out.stdout
    );
}

// ── helpers ──────────────────────────────────────────────────────────────────

fn seed_pleroma_plugin(env: &TestEnv) {
    let root = env.repo_root.join("Body/S/S4/plugins/pleroma");
    let manifest_dir = root.join(".claude-plugin");
    let skills_dir = root.join("skills/vak-evaluate");
    let agents_dir = root.join("agents/anima");
    let hooks_dir = root.join("hooks");
    let evals_dir = root.join("evals/suites");

    for dir in [
        &manifest_dir,
        &skills_dir,
        &agents_dir,
        &hooks_dir,
        &evals_dir,
    ] {
        fs::create_dir_all(dir).unwrap();
    }

    fs::write(
        manifest_dir.join("plugin.json"),
        r#"{"name":"pleroma","version":"0.1.0","description":"Pleroma VAK orchestration"}"#,
    )
    .unwrap();
    fs::write(
        skills_dir.join("SKILL.md"),
        "---\nname: vak-evaluate\ndescription: Assign VAK coordinates.\n---\n\n# VAK Evaluate\n",
    )
    .unwrap();
    fs::write(
        agents_dir.join("ANIMA.md"),
        "---\nname: anima\ndescription: Active execution orchestrator at CF (4.0/1-4.4/5)\ncf: \"(4.0/1-4.4/5)\"\n---\n\n## Rupa\n\nOrchestrator.\n",
    )
    .unwrap();
    fs::write(hooks_dir.join("hooks.json"), r#"{"hooks":{}}"#).unwrap();

    // Also write the canonical Body-native registry entry.
    let registry = env.repo_root.join("Body/S/S4/plugins/registry.jsonl");
    if let Some(parent) = registry.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    let mut content = fs::read_to_string(&registry).unwrap_or_default();
    if !content.contains("pleroma") {
        content.push_str(
            r#"{"name":"pleroma","version":"0.1.0","source":"local","root":"Body/S/S4/plugins/pleroma"}"#,
        );
        content.push('\n');
        fs::write(&registry, content).unwrap();
    }
}
