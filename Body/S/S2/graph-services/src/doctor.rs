use std::path::Path;

use serde::Serialize;

use crate::meta;
use crate::semantic;
use crate::{Neo4jClient, Neo4jConfig};
use crate::{RedisCache, RedisConfig};
use crate::{SemanticCacheClient, SemanticCacheConfig, SemanticCacheHealth};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceStatus {
    pub ok: bool,
    pub uri: String,
    pub status: String,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RedisStackStatus {
    pub ok: bool,
    pub search_ready: bool,
    pub search_indexes: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SemanticCacheStatus {
    pub ok: bool,
    pub configured: bool,
    pub config_source: String,
    pub script_path: String,
    pub python_bin: String,
    pub cache_name: String,
    pub health: Option<SemanticCacheHealth>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphState {
    pub ok: bool,
    pub bootstrapped: bool,
    pub node_count: i64,
    pub meta_present: bool,
    pub graph_revision: Option<i64>,
    pub schema_version: Option<String>,
    pub embedding_version: Option<String>,
    pub q_schema_version: Option<String>,
    pub semantic_indexed_nodes: i64,
    pub stale_semantic_nodes: i64,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DoctorReport {
    pub ok: bool,
    pub neo4j: ServiceStatus,
    pub redis: ServiceStatus,
    pub redis_stack: RedisStackStatus,
    pub semantic_cache: SemanticCacheStatus,
    pub graph: GraphState,
}

pub async fn collect_report(repo_root: &Path) -> DoctorReport {
    let neo4j_config = Neo4jConfig::from_env();
    let redis_config = RedisConfig::from_env();

    let (neo4j, neo4j_client) = neo4j_status(&neo4j_config).await;
    let (redis, redis_stack) = redis_status(&redis_config).await;
    let semantic_cache = semantic_cache_status(repo_root).await;
    let graph = graph_state(neo4j_client.as_ref()).await;

    let ok = neo4j.ok && redis.ok && redis_stack.ok && semantic_cache.ok && graph.ok;

    DoctorReport {
        ok,
        neo4j,
        redis,
        redis_stack,
        semantic_cache,
        graph,
    }
}

pub fn render_human(report: &DoctorReport) -> String {
    format!(
        "Graph doctor\n  overall: {}\n  Neo4j: {} ({})\n  Redis: {} ({})\n  Redis Stack: {} (indexes: {})\n  Semantic cache: {} ({})\n  Graph: bootstrapped={} nodes={} indexed={} stale={} revision={}",
        if report.ok { "healthy" } else { "degraded" },
        report.neo4j.status,
        report.neo4j.uri,
        report.redis.status,
        report.redis.uri,
        if report.redis_stack.ok { "ready" } else { "not-ready" },
        report.redis_stack.search_indexes.len(),
        if report.semantic_cache.ok { "ready" } else { "not-ready" },
        report.semantic_cache.config_source,
        report.graph.bootstrapped,
        report.graph.node_count,
        report.graph.semantic_indexed_nodes,
        report.graph.stale_semantic_nodes,
        report.graph.graph_revision.unwrap_or_default(),
    )
}

pub fn render_status(report: &DoctorReport) -> String {
    format!(
        "S2 Status:\n  Neo4j: {} ({})\n  Redis: {} ({})\n  Redis Stack: {}\n  Semantic cache: {}\n  Graph: nodes={}, indexed={}, stale={}",
        report.neo4j.status,
        report.neo4j.uri,
        report.redis.status,
        report.redis.uri,
        if report.redis_stack.ok { "ready" } else { "not-ready" },
        if report.semantic_cache.ok { "ready" } else { "not-ready" },
        report.graph.node_count,
        report.graph.semantic_indexed_nodes,
        report.graph.stale_semantic_nodes,
    )
}

async fn neo4j_status(config: &Neo4jConfig) -> (ServiceStatus, Option<Neo4jClient>) {
    match Neo4jClient::connect(config) {
        Ok(client) => match client.health_check().await {
            Ok(true) => (
                ServiceStatus {
                    ok: true,
                    uri: config.uri.clone(),
                    status: "connected".into(),
                    error: None,
                },
                Some(client),
            ),
            Ok(false) => (
                ServiceStatus {
                    ok: false,
                    uri: config.uri.clone(),
                    status: "unhealthy".into(),
                    error: Some("health check returned false".into()),
                },
                Some(client),
            ),
            Err(err) => (
                ServiceStatus {
                    ok: false,
                    uri: config.uri.clone(),
                    status: "disconnected".into(),
                    error: Some(err.to_string()),
                },
                None,
            ),
        },
        Err(err) => (
            ServiceStatus {
                ok: false,
                uri: config.uri.clone(),
                status: "disconnected".into(),
                error: Some(err.to_string()),
            },
            None,
        ),
    }
}

async fn redis_status(config: &RedisConfig) -> (ServiceStatus, RedisStackStatus) {
    match RedisCache::connect(config).await {
        Ok(mut cache) => match cache.health_check().await {
            Ok(true) => {
                let stack = match cache.search_indexes().await {
                    Ok(search_indexes) => RedisStackStatus {
                        ok: true,
                        search_ready: true,
                        search_indexes,
                        error: None,
                    },
                    Err(err) => RedisStackStatus {
                        ok: false,
                        search_ready: false,
                        search_indexes: Vec::new(),
                        error: Some(err.to_string()),
                    },
                };
                (
                    ServiceStatus {
                        ok: true,
                        uri: config.uri.clone(),
                        status: "connected".into(),
                        error: None,
                    },
                    stack,
                )
            }
            Ok(false) => (
                ServiceStatus {
                    ok: false,
                    uri: config.uri.clone(),
                    status: "unhealthy".into(),
                    error: Some("health check returned false".into()),
                },
                RedisStackStatus {
                    ok: false,
                    search_ready: false,
                    search_indexes: Vec::new(),
                    error: Some("redis health check returned false".into()),
                },
            ),
            Err(err) => (
                ServiceStatus {
                    ok: false,
                    uri: config.uri.clone(),
                    status: "disconnected".into(),
                    error: Some(err.to_string()),
                },
                RedisStackStatus {
                    ok: false,
                    search_ready: false,
                    search_indexes: Vec::new(),
                    error: Some(err.to_string()),
                },
            ),
        },
        Err(err) => (
            ServiceStatus {
                ok: false,
                uri: config.uri.clone(),
                status: "disconnected".into(),
                error: Some(err.to_string()),
            },
            RedisStackStatus {
                ok: false,
                search_ready: false,
                search_indexes: Vec::new(),
                error: Some(err.to_string()),
            },
        ),
    }
}

async fn semantic_cache_status(repo_root: &Path) -> SemanticCacheStatus {
    let (configured, config_source, config) = match SemanticCacheConfig::from_env_optional() {
        Ok(Some(config)) => (true, "env".to_string(), config),
        Ok(None) => (
            false,
            "local-dev-default".to_string(),
            SemanticCacheConfig::for_local_dev(repo_root),
        ),
        Err(err) => {
            return SemanticCacheStatus {
                ok: false,
                configured: false,
                config_source: "env-error".into(),
                script_path: String::new(),
                python_bin: String::new(),
                cache_name: String::new(),
                health: None,
                error: Some(err),
            }
        }
    };

    let script_path = config.script_path.display().to_string();
    let python_bin = config.python_bin.display().to_string();
    let cache_name = config.cache_name.clone();

    if !config.script_path.exists() {
        return SemanticCacheStatus {
            ok: false,
            configured,
            config_source,
            script_path,
            python_bin,
            cache_name,
            health: None,
            error: Some("semantic cache script not found".into()),
        };
    }

    let client = SemanticCacheClient::new(config);
    match client.health().await {
        Ok(health) => SemanticCacheStatus {
            ok: health.ok,
            configured,
            config_source,
            script_path,
            python_bin,
            cache_name,
            health: Some(health.clone()),
            error: health.error.clone(),
        },
        Err(err) => SemanticCacheStatus {
            ok: false,
            configured,
            config_source,
            script_path,
            python_bin,
            cache_name,
            health: None,
            error: Some(err),
        },
    }
}

async fn graph_state(client: Option<&Neo4jClient>) -> GraphState {
    let Some(client) = client else {
        return GraphState {
            ok: false,
            bootstrapped: false,
            node_count: 0,
            meta_present: false,
            graph_revision: None,
            schema_version: None,
            embedding_version: None,
            q_schema_version: None,
            semantic_indexed_nodes: 0,
            stale_semantic_nodes: 0,
            error: Some("neo4j unavailable".into()),
        };
    };

    let node_count = match client.run("MATCH (n:Bimba) RETURN count(n) AS c").await {
        Ok(rows) => rows
            .first()
            .and_then(|row| row.get("c").ok())
            .unwrap_or_default(),
        Err(err) => {
            return GraphState {
                ok: false,
                bootstrapped: false,
                node_count: 0,
                meta_present: false,
                graph_revision: None,
                schema_version: None,
                embedding_version: None,
                q_schema_version: None,
                semantic_indexed_nodes: 0,
                stale_semantic_nodes: 0,
                error: Some(format!("graph count failed: {}", err)),
            }
        }
    };

    let graph_meta = match meta::read_graph_meta(client).await {
        Ok(meta) => meta,
        Err(err) => {
            return GraphState {
                ok: false,
                bootstrapped: node_count > 0,
                node_count,
                meta_present: false,
                graph_revision: None,
                schema_version: None,
                embedding_version: None,
                q_schema_version: None,
                semantic_indexed_nodes: 0,
                stale_semantic_nodes: 0,
                error: Some(err),
            }
        }
    };

    let indexed_rows = match client
        .run(
            "MATCH (n:Bimba)
             WHERE n.semantic_embedding_version IS NOT NULL
             RETURN count(n) AS c",
        )
        .await
    {
        Ok(rows) => rows,
        Err(err) => {
            return GraphState {
                ok: false,
                bootstrapped: node_count > 0,
                node_count,
                meta_present: graph_meta.is_some(),
                graph_revision: graph_meta.as_ref().map(|meta| meta.graph_revision),
                schema_version: graph_meta.as_ref().map(|meta| meta.schema_version.clone()),
                embedding_version: graph_meta
                    .as_ref()
                    .map(|meta| meta.embedding_version.clone()),
                q_schema_version: graph_meta
                    .as_ref()
                    .map(|meta| meta.q_schema_version.clone()),
                semantic_indexed_nodes: 0,
                stale_semantic_nodes: 0,
                error: Some(format!("semantic index count failed: {}", err)),
            }
        }
    };
    let semantic_indexed_nodes = indexed_rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();

    let stale_semantic_nodes = if node_count > 0 {
        match semantic::find_stale_nodes_with_dependents(client, meta::EMBEDDING_VERSION).await {
            Ok(stale) => stale.len() as i64,
            Err(err) => {
                return GraphState {
                    ok: false,
                    bootstrapped: true,
                    node_count,
                    meta_present: graph_meta.is_some(),
                    graph_revision: graph_meta.as_ref().map(|meta| meta.graph_revision),
                    schema_version: graph_meta.as_ref().map(|meta| meta.schema_version.clone()),
                    embedding_version: graph_meta
                        .as_ref()
                        .map(|meta| meta.embedding_version.clone()),
                    q_schema_version: graph_meta
                        .as_ref()
                        .map(|meta| meta.q_schema_version.clone()),
                    semantic_indexed_nodes,
                    stale_semantic_nodes: 0,
                    error: Some(err),
                }
            }
        }
    } else {
        0
    };

    GraphState {
        ok: true,
        bootstrapped: node_count > 0,
        node_count,
        meta_present: graph_meta.is_some(),
        graph_revision: graph_meta.as_ref().map(|meta| meta.graph_revision),
        schema_version: graph_meta.as_ref().map(|meta| meta.schema_version.clone()),
        embedding_version: graph_meta
            .as_ref()
            .map(|meta| meta.embedding_version.clone()),
        q_schema_version: graph_meta
            .as_ref()
            .map(|meta| meta.q_schema_version.clone()),
        semantic_indexed_nodes,
        stale_semantic_nodes,
        error: None,
    }
}
