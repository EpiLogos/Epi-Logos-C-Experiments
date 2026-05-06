mod common;

use common::{run_epi, TestEnv};
use serde_json::Value;

#[test]
fn vault_now_path_matches_now_init_layout() {
    let base_env = TestEnv::repo_with_assets();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let result = run_epi(
        [
            "vault",
            "now-path",
            "--session-id",
            "20260310-090807-abc123",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );

    assert!(
        result.status.success(),
        "now-path failed: {}",
        result.stderr
    );
    assert_eq!(
        result.stdout.trim(),
        env.root
            .join("vault/Empty/Present/10-03-2026/20260310-090807-abc123/now.md")
            .display()
            .to_string()
    );
}

#[test]
fn gate_cron_cli_persists_real_state() {
    let base_env = TestEnv::repo_with_assets();
    let gate_root = base_env.root.join("gate");
    let env = base_env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let add = run_epi(
        [
            "--json",
            "gate",
            "cron",
            "add",
            "--name",
            "heartbeat-check",
            "--description",
            "Check gateway heartbeat",
            "--schedule",
            "0 6 * * *",
            "--session-target",
            "main",
            "--wake-mode",
            "no_wake",
            "--payload",
            "{\"kind\":\"systemEvent\",\"text\":\"heartbeat\"}",
        ]
        .as_slice(),
        &env,
    );
    assert!(add.status.success(), "cron add failed: {}", add.stderr);
    let add_value: Value = serde_json::from_str(&add.stdout).expect("add json");
    let cron_id = add_value["job"]["id"].as_str().expect("job id").to_string();
    assert_eq!(add_value["job"]["name"], "heartbeat-check");
    assert_eq!(
        add_value["job"]["schedule"],
        Value::String("0 6 * * *".to_string())
    );

    let status = run_epi(["--json", "gate", "cron", "status"].as_slice(), &env);
    assert!(
        status.status.success(),
        "cron status failed: {}",
        status.stderr
    );
    let status_value: Value = serde_json::from_str(&status.stdout).expect("status json");
    assert_eq!(status_value["enabled"], true);
    assert_eq!(status_value["jobs"], 1);

    let list = run_epi(["--json", "gate", "cron", "list"].as_slice(), &env);
    assert!(list.status.success(), "cron list failed: {}", list.stderr);
    let list_value: Value = serde_json::from_str(&list.stdout).expect("list json");
    assert_eq!(list_value["jobs"].as_array().expect("jobs array").len(), 1);

    let update = run_epi(
        [
            "--json",
            "gate",
            "cron",
            "update",
            "--id",
            &cron_id,
            "--enabled",
            "false",
            "--description",
            "disabled for maintenance",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        update.status.success(),
        "cron update failed: {}",
        update.stderr
    );
    let update_value: Value = serde_json::from_str(&update.stdout).expect("update json");
    assert_eq!(update_value["job"]["enabled"], false);
    assert_eq!(
        update_value["job"]["description"],
        "disabled for maintenance"
    );

    let run = run_epi(
        ["--json", "gate", "cron", "run", "--id", &cron_id].as_slice(),
        &env,
    );
    assert!(run.status.success(), "cron run failed: {}", run.stderr);
    let run_value: Value = serde_json::from_str(&run.stdout).expect("run json");
    assert_eq!(run_value["ok"], true);

    let runs = run_epi(
        ["--json", "gate", "cron", "runs", "--id", &cron_id].as_slice(),
        &env,
    );
    assert!(runs.status.success(), "cron runs failed: {}", runs.stderr);
    let runs_value: Value = serde_json::from_str(&runs.stdout).expect("runs json");
    assert_eq!(runs_value["runs"].as_array().expect("runs array").len(), 1);

    let remove = run_epi(
        ["--json", "gate", "cron", "remove", "--id", &cron_id].as_slice(),
        &env,
    );
    assert!(
        remove.status.success(),
        "cron remove failed: {}",
        remove.stderr
    );
    let remove_value: Value = serde_json::from_str(&remove.stdout).expect("remove json");
    assert_eq!(remove_value["removed"], true);
    assert!(
        gate_root.join("cron.json").exists(),
        "cron state file missing"
    );
}
