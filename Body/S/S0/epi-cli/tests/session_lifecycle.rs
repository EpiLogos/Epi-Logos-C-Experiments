use chrono::{TimeZone, Utc};
use epi_logos::agent::session_propagation::{
    default_agent_gateway_session_key, propagate_agent_session_runtime, GatewaySessionPropagation,
    GatewaySessionPropagationOperation,
};
use epi_logos::gate::sessions::SessionStore;
use epi_logos::gate::spacetimedb_bridge::SpacetimeBridge;
use epi_logos::sesh::session::{
    bootstrap_sequence, generate_session_id_with_suffix, resolve_vault_root,
    AgentSessionRuntimeFactory, AgentSessionRuntimeRequest, SessionContext,
};
use epi_s3_gateway_contract::RedisTemporalContextRole;
use redis::AsyncCommands;
use std::collections::BTreeMap;
use std::env;
use std::ffi::OsString;
use std::fs;
use std::path::PathBuf;

#[test]
fn session_id_matches_required_format() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let session_id = generate_session_id_with_suffix(now, "abc123");
    assert_eq!(session_id, "20260310-090807-abc123");
}

#[test]
fn session_context_derives_day_id_and_now_path() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let vault_root = PathBuf::from("/tmp/vault");
    let context = SessionContext::new_for_tests(now, "abc123", &vault_root);

    assert_eq!(context.session_id, "20260310-090807-abc123");
    assert_eq!(context.day_id, "10-03-2026");
    assert_eq!(
        context.now_path,
        vault_root.join("Empty/Present/10-03-2026/20260310-090807-abc123/now.md")
    );
}

#[test]
fn explicit_vault_root_is_authoritative_before_directory_exists() {
    let vault_root = std::env::temp_dir().join(format!(
        "epi-explicit-vault-root-{}-missing",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&vault_root);
    assert!(
        !vault_root.exists(),
        "test setup requires an absent explicit vault root"
    );

    let mut env_map = BTreeMap::new();
    env_map.insert(
        "EPILOGOS_VAULT".to_string(),
        vault_root.display().to_string(),
    );

    assert_eq!(resolve_vault_root(&env_map), vault_root);
}

#[test]
fn bootstrap_sequence_uses_specified_order() {
    let now_path = PathBuf::from("/vault/Empty/Present/10-03-2026/20260310-090807-abc123/now.md");
    let artifacts = bootstrap_sequence(PathBuf::from("/repo").as_path(), now_path.as_path());
    let names: Vec<_> = artifacts
        .iter()
        .map(|artifact| artifact.name.as_str())
        .collect();

    assert_eq!(
        names,
        vec![
            "CONTINUATION.md",
            "ANIMA.md",
            "PARADIGM.md",
            "PASU",
            "NOW.md",
            "TOOLS.md",
        ]
    );
    assert_eq!(artifacts[4].path, now_path);
}

#[test]
fn elapsed_summary_is_human_readable() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let later = Utc.with_ymd_and_hms(2026, 3, 10, 10, 10, 10).unwrap();
    let vault_root = PathBuf::from("/tmp/vault");
    let context = SessionContext::new_for_tests(now, "abc123", &vault_root);

    assert_eq!(context.elapsed_summary(later), "1h 2m 3s");
}

#[test]
fn session_id_follows_datetime_prefix_format() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 14, 30, 0).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    let ctx = SessionContext::new(now, Some("tst01"), &vault);
    // Format: {YYYYMMDD-HHmmss-randomId}
    assert!(
        ctx.session_id.starts_with("20260310-143000-"),
        "got: {}",
        ctx.session_id
    );
    assert_eq!(ctx.day_id, "10-03-2026");
}

#[test]
fn now_path_nested_under_day_folder() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 14, 30, 0).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    let ctx = SessionContext::new(now, Some("tst01"), &vault);
    let expected = vault.join("Empty/Present/10-03-2026/20260310-143000-tst01/now.md");
    assert_eq!(ctx.now_path, expected);
}

#[test]
fn bootstrap_sequence_returns_ordered_artifacts() {
    let tmp = std::env::temp_dir().join("epi-bootstrap-test");
    let _ = fs::remove_dir_all(&tmp);
    fs::create_dir_all(&tmp).unwrap();
    // Create ANIMA.md and PASU.md (CONTINUATION absent — should be skipped)
    fs::write(tmp.join("ANIMA.md"), "# ANIMA\n").unwrap();
    fs::write(tmp.join("PASU.md"), "# PASU\n").unwrap();
    let now_path = tmp.join("Empty/Present/10-03-2026/20260310-143000-tst01/now.md");
    fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    fs::write(&now_path, "# NOW\n").unwrap();

    let seq = bootstrap_sequence(&tmp, &now_path);
    let names: Vec<&str> = seq.iter().map(|a| a.name.as_str()).collect();
    // Bootstrap uses PASU (non-dual agent-user field), NOT MEMORY
    assert!(
        names.iter().any(|n| n.contains("PASU")),
        "bootstrap must include PASU, got: {:?}",
        names
    );
    assert!(
        !names.iter().any(|n| n.contains("MEMORY")),
        "bootstrap must NOT include MEMORY (use PASU instead), got: {:?}",
        names
    );
    // ANIMA must come before PASU in ordering
    let anima_pos = names.iter().position(|n| n.contains("ANIMA")).unwrap();
    let pasu_pos = names.iter().position(|n| n.contains("PASU")).unwrap();
    assert!(anima_pos < pasu_pos, "ANIMA must come before PASU");
}

#[test]
fn agent_session_runtime_factory_recreates_cwd_bound_runtime_idempotently() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-factory-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo_a = root.join("repo-a");
    let repo_b = root.join("repo-b");
    let vault_a = repo_a.join("Idea");
    let vault_b = repo_b.join("Idea");
    let anima_agent_dir = repo_a.join(".epi/agents/anima/agent");
    fs::create_dir_all(&vault_a).unwrap();
    fs::create_dir_all(&vault_b).unwrap();
    fs::create_dir_all(&anima_agent_dir).unwrap();
    fs::write(
        anima_agent_dir.join("models.json"),
        r#"{"defaultModel":"zai/glm-4.5","providers":[]}"#,
    )
    .unwrap();

    let factory = AgentSessionRuntimeFactory::new();
    let now = Utc.with_ymd_and_hms(2026, 5, 7, 12, 0, 0).unwrap();

    let first = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now,
            random_suffix: Some("root01".to_owned()),
            force_new: false,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let second = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 7, 12, 5, 0).unwrap(),
            random_suffix: None,
            force_new: false,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let other_cwd = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_b.clone(),
            now,
            random_suffix: Some("other1".to_owned()),
            force_new: false,
            agent_id: Some("main".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();

    assert_eq!(first.context.session_id, "20260507-120000-root01");
    assert_eq!(first.now_write, "created");
    assert_eq!(
        second.context.session_id, first.context.session_id,
        "same cwd/day should reuse the existing Khora runtime"
    );
    assert_eq!(second.now_write, "reused");
    assert_eq!(second.effective_cwd, repo_a);
    assert_eq!(second.vault_root, vault_a);
    assert_eq!(second.pi_session.event, "session_start");
    assert_eq!(second.pi_session.agent_id, "anima");
    assert_eq!(second.pi_session.agent_dir, anima_agent_dir);
    assert_eq!(
        second.pi_session.plugin_runtime_path,
        second.pi_session.agent_dir.join("plugin-runtime.json")
    );
    assert_eq!(
        second.pi_session.default_model.as_deref(),
        Some("zai/glm-4.5")
    );
    assert!(second
        .pi_session
        .resource_loader_id
        .contains(".epi/agents/anima/agent/plugin-runtime.json"));
    assert_eq!(other_cwd.effective_cwd, repo_b);
    assert_eq!(other_cwd.vault_root, vault_b);
    assert_eq!(
        other_cwd.pi_session.agent_dir,
        other_cwd.effective_cwd.join(".epi/agents/main/agent")
    );
    assert_ne!(
        other_cwd.context.now_path, first.context.now_path,
        "effective cwd must recreate cwd-bound vault/session services"
    );
    assert!(second
        .diagnostics
        .iter()
        .any(|diagnostic| diagnostic.message.contains("reused existing NOW")));

    let day_dir = vault_a.join("Empty/Present/07-05-2026");
    let now_files: Vec<_> = fs::read_dir(day_dir)
        .unwrap()
        .filter_map(Result::ok)
        .map(|entry| entry.path().join("now.md"))
        .filter(|path| path.exists())
        .collect();
    assert_eq!(
        now_files.len(),
        1,
        "same cwd/day session_start reuse must not create duplicate NOW roots"
    );
}

#[test]
fn resource_loader_identity_is_stable_and_scoped_by_cwd_agent_and_plugin_runtime() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-resource-loader-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo_a = root.join("repo-a");
    let repo_b = root.join("repo-b");
    let shared_epi_home = root.join("shared-epi-home");
    let anima_agent_dir = shared_epi_home.join("agents/anima/agent");
    let epii_agent_dir = shared_epi_home.join("agents/epii/agent");
    fs::create_dir_all(repo_a.join("Idea")).unwrap();
    fs::create_dir_all(repo_b.join("Idea")).unwrap();
    fs::create_dir_all(&anima_agent_dir).unwrap();
    fs::create_dir_all(&epii_agent_dir).unwrap();
    fs::write(
        repo_a.join(".epi-logos.env"),
        format!("EPI_AGENT_HOME={}\n", shared_epi_home.display()),
    )
    .unwrap();
    fs::write(
        repo_b.join(".epi-logos.env"),
        format!("EPI_AGENT_HOME={}\n", shared_epi_home.display()),
    )
    .unwrap();

    let factory = AgentSessionRuntimeFactory::new();
    let anima_a_first = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 7, 13, 0, 0).unwrap(),
            random_suffix: Some("rl0001".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let anima_a_second = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 7, 13, 5, 0).unwrap(),
            random_suffix: Some("rl0002".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("resource_reload".to_owned()),
        })
        .unwrap();
    let epii_a = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 7, 13, 10, 0).unwrap(),
            random_suffix: Some("rl0003".to_owned()),
            force_new: true,
            agent_id: Some("epii".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let anima_b = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_b.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 7, 13, 15, 0).unwrap(),
            random_suffix: Some("rl0004".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();

    assert_eq!(
        anima_a_first.pi_session.resource_loader_id, anima_a_second.pi_session.resource_loader_id,
        "same effective cwd, agent id, and plugin runtime path must keep one loader identity"
    );
    assert_ne!(
        anima_a_first.pi_session.resource_loader_id, epii_a.pi_session.resource_loader_id,
        "agent id and plugin runtime path are part of the loader identity"
    );
    assert_ne!(
        anima_a_first.pi_session.resource_loader_id, anima_b.pi_session.resource_loader_id,
        "effective cwd is part of the loader identity even when EPI_AGENT_HOME is shared"
    );

    let repo_a_fragment = repo_a.to_string_lossy().replace('\\', "/");
    let plugin_fragment = anima_agent_dir
        .join("plugin-runtime.json")
        .to_string_lossy()
        .replace('\\', "/");
    assert!(
        anima_a_first
            .pi_session
            .resource_loader_id
            .contains(&repo_a_fragment),
        "loader identity must disclose the effective cwd input"
    );
    assert!(
        anima_a_first
            .pi_session
            .resource_loader_id
            .contains(&plugin_fragment),
        "loader identity must disclose the plugin runtime input"
    );
}

#[test]
fn pi_runtime_propagation_merges_gateway_identity_without_duplicate_aliases() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-propagation-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo = root.join("repo");
    let vault = repo.join("Idea");
    let gate_root = root.join("gate");
    let anima_agent_dir = repo.join(".epi/agents/anima/agent");
    fs::create_dir_all(&vault).unwrap();
    fs::create_dir_all(&anima_agent_dir).unwrap();
    fs::write(
        anima_agent_dir.join("models.json"),
        r#"{"defaultModel":"zai/glm-4.5","providers":[]}"#,
    )
    .unwrap();

    let runtime = AgentSessionRuntimeFactory::new()
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 8, 8, 30, 0).unwrap(),
            random_suffix: Some("prop01".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();

    let first = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: gate_root.clone(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: None,
            label: None,
        },
    )
    .unwrap();
    let second = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: gate_root.clone(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: None,
            label: None,
        },
    )
    .unwrap();

    assert_eq!(
        first.canonical_key,
        default_agent_gateway_session_key("anima")
    );
    assert_eq!(second.aliases, first.aliases);
    assert_eq!(
        second
            .aliases
            .iter()
            .filter(|alias| *alias == &runtime.context.session_id)
            .count(),
        1
    );
    assert_eq!(
        second
            .aliases
            .iter()
            .filter(|alias| alias.as_str() == "DAY-08-05-2026")
            .count(),
        1
    );
    assert_eq!(second.session_id, runtime.context.session_id);
    assert_eq!(second.day_id.as_deref(), Some("08-05-2026"));
    assert_eq!(second.active_agent_id, "anima");
    assert_eq!(second.runtime_cwd.as_deref(), Some(repo.to_str().unwrap()));
    assert_eq!(second.vault_root.as_deref(), Some(vault.to_str().unwrap()));
    assert_eq!(
        second.vault_now_path.as_deref(),
        Some(runtime.context.now_path.to_str().unwrap())
    );
    assert_eq!(
        second.resource_loader_id.as_deref(),
        Some(runtime.pi_session.resource_loader_id.as_str())
    );
    assert_eq!(second.model_override.as_deref(), Some("zai/glm-4.5"));
    assert!(second.diagnostics.iter().any(|diagnostic| diagnostic
        .get("source")
        .and_then(|value| value.as_str())
        == Some("khora.agent_session_runtime")));

    let stored = SessionStore::new(&gate_root)
        .unwrap()
        .resolve(&runtime.context.session_id)
        .unwrap();
    assert_eq!(stored.canonical_key, second.canonical_key);

    let events = SpacetimeBridge::new(&gate_root)
        .unwrap()
        .drain_test_events()
        .unwrap();
    let session_surface_event = events
        .iter()
        .find(|event| {
            event.kind == "session_surface"
                && event.payload["canonicalKey"] == default_agent_gateway_session_key("anima")
                && event.payload["sessionId"] == runtime.context.session_id
        })
        .expect("PI propagation should publish a session_surface event");
    assert_eq!(session_surface_event.payload["dayId"], "08-05-2026");
    assert_eq!(
        session_surface_event.payload["vaultNowPath"],
        runtime.context.now_path.to_str().unwrap()
    );
    assert_eq!(
        session_surface_event.payload["runtimeCwd"],
        repo.to_str().unwrap()
    );
    assert_eq!(
        session_surface_event.payload["vaultRoot"],
        vault.to_str().unwrap()
    );
    assert_eq!(session_surface_event.payload["activeAgentId"], "anima");
    assert_eq!(
        session_surface_event.payload["resourceLoaderId"],
        runtime.pi_session.resource_loader_id
    );
    assert!(session_surface_event.payload["diagnostics"]
        .as_array()
        .unwrap()
        .iter()
        .any(|diagnostic| diagnostic["source"] == "khora.agent_session_runtime"));

    let session_surface_events = events
        .iter()
        .filter(|event| {
            event.kind == "session_surface"
                && event.payload["canonicalKey"] == default_agent_gateway_session_key("anima")
                && event.payload["sessionId"] == runtime.context.session_id
                && event.payload["resourceLoaderId"] == runtime.pi_session.resource_loader_id
        })
        .count();
    assert_eq!(
        session_surface_events, 2,
        "every PI runtime propagation write should project a session_surface event"
    );
}

#[test]
fn pi_runtime_propagation_recreates_cwd_bound_identity_for_distinct_repos() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-cwd-propagation-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo_a = root.join("repo-a");
    let repo_b = root.join("repo-b");
    let gate_root = root.join("shared-gateway");
    let anima_agent_dir = repo_a.join(".epi/agents/anima/agent");
    let epii_agent_dir = repo_b.join(".epi/agents/epii/agent");
    fs::create_dir_all(repo_a.join("Idea")).unwrap();
    fs::create_dir_all(repo_b.join("Idea")).unwrap();
    fs::create_dir_all(&anima_agent_dir).unwrap();
    fs::create_dir_all(&epii_agent_dir).unwrap();
    fs::write(
        anima_agent_dir.join("models.json"),
        r#"{"defaultModel":"zai/glm-4.5","providers":[]}"#,
    )
    .unwrap();
    fs::write(
        epii_agent_dir.join("models.json"),
        r#"{"defaultModel":"openai/gpt-5.2","providers":[]}"#,
    )
    .unwrap();

    let factory = AgentSessionRuntimeFactory::new();
    let anima_runtime = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_a.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 8, 8, 30, 0).unwrap(),
            random_suffix: Some("cwd001".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let epii_runtime = factory
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo_b.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 8, 8, 45, 0).unwrap(),
            random_suffix: Some("cwd002".to_owned()),
            force_new: true,
            agent_id: Some("epii".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();

    let anima_record = propagate_agent_session_runtime(
        &anima_runtime,
        GatewaySessionPropagation {
            state_root: gate_root.clone(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: Some("agent:anima:cwd-a".to_owned()),
            label: None,
        },
    )
    .unwrap();
    let epii_record = propagate_agent_session_runtime(
        &epii_runtime,
        GatewaySessionPropagation {
            state_root: gate_root.clone(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: Some("agent:epii:cwd-b".to_owned()),
            label: None,
        },
    )
    .unwrap();
    let anima_vault = repo_a.join("Idea");
    let epii_vault = repo_b.join("Idea");

    assert_eq!(
        anima_record.runtime_cwd.as_deref(),
        Some(repo_a.to_str().unwrap())
    );
    assert_eq!(
        epii_record.runtime_cwd.as_deref(),
        Some(repo_b.to_str().unwrap())
    );
    assert_eq!(
        anima_record.vault_root.as_deref(),
        Some(anima_vault.to_str().unwrap())
    );
    assert_eq!(
        epii_record.vault_root.as_deref(),
        Some(epii_vault.to_str().unwrap())
    );
    assert_eq!(
        anima_runtime.pi_session.gate_state_root,
        repo_a.join(".epi/gate")
    );
    assert_eq!(
        epii_runtime.pi_session.gate_state_root,
        repo_b.join(".epi/gate")
    );
    assert_eq!(
        anima_runtime.pi_session.plugin_runtime_path,
        anima_agent_dir.join("plugin-runtime.json")
    );
    assert_eq!(
        epii_runtime.pi_session.plugin_runtime_path,
        epii_agent_dir.join("plugin-runtime.json")
    );
    assert_ne!(
        anima_record.resource_loader_id,
        epii_record.resource_loader_id,
        "distinct effective cwd and agent package roots must produce distinct PI resource loader ids"
    );
    assert_eq!(anima_record.active_agent_id, "anima");
    assert_eq!(epii_record.active_agent_id, "epii");
}

#[test]
fn pi_runtime_propagation_records_missing_explicit_resource_paths_as_diagnostics() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-resource-diagnostics-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo = root.join("repo");
    let gate_root = root.join("gate");
    fs::create_dir_all(repo.join("Idea")).unwrap();
    let missing_skill = root.join("missing/skills");
    let missing_theme = root.join("missing/theme.json");
    let _guard = EnvGuard::set([
        (
            "EPI_GATE_SKILLS_PATHS",
            std::env::join_paths([missing_skill.as_path()])
                .unwrap()
                .to_string_lossy()
                .into_owned(),
        ),
        ("EPI_AGENT_THEME_PATH", missing_theme.display().to_string()),
    ]);

    let runtime = AgentSessionRuntimeFactory::new()
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo,
            now: Utc.with_ymd_and_hms(2026, 5, 8, 10, 0, 0).unwrap(),
            random_suffix: Some("res001".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("resource_reload".to_owned()),
        })
        .unwrap();
    assert!(runtime.diagnostics.iter().any(|diagnostic| {
        diagnostic.severity == "error"
            && diagnostic.message.contains("EPI_GATE_SKILLS_PATHS")
            && diagnostic.message.contains(missing_skill.to_str().unwrap())
    }));
    assert!(runtime.diagnostics.iter().any(|diagnostic| {
        diagnostic.severity == "error"
            && diagnostic.message.contains("EPI_AGENT_THEME_PATH")
            && diagnostic.message.contains(missing_theme.to_str().unwrap())
    }));

    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: gate_root,
            operation: GatewaySessionPropagationOperation::ResourceReload,
            target_session_key: Some("agent:anima:resource-check".to_owned()),
            label: None,
        },
    )
    .unwrap();

    assert!(record.diagnostics.iter().any(|diagnostic| {
        diagnostic["severity"] == "error"
            && diagnostic["source"] == "khora.agent_session_runtime"
            && diagnostic["message"]
                .as_str()
                .unwrap_or_default()
                .contains("EPI_GATE_SKILLS_PATHS")
    }));
    assert!(record.diagnostics.iter().any(|diagnostic| {
        diagnostic["severity"] == "error"
            && diagnostic["source"] == "khora.agent_session_runtime"
            && diagnostic["message"]
                .as_str()
                .unwrap_or_default()
                .contains("EPI_AGENT_THEME_PATH")
    }));
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d redis
async fn live_pi_runtime_propagation_hydrates_redis_temporal_keys() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-redis-propagation-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo = root.join("repo");
    let vault = repo.join("Idea");
    let gate_root = root.join("gate");
    let anima_agent_dir = repo.join(".epi/agents/anima/agent");
    fs::create_dir_all(&vault).unwrap();
    fs::create_dir_all(&anima_agent_dir).unwrap();
    fs::write(
        anima_agent_dir.join("models.json"),
        r#"{"defaultModel":"zai/glm-4.5","providers":[]}"#,
    )
    .unwrap();

    let redis_uri =
        std::env::var("EPILOGOS_REDIS_URI").unwrap_or_else(|_| "redis://localhost:6379".into());
    let _guard = EnvGuard::set([
        ("EPILOGOS_VAULT", vault.display().to_string()),
        ("EPILOGOS_REDIS_URI", redis_uri.clone()),
        ("EPI_GATE_SESSION_REDIS_HYDRATION", "required".to_owned()),
    ]);

    let runtime = AgentSessionRuntimeFactory::new()
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo.clone(),
            now: Utc.with_ymd_and_hms(2026, 5, 8, 8, 30, 0).unwrap(),
            random_suffix: Some("redis01".to_owned()),
            force_new: true,
            agent_id: Some("anima".to_owned()),
            pi_event: Some("session_start".to_owned()),
        })
        .unwrap();
    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: gate_root.clone(),
            operation: GatewaySessionPropagationOperation::SessionStart,
            target_session_key: None,
            label: None,
        },
    )
    .unwrap();

    let role = RedisTemporalContextRole::session_now();
    let session_now_key = role.session_now_key(&runtime.context.session_id);
    let day_context_key = role.day_context_key(&runtime.context.day_id);
    let session_kairos_key = role.session_kairos_key(&runtime.context.session_id);
    let agent_orientation_key =
        role.agent_orientation_key(&runtime.pi_session.agent_id, &runtime.context.session_id);

    let client = redis::Client::open(redis_uri).unwrap();
    let mut conn = client.get_multiplexed_async_connection().await.unwrap();
    let now_content: String = conn.get(&session_now_key).await.unwrap();
    let day_context: String = conn.get(&day_context_key).await.unwrap();
    let session_kairos: String = conn.get(&session_kairos_key).await.unwrap();
    let agent_orientation: String = conn.get(&agent_orientation_key).await.unwrap();

    assert!(now_content.contains(&runtime.context.session_id));
    assert!(day_context.contains(&runtime.context.day_id));
    assert!(session_kairos.contains("public-current-transit-only"));
    assert!(agent_orientation.contains(&record.canonical_key));

    let cleanup_keys = [
        session_now_key,
        day_context_key,
        session_kairos_key,
        agent_orientation_key,
    ];
    let _: usize = conn.del(&cleanup_keys[..]).await.unwrap();
}

#[test]
fn pi_runtime_propagation_records_branch_lineage_for_forked_gateway_session() {
    let root = std::env::temp_dir().join(format!(
        "epi-session-runtime-fork-propagation-{}",
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    let repo = root.join("repo");
    let gate_root = root.join("gate");
    fs::create_dir_all(repo.join("Idea")).unwrap();

    let runtime = AgentSessionRuntimeFactory::new()
        .create(AgentSessionRuntimeRequest {
            effective_cwd: repo,
            now: Utc.with_ymd_and_hms(2026, 5, 8, 9, 0, 0).unwrap(),
            random_suffix: Some("fork01".to_owned()),
            force_new: true,
            agent_id: Some("epii".to_owned()),
            pi_event: Some("fork".to_owned()),
        })
        .unwrap();

    let record = propagate_agent_session_runtime(
        &runtime,
        GatewaySessionPropagation {
            state_root: gate_root,
            operation: GatewaySessionPropagationOperation::Fork {
                source_session_key: "agent:epii:main".to_owned(),
                parent_session_key: Some("agent:epii:main".to_owned()),
            },
            target_session_key: Some("agent:epii:fork:research".to_owned()),
            label: Some("Epii research fork".to_owned()),
        },
    )
    .unwrap();

    assert_eq!(record.canonical_key, "agent:epii:fork:research");
    assert_eq!(record.label.as_deref(), Some("Epii research fork"));
    assert_eq!(
        record.source_session_key.as_deref(),
        Some("agent:epii:main")
    );
    assert_eq!(record.source_session_kind.as_deref(), Some("fork"));
    assert_eq!(
        record.parent_session_key.as_deref(),
        Some("agent:epii:main")
    );
    assert_eq!(record.session_id, runtime.context.session_id);
    assert_eq!(record.active_agent_id, "epii");
}

struct EnvGuard {
    saved: Vec<(&'static str, Option<OsString>)>,
}

impl EnvGuard {
    fn set(values: impl IntoIterator<Item = (&'static str, String)>) -> Self {
        let mut saved = Vec::new();
        for (key, value) in values {
            saved.push((key, env::var_os(key)));
            unsafe {
                env::set_var(key, value);
            }
        }
        Self { saved }
    }
}

impl Drop for EnvGuard {
    fn drop(&mut self) {
        for (key, value) in self.saved.drain(..).rev() {
            match value {
                Some(value) => unsafe {
                    env::set_var(key, value);
                },
                None => unsafe {
                    env::remove_var(key);
                },
            }
        }
    }
}
