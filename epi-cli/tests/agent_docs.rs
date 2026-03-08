mod common;

fn repo_root() -> std::path::PathBuf {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest.parent().unwrap().to_path_buf()
}

/// Task 1: Verify the parity matrix lists all locked capability families.
#[test]
fn pleroma_port_matrix_lists_all_capability_families() {
    let text = std::fs::read_to_string(repo_root().join("docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md"))
        .expect("port matrix must exist");
    for needle in [
        "tmux",
        "cmux",
        "worktrunk",
        "ralph-tui",
        "ouroboros",
        "klein-mode",
        "repl",
        "notebooklm",
        "vak-evaluate",
        "vak-coordinate-frame",
        "anima-orchestration",
        "day-night-pass",
        "pleroma-skill-proxy",
        "technē-spawn",
        "technē-relay",
        "technē-list",
        "technē-close",
        "chatlog-fetcher",
        "youtube-transcript",
        "gitbutler",
    ] {
        assert!(text.contains(needle), "port matrix missing capability: {needle}");
    }
}

/// Task 11: Final verification checklist — all bundle directories, suites, and hooks exist.
#[test]
fn real_pleroma_port_checklist_complete() {
    let root = repo_root();

    let checks = [
        "plugins/pleroma/.claude-plugin/plugin.json",
        "plugins/pleroma/settings.json",
        "plugins/pleroma/hooks/hooks.json",
        "plugins/pleroma/evals/suites/manifest.yaml",
    ];
    for path in checks {
        assert!(root.join(path).exists(), "checklist missing: {path}");
    }

    let atomic_skills = [
        "tmux", "cmux", "mprocs", "worktrunk", "ralph-tui", "repl",
        "notebooklm", "chatlog-fetcher", "youtube-transcript", "gitbutler",
        "pleroma-skill-proxy",
        "technē-spawn", "technē-relay", "technē-list", "technē-close",
    ];
    for skill in atomic_skills {
        let p = format!("plugins/pleroma/skills/atomic/{skill}/SKILL.md");
        assert!(root.join(&p).exists(), "atomic skill missing: {p}");
    }

    let orch_skills = [
        "vak-coordinate-frame", "vak-evaluate", "anima-orchestration",
        "day-night-pass", "ouroboros", "klein-mode",
    ];
    for skill in orch_skills {
        let p = format!("plugins/pleroma/skills/orchestration/{skill}/SKILL.md");
        assert!(root.join(&p).exists(), "orchestration skill missing: {p}");
    }

    let constitutional = ["nous", "logos", "eros", "mythos", "psyche", "sophia"];
    for agent in constitutional {
        let p = format!("plugins/pleroma/agents/constitutional/{agent}.md");
        assert!(root.join(&p).exists(), "constitutional agent missing: {p}");
    }

    let aletheia = ["anansi", "janus", "moirai", "mercurius", "agora", "zeithoven"];
    for agent in aletheia {
        let p = format!("plugins/pleroma/agents/aletheia/{agent}.md");
        assert!(root.join(&p).exists(), "aletheia agent missing: {p}");
    }

    let hook_scripts = [
        "plugins/pleroma/hooks/scripts/preflight-validate.sh",
        "plugins/pleroma/hooks/scripts/postflight-verify.sh",
        "plugins/pleroma/hooks/scripts/subagent-discharge.sh",
        "plugins/pleroma/hooks/scripts/worktree-cleanup.sh",
    ];
    for script in hook_scripts {
        assert!(root.join(script).exists(), "hook script missing: {script}");
    }
}
