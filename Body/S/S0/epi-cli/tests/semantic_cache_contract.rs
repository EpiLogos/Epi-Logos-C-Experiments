use std::collections::BTreeMap;

use epi_logos::graph::semantic_cache::{
    GraphRedisRole, SearchPayload, SemanticCacheClient, SemanticCacheConfig, SemanticCacheHealth,
    SemanticCacheMatchStrategy, StorePayload,
};

static ENV_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

#[test]
fn semantic_cache_config_requires_python_service_settings() {
    let _lock = ENV_MUTEX.lock().unwrap();
    std::env::remove_var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL");
    std::env::remove_var("EPILOGOS_SEMANTIC_CACHE_SCRIPT");

    assert!(SemanticCacheConfig::from_env().is_err());

    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
        "redis://127.0.0.1:6379",
    );
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
        "/tmp/redisvl_cache_service.py",
    );

    let config = SemanticCacheConfig::from_env().unwrap();
    assert_eq!(config.redis_url, "redis://127.0.0.1:6379");
    assert_eq!(
        config.script_path.to_string_lossy(),
        "/tmp/redisvl_cache_service.py"
    );
    assert_eq!(config.redis_namespace, "s2:graph:semantic");
}

#[test]
fn semantic_cache_role_is_s2_graph_authority() {
    let role = GraphRedisRole::semantic_cache();

    assert_eq!(role.coordinate_owner, "S2");
    assert_eq!(role.redis_namespace, "s2:graph:semantic");
    assert_eq!(role.embedding_dimensions, 3072);
    assert_eq!(role.embedding_version, "q-semantic-v2-3072");
    assert_eq!(role.q_schema_version, "q-prefix-v2");
    assert!(!role.description.contains("session"));
}

#[test]
fn semantic_cache_payloads_include_prompt_attributes_and_threshold() {
    let mut attributes = BTreeMap::new();
    attributes.insert("graph_revision".to_string(), "3".to_string());
    attributes.insert("mode".to_string(), "hybrid_rrf".to_string());

    let search = SearchPayload::new(
        "How does context work?",
        attributes.clone(),
        0.91,
        vec![
            SemanticCacheMatchStrategy::Exact,
            SemanticCacheMatchStrategy::Semantic,
        ],
    );
    let search_json = serde_json::to_value(&search).unwrap();
    assert_eq!(search_json["prompt"], "How does context work?");
    assert_eq!(search_json["similarity_threshold"], 0.91);
    assert_eq!(search_json["attributes"]["graph_revision"], "3");
    assert_eq!(search_json["strategies"][0], "exact");
    assert_eq!(search_json["strategies"][1], "semantic");

    let store = StorePayload::new(
        "How does context work?",
        "[{\"coordinate\":\"#4\"}]",
        attributes,
    );
    let store_json = serde_json::to_value(&store).unwrap();
    assert_eq!(store_json["prompt"], "How does context work?");
    assert_eq!(store_json["response"], "[{\"coordinate\":\"#4\"}]");
    assert_eq!(store_json["attributes"]["mode"], "hybrid_rrf");
}

#[test]
fn semantic_cache_health_contract_reports_runtime_and_stack_fields() {
    let health = SemanticCacheHealth {
        ok: true,
        python: "/tmp/.venv/bin/python3".into(),
        redis_url: "redis://127.0.0.1:6379".into(),
        cache_name: "epi_semantic_cache".into(),
        redis_namespace: "s2:graph:semantic".into(),
        redis_ping: true,
        redis_stack: true,
        search_indexes: vec!["idx:epi_semantic_cache".into()],
        filterable_fields: vec![
            "graph_revision".into(),
            "embedding_version".into(),
            "q_schema_version".into(),
            "mode".into(),
            "top_k".into(),
        ],
        error: None,
    };
    let health_json = serde_json::to_value(&health).unwrap();

    assert_eq!(health_json["ok"], true);
    assert!(health_json["python"].as_str().unwrap().contains("python3"));
    assert_eq!(health_json["redis_namespace"], "s2:graph:semantic");
    assert_eq!(health_json["redis_stack"], true);
    assert!(health_json["search_indexes"].is_array());
    assert!(health_json["filterable_fields"].is_array());
}

#[tokio::test]
#[ignore]
async fn semantic_cache_python_bridge_round_trip() {
    let _lock = ENV_MUTEX.lock().unwrap();
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
        "redis://127.0.0.1:6379",
    );
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
        "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S3/redis-context/scripts/redisvl_cache_service/redisvl_cache_service.py",
    );
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_PYTHON",
        "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S3/redis-context/scripts/redisvl_cache_service/.venv/bin/python3",
    );
    std::env::set_var("EPILOGOS_SEMANTIC_CACHE_ARCH", "arm64");

    let config = SemanticCacheConfig::from_env().unwrap();
    assert_eq!(
        config.python_bin.to_string_lossy(),
        "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S3/redis-context/scripts/redisvl_cache_service/.venv/bin/python3"
    );
    let client = SemanticCacheClient::new(config);
    client.flush().await.unwrap();

    let mut attributes = BTreeMap::new();
    attributes.insert("graph_revision".to_string(), "3".to_string());
    attributes.insert("mode".to_string(), "hybrid_rrf".to_string());
    attributes.insert("embedding_version".to_string(), "q-semantic-v1".to_string());
    attributes.insert("q_schema_version".to_string(), "q-prefix-v1".to_string());
    attributes.insert("top_k".to_string(), "5".to_string());

    client
        .store(
            "How does context work?",
            "[{\"coordinate\":\"#4\"}]",
            attributes.clone(),
        )
        .await
        .unwrap();

    let cached = client
        .search(
            "How does context work?",
            attributes,
            vec![
                SemanticCacheMatchStrategy::Exact,
                SemanticCacheMatchStrategy::Semantic,
            ],
        )
        .await
        .unwrap()
        .expect("expected semantic cache hit");

    assert_eq!(
        cached.response.as_deref(),
        Some("[{\"coordinate\":\"#4\"}]")
    );
}

#[tokio::test]
#[ignore]
async fn semantic_cache_python_bridge_health() {
    let _lock = ENV_MUTEX.lock().unwrap();
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
        "redis://127.0.0.1:6379",
    );
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
        "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S3/redis-context/scripts/redisvl_cache_service/redisvl_cache_service.py",
    );
    std::env::set_var(
        "EPILOGOS_SEMANTIC_CACHE_PYTHON",
        "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S3/redis-context/scripts/redisvl_cache_service/.venv/bin/python3",
    );
    std::env::set_var("EPILOGOS_SEMANTIC_CACHE_ARCH", "arm64");

    let client = SemanticCacheClient::new(SemanticCacheConfig::from_env().unwrap());
    let health = client.health().await.unwrap();
    assert!(health.ok);
    assert!(health.redis_ping);
    assert!(health.redis_stack);
    assert!(health
        .filterable_fields
        .iter()
        .any(|field| field == "graph_revision"));
}
