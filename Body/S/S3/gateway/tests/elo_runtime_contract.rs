use std::path::{Path, PathBuf};
use std::process::Command;

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(Path::parent)
        .and_then(Path::parent)
        .and_then(Path::parent)
        .expect("gateway manifest remains under Body/S/S3/gateway")
        .to_path_buf()
}

fn run_aletheia_elo_node_test(pattern: &str) {
    let root = repo_root();
    let test_path = root.join("Body/S/S4/ta-onta/S4-5p-aletheia/tests/elo_runtime.test.ts");
    let output = Command::new("node")
        .current_dir(&root)
        .args(["--test", "--test-name-pattern", pattern])
        .arg(&test_path)
        .output()
        .expect("node test runner is available for Aletheia Elo runtime tests");

    assert!(
        output.status.success(),
        "Aletheia Elo runtime test failed\nstdout:\n{}\nstderr:\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}

#[test]
fn mercurius_elo_round_trip() {
    run_aletheia_elo_node_test(
        "records dispatch and canon trials in one store, refuses the uncalibrated first update, then updates by channel",
    );
}

#[test]
fn moirai_refuses_uncalibrated_update() {
    run_aletheia_elo_node_test(
        "refuses an update when no comparable prior trial meets the configured floor",
    );
}
