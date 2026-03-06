mod common;

use common::{run_epi, TestEnv};

#[test]
fn doctor_reports_missing_repo_pi_assets() {
    let result = run_epi(["agent", "doctor", "--json"].as_slice(), &TestEnv::empty());
    assert!(result.stdout.contains("\"missingRepoAssets\""));
    assert!(result.stdout.contains(".pi/composite-entry.ts"));
}

#[test]
fn resolves_default_agent_dir_under_epi_home() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["agent", "doctor", "--json"].as_slice(), &env);
    assert!(result.stdout.contains(&format!(
        "\"path\": \"{}\"",
        env.home.join(".epi/agents/main/agent").display()
    )));
    assert!(result.stdout.contains("\"modelsPath\""));
    assert!(result.stdout.contains("\"authProfilesPath\""));
}

#[test]
fn resolves_named_agent_dir_under_epi_home() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(
        ["agent", "doctor", "--agent", "anima", "--json"].as_slice(),
        &env,
    );
    assert!(result.stdout.contains(&format!(
        "\"path\": \"{}\"",
        env.home.join(".epi/agents/anima/agent").display()
    )));
}

#[test]
fn honors_epi_agent_home_override() {
    let env = TestEnv::repo_with_assets();
    let override_home = env.root.join("custom-agent-home");
    let result = run_epi(
        ["agent", "doctor", "--json"].as_slice(),
        &env.with_env("EPI_AGENT_HOME", override_home.display().to_string()),
    );
    assert!(result.stdout.contains(&format!(
        "\"path\": \"{}\"",
        override_home.join("agents/main/agent").display()
    )));
}

#[test]
fn honors_explicit_agent_dir_override() {
    let env = TestEnv::repo_with_assets();
    let override_dir = env.root.join("external/pi-dir");
    let result = run_epi(
        ["agent", "doctor", "--json"].as_slice(),
        &env.with_env("PI_CODING_AGENT_DIR", override_dir.display().to_string()),
    );
    assert!(result
        .stdout
        .contains(&format!("\"path\": \"{}\"", override_dir.display())));
}
