mod common;

use common::{read_to_string, run_epi, TestEnv};

#[test]
fn model_runtime_discovery_delegates_to_pi() {
    let env = TestEnv::with_fake_pi();

    let out = run_epi(["agent", "models", "list", "google"].as_slice(), &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("gemini-owned-by-pi"));

    let argv = read_to_string(env.fake_pi_log.join("argv.txt"));
    assert!(argv.contains("--list-models"));
    assert!(argv.contains("google"));

    let captured_env = read_to_string(env.fake_pi_log.join("env.txt"));
    assert!(captured_env.contains("PI_CODING_AGENT_DIR="));
    assert!(captured_env.contains("EPI_AGENT_DIR="));
}
