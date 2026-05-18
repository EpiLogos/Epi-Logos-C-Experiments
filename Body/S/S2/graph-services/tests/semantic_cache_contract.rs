use std::collections::BTreeMap;
use std::path::PathBuf;

use epi_s2_graph_services::{
    GraphRedisRole, SearchPayload, SemanticCacheConfig, SemanticCacheHealth,
    SemanticCacheMatchStrategy, SemanticDocument, StorePayload,
};
use epi_s3_redis_context::REDISVL_SERVICE_RELATIVE_PATH;

#[test]
fn semantic_cache_contract_is_s2_graph_cache_not_gateway_temporal_context() {
    let role = GraphRedisRole::semantic_cache();

    assert_eq!(role.coordinate_owner, "S2");
    assert_eq!(role.redis_namespace, "s2:graph:semantic");
    assert_eq!(role.cache_name, "epi_semantic_cache");
    assert_eq!(
        role.embedding_dimensions,
        epi_s2_graph_schema::SEMANTIC_EMBEDDING_DIMENSIONS
    );
    assert_eq!(
        role.embedding_version,
        epi_s2_graph_schema::EMBEDDING_VERSION
    );
    assert_eq!(role.q_schema_version, epi_s2_graph_schema::Q_SCHEMA_VERSION);
    assert!(role.description.contains("graph retrieval"));
    assert!(!role.description.contains("session"));
}

#[test]
fn semantic_cache_config_environment_contract_carries_s2_graph_identity() {
    let config =
        SemanticCacheConfig::from_script_path(PathBuf::from("/tmp/redisvl_cache_service.py"));
    let env = config.environment_contract();

    assert_eq!(
        env["EPILOGOS_SEMANTIC_CACHE_REDIS_NAMESPACE"],
        "s2:graph:semantic"
    );
    assert_eq!(
        env["EPILOGOS_SEMANTIC_CACHE_EMBEDDING_VERSION"],
        epi_s2_graph_schema::EMBEDDING_VERSION
    );
    assert_eq!(
        env["EPILOGOS_SEMANTIC_CACHE_Q_SCHEMA_VERSION"],
        epi_s2_graph_schema::Q_SCHEMA_VERSION
    );
}

#[test]
fn semantic_cache_local_dev_uses_s3_redisvl_runtime_bridge() {
    let config = SemanticCacheConfig::for_local_dev(std::path::Path::new("/repo"));

    assert_eq!(
        config.script_path.to_string_lossy(),
        format!("/repo/{REDISVL_SERVICE_RELATIVE_PATH}")
    );
    assert!(config
        .script_path
        .to_string_lossy()
        .contains("Body/S/S3/redis-context/scripts/redisvl_cache_service"));
    assert!(!config.script_path.to_string_lossy().contains("Body/S/S2/"));
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
fn semantic_document_text_includes_safe_kernel_coordinate_anchor() {
    let mut q_properties = BTreeMap::new();
    q_properties.insert("q_2_essence".to_string(), "patterned knowing".to_string());

    let doc = SemanticDocument::from_coordinate_parts(
        "M2",
        "Mahamaya",
        "M",
        "M",
        "2",
        Some("matrix intelligence"),
        Some("coordinate field for semantic patterning"),
        q_properties,
        vec!["RELATES_TO -> M3 :: Pattern".to_string()],
        Vec::new(),
    )
    .expect("semantic document from coordinate parts");

    assert_eq!(doc.coordinate, "M2");
    assert_eq!(doc.coordinate_anchor.coordinate, "M2");
    assert!(doc.text.contains("kernel_source: s0.kernel"));
    assert!(doc.text.contains("pointer_web_count: 36"));
    assert!(doc.text.contains("pointer_family_refs:"));
    assert!(doc.text.contains("m_ref=M2"));
    assert!(doc.text.contains("qvdata_source: epi core knowing"));
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
    assert_eq!(health_json["redis_namespace"], "s2:graph:semantic");
    assert_eq!(health_json["redis_stack"], true);
    assert!(health_json["search_indexes"].is_array());
    assert!(health_json["filterable_fields"].is_array());
}
