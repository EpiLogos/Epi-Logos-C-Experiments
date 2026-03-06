mod common;

use common::{run_epi, TestEnv};

#[test]
fn add_agent_creates_isolated_layout() {
    let env = TestEnv::repo_with_assets();
    let out = run_epi(["agent", "agents", "add", "anima"].as_slice(), &env);
    assert!(out.status.success());
    assert!(env
        .home
        .join(".epi/agents/anima/agent/models.json")
        .exists());
}

#[test]
fn list_agents_reports_registered_agents_in_json() {
    let env = TestEnv::repo_with_assets();
    let _ = run_epi(["agent", "agents", "add", "anima"].as_slice(), &env);
    let out = run_epi(["agent", "agents", "list", "--json"].as_slice(), &env);
    assert!(out.stdout.contains("\"anima\""));
}
