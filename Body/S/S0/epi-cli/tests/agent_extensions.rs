mod common;

use common::{read_to_string, run_epi, TestEnv};

#[test]
fn sync_copies_repo_pi_assets_into_agent_dir() {
    let env = TestEnv::repo_with_pi();
    let out = run_epi(
        ["agent", "extensions", "sync", "--agent", "anima"].as_slice(),
        &env,
    );
    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(read_to_string(
        env.repo_root
            .join(".epi/agents/anima/agent/extensions/epi-citta.ts")
    )
    .contains("registerTool"));
}

#[test]
fn sync_includes_curated_pi_extension_set() {
    let env = TestEnv::repo_with_pi();
    let out = run_epi(["agent", "extensions", "sync"].as_slice(), &env);
    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(env
        .repo_root
        .join(".epi/agents/main/agent/extensions/subagent-widget.ts")
        .exists());
    assert!(env
        .repo_root
        .join(".epi/agents/main/agent/extensions/cross-agent.ts")
        .exists());
}

#[test]
fn doctor_reports_skill_command_hook_surfaces() {
    let out = run_epi(
        ["agent", "doctor", "--json"].as_slice(),
        &TestEnv::repo_with_assets(),
    );
    assert!(out.stdout.contains("\"skills\""));
    assert!(out.stdout.contains("skills/epi-cli/SKILL.md"));
    assert!(out.stdout.contains("commands/model-status.md"));
    assert!(out.stdout.contains("hooks/pre-agent-run.sh"));
}
