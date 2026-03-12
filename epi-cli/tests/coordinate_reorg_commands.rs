mod common;

use common::{run_epi, write_file, TestEnv};
use std::fs;

#[test]
fn gate_kairos_status_reads_temporal_state_from_pasu() {
    let env = TestEnv::repo_with_assets();
    let vault_root = env.root.join("vault");
    let env = env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    write_file(
        vault_root.join("Pratibimba/Self/PASU.md"),
        "---\ncoordinate: \"PASU\"\nc_0_birth_date: \"1990-06-15\"\nc_0_birth_location: \"Berlin, Germany\"\nc_0_natal_chart_path: \"Pratibimba/Self/natal-chart.json\"\n---\n\n# PASU\n",
    );
    write_file(
        vault_root.join("Pratibimba/Self/natal-chart.json"),
        r#"{"sun_degree":168.4,"moon_degree":42.1,"planet_degrees":[168.4,42.1,155.2,190.3,45.6,210.7,300.2],"planet_valid":127}"#,
    );

    let result = run_epi(["gate", "kairos", "status"].as_slice(), &env);
    assert!(
        result.status.success(),
        "gate kairos status must succeed: {}",
        result.stderr
    );
    assert!(
        result.stdout.contains("mode: natal"),
        "expected natal kairos output, got: {}",
        result.stdout
    );
    assert!(
        result.stdout.contains("planet_valid: 0x7f"),
        "expected natal chart bitmask, got: {}",
        result.stdout
    );
}

#[test]
fn vault_no_longer_exposes_kairos_subcommands() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["vault", "kairos", "status"].as_slice(), &env);
    assert!(
        !result.status.success(),
        "vault kairos should be removed from the command surface"
    );
    assert!(
        result.stderr.contains("unrecognized subcommand 'kairos'"),
        "expected clap to reject vault kairos, got: {}",
        result.stderr
    );
}

#[test]
fn agent_techne_notebook_list_uses_notebooklm_proxy() {
    let env = TestEnv::repo_with_assets();
    let bin_dir = env.root.join("bin");
    fs::create_dir_all(&bin_dir).unwrap();
    let argv_path = env.root.join("notebook.argv");
    common::write_executable(
        bin_dir.join("notebooklm"),
        &format!(
            "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"{}\"\nprintf 'Notebook A\\n'",
            argv_path.display()
        ),
    );

    let env = env
        .with_env(
            "EPI_NOTEBOOKLM_BIN",
            bin_dir.join("notebooklm").display().to_string(),
        )
        .with_env("PATH", format!("{}:{}", bin_dir.display(), std::env::var("PATH").unwrap_or_default()));

    let result = run_epi(["agent", "techne", "notebook", "list"].as_slice(), &env);
    assert!(
        result.status.success(),
        "agent techne notebook list must succeed: {}",
        result.stderr
    );
    assert!(
        result.stdout.contains("Notebook A"),
        "expected notebook proxy output, got: {}",
        result.stdout
    );
    let argv = fs::read_to_string(argv_path).unwrap();
    assert_eq!(argv.trim(), "list");
}

#[test]
fn standalone_notebook_command_is_removed() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["notebook", "list"].as_slice(), &env);
    assert!(
        !result.status.success(),
        "top-level notebook command should be removed"
    );
    assert!(
        result.stderr.contains("unrecognized subcommand 'notebook'"),
        "expected clap to reject notebook, got: {}",
        result.stderr
    );
}

#[test]
fn techne_no_longer_exposes_gnosis_subcommands() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["techne", "gnosis", "status"].as_slice(), &env);
    assert!(
        !result.status.success(),
        "top-level techne gnosis surface should be removed"
    );
    assert!(
        result.stderr.contains("unrecognized subcommand 'gnosis'"),
        "expected clap to reject techne gnosis, got: {}",
        result.stderr
    );
}

#[test]
fn standalone_vimarsa_command_is_removed() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["vimarsa", "list"].as_slice(), &env);
    assert!(
        !result.status.success(),
        "top-level vimarsa surface should be removed"
    );
    assert!(
        result.stderr.contains("unrecognized subcommand 'vimarsa'"),
        "expected clap to reject vimarsa, got: {}",
        result.stderr
    );
}

#[test]
fn agent_techne_code_codex_dispatches_provider_profile() {
    let env = TestEnv::repo_with_assets();
    let bin_dir = env.root.join("bin");
    fs::create_dir_all(&bin_dir).unwrap();
    let argv_path = env.root.join("claude.argv");
    common::write_executable(
        bin_dir.join("claude"),
        &format!(
            "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"{}\"\nprintf 'claude-ok\\n'",
            argv_path.display()
        ),
    );
    write_file(env.home.join(".claude/profiles/codex.conf"), "# codex profile\n");

    let env = env.with_env(
        "PATH",
        format!("{}:{}", bin_dir.display(), std::env::var("PATH").unwrap_or_default()),
    );

    let result = run_epi(["agent", "techne", "code", "codex", "ping"].as_slice(), &env);
    assert!(
        result.status.success(),
        "agent techne code codex must succeed: {}",
        result.stderr
    );
    assert!(
        result.stdout.contains("claude-ok"),
        "expected fake claude output, got: {}",
        result.stdout
    );
    let argv = fs::read_to_string(argv_path).unwrap();
    assert_eq!(argv.trim(), "ping");
}

#[test]
fn graph_redis_flush_calls_semantic_cache_bridge() {
    let env = TestEnv::repo_with_assets();
    let script_path = env.root.join("semantic_cache.py");
    let log_path = env.root.join("semantic_cache.log");
    write_file(
        &script_path,
        &format!(
            "import json, pathlib, sys\npathlib.Path({log:?}).write_text(sys.argv[1])\nif sys.argv[1] == 'flush':\n    print(json.dumps({{'ok': True}}))\nelse:\n    print(json.dumps({{'ok': False, 'error': 'unexpected'}}))\n    sys.exit(1)\n",
            log = log_path.display().to_string()
        ),
    );

    let env = env
        .with_env("EPILOGOS_SEMANTIC_CACHE_REDIS_URL", "redis://127.0.0.1:6379")
        .with_env(
            "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
            script_path.display().to_string(),
        )
        .with_env("EPILOGOS_SEMANTIC_CACHE_PYTHON", "python3");

    let result = run_epi(["graph", "redis", "flush"].as_slice(), &env);
    assert!(
        result.status.success(),
        "graph redis flush must succeed: {}",
        result.stderr
    );
    assert!(
        result.stdout.contains("flushed"),
        "expected flush confirmation, got: {}",
        result.stdout
    );
    assert_eq!(fs::read_to_string(log_path).unwrap().trim(), "flush");
}

#[test]
fn graph_redis_status_reports_bridge_health_in_json() {
    let env = TestEnv::repo_with_assets();
    let script_path = env.root.join("semantic_cache.py");
    write_file(
        &script_path,
        "import json, sys\nif sys.argv[1] != 'health':\n    raise SystemExit(1)\nprint(json.dumps({'ok': True, 'python': 'python3', 'redis_url': 'redis://127.0.0.1:6379', 'cache_name': 'epi_semantic_cache', 'redis_ping': True, 'redis_stack': True, 'search_indexes': ['idx:epi_semantic_cache'], 'filterable_fields': ['graph_revision'], 'error': None}))\n",
    );

    let env = env
        .with_env("EPILOGOS_SEMANTIC_CACHE_REDIS_URL", "redis://127.0.0.1:6379")
        .with_env(
            "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
            script_path.display().to_string(),
        )
        .with_env("EPILOGOS_SEMANTIC_CACHE_PYTHON", "python3");

    let result = run_epi(["--json", "graph", "redis", "status"].as_slice(), &env);
    assert!(
        result.status.success(),
        "graph redis status must succeed: {}",
        result.stderr
    );
    let payload: serde_json::Value = serde_json::from_str(&result.stdout).unwrap();
    assert!(payload["redis"].is_object());
    assert!(payload["redisStack"].is_object());
    assert_eq!(payload["semanticCache"]["health"]["ok"], true);
    assert_eq!(payload["semanticCache"]["health"]["redis_stack"], true);
}

#[test]
fn graph_redis_stats_reports_hot_warm_cold_tiers() {
    let env = TestEnv::repo_with_assets();
    let result = run_epi(["--json", "graph", "redis", "stats"].as_slice(), &env);
    assert!(
        result.status.success(),
        "graph redis stats must succeed: {}",
        result.stderr
    );
    let payload: serde_json::Value = serde_json::from_str(&result.stdout).unwrap();
    assert_eq!(payload["tiers"]["hot"]["prefix"], "cache:hot");
    assert_eq!(payload["tiers"]["hot"]["ttlSeconds"], 300);
    assert_eq!(payload["tiers"]["warm"]["prefix"], "cache:warm");
    assert_eq!(payload["tiers"]["cold"]["prefix"], "cache:cold");
}

#[test]
fn epii_gnosis_context_create_ingest_and_query_use_local_store() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPILOGOS_VAULT", "/tmp/gnosis-vault")
        .with_env("EPILOGOS_ROOT", "/tmp")
        .with_env("EPI_GNOSIS_CHUNK_WORDS", "4")
        .with_env("EPI_GNOSIS_OVERLAP_WORDS", "1");

    let source = write_file(
        env.repo_root.join("fixtures/source.md"),
        "# Intro\nalpha beta gamma delta\n\n## Detail\nbeta gamma delta epsilon\n",
    );

    let create = run_epi(
        ["epii", "gnosis", "context", "create", "Research"].as_slice(),
        &env,
    );
    assert!(create.status.success(), "{}", create.stderr);
    assert!(create.stdout.contains("Research"));

    let list = run_epi(["epii", "gnosis", "context", "list"].as_slice(), &env);
    assert!(list.status.success(), "{}", list.stderr);
    assert!(list.stdout.contains("Research"));

    let ingest = run_epi(
        [
            "epii",
            "gnosis",
            "ingest",
            source.to_str().unwrap(),
            "--context",
            "Research",
            "--source-type",
            "Books",
        ]
        .as_slice(),
        &env,
    );
    assert!(ingest.status.success(), "{}", ingest.stderr);
    assert!(ingest.stdout.contains("stored"));

    let query = run_epi(
        [
            "epii",
            "gnosis",
            "query",
            "gamma epsilon",
            "--context",
            "Research",
        ]
        .as_slice(),
        &env,
    );
    assert!(query.status.success(), "{}", query.stderr);
    assert!(query.stdout.contains("Detail"));
}

#[test]
fn epii_vimarsa_list_delegates_to_kbase_script() {
    let env = TestEnv::repo_with_assets();
    let script_path = env.root.join("kbase.sh");
    let argv_path = env.root.join("kbase.argv");
    common::write_executable(
        &script_path,
        &format!(
            "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"{}\"\nprintf 'project-a\\n'",
            argv_path.display()
        ),
    );
    let env = env.with_env("EPI_VIMARSA_SCRIPT", script_path.display().to_string());

    let result = run_epi(["epii", "vimarsa", "list"].as_slice(), &env);
    assert!(result.status.success(), "{}", result.stderr);
    assert!(result.stdout.contains("project-a"));
    assert_eq!(fs::read_to_string(argv_path).unwrap().trim(), "list");
}

#[test]
fn epii_knowing_json_outputs_dossier_facets() {
    let env = TestEnv::empty();
    let output = run_epi(&["--json", "epii", "knowing", "C1"], &env);

    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let json: serde_json::Value = serde_json::from_str(&output.stdout).unwrap();
    assert_eq!(json["coordinate"], "C1");
    assert!(json["essence"]["text"].as_str().is_some());
    assert!(json["relational_field"].is_object());
    assert!(json["vimarsa_field"].is_object());
    assert!(json["notebook_pulse"].is_object());
}

#[test]
fn epii_knowing_reads_q_metadata_from_matching_vault_note() {
    let env = TestEnv::repo_with_assets();
    let vault_root = env.root.join("vault");
    let env = env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    write_file(
        vault_root.join("Bimba/Seeds/M/M5.md"),
        "---\ncoordinate: \"M5\"\nfamily: \"M\"\nq_essence: \"Self-knowing\"\nq_correspondence: \"M5 harmonises S5\"\nq_vimarsa_field: \"Reflective bridge\"\n---\n\n# M5\n",
    );

    let output = run_epi(&["epii", "knowing", "M5"], &env);
    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );
    assert!(output.stdout.contains("Self-knowing"));
    assert!(output.stdout.contains("M5 harmonises S5"));
}

#[test]
fn stub_domain_commands_report_identity_and_coordinate() {
    let env = TestEnv::empty();
    for (command, subcommand, expected) in [
        ("anuttara", "ground", "M0' Anuttara"),
        ("paramasiva", "form", "M1' Paramasiva"),
        ("parashakti", "entity", "M2' Parashakti"),
        ("mahamaya", "process", "M3' Mahamaya"),
    ] {
        let output = run_epi(&[command, subcommand], &env);
        assert!(
            output.status.success(),
            "command {command} {subcommand} failed: {}",
            output.stderr
        );
        assert!(
            output.stdout.contains(expected),
            "expected {expected} in output for {command}: {}",
            output.stdout
        );
        assert!(
            output.stdout.contains("Stub: full implementation pending."),
            "expected stub notice for {command}: {}",
            output.stdout
        );
    }
}
