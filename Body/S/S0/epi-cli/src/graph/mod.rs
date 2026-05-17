use clap::Subcommand;

pub mod alignment_validator;
pub mod api;
pub mod bidirectional_sync;
pub mod client;
pub mod coordinate_array_parser;
pub mod dataset_import;
pub mod dev;
pub mod doctor;
pub mod embeddings;
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
    /// Import Bimba namespace datasets from docs/datasets/
    Import {
        /// "all", "low-detail", "deep", a "*-deep" branch, or a dataset JSON path
        #[arg(default_value = "all")]
        dataset: String,
    },
    /// Augment Parashakti ChakralCenter nodes with body_zones arrays + decan body data (Phase 9)
    #[command(name = "seed-nara")]
    SeedNara,
}

pub use epi_s2_graph_services::{
    fusion_rrf_results, parse_yaml_frontmatter, GraphMethodParams, GraphMethodService,
    GraphNodeRequest, GraphQueryRequest, GraphTraverseDirection, GraphTraverseRequest,
    HybridFusionConfig, RetrievalResult,
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
            meta::write_graph_meta(&client, &meta::desired_meta(schema::SCHEMA_VERSION, 1)).await?;
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
            meta::write_graph_meta(&client, &meta::desired_meta(schema::SCHEMA_VERSION, 1)).await?;
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
            let current_revision = meta::read_graph_meta(&client)
                .await?
                .map(|m| m.graph_revision)
                .unwrap_or_default();
            meta::write_graph_meta(
                &client,
                &meta::desired_meta(schema::SCHEMA_VERSION, current_revision + 1),
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
            let desired_hash = meta::seed_source_hash();
            let current_meta = meta::read_graph_meta(&client).await?;
            let bootstrapped = meta::is_bootstrapped(&client).await?;

            if !bootstrapped {
                let schema_result = schema::create_schema(&client).await?;
                let seed_result = seed::seed_coordinate_space(&client).await?;
                meta::write_graph_meta(&client, &meta::desired_meta(schema::SCHEMA_VERSION, 1))
                    .await?;
                return Ok(format!(
                    "Reconcile bootstrapped empty graph\n\n{}\n\n{}",
                    schema_result, seed_result
                ));
            }

            if current_meta
                .as_ref()
                .map(|meta| {
                    meta.seed_source_hash == desired_hash
                        && meta.schema_version == schema::SCHEMA_VERSION
                        && meta.embedding_version == meta::EMBEDDING_VERSION
                        && meta.q_schema_version == meta::Q_SCHEMA_VERSION
                })
                .unwrap_or(false)
            {
                return Ok("Reconcile: graph already aligned".into());
            }

            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            let current_revision = current_meta.map(|m| m.graph_revision).unwrap_or_default();
            meta::write_graph_meta(
                &client,
                &meta::desired_meta(schema::SCHEMA_VERSION, current_revision + 1),
            )
            .await?;
            let semantic_result = maybe_refresh_semantic_embeddings(&client).await?;
            Ok(format!(
                "Reconcile applied updates\n\n{}\n\n{}",
                schema_result,
                [seed_result, semantic_result]
                    .into_iter()
                    .filter(|item| !item.is_empty())
                    .collect::<Vec<_>>()
                    .join("\n\n")
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

            if dataset == "all" {
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
            }
        }

        GraphCmd::SeedNara => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let chakra_result = seed::seed_parashakti_body_zones(&client).await?;
            let decan_result = seed::seed_decan_body_data(&client).await?;
            Ok(format!("{}\n{}", chakra_result, decan_result))
        }
    }
}

async fn maybe_refresh_semantic_embeddings(client: &client::Neo4jClient) -> Result<String, String> {
    let rows = client
        .run(
            "MATCH (n:Bimba)
             WHERE n.semantic_embedding_version IS NOT NULL
             RETURN count(n) AS c",
        )
        .await
        .map_err(|e| format!("semantic index presence check failed: {}", e))?;
    let indexed_count: i64 = rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();
    if indexed_count == 0 {
        return Ok(String::new());
    }

    let config = match embeddings::EmbeddingConfig::from_env() {
        Ok(config) => config,
        Err(_) => return Ok("Semantic embeddings skipped: GEMINI_API_KEY not set".into()),
    };
    let embedder = embeddings::GeminiEmbeddingClient::new(config);
    let refreshed =
        semantic::refresh_stale_embeddings(client, &embedder, meta::EMBEDDING_VERSION).await?;
    if refreshed.is_empty() {
        Ok("Semantic embeddings already aligned".into())
    } else {
        Ok(format!(
            "Semantic embeddings refreshed for {} nodes: {}",
            refreshed.len(),
            refreshed.join(", ")
        ))
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
