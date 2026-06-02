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

/// Architecture truth: Pleroma is the SKILL layer only. It must NOT be the
/// authority for agent definitions — those live under the ta-onta homes
/// (S4-4p-anima/S4'/agents and S4-5p-aletheia/S5'/agents) and carry their own
/// skill/tool entitlement frontmatter, which is the binding authority.
///
/// This test previously REQUIRED Pleroma to ship `agents/**/ANIMA.md`, which
/// encoded the wrong architecture (Pleroma as agent authority). That legacy
/// directory has now been DELETED, and this test asserts its ABSENCE: the
/// binding agent-definition homes are the ta-onta pi-level homes, and Pleroma
/// is the skill layer only. The skills assertion
/// (`pleroma_has_non_empty_skills`) and the hooks assertions remain the
/// load-bearing checks for the Pleroma skill bundle.
#[test]
fn pleroma_must_not_contain_agent_defs() {
    assert!(
        !pleroma_root().join("agents").exists(),
        "pleroma must not contain agent defs — agents live at the ta-onta pi-level homes"
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

#[test]
fn pleroma_hooks_use_supported_pi_runtime_contract() {
    let hooks_json = pleroma_root().join("hooks/hooks.json");
    let text = fs::read_to_string(&hooks_json)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", hooks_json.display()));
    let v: serde_json::Value = serde_json::from_str(&text)
        .unwrap_or_else(|err| panic!("invalid JSON in {}: {err}", hooks_json.display()));
    let hooks = v
        .get("hooks")
        .and_then(|value| value.as_object())
        .expect("pleroma hooks must use the modern event map schema");
    let supported_events = [
        "ConfigChange",
        "InstructionsLoaded",
        "Notification",
        "PermissionRequest",
        "PostToolUse",
        "PostToolUseFailure",
        "PreCompact",
        "PreToolUse",
        "SessionEnd",
        "SessionStart",
        "Setup",
        "Stop",
        "SubagentStart",
        "SubagentStop",
        "TaskCompleted",
        "TeammateIdle",
        "UserPromptSubmit",
        "WorktreeCreate",
        "WorktreeRemove",
    ];

    for (event, groups) in hooks {
        assert!(
            supported_events.contains(&event.as_str()),
            "unsupported pleroma hook event `{event}`"
        );
        let groups = groups
            .as_array()
            .unwrap_or_else(|| panic!("hook event `{event}` must contain matcher groups"));
        for group in groups {
            let group_hooks = group
                .get("hooks")
                .and_then(|value| value.as_array())
                .unwrap_or_else(|| panic!("hook event `{event}` matcher group must contain hooks"));
            for hook in group_hooks {
                let hook_type = hook
                    .get("type")
                    .and_then(|value| value.as_str())
                    .unwrap_or("");
                assert!(
                    ["agent", "command", "prompt"].contains(&hook_type),
                    "unsupported pleroma hook type `{hook_type}` for event `{event}`"
                );
            }
        }
    }
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
