use std::path::Path;

use neo4rs::query;
use serde::Serialize;

use crate::meta;
use crate::seed::{
    seed_baseline_coordinates, seed_baseline_snapshot_queries, seed_relationship_types,
};
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
pub struct ManagedVersionSnapshot {
    pub graph_revision: i64,
    pub schema_version: String,
    pub seed_source_hash: String,
    pub dataset_source_hash: String,
    pub relation_registry_hash: String,
    pub kernel_source_hash: String,
    pub embedding_version: String,
    pub q_schema_version: String,
    pub ontology_version_iri: String,
    pub ontology_turtle_sha256: String,
    pub gds_projection_version: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedVersionDrift {
    pub schema: String,
    pub seed: String,
    pub dataset: String,
    pub relation_registry: String,
    pub kernel_relations: String,
    pub semantic_embedding: String,
    pub q_schema: String,
    pub ontology: String,
    pub gds: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedVersionsReport {
    pub desired: ManagedVersionSnapshot,
    pub live: ManagedVersionSnapshot,
    pub drift: ManagedVersionDrift,
}

#[derive(Debug, Clone, Copy)]
struct GraphBackedEvidence {
    seed_baseline_ok: bool,
    dataset_nodes: i64,
    relation_registry_ok: bool,
    gds_available: bool,
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
    pub managed_versions: ManagedVersionsReport,
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
    let desired_versions = meta::desired_meta(epi_s2_graph_schema::SCHEMA_VERSION, 0);
    let default_live = ManagedVersionSnapshot {
        graph_revision: 0,
        schema_version: String::new(),
        seed_source_hash: String::new(),
        dataset_source_hash: String::new(),
        relation_registry_hash: String::new(),
        kernel_source_hash: String::new(),
        embedding_version: String::new(),
        q_schema_version: String::new(),
        ontology_version_iri: String::new(),
        ontology_turtle_sha256: String::new(),
        gds_projection_version: String::new(),
    };
    let desired_snapshot = managed_version_snapshot(&desired_versions);
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
            managed_versions: ManagedVersionsReport {
                desired: desired_snapshot.clone(),
                live: default_live.clone(),
                drift: managed_version_drift(
                    &default_live,
                    &desired_snapshot,
                    GraphBackedEvidence {
                        seed_baseline_ok: false,
                        dataset_nodes: 0,
                        relation_registry_ok: false,
                        gds_available: false,
                    },
                ),
            },
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
                managed_versions: ManagedVersionsReport {
                    desired: desired_snapshot.clone(),
                    live: default_live.clone(),
                    drift: managed_version_drift(
                        &default_live,
                        &desired_snapshot,
                        GraphBackedEvidence {
                            seed_baseline_ok: false,
                            dataset_nodes: 0,
                            relation_registry_ok: false,
                            gds_available: false,
                        },
                    ),
                },
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
                managed_versions: ManagedVersionsReport {
                    desired: desired_snapshot.clone(),
                    live: default_live.clone(),
                    drift: managed_version_drift(
                        &default_live,
                        &desired_snapshot,
                        GraphBackedEvidence {
                            seed_baseline_ok: false,
                            dataset_nodes: 0,
                            relation_registry_ok: false,
                            gds_available: false,
                        },
                    ),
                },
                error: Some(err),
            }
        }
    };
    let graph_backed = graph_backed_evidence(client)
        .await
        .unwrap_or(GraphBackedEvidence {
            seed_baseline_ok: false,
            dataset_nodes: 0,
            relation_registry_ok: false,
            gds_available: false,
        });
    let live_snapshot = graph_meta
        .as_ref()
        .map(managed_version_snapshot)
        .unwrap_or_else(|| default_live.clone());
    let managed_versions = ManagedVersionsReport {
        desired: desired_snapshot.clone(),
        live: live_snapshot.clone(),
        drift: managed_version_drift(&live_snapshot, &desired_snapshot, graph_backed),
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
                managed_versions: managed_versions.clone(),
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
                    managed_versions: managed_versions.clone(),
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
        managed_versions,
        error: None,
    }
}

fn managed_version_snapshot(meta: &meta::GraphMeta) -> ManagedVersionSnapshot {
    ManagedVersionSnapshot {
        graph_revision: meta.graph_revision,
        schema_version: meta.schema_version.clone(),
        seed_source_hash: meta.seed_source_hash.clone(),
        dataset_source_hash: meta.dataset_source_hash.clone(),
        relation_registry_hash: meta.relation_registry_hash.clone(),
        kernel_source_hash: meta.kernel_source_hash.clone(),
        embedding_version: meta.embedding_version.clone(),
        q_schema_version: meta.q_schema_version.clone(),
        ontology_version_iri: meta.ontology_version_iri.clone(),
        ontology_turtle_sha256: meta.ontology_turtle_sha256.clone(),
        gds_projection_version: meta.gds_projection_version.clone(),
    }
}

fn drift_state(live: &str, desired: &str) -> String {
    if live.is_empty() {
        "missing".into()
    } else if live == desired {
        "aligned".into()
    } else {
        "drift".into()
    }
}

fn managed_version_drift(
    live: &ManagedVersionSnapshot,
    desired: &ManagedVersionSnapshot,
    graph_backed: GraphBackedEvidence,
) -> ManagedVersionDrift {
    ManagedVersionDrift {
        schema: drift_state(&live.schema_version, &desired.schema_version),
        seed: if live.seed_source_hash == desired.seed_source_hash {
            "aligned".into()
        } else if graph_backed.seed_baseline_ok {
            "graph-backed".into()
        } else {
            drift_state(&live.seed_source_hash, &desired.seed_source_hash)
        },
        dataset: if live.dataset_source_hash == desired.dataset_source_hash {
            "aligned".into()
        } else if graph_backed.dataset_nodes > 0 {
            "graph-backed".into()
        } else {
            drift_state(&live.dataset_source_hash, &desired.dataset_source_hash)
        },
        relation_registry: if live.relation_registry_hash == desired.relation_registry_hash {
            "aligned".into()
        } else if graph_backed.relation_registry_ok {
            "graph-backed".into()
        } else {
            drift_state(
                &live.relation_registry_hash,
                &desired.relation_registry_hash,
            )
        },
        kernel_relations: drift_state(&live.kernel_source_hash, &desired.kernel_source_hash),
        semantic_embedding: drift_state(&live.embedding_version, &desired.embedding_version),
        q_schema: drift_state(&live.q_schema_version, &desired.q_schema_version),
        ontology: if live.ontology_version_iri.is_empty() || live.ontology_turtle_sha256.is_empty()
        {
            "missing".into()
        } else if live.ontology_version_iri == desired.ontology_version_iri
            && live.ontology_turtle_sha256 == desired.ontology_turtle_sha256
        {
            "aligned".into()
        } else {
            "drift".into()
        },
        gds: if !graph_backed.gds_available && live.gds_projection_version.is_empty() {
            "blocked-by-topology".into()
        } else {
            drift_state(
                &live.gds_projection_version,
                &desired.gds_projection_version,
            )
        },
    }
}

async fn graph_backed_evidence(client: &Neo4jClient) -> Result<GraphBackedEvidence, String> {
    let dataset_rows = client
        .run(
            "MATCH (n:Bimba)
             WHERE n.c_3_source_dataset IS NOT NULL
             RETURN count(n) AS c",
        )
        .await
        .map_err(|err| format!("dataset evidence query failed: {err}"))?;
    let dataset_nodes = dataset_rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();

    let rel_rows = client
        .run("MATCH ()-[r]->() RETURN collect(DISTINCT type(r)) AS rel_types")
        .await
        .map_err(|err| format!("relationship evidence query failed: {err}"))?;
    let rel_types: Vec<String> = rel_rows
        .first()
        .and_then(|row| row.get("rel_types").ok())
        .unwrap_or_default();
    let relation_registry_ok = rel_types.iter().all(|rel_type| {
        !matches!(
            epi_s2_graph_schema::classify_relationship_type(rel_type),
            epi_s2_graph_schema::RelationshipTypeClass::Drift
        )
    });

    let seed_queries = seed_baseline_snapshot_queries();
    let count_query = seed_queries
        .iter()
        .find(|query| query.name == "seed_node_group_counts")
        .ok_or_else(|| "seed count query missing".to_owned())?;
    let rel_query = seed_queries
        .iter()
        .find(|query| query.name == "seed_relationship_count")
        .ok_or_else(|| "seed relationship query missing".to_owned())?;
    let coordinates = seed_baseline_coordinates();
    let seed_rows = client
        .run_query(query(count_query.cypher).param("coordinates", coordinates.clone()))
        .await
        .map_err(|err| format!("seed evidence query failed: {err}"))?;
    let seed_rel_rows = client
        .run_query(
            query(rel_query.cypher)
                .param("coordinates", coordinates)
                .param(
                    "relationship_types",
                    seed_relationship_types()
                        .iter()
                        .map(|rel_type| (*rel_type).to_string())
                        .collect::<Vec<_>>(),
                ),
        )
        .await
        .map_err(|err| format!("seed relationship evidence query failed: {err}"))?;
    let seed_row = seed_rows
        .first()
        .ok_or_else(|| "seed evidence row missing".to_owned())?;
    let seed_relationships = seed_rel_rows
        .first()
        .and_then(|row| row.get::<i64>("seed_relationships").ok())
        .unwrap_or_default();
    let seed_baseline_ok = seed_row.get::<i64>("seed_nodes").unwrap_or_default() == 102
        && seed_row.get::<i64>("root_nodes").unwrap_or_default() == 1
        && seed_row.get::<i64>("psychoids").unwrap_or_default() == 6
        && seed_row.get::<i64>("weaves").unwrap_or_default() == 4
        && seed_row.get::<i64>("context_frames").unwrap_or_default() == 7
        && seed_row.get::<i64>("family_meta_nodes").unwrap_or_default() == 6
        && seed_row
            .get::<i64>("family_coordinates")
            .unwrap_or_default()
            == 72
        && seed_row.get::<i64>("vak_nodes").unwrap_or_default() == 6
        && seed_relationships >= 306;

    let gds_count = crate::gds::gds_procedure_count(client)
        .await
        .unwrap_or_default();

    Ok(GraphBackedEvidence {
        seed_baseline_ok,
        dataset_nodes,
        relation_registry_ok,
        gds_available: gds_count > 0,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn managed_version_drift_prefers_graph_backed_legacy_evidence_over_false_missing() {
        let desired = ManagedVersionSnapshot {
            graph_revision: 0,
            schema_version: "schema".into(),
            seed_source_hash: "seed-new".into(),
            dataset_source_hash: "dataset-new".into(),
            relation_registry_hash: "registry-new".into(),
            kernel_source_hash: "kernel-new".into(),
            embedding_version: "embed".into(),
            q_schema_version: "q".into(),
            ontology_version_iri: "ontology".into(),
            ontology_turtle_sha256: "ttl".into(),
            gds_projection_version: "gds-new".into(),
        };
        let live = ManagedVersionSnapshot {
            graph_revision: 2,
            schema_version: "schema".into(),
            seed_source_hash: "seed-old".into(),
            dataset_source_hash: String::new(),
            relation_registry_hash: String::new(),
            kernel_source_hash: String::new(),
            embedding_version: "embed".into(),
            q_schema_version: "q".into(),
            ontology_version_iri: "ontology".into(),
            ontology_turtle_sha256: "ttl".into(),
            gds_projection_version: String::new(),
        };

        let drift = managed_version_drift(
            &live,
            &desired,
            GraphBackedEvidence {
                seed_baseline_ok: true,
                dataset_nodes: 1882,
                relation_registry_ok: true,
                gds_available: false,
            },
        );

        assert_eq!(drift.seed, "graph-backed");
        assert_eq!(drift.dataset, "graph-backed");
        assert_eq!(drift.relation_registry, "graph-backed");
        assert_eq!(drift.gds, "blocked-by-topology");
        assert_eq!(drift.ontology, "aligned");
    }
}
