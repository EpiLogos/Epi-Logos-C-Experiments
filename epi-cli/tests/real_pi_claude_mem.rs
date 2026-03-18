use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread::sleep;
use std::time::{Duration, Instant};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("epi-cli lives under repo root")
        .to_path_buf()
}

#[test]
#[ignore = "requires installed pi, configured provider auth, and local claude-mem bootstrap"]
fn real_pi_verify_runtime_starts_claude_mem_worker() {
    let repo_root = repo_root();
    let plugin_root = repo_root.join("vendor/claude-mem-v10.5.5/plugin");
    assert!(
        plugin_root.exists(),
        "missing vendored claude-mem plugin at {}",
        plugin_root.display()
    );

    let output = Command::new(env!("CARGO_BIN_EXE_epi"))
        .current_dir(&repo_root)
        .env("EPI_REPO_ROOT", &repo_root)
        .args([
            "--json",
            "agent",
            "verify-runtime",
            "--agent",
            "main",
            "--plugin-dir",
            plugin_root.to_str().unwrap(),
            "--prompt",
            "Reply with READY only.",
        ])
        .output()
        .expect("run epi");

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    assert!(output.status.success(), "stdout:\n{}\nstderr:\n{}", stdout, stderr);

    let report: Value = serde_json::from_str(&stdout).expect("parse verify-runtime report");
    let home_path = PathBuf::from(
        report["homePath"]
            .as_str()
            .expect("verify-runtime report homePath"),
    );
    let event_log_path = PathBuf::from(
        report["eventLogPath"]
            .as_str()
            .expect("verify-runtime report eventLogPath"),
    );

    wait_for_file_contains(&event_log_path, "\"eventName\":\"SessionStart\"", Duration::from_secs(30));
    wait_for_file_contains(&event_log_path, "\"plugin\":\"claude-mem\"", Duration::from_secs(30));

    let worker_pid_path = home_path.join(".claude-mem/worker.pid");
    let log_path = wait_for_log_containing_any(
        &home_path.join(".claude-mem/logs"),
        &["HTTP server started", "Worker already running and healthy"],
        Duration::from_secs(30),
    );
    let log_contents = fs::read_to_string(&log_path).expect("read claude-mem worker log");
    assert!(
        log_contents.contains("HTTP server started")
            || log_contents.contains("Worker already running and healthy"),
        "expected worker health log in {}\n{}",
        log_path.display(),
        log_contents
    );

    if worker_pid_path.exists() {
        let worker_pid: Value = serde_json::from_str(
            &fs::read_to_string(&worker_pid_path).expect("read claude-mem worker pid file"),
        )
        .expect("parse claude-mem worker pid file");
        assert_eq!(worker_pid["port"].as_u64(), Some(37777));

        if let Some(pid) = worker_pid["pid"].as_i64() {
            let _ = Command::new("kill").arg(pid.to_string()).status();
        }
    } else {
        assert!(
            log_contents.contains("Worker already running and healthy"),
            "worker pid file missing without shared-worker health evidence in {}\n{}",
            log_path.display(),
            log_contents
        );
    }
}

fn wait_for_file_contains(path: &Path, needle: &str, timeout: Duration) {
    let deadline = Instant::now() + timeout;
    while Instant::now() < deadline {
        if let Ok(contents) = fs::read_to_string(path) {
            if contents.contains(needle) {
                return;
            }
        }
        sleep(Duration::from_millis(250));
    }
    panic!(
        "timed out waiting for {} to contain {}",
        path.display(),
        needle
    );
}

fn wait_for_log_containing_any(log_dir: &Path, needles: &[&str], timeout: Duration) -> PathBuf {
    let deadline = Instant::now() + timeout;
    while Instant::now() < deadline {
        if let Ok(entries) = fs::read_dir(log_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if !path.is_file() {
                    continue;
                }
                if let Ok(contents) = fs::read_to_string(&path) {
                    if needles.iter().any(|needle| contents.contains(needle)) {
                        return path;
                    }
                }
            }
        }
        sleep(Duration::from_millis(250));
    }
    panic!(
        "timed out waiting for a log under {} to contain one of {}",
        log_dir.display(),
        needles.join(", ")
    );
}
