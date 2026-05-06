mod common;

use common::{read_to_string, run_epi, TestEnv};

#[test]
fn auth_set_writes_provider_profile_for_minimax() {
    let env = TestEnv::repo_with_assets();
    let out = run_epi(
        ["agent", "auth", "set", "minimax", "--api-key", "secret"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    assert!(
        read_to_string(env.home.join(".epi/agents/main/agent/auth-profiles.json"))
            .contains("\"minimax:default\"")
    );
}

#[test]
fn auth_status_redacts_secrets_in_json_output() {
    let env = TestEnv::repo_with_assets();
    let _ = run_epi(
        ["agent", "auth", "set", "glm", "--api-key", "top-secret"].as_slice(),
        &env,
    );
    let out = run_epi(["agent", "auth", "status", "--json"].as_slice(), &env);
    assert!(out.stdout.contains("\"glm:default\""));
    assert!(out.stdout.contains("\"redacted\": true"));
    assert!(!out.stdout.contains("top-secret"));
}
