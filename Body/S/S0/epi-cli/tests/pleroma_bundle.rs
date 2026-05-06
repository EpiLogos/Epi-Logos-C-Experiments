use std::fs;
use std::path::PathBuf;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

fn pleroma_root() -> PathBuf {
    repo_root().join("Body/S/S4/plugins/pleroma")
}

/// Task 5: Body/S/S4/plugins/pleroma must have a valid plugin manifest.
#[test]
fn pleroma_has_plugin_manifest() {
    let manifest = pleroma_root().join(".claude-plugin/plugin.json");
    let text = fs::read_to_string(&manifest)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", manifest.display()));

    let v: serde_json::Value = serde_json::from_str(&text)
        .unwrap_or_else(|err| panic!("invalid JSON in {}: {err}", manifest.display()));

    assert!(
        v.get("name")
            .and_then(|n| n.as_str())
            .is_some_and(|n| !n.is_empty()),
        "manifest `name` must not be empty"
    );
    assert!(
        v.get("version")
            .and_then(|v| v.as_str())
            .is_some_and(|v| !v.is_empty()),
        "manifest `version` must not be empty"
    );
}

/// Task 5: Body/S/S4/plugins/pleroma must have at least one skill directory with a SKILL.md.
#[test]
fn pleroma_has_non_empty_skills() {
    let skills_dir = pleroma_root().join("skills");
    assert!(
        skills_dir.exists(),
        "Body/S/S4/plugins/pleroma/skills/ does not exist"
    );

    let skill_entries: Vec<_> = fs::read_dir(&skills_dir)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", skills_dir.display()))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();

    assert!(
        !skill_entries.is_empty(),
        "Body/S/S4/plugins/pleroma/skills/ has no skill subdirectories"
    );

    // At least one skill must have a SKILL.md
    let has_skill_md = skill_entries
        .iter()
        .any(|e| e.path().join("SKILL.md").exists());
    assert!(
        has_skill_md,
        "no SKILL.md found in any Body/S/S4/plugins/pleroma/skills/ subdirectory"
    );
}

/// Task 5: Body/S/S4/plugins/pleroma must have at least one agent ANIMA.md.
#[test]
fn pleroma_has_non_empty_agents() {
    let agents_dir = pleroma_root().join("agents");
    assert!(
        agents_dir.exists(),
        "Body/S/S4/plugins/pleroma/agents/ does not exist"
    );

    let agent_entries: Vec<_> = fs::read_dir(&agents_dir)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", agents_dir.display()))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();

    assert!(
        !agent_entries.is_empty(),
        "Body/S/S4/plugins/pleroma/agents/ has no agent subdirectories"
    );

    let has_anima_md = agent_entries
        .iter()
        .any(|e| e.path().join("ANIMA.md").exists());
    assert!(
        has_anima_md,
        "no ANIMA.md found in any Body/S/S4/plugins/pleroma/agents/ subdirectory"
    );
}

/// Task 5: Body/S/S4/plugins/pleroma must have a hooks config.
#[test]
fn pleroma_has_hooks_config() {
    let hooks_json = pleroma_root().join("hooks/hooks.json");
    assert!(
        hooks_json.exists(),
        "Body/S/S4/plugins/pleroma/hooks/hooks.json does not exist"
    );

    let text = fs::read_to_string(&hooks_json)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", hooks_json.display()));
    let _v: serde_json::Value = serde_json::from_str(&text)
        .unwrap_or_else(|err| panic!("invalid JSON in {}: {err}", hooks_json.display()));
}

/// Task 5: Body/S/S4/plugins/pleroma must have an evals/suites/ directory.
#[test]
fn pleroma_has_eval_suites() {
    let suites = pleroma_root().join("evals/suites");
    assert!(
        suites.exists(),
        "Body/S/S4/plugins/pleroma/evals/suites/ does not exist"
    );
}
