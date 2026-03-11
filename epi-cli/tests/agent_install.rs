mod common;

use common::{run_epi, TestEnv};

#[test]
fn install_reports_missing_pi_binary_or_installer() {
    let env = TestEnv::repo_with_assets().with_env("PATH", "");
    let out = run_epi(
        ["agent", "install", "--json"].as_slice(),
        &env,
    );
    assert!(out.stdout.contains("\"status\": \"missing-prerequisite\""));
    assert!(out.stdout.contains("\"nextAction\""));
}

#[test]
fn doctor_reports_binary_config_and_extensions_status() {
    let out = run_epi(
        ["agent", "doctor", "--json"].as_slice(),
        &TestEnv::repo_with_assets(),
    );
    assert!(out.stdout.contains("\"piBinaryPresent\""));
    assert!(out.stdout.contains("\"extensionSync\""));
    assert!(out.stdout.contains("\"modelsPath\""));
}
