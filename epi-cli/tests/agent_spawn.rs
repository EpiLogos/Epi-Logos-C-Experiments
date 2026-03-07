mod common;

use common::{read_to_string, run_epi, TestEnv};

#[test]
fn spawn_includes_epi_citta_extension() {
    let env = TestEnv::with_fake_pi();
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    assert!(read_to_string(env.fake_pi_log.join("argv.txt")).contains("extensions/epi-citta.ts"));
}

#[test]
fn spawn_exports_selected_agent_dir_to_pi() {
    let env = TestEnv::with_fake_pi();
    let out = run_epi(
        ["agent", "spawn", "--agent", "anima", "hello"].as_slice(),
        &env,
    );
    assert!(out.status.success());
    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("PI_CODING_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_PROMPTS_DIR="));
}
