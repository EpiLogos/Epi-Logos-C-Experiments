mod common;

use common::{read_to_string, run_epi, TestEnv};
use serde_json::Value;

#[test]
fn set_default_accepts_pi_owned_model_without_rust_provider_registry() {
    let env = TestEnv::repo_with_assets();
    let out = run_epi(
        [
            "agent",
            "models",
            "set-default",
            "google/gemini-model-owned-by-pi",
        ]
        .as_slice(),
        &env,
    );
    assert!(out.status.success(), "stderr: {}", out.stderr);

    let settings_json = read_to_string(env.repo_root.join(".epi/agents/epii/agent/settings.json"));
    let parsed: Value = serde_json::from_str(&settings_json).expect("settings.json is valid JSON");
    assert_eq!(parsed["defaultProvider"], "google");
    assert_eq!(parsed["defaultModel"], "gemini-model-owned-by-pi");
}

#[test]
fn models_status_reports_settings_default_without_provider_registry() {
    let env = TestEnv::repo_with_assets();
    let set_default = run_epi(
        [
            "agent",
            "models",
            "set-default",
            "google/gemini-3.1-pro-preview",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        set_default.status.success(),
        "stderr: {}",
        set_default.stderr
    );

    let out = run_epi(["agent", "models", "status", "--json"].as_slice(), &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out
        .stdout
        .contains("\"defaultModel\": \"google/gemini-3.1-pro-preview\""));
}

#[test]
fn models_status_reports_default_model_in_json() {
    let env = TestEnv::repo_with_assets();
    let _ = run_epi(
        [
            "agent",
            "models",
            "set-default",
            "google/gemini-3.1-pro-preview",
        ]
        .as_slice(),
        &env,
    );
    let out = run_epi(["agent", "models", "status", "--json"].as_slice(), &env);
    assert!(out
        .stdout
        .contains("\"defaultModel\": \"google/gemini-3.1-pro-preview\""));
    let settings_json = read_to_string(env.repo_root.join(".epi/agents/epii/agent/settings.json"));
    let parsed: Value = serde_json::from_str(&settings_json).expect("settings.json is valid JSON");
    assert_eq!(parsed["defaultProvider"], "google");
    assert_eq!(parsed["defaultModel"], "gemini-3.1-pro-preview");
}
