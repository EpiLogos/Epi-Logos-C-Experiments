use std::path::Path;

use serde::Serialize;

use crate::meta;
use crate::semantic;
use crate::{Neo4jClient, Neo4jConfig};
use crate::{SemanticCacheClient, SemanticCacheConfig, SemanticCacheHealth};
use epi_s3_redis_context::{RedisCache, RedisConfig};

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
pub struct SchemaReadiness {
    pub ok: bool,
    pub status: String,
    pub source: String,
    pub schema_version: Option<String>,
    pub q_schema_version: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcedureReadiness {
    pub ok: bool,
    pub status: String,
    pub required: bool,
    pub procedure_prefix: String,
    pub checked_query: String,
    pub procedure_count: i64,
    pub example_procedures: Vec<String>,
    pub fallback: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Owl2RlReadiness {
    pub ok: bool,
    pub status: String,
    pub depends_on: String,
    pub procedure_prefix: String,
    pub checked_query: String,
    pub procedure_count: i64,
    pub example_procedures: Vec<String>,
    pub fallback: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrivacyProjectionReadiness {
    pub ok: bool,
    pub status: String,
    pub projection_strategy: String,
    pub requires_gds: bool,
    pub protected_label_count: i64,
    pub excluded_labels: Vec<String>,
    pub fallback: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DoctorReport {
    pub ok: bool,
    pub neo4j: ServiceStatus,
    pub schema: SchemaReadiness,
    pub apoc: ProcedureReadiness,
    pub n10s: ProcedureReadiness,
    pub owl2_rl: Owl2RlReadiness,
    pub gds: ProcedureReadiness,
    pub privacy_projection: PrivacyProjectionReadiness,
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
    let schema = schema_readiness(&graph);
    let apoc = procedure_readiness(
        neo4j_client.as_ref(),
        "apoc.",
        "APOC is required by S2 dataset import label mutation; bootstrap the local Neo4j topology with APOC before running population flows.",
    )
    .await;
    let n10s = procedure_readiness(
        neo4j_client.as_ref(),
        "n10s.",
        "neosemantics (n10s) is required for ontology import/export and OWL readiness; keep S2 ontology consumers blocked until the Neo4j topology installs n10s.",
    )
    .await;
    let owl2_rl = owl2_rl_readiness(neo4j_client.as_ref(), &n10s).await;
    let gds = procedure_readiness(
        neo4j_client.as_ref(),
        "gds.",
        "Graph Data Science is required for S2' topology overlays; keep GDS consumers blocked and use graph-only traversal until the Neo4j topology installs GDS.",
    )
    .await;
    let privacy_projection = privacy_projection_readiness(neo4j_client.as_ref(), &gds).await;

    let ok = neo4j.ok
        && schema.ok
        && apoc.ok
        && n10s.ok
        && owl2_rl.ok
        && gds.ok
        && privacy_projection.ok
        && redis.ok
        && redis_stack.ok
        && semantic_cache.ok
        && graph.ok;

    DoctorReport {
        ok,
        neo4j,
        schema,
        apoc,
        n10s,
        owl2_rl,
        gds,
        privacy_projection,
        redis,
        redis_stack,
        semantic_cache,
        graph,
    }
}

pub fn render_human(report: &DoctorReport) -> String {
    format!(
        "Graph doctor\n  overall: {}\n  Neo4j: {} ({})\n  Schema: {}\n  APOC: {} (procedures: {})\n  n10s: {} (procedures: {})\n  OWL2 RL: {} (procedures: {})\n  GDS: {} (procedures: {})\n  Privacy projection: {} (protected labels: {})\n  Redis: {} ({})\n  Redis Stack: {} (indexes: {})\n  Semantic cache: {} ({})\n  Graph: bootstrapped={} nodes={} indexed={} stale={} revision={}",
        if report.ok { "healthy" } else { "degraded" },
        report.neo4j.status,
        report.neo4j.uri,
        report.schema.status,
        report.apoc.status,
        report.apoc.procedure_count,
        report.n10s.status,
        report.n10s.procedure_count,
        report.owl2_rl.status,
        report.owl2_rl.procedure_count,
        report.gds.status,
        report.gds.procedure_count,
        report.privacy_projection.status,
        report.privacy_projection.protected_label_count,
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
        "S2 Status:\n  Neo4j: {} ({})\n  Schema: {}\n  APOC: {}\n  n10s: {}\n  OWL2 RL: {}\n  GDS: {}\n  Privacy projection: {}\n  Redis: {} ({})\n  Redis Stack: {}\n  Semantic cache: {}\n  Graph: nodes={}, indexed={}, stale={}",
        report.neo4j.status,
        report.neo4j.uri,
        report.schema.status,
        report.apoc.status,
        report.n10s.status,
        report.owl2_rl.status,
        report.gds.status,
        report.privacy_projection.status,
        report.redis.status,
        report.redis.uri,
        if report.redis_stack.ok { "ready" } else { "not-ready" },
        if report.semantic_cache.ok { "ready" } else { "not-ready" },
        report.graph.node_count,
        report.graph.semantic_indexed_nodes,
        report.graph.stale_semantic_nodes,
    )
}

fn schema_readiness(graph: &GraphState) -> SchemaReadiness {
    if !graph.ok {
        return SchemaReadiness {
            ok: false,
            status: "blocked".into(),
            source: "GraphMeta".into(),
            schema_version: graph.schema_version.clone(),
            q_schema_version: graph.q_schema_version.clone(),
            error: graph
                .error
                .clone()
                .or_else(|| Some("graph unavailable".into())),
        };
    }

    let ok =
        graph.meta_present && graph.schema_version.is_some() && graph.q_schema_version.is_some();
    SchemaReadiness {
        ok,
        status: if ok { "ready" } else { "blocked" }.into(),
        source: "GraphMeta".into(),
        schema_version: graph.schema_version.clone(),
        q_schema_version: graph.q_schema_version.clone(),
        error: if ok {
            None
        } else {
            Some("GraphMeta is missing schema_version or q_schema_version".into())
        },
    }
}

async fn procedure_readiness(
    client: Option<&Neo4jClient>,
    procedure_prefix: &str,
    fallback: &str,
) -> ProcedureReadiness {
    let count_query = format!(
        "SHOW PROCEDURES YIELD name WHERE name STARTS WITH '{}' RETURN count(name) AS c",
        procedure_prefix
    );
    let checked_query = format!(
        "SHOW PROCEDURES YIELD name WHERE name STARTS WITH '{}' RETURN name ORDER BY name LIMIT 8",
        procedure_prefix
    );
    let Some(client) = client else {
        return ProcedureReadiness {
            ok: false,
            status: "blocked".into(),
            required: true,
            procedure_prefix: procedure_prefix.into(),
            checked_query,
            procedure_count: 0,
            example_procedures: Vec::new(),
            fallback: Some(fallback.into()),
            error: Some("neo4j unavailable".into()),
        };
    };

    match procedure_count(client, &count_query).await {
        Ok(count) => match client.run(&checked_query).await {
            Ok(rows) => {
                let example_procedures = row_strings(&rows, "name");
                ProcedureReadiness {
                    ok: count > 0,
                    status: if count > 0 { "ready" } else { "blocked" }.into(),
                    required: true,
                    procedure_prefix: procedure_prefix.into(),
                    checked_query,
                    procedure_count: count,
                    example_procedures,
                    fallback: (count == 0).then(|| fallback.into()),
                    error: None,
                }
            }
            Err(err) => ProcedureReadiness {
                ok: false,
                status: "blocked".into(),
                required: true,
                procedure_prefix: procedure_prefix.into(),
                checked_query,
                procedure_count: 0,
                example_procedures: Vec::new(),
                fallback: Some(fallback.into()),
                error: Some(err.to_string()),
            },
        },
        Err(err) => ProcedureReadiness {
            ok: false,
            status: "blocked".into(),
            required: true,
            procedure_prefix: procedure_prefix.into(),
            checked_query,
            procedure_count: 0,
            example_procedures: Vec::new(),
            fallback: Some(fallback.into()),
            error: Some(err),
        },
    }
}

async fn procedure_count(client: &Neo4jClient, count_query: &str) -> Result<i64, String> {
    let rows = client
        .run(count_query)
        .await
        .map_err(|err| err.to_string())?;
    Ok(rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default())
}

async fn owl2_rl_readiness(
    client: Option<&Neo4jClient>,
    n10s: &ProcedureReadiness,
) -> Owl2RlReadiness {
    let procedure_prefix = "n10s.inference.";
    let count_query = format!(
        "SHOW PROCEDURES YIELD name WHERE name STARTS WITH '{}' RETURN count(name) AS c",
        procedure_prefix
    );
    let checked_query = format!(
        "SHOW PROCEDURES YIELD name WHERE name STARTS WITH '{}' RETURN name ORDER BY name LIMIT 8",
        procedure_prefix
    );
    let fallback = "OWL2 RL reasoning stays blocked until n10s inference procedures are installed and the epi ontology is loaded.";

    if !n10s.ok {
        return Owl2RlReadiness {
            ok: false,
            status: "blocked".into(),
            depends_on: "n10s".into(),
            procedure_prefix: procedure_prefix.into(),
            checked_query,
            procedure_count: 0,
            example_procedures: Vec::new(),
            fallback: Some(fallback.into()),
            error: n10s
                .error
                .clone()
                .or_else(|| Some("n10s unavailable".into())),
        };
    }

    let Some(client) = client else {
        return Owl2RlReadiness {
            ok: false,
            status: "blocked".into(),
            depends_on: "n10s".into(),
            procedure_prefix: procedure_prefix.into(),
            checked_query,
            procedure_count: 0,
            example_procedures: Vec::new(),
            fallback: Some(fallback.into()),
            error: Some("neo4j unavailable".into()),
        };
    };

    match procedure_count(client, &count_query).await {
        Ok(count) => match client.run(&checked_query).await {
            Ok(rows) => {
                let example_procedures = row_strings(&rows, "name");
                Owl2RlReadiness {
                    ok: count > 0,
                    status: if count > 0 { "ready" } else { "blocked" }.into(),
                    depends_on: "n10s".into(),
                    procedure_prefix: procedure_prefix.into(),
                    checked_query,
                    procedure_count: count,
                    example_procedures,
                    fallback: (count == 0).then(|| fallback.into()),
                    error: None,
                }
            }
            Err(err) => Owl2RlReadiness {
                ok: false,
                status: "blocked".into(),
                depends_on: "n10s".into(),
                procedure_prefix: procedure_prefix.into(),
                checked_query,
                procedure_count: 0,
                example_procedures: Vec::new(),
                fallback: Some(fallback.into()),
                error: Some(err.to_string()),
            },
        },
        Err(err) => Owl2RlReadiness {
            ok: false,
            status: "blocked".into(),
            depends_on: "n10s".into(),
            procedure_prefix: procedure_prefix.into(),
            checked_query,
            procedure_count: 0,
            example_procedures: Vec::new(),
            fallback: Some(fallback.into()),
            error: Some(err),
        },
    }
}

async fn privacy_projection_readiness(
    client: Option<&Neo4jClient>,
    gds: &ProcedureReadiness,
) -> PrivacyProjectionReadiness {
    let excluded_labels = vec![
        "GraphitiEpisode".to_string(),
        "NaraBody".to_string(),
        "ProtectedLocalBody".to_string(),
        "PrivateProjection".to_string(),
    ];
    let fallback =
        "GDS Option 1 privacy-safe overlays stay blocked; use canonical graph traversal without derived recommendation payloads.";

    if !gds.ok {
        return PrivacyProjectionReadiness {
            ok: false,
            status: "blocked".into(),
            projection_strategy: "gds-option-1-public-coordinate-overlay".into(),
            requires_gds: true,
            protected_label_count: 0,
            excluded_labels,
            fallback: Some(fallback.into()),
            error: gds.error.clone().or_else(|| Some("gds unavailable".into())),
        };
    }

    let Some(client) = client else {
        return PrivacyProjectionReadiness {
            ok: false,
            status: "blocked".into(),
            projection_strategy: "gds-option-1-public-coordinate-overlay".into(),
            requires_gds: true,
            protected_label_count: 0,
            excluded_labels,
            fallback: Some(fallback.into()),
            error: Some("neo4j unavailable".into()),
        };
    };

    match protected_label_count(client, &excluded_labels).await {
        Ok(protected_label_count) => PrivacyProjectionReadiness {
            ok: protected_label_count == 0,
            status: if protected_label_count == 0 {
                "ready"
            } else {
                "blocked"
            }
            .into(),
            projection_strategy: "gds-option-1-public-coordinate-overlay".into(),
            requires_gds: true,
            protected_label_count,
            excluded_labels,
            fallback: (protected_label_count > 0).then(|| {
                "Remove protected-local labels from the projection candidate set before creating any GDS graph."
                    .into()
            }),
            error: None,
        },
        Err(err) => PrivacyProjectionReadiness {
            ok: false,
            status: "blocked".into(),
            projection_strategy: "gds-option-1-public-coordinate-overlay".into(),
            requires_gds: true,
            protected_label_count: 0,
            excluded_labels,
            fallback: Some(fallback.into()),
            error: Some(err),
        },
    }
}

async fn protected_label_count(
    client: &Neo4jClient,
    excluded_labels: &[String],
) -> Result<i64, String> {
    let quoted = excluded_labels
        .iter()
        .map(|label| format!("'{}'", label.replace('\'', "\\'")))
        .collect::<Vec<_>>()
        .join(", ");
    let cypher = format!(
        "MATCH (n) WHERE any(label IN labels(n) WHERE label IN [{}]) RETURN count(n) AS c",
        quoted
    );
    let rows = client.run(&cypher).await.map_err(|err| err.to_string())?;
    Ok(rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default())
}

fn row_strings(rows: &[neo4rs::Row], key: &str) -> Vec<String> {
    rows.iter()
        .filter_map(|row| row.get::<String>(key).ok())
        .collect()
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
             WHERE n.c_5_embedding_version IS NOT NULL
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
