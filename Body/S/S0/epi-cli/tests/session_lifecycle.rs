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
