use clap::{Subcommand, ValueEnum};
use neo4rs::query;

pub mod alignment_validator;
pub mod analyse;
pub mod anuttara;
pub mod api;
pub mod bidirectional_sync;
pub mod client;
pub mod constraint;
pub mod coordinate_array_parser;
pub mod cypher;
pub mod dataset_import;
pub mod dev;
pub mod doctor;
pub mod embeddings;
pub mod ingest;
pub mod link_enforcement;
pub mod mapper;
pub mod meta;
pub mod redis_cache;
pub mod relationship_manager;
pub mod retrieval;
pub mod schema;
pub mod seed;
pub mod semantic;
pub mod semantic_cache;
pub mod sync;
pub mod sync_coordinator;
pub mod sync_orchestrator;
pub mod types;

#[derive(Subcommand)]
pub enum GraphCmd {
    /// Initialize schema + seed coordinate space (~96 nodes)
    Init,
    /// Bootstrap an empty graph with schema + seed data
    Bootstrap,
    /// Apply the current managed seed state onto the graph
    Update,
    /// Compare current managed state to desired state and align if needed
    Reconcile,
    /// Reload the S2 ontology bridge into Neo4j via n10s when available
    #[command(name = "reload-ontology")]
    ReloadOntology,
    /// Create or refresh the S2 Option 1 GDS projection when GDS is available
    #[command(name = "refresh-gds")]
    RefreshGds,
    /// Bootstrap the local graph development stack and RedisVL environment
    #[command(name = "bootstrap-dev")]
    BootstrapDev {
        /// Show the plan without starting services or installing dependencies
        #[arg(long)]
        dry_run: bool,
    },
    /// Deep health report for Neo4j, Redis Stack, semantic cache, and graph state
    Doctor,
    /// Show Neo4j/Redis connection status
    Status,
    /// Start Docker containers (epi-S2)
    Up,
    /// Stop Docker containers
    Down,
    /// Query by QL coordinate (#0-#5, P0-P5, etc.)
    Query {
        coordinate: String,
        /// Disclosure level (1-5)
        #[arg(short, long, default_value = "1")]
        level: u8,
        /// Traversal depth
        #[arg(short, long)]
        depth: Option<u32>,
    },
    /// Sync vault to graph
    Sync { path: Option<String> },
    /// Classify a path against the S2 agent-facing promotion policy
    #[command(name = "promotion-policy")]
    PromotionPolicy {
        /// Vault, docs, or repo path to classify
        path: String,
    },
    /// Print the S2 frontmatter-to-property rulebook for agents
    #[command(name = "property-rules")]
    PropertyRules,
    /// Print the S2 coordinate semantics and property-key construction law
    #[command(name = "coordinate-semantics")]
    CoordinateSemantics,
    /// Plan Graphiti routing for day/now/thought material without mutating Neo4j
    #[command(name = "graphiti-plan")]
    GraphitiPlan {
        /// Vault path to route
        path: String,
        /// Optional source coordinate to attach as episode context
        #[arg(long)]
        coordinate: Option<String>,
    },
    /// Validate or apply a full S2 graph promotion intent JSON payload
    #[command(name = "promote-intent")]
    PromoteIntent {
        /// JSON file containing an S2GraphPromotionIntent
        intent_file: String,
        /// Validate and render the S2 plan without writing Neo4j
        #[arg(long)]
        dry_run: bool,
    },
    /// Coordinate-based retrieval
    Retrieve {
        coordinate: String,
        #[arg(short, long)]
        nested: bool,
    },
    /// GraphRAG retrieval
    #[command(name = "graphrag")]
    GraphRAG {
        query: String,
        #[arg(short, long)]
        depth: Option<usize>,
    },
    /// Hybrid vector + graph retrieval
    Hybrid {
        query: String,
        #[arg(short, long)]
        top_k: Option<usize>,
    },
    /// Import Bimba namespace datasets from Idea/Bimba/Map/datasets/
    Import {
        /// "all", "low-detail", "deep", a "*-deep" branch, or a dataset JSON path
        #[arg(default_value = "all")]
        dataset: String,
    },
    /// Augment Parashakti ChakralCenter nodes with body_zones arrays + decan body data (Phase 9)
    #[command(name = "seed-nara")]
    SeedNara,
    /// Run constrained Cypher against the bimba graph (read-only by default)
    Cypher {
        /// Cypher query string
        query: String,
        /// JSON object of scalar parameters
        #[arg(short, long)]
        params: Option<String>,
        /// Maximum rows to return (default 200, capped at 10000)
        #[arg(long, default_value_t = cypher::DEFAULT_ROW_LIMIT)]
        limit: usize,
        /// Allow write operations (CREATE/MERGE/SET/DELETE/REMOVE/CALL/FOREACH)
        #[arg(long)]
        write: bool,
        /// Allow DDL (CREATE INDEX, CREATE CONSTRAINT, etc.) — implies --write
        #[arg(long)]
        admin: bool,
    },
    /// Open a typed document ingestion session
    Ingest {
        /// Path to the document being ingested (acts as the document_id)
        document: String,
        /// Engaged Bimba coordinate (e.g., M2-1-3)
        #[arg(short, long)]
        coordinate: String,
        /// Session key for this ingestion arc
        #[arg(short = 'k', long)]
        session_key: String,
    },
    /// Produce a structured 72-vector resonance analysis for a document
    #[command(name = "analyse-resonance")]
    AnalyseResonance {
        /// Path to the document to analyse
        document: String,
        /// Engaged Bimba coordinate
        #[arg(short, long)]
        coordinate: String,
        /// Optional ingestion session id to advance through PrehensiveAnalysis
        #[arg(long)]
        session_id: Option<String>,
    },
    /// Persist a completed resonance analysis to the bimba map
    #[command(name = "persist-analysis")]
    PersistAnalysis {
        /// Path to a JSON file containing a ResonanceAnalysis
        analysis_file: String,
        /// Session key for the deposit
        #[arg(short = 'k', long)]
        session_key: String,
        /// Optional ingestion session id to advance through PersistedAnalysis
        #[arg(long)]
        session_id: Option<String>,
    },
    /// Recompute the aggregate target resonance vector for a coordinate
    #[command(name = "aggregate-resonance")]
    AggregateResonance {
        /// Engaged Bimba coordinate
        coordinate: String,
    },
    /// Verify a trajectory deposit against the registered constraints
    #[command(name = "verify-trajectory")]
    VerifyTrajectory {
        /// Path to a JSON file containing a TrajectoryDeposit
        deposit_file: String,
    },
    /// Constraint registry management
    Constraint {
        #[command(subcommand)]
        cmd: ConstraintCmd,
    },
    /// Parse an Anuttara symbolic-coordinate diagnostic string
    #[command(name = "ask-anuttara")]
    AskAnuttara {
        /// Symbolic expression to parse (e.g., "?#2-1-3-4{2,4}; ○")
        expression: String,
        /// Coordinate context to include in the reflection prompt
        #[arg(short, long, default_value = "M0")]
        coordinate: String,
        /// Optional session key
        #[arg(short = 'k', long)]
        session_key: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum ConstraintCmd {
    /// List all registered constraints
    List,
    /// Register or replace a constraint
    Register {
        /// Constraint name (unique within registry)
        name: String,
        /// Path to a .cypher file containing the read-only query
        query_file: String,
        /// Severity level
        #[arg(short, long, value_enum, default_value_t = ConstraintSeverityArg::Warning)]
        severity: ConstraintSeverityArg,
        /// Anuttara template (e.g., "?#{coord}{3}")
        #[arg(short, long)]
        template: String,
    },
    /// Enable a constraint by name
    Enable { name: String },
    /// Disable a constraint by name
    Disable { name: String },
    /// Remove a constraint by name
    Remove { name: String },
}

#[derive(Clone, Copy, Debug, ValueEnum)]
pub enum ConstraintSeverityArg {
    Info,
    Warning,
    Error,
}

impl From<ConstraintSeverityArg> for epi_kernel_contract::ConstraintSeverity {
    fn from(value: ConstraintSeverityArg) -> Self {
        match value {
            ConstraintSeverityArg::Info => Self::Info,
            ConstraintSeverityArg::Warning => Self::Warning,
            ConstraintSeverityArg::Error => Self::Error,
        }
    }
}

// Compatibility re-export bundle: graph-law primitives owned by
// `Body/S/S2/graph-services`, surfaced through `crate::graph::*` so the
// CLI dispatch + lib consumers can keep importing through this façade.
// New behavior MUST land in S2 — these names exist only as adapter seams.
pub use epi_s2_graph_services::{
    fusion_rrf_results, gds_procedure_count, import_epi_ontology_with_n10s,
    kernel_coordinate_anchor_from_parts, live_graph_backed_evidence,
    maybe_refresh_semantic_embeddings, option1_projection_plan, parse_yaml_frontmatter,
    seed::seed_baseline_coordinates, seed::seed_baseline_snapshot_queries,
    seed::seed_relationship_types, GraphMethodParams, GraphMethodService, GraphNodeRequest,
    GraphQueryRequest, GraphTraverseDirection, GraphTraverseRequest, HybridFusionConfig,
    KernelResonanceObservationRequest, LiveGraphBackedEvidence, PointerWebRefreshRequest,
    RetrievalResult,
};

fn compose_file_path() -> Result<String, String> {
    let candidates = [
        std::env::var("EPILOGOS_ROOT").ok(),
        std::env::current_exe().ok().and_then(|p| {
            p.parent()?
                .parent()?
                .parent()
                .map(|p| p.to_string_lossy().into_owned())
        }),
        std::env::current_dir()
            .ok()
            .map(|p| p.to_string_lossy().into_owned()),
    ];
    for candidate in candidates.iter().flatten() {
        let mut cursor = std::path::Path::new(candidate);
        loop {
            let path = cursor.join("docker-compose.epi-s2.yml");
            if path.exists() {
                return Ok(path.to_string_lossy().into_owned());
            }
            let Some(parent) = cursor.parent() else {
                break;
            };
            cursor = parent;
        }
    }
    // Fallback: check common locations
    let home = dirs::home_dir().unwrap_or_default();
    let fallback = home
        .join("Documents")
        .join("Epi-Logos C Experiments")
        .join("docker-compose.epi-s2.yml");
    if fallback.exists() {
        return Ok(fallback.to_string_lossy().into_owned());
    }
    Err("docker-compose.epi-s2.yml not found; set EPILOGOS_ROOT to the repository root or a Body descendant".into())
}

pub async fn dispatch(cmd: &GraphCmd) -> Result<String, String> {
    dispatch_with_format(cmd, false).await
}

pub async fn dispatch_with_format(cmd: &GraphCmd, json: bool) -> Result<String, String> {
    match cmd {
        GraphCmd::Init => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            if meta::is_bootstrapped(&client).await? {
                return Err(
                    "graph is not empty; use `graph update` or `graph reconcile` instead".into(),
                );
            }
            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            meta::write_graph_meta(
                &client,
                &meta::applied_meta(schema::SCHEMA_VERSION, 1, None),
            )
            .await?;
            Ok(format!(
                "Init bootstrapped graph\n\n{}\n\n{}",
                schema_result, seed_result
            ))
        }
        GraphCmd::Bootstrap => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            if meta::is_bootstrapped(&client).await? {
                return Err("graph is not empty; bootstrap only runs on empty graphs".into());
            }
            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            meta::write_graph_meta(
                &client,
                &meta::applied_meta(schema::SCHEMA_VERSION, 1, None),
            )
            .await?;
            Ok(format!(
                "Bootstrap complete\n\n{}\n\n{}",
                schema_result, seed_result
            ))
        }
        GraphCmd::Update => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            let current_meta = meta::read_graph_meta(&client).await?;
            let current_revision = current_meta
                .as_ref()
                .map(|m| m.graph_revision)
                .unwrap_or_default();
            meta::write_graph_meta(
                &client,
                &meta::applied_meta(
                    schema::SCHEMA_VERSION,
                    current_revision + 1,
                    current_meta.as_ref(),
                ),
            )
            .await?;
            let semantic_result = maybe_refresh_semantic_embeddings(&client).await?;
            Ok(format!(
                "Update applied\n\n{}\n\n{}",
                schema_result,
                [seed_result, semantic_result]
                    .into_iter()
                    .filter(|item| !item.is_empty())
                    .collect::<Vec<_>>()
                    .join("\n\n")
            ))
        }
        GraphCmd::Reconcile => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let current_meta = meta::read_graph_meta(&client).await?;
            let bootstrapped = meta::is_bootstrapped(&client).await?;
            let desired_meta = meta::desired_meta(
                schema::SCHEMA_VERSION,
                current_meta
                    .as_ref()
                    .map(|meta| meta.graph_revision)
                    .unwrap_or_default(),
            );
            let graph_backed = live_graph_backed_evidence(&client).await?;

            if !bootstrapped {
                let schema_result = schema::create_schema(&client).await?;
                let seed_result = seed::seed_coordinate_space(&client).await?;
                meta::write_graph_meta(
                    &client,
                    &meta::applied_meta(schema::SCHEMA_VERSION, 1, None),
                )
                .await?;
                return Ok(format!(
                    "Reconcile bootstrapped empty graph\n\n{}\n\n{}",
                    schema_result, seed_result
                ));
            }

            let structural_aligned = graph_backed.seed_baseline_ok
                && graph_backed.relation_registry_ok
                && current_meta
                    .as_ref()
                    .map(|meta| {
                        meta.schema_version == schema::SCHEMA_VERSION
                            && meta.embedding_version == meta::EMBEDDING_VERSION
                            && meta.q_schema_version == meta::Q_SCHEMA_VERSION
                    })
                    .unwrap_or(false);
            let mut manual_drift = Vec::new();
            if graph_backed.dataset_nodes == 0 {
                manual_drift.push("dataset");
            }
            if current_meta
                .as_ref()
                .map(|meta| {
                    meta.ontology_version_iri.is_empty() || meta.ontology_turtle_sha256.is_empty()
                })
                .unwrap_or(true)
            {
                manual_drift.push("ontology");
            }
            if graph_backed.gds_available
                && current_meta
                    .as_ref()
                    .map(|meta| meta.gds_projection_version.is_empty())
                    .unwrap_or(true)
            {
                manual_drift.push("gds");
            }
            if structural_aligned {
                return if manual_drift.is_empty() {
                    Ok("Reconcile: graph already aligned".into())
                } else {
                    Ok(format!(
                        "Reconcile: structural state aligned; manual drift remains for {}. Use `graph import all`, ontology reload, and GDS projection refresh before release.",
                        manual_drift.join(", ")
                    ))
                };
            }

            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            let current_revision = current_meta
                .as_ref()
                .map(|m| m.graph_revision)
                .unwrap_or_default();
            meta::write_graph_meta(
                &client,
                &meta::applied_meta(
                    schema::SCHEMA_VERSION,
                    current_revision + 1,
                    current_meta.as_ref(),
                ),
            )
            .await?;
            let semantic_result = maybe_refresh_semantic_embeddings(&client).await?;
            let post_meta = meta::read_graph_meta(&client).await?;
            let post_graph_backed = live_graph_backed_evidence(&client).await?;
            let mut remaining_manual_drift = Vec::new();
            if post_graph_backed.dataset_nodes == 0 {
                remaining_manual_drift.push("dataset");
            }
            if post_meta
                .as_ref()
                .map(|meta| {
                    meta.ontology_version_iri.is_empty() || meta.ontology_turtle_sha256.is_empty()
                })
                .unwrap_or(true)
            {
                remaining_manual_drift.push("ontology");
            }
            if post_graph_backed.gds_available
                && post_meta
                    .as_ref()
                    .map(|meta| meta.gds_projection_version.is_empty())
                    .unwrap_or(true)
            {
                remaining_manual_drift.push("gds");
            }
            let drift_summary = if remaining_manual_drift.is_empty() {
                String::new()
            } else {
                format!(
                    "\n\nManual drift remains for {}. Re-import datasets and refresh ontology/GDS state before treating the graph as release-ready.",
                    remaining_manual_drift.join(", ")
                )
            };
            Ok(format!(
                "Reconcile applied updates{}\n\n{}\n\n{}",
                drift_summary,
                schema_result,
                [seed_result, semantic_result]
                    .into_iter()
                    .filter(|item| !item.is_empty())
                    .collect::<Vec<_>>()
                    .join("\n\n")
            ))
        }
        GraphCmd::ReloadOntology => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let current_revision = meta::read_graph_meta(&client)
                .await?
                .as_ref()
                .map(|meta| meta.graph_revision)
                .unwrap_or_default();
            import_epi_ontology_with_n10s(&client).await?;
            let current_meta = meta::read_graph_meta(&client).await?;
            meta::write_graph_meta(
                &client,
                &meta::applied_meta(
                    schema::SCHEMA_VERSION,
                    current_revision + 1,
                    current_meta.as_ref(),
                ),
            )
            .await?;
            Ok("Ontology bridge reloaded and GraphMeta updated".into())
        }
        GraphCmd::RefreshGds => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let gds_count = gds_procedure_count(&client).await?;
            if gds_count == 0 {
                return Err(
                    "GDS procedures are unavailable; graph doctor must remain blocked until the Neo4j topology installs GDS.".into(),
                );
            }

            let plan = option1_projection_plan();
            let rows = client
                .run_query(
                    query(&plan.graph_list_cypher)
                        .param("projection_name", plan.projection_name.as_str()),
                )
                .await
                .map_err(|err| format!("gds graph list failed: {err}"))?;
            let projection_exists = rows.iter().any(|row| {
                row.get::<String>("graphName")
                    .map(|name| name == plan.projection_name)
                    .unwrap_or(false)
            });

            let summary = if projection_exists {
                "GDS projection already present".to_owned()
            } else {
                let node_projection = plan
                    .included_labels
                    .first()
                    .cloned()
                    .ok_or_else(|| "GDS plan missing node projection".to_owned())?;
                client
                    .run_query(
                        query(&plan.project_cypher)
                            .param("projection_name", plan.projection_name.as_str())
                            .param("node_projection", node_projection)
                            .param("relationship_projection", plan.relationship_types.clone()),
                    )
                    .await
                    .map_err(|err| format!("gds graph project failed: {err}"))?;
                "GDS projection created".to_owned()
            };

            let current_meta = meta::read_graph_meta(&client).await?;
            let next_revision = current_meta
                .as_ref()
                .map(|meta| meta.graph_revision + 1)
                .unwrap_or(1);
            let mut applied =
                meta::applied_meta(schema::SCHEMA_VERSION, next_revision, current_meta.as_ref());
            applied.gds_projection_version =
                meta::desired_meta(schema::SCHEMA_VERSION, next_revision).gds_projection_version;
            meta::write_graph_meta(&client, &applied).await?;
            Ok(format!(
                "{}: {} ({})",
                summary, plan.projection_name, plan.projection_version
            ))
        }
        GraphCmd::BootstrapDev { dry_run } => {
            let compose_file = compose_file_path()?;
            let repo_root = dev::repo_root_from_compose(std::path::Path::new(&compose_file))?;
            dev::run_bootstrap_dev(
                &repo_root,
                std::path::Path::new(&compose_file),
                *dry_run,
                json,
            )
            .await
        }
        GraphCmd::Doctor => {
            let compose_file = compose_file_path()?;
            let repo_root = dev::repo_root_from_compose(std::path::Path::new(&compose_file))?;
            let report = doctor::collect_report(&repo_root).await;
            if json {
                serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
            } else {
                Ok(doctor::render_human(&report))
            }
        }
        GraphCmd::Status => {
            let compose_file = compose_file_path()?;
            let repo_root = dev::repo_root_from_compose(std::path::Path::new(&compose_file))?;
            let report = doctor::collect_report(&repo_root).await;
            if json {
                serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
            } else {
                Ok(doctor::render_status(&report))
            }
        }

        GraphCmd::Up => {
            let compose_file = compose_file_path()?;
            let output = std::process::Command::new("docker")
                .args(["compose", "-f", &compose_file, "up", "-d"])
                .output()
                .map_err(|e| format!("docker compose failed: {}", e))?;
            if output.status.success() {
                Ok("S2 containers started (epi-neo4j, epi-redis)".into())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).into_owned())
            }
        }

        GraphCmd::Down => {
            let compose_file = compose_file_path()?;
            let output = std::process::Command::new("docker")
                .args(["compose", "-f", &compose_file, "down"])
                .output()
                .map_err(|e| format!("docker compose failed: {}", e))?;
            if output.status.success() {
                Ok("S2 containers stopped".into())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).into_owned())
            }
        }

        GraphCmd::Query {
            coordinate,
            level,
            depth,
        } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let retriever = retrieval::graphrag::GraphRAGRetriever::new(&neo4j);
            let mut payload = retriever.retrieve(coordinate, *depth, Some(1)).await?;
            payload["requested_level"] = serde_json::json!((*level).min(5));
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }

        GraphCmd::Sync { path } => {
            let vault_path = path.as_deref().unwrap_or(".");

            // Read file
            let content =
                std::fs::read_to_string(vault_path).map_err(|e| format!("read error: {}", e))?;

            // Parse frontmatter
            let frontmatter =
                parse_yaml_frontmatter(&content).ok_or("no YAML frontmatter found")?;

            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let coordinator = sync_coordinator::SyncCoordinator::new(&neo4j);
            let result = coordinator
                .sync_from_vault(vault_path, &frontmatter, &content)
                .await?;

            Ok(format!(
                "Synced {} -> graph ({}): {} relationships created",
                result.vault_path, result.coordinate, result.relationships_created
            ))
        }
        GraphCmd::PromotionPolicy { path } => {
            let decision = sync_coordinator::SyncCoordinator::classify_promotion_path(path);
            if json {
                serde_json::to_string_pretty(&decision).map_err(|e| e.to_string())
            } else {
                Ok(format!(
                    "Promotion policy: {:?} -> {:?}\n{}",
                    decision.class, decision.target_surface, decision.reason
                ))
            }
        }
        GraphCmd::PropertyRules => {
            let rules = sync_coordinator::SyncCoordinator::frontmatter_property_rules();
            if json {
                serde_json::to_string_pretty(rules).map_err(|e| e.to_string())
            } else {
                Ok(rules
                    .iter()
                    .map(|rule| {
                        format!(
                            "{} -> {} ({:?})",
                            rule.frontmatter_key, rule.canonical_property, rule.kind
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        GraphCmd::CoordinateSemantics => {
            let semantics = epi_s2_graph_schema::coordinate_semantic_registry();
            if json {
                serde_json::to_string_pretty(&semantics).map_err(|e| e.to_string())
            } else {
                Ok(format!(
                    "Coordinate identity: {}\nProperty keys: {} / {}\nAuthorities: {}",
                    semantics.property_law.identity_property,
                    semantics.property_law.direct_key_pattern,
                    semantics.property_law.inverted_key_pattern,
                    semantics.authority_paths.join(", ")
                ))
            }
        }
        GraphCmd::GraphitiPlan { path, coordinate } => {
            let plan = sync_coordinator::SyncCoordinator::plan_graphiti_episode(
                path,
                coordinate.as_deref(),
            )?;
            if json {
                serde_json::to_string_pretty(&plan).map_err(|e| e.to_string())
            } else {
                Ok(format!(
                    "Graphiti plan: {} ({})\n{}",
                    plan.source_path, plan.episode_kind, plan.reason
                ))
            }
        }
        GraphCmd::PromoteIntent {
            intent_file,
            dry_run,
        } => {
            let payload = std::fs::read_to_string(intent_file)
                .map_err(|e| format!("promotion intent read error: {e}"))?;
            let intent: epi_s2_graph_services::S2GraphPromotionIntent =
                serde_json::from_str(&payload)
                    .map_err(|e| format!("promotion intent JSON error: {e}"))?;
            let plan = sync_coordinator::SyncCoordinator::validate_promotion_intent(&intent)?;
            if *dry_run {
                let report = epi_s2_graph_services::GraphPromotionSyncReport::planned(&plan);
                if json {
                    serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
                } else {
                    Ok(format!(
                        "Promotion dry-run: {} -> {} relationship action(s)",
                        report.coordinate,
                        report.relation_actions.len()
                    ))
                }
            } else {
                let config = client::Neo4jConfig::from_env();
                let neo4j = client::Neo4jClient::connect(&config)
                    .map_err(|e| format!("connect failed: {}", e))?;
                let coordinator = sync_coordinator::SyncCoordinator::new(&neo4j);
                let report = coordinator.promote_intent(&intent).await?;
                if json {
                    serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
                } else {
                    Ok(format!(
                        "Promoted {} from {}",
                        report.coordinate, report.source_path
                    ))
                }
            }
        }
        GraphCmd::Retrieve { coordinate, nested } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let retriever = retrieval::graphrag::GraphRAGRetriever::new(&neo4j);
            let payload = retriever
                .retrieve(coordinate, Some(if *nested { 2 } else { 1 }), Some(1))
                .await?;
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }
        GraphCmd::GraphRAG { query, depth } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let retriever = retrieval::graphrag::GraphRAGRetriever::new(&neo4j);
            let payload = retriever
                .retrieve(query, depth.map(|v| v as u32), Some(10))
                .await?;
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }
        GraphCmd::Hybrid { query, top_k } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let retriever = retrieval::hybrid::HybridRetriever::new(&neo4j);
            let results = retriever
                .retrieve(query, retrieval::hybrid::RetrievalMode::HybridRrf, *top_k)
                .await?;
            let payload = serde_json::json!({
                "query": query,
                "mode": "hybrid_rrf",
                "results": results.iter().map(|item| {
                    serde_json::json!({
                        "coordinate": item.coordinate,
                        "score": item.score,
                        "source": item.source,
                        "data": item.data,
                    })
                }).collect::<Vec<_>>(),
            });
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }

        GraphCmd::Import { dataset } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;

            let datasets_dir = std::env::var("EPILOGOS_DATASETS").unwrap_or_else(|_| {
                let home = dirs::home_dir().unwrap_or_default();
                home.join("Documents")
                    .join("Epi-Logos C Experiments")
                    .join("docs")
                    .join("datasets")
                    .to_string_lossy()
                    .into_owned()
            });

            let importer = dataset_import::DatasetImporter::new(&neo4j, &datasets_dir);

            let output = if dataset == "all" {
                importer.import_all().await
            } else if dataset == "low-detail" {
                importer.import_low_detail_all().await
            } else if dataset == "deep" {
                importer.import_deep_all().await
            } else if dataset.ends_with("-deep") {
                importer.import_deep_branch(dataset).await
            } else if dataset.starts_with("nodes_") || dataset.contains("/nodes_") {
                let count = importer.import_nodes(dataset).await?;
                Ok(format!("Imported {} nodes from {}", count, dataset))
            } else if dataset.starts_with("relations_") || dataset.contains("/relations_") {
                let count = importer.import_relations(dataset).await?;
                Ok(format!("Imported {} relations from {}", count, dataset))
            } else if dataset.ends_with(".json") && dataset.contains("nodes") {
                let count = importer.import_nodes(dataset).await?;
                Ok(format!("Imported {} nodes from {}", count, dataset))
            } else if dataset.ends_with(".json") && dataset.contains("relations") {
                let count = importer.import_relations(dataset).await?;
                Ok(format!("Imported {} relations from {}", count, dataset))
            } else {
                Err(format!(
                    "Unknown dataset: {} (expected 'all', 'low-detail', 'deep', '*-deep', nodes*.json, or relations*.json)",
                    dataset
                ))
            }?;

            let current_meta = meta::read_graph_meta(&neo4j).await?;
            let next_revision = current_meta
                .as_ref()
                .map(|meta| meta.graph_revision + 1)
                .unwrap_or(1);
            meta::write_graph_meta(
                &neo4j,
                &meta::applied_meta_with_dataset(
                    schema::SCHEMA_VERSION,
                    next_revision,
                    current_meta.as_ref(),
                ),
            )
            .await?;
            Ok(output)
        }

        GraphCmd::SeedNara => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let chakra_result = seed::seed_parashakti_body_zones(&client).await?;
            let decan_result = seed::seed_decan_body_data(&client).await?;
            Ok(format!("{}\n{}", chakra_result, decan_result))
        }
        GraphCmd::Cypher {
            query,
            params,
            limit,
            write,
            admin,
        } => {
            let mode = if *admin {
                cypher::CypherMode::ADMIN
            } else if *write {
                cypher::CypherMode::WRITE
            } else {
                cypher::CypherMode::READ_ONLY
            };
            let parsed: serde_json::Map<String, serde_json::Value> = match params.as_deref() {
                Some(raw) if !raw.trim().is_empty() => serde_json::from_str(raw)
                    .map_err(|e| format!("--params must be a JSON object: {e}"))?,
                _ => serde_json::Map::new(),
            };
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let result = cypher::run(&neo4j, query, &parsed, mode, *limit).await?;
            serde_json::to_string_pretty(&result).map_err(|e| e.to_string())
        }
        GraphCmd::Ingest {
            document,
            coordinate,
            session_key,
        } => {
            let home = ingest::ingest_home();
            let (session, path) = ingest::open_session(document, coordinate, session_key, &home)?;
            let payload = serde_json::json!({
                "session_id": session.session_id,
                "document_id": session.document_id,
                "coordinate": session.coordinate,
                "session_key": session.session_key,
                "status": session.status,
                "path": path.display().to_string(),
            });
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }
        GraphCmd::AnalyseResonance {
            document,
            coordinate,
            session_id,
        } => {
            let content =
                std::fs::read_to_string(document).map_err(|e| format!("read {document}: {e}"))?;
            let analyser = analyse::DeterministicAnalyser::new();
            let analysis = <analyse::DeterministicAnalyser as analyse::ResonanceAnalyser>::analyse(
                &analyser, document, coordinate, &content,
            )?;
            if let Some(sid) = session_id {
                let home = ingest::ingest_home();
                let mut session = ingest::load(sid, &home)?;
                let projection = portal_core::KernelProjection::from_clock_state(
                    0,
                    1,
                    [1.0, 0.0, 0.0, 0.0],
                    [0.5, 0.5, 0.5, 0.5],
                    Some(&analysis.resonance_vector),
                    None,
                    0.0,
                );
                let envelope =
                    epi_kernel_contract::KernelTickEnvelope::from_kernel_projection(1, &projection)
                        .with_session_key(session.session_key.clone())
                        .with_source_coordinate(session.coordinate.clone())
                        .with_observed_resonance(analysis.resonance_vector.clone());
                session
                    .record_envelope(
                        epi_kernel_contract::IngestionStatus::PrehensiveAnalysis,
                        envelope,
                    )
                    .map_err(str::to_owned)?;
                ingest::save(&session, &home)?;
            }
            serde_json::to_string_pretty(&analysis).map_err(|e| e.to_string())
        }
        GraphCmd::PersistAnalysis {
            analysis_file,
            session_key,
            session_id,
        } => {
            let raw = std::fs::read_to_string(analysis_file)
                .map_err(|e| format!("read {analysis_file}: {e}"))?;
            let analysis: epi_kernel_contract::ResonanceAnalysis =
                serde_json::from_str(&raw).map_err(|e| format!("parse analysis: {e}"))?;
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let service = GraphMethodService::new(&neo4j);
            let timestamp_ms = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_millis() as u64)
                .unwrap_or(1);
            let mut written = Vec::new();
            for pos in &analysis.dominant_positions {
                let request = KernelResonanceObservationRequest {
                    source_coordinate: analysis.coordinate.clone(),
                    session_key: session_key.clone(),
                    timestamp_ms,
                    lens: pos.lens,
                    ascent_helix: pos.ascent_helix,
                    position: pos.position,
                    score: pos.intensity as f64,
                    kernel_tick: 2,
                    graphiti_arc_id: None,
                };
                let outcome = service.record_kernel_resonance(request).await?;
                written.push(outcome);
            }
            if let Some(sid) = session_id {
                let home = ingest::ingest_home();
                let mut session = ingest::load(sid, &home)?;
                let projection = portal_core::KernelProjection::from_clock_state(
                    0,
                    2,
                    [1.0, 0.0, 0.0, 0.0],
                    [0.5, 0.5, 0.5, 0.5],
                    Some(&analysis.resonance_vector),
                    None,
                    0.0,
                );
                let envelope =
                    epi_kernel_contract::KernelTickEnvelope::from_kernel_projection(2, &projection)
                        .with_session_key(session.session_key.clone())
                        .with_source_coordinate(session.coordinate.clone());
                session
                    .record_envelope(
                        epi_kernel_contract::IngestionStatus::PersistedAnalysis,
                        envelope,
                    )
                    .map_err(str::to_owned)?;
                ingest::save(&session, &home)?;
            }
            let payload = serde_json::json!({
                "coordinate": analysis.coordinate,
                "dominant_positions_written": written.len(),
                "observations": written,
            });
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }
        GraphCmd::AggregateResonance { coordinate } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let resolved = GraphMethodService::resolve_coordinate_string(coordinate)?;
            let cypher_text = "MATCH (source:Bimba)
                 WHERE source.coordinate = $canonical
                 MATCH (source)-[:HAS_KERNEL_RESONANCE]->(obs:Bimba:KernelResonanceObservation)
                 RETURN obs.c_5_kernel_resonance_index AS idx,
                        avg(obs.c_5_kernel_resonance_score) AS score,
                        count(obs) AS contributions";
            let q = neo4rs::query(cypher_text)
                .param("canonical", resolved.canonical.clone())
                .param("input", resolved.input.clone());
            let rows = neo4j
                .run_query(q)
                .await
                .map_err(|e| format!("aggregate-resonance failed: {e}"))?;
            let mut target = epi_kernel_contract::ResonanceVector72::default();
            let mut total = 0usize;
            for row in &rows {
                let idx: i64 = row.get("idx").unwrap_or_default();
                let score: f64 = row.get("score").unwrap_or_default();
                if (0..72).contains(&idx) {
                    target.values[idx as usize] = score as f32;
                    total += 1;
                }
            }
            let payload = serde_json::json!({
                "coordinate": resolved.canonical,
                "dimensions_filled": total,
                "target_resonance": target,
                "square_emphasis": portal_core::kernel_resonance_square_emphasis(&target),
            });
            serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())
        }
        GraphCmd::VerifyTrajectory { deposit_file } => {
            let raw = std::fs::read_to_string(deposit_file)
                .map_err(|e| format!("read {deposit_file}: {e}"))?;
            let deposit: epi_kernel_contract::TrajectoryDeposit =
                serde_json::from_str(&raw).map_err(|e| format!("parse deposit: {e}"))?;
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let home = constraint::constraint_home();
            let report = constraint::run_all(&neo4j, &deposit, &home).await?;
            serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
        }
        GraphCmd::Constraint { cmd } => match cmd {
            ConstraintCmd::List => {
                let home = constraint::constraint_home();
                let registry = constraint::Registry::load(&home)?;
                serde_json::to_string_pretty(&registry).map_err(|e| e.to_string())
            }
            ConstraintCmd::Register {
                name,
                query_file,
                severity,
                template,
            } => {
                let home = constraint::constraint_home();
                let entry = constraint::register(
                    name,
                    std::path::Path::new(query_file),
                    (*severity).into(),
                    template,
                    &home,
                )?;
                serde_json::to_string_pretty(&entry).map_err(|e| e.to_string())
            }
            ConstraintCmd::Enable { name } => {
                let home = constraint::constraint_home();
                let mut registry = constraint::Registry::load(&home)?;
                if !registry.set_enabled(name, true) {
                    return Err(format!("constraint {name} not found"));
                }
                registry.save(&home)?;
                Ok(format!("enabled {name}"))
            }
            ConstraintCmd::Disable { name } => {
                let home = constraint::constraint_home();
                let mut registry = constraint::Registry::load(&home)?;
                if !registry.set_enabled(name, false) {
                    return Err(format!("constraint {name} not found"));
                }
                registry.save(&home)?;
                Ok(format!("disabled {name}"))
            }
            ConstraintCmd::Remove { name } => {
                let home = constraint::constraint_home();
                let mut registry = constraint::Registry::load(&home)?;
                if !registry.remove(name) {
                    return Err(format!("constraint {name} not found"));
                }
                registry.save(&home)?;
                Ok(format!("removed {name}"))
            }
        },
        GraphCmd::AskAnuttara {
            expression,
            coordinate,
            session_key,
        } => {
            let diag = anuttara::parse_strict(expression)?;
            let prompt =
                anuttara::build_reflection_prompt(diag, coordinate.clone(), session_key.clone());
            serde_json::to_string_pretty(&prompt).map_err(|e| e.to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_yaml_frontmatter_valid() {
        let content = "---\ncoordinate: \"M5\"\nname: \"Epii\"\n---\n\n# Body\n";
        let fm = parse_yaml_frontmatter(content).unwrap();
        assert_eq!(fm.get("coordinate").and_then(|v| v.as_str()), Some("M5"));
        assert_eq!(fm.get("name").and_then(|v| v.as_str()), Some("Epii"));
    }

    #[test]
    fn test_parse_yaml_frontmatter_no_frontmatter() {
        let content = "# Just a heading\n\nSome content.";
        assert!(parse_yaml_frontmatter(content).is_none());
    }

    #[test]
    fn test_parse_yaml_frontmatter_empty() {
        assert!(parse_yaml_frontmatter("").is_none());
    }

    #[test]
    fn test_parse_yaml_frontmatter_unclosed() {
        let content = "---\nkey: value\nno closing delimiter";
        assert!(parse_yaml_frontmatter(content).is_none());
    }

    #[test]
    fn test_parse_yaml_frontmatter_with_leading_whitespace() {
        let content = "  ---\ncoordinate: \"C0\"\n---\n";
        let fm = parse_yaml_frontmatter(content).unwrap();
        assert_eq!(fm.get("coordinate").and_then(|v| v.as_str()), Some("C0"));
    }

    #[test]
    fn test_parse_yaml_frontmatter_complex() {
        let content = "---\ncoordinate: \"P3\"\nql_position: 3\nfamily: \"P\"\nname: \"Pattern\"\np_3_pattern: \"[[Bimba/Seeds/P/P3|Pattern]]\"\n---\n\n# P3 - Pattern\n\nContent here.\n";
        let fm = parse_yaml_frontmatter(content).unwrap();
        assert_eq!(fm.get("coordinate").and_then(|v| v.as_str()), Some("P3"));
        assert_eq!(fm.get("ql_position").and_then(|v| v.as_u64()), Some(3));
        assert_eq!(fm.get("family").and_then(|v| v.as_str()), Some("P"));
    }
}
