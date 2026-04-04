mod common;

use common::{read_to_string, run_epi, write_executable, write_file, TestEnv};
use std::fs;

fn env_with_fake_obsidian_cli() -> TestEnv {
    let env = TestEnv::repo_with_assets();
    let bin_dir = env.root.join("bin");
    std::fs::create_dir_all(&bin_dir).unwrap();
    let log_path = env.root.join("obsidian.log");
    write_executable(
        bin_dir.join("obsidian-cli"),
        &format!(
            "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"{}\"\nif [ \"$1\" = \"print-default\" ]; then printf 'Main Vault\\n'; fi\n",
            log_path.display()
        ),
    );

    let existing = std::env::var("PATH").unwrap_or_default();
    env.with_env("PATH", format!("{}:{existing}", bin_dir.display()))
        .with_env("OBSIDIAN_LOG_PATH", log_path.display().to_string())
}

#[test]
fn obsidian_passthrough_commands_use_expected_args() {
    let env = env_with_fake_obsidian_cli();

    let _ = run_epi(["vault", "set-default", "Ideas"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    assert_eq!(log.trim(), "set-default\nIdeas");

    let _ = run_epi(["vault", "open", "Note Name"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    assert_eq!(log.trim(), "open\nNote Name");

    let _ = run_epi(
        ["vault", "frontmatter-delete", "Note Name", "old_key"].as_slice(),
        &env,
    );
    let log = read_to_string(env.root.join("obsidian.log"));
    assert_eq!(
        log.trim(),
        "frontmatter\nNote Name\n--delete\n--key\nold_key"
    );
}

#[test]
fn template_and_day_now_commands_write_real_files() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");
    write_file(
        env.repo_root.join("Idea/Bimba/World/Prompt.md"),
        "---\nartifact_role: prompt\n---\n\n# Prompt Override\n",
    );

    let day = run_epi(
        ["vault", "day-init", "--now", "2026-03-10T09:08:07Z"].as_slice(),
        &env,
    );
    assert!(day.stdout.contains("daily-note.md"));
    assert!(vault_root
        .join("Empty/Present/10-03-2026/daily-note.md")
        .exists());

    let now = run_epi(
        [
            "vault",
            "now-init",
            "--session-id",
            "20260310-090807-abc123",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );
    assert!(now.stdout.contains("20260310-090807-abc123/now.md"));
    assert!(vault_root
        .join("Empty/Present/10-03-2026/20260310-090807-abc123/now.md")
        .exists());

    let prompt = run_epi(
        [
            "vault",
            "template-invoke",
            "prompt",
            "--coordinate",
            "M2",
            "--session-id",
            "20260310-090807-abc123",
        ]
        .as_slice(),
        &env,
    );
    assert!(prompt.stdout.contains("# Prompt Override"));

    let thought = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "4",
            "--content",
            "insight body",
            "--session-id",
            "20260310-090807-abc123",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );
    assert!(thought.stdout.contains("T4-20260310-090807.md"));

    // archive-day without reflection guard should fail
    let archive_no_reflect = run_epi(["vault", "archive-day", "10-03-2026"].as_slice(), &env);
    assert!(
        !archive_no_reflect.status.success(),
        "archive-day must fail without c_5_reflection_complete"
    );
    assert!(
        archive_no_reflect
            .stderr
            .contains("c_5_reflection_complete not set"),
        "wrong error: {}",
        archive_no_reflect.stderr
    );

    // archive-day --plan prints paths without moving
    let daily_note = vault_root.join("Empty/Present/10-03-2026/daily-note.md");
    let mut content = fs::read_to_string(&daily_note).unwrap();
    content = content.replace("---\n", "---\nc_5_reflection_complete: true\n");
    // Only replace the first occurrence (the closing ---)
    let first_close = content.find("---\nc_5").unwrap();
    fs::write(&daily_note, &content).unwrap();

    let plan_out = run_epi(
        ["vault", "archive-day", "10-03-2026", "--plan"].as_slice(),
        &env,
    );
    assert!(
        plan_out.status.success(),
        "plan failed: {}",
        plan_out.stderr
    );
    assert!(
        plan_out.stdout.contains("→"),
        "--plan must print SOURCE → DEST, got: {}",
        plan_out.stdout
    );
    assert!(
        plan_out.stdout.contains("W11"),
        "--plan output must contain W11: {}",
        plan_out.stdout
    );
    // File must still exist (--plan does not move)
    assert!(daily_note.exists(), "--plan must not move files");

    // archive-day --force skips reflection guard
    // Reset: remove the reflection line to test --force
    let content_no_reflect = fs::read_to_string(&daily_note)
        .unwrap()
        .replace("c_5_reflection_complete: true\n", "");
    fs::write(&daily_note, &content_no_reflect).unwrap();

    let force_plan = run_epi(
        ["vault", "archive-day", "10-03-2026", "--plan", "--force"].as_slice(),
        &env,
    );
    assert!(
        force_plan.status.success(),
        "--force --plan must succeed without reflection: {}",
        force_plan.stderr
    );
}

#[test]
fn flow_init_creates_flow_md_in_day_folder() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let result = run_epi(
        ["vault", "flow-init", "--now", "2026-03-10T09:08:07Z"].as_slice(),
        &env,
    );
    assert!(
        result.stdout.contains("FLOW.md"),
        "flow-init output: {}",
        result.stdout
    );

    let flow = vault_root.join("Empty/Present/10-03-2026/FLOW.md");
    assert!(flow.exists(), "FLOW.md not created at {}", flow.display());
    let content = fs::read_to_string(&flow).unwrap();
    assert!(
        content.contains("c_4_artifact_role: \"flow\""),
        "missing artifact_role in:\n{content}"
    );
    assert!(
        content.contains("m_4_nara_domain: \"journal\""),
        "missing nara_domain in:\n{content}"
    );

    // Idempotency: second call must not fail
    let r2 = run_epi(
        ["vault", "flow-init", "--now", "2026-03-10T09:08:07Z"].as_slice(),
        &env,
    );
    assert!(
        r2.stdout.contains("FLOW.md"),
        "flow-init not idempotent: {}",
        r2.stdout
    );
    // Content must not change
    let content2 = fs::read_to_string(&flow).unwrap();
    assert_eq!(
        content, content2,
        "flow-init must not modify on second call"
    );
}

#[test]
fn now_init_creates_thinking_and_thoughts_dirs() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let now_result = run_epi(
        [
            "vault",
            "now-init",
            "--session-id",
            "20260310-090807-abc123",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        now_result.stdout.contains("20260310-090807-abc123"),
        "now-init output: {}",
        now_result.stdout
    );

    let now_dir = vault_root.join("Empty/Present/10-03-2026/20260310-090807-abc123");
    assert!(now_dir.join("thinking").exists(), "thinking/ must exist");
    assert!(now_dir.join("thoughts").exists(), "thoughts/ must exist");
    assert!(now_dir.join("tasks").exists(), "tasks/ must exist");
    assert!(now_dir.join("patterns").exists(), "patterns/ must exist");
}

#[test]
fn pasu_set_and_get_roundtrip() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    // Create stub PASU.md
    let pasu_dir = vault_root.join("Pratibimba/Self");
    fs::create_dir_all(&pasu_dir).unwrap();
    fs::write(
        pasu_dir.join("PASU.md"),
        "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"\"\nc_0_birth_location: \"\"\nc_0_natal_chart_path: \"\"\n---\n\n# PASU\n",
    ).unwrap();

    // Set birth-date
    let set_result = run_epi(
        ["vault", "pasu", "set", "birth-date", "1990-06-15"].as_slice(),
        &env,
    );
    assert!(
        set_result.stdout.contains("c_0_birth_date"),
        "set must report key, got: {}",
        set_result.stdout
    );

    // Verify file content uses coordinate-driven key
    let content = fs::read_to_string(pasu_dir.join("PASU.md")).unwrap();
    assert!(
        content.contains("c_0_birth_date: \"1990-06-15\""),
        "must use c_0 key: {content}"
    );
    assert!(
        !content.contains("\nbirth_date:"),
        "plain-English key leaked: {content}"
    );

    // Get birth-date roundtrip
    let get_result = run_epi(["vault", "pasu", "get", "birth-date"].as_slice(), &env);
    assert!(
        get_result.stdout.contains("1990-06-15"),
        "get must return value, got: {}",
        get_result.stdout
    );
}

#[test]
fn kairos_status_returns_stub_when_no_birth_data() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    // Create PASU.md with empty birth data
    let pasu_dir = vault_root.join("Pratibimba/Self");
    fs::create_dir_all(&pasu_dir).unwrap();
    fs::write(
        pasu_dir.join("PASU.md"),
        "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"\"\nc_0_birth_location: \"\"\nc_0_natal_chart_path: \"\"\n---\n\n# PASU\n",
    ).unwrap();

    let result = run_epi(["vault", "kairos", "status"].as_slice(), &env);
    assert!(
        result.status.success(),
        "kairos status must succeed: {}",
        result.stderr
    );
    let out = &result.stdout;
    assert!(
        out.contains("mode: stub") || out.contains("planet_valid: 0x00"),
        "must report stub mode when no birth data: {out}"
    );
}

#[test]
fn vault_daily_passes_vault_flag_when_epi_vault_name_set() {
    let env = env_with_fake_obsidian_cli()
        .with_env("EPI_VAULT_NAME", "MyVault");
    let _ = run_epi(["vault", "open", "SomeNote"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // obsidian-cli should receive: -v MyVault open SomeNote
    assert!(log.contains("-v"), "expected -v flag: {log}");
    assert!(log.contains("MyVault"), "expected vault name: {log}");
}

#[test]
fn vault_daily_passes_vault_flag_from_obsidian_dir_autodetect() {
    let base_env = env_with_fake_obsidian_cli();
    // Create .obsidian/ in repo_root to trigger autodetection
    std::fs::create_dir_all(base_env.repo_root.join(".obsidian")).unwrap();
    let env = base_env;
    let _ = run_epi(["vault", "open", "SomeNote"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // vault name should be basename of repo_root (the test dir name)
    assert!(log.contains("-v"), "expected -v flag from autodetect: {log}");
}

#[test]
fn vault_set_default_does_not_inject_vault_flag() {
    let env = env_with_fake_obsidian_cli()
        .with_env("EPI_VAULT_NAME", "MyVault");
    let _ = run_epi(["vault", "set-default", "OtherVault"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // set-default must NOT receive -v (it IS the vault config command)
    assert!(!log.contains("-v"), "set-default must not get -v injected: {log}");
    assert!(log.contains("set-default"), "log: {log}");
    assert!(log.contains("OtherVault"), "log: {log}");
}

#[test]
fn kairos_status_reports_natal_when_chart_exists() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    // Create PASU.md with birth data and a pre-existing chart
    let pasu_dir = vault_root.join("Pratibimba/Self");
    fs::create_dir_all(&pasu_dir).unwrap();
    fs::write(
        pasu_dir.join("PASU.md"),
        "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"1990-06-15\"\nc_0_birth_location: \"Berlin, Germany\"\nc_0_natal_chart_path: \"Pratibimba/Self/natal-chart.json\"\n---\n\n# PASU\n",
    ).unwrap();
    fs::write(
        pasu_dir.join("natal-chart.json"),
        r#"{"sun_degree":168.4,"moon_degree":42.1,"planet_degrees":[168.4,42.1,155.2,190.3,45.6,210.7,300.2],"planet_valid":127}"#,
    ).unwrap();

    let result = run_epi(["vault", "kairos", "status"].as_slice(), &env);
    assert!(
        result.status.success(),
        "kairos status must succeed: {}",
        result.stderr
    );
    let out = &result.stdout;
    assert!(
        out.contains("mode: natal"),
        "must report natal mode when chart exists: {out}"
    );
}

#[test]
fn vault_root_autodetects_idea_in_repo_root() {
    let base_env = env_with_fake_obsidian_cli();
    // Create Idea/ in repo_root (no EPILOGOS_VAULT set)
    let idea_dir = base_env.repo_root.join("Idea");
    std::fs::create_dir_all(&idea_dir).unwrap();
    // Run day-init — it should write into repo_root/Idea, not ~/Documents/Epi-Logos/Idea
    let result = run_epi(
        ["vault", "day-init", "--now", "2026-04-04T10:00:00Z"].as_slice(),
        &base_env,
    );
    assert!(
        result.status.success(),
        "day-init failed: {}",
        result.stderr
    );
    assert!(
        idea_dir.join("Empty/Present/04-04-2026/daily-note.md").exists(),
        "daily-note must be in repo_root/Idea, got stdout: {}",
        result.stdout
    );
}
