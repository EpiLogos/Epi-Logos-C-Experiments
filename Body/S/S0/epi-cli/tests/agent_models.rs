mod common;

use common::{read_to_string, run_epi, TestEnv};

#[test]
fn add_provider_writes_models_json_for_glm() {
    let env = TestEnv::repo_with_assets();
    let out = run_epi(["agent", "models", "add-provider", "glm"].as_slice(), &env);
    assert!(out.status.success());
    assert!(
        read_to_string(env.home.join(".epi/agents/main/agent/models.json")).contains("\"zai\"")
    );
}

#[test]
fn models_status_reports_default_model_in_json() {
    let env = TestEnv::repo_with_assets();
    let _ = run_epi(["agent", "models", "add-provider", "kimi"].as_slice(), &env);
    let _ = run_epi(
        ["agent", "models", "set-default", "kimi/kimi-k2"].as_slice(),
        &env,
    );
    let out = run_epi(["agent", "models", "status", "--json"].as_slice(), &env);
    assert!(out.stdout.contains("\"defaultModel\": \"kimi/kimi-k2\""));
}
