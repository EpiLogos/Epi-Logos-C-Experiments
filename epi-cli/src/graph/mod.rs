use clap::Subcommand;

pub mod alignment_validator;
pub mod api;
pub mod bidirectional_sync;
pub mod client;
pub mod coordinate_array_parser;
pub mod dataset_import;
pub mod embeddings;
pub mod link_enforcement;
pub mod mapper;
pub mod redis_cache;
pub mod relationship_manager;
pub mod retrieval;
pub mod schema;
pub mod seed;
pub mod sync;
pub mod sync_coordinator;
pub mod sync_orchestrator;
pub mod types;

#[derive(Subcommand)]
pub enum GraphCmd {
    /// Initialize schema + seed coordinate space (~96 nodes)
    Init,
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
    /// Import M-branch datasets from docs/datasets/
    Import {
        /// Specific dataset file, or "all" for full import
        #[arg(default_value = "all")]
        dataset: String,
    },
}

/// Parse YAML frontmatter from a markdown file (content between --- delimiters).
pub fn parse_yaml_frontmatter(content: &str) -> Option<serde_yaml::Value> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return None;
    }
    // Find the closing ---
    let after_first = &trimmed[3..];
    let end = after_first.find("\n---")?;
    let yaml_str = &after_first[..end];
    serde_yaml::from_str(yaml_str).ok()
}

fn compose_file_path() -> Result<String, String> {
    // Walk up from the executable or CWD to find the compose file
    let candidates = [
        std::env::var("EPILOGOS_ROOT").ok(),
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent()?.parent()?.parent().map(|p| p.to_string_lossy().into_owned())),
    ];
    for candidate in candidates.iter().flatten() {
        let path = std::path::Path::new(candidate).join("docker-compose.epi-s2.yml");
        if path.exists() {
            return Ok(path.to_string_lossy().into_owned());
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
    Err("docker-compose.epi-s2.yml not found — set EPILOGOS_ROOT env var".into())
}

pub async fn dispatch(cmd: &GraphCmd) -> Result<String, String> {
    match cmd {
        GraphCmd::Init => {
            let config = client::Neo4jConfig::from_env();
            let client = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;
            let schema_result = schema::create_schema(&client).await?;
            let seed_result = seed::seed_coordinate_space(&client).await?;
            Ok(format!("{}\n\n{}", schema_result, seed_result))
        }
        GraphCmd::Status => {
            let neo4j_config = client::Neo4jConfig::from_env();
            let redis_config = redis_cache::RedisConfig::from_env();

            let neo4j_status = match client::Neo4jClient::connect(&neo4j_config) {
                Ok(c) => match c.health_check().await {
                    Ok(true) => "connected".to_string(),
                    _ => "unhealthy".to_string(),
                },
                Err(e) => format!("disconnected ({})", e),
            };

            let redis_status = match redis_cache::RedisCache::connect(&redis_config).await {
                Ok(mut c) => match c.health_check().await {
                    Ok(true) => "connected".to_string(),
                    _ => "unhealthy".to_string(),
                },
                Err(e) => format!("disconnected ({})", e),
            };

            Ok(format!(
                "S2 Status:\n  Neo4j: {} ({})\n  Redis: {} ({})",
                neo4j_status, neo4j_config.uri,
                redis_status, redis_config.uri,
            ))
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

            let depth_val = depth.unwrap_or(1);
            let cypher = format!(
                "MATCH (n:Bimba {{coordinate: '{}'}}) \
                 OPTIONAL MATCH path = (n)-[*1..{}]->(related) \
                 RETURN n.coordinate AS coord, n.name AS name, \
                        n.family AS family, n.ql_position AS ql_position, \
                        count(related) AS related_count",
                coordinate, depth_val
            );
            let rows = neo4j
                .run(&cypher)
                .await
                .map_err(|e| format!("query error: {}", e))?;

            if rows.is_empty() {
                return Err(format!("coordinate '{}' not found in graph", coordinate));
            }

            let row = &rows[0];
            let name = row.get::<String>("name").unwrap_or_else(|_| "?".into());
            let family = row.get::<String>("family").unwrap_or_else(|_| "?".into());
            let related = row.get::<i64>("related_count").unwrap_or(0);

            Ok(format!(
                "Coordinate: {}\n  Name: {}\n  Family: {}\n  Level: {}\n  Depth: {}\n  Related nodes: {}",
                coordinate, name, family, level, depth_val, related
            ))
        }

        GraphCmd::Sync { path } => {
            let vault_path = path.as_deref().unwrap_or(".");

            // Read file
            let content = std::fs::read_to_string(vault_path)
                .map_err(|e| format!("read error: {}", e))?;

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
            Ok(format!("Retrieving {} (nested: {})", coordinate, nested))
        }
        GraphCmd::GraphRAG { query, depth } => Ok(format!(
            "GraphRAG query: '{}' (depth: {})",
            query,
            depth.unwrap_or(3)
        )),
        GraphCmd::Hybrid { query, top_k } => Ok(format!(
            "Hybrid query: '{}' (top_k: {})",
            query,
            top_k.unwrap_or(10)
        )),

        GraphCmd::Import { dataset } => {
            let config = client::Neo4jConfig::from_env();
            let neo4j = client::Neo4jClient::connect(&config)
                .map_err(|e| format!("connect failed: {}", e))?;

            let datasets_dir = std::env::var("EPILOGOS_DATASETS")
                .unwrap_or_else(|_| {
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
            } else if dataset.starts_with("nodes_") {
                let count = importer.import_nodes(dataset).await?;
                Ok(format!("Imported {} nodes from {}", count, dataset))
            } else if dataset.starts_with("relations_") {
                let count = importer.import_relations(dataset).await?;
                Ok(format!("Imported {} relations from {}", count, dataset))
            } else {
                Err(format!("Unknown dataset: {} (expected 'all', 'nodes_*.json', or 'relations_*.json')", dataset))
            }
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
        assert_eq!(
            fm.get("coordinate").and_then(|v| v.as_str()),
            Some("M5")
        );
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
        assert_eq!(
            fm.get("coordinate").and_then(|v| v.as_str()),
            Some("C0")
        );
    }

    #[test]
    fn test_parse_yaml_frontmatter_complex() {
        let content = "---\ncoordinate: \"P3\"\nql_position: 3\nfamily: \"P\"\nname: \"Pattern\"\np_3_pattern: \"[[Bimba/Seeds/P/P3|Pattern]]\"\n---\n\n# P3 - Pattern\n\nContent here.\n";
        let fm = parse_yaml_frontmatter(content).unwrap();
        assert_eq!(
            fm.get("coordinate").and_then(|v| v.as_str()),
            Some("P3")
        );
        assert_eq!(fm.get("ql_position").and_then(|v| v.as_u64()), Some(3));
        assert_eq!(fm.get("family").and_then(|v| v.as_str()), Some("P"));
    }
}
