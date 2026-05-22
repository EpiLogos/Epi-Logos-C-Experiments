mod common;

use common::{read_to_string, run_epi, TestEnv};
use serde_json::Value;

#[test]
fn auth_set_writes_provider_profile_for_minimax() {
    let env = TestEnv::repo_with_assets();
    let out = run_epi(
        ["agent", "auth", "set", "minimax", "--api-key", "secret"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    let auth_profiles = read_to_string(
        env.repo_root
            .join(".epi/agents/epii/agent/auth-profiles.json"),
    );
    assert!(auth_profiles.contains("\"minimax:default\""));
    assert!(!auth_profiles.contains("secret"));
    let pi_auth = read_to_string(env.repo_root.join(".epi/agents/epii/agent/auth.json"));
    let parsed: Value = serde_json::from_str(&pi_auth).expect("auth.json is valid JSON");
    assert_eq!(parsed["minimax"]["type"], "api_key");
    assert_eq!(parsed["minimax"]["key"], "secret");
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
