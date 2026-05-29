mod common;

use common::{read_to_string, run_epi, write_executable, write_file, TestEnv};
use std::fs;
use std::path::{Path, PathBuf};

fn fixture_repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn copy_fixture(from_root: &Path, to_root: &Path, rel: &str) {
    let source = from_root.join(rel);
    let target = to_root.join(rel);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::copy(source, target).unwrap();
}

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
fn link_suggest_surfaces_real_smart_env_candidates_via_cli() {
    let env = TestEnv::repo_with_assets();
    let repo_root = fixture_repo_root();
    for rel in [
        "Idea/Bimba/Seeds/S/S-SHARDING-TASK-LIST.md",
        "Idea/Bimba/Seeds/S/S-AD-HOC-ROADMAP.md",
        "Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md",
        "Idea/.smart-env/multi/Bimba_Seeds_S_S-SHARDING-TASK-LIST_md.ajson",
        "Idea/.smart-env/multi/Bimba_Seeds_S_S-AD-HOC-ROADMAP_md.ajson",
        "Idea/.smart-env/multi/Bimba_Seeds_S_S-SYSTEM-INDEX_md.ajson",
    ] {
        copy_fixture(&repo_root, &env.repo_root, rel);
    }

    let vault_root = env.repo_root.join("Idea");
    let env = env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let output = run_epi(
        [
            "vault",
            "link-suggest",
            "Bimba/Seeds/S/S-AD-HOC-ROADMAP.md",
            "--source-coordinate",
            "[[S-SHARDING-TASK-LIST]]",
            "--limit",
            "5",
        ]
        .as_slice(),
        &env,
    );

    assert!(output.status.success(), "{}", output.stderr);
    assert!(
        output
            .stdout
            .contains("\"target_path\": \"Bimba/Seeds/S/S-SYSTEM-INDEX.md\""),
        "{}",
        output.stdout
    );
    assert!(
        output.stdout.contains("\"kind\": \"explicit_outlink\""),
        "{}",
        output.stdout
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
    assert!(vault_root
        .join("Pratibimba/Self/Thought/T/T4/T4-20260310-090807.md")
        .exists());

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
fn thought_route_with_vak_inlines_keys_in_single_frontmatter_block() {
    // B2 fix integration test. Asserts that when --vak-address-json is
    // supplied, the persisted T-bucket artifact contains exactly ONE
    // ---...--- YAML frontmatter block at the top, AND that block contains
    // BOTH the template keys (coordinate, family, thought_type, ...) AND
    // the seven canonical VAK keys (cpf, ct, cp, cf, cfp, cs_code,
    // cs_direction) in the same map.
    //
    // Before this fix, VAK was prepended to --content as a separate
    // frontmatter block, producing two ---...--- blocks — invisible to
    // standard YAML-frontmatter parsers.
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    // Canonical VAK address — uses (4.0/1-4.4/5) cpf and Night' direction to
    // exercise the serde-rename round-trip for the two enum-typed fields.
    let vak_json = r#"{
        "cpf": "(4.0/1-4.4/5)",
        "ct": ["CT3"],
        "cp": "CP4.3",
        "cf": "(0/1/2/3)",
        "cfp": "CFP0",
        "cs": { "code": "CS3", "direction": "Night'" }
    }"#;

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "3",
            "--content",
            "user thought body\n",
            "--now",
            "2026-03-10T09:08:07Z",
            "--vak-address-json",
            vak_json,
        ]
        .as_slice(),
        &env,
    );
    assert!(
        output.status.success(),
        "thought-route must succeed with --vak-address-json: {}",
        output.stderr
    );

    let persisted_path = vault_root.join("Pratibimba/Self/Thought/T/T3/T3-20260310-090807.md");
    assert!(
        persisted_path.exists(),
        "thought file must be written: {}",
        persisted_path.display()
    );
    let body = fs::read_to_string(&persisted_path).unwrap();

    // 1. Exactly ONE ---...--- frontmatter block at the head.
    assert!(body.starts_with("---\n"), "must start with ---: {body}");
    let after_first_marker = &body[4..];
    let close_offset = after_first_marker
        .find("\n---\n")
        .expect("closing --- marker must exist");
    let frontmatter_block = &after_first_marker[..close_offset];
    let after_close = &after_first_marker[close_offset + 5..];
    assert!(
        !after_close.contains("\n---\n") && !after_close.starts_with("---\n"),
        "must NOT contain a SECOND ---...--- block — got:\n{body}"
    );

    // 2. Parse the single frontmatter block as YAML and assert both
    //    template + VAK keys live in the same map.
    let parsed: serde_yaml::Value = serde_yaml::from_str(frontmatter_block)
        .unwrap_or_else(|err| panic!("frontmatter must be valid YAML: {err}\n{frontmatter_block}"));
    let map = parsed.as_mapping().expect("frontmatter must be a YAML map");

    // Template keys
    for key in &[
        "coordinate",
        "family",
        "artifact_role",
        "ctx_type",
        "thought_type",
    ] {
        assert!(
            map.contains_key(&serde_yaml::Value::String((*key).to_string())),
            "template key `{key}` missing from frontmatter: {frontmatter_block}"
        );
    }
    // VAK keys — all seven canonical prefix keys
    for key in &["cpf", "ct", "cp", "cf", "cfp", "cs_code", "cs_direction"] {
        assert!(
            map.contains_key(&serde_yaml::Value::String((*key).to_string())),
            "VAK key `{key}` missing from frontmatter: {frontmatter_block}"
        );
    }

    // 3. Canonical literals survive serde round-trip
    assert_eq!(
        map.get(&serde_yaml::Value::String("cpf".to_string()))
            .and_then(|v| v.as_str()),
        Some("(4.0/1-4.4/5)"),
        "cpf canonical literal must survive: {frontmatter_block}"
    );
    assert_eq!(
        map.get(&serde_yaml::Value::String("cs_direction".to_string()))
            .and_then(|v| v.as_str()),
        Some("Night'"),
        "cs_direction primed literal Night' must survive: {frontmatter_block}"
    );
    assert_eq!(
        map.get(&serde_yaml::Value::String("cs_code".to_string()))
            .and_then(|v| v.as_str()),
        Some("CS3"),
    );
    let ct_seq = map
        .get(&serde_yaml::Value::String("ct".to_string()))
        .and_then(|v| v.as_sequence())
        .expect("ct must be a YAML sequence");
    assert_eq!(ct_seq.len(), 1);
    assert_eq!(ct_seq[0].as_str(), Some("CT3"));

    // 4. User content appended after the frontmatter block
    assert!(
        body.contains("user thought body"),
        "user content must be preserved verbatim: {body}"
    );
}

#[test]
fn thought_route_summary_lands_in_frontmatter_block() {
    // B2 follow-up: the TS-side schema has carried `summary:
    // Type.Optional(Type.String())` since before cc53d882, but the B2
    // refactor moved VAK rendering to the Rust CLI and silently dropped the
    // summary parameter. This test asserts the contract is now restored:
    // `--summary <s>` is YAML-quoted (via serde_yaml) and emitted in the
    // SAME ---...--- frontmatter block as the template + VAK keys.
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let summary = "concise summary line";
    let vak_json = r#"{
        "cpf": "(4.0/1-4.4/5)",
        "ct": ["CT3"],
        "cp": "CP4.3",
        "cf": "(0/1/2/3)",
        "cfp": "CFP0",
        "cs": { "code": "CS3", "direction": "Day" }
    }"#;

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "3",
            "--content",
            "the actual user content goes here\n",
            "--now",
            "2026-05-22T09:08:07Z",
            "--summary",
            summary,
            "--vak-address-json",
            vak_json,
        ]
        .as_slice(),
        &env,
    );
    assert!(
        output.status.success(),
        "thought-route should succeed with summary + VAK: {}",
        output.stderr
    );

    let persisted_path = vault_root.join("Pratibimba/Self/Thought/T/T3/T3-20260522-090807.md");
    assert!(
        persisted_path.exists(),
        "thought file must be written: {}",
        persisted_path.display()
    );
    let body = fs::read_to_string(&persisted_path).unwrap();

    // 1. Exactly ONE ---...--- frontmatter block at the head (no regression
    //    of the B2 double-frontmatter bug).
    assert!(body.starts_with("---\n"), "must start with ---:\n{body}");
    let after_first_marker = &body[4..];
    let close_offset = after_first_marker
        .find("\n---\n")
        .expect("closing --- marker must exist");
    let frontmatter_block = &after_first_marker[..close_offset];
    let after_close = &after_first_marker[close_offset + 5..];
    assert!(
        !after_close.contains("\n---\n") && !after_close.starts_with("---\n"),
        "must NOT contain a SECOND ---...--- block — got:\n{body}"
    );

    // 2. Parse frontmatter as YAML, assert summary AND VAK keys live in the
    //    same map.
    let parsed: serde_yaml::Value = serde_yaml::from_str(frontmatter_block)
        .unwrap_or_else(|err| panic!("frontmatter must be valid YAML: {err}\n{frontmatter_block}"));
    let map = parsed.as_mapping().expect("frontmatter must be a YAML map");

    assert_eq!(
        map.get(serde_yaml::Value::String("summary".to_string()))
            .and_then(|v| v.as_str()),
        Some(summary),
        "summary key must round-trip via YAML: {frontmatter_block}"
    );

    // VAK keys still present alongside summary
    for key in &["cpf", "ct", "cp", "cf", "cfp", "cs_code", "cs_direction"] {
        assert!(
            map.contains_key(serde_yaml::Value::String((*key).to_string())),
            "VAK key `{key}` missing from frontmatter: {frontmatter_block}"
        );
    }
}

#[test]
fn thought_route_summary_yaml_quotes_special_characters() {
    // Summaries containing quotes, colons, and other YAML-significant chars
    // must survive a YAML round-trip — serde_yaml handles the quoting; we
    // verify the resulting frontmatter parses and the value matches.
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let tricky = "tricky: has \"quotes\" and: colons";
    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "0",
            "--content",
            "x\n",
            "--now",
            "2026-05-22T09:08:07Z",
            "--summary",
            tricky,
        ]
        .as_slice(),
        &env,
    );
    assert!(output.status.success(), "{}", output.stderr);

    let persisted_path = vault_root.join("Pratibimba/Self/Thought/T/T0/T0-20260522-090807.md");
    let body = fs::read_to_string(&persisted_path).unwrap();
    let after_first_marker = &body[4..];
    let close_offset = after_first_marker.find("\n---\n").unwrap();
    let frontmatter_block = &after_first_marker[..close_offset];
    let parsed: serde_yaml::Value =
        serde_yaml::from_str(frontmatter_block).expect("must be valid YAML");
    let map = parsed.as_mapping().unwrap();
    assert_eq!(
        map.get(serde_yaml::Value::String("summary".to_string()))
            .and_then(|v| v.as_str()),
        Some(tricky),
        "tricky summary must survive YAML round-trip: {frontmatter_block}"
    );
}

#[test]
fn thought_route_without_summary_omits_summary_key() {
    // Dialogical pass-through: when --summary is OMITTED, no `summary:` key
    // is emitted in the frontmatter (parallel to the no-VAK pass-through).
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "2",
            "--content",
            "no summary content\n",
            "--now",
            "2026-05-22T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );
    assert!(output.status.success(), "{}", output.stderr);

    let persisted_path = vault_root.join("Pratibimba/Self/Thought/T/T2/T2-20260522-090807.md");
    let body = fs::read_to_string(&persisted_path).unwrap();
    let after_first_marker = &body[4..];
    let close_offset = after_first_marker.find("\n---\n").unwrap();
    let frontmatter_block = &after_first_marker[..close_offset];
    let parsed: serde_yaml::Value =
        serde_yaml::from_str(frontmatter_block).expect("must be valid YAML");
    let map = parsed.as_mapping().unwrap();
    assert!(
        !map.contains_key(serde_yaml::Value::String("summary".to_string())),
        "summary key should be absent when --summary not provided: {frontmatter_block}"
    );
}

#[test]
fn thought_route_rejects_malformed_vak_address_json() {
    // Parse failure on --vak-address-json must surface as non-zero exit
    // (consistent with malformed --now behaviour). Callers that have no
    // VAK should OMIT the flag entirely (dialogical pass-through), not
    // pass garbage.
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "0",
            "--content",
            "x",
            "--now",
            "2026-03-10T09:08:07Z",
            "--vak-address-json",
            "{ not valid json",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        !output.status.success(),
        "malformed --vak-address-json must fail: stdout={} stderr={}",
        output.stdout,
        output.stderr
    );
    assert!(
        output.stderr.contains("invalid --vak-address-json"),
        "expected parse error message, got stderr: {}",
        output.stderr
    );
}

#[test]
fn thought_route_without_vak_omits_vak_keys() {
    // Dialogical pass-through: when --vak-address-json is OMITTED, the
    // persisted artifact has the template frontmatter block UNCHANGED —
    // no VAK keys, no extra ---...--- block.
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let vault_root = env.root.join("vault");

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "1",
            "--content",
            "dialogical thought\n",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );
    assert!(output.status.success(), "{}", output.stderr);

    let path = vault_root.join("Pratibimba/Self/Thought/T/T1/T1-20260310-090807.md");
    let body = fs::read_to_string(&path).unwrap();
    for key in &["cpf:", "cs_code:", "cs_direction:", "cfp:"] {
        assert!(
            !body.contains(key),
            "no-VAK call must NOT emit `{key}` — got:\n{body}"
        );
    }
    // Template keys still present
    assert!(body.contains("thought_type: \"T1\""), "{body}");
}

#[test]
fn thought_route_rejects_positions_outside_t0_to_t5() {
    let base_env = env_with_fake_obsidian_cli();
    let vault_root = base_env.root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let output = run_epi(
        [
            "vault",
            "thought-route",
            "--position",
            "6",
            "--content",
            "bad bucket",
            "--now",
            "2026-03-10T09:08:07Z",
        ]
        .as_slice(),
        &env,
    );

    assert!(!output.status.success());
    assert!(
        output
            .stderr
            .contains("thought position must be T0 through T5"),
        "wrong error: {}",
        output.stderr
    );
    assert!(!vault_root.join("Pratibimba/Self/Thought/T/T5").exists());
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
    let env = env_with_fake_obsidian_cli().with_env("EPI_VAULT_NAME", "MyVault");
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
    assert!(
        log.contains("-v"),
        "expected -v flag from autodetect: {log}"
    );
}

#[test]
fn vault_set_default_does_not_inject_vault_flag() {
    let env = env_with_fake_obsidian_cli().with_env("EPI_VAULT_NAME", "MyVault");
    let _ = run_epi(["vault", "set-default", "OtherVault"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // set-default must NOT receive -v (it IS the vault config command)
    assert!(
        !log.contains("-v"),
        "set-default must not get -v injected: {log}"
    );
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
        idea_dir
            .join("Empty/Present/04-04-2026/daily-note.md")
            .exists(),
        "daily-note must be in repo_root/Idea, got stdout: {}",
        result.stdout
    );
}
