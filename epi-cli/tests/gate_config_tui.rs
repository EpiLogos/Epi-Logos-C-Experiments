mod support;

use support::{run_epi, temp_env};

#[test]
fn gate_config_tui_renders_operator_surface() {
    let env = temp_env();

    let out = run_epi(&["gate", "config", "tui"], &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("Gateway Config TUI"), "stdout: {}", out.stdout);
    assert!(out.stdout.contains("gateway.port"), "stdout: {}", out.stdout);
    assert!(out.stdout.contains("apply"), "stdout: {}", out.stdout);
}
